// SECTION 4 · HOOK — 76.11–101.33 — the launch. GOLD paper; lyrics HUGE: 月缺 brushed down the exhaust column,
// 酒寒 over the crowd, 我思念 in the capsule, one enormous held 你, "I think of you" across the torn scroll.
// Section-local GL passes (run from type(), before the lyrics; they read the frame so far and write the new one):
//   LIFT  — K_4.1 taken apart: the rocket stays in frame (the camera tracks it) while the tower, the pad and the 泼墨
//           cloud fall away beneath it; the exhaust column stretches from the nozzles down to the falling pad.
//   TEAR  — stage separation: the scroll rips right→left along a jagged line (fibres fray from the dyed paper, silk
//           threads from the lower sheet, strands bridge the opening gap), the lower sheet hinges, lets go, tips away
//           and falls into the dark with the booster; flecks of paper tumble after it.
//   MOONIN — the Moon is a disc of xuan inlaid in the indigo: it grows from a dot until the ink paper is the frame.
import { lyricEN, lyricZH, card, hud, kf, ph, bump, INK, INKC, PALE, PALEC, WHITE, smooth, clamp } from './_lib.js';
import { PAPER_GLSL } from '../paper.js';

export const range = [76.11, 101.33];

// ---- LIFT ---------------------------------------------------------------------------------------------------------
const LIFT_FS = `${PAPER_GLSL}
uniform sampler2D uPrev, uImg;
uniform vec4 uCamA;            // P = uCamA.xy * uv + uCamA.zw  (design px)
uniform float uD, uT, uFlame, uOpacity;
uniform vec2 uShake;
out vec4 o;
const vec4 RK = vec4(0.482, 0.028, 0.532, 0.481);   // the rocket (image uv)
const vec4 MN = vec4(0.15, 0.07, 0.26, 0.23);       // the crescent
const vec3 SKY = vec3(0.184, 0.176, 0.232);
float box(vec2 u, vec4 b, float f){ return smoothstep(b.x - f, b.x + f, u.x) * smoothstep(b.z + f, b.z - f, u.x) * smoothstep(b.y - f, b.y + f, u.y) * smoothstep(b.w + f, b.w - f, u.y); }
vec3 bgAt(vec2 u){                 // the painting without its rocket; plain sky beyond its top edge
  float above = smoothstep(0.0, -0.05, u.y);
  vec2 m = vec2(1. - abs(1. - abs(u.x)), clamp(u.y, 0.002, 1.));
  vec3 c = texture(uImg, m).rgb;
  c = mix(c, texture(uImg, m - vec2(0.065, 0.)).rgb, box(m, RK, 0.004));
  c = mix(c, SKY * (0.94 + 0.12 * vnoise(u * vec2(40., 90.))), above);
  return c;
}
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 uv = (P - uCamA.zw) / uCamA.xy;
  vec3 c = bgAt(uv - vec2(0., uD));
  // the exhaust column, from the nozzles down to the (falling) pad: the plume's own brushwork, stretched and flowing
  float yN = RK.w - 0.006, yP = 0.535 + uD;
  float s = (uv.y - yN) / max(yP - yN, 1e-3);
  if (s > 0. && s < 1.2) {
    float sc = clamp(s, 0., 1.);
    float hw = mix(0.011, 0.028, pow(sc, 0.55));
    float cx = 0.507 + (fbm3(vec2(uv.y * 9. - uT * 2.2, 2.)) - .5) * 0.010 * sc;
    float colm = smoothstep(hw, hw * 0.4, abs(uv.x - cx)) * (1. - smoothstep(0.92, 1.2, s));
    vec2 src = vec2(0.504 + (uv.x - cx) * (0.024 / hw), mix(0.53, 0.64, sc));
    vec3 pl = texture(uImg, src).rgb;
    float flow = 0.72 + 0.56 * fbm3(vec2((uv.x - cx) * 140., uv.y * 26. - uT * 11.));
    c = max(c, pl * flow * colm * (0.9 + 0.25 * (1. - sc)));
  }
  // flame tongues at the nozzles (matte gold and ember; no glow)
  float dy = uv.y - yN;
  if (dy > -0.004 && uFlame > 0.) {
    float len = 0.026 * (0.8 + 0.4 * vnoise(vec2(uT * 21., 1.)));
    float fx = abs(uv.x - 0.507);
    float fl = smoothstep(0.016, 0.005, fx + max(dy, 0.) * 0.25) * exp(-max(dy, 0.) / len) * smoothstep(-0.004, 0.0, dy);
    vec3 fc = mix(vec3(0.86, 0.40, 0.16), vec3(1.0, 0.84, 0.55), exp(-max(dy, 0.) / (len * 0.35)));
    c = max(c, fc * fl * uFlame);
  }
  // the rocket: tracked by the camera, so it holds still in the frame (a hair of vibration)
  vec2 ur = uv + uShake;
  c = max(c, texture(uImg, ur).rgb * box(ur, RK, 0.0015));
  vec3 pm = vec3(0.09, 0.13, 0.245);
  vec3 col = c * mix(vec3(1.), prev / pm, 0.55);   // native grade on our indigo
  o = vec4(mix(prev, col, uOpacity), 1.);
}`;
// camera for an image of aspect ar: view centre (cx, cy) in image uv, zoom z (1 = image height fills the frame)
function camA(cx, cy, z, ar = 2752 / 1536) {
  const rar = 1920 / 1080, span = ar > rar ? [rar / ar, 1] : [1, ar / rar];
  const ax = 1920 * z / span[0], ay = 1080 * z / span[1];
  return [ax, ay, 960 - cx * ax, 540 - cy * ay];
}
function lift(ctx, t, lt, o) {
  if (!ctx.tex['K_4.1']) return;
  ctx.pipe.apply(ctx.gl.program(LIFT_FS, 'hook-lift'), {
    uImg: ctx.tex['K_4.1'], uCamA: camA(o.cx, o.cy, o.z), uD: o.D, uT: t, uFlame: o.flame ?? 1, uOpacity: 1,
    uShake: [Math.sin(t * 83.1) * 0.00035 * (o.shake ?? 1), Math.cos(t * 71.7) * 0.0003 * (o.shake ?? 1)],
  });
}

