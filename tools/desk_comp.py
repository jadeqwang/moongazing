#!/usr/bin/env python3
"""Shot 3.6e (Jade at her desk, 03:00): believable content on the laptop screen and the open page.

The roto key of J_3.6e/<take> (the plate that shows wherever nothing moves: the laptop and the far notebook page) had
the same orbit doodle three times. This draws, typesets and composites in ink:
  * laptop screen: a PDF viewer with a two-column paper set in Latin Modern (title, abstract, a trajectory figure) and
    a small music player in the bottom-right corner;
  * far page: a textbook page on the Hohmann transfer (figure, vis-viva, the two burns, a translunar example whose
    numbers are right: 200 km parking orbit, dv1 = 3.13 km/s, 4.98 d).
The near page stays her own pencil sketch (she is writing on it; it is redrawn from the take).

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/desk_comp.py [J_3.6e/take_2] [--preview DIR]

Reads roto/<take>/key_orig.jpg (made from key.jpg on the first run) and rewrites roto/<take>/key.jpg. Run it again
after any tools/roto_prep.py of that take (prep rewrites key.jpg; delete key_orig.jpg first in that case).
Quads are in key.jpg pixels (2560x1440) and belong to take_2's frame 0.
"""
import io
import os
import sys
import textwrap

import cv2
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LM = "/usr/share/texmf/fonts/opentype/public/lm/"
F = {"r": LM + "lmroman10-regular.otf", "b": LM + "lmroman10-bold.otf", "i": LM + "lmroman10-italic.otf",
     "sc": LM + "lmromancaps10-regular.otf", "ss": LM + "lmsans10-regular.otf", "ssb": LM + "lmsans10-bold.otf"}
for p in F.values():
    if os.path.exists(p):
        font_manager.fontManager.addfont(p)
plt.rcParams.update({"font.family": "Latin Modern Roman", "mathtext.fontset": "cm", "axes.unicode_minus": False})

# key.jpg px: TL, TR, BR, BL of the content as it should read
SCREEN = [(1209, 765), (1592, 822), (1512, 1134), (1119, 1021)]
# the far page, read from Jade's seat (she faces frame-right: the page's top is its frame-right edge)
PAGE = [(957, 1033), (1253, 1151), (794, 1267), (548, 1102)]
INK = (38, 36, 34)


def font(k, size):
    return ImageFont.truetype(F[k] if os.path.exists(F[k]) else F["r"], size)


def justify(d, text, x, y, w, f, lead, fill=INK, last_ragged=True, indent=0):
    """LaTeX-like justified paragraph; returns the y after it."""
    words, lines, cur, first = text.split(), [], [], True
    for wd in words:
        avail = w - (indent if first else 0)
        if cur and f.getlength(" ".join(cur + [wd])) > avail:
            lines.append((cur, first)); cur = [wd]; first = False
        else:
            cur.append(wd)
    lines.append((cur, first))
    for k, (ln, fst) in enumerate(lines):
        x0 = x + (indent if fst else 0)
        avail = w - (indent if fst else 0)
        if k == len(lines) - 1 and last_ragged or len(ln) == 1:
            d.text((x0, y), " ".join(ln), font=f, fill=fill)
        else:
            gap = (avail - sum(f.getlength(wd) for wd in ln)) / (len(ln) - 1)
            xx = x0
            for wd in ln:
                d.text((xx, y), wd, font=f, fill=fill); xx += f.getlength(wd) + gap
        y += lead
    return y


def fig_to_img(fig, dpi):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=dpi, transparent=False, facecolor="white")
    plt.close(fig)
    return Image.open(buf).convert("RGB")


def math_img(tex, size, dpi=200):
    fig = plt.figure(figsize=(0.1, 0.1))
    fig.text(0, 0, tex, fontsize=size, color=np.array(INK) / 255)
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=dpi, bbox_inches="tight", pad_inches=0.02, facecolor="white")
    plt.close(fig)
    return Image.open(buf).convert("RGB")


