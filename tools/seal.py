#!/usr/bin/env python3
"""Moongazing identity: the agency emblem (no red) and the vermilion carved seals. Writes media/chars/identity/.

  emblem_v1_sunbeam   round patch: one slanted band of scattered sunlight on deep indigo, the pale blue dot inside it
  emblem_v2_rays      the Voyager frame quoted more literally: a vertical "photo" field crossed by three rays of
                      unequal width, the dot in the brightest one
  emblem_v3_orbit     v1 + a thin lunar-orbit hairline around the dot with the Moon as a speck
  emblem_final        the chosen design (v1 geometry + a quieter orbit hairline; reads at 24 px)
  -> each as .svg (procedural vector) and .png (2048 px, transparent outside the patch)

  seal_guanghan       廣寒 (station seal) 白文 square, 廣 right / 寒 left
  seal_guanghan_tall  廣寒 白文 vertical (長方印), 廣 above 寒
  seal_wangyue        望月 film signature seal, 朱文 (元朱文 style: fine even strokes, thin border) — the final
  seal_wangyue_baiwen 望月 白文 alternative
  seal_wangmingyue    望明月 朱文, three-character layout (望 right column, 明/月 stacked left)
  -> each as .png (transparent, carved-stone edge) and .svg (strokes as vectors, feTurbulence stone edge)

Glyphs: no font. tools/seal_glyphs.json holds centre-line strokes extracted by tools/seal_skeleton.py from the
public-domain Shuowen small-seal SVGs on Wikimedia Commons (Ancient Chinese Characters Project; copies in
media/chars/identity/src/). Strokes are re-drawn at one even weight (玉箸篆 "jade chopstick" line) and pushed out to
fill the cell (印化), so the seal has no font licence at all.

Usage: .venv/bin/python tools/seal.py
"""
import os, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "media/chars/identity")
GLYPHS = json.load(open(os.path.join(ROOT, "tools/seal_glyphs.json")))
# 明: the Commons Shuowen 明 (朙) traces badly, so it is composed here as 日 + 月, a form common on Han seals:
# 日 = a tall rounded loop with one short inner stroke, set narrow on the left; the PD 月 on the right.
_ri = [[0.5 + 0.5 * math.cos(t) * 0.92, 0.5 + 0.5 * math.sin(t) * 0.96] for t in np.linspace(-math.pi / 2, 1.5 * math.pi, 41)]
_sun = [[[x * 0.36, 0.08 + y * 0.84] for x, y in _ri], [[0.36 * 0.3, 0.5], [0.36 * 0.7, 0.5]]]
GLYPHS["明"] = {"w": 1, "h": 1, "lines": _sun + [[[0.44 + 0.56 * u, v] for u, v in l] for l in GLYPHS["月"]["lines"]]}

VERM = (200, 49, 43)           # #C8312B
INDIGO = "#16213E"             # deep space / 磁青 indigo
INDIGO2 = "#1E2B4A"            # slightly lifted indigo (outer rays)
BAND = "#8A7550"               # scattered sunlight: matte gold wash (GOLD paper #87704B family)
BAND2 = "#5A5446"              # fainter ray
GOLD = "#D4B170"               # rim / hairline gold
DOT = "#A9C8E6"                # the pale blue dot


# ------------------------------------------------------------------------------------------------ emblem (vector)
def _band_poly(cx, cy, R, ang_deg, off, half_w, taper=1.0, ext=1.6):
    """A straight band through the patch: centre offset `off` (perpendicular), half-width at the patch centre,
    angle from vertical. taper>1 = wider at the top (light spreading from a Sun above the frame)."""
    a = math.radians(ang_deg)
    d = (math.sin(a), -math.cos(a))          # along the band, pointing up
    n = (math.cos(a), math.sin(a))           # perpendicular
    c = (cx + n[0] * off, cy + n[1] * off)
    L = R * ext
    pts = []
    for s, t in ((-1, -1), (-1, 1), (1, 1), (1, -1)):
        k = taper ** s                       # s=+1 is the top end
        pts.append((c[0] + d[0] * L * s + n[0] * half_w * k * t, c[1] + d[1] * L * s + n[1] * half_w * k * t))
    return pts, c, d, n


