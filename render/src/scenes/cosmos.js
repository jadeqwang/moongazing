// 7.E2–E3 — the cosmic pull-back, one continuous logarithmic zoom (a function of song time, so it runs across the
// E2/E3 cut): Guanghan Station's gold plan (K_7.A1) → the Shackleton ridge and the south pole (LROC WAC polar
// mosaic, PIA13523) → the whole Moon seen from below the pole (LROC global mosaic) in silver ink → Earth and Moon
// together, to scale → Earth a single pale-blue pixel in a slanted band of scattered sunlight (Voyager 1, 1990).
// Distances in km; the view's scale is km per design pixel.
import { PAPER_GLSL } from '../paper.js';
import { smooth, clamp } from '../util.js';
import { earthDisc } from './jiehua.js';

const RM = 1737.4, RE = 6371.0, DEM = 384400;
const STATION = [-38.0, 26.0]; // km from the pole on the polar plane: the Shackleton–de Gerlache ridge (89.5°S)

// [time, km/px] keyframes, interpolated in log space with eased segments
const SCALE = [[181.11, 0.0022], [182.30, 0.035], [183.80, 2.4], [184.60, 14], [185.30, 250], [186.36, 300], [187.50, 9500], [189.86, 11000]];
export function scaleAt(t) {
  if (t <= SCALE[0][0]) return SCALE[0][1];
  for (let i = 1; i < SCALE.length; i++) {
    const [t0, s0] = SCALE[i - 1], [t1, s1] = SCALE[i];
    if (t <= t1) { const u = (t - t0) / (t1 - t0); const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4; return Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * e); }
  }
  return SCALE[SCALE.length - 1][1];
}
// where the camera looks (km): station → pole → between Earth and Moon → Earth
export function centerAt(t) {
  const a = smooth(182.0, 184.0, t), b = smooth(184.5, 185.3, t), c = smooth(186.36, 187.5, t);
  let x = STATION[0] * (1 - a), y = STATION[1] * (1 - a);
  x = x * (1 - b) + Math.max(-DEM * 0.5, -820 * scaleAt(t)) * b; y *= 1 - b; // never lose the Moon before Earth arrives
  x = x * (1 - c) + (-DEM) * c;
  return [x, y];
}

