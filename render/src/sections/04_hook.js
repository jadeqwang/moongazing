// SECTION 4 · HOOK — 76.11–101.33 — the launch. GOLD paper; lyrics HUGE: 月缺酒寒 brushed down the exhaust column,
// 我思念你 over the crowd, a single held 你, "I think of you" across the torn scroll.
import { lyricEN, lyricZH, card, hud, kf, ph, bump, INK, INKC, PALE, PALEC, WHITE, smooth, clamp } from './_lib.js';

export const range = [76.11, 101.33];

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const S41 = bar(41), S42 = bar(43), S43 = bar(44, 4), S44 = L.L11.start, S45 = bar(48), S46 = bar(49), S47 = L.L12.start, S48 = L.L13.start, S49 = bar(53), END = bar(55);
  const huge = { font: 'Cormorant', tracking: 0.01 };
  const gl = (ctx, key, s, t, a, b, color = PALE, y = 1040) => card(ctx, key, { lines: [[{ t: s, font: 'CormorantItalic' }]], size: 32, x: 960, y, align: 'center', color }, t, a, b, 'over');
  return [
    // 4.1 — IGNITION on the 76.17 impact: splashed-ink exhaust in gold and ember; 月缺酒寒 written down the plume
    { id: '4.1', t0: S41, t1: S42, paper: 'indigo', grain: 41, flash: true, post: (t, lt) => bump(lt, 0.016),
      scene: [X.has('K_4.1') ? kf('K_4.1', { from: { x: 0.55, y: 0.6, zoom: 1.25 }, to: { x: 0.55, y: 0.42, zoom: 1.12 }, par: [0, 0.02], dolly: 0.08,
        masks: { base: [0.0, 0.7], polys: [{ pts: [[0.25, 0.55], [0.85, 0.55], [0.85, 1], [0.25, 1]], depth: 0.9, flutter: 0.9, blur: 16 }] }, flutter: [5, 2.4] }) : ph('Ignition: splashed-ink exhaust in gold and ember', 'K_4.1')],
      type(ctx, t) {
        lyricZH(ctx, L.L10, { to: 4, size: 200, x: 640, y: 60, color: WHITE, seed: 101, until: S42 + 0.05 }, t, 'gold');
        hud(ctx, 'T+00:00:0' + Math.max(0, Math.floor(t - 76.17)), 64, 1030, { size: 18, rgb: '255,255,255' }, 1);
        gl(ctx, 'g41', 'The moon wanes; the wine is cold —', t, 78.6, S42 + 0.05);
      } },
    // 4.2 — the viewing area ~4 km away: the light arrives first; M on Kenton's shoulders covers her ears; 我思念你
    { id: '4.2', t0: S42, t1: S43, paper: 'silk', grain: 42,
      scene: [X.has('K_4.2') ? kf('K_4.2', { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.52, y: 0.46, zoom: 1.12 }, dolly: 0.06,
        masks: { base: [0.0, 0.9], polys: [{ pts: [[0, 0], [1, 0], [1, 0.5], [0, 0.5]], depth: 0.0, blur: 20 }, { pts: [[0.6, 0.45], [1, 0.45], [1, 0.65], [0.6, 0.65]], water: 1, blur: 10 }] }, shimmer: 1.2, flicker: 0.6 }) : ph('The crowd at the fence; M on Kenton’s shoulders', 'K_4.2')],
      type(ctx, t) {
        lyricZH(ctx, L.L10, { from: 5, size: 132, x: 400, y: 60, color: PALEC, seed: 102, until: S43 + 0.05, key: 'b' }, t, 'over');
        gl(ctx, 'g42', 'I miss you.', t, 81.6, S43 + 0.05);
      } },
    // 4.3 — LS3: in the capsule under g-load; the held 你 swells
    { id: '4.3', t0: S43, t1: S44, paper: 'indigo', grain: 43,
      scene: [X.has('J_LS3') ? kf('J_LS3', { from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.5, y: 0.5, zoom: 1.1 }, dolly: 0.05 }) : ph('LS3 — Jade under g-load sings the held 你', 'J_LS3')],
      post: (t, lt) => ({ shakeX: 0 }),
      type(ctx, t) {
        lyricZH(ctx, L.L10, { from: 8, size: 330, x: 400, y: 330, color: WHITE, seed: 103, until: S44 + 0.05, key: 'c', scale: (tt) => 1 + 0.18 * smooth(83.3, 86.0, tt) }, t, 'gold');
        hud(ctx, 'MAX-Q  ·  3.2 G', 64, 1030, { size: 15, rgb: '255,255,255' }, smooth(83.6, 83.8, t));
      } },
    // 4.4 — first-stage separation = THE SCROLL TEARS; the lower half (Earth, family) falls away with the booster
    { id: '4.4', t0: S44, t1: S45, paper: 'indigo', grain: 44,
      scene: [X.has('K_4.1') ? kf('K_4.1', { from: { x: 0.55, y: 0.35, zoom: 1.3 }, to: { x: 0.55, y: 0.3, zoom: 1.34 }, tear: [560, 0, 0, 1] }) : ph('Stage separation: the scroll tears', 'K_4.1'),
        ...(X.has('K_4.2') ? [kf('K_4.2', { key: 'tear', from: { x: 0.5, y: 0.6, zoom: 1.1 }, to: { x: 0.5, y: 0.6, zoom: 1.1 }, tear: (t, lt) => [560, 620 * Math.pow(smooth(0.35, 2.1, lt), 2.0), 0.06 * smooth(0.35, 2.1, lt), -1] })] : [])],
      type(ctx, t) {
        hud(ctx, 'MET 00:02:41  ·  STAGE 1 SEP', 64, 72, { size: 15, rgb: '255,255,255' }, 1);
        lyricEN(ctx, L.L11, { ...huge, size: 132, x: 960, y: 330, align: 'center', color: '#ffffff', w1: 4, text: { 3: 'you,' }, until: S45 + 0.05 }, t, 'gold');
      } },
    // 4.5 — the kids in the mission family room at Wenchang, faces lit by the big screen
    { id: '4.5', t0: S45, t1: S46, paper: 'silk', grain: 45,
      scene: [ph('The kids in the family viewing room, faces lit by the big screen; T’s hand on the glass', 'K_4.5')],
      type(ctx, t) { lyricEN(ctx, L.L11, { ...huge, key: 'b', size: 132, x: 960, y: 1000, align: 'center', color: INK, w0: 4, hold: 1.2 }, t); } },
    // 4.6 — orbit: Earth fills the frame for the first time — a 青绿 painting
    { id: '4.6', t0: S46, t1: S47, paper: 'indigo', grain: 46,
      scene: [X.has('K_4.6') ? kf('K_4.6', { from: { x: 0.5, y: 0.55, zoom: 1.06 }, to: { x: 0.56, y: 0.5, zoom: 1.12 }, par: [0.02, 0], masks: { base: [0.3, 0.6] }, mist: { color: [0.96, 0.96, 0.95], amount: 0.14, y0: 300, y1: 1080, speed: 20 } }) : ph('Orbit: Earth as a qinglü painting', 'K_4.6')],
      type(ctx, t) { hud(ctx, 'ORBIT  ·  200 KM  ·  7.8 KM/S', 64, 1030, { size: 15, rgb: '255,255,255' }, 1); } },
    // 4.7 — after TLI: in free fall Jade lifts a drink pouch toward the Moon — 举杯; the calligraphy floats too
    { id: '4.7', t0: S47, t1: S48, paper: 'indigo', grain: 47,
      scene: [ph('After TLI: in free fall Jade lifts a drink pouch toward the Moon; the toy Earth floats beside her', 'K_4.7', { dark: true })],
      type(ctx, t) {
        lyricZH(ctx, L.L12, { size: 128, x: 1840, y: 120, color: WHITE, seed: 104, dy: (tt) => -26 * Math.sin((tt - 92.2) * 1.3) }, t, 'gold');
        hud(ctx, 'TLI COMPLETE  ·  10.9 KM/S', 64, 72, { size: 15, rgb: '255,255,255' }, 1);
      } },
    // 4.8 — the Moon grows from a dot to a wall of ink; the paper turns GOLD → INK
    { id: '4.8', t0: S48, t1: S49, paper: 'xuan', grain: 48,
      scene: [{ name: 'inkmoon', params: { mode: 'photo', halo: 0.5, placeAt: (t, lt) => ({ x: 960, y: 540, R: 14 * Math.exp(1.63 * lt) }) } },
        { name: 'paperfade', params: { paperTo: 'indigo', fade: (t, lt) => 1 - smooth(0.2, 1.4, lt) } }],
      type(ctx, t) { lyricEN(ctx, L.L13, { ...huge, size: 118, x: 960, y: 980, align: 'center', color: INK, panel: 'light', hold: 0.8 }, t); } },
    // 4.9 — drums re-hit: DAY 4 · DESCENT. The lander's plume blasts regolith in flat radial sheets
    { id: '4.9', t0: S49, t1: END, paper: 'xuan', grain: 49, flash: true, post: (t, lt) => bump(lt, 0.012),
      scene: [X.has('K_4.9') ? kf('K_4.9', { from: { x: 0.6, y: 0.4, zoom: 1.3 }, to: { x: 0.6, y: 0.5, zoom: 1.08 }, dolly: 0.08 }) : ph('Descent: the lander’s plume blasts regolith flat', 'K_4.9')],
      type(ctx, t) { hud(ctx, 'DAY 4  ·  DESCENT', 64, 72, { size: 15, rgb: '30,30,32', a: 0.9 }, 1, 'ink'); hud(ctx, `ALT ${Math.max(0, Math.round(120 * (1 - (t - 97.73) / 3))).toString().padStart(3, '0')} M`, 64, 98, { size: 13, rgb: '30,30,32', a: 0.8 }, 1, 'ink'); } },
  ];
}
