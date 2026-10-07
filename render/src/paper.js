// Papers: 宣 xuan (warm white, long bast fibres), 绢 silk (ochre, plain weave, age), 磁青 indigo (dyed, mottled).
// A 2048² fibre tile is drawn once in Canvas2D (seeded) and shared by the paper shader AND the ink simulation,
// so ink wicks along exactly the fibres you can see in the sheet.
import { mulberry32, makeCanvas } from './util.js';

export const FIBER_TILE = 2048;

export function makeFiberTile(seed = 7) {
  const N = FIBER_TILE;
  const c = makeCanvas(N, N);
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, N, N);
  const r = mulberry32(seed);
  // R: long pale bast fibres (wingceltis), G: short dark shives / inclusions, B: flock (cloudy formation)
  const fibre = (count, lenA, lenB, wA, wB, color, alphaA, alphaB) => {
    for (let i = 0; i < count; i++) {
      const x = r() * N, y = r() * N, a = r() * Math.PI * 2, L = lenA + (lenB - lenA) * Math.pow(r(), 2);
      const bend = (r() - 0.5) * 0.9;
      g.strokeStyle = color.replace('A', (alphaA + (alphaB - alphaA) * r()).toFixed(3));
      g.lineWidth = wA + (wB - wA) * r();
      g.lineCap = 'round';
      for (const ox of [0, -N, N]) for (const oy of [0, -N, N]) {
        if (ox || oy) { // only draw wrapped copies that could intersect the tile
          if (x + ox < -L || x + ox > N + L || y + oy < -L || y + oy > N + L) continue;
        }
        g.beginPath();
        const x0 = x + ox, y0 = y + oy;
        const mx = x0 + Math.cos(a) * L * 0.5 + Math.cos(a + 1.57) * L * bend * 0.25;
        const my = y0 + Math.sin(a) * L * 0.5 + Math.sin(a + 1.57) * L * bend * 0.25;
        g.moveTo(x0, y0);
        g.quadraticCurveTo(mx, my, x0 + Math.cos(a + bend * 0.5) * L, y0 + Math.sin(a + bend * 0.5) * L);
        g.stroke();
      }
    }
  };
  g.globalCompositeOperation = 'lighter';
  fibre(26000, 6, 70, 0.5, 1.3, 'rgba(255,0,0,A)', 0.10, 0.45);
  fibre(2200, 30, 160, 0.6, 1.1, 'rgba(255,0,0,A)', 0.08, 0.25);
  fibre(900, 2, 9, 0.6, 1.6, 'rgba(0,255,0,A)', 0.25, 0.8);
  // flock: soft blotches
  for (let i = 0; i < 2600; i++) {
    const x = r() * N, y = r() * N, rad = 6 + r() * 40;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(0,0,255,${(0.05 + r() * 0.12).toFixed(3)})`); gr.addColorStop(1, 'rgba(0,0,255,0)');
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return c;
}

// Fibre tile sampled from JS (for the ink sim): returns Float32 arrays for a design-px rect
export function fiberSampler(tileCanvas) {
  const g = tileCanvas.getContext('2d');
  const d = g.getImageData(0, 0, FIBER_TILE, FIBER_TILE).data;
  return {
    at(x, y) { // nearest, wrapped
      const xi = ((Math.floor(x) % FIBER_TILE) + FIBER_TILE) % FIBER_TILE, yi = ((Math.floor(y) % FIBER_TILE) + FIBER_TILE) % FIBER_TILE;
      const o = (yi * FIBER_TILE + xi) * 4;
      return [d[o] / 255, d[o + 1] / 255, d[o + 2] / 255];
    },
  };
}

// GLSL: paper colour at paper-space design px Pw. kind: 0 xuan, 1 silk, 2 indigo, 3 silk-night
export const PAPER_GLSL = /* glsl */`
uniform sampler2D uFiber;
vec3 fiberAt(vec2 Pw){ return texture(uFiber, Pw / ${FIBER_TILE}.0).rgb; }
vec3 paperColor(int kind, vec2 Pw, float seed){
  vec3 f = fiberAt(Pw);
  float cloud = fbm(Pw * 0.004 + seed) - .5;          // formation / dye mottling, large
  float mid = fbm(Pw * 0.03 + seed * 1.3) - .5;
  float fine = hash12(floor(Pw * 1.0) + seed) - .5;
  vec2 q = Pw / vec2(1920., 1080.) - .5;
  float edge = dot(q, q);                               // edges of a sheet age / darken slightly
  if (kind == 0) {         // 宣 xuan: #F2EFE8 warm white
    vec3 base = vec3(0.949, 0.937, 0.910);
    base *= 1. + cloud * 0.035 + mid * 0.012 + fine * 0.010;
    base += f.r * vec3(0.022, 0.022, 0.018);            // fibres catch light
    base -= f.g * vec3(0.10, 0.10, 0.09);               // rare dark shives
    base -= f.b * 0.035;
    base *= 1. - edge * 0.10;
    return base;
  } else if (kind == 1 || kind == 3) {   // 绢 silk: aged ochre, plain weave
    vec3 base = vec3(0.886, 0.816, 0.675);
    float stain = smoothstep(.15, .5, fbm(Pw * 0.0022 + seed * 2.1));
    base = mix(base, vec3(0.80, 0.69, 0.50), stain * 0.55);
    base *= 1. + cloud * 0.06 + mid * 0.02;
    // weave: warp/weft threads ~2.6 design px, slightly irregular
    vec2 w = Pw / 2.6 + vec2(vnoise(Pw * 0.05) * 0.6, vnoise(Pw * 0.05 + 9.) * 0.6);
    float warp = 0.5 + 0.5 * cos(w.x * 6.2832), weft = 0.5 + 0.5 * cos(w.y * 6.2832);
    float slub = vnoise(vec2(Pw.x * 0.02, floor(w.y)) ) * 0.5 + vnoise(vec2(floor(w.x), Pw.y * 0.02)) * 0.5;
    base *= 1. - 0.045 * (warp * weft) - 0.02 * (slub - .5) + fine * 0.012;
    base -= f.g * 0.05;
    base *= 1. - edge * 0.22;
    if (kind == 3) base = base * vec3(0.38, 0.40, 0.52) ; // silk at night: a cool indigo wash over the silk
    return base;
  } else if (kind == 4) {  // 拓 rubbing: ink pounced onto paper over stone — near-black, mottled, paper pores show
    float pounce = fbm(Pw * 0.05 + seed) * 0.6 + vnoise(Pw * 0.4) * 0.4;
    vec3 base = vec3(0.075, 0.072, 0.07) * (0.7 + 0.6 * pounce) + cloud * 0.03;
    base += step(0.985, hash12(floor(Pw * 0.8) + seed)) * 0.06 + f.r * 0.02;
    return base;
  } else {                 // 磁青 indigo: #16213E dyed paper, mottled, faint fibres
    vec3 base = vec3(0.090, 0.130, 0.245);
    base *= 1. + cloud * 0.28 + mid * 0.10 + fine * 0.04;
    base += f.r * vec3(0.010, 0.014, 0.024);
    base += f.b * vec3(0.012, 0.016, 0.03);
    base *= 1. - edge * 0.35;
    return base;
  }
}
`;
