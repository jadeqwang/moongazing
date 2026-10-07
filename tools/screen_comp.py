#!/usr/bin/env python3
"""Composite still images into flat-green (#00FF00) tablet screens painted by an image model.

  screen_comp.py SHOT.jpg OUT.jpg CLIP1.jpg [CLIP2.jpg ...]

Screens are found as connected regions of pure green, largest first; CLIPn goes into the n-th largest. Each clip is
centre-cropped to the screen's aspect, perspective-warped onto the four corners of the green region (extremes of
x+y / x-y), and composited through the green mask itself, so fingers over the screen stay in front. Green fringe is
despilled. Used for K_7.C4a-d (home clips on the crew's tablets)."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def green_mask(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (g > 120) & (g - np.maximum(r, b) > 60)


def corners(ys, xs):
    """Four corners of a (possibly very oblique) quad region: among the extreme points in 36 directions, pick the 4
    that span the largest area, then order them TL, TR, BR, BL (clockwise from the one nearest the top-left)."""
    from itertools import combinations
    P = np.c_[xs, ys].astype(float)
    cand = set()
    for t in np.linspace(0, np.pi, 36, endpoint=False):
        pr = P @ np.array([np.cos(t), np.sin(t)])
        cand.add(int(pr.argmin())); cand.add(int(pr.argmax()))
    C = P[sorted(cand)]
    best, quad = -1, None
    for idx in combinations(range(len(C)), 4):
        q = C[list(idx)]
        c = q.mean(0); q = q[np.argsort(np.arctan2(q[:, 1] - c[1], q[:, 0] - c[0]))]
        x, y = q[:, 0], q[:, 1]
        area = 0.5 * abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
        if area > best:
            best, quad = area, q
    k = int(np.argmin(quad[:, 0] + quad[:, 1]))     # angle-sorted is clockwise in image coords (y down)
    quad = np.roll(quad, -k, axis=0)
    return [tuple(map(float, v)) for v in quad]


def persp_coeffs(dst, src):
    """coefficients for Image.transform(PERSPECTIVE): maps output (dst) points to input (src) points."""
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()


def main(shot, out, clips):
    im = Image.open(shot).convert("RGB"); a = np.asarray(im).astype(np.float32)
    m = green_mask(a)
    m = ndimage.binary_closing(m, iterations=2)
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    order = np.argsort(sizes)[::-1]
    res = a.copy()
    for k, clip in enumerate(clips):
        if k >= len(order) or sizes[order[k]] < 500:
            break
        reg = lab == order[k] + 1
        ys, xs = np.nonzero(reg)
        q = corners(ys, xs)
        w = (np.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) + np.hypot(q[2][0] - q[3][0], q[2][1] - q[3][1])) / 2
        h = (np.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]) + np.hypot(q[2][0] - q[1][0], q[2][1] - q[1][1])) / 2
        if clip.upper() == "DARK":      # a switched-off screen
            res[ndimage.binary_dilation(reg, iterations=2)] = (18, 22, 36)
            continue
        c = Image.open(clip).convert("RGB")
        # a screen is emissive: lift the silk clip a little (gamma 0.85, gain 1.08) so it reads as lit
        c = Image.fromarray(np.clip(255 * (np.asarray(c) / 255.0) ** 0.85 * 1.08, 0, 255).astype(np.uint8))
        ca = w / h
        if c.width / c.height > ca:   # centre crop to the screen aspect
            nw = int(c.height * ca); c = c.crop(((c.width - nw) // 2, 0, (c.width + nw) // 2, c.height))
        else:
            nh = int(c.width / ca); c = c.crop((0, (c.height - nh) // 2, c.width, (c.height + nh) // 2))
        src = [(0, 0), (c.width, 0), (c.width, c.height), (0, c.height)]
        warped = c.transform(im.size, Image.PERSPECTIVE, persp_coeffs(q, src), Image.BICUBIC)
        wa = np.asarray(warped).astype(np.float32)
        # alpha: the green region, grown 2 px to eat the fringe, softened 1 px
        al = ndimage.binary_dilation(reg, iterations=2).astype(np.float32)
        al = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))) / 255.0
        res = res * (1 - al[..., None]) + wa * al[..., None]
        print(f"screen {k}: corners {q}, {int(w)}x{int(h)} <- {clip}")
    # despill: models paint green bounce on the fingers and bezel near the screen. Within 40 px of any screen, pull
    # every green-dominant pixel back to max(r, b); elsewhere only strong spill.
    near = ndimage.binary_dilation(m, iterations=40)
    r, g, b = res[..., 0], res[..., 1], res[..., 2]
    mx = np.maximum(r, b)
    res[..., 1] = np.where((near & (g > mx)) | (g > mx + 25), mx, g)
    # olive fringe left on skin/bezel next to the screen (g close to r, well above b): pull g down to a skin ratio
    scr = ndimage.binary_dilation(m, iterations=3)
    r, g, b = res[..., 0], res[..., 1], res[..., 2]
    olive = near & ~scr & (g > 0.95 * r) & (g > b + 15) & (r > 60)
    res[..., 1] = np.where(olive, 0.74 * r, g)
    Image.fromarray(np.clip(res, 0, 255).astype(np.uint8)).save(out, quality=94)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3:])
