// Typographic moments built in JS, each with one focal point.
//   wallcalli (3.3)  — macro on the lime-washed teahouse wall: Jade's fingertip traces 举杯邀明月 as it is brushed in.
//   assignment (3.5) — her letter of assignment (bilingual, with the agency emblem) held over the desk; the 廣寒 seal
//                      slams onto it on bar 32; T's toy Earth on the desk.
import { smooth, clamp, mulberry32, vnoise } from '../util.js';
import { earthDisc } from './jiehua.js';
import { plate, plateMap } from './plate.js';
import { sealFromImage, drawStamp } from '../seal.js';
import { PAPER_GLSL } from '../paper.js';

// Painted hand plates (media/keyframes) — when delivered they replace the JS hands. The anchor points are in image uv
// and are tuned here (engine side), so the section files never need to change when a take is redone.
export const HAND_33 = { img: 'K_3.3_hand', tip: [0.512, 0.324], size: 150, top: 64, params: { grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.5, y: 0.49, zoom: 1.08 } } };
export const HANDS_35 = { img: 'K_3.5_hands', quad: [[0.309, 0.034], [0.773, 0.034], [0.775, 0.919], [0.310, 0.919]], seal: [0.80, 0.84], params: { grade: 'native', from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.5, y: 0.5, zoom: 1.07 } } };

// homography from the unit square to a quad (p00, p10, p11, p01) and its inverse (row-major 3x3)
function homography(q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den;
  const H = [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h, 1];
  const [a, b, c, d, e, f, gg, hh, i] = H;
  const A = e * i - f * hh, Bv = -(d * i - f * gg), C = d * hh - e * gg;
  const det = a * A + b * Bv + c * C;
  const inv = [A, -(b * i - c * hh), b * f - c * e, Bv, a * i - c * gg, -(a * f - c * d), C, -(a * hh - b * gg), a * e - b * d].map((v) => v / det);
  return { H, inv, map(u, v) { const w = gg * u + hh * v + i; return [(a * u + b * v + c) / w, (d * u + e * v + f) / w]; } };
}
const WARP = `${PAPER_GLSL}
uniform sampler2D uPrev, uSheet; uniform vec3 uI0, uI1, uI2;
out vec4 o;
void main(){ vec2 P = PX(); vec3 prev = FBO(uPrev, P).rgb;
  vec3 h = vec3(dot(uI0, vec3(P, 1.)), dot(uI1, vec3(P, 1.)), dot(uI2, vec3(P, 1.)));
  vec2 uv = h.xy / h.z;
  if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) { o = vec4(prev, 1.); return; }
  vec4 L = texture(uSheet, uv);
  float gr = vnoise(P * 0.9) * .5 + .5;
  float a = L.a * (0.82 + 0.25 * gr);            // ink taken up unevenly by the paper
  a *= 1. - smoothstep(0.42, 0.50, (prev.r - prev.b) / max(prev.r, 1e-3));   // never on her thumbs (skin is far more saturated than the paper)
  o = vec4(prev * mix(vec3(1.), L.rgb, a), 1.); }`;


const SKIN = 'rgba(234,200,166,0.97)', LINE = 'rgba(70,42,30,0.9)';

// a fingertip in fine gongbi line: a long rounded form from (bx,by) to the tip (tx,ty), nail near the tip
function finger(g, bx, by, tx, ty, w = 64) {
  const ang = Math.atan2(ty - by, tx - bx), L = Math.hypot(tx - bx, ty - by);
  g.save(); g.translate(bx, by); g.rotate(ang);
  const shape = () => { g.beginPath(); g.moveTo(0, -w * 0.62); g.bezierCurveTo(L * 0.5, -w * 0.6, L - w * 0.6, -w * 0.52, L - w * 0.18, -w * 0.34); g.quadraticCurveTo(L + w * 0.06, 0, L - w * 0.18, w * 0.34); g.bezierCurveTo(L - w * 0.6, w * 0.52, L * 0.5, w * 0.6, 0, w * 0.62); g.closePath(); };
  // soft shadow on the wall
  g.save(); g.translate(16, 22); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(60,40,20,0.28)'; shape(); g.fill(); g.restore();
  g.fillStyle = SKIN; shape(); g.fill();
  // roundness: the far side of the finger in soft shadow
  g.save(); shape(); g.clip(); const sh = g.createLinearGradient(0, -w * 0.6, 0, w * 0.6); sh.addColorStop(0, 'rgba(255,240,225,0.35)'); sh.addColorStop(0.45, 'rgba(255,240,225,0)'); sh.addColorStop(1, 'rgba(150,90,60,0.35)'); g.fillStyle = sh; g.fillRect(0, -w, L + w, 2 * w); g.restore();
  g.strokeStyle = LINE; g.lineWidth = 1.5; shape(); g.stroke();
  // nail
  g.beginPath(); g.ellipse(L - w * 0.62, 0, w * 0.42, w * 0.3, 0, 0, Math.PI * 2); g.strokeStyle = 'rgba(70,42,30,0.55)'; g.lineWidth = 1.1; g.stroke();
  g.fillStyle = 'rgba(245,222,205,0.6)'; g.fill();
  // knuckle creases
  g.strokeStyle = 'rgba(70,42,30,0.45)'; g.lineWidth = 1.0;
  for (const k of [0.42, 0.47]) { g.beginPath(); g.moveTo(L * k, -w * 0.45); g.quadraticCurveTo(L * k + 6, 0, L * k, w * 0.45); g.stroke(); }
  g.restore();
}

