// Roto redraw shader: one full-frame pass that paints a held drawing (on twos) from the prep guides onto OUR paper.
// The base clip's pixels are never shown: fills are snapped to the keyframe's own palette, lines are re-inked from the
// even-width line field, and static regions show the painted keyframe itself (warped by the tracked camera).
//
// Coordinates: P design px -> q (0..1 screen) -> uv_i (current video frame, cover fit + view) -> p0 = T_i·p_i (frame-0 px:
// key plate + motion mask) -> p_f = Ti_f·p0 (the held drawing's px: colour + line guides).
import { PAPER_GLSL } from '../paper.js';

export const ROTO_FS = /* glsl */`${PAPER_GLSL}
uniform vec4 uCam;
vec2 toPaper(vec2 P){ vec2 c = vec2(960., 540.); return rot(-uCam.w) * ((P - c) / uCam.z) + c + uCam.xy; }
uniform sampler2D uPrev, uKey, uCol, uGuide, uMask, uEyes, uSub;
uniform float uSubTex;
uniform float uEyeOn; uniform vec3 uEa, uEb;  // likeness lock: drawing px -> frame-0 px of the painted key's eyes
uniform vec2 uVid;            // video work size (px)
uniform vec3 uView;           // centre (uv) + zoom
uniform vec3 uTa, uTb;        // T_i  : current frame px -> frame-0 px (rows)
uniform vec3 uFa, uFb;        // Ti_f : frame-0 px -> held drawing px (rows)
uniform int uPaper;           // 0 silk, 1 ink (xuan), 2 gold (indigo)
uniform vec3 uPm;             // our paper's ground colour
uniform float uLock;          // 1 = keyframe only (opening of the shot), 0 = full redraw
uniform float uMaskGain, uRedrawAll;
uniform vec3 uPal[16]; uniform int uNPal;
uniform float uLev[6]; uniform int uNLev;
uniform float uQuant; uniform vec3 uInkDark;
uniform float uFaceKeep, uSubOn, uSubLo, uSubHi, uSnapAmt;
uniform float uSnap, uShade, uLineTh, uLineW, uLineA, uBoldA, uGran, uWet, uGlow, uWash, uFaceFlat;
uniform vec3 uInk;            // line ink colour
uniform float uSeed, uDark;
out vec4 o;

vec3 toLab(vec3 c){
  vec3 l = pow(clamp(c, 0., 1.), vec3(2.2));
  vec3 xyz = mat3(0.4124, 0.2126, 0.0193, 0.3576, 0.7152, 0.1192, 0.1805, 0.0722, 0.9505) * l;
  xyz /= vec3(0.9505, 1., 1.089);
  vec3 f = mix(7.787 * xyz + 16. / 116., pow(max(xyz, 1e-5), vec3(1. / 3.)), step(0.008856, xyz));
  return vec3(116. * f.y - 16., 500. * (f.x - f.y), 200. * (f.y - f.z));
}
vec2 aff(vec3 a, vec3 b, vec2 p){ return vec2(dot(a, vec3(p, 1.)), dot(b, vec3(p, 1.))); }

// soft snap of a colour to the keyframe palette: flat regions, soft seams where two pigments meet
vec3 snap(vec3 c, out float conf){
  vec3 L = toLab(c);
  float d1 = 1e9, d2 = 1e9; vec3 p1 = c, p2 = c;
  for (int i = 0; i < 16; i++) {
    if (i >= uNPal) break;
    vec3 pl = toLab(uPal[i]);
    vec3 dd = (L - pl) * vec3(0.8, 1., 1.);
    float d = dot(dd, dd);
    if (d < d1) { d2 = d1; p2 = p1; d1 = d; p1 = uPal[i]; } else if (d < d2) { d2 = d; p2 = uPal[i]; }
  }
  float a = sqrt(d1), b = sqrt(d2);
  conf = smoothstep(0., uSnap, b - a);
  return mix(mix(p1, p2, 0.5), p1, 0.5 + 0.5 * conf);
}

float lumAt(vec2 pf){ return luma(texture(uCol, pf / uVid).rgb); }
float quantL(float l){         // soft quantisation to the keyframe's ink levels (the washes the painter used)
  float best = l, bd = 1e9, sec = l, sd = 1e9;
  for (int i = 0; i < 6; i++) {
    if (i >= uNLev) break;
    float d = abs(l - uLev[i]);
    if (d < bd) { sd = bd; sec = best; bd = d; best = uLev[i]; } else if (d < sd) { sd = d; sec = uLev[i]; }
  }
  float k = smoothstep(0., 0.06, sd - bd);
  return mix(mix(best, sec, 0.5), best, 0.5 + 0.5 * k);
}

void main(){
  vec2 P = PX();
  vec3 prev = FBO(uPrev, P).rgb;
  vec2 Pw = toPaper(P);
  vec3 tex = prev / uPm;                                     // our paper's own texture (weave / fibres / mottle)
  // --- where are we in the clip
  float ar = uVid.x / uVid.y, rar = 1920. / 1080.;
  vec2 span = ar > rar ? vec2(rar / ar, 1.) : vec2(1., ar / rar);
  vec2 q = P / vec2(1920., 1080.);
  vec2 half_ = span / uView.z * 0.5;
  vec2 ctr = clamp(uView.xy, half_, 1. - half_);
  vec2 uvi = ctr + (q - .5) * span / uView.z;
  vec2 pi = uvi * uVid;
  vec2 p0 = aff(uTa, uTb, pi);
  vec2 pf = aff(uFa, uFb, p0);
  vec2 uv0 = p0 / uVid, uvf = pf / uVid;
  bool inKey = all(greaterThanEqual(uv0, vec2(0.))) && all(lessThanEqual(uv0, vec2(1.)));
  // --- the painted keyframe, on our paper
  vec3 key = texture(uKey, clamp(uv0, 0., 1.)).rgb;
  vec3 keyN = key * mix(vec3(1.), tex, 0.55);
  float mask = clamp(texture(uMask, clamp(uv0, 0., 1.)).r * uMaskGain, 0., 1.);
  if (!inKey) mask = 1.;
  // subject matte (per drawing): inside the motion region, only what the video does DIFFERENTLY from the painting is
  // redrawn — water, walls and ground the video merely reproduces keep the painted keyframe (no muddy redraw bands)
  if (uSubOn > 0. && inKey) {
    float faceM = smoothstep(0.1, 0.5, texture(uGuide, uvf).b);   // faces are always redrawn (re-mouthing)
    float sub;
    if (uSubTex > 0.) sub = texture(uSub, uvf).r;                // prep's region-filled matte (whole subjects)
    else {                                                         // fallback: per-pixel difference from the key
      vec3 sB = textureLod(uCol, uvf, 1.2).rgb, kB = textureLod(uKey, uv0, 2.2).rgb;
      sub = smoothstep(uSubLo, uSubHi, length(toLab(sB) - toLab(kB)));
    }
    mask *= max(sub, faceM);
  }
  mask = max(mask, uRedrawAll);
  float keyAmt = max(1. - mask, uLock);
  if (keyAmt >= 0.999) { o = vec4(keyN, 1.); return; }

  // --- the drawing
  vec3 src = texture(uCol, uvf).rgb;
  vec4 G = texture(uGuide, uvf);                              // r thin line, g bold line, b face
  float face = G.b;
  float gran = vnoise(Pw * 0.9 + uSeed) * .55 + vnoise(Pw * 0.31 + uSeed * 1.7 + 5.) * .45;
  float fine = hash12(floor(Pw * 1.3) + uSeed);
  // hand wobble of the line threshold along the paper (static: it belongs to the drawing surface, it never boils)
  float wob = (vnoise(Pw * 0.045 + uSeed * 3.) - .5) * 0.16;
  float fib = fiberAt(Pw).r;
  vec3 col;
  if (uPaper == 0) {
    // ===== 绢 SILK: flat mineral fills + iron-wire gongbi line
    float conf; vec3 fl = mix(src, snap(src, conf), uSnapAmt);
    // faces: the source is already flattened by prep; snapping skin to a scene pigment would bleach or tint her
    fl = mix(fl, src, uFaceKeep * smoothstep(0.2, 0.8, face));
    float sh = mix(uShade, uShade * uFaceFlat, face);
    float lr = clamp(luma(src) / max(luma(fl), 0.03), 0.6, 1.4);
    fl *= mix(1., lr, sh);
    // 分染: a soft graded wash darkening toward the outlines (the gongbi colourist's shading), never on faces
    float near = smoothstep(0.02, 0.45, G.g) * (1. - face);
    fl *= 1. - 0.10 * near;
    // mineral granulation where the pigment is saturated (azurite / malachite settle into the weave)
    float sat = length(fl - vec3(luma(fl)));
    float g2 = smoothstep(0.55, 0.85, gran) * 0.5 + smoothstep(0.82, 0.97, fine) * 0.5;
    fl *= 1. - uGran * g2 * smoothstep(0.04, 0.18, sat) * (1. - face);
    col = fl * mix(vec3(1.), tex, 0.55);
    float th = uLineTh + wob;
    float a = smoothstep(th - uLineW, th + uLineW * 0.6, G.r) * uLineA;
    a *= 0.82 + 0.25 * fib;
    col = mix(col, uInk * mix(vec3(1.), tex, 0.4), clamp(a, 0., 1.));
  } else if (uPaper == 1) {
    // ===== 宣 INK: monochrome washes on xuan, wet edges, granulation, 留白, bold dry-brush contours; Earth keeps colour
    float l0 = lumAt(pf);
    float l = mix(l0, quantL(l0), uQuant);             // washes keep their gradation; levels only pull toward the painter's
    // wet edge: a wash is darkest at its rim, where the water carried the pigment as it dried
    float s = 0.;
    for (int k = 0; k < 8; k++) {
      float an = float(k) * 0.7854;
      float ln = lumAt(pf + vec2(cos(an), sin(an)) * 3.5);
      s += mix(ln, quantL(ln), uQuant);
    }
    s /= 8.;
    float rim = clamp(s - l, 0., 0.25);
    // coverage is luminance-matched between the painting's paper level and its darkest pigment, so the redraw reaches
    // exactly the keyframe's own blacks and greys; granulation and the wet rim then modulate it
    float Lp = uLev[uNLev - 1], Ld = luma(uInkDark);
    float cov = clamp((Lp - l) / max(Lp - Ld, 0.05), 0., 1.);
    float mid = smoothstep(0.05, 0.3, cov) * (1. - smoothstep(0.75, 0.98, cov));
    float clump = vnoise(Pw * 0.55 + uSeed * 2.3);   // pigment settles in clumps a few fibres wide, not per pixel
    cov *= 1. + uGran * (gran - .5) * 0.8 * mid + uGran * 0.5 * (clump - .5) * mid;
    cov += rim * uWet * 1.6 * (1. - cov);
    cov = l > Lp - 0.04 ? 0. : clamp(cov, 0., 1.);          // 留白: the lightest wash is the paper itself
    col = mix(prev, uInkDark * mix(vec3(1.), tex, 0.3), cov);
    // bold contour with 飞白 dry-brush gaps along the stroke
    float gx = texture(uGuide, (pf + vec2(2., 0.)) / uVid).g - texture(uGuide, (pf - vec2(2., 0.)) / uVid).g;
    float gy = texture(uGuide, (pf + vec2(0., 2.)) / uVid).g - texture(uGuide, (pf - vec2(0., 2.)) / uVid).g;
    vec2 n = normalize(vec2(gx, gy) + 1e-5), tg = vec2(-n.y, n.x);
    float streak = vnoise(vec2(dot(Pw, tg) * 0.035, dot(Pw, n) * 0.85) + uSeed);
    float th = uLineTh + wob;
    float core = smoothstep(th - uLineW, th + uLineW, G.g);
    float dry = mix(smoothstep(0.22, 0.6, streak), 1., smoothstep(th + 0.25, th + 0.55, G.g));
    float a = core * dry * uBoldA * (0.85 + 0.25 * fib);
    float at = smoothstep(uLineTh - 0.1, uLineTh + 0.12, G.r) * uLineA;   // fine line for detail (visor, joints)
    float A = clamp(max(a, at), 0., 1.);
    col = mix(col, uInkDark * mix(vec3(1.), tex, 0.3), A);
    // Earth: the only colour on the Moon (azurite / malachite hue), drawn as mineral pigment
    float mx = max(src.r, max(src.g, src.b)), mn = min(src.r, min(src.g, src.b));
    float satS = (mx - mn) / max(mx, 1e-3);
    float blueGreen = smoothstep(0.02, 0.10, src.b - src.r) + smoothstep(0.02, 0.10, src.g - src.r) * 0.6;
    float earth = smoothstep(0.18, 0.32, satS) * smoothstep(0.07, 0.14, mx - mn) * clamp(blueGreen, 0., 1.) * smoothstep(0.12, 0.25, mx);
    float conf; vec3 ec = snap(src, conf);
    col = mix(col, ec * mix(vec3(1.), tex, 0.55), earth);
  } else {
    // ===== 磁青泥金 GOLD: re-inked in powdered gold on our indigo. The source is already gold line art, so its light IS
    // the gold's density (every hair strand survives); our even line field adds weight where edges are strong; emboss
    // from the line field's slope; glow only in the drop section.
    float lsrc = luma(src);
    float lbg = luma(textureLod(uCol, uvf, 4.).rgb);
    float dens = pow(smoothstep(0.05, 0.6, lsrc), 0.8) * (0.8 + 0.2 * smoothstep(0.0, 0.15, lsrc - lbg));
    float th = uLineTh + wob;
    float lineA = smoothstep(th - uLineW, th + uLineW * 0.6, max(G.r, G.g * 0.75)) * 0.55;
    float e = texture(uGuide, (pf + vec2(-1.2, -1.2)) / uVid).r - texture(uGuide, (pf + vec2(1.2, 1.2)) / uVid).r;
    vec3 gold = goldInk(Pw, uSeed) * (0.92 + 0.4 * e) * (0.9 + 0.2 * fib);
    float gm = vnoise(Pw * 0.9 + uSeed) * .55 + vnoise(Pw * 3.1 + uSeed * 1.7) * .45;   // wash: matte gold, no glitter
    vec3 goldW = mix(vec3(0.74, 0.57, 0.28), vec3(0.91, 0.75, 0.41), gm) * (0.94 + 0.1 * fib);
    gold = mix(goldW, gold, smoothstep(0.2, 0.6, max(G.r, G.g)));
    vec3 ground = prev * mix(0.85, 1.0, smoothstep(0.03, 0.2, lsrc));
    // luminance-matched: the gold is laid exactly as thick as the source is light (fine strands keep their weight)
    float lg = luma(ground), lgo = luma(gold);
    float a = clamp((lsrc * 1.04 - lg) / max(lgo - lg, 0.05), 0., 1.) * mix(1., dens, 0.25);
    a = clamp(max(a * uWash / 0.85, lineA) * uLineA, 0., 1.);
    col = mix(ground, gold, a);
    if (uGlow > 0.) col += gold * smoothstep(0.55, 0.95, lsrc) * smoothstep(0.0, 0.6, G.g + dens * 0.3) * uGlow * 0.45;
  }
  // likeness lock: the keyframe's PAINTED eyes, brows and nose tip ride on the head (the video model shrinks eyes)
  if (uEyeOn > 0.) {
    vec2 pe = aff(uEa, uEb, pf);
    float em = texture(uEyes, clamp(pe / uVid, 0., 1.)).r * uEyeOn;
    vec3 ke = texture(uKey, clamp(pe / uVid, 0., 1.)).rgb * mix(vec3(1.), tex, 0.55);
    col = mix(col, ke, em);
  }
  o = vec4(mix(col, keyN, keyAmt), 1.);
}`;
