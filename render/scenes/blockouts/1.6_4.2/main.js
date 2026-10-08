// Blockout for shots 1.6 and 4.2: Kenton (185 cm) holds M (109 cm) on his RIGHT hip, T (132 cm) holds his LEFT hand;
// all three look at the rocket. M's LEFT arm (the one next to her father) goes round the back of his neck; her free
// RIGHT arm (the outside one) points at the rocket.
//   window.renderView(view, shot) -> PNG data URL.   shot: '1.6' (rocket on the pad) | '4.2' (rocket climbing)
// World: metres. The family stands at the origin and faces -z (the sea, the pad). +x = Kenton's right. y up.
import * as THREE from 'three';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080);
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const D2R = Math.PI / 180;
const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
const COL = {
  skin: 0xe8c4a0, kHair: 0x8a6a3a, kShirt: 0x3b3b40, kPants: 0x17171a, boot: 0x6b4526,
  tHair: 0x1b1512, tSweater: 0x2f5f95, tPants: 0x1d2a44,
  mHair: 0x8b5a34, mDress: 0xf2b8c0, mSock: 0xf4f0e6, mArmL: 0xd23a2a, mArmR: 0x1fa04a,
  sand: 0xb9a57e, water: 0x2b4a6e, crowd: 0x55585f, fence: 0x30333a, palm: 0x2f4a3a, pad: 0x9aa0a8, rocket: 0xf2f2ee,
};

// ---------------------------------------------------------------------------------------------------- primitives
function capsule(grp, a, b, r, color, r2 = r) {
  const d = b.clone().sub(a); const len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, len, 14), mat(color));
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.clone().normalize()); grp.add(m);
  for (const [p, rr] of [[a, r], [b, r2]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(rr, 14, 10), mat(color)); s.position.copy(p); grp.add(s); }
}
function ball(grp, p, r, color, scale = [1, 1, 1]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat(color)); s.position.copy(p); s.scale.set(...scale); grp.add(s); return s; }
// two-bone IK: joint between S and T (bone lengths l1, l2), bent toward `pole`; if T is out of reach the limb is straight
function ik(S, T, l1, l2, pole) {
  const dv = T.clone().sub(S); let d = dv.length(); const dir = dv.clone().normalize();
  if (d >= l1 + l2 - 1e-4) return { mid: S.clone().addScaledVector(dir, l1), end: S.clone().addScaledVector(dir, l1 + l2) };
  d = Math.max(d, Math.abs(l1 - l2) + 1e-4);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const pp = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
  return { mid: S.clone().addScaledVector(dir, a).addScaledVector(pp, h), end: T.clone() };
}
const facing = (deg) => V(Math.sin(deg * D2R), 0, -Math.cos(deg * D2R));    // 0 = -z; + = turned to the figure's right (+x)
const rightOf = (deg) => V(Math.cos(deg * D2R), 0, Math.sin(deg * D2R));

// ---------------------------------------------------------------------------------------------------- figures
// spec: { H, headH, shH, hipH, shW, hipW, ua, fa, hand, thigh, shin, torsoR, limbR }
const KENTON = { H: 1.85, headH: 0.245, shH: 1.52, hipH: 0.96, shW: 0.215, hipW: 0.10, ua: 0.33, fa: 0.28, hand: 0.10, torsoR: 0.17, limbR: 0.05, legR: 0.075 };
const TBOY = { H: 1.32, headH: 0.235, shH: 1.035, hipH: 0.66, shW: 0.15, hipW: 0.075, ua: 0.22, fa: 0.19, hand: 0.075, torsoR: 0.125, limbR: 0.036, legR: 0.052 };
const MGIRL = { H: 1.09, headH: 0.215, seatToSh: 0.34, shW: 0.115, hipW: 0.065, ua: 0.165, fa: 0.145, hand: 0.06, thigh: 0.25, shin: 0.25, torsoR: 0.10, limbR: 0.03, legR: 0.042 };

