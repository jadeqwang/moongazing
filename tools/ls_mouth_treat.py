#!/usr/bin/env python3
"""Treatment of a sung take before roto prep (rev2_ls, Oct 8). Two things, both on the take's pixels, nothing re-timed:
  A. mouth: the take's own lips, jaw and timing are kept; only the TONE inside the mouth is simplified so that the gold
     redraw can carry it (below);
  B. likeness: the painted keyframe's upper face (glasses, eyes, brows, nose) is laid over every frame, moved with the
     head (carry_upper_face). Off with --no-carry.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/ls_mouth_treat.py LS3/take_17 [--out-take take_17m] [--teeth 0.42] [--sheet OUT.jpg]

Why: on gold-line art the video model draws teeth as bright cream blocks with every tooth separated, and the tongue in
flesh colour. `paper: 'gold'` re-lays source light as matte gold, so those become a gold grille and a gold tongue
(render/out/rev2_ls/takes/LS3_15/roto_strip.jpg). A line illustrator draws teeth as one plain pale band and leaves the
inside of the mouth as the paper. This tool does exactly that, per frame, on the take's pixels:
    teeth    bright, thick blobs between the lips (thin gold lip outlines are excluded by a morphological opening)
             -> one flat, convex, soft-edged band per frame at `teeth` of the way from the skin tone to the tooth tone
                (3-frame temporal blend so it cannot flicker); when the mouth is wide open and both rows show, only
                the upper row is kept, as a line illustrator would draw it
    cavity   everything else enclosed by the lips that is not lip (tongue, gums, dark) -> the face's dark ground
Nothing is moved, added or re-timed: where the take shows no teeth, nothing changes.
Writes media/gen/<shot>/<out-take>.mp4 (+ .json sidecar copied from the source take, with "treated_from") so that
tools/roto_prep.py can be run on it unchanged. The source take and its roto folder are not touched.
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools", "sync"))
import mouth as mouthmod  # noqa: E402

FFMPEG = os.path.join(ROOT, ".venv", "bin", "ffmpeg")
INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191]
OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]


def interp(a):
    a = np.array([np.nan if v is None else v for v in a], float)
    ok = np.isfinite(a)
    return np.interp(np.arange(len(a)), np.flatnonzero(ok), a[ok])


def smooth(a, k=5):
    p = np.pad(a, k // 2, mode="edge")
    return np.convolve(p, np.ones(k) / k, mode="valid")


def treat_frame(f, mx, my, fh, upper_only=True):
    """Masks for one frame, full-frame float32: (teeth band, cavity, ground colour BGR, tooth colour BGR or None)."""
    H, W = f.shape[:2]
    x0, x1 = int(max(0, mx - 0.26 * fh)), int(min(W, mx + 0.26 * fh))
    y0, y1 = int(max(0, my - 0.16 * fh)), int(min(H, my + 0.22 * fh))
    roi = f[y0:y1, x0:x1].copy()
    lab = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0]
    # the face's dark ground: median of the darker half of a ring around the box centre (cheeks, chin)
    ring = np.ones(L.shape, bool)
    ring[int(L.shape[0] * 0.2):int(L.shape[0] * 0.85), int(L.shape[1] * 0.15):int(L.shape[1] * 0.85)] = False
    ground = np.median(roi[ring & (L < np.percentile(L[ring], 60))].reshape(-1, 3), 0)
    gL = float(np.median(L[ring & (L < np.percentile(L[ring], 60))]))
    # teeth: clearly bright (cream, L > 145; the tongue's highlights and the lips' gold outline stay below that).
    # Only blobs near the mouth centre count (the helmet ring is bright too).
    r = max(2, int(round(fh * 0.006)))
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    k3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    cx, cy = mx - x0, my - y0
    yy, xx = np.mgrid[0:L.shape[0], 0:L.shape[1]]
    near = (((xx - cx) / (0.20 * fh)) ** 2 + ((yy - cy) / (0.15 * fh)) ** 2) < 1
    bright = ((L > max(gL + 100, 145)) & near).astype(np.uint8)
    teeth = cv2.morphologyEx(bright, cv2.MORPH_OPEN, k3)   # the lips' gold outline stays below L 145 in these takes
    n, lab_, stats, cent = cv2.connectedComponentsWithStats(teeth, connectivity=8)
    keep = np.zeros_like(teeth)
    for j in range(1, n):
        if stats[j, cv2.CC_STAT_AREA] >= 8:
            keep[lab_ == j] = 1
    a_ = lab[..., 1]
    ga = float(np.median(a_[ring]))
    band = np.zeros_like(keep)
    hull = np.zeros_like(keep)
    if keep.sum() > 0:
        # one band per frame: close the gaps between single teeth, give back the shaded tooth edges next to it
        kc = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * int(fh * 0.03) + 1, 2 * r + 1))
        band = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, kc)
        band = np.maximum(band, cv2.dilate(band, k) & ((L > gL + 62) & (a_ - ga < 14)).astype(np.uint8))
        band = cv2.morphologyEx(band, cv2.MORPH_CLOSE, k)
        # single side teeth peeking at the mouth corners (bright specks beside the band) belong to it too
        band = np.maximum(band, cv2.dilate(band, kc) & bright)
        cv2.fillConvexPoly(hull, cv2.convexHull(cv2.findNonZero(band)), 1)
    # cavity -> the face's dark ground: (1) everything between the tooth rows that is not tooth; (2) tongue and gums
    # anywhere near the mouth centre: redder than anything else in this drawing (lips are grey-olive, a* 2-6 above the
    # ground; the tongue sits at a* > 9 above it at middle lightness)
    flesh = ((a_ - ga > 9) & (L > gL + 10) & (L < 150) & near).astype(np.uint8)
    flesh[cv2.dilate(band, k3) > 0] = 0
    flesh = cv2.dilate(cv2.morphologyEx(flesh, cv2.MORPH_OPEN, k), k)
    cavity = np.maximum(flesh, hull)
    cavity[band > 0] = 0
    # regular shapes: each tooth row becomes its convex outline (ragged tooth edges read as broken teeth in the redraw)
    if band.sum() > 0:
        n, lab_, stats, cen = cv2.connectedComponentsWithStats(band, connectivity=8)
        reg = np.zeros_like(band)
        big = [j for j in range(1, n) if stats[j, cv2.CC_STAT_AREA] >= max(12, 0.04 * band.sum())]   # specks are dropped
        top = min(cen[j][1] for j in big) if big else 0
        for j in big:
            if upper_only and cen[j][1] - top > 0.035 * fh:
                continue                                   # the lower tooth row of a wide-open mouth: left as the dark cavity
            cv2.fillConvexPoly(reg, cv2.convexHull(cv2.findNonZero((lab_ == j).astype(np.uint8))), 1)
        cavity = np.maximum(cavity, band)                  # whatever was tooth and is not in the regular band: ground
        band = reg
        cavity[band > 0] = 0
    full_b = np.zeros((H, W), np.float32); full_c = np.zeros((H, W), np.float32)
    full_b[y0:y1, x0:x1] = band; full_c[y0:y1, x0:x1] = cavity
    tooth = np.median(roi[keep > 0].reshape(-1, 3), 0) if keep.sum() > 0 else None
    return full_b, full_c, ground, tooth


def treat_all(frames, mx, my, fh, teeth_tone=0.3):
    """Two passes: masks per frame, then a 3-frame temporal blend of the masks (the band must not flicker), then paint."""
    M = [treat_frame(f, mx[i], my[i], fh) for i, f in enumerate(frames)]
    n = len(frames)
    teeth = [t for *_, t in M if t is not None]
    tooth = np.median(np.array(teeth), 0) if teeth else None
    outs, shares = [], []
    for i, f in enumerate(frames):
        j0, j1 = max(0, i - 1), min(n - 1, i + 1)
        band = 0.25 * M[j0][0] + 0.5 * M[i][0] + 0.25 * M[j1][0]
        cav = np.maximum(M[i][1], 0.5 * (M[j0][1] + M[j1][1]))
        ground = M[i][2]
        if band.max() == 0 and cav.max() == 0:
            outs.append(f); shares.append(0.0); continue
        bf = np.clip(cv2.GaussianBlur(band, (0, 0), max(1.2, 0.006 * fh)) * 1.15, 0, 1)[..., None]   # soft, rounded corners
        cf = np.clip(cv2.GaussianBlur(cav, (0, 0), 1.0), 0, 1)[..., None]
        out = f.astype(np.float32)
        out = out * (1 - cf) + ground[None, None, :] * cf
        if tooth is not None:
            tone = ground * (1 - teeth_tone) + tooth * teeth_tone
            out = out * (1 - bf) + tone[None, None, :] * bf
        outs.append(np.clip(out, 0, 255).astype(np.uint8)); shares.append(round(float(M[i][0].mean()), 5))
    return outs, shares


def upper_face_polygon(L, nose=True):
    """Glasses, eyes, brows (and nose) of a face from its landmarks: polygon in the frame's pixels."""
    a, b = L[33], L[263]                            # outer eye corners
    c, w = (a + b) / 2, float(np.linalg.norm(b - a))
    u = (b - a) / w; v = np.array([-u[1], u[0]])    # along the eyes, down the face
    P = lambda x, y: c + u * x * w + v * y * w
    pts = [P(-0.95, -0.50), P(0.95, -0.50), P(0.95, 0.44), P(0.34, 0.42)]
    if nose:
        nb = float(np.dot(L[2] - c, v)) / w + 0.06  # just under the nose base
        pts += [P(0.27, nb), P(-0.27, nb)]
    pts += [P(-0.34, 0.42), P(-0.95, 0.44)]
    return np.array(pts, np.float32)


