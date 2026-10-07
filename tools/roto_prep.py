#!/usr/bin/env python3
"""Roto prep: analyse a generated base clip so the JS renderer can REDRAW it (render/src/roto/).

The base clip is never shown. This tool only measures it; every visible mark is drawn by the shader.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python   # cv2-contrib + mediapipe
    $MPY tools/roto_prep.py K_5.1/take_1 [J_7.D2/take_2 ...] [--force] [--k 10]

Inputs   media/gen/<shot>/<take>.mp4 and <take>.json (its first_frame = the painted keyframe)
Outputs  media/gen/<shot>/frames/<take>/f_%04d.jpg      raw 24 fps frames (ffmpeg)
         media/gen/<shot>/roto/<take>/
           key.jpg        the keyframe registered onto frame 0 (frame-0 coords, 2x the work res: painted detail kept)
           c_%04d.jpg     colour guide: flow-stabilised over time, edge-preserving smoothed (frame-i coords)
           g_%04d.png     R thin line (blurred even-width skeleton x edge strength), G bold line (same, coarse scale),
                          B face/skin mask (faces get only sparse lines and flat fills)            (frame-i coords)
           mask.png       motion mask (one per shot): 1 = redraw from video, 0 = keyframe painting persists (frame-0)
           meta.json      fps, frames, size, cam (per-frame affine frame-i -> frame-0 and inverse), palette (k-means
                          of the keyframe in Lab), ink levels, face frames
Stability: colour and line guides are recursively filtered along optical flow (DIS) with an occlusion check, so the
redraw does not boil; the motion mask is a temporal max+blur; the camera path is smoothed.
"""
import argparse
import json
import os
import subprocess
import sys
import time

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG = os.path.join(ROOT, ".venv", "bin", "ffmpeg")
FACE_MODEL = os.path.join(ROOT, "tools", "sync", "models", "face_landmarker.task")
WORK_W = 1280


# ---------------------------------------------------------------------------------------------------------------- io
def extract_frames(mp4, outdir, force=False):
    if not force and os.path.isdir(outdir) and len([f for f in os.listdir(outdir) if f.endswith(".jpg")]) > 10:
        return sorted(os.path.join(outdir, f) for f in os.listdir(outdir) if f.endswith(".jpg"))
    os.makedirs(outdir, exist_ok=True)
    for f in os.listdir(outdir):
        os.remove(os.path.join(outdir, f))
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", mp4, "-vf", "fps=24", "-start_number", "0",
                    "-q:v", "2", os.path.join(outdir, "f_%04d.jpg")], check=True)
    return sorted(os.path.join(outdir, f) for f in os.listdir(outdir) if f.endswith(".jpg"))


def to_work(img, W, H):
    if img.shape[1] == W and img.shape[0] == H:
        return img
    interp = cv2.INTER_AREA if img.shape[1] > W else cv2.INTER_CUBIC
    return cv2.resize(img, (W, H), interpolation=interp)


