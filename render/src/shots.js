// SHOT TABLE v2 — COLD OPEN (0) + INTRO B (1), 0.00–32.42 s (docs/script.md v1.1).
// Times are song seconds; downbeats from the beat grid (B.bar(n)), events (2.84 boom, 22.75 voice bloom) from the
// script. Taiko hits (17.54, 21.29, 25.01, 28.75) are hard cuts with a 2-frame ink flash (shot.flash).
// Each shot: id, t0, t1, paper (xuan | silk | silknight | indigo), scene (name or [{name, params}]), params,
//            cam(t, lt), type(ctx, t, lt), post(t, lt), grain (static-per-shot grain seed), flash.
// Type: every story card = a big English serif card (cap height ~6–8% of frame, key words larger) paired with a
// large brushed Chinese phrase (calligraphy reveal), both in the shot's negative space.
import { inkmoon } from './scenes/inkmoon.js';
import { plate } from './scenes/plate.js';
import { ribbons } from './scenes/ribbons.js';
import { rocketPad, trajectory } from './scenes/jiehua.js';
import { title } from './scenes/title.js';
import { tag, washes, beach, wires, earth, streak } from './scenes/misc.js';
import { cardTiming } from './type.js';
import { smooth, easeInOutSine } from './util.js';

export const SCENES = { inkmoon, plate, ribbons, rocketPad, trajectory, title, tag, washes, beach, wires, earth, streak };

const INK = '#17171b', PALE = '#efe7d6';
const INKC = [0.07, 0.07, 0.085], PALEC = [0.94, 0.91, 0.84], WHITE = [1, 1, 1];

