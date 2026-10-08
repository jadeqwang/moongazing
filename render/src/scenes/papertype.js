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
// and per-frame occlusion masks p_<track>_NNNN.png in SHEET space (white = bare paper, black = a hand is on it).
// The sheet rides the drawing (on twos) and the take's camera (on ones) exactly like the redrawn picture under it.
// Text content: docs/research_mission_assignment.md (sections 3 and 4), used verbatim.
import { PAPER_GLSL } from '../paper.js';
import { loadImage, makeCanvas, easeInOutSine } from '../util.js';
import { plateMap } from './plate.js';
import { drawingIndex, clipTimeOf } from '../roto/index.js';

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
      g.font = '30px PlexMono'; g.fillText('REF FCO-36-0147 · GH-E1', 120, H - 88);
      g.textAlign = 'right'; g.fillText('PERSONAL — ADDRESSEE ONLY', W - 120, H - 88); g.textAlign = 'left';
    } },
  // the memorandum, A4 (2100 x 2970), folded once for the C5 envelope with the head outward: the top half (1485) is
  // the panel that comes out. The whole page is set (research section 4); the tracked bare-paper mask shows only
  // what has really left the envelope.
  memo: { w: 2100, h: 1485, needs: ['emblem_final_small', 'seal_guanghan'],
    draw(g, ctx, W) {
      const L = 170, R = W - 170, body = 44, lead = 66;     // set large for a prop: about 12 px on screen at 1080p
      g.fillStyle = INK; g.textBaseline = 'alphabetic';
      g.font = '600 46px Cormorant'; spaced(g, 'FLIGHT CREW OPERATIONS', L, 180, 8);
      g.font = '500 40px Cormorant'; spaced(g, 'GUANGHAN STATION PROGRAMME', L, 238, 7);
      const em = ctx.assets.emblem_final_small; if (em) g.drawImage(em, R - 180, 90, 180, 180);
      g.strokeStyle = 'rgba(26,32,54,0.55)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(L, 312); g.lineTo(R, 312); g.stroke();
      g.font = `${body + 6}px PlexMonoMedium`; spaced(g, 'MEMORANDUM', L, 400, 10);
      g.font = `${body}px PlexMono`; g.textAlign = 'right'; g.fillText('Ref: FCO-36-0147', R, 400); g.fillText('9 June 2036', R, 400 + lead); g.textAlign = 'left';
      let y = 560;
      for (const [k, v] of [['TO:', 'Dr. Jade Wang, Astronaut Office'], ['FROM:', 'Director, Flight Crew Operations'], ['SUBJECT:', 'Crew Assignment — Guanghan Station, Expedition 1 (GH-E1)']]) { g.fillText(k, L, y); g.fillText(v, L + 260, y); y += lead; }
      y += 40;
      const paras = [
        ['1.', 'On the recommendation of the Chief, Astronaut Office, and with the concurrence of the Crew Operations Panel, you are assigned to the prime crew of Expedition 1 to Guanghan Station (89.5°S, Shackleton–de Gerlache ridge) as Mission Specialist — ISRU & Habitat Systems.'],
        ['2.', 'Expedition 1 is a crew of eight under Commander Chen Yu, launching as two crews of four. You are manifested on Flight E1-A.'],
        ['3.', 'Launch: no earlier than 8 August 2037, Wenchang, on a heavy-lift crew launch vehicle; lunar-orbit rendezvous with the pre-positioned lander. Planned stay on station: approximately 13 months.'],
        ['4.', 'Report to Crew Training at 0800 on Monday, 7 July 2036, to begin the assigned-crew training flow. Health stabilisation (quarantine) begins at L−14 days.'],
        ['5.', 'This assignment remains subject to flight medical certification by the Space Medicine Board.'],
      ];
      const wrap = (s, x, maxW, font) => { g.font = font; const out = []; let cur = '';
        for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
        if (cur) out.push(cur); return out; };
      for (const [n, s] of paras) { g.font = `${body}px PlexMono`; g.fillText(n, L, y);
        for (const ln of wrap(s, L + 100, R - L - 100, `${body}px PlexMono`)) { g.fillText(ln, L + 100, y); y += lead; } y += 30; }
      g.fillText('Congratulations, Jade. It is well earned. Go and tell your family.', L, y + 10); y += lead + 50;
      const zh = '王博士：经研究决定，你入选广寒站第一长期考察组主份乘组，担任任务专家（原位资源利用与居住舱系统）。指令长：陈宇。乘组共八人。计划不早于2037年8月8日自文昌发射，驻站约十三个月。请于2036年7月7日报到，开始任务训练。';
      g.font = '400 44px NotoSerifSC'; let cur = '';
      for (const ch of [...zh]) { if (g.measureText(cur + ch).width > R - L) { g.fillText(cur, L, y); y += 70; cur = ch; } else cur += ch; }
      if (cur) { g.fillText(cur, L, y); y += 70; }
      y += 150; const sl = ctx.assets.seal_guanghan; if (sl) g.drawImage(sl, R - 330, y - 190, 250, 250);
      g.font = `${body}px PlexMono`; g.fillText('W. N. Kamau', L, y); g.fillText('Director, Flight Crew Operations', L, y + lead);
      y += lead * 3; g.fillText('cc:  Chief, Astronaut Office', L, y); g.fillText('     Crew Flight Surgeon', L, y + lead); g.fillText('     Commander, Expedition 1', L, y + 2 * lead);
    } },
};

