#!/usr/bin/env python3
"""rev4 PHOTO (Oct 8): restrict the roto redraw of a prepped take to a region; everywhere else the painting persists.

The opposite of tools/roto_force.py. Why: a video model lets fine gold lines on a wall shimmer and the edges of a
taped print creep by a fraction of a pixel; roto_prep reads that as motion, and the wall and the print are then redrawn
from the take and boil (J_4.3p/take_1s: motion mask 0.75 of the frame although only the astronaut moves). This
multiplies mask.png (frame-0 px) and every s_%04d.png (frame-i px) by the polygon(s), so only what is inside can be
redrawn from the take.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/roto_only.py J_4.3p/take_1s --region "x,y x,y ..." [--region "..."] [--feather 6]

  --region  polygon in ROTO WORK px (meta.w x meta.h; roto/<take>/key.jpg is 2x that). Camera assumed locked.
  --feather Gaussian sigma (work px) of the edge, inward (outside the polygon the mattes are exactly 0).
Run AFTER tools/roto_prep.py (which rewrites the mattes) and BEFORE tools/roto_keep.py. Records meta.json["only"].
"""
import argparse
import json
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--region", action="append", required=True)
    ap.add_argument("--feather", type=float, default=6.0)
    a = ap.parse_args()
    shot, take = a.clip.split("/")
    rdir = os.path.join(ROOT, "media", "gen", shot, "roto", take)
    meta = json.load(open(os.path.join(rdir, "meta.json")))
    W, H, N = meta["w"], meta["h"], meta["frames"]
    if not meta.get("locked", False):
        print("warning: camera not locked; the polygon is applied in frame px all the same")
    polys = [np.array([[float(v) for v in p.split(",")] for p in r.split()], np.float32) for r in a.region]
    m = np.zeros((H, W), np.float32)
    for p in polys:
        cv2.fillPoly(m, [p.astype(np.int32)], 1.0)
    if a.feather > 0:
        k = int(a.feather * 2) | 1
        m = np.minimum(m, cv2.GaussianBlur(cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))), (0, 0), a.feather))
    names = ["mask.png"] + [f"s_{i:04d}.png" for i in range(N)]
    n = 0
    for nm in names:
        p = os.path.join(rdir, nm)
        im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
        if im is None:
            continue
        f = m if im.shape[:2] == m.shape else cv2.resize(m, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_LINEAR)
        out = (im.astype(np.float32) * (f if im.ndim == 2 else f[..., None])).round().astype(np.uint8)
        cv2.imwrite(p, out, [cv2.IMWRITE_PNG_COMPRESSION, 4])
        n += 1
    meta["only"] = {"regions": [p.round(1).tolist() for p in polys], "feather": a.feather}
    json.dump(meta, open(os.path.join(rdir, "meta.json"), "w"))
    print(f"{a.clip}: redraw limited to {len(polys)} region(s), {n} mattes rewritten; mask coverage now "
          f"{cv2.imread(os.path.join(rdir, 'mask.png'), 0).mean() / 255:.3f}")
