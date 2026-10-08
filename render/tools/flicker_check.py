#!/usr/bin/env python3
"""Find frames where a layer dropped out and came back (the "flashing words" fault of fullcut v4).

A rendered frame is flagged when a patch of it differs from the frame before, and the frame 1-3 frames later is back
to what the frame before showed (A B A, A B B A, ...). Type that is being revealed, motion and cuts do not come back,
so they are not flagged; the 2-frame ink flash on a cut is not flagged either (the frame before it is another shot).

  .venv/bin/python render/tools/flicker_check.py render/out/frames_v5_540 [--from 0 --to 221.04] [--list]
Exit code 1 if anything is flagged. Run it after every full render, before encoding.
"""
import argparse, os, sys
import numpy as np
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument('dir')
ap.add_argument('--from', dest='a', type=float, default=0)
ap.add_argument('--to', dest='b', type=float, default=1e9)
ap.add_argument('--fps', type=float, default=24)
ap.add_argument('--diff', type=float, default=22, help='luma change (0-255) that counts as "different"')
ap.add_argument('--back', type=float, default=9, help='luma change that still counts as "back to before"')
ap.add_argument('--area', type=int, default=30, help='changed pixels (at 960x540) needed to flag')
ap.add_argument('--list', action='store_true', help='print every flagged frame, not just the runs')
args = ap.parse_args()

names = sorted(f for f in os.listdir(args.dir) if f.startswith('f_') and f.endswith(('.jpg', '.png')))
idx = [int(f[2:8]) for f in names]
keep = [(i, f) for i, f in zip(idx, names) if args.a * args.fps - 1e-6 <= i < args.b * args.fps - 1e-6]

def load(f):
    im = Image.open(os.path.join(args.dir, f)).convert('L')
    if im.width != 960: im = im.resize((960, round(960 * im.height / im.width)), Image.BILINEAR)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(0.8)), dtype=np.int16)

win = {}          # sliding window of loaded frames
def get(k):
    if k not in win: win[k] = load(keep[k][1])
    return win[k]

flag = {}
for k in range(1, len(keep) - 1):
    A, B = get(k - 1), get(k)
    ch = np.abs(B - A) > args.diff
    n = int(ch.sum())
    if n >= args.area:
        for g in (1, 2, 3):
            if k + g >= len(keep): break
            C = get(k + g)
            back = (np.abs(C - A) < args.back) & ch
            # most of what changed is restored, and the frame as a whole is the same picture as before
            if back.sum() >= 0.8 * n and (np.abs(C - A) > args.diff).sum() < 0.25 * n:
                ys, xs = np.nonzero(ch)
                for j in range(g): flag[keep[k + j][0]] = (n, int(xs.min()) * 2, int(ys.min()) * 2, int(xs.max()) * 2, int(ys.max()) * 2)
                break
    for old in [o for o in win if o < k - 1]: del win[old]

fr = sorted(flag)
runs = []
for i in fr:
    if runs and i - runs[-1][1] <= 12: runs[-1][1] = i; runs[-1][2] += 1
    else: runs.append([i, i, 1])
print(f'{len(keep)} frames checked, {len(fr)} flagged in {len(runs)} stretch(es)')
for a, b, n in runs:
    print(f'  {a / args.fps:7.2f}-{b / args.fps:7.2f} s  frames {a}-{b}  ({n} flagged)')
if args.list:
    for i in fr: print(f'  f_{i:06d}  {i / args.fps:.3f} s  {flag[i][0]} px changed, box {flag[i][1:]} (design px)')
sys.exit(1 if fr else 0)
