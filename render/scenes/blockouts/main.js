// Staging blockouts: window.renderScene(id, cam, { labels, lines }) -> PNG data URL; window.analyse(id) -> who can see
// what (sight lines to every screen, obliquity, occlusion, head turn, arms behind the body) and what each camera sees
// (face angle and visibility per person, the screen's angle, visible fraction and its four corners in px).
import * as THREE from 'three';
import { CREW, buildFigure, buildTablet } from './mannequin.js';
import { SCENES } from './scenes.js';
import { buildToyDog } from './toy_dog.js';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080);
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
const V = (a) => new THREE.Vector3(...a), deg = (r) => r * 180 / Math.PI;
const texCache = new Map();
function tex(url) { if (!texCache.has(url)) texCache.set(url, new Promise((res, rej) => new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, rej))); return texCache.get(url); }

function setPiece(s) {
  const m = new THREE.MeshLambertMaterial({ color: s.color ?? 0x56618a, side: s.inside ? THREE.BackSide : THREE.FrontSide, transparent: !!s.opacity, opacity: s.opacity ?? 1 });
  let o;
  if (s.type === 'box') o = new THREE.Mesh(new THREE.BoxGeometry(...s.size), m);
  else if (s.type === 'cyl') o = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r2 ?? s.r, s.h, 40, 1, !!s.open, s.t0 ?? 0, s.arc ?? Math.PI * 2), m);
  else if (s.type === 'ball') o = new THREE.Mesh(new THREE.SphereGeometry(s.r, 24, 16), m);
  else if (s.type === 'toydog') { o = buildToyDog(s.pose || {}); if (s.yaw) o.rotation.y = s.yaw * Math.PI / 180; o.position.x = (s.at || [0, 0, 0])[0]; o.position.z = (s.at || [0, 0, 0])[2]; s = { ...s, at: [o.position.x, o.position.y, o.position.z] }; return o; }
  else if (s.type === 'hull') { // a module: ribbed cylinder of radius r along the local z axis, seen from inside
    o = new THREE.Group();
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, s.len, 48, 1, true), new THREE.MeshLambertMaterial({ color: s.color ?? 0x3a4670, side: THREE.BackSide })); sh.rotation.x = Math.PI / 2; o.add(sh);
    for (let z = -s.len / 2; z <= s.len / 2 + 1e-6; z += s.rib ?? 1.2) { const r = new THREE.Mesh(new THREE.TorusGeometry(s.r - 0.04, 0.035, 6, 48), new THREE.MeshLambertMaterial({ color: 0xc9a660 })); r.position.z = z; o.add(r); }
    const fl = new THREE.Mesh(new THREE.BoxGeometry(s.floorW ?? 3.5, 0.05, s.len), new THREE.MeshLambertMaterial({ color: 0x2c3558 })); fl.position.y = -(s.cy ?? 1.25); o.add(fl);
  }
  o.position.set(...(s.at || [0, 0, 0])); if (s.rot) o.rotation.set(...s.rot.map((d) => d * Math.PI / 180));
  o.traverse((x) => { x.userData.tag = x.userData.tag || 'set'; x.userData.set = s.name || s.type; });
  return o;
}

