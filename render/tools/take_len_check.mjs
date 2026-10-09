// For every roto layer of every shot: does the take have enough frames for the shot's whole length? (run from render/)
import fs from 'node:fs'; import path from 'node:path';
const ROOT = process.cwd(), REPO = path.resolve(ROOT, '..');
const AUDIO = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/audio.json')));
const grid = JSON.parse(fs.readFileSync(path.join(REPO, 'analysis/beatgrid.json')));
const lyr = JSON.parse(fs.readFileSync(path.join(REPO, 'analysis/lyrics_timing.json')));
const { Beats } = await import(path.join(ROOT, 'src/beats.js'));
const { assemble } = await import(path.join(ROOT, 'src/sections/index.js'));
const B = new Beats(grid), L = Object.fromEntries(lyr.lines.map((l) => [l.id, l]));
const files = new Set();
for (const d of ['media/keyframes', 'media/keyframes/jade', 'media/chars/identity']) for (const f of fs.readdirSync(path.join(REPO, d))) files.add(f.replace(/\.(jpe?g|png|webp)$/i, ''));
const picks = JSON.parse(fs.readFileSync(path.join(REPO, 'media/gen/picks.json')));
const pick = (k) => { const v = picks[k]; if (!v || !v.take) return null; if (!fs.existsSync(path.join(REPO, 'media/gen', k, 'roto', v.take))) return null; return { take: v.take, lag: v.lag_s ?? 0, clip: `${k}/${v.take}` }; };
const X = { audio: AUDIO, pick, has: (k) => files.has(k) || ['S1', 'S1b', 'S2', 'S3', 'S4', 'goldline', 'gongbi'].includes(k), text: () => '' };
const shots = await assemble(B, X, L);
let bad = 0;
for (const s of shots) {
  const layers = []; const walk = (v) => { if (!v) return; if (Array.isArray(v)) return v.forEach(walk); if (v.type === 'roto') layers.push(v); }; walk(s.scene);
  for (const p of layers) {
    const [k, take] = p.clip.split('/'); let meta; try { meta = JSON.parse(fs.readFileSync(path.join(REPO, 'media/gen', k, 'roto', take, 'meta.json'))); } catch (e) { console.log(`${s.id}  ${p.clip}  NO META`); bad++; continue; }
    const n = meta.n ?? meta.frames ?? meta.count, fps = meta.fps || 24, len = n / fps;
    const ct = (t) => { const lt = t - s.t0; return (typeof p.time === 'function' ? p.time(lt) : p.ref_t0 !== undefined ? t - p.ref_t0 : lt * (p.rate || 1) + (p.offset || 0)) + (p.lag || 0); };
    const a = ct(s.t0), b = ct(s.t1 - 1 / 24), lo = Math.min(a, b), hi = Math.max(a, b);
    const over = hi - (len - 1 / fps), under = -lo;
    if (over > 0.001 || under > 0.001) { bad++; console.log(`${s.id.padEnd(8)} ${p.clip.padEnd(26)} take ${len.toFixed(2)} s; shot uses ${a.toFixed(2)} → ${b.toFixed(2)}  ${over > 0 ? 'RUNS OUT by ' + over.toFixed(2) + ' s' : 'starts before 0 by ' + under.toFixed(2)}`); }
  }
}
console.log(bad ? `${bad} layer(s) outside their take` : 'every roto layer stays inside its take');
