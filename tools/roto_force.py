#!/usr/bin/env python3
"""rev3_face (Oct 8): force the roto redraw inside a region of a prepped take.

Why: the roto shader shows the painted keyframe wherever the motion mask (mask.png) and the per-drawing subject matte
(s_%04d.png) are low. When a limb drifts slowly away from where the painting has it, the vacated strip can fall on the
soft edge of both mattes: the PAINTED limb then stays behind as a stub while the redrawn limb moves on (4.7: the tip of
her left elbow stayed below the arm and smeared). This sets both mattes to 1 inside the given polygon(s), so that
whatever the take shows there, limb or wall, is what is drawn.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/roto_force.py K_4.7/take_4 --region "x,y x,y ..." [--region "..."] [--feather 6]

  --region  polygon in ROTO WORK px (meta.w x meta.h; roto/<take>/key.jpg is 2x that). The camera is assumed locked
            (meta.locked), so one polygon serves mask.png (frame-0 px) and every s_%04d.png (frame-i px).
  --feather Gaussian sigma (work px) of the edge, outward (the polygon itself is fully forced).
Run AFTER tools/roto_prep.py (which rewrites the mattes) and record: meta.json["force"] = {regions, feather}.
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
        m = np.maximum(m, cv2.GaussianBlur(cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))), (0, 0), a.feather))
    f8 = (np.clip(m, 0, 1) * 255).round().astype(np.uint8)
    names = ["mask.png"] + [f"s_{i:04d}.png" for i in range(N)]
    n = 0
    for nm in names:
        p = os.path.join(rdir, nm)
        im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
        if im is None:
            continue
        f = f8 if im.shape[:2] == f8.shape else cv2.resize(f8, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_LINEAR)
        out = np.maximum(im, f if im.ndim == 2 else f[..., None])
        cv2.imwrite(p, out, [cv2.IMWRITE_PNG_COMPRESSION, 4])
        n += 1
    meta["force"] = {"regions": [p.round(1).tolist() for p in polys], "feather": a.feather}
    json.dump(meta, open(os.path.join(rdir, "meta.json"), "w"))
    print(f"{a.clip}: forced redraw in {len(polys)} region(s), {n} mattes rewritten")
