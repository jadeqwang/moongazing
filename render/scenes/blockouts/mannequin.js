// Mannequins for staging blockouts: true heights, a clear front (nose, eyes), on-model hair marks, 2-bone IK arms and
// legs. Units are metres, y up. A figure spec:
//   { who, pose: 'sit' | 'stand', at: [x, z], seat: 0.45, yaw: deg (0 faces +z, 90 faces +x), lean: deg forward,
//     tilt: deg toward the figure's own right, twist: deg extra shoulder yaw, look: [x, y, z] | 'tablet' | '<who>',
//     L / R: hand target [x, y, z] | 'knee' | 'side' | 'tablet:<grip>' | { on: '<who>', part: 'shoulderL' | ... },
//     feet: 'floor' | 'up' (knees drawn up on a bunk) | 'cross' }
import * as THREE from 'three';

export const CREW = {
  chen: { name: 'Chen Yu', h: 1.78, skin: 0xe0b48c, hair: 0x1b1b1f, stripe: 0xc8312b, wide: 1.1 },
  anastasia: { name: 'Anastasia', h: 1.70, skin: 0xf1d6c2, hair: 0xcdb98e, stripe: 0x6b4c9a, style: 'braid' },
  adaeze: { name: 'Adaeze', h: 1.68, skin: 0x553626, hair: 0x15110f, stripe: 0x3a8a6e, style: 'afro' },
  arjun: { name: 'Arjun', h: 1.74, skin: 0xa5744d, hair: 0x16130f, stripe: 0x1b1b1f, moustache: true },
  jade: { name: 'Jade', h: 1.65, skin: 0xe8c6a4, hair: 0x0e0e10, stripe: 0x9cc5b0, style: 'ponytail', glasses: true },
  lucia: { name: 'Lúcia', h: 1.64, skin: 0xd9b48e, hair: 0x3d281a, stripe: 0xe3a6a0, style: 'wavytail' },
  kenji: { name: 'Kenji', h: 1.72, skin: 0xe2bd95, hair: 0x55555a, stripe: 0x2f6690, glasses: true },
  layla: { name: 'Layla', h: 1.67, skin: 0xcfa07a, hair: 0x1a1512, stripe: 0xd4a84b, style: 'bun' },
  // the family (7.C2 / 7.C3)
  M: { name: 'M', h: 1.09, skin: 0xf0cfb4, hair: 0x7a5234, stripe: 0xf0a8b8, style: 'sidetail', child: 1, top: 0xf3c6cf, legs: 0xf0cfb4 },
  T: { name: 'T', h: 1.32, skin: 0xefcdb0, hair: 0x1c1512, stripe: 0x2f6690, child: 0.6, top: 0x2f6690, legs: 0x26304a, bighead: 1.18 },
  kenton: { name: 'Kenton', h: 1.85, skin: 0xe9c8ae, hair: 0x9a7b4a, stripe: 0x3a3a3e, style: 'curls', glasses: true, top: 0x3a3a3e, legs: 0x151517 },
};

const V = (a) => (a.isVector3 ? a.clone() : new THREE.Vector3(...a));
const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const rad = (d) => d * Math.PI / 180;

function limb(a, b, r, m, tag) {
  const d = b.clone().sub(a), len = d.length();
  const g = new THREE.CapsuleGeometry(r, Math.max(len, 1e-4), 6, 12);
  const o = new THREE.Mesh(g, m); o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); o.userData.tag = tag; return o;
}
function ball(p, r, m, tag, s = [1, 1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m); o.position.copy(p); o.scale.set(...s); o.userData.tag = tag; return o; }
// two-bone IK: root, target, lengths, pole direction -> { mid, end, reach }
function ik(root, target, l1, l2, pole) {
  const d = target.clone().sub(root); let dist = d.length(); const max = (l1 + l2) * 0.999;
  const reach = dist / (l1 + l2); if (dist > max) { d.multiplyScalar(max / dist); dist = max; }
  const end = root.clone().add(d), n = d.clone().normalize();
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const p = pole.clone().addScaledVector(n, -pole.dot(n)); if (p.lengthSq() < 1e-8) p.set(0, -1, 0); p.normalize();
  return { mid: root.clone().addScaledVector(n, a).addScaledVector(p, h), end, reach };
}

