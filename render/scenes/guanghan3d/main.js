// Guanghan Station guide renderer: window.renderShot(id, mode) -> PNG data URL. mode: 'line' | 'depth' | 'flat'.
import * as THREE from 'three';
import { L, P, dirFrom } from './layout.js';
import { U, buildScene, height, setLights } from './build.js';
import { SHOTS, SHOT } from './shots.js';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080);
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const gbuf = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });

const edgeMat = new THREE.ShaderMaterial({
  transparent: true, depthTest: false, depthWrite: false,
  uniforms: { tG: { value: gbuf.texture }, uPx: { value: new THREE.Vector2(1 / W, 1 / H) }, uNT: { value: 0.22 }, uDT: { value: 0.06 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: /* glsl */`
    uniform sampler2D tG; uniform vec2 uPx; uniform float uNT; uniform float uDT; varying vec2 vUv;
    vec4 G(vec2 o){ return texture2D(tG, vUv + o * uPx); }
    void main(){
      vec4 c = G(vec2(0.)); vec3 n0 = c.rgb * 2. - 1.; float w0 = c.a; float e = 0.;
      vec2 offs[4]; offs[0] = vec2(1.,0.); offs[1] = vec2(0.,1.); offs[2] = vec2(1.,1.); offs[3] = vec2(1.,-1.);
      for (int i = 0; i < 4; i++) {
        vec4 a = G(offs[i]), b = G(-offs[i]);
        e = max(e, step(uNT, 1. - dot(n0, a.rgb * 2. - 1.)));
        e = max(e, step(uNT, 1. - dot(n0, b.rgb * 2. - 1.)));
        float lap = abs(a.a + b.a - 2. * w0); float ref = max(max(w0, a.a), b.a);
        e = max(e, step(uDT, lap / max(ref, 1e-12)));
      }
      gl_FragColor = vec4(0., 0., 0., e);
    }`,
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), edgeMat); quad.frustumCulled = false;
const quadScene = new THREE.Scene(); quadScene.add(quad); const quadCam = new THREE.Camera();

const FRAMES = { galley: 'galleyInt', isru: 'isruInt', greenhouse: 'greenInt' };
const cache = new Map();
function sceneFor(shot) {
  const key = JSON.stringify(shot.state) + (shot.sun?.bearing ?? '');
  if (!cache.has(key)) cache.set(key, buildScene({ ...shot.state, sunBearing: shot.sun?.bearing ?? 200 }));
  return cache.get(key);
}
function findTag(scene, tag) { let f = null; scene.traverse((o) => { if (!f && o.userData.tag === tag) f = o; }); return f; }

function rimPoint() { // highest point of the Shackleton rim along bearing 080
  let best = null;
  for (let r = 1500; r <= 4500; r += 10) { const [x, , z] = P(L.shackleton.bearing, r); const h = height(x, z); if (!best || h > best.h) best = { r, x, z, h }; }
  return best;
}

function camera(shot, scene) {
  const c = shot.cam, aspect = W / H;
  let cam;
  if (c.ortho || c.orthoTop) {
    const w = c.ortho || c.orthoTop, h = w / aspect;
    cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 1, 3000);
    const t = new THREE.Vector3(...c.target);
    if (c.orthoTop) { cam.position.set(t.x, 1000, t.z + 1e-3); cam.up.set(0, 0, -1); }
    else { const d = dirFrom(c.from.bearing, c.from.elev); cam.position.set(t.x + d[0] * 800, t.y + d[1] * 800, t.z + d[2] * 800); }
    cam.lookAt(t); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const dist = cam.position.distanceTo(t); return { cam, near: Math.max(1, dist - 400), far: dist + 300 };
  }
  const vfov = 2 * Math.atan(Math.tan((c.hfov * Math.PI) / 360) / aspect) * 180 / Math.PI;
  cam = new THREE.PerspectiveCamera(vfov, aspect, 0.03, 4e5);
  if (c.top) { cam.position.set(c.center[0], c.top, c.center[2] + 1e-3); cam.up.set(0, 0, -1); cam.lookAt(c.center[0], 0, c.center[2]); }
  else if (c.rim) {
    const r = rimPoint(); const jade = new THREE.Vector3(r.x, r.h, r.z);
    shot._rim = r;
    const back = P(L.shackleton.bearing + 180 + 25, 2.6); // behind her (toward the base side), a little to her left
    cam.position.set(r.x + back[0], height(r.x + back[0], r.z + back[2]) + 2.0, r.z + back[2]);
    const tgt = P(355, 400); cam.lookAt(r.x + tgt[0], r.h + 1.0 - 400 * Math.tan(2.2 * Math.PI / 180), r.z + tgt[2]);
  } else if (c.psr) {
    const ps = P(L.psr.bearing, L.psr.r); const y = height(ps[0], ps[2]);
    cam.position.set(ps[0] - 1.8, y + 1.25, ps[2] + 2.6); cam.lookAt(ps[0] + 3.0, y + 0.9, ps[2] - 0.5);
  } else if (c.array) {
    const g = findTag(scene, 'radioArray'); const F = g.userData.base; const [bx, , bz] = P(75, 8.5);
    cam.position.set(F.x + bx, height(F.x + bx, F.z + bz) + 1.5, F.z + bz);
    const d = dirFrom(260, c.pitch || 7); cam.lookAt(cam.position.x + d[0] * 100, cam.position.y + d[1] * 100, cam.position.z + d[2] * 100);
  } else if (c.frame) {
    const grp = findTag(scene, FRAMES[c.frame]); grp.updateMatrixWorld(true);
    const f = grp.userData.frame;
    cam.position.copy(f.localToWorld(new THREE.Vector3(...c.pos)).sub(new THREE.Vector3(0, f.position.y, 0)).add(new THREE.Vector3(0, f.position.y, 0)));
    cam.lookAt(f.localToWorld(new THREE.Vector3(...c.target)));
  } else if (c.world) { cam.position.set(...c.pos); cam.lookAt(...c.target); }
  else { cam.position.set(c.pos[0], height(c.pos[0], c.pos[2]) + c.pos[1], c.pos[2]);
    if (c.aimBearing !== undefined) { const d = dirFrom(c.aimBearing, c.pitch || 0); cam.lookAt(cam.position.x + d[0] * 100, cam.position.y + d[1] * 100, cam.position.z + d[2] * 100); }
    else cam.lookAt(...c.target); }
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return { cam, near: 0.3, far: shot.depthFar || 3000 };
}

function setup(shot) {
  const scene = sceneFor(shot);
  // reset visibility
  scene.traverse((o) => { if (o.userData._hidden) { o.visible = true; o.userData._hidden = false; } });
  for (const tag of shot.hide || []) scene.traverse((o) => { if (o.userData.tag === tag || (tag === 'glass' && o.userData.glass)) { o.visible = false; o.userData._hidden = true; } });
  const { cam, near, far } = camera(shot, scene);
  // sun
  const sun = shot.sun || { bearing: 200, elev: 1 };
  U.uSunDir.value.set(...dirFrom(sun.bearing, sun.elev));
  U.uSunOn.value = shot.sunOff ? 0 : 1;
  U.uAmb.value = shot.amb ?? (shot.sunOff ? 0.25 : 0.3);
  let sy = shot.shadowY ?? -1e9;
  if (sy === 'psr') { const ps = P(L.psr.bearing, L.psr.r); sy = height(ps[0], ps[2]) + L.psr.depth * 0.75; }
  if (sy === 'shack') { const sh = P(L.shackleton.bearing, L.shackleton.r); sy = height(sh[0], sh[2]) + 3500; }
  U.uShadowY.value = sy;
  setLights(!!shot.lights);
  // point lights
  const pts = shot.pts || [];
  const toW = (p) => {
    if (p.world) return new THREE.Vector3(...p.world);
    const grp = findTag(scene, FRAMES[shot.cam.frame]); grp.updateMatrixWorld(true); return grp.userData.frame.localToWorld(new THREE.Vector3(...p.local));
  };
  const p0 = pts[0], p1 = pts[1];
  U.uPtPos.value.copy(p0 ? toW(p0) : new THREE.Vector3(0, -1e6, 0)); U.uPtCol.value.set(...(p0 ? p0.col : [0, 0, 0])); U.uPtRange.value = p0 ? p0.range : 1;
  U.uPt2Pos.value.copy(p1 ? toW(p1) : new THREE.Vector3(0, -1e6, 0)); U.uPt2Col.value.set(...(p1 ? p1.col : [0, 0, 0])); U.uPt2Range.value = p1 ? p1.range : 1;
  // helmet lamp (PSR)
  U.uSpOn.value = shot.spot ? 1 : 0;
  if (shot.spot === 'array') { const F = findTag(scene, 'radioArray').userData.base; const pos = new THREE.Vector3(F.x, F.y + 2.6, F.z); U.uSpPos.value.copy(pos);
    const [tx, , tz] = P(260, 30); U.uSpDir.value.copy(new THREE.Vector3(F.x + tx, F.y, F.z + tz).sub(pos).normalize()); U.uSpCos.value = Math.cos(22 * Math.PI / 180); }
  else if (shot.spot) { const ps = P(L.psr.bearing, L.psr.r); const y = height(ps[0], ps[2]);
    const pos = new THREE.Vector3(ps[0] + 1.75, y + 1.0, ps[2] + 0.3); U.uSpPos.value.copy(pos);
    U.uSpDir.value.copy(new THREE.Vector3(ps[0] + 3.2, y, ps[2]).sub(pos).normalize()); U.uSpCos.value = Math.cos(28 * Math.PI / 180); }
  // Earth: 1.9° disc at bearing 000, elevation e, placed relative to the camera (it is effectively at infinity)
  const earth = scene.userData.parts.earth; const e = shot.earthElev ?? L.earth.elevNominal;
  const D = 2.5e5, dir = dirFrom(L.earth.bearing, e);
  earth.position.set(cam.position.x + dir[0] * D, cam.position.y + dir[1] * D, cam.position.z + dir[2] * D);
  earth.scale.setScalar(D * Math.tan((L.earth.diamDeg / 2) * Math.PI / 180));
  earth.visible = !shot.cam.top && !shot.cam.orthoTop && !shot.cam.ortho && !shot.noEarth;
  const moon = scene.userData.parts.moon;
  if (moon) { const cap = scene.userData.parts.capsule; const wp = cap.userData.windowPos.clone().addScaledVector(cap.userData.windowDir, 0.0);
    const dirM = wp.clone().sub(cam.position).normalize().add(new THREE.Vector3(0.02, 0.03, 0)).normalize(); const Dm = wp.distanceTo(cam.position) - 0.04; // drawn just inside the black pane
    moon.position.copy(cam.position).addScaledVector(dirM, Dm); moon.scale.setScalar(Dm * Math.tan(0.26 * Math.PI / 180) * (shot.moonScale || 1)); }
  U.uLogNear.value = shot.depthNear ?? near; U.uLogFar.value = far;
  return { scene, cam };
}

function setLinesVisible(scene, v) { scene.traverse((o) => { if (o.userData.isLine && !o.userData._hidden) o.visible = v; }); }

window.renderShot = (id, mode) => {
  const shot = SHOT[id];
  const { scene, cam } = setup(shot);
  renderer.setRenderTarget(null);
  if (mode === 'line') {
    edgeMat.uniforms.uNT.value = shot.edgeNT ?? 0.22; U.uMode.value = 2; setLinesVisible(scene, false);
    renderer.setRenderTarget(gbuf); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    U.uMode.value = 3; setLinesVisible(scene, true);
    renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.render(scene, cam);
    renderer.autoClear = false; renderer.render(quadScene, quadCam); renderer.autoClear = true;
  } else if (mode === 'depth') {
    U.uMode.value = 1; setLinesVisible(scene, false);
    renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, cam);
  } else {
    U.uMode.value = 0; setLinesVisible(scene, true);
    renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, cam);
  }
  return canvas.toDataURL('image/png');
};
window.shotInfo = () => SHOTS.map((s) => {
  const { cam } = setup(s); const c = s.cam;
  const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
  const bearing = ((Math.atan2(fwd.x, -fwd.z) * 180 / Math.PI) + 360) % 360, pitch = Math.asin(fwd.y) * 180 / Math.PI;
  const earth = setup(s).scene.userData.parts.earth; let earthPx = null;
  if (earth.visible) { const v = earth.position.clone().project(cam); if (Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05 && v.z < 1)
    earthPx = { x: +((v.x + 1) / 2).toFixed(4), y: +((1 - v.y) / 2).toFixed(4), dFrac: +(L.earth.diamDeg / (c.hfov || 1)).toFixed(4) }; }
  return { id: s.id, paper: s.paper, label: s.label, earth: earthPx, pos: cam.position.toArray().map((v) => +v.toFixed(2)), bearing: +bearing.toFixed(1), pitch: +pitch.toFixed(1),
    hfov: c.hfov ?? null, ortho: c.ortho || c.orthoTop || null, sun: s.sun || null, rim: s._rim ? { r: s._rim.r, h: +s._rim.h.toFixed(1) } : null };
});
window.__ready = Promise.resolve(true);
