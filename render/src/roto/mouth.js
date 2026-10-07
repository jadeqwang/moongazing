// Drawn mouth for lip-sync shots (re-mouthing): the take's own mouth is painted out in prep (tools/roto_prep.py),
// and the lips are drawn here from the VOCAL STEM (render/data/mouth.json, tools/sync/mouth_track.py) at SONG time,
// so they are in sync by construction whatever the take did. Placement is rigid to the head: the mouth corners and
// upper-lip centre are stored in an eye-corner frame (median over the clip), so the mouth never slides on the face.
// Style: gongbi lips — a rose pigment glaze, a dark 口缝 line tapering into the corners, a warm dark interior when open.
import { clamp } from '../util.js';

let track = null;
export async function loadMouthTrack() {
  if (!track) track = fetch('/data/mouth.json').then((r) => r.json()).catch(() => null);
  return track;
}
function sample(arr, fps, t) {
  const x = t * fps, i = Math.floor(x), f = x - i, n = arr.length;
  const a = arr[clamp(i, 0, n - 1)], b = arr[clamp(i + 1, 0, n - 1)];
  return a + (b - a) * f;
}
// LM_KEEP order in prep: [61 cornerL, 291 cornerR, 13 innerUp, 14 innerLo, 0 outerUp, 17 outerLo, 10 forehead,
//                         152 chin, 33 eyeL, 263 eyeR, 1 nose]
const pt = (a, k) => [a[k * 2], a[k * 2 + 1]];
function headFrame(a) {
  const L = pt(a, 8), R = pt(a, 9);
  const o = [(L[0] + R[0]) / 2, (L[1] + R[1]) / 2], x = [R[0] - L[0], R[1] - L[1]];
  const d = Math.hypot(x[0], x[1]), ex = [x[0] / d, x[1] / d], ey = [-ex[1], ex[0]];
  return { o, d, ex, ey, to: (p) => [((p[0] - o[0]) * ex[0] + (p[1] - o[1]) * ex[1]) / d, ((p[0] - o[0]) * ey[0] + (p[1] - o[1]) * ey[1]) / d],
    from: (u) => [o[0] + (u[0] * ex[0] + u[1] * ey[0]) * d, o[1] + (u[0] * ex[1] + u[1] * ey[1]) * d] };
}
// rest geometry of the mouth in head units: median over frames where the take's mouth was nearly closed
export function restMouth(face) {
  const rows = face.pts.map((a) => {
    const H = headFrame(a);
    const gap = Math.hypot(a[4] - a[6], a[5] - a[7]) / H.d;
    return { gap, cL: H.to(pt(a, 0)), cR: H.to(pt(a, 1)), up: H.to(pt(a, 2)), ou: H.to(pt(a, 4)) };
  });
  const sorted = [...rows].sort((p, q) => p.gap - q.gap);
  const use = sorted.slice(0, Math.max(3, Math.floor(sorted.length * 0.3)));
  const med = (f) => { const v = use.map(f).sort((p, q) => p - q); return v[v.length >> 1]; };
  return { cL: [med((r) => r.cL[0]), med((r) => r.cL[1])], cR: [med((r) => r.cR[0]), med((r) => r.cR[1])],
    up: [med((r) => r.up[0]), med((r) => r.up[1])], ou: [med((r) => r.ou[0]), med((r) => r.ou[1])] };
}

