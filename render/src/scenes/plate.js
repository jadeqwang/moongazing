// Image plates (keyframes / stand-ins) brought to life:
//   * 2.5D: a depth map authored per plate (base gradient + feathered polygons, in image-uv) drives parallax and a
//     depth-dependent dolly, so near things slide and grow against far things — never a flat Ken Burns.
//   * secondary motion: flutter masks (ribbons, hair, palm fronds), water shimmer masks, lantern / phone flicker.
//   * atmosphere: drifting mist or ink wash in a screen band.
//   * an optional overlay layer (RGBA, e.g. K_0.4's Earth) with its own drift.
//   * stylisation onto OUR paper: 'native' (finished keyframe: our paper adds only texture), 'silk', 'silknight',
//     'ink' (grey -> granulated ink density), 'gold' (gold-on-indigo plate).
// params: { img, grade, from:{x,y,zoom}, to:{...}, ease, par:[dx,dy] (image-uv shift for depth 1 over the shot),
//           dolly (extra zoom for depth 1 over the shot), rect, feather, opacity, sky, desat,
//           masks: { base:[farDepth, nearDepth], polys:[{pts:[[u,v]..], depth, flutter, water, blur}] },
//           flutter: [ampPx, freq], shimmer, flicker, glow, mist: { color:[r,g,b], amount, y0, y1, speed },
//           over: { img, from:[du,dv], to:[du,dv] }, breathe }
import { easeInOutSine, makeCanvas, smooth } from '../util.js';
import { PAPER_GLSL } from '../paper.js';

