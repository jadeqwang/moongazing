// The closing colophon (题跋): a dedication, a vermilion hairline, then the credits as a vertical Chinese colophon
// beside horizontal English, with the small 望月 seal. Quiet, centred, on silk. params: { start }
import { smooth } from '../util.js';
import { sealFromImage, drawStamp } from '../seal.js';

const DED_EN = ['FOR EVERYONE WORKING FAR FROM THE PEOPLE THEY LOVE.', 'LOOK UP — THEY’RE LOOKING AT THE SAME MOON.'];
const DED_ZH = ['献给每一位在远方工作、思念家人的人。', '抬头看看——他们望着的，是同一轮明月。'];
// The picture credit is waiting on the user's wording: edit these two strings only.
export const PICTURE_CREDIT = 'Picture — drawn in ink, silk and gold by JavaScript, over keyframes made with GPT Image and Nano Banana Pro, and motion from Seedance and MiniMax';
export const PICTURE_CREDIT_ZH = '画面：以 JavaScript 用水墨、绢本、泥金绘制';
// one centred bilingual list: each English credit with its Chinese line directly beneath, in smaller type
const CREDITS = [
  ['Words — Jade Wang, from her poem “To Li Bai,” Oyez Review (2007)', '词：Jade Wang（原诗《致李白》，2007年刊于 Oyez Review）'],
  ['Chinese lines — Li Bai (701–762), “Drinking Alone by Moonlight” and “Quiet Night Thoughts”', '中文诗句：李白《月下独酌》《静夜思》'],
  ['Melody & chords — Jade Wang & Charlie van Norman, from a 2011 jam session', '曲：Jade Wang、Charlie van Norman（2011年即兴）'],
  ['Arrangement realized with Suno', '编曲：Suno'],
  ['Closing lines — Zhang Jiuling, “Gazing at the Moon, Longing for One Far Away”', '结句：张九龄《望月怀远》'],
  [PICTURE_CREDIT, PICTURE_CREDIT_ZH],
  ['Imagery — NASA LRO / LROC · NASA Black Marble · Voyager 1 “Pale Blue Dot” (1990), courtesy NASA/JPL', '影像：NASA 月球勘测轨道器（LRO/LROC）· NASA 夜光地球 · 旅行者一号《暗淡蓝点》（1990）'],
];

// vertical setting: CJK upright; Latin runs and brackets turned 90° (as in vertical CJK typesetting). Wraps at maxH.
function vtext(g, s, x, y, size, maxH, font, colGap) {
  // vertical presentation forms for CJK punctuation (they sit correctly in a column without turning)
  s = s.replace(/，/g, '︐').replace(/、/g, '︑').replace(/。/g, '︒').replace(/（/g, '︵').replace(/）/g, '︶').replace(/《/g, '︽').replace(/》/g, '︾');
  const toks = s.match(/[A-Za-z0-9 .,’'&\-]+|./g) || [];
  let cx = x, cy = y;
  for (const tk of toks) {
    const latin = /^[A-Za-z0-9 .,’'&\-]+$/.test(tk.trim()) && tk.trim().length > 0, turned = latin;
    g.font = latin ? `500 ${Math.round(size * 0.95)}px Cormorant` : `${size}px ${font}`;
    const w = turned ? g.measureText(tk.trim()).width : size;
    const adv = turned ? w + size * 0.25 : size * 1.08;
    if (cy + adv - y > maxH) { cx -= colGap; cy = y; }
    if (turned) { g.save(); g.translate(cx - size * 0.32, cy + size * 0.1); g.rotate(Math.PI / 2); g.fillText(tk.trim(), 0, 0); g.restore(); }
    else { g.textAlign = 'center'; g.fillText(tk, cx, cy + size * 0.88); g.textAlign = 'left'; }
    cy += adv;
  }
  return cx; // x of the last column used
}

let seal = null;
export const colophon = {
  draw(ctx, shot, t, lt) {
    const S = shot.params.start;
    const ded = smooth(S + 0.3, S + 1.4, t), dedZ = smooth(S + 0.9, S + 2.2, t);
    const rule = smooth(S + 3.4, S + 4.1, t), col = smooth(S + 4.0, S + 5.0, t);
    // dedication, centred, quiet; small-caps feel with open tracking
    ctx.pipe.layer((g) => {
      g.fillStyle = '#0f0e10'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.globalAlpha = ded; g.font = '600 27px Cormorant'; g.letterSpacing = '5px';
      DED_EN.forEach((l, i) => g.fillText(l, 960, 128 + i * 48));
      g.globalAlpha = dedZ; g.font = '36px MaShanZheng'; g.letterSpacing = '3px';
      DED_ZH.forEach((l, i) => g.fillText(l, 960, 248 + i * 52));
      g.letterSpacing = '0px';
    }, { mode: 'ink', absorb: 0.4, seed: 91 });
    // the vermilion hairline, drawn from the centre
    if (rule > 0) ctx.pipe.layer((g) => { g.fillStyle = 'rgba(200,49,43,0.9)'; const w = 230 * rule; g.fillRect(960 - w, 350, 2 * w, 1.6); }, { mode: 'ink', absorb: 0.3, seed: 92 });
    if (col <= 0) return;
    // the colophon: a single centred bilingual list
    ctx.pipe.layer((g) => {
      g.globalAlpha = col; g.fillStyle = '#0f0e10'; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
      CREDITS.forEach(([en, zh], i) => {
        const y = 418 + i * 92;
        g.font = '600 26px Cormorant'; g.letterSpacing = '1px'; g.fillText(en, 960, y, 1500);
        g.globalAlpha = col * 0.88; g.font = '500 20px NotoSerifSC'; g.letterSpacing = '2px'; g.fillText(zh, 960, y + 34, 1500);
        g.globalAlpha = col;
      });
      g.letterSpacing = '0px'; g.textAlign = 'left';
      // the title as a short vertical inscription at the right edge, like a signature
      g.font = '54px MaShanZheng'; g.textAlign = 'center';
      ['望', '明', '月'].forEach((ch, k) => g.fillText(ch, 1790, 470 + k * 60));
      g.textAlign = 'left';
    }, { mode: 'ink', absorb: 0.35, seed: 93 });
    colophon._sealX = 1790 - 6;
    // the small 望月 seal at the foot of the colophon
    const img = ctx.assets.seal_wangyue;
    if (img) {
      seal = seal || sealFromImage(ctx.type, img, 76);
      ctx.pipe.layer((g) => drawStamp(g, seal, { x: (colophon._sealX || 1400) + 6, y: 690, t, tLand: S + 5.4, rot: 0.02, approach: 0.12 }), { mode: 'ink', absorb: 0.5, seed: 94 });
    }
  },
};
