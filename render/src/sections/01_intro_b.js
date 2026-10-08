// SECTION 1 · INTRO B — 15.67–32.42 (docs/script.md §1). Taiko cuts carry a 2-frame ink flash. Owner: motion lead.
import { card, calli, bump, hud, INK, PALE, INKC, PALEC, WHITE, smooth, easeInOutSine } from './_lib.js';

export const range = [15.67, 32.42];
export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const VOICE = 22.75;
  const TAIKO = [bar(9), bar(11), bar(13), bar(15)];
  const LIFT = bar(8), CUT = bar(16), V1 = bar(17);
  const has = (k) => X.has(k);
  return [
    // 1.1 — the night turns to indigo; a gold line traces Earth → Moon
    { id: '1.1', t0: LIFT, t1: TAIKO[0], paper: 'indigo', grain: 7,
      // the roof deck keeps moving (K_0.6/take_3 continues from 0.6, same framing) while the night turns to indigo over it
      scene: [{ type: 'roto', clip: 'K_0.6/take_3', paper: 'silk', offset: 0.55 + 0.75 * (LIFT - 13.10), rate: 0.75, lock: 0, subject: false, maskGain: 8, from: { x: 0.58, y: 0.52, zoom: 1.18 }, to: { x: 0.585, y: 0.515, zoom: 1.2 } },
        { name: 'paperfade', params: { paperTo: 'indigo', fade: (t, lt) => 0.5 + 0.5 * smooth(0.0, 0.6, lt) } },
        { name: 'inkmoon', params: { mode: 'photo', place: { x: 1470, y: 330, R: 118 }, pale: true, paleColor: [0.80, 0.80, 0.80] } }, 'trajectory'] },

    // 1.2 — TAIKO: the rocket on its pad in gold jiehua; 这一次，她会回来
    { id: '1.2', t0: TAIKO[0], t1: TAIKO[1], paper: 'indigo', grain: 8, flash: true,
      scene: [{ name: 'inkmoon', params: { mode: 'photo', place: { x: 1600, y: 96, R: 40 }, pale: true, paleColor: [0.82, 0.82, 0.8] } }, 'rocketPad'],
      params: { offset: 0.32, shiftX: 170 },
      post: (t, lt) => bump(lt), cam: (t, lt) => ({ zoom: 1 + 0.012 * lt }),
      type(ctx, t) {
        // the premise: every space programme on Earth, building one station together
        card(ctx, 'c12', { lines: [[{ t: 'Every space program on Earth', font: 'CormorantItalic', size: 60 }], [{ t: 'is building one moonbase', size: 84 }], [{ t: 'together.', size: 126 }]],
          size: 100, x: 110, y: 150, color: '#ffffff' }, t, TAIKO[0] + 0.3, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12a', { text: '这一次，', size: 76, x: 520, y: 448, color: WHITE, seed: 34 }, t, TAIKO[0] + 0.8, 0.5, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12b', { text: '全世界', size: 76, x: 416, y: 448, color: WHITE, seed: 35 }, t, TAIKO[0] + 1.25, 0.45, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12c', { text: '共建一座', size: 76, x: 312, y: 448, color: WHITE, seed: 36 }, t, TAIKO[0] + 1.65, 0.5, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12d', { text: '月球基地', size: 76, x: 208, y: 448, color: WHITE, seed: 37 }, t, TAIKO[0] + 2.1, 0.55, TAIKO[1] - 0.02, 'gold');   // Jade, Oct 8: 月球基地, not 月宫
        const ha = smooth(TAIKO[0] + 2.0, TAIKO[0] + 2.5, t) * (1 - smooth(TAIKO[1] - 0.3, TAIKO[1], t));
        if (ha > 0) ctx.pipe.layer((g) => ctx.type.hud(g, 'GUANGHAN STATION  ·  LUNAR SOUTH POLE  ·  EST. 2035', 112, 1032, { size: 15, color: `rgba(255,255,255,${(0.85 * ha).toFixed(3)})`, tracking: 0.2 }), { mode: 'gold', seed: 46 });
      } },

    // 1.3 — TAIKO flash: Mei on stage wires as Chang'e (K_7.D1); brightens into the voice bloom
    { id: '1.3', t0: TAIKO[1], t1: VOICE, paper: 'silk', grain: 9, flash: true, focus: [900, 380],
      // K_7.D1/take_4 (slow rise on the wires, ribbons, phones) redrawn on silk — the same base the drop uses in gold
      scene: [{ type: 'roto', clip: 'K_7.D1/take_4', paper: 'silk', offset: 0.6, lock: 0, subject: false, maskGain: 8, from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.52, y: 0.46, zoom: 1.13 } }],
      post: (t, lt) => ({ ...bump(lt), fade: smooth(VOICE - 0.3, VOICE, t) * 0.55, fadeColor: [0.97, 0.93, 0.84] }) },

    // 1.4a — the voice blooms: a breath opening (slow, bright) onto THE WALKOUT before dawn (K_1.4a; flight E1-B: Adaeze
    //        leads Anastasia, Arjun and Lúcia). One subject; the others fall off in depth and light. Never more than four
    //        suited crew in a launch-day frame. (The J_1.4 helmet close-up is retired from this slot.)
    { id: '1.4a', t0: VOICE, t1: bar(12, 3), paper: 'indigo', grain: 10, focus: [1250, 330],
      // K_1.4a/take_6 (h3; Oct 8, hair inside the helmets: Anastasia and Lúcia in low buns, no hair over a neck ring),
      // framed from the thighs up as a tracking shot that walks with them (feet and floor lines out of frame); redrawn
      // flat (silk redraw on indigo)
      scene: [{ type: 'roto', clip: 'K_1.4a/take_6', paper: 'silk', subject: false, maskGain: 8, style: { lineA: 0 }, offset: 0.5, lock: 0, from: { x: 0.44, y: 0.37, zoom: 1.42 }, to: { x: 0.47, y: 0.36, zoom: 1.5 } }],
      post: (t, lt) => ({ open: easeInOutSine(Math.min(1, lt / 0.6)), openColor: [1.0, 0.88, 0.62] }) },
    // 1.4b — on the vocal peak (G#5 at 24.7): flight E1-A at the foot of the tower (K_1.4b). Chen Yu looks up at the
    //        vehicle; Layla and Kenji behind him, Jade farthest, seen from behind, her hair gathered at the nape and
    //        tucked inside the suit collar (Oct 8: no hair crosses a helmet). Redrawn flat (silk redraw on indigo).
    { id: '1.4b', t0: bar(12, 3), t1: TAIKO[2], paper: 'indigo', grain: 10, focus: [1290, 300],
      scene: [{ type: 'roto', clip: 'K_1.4b/take_3', paper: 'silk', subject: false, maskGain: 8, style: { lineA: 0 }, offset: 1.0, lock: 0, from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.55, y: 0.45, zoom: 1.09 } }] },

    // 1.5 — TAIKO: Guanghan Station at night, a tiny Earth on the horizon (K_1.5 when it lands)
    has('K15')
      ? { id: '1.5', t0: TAIKO[2], t1: 26.87, paper: 'xuan', grain: 11, flash: true, scene: 'plate', post: (t, lt) => bump(lt), focus: [940, 450],
        // framed up on the lit station and the Earth on the horizon (the keyframe's lower half is empty regolith)
        params: { img: 'K15', grade: 'native', from: { x: 0.53, y: 0.42, zoom: 1.15 }, to: { x: 0.5, y: 0.41, zoom: 1.22 }, par: [-0.014, 0.002], dolly: 0.06,
          masks: { base: [0.0, 0.8], polys: [
            { pts: [[0, 0], [1, 0], [1, 0.33], [0, 0.33]], depth: 0.0, blur: 14 },
            { pts: [[0.16, 0.6], [0.88, 0.58], [0.9, 0.86], [0.14, 0.88]], depth: 0.72, blur: 10 },
            { pts: [[0, 0.86], [1, 0.86], [1, 1], [0, 1]], depth: 1.0, blur: 10 },
          ] },
          flicker: 1.2, mist: { color: [0.62, 0.62, 0.64], amount: 0.2, y0: 820, y1: 1080, speed: -9 } } }
      : { id: '1.5', t0: TAIKO[2], t1: 26.87, paper: 'xuan', grain: 11, flash: true, post: (t, lt) => bump(lt),
        scene: [{ name: 'plate', params: { img: 'S4', grade: 'ink', from: { x: 0.52, y: 0.56, zoom: 1.12 }, to: { x: 0.49, y: 0.56, zoom: 1.18 }, par: [-0.012, 0], dolly: 0.06, sky: [0, 400, 2.4, 150], desat: 1 } },
          { name: 'earth', params: { earth: { x: 1590, y: 214, r: 15, dx: -3 } } }, 'tag'],
        params: { tag: 'STAND-IN — Guanghan Station at night (K_1.5 pending)' } },

    // 1.6 — Wenchang, blue hour: Kenton holds M, T holds his hand; the rocket waits on its lit pad across the water (K_1.6)
    //       K_1.6/take_4 (h3), restaged Oct 7: the pad is at the right; M sits on Kenton's right hip, her left arm round
    //       his neck, her free right arm pointing at the rocket; all three look at it. Cut in with the motion under way.
    { id: '1.6', t0: 26.87, t1: TAIKO[3], paper: 'silk', grain: 12, focus: [1150, 470],
      scene: [{ type: 'roto', clip: 'K_1.6/take_4', paper: 'silk', offset: 0.5, lock: 0, from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.52, y: 0.49, zoom: 1.06 } }],
    },

    // 1.7 — TAIKO: the seal lands on 28.75; 望明月 written huge; MOONGAZING
    { id: '1.7', t0: TAIKO[3], t1: CUT, paper: 'silk', grain: 13, flash: true, scene: 'title', params: { tLand: TAIKO[3], tWillow: CUT } },
    // 1.8 — drums cut: the ink dries, one brushstroke — a willow switch; credit
    { id: '1.8', t0: CUT, t1: V1, paper: 'silk', grain: 13, scene: 'title', params: { tLand: TAIKO[3], tWillow: CUT } },
  ];
}
