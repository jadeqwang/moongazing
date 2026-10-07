#!/usr/bin/env python3
"""Copy the chosen character-sheet takes to canonical SHEET*.jpg names, normalising the silk ground to #E9DCC0
(per-channel gain from the median border colour), then build media/chars/CAST_BOARD.jpg. Run from repo root."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SILK = np.array([233, 220, 192], np.float32)
PICKS = [  # (canonical out, source take, board label)
    ("mei/SHEET.jpg", "mei/mei_grok_v2.png", "MEI · 4 · strawberry dress"),
    ("mei/SHEET_change.jpg", "mei/mei_change_grok_v3.png", "MEI · Chang'e school-play costume"),
    ("bao/SHEET.jpg", "bao/bao_grok_v3b.png", "BAO · 7 · toy Earth"),
    ("kids/SHEET.jpg", "kids/kids_gpt_v3.jpg", "MEI + BAO · Copernican lesson"),
    ("kenton/SHEET.jpg", "kenton/kenton_gpt_v2.jpg", "KENTON · father (never the face)"),
    ("jade_suit/SHEET.jpg", "jade_suit/eva_gpt_v2.jpg", "JADE · lunar EVA suit (visor down)"),
    ("jade_suit/SHEET_iva.jpg", "jade_suit/iva_gpt_v2.jpg", "JADE · launch-and-entry suit"),
    ("jade_suit/SHEET_casual.jpg", "jade_suit/casual_gpt_v1.jpg", "JADE · West Lake winter (from behind)"),
    ("crew/SHEET.jpg", "crew/crew_grok_v3b.png", "CREW · Guanghan Station (EVA, visors up)"),
    ("crew/SHEET_polo.jpg", "crew/crew_polo_grok_v3.png", "CREW · galley polos"),
    ("robots/SHEET.jpg", "robots/rovers_gpt_v1.jpg", "YUTU-A / YUTU-B · jade-rabbit rovers"),
    ("robots/SHEET_printer.jpg", "robots/printer_grok_v2.png", "REGOLITH PRINTER + HUMANOID HELPER"),
    ("robots/SHEET_dog.jpg", "robots/dog_gpt_v1.jpg", "ROBOT DOG (Earth)"),
    ("props/SHEET.jpg", "props/props_gpt_v1.jpg", "PROPS · toy Earth · toy Moon · celadon cup · flashlight"),
]
D = "media/chars"


def normalise(im):
    a = np.asarray(im.convert("RGB"), np.float32)
    h, w, _ = a.shape
    b = max(4, int(min(h, w) * 0.03))
    border = np.concatenate([a[:b].reshape(-1, 3), a[-b:].reshape(-1, 3), a[:, :b].reshape(-1, 3), a[:, -b:].reshape(-1, 3)])
    gain = SILK / np.median(border, axis=0)
    # apply the gain fully on light (ground-like) pixels, fading to none on dark ink so lines stay neutral
    lum = a.mean(axis=2, keepdims=True) / 255.0
    wgt = np.clip((lum - 0.25) / 0.5, 0, 1)
    out = a * (1 + (gain - 1) * wgt)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def font(sz, cjk=False):
    if cjk and os.path.exists("/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"):
        return ImageFont.truetype("/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf", sz)
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"]:
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def draw_mixed(d, xy, text, sz, fill=(27, 27, 31)):
    """Latin runs in the serif, CJK runs in the CJK fallback font."""
    import itertools
    x, y = xy
    for is_cjk, run in itertools.groupby(text, key=lambda ch: ord(ch) > 0x2E80):
        run = "".join(run); f = font(sz, cjk=is_cjk)
        d.text((x, y - (1 if is_cjk else 0)), run, font=f, fill=fill)
        x += d.textlength(run, font=f)


def main():
    tiles = []
    for out, src, label in PICKS:
        im = Image.open(os.path.join(D, src))
        im = normalise(im)
        if im.width > 2560:
            im = im.resize((2560, round(im.height * 2560 / im.width)), Image.LANCZOS)
        im.save(os.path.join(D, out), quality=93)
        tiles.append((im, label))
        print("wrote", out, im.size)
    # board: 3 columns of 3:2 tiles + a seal tile
    TW, TH, PAD, LAB = 900, 600, 28, 46
    cols = 3
    seal = Image.open(os.path.join(D, "seal/seal_dot.png")); seal2 = Image.open(os.path.join(D, "seal/seal_guanghan.png"))
    n = len(tiles) + 1
    rows = (n + cols - 1) // cols
    HEAD = 150
    W = cols * TW + (cols + 1) * PAD
    H = HEAD + rows * (TH + LAB + PAD) + PAD
    board = Image.new("RGB", (W, H), (233, 220, 192))
    d = ImageDraw.Draw(board)
    d.text((PAD, 40), "MOONGAZING  ·  CAST & DESIGN BOARD", font=font(56), fill=(27, 27, 31))
    d.text((PAD, 108), "gongbi on silk · canonical sheets in media/chars/<name>/SHEET*.jpg · see docs/character_bible.md",
           font=font(26), fill=(90, 80, 66))
    sl = seal.copy(); sl.thumbnail((110, 110)); board.paste(sl, (W - PAD - 110, 24), sl)
    for i, (im, label) in enumerate(tiles + [(None, "AGENCY SEAL · pale blue dot  /  廣寒 Guanghan (九叠篆 seal script)")]):
        r, c = divmod(i, cols)
        x = PAD + c * (TW + PAD); y = HEAD + r * (TH + LAB + PAD)
        if im is None:
            t = Image.new("RGB", (TW, TH), (233, 220, 192))
            a = seal.copy(); a.thumbnail((440, 440)); t.paste(a, (80, 80), a)
            b = seal2.copy(); b.thumbnail((440, 440)); t.paste(b, (600, 80), b)
        else:
            t = im.copy(); t.thumbnail((TW, TH), Image.LANCZOS)
            bg = Image.new("RGB", (TW, TH), (233, 220, 192)); bg.paste(t, ((TW - t.width) // 2, (TH - t.height) // 2)); t = bg
        board.paste(t, (x, y))
        d.rectangle([x, y, x + TW - 1, y + TH - 1], outline=(150, 135, 110), width=1)
        d.rectangle([x, y + TH + 8, x + 16, y + TH + 24], fill=(200, 49, 43))
        draw_mixed(d, (x + 26, y + TH + 4), label, 24)
    board.save(os.path.join(D, "CAST_BOARD.jpg"), quality=90)
    print("board", board.size)


if __name__ == "__main__":
    main()