// draw into a Canvas2D context in design px. toScreen maps the drawing's video px -> design px.
export function drawMouth(g, face, rest, fd, toScreen, k, r, o = {}) {
  const H = headFrame(face.pts[fd]);
  const S = (u) => toScreen(H.from(u));
  drawMouthPts(g, S(rest.cL), S(rest.cR), S(rest.up), k, r, o);
}
// the same lips from three screen points (mouth corners + upper inner lip centre) — used on painted stills (singer.js)
export function drawMouthPts(g, cL, cR, up, k, r, o = {}) {
  const mx = (cL[0] + cR[0]) / 2, my = (cL[1] + cR[1]) / 2;
  const ang = Math.atan2(cR[1] - cL[1], cR[0] - cL[0]);
  const W0 = Math.hypot(cR[0] - cL[0], cR[1] - cL[1]);
  const lift = ((up[0] - mx) * -Math.sin(ang) + (up[1] - my) * Math.cos(ang)); // upper inner lip vs corner line (+ = below)
  const w = W0 * (1 - 0.24 * r) * (1 - 0.06 * k) * (o.width ?? 1);
  const gap = Math.pow(k, 1.2) * 0.38 * W0 * (1 + 0.15 * r) * (o.open ?? 1);
  const gU = gap * 0.36, gL = gap * 0.64;
  const tU = W0 * 0.15, tL = W0 * 0.17;
  const N = 18;
  const curve = (fy) => { const out = []; for (let j = 0; j <= N; j++) { const u = j / N, x = (u - 0.5) * w, s = Math.pow(Math.sin(Math.PI * u), 0.75); out.push([x, fy(u, s, x)]); } return out; };
  const base = (u, s) => lift * 0.35 * s;                                  // the mouth line's own droop at the centre
  const innerU = curve((u, s) => base(u, s) - gU * s);
  const innerL = curve((u, s) => base(u, s) + gL * s);
  const outerU = curve((u, s, x) => { const bow = 1 - 0.22 * Math.exp(-Math.pow(x / (w * 0.07), 2)); return base(u, s) - gU * s - tU * Math.pow(s, 0.55) * bow; });
  const outerL = curve((u, s) => base(u, s) + gL * s + tL * Math.pow(s, 0.6));
  g.save();
  g.translate(mx, my); g.rotate(ang);
  const path = (A, B) => { g.beginPath(); A.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); [...B].reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); };
  const a = o.alpha ?? 1;
  // lips: rose glaze (multiplied onto the skin; the paper shows through)
  g.filter = `blur(${(o.soft ?? 0.9).toFixed(2)}px)`;   // a glaze has a soft wet edge, not a vector edge
  const fa = a * (o.fillA ?? 1);
  g.fillStyle = `rgba(${o.lip || '222,160,160'},${0.85 * fa})`;
  path(outerU, innerU); g.fill();
  g.fillStyle = `rgba(${o.lipLo || '230,174,170'},${0.8 * fa})`;
  path(innerL, outerL); g.fill();
  // interior
  if (gap > 0.6) {
    g.fillStyle = `rgba(${o.inside || '150,92,86'},${0.85 * a})`;
    path(innerU, innerL); g.fill();
  }
  g.filter = 'none';
  // line-drawn lips (gold-line styles): a fine outer contour instead of a filled glaze
  if (o.outline) {
    g.strokeStyle = `rgba(${o.outline},${0.8 * a})`; g.lineWidth = Math.max(0.8, W0 * 0.018); g.lineCap = 'round'; g.lineJoin = 'round';
    for (const C of [outerU, outerL]) { g.beginPath(); C.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
  }
  // 口缝: the darkest mark on the face — a fine line along the upper inner lip, tapering into the corners
  const lw = Math.max(0.9, W0 * 0.032) * (o.lineW ?? 1);
  g.fillStyle = `rgba(${o.line || '84,56,48'},${0.85 * a})`;
  g.beginPath();
  innerU.forEach(([x, y], i) => { const u = i / N, t = Math.pow(Math.sin(Math.PI * u), 0.5); i ? g.lineTo(x, y - lw * 0.5 * t) : g.moveTo(x, y); });
  [...innerU].reverse().forEach(([x, y], j) => { const u = 1 - j / N, t = Math.pow(Math.sin(Math.PI * u), 0.5); g.lineTo(x, y + lw * 0.5 * t); });
  g.closePath(); g.fill();
  if (gap > 0.6) { // a softer line on the lower inner lip once the mouth is open
    g.strokeStyle = `rgba(${o.line || '58,40,34'},${0.45 * a})`; g.lineWidth = lw * 0.6; g.lineCap = 'round';
    g.beginPath(); innerL.slice(3, N - 2).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  }
  g.restore();
}

export function mouthAt(T, t) {
  if (!T) return [0, 0];
  return [sample(T.open, T.fps, t), T.round ? sample(T.round, T.fps, t) : 0];
}
