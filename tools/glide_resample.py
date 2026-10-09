#!/usr/bin/env python3
"""Shot 3.3 (rev 3, Jade: "let the hand move smoothly down"): resample a wall-reading take so the fingertip falls at
an even, gently easing pace, one new position on every film frame.

The take's own descent is uneven (take_6: slow for 20 frames, then 3.0-6.3 px a frame) and the shot needs about 1.75x
its speed, which whole-frame stepping cannot give without a stutter. This writes a new clip whose frame n shows the
take at the (fractional) moment its fingertip is at y(n); in-between frames are made by optical-flow interpolation of
the two neighbouring take frames (the hand moves under 5 px between them, the wall is still).

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/glide_resample.py K_3.3_hand/take_6 take_6g --y0 118 --y1 492 --frames 49 --pad 3 [--ease 0.2]
    $MPY tools/roto_prep.py K_3.3_hand/take_6g && $MPY tools/wallread_prep.py K_3.3_hand/take_6g

Needs roto/<take>/meta.json "read.tip" of the source take (tools/wallread_prep.py). y in work px (1280x720 take).
Output frame PAD + n is film frame n of the shot; PAD extra frames continue the glide before and after.
ease e: speed falls linearly from (1+e) to (1-e) of the mean over the shot (0 = constant).
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import roto_prep  # noqa: E402

ROOT = roto_prep.ROOT


def interp(a, b, t, D):
    if t < 1e-3:
        return a
    if t > 1 - 1e-3:
        return b
    ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    fab = D.calc(ga, gb, None)
    fba = D.calc(gb, ga, None)
    h, w = ga.shape
    xx, yy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    # a point seen at x in the in-between frame came from x - t*fab in a and from x - (1-t)*fba in b (flows are small)
    wa = cv2.remap(a, xx - t * fab[..., 0], yy - t * fab[..., 1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    wb = cv2.remap(b, xx - (1 - t) * fba[..., 0], yy - (1 - t) * fba[..., 1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return cv2.addWeighted(wa, 1 - t, wb, t, 0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip"); ap.add_argument("out_take")
    ap.add_argument("--y0", type=float, required=True); ap.add_argument("--y1", type=float, required=True)
    ap.add_argument("--frames", type=int, default=49); ap.add_argument("--pad", type=int, default=3)
    ap.add_argument("--ease", type=float, default=0.2)
    a = ap.parse_args()
    shot, take = a.clip.split("/")
    gdir = os.path.join(ROOT, "media", "gen", shot)
    meta = json.load(open(os.path.join(gdir, "roto", take, "meta.json")))
    tip = np.array(meta["read"]["tip"])[:, 1]
    assert np.all(np.diff(tip) > -0.2), "fingertip track is not monotonic"
    tip = np.maximum.accumulate(tip) + np.arange(len(tip)) * 1e-4
    fdir = os.path.join(gdir, "frames", take)
    files = sorted(f for f in os.listdir(fdir) if f.endswith(".jpg"))
    src = [cv2.imread(os.path.join(fdir, f)) for f in files]
    N, e = a.frames, a.ease
    D = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    odir = os.path.join(gdir, "frames", a.out_take + "_src")
    os.makedirs(odir, exist_ok=True)
    for f in os.listdir(odir):
        os.remove(os.path.join(odir, f))
    rows = []
    for k in range(-a.pad, N + a.pad):
        u = k / (N - 1)
        p = u * (1 + e) - e * u * u if 0 <= u <= 1 else (u * (1 + e) if u < 0 else 1 + (u - 1) * (1 - e))
        y = a.y0 + (a.y1 - a.y0) * p
        s = float(np.interp(y, tip, np.arange(len(tip))))
        i = min(int(np.floor(s)), len(src) - 2)
        img = interp(src[i], src[i + 1], s - i, D)
        cv2.imwrite(os.path.join(odir, f"f_{k + a.pad:04d}.png"), img)
        rows.append((k, round(y, 1), round(s, 2)))
    mp4 = os.path.join(gdir, a.out_take + ".mp4")
    subprocess.run([roto_prep.FFMPEG, "-y", "-loglevel", "error", "-framerate", "24", "-i", os.path.join(odir, "f_%04d.png"),
                    "-c:v", "libx264", "-crf", "10", "-preset", "slow", "-pix_fmt", "yuv420p", mp4], check=True)
    side = json.load(open(os.path.join(gdir, take + ".json")))
    side.update(take=a.out_take, file=os.path.relpath(mp4, ROOT), est_usd=0, state="done", derived_from=a.clip,
                notes=f"rev3_hands: {a.clip} resampled by tools/glide_resample.py (fingertip y {a.y0:.0f} -> {a.y1:.0f} px over "
                      f"{N} film frames, ease {e}, pad {a.pad}); no new generation",
                glide={"y0": a.y0, "y1": a.y1, "frames": N, "pad": a.pad, "ease": e, "map": rows})
    side.pop("verdict", None); side.pop("probe", None)
    json.dump(side, open(os.path.join(gdir, a.out_take + ".json"), "w"), indent=1, ensure_ascii=False)
    for f in os.listdir(odir):
        os.remove(os.path.join(odir, f))
    os.rmdir(odir)
    print(f"{mp4}: {N + 2 * a.pad} frames; source frames {rows[0][2]} -> {rows[-1][2]}; "
          f"steps (take frames per film frame) {min(np.diff([r[2] for r in rows])):.2f}..{max(np.diff([r[2] for r in rows])):.2f}")


if __name__ == "__main__":
    main()
