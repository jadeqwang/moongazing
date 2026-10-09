// 7.A · the speed-build of 广寒 Guanghan Station, drawn live as gold 界画 line on indigo.
//   Nothing here is a painted plate: every structure is projected from render/scenes/guanghan3d/layout.js (the single
//   source of the station's numbers) with the stage plates' own camera (parallel oblique, from bearing 315, elevation
//   33°, 210 m across, target (22, 0, 22)), so counts, positions and heights are canon by construction, lines stay
//   sharp at any framing, and things can MOVE: masts telescope and their panels turn with the Sun, tunnels extend,
//   shells rise course by course under the gantry, the radiator fan opens, the pad is sintered ring by ring.
//   Time-lapse light: the Sun's bearing is a function of the HUD's day counter (sunBearing); every standing thing casts
//   its shadow away from it, 1 / tan(elevation) times its height long, in a deeper indigo, and the hatching on the
//   regolith mounds is strongest on their shaded side.
//   section usage:  { name: 'buildsite', params: { cut: 'survey' } }   — the storyboard (CUTS) lives at the end.
// Deterministic: a pure function of the shot's local time; all texture is seeded.
import { L, P } from '../../scenes/guanghan3d/layout.js';
import { clamp, smooth, mulberry32 } from '../util.js';

const D2R = Math.PI / 180, TAU = Math.PI * 2;
// ---- camera (render/scenes/guanghan3d/shots.js JIEHUA_CAM) -------------------------------------------------------
const K0 = 1920 / 210, A = Math.SQRT1_2, SE = Math.sin(33 * D2R), CE = Math.cos(33 * D2R), TG = 22;
const BX = (x, z) => 960 + K0 * A * (-(x - TG) + (z - TG));
const BY = (x, y, z) => 540 - K0 * (A * SE * ((x - TG) + (z - TG)) + CE * y);
const CAMV = [-A * CE, SE, -A * CE];                    // unit vector from the scene toward the camera
const dep = (x, z) => x + z;                            // larger = farther from the camera
const G = (b, r) => { const p = P(b, r); return [p[0], p[2]]; };
const axes = (b) => ({ u: [Math.sin(b * D2R), -Math.cos(b * D2R)], v: [Math.cos(b * D2R), Math.sin(b * D2R)] });
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (x) => { const t = clamp(x); return 1 - (1 - t) * (1 - t); };

// ---- the Sun ------------------------------------------------------------------------------------------------------
// At 89.5° S the Sun stays within about 1.5° of the horizon and goes round it once per synodic month (29.53 days).
// The Moon turns the same way as the Earth, so from the south pole the Sun moves right to left: its bearing (degrees
// clockwise from grid north, seen from above) DEcreases. Shadows are 1 / tan(elev) times the caster's height.
export const SUN = { ref: 200, perDay: -360 / 29.53, elev: 1.2 };
export const sunBearing = (day) => SUN.ref + SUN.perDay * day;
const COT = 1 / Math.tan(SUN.elev * D2R);               // 47.7: a 20 m mast throws 950 m of shadow
const SUNW = 0.00925;                                   // the Sun's angular diameter (rad): penumbra width per metre

function hull(pts) {                                    // convex hull (monotone chain), 2D
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  lo.pop(); up.pop(); return lo.concat(up);
}

// ---- the pen: world metres → design px, strokes, and "erase what is behind" (hidden lines) ---------------------------
function Pen(g, V, org = [0, 0], sc = 1) {
  const k = V.zoom, lw = 1.22 * Math.pow(k, 0.5) * (sc < 1 ? Math.pow(sc, 0.25) : 1);
  const p = (x, y, z) => { const wx = org[0] + x * sc, wz = org[1] + z * sc; return [960 + (BX(wx, wz) - V.cx) * k, 540 + (BY(wx, y * sc, wz) - V.cy) * k]; };
  const pen = {
    g, k, lw, p, V, org, sc, s: K0 * k * sc,           // s: design px per metre across the view
    sub: (o, s2) => Pen(g, V, [org[0] + o[0] * sc, org[1] + o[1] * sc], sc * s2),
    world: (x, z) => [org[0] + x * sc, org[1] + z * sc],
    line(pts, w = 1.2, a = 1, close = false) {
      if (a <= 0.004 || pts.length < 2) return;
      g.globalAlpha = Math.min(1, a); g.lineWidth = w * lw; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      if (close) g.closePath(); g.stroke(); g.globalAlpha = 1;
    },
    seg(a, b, w, al) { pen.line([p(a[0], a[1], a[2]), p(b[0], b[1], b[2])], w, al); },
    l3(pts, w, al, close) { pen.line(pts.map((q) => p(q[0], q[1], q[2])), w, al, close); },
    erase(pts) {
      if (pts.length < 3) return;
      g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over';
    },
    // a horizontal circle (an axis-aligned ellipse in this projection); a0..a1 are canvas angles: 0..π is the near half
    circ(x, y, z, r, w = 1.2, a = 1, a0 = 0, a1 = TAU) {
      if (a <= 0.004) return; const c = p(x, y, z);
      g.globalAlpha = Math.min(1, a); g.lineWidth = w * lw; g.beginPath(); g.ellipse(c[0], c[1], r * pen.s, r * pen.s * SE, 0, a0, a1); g.stroke(); g.globalAlpha = 1;
    },
    // a box-section member: two parallel lines with nothing showing through between them
    beam(a, b, w = 3.0, al = 1) {
      const q = [p(a[0], a[1], a[2]), p(b[0], b[1], b[2])];
      g.lineCap = 'butt'; pen.line(q, w, al);
      g.globalCompositeOperation = 'destination-out'; pen.line(q, w * 0.46, 1); g.globalCompositeOperation = 'source-over'; g.lineCap = 'round';
    },
  };
  return pen;
}
const ringB = (pen, x, y, z, r, b0, b1, n = 40) => { const q = []; for (let i = 0; i <= n; i++) { const b = (b0 + (b1 - b0) * i / n) * D2R; q.push(pen.p(x + r * Math.sin(b), y, z - r * Math.cos(b))); } return q; };

// ---- solids ---------------------------------------------------------------------------------------------------------
function vcyl(pen, x, z, r, y0, y1, o = {}) {
  const { g } = pen, c = pen.p(x, y0, z), ct = pen.p(x, y1, z)[1], rx = r * pen.s, ry = rx * SE, w = o.w ?? 1.5, a = o.a ?? 1;
  if (o.erase !== false) {
    g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; g.beginPath();
    g.ellipse(c[0], ct, rx, ry, 0, 0, TAU); g.rect(c[0] - rx, ct, 2 * rx, c[1] - ct); g.moveTo(c[0] + rx, c[1]); g.ellipse(c[0], c[1], rx, ry, 0, 0, TAU);
    g.fill(); g.globalCompositeOperation = 'source-over';
  }
  g.globalAlpha = a; g.lineWidth = w * pen.lw;
  g.beginPath(); g.ellipse(c[0], ct, rx, ry, 0, 0, TAU); g.stroke();
  g.beginPath(); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI); g.stroke();
  g.beginPath(); g.moveTo(c[0] - rx, ct); g.lineTo(c[0] - rx, c[1]); g.moveTo(c[0] + rx, ct); g.lineTo(c[0] + rx, c[1]); g.stroke();
  g.globalAlpha = 1;
}
// a horizontal ribbed tube from (x0, z0) to (x1, z1): inflatable tunnels, connectors, the rigid modules
function tube(pen, x0, z0, x1, z1, r, cy, o = {}) {
  const len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.05) return;
  const d = [(x1 - x0) / len, (z1 - z0) / len], h = [-d[1], d[0]];
  const A0 = pen.p(x0, cy, z0), A1 = pen.p(x1, cy, z1), Hp = pen.p(x0 + h[0] * r, cy, z0 + h[1] * r);
  const H2 = [Hp[0] - A0[0], Hp[1] - A0[1]], V2 = [0, -r * pen.s * CE];
  const D2 = [A1[0] - A0[0], A1[1] - A0[1]], dl = Math.hypot(D2[0], D2[1]) || 1, N = [-D2[1] / dl, D2[0] / dl];
  const hn = H2[0] * N[0] + H2[1] * N[1], vn = V2[0] * N[0] + V2[1] * N[1], sup = Math.hypot(hn, vn);
  let ps = Math.atan2(vn, hn);                           // the silhouette is at ps and ps + π round the section
  if (Math.cos(ps + Math.PI / 2) * (h[0] * CAMV[0] + h[1] * CAMV[2]) + Math.sin(ps + Math.PI / 2) * CAMV[1] < 0) ps += Math.PI;
  const at = (C, ph, f = 1) => [C[0] + (Math.cos(ph) * H2[0] + Math.sin(ph) * V2[0]) * f, C[1] + (Math.cos(ph) * H2[1] + Math.sin(ph) * V2[1]) * f];
  const ell = (C, a0, a1, n = 14, f = 1) => { const q = []; for (let i = 0; i <= n; i++) q.push(at(C, a0 + (a1 - a0) * i / n, f)); return q; };
  const w = o.w ?? 1.4, a = o.a ?? 1, S0 = [N[0] * sup, N[1] * sup];
  if (o.erase !== false) { pen.erase([[A0[0] + S0[0], A0[1] + S0[1]], [A1[0] + S0[0], A1[1] + S0[1]], [A1[0] - S0[0], A1[1] - S0[1]], [A0[0] - S0[0], A0[1] - S0[1]]]); pen.erase(ell(A0, 0, TAU, 24)); pen.erase(ell(A1, 0, TAU, 24)); }
  pen.line([[A0[0] + S0[0], A0[1] + S0[1]], [A1[0] + S0[0], A1[1] + S0[1]]], w, a);
  pen.line([[A0[0] - S0[0], A0[1] - S0[1]], [A1[0] - S0[0], A1[1] - S0[1]]], w, a);
  const every = o.rib ?? 1.2;
  if (every) for (let s = o.rib0 ?? every; s < len - 0.25; s += every) pen.line(ell([A0[0] + D2[0] * s / len, A0[1] + D2[1] * s / len], ps, ps + Math.PI, 10), o.ribW ?? 0.75, a * (o.ribA ?? 0.8));
  const dc = d[0] * CAMV[0] + d[1] * CAMV[2];           // which end face looks at the camera
  pen.line(ell(A1, dc > 0 ? 0 : ps, dc > 0 ? TAU : ps + Math.PI, 24), w, a);
  pen.line(ell(A0, dc < 0 ? 0 : ps, dc < 0 ? TAU : ps + Math.PI, 24), w, a);
  if (o.hatch) pen.line(ell(dc > 0 ? A1 : A0, 0, TAU, 20, o.hatch), 0.8, a * 0.85);
  if (o.dome) for (const [E, sg] of [[A1, 1], [A0, -1]]) { const q = []; for (let i = 0; i <= 12; i++) { const t = -Math.PI / 2 + Math.PI * i / 12; q.push([E[0] + D2[0] / dl * sg * o.dome * pen.s * Math.cos(t) + N[0] * sup * Math.sin(t), E[1] + D2[1] / dl * sg * o.dome * pen.s * Math.cos(t) + N[1] * sup * Math.sin(t)]); } pen.erase(q); pen.line(q, w, a); }
}
function box(pen, at, hx, y0, y1, hz, w = 1.1, a = 1) {  // at(xl, y, zl) → world; drawn as its outline and top face
  const c = []; for (const y of [y0, y1]) for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) c.push(pen.p(...at(sx * hx, y, sz * hz)));
  const hl = hull(c); pen.erase(hl); pen.line(hl, w, a, true); pen.line(c.slice(4), w * 0.8, a, true);
  let n = 4; for (let i = 5; i < 8; i++) if (c[i][1] > c[n][1]) n = i; pen.line([c[n], c[n - 4]], w * 0.8, a);
}

