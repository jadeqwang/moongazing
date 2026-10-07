// 6.4 — the build gap (121.0–122.77): from the dark disc of Earth in her visor, a helmet-camera long exposure lets
// the night side's city lights come up (NASA Black Marble 2016), zooming in on the Yangtze delta — and then the lights
// become the glow of the Earth relief table in the museum (J_3.7): a match-dissolve into memory, not optics.
import { PAPER_GLSL } from '../paper.js';
import { smooth } from '../util.js';

const LAT0 = 31.0 * Math.PI / 180, LON0 = 121.0 * Math.PI / 180; // the Yangtze delta (Shanghai / Hangzhou)

const FS = `${PAPER_GLSL}
uniform sampler2D uPrev, uBM, uBMC;
uniform float uR, uExpo, uCrescent;
uniform vec2 uC;
out vec4 o;
const float LAT0 = ${LAT0.toFixed(6)}, LON0 = ${LON0.toFixed(6)};
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 d = (P - uC) / uR; d.y = -d.y;
  float rho = length(d);
  if (rho >= 1.) { o = vec4(prev, 1.); return; }
  float c = asin(rho);
  float lat = asin(cos(c) * sin(LAT0) + (rho > 1e-6 ? d.y * sin(c) * cos(LAT0) / rho : 0.));
  float lon = LON0 + atan(d.x * sin(c), rho * cos(c) * cos(LAT0) - d.y * sin(c) * sin(LAT0));
  float la = degrees(lat), lo = degrees(lon);
  vec2 g = vec2(lo / 360. + .5, .5 - la / 180.);
  float lod = max(0., log2(max(1e-3, (4096. / 360.) / (uR * uScale / 57.3))));
  vec3 bm = textureLod(uBM, g, lod).rgb;
  // inside the East-China crop (100–135°E, 15–45°N) use the 3 km tile
  vec2 gc = vec2((lo - 100.) / 35., (45. - la) / 30.);
  float inC = step(0., gc.x) * step(gc.x, 1.) * step(0., gc.y) * step(gc.y, 1.);
  if (inC > 0.) bm = mix(bm, texture(uBMC, gc).rgb, smoothstep(0.0, 0.08, min(min(gc.x, gc.y), min(1. - gc.x, 1. - gc.y))));
  float lights = pow(smoothstep(0.06, 0.85, luma(bm)), 1.5) * 1.4;
  vec3 night = vec3(0.012, 0.018, 0.04) + bm * vec3(0.10, 0.12, 0.18) * 0.6;  // faint moonlit land
  vec3 gold = vec3(1.0, 0.78, 0.42);
  vec3 col = night + gold * lights * uExpo * (0.9 + 0.2 * vnoise(P * 0.7));
  // a hairline crescent along the lower limb (the Sun is behind the Earth)
  float mu = sqrt(max(0., 1. - rho * rho));
  float cres = smoothstep(0.9, 1.0, rho) * smoothstep(0.2, 0.9, -d.y / max(rho, 1e-3)) * uCrescent;
  col += vec3(0.75, 0.86, 1.0) * cres * 0.9;
  float edge = 1. - smoothstep(1. - 2.0 / uR, 1., rho);
  o = vec4(mix(prev, col, edge), 1.);
}`;

export const nightlights = {
  init(ctx) { this.prog = ctx.gl.program(FS, 'nightlights'); },
  draw(ctx, shot, t, lt) {
    const p = shot.params;
    const R = 230 * Math.exp(Math.log(6500 / 230) * smooth(0.15, 1.45, lt) * (0.85 + 0.15 * smooth(0, 1.45, lt)));
    ctx.pipe.apply(this.prog, {
      uBM: ctx.tex.bm4k, uBMC: ctx.tex.bmChina, uR: R, uC: [960, 540],
      uExpo: smooth(0.0, 0.9, lt) * 1.25, uCrescent: 1 - smooth(0.0, 0.5, lt),
    });
  },
};
