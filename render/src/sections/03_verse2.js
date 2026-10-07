// SECTION 3 · VERSE 2 — 46.82–76.11 (kit 47.14; strings 51; full band lift 61.65). Type grows: English lyrics at
// ~60–80 px, the Li Bai couplet as big calligraphy across the wall, HUD labels in the training montage.
import { lyricEN, lyricZH, calli, card, hud, kf, ph, bump, INK, INKC, PALE, PALEC, WHITE, smooth } from './_lib.js';
import { plateMap } from '../scenes/plate.js';

export const range = [46.82, 76.11];


// 3.6a — the human centrifuge as a RIGID rotation of the painted arm (K_3.6a split offline by
// scratchpad centrifuge.py into a clean floor plate + arm / gondola / hub sprites in keyframe px). The arm turns in the
// floor plane about the hub axis: in screen space that is M = T(p)·S(1,k)·R(θ)·S(1,1/k)·T(−p) (parallel oblique
// projection, rings are ellipses of ratio k), drawn with a short motion-blur shutter; the gondola rides the arm tip
// (translated, not rotated: it is a body of revolution); the hub is drawn on top.
const KW = 2752, KH = 1536, PIV = [1385, 1055], RK = 0.578, TIP = [2190, 719];
function centrifuge(t0, t1) {
  const view = { from: { x: 0.6, y: 0.47, zoom: 1.22 }, to: { x: 0.62, y: 0.46, zoom: 1.32 } };
  const P = { img: 'K_3.6a_floor', grade: 'native', ...view, par: [0, 0], dolly: 0 };
  const W0 = -0.09, OMEGA = 1.95, SHUTTER = 0.022, N = 10;           // rad, rad/s (≈19 rpm on screen), s
  const theta = (lt) => W0 + OMEGA * lt;
  const M = (th) => { const c = Math.cos(th), s = Math.sin(th);
    const a = c, b = -s / RK, d = RK * s, e = c;                         // S(1,k) R S(1,1/k)
    return [a, d, b, e, PIV[0] - a * PIV[0] - b * PIV[1], PIV[1] - d * PIV[0] - e * PIV[1]]; };   // canvas order a,b,c,d,e,f
  return {
    needs: ['K_3.6a_floor', 'K_3.6a_arm', 'K_3.6a_gondola', 'K_3.6a_hub'], focus: [1300, 420],
    scene: [{ name: 'plate', params: P }],
    spin(ctx, t, lt) {
      const map = plateMap(P, lt, t1 - t0, { width: KW, height: KH });
      const base = (g) => g.transform(map.a[0] / KW, 0, 0, map.a[1] / KH, map.b[0], map.b[1]);
      const blur = (img, place) => ctx.pipe.layer((g) => {
        if (!img) return;
        base(g); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 / N;
        for (let k = 0; k < N; k++) { g.save(); place(g, theta(lt - SHUTTER * k / (N - 1))); g.drawImage(img, 0, 0, KW, KH); g.restore(); }
      }, { mode: 'over', seed: 361 });
      blur(ctx.assets['K_3.6a_arm'], (g, th) => g.transform(...M(th)));
      blur(ctx.assets['K_3.6a_gondola'], (g, th) => { const m = M(th);
        g.translate(m[0] * TIP[0] + m[2] * TIP[1] + m[4] - TIP[0], m[1] * TIP[0] + m[3] * TIP[1] + m[5] - TIP[1]); });
      ctx.pipe.layer((g) => { const img = ctx.assets['K_3.6a_hub']; if (img) { base(g); g.drawImage(img, 0, 0, KW, KH); } }, { mode: 'over', seed: 362 });
    },
  };
}

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const W = (id, i) => L[id].words[i].start;
  const S31 = L.L05.start, S32 = L.L06.start, S33 = W('L06', 2), S34 = L.L07.start, S34b = W('L07', 3), S34c = W('L07', 5);
  const S35 = L.L08.start, S36 = bar(33), S37 = L.L09.start, S38 = bar(38, 2), HOOK = bar(41);
  const mid = { size: 66, font: 'Cormorant', tracking: 0.02 };
  const gloss = (ctx, t, a, b, color, y = 1046) => card(ctx, 'gloss07', { lines: [[{ t: 'I raise my cup to invite the bright Moon; with my shadow, we make three.', font: 'CormorantItalic' }]], size: 30, x: 960, y, align: 'center', color }, t, a, b, color === INK ? 'ink' : 'over');
  // the montage: one drawing per beat. Each training shot is a redrawn motion base (roto) on its own paper; the
  // centrifuge is a JS rigid rotation of the painted arm (the generated spin loses the gondola).
  const HAS_F = X.has('K_3.6f');
  const mt = [bar(33), bar(33, 2), bar(33, 3), bar(33, 4), bar(34), HAS_F ? bar(34, 4) : S37];
  const mont = [
    ['K_3.6a', 'HUMAN CENTRIFUGE  ·  8 G', null],
    ['K_3.6b', 'NEUTRAL BUOYANCY  ·  12 M', { type: 'roto', clip: 'K_3.6b/take_6', paper: 'silk', offset: 0.5, lock: 0.12, from: { x: 0.4, y: 0.5, zoom: 1.3 }, to: { x: 0.39, y: 0.49, zoom: 1.38 } }],
    ['K_3.6c', 'PARABOLIC FLIGHT  ·  0 G  ·  22 S', { type: 'roto', clip: 'K_3.6c/take_4', paper: 'silk', offset: 0.35, lock: 0.12, from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.5, y: 0.5, zoom: 1.12 } }],
    // the hammer is up at the cut and strikes two frames in (take frame 12); chips fly through the beat
    ['K_3.6d', 'ICELAND  ·  BASALT FIELD', { type: 'roto', clip: 'K_3.6d/take_2', paper: 'silk', offset: 0.42, lock: 0.0, from: { x: 0.55, y: 0.48, zoom: 1.12 }, to: { x: 0.56, y: 0.48, zoom: 1.18 } }],
    ['J_3.6e', 'ORBITAL MECHANICS  ·  03:00', { type: 'roto', clip: 'J_3.6e/take_2', paper: 'ink', offset: 0.0, lock: 0.3, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.5, y: 0.5, zoom: 1.12 } }],
  ];
  const montage = mont.map(([img, label, roto], i) => ({
    id: `3.6${'abcde'[i]}`, t0: mt[i], t1: mt[i + 1], paper: i === 4 ? 'xuan' : 'silk', grain: 360 + i, post: (t, lt) => bump(lt, 0.012),
    ...(i === 0 ? centrifuge(mt[0], mt[1]) : { scene: [roto] }),
    type(ctx, t, lt) {
      if (i === 0) this.spin(ctx, t, lt);
      hud(ctx, label, 64, 72, { size: 15, rgb: '232,72,52', a: 0.95 }, 1);
      hud(ctx, `T−${String(14 - i).padStart(2, '0')} WEEKS`, 64, 98, { size: 13, rgb: i === 4 ? '30,30,34' : '240,232,214' }, 1);
      if (i === 4) lyricEN(ctx, L.L08, { ...mid, key: 'm', size: 74, x: 1840, y: 860, align: 'right', color: INK, breaks: [4], text: { 3: 'you —' } }, t);   // in the wash, clear of her
      else lyricEN(ctx, L.L08, { ...mid, key: 'm', size: 74, x: 120, y: 980, color: PALE, breaks: [4], panel: 'dark', text: { 3: 'you —' } }, t, 'over');
    },
  }));
  return [
    // 3.1 — kit hits: the teahouse table, three generations (Jade, her mother, M), snow outside
    { id: '3.1', t0: S31, t1: S32, paper: 'silk', grain: 31, focus: [1000, 640],
      // J_3.1: Jade, her mother and M at a Hangzhou teahouse table, blossoms, silk lanterns, snow outside (K_3.1 until
      // it lands); continues 2.5's pull-back from behind the opened lattice doors
      scene: [X.pick('J_3.1') ? { type: 'roto', clip: X.pick('J_3.1').clip, paper: 'silk', offset: 0.2, lock: 0.3, from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.04 } }
        : X.has('J_3.1') ? kf('J_3.1', { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.04 }, par: [0, 0], dolly: -0.04, masks: { base: [0.0, 0.6] } })
        : X.has('K_3.1') ? kf('K_3.1', { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.04 }, par: [0, 0], dolly: -0.04,
          masks: { base: [0.0, 0.6], polys: [{ pts: [[0.25, 0.3], [0.85, 0.3], [0.85, 1], [0.25, 1]], depth: 0.85, blur: 10 }] },
          mist: { color: [0.95, 0.94, 0.9], amount: 0.18, y0: 80, y1: 360, speed: 6 } }) : ph('Afternoon teahouse; Jade, her mother and M at the table; snow', 'J_3.1')],
      type(ctx, t) { lyricEN(ctx, L.L05, { ...mid, x: 80, y: 600, breaks: X.has('J_3.1') ? [2, 3] : [], color: INK, ...(X.has('J_3.1') ? {} : { x: 960, y: 170, align: 'center', panel: 'light' }) }, t); } },   // J_3.1: on the plain wall, left of the family
    // 3.2 — a tangyuan bitten into a crescent (月缺) on the same table: J_3.2 (macro still, slow push) when it lands;
    //       until then K_3.2/take_2 (Seedance: the chopsticks lift the bitten crescent out of the bowl)
    { id: '3.2', t0: S32, t1: S33, paper: 'silk', grain: 32,
      scene: [X.pick('J_3.2') ? { type: 'roto', clip: X.pick('J_3.2').clip, paper: 'silk', offset: 0.3, lock: 0.25, from: { x: 0.5, y: 0.52, zoom: 1.06 }, to: { x: 0.49, y: 0.5, zoom: 1.16 } }
        : X.has('J_3.2') ? kf('J_3.2', { from: { x: 0.5, y: 0.52, zoom: 1.06 }, to: { x: 0.49, y: 0.5, zoom: 1.16 }, dolly: 0.08, masks: { base: [0.1, 0.7] } })
        : { type: 'roto', clip: 'K_3.2/take_2', paper: 'silk', offset: 1.7, lock: 0.0, from: { x: 0.45, y: 0.52, zoom: 1.08 }, to: { x: 0.43, y: 0.5, zoom: 1.18 } }],
      // the lyric sits low on the dark table, under the bowl
      type(ctx, t) { lyricEN(ctx, L.L06, { ...mid, key: 'a', x: 1860, y: 1030, align: 'right', color: PALE, panel: 'dark', w1: 2, text: { 1: 'tea.' }, until: S33 + 0.1 }, t, 'over'); } },
    // 3.3 — "That line—": Jade's finger traces the inscription on the teahouse wall
    { id: '3.3', t0: S33, t1: S34, paper: 'silk', grain: 33, focus: [1210, 420], needs: ['K_3.3_hand'], scene: [{ name: 'wallcalli', params: { a: S33 + 0.1, b: S34 - 0.15 } }],
      type(ctx, t) { lyricEN(ctx, L.L06, { ...mid, key: 'b', size: 60, x: 150, y: 900, color: INK, w0: 2, italic: [0, 1], text: { 1: 'line—' } }, t); } },
    // 3.4 — the Copernican lesson. 举杯邀 = the wide (K_3.4_lesson/take_4: the beam steadies, the eclipse shadow on the
    //       wall); 明月 = LS2 (J_LS2 / Seedance take_7 redrawn on silk, her mouth drawn from the vocal stem, sync from
    //       media/gen/LS2/sync.json, take_11 lag −0.071); 对影成三人 = the three shadows on the wall (K_3.4_wall). The calligraphy crosses
    //       the wall above their heads, each character on its sung onset.
    ...[['3.4a', S34, S34b], ['3.4b', S34b, S34c], ['3.4c', S34c, S35]].map(([id, a, b], j) => ({
      id, t0: a, t1: b, paper: 'silk', grain: 340 + j, ...(j === 1 ? { focus: [1260, 380] } : {}),
      scene: [j === 0 ? { type: 'roto', clip: 'K_3.4_lesson/take_4', paper: 'silk', offset: 0.9, lock: 0.0, from: { x: 0.5, y: 0.52, zoom: 1.06 }, to: { x: 0.5, y: 0.5, zoom: 1.1 } }
        : j === 1 ? { type: 'roto', clip: 'LS2/take_11', paper: 'silk', ref_t0: 53.79, lag: -0.071, lock: 0.0, from: { x: 0.5, y: 0.5, zoom: 1.08 }, to: { x: 0.52, y: 0.48, zoom: 1.13 } }
          : X.has('K_3.4_wall') ? kf('K_3.4_wall', { from: { x: 0.5, y: 0.52, zoom: 1.06 }, to: { x: 0.5, y: 0.5, zoom: 1.12 }, dolly: 0.06, masks: { base: [0.15, 0.6] } }) : ph('The shadows on the wall', 'K_3.4_wall')],
      type(ctx, t) {
        // plain wall above them: no wash (it would haze her hair in LS2); pale on the dim living-room wall in the wide
        lyricZH(ctx, L.L07, { size: 104, vertical: false, lead: 1.0, x: 300, y: 28, color: j === 0 ? PALEC : INKC, seed: 70, until: S35 + 0.05 }, t, j === 0 ? 'over' : 'ink');
        gloss(ctx, t, S34 + 0.6, S35 + 0.05, j === 1 ? INK : PALE);
      },
    })),
    // 3.5 — the letter: 八行笺 ruled letter paper; the 廣寒 station seal stamps her assignment on bar 32
    { id: '3.5', t0: S35, t1: S36, paper: 'silk', grain: 35, focus: [1310, 640], needs: ['emblem_final', 'K04earth', 'K_3.5_hands'],
      scene: [{ name: 'assignment', params: { tLand: bar(32) } }],
      type(ctx, t) { lyricEN(ctx, L.L08, { ...mid, size: 64, x: 110, y: 200, color: PALE, breaks: [4], text: { 3: 'you —' }, until: S36 + 0.05 }, t, 'over'); } },
    // 3.6 — BAND LIFT: training montage, one frame per beat
    ...montage,
    ...(HAS_F ? [{ id: '3.6f', t0: mt[5], t1: S37, paper: 'silk', grain: 366, post: (t, lt) => bump(lt, 0.012),
      scene: [kf('K_3.6f', { from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.5, y: 0.5, zoom: 1.16 }, dolly: 0.08 })],
      type(ctx, t) { hud(ctx, 'WUSHU  ·  EVA POSTURE', 64, 72, { size: 15, rgb: '232,72,52', a: 0.95 }, 1, 'ink'); } }] : []),
    // 3.7 — the last evening before quarantine: Jade holds M; both look down at a glowing relief of the Earth
    //       (J_3.7, then J_3.7_close on bar 37 when it lands). The lyric stays in the left third.
    ...[['3.7', S37, X.has('J_3.7_close') ? bar(37) : S38, 'J_3.7'], ...(X.has('J_3.7_close') ? [['3.7b', bar(37), S38, 'J_3.7_close']] : [])].map(([id, a, b, img], i) => ({
      id, t0: a, t1: b, paper: 'silk', grain: 37 + i * 100,
      // J_3.7/take_6 (M reaches to the glowing Earth, Jade tilts her head) then J_3.7_close/take_4, redrawn on silk
      scene: [X.pick(img) ? { type: 'roto', clip: X.pick(img).clip, paper: 'silk', offset: i === 0 ? 0.6 : 1.0, lock: 0.3,
        from: { x: 0.52, y: 0.5, zoom: 1.03 }, to: { x: 0.56, y: 0.48, zoom: 1.12 } }
        : X.has(img) ? kf(img, { from: { x: 0.52, y: 0.5, zoom: 1.03 }, to: { x: 0.56, y: 0.48, zoom: 1.12 }, dolly: 0.06, masks: { base: [0.1, 0.5] } }) : ph('Jade holds M; both look down at a glowing relief of the Earth', img)],
      type(ctx, t) { lyricEN(ctx, L.L09, { ...mid, size: 80, x: 110, y: 480, color: PALE, breaks: [2], hold: 1.6 }, t, 'over'); },   // pale on the dark museum wall
    })),
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