// Build one figure. `ctx.resolve(name, fig)` turns a named target ('tablet', 'tablet:L', '<who>', {on, part}) into a point.
export function buildFigure(spec, ctx) {
  const c = CREW[spec.who], h = c.h, w = c.wide || 1, k = c.child || 0;
  const g = new THREE.Group(); g.userData.who = spec.who;
  const yaw = rad(spec.yaw || 0), fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), right = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw));
  // (figure's own right: facing +z, its right hand is at -x)
  const up = new THREE.Vector3(0, 1, 0);
  const headR = h * (0.066 + 0.012 * k) * (c.bighead || 1), torsoL = h * (0.30 - 0.02 * k), thigh = h * (0.245 - 0.02 * k), shin = h * (0.246 - 0.02 * k);
  const uArm = h * 0.172, fArm = h * 0.20, shW = h * 0.118 * w, hipW = h * 0.055 * w;
  const sit = spec.pose === 'sit';
  const hipY = sit ? (spec.seat ?? 0.45) + h * 0.05 : thigh + shin + h * 0.045 - (spec.crouch || 0);
  const hip = new THREE.Vector3(spec.at[0], hipY, spec.at[1]);
  const lean = rad(spec.lean || 0), tilt = rad(spec.tilt || 0);
  const tdir = up.clone().multiplyScalar(Math.cos(lean) * Math.cos(tilt)).addScaledVector(fwd, Math.sin(lean)).addScaledVector(right, Math.sin(tilt)).normalize();
  const syaw = yaw + rad(spec.twist || 0), sfwd = new THREE.Vector3(Math.sin(syaw), 0, Math.cos(syaw)), sright = new THREE.Vector3(-Math.cos(syaw), 0, Math.sin(syaw));
  const chest = hip.clone().addScaledVector(tdir, torsoL);
  const shR = chest.clone().addScaledVector(sright, shW), shL = chest.clone().addScaledVector(sright, -shW);
  const neck = chest.clone().addScaledVector(tdir, h * 0.035);
  const head = neck.clone().addScaledVector(tdir, headR * 1.05).addScaledVector(sfwd, headR * 0.12);
  const P = { hip, chest, shoulderR: shR, shoulderL: shL, head, fwd: sfwd, right: sright, headR, h };
  g.userData.P = P; g.userData.spec = spec;
  const add = (o) => { g.add(o); return o; };
  const top = mat(c.top ?? 0xf4f1ea), legs = mat(c.legs ?? 0x4a4a4e), skin = mat(c.skin), hair = mat(c.hair), sock = mat(0x9aa0b4);
  // torso (flattened capsule), collar stripe
  const torso = limb(hip.clone().addScaledVector(tdir, 0.02), chest.clone().addScaledVector(tdir, -0.03), h * 0.075 * w, top, 'torso');
  const tq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), sfwd); torso.quaternion.premultiply(new THREE.Quaternion()); // keep
  torso.scale.set(1.55, 1, 0.95); torso.rotateOnWorldAxis(up, 0); add(torso);
  // orient the torso's wide axis along the shoulder line
  { const y = tdir.clone(), x = sright.clone().addScaledVector(y, -sright.dot(y)).normalize(), z = new THREE.Vector3().crossVectors(x, y);
    torso.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); }
  const collar = new THREE.Mesh(new THREE.TorusGeometry(h * 0.036, h * 0.011, 8, 20), mat(c.stripe));
  collar.position.copy(neck).addScaledVector(tdir, -0.005); collar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tdir); collar.userData.tag = 'collar'; add(collar);
  add(limb(chest, neck.clone().addScaledVector(tdir, headR * 0.3), h * 0.028, skin, 'neck'));
  // legs
  [[1, 'R'], [-1, 'L']].forEach(([s, n]) => {
    const hj = hip.clone().addScaledVector(right, s * hipW);
    let foot, pole;
    if (!sit) { foot = new THREE.Vector3(hj.x + right.x * s * 0.03 + fwd.x * (spec.step?.[n] || 0), 0.06, hj.z + right.z * s * 0.03 + fwd.z * (spec.step?.[n] || 0)); pole = fwd.clone(); }
    else if (spec.feet === 'up') { foot = hj.clone().addScaledVector(fwd, thigh * 0.95).addScaledVector(right, s * 0.03); foot.y = (spec.seat ?? 0.45) + 0.05; pole = up.clone(); }
    else if (spec.feet === 'up1' && s === (spec.kneeUp || -1) * -1) { foot = hj.clone().addScaledVector(fwd, thigh * 0.75).addScaledVector(right, s * 0.03); foot.y = (spec.seat ?? 0.45) + 0.05; pole = up.clone(); }
    else if (spec.feet === 'cross') { foot = hip.clone().addScaledVector(fwd, thigh * 0.55).addScaledVector(right, -s * 0.16); foot.y = (spec.seat ?? 0.45) + 0.06; pole = right.clone().multiplyScalar(s).add(up.clone().multiplyScalar(0.3)); }
    else { foot = hj.clone().addScaledVector(fwd, thigh * 1.0 + (spec.reachFeet || 0)).addScaledVector(right, s * 0.05); foot.y = Math.max(0.06, hj.y - shin * 1.02); pole = up.clone().addScaledVector(fwd, 0.6); }
    const r = ik(hj, foot, thigh, shin, pole);
    add(limb(hj, r.mid, h * 0.048 * w, legs, 'thigh' + n)); add(limb(r.mid, r.end, h * 0.036 * w, legs, 'shin' + n));
    add(limb(r.end, r.end.clone().addScaledVector(sit && spec.feet === 'cross' ? right.clone().multiplyScalar(-s) : fwd, h * 0.07).setY(r.end.y - 0.02), h * 0.026, sock, 'foot' + n));
    P['knee' + n] = r.mid; P['foot' + n] = r.end;
  });
  // head: looks at a target
  const lookT = spec.look ? ctx.resolve(spec.look, g) : head.clone().addScaledVector(sfwd, 1);
  const hf = lookT.clone().sub(head).normalize();
  // the skull follows the gaze only part of the way down or up (the eyes do the rest)
  const hd = hf.clone(); hd.y *= 0.55; hd.normalize();
  const hq = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(), hd.clone().negate(), up)); // local +z = hd
  const hg = new THREE.Group(); hg.position.copy(head); hg.quaternion.copy(hq); add(hg);
  const hb = ball(new THREE.Vector3(), headR, skin, 'head', [0.86, 1.08, 0.98]); hg.add(hb);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.16, headR * 0.42, 8), skin); nose.rotation.x = Math.PI / 2; nose.position.set(0, -headR * 0.12, headR * 1.02); nose.userData.tag = 'nose'; hg.add(nose);
  const dark = mat(0x121214);
  [-1, 1].forEach((s) => { const e = ball(new THREE.Vector3(s * headR * 0.33, headR * 0.12, headR * 0.86), headR * 0.085, dark, 'eye'); hg.add(e);
    const ear = ball(new THREE.Vector3(s * headR * 0.84, 0, 0), headR * 0.2, skin, 'ear', [0.5, 1, 0.8]); hg.add(ear);
    if (c.glasses) { const gl = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.24, headR * 0.03, 6, 18), dark); gl.position.set(s * headR * 0.36, headR * 0.12, headR * 0.93); gl.userData.tag = 'glasses'; hg.add(gl); } });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(headR * 0.5, headR * 0.05, headR * 0.05), mat(0x8a4a40)); mouth.position.set(0, -headR * 0.5, headR * 0.86); hg.add(mouth);
  if (c.moustache) { const m = new THREE.Mesh(new THREE.BoxGeometry(headR * 0.6, headR * 0.09, headR * 0.06), hair); m.position.set(0, -headR * 0.36, headR * 0.92); hg.add(m); }
  // hair cap: back and top of the skull
  const cap = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.06, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), hair); cap.scale.set(0.9, 1.1, 1.02); cap.rotation.x = -0.5; cap.userData.tag = 'hair'; hg.add(cap);
  if (c.style === 'afro') { const a = ball(new THREE.Vector3(0, headR * 0.28, -headR * 0.1), headR * 1.12, hair, 'hair', [0.98, 0.95, 1]); hg.add(a); }
  if (c.style === 'curls') { const a = ball(new THREE.Vector3(0, headR * 0.1, -headR * 0.35), headR * 1.25, hair, 'hair', [1, 1.05, 0.95]); hg.add(a); const kn = ball(new THREE.Vector3(0, headR * 0.9, -headR * 0.75), headR * 0.4, hair, 'hair'); hg.add(kn); }
  if (c.style === 'bun') { hg.add(ball(new THREE.Vector3(0, -headR * 0.45, -headR * 1.05), headR * 0.42, hair, 'hair')); }
  if (c.style === 'sidetail') { hg.add(limb(new THREE.Vector3(-headR * 0.8, -headR * 0.4, -headR * 0.3), new THREE.Vector3(-headR * 0.95, -headR * 1.9, 0), headR * 0.2, hair, 'hair')); }
  // hair that hangs with gravity (world space): braid over the front of the left shoulder, ponytails down the back
  if (c.style === 'braid') { const a = head.clone().addScaledVector(hd, -headR * 0.7).addScaledVector(sright, -headR * 0.5); const b = shL.clone().addScaledVector(sfwd, h * 0.07).addScaledVector(sright, h * 0.03); const e = b.clone().addScaledVector(tdir, -h * 0.17); add(limb(a, b, h * 0.017, hair, 'hair')); add(limb(b, e, h * 0.016, hair, 'hair')); }
  if (c.style === 'ponytail' || c.style === 'wavytail') {
    const a = head.clone().addScaledVector(hd, -headR * 0.85).addScaledVector(up, -headR * 0.5);
    const len = c.style === 'ponytail' ? torsoL * 0.5 : torsoL * 0.3;   // Jade: to mid-back, never longer
    const b = chest.clone().addScaledVector(sfwd, -h * 0.085).addScaledVector(tdir, -len);
    add(limb(a, b, h * (c.style === 'ponytail' ? 0.02 : 0.03), hair, 'hair'));
  }
  // arms
  const armRep = {};
  [['R', shR, 1], ['L', shL, -1]].forEach(([n, sh, s]) => {
    let t = spec[n], tgt;
    if (!t || t === 'side') tgt = sh.clone().addScaledVector(tdir, -(uArm + fArm) * 0.97).addScaledVector(sright, s * 0.05).addScaledVector(sfwd, 0.03);
    else if (t === 'knee') tgt = P['knee' + n].clone().addScaledVector(up, 0.07).addScaledVector(fwd, -0.03);
    else if (t === 'mouth') tgt = head.clone().addScaledVector(hd, headR * 1.05).addScaledVector(up, -headR * 0.55);
    else if (t === 'heart') tgt = chest.clone().addScaledVector(sfwd, h * 0.085).addScaledVector(sright, -h * 0.03).addScaledVector(tdir, -h * 0.07);
    else if (t === 'chin') tgt = head.clone().addScaledVector(hd, headR * 0.7).addScaledVector(up, -headR * 1.15);
    else if (t === 'lap') tgt = hip.clone().addScaledVector(fwd, thigh * 0.5).addScaledVector(right, s * 0.07).addScaledVector(up, 0.11);
    else tgt = ctx.resolve(t, g);
    const pole = new THREE.Vector3(0, -1, 0).addScaledVector(sright, s * (spec.elbowOut ?? 0.45)).addScaledVector(sfwd, -0.35);
    const r = ik(sh, tgt, uArm, fArm, pole);
    add(limb(sh, r.mid, h * 0.03 * w, top, 'upperarm' + n)); add(limb(r.mid, r.end, h * 0.024 * w, skin, 'forearm' + n)); add(ball(r.end, h * 0.03, skin, 'hand' + n, [1, 1, 0.7]));
    P['hand' + n] = r.end; P['elbow' + n] = r.mid;
    // how far behind the chest plane the hand and elbow are (m): > 0.05 reads as "arm stuck out behind"
    armRep[n] = { reach: +r.reach.toFixed(2), handBehind: +(-(r.end.clone().sub(chest).dot(sfwd))).toFixed(2), elbowBehind: +(-(r.mid.clone().sub(chest).dot(sfwd))).toFixed(2), target: typeof t === 'string' ? t : (t && t.on ? `${t.on}.${t.part}` : 'point') };
  });
  P.eye = head.clone().addScaledVector(hd, headR * 0.86).addScaledVector(up, headR * 0.12); P.face = hd; P.gaze = hf; P.lookT = lookT;
  // head turn against the chest (deg) — beyond ~75° is a strain
  const hfH = hd.clone().setY(0).normalize(); P.headTurn = +(Math.acos(THREE.MathUtils.clamp(hfH.dot(sfwd), -1, 1)) * 180 / Math.PI).toFixed(0);
  P.headPitch = +(Math.asin(hd.y) * 180 / Math.PI).toFixed(0); P.arms = armRep;
  g.traverse((o) => { o.userData.who = spec.who; });
  return g;
}