# rays: (perpendicular offset, half-width, colour, taper) as fractions of the patch radius; the LAST BAND-coloured ray
# holds the dot. dot = (along the band, + = up; across, as a fraction of that ray's half-width).
EMBLEMS = {
    "emblem_v1_sunbeam": dict(shape="circle", angle=16, rays=[(0.22, 0.20, BAND2, 1.25), (0.22, 0.105, BAND, 1.25)],
                              dot=(-0.30, 0.0), dot_r=0.055, orbit=None, rim=0.024),
    "emblem_v2_rays": dict(shape="rect", angle=7, rays=[(-0.46, 0.03, BAND2, 1.2), (-0.22, 0.055, BAND2, 1.2),
                                                         (0.20, 0.17, BAND2, 1.2), (0.20, 0.09, BAND, 1.2)],
                           dot=(-0.26, 0.05), dot_r=0.05, orbit=None, rim=0.02),
    "emblem_v3_orbit": dict(shape="circle", angle=16, rays=[(0.22, 0.20, BAND2, 1.25), (0.22, 0.105, BAND, 1.25)],
                            dot=(-0.30, 0.0), dot_r=0.055, orbit=(0.30, 0.30, 0, 0.010), moon=True, rim=0.024),
    "emblem_final": dict(shape="circle", angle=16, rays=[(-0.38, 0.05, BAND2, 1.25), (0.22, 0.20, BAND2, 1.25),
                                                         (0.22, 0.105, BAND, 1.25)],
                         dot=(-0.30, 0.0), dot_r=0.07, orbit=(0.25, 0.25, 0, 0.0075), moon=True, rim=0.026),
    # patch-size cut (use at or below ~64 px / embroidered patches): no hairline, no faint ray, bigger dot, wider band
    "emblem_final_small": dict(shape="circle", angle=16, rays=[(0.22, 0.24, BAND2, 1.2), (0.22, 0.14, BAND, 1.2)],
                               dot=(-0.30, 0.0), dot_r=0.12, halo=1.55, orbit=None, rim=0.05),
}


def emblem_svg(spec, S=1024):
    cx = cy = S / 2
    R = S * 0.47
    rim = S * spec["rim"]
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">',
             '<defs><clipPath id="c">']
    if spec["shape"] == "circle":
        parts.append(f'<circle cx="{cx}" cy="{cy}" r="{R - rim:.2f}"/>')
    else:
        w, h = R * 1.5, R * 1.94
        parts.append(f'<rect x="{cx - w / 2 + rim:.2f}" y="{cy - h / 2 + rim:.2f}" width="{w - 2 * rim:.2f}" '
                     f'height="{h - 2 * rim:.2f}" rx="{S * .02:.2f}"/>')
    parts.append('</clipPath></defs>')
    # rim (gold merrowed edge) + field
    if spec["shape"] == "circle":
        parts.append(f'<circle cx="{cx}" cy="{cy}" r="{R:.2f}" fill="{GOLD}"/>')
    else:
        w, h = R * 1.5, R * 1.94
        parts.append(f'<rect x="{cx - w / 2:.2f}" y="{cy - h / 2:.2f}" width="{w:.2f}" height="{h:.2f}" rx="{S * .03:.2f}" fill="{GOLD}"/>')
    parts.append(f'<g clip-path="url(#c)"><rect width="{S}" height="{S}" fill="{INDIGO}"/>')
    main = None
    for off, hw, col, taper in spec["rays"]:
        pts, c, d, n = _band_poly(cx, cy, R, spec["angle"], off * R, hw * R, taper)
        parts.append(f'<polygon fill="{col}" points="{" ".join(f"{x:.2f},{y:.2f}" for x, y in pts)}"/>')
        if col == BAND:
            main = (c, d, n)
    c, d, n = main
    along, across = spec["dot"]
    hw = [r for r in spec["rays"] if r[2] == BAND][-1][1] * R
    dx = c[0] + d[0] * along * R + n[0] * across * hw
    dy = c[1] + d[1] * along * R + n[1] * across * hw
    if spec.get("orbit"):
        rx, ry, tilt, ow = spec["orbit"]
        parts.append(f'<ellipse cx="{dx:.2f}" cy="{dy:.2f}" rx="{rx * R:.2f}" ry="{ry * R:.2f}" '
                     f'transform="rotate({tilt} {dx:.2f} {dy:.2f})" fill="none" stroke="{GOLD}" stroke-width="{ow * S:.2f}"/>')
        if spec.get("moon"):
            ma = math.radians(-35)   # the Moon on its orbit, upper right of Earth
            mx, my = dx + rx * R * math.cos(ma), dy + ry * R * math.sin(ma)
            parts.append(f'<circle cx="{mx:.2f}" cy="{my:.2f}" r="{S * .016:.2f}" fill="{GOLD}"/>')
    if spec.get("halo"):   # dark knockout ring so the dot separates from the band at 16-40 px
        parts.append(f'<circle cx="{dx:.2f}" cy="{dy:.2f}" r="{spec["dot_r"] * spec["halo"] * R:.2f}" fill="{INDIGO}"/>')
    parts.append(f'<circle cx="{dx:.2f}" cy="{dy:.2f}" r="{spec["dot_r"] * R:.2f}" fill="{DOT}"/>')
    parts.append('</g></svg>')
    return "".join(parts)