function head(grp, c, r, look, hair, o = {}) {
  ball(grp, c, r, COL.skin, [0.86, 1, 0.95]);
  const rt = V().crossVectors(look, UP).normalize(), up2 = V().crossVectors(rt, look).normalize();
  // nose: shows where the face points
  const nose = new THREE.Mesh(new THREE.ConeGeometry(r * 0.16, r * 0.42, 10), mat(0xd9a888));
  nose.position.copy(c).addScaledVector(look, r * 0.92).addScaledVector(up2, -r * 0.1); nose.quaternion.setFromUnitVectors(UP, look); grp.add(nose);
  for (const s of [-1, 1]) { ball(grp, c.clone().addScaledVector(rt, s * r * 0.84), r * 0.16, COL.skin); ball(grp, c.clone().addScaledVector(look, r * 0.78).addScaledVector(rt, s * r * 0.36).addScaledVector(up2, r * 0.16), r * 0.085, 0x161616); }
  // hair: a cap over the top and back of the skull
  const back = look.clone().multiplyScalar(-1);
  ball(grp, c.clone().addScaledVector(back, r * 0.2).addScaledVector(up2, r * 0.16), r * 1.02, hair, [0.92, 0.98, 0.96]);
  if (o.curls) { ball(grp, c.clone().addScaledVector(back, r * 0.55).addScaledVector(up2, -r * 0.55), r * 0.95, hair, [1.05, 0.9, 0.8]); ball(grp, c.clone().addScaledVector(back, r * 0.95).addScaledVector(up2, r * 0.55), r * 0.36, hair); }
  if (o.glasses) for (const s of [-1, 1]) { const g = new THREE.Mesh(new THREE.TorusGeometry(r * 0.24, r * 0.035, 6, 16), mat(0x111111)); g.position.copy(c).addScaledVector(look, r * 0.9).addScaledVector(rt, s * r * 0.36).addScaledVector(up2, r * 0.16); g.quaternion.setFromUnitVectors(V(0, 0, 1), look); grp.add(g); }
  if (o.braid) { // M: low side ponytail with the pink elastic, on her right
    const p0 = c.clone().addScaledVector(back, r * 0.7).addScaledVector(rt, r * 0.45).addScaledVector(up2, -r * 0.5);
    ball(grp, p0, r * 0.2, 0xff5fa2); capsule(grp, p0, p0.clone().add(V(0, -r * 1.1, 0)).addScaledVector(back, r * 0.2), r * 0.3, hair, r * 0.16);
  }
}

function torso(grp, pelvis, chest, yawDeg, R, color, depth = 0.62) {
  const d = chest.clone().sub(pelvis); const len = d.length();
  const g = new THREE.Group(); g.position.copy(pelvis).addScaledVector(d, 0.5);
  const qy = new THREE.Quaternion().setFromAxisAngle(UP, -yawDeg * D2R);
  const ql = new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
  g.quaternion.copy(ql).multiply(qy);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.12, R * 0.95, len + R * 0.5, 18), mat(color)); m.scale.set(1, 1, depth); g.add(m); grp.add(g);
}

