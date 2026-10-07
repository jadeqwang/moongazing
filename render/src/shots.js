// SHOT TABLE — COLD OPEN (0) + INTRO B (1), 0.00–32.42 s. Times are song seconds; downbeats come from the beat
// grid (B.bar(n) = bar n downbeat), event times (2.84 boom, 22.75 voice bloom) from docs/script.md.
// Each shot: id, t0, t1, paper (xuan | silk | silknight | indigo), scene (name or [{name, params}]), params,
//            cam(t, lt) -> {x, y, zoom}, type(ctx, t, lt) -> typography layers, post(t, lt) -> post overrides,
//            grain (shot-static grain seed; shots that are one continuous picture share it).
import { inkmoon } from './scenes/inkmoon.js';
import { plate } from './scenes/plate.js';
import { ribbons } from './scenes/ribbons.js';
import { rocketPad, trajectory } from './scenes/jiehua.js';
import { title } from './scenes/title.js';
import { tag, washes, beach, wires, earth } from './scenes/misc.js';
import { makeSeal, drawStamp } from './seal.js';
import { cardTiming } from './type.js';
import { smooth, easeInOutSine } from './util.js';

export const SCENES = { inkmoon, plate, ribbons, rocketPad, trajectory, title, tag, washes, beach, wires, earth };

const INK = '#18181c', PALE = '#ece4d2';
let dotSeal = null;

// card helper: brush-wipe in at a, fade out ending at b
function card(ctx, key, o, t, a, b, mode = 'ink') {
  const c = ctx.type.card(key, o);
  const tm = cardTiming(t, a, b, o.win ?? 0.9, o.fout ?? 0.4);
  if (tm.wipe <= 0 || tm.alpha <= 0) return;
  ctx.pipe.layer((g) => c.draw(g, tm.wipe, tm.alpha * (o.opacity ?? 1)), { mode, absorb: mode === 'ink' ? 0.45 : 0, seed: 40 });
}

