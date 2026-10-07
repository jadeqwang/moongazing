// Roto scene: the generated clip is only a MOTION BASE; viewers see our drawing of it.
//   section usage:  { type: 'roto', clip: 'K_5.1/take_1', paper: 'ink', lag: 0 }
//   params: clip      '<shot>/<take>' -> media/gen/<shot>/roto/<take>/ (made by tools/roto_prep.py)
//           paper     'silk' | 'ink' | 'gold' (default from the shot's paper: silk/silknight -> silk, xuan -> ink,
//                     indigo -> gold)
//           lag       seconds added to the clip clock (lip-sync offsets from media/gen/LS*/sync.json)
//           offset    clip time at the shot's first frame (default 0)  — or ref_t0: clip_time = t - ref_t0 + lag
//           twos      drawings on twos (default true: 12 drawings/s; the paper and keyframe plate stay on ones)
//           lock      seconds over which the painted keyframe dissolves into the redraw (default 0.5)
//           from/to   {x, y, zoom} reframing within the clip (eased over the shot), like the plate scene
//           redrawAll 1 = ignore the motion mask (draw everything from video), maskGain, style overrides below
//           glow      gold only, and only honoured in the drop section (07_drop)
//           mouth     lip-sync shots: draw the mouth from the vocal stem (default: on when prep re-mouthed the take);
//                     mouthStyle {lip, lipLo, inside, line, lineW, open, width}
// Deterministic: the drawing index is a pure function of t; all texture is seeded and anchored to the paper.
import { ROTO_FS } from './shader.js';
import { loadImage, easeInOutSine } from '../util.js';
import { loadMouthTrack, restMouth, drawMouth, mouthAt } from './mouth.js';

const PAPER = { silk: 0, ink: 1, gold: 2 };
const FROM_SHOT = { silk: 'silk', silknight: 'silk', xuan: 'ink', indigo: 'gold', rubbing: 'ink' };
const GROUND = { silk: [0.886, 0.816, 0.675], silknight: [0.337, 0.326, 0.351], xuan: [0.949, 0.937, 0.910], indigo: [0.09, 0.13, 0.245], rubbing: [0.075, 0.072, 0.07] };
const STYLE = {
  silk: { snap: 9, shade: 0.35, lineTh: 0.5, lineW: 0.16, lineA: 0.92, boldA: 0, gran: 0.10, wet: 0, wash: 0, faceFlat: 0.25, ink: [0.17, 0.14, 0.11] },
  ink: { snap: 9, shade: 0, lineTh: 0.5, lineW: 0.14, lineA: 0.55, boldA: 0.95, gran: 0.35, wet: 0.6, wash: 0, faceFlat: 0.3, ink: [0.08, 0.08, 0.08] },
  gold: { snap: 9, shade: 0, lineTh: 0.42, lineW: 0.16, lineA: 1.0, boldA: 0, gran: 0, wet: 0, wash: 0.22, faceFlat: 0.3, ink: [0.8, 0.65, 0.35] },
};

const clips = new Map();     // clip -> Promise<{meta, key, mask}>
const frameTex = new Map();  // `${clip}#${f}` -> Promise<{c, g}>
const lru = [];
const MAX_FRAMES = 6;

function base(clip) { const [shot, take] = clip.split('/'); return `/media/gen/${encodeURIComponent(shot)}/roto/${take}/`; }

async function loadClip(gl, clip) {
  if (!clips.has(clip)) clips.set(clip, (async () => {
    const b = base(clip);
    const meta = await (await fetch(b + 'meta.json')).json();
    const [ki, mi] = await Promise.all([loadImage(b + 'key.jpg'), loadImage(b + (meta.mask || 'mask.png'))]);
    return { meta, key: gl.texture(ki, { mip: true }), mask: gl.texture(mi), rest: meta.face ? restMouth(meta.face) : null };
  })());
  return clips.get(clip);
}

async function loadFrame(gl, clip, f) {
  const k = `${clip}#${f}`;
  if (!frameTex.has(k)) {
    frameTex.set(k, (async () => {
      const b = base(clip), n = String(f).padStart(4, '0');
      const [c, g] = await Promise.all([loadImage(`${b}c_${n}.jpg`), loadImage(`${b}g_${n}.png`)]);
      return { c: gl.texture(c), g: gl.texture(g) };
    })());
    lru.push(k);
    while (lru.length > MAX_FRAMES) {
      const old = lru.shift();
      const p = frameTex.get(old); frameTex.delete(old);
      p.then((t) => { gl.gl.deleteTexture(t.c.tex); gl.gl.deleteTexture(t.g.tex); });
    }
  } else { const i = lru.indexOf(k); lru.splice(i, 1); lru.push(k); }
  return frameTex.get(k);
}

