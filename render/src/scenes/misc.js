// Small scenes and overlays: placeholder tags, the Wenchang beach at dusk (1.6), the stage wires (1.3),
// Earth on the lunar horizon (1.5), the "ink → gold" wash transition.
import { smooth, clamp, mulberry32, vnoise } from '../util.js';
import { earthDisc } from './jiehua.js';

const qs = new URLSearchParams(location.search);

// tasteful label for stand-ins / placeholders: tiny mono, bottom-left, never over the picture's centre
export const tag = {
  draw(ctx, shot, t, lt) {
    if (qs.has('nolabels')) return;
    const p = shot.params || {};
    const dark = ['indigo', 'silknight'].includes(shot.paper) || p.tagDark;
    ctx.pipe.layer((g) => {
      const a = 0.62;
      const col = dark ? `rgba(226,214,186,${a})` : `rgba(32,30,30,${a})`;
      ctx.type.hud(g, `${shot.id}  ·  ${p.tag}`, 48, 1036, { size: 12, color: col, tracking: 0.12 });
    }, { mode: 'over' });
  },
};

// a soft wash laid over the frame (multiply), e.g. dusk sky bands. params.washes: [{y0,y1,c0,c1}] css colours
export const washes = {
  draw(ctx, shot) {
    const p = shot.params;
    ctx.pipe.layer((g) => {
      for (const w of p.washes) {
        const gr = g.createLinearGradient(0, w.y0, 0, w.y1);
        gr.addColorStop(0, w.c0); gr.addColorStop(1, w.c1);
        g.fillStyle = gr; g.fillRect(0, w.y0, 1920, w.y1 - w.y0);
      }
    }, { mode: 'ink', absorb: 0.8, seed: 31 });
  },
};

// 1.6 — beach at dusk: a low headland with the launch tower, a quiet sea, and the ascent: a gold streak with its
// sunlit vapour plume (the "twilight jellyfish" seen from Wenchang's beaches).
const HZ = 646;
export const beach = {
  init() {
    const r = mulberry32(606);
    this.hills = []; for (let x = -10; x <= 900; x += 6) this.hills.push([x, HZ - (Math.sin(x * 0.006) * 0.5 + 0.5) * 30 * Math.min(1, (900 - x) / 300) - vnoise(x * 0.02, 1, 3) * 16]);
    this.ripples = [];
    for (let i = 0; i < 240; i++) { const d = Math.pow(r(), 1.7); const y = HZ + 6 + d * 200; this.ripples.push({ x: r() * 1980 - 30, y, L: (20 + r() * 130) * (0.4 + d), w: 0.6 + d * 1.4, a: 0.12 + 0.3 * r() }); }
  },
  draw(ctx, shot, t, lt) {
    const dur = shot.t1 - shot.t0;
    ctx.pipe.layer((g) => {
      // headland
      g.fillStyle = 'rgba(70,74,82,0.55)';
      g.beginPath(); g.moveTo(-10, HZ + 1); this.hills.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(900, HZ + 1); g.closePath(); g.fill();
      // launch tower, tiny, on the headland
      g.strokeStyle = 'rgba(40,40,44,0.8)'; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(626, HZ - 22); g.lineTo(626, HZ - 58); g.moveTo(632, HZ - 22); g.lineTo(632, HZ - 58); g.stroke();
      // sea ripples (dry, broken)
      g.strokeStyle = 'rgb(40,56,66)'; g.lineCap = 'round';
      for (const q of this.ripples) { g.globalAlpha = q.a; g.lineWidth = q.w; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + q.L, q.y); g.stroke(); }
      g.globalAlpha = 1;
      g.strokeStyle = 'rgba(30,30,32,0.7)'; g.lineWidth = 1.0;
      g.beginPath(); g.moveTo(900, HZ); g.lineTo(1920, HZ); g.stroke();
    }, { mode: 'ink', absorb: 0.6, seed: 32 });
    // the ascent
    const p = smooth(-0.6, dur, lt);
    const pts = []; for (let k = 0; k <= 100; k++) { const u = k / 100; pts.push([629 + 560 * u * u, HZ - 60 - 560 * u + 60 * u * u]); }
    const n = Math.max(2, Math.round(100 * p));
    ctx.pipe.layer((g) => { // vapour plume, lit by the sun below the horizon: pale, widening with age
      g.filter = 'blur(6px)';
      for (let i = 1; i <= n; i++) {
        const age = (n - i) / 100;
        g.strokeStyle = `rgba(250,236,214,${(0.30 * (1 - age * 0.6)).toFixed(3)})`;
        g.lineWidth = 6 + age * 70 + (i / 100) * 10;
        g.beginPath(); g.moveTo(...pts[i - 1]); g.lineTo(...pts[i]); g.stroke();
      }
    }, { mode: 'screen' });
    ctx.pipe.layer((g) => {
      g.lineCap = 'round';
      for (let i = 1; i <= n; i++) {
        const age = (n - i) / 100;
        g.strokeStyle = `rgba(255,255,255,${(1 - age * 0.85).toFixed(3)})`;
        g.lineWidth = 3.4 - (i / 100) * 1.8;
        g.beginPath(); g.moveTo(...pts[i - 1]); g.lineTo(...pts[i]); g.stroke();
      }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(...pts[n], 3.6, 0, Math.PI * 2); g.fill();
    }, { mode: 'gold', seed: 33 });
  },
};

