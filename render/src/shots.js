// SHOT TABLE — assembled from per-section files (src/sections/NN_*.js). Each section owns a time range and returns
// its shots; sections never overlap, so different animation agents can own different sections in parallel.
// Run `node tools/lint_shots.mjs` after any edit: full 0–212 coverage, no gaps/overlaps, cuts on musical events.
import { inkmoon } from './scenes/inkmoon.js';
import { plate } from './scenes/plate.js';
import { ribbons } from './scenes/ribbons.js';
import { rocketPad, trajectory } from './scenes/jiehua.js';
import { earthview } from './scenes/earthview.js';
import { title } from './scenes/title.js';
import { tag, washes, beach, wires, earth, streak } from './scenes/misc.js';
import { placeholder, paperfade, stamp, emblem, letter, dust, seam, earthfar, bluedot } from './scenes/extra.js';
import { SECTIONS, assemble } from './sections/index.js';
import { cosmos } from './scenes/cosmos.js';
import { nightlights } from './scenes/nightlights.js';
import { wallcalli, assignment } from './scenes/moments.js';
import { colophon } from './scenes/colophon.js';
import { singer } from './scenes/singer.js';
import { roto } from './roto/index.js';
import { papertype } from './scenes/papertype.js';
import { buildsite } from './scenes/buildsite.js';

export const SCENES = { inkmoon, plate, ribbons, rocketPad, trajectory, title, tag, washes, beach, wires, earth, streak,
  placeholder, paperfade, stamp, emblem, letter, dust, seam, earthfar, bluedot, roto, cosmos, nightlights, wallcalli, assignment, colophon, singer, papertype, earthview, buildsite };

// B: Beats, X: { has(key), text(key) } (asset registry), L: lyric lines by id
export function buildShots(B, store, L, audio = { duration: 212.0 }) {
  const X = { has: (k) => store.has(k), text: (k) => (store.texts && store.texts[k]) || '', audio, pick: (k) => (store.picks && store.picks[k]) || null };
  return assemble(B, X, L);
}
