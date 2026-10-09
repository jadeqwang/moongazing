// SECTION 1 · INTRO B — 15.67–32.42 (docs/script.md §1). Taiko cuts carry a 2-frame ink flash. Owner: motion lead.
import { card, calli, bump, hud, INK, PALE, INKC, PALEC, WHITE, smooth, easeInOutSine } from './_lib.js';

export const range = [15.69, 32.23];
export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const VOICE = 22.66;
  const TAIKO = [bar(9), bar(11), bar(13), bar(15)];
  const LIFT = bar(8), CUT = bar(16), V1 = bar(17);
  const has = (k) => X.has(k);
  return [
    // 1.1 — the night turns to indigo; a gold line traces Earth → Moon
    { id: '1.1', t0: LIFT, t1: TAIKO[0], paper: 'indigo', grain: 7,
      // the terrace keeps moving (K_0.6/take_5 continues from 0.6, same framing and clock) while the night turns to indigo over it
      scene: [{ type: 'roto', clip: 'K_0.6/take_5', paper: 'silk', style: { snapAmt: 0.12, lineA: 0 }, offset: 0.6 + 0.75 * (LIFT - 13.10), rate: 0.75, lock: 0, subject: false, maskGain: 8, from: { x: 0.58, y: 0.575, zoom: 1.25 }, to: { x: 0.585, y: 0.57, zoom: 1.27 } },
        { name: 'paperfade', params: { paperTo: 'indigo', fade: (t, lt) => 0.5 + 0.5 * smooth(0.0, 0.6, lt) } },
        // (TYPE, Oct 8: the Moon used to arrive whole on the first frame of this shot, in the middle of a continuous take; it now comes up over 0.9 s with the indigo)
        { name: 'inkmoon', params: { mode: 'photo', place: { x: 1470, y: 330, R: 118 }, pale: (t, lt) => smooth(0.0, 0.9, lt), paleColor: [0.80, 0.80, 0.80] } }, 'trajectory'] },

    // 1.2 — TAIKO: the rocket on its pad in gold jiehua; 这一次，她会回来
    { id: '1.2', t0: TAIKO[0], t1: TAIKO[1], paper: 'indigo', grain: 8, flash: true,
      scene: [{ name: 'inkmoon', params: { mode: 'photo', place: { x: 1600, y: 96, R: 40 }, pale: true, paleColor: [0.82, 0.82, 0.8] } }, 'rocketPad'],
      params: { offset: 0.32, shiftX: 170 },
      post: (t, lt) => bump(lt), cam: (t, lt) => ({ zoom: 1 + 0.012 * lt }),
      type(ctx, t) {
        // the premise (Jade, Oct 8, round three): "Every space program on Earth / is building the / International Moonbase."
        // and, in four columns, Jade's wording of Oct 8 night (round four): 全世界的 / 航天计划 / 共建 / 国际月球基地 (72 px; the
        // name 80). The block keeps left of the tower's guy wire and above the pad's ground line; the English is whole by
        // +1.1 s and the last column by +2.25 s of the 3.75 s shot.
        card(ctx, 'c12', { lines: [[{ t: 'Every space program on Earth', font: 'CormorantItalic', size: 56 }], [{ t: 'is building the', size: 62 }], [{ t: 'International Moonbase.', size: 80 }]],
          size: 100, x: 110, y: 126, color: '#ffffff', win: 0.85, fout: 0.3 }, t, TAIKO[0] + 0.25, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12b', { text: '全世界的', size: 72, x: 526, y: 338, color: WHITE, seed: 35 }, t, TAIKO[0] + 0.55, 0.4, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12e', { text: '航天计划', size: 72, x: 434, y: 338, color: WHITE, seed: 38 }, t, TAIKO[0] + 0.95, 0.4, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12c', { text: '共建', size: 72, x: 342, y: 338, color: WHITE, seed: 36 }, t, TAIKO[0] + 1.35, 0.3, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12d', { text: '国际月球基地', size: 80, x: 242, y: 338, color: WHITE, seed: 37 }, t, TAIKO[0] + 1.65, 0.6, TAIKO[1] - 0.02, 'gold');
        const ha = smooth(TAIKO[0] + 2.0, TAIKO[0] + 2.5, t) * (1 - smooth(TAIKO[1] - 0.3, TAIKO[1], t));
        if (ha > 0) ctx.pipe.layer((g) => ctx.type.hud(g, 'INTERNATIONAL MOONBASE  ·  LUNAR SOUTH POLE  ·  EST. 2035', 112, 1032, { size: 15, color: `rgba(255,255,255,${(0.85 * ha).toFixed(3)})`, tracking: 0.2 }), { mode: 'gold', seed: 46 });
      } },

    // 1.3 — TAIKO flash: Mei on stage wires as Chang'e (K_7.D1); brightens into the voice bloom
    { id: '1.3', t0: TAIKO[1], t1: VOICE, paper: 'silk', grain: 9, flash: true, focus: [900, 380],
      // K_7.D1/take_4 (slow rise on the wires, ribbons, phones) redrawn on silk — the same base the drop uses in gold
      scene: [{ type: 'roto', clip: 'K_7.D1/take_4', paper: 'silk', offset: 0.6, lock: 0, subject: false, maskGain: 8, from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.52, y: 0.46, zoom: 1.13 } }],
      post: (t, lt) => ({ ...bump(lt), fade: smooth(VOICE - 0.3, VOICE, t) * 0.55, fadeColor: [0.97, 0.93, 0.84] }) },

    // 1.4a — the voice blooms: a breath opening onto THE WALKOUT before dawn, seen from the FRONT (K_1.4a v5, rev3
    //        Oct 8; flight E1-B: Adaeze leads Anastasia, Arjun and Lúcia). The counterpart of 3.8b's rear view: whole
    //        figures on the wet apron, coming toward us and to the left, toward the floodlit rocket small on the
    //        horizon. Nobody in step; Anastasia finishes a small wave; each carries a portable ventilation unit in the
    //        left hand, its one hose plugged in at both ends (media/ref/rev3_astro/). One subject: Adaeze. Never more
    //        than four suited crew in a launch-day frame.
    { id: '1.4a', t0: VOICE, t1: bar(12, 3), paper: 'indigo', grain: 10, focus: [1080, 420],
      // K_1.4a/take_7 (h3), clip 0.083–1.42 s at rate 1. The take is 12 drawings a second (each frame doubled) and walks
      // from its first drawing, so it plays at rate 1 from an even frame and the redraw on twos lands on its drawings (any
      // other rate gives uneven holds: a stutter). It ends before 1.4 s, where Adaeze's hose doubles in the take.
      // Redrawn flat (silk redraw on indigo); the breath opening is over in 0.45 s so the picture reads for most of the shot
      // The rocket is the painting's own (POLISH, Oct 8): repainted as the film's vehicle (core, two boosters, capsule, escape
      // tower: the take and the old painting had a Soyuz-like skirt of four) and carried as a still kept region (roto_keep.py --still).
      scene: [{ type: 'roto', clip: 'K_1.4a/take_7', paper: 'silk', subject: false, maskGain: 8, style: { lineA: 0 }, offset: 2 / 24, lock: 0, keepOcc: false, from: { x: 0.49, y: 0.52, zoom: 1.06 }, to: { x: 0.478, y: 0.525, zoom: 1.11 } }],
      post: (t, lt) => ({ open: easeInOutSine(Math.min(1, lt / 0.45)), openColor: [1.0, 0.88, 0.62] }) },
    // 1.4b — on the vocal peak (G#5 at 24.7): flight E1-A at the foot of the tower (K_1.4b). Chen Yu looks up at the
    //        vehicle; Layla and Kenji behind him, Jade farthest, seen from behind, her hair gathered at the nape and
    //        tucked inside the suit collar (Oct 8: no hair crosses a helmet). Redrawn flat (silk redraw on indigo).
    { id: '1.4b', t0: bar(12, 3), t1: TAIKO[2], paper: 'indigo', grain: 10, focus: [1290, 300],
      scene: [{ type: 'roto', clip: 'K_1.4b/take_3', paper: 'silk', subject: false, maskGain: 8, style: { lineA: 0 }, offset: 1.0, lock: 0, from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.55, y: 0.45, zoom: 1.09 } }] },

    // 1.5 — TAIKO: Guanghan Station at night, a tiny Earth on the horizon (K_1.5 when it lands)
    has('K15')
      ? { id: '1.5', t0: TAIKO[2], t1: 26.73, paper: 'xuan', grain: 11, flash: true, scene: 'plate', post: (t, lt) => bump(lt), focus: [940, 450],
        // framed up on the lit station and the Earth on the horizon (the keyframe's lower half is empty regolith)
        params: { img: 'K15', grade: 'native', from: { x: 0.53, y: 0.42, zoom: 1.15 }, to: { x: 0.5, y: 0.41, zoom: 1.22 }, par: [-0.014, 0.002], dolly: 0.06,
          masks: { base: [0.0, 0.8], polys: [
            { pts: [[0, 0], [1, 0], [1, 0.33], [0, 0.33]], depth: 0.0, blur: 14 },
            { pts: [[0.16, 0.6], [0.88, 0.58], [0.9, 0.86], [0.14, 0.88]], depth: 0.72, blur: 10 },
            { pts: [[0, 0.86], [1, 0.86], [1, 1], [0, 1]], depth: 1.0, blur: 10 },
          ] },
          flicker: 1.2, mist: { color: [0.62, 0.62, 0.64], amount: 0.2, y0: 820, y1: 1080, speed: -9 } } }
      : { id: '1.5', t0: TAIKO[2], t1: 26.73, paper: 'xuan', grain: 11, flash: true, post: (t, lt) => bump(lt),
        scene: [{ name: 'plate', params: { img: 'S4', grade: 'ink', from: { x: 0.52, y: 0.56, zoom: 1.12 }, to: { x: 0.49, y: 0.56, zoom: 1.18 }, par: [-0.012, 0], dolly: 0.06, sky: [0, 400, 2.4, 150], desat: 1 } },
          { name: 'earth', params: { earth: { x: 1590, y: 214, r: 15, dx: -3 } } }, 'tag'],
        params: { tag: 'STAND-IN — International Moonbase at night (K_1.5 pending)' } },

    // 1.6 — Wenchang, blue hour: Kenton holds M, T holds his hand; the rocket waits on its lit pad across the water (K_1.6)
    //       K_1.6/take_4 (h3), restaged Oct 7: the pad is at the right; M sits on Kenton's right hip, her left arm round
    //       his neck, her free right arm pointing at the rocket; all three look at it. Cut in with the motion under way.
    { id: '1.6', t0: 26.73, t1: TAIKO[3], paper: 'silk', grain: 12, focus: [1150, 470],
      // rev3 KIDS (Oct 8): M's hair is the painting's own (the region the take redrew is replaced by the keyframe's pixels,
      // carried: tools/roto_keep.py), so it is the same braid as in 4.2 (the take had turned it into three braids).
      scene: [{ type: 'roto', clip: 'K_1.6/take_4', paper: 'silk', offset: 0.5, lock: 0, keepOcc: false, from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.52, y: 0.49, zoom: 1.06 } }],
    },

    // 1.7 — TAIKO: the seal lands on 28.75; 望明月 written huge; MOONGAZING
    { id: '1.7', t0: TAIKO[3], t1: CUT, paper: 'silk', grain: 13, flash: true, scene: 'title', params: { tLand: TAIKO[3], tWillow: CUT } },
    // 1.8 — drums cut: the ink dries, one brushstroke — a willow switch; credit
    { id: '1.8', t0: CUT, t1: V1, paper: 'silk', grain: 13, scene: 'title', params: { tLand: TAIKO[3], tWillow: CUT } },
  ];
}