// 1.3 — stage wires (two fine lines from the flies)
export const wires = {
  draw(ctx, shot) {
    ctx.pipe.layer((g) => {
      g.strokeStyle = 'rgba(230,224,210,0.55)'; g.lineWidth = 0.9;
      for (const x of [884, 936]) { g.beginPath(); g.moveTo(x, -10); g.lineTo(x + 6, 560); g.stroke(); }
    }, { mode: 'over' });
  },
};

// Earth seen from the Moon — the only colour on the INK paper
export const earth = {
  draw(ctx, shot, t, lt) {
    const p = shot.params.earth;
    ctx.pipe.layer((g) => earthDisc(g, p.x + (p.dx || 0) * lt, p.y, p.r, 5), { mode: 'over' });
  },
};

// a launch streak anchored to a point in a moving plate (image uv), e.g. the tower on K_1.6's horizon
export const streak = {
  draw(ctx, shot, t, lt) {
    const p = shot.params, st = p.streak;
    const dur = shot.t1 - shot.t0;
    const u = easeIO(lt / dur);
    const a = p.from, b = p.to || p.from;
    const cx = a.x + (b.x - a.x) * u, cy = a.y + (b.y - a.y) * u, z = a.zoom + (b.zoom - a.zoom) * u;
    const X = 960 + (st.uv[0] - cx) * z * 1920, Y = 540 + (st.uv[1] - cy) * z * 1080;
    const pr = smooth(st.t0 ?? -0.3, dur, lt);
    const pts = []; for (let k = 0; k <= 100; k++) { const q = k / 100; pts.push([X + st.dx * z * q * q, Y - st.h * z * q + st.bend * z * q * q]); }
    const n = Math.max(2, Math.round(100 * pr));
    ctx.pipe.layer((g) => {
      g.filter = 'blur(5px)';
      for (let i = 1; i <= n; i++) {
        const age = (n - i) / 100;
        g.strokeStyle = `rgba(246,236,220,${(0.26 * (1 - age * 0.6)).toFixed(3)})`;
        g.lineWidth = (4 + age * 46 + (i / 100) * 8) * z;
        g.beginPath(); g.moveTo(...pts[i - 1]); g.lineTo(...pts[i]); g.stroke();
      }
    }, { mode: 'screen' });
    ctx.pipe.layer((g) => {
      g.lineCap = 'round';
      for (let i = 1; i <= n; i++) {
        const age = (n - i) / 100;
        g.strokeStyle = `rgba(255,255,255,${(1 - age * 0.85).toFixed(3)})`;
        g.lineWidth = (2.8 - (i / 100) * 1.4) * z;
        g.beginPath(); g.moveTo(...pts[i - 1]); g.lineTo(...pts[i]); g.stroke();
      }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(...pts[n], 3.2 * z, 0, Math.PI * 2); g.fill();
    }, { mode: 'gold', seed: 34 });
  },
};
const easeIO = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
