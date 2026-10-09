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
  // rev3 (Jade, Oct 8: keep Kenton in the picture, moving; the rejoining tear off the children's faces; a proper close
  // painting of the hug instead of the punch-in). The take is K_8.2a/take_9: M runs into her arms (clip 0-0.4 s), T kneels
  // in (to 1.2 s), Kenton lowers his hand, walks in from the doorway and kneels at the near edge with his back to us, one
  // hand on T's back (4.2 s).
  //  - T82: the take's clock. The model draws this take on twos (frames 2j and 2j+1 are one drawing), so only whole
  //    rates step evenly: 1x from frame 2 through the run-in and T's kneel (M's run is over by 0.4 s and the take moves
  //    from its first frame, so the usual half-second offset would cut it), 2x for fourteen film frames from the join
  //    (frames 34-62: the hug has settled, Kenton takes his first steps far left), then 1x again, so that he has knelt
  //    when the shot ends on frame 102, the frame K_8.2b_close.jpg was painted from.
  //  - V82: a gentle push that keeps him in frame to the end (the old push to 1.5 left him at 194.9 s).
  //  - TEAR82: the seam lies at design y 790 (it was 560, which ran through M's forehead and T's chin). Its torn edge
  //    wanders +-52 px, so it stays within y 738..842: floor, the bag and shoes, legs and Jade's back. The children's
  //    faces never come below y 600 before the halves join (checked in every frame, docs/reviews/rev3_home_report.md).
  const T82 = (lt) => { const k = lt * 24; return (k < 32 ? 2 + k : k < 46 ? 34 + 2 * (k - 32) : 62 + (k - 46)) / 24; };
  const V82 = { from: { x: 0.5, y: 0.5, zoom: 1.0 }, to: { x: 0.51, y: 0.57, zoom: 1.28 } };
  const TEAR82 = 790, DROP82 = 200;
  // 8.2b: its own painting (the take's frame at the cut, restored at full size) and its own take. That take is drawn
  // on threes by the model (frames 3j..3j+2 are one drawing): rate 1.5 from frame 13 shows each drawing for two film frames
  const CLOSE = REUNION && X.has('K_8.2b_close') ? X.pick('K_8.2b_close') : null;
  const V82b = { from: { x: 0.5, y: 0.5, zoom: 1.03 }, to: { x: 0.49, y: 0.5, zoom: 1.09 } };
  // rev4 (Jade, Oct 8 night, on the reunion card: ticked "Kenton wraps both arms round all three"). When the picked take
  // is K_8.2a/take_8 the reunion is THE WRAP: he walks in, bends to them (his hand lands on Jade's back, clip frame 84-86),
  // kneels behind T and folds his arm across T and Jade, his hand on her hair (frame 96-100). With take_9 picked
  // everything below is the one-hand version exactly as in cut v6 (T82, V82, the cut on bar 109, K_8.2b_close).
  //  - the take plays at 1x from frame 2 for the whole shot (plain offset: the engine holds the take's own drawings, the
  //    even frames, two film frames each). No doubled stretch: in take_9 his first steps ran at 2x.
  //  - CUT82: he needs 98 frames to be down with his arm round them, so the cut to the close moves one beat later, to
  //    bar 109 beat 2. His hand reaches them on the bar-109 downbeat; the close begins a beat after it (33 frames).
  //  - V82w: a gentler push (1.18, not 1.28): at the end his head and knot are inside the frame top.
  //  - the tear is the same (y 790, joined on bar 107 beat 4); checked on this take's frames, docs/reviews/rev4_home_report.md.
  //  - 8.2b: K_8.2b_wrap, the take's frame at the cut (frame 100) restored at full size, and its own take
  //    (K_8.2b_wrap/take_1: he draws them in and lowers his head onto T's). That take is drawn on twos and is nearly
  //    still for its first 8 frames: 1x from frame 10, where it starts to move.
  //  - take_10 (ALTERNATIVE, not the pick: he hurries in with both arms open, but his face is in profile for a second,
  //    clip frames 50-70) is down by frame 84, so its cut stays on bar 109. Its close is K_8.2b_wrap10 (its frame 90,
  //    restored) with its own take, drawn on threes: 1.5x from frame 3 shows each drawing for two film frames.
  //  - view: the close drifts off his back, toward the children's faces.
  const WRAPS = {
    take_8: { cut: bar(109, 2), close: 'K_8.2b_wrap', clock: { offset: 10 / 24 }, punch: [0.53, 0.475],
      view: { from: { x: 0.53, y: 0.51, zoom: 1.06 }, to: { x: 0.55, y: 0.52, zoom: 1.12 } } },
    take_10: { cut: S82b, close: 'K_8.2b_wrap10', clock: { offset: 3 / 24, rate: 1.5 }, punch: [0.555, 0.47],
      view: { from: { x: 0.52, y: 0.52, zoom: 1.05 }, to: { x: 0.54, y: 0.54, zoom: 1.12 } } },
  };
  const WRAP = (REUNION && WRAPS[REUNION.take]) || null;
  const CUT82 = WRAP ? WRAP.cut : S82b;
  const V82w = { from: { x: 0.5, y: 0.5, zoom: 1.0 }, to: { x: 0.5, y: 0.57, zoom: 1.18 } };
  const clock82 = WRAP ? { offset: 2 / 24, ...V82w } : { time: T82, ...V82 };
  const CLOSEW = WRAP && X.has(WRAP.close) ? X.pick(WRAP.close) : null;
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
    { id: '8.2', t0: S82, t1: CUT82, paper: 'silk', grain: 82, focus: REUNION ? [1110, 500] : split ? [860, 520] : [1080, 640],
      scene: REUNION ? [
        hug({ ...clock82, tear: (t, lt) => (lt < JOINR ? [TEAR82, 0, 0, 1] : [0, 0, 0, 0]) }),
        hug({ ...clock82, tear: (t, lt) => (lt < JOINR ? [TEAR82, DROP82 * (1 - riseR(lt)), 0.05 * (1 - riseR(lt)), -1] : [0, 0, 0, 0]) }),
      ] : X.has(home) ? [
        homeKf({ key: 'top', tear: (t, lt) => (lt < JOIN + 0.6 ? [560, 0, 0, 1] : [0, 0, 0, 0]) }),
        homeKf({ key: 'low', tear: (t, lt) => [560, 430 * (1 - rise(lt)), 0.05 * (1 - rise(lt)), -1], opacity: (t, lt) => (lt < JOIN + 0.6 ? 1 : 0) }),
        homeKf({ key: 'whole', opacity: (t, lt) => smooth(JOIN + 0.05, JOIN + 0.6, lt) }),
      ] : [ph('Homecoming: M runs and bowls Jade over', 'K_8.2')],
      post: (t, lt) => { const J = REUNION ? JOINR : JOIN; return { bump: 0.006 * Math.exp(-Math.max(0, lt - J) / 0.15) * (lt >= J ? 1 : 0) }; } },
    // 8.2b — the impact, on the beat: everyone tumbles onto the rug
    //        (rev3: with the reunion take this is the close painting K_8.2b_close and its own take, or that painting as a
    //        still until the take is prepped; the punch-in on the wide take is only the last fallback)
    //        (rev4: with a wrap take, WRAP, it is that take's close painting and its own take, from WRAP.cut)
    ...(split ? [{ id: '8.2b', t0: CUT82, t1: S83, paper: 'silk', grain: 85, focus: WRAP ? [1010, 600] : REUNION ? [800, 520] : [1000, 680],
      // the roto take smears arms and torsos together at the moment of contact (≈197.9–198.6): on the bar-109 beat 3
      // (197.95) cut to the painted K_8.2b still and hold it through the impact to the 8.3 cut (a cross-fade ghosts:
      // the take has moved away from the still's pose by then)
      scene: CLOSEW ? [{ type: 'roto', clip: CLOSEW.clip, paper: 'silk', ...WRAP.clock, lock: 0, subject: false, maskGain: 8, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.3 }, ...WRAP.view }]
        : WRAP && X.has(WRAP.close) ? [kf(WRAP.close, { ...WRAP.view, par: [0, 0], dolly: 0.02 })]
        : WRAP ? [hug({ offset: (2 + Math.round((CUT82 - S82) * 24)) / 24, from: { x: WRAP.punch[0], y: WRAP.punch[1], zoom: 1.8 }, to: { x: WRAP.punch[0], y: WRAP.punch[1], zoom: 1.88 }, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.22 } })]
        : CLOSE ? [{ type: 'roto', clip: CLOSE.clip, paper: 'silk', offset: 13 / 24, rate: 1.5, lock: 0, subject: false, maskGain: 8, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.3 }, ...V82b }]
        : REUNION && X.has('K_8.2b_close') ? [kf('K_8.2b_close', { ...V82b, par: [0, 0], dolly: 0.02 })]
        : REUNION ? [hug({ time: (lt) => T82(S82b - S82) + lt, from: { x: 0.588, y: 0.515, zoom: 2.3 }, to: { x: 0.588, y: 0.515, zoom: 2.4 }, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.22 } })]
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
