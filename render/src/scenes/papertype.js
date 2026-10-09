// papertype — crisp, correct type laid onto paper that a video take moves (3.5: the MISSION ASSIGNMENT envelope and
// the memorandum drawn out of it). The video model only ever sees BLANK paper; every glyph is set here in Canvas2D and
// multiplied onto the frame as ink, so text can never warp, boil or misspell.
//
//   after a roto layer:   { name: 'papertype', params: { clip, offset, rate, from, to, sheet: 'envelopeFront', track: 'env',
//                           showFrom, showUntil (clip seconds, optional) } }
//   after a plate layer:  { name: 'papertype', params: { img, from, to, sheet: 'envelopeFront', quad: [[u,v] x4] } }
//
// Roto mode reads media/gen/<shot>/roto/<take>/paper.json (made by tools/paper_track.py):
//   { w, h, tracks: { <track>: { aspect, frames: [{ q: [x0,y0, x1,y1, x2,y2, x3,y3] (TL,TR,BR,BL of the WHOLE sheet in
//     work px of that frame), vis: fraction of the sheet's height that is out of the envelope (1 = all) }], mask: 'p_<track>_' } } }
//   A frame may also carry a (0..1, the print's strength while the envelope is turned over: its quad is then a general
//   quadrilateral and the type is foreshortened with it) or q: null (the face is not toward the camera: nothing is set).
// and per-frame occlusion masks p_<track>_NNNN.png in SHEET space (white = bare paper, black = a hand is on it).
// The sheet rides the drawing (on twos) and the take's camera (on ones) exactly like the redrawn picture under it.
// Text content: docs/research_mission_assignment.md (sections 3 and 4), used verbatim.
import { PAPER_GLSL } from '../paper.js';
import { loadImage, makeCanvas, easeInOutSine } from '../util.js';
import { plateMap } from './plate.js';
import { drawingAt, clipTimeOf } from '../roto/index.js';

const INK = '#1a2036';        // the agency's indigo, as printing ink
const FS = `${PAPER_GLSL}
uniform sampler2D uPrev, uSheet, uOcc; uniform vec3 uI0, uI1, uI2; uniform float uVis, uOccOn, uAlpha;
out vec4 o;
void main(){ vec2 P = PX(); vec3 prev = FBO(uPrev, P).rgb;
  vec3 h = vec3(dot(uI0, vec3(P, 1.)), dot(uI1, vec3(P, 1.)), dot(uI2, vec3(P, 1.)));
  vec2 uv = h.xy / h.z;
  if (h.z <= 0. || uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) { o = vec4(prev, 1.); return; }
  vec4 L = texture(uSheet, uv);
  float gr = vnoise(P * 0.9) * .5 + .5;
  float a = L.a * (0.88 + 0.16 * gr) * uAlpha;                               // ink taken up a little unevenly
  a *= 1. - smoothstep(uVis - 0.006, uVis + 0.002, uv.y);                     // the part still inside the envelope
  float occ = mix(1., texture(uOcc, uv).r, uOccOn);                           // tracked: bare paper only
  float sat = (prev.r - prev.b) / max(prev.r, 1e-3);                          // and never on skin (far more saturated than paper)
  a *= occ * (1. - smoothstep(0.40, 0.50, sat)) * smoothstep(0.30, 0.46, prev.r);
  o = vec4(prev * mix(vec3(1.), L.rgb, a), 1.); }`;   // straight-alpha canvas texture: edges only get a touch darker

// homography unit square -> quad (TL, TR, BR, BL), returns the inverse rows for the shader
function invHomography(q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den;
  const [a, b, c, d, e, f, i] = [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, 1];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
}