def hohmann_figure(w_in, h_in, dpi):
    fig = plt.figure(figsize=(w_in, h_in))
    ax = fig.add_axes([0.02, 0.02, 0.96, 0.96]); ax.set_aspect("equal"); ax.axis("off")
    c = np.array(INK) / 255
    th = np.linspace(0, 2 * np.pi, 400)
    r1, r2 = 1.0, 2.55
    ax.plot(r1 * np.cos(th), r1 * np.sin(th), color=c, lw=2.2)
    ax.plot(r2 * np.cos(th), r2 * np.sin(th), color=c, lw=2.2)
    a = (r1 + r2) / 2; e = (r2 - r1) / (r2 + r1)
    nu = np.linspace(0, np.pi, 200); r = a * (1 - e * e) / (1 + e * np.cos(nu))
    ax.plot(r * np.cos(nu), r * np.sin(nu), color=c, lw=3.4)                       # the half that is flown
    ax.plot(r * np.cos(-nu), r * np.sin(-nu), color=c, lw=1.8, ls=(0, (5, 4)))
    ax.add_patch(plt.Circle((0, 0), 0.3, color=c * 1.6 + 0.2, ec=c, lw=2))
    ax.plot([-r2, r1], [0, 0], color=c, lw=1.0, ls=(0, (2, 3)))
    kw = dict(arrowprops=dict(arrowstyle="-|>", color=c, lw=2.6, mutation_scale=22), annotation_clip=False)
    ax.annotate("", xy=(r1, 0.95), xytext=(r1, 0.0), **kw)
    ax.annotate("", xy=(-r2, -0.8), xytext=(-r2, 0.0), **kw)
    ax.plot([r1, -r2], [0, 0], "o", color=c, ms=8)
    ax.text(r1 + 0.12, 0.55, r"$\Delta v_1$", fontsize=21, color=c)
    ax.text(-r2 + 0.14, -0.72, r"$\Delta v_2$", fontsize=21, color=c)
    ax.text(0.48, -0.36, r"$r_1$", fontsize=19, color=c)
    ax.text(-1.75, 0.1, r"$r_2$", fontsize=19, color=c)
    ax.text(0.2, 1.72, r"$a=\frac{r_1+r_2}{2}$", fontsize=18, color=c)
    ax.set_xlim(-r2 - 0.25, r2 + 0.25); ax.set_ylim(-r2 - 0.2, r2 + 0.2)
    return fig_to_img(fig, dpi)


def blt_figure(w_in, h_in, dpi):
    """A ballistic lunar transfer in the Earth-centred frame: out to ~1.4e6 km, falling back to the Moon's orbit."""
    fig = plt.figure(figsize=(w_in, h_in))
    ax = fig.add_axes([0.16, 0.17, 0.8, 0.79]); ax.set_aspect("equal")
    c = np.array(INK) / 255
    th = np.linspace(0, 2 * np.pi, 300)
    ax.plot(0.384 * np.cos(th), 0.384 * np.sin(th), color=c, lw=1.6, ls=(0, (4, 3)))
    s = np.linspace(0, 1, 300)
    x = 1.38 * np.sin(np.pi * s) ** 0.9 * np.cos(0.35 + 1.5 * (s - 0.5)) + 0.0
    y = 1.05 * np.sin(np.pi * s) ** 0.9 * np.sin(0.35 + 2.3 * (s - 0.5)) + 0.384 * s * np.sin(0.9)
    ax.plot(x, y, color=c, lw=2.6)
    ax.plot([0], [0], "o", color=c, ms=9); ax.plot([x[-1]], [y[-1]], "o", color=c, ms=6, mfc="white", mew=2)
    ax.set_xlabel(r"$x$  [$10^6$ km]", fontsize=15, color=c); ax.set_ylabel(r"$y$  [$10^6$ km]", fontsize=15, color=c)
    ax.tick_params(labelsize=12, colors=c, width=1.2); ax.set_xticks([0, 0.5, 1.0, 1.5]); ax.set_yticks([-0.5, 0, 0.5, 1.0])
    for sp in ax.spines.values():
        sp.set_color(c); sp.set_linewidth(1.3)
    ax.set_xlim(-0.5, 1.6); ax.set_ylim(-0.75, 1.15)
    return fig_to_img(fig, dpi)


