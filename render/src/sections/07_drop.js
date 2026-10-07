// SECTION 7 · DROP — 122.77–189.86 — GOLD paper, glowing (instrumental, erhu lead). No lyrics: data type, counters,
// the call delay, the family chat, the livestream delay. K-pop cutting: every 2 beats in A (the speed-build) and E (the
// toast), every bar in B (the work) and C (the calls), one crew portrait per beat in the 7.C4 run.
import { hud, kf, ph, bump, smooth, clamp } from './_lib.js';
import { CREW, CELLS, crewCell } from './05_interlude.js';

export const range = [122.77, 189.86];

// ---- overlays pinned to a painting -----------------------------------------------------------------------------
// the plate's image-uv → design-px map at local time lt (same maths as scenes/plate.js plateMap; overlay shots use
// dolly 0 and par 0 so the map is exact). Keyframes here are 2752×1536 unless given.
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
function pmap(o, lt, dur, W = 2752, H = 1536, rect = [0, 0, 1920, 1080]) {
  const u = ease(lt / dur), a = o.from, b = o.to || o.from;
  const v = [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.zoom + (b.zoom - a.zoom) * u];
  const ar = W / H, rar = rect[2] / rect[3], span = ar > rar ? [rar / ar, 1] : [1, ar / rar];
  const half = [span[0] / v[2] * 0.5 + 0.004, span[1] / v[2] * 0.5 + 0.004];
  const c = [clamp(v[0], half[0], 1 - half[0]), clamp(v[1], half[1], 1 - half[1])];
  const ax = rect[2] * v[2] / span[0], ay = rect[3] * v[2] / span[1];
  return { s: ax / W, at: ([x, y]) => [rect[0] + rect[2] * 0.5 + (x - c[0]) * ax, rect[1] + rect[3] * 0.5 + (y - c[1]) * ay],
    px: ([x, y]) => [rect[0] + rect[2] * 0.5 + (x / W - c[0]) * ax, rect[1] + rect[3] * 0.5 + (y / H - c[1]) * ay] };
}
// a plain plate (no depth tricks) so overlays stay pinned
const flat = (img, from, to, o = {}) => ({ name: 'plate', params: { img, grade: 'native', from, to, dolly: 0, ...o } });

// 7.B4 — Kenji's film-strip dipoles, traced from K_7.B4 (image px), each unrolling from the rover
const STRIPS = [
  [[930, 1135], [800, 1125], [600, 1110], [400, 1095], [270, 1080], [215, 1060], [190, 1020], [220, 985], [300, 965], [400, 955], [550, 962], [650, 955], [750, 935], [812, 898], [828, 872], [812, 838], [780, 820], [700, 808], [600, 797], [500, 781], [440, 748], [405, 712]],
  [[1130, 853], [1000, 845], [900, 830], [800, 800], [720, 775], [660, 745], [620, 718]],
  [[1125, 918], [1000, 895], [900, 875], [800, 840], [700, 790], [620, 740], [575, 700], [540, 656]],
  [[1380, 885], [1500, 905], [1650, 915], [1750, 905], [1850, 885], [1900, 860], [1912, 848], [1893, 853]],
  [[1380, 963], [1500, 985], [1650, 1000], [1800, 1008], [1950, 1012], [2100, 1022], [2250, 1018], [2350, 1000], [2405, 982], [2412, 960], [2428, 952], [2452, 968]],
  [[1420, 1165], [1550, 1178], [1700, 1186], [1800, 1190], [1950, 1200], [2100, 1204], [2200, 1194], [2280, 1170], [2302, 1150], [2280, 1140], [2200, 1146], [2100, 1162], [2000, 1186], [1950, 1212], [1940, 1240]],
];
function polyLen(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; }
// the sub-path of P (screen px) from arclength a to b
function subPath(g, P, L, a, b) {
  g.beginPath(); let started = false;
  for (let i = 1; i < P.length; i++) {
    const l0 = L[i - 1], l1 = L[i]; if (l1 < a || l0 > b) continue;
    const f0 = clamp((a - l0) / (l1 - l0 || 1)), f1 = clamp((b - l0) / (l1 - l0 || 1));
    const p0 = [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f0, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f0];
    const p1 = [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f1, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f1];
    if (!started) { g.moveTo(p0[0], p0[1]); started = true; }
    g.lineTo(p1[0], p1[1]);
  }
}
function pointAt(P, L, a) {
  for (let i = 1; i < P.length; i++) if (L[i] >= a) { const f = (a - L[i - 1]) / (L[i] - L[i - 1] || 1); return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f]; }
  return P[P.length - 1];
}
function strips(ctx, M, lt) {
  const S = STRIPS.map((P) => P.map(M.px)), Ls = S.map(polyLen);
  const prog = S.map((P, i) => { const L = Ls[i][Ls[i].length - 1]; const u = smooth(0.12 + i * 0.07, 1.25 + i * 0.05, lt); return L * (1 - Math.pow(1 - u, 1.6)); });
  // the painted strips not yet unrolled sink back into the dark floor
  ctx.pipe.layer((g) => {
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = 'rgb(62,60,62)'; g.lineWidth = 10 * M.s + 3; g.filter = 'blur(1.5px)';
    S.forEach((P, i) => { const L = Ls[i]; if (prog[i] < L[L.length - 1] - 2) { subPath(g, P, L, prog[i] + 6, L[L.length - 1] + 20); g.stroke(); } });
  }, { mode: 'ink', opacity: 0.7, seed: 781 });
  // the deployed film: 泥金 line, with a lamp-glint running at each unrolling head
  ctx.pipe.layer((g) => {
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = 'rgb(255,226,170)'; g.lineWidth = 3.2;
    S.forEach((P, i) => { if (prog[i] > 1) { subPath(g, P, Ls[i], 0, prog[i]); g.stroke(); } });
  }, { mode: 'gold', seed: 782 });
  ctx.pipe.layer((g) => {
    g.lineCap = 'round'; g.lineJoin = 'round'; g.filter = 'blur(6px)'; g.strokeStyle = 'rgba(255,176,80,0.5)'; g.lineWidth = 9;
    S.forEach((P, i) => { if (prog[i] > 1) { subPath(g, P, Ls[i], 0, prog[i]); g.stroke(); } });
    g.filter = 'blur(3px)';
    S.forEach((P, i) => {
      const L = Ls[i][Ls[i].length - 1]; if (prog[i] < 2 || prog[i] > L - 1) return;
      const [x, y] = pointAt(P, Ls[i], prog[i]);
      const gr = g.createRadialGradient(x, y, 0, x, y, 16); gr.addColorStop(0, 'rgba(255,240,200,0.95)'); gr.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, 16, 0, Math.PI * 2); g.fill();
    });
  }, { mode: 'screen', seed: 783 });
  return prog.map((p, i) => p / Ls[i][Ls[i].length - 1]);
}
// a small gold spectrogram strip (data type): columns of noise-band energy, the quiet sky
function spectrogram(ctx, x, y, w, h, t, a) {
  if (a <= 0) return;
  ctx.pipe.layer((g) => {
    g.strokeStyle = `rgba(212,168,75,${0.6 * a})`; g.lineWidth = 1; g.strokeRect(x, y, w, h);
    const cols = 64, rows = 12, cw = w / cols, rh = h / rows, head = Math.floor(t * 24);
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const k = head - (cols - c), s = Math.sin(k * 12.9898 + r * 78.233) * 43758.5453, n = s - Math.floor(s);
      const e = n * (0.35 + 0.65 * Math.exp(-r / 5)) * (c > cols - 3 ? 1 : 0.8);
      if (e < 0.42) continue;
      g.fillStyle = `rgba(232,190,110,${(e - 0.42) * 1.6 * a})`; g.fillRect(x + c * cw, y + h - (r + 1) * rh, cw - 0.6, rh - 0.6);
    }
  }, { mode: 'over', seed: 784 });
}

