// Work lamps of the International Moonbase, as the film draws them (round four, Oct 8 2026).
// One source of truth: the lamps are L.lamps / lampList() of scenes/guanghan3d/layout.js (the station model has them
// too: build.js). This file only projects them through a shot's own model camera (scenes/guanghan3d/shots.js) into the
// uv of that shot's painted plate, and lays their light on the picture.
// There is no air on the Moon: nothing glows round a lamp. A lamp is a cut-off flood aimed straight down, and it shows
// as (1) the pool it throws on the regolith, hard-edged, brightest under the head, and (2) the hard shadows of what
// stands in that pool (a mast's pole and tripod). The head itself is drawn only when the camera is below it.
import { L, lampList } from '../../scenes/guanghan3d/layout.js';
import { SHOT } from '../../scenes/guanghan3d/shots.js';

const RAD = Math.PI / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };

// the perspective camera of a model shot (those on the graded plateau, where the ground is y = 0): world -> plate uv
export function shotCamera(id, aspect = 16 / 9) {
  const c = SHOT[id].cam, pos = c.pos;
  const f = c.aimBearing !== undefined
    ? [Math.sin(c.aimBearing * RAD) * Math.cos((c.pitch || 0) * RAD), Math.sin((c.pitch || 0) * RAD), -Math.cos(c.aimBearing * RAD) * Math.cos((c.pitch || 0) * RAD)]
    : norm(sub(c.target, pos));
  const r = norm(cross(f, [0, 1, 0])), u = cross(r, f), th = Math.tan(c.hfov * RAD / 2);
  return { pos, th, project(p) { const d = sub(p, pos), z = dot(d, f); if (z < 0.5) return null; return [0.5 + 0.5 * dot(d, r) / (z * th), 0.5 - 0.5 * dot(d, u) / (z * th / aspect)]; } };
}

// every lamp of the layout as this shot sees it: pool = its circle on the ground as a uv polygon; shadows = uv polygons
// of the pole's and the tripod's shadows inside a mast lamp's pool; head = the lamp head's uv; below = the camera is
// below the head (its lens can be seen); pole (mast lamps) = the mast's own pole as a uv strip, foot to top: it stands in
// front of whatever light lies behind it, and the side the camera sees of it is the side away from the lamp
export function lampView(id, o = {}) {
  const cam = shotCamera(id, o.aspect), out = {};
  for (const l of lampList()) {
    const [cx, , cz] = l.pool, ring = [];
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, q = cam.project([cx + l.r * Math.cos(a), 0, cz + l.r * Math.sin(a)]); if (q) ring.push(q); }
    const c = cam.project(l.pool), head = cam.project(l.head);
    if (!c || ring.length < 48) continue;
    const ax = cam.project([cx + l.r, 0, cz]), az = cam.project([cx, 0, cz + l.r]), shadows = [];
    if (l.kind === 'mast') {
      // the lamp hangs 1 m hub-side of the pole, `y` up. A point at height h and ground offset q from the lamp's nadir
      // throws its shadow at q * y / (y - h).
      const M = L.masts, A = L.lamps.mast, b = l.bearing * RAD, e = [Math.sin(b), -Math.cos(b)], F = [A.arm * e[0], A.arm * e[1]];   // pole foot, relative to the nadir
      const g = (q) => cam.project([cx + q[0], 0, cz + q[1]]), far = l.r * 1.25;
      const t = [-e[1], e[0]], w = M.rad, k = far / A.arm;
      shadows.push([g([F[0] + t[0] * w, F[1] + t[1] * w]), g([F[0] - t[0] * w, F[1] - t[1] * w]), g([(F[0] - t[0] * w) * k, (F[1] - t[1] * w) * k]), g([(F[0] + t[0] * w) * k, (F[1] + t[1] * w) * k])]);   // the pole: a wedge away from the lamp
      for (let i = 0; i < 3; i++) { const a = (i * 120 + l.bearing) * RAD, G = [F[0] + M.tripodR * Math.sin(a), F[1] - M.tripodR * Math.cos(a)], pts = [];
        for (let s = 0; s <= 6; s++) { const v = s / 6, h = 3 * v, q = [G[0] + (F[0] - G[0]) * v, G[1] + (F[1] - G[1]) * v], m = A.y / (A.y - h); pts.push([q[0] * m, q[1] * m]); }
        const n = norm([-(pts[6][1] - pts[0][1]), 0, pts[6][0] - pts[0][0]]), hw = 0.11;
        shadows.push([...pts.map((q, s) => g([q[0] + n[0] * hw * (1 + s / 6), q[1] + n[2] * hw * (1 + s / 6)])), ...pts.map((q, s) => g([q[0] - n[0] * hw * (1 + s / 6), q[1] - n[2] * hw * (1 + s / 6)])).reverse()]); }
    }
    let pole = null;
    if (l.kind === 'mast') { const b = l.bearing * RAD, fx = cx + L.lamps.mast.arm * Math.sin(b), fz = cz - L.lamps.mast.arm * Math.cos(b), p0 = cam.project([fx, -0.3, fz]), p1 = cam.project([fx, L.masts.h, fz]);
      const w = (o.poleW ?? 0.32) / Math.hypot(fx - cam.pos[0], fz - cam.pos[2]) * 0.5 / cam.th; if (p0 && p1) pole = [[p0[0] - w, p0[1]], [p0[0] + w, p0[1]], [p1[0] + w, p1[1]], [p1[0] - w, p1[1]]]; }
    out[l.id] = { ...l, c, pole, ax: [ax[0] - c[0], ax[1] - c[1]], az: [az[0] - c[0], az[1] - c[1]], ring, shadows: shadows.filter((s) => s.every(Boolean)), headUV: head, below: cam.pos[1] < l.head[1], dist: Math.hypot(...sub(l.pool, cam.pos)) };
  }
  return out;
}

