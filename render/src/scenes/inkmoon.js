// 0.1 / 0.2 — a drop of sumi ink falls onto xuan paper and blooms into the full Moon, then resolves into the real
// Moon (LRO albedo rendered as granulated ink). Also used later as a plain "ink moon" element (mode: 'photo').
import { buildMoonBloom } from '../inkfield.js';
import { fiberSampler } from '../paper.js';
import { makeCanvas, mulberry32, smooth, clamp } from '../util.js';
import { PAPER_GLSL } from '../paper.js';

export const MOON_GLSL = /* glsl */`
uniform sampler2D uMoon;  // LROC WAC albedo, equirectangular, lon 0 at centre
uniform vec4 uAlbR;       // albedo normalisation: lo, hi, p02, p98
float moonAlbedoUV(vec2 u){ // u in -1..1 on the disc, y down; returns -1 off-disc
  float rr = dot(u, u); if (rr >= 1.) return -1.;
  float z = sqrt(1. - rr);
  float lat = asin(-u.y), lon = atan(u.x, z);
  return texture(uMoon, vec2(lon / 6.28318 + .5, .5 - lat / 3.14159)).r;
}
// photographic grey -> ink density, granulated (pigment settles in the paper's tooth)
float moonInk(float a, vec2 Pw, float gran){
  float t = clamp((a - uAlbR.z) / (uAlbR.w - uAlbR.z), 0., 1.);
  float d = 0.07 + 0.95 * pow(1. - t, 1.75);
  return d * mix(1., 0.70 + 0.62 * gran, 0.9);
}
float granule(vec2 Pw, vec3 f){
  float g1 = vnoise(Pw * 0.85), g2 = vnoise(Pw * 0.31 + 7.), g3 = hash12(floor(Pw * 1.3));
  return clamp(0.35 * g1 + 0.35 * g2 + 0.15 * g3 + 0.5 * f.r * 0.6 + 0.25 * f.b, 0., 1.4);
}
`;

