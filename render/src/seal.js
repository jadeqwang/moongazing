// Vermilion seal (印章), carved stone, procedural.
//   makeSeal(kit, { size, style: 'baiwen' | 'zhuwen' | 'dot', chars, font, seed })  -> impression bitmap
//   drawStamp(g, seal, { x, y, t, tLand, rot })  -> draws the stamp animation; returns post params (deflection)
// The impression lands EXACTLY on tLand (a beat time from beatgrid.json): before it, only the stone's shadow and an
// out-of-focus ghost descend (scale-down + slight rotation); at tLand the paste prints, then spreads into the paper.
import { makeCanvas, mulberry32, vnoise, clamp, hash2, fbm } from './util.js';

const VERMILION = [200, 49, 43];

export function makeSeal(kit, o) {
  o = { style: 'baiwen', size: 200, font: 'MaShanZheng', seed: 5, chars: ['望', '明', '月'], ...o };
  const S = kit.S;
  const D = Math.ceil(o.size * S), DH = Math.ceil(o.size * (o.aspect || 1) * S), M = Math.ceil(D * 0.08); // margin for chips / spread
  const W = D + M * 2, WH = DH + M * 2;
  const rnd = mulberry32(o.seed);
  // --- 1. stone outline: square, slightly irregular, chipped
  const shape = makeCanvas(W, WH); const sg = shape.getContext('2d');
  sg.fillStyle = '#fff';
  sg.beginPath();
  const per = 2 * D + 2 * DH, steps = 500;
  for (let k = 0; k <= steps; k++) {
    const s = (k / steps) * per;
    let x, y, nx, ny;
    if (s < D) { x = s; y = 0; nx = 0; ny = -1; }
    else if (s < D + DH) { x = D; y = s - D; nx = 1; ny = 0; }
    else if (s < 2 * D + DH) { x = 2 * D + DH - s; y = DH; nx = 0; ny = 1; }
    else { x = 0; y = per - s; nx = -1; ny = 0; }
    const wob = (vnoise(s * 0.02 / S, 3.1, o.seed) - 0.5) * D * 0.012 + (vnoise(s * 0.12 / S, 7.7, o.seed) - 0.5) * D * 0.005;
    const xx = M + x + nx * wob, yy = M + y + ny * wob;
    if (k === 0) sg.moveTo(xx, yy); else sg.lineTo(xx, yy);
  }
  sg.closePath(); sg.fill();
  // chips: bites out of the edge, one bigger corner chip
  sg.globalCompositeOperation = 'destination-out';
  const chip = (cx, cy, r) => {
    sg.beginPath();
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; const rr = r * (0.6 + 0.6 * rnd()); sg.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    sg.closePath(); sg.fill();
  };
  for (let i = 0; i < 9; i++) {
    const side = Math.floor(rnd() * 4), u = 0.08 + rnd() * 0.84, r = D * (0.008 + rnd() * rnd() * 0.03);
    const p = [[u * D, 0], [D, u * DH], [u * D, DH], [0, u * DH]][side];
    chip(M + p[0], M + p[1], r);
  }
  const cc = Math.floor(rnd() * 4); const cp = [[0, 0], [D, 0], [D, DH], [0, DH]][cc];
  chip(M + cp[0], M + cp[1], D * 0.045);
  sg.globalCompositeOperation = 'source-over';

  // --- 2. carving
  const carve = makeCanvas(W, WH); const cg = carve.getContext('2d');
  cg.fillStyle = '#fff';
  const inner = D * (o.style === 'zhuwen' ? 0.80 : 0.84), ox = M + (D - inner) / 2, oy = M + (D - inner) / 2;
  const glyph = (ch, x, y, w, h) => { // stretch the glyph's ink box to fill the cell (seal characters fill their space)
    const t = makeCanvas(512, 512); const tg = t.getContext('2d', { willReadFrequently: true });
    tg.font = `400 400px ${o.font}`; tg.textAlign = 'center'; tg.textBaseline = 'middle'; tg.fillStyle = '#fff';
    tg.fillText(ch, 256, 270);
    const d = tg.getImageData(0, 0, 512, 512).data;
    let x0 = 512, y0 = 512, x1 = 0, y1 = 0;
    for (let j = 0; j < 512; j++) for (let i = 0; i < 512; i++) if (d[(j * 512 + i) * 4 + 3] > 40) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); }
    cg.drawImage(t, x0, y0, x1 - x0 + 1, y1 - y0 + 1, x, y, w, h);
  };
  if (o.aspect && o.aspect > 1.5) { // tall seal (长方印): characters stacked top→bottom, each in a square cell
    const n = o.chars.length, g = D * 0.05, iw = D * 0.80, x0 = M + (D - iw) / 2;
    const ih = DH - (D - iw), y0 = M + (D - iw) / 2, ch = (ih - g * (n - 1)) / n;
    o.chars.forEach((c, k) => glyph(c, x0, y0 + k * (ch + g), iw, ch));
  } else if (o.style === 'dot') {
    cg.beginPath(); cg.arc(M + D / 2, M + D / 2, D * 0.25, 0, Math.PI * 2); cg.fill();
  } else {
    const g = D * 0.045; // gutter between characters
    const n = o.chars.length;
    if (n === 3) { // right column: first char, full height; left column: two stacked (read right→left, top→bottom)
      const cw = (inner - g) / 2;
      glyph(o.chars[0], ox + cw + g, oy, cw, inner);
      glyph(o.chars[1], ox, oy, cw, (inner - g) / 2);
      glyph(o.chars[2], ox, oy + (inner + g) / 2, cw, (inner - g) / 2);
    } else if (n === 4) {
      const cw = (inner - g) / 2;
      glyph(o.chars[0], ox + cw + g, oy, cw, cw); glyph(o.chars[1], ox + cw + g, oy + cw + g, cw, cw);
      glyph(o.chars[2], ox, oy, cw, cw); glyph(o.chars[3], ox, oy + cw + g, cw, cw);
    } else if (n === 2) {
      const cw = (inner - g) / 2;
      glyph(o.chars[0], ox + cw + g, oy, cw, inner); glyph(o.chars[1], ox, oy, cw, inner);
    } else glyph(o.chars[0], ox, oy, inner, inner);
  }
  // --- 3. combine with stone texture: the knife leaves slightly rough edges; paste prints unevenly
  const sd = sg.getImageData(0, 0, W, WH).data, kd = cg.getImageData(0, 0, W, WH).data;
  const out = makeCanvas(W, WH); const og = out.getContext('2d');
  const im = og.createImageData(W, WH); const od = im.data;
  for (let y = 0; y < WH; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const X = x / S, Y = y / S;
    const rough = (vnoise(X * 0.35, Y * 0.35, o.seed + 1) - 0.5) * 0.5 + (hash2(x, y, o.seed) - 0.5) * 0.25;
    const carved = clamp((kd[i + 3] / 255 - 0.5 + rough * 0.6) * 4 + 0.5);
    let paper = sd[i + 3] / 255;
    let ink;
    if (o.style === 'zhuwen') { // red characters + red frame, blank ground
      const fr = D * 0.035, bx = x - M, by = y - M;
      const inFrame = bx > -2 && by > -2 && bx < D + 2 && by < DH + 2 && (bx < fr || by < fr || bx > D - fr || by > DH - fr);
      ink = Math.max(carved, inFrame ? 1 : 0) * paper;
    } else ink = paper * (1 - carved);
    // paste: uneven pressure (broad), dropouts (fine), heavier at the edges of the stone
    const press = fbm(X * 0.012, Y * 0.012, 3, o.seed + 4);
    const drop = vnoise(X * 0.55, Y * 0.55, o.seed + 6) * 0.7 + hash2(x, y, o.seed + 2) * 0.3;
    const thr = 0.80 - 0.30 * (press - 0.5);
    let a = ink * (drop > thr ? 0.25 + 0.5 * (1 - (drop - thr) / (1 - thr)) : 1);
    a *= 0.84 + 0.22 * press;
    const heavy = clamp((press - 0.45) * 2.5);
    od[i] = Math.round(VERMILION[0] - 26 * heavy + 10 * (1 - a));
    od[i + 1] = Math.round(VERMILION[1] - 14 * heavy + 18 * (1 - a));
    od[i + 2] = Math.round(VERMILION[2] - 10 * heavy + 12 * (1 - a));
    od[i + 3] = Math.round(clamp(a) * 255);
  }
  og.putImageData(im, 0, 0);
  // spread version: the paste wicking into the fibres
  const spread = makeCanvas(W, WH); const pg = spread.getContext('2d');
  pg.filter = `blur(${(1.4 * S).toFixed(2)}px)`; pg.drawImage(out, 0, 0);
  const ghost = makeCanvas(W, WH); const gg = ghost.getContext('2d');
  gg.filter = `blur(${(6 * S).toFixed(2)}px)`; gg.drawImage(shape, 0, 0);
  return { canvas: out, spread, ghost, shape, size: o.size, sizeD: (W / S), sizeH: (WH / S), style: o.style };
}

