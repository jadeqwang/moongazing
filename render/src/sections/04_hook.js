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

export const range = [75.08, 99.83];

// ---- LIFT ---------------------------------------------------------------------------------------------------------
const LIFT_FS = `${PAPER_GLSL}
uniform sampler2D uPrev, uImg;
uniform vec4 uCamA;            // P = uCamA.xy * uv + uCamA.zw  (design px)
uniform float uD, uT, uFlame, uOpacity;
uniform float uLt;             // 4.1: seconds since ignition, the whole exhaust is live; < 0: the plain stretched column (4.4)
uniform vec2 uShake;
out vec4 o;
const vec4 RK = vec4(0.482, 0.028, 0.532, 0.481);   // the rocket (image uv)
const vec4 MN = vec4(0.15, 0.07, 0.26, 0.23);       // the crescent
const vec3 SKY = vec3(0.184, 0.176, 0.232);
const float AR = 2752. / 1536.;
const float HZ = 0.7055;                            // the ruled horizon (image uv)
float box(vec2 u, vec4 b, float f){ return smoothstep(b.x - f, b.x + f, u.x) * smoothstep(b.z + f, b.z - f, u.x) * smoothstep(b.y - f, b.y + f, u.y) * smoothstep(b.w + f, b.w - f, u.y); }
// the flame's flicker, 0..1 (seeded noise of song time only)
float flick(float t){ return 0.6 * vnoise(vec2(t * 19., 3.)) + 0.4 * vnoise(vec2(t * 47., 7.)); }
// where the painting holds only exhaust (the 泼墨 cloud, its column, the spatter): the tower stands right of 0.56.
// Only this part of the picture may flow.
float plumeZone(vec2 u){
  return smoothstep(1.0, 0.55, length((u - vec2(0.39, 0.74)) / vec2(0.205, 0.31))) * smoothstep(0.566, 0.540, u.x);
}
// how much of the painting around a point is the cloud's pigment (a coarse look: thin ruled lines do not count)
float cloudAt(vec2 m){ vec3 l = textureLod(uImg, m, 5.5).rgb; return smoothstep(0.03, 0.15, l.r - l.b); }
vec3 bgAt(vec2 u){                 // the painting without its rocket; plain sky beyond its top edge
  float above = smoothstep(0.0, -0.05, u.y);
  vec2 m = vec2(1. - abs(1. - abs(u.x)), clamp(u.y, 0.002, 1.));
  float z = 0.;
  if (uLt >= 0.) {
    // the painted splash keeps spreading (cloud, column and flying spatter move outward together): the picture itself
    // is slowly enlarged inside the plume's zone, about a point ON the ruled horizon, so that line only slides along
    // itself. Above the horizon it grows a little faster: the cloud's top rolls up.
    z = plumeZone(m);
    float e = 0.50 * (1. - exp(-uLt / 1.5));
    vec2 d = m - vec2(0.500, HZ);
    float up = 1. + 1.3 * smoothstep(0., -0.03, d.y) * exp(d.y / 0.09);
    m = vec2(0.500, HZ) + d / (1. + e * z * vec2(1., up));
    // the body of the cloud and the column roll: a slow flow of the pigment only (never the ruled lines)
    float body = z * cloudAt(m);
    vec2 q = (m - vec2(0.5, 0.87)) * vec2(AR, 1.);
    vec2 roll = vec2(fbm3(q * 7.5 + vec2(3., uLt * 0.42)), fbm3(q * 7.5 + vec2(31., -uLt * 0.36))) - .5;
    roll += 0.5 * (vec2(fbm3(q * 19. + vec2(uLt * 0.8, 5.)), fbm3(q * 19. + vec2(9., uLt * 0.7))) - .5);
    m += roll * body * vec2(0.012 / AR, 0.012);
  }
  vec3 c = texture(uImg, m).rgb;
  c = mix(c, texture(uImg, m - vec2(0.065, 0.)).rgb, box(m, RK, 0.004));
  if (uLt >= 0.) {
    // it thins as it spreads, and the flame's flicker lights it from inside (the pigment only: never the indigo ground)
    float warm = smoothstep(0.03, 0.16, c.r - c.b);
    float lit = exp(-length((m - vec2(0.507, 0.76)) * vec2(AR, 1.)) / 0.17);
    c = mix(c, SKY, z * warm * 0.30 * smoothstep(0.3, 2.85, uLt) * (1. - 0.6 * lit));
    c *= 1. + z * warm * lit * 0.55 * (flick(uT) - 0.42);
  }
  c = mix(c, SKY * (0.94 + 0.12 * vnoise(u * vec2(40., 90.))), above);
  return c;
}
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 uv = (P - uCamA.zw) / uCamA.xy;
  vec3 c = bgAt(uv - vec2(0., uD));
  float yN = RK.w - 0.006;
  if (uLt < 0.) {
    // the exhaust column, from the nozzles down to the (falling) pad: the plume's own brushwork, stretched and flowing
    float yP = 0.535 + uD;
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
  } else {
    // ---- 4.1: the whole exhaust is live for the whole shot --------------------------------------------------------
    vec2 w = uv - vec2(0., uD);                       // the world (image uv): it falls away under the tracked rocket
    float fk = flick(uT);
    float dyN = uv.y - yN;                            // below the nozzles, in the rocket's frame
    // (1) THE TRAIL. Exhaust hangs where it was left, so it is anchored to the world and the column lengthens as the
    //     rocket climbs. Its age at a height = the time since the nozzles passed it (D = k lt^2); it widens, drifts
    //     and thins with age; fast streaks run down it only while it is young.
    float kk = uD / max(uLt * uLt, 1e-4);
    float age = uLt - sqrt(max(uD - dyN, 0.) / max(kk, 1e-5));
    float yG = 0.80 + uD;                             // the pad's deck: there the column runs into the ground cloud
    if (dyN > 0. && uv.y < yG + 0.03) {
      float cx = 0.507 + (fbm3(vec2(w.y * 6., 2.)) - .5) * 0.022 * smoothstep(0., 1.6, age);
      float dx = uv.x - cx, sd = step(0., dx);
      float hw = (0.0145 + 0.018 * (1. - exp(-age / 0.5)) + 0.003 * age) * mix(0.42, 1., smoothstep(0.0, 0.13, dyN));
      // each edge billows on its own: round lobes with sharp valleys between them, as the painted cloud has
      hw *= 0.80 + 0.34 * abs(2. * vnoise(vec2(w.y * 21. + sd * 37., 1.5 + age * 0.35)) - 1.) + 0.16 * (fbm3(vec2(w.y * 60. + sd * 11., age * 0.6)) - .5);
      float ad = abs(dx);
      float a = (0.82 * smoothstep(hw, hw * 0.86, ad) + 0.18 * smoothstep(hw * 1.45, hw * 0.7, ad))
              * smoothstep(0.004, 0.045, dyN) * (1. - smoothstep(yG - 0.05, yG + 0.03, uv.y));
      // the wash inside: long streaks down the column, slowly turning over; fast streaks only while it is young
      vec2 p = vec2(dx / hw * 2.1, w.y * 8.5);
      float slow = fbm(p + 0.8 * vec2(fbm3(p * 1.3 + vec2(0., age * 0.5)), fbm3(p * 1.3 + vec2(7., -age * 0.42))));
      float fast = fbm3(vec2(dx * 150., uv.y * 24. - uT * 10.));
      float val = mix(slow, fast, exp(-age / 0.30));
      float rimW = exp(-abs(ad - hw * 0.93) / (hw * 0.07));                            // the wet edge of a wash
      float thin = mix(1.0, 0.66, smoothstep(0.3, 2.6, age));
      float gran = 0.92 + 0.16 * vnoise(P * 0.45);                                     // pigment settling in the paper
      // its pigment is the painted column's own (sampled from the picture), so the two are one column
      vec3 pc = texture(uImg, vec2(0.505 + clamp(dx / hw, -1., 1.) * 0.020, 0.60 + 0.045 * sin(w.y * 11.))).rgb;
      pc = max(pc, vec3(0.56, 0.44, 0.27)) * vec3(1.06, 1.0, 0.94) * (0.74 + 0.60 * val + 0.14 * rimW);
      pc = mix(pc, vec3(0.99, 0.82, 0.52), 0.50 * exp(-age / 0.35));                   // still hot just under the flame
      pc = mix(pc, vec3(0.92, 0.52, 0.22), 0.28 * exp(-dyN / 0.06));                   // ember
      c = max(c, pc * a * thin * gran * (1. + 0.40 * (fk - 0.4) * exp(-dyN / 0.10)));
    }
    // (2) THE FLAMES: one tongue per engine cluster (matte gold and ember; no glow), each flickering on its own
    if (dyN > -0.004 && uFlame > 0.) {
      for (int i = -1; i <= 1; i++) {
        float fi = float(i);
        float len = (i == 0 ? 0.135 : 0.105) * (0.80 + 0.40 * vnoise(vec2(uT * 23., 1. + fi * 3.7)));
        float sF = max(dyN, 0.) / len;
        float xc = 0.507 + fi * 0.0128 * (1. - 0.45 * clamp(sF, 0., 1.)) + (vnoise(vec2(uT * 31. + fi * 5., sF * 4.)) - .5) * 0.005 * sF;
        float hwF = (i == 0 ? 0.0062 : 0.0050) * (1. + 1.5 * sF) * pow(max(1. - sF, 0.), 0.55);
        float fl = smoothstep(hwF, hwF * 0.25, abs(uv.x - xc)) * smoothstep(-0.004, 0.001, dyN) * step(sF, 1.);
        fl *= 0.84 + 0.16 * sin(sF * 24. - uT * 42. + fi);
        vec3 fc = mix(vec3(1.0, 0.87, 0.60), vec3(0.88, 0.42, 0.17), smoothstep(0.12, 0.95, sF));
        c = max(c, fc * fl * uFlame * (0.86 + 0.28 * fk));
      }
    }
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
    uImg: ctx.tex['K_4.1'], uCamA: camA(o.cx, o.cy, o.z), uD: o.D, uT: t, uFlame: o.flame ?? 1, uOpacity: 1, uLt: o.live ? lt : -1,
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
        lift(ctx, t, lt, { cx: 0.515 - 0.008 * u, cy: 0.42 - 0.03 * u, z: 1.13 + 0.06 * u, D: D41(lt), shake: 1 + 2 * Math.exp(-lt / 0.4), live: true });
        lyricZH(ctx, L.L10, { to: 2, size: 330, x: 690, y: 120, color: WHITE, seed: 101, until: S42 + 0.4, halo: 16 }, t, 'gold');
        hud(ctx, 'T+00:00:0' + Math.max(0, Math.floor(t - 75.16)), 64, 1030, { size: 18, rgb: '255,255,255' }, 1);
        gl(ctx, 'g41', 'The moon wanes,', t, 76.70, S42 + 0.05, PALE, 1040, 1380);
      } },
    // 4.2 — the same spot as 1.6, a few minutes later (restaged Oct 7): the rocket climbs at the right; M (left arm
    //       round Kenton's neck) points up at it with her right arm, T holds Kenton's left hand, all three heads follow
    //       it. K_4.2/take_9 (h3), 0.5–3.0 s of the take (the rocket leaves the top of the frame at 3.3 s).
    //       酒寒 (寒 held) stands in the empty sky right of the exhaust column, above the crescent; the gloss under it.
    { id: '4.2', t0: S42, t1: S43, paper: 'silk', grain: 42, focus: [1150, 380], post: (t, lt) => punch(t, lt),
      // rev5 (Oct 9, Jade: "it looks like a still image moving on another still image"): since rev3 M's hair was the
      // PAINTING's, carried on the take as a rigid cut-out while her father lifts her and her head tilts back. Now nothing
      // is carried: take_9d is take_9 prepared with `roto_prep.py --detail` (no mean-shift flattening, which was what
      // turned the take's own braid into a brown mass), shown in the take's own tones, so her braid, elastic and tail
      // are the video's and move with her head. 1.6 still carries the painting (she hardly moves there).
      scene: [X.has('K_4.2') ? { type: 'roto', clip: 'K_4.2/take_9d', paper: 'silk', style: { snapAmt: 0, shade: 0, gran: 0, lineA: 0 }, offset: 0.5, lock: 0, from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.5, y: 0.47, zoom: 1.07 } }
        : ph('The crowd at the fence; Kenton holds M; the rocket rises', 'K_4.2')],
      type(ctx, t) {
        lyricZH(ctx, L.L10, { from: 2, to: 4, size: 190, x: 1700, y: 28, color: PALEC, seed: 102, until: S43 + 0.05, key: 'b', halo: 12 }, t, 'over');
        gl(ctx, 'g42', 'the wine is cold —', t, 77.93, S43 + 0.05, PALE, 474, 1608);
      } },
    // 4.3 — 我思念, NOT sung (rev4 PHOTO, Oct 8 night; Jade: "a shot of me looking longingly at a picture of the kids
    //       without singing"): the sequel of 3.8f, close. From behind her left shoulder in the capsule seat, visor down
    //       and clear, mouth closed, her head tips toward the snapshot of M and T taped below the window; the snapshot
    //       is the only warm colour in the frame (the focus). Keyframe media/keyframes/jade/J_4.3p.png (codex over her
    //       photograph; PROMPTS_J43P.md); J_4.3p/take_1s = h3 take_1 with the model's camera shake taken out
    //       (tools/take_steady.py), 0.5–1.9 s of the take. Look of the 3.8 montage: gold line, chalk-white suit, indigo.
    //       Only she is redrawn (tools/roto_only.py); the cabin and the snapshot are the painting in every frame.
    //       Rebuild order: take_steady.py, roto_prep.py J_4.3p/take_1s, roto_only.py (commands in media/gen/picks.json).
    //       Earlier versions of this shot: sung LS3c/take_7pm (v6), non-singing portrait J_4.3/take_1.
    //       rev5 VISOR (Oct 9; Jade ticked "This works" and "Make the visor gold as at 1:15, so my face is hidden"):
    //       the visor is opaque gold, the helmet of 3.8f. J_4.3p/take_1g = the same video as take_1s; its roto key plate
    //       has the gold visor of media/keyframes/jade/J_4.3p_gold.png laid in (media/keyframes/work/rev5_visor/
    //       visor_gold.py key), and the whole visor with its outline is that painting carried on the tracked motion of
    //       the helmet's frame strip and ear cup, so the gold cannot slide or shimmer. Clear visor again: clip 'J_4.3p/take_1s'.
    { id: '4.3', t0: S43, t1: S43b, paper: 'indigo', grain: 43, post: (t, lt) => punch(t, lt), focus: [1560, 630], vignette: 0.2,
      scene: [{ type: 'roto', clip: 'J_4.3p/take_1g', paper: 'silk', style: { ink: [0.80, 0.66, 0.38], lineA: 0.8 }, offset: 0.5, lock: 0, mouth: false, eyelock: false, keepOcc: false /* the painted gold visor rides on the tracked motion of the helmet's frame strip and ear cup (tools/roto_keep.py --track) */,
        from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.515, y: 0.5, zoom: 1.05 } }],
      type(ctx, t) {
        lyricZH(ctx, L.L10, { from: 5, to: 8, size: 180, x: 290, y: 110, color: WHITE, seed: 103, until: S43b + 0.05, key: 'c', halo: 12 }, t, 'gold');
        hud(ctx, 'MAX-Q  ·  3.2 G', 64, 1030, { size: 15, rgb: '255,255,255' }, 1);
      } },
    // 4.3b — the held 你 lands on who she misses: summer, an Austin splash park (wide, then close on bar 46). The
    //        painting blooms out of the silk like water; one enormous 你, held, the ink creeping into the paper.
    //        rev3 KIDS (Oct 8): K_4.3b v2 = T's head repainted to his v3 sheet (fuller cheeks); take_6 is from it.
    ...[['4.3b', S43b, X.has('K_4.3b_close') ? bar(46) : S44, 'K_4.3b'], ...(X.has('K_4.3b_close') ? [['4.3c', bar(46), S44, 'K_4.3b_close']] : [])].map(([id, a, b, img], i) => ({
      id, t0: a, t1: b, paper: 'silk', grain: 431 + i, focus: i ? [1150, 470] : [760, 560],
      scene: [X.has(img) ? { type: 'roto', clip: i ? 'K_4.3b_close/take_2' : 'K_4.3b/take_6', paper: 'silk', offset: i ? 2.45 : 0.6, lock: 0, subject: false, maskGain: 8, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.4 }, from: { x: i ? 0.73 : 0.5, y: i ? 0.53 : 0.5, zoom: i ? 1.62 : 1.04 }, to: { x: i ? 0.73 : 0.52, y: i ? 0.60 : 0.48, zoom: i ? 1.62 : 1.1 } }
        : X.has(img) ? kf(img, { from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.52, y: 0.48, zoom: 1.12 }, dolly: 0.06,
        mist: { color: [0.97, 0.97, 0.96], amount: 0.16, y0: 300, y1: 1000, speed: 26 }, ...(i === 0 ? { reveal: (t, lt) => 0.25 + smooth(0, 0.42, lt) * 1.4 } : {}) })
        : ph('Summer at an Austin splash park: M runs through the water arcs; T grins in the spray', img)],
      type(ctx, t, lt) {
        if (i === 0 && lt < 0.45) ctx.pipe.apply(ctx.gl.program(BLOOM_FS, 'hook-bloom'), { uP: 0.25 + smooth(0, 0.42, lt) * 1.4, uSeed: 4.31 });
        // the held 你 sits in the 留白 away from the children: top right over the trees while M runs left (4.3b), top
        // left over the arc of water in the close (4.3c)
        lyricZH(ctx, L.L10, { from: 8, size: 540, x: i ? 650 : 1900, y: 40, color: INKC, seed: 104, until: S44 + 0.05, key: 'd', early: 0.45, spread: (tt) => 30 * smooth(82.10, 84.15, tt) }, t, 'ink');
        gl(ctx, 'g43', 'I miss you.', t, 82.20, S44 + 0.05, INK, 1040, 1380);
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
      scene: [X.has('K_4.5') ? { type: 'roto', clip: 'K_4.5/take_2', paper: 'silk', offset: 0.6, lock: 0, keepOcc: false /* rev3 KIDS: T's repainted profile (fuller cheek) is carried, tools/roto_keep.py */, subject: false, maskGain: 8, style: { snapAmt: 0.12, lineTh: 0.64, lineA: 0.4 }, from: { x: 0.5, y: 0.5, zoom: 1.03 }, to: { x: 0.53, y: 0.49, zoom: 1.1 } }
        : ph('The kids in the family viewing room, faces lit by the big screen; T’s hand on the glass', 'K_4.5')],
      type(ctx, t) { lyricEN(ctx, L.L11, { ...huge, key: 'b', size: 120, x: 1860, y: 850, align: 'right', color: PALE, w0: 4, hold: 1.2, panel: 'dark' }, t, 'over'); } },
    // 4.6 — orbit: Earth fills the frame for the first time — a 青绿 painting
    // 4.6 — rev6 (Oct 9): a straight cut. The ink-bloom opening put one blank indigo frame and a ragged hole on the
    // song's stutter at 89.2 s, which read as a dropped frame.
    { id: '4.6', t0: S46, t1: S47, paper: 'indigo', grain: 46,
      scene: [X.has('K_4.6') ? kf('K_4.6', { from: { x: 0.5, y: 0.55, zoom: 1.06 }, to: { x: 0.56, y: 0.5, zoom: 1.12 }, par: [0.02, 0], masks: { base: [0.3, 0.6] }, mist: { color: [0.96, 0.96, 0.95], amount: 0.14, y0: 300, y1: 1080, speed: 20 } }) : ph('Orbit: Earth as a qinglü painting', 'K_4.6')],
      type(ctx, t) { hud(ctx, 'ORBIT  ·  200 KM  ·  7.8 KM/S', 64, 1030, { size: 15, rgb: '255,255,255' }, 1); } },
    // 4.7 — after TLI: in free fall Jade lifts a drink pouch toward the Moon — 举杯; the calligraphy floats too
    { id: '4.7', t0: S47, t1: S48, paper: 'indigo', grain: 47,
      scene: [X.has('K_4.7') ? { type: 'roto', clip: 'K_4.7/take_4', paper: 'silk', offset: 0.6, lock: 0, from: { x: 0.47, y: 0.5, zoom: 1.03 }, to: { x: 0.44, y: 0.47, zoom: 1.12 } }
        : ph('After TLI: in free fall Jade lifts a drink pouch toward the Moon; the toy Earth floats beside her', 'K_4.7', { dark: true })], focus: [520, 420],
      type(ctx, t) {
        lyricZH(ctx, L.L12, { size: 128, x: 1880, y: 110, color: WHITE, seed: 104, dy: (tt) => -26 * Math.sin((tt - 90.87) * 1.3) }, t, 'gold');
        hud(ctx, 'TLI COMPLETE  ·  10.9 KM/S', 64, 72, { size: 15, rgb: '255,255,255' }, 1);
      } },
    // 4.8 — the Moon grows from a dot to a wall of ink: a disc of xuan inlaid in the indigo, until the ink paper is the
    //       whole frame (GOLD → INK)
    { id: '4.8', t0: S48, t1: S49, paper: 'xuan', grain: 48,
      scene: [{ name: 'inkmoon', params: { mode: 'photo', halo: 0.0, placeAt: (t, lt) => ({ x: 960, y: 540, R: R48(lt) }) } }],
      type(ctx, t, lt) {
        // the lyric is brushed in ink on the xuan; outside the Moon the pass turns that ink into gold on indigo, so the
        // line changes paper exactly where the limb passes under it
        // "wine" is sung 0.43 s before the cut on the lower-key recording (it was 1.0 s): it is brushed 0.4 s ahead of the
        // voice, during the held "lonely", so that it stands whole for half a second before the lander takes the frame
        const L13 = { ...L.L13, words: L.L13.words.map((w, i) => (i === 3 ? { ...w, start: w.start - 0.4 } : w)) };
        lyricEN(ctx, L13, { ...huge, size: 118, x: 960, y: 960, align: 'center', color: INK, hold: 0.8 }, t, 'ink');
        const R = R48(lt);
        if (R < 1500) ctx.pipe.apply(ctx.gl.program(MOONIN_FS, 'hook-moonin'), { uC: [960, 540, R], uSeed: 4.8 });
      } },
    // 4.9 — drums re-hit: DAY 4 · DESCENT. The lander's plume blasts regolith in flat radial sheets that stop the
    //       instant the engine cuts (K_4.9 take_2 redrawn in ink)
    { id: '4.9', t0: S49, t1: END, paper: 'xuan', grain: 49, flash: true, post: (t, lt) => bump(lt, 0.012),
      scene: [X.has('K_4.9') ? { type: 'roto', clip: 'K_4.9/take_2', paper: 'ink', offset: 0.55, lock: 0, subject: false, maskGain: 8, from: { x: 0.52, y: 0.46, zoom: 1.12 }, to: { x: 0.52, y: 0.5, zoom: 1.03 } }
        : ph('Descent: the lander’s plume blasts regolith flat', 'K_4.9')],
      type(ctx, t) { hud(ctx, 'DAY 4  ·  DESCENT', 64, 72, { size: 15, rgb: '30,30,32', a: 0.9 }, 1, 'ink'); hud(ctx, `ALT ${Math.max(0, Math.round(120 * (1 - (t - 96.31) / 2.5))).toString().padStart(3, '0')} M`, 64, 98, { size: 13, rgb: '30,30,32', a: 0.8 }, 1, 'ink'); } },
  ];
}
