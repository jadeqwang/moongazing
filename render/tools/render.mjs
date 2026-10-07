// Frame-accurate capture of the Moongazing renderer in headless Chrome (SwiftShader WebGL2).
//   node tools/render.mjs --stills 0.3,1.2,2.5 [--scale 1] [--outdir out/stills] [--prefix s]
//   node tools/render.mjs --sheet [--from 0 --to 32.42 --step 1 | --times a,b,c] [--cols 6] [--thumb 480] [--out out/sheet.jpg]
//   node tools/render.mjs --frames 0-32.42 [--fps 24] [--workers 6] [--resume] [--scale 0.5] [--framedir out/frames_540] [--format jpg|png]
//   node tools/render.mjs --encode 0-32.42 [--framedir out/frames_540] [--out out/x.mp4] [--crf 18]
// --frames and --encode can be combined. Frame files are named by GLOBAL frame index (round(t*fps)), so ranges
// can be rendered in any order / resumed, and --encode muxes the ORIGINAL song audio from exactly the first
// frame's time (atrim on the decoded mp3, AAC 320k). The audio is never altered otherwise.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(ROOT, '..');
const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const k = argv[i].slice(2);
  const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  args[k] = v;
}
const FPS = Number(args.fps || 24);
const CHROME = process.env.CHROME || args.chrome || '/opt/google/chrome/chrome';
const FFMPEG = process.env.FFMPEG || path.join(REPO, '.venv/bin/ffmpeg');
// the film's audio: data/audio.json (tools/audio_info.mjs) names the master if it exists, else the original mp3
const AUDIO_INFO = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data/audio.json'))); } catch (e) { return { file: 'inputs/moongazing.mp3', duration: 212.0 }; } })();
const AUDIO = path.join(REPO, AUDIO_INFO.file);
const rel = (p) => path.resolve(ROOT, p);
const range = (s) => { const [a, b] = String(s).split('-').map(Number); return [a, b]; };
const frameRange = (a, b) => [Math.ceil(a * FPS - 1e-6), Math.ceil(b * FPS - 1e-6)]; // [i0, i1)

async function withBrowsers(n, scale, fn) {
  const port = 8800 + (process.pid % 150);
  const server = await serve(port);
  const browsers = [];
  try {
    for (let j = 0; j < n; j++) browsers.push(await chromium.launch({
      executablePath: CHROME,
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
        '--disable-gpu-sandbox', '--force-color-profile=srgb', '--disable-background-timer-throttling'],
    }));
    const W = Math.round(1920 * scale), H = Math.round(1080 * scale);
    const pages = await Promise.all(browsers.map(async (b) => {
      const page = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      page.on('console', (m) => { if (['error', 'warning'].includes(m.type()) || args.verbose) console.error('[page]', m.text()); });
      page.on('pageerror', (e) => console.error('[pageerror]', e.message));
      await page.goto(`http://127.0.0.1:${port}/index.html?scale=${scale}${args.notype ? '&notype=1' : ''}`);
      await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
      const err = await page.evaluate(async () => { try { await window.__ready; return null; } catch (e) { return window.__error || String(e); } });
      if (err) throw new Error(err);
      return page;
    }));
    return await fn(pages);
  } finally {
    for (const b of browsers) await b.close().catch(() => {});
    server.close();
  }
}

async function grab(page, t, file, fmt) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  const url = await page.evaluate((f) => window.__frame(f, 0.95), fmt);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
}

const T0 = Date.now();
if (args.stills) {
  const scale = Number(args.scale || 1);
  const outdir = rel(args.outdir || 'out/stills');
  fs.mkdirSync(outdir, { recursive: true });
  const times = String(args.stills).split(',').map(Number);
  await withBrowsers(1, scale, async ([page]) => {
    for (const t of times) {
      const f = path.join(outdir, `${args.prefix || 's'}_${t.toFixed(3).padStart(7, '0')}.png`);
      const t1 = Date.now();
      await grab(page, t, f, 'png');
      console.log(`still ${t.toFixed(3)} -> ${path.relative(ROOT, f)} (${Date.now() - t1} ms)`);
    }
  });
}

