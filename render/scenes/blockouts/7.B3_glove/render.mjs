// Render the 7.B3 glove-scale blockout headless and print the measurements.
//   cd render && node scenes/blockouts/7.B3_glove/render.mjs [--p '{"hfov":50}'] [--views hero,top,side,her] [--u 0,1]
// Output: render/scenes/blockouts/7.B3_glove/out/<view>_u<u>[_labeled].png and out/measure.json
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
const port = 9110 + (process.pid % 40);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/blockouts/7.B3_glove/index.html?w=${W}&h=${H}&p=${encodeURIComponent(args.p || '{}')}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  const views = String(args.views || 'hero,top,side,her').split(','), us = String(args.u || '0,1').split(',').map(Number);
  const meas = {};
  for (const u of us) {
    meas['u' + u] = await page.evaluate((uu) => window.measure(uu), u);
    for (const v of views) for (const lab of [false, true]) {
      const url = await page.evaluate(([vv, uu, l]) => window.renderView(vv, uu, { labels: l }), [v, u, lab]);
      fs.writeFileSync(path.join(OUT, `${v}_u${u}${lab ? '_labeled' : ''}.png`), Buffer.from(url.split(',')[1], 'base64'));
    }
  }
  fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify(meas, null, 1));
  console.log(JSON.stringify(meas, null, 1));
} finally { await browser.close(); server.close(); }
