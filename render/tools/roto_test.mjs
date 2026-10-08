// Render one roto shot in isolation (the ?roto= test shot in main.js), for before/after checks.
//   node tools/roto_test.mjs --spec '{"clip":"K_5.1/take_1","paper":"ink","shotPaper":"xuan","t0":0,"t1":4.4}' \
//        --out out/roto_tests/K_5.1/frames [--scale 0.5] [--workers 6] [--times 0.5,1.2]
// Frames are named by global frame index round(t*24) like tools/render.mjs, so --encode-style muxing works.
import { chromium } from 'playwright-core';
import { CHROME_ARGS } from './chrome_args.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { const k = argv[i].slice(2); args[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; }
const spec = JSON.parse(args.spec);
const scale = Number(args.scale || 0.5), FPS = 24;
const out = path.resolve(ROOT, args.out); fs.mkdirSync(out, { recursive: true });
const CHROME = process.env.CHROME || '/opt/google/chrome/chrome';
let times;
if (args.times) times = String(args.times).split(',').map(Number);
else { times = []; for (let i = Math.ceil(spec.t0 * FPS - 1e-6); i < Math.ceil(spec.t1 * FPS - 1e-6); i++) times.push(i / FPS); }
const todo = times.map((t) => [t, path.join(out, args.times ? `t_${t.toFixed(3)}.png` : `f_${String(Math.round(t * FPS)).padStart(6, '0')}.jpg`)])
  .filter(([, f]) => !(args.resume && fs.existsSync(f)));
const port = 9000 + (process.pid % 400);
const server = await serve(port);
const nW = Math.max(1, Math.min(Number(args.workers || 6), todo.length));
const browsers = [];
const T0 = Date.now();
try {
  for (let j = 0; j < nW; j++) browsers.push(await chromium.launch({ executablePath: CHROME,
    args: CHROME_ARGS }));
  const W = Math.round(1920 * scale), H = Math.round(1080 * scale);
  let next = 0;
  await Promise.all(browsers.map(async (b) => {
    const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
    await page.goto(`http://127.0.0.1:${port}/index.html?scale=${scale}&roto=${encodeURIComponent(JSON.stringify(spec))}`);
    await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
    const err = await page.evaluate(async () => { try { await window.__ready; return null; } catch (e) { return window.__error || String(e); } });
    if (err) throw new Error(err);
    while (next < todo.length) {
      const [t, f] = todo[next++];
      await page.evaluate((tt) => window.renderAt(tt), t);
      const png = f.endsWith('.png');
      const url = await page.evaluate((fmt) => window.__frame(fmt, 0.94), png ? 'png' : 'jpg');
      fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    }
  }));
} finally {
  for (const b of browsers) await b.close().catch(() => {});
  server.close();
}
console.log(`${todo.length} frames -> ${path.relative(ROOT, out)} in ${((Date.now() - T0) / 1000).toFixed(1)} s`);
