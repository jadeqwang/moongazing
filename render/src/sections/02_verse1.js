// SECTION 2 · VERSE 1 — 32.42–46.82 (guzheng + voice, no drums). "Inscription" mode: the English lyric is set small
// in the painting's 留白, word by word on the sung onsets; a short Chinese inscription stands vertical, top-right,
// with the 望月 seal — the way a painter titles a leaf.
import { lyricEN, calli, kf, ph, INK, INKC, PALE, PALEC, smooth } from './_lib.js';

export const range = [32.42, 46.82];

// small vertical inscription + seal, brushed in from a
function inscription(ctx, key, text, x, y, t, a, b, o = {}) {
  calli(ctx, key, { text, size: o.size || 46, x, y, color: o.color || INKC, seed: 50 + text.length, alpha: 0.88 }, t, a, 0.9, b, o.mode || 'ink');
  const n = [...text].length;
  const sy = y + n * (o.size || 46) * 1.02 + 22;
  ctx.pipe.layer((g) => {
    const img = ctx.assets.seal_wangyue; if (!img) return;
    const s = 38, al = smooth(a + 1.0, a + 1.12, t) * (1 - smooth(b - 0.3, b, t));
    g.globalAlpha = al; g.drawImage(img, x - (o.size || 46) / 2 - s / 2, sy, s, s * img.height / img.width);
  }, { mode: 'ink', absorb: 0.5, seed: 51 });
}

export default function shots(B, X, L) {
  const S21 = B.bar(17), S22 = L.L02.start, S23 = L.L03.start, S24 = L.L04.start, S25 = B.bar(24), S31 = L.L05.start;
  const small = { size: 40, font: 'Cormorant', tracking: 0.03, hold: 0.9 };
  return [
    // 2.1 — West Lake in winter, the Broken Bridge; the camera travels right→left along the scroll
    { id: '2.1', t0: S21, t1: S22, paper: 'silk', grain: 21,
      scene: [X.has('K_2.1') ? kf('K_2.1', { from: { x: 0.62, y: 0.52, zoom: 1.22 }, to: { x: 0.42, y: 0.52, zoom: 1.24 }, par: [-0.02, 0], dolly: 0.03, ease: 'linear',
        masks: { base: [0.0, 0.7], polys: [{ pts: [[0, 0.42], [1, 0.42], [1, 0.8], [0, 0.8]], water: 1, blur: 10 }] }, shimmer: 1.0,
        mist: { color: [0.86, 0.84, 0.78], amount: 0.3, y0: 260, y1: 440, speed: -10 } }) : ph('West Lake in winter, the Broken Bridge under thin snow', 'K_2.1')],
      type(ctx, t) {
        lyricEN(ctx, L.L01, { ...small, x: 120, y: 150, color: INK }, t);
        inscription(ctx, 'ins21', '断桥残雪', 1842, 70, t, S21 + 0.4, S22 - 0.05);
      } },
    // 2.2 — willow switches hanging plain and straight → M's dance ribbons; Jade's hands correct the Chang'e pose
    { id: '2.2', t0: S22, t1: S23, paper: 'silk', grain: 22,
      scene: [X.has('K_2.2') ? kf('K_2.2', { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.56, y: 0.47, zoom: 1.12 },
        masks: { base: [0.2, 0.5], polys: [{ pts: [[0, 0], [0.5, 0], [0.5, 1], [0, 1]], flutter: 0.8, blur: 16 }, { pts: [[0.5, 0.2], [0.82, 0.2], [0.82, 1], [0.5, 1]], depth: 0.8, blur: 10 }] },
        flutter: [2.2, 1.4] }) : ph('Willow switches → M’s dance ribbons; Jade’s hands correct her arm', 'K_2.2')],
      type(ctx, t) {
        lyricEN(ctx, L.L02, { ...small, x: 1860, y: 1010, align: 'right', color: INK }, t);
        inscription(ctx, 'ins22', '垂柳', 1876, 360, t, S22 + 0.4, S23 - 0.05);
      } },
    // 2.3 — LS1: the canopied rowboat on West Lake; Jade sings in 3/4 profile
    { id: '2.3', t0: S23, t1: S24, paper: 'silk', grain: 23,
      scene: [X.has('J_LS1') ? kf('J_LS1', { from: { x: 0.5, y: 0.5, zoom: 1.03 }, to: { x: 0.53, y: 0.48, zoom: 1.09 },
        masks: { base: [0.1, 0.5], polys: [{ pts: [[0.55, 0], [1, 0], [1, 1], [0.5, 1]], depth: 0.85, blur: 12 }, { pts: [[0, 0.45], [0.55, 0.45], [0.55, 0.75], [0, 0.75]], water: 1, blur: 10 }, { pts: [[0.6, 0.15], [0.75, 0.15], [0.75, 0.7], [0.6, 0.7]], flutter: 0.35, blur: 12 }] },
        shimmer: 1.2, flutter: [1.4, 1.6] }) : ph('LS1 — Jade sings in the West Lake rowboat', 'J_LS1')],
      type(ctx, t) {
        lyricEN(ctx, L.L03, { ...small, x: 110, y: 120, color: INK, breaks: [4] }, t);
        inscription(ctx, 'ins23', '西湖', 620, 60, t, S23 + 0.5, S24 - 0.05);
      } },
    // 2.4 — insert: her hand smoothing the silk of the Chang'e costume; the silk ripple becomes a lake ripple
    { id: '2.4', t0: S24, t1: S25, paper: 'silk', grain: 24,
      scene: [ph('Insert — Jade’s hand smoothing the silk of the Chang’e costume; the ripple becomes the lake', 'K_2.4 (gen-v)')],
      type(ctx, t) { lyricEN(ctx, L.L04, { ...small, x: 960, y: 1000, align: 'center', color: INK }, t); } },
    // 2.5 — fill: the teahouse lattice doors open (K_3.1 revealed from the centre)
    { id: '2.5', t0: S25, t1: S31, paper: 'silk', grain: 25,
      scene: [X.has('K_3.1') ? kf('K_3.1', { from: { x: 0.5, y: 0.48, zoom: 1.2 }, to: { x: 0.5, y: 0.5, zoom: 1.12 }, reveal: (t, lt) => smooth(0.0, 1.4, lt) * 1.4 }) : ph('Teahouse lattice doors swing open', 'K_3.1')],
      type(ctx, t) { lyricEN(ctx, L.L04, { ...small, key: 'b', x: 960, y: 1000, align: 'center', color: INK, until: L.L04.end + 0.7 }, t); } },
  ];
}
