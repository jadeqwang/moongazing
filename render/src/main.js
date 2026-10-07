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
  const A = 'assets/';
  const [moon, S1, S1b, S2, S3, S4, goldline, gongbi] = await Promise.all([
    'moon/moon_lroc_4k_gray.jpg', 'plates/S1_silk_gpt_v1.jpg', 'plates/S1_silk_nbp_v1.jpg', 'plates/S2_ink_gpt_v1.jpg',
    'plates/S3_indigo_gpt_v1.jpg', 'plates/S4_jiehua_gpt_v1.jpg', 'plates/A_goldline.jpg', 'plates/A_gongbi.jpg',
  ].map((p) => loadImage(A + p)));
  const assets = { moon, S1, S1b, S2, S3, S4, goldline, gongbi };
  // keyframes are read live from media/keyframes (so new takes drop straight in); missing ones are skipped
  const KF = { K03: 'K_0.3.jpg', K04: 'K_0.4_plate.jpg', K04earth: 'K_0.4_earth.png', K05: 'K_0.5.jpg', K06: 'K_0.6.jpg',
    K12: 'K_1.2.jpg', K15: 'K_1.5.jpg', K16: 'K_1.6.jpg', K7D1: 'K_7.D1.jpg' };
  await Promise.all(Object.entries(KF).map(async ([k, f]) => { try { assets[k] = await loadImage('/media/keyframes/' + f); } catch (e) { /* not delivered yet */ } }));
  try { assets.k06txt = await (await fetch('/media/keyframes/K_0.6.txt')).text(); } catch (e) { assets.k06txt = ''; }
  try { // the 望月 carved seal from the identity work, if it has landed
    const ls = await (await fetch('/__ls?dir=media/chars/identity')).json();
    const f = ls.map((x) => x.f).filter((n) => /(望月|wangyue)/i.test(n) && /\.(png|jpe?g|webp)$/i.test(n)).sort()[0];
    if (f) assets.sealWangyue = await loadImage('/media/chars/identity/' + encodeURIComponent(f));
  } catch (e) { /* not yet */ }
  window.__assets = Object.keys(assets).filter((k) => assets[k]);
  const tex = { moon: gl.texture(moon, { wrap: 'repeat', mip: true }) };
  for (const [k, v] of Object.entries(assets)) if (k !== 'moon' && v && v.width) tex[k] = gl.texture(v, { mip: true });
  const ctx = {
    gl, pipe, beats, assets, tex, fiberCanvas, W, H, S: gl.S,
    layout: { moon: { cx: 960, cy: 540, R: 300 } },
  };
  ctx.type = new TypeKit(ctx);
  for (const s of Object.values(SCENES)) if (s.init) await s.init(ctx);
  const shots = buildShots(beats, assets);
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
    const cam = shot.cam ? shot.cam(t, lt, ctx) : {};
    ctx.pipe.setCam(cam);
    ctx.pipe.paper(shot.paper || 'xuan', shot.paperSeed ?? (shot.grain ?? idx) * 0.37);
    ctx.postExtra = null;
    const layers = Array.isArray(shot.scene) ? shot.scene : [shot.scene];
    for (const L of layers) {
      if (!L) continue;
      const name = typeof L === 'string' ? L : L.name;
      const sc = SCENES[name];
      if (!sc) throw new Error('no scene ' + name);
      const sh = typeof L === 'string' ? shot : { ...shot, params: { ...(shot.params || {}), ...(L.params || {}) } };
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
