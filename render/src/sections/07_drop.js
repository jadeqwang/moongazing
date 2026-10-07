// SECTION 7 · DROP — 122.77–189.86 — GOLD paper (instrumental, erhu lead). No lyrics: data type, counters, the
// call delay, the family chat, the livestream delay. Cuts every bar (A/B), on beats in the crew grid.
import { hud, card, kf, ph, bump, PALE, WHITE, smooth, clamp } from './_lib.js';
import { CREW, cell } from './05_interlude.js';

export const range = [122.77, 189.86];

// a chat window typed live (mono on indigo): lines [{ who, text, t }] — each line types at ~22 chars/s
function chat(ctx, lines, t, x = 1180, y = 640) {
  ctx.pipe.layer((g) => {
    g.fillStyle = 'rgba(8,10,22,0.82)'; g.fillRect(x - 30, y - 70, 700, 320);
    g.strokeStyle = 'rgba(212,168,75,0.7)'; g.lineWidth = 1; g.strokeRect(x - 30, y - 70, 700, 320);
    g.font = '13px PlexMono'; g.fillStyle = 'rgba(212,168,75,0.85)'; g.letterSpacing = '2px'; g.fillText('HOME  ·  FAMILY THREAD', x, y - 40);
    lines.forEach((l, i) => {
      if (t < l.t) return;
      const n = Math.floor((t - l.t) * 22);
      const s = [...l.text].slice(0, n).join('');
      const yy = y + i * 64;
      g.font = '16px PlexMonoMedium'; g.letterSpacing = '1px'; g.fillStyle = 'rgba(212,168,75,1)'; g.fillText(l.who, x, yy);
      g.font = '26px PlexMono, "Noto Color Emoji"'; g.fillStyle = 'rgba(240,232,214,1)'; g.fillText(s + (n < [...l.text].length && Math.floor(t * 4) % 2 ? '▍' : ''), x + 90, yy + 2);
    });
  }, { mode: 'over', seed: 71 });
}

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const has = (k) => X.has(k);
  const A = (k, o, title) => (has(k) ? kf(k, o) : null);
  // the gold plan of the station; crops of it until the K_7.A stage frames land
  const plan = (k, from, to, o = {}) => (has(k) ? kf(k, { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.5, y: 0.5, zoom: 1.12 }, ...o })
    : has('K_7.A') ? { name: 'plate', params: { img: 'K_7.A', grade: 'native', from, to, dolly: 0.04, ...o } } : ph('Guanghan Station speed-build in gold jiehua', 'K_7.A'));
  const dayCounter = (ctx, t, a, b, d0, d1, label = 'DAY') => {
    const d = Math.round(d0 + (d1 - d0) * clamp((t - a) / (b - a)));
    hud(ctx, `${label} ${d < 0 ? '−' : ''}${String(Math.abs(d)).padStart(3, '0')}`, 64, 1030, { size: 22, rgb: '255,255,255' }, 1);
  };
  const grid = []; // 7.C4: one crew cell per beat, bar 84
  for (let i = 0; i < 8; i++) {
    const a = i < 4 ? bar(84, i + 1) : bar(85, i - 3), b = i < 7 ? (i + 1 < 4 ? bar(84, i + 2) : bar(85, i - 2)) : bar(86);
    grid.push({ id: `7.C4${'abcdefgh'[i]}`, t0: a, t1: b, paper: 'indigo', grain: 740 + i,
      scene: [has('K_7.C4_grid') ? { name: 'plate', params: { img: 'K_7.C4_grid', grade: 'native', from: cell(i, 2.0), to: cell(i, 2.1), flicker: 0.4 } } : ph(CREW[i][0], 'K_7.C4_grid')],
      type(ctx, t) { hud(ctx, `${CREW[i][0]}  ·  HOME  ·  ${CREW[i][3]}`, 64, 72, { size: 15, rgb: '212,168,75', a: 0.95 }, 1); } });
  }
  const pullback = (t, lt) => { const R = Math.max(7.6, 2600 * Math.exp(-1.6 * lt)); return { x: 960 + 840 * smooth(0.5, 3.6, lt), y: 540, R }; };
  const T = {
    A1: bar(67), A2: bar(68), A3: bar(69), A4: bar(71), B1: bar(73), B2: bar(74), B3: bar(75), B4: bar(76), B5: bar(77), B6: 143.43,
    C1: bar(81), C2: bar(82), C3: bar(83), C4: bar(84), C4g: bar(86), C5: bar(86, 3), C6: 158.5, D1: bar(89), D2: bar(90), D3: 164.5,
    D1b: bar(92), D2b: bar(93), D3b: bar(94), D4: 173.0, E1: bar(97), E2: bar(100), E3: bar(103), END: bar(105),
  };
  return [
    // A · SPEED-BUILD
    { id: '7.A1', t0: T.A1, t1: T.A2, paper: 'indigo', grain: 71, flash: true, post: (t, lt) => bump(lt, 0.016),
      scene: [has('K_7.A') ? { name: 'plate', params: { img: 'K_7.A', grade: 'native', from: { x: 0.5, y: 0.5, zoom: 0.98 }, to: { x: 0.5, y: 0.5, zoom: 1.06 }, reveal: (t, lt) => smooth(0.0, 1.2, lt) * 1.45 } } : ph('The station plan explodes into gold lines', 'K_7.A')],
      type(ctx, t) {
        if (t < T.A1 + 1.1) hud(ctx, 'CONSTRUCTION DAY −640  ·  ROBOTIC PRE-BUILD', 64, 1030, { size: 20, rgb: '255,255,255' }, 1);
        else dayCounter(ctx, t, T.A1 + 1.1, T.A2, 1, 1);
      } },
    { id: '7.A2', t0: T.A2, t1: T.A3, paper: 'indigo', grain: 72,
      scene: [plan('K_7.A2', { x: 0.62, y: 0.55, zoom: 1.9 }, { x: 0.58, y: 0.55, zoom: 2.1 })],
      type(ctx, t) { dayCounter(ctx, t, T.A2, T.A3, 1, 23); hud(ctx, 'PRESSURE VESSELS LANDED  ·  REGOLITH SHELL 2 M', 64, 72, { size: 15, rgb: '212,168,75', a: 0.95 }, 1); } },
    { id: '7.A3', t0: T.A3, t1: T.A4, paper: 'indigo', grain: 73,
      scene: [plan('K_7.A3', { x: 0.82, y: 0.3, zoom: 2.2 }, { x: 0.8, y: 0.32, zoom: 2.4 })],
      type(ctx, t) { dayCounter(ctx, t, T.A3, T.A4, 23, 61); hud(ctx, 'FISSION SURFACE POWER  ·  100 kWe  ·  PRE-CRITICAL', 64, 72, { size: 15, rgb: '212,168,75', a: 0.95 }, 1); hud(ctx, 'ADAEZE OKAFOR  ·  1.0 KM OUT', 64, 98, { size: 13, rgb: '240,232,214' }, 1); } },
    { id: '7.A4', t0: T.A4, t1: T.B1, paper: 'indigo', grain: 74,
      scene: [plan('K_7.A4', { x: 0.25, y: 0.2, zoom: 2.2 }, { x: 0.5, y: 0.5, zoom: 1.0 })],
      type(ctx, t) { dayCounter(ctx, t, T.A4, T.B1, 61, 97); hud(ctx, 'LANDING PAD  ·  SINTERED  ·  LASER PASS', 64, 72, { size: 15, rgb: '212,168,75', a: 0.95 }, 1); } },
    // B · THE WORK — one crew member per bar
    { id: '7.B1', t0: T.B1, t1: T.B2, paper: 'indigo', grain: 75, scene: [A('K_7.B1', { flicker: 0, glow: 0.6, from: { x: 0.45, y: 0.55, zoom: 1.06 }, to: { x: 0.42, y: 0.58, zoom: 1.18 } }) || ph('Arjun drills into a permanently shadowed crater', 'K_7.B1')],
      type(ctx, t) { hud(ctx, 'ARJUN RAMAN  ·  PSR  ·  H₂O ICE 5.6 ± 2.9 wt%', 64, 72, { size: 15, rgb: '212,168,75', a: 0.95 }, 1); } },
    { id: '7.B2', t0: T.B2, t1: T.B3, paper: 'indigo', grain: 76, scene: [A('K_7.B2', { flicker: 1.2, from: { x: 0.55, y: 0.5, zoom: 1.04 }, to: { x: 0.6, y: 0.48, zoom: 1.16 } }) || ph('Jade at the ISRU reactor; molten regolith glows', 'K_7.B2')],
      type(ctx, t) { hud(ctx, 'JADE WANG  ·  ISRU  ·  O₂ 1.0 kg/hr', 64, 72, { size: 15, rgb: '212,168,75', a: 0.95 }, 1); } },
    { id: '7.B3', t0: T.B3, t1: T.B4, paper: 'indigo', grain: 77, scene: [A('K_7.B3', {}) || ph('Lúcia: a purple-tinged rosette in a sealed growth chamber — the first green after Earth', 'K_7.B3', { dark: true })] },
    { id: '7.B4', t0: T.B4, t1: T.B5, paper: 'indigo', grain: 78, scene: [A('K_7.B4', {}) || ph('Kenji’s radio array unrolls across the floor of Shackleton; spectrograms in gold', 'K_7.B4', { dark: true })] },
    { id: '7.B5', t0: T.B5, t1: T.B6, paper: 'xuan', grain: 79, scene: [{ name: 'dust', params: {} }],
      type(ctx, t) { hud(ctx, '1.62 m/s²  ·  NO AIR  ·  NO CLOUD', 64, 72, { size: 15, rgb: '30,30,32', a: 0.85 }, 1, 'ink'); } },
    { id: '7.B6', t0: T.B6, t1: T.C1, paper: 'xuan', grain: 80, post: (t, lt) => bump(lt, 0.012),
      scene: [has('K_1.5') ? kf('K_1.5', { flicker: 1.6, from: { x: 0.5, y: 0.55, zoom: 1.1 }, to: { x: 0.5, y: 0.5, zoom: 1.2 } }) : ph('The habitat lights come on, window by window', 'K_7.B6')],
      type(ctx, t) { hud(ctx, '7.B6  ·  STAND-IN — habitat lights come on (K_1.5 shown)', 48, 1036, { size: 12, color: 'rgba(32,30,30,0.6)', tracking: 0.12 }); } },
    // C · THE CALLS
    { id: '7.C1', t0: T.C1, t1: T.C2, paper: 'indigo', grain: 81, scene: [ph('Video call: M says something; Jade waits out the delay, then laughs', 'K_7.C1', { dark: true })],
      type(ctx, t) {
        const ph2 = ((t - T.C1) % 3.1) / 3.1;
        hud(ctx, `RTT 3.1 s (light 2.6)  ·  ${'▮'.repeat(Math.floor(ph2 * 12)).padEnd(12, '·')}`, 64, 72, { size: 16, rgb: '232,72,52', a: 0.95 }, 1);
      } },
    { id: '7.C2', t0: T.C2, t1: T.C3, paper: 'silk', grain: 82, scene: [A('K_7.C2', { flicker: 0.6, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.52, y: 0.5, zoom: 1.1 } }) || ph('Kenton teaches T DDR; M dances with a robot dog', 'K_7.C2')] },
    { id: '7.C3', t0: T.C3, t1: T.C4, paper: 'silk', grain: 83, scene: [ph('M on the sofa with the cat, watching a music video on a tablet', 'K_7.C3')] },
    ...grid,
    { id: '7.C4i', t0: T.C4g, t1: T.C5, paper: 'indigo', grain: 749, scene: [A('K_7.C4', { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.5, y: 0.5, zoom: 1.1 } }) || ph('The galley: they show each other their clips', 'K_7.C4')] },
    { id: '7.C5', t0: T.C5, t1: T.C6, paper: 'indigo', grain: 84, scene: [ph('Jade alone at the small window; the tea cup on the sill reflects Earth', 'K_7.C6', { dark: true })],
      type(ctx, t) { hud(ctx, 'DAY 312', 64, 1030, { size: 22, rgb: '255,255,255' }, 1); chat(ctx, [{ who: 'jade', text: 'just 3 more months 🌏', t: T.C5 + 0.1 }], t); } },
    { id: '7.C6', t0: T.C6, t1: T.D1, paper: 'indigo', grain: 84, scene: [ph('Jade alone at the small window; the tea cup on the sill reflects Earth', 'K_7.C6', { dark: true })],
      type(ctx, t) { hud(ctx, 'DAY 312', 64, 1030, { size: 22, rgb: '255,255,255' }, 1); chat(ctx, [{ who: 'jade', text: 'just 3 more months 🌏', t: T.C5 + 0.1 }, { who: 't', text: 'ok', t: T.C6 + 0.6 }, { who: 'm', text: '🐰🌕', t: T.C6 + 1.6 }], t); } },
    // D · TWO CHANG'ES
    { id: '7.D1', t0: T.D1, t1: T.D2, paper: 'silk', grain: 91, flash: true, scene: [A('K_7.D1', { from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.52, y: 0.46, zoom: 1.14 }, par: [0, 0.03], dolly: 0.05, glow: 0.9, masks: { base: [0.2, 0.4], polys: [{ pts: [[0.34, 0.28], [0.54, 0.28], [0.56, 0.62], [0.34, 0.62]], flutter: 0.9, blur: 14 }, { pts: [[0, 0.82], [1, 0.82], [1, 1], [0, 1]], depth: 1.0, blur: 8 }] }, flutter: [5, 2.6] }) || ph('School play: M as Chang’e on wires', 'K_7.D1')] },
    { id: '7.D2', t0: T.D2, t1: T.D3, paper: 'indigo', grain: 92, scene: [A('J_7.D2', { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.48, y: 0.5, zoom: 1.12 } }) || ph('Jade watches the livestream, hand to the glass', 'J_7.D2')],
      type(ctx, t) { hud(ctx, 'LIVE  −7 s', 64, 72, { size: 16, rgb: '232,72,52', a: 0.95 }, 1); } },
    ...[['7.D3', T.D3, T.D1b], ['7.D3b', T.D3b, T.D4]].map(([id, a, b]) => ({ id, t0: a, t1: b, paper: 'silk', grain: 93,
      scene: [has('K_7.D1') ? { name: 'plate', params: { img: 'K_7.D1', grade: 'native', rect: [0, 0, 960, 1080], from: { x: 0.45, y: 0.4, zoom: 1.0 }, to: { x: 0.45, y: 0.38, zoom: 1.06 } } } : ph('Split: M reaches the paper moon', 'K_7.D1'),
        has('J_7.D2') ? { name: 'plate', params: { img: 'J_7.D2', grade: 'native', rect: [960, 0, 960, 1080], from: { x: 0.5, y: 0.42, zoom: 1.0 }, to: { x: 0.5, y: 0.4, zoom: 1.06 } } } : ph('Split: Jade touches the screen', 'J_7.D2'),
        { name: 'seam', params: {} }] })),
    { id: '7.D1b', t0: T.D1b, t1: T.D2b, paper: 'silk', grain: 94, scene: [A('K_7.D1', { from: { x: 0.56, y: 0.4, zoom: 1.4 }, to: { x: 0.58, y: 0.36, zoom: 1.5 }, flutter: [5, 2.6], glow: 0.9 }) || ph('M on wires', 'K_7.D1')] },
    { id: '7.D2b', t0: T.D2b, t1: T.D3b, paper: 'indigo', grain: 95, scene: [A('J_7.D2', { from: { x: 0.42, y: 0.42, zoom: 1.35 }, to: { x: 0.4, y: 0.42, zoom: 1.45 } }) || ph('Jade at the screen', 'J_7.D2')] },
    { id: '7.D4', t0: T.D4, t1: T.E1, paper: 'silk', grain: 96, scene: [ph('Bass out: the theatre claps silently; on the Moon the crew around Jade applauds too', 'K_7.D4')] },
    // E · THE TOAST
    { id: '7.E1', t0: T.E1, t1: T.E2, paper: 'indigo', grain: 97, flash: true, scene: [A('K_7.E1', { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.5, y: 0.45, zoom: 1.14 }, dolly: 0.05, masks: { base: [0.1, 0.4], polys: [{ pts: [[0, 0.62], [1, 0.62], [1, 1], [0, 1]], depth: 0.95, blur: 8 }] } }) || ph('The observation dome: the crew raise cups to Earth', 'K_7.E1', { dark: true })] },
    { id: '7.E2', t0: T.E2, t1: T.E3, paper: 'indigo', grain: 98,
      // pull back to scale: Earth–Moon distance = 221 lunar radii; Earth radius = 3.67 lunar radii
      scene: [{ name: 'inkmoon', params: { mode: 'photo', pale: true, paleColor: [0.86, 0.85, 0.82], placeAt: pullback } }, { name: 'earthfar', params: { placeAt: pullback } }],
      type(ctx, t) { hud(ctx, 'GUANGHAN  →  SHACKLETON  →  SOUTH POLE  →  MOON  →  EARTH', 64, 1030, { size: 14, rgb: '212,168,75', a: 0.9 }, 1); } },
    { id: '7.E3', t0: T.E3, t1: T.END, paper: 'indigo', grain: 99, scene: [{ name: 'bluedot', params: { t0: T.E3 } }, { name: 'emblem', params: { emblem: { x: 1120, y: 540, size: 120, t0: T.E3 + 1.6, fade: 0.8, alpha: 0.95 } } }],
      type(ctx, t) { hud(ctx, 'YOU ARE HERE', 905, 600, { size: 13, rgb: '200,215,230', a: 0.8 }, smooth(T.E3 + 0.8, T.E3 + 1.4, t)); } },
  ];
}
