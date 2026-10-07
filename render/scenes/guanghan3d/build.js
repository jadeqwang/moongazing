// Guanghan Station blockout — geometry. All numbers come from layout.js.
import * as THREE from 'three';
import { L, P, R_MOON } from './layout.js';

const D2R = Math.PI / 180;

// ------------------------------------------------------------------ shared uniforms + material factory
export const U = {
  uMode: { value: 0 },            // 0 flat, 1 depth, 2 gbuffer (view normal + 1/z), 3 white (line base)
  uSunDir: { value: new THREE.Vector3(0, 0.02, 1) },
  uSunOn: { value: 1 },
  uAmb: { value: 0.16 },
  uShadowY: { value: -1e9 },      // fragments below this world height get no sun (terrain-shadow states)
  uPtPos: { value: new THREE.Vector3() }, uPtCol: { value: new THREE.Vector3() }, uPtRange: { value: 1 },
  uPt2Pos: { value: new THREE.Vector3() }, uPt2Col: { value: new THREE.Vector3() }, uPt2Range: { value: 1 },
  uSpPos: { value: new THREE.Vector3() }, uSpDir: { value: new THREE.Vector3(0, -1, 0) }, uSpCos: { value: 0.9 }, uSpOn: { value: 0 },
  uLogNear: { value: 0.3 }, uLogFar: { value: 3000 },
  uLights: { value: 0 },
};

const VERT = /* glsl */`
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vW; varying float vZ;
void main(){
  vec4 w = modelMatrix * vec4(position,1.0);
  vW = w.xyz;
  vec4 mv = viewMatrix * w; vZ = mv.z;
  gl_Position = projectionMatrix * mv;
  #include <logdepthbuf_vertex>
}`;
const FRAG = /* glsl */`
#include <common>
#include <logdepthbuf_pars_fragment>
uniform int uMode; uniform vec3 uColor; uniform vec3 uEmis; uniform float uEmisOn; uniform float uClipY; uniform float uIsLine;
uniform vec3 uSunDir; uniform float uSunOn; uniform float uAmb; uniform float uShadowY; uniform float uLights;
uniform vec3 uPtPos; uniform vec3 uPtCol; uniform float uPtRange;
uniform vec3 uPt2Pos; uniform vec3 uPt2Col; uniform float uPt2Range;
uniform vec3 uSpPos; uniform vec3 uSpDir; uniform float uSpCos; uniform float uSpOn;
uniform float uLogNear; uniform float uLogFar;
varying vec3 vW; varying float vZ;
void main(){
  #include <logdepthbuf_fragment>
  if (vW.y > uClipY) discard;
  if (uIsLine > 0.5) {
    if (uMode == 3) { gl_FragColor = vec4(0.,0.,0.,1.); return; }
    gl_FragColor = vec4(uColor * 0.45, 1.); return;
  }
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
  vec3 toCam = isOrthographic ? (inverse(viewMatrix) * vec4(0.,0.,1.,0.)).xyz : (cameraPosition - vW);
  if (dot(n, toCam) < 0.) n = -n;
  if (uMode == 1) { float d = max(-vZ, uLogNear); float v = 1. - log(d/uLogNear)/log(uLogFar/uLogNear); gl_FragColor = vec4(vec3(clamp(v,0.,1.)),1.); return; }
  if (uMode == 2) { vec3 vn = normalize((viewMatrix * vec4(n,0.)).xyz); gl_FragColor = vec4(vn*0.5+0.5, 1.0/max(-vZ,1e-4)); return; }
  if (uMode == 3) { gl_FragColor = vec4(1.); return; }
  float lit = (vW.y > uShadowY) ? 1. : 0.;
  vec3 c = uColor * (uAmb + 0.9 * uSunOn * lit * max(dot(n, uSunDir), 0.));
  vec3 Lp = uPtPos - vW; float dp = length(Lp);
  c += uColor * uPtCol * max(dot(n, Lp/dp), 0.) * pow(clamp(1. - dp/uPtRange, 0., 1.), 1.5);
  vec3 L2 = uPt2Pos - vW; float d2 = length(L2);
  c += uColor * uPt2Col * max(dot(n, L2/d2), 0.) * pow(clamp(1. - d2/uPt2Range, 0., 1.), 1.5);
  if (uSpOn > 0.5) { vec3 Ls = vW - uSpPos; float ds = length(Ls); float cs = dot(Ls/ds, uSpDir);
    c += uColor * vec3(1.0,0.97,0.9) * 1.6 * smoothstep(uSpCos, uSpCos + 0.02, cs) * max(dot(n, -Ls/ds), 0.) / (1. + 0.02*ds*ds); }
  c += uEmis * uEmisOn * uLights;
  gl_FragColor = vec4(c, 1.);
}`;

const allMats = [];
export function mat(color, opts = {}) {
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide,
    uniforms: {
      ...U,
      uColor: { value: new THREE.Color(color) },
      uEmis: { value: new THREE.Color(opts.emis ?? 0x000000) },
      uEmisOn: { value: opts.emis ? 1 : 0 },
      uClipY: { value: 1e9 },
      uIsLine: { value: opts.line ? 1 : 0 },
    },
  });
  allMats.push(m);
  return m;
}
const C = {
  regolith: 0x8a8580, ground: 0x6f6c69, berm: 0x9b9289, module: 0xe8e6e0, tunnel: 0xdedad2, metal: 0xb8bcc2,
  panel: 0x6f86a8, mast: 0xcfd2d6, reactor: 0x8fae98, fin: 0x7da38a, pad: 0x3c3a39, road: 0x5c5956, hatch: 0xc8483a,
  earth: 0x5b7fae, glass: 0x9fb4c8, crew: 0xf2efe8, crewShirt: 0xf4f2ee, suit: 0xf0eee8, interior: 0xd9d2c4, floor: 0x8c8378,
  wood: 0xa48a6a, screen: 0x2a3340, vessel: 0x9a948c, tank: 0xc9ccd0, vault: 0x7d766e, lander: 0xc9a65a, rover: 0xd8d6cf,
};
const WARM = 0xffb35a, MAGENTA = 0xd65ab4, EMBER = 0xff6a1a;

// ------------------------------------------------------------------ helpers
const g = (...kids) => { const o = new THREE.Group(); kids.forEach((k) => k && o.add(k)); return o; };
const mesh = (geo, m, tag) => { const o = new THREE.Mesh(geo, m); if (tag) o.userData.tag = tag; return o; };
const at = (o, [x, y, z]) => { o.position.set(x, y, z); return o; };
const lineMat = () => mat(0x222222, { line: true });
function lines(points, m = lineMat()) { // points: flat array of segment endpoints [x,y,z,...]
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const l = new THREE.LineSegments(geo, m); l.userData.isLine = true; return l;
}
function circlePts(r, n, y = 0, axis = 'y') {
  const p = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const c = (a) => axis === 'y' ? [r * Math.cos(a), y, r * Math.sin(a)] : axis === 'z' ? [r * Math.cos(a), r * Math.sin(a), y] : [y, r * Math.cos(a), r * Math.sin(a)];
    p.push(...c(a0), ...c(a1));
  }
  return p;
}
// horizontal cylinder from point A to B (ground-plane), radius r, centre height cy
function hcyl(a, b, r, cy, m, seg = 28) {
  const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz);
  const o = mesh(new THREE.CylinderGeometry(r, r, len, seg, 1, false), m);
  o.rotation.z = Math.PI / 2; // along x
  const grp = g(o); grp.position.set((a[0] + b[0]) / 2, cy, (a[2] + b[2]) / 2); grp.rotation.y = -Math.atan2(dz, dx);
  grp.userData.len = len; return grp;
}
function ribs(grp, len, r, every, m = lineMat()) { // rings along a hcyl group (local x axis)
  const pts = [];
  for (let x = -len / 2 + every / 2; x < len / 2; x += every) pts.push(...circlePts(r * 1.02, 24, x, 'x'));
  grp.add(lines(pts, m));
}
export function setLights(on) { U.uLights.value = on ? 1 : 0; }

