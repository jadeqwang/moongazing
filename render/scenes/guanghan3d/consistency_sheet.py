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
    ("K_1.5", "1.5_line", "PASS", "NEW. 6 tall masts outside the mounds; 6 mounds; ONE squat hub with its cupola (codex flagged a doubled, oversized tower; fixed). Warm portholes on the tunnels and the S node. Earth composited at G-N (000, +1.5°, 1.9°), gibbous, lit from the left (Sun 250°). Minor: the mounds read lit grey, not fully in terrain shadow."),
    ("K_5.2", "5.2_line", "PASS", "NEW. Cross of 4 tunnels, hub at the crossing, 6 mounds, 6 masts on the r 55 ring with panels on the upper half (fixed after review), comms tower with dish NNW, roads E (pad) and S (reactor). The masts are drawn standing (jiehua convention)."),
    ("K_6.2ii", "6.2_line", "FAIL", "NOT TOUCHED (per brief). Correct: the base is behind-left of camera, so none in frame. WRONG: Earth is ~150 px (6.2ii) / ~165 px (6.2i) across, vs ~92 px for 1.9° at the guide's 55° HFOV, so 1.6–1.8× too big. Recomposite at d≈92 px. 6.2iii (visor) passes."),
    ("K_7.A", "7.A_line", "MINOR", "User-approved master; v2 is an edit (original kept as K_7.A_v1). Mast ring (6), pad upper-left, reactor + ridge upper-right are canonical; panels raised to the upper half on 5 of 6 masts. Still differs: the front mast panel is long, the tower is drawn beside the tunnel crossing, and there is no comms tower."),
    ("K_7.A1", "7.A1_line", "PASS", "NEW. Stage 1: graded footprints (cross + 6 ovals), masts M2/M3 up, 4 tripod feet, printer, cargo lander far left, reactor stakes far right (codex: PASS)."),
    ("K_7.A2", "7.A2_line", "MINOR", "NEW. Stage 2: vessels + tunnels landed, shells at mixed heights, gantry printer, shuttered dome, folded fins, no pad; humans replaced by robots and the duplicate reactor removed after review. Minor: 5–6 masts already full height (spec: M4/M6 telescoping)."),
    ("K_7.A3", "7.A3_line", "PASS", "NEW. Stage 3: 6 hatched mounds, 6 masts, crew lander far left, parked printer, single reactor ridge; fins re-edited to half open and the dome to shutters after review."),
    ("K_7.A4", "7.A4_line", "PASS", "NEW. Stage 4: pad half-glazed with laser rover, fins fully open, cupola open, 6 masts, 6 mounds. The 'dog' codex saw is a Yutu rabbit robot. Grade all stages to K_7.A's indigo in post (A2/A3 paper is more violet)."),
    ("K_7.B1", "7.B1_line", "PASS", "Untouched. PSR crater floor 700 m SW; the guide confirms the crater wall hides the base."),
    ("K_7.B2", "7.B2_line", "MINOR", "NEW (edit of v1). ISRU hall = printed barrel vault with layer courses, strip light, hopper + conveyor, O₂ tanks; suit gloves fit an unpressurised hall. The ceiling/pipe-wall join was softened after review but still reads as a horizontal break."),
    ("K_7.C4", "7.C4_line", "PASS", "NEW (room redrawn on the 8-crew v2). Horizontal ribbed cylinder, ring frames, ceiling strip, ROUND hub hatch behind the group; table for 8 (codex: PASS)."),
    ("K_7.E1", "7.E1_line", "PASS", "NEW. Cupola looking north: N tunnel → N node (hatch now faces away, fixed), NE/NW mounds, masts M6/M1 with two wings, comms tower left, low Malapert range, Earth composited at G-N, near-full (Sun 200°). Note: the real sill would hide most of the N tunnel; kept for readability."),
    (None, "7.C6_flat", "GUIDE", "No keyframe yet. Hub deck 2 north window: N tunnel + N node below, Earth above; tea cup on the sill."),
    (None, "7.D2_flat", "GUIDE", "No keyframe yet. Galley outer end: Jade at the wall screen; table between camera and screen."),
    (None, "7.B6_flat", "GUIDE", "No keyframe yet. Lights coming on: base in terrain shadow, mast panels above 10 m still sunlit."),
    (None, "7.E2b_flat", "GUIDE", "Pull-back step 2 (JS): pad 2 km E, reactor 1 km S, PSR crater 700 m SW, Shackleton rim to the E."),
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
    d.text((14, 12), "Guanghan Station — consistency sheet (guide | keyframe | verdict).  Canon: docs/guanghan_layout.md", fill="black", font=font(30))
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
