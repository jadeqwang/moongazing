// Silk ribbons (飘带) rising — gongbi: even "iron-wire" ink outline (铁线描), flat mineral washes, the back face paler.
// Stand-in for Chang'e's ascent (0.3) and Mei on wires (1.3) until the generated figure plates exist.
//   params: { ribbons: [{ a:[x,y], b:[x,y], c1, c2, w, amp, k, speed, phase, front, back }], rise (px/s), t0 }
import { clamp } from '../util.js';

function ribbonPts(R, t) {
  const pts = [];
  const N = 140;
  const [ax, ay] = R.a, [bx, by] = R.b, [c1x, c1y] = R.c1, [c2x, c2y] = R.c2;
  for (let i = 0; i <= N; i++) {
    const s = i / N, m = 1 - s;
    const x = m * m * m * ax + 3 * m * m * s * c1x + 3 * m * s * s * c2x + s * s * s * bx;
    const y = m * m * m * ay + 3 * m * m * s * c1y + 3 * m * s * s * c2y + s * s * s * by;
    pts.push({ x, y, s });
  }
  // normals + travelling wave (amplitude grows toward the free end) + twist
  const out = [];
  for (let i = 0; i <= N; i++) {
    const p = pts[i], q = pts[Math.min(N, i + 1)], o = pts[Math.max(0, i - 1)];
    let tx = q.x - o.x, ty = q.y - o.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const nx = -ty, ny = tx;
    const s = p.s;
    const env = 0.25 + 0.75 * s;
    const wave = Math.sin((s * R.k - t * R.speed) * Math.PI * 2 + R.phase) * R.amp * env
      + Math.sin((s * R.k * 2.3 - t * R.speed * 1.7) * Math.PI * 2 + R.phase * 2) * R.amp * 0.25 * env;
    const cx = p.x + nx * wave, cy = p.y + ny * wave;
    const tw = Math.cos((s * R.twist - t * R.speed * 0.6) * Math.PI + R.phase);
    const taper = Math.min(1, s * 12) * (1 - Math.pow(s, 6) * 0.6);
    const w = R.w * taper * (0.18 + 0.82 * Math.abs(tw));
    out.push({ x: cx, y: cy, nx, ny, w, face: tw >= 0 ? 1 : -1 });
  }
  return out;
}

export function drawRibbon(g, R, t, { ink = 'rgba(28,24,22,0.78)', lineW = 1.0, reveal = 1 } = {}) {
  const P = ribbonPts(R, t);
  const n = Math.max(2, Math.round(P.length * clamp(reveal)));
  const L = [], Rr = [];
  for (let i = 0; i < n; i++) { const p = P[i]; L.push([p.x + p.nx * p.w / 2, p.y + p.ny * p.w / 2]); Rr.push([p.x - p.nx * p.w / 2, p.y - p.ny * p.w / 2]); }
  // faces
  for (let i = 1; i < n; i++) {
    g.fillStyle = P[i].face > 0 ? R.front : R.back;
    g.beginPath(); g.moveTo(...L[i - 1]); g.lineTo(...L[i]); g.lineTo(...Rr[i]); g.lineTo(...Rr[i - 1]); g.closePath(); g.fill();
  }
  // subtle fold shading where the ribbon turns (narrow = edge-on)
  for (let i = 1; i < n; i++) {
    const narrow = 1 - P[i].w / (R.w + 1e-3);
    if (narrow < 0.55) continue;
    g.fillStyle = `rgba(40,30,25,${((narrow - 0.55) * 0.35).toFixed(3)})`;
    g.beginPath(); g.moveTo(...L[i - 1]); g.lineTo(...L[i]); g.lineTo(...Rr[i]); g.lineTo(...Rr[i - 1]); g.closePath(); g.fill();
  }
  // iron-wire outline
  g.strokeStyle = ink; g.lineWidth = lineW; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); L.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke();
  g.beginPath(); Rr.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke();
  // end cap
  g.beginPath(); g.moveTo(...L[n - 1]); g.lineTo(...Rr[n - 1]); g.stroke();
}

export const ribbons = {
  draw(ctx, shot, t, lt) {
    const p = shot.params;
    const rise = (p.rise || 0) * lt;
    ctx.pipe.layer((g) => {
      g.translate(0, -rise);
      for (const R of p.ribbons) drawRibbon(g, R, lt, { reveal: p.reveal ? p.reveal(lt) : 1 });
    }, { mode: p.ribbonMode || 'ink', absorb: 0.5, seed: 4, opacity: p.ribbonOpacity ?? 1 });
  },
};
