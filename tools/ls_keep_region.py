#!/usr/bin/env python3
"""Upper-face polygon (glasses, eyes, brows, nose) of a prepped take's frame 0, for tools/roto_keep.py --region (rev2_ls).
The painted keyframe's eyes and glasses then ride on the take as the painting itself; the mouth, jaw and chin below
are redrawn from the take.   $MPY tools/ls_keep_region.py LS3c/take_2m   -> prints "x,y x,y ..." (work-frame px)"""
import json
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools", "sync"))
import mouth as mouthmod  # noqa: E402


def region(clip, nose=True):
    shot, take = clip.split("/")
    meta = json.load(open(os.path.join(ROOT, "media/gen", shot, "roto", take, "meta.json")))
    f0 = cv2.imread(os.path.join(ROOT, "media/gen", shot, "frames", take, "f_0000.jpg"))
    f0 = cv2.resize(f0, (meta["w"], meta["h"]), interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(f0, cv2.COLOR_BGR2RGB)
    hit = None
    for b in mouthmod.grid_boxes(meta["w"], meta["h"]):
        hit = mouthmod.detect(rgb, b)
        if hit is not None:
            break
    if hit is None:
        raise SystemExit("no face in frame 0")
    L = hit[0]
    a, b = L[33], L[263]                      # outer eye corners
    c, w = (a + b) / 2, float(np.linalg.norm(b - a))
    u = (b - a) / w; v = np.array([-u[1], u[0]])    # along the eyes, down the face
    P = lambda x, y: c + u * x * w + v * y * w
    pts = [P(-0.95, -0.50), P(0.95, -0.50), P(0.95, 0.33), P(0.34, 0.36)]
    if nose:
        nb = float(np.dot(L[2] - c, v)) / w + 0.06   # just under the nose base (landmark 2)
        pts += [P(0.27, nb), P(-0.27, nb)]
    pts += [P(-0.34, 0.36), P(-0.95, 0.33)]
    return np.array(pts), L


if __name__ == "__main__":
    pts, L = region(sys.argv[1], nose="--no-nose" not in sys.argv)
    print(" ".join(f"{x:.0f},{y:.0f}" for x, y in pts))
