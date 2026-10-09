// 7.D2 / 7.D3 / 7.D3c — Jade touches her daughter's hand on the livestream screen with ONE fingertip (rev 3, Oct 8).
// Blockout of the arm at her true proportions (165 cm), seen through the film's camera and laid over the recomposed
// painting, so the image model gets a pose whose shoulder, upper arm, elbow, forearm and wrist have real lengths.
//   window.renderView(view, mode, u) -> PNG data URL
//     view: 'film' (the keyframe's camera) | 'top' | 'front' (from the screen, looking back at her) | 'side' (3/4)
//     mode: 'overlay' (mannequin over the painting) | 'guide' (her reaching arm only, over the painting) | 'plain'
//     u:    0..1 how far the reach has got (1 = fingertip on the child's hand)
// Camera space: the film camera sits at the origin looking down -z, y up; "depth" d is z = -d. Pixel (px, py) of the
// 1920x1080 frame at depth d is the point ((px-960)/f*d, -(py-540)/f*d, -d), f = 960 / tan(hfov/2).
// The painting itself (her likeness) lives in media/ and is passed in by URL (?bg=...); nothing of it is stored here.
import * as THREE from 'three';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080);
const BG = q.get('bg') || '/media/keyframes/jade/_J7D2_work/L0.png';
const P = JSON.parse(q.get('p') || '{}');                       // overrides of POSE below
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- the measured layout (px of the recomposed 1920x1080 painting; tools: scratch d2/layout.py) ---------------------
export const POSE = {
  hfov: 32,                          // a long lens: her profile is flat in the painting
  headPx: 391,                       // vertex -> chin in px; a 165 cm woman's head is 0.225 m with hair
  eye: [1537, 310], headC: [1672, 268],
  touch: [790, 345],                 // the child's raised hand on the screen
  touchSide: -0.05,                  // m: the touch point's distance from her midsagittal plane (+ = toward the camera)
  // the painted torso is turned about 45 deg toward the camera under a head in profile: her RIGHT shoulder is the far
  // one, forward of the neck, under the lock of hair below her chin, and its short sleeve is already in the painting
  shoulderPx: [1635, 586], shoulderDD: 0.11,   // px of the reaching (right) shoulder joint; m further than the midplane
  H: 1.65,
  // anthropometry (Drillis & Contini fractions of stature)
  upper: 0.186, fore: 0.146, hand: 0.108, biacromial: 0.215,
  elbowOut: 0.2,                     // pole: 0 = elbow straight down, 1 = elbow out to her right (away from the camera)
  wristExt: 10,                      // deg: the hand cocked back a little from the forearm
  roll: 40,                          // deg: back of the hand turned from "up" away from the camera (thumb side to us)
  startDrop: [0.085, -0.115, 0.01],  // m (toward her, down, toward the camera): where the fingertip is at u = 0
  ...P,
};
const f = (W / 2) / Math.tan(POSE.hfov * Math.PI / 360);
const D0 = 0.225 * f / POSE.headPx;                               // depth of her midsagittal plane
const at = (px, d) => V((px[0] - W / 2) / f * d, -(px[1] - H / 2) / f * d, -d);
const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const SKIN = 0xf1c9a0, SLEEVE = 0xf7f3e8, HAIR = 0x26221f, SCREEN = 0xffc45a;

function capsule(a, b, r, m) {
  const d = b.clone().sub(a), len = d.length();
  const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(len, 1e-4), 6, 14), m);
  o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); return o;
}
function taper(a, b, r1, r2, m) {
  const d = b.clone().sub(a), len = d.length();
  const g = new THREE.Group();
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, 18), m);
  o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); g.add(o);
  for (const [p, r] of [[a, r1], [b, r2]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m); s.position.copy(p); g.add(s); }
  return g;
}
function ik(root, target, l1, l2, pole) {
  const d = target.clone().sub(root); let dist = d.length(); const max = (l1 + l2) * 0.999; const reach = dist / (l1 + l2);
  if (dist > max) { d.multiplyScalar(max / dist); dist = max; }
  const n = d.clone().normalize(), a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const p = pole.clone().addScaledVector(n, -pole.dot(n)).normalize();
  return { mid: root.clone().addScaledVector(n, a).addScaledVector(p, h), end: root.clone().add(d), reach };
}

