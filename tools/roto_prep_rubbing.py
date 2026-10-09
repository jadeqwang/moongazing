#!/usr/bin/env python3
"""Roto prep for the RUBBING breakdown (6.2a / 6.2b / 6.3): the painted keyframe CARRIED by a take's motion.

The standard prep (tools/roto_prep.py) feeds an ink / silk / gold REDRAW, and the ink redraw lays dark pigment on light
paper, so it cannot sit on the white-on-black rubbing; it also re-inks faces, which loses Jade's likeness. This prep
keeps the painting itself and only moves it:

  * static pixels                 -> the painted keyframe, untouched (no boil; the sky where the engine draws the Earth
                                     is forced static with --static)
  * moving pixels the flow explains -> the painted keyframe warped by the take's optical flow (frame i -> frame 0)
  * a rigid head layer (--head)   -> the keyframe's painted face / glasses / hair moved by ONE similarity transform per
                                     frame fitted to the flow inside the head polygon (a head pitch seen in profile is an
                                     in-plane rotation), so the likeness is the painted one in every frame
  * disocclusions / new content   -> the take's own pixels (smoothed), only where the painting has nothing to show
                                     (--prefer video uses the take everywhere it moves: small faceless figures that turn)

Everything is written monochrome with the stele-rubbing transfer curve baked in (0.075 + 0.855 * L^1.15, the plate
scene's 'rubbing' grade), as a roto folder the existing roto scene plays with
    { type: 'roto', clip, paper: 'silk', redrawAll: 1, lock: 0, offset: >= 0.5,
      style: { snapAmt: 0, shade: 0, gran: 0, lineA: 0, boldA: 0 } }
(silk mode with those overrides shows the colour guide as it is, on our paper's texture).

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/roto_prep_rubbing.py J_6.2/take_5 --key media/keyframes/jade/J_6.2.png --reverse \
         --head "0.70,0.25 0.83,0.22 ..." --static "0.30,0.20,0.50,0.40"

--reverse   write the frames last-to-first (a take generated FROM the held pose plays INTO it: the shot ends exactly on
            the painted keyframe)
--range a:b source frames to use (before reversing); --speed s takes every s-th source frame (1.5 = half as fast again)
--head      polygon (keyframe uv) of the head inside the helmet; --pivot optional, only for the report
--static    rect(s) u0,v0,u1,v1 (keyframe uv) forced to the keyframe
--freeze    polygon(s) (keyframe uv) forced to the keyframe (e.g. the helmet shell, fixed to the suit)
--black-floor f   (rev2, 6.2c / 6.2d) moving pixels darker than f go to the keyframe's ink black; default 0 = off
Outputs media/gen/<shot>/roto/<take>/ {key.jpg, mask.png, c_%04d.jpg, g_%04d.png, meta.json, track.json}
"""
import argparse
import json
import os
import sys
import time

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from roto_prep import extract_frames, register_key, dis, flow_warp  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAXW = 1920


def rubbing(gray01):
    """The plate scene's rubbing transfer (grade 5) at mean granulation, as an sRGB triple image."""
    t = np.power(np.clip(gray01, 0, 1), 1.15)[..., None]
    out = np.array([0.070, 0.072, 0.075]) + t * np.array([0.82, 0.86, 0.88]) * 0.971   # BGR
    return np.clip(out * 255, 0, 255).astype(np.uint8)


def poly_mask(pts, W, H, feather=0):
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [np.round(np.array(pts, np.float32) * [W, H]).astype(np.int32)], 1.0)
    if feather:
        m = cv2.GaussianBlur(m, (0, 0), feather)
    return m


def parse_poly(s):
    return [tuple(float(x) for x in p.split(",")) for p in s.split()]


def sim_params(M):
    a, b, tx, ty = M[0, 0], M[1, 0], M[0, 2], M[1, 2]
    return np.array([np.hypot(a, b), np.arctan2(b, a), tx, ty])