const FS = `${PAPER_GLSL}
uniform vec4 uCam;
vec2 toPaper(vec2 P){ vec2 c = vec2(960., 540.); return rot(-uCam.w) * ((P - c) / uCam.z) + c + uCam.xy; }
uniform sampler2D uPrev, uImg, uMask, uOver;
uniform vec2 uImgSize; uniform vec3 uView; uniform vec2 uPar; uniform float uDolly; uniform vec4 uRect; uniform float uFeather;
uniform int uGrade; uniform float uOpacity; uniform vec3 uRef; uniform vec4 uSky; uniform float uDesat;
uniform float uT, uMaskOn, uFlutterAmp, uFlutterFreq, uShimmer, uFlicker, uGlow, uOverOn;
uniform vec2 uOverOff;
uniform vec4 uMist; uniform vec4 uMistBand; // rgb, amount | y0, y1, speed, scale
uniform vec4 uTear;   // y (design px), fall (px), rotation (rad), side (+1 keep upper part, -1 lower part falling)
uniform vec4 uReveal; // progress (0..1+), softness, centre x, centre y (0..1) — radial draw-on
out vec4 o;
void main(){
  vec2 P0 = PX();
  vec2 P = P0;
  vec3 prev = FBO(uPrev, P0).rgb;
  float tearM = 1., tearRim = 0.;
  if (uTear.w != 0.) {
    // the falling half: move it down and tilt it about the tear's centre
    if (uTear.w < 0.) { vec2 c = vec2(960., uTear.x); P = c + rot(-uTear.z) * (P0 - c - vec2(0., uTear.y)); }
    float edge = uTear.x + (fbm3(vec2(P.x * 0.006, 2.)) - .5) * 90. + (vnoise(vec2(P.x * 0.08, 5.)) - .5) * 12. + (hash12(vec2(floor(P.x * 0.7), 3.)) - .5) * 3.;
    float d = (P.y - edge) * -uTear.w;              // >0 on the kept side
    tearM = smoothstep(-0.8, 0.8, d);
    tearRim = smoothstep(7., 0., d) * smoothstep(-1., 0.5, d) * (0.6 + 0.4 * hash12(floor(P * 0.9)));
  }
  vec2 Pw = toPaper(P);
  float ar = uImgSize.x / uImgSize.y, rar = uRect.z / uRect.w;
  vec2 span = ar > rar ? vec2(rar / ar, 1.) : vec2(1., ar / rar);
  vec2 q = (P - uRect.xy) / uRect.zw;
  vec2 half_ = span / uView.z * 0.5 + abs(uPar) + 0.004;
  vec2 ctr = clamp(uView.xy, half_, 1. - half_);
  vec2 uv0 = ctr + (q - .5) * span / uView.z;
  vec4 M = uMaskOn > 0. ? texture(uMask, uv0) : vec4(smoothstep(0.15, 1.0, q.y) * 0.5, 0., 0., 0.);
  float depth = M.r;
  // depth-dependent dolly + parallax (one fixed-point step is plenty at these magnitudes)
  vec2 uv = ctr + (q - .5) * span / (uView.z * (1. + uDolly * depth)) + uPar * depth;
  M = uMaskOn > 0. ? texture(uMask, uv) : M;
  // secondary motion
  float fl = M.g;
  if (fl > 0.002) {
    vec2 w = vec2(sin(uv.y * uFlutterFreq * 6.2832 - uT * 2.3 + uv.x * 9.) + 0.5 * sin(uv.y * uFlutterFreq * 13. - uT * 3.7),
                  cos(uv.x * uFlutterFreq * 5.1 - uT * 1.9) * 0.6);
    uv += fl * w * uFlutterAmp / uImgSize;
  }
  float wa = M.b;
  if (wa > 0.002) {
    uv.x += wa * sin(uv.y * 1400. + uT * 2.6 + sin(uv.x * 40.) * 2.) * uShimmer / uImgSize.x;
    uv.y += wa * sin(uv.x * 160. - uT * 1.4) * uShimmer * 0.5 / uImgSize.y;
  }
  vec3 c = texture(uImg, uv).rgb;
  if (uOverOn > 0.) { vec4 ov = texture(uOver, uv - uOverOff); c = mix(c, ov.rgb, ov.a); }
  // light that lives: lanterns breathe, phone screens flicker
  if (uFlicker > 0.) {
    float warm = smoothstep(0.32, 0.52, c.r - c.b) * smoothstep(0.55, 0.8, c.r) * (1. - smoothstep(0.55, 0.8, depth));
    c *= 1. + uFlicker * warm * (vnoise(uv * vec2(260., 150.) + vec2(uT * 3.1, uT * 1.3)) - 0.45) * 0.9;
  }
  if (uGlow > 0.) {
    float br = smoothstep(0.62, 0.85, luma(c)) * smoothstep(0.62, 0.8, uv.y);
    c *= 1. + uGlow * br * (vnoise(uv * vec2(90., 40.) + uT * 4.2) - 0.5);
  }
  vec3 t = clamp(c / uRef, 0., 1.15);
  float l = luma(t);
  t = mix(t, vec3(l), uDesat);
  float gran = vnoise(Pw * 0.8) * .5 + vnoise(Pw * 0.27 + 5.) * .5;
  vec3 col;
  if (uGrade == 4) {               // native: a finished painting; our paper contributes its weave/fibre only
    vec3 pm = uSky.w > 0. ? vec3(0.09, 0.13, 0.245) : vec3(0.886, 0.816, 0.675);
    col = c * mix(vec3(1.), prev / pm, 0.55);
    col = mix(col, vec3(luma(col)), uDesat);
  } else if (uGrade == 5) {        // 拓 rubbing: the picture as a stele rubbing — dark, monochrome, light where it is carved
    float lm = luma(c);
    col = prev + vec3(0.88, 0.86, 0.82) * pow(lm, 1.15) * (0.75 + 0.35 * gran) * 1.05;
  } else if (uGrade == 0) {
    col = prev * t;
  } else if (uGrade == 1) {
    vec3 day = prev * t;
    col = day * vec3(0.40, 0.44, 0.60) + pow(l, 3.) * vec3(0.10, 0.11, 0.13);
  } else if (uGrade == 2) {
    float d = -log(max(l, 0.02)) * (0.80 + 0.45 * gran);
    float edge = uSky.y + (fbm3(vec2(P.x * 0.0035, 3.)) - .5) * 120. + (fbm3(P * 0.02) - .5) * 40.;
    float sky = uSky.z * (1. - smoothstep(edge - uSky.w, edge, P.y)) * (0.85 + 0.25 * fbm3(Pw * 0.008));
    d += sky * (0.9 + 0.2 * gran);
    vec3 ink = inkOver(prev, vec3(1.0, 0.975, 0.91), d);
    float sat = length(t - vec3(l));
    col = mix(ink, prev * t, smoothstep(0.08, 0.25, sat));
  } else {
    col = c * (prev / vec3(0.09, 0.13, 0.245));
    col = mix(col, c, 0.55);
  }
  // drifting mist / ink wash
  if (uMist.a > 0.) {
    float band = smoothstep(uMistBand.x - 120., uMistBand.x, P.y) * (1. - smoothstep(uMistBand.y, uMistBand.y + 160., P.y));
    vec2 mp = P * uMistBand.w + vec2(uT * uMistBand.z, uT * uMistBand.z * 0.15);
    float m = smoothstep(0.35, 0.85, fbm(mp * 0.0025 + 3.) * 0.7 + fbm(mp * 0.007 - uT * 0.02) * 0.3);
    col = mix(col, uMist.rgb * (0.94 + 0.12 * gran), m * band * uMist.a);
  }
  // torn paper fibres along the rip
  col = mix(col, vec3(0.93, 0.90, 0.84), tearRim * 0.85);
  if (uReveal.y > 0.) {
    float r = length((q - uReveal.zw) * vec2(1.6, 1.)) / 0.95 + (fbm3(q * 9.) - .5) * 0.12;
    tearM *= 1. - smoothstep(uReveal.x - uReveal.y, uReveal.x, r);
  }
  vec2 e = min(P - uRect.xy, uRect.xy + uRect.zw - P);
  float m = uFeather > 0. ? smoothstep(0., uFeather, min(e.x, e.y) + (vnoise(P * 0.03) - .5) * uFeather * 0.8) : step(0., min(e.x, e.y));
  o = vec4(mix(prev, col, m * uOpacity * tearM), 1.);
}`;

