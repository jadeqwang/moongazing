#!/usr/bin/env python3
"""Shot 3.3 ("That line—"): a hand reads down an inscription that is ALREADY on the wall.

The video take (K_3.3_hand/<take>) is a hand moving down a BLANK wall. Shot 3.3 (render/src/sections/03_verse2.js)
draws it with the roto scene on a clean wall plate and lays the JS calligraphy on the wall beside the finger's path
(the column is placed from meta.read.tip, clear of the hand and its shadow). The wall must not be redrawn from the take
(the model blurs the wall the hand uncovers), so the subject matte here is the hand and its shadow only.
Run AFTER tools/roto_prep.py on the take; this rewrites parts of its roto folder:

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/wallread_prep.py K_3.3_hand/take_6 [--wall media/keyframes/K_3.3_wall.jpg] [--debug out.jpg]

  key.jpg     := the CLEAN wall plate (the keyframe with the hand removed), registered onto frame 0 (2x work res)
  mask.png    := all ones (the hand travels the whole height)
  key.jpg also takes the take's low-frequency light, so tones match at the matte edge
  s_%04d.png  := subject matte per frame: hand + bangle + sleeve + their shadow (what differs from the take's own wall
                 AND moves), NOT the wall the take repainted; the roto redraws only that, the painted wall persists
  meta.json   += "read": {"tip": [[x, y] per frame, work px, smoothed], "first": i0, "last": i1 (frames where the
                 fingertip is well inside the frame)}
"""
import argparse
import json
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import roto_prep  # noqa: E402

