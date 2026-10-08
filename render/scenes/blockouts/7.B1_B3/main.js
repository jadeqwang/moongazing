// Blockouts for 7.B1 / 7.B1b (the ice drill, configuration A of docs/companion_moon_experiments.md §14), 7.B2 (the
// MRE cell and the oxygen skid, docs/companion_isru.md §8) and 7.B3 (the Arabidopsis tray, §13f). True sizes, metres,
// y up.   window.renderView(scene, view, { labels }) -> PNG data URL;   window.views() -> { scene: [view...] }
import * as THREE from 'three';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080);
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);

const V = (x, y, z) => new THREE.Vector3(x, y, z), UP = V(0, 1, 0);
const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
function rod(g, a, b, r, c, r2 = r) {
  const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, d.length(), 16), mat(c));
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.clone().normalize()); g.add(m); return m;
}
function limb(g, a, b, r, c) { rod(g, a, b, r, c); ball(g, a, r, c); ball(g, b, r, c); }
function ball(g, p, r, c, s = [1, 1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat(c)); m.position.copy(p); m.scale.set(...s); g.add(m); return m; }
function box(g, p, s, c, ry = 0, o = {}) { const m = new THREE.Mesh(new THREE.BoxGeometry(...s), mat(c, o)); m.position.copy(p); m.rotation.y = ry; g.add(m); return m; }
function disc(g, p, r, h, c, o = {}) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), mat(c, o)); m.position.copy(p); g.add(m); return m; }
function tube(g, pts, r, c) { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, r, 8), mat(c)); g.add(m); return m; }
const labels = [];   // [scene, text, Vector3]
const L = (s, t, p) => labels.push([s, t, p]);

const C = { suit: 0xeeeae0, pad: 0x8a8d92, ink: 0x1b1b1f, visor: 0x30353c, metal: 0xb9bcc2, gold: 0xc9a660, amber: 0xd98a1a, regolith: 0x77787c, cone: 0xd8d6cf,
  yutu: 0xf2f1ec, joint: 0x8f9298, azur: 0x6f93b5, bag: 0xa9a08a, cable: 0xe0b020, brass: 0xb9923f, ember: 0xe86a33, hot: 0xfff2b0, green: 0x5d8f4a, purple: 0x7a4c8a,
  glove: 0x17171a, skin: 0xd9b48e, hair: 0x3d281a, pink: 0xe3a6a0, glass: 0x9fc4d8 };

