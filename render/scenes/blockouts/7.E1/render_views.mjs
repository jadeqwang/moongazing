// Render the 7.E1 toast blockout views (headless Chrome + SwiftShader, same pattern as guanghan3d/render_guides.mjs).
//   cd render && node scenes/blockouts/7.E1/render_views.mjs [--views E1_wide,E1b_faces] [--modes line,flat,label] [--w 1920 --h 1080]
// Output: scenes/blockouts/7.E1/views/<view>_<mode>.png and views/views.json (cameras, Earth uv, toast-height checks)
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../../../tools/serve.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'views');
const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const W = Number(args.w || 1920), H = Number(args.h || 1080);
const modes = String(args.modes || 'line,flat,label').split(',');
fs.mkdirSync(OUT, { recursive: true });

const port = 8990 + (process.pid % 40);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/blockouts/7.E1/index.html?w=${W}&h=${H}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 180000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  const all = await page.evaluate(() => window.viewIds());
  const ids = args.views ? String(args.views).split(',') : all;
  const info = [];
  for (const id of ids) {
    for (const m of modes) {
      const url = await page.evaluate(([i, mm]) => window.renderView(i, mm), [id, m]);
      const f = path.join(OUT, `${id}_${m}.png`);
      fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
      console.log(`${id} ${m} -> ${path.relative(process.cwd(), f)}`);
    }
    info.push(await page.evaluate((i) => window.viewInfo(i), id));
  }
  if (!args.views) fs.writeFileSync(path.join(OUT, 'views.json'), JSON.stringify(info, null, 1));
  for (const v of info) { if (v.grips) console.log(v.id, "grips", JSON.stringify(Object.fromEntries(Object.entries(v.grips).filter(([k]) => (args.who || "jade,lucia,adaeze,layla").split(",").includes(k))))); } for (const v of info) console.log(v.id, 'earth', JSON.stringify(v.earth), 'bearing', v.bearing, 'pitch', v.pitch,
    '\n  ', v.people.map((p) => `${p.id}: eye ${p.eyeY} cup ${p.cupY} (${p.cupAboveEye >= 0 ? '+' : ''}${p.cupAboveEye}) elbow ${p.elbowDeg}°`).join(' | '));
} finally { await browser.close(); server.close(); }