// ------------------------------------------------------------------ terrain
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const softplus = (x, k = 60) => (x / k > 30 ? x : k * Math.log1p(Math.exp(x / k)));
const CRATERS = (() => {
  const r = rng(7), out = [];
  for (let i = 0; i < 700; i++) {
    const x = (r() * 2 - 1) * 30000, n = (r() * 2 - 1) * 30000;
    const R = 6 * Math.pow(400, Math.pow(r(), 2.2)); // 6 m … 2.4 km, many small
    const d0 = Math.hypot(x, n);
    if (d0 < 480 + R) continue; // keep the graded plateau clean
    const [px, , pz] = P(L.pad.bearing, L.pad.r); if (Math.hypot(x - px, n + pz) < 120 + R) continue;
    out.push([x, n, R, 0.17 * 2 * R]);
  }
  // a few small craters inside the near field for texture (outside the base ring)
  const r2 = rng(11);
  for (let i = 0; i < 60; i++) { const a = r2() * 360, d = 240 + r2() * 260, R = 3 + r2() * 12; const [x, , z] = P(a, d); out.push([x, -z, R, 0.3 * R]); }
  return out;
})();
const bowl = (d, R, depth, rim, w = 0.35) => {
  if (d < R) { const t = d / R; return -depth * (1 - smooth(0.25, 1.0, t)) + rim * t * t * t * t; }
  return rim * Math.exp(-Math.pow((d - R) / (w * R), 2));
};
let H0 = null;
export function height(x, z) { // world x,z -> y
  if (H0 === null) { H0 = 0; H0 = rawHeight(0, 0); }
  const n = -z, d0 = Math.hypot(x, n);
  let h = (rawHeight(x, z) - H0) * smooth(200, 330, d0); // graded plateau at the base: exactly 0 inside 200 m
  return h - (x * x + n * n) / (2 * R_MOON);
}
function rawHeight(x, z) {
  const n = -z;
  const d0 = Math.hypot(x, n);
  let h = 0;
  h -= 0.07 * softplus(Math.abs(n) - L.site.plateauR, 50) + 0.06 * softplus(Math.abs(n) - 3000, 400);
  h -= 0.03 * softplus(-x - 600, 80);
  h += 0.015 * Math.min(Math.max(x, 0), 2500) * smooth(200, 600, x);
  const sh = P(L.shackleton.bearing, L.shackleton.r);
  h += bowl(Math.hypot(x - sh[0], z - sh[2]), L.shackleton.R, L.shackleton.depth, 120, 0.12);
  h += bowl(Math.hypot(x - L.deGerlache.x, n - L.deGerlache.n), L.deGerlache.R, L.deGerlache.depth, 150);
  const ps = P(L.psr.bearing, L.psr.r);
  h += bowl(Math.hypot(x - ps[0], z - ps[2]), L.psr.R, L.psr.depth, 6);
  for (const [cx, cn, R, dep] of CRATERS) {
    const dx = x - cx, dn = n - cn; if (Math.abs(dx) > 2 * R || Math.abs(dn) > 2 * R) continue;
    h += bowl(Math.hypot(dx, dn), R, dep, 0.06 * dep);
  }
  return h;
}
function terrain() {
  const N = 720, a = 400, b = 59600;
  const map = (s) => a * s + b * Math.pow(s, 5);
  const pos = new Float32Array((N + 1) * (N + 1) * 3);
  let k = 0;
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const x = map(i / N * 2 - 1), z = map(j / N * 2 - 1);
    pos[k++] = x; pos[k++] = height(x, z); pos[k++] = z;
  }
  const idx = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const p0 = j * (N + 1) + i, p1 = p0 + 1, p2 = p0 + N + 1, p3 = p2 + 1;
    idx.push(p0, p2, p1, p1, p2, p3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
  const m = mesh(geo, mat(C.ground), 'terrain'); m.userData.noEdges = true; return m;
}
function malapert() { // distant massif toward Earth, ~120 km; peeks ~0.4° over the horizon
  const grp = new THREE.Group();
  const r = rng(3);
  for (let i = 0; i < 9; i++) {
    const bearing = -14 + i * 3.5 + r() * 2, dist = L.malapert.r + (r() - 0.5) * 20000;
    const hh = (i === 4 ? L.malapert.h : L.malapert.h * (0.55 + r() * 0.35));
    const drop = dist * dist / (2 * R_MOON);
    const cone = mesh(new THREE.ConeGeometry(14000 + r() * 8000, hh, 7), mat(C.ground));
    const [x, , z] = P(bearing, dist); cone.position.set(x, hh / 2 - drop - 300, z); cone.userData.noEdges = true;
    grp.add(cone);
  }
  return grp;
}