// ---- the regolith mounds: printed shells (ruled courses) that end as heaped, hatched rock ---------------------------
const WALL = 2.5;                                       // shell thickness at the rim being printed (layout: 2.5–3 m)
function Mound(md, seed, c, rot, o = {}) {
  const rnd = mulberry32(seed), ph = [rnd() * 6, rnd() * 6, rnd() * 6, rnd() * 6], ax = axes(rot);
  const wob = (th) => 1 + 0.05 * Math.sin(3 * th + ph[0]) + 0.035 * Math.sin(5 * th + ph[1]) + 0.02 * Math.sin(9 * th + ph[3]);
  const at = (xl, y, zl) => [c[0] + xl * ax.u[0] + zl * ax.v[0], y, c[1] + xl * ax.u[1] + zl * ax.v[1]];
  const surf = (rho, th) => { const w = wob(th), r2 = Math.min(1, rho * rho);
    return at(rho * md.a * w * Math.cos(th), Math.pow(Math.max(0, 1 - rho * rho), 0.55) * md.h * (1 + 0.07 * r2 * Math.sin(2 * th + ph[2]) + 0.04 * r2 * Math.sin(4 * th + ph[0])), rho * md.b * w * Math.sin(th)); };
  const rhoAt = (y) => Math.sqrt(Math.max(0, 1 - Math.pow(clamp(y / md.h), 1 / 0.55)));
  const ringL = (y, n = 56, inset = 0) => { const rho = rhoAt(y), q = []; for (let i = 0; i < n; i++) { const th = i / n * TAU, w = 1 + (wob(th) - 1) * 0.3;
    const xl = Math.max(0, rho * md.a * w - inset) * Math.cos(th), zl = Math.max(0, rho * md.b * w - inset) * Math.sin(th); q.push({ p: at(xl, y, zl), xl, zl }); } return q; };
  const nrm = (rho, th) => { const e = 2e-3, p0 = surf(rho, th), p1 = surf(rho - e, th), p2 = surf(rho, th + e);
    const a = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], b = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
    let n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; if (n[1] < 0) n = [-n[0], -n[1], -n[2]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1; return [n[0] / l, n[1] / l, n[2] / l]; };
  const facing = (n) => n[0] * CAMV[0] + n[1] * CAMV[1] + n[2] * CAMV[2];
  const samp = []; for (const rho of [1, 0.97, 0.93, 0.87, 0.8, 0.7, 0.58, 0.45, 0.3, 0.15, 0]) { const n = rho > 0.75 ? 240 : 96; for (let i = 0; i < n; i++) samp.push(surf(rho, i / n * TAU)); }
  const strokes = [], ridges = [], skirt = [];
  // 皴: the hatching is laid in bunches of parallel strokes down the fall line, mostly on the lower slopes
  for (let i = 0; i < (o.bunches ?? 44); i++) {
    const th0 = rnd() * TAU, r0 = 0.42 + 0.5 * Math.pow(rnd(), 0.55), dr = 0.07 + 0.13 * rnd(), cnt = 4 + Math.floor(rnd() * 6), T = Math.max(0.5, r0) * Math.hypot(md.a * Math.sin(th0), md.b * Math.cos(th0)), sp = (0.32 + 0.22 * rnd()) / T, lean = (rnd() - 0.5) * 1.6 / T, al = 0.5 + 0.45 * rnd();
    const n = nrm(Math.min(0.96, r0 + dr / 2), th0 + cnt * sp / 2); if (facing(n) < 0.22) continue;
    for (let j = 0; j < cnt; j++) { const th = th0 + j * sp, ra = r0 + (rnd() - 0.5) * 0.03, rb = Math.min(0.995, ra + dr * (0.75 + 0.5 * rnd())), pts = [];
      for (let q = 0; q <= 3; q++) pts.push(surf(ra + (rb - ra) * q / 3, th + lean * q / 3));
      strokes.push({ pts, n, y: pts[0][1], a: al }); }
  }
  if (o.crest) { const pts = []; for (let j = 0; j <= 24; j++) { const f = j / 24 * 2 - 1; pts.push(surf(Math.abs(f) * 0.88, f < 0 ? Math.PI : 0)); } ridges.push({ pts, n: [0, 1, 0] }); }
  else for (let i = 0, tries = 0; i < 3 && tries < 60; tries++) { // a few long ridge lines from the crown
    const th = rnd() * TAU, n = nrm(0.6, th); if (facing(n) < 0.4) continue;
    const pts = [], k1 = (rnd() - 0.5) * 0.5, k2 = rnd() * 6, r1 = 0.55 + 0.3 * rnd();
    for (let j = 0; j <= 12; j++) { const f = j / 12; pts.push(surf(0.05 + (r1 - 0.05) * f, th + k1 * f + 0.07 * Math.sin(f * 7 + k2))); }
    ridges.push({ pts, n }); i++;
  }
  for (let i = 0; i < (o.skirt ?? 46); i++) {             // the skirt: loose regolith flicked out over the ground
    const th = rnd() * TAU, n = nrm(0.97, th); if (facing(n) < -0.3) continue;
    const r1 = 1.04 + 0.08 * rnd(), dth = (rnd() - 0.5) * 0.14;
    skirt.push({ pts: [surf(0.99, th), surf(r1, th + dth)], n, a: 0.35 + 0.45 * rnd() });
  }
  return { md, c, at, surf, rhoAt, ringL, samp, strokes, ridges, skirt, N: Math.floor(md.h / 0.6 - 1e-6) };
}
const MOUNDS = {};
Object.entries(L.mounds).forEach(([k, md], i) => { MOUNDS[k] = Mound(md, 11 + i * 7, G(md.bearing, md.r), md.bearing); });
const RB = L.reactor.berm;
const BERM = Mound({ a: RB.len / 2, b: RB.w / 2, h: RB.h }, 99, [0, -RB.offset], 90, { crest: true, bunches: 70, skirt: 70 });   // reactor-local: north is −z

const OUTL = new Map();
function heapOutline(pen, M, grow = 1) {              // the silhouette: the farthest drawn point in every direction from the middle
  const key = grow >= 1 ? `${pen.org[0]},${pen.org[1]},${pen.sc}` : null, memo = OUTL.get(M) || OUTL.set(M, new Map()).get(M);
  let out = key && memo.get(key);
  if (!out) {
    const H = M.md.h * grow, src = grow >= 1 ? M.samp : M.samp.filter((q) => q[1] <= H).concat(M.ringL(H, 240).map((q) => q.p));
    const B = (q) => { const w = pen.world(q[0], q[2]); return [BX(w[0], w[1]), BY(w[0], q[1] * pen.sc, w[1])]; };
    const c = B([M.c[0], H * 0.3, M.c[1]]), NB = 144, far = new Array(NB).fill(0);
    for (const q0 of src) { const q = B(q0), dx = q[0] - c[0], dy = q[1] - c[1], r = Math.hypot(dx, dy), b0 = Math.round(Math.atan2(dy, dx) / TAU * NB);
      for (let d = -1; d <= 1; d++) { const b = (((b0 + d) % NB) + NB) % NB; if (r > far[b]) far[b] = r; } }
    out = []; for (let b = 0; b < NB; b++) { const r = 0.5 * far[b] + 0.25 * (far[(b + 1) % NB] + far[(b + NB - 1) % NB]), a = b / NB * TAU; out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
    if (key) memo.set(key, out);
  }
  return out.map((q) => [960 + (q[0] - pen.V.cx) * pen.k, 540 + (q[1] - pen.V.cy) * pen.k]);
}
// the finished mound (or the part of it heaped so far: grow 0..1 of its height), hatched on its shaded side
function heap(pen, M, sunB, grow = 1, al = 1) {
  const H = M.md.h * grow, hl = heapOutline(pen, M, grow), s = [Math.sin(sunB * D2R), -Math.cos(sunB * D2R)];
  pen.erase(hl); pen.line(hl, 1.7, al, true);
  const sh = (n) => { const d = n[0] * s[0] + n[2] * s[1]; return 0.12 + 0.88 * smooth(0.45, -0.35, d); };   // faint in the light, full in the shade
  for (const k of M.strokes) if (k.y <= H) pen.l3(k.pts, 0.75, al * k.a * sh(k.n));
  for (const k of M.ridges) pen.l3(grow >= 1 ? k.pts : k.pts.filter((q) => q[1] <= H), 1.05, al * (0.5 + 0.4 * sh(k.n)));
  for (const k of M.skirt) pen.l3(k.pts, 0.7, al * k.a * (0.5 + 0.5 * sh(k.n)));
}
// the printed shell with n courses laid (0.6 m each); bx/dir: the gantry bridge (local x, sense of travel) lays the
// next course as it crosses. inside(): draws what stands in the open top (the pressure vessel). Returns the two
// points where the print heads are.
function shell(pen, M, n, o = {}) {
  const N = M.N, full = Math.min(N, Math.floor(n)), frac = n - Math.floor(n), P3 = (q) => pen.p(q.p[0], q.p[1], q.p[2]);
  for (let k = 0; k <= full; k++) { const pts = M.ringL(k * 0.6).map(P3); pen.erase(pts); pen.line(pts, k === 0 ? 1.5 : k === full ? 1.3 : 0.85, k === 0 || k === full ? 1 : 0.78, true); }
  if (full >= N) return [];
  const yT = full * 0.6, rin = M.ringL(yT, 56, WALL), rim = rin.map(P3);
  if (rin[0].xl > 0.3) pen.line(rim, 0.8, 0.85, true);
  if (o.inside && rin[0].xl > 0.3) {
    const lift = Math.max(0, (o.insideTop ?? 0) - yT) * pen.s * CE, { g } = pen, cl = hull(rim.concat(rim.map((q) => [q[0], q[1] - lift])));
    g.save(); g.beginPath(); cl.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.clip(); o.inside(); g.restore();
  }
  const heads = [];
  if (o.bx !== undefined && frac > 0.01) {                // the course being laid: the part the bridge has passed
    const nx = M.ringL(yT + 0.6, 72), done = (q) => (q.xl - o.bx) * (o.dir || 1) < 0;
    let run = [];
    for (let i = 0; i <= nx.length; i++) { const q = nx[i % nx.length], q0 = nx[(i + nx.length - 1) % nx.length];
      if (done(q)) run.push(P3(q)); else { if (run.length > 1) pen.line(run, 1.25, 1); run = []; }
      if (i > 0 && done(q) !== done(q0)) { const f = (o.bx - q0.xl) / ((q.xl - q0.xl) || 1); heads.push([lerp(q0.p[0], q.p[0], f), yT + 0.6, lerp(q0.p[2], q.p[2], f), lerp(q0.zl, q.zl, f)]); } }
    if (run.length > 1) pen.line(run, 1.25, 1);
  }
  return heads;
}
// the gantry printer: four legs on a 25 × 21 m footprint, 9.6 m to the rails (it clears a 22 × 18 × 7.5 m shell), a
// travelling bridge with two print heads. part: 'far' = what stands behind the shell, 'near' = everything else.
const GAN = { hx: 12.5, hz: 10.5, H: 9.6 };
function gantry(pen, at, o, part, lights) {
  const { hx, hz, H } = GAN, legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => at(sx * hx, 0, sz * hz));
  const c = at(0, 0, 0), d0 = dep(c[0], c[2]), far = (q) => dep(q[0], q[2]) > d0;
  const top = (q) => [q[0], H * (o.s ?? 1), q[2]];
  for (const q of legs) if (far(q) === (part === 'far')) pen.beam(q, top(q), 3.4);
  for (let i = 0; i < 4; i++) { const a = legs[i], b = legs[(i + 1) % 4]; if ((far(a) && far(b)) === (part === 'far')) pen.beam(top(a), top(b), 3.4); }
  if (part === 'far') return;
  const bx = o.bx ?? 0, b0 = at(bx, H, -hz), b1 = at(bx, H, hz);
  pen.beam(b0, b1, 3.0);
  for (const zh of o.heads || [0]) {
    const hb = at(bx, o.y ?? H - 3.2, zh), ht = at(bx, H, zh);
    pen.beam(ht, [hb[0], hb[1] + 0.9, hb[2]], 2.6); pen.seg([hb[0], hb[1] + 0.9, hb[2]], hb, 1.3);
    if (lights && o.glint) lights.push({ p: pen.p(hb[0], hb[1], hb[2]), r: 15, a: o.glint });
  }
}

