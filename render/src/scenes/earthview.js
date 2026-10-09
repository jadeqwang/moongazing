// Earth as seen from the Moon — one deterministic sphere render for every Moon shot, so the Earth is the same Earth
// everywhere and its phase, tilt and face are parameters that can be checked against an ephemeris (JPL Horizons;
// see docs/technical_accuracy_notes.md "Earth from Guanghan"). No image model paints the Earth.
//   maps: NASA Blue Marble (day), Blue Marble clouds, Black Marble 2016 (city lights). Orthographic (Earth is 1.9°).
//   earthView(ctx, { x, y, r,              centre and radius in design px (1920x1080)
//     subLat, subLon,                      the point of Earth facing the camera (deg; east positive)
//     north,                               position angle of Earth's north pole on screen, deg clockwise from up
//                                          (seen from the lunar south pole Earth hangs south-up: north ≈ 180 ± 24)
//     phase,                               Sun–Earth–observer angle, deg: 0 = full Earth, 180 = new Earth
//     sunPA,                               screen direction from the disc centre toward the Sun, deg clockwise from up
//     gain, sat, night, moonlit, haze,     exposure, saturation, city-light gain, night-side fill (the Moon is full
//                                          when Earth is new, so its night side is moonlit), atmosphere strength
//     squash: [sx, sy], rot, mirror,       for reflections (a visor): scale the disc, rotate it (deg), flip it
//     opacity,
//     cloud,                               0..1 (default 1) scales the cloud layer: thin it on a push-in, where the
//                                          2048 px cloud map (about 20 km/px) turns into soft blobs (by r ~ 5000)
//     glint,                               0..1 (default 1) scales the sun glint on water: near full Earth it sits at
//                                          the sub-observer point, and on a push-in there it bleaches the whole sea
//                                          to flat pale cyan with a cut-out edge (fade it out by r ~ 3000)
//     insets: [{ key, lon0, lon1, lat0, lat1, feather }, ...] })
//                                          OPTIONAL finer day maps for a push-in (at most 2; none = the 4k map only, as
//                                          before). Each is a plate-carree, north-up image registered in assets.js under
//                                          a `bm...` key, covering lon0..lon1 (deg east) by lat0..lat1 (deg north). Inside
//                                          its bounds it replaces the 4k day map, feathered over `feather` (default 0.04)
//                                          of its size on each side; where two overlap, the finer one (more px per
//                                          degree) is laid on top. Mip level comes from the inset's own px per degree;
//                                          once magnified it is filtered with Catmull-Rom instead of bilinear.
//                                          EARTH_INSETS below is the East China -> Yangtze delta pair (same Blue Marble
//                                          month as the 4k map, so no colour correction is needed: means agree within
//                                          1/255 per channel). Limit of the data: 500 m/px = 1:1 at r ~ 13800 (frame
//                                          890 km wide at 1080p); it holds to about r 27000 (450 km wide), is soft by
//                                          r 41000 (300 km) and a blur at r 81500 (150 km). West Lake cannot be seen.
//                                          With insets the sub-observer / north trigonometry is done in JS (exact), so
//                                          the map lands within a pixel even at r 150000 with the centre far off screen;
//                                          without them the GL's own sin/cos are used as before (up to ~0.7 km off on
//                                          the ground), so keep `insets` on for the whole shot, not switched mid-shot.
//                                          Callers that draw with earthView() directly add EARTH_INSET_KEYS to the
//                                          shot's `needs`; the 'earthview' scene layer loads them itself.
// As a scene layer: { name: 'earthview', params: { earth: {...}  or  earth: (t, lt) => ({...}) } }.
import { smooth } from '../util.js';

