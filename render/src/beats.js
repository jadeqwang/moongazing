// Beat/bar helpers over analysis/beatgrid.json (the song's real, accelerating tempo — never a fixed BPM).
//   B.bar(9)            -> time of bar 9 downbeat (17.539)
//   B.bar(11, 3)        -> bar 11, beat 3
//   B.at(t)             -> { bar, beat, i, phase (0..1 within beat), barPhase (0..1 within bar) }
//   B.sinceBar(t, 9)    -> seconds since bar 9 (negative before)
//   B.beatPulse(t, k)   -> 1 at each beat decaying with time constant k (s)
export class Beats {
  constructor(grid) {
    this.beats = grid.beats.map((b) => ({ t: b.t, bar: b.bar, beat: b.beat, i: b.i }));
    this.down = grid.downbeats.map((d) => ({ bar: d.bar, t: d.t }));
    this.byBar = new Map();
    for (const b of this.beats) this.byBar.set(b.bar * 8 + b.beat, b.t);
  }
  bar(n, beat = 1) {
    const t = this.byBar.get(n * 8 + beat);
    if (t !== undefined) return t;
    throw new Error(`no bar ${n} beat ${beat}`);
  }
  index(t) { // last beat index with beat.t <= t
    const bs = this.beats;
    let lo = 0, hi = bs.length - 1;
    if (t < bs[0].t) return -1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (bs[m].t <= t) lo = m; else hi = m - 1; }
    return lo;
  }
  at(t) {
    const i = this.index(t);
    if (i < 0) { const b0 = this.beats[0], b1 = this.beats[1]; const p = (t - b0.t) / (b1.t - b0.t); return { i: -1, bar: 0, beat: 4 + Math.floor(p), phase: p - Math.floor(p), barPhase: 0 }; }
    const b = this.beats[i], n = this.beats[Math.min(i + 1, this.beats.length - 1)];
    const phase = n.t > b.t ? (t - b.t) / (n.t - b.t) : 0;
    return { i, bar: b.bar, beat: b.beat, phase, barPhase: (b.beat - 1 + phase) / 4 };
  }
  sinceBar(t, n, beat = 1) { return t - this.bar(n, beat); }
  beatPulse(t, k = 0.25) { const i = this.index(t); if (i < 0) return 0; return Math.exp(-(t - this.beats[i].t) / k); }
  beatLen(t) { const i = Math.max(0, this.index(t)); const n = this.beats[Math.min(i + 1, this.beats.length - 1)]; return n.t - this.beats[i].t || 0.46; }
}