const built = new Map();
async function build(id) {
  if (built.has(id)) return built.get(id);
  const S = SCENES[id]; if (!S) throw new Error('no scene ' + id);
  const scene = new THREE.Scene(); scene.background = S.bg === null ? null : new THREE.Color(S.bg ?? 0x1c2544);
  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x4a4a60, 1.5));
  const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(...(S.sun || [1.5, 4, 3])); scene.add(dl);
  (S.set || []).forEach((s) => scene.add(setPiece(s)));
  const tablets = {};
  for (const t of S.tablets || []) { const map = t.img ? await tex(t.img) : null; const g = buildTablet({ ...t, map }); tablets[g.userData.id] = g; scene.add(g);
    if (t.glow !== 0) { const pl = new THREE.PointLight(t.glowColor ?? 0xffe2b0, t.glow ?? 0.5, 2.2, 1.6); pl.position.copy(g.userData.at).addScaledVector(g.userData.n, 0.12); scene.add(pl); } }
  let figs = {};
  const mk = (pass) => {
    const ctx = { resolve(t, g) {
      if (Array.isArray(t)) return V(t);
      if (typeof t === 'string') { const [a, b] = t.split(':'); if (tablets[a]) return b ? tablets[a].userData.grip(b) : tablets[a].userData.at.clone();
        if (figs[a]) return figs[a].userData.P.eye ? figs[a].userData.P.head.clone() : figs[a].userData.P.head.clone();
        if (pass === 0) return g.userData.P.head.clone().addScaledVector(g.userData.P.fwd, 1); throw new Error('unknown target ' + t); }
      if (t.on) { if (!figs[t.on]) return g.userData.P.chest.clone().addScaledVector(g.userData.P.fwd, 0.3); const p = figs[t.on].userData.P[t.part].clone(); return p.add(V(t.off || [0, 0.045, 0])); }
      throw new Error('bad target');
    } };
    const out = {}; S.figures.forEach((f) => { out[f.who] = buildFigure(f, ctx); }); return out;
  };
  figs = mk(0); figs = mk(1); figs = mk(1);
  Object.values(figs).forEach((f) => scene.add(f));
  const b = { S, scene, figs, tablets }; built.set(id, b); return b;
}
function camFor(c) {
  const vf = 2 * Math.atan(Math.tan((c.hfov ?? 50) * Math.PI / 360) / (W / H));
  const cam = new THREE.PerspectiveCamera(deg(vf), W / H, 0.05, 80); cam.position.set(...c.pos); cam.lookAt(V(c.target)); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return cam;
}
const px = (p, cam) => { const v = p.clone().project(cam); return [+((v.x * 0.5 + 0.5) * W).toFixed(1), +((-v.y * 0.5 + 0.5) * H).toFixed(1), v.z < 1]; };
const HEADTAGS = new Set(['head', 'nose', 'eye', 'ear', 'glasses', 'hair']);
const SELFTOUCH = new Set(['mouth', 'chin', 'heart']);   // a hand at one's own face does not hide the screen from oneself

function firstHit(scene, from, to, skip) {
  const d = to.clone().sub(from), len = d.length(); const rc = new THREE.Raycaster(from, d.normalize(), 0.001, len - 0.004);
  for (const h of rc.intersectObjects(scene.children, true)) { if (skip && skip(h.object)) continue; return h.object; }
  return null;
}

