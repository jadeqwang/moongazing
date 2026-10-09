// Measures how every piece of type arrives and leaves, frame by frame, and flags what a viewer reads as a glitch.
//   node tools/type_reveal_check.mjs [--from 0 --to 221.04] [--scale 0.5] [--workers 2] [--out out/type_reveal_check.json]
//                                    [--only en,zh,card,calli] [--plot out/type_reveal_curves]   (plots need ../.venv python)
// How: the type helpers in src/sections/_lib.js draw through typeLayer(). When window.__typeProbe is an array, each
// helper also draws its type alone on a scratch canvas and records the revealed ink (summed alpha) in total and per
// unit: a word of an English lyric, a character of a Chinese one, a run of a card. This script renders every frame of
// the range, collects the curves and checks each unit:
//   EARLY     ink in the unit's box before the unit's own time (the top of a tall letter under the line above, the first
//             stroke of the next character). Limit: 2% of the unit's ink; 0.3% for the first word of a line
//   POP IN    more than POP of the unit's ink arrives in one frame, away from a cut
//   POP OUT   the same, leaving
//   FAST      the rise from 5% to 95% takes fewer than FAST frames, away from a cut
//   UNEVEN    the curve goes down while arriving, or up while leaving, or dips and comes back while held
// A unit that is whole on the first frame of a shot is "there at the cut" and is not a fault. Exit code 1 if anything
// is flagged. The numbers are device px of ink at the render scale, so compare runs made at the same --scale.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { CHROME_ARGS } from './chrome_args.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) { if (!argv[i].startsWith('--')) continue; const k = argv[i].slice(2); args[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; }
const FPS = 24, scale = Number(args.scale || 0.5), NW = Math.min(4, Number(args.workers || 2));
const AUDIO = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data/audio.json'))); } catch (e) { return { duration: 212 }; } })();
const FROM = Number(args.from || 0), TO = Number(args.to || Math.max(221.04, 0));
const OUT = path.resolve(ROOT, args.out || 'out/type_reveal_check.json');
const ONLY = args.only ? new Set(String(args.only).split(',')) : null;
const CHROME = process.env.CHROME || args.chrome || '/opt/google/chrome/chrome';
// thresholds (fractions of a unit's fullest ink)
const POP = 0.34, EARLY = 0.02, EARLY_PX = 1.5, FAST = 5, WOBBLE = 0.04;

