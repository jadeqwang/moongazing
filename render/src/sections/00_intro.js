// SECTION 0 · COLD OPEN / INTRO A — 0.00–15.67 (docs/script.md §0). Owner: motion lead.
import { card, calli, bump, INK, PALE, INKC, PALEC, WHITE, smooth, easeInOutSine } from './_lib.js';
import { plateMap } from '../scenes/plate.js';

// 0.3 → 0.4: the ink of the Moon palace bleeds over Chang'e. The incoming painting (at 0.4's first framing) is laid
// on as sumi (multiply) through a wet, lobed blot that spreads from the dark sky; its whites leave her showing, so at
// the cut only the palace's white paper "turns". Runtime only (canvas), deterministic in t.
const P04 = { from: { x: 0.52, y: 0.5, zoom: 1.03 }, par: [-0.014, 0.004] };
function inkBleed(ctx, key, P, t, a, b) {
  const img = ctx.assets[key];
  if (t <= a || !img) return;
  const p = Math.min(1, (t - a) / (b - a)), m = plateMap(P, 0, 1, img);
  ctx.pipe.layer((g) => {
    g.save();
    g.filter = 'blur(7px)'; g.fillStyle = '#000';
    const R = 30 + 1450 * p ** 1.6;
    g.beginPath(); g.arc(700, 430, R * 0.55, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 48; i++) {   // lobes: the wet front runs ahead unevenly along the fibres
      const h1 = Math.sin(i * 12.9898) * 43758.5453 % 1, h2 = Math.sin(i * 78.233) * 12543.123 % 1;
      const an = i * 2.39996, d = R * (0.35 + 0.3 * Math.abs(h1)), r = R * (0.12 + 0.2 * Math.abs(h2)) * (0.6 + 0.4 * p);
      g.beginPath(); g.arc(700 + Math.cos(an) * d, 430 + Math.sin(an) * d * 0.8, r, 0, Math.PI * 2); g.fill();
    }
    g.filter = 'none'; g.globalCompositeOperation = 'source-in';
    g.drawImage(img, m.b[0], m.b[1], m.a[0], m.a[1]);
    g.restore();
  }, { mode: 'ink', absorb: 0.5, seed: 304 });
}

// a small, quiet title chop, top-right, there from frame 0 (any first frame / thumbnail already says what this is)
function chop(ctx, t) {
  const a = 0.86 * (1 - smooth(4.9, 5.5, t));
  if (a <= 0) return;
  calli(ctx, 'chop0', { text: '望明月', size: 30, x: 1862, y: 54, color: INKC, seed: 9, alpha: a }, t, -10, 0.1, 99);
  ctx.pipe.layer((g) => { const img = ctx.assets.seal_wangyue_baiwen || ctx.assets.seal_wangyue; if (!img) return; g.globalAlpha = a; g.drawImage(img, 1831, 160, 32, 32 * img.height / img.width); }, { mode: 'ink', absorb: 0.4, seed: 13 });
}

