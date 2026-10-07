// 望明月 Moongazing renderer — entry point.
// window.renderAt(t) draws song time t deterministically (seeded noise only; no Math.random, no clock).
// URL params: ?scale=0.5 (960x540 preview), ?t=12.3 (draw one frame on load), ?play=1 (live preview with audio),
//             ?debug=1 (HUD with time / shot / bar.beat)
import { GL } from './gl.js';
import { Pipeline } from './core.js';
import { Beats } from './beats.js';
import { makeFiberTile } from './paper.js';
import { loadImage } from './util.js';
import { buildShots, SCENES } from './shots.js';
import { TypeKit, loadFonts } from './type.js';
import { AssetStore, shotKeys } from './assets.js';

const qs = new URLSearchParams(location.search);
const scale = Number(qs.get('scale') || 1);
const W = Math.round(1920 * scale), H = Math.round(1080 * scale);
const canvas = document.getElementById('view');
canvas.width = W; canvas.height = H;
canvas.style.width = qs.get('fit') ? '100vw' : `${W}px`;

const state = {};

async function boot() {
  const grid = await (await fetch('/analysis/beatgrid.json')).json();
  const beats = new Beats(grid);
  await loadFonts();
  const gl = new GL(canvas, W, H);
  const fiberCanvas = makeFiberTile(7);
  const fiberTex = gl.texture(fiberCanvas, { wrap: 'repeat', mip: true });
  const pipe = new Pipeline(gl, fiberTex);
  const moon = await loadImage('assets/moon/moon_lroc_4k_gray.jpg');
  const assets = { moon };
  const tex = { moon: gl.texture(moon, { wrap: 'repeat', mip: true }) };
  const lyr = await (await fetch('/analysis/lyrics_timing.json')).json();
  const ctx = {
    gl, pipe, beats, assets, tex, fiberCanvas, W, H, S: gl.S,
    layout: { moon: { cx: 960, cy: 540, R: 300 } },
    lyrics: Object.fromEntries(lyr.lines.map((l) => [l.id, l])),
  };
  const store = new AssetStore(ctx);
  ctx.store = store;
  await store.discover();
  // identity assets are used at init (title seal) — load them eagerly and pin them
  await store.need(['seal_wangyue', 'seal_guanghan', 'emblem_final']);
  store.pinned = new Set(['seal_wangyue', 'seal_guanghan', 'emblem_final']);
  assets.sealWangyue = assets.seal_wangyue;
  window.__assets = Object.keys(store.urls);
  ctx.type = new TypeKit(ctx);
  for (const s of Object.values(SCENES)) if (s.init) await s.init(ctx);
  let shots = buildShots(beats, store, ctx.lyrics);
  // ?roto={"clip":"K_5.1/take_1","paper":"ink",...,"shotPaper":"xuan","t0":0}: a single test shot (render/tools/roto_test.mjs)
  if (qs.get('roto')) {
    const R = JSON.parse(qs.get('roto'));
    shots = [{ id: 'roto-test', t0: R.t0 || 0, t1: R.t1 || 1e6, paper: R.shotPaper || 'silk', grain: R.grain ?? 7, section: R.section || 'test', scene: [{ type: 'roto', ...R }] }];
  }
  Object.assign(state, { ctx, shots });
  window.__shots = shots.map((s, i) => ({ i, id: s.id, t0: s.t0, t1: s.t1 }));
}

function shotAt(t) {
  const { shots } = state;
  for (let i = shots.length - 1; i >= 0; i--) if (t >= shots[i].t0) return [shots[i], i];
  return [shots[0], 0];
}

let busy = Promise.resolve();
function renderAt(t) {
  const run = async () => {
    const { ctx } = state;
    const [shot, idx] = shotAt(t);
    const lt = t - shot.t0;
    ctx.t = t; ctx.lt = lt; ctx.shot = shot; ctx.shotIndex = idx;
    await ctx.store.need(shotKeys(shot));
    const cam = shot.cam ? shot.cam(t, lt, ctx) : {};
    ctx.pipe.setCam(cam);
    ctx.pipe.paper(shot.paper || 'xuan', shot.paperSeed ?? (shot.grain ?? idx) * 0.37);
    ctx.postExtra = null;
    const layers = Array.isArray(shot.scene) ? shot.scene : [shot.scene];
    for (const L of layers) {
      if (!L) continue;
      const name = typeof L === 'string' ? L : (L.name || L.type);
      const sc = SCENES[name];
      if (!sc) throw new Error('no scene ' + name);
      const lp = typeof L === 'string' ? null : (L.params || (L.type ? L : {}));  // {type:'roto', clip, ...} is its own params
      const sh = lp ? { ...shot, params: { ...(shot.params || {}), ...lp } } : shot;
      await sc.draw(ctx, sh, t, lt);
    }
    if (shot.type && !qs.has('notype')) shot.type(ctx, t, lt);
    const post = { grainSeed: shot.grain ?? idx + 1, ...(shot.post ? shot.post(t, lt, ctx) : {}), ...(ctx.postExtra || {}) };
    if (shot.flash) { const k = Math.floor(lt * 24 + 1e-6); post.flash = k === 0 ? 1 : k === 1 ? 0.55 : 0; }
    ctx.pipe.post(post);
    const hud = document.getElementById('hud');
    if (hud && qs.get('debug')) { const b = ctx.beats.at(t); hud.textContent = `${t.toFixed(3)}s  ${shot.id}  bar ${b.bar}.${b.beat}`; }
    ctx.gl.gl.finish();
  };
  busy = busy.then(run, run);
  return busy;
}

window.renderAt = renderAt;
window.__ready = boot().then(async () => {
  if (qs.get('t')) await renderAt(Number(qs.get('t')));
  if (qs.get('play')) {
    const el = new Audio('/inputs/moongazing.mp3');
    el.currentTime = Number(qs.get('from') || 0);
    document.body.addEventListener('click', () => el.play(), { once: true });
    const loop = async () => { await renderAt(el.currentTime || 0); requestAnimationFrame(loop); };
    loop();
  }
  return true;
}).catch((e) => { console.error(e); window.__error = String(e && e.stack || e); throw e; });

// contact-sheet helpers (used by tools/render.mjs --sheet)
let sheet = null;
window.__sheetInit = (n, cols, tw) => {
  const th = Math.round(tw * 9 / 16), rows = Math.ceil(n / cols), pad = 6, lab = 18;
  const c = document.createElement('canvas');
  c.width = cols * (tw + pad) + pad; c.height = rows * (th + pad + lab) + pad;
  const g = c.getContext('2d'); g.fillStyle = '#0d0d0f'; g.fillRect(0, 0, c.width, c.height);
  sheet = { c, g, cols, tw, th, pad, lab };
};
window.__sheetAdd = (i, label) => {
  const { g, cols, tw, th, pad, lab } = sheet;
  const x = pad + (i % cols) * (tw + pad), y = pad + Math.floor(i / cols) * (th + pad + lab);
  g.drawImage(canvas, x, y, tw, th);
  g.fillStyle = '#c9b48a'; g.font = '500 12px PlexMono, monospace'; g.textBaseline = 'top';
  g.fillText(label, x + 2, y + th + 3);
};
window.__sheetOut = (q = 0.9) => sheet.c.toDataURL('image/jpeg', q);
window.__frame = (fmt = 'png', q = 0.95) => canvas.toDataURL(fmt === 'png' ? 'image/png' : 'image/jpeg', q);