const FS = `${PAPER_GLSL}
uniform vec4 uCam;
vec2 toPaper(vec2 P){ vec2 c = vec2(960., 540.); return rot(-uCam.w) * ((P - c) / uCam.z) + c + uCam.xy; }
${MOON_GLSL}
uniform sampler2D uPrev, uN, uM, uMare;
uniform vec2 uF0; uniform float uG;
uniform vec2 uC; uniform float uR;
uniform float uTau, uTauW, uTau2, uPool, uMass, uResolve, uPhoto, uHalo, uMariaAmt;
uniform vec4 uDrop;    // x, y, radius, defocus
uniform vec4 uShadow;  // x, y, blur radius, alpha
uniform float uDropA;
uniform vec4 uSpecks[5]; // x, y, radius, grow (0..1)
uniform float uInkK, uPale;
uniform vec3 uPaleColor;
out vec4 o;
float F(sampler2D s, vec2 Pw, float outside){
  vec2 g = (Pw - uF0) / uG;
  if (g.x < 0. || g.y < 0. || g.x > 1. || g.y > 1.) return outside;
  return texture(s, g).r;
}
void main(){
  vec2 P = PX();
  vec2 Pw = toPaper(P);
  vec3 col = FBO(uPrev, P).rgb;
  vec3 f = fiberAt(Pw);
  float gran = granule(Pw, f);
  float clump = smoothstep(0.25, 0.75, vnoise(Pw * 0.11 + 3.)) ;
  float mott = fbm3(Pw * 0.02 + 11.);
  vec3 AB = vec3(1.0, 0.975, 0.91) * uInkK;   // sumi: a cool, faintly blue-black
  float n = F(uN, Pw, 4.);
  // feathered front: fibres carry the ink a hair further than the mean front
  float fe = n - uTau - f.r * 0.010 + (hash12(floor(Pw * 1.7)) - .5) * 0.003;
  float m = 1. - smoothstep(-0.008, 0.002, fe);
  float behind = max(uTau - n, 0.);
  float d = 0.;
  vec2 u = (Pw - uC) / uR;
  float a = moonAlbedoUV(u);
  float tN = a >= 0. ? clamp((a - uAlbR.z) / (uAlbR.w - uAlbR.z), 0., 1.) : 0.8;
  if (m > 0.) {
    float prof = exp(-n / max(0.05, uTau * 0.5));
    d = uMass * (0.60 + 0.95 * prof) * (0.78 + 0.44 * mott) * (0.92 + 0.25 * f.b);
    for (int k = 0; k < 3; k++) {          // tide lines where the front paused
      float n0 = k == 0 ? 0.31 : (k == 1 ? 0.57 : 0.83);
      float z = (n - n0) / 0.006;
      d += step(n0 + 0.03, uTau) * 0.035 * exp(-z * z);
    }
    d += uPool * (0.42 * exp(-behind / 0.006) + 0.10 * exp(-behind / 0.03));   // pigment pools at the drying edge
    // maria: a second, darker ink dropped wet-in-wet; shapes follow the real albedo, edges diffuse into the wet wash
    float M = F(uM, Pw, 4.), mare = F(uMare, Pw, 0.);
    float mm = 1. - smoothstep(uTau2 - 0.40, uTau2 + 0.05, M * 0.85 + (mott - .5) * 0.25);
    float deep = smoothstep(0.6, 0.05, tN);
    float mshape = smoothstep(0.0, 0.9, mare);
    d += uMariaAmt * mm * (0.26 * mshape + 0.34 * deep * mshape) * (0.85 + 0.3 * mott);
    d += uMariaAmt * mm * 0.10 * mshape * (1. - mshape) * 4. * (1. - mm * 0.5);   // soft pooled rims of the wet-in-wet bloom
    d *= m;
    d *= 0.70 + 0.60 * gran;
  }
  // water halo (the wet front runs ahead of the pigment)
  float wet = (1. - smoothstep(uTauW - 0.012, uTauW + 0.002, n)) * (1. - m);
  col *= 1. - wet * (0.035 + 0.035 * f.r) * uHalo;
  d += wet * uHalo * 0.025 * exp(-max(uTauW - n, 0.) / 0.006);   // faint grey tide at the water line
  // the real Moon develops through the wash (photographic grey = ink granulation)
  if (uPhoto > 0. && a >= 0.) {
    float k = smoothstep(0., 1., uResolve * 1.5 - n * 0.55 - gran * 0.2) * uPhoto;
    float dp = (0.12 + 0.86 * pow(1. - tN, 1.55)) * (0.66 + 0.62 * gran) * (0.86 + 0.28 * clump);
    dp += uPool * (0.26 * exp(-behind / 0.0065) + 0.05 * exp(-behind / 0.03));
    d = mix(d, dp * m, k);
  }
  // specks of spatter
  for (int i = 0; i < 5; i++) {
    vec4 s = uSpecks[i];
    if (s.z <= 0.) continue;
    float r = length(Pw - s.xy) / (s.z * (0.4 + 0.6 * s.w));
    float edge = r + (vnoise(Pw * 0.6 + float(i) * 13.) - .5) * 0.6 + (f.r) * -0.4;
    float sp = (1. - smoothstep(0.8, 1.0, edge)) * step(0.001, s.w);
    d += sp * (0.9 + 0.5 * exp(-max(1. - edge, 0.) / 0.15)) * (0.75 + 0.4 * gran);
  }
  if (uPale > 0.) {   // shell-white (蛤粉) moon on dark silk / silver on indigo: the maria read as thinner white
    float cover = m;
    col = mix(col, uPaleColor * (0.97 + 0.06 * gran), cover * clamp(1.08 - d * 1.05, 0., 1.) * uPale);
  } else col = inkOver(col, AB, d);
  // --- the falling drop and its shadow
  if (uShadow.w > 0.) {
    float r = length(Pw - uShadow.xy) / uShadow.z;
    col *= 1. - uShadow.w * exp(-r * r * 1.6);
  }
  if (uDrop.z > 0.) {
    vec2 q = (Pw - uDrop.xy);
    float dist = length(q);
    float cov = 1. - smoothstep(uDrop.z - uDrop.w * 0.5 - 0.6, uDrop.z + uDrop.w * 0.5 + 0.6, dist);
    vec2 qn = q / uDrop.z;
    vec2 hl = qn - vec2(-0.36, -0.40);
    float spec = exp(-dot(hl, hl) / pow(0.16 + uDrop.w / uDrop.z * 0.25, 2.));
    float rim = smoothstep(0.55, 1.0, length(qn)) * 0.06;
    vec3 dc = vec3(0.035, 0.036, 0.045) + spec * vec3(0.62, 0.62, 0.66) * (1. - 0.5 * uDrop.w / (uDrop.w + 8.)) + rim;
    col = mix(col, dc, cov * uDropA);
  }
  o = vec4(col, 1.);
}`;

