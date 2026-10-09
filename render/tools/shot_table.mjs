// Print the assembled shot table: id, t0, t1, duration, section, and the roto clip / plate image each shot uses.
//   node tools/shot_table.mjs [--json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(ROOT, '..');
const AUDIO = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data/audio.json'))); } catch (e) { return { duration: 212.0 }; } })();
const grid = JSON.parse(fs.readFileSync(path.join(REPO, 'analysis/beatgrid.json')));
const lyr = JSON.parse(fs.readFileSync(path.join(REPO, 'analysis/lyrics_timing.json')));
const { Beats } = await import(path.join(ROOT, 'src/beats.js'));
const { assemble } = await import(path.join(ROOT, 'src/sections/index.js'));
const B = new Beats(grid);
const L = Object.fromEntries(lyr.lines.map((l) => [l.id, l]));
const files = new Set();
for (const d of ['media/keyframes', 'media/keyframes/jade', 'media/chars/identity']) {
  try { for (const f of fs.readdirSync(path.join(REPO, d))) files.add(f.replace(/\.(jpe?g|png|webp)$/i, '')); } catch (e) { /* none */ }
}
const picks = (() => { try { return JSON.parse(fs.readFileSync(path.join(REPO, 'media/gen/picks.json'))); } catch (e) { return {}; } })();
const PICK_KF = { LS1: 'J_LS1', LS2: 'J_LS2', LS3: 'J_LS3' };
const kfMtime = (k) => { for (const d of ['media/keyframes', 'media/keyframes/jade']) for (const e of ['.jpg', '.png']) { try { return fs.statSync(path.join(REPO, d, k + e)).mtimeMs; } catch (er) { /* next */ } } return 0; };
const pick = (k) => { const v = picks[k]; if (!v || !v.take) return null; let m; try { m = fs.statSync(path.join(REPO, 'media/gen', k, 'roto', v.take)).mtimeMs; } catch (e) { return null; }
  if (m + 60000 < kfMtime(PICK_KF[k] || k)) return null; return { take: v.take, lag: v.lag_s ?? 0, clip: `${k}/${v.take}` }; };
const X = { audio: AUDIO, pick, has: (k) => files.has(k) || ['S1', 'S1b', 'S2', 'S3', 'S4', 'goldline', 'gongbi'].includes(k), text: () => '' };
const shots = await assemble(B, X, L);
const src = (s) => { const out = []; const walk = (v) => { if (!v) return; if (Array.isArray(v)) return v.forEach(walk); if (typeof v === 'string') return out.push(v);
  if (v.type === 'roto') out.push(`roto:${v.clip}@${v.offset ?? (v.ref_t0 !== undefined ? 'ref' : 0)}/lock${v.lock ?? 0.5}`); else if (v.name) out.push(v.params && v.params.img ? `${v.name}:${v.params.img}` : v.name); };
  walk(s.scene); if (s.params && s.params.img) out.push(`img:${s.params.img}`); return out.join(' + '); };
if (process.argv.includes('--json')) console.log(JSON.stringify(shots.map((s) => ({ id: s.id, t0: s.t0, t1: s.t1, section: s.section, src: src(s) })), null, 1));
else for (const s of shots) console.log(`${String(s.id).padEnd(8)} ${s.t0.toFixed(2).padStart(7)} ${s.t1.toFixed(2).padStart(7)} ${(s.t1 - s.t0).toFixed(2).padStart(5)}  ${String(s.section || '').padEnd(13)} ${src(s)}`);
