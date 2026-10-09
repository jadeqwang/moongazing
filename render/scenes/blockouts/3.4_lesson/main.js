// 3.4 — the Copernican lesson, blocked out at true sizes (metres). One flashlight (the only light), a toy Moon and a
// toy Earth, two child mannequins (M 109 cm, T 132 cm), Jade (165 cm) behind the light, the living-room wall.
//   window.renderView(view, u, mode) -> PNG data URL.  view: 'wide' | 'side' | 'beam' | 'top';  u in 0..1 moves the
//   Moon ball across the beam (0 = just outside the Earth's disc as seen from the lamp, 1 = centred: total eclipse);
//   mode: 'lit' (flashlight only, shadow-mapped) | 'guide' (lit + a little fill + the beam and its shadow shafts drawn).
// Geometry facts the paintings must keep (window.facts() returns the numbers):
//   - the Moon's shadow is a cone that WIDENS behind the ball and lands on the globe as one dark round spot;
//   - the globe throws its own, bigger shadow onward; it lands on the wall as a plain dark ellipse inside the pool of
//     flashlight light (no ring, no corona); the boy's head and shoulders stand in the same pool;
//   - nothing behind an opaque ball is brighter than the open beam.
import * as THREE from 'three';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080);
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ---- layout (wall is the plane z = 0, the room is z > 0, x runs along the wall, y is up) ---------------------------
const TH = 32 * Math.PI / 180;                       // the beam meets the wall at 32 degrees
const dH = new THREE.Vector3(Math.cos(TH), 0, -Math.sin(TH));   // beam heading (horizontal part)
const nH = new THREE.Vector3(Math.sin(TH), 0, Math.cos(TH));    // horizontal normal of the beam, pointing into the room
const E = new THREE.Vector3(0, 0.95, 1.15), RE = 0.09;          // toy Earth: 18 cm
const LD = 1.47;                                                 // lens -> Earth centre
const Lp = E.clone().addScaledVector(dH, -LD).setY(1.0);       // flashlight lens
const axis = E.clone().sub(Lp).normalize();
const RM = 0.03, GAP = 0.24;                                    // toy Moon: 6 cm, 24 cm in front of the Earth
const LENS = 0.022;                                             // lens radius (penumbra)
const up = new THREE.Vector3(0, 1, 0);
const side = new THREE.Vector3().crossVectors(axis, up).normalize();   // = room side (camera-right when looking along the beam)
const moonAt = (u) => {
  // slides in from the upper room side of the beam to the Earth's sub-lamp line, ending a little off-centre so the
  // spot sits on the part of the globe the side camera can see
  const k = 1 - u;
  const c = Lp.clone().addScaledVector(axis, LD - GAP);
  return c.addScaledVector(side, 0.046 + 0.075 * k).addScaledVector(up, 0.008 + 0.035 * k);
};

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0906);
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, metalness: 0, ...o });
const add = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; scene.add(m); return m; };
// room
const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(12, 8), mat(0x6b4a2c)), false); floor.rotation.x = -Math.PI / 2; floor.position.set(0.5, 0, 3);
const wall = add(new THREE.Mesh(new THREE.PlaneGeometry(12, 3), mat(0xb89a64)), false); wall.position.set(0.5, 1.5, 0);
// low shelf along the wall (for scale), 45 cm high
const shelf = add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 0.4), mat(0x7a5a38))); shelf.position.set(-1.6, 0.225, 0.2);

