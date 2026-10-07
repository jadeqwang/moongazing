// SHOT TABLE — assembled from per-section files (src/sections/NN_*.js). Each section owns a time range and returns
// its shots; sections never overlap, so different animation agents can own different sections in parallel.
// Run `node tools/lint_shots.mjs` after any edit: full 0–212 coverage, no gaps/overlaps, cuts on musical events.
import { inkmoon } from './scenes/inkmoon.js';
import { plate } from './scenes/plate.js';
import { ribbons } from './scenes/ribbons.js';
import { rocketPad, trajectory } from './scenes/jiehua.js';
import { title } from './scenes/title.js';
import { tag, washes, beach, wires, earth, streak } from './scenes/misc.js';
import { placeholder, paperfade, stamp, emblem, letter, dust, seam, earthfar, bluedot } from './scenes/extra.js';
import { SECTIONS, assemble } from './sections/index.js';
import { roto } from './roto/index.js';

export const SCENES = { inkmoon, plate, ribbons, rocketPad, trajectory, title, tag, washes, beach, wires, earth, streak,
  placeholder, paperfade, stamp, emblem, letter, dust, seam, earthfar, bluedot, roto };

// B: Beats, X: { has(key), text(key) } (asset registry), L: lyric lines by id
export function buildShots(B, store, L) {
  const X = { has: (k) => store.has(k), text: (k) => (store.texts && store.texts[k]) || '' };
  return assemble(B, X, L);
}