// a standing figure. o: { base:[x,z], yaw, lean:[x,z] (m, chest offset), look: Vector3 target, armL / armR: { to: Vector3, pole: Vector3 } | undefined (hangs),
//                         colors: {hair, top, bottom}, headOpts, feet: { L:[x,z], R:[x,z] } }
function standing(S, o) {
  const grp = new THREE.Group();
  const F = facing(o.yaw), R = rightOf(o.yaw), b = V(o.base[0], o.groundY || 0, o.base[1]);
  const pelvis = b.clone().add(V(0, S.hipH, 0)).add(V(o.hipShift?.[0] || 0, 0, o.hipShift?.[1] || 0));
  const chest = pelvis.clone().add(V(0, S.shH - S.hipH, 0)).add(V(o.lean?.[0] || 0, 0, o.lean?.[1] || 0));
  torso(grp, pelvis, chest.clone().add(V(0, -0.05, 0)), o.yaw, S.torsoR, o.colors.top);
  // pelvis / trousers
  capsule(grp, pelvis.clone().addScaledVector(R, -S.hipW), pelvis.clone().addScaledVector(R, S.hipW), S.legR * 1.25, o.colors.bottom);
  const out = { grp, pelvis, chest, hands: {}, shoulders: {} };
  for (const [side, s] of [['L', -1], ['R', 1]]) {
    const hip = pelvis.clone().addScaledVector(R, s * S.hipW);
    const ft = o.feet?.[side]; const foot = ft ? V(ft[0], (o.groundY || 0) + 0.06, ft[1]) : b.clone().addScaledVector(R, s * S.hipW * 1.25).add(V(0, 0.06, 0));
    const leg = ik(hip, foot, S.hipH * 0.52, S.hipH * 0.48, F);
    capsule(grp, hip, leg.mid, S.legR, o.colors.bottom, S.legR * 0.85); capsule(grp, leg.mid, leg.end, S.legR * 0.85, o.colors.bottom, S.legR * 0.7);
    capsule(grp, leg.end, leg.end.clone().addScaledVector(F, S.hipH * 0.16), S.legR * 0.8, COL.boot);
    const sh = chest.clone().addScaledVector(R, s * S.shW); out.shoulders[side] = sh;
    const a = o['arm' + side];
    const tgt = a?.to || sh.clone().add(V(0, -(S.ua + S.fa) * 0.98, 0)).addScaledVector(R, s * 0.05).addScaledVector(F, 0.03);
    const pole = a?.pole || R.clone().multiplyScalar(s).addScaledVector(F, -0.6);
    const arm = ik(sh, tgt, S.ua, S.fa, pole);
    capsule(grp, sh, arm.mid, S.limbR * 1.1, a?.sleeve ?? o.colors.sleeve ?? o.colors.top, S.limbR); capsule(grp, arm.mid, arm.end, S.limbR, o.colors.forearm ?? COL.skin, S.limbR * 0.8);
    const hd = arm.end.clone().sub(arm.mid).normalize(); const hand = arm.end.clone().addScaledVector(hd, S.hand);
    capsule(grp, arm.end, hand, S.limbR * 0.85, COL.skin, S.limbR * 0.6); out.hands[side] = hand;
  }
  const neck = chest.clone().add(V(0, 0.04, 0)); const hc = neck.clone().add(V(0, S.headH * 0.62, 0));
  capsule(grp, chest, hc, S.limbR * 1.1, COL.skin);
  const look = o.look.clone().sub(hc).normalize(); head(grp, hc, S.headH / 2, look, o.colors.hair, o.headOpts); out.headC = hc;
  return out;
}

// M carried on a hip. o: { seat: Vector3 (pelvis centre), yaw, look, armL/armR {to, pole}, kneeL, kneeR (Vector3) }
function carried(S, o) {
  const grp = new THREE.Group();
  const F = facing(o.yaw), R = rightOf(o.yaw);
  const pelvis = o.seat.clone(); const chest = pelvis.clone().add(V(0, S.seatToSh, 0)).add(V(o.lean?.[0] || 0, 0, o.lean?.[1] || 0));
  torso(grp, pelvis, chest.clone().add(V(0, -0.03, 0)), o.yaw, S.torsoR, COL.mDress, 0.7);
  // skirt
  const sk = new THREE.Mesh(new THREE.CylinderGeometry(S.torsoR * 1.0, S.torsoR * 1.75, 0.2, 16), mat(COL.mDress)); sk.position.copy(pelvis).add(V(0, -0.05, 0)); grp.add(sk);
  const out = { grp, pelvis, chest, hands: {}, shoulders: {} };
  for (const [side, s] of [['L', -1], ['R', 1]]) {
    const hip = pelvis.clone().addScaledVector(R, s * S.hipW);
    const knee = o['knee' + side]; const kd = knee.clone().sub(hip).normalize(); const kn = hip.clone().addScaledVector(kd, S.thigh);
    const ankle = kn.clone().add(V(0, -S.shin, 0)).addScaledVector(kd, 0.02);
    capsule(grp, hip, kn, S.legR, COL.skin, S.legR * 0.85); capsule(grp, kn, ankle, S.legR * 0.85, COL.mSock, S.legR * 0.7);
    capsule(grp, ankle, ankle.clone().addScaledVector(kd, 0.11), S.legR * 0.95, COL.boot);
    const sh = chest.clone().addScaledVector(R, s * S.shW); out.shoulders[side] = sh;
    const a = o['arm' + side]; const arm = ik(sh, a.to, S.ua, S.fa, a.pole);
    const c = o.codeArms ? (side === 'L' ? COL.mArmL : COL.mArmR) : COL.skin;
    capsule(grp, sh, arm.mid, S.limbR * 1.1, o.codeArms ? c : COL.mDress, S.limbR); capsule(grp, arm.mid, arm.end, S.limbR, c, S.limbR * 0.8);
    const hd = arm.end.clone().sub(arm.mid).normalize(); const hand = arm.end.clone().addScaledVector(hd, S.hand);
    capsule(grp, arm.end, hand, S.limbR * 0.85, c, S.limbR * 0.5); out.hands[side] = hand;
    if (a.point) capsule(grp, hand, hand.clone().addScaledVector(hd, 0.045), S.limbR * 0.4, c, S.limbR * 0.3);
  }
  const hc = chest.clone().add(V(0, 0.03 + S.headH * 0.6, 0));
  capsule(grp, chest, hc, S.limbR, COL.skin);
  const look = o.look.clone().sub(hc).normalize(); head(grp, hc, S.headH / 2, look, COL.mHair, { braid: true }); out.headC = hc;
  return out;
}

