// Section registry. Order = film order. Each module exports `range` [t0, t1] and a default shots(B, X, L) builder.
import * as s00 from './00_intro.js';
import * as s01 from './01_intro_b.js';
import * as s02 from './02_verse1.js';
import * as s03 from './03_verse2.js';
import * as s04 from './04_hook.js';
import * as s05 from './05_interlude.js';
import * as s06 from './06_breakdown.js';
import * as s07 from './07_drop.js';
import * as s08 from './08_outro.js';
import * as s09 from './09_credits.js';

export const SECTIONS = [
  ['00_intro', s00], ['01_intro_b', s01], ['02_verse1', s02], ['03_verse2', s03], ['04_hook', s04],
  ['05_interlude', s05], ['06_breakdown', s06], ['07_drop', s07], ['08_outro', s08], ['09_credits', s09],
];

export function assemble(B, X, L) {
  const all = [];
  for (const [name, mod] of SECTIONS) for (const s of mod.default(B, X, L)) all.push({ ...s, section: name });
  all.sort((a, b) => a.t0 - b.t0);
  return all;
}