export const range = [0, 15.69];
export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const FIRST = 1.80, BOOM = 2.91, S03 = 5.94, S04 = bar(4), S05 = bar(5), S06 = 13.15;
  const LIFT = bar(8);
  // the camera breathes in on the Moon, then (5.0 → the 5.86 pluck) glides so the ink Moon lands exactly where the
  // painted Moon of K_0.3 sits in 0.3's first frame (centre 1665,-11, R 633 px) — a match cut, ink → silk.
  const moonRiseCam = (t) => {
    const z0 = 1 + 0.07 * easeInOutSine(Math.min(1, t / 5.0)), y0 = -8 * Math.min(1, t / 5.0);
    const g = smooth(4.95, S03, t), gz = g * g * (3 - 2 * g) * 0.35 + g * g * 0.65;   // zoom accelerates into the cut
    const z = z0 + (2.18 - z0) * gz;
    return { zoom: z, x: -323 * g, y: y0 + (253 - y0) * g };
  };
  // INK DROP SYNC — the first strum is a rolled guzheng chord: onsets 2.43/2.49/2.55, peak 2.62, next hit 2.87.
  // The drop falls from the first sound (1.78) and HITS the paper at 2.44 (frame 58 is the last airborne frame,
  // frame 59 the first wet one). After contact the bloom runs on a "bloom clock" s(t) instead of wall time: a small
  // splat on each finger of the roll, the main expansion on the 2.62 peak, a secondary pulse on 2.87, then a slow
  // settle. The inkmoon scene derives everything from s = t - tImpact, so tImpact is evaluated per frame as t - s(t)
  // (a getter on the params; `cam` runs first each frame and records t). Pure function of t: deterministic.
  const HIT = 2.24, ROLL = [[2.24, 0.045, 0.10], [2.42, 0.022, 0.09], [2.53, 0.022, 0.09], [2.70, 0.27, 0.26], [2.95, 0.20, 0.30]];
  const eo = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - (1 - x) ** 3);
  const bloomClock = (t) => ROLL.reduce((s, [t0, A, d]) => s + A * eo((t - t0) / d), 0)
    + (t > 2.70 ? 0.75 * (1 - Math.exp(-(t - 2.70) / 1.3)) + 0.12 * (t - 2.70) : 0);
  let now = 0;
  const dropCam = (t) => { now = t; return moonRiseCam(t); };
  const bloom = () => ({ hang: true, tFall: FIRST, get tImpact() { return now < HIT ? HIT : now - bloomClock(now); }, resolveAt: [3.62, 5.1] });
  const SHANGHAI = /shanghai|pudong|puxi/i.test(X.text('K_0.6'));
  const K06_OFF = 1.3, K06_END = { x: 0.58, y: 0.575, zoom: 1.25 };   // shared with 1.1 (01_intro_b.js). rev3: the painted Moon (whole at the cut in) has left the top of the frame by LIFT, before 1.1's ink Moon appears
  return [
    // 0.1 — a drop of ink falls on xuan and blooms into a full Moon
    //       (its shadow gathers in the silence; it falls on the first sound and lands on the first strum, 2.44)
    { id: '0.1', t0: 0, t1: BOOM, paper: 'xuan', scene: 'inkmoon', params: bloom(), grain: 1, cam: dropCam, needs: ['seal_wangyue_baiwen'], type: (ctx, t) => chop(ctx, t) },
    // 0.2 — the bloom settles, the maria drop in wet-in-wet, the real Moon resolves (from the 3.58 pluck)
    { id: '0.2', t0: BOOM, t1: S03, paper: 'xuan', scene: 'inkmoon', params: bloom(), grain: 1, cam: dropCam, needs: ['seal_wangyue_baiwen'], type: (ctx, t) => chop(ctx, t) },

    // 0.3 — Chang'e rises past the Moon: K_0.3/take_1 redrawn on silk (the painting holds; her figure and ribbons are
    //       redrawn on twos from the h3 motion base). The take's head exits top at ~3 s; the shot is 2.35 s.
    { id: '0.3', t0: S03, t1: S04, paper: 'silk', grain: 3, focus: [560, 420],
      scene: [{ type: 'roto', clip: 'K_0.3/take_1', paper: 'silk', offset: 0.5, rate: 0.75, lock: 0, subject: false, maskGain: 8, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.49, y: 0.47, zoom: 1.10 } }],
      needs: ['K04'],
      type(ctx, t) {
        inkBleed(ctx, 'K04', P04, t, S04 - 0.6, S04);
        calli(ctx, 'z03', { text: '嫦娥奔月', size: 150, x: 1848, y: 64, color: INKC, seed: 31 }, t, S03 + 0.1, 0.85, S04 - 0.02);
        card(ctx, 'c03', { lines: [[{ t: 'Long ago, the legend says,', font: 'CormorantItalic', size: 74 }], [{ t: 'Chang’e flew to the ' }, { t: 'Moon.', size: 134 }]],
          size: 104, x: 1840, y: 826, align: 'right', color: INK }, t, S03 + 0.3, S04 - 0.02);
      } },

    // 0.4 — she could never come home. rev Oct 7 (glitch sweep): K_0.4/take_1 (h3) through the ink roto when picked and
    //       prepped: Chang'e breathes and tilts her head to the Earth, her robe and ribbons follow, the rabbit turns its head.
    //       Fallback: the K_0.4 plate with the Earth on its own drifting layer (params below).
    { id: '0.4', t0: S04, t1: S05, paper: 'xuan', grain: 4,
      scene: X.pick('K_0.4') ? [{ type: 'roto', clip: X.pick('K_0.4').clip, paper: 'silk', style: { lineA: 0, snapAmt: 0, gran: 0 }, offset: 0.6, lock: 0, from: { x: 0.52, y: 0.5, zoom: 1.03 }, to: { x: 0.5, y: 0.49, zoom: 1.09 } }] : 'plate',
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
    //       rev3 (Oct 8): K_0.5/take_5 (Seedance 2.0, from the rev3 keyframe) redrawn on silk: the crowd on the festival
    //       street walks, sky lanterns rise; the low amber Moon sits whole at about (154, 137), R 73–79, left of the card.
    //       style lineA 0 (here and in 0.6/1.1): the takes carry the painting's own outlines; the redrawn iron-wire line
    //       broke into heavy dashes at 1080p and blackened the sightseeing boat's strings of light.
    { id: '0.5', t0: S05, t1: S06, paper: 'silk', grain: 5, focus: [900, 420],
      scene: [{ type: 'roto', clip: 'K_0.5/take_5', paper: 'silk', style: { snapAmt: 0.12, lineA: 0 }, offset: 0.6, lock: 0, subject: false, maskGain: 8, from: { x: 0.5, y: 0.52, zoom: 1.05 }, to: { x: 0.47, y: 0.5, zoom: 1.13 } }],
      type(ctx, t) {
        // Li Bai, 静夜思 — traditionally dated 726 CE (开元十四年), Yangzhou
        card(ctx, 'c05', { lines: [[{ t: 'In 726, Li Bai looked up at the ' }, { t: 'Moon', size: 112 }], [{ t: 'and wrote about ' }, { t: 'missing home.', size: 112 }]],
          size: 86, x: 300, y: 120, color: PALE }, t, S05 + 0.25, S06 - 0.02, 'over');
        calli(ctx, 'z05', { text: '李白·静夜思', size: 50, vertical: false, lead: 1.0, x: 304, y: 292, color: PALEC, seed: 33, alpha: 0.85 }, t, S05 + 1.0, 0.8, S06 - 0.02, 'over');
      } },

    // 0.6 — the roof-deck shot. The keyframe is read live; if the new Shanghai/Pudong take has landed (K_0.6.txt says so)
    // use a generic city split (sky far, skyline mid, deck near, lights alive); else the Mei/mother split.
    { id: '0.6', t0: S06, t1: LIFT, paper: 'silk', grain: 6, focus: [1150, 470],
      // rev3 (Oct 8): K_0.6/take_5 (Seedance 2.0, 6 s; real Huangpu traffic gliding, Jade settles and turns her head a
      // little to M). Continue the same drawing clock through 1.1: 0.6 + 0.75 * 4.44 = 3.93 s. Keep rate 0.75: what is
      // still visible under the indigo ends at 2.98 s of the take, before Jade's profile comes round (no glasses drawn).
      scene: [{ type: 'roto', clip: 'K_0.6/take_5', paper: 'silk', style: { snapAmt: 0.12, lineA: 0 }, offset: 0.6, rate: 0.75, lock: 0, subject: false, maskGain: 8, from: { x: 0.5, y: 0.485, zoom: 1.04 }, to: K06_END },
        { name: 'paperfade', params: { paperTo: 'indigo', fade: (t) => 0.5 * smooth(LIFT - 0.7, LIFT, t) } }],
    },

  ];
}
