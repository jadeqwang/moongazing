// Dry-brush stroke along a path: a bundle of bristles, each a fine line whose ink runs out unevenly.
// pts: [{x, y, w}] (design px, w = full stroke width at that point). p: 0..1 how much of the stroke has been laid.
import { vnoise, clamp, mulberry32 } from './util.js';

export function resample(pts, step = 2) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(L / step));
    for (let k = 1; k <= n; k++) { const u = k / n; out.push({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, w: a.w + (b.w - a.w) * u }); }
  }
  let s = 0; out[0].s = 0;
  for (let i = 1; i < out.length; i++) { s += Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y); out[i].s = s; }
  return out;
}

// catmull-rom through control points -> dense polyline with widths
export function spline(ctrl, perSeg = 24) {
  const out = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    for (let k = 0; k < perSeg; k++) {
      const t = k / perSeg, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y), w: p1.w + (p2.w - p1.w) * t });
    }
  }
  out.push({ ...ctrl[ctrl.length - 1] });
  return out;
}

export function drawDryBrush(g, path, p, { color = '#141416', bristles = 22, seed = 1, dry = 0.55, wet = 0.0 } = {}) {
  const P = path, L = P[P.length - 1].s, lim = clamp(p) * L;
  if (lim <= 0) return;
  const r = mulberry32(seed);
  const br = [];
  for (let k = 0; k < bristles; k++) br.push({ o: (k / (bristles - 1)) * 2 - 1 + (r() - 0.5) * 0.08, a: 0.55 + 0.45 * r(), lw: 0.7 + 0.8 * r(), ph: r() * 100 });
  g.save();
  g.strokeStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
  // wet core underneath (the body of the stroke) — slightly narrower than the bristle bundle
  if (wet > 0) {
    g.globalAlpha = wet;
    for (let i = 1; i < P.length && P[i].s <= lim; i++) {
      const a = P[i - 1], b = P[i];
      g.lineWidth = Math.max(0.4, b.w * 0.62);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
  }
  for (const b of br) {
    let prev = null;
    for (let i = 0; i < P.length; i++) {
      const q = P[i]; if (q.s > lim) break;
      const nx = i < P.length - 1 ? P[i + 1].x - q.x : q.x - P[i - 1].x, ny = i < P.length - 1 ? P[i + 1].y - q.y : q.y - P[i - 1].y;
      const nl = Math.hypot(nx, ny) || 1;
      const x = q.x - (ny / nl) * b.o * q.w * 0.5, y = q.y + (nx / nl) * b.o * q.w * 0.5;
      if (prev) {
        const u = q.s / L;
        // ink runs out toward the end and at the edges of the bundle; streaky gaps along each bristle
        const n = vnoise(q.s * 0.045 + b.ph, b.o * 3.0, seed);
        const depletion = dry * (0.25 + 0.75 * u) * (0.55 + 0.45 * Math.abs(b.o));
        const al = clamp((n - depletion * 0.9) * 2.2) * b.a;
        if (al > 0.02) {
          g.globalAlpha = al;
          g.lineWidth = Math.max(0.35, (q.w / bristles) * 1.9 * b.lw);
          g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(x, y); g.stroke();
        }
      }
      prev = { x, y };
    }
  }
  g.restore();
}
