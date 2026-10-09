// 7.B3 — the glovebox at TRUE sizes (rev 3, Oct 8): is the gauntlet the right size for the plant experiment, for the
// port it comes through and for the woman it belongs to; and where must port, shoulder and glove be for the arm to be
// hers. Metres, y up, floor at y = 0, bench top at y = BENCH. The film camera looks toward +z, so +x is frame-LEFT.
// Lúcia (1.64 m, mannequin.js) is on the far side of the chamber, facing the camera (-z): her LEFT arm is at -x,
// frame-RIGHT, and goes through the frame-right port.
//   window.renderView(view, u, { labels }) -> PNG data URL     view: hero | top | side | her     u: 0..1 through the reach
//   window.measure(u) -> projected sizes in the hero frame (px of a 1672-px-wide keyframe) + the reach checks
// Sizes used (sources in media/ref/rev3_base/SOURCES.md and docs/companion_moon_experiments.md §13):
//   chamber 0.60 x 0.40 x 0.40 clear box · glove ports 8 in = 203 mm inner Ø, 0.34 m apart · gauntlet 32 in long,
//   hand size 9 3/4 (loose 0.4-0.8 mm butyl: the gloved hand is ~205 mm long, ~115 mm across the knuckles, ~24 mm
//   fingers; her bare hand is ~172 x 76 mm) · cups Ø 30 x 30 mm on a 50 mm pitch · rosette 25 mm · card 40 x 15 mm.
import * as THREE from 'three';
import { buildFigure } from '../mannequin.js';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080);
const P = {
  hfov: 52, cam: [0.10, 0.10, -0.50], look: [-0.03, 0.125, 0.2],          // bench-relative (y above the bench top)
  port: { d: 0.203, x: 0.17, y: 0.15 },
  tray: [0.10, -0.10],                                                     // centre x, z
  lucia: { at: [-0.10, 1.00], seat: 0.65, lean: 40, tilt: -3, twist: -4 },   // a lab stool; she bends to the window
  card0: [-0.03, 0.014, -0.055], card1: [0.02, 0.014, -0.085],                // card centre at u = 0 and u = 1
  dLean: 3.0, dTwist: -5, dShift: [0.0, -0.012],                             // what her body does over the reach
  ...JSON.parse(q.get('p') || '{}'),
};
const BENCH = 0.90, KW = 1672;
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
const V = (x, y, z) => new THREE.Vector3(x, y, z), UP = V(0, 1, 0), B = (a) => V(a[0], a[1] + BENCH, a[2]);
const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const C = { frame: 0x8c93a6, glass: 0x9fc4d8, glove: 0x17171a, card: 0xf7f5ee, green: 0x5d8f4a, purple: 0x7a4c8a, wick: 0xf4f1ea, soil: 0x55565a, metal: 0xb9bcc2 };
function rod(g, a, b, r, c, r2 = r) { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, d.length(), 20), mat(c));
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.clone().normalize()); g.add(m); return m; }
function ball(g, p, r, c, s = [1, 1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat(c)); m.position.copy(p); m.scale.set(...s); g.add(m); return m; }
function limb(g, a, b, r, c) { rod(g, a, b, r, c); ball(g, a, r, c); ball(g, b, r, c); }
function box(g, p, s, c, o = {}) { const m = new THREE.Mesh(new THREE.BoxGeometry(...s), mat(c, o)); m.position.copy(p); g.add(m); return m; }
function disc(g, p, r, h, c, o = {}) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40), mat(c, o)); m.position.copy(p); g.add(m); return m; }

const CW = 0.6, CH = 0.4, CD = 0.4, WALL = CD / 2;
const cups = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) cups.push([P.tray[0] + (c - 1) * 0.05, 0, P.tray[1] + (r - 0.5) * 0.05]);
const ROSE = cups[1];                                                          // near row, middle

