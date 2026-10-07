// Render the Guanghan Station guide images (line / depth / flat) for every moonbase shot.
//   node scenes/guanghan3d/render_guides.mjs [--shots 1.5,7.E1] [--modes line,depth,flat] [--w 1920 --h 1080]
// Output: media/guanghan/guides/<shotID>_{line,depth,flat}.png and media/guanghan/guides/cameras.json
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../../tools/serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REPO = path.resolve(ROOT, '..');
const OUT = path.join(REPO, 'media/guanghan/guides');
const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const W = Number(args.w || 1920), H = Number(args.h || 1080);
const modes = String(args.modes || 'line,depth,flat').split(',');
fs.mkdirSync(OUT, { recursive: true });

const port = 8950 + (process.pid % 40);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/guanghan3d/index.html?w=${W}&h=${H}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  const info = await page.evaluate(() => window.shotInfo());
  fs.writeFileSync(path.join(OUT, 'cameras.json'), JSON.stringify(info, null, 1));
  const ids = args.shots ? String(args.shots).split(',') : info.map((s) => s.id);
  for (const id of ids) for (const m of modes) {
    const t = Date.now();
    const url = await page.evaluate(([i, mm]) => window.renderShot(i, mm), [id, m]);
    const f = path.join(OUT, `${id}_${m}.png`);
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(`${id} ${m} -> ${path.relative(REPO, f)} (${Date.now() - t} ms)`);
  }
} finally { await browser.close(); server.close(); }