// ------------------------------------------------------------------------------------------------ 7.B1: the ice drill
function drill(g) {
  // base: three dish footpads 1.2 m apart on a low triangular frame, mast at the centre
  const R = 1.2 / Math.sqrt(3), pads = [30, 150, 270].map((a) => V(R * Math.cos(a * Math.PI / 180), 0, R * Math.sin(a * Math.PI / 180)));
  pads.forEach((p, i) => { { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.04, 32), mat(C.metal)); m.position.copy(p.clone().setY(0.02)); g.add(m); } rod(g, p.clone().setY(0.07), V(0, 0.07, 0), 0.018, C.metal); });
  // the mast: two thin rails a hand's width apart, 1.8 m
  const top = 1.8;
  [-0.05, 0.05].forEach((x) => box(g, V(x, top / 2 + 0.03, -0.06), [0.022, top, 0.03], C.gold));
  box(g, V(0, top + 0.03, -0.06), [0.14, 0.03, 0.04], C.gold);
  for (let y = 0.3; y < top; y += 0.3) box(g, V(0, y, -0.06), [0.1, 0.012, 0.012], C.gold);
  // two diagonal stays from the two rear pads to the top of the mast
  [pads[0], pads[1]].forEach((p) => rod(g, p.clone().setY(0.07), V(0, top, -0.06), 0.012, C.metal));
  // drill head on its carriage (shoebox), at the top of its travel: the bite has just been pulled up
  const headY = 1.22;
  box(g, V(0, headY, 0.03), [0.13, 0.30, 0.15], C.metal);
  box(g, V(0, headY, -0.04), [0.16, 0.10, 0.04], C.gold);
  // the auger: 1 m long, 25 mm thick — a gloved thumb
  rod(g, V(0, 0.06, 0.03), V(0, headY - 0.15, 0.03), 0.0127, 0xdfe2e6);
  // amber flex ribbon cable in a hanging loop
  tube(g, [V(-0.07, headY + 0.1, 0.0), V(-0.2, 0.95, 0.02), V(-0.22, 0.62, 0.0), V(-0.12, 0.5, -0.04), V(-0.06, 0.75, -0.06)], 0.012, C.amber).scale.set(1, 1, 1);
  // the foot: curved footpad pressed on the ground, brush wheel (fist-sized), short chute
  box(g, V(0, 0.015, 0.03), [0.22, 0.03, 0.14], C.gold);
  const br = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 24), mat(0x222226)); br.rotation.z = Math.PI / 2; br.position.set(0, 0.15, 0.085); g.add(br);
  box(g, V(0.0, 0.11, 0.03), [0.05, 0.16, 0.05], C.metal);
  const ch = box(g, V(0.0, 0.085, 0.14), [0.045, 0.012, 0.09], C.metal); ch.rotation.x = 0.7;
  // the cuttings cone: 9 cm wide, 4.5 cm high, beside the footpad
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.045, 28), mat(C.cone)); cone.position.set(0.0, 0.0225, 0.21); g.add(cone);
  // ballast bags of regolith on the base, and the avionics box
  box(g, V(-0.24, 0.17, -0.36), [0.4, 0.2, 0.26], C.bag, 0.25); box(g, V(0.24, 0.17, -0.36), [0.4, 0.2, 0.26], C.bag, -0.25);
  box(g, V(-0.36, 0.16, -0.02), [0.24, 0.16, 0.16], C.metal, 0.3);
  L('b1', 'mast 1.8 m (two thin rails)', V(0, top + 0.08, -0.06)); L('b1', 'auger Ø 25 mm', V(0.02, 0.7, 0.03)); L('b1', 'cone 9 cm', V(0.0, 0.08, 0.21));
  L('b1', 'ballast bags', V(0.3, 0.33, -0.36)); L('b1', 'dish footpad ×3, 1.2 m apart', pads[0].clone().setY(0.1));
  return { avionics: V(-0.46, 0.1, -0.02) };
}
// a suited astronaut kneeling on the right knee, facing `yaw` (0 = +z). Standing suit height 1.8 m.
function astronaut(g0, at, yaw, stripe) {
  const g = new THREE.Group(); g0.add(g); g.position.copy(at); g.rotation.y = yaw;
  const s = C.suit;
  // right knee down, left foot planted forward
  const hip = V(0, 0.58, 0), kneeR = V(-0.12, 0.09, 0.22), footR = V(-0.14, 0.07, -0.3), kneeL = V(0.16, 0.56, 0.42), footL = V(0.17, 0.06, 0.4);
  limb(g, V(-0.11, 0.56, 0), kneeR, 0.095, s); limb(g, kneeR, footR, 0.085, s); box(g, footR.clone().add(V(0, 0.0, -0.05)), [0.14, 0.14, 0.28], C.pad);
  limb(g, V(0.12, 0.58, 0.02), kneeL, 0.095, s); limb(g, kneeL, footL, 0.085, s); box(g, footL.clone().add(V(0, 0, 0.09)), [0.14, 0.12, 0.3], C.pad);
  ball(g, kneeL, 0.1, C.pad); ball(g, kneeR, 0.1, C.pad);
  // torso leans forward; backpack
  const chest = V(0, 1.02, 0.2), neck = V(0, 1.14, 0.27);
  limb(g, hip, chest, 0.2, s); box(g, V(0, 0.98, -0.06), [0.46, 0.62, 0.2], s).rotation.x = 0.38;
  // helmet bubble, visor, the ink-black stripe over the crown, two lamps beside the bubble
  const head = V(0, 1.3, 0.36); ball(g, head, 0.17, s); ball(g, head.clone().add(V(0, -0.01, 0.045)), 0.145, C.visor);
  const st = new THREE.Mesh(new THREE.TorusGeometry(0.172, 0.022, 8, 24, Math.PI), mat(stripe)); st.position.copy(head); st.rotation.y = Math.PI / 2; g.add(st);
  [-1, 1].forEach((k) => ball(g, head.clone().add(V(0.15 * k, 0.1, 0.08)), 0.03, 0xfff6c8));
  // arms: left hand low with the open canister beside the cone, right hand tipping the scoop into it
  const shL = V(0.24, 1.08, 0.24), shR = V(-0.24, 1.08, 0.24), handL = V(0.2, 0.3, 0.72), handR = V(-0.12, 0.42, 0.74);
  const elL = V(0.36, 0.72, 0.42), elR = V(-0.38, 0.76, 0.42);
  limb(g, shL, elL, 0.075, s); limb(g, elL, handL, 0.065, s); ball(g, handL, 0.07, C.pad);
  limb(g, shR, elR, 0.075, s); limb(g, elR, handR, 0.065, s); ball(g, handR, 0.07, C.pad);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 20), mat(stripe)); band.position.copy(shL.clone().lerp(elL, 0.5)); band.quaternion.setFromUnitVectors(V(0, 0, 1), elL.clone().sub(shL).normalize()); g.add(band);
  disc(g, handL.clone().add(V(0, -0.1, 0.06)), 0.04, 0.2, C.metal);                 // canister (small thermos)
  box(g, handR.clone().add(V(0.1, -0.03, 0.06)), [0.16, 0.02, 0.07], C.metal, 0).rotation.z = -0.4;   // flat scoop
  g.updateMatrixWorld(true);
  return { head: head.clone().applyMatrix4(g.matrixWorld) };
}
function yutu(g0, at, yaw) {
  const g = new THREE.Group(); g0.add(g); g.position.copy(at); g.rotation.y = yaw;   // nose toward +z
  const by = 0.48;
  const body = ball(g, V(0, by, 0), 0.19, C.yutu, [0.95, 0.85, 2.3]); body.userData.n = 'body';
  ball(g, V(0, by + 0.1, 0.5), 0.13, C.yutu, [1, 0.85, 1.25]); box(g, V(0, by + 0.1, 0.63), [0.19, 0.11, 0.06], C.ink);
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
    const hipP = V(0.19 * sx, by - 0.02, 0.3 * sz), knee = V(0.21 * sx, 0.3, 0.3 * sz + 0.12 * sz), foot = V(0.22 * sx, 0.1, 0.34 * sz);
    limb(g, hipP, knee, 0.045, C.yutu); limb(g, knee, foot, 0.04, C.yutu); ball(g, hipP, 0.06, C.joint);
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.035, 8, 20), mat(0x55585e)); w.position.copy(foot); w.rotation.y = Math.PI / 2; g.add(w);
  });
  // ears edge-on to the drill (no Sun here: they are only antennas), camera mast with the flood between them
  [-0.07, 0.07].forEach((x) => box(g, V(x, by + 0.5, 0.36), [0.012, 0.5, 0.12], C.azur));
  rod(g, V(0, by + 0.15, 0.3), V(0, 1.15, 0.3), 0.012, C.joint); box(g, V(0, 1.18, 0.33), [0.12, 0.08, 0.08], 0xfff6c8);
  // back rack with the open sample box
  box(g, V(0, by + 0.2, -0.18), [0.3, 0.1, 0.36], 0xa9b6c4); const lid = box(g, V(0, by + 0.36, -0.37), [0.3, 0.02, 0.3], 0xa9b6c4); lid.rotation.x = -1.1;
  // the empty sledge that carried the drill, behind it
  box(g, V(0, 0.08, -1.25), [0.6, 0.04, 1.1], C.joint); [-0.3, 0.3].forEach((x) => rod(g, V(x, 0.03, -1.8), V(x, 0.03, -0.7), 0.015, C.metal)); rod(g, V(0, 0.2, -0.7), V(0, by - 0.1, -0.42), 0.012, C.metal);
  g.updateMatrixWorld(true);
  return { flank: V(0.2, 0.42, -0.1).applyMatrix4(g.matrixWorld), head: V(0, 1.3, 0.3).applyMatrix4(g.matrixWorld) };
}
function sceneB1() {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x050506);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x555560, 1.2)); const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(2, 3, 4); sc.add(dl);
  const gr = new THREE.Mesh(new THREE.CircleGeometry(30, 64), mat(0x5e5f63)); gr.rotation.x = -Math.PI / 2; sc.add(gr);
  // the two lamp pools (helmet lamps, Yutu's flood) as lighter discs on the ground
  [[0.25, 0.25, 1.5], [-0.3, -0.2, 1.7]].forEach(([x, z, r]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), mat(0x9a9b9e)); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, z); sc.add(m); });
  // the far sunlit rim: one thin bright thread, kilometres away
  const rim = box(sc, V(-6, 9.5, -28), [22, 0.12, 0.1], 0xffffff); rim.rotation.z = 0.05;
  const d = drill(sc);
  const yawA = Math.atan2(0.0 - 0.95, 0.21 - (-0.3));   // faces the cone
  const a = astronaut(sc, V(0.95, 0, -0.3), yawA, C.ink);
  // the gnomon beside the cone, the carrier rack with three sealed canisters by his knee
  const gn = V(-0.2, 0, 0.3); rod(sc, gn, gn.clone().setY(0.42), 0.006, C.metal); [0, 2.1, 4.2].forEach((k) => rod(sc, gn.clone().setY(0.2), gn.clone().add(V(0.09 * Math.cos(k), 0, 0.09 * Math.sin(k))), 0.004, C.metal));
  box(sc, V(1.55, 0.05, 0.35), [0.42, 0.05, 0.16], C.joint, 0.5); [-0.13, 0, 0.13].forEach((k) => disc(sc, V(1.55 + k * Math.cos(0.5), 0.17, 0.35 - k * Math.sin(0.5)), 0.04, 0.2, C.metal));
  // Yutu, 3.5 m off, behind and to the left, facing the drill
  const yp = V(-2.5, 0, -2.45), y = yutu(sc, yp, Math.atan2(0 - yp.x, 0 - yp.z));
  // one slack power/data cable on the ground from the avionics box to Yutu's flank: the only connection
  tube(sc, [d.avionics, V(-0.8, 0.02, 0.15), V(-1.2, 0.02, -0.55), V(-1.5, 0.02, -1.0), V(-1.95, 0.02, -1.4), V(-2.15, 0.03, -2.0), y.flank], 0.014, C.cable);
  L('b1', 'ARJUN (ink-black stripe), kneeling: scoop + canister', a.head.clone().add(V(0, 0.3, 0))); L('b1', 'YUTU 3.5 m away: flood light, power, sample rack', y.head);
  L('b1', 'one slack cable', V(-1.3, 0.1, -0.85)); L('b1', 'rack: 3 sealed canisters', V(1.55, 0.34, 0.35)); L('b1', 'gnomon', V(-0.2, 0.48, 0.3)); L('b1', 'sunlit rim (far)', V(-6, 9.8, -28));
  return sc;
}

