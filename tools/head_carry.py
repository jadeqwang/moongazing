#!/usr/bin/env python3
"""rev3_face (Oct 8): make a painted head RIGID in a take, on the take's own pixels, before roto prep.

Why: tools/roto_keep.py shows the painted face over the redraw, but the take's own head is still underneath. When the
video model slowly reshapes that head (3.7b: the face widens and turns frontal while it tilts), its jaw line leaves the
carried painting and the redraw draws it as a second chin beside the painted one. This tool removes the take's head
from the motion base instead: in every frame the region of FRAME 0 (the painting the take started from) is laid back,
moved with the head by one similarity transform (translation, rotation, uniform scale: tools/roto_keep.py's tracker),
and a ring around it, where the take's own outline could stick out, is first filled from the surroundings.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/head_carry.py J_3.7_close/take_8 --out-take take_8c --region "x,y x,y ..." [--track "x,y ..."]
         [--hide "x,y ..."] [--ring 12] [--feather 2] [--smooth 2.5] [--motion 1.0] [--sheet OUT.jpg]

  --region  polygon, ROTO WORK px of frame 0 (1280 wide: look at roto/<take>/key.jpg, which is 2x that): what is carried.
            Draw it just outside the painted outline (2-4 px), so the outline itself rides along.
  --track   polygon whose corners give the motion (default: the region).
  --hide    polygon (frame-0 work px, moved with the head): the ring is filled only inside it. Default: all round.
            Use it to leave alone a neighbour that touches the head (3.7b: M's hair against Jade's cheek).
  --ring    width (work px) of the filled ring outside the region. The ring shows frame 0's own pixels, unmoved, where
            frame 0 had no head (locked camera assumed; --no-static turns this off); where the head has moved away,
            the take's own pixels stay unless they are still the head's skin colour (those are filled in).
  --feather sigma (work px) of the region's edge, inward only.
  --smooth  Gaussian sigma (frames) on the tracked motion.
  --motion  scale the tracked motion about frame 0 (1 = as tracked; 0.5 = half the travel and tilt).
Writes media/gen/<shot>/<out-take>.mp4 and .json (sidecar copied, with "treated_from"), so tools/roto_prep.py runs on it
unchanged; then run tools/roto_keep.py on the new take with the same polygons. The source take is not touched.
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
FFMPEG = os.path.join(ROOT, ".venv", "bin", "ffmpeg")
WORK_W = 1280


def poly(s, k):
    return np.array([[float(v) for v in p.split(",")] for p in s.split()], np.float32) * k


def fill(shape, P):
    m = np.zeros(shape, np.float32)
    cv2.fillPoly(m, [P.astype(np.int32)], 1.0)
    return m


def run(clip, out_take, region, track=None, hide=None, ring=12.0, feather=2.0, smooth=2.5, motion=1.0, sheet=None, static=True, skin_thr=22.0):
    import roto_keep
    shot, take = clip.split("/")
    gdir = os.path.join(ROOT, "media", "gen", shot)
    cap = cv2.VideoCapture(os.path.join(gdir, take + ".mp4"))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    H, W = frames[0].shape[:2]
    k = W / WORK_W                                   # work px -> take px
    R = poly(region, k)
    Tp = poly(track, k) if track else R
    Hd = poly(hide, k) if hide else None
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    P, inl, n0 = roto_keep.track_region(grays, Tp, smooth)
    P = P * motion
    A = roto_keep.to_inverse_affines(P, Tp)          # frame-i px -> frame-0 px
    m0 = fill((H, W), R)
    fe = feather * k
    a0 = m0
    if fe > 0:
        er = cv2.erode(m0, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(fe * 4) | 1, int(fe * 4) | 1)))
        a0 = np.minimum(m0, cv2.GaussianBlur(er, (0, 0), fe))
        a0 = np.clip(a0 / max(a0.max(), 1e-6), 0, 1)
    rpx = int(round(ring * k))
    big = cv2.dilate(m0, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * rpx + 1, 2 * rpx + 1)))
    hole0 = np.maximum(m0, big * fill((H, W), Hd)) if Hd is not None else big
    # frame-0 pixels that are not the head (2 px clear of it): usable, unmoved, as what lies behind the head
    free0 = 1 - (cv2.dilate(m0, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))) > 0.5).astype(np.uint8)
    lab0 = cv2.cvtColor(frames[0], cv2.COLOR_BGR2LAB).astype(np.float32)
    skin = np.median(lab0[fill((H, W), Tp) > 0.5], axis=0)       # the head's own skin tone (the tracked polygon)
    out = []
    for i, f in enumerate(frames):
        Ai = np.array(A[i]).reshape(2, 3)
        inv = cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP
        hole = (cv2.warpAffine(hole0, Ai, (W, H), flags=inv) > 0.5).astype(np.uint8)
        # the take's own head, and whatever of it sticks out into the ring, is taken out. Where the painting itself
        # shows what is behind (frame 0 had no head there: the neck, the dress, the hair beside the jaw), that is laid
        # in, unmoved; only the rest (what the head uncovers as it moves) is filled in from its surroundings.
        base = f
        if static:
            sa = cv2.GaussianBlur((hole * free0).astype(np.float32), (0, 0), 1.5 * k)[..., None]
            base = np.clip(f.astype(np.float32) * (1 - sa) + frames[0].astype(np.float32) * sa, 0, 255).astype(np.uint8)
            # what the head uncovers as it moves: keep the take there (it shows what is behind), except where the
            # take still shows the head itself: skin of the head's own colour, with its outline (3 px)
            d = np.linalg.norm(cv2.cvtColor(f, cv2.COLOR_BGR2LAB).astype(np.float32) - skin, axis=2)
            sk = cv2.morphologyEx((d < skin_thr).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
            sk = cv2.dilate(sk, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(6 * k) | 1, int(6 * k) | 1)))
            rest = (hole * (1 - free0) * sk).astype(np.uint8)
        else:
            rest = hole
        base = cv2.inpaint(base, rest, 5, cv2.INPAINT_TELEA)
        wk = cv2.warpAffine(frames[0], Ai, (W, H), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)
        wa = cv2.warpAffine(a0, Ai, (W, H), flags=inv)[..., None]
        out.append(np.clip(base.astype(np.float32) * (1 - wa) + wk.astype(np.float32) * wa, 0, 255).astype(np.uint8))
    tmp = os.path.join(gdir, "_carry_" + out_take)
    os.makedirs(tmp, exist_ok=True)
    for i, g in enumerate(out):
        cv2.imwrite(os.path.join(tmp, f"f_{i:04d}.png"), g)
    dst = os.path.join(gdir, out_take + ".mp4")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-framerate", "24", "-i", os.path.join(tmp, "f_%04d.png"), "-c:v", "libx264",
                    "-crf", "8", "-preset", "slow", "-pix_fmt", "yuv420p", dst], check=True)
    for fn in os.listdir(tmp):
        os.remove(os.path.join(tmp, fn))
    os.rmdir(tmp)
    stats = {"corners": int(n0), "min_inliers": int(inl[1:].min()),
             "max_shift_px": round(float(np.hypot(P[:, 0], P[:, 1]).max() / k), 2),
             "max_rot_deg": round(float(np.abs(np.degrees(P[:, 3])).max()), 2),
             "scale_range": [round(float(np.exp(P[:, 2].min())), 4), round(float(np.exp(P[:, 2].max())), 4)]}
    side = json.load(open(os.path.join(gdir, take + ".json")))
    side.update(take=out_take, file=os.path.relpath(dst, ROOT), treated_from=f"{shot}/{take}",
                treatment={"tool": "tools/head_carry.py", "region": region, "track": track, "hide": hide, "ring": ring,
                           "feather": feather, "smooth": smooth, "motion": motion, "static_fill": static, "stats": stats,
                           "what": "frame 0's head laid over every frame on one tracked similarity; a ring around it filled "
                                   "from the surroundings; nothing re-timed"})
    json.dump(side, open(os.path.join(gdir, out_take + ".json"), "w"), indent=1, ensure_ascii=False)
    if sheet:
        x0, y0 = np.maximum(R.min(0) - 60 * k, 0).astype(int)
        x1, y1 = (R.max(0) + 60 * k).astype(int)
        tiles = []
        for i in range(0, len(frames), max(1, len(frames) // 14)):
            t = np.vstack([frames[i][y0:y1, x0:x1], out[i][y0:y1, x0:x1]])
            cv2.putText(t, f"f{i}", (4, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 2)
            tiles.append(t)
        cv2.imwrite(sheet, np.hstack(tiles), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(f"{clip} -> {shot}/{out_take}: {len(frames)} frames, {stats}")
    return f"{shot}/{out_take}"


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--out-take", required=True)
    ap.add_argument("--region", required=True)
    ap.add_argument("--track")
    ap.add_argument("--hide")
    ap.add_argument("--ring", type=float, default=12.0)
    ap.add_argument("--feather", type=float, default=2.0)
    ap.add_argument("--smooth", type=float, default=2.5)
    ap.add_argument("--motion", type=float, default=1.0)
    ap.add_argument("--sheet")
    ap.add_argument("--no-static", action="store_true", help="fill the whole ring from its surroundings (camera not locked)")
    a = ap.parse_args()
    run(a.clip, a.out_take, a.region, a.track, a.hide, a.ring, a.feather, a.smooth, a.motion, a.sheet, static=not a.no_static)