// English card: brush-wipe in at a, fade out ending at b
function card(ctx, key, o, t, a, b, mode = 'ink') {
  const c = ctx.type.card(key, { tracking: 0.02, leading: 1.1, ...o });
  const tm = cardTiming(t, a, b, o.win ?? 0.75, o.fout ?? 0.3);
  if (tm.wipe <= 0 || tm.alpha <= 0) return;
  ctx.pipe.layer((g) => c.draw(g, tm.wipe, tm.alpha * (o.opacity ?? 1)), { mode, absorb: mode === 'ink' ? 0.45 : 0, seed: 40 });
}
// Chinese calligraphy: brushed in from a over `dur`, fades with the card at b. wash: a soft ink ground behind it
function calli(ctx, key, o, t, a, dur, b, mode = 'ink') {
  const it = ctx.type.inkText(key, { font: 'MaShanZheng', lead: 1.02, ...o });
  const n = [...o.text].length;
  const p = smooth(a, a + dur, t) * (n + 0.25);
  const al = (1 - smooth(b - 0.3, b, t)) * (o.alpha ?? 1);
  if (p <= 0 || al <= 0) return;
  if (o.wash) ctx.pipe.layer((g) => {
    const bx = it.box; const cx = bx.x + bx.w / 2, cy = bx.y + bx.h / 2;
    g.save(); g.translate(cx, cy); g.scale(bx.w * 0.9, bx.h * 0.62);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    gr.addColorStop(0, `rgba(10,14,28,${0.62 * al})`); gr.addColorStop(1, 'rgba(10,14,28,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
  }, { mode: 'ink', absorb: 0.7, seed: 44 });
  ctx.pipe.layer((g) => it.draw(g, p, smooth(a + 0.2, a + dur + 0.8, t), al), { mode, absorb: mode === 'ink' ? 0.55 : 0, seed: 43 });
}
const bump = (lt) => ({ bump: 0.010 * Math.exp(-lt / 0.12) });

export function buildShots(B, assets = {}) {
  const bar = (n, b = 1) => B.bar(n, b);
  // v3 timing: the drop falls on the first sound (1.78) and lands on the first hit (2.84); cuts on the strong pluck
  // (5.86), the bar-4 and bar-5 downbeats, and the 13.10 accent.
  const FIRST = 1.78, BOOM = 2.84, S03 = 5.86, S04 = bar(4), S05 = bar(5), S06 = 13.10, VOICE = 22.75;
  const TAIKO = [bar(9), bar(11), bar(13), bar(15)];   // 17.54, 21.29, 25.01, 28.75
  const LIFT = bar(8), CUT = bar(16), V1 = bar(17);     // 15.67, 30.57, 32.42
  const moonRiseCam = (t) => ({ zoom: 1 + 0.07 * easeInOutSine(t / S03), y: -8 * (t / S03) });
  const has = (k) => !!assets[k];
  const SHANGHAI = /shanghai|pudong|puxi/i.test(assets.k06txt || '');

  const shots = [
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
        params: { img: 'K06', grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.53, y: 0.47, zoom: 1.16 }, par: [-0.014, 0.004], dolly: 0.08,
          masks: { base: [0.05, 0.9], polys: [{ pts: [[0, 0], [1, 0], [1, 0.32], [0, 0.32]], depth: 0.0, blur: 24 }] },
          flicker: 1.0, glow: 0.4, mist: { color: [0.38, 0.44, 0.58], amount: 0.3, y0: 360, y1: 600, speed: 10 } } }
      : { id: '0.6', t0: S06, t1: LIFT, paper: 'silk', grain: 6, scene: 'plate',
      params: { img: 'K06', grade: 'native', from: { x: 0.56, y: 0.5, zoom: 1.04 }, to: { x: 0.66, y: 0.42, zoom: 1.24 }, par: [-0.012, 0.004], dolly: 0.08,
        masks: { base: [0.05, 0.5], polys: [
          { pts: [[0.77, 0.24], [0.88, 0.18], [0.96, 0.36], [1, 1], [0.64, 1], [0.64, 0.8], [0.77, 0.74]], depth: 0.9, blur: 6 },
          { pts: [[0.84, 0.22], [0.91, 0.22], [0.92, 0.62], [0.85, 0.62]], flutter: 0.5, blur: 10 },
          { pts: [[0.785, 0.3], [0.835, 0.3], [0.84, 0.45], [0.79, 0.45]], flutter: 0.4, blur: 8 },
          { pts: [[0.0, 0.42], [1, 0.42], [1, 0.52], [0, 0.52]], water: 1, blur: 10 },
        ] },
        flutter: [2.2, 2.8], shimmer: 1.4, flicker: 0.8, mist: { color: [0.36, 0.42, 0.55], amount: 0.3, y0: 380, y1: 560, speed: 10 } } },

    // 1.1 — the night turns to indigo; a gold line traces Earth → Moon
    { id: '1.1', t0: LIFT, t1: TAIKO[0], paper: 'indigo', grain: 7,
      scene: [{ name: 'plate', params: { img: 'K06', grade: 'silk', from: { x: 0.66, y: 0.42, zoom: 1.24 }, to: { x: 0.67, y: 0.41, zoom: 1.27 }, opacity: (t, lt) => 0.95 * (1 - smooth(0.0, 0.9, lt)) } },
        { name: 'inkmoon', params: { mode: 'photo', place: { x: 1470, y: 330, R: 118 }, pale: true, paleColor: [0.80, 0.80, 0.80] } }, 'trajectory'] },

    // 1.2 — TAIKO: the rocket on its pad in gold jiehua; 这一次，她会回来
    { id: '1.2', t0: TAIKO[0], t1: TAIKO[1], paper: 'indigo', grain: 8, flash: true,
      scene: [{ name: 'inkmoon', params: { mode: 'photo', place: { x: 1600, y: 96, R: 40 }, pale: true, paleColor: [0.82, 0.82, 0.8] } }, 'rocketPad'],
      params: { offset: 0.32, shiftX: 170 },
      post: (t, lt) => bump(lt), cam: (t, lt) => ({ zoom: 1 + 0.012 * lt }),
      type(ctx, t) {
        // the premise: every space programme on Earth, building one station together
        card(ctx, 'c12', { lines: [[{ t: 'This time, every space agency on Earth', font: 'CormorantItalic', size: 60 }], [{ t: 'is going ' }, { t: 'together.', size: 126 }]],
          size: 100, x: 110, y: 160, color: '#ffffff' }, t, TAIKO[0] + 0.3, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12a', { text: '这一次，', size: 84, x: 560, y: 340, color: WHITE, seed: 34 }, t, TAIKO[0] + 0.8, 0.6, TAIKO[1] - 0.02, 'gold');
        calli(ctx, 'z12b', { text: '全世界一起去', size: 84, x: 446, y: 340, color: WHITE, seed: 35 }, t, TAIKO[0] + 1.3, 0.9, TAIKO[1] - 0.02, 'gold');
        const ha = smooth(TAIKO[0] + 2.0, TAIKO[0] + 2.5, t) * (1 - smooth(TAIKO[1] - 0.3, TAIKO[1], t));
        if (ha > 0) ctx.pipe.layer((g) => ctx.type.hud(g, 'GUANGHAN STATION  ·  LUNAR SOUTH POLE  ·  EST. 2035', 112, 1032, { size: 15, color: `rgba(255,255,255,${(0.85 * ha).toFixed(3)})`, tracking: 0.2 }), { mode: 'gold', seed: 46 });
      } },

    // 1.3 — TAIKO flash: Mei on stage wires as Chang'e (K_7.D1); brightens into the voice bloom
    { id: '1.3', t0: TAIKO[1], t1: VOICE, paper: 'silk', grain: 9, flash: true, scene: 'plate',
      params: { img: 'K7D1', grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.52, y: 0.46, zoom: 1.13 }, par: [0.0, 0.035], dolly: 0.05,
        masks: { base: [0.2, 0.4], polys: [
          { pts: [[0.80, 0.0], [0.99, 0.0], [0.99, 0.26], [0.80, 0.26]], depth: 0.05, blur: 10 },
          { pts: [[0.34, 0.22], [0.66, 0.2], [0.66, 0.66], [0.34, 0.66]], depth: 0.65, blur: 12 },
          { pts: [[0.34, 0.28], [0.54, 0.28], [0.56, 0.62], [0.34, 0.62]], flutter: 0.9, blur: 14 },
          { pts: [[0, 0.82], [1, 0.82], [1, 1], [0, 1]], depth: 1.0, blur: 8 },
        ] },
        flutter: [5, 2.6], glow: 0.9 },
      post: (t, lt) => ({ ...bump(lt), fade: smooth(VOICE - 0.3, VOICE, t) * 0.55, fadeColor: [0.97, 0.93, 0.84] }) },

    // 1.4 — the voice blooms: a breath opening (slow, bright) onto Jade (gold-line stand-in)
    { id: '1.4', t0: VOICE, t1: TAIKO[2], paper: 'indigo', grain: 10,
      scene: [{ name: 'plate', params: { img: 'goldline', grade: 'gold', rect: [552, 0, 816, 1080], feather: 150, from: { x: 0.5, y: 0.40, zoom: 1.0 }, to: { x: 0.5, y: 0.36, zoom: 1.12 }, dolly: 0.04,
          masks: { aspect: 4 / 3, base: [0.4, 0.6], polys: [
            { pts: [[0, 0.3], [0.3, 0.3], [0.32, 1], [0, 1]], flutter: 0.8, blur: 18 }, { pts: [[0.72, 0.3], [1, 0.3], [1, 1], [0.7, 1]], flutter: 0.8, blur: 18 }] },
          flutter: [3, 2.0] } }, 'tag'],
      params: { tag: 'STAND-IN — Jade in helmet, visor up, Earth in the visor rim (still→Seedance, no lips)' },
      post: (t, lt) => ({ open: easeInOutSine(Math.min(1, lt / 1.25)), openColor: [1.0, 0.88, 0.62] }) },

    // 1.5 — TAIKO: Guanghan Station at night, a tiny Earth on the horizon (K_1.5 when it lands)
    has('K15')
      ? { id: '1.5', t0: TAIKO[2], t1: 26.87, paper: 'xuan', grain: 11, flash: true, scene: 'plate', post: (t, lt) => bump(lt),
        params: { img: 'K15', grade: 'native', from: { x: 0.5, y: 0.52, zoom: 1.04 }, to: { x: 0.47, y: 0.5, zoom: 1.11 }, par: [-0.014, 0.002], dolly: 0.06,
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

    // 1.6 — Wenchang beach, blue hour: the family looks up at a gold streak rising from the tower (K_1.6)
    { id: '1.6', t0: 26.87, t1: TAIKO[3], paper: 'silk', grain: 12, scene: ['plate', 'streak'],
      params: { img: 'K16', grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.03 }, to: { x: 0.53, y: 0.48, zoom: 1.10 }, par: [-0.016, 0], dolly: 0.06,
        masks: { base: [0.0, 0.6], polys: [
          { pts: [[0, 0], [0.52, 0], [0.42, 0.45], [0.22, 0.8], [0, 0.9]], depth: 0.9, blur: 8 },
          { pts: [[0, 0], [0.56, 0], [0.5, 0.3], [0, 0.4]], flutter: 0.7, blur: 16 },
          { pts: [[0.41, 0.64], [0.51, 0.64], [0.51, 0.96], [0.41, 0.96]], depth: 0.75, blur: 6 },
          { pts: [[0.42, 0.6], [1, 0.6], [1, 0.82], [0.5, 0.82]], water: 1, blur: 12 },
        ] },
        flutter: [4, 2.2], shimmer: 1.6,
        streak: { uv: [0.925, 0.565], h: 500, dx: -240, bend: 40, t0: -0.2 } } },

    // 1.7 — TAIKO: the seal lands on 28.75; 望明月 written huge; MOONGAZING
    { id: '1.7', t0: TAIKO[3], t1: CUT, paper: 'silk', grain: 13, flash: true, scene: 'title', params: { tLand: TAIKO[3], tWillow: CUT } },
    // 1.8 — drums cut: the ink dries, one brushstroke — a willow switch; credit
    { id: '1.8', t0: CUT, t1: V1, paper: 'silk', grain: 13, scene: 'title', params: { tLand: TAIKO[3], tWillow: CUT } },
  ];
  return shots;
}
