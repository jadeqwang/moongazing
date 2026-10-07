// A painted keyframe that sings: the still (with parallax and an optional g-load vibration) and ONLY the mouth drawn
// from the vocal stem (roto/mouth.js, data/mouth.json) at song time — sparse and light, no redrawn face.
//   params: { img, from, to, par, dolly, masks, shake (design px), mouth: { cL, cR, up } (image uv), erase: [rx, ry]
//             (image uv radii of the painted mouth to wash out), eraseAt (uv to sample the skin/face ground from),
//             style (drawMouthPts options), lead (s) }
import { plate, plateMap } from './plate.js';
import { loadMouthTrack, mouthAt, drawMouthPts } from '../roto/mouth.js';
import { makeCanvas } from '../util.js';

const ground = new Map();
function sampleColor(img, uv) {
  const k = img.src || img; if (ground.has(k)) return ground.get(k);
  const c = makeCanvas(9, 9); const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, uv[0] * img.width - 12, uv[1] * img.height - 12, 24, 24, 0, 0, 9, 9);
  const d = g.getImageData(0, 0, 9, 9).data; let r = 0, gg = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4, col = [Math.round(r / n), Math.round(gg / n), Math.round(b / n)];
  ground.set(k, col); return col;
}

export const singer = {
  async draw(ctx, shot, t, lt) {
    const p = shot.params;
    const img = ctx.assets[p.img]; if (!img) return;
    // g-load vibration: a fine deterministic tremor of the camera
    const k = Math.floor(t * 24), sh = p.shake || 0;
    const jx = (Math.sin(k * 12.9898) * 43758.5453 % 1) * sh / 1920, jy = (Math.sin(k * 78.233) * 12543.1 % 1) * sh / 1080;
    const P = { ...p, from: { ...p.from, x: p.from.x + jx, y: p.from.y + jy }, to: { ...(p.to || p.from), x: (p.to || p.from).x + jx, y: (p.to || p.from).y + jy } };
    plate.draw(ctx, { ...shot, params: P }, t, lt);
    if (!p.mouth) return;
    const M = plateMap(P, lt, shot.t1 - shot.t0, img);
    const MT = await loadMouthTrack();
    const [open, round] = mouthAt(MT, t + (p.lead || 0));
    const cL = M.at(p.mouth.cL), cR = M.at(p.mouth.cR), up = M.at(p.mouth.up);
    const col = sampleColor(img, p.eraseAt || [(p.mouth.cL[0] + p.mouth.cR[0]) / 2, p.mouth.cL[1] + 0.05]);
    ctx.pipe.layer((g) => {
      if (p.erase) { // wash the painted lips back into the face ground, softly
        const [rx, ry] = [p.erase[0] * M.a[0], p.erase[1] * M.a[1]];
        g.save(); g.filter = `blur(${Math.max(2, ry * 0.35).toFixed(1)}px)`; g.fillStyle = `rgb(${col.join(',')})`;
        g.beginPath(); g.ellipse((cL[0] + cR[0]) / 2, (cL[1] + cR[1]) / 2 + ry * 0.1, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
      drawMouthPts(g, cL, cR, up, open, round, p.style || {});
    }, { mode: 'over', seed: 62 });
  },
};