// ---- joints ------------------------------------------------------------------------------------------------------
export function joints(u = 1) {
  const p = POSE, h = p.H;
  const eye = at(p.eye, D0), headC = at(p.headC, D0);
  // she faces image-left (-x); her left is toward the camera (+z); up is +y
  const FWD = V(-1, 0, 0), LEFT = V(0, 0, 1), UP = V(0, 1, 0);
  // the reaching arm is her RIGHT; variable names keep "shL" = the reaching shoulder, "shR" = the other (near, left) one
  const shL = at(p.shoulderPx, D0 + p.shoulderDD);
  const shR = shL.clone().addScaledVector(LEFT, p.biacromial * h * 0.72).addScaledVector(FWD, -p.biacromial * h * 0.70);
  const shC = shL.clone().lerp(shR, 0.5);
  const U = p.upper * h, F = p.fore * h, HD = p.hand * h;
  // where the fingertip lands: on the ray through the child's hand, a little to her left of her midline
  const touch = at(p.touch, D0 - p.touchSide);
  const start = touch.clone().addScaledVector(FWD, -p.startDrop[0]).addScaledVector(UP, p.startDrop[1]).addScaledVector(LEFT, p.startDrop[2]);
  const e = u * u * (3 - 2 * u), tip = start.clone().lerp(touch, e);
  // index finger: knuckle (MCP) 0.52 of the hand from the wrist, finger 0.44 of the hand; the finger lies a few degrees
  // above the forearm line (wrist cocked back), so solve the arm to the WRIST for a hand that points at the fingertip
  const INDEX = 0.44 * HD, PALM = 0.54 * HD, TIPL = PALM + INDEX;
  const pole = V(0, -1, 0).addScaledVector(LEFT, -p.elbowOut).addScaledVector(FWD, -0.15);
  let wrist = tip.clone().addScaledVector(FWD, -TIPL), r, hx;
  for (let i = 0; i < 12; i++) {
    r = ik(shL, wrist, U, F, pole);
    const fa = wrist.clone().sub(r.mid).normalize();                            // forearm direction
    // hand direction: the forearm direction pitched up by wristExt about the axis that lies across the hand
    const across = new THREE.Vector3().crossVectors(fa, UP).normalize();
    hx = fa.clone().applyAxisAngle(across, p.wristExt * Math.PI / 180).normalize();
    wrist = tip.clone().addScaledVector(hx, -TIPL);
  }
  r = ik(shL, wrist, U, F, pole);
  // hand frame: hx along the fingers, hn = out of the back of the hand, hy = toward the thumb side
  const up0 = UP.clone().addScaledVector(hx, -UP.dot(hx)).normalize();
  const hn = up0.clone().applyAxisAngle(hx, p.roll * Math.PI / 180).normalize();   // the back of the hand turned away from the camera
  // RIGHT hand, back up, fingers forward (-x): the thumb side is her left = toward the camera
  const hy = new THREE.Vector3().crossVectors(hn, hx).normalize();
  const J = { eye, headC, shC, shL, shR, elbow: r.mid, wrist, tip, touch, start, reach: r.reach, hx, hn, hy, U, F, HD, PALM, INDEX, FWD, LEFT, UP,
    hipC: shC.clone().addScaledVector(UP, -0.30 * h).addScaledVector(FWD, -0.02) };
  // the far arm hangs at her side, forearm a little forward
  const tr = shR.clone().addScaledVector(UP, -(U + F) * 0.96).addScaledVector(FWD, 0.06);
  const rr = ik(shR, tr, U, F, V(0, -0.2, 0).addScaledVector(FWD, -1)); J.elbowR = rr.mid; J.wristR = rr.end;
  J.elbowDeg = Math.acos(THREE.MathUtils.clamp(shL.clone().sub(r.mid).normalize().dot(wrist.clone().sub(r.mid).normalize()), -1, 1)) * 180 / Math.PI;
  J.upperBelowHoriz = Math.asin(-(r.mid.clone().sub(shL).normalize().y)) * 180 / Math.PI;
  J.eyeToTouch = eye.distanceTo(touch);
  return J;
}