// ---------------------------------------------------------------------------------------------- 7.B2: the MRE vault
function sceneB2() {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1c2544);
  sc.add(new THREE.HemisphereLight(0xdfe6ff, 0x4a4a60, 1.5)); const dl = new THREE.DirectionalLight(0xffffff, 1.4); dl.position.set(1, 4, 3); sc.add(dl);
  box(sc, V(0, -0.025, -3), [7, 0.05, 12], 0x2c3558);
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 12, 40, 1, true, 0, Math.PI), mat(0x3a4670, { side: THREE.BackSide })); vault.rotation.x = Math.PI / 2; vault.rotation.z = Math.PI / 2; vault.position.set(0, 0, -3); sc.add(vault);
  // the cell: a squat drum 2 m across, 1.3 m tall on a short plinth; closed; coolant jacket round the waist
  const cx = 1.25, cz = -3.2;
  disc(sc, V(cx, 0.1, cz), 0.8, 0.2, 0x555a66); disc(sc, V(cx, 0.85, cz), 1.0, 1.3, 0xb8b29c); disc(sc, V(cx, 0.75, cz), 1.03, 0.3, 0x8a8f9a); disc(sc, V(cx, 1.53, cz), 1.0, 0.06, 0x9a9488);
  // anode rod and lift actuator on the lid; two thick flat busbars (+ to the anode rod, − to the base)
  rod(sc, V(cx, 1.55, cz), V(cx, 2.35, cz), 0.05, C.metal); box(sc, V(cx, 2.4, cz), [0.25, 0.3, 0.25], C.joint);
  box(sc, V(cx + 0.9, 2.1, cz), [1.8, 0.04, 0.16], C.gold); box(sc, V(cx + 1.8, 1.25, cz), [0.04, 1.7, 0.16], C.gold);
  box(sc, V(cx + 1.4, 0.25, cz + 0.3), [1.0, 0.04, 0.16], C.gold);
  // sight glass on the lid: palm-sized, yellow-white, with its shutter; the camera on a bracket
  disc(sc, V(cx - 0.45, 1.58, cz + 0.55), 0.05, 0.05, C.hot); box(sc, V(cx - 0.45, 1.72, cz + 0.55), [0.08, 0.08, 0.1], C.joint);
  // hopper and the enclosed feed auger sloping down to a gate valve on the lid
  box(sc, V(cx - 0.2, 2.5, cz - 2.2), [0.8, 0.7, 0.8], 0x7b808c); rod(sc, V(cx - 0.2, 2.2, cz - 1.9), V(cx - 0.25, 1.62, cz - 0.5), 0.09, 0x9aa0ac);
  // finger-thick oxygen tube from the lid up and across to the skid by the camera
  const sk = V(-0.42, 1.2, -0.55);
  tube(sc, [V(cx + 0.4, 1.56, cz + 0.4), V(cx + 0.4, 2.2, cz + 0.4), V(-0.2, 2.25, cz + 0.6), V(-0.9, 2.2, -1.4), V(-1.0, 1.6, -0.9), V(-0.95, 1.2, -0.6), sk, V(-0.1, 1.2, -0.6), V(-0.02, 1.0, -0.8), V(-0.02, 0.9, -0.85)], 0.008, C.brass);
  // the oxygen clean-up skid: frame, filter canister, purifier, a pressure gauge, the manual isolation valve
  box(sc, V(-0.45, 0.45, -0.85), [1.0, 0.9, 0.45], 0x4c5674); disc(sc, V(-0.82, 1.1, -0.85), 0.09, 0.4, C.metal);
  const gauge = disc(sc, V(-0.68, 1.42, -0.62), 0.04, 0.02, 0xf2f1ec); gauge.rotation.x = Math.PI / 2;
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.009, 8, 28), mat(C.brass)); wheel.position.copy(sk).add(V(0, 0, 0.07)); sc.add(wheel); rod(sc, sk, sk.clone().add(V(0, 0, 0.07)), 0.008, C.brass);
  box(sc, sk.clone().add(V(0.06, -0.13, 0.05)), [0.05, 0.09, 0.004], 0xf2e8c0);   // lockout tag
  // her gloves on the valve (first person)
  [[-0.06, 1], [0.07, -1]].forEach(([dx]) => { ball(sc, sk.clone().add(V(dx, -0.01, 0.1)), 0.055, C.suit, [1, 1.1, 0.8]); limb(sc, sk.clone().add(V(dx, -0.02, 0.14)), V(dx * 3.2 - 0.4, 1.0, 0.3), 0.055, C.suit); });
  // the casting station at the foot of the cell: a row of moulds, one fresh ingot glowing ember, a black slag puck
  box(sc, V(cx - 1.0, 0.3, cz + 1.35), [1.1, 0.6, 0.45], 0x4c5674); [-0.36, -0.12, 0.12, 0.36].forEach((k, i) => box(sc, V(cx - 1.0 + k, 0.63, cz + 1.35), [0.2, 0.06, 0.1], i === 1 ? C.ember : 0x30343c));
  disc(sc, V(cx - 0.35, 0.63, cz + 1.5), 0.06, 0.03, 0x0c0c0e);
  // four gas buffer bottles and coolant lines leaving through the vault wall; keep-out line on the floor
  [0, 1, 2, 3].forEach((i) => disc(sc, V(-2.2 + i * 0.36, 0.8, -6.5), 0.16, 1.5, C.metal));
  [0.1, 0.25].forEach((k) => rod(sc, V(cx + 1.0, 0.8 + k, cz - 0.2), V(3.2, 1.6 + k, cz - 0.8), 0.045, 0x8a8f9a));
  const ko = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.56, 64), mat(C.gold)); ko.rotation.x = -Math.PI / 2; ko.position.set(cx, 0.004, cz); sc.add(ko);
  L('b2', 'MRE cell: squat drum Ø 2 m, 1.3 m tall, closed', V(cx, 1.75, cz + 1.0)); L('b2', 'busbar +', V(cx + 0.9, 2.2, cz)); L('b2', 'busbar −', V(cx + 1.4, 0.35, cz + 0.3)); L('b2', 'anode rod + lift', V(cx, 2.6, cz));
  L('b2', 'sight glass 5 cm (yellow-white)', V(cx - 0.45, 1.85, cz + 0.55)); L('b2', 'enclosed feed auger', V(cx - 0.2, 2.0, cz - 1.3)); L('b2', 'fresh ingot (ember) + slag puck', V(cx - 1.0, 0.8, cz + 1.35));
  L('b2', 'O₂ tube: finger-thick', V(-0.9, 2.3, -1.4)); L('b2', 'brass isolation valve + lockout tag (her gloves)', sk.clone().add(V(0, 0.14, 0.07))); L('b2', 'gauge', V(-0.68, 1.5, -0.62)); L('b2', 'O₂ skid', V(-0.45, 0.8, -0.62));
  return sc;
}

