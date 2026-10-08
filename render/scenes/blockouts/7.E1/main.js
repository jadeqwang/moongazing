// 7.E1 toast blockout renderer: window.renderView(id, mode) -> PNG data URL. mode: 'line' | 'flat' | 'depth' | 'label'.
// The station, terrain, masts and Earth are the canonical guanghan3d model (stage 5); the sky is toast.js SKY;
// this file only adds the eight figures (toast.js), the bench and the closed sun-side shutter petals.
import * as THREE from 'three';
import { L, dirFrom, STAGES } from '../../guanghan3d/layout.js';
import { U, buildScene, setLights, mat } from '../../guanghan3d/build.js';
import { CREW, VIEWS, SKY, buildCrew, FLOOR } from './toast.js';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080);
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const gbuf = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
const edgeMat = new THREE.ShaderMaterial({
  transparent: true, depthTest: false, depthWrite: false,
  uniforms: { tG: { value: gbuf.texture }, uPx: { value: new THREE.Vector2(1 / W, 1 / H) }, uNT: { value: 0.3 }, uDT: { value: 0.06 } },
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

const SUN = { bearing: SKY.sunBearing, elev: SKY.sunElev };
const scene = buildScene({ ...STAGES[5], sunBearing: SUN.bearing });
scene.traverse((o) => { if (o.userData.glass) o.visible = false; });
// the sun-side petals of the cupola shutter are closed (sun at 200°, 1° up: glare); the north half stays open to Earth
{
  const c = L.hub.cupola, domeH = c.topY - c.sillY;
  const geo = new THREE.SphereGeometry(c.r * 1.01, 32, 16, 0, Math.PI, 0, Math.PI / 2); geo.scale(1, domeH / c.r, 1);   // phi 0..π = the +z (south) half
  const sh = new THREE.Mesh(geo, mat(0x4a4f5c)); sh.position.y = c.sillY; sh.rotation.y = 0; sh.userData.tag = 'southShutter'; scene.add(sh);
}
let crew = null, crewRaise = null;
function setRaise(r, v = {}, id = '') { const key = r + '|' + (v.hands ? id : ''); if (crewRaise === key) return; if (crew) scene.remove(crew); crew = buildCrew(r, v.hands ? v : {}); scene.add(crew); crewRaise = key; }

function camFor(v) {
  if (v.ortho) {
    const w = v.ortho, h = w / (W / H), cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 50);
    cam.position.set(0, FLOOR + 2.6, 0.001); cam.up.set(0, 0, -1); cam.lookAt(0, FLOOR, 0); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return cam;
  }
  const vfov = 2 * Math.atan(Math.tan((v.hfov * Math.PI) / 360) / (W / H)) * 180 / Math.PI;
  const cam = new THREE.PerspectiveCamera(vfov, W / H, 0.05, 4e5);
  cam.position.set(v.pos[0], v.pos[1], -v.pos[2]); cam.lookAt(v.target[0], v.target[1], -v.target[2]);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return cam;
}
function setup(id, mode = 'label') {
  const v = VIEWS[id]; setRaise(v.raise ?? 1, v, id);
  const cam = camFor(v);
  scene.traverse((o) => { if (o.userData.tag === 'southShutter') o.visible = !v.ortho; });
  U.uSunDir.value.set(...dirFrom(SUN.bearing, SUN.elev)); U.uSunOn.value = 1; U.uAmb.value = 0.32; U.uShadowY.value = -1e9; U.uSpOn.value = 0;
  setLights(true);
  // earthlight: a soft blue-white source out through the north glass, at Earth's elevation; a faint warm floor light
  U.uPtPos.value.set(0, 8.4, -9); U.uPtCol.value.set(1.3, 1.6, 2.1); U.uPtRange.value = 18;
  U.uPt2Pos.value.set(0, 7.0, 1.5); U.uPt2Col.value.set(0.3, 0.24, 0.16); U.uPt2Range.value = 5;
  const earth = scene.userData.parts.earth, D = 2.5e5, dir = dirFrom(L.earth.bearing, SKY.earthElev);
  earth.position.set(cam.position.x + dir[0] * D, cam.position.y + dir[1] * D, cam.position.z + dir[2] * D);
  earth.scale.setScalar(D * Math.tan((SKY.earthDiam / 2) * Math.PI / 180)); earth.visible = !v.ortho && mode === 'label';   // guides for the image model carry NO Earth (drawn in JS)
  U.uLogNear.value = 0.5; U.uLogFar.value = 600;
  return { v, cam };
}
const setLinesVisible = (vis) => scene.traverse((o) => { if (o.userData.isLine) o.visible = vis; });

// where the Earth sits in this view: centre and radius as fractions of the frame (x right, y down; r of the WIDTH)
function earthUV(cam, v) {
  if (v.ortho) return null;
  const dir = dirFrom(L.earth.bearing, SKY.earthElev), D = 1e5;
  const c = new THREE.Vector3(cam.position.x + dir[0] * D, cam.position.y + dir[1] * D, cam.position.z + dir[2] * D);
  const up = c.clone().add(new THREE.Vector3(0, D * Math.tan((SKY.earthDiam / 2) * Math.PI / 180), 0));
  const a = c.clone().project(cam), b = up.clone().project(cam);
  if (a.z > 1 || Math.abs(a.x) > 1.3 || Math.abs(a.y) > 1.3) return { inFrame: false };
  const x = (a.x + 1) / 2, y = (1 - a.y) / 2, ry = Math.abs(b.y - a.y) / 2;
  return { inFrame: Math.abs(a.x) < 1 && Math.abs(a.y) < 1, x: +x.toFixed(4), y: +y.toFixed(4), r: +(ry * H / W).toFixed(4) };
}

window.renderView = (id, mode) => {
  const { v, cam } = setup(id, mode);
  renderer.setRenderTarget(null);
  if (mode === 'line') {
    U.uMode.value = 2; setLinesVisible(false);
    renderer.setRenderTarget(gbuf); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    U.uMode.value = 3; setLinesVisible(true);
    renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.render(scene, cam);
    renderer.autoClear = false; renderer.render(quadScene, quadCam); renderer.autoClear = true;
  } else if (mode === 'depth') {
    U.uMode.value = 1; setLinesVisible(false); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, cam);
  } else if (mode === 'noarms') {
    // the flat render without the cup arms (the difference to 'flat' is a matte of the arms, hands and cups)
    const hid = []; scene.traverse((o) => { if (o.userData.cupArm && o.visible) { o.visible = false; hid.push(o); } });
    U.uMode.value = 0; setLinesVisible(true); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, cam);
    hid.forEach((o) => { o.visible = true; });
  } else {
    U.uMode.value = 0; setLinesVisible(true); renderer.setClearColor(v.ortho ? 0x202020 : 0x000000, 1); renderer.clear(); renderer.render(scene, cam);
  }
  if (mode !== 'label') return canvas.toDataURL('image/png');
  // names at the heads + Earth marker: for checking who is where (never given to the image model)
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const g = c2.getContext('2d');
  g.drawImage(canvas, 0, 0); g.font = `${Math.round(H / 45)}px sans-serif`; g.textAlign = 'center';
  const J = crew.userData.joints;
  for (const p of CREW) {
    const h = J[p.id].headC.clone().add(new THREE.Vector3(0, 0.2, 0)).project(cam); if (h.z > 1) continue;
    const x = (h.x + 1) / 2 * W, y = (1 - h.y) / 2 * H;
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x - 60, y - H / 45, 120, H / 36); g.fillStyle = '#' + p.accent.toString(16).padStart(6, '0'); g.fillRect(x - 60, y + H / 120, 120, 4);
    g.fillStyle = '#fff'; g.fillText(`${p.name} ${Math.round(p.h * 100)}`, x, y);
  }
  const e = earthUV(cam, v);
  if (e && e.inFrame) { g.strokeStyle = '#4af'; g.lineWidth = 2; g.beginPath(); g.arc(e.x * W, e.y * H, e.r * W + 6, 0, Math.PI * 2); g.stroke(); }
  g.textAlign = 'left'; g.fillStyle = '#fff'; g.fillText(`${id} · ${v.label} · raise ${v.raise ?? 1}`, 16, H - 16);
  return c2.toDataURL('image/png');
};
// numbers for the record: camera, Earth uv, and sight-line / toast-height checks at this view's raise
window.viewInfo = (id) => {
  const { v, cam } = setup(id); const J = crew.userData.joints;
  const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
  const people = CREW.map((p) => { const j = J[p.id];
    const uv = j.headC.clone().project(cam);
    return { id: p.id, h: p.h, seated: !!p.seated, eyeY: +(j.eye.y - FLOOR).toFixed(2), cupY: j.cup ? +(j.cup.y - FLOOR).toFixed(2) : null,
      cupAboveEye: j.cup ? +(j.cup.y - j.eye.y).toFixed(2) : null,
      elbowDeg: j.cupSide ? +(Math.acos(j.sh[j.cupSide].clone().sub(j.elbow[j.cupSide]).normalize().dot(j.hand[j.cupSide].clone().sub(j.elbow[j.cupSide]).normalize())) * 180 / Math.PI).toFixed(0) : null,
      headUV: uv.z < 1 ? [+((uv.x + 1) / 2).toFixed(3), +((1 - uv.y) / 2).toFixed(3)] : null }; });
  return { id, label: v.label, raise: v.raise ?? 1, pos: v.pos || null, target: v.target || null, hfov: v.hfov || null,
    bearing: v.ortho ? null : +(((Math.atan2(fwd.x, -fwd.z) * 180 / Math.PI) + 360) % 360).toFixed(1), pitch: v.ortho ? null : +(Math.asin(fwd.y) * 180 / Math.PI).toFixed(1),
    earth: earthUV(cam, v), people, grips: v.hands ? Object.fromEntries(CREW.filter((p) => J[p.id].gripRep).map((p) => { const j = J[p.id], f = (q) => { const u = q.clone().project(cam); return [+((u.x + 1) / 2).toFixed(3), +((1 - u.y) / 2).toFixed(3)]; };
      return [p.id, { ...j.gripRep, cupUV: f(j.cup), wristUV: f(j.grip.wrist), thumbTipUV: f(j.grip.thumbTip), fingerTipUV: f(j.grip.tip) }]; })) : undefined };
};
window.viewIds = () => Object.keys(VIEWS);
window.__ready = Promise.resolve(true);
