// Shared vocabulary for section files. Section files are pure data + type functions: they must not touch
// browser globals at import time (tools/lint_shots.mjs imports them in Node).
import { cardTiming } from '../type.js';
import { smooth, clamp, easeInOutSine } from '../util.js';

export const FPS = 24;
export const INK = '#17171b', PALE = '#efe7d6', GOLDTXT = '#ffffff';
export const INKC = [0.07, 0.07, 0.085], PALEC = [0.94, 0.91, 0.84], WHITE = [1, 1, 1];
export { smooth, clamp, easeInOutSine };

// Musical events that are legal cut points besides beats/downbeats (song_map.md, script.md). Lyric line and word
// onsets (analysis/lyrics_timing.json) are added by the lint automatically.
export const ACCENTS = [0, 1.78, 2.84, 5.86, 9.14, 11.47, 13.10, 15.42, 17.1, 22.75, 30.57, 45.3, 47.14, 61.65, 74.4, 76.17,
  97.73, 104.92, 109.5, 111.95, 115.57, 118.8, 120.12, 121.89, 122.65, 143.43, 158.5, 164.5, 167.0, 173.0, 181.0,
  189.86, 193.22, 200.5, 201.6, 204.5, 205.7, 207.0, 208.3, 210.04, 212.0];

// ---- type helpers ------------------------------------------------------------------------------------------------
// English card: brush-wipe in at a, fade out ending at b
export function card(ctx, key, o, t, a, b, mode = 'ink') {
  const c = ctx.type.card(key, { tracking: 0.02, leading: 1.1, ...o });
  const tm = cardTiming(t, a, b, o.win ?? 0.75, o.fout ?? 0.3);
  if (tm.wipe <= 0 || tm.alpha <= 0) return;
  if (o.panel) panel(ctx, c.box, tm.alpha, o.panel);
  ctx.pipe.layer((g) => c.draw(g, tm.wipe, tm.alpha * (o.opacity ?? 1)), { mode, absorb: mode === 'ink' ? 0.45 : 0, seed: 40 });
}
// legibility on phones: measure the ground under the type (luminance mean/std of the frame so far); when it is busy or
// too close in value to the type, lay a soft paper-toned (dark type) or ink-toned (pale type) halo behind it
export const LYR_SCALE = 1.25;
function lumOf(css) { const m = /#(..)(..)(..)/.exec(css || '#17171b'); return m ? (0.299 * parseInt(m[1], 16) + 0.587 * parseInt(m[2], 16) + 0.114 * parseInt(m[3], 16)) / 255 : 0.1; }
export function scrim(ctx, box, alpha, color, force) {
  const tl = lumOf(color), dark = tl < 0.5;
  const inner = { x: box.x + box.w * 0.08, y: box.y + box.h * 0.12, w: box.w * 0.84, h: box.h * 0.76 };
  const st = ctx.pipe.sampleStats ? ctx.pipe.sampleStats(inner) : { mean: dark ? 0.9 : 0.1, std: 0 };
  const contrast = Math.abs(st.mean - tl);
  let k = Math.max(clamp((st.std - 0.05) / 0.12), clamp((0.42 - contrast) / 0.28));
  if (force) k = Math.max(k, 0.8);
  if (k > 0.03) panel(ctx, box, alpha * Math.min(1, k) * 0.95, dark ? 'light' : 'dark');
}
// Chinese calligraphy brushed in from a over `dur`, fading at b
export function calli(ctx, key, o, t, a, dur, b, mode = 'ink') {
  const it = ctx.type.inkText(key, { font: 'MaShanZheng', lead: 1.02, ...o });
  const n = [...o.text].length;
  const p = smooth(a, a + dur, t) * (n + 0.25);
  const al = (1 - smooth(b - 0.3, b, t)) * (o.alpha ?? 1);
  if (p <= 0 || al <= 0) return;
  if (o.wash) panel(ctx, it.box, al, o.wash === true ? 'dark' : o.wash);
  ctx.pipe.layer((g) => { if (o.dy) g.translate(0, o.dy); it.draw(g, p, smooth(a + 0.2, a + dur + 0.8, t), al); }, { mode, absorb: mode === 'ink' ? 0.55 : 0, seed: 43 });
}
// a soft wash behind type so it reads over busy painting (like the calm ground of an inscription)
export function panel(ctx, box, alpha, kind = 'dark') {
  ctx.pipe.layer((g) => {
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    g.save(); g.translate(cx, cy); g.scale(box.w * 0.62, box.h * 0.7);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    const col = kind === 'dark' ? '10,14,28' : '240,232,214';
    gr.addColorStop(0, `rgba(${col},${0.62 * alpha})`); gr.addColorStop(0.6, `rgba(${col},${0.42 * alpha})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
  }, { mode: kind === 'dark' ? 'ink' : 'over', absorb: 0.6, seed: 44 });
}
export function hud(ctx, text, x, y, o = {}, alpha = 1, mode = 'over') {
  if (alpha <= 0) return;
  const drop = ctx.shot && ctx.shot.section === '07_drop';
  const k = drop ? 1.5 : 1, a = drop ? Math.min(1, (o.a ?? 0.85) * 1.2) : (o.a ?? 0.85);
  const size = Math.round((o.size || 14) * k);
  // anchored at the frame edges: bottom/right-hand labels keep their margin as they grow
  // stacked labels keep their rhythm: distances from the nearest frame edge scale with the type
  const yy = !drop ? y : y > 540 ? 1080 - (1080 - y) * k + (k - 1) * 18 : 40 + (y - 40) * k;
  ctx.pipe.layer((g) => {
    if (drop) { g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 16 * ctx.S; g.shadowOffsetY = 2 * ctx.S; }   // canvas shadows are in device px: scaled so 1080p matches 540p
    ctx.type.hud(g, text, x, yy, { tracking: 0.16, ...o, size, color: o.rgb ? `rgba(${o.rgb},${(alpha * a).toFixed(3)})` : (o.color || `rgba(240,232,214,${(alpha * a).toFixed(3)})`) });
  }, { mode, seed: 46 });
}
export const bump = (lt, k = 0.010) => ({ bump: k * Math.exp(-lt / 0.12) });

// ---- lyrics ------------------------------------------------------------------------------------------------------
// English lyric line revealed word by word on the sung onsets. o: { breaks:[wordIdx…] new typographic line starts,
//   big:{wordIdx:size}, size, x, y, align, color, font, lead (s), hold (s after line end), until (absolute fade end) }
export function lyricEN(ctx, line, o, t, mode = 'ink') {
  if (!line) return;
  const W = line.words.slice(o.w0 ?? 0, o.w1 ?? line.words.length);
  const lines = []; let cur = [];
  W.forEach((w, i) => {
    if (o.breaks && o.breaks.includes(i) && cur.length) { lines.push(cur); cur = []; }
    const last = i === W.length - 1 || (o.breaks && o.breaks.includes(i + 1));
    const txt = (o.text && o.text[i]) || w.text;
    const punct = (o.punct && o.punct[i]) || '';
    cur.push({ t: txt + punct + (last ? '' : ' '), ...(o.big && o.big[i] ? { size: Math.round(o.big[i] * LYR_SCALE) } : {}), ...(o.italic && o.italic.includes(i) ? { font: 'CormorantItalic' } : {}) });
  });
  if (cur.length) lines.push(cur);
  const key = `lyr-${line.id}-${o.key || ''}-${o.w0 ?? 0}`;
  const c = ctx.type.card(key, { tracking: 0.02, leading: 1.12, weight: 600, ...o, size: Math.round((o.size || 64) * LYR_SCALE), lines });
  // keep the (now larger) line inside the 4% safe area
  const SAFE = 64, bx = c.box, pad = (o.size || 64) * LYR_SCALE * 0.6;
  const vx = bx.x + pad, vy = bx.y + pad, vw = bx.w - 2 * pad, vh = bx.h - 2 * pad;
  const sx = Math.min(0, 1920 - SAFE - (vx + vw)) + Math.max(0, SAFE - vx), sy = Math.min(0, 1080 - 40 - (vy + vh)) + Math.max(0, SAFE * 0.6 - vy);
  const lead = o.lead ?? 0.06;
  const end = o.until ?? (line.end + (o.hold ?? 0.6));
  const alpha = (1 - smooth(end - 0.35, end, t)) * smooth((o.from ?? -1e9), (o.from ?? -1e9) + 0.25, t);
  if (alpha <= 0 || t < W[0].start - lead - 0.05) return;
  const RE = c.runEdges();
  let wi = 0;
  const edges = RE.map((runs) => {
    let e = -1e9;
    runs.forEach((r) => {
      const w = W[wi++]; if (!w) return;
      const d = Math.min(0.32, Math.max(0.12, (w.end - w.start) * 0.8));
      const f = smooth(w.start - lead, w.start - lead + d, t);
      if (f > 0) e = r.x0 + (r.x1 - r.x0) * f + (f >= 1 ? 40 : 0);
    });
    return e;
  });
  const box = { x: bx.x + sx, y: bx.y + sy, w: bx.w, h: bx.h };
  scrim(ctx, box, alpha * smooth(W[0].start - lead - 0.1, W[0].start + 0.25, t), o.color, o.panel);   // the halo arrives with the first word
  ctx.pipe.layer((g) => { g.translate(sx, sy); if (o.dy) g.translate(0, typeof o.dy === 'function' ? o.dy(t) : o.dy); c.drawReveal(g, edges, alpha * (o.opacity ?? 1)); }, { mode, absorb: mode === 'ink' ? 0.45 : 0, seed: 47 });
}
// character onset times for a Chinese line (punctuation follows the previous character)
export function charTimes(line) {
  const out = []; let wi = 0;
  for (const ch of [...line.text]) {
    if (/[，。、；：！？,.]/.test(ch)) { const p = out[out.length - 1]; out.push({ ch, start: p ? p.start + 0.25 : line.start, end: p ? p.end : line.start }); continue; }
    const w = line.words[wi++] || line.words[line.words.length - 1];
    out.push({ ch, start: w.start, end: w.end });
  }
  return out;
}
// Chinese lyric as calligraphy, each character brushed on its sung onset. o: InkText opts (+ text override slice
// via from/to char indices), lead, until, dy(t), wash, mode
export function lyricZH(ctx, line, o, t, mode = 'ink') {
  if (!line) return;
  let CT = charTimes(line);
  if (o.from !== undefined || o.to !== undefined) CT = CT.slice(o.from ?? 0, o.to ?? CT.length);
  const text = CT.map((c) => c.ch).join('');
  const key = `zh-${line.id}-${o.key || ''}-${text}`;
  const it = ctx.type.inkText(key, { font: 'MaShanZheng', lead: 1.02, ...o, text });
  const lead = o.early ?? 0.05; // how early each character starts to be brushed (s); `lead` is InkText line spacing
  let p = 0;
  CT.forEach((c, j) => { const d = Math.min(0.42, Math.max(0.16, (c.end - c.start) * 0.7)); p += smooth(c.start - lead, c.start - lead + d, t); });
  p *= (CT.length + 0.25) / CT.length; // let the brush finish each character (the reveal front trails the onset)
  const end = o.until ?? (CT[CT.length - 1].end + (o.hold ?? 0.6));
  const alpha = (1 - smooth(end - 0.4, end, t)) * (o.alpha ?? 1);
  if (p <= 0 || alpha <= 0) return;
  if (o.wash) panel(ctx, it.box, alpha, o.wash === true ? 'dark' : o.wash);
  const pp = Math.min(p + 0.0001, CT.length + 0.25), bl = smooth(CT[0].start, CT[0].start + 1.2, t);
  const xf = (g) => {
    if (o.shake) { const k = Math.floor(t * 24); g.translate(((k * 7919) % 13 - 6) / 6 * o.shake, ((k * 104729) % 11 - 5) / 5 * o.shake); }
    if (o.dy) g.translate(0, typeof o.dy === 'function' ? o.dy(t) : o.dy);
    if (o.scale) { const s = typeof o.scale === 'function' ? o.scale(t) : o.scale; const bx = it.box; g.translate(bx.x + bx.w / 2, bx.y + bx.h / 2); g.scale(s, s); g.translate(-(bx.x + bx.w / 2), -(bx.y + bx.h / 2)); }
  };
  // a dark halo so a pale character reads over bright passages (white rubbing on stone, carved shadow)
  if (o.halo) ctx.pipe.layer((g) => { xf(g); const c = it.render(pp, bl, alpha); g.filter = `brightness(0) blur(${o.halo}px)`; g.globalAlpha = 0.85; g.drawImage(c, it.box.x, it.box.y, it.box.w, it.box.h); g.drawImage(c, it.box.x, it.box.y, it.box.w, it.box.h); }, { mode: 'ink', seed: 49 });
  // held character: the ink keeps creeping into the paper
  if (o.spread) { const r = o.spread(t); if (r > 0.2) ctx.pipe.layer((g) => { xf(g); const c = it.render(pp, bl, alpha); g.filter = `blur(${r.toFixed(2)}px)`; g.globalAlpha = Math.min(0.7, 0.25 + r * 0.03); g.drawImage(c, it.box.x, it.box.y, it.box.w, it.box.h); }, { mode, absorb: 0.9, seed: 50 }); }
  ctx.pipe.layer((g) => {
    if (o.shake) { const k = Math.floor(t * 24); g.translate(((k * 7919) % 13 - 6) / 6 * o.shake, ((k * 104729) % 11 - 5) / 5 * o.shake); }
    if (o.dy) g.translate(0, typeof o.dy === 'function' ? o.dy(t) : o.dy);
    if (o.scale) { const s = typeof o.scale === 'function' ? o.scale(t) : o.scale; const bx = it.box; g.translate(bx.x + bx.w / 2, bx.y + bx.h / 2); g.scale(s, s); g.translate(-(bx.x + bx.w / 2), -(bx.y + bx.h / 2)); }
    it.draw(g, Math.min(p + 0.0001, CT.length + 0.25), smooth(CT[0].start, CT[0].start + 1.2, t), alpha);
  }, { mode, absorb: mode === 'ink' ? 0.55 : 0, seed: 48 });
}

// ---- shot builders ----------------------------------------------------------------------------------------------
// keyframe plate layer with sensible life by default (slow push, gentle parallax from a vertical depth gradient)
export function kf(img, o = {}) {
  return { name: 'plate', params: { img, grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.5, y: 0.49, zoom: 1.10 },
    par: [-0.01, 0.002], dolly: 0.05, masks: { base: [0.05, 0.6] }, ...o } };
}
// tasteful labelled placeholder card for a shot whose keyframe has not been delivered
export function ph(title, file, o = {}) {
  return { name: 'placeholder', params: { title, file, ...o } };
}
// pick a keyframe layer if delivered, else a placeholder
export function kfOr(X, img, o, title) { return X.has(img) ? kf(img, o) : ph(title, img); }