function buildMask(def) {
  const W = 768, H = Math.round(768 * (def.aspect || 9 / 16));
  const c = makeCanvas(W, H); const g = c.getContext('2d');
  const [far, near] = def.base || [0, 0.5];
  // R: depth (gradient far at top -> near at bottom), G: flutter, B: water
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, `rgb(${Math.round(far * 255)},0,0)`); gr.addColorStop(1, `rgb(${Math.round(near * 255)},0,0)`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const polys = def.polys || [];
  for (const p of [...polys.filter((q) => q.depth !== undefined), ...polys.filter((q) => q.depth === undefined)]) {
    const t = makeCanvas(W, H); const tg = t.getContext('2d');
    tg.filter = `blur(${p.blur ?? 6}px)`;
    tg.beginPath(); p.pts.forEach(([u, v], i) => (i ? tg.lineTo(u * W, v * H) : tg.moveTo(u * W, v * H))); tg.closePath();
    // replace channels inside the polygon: draw with 'lighten' for flutter/water, explicit depth via a two-pass
    if (p.depth !== undefined && !p.motionOnly) {
      tg.fillStyle = `rgb(${Math.round(p.depth * 255)},0,0)`; tg.fill();
      g.globalCompositeOperation = p.depthMode === 'max' ? 'lighten' : 'source-over';
      // keep G/B of what is under: draw only into R by masking with a red-only copy
      g.drawImage(t, 0, 0);
      g.globalCompositeOperation = 'source-over';
    }
    if (p.flutter || p.water) {
      const t2 = makeCanvas(W, H); const t2g = t2.getContext('2d');
      t2g.filter = `blur(${p.blur ?? 6}px)`;
      t2g.beginPath(); p.pts.forEach(([u, v], i) => (i ? t2g.lineTo(u * W, v * H) : t2g.moveTo(u * W, v * H))); t2g.closePath();
      t2g.fillStyle = `rgb(0,${Math.round((p.flutter || 0) * 255)},${Math.round((p.water || 0) * 255)})`; t2g.fill();
      g.globalCompositeOperation = 'lighter'; g.drawImage(t2, 0, 0); g.globalCompositeOperation = 'source-over';
    }
  }
  return c;
}

