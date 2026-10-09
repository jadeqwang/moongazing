#!/usr/bin/env python3
"""K_7.C2 v6 (rev2_c2, Oct 8): the toy robot dog -> the family cat; the TV screen -> flat key blue.
Deterministic. Inputs: media/keyframes/K_7.C2_v5.jpg (the v5 painting), media/keyframes/work/rev2_c2/cat_v1.jpg (nano-banana-pro edit of
v5 with media/chars/robots/SHEET_pets.jpg; only its cat is used). Everything outside the toy/cat patch and the TV
screen is v5 pixel for pixel.
    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python; $MPY tools/k7c2_cat_keyframe.py   (from the repo root)
"""
import json, sys
import cv2
import numpy as np

SCALE = float(sys.argv[1]) if len(sys.argv) > 1 else 0.84   # the edit's cat sat 56 cm tall; a big long-haired cat sits ~47
KEY_BLUE = (235, 70, 20)                                    # BGR: the flat screen colour the take is keyed on
v5 = cv2.imread('media/keyframes/K_7.C2_v5.jpg'); ed = cv2.imread('media/keyframes/work/rev2_c2/cat_v1.jpg')
H, W = v5.shape[:2]
out = v5.copy()

# 1 · the toy and its shadow go: Poisson-clone clean carpet from 350 px to the right over the toy's (dilated) shape
x0, y0, x1, y1 = 1925, 1070, 2300, 1400
roi = v5[y0:y1, x0:x1]; hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV).astype(np.int32)
car = np.median(hsv.reshape(-1, 3), 0)
toy = ((hsv[..., 1] < car[1] - 45) | (hsv[..., 2] < car[2] - 45)).astype(np.uint8)
toy = cv2.morphologyEx(toy, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
toy = cv2.dilate(toy, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
toy[:3] = 0; toy[-3:] = 0; toy[:, :3] = 0; toy[:, -3:] = 0
donor = v5[y0:y1, x0 + 350:x1 + 350]
out = cv2.seamlessClone(donor, out, toy * 255, ((x0 + x1) // 2, (y0 + y1) // 2), cv2.NORMAL_CLONE)
# seamlessClone centres the mask's bounding box: redo with an explicit paste so nothing shifts
ys, xs = np.nonzero(toy); bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
out = v5.copy()
out = cv2.seamlessClone(donor[by0:by1, bx0:bx1], out, toy[by0:by1, bx0:bx1] * 255, (x0 + (bx0 + bx1) // 2, y0 + (by0 + by1) // 2), cv2.NORMAL_CLONE)
cv2.imwrite('media/keyframes/work/rev2_c2/_clean_plate.jpg', out, [cv2.IMWRITE_JPEG_QUALITY, 96])

# 2 · the cat, cut out of the edit along a hand-traced outline (traced on a 2x crop at 1850,920), a few px generous
#     and feathered: the thin rim of the edit's carpet that comes along matches v5's carpet; the girl's pink never comes
rx0, ry0, rx1, ry1 = 1850, 920, 2510, 1420
sub = ed[ry0:ry1, rx0:rx1]
OUT2 = [(382, 45), (430, 105), (450, 112), (470, 108), (515, 73), (542, 100), (548, 190), (582, 200), (612, 300), (642, 358), (702, 378), (762, 408),
        (822, 498), (862, 598), (874, 715), (892, 762), (960, 757), (1040, 718), (1063, 670), (1040, 612), (985, 582), (943, 545), (958, 500),
        (1050, 473), (1140, 476), (1217, 538), (1247, 650), (1227, 752), (1202, 812), (1150, 852), (1050, 882), (950, 907), (860, 917),
        (700, 947), (560, 947), (530, 922), (500, 890), (440, 903), (412, 947), (340, 942), (320, 915), (333, 890), (368, 870), (383, 800),
        (393, 700), (368, 640), (348, 602), (300, 602), (268, 572), (238, 542), (213, 502), (188, 462), (130, 432), (90, 422), (60, 412),
        (56, 380), (88, 350), (130, 353), (200, 383), (268, 408), (288, 380), (283, 340), (298, 305), (318, 290), (303, 265), (300, 235),
        (310, 213), (323, 180), (348, 140), (372, 112)]
a2 = np.zeros(sub.shape[:2], np.uint8); cv2.fillPoly(a2, [np.round(np.array(OUT2, np.float32) / 2 * 8).astype(np.int32)], 1, cv2.LINE_8, 3)
grow = cv2.dilate(a2, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
wh = np.zeros_like(a2); cv2.fillPoly(wh, [np.array([[105, 108], [160, 100], [160, 150], [112, 152]], np.int32), np.array([[150, 22], [196, 22], [196, 62], [160, 62]], np.int32)], 1)   # whiskers
grow = np.maximum(grow, wh)
b, g, r = [sub[..., i].astype(np.int32) for i in range(3)]
pink = cv2.dilate(((r - g > 34) & (r > 150)).astype(np.uint8), np.ones((3, 3), np.uint8))
grow[(pink > 0) & (a2 == 0)] = 0
grow[:, :100][(a2[:, :100] == 0)] = 0                           # the paw end: tight, no rim (it lies over the girl's hem)
alpha = cv2.GaussianBlur(grow.astype(np.float32), (0, 0), 2.2)
alpha = np.maximum(alpha * (grow > 0), cv2.GaussianBlur(a2.astype(np.float32), (0, 0), 1.0))
c5 = v5[1300:1380, 2350:2600].reshape(-1, 3).mean(0); ce = ed[1300:1380, 2500:2640].reshape(-1, 3).mean(0); print('carpet BGR v5', np.round(c5), 'edit', np.round(ce))
ys, xs = np.nonzero(a2); print('cat in edit: x', xs.min() + rx0, xs.max() + rx0, 'y', ys.min() + ry0, ys.max() + ry0, 'height px', ys.max() - ys.min())
cv2.imwrite('media/keyframes/work/rev2_c2/_cat_cut.png', np.dstack([sub, (alpha * 255).astype(np.uint8)]))
# scale and place: PAW = paw tip in the edit, goes to TARGET (the lower corner of the girl's hem in v5)
sw, shh = int(round(sub.shape[1] * SCALE)), int(round(sub.shape[0] * SCALE))
subS = cv2.resize(sub, (sw, shh), interpolation=cv2.INTER_AREA); alS = cv2.resize(alpha, (sw, shh), interpolation=cv2.INTER_AREA)
a2S = cv2.resize(a2, (sw, shh), interpolation=cv2.INTER_AREA)
ysS, xsS = np.nonzero(a2S > 0)
paw_x = xsS.min(); paw_y = int(np.median(ysS[xsS < paw_x + 12]))
base_y = ysS.max()
TARGET = (1884, 1136)
ox = TARGET[0] - paw_x; oy = TARGET[1] - paw_y; FLOOR_Y = oy + base_y
print('paw (scaled sub px)', paw_x, paw_y, '-> placed at', ox + paw_x, oy + paw_y, '; cat height px', ysS.max() - ysS.min(), '; offset', ox, oy)
# contact shadow: a soft multiply ellipse under the seat
shd = np.zeros((H, W), np.float32)
bx = xsS[ysS > base_y - 25]; cx = ox + int((bx.min() + bx.max()) / 2); wx = int((bx.max() - bx.min()) / 2 + 40)
cv2.ellipse(shd, (cx + 20, FLOOR_Y - 6), (wx, 20), 0, 0, 360, 1.0, -1); shd = cv2.GaussianBlur(shd, (0, 0), 14) * 0.34
out = (out.astype(np.float32) * (1 - shd[..., None] * np.array([0.9, 0.95, 1.0]))).astype(np.float32)
A = np.zeros((H, W), np.float32); C = np.zeros((H, W, 3), np.float32)
A[oy:oy + shh, ox:ox + sw] = alS; C[oy:oy + shh, ox:ox + sw] = subS
out = out * (1 - A[..., None]) + C * A[..., None]
out = np.clip(out, 0, 255).astype(np.uint8)
cv2.imwrite('media/keyframes/work/rev2_c2/C2_v6_cat_only.jpg', out, [cv2.IMWRITE_JPEG_QUALITY, 96])

# 3 · the TV: the painted game picture -> flat key blue inside the screen's quad (found from the painted blue)
q = np.array([[155.5, 157.0], [716.5, 222.0], [716.5, 573.0], [157.0, 593.0]], np.float32)   # read off a gridded 2x crop of v5
print('screen quad (v5 px):', np.round(q, 1).tolist())
json.dump({'quad_px': q.tolist(), 'size': [W, H], 'key_bgr': KEY_BLUE}, open('media/keyframes/work/rev2_c2/tv_quad.json', 'w'))
msk = np.zeros((H, W), np.float32); cv2.fillConvexPoly(msk, np.round(q * 8).astype(np.int32), 1.0, cv2.LINE_AA, 3)
msk = cv2.GaussianBlur(msk, (0, 0), 1.0)
grain = np.zeros((H, W), np.float32)   # flat: nothing for the video model to animate, a clean key
scr = np.array(KEY_BLUE, np.float32)[None, None] + grain[..., None] * 0.6
out = np.clip(out * (1 - msk[..., None]) + scr * msk[..., None], 0, 255).astype(np.uint8)
cv2.imwrite('media/keyframes/work/rev2_c2/C2_v6.jpg', out, [cv2.IMWRITE_JPEG_QUALITY, 96])
d = np.abs(out.astype(np.int32) - v5.astype(np.int32)).max(2); ys, xs = np.nonzero(d > 6)
print('changed px bbox vs v5:', xs.min(), ys.min(), xs.max(), ys.max(), ' count', len(xs))