// ---- the sheets (units: 1 = 0.1 mm of real paper, so sizes can be read off the research document) -------------------
const spaced = (g, s, x, y, ls, align = 'left') => { g.letterSpacing = `${ls}px`; g.textAlign = align; g.fillText(s, align === 'center' ? x + ls / 2 : x, y); g.letterSpacing = '0px'; g.textAlign = 'left'; };
const SHEETS = {
  // envelope front, 229 mm wide: one large line and almost nothing else (research section 3)
  envelopeFront: { w: 2290, h: 1360, needs: ['emblem_final_small'],   // h/w = the painted envelope's (0.594, tracked)
    draw(g, ctx, W, H) {
      g.fillStyle = INK; g.textBaseline = 'alphabetic';
      const em = ctx.assets.emblem_final_small; if (em) g.drawImage(em, 120, 104, 150, 150);
      g.font = '600 37px Cormorant'; spaced(g, 'FLIGHT CREW OPERATIONS', 300, 192, 8);
      g.font = '600 132px Cormorant'; spaced(g, 'MISSION ASSIGNMENT', W / 2, 610, 21, 'center');
      g.font = '500 68px NotoSerifSC'; spaced(g, '飞行任务通知书', W / 2, 735, 30, 'center');
      g.font = '500 76px Cormorant'; g.textAlign = 'center'; g.fillText('Dr. Jade Wang', W / 2, 930);
      g.font = '500 58px Cormorant'; g.fillText('Astronaut Office', W / 2, 1008); g.textAlign = 'left';
      g.font = '30px PlexMono'; g.fillText('REF FCO-36-0147 · IM-E1', 120, H - 88);
      g.textAlign = 'right'; g.fillText('PERSONAL — ADDRESSEE ONLY', W - 120, H - 88); g.textAlign = 'left';
    } },
  // round four (ENV): the same front on a real US No. 10 envelope, 241 x 105 mm (the envelope of a letter folded in
  // three). Same words, sizes and faces; only the layout is re-spaced for the lower sheet.
  envelopeFront10: { w: 2410, h: 1050, needs: ['emblem_final_small'],
    draw(g, ctx, W, H) {
      g.fillStyle = INK; g.textBaseline = 'alphabetic';
      const em = ctx.assets.emblem_final_small; if (em) g.drawImage(em, 112, 78, 132, 132);
      g.font = '600 34px Cormorant'; spaced(g, 'FLIGHT CREW OPERATIONS', 272, 156, 8);
      g.font = '600 132px Cormorant'; spaced(g, 'MISSION ASSIGNMENT', W / 2, 508, 21, 'center');
      g.font = '500 66px NotoSerifSC'; spaced(g, '飞行任务通知书', W / 2, 622, 30, 'center');
      g.font = '500 72px Cormorant'; g.textAlign = 'center'; g.fillText('Dr. Jade Wang', W / 2, 792);
      g.font = '500 54px Cormorant'; g.fillText('Astronaut Office', W / 2, 866); g.textAlign = 'left';
      g.font = '28px PlexMono'; g.fillText('REF FCO-36-0147 · IM-E1', 330, H - 62);
      g.textAlign = 'right'; g.fillText('PERSONAL — ADDRESSEE ONLY', W - 330, H - 62); g.textAlign = 'left';
    } },
};
// (Oct 8, round three: the memorandum sheet and the two seal sheets for the envelope's back are gone with the restaged
// 0:58 shots: the letter's print is in the take, and nothing stamps the flap. They are in git before this date.)

const tex = new Map();      // sheet name -> { tex, w, h }
const tracks = new Map();   // clip -> Promise<{ meta, paper }>
const occ = new Map();      // url -> Promise<texture>
const occLru = [];
const base = (clip) => { const [shot, take] = clip.split('/'); return `/media/gen/${encodeURIComponent(shot)}/roto/${take}/`; };

function sheetTex(ctx, name) {
  if (!tex.has(name)) {
    const sh = SHEETS[name];
    // enough texels for the sheet at about 1100 design px wide, x2, mip-mapped: glyph edges stay sharp at any scale
    const k = Math.min(2, (2200 * ctx.S) / sh.w);
    const c = makeCanvas(Math.round(sh.w * k), Math.round(sh.h * k)); const g = c.getContext('2d');
    g.scale(k, k); sh.draw(g, ctx, sh.w, sh.h);
    tex.set(name, { tex: ctx.gl.texture(c, { mip: true }), w: sh.w, h: sh.h });
  }
  return tex.get(name);
}
async function loadTrack(clip) {
  if (!tracks.has(clip)) tracks.set(clip, (async () => {
    const b = base(clip);
    const [meta, paper] = await Promise.all([(await fetch(b + 'meta.json')).json(), (await fetch(b + 'paper.json')).json()]);
    return { meta, paper };
  })());
  return tracks.get(clip);
}
function loadOcc(gl, url) {
  if (!occ.has(url)) {
    occ.set(url, loadImage(url).then((im) => gl.texture(im)));
    occLru.push(url);
    while (occLru.length > 6) { const old = occLru.shift(); const p = occ.get(old); occ.delete(old); p.then((t) => gl.gl.deleteTexture(t.tex)); }
  }
  return occ.get(url);
}

