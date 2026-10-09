// 7.E1 THE TOAST — staging blockout: eight crew in the observation cupola raise their cups to Earth.
// One arrangement, three cameras (7.E1 close, 7.E1b along the faces, 7.E1c wide from behind), so the three shots are one
// moment from three angles. Station geometry and Earth come from ../../guanghan3d (canonical layout).
// Units: metres. Plan coordinates: x = grid east, n = grid north (Earth is at bearing 000 = +n). World z = −n.
// A figure's `face` is the bearing its chest points to; heads all look at Earth (bearing 000, +1.5°).
import * as THREE from 'three';
import { mat } from '../../guanghan3d/build.js';
import { L } from '../../guanghan3d/layout.js';

export const FLOOR = L.hub.cupola.floorY;          // 6.6
// The toast's real sky (JPL Horizons from the station, 2038-Aug-30 08:00 UT, mission day ~388): Earth 99.9% lit,
// 4.9° above the horizon at bearing 000, 2.05° across; the Sun is opposite it, on the horizon behind the dome.
export const SKY = { earthElev: 4.9, earthDiam: 2.05, sunBearing: 180, sunElev: 0.4 };
export const BENCH = { x: 0, n: 2.42, w: 1.5, d: 0.42, h: 0.45 };   // a two-seat bench facing the north glass

// arm poses: 'cup' (the toast; raise 0 = cup at the chest, 1 = at / just above eye level), 'hang', 'pocket', 'hip',
// 'waist' (forearm folded across the waist), 'eye' (knuckle to the eye), 'knee' (seated), { w: [x, y, z] } world target
// rev3 (Oct 8, round three): Jade's note "the wrist angles are unnatural/uncomfortable for the direction the people are
// facing ... they should be held in a natural way" (her reference: inputs/astronauts_toasting_fullEarth.png; real
// photographs: media/ref/rev3_crew/). Everyone FACES THE GLASS and lifts one arm FORWARD AND UP from the shoulder toward
// the Earth: `toast: { el, out, reach }` = elevation of the shoulder→wrist line above level (deg), its swing outward
// from straight ahead (deg, toward the raising arm's own side), and how straight the arm is (1 = locked; 0.95 = elbow
// bent about 35°). The forearm carries on in line with the hand; the cup stays upright in a neutral wrap grip (thumb
// toward the holder, back of the hand outward), never a cocked wrist. Heights differ on purpose (nobody in lockstep).
// ONE staging for the three shots: who raises which arm is fixed here and nowhere else.
//   Kenji R · Anastasia R · Arjun R (highest) · Jade R (inner) · Lúcia L (inner) · Layla L · Adaeze L · Chen Yu R.
//   Adaeze: cup in her LEFT hand, right arm down at her side (no sip, no hand at her face: the wide and the close agree).
//   Chen Yu: left hand on Adaeze's NEAR (right) shoulder, so her raised left arm is free; his cup in his right hand.
//   Layla raises her LEFT arm, so no second cup crowds Adaeze's in the close view.
export const CREW = [
  // west standing group
  { id: 'kenji', name: 'Kenji', h: 1.71, accent: 0x2f6690, skin: 0xe2c4a4, hair: 'short', x: -2.12, n: 0.8, face: 14, R: 'cup', L: 'pocket', lag: 0.5, top: 0.9, toast: { el: 36, out: 10, reach: 0.95 } },
  { id: 'anastasia', name: 'Anastasia', h: 1.72, accent: 0x6b4c9a, skin: 0xf0d4c0, hair: 'braid', x: -1.52, n: 1.5, face: 9, R: 'cup', L: 'hang', lag: 0.3, top: 0.85, tilt: 0.04, toast: { el: 28, out: 6, reach: 0.9 } },
  { id: 'arjun', name: 'Arjun', h: 1.75, accent: 0x1b1b1f, skin: 0xa87850, hair: 'short', x: -0.98, n: 1.36, face: 4, R: 'cup', L: 'hang', lag: 0.1, top: 1.0, tilt: -0.04, toast: { el: 50, out: 14, reach: 0.975 } },
  // the bench: Jade (her celadon tea cup) and Lúcia; their cups rise to either side of the Earth (7.E1c)
  { id: 'jade', name: 'Jade', h: 1.65, accent: 0x9cc5b0, skin: 0xe6c8a8, hair: 'ponytail', x: -0.36, n: BENCH.n, face: 3, seated: true, R: 'cup', L: 'knee', lag: 0.2, top: 1.0, celadon: true, toast: { el: 25, out: 14, reach: 0.93 } },
  { id: 'lucia', name: 'Lúcia', h: 1.62, accent: 0xe3a6a0, skin: 0xdcb694, hair: 'tied', x: 0.36, n: BENCH.n, face: -3, seated: true, L: 'cup', R: 'knee', lag: 0.0, top: 1.0, toast: { el: 27, out: 14, reach: 0.93 } },
  // east standing group: Layla; Adaeze with Chen Yu's hand on her near shoulder (the faces of 7.E1b)
  { id: 'layla', name: 'Layla', h: 1.67, accent: 0xd4a84b, skin: 0xd2a67e, hair: 'bun', x: 0.98, n: 1.42, face: -5, L: 'cup', R: 'hang', lag: 0.4, top: 0.9, tilt: 0.03, toast: { el: 44, out: 12, reach: 0.96 } },
  { id: 'adaeze', name: 'Adaeze', h: 1.68, accent: 0x3a8a6e, skin: 0x5a3a2a, hair: 'short', x: 1.62, n: 1.56, face: -8, L: 'cup', R: 'hang', lag: 0.5, top: 0.4, tilt: 0.05, toast: { el: 30, out: 6, reach: 0.94 } },
  { id: 'chen', name: 'Chen Yu', h: 1.78, accent: 0xc8312b, skin: 0xe0be9c, hair: 'short', x: 2.2, n: 1.3, face: -14, R: 'cup', L: { onShoulder: 'adaeze' }, lag: 0.0, top: 1.0, tilt: -0.05, toast: { el: 48, out: 12, reach: 0.97 } },
];