// ---------------------------------------------------------------------------------------------------- the scene
// The pad: bearing from the family (0 = straight ahead), distance and scale. Apparent size is that of a ~2 km view.
const PAD = { dist: 2000, rocketH: 92 };
const SHOT = {
  '1.6': { alt: 0, sky: 0x33486b, glow: 0 },
  '4.2': { alt: 600, sky: 0x4a556e, glow: 1 },
};

function build(shotId, o = {}) {
  const sh = SHOT[shotId];
  const scene = new THREE.Scene(); scene.background = new THREE.Color(sh.sky);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x70604a, 1.35));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.3); sun.position.set(3, 6, 8); scene.add(sun);
  // ground: a low dune where the family stands, the beach below it, the sea beyond
  const dune = new THREE.Mesh(new THREE.CircleGeometry(9, 48), mat(COL.sand)); dune.rotation.x = -Math.PI / 2; dune.position.set(0, 0, 2); scene.add(dune);
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(400, 40), mat(0xa8956e)); beach.rotation.x = -Math.PI / 2; beach.position.set(0, -1.0, -12); scene.add(beach);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(9000, 2400), mat(COL.water)); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -1.3, -1225); scene.add(sea);
  const far = new THREE.Mesh(new THREE.BoxGeometry(9000, 22, 60), mat(0x24384a)); far.position.set(0, 8, -PAD.dist - 80); scene.add(far);
  // the rocket and its pad
  const pad = new THREE.Group(); pad.position.set(0, 0, -PAD.dist);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(16, 100, 16), mat(0x6f7884)); tower.position.set(-17, 50, 0); pad.add(tower);
  for (const x of [-95, -60, 45, 80]) { const lt = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 3.5, 120, 6), mat(0x596270)); lt.position.set(x, 60, 0); pad.add(lt); }
  const rk = new THREE.Group(); rk.position.set(0, sh.alt, 0);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 72, 16), mat(COL.rocket)); body.position.y = 36; rk.add(body);
  for (const x of [-5, 5]) { const bo = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 30, 12), mat(COL.rocket)); bo.position.set(x, 15, 0); rk.add(bo); }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(2.5, 12, 16), mat(COL.rocket)); nose.position.y = 78; rk.add(nose);
  const esc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 9, 6), mat(COL.rocket)); esc.position.y = 88; rk.add(esc);
  if (sh.alt > 0) {
    const pl = new THREE.Mesh(new THREE.ConeGeometry(11, sh.alt * 0.62, 16), new THREE.MeshBasicMaterial({ color: 0xffc65a })); pl.position.y = -sh.alt * 0.31; rk.add(pl);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(11, 22, sh.alt * 0.38, 16), new THREE.MeshBasicMaterial({ color: 0xd9a368 })); tr.position.y = -sh.alt * 0.81; rk.add(tr);
    for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(40 + 12 * ((i * 7) % 4), 12, 8), new THREE.MeshBasicMaterial({ color: 0xe0b074 })); c.position.set(-160 + i * 40, 22 + 10 * ((i * 5) % 3), 0); pad.add(c); }
  }
  pad.add(rk); scene.add(pad);
  const target = V(0, sh.alt + 60, -PAD.dist);
  // thin waning crescent, low in the east (right of the pad)
  const moon = new THREE.Mesh(new THREE.SphereGeometry(17, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff2c8 })); moon.position.set(175, 228, -PAD.dist); scene.add(moon);
  const moonDark = new THREE.Mesh(new THREE.SphereGeometry(17, 16, 12), new THREE.MeshBasicMaterial({ color: sh.sky })); moonDark.position.set(168, 235, -PAD.dist + 10); scene.add(moonDark);
  // crowd behind the safety fence, down on the beach
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 46; i++) {
    const x = -16 + rnd() * 34, z = -9.5 - rnd() * 4.5; const hgt = 1.5 + rnd() * 0.3;
    if (Math.abs(x - 0.2) < 0.2) continue;
    const g = new THREE.Group(); capsule(g, V(x, -1.0, z), V(x, -1.0 + hgt * 0.8, z), 0.17, COL.crowd); ball(g, V(x, -1.0 + hgt * 0.93, z), 0.11, 0x40342c);
    if ((sh.alt > 0 && rnd() < 0.6) || rnd() < 0.25) capsule(g, V(x + 0.15, -1.0 + hgt * 0.75, z), V(x + 0.22, -1.0 + hgt * (sh.alt > 0 ? 1.15 : 0.98), z - 0.1), 0.04, COL.crowd);
    scene.add(g);
  }
  for (let x = -18; x <= 18; x += 0.5) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.1, 0.04), mat(COL.fence)); p.position.set(x, -0.45, -14.6); scene.add(p); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(36, 0.05, 0.05), mat(COL.fence)); rail.position.set(0, 0.1, -14.6); scene.add(rail);
  // coconut palms on the left
  for (const [x, z, h, lean] of [[-7.4, -6.5, 8.5, 0.9], [-9.0, -9.5, 7, 0.4], [-9.8, -5.5, 9.5, 1.4]]) {
    const top = V(x + lean, h, z); capsule(scene, V(x, -0.8, z), top, 0.16, 0x5a4a38, 0.11);
    for (let k = 0; k < 9; k++) { const a = k * 0.7; capsule(scene, top, top.clone().add(V(Math.cos(a) * 2.6, -0.6 - 0.5 * (k % 2), Math.sin(a) * 2.6)), 0.09, COL.palm, 0.03); }
  }

  // ---- the family
  const yawK = o.yawK ?? 0;
  const kHandL = V(-0.30, 0.80, -0.04);                            // Kenton's left hand = T's right hand
  const seat = V(0.275, 1.12, -0.04);                              // M's pelvis, astride Kenton's right hip
  const yawM = o.yawM ?? -22;                                      // her chest is turned a little toward him, mostly toward the pad
  const mR = rightOf(yawM), mF = facing(yawM);
  const K = standing(KENTON, { base: [0, 0], yaw: yawK, lean: [-0.045, 0], hipShift: [0.03, 0], look: target,
    colors: { hair: COL.kHair, top: COL.kShirt, bottom: COL.kPants, sleeve: COL.kShirt }, headOpts: { curls: true, glasses: true },
    armL: { to: kHandL.clone().add(V(0, 0.08, 0)), pole: V(-1, 0, 0.4) },
    armR: { to: seat.clone().add(V(0.10, -0.13, -0.15)), pole: V(1, 0.1, 1) },   // forearm under her seat, hand on her outer thigh
    feet: { L: [-0.15, 0.02], R: [0.17, 0.0] } });
  const M = carried(MGIRL, { seat, yaw: yawM, lean: [-0.03, -0.01], look: target, codeArms: !!o.codeArms,
    kneeL: seat.clone().add(V(-0.10, -0.06, 0.24)),                 // her left leg goes round behind his back
    kneeR: seat.clone().add(V(-0.16, -0.05, -0.22)),                // her right leg lies across the front of his belly
    armL: { to: V(-0.07, 1.585, 0.075), pole: V(0, 1, 0.5) },        // left hand on the far side of the back of his neck
    armR: { to: target, pole: V(0, -1, 0), point: true } });        // right arm straight at the rocket
  const T = standing(TBOY, { base: [-0.52, -0.06], yaw: o.yawT ?? 4, lean: [0.015, 0], look: target,
    colors: { hair: COL.tHair, top: COL.tSweater, bottom: COL.tPants }, headOpts: {},
    armR: { to: kHandL.clone().add(V(0, -0.06, 0)), pole: V(0.3, 0, 1) },
    feet: { L: [-0.62, -0.04], R: [-0.44, -0.08] } });
  scene.add(K.grp, M.grp, T.grp);
  return { scene, target, K, M, T };
}

