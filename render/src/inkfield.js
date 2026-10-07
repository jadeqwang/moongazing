// Ink-on-xuan diffusion as an ARRIVAL-TIME field.
// Ink wicking through paper is a first-passage process: the wet front reaches each point along the cheapest path
// through the fibre network. We solve that once (Dijkstra, 16-neighbour stencil, seeded paper cost field built from
// the SAME fibre tile the paper shader shows), so any frame t is just "which points has the front reached by t":
// fully deterministic, renderable out of order, and the edge feathers along real fibres.
import { fbm, mulberry32 } from './util.js';

class Heap { // min-heap of (key, id), typed arrays, lazy deletion
  constructor(cap = 1 << 20) { this.k = new Float64Array(cap); this.v = new Int32Array(cap); this.n = 0; }
  push(key, id) {
    if (this.n >= this.k.length) { const k = new Float64Array(this.k.length * 2); k.set(this.k); this.k = k; const v = new Int32Array(this.v.length * 2); v.set(this.v); this.v = v; }
    let i = this.n++; const K = this.k, V = this.v;
    while (i > 0) { const p = (i - 1) >> 1; if (K[p] <= key) break; K[i] = K[p]; V[i] = V[p]; i = p; }
    K[i] = key; V[i] = id;
  }
  pop() { // returns id; key in this.top
    const K = this.k, V = this.v; const id = V[0]; this.top = K[0];
    const key = K[--this.n], vid = V[this.n]; let i = 0; const n = this.n;
    while (true) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && K[c + 1] < K[c]) c++; if (K[c] >= key) break; K[i] = K[c]; V[i] = V[c]; i = c; }
    K[i] = key; V[i] = vid; return id;
  }
}

const NB = (() => {
  const o = [];
  for (const [a, b] of [[1, 0], [1, 1], [2, 1], [1, 2]]) {
    for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      for (const sw of [false, true]) {
        const dx = (sw ? b : a) * sx, dy = (sw ? a : b) * sy;
        if (!o.some(([x, y]) => x === dx && y === dy)) o.push([dx, dy, Math.hypot(dx, dy)]);
      }
    }
  }
  return o; // 16 unique
})();

// cost: Float32Array G*G (per cell). sources: [{i, j, t0}] in cell coords. returns Float32Array T (Infinity unreached)
export function dijkstra(G, cost, sources, maxT = Infinity) {
  const T = new Float32Array(G * G).fill(Infinity);
  const h = new Heap(1 << 20);
  for (const s of sources) { const id = s.j * G + s.i; if (s.t0 < T[id]) { T[id] = s.t0; h.push(s.t0, id); } }
  while (h.n) {
    const id = h.pop(); const tk = h.top;
    if (tk > T[id]) continue;
    if (tk > maxT) break;
    const x = id % G, y = (id - x) / G, c0 = cost[id];
    for (let k = 0; k < NB.length; k++) {
      const nx = x + NB[k][0], ny = y + NB[k][1];
      if (nx < 0 || ny < 0 || nx >= G || ny >= G) continue;
      const nid = ny * G + nx;
      const nt = tk + NB[k][2] * 0.5 * (c0 + cost[nid]);
      if (nt < T[nid]) { T[nid] = nt; h.push(nt, nid); }
    }
  }
  return T;
}