# ------------------------------------------------------------------------------------------------- registration / cam
def register_key(key, f0, W, H):
    """Affine that maps keyframe pixels onto frame-0 pixels (the i2v model may crop/scale the first frame slightly)."""
    kh, kw = key.shape[:2]
    # cover-fit guess
    s = max(W / kw, H / kh)
    M0 = np.array([[s, 0, (W - kw * s) / 2], [0, s, (H - kh * s) / 2]], np.float32)
    small = 0.5
    ks = cv2.cvtColor(cv2.warpAffine(key, M0, (W, H), flags=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    fs = cv2.cvtColor(f0, cv2.COLOR_BGR2GRAY)
    ks = cv2.GaussianBlur(cv2.resize(ks, None, fx=small, fy=small), (0, 0), 1.2).astype(np.float32)
    fs = cv2.GaussianBlur(cv2.resize(fs, None, fx=small, fy=small), (0, 0), 1.2).astype(np.float32)
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(fs, ks, warp, cv2.MOTION_AFFINE,
                                       (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), None, 5)
    except cv2.error:
        warp = np.eye(2, 3, dtype=np.float32)
    # warp maps frame coords -> key-guess coords (at `small`); bring to full res and compose with M0
    Wf = warp.copy(); Wf[:, 2] /= small
    A = np.vstack([Wf, [0, 0, 1]])           # frame -> guess
    B = np.vstack([M0, [0, 0, 1]])           # key -> guess
    K2F = np.linalg.inv(A) @ B               # key -> frame
    return K2F[:2]


def dis():
    d = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    d.setFinestScale(1)
    return d


def fit_similarity(flow, valid, step=8):
    """Robust similarity from a dense flow field (src grid -> src+flow), RANSAC over a sparse grid."""
    h, w = flow.shape[:2]
    ys, xs = np.mgrid[step // 2:h:step, step // 2:w:step]
    v = valid[ys, xs] > 0.5
    src = np.stack([xs[v], ys[v]], -1).astype(np.float32)
    dst = src + flow[ys[v], xs[v]]
    if len(src) < 20:
        return np.eye(2, 3, dtype=np.float64), 0.0
    M, inl = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=1.0, maxIters=4000,
                                         confidence=0.995)
    if M is None:
        return np.eye(2, 3, dtype=np.float64), 0.0
    return M.astype(np.float64), float(inl.mean())


def h3(M):
    return np.vstack([M, [0, 0, 1]])


def track_camera(grays, D):
    """Per-frame affine T_i: frame-i px -> frame-0 px. Chained frame-to-frame, then re-anchored on frame 0."""
    n = len(grays)
    T = [np.eye(3)]
    h, w = grays[0].shape
    ones = np.ones((h, w), np.float32)
    for i in range(1, n):
        # flow from frame i to frame i-1: pixel in i -> where it was in i-1
        f = D.calc(grays[i], grays[i - 1], None)
        M, _ = fit_similarity(f, ones)
        Ti = T[-1] @ h3(M)
        # refine against frame 0 (bounds drift)
        Tinv = np.linalg.inv(Ti)
        stab = cv2.warpAffine(grays[i], Ti[:2], (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        f0 = D.calc(stab, grays[0], None)
        R, q = fit_similarity(f0, ones)
        if q > 0.3:
            Ti = h3(R) @ Ti
        T.append(Ti)
    T = np.array(T)
    # smooth the path (estimation jitter would read as camera shake) and snap a locked camera to identity
    P = T[:, :2, :].reshape(n, 6)
    k = cv2.getGaussianKernel(9, 2.0).ravel()
    Ps = np.stack([np.convolve(np.pad(P[:, j], 4, mode="edge"), k, mode="valid") for j in range(6)], 1)
    corners = np.array([[0, 0, 1], [w, 0, 1], [0, h, 1], [w, h, 1]], np.float64).T
    disp = max(np.abs((Ps[i].reshape(2, 3) @ corners) - corners[:2]).max() for i in range(n))
    locked = bool(disp < 1.5)
    if locked:
        Ps[:] = np.array([1, 0, 0, 0, 1, 0], np.float64)
    return [np.vstack([p.reshape(2, 3), [0, 0, 1]]) for p in Ps], locked, float(disp)


# ------------------------------------------------------------------------------------------------------- line guides
def xdog(gray, sigma, k=1.6, tau=0.98, eps=-0.008, phi=80.0):
    g = gray.astype(np.float32) / 255.0
    a = cv2.GaussianBlur(g, (0, 0), sigma)
    b = cv2.GaussianBlur(g, (0, 0), sigma * k)
    d = a - tau * b
    e = np.where(d >= eps, 1.0, 1.0 + np.tanh(phi * (d - eps)))
    return 1.0 - np.clip(e, 0, 1)  # 1 = ink


def clean_skeleton(binary, min_len):
    sk = cv2.ximgproc.thinning(binary, thinningType=cv2.ximgproc.THINNING_GUOHALL)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(sk, connectivity=8)
    keep = np.zeros(n, bool)
    keep[1:] = stats[1:, cv2.CC_STAT_AREA] >= min_len
    return (keep[lab]).astype(np.float32)


def even_line(field, strength, thr, min_len, sigma, allow=None):
    """Soft line field -> 1 px skeleton (short scraps removed) -> weighted by edge strength -> blurred to an even,
    anti-aliasable profile normalised so a centreline at strength 1 reads 1.0. The shader thresholds it for width."""
    b = (field > thr).astype(np.uint8) * 255
    sk = clean_skeleton(b, min_len)
    if allow is not None:
        sk *= allow
    sk *= strength
    out = cv2.GaussianBlur(sk, (0, 0), sigma) * (np.sqrt(2 * np.pi) * sigma)
    return np.clip(out, 0, 1)


def edge_strength(gray, sigma):
    g = cv2.GaussianBlur(gray.astype(np.float32) / 255.0, (0, 0), sigma)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    m = np.sqrt(gx * gx + gy * gy)
    return m


# ------------------------------------------------------------------------------------------------------------ faces
FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149,
             150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
L_EYE = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
R_EYE = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]
L_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
R_BROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]
EYE_ANCH = [33, 133, 362, 263, 168, 6, 197, 70, 300, 105, 334, 1]
# kept per frame for the drawn mouth: corners, inner upper/lower centre, outer upper/lower centre, forehead, chin,
# outer eye corners, nose tip
LM_KEEP = [61, 291, 13, 14, 0, 17, 10, 152, 33, 263, 1]
NOSE_TIP = [1, 2, 98, 327, 4, 5, 94, 19, 48, 278, 64, 294, 240, 460]


class Faces:
    def __init__(self):
        self.ok = False
        try:
            import mediapipe as mp
            from mediapipe.tasks import python as mpt
            from mediapipe.tasks.python import vision
            opts = vision.FaceLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=FACE_MODEL),
                                                running_mode=vision.RunningMode.VIDEO, num_faces=2,
                                                min_face_detection_confidence=0.3, min_tracking_confidence=0.3)
            self.lm = vision.FaceLandmarker.create_from_options(opts)
            self.mp = mp
            self.ok = True
        except Exception as e:  # noqa: BLE001
            print("  face landmarker unavailable:", e)

    def masks(self, bgr, idx, lips=True):
        """-> (face_mask, allow_mask, landmarks of the largest face (478x2, px)) or (None, None, None)."""
        if not self.ok:
            return None, None, None
        h, w = bgr.shape[:2]
        img = self.mp.Image(image_format=self.mp.ImageFormat.SRGB, data=cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        r = self.lm.detect_for_video(img, int(idx * 1000 / 24))
        if not r.face_landmarks:
            return None, None, None
        face = np.zeros((h, w), np.float32)
        allow = np.zeros((h, w), np.float32)
        best, bw = None, 0
        glasses = None
        for lms in r.face_landmarks:
            P = np.array([[p.x * w, p.y * h] for p in lms], np.float32)
            oval = P[FACE_OVAL].astype(np.int32)
            fw = np.ptp(P[FACE_OVAL][:, 0])
            if fw > bw:
                best, bw = P, fw
            m = np.zeros((h, w), np.uint8)
            cv2.fillPoly(m, [oval], 1)
            # shrink so the face silhouette / jaw / hair contour stays drawable
            er = max(2, int(fw * 0.045))
            m = cv2.erode(m, np.ones((er, er), np.uint8))
            face = np.maximum(face, m.astype(np.float32))
            a = np.zeros((h, w), np.uint8)
            lw = max(3, int(fw * 0.05))
            for ids in ((L_EYE, R_EYE, LIPS) if lips else (L_EYE, R_EYE)):
                cv2.polylines(a, [P[ids].astype(np.int32)], True, 1, lw)
                cv2.fillPoly(a, [cv2.convexHull(P[ids].astype(np.int32))], 1)
            for ids in (L_BROW, R_BROW):
                cv2.fillPoly(a, [cv2.convexHull(P[ids].astype(np.int32))], 1)
                cv2.polylines(a, [P[ids].astype(np.int32)], True, 1, lw)
            hull = cv2.convexHull(P[NOSE_TIP].astype(np.int32))
            cv2.fillPoly(a, [hull], 1)
            # glasses: a box around both eyes; only strong edges survive inside it (rims yes, under-eye folds no)
            ge = np.zeros((h, w), np.uint8)
            for ids in (L_EYE, R_EYE):
                c = P[ids].mean(0); ew = np.ptp(P[ids][:, 0])
                cv2.ellipse(ge, (int(c[0]), int(c[1])), (int(ew * 1.05), int(ew * 0.75)), 0, 0, 360, 1, -1)
            bridge = P[[168, 6]].astype(np.int32)
            cv2.line(ge, tuple(bridge[0]), tuple(bridge[1]), 1, max(3, int(fw * 0.06)))
            glasses = np.maximum(glasses, ge.astype(np.float32)) if glasses is not None else ge.astype(np.float32)
            allow = np.maximum(allow, a.astype(np.float32))
        self.glasses = glasses
        return face, allow, best


# ------------------------------------------------------------------------------------------------------------ main
def lab_kmeans(bgr, k, mask=None):
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    if mask is not None:
        lab = lab[mask.reshape(-1) > 0]
    rng = np.random.default_rng(7)
    sample = lab[rng.choice(len(lab), min(len(lab), 60000), replace=False)]
    cv2.setRNGSeed(7)
    _, lbl, C = cv2.kmeans(sample, k, None, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_MAX_ITER, 60, 0.2), 4,
                           cv2.KMEANS_PP_CENTERS)
    cnt = np.bincount(lbl.ravel(), minlength=k)
    order = np.argsort(-cnt)
    rgb = cv2.cvtColor(C[order].reshape(1, -1, 3).astype(np.uint8), cv2.COLOR_LAB2RGB).reshape(-1, 3)
    return [[round(c / 255, 4) for c in col] for col in rgb.tolist()], (cnt[order] / cnt.sum()).round(4).tolist()


