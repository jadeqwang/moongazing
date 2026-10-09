#!/usr/bin/env python3
"""Agency emblem on uniforms: composite the real emblem into a painted keyframe and carry it on the take.

Why: image and video models draw the chest patch as a plain dark disc (or leave it off), and the roto redraw flattens
what little they draw. The emblem (media/chars/identity/emblem_final_small.png: pale-blue dot in a sunbeam, no red)
is therefore set by us, once, in the painting, lit by the cloth it sits on, and the roto shader shows that painted
patch on the chest's tracked motion ("patch" in meta.json; render/src/roto/shader.js uPatch*). Unlike roto_keep (two
face regions, compared against the key), a clip can carry up to 8 patches, the static key plate never contains the
emblem (so a chest that drifts cannot leave a second emblem behind), and occlusion is judged against the cloth colour.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/emblem_patch.py K_7.C4_c6_kenji            # one shot from tools/emblem_patch.json (or --all)
    $MPY tools/emblem_patch.py K_7.C4_c6_kenji --preview  # keyframe composite preview only: nothing is written

Spec (tools/emblem_patch.json): { "<keyframe>": { "take": "take_2" | null, "emblems": [ {
    "x","y"      centre, KEYFRAME px          "d"   diameter along the long axis, keyframe px
    "sq"         short/long axis (chest turned away from the camera: < 1), "ax" long-axis angle in degrees
    "rot"        rotation of the artwork on the cloth, degrees (the beam leans with the torso)
    "mode"       "add" (bare cloth) | "replace" (a wrong disc is there: found near x,y, painted out, same size reused
                 unless "d" is given) | "carry" (the painting is already right: only carried on the take)
    "occ"        [[x,y],...] keyframe-px polygon(s) of whatever the painting has IN FRONT of the patch (a hand)
    "track"      [[x,y],...] keyframe-px polygon to track instead of the cloth around the patch
    "white"      lighting reference (default 246); lower on dark cloth so its pigment is not mistaken for shadow
    "occl"       "cloth" (default for add: hidden where the take stops looking like the cloth) | "frame" (default for
                 replace/carry: per-frame visibility from the take at the patch centre) | "none"
} ] } }
Writes: the keyframe (old one kept as <name>_vN first, recorded in the spec's "_orig"), and in roto/<take>/:
pkey.jpg (key plate + emblems), pmask.png (patch mattes), key.jpg (wrong discs painted out; first copy kept as
key_orig.jpg), meta.json["patch"], and touches the folder so the pick stays valid. Re-runs start from the originals.
Run it AGAIN after any tools/roto_prep.py re-run on a listed take (prep rewrites meta.json and key.jpg), and after
tools/roto_keep.py is fine either way (keep and patch are independent). Check render/out/rev_emblem/track/track_<K>.jpg.
"""
import argparse
import json
import os
import shutil
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from roto_keep import to_inverse_affines  # noqa: E402

SPEC = os.path.join(ROOT, "tools", "emblem_patch.json")
EMBLEM = os.path.join(ROOT, "media", "chars", "identity", "emblem_final_small.png")
KDIRS = ["media/keyframes", "media/keyframes/jade"]


def kf_path(name):
    for d in KDIRS:
        for e in (".jpg", ".png"):
            p = os.path.join(ROOT, d, name + e)
            if os.path.exists(p):
                return p
    raise SystemExit(f"no keyframe {name}")


def lab(bgr):
    """The roto shader's toLab (gamma 2.2), so thresholds mean the same thing here and there."""
    c = np.clip(np.asarray(bgr, np.float64)[..., ::-1] / 255.0, 0, 1) ** 2.2
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.maximum(xyz, 1e-5) ** (1 / 3), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def ellipse_mask(shape, cx, cy, d, sq, ax, grow=1.0, soft=0.0):
    m = np.zeros(shape[:2], np.uint8)
    cv2.ellipse(m, (int(round(cx * 16)), int(round(cy * 16))), (int(round(d / 2 * grow * 16)), int(round(d / 2 * sq * grow * 16))),
                ax, 0, 360, 255, -1, cv2.LINE_AA, 4)
    m = m.astype(np.float32) / 255
    return cv2.GaussianBlur(m, (0, 0), soft) if soft > 0 else m


