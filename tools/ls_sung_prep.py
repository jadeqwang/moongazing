#!/usr/bin/env python3
"""rev2_ls: one command from a collected sung take to a roto folder that keeps the take's own mouth.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/ls_sung_prep.py LS3c/take_2 [--alpha 1.0] [--teeth 0.42] [--no-keep]

Steps (each tool's header says what it does):
  1. tools/ls_mouth_treat.py   teeth -> one pale band, tongue/cavity -> the face's dark ground; the painted keyframe's
                               upper face (glasses, eyes, brows, nose) laid over every frame, moved with the head
                               => <take>m.mp4
  2. tools/roto_prep.py        prep(<take>m, remouth=False, eyelock=False, alpha=ALPHA, force=True)
                               remouth=False: the take's own lips are drawn (no JS mouth). alpha 1.0: no temporal
                               filtering of the guides, so a 3-frame closure (the "s" of 思) is not smeared.
  3. (only with --keep) tools/roto_keep.py: the same upper-face region shown by the shader as the PAINTING itself. Not the
     default: the kept painting keeps its own navy ground and reads as a tinted band across the gold redraw
     (render/out/rev2_ls/takes/LS3c_2/roto_strip_a.jpg); baking the region into the take (step 1) redraws it like
     everything else.
"""
import argparse
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--alpha", type=float, default=1.0)
    ap.add_argument("--teeth", type=float, default=0.3)
    ap.add_argument("--keep", action="store_true")
    ap.add_argument("--no-nose", action="store_true")
    ap.add_argument("--smooth", type=float, default=1.5)
    ap.add_argument("--out")
    a = ap.parse_args()
    import ls_mouth_treat
    import roto_prep
    shot, take = a.clip.split("/")
    out = a.out or os.path.join(ROOT, "render/out/rev2_ls/takes", f"{shot}_{take.split('_')[1]}")
    os.makedirs(out, exist_ok=True)
    m = ls_mouth_treat.run(a.clip, None, a.teeth, os.path.join(out, "treat_sheet.jpg"), carry=not a.keep, nose=not a.no_nose)
    roto_prep.prep(m, remouth=False, eyelock=False, alpha=a.alpha, force=True)
    if a.keep:
        import ls_keep_region
        pts, _ = ls_keep_region.region(m, nose=not a.no_nose)
        reg = " ".join(f"{x:.0f},{y:.0f}" for x, y in pts)
        subprocess.run([sys.executable, os.path.join(ROOT, "tools/roto_keep.py"), m, "--region", reg, "--feather", "6",
                        "--smooth", str(a.smooth), "--debug", os.path.join(out, "keep_debug.jpg")], check=True)
    print("ready:", m)