export const papertype = {
  init(ctx) { this.prog = ctx.gl.program(FS, 'papertype'); },
  async draw(ctx, shot, t, lt) {
    const p = shot.params || {};
    const sh = SHEETS[p.sheet]; if (!sh) throw new Error('papertype: no sheet ' + p.sheet);
    if (ctx.store) await ctx.store.need(sh.needs.filter((k) => ctx.store.has(k)));
    const S = sheetTex(ctx, p.sheet);
    const dur = Math.max(1e-3, shot.t1 - shot.t0);
    let quad, vis = 1, occTex = null, ink = 1;
    if (p.clip) {
      const { meta: M, paper } = await loadTrack(p.clip);
      const tr = paper.tracks[p.track || 'env'];
      const ct = clipTimeOf(p, t, lt);
      if ((p.showFrom !== undefined && ct < p.showFrom) || (p.showUntil !== undefined && ct >= p.showUntil)) return;   // clip seconds
      const fi = Math.max(0, Math.min(M.frames - 1, Math.floor(ct * M.fps + 1e-3)));
      const fd = drawingAt(M, p, t, lt);   // the same drawing the roto scene shows
      const F = tr.frames[Math.min(fd, tr.frames.length - 1)];
      if (!F || !F.q) return;                                    // the sheet is not in view in this drawing
      vis = F.vis ?? 1; ink = F.a ?? 1;   // a: the print's strength as the face turns edge-on (paper_track.py --follow)
      const a = p.from || { x: 0.5, y: 0.5, zoom: 1 }, b = p.to || a;
      const u = easeInOutSine(Math.min(1, Math.max(0, lt / dur)));
      const view = [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.zoom + (b.zoom - a.zoom) * u];
      const Tf = M.T[fd], Tii = M.Ti[fi];
      const ar = M.w / M.h, rar = 1920 / 1080;
      const span = ar > rar ? [rar / ar, 1] : [1, ar / rar];
      const hx = span[0] / view[2] * 0.5, hy = span[1] / view[2] * 0.5;
      const cx = Math.min(Math.max(view[0], hx), 1 - hx), cy = Math.min(Math.max(view[1], hy), 1 - hy);
      const toScreen = (x, y) => {
        const x0 = Tf[0] * x + Tf[1] * y + Tf[2], y0 = Tf[3] * x + Tf[4] * y + Tf[5];
        const xi = Tii[0] * x0 + Tii[1] * y0 + Tii[2], yi = Tii[3] * x0 + Tii[4] * y0 + Tii[5];
        return [((xi / M.w - cx) * view[2] / span[0] + 0.5) * 1920, ((yi / M.h - cy) * view[2] / span[1] + 0.5) * 1080];
      };
      quad = [0, 1, 2, 3].map((k) => toScreen(F.q[2 * k], F.q[2 * k + 1]));
      if (tr.mask) occTex = await loadOcc(ctx.gl, `${base(p.clip)}${tr.mask}${String(fd).padStart(4, '0')}.png`);
    } else {
      const img = ctx.assets[p.img]; if (!img) return;
      const m = plateMap({ par: [0, 0], ...p }, lt, dur, img);
      quad = p.quad.map((uv) => m.at(uv));
      vis = p.vis ?? 1;
    }
    const I = invHomography(quad);
    ctx.pipe.apply(this.prog, { uSheet: S.tex, uOcc: occTex || S.tex, uOccOn: occTex ? 1 : 0, uVis: vis, uAlpha: (p.alpha ?? 0.94) * ink,
      uI0: [I[0], I[1], I[2]], uI1: [I[3], I[4], I[5]], uI2: [I[6], I[7], I[8]] });
  },
};
