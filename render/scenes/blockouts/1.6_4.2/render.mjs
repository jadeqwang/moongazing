// Render the 1.6 / 4.2 family blockout views headless.
//   cd render && node scenes/blockouts/1.6_4.2/render.mjs [--views A,behind,left,front,top] [--shots 1.6,4.2] [--code 1]
// Output: render/scenes/blockouts/1.6_4.2/out/<view>_<shot>.png
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../../../tools/serve.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const views = String(args.views || 'A,behind,left,front,top').split(',');
const shots = String(args.shots || '1.6,4.2').split(',');
const W = Number(args.w || 1920), H = Number(args.h || 1080);
fs.mkdirSync(OUT, { recursive: true });

const port = 9010 + (process.pid % 40);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/blockouts/1.6_4.2/index.html?w=${W}&h=${H}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  for (const s of shots) for (const v of views) {
    const url = await page.evaluate(([vv, ss, code]) => window.renderView(vv, ss, { codeArms: code }), [v, s, !!args.code]);
    const f = path.join(OUT, `${v}_${s}${args.code ? '_code' : ''}.png`);
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(path.relative(process.cwd(), f));
  }
} finally { await browser.close(); server.close(); }