const FS = `${PAPER_GLSL}
uniform sampler2D uPrev, uMoon, uPole, uPlan;
uniform float uKmPx, uPlanOn, uPlanW, uT;
uniform vec2 uCtr, uStation, uPlanSize;
out vec4 o;
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 w = uCtr + (P - vec2(960., 540.)) * uKmPx;   // km on the plane facing the camera (south pole at 0,0)
  float r = length(w);
  float gran = vnoise(P * 0.8) * .5 + vnoise(P * 0.27 + 5.) * .5;
  vec3 silver = vec3(0.86, 0.85, 0.82);
  vec3 col = prev;
  float cover = 1. - smoothstep(${RM.toFixed(1)} - uKmPx, ${RM.toFixed(1)} + uKmPx, r);
  if (cover > 0.) {
    float z = sqrt(max(0., ${RM.toFixed(1)} * ${RM.toFixed(1)} - r * r));
    float lat = -asin(clamp(z / ${RM.toFixed(1)}, 0., 1.));
    float lon = atan(w.y, w.x);
    vec2 muv = vec2(lon / 6.28318 + .5, .5 - lat / 3.14159);
    float lod = max(0., log2(max(1e-3, 0.375 * uKmPx * uScale * 2.)));
    float lum = textureLod(uMoon, muv, lod).r;
    lum = pow(lum * 1.15, 1.25);
    // the global albedo map has no shadows; near the pole the low Sun leaves most of the ground dark — match the mosaic
    lum *= mix(1., 0.62, smoothstep(-1.05, -1.48, lat));
    // close in, the regolith has a grain of its own (the mosaic is only 400 m/px)
    float close = 1. - smoothstep(0.02, 0.25, uKmPx);
    if (close > 0.) lum *= mix(1., 0.72 + 0.56 * fbm(w / 0.06) * (0.8 + 0.4 * vnoise(w / 0.011)), close);
    // near the pole: the WAC polar mosaic, with its real low-sun shadows
    vec2 pu = 0.5 + w / 600.;
    float wp = (1. - smoothstep(150., 290., r + (vnoise(w * 0.03) - .5) * 60.)) * (1. - smoothstep(1.6, 4.0, uKmPx));
    if (wp > 0.) { float pl = texture(uPole, pu).r; lum = mix(lum, pl * 1.25, wp); }
    // limb darkening for a near-polar view, and silver ink granulation
    float mu = z / ${RM.toFixed(1)};
    vec3 c = silver * (0.10 + 0.95 * lum) * (0.82 + 0.3 * gran) * (0.55 + 0.45 * sqrt(mu));
    col = mix(prev, c, cover * (0.35 + 0.65 * smoothstep(0.0, 0.25, lum + 0.05)));
  }
  // the station itself: its gold jiehua plan, centred on the ridge, until it shrinks away
  if (uPlanOn > 0.) {
    vec2 q = (w - uStation) / uPlanSize + 0.5;
    if (q.x > 0. && q.y > 0. && q.x < 1. && q.y < 1.) {
      vec3 pc = texture(uPlan, q).rgb;
      // only the gold lines of the plan, laid on the ground at the station (its indigo ground is dropped)
      float line = smoothstep(0.22, 0.45, luma(pc) - luma(vec3(0.09, 0.13, 0.245)) * 0.6);
      float edge = smoothstep(0., 0.05, min(min(q.x, q.y), min(1. - q.x, 1. - q.y)));
      float dk = 1. - smoothstep(0.25, 0.75, length(q - 0.5) * 1.3);
      col = mix(col * (1. - 0.45 * uPlanOn * dk), goldInk(P, 3.) * 1.1, line * uPlanOn * edge);
    }
  }
  o = vec4(col, 1.);
}`;

const nice = (km) => { const p = Math.pow(10, Math.floor(Math.log10(km))); const m = km / p; return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p; };
const fmt = (km) => (km >= 1 ? `${Math.round(km).toLocaleString('en-US').replace(/,/g, ' ')} KM` : `${Math.round(km * 1000)} M`);

