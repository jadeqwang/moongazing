#!/usr/bin/env python3
"""Agency seal generator (PIL + fontTools). Writes to media/chars/seal/.

  seal_dot.png / .svg          square vermilion seal, one pale-blue dot, carved-stone edges, transparent
  seal_guanghan.png / .svg     vertical seal, 廣寒 carved in nine-fold seal script (九叠篆), 白文 (white/transparent text)
  seal_guanghan_square.png     square variant, 廣 right / 寒 left (traditional right-to-left order)

Font: 字悦九叠印篆 (ZiYue JiuDie YinZhuan), path via --font. Its license is non-commercial (see docs/character_bible.md).
Usage: .venv/bin/python tools/seal.py --font /path/字悦九叠印篆.ttf
"""
import sys, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "media/chars/seal")
VERM = (200, 49, 43)          # #C8312B
DOT = (169, 200, 230)         # pale blue dot #A9C8E6
rng = np.random.default_rng(7)


def noise(w, h, scale, seed):
    r = np.random.default_rng(seed)
    small = r.random((max(2, h // scale), max(2, w // scale)))
    return np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255.0


def erode(mask, strength=0.5, seed=1, speckle=0.06):
    """mask: float 0..1 (1 = paste). Rough carved edge + ink gaps."""
    h, w = mask.shape
    m = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w / 220))) / 255.0
    n = 0.5 * noise(w, h, max(4, w // 70), seed) + 0.5 * noise(w, h, max(2, w // 260), seed + 1)
    edge = m + (n - 0.5) * strength
    out = (edge > 0.5).astype(np.float32)
    # interior ink gaps (paper grain where paste didn't take)
    g = noise(w, h, max(2, w // 500), seed + 2)
    out[(g > 1 - speckle)] = 0
    # occasional bigger chips
    # edge chips: only where the paste boundary is (never free-floating 'stars' inside the field)
    border = (m > 0.15) & (m < 0.85)
    chip = noise(w, h, max(3, w // 120), seed + 3) > 0.78
    out[border & chip] = 0
    return np.asarray(Image.fromarray((out * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))) / 255.0


def to_rgba(alpha, color=VERM, extra=None):
    h, w = alpha.shape
    rgb = np.zeros((h, w, 3), np.float32) + np.array(color, np.float32)
    # subtle density variation in the paste
    v = noise(w, h, max(3, w // 60), 11)[..., None]
    rgb = rgb * (0.88 + 0.16 * v)
    a = alpha.copy()
    if extra is not None:  # (mask, color) painted on top
        m, c = extra
        rgb = rgb * (1 - m[..., None]) + np.array(c, np.float32) * m[..., None]
        a = np.maximum(a, m)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8), "RGBA")


def dot_seal(S=2048):
    img = Image.new("L", (S, S), 0); d = ImageDraw.Draw(img)
    m = int(S * 0.04); b = int(S * 0.055); gap = int(S * 0.028)
    d.rounded_rectangle([m, m, S - m, S - m], radius=int(S * 0.03), fill=255)
    d.rectangle([m + b, m + b, S - m - b, S - m - b], fill=0)          # carved border line
    d.rectangle([m + b + gap, m + b + gap, S - m - b - gap, S - m - b - gap], fill=255)
    r = int(S * 0.075); c = S // 2
    d.ellipse([c - r, c - r, c + r, c + r], fill=0)                      # the dot is carved out...
    alpha = erode(np.asarray(img) / 255.0, 0.45, seed=3)
    dm = Image.new("L", (S, S), 0); ImageDraw.Draw(dm).ellipse([c - r + 6, c - r + 6, c + r - 6, c + r - 6], fill=255)
    dmask = np.asarray(dm.filter(ImageFilter.GaussianBlur(2))) / 255.0   # ...and filled pale blue
    return to_rgba(alpha, extra=(dmask, DOT))


def text_seal(font_path, chars, layout="vertical", S=2048):
    if layout == "vertical":
        W, H = S // 2 + S // 10, S
    else:
        W, H = S, S
    img = Image.new("L", (W, H), 0); d = ImageDraw.Draw(img)
    m = int(S * 0.04); b = int(S * 0.05)
    d.rounded_rectangle([m, m, W - m, H - m], radius=int(S * 0.025), fill=255)
    inner = [m + b, m + b, W - m - b, H - m - b]
    iw, ih = inner[2] - inner[0], inner[3] - inner[1]
    cells = []
    if layout == "vertical":
        ch = ih // 2
        cells = [(inner[0], inner[1] + i * ch, iw, ch) for i in range(2)]
    else:  # right-to-left columns
        cw = iw // 2
        cells = [(inner[0] + (1 - i) * cw, inner[1], cw, ih) for i in range(2)]
    for (x, y, w, h), chr_ in zip(cells, chars):
        g = Image.new("L", (1200, 1200), 0)
        f = ImageFont.truetype(font_path, 1000)
        ImageDraw.Draw(g).text((600, 600), chr_, font=f, fill=255, anchor="mm")
        g = g.crop(g.getbbox())
        pad = int(min(w, h) * 0.04)
        g = g.resize((w - 2 * pad, h - 2 * pad), Image.LANCZOS)        # 九叠篆 stretches to fill its cell
        img.paste(0, (x + pad, y + pad), g)                               # carve (白文)
    alpha = erode(np.asarray(img) / 255.0, 0.42, seed=5 + len(layout))
    return to_rgba(alpha)


def glyph_svg_paths(font_path, chars, cells, upm_fit=True):
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.boundsPen import BoundsPen
    f = TTFont(font_path); gs = f.getGlyphSet(); cm = f.getBestCmap()
    out = []
    for (x, y, w, h), c in zip(cells, chars):
        name = cm[ord(c)]
        bp = BoundsPen(gs); gs[name].draw(bp); x0, y0, x1, y1 = bp.bounds
        pen = SVGPathPen(gs); gs[name].draw(pen)
        sx, sy = w / (x1 - x0), h / (y1 - y0)
        out.append(f'<path transform="translate({x:.1f},{y + h:.1f}) scale({sx:.5f},{-sy:.5f}) translate({-x0},{-y0})" d="{pen.getCommands()}"/>')
    return out


ROUGH = ('<filter id="stone" x="-5%" y="-5%" width="110%" height="110%">'
         '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="n"/>'
         '<feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>'
         '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="9" result="g"/>'
         '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="ga"/>'
         '<feComposite in="d" in2="ga" operator="in"/></filter>')


def write_svgs(font_path):
    S = 512
    dot = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><defs>{ROUGH}'
           f'<mask id="m"><rect width="{S}" height="{S}" fill="white"/>'
           f'<rect x="{S*.095:.1f}" y="{S*.095:.1f}" width="{S*.81:.1f}" height="{S*.81:.1f}" fill="none" stroke="black" stroke-width="{S*.028:.1f}"/>'
           f'<circle cx="{S/2}" cy="{S/2}" r="{S*.075:.1f}" fill="black"/></mask></defs>'
           f'<g filter="url(#stone)"><rect x="{S*.04:.1f}" y="{S*.04:.1f}" width="{S*.92:.1f}" height="{S*.92:.1f}" rx="{S*.03:.1f}" fill="#C8312B" mask="url(#m)"/>'
           f'<circle cx="{S/2}" cy="{S/2}" r="{S*.07:.1f}" fill="#A9C8E6"/></g></svg>')
    open(os.path.join(OUT, "seal_dot.svg"), "w").write(dot)
    if font_path:
        W, H = int(S * 0.6), S
        m, b = S * .04, S * .05
        iw, ih = W - 2 * (m + b), H - 2 * (m + b)
        pad = iw * .04
        cells = [(m + b + pad, m + b + i * ih / 2 + pad, iw - 2 * pad, ih / 2 - 2 * pad) for i in range(2)]
        paths = "".join(glyph_svg_paths(font_path, "廣寒", cells))
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><defs>{ROUGH}'
               f'<mask id="m"><rect width="{W}" height="{H}" fill="white"/><g fill="black">{paths}</g></mask></defs>'
               f'<g filter="url(#stone)"><rect x="{m}" y="{m}" width="{W-2*m}" height="{H-2*m}" rx="{S*.025}" fill="#C8312B" mask="url(#m)"/></g></svg>')
        open(os.path.join(OUT, "seal_guanghan.svg"), "w").write(svg)


if __name__ == "__main__":
    font = None
    for a in sys.argv[1:]:
        if a.startswith("--font="):
            font = a.split("=", 1)[1]
    if "--font" in sys.argv:
        font = sys.argv[sys.argv.index("--font") + 1]
    os.makedirs(OUT, exist_ok=True)
    dot_seal().save(os.path.join(OUT, "seal_dot.png"))
    if font:
        text_seal(font, "廣寒", "vertical").save(os.path.join(OUT, "seal_guanghan.png"))
        text_seal(font, "廣寒", "square").save(os.path.join(OUT, "seal_guanghan_square.png"))
    write_svgs(font)
    print("ok")
