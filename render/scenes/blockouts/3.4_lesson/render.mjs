// Render the 3.4 lesson blockout views headless.
//   node scenes/blockouts/3.4_lesson/render.mjs [--views wide,side,beam,top] [--u 0,0.5,1] [--modes guide,lit]
// Output: scenes/blockouts/3.4_lesson/out/<view>_<mode>_u<u>.png and out/facts.json
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
const views = String(args.views || 'wide,side,beam,top').split(',');
const us = String(args.u || '0,0.5,1').split(',').map(Number);
const modes = String(args.modes || 'guide,lit').split(',');
fs.mkdirSync(OUT, { recursive: true });
const port = 8990 + (process.pid % 40);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/blockouts/3.4_lesson/index.html?w=${W}&h=${H}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(await page.evaluate(() => window.facts()), null, 1));
  for (const v of views) for (const m of modes) for (const u of us) {
    const url = await page.evaluate(([a, b, c]) => window.renderView(a, b, c), [v, u, m]);
    const f = path.join(OUT, `${v}_${m}_u${u}.png`);
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(path.relative(process.cwd(), f));
  }
} finally { await browser.close(); server.close(); }