const trace = (g, M, poly) => { poly.forEach((q, i) => { const [x, y] = M.at(q); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
const path = (g, M, poly) => { g.beginPath(); trace(g, M, poly); };
// clip to everything except the occluders (uv polygons of things standing in front of the lit ground)
const except = (g, M, occ) => { if (!occ || !occ.length) return; g.beginPath(); g.rect(-4000, -4000, 12000, 12000); for (const p of occ) trace(g, M, p); g.clip('evenodd'); };
// the pool as a fill that is strongest under the lamp and stops dead at the beam's edge (cos^3 falloff of a flat
// ground under a point source: 0.45 of the centre at a 40 degree half-angle)
function pool(g, M, v, rgb, a0, a1) {
  const [x, y] = M.at(v.c), [x1, y1] = M.at([v.c[0] + v.ax[0], v.c[1] + v.ax[1]]), [x2, y2] = M.at([v.c[0] + v.az[0], v.c[1] + v.az[1]]);
  g.save(); path(g, M, v.ring); g.clip();
  g.transform(x1 - x, y1 - y, x2 - x, y2 - y, x, y);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1.03); gr.addColorStop(0, `rgba(${rgb},${a0})`); gr.addColorStop(0.55, `rgba(${rgb},${a0 * 0.78 + a1 * 0.22})`); gr.addColorStop(1, `rgba(${rgb},${a1})`);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1.03, 0, Math.PI * 2); g.fill(); g.restore();
}

// Into the 'ink' (multiply) layer that holds a shot's night, after the night is laid: where a lamp's light lands the
// night is lifted off the painting, so the painted regolith shows; the shadows inside the pool keep the night.
// views = lampView(...) entries to draw; on(id) = 0..1; night = the night's own colour there ('rgb(r,g,b)');
// o.occluders = uv polygons that stand in front of the light (a mast's pole)
export function lampNight(g, M, views, on, o = {}) {
  for (const v of views) { const a = on(v.id); if (a <= 0) continue;
    g.save(); g.globalAlpha = a; g.filter = 'none'; except(g, M, o.occluders);
    pool(g, M, v, o.lift ?? '226,226,232', o.a0 ?? 0.9, o.a1 ?? 0.5);
    if (v.shadows.length) { path(g, M, v.ring); g.clip(); g.fillStyle = o.night ?? 'rgb(46,46,52)'; for (const s of v.shadows) { path(g, M, s); g.fill(); } }
    g.restore(); }
}
// Into a 'screen' layer of its own: the lit regolith itself (the same pool, the same shadows cut out of it), and the
// lens of a lamp the camera is below. rgb: the lamps' colour (work lamps are a neutral white, a door lamp is warm).
export function lampLight(g, M, views, on, o = {}) {
  for (const v of views) { const a = on(v.id); if (a <= 0) continue;
    g.save(); g.globalAlpha = a; except(g, M, o.occluders);
    pool(g, M, v, v.rgb ?? o.rgb ?? '224,230,242', (o.a0 ?? 0.2) * (v.gain ?? 1), (o.a1 ?? 0.07) * (v.gain ?? 1));
    if (v.shadows.length) { g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; g.fillStyle = '#000'; for (const s of v.shadows) { path(g, M, s); g.fill(); } g.globalCompositeOperation = 'source-over'; }
    if (v.below && v.headUV && o.lens !== false) { const [x, y] = M.at(v.headUV); g.globalAlpha = a; g.fillStyle = 'rgb(250,248,240)'; g.beginPath(); g.arc(x, y, Math.max(1.2, 0.25 * (o.pxm ?? 0) / Math.max(v.dist, 1)), 0, Math.PI * 2); g.fill(); }
    g.restore(); }
}
