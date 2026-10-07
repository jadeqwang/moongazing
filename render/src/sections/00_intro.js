// SECTION 0 · COLD OPEN / INTRO A — 0.00–15.67 (docs/script.md §0). Owner: motion lead.
import { card, calli, bump, INK, PALE, INKC, PALEC, WHITE, smooth, easeInOutSine } from './_lib.js';

export const range = [0, 15.67];
export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const FIRST = 1.78, BOOM = 2.84, S03 = 5.86, S04 = bar(4), S05 = bar(5), S06 = 13.10;
  const LIFT = bar(8);
  const moonRiseCam = (t) => ({ zoom: 1 + 0.07 * easeInOutSine(t / S03), y: -8 * (t / S03) });
  const SHANGHAI = /shanghai|pudong|puxi/i.test(X.text('K_0.6'));
  return [
    // 0.1 — a drop of ink falls on xuan and blooms into a full Moon
    //       (its shadow gathers in the silence; it falls on the first sound and lands exactly on the 2.84 hit)
    { id: '0.1', t0: 0, t1: BOOM, paper: 'xuan', scene: 'inkmoon', params: { tFall: FIRST, tImpact: BOOM }, grain: 1, cam: moonRiseCam },
    // 0.2 — the bloom spreads with the pluck's decay, the maria drop in wet-in-wet, the real Moon resolves
    { id: '0.2', t0: BOOM, t1: S03, paper: 'xuan', scene: 'inkmoon', params: { tFall: FIRST, tImpact: BOOM, resolveAt: [4.25, 5.35] }, grain: 1, cam: moonRiseCam },

    // 0.3 — BOOM: Chang'e rises past the Moon (K_0.3)
    { id: '0.3', t0: S03, t1: S04, paper: 'silk', grain: 3, scene: 'plate',
      params: { img: 'K03', grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.49, y: 0.47, zoom: 1.10 }, par: [0.004, 0.05], dolly: 0.04,
        masks: { base: [0.15, 0.35], polys: [
          { pts: [[0.62, 0], [1, 0], [1, 0.62], [0.66, 0.62], [0.56, 0.45], [0.55, 0.2]], depth: 0.05, blur: 8 },
          { pts: [[0.40, 0.0], [0.56, 0.02], [0.50, 0.30], [0.44, 0.62], [0.36, 0.96], [0.08, 0.99], [0.16, 0.62], [0.26, 0.24]], depth: 0.8, blur: 7 },
          { pts: [[0.36, 0.35], [0.44, 0.55], [0.36, 0.99], [0.06, 0.99], [0.12, 0.62], [0.22, 0.42]], flutter: 0.9, blur: 14 },
          { pts: [[0.0, 0.78], [0.45, 0.78], [0.5, 1], [0, 1]], depth: 0.6, blur: 16 },
        ] },
        flutter: [5, 3.2], mist: { color: [0.86, 0.78, 0.6], amount: 0.28, y0: 760, y1: 1080, speed: 14 } },
      type(ctx, t) {
        calli(ctx, 'z03', { text: '嫦娥奔月', size: 150, x: 1848, y: 64, color: INKC, seed: 31 }, t, S03 + 0.1, 0.85, S04 - 0.02);
        card(ctx, 'c03', { lines: [[{ t: 'Long ago, the legend says,', font: 'CormorantItalic', size: 74 }], [{ t: 'Chang’e flew to the ' }, { t: 'Moon.', size: 134 }]],
          size: 104, x: 1840, y: 826, align: 'right', color: INK }, t, S03 + 0.3, S04 - 0.02);
      } },

    // 0.4 — she could never come home (K_0.4 plate + Earth on its own layer, drifting)
    { id: '0.4', t0: S04, t1: S05, paper: 'xuan', grain: 4, scene: 'plate',
      params: { img: 'K04', grade: 'native', from: { x: 0.52, y: 0.5, zoom: 1.03 }, to: { x: 0.5, y: 0.49, zoom: 1.09 }, par: [-0.014, 0.004], dolly: 0.05,
        over: { img: 'K04earth', from: [0.004, -0.004], to: [-0.006, 0.003] },
        masks: { base: [0.1, 0.35], polys: [
          { pts: [[0.64, 0], [1, 0], [1, 1], [0.52, 1], [0.6, 0.76], [0.7, 0.6], [0.65, 0.4]], depth: 0.65, blur: 10 },
          { pts: [[0.68, 0.62], [0.78, 0.6], [0.8, 0.78], [0.66, 0.8]], flutter: 0.6, blur: 10 },
        ] },
        flutter: [2.5, 2.5], mist: { color: [0.9, 0.9, 0.9], amount: 0.22, y0: 820, y1: 1080, speed: -10 } },
      type(ctx, t) {
        card(ctx, 'c04', { lines: ['Unable to return home.'], size: 78, tracking: 0.03, x: 120, y: 214, color: PALE, opacity: 0.92 }, t, S04 + 0.18, S05 - 0.02, 'over');
        calli(ctx, 'z04', { text: '回不了家', size: 64, x: 168, y: 278, color: PALEC, seed: 32, alpha: 0.72 }, t, S04 + 0.5, 0.7, S05 - 0.02, 'over');
      } },

    // 0.5 — every Mid-Autumn, a billion people… (K_0.5)
    { id: '0.5', t0: S05, t1: S06, paper: 'silk', grain: 5, scene: 'plate',
      params: { img: 'K05', grade: 'native', from: { x: 0.5, y: 0.52, zoom: 1.05 }, to: { x: 0.47, y: 0.5, zoom: 1.13 }, par: [-0.01, -0.006], dolly: 0.06,
        masks: { base: [0.0, 0.85], polys: [{ pts: [[0, 0], [1, 0], [1, 0.3], [0, 0.3]], depth: 0.0, blur: 20 }] },
        flicker: 0.9, mist: { color: [0.42, 0.48, 0.6], amount: 0.38, y0: 300, y1: 470, speed: 12 } },
      type(ctx, t) {
        // Li Bai, 静夜思 — traditionally dated 726 CE (开元十四年), Yangzhou
        card(ctx, 'c05', { lines: [[{ t: 'In 726, Li Bai looked up at the ' }, { t: 'Moon', size: 112 }], [{ t: 'and wrote about ' }, { t: 'missing home.', size: 112 }]],
          size: 86, x: 300, y: 120, color: PALE }, t, S05 + 0.25, S06 - 0.02, 'over');
        calli(ctx, 'z05', { text: '李白·静夜思', size: 50, vertical: false, lead: 1.0, x: 304, y: 292, color: PALEC, seed: 33, alpha: 0.85 }, t, S05 + 1.0, 0.8, S06 - 0.02, 'over');
      } },

    // 0.6 — the roof-deck shot. The keyframe is read live; if the new Shanghai/Pudong take has landed (K_0.6.txt says so)
    // use a generic city split (sky far, skyline mid, deck near, lights alive); else the Mei/mother split.
    SHANGHAI
      ? { id: '0.6', t0: S06, t1: LIFT, paper: 'silk', grain: 6, scene: 'plate',
        params: { img: 'K06', grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.6, y: 0.54, zoom: 1.2 }, par: [-0.016, 0.004], dolly: 0.09,
          masks: { base: [0.1, 0.5], polys: [
            { pts: [[0, 0], [1, 0], [1, 0.44], [0, 0.44]], depth: 0.0, blur: 24 },
            { pts: [[0.12, 0.6], [1, 0.6], [1, 0.79], [0.12, 0.79]], depth: 0.3, water: 1, blur: 8 },
            { pts: [[0, 0.74], [1, 0.74], [1, 1], [0, 1]], depth: 0.85, blur: 6 },
            { pts: [[0.63, 0.56], [0.81, 0.53], [0.83, 1], [0.62, 1]], depth: 0.95, blur: 5 },
            { pts: [[0, 0.12], [0.09, 0.12], [0.09, 1], [0, 1]], depth: 0.9, blur: 6 },
            { pts: [[0, 0.64], [0.21, 0.66], [0.22, 1], [0, 1]], depth: 0.97, flutter: 0.4, blur: 8 },
            { pts: [[0.68, 0.58], [0.75, 0.58], [0.75, 0.76], [0.68, 0.76]], flutter: 0.45, blur: 8 },
          ] },
          flutter: [2.0, 2.6], shimmer: 1.6, flicker: 1.0, mist: { color: [0.32, 0.38, 0.52], amount: 0.22, y0: 480, y1: 640, speed: 9 } } }
      : { id: '0.6', t0: S06, t1: LIFT, paper: 'silk', grain: 6, scene: 'plate',
      params: { img: 'K06', grade: 'native', from: { x: 0.56, y: 0.5, zoom: 1.04 }, to: { x: 0.66, y: 0.42, zoom: 1.24 }, par: [-0.012, 0.004], dolly: 0.08,
        masks: { base: [0.05, 0.5], polys: [
          { pts: [[0.77, 0.24], [0.88, 0.18], [0.96, 0.36], [1, 1], [0.64, 1], [0.64, 0.8], [0.77, 0.74]], depth: 0.9, blur: 6 },
          { pts: [[0.84, 0.22], [0.91, 0.22], [0.92, 0.62], [0.85, 0.62]], flutter: 0.5, blur: 10 },
          { pts: [[0.785, 0.3], [0.835, 0.3], [0.84, 0.45], [0.79, 0.45]], flutter: 0.4, blur: 8 },
          { pts: [[0.0, 0.42], [1, 0.42], [1, 0.52], [0, 0.52]], water: 1, blur: 10 },
        ] },
        flutter: [2.2, 2.8], shimmer: 1.4, flicker: 0.8, mist: { color: [0.36, 0.42, 0.55], amount: 0.3, y0: 380, y1: 560, speed: 10 } } },

  ];
}