// ---- masts, tower, hub ------------------------------------------------------------------------------------------------
function mast(pen, b, d, sunB, a = 1, lights = null) {
  const M = L.masts, [x, z] = G(b, M.ringR);
  for (let i = 0; i < 3; i++) { const ang = (i * 120 + b) * D2R, lx = x + M.tripodR * Math.sin(ang), lz = z - M.tripodR * Math.cos(ang);
    pen.seg([x, 3, z], [lx, 0, lz], 1.15, a); pen.circ(lx, 0.06, lz, 0.35, 0.9, a); }
  if (d <= 0) { pen.circ(x, 3, z, 0.3, 0.9, a); return; }
  const top = 3 + (M.h - 3) * d, p = M.panel, y0 = p.y0, y1 = Math.max(y0 + 0.3, Math.min(p.y1, top - 0.3));
  const wings = () => {
    const sb = sunB * D2R, wx = Math.cos(sb), wz = Math.sin(sb), lit = Math.sin(sb) * CAMV[0] - Math.cos(sb) * CAMV[2];   // > 0: we see the sunward face
    for (const s of [-1, 1]) {
      const xa = s * p.gap, xb = s * (p.gap + p.wingW), c = (q, y) => pen.p(x + wx * q, y, z + wz * q);
      const quad = [c(xa, y0), c(xb, y0), c(xb, y1), c(xa, y1)], ga = a * (lit > 0 ? 0.8 : 0.42);
      pen.erase(quad); pen.line(quad, 1.2, a, true);
      for (let i = 1; i < p.cols; i++) { const q = xa + (xb - xa) * i / p.cols; pen.line([c(q, y0), c(q, y1)], 0.55, ga); }
      const rows = Math.round(p.rows * (y1 - y0) / (p.y1 - p.y0));
      for (let r = 1; r < rows; r++) { const yy = y0 + (y1 - y0) * r / rows; pen.line([c(xa, yy), c(xb, yy)], 0.55, ga); }
    }
  };
  pen.seg([x, 0, z], [x, top, z], 1.7, a);
  for (let j = 1; j < 4; j++) { const y = 3 + (top - 3) * j / 4; pen.circ(x, y, z, 0.32, 0.8, a * 0.9); }   // the telescope's joints
  if (top > y0 + 0.5) { wings(); pen.seg([x, y0 - 0.9, z], [x, top, z], 1.7, a); pen.circ(x, y0 - 0.4, z, 0.45, 1.0, a); }
  pen.circ(x, top, z, 0.35, 1.0, a);
  if (lights && d < 0.995) lights.push({ p: pen.p(x, top, z), r: 12, a: 0.85 });
}
// the lattice comms tower: p = built fraction of its 25 m; dish 0..1 (raised), db = the bearing the dish faces
function comms(pen, pr, dish, db, lights) {
  const c = L.comms, [x, z] = G(c.bearing, c.r), w0 = 2.2, w1 = 0.6, top = c.h * clamp(pr), bay = 2.5;
  const leg = (i, y) => { const a = i * 120 * D2R, w = w0 + (w1 - w0) * (y / c.h); return [x + w * Math.cos(a), y, z + w * Math.sin(a)]; };
  for (let i = 0; i < 3; i++) pen.seg(leg(i, 0), leg(i, top), 1.5);
  for (let y = 0; y < top - 1e-6; y += bay) { const y1 = Math.min(top, y + bay), f = (y1 - y) / bay;
    for (let i = 0; i < 3; i++) { const a = leg(i, y), b = leg((i + 1) % 3, y), d = leg((i + 1) % 3, y + bay);
      pen.seg(a, b, 0.8, 0.9); pen.seg(a, [lerp(a[0], d[0], f), lerp(a[1], d[1], f), lerp(a[2], d[2], f)], 0.75, 0.85); } }
  if (pr < 1) { if (lights) lights.push({ p: pen.p(x, top, z), r: 13, a: 0.8 }); return; }
  for (let i = 0; i < 3; i++) pen.seg(leg(i, c.h), leg((i + 1) % 3, c.h), 0.9);
  if (dish <= 0) return;
  const nb = db * D2R, n = [Math.sin(nb), -Math.cos(nb)], t = [Math.cos(nb), Math.sin(nb)], R = c.dishD / 2 * dish, yc = c.h + 0.5 + R * 0.2, cx = x + n[0] * 1.0, cz = z + n[1] * 1.0;
  pen.seg([x, c.h, z], [x, yc, z], 1.3); pen.seg([x, yc, z], [cx, yc, cz], 1.2);
  const rim = (r, off) => { const q = []; for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU; q.push(pen.p(cx + n[0] * off + t[0] * r * Math.cos(a), yc + r * Math.sin(a), cz + n[1] * off + t[1] * r * Math.cos(a))); } return q; };
  const r0 = rim(R, 0.45); pen.erase(r0); pen.line(r0, 1.3, 1, true); pen.line(rim(R * 0.45, 0.1), 0.8, 0.8, true);
  pen.seg([cx + n[0] * 0.1, yc, cz + n[1] * 0.1], [cx + n[0] * 1.7, yc, cz + n[1] * 1.7], 0.9);
}
// the hub ("the tower") and its cupola. shut: 8 petal shutters, 1 = closed .. 0 = retracted into the sill wall
function hub(pen, o, lights) {
  const H = L.hub, c = H.cupola, { g } = pen, R = c.r, lit = o.lit || (() => 0);
  const camF = (b) => Math.sin(b * D2R) * CAMV[0] - Math.cos(b * D2R) * CAMV[2];   // > 0: that side of a round wall faces us
  vcyl(pen, 0, 0, H.r, 0, H.roofY, { w: 1.6 });
  pen.circ(0, H.decks[1], 0, H.r, 0.75, 0.7, 0.06, Math.PI - 0.06);
  const W = H.l2Windows;
  W.bearings.forEach((b, i) => {                          // the eight arched windows of the quiet deck
    if (camF(b) < 0.2) return;
    const bx = Math.sin(b * D2R) * H.r, bz = -Math.cos(b * D2R) * H.r, tx = Math.cos(b * D2R), tz = Math.sin(b * D2R), q = [];
    const pt = (u, y) => pen.p(bx + tx * u, W.sillY + y, bz + tz * u);
    q.push(pt(-W.w / 2, 0), pt(-W.w / 2, W.h)); for (let j = 1; j < 8; j++) { const a = Math.PI * (1 - j / 8); q.push(pt(W.w / 2 * Math.cos(a), W.h + W.w / 2 * Math.sin(a))); } q.push(pt(W.w / 2, W.h), pt(W.w / 2, 0));
    pen.line(q, 1.0, 0.95, true);
    const l = lit(i); if (l > 0 && lights) lights.push({ p: pt(0, W.h * 0.6), r: 11, a: l, fill: q });
  });
  vcyl(pen, 0, 0, R, c.floorY, c.sillY, { w: 1.3 });
  for (let i = 0; i < H.l3Portholes.n; i++) { const b = i * 360 / H.l3Portholes.n + 15; if (camF(b) < 0.25) continue;
    const bx = Math.sin(b * D2R) * R, bz = -Math.cos(b * D2R) * R, tx = Math.cos(b * D2R), tz = Math.sin(b * D2R), q = [];
    for (let j = 0; j < 10; j++) { const a = j / 10 * TAU; q.push(pen.p(bx + tx * 0.2 * Math.cos(a), H.l3Portholes.y + 0.2 * Math.sin(a), bz + tz * 0.2 * Math.cos(a))); }
    pen.line(q, 0.7, 0.9, true); const l = lit(8 + i); if (l > 0 && lights) lights.push({ p: pen.p(bx, H.l3Portholes.y, bz), r: 5, a: l }); }
  // the dome: a hemisphere of radius 3.5 m on the sill wall (its outline is a half circle on the rim's ellipse)
  const C = pen.p(0, c.sillY, 0), Rp = R * pen.s;
  g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; g.beginPath(); g.arc(C[0], C[1], Rp, Math.PI, TAU); g.ellipse(C[0], C[1], Rp, Rp * SE, 0, 0, Math.PI); g.fill(); g.globalCompositeOperation = 'source-over';
  const shut = o.shut || (() => 1), open = 1 - [0, 1, 2, 3, 4, 5, 6, 7].reduce((s, i) => s + shut(i), 0) / 8;
  const sp = (phi, b) => [R * Math.cos(phi) * Math.sin(b * D2R), c.sillY + R * Math.sin(phi), -R * Math.cos(phi) * Math.cos(b * D2R)];
  const front = (phi, b) => Math.cos(phi) * camF(b) + Math.sin(phi) * CAMV[1] > 0;
  const arc = (f, n, w, al, back) => { let run = []; for (let j = 0; j <= n; j++) { const [phi, b] = f(j / n); if (front(phi, b) !== back) run.push(pen.p(...sp(phi, b))); else { pen.line(run, w, al); run = []; } } pen.line(run, w, al); };
  for (let i = 0; i < c.ribs; i++) { const b = i * 360 / c.ribs + 22.5, f = (u) => [u * Math.PI / 2, b];
    if (open > 0.02) arc(f, 12, 0.9, 0.42 * open, true);    // the far ribs, seen through the glass
    arc(f, 12, 1.25, 1, false); }
  const rf = (u) => [Math.asin(0.72), u * 360];
  if (open > 0.02) arc(rf, 40, 0.8, 0.35 * open, true); arc(rf, 40, 1.0, 0.9, false);
  for (let i = 0; i < 8; i++) { const s = shut(i); if (s <= 0.01) continue;                 // slatted shutter petals
    for (let j = 1; j <= 10; j++) { const phi = j / 11 * Math.PI / 2; if (phi > s * Math.PI / 2) break;
      arc((u) => [phi, 22.5 + i * 45 + 3 + u * 39], 6, 0.7, 0.85, false); } }
  g.globalAlpha = 1; g.lineWidth = 1.5 * pen.lw; g.beginPath(); g.arc(C[0], C[1], Rp, Math.PI, TAU); g.stroke();
  pen.circ(0, c.topY - 0.05, 0, 0.6 * 0.5, 0.9, 1);
  if (open > 0.5 && lights && o.glow) lights.push({ p: [C[0], C[1] - Rp * 0.45], r: Rp * 0.8 / pen.lw, a: o.glow * 0.55, soft: true });
}
function node(pen, k, f = 1) {
  const nd = L.nodes[k], [x, z] = G(nd.bearing, nd.r);
  vcyl(pen, x, z, nd.rad, 0, nd.h * f, { w: 1.4 }); pen.circ(x, nd.h * f, z, nd.rad * 0.55, 0.8, 0.85);
}

