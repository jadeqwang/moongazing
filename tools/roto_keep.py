#!/usr/bin/env python3
"""Roto "keep": let regions of the PAINTED keyframe (faces) ride on a take instead of being redrawn.

Why: the video model changes a face a little in every frame and the roto redraw then smears it (3.7b at 1:10 in v3);
the painted keyframe is the only place the likeness is right. This tool tracks each region through the take as a
similarity transform (translation, rotation, uniform scale: a face held rigid, moved with the head) and the roto shader
(render/src/roto/shader.js, uKeep) then shows the keyframe's own pixels for that region, carried by that motion, over
the redraw. Run AFTER tools/roto_prep.py (it needs the roto folder and the extracted frames).

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/roto_keep.py J_3.7_close/take_8 --region "x,y x,y x,y ..." [--region "..."] [--feather 5] [--smooth 2.5]
                            [--still] [--debug out.jpg]

  --region   polygon in FRAME-0 pixels of the roto work frame (meta.w x meta.h; look at roto/<take>/key.jpg, which is
             2x that). At most two regions (matte channels r and g).
  --feather  Gaussian sigma (work px) of the matte edge.
  --smooth   Gaussian sigma (frames) applied to the tracked motion (the model's micro-jitter is not head motion).
  --still    do not track: the regions stay where the painting has them (identity).
Writes roto/<take>/keep.png and meta.json["keep"] = {mask, A[, B], regions, stats}. A[i] / B[i] = 2x3 affine, row-major,
mapping frame-i px -> frame-0 px (what the shader needs). Remove the "keep" key from meta.json to turn it off.
"""
import argparse
import json
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def track_region(grays, poly, smooth):
    """Similarity frame-0 -> frame-i for every frame, from LK tracks of corners inside the polygon."""
    h, w = grays[0].shape
    m = np.zeros((h, w), np.uint8)
    cv2.fillPoly(m, [poly.astype(np.int32)], 255)
    p0 = cv2.goodFeaturesToTrack(grays[0], 400, 0.004, 4, mask=m, blockSize=5)
    if p0 is None or len(p0) < 12:
        raise SystemExit("too few trackable corners in a region")
    p0 = p0.reshape(-1, 2).astype(np.float32)
    lk = dict(winSize=(25, 25), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 40, 0.01))
    params, inl = [], []
    guess = p0.copy()
    for i, g in enumerate(grays):
        if i == 0:
            params.append((0.0, 0.0, 0.0, 0.0)); inl.append(len(p0)); continue
        p1, st, _ = cv2.calcOpticalFlowPyrLK(grays[0], g, p0, guess.copy(), flags=cv2.OPTFLOW_USE_INITIAL_FLOW, **lk)
        pb, st2, _ = cv2.calcOpticalFlowPyrLK(g, grays[0], p1, p0.copy(), flags=cv2.OPTFLOW_USE_INITIAL_FLOW, **lk)
        ok = (st.ravel() == 1) & (st2.ravel() == 1) & (np.linalg.norm(pb - p0, axis=1) < 1.0)
        if ok.sum() >= 8:
            A, mask = cv2.estimateAffinePartial2D(p0[ok], p1[ok], method=cv2.RANSAC, ransacReprojThreshold=1.5)
        else:
            A, mask = None, None
        if A is None:
            params.append(params[-1]); inl.append(0); continue
        s = float(np.hypot(A[0, 0], A[1, 0])); th = float(np.arctan2(A[1, 0], A[0, 0]))
        # express the similarity about the region centroid so smoothing the 4 numbers is well conditioned
        c = poly.mean(0)
        tc = A @ np.array([c[0], c[1], 1.0]) - c
        params.append((float(tc[0]), float(tc[1]), float(np.log(s)), th)); inl.append(int(mask.sum()))
        # next initial guess: this frame's fitted positions
        guess = (p0 @ A[:, :2].T + A[:, 2]).astype(np.float32)
    P = np.array(params)
    if smooth > 0:
        k = int(max(3, round(smooth * 3)) * 2 + 1)
        ker = cv2.getGaussianKernel(k, smooth).ravel()
        Pp = np.pad(P, ((k // 2, k // 2), (0, 0)), mode="edge")
        P = np.stack([np.convolve(Pp[:, j], ker, mode="valid") for j in range(4)], 1)
    return P, np.array(inl), len(p0)


def to_inverse_affines(P, poly):
    """params about the centroid -> frame-i px -> frame-0 px, row-major 2x3."""
    c = poly.mean(0)
    out = []
    for tx, ty, ls, th in P:
        s = np.exp(ls)
        R = s * np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
        t = c + np.array([tx, ty]) - R @ c                    # p_i = R p_0 + t
        Ri = np.linalg.inv(R); ti = -Ri @ t                   # p_0 = Ri p_i + ti
        out.append([round(float(v), 6) for v in (Ri[0, 0], Ri[0, 1], ti[0], Ri[1, 0], Ri[1, 1], ti[1])])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--region", action="append", required=True)
    ap.add_argument("--feather", type=float, default=5.0)
    ap.add_argument("--smooth", type=float, default=2.5)
    ap.add_argument("--still", action="store_true")
    ap.add_argument("--debug")
    a = ap.parse_args()
    shot, take = a.clip.split("/")
    rdir = os.path.join(ROOT, "media", "gen", shot, "roto", take)
    fdir = os.path.join(ROOT, "media", "gen", shot, "frames", take)
    meta = json.load(open(os.path.join(rdir, "meta.json")))
    W, H, N = meta["w"], meta["h"], meta["frames"]
    polys = [np.array([[float(v) for v in p.split(",")] for p in r.split()], np.float32) for r in a.region]
    if len(polys) > 2:
        raise SystemExit("at most two regions")
    files = sorted(f for f in os.listdir(fdir) if f.endswith(".jpg"))[:N]
    grays = []
    for f in files:
        im = cv2.imread(os.path.join(fdir, f))
        if im.shape[1] != W or im.shape[0] != H:
            im = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
        grays.append(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY))
    keep = np.zeros((H, W, 3), np.float32)
    out = {"mask": "keep.png", "regions": [p.round(1).tolist() for p in polys], "feather": a.feather, "smooth": a.smooth,
           "still": bool(a.still), "stats": []}
    Ps = []
    for k, poly in enumerate(polys):
        m = np.zeros((H, W), np.float32)
        cv2.fillPoly(m, [poly.astype(np.int32)], 1.0)
        # feather INWARD only: the matte never reaches outside the polygon the user drew
        if a.feather > 0:
            er = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(a.feather * 4) | 1, int(a.feather * 4) | 1)))
            m = np.minimum(m, cv2.GaussianBlur(er, (0, 0), a.feather) * 1.0)
            m = np.clip(m / max(m.max(), 1e-6), 0, 1)
        keep[..., 2 - k] = m                                   # cv2 is BGR: region 0 -> R, region 1 -> G
        if a.still:
            P = np.zeros((N, 4)); inl = np.zeros(N, int); n0 = 0
        else:
            P, inl, n0 = track_region(grays, poly, a.smooth)
        Ps.append(P)
        out["AB"[k]] = to_inverse_affines(P, poly)
        st = {"corners": int(n0), "min_inliers": int(inl[1:].min()) if N > 1 else 0,
              "max_shift_px": round(float(np.hypot(P[:, 0], P[:, 1]).max()), 2),
              "max_rot_deg": round(float(np.abs(np.degrees(P[:, 3])).max()), 2),
              "scale_range": [round(float(np.exp(P[:, 2].min())), 4), round(float(np.exp(P[:, 2].max())), 4)]}
        out["stats"].append(st)
        print(f"region {k}: {st}")
    cv2.imwrite(os.path.join(rdir, "keep.png"), (keep * 255).round().astype(np.uint8))
    meta["keep"] = out
    json.dump(meta, open(os.path.join(rdir, "meta.json"), "w"))
    if a.debug:
        # every 12th frame: the painted key region warped onto the take frame (what the shader will show)
        key = cv2.imread(os.path.join(rdir, "key.jpg"))
        key = cv2.resize(key, (W, H), interpolation=cv2.INTER_AREA)
        tiles = []
        for i in range(0, N, max(1, N // 12)):
            fr = cv2.imread(os.path.join(fdir, files[i]))
            fr = cv2.resize(fr, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)
            for k in range(len(polys)):
                Ai = np.array(out["AB"[k]][i]).reshape(2, 3)     # frame-i -> frame-0: use as the inverse map
                wk = cv2.warpAffine(key, Ai, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)
                wm = cv2.warpAffine(keep[..., 2 - k], Ai, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)[..., None]
                fr = fr * (1 - wm) + wk * wm
            t = cv2.resize(fr.astype(np.uint8), (W // 2, H // 2))
            cv2.putText(t, f"f{i}", (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            tiles.append(t)
        while len(tiles) % 4:
            tiles.append(np.zeros_like(tiles[0]))
        cv2.imwrite(a.debug, np.vstack([np.hstack(tiles[r:r + 4]) for r in range(0, len(tiles), 4)]), [cv2.IMWRITE_JPEG_QUALITY, 90])
        print("debug sheet", a.debug)


if __name__ == "__main__":
    main()