def flow_warp(img, flow):
    h, w = flow.shape[:2]
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(img, gx + flow[..., 0], gy + flow[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


def prep(clip, k=10, force=False, alpha=0.38, motion_thr=0.8, remouth=None, eyelock=None):
    shot, take = clip.split("/")
    if remouth is None:
        remouth = shot.startswith("LS")
    if eyelock is None:
        eyelock = shot.startswith("LS") or shot.startswith("J_")
    gdir = os.path.join(ROOT, "media", "gen", shot)
    meta_take = json.load(open(os.path.join(gdir, take + ".json")))
    mp4 = os.path.join(gdir, take + ".mp4")
    fdir = os.path.join(gdir, "frames", take)
    odir = os.path.join(gdir, "roto", take)
    os.makedirs(odir, exist_ok=True)
    t0 = time.time()
    files = extract_frames(mp4, fdir, force)
    first = cv2.imread(files[0])
    vh, vw = first.shape[:2]
    W = WORK_W
    H = int(round(W * vh / vw / 2) * 2)
    frames = [to_work(cv2.imread(f), W, H) for f in files]
    n = len(frames)
    print(f"{clip}: {n} frames {vw}x{vh} -> work {W}x{H}")
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    D = dis()

    # keyframe, registered onto frame 0, stored at 2x work res
    kpath = meta_take["first_frame"]
    key = cv2.imread(kpath if os.path.isabs(kpath) else os.path.join(ROOT, kpath))
    K2F = register_key(key, frames[0], W, H)
    KS = 2
    S2 = np.array([[KS, 0, 0], [0, KS, 0], [0, 0, 1]], np.float64)
    Mk = (S2 @ h3(K2F))[:2]
    key_reg = cv2.warpAffine(key, Mk, (W * KS, H * KS), flags=cv2.INTER_AREA if key.shape[1] > W * KS else cv2.INTER_CUBIC,
                             borderMode=cv2.BORDER_REFLECT)
    cv2.imwrite(os.path.join(odir, "key.jpg"), key_reg, [cv2.IMWRITE_JPEG_QUALITY, 94])
    key_w = cv2.resize(key_reg, (W, H), interpolation=cv2.INTER_AREA)
    reg_err = float(np.abs(cv2.GaussianBlur(key_w, (0, 0), 3).astype(np.float32) -
                           cv2.GaussianBlur(frames[0], (0, 0), 3).astype(np.float32)).mean())
    print(f"  key registered (mean abs diff vs frame 0 after blur: {reg_err:.1f})")

    # camera
    T, locked, disp = track_camera(grays, D)
    print(f"  camera: {'locked' if locked else 'moving'} (max corner travel {disp:.1f}px)")

    # motion mask (frame-0 coords), ONE per shot: the union of real frame-to-frame motion (subjects, water, cloth),
    # so it never pops or slides, it covers the places a subject has left (no keyframe ghosts), and the model's slow
    # generative drift of the background (< ~0.5 px/frame) does not count: there the painted keyframe persists.
    stabs = []
    for i in range(n):
        stabs.append(grays[i] if locked else cv2.warpAffine(grays[i], T[i][:2], (W, H), flags=cv2.INTER_LINEAR,
                                                             borderMode=cv2.BORDER_REPLICATE))
    union = np.zeros((H, W), np.float32)
    acc_m = np.zeros((H, W), np.float32)
    for i in range(2, n):
        fl = D.calc(stabs[i - 2], stabs[i], None)             # two-frame step: one drawing on twos
        fm = np.linalg.norm(fl, axis=2)
        m = np.clip((fm - motion_thr) / (motion_thr * 1.5), 0, 1)
        # flow is only evidence where there is structure (flat sky/paper gives random DIS vectors)
        tex = np.maximum(edge_strength(stabs[i], 1.0), edge_strength(stabs[i - 2], 1.0))
        tex = cv2.dilate(cv2.GaussianBlur(tex, (0, 0), 2.0), np.ones((9, 9), np.uint8))
        m *= np.clip((tex - 0.04) / 0.06, 0, 1)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        acc_m += m
        union = np.maximum(union, m)
    # require motion in a couple of drawings (flow noise is not a performance), then make it a soft, generous matte
    persist = np.clip(acc_m / 3.0, 0, 1)
    union = np.minimum(union, persist)
    union = cv2.morphologyEx(union, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    union = cv2.dilate(union, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    union = np.clip(cv2.GaussianBlur(union, (0, 0), 9) * 1.4, 0, 1)
    cv2.imwrite(os.path.join(odir, "mask.png"), (union * 255).astype(np.uint8))
    cover = float(union.mean())
    print(f"  motion mask: coverage {cover:.3f}")
    masks = None

    # colour + line guides, recursively filtered along flow
    dark_ground = bool(cv2.cvtColor(key_w, cv2.COLOR_BGR2GRAY).mean() < 75)
    faces = Faces()
    face_lm, ref_face = [], None
    acc = None
    accX = None
    prev_g = None
    face_frames = []
    for i in range(n):
        f = frames[i].astype(np.float32)
        if acc is None:
            acc = f.copy()
        else:
            fl = D.calc(grays[i], prev_g, None)              # i -> i-1
            warped = flow_warp(acc, fl)
            raw_prev = flow_warp(frames[i - 1].astype(np.float32), fl)
            err = np.abs(raw_prev - f).mean(2)
            # forward-backward occlusion check
            fb = D.calc(prev_g, grays[i], None)
            back = flow_warp(fb, fl)
            fbe = np.linalg.norm(fl + back, axis=2)
            w = np.clip(1 - (err - 6) / 18, 0, 1) * np.clip(1 - (fbe - 0.6) / 1.5, 0, 1)
            w = cv2.GaussianBlur(w, (0, 0), 1.5)[..., None]
            a = alpha + (1 - alpha) * (1 - w)
            acc = a * f + (1 - a) * warped
        prev_g = grays[i]
        base = np.clip(acc, 0, 255).astype(np.uint8)
        # edge-preserving smoothing toward flat fills (mean shift flattens, bilateral cleans the seams)
        sm = cv2.pyrMeanShiftFiltering(base, 7, 16, maxLevel=1)
        sm = cv2.bilateralFilter(sm, 7, 22, 5)

        g = cv2.cvtColor(cv2.bilateralFilter(base, 7, 30, 5), cv2.COLOR_BGR2GRAY)
        if dark_ground:  # bright lines on a dark ground (gold on indigo): find the lines, not their two flanks
            g = 255 - g
        X = np.stack([xdog(g, 1.0), xdog(g, 2.2, tau=0.975)], -1)
        if accX is None or i == 0:
            accX = X
        else:
            Xw = flow_warp(accX, fl)
            accX = a * X + (1 - a) * Xw if a.ndim == 3 else X
        es = edge_strength(g, 1.2)
        es = np.clip(es / (np.percentile(es, 99) + 1e-4), 0, 1)
        strength = 0.45 + 0.55 * np.sqrt(cv2.GaussianBlur(es, (0, 0), 2.0) / (cv2.GaussianBlur(es, (0, 0), 2.0).max() + 1e-4))
        fm, allow, Pm = faces.masks(base, i, lips=not remouth)
        allow_full = None
        if fm is not None:
            face_frames.append(i)
            strong = np.clip((strength - 0.72) / 0.1, 0, 1)
            allow = np.maximum(allow, faces.glasses * strong)
            allow_full = 1 - fm * (1 - allow)
        thin = even_line(accX[..., 0], np.clip(strength, 0, 1), 0.5, 14, 1.1, allow_full)
        bold = even_line(accX[..., 1], np.clip(strength * 1.1, 0, 1), 0.55, 30, 2.2, allow_full)
        face_lm.append(None if Pm is None else Pm[LM_KEEP].copy())
        if Pm is not None and ref_face is None:
            ref_face = (Pm.copy(), sm.copy(), thin.copy(), bold.copy())
        elif Pm is not None and eyelock:
            fw = np.ptp(Pm[FACE_OVAL][:, 0])
            if True:
                # eyes, brows and crease keep the KEYFRAME's geometry (the video model shrinks eyes over a clip):
                # the first drawing's eye region is carried rigidly by the face's similarity motion
                P0, sm0, th0, bo0 = ref_face
                E, _ = cv2.estimateAffinePartial2D(P0[EYE_ANCH], Pm[EYE_ANCH])
                if E is not None:
                    r = np.zeros((H, W), np.uint8)
                    for ids in (L_EYE + L_BROW, R_EYE + R_BROW, NOSE_TIP + [168, 6]):
                        cv2.fillPoly(r, [cv2.convexHull(Pm[ids].astype(np.int32))], 1)
                    r = cv2.dilate(r, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(fw * 0.12) | 1,) * 2))
                    r = cv2.GaussianBlur(r.astype(np.float32), (0, 0), fw * 0.025)
                    wa = lambda im: cv2.warpAffine(im, E, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
                    sm = (sm * (1 - r[..., None]) + wa(sm0).astype(np.float32) * r[..., None]).astype(np.uint8)
                    thin = thin * (1 - r) + wa(th0) * r
                    bold = bold * (1 - r) + wa(bo0) * r
        if Pm is not None and remouth:
            # the video's own mouth is painted out with the surrounding skin; render/src/roto/mouth.js draws the lips
            fw = np.ptp(Pm[FACE_OVAL][:, 0])
            mw = np.linalg.norm(Pm[291] - Pm[61])
            r = np.zeros((H, W), np.uint8)
            cv2.fillPoly(r, [cv2.convexHull(Pm[LIPS].astype(np.int32))], 255)
            r = cv2.dilate(r, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(mw * 0.45) | 1,) * 2))
            ring = cv2.dilate(r, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(mw * 0.35) | 1,) * 2)) - r
            ring = (ring > 0) & (fm > 0.5)
            px = sm[ring].reshape(-1, 3).astype(np.float32)
            if len(px) > 20:
                lum_ = px.mean(1)
                px = px[lum_ >= np.percentile(lum_, 35)]           # skin, not the lip shadow or nostrils
                skin = np.median(px, 0)
            else:
                skin = np.median(sm[fm > 0.5].reshape(-1, 3), 0)
            rf = cv2.GaussianBlur(r.astype(np.float32) / 255, (0, 0), mw * 0.07)
            rf = np.clip(rf * 1.25, 0, 1)
            sm = np.clip(sm * (1 - rf[..., None]) + skin[None, None, :] * rf[..., None], 0, 255).astype(np.uint8)
            thin *= 1 - rf
            bold *= 1 - rf
        cv2.imwrite(os.path.join(odir, f"c_{i:04d}.jpg"), sm, [cv2.IMWRITE_JPEG_QUALITY, 92])
        fmask = cv2.GaussianBlur(fm, (0, 0), 3) if fm is not None else np.zeros((H, W), np.float32)
        G = np.dstack([fmask, bold, thin])  # BGR -> R thin, G bold, B face
        cv2.imwrite(os.path.join(odir, f"g_{i:04d}.png"), (np.clip(G, 0, 1) * 255).astype(np.uint8),
                    [cv2.IMWRITE_PNG_COMPRESSION, 4])
        if i % 24 == 0:
            print(f"  guides {i}/{n}  {time.time() - t0:.0f}s")

    # face track for the drawn mouth: hold across misses, then smooth (mediapipe jitter must not read as a tremble)
    face_track = None
    if any(f is not None for f in face_lm):
        arr = [f for f in face_lm]
        last = next(f for f in arr if f is not None)
        for j in range(n):
            if arr[j] is None:
                arr[j] = last
            last = arr[j]
        A = np.array(arr, np.float64)
        kk = cv2.getGaussianKernel(7, 1.2).ravel()
        Ap = np.pad(A, ((3, 3), (0, 0), (0, 0)), mode="edge")
        A = np.stack([sum(kk[q] * Ap[j + q] for q in range(7)) for j in range(n)])
        face_track = {"ids": LM_KEEP, "pts": [np.round(a.ravel(), 1).tolist() for a in A],
                      "hit": [f is not None for f in face_lm]}
    # palette: the whole keyframe, PLUS the moving region (the characters get their own pigments), PLUS skin from
    # the face (a small face never wins a cluster of its own, and snapping skin to the wall colour flattens her away)
    pal, share = lab_kmeans(key_w, k)
    mreg = (cv2.resize(union, (W, H)) > 0.5).astype(np.uint8)
    if mreg.sum() > 2000:
        p2, s2 = lab_kmeans(key_w, 6, mreg)
        pal += p2; share += [0.0] * len(p2)
    if ref_face is not None:
        P0 = ref_face[0]
        fmk = np.zeros((H, W), np.uint8)
        cv2.fillPoly(fmk, [P0[FACE_OVAL].astype(np.int32)], 1)
        for ids in (L_EYE, R_EYE, LIPS, L_BROW, R_BROW):
            cv2.fillPoly(fmk, [cv2.convexHull(P0[ids].astype(np.int32))], 0)
        fmk = cv2.erode(fmk, np.ones((9, 9), np.uint8))
        if fmk.sum() > 300:
            p3, _ = lab_kmeans(key_w, 3, fmk)
            pal += p3; share += [0.0] * len(p3)
    # drop near-duplicates (Lab distance < 6), keep at most 16
    lab = cv2.cvtColor(np.array([pal], np.float32), cv2.COLOR_RGB2LAB)[0]
    keep = []
    for j in range(len(pal)):
        if all(np.linalg.norm(lab[j] - lab[q]) >= 6 for q in keep):
            keep.append(j)
    pal = [pal[j] for j in keep][:16]
    share = [share[j] for j in keep][:16]
    # ink levels: luminance clusters of the keyframe (the washes the painter actually used)
    lum = cv2.cvtColor(key_w, cv2.COLOR_BGR2GRAY).reshape(-1, 1).astype(np.float32)
    cv2.setRNGSeed(7)
    _, lab_, C = cv2.kmeans(lum[::7], 5, None, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_MAX_ITER, 50, 0.2), 4,
                            cv2.KMEANS_PP_CENTERS)
    levels = sorted(round(float(c) / 255, 4) for c in C.ravel())
    meta = {
        "clip": clip, "fps": 24, "frames": n, "w": W, "h": H, "src": [vw, vh], "keyScale": KS,
        "first_frame": kpath, "locked": locked, "cam_travel_px": round(disp, 2), "key_reg_err": round(reg_err, 2),
        # T: frame-i px -> frame-0 px (row-major 2x3);  Ti: inverse
        "T": [np.round(t[:2].ravel(), 6).tolist() for t in T],
        "Ti": [np.round(np.linalg.inv(t)[:2].ravel(), 6).tolist() for t in T],
        "palette": pal, "paletteShare": share, "inkLevels": levels,
        "faceFrames": face_frames, "face": face_track, "remouth": remouth, "eyelock": eyelock, "mask": "mask.png", "darkGround": dark_ground, "maskCoverage": round(cover, 4),
        "made": time.strftime("%Y-%m-%d %H:%M"),
    }
    json.dump(meta, open(os.path.join(odir, "meta.json"), "w"), indent=1)
    print(f"  done in {time.time() - t0:.0f}s -> {os.path.relpath(odir, ROOT)}  faces in {len(face_frames)}/{n} frames")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("clips", nargs="+")
    ap.add_argument("--k", type=int, default=10)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    for c in a.clips:
        prep(c, a.k, a.force)