// Cameras. pos / target in plan coords [x, y(up, absolute), n]; hfov in degrees. `raise` = how far the toast has got.
// One focal point per shot: the Earth (wide), one face in earthlight (faces), two cups and the Earth (close).
export const VIEWS = {
  // 7.E1 (175.85, 0.88 s): wide from the dark back of the dome. Subject = the Earth; the crew are dark overlapping
  // shapes cropped by the frame, cups coming up past their shoulders.
  E1_wide: { pos: [0.2, 8.22, -2.3], target: [0, 8.2, 6], hfov: 66, raise: 0.7, label: '7.E1 wide from behind: the Earth' },
  // 7.E1b (176.73, 1.75 s): from the north glass looking back: Adaeze's face in earthlight, Chen's arm round her
  // shoulders, his face cropped at the edge; everyone else dark beyond.
  E1b_faces: { pos: [1.95, 8.16, 2.8], target: [1.66, 8.17, 1.4], hfov: 47, raise: 0.62, label: '7.E1b Adaeze in earthlight (Chen beside her)' },
  // 7.E1c (178.48, 2.63 s): between the seated pair's heads: Jade's celadon cup and Lúcia's cup clink, then rise to
  // either side of the Earth. KEY = first frame (cups together, low); END = where they finish.
  E1c_close: { pos: [0, 7.87, 1.3], target: [0, 8.02, 6], hfov: 36, raise: 0.52, label: '7.E1c two cups and the Earth (first frame)' },
  E1c_close_end: { pos: [0, 7.87, 1.3], target: [0, 8.02, 6], hfov: 36, raise: 1, label: '7.E1c two cups and the Earth (end pose: check clearance)' },
  E1_wide_end: { pos: [0.2, 8.22, -2.3], target: [0, 8.2, 6], hfov: 66, raise: 1, label: '7.E1 wide (end pose: check Earth clearance)' },
  // rev2's hand views (E1b_hands, E1c_hands, E1c_hands_end, E1c_hands_side, hands_high, hands_front: the cocked-wrist grip
  // of keyframe K_7.E1c v2) are in toast_v2_rev2.js.bak; their PNGs stay in views/ for the record.
  // rev3 (Oct 8, round three): ONE staging (CREW above), three cameras, articulated hands, natural arms.
  // 7.E1 wide: same camera as before (the painted dome, masts and plain are reused).
  E1_wide_r3: { pos: [0.2, 8.22, -2.3], target: [0, 8.2, 6], hfov: 66, raise: 0.9, hands: true, label: '7.E1 wide, rev3: arms forward and up toward the Earth' },
  // 7.E1b: SIDE-ON. From any camera in front of her a forward-and-up arm is foreshortened into "straight up" or a cup
  // thrust at the lens (views tried: from the glass, from her right front, from her left front); the natural arm reads
  // from the side and from behind, as in Jade's reference. So the camera stands where Layla stands (Layla is behind
  // the lens: `hide`), a long lens looking east along the row: Adaeze in near-profile facing screen-left, her LEFT
  // (near) arm forward and up to the upper left, the BACK of her left hand on the cup, her eye line following it to
  // the Earth, off screen left; earthlight on her face. Chen Yu is behind her, almost hidden: a shoulder and his
  // vermilion collar. One person, one cup, one hand.
  E1b_r3: { pos: [-0.25, 8.0, 2.4], target: [1.38, 8.2, 1.8], hfov: 30, raise: 1, hands: true, hide: ['layla'], label: '7.E1b rev3: Adaeze side-on, cup raised toward the Earth' },
  E1b_r3_start: { pos: [-0.25, 8.0, 2.4], target: [1.38, 8.2, 1.8], hfov: 30, raise: 0.72, hands: true, hide: ['layla'], label: '7.E1b rev3, first frame (cup still coming up)' },
  // 7.E1c: same camera as before (the painted heads, tower and mountains are reused). KEY = first frame, END = last.
  E1c_r3: { pos: [0, 7.87, 1.3], target: [0, 8.02, 6], hfov: 36, raise: 0.55, hands: true, label: '7.E1c rev3 first frame: neutral grip, arms from the shoulders',
    over: { jade: { up: 0.1, out: 0.06 }, lucia: { up: 0.1, out: 0.06 } } },
  E1c_r3_end: { pos: [0, 7.87, 1.3], target: [0, 8.02, 6], hfov: 36, raise: 1, hands: true, label: '7.E1c rev3 end pose',
    over: { jade: { up: 0.1, out: 0.06 }, lucia: { up: 0.1, out: 0.06 } } },
  // rev4 (Oct 8 night): Jade: "hands are weird in the 2 cup shot, but correct in the group shot ... fix the 2 hand shot
  // using the hands in the group shot as guidance". The group shot's grip from THIS camera: fist round the lower half of
  // the cup, knuckles on the outer side, thumb up the near face, wrist straight. KEY = first frame; END = a small rise.
  E1c_r4: { pos: [0, 7.87, 1.3], target: [0, 8.02, 6], hfov: 36, raise: 0.62, hands: true, label: '7.E1c rev4 first frame: the wide shot\'s grip',
    over: { jade: { up: 0.1, out: 0.06, thumb: 'up', gripH: -0.034 }, lucia: { up: 0.1, out: 0.06, thumb: 'up', gripH: -0.034 } } },
  E1c_r4_end: { pos: [0, 7.87, 1.3], target: [0, 8.02, 6], hfov: 36, raise: 0.8, hands: true, label: '7.E1c rev4 end pose (a small rise, then hold)',
    over: { jade: { up: 0.1, out: 0.06, thumb: 'up', gripH: -0.034 }, lucia: { up: 0.1, out: 0.06, thumb: 'up', gripH: -0.034 } } },
  r4_side: { pos: [-5.5, 8.0, 2.2], target: [0, 7.9, 2.0], hfov: 50, raise: 0.62, hands: true, label: 'check: rev4 grip from the west side',
    over: { jade: { thumb: 'up', gripH: -0.034 }, lucia: { thumb: 'up', gripH: -0.034 } } },
  // checks: the same pose from the side and from above
  r3_side: { pos: [-5.5, 8.0, 2.2], target: [0, 7.9, 2.0], hfov: 50, raise: 1, hands: true, label: 'check: rev3 from the west side' },
  r3_front: { pos: [0, 8.2, 4.6], target: [0, 7.9, 1.2], hfov: 80, raise: 1, hands: true, label: 'check: rev3 from the glass' },
  // checks only
  top: { ortho: 12.6, raise: 1, label: 'plan (north up)' },
  front: { pos: [0, 8.2, 3.3], target: [0, 7.9, 0], hfov: 86, raise: 1, label: 'check: from the glass, looking back at the faces' },
};

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const POLO = 0xf2efe8, TROUSERS = 0x3d434c, HAIR = 0x24201e, SOCK = 0x9aa0b4, CUP = 0xf4f1e8, CELADON = 0x9cc5b0;