async function analyse(id) {
  const { S, scene, figs, tablets } = await build(id); scene.updateMatrixWorld(true);
  const rep = { id, title: S.title, people: {}, screens: {}, cameras: {} };
  for (const [who, f] of Object.entries(figs)) { const P = f.userData.P; rep.people[who] = { headTurnDeg: P.headTurn, headPitchDeg: P.headPitch, arms: P.arms, eye: P.eye.toArray().map((x) => +x.toFixed(2)) }; }
  for (const [tid, t] of Object.entries(tablets)) {
    const u = t.userData, cs = u.corners(), viewers = (S.viewers && S.viewers[tid]) || Object.keys(figs), r = rep.screens[tid] = {};
    for (const who of viewers) {
      const P = figs[who].userData.P, to = P.eye.clone().sub(u.at), dist = to.length();
      const obl = deg(Math.acos(THREE.MathUtils.clamp(to.clone().normalize().dot(u.n), -1, 1)));
      let vis = 0, blockers = new Set(); const N = 5;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const a = (i + 0.5) / N, b = (j + 0.5) / N, top = cs[0].clone().lerp(cs[1], a), bot = cs[3].clone().lerp(cs[2], a), p = top.lerp(bot, b);
        const hit = firstHit(scene, P.eye.clone(), p, (o) => (o.userData.who === who && (HEADTAGS.has(o.userData.tag) || /^(hand|forearm)/.test(o.userData.tag) && SELFTOUCH.has(figs[who].userData.spec[o.userData.tag.slice(-1)]))) || o.userData.tag === 'screen');
        if (!hit) vis++; else blockers.add(hit.userData.who ? `${hit.userData.who}.${hit.userData.tag}` : (hit.userData.set || hit.userData.tag));
      }
      // is the person actually looking at it? angle between the face direction and the eye -> screen direction
      const gaze = deg(Math.acos(THREE.MathUtils.clamp(P.gaze.dot(to.clone().normalize().negate()), -1, 1)));
      r[who] = { distM: +dist.toFixed(2), obliquityDeg: +obl.toFixed(0), seesFront: obl < 90, visibleFrac: +(vis / (N * N)).toFixed(2), blockedBy: [...blockers], gazeOffDeg: +gaze.toFixed(0),
        verdict: obl >= 90 ? 'CANNOT SEE (behind the screen)' : obl > 60 ? 'too oblique' : vis / (N * N) < 0.8 ? 'partly blocked' : 'sees it' };
    }
  }
  for (const [cn, c] of Object.entries(S.cams)) rep.cameras[cn] = camReport({ S, scene, figs, tablets }, c);
  return rep;
}
function camReport({ S, scene, figs, tablets }, c) {
  {
    const cam = camFor(c), cp = cam.position.clone(), r = { people: {}, screens: {} };
    for (const [who, f] of Object.entries(figs)) {
      const P = f.userData.P, to = cp.clone().sub(P.head).normalize(), ang = deg(Math.acos(THREE.MathUtils.clamp(to.dot(P.face), -1, 1)));
      // sample the face itself when it is turned our way (eyes, nose, mouth, cheeks), else the head as a whole
      let vis = 0; const facing = ang < 100, pts = facing ? [[0.33, 0.12], [-0.33, 0.12], [0, -0.12], [0, -0.5], [0.5, -0.25], [-0.5, -0.25], [0, 0.45]] : [[0, 0], [0.55, 0], [-0.55, 0], [0, 0.55], [0, -0.55]];
      const upV = new THREE.Vector3(0, 1, 0), fr = new THREE.Vector3().crossVectors(P.face, upV).normalize();
      const camR = facing ? fr : new THREE.Vector3().crossVectors(to, upV).normalize(), outV = facing ? P.face : to, blockers = new Set();
      for (const [a, b] of pts) { const p = P.head.clone().addScaledVector(camR, a * P.headR).addScaledVector(upV, b * P.headR).addScaledVector(outV, P.headR * (facing ? 1.0 : 0.9));
        const hit = firstHit(scene, cp, p, (o) => o.userData.who === who && HEADTAGS.has(o.userData.tag)); if (!hit) vis++; else blockers.add(hit.userData.who ? `${hit.userData.who}.${hit.userData.tag}` : (hit.userData.set || hit.userData.tag)); }
      const [x, y, front] = px(P.head, cam);
      r.people[who] = { faceAngleDeg: +ang.toFixed(0), view: ang < 25 ? 'front' : ang < 65 ? 'three-quarter' : ang < 105 ? 'profile' : ang < 140 ? 'three-quarter back' : 'back', headVisibleFrac: +(vis / pts.length).toFixed(2), blockedBy: [...blockers], headPx: [x, y], inFrame: front && x > 0 && x < W && y > 0 && y < H };
    }
    for (const [tid, t] of Object.entries(tablets)) {
      const u = t.userData, to = cp.clone().sub(u.at).normalize(), ang = deg(Math.acos(THREE.MathUtils.clamp(to.dot(u.n), -1, 1))), cs = u.corners();
      let vis = 0; const N = 5;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const a = (i + 0.5) / N, b = (j + 0.5) / N, p = cs[0].clone().lerp(cs[1], a).lerp(cs[3].clone().lerp(cs[2], a), b);
        if (!firstHit(scene, cp, p, (o) => o.userData.tag === 'screen')) vis++; }
      r.screens[tid] = { angleDeg: +ang.toFixed(0), shows: ang < 90 ? 'screen' : 'back of the device', visibleFrac: ang < 90 ? +(vis / (N * N)).toFixed(2) : 0, cornersPx: cs.map((p) => px(p, cam).slice(0, 2)) };
    }
    return r;
  }
}
// brute-force camera search: the best places from which the focal person's face AND the screen both read.
//   o: { focal: who, screen: id, x: [a, b, n], y: [...], z: [...], hfov, also: [who...] (must stay visible) }
async function searchCam(id, o) {
  const b = await build(id); b.scene.updateMatrixWorld(true);
  const t = b.tablets[o.screen || 'tablet'].userData.at, f = b.figs[o.focal].userData.P.head, tg = t.clone().lerp(f, 0.55).toArray(), out = [];
  const lin = ([a, c, n]) => Array.from({ length: n }, (_, i) => a + (c - a) * (n === 1 ? 0 : i / (n - 1)));
  for (const x of lin(o.x)) for (const y of lin(o.y)) for (const z of lin(o.z)) {
    const c = { pos: [x, y, z], target: o.target || tg, hfov: o.hfov || 36 }, r = camReport(b, c), p = r.people[o.focal], s = r.screens[o.screen || 'tablet'];
    if (!p.inFrame || s.angleDeg >= 88) continue;
    const face = (o.profileOK ? (p.faceAngleDeg < (o.maxFace ?? 88) ? 0.8 : 0) : Math.max(0, Math.cos(Math.min(p.faceAngleDeg, 90) * Math.PI / 180))) * p.headVisibleFrac, scr = Math.cos(s.angleDeg * Math.PI / 180) * s.visibleFrac;
    let pen = 1; for (const w of o.also || []) pen *= 0.4 + 0.6 * r.people[w].headVisibleFrac;
    out.push({ pos: c.pos.map((v) => +v.toFixed(2)), score: +(Math.min(face, o.faceCap ?? 0.8) * 1.0 + Math.min(scr, o.scrCap ?? 0.75) * (o.wScreen ?? 1.0)).toFixed(3) * pen, face: p.faceAngleDeg, faceVis: p.headVisibleFrac, screen: s.angleDeg, screenVis: s.visibleFrac });
  }
  return out.sort((a, c) => c.score - a.score).slice(0, o.top || 8);
}
window.searchCam = searchCam;