export const inkmoon = {
  async init(ctx) {
    const { gl, assets } = ctx;
    // project the LRO albedo map for the JS bloom fields
    const img = assets.moon;
    const c = makeCanvas(img.width, img.height); const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const md = g.getImageData(0, 0, img.width, img.height).data;
    const MW = img.width, MH = img.height;
    const albedo = (u, v) => {
      const z = Math.sqrt(Math.max(0, 1 - u * u - v * v));
      const lat = Math.asin(-v), lon = Math.atan2(u, z);
      const X = Math.floor((lon / (Math.PI * 2) + 0.5) * MW) % MW, Y = Math.min(MH - 1, Math.floor((0.5 - lat / Math.PI) * MH));
      let s = 0; for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) s += md[(Math.min(MH - 1, Y + oy) * MW + (X + ox) % MW) * 4];
      return s / 4 / 255;
    };
    const L = ctx.layout.moon; // {cx, cy, R}
    const t0 = performance.now();
    const B = buildMoonBloom({ cx: L.cx, cy: L.cy, R: L.R, HS: Math.round(L.R * 1.42), fiber: fiberSampler(ctx.fiberCanvas), albedo });
    console.log(`ink bloom fields ${B.G}² in ${(performance.now() - t0).toFixed(0)} ms`);
    this.B = B;
    this.tN = gl.field(B.N, B.G, B.G);
    this.tM = gl.field(B.M, B.G, B.G);
    this.tMare = gl.field(B.mare, B.G, B.G);
    this.prog = gl.program(FS, 'inkmoon');
    // spatter specks: deterministic
    const r = mulberry32(2024);
    this.specks = [];
    for (let i = 0; i < 5; i++) {
      const a = r() * Math.PI * 2, d = L.R * (1.12 + r() * 0.55);
      this.specks.push({ x: L.cx + Math.cos(a) * d, y: L.cy + Math.sin(a) * d, rad: 1.6 + r() * r() * 5.5, land: 0.05 + r() * 0.07 });
    }
  },
  // p: { tImpact, mode: 'bloom' | 'photo', resolveAt: [t0,t1], C:{cx,cy,R} override for photo mode }
  draw(ctx, shot, t, lt) {
    const L = ctx.layout.moon;
    const p = shot.params || {};
    const tI = p.tImpact ?? 0.48;
    const s = t - tI;
    let U;
    if (p.mode === 'photo') {
      U = { uTau: 1.0, uTauW: 1.03, uTau2: 1.1, uPool: 1, uMass: 0.17, uResolve: 3, uPhoto: 1, uHalo: p.halo ?? 1, uMariaAmt: 1,
        uDrop: [0, 0, 0, 0], uShadow: [0, 0, 1, 0], uDropA: 0 };
    } else {
      const tau = s < 0 ? 0 : 1 - (1 - 0.047) * Math.exp(-s / 0.36);
      const tauW = s < 0 ? 0 : Math.min(1.045, tau * 1.03 + 0.015 * (1 - Math.exp(-s / 0.25)));
      const tau2 = s < 0.5 ? -1 : 1.08 * (1 - Math.exp(-(s - 0.5) / 0.33));
      const mass = s < 0 ? 0 : 0.17 + 1.1 * Math.exp(-s / 0.22);
      const [r0, r1] = p.resolveAt || [1.85, 2.62];
      const res = smooth(r0, r1, t) * 1.25;
      // falling drop (camera looks straight down; the drop falls away from the lens toward the paper)
      const h0 = 8.4, Hc = 10, dropR = 13.5;
      const tF = p.tFall ?? 0;                       // the drop enters frame at tFall (first sound) and lands at tI
      const ft = clamp((t - tF) / (tI - tF));
      const h = h0 * (1 - ft * ft);
      const persp = Hc / (Hc - h);
      const defocus = Math.abs(1 / (Hc - h) - 1 / Hc) * 55;
      const shadowOff = h * 30;
      const falling = t >= tF && s < 0;
      const drop = falling ? [L.cx, L.cy, dropR * persp, defocus] : [0, 0, 0, 0];
      // before the drop is in frame its shadow gathers on the paper (it is above the lens)
      const pre = t < tF ? smooth(tF - 0.9, tF, t) : 1;
      const shadow = s < 0 ? [L.cx + shadowOff * 0.62, L.cy + shadowOff * 0.78, 10 + h * 7, (0.10 + 0.28 * (1 - h / h0)) * pre] : [0, 0, 1, 0];
      U = { uDropA: falling && !p.hang ? smooth(tF, tF + 0.1, t) : 0 };
      if (p.hang) { drop[2] = 0; shadow[3] = 0; }
      U = { ...U, uTau: tau, uTauW: tauW, uTau2: tau2, uPool: smooth(0.35, 1.5, s), uMass: mass, uResolve: res, uPhoto: res > 0 ? 1 : 0,
        uHalo: 1 - smooth(1.9, 2.8, t) * 0.5, uMariaAmt: 1, uDrop: drop, uShadow: shadow };
    }
    const sp = [];
    for (const k of this.specks) {
      const grow = p.mode === 'photo' ? 1 : clamp((s - k.land) / 0.35);
      sp.push(k.x, k.y, s > k.land || p.mode === 'photo' ? k.rad : 0, grow * grow * (3 - 2 * grow));
    }
    const extra = {};
    if (p.placeAt) p.place = p.placeAt(t, lt);
    if (p.place) { // put the moon (authored at L) somewhere else, at another size
      const z = p.place.R / L.R;
      extra.uCam = [-(p.place.x - 960) / z + (L.cx - 960), -(p.place.y - 540) / z + (L.cy - 540), z, 0];
    }
    if (p.mode === 'photo') for (let i = 2; i < sp.length; i += 4) sp[i] = p.specks ? sp[i] : 0;
    ctx.pipe.apply(this.prog, {
      ...U, uSpecks: sp, uInkK: 1.0, uPale: p.pale ? 1 : 0, uPaleColor: p.paleColor || [0.93, 0.91, 0.85], ...extra,
      uN: this.tN, uM: this.tM, uMare: this.tMare, uMoon: ctx.tex.moon,
      uF0: [this.B.x0, this.B.y0], uG: this.B.G, uC: [L.cx, L.cy], uR: L.R,
      uAlbR: this.B.albedoRange,
    });
    if (p.hang && p.mode !== 'photo' && s < 0) hangingDrop(ctx, L, t, p.tFall ?? 0, tI);
  },
};

