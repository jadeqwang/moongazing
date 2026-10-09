// Staging blockouts for the Oct 7 revision round (7.C sharing scenes, the 7.D crew-at-the-screen slot, 7.C2, 7.C3).
// Metres, y up, floor at y = 0. Each scene: set pieces, tablets/screens, figures (see mannequin.js), cameras.
// `viewers` lists who is meant to see each screen: render_blockouts.mjs reports whether they can.

// screen normal: from `at` toward `target`, then yawed by `yaw` degrees about the vertical (positive = toward +x … -z)
function aim(at, target, yaw = 0) {
  const d = [target[0] - at[0], target[1] - at[1], target[2] - at[2]], a = yaw * Math.PI / 180;
  return [d[0] * Math.cos(a) - d[2] * Math.sin(a), d[1], d[0] * Math.sin(a) + d[2] * Math.cos(a)];
}
const TOP = (c, r = 3.2) => ({ pos: [c[0], c[1] + r, c[2] + 0.01], target: c, hfov: 50 });
// a station module seen from inside (Ø 4.5, deck 1.0 above the hull's lowest point), axis along x or z
const hull = (at, axis = 'x', len = 8) => ({ type: 'hull', r: 2.25, len, cy: 1.25, at: [at[0], 1.25, at[1]], rot: axis === 'x' ? [0, 90, 0] : [0, 0, 0] });
const bench = (x, z, w = 1.6, d = 0.45, h = 0.45, c = 0x2c3a66) => ({ type: 'box', size: [w, h, d], at: [x, h / 2, z], color: c, name: 'bench' });

export const SCENES = {};

// ---------------------------------------------------------------------------------------------------------------
// THE SHARING SCENES (7.C5a–d): two people shoulder to shoulder, one tablet in front of both, held by its owner in a
// relaxed two-hand grip; the friend leans in. A face looking at a screen and that screen can never both face one
// camera (their normals are opposed; searchCam() confirms the best mixed view is a profile plus a 60° sliver, or a
// bird's-eye), so the four scenes alternate two honest layouts, each with ONE focal point:
//   FRONT — three-quarter front two-shot from the owner's side (the friend, turned in toward the tablet, faces us): both faces in the screen's glow, the tablet seen
//           from its back/edge. Focal point: the friend's face (the reaction).
//   REAR  — over both shoulders, a little high: the screen in the owner's hands, the gesture (an arm round a
//           shoulder, a head tipped over) read from behind, faces as lost profiles. Focal point: the picture.
//           Used where the picture is the point (the newborn) or where a face must not show (Jade).
// People face +z. ownerX: which side the owner sits on (-1 = -x).
function two({ id, title, owner, friend, ownerX = -1, view = 'rear', pose = 'sit', seat = 0.45, eye = 1.2, set = [], friendArms, ownerArms, ownerLean = 10, friendLean = 12, cam = {} }) {
  const T = [ownerX * 0.08, eye - 0.31, 0.50], eyes = [ownerX * 0.02, eye, 0.1], fx = -ownerX;
  const hero = view === 'rear' ? { pos: [fx * 0.22, eye + 0.72, -0.94], target: [ownerX * 0.03, eye - 0.24, 0.42], hfov: 44 }
    : { pos: [ownerX * 1.15, eye + 0.02, 2.25], target: [fx * 0.02, eye - 0.13, 0.12], hfov: 28 };
  SCENES[id] = {
    title, hero: 'hero', set,
    tablets: [{ id: 'tablet', at: T, normal: aim(T, eyes, 0) }],
    viewers: { tablet: [owner, friend] },
    figures: [
      { who: owner, pose, seat, at: [ownerX * 0.26, 0], yaw: -8 * ownerX, lean: ownerLean, tilt: 0, look: 'tablet', R: 'tablet:BR', L: 'tablet:BL', ...(ownerArms || {}) },
      { who: friend, pose, seat, at: [fx * 0.27, 0.02], yaw: -14 * fx, lean: friendLean, tilt: -8 * fx, look: 'tablet', ...(friendArms || { L: 'lap', R: 'lap' }) },
    ],
    cams: { hero: { ...hero, ...cam }, [view === 'rear' ? 'front' : 'rear']: view === 'rear' ? { pos: [0, eye - 0.05, 2.6], target: [0, eye - 0.2, 0], hfov: 40 } : { pos: [fx * 0.22, eye + 0.72, -0.94], target: [ownerX * 0.03, eye - 0.24, 0.42], hfov: 44 },
      top: TOP([0, eye - 0.3, 0.2]), side: { pos: [fx * 2.4, eye + 0.1, 0.1], target: [0, eye - 0.2, 0.2], hfov: 30 } },
  };
}
const TABLE = [{ type: 'cyl', r: 0.8, h: 0.04, at: [0, 0.72, 1.75], color: 0x40508a, name: 'table' }, { type: 'cyl', r: 0.07, h: 0.72, at: [0, 0.36, 1.75], color: 0x40508a, name: 'table' }];
// a — GALLEY (NE module), the padded wall bench: Adaeze (owner) holds the tablet in both hands in front of the two
//     of them; Anastasia leans against her shoulder and the laugh arrives — her outer hand comes up to her mouth
two({ id: 'K_7.C5a', title: 'galley bench: Adaeze shows Anastasia the twins’ lost tooth', owner: 'adaeze', friend: 'anastasia', ownerX: -1, view: 'front',
  set: [hull([0, 1.3]), bench(0, -0.12, 2.2, 0.6)], friendArms: { L: 'mouth', R: 'lap' }, friendLean: 16 });