// everything that moves with u: Lúcia's body, her arm, the gauntlet, the card
function joints(u) {
  const card = V(...P.card0).lerp(V(...P.card1), u), L = P.lucia;
  const spec = { who: 'lucia', pose: 'sit', seat: L.seat, at: [L.at[0] + P.dShift[0] * u, L.at[1] + P.dShift[1] * u], yaw: 180, lean: L.lean + P.dLean * u, tilt: L.tilt,
    twist: L.twist + P.dTwist * u, look: B([ROSE[0], 0.03, ROSE[2]]).toArray(), R: 'lap', elbowOut: 1.3 };
  // the gloved hand: index fingertip on the card's near edge; the hand lies along the line from the port to the card
  const portC = B([-P.port.x, P.port.y, WALL]), tip = B([card.x - 0.012, card.y + 0.012, card.z + 0.004]);
  const dir = tip.clone().sub(portC); dir.y *= 0.55; dir.normalize();
  const wrist = tip.clone().addScaledVector(dir, -0.185).add(V(0, 0.02, 0));
  spec.L = wrist.toArray();
  return { spec, card: B(card.toArray()), portC, tip, wrist, dir };
}

function build(u) {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x1c2544);
  sc.add(new THREE.HemisphereLight(0xdfe6ff, 0x4a4a60, 1.7)); const dl = new THREE.DirectionalLight(0xffffff, 1.3); dl.position.set(0.3, 1, -0.6); sc.add(dl);
  box(sc, V(0, BENCH - 0.02, 0.05), [1.3, 0.04, 0.8], 0x2c3558);                                           // bench
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(sc, B([sx * CW / 2, CH / 2, sz * CD / 2]), [0.012, CH, 0.012], C.frame));
  [0, CH].forEach((y) => { [-1, 1].forEach((sz) => box(sc, B([0, y, sz * CD / 2]), [CW, 0.012, 0.012], C.frame)); [-1, 1].forEach((sx) => box(sc, B([sx * CW / 2, y, 0]), [0.012, 0.012, CD], C.frame)); });
  box(sc, B([0, CH - 0.012, 0]), [CW * 0.8, 0.012, CD * 0.7], 0xd6a8d8);                                    // LED panel in the lid
  [-1, 1].forEach((s) => { const t = new THREE.Mesh(new THREE.TorusGeometry(P.port.d / 2 + 0.012, 0.012, 10, 48), mat(C.frame)); t.position.copy(B([s * P.port.x, P.port.y, WALL])); sc.add(t); });
  box(sc, B([P.tray[0], 0.006, P.tray[1]]), [0.17, 0.012, 0.115], C.glass, { transparent: true, opacity: 0.35 });
  cups.forEach((c, i) => { disc(sc, B([c[0], 0.015, c[2]]), 0.015, 0.03, C.glass, { transparent: true, opacity: 0.3 }); disc(sc, B([c[0], 0.008, c[2]]), 0.0142, 0.012, C.wick); disc(sc, B([c[0], 0.019, c[2]]), 0.0142, 0.01, i === 1 ? 0x3a3a3e : C.soil); });
  for (let i = 0; i < 8; i++) { const a = i * 2.4, rr = i < 2 ? 0.005 : 0.009; const lf = ball(sc, B([ROSE[0] + Math.cos(a) * rr, 0.025, ROSE[2] + Math.sin(a) * rr]), 0.0038, i < 2 ? C.purple : C.green, [1, 0.15, 0.75]); lf.rotation.y = -a; }
  disc(sc, B([0.26, 0.012, 0.13]), 0.022, 0.024, C.metal);                                                  // sensor puck
  box(sc, B([P.tray[0], CH - 0.05, P.tray[1]]), [0.04, 0.04, 0.05], 0x8f9298);                               // camera on its bracket
  const J = joints(u);
  const fig = buildFigure(J.spec, { resolve: (t) => (Array.isArray(t) ? V(...t) : V(0, 0, 0)) }); sc.add(fig);
  const FP = fig.userData.P;
  // hide the mannequin's bare left forearm and hand inside the box: the gauntlet is drawn over them, a little larger
  // sleeve: a cone from the port ring to the wrist (the rubber is fixed to the ring: this is what ties glove to wall)
  { const a = J.portC.clone(), b = J.wrist.clone(), d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.047, P.port.d / 2, d.length(), 28, 1, true), mat(C.glove, { side: THREE.DoubleSide }));
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.clone().normalize()); sc.add(m); }
  // the hand: palm 105 x 115 x 45 mm, index extended to the card (85 mm, Ø 24), three fingers curled, thumb under
  { const d = J.tip.clone().sub(J.wrist).normalize(), side = new THREE.Vector3().crossVectors(d, UP).normalize(), nrm = new THREE.Vector3().crossVectors(side, d).normalize();
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.045, 0.105), mat(C.glove));
    palm.position.copy(J.wrist).addScaledVector(d, 0.06); palm.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, nrm, d.clone().negate())); sc.add(palm);
    ball(sc, J.wrist, 0.047, C.glove);
    const kn = (k) => J.wrist.clone().addScaledVector(d, 0.112).addScaledVector(side, k);      // knuckles; side = toward the camera-ish
    // for her LEFT hand, palm down, fingers toward frame-left: the thumb is on the far side (toward her), the little finger nearest us
    limb(sc, kn(0.042), J.tip, 0.012, C.glove);                                                 // index (far side)
    [0.014, -0.014, -0.042].forEach((k, i) => { const a = kn(k), m = a.clone().addScaledVector(d, 0.045).addScaledVector(nrm, -0.012), e = m.clone().addScaledVector(d, -0.012).addScaledVector(nrm, -0.034); limb(sc, a, m, 0.012, C.glove); limb(sc, m, e, 0.0115, C.glove); });
    const th = J.wrist.clone().addScaledVector(d, 0.045).addScaledVector(side, 0.058); limb(sc, th, th.clone().addScaledVector(d, 0.05).addScaledVector(side, 0.012).addScaledVector(nrm, -0.02), 0.013, C.glove); }
  const cd = box(sc, J.card, [0.04, 0.015, 0.0008], C.card); cd.rotation.x = -0.45;
  return { sc, J, FP };
}

