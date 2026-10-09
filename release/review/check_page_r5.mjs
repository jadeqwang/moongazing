// Browser-free checks: syntax, JSON, rendered media paths, and saved answers.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const [pagePath, mediaRoot, flag] = process.argv.slice(2);
const dry = flag === '--dry-run';
const html = fs.readFileSync(pagePath, 'utf8');
assert(!/__([A-Z][A-Z0-9_]*)__/.test(html), 'Unreplaced placeholder');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((x) => x[1]);
assert.equal(scripts.length, 1, 'Expected the single preserved page script');
const script = scripts[0];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r5-page-check-'));
try {
  const js = path.join(tmp, 'inline.js'); fs.writeFileSync(js, script);
  const syntax = spawnSync('node', ['--check', js], { encoding: 'utf8' });
  assert.equal(syntax.status, 0, syntax.stderr);
} finally { fs.rmSync(tmp, { recursive: true }); }

// Parse only the data literals, not arbitrary JavaScript as JSON.
const data = {};
for (const name of ['D', 'R4', 'R5', 'FILM', 'SETTLED', 'SETTLED5']) {
  const match = script.match(new RegExp(`^const ${name} = (.*);$`, 'm'));
  assert(match, `Missing inlined ${name}`);
  data[name] = JSON.parse(match[1]);
}
const review = path.dirname(new URL(import.meta.url).pathname);
const source = JSON.parse(fs.readFileSync(path.join(review, 'cards_r5.json'), 'utf8'));
assert.deepEqual(data.R5, source.cards.map((d) => ({ ...d, clips: (d.clips || []).map((c) => c.slice(0, 3)) })), 'Round-five wording/data changed');
assert.deepEqual(data.FILM.intro, source.film.intro);
assert.deepEqual(data.FILM.parts, source.film.parts);
assert.deepEqual(data.SETTLED5, source.settled);
const round4 = JSON.parse(fs.readFileSync(path.join(review, 'cards_r4.json'), 'utf8'));
assert.deepEqual(data.R4, round4.cards.map((d) => ({ ...d, clips: (d.clips || []).map((c) => c.slice(0, 3)) })));
assert.deepEqual(data.D, JSON.parse(fs.readFileSync(path.join(review, 'cards_r3.json'), 'utf8')));
assert.deepEqual(data.SETTLED, round4.settled);
assert(/<summary>Earlier rounds \(answered\)<\/summary>/.test(html));
assert(!/<details[^>]*\bopen\b/.test(html), 'Earlier rounds must start closed');