// ------------------------------------------------------------------ structures
function hub(state) {
  const H = L.hub, grp = new THREE.Group(); grp.userData.tag = 'hub';
  const body = mesh(new THREE.CylinderGeometry(H.r, H.r, H.roofY, 48), mat(C.module), 'hubBody'); body.position.y = H.roofY / 2;
  grp.add(body);
  // deck lines + roof ring
  grp.add(lines([...circlePts(H.r * 1.005, 48, H.decks[1]), ...circlePts(H.r * 1.03, 48, H.roofY)]));
  // L2 arched windows (rectangles with a half-round head) and L3 portholes, as emissive patches + outlines
  const W = H.l2Windows, winMat = mat(0x30343a, { emis: WARM });
  for (const bng of W.bearings) {
    const [x, , z] = P(bng, H.r + 0.03);
    const pane = mesh(new THREE.PlaneGeometry(W.w, W.h), winMat); pane.position.set(x, W.sillY + W.h / 2, z);
    pane.rotation.y = -bng * D2R + Math.PI; pane.userData.noEdges = true; pane.userData.tag = 'hubWin'; grp.add(pane);
    const head = mesh(new THREE.CircleGeometry(W.w / 2, 16, 0, Math.PI), winMat); head.position.set(x, W.sillY + W.h, z);
    head.rotation.y = pane.rotation.y; head.userData.noEdges = true; head.userData.tag = 'hubWin'; grp.add(head);
    const ol = lines(arch(W.w, W.h)); ol.position.set(x, W.sillY, z); ol.rotation.y = pane.rotation.y; ol.userData.tag = 'hubWin'; grp.add(ol);
  }
  const ph = H.l3Portholes;
  for (let i = 0; i < ph.n; i++) {
    const bng = i * 360 / ph.n + 15, [x, , z] = P(bng, H.cupola.r + 0.03);
    const c = mesh(new THREE.CircleGeometry(ph.d / 2, 16), winMat); c.position.set(x, ph.y, z); c.rotation.y = -bng * D2R + Math.PI;
    c.userData.noEdges = true; c.userData.tag = 'porthole'; grp.add(c);
    const ol = lines(circlePts(ph.d / 2, 16, 0, 'z')); ol.position.copy(c.position); ol.rotation.copy(c.rotation); grp.add(ol);
  }
  grp.add(cupola(state));
  return grp;
}
function arch(w, h) { // outline points in local XY (z=0): sill at y=0
  const p = [-w / 2, 0, 0, w / 2, 0, 0, -w / 2, 0, 0, -w / 2, h, 0, w / 2, 0, 0, w / 2, h, 0];
  for (let i = 0; i < 12; i++) { const a0 = Math.PI * i / 12, a1 = Math.PI * (i + 1) / 12; p.push(w / 2 * Math.cos(a0), h + w / 2 * Math.sin(a0), 0, w / 2 * Math.cos(a1), h + w / 2 * Math.sin(a1), 0); }
  return p;
}
function cupola(state) {
  const c = L.hub.cupola, grp = new THREE.Group(); grp.userData.tag = 'cupola';
  if (state.cupola === 'none') return grp;
  const wall = mesh(new THREE.CylinderGeometry(c.r, c.r, c.sillY - c.floorY, 40, 1, true), mat(C.metal), 'cupolaWall');
  wall.position.y = (c.sillY + c.floorY) / 2; grp.add(wall);
  const floor = mesh(new THREE.CircleGeometry(c.r, 40), mat(C.floor), 'cupolaFloor'); floor.rotation.x = -Math.PI / 2; floor.position.y = c.floorY + 0.01; grp.add(floor);
  const roofRing = mesh(new THREE.RingGeometry(c.r, L.hub.r, 48), mat(C.module)); roofRing.rotation.x = -Math.PI / 2; roofRing.position.y = L.hub.roofY; grp.add(roofRing);
  const domeR = c.r, domeH = c.topY - c.sillY;
  const domeGeo = new THREE.SphereGeometry(domeR, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2); domeGeo.scale(1, domeH / domeR, 1);
  if (state.cupola === 'shuttered') {
    const shut = mesh(domeGeo, mat(C.metal), 'shutters'); shut.position.y = c.sillY; grp.add(shut);
    const p = []; for (let i = 0; i < 8; i++) p.push(...meridian(domeR, domeH, i * 45));
    const l = lines(p); l.position.y = c.sillY; grp.add(l);
  } else {
    const glass = mesh(domeGeo, mat(C.glass, { emis: 0xffc070 }), 'glass'); glass.position.y = c.sillY; glass.userData.glass = true; grp.add(glass);
    // ribs as thin solid struts (visible from inside and out)
    const ribM = mat(C.metal);
    for (let i = 0; i < c.ribs; i++) {
      const pts = []; for (let k = 0; k <= 16; k++) { const t = (k / 16) * Math.PI / 2; pts.push(new THREE.Vector3(domeR * Math.cos(t), domeH * Math.sin(t), 0)); }
      const tube = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.07, 5), ribM, 'rib');
      tube.rotation.y = (i * 360 / c.ribs + 22.5) * D2R; tube.position.y = c.sillY; tube.userData.noEdges = true; grp.add(tube);
    }
    const ring = mesh(new THREE.TorusGeometry(domeR * Math.cos(Math.asin(0.72)), 0.06, 5, 48), ribM, 'rib');
    ring.rotation.x = Math.PI / 2; ring.position.y = c.sillY + domeH * 0.72; ring.userData.noEdges = true; grp.add(ring);
    const cap = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.15, 20), ribM); cap.position.y = c.topY - 0.05; grp.add(cap);
  }
  return grp;
}
function meridian(r, h, deg) { const p = []; for (let k = 0; k < 12; k++) { const t0 = k / 12 * Math.PI / 2, t1 = (k + 1) / 12 * Math.PI / 2; const a = deg * D2R; p.push(r * Math.cos(t0) * Math.cos(a), h * Math.sin(t0), r * Math.cos(t0) * Math.sin(a), r * Math.cos(t1) * Math.cos(a), h * Math.sin(t1), r * Math.cos(t1) * Math.sin(a)); } return p; }