ROOT = roto_prep.ROOT


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--wall", default="media/keyframes/K_3.3_wall.jpg")
    ap.add_argument("--debug")
    a = ap.parse_args()
    shot, take = a.clip.split("/")
    rdir = os.path.join(ROOT, "media", "gen", shot, "roto", take)
    fdir = os.path.join(ROOT, "media", "gen", shot, "frames", take)
    meta = json.load(open(os.path.join(rdir, "meta.json")))
    W, H, N = meta["w"], meta["h"], meta["frames"]
    files = sorted(f for f in os.listdir(fdir) if f.endswith(".jpg"))[:N]
    frames = [roto_prep.to_work(cv2.imread(os.path.join(fdir, f)), W, H) for f in files]

    # the clean wall, registered onto frame 0 like the keyframe was
    wall = cv2.imread(os.path.join(ROOT, a.wall))
    K2F = roto_prep.register_key(wall, frames[0], W, H)
    Mk = (np.diag([2.0, 2.0, 1.0]) @ roto_prep.h3(K2F))[:2]
    wall2 = cv2.warpAffine(wall, Mk, (W * 2, H * 2), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REFLECT)
    wall_w = cv2.resize(wall2, (W, H), interpolation=cv2.INTER_AREA)

    # the take's own background wall: the last frames (the hand has left the upper wall), bottom-left strip from frame 0
    bg = np.median(np.stack(frames[-3:]), 0).astype(np.uint8)
    bg[int(0.90 * H):, : int(0.66 * W)] = frames[0][int(0.90 * H):, : int(0.66 * W)]
    lab = lambda x: cv2.cvtColor(cv2.GaussianBlur(x, (0, 0), 1.5), cv2.COLOR_BGR2LAB).astype(np.float32)
    bl = lab(bg)
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    D = roto_prep.dis()
    # subject matte = hand + bangle + sleeve + their shadow: what differs from the take's wall AND is moving. (Skin, camel
    # cloth and shadow are not separable by colour on this ochre wall; they are redrawn together, the shadow as the take
    # has it, and the scene keeps the inscription clear of this matte.)
    mattes, tips = [], []
    prev_tip = None
    for i, f in enumerate(frames):
        d = lab(f) - bl
        dl, dab = d[..., 0], np.hypot(d[..., 1], d[..., 2])
        j = i + 5 if i + 5 < N else i - 5
        fl = D.calc(grays[i], grays[j], None)
        mv = cv2.dilate((np.hypot(fl[..., 0], fl[..., 1]) > 1.0).astype(np.uint8), np.ones((21, 21), np.uint8)) > 0
        hand = ((np.abs(dl) > 4.0) | (dab > 4.0)) & mv
        hand[:, : int(0.21 * W)] = False                        # the lattice window never belongs to the hand
        hand = cv2.morphologyEx(hand.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        hand = cv2.morphologyEx(hand, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
        n, lb, st, _ = cv2.connectedComponentsWithStats(hand)
        m = np.zeros((H, W), np.uint8)
        if n > 1:
            k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
            if st[k, cv2.CC_STAT_AREA] > 400:
                m = (lb == k).astype(np.uint8)
        m = roto_prep.fill_holes(m > 0).astype(np.uint8) if m.any() else m
        mattes.append(m)
        ys, xs = np.nonzero(m)
        if len(ys) > 400:
            s = xs * 0.6 + ys                                   # the finger points up-left: its tip is the extreme
            sel = s < s.min() + 5
            tip = (float(xs[sel].mean()), float(ys[sel].mean()))
            prev_tip = tip
        else:
            tip = prev_tip
        tips.append(tip)
    # temporal clean-up of the matte (a 3-frame majority) and a soft edge
    out = []
    for i in range(N):
        a0, a1, a2 = mattes[max(0, i - 1)], mattes[i], mattes[min(N - 1, i + 1)]
        m = ((a0.astype(np.int32) + a1 + a2) >= 2).astype(np.float32) if 0 < i < N - 1 else a1.astype(np.float32)
        m = cv2.GaussianBlur(cv2.dilate(m, np.ones((5, 5), np.uint8)), (0, 0), 2.2)
        out.append(np.clip(m, 0, 1))
    # the plate takes the take's low-frequency light (the window bands of the keyframe the take started from), so the
    # redrawn shadow's outer edge meets the painted wall at the same tone; the plate keeps its own crisp texture
    m0 = cv2.dilate(mattes[0], np.ones((25, 25), np.uint8)) > 0
    tgt = frames[0].copy(); tgt[m0] = bg[m0]
    lp = lambda x: cv2.GaussianBlur(x.astype(np.float32), (0, 0), 14.0)
    ratio = np.clip((lp(tgt) + 2.0) / (lp(wall_w) + 2.0), 0.72, 1.35)
    ratio2 = cv2.resize(ratio, (W * 2, H * 2), interpolation=cv2.INTER_CUBIC)
    wall2 = np.clip(wall2.astype(np.float32) * ratio2, 0, 255).astype(np.uint8)
    T = np.array([t if t is not None else (np.nan, np.nan) for t in tips], np.float64)
    ok = ~np.isnan(T[:, 0])
    idx = np.arange(N)
    for j in range(2):
        T[:, j] = np.interp(idx, idx[ok], T[ok, j])
    # median then light Gaussian: keeps the hand's real easing, removes segmentation jitter
    for j in range(2):
        v = T[:, j].copy()
        v = np.array([np.median(v[max(0, k - 2):k + 3]) for k in range(N)])
        ker = cv2.getGaussianKernel(7, 1.2).ravel()
        T[:, j] = np.convolve(np.pad(v, 3, mode="edge"), ker, mode="valid")
    inside = [k for k in range(N) if out[k].sum() > 2500 and T[k, 1] < H * 0.93]
    first, last = (inside[0], inside[-1]) if inside else (0, N - 1)

    cv2.imwrite(os.path.join(rdir, "key.jpg"), wall2, [cv2.IMWRITE_JPEG_QUALITY, 94])
    cv2.imwrite(os.path.join(rdir, "mask.png"), np.full((H, W), 255, np.uint8))
    for i, m in enumerate(out):
        a8 = (m * 255).round().astype(np.uint8)
        cv2.imwrite(os.path.join(rdir, f"s_{i:04d}.png"), a8)
    meta["read"] = {"tip": [[round(float(x), 2), round(float(y), 2)] for x, y in T], "first": int(first), "last": int(last),
                    "wall": a.wall}
    meta["keySource"] = a.wall
    meta["maskCoverage"] = 1.0
    json.dump(meta, open(os.path.join(rdir, "meta.json"), "w"))
    print(f"{a.clip}: wall plate registered; tip y {T[first, 1]:.0f} -> {T[last, 1]:.0f} px over frames {first}-{last}; "
          f"matte area {int(out[first].sum())} -> {int(out[last].sum())} px")
    if a.debug:
        tiles = []
        for i in range(0, N, max(1, N // 12)):
            v = frames[i].astype(np.float32)
            v[..., 2] = np.clip(v[..., 2] + 120 * out[i], 0, 255)
            v = v.astype(np.uint8)
            cv2.circle(v, (int(T[i, 0]), int(T[i, 1])), 7, (0, 255, 0), 2)
            cv2.putText(v, f"f{i}", (8, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 255), 2)
            tiles.append(cv2.resize(v, (W // 3, H // 3)))
        while len(tiles) % 4:
            tiles.append(np.zeros_like(tiles[0]))
        cv2.imwrite(a.debug, np.vstack([np.hstack(tiles[r:r + 4]) for r in range(0, len(tiles), 4)]), [cv2.IMWRITE_JPEG_QUALITY, 90])


if __name__ == "__main__":
    main()
