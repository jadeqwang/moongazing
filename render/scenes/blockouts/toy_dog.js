// M's toy robot dog (7.C2): a toy-maker's miniature of the Unitree Go2 — and, like the Go2, it has NO HEAD.
// Image models insist on giving it a head and a neck (media/keyframes/work/rev_calls/toy_sprite_v1/2.png), so the
// toy is built here to true scale and rendered for the keyframe and the design sheet.
// Reference: media/refs/robot_dog/ (toyA_grey_q28_hero.jpg for shape and colour, go2_official_*.png for the legs).
// True size (metres): body 0.30 long x 0.115 wide x 0.075 tall; 0.20 tall at the back when standing.
//   buildToyDog({ pitch: body pitch in degrees (0 = standing level, 50 = reared up), front: [hip°, knee°] of the two
//                 front legs, hind: [hip°, knee°], paw: extra lift of the front-left leg in degrees })
import * as THREE from 'three';

const SHELL = 0xc9ccd2, JOINT = 0x8b8e96, DARK = 0x14171d, BLUE = 0x7fc4ff, FOOT = 0x34353b;
const toon = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
function roundedBox(l, w, h, r) { // length along z, rounded cross-section and softened ends
  const s = new THREE.Shape(), x = w / 2, y = h / 2;
  s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.quadraticCurveTo(x, -y, x, -y + r); s.lineTo(x, y - r); s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y); s.quadraticCurveTo(-x, y, -x, y - r); s.lineTo(-x, -y + r); s.quadraticCurveTo(-x, -y, -x + r, -y);
  const g = new THREE.ExtrudeGeometry(s, { depth: l - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.9, bevelSegments: 4, curveSegments: 8 });
  g.translate(0, 0, -(l - 2 * r) / 2); return g;
}
function seg(a, b, r, m) { const d = b.clone().sub(a), o = new THREE.Mesh(new THREE.CapsuleGeometry(r, d.length(), 5, 10), m); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); return o; }

export function buildToyDog(o = {}) {
  const L = 0.30, W = 0.115, H = 0.075, TH = 0.092, SH = 0.098, rad = (d) => d * Math.PI / 180;
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(new THREE.Mesh(roundedBox(L, W, H, 0.022), toon(SHELL)));
  // the front end-cap: no head, just a recessed dark glossy visor window with a pale-blue light bar
  const visor = new THREE.Mesh(roundedBox(0.012, W * 0.74, H * 0.62, 0.012), toon(DARK)); visor.position.set(0, 0.004, L / 2 - 0.002); body.add(visor);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(W * 0.5, H * 0.16, 0.004), new THREE.MeshBasicMaterial({ color: BLUE })); bar.position.set(0, 0.012, L / 2 + 0.006); body.add(bar);
  // a thin blue light stripe on each flank, a darker back panel
  [-1, 1].forEach((s) => { const st = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.008, L * 0.42), new THREE.MeshBasicMaterial({ color: 0x4f9fe6 })); st.position.set(s * (W / 2 + 0.001), 0.006, -0.01); body.add(st); });
  const back = new THREE.Mesh(roundedBox(L * 0.5, W * 0.62, 0.006, 0.003), toon(0xaeb1b8)); back.position.set(0, H / 2 + 0.001, -0.01); body.add(back);
  const pitch = rad(o.pitch ?? 0), front = o.front || [35, 70], hind = o.hind || [35, 70];
  body.rotation.x = -pitch;                                           // front end up
  // legs: hub at each corner; thigh swings back from the hip, the knee bends BACKWARD (Go2-style), nub foot
  const legs = new THREE.Group(); g.add(legs);
  const hipLocal = [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sz]) => new THREE.Vector3(sx * (W / 2 + 0.012), -0.004, sz * (L / 2 - 0.045)));
  const feet = [];
  hipLocal.forEach((hl, i) => {
    const isFront = i < 2, [ha, ka] = isFront ? front : hind, lift = isFront && i === 0 ? rad(o.paw || 0) : 0;
    const hip = hl.clone().applyEuler(body.rotation);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.026, 20), toon(JOINT)); hub.rotation.z = Math.PI / 2; hub.position.copy(hip); legs.add(hub);
    // angles measured from straight down, positive = toward the rear; front legs of a reared toy are lifted forward
    const a1 = isFront ? rad(ha) - pitch * (o.frontFollow ?? 1) - lift : rad(ha);
    const knee = hip.clone().add(new THREE.Vector3(0, -Math.cos(a1) * TH, -Math.sin(a1) * TH));
    const a2 = a1 - rad(ka);                                           // the shin comes forward again from a knee that points back
    const foot = knee.clone().add(new THREE.Vector3(0, -Math.cos(a2) * SH, -Math.sin(a2) * SH));
    legs.add(seg(hip, knee, 0.017, toon(SHELL))); const kj = new THREE.Mesh(new THREE.SphereGeometry(0.0165, 14, 10), toon(JOINT)); kj.position.copy(knee); legs.add(kj);
    legs.add(seg(knee, foot, 0.011, toon(SHELL))); const ft = new THREE.Mesh(new THREE.SphereGeometry(0.017, 14, 10), toon(FOOT)); ft.position.copy(foot); ft.scale.set(1, 0.85, 1.15); legs.add(ft);
    feet.push(foot);
  });
  // stand it on the ground: the lowest feet touch y = 0
  const minY = Math.min(...feet.map((f) => f.y)) - 0.015; g.position.y = -minY;
  g.traverse((x) => { x.userData.tag = 'toy'; x.userData.set = 'toy robot dog'; });
  g.userData.top = () => { const b = new THREE.Box3().setFromObject(g); return b.max.y; };
  return g;
}
