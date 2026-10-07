// SECTION 8 · OUTRO — 189.86–212.0 (guzheng, humming, solo hum 201.6, last pluck 210.04). Colour returns.
// The closing inscription 海上生明月，天涯共此时 (Zhang Jiuling) brushes in vertically; the 望月 seal lands on the last pluck.
import { calli, card, hud, kf, ph, INK, INKC, PALE, PALEC, smooth } from './_lib.js';

export const range = [189.86, 212.0];

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const S81 = bar(105), S82 = bar(107), S83 = 200.5, S84 = 201.6, S85 = 210.04, END = 212.0;
  return [
    // 8.1 — the abrupt cut to black; then a capsule under parachutes over a silk-painted sea
    { id: '8.1', t0: S81, t1: S82, paper: 'silk', grain: 81,
      scene: [ph('Silence of black → the capsule under parachutes over a silk-painted sea', 'K_8.1')],
      post: (t, lt) => ({ fade: 1 - smooth(0.6, 1.8, lt), fadeColor: [0, 0, 0] }) },
    // 8.2 — Mid-Autumn, a year later: the Austin living room; M runs and bowls Jade over
    { id: '8.2', t0: S82, t1: S83, paper: 'silk', grain: 82,
      scene: [X.has('K_8.2') ? kf('K_8.2', { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.03 }, dolly: -0.05, flicker: 0.6,
        masks: { base: [0.1, 0.5], polys: [{ pts: [[0.4, 0.3], [0.85, 0.3], [0.85, 1], [0.4, 1]], depth: 0.85, blur: 12 }] } }) : ph('Homecoming: M runs and bowls Jade over', 'K_8.2')] },
    // 8.3 — the roof deck again (stand-in until its own frame exists)
    { id: '8.3', t0: S83, t1: S84, paper: 'silk', grain: 83,
      scene: [X.has('K_6.1') ? kf('K_6.1', { from: { x: 0.5, y: 0.45, zoom: 1.1 }, to: { x: 0.5, y: 0.42, zoom: 1.14 } }) : ph('The family on the roof deck; toy Earth and toy Moon on the parapet', 'K_8.3')],
      type(ctx, t) { hud(ctx, '8.3  ·  STAND-IN — K_6.1 (roof deck) until K_8.3 exists', 48, 1036, { size: 12, color: 'rgba(226,214,186,0.6)', tracking: 0.12 }); } },
    // 8.4 — the solo hum: the Moon in the tea; the closing inscription
    { id: '8.4', t0: S84, t1: S85, paper: 'silk', grain: 84,
      scene: [X.has('K_8.4') ? kf('K_8.4', { from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.56, y: 0.56, zoom: 1.2 }, dolly: 0.06,
        masks: { base: [0.0, 0.6], polys: [{ pts: [[0, 0.7], [1, 0.7], [1, 1], [0, 1]], depth: 0.95, blur: 10 }, { pts: [[0.12, 0.72], [0.26, 0.72], [0.26, 0.84], [0.12, 0.84]], water: 1, blur: 4 }] }, shimmer: 0.8, flicker: 0.5,
        mist: { color: [0.75, 0.75, 0.78], amount: 0.2, y0: 300, y1: 600, speed: 6 } }) : ph('The tea cup; the Moon in the tea', 'K_8.4')],
      type(ctx, t) { inscription(ctx, t, S84); } },
    // 8.5 — last pluck: the seal; fade
    { id: '8.5', t0: S85, t1: END, paper: 'silk', grain: 84,
      scene: [X.has('K_8.4') ? kf('K_8.4', { from: { x: 0.56, y: 0.56, zoom: 1.2 }, to: { x: 0.565, y: 0.565, zoom: 1.21 } }) : ph('The tea cup; the Moon in the tea', 'K_8.4'),
        { name: 'stamp', params: { stamp: { seal: 'seal_wangyue', x: 300, y: 820, size: 96, tLand: S85, rot: 0.02 } } }],
      type(ctx, t) { inscription(ctx, t, S84); },
      post: (t, lt) => ({ fade: smooth(0.6, 1.95, lt), fadeColor: [0.02, 0.02, 0.03] }) },
  ];
}

// 海上生明月，天涯共此时 — two vertical columns in the 留白 top-left, with the English beneath
function inscription(ctx, t, a) {
  calli(ctx, 'z84a', { text: '海上生明月，', size: 74, x: 380, y: 70, color: PALEC, seed: 81 }, t, a + 0.4, 2.6, 213, 'over');
  calli(ctx, 'z84b', { text: '天涯共此时', size: 74, x: 286, y: 70, color: PALEC, seed: 82 }, t, a + 2.9, 2.4, 213, 'over');
  card(ctx, 'e84', { lines: [[{ t: 'The bright moon rises over the sea;', font: 'CormorantItalic' }], [{ t: 'however far apart, we share this moment.', font: 'CormorantItalic' }]], size: 34, x: 440, y: 120, color: PALE }, t, a + 5.2, 213, 'over');
}
