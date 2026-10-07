// SECTION 9 · CREDITS — after the last pluck, while the master fades: a dedication, a vermilion hairline, and the
// colophon (scenes/colophon.js). Starts where section 08 ends and lasts to the end of the audio, holding the
// colophon at least 5 s. Owner: engine owner.
import { range as r08 } from './08_outro.js';

const MIN_LEN = 11.0; // dedication ~3 s, then the colophon held ≥ 5 s, then 1 s to black
export const range = (X) => [r08[1], Math.max((X && X.audio && X.audio.duration) || 212.0, r08[1] + MIN_LEN)];

export default function shots(B, X, L) {
  const [S, E] = range(X);
  return [
    { id: '9.1', t0: S, t1: E, paper: 'silk', grain: 91, needs: ['seal_wangyue'], scene: [{ name: 'colophon', params: { start: S } }],
      post: (t, lt) => ({ fade: Math.max(1 - Math.min(1, lt / 0.9), Math.min(1, Math.max(0, (t - (E - 1.0)) / 1.0))), fadeColor: [0.02, 0.02, 0.03], vignette: 0.18 }) },
  ];
}