const i0 = Math.ceil(FROM * FPS - 1e-6), i1 = Math.ceil(TO * FPS - 1e-6);
const frames = []; for (let i = i0; i < i1; i++) frames.push(i);
const port = 8960 + (process.pid % 30);
const server = await serve(port);
const browsers = [];
const series = new Map();   // "key" -> { kind, end, total: Map(frame -> ink), units: Map(id -> { on: Map(frame -> s), ink: Map(frame -> ink) }) }
let shots = [];
const failed = [];   // frames that could not be rendered
try {
  for (let j = 0; j < NW; j++) browsers.push(await chromium.launch({ executablePath: CHROME, args: CHROME_ARGS }));
  const pages = await Promise.all(browsers.map(async (b) => {
    const page = await b.newPage({ viewport: { width: Math.round(1920 * scale), height: Math.round(1080 * scale) }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    await page.goto(`http://127.0.0.1:${port}/index.html?scale=${scale}`);
    await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
    const err = await page.evaluate(async () => { try { await window.__ready; return null; } catch (e) { return window.__error || String(e); } });
    if (err) throw new Error(err);
    return page;
  }));
  shots = await pages[0].evaluate(() => window.__shots);
  let next = 0, done = 0; const T0 = Date.now();
  await Promise.all(pages.map(async (page) => {
    for (;;) {
      const k = next++; if (k >= frames.length) return;
      const f = frames[k];
      // a frame can fail while someone is rewriting an asset it needs (EncodingError): try again, then give up on it
      let recs = null;
      for (let tries = 0; tries < 4 && !recs; tries++) {
        try { recs = await page.evaluate(async (t) => { window.__typeProbe = []; await window.renderAt(t); const r = window.__typeProbe; window.__typeProbe = null; return r; }, f / FPS); }
        catch (e) { if (tries === 3) { failed.push(f); console.error(`\nframe ${f} failed: ${String(e.message).split('\n')[0]}`); } else await new Promise((r) => setTimeout(r, 1500)); }
      }
      if (!recs) { done++; continue; }
      for (const r of recs) {
        if (ONLY && !ONLY.has(r.kind)) continue;
        if (!series.has(r.key)) series.set(r.key, { kind: r.kind, end: r.end, total: new Map(), units: new Map() });
        const s = series.get(r.key);
        s.total.set(f, (s.total.get(f) || 0) + r.total);   // a helper called twice in a frame (same key) adds up
        for (const u of r.units) { if (!s.units.has(u.id)) s.units.set(u.id, { on: new Map(), ink: new Map() }); const U = s.units.get(u.id); U.ink.set(f, (U.ink.get(f) || 0) + u.ink); U.on.set(f, u.on); }
        if (r.bbox) { const b = s.bbox || (s.bbox = [1e9, 1e9, -1e9, -1e9]); b[0] = Math.min(b[0], r.bbox[0]); b[1] = Math.min(b[1], r.bbox[1]); b[2] = Math.max(b[2], r.bbox[2]); b[3] = Math.max(b[3], r.bbox[3]); }
      }
      if (++done % 200 === 0) process.stderr.write(`\r${done}/${frames.length}  ${((Date.now() - T0) / done / 1000).toFixed(2)} s/frame   `);
    }
  }));
  process.stderr.write('\n');
} finally { for (const b of browsers) await b.close().catch(() => {}); server.close(); }

// ---- analysis --------------------------------------------------------------------------------------------------
const cutFrames = new Set(shots.map((s) => Math.ceil(s.t0 * FPS - 1e-6)));
const shotOf = (f) => { let id = shots[0].id; for (const s of shots) if (f >= Math.ceil(s.t0 * FPS - 1e-6)) id = s.id; return id; };
const tc = (f) => `${Math.floor(f / FPS / 60)}:${(f / FPS % 60).toFixed(2).padStart(5, '0')}`;
// on: Map(frame -> the time the unit may first show, as the helper saw it in that frame's shot; -1e9 = there at the cut)
function check(ink, on, label, kind) {
  // ink: Map(frame -> ink). The series runs over every frame from the first to the last the helper drew; gaps are 0.
  const fs_ = [...ink.keys()].sort((a, b) => a - b); if (!fs_.length) return null;
  // gaps are 0, except a frame that failed to render: it repeats the frame before it (and is reported at the end)
  const a = fs_[0], b = fs_[fs_.length - 1], v = []; for (let f = a; f <= b; f++) v.push(ink.has(f) ? ink.get(f) : failed.includes(f) && v.length ? v[v.length - 1] : 0);
  const max = Math.max(...v); if (max < 4) return null;
  const flags = [], n = v.length, at = (i) => (i < 0 || i >= n ? 0 : v[i]);
  // EARLY
  if (on !== undefined) {
    // the first word of a typographic line has nothing legitimate in its box before its time (no neighbour's overhang),
    // so it is held to a far stricter limit: this is what catches the top of an h showing under the line above
    const strict = (kind === 'en' || kind === 'card') && /^\d+\.0 /.test(label);
    const lim = strict ? Math.max(0.003 * max, 1.0) : Math.max(EARLY * max, EARLY_PX); let worst = 0, first = null, last = null;
    // (a travelling brush's time at a character is an estimate: one frame of slack for 'calli')
    for (let i = 0; i < n; i++) { const f = a + i; if (on.has(f) && f / FPS < on.get(f) - (kind === 'calli' ? 1.5 : 0.5) / FPS && v[i] > lim) { worst = Math.max(worst, v[i]); first = first ?? f; last = f; } }
    if (first !== null) flags.push({ flag: 'EARLY', from: tc(first), to: tc(last), frames: last - first + 1, ink: +(worst / max).toFixed(3) });
  }
  // POP IN / OUT (i = -1 … n: the frame before the first and the frame after the last count as 0). A character of a
  // card's calligraphy is passed by one travelling brush, quickly by design: for those only the whole block is judged.
  // A comma is one dab: it is judged for EARLY only.
  const brush = (kind === 'calli' && on !== undefined) || /[，。、；：！？,.·]$/.test(label);
  for (let i = 0; i <= n && !brush; i++) {
    const d = (at(i) - at(i - 1)) / max, f = a + i;
    if (d > POP && !cutFrames.has(f)) flags.push({ flag: 'POP IN', at: tc(f), step: +d.toFixed(2) });
    if (d < -POP && !cutFrames.has(f)) flags.push({ flag: 'POP OUT', at: tc(f), step: +d.toFixed(2) });
  }
  // rise time 5% → 95%
  const iUp5 = v.findIndex((x) => x >= 0.05 * max), iUp95 = v.findIndex((x) => x >= 0.95 * max);
  // at a cut: it is there (≥ 5%) on the first frame of a shot having been absent on the frame before, or a cut falls inside the rise
  const rise = iUp95 - iUp5, atCut = (cutFrames.has(a + iUp5) && at(iUp5 - 1) < 0.05 * max) || [...cutFrames].some((c) => c > a + iUp5 && c <= a + iUp95);
  if (rise < FAST && !atCut && !brush) flags.push({ flag: 'FAST', rise_frames: rise, at: tc(a + iUp5) });
  // UNEVEN: up to the first frame at ≥ 98% it must not fall; after the last frame at ≥ 98% it must not rise; no dip between
  let iTop0 = v.findIndex((x) => x >= 0.98 * max), iTop1 = n - 1; while (v[iTop1] < 0.98 * max) iTop1--;
  let worst = 0, where = null;
  for (let i = 1; i < n; i++) {
    const d = (v[i] - v[i - 1]) / max; if (cutFrames.has(a + i)) continue;
    const bad = i <= iTop0 ? -d : i > iTop1 ? d : 0;
    if (bad > worst) { worst = bad; where = a + i; }
  }
  let lo = 1; for (let i = iTop0; i <= iTop1; i++) lo = Math.min(lo, v[i] / max);
  if (worst > WOBBLE) flags.push({ flag: 'UNEVEN', at: tc(where), back: +worst.toFixed(3) });
  if (1 - lo > 0.12) flags.push({ flag: 'UNEVEN', held_dip: +(1 - lo).toFixed(2) });
  return { label, first: tc(a), last: tc(b), shot: shotOf(a + Math.max(0, iUp5)), max: +max.toFixed(1), rise_frames: rise, there_at_cut: iUp5 === 0 && cutFrames.has(a) && v[0] > 0.9 * max,
    fall_frames: (() => { let j = n - 1; while (j > 0 && v[j] < 0.05 * max) j--; let k = j; while (k > 0 && v[k] < 0.95 * max) k--; return j - k; })(), flags, a, v: v.map((x) => +(x / max).toFixed(3)) };
}
const report = { range: [FROM, TO], scale, thresholds: { POP, EARLY, FAST, WOBBLE }, cuts: [...cutFrames], items: [] };
let nflag = 0;
for (const [key, s] of [...series.entries()].sort((x, y) => Math.min(...x[1].total.keys()) - Math.min(...y[1].total.keys()))) {
  const item = { key, kind: s.kind, bbox: s.bbox, whole: check(s.total, undefined, 'whole', s.kind), units: [] };   // bbox: design px, where its ink was
  for (const [id, u] of s.units) { const c = check(u.ink, u.on, id, s.kind); if (c) { const ons = [...u.on.values()].filter((x) => Math.abs(x) < 1e8); c.on = ons.length ? +Math.min(...ons).toFixed(3) : null; item.units.push(c); } }
  if (!item.whole) continue;
  report.items.push(item);
  const lines = [];
  for (const c of [item.whole, ...item.units]) for (const fl of c.flags) { nflag++; lines.push(`    ${c.label.padEnd(16)} ${JSON.stringify(fl)}`); }
  console.log(`${item.whole.first}  ${item.whole.shot.padEnd(6)} ${s.kind.padEnd(5)} ${key.padEnd(34)} rise ${String(item.whole.rise_frames).padStart(3)} f  fall ${String(item.whole.fall_frames).padStart(3)} f  ${item.whole.there_at_cut ? 'there at the cut  ' : ''}${lines.length ? `${lines.length} FLAG(S)` : 'ok'}`);
  if (lines.length) console.log(lines.join('\n'));
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report));
console.log(`\n${report.items.length} pieces of type, ${nflag} flag(s)  ->  ${path.relative(ROOT, OUT)}`);
if (failed.length) console.log(`${failed.length} frame(s) FAILED to render (their type is taken from the frame before): ${failed.join(', ')}`);
if (args.plot) {
  // one small chart per piece: the whole curve (black) and each unit (colour), a tick at each unit's own time
  const py = path.resolve(ROOT, '../.venv/bin/python');
  const code = `
import json, sys, os
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
R = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
items = R['items']; per = 12
for p in range(0, len(items), per):
    fig, axs = plt.subplots(4, 3, figsize=(18, 13)); axs = axs.ravel()
    for ax, it in zip(axs, items[p:p + per]):
        w = it['whole']; x = [(w['a'] + i) / 24 for i in range(len(w['v']))]
        for u in it['units']:
            ux = [(u['a'] + i) / 24 for i in range(len(u['v']))]; l, = ax.plot(ux, u['v'], lw=1, marker='.', ms=2.5, label=u['label'][:14])
            if u['on'] is not None: ax.axvline(u['on'], color=l.get_color(), lw=0.5, ls=':')
        ax.plot(x, w['v'], color='k', lw=1.6, marker='.', ms=3)
        nf = len(w['flags']) + sum(len(u['flags']) for u in it['units'])
        ax.set_title(f"{w['first']} {w['shot']} {it['kind']} {it['key'][:30]}" + (f"  [{nf} flags]" if nf else ''), fontsize=9, color='crimson' if nf else 'k')
        ax.set_ylim(-0.03, 1.05); ax.tick_params(labelsize=7)
        if len(it['units']) <= 10: ax.legend(fontsize=6, loc='lower right')
    for ax in axs[len(items[p:p + per]):]: ax.axis('off')
    fig.tight_layout(); fig.savefig(os.path.join(out, f"curves_{p // per:02d}.png"), dpi=70); plt.close(fig)
`;
  const r = spawnSync(py, ['-c', code, OUT, path.resolve(ROOT, args.plot)], { stdio: 'inherit' });
  if (r.status) console.error('plotting failed');
}
process.exit(nflag || failed.length ? 1 : 0);
