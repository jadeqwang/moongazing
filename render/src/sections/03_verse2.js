// SECTION 3 · VERSE 2 — 46.82–76.11 (kit 47.14; strings 51; full band lift 61.65). Type grows: English lyrics at
// ~60–80 px, the Li Bai couplet as big calligraphy across the wall, HUD labels in the training montage.
import { lyricEN, lyricZH, calli, card, hud, kf, ph, bump, INK, INKC, PALE, PALEC, WHITE, smooth } from './_lib.js';

export const range = [46.82, 76.11];

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const W = (id, i) => L[id].words[i].start;
  const S31 = L.L05.start, S32 = L.L06.start, S33 = W('L06', 2), S34 = L.L07.start, S34b = W('L07', 3), S34c = W('L07', 5);
  const S35 = L.L08.start, S36 = bar(33), S37 = L.L09.start, S38 = bar(38, 2), HOOK = bar(41);
  const mid = { size: 66, font: 'Cormorant', tracking: 0.02 };
  const gloss = (ctx, t, a, b, color, y = 1046) => card(ctx, 'gloss07', { lines: [[{ t: 'I raise my cup to invite the bright Moon; with my shadow, we make three.', font: 'CormorantItalic' }]], size: 30, x: 960, y, align: 'center', color }, t, a, b, color === INK ? 'ink' : 'over');
  // the montage: one keyframe per beat
  const mont = [['K_3.6a', 'HUMAN CENTRIFUGE  ·  8 G'], ['K_3.6b', 'NEUTRAL BUOYANCY  ·  12 M'], ['K_3.6c', 'PARABOLIC FLIGHT  ·  0 G  ·  22 S'], ['K_3.6d', 'ICELAND  ·  BASALT FIELD'], ['J_3.6e', 'ORBITAL MECHANICS  ·  03:00']];
  const mt = [bar(33), bar(33, 2), bar(33, 3), bar(33, 4), bar(34), bar(34, 4)];
  const montage = mont.map(([img, label], i) => ({
    id: `3.6${'abcde'[i]}`, t0: mt[i], t1: mt[i + 1], paper: i === 4 ? 'xuan' : 'silk', grain: 360 + i, post: (t, lt) => bump(lt, 0.012),
    scene: [X.has(img) ? kf(img, { from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.5, y: 0.5, zoom: 1.16 }, dolly: 0.08 }) : ph(label, img)],
    type(ctx, t) {
      hud(ctx, label, 64, 72, { size: 15, rgb: '232,72,52', a: 0.95 }, 1);
      hud(ctx, `T−${String(14 - i).padStart(2, '0')} WEEKS`, 64, 98, { size: 13, rgb: '240,232,214' }, 1);
      lyricEN(ctx, L.L08, { ...mid, key: 'm', size: 74, x: 120, y: 980, color: PALE, breaks: [4], panel: 'dark', text: { 3: 'you —' } }, t, 'over');
    },
  }));
  return [
    // 3.1 — kit hits: the teahouse above the lake, the family at a square table, snow outside
    { id: '3.1', t0: S31, t1: S32, paper: 'silk', grain: 31,
      scene: [X.has('K_3.1') ? kf('K_3.1', { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.04 }, dolly: -0.04,
        masks: { base: [0.0, 0.6], polys: [{ pts: [[0.25, 0.3], [0.85, 0.3], [0.85, 1], [0.25, 1]], depth: 0.85, blur: 10 }] },
        mist: { color: [0.95, 0.94, 0.9], amount: 0.18, y0: 80, y1: 360, speed: 6 } }) : ph('Afternoon teahouse above the lake; the family at a square table; snow', 'K_3.1')],
      type(ctx, t) { lyricEN(ctx, L.L05, { ...mid, x: 960, y: 170, align: 'center', color: INK, panel: 'light' }, t); } },
    // 3.2 — snow melting in an iron kettle; a tangyuan bitten into a crescent (月缺)
    { id: '3.2', t0: S32, t1: S33, paper: 'silk', grain: 32,
      scene: [X.has('K_3.2') ? kf('K_3.2', { from: { x: 0.45, y: 0.55, zoom: 1.1 }, to: { x: 0.42, y: 0.58, zoom: 1.24 }, dolly: 0.1,
        masks: { base: [0.1, 0.8], polys: [{ pts: [[0.05, 0.2], [0.25, 0.2], [0.25, 0.6], [0.05, 0.6]], flutter: 0.6, blur: 20 }] }, flutter: [3, 1.2],
        mist: { color: [0.92, 0.9, 0.86], amount: 0.25, y0: 120, y1: 420, speed: 18 } }) : ph('Snow melting in an iron kettle; a tangyuan bitten into a crescent', 'K_3.2')],
      type(ctx, t) { lyricEN(ctx, L.L06, { ...mid, key: 'a', x: 110, y: 190, color: PALE, w1: 2, text: { 1: 'tea.' }, until: S33 + 0.1 }, t, 'over'); } },
    // 3.3 — "That line—": Jade's finger traces the inscription on the teahouse wall
    { id: '3.3', t0: S33, t1: S34, paper: 'silk', grain: 33, scene: [],
      type(ctx, t) {
        lyricEN(ctx, L.L06, { ...mid, key: 'b', size: 84, x: 150, y: 560, color: INK, w0: 2, italic: [0, 1], text: { 1: 'line—' } }, t);
        calli(ctx, 'wall33', { text: '举杯邀明月', size: 150, x: 1500, y: 90, color: INKC, seed: 33 }, t, S33 + 0.15, 1.7, S34 + 0.05);
        hud(ctx, '3.3  ·  STAND-IN — Jade’s finger traces the inscription on the teahouse wall', 48, 1036, { size: 12, color: 'rgba(32,30,30,0.6)', tracking: 0.12 });
      } },
    // 3.4 — LS2: the Copernican lesson. 举杯邀明月，对影成三人 across the wall, each character on its sung onset
    ...[['3.4a', S34, S34b, 'K_3.4_lesson'], ['3.4b', S34b, S34c, 'J_LS2'], ['3.4c', S34c, S35, 'K_3.4_wall']].map(([id, a, b, img], i) => ({
      id, t0: a, t1: b, paper: 'silk', grain: 340 + i,
      scene: [X.has(img) ? kf(img, { from: { x: 0.5, y: 0.52, zoom: 1.06 }, to: { x: 0.5, y: 0.5, zoom: 1.12 }, dolly: 0.06,
        masks: { base: [0.15, 0.6] } }) : ph('The Copernican lesson', img)],
      type(ctx, t) {
        lyricZH(ctx, L.L07, { size: 104, vertical: false, lead: 1.0, x: 300, y: 28, color: i === 0 ? PALEC : INKC, seed: 70, until: S35 + 0.05, wash: i === 0 ? 'dark' : 'light' }, t, i === 0 ? 'over' : 'ink');
        gloss(ctx, t, S34 + 0.6, S35 + 0.05, i === 1 ? INK : PALE);
      },
    })),
    // 3.5 — the letter: 八行笺 ruled letter paper; the 廣寒 station seal stamps her assignment on bar 32
    { id: '3.5', t0: S35, t1: S36, paper: 'silk', grain: 35,
      scene: [{ name: 'letter', params: {} }, { name: 'stamp', params: { stamp: { seal: 'seal_guanghan', x: 1430, y: 640, size: 200, tLand: bar(32), rot: -0.03 } } }],
      type(ctx, t) {
        hud(ctx, 'ASSIGNMENT  ·  GUANGHAN STATION  ·  LUNAR SOUTH POLE  ·  89.5° S', 1240, 880, { size: 14, rgb: '120,40,30', a: 0.9 }, smooth(bar(32) + 0.2, bar(32) + 0.6, t), 'ink');
        lyricEN(ctx, L.L08, { ...mid, size: 78, x: 140, y: 420, color: INK, breaks: [4], text: { 3: 'you —' }, until: S36 + 0.05 }, t);
      } },
    // 3.6 — BAND LIFT: training montage, one frame per beat
    ...montage,
    { id: '3.6f', t0: mt[5], t1: S37, paper: 'silk', grain: 366, post: (t, lt) => bump(lt, 0.012),
      scene: [ph('Wushu stance ≈ EVA posture (training)', 'K_3.6f')],
      type(ctx, t) { hud(ctx, 'WUSHU  ·  EVA POSTURE', 64, 72, { size: 15, rgb: '232,72,52', a: 0.95 }, 1, 'ink'); } },
    // 3.7 — last night home: Jade on M's bed holding T's toy Earth
    { id: '3.7', t0: S37, t1: S38, paper: 'silk', grain: 37,
      scene: [X.has('J_3.7') ? kf('J_3.7', { from: { x: 0.52, y: 0.5, zoom: 1.03 }, to: { x: 0.56, y: 0.48, zoom: 1.12 }, dolly: 0.06,
        masks: { base: [0.1, 0.4], polys: [{ pts: [[0.35, 0.05], [0.75, 0.05], [0.78, 1], [0.32, 1]], depth: 0.8, blur: 12 }, { pts: [[0.36, 0.05], [0.46, 0.05], [0.46, 0.55], [0.36, 0.55]], flutter: 0.3, blur: 10 }] },
        flutter: [1.2, 1.6], flicker: 0.5 }) : ph('Last night home: Jade tucks M in; T presses his toy Earth into her hands', 'J_3.7')],
      type(ctx, t) { lyricEN(ctx, L.L09, { ...mid, size: 80, x: 110, y: 480, color: INK, breaks: [2], hold: 1.6 }, t); } },
    // 3.8 — turnaround: suit-up, the harness clicks shut on 74.4, the photo of the kids on the panel
    { id: '3.8', t0: S38, t1: HOOK, paper: 'indigo', grain: 38,
      scene: [X.has('K_3.8') ? kf('K_3.8', { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.6, y: 0.42, zoom: 1.3 }, dolly: 0.06 }) : ph('Suit-up; the harness clicks shut; the kids’ photo on the panel', 'K_3.8')],
      type(ctx, t) {
        const T0 = 76.17, s = Math.max(0, T0 - t);
        hud(ctx, `T−00:00:${String(Math.floor(s)).padStart(2, '0')}.${String(Math.floor((s % 1) * 10))}`, 64, 1030, { size: 20, rgb: '255,255,255' }, 1);
        hud(ctx, 'HARNESS  ·  LOCKED', 64, 1000, { size: 14, rgb: '232,72,52', a: 0.95 }, smooth(74.4, 74.45, t));
      } },
  ];
}