// ---- TEAR ---------------------------------------------------------------------------------------------------------
const TEAR_FS = `${PAPER_GLSL}
uniform sampler2D uPrev, uImg;
uniform float uXf, uSag, uSy, uRel, uT;
uniform vec4 uFall;            // tx, ty, rotation, scale of the falling sheet
uniform vec4 uLow;             // lower sheet's picture: u0, v0, du/px, dv/px
out vec4 o;
const vec2 C0 = vec2(960., 830.);
float edgeY(float x){
  return 574. + (fbm3(vec2(x * 0.0031, 1.7)) - .5) * 130. + (vnoise(vec2(x * 0.027, 4.)) - .5) * 26.
       + (vnoise(vec2(x * 0.18, 9.)) - .5) * 6. + (hash12(vec2(floor(x * 0.9), 3.)) - .5) * 1.8;
}
float sag(float x){ return uSag * pow(max(x - uXf, 0.) / 1000., 1.7); }
vec2 toSheet(vec2 P){
  vec2 q = P - C0 - uFall.xy;
  q = rot(uFall.z) * q;
  q /= vec2(uFall.w, uFall.w * uSy);
  q.x /= 1. - (1. - uSy) * 0.55 * clamp((830. - (q.y + C0.y)) / 300., -0.6, 1.);
  q += C0;
  q.y -= sag(q.x);
  return q;
}
float sheetIn(vec2 Q, float soft){
  return smoothstep(-soft, soft, Q.y - edgeY(Q.x)) * smoothstep(-soft, soft, Q.x) * smoothstep(1920. + soft, 1920. - soft, Q.x)
       * smoothstep(1124. + soft, 1124. - soft, Q.y);
}
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  // the dark backing behind the scroll
  vec3 col = vec3(0.020, 0.024, 0.048) * (0.75 + 0.5 * fbm3(P * 0.0035 + 3.)) + paperColor(2, P, 7.) * 0.18;
  // ---- the lower sheet (K_4.2 on silk), hinging and then falling away
  vec2 Q = toSheet(P);
  float EL = edgeY(Q.x);
  float tornL = max(smoothstep(uXf - 6., uXf + 30., Q.x), uRel);
  float dL = Q.y - EL;
  // its shadow on the backing (grows as it parts from the scroll)
  vec2 Qs = toSheet(P - vec2(10., 26.) * uRel);
  col *= 1. - 0.55 * uRel * sheetIn(Qs, 22.);
  float inL = sheetIn(Q, 0.8);
  // frayed silk: warp threads hang from the rip
  float tx = floor(Q.x / 2.6);
  float tl = (2. + 13. * pow(hash12(vec2(tx, 5.)), 2.5)) * tornL;
  float thread = step(0.5, hash12(vec2(tx, 6.))) * smoothstep(-tl, -tl * 0.15, dL) * step(dL, 0.)
               * smoothstep(1., 0.25, abs(fract(Q.x / 2.6) - .5) * 2.) * step(0., Q.x) * step(Q.x, 1920.);
  vec2 uvL = uLow.xy + vec2(Q.x * uLow.z, (Q.y - 560.) * uLow.w);
  vec3 low = texture(uImg, clamp(uvL, 0.001, 0.999)).rgb;
  low *= mix(vec3(1.), paperColor(1, Q, 4.4) / vec3(0.886, 0.816, 0.675), 0.55) * 1.12;
  low = mix(low, vec3(0.93, 0.88, 0.76), tornL * exp(-max(dL, 0.) / 2.6) * 0.55);            // pale silk at the rip
  low *= 1. - 0.38 * (1. - uSy) - 0.25 * uRel * exp(-max(dL, 0.) / 70.);                     // tipping away; the edge curls
  low *= 1. - 0.10 * uRel * smoothstep(0., 1., (Q.x - 960.) / 960.) * sign(uFall.z);
  col = mix(col, low, inL);
  col = mix(col, vec3(0.84, 0.78, 0.63) * (1. - 0.3 * (1. - uSy)), thread * (1. - inL) * 0.85);
  // ---- strands still bridging the opening gap (before the sheet lets go)
  float E = edgeY(P.x);
  float tornU = smoothstep(uXf - 6., uXf + 30., P.x);
  float gap = sag(P.x) * (1. - uRel);
  if (gap > 0.3 && P.y > E && P.y < E + gap + 2.) {
    float sx = floor(P.x / 3.3);
    float L = 5. + 34. * pow(hash12(vec2(sx, 11.)), 2.);
    float lean = (hash12(vec2(sx, 12.)) - .5) * 1.4;
    float xx = fract(P.x / 3.3 + lean * (P.y - E) / 3.3);
    float strand = step(0.72, hash12(vec2(sx, 13.))) * smoothstep(0.35, 0.0, abs(xx - .5)) * clamp(1. - gap / L, 0., 1.);
    col = mix(col, vec3(0.86, 0.82, 0.74), strand * 0.85);
  }
  // ---- the upper sheet (the frame so far): its torn edge shows the paler core of the dyed paper, fibres stick out
  float dU = E - P.y;
  float hx = floor(P.x / 1.7);
  float hl = (1.5 + 8. * pow(hash12(vec2(hx, 1.)), 3.)) * tornU;
  float hair = step(0.6, hash12(vec2(hx, 2.))) * smoothstep(-hl, -hl * 0.2, dU) * step(dU, 0.) * tornU;
  float inU = smoothstep(-0.7, 0.7, dU);
  // the upper edge's shadow falls on whatever is below it
  col *= 1. - 0.45 * tornU * smoothstep(-16., -2., dU) * (1. - inU);
  float rimU = tornU * exp(-max(dU, 0.) / 3.0) * (0.5 + 0.5 * vnoise(P * vec2(0.55, 0.18)));
  vec3 up = mix(prev, vec3(0.78, 0.77, 0.74), rimU * 0.8);
  col = mix(col, up, inU);
  col = mix(col, vec3(0.74, 0.74, 0.72), hair * 0.75 * (1. - inU));
  o = vec4(col, 1.);
}`;
const XF0 = 0.03, XF1 = 0.58; // the tear runs right → left over these seconds of the shot
const tearState = (lt) => {
  const k = clamp((lt - XF0) / (XF1 - XF0), 0, 1);
  const xf = 1980 - 2040 * Math.pow(k, 1.15);
  const tau = Math.max(0, lt - XF1);
  const rel = smooth(XF1 - 0.04, XF1 + 0.06, lt);
  const sagA = 34 * Math.pow(k, 0.8) * (1 - smooth(XF1, XF1 + 0.45, lt));
  return {
    xf, sag: sagA, rel,
    fall: [70 * tau + 40 * tau * tau, 20 * tau + 235 * tau * tau, 0.045 * smooth(XF1 - 0.05, XF1 + 0.3, lt) + 0.09 * tau + 0.2 * tau * tau, 1 / (1 + 0.3 * tau + 0.6 * tau * tau)],
    sy: 1 - 0.45 * smooth(0, 1.1, tau),
  };
};
function tear(ctx, t, lt) {
  if (!ctx.tex['K_4.2']) return;
  const S = tearState(lt);
  ctx.pipe.apply(ctx.gl.program(TEAR_FS, 'hook-tear'), {
    uImg: ctx.tex['K_4.2'], uXf: S.xf, uSag: S.sag, uSy: S.sy, uRel: S.rel, uT: t, uFall: S.fall,
    // the upper part of K_4.2 (v5 staging: the family large on the left): the rip runs through the sky above their heads,
    // never through them; rows above the picture's top repeat its sky
    uLow: [0.0, -0.035, 1 / 1920, 1 / 1072],
  });
  // flecks of paper and loose fibres tumbling after the falling sheet
  const tau = Math.max(0, lt - XF1);
  if (lt > XF0 && tau < 1.8) ctx.pipe.layer((g) => {
    let s = 9001; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 34; i++) {
      const x0 = r() * 1920, born = XF0 + (1 - (x0 + 60) / 2040) * (XF1 - XF0) + r() * 0.08;
      const age = lt - born; if (age <= 0) { r(); r(); r(); r(); r(); continue; }
      const vx = (r() - 0.5) * 120, vy = 30 + r() * 90, spin = (r() - 0.5) * 9, sz = 2 + Math.pow(r(), 2) * 7, kind = r();
      const x = x0 + vx * age, y = 572 + (r() - 0.5) * 70 + vy * age + 170 * age * age;
      const a = 0.9 * (1 - smooth(1.0, 1.7, age));
      if (a <= 0 || y > 1100) continue;
      g.save(); g.translate(x, y); g.rotate(spin * age + i);
      g.globalAlpha = a;
      if (kind < 0.7) { // a fleck of torn paper
        g.fillStyle = i % 3 ? 'rgba(214,204,182,1)' : 'rgba(64,74,110,1)';
        g.beginPath(); g.moveTo(-sz, -sz * 0.4); g.lineTo(sz * 0.7, -sz * 0.6); g.lineTo(sz, sz * 0.5); g.lineTo(-sz * 0.3, sz * 0.7); g.closePath(); g.fill();
      } else {          // a loose fibre
        g.strokeStyle = 'rgba(226,218,198,1)'; g.lineWidth = 0.7;
        g.beginPath(); g.moveTo(-sz * 2.2, 0); g.quadraticCurveTo(0, sz * 0.9, sz * 2.4, -sz * 0.3); g.stroke();
      }
      g.restore();
    }
  }, { mode: 'over', seed: 404 });
}

