// gauge — the needle of the brass pressure gauge in 7.B2, drawn by the renderer over the roto take (rev 3, Oct 8).
// The keyframe's own needle is painted out (media/keyframes/work/rev3_base/b2_needle_out.py) and the take was generated
// from that needle-less frame, so this is the only needle and its timing is exact:
//   · it trembles from the first frame (a live line: seeded value noise in time, on ones, nothing random),
//   · then the reading rises slowly, starting `lag` seconds after the wheel begins to open the seat (`open`, shot time)
//     and following it as a first-order lag (time constant `tau`): a real Bourdon gauge downstream of a valve that is
//     being cracked open. The rise is the response to a slow ramp: p = p0 + k (s - tau (1 - e^(-s/tau))), s = lt - open - lag.
//
//   after the roto layer:  { name: 'gauge', params: { from, to,            // the SAME push as the roto layer
//       hub: [u, v], r,                                                    // hub and face radius in the take's uv (r in widths)
//       p0: 0.12, k: 0.2, open: 0.25, lag: 0.3, tau: 0.35,                 // reading 0..1 (0 = the stop at 7:30, 1 = 4:30)
//       tremble: 4.0 } }                                                   // degrees, peak
// The dial: zero at 7:30, full scale at 4:30, 270 degrees clockwise (the painted scale of K_7.B2).
import { easeInOutSine, vnoise, clamp } from '../util.js';

// screen position of a point of the take, exactly as roto/index.js + roto/shader.js place it (16:9 take, whole frame)
export function gaugeView(p, lt, dur) {
  const a = p.from || { x: 0.5, y: 0.5, zoom: 1 }, b = p.to || a, u = easeInOutSine(Math.min(1, Math.max(0, lt / dur)));
  const z = a.zoom + (b.zoom - a.zoom) * u, h = 0.5 / z;
  const cx = clamp(a.x + (b.x - a.x) * u, h, 1 - h), cy = clamp(a.y + (b.y - a.y) * u, h, 1 - h);
  return { at: ([x, y]) => [((x - cx) * z + 0.5) * 1920, ((y - cy) * z + 0.5) * 1080], k: z * 1920 };
}
// the reading (0..1) and the tremble (degrees) at shot time lt, song time t
export function gaugeReading(p, t, lt) {
  const p0 = p.p0 ?? 0.12, k = p.k ?? 0.2, tau = p.tau ?? 0.35, s = lt - (p.open ?? 0.25) - (p.lag ?? 0.3);
  const rise = s > 0 ? k * (s - tau * (1 - Math.exp(-s / tau))) : 0;
  // flutter: two bands of value noise in time (about 9 Hz and 3.5 Hz); a little livelier once gas is moving
  const n = (f, sd) => vnoise(t * f, sd * 7.3, 4100 + sd) * 2 - 1;
  const amp = (p.tremble ?? 4.0) * (1 + 0.35 * clamp(s / 0.6));
  const trem = amp * (0.62 * n(9.1, 1) + 0.38 * n(3.7, 2));
  return { p: clamp(p0 + rise, 0, 1), trem };
}

export const gauge = {
  draw(ctx, shot, t, lt) {
    const p = shot.params, dur = Math.max(1e-3, shot.t1 - shot.t0), M = gaugeView(p, lt, dur);
    const [hx, hy] = M.at(p.hub), R = p.r * M.k, { p: read, trem } = gaugeReading(p, t, lt);
    const ang = (225 + 270 * read + trem) * Math.PI / 180;          // clock angle: 0 = 12 o'clock, clockwise
    const dx = Math.sin(ang), dy = -Math.cos(ang), nx = -dy, ny = dx;
    const L = R * 0.70, tail = R * 0.20, w = R * 0.075;
    ctx.pipe.layer((g) => {
      // a soft cast shadow on the dial, a hair below and to the right
      g.fillStyle = 'rgba(40,34,26,0.22)'; g.beginPath();
      const sx = R * 0.03, sy = R * 0.045;
      g.moveTo(hx + sx + nx * w, hy + sy + ny * w); g.lineTo(hx + sx + dx * L, hy + sy + dy * L); g.lineTo(hx + sx - nx * w, hy + sy - ny * w); g.lineTo(hx + sx - dx * tail, hy + sy - dy * tail); g.closePath(); g.fill();
      // the pointer: a tapered blade with a short counterweight tail, in the painting's blue-black ink
      g.fillStyle = 'rgb(22,24,34)'; g.beginPath();
      g.moveTo(hx + nx * w, hy + ny * w); g.lineTo(hx + dx * L, hy + dy * L); g.lineTo(hx - nx * w, hy - ny * w);
      g.lineTo(hx - dx * tail - nx * w * 0.8, hy - dy * tail - ny * w * 0.8); g.lineTo(hx - dx * tail + nx * w * 0.8, hy - dy * tail + ny * w * 0.8); g.closePath(); g.fill();
      g.beginPath(); g.arc(hx, hy, w * 1.55, 0, Math.PI * 2); g.fill();
    }, { mode: 'ink', seed: 763 });
    // the brass pin over the pointer's boss
    ctx.pipe.layer((g) => { g.fillStyle = 'rgb(196,160,92)'; g.beginPath(); g.arc(hx, hy, w * 0.78, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,236,190,0.7)'; g.beginPath(); g.arc(hx - w * 0.2, hy - w * 0.22, w * 0.28, 0, Math.PI * 2); g.fill(); }, { mode: 'over', seed: 764 });
  },
};