// stamp motion. returns { deflect:[x,y,amp,radius], bump } for the post pass (paper deflection on impact)
export function drawStamp(g, seal, { x, y, t, tLand, rot = -0.03, approach = 0.16, show = 1 }) {
  const dt = t - tLand, half = seal.sizeD / 2, halfH = seal.sizeH / 2;
  const res = { deflect: [x, y, 0, seal.size * 1.1 * Math.sqrt(seal.sizeH / seal.sizeD)], bump: 0 };
  if (dt < -approach || show <= 0) return res;
  g.save();
  g.translate(x, y);
  if (dt < 0) {
    const u = 1 + dt / approach;               // 0 -> 1 as the stone comes down
    const e = u * u;
    const sc = 1 + 0.38 * (1 - e);
    // shadow of the stone on the paper (light from upper-left), sharpening as it nears
    g.save();
    g.globalAlpha = 0.04 + 0.12 * e;
    g.translate(10 * (1 - e) + 3, 12 * (1 - e) + 3);
    g.rotate(rot + 0.05 * (1 - e));
    g.scale(sc * 1.02, sc * 1.02);
    g.globalCompositeOperation = 'multiply';
    g.filter = 'brightness(0)';
    g.drawImage(seal.ghost, -half, -halfH, seal.sizeD, seal.sizeH);
    g.restore();
    // out-of-focus ghost of the inked face
    g.globalAlpha = 0.10 + 0.35 * e;
    g.rotate(rot + 0.05 * (1 - e)); g.scale(sc, sc);
    g.drawImage(seal.spread, -half, -halfH, seal.sizeD, seal.sizeH);
    g.restore();
    return res;
  }
  const settle = 1 + 0.018 * Math.exp(-dt / 0.045);
  g.rotate(rot); g.scale(settle, settle);
  // paste spreading into the paper (under), then the crisp print
  const sp = clamp(dt / 0.5);
  g.globalAlpha = 0.18 + 0.30 * sp * show;
  g.drawImage(seal.spread, -half, -halfH, seal.sizeD, seal.sizeH);
  g.globalAlpha = show;
  g.drawImage(seal.canvas, -half, -halfH, seal.sizeD, seal.sizeH);
  g.restore();
  // paper deflection: a damped spring, strongest on contact
  res.deflect[2] = 7 * Math.exp(-dt / 0.07) * Math.cos(dt * 2 * Math.PI * 7);
  res.bump = 0.006 * Math.exp(-dt / 0.08);
  return res;
}
