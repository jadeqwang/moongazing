// Asset store: a registry of every image the film can use, discovered at boot from media/keyframes (+ jade/),
// media/chars/identity and render/assets; images are loaded LAZILY (when a shot needs them), downscaled to what
// the render size can use, and their GL textures kept in a small LRU — so a 212 s film with ~60 keyframes fits
// in each render worker.
//   store.has('K_2.1')            -> is that keyframe delivered?
//   await store.need(['K_2.1'])   -> ctx.assets[key] (image/canvas) + ctx.tex[key] (texture) ready
import { loadImage, makeCanvas } from './util.js';

const ALIASES = { // legacy short keys used by the cold-open section
  K03: 'K_0.3', K04: 'K_0.4_plate', K04earth: 'K_0.4_earth', K05: 'K_0.5', K06: 'K_0.6', K12: 'K_1.2', K15: 'K_1.5',
  K16: 'K_1.6', K7D1: 'K_7.D1',
};
const STATIC = {
  S1: 'assets/plates/S1_silk_gpt_v1.jpg', S1b: 'assets/plates/S1_silk_nbp_v1.jpg', S2: 'assets/plates/S2_ink_gpt_v1.jpg',
  S3: 'assets/plates/S3_indigo_gpt_v1.jpg', S4: 'assets/plates/S4_jiehua_gpt_v1.jpg', goldline: 'assets/plates/A_goldline.jpg',
  gongbi: 'assets/plates/A_gongbi.jpg',
};

export class AssetStore {
  constructor(ctx) { this.ctx = ctx; this.urls = {}; this.lru = []; this.max = 18; this.pending = new Map(); this.mtime = {}; }
  async discover() {
    const ls = async (dir) => { try { return await (await fetch('/__ls?dir=' + dir)).json(); } catch (e) { return []; } };
    for (const [k, u] of Object.entries(STATIC)) this.urls[k] = u;
    for (const [dir, base] of [['media/keyframes', '/media/keyframes/'], ['media/keyframes/jade', '/media/keyframes/jade/'], ['media/chars/identity', '/media/chars/identity/']]) {
      for (const { f, mtime } of await ls(dir)) {
        if (!/\.(jpe?g|png|webp)$/i.test(f) || /SHEET|BOARD/i.test(f)) continue;
        const key = f.replace(/\.(jpe?g|png|webp)$/i, '');
        this.urls[key] = base + encodeURIComponent(f); this.mtime[key] = mtime;
      }
    }
    for (const [a, k] of Object.entries(ALIASES)) if (this.urls[k]) this.urls[a] = this.urls[k];
    this.texts = {};
    try { this.texts['K_0.6'] = await (await fetch('/media/keyframes/K_0.6.txt')).text(); } catch (e) { this.texts['K_0.6'] = ''; }
  }
  has(k) { return !!this.urls[k]; }
  async need(keys) {
    const { ctx } = this;
    for (const k of keys) {
      if (!k || !this.urls[k]) continue;
      if (ctx.tex[k]) { this.touch(k); continue; }
      if (!this.pending.has(k)) this.pending.set(k, this.load(k));
      await this.pending.get(k);
    }
  }
  async load(k) {
    const { ctx } = this;
    let img = await loadImage(this.urls[k]);
    const maxW = Math.max(1024, Math.round(ctx.W * 2.0));
    if (img.width > maxW && !/^(seal|emblem)/.test(k)) {
      const c = makeCanvas(maxW, Math.round(img.height * maxW / img.width));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      img = c;
    }
    ctx.assets[k] = img;
    ctx.tex[k] = ctx.gl.texture(img, { mip: true });
    this.touch(k);
    this.pending.delete(k);
  }
  touch(k) {
    const i = this.lru.indexOf(k); if (i >= 0) this.lru.splice(i, 1); this.lru.push(k);
    while (this.lru.length > this.max) {
      const old = this.lru.shift();
      if (this.pinned && this.pinned.has(old)) { this.lru.push(old); if (this.lru.every((x) => this.pinned.has(x))) break; continue; }
      const t = this.ctx.tex[old]; if (t) this.ctx.gl.gl.deleteTexture(t.tex);
      delete this.ctx.tex[old]; delete this.ctx.assets[old];
    }
  }
}

// collect the image keys a shot's layers reference (params.img, params.over.img, params.imgs[], shot.needs)
export function shotKeys(shot) {
  const keys = new Set(shot.needs || []);
  const layers = Array.isArray(shot.scene) ? shot.scene : [shot.scene];
  const scan = (p) => { if (!p) return; if (p.img) keys.add(p.img); if (p.over && p.over.img) keys.add(p.over.img); if (p.imgs) p.imgs.forEach((x) => keys.add(x)); if (p.left) scan(p.left); if (p.right) scan(p.right); };
  scan(shot.params);
  for (const L of layers) if (L && typeof L === 'object') scan(L.params);
  return [...keys];
}
