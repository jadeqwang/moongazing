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
  // rev Oct 7 (glitch sweep, P0): the reunion is one continuous take, K_8.2a/take_5 (picks.json): 8.2 is the run-in and
  // the hug (clip 0.5–4.13 s) with the torn halves rejoining over the moving picture (roto `tear`), 8.2b is the same hug
  // closer (clip 4.13–5.96 s). No still plates, no pose reset. Without the pick the old still/plate path below is used.
  const REUNION = split && X.pick('K_8.2a');
  // with the take the halves meet on bar 107 beat 4 (1.33 s in), where the torn rim is dropped and the paper bumps
  const JOINR = bar(107, 4) - S82, riseR = (lt) => 1 - Math.pow(1 - smooth(0, JOINR + 0.22, lt), 2.2);
  const hug = (o = {}) => ({ type: 'roto', clip: REUNION.clip, paper: 'silk', lock: 0, subject: false, maskGain: 8, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.35 }, ...o });
  const homeKf = (o = {}) => kf(home, split ? { from: { x: 0.47, y: 0.52, zoom: 1.1 }, to: { x: 0.44, y: 0.5, zoom: 1.2 }, dolly: 0.05, par: [0.012, 0],
    masks: { base: [0.1, 0.5], polys: [{ pts: [[0.45, 0.35], [0.78, 0.35], [0.78, 1], [0.45, 1]], depth: 0.95, blur: 14 }, { pts: [[0.33, 0.3], [0.52, 0.3], [0.52, 0.9], [0.33, 0.9]], depth: 0.7, blur: 14 }] }, ...o }
    : { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.03 }, dolly: -0.05,
      masks: { base: [0.1, 0.5], polys: [{ pts: [[0.4, 0.3], [0.85, 0.3], [0.85, 1], [0.4, 1]], depth: 0.85, blur: 12 }] }, ...o });
  return [
    // 8.1 — the abrupt cut to black; then a capsule under parachutes over a silk-painted sea
    { id: '8.1', t0: S81, t1: S82, paper: 'silk', grain: 81,
      scene: [X.has('K_8.1') ? { type: 'roto', clip: 'K_8.1/take_1', paper: 'silk', offset: 0.55, lock: 0, subject: false, maskGain: 8, from: { x: 0.5, y: 0.42, zoom: 1.14 }, to: { x: 0.5, y: 0.5, zoom: 1.04 } } : ph('Silence of black → the capsule under parachutes over a silk-painted sea', 'K_8.1')],
      post: (t, lt) => ({ fade: 1 - smooth(0.6, 1.8, lt), fadeColor: [0, 0, 0] }) },
    // 8.2 — Mid-Autumn, a year later, the Austin living room: M bowls Jade over. The torn halves of the scroll join.
    { id: '8.2', t0: S82, t1: S82b, paper: 'silk', grain: 82, focus: REUNION ? [1040, 600] : split ? [860, 520] : [1080, 640],
      scene: REUNION ? [
        hug({ offset: 0.5, from: { x: 0.5, y: 0.5, zoom: 1.0 }, to: { x: 0.66, y: 0.57, zoom: 1.5 }, tear: (t, lt) => (lt < JOINR ? [560, 0, 0, 1] : [0, 0, 0, 0]) }),
        hug({ offset: 0.5, from: { x: 0.5, y: 0.5, zoom: 1.0 }, to: { x: 0.66, y: 0.57, zoom: 1.5 }, tear: (t, lt) => (lt < JOINR ? [560, 430 * (1 - riseR(lt)), 0.05 * (1 - riseR(lt)), -1] : [0, 0, 0, 0]) }),
      ] : X.has(home) ? [
        homeKf({ key: 'top', tear: (t, lt) => (lt < JOIN + 0.6 ? [560, 0, 0, 1] : [0, 0, 0, 0]) }),
        homeKf({ key: 'low', tear: (t, lt) => [560, 430 * (1 - rise(lt)), 0.05 * (1 - rise(lt)), -1], opacity: (t, lt) => (lt < JOIN + 0.6 ? 1 : 0) }),
        homeKf({ key: 'whole', opacity: (t, lt) => smooth(JOIN + 0.05, JOIN + 0.6, lt) }),
      ] : [ph('Homecoming: M runs and bowls Jade over', 'K_8.2')],
      post: (t, lt) => { const J = REUNION ? JOINR : JOIN; return { bump: 0.006 * Math.exp(-Math.max(0, lt - J) / 0.15) * (lt >= J ? 1 : 0) }; } },
    // 8.2b — the impact, on the beat: everyone tumbles onto the rug
    ...(split ? [{ id: '8.2b', t0: S82b, t1: S83, paper: 'silk', grain: 85, focus: [1000, 680],
      // the roto take smears arms and torsos together at the moment of contact (≈197.9–198.6): on the bar-109 beat 3
      // (197.95) cut to the painted K_8.2b still and hold it through the impact to the 8.3 cut (a cross-fade ghosts:
      // the take has moved away from the still's pose by then)
      scene: REUNION ? [hug({ offset: 0.5 + (S82b - S82), from: { x: 0.55, y: 0.58, zoom: 1.9 }, to: { x: 0.55, y: 0.58, zoom: 2.0 }, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.22 } })]
        : [...(TAKE_82.b ? [{ type: 'roto', clip: `K_8.2b/${TAKE_82.b}`, paper: 'silk', lock: 0.2, from: { x: 0.52, y: 0.56, zoom: 1.16 }, to: { x: 0.52, y: 0.54, zoom: 1.08 } },
        { name: 'plate', params: { img: 'K_8.2b', grade: 'native', from: { x: 0.52, y: 0.56, zoom: 1.16 }, to: { x: 0.52, y: 0.54, zoom: 1.08 }, opacity: (t) => (t >= B.bar(109, 3) ? 1 : 0) } }] : []),
        ...(TAKE_82.b ? [] : [kf('K_8.2b', { from: { x: 0.52, y: 0.56, zoom: 1.16 }, to: { x: 0.52, y: 0.54, zoom: 1.08 }, dolly: -0.04,
        masks: { base: [0.1, 0.5], polys: [{ pts: [[0.3, 0.45], [0.95, 0.45], [0.95, 1], [0.3, 1]], depth: 0.9, blur: 14 }] } })])],
      post: (t, lt) => ({ bump: (REUNION ? 0.005 : 0.012) * Math.exp(-lt / 0.12) }) }] : []),
    // 8.3 — the roof deck: toy Earth and toy Moon side by side on the parapet
    { id: '8.3', t0: S83, t1: S84, paper: 'silk', grain: 83,
      // K_8.3/take_4 (h3, rev Oct 7): everyone stays back to camera (take_3 turned Jade to a blank profile); all four move
      scene: [X.has('K_8.3') ? { type: 'roto', clip: 'K_8.3/take_4', paper: 'silk', offset: 0.6, lock: 0, subject: false, maskGain: 8, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.53, y: 0.46, zoom: 1.12 } } : ph('The family on the roof deck; toy Earth and toy Moon on the parapet', 'K_8.3')] },
    // 8.4 — the solo hum: the Moon in the tea; the closing inscription; dark on the last pluck
    { id: '8.4', t0: S84, t1: END, paper: 'silk', grain: 84,
      scene: [X.has('K_8.4') ? kf('K_8.4', { from: { x: 0.43, y: 0.654, zoom: 1.48 }, to: { x: 0.56, y: 0.56, zoom: 1.2 }, dolly: 0.06, // opens on the Moon where 8.3 left it (match cut), tilts down to the Moon in the tea
       
        masks: { base: [0.0, 0.6], polys: [{ pts: [[0, 0.7], [1, 0.7], [1, 1], [0, 1]], depth: 0.95, blur: 10 }, { pts: [[0.542, 0.819], [0.564, 0.809], [0.625, 0.804], [0.686, 0.815], [0.703, 0.834], [0.681, 0.850], [0.625, 0.856], [0.565, 0.847]], water: 1, blur: 3 }] }, shimmer: 0.6, flicker: 0 }) : ph('The tea cup; the Moon in the tea', 'K_8.4')],
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
