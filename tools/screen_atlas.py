#!/usr/bin/env python3
"""A clip that PLAYS inside a painted screen (tablet, wall screen): pre-warp its frames into the screen's quad and pack
them into one atlas image the section file can draw (render/src/sections/07_drop.js: screenClip()).

The keyframe was painted with a flat-green (#00FF00) screen. This tool
  1. finds the screen's four corners in the green keyframe by robust line fits (or takes --corners),
  2. if --rotokey is given, registers the green keyframe onto that roto key.jpg (frame-0 coordinates of the chosen take:
     what the renderer actually shows), so the overlay lands exactly on the redrawn shot,
  3. warps N frames of the clip into the quad (letterboxed or centre-cropped to the screen's aspect), mattes them with
     the green mask itself (fingers, ears and heads painted over the screen stay in front), crops to the quad's bounding
     box and packs them into a cols x rows RGBA atlas.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python     # needs cv2
    $MPY tools/screen_atlas.py --green GREEN.jpg --clip CLIP.mp4|IMAGE --t0 1.2 --dur 0.9 --out media/keyframes/SCR_x.png
         [--rotokey media/gen/<shot>/roto/<take>/key.jpg] [--fps 24] [--cols 6] [--cell 640] [--letterbox]
         [--crop x0,y0,x1,y1] [--corners x,y,x,y,x,y,x,y] [--gain 1.0] [--zoom 1.0,1.04 (still image: slow push)]

Writes OUT.png and OUT.json: { bbox: [u0, v0, u1, v1] (fractions of the shown image), cols, rows, n, fps, quad (uv) }.
"""
import json
import sys

import cv2
import numpy as np


def green_mask(a):  # BGR float
    b, g, r = a[..., 0], a[..., 1], a[..., 2]
    return ((g > 120) & (g - np.maximum(r, b) > 60)).astype(np.uint8)


def ransac_line(xs, ys, tol=2.5, it=500):
    xs, ys = np.asarray(xs, float), np.asarray(ys, float); rng = np.random.default_rng(7); best = None
    for _ in range(it):
        i, j = rng.choice(len(xs), 2, replace=False)
        if xs[i] == xs[j]:
            continue
        a = (ys[j] - ys[i]) / (xs[j] - xs[i]); b = ys[i] - a * xs[i]
        inl = np.abs(ys - (a * xs + b)) < tol
        if best is None or inl.sum() > best.sum():
            best = inl
    return np.polyfit(xs[best], ys[best], 1)


def find_corners(reg):
    ys, xs = np.nonzero(reg); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cols = range(int(x0 + 0.08 * (x1 - x0)), int(x1 - 0.08 * (x1 - x0))); rows = range(int(y0 + 0.08 * (y1 - y0)), int(y1 - 0.08 * (y1 - y0)))
    top = [(c, np.nonzero(reg[:, c])[0].min()) for c in cols if reg[:, c].any()]; bot = [(c, np.nonzero(reg[:, c])[0].max()) for c in cols if reg[:, c].any()]
    lef = [(r, np.nonzero(reg[r])[0].min()) for r in rows if reg[r].any()]; rig = [(r, np.nonzero(reg[r])[0].max()) for r in rows if reg[r].any()]
    at, bt = ransac_line(*zip(*top)); ab, bb = ransac_line(*zip(*bot)); al, bl = ransac_line(*zip(*lef)); ar, br = ransac_line(*zip(*rig))
    def X(a, b, av, bv):  # y = a x + b  with  x = av y + bv
        y = (a * bv + b) / (1 - a * av); return [av * y + bv, y]
    return np.array([X(at, bt, al, bl), X(at, bt, ar, br), X(ab, bb, ar, br), X(ab, bb, al, bl)], np.float32)


