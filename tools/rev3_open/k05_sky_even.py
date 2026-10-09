#!/usr/bin/env python3
"""rev3 OPEN: even out the sky beside the rooftop Moon. The place the first Moon was painted over left a darker,
cloud-like blot in the low frequencies of the sky (visible in thumbnails). Only the low frequencies are corrected, so
the silk weave and the cracks stay; the Moon's disc and the hills are not touched.
    $MPY tools/rev3_open/k05_sky_even.py IN.jpg OUT.jpg
"""
import sys
import cv2
import numpy as np
src, out = sys.argv[1], sys.argv[2]
im = cv2.imread(src).astype(np.float32); H, W = im.shape[:2]
g = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_BGR2GRAY)
# the Moon: largest warm bright blob in the upper-left
b, gg, r = cv2.split(im)
warm = ((r > 110) & (r - b > 30)).astype(np.uint8); warm[int(H * 0.3):] = 0; warm[:, int(W * 0.25):] = 0
n, lab, st, cen = cv2.connectedComponentsWithStats(warm, 8)
k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); bx, by, bw, bh = st[k, :4]
cx, cy, R = bx + bw / 2, by + bh / 2, max(bw, bh) / 2
print('moon', cx, cy, R)
yy, xx = np.mgrid[:H, :W]
moon = (np.hypot(xx - cx, yy - cy) < R + 10)
# low frequencies of the sky with the Moon filled in by its surroundings
fill = cv2.inpaint(im.astype(np.uint8), moon.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA).astype(np.float32)
SIG = 28
low = cv2.GaussianBlur(fill, (0, 0), SIG)
y1 = int(cy + R + 6)                                   # stop above the hilltops
x1 = int(cx + R + 520)
target = np.median(low[:, int(W * 0.30):int(W * 0.62)], axis=1, keepdims=True)   # the clean sky, row by row
m = np.zeros((H, W), np.float32); m[:y1, :x1] = 1
m[moon] = 0
m = cv2.GaussianBlur(m, (0, 0), 14); m[np.hypot(xx - cx, yy - cy) < R + 2] = 0
delta = (target - low) * m[..., None]
res = np.clip(im + delta, 0, 255)
cv2.imwrite(out, res.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 95])
print('max correction', float(np.abs(delta).max()), 'mean in region', float(np.abs(delta[:y1, :x1]).mean()))