// 7.B6 — the habitat windows in K_7.B6 (image uv, size in image px), lit one by one
const WINDOWS = [[0.5854, 0.5518, 46], [0.7254, 0.5704, 50], [0.4785, 0.4876, 30], [0.4056, 0.5248, 26], [0.6075, 0.516, 24], [0.6814, 0.517, 26],
  [0.6475, 0.5146, 28], [0.5321, 0.5594, 22], [0.4779, 0.553, 20], [0.404, 0.552, 16], [0.4169, 0.5487, 14], [0.4284, 0.5447, 13], [0.3886, 0.5569, 13],
  [0.4636, 0.4874, 14], [0.4739, 0.5521, 14], [0.5261, 0.5561, 12], [0.5856, 0.5505, 16], [0.5894, 0.5491, 16], [0.6258, 0.5421, 14], [0.648, 0.5205, 18],
  [0.6625, 0.5482, 14], [0.6976, 0.5518, 14], [0.6977, 0.5453, 14], [0.7235, 0.591, 14], [0.4316, 0.5444, 10], [0.4078, 0.534, 10]];
// lighting order: from the central node outward (the airlock end last), one per sixteenth note
const WIN_ORDER = WINDOWS.map((w, i) => [Math.abs(w[0] - 0.585) + Math.abs(w[1] - 0.55) * 0.5, i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
function habitatLights(ctx, M, lt, step) {
  const on = (j) => smooth(0, 0.07, lt - 0.05 - WIN_ORDER.indexOf(j) * step);
  // night: the mounds sink into the terrain shadow; only the sunlit upper panels keep their paper white
  ctx.pipe.layer((g) => {
    const gr = g.createLinearGradient(0, 0, 0, 1080);
    gr.addColorStop(0, 'rgb(235,235,240)'); gr.addColorStop(0.27, 'rgb(225,225,232)'); gr.addColorStop(0.42, 'rgb(70,70,80)'); gr.addColorStop(0.6, 'rgb(52,52,60)'); gr.addColorStop(1, 'rgb(40,40,46)');
    g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
    g.filter = 'blur(4px)'; g.fillStyle = 'rgb(28,28,32)';
    WINDOWS.forEach((w, j) => { const [x, y] = M.at(w); const r = w[2] * M.s * 0.75 + 3; g.globalAlpha = 1 - on(j); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
  }, { mode: 'ink', seed: 801 });
  ctx.pipe.layer((g) => {
    WINDOWS.forEach((w, j) => {
      const a = on(j); if (a <= 0) return;
      const [x, y] = M.at(w), r = w[2] * M.s;
      const fl = 0.92 + 0.08 * Math.sin(lt * 23 + j * 1.7) * Math.exp(-(lt - WIN_ORDER.indexOf(j) * step) * 3);
      const R = r * 1.5 + 6, g1 = g.createRadialGradient(x, y, 0, x, y, R);
      g1.addColorStop(0, `rgba(255,170,90,${0.45 * a * fl})`); g1.addColorStop(1, 'rgba(255,140,50,0)');
      g.fillStyle = g1; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(255,205,135,${0.9 * a * fl})`; g.beginPath(); g.ellipse(x, y, r * 0.42 + 1, r * 0.5 + 1, 0, 0, Math.PI * 2); g.fill();
    });
  }, { mode: 'screen', seed: 802 });
  return WINDOWS.reduce((n, w, j) => n + (on(j) > 0.5 ? 1 : 0), 0);
}

// a chat window typed live (mono on indigo): lines [{ who, text, t }] — each line types at ~22 chars/s
function chat(ctx, lines, t, x = 1290, y = 640, w = 560) {
  ctx.pipe.layer((g) => {
    g.fillStyle = 'rgba(8,10,22,0.82)'; g.fillRect(x - 30, y - 70, w, 300);
    g.strokeStyle = 'rgba(212,168,75,0.7)'; g.lineWidth = 1; g.strokeRect(x - 30, y - 70, w, 300);
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

// ---- impacts and the build's line work -------------------------------------------------------------------------
// a downbeat HIT: a bloom of light from the centre (post 'open'), a paper shake (bump ringing + deflection)
const hit = (lt, color = [1.0, 0.86, 0.55]) => ({ open: 0.4 + 0.6 * smooth(0, 0.22, lt), openColor: color,
  bump: 0.032 * Math.exp(-lt / 0.17) * Math.cos(lt * 40), deflect: [960 + 60 * Math.sin(lt * 53), 540 + 40 * Math.cos(lt * 47), 30 * Math.exp(-lt / 0.14), 820] });
// the gold line of a jiehua plan as light: the plan image (pinned with plate map M) keyed to its line (indigo ground →
// black by brightness/contrast), tinted gold, optionally blurred into a halo — composited as screen
function glowLines(ctx, key, M, alpha, blur = 0, feather = false) {
  const img = ctx.assets && ctx.assets[key]; if (!img || alpha <= 0.002) return;
  const [x0, y0] = M.at([0, 0]), [x1, y1] = M.at([1, 1]);
  ctx.pipe.layer((g) => {
    g.filter = `saturate(0) brightness(1.4) contrast(4)${blur ? ` blur(${blur}px)` : ''}`;
    g.drawImage(img, x0, y0, x1 - x0, y1 - y0);
    g.filter = 'none'; g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 1; g.fillStyle = 'rgb(255,196,110)';
    g.globalCompositeOperation = 'multiply'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (feather) { // lose the sheet's edge: keep an inset, soft-edged rectangle
      const w = x1 - x0, h = y1 - y0, m = Math.max(2, 0.06 * Math.min(w, h));
      g.globalCompositeOperation = 'destination-in'; g.filter = `blur(${(m * 0.6).toFixed(1)}px)`; g.fillStyle = '#000'; g.fillRect(x0 + m, y0 + m, w - 2 * m, h - 2 * m); g.filter = 'none';
    }
  }, { mode: 'screen', opacity: alpha, seed: 990 });
}
// the first frames of a hit: a flash of warm light over everything
const flashLight = (ctx, lt, rgb = '255,236,200') => { const a = 0.5 * Math.exp(-lt / 0.06); if (a > 0.01) ctx.pipe.layer((g) => { g.fillStyle = `rgba(${rgb},${a.toFixed(3)})`; g.fillRect(0, 0, 1920, 1080); }, { mode: 'screen', seed: 991 }); };
// jiehua survey line work that grows on every cut of the speed-build: rings, ruled rays with ticks, dimension callouts
const hsh = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const DIMS = ['Ø 60 M', '1.0 KM', 'R 120 M', '2 M SHELL', '18 M', '4 × 8 M', '89.5° S', '+ 3.2 M', 'GRID 10 M', '100 kWe'];
function blueprint(ctx, lt, seed, cx = 960, cy = 600, k = 1, burst = 0) {
  const grow = burst ? 1 : smooth(0, 0.6, lt), a0 = hsh(seed) * Math.PI * 2;
  ctx.pipe.layer((g) => {
    g.lineCap = 'round'; g.strokeStyle = 'rgb(255,226,170)'; g.fillStyle = 'rgb(255,226,170)';
    // survey rings (in the plan's oblique: y squashed)
    [300, 470, 700, 980].forEach((R, i) => {
      const r = R * k, e = smooth(i * 0.08, 0.45 + i * 0.08, burst ? 9 : lt);
      if (e <= 0) return;
      g.globalAlpha = 0.42 - i * 0.07; g.lineWidth = i === 3 ? 0.8 : 1.1; g.setLineDash(i % 2 ? [10, 9] : []);
      g.beginPath(); g.ellipse(cx, cy, r, r * 0.46, 0, a0 + i, a0 + i + Math.PI * 2 * e); g.stroke();
    });
    g.setLineDash([]);
    // ruled rays with ticks
    for (let j = 0; j < 10; j++) {
      const th = a0 + j * Math.PI / 5 + hsh(seed * 7 + j) * 0.2, L = (420 + 600 * hsh(seed * 3 + j)) * k * grow;
      const dx = Math.cos(th), dy = Math.sin(th) * 0.46, r0 = 120 * k;
      g.globalAlpha = 0.34; g.lineWidth = 1;
      g.beginPath(); g.moveTo(cx + dx * r0, cy + dy * r0); g.lineTo(cx + dx * (r0 + L), cy + dy * (r0 + L)); g.stroke();
      for (let d = r0 + 40 * k; d < r0 + L; d += 40 * k) { const px = cx + dx * d, py = cy + dy * d; g.beginPath(); g.moveTo(px - dy * 5, py + dx * 5); g.lineTo(px + dy * 5, py - dx * 5); g.stroke(); }
      // the growing tip glints
      if (!burst && grow < 1) { g.globalAlpha = 0.9; g.beginPath(); g.arc(cx + dx * (r0 + L), cy + dy * (r0 + L), 2.4, 0, Math.PI * 2); g.fill(); }
    }
    // two dimension callouts
    g.font = '12px PlexMonoMedium'; g.letterSpacing = '2px';
    for (let j = 0; j < 2; j++) {
      const e = smooth(0.15 + j * 0.15, 0.55 + j * 0.15, burst ? 9 : lt); if (e <= 0) continue;
      const th = a0 + 0.7 + j * 2.6, R = (560 + j * 260) * k, x0 = cx + Math.cos(th) * R, y0 = cy + Math.sin(th) * R * 0.46, w = 180 * e;
      g.globalAlpha = 0.6; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w, y0); g.moveTo(x0, y0 - 7); g.lineTo(x0, y0 + 7); if (e > 0.98) { g.moveTo(x0 + w, y0 - 7); g.lineTo(x0 + w, y0 + 7); } g.stroke();
      if (e > 0.6) { g.globalAlpha = 0.75 * smooth(0.6, 1, e); g.fillText(DIMS[(seed * 3 + j) % DIMS.length], x0 + 6, y0 - 9); }
    }
    g.globalAlpha = 1;
  }, { mode: 'gold', seed: 700 + seed });
}

// 7.B5 — a boot in 1/6 g kicks regolith: every grain flies a clean parabola and drops dead (no air, no cloud)
const BOOT = { img: 'K_5.1', uv: [0.664, 0.604], from: { x: 0.69, y: 0.54, zoom: 3.4 }, to: { x: 0.69, y: 0.545, zoom: 3.7 } };
function bootDust(ctx, lt, dur) {
  const M = pmap(BOOT, lt, dur), [bx, by] = M.at(BOOT.uv), sc = M.s * 2752 / 1920 / 3.4;
  ctx.pipe.layer((g) => {
    for (let i = 0; i < 220; i++) {
      const r = (k) => hsh(i * 13.7 + k * 3.1);
      const ang = Math.PI * (0.56 + 0.34 * r(1)), v = (180 + 430 * Math.pow(r(2), 0.8)) * sc, t0 = 0.05 + r(3) * 0.4, sz = (1.4 + Math.pow(r(4), 2.2) * 6) * sc;
      const g0 = 210 * sc, s = lt - t0; if (s < 0) continue;
      const vx = Math.cos(ang) * v, vy = Math.sin(ang) * v, land = (18 + 50 * r(5)) * sc;           // lands a little nearer the camera
      const tl = (vy + Math.sqrt(vy * vy + 2 * g0 * land)) / g0, ss = Math.min(s, tl);
      const x = bx + (r(6) - 0.5) * 24 * sc + vx * ss, y = by - (vy * ss - 0.5 * g0 * ss * ss);
      g.globalAlpha = s > tl ? 0.6 : 0.92; g.fillStyle = '#121214';
      g.beginPath(); g.ellipse(x, y, sz, sz * (s > tl ? 0.55 : 0.9), 0, 0, Math.PI * 2); g.fill();
      if (i % 5 === 0) { g.globalAlpha = 0.16; g.lineWidth = 0.8; g.strokeStyle = '#121214'; g.beginPath();
        for (let k = 0; k <= 30; k++) { const q = ss * k / 30; const xx = bx + vx * q, yy = by - (vy * q - 0.5 * g0 * q * q); k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
    }
    g.globalAlpha = 1;
  }, { mode: 'ink', absorb: 0.5, seed: 791 });
}

// 7.E2 opening — the cosmos pull-back (scenes/cosmos.js) magnifies a 400 m/px mosaic for its first ~2 s. Until the
// mosaic is sharp at the current scale, the frame stays on sharp line: the complete gold plan K_7.A at the station,
// and a jiehua graticule round the pole (latitude rings, Shackleton's rim) — then the Moon comes up under it.
// Scale/centre mirror scenes/cosmos.js (km per design px; south pole at 0,0).
const CSCALE = [[181.11, 0.0022], [182.30, 0.035], [183.80, 2.4], [184.60, 14], [185.30, 250]];
function cScale(t) {
  if (t <= CSCALE[0][0]) return CSCALE[0][1];
  for (let i = 1; i < CSCALE.length; i++) { const [t0, s0] = CSCALE[i - 1], [t1, s1] = CSCALE[i]; if (t <= t1) { const u = (t - t0) / (t1 - t0); const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4; return Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * e); } }
  return CSCALE[CSCALE.length - 1][1];
}
const CSTATION = [-38.0, 26.0];
const cCenter = (t) => { const a = smooth(182.0, 184.0, t); return [CSTATION[0] * (1 - a), CSTATION[1] * (1 - a)]; };
function pullbackOpening(ctx, t) {
  const v = 1 - smooth(182.75, 183.45, t); if (v <= 0) return;
  const s = cScale(t), c = cCenter(t), at = ([x, y]) => [960 + (x - c[0]) / s, 540 + (y - c[1]) / s];
  ctx.pipe.layer((g) => { g.fillStyle = 'rgb(22,31,60)'; g.fillRect(0, 0, 1920, 1080); }, { mode: 'over', opacity: 0.96 * v, absorb: 0.35, seed: 980 });
  const [sx, sy] = at(CSTATION), w = 3.6 / s, img = ctx.assets && ctx.assets['K_7.A'];
  if (img && w > 4) {
    const h = w * img.height / img.width, M = { at: ([u, q]) => [sx + (u - 0.5) * w, sy + (q - 0.5) * h] };
    glowLines(ctx, 'K_7.A', M, v, 0, true);
    glowLines(ctx, 'K_7.A', M, 0.5 * v, 4, true);
  }
  // the graticule: range rings round the station, rings of latitude round the pole, and Shackleton's rim (Ø 21 km)
  const [px, py] = at([0, 0]);
  ctx.pipe.layer((g) => {
    g.strokeStyle = 'rgb(255,226,170)'; g.fillStyle = 'rgb(255,226,170)'; g.font = '12px PlexMonoMedium'; g.letterSpacing = '2px';
    [[0.25, '250 M'], [0.5, '500 M'], [1, '1 KM'], [2, '2 KM'], [5, '5 KM'], [10, '10 KM'], [20, '20 KM'], [40, '40 KM']].forEach(([km, lab], i) => {
      const r = km / s; if (r < 20 || r > 2600) return;
      const a = Math.min(1, (r - 20) / 50) * Math.min(1, (2600 - r) / 900);
      g.globalAlpha = 0.75 * a * v; g.lineWidth = 1.2; g.setLineDash(i % 2 ? [4, 6] : []);
      g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 0.8 * a * v; g.fillText(lab, sx + r * 0.71 + 6, sy - r * 0.71 - 4);
    });
    g.setLineDash([]); g.globalAlpha = 1;
  }, { mode: 'gold', seed: 983 });
  ctx.pipe.layer((g) => {
    g.strokeStyle = 'rgb(255,226,170)'; g.fillStyle = 'rgb(255,226,170)'; g.font = '12px PlexMonoMedium'; g.letterSpacing = '2px';
    [[0.5, '89.98° S'], [2, '89.93° S'], [5, '89.8° S'], [10.5, 'SHACKLETON'], [15, '89.5° S'], [30, '89° S'], [60, '88° S'], [150, '85° S'], [300, '80° S']].forEach(([km, lab], i) => {
      const r = km / s; if (r < 24 || r > 4000) return;
      const a = Math.min(1, (r - 24) / 60) * Math.min(1, (4000 - r) / 1500);
      g.globalAlpha = (lab === 'SHACKLETON' ? 0.75 : 0.4) * a * v; g.lineWidth = lab === 'SHACKLETON' ? 1.6 : 1;
      g.setLineDash(lab === 'SHACKLETON' ? [] : [6, 7]); g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.stroke();
      const lx = px + r * Math.cos(-0.5 - i * 0.37), ly = py + r * Math.sin(-0.5 - i * 0.37);
      if (lx > 40 && lx < 1800 && ly > 40 && ly < 1040) { g.globalAlpha = 0.8 * a * v; g.fillText(lab, lx + 8, ly - 6); }
    });
    g.setLineDash([]); g.globalAlpha = 0.7 * v; g.beginPath(); g.moveTo(px - 10, py); g.lineTo(px + 10, py); g.moveTo(px, py - 10); g.lineTo(px, py + 10); g.stroke();
    g.globalAlpha = 1;
  }, { mode: 'gold', seed: 982 });
}

const CAP = { size: 15, rgb: '212,168,75', a: 0.95 };
// a generated take redrawn on our paper (render/src/roto): the clip is only a motion base
const rot = (clip, o = {}) => ({ type: 'roto', clip, ...o });
const cap = (ctx, s, y = 72) => hud(ctx, s, 64, y, CAP, 1);

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const has = (k) => X.has(k);
  const A = (k, o) => (has(k) ? kf(k, o) : null);
  const dayCounter = (ctx, t, a, b, d0, d1, label = 'DAY') => {
    const d = Math.round(d0 + (d1 - d0) * clamp((t - a) / (b - a)));
    hud(ctx, `${label} ${d < 0 ? '−' : ''}${String(Math.abs(d)).padStart(3, '0')}`, 64, 1030, { size: 22, rgb: '255,255,255' }, 1);
  };
  const kick = (lt) => bump(lt, 0.010);
  const plan = (k, from, to, o = {}) => (has(k) ? flat(k, from, to, o) : ph('Guanghan Station speed-build in gold jiehua', k));

  // ---- A · SPEED-BUILD: twelve 2-beat cuts over the gold plan, wide ⇄ punch-in --------------------------------------
  const a = (n, b) => bar(n, b);
  const SA = [a(67), a(67, 3), a(68), a(68, 3), a(69), a(69, 3), a(70), a(70, 3), a(71), a(71, 3), a(72), a(72, 3), a(73)];
  const A0V = { from: { x: 0.5, y: 0.5, zoom: 1.16 }, to: { x: 0.5, y: 0.5, zoom: 1.02 } };
  const HUB = { x: 0.80, y: 0.20, zoom: 3.0 };   // the reactor hub sits on the plate's reveal centre at this framing
  const PAD = { from: { x: 0.17, y: 0.36, zoom: 2.0 }, to: { x: 0.17, y: 0.34, zoom: 2.25 } };
  // the HUD of the build: day counter (bottom-left) and the tonnage ticker (bottom-right), running through all of A
  const buildHud = (ctx, t, d0, d1, i) => {
    dayCounter(ctx, t, SA[i], SA[i + 1], d0, d1);
    const tons = Math.round(48 * Math.pow(clamp((t - SA[1]) / (SA[12] - SA[1])), 1.3) * 1000);
    hud(ctx, `REGOLITH MOVED  ${String(tons).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').padStart(6, ' ')} t`, 1856, 1030, { size: 15, rgb: '212,168,75', a: 0.95, align: 'right' }, 1);
  };
  const A_SHOTS = [
    // the drop downbeat: the whole station plan detonates into glowing gold line in one frame
    { id: '7.A0', grain: 70, post: (t, lt) => hit(lt),
      scene: [has('K_7.A') ? flat('K_7.A', A0V.from, A0V.to, { glow: 1.4 }) : ph('The station plan detonates into gold line', 'K_7.A')],
      type(ctx, t, lt) {
        const M = pmap(A0V, lt, SA[1] - SA[0]);
        flashLight(ctx, lt);
        glowLines(ctx, 'K_7.A', M, 1.0 * Math.exp(-lt / 0.35), 7);      // halo, dying away over the two beats
        glowLines(ctx, 'K_7.A', M, 0.85 * Math.exp(-lt / 0.22), 0);     // the lines themselves white-hot on the hit
        blueprint(ctx, lt, 1, 960, 600, 1.2, 1); hud(ctx, 'GUANGHAN STATION  ·  89.5° S  ·  THE PLAN', 64, 72, CAP, 1); hud(ctx, 'CONSTRUCTION DAY −640  ·  ROBOTIC PRE-BUILD', 64, 1030, { size: 20, rgb: '255,255,255' }, 1); } },
    { id: '7.A1', scene: [plan('K_7.A1', { x: 0.62, y: 0.55, zoom: 1.45 }, { x: 0.6, y: 0.55, zoom: 1.3 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 2, 1010, 650, 1.1); buildHud(ctx, t, -640, -400, 1); cap(ctx, 'SITE SURVEY  ·  RIDGE 89.5° S  ·  SUN 0–1.5°'); } },
    { id: '7.A2', scene: [plan('K_7.A2', { x: 0.6, y: 0.56, zoom: 1.35 }, { x: 0.58, y: 0.55, zoom: 1.45 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 3, 980, 640, 1.0); buildHud(ctx, t, -400, 1, 2); cap(ctx, 'PRESSURE VESSELS LANDED  ·  4 MODULES'); } },
    { id: '7.A2b', scene: [plan('K_7.A2', { x: 0.53, y: 0.6, zoom: 2.3 }, { x: 0.53, y: 0.6, zoom: 2.5 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 4, 940, 560, 1.4); buildHud(ctx, t, 1, 23, 3); cap(ctx, 'REGOLITH PRINTER  ·  SHIELD SHELL 2 M  ·  ONE COURSE PER SOL'); } },
    // the reactor, fins still folded → the next kick fans them open
    { id: '7.A3', scene: [plan('K_7.A2', HUB, { ...HUB, zoom: 3.1 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 5, 960, 600, 0.9); buildHud(ctx, t, 23, 34, 4); cap(ctx, 'FISSION SURFACE POWER  ·  100 kWe  ·  PRE-CRITICAL'); hud(ctx, 'ADAEZE OKAFOR  ·  1.0 KM OUT', 64, 98, { size: 13, rgb: '240,232,214' }, 1); } },
    { id: '7.A3b', post: (t, lt) => bump(lt, 0.02),
      scene: [plan('K_7.A2', { ...HUB, zoom: 3.1 }, { ...HUB, zoom: 3.15 }, { opacity: (t, lt) => 1 - smooth(0.04, 0.42, lt) }),
        plan('K_7.A3', { ...HUB, zoom: 3.1 }, { ...HUB, zoom: 2.9 }, { reveal: (t, lt) => smooth(0.0, 0.62, lt) * 1.5, glow: 0.8 })],
      type(ctx, t, lt) { buildHud(ctx, t, 34, 45, 5); cap(ctx, 'RADIATOR FINS DEPLOYED  ·  12 PANELS'); hud(ctx, 'ADAEZE OKAFOR  ·  1.0 KM OUT', 64, 98, { size: 13, rgb: '240,232,214' }, 1); } },
    { id: '7.A3c', scene: [plan('K_7.A3', { x: 0.55, y: 0.48, zoom: 1.25 }, { x: 0.5, y: 0.5, zoom: 1.08 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 7, 980, 620, 1.0); buildHud(ctx, t, 45, 53, 6); cap(ctx, 'POWER ON THE GRID  ·  1.0 KM CABLE'); } },
    { id: '7.A3d', scene: [plan('K_7.A3', { x: 0.5, y: 0.62, zoom: 2.2 }, { x: 0.5, y: 0.6, zoom: 2.45 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 8, 960, 560, 1.4); buildHud(ctx, t, 53, 61, 7); cap(ctx, 'HABITAT RING  ·  PRESSURISED  ·  101 kPa'); } },
    { id: '7.A4', scene: [plan('K_7.A4', { x: 0.5, y: 0.5, zoom: 1.1 }, { x: 0.48, y: 0.48, zoom: 1.2 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 9, 960, 640, 1.0); buildHud(ctx, t, 61, 70, 8); cap(ctx, 'LANDING PAD  ·  SINTERED  ·  LASER PASS'); } },
    // the pad glazes under the laser, line by line
    { id: '7.A4b', scene: [plan('K_7.A4', PAD.from, PAD.to)],
      type(ctx, t, lt) {
        const M = pmap(PAD, lt, SA[10] - SA[9]), c = M.at([0.165, 0.315]), rx = 0.087 * 2752 * M.s, ry = 0.08 * 1536 * M.s;
        const sweep = smooth(0.05, 0.85, lt), yy = c[1] - ry + 2 * ry * sweep, src = M.at([0.128, 0.262]);
        ctx.pipe.layer((g) => {
          g.save(); g.beginPath(); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI * 2); g.clip();
          const gl = g.createLinearGradient(0, yy - 60, 0, yy + 4); gl.addColorStop(0, 'rgba(255,190,90,0)'); gl.addColorStop(0.85, 'rgba(255,200,110,0.35)'); gl.addColorStop(1, 'rgba(255,245,215,0.95)');
          g.fillStyle = gl; g.fillRect(c[0] - rx, yy - 60, 2 * rx, 64);
          g.fillStyle = 'rgba(255,200,120,0.10)'; g.fillRect(c[0] - rx, c[1] - ry, 2 * rx, yy - (c[1] - ry));
          g.restore();
          const hx = c[0] - rx * 0.9 + (2 * rx * 0.9) * (0.5 + 0.5 * Math.sin(lt * 21));
          g.strokeStyle = 'rgba(255,236,190,0.9)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(src[0], src[1]); g.lineTo(hx, yy); g.stroke();
          g.filter = 'blur(5px)'; g.fillStyle = 'rgba(255,220,150,0.9)'; g.beginPath(); g.arc(hx, yy, 9, 0, Math.PI * 2); g.fill();
        }, { mode: 'screen', seed: 741 });
        blueprint(ctx, lt, 10, c[0], c[1], rx / 236);
        buildHud(ctx, t, 70, 79, 9); cap(ctx, 'LANDING PAD  ·  ⌀ 60 M  ·  REGOLITH SINTERED AT 1100 °C');
      } },
    { id: '7.A4c', scene: [plan('K_7.A4', { x: 0.62, y: 0.42, zoom: 1.75 }, { x: 0.6, y: 0.44, zoom: 1.95 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 11, 900, 700, 1.2); buildHud(ctx, t, 79, 88, 10); cap(ctx, 'SOLAR MASTS  ·  18 M  ·  TRACKING THE SUN AROUND THE HORIZON'); } },
    { id: '7.A4d', scene: [plan('K_7.A4', { x: 0.5, y: 0.52, zoom: 1.3 }, { x: 0.5, y: 0.5, zoom: 1.0 })],
      type(ctx, t, lt) { blueprint(ctx, lt, 12, 960, 640, 1.0); buildHud(ctx, t, 88, 97, 11); cap(ctx, 'GUANGHAN STATION  ·  89.5° S  ·  READY FOR CREW'); } },
  ].map((s, i) => ({ paper: 'indigo', grain: 71 + i, post: (t, lt) => kick(lt), ...s, t0: SA[i], t1: SA[i + 1] }));

  // ---- B · THE WORK — one crew member per bar ------------------------------------------------------------------
  const T = { B1: bar(73), B2: bar(74), B3: bar(75), B4: bar(76), B5: bar(77), B6: 143.43, C2: bar(81), C3: bar(82) };
  const B4V = { from: { x: 0.5, y: 0.56, zoom: 1.0 }, to: { x: 0.5, y: 0.57, zoom: 1.06 } };
  const B6V = { from: { x: 0.56, y: 0.5, zoom: 1.45 }, to: { x: 0.565, y: 0.5, zoom: 1.6 } };
  const BEAT = (bar(81) - bar(80)) / 4;
  const B_SHOTS = [
    { id: '7.B1', t0: T.B1, t1: T.B2, paper: 'indigo', grain: 75, flash: true, focus: [700, 560],
      scene: [has('K_7.B1') ? rot('K_7.B1/take_1', { paper: 'silk', offset: 0.6, lock: 0.3, from: { x: 0.42, y: 0.55, zoom: 1.08 }, to: { x: 0.40, y: 0.57, zoom: 1.2 } }) : ph('Arjun drills into a permanently shadowed crater', 'K_7.B1')],
      type(ctx) { cap(ctx, 'ARJUN RAMAN  ·  PSR  ·  H₂O ICE 5.6 ± 2.9 wt%'); } },
    { id: '7.B2', t0: T.B2, t1: T.B3, paper: 'indigo', grain: 76, post: (t, lt) => kick(lt),
      scene: [has('K_7.B2') ? rot('K_7.B2/take_1', { paper: 'silk', offset: 0.2, lock: 0.6, glow: 0.5, from: { x: 0.55, y: 0.5, zoom: 1.04 }, to: { x: 0.6, y: 0.48, zoom: 1.16 } }) : ph('Jade at the ISRU reactor; molten regolith glows', 'K_7.B2')],
      type(ctx) { cap(ctx, 'JADE WANG  ·  ISRU  ·  MOLTEN REGOLITH ELECTROLYSIS  ·  O₂ 1.0 kg/hr'); } },
    { id: '7.B3', t0: T.B3, t1: T.B4, paper: 'indigo', grain: 77, post: (t, lt) => kick(lt), focus: [720, 600],
      scene: [has('K_7.B3') ? rot('K_7.B3/take_2', { paper: 'silk', offset: 0.5, lock: 0.6, from: { x: 0.42, y: 0.55, zoom: 1.1 }, to: { x: 0.44, y: 0.58, zoom: 1.24 } }) : ph('Lúcia: a purple-tinged rosette in a sealed growth chamber', 'K_7.B3', { dark: true })],
      type(ctx) { cap(ctx, 'LÚCIA FERREIRA  ·  ARABIDOPSIS IN LUNAR REGOLITH  ·  FIRST ROSETTE'); } },
    { id: '7.B4', t0: T.B4, t1: T.B5, paper: 'indigo', grain: 78, post: (t, lt) => kick(lt), focus: [900, 700],
      scene: [has('K_7.B4') ? flat('K_7.B4', B4V.from, B4V.to) : ph('Kenji’s radio array unrolls across the floor of Shackleton', 'K_7.B4', { dark: true })],
      type(ctx, t, lt) {
        if (has('K_7.B4')) strips(ctx, pmap(B4V, lt, T.B5 - T.B4), lt);
        cap(ctx, 'KENJI MORI  ·  FILM-DIPOLE ARRAY  ·  4 × 100 M  ·  1–50 MHz');
        hud(ctx, 'NO SUN  ·  NO EARTH  ·  THE QUIETEST SKY IN REACH', 64, 98, { size: 13, rgb: '240,232,214' }, 1);
        spectrogram(ctx, 64, 118, 300, 44, t, smooth(1.0, 1.4, lt));
      } },
    { id: '7.B5', t0: T.B5, t1: T.B6, paper: 'xuan', grain: 79, focus: [760, 620], post: (t, lt) => kick(lt),
      scene: [has(BOOT.img) ? flat(BOOT.img, BOOT.from, BOOT.to) : { name: 'dust', params: {} }],
      type(ctx, t, lt) {
        if (has(BOOT.img)) bootDust(ctx, lt, T.B6 - T.B5); hud(ctx, '1.62 m/s²  ·  NO AIR  ·  NO CLOUD', 64, 72, { size: 15, rgb: '30,30,32', a: 0.85 }, 1, 'ink'); } },
    { id: '7.B6', t0: T.B6, t1: T.C2, paper: 'xuan', grain: 80, flash: true, post: (t, lt) => bump(lt, 0.012), focus: [1050, 560],
      scene: [has('K_7.B6') ? flat('K_7.B6', B6V.from, B6V.to) : has('K_1.5') ? kf('K_1.5', { flicker: 1.6, from: { x: 0.5, y: 0.55, zoom: 1.1 }, to: { x: 0.5, y: 0.5, zoom: 1.2 } }) : ph('The habitat lights come on, window by window', 'K_7.B6')],
      type(ctx, t, lt) {
        const n = has('K_7.B6') ? habitatLights(ctx, pmap(B6V, lt, T.C2 - T.B6), lt, BEAT / 4) : WINDOWS.length;
        hud(ctx, `HABITAT  ·  LIGHTS ${String(n).padStart(2, '0')} / ${WINDOWS.length}`, 64, 72, { size: 15, rgb: '240,214,170', a: 0.95 }, 1);
      } },
  ];

  // ---- C · THE CALLS ------------------------------------------------------------------------------------------
  // 7.C4 alone-with-tablet: one crew portrait per beat over bars 83–84 (the kicks)
  const CELL_TAKE = ['take_2', 'take_2', 'take_2', 'take_3', 'take_2', 'take_2', 'take_2', 'take_2']; // media/gen/picks.json
  const grid = [];
  for (let i = 0; i < 8; i++) {
    const a0 = bar(83 + Math.floor(i / 4), (i % 4) + 1), b0 = i < 7 ? bar(83 + Math.floor((i + 1) / 4), ((i + 1) % 4) + 1) : bar(85);
    grid.push({ id: `7.C4${'abcdefgh'[i]}`, t0: a0, t1: b0, paper: 'indigo', grain: 740 + i, focus: [1250, 520],
      scene: [(has(`K_7.C4_${CELLS[i]}`) ? rot(`K_7.C4_${CELLS[i]}/${CELL_TAKE[i]}`, { paper: 'silk', offset: 1.2, lock: 0.12, from: { x: 0.5, y: 0.5, zoom: 1.0 }, to: { x: 0.5, y: 0.5, zoom: 1.1 } }) : null) || crewCell(X, i, 1.0, 1.1) || ph(CREW[i][0], 'K_7.C4_grid')],
      type(ctx) { hud(ctx, `${CREW[i][0]}  ·  HOME  ·  ${CREW[i][3]}`, 64, 72, { size: 15, rgb: '212,168,75', a: 0.95 }, 1); } });
  }
  // 7.C5 sharing: four separate moments (K_7.C4a–d, each in its own room, mid-action), two beats each over bars 85–86
  const GROUP = has('K_7.C4') ? 'K_7.C4' : 'K_7.C4_v3';
  const pairs = ['a', 'b', 'c', 'd'].map((k, i) => {
    const a0 = bar(85 + Math.floor(i / 2), (i % 2) * 2 + 1), b0 = i < 3 ? bar(85 + Math.floor((i + 1) / 2), ((i + 1) % 2) * 2 + 1) : 158.5;
    const img = [`K_7.C4${k}`, `K_7.C4${k}_v4`].find(has);
    const push = [[{ x: 0.5, y: 0.5, zoom: 1.04 }, { x: 0.52, y: 0.47, zoom: 1.12 }], [{ x: 0.52, y: 0.48, zoom: 1.12 }, { x: 0.5, y: 0.5, zoom: 1.04 }],
      [{ x: 0.46, y: 0.5, zoom: 1.04 }, { x: 0.44, y: 0.48, zoom: 1.12 }], [{ x: 0.5, y: 0.46, zoom: 1.1 }, { x: 0.5, y: 0.5, zoom: 1.03 }]][i];
    return { id: `7.C5${k}`, t0: a0, t1: b0, paper: 'indigo', grain: 750 + i, post: (t, lt) => kick(lt),
      scene: [img ? kf(img, { from: push[0], to: push[1] }) : has(GROUP) ? kf(GROUP, { from: { x: 0.5, y: 0.5, zoom: 1.05 }, to: { x: 0.5, y: 0.5, zoom: 1.1 } }) : ph('Two crew share a home clip on a tablet', `K_7.C4${k}`)] };
  });
  // 7.C1 — the call home (bass out 158.5): Earth SILK | Moon GOLD, the words crossing the seam at the speed of light
  const C1 = 158.5, C6 = bar(88);
  const callShot = { id: '7.C1', t0: C1, t1: C6, paper: 'silk', grain: 81,
    scene: [has('K_7.C1_earth') ? { name: 'plate', params: { img: 'K_7.C1_earth', grade: 'native', rect: [0, 0, 960, 1080], from: { x: 0.47, y: 0.42, zoom: 1.08 }, to: { x: 0.48, y: 0.42, zoom: 1.14 } } } : ph('Earth side: M mid-sentence at the laptop', 'K_7.C1_earth'),
      has('K_7.C1_moon') ? { name: 'plate', params: { img: 'K_7.C1_moon', grade: 'native', rect: [960, 0, 960, 1080], from: { x: 0.46, y: 0.5, zoom: 1.12 }, to: { x: 0.47, y: 0.52, zoom: 1.2 } } } : ph('Moon side: Jade at the galley table', 'K_7.C1_moon'),
      { name: 'seam', params: {} }],
    type(ctx, t, lt) {
      // one way 1.28 s: the packet leaves M's laptop, crosses the seam, reaches Jade's screen
      const u = clamp((lt - 0.08) / 1.28), x0 = 560, y0 = 470, x1 = 1560, y1 = 480;
      const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 90;
      const fade = u < 1 ? 1 : Math.max(0, 1 - (lt - 1.36) * 2.5);
      if (lt > 0.08) ctx.pipe.layer((g) => {
        // the words travel as a gold trajectory line (the film's Earth→Moon line, 1.1), head first
        g.lineCap = 'round'; g.strokeStyle = `rgba(214,170,80,${0.9 * fade})`; g.lineWidth = 2.4; g.beginPath();
        for (let k = 0; k <= 40; k++) { const uu = u * k / 40; const xx = x0 + (x1 - x0) * uu, yy = y0 + (y1 - y0) * uu - Math.sin(uu * Math.PI) * 90; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
        g.stroke();
        if (u < 1) { g.filter = 'blur(3px)'; g.fillStyle = 'rgba(255,214,140,0.95)'; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill();
          g.filter = 'none'; g.fillStyle = 'rgba(255,248,230,1)'; g.beginPath(); g.arc(x, y, 3.5, 0, Math.PI * 2); g.fill(); }
        else { const r = 10 + (lt - 1.36) * 120; g.strokeStyle = `rgba(255,214,140,${0.9 * fade})`; g.lineWidth = 2; g.beginPath(); g.arc(x1, y1, r, 0, Math.PI * 2); g.stroke(); }
      }, { mode: 'over', seed: 811 });
      const rt = clamp(lt / 3.1);
      hud(ctx, `AUSTIN → GUANGHAN  ${Math.min(1.28, Math.max(0, lt - 0.08)).toFixed(2)} s`, 64, 72, { size: 15, rgb: '120,40,30', a: 0.9 }, 1, 'ink');
      hud(ctx, `RTT 3.1 s (light 2.6)  ·  ${'▮'.repeat(Math.floor(rt * 12)).padEnd(12, '·')}`, 1024, 72, { size: 15, rgb: '212,168,75', a: 0.95 }, 1);
    } };
  const C_SHOTS = [
    { id: '7.C2', t0: T.C2, t1: T.C3, paper: 'silk', grain: 82, flash: true, focus: [760, 600], scene: [has('K_7.C2') ? rot('K_7.C2/take_6', { paper: 'silk', offset: 2.0, lock: 0.25, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.46, y: 0.52, zoom: 1.12 } }) : ph('Kenton teaches T DDR; M dances with a robot dog', 'K_7.C2')],
      type(ctx) { hud(ctx, 'AUSTIN  ·  21:40 CDT', 64, 72, { size: 15, rgb: '110,40,30', a: 0.85 }, 1, 'ink'); } },
    { id: '7.C3', t0: T.C3, t1: bar(83), paper: 'silk', grain: 83, post: (t, lt) => kick(lt), focus: [700, 760], scene: [has('K_7.C3') ? rot('K_7.C3/take_3', { paper: 'silk', offset: 0.6, lock: 0.3, from: { x: 0.4, y: 0.55, zoom: 1.1 }, to: { x: 0.36, y: 0.58, zoom: 1.22 } }) : ph('M on the sofa with the cat, watching a music video on a tablet', 'K_7.C3')] },
    ...grid,
    ...pairs,
    callShot,
    { id: '7.C6', t0: C6, t1: bar(89), paper: 'indigo', grain: 84, focus: [900, 520],
      scene: [has('K_7.C6') ? rot('K_7.C6/take_1', { paper: 'silk', offset: 0.3, lock: 0.6, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.52, y: 0.5, zoom: 1.1 } }) : ph('Jade alone at the small window; the tea cup on the sill reflects Earth', 'K_7.C6', { dark: true })],
      type(ctx, t) { hud(ctx, 'DAY 312', 64, 1030, { size: 22, rgb: '255,255,255' }, 1); chat(ctx, [{ who: 'jade', text: 'just 3 more months 🌏', t: C6 + 0.05 }, { who: 't', text: 'ok', t: C6 + 0.85 }, { who: 'm', text: '🐰🌕', t: C6 + 1.25 }], t); } },
  ];

  // ---- D · TWO CHANG'ES (vocalise 163.5–169.8) — five framings, each distinct ----------------------------------------
  const D = { D1: bar(89), D2: bar(90), D3: 164.5, D3b: bar(92), D3c: bar(93), D3d: bar(94), D4: 173.0, E1: bar(97) };
  const D_SHOTS = [
    // 1 · the stage, wide: M rises on her wires toward the paper moon
    { id: '7.D1', t0: D.D1, t1: D.D2, paper: 'silk', grain: 91, post: (t, lt) => hit(lt, [1.0, 0.95, 0.85]), type(ctx, t, lt) { flashLight(ctx, lt, '255,246,225'); },
      scene: [has('K_7.D1') ? { type: 'roto', clip: 'K_7.D1/take_2', paper: 'silk', offset: 0.4, lock: 0.35, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.52, y: 0.47, zoom: 1.1 } } : ph('School play: M as Chang’e on wires', 'K_7.D1')] },
    // 2 · over Jade's shoulder: the livestream, her hand begins to rise to the glass
    { id: '7.D2', t0: D.D2, t1: D.D3, paper: 'indigo', grain: 92,
      scene: [has('J_7.D2') ? { type: 'roto', clip: 'J_7.D2/take_2', paper: 'gold', offset: 0, lock: 0.3, glow: 0.35, from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.49, y: 0.5, zoom: 1.06 } } : ph('Jade watches the livestream, hand to the glass', 'J_7.D2')],
      type(ctx) { hud(ctx, 'LIVE  −7 s', 64, 72, { size: 16, rgb: '232,72,52', a: 0.95 }, 1); } },
    // 3 · the held C#5: match cut, same reach, two moons — SILK left | GOLD right
    { id: '7.D3', t0: D.D3, t1: D.D3b, paper: 'silk', grain: 93,
      scene: [has('K_7.D1') ? { name: 'plate', params: { img: 'K_7.D1', grade: 'native', rect: [0, 0, 960, 1080], from: { x: 0.47, y: 0.38, zoom: 1.0 }, to: { x: 0.5, y: 0.34, zoom: 1.12 } } } : ph('Split: M reaches the paper moon', 'K_7.D1'),
        has('J_7.D2') ? { name: 'plate', params: { img: 'J_7.D2', grade: 'native', rect: [960, 0, 960, 1080], from: { x: 0.63, y: 0.44, zoom: 1.0 }, to: { x: 0.62, y: 0.42, zoom: 1.1 } } } : ph('Split: Jade touches the screen', 'J_7.D2'),
        { name: 'seam', params: {} }] },
    // 4 · close: M's hand meets the paper moon
    { id: '7.D3b', t0: D.D3b, t1: D.D3c, paper: 'silk', grain: 94, scene: [A('K_7.D1', { from: { x: 0.6, y: 0.24, zoom: 2.0 }, to: { x: 0.64, y: 0.2, zoom: 2.3 }, flutter: [3, 2.6], glow: 0.9, masks: { base: [0.2, 0.4] } }) || ph('M’s hand meets the paper moon', 'K_7.D1')] },
    // 5 · close: Jade's palm reaches the little gold Chang'e on the glass (the take's later hand slide)
    { id: '7.D3c', t0: D.D3c, t1: D.D3d, paper: 'indigo', grain: 95,
      scene: [has('J_7.D2') ? { type: 'roto', clip: 'J_7.D2/take_2', paper: 'gold', offset: 2.2, lock: 0.3, glow: 0.45, from: { x: 0.44, y: 0.48, zoom: 1.7 }, to: { x: 0.45, y: 0.46, zoom: 1.85 } } : ph('Jade’s palm on the glass', 'J_7.D2')],
      type(ctx) { hud(ctx, 'LIVE  −7 s', 64, 72, { size: 16, rgb: '232,72,52', a: 0.95 }, 1); } },
    // 6 · wide: the lonely room — the little stage glowing on the far wall, Jade standing before it
    { id: '7.D3d', t0: D.D3d, t1: D.D4, paper: 'indigo', grain: 96, focus: [1050, 470],
      scene: [(has('K_7.D2_room') ? rot('K_7.D2_room/take_2', { paper: 'silk', offset: 1.0, lock: 0.6, glow: 0.6, from: { x: 0.5, y: 0.5, zoom: 1.14 }, to: { x: 0.5, y: 0.48, zoom: 1.03 } }) : null) || A(GROUP, { from: { x: 0.5, y: 0.55, zoom: 1.12 }, to: { x: 0.5, y: 0.5, zoom: 1.04 }, dolly: -0.04 }) || ph('Jade alone with the livestream', 'K_7.D2_room')] },
    // bass out: M bows; the theatre claps
    { id: '7.D4', t0: D.D4, t1: D.E1, paper: 'silk', grain: 97, scene: [A('K_7.D4', { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.46, zoom: 1.04 }, glow: 1.2, dolly: -0.04, masks: { base: [0.2, 0.4], polys: [{ pts: [[0, 0.82], [1, 0.82], [1, 1], [0, 1]], depth: 1.0, blur: 8 }] } }) || ph('Bass out: the theatre claps silently', 'K_7.D4')] },
  ];

  // ---- E · THE TOAST: 2-beat cuts in the observation dome, then one continuous pull-back --------------------------
  const SE = [bar(97), bar(97, 3), bar(98, 3), bar(100)];
  // the toast runs on one continuous take across the three framings
  const dome = (from, to, i) => (has('K_7.E1') ? rot('K_7.E1/take_1', { paper: 'silk', offset: SE[i] - SE[0] + 0.3, lock: i ? 0 : 0.4, from, to }) : null) || ph('The observation dome: the crew raise cups to Earth', 'K_7.E1', { dark: true });
  const E_SHOTS = [
    { id: '7.E1', post: (t, lt) => hit(lt, [0.85, 0.92, 1.0]), type(ctx, t, lt) { flashLight(ctx, lt, '225,236,255'); }, scene: [dome({ x: 0.5, y: 0.5, zoom: 1.03 }, { x: 0.5, y: 0.47, zoom: 1.1 }, 0)] },
    // Earth between two raised cups: push in over the bar
    { id: '7.E1b', scene: [dome({ x: 0.5, y: 0.43, zoom: 2.0 }, { x: 0.5, y: 0.43, zoom: 2.6 }, 1)] },
    // and out: the whole dome, then the continuous pull-back takes over (7.E2)
    { id: '7.E1c', scene: [dome({ x: 0.5, y: 0.44, zoom: 1.6 }, { x: 0.5, y: 0.5, zoom: 1.0 }, 2)] },
  ].map((s, i) => ({ paper: 'indigo', grain: 97 + i * 0.1, post: (t, lt) => kick(lt), ...s, t0: SE[i], t1: SE[i + 1] }));

  return [
    ...A_SHOTS, ...B_SHOTS, ...C_SHOTS, ...D_SHOTS, ...E_SHOTS,
    // 7.E2–E3 — one continuous pull-back (scenes/cosmos.js): station → ridge → pole → the Moon → Earth & Moon to scale
    //            → the pale blue dot in a sunbeam; hard cut at 189.86
    { id: '7.E2', t0: bar(100), t1: bar(103), paper: 'indigo', grain: 98, needs: ['pole', 'K_7.A1', 'K_7.A', 'K04earth'], scene: [{ name: 'cosmos', params: {} }],
      type(ctx, t) { pullbackOpening(ctx, t); } },
    { id: '7.E3', t0: bar(103), t1: bar(105), paper: 'indigo', grain: 98, needs: ['pole', 'K04earth'], scene: [{ name: 'cosmos', params: {} }] },
  ];
}