def main():
    o = {}; a = sys.argv[1:]; i = 0
    while i < len(a):
        if a[i] in ('--letterbox',): o[a[i]] = True; i += 1
        else: o[a[i]] = a[i + 1]; i += 2
    green = cv2.imread(o['--green']); gh, gw = green.shape[:2]
    m = cv2.morphologyEx(green_mask(green.astype(np.float32)), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); reg = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    q = find_corners(reg)
    if '--corners' in o:
        q = np.array([float(v) for v in o['--corners'].split(',')], np.float32).reshape(4, 2)
    # target space: the roto key (frame-0 coords) if given, else the keyframe itself
    T = np.eye(3, dtype=np.float32); tw, th = gw, gh
    if '--rotokey' in o:
        key = cv2.imread(o['--rotokey']); th, tw = key.shape[:2]
        s = 640 / gw; g1 = cv2.cvtColor(cv2.resize(green, (640, round(gh * s))), cv2.COLOR_BGR2GRAY).astype(np.float32)
        k1 = cv2.cvtColor(cv2.resize(key, (640, g1.shape[0])), cv2.COLOR_BGR2GRAY).astype(np.float32)
        msk = (1 - cv2.dilate(cv2.resize(reg, (640, g1.shape[0])), np.ones((9, 9), np.uint8))).astype(np.uint8) * 255
        Wm = np.eye(2, 3, dtype=np.float32)
        cc, Wm = cv2.findTransformECC(k1, g1, Wm, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), msk, 5)
        # Wm maps key(640) coords -> green(640) coords; we want green(full) -> key(full)
        A = np.vstack([Wm, [0, 0, 1]]).astype(np.float64); Ai = np.linalg.inv(A)
        Sg = np.diag([s, s, 1.0]); Sk = np.diag([640 / tw, g1.shape[0] / th, 1.0])
        T = (np.linalg.inv(Sk) @ Ai @ Sg).astype(np.float32)
        print(f'registered onto roto key {tw}x{th}: ECC {cc:.4f}; shift of the screen centre {np.round((T @ np.array([q[:, 0].mean(), q[:, 1].mean(), 1]))[:2] / [tw / gw, th / gh] - q.mean(0), 1)} px (keyframe scale)')
    qt = cv2.perspectiveTransform(q[None], T)[0]
    matte = cv2.warpPerspective(reg * 255, T, (tw, th), flags=cv2.INTER_AREA)
    matte = cv2.GaussianBlur(cv2.erode(matte, np.ones((3, 3), np.uint8)), (0, 0), 1.0).astype(np.float32) / 255
    x0, y0 = np.floor(np.clip(qt.min(0) - 3, 0, [tw, th])).astype(int); x1, y1 = np.ceil(np.clip(qt.max(0) + 3, 0, [tw, th])).astype(int)
    bw, bh = x1 - x0, y1 - y0
    # source frames
    fps = float(o.get('--fps', 24)); t0 = float(o.get('--t0', 0)); dur = float(o.get('--dur', 1)); nfr = max(1, int(round(dur * fps)))
    frames = []
    if o['--clip'].lower().endswith(('.mp4', '.mov', '.webm')):
        cap = cv2.VideoCapture(o['--clip']); sfps = cap.get(cv2.CAP_PROP_FPS) or 24
        for k in range(nfr):
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(round((t0 + k / fps) * sfps))); ok, f = cap.read()
            if not ok: break
            frames.append(f)
    else:
        img = cv2.imread(o['--clip']); z0, z1 = [float(v) for v in o.get('--zoom', '1,1').split(',')]
        for k in range(nfr):
            z = z0 + (z1 - z0) * k / max(1, nfr - 1); h, w = img.shape[:2]; cw, ch = w / z, h / z
            M = np.float32([[z, 0, -(w - cw) / 2 * z], [0, z, -(h - ch) / 2 * z]]); frames.append(cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_LINEAR))
    qw = (np.linalg.norm(qt[1] - qt[0]) + np.linalg.norm(qt[2] - qt[3])) / 2; qh = (np.linalg.norm(qt[3] - qt[0]) + np.linalg.norm(qt[2] - qt[1])) / 2; asp = qw / qh
    gain = float(o.get('--gain', 1.0))
    cols = int(o.get('--cols', 6)); rows = int(np.ceil(len(frames) / cols)); cell = int(o.get('--cell', 640)); sc = min(1.0, cell / bw); cw, ch = int(round(bw * sc)), int(round(bh * sc))
    atlas = np.zeros((rows * ch, cols * cw, 4), np.uint8)
    for k, f in enumerate(frames):
        if '--crop' in o:
            c = [float(v) for v in o['--crop'].split(',')]; h, w = f.shape[:2]; f = f[int(c[1] * h):int(c[3] * h), int(c[0] * w):int(c[2] * w)]
        h, w = f.shape[:2]
        if '--letterbox' in o:      # a 16:9 video on a 4:3 tablet: black bars, nothing cut
            if w / h > asp: nh = int(round(w / asp)); cv = np.full((nh, w, 3), (10, 6, 6), np.uint8); cv[(nh - h) // 2:(nh - h) // 2 + h] = f; f = cv
            else: nw = int(round(h * asp)); cv = np.full((h, nw, 3), (10, 6, 6), np.uint8); cv[:, (nw - w) // 2:(nw - w) // 2 + w] = f; f = cv
        else:
            if w / h > asp: nw = int(round(h * asp)); f = f[:, (w - nw) // 2:(w - nw) // 2 + nw]
            else: nh = int(round(w / asp)); f = f[(h - nh) // 2:(h - nh) // 2 + nh]
        h, w = f.shape[:2]
        H = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), (qt - [x0, y0]).astype(np.float32))
        wp = cv2.warpPerspective(f, H, (bw, bh), flags=cv2.INTER_AREA)
        wp = np.clip(wp.astype(np.float32) * gain, 0, 255).astype(np.uint8)
        rgba = np.dstack([wp, (matte[y0:y1, x0:x1] * 255).astype(np.uint8)])
        r, c = divmod(k, cols); atlas[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw] = cv2.resize(rgba, (cw, ch), interpolation=cv2.INTER_AREA)
    cv2.imwrite(o['--out'], atlas)
    meta = {'bbox': [round(float(x0) / tw, 5), round(float(y0) / th, 5), round(float(x1) / tw, 5), round(float(y1) / th, 5)], 'cols': cols, 'rows': rows, 'n': len(frames), 'fps': fps,
            'quad': [[round(float(x) / tw, 5), round(float(y) / th, 5)] for x, y in qt], 'target': [tw, th], 'clip': o['--clip'], 't0': t0}
    json.dump(meta, open(o['--out'].rsplit('.', 1)[0] + '.json', 'w'), indent=1)
    print(json.dumps(meta))


if __name__ == '__main__':
    main()
