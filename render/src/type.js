// Typography system.
//  (a) InkText  — Chinese calligraphy revealed by an animated dry-brush mask: columns right→left, each column
//                 top→bottom, a little left→right inside each character; bristle streaks at the leading edge,
//                 ink bleed into the paper after the brush passes, pooled edges + granulation (paper absorption).
//  (b) seals    — see seal.js
//  (c) Card     — English display serif, quiet and letter-spaced; brush-wipe / fade in, faint ink bleed.
//  (d) hud()    — IBM Plex Mono labels.
// All drawing is in DESIGN px (1920x1080); bitmaps are built at device resolution (S = H/1080).
import { makeCanvas, mulberry32, vnoise, clamp, smooth, hash2 } from './util.js';

export const FONTS = {
  MaShanZheng: 'fonts/MaShanZheng-Regular.ttf',
  ZhiMangXing: 'fonts/ZhiMangXing-Regular.ttf',
  LiuJianMaoCao: 'fonts/LiuJianMaoCao-Regular.ttf',
  NotoSerifSC: ['fonts/NotoSerifSC-VF.ttf', { weight: '200 900' }],
  Cormorant: ['fonts/CormorantGaramond-VF.ttf', { weight: '300 700' }],
  CormorantItalic: ['fonts/CormorantGaramond-Italic-VF.ttf', { weight: '300 700', style: 'normal' }],
  NotoSerifDisplay: ['fonts/NotoSerifDisplay-VF.ttf', { weight: '100 900' }],
  PlexMono: 'fonts/IBMPlexMono-Regular.ttf',
  PlexMonoMedium: 'fonts/IBMPlexMono-Medium.ttf',
};

export async function loadFonts() {
  await Promise.all(Object.entries(FONTS).map(async ([fam, v]) => {
    const [url, desc] = Array.isArray(v) ? v : [v, {}];
    const ff = new FontFace(fam, `url(${url})`, desc);
    await ff.load();
    document.fonts.add(ff);
  }));
  await document.fonts.ready;
}