def svg_to_png(svg_text, out_png, size=2048):
    """Tiny rasteriser for the emblem's own SVG subset (circle, ellipse, rect, polygon, clipPath) via PIL at 4x."""
    import re
    SS = 4
    vb = float(re.search(r'viewBox="0 0 (\d+)', svg_text).group(1))
    k = size * SS / vb
    W = size * SS
    base = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    clip_part, body = svg_text.split("</clipPath></defs>")
    clip = Image.new("L", (W, W), 0)
    _draw_shapes(ImageDraw.Draw(clip), clip_part.split('<clipPath id="c">')[1], k, fill_override=255)
    pre, inner = body.split('<g clip-path="url(#c)">')
    _draw_shapes(ImageDraw.Draw(base), pre, k)
    layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    _draw_shapes(ImageDraw.Draw(layer), inner, k)
    base.paste(layer, (0, 0), Image.fromarray(np.minimum(np.asarray(clip), np.asarray(layer)[..., 3])))
    base.resize((size, size), Image.LANCZOS).save(out_png)


def _hex(c):
    c = c.lstrip("#"); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


def _draw_shapes(d, frag, k, fill_override=None):
    import re
    for m in re.finditer(r"<(circle|ellipse|rect|polygon)([^>]*)/>", frag):
        tag, attrs = m.group(1), dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(2)))
        f = lambda key, dflt=0.0: float(attrs.get(key, dflt)) * k
        fill = attrs.get("fill", "#000")
        col = fill_override if fill_override is not None else (None if fill == "none" else _hex(fill))
        stroke = attrs.get("stroke")
        if tag == "circle":
            box = [f("cx") - f("r"), f("cy") - f("r"), f("cx") + f("r"), f("cy") + f("r")]
            d.ellipse(box, fill=col)
        elif tag == "ellipse":
            box = [f("cx") - f("rx"), f("cy") - f("ry"), f("cx") + f("rx"), f("cy") + f("ry")]
            d.ellipse(box, fill=col, outline=_hex(stroke) if stroke else None,
                      width=max(1, round(f("stroke-width"))) if stroke else 0)
        elif tag == "rect":
            box = [f("x"), f("y"), f("x") + f("width"), f("y") + f("height")]
            d.rounded_rectangle(box, radius=f("rx"), fill=col)
        else:
            pts = [tuple(float(v) * k for v in p.split(",")) for p in attrs["points"].split()]
            d.polygon(pts, fill=col)