// b — CREW QUARTERS (NW module), the edge of Arjun's lower bunk: Arjun cradles the tablet with his newborn daughter
//     in both hands; Chen Yu, beside him, has an arm round his back, hand on his far shoulder
two({ id: 'K_7.C5b', title: 'crew quarters: Arjun shows Chen Yu his newborn daughter', owner: 'arjun', friend: 'chen', ownerX: -1, view: 'rear',
  set: [hull([0, 0.9]), { type: 'box', size: [2.0, 0.45, 0.9], at: [0, 0.225, -0.3], color: 0x2c3a66, name: 'bunk' }],
  friendArms: { R: { on: 'arjun', part: 'shoulderR', off: [-0.02, 0.035, -0.02] }, L: 'knee' } });
// c — GREENHOUSE (SW module), standing with their hips against the bench: Kenji (owner) holds the tablet at chest
//     height; Lúcia leans in, one hand on her heart, the other giving the old dog on the screen a tiny wave
two({ id: 'K_7.C5c', title: 'greenhouse: Kenji shows Lúcia Haruto and the dog', owner: 'kenji', friend: 'lucia', ownerX: 1, view: 'front', pose: 'stand', eye: 1.5, ownerLean: 4, friendLean: 10,
  set: [hull([0, 0.9]), { type: 'box', size: [2.4, 0.9, 0.5], at: [0, 0.45, -0.5], color: 0x2c3a66, name: 'bench' }, { type: 'box', size: [2.4, 0.5, 0.45], at: [0, 1.35, -0.55], color: 0x6a3a7a, opacity: 0.5, name: 'growth chamber' }],
  friendArms: { R: 'heart', L: [-0.21, 1.25, 0.42] } });
// d — AIRLOCK suit bench (E mound): Layla holds the tablet with her father and his falcon; Jade (from behind: low
//     ponytail to mid-back, glasses) sits against her shoulder, head tipped toward her, hands in her lap
two({ id: 'K_7.C5d', title: 'airlock bench: Layla shows Jade her father’s falcon', owner: 'layla', friend: 'jade', ownerX: 1, view: 'rear',
  set: [hull([0, 0.9]), bench(0, -0.05, 2.4, 0.45), { type: 'box', size: [0.6, 1.5, 0.3], at: [-1.2, 1.2, 1.7], color: 0xd8d8d8, name: 'EVA suit' }, { type: 'box', size: [0.6, 1.5, 0.3], at: [1.2, 1.2, 1.7], color: 0xd8d8d8, name: 'EVA suit' }],
  friendArms: { L: 'lap', R: 'lap' } });

