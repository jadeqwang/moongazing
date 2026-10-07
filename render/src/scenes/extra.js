// Extra scenes for the full animatic: labelled placeholder cards, paper cross-fades, image seals, the emblem.
import { PAPER_GLSL } from '../paper.js';
import { sealFromImage, drawStamp } from '../seal.js';
import { smooth, clamp } from '../util.js';

// A placeholder is a mounted, empty album leaf on the section's paper: a ruled double frame, the shot's description
// in quiet serif, and the keyframe it is waiting for. (Tasteful, but unmistakably a placeholder.)
export const placeholder = {
  draw(ctx, shot, t, lt) {
    const p = shot.params;
    const dark = ['indigo', 'silknight', 'rubbing'].includes(shot.paper) || p.dark;
    const ink = dark ? 'rgba(232,222,198,' : 'rgba(30,28,28,';
    const fx = 260, fy = 170, fw = 1400, fh = 740;
    ctx.pipe.layer((g) => {
      g.strokeStyle = ink + '0.55)'; g.lineWidth = 1.2; g.strokeRect(fx, fy, fw, fh);
      g.strokeStyle = ink + '0.3)'; g.lineWidth = 0.8; g.strokeRect(fx + 10, fy + 10, fw - 20, fh - 20);
      // a faint ink moon on the leaf so the frame is never empty
      g.fillStyle = ink + '0.07)'; g.beginPath(); g.arc(fx + fw - 230, fy + 220, 110, 0, Math.PI * 2); g.fill();
    }, { mode: dark ? 'over' : 'ink', absorb: 0.5, seed: 61 });
    const c = ctx.type.card(`ph-${shot.id}`, { lines: wrap(p.title, 46), font: 'CormorantItalic', size: 46, leading: 1.25, x: fx + 90, y: fy + 330, color: dark ? '#e8dec6' : '#1e1c1c' });
    ctx.pipe.layer((g) => c.draw(g, 1, 0.9), { mode: dark ? 'over' : 'ink', absorb: 0.3, seed: 62 });
    ctx.pipe.layer((g) => {
      ctx.type.hud(g, `${shot.id}`, fx + 90, fy + 120, { size: 22, color: ink + '0.8)', tracking: 0.2 });
      ctx.type.hud(g, `KEYFRAME PENDING  ·  ${p.file || ''}`, fx + 90, fy + fh - 70, { size: 13, color: ink + '0.6)', tracking: 0.16 });
    }, { mode: 'over', seed: 63 });
  },
};
function wrap(s, n) { const w = s.split(' '); const out = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n) { out.push(cur.trim()); cur = x; } else cur += ' ' + x; } if (cur.trim()) out.push(cur.trim()); return out.slice(0, 4); }

// lay another paper over the frame (e.g. GOLD → INK): params.paperTo, params.fade(t, lt) -> 0..1
const PF = `${PAPER_GLSL}
uniform sampler2D uPrev; uniform int uKind; uniform float uA, uSeed;
out vec4 o;
void main(){ vec2 P = PX(); vec3 prev = FBO(uPrev, P).rgb;
  float n = fbm3(P * 0.004 + uSeed);
  float a = smoothstep(n - 0.25, n + 0.25, uA * 1.5 - 0.25);
  o = vec4(mix(prev, paperColor(uKind, P, uSeed), a), 1.); }`;
export const paperfade = {
  init(ctx) { this.prog = ctx.gl.program(PF, 'paperfade'); },
  draw(ctx, shot, t, lt) {
    const p = shot.params;
    const K = { xuan: 0, silk: 1, indigo: 2, silknight: 3 }[p.paperTo] ?? 0;
    ctx.pipe.apply(this.prog, { uKind: { i: K }, uA: p.fade(t, lt), uSeed: 3.1 });
  },
};

// a stamped image seal (media/chars/identity seal_*.png): params { seal, x, y, size, tLand, rot }
const cache = new Map();
export const stamp = {
  draw(ctx, shot, t, lt) {
    const p = shot.params.stamp;
    if (!ctx.assets[p.seal]) return;
    const k = `${p.seal}@${p.size}`;
    if (!cache.has(k)) cache.set(k, sealFromImage(ctx.type, ctx.assets[p.seal], p.size));
    let post = {};
    ctx.pipe.layer((g) => { post = drawStamp(g, cache.get(k), { x: p.x, y: p.y, t, tLand: p.tLand, rot: p.rot ?? -0.02, approach: 0.14 }); }, { mode: 'ink', absorb: 0.5, seed: 64 });
    ctx.postExtra = { ...(ctx.postExtra || {}), deflect: post.deflect, bump: post.bump };
  },
};