// the 廣寒 station seal stamped across the point of the flap on the envelope's BACK (sheet = the envelope, 2290 x 1460).
// SEAL_AT / FLAP_POINT are in sheet uv, measured on K_3.5_back by tools/paper_track.py. Whole while the envelope is
// closed; once the flap is lifted only the part stamped on the envelope body is left (the flap's part has gone up with
// the flap and now faces the desk).
export const SEAL_BACK = { at: [0.4974, 0.555], size: 205, rot: 0.07, flap: [0.4982, 0.62] };
const sealSheet = (broken) => ({ w: 2290, h: 1269, needs: ['seal_guanghan'],   // h/w = the painted envelope back's (0.554, tracked)
  draw(g, ctx, W, H) {
    const im = ctx.assets.seal_guanghan; if (!im) return;
    const [u, v] = SEAL_BACK.at, s = SEAL_BACK.size;
    g.save(); g.translate(u * W, v * H); g.rotate(SEAL_BACK.rot); g.drawImage(im, -s / 2, -s / 2, s, s); g.restore();
    if (broken) { g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(-40, -6); g.lineTo(W + 40, -6); g.lineTo(SEAL_BACK.flap[0] * W, SEAL_BACK.flap[1] * H + 5); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over'; }
  } });
SHEETS.sealWhole = sealSheet(false);
SHEETS.sealBroken = sealSheet(true);

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
    let quad, vis = 1, occTex = null;
    if (p.clip) {
      const { meta: M, paper } = await loadTrack(p.clip);
      const tr = paper.tracks[p.track || 'env'];
      const ct = clipTimeOf(p, t, lt);
      if ((p.showFrom !== undefined && ct < p.showFrom) || (p.showUntil !== undefined && ct >= p.showUntil)) return;   // clip seconds
      const fi = Math.max(0, Math.min(M.frames - 1, Math.floor(ct * M.fps + 1e-3)));
      const fd = drawingIndex(M, ct, p.twos !== false);
      const F = tr.frames[Math.min(fd, tr.frames.length - 1)];
      if (!F || !F.q) return;                                    // the sheet is not in view in this drawing
      vis = F.vis ?? 1;
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
    ctx.pipe.apply(this.prog, { uSheet: S.tex, uOcc: occTex || S.tex, uOccOn: occTex ? 1 : 0, uVis: vis, uAlpha: p.alpha ?? 0.94,
      uI0: [I[0], I[1], I[2]], uI1: [I[3], I[4], I[5]], uI2: [I[6], I[7], I[8]] });
  },
};