function arms() {
  const A = L.arms, grp = new THREE.Group(); grp.userData.tag = 'arms';
  const winMat = mat(0x30343a, { emis: WARM });
  for (const bng of A.bearings) {
    const to = (bng === 90 || bng === 270) ? 30 : A.to;
    const t = hcyl(P(bng, A.from), P(bng, to), A.r, A.cy, mat(C.tunnel)); t.userData.tag = 'arm' + bng;
    ribs(t, t.userData.len, A.r, A.ribEvery); grp.add(t);
    for (let r = 9; r < Math.min(to, 30); r += A.portholeEvery) for (const side of [-1, 1]) {
      const [x, , z] = P(bng, r); const [ox, , oz] = P(bng + 90 * side, A.r + 0.02);
      const w = mesh(new THREE.CircleGeometry(0.22, 12), winMat); w.position.set(x + ox, A.cy + 0.2, z + oz); w.rotation.y = -(bng + 90 * side) * D2R + Math.PI; w.userData.noEdges = true; grp.add(w);
    }
  }
  for (const k of ['N', 'S']) {
    const nd = L.nodes[k]; const [x, , z] = P(nd.bearing, nd.r);
    const body = mesh(new THREE.CylinderGeometry(nd.rad, nd.rad, nd.h, 32), mat(C.module), 'node' + k); body.position.set(x, nd.h / 2, z); grp.add(body);
    const top = mesh(new THREE.SphereGeometry(nd.rad, 32, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.module)); top.scale.y = 0.35; top.position.set(x, nd.h, z); top.userData.noEdges = true; grp.add(top);
    const [hx, , hz] = P(nd.bearing, nd.r + nd.rad + 0.03);
    const hatch = mesh(new THREE.PlaneGeometry(1.0, 1.9), mat(C.hatch, { emis: 0x000000 })); hatch.position.set(hx, 1.25, hz); hatch.rotation.y = -nd.bearing * D2R + Math.PI; grp.add(hatch);
    for (const s of [-1, 1]) { const [wx, , wz] = P(nd.bearing + 38 * s, nd.rad + 0.03); const w = mesh(new THREE.CircleGeometry(0.28, 14), winMat); w.position.set(x + wx, 2.6, z + wz); w.rotation.y = -(nd.bearing + 38 * s) * D2R + Math.PI; w.userData.noEdges = true; grp.add(w); }
  }
  const Cn = L.connectors;
  for (const k of Object.keys(L.modules)) { const m = L.modules[k]; const t = hcyl(P(m.bearing, Cn.from), P(m.bearing, Cn.to), Cn.r, Cn.cy, mat(C.tunnel)); ribs(t, t.userData.len, Cn.r, 1.0); grp.add(t); }
  return grp;
}
function modules(state) {
  const grp = new THREE.Group(); grp.userData.tag = 'modules';
  for (const [k, m] of Object.entries(L.modules)) {
    const a = P(m.bearing, m.r - m.len / 2), b = P(m.bearing, m.r + m.len / 2);
    const v = hcyl(a, b, m.rad, m.cy, mat(C.module)); v.userData.tag = 'module' + k; ribs(v, v.userData.len, m.rad, 1.1);
    // end domes
    for (const [p, s] of [[a, -1], [b, 1]]) { const d = mesh(new THREE.SphereGeometry(m.rad, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.module)); d.scale.y = 0.3; d.rotation.z = -s * Math.PI / 2; d.position.set(s * v.userData.len / 2, 0, 0); d.userData.noEdges = true; v.children[0].parent.add(d); }
    // cradle
    grp.add(v);
  }
  return grp;
}
function moundGeo(md, seed) {
  // radial grid (no sphere pole artefacts): ring k at rho = k/K, 64 segments
  const K = 24, A = 64, verts = [0, 1, 0], idx = [];
  for (let k = 1; k <= K; k++) for (let a = 0; a < A; a++) { const t = a / A * Math.PI * 2, rho = k / K; verts.push(rho * Math.cos(t), 0, rho * Math.sin(t)); }
  for (let a = 0; a < A; a++) idx.push(0, 1 + (a + 1) % A, 1 + a);
  for (let k = 1; k < K; k++) for (let a = 0; a < A; a++) { const p0 = 1 + (k - 1) * A + a, p1 = 1 + (k - 1) * A + (a + 1) % A, p2 = p0 + A, p3 = p1 + A; idx.push(p0, p1, p2, p1, p3, p2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); geo.setIndex(idx);
  const pos = geo.attributes.position, r = rng(seed);
  const ph = [r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), z = pos.getZ(i);
    const rho = Math.min(1, Math.hypot(x, z)); const ang = Math.atan2(z, x);
    const prof = Math.pow(Math.max(0, 1 - rho * rho), 0.55); // flatter, heap-like profile
    const wob = 1 + 0.04 * Math.sin(3 * ang + ph[0]) + 0.03 * Math.sin(5 * ang + ph[1]);
    pos.setXYZ(i, x * md.a * wob, prof * md.h * (1 + 0.03 * rho * rho * Math.sin(4 * ang + ph[2])), z * md.b * wob);
  }
  geo.computeVertexNormals(); return geo;
}
export const moundMats = {};
function mounds(state) {
  const grp = new THREE.Group(); grp.userData.tag = 'mounds';
  let s = 1;
  for (const [k, md] of Object.entries(L.mounds)) {
    const m = mat(C.berm); moundMats[k] = m;
    const frac = state.shells === 'all' ? 1 : (state.shells[k] ?? 0);
    if (frac <= 0) { s++; continue; }
    m.uniforms.uClipY.value = frac >= 1 ? 1e9 : frac * md.h;
    const o = mesh(moundGeo(md, s++), m, 'mound' + k); o.userData.noEdges = true;
    const [x, , z] = P(md.bearing, md.r); o.position.set(x, -0.05, z); o.rotation.y = -md.bearing * D2R + Math.PI / 2; // a along radial
    grp.add(o);
    // printed course lines (layer lines) as contour rings
    const pts = []; const geo = o.geometry;
    for (let y = 0.6; y < md.h * Math.min(frac, 0.98); y += 0.6) {
      const rho = Math.sqrt(Math.max(0, 1 - Math.pow(y / md.h, 1 / 0.55)));
      for (let i = 0; i < 40; i++) { const a0 = i / 40 * Math.PI * 2, a1 = (i + 1) / 40 * Math.PI * 2; pts.push(rho * md.a * Math.cos(a0), y, rho * md.b * Math.sin(a0), rho * md.a * Math.cos(a1), y, rho * md.b * Math.sin(a1)); }
    }
    if (frac < 1 || state.courseLines) { const l = lines(pts); l.position.copy(o.position); l.rotation.copy(o.rotation); grp.add(l); }
    // garage door / suitport face on the E mound (faces east), conveyor slot on the W mound
    if (k === 'E' && frac >= 1) { const [dx, , dz] = P(90, md.r + md.a - 0.9); const door = mesh(new THREE.PlaneGeometry(4.5, 3.2), mat(0x3a3a3a, { emis: WARM })); door.position.set(dx, 1.7, dz); door.rotation.y = -Math.PI / 2; grp.add(door); }
  }
  return grp;
}
function footprints() {
  const grp = new THREE.Group(); grp.userData.tag = 'footprints';
  const m = mat(0x55524f);
  const disc = (x, z, r) => { const d = mesh(new THREE.CircleGeometry(r, 40), m); d.rotation.x = -Math.PI / 2; d.position.set(x, 0.04, z); grp.add(d); };
  disc(0, 0, L.hub.r + 1.5);
  for (const md of Object.values(L.mounds)) { const [x, , z] = P(md.bearing, md.r); const d = mesh(new THREE.CircleGeometry(1, 40), m); d.scale.set(md.a, md.b, 1); d.rotation.x = -Math.PI / 2; d.rotation.z = (md.bearing - 90) * D2R; d.position.set(x, 0.04, z); grp.add(d); }
  for (const b of L.arms.bearings) { const [x, , z] = P(b, 18); const s = mesh(new THREE.PlaneGeometry(4, 28), m); s.rotation.x = -Math.PI / 2; s.rotation.z = -b * D2R; s.position.set(x, 0.045, z); grp.add(s); }
  // survey stakes
  const st = []; for (const md of Object.values(L.mounds)) { const [x, , z] = P(md.bearing, md.r); st.push(x, 0, z, x, 1.5, z); }
  grp.add(lines(st));
  return grp;
}
function mast(bearing, deploy = 1, sunBearing = 200) {
  const M = L.masts, grp = new THREE.Group(); grp.userData.tag = 'mast' + bearing;
  const [x, , z] = P(bearing, M.ringR); grp.position.set(x, 0, z);
  const mm = mat(C.mast);
  // tripod base
  const legPts = [];
  for (let i = 0; i < 3; i++) { const a = (i * 120 + bearing) * D2R; const lx = M.tripodR * Math.sin(a), lz = -M.tripodR * Math.cos(a);
    const leg = mesh(new THREE.CylinderGeometry(0.08, 0.08, Math.hypot(M.tripodR, 3), 6), mm); leg.position.set(lx / 2, 1.5, lz / 2);
    leg.lookAt(lx, 0, lz); leg.rotateX(Math.PI / 2); leg.userData.noEdges = true; grp.add(leg);
    const foot = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 12), mm); foot.position.set(lx, 0.06, lz); grp.add(foot); }
  if (deploy <= 0) return grp;
  const top = 3 + (M.h - 3) * deploy;
  const pole = mesh(new THREE.CylinderGeometry(M.rad * 0.8, M.rad, top, 12), mm, 'pole'); pole.position.y = top / 2; grp.add(pole);
  const capm = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12), mm); capm.position.y = top + 0.15; grp.add(capm);
  // panels: two wings either side of the mast, vertical, rotated to face the sun about the mast axis
  const p = M.panel, y0 = p.y0, y1 = Math.max(y0 + 0.3, Math.min(p.y1, top - 0.3));
  if (top > y0 + 0.5) {
    const wings = new THREE.Group(); wings.rotation.y = -(sunBearing) * D2R + Math.PI; // panel normal points toward the sun
    const pm = mat(C.panel);
    for (const s of [-1, 1]) {
      const w = mesh(new THREE.BoxGeometry(p.wingW, y1 - y0, 0.06), pm, 'panel'); w.position.set(s * (p.gap + p.wingW / 2), (y0 + y1) / 2, 0); wings.add(w);
      const gp = []; const xa = s * p.gap, xb = s * (p.gap + p.wingW);
      for (let c = 1; c < p.cols; c++) { const xx = xa + (xb - xa) * c / p.cols; gp.push(xx, y0, 0.04, xx, y1, 0.04, xx, y0, -0.04, xx, y1, -0.04); }
      const rowsN = Math.round(p.rows * (y1 - y0) / (p.y1 - p.y0));
      for (let r = 1; r < rowsN; r++) { const yy = y0 + (y1 - y0) * r / rowsN; gp.push(xa, yy, 0.04, xb, yy, 0.04, xa, yy, -0.04, xb, yy, -0.04); }
      wings.add(lines(gp));
    }
    // gimbal / slew ring
    const ring = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 12), mm); ring.position.y = y0 - 0.4; wings.add(ring);
    grp.add(wings);
  }
  return grp;
}
function commsTower() {
  const c = L.comms, grp = new THREE.Group(); grp.userData.tag = 'comms';
  const [x, , z] = P(c.bearing, c.r); grp.position.set(x, 0, z);
  const pts = [], w0 = 2.2, w1 = 0.6;
  const leg = (i, y) => { const a = i * 120 * D2R, w = w0 + (w1 - w0) * (y / c.h); return [w * Math.cos(a), y, w * Math.sin(a)]; };
  for (let i = 0; i < 3; i++) pts.push(...leg(i, 0), ...leg(i, c.h));
  for (let y = 0; y < c.h; y += 2.5) for (let i = 0; i < 3; i++) { pts.push(...leg(i, y), ...leg((i + 1) % 3, y)); pts.push(...leg(i, y), ...leg((i + 1) % 3, y + 2.5)); }
  grp.add(lines(pts));
  const mm = mat(C.metal);
  for (let i = 0; i < 3; i++) { const a = leg(i, 0), b = leg(i, c.h); const len = Math.hypot(b[0] - a[0], c.h, b[2] - a[2]);
    const l = mesh(new THREE.CylinderGeometry(0.09, 0.09, len, 5), mm); l.position.set((a[0] + b[0]) / 2, c.h / 2, (a[2] + b[2]) / 2); l.lookAt(b[0], c.h, b[2]); l.rotateX(Math.PI / 2); l.userData.noEdges = true; grp.add(l); }
  const dish = mesh(new THREE.SphereGeometry(c.dishD / 2 / Math.sin(0.6), 24, 6, 0, Math.PI * 2, 0, 0.6), mat(C.module), 'dish');
  dish.rotation.x = Math.PI / 2; dish.position.set(0, c.h + 0.5, -2.6); grp.add(dish); // concave side faces north (−z), toward Earth
  const boom = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 5), mm); boom.rotation.x = Math.PI / 2; boom.position.set(0, c.h + 0.5, -0.9); grp.add(boom);
  return grp;
}
function reactor(state, where) {
  const R = L.reactor, grp = new THREE.Group(); grp.userData.tag = 'reactor';
  if (!state.reactor || state.reactor === 'none') return grp;
  const [x, , z] = P(where.bearing, where.r); const y0 = where.r < 500 ? 0 : height(x, z); grp.position.set(x, y0, z); grp.scale.setScalar(where.scale ?? 1);
  // berm arc on the base side (north of the reactor)
  // straight earthen berm (heaped like the mounds) across the line of sight to the base
  const toBase = (where.bearing + 180) % 360;
  const berm = mesh(moundGeo({ a: R.berm.len / 2, b: R.berm.w / 2, h: R.berm.h }, 99), mat(C.berm), 'reactorBerm'); berm.userData.noEdges = true;
  const [bx, , bz] = P(toBase, R.berm.offset); berm.position.set(bx, -0.05, bz); berm.rotation.y = -(toBase + 90) * D2R + Math.PI / 2; grp.add(berm);
  if (state.reactor === 'staked') { const st = []; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; st.push(3 * Math.cos(a), 0, 3 * Math.sin(a), 3 * Math.cos(a), 1.5, 3 * Math.sin(a)); } grp.add(lines(st)); grp.remove(berm); return grp; }
  const core = mesh(new THREE.CylinderGeometry(R.coreR, R.coreR * 1.1, R.coreH, 24), mat(C.reactor), 'reactorCore'); core.position.y = R.coreH / 2 - R.sunk; grp.add(core);
  const conv = mesh(new THREE.BoxGeometry(3, 2.2, 2.5), mat(C.metal)); const [cx, , cz] = P(where.bearing, 4.5); conv.position.set(cx, 1.1, cz); grp.add(conv);
  // radiator fin fan on the far side (away from the base): plates hinged at the converter, fanning out
  const fan = new THREE.Group(); fan.position.set(cx, 0, cz); grp.add(fan);
  const fm = mat(C.fin), spread = 150 * (state.fins ?? 1);
  for (let i = 0; i < R.fins; i++) {
    const a = where.bearing + (R.fins === 1 ? 0 : (-spread / 2 + spread * i / (R.fins - 1)));
    const plate = mesh(new THREE.BoxGeometry(0.08, R.finH, R.finW), fm, 'fin');
    const [px, , pz] = P(a, 1.2 + R.finW / 2); plate.position.set(px, R.finH / 2 + 0.6, pz); plate.rotation.y = Math.PI - a * D2R; fan.add(plate);
  }
  return grp;
}
function pad(state, where) {
  const Pd = L.pad, grp = new THREE.Group(); grp.userData.tag = 'pad';
  const [x, , z] = P(where.bearing, where.r); const s = where.scale ?? 1; grp.position.set(x, where.r < 500 ? 0 : height(x, z), z); grp.scale.setScalar(s);
  if (state.pad === 'done' || state.pad === 'glazing') {
    const disc = mesh(new THREE.CircleGeometry(Pd.discR, 64, 0, state.pad === 'glazing' ? Math.PI * 1.15 : Math.PI * 2), mat(C.pad), 'padDisc');
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.06; grp.add(disc);
    const ringL = lines([...circlePts(Pd.discR * 0.6, 48, 0.08), ...circlePts(Pd.discR, 64, 0.08)]); grp.add(ringL);
    const bermGeo = new THREE.TorusGeometry(Pd.bermR, Pd.bermH, 6, 64, 340 * D2R);
    const berm = mesh(bermGeo, mat(C.berm), 'padBerm'); berm.rotation.x = -Math.PI / 2; berm.rotation.z = -170 * D2R; berm.position.y = -0.6; berm.userData.noEdges = true; grp.add(berm);
  }
  if (state.pad === 'glazing') { const rov = rover(); rov.position.set(Pd.discR * 0.9, 0, 4); grp.add(rov); }
  return grp;
}
function lander(kind) { // Lanyue-like crew lander or a squat cargo lander, ~7 m
  const grp = new THREE.Group(); grp.userData.tag = 'lander';
  const lm = mat(C.lander), wm = mat(C.module);
  const stage = mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.8, 8), lm); stage.position.y = 2.6; grp.add(stage);
  if (kind === 'crew') { const cab = mesh(new THREE.CylinderGeometry(1.4, 1.6, 2.4, 20), wm); cab.position.y = 4.7; grp.add(cab); }
  else { const box = mesh(new THREE.BoxGeometry(2.6, 1.4, 2.6), wm); box.position.y = 4.2; grp.add(box); }
  for (let i = 0; i < 4; i++) { const a = (i * 90 + 45) * D2R; const lx = 3.6 * Math.cos(a), lz = 3.6 * Math.sin(a);
    const leg = mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 6), mat(C.metal)); leg.position.set(lx * 0.6, 1.4, lz * 0.6); leg.lookAt(lx, 0, lz); leg.rotateX(Math.PI / 2); grp.add(leg);
    const pad = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 12), mat(C.metal)); pad.position.set(lx, 0.05, lz); grp.add(pad); }
  return grp;
}
export function rover() { // Yutu quadruped "rabbit": wheel-legs, two vertical solar-panel "ears"
  const grp = new THREE.Group(); grp.userData.tag = 'rover';
  const m = mat(C.rover);
  const body = mesh(new THREE.BoxGeometry(1.6, 0.55, 0.9), m); body.position.y = 0.85; grp.add(body);
  for (const sx of [-0.6, 0.6]) for (const sz of [-0.5, 0.5]) { const leg = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 5), m); leg.position.set(sx, 0.5, sz); grp.add(leg);
    const wh = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12), m); wh.rotation.x = Math.PI / 2; wh.position.set(sx, 0.22, sz); grp.add(wh); }
  for (const sz of [-0.2, 0.2]) { const ear = mesh(new THREE.BoxGeometry(0.05, 0.9, 0.35), mat(C.panel)); ear.position.set(0.5, 1.55, sz); grp.add(ear); }
  return grp;
}
function printer() { // gantry regolith printer, 14 m span
  const grp = new THREE.Group(); grp.userData.tag = 'printer';
  const pts = [], w = 10.5, d = 8, h = 8.5;
  for (const sx of [-w, w]) for (const sz of [-d, d]) pts.push(sx, 0, sz, sx, h, sz);
  pts.push(-w, h, -d, w, h, -d, -w, h, d, w, h, d, -w, h, -d, -w, h, d, w, h, -d, w, h, d);
  pts.push(1, h, -d, 1, h, d, 1, h, 0, 1, h - 3.5, 0);
  grp.add(lines(pts));
  const m = mat(C.metal);
  for (const sx of [-w, w]) for (const sz of [-d, d]) { const p = mesh(new THREE.BoxGeometry(0.3, h, 0.3), m); p.position.set(sx, h / 2, sz); grp.add(p); }
  for (const sz of [-d, d]) { const b = mesh(new THREE.BoxGeometry(2 * w, 0.4, 0.4), m); b.position.set(0, h, sz); grp.add(b); }
  const bridge = mesh(new THREE.BoxGeometry(0.5, 0.5, 2 * d), m); bridge.position.set(1, h, 0); grp.add(bridge);
  const head = mesh(new THREE.BoxGeometry(0.6, 3.2, 0.6), m); head.position.set(1, h - 1.8, 0); grp.add(head);
  return grp;
}
function roads(state, padW, reacW) {
  const grp = new THREE.Group(); grp.userData.tag = 'roads';
  const m = mat(C.road);
  const strip = (a, b, w = 5) => {
    const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz), n = Math.max(2, Math.ceil(len / 8));
    const pos = [], idx = []; const nx = -dz / len * w / 2, nz = dx / len * w / 2;
    for (let i = 0; i <= n; i++) { const t = i / n, x = a[0] + dx * t, z = a[2] + dz * t; const y = height(x, z) + 0.05;
      pos.push(x + nx, y, z + nz, x - nx, y, z - nz); if (i < n) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const o = mesh(geo, m); o.userData.noEdges = true; grp.add(o);
    const ln = []; for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; for (const s of [1, -1]) { const x0 = a[0] + dx * t0 + s * nx, z0 = a[2] + dz * t0 + s * nz, x1 = a[0] + dx * t1 + s * nx, z1 = a[2] + dz * t1 + s * nz; ln.push(x0, height(x0, z0) + 0.08, z0, x1, height(x1, z1) + 0.08, z1); } }
    grp.add(lines(ln));
  };
  const gE = P(90, L.mounds.E.r + L.mounds.E.a), padP = P(padW.bearing, padW.r - L.pad.bermR * (padW.scale ?? 1));
  strip(gE, [65, 0, 14]); strip([65, 0, 14], padP); // jogs south of mast M2 (bearing 090)
  const sN = P(180, L.nodes.S.r + L.nodes.S.rad), rP = P(reacW.bearing, reacW.r - (L.reactor.berm.offset + L.reactor.berm.w) * (reacW.scale ?? 1) - 4);
  strip(sN, rP); // service road + power cable: S node -> reactor
  if (padW.r > 500) strip(P(180, 70), P(L.psr.bearing, L.psr.r - L.psr.R - 10)); // to the PSR crater (true scale only)
  return grp;
}