export const cosmos = {
  init(ctx) { this.prog = ctx.gl.program(FS, 'cosmos'); },
  draw(ctx, shot, t) {
    const s = scaleAt(t), c = centerAt(t);
    const plan = ctx.assets['K_7.A1'] || ctx.assets['K_7.A'];
    const planKey = ctx.assets['K_7.A1'] ? 'K_7.A1' : 'K_7.A';
    const planW = 3.6; // km across the plan
    if (s < 600) ctx.pipe.apply(this.prog, {
      uMoon: ctx.tex.moon, uPole: ctx.tex.pole || ctx.tex.moon, uPlan: plan ? ctx.tex[planKey] : ctx.tex.moon,
      uKmPx: s, uCtr: c, uStation: STATION, uPlanOn: plan ? 1 - smooth(0.012, 0.045, s) : 0,
      uPlanSize: plan ? [planW, planW * plan.height / plan.width] : [1, 1], uT: t,
    });
    // Earth, to scale; at the end a single pale-blue pixel in a slanted band of scattered sunlight
    const ex = 960 + (-DEM - c[0]) / s, ey = 540 + (0 - c[1]) / s, er = RE / s;
    const beam = smooth(186.9, 188.0, t);
    ctx.pipe.layer((g) => {
      if (beam > 0) {
        g.save(); g.translate(ex + 40, ey); g.rotate(-0.32);
        for (const [wd, a] of [[300, 0.06], [140, 0.07], [55, 0.06]]) { const gr = g.createLinearGradient(-wd, 0, wd, 0); gr.addColorStop(0, 'rgba(212,168,75,0)'); gr.addColorStop(0.5, `rgba(212,168,75,${a * beam})`); gr.addColorStop(1, 'rgba(212,168,75,0)'); g.fillStyle = gr; g.fillRect(-wd, -1500, 2 * wd, 3000); }
        g.restore();
      }
      const es = ctx.assets.K04earth;
      if (er > 1.3 && es) { const cx = 0.22 * es.width, cy = 0.60 * es.height, rr = 0.068 * es.height; g.save(); g.beginPath(); g.arc(ex, ey, er, 0, Math.PI * 2); g.clip(); g.drawImage(es, cx - rr, cy - rr, rr * 2, rr * 2, ex - er, ey - er, er * 2, er * 2); g.restore(); }
      else if (er > 1.3) earthDisc(g, ex, ey, er, 5);
      else if (ex > -20 && ex < 1940) { g.fillStyle = '#b9d6ee'; g.beginPath(); g.arc(ex, ey, 1.7, 0, Math.PI * 2); g.fill(); }
      // Earth and Moon to scale: a ruled dimension line between them (jiehua), quietly labelled
      const dl = smooth(185.2, 185.6, t) * (1 - smooth(186.5, 186.9, t));
      if (dl > 0) {
        const mx = 960 + (0 - c[0]) / s, my = 540 + (0 - c[1]) / s, yy = ey + 70;
        g.globalAlpha = dl * 0.8; g.strokeStyle = 'rgba(212,168,75,1)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(ex, yy); g.lineTo(mx, yy); g.moveTo(ex, yy - 8); g.lineTo(ex, yy + 8); g.moveTo(mx, yy - 8); g.lineTo(mx, yy + 8); g.stroke();
        g.font = '13px PlexMonoMedium'; g.letterSpacing = '3px'; g.fillStyle = 'rgba(212,168,75,1)'; g.textAlign = 'center';
        g.fillText('384 400 KM', (ex + mx) / 2, yy - 12); g.fillText('EARTH', ex, yy + 30); g.fillText('MOON', mx, yy + 30);
        g.textAlign = 'left'; g.globalAlpha = 1;
      }
      // the frame becomes the emblem: a gold ring drawn round the dot
      const ring = smooth(188.55, 189.35, t);
      if (ring > 0) { g.strokeStyle = 'rgba(212,168,75,0.85)'; g.lineWidth = 2.2; g.beginPath(); g.arc(ex - 40, ey + 10, 250, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); }
    }, { mode: 'over', seed: 69 });
    // a ruled scale bar (jiehua), bottom-left
    const km = nice(s * 220), px = km / s;
    const fade = 1 - smooth(187.4, 187.9, t);
    if (fade > 0) ctx.pipe.layer((g) => {
      g.globalAlpha = 0.85 * fade; g.strokeStyle = '#fff'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(64, 1030); g.lineTo(64 + px, 1030); g.moveTo(64, 1022); g.lineTo(64, 1038); g.moveTo(64 + px, 1022); g.lineTo(64 + px, 1038); g.stroke();
      g.font = '14px PlexMonoMedium'; g.letterSpacing = '2px'; g.fillStyle = '#fff'; g.fillText(fmt(km), 64, 1010);
    }, { mode: 'gold', seed: 70 });
    const q = smooth(187.7, 188.4, t);
    if (q > 0) {
      const card = ctx.type.card('sagan', { lines: [[{ t: 'That’s here. That’s home. That’s us.', font: 'CormorantItalic' }]], size: 42, x: 960, y: 830, align: 'center', color: '#efe7d6' });
      ctx.pipe.layer((g) => card.draw(g, 1, q * 0.92), { mode: 'over', seed: 71 });
      ctx.pipe.layer((g) => ctx.type.hud(g, 'CARL SAGAN, PALE BLUE DOT (1994)', 960, 872, { size: 12, color: `rgba(212,168,75,${(0.8 * q).toFixed(3)})`, tracking: 0.14, align: 'center' }), { mode: 'over', seed: 72 });
    }
  },
};