function limb(a, b, r1, r2, m) {
  const d = b.clone().sub(a), len = d.length();
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, 10), m);
  o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return o;
}
const ball = (p, r, m) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m); o.position.copy(p); return o; };
// two-bone IK: joint between a (root) and c (target), bone lengths la, lb, bent toward `pole`
function ik(a, c, la, lb, pole) {
  const d = c.clone().sub(a); let len = d.length(); const max = (la + lb) * 0.985;
  if (len > max) { d.multiplyScalar(max / len); len = max; }
  const dir = d.clone().normalize();
  const along = (la * la - lb * lb + len * len) / (2 * len), hgt = Math.sqrt(Math.max(0, la * la - along * along));
  const perp = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
  return { joint: a.clone().addScaledVector(dir, along).addScaledVector(perp, hgt), end: a.clone().add(d) };
}
const sm = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

// ---- articulated cup hand (rev2, Oct 8) -------------------------------------------------------------------------
// A wrap grip on an upright cup. Seen from ABOVE, a RIGHT hand's four fingers run counter-clockwise from the palm round
// the far side of the cup and its thumb runs clockwise round the near side; a LEFT hand is the mirror. The palm lies
// along the forearm, on the right of the cup for a right hand (looking along the forearm), on the left for a left hand.
// Angles are in the plan (east, north); world z = −north.
const cupRad = (h) => 0.033 + h * (0.010 / 0.065);
export function cupGrip(C, side, fh, o = {}) {
  const sg = side === 'R' ? 1 : -1, k = o.s || 1, gh = o.gripH || 0;
  const fa = Math.atan2(-fh.z, fh.x);
  const phi0 = fa - sg * Math.PI / 2 + sg * (o.yaw || 0) * D2R;
  const axis = V(0, 1, 0); if (o.tilt) axis.applyAxisAngle(V(0, 0, -1), o.tilt * D2R).normalize();   // tilt > 0: the top leans east
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), axis);
  const Pt = (deg, h, ex) => { const a = phi0 + sg * deg * D2R, R = cupRad(h) + ex * k; return C.clone().add(V(Math.cos(a) * R, h, -Math.sin(a) * R).applyQuaternion(q)); };
  const tan = V(-Math.sin(phi0), 0, -Math.cos(phi0)).multiplyScalar(sg).applyQuaternion(q);   // wrist → knuckles
  const rad = V(Math.cos(phi0), 0, -Math.sin(phi0)).applyQuaternion(q);
  const H = [0.016, -0.002, -0.019, -0.034].map((h) => h * k + gh), TIP = [172, 177, 170, 152];
  const caps = [], hc = (H[0] + H[3]) / 2;
  const palmC = Pt(0, hc, 0.017).addScaledVector(tan, -0.022 * k);
  H.forEach((h, i) => {
    const pts = [palmC.clone().addScaledVector(tan, 0.03 * k).addScaledVector(axis, h - hc), Pt(38, h, 0.015), Pt(82, h, 0.010), Pt(128, h, 0.009), Pt(TIP[i], h, 0.008)];
    for (let j = 0; j < pts.length - 1; j++) caps.push({ a: pts[j], b: pts[j + 1], r: (i === 3 ? 0.0075 : 0.0088) * k, part: 'finger' + i });
  });
  const tl = Math.sin((o.roll || 0) * D2R) * 0.045 * k;   // the thumb lies level over the near face even when the hand is cocked
  let th = [Pt(-30, H[0] - 0.006 * k + tl * 0.5, 0.024), Pt(-74, H[0] + 0.002 * k + tl * 0.95, 0.013), Pt(-120, H[0] + 0.006 * k + tl * 0.85, 0.010)];
  // rev4 (opt-in, `thumb: 'up'`): the grip of the wide painting K_7.E1: the fist closes round the LOWER half of the cup
  // and the thumb runs diagonally UP the near face (not level across it), its tip below the rim
  if (o.thumb === 'up') th = [Pt(-28, H[1] + tl * 0.5, 0.022), Pt(-58, H[0] + 0.010 * k + tl * 0.9, 0.012), Pt(-84, H[0] + 0.026 * k + tl * 0.85, 0.009)];
  caps.push({ a: palmC.clone().addScaledVector(tan, -0.035 * k).addScaledVector(axis, 0.015 * k), b: th[0], r: 0.013 * k, part: 'thumb' });
  caps.push({ a: th[0], b: th[1], r: 0.0115 * k, part: 'thumb' }, { a: th[1], b: th[2], r: 0.010 * k, part: 'thumb' });
  const wrist = palmC.clone().addScaledVector(tan, -0.07 * k).addScaledVector(axis, -0.004 * k);
  // a steep forearm cocks the whole hand (wrist low, knuckles high): roll it about the palm's radial line through the
  // cup axis, then put every point back at its own distance from the axis so nothing sinks into the cup
  const palm = { c: palmC, x: tan, y: axis.clone(), z: rad, size: [0.088 * k, 0.084 * k, 0.027 * k] };
  if (o.roll) {
    const piv = C.clone().addScaledVector(axis, hc), rq = new THREE.Quaternion().setFromAxisAngle(rad, sg * o.roll * D2R);
    const turn = (p) => { const v = p.clone().sub(piv), h0 = v.dot(axis), d0 = v.clone().addScaledVector(axis, -h0).length(); v.applyQuaternion(rq);
      const h1 = v.dot(axis), hv = v.clone().addScaledVector(axis, -h1), d1 = hv.length(); if (d1 > 1e-6) hv.multiplyScalar(d0 / d1); p.copy(piv).add(hv).addScaledVector(axis, h1); return p; };
    for (const c of caps) { if (!c.a._t) { turn(c.a); c.a._t = 1; } if (!c.b._t) { turn(c.b); c.b._t = 1; } }
    turn(wrist); turn(palmC); palm.x = tan.clone().applyQuaternion(rq); palm.y = axis.clone().applyQuaternion(rq);
  }
  return { wrist, caps, palm, axis, q, phi0, thumbTip: th[2], tip: Pt(TIP[0], H[0], 0.008) };
}