if (args.sheet) {
  const scale = Number(args.scale || 0.5);
  let times;
  if (args.times) times = String(args.times).split(',').map(Number);
  else { const a = Number(args.from || 0), b = Number(args.to || 32.42), st = Number(args.step || 1); times = []; for (let t = a; t < b - 1e-9; t += st) times.push(+t.toFixed(4)); }
  const cols = Number(args.cols || 6), tw = Number(args.thumb || 480);
  const out = rel(args.out || 'out/sheet.jpg');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await withBrowsers(1, scale, async ([page]) => {
    await page.evaluate(([n, c, w]) => window.__sheetInit(n, c, w), [times.length, cols, tw]);
    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      await page.evaluate((tt) => window.renderAt(tt), t);
      const id = await page.evaluate((tt) => { const s = window.__shots.filter((x) => x.t0 <= tt).pop(); return s ? s.id : ''; }, t);
      await page.evaluate(([k, l]) => window.__sheetAdd(k, l), [i, `${t.toFixed(2)}s  ${id}`]);
    }
    const url = await page.evaluate(() => window.__sheetOut(0.9));
    fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
    console.log(`sheet (${times.length} frames) -> ${path.relative(ROOT, out)}`);
  });
}

if (args.frames) {
  const scale = Number(args.scale || 0.5);
  const [a, b] = range(args.frames);
  const [i0, i1] = frameRange(a, b);
  const fmt = args.format || 'jpg';
  const dir = rel(args.framedir || `out/frames_${Math.round(1080 * scale)}`);
  fs.mkdirSync(dir, { recursive: true });
  const todo = [];
  for (let i = i0; i < i1; i++) {
    const f = path.join(dir, `f_${String(i).padStart(6, '0')}.${fmt}`);
    if (args.resume && fs.existsSync(f) && fs.statSync(f).size > 0) continue;
    todo.push([i, f]);
  }
  // ≥10 SwiftShader pages on this 24-core/30 GB box run out of headroom: image decodes fail and 2D layers can silently
  // drop out of a frame (seen in fullcut v1). 5–6 is stable; pass --force-workers to go higher anyway.
  const asked = Number(args.workers || 4);
  if (asked > 6 && !args['force-workers']) console.log(`workers capped at 6 (asked ${asked}); --force-workers to override`);
  const workers = Math.max(1, Math.min(args['force-workers'] ? asked : Math.min(asked, 6), todo.length || 1));
  console.log(`frames ${i0}..${i1 - 1} (${i1 - i0}), ${todo.length} to render, ${workers} workers, ${dir}`);
  if (todo.length) await withBrowsers(workers, scale, async (pages) => {
    let next = 0, done = 0; const t1 = Date.now(); const failed = [];
    await Promise.all(pages.map(async (page) => {
      while (next < todo.length) {
        const [i, f] = todo[next++];
        const tmp = f + '.part';
        try { await grab(page, i / FPS, tmp, fmt); fs.renameSync(tmp, f); }
        catch (e) { failed.push(i); console.error(`frame ${i} failed: ${String(e.message || e).split('\n')[0]}`); if (/closed|crash|Target/i.test(String(e))) return; continue; }
        if (++done % 24 === 0 || done === todo.length) {
          const el = (Date.now() - t1) / 1000;
          console.log(`${done}/${todo.length}  ${(el / done).toFixed(2)} s/frame  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`);
        }
      }
    }));
    if (failed.length || next < todo.length) { console.error(`${failed.length} frame(s) failed, ${Math.max(0, todo.length - next)} not started — rerun with --resume`); process.exitCode = 1; }
  });
}

if (args.encode) {
  const [a, b] = range(args.encode === true ? args.frames : args.encode);
  const [i0, i1] = frameRange(a, b);
  const scale = Number(args.scale || 0.5);
  const fmt = args.format || 'jpg';
  const dir = rel(args.framedir || `out/frames_${Math.round(1080 * scale)}`);
  for (let i = i0; i < i1; i++) if (!fs.existsSync(path.join(dir, `f_${String(i).padStart(6, '0')}.${fmt}`))) throw new Error(`missing frame ${i} in ${dir}`);
  const out = rel(args.out || `out/render_${a}-${b}.mp4`);
  const tStart = i0 / FPS, tEnd = Math.max(b, tStart);
  const enc = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-stats',
    '-framerate', String(FPS), '-start_number', String(i0), '-i', path.join(dir, `f_%06d.${fmt}`),
    '-i', AUDIO,
    '-filter_complex', `[1:a]atrim=start=${tStart.toFixed(6)}:end=${tEnd.toFixed(6)},asetpts=PTS-STARTPTS[a]`,
    '-map', '0:v', '-map', '[a]', '-frames:v', String(i1 - i0),
    '-c:v', 'libx264', '-preset', args.preset || 'slow', '-crf', String(args.crf || 17), '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', out], { stdio: 'inherit' });
  if (enc.status !== 0) throw new Error('ffmpeg failed');
  console.log(`wrote ${path.relative(ROOT, out)}  (video ${i0}..${i1 - 1} @${FPS}, audio ${tStart.toFixed(3)}–${tEnd.toFixed(3)} s)`);
}
console.log(`done in ${((Date.now() - T0) / 1000).toFixed(1)} s`);