export const wallcalli = {
  async draw(ctx, shot, t, lt) {
    const p = shot.params;
    if (ctx.store && ctx.store.has(HAND_33.img)) await ctx.store.need([HAND_33.img]);
    const painted = ctx.assets[HAND_33.img];
    const prog = smooth(p.a, p.b, t) * 5.25;
    if (painted) {
      // the painted hand on the blank wall: the inscription is brushed in down a column that ends under the fingertip
      const P = { img: HAND_33.img, ...HAND_33.params };
      plate.draw(ctx, { ...shot, params: P }, t, lt);
      const dur = shot.t1 - shot.t0, m0 = plateMap(P, 0, dur, painted), m = plateMap(P, lt, dur, painted);
      const tip0 = m0.at(HAND_33.tip), sz = HAND_33.size;
      // the column stands just left of the fingertip, top to bottom, so the finger rests against it as it is brushed in
      const it = ctx.type.inkText('wall33p', { text: '举杯邀明月', font: 'MaShanZheng', size: sz, x: Math.round(tip0[0] - 6), y: HAND_33.top, color: [0.08, 0.07, 0.07], seed: 33, lead: 1.02 });
      ctx.pipe.layer((g) => {
        // follow the camera push: P = a·uv + b, so map the lt=0 layout onto the current frame
        g.translate(m.b[0], m.b[1]); g.scale(m.a[0] / m0.a[0], m.a[1] / m0.a[1]); g.translate(-m0.b[0], -m0.b[1]);
        it.draw(g, prog, smooth(p.a + 0.2, p.b + 0.6, t));
      }, { mode: 'ink', absorb: 0.6, seed: 332 });
      return;
    }
    // (JS stand-in until K_3.3_hand lands) lime-washed plaster, warm, stained
    ctx.pipe.layer((g) => {
      g.fillStyle = 'rgba(238,228,206,0.9)'; g.fillRect(0, 0, 1920, 1080);
      const r = mulberry32(330);
      for (let i = 0; i < 26; i++) { const x = r() * 1920, y = r() * 1080, rad = 80 + r() * 360; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(150,120,80,${(0.03 + r() * 0.07).toFixed(3)})`); gr.addColorStop(1, 'rgba(150,120,80,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      g.fillStyle = 'rgba(58,38,26,0.92)'; g.fillRect(1640, 0, 34, 1080);
    }, { mode: 'ink', absorb: 0.6, seed: 331 });
    const it = ctx.type.inkText('wall33v2', { text: '举杯邀明月', font: 'MaShanZheng', size: 156, x: 1290, y: 96, color: [0.08, 0.07, 0.07], seed: 33, lead: 1.02 });
    ctx.pipe.layer((g) => it.draw(g, prog, smooth(p.a + 0.2, p.b + 0.6, t)), { mode: 'ink', absorb: 0.6, seed: 332 });
    const k = Math.min(4.9, prog), cx = 1290 - 156 / 2, ty = 96 + (Math.floor(k) + (k % 1) * 0.85) * 156 * 1.02 + 40;
    const tx = cx + Math.sin(k * 5.2) * 22 + 10;
    if (prog > 0.05 && prog < 5.2) ctx.pipe.layer((g) => {
      g.save(); g.filter = 'blur(2px)'; g.fillStyle = SKIN; g.beginPath(); g.ellipse(tx + 470, ty + 420, 190, 120, -0.75, 0, Math.PI * 2); g.fill(); g.restore();
      finger(g, tx + 380, ty + 330, tx + 6, ty, 92);
    }, { mode: 'over', seed: 333 });
  },
};

// the letter's ink (no paper): letterhead with the emblem, bilingual body, signature rule — laid out in a W×H sheet
function letterInk(g, ctx, W, H) {
  const ink = '#1d1d22';
  const em = ctx.assets.emblem_final; if (em) g.drawImage(em, 70, 64, 92, 92 * em.height / em.width);
  g.strokeStyle = 'rgba(40,40,46,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(70, 196); g.lineTo(W - 70, 196); g.stroke();
  g.fillStyle = ink; g.textBaseline = 'alphabetic';
  g.font = '44px MaShanZheng'; g.fillText('国际月球基地', 190, 118);
  g.font = '500 20px Cormorant'; g.letterSpacing = '4px'; g.fillText('INTERNATIONAL MOONBASE  ·  LUNAR SOUTH POLE', 192, 156);
  g.letterSpacing = '0px';
  g.font = '600 30px NotoSerifSC'; g.fillText('任命书', 70, 270);
  g.font = '500 30px Cormorant'; g.letterSpacing = '4px'; g.fillText('LETTER OF ASSIGNMENT', 200, 268); g.letterSpacing = '0px';
  g.font = '500 28px Cormorant';
  ['Dr. Jade Wang,', 'You are assigned to the International Moonbase, Lunar South Pole,', 'as Mission Specialist (ISRU & Habitat), Expedition 1.', 'Time on station: thirteen months.'].forEach((s, i) => g.fillText(s, 70, 350 + i * 44));
  g.font = '400 24px NotoSerifSC';
  ['Jade Wang 博士：', '兹任命您为国际月球基地第一期驻站任务专家', '（原位资源利用与居住），驻站十三个月。'].forEach((s, i) => g.fillText(s, 70, 570 + i * 42));
  g.strokeStyle = 'rgba(40,40,46,0.5)'; g.beginPath(); g.moveTo(470, 860); g.lineTo(W - 80, 860); g.stroke();
  g.font = '500 18px Cormorant'; g.letterSpacing = '3px'; g.fillText('FLIGHT DIRECTOR  ·  飞行主任', 470, 890); g.letterSpacing = '0px';
  g.font = '14px PlexMono'; g.fillStyle = 'rgba(29,29,34,0.7)'; g.fillText('EXP-01  ·  ISRU/HAB  ·  2035', 70, H - 50);
}
let sheetCanvas = null, sheetTex = null, sealImg = null;

export const assignment = {
  init(ctx) { this.warp = ctx.gl.program(WARP, 'warp'); },
  async draw(ctx, shot, t, lt) {
    const p = shot.params;
    const LW = 860, LH = 990;
    if (ctx.store && ctx.store.has(HANDS_35.img)) await ctx.store.need([HANDS_35.img]);
    const painted = ctx.assets[HANDS_35.img];
    if (painted) {
      // the painted hands hold a blank sheet: lay the letter's ink onto it in perspective, then the seal lands on it
      const P = { img: HANDS_35.img, ...HANDS_35.params };
      plate.draw(ctx, { ...shot, params: P }, t, lt);
      const m = plateMap(P, lt, shot.t1 - shot.t0, painted);
      const quad = HANDS_35.quad.map((uv) => m.at(uv));
      const S = ctx.S;
      if (!sheetCanvas) {
        sheetCanvas = document.createElement('canvas'); sheetCanvas.width = Math.round(LW * S); sheetCanvas.height = Math.round(LH * S);
        const g = sheetCanvas.getContext('2d'); g.scale(S, S); letterInk(g, ctx, LW, LH);
        sheetTex = ctx.gl.texture(sheetCanvas, { mip: true });
      }
      const Hm = homography(quad), I = Hm.inv;
      ctx.pipe.apply(this.warp, { uSheet: sheetTex, uI0: [I[0], I[1], I[2]], uI1: [I[3], I[4], I[5]], uI2: [I[6], I[7], I[8]] });
      const sp = Hm.map(HANDS_35.seal[0], HANDS_35.seal[1]);
      if (ctx.assets.emblem_final) {
        sealImg = sealImg || sealFromImage(ctx.type, ctx.assets.emblem_final, 150);
        let post = {};
        ctx.pipe.layer((g) => { post = drawStamp(g, sealImg, { x: sp[0], y: sp[1], t, tLand: p.tLand, rot: -0.04, approach: 0.14 }); }, { mode: 'ink', absorb: 0.5, seed: 356 });
        ctx.postExtra = { ...(ctx.postExtra || {}), deflect: post.deflect, bump: post.bump };
      }
      return;
    }
    // the desk: walnut, low lamplight from the left
    ctx.pipe.layer((g) => {
      g.fillStyle = 'rgba(78,52,34,0.9)'; g.fillRect(0, 0, 1920, 1080);
      const r = mulberry32(350);
      g.strokeStyle = 'rgba(40,24,14,0.25)';
      for (let i = 0; i < 70; i++) { const y = r() * 1080; g.lineWidth = 0.6 + r() * 1.6; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1920; x += 60) g.lineTo(x, y + Math.sin(x * 0.004 + i) * 6 + vnoise(x * 0.01, i, 3) * 10); g.stroke(); }
      const gr = g.createRadialGradient(560, 300, 50, 560, 300, 1500); gr.addColorStop(0, 'rgba(255,220,170,0.0)'); gr.addColorStop(1, 'rgba(20,10,5,0.55)');
      g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
    }, { mode: 'ink', absorb: 0.4, seed: 351 });
    // T's toy Earth on the desk
    ctx.pipe.layer((g) => {
      g.save(); g.filter = 'blur(14px)'; g.fillStyle = 'rgba(10,6,4,0.55)'; g.beginPath(); g.ellipse(360, 950, 150, 38, 0, 0, Math.PI * 2); g.fill(); g.restore();
      const es = ctx.assets.K04earth;
      if (es) { const cx = 0.22 * es.width, cy = 0.60 * es.height, rr = 0.068 * es.height; g.save(); g.beginPath(); g.arc(360, 840, 118, 0, Math.PI * 2); g.clip(); g.drawImage(es, cx - rr, cy - rr, rr * 2, rr * 2, 242, 722, 236, 236); g.restore(); }
      else earthDisc(g, 360, 840, 118, 7);
      const hl = g.createRadialGradient(320, 790, 4, 330, 800, 120); hl.addColorStop(0, 'rgba(255,240,220,0.35)'); hl.addColorStop(1, 'rgba(255,240,220,0)'); g.fillStyle = hl; g.beginPath(); g.arc(360, 840, 118, 0, Math.PI * 2); g.fill();
    }, { mode: 'over', seed: 352 });
    // the letter
    const LX = 880, LY = 70;
    const paper = (g) => { g.translate(LX + LW / 2, LY + LH / 2); g.rotate(-0.035); g.translate(-(LX + LW / 2), -(LY + LH / 2)); };
    ctx.pipe.layer((g) => {
      paper(g);
      g.save(); g.filter = 'blur(18px)'; g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(LX + 16, LY + 26, LW, LH); g.restore();
      g.fillStyle = '#f3eee2'; g.fillRect(LX, LY, LW, LH);
    }, { mode: 'over', seed: 353 });
    ctx.pipe.layer((g) => { paper(g); g.translate(LX, LY); letterInk(g, ctx, LW, LH); }, { mode: 'ink', absorb: 0.35, seed: 354 });
    // her thumbs at the lower corners, holding it
    ctx.pipe.layer((g) => {
      paper(g);
      finger(g, LX - 70, LY + LH + 60, LX + 120, LY + LH - 40, 58);
      finger(g, LX + LW + 80, LY + LH + 70, LX + LW - 110, LY + LH - 46, 58);
    }, { mode: 'over', seed: 355 });
    if (ctx.assets.emblem_final && p.tLand) {
      sealImg = sealImg || sealFromImage(ctx.type, ctx.assets.emblem_final, 150);
      let post = {};
      ctx.pipe.layer((g) => { post = drawStamp(g, sealImg, { x: 1580, y: 870, t, tLand: p.tLand, rot: -0.06, approach: 0.14 }); }, { mode: 'ink', absorb: 0.5, seed: 356 });
      ctx.postExtra = { ...(ctx.postExtra || {}), deflect: post.deflect, bump: post.bump };
    }
  },
};