function limb(a, b, r, m) {
  const d = b.clone().sub(a), len = d.length();
  const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len), 4, 10);
  const o = new THREE.Mesh(g, m); o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(up, d.clone().normalize()); return add(o);
}
// two-bone arm: shoulder -> hand, elbow dropped down/out
function arm(sh, hand, l1, l2, r, m, out, handR) {
  const d = hand.clone().sub(sh); const L = Math.min(d.length(), l1 + l2 - 1e-3); const dir = d.clone().normalize();
  const a = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const bend = new THREE.Vector3(0, -1, 0).addScaledVector(out, 0.5); bend.addScaledVector(dir, -bend.dot(dir)).normalize();
  const el = sh.clone().addScaledVector(dir, a).addScaledVector(bend, h);
  limb(sh, el, r, m); limb(el, sh.clone().addScaledVector(dir, L), r * 0.9, m);
  const hd = add(new THREE.Mesh(new THREE.SphereGeometry(handR ?? r * 1.25, 12, 10), mat(0xe6b99a))); hd.position.copy(sh.clone().addScaledVector(dir, L));
}
// a mannequin of height h standing at p (floor), facing f (unit, horizontal); head k x normal; hands at world points
function figure({ h, p, f, col, hair, headK = 1, hands, legCol, handR }) {
  const r = new THREE.Vector3().crossVectors(f, up).normalize();      // the figure's right
  const s = h / 1.65, hr = 0.105 * s * headK * (h < 1.4 ? 1.22 : 1);  // children: bigger heads
  const top = h, hc = new THREE.Vector3(p.x, top - hr, p.z);
  const head = add(new THREE.Mesh(new THREE.SphereGeometry(hr, 20, 16), mat(0xe6b99a))); head.position.copy(hc);
  const hairM = add(new THREE.Mesh(new THREE.SphereGeometry(hr * 1.04, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(hair))); hairM.position.copy(hc).addScaledVector(f, -hr * 0.12);
  const nose = add(new THREE.Mesh(new THREE.SphereGeometry(hr * 0.16, 8, 8), mat(0xd9a688))); nose.position.copy(hc).addScaledVector(f, hr * 0.98).setY(hc.y - hr * 0.1);
  const shY = top - 2 * hr - 0.03 * s, hipY = h * 0.5, shW = 0.17 * s * (h < 1.4 ? 1.1 : 1);
  const m = mat(col);
  limb(new THREE.Vector3(p.x, hipY + 0.05, p.z), new THREE.Vector3(p.x, shY - 0.05, p.z), shW * 0.78, m);
  const lm = mat(legCol ?? 0x2a2a33);
  for (const k of [-1, 1]) limb(new THREE.Vector3(p.x, 0.04, p.z).addScaledVector(r, k * shW * 0.5), new THREE.Vector3(p.x, hipY, p.z).addScaledVector(r, k * shW * 0.5), 0.05 * s + 0.01, lm);
  const l1 = 0.17 * h, l2 = 0.16 * h;
  [-1, 1].forEach((k, i) => { const sh = new THREE.Vector3(p.x, shY, p.z).addScaledVector(r, k * shW); if (hands[i]) arm(sh, hands[i], l1, l2, 0.032 * s + 0.008, m, r.clone().multiplyScalar(k), handR); });
  return { head: hc, hr, r };
}

// ---- the lesson -----------------------------------------------------------------------------------------------------
const earth = add(new THREE.Mesh(new THREE.SphereGeometry(RE, 48, 32), mat(0x3f7ea0))); earth.position.copy(E);
const moon = add(new THREE.Mesh(new THREE.SphereGeometry(RM, 32, 24), mat(0xcfcac0)));
// T (132 cm) stands behind the globe, facing the lamp, and holds the globe OUT at arm's length at chest height, so
// his face is above the globe's shadow (lit by the beam) and the globe's shadow crosses a gap before it lands on his chest
const Tp = E.clone().addScaledVector(dH, 0.40).setY(0);
const Tf = dH.clone().negate();
const Tr = new THREE.Vector3().crossVectors(Tf, up);
figure({ h: 1.32, p: Tp, f: Tf, col: 0x2f5f88, hair: 0x1c1512, headK: 1.12,
  hands: [E.clone().addScaledVector(Tr, -0.085).add(new THREE.Vector3(0, -0.055, 0)).addScaledVector(dH, 0.03), E.clone().addScaledVector(Tr, 0.085).add(new THREE.Vector3(0, -0.055, 0)).addScaledVector(dH, 0.03)] });
// M (109 cm) stands on the WALL side of the beam (never between the lamp and the globe), turned toward her brother,
// and reaches both hands up and across into the beam, the Moon ball on her fingertips
const group = new THREE.Group(); scene.add(group);
let mGroupObjs = [];
function buildM(u) {
  mGroupObjs.forEach((o) => { scene.remove(o); o.geometry.dispose(); }); mGroupObjs = [];
  const before = new Set(scene.children);
  const mc = moonAt(u); moon.position.copy(mc);
  const Mp = Lp.clone().addScaledVector(axis, LD - GAP - 0.20).addScaledVector(side, -0.30).setY(0);
  const Mf = mc.clone().sub(Mp).setY(0).normalize().addScaledVector(dH, 0.35).normalize();
  const Mr = new THREE.Vector3().crossVectors(Mf, up);
  figure({ h: 1.09, p: Mp, f: Mf, col: 0xe9a9b0, hair: 0x7a5636, legCol: 0xe9a9b0, handR: 0.02,
    hands: [mc.clone().addScaledVector(Mr, -0.022).add(new THREE.Vector3(0, -0.05, 0)), mc.clone().addScaledVector(Mr, 0.022).add(new THREE.Vector3(0, -0.05, 0))] });
  scene.children.forEach((o) => { if (!before.has(o)) mGroupObjs.push(o); });
}
// Jade (165 cm) behind the lamp, facing along the beam, flashlight in her right hand at waist height
const Jp = Lp.clone().addScaledVector(dH, -0.42).addScaledVector(nH, -0.16).setY(0);
figure({ h: 1.65, p: Jp, f: dH.clone(), col: 0xe8dcc0, hair: 0x15110f, hands: [null, Lp.clone().addScaledVector(axis, -0.14)] });
const torch = add(new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.02, 0.2, 16), mat(0xc8312b)), false, false);
torch.position.copy(Lp).addScaledVector(axis, -0.11); torch.quaternion.setFromUnitVectors(up, axis);
const lens = add(new THREE.Mesh(new THREE.SphereGeometry(LENS, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff2c8 })), false, false); lens.position.copy(Lp);

