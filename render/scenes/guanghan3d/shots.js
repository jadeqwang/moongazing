// Camera table for every moonbase shot in docs/script.md. Positions in metres, world frame of layout.js
// (x = grid east, y = up, z = grid south; Earth at bearing 000). `frame` = interior-local coordinates
// (galley/isru: local +x runs along the module axis away from the hub, y up from the ground, +z = left of +x).
import { L, P, STAGES } from './layout.js';

const S = (n, extra = {}) => ({ ...STAGES[n], ...extra });
const JIEHUA_CAM = { ortho: 210, from: { bearing: 315, elev: 33 }, target: [22, 0, 22] }; // K_7.A: looking SE, pad upper-left, reactor upper-right

export const SHOTS = [
  { id: '1.5', paper: 'INK', label: 'Guanghan Station in terrain shadow; warm portals between berms; mast panels + cupola catch the sun; tiny Earth',
    state: S(5), cam: { pos: P(214, 140, 2.2), aimBearing: 26, pitch: -2.5, hfov: 70 },
    sun: { bearing: 250, elev: 0.8 }, shadowY: 10.0, lights: true, depthNear: 60, depthFar: 2500 },
  { id: '5.2', paper: 'JIEHUA plan', label: 'Site plan, north (= Earth) up, seal-stamp moment',
    state: S(5, { rovers: true }), cam: { orthoTop: 262, target: [0, 0, -20] }, sun: { bearing: 230, elev: 35 }, lights: false },
  { id: '6.2', paper: 'RUBBING/INK', label: 'Shackleton rim overlook, 2.6 km ENE of base, looking north to Earth (base is behind-left: NOT in frame)',
    state: S(5), cam: { rim: true, hfov: 55 }, sun: { bearing: 15, elev: 0.3 }, depthNear: 2, depthFar: 30000 },
  { id: '7.A', paper: 'GOLD', label: 'Complete station (stage 5) — the K_7.A plate', state: S(5, { compress: true }), cam: JIEHUA_CAM, sun: { bearing: 200, elev: 25 } },
  { id: '7.A1', paper: 'GOLD', label: STAGES[1].label + ' · ' + STAGES[1].day, state: S(1, { compress: true }), cam: JIEHUA_CAM, sun: { bearing: 200, elev: 25 } },
  { id: '7.A2', paper: 'GOLD', label: STAGES[2].label + ' · ' + STAGES[2].day, state: S(2, { compress: true }), cam: JIEHUA_CAM, sun: { bearing: 200, elev: 25 } },
  { id: '7.A3', paper: 'GOLD', label: STAGES[3].label + ' · ' + STAGES[3].day, state: S(3, { compress: true }), cam: JIEHUA_CAM, sun: { bearing: 200, elev: 25 } },
  { id: '7.A4', paper: 'GOLD', label: STAGES[4].label + ' · ' + STAGES[4].day, state: S(4, { compress: true }), cam: JIEHUA_CAM, sun: { bearing: 200, elev: 25 } },
  { id: '7.B1', paper: 'INK', label: 'Arjun drilling in the PSR crater 700 m SW (base hidden by the crater wall)',
    state: S(5, { psrDrill: true }), cam: { psr: true, hfov: 62 }, sun: { bearing: 250, elev: 1.0 }, shadowY: 'psr', spot: true, depthNear: 1, depthFar: 400 },
  { id: '7.B2', paper: 'GOLD', label: 'ISRU hall (W mound, unpressurised printed vault): Jade (suited) at the molten-regolith reactor valve',
    state: S(5, { interior: 'isru' }), hide: ['moundW'], cam: { frame: 'isru', pos: [-0.3, 1.8, 3.2], target: [0.95, 1.2, 0.9], hfov: 66 },
    sunOff: true, pts: [{ local: [1.3, 1.25, 1.6], col: [1.0, 0.45, 0.12], range: 4 }, { local: [0, 4.5, 0], col: [0.55, 0.52, 0.48], range: 12 }],
    lights: true, depthNear: 0.4, depthFar: 20 },
  { id: '7.B6', paper: 'GOLD', label: 'Habitat lights come on window by window (exterior, base in terrain shadow)',
    state: S(5), cam: { pos: P(235, 125, 14), target: [0, 4, 0], hfov: 55 }, sun: { bearing: 250, elev: 0.8 }, shadowY: 10.0, lights: true, depthNear: 50, depthFar: 2500 },
  { id: '7.C4', paper: 'GOLD', label: 'Galley/wardroom (NE module) looking back toward the hub hatch; 8 crew around the table',
    state: S(5, { interior: 'galley' }), hide: ['moduleNE', 'moundNE'], cam: { frame: 'galley', pos: [4.9, 2.4, 0], target: [-5.5, 1.85, 0], hfov: 82 },
    sunOff: true, pts: [{ local: [0, 4.2, 0], col: [0.85, 0.8, 0.7], range: 9 }], lights: true, depthNear: 0.8, depthFar: 15 },
  { id: '7.C6', paper: 'GOLD', label: 'Hub deck 2, the one north window: Jade, tea cup on the sill, Earth on the horizon',
    state: S(5, { interior: 'l2' }), hide: ['hubBody', 'hubWin'], cam: { world: true, pos: [0.15, 4.85, -2.05], target: [0.05, 4.78, -60], hfov: 50 },
    sun: { bearing: 200, elev: 1.0 }, pts: [{ world: [0, 5.8, 0], col: [0.6, 0.55, 0.45], range: 6 }], lights: true, depthNear: 0.5, depthFar: 400 },
  { id: '7.D2', paper: 'GOLD', label: 'Galley outer end: Jade touches the wall screen (livestream)',
    state: S(5, { interior: 'galleyScreen' }), hide: ['moduleNE', 'moundNE'], cam: { frame: 'galley', pos: [-2.2, 2.3, 0.6], target: [5.5, 2.45, 0], hfov: 70 },
    sunOff: true, pts: [{ local: [0, 4.2, 0], col: [0.75, 0.7, 0.62], range: 9 }], lights: true, depthNear: 0.8, depthFar: 15 },
  { id: '7.E1', paper: 'GOLD + INK view', label: 'Observation cupola atop the hub, looking north: N arm, NE/NW berms, masts M6/M1, comms tower, Earth',
    state: S(5, { crewCupola: true }), hide: ['glass'], cam: { world: true, pos: [0, 8.25, 2.7], target: [0, 7.6, -60], hfov: 80 },
    sun: { bearing: 200, elev: 1.0 }, pts: [{ world: [0, 9.8, 0], col: [0.5, 0.45, 0.35], range: 5 }], lights: true, depthNear: 1.0, depthFar: 600 },
  { id: '7.E2a', paper: 'GOLD→INK', label: 'Pull-back 1: the station', state: S(5), cam: { pos: P(185, 75, 60), target: [0, 3, -5], hfov: 60 }, sun: { bearing: 200, elev: 1.0 }, lights: true, depthNear: 40, depthFar: 1500 },
  { id: '7.E2b', paper: 'INK', label: 'Pull-back 2: the ridge (pad 2 km E, reactor 1 km S, PSR crater 700 m SW, Shackleton rim E)',
    state: S(5), cam: { top: 3500, center: [800, 0, 300], hfov: 60 }, sun: { bearing: 200, elev: 1.0 }, amb: 0.6, edgeNT: 0.035, depthNear: 3000, depthFar: 5000 },
  { id: '7.E2c', paper: 'INK', label: 'Pull-back 3: the south pole (Shackleton, de Gerlache rim)', state: S(5), cam: { top: 60000, center: [3000, 0, 0], hfov: 60 },
    sun: { bearing: 200, elev: 1.0 }, amb: 0.6, edgeNT: 0.03, depthNear: 45000, depthFar: 75000 },
  // ---------------- round 2
  { id: '4.7', paper: 'GOLD', label: 'Capsule cabin after TLI cutoff: Jade (back) lifts a drink pouch toward the Moon in the side window; toy Earth floats beside her',
    state: { space: 'capsule' }, noEarth: true, cam: { world: true, pos: [0.3, 1.65, 1.0], target: [-0.1, 1.38, -1.6], hfov: 70 },
    sun: { bearing: 150, elev: 20 }, pts: [{ world: [0, 2.2, 0], col: [0.8, 0.75, 0.65], range: 4 }], lights: true, depthNear: 0.3, depthFar: 6 },
  { id: '5.4', paper: 'INK', label: 'Jade alone at the south lip of the ridge plateau, 460 m SE of the hub, looking NNW: base small at left, Earth low at right',
    state: S(5, { jadeAt: { bearing: 120, r: 460, facing: 330 } }), cam: { pos: [P(120, 460)[0] + P(150, 5.5)[0], 1.9, P(120, 460)[2] + P(150, 5.5)[2]], aimBearing: 330, pitch: -1.0, hfov: 80 },
    sun: { bearing: 150, elev: 1.0 }, lights: true, depthNear: 3, depthFar: 3000 },
  { id: '7.B3', paper: 'GOLD + one green', label: 'Greenhouse (SW module): Lúcia at the sealed growth chamber with the first rosette',
    state: S(5, { interior: 'greenhouse' }), hide: ['moduleSW', 'moundSW'], cam: { frame: 'greenhouse', pos: [4.7, 2.5, -0.55], target: [2.2, 1.85, 0.2], hfov: 64 },
    sunOff: true, pts: [{ local: [0.5, 3.6, 0], col: [0.8, 0.55, 0.8], range: 8 }, { local: [2.6, 2.6, 0], col: [0.7, 0.7, 0.65], range: 3 }], lights: true, depthNear: 0.5, depthFar: 12 },
  { id: '7.B4', paper: 'INK', label: "Kenji's radio array: film strips unrolled on the permanently shadowed floor of Shackleton; sunlit rim 4 km above",
    state: S(5, { radioArray: true }), noEarth: true, cam: { array: true, pitch: 13, hfov: 72 }, sun: { bearing: 80, elev: 1.5 }, shadowY: 'shack', spot: 'array', amb: 0.12, depthNear: 3, depthFar: 15000 },
  { id: '7.C1m', paper: 'GOLD', label: 'Moon side of the video call: Jade (from behind) at the galley table, laptop showing the kids',
    state: S(5, { interior: 'galleyCall' }), hide: ['moduleNE', 'moundNE'], cam: { frame: 'galley', pos: [-2.45, 2.3, 0.45], target: [0.1, 1.85, -0.05], hfov: 62 },
    sunOff: true, pts: [{ local: [0, 4.2, 0], col: [0.75, 0.7, 0.62], range: 9 }], lights: true, depthNear: 0.5, depthFar: 12 },
];
export const SHOT = Object.fromEntries(SHOTS.map((s) => [s.id, s]));