// ------------------------------------------------------------------------------------------- 7.B3: the growth chamber
// The camera looks toward +z, so +x is frame-LEFT and -x is frame-RIGHT.
function sceneB3() {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1c2544);
  sc.add(new THREE.HemisphereLight(0xdfe6ff, 0x4a4a60, 1.6)); const dl = new THREE.DirectionalLight(0xffffff, 1.4); dl.position.set(0.3, 1, -0.4); sc.add(dl);
  // bench and the sealed chamber 60 × 40 × 40 cm (x × y × z); the wall with the glove ports is at z = +0.2, facing her
  box(sc, V(0, -0.02, 0.1), [1.2, 0.04, 1.0], 0x2c3558);
  const fr = 0x8c93a6, cw = 0.6, chh = 0.4, cd = 0.4;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(sc, V(sx * cw / 2, chh / 2, sz * cd / 2), [0.012, chh, 0.012], fr));
  [0, chh].forEach((y) => { [-1, 1].forEach((sz) => box(sc, V(0, y, sz * cd / 2), [cw, 0.012, 0.012], fr)); [-1, 1].forEach((sx) => box(sc, V(sx * cw / 2, y, 0), [0.012, 0.012, cd], fr)); });
  box(sc, V(0, chh / 2, cd / 2), [cw, chh, 0.004], C.glass, 0, { transparent: true, opacity: 0.12 });
  box(sc, V(0, chh - 0.012, 0), [cw * 0.8, 0.012, cd * 0.7], 0xd6a8d8);                       // LED panel in the lid
  // glove ports (Ø 13 cm) in the wall facing her; her left arm is in the frame-right one (x = -0.19)
  [-0.19, 0.19].forEach((x) => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.009, 8, 32), mat(fr)); t.position.set(x, 0.11, cd / 2); sc.add(t); });
  // the tray: a clear dish with six clear cups (Ø 3 cm, 3 cm tall), 1 cm of regolith on a white wick plug
  const tc = V(0.13, 0, 0.06); box(sc, tc.clone().setY(0.006), [0.17, 0.012, 0.115], C.glass, 0, { transparent: true, opacity: 0.35 });
  const cups = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const p = V(tc.x + (c - 1) * 0.05, 0, tc.z + (r - 0.5) * 0.05); cups.push(p);
    disc(sc, p.clone().setY(0.027), 0.015, 0.03, C.glass, { transparent: true, opacity: 0.25 }); disc(sc, p.clone().setY(0.016), 0.014, 0.008, 0xf4f1ea); disc(sc, p.clone().setY(0.025), 0.014, 0.01, r === 0 && c === 1 ? 0x3a3a3e : 0x8f9094);
  }
  // one rosette, 2.5 cm across, flat on the soil of the near-centre cup: eight spoon leaves
  const rp = cups[1].clone().setY(0.0315);
  for (let i = 0; i < 8; i++) { const a = i * 2.4, rr = i < 2 ? 0.005 : 0.009; const lf = ball(sc, rp.clone().add(V(Math.cos(a) * rr, 0.001, Math.sin(a) * rr)), 0.0038, i < 2 ? C.purple : C.green, [1, 0.15, 0.75]); lf.rotation.y = -a; }
  [cups[3], cups[5]].forEach((p) => [-1, 1].forEach((k) => ball(sc, p.clone().setY(0.032).add(V(k * 0.002, 0, 0)), 0.0015, C.green, [1, 0.3, 0.8])));
  // the black gauntlet reaching in from the frame-right port; thumb and forefinger hold a millimetre scale card beside the rosette
  const port = V(-0.19, 0.11, cd / 2), card = rp.clone().add(V(-0.034, 0.012, 0.004)), wrist = card.clone().add(V(-0.085, 0.03, 0.05)), elbow = V(-0.12, 0.07, 0.13);
  limb(sc, port, elbow, 0.034, C.glove); limb(sc, elbow, wrist, 0.026, C.glove); ball(sc, wrist.clone().add(V(0.03, -0.004, -0.015)), 0.026, C.glove, [1.2, 0.7, 1]);
  limb(sc, wrist.clone().add(V(0.04, -0.005, -0.03)), card.clone().add(V(-0.012, 0.004, -0.004)), 0.0075, C.glove); limb(sc, wrist.clone().add(V(0.045, -0.012, -0.012)), card.clone().add(V(-0.012, -0.004, 0.006)), 0.0075, C.glove);
  const cd2 = box(sc, card, [0.03, 0.02, 0.0008], 0xf7f5ee); cd2.rotation.x = -0.5;
  // sensor puck, nutrient tube, camera on a bracket looking straight down
  disc(sc, V(0.26, 0.012, 0.13), 0.022, 0.024, C.metal); tube(sc, [V(0.29, 0.3, 0.15), V(0.24, 0.1, 0.1), V(0.215, 0.016, 0.07)], 0.002, 0xf2f1ec);
  box(sc, V(0.13, 0.34, 0.06), [0.04, 0.04, 0.05], C.joint); rod(sc, V(0.13, 0.36, 0.06), V(0.13, 0.395, 0.06), 0.004, C.joint);
  // Lúcia outside the wall: bent low, eyes a little above tray level, face upper right of the frame, left arm into the port
  const head = V(-0.05, 0.17, cd / 2 + 0.17); ball(sc, head, 0.09, C.skin, [0.82, 1, 0.9]); ball(sc, head.clone().add(V(0, 0.02, 0.03)), 0.093, C.hair, [0.86, 1, 0.92]);
  [-1, 1].forEach((k) => ball(sc, head.clone().add(V(k * 0.029, 0.01, -0.078)), 0.009, 0x2a1a12)); ball(sc, head.clone().add(V(0, -0.015, -0.086)), 0.009, C.skin);
  ball(sc, head.clone().add(V(-0.03, -0.02, 0.12)), 0.05, C.hair);                            // hair tied back
  const chest = V(-0.08, -0.04, cd / 2 + 0.36); limb(sc, head.clone().add(V(0, -0.09, 0.05)), chest, 0.045, C.skin); ball(sc, chest, 0.17, 0xf4f1ea, [1.2, 1, 0.8]);
  const col = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20), mat(C.pink)); col.position.copy(head.clone().add(V(0, -0.125, 0.08))); col.rotation.x = 1.1; sc.add(col);
  limb(sc, V(-0.27, 0.04, cd / 2 + 0.3), V(-0.25, 0.09, cd / 2 + 0.12), 0.04, C.skin); limb(sc, V(-0.25, 0.09, cd / 2 + 0.12), port, 0.034, C.skin);
  L('b3', 'rosette 2.5 cm (the only colour)', rp.clone().add(V(0.02, 0.022, 0))); L('b3', 'six clear cups Ø 3 cm', cups[3].clone().setY(0.05)); L('b3', 'mm scale card in the gauntlet', card.clone().add(V(-0.03, 0.03, 0)));
  L('b3', 'LÚCIA behind the window', head.clone().add(V(0, 0.115, 0))); L('b3', 'idle glove port', V(0.19, 0.2, cd / 2)); L('b3', 'camera bracket', V(0.13, 0.37, 0.06)); L('b3', 'sensor puck', V(0.26, 0.05, 0.13));
  return sc;
}