// ---- light: the flashlight is the only light -------------------------------------------------------------------------
const HALF = 15 * Math.PI / 180;
const spot = new THREE.SpotLight(0xffe2ad, 9, 9, HALF, 0.45, 1.3);
spot.position.copy(Lp); spot.target.position.copy(Lp.clone().addScaledVector(axis, 3)); scene.add(spot, spot.target);
spot.castShadow = true; spot.shadow.mapSize.set(4096, 4096); spot.shadow.camera.near = 0.15; spot.shadow.camera.far = 8; spot.shadow.bias = -0.0004; spot.shadow.radius = 3;
const fill = new THREE.AmbientLight(0xffffff, 0.0); scene.add(fill);
const bounce = new THREE.HemisphereLight(0x8a7458, 0x3a2a1a, 0.0); scene.add(bounce);

// ---- the beam drawn as a volume (guide mode): warm cone, with the two shadow shafts cut out of it --------------------
const beamG = new THREE.Group(); scene.add(beamG);
function coneBetween(apex, ax, d0, d1, tan, material) {       // frustum of the cone with apex `apex` and half-angle atan(tan)
  const g = new THREE.CylinderGeometry(d1 * tan, d0 * tan, d1 - d0, 48, 1, true);
  const o = new THREE.Mesh(g, material); o.position.copy(apex).addScaledVector(ax, (d0 + d1) / 2);
  o.quaternion.setFromUnitVectors(up, ax); return o;
}
function buildBeam(u) {
  beamG.clear();
  const warm = new THREE.MeshBasicMaterial({ color: 0xffd58a, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const dark = new THREE.MeshBasicMaterial({ color: 0x1a120a, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
  beamG.add(coneBetween(Lp, axis, 0.02, 5.2, Math.tan(HALF * 0.8), warm));
  const mc = moonAt(u), am = mc.clone().sub(Lp), dm = am.length(); am.normalize();
  // Moon's shaft: from the ball to where it meets the globe
  const hit = dm + GAP + 0.02;
  beamG.add(coneBetween(Lp, am, dm, hit, RM / dm, dark));
  // Earth's shaft: from the globe to the wall and beyond (the wall hides the rest)
  beamG.add(coneBetween(Lp, axis, LD, 5.2, RE / LD, dark));
}

// ---- cameras -----------------------------------------------------------------------------------------------------------
const mid = Lp.clone().lerp(E, 0.62);
const VIEWS = {
  // the room wide (3.4a): looking at the wall, Jade's back at frame-left
  wide: { pos: new THREE.Vector3(-0.35, 1.32, 5.6), look: new THREE.Vector3(0.45, 1.0, 0.6), fov: 34 },
  // the side view (3.4c): square to the beam, a little toward the lamp so the globe shows its lit face
  side: { pos: mid.clone().addScaledVector(nH, 2.9).addScaledVector(dH, -1.75).setY(1.1), look: mid.clone().addScaledVector(dH, 0.62).setY(0.95), fov: 30 },
  // close along the beam (3.4b): just beside and above the lamp, on the room side
  beam: { pos: Lp.clone().addScaledVector(axis, 0.3).addScaledVector(side, 0.36).addScaledVector(up, 0.24), look: E.clone().addScaledVector(up, 0.2).addScaledVector(side, -0.1), fov: 34 },
  top: { pos: new THREE.Vector3(0.3, 7.5, 1.3), look: new THREE.Vector3(0.3, 0, 1.29), fov: 30 },
};
const cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 60);

window.facts = () => {
  const mc = moonAt(1), dm = mc.clone().sub(Lp).length();
  const umbra = 2 * (RM * (LD - RE) / dm) - 2 * LENS * ((LD - RE - dm) / dm), pen = 2 * (RM * (LD - RE) / dm) + 2 * LENS * ((LD - RE - dm) / dm);
  const tWall = E.z / -axis.z, wallHit = E.clone().addScaledVector(axis, tWall);
  const mag = (LD + tWall) / LD;
  return { lamp: Lp.toArray(), earth: E.toArray(), earthDiameter: 2 * RE, moonDiameter: 2 * RM, lampToMoon: dm, lampToEarth: LD,
    spotOnGlobe: { umbraDiameter: umbra, penumbraDiameter: pen, shareOfGlobe: umbra / (2 * RE) },
    earthShadowOnWall: { centre: wallHit.toArray(), height: 2 * RE * mag, width: 2 * RE * mag / Math.sin(TH), lampToWall: LD + tWall },
    beamToWallDeg: 32, views: Object.fromEntries(Object.entries(VIEWS).map(([k, v]) => [k, { pos: v.pos.toArray(), look: v.look.toArray(), fov: v.fov }])) };
};
window.renderView = (view, u = 1, mode = 'guide') => {
  buildM(u); buildBeam(u);
  const guide = mode === 'guide';
  beamG.visible = guide; fill.intensity = guide ? 0.35 : 0.0; bounce.intensity = guide ? 0.7 : 0.1;
  const v = VIEWS[view]; cam.fov = v.fov; cam.position.copy(v.pos); cam.up.set(0, 1, 0); if (view === 'top') cam.up.set(0, 0, -1);
  cam.lookAt(v.look); cam.updateProjectionMatrix();
  renderer.render(scene, cam);
  return canvas.toDataURL('image/png');
};
window.__ready = Promise.resolve(true);