def sim_matrix(p):
    s, th, tx, ty = p
    return np.array([[s * np.cos(th), -s * np.sin(th), tx], [s * np.sin(th), s * np.cos(th), ty]], np.float64)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--key", required=True)
    ap.add_argument("--reverse", action="store_true")
    ap.add_argument("--range", default="")
    ap.add_argument("--head", default="")
    ap.add_argument("--static", action="append", default=[])
    ap.add_argument("--freeze", action="append", default=[])
    ap.add_argument("--prefer", default="warp", choices=["warp", "video"])
    ap.add_argument("--motion-thr", type=float, default=0.7)
    ap.add_argument("--err-thr", type=float, default=0.085)
    ap.add_argument("--head-smooth", type=float, default=1.2)
    ap.add_argument("--region", default="", help="u0,v0,u1,v1: only this part of the frame may move")
    ap.add_argument("--speed", type=float, default=1.0, help="source frames per output frame (video models move slowly)")
    ap.add_argument("--black-floor", type=float, default=0.0,
                    help="0 = off (default). In MOVING pixels only, tones darker than this (0..1) are pulled down to the "
                         "keyframe's own black: a take's dark sky / shadow is never as flat as the painted ink, and where "
                         "a figure uncovers it the difference shows as grey mottling on the black")
    a = ap.parse_args()

    shot, take = a.clip.split("/")
    gdir = os.path.join(ROOT, "media", "gen", shot)
    frames = extract_frames(os.path.join(gdir, take + ".mp4"), os.path.join(gdir, "frames", take))
    key0 = cv2.imread(os.path.join(ROOT, a.key))
    kh, kw = key0.shape[:2]
    W = min(MAXW, kw); H = int(round(W * kh / kw)); W -= W % 2; H -= H % 2
    key = cv2.resize(key0, (W, H), interpolation=cv2.INTER_AREA if kw > W else cv2.INTER_CUBIC)
    keyg = cv2.cvtColor(key, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255

    # the take's frames in KEYFRAME coordinates (the model may shift / scale its first frame a little)
    f0 = cv2.imread(frames[0]); fh, fw = f0.shape[:2]
    K2F = register_key(key, f0, fw, fh)                    # key px -> frame px
    F2K = cv2.invertAffineTransform(K2F.astype(np.float64))

    def load(i):
        return cv2.warpAffine(cv2.imread(frames[i]), F2K, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    lo, hi = 0, len(frames)
    if a.range:
        s0, s1 = a.range.split(":"); lo = int(s0 or 0); hi = int(s1) if s1 else len(frames)
    idx = sorted({min(hi - 1, lo + int(round(k * a.speed))) for k in range(int((hi - lo) / a.speed) + 1)})
    g0 = cv2.cvtColor(load(0), cv2.COLOR_BGR2GRAY)
    reg_err = float(np.abs(cv2.GaussianBlur(g0, (0, 0), 3).astype(np.float32) / 255 - cv2.GaussianBlur(keyg, (0, 0), 3)).mean())

    static = np.zeros((H, W), np.float32)
    for r in a.static:
        u0, v0, u1, v1 = (float(x) for x in r.split(","))
        static[int(v0 * H):int(v1 * H), int(u0 * W):int(u1 * W)] = 1
    for p in a.freeze:
        static = np.maximum(static, poly_mask(parse_poly(p), W, H))
    static = cv2.GaussianBlur(static, (0, 0), 4)
    if a.region:
        u0, v0, u1, v1 = (float(x) for x in a.region.split(","))
        reg = np.zeros((H, W), np.float32); reg[int(v0 * H):int(v1 * H), int(u0 * W):int(u1 * W)] = 1
        static = np.maximum(static, 1 - cv2.GaussianBlur(reg, (0, 0), 6))
    head_hard = poly_mask(parse_poly(a.head), W, H) if a.head else None
    head_soft = cv2.GaussianBlur(head_hard, (0, 0), 3.0) if a.head else None

    key_black = float(np.percentile(keyg, 5))               # the painting's flat ink black (for --black-floor)
    D = dis()
    g0b = cv2.GaussianBlur(g0, (0, 0), 1.0)
    # structure: flat sky / paper gives random DIS vectors, so flow only counts where there is something to track
    gx = cv2.Sobel(g0b, cv2.CV_32F, 1, 0); gy = cv2.Sobel(g0b, cv2.CV_32F, 0, 1)
    flows, sims, inl = {}, {}, {}
    prev = None
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    for i in idx:
        gi = cv2.GaussianBlur(cv2.cvtColor(load(i), cv2.COLOR_BGR2GRAY), (0, 0), 1.0)
        fl = D.calc(gi, g0b, prev.copy() if prev is not None else None)      # frame i (x) -> frame 0 (x + fl)
        prev = fl
        flows[i] = fl
        if a.head:
            # points of frame i that land inside the head polygon of frame 0
            mx = np.clip(xx + fl[..., 0], 0, W - 1); my = np.clip(yy + fl[..., 1], 0, H - 1)
            inside = cv2.remap(head_hard, mx, my, cv2.INTER_LINEAR) > 0.9
            step = 6
            ys, xs = np.mgrid[step // 2:H:step, step // 2:W:step]
            v = inside[ys, xs]
            src = np.stack([xs[v], ys[v]], -1).astype(np.float32)
            dst = src + fl[ys[v], xs[v]]
            M = None
            if len(src) >= 30:
                M, ok = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=1.5, maxIters=4000, confidence=0.995)
                inl[i] = float(ok.mean()) if ok is not None else 0.0
            sims[i] = sim_params(M if M is not None else np.eye(2, 3))
    if a.head:   # smooth the head track in time (the take's micro-jitter would make the painted face buzz)
        P = np.array([sims[i] for i in idx])
        if a.head_smooth > 0 and len(idx) > 5:
            P = np.stack([cv2.GaussianBlur(P[:, k].reshape(-1, 1).astype(np.float32), (1, 0), a.head_smooth, borderType=cv2.BORDER_REPLICATE).ravel() for k in range(4)], 1)
            P[0] = sims[idx[0]] if idx[0] != 0 else np.array([1, 0, 0, 0])
        if idx[0] == 0:
            P[0] = np.array([1, 0, 0, 0])
        for n, i in enumerate(idx):
            sims[i] = P[n]

    out_dir = os.path.join(gdir, "roto", take)
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        os.remove(os.path.join(out_dir, f))
    order = idx[::-1] if a.reverse else idx
    track = []
    blank = np.zeros((9, 16, 3), np.uint8)
    stats = []
    for n, i in enumerate(order):
        fr = load(i); fl = flows[i]
        frg = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
        mag = cv2.GaussianBlur(np.hypot(fl[..., 0], fl[..., 1]), (0, 0), 2.0)
        # appearance change against frame 0 (catches motion in flat regions the flow cannot see)
        diff = cv2.GaussianBlur(np.abs(cv2.GaussianBlur(frg, (0, 0), 2) - cv2.GaussianBlur(g0.astype(np.float32) / 255, (0, 0), 2)), (0, 0), 3)
        moving = np.clip(np.maximum((mag - a.motion_thr) / a.motion_thr, (diff - 0.03) / 0.03), 0, 1)
        moving = cv2.GaussianBlur(cv2.dilate(moving, np.ones((9, 9), np.uint8)), (0, 0), 4)
        moving *= 1 - static
        warped = flow_warp(keyg, fl)                                          # the painting, carried
        f0w = flow_warp(g0.astype(np.float32) / 255, fl)
        err = cv2.GaussianBlur(np.abs(cv2.GaussianBlur(frg, (0, 0), 1.5) - cv2.GaussianBlur(f0w, (0, 0), 1.5)), (0, 0), 2.5)
        valid = 1 - np.clip((err - a.err_thr * 0.6) / (a.err_thr * 0.8), 0, 1)
        # a stretched or folded flow field (newly revealed surfaces, things entering at the frame edge) smears the
        # painting: there the take's own pixels are the honest source
        fs = cv2.GaussianBlur(fl, (0, 0), 2.0)
        jac = np.sqrt(sum(cv2.Sobel(fs[..., k], cv2.CV_32F, dx, dy, ksize=3, scale=1 / 8) ** 2 for k in (0, 1) for dx, dy in ((1, 0), (0, 1))))
        jac = cv2.GaussianBlur(cv2.dilate(jac, np.ones((7, 7), np.uint8)), (0, 0), 4.0)
        valid *= 1 - np.clip((jac - 0.10) / 0.12, 0, 1)
        sx, sy = xx + fl[..., 0], yy + fl[..., 1]
        valid *= ((sx > 1) & (sx < W - 2) & (sy > 1) & (sy < H - 2)).astype(np.float32)
        vid = cv2.bilateralFilter(frg, 7, 0.08, 4)                            # the take's own pixels, calmed
        if a.prefer == "video":
            valid = np.zeros_like(valid)
        mov = warped * valid + vid * (1 - valid)
        if a.black_floor > 0:
            k = np.clip((mov - 0.45 * a.black_floor) / (0.55 * a.black_floor), 0, 1); k = k * k * (3 - 2 * k)
            mov = mov * k + np.minimum(mov, key_black) * (1 - k)
        out = keyg * (1 - moving) + mov * moving
        rec = {"src": i}
        if a.head:
            M = sim_matrix(sims[i])                                          # frame i px -> frame 0 px
            hk = cv2.warpAffine(keyg, M, (W, H), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
            ha = cv2.warpAffine(head_soft, M, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)
            out = out * (1 - ha) + hk * ha
            Mi = cv2.invertAffineTransform(M)                                # frame 0 px -> frame i px
            rec.update(scale=float(sims[i][0]), rot_deg=float(-np.degrees(sims[i][1])), M0i=[float(x) for x in Mi.ravel()], inliers=inl.get(i, 0))
        cv2.imwrite(os.path.join(out_dir, f"c_{n:04d}.jpg"), rubbing(out), [cv2.IMWRITE_JPEG_QUALITY, 93])
        cv2.imwrite(os.path.join(out_dir, f"g_{n:04d}.png"), blank)
        rec.update(moving=float(moving.mean()), video_px=float((moving * (1 - valid)).mean()))
        track.append(rec); stats.append(rec["moving"])
    cv2.imwrite(os.path.join(out_dir, "key.jpg"), rubbing(keyg), [cv2.IMWRITE_JPEG_QUALITY, 93])
    cv2.imwrite(os.path.join(out_dir, "mask.png"), np.full((H // 4, W // 4), 255, np.uint8))
    I = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0]
    meta = {"clip": a.clip, "fps": 24, "frames": len(order), "w": W, "h": H, "prep": "roto_prep_rubbing.py",
            "args": sys.argv[1:], "first_frame": a.key, "keySource": a.key, "reversed": bool(a.reverse), "srcFrames": [order[0], order[-1]],
            "key_reg_err": round(reg_err, 4), "T": [I] * len(order), "Ti": [I] * len(order),
            "palette": [[0.93, 0.93, 0.9], [0.07, 0.07, 0.07]], "paletteShare": [0.5, 0.5], "inkLevels": [0.07, 0.4, 0.93],
            "faceFrames": [], "face": None, "remouth": False, "eyelock": False, "mask": "mask.png", "darkGround": True,
            "made": time.strftime("%Y-%m-%d %H:%M")}
    json.dump(meta, open(os.path.join(out_dir, "meta.json"), "w"))
    json.dump(track, open(os.path.join(out_dir, "track.json"), "w"), indent=0)
    print(f"{a.clip}: {len(order)} frames {W}x{H} -> {os.path.relpath(out_dir, ROOT)}  key_reg_err {reg_err:.3f}  moving {np.mean(stats):.3f}")
    if a.head:
        r = [t["rot_deg"] for t in track]
        print("  head rotation (deg, + = chin up from the keyframe):", " ".join(f"{x:.1f}" for x in r[::4]))


if __name__ == "__main__":
    main()