def find_disc(img, x, y, search):
    """The wrong disc near (x, y): the blob that is not cloth -> (cx, cy, d, sq, ax, its dark colour BGR)."""
    r = int(search)
    x0, y0 = max(0, int(x) - r), max(0, int(y) - r)
    c = img[y0:int(y) + r, x0:int(x) + r]
    g = cv2.cvtColor(c, cv2.COLOR_BGR2GRAY)
    L = lab(cv2.GaussianBlur(c, (0, 0), 1.0))
    ref = np.median(L[g > np.percentile(g, 70)], 0)
    non = (np.linalg.norm((L - ref) * [0.7, 1, 1], axis=-1) > 16).astype(np.uint8)
    k = int(max(3, search / 9)) | 1
    non = cv2.morphologyEx(non, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    n, labm, stats, cen = cv2.connectedComponentsWithStats(non, connectivity=4)
    sx, sy = int(x) - x0, int(y) - y0
    best = labm[sy, sx]
    if best == 0:
        ys, xs = np.nonzero(non)
        if not len(xs):
            raise SystemExit(f"no disc found near {x},{y}")
        i = np.argmin(np.hypot(xs - sx, ys - sy)); best = labm[ys[i], xs[i]]
    blob = (labm == best).astype(np.uint8)
    cnt, _ = cv2.findContours(blob, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    hull = cv2.convexHull(max(cnt, key=cv2.contourArea))
    (ex, ey), (a, b), ang = cv2.fitEllipse(hull)
    if a < b:
        a, b, ang = b, a, ang + 90
    px = c[blob > 0]
    gp = g[blob > 0]
    dark = np.median(px[gp <= np.percentile(gp, 45)], 0)
    return ex + x0, ey + y0, float(a), float(b / a), float(ang % 180), [float(v) for v in dark]


def paint_out(img, cx, cy, d, sq, ax, grow=1.1):
    """Cloth where the wrong disc was (Telea inpaint from the cloth around it)."""
    m = (ellipse_mask(img.shape, cx, cy, d, sq, ax, grow) > 0.02).astype(np.uint8) * 255
    r = int(d * grow) + 12
    x0, y0 = max(0, int(cx) - r), max(0, int(cy) - r)
    sl = (slice(y0, int(cy) + r), slice(x0, int(cx) + r))
    out = img.copy()
    out[sl] = cv2.inpaint(img[sl], m[sl], max(3, d * 0.12), cv2.INPAINT_TELEA)
    return out


def comp(img, em, cx, cy, d, sq=1.0, ax=0.0, rot=0.0, occ=None, match=None, white=246.0):
    """The emblem printed on the cloth at (cx, cy): returns (image, alpha). Lit by the cloth under it (the low
    frequencies of the painting there tint and dim it), creased by its folds (the high frequencies), soft-edged like
    the rest of the painting, with the hairline the painter gives every edge."""
    R = d / 2
    pad = int(R * 3) + 10
    x0, y0 = int(round(cx)) - pad, int(round(cy)) - pad
    x1, y1 = x0 + 2 * pad, y0 + 2 * pad
    X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(img.shape[1], x1), min(img.shape[0], y1)
    crop = img[Y0:Y1, X0:X1].astype(np.float32)
    lcx, lcy = cx - X0, cy - Y0
    # emblem unit square -> image: artwork rotation, then the chest's foreshortening along the short axis
    SS = 3
    nt = int(min(em.shape[0], max(48, d * SS * 1.4)))
    if nt < em.shape[0]:
        em = cv2.resize(em, (nt, nt), interpolation=cv2.INTER_AREA)
    n = em.shape[0]
    s = d / n
    a, r_ = np.radians(ax), np.radians(rot)
    Ra = np.array([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    Rr = np.array([[np.cos(r_), -np.sin(r_)], [np.sin(r_), np.cos(r_)]])
    A = Ra @ np.diag([1.0, sq]) @ Ra.T @ Rr * s
    t = np.array([lcx, lcy]) - A @ np.array([n / 2, n / 2])
    Mw = np.hstack([A, t[:, None]]).astype(np.float32)
    # supersample the warp 3x, then area-average: clean edges at 20 px as well as 120
    wr = cv2.warpAffine(em, Mw * SS, (crop.shape[1] * SS, crop.shape[0] * SS), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    wr = cv2.resize(wr, (crop.shape[1], crop.shape[0]), interpolation=cv2.INTER_AREA).astype(np.float32)
    al = wr[..., 3] / 255.0
    soft = max(0.45, d / 90.0)
    al = cv2.GaussianBlur(al, (0, 0), soft)
    col = cv2.GaussianBlur(wr[..., :3], (0, 0), soft * 0.7)
    aw = cv2.GaussianBlur(wr[..., 3] / 255.0, (0, 0), soft * 0.7)[..., None]
    col = col / np.maximum(aw, 1e-3)                                  # un-premultiply after the blur
    # light: the cloth's own colour around and under the patch
    low = cv2.GaussianBlur(crop, (0, 0), max(2.0, R * 0.55))
    g = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    gl = cv2.GaussianBlur(g, (0, 0), max(1.5, R * 0.30))
    fold = np.clip(g / np.maximum(gl, 1.0), 0.72, 1.12)[..., None] ** 0.75
    lit = col * np.clip(low / white, 0.0, 1.05) * fold
    lit = lit * 0.93 + low * 0.07                                      # matte ink: a little of the cloth comes through
    if match is not None:
        # the painting's air: lift our indigo to the dark of the disc it replaces (distant figures are hazed, not black)
        lc = low[int(np.clip(lcy, 0, low.shape[0] - 1)), int(np.clip(lcx, 0, low.shape[1] - 1))]
        ind = np.array([62.0, 33.0, 22.0]) * np.clip(lc / white, 0, 1.05) * 0.93 + lc * 0.07
        lit = lit + np.clip(0.8 * (np.array(match) - ind), 0, 90)
    if occ:
        om = np.zeros(crop.shape[:2], np.uint8)
        for poly in occ:
            cv2.fillPoly(om, [np.round(np.array(poly, np.float32) - [X0, Y0]).astype(np.int32)], 255, cv2.LINE_AA)
        al = al * (1 - cv2.GaussianBlur(om.astype(np.float32) / 255, (0, 0), 0.8))
    A3 = al[..., None]
    # hairline: the cloth just outside the rim, a touch darker (stitched edge / the painter's contour)
    ring = np.clip(cv2.GaussianBlur((al > 0.05).astype(np.float32), (0, 0), max(0.8, d / 60.0)) - al, 0, 1)[..., None]
    base = crop * (1 - 0.16 * np.minimum(ring * 2.2, 1.0))
    out = img.copy()
    out[Y0:Y1, X0:X1] = np.clip(base * (1 - A3) + lit * A3, 0, 255).round().astype(np.uint8)
    full = np.zeros(img.shape[:2], np.float32)
    full[Y0:Y1, X0:X1] = np.clip(al + ring[..., 0] * 0.9, 0, 1)
    return out, full


def register(src, dst):
    """Affine src px -> dst px between two versions of the same painting (keyframe -> roto key plate)."""
    H, W = dst.shape[:2]
    kh, kw = src.shape[:2]
    s = max(W / kw, H / kh)
    M0 = np.array([[s, 0, (W - kw * s) / 2], [0, s, (H - kh * s) / 2]], np.float32)
    f = 640.0 / W
    ks = cv2.cvtColor(cv2.warpAffine(src, M0, (W, H), flags=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    ks = cv2.GaussianBlur(cv2.resize(ks, None, fx=f, fy=f, interpolation=cv2.INTER_AREA), (0, 0), 1.2).astype(np.float32)
    fs = cv2.GaussianBlur(cv2.resize(cv2.cvtColor(dst, cv2.COLOR_BGR2GRAY), None, fx=f, fy=f, interpolation=cv2.INTER_AREA), (0, 0), 1.2).astype(np.float32)
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(fs, ks, warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-7), None, 5)
    except cv2.error:
        print("  (ECC failed: cover-fit guess used)")
    Wf = warp.copy(); Wf[:, 2] /= f
    K = np.linalg.inv(np.vstack([Wf, [0, 0, 1]])) @ np.vstack([M0, [0, 0, 1]])
    return K[:2]


def xf(M, e):
    """An emblem spec carried through an affine (keyframe px -> key-plate px)."""
    p = M @ np.array([e["x"], e["y"], 1.0])
    s = float(np.sqrt(abs(np.linalg.det(M[:, :2]))))
    o = dict(e, x=float(p[0]), y=float(p[1]), d=e["d"] * s)
    for k in ("occ", "track"):
        if e.get(k):
            polys = e[k] if k == "occ" else [e[k]]
            polys = [(np.array(q, np.float64) @ M[:, :2].T + M[:, 2]).tolist() for q in polys]
            o[k] = polys if k == "occ" else polys[0]
    return o


def track(grays, tmask, c, smooth):
    """Similarity frame-0 -> frame-i of the cloth around a patch (LK corners in tmask, forward-backward checked)."""
    p0 = cv2.goodFeaturesToTrack(grays[0], 300, 0.003, 3, mask=tmask, blockSize=5)
    if p0 is None or len(p0) < 10:
        return None, None, 0
    p0 = p0.reshape(-1, 2).astype(np.float32)
    lk = dict(winSize=(21, 21), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 40, 0.01))
    params, inl = [(0.0, 0.0, 0.0, 0.0)], [len(p0)]
    guess = p0.copy()
    for g in grays[1:]:
        p1, st, _ = cv2.calcOpticalFlowPyrLK(grays[0], g, p0, guess.copy(), flags=cv2.OPTFLOW_USE_INITIAL_FLOW, **lk)
        pb, st2, _ = cv2.calcOpticalFlowPyrLK(g, grays[0], p1, p0.copy(), flags=cv2.OPTFLOW_USE_INITIAL_FLOW, **lk)
        ok = (st.ravel() == 1) & (st2.ravel() == 1) & (np.linalg.norm(pb - p0, axis=1) < 1.0)
        A, m = (cv2.estimateAffinePartial2D(p0[ok], p1[ok], method=cv2.RANSAC, ransacReprojThreshold=1.2) if ok.sum() >= 6 else (None, None))
        if A is None:
            params.append(params[-1]); inl.append(0); continue
        s = float(np.hypot(A[0, 0], A[1, 0])); th = float(np.arctan2(A[1, 0], A[0, 0]))
        tc = A @ np.array([c[0], c[1], 1.0]) - c
        params.append((float(tc[0]), float(tc[1]), float(np.log(s)), th)); inl.append(int(m.sum()))
        guess = (p0 @ A[:, :2].T + A[:, 2]).astype(np.float32)
    P = np.array(params)
    if smooth > 0:
        k = int(max(3, round(smooth * 3)) * 2 + 1)
        ker = cv2.getGaussianKernel(k, smooth).ravel()
        Pp = np.pad(P, ((k // 2, k // 2), (0, 0)), mode="edge")
        P = np.stack([np.convolve(Pp[:, j], ker, mode="valid") for j in range(4)], 1)
    return P, np.array(inl), len(p0)


def cloth_mask(frame, c, d, rad):
    """Trackable cloth round a patch: pixels of the garment's colour within `rad`, closed over seams and buttons."""
    H, W = frame.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    rr = np.hypot(xx - c[0], yy - c[1])
    L = lab(cv2.GaussianBlur(frame, (0, 0), 1.5))
    ann = (rr > d * 0.7) & (rr < d * 1.5)
    ref = np.median(L[ann], 0)
    m = ((np.linalg.norm((L - ref) * [0.6, 1, 1], axis=-1) < 20) & (rr < rad)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    m[rr < d * 0.8] = 1
    return m * 255


def next_backup(path):
    b, e = os.path.splitext(path)
    n = 1
    while os.path.exists(f"{b}_v{n}{e}"):
        n += 1
    return f"{b}_v{n}{e}"


def run(name, spec, em, a):
    kp = kf_path(name)
    orig = os.path.join(os.path.dirname(kp), spec["_orig"]) if spec.get("_orig") else kp
    key0 = cv2.imread(orig)
    ems = []
    for e in spec["emblems"]:
        e = dict(e)
        mode = e.setdefault("mode", "add")
        if mode in ("replace", "carry"):
            fx, fy, fd, fsq, fax, dark = find_disc(key0, e["x"], e["y"], e.get("search", 90))
            if e.get("old"):                                       # given by hand: [x, y, d, sq, ax]
                fx, fy, fd, fsq, fax = e["old"]
            print(f"  disc at {fx:.1f},{fy:.1f} d {fd:.1f} sq {fsq:.2f} ax {fax:.0f} dark {np.round(dark).tolist()}")
            e["old"] = dict(x=fx, y=fy, d=fd, sq=fsq, ax=fax); e["match"] = dark
            if not e.get("fixed"):
                e["x"], e["y"] = fx, fy
            e.setdefault("d", fd * (1.12 if mode == "replace" else 1.0)); e.setdefault("sq", fsq); e.setdefault("ax", fax)
        e.setdefault("sq", 1.0); e.setdefault("ax", 0.0); e.setdefault("rot", 0.0)
        ems.append(e)
    # ---- the keyframe itself (stills, name cards, and any future take)
    new = key0.copy()
    for e in ems:
        if e["mode"] == "carry":
            continue
        if e["mode"] == "replace":
            o = e["old"]; new = paint_out(new, o["x"], o["y"], o["d"], o["sq"], o["ax"])
        new, _ = comp(new, em, e["x"], e["y"], e["d"], e["sq"], e["ax"], e["rot"], e.get("occ"), e.get("match"), white=e.get("white", 246.0))
    if a.preview:
        tiles = []
        for e in ems:
            r = int(max(e["d"] * a.zoom, 60))
            x0, y0 = max(0, int(e["x"]) - r), max(0, int(e["y"]) - r)
            k0 = key0.copy()
            if e.get("old"):
                o = e["old"]
                cv2.ellipse(k0, (int(o["x"] * 16), int(o["y"] * 16)), (int(o["d"] * 8), int(o["d"] * o["sq"] * 8)), o["ax"], 0, 360, (0, 255, 0), 1, cv2.LINE_AA, 4)
            t = np.hstack([k0[y0:y0 + 2 * r, x0:x0 + 2 * r], new[y0:y0 + 2 * r, x0:x0 + 2 * r]])
            k = min(800 / t.shape[1], 400 / t.shape[0])
            t = cv2.resize(t, (int(t.shape[1] * k), int(t.shape[0] * k)), interpolation=cv2.INTER_CUBIC if k > 1 else cv2.INTER_AREA)
            cv2.putText(t, f"{name} {x0},{y0} +{2 * r}", (6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)
            tiles.append(cv2.copyMakeBorder(t, 0, 400 - t.shape[0], 0, 800 - t.shape[1], cv2.BORDER_CONSTANT))
        os.makedirs(a.out, exist_ok=True)
        cv2.imwrite(os.path.join(a.out, f"prev_{name}.jpg"), np.vstack(tiles), [cv2.IMWRITE_JPEG_QUALITY, 90])
        print("  preview", os.path.join(a.out, f"prev_{name}.jpg"))
        return
    changed = any(e["mode"] != "carry" for e in ems)
    if changed:
        if not spec.get("_orig"):
            bk = next_backup(kp); shutil.copy2(kp, bk); spec["_orig"] = os.path.basename(bk)
            print(f"  kept the old keyframe as {spec['_orig']}")
        cv2.imwrite(kp, new, [cv2.IMWRITE_JPEG_QUALITY, 95] if kp.endswith(".jpg") else [])
    take = spec.get("take")
    if not take:
        return
    # ---- the roto key plate: pkey.jpg carries the emblems, key.jpg never does
    rdir = os.path.join(ROOT, "media", "gen", name, "roto", take)
    fdir = os.path.join(ROOT, "media", "gen", name, "frames", take)
    meta = json.load(open(os.path.join(rdir, "meta.json")))
    W, H, N = meta["w"], meta["h"], meta["frames"]
    ko = os.path.join(rdir, "key_orig.jpg")
    if not os.path.exists(ko):
        shutil.copy2(os.path.join(rdir, "key.jpg"), ko)
    elif "patch" not in meta:
        # roto_prep was re-run since the last pass: its key.jpg is a fresh registration of the keyframe on disk, which now
        # HAS the emblem. Rebuild the emblem-free plate from the original keyframe in that same registration.
        fresh = cv2.imread(os.path.join(rdir, "key.jpg"))
        Mf = register(cv2.imread(kp), fresh)
        w0 = cv2.warpAffine(key0, Mf, (fresh.shape[1], fresh.shape[0]), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REFLECT)
        e0 = float(np.abs(cv2.GaussianBlur(w0, (0, 0), 2).astype(np.float32) - cv2.GaussianBlur(fresh, (0, 0), 2).astype(np.float32)).mean())
        print(f"  roto_prep re-run detected: plate rebuilt from {os.path.basename(orig)} (diff {e0:.2f})" if e0 < 8 else
              f"  roto_prep re-run detected, but its key plate is not this keyframe (diff {e0:.2f}): using it as it is; CHECK the result")
        cv2.imwrite(ko, w0 if e0 < 8 else fresh, [cv2.IMWRITE_JPEG_QUALITY, 94])
    plate0 = cv2.imread(ko)
    KS = plate0.shape[1] / W
    M = register(key0, plate0)
    chk = cv2.warpAffine(key0, M, (plate0.shape[1], plate0.shape[0]), flags=cv2.INTER_AREA)
    err = float(np.abs(cv2.GaussianBlur(chk, (0, 0), 2).astype(np.float32) - cv2.GaussianBlur(plate0, (0, 0), 2).astype(np.float32)).mean())
    print(f"  keyframe -> key plate: scale {np.sqrt(abs(np.linalg.det(M[:, :2]))):.4f}, mean abs diff {err:.2f}")
    plate, pk = plate0.copy(), plate0.copy()
    pm = np.zeros(plate0.shape[:2], np.float32)
    pes = [xf(M, e) for e in ems]
    for e in pes:
        if e["mode"] in ("replace", "carry"):
            o = xf(M, dict(e["old"], mode="x"))
            plate = paint_out(plate, o["x"], o["y"], o["d"], o["sq"], o["ax"], 1.24)
            if e["mode"] == "replace":
                pk = paint_out(pk, o["x"], o["y"], o["d"], o["sq"], o["ax"])
    for e in pes:
        if e["mode"] == "carry":                                   # the painting's own patch, matte = its disc (+ rim)
            al = ellipse_mask(pk.shape, e["x"], e["y"], e["d"], e["sq"], e["ax"], 1.18, 0.8)
        else:
            pk, al = comp(pk, em, e["x"], e["y"], e["d"], e["sq"], e["ax"], e["rot"], e.get("occ"), e.get("match"), white=e.get("white", 246.0))
            al = np.clip(cv2.GaussianBlur((al > 0.03).astype(np.float32), (0, 0), 0.9) * 1.6, 0, 1)   # the whole printed patch, rim and hairline
            if e.get("occ"):
                om = np.zeros(al.shape, np.uint8)
                for poly in e["occ"]:
                    cv2.fillPoly(om, [np.round(np.array(poly)).astype(np.int32)], 255)
                al = al * (1 - cv2.GaussianBlur(om.astype(np.float32) / 255, (0, 0), 0.8))
        pm = np.maximum(pm, al)
    if any(e["mode"] in ("replace", "carry") for e in pes):
        cv2.imwrite(os.path.join(rdir, "key.jpg"), plate, [cv2.IMWRITE_JPEG_QUALITY, 94])
    else:
        shutil.copyfile(ko, os.path.join(rdir, "key.jpg"))             # bare-cloth shots: the plate stays byte-identical
    cv2.imwrite(os.path.join(rdir, "pkey.jpg"), pk, [cv2.IMWRITE_JPEG_QUALITY, 95])
    cv2.imwrite(os.path.join(rdir, "pmask.png"), (pm * 255).round().astype(np.uint8))
    # ---- motion of each patch through the take
    files = sorted(f for f in os.listdir(fdir) if f.endswith(".jpg"))[:N]
    frames = []
    for f in files:
        im = cv2.imread(os.path.join(fdir, f))
        if im.shape[1] != W or im.shape[0] != H:
            im = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
        frames.append(im)
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    c0 = cv2.imread(os.path.join(rdir, "c_0000.jpg"))
    if c0.shape[1] != W:
        c0 = cv2.resize(c0, (W, H), interpolation=cv2.INTER_AREA)
    out = {"key": "pkey.jpg", "mask": "pmask.png", "n": len(pes), "A": [], "c": [], "ref": [], "vis": [], "stats": []}
    Ps = []
    for j, e in enumerate(pes):
        c = np.array([e["x"], e["y"]]) / KS
        dw = e["d"] / KS
        if e.get("track"):
            tm = np.zeros((H, W), np.uint8)
            cv2.fillPoly(tm, [np.round(np.array(e["track"]) / KS).astype(np.int32)], 255)
        else:
            tm = cloth_mask(frames[0], c, dw, e.get("rad", max(3.0 * dw, 46.0)))
        if a.still or e.get("still"):
            P, inl, n0 = np.zeros((N, 4)), np.zeros(N, int), 0
        else:
            P, inl, n0 = track(grays, tm, c, e.get("smooth", a.smooth))
            if P is None:
                raise SystemExit(f"  patch {j}: too few corners to track; give it a 'track' polygon")
        Ps.append(P)
        out["A"].append(to_inverse_affines(P, c[None, :]))
        out["c"].append([round(float(c[0]), 2), round(float(c[1]), 2), round(float(dw * 0.5 * 1.45 + 3), 2)])
        # occlusion: against the cloth colour (per pixel, in the shader) or per frame, from the take at the patch centre
        occl = e.get("occl", "cloth" if e["mode"] == "add" else "frame")
        sig = max(2.0, dw * 0.22)
        cl = []
        for i, fr in enumerate(frames):
            p = c + P[i, :2]
            x, y = int(round(p[0])), int(round(p[1]))
            r = int(max(3, sig * 2))
            win = fr[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1]
            cl.append(lab(win.reshape(-1, 3).mean(0)) if win.size else cl[-1])
        cl = np.array(cl)
        dE = np.linalg.norm(cl - np.median(cl[:max(3, N // 8)], 0), axis=1)
        x, y = int(round(c[0])), int(round(c[1]))
        ref = lab(cv2.GaussianBlur(c0, (0, 0), 4.0)[min(H - 1, y), min(W - 1, x)])
        vis = np.ones(N)
        if occl == "frame":
            v = 1 - np.clip((dE - 16) / 12, 0, 1)
            vis = np.minimum(v, cv2.GaussianBlur(v[:, None], (0, 0), 1.0).ravel())
        out["ref"].append([round(float(v), 2) for v in ref] + [1.0 if occl == "cloth" else 0.0])
        out["vis"].append([round(float(v), 3) for v in vis])
        st = {"mode": e["mode"], "occl": occl, "corners": int(n0), "min_inliers": int(inl[1:].min()) if N > 1 else 0,
              "max_shift_px": round(float(np.hypot(P[:, 0], P[:, 1]).max()), 2), "max_rot_deg": round(float(np.abs(np.degrees(P[:, 3])).max()), 2),
              "scale_range": [round(float(np.exp(P[:, 2].min())), 3), round(float(np.exp(P[:, 2].max())), 3)],
              "dE_max": round(float(dE.max()), 1), "frames_dE>16": [int(i) for i in np.where(dE > 16)[0][:40]]}
        out["stats"].append(st)
        print(f"  patch {j} at work px {c.round(1).tolist()} d {dw:.1f}: {st}")
    meta["patch"] = out
    json.dump(meta, open(os.path.join(rdir, "meta.json"), "w"))
    os.utime(rdir, None)
    # ---- what the shader will show, enlarged: 8 frames per patch
    os.makedirs(a.out, exist_ok=True)
    pkw = cv2.resize(pk, (W, H), interpolation=cv2.INTER_AREA)
    pmw = cv2.resize(pm, (W, H), interpolation=cv2.INTER_AREA)
    rows = []
    for j, e in enumerate(pes):
        c = np.array(out["c"][j][:2]); r = int(max(out["c"][j][2] * 2.6, 40))
        tiles = []
        for i in np.linspace(0, N - 1, 8).round().astype(int):
            Ai = np.array(out["A"][j][i]).reshape(2, 3)
            wk = cv2.warpAffine(pkw, Ai, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)
            wm = cv2.warpAffine(pmw, Ai, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)[..., None] * out["vis"][j][i]
            fr = frames[i].astype(np.float32) * (1 - wm) + wk * wm
            p = c + Ps[j][i, :2]
            x0, y0 = int(np.clip(p[0] - r, 0, W - 2 * r)), int(np.clip(p[1] - r, 0, H - 2 * r))
            t = cv2.resize(fr[y0:y0 + 2 * r, x0:x0 + 2 * r].astype(np.uint8), (240, 240), interpolation=cv2.INTER_CUBIC)
            cv2.putText(t, f"f{i}", (6, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
            tiles.append(t)
        rows.append(np.hstack(tiles))
    cv2.imwrite(os.path.join(a.out, f"track_{name}.jpg"), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
    print("  sheet", os.path.join(a.out, f"track_{name}.jpg"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("names", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--still", action="store_true")
    ap.add_argument("--zoom", type=float, default=3.5, help="preview half-width in emblem diameters")
    ap.add_argument("--smooth", type=float, default=2.0)
    ap.add_argument("--out", default=os.path.join(ROOT, "render", "out", "rev_emblem", "track"))
    a = ap.parse_args()
    specs = json.load(open(SPEC))
    em = cv2.imread(EMBLEM, cv2.IMREAD_UNCHANGED)
    em = cv2.resize(em, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32)
    em[..., :3] *= em[..., 3:4] / 255.0                                # premultiplied for the warp
    for name in (list(k for k in specs if not k.startswith("_")) if a.all else a.names):
        print(name)
        run(name, specs[name], em, a)
        if not a.preview:
            json.dump(specs, open(SPEC, "w"), indent=1)


if __name__ == "__main__":
    main()
