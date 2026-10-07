// Frame pipeline. Layer model, in order:
//   [paper]  -> [scene layers: shader passes / plates / 2D line art]  -> [ink/gold stylisation, inside each composite]
//   -> [typography 2D layers]  -> [post: deflection, vignette, static per-shot grain] -> screen
// Everything accumulates into a half-float ping-pong pair; 2D layers are Canvas2D in DESIGN px (1920x1080 space).
import { PAPER_GLSL } from './paper.js';
import { makeCanvas } from './util.js';

const CAM_GLSL = /* glsl */`
uniform vec4 uCam;   // x,y: paper-space centre offset (design px), z: zoom, w: rotation (rad)
vec2 toPaper(vec2 P){ vec2 c = vec2(960., 540.); return rot(-uCam.w) * ((P - c) / uCam.z) + c + uCam.xy; }
`;

const PAPER_FS = `${PAPER_GLSL}${CAM_GLSL}
uniform int uKind; uniform float uSeed;
out vec4 o;
void main(){ vec2 P = PX(); o = vec4(paperColor(uKind, toPaper(P), uSeed), 1.); }`;

const COMPOSITE_FS = `${PAPER_GLSL}${CAM_GLSL}
uniform sampler2D uPrev, uLayer;
uniform int uMode; uniform float uOpacity, uAbsorb, uSeed;
out vec4 o;
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec4 L = IMG(uLayer, P * uScale / uRes);
  float a = L.a * uOpacity;
  vec2 Pw = toPaper(P);
  if (uAbsorb > 0.) { // paper absorption: pigment sits unevenly on fibres and flocs
    vec3 f = fiberAt(Pw);
    float gr = hash12(floor(P * uScale) + uSeed);
    a *= mix(1., 0.86 + 0.22 * f.b + 0.10 * f.r + 0.10 * gr, uAbsorb);
  }
  a = clamp(a, 0., 1.);
  vec3 c;
  if (uMode == 0) c = prev * mix(vec3(1.), L.rgb, a);            // ink / pigment: multiply
  else if (uMode == 1) c = mix(prev, L.rgb, a);                   // over
  else if (uMode == 2) c = mix(prev, goldInk(Pw, uSeed) * L.rgb, a); // 泥金 gold ink, RGB = tint/shade
  else c = 1. - (1. - prev) * (1. - L.rgb * a);                   // screen (light)
  o = vec4(c, 1.);
}`;

const POST_FS = `
uniform sampler2D uPrev;
uniform float uGrain, uGrainSeed, uVignette, uFade, uBump, uWarm, uFlash, uFlashSeed, uOpen;
uniform vec3 uOpenColor;
uniform vec3 uFadeColor;
uniform vec4 uDeflect; // x,y (design px), amplitude (px), radius (px)
out vec4 o;
void main(){
  vec2 P = PX();
  vec2 c = vec2(960., 540.);
  vec2 Q = c + (P - c) / (1. + uBump);
  float shade = 0.;
  if (uDeflect.z != 0.) {
    vec2 d = Q - uDeflect.xy; float r = length(d) / uDeflect.w;
    float k = exp(-r * r);
    Q -= normalize(d + 1e-4) * uDeflect.z * k * r;
    shade = uDeflect.z * 0.004 * k * (1. - r) ;
  }
  vec3 col = FBO(uPrev, Q).rgb;
  col *= 1. - shade;
  vec2 q = P / vec2(1920., 1080.) - .5;
  col *= 1. - uVignette * smoothstep(0.15, 0.75, dot(q, q) * 1.6);
  // static grain (seeded per shot): fine luminance + slight chroma, plus a soft mottle
  vec2 dp = floor(gl_FragCoord.xy);
  float g = hash12(dp + uGrainSeed * 37.) - .5;
  float g2 = hash12(dp * 1.37 + uGrainSeed * 11.) - .5;
  float mott = vnoise(P * 0.35 + uGrainSeed) - .5;
  float lum = luma(col);
  float amt = uGrain * (0.55 + 0.9 * lum * (1. - lum) * 2.);
  col += amt * (g * vec3(1.) + g2 * vec3(0.18, 0.0, -0.18)) + mott * uGrain * 0.35;
  col = mix(col, uFadeColor, uFade);
  // breath opening: light recedes from the centre outward (uOpen 0 -> 1)
  if (uOpen < 1.) {
    float r = length((P - c) / vec2(1100., 760.));
    float k = pow(1. - uOpen, 2.2) * (0.55 + 0.45 * smoothstep(0.0, 1.3, r + (1. - uOpen) * 0.2));
    col = 1. - (1. - col) * (1. - uOpenColor * k);
  }
  // 2-frame ink flash on a taiko cut: a splash of sumi over the frame, paper specks left in it
  if (uFlash > 0.) {
    vec2 wp = P * 0.0026 + uFlashSeed * 7.;
    vec2 warp = vec2(fbm(wp * 1.3 + 4.1), fbm(wp * 1.3 + 9.7)) - .5;
    float n = fbm(wp + warp * 1.6) * 0.8 + fbm(P * 0.02 + warp * 3.) * 0.2;
    float th = 0.98 - uFlash * 0.9;
    float m = smoothstep(th - 0.025, th + 0.025, n);
    float speck = step(0.9965, hash12(floor(P * 0.6) + uFlashSeed));
    vec3 ink = vec3(0.045, 0.045, 0.055) * (0.85 + 0.3 * vnoise(P * 0.8));
    col = mix(col, ink, m * (1. - speck * 0.8));
  }
  col = mix(col, col * vec3(1.02, 1., 0.97), uWarm);
  o = vec4(clamp(col, 0., 1.), 1.);
}`;