// Build the moon bloom fields.
//   R: moon radius (design px), HS: half-size of the field (design px), cell = 1 design px
//   fiber: fiberSampler, albedo(u,v) -> moon albedo on the disc (u,v in -1..1, y down) or null outside
export function buildMoonBloom({ cx, cy, R, HS, fiber, albedo, seed = 11 }) {
  const G = Math.round(HS * 2);
  const x0 = cx - HS, y0 = cy - HS;
  const cost = new Float32Array(G * G);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const X = x0 + i, Y = y0 + j;
    const f = fiber.at(X, Y);
    const n1 = fbm(X * 0.018, Y * 0.018, 4, seed) - 0.5;
    const n2 = fbm(X * 0.07, Y * 0.07, 3, seed + 5) - 0.5;
    const n3 = fbm(X * 0.3, Y * 0.3, 2, seed + 9) - 0.5;
    let c = Math.exp(1.3 * n1 + 0.5 * n2 + 0.6 * n3);
    c /= 1 + 16 * f[0] * f[0] + 4 * f[0];   // wicks fast along long fibres -> hair-like feathering
    c *= 1 + 2.2 * f[2];        // dense flocs slow it
    cost[j * G + i] = c;
  }
  // primary drop: a small disc of sources (impact splash radius ~14 px)
  const src = [];
  const ci = Math.round(cx - x0), cj = Math.round(cy - y0);
  for (let dj = -14; dj <= 14; dj++) for (let di = -14; di <= 14; di++) {
    const d = Math.hypot(di, dj); if (d <= 14) src.push({ i: ci + di, j: cj + dj, t0: d * 0.35 });
  }
  const T = dijkstra(G, cost, src);

  // normalise per direction so the final front is a round moon of radius R, keeping only small-scale raggedness
  const BINS = 720, Tth = new Float32Array(BINS);
  for (let b = 0; b < BINS; b++) {
    const a = (b + 0.5) / BINS * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    const vals = [];
    for (let r = R - 6; r <= R + 6; r += 1) {
      const i = Math.round(ci + ca * r), j = Math.round(cj + sa * r);
      const v = T[j * G + i]; if (isFinite(v)) vals.push(v);
    }
    vals.sort((p, q) => p - q); Tth[b] = vals[vals.length >> 1] || 1;
  }
  const Ts = new Float32Array(BINS), W = 7;
  for (let b = 0; b < BINS; b++) {
    let s = 0, w = 0;
    for (let k = -W * 2; k <= W * 2; k++) { const g = Math.exp(-(k * k) / (2 * W * W)); s += g * Tth[(b + k + BINS) % BINS]; w += g; }
    Ts[b] = s / w;
  }
  const N = new Float32Array(G * G);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const dx = i - ci, dy = j - cj;
    let a = Math.atan2(dy, dx); if (a < 0) a += Math.PI * 2;
    const fb = a / (Math.PI * 2) * BINS - 0.5; const b0 = Math.floor(fb), fr = fb - b0;
    const tn = Ts[(b0 + BINS) % BINS] * (1 - fr) + Ts[(b0 + 1) % BINS] * fr;
    const v = T[j * G + i];
    const rn = Math.hypot(dx, dy) / R;
    N[j * G + i] = isFinite(v) ? Math.min(0.62 * (v / tn) + 0.38 * rn, 4) : 4;
  }

  // ---- maria: a second, darker ink dropped wet-in-wet, spreading only where the real Moon is dark
  const A = new Float32Array(G * G).fill(-1);
  const vals = [];
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const u = (i - ci) / R, v = (j - cj) / R;
    if (u * u + v * v >= 1) continue;
    const a = albedo(u, v); A[j * G + i] = a; vals.push(a);
  }
  vals.sort((p, q) => p - q);
  const q = (p) => vals[Math.floor(p * (vals.length - 1))];
  const lo = q(0.06), hi = q(0.40);  // maria ≈ the darkest ~third of the near side
  const mare = new Float32Array(G * G);
  for (let k = 0; k < G * G; k++) {
    const a = A[k]; if (a < 0) { mare[k] = 0; continue; }
    const m = Math.min(1, Math.max(0, (hi - a) / (hi - lo))); mare[k] = m * m * (3 - 2 * m);
  }
  boxBlur(mare, G, 5); boxBlur(mare, G, 5); boxBlur(mare, G, 3);
  const cost2 = new Float32Array(G * G);
  for (let k = 0; k < G * G; k++) cost2[k] = cost[k] * (0.55 + 40 * Math.pow(1 - mare[k], 2));
  // seeds: darkest points, spread out
  const rnd = mulberry32(seed + 99);
  const cand = [];
  for (let j = 4; j < G - 4; j += 3) for (let i = 4; i < G - 4; i += 3) { const a = A[j * G + i]; if (a >= 0 && a < q(0.025)) cand.push([a + rnd() * 1e-4, i, j]); }
  cand.sort((p, r) => p[0] - r[0]);
  const seeds = [];
  for (const [, i, j] of cand) { if (seeds.every((s) => Math.hypot(s.i - i, s.j - j) > R * 0.28)) seeds.push({ i, j, t0: seeds.length * 6 }); if (seeds.length >= 9) break; }
  const T2 = dijkstra(G, cost2, seeds);
  const mv = [];
  for (let k = 0; k < G * G; k++) if (mare[k] > 0.5 && isFinite(T2[k])) mv.push(T2[k]);
  mv.sort((p, r) => p - r);
  const t2max = mv[Math.floor(mv.length * 0.92)] || 1;
  const M = new Float32Array(G * G);
  for (let k = 0; k < G * G; k++) M[k] = isFinite(T2[k]) ? Math.min(T2[k] / t2max, 4) : 4;
  const Af = new Float32Array(G * G);
  const amid = q(0.5);
  for (let k = 0; k < G * G; k++) Af[k] = A[k] < 0 ? amid : A[k];
  return { G, x0, y0, N, M, mare, A: Af, albedoRange: [lo, hi, q(0.02), q(0.98)], seeds };
}

function boxBlur(a, G, r) { // separable box blur in place
  const tmp = new Float32Array(G * G);
  for (let j = 0; j < G; j++) {
    let acc = 0; const row = j * G;
    for (let i = -r; i <= r; i++) acc += a[row + Math.min(G - 1, Math.max(0, i))];
    for (let i = 0; i < G; i++) {
      tmp[row + i] = acc / (2 * r + 1);
      acc += a[row + Math.min(G - 1, i + r + 1)] - a[row + Math.max(0, i - r)];
    }
  }
  for (let i = 0; i < G; i++) {
    let acc = 0;
    for (let j = -r; j <= r; j++) acc += tmp[Math.min(G - 1, Math.max(0, j)) * G + i];
    for (let j = 0; j < G; j++) {
      a[j * G + i] = acc / (2 * r + 1);
      acc += tmp[Math.min(G - 1, j + r + 1) * G + i] - tmp[Math.max(0, j - r) * G + i];
    }
  }
}