def paste_mul(canvas, img, x, y, w=None):
    if w:
        img = img.resize((int(w), int(round(img.height * w / img.width))), Image.LANCZOS)
    a = np.asarray(canvas.crop((x, y, x + img.width, y + img.height))).astype(np.float32)
    b = np.asarray(img).astype(np.float32)[: a.shape[0], : a.shape[1]]
    canvas.paste(Image.fromarray((a[: b.shape[0], : b.shape[1]] * b / 255).astype(np.uint8)), (x, y))
    return img.height


def screen_content():
    W, H = 1280, 940
    im = Image.new("RGB", (W, H), (196, 196, 196))               # the viewer's grey desktop
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 46), fill=(150, 150, 150))
    for k in range(3):
        d.ellipse((18 + k * 30, 13, 38 + k * 30, 33), fill=(95, 95, 95))
    d.text((150, 9), "wang_blt_south_pole_v7.pdf", font=font("ss", 26), fill=(40, 40, 40))
    d.text((W - 190, 9), "1 / 14     125%", font=font("ss", 24), fill=(60, 60, 60))
    px0, px1 = 110, W - 110
    d.rectangle((px0, 66, px1, H), fill=(255, 255, 255))
    cx = (px0 + px1) // 2
    y = 108
    for ln in ["Ballistic Lunar Transfers and Station-Keeping", "Budgets for a South-Polar Surface Base"]:
        f = font("b", 43); d.text((cx - f.getlength(ln) / 2, y), ln, font=f, fill=INK); y += 54
    y += 10
    f = font("r", 25); ln = "International Moonbase Trajectory Working Group"
    d.text((cx - f.getlength(ln) / 2, y), ln, font=f, fill=INK); y += 34
    f = font("i", 21); ln = "Preprint, submitted to Acta Astronautica"
    d.text((cx - f.getlength(ln) / 2, y), ln, font=f, fill=INK); y += 46
    f = font("b", 23); d.text((cx - f.getlength("Abstract") / 2, y), "Abstract", font=f, fill=INK); y += 32
    y = justify(d, "We survey low-energy ballistic transfers from a 200 km parking orbit to a near-rectilinear halo orbit "
                   "serving a crewed base at the lunar south pole. Against a 4.98 day Hohmann-like transfer "
                   "(3.13 km/s at injection), the ballistic family trades 90 to 120 days of flight for a capture cost "
                   "below 30 m/s. We give annual station-keeping budgets, eclipse statistics and abort options for "
                   "each launch month of the first expedition.", px0 + 120, y, px1 - px0 - 240, font("r", 20), 25)
    y += 26
    colw = (px1 - px0 - 60 - 36) // 2
    xl, xr = px0 + 30, px0 + 30 + colw + 36
    d.text((xl, y), "1   Introduction", font=font("b", 25), fill=INK)
    yl = y + 38
    intro = ("A surface base that is resupplied a few times a year does not need its cargo to arrive quickly. It needs "
             "it to arrive cheaply and on a predictable day. Ballistic lunar transfers leave the Earth with slightly "
             "more than escape energy toward the weak stability boundary near 1.5 million km, where the Sun's tide "
             "raises perilune and turns the orbit plane at no cost in propellant. The spacecraft then falls back and "
             "is captured almost for free. The vis-viva relation fixes the injection burn; the geometry of the Sun, "
             "Earth and Moon at departure fixes everything else. Section 2 states the model. Section 3 maps the "
             "family of transfers by launch month, and Section 4 costs the orbit that waits above the pole.")
    justify(d, intro, xl, yl, colw, font("r", 19), 24, indent=22)
    fig = blt_figure(4.6, 3.6, 150)
    fh = paste_mul(im, fig, xr + 10, y - 4, colw - 20)
    justify(d, "Figure 1: A 104-day ballistic transfer in the Earth-centred inertial frame. Dashed: the Moon's orbit.",
            xr, y + fh + 2, colw, font("r", 17), 21)
    # music player, bottom-right corner
    bx, by, bw, bh = W - 430, H - 150, 410, 130
    d.rounded_rectangle((bx, by, bx + bw, by + bh), radius=22, fill=(66, 66, 66))
    d.rounded_rectangle((bx + 14, by + 14, bx + 116, by + 116), radius=12, fill=(28, 28, 28))
    d.ellipse((bx + 36, by + 36, bx + 94, by + 94), fill=(232, 232, 232))
    d.ellipse((bx + 52, by + 30, bx + 104, by + 82), fill=(28, 28, 28))                   # a waning crescent
    d.text((bx + 134, by + 14), "Clair de lune", font=font("ssb", 30), fill=(245, 245, 245))
    d.text((bx + 134, by + 52), "Claude Debussy", font=font("ss", 23), fill=(200, 200, 200))
    d.rounded_rectangle((bx + 134, by + 98, bx + 330, by + 104), radius=3, fill=(120, 120, 120))
    d.rounded_rectangle((bx + 134, by + 98, bx + 212, by + 104), radius=3, fill=(240, 240, 240))
    d.ellipse((bx + 205, by + 93, bx + 221, by + 109), fill=(240, 240, 240))
    d.rectangle((bx + 354, by + 82, bx + 363, by + 112), fill=(240, 240, 240))               # pause
    d.rectangle((bx + 372, by + 82, bx + 381, by + 112), fill=(240, 240, 240))
    return im