const CAMS = {
  hero: () => ({ pos: B(P.cam), target: B(P.look), hfov: P.hfov }),
  top: () => ({ pos: V(0, BENCH + 1.7, 0.36), target: V(0, BENCH, 0.35), hfov: 50, up: [0, 0, 1] }),
  side: () => ({ pos: V(1.9, BENCH + 0.35, 0.3), target: V(0, BENCH + 0.15, 0.3), hfov: 44 }),
  her: () => ({ pos: V(-0.55, BENCH + 0.75, 1.75), target: V(-0.05, BENCH + 0.12, 0.2), hfov: 50 }),
};
function camFor(c) {
  const vf = 2 * Math.atan(Math.tan(c.hfov * Math.PI / 360) / (W / H)) * 180 / Math.PI;
  const cam = new THREE.PerspectiveCamera(vf, W / H, 0.01, 50); cam.position.copy(c.pos); if (c.up) cam.up.set(...c.up); cam.lookAt(c.target); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return cam;
}
const px = (cam, p) => { const v = p.clone().project(cam); return [(v.x * 0.5 + 0.5) * KW, (-v.y * 0.5 + 0.5) * KW * H / W]; };
const depth = (cam, p) => { const f = new THREE.Vector3(); cam.getWorldDirection(f); return p.clone().sub(cam.position).dot(f); };