// ---------------------------------------------------------------------------------------------------------------
// (a) calligraphy reveal
export class InkText {
  // opts: text, font, size (design px per char), x, y (top-right corner of the first column), vertical (default true),
  //       lead (char advance, x size), colGap, perCol (chars per column), color [r,g,b] 0..1, seed, weight
  constructor(kit, o) {
    this.kit = kit; this.o = o = { vertical: true, lead: 1.04, colGap: 1.25, color: [0.07, 0.07, 0.085], seed: 1, bleed: 1.0, ...o };
    const S = kit.S;
    const chars = [...o.text];
    const perCol = o.perCol || chars.length;
    const ncol = Math.ceil(chars.length / perCol);
    const sz = o.size;
    const pad = Math.ceil(sz * 0.25);
    const wD = o.vertical ? ncol * sz * o.colGap - (o.colGap - 1) * sz + pad * 2 : chars.length * sz * o.lead + pad * 2;
    const hD = o.vertical ? perCol * sz * o.lead + pad * 2 : sz * 1.3 + pad * 2;
    this.box = { x: o.vertical ? o.x - wD + pad : o.x - pad, y: o.y - pad, w: wD, h: hD };
    const W = Math.ceil(wD * S), H = Math.ceil(hD * S);
    const c = makeCanvas(W, H); const g = c.getContext('2d', { willReadFrequently: true });
    g.scale(S, S);
    g.fillStyle = '#fff'; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
    g.font = `${o.weight || 400} ${sz}px ${o.font}`;
    const cells = [];
    chars.forEach((ch, k) => {
      const col = Math.floor(k / perCol), row = k % perCol;
      let cx, cy;
      if (o.vertical) { cx = wD - pad - sz / 2 - col * sz * o.colGap; cy = pad + row * sz * o.lead; }
      else { cx = pad + k * sz * o.lead + sz / 2; cy = pad; }
      const m = g.measureText(ch);
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      // centre the ink of the glyph vertically in its cell
      const by = cy + sz / 2 + (asc - desc) / 2;
      g.fillText(ch, cx + (o.jitter ? (hash2(k, 3, o.seed) - 0.5) * sz * o.jitter : 0), by);
      cells.push({ x0: cx - sz / 2, y0: cy, x1: cx + sz / 2, y1: cy + sz, k });
    });
    const A = g.getImageData(0, 0, W, H).data;
    const N = W * H;
    const a = new Float32Array(N);
    for (let i = 0; i < N; i++) a[i] = A[i * 4 + 3] / 255;
    // reveal time per pixel: char index + position within the char (top->bottom dominant, slight left->right)
    const rv = new Float32Array(N).fill(1e9);
    const streak = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; const X = x / S, Y = y / S;
      // nearest cell
      let best = null, bd = 1e9;
      for (const cl of cells) {
        const dx = Math.max(cl.x0 - X, 0, X - cl.x1), dy = Math.max(cl.y0 - Y, 0, Y - cl.y1);
        const d = dx + dy; if (d < bd) { bd = d; best = cl; }
      }
      const xn = clamp((X - best.x0) / sz), yn = clamp((Y - best.y0) / sz);
      const wob = (vnoise(X * 0.05, Y * 0.012, o.seed) - 0.5) * 0.10;
      rv[i] = best.k + clamp(0.80 * yn + 0.20 * xn + wob, 0, 1) * 0.92;
      // bristle streaks run along the stroke direction (mostly vertical): high freq across x, low along y
      streak[i] = vnoise(X * 0.9, Y * 0.035, o.seed + 7) * 0.65 + vnoise(X * 2.3, Y * 0.08, o.seed + 9) * 0.35;
    }
    // blurred coverage (for bleed) — two box passes
    const ab = blur(a, W, H, Math.max(1, Math.round(1.6 * S)));
    const ab2 = blur(ab, W, H, Math.max(1, Math.round(1.6 * S)));
    // reveal time diffused outward so bleed pixels inherit the time of the stroke next to them
    const num = new Float32Array(N), den = new Float32Array(N);
    for (let i = 0; i < N; i++) { num[i] = a[i] * (rv[i] < 1e8 ? rv[i] : 0); den[i] = a[i]; }
    const nb = blur(blur(num, W, H, Math.round(3 * S)), W, H, Math.round(3 * S)), db = blur(blur(den, W, H, Math.round(3 * S)), W, H, Math.round(3 * S));
    const rvb = new Float32Array(N);
    for (let i = 0; i < N; i++) rvb[i] = db[i] > 1e-4 ? nb[i] / db[i] : rv[i];
    const gran = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) gran[y * W + x] = vnoise(x / S * 0.8, y / S * 0.8, o.seed + 3) * 0.6 + hash2(x, y, o.seed) * 0.4;
    Object.assign(this, { W, H, a, ab: ab2, rv, rvb, streak, gran, n: chars.length, canvas: makeCanvas(W, H) });
    this.cg = this.canvas.getContext('2d');
    this.img = this.cg.createImageData(W, H);
  }
  // p: reveal progress in characters (0..n). bleed: 0..1 how far ink has crept into the paper. alpha: overall
  render(p, bleed = 1, alpha = 1) {
    const { W, H, a, ab, rv, rvb, streak, gran, img } = this;
    const d = img.data; const [r, g, b] = this.o.color;
    const R = Math.round(r * 255), G = Math.round(g * 255), B = Math.round(b * 255);
    const FRONT = 0.16; // width of the dry leading edge, in characters
    for (let i = 0, N = W * H; i < N; i++) {
      const cov = a[i], cb = ab[i];
      if (cb < 0.004 && cov < 0.004) { d[i * 4 + 3] = 0; continue; }
      // brush front
      const q = (p - rv[i]) / FRONT;            // >1 fully painted, 0..1 dry leading edge
      let reveal = 0;
      if (q >= 1) reveal = 1;
      else if (q > 0) reveal = clamp((q * 1.25 - streak[i] * 0.85) * 3.0);
      let A = cov * reveal;
      // pooled edge: pigment collects where coverage falls off; interior a touch lighter (absorption)
      const edge = cov * (1 - cov) * 4;
      let dens = 0.86 + 0.14 * edge - 0.10 * (gran[i] - 0.5) * (1 - edge);
      // bleed: a soft halo creeping out along the paper after the brush has passed
      const qb = (p - rvb[i]) / FRONT;
      const bl = qb > 1 ? clamp((qb - 1) / 3) : 0;
      const halo = clamp((cb * (0.55 + 0.45 * gran[i]) - (0.42 - 0.3 * bleed * bl)) / 0.25) * 0.55 * bl * bleed;
      const fA = Math.max(A * dens, halo * (1 - A));
      d[i * 4] = R; d[i * 4 + 1] = G; d[i * 4 + 2] = B;
      d[i * 4 + 3] = Math.round(clamp(fA * alpha) * 255);
    }
    this.cg.putImageData(img, 0, 0);
    return this.canvas;
  }
  draw(g, p, bleed = 1, alpha = 1) {
    const c = this.render(p, bleed, alpha);
    g.drawImage(c, this.box.x, this.box.y, this.box.w, this.box.h);
  }
}

