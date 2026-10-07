// SECTION 8 · OUTRO — 189.86–210.04 (guzheng, humming, solo hum 201.6, last pluck 210.04). Colour returns.
// The closing inscription 海上生明月，天涯共此时 (Zhang Jiuling) brushes in vertically; the film goes dark exactly on the
// last pluck, where 09_credits (engine owner) takes over with the seal and the colophon.
import { calli, card, kf, ph, PALE, PALEC, smooth } from './_lib.js';

export const range = [189.86, 210.04];

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const S81 = bar(105), S82 = bar(107), S83 = bar(110), S84 = 201.6, END = 210.04;
  // 8.2 — the scroll that tore at stage separation (4.4, y = 560) is rejoined: the lower half rises back into place
  const JOIN = 1.5;
  const rise = (lt) => 1 - Math.pow(1 - smooth(0, JOIN, lt), 2.2);
  // two beats of the homecoming when delivered: (a) Jade squats low as M sprints in, (b) the impact — M bowls her over
  const split = X.has('K_8.2a') && X.has('K_8.2b'), home = split ? 'K_8.2a' : 'K_8.2', S82b = split ? 197.04 : S83;
  // generated take for 8.2b (media/gen/picks.json) — set when picked and prepped (tools/roto_prep.py); null = still.
  // (8.2a stays a still: its torn halves must stay pinned while they rejoin)
  const TAKE_82 = { b: 'take_2' };
  const homeKf = (o = {}) => kf(home, split ? { from: { x: 0.47, y: 0.52, zoom: 1.1 }, to: { x: 0.44, y: 0.5, zoom: 1.2 }, dolly: 0.05, par: [0.012, 0],
    masks: { base: [0.1, 0.5], polys: [{ pts: [[0.45, 0.35], [0.78, 0.35], [0.78, 1], [0.45, 1]], depth: 0.95, blur: 14 }, { pts: [[0.33, 0.3], [0.52, 0.3], [0.52, 0.9], [0.33, 0.9]], depth: 0.7, blur: 14 }] }, ...o }
    : { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.03 }, dolly: -0.05,
      masks: { base: [0.1, 0.5], polys: [{ pts: [[0.4, 0.3], [0.85, 0.3], [0.85, 1], [0.4, 1]], depth: 0.85, blur: 12 }] }, ...o });
  return [
    // 8.1 — the abrupt cut to black; then a capsule under parachutes over a silk-painted sea
    { id: '8.1', t0: S81, t1: S82, paper: 'silk', grain: 81,
      scene: [X.has('K_8.1') ? { type: 'roto', clip: 'K_8.1/take_1', paper: 'silk', offset: 0.3, lock: 0.8, from: { x: 0.5, y: 0.42, zoom: 1.14 }, to: { x: 0.5, y: 0.5, zoom: 1.04 } } : ph('Silence of black → the capsule under parachutes over a silk-painted sea', 'K_8.1')],
      post: (t, lt) => ({ fade: 1 - smooth(0.6, 1.8, lt), fadeColor: [0, 0, 0] }) },
    // 8.2 — Mid-Autumn, a year later, the Austin living room: M bowls Jade over. The torn halves of the scroll join.
    { id: '8.2', t0: S82, t1: S82b, paper: 'silk', grain: 82, focus: split ? [860, 520] : [1080, 640],
      scene: X.has(home) ? [
        homeKf({ key: 'top', tear: (t, lt) => (lt < JOIN + 0.6 ? [560, 0, 0, 1] : [0, 0, 0, 0]) }),
        homeKf({ key: 'low', tear: (t, lt) => [560, 430 * (1 - rise(lt)), 0.05 * (1 - rise(lt)), -1], opacity: (t, lt) => (lt < JOIN + 0.6 ? 1 : 0) }),
        homeKf({ key: 'whole', opacity: (t, lt) => smooth(JOIN + 0.05, JOIN + 0.6, lt) }),
      ] : [ph('Homecoming: M runs and bowls Jade over', 'K_8.2')],
      post: (t, lt) => ({ bump: 0.006 * Math.exp(-Math.max(0, lt - JOIN) / 0.15) * (lt >= JOIN ? 1 : 0) }) },
    // 8.2b — the impact, on the beat: everyone tumbles onto the rug
    ...(split ? [{ id: '8.2b', t0: S82b, t1: S83, paper: 'silk', grain: 85, focus: [1000, 680],
      scene: [TAKE_82.b ? { type: 'roto', clip: `K_8.2b/${TAKE_82.b}`, paper: 'silk', lock: 0.2, from: { x: 0.52, y: 0.56, zoom: 1.16 }, to: { x: 0.52, y: 0.54, zoom: 1.08 } } : kf('K_8.2b', { from: { x: 0.52, y: 0.56, zoom: 1.16 }, to: { x: 0.52, y: 0.54, zoom: 1.08 }, dolly: -0.04,
        masks: { base: [0.1, 0.5], polys: [{ pts: [[0.3, 0.45], [0.95, 0.45], [0.95, 1], [0.3, 1]], depth: 0.9, blur: 14 }] } })],
      post: (t, lt) => ({ bump: 0.012 * Math.exp(-lt / 0.12) }) }] : []),
    // 8.3 — the roof deck: toy Earth and toy Moon side by side on the parapet
    { id: '8.3', t0: S83, t1: S84, paper: 'silk', grain: 83,
      scene: [X.has('K_8.3') ? { type: 'roto', clip: 'K_8.3/take_3', paper: 'silk', offset: 0.4, lock: 0.4, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.53, y: 0.46, zoom: 1.12 } } : ph('The family on the roof deck; toy Earth and toy Moon on the parapet', 'K_8.3')] },
    // 8.4 — the solo hum: the Moon in the tea; the closing inscription; dark on the last pluck
    { id: '8.4', t0: S84, t1: END, paper: 'silk', grain: 84,
      scene: [X.has('K_8.4') ? kf('K_8.4', { from: { x: 0.43, y: 0.654, zoom: 1.48 }, to: { x: 0.56, y: 0.56, zoom: 1.2 }, dolly: 0.06, // opens on the Moon where 8.3 left it (match cut), tilts down to the Moon in the tea
       
        masks: { base: [0.0, 0.6], polys: [{ pts: [[0, 0.7], [1, 0.7], [1, 1], [0, 1]], depth: 0.95, blur: 10 }, { pts: [[0.12, 0.72], [0.26, 0.72], [0.26, 0.84], [0.12, 0.84]], water: 1, blur: 4 }] }, shimmer: 0.8, flicker: 0.5,
        mist: { color: [0.75, 0.75, 0.78], amount: 0.2, y0: 300, y1: 600, speed: 6 } }) : ph('The tea cup; the Moon in the tea', 'K_8.4')],
      type(ctx, t) { inscription(ctx, t, S84); },
      post: (t) => ({ fade: smooth(END - 1.1, END, t), fadeColor: [0.02, 0.02, 0.03] }) },
  ];
}

// 海上生明月，天涯共此时 — two vertical columns in the 留白 top-left, with the English beneath
function inscription(ctx, t, a) {
  calli(ctx, 'z84a', { text: '海上生明月，', size: 74, x: 380, y: 70, color: PALEC, seed: 81 }, t, a + 0.4, 2.6, 213, 'over');
  calli(ctx, 'z84b', { text: '天涯共此时', size: 74, x: 286, y: 70, color: PALEC, seed: 82 }, t, a + 2.9, 2.4, 213, 'over');
  card(ctx, 'e84', { lines: [[{ t: 'The bright moon rises over the sea;', font: 'CormorantItalic' }], [{ t: 'however far apart, we share this moment.', font: 'CormorantItalic' }]], size: 34, x: 440, y: 120, color: PALE }, t, a + 4.8, 213, 'over');
}
