// Render the 7.B1 / 7.B2 / 7.B3 blockout views headless.
//   cd render && node scenes/blockouts/7.B1_B3/render.mjs [--scenes b1,b2,b3]
// Output: render/scenes/blockouts/7.B1_B3/out/<scene>_<view>.png (clean, for the image model) and _labeled.png
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../../../tools/serve.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const W = Number(args.w || 1920), H = Number(args.h || 1080);
fs.mkdirSync(OUT, { recursive: true });
const port = 9060 + (process.pid % 40);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/blockouts/7.B1_B3/index.html?w=${W}&h=${H}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  const all = await page.evaluate(() => window.views());
  const want = args.scenes ? String(args.scenes).split(',') : Object.keys(all);
  for (const s of want) for (const v of all[s]) for (const lab of [false, true]) {
    const url = await page.evaluate(([ss, vv, l]) => window.renderView(ss, vv, { labels: l }), [s, v, lab]);
    const f = path.join(OUT, `${s}_${v}${lab ? '_labeled' : ''}.png`);
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(path.relative(process.cwd(), f));
  }
} finally { await browser.close(); server.close(); }