// ---------------------------------------------------------------------------------------------------------------
// 7.D3d / 7.D3e — the freed slot 170.59–173.00: Jade shares M's school play with her crewmates at the galley wall
// screen (NE module, outer end wall). The crew stand close round her; ONE focal point per shot:
//   A (7.D3d): from behind Jade — Adaeze's hand settling on Jade's shoulder, the screen (the real K_7.D1 picture)
//              beyond. Jade from behind, small between taller shoulders, low ponytail to mid-back, glasses.
//   B (7.D3e): from beside the screen, a long lens back at Arjun's face in the screen's glow (his daughter was born
//              while he was away), Chen Yu soft beyond his shoulder; Jade is outside this frame (her face is never
//              shown), everyone else is implied by a cropped shoulder.
{
  const SCR = [0, 1.5, 1.7];
  SCENES['K_7.D3d'] = {
    title: 'galley wall screen: the crew watch M’s play with Jade', hero: 'A',
    set: [hull([0, -2.0], 'z', 9), { type: 'box', size: [3.4, 3.0, 0.08], at: [0, 1.5, 1.78], color: 0x26305a, name: 'end wall' }],
    tablets: [{ id: 'screen', at: SCR, normal: [0, 0, -1], size: [1.5, 0.844], thick: 0.04, img: '/media/keyframes/K_7.D1.jpg', glow: 1.2 }],
    viewers: { screen: ['jade', 'adaeze', 'arjun', 'chen', 'layla'] },
    figures: [
      { who: 'jade', pose: 'stand', at: [0, 0.72], yaw: 0, lean: 2, look: [0.12, 1.5, 1.7] },
      { who: 'adaeze', pose: 'stand', at: [0.46, 0.50], yaw: -8, lean: 3, look: 'screen', R: { on: 'jade', part: 'shoulderL', off: [0.0, 0.04, -0.01] } },
      { who: 'chen', pose: 'stand', at: [-0.50, 0.52], yaw: 8, lean: 2, look: 'screen' },
      { who: 'arjun', pose: 'stand', at: [-0.98, 0.50], yaw: 18, lean: 2, look: 'screen', L: 'chin' },
      { who: 'layla', pose: 'stand', at: [0.98, 0.38], yaw: -16, look: 'screen' },
    ],
    cams: { A: { pos: [0.30, 1.62, -0.85], target: [0.14, 1.42, 1.2], hfov: 44 }, B: { pos: [-1.55, 1.52, 1.5], target: [-0.80, 1.6, 0.5], hfov: 34 }, top: TOP([0, 1.2, 0.7], 3.6), wide: { pos: [1.8, 1.9, -1.8], target: [0, 1.3, 1.0], hfov: 55 } },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// 7.C3 — M on the sofa under a blanket with the cat, watching RARE EARTH. Exactly two hands: the tablet leans on her
// raised knees (its weight on her legs), her right hand steadies its edge, her left rests on the cat.
//   front: her lit face (7.C3);  ots: over her right shoulder down onto the screen (7.C3b)
{
  const T = [0.02, 0.70, 0.07];
  SCENES['K_7.C3'] = {
    title: 'sofa: M watches Rare Earth, tablet on her raised knees, cat at her side', hero: 'front', bg: 0x6b5a3c,
    set: [{ type: 'box', size: [2.4, 0.42, 1.0], at: [0, 0.21, 0.1], color: 0xd9cfb8, name: 'sofa seat' }, { type: 'box', size: [2.4, 0.9, 0.25], at: [0, 0.45, -0.5], color: 0xd9cfb8, name: 'sofa back' },
      { type: 'box', size: [0.25, 0.75, 1.0], at: [0.72, 0.38, 0.1], color: 0xd9cfb8, name: 'sofa arm' },
      { type: 'ball', r: 0.15, at: [-0.30, 0.55, -0.02], color: 0x7a5a3a, name: 'cat body' }, { type: 'ball', r: 0.08, at: [-0.26, 0.68, 0.14], color: 0x7a5a3a, name: 'cat head' },
      { type: 'box', size: [0.8, 0.03, 0.5], at: [0.05, 0.50, 0.32], rot: [38, 0, 0], color: 0xe8dcc0, opacity: 0.6, name: 'blanket over her knees' }],
    tablets: [{ id: 'tablet', at: T, normal: aim(T, [0.02, 0.93, -0.22], 0), size: [0.248, 0.179] }],
    viewers: { tablet: ['M'] },
    figures: [{ who: 'M', pose: 'sit', seat: 0.42, at: [0.02, -0.12], yaw: 0, lean: -10, feet: 'up', look: 'tablet', R: 'tablet:TR', L: [-0.22, 0.69, 0.0] }],
    cams: { front: { pos: [-0.45, 0.95, 1.6], target: [-0.08, 0.74, 0.0], hfov: 34 }, ots: { pos: [0.30, 1.16, -0.52], target: [0.0, 0.70, 0.08], hfov: 50 }, top: TOP([0, 0.7, 0.0], 2.0) },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// 7.C2 — the Austin playroom: Kenton teaches T DDR on the built-in floor pad, M dances with her toy robot dog.
// Camera at the rear three-quarter, so Kenton is seen from three-quarter back (per the bible) and M, turned to her
// toy, faces us: the one focal point. True heights 185 / 132 / 109 cm; the toy is 30 cm long and 20 cm at the back
// (mid-shin on M), headless, reared up on its hind legs to about M's knee.
{
  const dog = (x, z) => [{ type: 'box', size: [0.12, 0.09, 0.30], at: [x, 0.25, z], rot: [-50, 35, 0], color: 0xb9bcc4, name: 'toy robot dog (30 cm)' },
    { type: 'box', size: [0.02, 0.16, 0.02], at: [x - 0.05, 0.08, z - 0.08], color: 0x8a8d96, name: 'toy leg' }, { type: 'box', size: [0.02, 0.16, 0.02], at: [x + 0.06, 0.08, z - 0.06], color: 0x8a8d96, name: 'toy leg' }];
  SCENES['K_7.C2'] = {
    title: 'playroom: Kenton teaches T DDR; M dances with her toy robot dog', hero: 'hero', bg: 0x8a7654,
    set: [{ type: 'box', size: [0.95, 0.02, 0.95], at: [0, 0.01, 0], color: 0x30343c, name: 'DDR pad' }, { type: 'box', size: [2.0, 1.15, 0.06], at: [0, 1.15, 2.6], color: 0x9fd0ff, name: 'TV' },
      { type: 'box', size: [7, 2.6, 0.1], at: [0, 1.3, 2.7], color: 0xc9a66b, name: 'maple wall' }, { type: 'box', size: [0.9, 0.9, 2.0], at: [-2.3, 0.45, -0.4], color: 0x4a3526, name: 'recliners' }, ...dog(0.05, -1.16)],
    tablets: [],
    figures: [
      { who: 'T', pose: 'stand', at: [0, 0.10], yaw: 0, crouch: 0.05, look: [0, 1.2, 2.6], R: [-0.36, 0.95, 0.38], L: [0.36, 0.95, 0.38], step: { R: 0.12, L: -0.02 } },
      { who: 'kenton', pose: 'stand', at: [0, -0.28], yaw: 0, lean: 14, crouch: 0.08, look: [0, 0.9, 0.6], R: [-0.34, 0.97, 0.34], L: [0.34, 0.97, 0.34], step: { R: 0.1, L: -0.04 } },
      { who: 'M', pose: 'stand', at: [-0.40, -0.95], yaw: 115, crouch: 0.03, look: [0.05, 0.3, -1.16], R: [-0.42, 0.95, -1.28], L: [-0.12, 0.98, -0.72] },
    ],
    cams: { hero: { pos: [2.9, 1.15, -2.9], target: [0.0, 0.92, -0.45], hfov: 50 }, top: TOP([0.5, 0.5, -0.2], 4.2), front: { pos: [0.3, 1.2, 2.4], target: [0.4, 0.8, 0], hfov: 60 } },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// M's toy robot dog — the design views (see toy_dog.js). Transparent background; 'c2' is the keyframe's camera.
{
  const REAR = { pitch: 52, front: [12, 52], hind: [46, 60], paw: 30 }, STAND = { pitch: 0, front: [32, 64], hind: [32, 64] };
  const cams = (y) => ({ c2: { pos: [-1.25, 0.62, 1.2], target: [0, y, 0], hfov: 26 }, side: { pos: [-2.0, 0.2, 0.0], target: [0, y, 0], hfov: 20 }, front: { pos: [-0.5, 0.3, 1.9], target: [0, y, 0], hfov: 20 }, top: { pos: [-0.3, 2.0, 0.5], target: [0, 0.1, 0], hfov: 20 } });
  SCENES.toy_dog_rear = { title: 'M’s toy robot dog, reared up to dance (headless Go2 miniature)', bg: null, sun: [-2, 4, 3], set: [{ type: 'toydog', pose: REAR }], tablets: [], figures: [], cams: cams(0.215) };
  SCENES.toy_dog_stand = { title: 'M’s toy robot dog, standing (30 cm long, 20 cm at the back)', bg: null, sun: [-2, 4, 3], set: [{ type: 'toydog', pose: STAND }], tablets: [], figures: [], cams: cams(0.11) };
}

// ---------------------------------------------------------------------------------------------------------------
// 1.4a — THE WALKOUT, front view (rev3, Oct 8): the counterpart of 3.8b's rear view. Four crew (Adaeze leading,
// Anastasia, Arjun, Lúcia) cross the wet apron toward the floodlit rocket; the camera is low, ahead of them and to
// their left, so they come toward us and move to screen left, where the rocket stands small on the horizon. A loose
// file, uneven gaps, every pair of legs at a different point of the stride. Each carries a portable ventilation unit
// (35 x 20 x 20 cm, as Soyuz crews do: media/ref/rev3_astro/) in the LEFT hand; the right hand is free (Anastasia
// lifts hers). The far plane of the blockout camera is 80 m, so the rocket (62 m tall, 520 m off) is drawn at 1/8
// scale at 65 m: the same size in the picture.
{
  const YAW = 125, a = YAW * Math.PI / 180, F = [Math.sin(a), Math.cos(a)], R = [-Math.cos(a), Math.sin(a)];   // forward, own right (x, z)
  const at = (back, side) => [-0.55 - F[0] * back + R[0] * side, 0.0 - F[1] * back + R[1] * side];
  const P = (p, r, u, f) => [p[0] + R[0] * r + F[0] * f, u, p[1] + R[1] * r + F[1] * f];                          // own right / up / forward
  const who = [
    { who: 'adaeze', p: at(0, 0), step: { L: 0.34, R: -0.30 }, look: [40, 9, -32], wave: 0 },
    { who: 'anastasia', p: at(1.75, -0.2), step: { L: -0.22, R: 0.30 }, look: [2.5, 1.5, -7], wave: 1 },   // glances at the people seeing them off, hand up
    { who: 'arjun', p: at(3.6, 0.15), step: { L: 0.12, R: -0.10 }, look: [40, 34, -8], wave: 0 },           // looks up at the sky
    { who: 'lucia', p: at(5.6, 0.05), step: { L: -0.30, R: 0.26 }, look: [30, 0.6, -24], wave: 0 },
  ];
  const figures = who.map((w) => ({ who: w.who, pose: 'stand', at: w.p, yaw: YAW, lean: 4, crouch: 0.03, step: w.step, look: w.look,
    L: P(w.p, -0.30, 0.74, 0.06), R: w.wave ? P(w.p, 0.42, 1.62, 0.22) : P(w.p, 0.27, 0.80, -w.step.R * 0.5) }));
  const units = who.map((w) => { const c = P(w.p, -0.31, 0.55, 0.06); return { type: 'box', size: [0.20, 0.20, 0.35], at: c, rot: [0, YAW, 0], color: 0xb9bcc4, name: 'ventilation unit' }; });
  SCENES['K_1.4a'] = {
    title: 'walkout, front view: four cross the wet apron toward the rocket (screen left)', hero: 'hero', bg: 0x141c3c, sun: [6, 3, -4],
    set: [{ type: 'box', size: [400, 0.02, 400], at: [0, -0.01, 0], color: 0x25305c, name: 'wet apron' },
      { type: 'cyl', r: 0.42, h: 7.8, at: [10, 3.9, 60], color: 0xf2d9a0, name: 'rocket (1/8 scale at 1/8 distance)' },
      { type: 'box', size: [1.3, 8.6, 1.3], at: [12.4, 4.3, 60], color: 0xc9a660, name: 'tower' },
      { type: 'box', size: [9, 3.2, 0.3], at: [-16, 1.6, 24], rot: [0, 30, 0], color: 0x394a80, name: 'crew building (where they came from)' },
      ...units],
    tablets: [], figures,
    cams: { hero: { pos: [1.0, 0.55, -4.3], target: [-0.29, 1.2, 0.53], hfov: 60 }, eye: { pos: [0.4, 1.5, -4.6], target: [0.6, 1.0, 0.6], hfov: 50 },
      top: { pos: [-1.5, 14, 1.5], target: [-1.5, 0, 1.6], hfov: 50 }, rear: { pos: [-5.5, 0.8, 5.2], target: [3, 1.2, 2], hfov: 55 } },
  };
}