// the agency emblem (pale-blue dot in a sunbeam): params.emblem { x, y, size, t0, fade }
export const emblem = {
  draw(ctx, shot, t, lt) {
    const p = shot.params.emblem; const img = ctx.assets.emblem_final; if (!img) return;
    const a = smooth(p.t0, p.t0 + (p.fade ?? 0.6), t) * (p.alpha ?? 1);
    if (a <= 0) return;
    const s = p.size * (1 + 0.04 * (1 - smooth(p.t0, p.t0 + 1.2, t)));
    ctx.pipe.layer((g) => { g.globalAlpha = a; g.drawImage(img, p.x - s / 2, p.y - s / 2 * img.height / img.width, s, s * img.height / img.width); }, { mode: 'over', seed: 65 });
  },
};

import { earthDisc } from './jiehua.js';
import { mulberry32 } from '../util.js';

// 3.5 — 八行笺: an eight-column letter sheet with vermilion ruled lines, laid on the silk
export const letter = {
  draw(ctx, shot, t, lt) {
    const x0 = 1080, y0 = 120, w = 700, h = 860;
    ctx.pipe.layer((g) => {
      g.fillStyle = 'rgba(244,238,224,0.9)'; g.save(); g.translate(x0 + w / 2, y0 + h / 2); g.rotate(-0.025); g.translate(-(x0 + w / 2), -(y0 + h / 2));
      g.fillRect(x0, y0, w, h);
      g.strokeStyle = 'rgba(190,60,44,0.75)'; g.lineWidth = 2.2; g.strokeRect(x0 + 40, y0 + 50, w - 80, h - 100);
      g.lineWidth = 1.1; for (let i = 1; i < 8; i++) { const x = x0 + 40 + (w - 80) * i / 8; g.beginPath(); g.moveTo(x, y0 + 50); g.lineTo(x, y0 + h - 50); g.stroke(); }
      g.restore();
    }, { mode: 'over', seed: 66 });
  },
};

// 7.B5 — boot-kicked dust in 1/6 g, no air: every grain flies a clean parabola and falls at once (no cloud)
export const dust = {
  draw(ctx, shot, t, lt) {
    const r = mulberry32(905), g0 = 300; // px/s² (1/6 g, slow-mo scaled)
    ctx.pipe.layer((g) => {
      g.fillStyle = '#141416';
      g.fillRect(0, 860, 1920, 3); // horizon of the ground line
      for (let i = 0; i < 220; i++) {
        const ang = 0.35 + r() * 0.9, v = 200 + r() * 280, t0 = r() * 0.25, sz = 1.2 + r() * 2.4;
        const s = lt - t0; if (s < 0) continue;
        const vx = Math.cos(ang) * v * (r() < 0.5 ? 1 : 1), vy = Math.sin(ang) * v;
        const tl = 2 * vy / g0; const ss = Math.min(s, tl);
        const x = 520 + vx * ss, y = 860 - (vy * ss - 0.5 * g0 * ss * ss);
        g.globalAlpha = 0.85; g.beginPath(); g.arc(x, y, sz, 0, Math.PI * 2); g.fill();
        // the arc it traced: a hairline of ink
        if (i % 9 === 0) { g.globalAlpha = 0.18; g.lineWidth = 0.8; g.strokeStyle = '#141416'; g.beginPath(); for (let k = 0; k <= 30; k++) { const q = ss * k / 30; const xx = 520 + vx * q, yy = 860 - (vy * q - 0.5 * g0 * q * q); k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
      }
      g.globalAlpha = 1;
    }, { mode: 'ink', absorb: 0.5, seed: 67 });
  },
};

// 7.D3 — the seam of the split screen: a fine ink rule
export const seam = { draw(ctx) { ctx.pipe.layer((g) => { g.fillStyle = 'rgba(20,18,18,0.9)'; g.fillRect(958.5, 0, 3, 1080); }, { mode: 'over' }); } };

// 7.E2 — Earth, to scale with the Moon of the pull-back
export const earthfar = {
  draw(ctx, shot, t, lt) {
    const m = shot.params.placeAt(t, lt); const R = m.R * 3.67, x = m.x - m.R * 221;
    if (x + R < -10) return;
    ctx.pipe.layer((g) => earthDisc(g, x, m.y, R, 5), { mode: 'over' });
  },
};

// 7.E3 — the pale blue dot, caught in a band of scattered sunlight (Voyager 1, 1990)
export const bluedot = {
  draw(ctx, shot, t, lt) {
    ctx.pipe.layer((g) => {
      g.save(); g.translate(960, 540); g.rotate(-0.32);
      for (const [w, a] of [[260, 0.08], [120, 0.08], [50, 0.06]]) { const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, 'rgba(212,168,75,0)'); gr.addColorStop(0.5, `rgba(212,168,75,${a})`); gr.addColorStop(1, 'rgba(212,168,75,0)'); g.fillStyle = gr; g.fillRect(-w, -1400, 2 * w, 2800); }
      g.restore();
      const a = smooth(0.2, 0.8, lt);
      g.globalAlpha = a; g.fillStyle = '#b8d4ec'; g.beginPath(); g.arc(960, 540, 2.2, 0, Math.PI * 2); g.fill();
    }, { mode: 'over', seed: 68 });
  },
};
