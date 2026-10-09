// SECTION 2 · VERSE 1 — 32.42–46.82 (guzheng + voice, no drums). "Inscription" mode: the English lyric is set small
// in the painting's 留白, word by word on the sung onsets; a short Chinese inscription stands vertical, top-right,
// with the 望月 seal — the way a painter titles a leaf.
import { lyricEN, calli, kf, ph, INK, INKC, PALE, PALEC, smooth } from './_lib.js';
import { plateMap } from '../scenes/plate.js';

// 2.4 → 2.5: the teahouse soaks up through the white silk of the costume (multiply through a wet, lobed blot that
// spreads from the centre), so the cut lands on the scene already there. Runtime only (canvas), deterministic in t.
function silkBleed(ctx, key, P, t, a, b, cx = 960, cy = 540) {
  const img = ctx.assets[key];
  if (t <= a || !img) return;
  const p = Math.min(1, (t - a) / (b - a)), m = plateMap(P, 0, 1, img);
  ctx.pipe.layer((g) => {
    g.save();
    g.filter = 'blur(9px)'; g.fillStyle = '#000';
    const R = 30 + 1500 * p ** 1.5;
    g.beginPath(); g.arc(cx, cy, R * 0.55, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 48; i++) {
      const h1 = Math.sin(i * 12.9898) * 43758.5453 % 1, h2 = Math.sin(i * 78.233) * 12543.123 % 1;
      const an = i * 2.39996, d = R * (0.35 + 0.3 * Math.abs(h1)), r = R * (0.12 + 0.2 * Math.abs(h2)) * (0.6 + 0.4 * p);
      g.beginPath(); g.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d * 0.8, r, 0, Math.PI * 2); g.fill();
    }
    g.filter = 'none'; g.globalCompositeOperation = 'source-in';
    g.drawImage(img, m.b[0], m.b[1], m.a[0], m.a[1]);
    g.restore();
  }, { mode: 'ink', absorb: 0.4, seed: 244 });
}

