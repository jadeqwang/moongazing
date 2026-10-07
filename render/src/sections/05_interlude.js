// SECTION 5 · INTERLUDE — 101.33–111.95 (erhu; riser; IMPACT 104.92; stop-start stabs; dip 109.5). INK paper.
// The 廣寒 station seal slams on the impact; the crew name cards flash one per half-beat stab.
import { hud, card, kf, ph, bump, INK, PALE, smooth } from './_lib.js';

export const range = [101.33, 111.95];

export const CREW = [ // order of the cells in K_7.C4_grid (row 1, row 2)
  ['CHEN YU', 'CHINA', 'COMMANDER', 'HARBIN'], ['ANASTASIA VOLKOVA', 'RUSSIA', 'FLIGHT ENGINEER', 'STAR CITY'],
  ['ADAEZE OKAFOR', 'NIGERIA', 'REACTOR', 'ENUGU'], ['ARJUN RAMAN', 'INDIA', 'GEOLOGY · ICE', 'CHENNAI'],
  ['LÚCIA FERREIRA', 'PORTUGAL · ESA', 'BOTANY', 'MINHO'], ['KENJI MORI', 'JAPAN', 'ROBOTICS', 'KAMAKURA'],
  ['LAYLA AL-MANSOORI', 'UAE', 'PILOT', 'AL AIN'], ['JADE WANG', 'USA', 'ISRU · HABITAT', 'AUSTIN'],
];
// one crew cell of K_7.C4_grid (2 rows × 4 columns of 16:9 cells)
export const cell = (i, zoom = 2.0) => ({ x: ((i % 4) + 0.5) / 4, y: (Math.floor(i / 4) + 0.5) / 2, zoom });

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const S51 = bar(55), S52 = bar(57), S53 = bar(58, 3), S54 = 109.5, END = L.L14a.start;
  // eight stabs between 107.60 and 109.5: on beats and half-beats
  const stabs = [bar(58, 3), (bar(58, 3) + bar(58, 4)) / 2, bar(58, 4), (bar(58, 4) + bar(59)) / 2, bar(59), (bar(59) + bar(59, 2)) / 2, bar(59, 2), (bar(59, 2) + bar(59, 3)) / 2];
  return [
    // 5.1 — +6 h · EGRESS: first steps; long, long shadows (Sun at 1°); the crew lopes in 1/6 g
    { id: '5.1', t0: S51, t1: S52, paper: 'xuan', grain: 51,
      scene: [X.has('K_5.1') ? kf('K_5.1', { from: { x: 0.45, y: 0.5, zoom: 1.06 }, to: { x: 0.58, y: 0.5, zoom: 1.12 }, par: [0.02, 0], dolly: 0.05,
        masks: { base: [0.0, 0.6], polys: [{ pts: [[0.4, 0.3], [0.95, 0.3], [0.95, 0.75], [0.4, 0.75]], depth: 0.7, blur: 14 }] } }) : ph('First steps; long shadows; the crew lopes in 1/6 g', 'K_5.1')],
      type(ctx, t) { hud(ctx, '+6 H  ·  EGRESS  ·  SUN 1.0°', 64, 72, { size: 15, rgb: '30,30,32', a: 0.9 }, 1, 'ink'); } },
    // 5.2 — IMPACT: the 廣寒 seal slams onto the ink landscape; the plan of the base is drawn in beneath it
    { id: '5.2', t0: S52, t1: S53, paper: X.has('K_5.2') ? 'xuan' : 'indigo', grain: 52, flash: true, post: (t, lt) => bump(lt, 0.014),
      scene: [X.has('K_5.2') ? kf('K_5.2', { reveal: (t, lt) => smooth(0.1, 2.0, lt) * 1.4 })
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
      scene: [X.has('K_7.C4_grid') ? { name: 'plate', params: { img: 'K_7.C4_grid', grade: 'native', from: cell(i, 2.0), to: cell(i, 2.08) } } : ph(CREW[i][0], 'K_7.C4_grid')],
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
    { id: '5.4', t0: S54, t1: END, paper: 'xuan', grain: 54, scene: [ph('Jade alone, back to camera, at the edge of the ridge; everything ink', 'K_5.4')] },
  ];
}