// ------------------------------------------------------------------ interiors
function galleyInterior(withCrew = 8, crewPose = 'table') {
  const m = L.modules.NE, grp = new THREE.Group(); grp.userData.tag = 'galleyInt';
  // local frame: x along module axis (from hub end -len/2 to outer end +len/2), y up
  const frame = new THREE.Group(); const [cx, , cz] = P(m.bearing, m.r); frame.position.set(cx, 0, cz); frame.rotation.y = -(m.bearing - 90) * D2R; grp.add(frame);
  const shell = mesh(new THREE.CylinderGeometry(m.rad, m.rad, m.len, 40, 1, true), mat(C.interior), 'shell'); shell.rotation.z = Math.PI / 2; shell.position.y = m.cy; frame.add(shell);
  const rp = []; for (let x = -m.len / 2 + 0.5; x < m.len / 2; x += 1.0) rp.push(...circlePts(m.rad * 0.985, 40, x, 'x').map((v, i) => (i % 3 === 1 ? v + m.cy : v)));
  frame.add(lines(rp));
  const ribM = mat(0xc9c1b2); for (let x = -m.len / 2 + 0.5; x < m.len / 2; x += 1.0) { const t = mesh(new THREE.TorusGeometry(m.rad * 0.97, 0.06, 4, 40), ribM); t.rotation.y = Math.PI / 2; t.position.set(x, m.cy, 0); t.userData.noEdges = true; frame.add(t); }
  const halfW = Math.sqrt(m.rad * m.rad - Math.pow(m.floorY - m.cy, 2));
  const floor = mesh(new THREE.PlaneGeometry(m.len, 2 * halfW), mat(C.floor), 'floor'); floor.rotation.x = -Math.PI / 2; floor.position.y = m.floorY; frame.add(floor);
  for (const [s, hatch] of [[-1, true], [1, false]]) {
    const end = mesh(new THREE.CircleGeometry(m.rad, 40), mat(C.interior)); end.rotation.y = Math.PI / 2; end.position.set(s * m.len / 2, m.cy, 0); frame.add(end);
    if (hatch) { const h = mesh(new THREE.CircleGeometry(0.65, 32), mat(0x6b6660)); h.rotation.y = Math.PI / 2; h.position.set(s * m.len / 2 + 0.02, m.floorY + 1.05, 0); frame.add(h);
      const hl = lines([...circlePts(0.65, 32, 0, 'x'), ...circlePts(0.8, 32, 0, 'x')]); hl.position.set(s * m.len / 2 + 0.03, m.floorY + 1.05, 0); frame.add(hl); }
    else { const scr = mesh(new THREE.PlaneGeometry(2.0, 1.15), mat(C.screen, { emis: 0x9fc4ff })); scr.rotation.y = -Math.PI / 2; scr.position.set(s * m.len / 2 - 0.03, m.floorY + 1.55, 0); frame.add(scr);
      const sl = lines([-1, -0.575, 0, 1, -0.575, 0, 1, -0.575, 0, 1, 0.575, 0, 1, 0.575, 0, -1, 0.575, 0, -1, 0.575, 0, -1, -0.575, 0]); sl.rotation.y = -Math.PI / 2; sl.position.copy(scr.position); sl.position.x -= 0.01; frame.add(sl); }
  }
  // galley counter + shelves on both walls near the hatch end; lockers near the outer end
  const fm = mat(C.wood), sm = mat(0xbfb6a6);
  for (const s of [-1, 1]) {
    const counter = mesh(new THREE.BoxGeometry(3.2, 0.95, 0.6), fm); counter.position.set(-3.2, m.floorY + 0.475, s * (halfW - 0.35)); frame.add(counter);
    for (const hy of [1.55, 2.05]) { const sh = mesh(new THREE.BoxGeometry(3.0, 0.05, 0.4), sm); sh.position.set(-3.2, m.floorY + hy, s * (halfW - 0.25 - (hy - 1.5) * 0.25)); frame.add(sh); }
    const lock = mesh(new THREE.BoxGeometry(2.4, 1.9, 0.5), sm); lock.position.set(3.3, m.floorY + 0.95, s * (halfW - 0.3)); frame.add(lock);
  }
  // round table for 8
  const tx = 0.3, top = mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 32), fm, 'table'); top.position.set(tx, m.floorY + 0.75, 0); frame.add(top);
  const leg = mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.75, 8), fm); leg.position.set(tx, m.floorY + 0.37, 0); frame.add(leg);
  // light
  const lamp = mesh(new THREE.BoxGeometry(6, 0.05, 0.4), mat(0xfff0d0, { emis: 0xfff0d0 })); lamp.position.set(0, m.cy + m.rad - 0.25, 0); frame.add(lamp);
  if (crewPose === 'table') for (let i = 0; i < withCrew; i++) {
    const a = i / withCrew * Math.PI * 2 + 0.2; const seated = i % 2 === 0;
    const man = mannequin(seated ? 'sit' : 'lean'); man.position.set(tx + 1.3 * Math.cos(a), m.floorY, 1.3 * Math.sin(a) * 0.9); man.rotation.y = Math.PI - a; frame.add(man);
  }
  if (crewPose === 'screen') { const j = mannequin('touch'); j.position.set(m.len / 2 - 0.75, m.floorY, 0.15); j.rotation.y = 0; frame.add(j); }
  grp.userData.frame = frame; grp.userData.halfW = halfW;
  return grp;
}
function isruInterior() {
  const V = L.isruVault, grp = new THREE.Group(); grp.userData.tag = 'isruInt';
  const len = V.r1 - V.r0, [cx, , cz] = P(V.bearing, (V.r0 + V.r1) / 2);
  const frame = new THREE.Group(); frame.position.set(cx, V.floorY, cz); frame.rotation.y = -(V.bearing - 90) * D2R; grp.add(frame);
  // vault: half-ellipse cross-section, span 10, height 5, axis along local x
  const vg = new THREE.CylinderGeometry(1, 1, len, 40, 1, true, 0, Math.PI); vg.rotateZ(Math.PI / 2); vg.scale(1, V.h, V.span / 2);
  const vault = mesh(vg, mat(C.vault), 'vault'); frame.add(vault);
  const course = []; for (let k = 1; k < 16; k++) { const t = k / 16 * Math.PI; const y = V.h * Math.sin(t), zz = V.span / 2 * Math.cos(t); course.push(-len / 2, y, zz, len / 2, y, zz); }
  frame.add(lines(course)); // printed layer lines run along the vault
  const fl = mesh(new THREE.PlaneGeometry(len, V.span), mat(C.floor)); fl.rotation.x = -Math.PI / 2; frame.add(fl);
  for (const s of [-1, 1]) { const end = mesh(new THREE.CircleGeometry(1, 32, 0, Math.PI), mat(C.vault)); end.scale.set(V.span / 2, V.h, 1); end.rotation.y = Math.PI / 2; end.rotation.z = 0; end.position.x = s * len / 2; frame.add(end); }
  // MRE reactor vessel (centre), inspection port facing +z side
  const vm = mat(C.vessel), vx = 0.5;
  const ves = mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 32), vm, 'vessel'); ves.position.set(vx, 1.1, 0); frame.add(ves);
  const lid = mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.18, 32), mat(C.metal)); lid.position.set(vx, 2.3, 0); frame.add(lid);
  const stack = mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 12), mat(C.metal)); stack.position.set(vx, 3.5, 0); frame.add(stack);
  const port = mesh(new THREE.CircleGeometry(0.3, 24), mat(0x3a1a08, { emis: EMBER })); port.position.set(vx + 0.68, 1.25, 0.9); port.rotation.y = 0.65; frame.add(port);
  const pl = lines([...circlePts(0.3, 24, 0, 'z'), ...circlePts(0.38, 24, 0, 'z')]); pl.position.copy(port.position); pl.rotation.copy(port.rotation); frame.add(pl);
  const wheel = mesh(new THREE.TorusGeometry(0.22, 0.03, 6, 24), mat(C.metal), 'valve'); wheel.position.set(vx - 0.35, 1.2, 1.12); frame.add(wheel);
  // O2 tanks along the north wall, hopper + conveyor at the west end
  for (let i = 0; i < 4; i++) { const t = mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.4, 20), mat(C.tank), 'tank'); t.position.set(-2 + i * 1.0, 1.2, -(V.span / 2 - 1.6)); frame.add(t); }
  const hop = mesh(new THREE.CylinderGeometry(1.2, 0.3, 1.6, 4), mat(C.metal), 'hopper'); hop.position.set(len / 2 - 2, 3.0, 0); frame.add(hop);
  const conv = mesh(new THREE.BoxGeometry(0.6, 0.3, 4), mat(C.metal)); conv.rotation.x = 0; conv.position.set(len / 2 - 2, 3.9, -1.5); frame.add(conv);
  const pipe = hcyl([vx, 0, -1.1], [-2, 0, -(V.span / 2 - 1.6)], 0.08, 2.0, mat(C.metal)); frame.add(pipe);
  const lamp = mesh(new THREE.BoxGeometry(len - 2, 0.05, 0.3), mat(0xfff0d0, { emis: 0xfff0d0 })); lamp.position.set(0, V.h - 0.3, 0); frame.add(lamp);
  grp.userData.frame = frame; return grp;
}
function hubL2Interior() {
  const H = L.hub, grp = new THREE.Group(); grp.userData.tag = 'l2Int';
  const y0 = H.decks[1], y1 = H.roofY, W = H.l2Windows, wallM = mat(C.interior);
  // 24-gon wall with an arched opening at bearing 0
  const n = 24, R = H.r - 0.25;
  for (let i = 0; i < n; i++) {
    const b = i * 360 / n; if (b === 0) continue;
    const segW = 2 * R * Math.tan(Math.PI / n) + 0.02;
    const p = mesh(new THREE.BoxGeometry(segW, y1 - y0, 0.25), wallM); const [x, , z] = P(b, R); p.position.set(x, (y0 + y1) / 2, z); p.rotation.y = -b * D2R; grp.add(p);
  }
  const segW = 2 * R * Math.tan(Math.PI / n) + 0.02;
  const winFrame = new THREE.Group(); const [wx, , wz] = P(0, R); winFrame.position.set(wx, 0, wz); grp.add(winFrame);
  const below = mesh(new THREE.BoxGeometry(segW, W.sillY - y0, 0.25), wallM); below.position.y = (y0 + W.sillY) / 2; winFrame.add(below);
  const topY = W.sillY + W.h + W.w / 2; const above = mesh(new THREE.BoxGeometry(segW, y1 - topY, 0.25), wallM); above.position.y = (topY + y1) / 2; winFrame.add(above);
  for (const s of [-1, 1]) { const side = mesh(new THREE.BoxGeometry((segW - W.w) / 2, topY - W.sillY, 0.25), wallM); side.position.set(s * (W.w / 2 + (segW - W.w) / 4), (W.sillY + topY) / 2, 0); winFrame.add(side); }
  const ol = lines(arch(W.w, W.h)); ol.position.set(0, W.sillY, 0.13); winFrame.add(ol);
  const sill = mesh(new THREE.BoxGeometry(W.w + 0.3, 0.06, 0.45), mat(C.wood), 'sill'); sill.position.set(0, W.sillY, 0.12); winFrame.add(sill);
  const cup = mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.08, 16), mat(0xe9e4d8), 'teacup'); cup.position.set(0.18, W.sillY + 0.07, 0.18); winFrame.add(cup);
  const fl = mesh(new THREE.CircleGeometry(H.r, 40), mat(C.floor)); fl.rotation.x = -Math.PI / 2; fl.position.y = y0 + 0.01; grp.add(fl);
  const ce = mesh(new THREE.CircleGeometry(H.r, 40), mat(C.interior)); ce.rotation.x = Math.PI / 2; ce.position.y = y1 - 0.01; grp.add(ce);
  const jade = mannequin('stand'); jade.position.set(-0.45, y0, -(R - 0.75)); jade.rotation.y = Math.PI / 2; grp.add(jade);
  return grp;
}
export function mannequin(pose = 'stand', col = C.crewShirt) {
  const grp = new THREE.Group(); grp.userData.tag = 'crew';
  const sk = mat(0xd8c0a8), sh = mat(col), tr = mat(0x3d434c);
  const seated = pose === 'sit';
  const hip = seated ? 0.48 : 0.92;
  for (const s of [-1, 1]) {
    if (seated) { const th = mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.45, 8), tr); th.rotation.z = Math.PI / 2; th.position.set(0.22, hip, s * 0.1); grp.add(th);
      const sh2 = mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.46, 8), tr); sh2.position.set(0.45, 0.23, s * 0.1); grp.add(sh2); }
    else { const lg = mesh(new THREE.CylinderGeometry(0.08, 0.06, hip, 8), tr); lg.position.set(0, hip / 2, s * 0.1); grp.add(lg); }
  }
  const lean = pose === 'lean' ? 0.25 : 0;
  const torso = mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.58, 10), sh); torso.position.set(lean * 0.3, hip + 0.3, 0); torso.rotation.z = -lean; grp.add(torso);
  const head = mesh(new THREE.SphereGeometry(0.115, 14, 10), sk); head.position.set(lean * 0.6, hip + 0.73, 0); grp.add(head);
  const sy = hip + 0.55;
  for (const s of [-1, 1]) {
    const arm = mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.62, 6), sh);
    const raised = (pose === 'cup' && s === 1) || (pose === 'touch' && s === 1);
    if (raised) { arm.position.set(0.12, sy + 0.25, s * 0.2); arm.rotation.z = -0.45; }
    else if (seated || pose === 'lean') { arm.position.set(0.25, sy - 0.15, s * 0.2); arm.rotation.z = Math.PI / 2.6; }
    else { arm.position.set(0, sy - 0.3, s * 0.21); }
    grp.add(arm);
    if (pose === 'cup' && s === 1) { const cup = mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.1, 10), mat(0xe9e4d8)); cup.position.set(0.27, sy + 0.58, s * 0.2); grp.add(cup); }
  }
  grp.traverse((o) => { o.userData.noEdges = true; });
  // mannequin local +x = facing direction
  return grp;
}
function earth() { const e = mesh(new THREE.SphereGeometry(1, 48, 24), mat(C.earth)); e.userData.tag = 'earth'; e.userData.noEdges = true; return e; }