export const plate = {
  init(ctx) {
    this.prog = ctx.gl.program(FS, 'plate');
    this.masks = new Map();
    this.ref = {};
  },
  refOf(key, img) { // the plate's own ground colour (bright percentile) — pigment is transferred relative to it
    if (this.ref[key]) return this.ref[key];
    const c = makeCanvas(160, 90); const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, 160, 90);
    const d = g.getImageData(0, 0, 160, 90).data;
    const ch = [[], [], []];
    for (let i = 0; i < d.length; i += 4) for (let j = 0; j < 3; j++) ch[j].push(d[i + j]);
    return (this.ref[key] = ch.map((a) => { a.sort((x, y) => x - y); return Math.max(40, a[Math.floor(a.length * 0.96)]) / 255; }));
  },
  draw(ctx, shot, t, lt) {
    const p = shot.params;
    const dur = shot.t1 - shot.t0;
    const u = p.ease === 'linear' ? lt / dur : easeInOutSine(lt / dur);
    const a = p.from, b = p.to || p.from;
    const view = [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.zoom + (b.zoom - a.zoom) * u];
    const par = p.par ? [p.par[0] * (u - 0.5), p.par[1] * (u - 0.5)] : [0, 0];
    const img = ctx.assets[p.img];
    const G = { silk: 0, silknight: 1, ink: 2, gold: 3, native: 4, rubbing: 5 }[p.grade || 'silk'];
    let mask = null;
    if (p.masks) {
      const key = p.img + JSON.stringify(p.masks);
      if (!this.masks.has(key)) this.masks.set(key, ctx.gl.texture(buildMask({ aspect: img.height / img.width, ...p.masks })));
      mask = this.masks.get(key);
    }
    const ov = p.over;
    const ovOff = ov ? [ov.from[0] + (ov.to[0] - ov.from[0]) * u, ov.from[1] + (ov.to[1] - ov.from[1]) * u] : [0, 0];
    const mist = p.mist || null;
    const sky = p.sky || [0, 0, 0, 0];
    if (G === 4) sky[3] = shot.paper === 'indigo' ? 1 : 0;
    ctx.pipe.apply(this.prog, {
      uImg: ctx.tex[p.img], uImgSize: [img.width, img.height], uView: view, uPar: par, uDolly: (p.dolly || 0) * u,
      uRect: p.rect || [0, 0, 1920, 1080], uFeather: p.feather || 0, uGrade: { i: G },
      uOpacity: typeof p.opacity === 'function' ? p.opacity(t, lt) : (p.opacity ?? 1),
      uRef: p.ref || this.refOf(p.img, img), uSky: sky, uDesat: p.desat ?? (G === 4 ? 0 : 0.08),
      uT: lt, uMaskOn: mask ? 1 : 0, uMask: mask || ctx.tex[p.img],
      uFlutterAmp: p.flutter ? p.flutter[0] : 0, uFlutterFreq: p.flutter ? p.flutter[1] : 1,
      uShimmer: p.shimmer || 0, uFlicker: p.flicker || 0, uGlow: p.glow || 0,
      uOverOn: ov ? 1 : 0, uOver: ov ? ctx.tex[ov.img] : ctx.tex[p.img], uOverOff: ovOff,
      uMist: mist ? [...mist.color, mist.amount] : [0, 0, 0, 0],
      uMistBand: mist ? [mist.y0, mist.y1, mist.speed ?? 8, mist.scale ?? 1] : [0, 0, 0, 1],
      uTear: p.tear ? (typeof p.tear === 'function' ? p.tear(t, lt) : p.tear) : [0, 0, 0, 0],
      uReveal: p.reveal ? [p.reveal(t, lt), 0.18, 0.5, 0.55] : [0, 0, 0.5, 0.5],
    });
  },
};

// the plate's uv → screen (design px) mapping at local time lt, as an affine map P = a·uv + b (depth parallax ignored),
// so overlays can be pinned to a point of the painting (a fingertip, a sheet of paper) while the camera pushes
export function plateMap(params, lt, dur, img) {
  const u = params.ease === 'linear' ? lt / dur : easeInOutSine(lt / dur);
  const a = params.from, b = params.to || params.from;
  const view = [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.zoom + (b.zoom - a.zoom) * u];
  const rect = params.rect || [0, 0, 1920, 1080];
  const ar = img.width / img.height, rar = rect[2] / rect[3];
  const span = ar > rar ? [rar / ar, 1] : [1, ar / rar];
  const par = params.par ? [params.par[0] * (u - 0.5), params.par[1] * (u - 0.5)] : [0, 0];
  const half = [span[0] / view[2] * 0.5 + Math.abs(par[0]) + 0.004, span[1] / view[2] * 0.5 + Math.abs(par[1]) + 0.004];
  const ctr = [Math.min(Math.max(view[0], half[0]), 1 - half[0]), Math.min(Math.max(view[1], half[1]), 1 - half[1])];
  const ax = rect[2] * view[2] / span[0], ay = rect[3] * view[2] / span[1];
  return { a: [ax, ay], b: [rect[0] + rect[2] * 0.5 - ctr[0] * ax, rect[1] + rect[3] * 0.5 - ctr[1] * ay],
    at(uv) { return [this.a[0] * uv[0] + this.b[0], this.a[1] * uv[1] + this.b[1]]; } };
}
