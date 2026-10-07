// SECTION 6 · BREAKDOWN — 111.95–122.77 — RUBBING (white on black). 举头望明月 rises as the family raise their heads;
// 低头思故乡 sinks on the Moon; one huge trembling 乡 is held 118.8–122.6.
// Video bases (K_6.1/take_4, J_6.2/take_3, J_6.2_visor/take_3) were tested as roto and rejected: the ink redraw
// cannot sit on rubbing paper, and both profiles lost the face (glasses, eyes) — stills keep the likeness.
// Everything is a stele rubbing — except Earth, the only coloured thing on the Moon: a section-local pass (EARTH) lifts
// the keyframe's own Earth back out of the rubbing in full colour, brightened so it reads at its true 1.9°.
import { lyricZH, card, hud, kf, ph, PALE, WHITE, smooth, easeInOutSine } from './_lib.js';

export const range = [111.95, 122.77];

const EARTH_FS = `
uniform sampler2D uPrev, uImg;
uniform vec4 uMap;     // uv = uMap.xy + (P/(1920,1080) - .5) * uMap.zw
uniform vec3 uE;       // Earth centre (uv) and radius (uv-x units)
uniform float uAr, uGain;
out vec4 o;
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 uv = uMap.xy + (P / vec2(1920., 1080.) - .5) * uMap.zw;
  vec2 d2 = (uv - uE.xy) * vec2(1., 1. / uAr);
  float d = length(d2) / uE.z;
  if (d > 1.3) { o = vec4(prev, 1.); return; }
  vec3 c = texture(uImg, uv).rgb;
  float l = luma(c);
  vec3 e = mix(vec3(l), c, 1.45) * 1.55;
  e = pow(max(e, 0.), vec3(0.88));
  // a hairline of atmosphere on the sunlit limb
  float limb = exp(-abs(d - 0.97) / 0.035) * smoothstep(0.02, 0.12, c.b + c.g - 2. * c.r + 0.1);
  e += vec3(0.45, 0.62, 0.9) * limb * 0.5;
  float m = smoothstep(1.12, 0.94, d) * smoothstep(-0.02, 0.05, c.b - c.r + 0.02);
  o = vec4(mix(prev, e, m * uGain), 1.);
}`;
// the plate's uv mapping (par 0, dolly 0), as in scenes/plate.js
function plateUV(pp, lt, dur, ar) {
  const u = easeInOutSine(lt / dur);
  const a = pp.from, b = pp.to || pp.from;
  const v = [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.zoom + (b.zoom - a.zoom) * u];
  const rar = 1920 / 1080, span = ar > rar ? [rar / ar, 1] : [1, ar / rar];
  const h = [span[0] / v[2] * 0.5 + 0.004, span[1] / v[2] * 0.5 + 0.004];
  const ctr = [Math.min(Math.max(v[0], h[0]), 1 - h[0]), Math.min(Math.max(v[1], h[1]), 1 - h[1])];
  return [ctr[0], ctr[1], span[0] / v[2], span[1] / v[2]];
}
function earth(ctx, img, pp, lt, dur, E, gain = 1) {
  const im = ctx.assets[img]; if (!im || !ctx.tex[img]) return;
  const ar = im.width / im.height;
  ctx.pipe.apply(ctx.gl.program(EARTH_FS, 'brk-earth'), { uImg: ctx.tex[img], uMap: plateUV(pp, lt, dur, ar), uE: E, uAr: ar, uGain: gain });
}

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const S61 = L.L14a.start, S62 = L.L14b.start, S62b = bar(64), S63 = 118.8, S64 = bar(66), DROP = bar(67);
  const rub = (img, o) => ({ name: 'plate', params: { img, grade: 'rubbing', from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.5, y: 0.5, zoom: 1.1 }, dolly: 0.05, masks: { base: [0.1, 0.6] }, ...o } });
  const gloss = (ctx, key, s, t, a, b) => card(ctx, key, { lines: [[{ t: s, font: 'CormorantItalic' }]], size: 32, x: 960, y: 1040, align: 'center', color: PALE }, t, a, b, 'over');
  const XX = 470, XY = 230; // the held 乡 stays put across 6.3 → 6.4
  const xiang = (ctx, t) => lyricZH(ctx, L.L14b, { from: 4, key: 'xiang', size: 560, x: XX, y: XY, color: WHITE, seed: 130, until: 122.62, shake: 2.2 * smooth(118.8, 119.6, t), early: 0.0, halo: 18 }, t, 'over');
  // the Moon shots: rubbing, no parallax (so the Earth pass registers exactly)
  const P62a = { from: { x: 0.5, y: 0.42, zoom: 1.06 }, to: { x: 0.56, y: 0.5, zoom: 1.16 } };
  const P62b = { from: { x: 0.5, y: 0.45, zoom: 1.04 }, to: { x: 0.5, y: 0.55, zoom: 1.12 } };
  const P63 = { from: { x: 0.52, y: 0.5, zoom: 1.04 }, to: { x: 0.49, y: 0.5, zoom: 1.32 } };
  const still = (img, pp) => ({ name: 'plate', params: { img, grade: 'rubbing', ...pp, dolly: 0, par: [0, 0] } });
  return [
    // 6.1 — EARTH: the Austin roof deck, Mid-Autumn; Kenton, T and M raise their heads; the camera tilts up with them
    { id: '6.1', t0: S61, t1: S62, paper: 'rubbing', grain: 61,
      scene: [X.has('K_6.1') ? rub('K_6.1', { from: { x: 0.5, y: 0.62, zoom: 1.12 }, to: { x: 0.5, y: 0.4, zoom: 1.12 } }) : ph('The family raise their heads to the full Moon', 'K_6.1')],
      type(ctx, t) {
        lyricZH(ctx, L.L14a, { size: 118, x: 1720, y: 300, color: WHITE, seed: 131, until: S62 + 0.05, dy: (tt) => -150 * smooth(S61, S62, tt) }, t, 'over');
        gloss(ctx, 'g61', 'I raise my head and gaze at the bright Moon,', t, S61 + 0.4, S62 + 0.05);
      } },
    // 6.2 — MOON: on the rim of Shackleton; Earth at its true size, the only colour in the rubbing
    { id: '6.2a', t0: S62, t1: S62b, paper: 'rubbing', grain: 62, focus: [1060, 520],
      scene: [X.has('K_6.2ii') ? still('K_6.2ii', P62a) : ph('Jade on the rim of Shackleton; Earth below her eye line', 'K_6.2ii')],
      type(ctx, t, lt) {
        earth(ctx, 'K_6.2ii', P62a, lt, S62b - S62, [0.6142, 0.487, 0.0125]);
        lyricZH(ctx, L.L14b, { to: 4, size: 104, x: 900, y: 120, color: WHITE, seed: 132, until: S63 + 0.05, dy: (tt) => 160 * smooth(S62, S63, tt) }, t, 'over');
        gloss(ctx, 'g62', 'I lower my head and think of home.', t, S62 + 0.4, S63 + 0.05);
      } },
    { id: '6.2b', t0: S62b, t1: S63, paper: 'rubbing', grain: 63, focus: [940, 640],
      scene: [X.has('J_6.2') ? still('J_6.2', P62b) : ph('Jade, head lowered; Earth in her visor', 'J_6.2')],
      type(ctx, t, lt) {
        earth(ctx, 'J_6.2', P62b, lt, S63 - S62b, [0.4923, 0.6019, 0.0215]);
        lyricZH(ctx, L.L14b, { to: 4, key: 'b', size: 104, x: 420, y: 150, color: WHITE, seed: 132, until: S63 + 0.05, dy: (tt) => 160 * smooth(S62, S63, tt) }, t, 'over');
        gloss(ctx, 'g62', 'I lower my head and think of home.', t, S62 + 0.4, S63 + 0.05);
      } },
    // 6.3 — 乡 held: close on her visor; the push carries us into the Earth reflected in it
    { id: '6.3', t0: S63, t1: S64, paper: 'rubbing', grain: 64, focus: [960, 540],
      scene: [X.has('J_6.2_visor') ? still('J_6.2_visor', P63) : ph('Close on the visor; Earth reflected', 'J_6.2_visor')],
      type(ctx, t, lt) { earth(ctx, 'J_6.2_visor', P63, lt, S64 - S63, [0.472, 0.505, 0.031]); xiang(ctx, t); } },
    // 6.4 — build gap: helmet-camera long exposure; the night side's city lights (NASA Black Marble) come up as she
    //       holds the exposure; the delta's lights become the glowing relief table in the museum (J_3.7) — memory
    { id: '6.4', t0: S64, t1: DROP, paper: 'rubbing', grain: 65, needs: ['bm4k', 'bmChina'],
      scene: [{ name: 'nightlights', params: {} },
        // the lights soak away into silk (a paper dissolve, not a crossfade), and the museum's relief globe is there
        ...(X.has('J_3.7') ? [{ name: 'paperfade', params: { paperTo: 'silk', fade: (t, lt) => smooth(0.9, 1.45, lt) } },
          { name: 'plate', params: { img: 'J_3.7', grade: 'native', from: { x: 0.3, y: 0.86, zoom: 2.4 }, to: { x: 0.4, y: 0.78, zoom: 1.7 }, opacity: (t, lt) => smooth(1.0, 1.55, lt) } }] : [])],
      type(ctx, t) { xiang(ctx, t); } },
  ];
}