async function renderScene(id, camName, o = {}) {
  const { S, scene, figs, tablets } = await build(id); const cam = camFor(S.cams[camName]);
  const extra = new THREE.Group();
  if (o.lines) for (const [tid, t] of Object.entries(tablets)) for (const who of ((S.viewers && S.viewers[tid]) || [])) {
    const g = new THREE.BufferGeometry().setFromPoints([figs[who].userData.P.eye, t.userData.at]); extra.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffe14a })));
  }
  scene.add(extra); renderer.render(scene, cam); scene.remove(extra);
  if (!o.labels) return canvas.toDataURL('image/png');
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const g = c2.getContext('2d'); g.drawImage(canvas, 0, 0);
  g.font = '600 26px sans-serif'; g.textAlign = 'center';
  for (const [who, f] of Object.entries(figs)) { const P = f.userData.P, [x, y, front] = px(P.head.clone().add(new THREE.Vector3(0, P.headR * 1.7, 0)), cam); if (!front) continue;
    const s = CREW[who].name; const w = g.measureText(s).width + 16; g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(x - w / 2, y - 26, w, 34); g.fillStyle = '#fff'; g.fillText(s, x, y); }
  g.textAlign = 'left'; g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(0, H - 44, W, 44); g.fillStyle = '#ffe9a8'; g.fillText(`${id} · ${camName} · ${S.title || ''}`, 16, H - 13);
  return c2.toDataURL('image/png');
}

window.renderScene = renderScene; window.analyse = analyse;
window.sceneList = () => Object.entries(SCENES).map(([id, s]) => ({ id, cams: Object.keys(s.cams), hero: s.hero || Object.keys(s.cams)[0] }));
window.__ready = Promise.resolve(true);