// ---------------------------------------------------------------------------------------------------- cameras
// 'A' is the chosen camera: behind the family and round to their RIGHT by `az` degrees, low; the family sits left of
// centre and the pad right of centre, so M's pointing right arm crosses open sky.
export const VIEWS = {
  A: { az: 32, dist: 2.8, height: 1.15, hfov: 62, aimAz: 16.5, pitch16: 4, pitch42: 6 },
  behind: { az: 0, dist: 3.4, height: 1.05, hfov: 50, aimAz: 0, pitch16: 6, pitch42: 9 },
  left: { az: -32, dist: 2.8, height: 1.15, hfov: 62, aimAz: -16.5, pitch16: 4, pitch42: 6 },
  front: { free: [1.6, 1.5, -2.6], look: [0.1, 1.3, 0], hfov: 45 },
  top: { ortho: 3.2 },
};

function cameraFor(name, shotId) {
  const v = VIEWS[name], aspect = W / H;
  if (v.ortho) { const c = new THREE.OrthographicCamera(-v.ortho * aspect / 2, v.ortho * aspect / 2, v.ortho / 2, -v.ortho / 2, 0.1, 100); c.position.set(0.2, 30, -0.3); c.up.set(0, 0, -1); c.lookAt(0.2, 0, -0.3); return c; }
  const vfov = 2 * Math.atan(Math.tan(v.hfov * D2R / 2) / aspect) / D2R;
  const cam = new THREE.PerspectiveCamera(vfov, aspect, 0.05, 20000);
  if (v.free) { cam.position.set(...v.free); cam.lookAt(...v.look); return cam; }
  cam.position.set(v.dist * Math.sin(v.az * D2R), v.height, v.dist * Math.cos(v.az * D2R));
  // aim: `aimAz` degrees to the right of the line from the camera to the family, pitched up
  const base = Math.atan2(-cam.position.x, -cam.position.z);                      // yaw of the camera->family line
  const yaw = base - v.aimAz * D2R, pitch = (shotId === '4.2' ? v.pitch42 : v.pitch16) * D2R;
  const dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  cam.lookAt(cam.position.clone().add(dir));
  return cam;
}

window.renderView = (name, shotId = '1.6', o = {}) => {
  if (o.view) Object.assign(VIEWS[name], o.view);
  const { scene } = build(shotId, o);
  const cam = cameraFor(name, shotId);
  if (name === 'top') { // draw the chosen camera and its sight lines on the plan
    const a = VIEWS.A; const cp = V(a.dist * Math.sin(a.az * D2R), 0.05, a.dist * Math.cos(a.az * D2R));
    ball(scene, cp.clone().setY(1.9), 0.07, 0xff0000); capsule(scene, cp.clone().setY(1.9), V(0, 1.9, 0), 0.008, 0xff0000); capsule(scene, V(0.3, 1.9, 0), V(0.3, 1.9, -3), 0.008, 0xffcc00);
  }
  renderer.render(scene, cam);
  return canvas.toDataURL('image/png');
};
window.__ready = Promise.resolve(true);
