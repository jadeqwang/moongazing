// Camera search for a blockout: node scenes/blockouts/search_cam.mjs '<scene>' '<json options>'  (see main.js searchCam)
import { chromium } from 'playwright-core';
import { serve } from '../../tools/serve.mjs';
const port = 9040 + (process.pid % 40); const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/blockouts/index.html?w=1920&h=1080`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const res = await page.evaluate(([id, o]) => window.searchCam(id, o), [process.argv[2], JSON.parse(process.argv[3])]);
  for (const r of res) console.log(JSON.stringify(r));
} finally { await browser.close(); server.close(); }
