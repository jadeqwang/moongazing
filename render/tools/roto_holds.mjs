// How long each drawing of every roto shot is held, in film frames. On twos every hold should be 2; a take played at a
// rate other than 1 used to give 2, 2, 2, 3 or 2, 2, 1 (a stutter). Prints, per roto layer on twos, the holds under the
// old rule and under the engine's rule (src/roto/index.js drawingAt), and lists what is still uneven.
//   node tools/roto_holds.mjs [--all]      (--all: also the layers that are even under both rules)
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
const { drawingAt } = await import(path.join(ROOT, 'src/roto/index.js'));
const B = new Beats(grid), L = Object.fromEntries(lyr.lines.map((l) => [l.id, l]));
const files = new Set();
for (const d of ['media/keyframes', 'media/keyframes/jade', 'media/chars/identity']) { try { for (const f of fs.readdirSync(path.join(REPO, d))) files.add(f.replace(/\.(jpe?g|png|webp)$/i, '')); } catch (e) { /* none */ } }
const picks = (() => { try { return JSON.parse(fs.readFileSync(path.join(REPO, 'media/gen/picks.json'))); } catch (e) { return {}; } })();
const pick = (k) => { const v = picks[k]; if (!v || !v.take) return null; return fs.existsSync(path.join(REPO, 'media/gen', k, 'roto', v.take)) ? { take: v.take, lag: v.lag_s ?? 0, clip: `${k}/${v.take}` } : null; };
const X = { audio: AUDIO, pick, has: (k) => files.has(k) || ['S1', 'S1b', 'S2', 'S3', 'S4', 'goldline', 'gongbi'].includes(k), text: () => '' };
const shots = await assemble(B, X, L);
const FPS = 24, all = process.argv.includes('--all');
const holds = (seq) => { const h = []; let n = 1; for (let i = 1; i <= seq.length; i++) { if (i < seq.length && seq[i] === seq[i - 1]) n++; else { h.push(n); n = 1; } } return h; };
const show = (h) => { const c = {}; for (const x of h.slice(1, -1)) c[x] = (c[x] || 0) + 1; return Object.entries(c).map(([k, v]) => `${v}×${k}`).join(' ') || '-'; };   // first and last hold are cut by the shot
const uneven = (h) => h.slice(1, -1).some((x) => x !== 2);
let bad = 0;
for (const s of shots) {
  const layers = (Array.isArray(s.scene) ? s.scene : [s.scene]).filter((v) => v && v.type === 'roto' && v.twos !== false);
  for (const p of layers) {
    let meta; try { const [shot, take] = p.clip.split('/'); meta = JSON.parse(fs.readFileSync(path.join(REPO, 'media/gen', shot, 'roto', take, 'meta.json'))); } catch (e) { console.log(`${s.id.padEnd(7)} ${p.clip}: no meta.json`); continue; }
    const m = { fps: meta.fps, frames: meta.frames }, f0 = Math.ceil(s.t0 * FPS - 1e-6), f1 = Math.ceil(s.t1 * FPS - 1e-6);
    const oldSeq = [], newSeq = [];
    for (let f = f0; f < f1; f++) { const t = f / FPS, lt = t - s.t0; oldSeq.push(drawingAt(m, p, t, lt, true)); newSeq.push(drawingAt(m, p, t, lt)); }
    const ho = holds(oldSeq), hn = holds(newSeq), end = newSeq[newSeq.length - 1] >= m.frames - 1 && newSeq.filter((x) => x >= m.frames - 1).length > 2;
    if (uneven(hn)) bad++;
    if (all || uneven(ho) || uneven(hn)) console.log(`${s.id.padEnd(7)} ${p.clip.padEnd(28)} ${typeof p.time === 'function' ? 'time()   ' : `rate ${String(p.rate ?? 1).padEnd(4)}`}  old holds: ${show(ho).padEnd(20)} now: ${show(hn).padEnd(14)} ${uneven(hn) ? (end ? 'UNEVEN (the take runs out: its last frame is held)' : 'UNEVEN') : 'even'}`);
  }
}
console.log(bad ? `${bad} roto layer(s) on twos still hold drawings unevenly` : 'every roto layer on twos holds each drawing for two film frames');