def carry_upper_face(frames, key_path, smooth_frames=1.5, feather=6.0, nose=True):
    """Likeness lock, baked into the motion base: the PAINTED keyframe's upper face (glasses, eyes, brows, nose) is laid
    over every frame of the take, moved rigidly with the head (similarity transform tracked by tools/roto_keep.py's
    tracker, smoothed). The video model's own eyes and glasses, which drift from hers, never reach the redraw.
    Returns (frames, stats)."""
    sys.path.insert(0, os.path.join(ROOT, "tools"))
    import roto_keep
    import roto_prep
    H, W = frames[0].shape[:2]
    rgb = cv2.cvtColor(frames[0], cv2.COLOR_BGR2RGB)
    hit = None
    for b in mouthmod.grid_boxes(W, H):
        hit = mouthmod.detect(rgb, b)
        if hit is not None:
            break
    if hit is None:
        raise SystemExit("no face in frame 0")
    poly = upper_face_polygon(hit[0], nose)
    key = cv2.imread(os.path.join(ROOT, key_path))
    K2F = roto_prep.register_key(key, frames[0], W, H)
    patch = cv2.warpAffine(key, K2F, (W, H), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REFLECT)
    err = float(np.abs(cv2.GaussianBlur(patch, (0, 0), 3).astype(np.float32) - cv2.GaussianBlur(frames[0], (0, 0), 3).astype(np.float32)).mean())
    if err > 12:
        patch = frames[0].copy()                    # the keyframe on disk is not what this take started from
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [poly.astype(np.int32)], 1.0)
    er = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(feather * 4) | 1, int(feather * 4) | 1)))
    m = np.minimum(m, cv2.GaussianBlur(er, (0, 0), feather))
    m = np.clip(m / max(m.max(), 1e-6), 0, 1)
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    P, inl, n0 = roto_keep.track_region(grays, poly, smooth_frames)
    A = roto_keep.to_inverse_affines(P, poly)
    out = []
    for i, f in enumerate(frames):
        Ai = np.array(A[i]).reshape(2, 3)           # frame-i -> frame-0: used as the inverse map
        wk = cv2.warpAffine(patch, Ai, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)
        wm = cv2.warpAffine(m, Ai, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)[..., None]
        out.append(np.clip(f.astype(np.float32) * (1 - wm) + wk.astype(np.float32) * wm, 0, 255).astype(np.uint8))
    stats = {"polygon": poly.round(1).tolist(), "corners": int(n0), "min_inliers": int(inl[1:].min()),
             "key_reg_err": round(err, 2), "shift_px": [[round(float(a), 1), round(float(b), 1)] for a, b in P[:, :2]],
             "rot_deg": [round(float(np.degrees(t)), 2) for t in P[:, 3]], "scale": [round(float(np.exp(v)), 4) for v in P[:, 2]]}
    return out, stats