// A small DOM double executes the actual renderer and answer code. It does not
// replace visual/browser QA; it catches missing selectors, paths and data drift.
const nodes = [];
class Element {
  constructor(tag) { this.tagName = tag; this.attrs = {}; this.childNodes = []; this.style = {}; this.listeners = {}; this.value = ''; this.checked = false; nodes.push(this); }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'value') this.value = v; }
  getAttribute(k) { return this.attrs[k]; }
  set id(v) { this.attrs.id = v; } get id() { return this.attrs.id; }
  set className(v) { this.attrs.class = v; } get className() { return this.attrs.class || ''; }
  get classList() {
    const set = (c, on) => { const a = new Set(this.className.split(/\s+/).filter(Boolean)); if (on) a.add(c); else a.delete(c); this.className = [...a].join(' '); };
    return { add: (c) => set(c, true), contains: (c) => this.className.split(/\s+/).includes(c), toggle: (c, on) => { set(c, on); return on; } };
  }
  append(...kids) { for (const kid of kids) { this.childNodes.push(kid); if (kid instanceof Element) kid.parentElement = this; } }
  remove() { if (this.parentElement) this.parentElement.childNodes = this.parentElement.childNodes.filter((x) => x !== this); this.removed = true; }
  set textContent(v) { this.childNodes = [String(v)]; } get textContent() { return this.childNodes.map((x) => x instanceof Element ? x.textContent : x).join(''); }
  set innerHTML(v) { this.rawHTML = v; this.childNodes = [String(v)]; }
  closest(selector) { for (let x = this; x; x = x.parentElement) if (selector[0] === '.' && x.classList.contains(selector.slice(1))) return x; return null; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  querySelector(selector) { return document.querySelector(selector); }
}
const markup = html.slice(0, html.indexOf('<script>'));
for (const id of markup.matchAll(/\bid="([^"]+)"/g)) { const e = new Element('container'); e.id = id[1]; }
const document = {
  activeElement: null,
  createElement: (tag) => new Element(tag),
  querySelector: (selector) => selector.startsWith('#') ? nodes.find((n) => n.id === selector.slice(1)) : null,
  querySelectorAll: (selector) => {
    const m = selector.match(/^input\[name="([^"]+)"\](:checked)?$/);
    assert(m, `Unhandled selector ${selector}`);
    return nodes.filter((n) => n.tagName === 'input' && n.attrs.name === m[1] && (!m[2] || n.checked));
  },
};
const all = [...data.R5, ...data.R4, ...data.D];
assert.equal(new Set(all.map((d) => d.id)).size, all.length, 'Duplicate document/card id');
const writes = [];
const mockDB = {
  doc: (id) => ({ set: async (value) => writes.push({ id, value }) }),
  collection: (name) => {
    assert.equal(name, 'decisions');
    return { onSnapshot: (callback) => callback({ docs: all.map((d) => ({ id: d.id, data: () => ({ choice: d.multi ? [d.opts?.[0]?.[0]].filter(Boolean) : (d.opts?.[0]?.[0] || ''), note: `Saved answer for ${d.id}` }) })) }) };
  },
};
const context = vm.createContext({ document, window: { claude: { use: async (name) => { assert.equal(name, 'db'); return mockDB; } } }, localStorage: { getItem: () => null, setItem: () => {} }, setTimeout, clearTimeout, console });
await vm.runInContext(script, context);
for (const d of all) {
  assert.equal(document.querySelector(`#n-${d.id}`).value, `Saved answer for ${d.id}`, `Saved note not restored: ${d.id}`);
  if (d.opts) assert(document.querySelector(`#o-${d.id}-${d.opts[0][0]}`).checked, `Saved choice not restored: ${d.id}`);
}
assert.equal(document.querySelector('#count').textContent, `${data.R5.length} / ${data.R5.length}`);
for (const [index, d] of data.R5.entries()) {
  const picked = d.opts.at(-1)[0];
  for (const input of document.querySelectorAll(`input[name="o-${d.id}"]`)) input.checked = input.value === picked;
  document.querySelector(`#n-${d.id}`).value = 'Updated review note';
  await vm.runInContext(`collect(R5[${index}]); save(R5[${index}]);`, context);
  const saved = writes.at(-1);
  assert.equal(saved.id, `decisions/${d.id}`);
  assert.equal(JSON.stringify(saved.value.choice), JSON.stringify(d.multi ? [picked] : picked));
  assert.equal(saved.value.note, 'Updated review note');
  assert.equal(saved.value.title, d.title); assert.equal(saved.value.when, d.when);
}
// Verify older documents can still be changed without affecting the new count.
const older = data.R4[0]; document.querySelector(`#n-${older.id}`).value = 'Earlier-round note';
await vm.runInContext('collect(R4[0]); save(R4[0]);', context);
assert.equal(writes.at(-1).id, `decisions/${older.id}`);
assert.equal(document.querySelector('#count').textContent, `${data.R5.length} / ${data.R5.length}`);

const published = ['clips7/', 'img7/', 'clips6/', 'img6/', 'clips5/', 'img/', 'clips/', 'lyric/'];
const refs = new Set();
for (const node of nodes) for (const attr of ['src', 'poster']) if (node.attrs[attr]) refs.add(node.attrs[attr].split('#')[0]);
// Include any static media in the preserved earlier-round markup, too.
for (const m of markup.matchAll(/\b(?:src|poster)="([^"]+)"/g)) refs.add(m[1].split('#')[0]);
for (const ref of refs) {
  assert(!ref.includes('..') && !path.isAbsolute(ref), `Unsafe media path ${ref}`);
  if (published.some((prefix) => ref.startsWith(prefix))) continue;
  assert(ref.startsWith('clips8/') || ref.startsWith('img8/') || ref.startsWith('lyric8/'), `Unexpected media path ${ref}`);
  if (!dry) assert(fs.existsSync(path.join(mediaRoot, ref)) && fs.statSync(path.join(mediaRoot, ref)).size > 0, `Missing media ${ref}`);
}
const expected = data.FILM.parts.length + (data.FILM.full ? 1 : 0);
const filmShelf = document.querySelector('#film-shelf'); assert.equal(filmShelf.childNodes.length, expected);
if (data.FILM.full) assert.equal(filmShelf.childNodes[0].childNodes[0].attrs.src, 'clips8/film_full.mp4');
console.log(`PAGE_CHECK_OK: ${data.R5.length} new cards; ${data.R4.length + data.D.length} earlier answers restored; ${expected} film players; ${refs.size} media paths; inline JSON/syntax and database writes passed${dry ? ' (planned media, dry run)' : ''}.`);