const SC = { b1: sceneB1(), b2: sceneB2(), b3: sceneB3() };
const CAMS = {
  b1: {
    wide: { pos: [0.9, 0.95, 5.2], target: [-0.35, 0.85, -0.6], hfov: 44 },        // 7.B1: drill centre, Arjun right, Yutu back-left
    close: { pos: [-0.52, 0.34, 1.2], target: [0.02, 0.16, 0.14], hfov: 44 },           // 7.B1b: the foot of the drill
    top: { pos: [-0.9, 9, -0.9], target: [-0.9, 0, -1.0], hfov: 40, up: [0, 0, -1] },
    side: { pos: [-6.5, 1.2, 1.2], target: [-0.9, 0.8, -1.0], hfov: 46 },
  },
  b2: {
    pov: { pos: [-0.38, 1.65, 0.65], target: [0.35, 1.5, -2.1], hfov: 82 },          // 7.B2: her eyes; gloves on the valve, the cell beyond
    top: { pos: [0.3, 9, -2.8], target: [0.3, 0, -2.9], hfov: 50, up: [0, 0, -1] },
    side: { pos: [-3.0, 1.9, 1.6], target: [0.6, 1.0, -2.6], hfov: 60 },
  },
  b3: {
    hero: { pos: [0.1, 0.09, -0.26], target: [0.105, 0.085, 0.2], hfov: 58 },          // 7.B3: low, ~25 cm from the plant, across the tray
    top: { pos: [0, 1.0, 0.12], target: [0, 0, 0.13], hfov: 50, up: [0, 0, 1] },
    side: { pos: [0.75, 0.3, -0.1], target: [0.0, 0.12, 0.15], hfov: 50 },
  },
};
function camFor(c) {
  const vf = 2 * Math.atan(Math.tan(c.hfov * Math.PI / 360) / (W / H)) * 180 / Math.PI;
  const cam = new THREE.PerspectiveCamera(vf, W / H, 0.01, 200); cam.position.set(...c.pos); if (c.up) cam.up.set(...c.up); cam.lookAt(V(...c.target)); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return cam;
}
window.renderView = (scene, view, o = {}) => {
  const cam = camFor(CAMS[scene][view]); renderer.render(SC[scene], cam);
  if (!o.labels) return canvas.toDataURL('image/png');
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const g = c2.getContext('2d'); g.drawImage(canvas, 0, 0);
  g.font = '600 22px sans-serif'; g.textAlign = 'center';
  for (const [s, t, p] of labels) { if (s !== scene) continue; const v = p.clone().project(cam); if (v.z > 1) continue; const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
    const w = g.measureText(t).width + 14; g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(x - w / 2, y - 24, w, 30); g.fillStyle = '#ffe9a8'; g.fillText(t, x, y - 3); }
  return c2.toDataURL('image/png');
};
window.views = () => Object.fromEntries(Object.entries(CAMS).map(([k, v]) => [k, Object.keys(v)]));
window.__ready = Promise.resolve(true);