// joints of one figure at toast progress `raise` (0…1). Returns the named world points used by the builder and by checks.
export function joints(p, raise, all = {}, opt = {}) {
  const s = p.h / 1.70, b = p.face * D2R;
  const F = V(Math.sin(b), 0, -Math.cos(b)), R = V(Math.cos(b), 0, Math.sin(b)), Y = V(0, 1, 0);
  const base = V(p.x, FLOOR, -p.n);
  const W = (f, u, r) => base.clone().addScaledVector(F, f).addScaledVector(Y, u).addScaledVector(R, r);
  const hipY = p.seated ? BENCH.h + 0.09 * s : 0.90 * s;
  const up = V(0, 1, 0).addScaledVector(F, p.seated ? 0.04 : 0.02).addScaledVector(R, p.tilt || 0).normalize();
  const hipC = W(0, hipY, 0);
  const shC = hipC.clone().addScaledVector(up, 0.50 * s), neck = hipC.clone().addScaledVector(up, 0.565 * s);
  // the head looks at Earth (bearing 000, +4.9°), lifting to it as the cups come up
  const u = sm((raise - (p.lag || 0) * 0.35) / 0.8);
  const pitch = (-3 + 8 * u) * D2R;
  const look = V(0, Math.sin(pitch), -Math.cos(pitch)).addScaledVector(V(1, 0, 0), p.headTilt ? p.headTilt * 0.5 : 0).normalize();
  const headC = neck.clone().addScaledVector(up, 0.125 * s).addScaledVector(look, 0.02 * s).addScaledVector(R, (p.headTilt || 0) * 0.3 * s);
  const J = { s, F, R, up, base, hipC, shC, neck, headC, look, W, eye: headC.clone().addScaledVector(look, 0.09 * s).addScaledVector(Y, 0.01 * s) };
  J.sh = { R: shC.clone().addScaledVector(R, 0.19 * s), L: shC.clone().addScaledVector(R, -0.19 * s) };
  J.hip = { R: hipC.clone().addScaledVector(R, 0.09 * s), L: hipC.clone().addScaledVector(R, -0.09 * s) };
  // arms
  J.hand = {}; J.elbow = {};
  for (const side of ['R', 'L']) {
    const sg = side === 'R' ? 1 : -1, pose = p[side] || 'hang';
    let tgt, pole = V(0, -1, 0).addScaledVector(R, 0.55 * sg).addScaledVector(F, -0.25);
    if (pose === 'cup' && p.toast) {
      // rev3: the arm goes forward and up from the shoulder toward the Earth (see CREW). `over[id].toast` adjusts a view.
      const o2 = (opt.over && opt.over[p.id]) || {};
      if (opt.hands && (o2.up || o2.out)) { J.sh[side] = J.sh[side].clone().addScaledVector(Y, o2.up || 0).addScaledVector(R, sg * -(o2.out || 0)); J.shMoved = true; }
      const T = { ...p.toast, ...(o2.toast || {}) }, el = T.el * D2R, out = T.out * D2R, arm = 0.56 * s;
      const dHi = F.clone().multiplyScalar(Math.cos(el) * Math.cos(out)).addScaledVector(R, sg * Math.cos(el) * Math.sin(out)).addScaledVector(Y, Math.sin(el));
      const dLo = F.clone().multiplyScalar(0.93).addScaledVector(R, sg * 0.05).addScaledVector(Y, -0.36).normalize();   // cup at the chest, forearm level
      const d = dLo.lerp(dHi, u).normalize(), len = (0.62 + (T.reach - 0.62) * u) * arm;
      tgt = J.sh[side].clone().addScaledVector(d, len); J.wristWant = tgt.clone();   // the WRIST goes here; the cup follows from the grip
      pole = V(0, -1, 0).addScaledVector(R, 0.2 * sg).addScaledVector(F, -0.15);
    } else if (pose === 'cup') {
      const top = p.top ?? 1;
      // chest (forearm level) → at / just above eye level, elbow still bent. A clinking pair lean their cups together.
      const eyeY = J.eye.y - FLOOR, lowY = eyeY - 0.40 * s, highY = eyeY + (0.02 + 0.07 * top) * s;
      const y = lowY + (highY - lowY) * u, f = (0.27 + 0.11 * u) * s, r = (0.19 + 0.03 * u) * s * sg;
      tgt = base.clone().addScaledVector(F, f).addScaledVector(R, r); tgt.y = FLOOR + y;
      // the bench pair clink low, between them, then lift their cups apart to either side of the Earth (7.E1c)
      if (p.clink) { const c = 1 - sm((u - 0.3) / 0.5); tgt.x += (-p.clink * 0.043 - tgt.x) * c + (-p.clink * 0.105 - tgt.x) * (1 - c); tgt.z -= 0.03; }
    } else if (pose === 'hang') tgt = W(0.03 * s, hipY - 0.12 * s, 0.25 * s * sg);
    else if (pose === 'pocket') { tgt = W(0.07 * s, hipY - 0.03 * s, 0.17 * s * sg); pole = V(0, -0.4, 0).addScaledVector(R, sg).addScaledVector(F, -0.6); }
    else if (pose === 'hip') { tgt = W(-0.02 * s, hipY + 0.07 * s, 0.19 * s * sg); pole = V(0, -0.2, 0).addScaledVector(R, sg).addScaledVector(F, -0.5); }
    else if (pose === 'waist') { tgt = W(0.17 * s, hipY + 0.16 * s, -0.04 * s * sg); pole = V(0, -1, 0).addScaledVector(R, sg); }
    else if (pose === 'eye') { const w = sm((raise - 0.45) / 0.3); const lo = W(0.16 * s, hipY + 0.2 * s, 0.02 * s * sg), hi = J.eye.clone().addScaledVector(look, 0.035 * s).addScaledVector(R, 0.035 * s * sg).addScaledVector(Y, -0.01); tgt = lo.lerp(hi, w); pole = V(0, -1, 0).addScaledVector(R, 0.8 * sg); }
    else if (pose === 'knee') tgt = hipC.clone().addScaledVector(F, 0.36 * s).addScaledVector(R, 0.11 * s * sg).addScaledVector(Y, 0.075 * s);
    else if (pose.around) { const o = all[pose.around]; tgt = o.sh[sg > 0 ? 'R' : 'L'].clone().addScaledVector(Y, 0.035).addScaledVector(o.F, 0.02); pole = V(0, 1, 0).addScaledVector(F, -1); }
    else if (pose.onShoulder) { const o = all[pose.onShoulder]; tgt = o.sh[sg > 0 ? 'L' : 'R'].clone().addScaledVector(Y, 0.05).addScaledVector(o.F, -0.02); pole = V(0, -1, 0).addScaledVector(R, 0.3 * sg); }
    let r = ik(J.sh[side], tgt, 0.29 * s, 0.30 * s, pole);
    if (pose === 'cup' && opt.hands) {
      // `up`: the painted keyframe seats the bench pair about 10 cm higher than this model and ~6 cm further apart (their
      // shoulders show in the bottom corners of the painting): `up` / `out` move the root of the guide's arm to match
      { const o2 = (opt.over && opt.over[p.id]) || {}; if (!J.shMoved && (o2.up || o2.out)) J.sh[side] = J.sh[side].clone().addScaledVector(Y, o2.up || 0).addScaledVector(R, sg * -(o2.out || 0)); }
      // the CUP is the given thing (where the ball-hand version had it); the hand wraps it and the wrist follows
      const ov = (opt.over && opt.over[p.id]) || {};
      const C = tgt.clone().addScaledVector(Y, 0.045 * s).addScaledVector(F, 0.02 * s);
      if (ov.C) C.set(ov.C[0], FLOOR + ov.C[1], -ov.C[2]);   // plan x, height above the floor, plan n
      if (ov.dC) { C.x += ov.dC[0]; C.y += ov.dC[1]; C.z -= ov.dC[2]; }
      if (ov.pole) pole = V(ov.pole[0], ov.pole[1], -ov.pole[2]);
      let fh = F.clone(), g;
      let roll = 0;
      for (let it = 0; it < 8; it++) { g = cupGrip(C, side, fh, { s, yaw: ov.yaw, tilt: ov.tilt, gripH: ov.gripH ?? -0.02, roll, thumb: ov.thumb });
        if (J.wristWant && !ov.C) { C.add(J.wristWant.clone().sub(g.wrist)); g = cupGrip(C, side, fh, { s, yaw: ov.yaw, tilt: ov.tilt, gripH: ov.gripH ?? -0.02, roll, thumb: ov.thumb }); }
        r = ik(J.sh[side], g.wrist, 0.29 * s, 0.27 * s, pole); const d = g.wrist.clone().sub(r.joint); roll = Math.min(40, Math.max(0, Math.asin(d.clone().normalize().y) / D2R - 12)); d.y = 0; if (d.lengthSq() > 1e-8) fh = d.normalize(); }
      const fa = g.wrist.clone().sub(r.joint).normalize();
      J.grip = g; J.cupC = C; J.gripRep = { side, roll: +roll.toFixed(0), forearmElev: +(Math.asin(fa.y) / D2R).toFixed(0), wristGap: +(r.end.distanceTo(g.wrist) * 100).toFixed(1) };
    }
    J.elbow[side] = r.joint; J.hand[side] = r.end;
  }
  // legs
  J.knee = {}; J.foot = {};
  for (const side of ['R', 'L']) {
    const sg = side === 'R' ? 1 : -1;
    if (p.seated) { J.knee[side] = J.hip[side].clone().addScaledVector(F, 0.43 * s).addScaledVector(R, 0.03 * sg); J.foot[side] = J.knee[side].clone().addScaledVector(F, 0.05 * s + (side === 'L' ? 0.08 : 0)); J.foot[side].y = FLOOR + 0.06; }
    else { const st = (p.stance || 0) * sg; J.foot[side] = W(0.02 * s + st * 0.1, 0.06, (0.11 + Math.abs(p.tilt || 0) * 0.4) * s * sg); J.knee[side] = ik(J.hip[side], J.foot[side], 0.43 * s, 0.43 * s, F).joint; }
  }
  if (p.R === 'cup' || p.L === 'cup') { const side = p.R === 'cup' ? 'R' : 'L'; J.cup = J.cupC ? J.cupC.clone() : J.hand[side].clone().addScaledVector(Y, 0.045 * s).addScaledVector(F, 0.02 * s); J.cupSide = side; }
  return J;
}