// clip time -> drawing index (on twos: even frames, each held for two song frames)
export function drawingIndex(meta, clipTime, twos = true) {
  let f = Math.floor(clipTime * meta.fps + 1e-3);
  f = Math.max(0, Math.min(meta.frames - 1, f));
  if (twos) f -= f % 2;
  return f;
}
export function clipTimeOf(p, t, lt) {
  return (p.ref_t0 !== undefined ? t - p.ref_t0 : lt + (p.offset || 0)) + (p.lag || 0);
}

export const roto = {
  init(ctx) { this.prog = ctx.gl.program(ROTO_FS, 'roto'); },
  async draw(ctx, shot, t, lt) {
    const p = shot.params || {};
    const gl = ctx.gl;
    const C = await loadClip(gl, p.clip);
    const M = C.meta;
    const ct = clipTimeOf(p, t, lt);
    const fi = Math.max(0, Math.min(M.frames - 1, Math.floor(ct * M.fps + 1e-3)));   // camera: on ones
    const fd = drawingIndex(M, ct, p.twos !== false);                                 // drawing: on twos
    const F = await loadFrame(gl, p.clip, fd);
    const paperName = p.paper || FROM_SHOT[shot.paper] || 'silk';
    const S = { ...STYLE[paperName], ...(p.style || {}) };
    const dur = Math.max(1e-3, shot.t1 - shot.t0);
    const a = p.from || { x: 0.5, y: 0.5, zoom: 1 }, b = p.to || a;
    const u = easeInOutSine(Math.min(1, Math.max(0, lt / dur)));
    const view = [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.zoom + (b.zoom - a.zoom) * u];
    const lockDur = p.lock ?? 0.5;
    const lk = lockDur > 0 ? 1 - Math.min(1, Math.max(0, lt / lockDur)) : 0;
    const lock = lk * lk * (3 - 2 * lk);
    const T = M.T[fi], Ti = M.Ti[fd];
    const pal = M.palette.slice(0, 16);
    const lev = M.inkLevels.slice(0, 6);
    const glowOK = shot.section === '07_drop' || p.forceGlow;
    ctx.pipe.apply(this.prog, {
      uKey: C.key, uCol: F.c, uGuide: F.g, uMask: C.mask,
      uVid: [M.w, M.h], uView: view,
      uTa: T.slice(0, 3), uTb: T.slice(3, 6), uFa: Ti.slice(0, 3), uFb: Ti.slice(3, 6),
      uPaper: { i: PAPER[paperName] }, uPm: GROUND[shot.paper] || GROUND.silk,
      uLock: lock, uMaskGain: p.maskGain ?? 1, uRedrawAll: p.redrawAll ? 1 : 0,
      uPal: pal.flat().concat(new Array((16 - pal.length) * 3).fill(0)), uNPal: { i: pal.length },
      uLev: lev.concat(new Array(6 - lev.length).fill(0)), uNLev: { i: lev.length },
      uSnap: S.snap, uShade: S.shade, uLineTh: S.lineTh, uLineW: S.lineW, uLineA: S.lineA, uBoldA: S.boldA,
      uGran: S.gran, uWet: S.wet, uWash: S.wash, uFaceFlat: S.faceFlat, uInk: S.ink,
      uGlow: glowOK ? (p.glow || 0) : 0, uSeed: (shot.grain ?? 7) * 1.37, uDark: M.darkGround ? 1 : 0,
    });
    // re-mouthing: lips drawn from the vocal stem at SONG time t (on ones), placed on the held drawing's head
    if ((p.mouth ?? M.remouth) && M.face && C.rest) {
      const MT = await loadMouthTrack();
      const [k, r] = mouthAt(MT, t + (p.mouthLead || 0));
      const Tf = M.T[fd], Tii = M.Ti[fi];
      const ar = M.w / M.h, rar = 1920 / 1080;
      const span = ar > rar ? [rar / ar, 1] : [1, ar / rar];
      const hx = span[0] / view[2] * 0.5, hy = span[1] / view[2] * 0.5;
      const cx = Math.min(Math.max(view[0], hx), 1 - hx), cy = Math.min(Math.max(view[1], hy), 1 - hy);
      const toScreen = ([x, y]) => {
        const x0 = Tf[0] * x + Tf[1] * y + Tf[2], y0 = Tf[3] * x + Tf[4] * y + Tf[5];
        const xi = Tii[0] * x0 + Tii[1] * y0 + Tii[2], yi = Tii[3] * x0 + Tii[4] * y0 + Tii[5];
        return [((xi / M.w - cx) * view[2] / span[0] + 0.5) * 1920, ((yi / M.h - cy) * view[2] / span[1] + 0.5) * 1080];
      };
      const alpha = 1 - lock;
      if (alpha > 0.01) ctx.pipe.layer((g) => drawMouth(g, M.face, C.rest, fd, toScreen, k, r, { alpha, ...(p.mouthStyle || {}) }), { mode: 'ink', absorb: 0.35, seed: 61 });
    }
  },
};