# ------------------------------------------------------------------------------------------------ seal glyphs
def glyph_lines(ch, box, push=0.78, pad=0.0):
    """Centre-line polylines of `ch` fitted to box (x, y, w, h). push<1 swells the strokes out to the cell edges (印化)."""
    g = GLYPHS[ch]
    x, y, w, h = box
    out = []
    for line in g["lines"]:
        pts = []
        for u, v in line:
            uu = 0.5 + 0.5 * math.copysign(abs(2 * u - 1) ** push, u - 0.5)
            vv = 0.5 + 0.5 * math.copysign(abs(2 * v - 1) ** push, v - 0.5)
            pts.append((x + pad + uu * (w - 2 * pad), y + pad + vv * (h - 2 * pad)))
        out.append(pts)
    return out


def draw_lines(d, lines, width, fill):
    r = width / 2
    for pts in lines:
        d.line(pts, fill=fill, width=int(round(width)), joint="curve")
        for px, py in (pts[0], pts[-1]):
            d.ellipse([px - r, py - r, px + r, py + r], fill=fill)


def noise(w, h, scale, seed):
    r = np.random.default_rng(seed)
    small = r.random((max(2, h // scale), max(2, w // scale)))
    return np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255.0


def erode(mask, strength=0.45, seed=1, speckle=0.05):
    """mask: float 0..1 (1 = paste). Carved-stone edge, chipped border, paper grain where the paste didn't take."""
    h, w = mask.shape
    m = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w / 260))) / 255.0
    n = 0.5 * noise(w, h, max(4, w // 70), seed) + 0.5 * noise(w, h, max(2, w // 260), seed + 1)
    out = ((m + (n - 0.5) * strength) > 0.5).astype(np.float32)
    g = noise(w, h, max(2, w // 500), seed + 2)
    out[g > 1 - speckle] = 0
    border = (m > 0.15) & (m < 0.85)
    out[border & (noise(w, h, max(3, w // 120), seed + 3) > 0.8)] = 0
    return np.asarray(Image.fromarray((out * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))) / 255.0


def to_rgba(alpha, color=VERM):
    h, w = alpha.shape
    rgb = np.zeros((h, w, 3), np.float32) + np.array(color, np.float32)
    rgb = rgb * (0.88 + 0.16 * noise(w, h, max(3, w // 60), 11)[..., None])
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), "RGBA")


SEALS = {
    # name: (W/H aspect, style, [(char, cell(x,y,w,h) in 0..1 of the inner field)], stroke weight (frac of S), push)
    "seal_guanghan": (1.0, "baiwen", [("廣", (0.5, 0, 0.5, 1)), ("寒", (0, 0, 0.5, 1))], 0.036, 0.9),
    "seal_guanghan_tall": (0.5, "baiwen", [("廣", (0, 0, 1, 0.5)), ("寒", (0, 0.5, 1, 0.5))], 0.03, 0.92),
    "seal_wangyue": (1.0, "zhuwen", [("望", (0.5, 0, 0.5, 1)), ("月", (0, 0, 0.5, 1))], 0.026, 0.9),
    "seal_wangyue_baiwen": (1.0, "baiwen", [("望", (0.5, 0, 0.5, 1)), ("月", (0, 0, 0.5, 1))], 0.045, 0.9),
    "seal_wangmingyue": (1.0, "zhuwen", [("望", (0.5, 0, 0.5, 1)), ("明", (0, 0, 0.5, 0.5)), ("月", (0, 0.5, 0.5, 0.5))],
                         0.022, 0.9),
}


def seal_geometry(name, S):
    aspect, style, cells, weight, push = SEALS[name]
    W, H = (S, S) if aspect >= 1 else (int(S * aspect), S)
    m = S * 0.04                                       # outer margin
    border = S * (0.05 if style == "baiwen" else 0.03)  # 白文: red frame band; 朱文: thin red border line
    gap = S * (0.03 if style == "baiwen" else 0.045)   # space between frame and characters
    fx, fy = m + border + gap, m + border + gap
    fw, fh = W - 2 * fx, H - 2 * fy
    cg = S * 0.025                                     # gutter between characters
    lines = []
    for ch, (cx, cy, cw, chh) in cells:
        box = (fx + cx * fw + (cg / 2 if cx > 0 else 0), fy + cy * fh + (cg / 2 if cy > 0 else 0),
               cw * fw - (cg / 2 if 0 < cx or cx + cw < 1 else 0), chh * fh - (cg / 2 if 0 < cy or cy + chh < 1 else 0))
        sw = weight * S
        box = (box[0] + sw / 2, box[1] + sw / 2, box[2] - sw, box[3] - sw)   # keep the stroke inside the cell
        lines += glyph_lines(ch, box, push=push)
    return W, H, m, border, style, lines, weight * S


def seal_png(name, S=2048, seed=5):
    W, H, m, border, style, lines, sw = seal_geometry(name, S)
    img = Image.new("L", (W, H), 0); d = ImageDraw.Draw(img)
    if style == "baiwen":      # red block, characters carved out (white/transparent)
        d.rounded_rectangle([m, m, W - m, H - m], radius=S * 0.025, fill=255)
        draw_lines(d, lines, sw, 0)
        strength = 0.42
    else:                      # 朱文: thin red border + red strokes, ground carved away
        d.rounded_rectangle([m, m, W - m, H - m], radius=S * 0.02, fill=255)
        d.rounded_rectangle([m + border, m + border, W - m - border, H - m - border], radius=S * 0.012, fill=0)
        draw_lines(d, lines, sw, 255)
        strength = 0.30
    alpha = erode(np.asarray(img) / 255.0, strength, seed=seed, speckle=0.04 if style == "baiwen" else 0.02)
    to_rgba(alpha).save(os.path.join(OUT, name + ".png"))


ROUGH = ('<filter id="stone" x="-5%" y="-5%" width="110%" height="110%">'
         '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="n"/>'
         '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>'
         '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="9" result="g"/>'
         '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.7" result="ga"/>'
         '<feComposite in="d" in2="ga" operator="in"/></filter>')


def seal_svg(name, S=512):
    W, H, m, border, style, lines, sw = seal_geometry(name, S)
    pl = "".join(f'<polyline points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}"/>' for pts in lines)
    stroke = f'fill="none" stroke-width="{sw:.2f}" stroke-linecap="round" stroke-linejoin="round"'
    if style == "baiwen":
        body = (f'<mask id="m"><rect width="{W}" height="{H}" fill="white"/><g stroke="black" {stroke}>{pl}</g></mask>'
                f'</defs><g filter="url(#stone)"><rect x="{m}" y="{m}" width="{W - 2 * m}" height="{H - 2 * m}" '
                f'rx="{S * .025:.1f}" fill="#C8312B" mask="url(#m)"/></g>')
    else:
        b2 = m + border / 2
        body = (f'</defs><g filter="url(#stone)"><rect x="{b2:.1f}" y="{b2:.1f}" width="{W - 2 * b2:.1f}" '
                f'height="{H - 2 * b2:.1f}" rx="{S * .016:.1f}" fill="none" stroke="#C8312B" stroke-width="{border:.1f}"/>'
                f'<g stroke="#C8312B" {stroke}>{pl}</g></g>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><defs>{ROUGH}'
           + body + '</svg>')
    open(os.path.join(OUT, name + ".svg"), "w").write(svg)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, spec in EMBLEMS.items():
        svg = emblem_svg(spec)
        open(os.path.join(OUT, name + ".svg"), "w").write(svg)
        svg_to_png(svg, os.path.join(OUT, name + ".png"))
        print("emblem", name)
    for i, name in enumerate(SEALS):
        seal_png(name, seed=5 + i)
        seal_svg(name)
        print("seal", name)


# ------------------------------------------------------------------------------------------------ review board
def board():
    from PIL import ImageFont
    def F(sz, cjk=False):
        p = "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf" if cjk else "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
        return ImageFont.truetype(p, sz)
    def txt(d, xy, s, sz=26, fill=(27, 27, 31)):
        x, y = xy
        import itertools
        for is_cjk, run in itertools.groupby(s, key=lambda ch: ord(ch) > 0x2E80):
            run = "".join(run); f = F(sz, is_cjk); d.text((x, y), run, font=f, fill=fill); x += d.textlength(run, font=f)
    SILK = (233, 220, 192)
    W, H = 2600, 2150
    B = Image.new("RGB", (W, H), SILK); d = ImageDraw.Draw(B)
    txt(d, (60, 40), "MOONGAZING  ·  IDENTITY: agency emblem and seals", 52)
    txt(d, (60, 108), "tools/seal.py → media/chars/identity/  ·  see docs/identity.md", 26, (90, 80, 66))
    def paste(img, x, y, size):
        t = img.copy(); t.thumbnail((size, size), Image.LANCZOS); B.paste(t, (x, y), t if t.mode == "RGBA" else None); return t
    # row 1: why the old mark is retired
    y = 180
    txt(d, (60, y), "RETIRED: one disc centred in a field reads as the Hinomaru (Japan's flag), whatever the colours.", 28)
    old = Image.open(os.path.join(ROOT, "media/chars/seal/seal_dot.png")); paste(old, 60, y + 60, 300)
    flag = Image.new("RGB", (450, 300), (250, 250, 250)); ImageDraw.Draw(flag).ellipse([135, 60, 315, 240], fill=(188, 0, 45))
    B.paste(flag, (420, y + 60)); d.rectangle([420, y + 60, 869, y + 359], outline=(150, 135, 110))
    txt(d, (60, y + 370), "old seal_dot", 22, (90, 80, 66))
    txt(d, (420, y + 370), "日の丸 Hinomaru", 22, (90, 80, 66))
    txt(d, (960, y + 80), "The new emblem: no red; Earth OFF-centre inside a slanted band of scattered sunlight —", 26)
    txt(d, (960, y + 120), "Voyager 1, 14 Feb 1990, 'Pale Blue Dot' (Earth = 0.12 px, caught in a sunbeam artefact).", 26)
    txt(d, (960, y + 160), "Vermilion is kept only for carved-character chops (廣寒 station seal, 望月 film seal).", 26)
    # row 2: emblem variants
    y = 640
    names = [("emblem_v1_sunbeam", "v1 sunbeam"), ("emblem_v2_rays", "v2 rays (photo frame)"),
             ("emblem_v3_orbit", "v3 + lunar orbit"), ("emblem_final", "FINAL"), ("emblem_final_small", "FINAL, patch-size cut")]
    for i, (n, lab) in enumerate(names):
        paste(Image.open(os.path.join(OUT, n + ".png")), 60 + i * 505, y, 430)
        txt(d, (60 + i * 505, y + 450), lab, 26)
    # row 3: size ladder of the final at real pixel sizes, on suit white and on polo white
    y = 1170
    txt(d, (60, y), "Real pixels, from the SVGs: emblem_final at 128 · 64 px, emblem_final_small at 64 · 40 · 24 · 16 px", 28)
    x = 60
    for bg in [(244, 242, 236), (233, 226, 214)]:
        for s, nm in ((128, "emblem_final"), (64, "emblem_final"), (64, "emblem_final_small"), (40, "emblem_final_small"),
                      (24, "emblem_final_small"), (16, "emblem_final_small")):
            svg = emblem_svg(EMBLEMS[nm])
            tmp = os.path.join(OUT, f"_tmp_{s}.png"); svg_to_png(svg, tmp, size=s)
            im = Image.open(tmp); os.remove(tmp)
            box = Image.new("RGB", (s + 40, 168), bg); box.paste(im, (20, (168 - s) // 2), im)
            B.paste(box, (x, y + 50)); x += s + 52
        x += 60
    # row 4: seals
    y = 1450
    txt(d, (60, y), "SEALS (vermilion, carved characters only; strokes from public-domain Shuowen small-seal forms, no font)", 28)
    seals = [("seal_guanghan", "廣寒 station · 白文"), ("seal_guanghan_tall", "廣寒 tall"), ("seal_wangyue", "望月 film seal · 朱文 FINAL"),
             ("seal_wangyue_baiwen", "望月 · 白文 alt"), ("seal_wangmingyue", "望明月 · 朱文 alt")]
    x = 60
    for n, lab in seals:
        t = paste(Image.open(os.path.join(OUT, n + ".png")), x, y + 60, 440)
        txt(d, (x, y + 520), lab, 24)
        x += t.width + 70
    B.save(os.path.join(OUT, "IDENTITY_BOARD.jpg"), quality=92)


if __name__ == "__main__":
    board()
    print("board")
