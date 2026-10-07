// Image plates (style-lab stand-ins now, generated stills later) with a slow 2.5D drift and a stylisation pass that
// transfers the plate's pigment onto OUR paper (multiply by plate/plate-ground), so every plate shares the film's
// paper, grain and ink.
//   params: { img: 'S1', from: {x,y,zoom}, to: {...} (image-uv centre, zoom>=1 = closer), grade, opacity,
//             par: [dx, dy] parallax (design px at the bottom of frame), rect: [x,y,w,h] (design px; else cover),
//             feather (px), sky: [yTop, yHorizon, density] (ink wash painted into the sky, uv units) }
import { easeInOutSine, makeCanvas } from '../util.js';
import { PAPER_GLSL } from '../paper.js';

const FS = `${PAPER_GLSL}
uniform vec4 uCam;
vec2 toPaper(vec2 P){ vec2 c = vec2(960., 540.); return rot(-uCam.w) * ((P - c) / uCam.z) + c + uCam.xy; }
uniform sampler2D uPrev, uImg;
uniform vec2 uImgSize; uniform vec3 uView; uniform vec2 uPar; uniform vec4 uRect; uniform float uFeather;
uniform int uGrade; uniform float uOpacity; uniform vec3 uRef; uniform vec4 uSky; uniform float uDesat;
out vec4 o;
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 Pw = toPaper(P);
  vec3 f = fiberAt(Pw);
  // fit: cover the rect, then zoom about the view centre
  float ar = uImgSize.x / uImgSize.y, rar = uRect.z / uRect.w;
  vec2 span = ar > rar ? vec2(rar / ar, 1.) : vec2(1., ar / rar);  // uv extent visible at zoom 1
  vec2 q = (P - uRect.xy) / uRect.zw;                                 // 0..1 within rect
  vec2 half_ = span / uView.z * 0.5 + abs(uPar) / uRect.zw * span / uView.z + 0.002;
  vec2 ctr = clamp(uView.xy, half_, 1. - half_);
  vec2 uv = ctr + (q - .5) * span / uView.z;
  float depth = smoothstep(0.15, 1.0, q.y);                           // lower = nearer = moves more
  uv += uPar * depth / uRect.zw * span / uView.z;
  vec3 c = texture(uImg, uv).rgb;
  vec3 t = clamp(c / uRef, 0., 1.15);                                 // plate pigment relative to its own ground
  float l = luma(t);
  t = mix(t, vec3(l), uDesat);
  float gran = vnoise(Pw * 0.8) * .5 + vnoise(Pw * 0.27 + 5.) * .5;
  vec3 col;
  if (uGrade == 0) {               // silk
    col = prev * t;
  } else if (uGrade == 1) {        // silk at night: cool, low, pale things keep a little light
    vec3 day = prev * t;
    col = day * vec3(0.40, 0.44, 0.60) + pow(l, 3.) * vec3(0.10, 0.11, 0.13);
  } else if (uGrade == 2) {        // ink on xuan: plate grey -> ink density, granulated; strong colour (Earth) survives
    float d = -log(max(l, 0.02)) * (0.80 + 0.45 * gran);
    // night sky laid in screen space as a broad wash whose lower edge is a ragged, wet brush boundary
    float edge = uSky.y + (fbm3(vec2(P.x * 0.0035, 3.)) - .5) * 120. + (fbm3(P * 0.02) - .5) * 40.;
    float sky = uSky.z * (1. - smoothstep(edge - uSky.w, edge, P.y)) * (0.85 + 0.25 * fbm3(Pw * 0.008));
    d += sky * (0.9 + 0.2 * gran);
    vec3 ink = inkOver(prev, vec3(1.0, 0.975, 0.91), d);
    float sat = length(t - vec3(l));
    col = mix(ink, prev * t, smoothstep(0.08, 0.25, sat));
  } else {                          // gold plate on indigo: plate as-is, carrying our paper's mottling
    col = c * (prev / vec3(0.09, 0.13, 0.245));
    col = mix(col, c, 0.55);
  }
  vec2 e = min(P - uRect.xy, uRect.xy + uRect.zw - P);
  float m = uFeather > 0. ? smoothstep(0., uFeather, min(e.x, e.y) + (vnoise(P * 0.03) - .5) * uFeather * 0.8) : step(0., min(e.x, e.y));
  o = vec4(mix(prev, col, m * uOpacity), 1.);
}`;

export const plate = {
  init(ctx) {
    this.prog = ctx.gl.program(FS, 'plate');
    // estimate each plate's ground colour (bright percentile) so pigment can be transferred onto our paper
    this.ref = {};
    for (const [k, img] of Object.entries(ctx.assets)) {
      if (k === 'moon') continue;
      const c = makeCanvas(160, 90); const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, 160, 90);
      const d = g.getImageData(0, 0, 160, 90).data;
      const ch = [[], [], []];
      for (let i = 0; i < d.length; i += 4) for (let j = 0; j < 3; j++) ch[j].push(d[i + j]);
      this.ref[k] = ch.map((a) => { a.sort((x, y) => x - y); return Math.max(40, a[Math.floor(a.length * 0.96)]) / 255; });
    }
  },
  draw(ctx, shot, t, lt) {
    const p = shot.params;
    const dur = shot.t1 - shot.t0;
    const u = p.ease === 'linear' ? lt / dur : easeInOutSine(lt / dur);
    const a = p.from, b = p.to || p.from;
    const view = [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.zoom + (b.zoom - a.zoom) * u];
    const par = p.par ? [p.par[0] * (u - 0.5) * 2, p.par[1] * (u - 0.5) * 2] : [0, 0];
    const img = ctx.assets[p.img];
    const G = { silk: 0, silknight: 1, ink: 2, gold: 3 }[p.grade || 'silk'];
    ctx.pipe.apply(this.prog, {
      uImg: ctx.tex[p.img], uImgSize: [img.width, img.height], uView: view, uPar: par,
      uRect: p.rect || [0, 0, 1920, 1080], uFeather: p.feather || 0, uGrade: { i: G },
      uOpacity: typeof p.opacity === 'function' ? p.opacity(t, lt) : (p.opacity ?? 1),
      uRef: p.ref || this.ref[p.img], uSky: p.sky || [0, 0, 0, 0], uDesat: p.desat ?? 0.08,
    });
  },
};
