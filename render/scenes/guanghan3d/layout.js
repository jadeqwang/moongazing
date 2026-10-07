// Guanghan Station 广寒 — canonical layout. SINGLE SOURCE OF TRUTH for docs/guanghan_layout.md and every guide render.
// Units: metres. Bearings: degrees clockwise from GRID NORTH (G-N), which is defined as the direction of Earth
// (Earth hangs on the horizon at bearing 000, elevation −6.7°…+6.7°, nominal +1.5°).
// World axes (three.js): x = grid east, y = up, z = grid SOUTH (so north = −z). Origin = centre of the hub floor.

export const R_MOON = 1737400;
const rad = (d) => (d * Math.PI) / 180;
export const P = (bearing, r, y = 0) => [r * Math.sin(rad(bearing)), y, -r * Math.cos(rad(bearing))];
export const dirFrom = (bearing, elev = 0) => [
  Math.sin(rad(bearing)) * Math.cos(rad(elev)), Math.sin(rad(elev)), -Math.cos(rad(bearing)) * Math.cos(rad(elev))];

export const L = {
  site: { name: 'Shackleton–de Gerlache connecting ridge', lat: '89.5°S', plateauR: 250 },
  earth: { bearing: 0, elevNominal: 1.5, bob: 6.7, diamDeg: 1.9 },

  // Central hub = "the tower". 3 decks + observation cupola on the roof.
  hub: {
    r: 4.5, decks: [0.3, 3.3], roofY: 6.6, // L1 = junction (all 8 tunnels/connectors), L2 = commons "quiet deck"
    cupola: { r: 3.5, floorY: 6.6, sillY: 7.3, topY: 10.8, ribs: 8 },
    l2Windows: { bearings: [0, 45, 90, 135, 180, 225, 270, 315], w: 0.7, h: 1.1, sillY: 4.3 },
    l3Portholes: { n: 12, d: 0.4, y: 6.95 }, // ring of portholes in the cupola's sill wall (K_7.A)
  },

  // Pressurised tunnels in a cross (the K_7.A "cross"): N, E, S, W.
  arms: { r: 1.5, cy: 1.65, from: 4.5, to: 28, bearings: [0, 90, 180, 270], ribEvery: 1.2, portholeEvery: 4 },
  // End nodes of the N and S arms (exposed, between the berms — the warm "portals").
  nodes: {
    N: { bearing: 0, r: 28, rad: 2.0, h: 3.8, fn: 'Emergency airlock (second egress), vermilion hatch facing north' },
    S: { bearing: 180, r: 28, rad: 2.0, h: 3.8, fn: 'Power node: cables in from the 6 masts and the reactor; vermilion hatch facing south' },
  },
  // Short connectors from the hub to the four quadrant modules.
  connectors: { r: 1.1, cy: 1.65, from: 4.5, to: 13.5 },

  // Pressure vessels (landed, rigid, ribbed) — each buried under a printed regolith shell ("mound").
  modules: {
    NE: { bearing: 45, r: 19, len: 11, rad: 2.25, cy: 2.4, floorY: 1.0, fn: 'Galley / wardroom (table for 8, wall screen on the outer end)' },
    NW: { bearing: 315, r: 19, len: 11, rad: 2.25, cy: 2.4, floorY: 1.0, fn: 'Crew quarters: 8 sleep pods, hygiene' },
    SE: { bearing: 135, r: 19, len: 11, rad: 2.25, cy: 2.4, floorY: 1.0, fn: 'Science lab: geology glovebox, ice/volatiles lab, medical; ISRU control desk' },
    SW: { bearing: 225, r: 19, len: 11, rad: 2.25, cy: 2.4, floorY: 1.0, fn: 'Greenhouse chamber (magenta grow lights, regolith-soil trays)' },
  },
  // Regolith shells (printed, ~2.5–3 m thick over the vessels). a = half-length along the radial axis, b = half-width.
  mounds: {
    NE: { bearing: 45, r: 19, a: 11, b: 9, h: 7.5 },
    NW: { bearing: 315, r: 19, a: 11, b: 9, h: 7.5 },
    SE: { bearing: 135, r: 19, a: 11, b: 9, h: 7.5 },
    SW: { bearing: 225, r: 19, a: 11, b: 9, h: 7.5 },
    E: { bearing: 90, r: 37, a: 8.5, b: 10, h: 7.0, fn: 'Main airlock + 4 suitports + rover garage (Yutu-A/B, LTV); garage door faces east to the pad road' },
    W: { bearing: 270, r: 37, a: 8.5, b: 10, h: 7.5, fn: 'ISRU hall: unpressurised printed vault (span 10 m, h 5 m) with the molten-regolith O₂ reactor' },
  },
  isruVault: { bearing: 270, r0: 31, r1: 43, span: 10, h: 5.0, floorY: 0.2 },

  // Vertical solar array masts (VSAT class) — a hexagonal ring OUTSIDE the berms.
  masts: {
    ringR: 55, bearings: [30, 90, 150, 210, 270, 330], h: 20, rad: 0.22,
    panel: { y0: 10.5, y1: 19.5, wingW: 2.0, gap: 0.3, cols: 4, rows: 12 }, tripodR: 2.5,
    names: { 30: 'M1', 90: 'M2', 150: 'M3', 210: 'M4', 270: 'M5', 330: 'M6' },
  },
  comms: { bearing: 345, r: 90, h: 25, dishD: 3.0 },

  // Far elements (true distances). Jiehua plates compress these (see `compressed`).
  reactor: { bearing: 180, r: 1000, coreR: 1.6, coreH: 3.5, sunk: 2.0, fins: 12, finW: 3, finH: 9, berm: { len: 52, w: 12, h: 5, offset: 8 } }, // straight E–W berm between reactor and base (K_7.A)
  pad: { bearing: 90, r: 2000, discR: 25, bermR: 35, bermH: 2.5 },
  psr: { bearing: 225, r: 700, R: 150, depth: 45 },
  shackleton: { bearing: 80, r: 13200, R: 10500, depth: 4200 },
  deGerlache: { x: -33000, n: 13000, R: 16000, depth: 2500 },
  malapert: { bearing: 0, r: 120000, h: 5000 },
  compressed: { pad: { bearing: 90, r: 100, scale: 0.5 }, reactor: { bearing: 180, r: 92, scale: 0.8 } },
};

