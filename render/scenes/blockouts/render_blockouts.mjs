// Render the staging blockouts (mannequins at true heights) and the who-sees-what report.
//   cd render && node scenes/blockouts/render_blockouts.mjs [--scenes K_7.C5a,K_7.C5b] [--w 1920 --h 1080]
// Output: render/scenes/blockouts/<scene>/<cam>.png (clean, for the image model), <cam>_labeled.png (names + sight
// lines, for people), report.json (analysis) — see main.js.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../../tools/serve.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const W = Number(args.w || 1920), H = Number(args.h || 1080);
const port = 8990 + (process.pid % 40);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
let bad = 0;
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/scenes/blockouts/index.html?w=${W}&h=${H}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  const list = await page.evaluate(() => window.sceneList());
  const want = args.scenes ? String(args.scenes).split(',') : list.map((s) => s.id);
  for (const s of list.filter((x) => want.includes(x.id))) {
    const dir = path.join(HERE, s.id); fs.mkdirSync(dir, { recursive: true });
    const rep = await page.evaluate((id) => window.analyse(id), s.id);
    fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(rep, null, 1));
    for (const c of s.cams) for (const lab of [false, true]) {
      const url = await page.evaluate(([id, cam, l]) => window.renderScene(id, cam, { labels: l, lines: l }), [s.id, c, lab]);
      fs.writeFileSync(path.join(dir, `${c}${lab ? '_labeled' : ''}.png`), Buffer.from(url.split(',')[1], 'base64'));
    }
    // the summary a director would ask for
    console.log(`\n== ${s.id} — ${rep.title || ''}`);
    for (const [who, p] of Object.entries(rep.people)) {
      const a = Object.entries(p.arms).map(([n, v]) => `${n}→${v.target}${v.reach > 1 ? ' OVER-REACH ' + v.reach : ''}${v.handBehind > 0.05 ? ' HAND BEHIND BODY ' + v.handBehind + ' m' : ''}`).join(', ');
      const flag = p.headTurnDeg > 75 ? '  HEAD TURN STRAIN' : '';
      if (flag || /OVER|BEHIND/.test(a)) bad++;
      console.log(`  ${who.padEnd(10)} head turn ${String(p.headTurnDeg).padStart(3)}° pitch ${String(p.headPitchDeg).padStart(4)}°${flag}   arms: ${a}`);
    }
    for (const [tid, r] of Object.entries(rep.screens)) for (const [who, v] of Object.entries(r)) {
      if (v.verdict !== 'sees it') bad++;
      console.log(`  ${tid} ← ${who.padEnd(10)} ${v.verdict.padEnd(14)} ${v.distM} m, ${v.obliquityDeg}° off the screen normal, ${Math.round(v.visibleFrac * 100)}% unblocked${v.blockedBy.length ? ' (by ' + v.blockedBy.join(', ') + ')' : ''}, gaze off by ${v.gazeOffDeg}°`);
    }
    for (const [cn, c] of Object.entries(rep.cameras)) {
      console.log(`  cam ${cn}:`);
      for (const [who, v] of Object.entries(c.people)) console.log(`     ${who.padEnd(10)} ${v.inFrame ? v.view.padEnd(18) : 'out of frame'.padEnd(18)} (${v.faceAngleDeg}°)  head ${Math.round(v.headVisibleFrac * 100)}% visible${v.blockedBy.length ? ' (behind ' + v.blockedBy.join(', ') + ')' : ''}`);
      for (const [tid, v] of Object.entries(c.screens)) console.log(`     ${tid.padEnd(10)} ${v.shows} at ${v.angleDeg}°, ${Math.round(v.visibleFrac * 100)}% visible, corners ${JSON.stringify(v.cornersPx)}`);
    }
  }
} finally { await browser.close(); server.close(); }
console.log(`\n${bad ? bad + ' staging flag(s)' : 'no staging flags'}`);