// a tablet / screen: centre, normal (toward the viewers), size [w, h]; grips are named points on its rim
export function buildTablet(t) {
  const g = new THREE.Group(); const [w, hh] = t.size || [0.248, 0.179];
  const n = V(t.normal).normalize(), upW = new THREE.Vector3(0, 1, 0);
  let x = new THREE.Vector3().crossVectors(upW, n); if (x.lengthSq() < 1e-6) x.set(1, 0, 0); x.normalize();
  if (t.roll) x.applyAxisAngle(n, rad(t.roll));
  const y = new THREE.Vector3().crossVectors(n, x).normalize();
  g.position.copy(V(t.at)); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, n));
  const body = new THREE.Mesh(new THREE.BoxGeometry(w + 0.016, hh + 0.016, t.thick || 0.008), mat(t.back ?? 0x2a2c33)); body.userData.tag = 'tablet'; g.add(body);
  const sm = t.map ? new THREE.MeshBasicMaterial({ map: t.map }) : new THREE.MeshBasicMaterial({ color: t.color ?? 0x00ff00 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), sm); scr.position.z = (t.thick || 0.008) / 2 + 0.0015; scr.userData.tag = 'screen'; g.add(scr);
  g.userData = { tablet: true, at: V(t.at), n, x, y, w, h: hh, id: t.id || 'tablet' };
  g.userData.grip = (k) => { const m = { L: [-0.5, 0], R: [0.5, 0], B: [0, -0.5], T: [0, 0.5], BL: [-0.46, -0.42], BR: [0.46, -0.42], C: [0, 0], TL: [-0.46, 0.42], TR: [0.46, 0.42] }[k] || [0, 0];
    return V(t.at).addScaledVector(x, m[0] * (w + 0.02)).addScaledVector(y, m[1] * (hh + 0.02)).addScaledVector(n, -0.004); };
  g.userData.corners = () => [[-0.5, 0.5], [0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]].map(([a, b]) => V(t.at).addScaledVector(x, a * w).addScaledVector(y, b * hh).addScaledVector(n, (t.thick || 0.008) / 2 + 0.004));
  return g;
}