function buildHand(J, skin) {
  const g = new THREE.Group(), { wrist, hx, hn, hy, HD, PALM, INDEX } = J;
  const k = HD / 0.178, pt = (a, b, c) => wrist.clone().addScaledVector(hx, a * k).addScaledVector(hy, b * k).addScaledVector(hn, c * k);
  // palm: a flattened box from the wrist to the knuckles (hy: + = thumb side)
  const palm = new THREE.Mesh(new THREE.BoxGeometry(PALM, 0.078 * k, 0.024 * k), skin);
  palm.position.copy(pt(PALM / k / 2, 0, -0.002)); palm.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(hx, hy, hn)); g.add(palm);
  // index finger: straight, three phalanges, on the thumb side of the palm
  const iy = 0.028; let a = pt(PALM / k, iy, 0);
  const seg = [0.44, 0.31, 0.25].map((s) => s * INDEX / k), rad = [0.0088, 0.0078, 0.007];
  seg.forEach((s, i) => { const b = a.clone().addScaledVector(hx, s * k); g.add(capsule(a, b, rad[i] * k, skin)); a = b; });
  // the other three fingers: loosely curled under the palm (each phalanx turns further toward the palm side, -hn)
  [[0.008, 0.096, 0.0085], [-0.012, 0.09, 0.008], [-0.031, 0.072, 0.007]].forEach(([y, len, r], i) => {
    let p0 = pt(PALM / k - 0.002 * i, y, 0); let ang = 0;
    [[0.44, 62], [0.31, 150], [0.25, 205]].forEach(([s, deg]) => {
      ang = (deg + i * 4) * Math.PI / 180;
      const dir = hx.clone().multiplyScalar(Math.cos(ang)).addScaledVector(hn, -Math.sin(ang));
      const p1 = p0.clone().addScaledVector(dir, s * len * k); g.add(capsule(p0, p1, r * k, skin)); p0 = p1;
    });
  });
  // thumb: from the base of the palm on the thumb side, lying forward along the side of the curled middle finger
  const t0 = pt(0.022, 0.036, -0.006), t1 = pt(0.058, 0.05, -0.016), t2 = pt(0.09, 0.044, -0.026), t3 = pt(0.112, 0.034, -0.03);
  g.add(capsule(t0, t1, 0.0115 * k, skin)); g.add(capsule(t1, t2, 0.0098 * k, skin)); g.add(capsule(t2, t3, 0.0088 * k, skin));
  return g;
}

function buildFigure(u, opt = {}) {
  const J = joints(u), g = new THREE.Group(), h = POSE.H;
  const skin = mat(SKIN), sleeve = mat(SLEEVE);
  const arm = new THREE.Group();
  // near arm: short polo sleeve over the upper 55% of the upper arm
  const mid = J.shL.clone().lerp(J.elbow, 0.5);
  arm.add(taper(J.shL, mid, 0.046, 0.043, sleeve)); arm.add(taper(mid, J.elbow, 0.036, 0.031, skin));
  arm.add(taper(J.elbow, J.wrist, 0.032, 0.0215, skin)); arm.add(buildHand(J, skin));
  const sh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 14), sleeve); sh.position.copy(J.shL); arm.add(sh);
  g.add(arm); g.userData.arm = arm; g.userData.J = J;
  if (!opt.armOnly) {
    const body = new THREE.Group();
    const torso = capsule(J.hipC, J.shC.clone().addScaledVector(J.UP, -0.03), 0.095, sleeve); torso.scale.set(1.35, 1, 1.35); body.add(torso);
    body.add(capsule(J.shC, J.headC.clone().addScaledVector(J.UP, -0.07), 0.045, skin));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 18), skin); head.position.copy(J.headC); head.scale.set(0.95, 1.1, 0.78); body.add(head);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.035, 8), skin); nose.position.copy(J.eye).add(V(-0.045, -0.035, 0)); nose.rotation.z = Math.PI / 2; body.add(nose);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.106, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.6), mat(HAIR)); hair.position.copy(J.headC).add(V(0.012, 0.004, 0)); hair.scale.set(0.95, 1.1, 0.8); hair.rotation.z = -0.5; body.add(hair);
    body.add(capsule(J.headC.clone().add(V(0.07, -0.02, 0)), J.shC.clone().add(V(0.09, -0.25, 0)), 0.03, mat(HAIR)));
    body.add(taper(J.shR, J.elbowR, 0.048, 0.038, sleeve)); body.add(taper(J.elbowR, J.wristR, 0.035, 0.024, skin));
    g.add(body); g.userData.body = body;
  }
  return g;
}

