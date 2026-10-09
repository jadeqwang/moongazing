// Render the 7.D2 fingertip blockout (headless Chrome + SwiftShader, as in ../7.E1/render_views.mjs).
//   cd render && node scenes/blockouts/7.D2/render.mjs --out <dir> [--bg /media/keyframes/jade/_J7D2_work/L0.png] [--p '{"elbowOut":0.3}'] [--u 1,0]
// The outputs that show the painting (film overlay / guide) carry Jade's likeness: write them under media/, not here.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { serve } from '../../../tools/serve.mjs';

const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const W = 1920, H = 1080, OUT = path.resolve(args.out || 'out/rev3_hands/blockout_7D2');
fs.mkdirSync(OUT, { recursive: true });
const port = 8990 + (process.pid % 40);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  const qs = new URLSearchParams({ w: W, h: H, ...(args.bg ? { bg: args.bg } : {}), ...(args.p ? { p: args.p } : {}) });
  await page.goto(`http://127.0.0.1:${port}/scenes/blockouts/7.D2/index.html?${qs}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  for (const u of String(args.u || '1').split(',').map(Number)) {
    console.log('u', u, JSON.stringify(await page.evaluate((x) => window.info(x), u)));
    for (const [view, mode] of [['film', 'overlay'], ['film', 'guide'], ['top', 'plain'], ['front', 'plain'], ['side', 'plain']]) {
      const url = await page.evaluate(([v, m, x]) => window.renderView(v, m, x), [view, mode, u]);
      const f = path.join(OUT, `${view}_${mode}_u${u}.png`); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); console.log(' ->', f);
    }
  }
} finally { await browser.close(); server.close(); }