// The opening bead: visible from frame 0. A calligraphy brush — bamboo shaft from the top edge, horn ferrule, a
// wolf-hair head whose lower half is loaded with wet black ink — comes in at a slant from the upper right; a glossy
// bead swells at its tip and trembles. On the first sound it lets go and falls straight down, accelerating, to land
// at tImpact; its shadow on the paper gathers and sharpens as it comes. Paper space. Deterministic in t.
function hangingDrop(ctx, L, t, tF, tI) {
  const X = L.cx, TIP = 268, ANG = 0.5, R = 19;
  const fall = t >= tF ? Math.min(1, (t - tF) / (tI - tF)) : 0, u2 = fall * fall;
  const tremble = t < tF ? (Math.sin(t * 29.0) * 0.6 + Math.sin(t * 45.3 + 1.2) * 0.35) * (0.4 + 0.6 * Math.min(1, t / 1.6)) : 0;
  const swell = t < tF ? 0.72 + 0.28 * Math.min(1, t / tF) ** 1.5 : 1;          // the bead grows as ink gathers
  const stretch = t < tF ? 1.12 + 0.06 * Math.sin(t * 17) : 1 + 0.9 * fall;
  const r = R * swell, y0 = TIP + r * stretch * 0.92;
  const y = y0 + (L.cy - y0) * u2, x = X + tremble;
  const lift = t >= tF ? 420 * smooth(tF, tF + 0.7, t) : 0;                     // the brush withdraws along its axis
  ctx.pipe.layer((g) => {
    const k = t < tF ? 0.15 * Math.min(1, t / tF) : 0.15 + 0.85 * u2;
    g.save(); g.filter = `blur(${(26 - 22 * k).toFixed(1)}px)`; g.fillStyle = `rgba(20,18,16,${(0.06 + 0.3 * k).toFixed(3)})`;
    g.beginPath(); g.ellipse(X + 18 * (1 - k), L.cy + 22 * (1 - k), 46 - 30 * k, 30 - 18 * k, 0, 0, Math.PI * 2); g.fill(); g.restore();
    // the brush's own soft shadow, close beside it on the paper (light from upper left; the brush is near the paper)
    g.save(); g.filter = 'blur(10px)'; g.globalAlpha = 0.07 * (1 - smooth(tF, tF + 0.4, t));
    g.translate(X + 38, TIP + 30); g.rotate(ANG); g.fillStyle = '#1a1714';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(-24, -150); g.lineTo(-18, -1400); g.lineTo(18, -1400); g.lineTo(24, -150); g.closePath(); g.fill(); g.restore();
  }, { mode: 'ink', absorb: 0.4, seed: 11, cam: true });
  ctx.pipe.layer((g) => {
    g.save();
    g.translate(X + tremble * 0.5 + Math.sin(ANG) * lift, TIP - Math.cos(ANG) * lift);
    g.rotate(ANG);                       // local: tip at the origin, the shaft runs up (−y)
    g.scale(1.3, 1.3);                   // a big, legible brush on a phone
    const HL = 170, HW = 25, FER = 34, SH = 1200, SW = 17;
    // bamboo shaft with nodes
    const sg = g.createLinearGradient(-SW, 0, SW, 0);
    sg.addColorStop(0, '#8a6a3c'); sg.addColorStop(0.35, '#c9a46a'); sg.addColorStop(0.6, '#b18850'); sg.addColorStop(1, '#6e5230');
    g.fillStyle = sg; g.fillRect(-SW, -HL - FER - SH, SW * 2, SH);
    g.fillStyle = 'rgba(70,48,24,0.55)';
    for (const ny of [-HL - FER - 210, -HL - FER - 560]) { g.fillRect(-SW - 1, ny, SW * 2 + 2, 5); g.fillStyle = 'rgba(70,48,24,0.55)'; }
    g.strokeStyle = 'rgba(90,64,34,0.35)'; g.lineWidth = 1;
    for (const xx of [-9, -2, 6, 12]) { g.beginPath(); g.moveTo(xx, -HL - FER - 4); g.lineTo(xx, -HL - FER - SH); g.stroke(); }
    // horn ferrule
    const fg = g.createLinearGradient(-SW - 4, 0, SW + 4, 0);
    fg.addColorStop(0, '#120f0d'); fg.addColorStop(0.4, '#3a302a'); fg.addColorStop(1, '#0c0a09');
    g.fillStyle = fg; g.beginPath(); g.moveTo(-SW - 4, -HL - FER); g.lineTo(SW + 4, -HL - FER); g.lineTo(HW - 1, -HL + 2); g.lineTo(-HW + 1, -HL + 2); g.closePath(); g.fill();
    // hair head: bulb from the ferrule, tapering to a fine point
    const head = () => { g.beginPath(); g.moveTo(-HW + 1, -HL); g.bezierCurveTo(-HW - 7, -HL * 0.62, -HW * 0.55, -HL * 0.22, 0, 0); g.bezierCurveTo(HW * 0.55, -HL * 0.22, HW + 7, -HL * 0.62, HW - 1, -HL); g.closePath(); };
    const hg = g.createLinearGradient(0, -HL, 0, 0);
    hg.addColorStop(0, '#b89a74'); hg.addColorStop(0.32, '#8d7356'); hg.addColorStop(0.5, '#1d1a17'); hg.addColorStop(0.62, '#070707'); hg.addColorStop(1, '#030303');
    g.fillStyle = hg; head(); g.fill();
    g.save(); head(); g.clip();
    // bristles: fine hairs, dry and separate above the ink line, gathered and wet below it
    for (let i = -11; i <= 11; i++) {
      const xx = i * 2.2;
      g.strokeStyle = i % 3 ? 'rgba(240,226,200,0.28)' : 'rgba(60,44,30,0.4)'; g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(xx, -HL); g.quadraticCurveTo(xx * 1.15, -HL * 0.55, xx * 0.15, -HL * 0.28); g.stroke();
    }
    // ink sheen on the wet belly: one soft highlight running down the curve of the hair
    g.save(); g.filter = 'blur(2.5px)'; g.strokeStyle = 'rgba(214,218,228,0.5)'; g.lineWidth = 3.2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-HW * 0.62, -HL * 0.5); g.bezierCurveTo(-HW * 0.6, -HL * 0.32, -HW * 0.35, -HL * 0.14, -HW * 0.06, -HL * 0.03); g.stroke(); g.restore();
    g.restore();
    g.restore();
    // the bead: glossy black, hanging by a neck of ink from the tip, then falling free
    if (t < tI) {
      if (t < tF + 0.05) {
        const nk = 1 - smooth(tF, tF + 0.05, t);
        g.fillStyle = `rgba(4,4,5,${nk})`; g.beginPath(); g.moveTo(X - 4, TIP - 4); g.quadraticCurveTo(x - r * 0.5, y - r * 0.3, x, y - r * 0.6); g.quadraticCurveTo(x + r * 0.5, y - r * 0.3, X + 4, TIP - 4); g.closePath(); g.fill();
      }
      g.save(); g.translate(x, y); g.scale(1 / Math.sqrt(stretch), stretch);
      const b = g.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.05, 0, 0, r * 1.05);
      b.addColorStop(0, '#3c3a38'); b.addColorStop(0.25, '#0c0c0d'); b.addColorStop(1, '#020203');
      g.fillStyle = b; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.82)'; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.42, r * 0.2, r * 0.13, -0.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(160,160,170,0.25)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, r * 0.92, 0.6, 2.2); g.stroke();
      g.restore();
    }
  }, { mode: 'over', seed: 12, cam: true });
}