def run(clip, out_take=None, teeth_tone=0.3, sheet=None, carry=True, nose=True):
    shot, take = clip.split("/")
    gdir = os.path.join(ROOT, "media", "gen", shot)
    src = os.path.join(gdir, take + ".mp4")
    out_take = out_take or take + "m"
    cap = cv2.VideoCapture(src)
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    M = mouthmod.track(src)
    mx, my, fh = smooth(interp(M["mx"])), smooth(interp(M["my"])), float(np.nanmedian(interp(M["fh"])))
    raw = frames
    cstats = None
    if carry:
        key_path = json.load(open(os.path.join(gdir, take + ".json")))["first_frame"]
        frames, cstats = carry_upper_face(frames, key_path, nose=nose)
    tmp = os.path.join(gdir, "_treat_" + out_take)
    os.makedirs(tmp, exist_ok=True)
    outs, shares = treat_all(frames, mx, my, fh, teeth_tone)
    for i, g in enumerate(outs):
        cv2.imwrite(os.path.join(tmp, f"f_{i:04d}.png"), g)
    dst = os.path.join(gdir, out_take + ".mp4")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-framerate", "24", "-i", os.path.join(tmp, "f_%04d.png"), "-c:v", "libx264",
                    "-crf", "8", "-preset", "slow", "-pix_fmt", "yuv420p", dst], check=True)
    for fn in os.listdir(tmp):
        os.remove(os.path.join(tmp, fn))
    os.rmdir(tmp)
    side = json.load(open(os.path.join(gdir, take + ".json")))
    side.update(take=out_take, file=os.path.relpath(dst, ROOT), treated_from=f"{shot}/{take}",
                treatment={"tool": "tools/ls_mouth_treat.py", "teeth_tone": teeth_tone, "upper_face_carry": cstats,
                           "what": "teeth flattened to one pale band, tongue/cavity to the face's dark ground; nothing moved or re-timed",
                           "teeth_share_per_frame": shares})
    json.dump(side, open(os.path.join(gdir, out_take + ".json"), "w"), indent=1, ensure_ascii=False)
    if sheet:
        idx = [i for i in range(len(frames)) if 60 <= i <= 96][::3]
        tiles = []
        for i in idx:
            bw, bh = int(0.6 * fh), int(0.44 * fh)
            x0, y0 = int(mx[i] - 0.3 * fh), int(my[i] - 0.2 * fh)
            x1, y1 = x0 + bw, y0 + bh
            a = cv2.resize(raw[i][y0:y1, x0:x1], None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            b = cv2.resize(outs[i][y0:y1, x0:x1], None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            t = np.vstack([a, b])
            cv2.putText(t, f"f{i}", (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            tiles.append(t)
        cv2.imwrite(sheet, np.hstack(tiles), [cv2.IMWRITE_JPEG_QUALITY, 92])
    print(f"{clip} -> {shot}/{out_take}: {len(frames)} frames, teeth in {sum(s > 0 for s in shares)} frames")
    return f"{shot}/{out_take}"


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--out-take")
    ap.add_argument("--teeth", type=float, default=0.3)
    ap.add_argument("--sheet")
    ap.add_argument("--no-carry", action="store_true", help="do not lay the painted upper face over the take")
    ap.add_argument("--no-nose", action="store_true")
    a = ap.parse_args()
    run(a.clip, a.out_take, a.teeth, a.sheet, carry=not a.no_carry, nose=not a.no_nose)
