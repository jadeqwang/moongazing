// Roto scene: the generated clip is only a MOTION BASE; viewers see our drawing of it.
//   section usage:  { type: 'roto', clip: 'K_5.1/take_1', paper: 'ink', lag: 0 }
//   params: clip      '<shot>/<take>' -> media/gen/<shot>/roto/<take>/ (made by tools/roto_prep.py)
//           paper     'silk' | 'ink' | 'gold' (default from the shot's paper: silk/silknight -> silk, xuan -> ink,
//                     indigo -> gold)
//           lag       seconds added to the clip clock (lip-sync offsets from media/gen/LS*/sync.json)
//           offset    clip time at the shot's first frame (default 0)  — or ref_t0: clip_time = t - ref_t0 + lag
//           rate      playback rate of the take (default 1; with offset only): clip_time = lt * rate + offset
//           time      (lt, t) => clip seconds: custom retiming instead of offset (3.3: the reading finger dwells and glides)
//           twos      drawings on twos (default true: 12 drawings/s; the paper and keyframe plate stay on ones)
//           lock      seconds over which the painted keyframe dissolves into the redraw (default 0.5)
//           from/to   {x, y, zoom} reframing within the clip (eased over the shot), like the plate scene
//           subject   false = redraw the whole motion region (default: only where the drawing differs from the
//                     painting, so reproduced water/walls keep the keyframe's brushwork)
//           redrawAll 1 = ignore the motion mask (draw everything from video), maskGain, style overrides below
//           tear      [y, drop, tilt, side] or (t, lt) => that: the torn scroll of scenes/plate.js on a moving take (8.2:
//                     two layers of the same clip, side +1 the upper half in place, side -1 the lower half rising)
//           rect      [x, y, w, h] design px: draw the clip into this rectangle only (split screens; default: the whole
//                     frame). fill [r, g, b]: lay this ground inside the rect first (a gold take on a silk-paper shot)
//           keep      painted-region carry: when the clip's meta has "keep" (tools/roto_keep.py: up to two regions of the
//                     painted keyframe, e.g. faces, tracked through the take) those regions are shown as the PAINTING
//                     itself, moved with the take, instead of being redrawn. keep: false turns it off.
//                     keepOcc: false = never let the redraw through where the take differs from the painting there
//                     (default on: something passing in front of a kept face, e.g. hair, hides it).
//           patch     carried insignia: when the clip's meta has "patch" (tools/emblem_patch.py: the agency emblem on a
//                     chest, up to 8 per clip) each is shown from its own painted plate (pkey.jpg) on the cloth's tracked
//                     motion, over the redraw, and hidden where the take shows something in front. patch: false = off.
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
  ink: { subLo: 9, subHi: 18, snap: 9, shade: 0, lineTh: 0.5, lineW: 0.14, lineA: 0.55, boldA: 0.95, gran: 0.35, wet: 0.6, wash: 0, faceFlat: 0.3, ink: [0.08, 0.08, 0.08] },
  gold: { snap: 9, shade: 0, lineTh: 0.42, lineW: 0.16, lineA: 1.0, boldA: 0, gran: 0, wet: 0, wash: 0.85, faceFlat: 0.3, ink: [0.8, 0.65, 0.35] },
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
    const eyes = meta.face && meta.face.eyes ? gl.texture(await loadImage(b + meta.face.eyes)) : null;
    const keep = meta.keep && meta.keep.mask ? gl.texture(await loadImage(b + meta.keep.mask)) : null;
    const patch = meta.patch && meta.patch.n ? { key: gl.texture(await loadImage(b + meta.patch.key), { mip: true }), mask: gl.texture(await loadImage(b + meta.patch.mask)) } : null;
    return { meta, key: gl.texture(ki, { mip: true }), mask: gl.texture(mi), eyes, keep, patch, rest: meta.face ? restMouth(meta.face) : null };
  })());
  return clips.get(clip);
}

