#!/usr/bin/env python3
"""Build media/guanghan/CONSISTENCY_SHEET.jpg: every moonbase keyframe next to its 3D guide, with a verdict.
    .venv/bin/python render/scenes/guanghan3d/consistency_sheet.py"""
import os, textwrap
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
G, K = os.path.join(ROOT, "media/guanghan/guides/"), os.path.join(ROOT, "media/keyframes/")
TW, TH, TXT = 640, 360, 760

# (frame or None, guide, verdict, notes)
ROWS = [
    ("K_1.5", "1.5_line", "PASS", "r2: base now in deep terrain shadow; 6 tall masts outside the mounds; one squat hub + cupola; warm portholes; mast panels and dome top sunlit. Earth at G-N, 1.9°, gibbous (Sun 250°)."),
    ("K_4.7", "4.7_line", "PASS", "NEW. Orion-class cabin after TLI: Jade from behind, ponytail floating, toasts the small Moon in the side window; toy Earth floats. Minor: Moon a little larger than 0.5°."),
    ("K_5.2", "5.2_line", "PASS", "Plan: cross, hub at the crossing, 6 mounds, 6 masts (panels on the upper half), comms NNW, roads E/S."),
    ("K_5.4", "5.4_line", "PASS", "NEW. Jade (back) at the S lip of the plateau 460 m SE of the hub; base small at left (stage-3 look); Earth composited at G-N on the horizon at right; shadow points away (Sun behind)."),
    ("K_6.2i", "6.2_line", "PASS", "r2: Earth recomposited at 1.9° (~95 px; was 166 px): dark disc, faint night side, slightly thicker blue-white lower crescent. Base behind camera, correctly absent."),
    ("K_6.2ii", "6.2_line", "PASS", "r2: Earth at 1.9° (~92 px; was 150). Base correctly absent."),
    ("K_7.A", "7.A_line", "PASS", "r2: tower now ON the tunnel crossing, comms tower NNW added, graded to K_7.A_v1 indigo (original kept as K_7.A_v1). Minor: one mast panel still long."),
    ("K_7.A1", "7.A1_line", "PASS", "Stage 1: footprints, 2 masts + 4 feet, printer, cargo lander, reactor stakes. Graded."),
    ("K_7.A2", "7.A2_line", "PASS", "r2: two masts telescoping/half-folded; shells printing; folded fins; no pad; robots only. Graded."),
    ("K_7.A3", "7.A3_line", "PASS", "Stage 3: 6 mounds, 6 masts, half-open fins, crew lander. Graded."),
    ("K_7.A4", "7.A4_line", "PASS", "Stage 4: pad half-glazed, fins open, cupola open. Graded."),
    ("K_7.B1", "7.B1_line", "PASS", "PSR crater floor; base hidden by the crater wall."),
    ("K_7.B2", "7.B2_line", "PASS", "r2: regenerated as one continuous printed vault (no seam): gloves on the valve, ember port, tanks, hopper/conveyor beyond."),
    ("K_7.B3", "7.B3_line", "PASS", "NEW. Greenhouse = SW module (cylinder, tiered trays, glove-port chamber); Lúcia (pink collar stripe); rosette is the only green."),
    ("K_7.B4", "7.B4_line", "MINOR", "NEW. Shackleton floor, rover lamp only, rim lit far above, no Sun/Earth. Minor: film strips curve instead of running straight."),
    ("K_7.B6", "7.B6_line", "MINOR", "NEW. Base in shadow, windows lighting up, panels sunlit. Minor: mounds read as smooth domes; mast count ~6 (2 overlap)."),
    ("K_7.C1_moon", "7.C1m_line", "PASS", "NEW. Galley (NE cylinder), Jade from behind at the table; laptop shows M and T as in K_7.C1_earth."),
    ("K_7.C4", "7.C4_line", "PASS", "Galley cylinder, round hub hatch, 8 crew."),
    ("K_7.C6", "7.C6_line", "PASS", "NEW. Hub L2 arched north window: N tunnel + node below, Earth composited above the far range; celadon cup on the sill; Jade lost profile only."),
    ("K_7.D2_room", "7.D2_line", "PASS", "NEW. Galley outer end: lockers, ring frames, wall screen with the livestream; Jade (back) touching it — matches the module and J_7.D2's screen."),
    ("K_7.E1", "7.E1_line", "PASS", "Cupola north view: N tunnel → node, NE/NW mounds, M6/M1, comms, Earth over Malapert."),
]
COL = {"PASS": (60, 140, 80), "MINOR": (200, 140, 30), "FAIL": (190, 50, 40), "GUIDE": (90, 90, 90)}


def font(sz):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/TTF/DejaVuSans.ttf"]:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def thumb(path):
    im = Image.open(path).convert("RGB"); im.thumbnail((TW, TH)); c = Image.new("RGB", (TW, TH), (235, 235, 235)); c.paste(im, ((TW - im.width) // 2, (TH - im.height) // 2)); return c


def main(rows=ROWS, out=os.path.join(ROOT, "media/guanghan/CONSISTENCY_SHEET.jpg")):
    W = TW * 2 + TXT + 40; RH = TH + 20; H = 90 + RH * len(rows)
    sheet = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(sheet)
    d.text((14, 12), "Guanghan Station — consistency sheet v2 (guide | keyframe | verdict).  Canon: docs/guanghan_layout.md", fill="black", font=font(30))
    d.text((14, 52), "Count check: 6 masts (2 wings, outside the mounds) · 6 mounds · hub+cupola at the crossing · 4 tunnels · N/S nodes · comms tower NNW · Earth at G-N", fill=(80, 80, 80), font=font(20))
    f, fb = font(21), font(30)
    for i, (frame, guide, verdict, note) in enumerate(rows):
        y = 90 + i * RH
        sheet.paste(thumb(G + guide + ".png"), (10, y))
        if frame: sheet.paste(thumb(K + frame + ".jpg"), (20 + TW, y))
        else: d.rectangle((20 + TW, y, 20 + 2 * TW, y + TH), fill=(245, 245, 245)); d.text((40 + TW, y + TH // 2 - 15), "(no keyframe yet)", fill=(120, 120, 120), font=fb)
        x = 30 + 2 * TW
        d.text((x, y + 4), f"{frame or guide.split('_')[0]}   ", fill="black", font=fb)
        d.text((x + 260, y + 4), verdict, fill=COL[verdict], font=fb)
        d.text((x, y + 44), f"guide: {guide}.png", fill=(110, 110, 110), font=font(18))
        for j, line in enumerate(textwrap.wrap(note, 62)): d.text((x, y + 74 + j * 26), line, fill="black", font=f)
    sheet.save(out, quality=88); print("ok", out, sheet.size)


if __name__ == "__main__":
    main()