export const range = [32.23, 46.16];

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
  const S21 = B.bar(17), S22 = L.L02.start, S23 = L.L03.start, S23b = L.L03.words[6].start, S24 = L.L04.start, S25 = B.bar(24), S31 = L.L05.start;
  const small = { size: 40, font: 'Cormorant', tracking: 0.03, hold: 0.9 };
  const K21_ROTO = true;   // K_2.1/take_2 (h3, v7 keyframe: snow falls, the boatman rows); false = JS boat drift over the split plate
  const LS1 = X.pick('LS1'), LS1_ROTO = !!LS1;
  // take_24 stays three-quarter for the whole clip, so 2.3 runs to the end of the line (no cutaway); older takes cut away
  const LS1_FULL = !!LS1 && LS1.take === 'take_24';   // false = the painted J_LS1 still (parallax) if the take has to be pulled
  // rev Oct 7 (lip-sync audit): no sung close-up of the boat met the bar, so 2.3 is the rear three-quarter view of the same
  // boat (J_LS1_back): she sings, her mouth is not in view. Pull the pick from picks.json to get the old close-up back.
  const LSB = X.pick('LS1_back');
  const TEA = X.has('J_3.1') ? 'J_3.1' : 'K_3.1';
  const P25 = { from: { x: 0.5, y: 0.48, zoom: 1.2 } };   // the Verse 2 teahouse (shared with 3.1 in 03_verse2.js)
  return [
    // 2.1 — West Lake in winter, the Broken Bridge; the camera travels right→left along the scroll
    { id: '2.1', t0: S21, t1: S22, paper: 'silk', grain: 21, focus: [960, 700],
      // K_2.1 round 6 (Jade with her mother in the boat): the boat is its own layer (K_2.1_boat over the boat-less
      // K_2.1_lake, split by scratchpad boat.py) and drifts right→left under the slow scroll pan; the water breathes.
      // (The h3 take_1 base was generated from the earlier painting, so it is not used.)
      // Oct 8, round three ("something about the camera movement is jerky"): the pan used to start at x 0.62, which a
      // zoom of 1.22 cannot show (the view centre is clamped to 0.59), so the frame stood still for 0.9 s and then
      // jumped to speed in two frames. It now starts inside the picture and is one eased move from the first frame.
      scene: [K21_ROTO ? { type: 'roto', clip: 'K_2.1/take_2', paper: 'silk', offset: 0.55, lock: 0, subject: false, maskGain: 8, from: { x: 0.595, y: 0.52, zoom: 1.24 }, to: { x: 0.44, y: 0.53, zoom: 1.25 } }
        : X.has('K_2.1_lake') && X.has('K_2.1_boat')
        ? kf('K_2.1_lake', { from: { x: 0.62, y: 0.52, zoom: 1.22 }, to: { x: 0.44, y: 0.53, zoom: 1.25 }, par: [-0.012, 0], dolly: 0.03, ease: 'linear',
          over: { img: 'K_2.1_boat', from: [0.007, 0], to: [-0.008, 0.0015] },
          masks: { base: [0.0, 0.7], polys: [{ pts: [[0, 0.58], [1, 0.58], [1, 0.62], [0.62, 0.66], [0.6, 1], [0, 1]], water: 1, blur: 14 }] }, shimmer: 0.8,
          mist: { color: [0.86, 0.84, 0.78], amount: 0.3, y0: 260, y1: 440, speed: -10 } })
        : X.has('K_2.1') ? kf('K_2.1', { from: { x: 0.62, y: 0.52, zoom: 1.22 }, to: { x: 0.44, y: 0.53, zoom: 1.25 }, par: [-0.012, 0], dolly: 0.03, ease: 'linear',
          mist: { color: [0.86, 0.84, 0.78], amount: 0.3, y0: 260, y1: 440, speed: -10 } }) : ph('West Lake in winter, the Broken Bridge under thin snow', 'K_2.1')],
      type(ctx, t) {
        lyricEN(ctx, L.L01, { ...small, x: 120, y: 150, color: INK }, t);
        inscription(ctx, 'ins21', '断桥残雪', 1846, 40, t, S21 + 0.4, S22 - 0.05, { size: 38 });   // clears the pagoda as the pan passes it
      } },
    // 2.2 — willow switches hanging plain and straight → M's dance ribbons; Jade's hands correct the Chang'e pose
    { id: '2.2', t0: S22, t1: S23, paper: 'silk', grain: 22,
      // K_2.2/take_3 (Seedance 2.0): Jade's hands lift M's arm into the Chang'e pose, ribbons hang straight
      scene: [{ type: 'roto', clip: 'K_2.2/take_3', paper: 'silk', offset: 0.55, rate: 0.9, lock: 0, subject: false, maskGain: 8, style: { lineTh: 0.64, lineA: 0.6 }, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.56, y: 0.47, zoom: 1.12 } }],
      type(ctx, t) {
        lyricEN(ctx, L.L02, { ...small, x: 1860, y: 1010, align: 'right', color: INK }, t);
        inscription(ctx, 'ins22', '垂柳', 1876, 600, t, S22 + 0.4, S23 - 0.05);   // below Jade's hands
      } },
    // 2.3 — the canopied rowboat on West Lake from behind: Jade sings to the lake beside her mother (mouths out of view)
    { id: '2.3', t0: S23, t1: !LSB && LS1_ROTO && !LS1_FULL ? S23b : S24, paper: 'silk', grain: 23, focus: LSB ? [1340, 420] : [1180, 420],
      // LS1/take_24 (Seedance 2.5 720p, the vocal stem as reference audio; stays three-quarter): the take's OWN mouth is
      // kept, nothing is drawn from the stem (lag +0.25 s, checked frame by frame against the syllable onsets).
      // roto/take_24f is the same take prepped with a crop-tracked face (193/193 frames; the plain prep found 13): face
      // mask, lip lines, and the painted keyframe eye riding on the head. lock 0: we cut in 0.55 s into the take.
      // LSB: LS1_back/take_2 (Seedance 2.5 720p, prepped remouth=False), cut in 0.75 s into the take (the mother is
      // already moving), whole subjects redrawn; the take runs 5.04 s, the shot uses 0.75–4.38 s.
      scene: [LSB ? { type: 'roto', clip: LSB.clip, paper: 'silk', offset: 0.75, lock: 0, mouth: false, subject: false, maskGain: 8, from: { x: 0.52, y: 0.5, zoom: 1.03 }, to: { x: 0.54, y: 0.49, zoom: 1.07 } }
        : LS1_ROTO ? { type: 'roto', clip: LS1.take === 'take_24' ? 'LS1/take_24f' : LS1.clip, paper: 'silk', ref_t0: 38.88, lag: LS1.lag, lock: 0, mouth: false, from: { x: 0.5, y: 0.5, zoom: 1.03 }, to: { x: 0.53, y: 0.48, zoom: 1.09 } }
        : X.has('J_LS1') ? kf('J_LS1', { from: { x: 0.5, y: 0.5, zoom: 1.03 }, to: { x: 0.53, y: 0.48, zoom: 1.09 },
        masks: { base: [0.1, 0.4], polys: [{ pts: [[0.56, 0], [1, 0], [1, 1], [0.5, 1]], depth: 0.85, blur: 14 }, { pts: [[0, 0.47], [0.56, 0.47], [0.56, 0.8], [0, 0.8]], water: 1, blur: 12 }, { pts: [[0.72, 0.0], [1, 0.0], [1, 0.08], [0.72, 0.08]], flutter: 0.5, blur: 10 }] },
        shimmer: 1.2, flutter: [1.4, 1.6] }) : ph('LS1 — Jade sings in the West Lake rowboat', 'J_LS1')],
      type(ctx, t) {
        lyricEN(ctx, L.L03, { ...small, x: 110, y: 120, color: INK, breaks: [4] }, t);
        inscription(ctx, 'ins23', '西湖', 620, 60, t, S23 + 0.5, S24 - 0.05);
      } },
    // 2.3b — "…over water": the take turns her full-face from ~clip 3 s, where the redraw ghosts (doubled glasses), so on
    //        the word "water" we cut wide to the lake: the same boat (Jade and her mother) drifting under the bridge
    ...(!LSB && LS1_ROTO && !LS1_FULL ? [{ id: '2.3b', t0: S23b, t1: S24, paper: 'silk', grain: 230, focus: [960, 640],
      scene: [X.has('K_2.1_lake') && X.has('K_2.1_boat')
        ? kf('K_2.1_lake', { from: { x: 0.5, y: 0.66, zoom: 1.62 }, to: { x: 0.47, y: 0.66, zoom: 1.7 }, par: [-0.008, 0], dolly: 0.03, ease: 'linear',
          over: { img: 'K_2.1_boat', from: [-0.006, 0.0005], to: [-0.016, 0.002] },
          masks: { base: [0.0, 0.7], polys: [{ pts: [[0, 0.58], [1, 0.58], [1, 0.62], [0.62, 0.66], [0.6, 1], [0, 1]], water: 1, blur: 14 }] }, shimmer: 0.8 })
        : kf('K_2.1', { from: { x: 0.5, y: 0.66, zoom: 1.62 }, to: { x: 0.47, y: 0.66, zoom: 1.7 } })],
      type(ctx, t) { lyricEN(ctx, L.L03, { ...small, x: 110, y: 120, color: INK, breaks: [4] }, t); } }] : []),
    // 2.4 — insert: her hand smoothing the silk of the Chang'e costume; the silk ripple becomes a lake ripple
    { id: '2.4', t0: S24, t1: S25, paper: 'silk', grain: 24,
      // K_2.4/take_3 (Seedance 2.0): her hands smooth the silk of the costume, the folds run like water
      scene: [{ type: 'roto', clip: 'K_2.4/take_3', paper: 'silk', offset: 0.55, lock: 0, subject: false, maskGain: 8, style: { lineTh: 0.64, lineA: 0.6 }, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.47, y: 0.52, zoom: 1.1 } }],
      needs: [TEA],
      type(ctx, t) { silkBleed(ctx, TEA, P25, t, S25 - 0.62, S25); lyricEN(ctx, L.L04, { ...small, x: 960, y: 1000, align: 'center', color: INK }, t); } },
    // 2.5 — fill (kick lead-in 45.3): the teahouse, Jade, her mother and M at the table (J_3.1, the three-generation
    //       Hangzhou memory; K_3.1 until it lands), already soaked through the silk at the end of 2.4; 3.1 continues
    //       the same slow pull-back on the kit.
    { id: '2.5', t0: S25, t1: S31, paper: 'silk', grain: 25,
      // the same take 3.1 uses, from its first frame (3.1's clip clock continues from here), so the cut on the kit does
      // not pop from a still into motion. J_3.1/take_6 (rev2_tea): Jade is already leaning toward M and her mother is
      // pouring, eyes on the stream. The take starts 0.21 s in (its first five frames ease in from rest) and runs at
      // 0.7 on ones (h3 moved the heads on twos, so this is about 8 poses a second), easing up to 1 over the last
      // 0.3 s; 3.1 carries the clip clock on from 0.255 + 0.7 * (S31 - S25) at about rate 1, so the lips touch just
      // after the cut and the kiss settles on the kit hit in 3.1, not in this fill. Only the mother's painted face is
      // carried (meta.keep); Jade's head turns, so her face is the take's.
      scene: [X.pick(TEA) ? { type: 'roto', clip: X.pick(TEA).clip, paper: 'silk', offset: 0.21, time: (lt) => { const u = Math.max(0, lt - (S31 - S25 - 0.3)); return 0.21 + 0.7 * lt + 0.5 * u * u; }, twos: false, lock: 0, style: { snapAmt: 0.12, lineTh: 0.62, lineA: 0.62 }, ...P25, to: { x: 0.5, y: 0.5, zoom: 1.12 } }
        : X.has(TEA) ? kf(TEA, { ...P25, to: { x: 0.5, y: 0.5, zoom: 1.12 }, par: [0, 0], dolly: 0 }) : ph('The teahouse', TEA)],
      type(ctx, t) { lyricEN(ctx, L.L04, { ...small, key: 'b', x: 80, y: 660, breaks: [2], color: INK, until: L.L04.end + 0.7 }, t); } },   // on the plain wall, left of the family
  ];
}