async function loadFrame(gl, clip, f) {
  const k = `${clip}#${f}`;
  if (!frameTex.has(k)) {
    frameTex.set(k, (async () => {
      const b = base(clip), n = String(f).padStart(4, '0');
      const [c, g, sm] = await Promise.all([loadImage(`${b}c_${n}.jpg`), loadImage(`${b}g_${n}.png`), loadImage(`${b}s_${n}.png`).catch(() => null)]);
      return { c: gl.texture(c, { mip: true }), g: gl.texture(g), s: sm ? gl.texture(sm) : null };
    })());
    lru.push(k);
    while (lru.length > MAX_FRAMES) {
      const old = lru.shift();
      const p = frameTex.get(old); frameTex.delete(old);
      p.then((t) => { gl.gl.deleteTexture(t.c.tex); gl.gl.deleteTexture(t.g.tex); if (t.s) gl.gl.deleteTexture(t.s.tex); });
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
  if (typeof p.time === 'function') return p.time(lt, t);   // custom retiming: clip seconds as a pure function of shot time
  return (p.ref_t0 !== undefined ? t - p.ref_t0 : lt * (p.rate || 1) + (p.offset || 0)) + (p.lag || 0);
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
    const lum = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
    const inkDark = pal.reduce((a, c) => (lum(c) < lum(a) ? c : a), pal[0]);
    const glowOK = shot.section === '07_drop' || p.forceGlow;
    // carried insignia (meta.patch): per-patch affine of the held drawing, centre + gate + visibility, cloth reference
    const PT = C.patch && p.patch !== false ? M.patch : null, nP = PT ? Math.min(8, PT.n) : 0;
    const uPa = new Array(24).fill(0), uPb = new Array(24).fill(0), uPc = new Array(32).fill(0), uPr = new Array(32).fill(0);
    for (let j = 0; j < nP; j++) {
      const A = PT.A[j][fd];
      uPa.splice(j * 3, 3, A[0], A[1], A[2]); uPb.splice(j * 3, 3, A[3], A[4], A[5]);
      uPc.splice(j * 4, 4, PT.c[j][0], PT.c[j][1], PT.c[j][2], PT.vis[j][fd]); uPr.splice(j * 4, 4, ...PT.ref[j]);
    }
    ctx.pipe.apply(this.prog, {
      uKey: C.key, uCol: F.c, uGuide: F.g, uMask: C.mask,
      uSub: F.s || F.g, uSubTex: F.s ? 1 : 0,
      uEyes: C.eyes || C.mask, uEyeOn: C.eyes && p.eyelock !== false ? 1 : 0,
      uEa: C.eyes ? M.face.eyeE[fd].slice(0, 3) : [1, 0, 0], uEb: C.eyes ? M.face.eyeE[fd].slice(3, 6) : [0, 1, 0],
      uKeep: C.keep || C.mask, uKeepOn: C.keep && p.keep !== false ? 1 : 0, uKeepOcc: p.keepOcc === false ? 0 : 1,
      uKa: C.keep ? M.keep.A[fd].slice(0, 3) : [1, 0, 0], uKb: C.keep ? M.keep.A[fd].slice(3, 6) : [0, 1, 0],
      uKc: C.keep && M.keep.B ? M.keep.B[fd].slice(0, 3) : [1, 0, 0], uKd: C.keep && M.keep.B ? M.keep.B[fd].slice(3, 6) : [0, 1, 0],
      uPatch: nP ? C.patch.key : C.key, uPatchM: nP ? C.patch.mask : C.mask, uPatchN: { i: nP }, uPa, uPb, uPc, uPr,
      uVid: [M.w, M.h], uView: view, uRect: p.rect || [0, 0, 1920, 1080], uFill: p.fill ? [...p.fill, 1] : [0, 0, 0, 0],
      uTear: p.tear ? (typeof p.tear === 'function' ? p.tear(t, lt) : p.tear) : [0, 0, 0, 0],
      uTa: T.slice(0, 3), uTb: T.slice(3, 6), uFa: Ti.slice(0, 3), uFb: Ti.slice(3, 6),
      uPaper: { i: PAPER[paperName] }, uPm: GROUND[shot.paper] || GROUND.silk,
      uLock: lock, uMaskGain: p.maskGain ?? 2.5, uQuant: S.quant ?? 0.5, uInkDark: inkDark, uRedrawAll: p.redrawAll ? 1 : 0,
      uPal: pal.flat().concat(new Array((16 - pal.length) * 3).fill(0)), uNPal: { i: pal.length },
      uLev: lev.concat(new Array(6 - lev.length).fill(0)), uNLev: { i: lev.length },
      uSnap: S.snap, uShade: S.shade, uLineTh: S.lineTh, uLineW: S.lineW, uLineA: S.lineA, uBoldA: S.boldA,
      uGran: S.gran, uFaceKeep: S.faceKeep ?? 0.75, uSnapAmt: S.snapAmt ?? 0.45,
      uSubOn: p.subject === false ? 0 : 1, uSubLo: S.subLo ?? 6, uSubHi: S.subHi ?? 12, uWet: S.wet, uWash: S.wash, uFaceFlat: S.faceFlat, uInk: S.ink,
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