def page_content():
    W, H = 760, 1060
    im = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    m = 56
    d.text((m, 40), "278", font=font("r", 22), fill=INK)
    f = font("sc", 21); s = "Chapter 6   Orbital Maneuvers"
    d.text((W - m - f.getlength(s), 41), s, font=f, fill=INK)
    d.line((m, 72, W - m, 72), fill=INK, width=2)
    d.text((m, 92), "6.3   Hohmann transfers", font=font("b", 34), fill=INK)
    y = justify(d, "The most efficient two-impulse transfer between coplanar circular orbits follows an ellipse tangent "
                   "to both. Its speed anywhere on the way comes from the energy equation,", m, 146, W - 2 * m, font("r", 22), 28)
    eq = math_img(r"$v^2=\mu\left(\frac{2}{r}-\frac{1}{a}\right)$", 17)
    paste_mul(im, eq, (W - eq.width) // 2, y + 6); d.text((W - m - 62, y + 22), "(6.11)", font=font("r", 22), fill=INK)
    y += eq.height + 16
    fig = hohmann_figure(5.0, 4.6, 130)
    fw = 500; fh = paste_mul(im, fig, (W - fw) // 2, y, fw)
    y += fh + 2
    f = font("r", 20); s = "Figure 6.4  Hohmann transfer from radius r₁ to r₂."
    s = "Figure 6.4   Hohmann transfer between circular orbits."
    d.text(((W - f.getlength(s)) / 2, y), s, font=f, fill=INK); y += 38
    for tex, tag in [(r"$\Delta v_1=\sqrt{\frac{\mu}{r_1}}\left(\sqrt{\frac{2r_2}{r_1+r_2}}-1\right)$", "(6.12)"),
                     (r"$\Delta v_2=\sqrt{\frac{\mu}{r_2}}\left(1-\sqrt{\frac{2r_1}{r_1+r_2}}\right)$", "(6.13)")]:
        eq = math_img(tex, 16)
        paste_mul(im, eq, (W - eq.width) // 2, y); d.text((W - m - 62, y + eq.height // 2 - 12), tag, font=font("r", 22), fill=INK)
        y += eq.height + 12
    y += 4
    d.text((m, y), "Example 6.2", font=font("b", 22), fill=INK)
    justify(d, "Translunar injection from a 200 km parking orbit: a burn of 3.13 km/s, then 4.98 days of coasting.",
            m + 150, y, W - 2 * m - 150, font("r", 22), 28)
    return im


def composite(key, content, quad, opacity=0.92, soft=0.55, close=71):
    """Erase the old drawing inside the quad (keep the painted tone and its shading), then lay the content as ink."""
    h, w = key.shape[:2]
    q = np.array(quad, np.float32)
    m = np.zeros((h, w), np.uint8); cv2.fillConvexPoly(m, q.astype(np.int32), 255)
    m = cv2.erode(m, np.ones((5, 5), np.uint8))
    mf = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 1.6)[..., None]
    x0, y0, x1, y1 = [int(v) for v in (q[:, 0].min() - 90, q[:, 1].min() - 90, q[:, 0].max() + 90, q[:, 1].max() + 90)]
    x0, y0 = max(0, x0), max(0, y0)
    roi = key[y0:y1, x0:x1]
    # tone without the thin dark drawing: fill everything outside the quad with the quad's median first, so the
    # closing never drags the dark bezel / desk in
    mm = m[y0:y1, x0:x1] > 0
    filled = roi.copy(); filled[~mm] = np.median(roi[mm], 0)
    base = cv2.morphologyEx(filled, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close)))
    base = cv2.GaussianBlur(base, (0, 0), 9)
    # keep the paper's fine grain (high-pass of the original, clipped so no old line survives)
    hp = roi.astype(np.float32) - cv2.GaussianBlur(roi, (0, 0), 2.0).astype(np.float32)
    hp = roi.astype(np.float32) - cv2.GaussianBlur(roi, (0, 0), 0.9).astype(np.float32)
    base = np.clip(base.astype(np.float32) + np.clip(hp, -1.5, 1.5), 0, 255)
    cw, ch = content.size
    Hm = cv2.getPerspectiveTransform(np.array([[0, 0], [cw, 0], [cw, ch], [0, ch]], np.float32), q)
    c = cv2.cvtColor(np.asarray(content), cv2.COLOR_RGB2BGR)
    # area-averaged warp (the content is far larger than its footprint): blur by the minification first
    mini = max(1.0, cw / max(np.linalg.norm(q[1] - q[0]), 1.0))
    c = cv2.GaussianBlur(c, (0, 0), 0.42 * mini)
    wc = cv2.warpPerspective(c, Hm, (w, h), flags=cv2.INTER_LINEAR, borderValue=(255, 255, 255))[y0:y1, x0:x1].astype(np.float32) / 255
    if soft > 0:
        wc = cv2.GaussianBlur(wc, (0, 0), soft)
    wc = 1 - (1 - wc) * opacity
    out = base * wc
    a = mf[y0:y1, x0:x1]
    key[y0:y1, x0:x1] = np.clip(roi * (1 - a) + out * a, 0, 255).astype(np.uint8)
    return key


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    clip = args[0] if args else "J_3.6e/take_2"
    shot, take = clip.split("/")
    rdir = os.path.join(ROOT, "media", "gen", shot, "roto", take)
    orig = os.path.join(rdir, "key_orig.jpg")
    if not os.path.exists(orig):
        cv2.imwrite(orig, cv2.imread(os.path.join(rdir, "key.jpg")), [cv2.IMWRITE_JPEG_QUALITY, 97])
    key = cv2.imread(orig)
    scr, pg = screen_content(), page_content()
    if "--preview" in sys.argv:
        pd = sys.argv[sys.argv.index("--preview") + 1]
        os.makedirs(pd, exist_ok=True)
        scr.save(os.path.join(pd, "screen_content.png")); pg.save(os.path.join(pd, "page_content.png"))
    key = composite(key, scr, SCREEN, opacity=0.9, soft=0.45, close=91)
    key = composite(key, pg, PAGE, opacity=0.9, soft=0.45, close=91)
    cv2.imwrite(os.path.join(rdir, "key.jpg"), key, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print("wrote", os.path.join(rdir, "key.jpg"))


if __name__ == "__main__":
    main()
