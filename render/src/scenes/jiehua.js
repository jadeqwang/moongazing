// 界画 jiehua in 泥金 gold ink on 磁青 indigo: ruled-line drawings that are also engineering drawings.
//   rocketPad — 1.2: the launch tower, the rocket, lightning masts + catenaries, floodlight masts and their rays,
//               the pad and a band of 海水纹 scallop waves; every line is laid down with a ruler, in build order.
//   trajectory — 1.1: Earth (the only colour), a parking orbit, and the gold translunar line looping round the Moon.
import { clamp, smooth, easeOutCubic, mulberry32 } from '../util.js';

// ---- line list helpers ---------------------------------------------------------------------------------------
class Drawing {
  constructor() { this.items = []; }
  line(x1, y1, x2, y2, t0, d, w = 1.4, a = 1) { this.items.push({ k: 'l', x1, y1, x2, y2, t0, d, w, a }); }
  poly(pts, t0, d, w = 1.4, a = 1, closed = false) { // drawn progressively along its length
    let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (closed) L += Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]);
    this.items.push({ k: 'p', pts: closed ? [...pts, pts[0]] : pts, L, t0, d, w, a });
  }
  ray(x1, y1, x2, y2, t0, d, w = 0.7, a = 0.5) { this.items.push({ k: 'r', x1, y1, x2, y2, t0, d, w, a }); }
  draw(g, t) {
    g.lineCap = 'butt'; g.lineJoin = 'miter';
    for (const it of this.items) {
      const u = easeOutCubic(clamp((t - it.t0) / it.d));
      if (u <= 0) continue;
      g.lineWidth = it.w;
      if (it.k === 'l') {
        g.strokeStyle = `rgba(255,255,255,${it.a})`;
        g.beginPath(); g.moveTo(it.x1, it.y1); g.lineTo(it.x1 + (it.x2 - it.x1) * u, it.y1 + (it.y2 - it.y1) * u); g.stroke();
      } else if (it.k === 'r') {
        const ex = it.x1 + (it.x2 - it.x1) * u, ey = it.y1 + (it.y2 - it.y1) * u;
        const gr = g.createLinearGradient(it.x1, it.y1, it.x2, it.y2);
        gr.addColorStop(0, `rgba(255,255,255,${it.a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.strokeStyle = gr; g.beginPath(); g.moveTo(it.x1, it.y1); g.lineTo(ex, ey); g.stroke();
      } else {
        g.strokeStyle = `rgba(255,255,255,${it.a})`;
        let rem = it.L * u;
        g.beginPath(); g.moveTo(it.pts[0][0], it.pts[0][1]);
        for (let i = 1; i < it.pts.length && rem > 0; i++) {
          const [ax, ay] = it.pts[i - 1], [bx, by] = it.pts[i];
          const sl = Math.hypot(bx - ax, by - ay);
          if (sl <= rem) { g.lineTo(bx, by); rem -= sl; } else { const f = rem / sl; g.lineTo(ax + (bx - ax) * f, ay + (by - ay) * f); rem = 0; }
        }
        g.stroke();
      }
    }
  }
}

function buildRocketPad() {
  const D = new Drawing();
  const GY = 850;                          // ground / horizon
  // ground & horizon
  D.line(0, GY, 1920, GY, 0.0, 0.40, 1.3, 0.9);
  [[872, 0.85], [893, 0.7], [921, 0.6], [958, 0.5], [1006, 0.42], [1066, 0.35]].forEach(([y, a], i) => {
    D.line(i % 2 ? 1920 : 0, y, i % 2 ? 0 : 1920, y, 0.05 + i * 0.05, 0.55, 0.7, a * 0.6);
  });
  // pad deck + flame trench
  D.poly([[1000, GY], [1000, GY + 20], [1480, GY + 20], [1480, GY]], 0.15, 0.5, 1.2);
  D.poly([[1205, GY + 20], [1180, GY + 62], [1300, GY + 62], [1275, GY + 20]], 0.35, 0.45, 1.0);
  for (let x = 1010; x < 1475; x += 15) D.line(x, GY + 4, x, GY + 16, 0.4 + (x - 1010) / 2000, 0.25, 0.6, 0.55);
  // ---- launch tower: front face + receding face (oblique, jiehua style)
  const TX0 = 1048, TX1 = 1144, TTOP = 196, ox = 26, oy = -15;
  const cols = [TX0, TX0 + 32, TX0 + 64, TX1];
  cols.forEach((x, i) => D.line(x, GY, x, TTOP, 0.05 + i * 0.04, 0.75, i % 3 === 0 ? 1.7 : 1.0));
  D.line(TX1 + ox, GY + oy, TX1 + ox, TTOP + oy, 0.2, 0.75, 1.2, 0.8);
  const floors = []; for (let y = GY - 40; y > TTOP; y -= 40) floors.push(y); floors.push(TTOP);
  floors.forEach((y, i) => {
    const t0 = 0.30 + i * 0.045;
    D.line(TX0, y, TX1, y, t0, 0.22, 1.1);
    D.line(TX1, y, TX1 + ox, y + oy, t0 + 0.1, 0.15, 0.9, 0.8);
  });
  // X-bracing in every bay (front) and single diagonals on the receding face
  const ys = [GY, ...floors];
  for (let i = 0; i < ys.length - 1; i++) {
    const y0 = ys[i], y1 = ys[i + 1], t0 = 0.62 + i * 0.05;
    for (let c = 0; c < cols.length - 1; c++) {
      D.line(cols[c], y0, cols[c + 1], y1, t0 + c * 0.03, 0.22, 0.65, 0.75);
      D.line(cols[c + 1], y0, cols[c], y1, t0 + c * 0.03 + 0.05, 0.22, 0.65, 0.75);
    }
    D.line(TX1, y0, TX1 + ox, y1 + oy, t0 + 0.12, 0.2, 0.6, 0.6);
  }
  // tower crown: lightning rod + hammerhead crane
  D.line((TX0 + TX1) / 2, TTOP, (TX0 + TX1) / 2, TTOP - 58, 1.0, 0.35, 1.0);
  D.poly([[TX0 - 30, TTOP - 22], [TX1 + 60, TTOP - 22], [TX1 + 60, TTOP - 12], [TX0 - 30, TTOP - 12]], 1.05, 0.4, 0.9, 0.9, true);
  for (let x = TX0 - 30; x < TX1 + 60; x += 12) D.line(x, TTOP - 22, x + 6, TTOP - 12, 1.25 + (x - TX0) / 900, 0.15, 0.5, 0.6);
  // ---- the rocket
  const RX = 1240, CW = 56, cl = RX - CW / 2, cr = RX + CW / 2;
  const R = (t0) => t0 + 0.0;
  D.poly([[cl, GY - 12], [cl, 430], [cr, 430], [cr, GY - 12]], R(0.25), 0.9, 1.6);
  [560, 690, 760, 500, 455].forEach((y, i) => D.line(cl, y, cr, y, 0.95 + i * 0.06, 0.25, i < 1 ? 1.2 : 0.7, i < 1 ? 1 : 0.75)); // stage + tank seams
  // fairing + capsule
  const fw = 62;
  D.poly([[RX - CW / 2, 430], [RX - fw / 2, 418], [RX - fw / 2, 352], [RX - fw / 2 + 4, 330], [RX - 10, 300], [RX, 296], [RX + 10, 300], [RX + fw / 2 - 4, 330], [RX + fw / 2, 352], [RX + fw / 2, 418], [RX + CW / 2, 430]], 0.7, 0.75, 1.5);
  D.line(RX - fw / 2, 380, RX + fw / 2, 380, 1.2, 0.2, 0.7, 0.8);
  // escape tower
  D.line(RX, 296, RX, 226, 1.1, 0.35, 1.2);
  D.poly([[RX - 7, 262], [RX - 4, 240], [RX + 4, 240], [RX + 7, 262]], 1.3, 0.25, 0.9, 0.9, true);
  D.line(RX - 10, 296, RX - 4, 262, 1.35, 0.2, 0.7, 0.8); D.line(RX + 10, 296, RX + 4, 262, 1.35, 0.2, 0.7, 0.8);
  // side boosters with conical noses
  for (const s of [-1, 1]) {
    const bx = RX + s * (CW / 2 + 22), bw = 38, l = bx - bw / 2, r = bx + bw / 2;
    D.poly([[l, GY - 12], [l, 612], [bx - 6, 568], [bx, 562], [bx + 6, 568], [r, 612], [r, GY - 12]], 0.45 + (s > 0 ? 0.08 : 0), 0.8, 1.3);
    [700, 780].forEach((y, i) => D.line(l, y, r, y, 1.05 + i * 0.07, 0.2, 0.6, 0.7));
    D.line(s < 0 ? r : l, 640, s < 0 ? cl : cr, 650, 1.3, 0.15, 0.6, 0.7); // strut
    // nozzles
    D.poly([[l + 4, GY - 12], [l + 1, GY], [r - 1, GY], [r - 4, GY - 12]], 1.2, 0.2, 0.8);
  }
  D.poly([[cl + 6, GY - 12], [cl + 2, GY], [cr - 2, GY], [cr - 6, GY - 12]], 1.2, 0.2, 0.9);
  // ---- swing arms from the tower to the rocket
  for (const [y, t0] of [[366, 1.25], [520, 1.35], [650, 1.42]]) {
    const xr = y < 430 ? RX - fw / 2 : cl;
    D.line(TX1, y, xr, y, t0, 0.3, 1.1); D.line(TX1, y + 10, xr, y + 10, t0 + 0.04, 0.3, 1.1);
    for (let x = TX1; x < xr - 6; x += 10) D.line(x, y + 10, x + 10, y, t0 + 0.2 + (x - TX1) / 700, 0.1, 0.5, 0.7);
  }
  // ---- lightning masts + catenary wires
  const masts = [[870, 150], [1620, 160]];
  masts.forEach(([x, top], i) => {
    D.line(x, GY, x, top, 0.4 + i * 0.08, 0.7, 1.1);
    D.line(x - 9, GY, x, top + 70, 0.55 + i * 0.08, 0.6, 0.6, 0.6); D.line(x + 9, GY, x, top + 70, 0.55 + i * 0.08, 0.6, 0.6, 0.6);
  });
  const cat = (x1, y1, x2, y2, sag, t0) => { const pts = []; for (let k = 0; k <= 40; k++) { const u = k / 40; pts.push([x1 + (x2 - x1) * u, y1 + (y2 - y1) * u + sag * 4 * u * (1 - u)]); } D.poly(pts, t0, 0.55, 0.7, 0.75); };
  cat(870, 150, (TX0 + TX1) / 2, TTOP - 58, 52, 1.25);
  cat((TX0 + TX1) / 2, TTOP - 58, 1620, 160, 70, 1.38);
  cat(870, 150, 600, GY, -40, 1.5); cat(1620, 160, 1900, GY - 40, -40, 1.55);
  // ---- floodlight masts, lamp heads, and rays converging on the rocket
  const lights = [[770, 470, 1], [1820, 430, -1]];
  lights.forEach(([x, top, dir], i) => {
    const t0 = 0.5 + i * 0.1;
    D.line(x - 7, GY, x - 3, top, t0, 0.6, 1.0); D.line(x + 7, GY, x + 3, top, t0, 0.6, 1.0);
    for (let y = GY - 30; y > top; y -= 30) D.line(x - 7 + (GY - y) / (GY - top) * 4, y, x + 7 - (GY - y) / (GY - top) * 4, y, t0 + 0.4 + (GY - y) / 2000, 0.12, 0.6, 0.7);
    // lamp head: 3x2 grid
    const hx = x - 24, hy = top - 26;
    D.poly([[hx, hy], [hx + 48, hy], [hx + 48, hy + 26], [hx, hy + 26]], t0 + 0.55, 0.3, 1.0, 1, true);
    D.line(hx + 16, hy, hx + 16, hy + 26, t0 + 0.7, 0.15, 0.7); D.line(hx + 32, hy, hx + 32, hy + 26, t0 + 0.7, 0.15, 0.7);
    D.line(hx, hy + 13, hx + 48, hy + 13, t0 + 0.72, 0.15, 0.7);
    // rays (fine ruled lines, fading with distance — light, not glow)
    const r = mulberry32(31 + i);
    for (let k = 0; k < 15; k++) {
      const tx = RX + (r() - 0.5) * 260, ty = 300 + r() * 520;
      const sx = hx + 24 + (r() - 0.5) * 30, sy = hy + 13 + (r() - 0.5) * 16;
      D.ray(sx, sy, sx + (tx - sx) * 0.92, sy + (ty - sy) * 0.92, 1.45 + k * 0.045, 0.85, 0.6, 0.38);
    }
  });
  // ---- 海水纹: rows of scallop waves to the left and right of the pad
  const waveRows = [[886, 9, 0.5], [904, 11, 0.45], [928, 13, 0.4], [960, 16, 0.36], [1000, 19, 0.32], [1050, 23, 0.28]];
  waveRows.forEach(([y, r, a], ri) => {
    for (const [xa, xb] of [[0, 940], [1540, 1920]]) {
      const pts = []; const off = (ri % 2) * r;
      for (let x = xa - off; x < xb; x += r * 2) {
        for (let k = 0; k <= 8; k++) { const ang = Math.PI + (k / 8) * Math.PI; pts.push([x + r + Math.cos(ang) * r, y + Math.sin(ang) * r * 0.55]); }
      }
      D.poly(pts.filter((p) => p[0] >= xa - 1 && p[0] <= xb + 1), 0.8 + ri * 0.12, 1.3, 0.6, a);
    }
  });
  return D;
}

export const rocketPad = {
  init() { this.D = buildRocketPad(); },
  draw(ctx, shot, t, lt) {
    const sp = (shot.params && shot.params.speed) || 1, off = (shot.params && shot.params.offset) || 0;
    lt = off + lt * sp;
    ctx.pipe.layer((g) => { g.translate(shot.params.shiftX || 0, 0); this.D.draw(g, lt); }, { mode: 'gold', seed: 7 });
    // the agency seal on the fairing: one fleck of vermilion with a pale blue dot
    const a = smooth(1.5, 1.9, lt);
    if (a > 0) ctx.pipe.layer((g) => {
      g.translate(shot.params.shiftX || 0, 0); g.globalAlpha = a; g.fillStyle = '#B9372C'; g.fillRect(1240 - 7, 388, 14, 14);
      g.fillStyle = '#9CC3DD'; g.beginPath(); g.arc(1240, 395, 2.6, 0, Math.PI * 2); g.fill();
    }, { mode: 'over' });
  },
};

// ---- 1.1 trajectory --------------------------------------------------------------------------------------------
export function earthDisc(g, x, y, r, seed = 3) {
  // a small 青绿 Earth: azurite ocean, malachite land, white cloud — painted, not photographic
  g.save();
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
  g.fillStyle = '#2F6690'; g.fillRect(x - r, y - r, r * 2, r * 2);
  const rnd = mulberry32(seed);
  g.fillStyle = '#3A8A6E';
  for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(x + (rnd() - 0.5) * r * 1.4, y + (rnd() - 0.5) * r * 1.2, r * (0.15 + rnd() * 0.3), r * (0.1 + rnd() * 0.25), rnd() * 3, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(236,232,222,0.85)';
  for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(x + (rnd() - 0.5) * r * 1.6, y + (rnd() - 0.5) * r * 1.6, r * (0.2 + rnd() * 0.35), r * (0.04 + rnd() * 0.06), rnd() * 0.6 - 0.3, 0, Math.PI * 2); g.fill(); }
  // night side (sun from the right): soft terminator
  const gr = g.createLinearGradient(x - r, y, x + r, y);
  gr.addColorStop(0, 'rgba(10,14,30,0.75)'); gr.addColorStop(0.45, 'rgba(10,14,30,0.25)'); gr.addColorStop(0.6, 'rgba(10,14,30,0)');
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  g.restore();
}

export const trajectory = {
  init() {
    // Earth bottom-left, Moon top-right (placed by the shot), a translunar arc that swings behind the Moon
    const E = { x: 360, y: 790, r: 34 }, M = { x: 1470, y: 330, R: 118 };
    const pts = [];
    // parking orbit departure (from the bottom of the orbit, prograde)
    for (let k = 0; k <= 30; k++) { const a = Math.PI * 0.5 - (k / 30) * Math.PI * 0.55; pts.push([E.x + Math.cos(a) * 54, E.y + Math.sin(a) * 54]); }
    // translunar coast: a long, slowly bending ellipse arc
    const [sx, sy] = pts[pts.length - 1];
    const ex = M.x - M.R * 1.05, ey = M.y + M.R * 1.05;
    for (let k = 1; k <= 120; k++) {
      const u = k / 120, m = 1 - u;
      const c1 = [sx + 330, sy - 10], c2 = [ex - 330, ey + 170];
      pts.push([m * m * m * sx + 3 * m * m * u * c1[0] + 3 * m * u * u * c2[0] + u * u * u * ex, m * m * m * sy + 3 * m * m * u * c1[1] + 3 * m * u * u * c2[1] + u * u * u * ey]);
    }
    // swing around the far side of the Moon (free-return figure-eight)
    const a0 = Math.atan2(ey - M.y, ex - M.x);
    for (let k = 1; k <= 70; k++) { const a = a0 - (k / 70) * Math.PI * 1.25; const rr = M.R * (1.48 - 0.18 * Math.sin((k / 70) * Math.PI)); pts.push([M.x + Math.cos(a) * rr, M.y + Math.sin(a) * rr]); }
    let L = 0; const S = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); S.push(L); }
    Object.assign(this, { E, M, pts, S, L });
  },
  draw(ctx, shot, t, lt) {
    const { E, M, pts, S, L } = this;
    const dur = shot.t1 - shot.t0;
    const p = smooth(0.25, dur - 0.05, lt);
    const prog = p * p * (3 - 2 * p) * 0.6 + p * 0.4;
    // Earth: the only colour
    ctx.pipe.layer((g) => { g.globalAlpha = smooth(0.05, 0.45, lt); earthDisc(g, E.x, E.y, E.r); }, { mode: 'over' });
    ctx.pipe.layer((g) => {
      const al = smooth(0.1, 0.5, lt);
      // parking orbit, dashed
      g.strokeStyle = `rgba(255,255,255,${0.55 * al})`; g.lineWidth = 0.8; g.setLineDash([3, 5]);
      g.beginPath(); g.arc(E.x, E.y, 54, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      // the trajectory
      const lim = prog * L;
      g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 1.5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      let head = pts[0];
      for (let i = 1; i < pts.length; i++) { if (S[i] > lim) { const f = (lim - S[i - 1]) / (S[i] - S[i - 1]); head = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; g.lineTo(...head); break; } g.lineTo(pts[i][0], pts[i][1]); head = pts[i]; }
      g.stroke();
      // hour ticks
      g.lineWidth = 0.8;
      for (let s = 40, k = 0; s < lim; s += 34, k++) {
        let i = 1; while (i < pts.length && S[i] < s) i++;
        if (i >= pts.length) break;
        const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], dl = Math.hypot(dx, dy) || 1;
        const tl = k % 5 === 0 ? 7 : 3.5;
        g.beginPath(); g.moveTo(pts[i][0] - dy / dl * tl, pts[i][1] + dx / dl * tl); g.lineTo(pts[i][0] + dy / dl * tl, pts[i][1] - dx / dl * tl); g.stroke();
      }
      // the craft: a small solid point
      if (prog > 0.002 && prog < 0.999) { g.fillStyle = '#fff'; g.beginPath(); g.arc(head[0], head[1], 2.6, 0, Math.PI * 2); g.fill(); }
      // ruled registration: a hairline frame, as on a sutra frontispiece
      const fa = smooth(0.0, 0.6, lt) * 0.5;
      g.strokeStyle = `rgba(255,255,255,${fa})`; g.lineWidth = 0.8;
      g.strokeRect(96, 84, 1728, 912); g.strokeRect(104, 92, 1712, 896);
    }, { mode: 'gold', seed: 9 });
    // labels
    ctx.pipe.layer((g) => {
      const a = smooth(0.35, 0.8, lt) * 0.8;
      ctx.type.hud(g, 'EARTH', E.x - 25, E.y + 88, { size: 13, color: `rgba(212,168,75,${a})` });
      const b = smooth(dur - 0.7, dur - 0.2, lt) * 0.8;
      ctx.type.hud(g, 'MOON  ·  384 400 KM', M.x - 92, M.y + M.R + 92, { size: 13, color: `rgba(212,168,75,${b})` });
    }, { mode: 'over' });
  },
};