export function allJoints(raise, opt = {}) {
  const all = {};
  // two passes: arms that rest on a neighbour need the neighbour's shoulders first
  for (const p of CREW) all[p.id] = joints(p, raise, all, opt);
  for (const p of CREW) all[p.id] = joints(p, raise, all, opt);
  return all;
}

export function buildCrew(raise, opt = {}) {
  const grp = new THREE.Group(); grp.userData.tag = 'toastCrew';
  const all = allJoints(raise, opt);
  for (const p of CREW) {
    const J = all[p.id], s = J.s, g = new THREE.Group(); g.userData.id = p.id;
    const skin = mat(p.skin), polo = mat(POLO), tr = mat(TROUSERS), hair = mat(HAIR), acc = mat(p.accent), sock = mat(SOCK);
    // torso: an elliptical tapered tube, wide across the shoulders
    const tl = J.shC.clone().sub(J.hipC), torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.155 * s, tl.length() + 0.06 * s, 14), polo);
    const Z = J.R.clone().cross(J.up).normalize();
    torso.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(J.R, J.up, Z)); torso.scale.set(1, 1, 0.6);
    torso.position.copy(J.hipC).addScaledVector(tl, 0.5); g.add(torso);
    g.add(limb(J.hip.L, J.hip.R, 0.1 * s, 0.1 * s, tr));
    g.add(limb(J.shC.clone().addScaledVector(J.up, 0.03 * s), J.neck.clone().addScaledVector(J.up, 0.05 * s), 0.05 * s, 0.045 * s, skin));
    // collar stripe in the person's colour
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.062 * s, 0.016 * s, 6, 16), acc); collar.position.copy(J.neck).addScaledVector(J.up, 0.0);
    collar.quaternion.setFromUnitVectors(V(0, 0, 1), J.up); g.add(collar);
    // head + hair + nose (the nose shows where the head looks)
    const head = ball(J.headC, 0.105 * s, skin); head.scale.set(0.9, 1.12, 1.0); g.add(head);
    g.add(ball(J.headC.clone().addScaledVector(J.look, 0.1 * s).addScaledVector(V(0, 1, 0), -0.012 * s), 0.02 * s, skin));
    const cap = ball(J.headC.clone().addScaledVector(J.look, -0.028 * s).addScaledVector(V(0, 1, 0), 0.022 * s), 0.108 * s, hair); cap.scale.set(0.93, 1.08, 1.0); g.add(cap);
    const back = J.headC.clone().addScaledVector(J.look, -0.1 * s);
    if (p.hair === 'ponytail') { // low ponytail, straight, to mid-back (not longer)
      const a = back.clone().addScaledVector(V(0, 1, 0), -0.08 * s), b2 = J.hipC.clone().lerp(J.shC, 0.42).addScaledVector(J.F, -0.13 * s);
      g.add(limb(a, b2, 0.038 * s, 0.03 * s, hair)); g.add(ball(a, 0.04 * s, acc));
    } else if (p.hair === 'braid') { const a = back.clone().addScaledVector(V(0, 1, 0), -0.06 * s), b2 = J.shC.clone().addScaledVector(J.F, -0.12 * s).addScaledVector(J.up, -0.16 * s); g.add(limb(a, b2, 0.03 * s, 0.022 * s, mat(0xc9b48a))); cap.material = mat(0xc9b48a); }
    else if (p.hair === 'bun') g.add(ball(back.clone().addScaledVector(V(0, 1, 0), -0.05 * s), 0.05 * s, hair));
    else if (p.hair === 'tied') g.add(ball(back.clone().addScaledVector(V(0, 1, 0), -0.07 * s).addScaledVector(J.look, -0.03 * s), 0.055 * s, mat(0x3a2a22)));
    // arms: short polo sleeve, bare forearm, hand
    for (const side of ['R', 'L']) {
      const n0 = g.children.length;
      const mid = J.sh[side].clone().lerp(J.elbow[side], 0.55);
      g.add(ball(J.sh[side], 0.058 * s, polo)); g.add(limb(J.sh[side], mid, 0.055 * s, 0.05 * s, polo)); g.add(limb(mid, J.elbow[side], 0.042 * s, 0.038 * s, skin));
      const gripped = J.grip && J.cupSide === side;
      g.add(ball(J.elbow[side], 0.038 * s, skin)); g.add(limb(J.elbow[side], J.hand[side], 0.036 * s, gripped ? 0.026 * s : 0.03 * s, skin));
      if (!gripped) { g.add(ball(J.hand[side], 0.04 * s, skin)); continue; }
      g.add(ball(J.hand[side], 0.027 * s, skin));
      const G = J.grip, pb = new THREE.Mesh(new THREE.BoxGeometry(...G.palm.size), skin);
      pb.position.copy(G.palm.c); pb.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(G.palm.x, G.palm.y, G.palm.x.clone().cross(G.palm.y))); g.add(pb);
      const thumbM = mat(new THREE.Color(p.skin).multiplyScalar(0.8).getHex());   // the thumb a shade darker so it reads
      for (const c of G.caps) { const m = c.part === 'thumb' ? thumbM : skin; g.add(limb(c.a, c.b, c.r, c.r, m)); g.add(ball(c.a, c.r, m)); g.add(ball(c.b, c.r, m)); }
      for (let i = n0; i < g.children.length; i++) g.children[i].userData.cupArm = true;
    }
    for (const side of ['R', 'L']) {
      g.add(limb(J.hip[side], J.knee[side], 0.085 * s, 0.065 * s, tr)); g.add(ball(J.knee[side], 0.065 * s, tr));
      g.add(limb(J.knee[side], J.foot[side], 0.06 * s, 0.045 * s, tr));
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1 * s, 0.07, 0.24 * s), sock); foot.position.copy(J.foot[side]).addScaledVector(J.F, 0.06 * s); foot.position.y = FLOOR + 0.035;
      foot.rotation.y = -p.face * D2R; g.add(foot);
    }
    if (J.cup) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.028, 0.065, J.grip ? 24 : 12), mat(p.celadon ? CELADON : CUP)); c.position.copy(J.cup); if (J.grip) c.quaternion.copy(J.grip.q); c.userData.cup = true; c.userData.cupArm = !!J.grip; g.add(c); }
    g.traverse((o) => { o.userData.noEdges = true; o.userData.crew = p.id; });
    grp.add(g);
  }
  // the bench
  const bm = mat(0x6d6f78);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(BENCH.w, 0.08, BENCH.d), bm); seat.position.set(BENCH.x, FLOOR + BENCH.h - 0.04, -BENCH.n + 0.05); grp.add(seat);
  for (const sx of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, BENCH.h - 0.08, BENCH.d - 0.06), bm); leg.position.set(BENCH.x + sx * (BENCH.w / 2 - 0.08), FLOOR + (BENCH.h - 0.08) / 2, -BENCH.n + 0.05); grp.add(leg); }
  grp.userData.joints = all;
  return grp;
}
