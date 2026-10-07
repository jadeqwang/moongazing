// Lint the shot table (Node, no browser):
//   node tools/lint_shots.mjs [--all-assets]
// Checks: every section's shots stay inside its declared range; the film is covered 0 → 212.0 s with no gaps and no
// overlaps; every cut lands within ±1 frame (1/24 s) of a beat, a downbeat, a listed accent (sections/_lib.js) or a
// lyric line/word onset (analysis/lyrics_timing.json) — shots flagged grid:'half' may also cut on half-beats;
// every scene name exists. Keyframe availability is read from media/ (missing ones are fine: they render as
// placeholder cards), or assumed present with --all-assets.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(ROOT, '..');
const FPS = 24, TOL = 1 / FPS + 1e-6;
const AUDIO = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data/audio.json'))); } catch (e) { return { duration: 212.0 }; } })();
const grid = JSON.parse(fs.readFileSync(path.join(REPO, 'analysis/beatgrid.json')));
const lyr = JSON.parse(fs.readFileSync(path.join(REPO, 'analysis/lyrics_timing.json')));
const { Beats } = await import(path.join(ROOT, 'src/beats.js'));
const { SECTIONS, assemble } = await import(path.join(ROOT, 'src/sections/index.js'));
const { ACCENTS } = await import(path.join(ROOT, 'src/sections/_lib.js'));
const B = new Beats(grid);
const L = Object.fromEntries(lyr.lines.map((l) => [l.id, l]));
const files = new Set();
for (const d of ['media/keyframes', 'media/keyframes/jade', 'media/chars/identity']) {
  try { for (const f of fs.readdirSync(path.join(REPO, d))) files.add(f.replace(/\.(jpe?g|png|webp)$/i, '')); } catch (e) { /* none */ }
}
const all = process.argv.includes('--all-assets');
const picks = (() => { try { return JSON.parse(fs.readFileSync(path.join(REPO, 'media/gen/picks.json'))); } catch (e) { return {}; } })();
const PICK_KF = { LS1: 'J_LS1', LS2: 'J_LS2', LS3: 'J_LS3' };
const kfMtime = (k) => { for (const d of ['media/keyframes', 'media/keyframes/jade']) for (const e of ['.jpg', '.png']) { try { return fs.statSync(path.join(REPO, d, k + e)).mtimeMs; } catch (er) { /* next */ } } return 0; };
const pick = (k) => { const v = picks[k]; if (!v || !v.take) return null; let m; try { m = fs.statSync(path.join(REPO, 'media/gen', k, 'roto', v.take)).mtimeMs; } catch (e) { return null; }
  if (m + 60000 < kfMtime(PICK_KF[k] || k)) return null; return { take: v.take, lag: v.lag_s ?? 0, clip: `${k}/${v.take}` }; };
const X = { audio: AUDIO, pick, has: (k) => all || files.has(k) || ['S1', 'S1b', 'S2', 'S3', 'S4', 'goldline', 'gongbi'].includes(k), text: (k) => { try { return fs.readFileSync(path.join(REPO, 'media/keyframes', k + '.txt'), 'utf8'); } catch (e) { return ''; } } };
const scenesSrc = fs.readFileSync(path.join(ROOT, 'src/shots.js'), 'utf8');
const sceneNames = new Set(/export const SCENES = \{([^}]*)\}/s.exec(scenesSrc)[1].split(',').map((s) => s.trim()).filter(Boolean));

const events = [...grid.beats.map((b) => b.t), ...grid.downbeats.map((d) => d.t), ...ACCENTS];
for (const l of lyr.lines) { events.push(l.start); for (const w of l.words) events.push(w.start); }
const half = []; for (let i = 0; i + 1 < grid.beats.length; i++) half.push((grid.beats[i].t + grid.beats[i + 1].t) / 2);
const near = (t, list) => list.reduce((m, e) => Math.min(m, Math.abs(e - t)), 1e9);

const errors = [], warns = [];
const shots = assemble(B, X, L);
const lastMod = SECTIONS[SECTIONS.length - 1][1];
const END = typeof lastMod.range === 'function' ? lastMod.range(X)[1] : lastMod.range[1];
// sections stay in their ranges
for (const [name, mod] of SECTIONS) {
  const [a, b] = typeof mod.range === 'function' ? mod.range(X) : mod.range;
  for (const s of mod.default(B, X, L)) if (s.t0 < a - TOL || s.t1 > b + TOL) errors.push(`${name}: shot ${s.id} [${s.t0.toFixed(3)}, ${s.t1.toFixed(3)}] outside section range [${a}, ${b}]`);
}
// coverage
if (Math.abs(shots[0].t0) > 1e-6) errors.push(`film starts at ${shots[0].t0}, not 0`);
if (Math.abs(shots[shots.length - 1].t1 - END) > 1e-6) errors.push(`film ends at ${shots[shots.length - 1].t1}, not ${END}`);
const ids = new Set();
shots.forEach((s, i) => {
  if (ids.has(s.id)) errors.push(`duplicate shot id ${s.id}`); ids.add(s.id);
  if (!(s.t1 > s.t0)) errors.push(`${s.id}: empty or negative duration`);
  if (s.t1 - s.t0 < 2 / FPS) warns.push(`${s.id}: only ${((s.t1 - s.t0) * FPS).toFixed(1)} frames`);
  const n = shots[i + 1];
  if (n) {
    const d = n.t0 - s.t1;
    if (d > 1e-6) errors.push(`GAP ${d.toFixed(3)} s between ${s.id} and ${n.id} (${s.t1.toFixed(3)} → ${n.t0.toFixed(3)})`);
    if (d < -1e-6) errors.push(`OVERLAP ${(-d).toFixed(3)} s between ${s.id} and ${n.id}`);
  }
  // cut on a musical event
  if (s.t0 > 1e-6) {
    const dist = near(s.t0, events), distH = s.grid === 'half' ? near(s.t0, half) : 1e9;
    if (Math.min(dist, distH) > TOL) errors.push(`${s.id}: cut at ${s.t0.toFixed(3)} is ${(dist * 1000).toFixed(0)} ms from the nearest beat/accent/lyric onset`);
  }
  const layers = Array.isArray(s.scene) ? s.scene : [s.scene];
  for (const Lr of layers) { if (!Lr) continue; const nm = typeof Lr === 'string' ? Lr : (Lr.name || Lr.type); if (!sceneNames.has(nm)) errors.push(`${s.id}: unknown scene '${nm}'`); }
  if (!['xuan', 'silk', 'silknight', 'indigo', 'rubbing'].includes(s.paper)) errors.push(`${s.id}: unknown paper '${s.paper}'`);
});
const ph = shots.filter((s) => (Array.isArray(s.scene) ? s.scene : [s.scene]).some((x) => x && x.name === 'placeholder'));
console.log(`audio ${AUDIO.file || 'inputs/moongazing.mp3'} (${AUDIO.duration} s); ${shots.length} shots, ${SECTIONS.length} sections, 0 → ${shots[shots.length - 1].t1} s; ${ph.length} placeholder shots: ${ph.map((s) => s.id).join(' ')}`);
for (const w of warns) console.log('warn  ' + w);
for (const e of errors) console.log('ERROR ' + e);
if (errors.length) { console.log(`${errors.length} error(s)`); process.exit(1); }
console.log('OK');
