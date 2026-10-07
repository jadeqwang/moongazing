#!/usr/bin/env python3
"""First-frame fidelity: does take_N.mp4 actually start on its keyframe? Pearson r of 96x54 grey thumbnails of the
keyframe and the clip's frame 0 (after fitting the keyframe to the clip's aspect by centre-crop). r < 0.85 means the
model reframed / zoomed / cropped, so roto must re-register to the keyframe. Writes "ff_r" into each sidecar.
    .venv/bin/python tools/ffcheck.py [SHOT ...]
"""
import glob, json, os, sys
import av
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def thumb(im, ar):
    im = im.convert("L")
    w, h = im.size
    if w / h > ar:
        nw = int(h * ar); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / ar); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return np.asarray(im.resize((96, 54)), float).ravel()


def main(shots):
    for p in sorted(glob.glob(os.path.join(ROOT, "media/gen/*/take_*.json"))):
        if p.endswith((".spec.json", ".sync.json", ".mouth.json")):
            continue
        d = json.load(open(p))
        if shots and d["shot"] not in shots or d.get("state") != "done":
            continue
        with av.open(os.path.join(ROOT, d["file"])) as c:
            f0 = next(c.decode(video=0)).to_image()
        ar = f0.width / f0.height
        k = Image.open(os.path.join(ROOT, d["first_frame"]))
        r = float(np.corrcoef(thumb(k, ar), thumb(f0, ar))[0, 1])
        d["ff_r"] = round(r, 3)
        d["aspect"] = f"{f0.width}x{f0.height}"
        json.dump(d, open(p, "w"), indent=1, ensure_ascii=False)
        print(f"{d['shot']:<22} take_{d['take']:<3} {d['aspect']:>10}  ff_r {r:.3f}{'  <-- reframed' if r < 0.85 else ''}")


if __name__ == "__main__":
    main(sys.argv[1:])
