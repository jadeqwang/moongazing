#!/usr/bin/env python3
"""rev3_face (Oct 8): the sung close-up with the PAINTED portrait as the whole head, and only the mouth from the take.

Jade on the sung 4.3 of cut v5: "the mouth is ok on the sung close-up, but the upper half of the face is glitched".
What the v5 version did: the avatar take (pruna/p-video-avatar) lifts and tilts the head (88 px up, 5 degrees, 5 %
smaller within the phrase) and redraws forehead, hair, brows, cheeks and helmet in every frame; only a small polygon
(glasses, eyes, nose) of the painting rode on top. Stabilising the take on the upper face shows that its lower face no
longer fits the portrait either (the chin comes up out of the neck ring and the jaw is half again as wide), so a
painted upper half cannot be joined to the take's lower half along the cheeks.

This tool therefore builds a new motion base, frame by frame, nothing re-timed:
  1. the take is stabilised on the painted upper face (similarity: tools/roto_keep.py's tracker), so that in every frame
     the take's eyes, glasses and nose sit where the painting has them;
  2. the frame is the PAINTING (the take's frame 0) everywhere: hair, forehead, brows, glasses, eyes, nose, cheeks, jaw
     line, helmet, suit, cabin;
  3. only the mouth is the take's: the stabilised take's lips and mouth interior (face landmarks, a margin of skin, a
     soft edge, the take's skin tone matched to the painting's around it) are laid in, inside the painted jaw line and
     above the neck ring. The portrait's chin is hidden behind the neck ring, so the jaw drops out of sight;
  4. head, helmet and suit then move together as ONE rigid body: the take's own head motion, smoothed and scaled down
     (--life, default 0.12: about 5 px of rise through the phrase instead of 46), applied as a displacement that is
     rigid inside the figure and fades out over the seat behind it. --life 0 gives a still figure.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/ls_sung_portrait.py LS3c/take_7 [--out-take take_7p] [--life 0.12] [--sheet OUT.jpg]

Writes media/gen/<shot>/<out-take>.mp4 + .json (sidecar copied, "treated_from"); then tools/ls_mouth_treat.py (teeth)
and tools/roto_prep.py run on it as before: use tools/ls_sung_prep.py --portrait, which does all three.
Geometry (take px, 1280 wide) is for J_LS3_close: FACE (skin around the mouth, inside the jaw line, above the ring)
and FIGURE (helmet and suit).
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
sys.path.insert(0, os.path.join(ROOT, "tools", "sync"))
FFMPEG = os.path.join(ROOT, ".venv", "bin", "ffmpeg")
OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]
# skin around the mouth in J_LS3_close: 4 px inside the painted jaw line, under the nose, above the neck ring
FACE = np.array([[612, 450], [915, 450], [893, 480], [874, 500], [815, 560], [797, 578], [694, 582], [680, 560],
                 [643, 500], [631, 480]], np.float32)
SUIT = np.array([[300, 704], [310, 590], [345, 560], [560, 540], [1020, 540], [1180, 590], [1280, 620], [1280, 704]], np.int32)
HELMET = ((786, 290), (335, 350))             # centre, half-axes
HEAD_C = np.array([765.0, 400.0])
WINDOW = (58, 98)                             # take frames of the phrase: the rigid motion is centred on these


def gauss_t(a, sig):
    if sig <= 0:
        return a
    k = int(max(3, round(sig * 3)) * 2 + 1)
    ker = cv2.getGaussianKernel(k, sig).ravel()
    p = np.pad(a, ((k // 2, k // 2),) + ((0, 0),) * (a.ndim - 1), mode="edge")
    return np.stack([np.convolve(p[:, j], ker, mode="valid") for j in range(a.shape[1])], 1)


def run(clip, out_take=None, life=0.12, sheet=None, margin=13.0, feather=5.0):
    import roto_keep
    import ls_mouth_treat
    import mouth as mouthmod
    shot, take = clip.split("/")
    gdir = os.path.join(ROOT, "media", "gen", shot)
    out_take = out_take or take + "p"
    cap = cv2.VideoCapture(os.path.join(gdir, take + ".mp4"))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    N = len(frames)
    H, W = frames[0].shape[:2]
    f0 = frames[0]
    def find(img, guess):
        """face landmarks: crops around the expected face box first (the detector misses some), then a grid."""
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        boxes = []
        if guess is not None:
            x0, y0, x1, y1 = guess
            for k in (0.8, 1.0, 0.65, 1.3, 1.8, 0.9, 1.15, 0.72, 1.5):
                cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, k * max(x1 - x0, y1 - y0)
                boxes.append((max(0, cx - r), max(0, cy - r), min(W, cx + r), min(H, cy + r)))
        for bx in boxes + list(mouthmod.grid_boxes(W, H)):
            hit = mouthmod.detect(rgb, bx)
            if hit is not None:
                return hit
        return None
    hit0 = find(f0, None)
    if hit0 is None:
        raise SystemExit("no face in frame 0")
    poly = ls_mouth_treat.upper_face_polygon(hit0[0], True)
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    P, inl, n0 = roto_keep.track_region(grays, poly, 1.0)
    A = roto_keep.to_inverse_affines(P, poly)                    # frame-i px -> frame-0 px
    stab = [cv2.warpAffine(f, np.array(A[i]).reshape(2, 3), (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
            for i, f in enumerate(frames)]
    # lips of every stabilised frame (and of the painting)
    L0 = hit0[0]
    fbox = (float(L0[:, 0].min()), float(L0[:, 1].min()), float(L0[:, 0].max()), float(L0[:, 1].max()))
    hulls, miss = [], 0
    for i, s in enumerate(stab):
        hit = find(s, fbox)                                      # stabilised: the face stays where frame 0 has it
        if hit is None:
            miss += 1
            hulls.append(None)
        else:
            hulls.append(cv2.convexHull(hit[0][OUTER].astype(np.float32)).reshape(-1, 2))
    for i in range(N):                                           # hold across misses
        if hulls[i] is None:
            j = next((k for k in list(range(i - 1, -1, -1)) + list(range(i + 1, N)) if hulls[k] is not None), None)
            hulls[i] = hulls[j]
    hull0 = cv2.convexHull(hit0[0][OUTER].astype(np.float32)).reshape(-1, 2)
    face = np.zeros((H, W), np.uint8)
    cv2.fillPoly(face, [FACE.astype(np.int32)], 1)
    ker = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(2 * r) | 1, int(2 * r) | 1))
    comp, shares, tone = [], [], []
    for i in range(N):
        m = np.zeros((H, W), np.uint8)
        for h in [hull0] + [hulls[k] for k in range(max(0, i - 1), min(N, i + 2))]:   # +-1 frame: landmark jitter
            cv2.fillPoly(m, [h.astype(np.int32)], 1)
        core = cv2.dilate(m, ker(margin))
        # the take's skin tone around the mouth, matched to the painting's
        ring = (cv2.dilate(core, ker(14)) - core) * face
        s = stab[i].astype(np.float32)
        d = np.zeros(3, np.float32)
        if ring.sum() > 200:
            d = np.median(f0[ring > 0].astype(np.float32), 0) - np.median(s[ring > 0], 0)
        tone.append([round(float(v), 1) for v in d])
        a = cv2.GaussianBlur(cv2.dilate(core, ker(feather * 1.5)).astype(np.float32), (0, 0), feather)
        a = np.minimum(a, cv2.GaussianBlur(face.astype(np.float32), (0, 0), 2.0) * 1.0)
        a = np.where(face > 0, a, 0.0)[..., None]                # never over the jaw line or the neck ring
        comp.append(np.clip(f0.astype(np.float32) * (1 - a) + (s + d) * a, 0, 255).astype(np.uint8))
        shares.append(round(float(a.mean()), 4))
    # one rigid body: head + helmet + suit follow the take's own head motion, smoothed and scaled down
    out = comp
    life_stats = None
    if life > 0:
        Ps = gauss_t(P, 3.0)
        Ps = (Ps - Ps[WINDOW[0]:WINDOW[1]].mean(0)) * life
        Ps[:, 2] = 0.0                                           # no zoom: the model's lean-back is not kept
        fig = np.zeros((H, W), np.uint8)
        cv2.ellipse(fig, HELMET[0], HELMET[1], 0, 0, 360, 1, -1)
        cv2.fillPoly(fig, [SUIT], 1)
        w = cv2.GaussianBlur(cv2.dilate(fig, ker(30)).astype(np.float32), (0, 0), 40)
        w = np.maximum(w, fig.astype(np.float32))
        xs, ys = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
        out = []
        for i, c in enumerate(comp):
            tx, ty, _, th = Ps[i]
            cs, sn = np.cos(th), np.sin(th)
            dx = (cs - 1) * (xs - HEAD_C[0]) - sn * (ys - HEAD_C[1]) + tx
            dy = sn * (xs - HEAD_C[0]) + (cs - 1) * (ys - HEAD_C[1]) + ty
            out.append(cv2.remap(c, xs - w * dx, ys - w * dy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT))
        a, b = WINDOW
        life_stats = {"scale": life, "window": list(WINDOW),
                      "shift_px_range_in_window": [round(float(np.ptp(Ps[a:b, 0])), 2), round(float(np.ptp(Ps[a:b, 1])), 2)],
                      "rot_deg_range_in_window": round(float(np.degrees(np.ptp(Ps[a:b, 3]))), 3)}
    tmp = os.path.join(gdir, "_portrait_" + out_take)
    os.makedirs(tmp, exist_ok=True)
    for i, g in enumerate(out):
        cv2.imwrite(os.path.join(tmp, f"f_{i:04d}.png"), g)
    dst = os.path.join(gdir, out_take + ".mp4")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-framerate", "24", "-i", os.path.join(tmp, "f_%04d.png"), "-c:v", "libx264",
                    "-crf", "8", "-preset", "slow", "-pix_fmt", "yuv420p", dst], check=True)
    for fn in os.listdir(tmp):
        os.remove(os.path.join(tmp, fn))
    os.rmdir(tmp)
    a, b = WINDOW
    stats = {"upper_face_polygon": poly.round(1).tolist(), "corners": int(n0), "min_inliers_in_window": int(inl[a:b].min()),
             "take_head_in_window": {"rise_px": round(float(np.ptp(P[a:b, 1])), 1), "side_px": round(float(np.ptp(P[a:b, 0])), 1),
                                     "rot_deg": [round(float(np.degrees(P[a:b, 3].min())), 2), round(float(np.degrees(P[a:b, 3].max())), 2)],
                                     "scale": [round(float(np.exp(P[a:b, 2].min())), 4), round(float(np.exp(P[a:b, 2].max())), 4)]},
             "lip_landmark_misses": miss, "mouth_matte_share_max": max(shares), "life": life_stats,
             "skin_tone_shift_bgr_max": [round(float(v), 1) for v in np.abs(np.array(tone)).max(0)]}
    side = json.load(open(os.path.join(gdir, take + ".json")))
    side.update(take=out_take, file=os.path.relpath(dst, ROOT), treated_from=f"{shot}/{take}",
                treatment={"tool": "tools/ls_sung_portrait.py", "stats": stats,
                           "what": "the painting (frame 0) everywhere; the take's mouth, stabilised on the painted upper face, "
                                   "laid in inside the jaw line; head, helmet and suit moved as one rigid body by the take's "
                                   "own head motion scaled by 'life'; nothing re-timed"})
    side.pop("probe", None)
    json.dump(side, open(os.path.join(gdir, out_take + ".json"), "w"), indent=1, ensure_ascii=False)
    if sheet:
        x0, y0, x1, y1 = 500, 130, 1030, 640
        tiles = []
        for i in range(60, 97, 4):
            t = np.vstack([frames[i][y0:y1, x0:x1], out[i][y0:y1, x0:x1]])
            cv2.putText(t, f"f{i}", (6, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            tiles.append(cv2.resize(t, None, fx=0.4, fy=0.4, interpolation=cv2.INTER_AREA))
        cv2.imwrite(sheet, np.hstack(tiles), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(f"{clip} -> {shot}/{out_take}: {N} frames; {json.dumps(stats)}")
    return f"{shot}/{out_take}"


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--out-take")
    ap.add_argument("--life", type=float, default=0.12)
    ap.add_argument("--sheet")
    a = ap.parse_args()
    run(a.clip, a.out_take, a.life, a.sheet)