export function buildShots(B) {
  const bar = (n, b = 1) => B.bar(n, b);
  const BOOM = 2.84, S04 = 5.86, S05 = 9.14, S06 = 13.10, VOICE = 22.75;
  const TAIKO = [bar(9), bar(11), bar(13), bar(15)];   // 17.54, 21.29, 25.01, 28.75
  const LIFT = bar(8), CUT = bar(16), V1 = bar(17);     // 15.67, 30.57, 32.42
  const moonRiseCam = (t) => ({ zoom: 1 + 0.055 * easeInOutSine(t / BOOM), y: -6 * (t / BOOM) });

  const shots = [
    // 0.1 — a drop of ink falls on xuan and blooms into a full Moon
    { id: '0.1', t0: 0, t1: 1.78, paper: 'xuan', scene: 'inkmoon', params: { tImpact: 0.48 }, grain: 1, cam: moonRiseCam },
    // 0.2 — it resolves into the real Moon; 嫦娥奔月 brushes in top-right; a small seal lands on bar 1
    { id: '0.2', t0: 1.78, t1: BOOM, paper: 'xuan', scene: 'inkmoon', params: { tImpact: 0.48, resolveAt: [1.86, 2.66] }, grain: 1, cam: moonRiseCam,
      type(ctx, t) {
        const it = ctx.type.inkText('changE', { text: '嫦娥奔月', font: 'ZhiMangXing', size: 46, x: 1716, y: 128, seed: 4, lead: 1.06 });
        const p = smooth(1.92, 2.62, t) * 4.25;
        ctx.pipe.layer((g) => it.draw(g, p, smooth(2.1, 2.84, t)), { mode: 'ink', absorb: 0.5, seed: 41 });
        dotSeal = dotSeal || makeSeal(ctx.type, { size: 30, style: 'dot', seed: 77 });
        let post = {};
        ctx.pipe.layer((g) => { post = drawStamp(g, dotSeal, { x: 1693, y: 128 + 4 * 46 * 1.06 + 34, t, tLand: bar(1), rot: 0.02, approach: 0.12 }); }, { mode: 'ink', absorb: 0.5, seed: 42 });
        ctx.postExtra = { deflect: [post.deflect[0], post.deflect[1], post.deflect[2] * 0.25, 40] };
      } },
    // 0.3 — BOOM: silk. The Moon (ink on silk), silk ribbons rising past it (Chang'e stand-in)
    { id: '0.3', t0: BOOM, t1: S04, paper: 'silk', grain: 3,
      scene: [{ name: 'inkmoon', params: { mode: 'photo', place: { x: 1325, y: 410, R: 255 }, halo: 0.6 } }, 'ribbons', 'tag'],
      params: {
        tag: 'STAND-IN — Chang’e in gongbi silk rising past the Moon (still→h3)', rise: 26,
        ribbons: [
          { a: [700, 1300], c1: [860, 980], c2: [1500, 900], b: [1090, 240], w: 40, amp: 26, k: 1.3, speed: 0.45, phase: 0.3, twist: 1.8, front: '#cf8576', back: '#efe2cf' },
          { a: [800, 1320], c1: [1060, 1040], c2: [1700, 760], b: [1240, 150], w: 30, amp: 32, k: 1.6, speed: 0.40, phase: 2.1, twist: 2.4, front: '#7d9db4', back: '#e6e6dc' },
          { a: [640, 1310], c1: [760, 1100], c2: [1260, 1010], b: [990, 420], w: 20, amp: 20, k: 1.9, speed: 0.55, phase: 4.0, twist: 1.6, front: '#ece0ca', back: '#c49a6c' },
        ],
      },
      cam: (t, lt) => ({ y: -lt * 4 }),
      type(ctx, t) { card(ctx, 'c1', { lines: ['Four thousand years ago,', 'Chang’e flew to the Moon.'], size: 60, x: 132, y: 812, color: INK }, t, BOOM + 0.22, S04 - 0.08); } },
    // 0.4 — she could never come home (INK; Earth the only colour)
    { id: '0.4', t0: S04, t1: S05, paper: 'xuan', grain: 4, scene: ['plate', 'tag'],
      params: { img: 'S2', grade: 'ink', from: { x: 0.56, y: 0.5, zoom: 1.08 }, to: { x: 0.52, y: 0.49, zoom: 1.16 }, par: [-18, 0],
        tag: 'STAND-IN — Chang’e at 广寒宫 with the jade rabbit, Earth below (still→h3)' },
      type(ctx, t) { card(ctx, 'c2', { lines: ['She could never come home.'], size: 60, x: 132, y: 236, color: PALE }, t, S04 + 0.25, S05 - 0.06, 'over'); } },
    // 0.5 — every autumn since… (SILK night; Hangzhou; the full Moon)
    { id: '0.5', t0: S05, t1: S06, paper: 'silknight', grain: 5,
      scene: [{ name: 'plate', params: { img: 'S1', grade: 'silknight', from: { x: 0.60, y: 0.55, zoom: 1.12 }, to: { x: 0.48, y: 0.55, zoom: 1.12 }, par: [-30, 0], ease: 'linear' } },
        { name: 'inkmoon', params: { mode: 'photo', place: { x: 1535, y: 178, R: 62 }, pale: true, paleColor: [0.93, 0.9, 0.82] } }, 'tag'],
      params: { tag: 'STAND-IN — 1,000 rooftops of Hangzhou, Mid-Autumn night, lanterns (still+parallax)' },
      type(ctx, t) { card(ctx, 'c3', { lines: ['Every autumn since, a billion people', 'look up and miss someone.'], size: 56, x: 132, y: 168, color: PALE }, t, S05 + 0.3, S06 - 0.06, 'over'); } },
    // 0.6 — push in on one rooftop (breathing room)
    { id: '0.6', t0: S06, t1: LIFT, paper: 'silknight', grain: 6,
      scene: [{ name: 'plate', params: { img: 'S1b', grade: 'silknight', from: { x: 0.80, y: 0.47, zoom: 1.6 }, to: { x: 0.82, y: 0.45, zoom: 2.1 } } },
        { name: 'inkmoon', params: { mode: 'photo', place: { x: 1290, y: 210, R: 92 }, pale: true, paleColor: [0.93, 0.9, 0.82] } }, 'tag'],
      params: { tag: 'STAND-IN — Mei lifts a toy Moon against the real one; her mother kneels (Seedance + roto)' } },
    // 1.1 — the night turns to indigo; a gold line traces Earth → Moon
    { id: '1.1', t0: LIFT, t1: TAIKO[0], paper: 'indigo', grain: 7,
      scene: [{ name: 'plate', params: { img: 'S1b', grade: 'silk', from: { x: 0.82, y: 0.45, zoom: 2.1 }, to: { x: 0.82, y: 0.45, zoom: 2.16 }, opacity: (t, lt) => 0.9 * (1 - smooth(0.0, 0.9, lt)) } },
        { name: 'inkmoon', params: { mode: 'photo', place: { x: 1470, y: 330, R: 118 }, pale: true, paleColor: [0.80, 0.80, 0.80] } }, 'trajectory'] },
    // 1.2 — TAIKO: the rocket on its pad, drawn as gold jiehua
    { id: '1.2', t0: TAIKO[0], t1: TAIKO[1], paper: 'indigo', grain: 8,
      scene: [{ name: 'inkmoon', params: { mode: 'photo', place: { x: 352, y: 236, R: 44 }, pale: true, paleColor: [0.82, 0.82, 0.8] } }, 'rocketPad'],
      params: { offset: 0.32 },  // the taiko lands on a drawing already under way: ground, tower legs, the rocket's body
      post: (t, lt) => ({ bump: 0.010 * Math.exp(-lt / 0.12) }),
      cam: (t, lt) => ({ zoom: 1 + 0.012 * lt }),
      type(ctx, t) { card(ctx, 'c4', { lines: ['This time,', 'she’s coming back.'], size: 64, x: 132, y: 520, color: '#ffffff' }, t, TAIKO[0] + 0.55, TAIKO[1] - 0.06, 'gold'); } },
    // 1.3 — teaser flash: Mei on stage wires as Chang'e (paper moon, wires, ribbons)
    { id: '1.3', t0: TAIKO[1], t1: VOICE, paper: 'silknight', grain: 9, post: (t, lt) => ({ bump: 0.010 * Math.exp(-lt / 0.12) }),
      scene: [{ name: 'washes', params: { washes: [{ y0: 0, y1: 1080, c0: 'rgba(52,62,104,0.75)', c1: 'rgba(30,34,58,0.85)' }] } }, { name: 'inkmoon', params: { mode: 'photo', place: { x: 1080, y: 470, R: 300 }, pale: true, paleColor: [0.92, 0.88, 0.8] } }, 'wires', 'ribbons', 'tag'],
      params: { rise: 60, ribbonMode: 'over', ribbonOpacity: 0.85, tag: 'STAND-IN — Mei on stage wires as Chang’e (gen-v + roto)',
        ribbons: [
          { a: [700, 1200], c1: [820, 900], c2: [880, 760], b: [910, 520], w: 24, amp: 30, k: 1.7, speed: 0.9, phase: 1.2, twist: 2.6, front: '#e9e1d2', back: '#c9786a' },
          { a: [1100, 1220], c1: [1010, 930], c2: [960, 760], b: [930, 540], w: 18, amp: 24, k: 2.1, speed: 0.8, phase: 3.0, twist: 2.2, front: '#d9cdb6', back: '#6f93ad' },
        ] } },
    // 1.4 — voice blooms: Jade (gold line portrait stand-in), slow push
    { id: '1.4', t0: VOICE, t1: TAIKO[2], paper: 'indigo', grain: 10,
      scene: [{ name: 'plate', params: { img: 'goldline', grade: 'gold', rect: [552, 0, 816, 1080], feather: 150, from: { x: 0.5, y: 0.40, zoom: 1.0 }, to: { x: 0.5, y: 0.37, zoom: 1.10 } } }, 'tag'],
      params: { tag: 'STAND-IN — Jade in helmet, visor up, Earth in the visor rim (still→Seedance, no lips)' } },
    // 1.5 — taiko: Guanghan Station at night, a tiny Earth on the horizon
    { id: '1.5', t0: TAIKO[2], t1: 26.87, paper: 'xuan', grain: 11, post: (t, lt) => ({ bump: 0.010 * Math.exp(-lt / 0.12) }),
      scene: [{ name: 'plate', params: { img: 'S4', grade: 'ink', from: { x: 0.52, y: 0.56, zoom: 1.12 }, to: { x: 0.49, y: 0.56, zoom: 1.16 }, par: [-16, 0], sky: [0, 400, 2.4, 150], desat: 1 } },
        { name: 'earth', params: { earth: { x: 1590, y: 214, r: 15, dx: -3 } } }, 'tag'],
      params: { tag: 'STAND-IN — Guanghan Station at night, lit windows under regolith (still+parallax)' } },
    // 1.6 — the family on Wenchang beach at dusk, looking up at a gold streak
    { id: '1.6', t0: 26.87, t1: TAIKO[3] - 0.125, paper: 'silk', grain: 12,
      scene: ['washes', 'beach', 'tag'],
      params: { tag: 'PLACEHOLDER — the family on Wenchang beach at dusk, looking up (still+parallax)',
        washes: [{ y0: 0, y1: 646, c0: 'rgba(92,96,128,0.62)', c1: 'rgba(240,176,128,0.32)' }, { y0: 646, y1: 860, c0: 'rgba(132,156,170,0.55)', c1: 'rgba(110,128,136,0.6)' }, { y0: 860, y1: 1080, c0: 'rgba(150,124,92,0.55)', c1: 'rgba(96,78,60,0.7)' }] } },
    // 1.7 — TAIKO: the seal stamps the title. (shot starts 3 frames early: the stone comes down onto the beat)
    { id: '1.7', t0: TAIKO[3] - 0.125, t1: CUT, paper: 'silk', grain: 13, scene: 'title', params: { tLand: TAIKO[3], tWillow: CUT } },
    // 1.8 — drums cut: the ink dries, one brushstroke — a willow switch; credit
    { id: '1.8', t0: CUT, t1: V1, paper: 'silk', grain: 13, scene: 'title', params: { tLand: TAIKO[3], tWillow: CUT } },
  ];
  return shots;
}