const FS = `
uniform sampler2D uPrev, uDay, uCloud, uNight, uIns0, uIns1;
uniform vec2 uC, uSquash, uSub, uRotCS;   // centre px; squash; sub-observer lat, lon (rad); cos/sin of the disc rotation
uniform vec3 uSun;                        // unit vector to the Sun in view space (x right, y up, z toward the camera)
uniform vec4 uLook;                       // gain, saturation, city-light gain, moonlit fill
uniform vec4 uInsB0, uInsB1;              // inset bounds: west lon, north lat (rad), 1 / lon span, 1 / lat span (1/rad)
uniform vec3 uInsP0, uInsP1;              // inset: texels per radian, feather (fraction of its size), 1 when in use
uniform vec4 uTrigSub;                    // with insets: sin, cos of the sub-observer lat, then of its lon, from JS
uniform vec3 uTrigN;                      // with insets: sin, cos of north from JS, and 1 to use these (else 0)
uniform float uR, uNorth, uOpacity, uHaze, uMirror, uCloudK, uGlintK;
out vec4 o;
const float PI = 3.14159265;
vec3 sat(vec3 c, float s){ float l = luma(c); return mix(vec3(l), c, s); }
// Catmull-Rom magnification (9 bilinear taps): bilinear alone draws streaks and diamonds once a texel covers 2+ px
vec3 texCR(sampler2D s, vec2 uv){
  vec2 sz = vec2(textureSize(s, 0)), p = uv * sz, c = floor(p - .5) + .5, f = p - c;
  vec2 w0 = f * (-.5 + f * (1. - .5 * f)), w1 = 1. + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (.5 + f * (2. - 1.5 * f)), w3 = f * f * (-.5 + .5 * f);
  vec2 w12 = w1 + w2, t0 = (c - 1.) / sz, t3 = (c + 2.) / sz, t12 = (c + w2 / w12) / sz;
  return (textureLod(s, vec2(t0.x, t0.y), 0.).rgb * w0.x + textureLod(s, vec2(t12.x, t0.y), 0.).rgb * w12.x + textureLod(s, vec2(t3.x, t0.y), 0.).rgb * w3.x) * w0.y
       + (textureLod(s, vec2(t0.x, t12.y), 0.).rgb * w0.x + textureLod(s, vec2(t12.x, t12.y), 0.).rgb * w12.x + textureLod(s, vec2(t3.x, t12.y), 0.).rgb * w3.x) * w12.y
       + (textureLod(s, vec2(t0.x, t3.y), 0.).rgb * w0.x + textureLod(s, vec2(t12.x, t3.y), 0.).rgb * w12.x + textureLod(s, vec2(t3.x, t3.y), 0.).rgb * w3.x) * w3.y;
}
// a finer regional day map laid over 'base' inside its lon/lat bounds; pxPerRad = screen px per radian of arc here
vec3 inset(sampler2D s, vec4 B, vec3 Pm, float lon, float lat, float pxPerRad, vec3 base){
  float dl = lon - B.x; dl -= 2. * PI * floor(dl / (2. * PI));
  vec2 uv = vec2(dl, B.y - lat) * B.zw;
  vec2 m = min(uv, 1. - uv);
  if (min(m.x, m.y) <= 0.) return base;
  float w = smoothstep(0., Pm.y, m.x) * smoothstep(0., Pm.y, m.y);
  float lod = log2(max(1e-3, Pm.x / pxPerRad));      // from the inset's own texels per radian; < 0 = magnified
  vec3 c = textureLod(s, uv, max(0., lod)).rgb;
  if (lod < 0.) c = mix(c, max(texCR(s, uv), 0.), smoothstep(0., -0.6, lod));
  return mix(base, c, w);
}
void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 q = (P - uC); q.y = -q.y;
  q = vec2(uRotCS.x * q.x + uRotCS.y * q.y, -uRotCS.y * q.x + uRotCS.x * q.y) / (uR * uSquash);
  if (uMirror > .5) q.x = -q.x;
  float rho = length(q);
  if (rho > 1.12) { o = vec4(prev, 1.); return; }
  vec2 dir = rho > 1e-5 ? q / rho : vec2(0., 1.);
  // the atmosphere seen edge-on outside the limb: bright where the limb is sunlit; at a nearly new Earth sunlight
  // is scattered forward through the whole ring, so the ring closes
  float limbMu = dot(vec3(dir, 0.), uSun);
  float ring = smoothstep(-0.92, -0.999, uSun.z);
  float halo = exp(-max(rho - 1., 0.) / 0.012) * (smoothstep(-0.25, 0.35, limbMu) + ring * (0.35 + 0.65 * smoothstep(-1., 1., limbMu)));
  vec3 air = vec3(0.42, 0.62, 1.0);
  if (rho >= 1.) { o = vec4(prev + air * halo * 0.55 * uHaze * uLook.x * uOpacity, 1.); return; }
  vec3 n = vec3(q, sqrt(max(0., 1. - rho * rho)));
  // view space -> Earth-fixed: the local north / east tangents at the sub-observer point
  vec3 tn = vec3(sin(uNorth), cos(uNorth), 0.), te = vec3(cos(uNorth), -sin(uNorth), 0.);
  float sl = sin(uSub.x), cl = cos(uSub.x), so = sin(uSub.y), co = cos(uSub.y);
  // a push-in needs these exact: the GL's own sin/cos may be good to only ~1e-4 (0.7 km on the ground)
  if (uTrigN.z > .5) {
    tn = vec3(uTrigN.x, uTrigN.y, 0.); te = vec3(uTrigN.y, -uTrigN.x, 0.);
    sl = uTrigSub.x; cl = uTrigSub.y; so = uTrigSub.z; co = uTrigSub.w;
  }
  float a = n.z, b = dot(n, te), c = dot(n, tn);
  vec3 e = a * vec3(cl * co, cl * so, sl) + b * vec3(-so, co, 0.) + c * vec3(-sl * co, -sl * so, cl);
  float lat = asin(clamp(e.z, -1., 1.)), lon = atan(e.y, e.x);
  vec2 g = vec2(lon / (2. * PI) + .5, .5 - lat / PI);
  float lod = max(0., log2(max(1e-3, 4096. / (2. * PI * uR * uScale * max(n.z, 0.12)))));
  vec3 day = textureLod(uDay, g, lod).rgb;
  if (uInsP0.z > .5) day = inset(uIns0, uInsB0, uInsP0, lon, lat, uR * uScale * max(n.z, 0.12), day);
  if (uInsP1.z > .5) day = inset(uIns1, uInsB1, uInsP1, lon, lat, uR * uScale * max(n.z, 0.12), day);
  float cloud = smoothstep(0.08, 0.85, luma(textureLod(uCloud, g, max(0., lod - 1.)).rgb)) * uCloudK;
  vec3 nightTex = textureLod(uNight, g, lod).rgb;
  float mu0 = dot(n, uSun);
  float lit = smoothstep(-0.10, 0.22, mu0);                  // twilight softens the terminator
  float ocean = smoothstep(0.02, 0.10, day.b - max(day.r, day.g) + 0.03);
  // day side: Lambert with a floor (multiple scattering keeps the full Earth from limb-darkening much)
  vec3 surf = sat(day, uLook.y) * (0.92 + 0.35 * ocean);
  vec3 dcol = mix(surf, vec3(1.0, 1.0, 1.0), cloud * 0.92);
  dcol *= (0.20 + 0.95 * pow(max(mu0, 0.), 0.75));
  vec3 h = normalize(uSun + vec3(0., 0., 1.));
  dcol += vec3(1.0, 0.96, 0.86) * pow(max(dot(n, h), 0.), 90.) * ocean * (1. - cloud) * 0.55 * uGlintK;   // sun glint on water
  dcol += air * pow(1. - n.z, 2.5) * 0.55 * uHaze * smoothstep(-0.05, 0.4, mu0);                  // limb haze
  dcol = mix(dcol, dcol * vec3(1.18, 0.86, 0.66), (1. - lit) * 0.6);                              // warm terminator
  // night side: city lights, and the land and cloud faintly silvered by moonlight (lit from where we stand)
  float lights = pow(smoothstep(0.08, 0.85, luma(nightTex)), 1.4);
  vec3 ncol = (vec3(0.10, 0.13, 0.20) * luma(day) * 2.2 + vec3(0.20, 0.23, 0.30) * cloud) * pow(n.z, 0.6) * uLook.w;
  ncol += vec3(1.0, 0.76, 0.40) * lights * uLook.z * (1. - cloud * 0.7);
  vec3 col = mix(ncol, dcol, lit) * uLook.x;
  col += air * exp(-(1. - rho) / 0.02) * halo * 0.35 * uHaze * uLook.x;
  float edge = 1. - smoothstep(1. - 1.5 / (uR * uScale * min(uSquash.x, uSquash.y)), 1., rho);
  o = vec4(mix(prev, col, edge * uOpacity) + air * halo * 0.25 * uHaze * uLook.x * (1. - edge) * uOpacity, 1.);
}`;

