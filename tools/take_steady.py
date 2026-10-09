#!/usr/bin/env python3
"""Take out a video model's camera shake before roto prep (rev4 PHOTO, shot 4.3).

Asked for "the cabin trembles", h3 shakes the whole picture by a few pixels in every frame. roto_prep smooths its camera
path over nine frames, so that shake stays in the stabilised frames, the motion mask then covers nearly the whole
picture (0.85 for J_4.3p/take_1) and walls that should be the painting are redrawn and boil. This tool measures each
frame's shift, rotation and scale against frame 0 on things that cannot move (polygons you give: wall, window, seat),
removes it exactly, and writes <take>s.mp4 with a sidecar copied from the take, ready for roto_prep.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/take_steady.py J_4.3p/take_1 --still "0.60,0.0 1.0,0.0 1.0,1.0 0.60,1.0" [--still "..."] [--suffix s]

  --still   polygon of rigid background in fractions of the frame (give one or more)
Prints the motion removed and the residual on the still region.
"""
import argparse
import json
import os
import subprocess

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG = os.path.join(ROOT, ".venv", "bin", "ffmpeg")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--still", action="append", required=True)
    ap.add_argument("--suffix", default="s")
    a = ap.parse_args()
    key, take = a.clip.split("/")
    d = os.path.join(ROOT, "media", "gen", key)
    cap = cv2.VideoCapture(os.path.join(d, take + ".mp4"))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    h, w = frames[0].shape[:2]
    mask = np.zeros((h, w), np.uint8)
    for s in a.still:
        poly = np.array([[float(v) for v in p.split(",")] for p in s.split()]) * [w, h]
        cv2.fillPoly(mask, [np.int32(poly)], 255)
    g0 = cv2.cvtColor(frames[0], cv2.COLOR_BGR2GRAY)
    p0 = cv2.goodFeaturesToTrack(g0, 1500, 0.01, 6, mask=mask)
    out, moved, resid = [frames[0]], [0.0], [0.0]
    for i in range(1, len(frames)):
        g = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g, p0, None, winSize=(31, 31), maxLevel=3)
        back, st2, _ = cv2.calcOpticalFlowPyrLK(g, g0, p1, None, winSize=(31, 31), maxLevel=3)
        ok = (st.ravel() == 1) & (st2.ravel() == 1) & (np.linalg.norm((back - p0).reshape(-1, 2), axis=1) < 0.7)
        M, inl = cv2.estimateAffinePartial2D(p1[ok], p0[ok], method=cv2.RANSAC, ransacReprojThreshold=1.0)
        fixed = cv2.warpAffine(frames[i], M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        out.append(fixed)
        c = np.array([[0, 0, 1], [w, 0, 1], [0, h, 1], [w, h, 1]], np.float64).T
        moved.append(float(np.abs(M @ c - c[:2]).max()))
        q = cv2.transform(p1[ok][inl.ravel() == 1], M) - p0[ok][inl.ravel() == 1]
        resid.append(float(np.median(np.linalg.norm(q.reshape(-1, 2), axis=1))))
    tmp = os.path.join(d, f"_{take}{a.suffix}_tmp")
    os.makedirs(tmp, exist_ok=True)
    for i, f in enumerate(out):
        cv2.imwrite(os.path.join(tmp, f"f_{i:04d}.png"), f)
    dst = os.path.join(d, f"{take}{a.suffix}.mp4")
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-framerate", f"{fps:.6f}", "-i", os.path.join(tmp, "f_%04d.png"),
                    "-c:v", "libx264", "-crf", "10", "-preset", "slow", "-pix_fmt", "yuv420p", dst], check=True)
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    side = json.load(open(os.path.join(d, take + ".json")))
    side.update(file=os.path.relpath(dst, ROOT), steady={"from": take, "still": a.still, "tool": "tools/take_steady.py",
                "removed_px_max": round(max(moved), 2), "removed_px_median": round(float(np.median(moved)), 2),
                "residual_px_median": round(float(np.median(resid)), 3)})
    json.dump(side, open(os.path.join(d, f"{take}{a.suffix}.json"), "w"), indent=1, ensure_ascii=False)
    print(f"{a.clip}: {len(frames)} frames, {int(p0.shape[0])} points; removed max {max(moved):.2f} px, median "
          f"{np.median(moved):.2f} px; residual on the still region median {np.median(resid):.3f} px -> {os.path.relpath(dst, ROOT)}")


if __name__ == "__main__":
    main()