// ------------------------------------------------------------------ assemble
export function buildScene(state) {
  const scene = new THREE.Scene();
  const padW = state.compress ? L.compressed.pad : L.pad, reacW = state.compress ? L.compressed.reactor : L.reactor;
  const parts = {};
  if (state.compress) { const fg = mesh(new THREE.CircleGeometry(4000, 64), mat(C.ground), 'terrain'); fg.rotation.x = -Math.PI / 2; fg.userData.noEdges = true; parts.terrain = fg; }
  else parts.terrain = terrain();
  scene.add(parts.terrain);
  if (!state.compress) scene.add(malapert());
  if (state.footprints) scene.add(footprints());
  if (state.hub) { parts.hub = hub(state); scene.add(parts.hub); }
  if (state.modules) { scene.add(arms()); scene.add(modules(state)); }
  scene.add(mounds(state));
  for (const b of L.masts.bearings) {
    const d = state.masts === 'all' ? 1 : (state.masts[b] ?? 0);
    if (d > 0 || state.mastBases) scene.add(mast(b, d, state.sunBearing ?? 200));
  }
  if (state.comms) scene.add(commsTower());
  scene.add(reactor(state, reacW));
  scene.add(pad(state, padW));
  scene.add(roads(state, padW, reacW));
  if (state.lander) { const ln = lander(state.lander); const [x, , z] = P(padW.bearing, padW.r); const s = padW.scale ?? 1;
    const off = state.pad === 'done' ? [0, 0] : [0, -45 * s]; ln.position.set(x + off[0], padW.r < 500 ? 0 : height(x, z + off[1]), z + off[1]); ln.scale.setScalar(s); scene.add(ln); }
  if (state.printer && state.printer !== 'none') { const pr = printer(); const md = state.printer === 'parked' ? null : L.mounds[state.printer];
    if (md) { const [x, , z] = P(md.bearing, md.r); pr.position.set(x, 0, z); pr.rotation.y = -md.bearing * D2R + Math.PI / 2; } else { pr.position.set(...P(110, 64)); pr.scale.setScalar(0.8); }
    scene.add(pr); }
  if (state.rovers !== false) { const r1 = rover(); r1.position.set(...P(100, 50)); r1.rotation.y = -0.4; scene.add(r1); const r2 = rover(); r2.position.set(...P(160, 40)); r2.rotation.y = 1.1; scene.add(r2); }
  if (state.interior === 'galley' || state.interior === 'galleyScreen') scene.add(galleyInterior(8, state.interior === 'galley' ? 'table' : 'screen'));
  if (state.interior === 'isru') scene.add(isruInterior());
  if (state.interior === 'l2') scene.add(hubL2Interior());
  if (state.crewCupola) {
    const c = L.hub.cupola, spots = [[-2.2, 0.7], [-1.2, 1.4], [1.2, 1.4], [2.2, 0.7], [-1.7, -0.5], [-0.65, 0.1], [0.7, 0.0], [1.8, -0.6]]; // centre kept clear for Earth
    spots.forEach(([x, n], i) => { const m = mannequin(i % 3 === 1 ? 'stand' : 'cup'); m.position.set(x, c.floorY, -n); m.rotation.y = Math.PI / 2; scene.add(m); });
  }
  if (state.psrDrill) {
    const ps = P(L.psr.bearing, L.psr.r); const y = height(ps[0], ps[2]);
    const rig = new THREE.Group(); rig.position.set(ps[0] + 3, y, ps[2]); scene.add(rig);
    const mm = mat(C.metal); const pts = [];
    for (let i = 0; i < 3; i++) { const a = i * 120 * D2R; pts.push(0.9 * Math.cos(a), 0, 0.9 * Math.sin(a), 0, 2.4, 0); }
    rig.add(lines(pts)); const aug = mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), mm, 'auger'); aug.position.y = 1.1; rig.add(aug);
    for (let i = 0; i < 3; i++) { const a = i * 120 * D2R; const lg = mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 5), mm); lg.position.set(0.45 * Math.cos(a), 1.2, 0.45 * Math.sin(a)); lg.lookAt(0, 2.4, 0); lg.rotateX(Math.PI / 2); rig.add(lg); }
    const ar = mannequin('sit', C.suit); ar.position.set(ps[0] + 1.6, y, ps[2] + 0.3); ar.rotation.y = 0; scene.add(ar);
  }
  // edges for every solid mesh (not terrain, mounds, mannequins…)
  const edgeM = lineMat(); const add = [];
  scene.traverse((o) => { if (o.isMesh && !o.userData.noEdges && !o.userData.glass) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 28), edgeM); e.userData.isLine = true; add.push([o, e]); } });
  for (const [o, e] of add) o.add(e);
  parts.earth = earth(); scene.add(parts.earth);
  scene.userData.parts = parts;
  return scene;
}