export class Pipeline {
  constructor(gl, fiberTex) {
    this.gl = gl; this.fiberTex = fiberTex;
    this.A = gl.target(); this.B = gl.target();
    this.cur = this.A;
    this.layerCanvas = makeCanvas(gl.W, gl.H);
    this.lg = this.layerCanvas.getContext('2d');
    this.layerTex = gl.texture(this.layerCanvas);
    this.pPaper = gl.program(PAPER_FS, 'paper');
    this.pComp = gl.program(COMPOSITE_FS, 'composite');
    this.pPost = gl.program(POST_FS, 'post');
    this.cam = [0, 0, 1, 0];
  }
  other() { return this.cur === this.A ? this.B : this.A; }
  setCam(cam = {}) { this.cam = [cam.x || 0, cam.y || 0, cam.zoom || 1, cam.rot || 0]; }
  // fill with paper
  paper(kind, seed = 0) {
    const K = { xuan: 0, silk: 1, indigo: 2, silknight: 3 }[kind] ?? 0;
    this.gl.pass(this.pPaper, { uKind: { i: K }, uSeed: seed, uFiber: this.fiberTex, uCam: this.cam }, this.cur);
  }
  // run a custom full-frame shader; it receives uPrev (the frame so far) and writes the new frame
  apply(prog, uniforms = {}) {
    const dst = this.other();
    this.gl.pass(prog, { uPrev: this.cur, uFiber: this.fiberTex, uCam: this.cam, ...uniforms }, dst);
    this.cur = dst;
  }
  // draw a Canvas2D layer in design px, then composite it. mode: ink | over | gold | screen
  layer(draw, { mode = 'ink', opacity = 1, absorb = 0, seed = 0, cam = false } = {}) {
    const g = this.lg, S = this.gl.S;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.clearRect(0, 0, this.layerCanvas.width, this.layerCanvas.height);
    g.setTransform(S, 0, 0, S, 0, 0);
    if (cam) applyCam2D(g, this.cam, S);
    draw(g);
    this.gl.update(this.layerTex, this.layerCanvas);
    const M = { ink: 0, over: 1, gold: 2, screen: 3 }[mode];
    this.apply(this.pComp, { uLayer: this.layerTex, uMode: { i: M }, uOpacity: opacity, uAbsorb: absorb, uSeed: seed });
  }
  post(p = {}) {
    this.gl.pass(this.pPost, {
      uPrev: this.cur, uGrain: p.grain ?? 0.035, uGrainSeed: p.grainSeed ?? 0, uVignette: p.vignette ?? 0.08,
      uFade: p.fade ?? 0, uFadeColor: p.fadeColor ?? [0, 0, 0], uBump: p.bump ?? 0, uWarm: p.warm ?? 0,
      uDeflect: p.deflect ?? [0, 0, 0, 1], uFlash: p.flash ?? 0, uFlashSeed: p.grainSeed ?? 0,
      uOpen: p.open ?? 1, uOpenColor: p.openColor ?? [0.96, 0.92, 0.82],
    }, null);
  }
}

// apply the paper camera to a 2D context already scaled to design px (so 2D art "sits on the paper")
export function applyCam2D(g, cam, S) {
  const [x, y, z, r] = cam;
  g.translate(960, 540); g.scale(z, z); g.rotate(-r); g.translate(-960 - x, -540 - y);
}