// Construction stages. Every mid-construction shot picks one of these (7.A1–A4); nothing else may differ.
export const STAGES = {
  1: { label: 'Stage 1 · SURVEY & GRADING', day: 'DAY −640 → −400', masts: { 90: 1, 150: 1 }, mastBases: true, footprints: true,
       hub: false, modules: false, shells: {}, cupola: 'none', comms: false, reactor: 'staked', fins: 0, pad: 'none',
       lander: 'cargo', printer: 'parked', lights: false },
  2: { label: 'Stage 2 · MASTS UP, VESSELS LANDED, SHELLS PRINTING', day: 'DAY −400 → −20',
       masts: { 30: 1, 90: 1, 150: 1, 210: 0.45, 270: 1, 330: 0.7 }, mastBases: true, footprints: false,
       hub: true, modules: true, shells: { NE: 1, NW: 0.6, SE: 0.35, SW: 0, E: 0.85, W: 0.15 }, cupola: 'shuttered', comms: true,
       reactor: 'folded', fins: 0, pad: 'none', lander: 'cargo', printer: 'SE', lights: false },
  3: { label: 'Stage 3 · CREW ARRIVES, REACTOR FINS RAISED', day: 'DAY 001 → 030', masts: 'all', mastBases: true,
       hub: true, modules: true, shells: 'all', cupola: 'shuttered', comms: true, reactor: 'deploying', fins: 0.55,
       pad: 'none', lander: 'crew', printer: 'parked', lights: false },
  4: { label: 'Stage 4 · PAD GLAZED, CUPOLA OPEN', day: 'DAY 030 → 097', masts: 'all', mastBases: true, hub: true, modules: true,
       shells: 'all', cupola: 'glazed', comms: true, reactor: 'on', fins: 1, pad: 'glazing', lander: 'crew', printer: 'parked', lights: false },
  5: { label: 'Stage 5 · LIGHTS ON (complete = K_7.A)', day: 'DAY 097 →', masts: 'all', mastBases: true, hub: true, modules: true,
       shells: 'all', cupola: 'glazed', comms: true, reactor: 'on', fins: 1, pad: 'done', lander: 'crew', printer: 'none', lights: true },
};