const RAD = Math.PI / 180;
let prog = null;
export const EARTH_KEYS = ['bmDay', 'bmClouds', 'bm4k'];
// the finer day maps for a push-in on East China (pass as `insets`), coarse to fine, and their asset keys
export const EARTH_INSETS = [
  { key: 'bmDayChina', lon0: 100, lon1: 135, lat0: 15, lat1: 45 },   // 4096x3511, about 1 km/px
  { key: 'bmDayDelta', lon0: 114, lon1: 126, lat0: 26, lat1: 36 },   // 2880x2400, about 500 m/px (Yangtze delta)
];
export const EARTH_INSET_KEYS = EARTH_INSETS.map((i) => i.key);
export function earthView(ctx, e) {
  if (!e || !ctx.tex.bmDay || !ctx.tex.bmClouds || !ctx.tex.bm4k) return;
  if (!prog) prog = ctx.gl.program(FS, 'earthview');
  const ph = (e.phase ?? 0) * RAD, pa = (e.sunPA ?? 0) * RAD, rot = (e.rot ?? 0) * RAD;
  // insets that are loaded, coarse to fine (the finer one is drawn last, so it wins where they overlap)
  const ins = (e.insets || []).filter((i) => i && ctx.tex[i.key] && i.lon1 > i.lon0 && i.lat1 > i.lat0)
    .map((i) => { const T = ctx.tex[i.key], dlon = (i.lon1 - i.lon0) * RAD, dlat = (i.lat1 - i.lat0) * RAD;
      return { T, B: [i.lon0 * RAD, i.lat1 * RAD, 1 / dlon, 1 / dlat], P: [Math.max(T.w / dlon, T.h / dlat), i.feather ?? 0.04, 1] }; })
    .sort((a, b) => a.P[0] - b.P[0]).slice(-2);
  const insU = {};
  for (let k = 0; k < 2; k++) {
    const I = ins[k];
    insU['uIns' + k] = I ? I.T : ctx.tex.bmDay; insU['uInsB' + k] = I ? I.B : [0, 0, 1, 1]; insU['uInsP' + k] = I ? I.P : [1, 0.04, 0];
  }
  if (ins.length) {
    const la = (e.subLat ?? 0) * RAD, lo = (e.subLon ?? 0) * RAD, no = (e.north ?? 180) * RAD;
    insU.uTrigSub = [Math.sin(la), Math.cos(la), Math.sin(lo), Math.cos(lo)]; insU.uTrigN = [Math.sin(no), Math.cos(no), 1];
  } else { insU.uTrigSub = [0, 1, 0, 1]; insU.uTrigN = [0, 1, 0]; }
  ctx.pipe.apply(prog, {
    ...insU, uCloudK: e.cloud ?? 1, uGlintK: e.glint ?? 1,
    uDay: ctx.tex.bmDay, uCloud: ctx.tex.bmClouds, uNight: ctx.tex.bm4k,
    uC: [e.x, e.y], uR: e.r, uSquash: e.squash || [1, 1], uRotCS: [Math.cos(rot), Math.sin(rot)], uMirror: e.mirror ? 1 : 0,
    uSub: [(e.subLat ?? 0) * RAD, (e.subLon ?? 0) * RAD], uNorth: (e.north ?? 180) * RAD,
    uSun: [Math.sin(ph) * Math.sin(pa), Math.sin(ph) * Math.cos(pa), Math.cos(ph)],
    uLook: [e.gain ?? 1, e.sat ?? 1.15, e.night ?? 0, e.moonlit ?? 0], uHaze: e.haze ?? 1, uOpacity: e.opacity ?? 1,
  });
}
export const earthview = {
  async draw(ctx, shot, t, lt) {
    await ctx.store.need(EARTH_KEYS);
    const p = shot.params.earth;
    const e = typeof p === 'function' ? p(t, lt) : p;
    if (e && e.insets && e.insets.length) await ctx.store.need(e.insets.map((i) => i && i.key));
    earthView(ctx, e);
  },
};