function blur(src, W, H, r) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  const n = 2 * r + 1;
  for (let y = 0; y < H; y++) {
    let acc = 0; const row = y * W;
    for (let x = -r; x <= r; x++) acc += src[row + Math.min(W - 1, Math.max(0, x))];
    for (let x = 0; x < W; x++) { tmp[row + x] = acc / n; acc += src[row + Math.min(W - 1, x + r + 1)] - src[row + Math.max(0, x - r)]; }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
    for (let y = 0; y < H; y++) { out[y * W + x] = acc / n; acc += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]; }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// (c) English display card
export class Card {
  // o: lines[], font ('Cormorant'), weight, size, tracking (em), leading (x size), x, y (baseline of first line),
  //    align ('left'|'center'|'right'), color css, italic
  constructor(kit, o) {
    this.kit = kit;
    this.o = o = { font: 'Cormorant', weight: 500, size: 58, tracking: 0.035, leading: 1.28, align: 'left', color: '#18181c', seed: 3, ...o };
    const S = kit.S;
    const meas = makeCanvas(4, 4).getContext('2d');
    meas.font = `${o.weight} ${o.size}px ${o.font}`;
    meas.letterSpacing = `${o.tracking * o.size}px`;
    const widths = o.lines.map((l) => meas.measureText(l).width - o.tracking * o.size);
    const w = Math.max(...widths);
    const pad = o.size * 0.6;
    const h = o.size * (o.leading * (o.lines.length - 1) + 1.0) + pad * 2;
    const left = o.align === 'center' ? o.x - w / 2 : o.align === 'right' ? o.x - w : o.x;
    this.box = { x: left - pad, y: o.y - o.size * 0.92 - pad, w: w + pad * 2, h };
    const c = makeCanvas(this.box.w * S, this.box.h * S);
    const g = c.getContext('2d');
    g.scale(S, S); g.translate(-this.box.x, -this.box.y);
    g.font = meas.font; g.letterSpacing = meas.letterSpacing; g.fillStyle = o.color; g.textBaseline = 'alphabetic';
    o.lines.forEach((l, i) => {
      const lw = widths[i];
      const x = o.align === 'center' ? o.x - lw / 2 : o.align === 'right' ? o.x - lw : o.x;
      g.fillText(l, x, o.y + i * o.size * o.leading);
    });
    this.text = c;
    // ink-bleed halo version (blurred, faint)
    const hb = makeCanvas(c.width, c.height); const hg = hb.getContext('2d');
    hg.filter = `blur(${(0.9 * S).toFixed(2)}px)`; hg.drawImage(c, 0, 0);
    this.halo = hb;
    this.tmp = makeCanvas(c.width, c.height);
    this.lineBoxes = widths.map((lw, i) => ({ y: o.y + i * o.size * o.leading, w: lw }));
  }
  // wipe: 0..1 brush-wipe progress (left→right, line by line), alpha: overall opacity
  draw(g, wipe = 1, alpha = 1) {
    if (alpha <= 0.001 || wipe <= 0) return;
    const S = this.kit.S, o = this.o, b = this.box;
    const t = this.tmp, tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.globalAlpha = 1;
    tg.clearRect(0, 0, t.width, t.height);
    tg.globalAlpha = 0.22; tg.drawImage(this.halo, 0, 0);
    tg.globalAlpha = 1; tg.drawImage(this.text, 0, 0);
    if (wipe < 1) {
      // dry-brush wipe mask (built separately, applied once): every 2 design px row has its own ragged edge
      const m = this.mask || (this.mask = makeCanvas(t.width, t.height)); const mg = m.getContext('2d');
      mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, m.width, m.height);
      mg.scale(S, S); mg.translate(-b.x, -b.y);
      const nl = o.lines.length, feather = o.size * 1.6;
      for (let li = 0; li < nl; li++) {
        const lp = clamp(wipe * (nl + 0.6) - li * 0.85, 0, 1.0001);
        if (lp <= 0) continue;
        const yb = this.lineBoxes[li].y;
        const x0 = b.x + o.size * 0.6 - feather, x1 = b.x + o.size * 0.6 + this.lineBoxes[li].w + feather;
        const xe = x0 + (x1 - x0) * lp;
        for (let y = yb - o.size * 1.05; y < yb + o.size * 0.4; y += 2) {
          const j = (vnoise(y * 0.09, li * 7.3, o.seed) - 0.5) * o.size * 0.9 + (hash2(Math.round(y), li, o.seed) - 0.5) * o.size * 0.25;
          const gr = mg.createLinearGradient(xe + j - feather, 0, xe + j, 0);
          gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
          mg.fillStyle = gr; mg.fillRect(b.x - 10, y, xe + j - b.x + 10, 2.05);
        }
      }
      tg.globalCompositeOperation = 'destination-in';
      tg.drawImage(m, 0, 0);
      tg.globalCompositeOperation = 'source-over';
    }
    g.save(); g.globalAlpha = alpha; g.drawImage(t, b.x, b.y, b.w, b.h); g.restore();
  }
}