// ---- small things ------------------------------------------------------------------------------------------------------
function rabbit(pen, x, z, b, s = 1.5, bob = 0) {             // Yutu: wheel-legs, two panel "ears"
  const ax = axes(b), at = (f, y, l) => [x + (f * ax.u[0] + l * ax.v[0]) * s, y * s + bob, z + (f * ax.u[1] + l * ax.v[1]) * s];
  for (const f of [-0.6, 0.6]) for (const l of [-0.5, 0.5]) { pen.seg(at(f, 0.6, l), at(f, 0.2, l), 0.8); const c = at(f, 0.2, l); pen.circ(c[0], c[1], c[2], 0.2 * s, 0.8); }
  box(pen, at, 0.8, 0.58, 1.13, 0.45, 1.0);
  for (const l of [-0.22, 0.22]) pen.l3([at(0.5, 1.13, l), at(0.5, 2.05, l), at(0.5, 2.05, l + 0.3 * Math.sign(l)), at(0.5, 1.13, l + 0.3 * Math.sign(l))], 0.9, 1, true);
}
function lander(pen, kind, alt = 0) {                         // Lanyue-class crew lander / squat cargo lander (pen-local metres)
  for (let i = 0; i < 4; i++) { const a = (i * 90 + 45) * D2R, lx = 3.6 * Math.cos(a), lz = 3.6 * Math.sin(a);
    pen.seg([lx * 0.6, 2.9 + alt, lz * 0.6], [lx, 0.1 + alt, lz], 1.1); pen.seg([lx * 0.55, 1.8 + alt, lz * 0.55], [lx * 0.82, 1.35 + alt, lz * 0.82], 0.8); pen.circ(lx, 0.05 + alt, lz, 0.45, 0.9); }
  const b0 = pen.p(0, 1.7 + alt, 0), b1 = pen.p(0, 0.85 + alt, 0);
  pen.line([[b0[0] - 0.5 * pen.s, b0[1]], [b1[0] - 0.95 * pen.s, b1[1]]], 0.9); pen.line([[b0[0] + 0.5 * pen.s, b0[1]], [b1[0] + 0.95 * pen.s, b1[1]]], 0.9); pen.circ(0, 0.85 + alt, 0, 0.95, 0.9);
  vcyl(pen, 0, 0, 2.4, 1.7 + alt, 3.5 + alt, { w: 1.4 });
  if (kind === 'crew') { vcyl(pen, 0, 0, 1.5, 3.5 + alt, 5.9 + alt, { w: 1.3 }); pen.circ(0, 5.9 + alt, 0, 0.6, 0.8, 0.9);
    const w = pen.p(-0.75, 4.9 + alt, -0.75); pen.g.globalAlpha = 1; pen.g.lineWidth = 0.8 * pen.lw; pen.g.beginPath(); pen.g.ellipse(w[0], w[1], 0.34 * pen.s, 0.4 * pen.s, 0, 0, TAU); pen.g.stroke(); }
  else { vcyl(pen, 0, 0, 1.7, 3.5 + alt, 4.9 + alt, { w: 1.2 }); }
}
function figure(pen, x, z, sway = 0) {                        // a suited figure, a few touches (only after Day 001)
  const q = (dx, y) => { const c = pen.p(x, y, z); return [c[0] + (dx + sway * y * 0.03) * pen.s, c[1]]; };
  pen.line([q(-0.14, 0), q(-0.1, 0.85), q(-0.2, 1.42), q(0.2, 1.42), q(0.1, 0.85), q(0.14, 0)], 1.0);
  pen.line([q(0.2, 1.4), q(0.36, 1.35), q(0.36, 0.95), q(0.18, 0.9)], 0.9);            // life-support pack
  pen.line([q(-0.2, 1.35), q(-0.42, 1.05), q(-0.5, 1.25)], 0.9);                       // the arm on the controls
  const h = q(0, 1.62); pen.g.globalAlpha = 1; pen.g.lineWidth = 1.0 * pen.lw; pen.g.beginPath(); pen.g.arc(h[0], h[1], 0.19 * pen.s, 0, TAU); pen.g.stroke();
}

