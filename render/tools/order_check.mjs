// Is a frame the same picture whatever the page drew before it? It has to be: workers render frames in any order, and
// the two-pass verification (render_verified.sh) relies on it.
//   node tools/order_check.mjs 46-49 395-398 3384-3386 …        (windows of global frame indices, at 0.5 scale)
//   PREROLL=2000,100 node tools/order_check.mjs 46-49 …          (draw these frames first on the "alone" page)
// Each window is rendered once in sequence on one page, then every frame of it again on a fresh page (after the
// PREROLL frames, if given); the two PNGs must be identical. History of this check (Oct 8 2026): frames used to depend
// on render order because (1) Chrome moved 2D canvases between GPU and CPU rasterising mid-run, which redraws thin
// lines and type edges differently (fixed by --disable-accelerated-2d-canvas in render.mjs), (2) 2D state leaked from
// one layer into the next, and (3) Chrome could drop a full-canvas clear (both fixed in core.js Pipeline.layer).
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';
import { CHROME_ARGS } from './chrome_args.mjs';
import crypto from 'node:crypto';
const port = 8990 + (process.pid % 9); const server = await serve(port);
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome', args: CHROME_ARGS });
async function mk() {
  const page = await b.newPage({ viewport: { width: 960, height: 540 } });
  await page.goto(`http://127.0.0.1:${port}/index.html?scale=0.5`);
  await page.waitForFunction(() => window.__ready !== undefined);
  await page.evaluate(() => window.__ready);
  return page;
}
const grab = async (page, f) => { await page.evaluate((t) => window.renderAt(t), f / 24); return crypto.createHash('md5').update(await page.evaluate(() => window.__frame('png'))).digest('hex'); };
const pre = (process.env.PREROLL || '').split(',').filter(Boolean).map(Number);
let total = 0; const bad = [];
for (const w of process.argv.slice(2)) {
  const [F0, F1] = w.split('-').map(Number);
  const seq = {}; let page = await mk();
  for (let f = F0; f <= F1; f++) seq[f] = await grab(page, f);
  await page.close();
  for (let f = F0; f <= F1; f++) { page = await mk(); for (const p of pre) await grab(page, p); const h = await grab(page, f); await page.close(); total++; if (h !== seq[f]) bad.push(f); }
}
console.log(`${bad.length} of ${total} frames depend on what was rendered before them${bad.length ? ': ' + bad.join(' ') : ''}`);
await b.close(); server.close();
process.exit(bad.length ? 1 : 0);