window.renderView = (view, u = 1, o = {}) => {
  const { sc, J, FP } = build(u), cam = camFor(CAMS[view]()); renderer.render(sc, cam);
  if (!o.labels) return canvas.toDataURL('image/png');
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const g = c2.getContext('2d'); g.drawImage(canvas, 0, 0);
  g.font = '600 22px sans-serif'; g.textAlign = 'center';
  const lab = [['glove port Ø 203 mm (8 in)', B([P.port.x, P.port.y + 0.13, WALL])], ['her LEFT arm, this port', B([-P.port.x, P.port.y + 0.13, WALL])], ['gauntlet hand 205 x 115 mm', J.wrist.clone().add(V(0, 0.06, 0))],
    ['cups Ø 30 mm', B([cups[3][0], 0.05, cups[3][2]])], ['rosette 25 mm', B([ROSE[0], 0.045, ROSE[2]])], ['left shoulder', FP.shoulderL], ['Lúcia 1.64 m', FP.head.clone().add(V(0, 0.15, 0))]];
  for (const [t, p] of lab) { const v = p.clone().project(cam); if (v.z > 1) continue; const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H; const w = g.measureText(t).width + 14;
    g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(x - w / 2, y - 24, w, 30); g.fillStyle = '#ffe9a8'; g.fillText(t, x, y - 3); }
  return c2.toDataURL('image/png');
};
window.measure = (u = 1) => {
  const { J, FP } = build(u), cam = camFor(CAMS.hero()), f = (KW / 2) / Math.tan(P.hfov * Math.PI / 360);
  const sz = (m, p) => +(m * f / depth(cam, p)).toFixed(0);
  const sh = FP.shoulderL, el = FP.elbowL, wr = FP.handL;
  // where the arm crosses the port wall, and how far that is from the port's centre
  const zW = WALL; let cross = null;
  for (const [a, b] of [[sh, el], [el, wr]]) if ((a.z - zW) * (b.z - zW) <= 0) { const t = (a.z - zW) / (a.z - b.z); cross = a.clone().lerp(b, t); }
  const r = (v) => v.toArray().map((x) => +x.toFixed(3));
  return {
    hfov: P.hfov, f_px: +f.toFixed(0),
    px: { cupNear: sz(0.03, B(cups[1])), cupFar: sz(0.03, B(cups[4])), rosette: sz(0.025, B(ROSE)), portInner: sz(P.port.d, J.portC), headHeight: sz(2 * 1.08 * FP.headR, FP.head),
      gloveHandLengthFlat: sz(0.205, J.wrist), gloveKnuckleWidth: sz(0.115, J.wrist), gloveFinger: sz(0.024, J.tip), bareHandWidthAtGlove: sz(0.076, J.wrist) },
    at: { head: px(cam, FP.head).map(Math.round), mouth: px(cam, FP.head.clone().addScaledVector(FP.face, FP.headR * 0.9).add(V(0, -FP.headR * 0.5, 0))).map(Math.round), shoulderL: px(cam, sh).map(Math.round),
      portActive: px(cam, J.portC).map(Math.round), portIdle: px(cam, B([P.port.x, P.port.y, WALL])).map(Math.round), wrist: px(cam, J.wrist).map(Math.round), tip: px(cam, J.tip).map(Math.round), rosette: px(cam, B([ROSE[0], 0.025, ROSE[2]])).map(Math.round) },
    depth_m: { cups: +depth(cam, B(cups[1])).toFixed(3), glove: +depth(cam, J.wrist).toFixed(3), port: +depth(cam, J.portC).toFixed(3), head: +depth(cam, FP.head).toFixed(3) },
    world: { shoulderL: r(sh), elbowL: r(el), wristL: r(wr), head: r(FP.head), portC: r(J.portC) },
    arm: { reach: FP.arms.L.reach, crossesWallAt: cross ? r(cross) : null, offPortCentre_mm: cross ? +(cross.clone().sub(J.portC).length() * 1000).toFixed(0) : null, clearInPort_mm: +((P.port.d / 2 - 0.045) * 1000).toFixed(0),
      faceToWall_mm: +((FP.head.z - FP.headR - WALL) * 1000).toFixed(0), mouthToWall_mm: +((FP.head.clone().addScaledVector(FP.face, FP.headR * 0.9).z - WALL) * 1000).toFixed(0) },
  };
};
window.__ready = Promise.resolve(true);