// ---- BLOOM: a picture soaking out of the silk from the centre (for roto shots, which have no reveal of their own)
const BLOOM_FS = `${PAPER_GLSL}
uniform sampler2D uPrev;
uniform float uP, uSeed;
out vec4 o;
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 q = P / vec2(1920., 1080.);
  float r = length((q - vec2(0.5, 0.55)) * vec2(1.6, 1.)) / 0.95 + (fbm3(q * 9.) - .5) * 0.12;
  float m = 1. - smoothstep(uP - 0.18, uP, r);
  o = vec4(mix(paperColor(1, P, uSeed), prev, m), 1.);
}`;

// ---- MOON IN ------------------------------------------------------------------------------------------------------
const MOONIN_FS = `${PAPER_GLSL}
uniform sampler2D uPrev;
uniform vec3 uC;     // x, y, R
uniform float uSeed;
out vec4 o;
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  float r = length(P - uC.xy);
  float ang = atan(P.y - uC.y, P.x - uC.x);
  // the xuan disc's deckle: fibrous, irregular by a few px (and by a little more as it grows)
  float dk = (fbm3(vec2(ang * 7., uSeed)) - .5) * (2.5 + uC.z * 0.012) + (vnoise(vec2(ang * uC.z * 0.9, 3.)) - .5) * 2.2;
  float d = r - (uC.z + dk);                                    // >0 outside the Moon
  vec3 ind = paperColor(2, P, uSeed);
  // 泥金 dust in the indigo around the disc: the reflected light, laid as gold, not glow
  float halo = exp(-max(d, 0.) / (6. + uC.z * 0.10)) * (0.55 + 0.45 * vnoise(P * 0.35));
  ind = mix(ind, goldInk(P, uSeed) * 0.85, halo * 0.32);
  float out_ = smoothstep(-0.8, 0.8, d);
  // a thin gold rule where the inlaid disc meets the indigo
  float rim = exp(-abs(d - 0.6) / 0.9) * smoothstep(3., 10., uC.z);
  // ink already brushed on the xuan (the lyric) becomes gold where the indigo covers it
  float inkAmt = smoothstep(0.18, 0.55, 1. - luma(prev) / 0.93);
  ind = mix(ind, goldInk(P, uSeed + 1.) * 0.95, inkAmt);
  vec3 col = mix(prev, ind, out_);
  col = mix(col, goldInk(P, uSeed + 3.), rim * 0.7);
  o = vec4(col, 1.);
}`;

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const W10 = (i) => L.L10.words[i].start;
  // re-timed hook (script v1.2): 4.1 月缺 · 4.2 酒寒 (寒 held) · 4.3 我思念 · 4.3b the held 你
  const S41 = bar(41), S42 = W10(2), S43 = W10(4), S43b = bar(44, 4), S44 = L.L11.start, S45 = bar(48), S46 = bar(49), S47 = L.L12.start, S48 = L.L13.start, S49 = bar(53), END = bar(55);
  // type punch: the paper jolts on every sung character of the hook
  const punch = (t, lt) => { let b = 0; for (const w of L.L10.words) { const d = t - w.start; if (d >= 0 && d < 0.5) b = Math.max(b, 0.011 * Math.exp(-d / 0.09)); } return { bump: Math.max(b, 0.016 * Math.exp(-lt / 0.12)) }; };
  const huge = { font: 'Cormorant', tracking: 0.01 };
  const gl = (ctx, key, s, t, a, b, color = PALE, y = 1040, x = 960) => card(ctx, key, { lines: [[{ t: s, font: 'CormorantItalic' }]], size: 34, x, y, align: 'center', color }, t, a, b, color === INK ? 'ink' : 'over');
  const D41 = (lt) => 0.5 * 0.07 * lt * lt;             // the world falling away under the tracked rocket (uv)
  const R48 = (lt) => 14 * Math.exp(1.63 * lt);           // the Moon's radius on the approach (px)
  return [
    // 4.1 — IGNITION on the 76.17 impact: the camera rides the rocket; the tower, the pad and the 泼墨 cloud fall away;
    //       月缺 brushed down beside the exhaust column
    { id: '4.1', t0: S41, t1: S42, paper: 'indigo', grain: 41, flash: true, post: (t, lt) => punch(t, lt), needs: ['K_4.1'],
      scene: X.has('K_4.1') ? [] : [ph('Ignition: splashed-ink exhaust in gold and ember', 'K_4.1')],
      type(ctx, t, lt) {
        const u = smooth(0, S42 - S41, lt);
        lift(ctx, t, lt, { cx: 0.515 - 0.008 * u, cy: 0.42 - 0.03 * u, z: 1.13 + 0.06 * u, D: D41(lt), shake: 1 + 2 * Math.exp(-lt / 0.4) });
        lyricZH(ctx, L.L10, { to: 2, size: 330, x: 690, y: 120, color: WHITE, seed: 101, until: S42 + 0.4, halo: 16 }, t, 'gold');
        hud(ctx, 'T+00:00:0' + Math.max(0, Math.floor(t - 76.17)), 64, 1030, { size: 18, rgb: '255,255,255' }, 1);
        gl(ctx, 'g41', 'The moon wanes,', t, 77.4, S42 + 0.05, PALE, 1040, 1380);
      } },
    // 4.2 — the same spot as 1.6, a few minutes later (restaged Oct 7): the rocket climbs at the right; M (left arm
    //       round Kenton's neck) points up at it with her right arm, T holds Kenton's left hand, all three heads follow
    //       it. K_4.2/take_9 (h3), 0.5–3.0 s of the take (the rocket leaves the top of the frame at 3.3 s).
    //       酒寒 (寒 held) stands in the empty sky right of the exhaust column, above the crescent; the gloss under it.
    { id: '4.2', t0: S42, t1: S43, paper: 'silk', grain: 42, focus: [1150, 380], post: (t, lt) => punch(t, lt),
      scene: [X.has('K_4.2') ? { type: 'roto', clip: 'K_4.2/take_9', paper: 'silk', offset: 0.5, lock: 0, from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.5, y: 0.47, zoom: 1.07 } }
        : ph('The crowd at the fence; Kenton holds M; the rocket rises', 'K_4.2')],
      type(ctx, t) {
        lyricZH(ctx, L.L10, { from: 2, to: 4, size: 190, x: 1700, y: 28, color: PALEC, seed: 102, until: S43 + 0.05, key: 'b', halo: 12 }, t, 'over');
        gl(ctx, 'g42', 'the wine is cold —', t, 79.0, S43 + 0.05, PALE, 474, 1608);
      } },
    // 4.3 — 我思念 is carried by the calligraphy over Jade braced under g-load, thinking of home. The sung LS3 takes
    //       fail the mouth/jaw/teeth audit. J_4.3/take_1 is a verified non-singing performance from J_LS3: breathing,
    //       a blink and small head motion; its lips stay at rest. Preserve the moving eyes and draw on every frame.
    { id: '4.3', t0: S43, t1: S43b, paper: 'indigo', grain: 43, post: (t, lt) => punch(t, lt), focus: [1300, 480],
      scene: [{ type: 'roto', clip: 'J_4.3/take_1', paper: 'gold', offset: 0.55, lock: 0, mouth: false,
        eyelock: false, redrawAll: 1, twos: false, from: { x: 0.52, y: 0.5, zoom: 1.04 }, to: { x: 0.54, y: 0.49, zoom: 1.06 } }],
      type(ctx, t) {
        lyricZH(ctx, L.L10, { from: 5, to: 8, size: 200, x: 330, y: 150, color: WHITE, seed: 103, until: S43b + 0.05, key: 'c', halo: 12 }, t, 'gold');
        hud(ctx, 'MAX-Q  ·  3.2 G', 64, 1030, { size: 15, rgb: '255,255,255' }, 1);
      } },
    // 4.3b — the held 你 lands on who she misses: summer, an Austin splash park (wide, then close on bar 46). The
    //        painting blooms out of the silk like water; one enormous 你, held, the ink creeping into the paper.
    ...[['4.3b', S43b, X.has('K_4.3b_close') ? bar(46) : S44, 'K_4.3b'], ...(X.has('K_4.3b_close') ? [['4.3c', bar(46), S44, 'K_4.3b_close']] : [])].map(([id, a, b, img], i) => ({
      id, t0: a, t1: b, paper: 'silk', grain: 431 + i, focus: i ? [1150, 470] : [760, 560],
      scene: [X.has(img) ? { type: 'roto', clip: i ? 'K_4.3b_close/take_2' : 'K_4.3b/take_2', paper: 'silk', offset: i ? 2.45 : 0.6, lock: 0, subject: false, maskGain: 8, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.4 }, from: { x: i ? 0.73 : 0.5, y: i ? 0.53 : 0.5, zoom: i ? 1.62 : 1.04 }, to: { x: i ? 0.73 : 0.52, y: i ? 0.60 : 0.48, zoom: i ? 1.62 : 1.1 } }
        : X.has(img) ? kf(img, { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.52, y: 0.48, zoom: 1.12 }, dolly: 0.06,
        mist: { color: [0.97, 0.97, 0.96], amount: 0.16, y0: 300, y1: 1000, speed: 26 }, ...(i === 0 ? { reveal: (t, lt) => 0.25 + smooth(0, 0.42, lt) * 1.4 } : {}) })
        : ph('Summer at an Austin splash park: M runs through the water arcs; T grins in the spray', img)],
      type(ctx, t, lt) {
        if (i === 0 && lt < 0.45) ctx.pipe.apply(ctx.gl.program(BLOOM_FS, 'hook-bloom'), { uP: 0.25 + smooth(0, 0.42, lt) * 1.4, uSeed: 4.31 });
        // the held 你 sits in the 留白 away from the children: top right over the trees while M runs left (4.3b), top
        // left over the arc of water in the close (4.3c)
        lyricZH(ctx, L.L10, { from: 8, size: 540, x: i ? 650 : 1900, y: 40, color: INKC, seed: 104, until: S44 + 0.05, key: 'd', early: 0.45, spread: (tt) => 30 * smooth(83.3, 86.1, tt) }, t, 'ink');
        gl(ctx, 'g43', 'I miss you.', t, 83.4, S44 + 0.05, INK, 1040, 1380);
      },
    })),
    // 4.4 — first-stage separation = THE SCROLL TEARS: the lower sheet (the crowd, Earth, family) rips away and falls
    { id: '4.4', t0: S44, t1: S45, paper: 'indigo', grain: 44, needs: ['K_4.1', 'K_4.2'],
      post: (t, lt) => ({ bump: 0.013 * Math.exp(-Math.max(0, lt - XF1) / 0.1) * (lt > XF1 - 0.02 ? 1 : 0) }),
      scene: X.has('K_4.1') && X.has('K_4.2') ? [] : [ph('Stage separation: the scroll tears', 'K_4.1')],
      type(ctx, t, lt) {
        lift(ctx, t, lt, { cx: 0.645, cy: 0.52, z: 0.86, D: 1.05 + 0.05 * lt, shake: 0.6 + 3 * Math.exp(-Math.max(0, lt - XF1) / 0.15) * (lt > XF1 ? 1 : 0) });
        tear(ctx, t, lt);
        hud(ctx, 'MET 00:02:41  ·  STAGE 1 SEP', 64, 72, { size: 15, rgb: '255,255,255' }, 1);
        lyricEN(ctx, L.L11, { ...huge, size: 132, x: 1320, y: 250, align: 'center', color: '#ffffff', w1: 4, text: { 3: 'you,' }, until: S45 + 0.05 }, t, 'gold');
      } },
    // 4.5 — the kids in the mission family room at Wenchang, faces lit by the big screen
    { id: '4.5', t0: S45, t1: S46, paper: 'silk', grain: 45,
      scene: [X.has('K_4.5') ? { type: 'roto', clip: 'K_4.5/take_2', paper: 'silk', offset: 0.6, lock: 0, subject: false, maskGain: 8, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.4 }, from: { x: 0.5, y: 0.5, zoom: 1.03 }, to: { x: 0.53, y: 0.49, zoom: 1.1 } }
        : ph('The kids in the family viewing room, faces lit by the big screen; T’s hand on the glass', 'K_4.5')],
      type(ctx, t) { lyricEN(ctx, L.L11, { ...huge, key: 'b', size: 120, x: 1860, y: 850, align: 'right', color: PALE, w0: 4, hold: 1.2, panel: 'dark' }, t, 'over'); } },
    // 4.6 — orbit: Earth fills the frame for the first time — a 青绿 painting
    { id: '4.6', t0: S46, t1: S47, paper: 'indigo', grain: 46,
      scene: [X.has('K_4.6') ? kf('K_4.6', { from: { x: 0.5, y: 0.55, zoom: 1.06 }, to: { x: 0.56, y: 0.5, zoom: 1.12 }, par: [0.02, 0], masks: { base: [0.3, 0.6] }, reveal: (t, lt) => smooth(0, 0.4, lt) * 1.6, mist: { color: [0.96, 0.96, 0.95], amount: 0.14, y0: 300, y1: 1080, speed: 20 } }) : ph('Orbit: Earth as a qinglü painting', 'K_4.6')],
      type(ctx, t) { hud(ctx, 'ORBIT  ·  200 KM  ·  7.8 KM/S', 64, 1030, { size: 15, rgb: '255,255,255' }, 1); } },
    // 4.7 — after TLI: in free fall Jade lifts a drink pouch toward the Moon — 举杯; the calligraphy floats too
    { id: '4.7', t0: S47, t1: S48, paper: 'indigo', grain: 47,
      scene: [X.has('K_4.7') ? { type: 'roto', clip: 'K_4.7/take_4', paper: 'silk', offset: 0.6, lock: 0, from: { x: 0.47, y: 0.5, zoom: 1.03 }, to: { x: 0.44, y: 0.47, zoom: 1.12 } }
        : ph('After TLI: in free fall Jade lifts a drink pouch toward the Moon; the toy Earth floats beside her', 'K_4.7', { dark: true })], focus: [520, 420],
      type(ctx, t) {
        lyricZH(ctx, L.L12, { size: 128, x: 1880, y: 110, color: WHITE, seed: 104, dy: (tt) => -26 * Math.sin((tt - 92.2) * 1.3) }, t, 'gold');
        hud(ctx, 'TLI COMPLETE  ·  10.9 KM/S', 64, 72, { size: 15, rgb: '255,255,255' }, 1);
      } },
    // 4.8 — the Moon grows from a dot to a wall of ink: a disc of xuan inlaid in the indigo, until the ink paper is the
    //       whole frame (GOLD → INK)
    { id: '4.8', t0: S48, t1: S49, paper: 'xuan', grain: 48,
      scene: [{ name: 'inkmoon', params: { mode: 'photo', halo: 0.0, placeAt: (t, lt) => ({ x: 960, y: 540, R: R48(lt) }) } }],
      type(ctx, t, lt) {
        // the lyric is brushed in ink on the xuan; outside the Moon the pass turns that ink into gold on indigo, so the
        // line changes paper exactly where the limb passes under it
        lyricEN(ctx, L.L13, { ...huge, size: 118, x: 960, y: 960, align: 'center', color: INK, hold: 0.8 }, t, 'ink');
        const R = R48(lt);
        if (R < 1500) ctx.pipe.apply(ctx.gl.program(MOONIN_FS, 'hook-moonin'), { uC: [960, 540, R], uSeed: 4.8 });
      } },
    // 4.9 — drums re-hit: DAY 4 · DESCENT. The lander's plume blasts regolith in flat radial sheets that stop the
    //       instant the engine cuts (K_4.9 take_2 redrawn in ink)
    { id: '4.9', t0: S49, t1: END, paper: 'xuan', grain: 49, flash: true, post: (t, lt) => bump(lt, 0.012),
      scene: [X.has('K_4.9') ? { type: 'roto', clip: 'K_4.9/take_2', paper: 'ink', offset: 0.55, lock: 0, subject: false, maskGain: 8, from: { x: 0.52, y: 0.46, zoom: 1.12 }, to: { x: 0.52, y: 0.5, zoom: 1.03 } }
        : ph('Descent: the lander’s plume blasts regolith flat', 'K_4.9')],
      type(ctx, t) { hud(ctx, 'DAY 4  ·  DESCENT', 64, 72, { size: 15, rgb: '30,30,32', a: 0.9 }, 1, 'ink'); hud(ctx, `ALT ${Math.max(0, Math.round(120 * (1 - (t - 97.73) / 2.5))).toString().padStart(3, '0')} M`, 64, 98, { size: 13, rgb: '30,30,32', a: 0.8 }, 1, 'ink'); } },
  ];
}
