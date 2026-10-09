// Shared vocabulary for section files. Section files are pure data + type functions: they must not touch
// browser globals at import time (tools/lint_shots.mjs imports them in Node).
import { cardTiming } from '../type.js';
import { smooth, clamp, easeInOutSine, makeCanvas } from '../util.js';

export const FPS = 24;
export const INK = '#17171b', PALE = '#efe7d6', GOLDTXT = '#ffffff';
export const INKC = [0.07, 0.07, 0.085], PALEC = [0.94, 0.91, 0.84], WHITE = [1, 1, 1];
export { smooth, clamp, easeInOutSine };

// Musical events that are legal cut points besides beats/downbeats (song_map.md, script.md). Lyric line and word
// onsets (analysis/lyrics_timing.json) are added by the lint automatically.
export const ACCENTS = [0, 1.80, 2.91, 5.94, 9.22, 11.52, 13.15, 15.45, 17.09, 22.66, 30.43, 44.85, 46.64, 60.91, 73.41, 75.16,
  96.31, 103.39, 107.86, 110.28, 113.86, 117.05, 118.32, 120.07, 120.48, 141.36, 156.28, 162.25, 164.60, 170.62, 178.57,
  187.33, 192.50, 198.62, 203.02, 204.19, 208.36];

// ---- type helpers ------------------------------------------------------------------------------------------------
// A type layer, measurable. Draws like ctx.pipe.layer; when tools/type_reveal_check.mjs has set window.__typeProbe to an
// array it also draws the same thing alone on a scratch canvas and records how much ink (summed alpha, in device px)
// is on screen, in total and per unit (a word, a character, a line of a card), with the time each unit may start.
// info: { key, kind, end (fade-out end, s), units: [{ id, on (s), box: [x, y, w, h] in design px }] }
let probeCanvas = null;
export function typeLayer(ctx, info, draw, opts) {
  ctx.pipe.layer(draw, opts);
  const P = globalThis.__typeProbe;
  if (!P) return;
  const S = ctx.S, W = Math.round(1920 * S), H = Math.round(1080 * S);
  if (!probeCanvas || probeCanvas.width !== W) probeCanvas = makeCanvas(W, H);
  const g = probeCanvas.getContext('2d', { willReadFrequently: true });
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.clearRect(0, 0, W, H); g.setTransform(S, 0, 0, S, 0, 0);
  g.save(); g.beginPath(); try { draw(g); } finally { g.restore(); }
  const d = g.getImageData(0, 0, W, H).data;
  let bx0 = W, by0 = H, bx1 = -1, by1 = -1;
  for (let j = 0; j < H; j += 2) for (let i = 0, k = j * W * 4 + 3; i < W; i += 2, k += 8) if (d[k] > 8) { if (i < bx0) bx0 = i; if (i > bx1) bx1 = i; if (j < by0) by0 = j; if (j > by1) by1 = j; }
  const sum = (x, y, w, h) => {
    const x0 = Math.max(0, Math.floor(x * S)), x1 = Math.min(W, Math.ceil((x + w) * S)), y0 = Math.max(0, Math.floor(y * S)), y1 = Math.min(H, Math.ceil((y + h) * S));
    let a = 0; for (let j = y0; j < y1; j++) for (let i = x0, k = (j * W + x0) * 4 + 3; i < x1; i++, k += 4) a += d[k];
    return a / 255;
  };
  P.push({ key: info.key, kind: info.kind, t: ctx.t, end: info.end, total: sum(0, 0, 1920, 1080), shot: ctx.shot && ctx.shot.id,
    bbox: bx1 < 0 ? null : [bx0 / S, by0 / S, (bx1 + 2) / S, (by1 + 2) / S],
    units: (info.units || []).map((u) => ({ id: u.id, on: u.on, ink: sum(...u.box) })) });
}
// the units of a calligraphy block: one per character cell. on(k) -> the time character k may start to be brushed
export function inkUnits(it, on, dy = 0) {
  return it.cells.map((cl) => ({ id: `${cl.k} ${[...it.o.text][cl.k]}`, on: on(cl.k), box: [it.box.x + cl.x0 - 3, it.box.y + cl.y0 + dy - 3, it.sz + 6, it.sz + 6] }));
}
const unsmooth = (y) => { let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (m * m * (3 - 2 * m) < y) lo = m; else hi = m; } return lo; };   // inverse of smoothstep
// the units of a card: one per run (word) of each line. on(li, ri) -> the time that run may start to appear
export function cardUnits(c, on, dx = 0, dy = 0) {
  const out = [];
  c.L.forEach((l, li) => l.runs.forEach((r, ri) => out.push({ id: `${li}.${ri} ${r.t.trim()}`, on: on(li, ri), box: [l.x0 + r.x + dx - 1, l.y - l.size * 0.8 + dy, r.w + 2, l.size * 1.1] })));
  return out;
}
// English card: fades in from a (line after line, eased, over o.win s), fades out ending at b
export function card(ctx, key, o, t, a, b, mode = 'ink') {
  const c = ctx.type.card(key, { tracking: 0.02, leading: 1.1, ...o });
  const tm = cardTiming(t, a, b, o.win ?? 0.75, o.fout ?? 0.4);
  if (tm.wipe <= 0 || tm.alpha <= 0) return;
  if (o.panel) panel(ctx, c.box, tm.alpha, o.panel);
  typeLayer(ctx, { key, kind: 'card', end: b, units: cardUnits(c, () => a) }, (g) => c.draw(g, tm.wipe, tm.alpha * (o.opacity ?? 1)), { mode, absorb: mode === 'ink' ? 0.45 : 0, seed: 40 });
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
  typeLayer(ctx, { key, kind: 'calli', end: b, units: inkUnits(it, (k) => a + dur * unsmooth(k / (n + 0.25)), o.dy || 0) },
    (g) => { if (o.dy) g.translate(0, o.dy); it.draw(g, p, smooth(a + 0.2, a + dur + 0.8, t), al); }, { mode, absorb: mode === 'ink' ? 0.55 : 0, seed: 43 });
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
// HOW LYRICS ARRIVE (Oct 8, round three; Jade: "could be more smooth, alternately, for shorter phrases, you can just have
// them already on screen"). No wipe, no travelling edge: every word (English) or character (Chinese) is drawn whole or
// not at all, on its own eased ramp that starts LYR_LEAD before its sung onset.
//   - a word fades in over LYR_RAMP;
//   - a typographic line of one word, of two words sung as one phrase (less than LYR_PAIR apart), or whose words come
//     faster than LYR_QUICK apart, fades in whole, once, on its first onset (LYR_LINE);
//   - anything whose turn has come by the first frames of the shot is simply there at the cut;
//   - anything whose turn comes in the last LYR_TAIL of a shot waits for the next shot (no half-faded word on a cut);
//     with o.tail = 'join' (the default for Chinese, where a character needs half a second to be brushed) a unit that
//     could not be whole LYR_JOIN before the line leaves (`until`) arrives with the unit before it instead: the last
//     syllable of 举杯邀明月，对影成三人 and of 我思念 is sung into the cut;
//   - a fade-out is LYR_OUT long and never starts until the last unit has been whole for LYR_HOLD; if that leaves no
//     room before the cut, the line is not faded at all and leaves with the picture.
// o.reveal overrides the choice per call: 'words' | 'line' | 'whole' (the whole block on the first onset) | 'held'
// (there from the first frame of the shot).
export const LYR_LEAD = 0.14, LYR_RAMP = 0.42, LYR_LINE = 0.5, LYR_QUICK = 0.22, LYR_PAIR = 0.6, LYR_TAIL = 0.2, LYR_OUT = 0.45, LYR_HOLD = 0.4, LYR_JOIN = 0.25;
// a unit whose turn comes at `on` (s) with ramp d -> [opacity at t, the time it may first show, the time it is whole]
// (lin: a brush moves at an even speed, so a character's progress is linear; an opacity is eased)
function arrive(ctx, on, d, t, lead, lin) {
  const s = on - lead, sh = ctx.shot || {}, cut = sh.t0 ?? -1e9, out = sh.t1 ?? 1e9;
  if (s <= cut + 0.06) return [1, -1e9, cut];            // there at the cut
  if (s > out - LYR_TAIL) return [0, 1e9, 1e9];          // too late for this shot: the next one shows it
  return [lin ? clamp((t - s) / d) : smooth(s, s + d, t), s, s + d];
}
// o.tail = 'join': onsets (ascending, with their ramps) pulled back so that every unit can be whole LYR_JOIN before the
// line leaves at `end`: a unit that cannot takes the onset of the one before it
function joinTail(ons, ds, lead, end, tail) {
  const o = ons.slice();
  if (tail !== 'join') return o;
  for (let k = 1; k < o.length; k++) if (ons[k] - lead + ds[k] + LYR_JOIN > end) o[k] = o[k - 1];
  return o;
}
// opacity of the fade-out ending at `end`, given when the last unit became whole
function leave(ctx, end, whole, t, fout = LYR_OUT) {
  const out = (ctx.shot && ctx.shot.t1) ?? 1e9, f0 = Math.max(end - fout, whole + LYR_HOLD);
  if (f0 > end - fout + 1e-6 && f0 + fout > out + 0.06) return 1;   // no room: it leaves with the cut
  return 1 - smooth(f0, f0 + fout, t);
}
// English lyric line. o: { breaks:[wordIdx…] new typographic line starts, big:{wordIdx:size}, size, x, y, align, color,
//   font, lead (s before the onset), ramp (s), reveal, hold (s after line end), until (absolute fade end), fout (s) }
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
  const lead = o.lead ?? LYR_LEAD;
  const end = o.until ?? (line.end + (o.hold ?? 0.6));
  // per typographic line, per word: its onset and ramp, then opacity now and the time it may first show
  let wi = 0; const G = [];
  for (const l of c.L) {
    const ws = l.runs.map(() => W[wi++]), n = ws.length, gap = n > 1 ? (ws[n - 1].start - ws[0].start) / (n - 1) : 0;
    const how = o.reveal || (n === 1 || gap < LYR_QUICK || (n === 2 && gap < LYR_PAIR) ? 'line' : 'words');
    for (const w of ws) G.push(how === 'held' ? [-1e9, 0] : how === 'words' ? [w.start, o.ramp ?? LYR_RAMP] : [how === 'whole' ? W[0].start : ws[0].start, o.ramp ?? LYR_LINE]);
  }
  const ons = joinTail(G.map((g) => g[0]), G.map((g) => g[1]), lead, end, o.tail);
  const each = G.map((g, k) => (g[0] < -1e8 ? [1, -1e9, -1e9] : arrive(ctx, ons[k], g[1], t, lead)));
  wi = 0; const A = c.L.map((l) => l.runs.map(() => each[wi++][0])); wi = 0; const ON = c.L.map((l) => l.runs.map(() => each[wi++][1]));
  const top = Math.max(...each.map((e) => e[0]));
  const whole = Math.max(...each.map((e) => (e[2] > 1e8 ? -1e9 : e[2])));
  const alpha = leave(ctx, end, whole, t, o.fout) * smooth((o.from ?? -1e9), (o.from ?? -1e9) + 0.25, t);
  if (alpha <= 0 || top <= 0) return;
  const box = { x: bx.x + sx, y: bx.y + sy, w: bx.w, h: bx.h };
  scrim(ctx, box, alpha * top, o.color, o.panel);   // the halo arrives with the first word
  const ddy = o.dy ? (typeof o.dy === 'function' ? o.dy(t) : o.dy) : 0;
  typeLayer(ctx, { key, kind: 'en', end, units: cardUnits(c, (li, ri) => ON[li][ri], sx, sy + ddy) },
    (g) => { g.translate(sx, sy + ddy); c.drawWords(g, A, alpha * (o.opacity ?? 1)); }, { mode, absorb: mode === 'ink' ? 0.45 : 0, seed: 47 });
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
// via from/to char indices), early (s before the onset), until, dy(t), wash, mode
// Each character has its own progress (InkText.render with an array): nothing of a character shows before its turn
// (the travelling brush used to let the first stroke of the next character in early), no character is brushed in fewer
// than 12 frames (it was 4), and one that is due at the cut is there at the cut. o.tail = 'join': see above.
export function lyricZH(ctx, line, o, t, mode = 'ink') {
  if (!line) return;
  let CT = charTimes(line);
  if (o.from !== undefined || o.to !== undefined) CT = CT.slice(o.from ?? 0, o.to ?? CT.length);
  const text = CT.map((c) => c.ch).join('');
  const key = `zh-${line.id}-${o.key || ''}-${text}`;
  const it = ctx.type.inkText(key, { font: 'MaShanZheng', lead: 1.02, ...o, text });
  const lead = o.early ?? 0.05; // how early each character starts to be brushed (s); `lead` is InkText line spacing
  const n = CT.length, P = new Array(n), ON = new Array(n);
  const ds = CT.map((c) => Math.min(0.65, Math.max(0.52, (c.end - c.start) * 0.7)));
  const end = o.until ?? (CT[CT.length - 1].end + (o.hold ?? 0.6));
  const ons = joinTail(CT.map((c) => c.start), ds, lead, end, o.tail ?? 'join');
  let any = 0, whole = -1e9;
  CT.forEach((c, j) => {
    const [m, on, w] = arrive(ctx, ons[j], ds[j], t, lead, true);
    // 0..1 = being brushed; then 1..2 = the ink creeps on into the paper (the last character stops where the travelling
    // brush used to: a third of the way)
    const creep = on < -1e8 ? 1 : smooth(on + ds[j], on + ds[j] + 0.5, t);
    P[j] = m <= 0 ? 0 : m + (j === n - 1 ? 0.33 : 1) * creep; ON[j] = on; any += P[j]; if (w < 1e8) whole = Math.max(whole, w);
  });
  const alpha = leave(ctx, end, whole, t) * (o.alpha ?? 1);
  if (any <= 0 || alpha <= 0) return;
  if (o.wash) panel(ctx, it.box, alpha, o.wash === true ? 'dark' : o.wash);
  const bl = smooth(CT[0].start, CT[0].start + 1.2, t);
  const ddy = o.dy ? (typeof o.dy === 'function' ? o.dy(t) : o.dy) : 0;
  const xf = (g) => {
    if (o.shake) { const k = Math.floor(t * 24); g.translate(((k * 7919) % 13 - 6) / 6 * o.shake, ((k * 104729) % 11 - 5) / 5 * o.shake); }
    if (ddy) g.translate(0, ddy);
    if (o.scale) { const s = typeof o.scale === 'function' ? o.scale(t) : o.scale; const bx = it.box; g.translate(bx.x + bx.w / 2, bx.y + bx.h / 2); g.scale(s, s); g.translate(-(bx.x + bx.w / 2), -(bx.y + bx.h / 2)); }
  };
  // a dark halo so a pale character reads over bright passages (white rubbing on stone, carved shadow)
  if (o.halo) ctx.pipe.layer((g) => { xf(g); const c = it.render(P, bl, alpha); g.filter = `brightness(0) blur(${o.halo}px)`; g.globalAlpha = 0.85; g.drawImage(c, it.box.x, it.box.y, it.box.w, it.box.h); g.drawImage(c, it.box.x, it.box.y, it.box.w, it.box.h); }, { mode: 'ink', seed: 49 });
  // held character: the ink keeps creeping into the paper
  if (o.spread) { const r = o.spread(t); if (r > 0.2) ctx.pipe.layer((g) => { xf(g); const c = it.render(P, bl, alpha); g.filter = `blur(${r.toFixed(2)}px)`; g.globalAlpha = Math.min(0.7, 0.25 + r * 0.03); g.drawImage(c, it.box.x, it.box.y, it.box.w, it.box.h); }, { mode, absorb: 0.9, seed: 50 }); }
  typeLayer(ctx, { key, kind: 'zh', end, units: o.scale ? [] : inkUnits(it, (k) => ON[k], ddy) },
    (g) => { xf(g); it.draw(g, P, bl, alpha); }, { mode, absorb: mode === 'ink' ? 0.55 : 0, seed: 48 });
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