// ---------------------------------------------------------------------------------------------------------------
export class TypeKit {
  constructor(ctx) { this.ctx = ctx; this.S = ctx.S; this.cache = new Map(); }
  inkText(key, o) { if (!this.cache.has(key)) this.cache.set(key, new InkText(this, o)); return this.cache.get(key); }
  card(key, o) { if (!this.cache.has(key)) this.cache.set(key, new Card(this, o)); return this.cache.get(key); }
  // (d) HUD mono label
  hud(g, text, x, y, { size = 13, color = 'rgba(30,30,34,0.75)', tracking = 0.14, align = 'left', weight = 'PlexMonoMedium' } = {}) {
    g.save();
    g.font = `${size}px ${weight}`; g.letterSpacing = `${(tracking * size).toFixed(2)}px`;
    g.fillStyle = color; g.textBaseline = 'alphabetic'; g.textAlign = align;
    g.fillText(text, x, y);
    g.restore();
  }
}

// standard card envelope: brush-wipe in over `win` s, hold, fade out over `fout` s
export function cardTiming(t, t0, t1, win = 0.85, fout = 0.35) {
  const wipe = smooth(t0, t0 + win, t);
  const alpha = 1 - smooth(t1 - fout, t1, t);
  return { wipe: wipe * wipe * (3 - 2 * wipe) > 0 ? wipe : 0, alpha };
}
export { mulberry32 };
