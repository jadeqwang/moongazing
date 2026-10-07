// SECTION 6 · BREAKDOWN — 111.95–122.77 — RUBBING (white on black). 举头望明月 rises as the family raise their heads;
// 低头思故乡 sinks as Jade lowers hers; one huge trembling 乡 is held 118.8–122.6.
import { lyricZH, card, hud, kf, ph, PALE, WHITE, smooth } from './_lib.js';

export const range = [111.95, 122.77];

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const S61 = L.L14a.start, S62 = L.L14b.start, S62b = bar(64), S63 = 118.8, S64 = bar(66), DROP = bar(67);
  const rub = (img, o) => ({ name: 'plate', params: { img, grade: 'rubbing', from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.5, y: 0.5, zoom: 1.1 }, dolly: 0.05, masks: { base: [0.1, 0.6] }, ...o } });
  const gloss = (ctx, key, s, t, a, b) => card(ctx, key, { lines: [[{ t: s, font: 'CormorantItalic' }]], size: 32, x: 960, y: 1040, align: 'center', color: PALE }, t, a, b, 'over');
  const xiang = (ctx, t, x, y) => lyricZH(ctx, L.L14b, { from: 4, key: 'xiang', size: 560, x, y, color: WHITE, seed: 130, until: 122.62, shake: 2.2 * smooth(118.8, 119.6, t), early: 0.0 }, t, 'over');
  return [
    // 6.1 — EARTH: the Austin roof deck, Mid-Autumn; Kenton, T and M raise their heads; the camera tilts up with them
    { id: '6.1', t0: S61, t1: S62, paper: 'rubbing', grain: 61,
      scene: [X.has('K_6.1') ? rub('K_6.1', { from: { x: 0.5, y: 0.62, zoom: 1.12 }, to: { x: 0.5, y: 0.4, zoom: 1.12 } }) : ph('The family raise their heads to the full Moon', 'K_6.1')],
      type(ctx, t) {
        lyricZH(ctx, L.L14a, { size: 118, x: 1720, y: 300, color: WHITE, seed: 131, until: S62 + 0.05, dy: (tt) => -150 * smooth(S61, S62, tt) }, t, 'over');
        gloss(ctx, 'g61', 'I raise my head and gaze at the bright Moon,', t, S61 + 0.4, S62 + 0.05);
      } },
    // 6.2 — MOON: on the rim of Shackleton, Jade lowers her head; Earth a dark disc with a hairline crescent
    { id: '6.2a', t0: S62, t1: S62b, paper: 'rubbing', grain: 62,
      scene: [X.has('K_6.2ii') ? rub('K_6.2ii', { grade: 'native', from: { x: 0.5, y: 0.42, zoom: 1.06 }, to: { x: 0.5, y: 0.55, zoom: 1.1 } }) : ph('Jade on the rim of Shackleton; Earth below her eye line', 'K_6.2ii')],
      type(ctx, t) {
        lyricZH(ctx, L.L14b, { to: 4, size: 104, x: 900, y: 150, color: WHITE, seed: 132, until: S63 + 0.05, dy: (tt) => 160 * smooth(S62, S63, tt) }, t, 'over');
        gloss(ctx, 'g62', 'I lower my head and think of home.', t, S62 + 0.4, S63 + 0.05);
      } },
    { id: '6.2b', t0: S62b, t1: S63, paper: 'rubbing', grain: 63,
      scene: [X.has('J_6.2') ? rub('J_6.2', { grade: 'native', from: { x: 0.5, y: 0.45, zoom: 1.04 }, to: { x: 0.52, y: 0.55, zoom: 1.12 } }) : ph('Jade, head lowered; Earth in her visor', 'J_6.2')],
      type(ctx, t) {
        lyricZH(ctx, L.L14b, { to: 4, key: 'b', size: 104, x: 420, y: 150, color: WHITE, seed: 132, until: S63 + 0.05, dy: (tt) => 160 * smooth(S62, S63, tt) }, t, 'over');
        gloss(ctx, 'g62', 'I lower my head and think of home.', t, S62 + 0.4, S63 + 0.05);
      } },
    // 6.3 — 乡 held: the visor; her thumb at arm's length blots out the whole Earth
    { id: '6.3', t0: S63, t1: S64, paper: 'rubbing', grain: 64,
      scene: [X.has('K_6.2iii') ? rub('K_6.2iii', { grade: 'native', from: { x: 0.55, y: 0.5, zoom: 1.04 }, to: { x: 0.58, y: 0.5, zoom: 1.16 } }) : ph('Close on the visor; the thumb blots out the Earth', 'K_6.2iii')],
      type(ctx, t) { xiang(ctx, t, 640, 250); } },
    // 6.4 — build gap: helmet-camera long exposure; the night side's city lights → one lit window
    { id: '6.4', t0: S64, t1: DROP, paper: 'rubbing', grain: 65, scene: [ph('Long exposure: the city lights of the night side — Yangtze delta → one lit window', 'K_6.4', { dark: true })],
      type(ctx, t) { xiang(ctx, t, 1250, 250); } },
  ];
}
