#!/usr/bin/env python3
"""rev3 KIDS (Oct 8): repaint ONE small region of a painted keyframe (T's head to the v3 sheet; the toy globe) and
leave every other pixel of the keyframe as it was.

A head in a keyframe is 60-150 px: too small for an image model to repaint with any control. So:
  crop   a 16:9 box round the region, enlarged to 2048 px wide  -> <work>/<name>_crop.png
  (edit  that crop with tools/cf.py google/nano-banana-pro and the character sheet)
  paste  the edited crop back: shrunk to the box, registered on the crop (ECC translation), and blended in through a
         feathered ellipse (or polygon) only; outside it the keyframe is untouched pixel for pixel.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python   (from the repo root)
    $MPY tools/rev3_kids_head.py crop  KEY.jpg  x0 y0 w   OUT_crop.png
    $MPY tools/rev3_kids_head.py paste KEY.jpg  x0 y0 w   EDIT.png  OUT.jpg  cx cy rx ry [feather] [--poly x,y;x,y;...] [--noreg]
x0 y0 w: the box in keyframe pixels (height = w*9/16). cx cy rx ry: the ellipse, in keyframe pixels.
"""
import sys
import cv2
import numpy as np

CW = 2048


def box(key, x0, y0, w):
    h = int(round(w * 9 / 16))
    return key[y0:y0 + h, x0:x0 + w], h


def main():
    a = sys.argv[1:]
    flags = [x for x in a if x.startswith('--')]
    poly = None
    if '--poly' in a:
        i = a.index('--poly'); poly = [tuple(float(v) for v in p.split(',')) for p in a[i + 1].split(';')]; del a[i:i + 2]
    a = [x for x in a if not x.startswith('--')]
    mode, keyp = a[0], a[1]
    x0, y0, w = int(a[2]), int(a[3]), int(a[4])
    key = cv2.imread(keyp)
    sub, h = box(key, x0, y0, w)
    if mode == 'crop':
        up = cv2.resize(sub, (CW, CW * 9 // 16), interpolation=cv2.INTER_LANCZOS4)
        cv2.imwrite(a[5], up); print('crop', sub.shape, '->', up.shape, a[5]); return
    edit = cv2.imread(a[5]); outp = a[6]
    cx, cy, rx, ry = [float(v) for v in a[7:11]]
    feather = float(a[11]) if len(a) > 11 else 6.0
    ed = cv2.resize(edit, (w, h), interpolation=cv2.INTER_AREA)
    if '--noreg' not in flags:
        # register the edit on the original crop OUTSIDE the repainted ellipse (the model may shift the picture a few px)
        g0 = cv2.cvtColor(sub, cv2.COLOR_BGR2GRAY).astype(np.float32); g1 = cv2.cvtColor(ed, cv2.COLOR_BGR2GRAY).astype(np.float32)
        m = np.full((h, w), 255, np.uint8); cv2.ellipse(m, (int(cx - x0), int(cy - y0)), (int(rx * 1.3), int(ry * 1.3)), 0, 0, 360, 0, -1)
        W = np.eye(2, 3, dtype=np.float32)
        try:
            cc, W = cv2.findTransformECC(g0, g1, W, cv2.MOTION_TRANSLATION, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), m, 5)
            print('ECC', round(cc, 4), 'shift px', np.round(W[:, 2], 2))
            ed = cv2.warpAffine(ed, W, (w, h), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
        except cv2.error as e:
            print('ECC failed, pasting unregistered:', e)
    al = np.zeros(key.shape[:2], np.float32)
    if poly:
        cv2.fillPoly(al, [np.round(np.array(poly)).astype(np.int32)], 1.0)
    else:
        cv2.ellipse(al, (int(round(cx)), int(round(cy))), (int(round(rx)), int(round(ry))), 0, 0, 360, 1.0, -1)
    al = cv2.GaussianBlur(al, (0, 0), feather)[..., None]
    full = key.copy(); full[y0:y0 + h, x0:x0 + w] = ed
    al[:y0] = 0; al[y0 + h:] = 0; al[:, :x0] = 0; al[:, x0 + w:] = 0
    out = (key * (1 - al) + full * al).round().astype(np.uint8)
    cv2.imwrite(outp, out, [cv2.IMWRITE_JPEG_QUALITY, 96])
    d = np.abs(out.astype(int) - key.astype(int)).max(2); ys, xs = np.nonzero(d > 2)
    print('wrote', outp, 'changed bbox x', xs.min(), xs.max(), 'y', ys.min(), ys.max())


if __name__ == '__main__':
    main()