// ---- ground lines --------------------------------------------------------------------------------------------------------
const ROAD_E = [G(90, L.mounds.E.r + L.mounds.E.a), [65, 14], G(90, L.compressed.pad.r - L.pad.bermR * L.compressed.pad.scale)];
const ROAD_S = [G(180, L.nodes.S.r + L.nodes.S.rad), G(180, L.compressed.reactor.r - (RB.offset + RB.w) * L.compressed.reactor.scale - 4)];
const REAC = G(180, L.compressed.reactor.r), RS = L.compressed.reactor.scale, PADC = G(90, L.compressed.pad.r), PS = L.compressed.pad.scale;
const LAND = [PADC[0], PADC[1] - 45 * PS];               // where landers come down, beside the pad site (guanghan3d/build.js)
const CABLE = [[REAC[0] + 0.6, REAC[1] - 1.8], [2.6, REAC[1] - 12], [4.2, ROAD_S[1][1] - 1], [4.2, 44], [3.6, 32], [1.6, 30.4]];   // laid first, the berm heaped over it
function plen(P2) { const l = [0]; for (let i = 1; i < P2.length; i++) l.push(l[i - 1] + Math.hypot(P2[i][0] - P2[i - 1][0], P2[i][1] - P2[i - 1][1])); return l; }
function pcut(P2, f) {                                   // the first fraction f of a ground polyline, and its head
  const l = plen(P2), T = l[l.length - 1] * clamp(f), out = [P2[0]];
  for (let i = 1; i < P2.length; i++) { if (l[i] <= T) { out.push(P2[i]); continue; } const u = (T - l[i - 1]) / ((l[i] - l[i - 1]) || 1); out.push([lerp(P2[i - 1][0], P2[i][0], u), lerp(P2[i - 1][1], P2[i][1], u)]); break; }
  return out;
}
function offs(P2, d) {                                   // a ground polyline moved sideways by d metres
  return P2.map((q, i) => { const a = P2[Math.max(0, i - 1)], b = P2[Math.min(P2.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [q[0] - (b[1] - a[1]) / l * d, q[1] + (b[0] - a[0]) / l * d]; });
}
const gl = (pen, P2, w, a, close) => pen.line(P2.map((q) => pen.p(q[0], 0, q[1])), w, a, close);
function road(pen, R, f, a = 0.85) { if (f <= 0) return; for (const s of [-2.5, 2.5]) gl(pen, pcut(offs(R, s), f), 1.0, a); }
const ovalPt = (md, th) => { const c = G(md.bearing, md.r), ax = axes(md.bearing); return [c[0] + md.a * Math.cos(th) * ax.u[0] + md.b * Math.sin(th) * ax.v[0], c[1] + md.a * Math.cos(th) * ax.u[1] + md.b * Math.sin(th) * ax.v[1]]; };
const OV0 = { NE: 2.4, SE: 3.4, E: 0.6, NW: 5.2, SW: 4.3, W: 1.9 };   // where each oval's tracing starts
function stakeList(f) {                                  // survey stakes: eight round each oval as it is traced, one at its centre
  const out = []; if (!f) return out;
  for (const [k, md] of Object.entries(L.mounds)) { const t = f.ovals[k] ?? 0; if (t <= 0) continue;
    for (let i = 0; i < 8; i++) { const g1 = clamp((t - (i + 0.5) / 8) * 9); if (g1 > 0) { const s = ovalPt(md, OV0[k] + TAU * (i + 0.5) / 8); out.push([s[0], s[1], g1]); } }
    if (t > 0.55) { const c = G(md.bearing, md.r); out.push([c[0], c[1], clamp((t - 0.55) * 8)]); } }
  return out;
}
// graded footprints with their survey stakes: f = { hub, cross, ovals: {key: 0..1 traced} }
function footprints(pen, f) {
  if (f.hub > 0) pen.circ(0, 0, 0, L.hub.r + 1.5, 1.0, 0.85 * f.hubA, 0, TAU * f.hub);
  if (f.cross > 0) for (const b of L.arms.bearings) { const ax = axes(b), to = 4 + 28 * f.cross;
    for (const s of [-2, 2]) gl(pen, [[ax.u[0] * 6.2 + ax.v[0] * s, ax.u[1] * 6.2 + ax.v[1] * s], [ax.u[0] * to + ax.v[0] * s, ax.u[1] * to + ax.v[1] * s]], 0.9, 0.8 * (f.crossA ?? 1)); }
  for (const [k, md] of Object.entries(L.mounds)) {
    const t = f.ovals[k] ?? 0; if (t <= 0) continue;
    const n = Math.max(2, Math.ceil(64 * t)), q = []; for (let i = 0; i <= n; i++) q.push(ovalPt(md, OV0[k] + TAU * t * i / n));
    gl(pen, q, 1.3, 0.95);
  }
  for (const s of stakeList(f)) pen.seg([s[0], 0, s[1]], [s[0], 1.5 * s[2], s[1]], 1.0, 0.9);
}

// ---- the reactor (compressed inset: bearing 180, r 92 m, scale 0.8) and the pad (bearing 090, r 100 m, scale 0.5) -----
const FIN = { r0: 2.6, y0: 0.6 };
const finBearing = (i, f) => { const sp = 5 + 145 * f; return 180 - sp / 2 + sp * i / (L.reactor.fins - 1); };
function reactor(pen0, st, sunB, lights) {
  const R = L.reactor, pen = pen0.sub(REAC, RS);
  if (st.stakes !== undefined) { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6, g1 = clamp(st.stakes * 4 - i); if (g1 > 0) pen.seg([3 * Math.cos(a), 0, 3 * Math.sin(a)], [3 * Math.cos(a), 1.5 * g1, 3 * Math.sin(a)], 1.0, 0.9); } return; }
  const items = [];
  if (st.fins !== undefined) for (let i = 0; i < R.fins; i++) { const b = finBearing(i, st.fins) * D2R, u = [Math.sin(b), -Math.cos(b)], r0 = FIN.r0, r1 = FIN.r0 + R.finW, y0 = FIN.y0, y1 = FIN.y0 + R.finH;
    items.push([dep(u[0] * (r0 + r1) / 2, u[1] * (r0 + r1) / 2), () => { const c = (r, y) => pen.p(u[0] * r, y, u[1] * r), q = [c(r0, y0), c(r1, y0), c(r1, y1), c(r0, y1)];
      pen.erase(q); pen.line(q, 1.15, 1, true); for (let j = 1; j < 4; j++) pen.line([c(lerp(r0, r1, j / 4), y0), c(lerp(r0, r1, j / 4), y1)], 0.55, 0.6);
      pen.line([c(r0, y0), c(r0, 0)], 0.9, 0.9); }]); }
  items.push([0, () => { vcyl(pen, 0, 0, 2.0, 0, 4.0, { w: 1.5 }); pen.circ(0, 4.0, 0, 1.1, 0.8, 0.85); pen.circ(0, 1.5, 0, 2.0, 0.7, 0.6, 0.1, Math.PI - 0.1); }]);
  if (st.figure) items.push([dep(-7.8, 0.5), () => figure(pen, -7.8, 0.5, st.figure)]);
  items.push([dep(0, -RB.offset) - 6, () => heap(pen, BERM, sunB, st.berm ?? 1)]);
  items.sort((a, b) => b[0] - a[0]).forEach((it) => it[1]());
}
const PAD_N = 12;                                         // sinter passes from the centre to the Ø 50 m edge
function padSite(pen0, st, lights) {
  const Pd = L.pad, pen = pen0.sub(PADC, PS), gap = (b) => Math.abs(((b - 270 + 540) % 360) - 180) < 11;   // the berm's gap faces the road
  if (st.stakes) for (let i = 0; i < 12; i++) { const b = i * 30 * D2R; pen.seg([Pd.discR * Math.sin(b), 0, -Pd.discR * Math.cos(b)], [Pd.discR * Math.sin(b), 3, -Pd.discR * Math.cos(b)], 0.9, 0.8 * st.stakes); }
  const n = st.rings ?? 0, full = Math.floor(n), frac = n - full;
  let head = null;
  if (n > 0) {
    pen.circ(0, 0.05, 0, Pd.discR, 1.1, 0.9);
    for (let j = 1; j <= Math.min(PAD_N - 1, full); j++) pen.circ(0, 0.05, 0, Pd.discR * j / PAD_N, 0.65, 0.75);
    if (full < PAD_N && frac > 0) { const r = Pd.discR * (full + 0.5) / PAD_N, b0 = 20 + full * 137, b1 = b0 - 360 * frac;   // the pass under way
      pen.line(ringB(pen, 0, 0.05, 0, Pd.discR * (full + 1) / PAD_N, b0, b1, 48), 0.9, 1);
      head = [r * Math.sin(b1 * D2R), -r * Math.cos(b1 * D2R), b1 - 90]; }
  }
  if (st.berm) {                                            // the blast berm: a low ring, r 35 m, 2.5 m high
    const arcs = (r, y, f0, f1, w, a) => { let run = []; for (let b = f0; b <= f1; b += 3) { if (gap(b)) { pen.line(run, w, a); run = []; } else run.push(pen.p(r * Math.sin(b * D2R), y, -r * Math.cos(b * D2R))); } pen.line(run, w, a); };
    arcs(Pd.bermR - 2.6, 0, 45, 225, 0.8, 0.6 * st.berm); arcs(Pd.bermR, Pd.bermH * 0.8, 0, 360, 1.3, st.berm); arcs(Pd.bermR + 2.6, 0, 225, 405, 1.1, st.berm);
    for (let b = 0; b < 360; b += 6) { if (gap(b) || gap(b + 3)) continue; const near = Math.sin(b * D2R) * CAMV[0] - Math.cos(b * D2R) * CAMV[2] > 0, r1 = Pd.bermR + (near ? 2.4 : -2.4), bb = (b + 1.5) * D2R;
      pen.seg([Pd.bermR * Math.sin(b * D2R), Pd.bermH * 0.8, -Pd.bermR * Math.cos(b * D2R)], [r1 * Math.sin(bb), 0.2, -r1 * Math.cos(bb)], 0.6, 0.5 * st.berm); }
  }
  if (head) { rabbit(pen, head[0], head[1], head[2], 3.0); const hp = pen.p(head[0] + 2.2 * Math.sin((head[2] + 0) * D2R), 0.05, head[1] - 2.2 * Math.cos(head[2] * D2R));
    pen.line([pen.p(head[0], 5.2, head[1]), hp], 0.8, 0.9); if (lights) lights.push({ p: hp, r: 16, a: 1 }); }
}

// ---- shadows: world ground polygons, away from the Sun ----------------------------------------------------------------
function shadowShapes(st, sunB) {
  const sb = sunB * D2R, sh = [-Math.sin(sb), Math.cos(sb)], out = [], solids = [];
  const cast = (x, z, y, sc = 1) => [x + sh[0] * y * COT * sc, z + sh[1] * y * COT * sc];
  const circle = (c, r, n = 14) => { const q = []; for (let i = 0; i < n; i++) q.push([c[0] + r * Math.cos(i / n * TAU), c[1] + r * Math.sin(i / n * TAU)]); return q; };
  const cyl = (c, r, h, a = 1, y0 = 0) => out.push({ poly: hull(circle(cast(c[0], c[1], y0), r).concat(circle(cast(c[0], c[1], y0 + h), r))), a, o: cast(c[0], c[1], y0), sh });
  const pole = (c, h, w, a = 0.9, y0 = 0) => out.push({ wedge: [cast(c[0], c[1], y0), sh, Math.min(h * COT, 420), w], a });
  const mound = (M, H, org = [0, 0], sc = 1) => { const q = []; for (const p of M.samp) { if (p[1] > H) continue; const x = org[0] + p[0] * sc, z = org[1] + p[2] * sc; q.push([x, z], cast(x, z, p[1], sc)); }
    if (H < M.md.h) for (const p of M.ringL(H, 24)) { const x = org[0] + p.p[0] * sc, z = org[1] + p.p[2] * sc; q.push(cast(x, z, H, sc)); }
    out.push({ poly: hull(q), a: 1, o: [org[0] + M.c[0] * sc, org[1] + M.c[1] * sc], sh }); };
  const tubeS = (x0, z0, x1, z1, r, cy) => { const len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.1) return; const h = [-(z1 - z0) / len, (x1 - x0) / len], q = [];
    for (const [x, z] of [[x0, z0], [x1, z1]]) for (let i = 0; i <= 4; i++) { const ph = i / 4 * Math.PI, px = x + h[0] * r * Math.cos(ph), pz = z + h[1] * r * Math.cos(ph); q.push([px, pz], cast(px, pz, cy + r * Math.sin(ph))); }
    out.push({ poly: hull(q), a: 1, o: [(x0 + x1) / 2, (z0 + z1) / 2], sh }); };
  for (const s of stakeList(st.foot)) pole(s, 1.5 * s[2], 0.12, 0.75);
  const M = L.masts;
  for (const [b, d] of Object.entries(st.masts || {})) { const c = G(+b, M.ringR); if (d > 0) pole(c, 3 + (M.h - 3) * d, 0.44); else pole(c, 3, 0.3, 0.6); }
  if (st.hub) { cyl([0, 0], L.hub.r, L.hub.roofY); cyl([0, 0], L.hub.cupola.r * 0.8, L.hub.cupola.topY - 0.6); }
  for (const [b, f] of Object.entries(st.arms || {})) { if (f <= 0) continue; const to = (+b === 90 || +b === 270) ? 30 : L.arms.to, p0 = G(+b, L.arms.from), p1 = G(+b, lerp(L.arms.from, to, f)); tubeS(p0[0], p0[1], p1[0], p1[1], L.arms.r, L.arms.cy); }
  for (const [k, f] of Object.entries(st.nodes || {})) if (f > 0) cyl(G(L.nodes[k].bearing, L.nodes[k].r), L.nodes[k].rad, L.nodes[k].h * f);
  for (const [k, sl] of Object.entries(st.mods || {})) { const m = L.modules[k], p0 = G(m.bearing, m.r - m.len / 2 + sl), p1 = G(m.bearing, m.r + m.len / 2 + sl); tubeS(p0[0], p0[1], p1[0], p1[1], m.rad, m.cy); }
  for (const [k, s] of Object.entries(st.shells || {})) { const Mo = MOUNDS[k], H = Math.max((s.heap || 0) * Mo.md.h, Math.min(Mo.N, Math.floor(s.n || 0)) * 0.6); if (H > 0.3) mound(Mo, H >= Mo.md.h - 0.31 ? Mo.md.h : H); }
  if (st.gantry) { const at = st.gantry.at; for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const q = at(sx * GAN.hx, 0, sz * GAN.hz); pole([q[0], q[2]], GAN.H * (st.gantry.s ?? 1), 0.4, 0.8); } }
  if (st.comms) { const c = G(L.comms.bearing, L.comms.r); out.push({ wedge: [c, sh, Math.min(L.comms.h * st.comms.p * COT, 420), 3.6, true], a: 0.3 }); }
  if (st.reactor && st.reactor.stakes === undefined) {
    cyl(REAC, 2 * RS, 4 * RS); mound(BERM, BERM.md.h * (st.reactor.berm ?? 1), REAC, RS);
    if (st.reactor.fins !== undefined) for (let i = 0; i < L.reactor.fins; i++) { const b = finBearing(i, st.reactor.fins) * D2R, u = [Math.sin(b), -Math.cos(b)], q = [];
      for (const r of [FIN.r0, FIN.r0 + L.reactor.finW]) { const x = REAC[0] + u[0] * r * RS, z = REAC[1] + u[1] * r * RS; q.push([x, z], cast(x, z, (FIN.y0 + L.reactor.finH) * RS)); }
      const hl = hull(q); if (hl.length > 2) out.push({ poly: hl, a: 1, o: REAC, sh }); }
  }
  if (st.pad && st.pad.berm) cyl(PADC, (L.pad.bermR + 2) * PS, L.pad.bermH * PS, st.pad.berm);
  for (const l of st.landers || []) { const s = l.s ?? PS; cyl([l.x, l.z], 2.4 * s, 4.2 * s, 1, (l.alt || 0) * s); }
  return out;
}
function drawShadows(g, pen, shapes) {
  g.fillStyle = '#000';
  for (const s of shapes) {
    if (s.poly) { const a0 = pen.p(s.o[0], 0, s.o[1]), a1 = pen.p(s.o[0] + s.sh[0] * 320, 0, s.o[1] + s.sh[1] * 320), gr = g.createLinearGradient(a0[0], a0[1], a1[0], a1[1]);
      gr.addColorStop(0, '#000'); gr.addColorStop(0.12, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = gr; g.globalAlpha = s.a; g.beginPath(); s.poly.forEach((q, i) => { const p = pen.p(q[0], 0, q[1]); if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); g.fill(); g.fillStyle = '#000'; continue; }
    // a thin caster: its shadow widens and thins out with distance (the Sun is half a degree wide)
    const [c, sh, len, w, flat] = s.wedge, n = [-sh[1], sh[0]], far = [c[0] + sh[0] * len, c[1] + sh[1] * len], wf = w + (flat ? 0 : SUNW * len);
    const a = pen.p(c[0], 0, c[1]), b = pen.p(far[0], 0, far[1]), gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
    for (const d of [0, 0.04, 0.1, 0.2, 0.35, 0.6, 1]) { const dist = d * len, k = flat ? 1 - 0.5 * d : Math.min(1, w / (SUNW * Math.max(dist, 1e-3))); gr.addColorStop(d, `rgba(0,0,0,${(s.a * Math.max(0.05, k)).toFixed(3)})`); }
    g.globalAlpha = 1; g.fillStyle = gr; g.beginPath();
    [[c, w], [far, wf]].forEach(([q, ww], i) => { const p1 = pen.p(q[0] + n[0] * ww / 2, 0, q[1] + n[1] * ww / 2); if (i) g.lineTo(p1[0], p1[1]); else g.moveTo(p1[0], p1[1]); });
    [[far, wf], [c, w]].forEach(([q, ww]) => { const p1 = pen.p(q[0] - n[0] * ww / 2, 0, q[1] - n[1] * ww / 2); g.lineTo(p1[0], p1[1]); });
    g.closePath(); g.fill(); g.fillStyle = '#000';
  }
  g.globalAlpha = 1;
}

// the shared layer context keeps whatever the last 2D layer set (the drop's HUD type leaves a drop shadow on it)
const clean = (g) => { g.shadowColor = 'rgba(0,0,0,0)'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; g.setLineDash([]); g.globalAlpha = 1; };
// ---- one frame of line work -----------------------------------------------------------------------------------------------
function drawLines(g, V, st, lights) {
  const pen = Pen(g, V), sunB = st.sun, items = [], add = (d, fn) => items.push([d, fn]);
  clean(g); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round';
  // ground: roads, footprints, the cable, the pad
  if (st.roads) { road(pen, ROAD_E, st.roads[0]); road(pen, ROAD_S, st.roads[1]); }
  if (st.foot) footprints(pen, st.foot);
  if (st.cable > 0) { const c = pcut(CABLE, st.cable); gl(pen, c, 1.3, 1); const h = c[c.length - 1]; if (st.cable < 1 && lights) lights.push({ p: pen.p(h[0], 0.2, h[1]), r: 12, a: 0.9 }); }
  if (st.pad) padSite(pen, st.pad, lights);
  // standing things, far → near
  const M = L.masts;
  for (const [b, d] of Object.entries(st.masts || {})) { const c = G(+b, M.ringR); add(dep(c[0], c[1]), () => mast(pen, +b, d, sunB, 1, lights)); }
  if (st.hub) add(0, () => hub(pen, st.hub, lights));
  for (const [b, f] of Object.entries(st.arms || {})) { if (f <= 0) continue; const to = (+b === 90 || +b === 270) ? 30 : L.arms.to, p0 = G(+b, L.arms.from), r1 = lerp(L.arms.from, to, f), p1 = G(+b, r1), pm = G(+b, 16);
    add(dep(pm[0], pm[1]), () => { tube(pen, p0[0], p0[1], p1[0], p1[1], L.arms.r, L.arms.cy, { rib: L.arms.ribEvery });
      if (f < 1 && lights) lights.push({ p: pen.p(p1[0], L.arms.cy, p1[1]), r: 12, a: 0.85 });
      const pl = st.ports; if (!pl) return;                 // the small round portholes, every 4 m on the side we see
      const sd = Math.sin((+b + 90) * D2R) * CAMV[0] - Math.cos((+b + 90) * D2R) * CAMV[2] > 0 ? 90 : -90, o = G(+b + sd, L.arms.r * 0.82);
      for (let r = 9, j = 0; r < Math.min(r1, 27); r += L.arms.portholeEvery, j++) { const c = G(+b, r), a = pl(+b, j); if (a > 0) lights.push({ p: pen.p(c[0] + o[0], L.arms.cy + 0.75, c[1] + o[1]), r: 4.2, a }); } }); }
  for (const [k, f] of Object.entries(st.nodes || {})) { if (f <= 0) continue; const c = G(L.nodes[k].bearing, L.nodes[k].r); add(dep(c[0], c[1]) - 0.5, () => node(pen, k, f)); }
  const modDraw = (k, sl, wheels) => { const m = L.modules[k], p0 = G(m.bearing, m.r - m.len / 2 + sl), p1 = G(m.bearing, m.r + m.len / 2 + sl), ax = axes(m.bearing);
    // the module rides in on a low wheeled cradle (and stays on it): four wheels a side
    const wh = (side) => { for (let i = 0; i < 4; i++) { const al = m.r + sl - 4.2 + i * 2.8, x = ax.u[0] * al + ax.v[0] * side * 1.9, z = ax.u[1] * al + ax.v[1] * side * 1.9; pen.circ(x, 0.5, z, 0.5, 0.9, 0.95); pen.seg([x, 0.5, z], [x - ax.v[0] * side * 0.7, 1.0, z - ax.v[1] * side * 0.7], 0.8, 0.9); } };
    const nearSide = dep(ax.v[0], ax.v[1]) < 0 ? 1 : -1;
    if (wheels) wh(-nearSide);
    tube(pen, p0[0], p0[1], p1[0], p1[1], m.rad, m.cy, { rib: 1.1, w: 1.5, hatch: 0.4, dome: 0.7 });
    if (wheels) wh(nearSide); };
  for (const [k, f] of Object.entries(st.conn || {})) { if (f <= 0) continue; const m = L.modules[k], Cn = L.connectors, p0 = G(m.bearing, Cn.from), sk = (st.shells || {})[k], p1 = G(m.bearing, lerp(Cn.from, sk && ((sk.n || 0) > 0 || (sk.heap || 0) > 0) ? m.r - L.mounds[k].a + 0.6 : Cn.to, f)), pm = G(m.bearing, 7);
    add(dep(pm[0], pm[1]), () => tube(pen, p0[0], p0[1], p1[0], p1[1], Cn.r, Cn.cy, { rib: 1.0, w: 1.2 })); }
  for (const [k, sl] of Object.entries(st.mods || {})) { const s = (st.shells || {})[k]; if (s && ((s.n || 0) > 0 || (s.heap || 0) > 0)) continue; const c = G(L.modules[k].bearing, L.modules[k].r + sl); add(dep(c[0], c[1]), () => modDraw(k, sl, true)); }
  for (const [k, s] of Object.entries(st.shells || {})) {
    const Mo = MOUNDS[k], c = Mo.c, gz = st.gantry && st.gantry.key === k ? st.gantry : null;
    if (gz) add(dep(c[0], c[1]) + 30, () => gantry(pen, Mo.at, gz, 'far'));
    add(dep(c[0], c[1]), () => {
      if ((s.heap || 0) >= 1) { heap(pen, Mo, sunB); return; }
      if ((s.n || 0) > 0) { const heads = shell(pen, Mo, s.n, { bx: gz ? gz.bx : undefined, dir: gz ? gz.dir : 1, insideTop: 4.65, inside: st.mods && st.mods[k] !== undefined ? () => modDraw(k, st.mods[k]) : null });
        if (gz) { gz.heads = heads.length ? heads.map((h) => h[3]) : [-0.5, 0.5]; gz.y = heads.length ? heads[0][1] : Math.floor(s.n) * 0.6 + 0.6; } }
      if ((s.heap || 0) > 0) heap(pen, Mo, sunB, s.heap);
    });
    if (gz) add(dep(c[0], c[1]) - 30, () => gantry(pen, Mo.at, gz, 'near', lights));
  }
  if (st.gantry && st.gantry.parked) { const gz = st.gantry, c = gz.at(0, 0, 0); add(dep(c[0], c[2]) + 1, () => gantry(pen, gz.at, gz, 'far')); add(dep(c[0], c[2]) - 1, () => gantry(pen, gz.at, gz, 'near')); }
  if (st.comms) { const c = G(L.comms.bearing, L.comms.r); add(dep(c[0], c[1]), () => comms(pen, st.comms.p, st.comms.dish, st.comms.db, lights)); }
  if (st.reactor) add(dep(REAC[0], REAC[1]), () => reactor(pen, st.reactor, sunB, lights));
  for (const l of st.landers || []) add(dep(l.x, l.z), () => lander(pen.sub([l.x, l.z], l.s ?? PS), l.kind, l.alt || 0));
  for (const r of st.rabbits || []) add(dep(r.x, r.z), () => rabbit(pen, r.x, r.z, r.b, r.s ?? 1.5, r.bob || 0));
  for (const f of st.figures || []) add(dep(f.x, f.z), () => figure(pen, f.x, f.z, f.sway || 0));
  items.sort((a, b) => b[0] - a[0]).forEach((it) => it[1]());
  if (st.extra) st.extra(pen, lights);
}

// ---- storyboard: twelve 2-beat cuts (7.A0 is still the painted plan K_7.A; these are the eleven that follow) ----------
const ALLM = (v = 1) => Object.fromEntries(L.masts.bearings.map((b) => [b, v]));
const KEYS = Object.keys(L.mounds), QUAD = Object.keys(L.modules);
const DONE = () => ({                                    // the whole station standing (Day 097)
  roads: [1, 1], masts: ALLM(1), hub: { shut: () => 0 }, arms: { 0: 1, 90: 1, 180: 1, 270: 1 }, nodes: { N: 1, S: 1 },
  conn: Object.fromEntries(QUAD.map((k) => [k, 1])), mods: Object.fromEntries(QUAD.map((k) => [k, 0])),
  shells: Object.fromEntries(KEYS.map((k) => [k, { heap: 1 }])), comms: { p: 1, dish: 1, db: 0 },
  reactor: { fins: 1 }, cable: 1, pad: { berm: 1, rings: PAD_N }, landers: [{ kind: 'crew', x: LAND[0], z: LAND[1] }],
});
const parked = () => { const c = G(110, 64), s = 0.8; return { parked: true, s, bx: 3, at: (xl, y, zl) => [c[0] + xl * s, y * s, c[1] + zl * s] }; };
const FOOT_ALL = { hub: 1, hubA: 1, cross: 1, ovals: Object.fromEntries(KEYS.map((k) => [k, 1])) };
const tri = (x) => 1 - Math.abs(((x % 2) + 2) % 2 - 1);  // 0 → 1 → 0, period 2
const along = (P2, f) => { const c = pcut(P2, f), h = c[c.length - 1], p = c[c.length - 2] || h; return { x: h[0], z: h[1], b: Math.atan2(h[0] - p[0], -(h[1] - p[1])) / D2R }; };

export const CUTS = {
  // 1 · two survey rabbits rule the plan onto bare regolith: roads, the cross, six ovals, a stake at every eighth
  survey: { view: [[830, 640, 1.3], [815, 622, 1.17]], days: [-640, -633],
    state(u) {
      const order = [['NE', -0.10, 0], ['E', 0.20, 0], ['SE', 0.50, 0], ['SW', -0.04, 1], ['W', 0.26, 1], ['NW', 0.56, 1]], ovals = {}, rabbits = [];
      for (const [k, t0] of order) ovals[k] = clamp((u - t0) / 0.26);
      const st = { roads: [ease((u + 0.3) / 0.75), ease((u + 0.15) / 0.75)], foot: { hub: clamp((u + 0.5) / 0.4), hubA: 1, cross: ease((u + 0.25) / 0.6), ovals },
        landers: [{ kind: 'cargo', x: LAND[0], z: LAND[1] }], reactor: { stakes: clamp((u - 0.45) / 0.4) }, rabbits };
      st.extra = (pen, lights) => {                         // each rabbit rides the head of the line it is ruling
        for (const who of [0, 1]) { const mine = order.filter((o) => o[2] === who); let at = null;
          for (let i = 0; i < mine.length; i++) { const [k, t0] = mine[i], md = L.mounds[k], t = (u - t0) / 0.26;
            if (t >= 0 && t <= 1) at = ovalPt(md, OV0[k] + TAU * t);
            else if (t > 1 && mine[i + 1] && u < mine[i + 1][1]) { const f = (u - t0 - 0.26) / (mine[i + 1][1] - t0 - 0.26), a = ovalPt(md, OV0[k]), b = ovalPt(L.mounds[mine[i + 1][0]], OV0[mine[i + 1][0]]); at = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; }
            else if (t > 1 && !mine[i + 1]) { const a = ovalPt(md, OV0[k]); at = [a[0] + (t - 1) * 5, a[1] - (t - 1) * 4]; } }
          if (at) { rabbit(pen, at[0] + 1.2, at[1] + 1.2, 200 + who * 90, 1.7); lights.push({ p: pen.p(at[0], 0, at[1]), r: 9, a: 0.75 }); } }
      };
      return st;
    } },
  // 2 · first power: mast M3 telescopes up and its blanket unrolls; M2, already standing, turns with the Sun
  masts: { view: [[847, 418, 2.4], [847, 402, 2.6]], days: [-530, -523],
    state(u) {
      return { roads: [1, 1], foot: FOOT_ALL, masts: { 30: 0, 90: 1, 150: lerp(0.16, 1, clamp((u + 0.06) / 0.56)), 210: 0, 270: 0, 330: 0 }, reactor: { stakes: 1 },
        rabbits: [{ x: 35.5 + 2.2 * Math.sin(u * 5), z: 52.5, b: 280, s: 1.6 }, { ...along([[38, 6], [30, 22], [29, 43]], tri(u * 1.3 + 0.3)), s: 1.6 }] };
    } },
  // 3 · the pressure vessels: the hub is down, four inflatable tunnels run out to their end nodes, four modules dock
  vessels: { view: [[960, 668, 1.62], [960, 676, 1.5]], days: [-407, -400],
    state(u) {
      const arms = {}, mods = {}, conn = {}, rabbits = [];
      [0, 90, 180, 270].forEach((b, i) => { arms[b] = ease((u + 0.22 - i * 0.04) / 0.6); });
      [['NE', -0.12], ['SW', 0.04], ['SE', 0.2], ['NW', 0.36]].forEach(([k, t0]) => { const f = ease((u - t0) / 0.5), sl = 27 * (1 - f); mods[k] = sl; conn[k] = clamp((u - t0 - 0.42) / 0.14);
      });
      rabbits.push({ ...along([[40, 8], [52, 10], [62, 14]], tri(u * 1.2 + 0.4)), s: 1.6 });
      return { roads: [1, 1], foot: { hub: 0, cross: 1, crossA: 1 - clamp(u * 1.6 + 0.3), ovals: FOOT_ALL.ovals }, masts: { 30: 1, 90: 1, 150: 1, 210: lerp(0.2, 0.5, u), 270: 1, 330: 0 }, hub: { shut: () => 1 },
        arms, nodes: { N: clamp((u - 0.36) / 0.1), S: clamp((u - 0.44) / 0.1) }, mods, conn, gantry: parked(), reactor: { stakes: 1 }, rabbits };
    } },
  // 4 · the regolith printer: the gantry's bridge crosses the SW module once a day and leaves one more 0.6 m course
  shell: { view: [[1128, 676, 2.75], [1136, 668, 3.0]], days: [-204, -200],
    state(u) {
      const n = 4.001 + 4 * u, k = Math.floor(n), f = n - k, Mo = MOUNDS.SW, dir = k % 2 ? -1 : 1, ext = Mo.md.a * Mo.rhoAt((k + 1) * 0.6) * 1.08;
      const bx = dir * lerp(-ext, ext, f);
      return { roads: [1, 1], foot: { hub: 0, cross: 0, ovals: { W: 1 } }, masts: ALLM(1), hub: { shut: () => 1 }, arms: { 0: 1, 90: 1, 180: 1, 270: 1 }, nodes: { N: 1, S: 1 },
        mods: Object.fromEntries(QUAD.map((q) => [q, 0])), conn: Object.fromEntries(QUAD.map((q) => [q, 1])),
        shells: { NE: { heap: 1 }, E: { heap: 1 }, SE: { heap: 1 }, NW: { heap: 1 }, SW: { n } }, gantry: { key: 'SW', bx, dir, glint: 1, at: Mo.at },
        reactor: { fins: 0 }, rabbits: [{ ...along([[-34, 24], [-46, 30], [-60, 22]], tri(u * 1.6 + 0.2)), s: 1.6 }, { ...along([[-60, 26], [-46, 34], [-33, 28]], tri(u * 1.6 + 0.9)), s: 1.6 }] };
    } },
  // 5 · the comms tower goes up bay by bay; its dish comes round to Earth (bearing 000, where Earth always hangs)
  comms: { view: [[590, 992, 3.1], [580, 972, 3.4]], days: [-43, -37],
    state(u) {
      const st = DONE(); delete st.cable; delete st.pad; st.landers = []; st.hub = { shut: () => 1 }; st.reactor = { fins: 0 };
      st.comms = { p: clamp(0.2 + u / 0.5 * 0.8), dish: ease((u - 0.5) / 0.12), db: lerp(-85, 0, ease((u - 0.56) / 0.36)) };
      st.rabbits = [{ ...along([[-20, -70], [-12, -58], [-4, -40]], tri(u * 1.4 + 0.5)), s: 1.6 }];
      return st;
    } },
  // 6 · Day 001: the crew's lander comes down on bare regolith beside the staked pad site, its shadow racing in to meet it
  landing: { view: [[190, 396, 5.0], [184, 400, 5.5]], days: [1, 1],
    state(u) {
      const st = DONE(); delete st.cable; st.hub = { shut: () => 1 }; st.reactor = { fins: 0 }; st.pad = { stakes: 1 };
      const td = 0.5, alt = u < td ? 46 * Math.pow(1 - u / td, 1.5) : 0, sq = u >= td ? 0.25 * Math.exp(-(u - td) * 16) * Math.cos((u - td) * 40) : 0;
      st.landers = [{ kind: 'cargo', x: LAND[0] + 8.5, z: LAND[1] - 10.5 }, { kind: 'crew', x: LAND[0], z: LAND[1], alt: alt - sq }];
      st.rabbits = [{ x: LAND[0] - 5 + 2.5 * smooth(0.55, 1.3, u), z: LAND[1] + 13 - 5 * smooth(0.55, 1.3, u), b: 20, s: 1.7 }];
      st.extra = (pen, lights) => {                         // regolith thrown out flat and fast along the ground: no air, no cloud
        const k = u < td ? clamp(1 - alt / 14) : Math.max(0, 1 - (u - td) / 0.2); if (k <= 0) return;
        const rnd = mulberry32(612), reach = u < td ? 6 + 16 * k : 22 + 60 * (u - td);
        for (let i = 0; i < 34; i++) { const b = rnd() * TAU, r0 = (2.6 + rnd() * 3) * PS + (u >= td ? (u - td) * 60 * rnd() : 0), r1 = r0 + reach * 0.7 * PS * (0.3 + 0.7 * rnd());
          pen.line([pen.p(LAND[0] + r0 * Math.sin(b), 0.05, LAND[1] - r0 * Math.cos(b)), pen.p(LAND[0] + r1 * Math.sin(b), 0.05, LAND[1] - r1 * Math.cos(b))], 0.6, 0.42 * k * (0.4 + 0.6 * rnd())); }
        if (u < td) lights.push({ p: pen.p(LAND[0], (0.6 + alt) * PS, LAND[1]), r: 9, a: 0.6 });
      };
      return st;
    } },
  // 7 · the radiator: twelve plates swing out from one closed stack like a folding fan, 150° on the far side
  radiator: { view: [[1560, 342, 4.7], [1564, 334, 5.1]], days: [5, 11],
    state(u) {
      const st = DONE(); delete st.cable; st.hub = { shut: () => 1 }; st.pad = { stakes: 1 };
      const f = clamp((u + 0.05) / 0.55); st.reactor = { fins: 1 - Math.pow(1 - f, 2) + (u > 0.5 ? 0.035 * Math.sin((u - 0.5) * 34) * Math.exp(-(u - 0.5) * 9) : 0), figure: Math.sin(u * 9) };
      return st;
    } },
  // 8 · power on the grid: the cable runs out from the reactor, round the berm and down the service road to the S node
  cable: { view: [[1345, 468, 1.95], [1325, 482, 2.1]], days: [13, 19],
    state(u) {
      const st = DONE(); st.hub = { shut: () => 1 }; st.pad = { stakes: 1 }; st.cable = clamp((u + 0.1) / 0.6);
      const h = along(CABLE, st.cable); st.rabbits = st.cable < 1 ? [{ x: h.x - 1.6, z: h.z - 2.2, b: h.b, s: 1.7 }] : [{ x: -3, z: 33, b: 0, s: 1.7 }];
      const on = clamp((u - 0.5) / 0.08);
      st.extra = (pen, lights) => { if (on <= 0) return; const s = G(180, 28), k = on * (0.75 + 0.25 * Math.cos((u - 0.5) * 50) * Math.exp(-(u - 0.5) * 12));
        lights.push({ p: pen.p(s[0], 2.2, s[1]), r: 30, a: 0.75 * k, soft: true });
        const run = clamp((u - 0.5) / 0.3), q = along([...CABLE].reverse(), run); if (run < 1) lights.push({ p: pen.p(q.x, 0.2, q.z), r: 10, a: 0.9 }); };
      return st;
    } },
  // 9 · Day 030: the cupola's petal shutters go down into the sill wall one after another; glass, ribs and ring
  cupola: { view: [[960, 646, 4.5], [960, 636, 5.0]], days: [27, 31],
    state(u) {
      const st = DONE(); st.pad = { berm: clamp(u * 0.6 + 0.4), stakes: 1 }; st.hub = { shut: (i) => 1 - smooth(-0.1 + i * 0.062, 0.1 + i * 0.062, u), glow: smooth(0.5, 0.72, u) };
      return st;
    } },
  // 10 · the landing pad: the laser rover circles once a day and leaves one more sintered pass, dark and glassy
  pad: { view: [[318, 352, 2.5], [306, 346, 2.75]], days: [62, 66],
    state(u) { const st = DONE(); st.pad = { berm: 1, rings: 7.001 + 4 * u }; return st; } },
  // 11 · Day 097: the whole station; the windows come on one by one
  lights: { view: [[960, 575, 1.17], [960, 560, 1.02]], days: [90, 97],
    state(u, lt) {
      const st = DONE(), order = [2, 1, 3, 0, 4, 5, 6, 7];
      st.hub = { shut: () => 0, glow: smooth(0.3, 0.6, u), lit: (i) => smooth(0, 0.05, u - 0.08 - (i < 8 ? order[i] * 0.04 : 0.2 + (i - 8) * 0.015)) };
      st.ports = (b, j) => smooth(0, 0.05, u - 0.36 - j * 0.07 - (b / 90) * 0.02);
      st.rabbits = [{ ...along(offs(ROAD_E, 0), tri(u * 1.2 + 0.2)), s: 1.6 }, { ...along(offs(ROAD_S, 0), tri(u * 1.1 + 0.6)), s: 1.6 }];
      return st;
    } },
};
export const buildDay = (cut, u) => { const d = CUTS[cut].days; return d[0] + (d[1] - d[0]) * clamp(u); };

export const buildsite = {
  init() { this.tmp = null; },
  draw(ctx, shot, t, lt) {
    const C = CUTS[shot.params.cut], dur = shot.t1 - shot.t0, u = clamp(lt / dur);
    const va = C.view[0], vb = C.view[1], V = { cx: lerp(va[0], vb[0], u), cy: lerp(va[1], vb[1], u), zoom: lerp(va[2], vb[2], u) };
    const stateAt = (uu) => { const st = C.state(clamp(uu, 0, 1), uu * dur); st.sun = sunBearing(buildDay(shot.params.cut, uu)); return st; };
    const st = stateAt(u), lights = [];
    // 1. shadows, as a deeper indigo: three exposures across the frame's 1/24 s (the shutter of a time-lapse)
    const lc = ctx.pipe.layerCanvas;
    if (!this.tmp || this.tmp.width !== lc.width || this.tmp.height !== lc.height) for (const k of ['tmp', 'tmp2']) { this[k] = document.createElement('canvas'); this[k].width = lc.width; this[k].height = lc.height; this[k].getContext('2d', { willReadFrequently: true }); }   // CPU-backed, like the pipeline's layer canvas
    const tg = this.tmp.getContext('2d'), S = ctx.pipe.gl.S, NS = 3, moving = C.days[1] !== C.days[0];
    ctx.pipe.layer((g) => {
      clean(g); clean(tg);
      for (let j = 0; j < (moving ? NS : 1); j++) {
        const uu = u + (moving ? (j - (NS - 1) / 2) / NS / (24 * dur) : 0), s2 = j === (NS - 1) / 2 || !moving ? st : stateAt(uu);
        tg.setTransform(S, 0, 0, S, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, 1920, 1080);
        drawShadows(tg, Pen(tg, V), shadowShapes(s2, s2.sun));
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 / (moving ? NS : 1);
        g.filter = `blur(${(0.7 * V.zoom * S).toFixed(2)}px)`; g.drawImage(this.tmp, 0, 0); g.restore();
      }
      g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(104,118,170)'; g.fillRect(0, 0, 1920, 1080); g.globalCompositeOperation = 'source-over';
    }, { mode: 'ink', opacity: shot.params.shadow ?? 0.7, seed: 720 });
    // 2. the gold line, drawn once (hidden lines are erased as it goes), then laid as 泥金 and again as a little light
    const lg = this.tmp2.getContext('2d'); lg.setTransform(S, 0, 0, S, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, 1920, 1080);
    drawLines(lg, V, st, lights);
    { lg.globalCompositeOperation = 'destination-out'; lg.globalAlpha = 1;
      let gr = lg.createLinearGradient(0, 84, 0, 150); gr.addColorStop(0, 'rgba(0,0,0,0.82)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = gr; lg.fillRect(0, 0, 1920, 150);
      gr = lg.createLinearGradient(0, 950, 0, 1004); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.82)'); lg.fillStyle = gr; lg.fillRect(0, 950, 1920, 130);
      lg.globalCompositeOperation = 'source-over'; }
    const put = (g, f) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (f) g.filter = f; g.drawImage(this.tmp2, 0, 0); g.restore(); };
    ctx.pipe.layer((g) => { clean(g); put(g); }, { mode: 'gold', seed: 721 });
    ctx.pipe.layer((g) => { clean(g); put(g, `blur(${(5 * S).toFixed(1)}px)`); g.globalAlpha = 0.5; put(g); g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(255,186,104)'; g.fillRect(0, 0, 1920, 1080); g.globalCompositeOperation = 'source-over'; }, { mode: 'screen', opacity: shot.params.glow ?? 0.3, seed: 723 });
    // 3. light: work heads, the laser, lit windows
    if (lights.length) ctx.pipe.layer((g) => {
      clean(g);
      for (const l of lights) {
        if (l.fill) { g.globalAlpha = Math.min(1, l.a); g.fillStyle = 'rgb(255,206,130)'; g.beginPath(); l.fill.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.fill(); }
        const r = l.r * Math.pow(V.zoom, 0.5), gr = g.createRadialGradient(l.p[0], l.p[1], 0, l.p[0], l.p[1], r);
        gr.addColorStop(0, l.soft ? `rgba(255,190,110,${(0.55 * l.a).toFixed(3)})` : `rgba(255,244,214,${Math.min(1, l.a).toFixed(3)})`); gr.addColorStop(0.3, `rgba(255,186,96,${(0.45 * l.a).toFixed(3)})`); gr.addColorStop(1, 'rgba(255,160,60,0)');
        g.globalAlpha = 1; g.fillStyle = gr; g.beginPath(); g.arc(l.p[0], l.p[1], r, 0, TAU); g.fill();
      }
    }, { mode: 'screen', seed: 722 });
  },
};