function buildScreen(J) {
  // the screen: a 0.62 x 0.50 m panel through the touch point, turned to face her (and 20 deg toward the camera, as painted)
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.5), new THREE.MeshBasicMaterial({ color: SCREEN, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }));
  m.position.copy(J.touch).add(V(-0.012, -0.11, 0)); m.rotation.y = Math.PI / 2 - 20 * Math.PI / 180; g.add(m);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff2a2a })); dot.position.copy(J.touch); g.add(dot);
  return g;
}

let bgTex = null;
const ready = new Promise((res) => new THREE.TextureLoader().load(BG, (t) => { t.colorSpace = THREE.SRGBColorSpace; bgTex = t; res(); }, undefined, () => res()));

function camFor(view, J) {
  if (view === 'film') {
    const vfov = 2 * Math.atan(Math.tan(POSE.hfov * Math.PI / 360) / (W / H)) * 180 / Math.PI;
    const c = new THREE.PerspectiveCamera(vfov, W / H, 0.05, 50); c.position.set(0, 0, 0); c.lookAt(0, 0, -1); return c;
  }
  const c = new THREE.PerspectiveCamera(30, W / H, 0.05, 50), ctr = J.shC.clone().lerp(J.touch, 0.5);
  if (view === 'top') { c.position.copy(ctr).add(V(0, 2.2, 0.001)); c.up.set(-1, 0, 0); }
  else if (view === 'front') c.position.copy(J.touch).add(V(-1.6, 0.1, 0.5));
  else c.position.copy(ctr).add(V(-1.2, 0.5, 1.9));
  c.lookAt(ctr); return c;
}

window.renderView = (view = 'film', mode = 'overlay', u = 1) => {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777788, 1.7));
  const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(-1.5, 2.5, 3); scene.add(dl);
  const fig = buildFigure(u, { armOnly: view === 'film' && mode === 'guide' }), J = fig.userData.J;
  scene.add(fig);
  if (view === 'film') { scene.background = mode === 'plain' ? new THREE.Color(0x0e2247) : bgTex;
    if (mode === 'overlay' && fig.userData.body) fig.userData.body.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; } });
  } else { scene.background = new THREE.Color(0x1c2544); scene.add(buildScreen(J)); const gr = new THREE.GridHelper(4, 40, 0x556, 0x334); gr.position.set(J.shC.x, J.hipC.y - 0.2, J.shC.z); scene.add(gr); }
  const cam = camFor(view, J); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  renderer.render(scene, cam);
  return canvas.toDataURL('image/png');
};
window.info = (u = 1) => { const J = joints(u), px = (v) => [Math.round(W / 2 + v.x / -v.z * f), Math.round(H / 2 - v.y / -v.z * f)];
  return { f: Math.round(f), depth: +D0.toFixed(3), reach: +J.reach.toFixed(3), elbowDeg: +J.elbowDeg.toFixed(1), upperArmBelowHorizontalDeg: +J.upperBelowHoriz.toFixed(1), eyeToTouchM: +J.eyeToTouch.toFixed(3),
    px: { shoulderL: px(J.shL), elbow: px(J.elbow), wrist: px(J.wrist), tip: px(J.tip), touch: px(J.touch), start: px(J.start), shoulderR: px(J.shR) },
    m: { upper: +J.U.toFixed(3), fore: +J.F.toFixed(3), hand: +J.HD.toFixed(3) } }; };
window.__ready = ready;
