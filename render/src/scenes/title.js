// 1.7 / 1.8 — the title. Hard cut on the bar-15 taiko (28.75) with the ink flash: the vermilion seal is already
// stamped (it lands ON the beat; paper deflection), then 望明月 is written huge and fast as vertical calligraphy
// (~60% of frame height), MOONGAZING brushes in beneath. At 30.57 the drums cut, the ink dries, and one dry
// brushstroke sweeps down: a single winter willow switch. Credit small.
import { makeSeal, drawStamp, sealFromImage } from '../seal.js';
import { spline, resample, drawDryBrush } from '../brush.js';
import { smooth } from '../util.js';
import { cardTiming } from '../type.js';

export const title = {
  init(ctx) {
    // the 望月 carved seal from media/chars/identity if it has landed; otherwise a carved 白文 望月 placeholder
    this.seal = ctx.assets.sealWangyue ? sealFromImage(ctx.type, ctx.assets.sealWangyue, 118)
      : makeSeal(ctx.type, { size: 104, style: 'baiwen', chars: ['望', '月'], font: 'MaShanZheng', seed: 15 });
    this.willow = resample(spline([
      { x: 1452, y: -40, w: 15 }, { x: 1478, y: 120, w: 13.5 }, { x: 1497, y: 300, w: 11 },
      { x: 1503, y: 480, w: 8.2 }, { x: 1496, y: 640, w: 5.2 }, { x: 1481, y: 770, w: 2.6 }, { x: 1466, y: 856, w: 0.6 },
    ], 30), 1.2);
  },
  draw(ctx, shot, t) {
    const p = shot.params;
    const tLand = p.tLand, tCut = p.tWillow;
    const type = ctx.type;
    let post = {};
    const dry = smooth(tCut, tCut + 1.2, t);
    // 望明月 — huge vertical calligraphy
    const SZ = 212;
    const big = type.inkText('title-zh', { text: '望明月', font: p.font || 'MaShanZheng', size: SZ, x: 960 + SZ / 2, y: 44, seed: 12, lead: 1.0 });
    const pr = 3.2; // written whole under the ink flash: the flash lifts off a finished title (no half-written frame)
    ctx.pipe.layer((g) => big.draw(g, pr, 0.25 + 0.75 * smooth(tLand, tLand + 1.4, t), 1 - dry * 0.05), { mode: 'ink', absorb: 0.55, seed: 20 });
    // the seal, beside the column, landing exactly on the beat
    ctx.pipe.layer((g) => {
      post = drawStamp(g, this.seal, { x: 1178, y: 612, t, tLand, rot: 0.018, show: 1 - dry * 0.07 });
    }, { mode: 'ink', absorb: 0.55, seed: 21 });
    // MOONGAZING — quiet, very open tracking, centred under the column
    const card = type.card('title-en', { lines: ['MOONGAZING'], font: 'Cormorant', weight: 500, size: 54, tracking: 0.62, x: 960 + 0.31 * 54, y: 800, align: 'center', color: '#1b1a1d', seed: 8 });
    const ct = cardTiming(t, tLand + 0.55, 1e9, 0.9);
    if (ct.wipe > 0) ctx.pipe.layer((g) => card.draw(g, ct.wipe, 0.92), { mode: 'ink', absorb: 0.4, seed: 22 });
    if (t >= tCut) {
      const wp = smooth(tCut, tCut + 0.62, t);
      const sw = Math.sin((t - tCut - 0.5) * 1.7) * 5 * smooth(tCut + 0.4, tCut + 1.0, t);
      const path = this.willow.map((q) => { const k = Math.pow(Math.max(0, q.y) / 860, 2); return { ...q, x: q.x + sw * k }; });
      ctx.pipe.layer((g) => drawDryBrush(g, path, wp, { color: '#151517', bristles: 26, seed: 42, dry: 0.5, wet: 0.4 }), { mode: 'ink', absorb: 0.6, seed: 23 });
      const credit = type.card('title-credit', { lines: ['JADE  WANG'], font: 'Cormorant', weight: 500, size: 20, tracking: 0.42, x: 960 + 0.21 * 20, y: 872, align: 'center', color: '#1b1a1d', seed: 9 });
      const cr = cardTiming(t, tCut + 0.35, 1e9, 0.7);
      ctx.pipe.layer((g) => credit.draw(g, cr.wipe, 0.85), { mode: 'ink', absorb: 0.3, seed: 24 });
    }
    ctx.postExtra = post;
  },
};
