// SECTION 5 · INTERLUDE — 101.33–111.95 (erhu; riser; IMPACT 104.92; stop-start stabs; dip 109.5). INK paper.
// The 廣寒 station seal slams on the impact; the crew name cards flash one per half-beat stab.
import { hud, card, kf, ph, bump, INK, PALE, smooth } from './_lib.js';
import { earthView, EARTH_KEYS } from '../scenes/earthview.js';

export const range = [101.33, 111.95];

export const CREW = [ // order of the cells in K_7.C4_grid (row 1, row 2)
  ['CHEN YU', 'CHINA', 'COMMANDER', 'HARBIN'], ['ANASTASIA VOLKOVA', 'RUSSIA', 'FLIGHT ENGINEER', 'STAR CITY'],
  ['ADAEZE OKAFOR', 'NIGERIA', 'REACTOR', 'ENUGU'], ['ARJUN RAMAN', 'INDIA', 'GEOLOGY · ICE', 'CHENNAI'],
  ['LÚCIA FERREIRA', 'PORTUGAL · ESA', 'BOTANY', 'MINHO'], ['KENJI MORI', 'JAPAN', 'ROBOTICS', 'KAMAKURA'],
  ['LAYLA AL-MANSOORI', 'UAE', 'PILOT', 'AL AIN'], ['JADE WANG', 'USA', 'ISRU · HABITAT', 'AUSTIN'],
];
// one crew cell of K_7.C4_grid (2 rows × 4 columns of 16:9 cells)
export const CELLS = ['c1_chen', 'c2_anastasia', 'c3_adaeze', 'c4_arjun', 'c5_lucia', 'c6_kenji', 'c7_layla', 'c8_jade'];
// a crew portrait: its own keyframe K_7.C4_cN_name if delivered, else the cell of the grid
export function crewCell(X, i, z0 = 1.0, z1 = 1.08, o = {}) {
  const k = `K_7.C4_${CELLS[i]}`;
  if (X.has(k)) return { name: 'plate', params: { img: k, grade: 'native', from: { x: 0.5, y: 0.5, zoom: z0 }, to: { x: 0.5, y: 0.5, zoom: z1 }, ...o } };
  if (X.has('K_7.C4_grid')) return { name: 'plate', params: { img: 'K_7.C4_grid', grade: 'native', from: cell(i, 2 * z0), to: cell(i, 2 * z1), ...o } };
  return null;
}
export const cell = (i, zoom = 2.0) => ({ x: ((i % 4) + 0.5) / 4, y: (Math.floor(i / 4) + 0.5) / 2, zoom });

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const S51 = bar(55), S52 = bar(57), S53 = bar(58, 3), S54 = 109.5, END = L.L14a.start;
  // eight stabs between 107.60 and 109.5: on beats and half-beats
  const stabs = [bar(58, 3), (bar(58, 3) + bar(58, 4)) / 2, bar(58, 4), (bar(58, 4) + bar(59)) / 2, bar(59), (bar(59) + bar(59, 2)) / 2, bar(59, 2), (bar(59, 2) + bar(59, 3)) / 2];
  // 5.4: the push on the take, and the Earth in keyframe uv [x, y, radius / width] (no Earth is painted in K_5.4_rev_sys2)
  const V54 = { from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.52, y: 0.5, zoom: 1.12 } }, E54 = [0.845, 0.388, 0.0126];
  return [
    // 5.1 — +6 h · EGRESS: first steps; long, long shadows (Sun at 1°); the crew lopes in 1/6 g
    { id: '5.1', t0: S51, t1: S52, paper: 'xuan', grain: 51, focus: [1100, 560],
      // K_5.1/take_2 (h3, rev Oct 7): cut in 1.5 s into the take, as the nearest astronaut comes down from her first hop;
      // she lands (clip 1.8 s), takes two steps, pushes off (3.6 s) and lands again (5.4 s) just before the cut (rate 1.14).
      // Whole subjects and their shadows are redrawn (take_1 left her painted in mid-air over a painted shadow).
      scene: [X.has('K_5.1') ? { type: 'roto', clip: 'K_5.1/take_2', paper: 'ink', offset: 1.45, rate: 1.14, lock: 0, subject: false, maskGain: 8, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.54, y: 0.5, zoom: 1.1 } }
        : ph('First steps; long shadows; the crew lopes in 1/6 g', 'K_5.1')],
      type(ctx, t) { hud(ctx, '+6 H  ·  EGRESS  ·  SUN 1.0°', 64, 72, { size: 15, rgb: '30,30,32', a: 0.9 }, 1, 'ink'); } },
    // 5.2 — IMPACT: the 廣寒 seal slams onto the ink landscape; the plan of the base is drawn in beneath it
    { id: '5.2', t0: S52, t1: S53, paper: X.has('K_5.2') ? 'xuan' : 'indigo', grain: 52, flash: true, post: (t, lt) => bump(lt, 0.014),
      scene: [X.has('K_5.2') ? kf('K_5.2', { from: { x: 0.5, y: 0.5, zoom: 1.0 }, to: { x: 0.5, y: 0.5, zoom: 1.06 }, reveal: (t, lt) => smooth(0.04, 0.9, lt) * 1.5 })
        : { name: 'plate', params: { img: 'K_7.A', grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.0 }, to: { x: 0.5, y: 0.5, zoom: 1.06 }, reveal: (t, lt) => smooth(0.1, 2.2, lt) * 1.4 } },
        { name: 'stamp', params: { stamp: { seal: 'seal_guanghan', x: 330, y: 300, size: 230, tLand: S52, rot: -0.04 } } }],
      type(ctx, t) {
        card(ctx, 'c52', { lines: [[{ t: '广寒  ', font: 'MaShanZheng', size: 64 }, { t: 'GUANGHAN STATION' }]], size: 52, tracking: 0.12, x: 120, y: 900, color: X.has('K_5.2') ? INK : PALE }, t, S52 + 0.3, S53 + 0.05, X.has('K_5.2') ? 'ink' : 'over');
        hud(ctx, '89.5° S  ·  SHACKLETON–DE GERLACHE RIDGE', 124, 950, { size: 15, rgb: X.has('K_5.2') ? '30,30,32' : '240,232,214' }, smooth(S52 + 0.8, S52 + 1.1, t), X.has('K_5.2') ? 'ink' : 'over');
        if (!X.has('K_5.2')) hud(ctx, '5.2  ·  STAND-IN — K_5.2 (ink landscape + plan) pending; K_7.A plan shown', 48, 1036, { size: 12, color: 'rgba(226,214,186,0.6)', tracking: 0.12 });
      } },
    // 5.3 — the stop-start stabs: one crew name card per stab
    ...stabs.map((a, i) => ({
      id: `5.3${'abcdefgh'[i]}`, t0: a, t1: i < 7 ? stabs[i + 1] : S54, paper: 'indigo', grain: 530 + i, grid: 'half', // stabs fall on half-beats
      scene: [crewCell(X, i, 1.0, 1.08) || ph(CREW[i][0], 'K_7.C4_grid')],
      type(ctx, t) {
        const [name, nat, role, home] = CREW[i];
        ctx.pipe.layer((g) => {
          g.fillStyle = 'rgba(8,10,20,0.78)'; g.fillRect(64, 640, 760, 300);
          g.strokeStyle = 'rgba(232,72,52,0.95)'; g.lineWidth = 3; g.beginPath(); g.moveTo(64, 640); g.lineTo(824, 640); g.stroke();
        }, { mode: 'over' });
        hud(ctx, name, 92, 720, { size: 44, rgb: '255,255,255', a: 1, tracking: 0.08 }, 1);
        hud(ctx, `${nat}  ·  ${role}`, 94, 780, { size: 18, rgb: '232,72,52', a: 1 }, 1);
        hud(ctx, `HOME  ·  ${home}  ·  384 400 KM`, 94, 830, { size: 18, rgb: '240,232,214', a: 0.95 }, 1);
        hud(ctx, `CREW ${i + 1}/8`, 94, 900, { size: 14, rgb: '240,232,214', a: 0.7 }, 1);
      },
    })),
    // 5.4 — the dip: Jade alone, back to camera, at the edge of the ridge. Everything ink.
    // rev Oct 7 (glitch sweep): K_5.4/take_4 (h3, from K_5.4_rev_sys2): she shifts her weight and lifts her helmet a little;
    //       ONE shadow, running from her boots toward the Earth's azimuth (the Sun is on the horizon behind her, as in
    //       the breakdown that follows: technical_accuracy_notes §4b); no painted Earth: scenes/earthview.js draws the
    //       breakdown's sky (full, south-up, 2.05° drawn 1.2×, 4.8° above the horizon over the end of her shadow).
    { id: '5.4', t0: S54, t1: END, paper: 'xuan', grain: 54, focus: [960, 560], ...(X.pick('K_5.4') ? { needs: [...EARTH_KEYS],
      type(ctx, t, lt) { const u = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, lt / (END - S54)))), z = V54.from.zoom + (V54.to.zoom - V54.from.zoom) * u, h = 0.5 / z;
        const cx = Math.min(1 - h, Math.max(h, V54.from.x + (V54.to.x - V54.from.x) * u)), cy = Math.min(1 - h, Math.max(h, V54.from.y + (V54.to.y - V54.from.y) * u));
        earthView(ctx, { x: ((E54[0] - cx) * z + 0.5) * 1920, y: ((E54[1] - cy) * z + 0.5) * 1080, r: E54[2] * z * 1920, subLat: 6.6, subLon: 147.7, north: 131.3, phase: 6.2, sunPA: 25.8 }); } } : {}),
      scene: [X.pick('K_5.4') ? { type: 'roto', clip: X.pick('K_5.4').clip, paper: 'ink', offset: 0.5, lock: 0, ...V54 } : X.has('K_5.4') ? kf('K_5.4', { from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.5, y: 0.52, zoom: 1.12 }, dolly: 0.08, reveal: (t, lt) => 0.42 + smooth(0, 0.5, lt) * 1.2, masks: { base: [0.0, 0.9], polys: [{ pts: [[0, 0], [1, 0], [1, 0.42], [0, 0.42]], depth: 0.0, blur: 20 }] } }) : ph('Jade alone, back to camera, at the edge of the ridge; everything ink', 'K_5.4')] },
  ];
}
