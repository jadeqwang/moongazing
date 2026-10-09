import sys
import cv2
import numpy as np
src, out, dy = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = cv2.imread(src); H, W = im.shape[:2]
# 1) the small red flag on the barge's stern staff: inpaint (no flags of any kind on the boats)
m = np.zeros((H, W), np.uint8)
x0, x1, y0, y1 = 1474, 1500, 1074, 1097
sub = im[y0:y1, x0:x1].astype(int)
red = (sub[..., 2] - sub[..., 0] > 40) & (sub[..., 2] > 110)
print('flag px', int(red.sum()))
m[y0:y1, x0:x1][red] = 255
m = cv2.dilate(m, np.ones((5, 5), np.uint8))
im = cv2.inpaint(im, m, 4, cv2.INPAINT_TELEA)
# 2) the Moon: move the disc down by dy px so the whole disc is inside the frame at the cut
g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
reg = g[: int(H * 0.22), : int(W * 0.4)]
n, lab, st, cen = cv2.connectedComponentsWithStats((reg > 165).astype(np.uint8), 8)
k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
bx, by, bw, bh = st[k, :4]
cx, R = bx + bw / 2, bw / 2
cy = by + bh - R            # the painted disc is clipped by the top edge: its true centre comes from its width
print('moon', cx, cy, R)
yy, xx = np.mgrid[:H, :W]
d = np.hypot(xx - cx, yy - cy)
shift = int(2 * R + 180)
sky = np.roll(im, -shift, axis=1)
old = cv2.GaussianBlur((d < R + 16).astype(np.float32), (0, 0), 5.0)[..., None]
base = im * (1 - old) + sky * old
PAD = 40
pim = cv2.copyMakeBorder(im, PAD, 0, 0, 0, cv2.BORDER_REFLECT)       # the clipped cap is completed by reflection
r = int(R + 8)
x0, y0 = int(round(cx)) - r, int(round(cy)) + PAD - r
patch = pim[y0:y0 + 2 * r, x0:x0 + 2 * r].astype(np.float32)
py, px = np.mgrid[:2 * r, :2 * r]
pm = np.clip((R + 0.5 - np.hypot(px - r - (cx - round(cx)), py - r - (cy - round(cy)))) / 2.0 + 0.5, 0, 1)[..., None]
ny = int(round(cy)) + dy - r
res = base.copy()
res[ny:ny + 2 * r, x0:x0 + 2 * r] = res[ny:ny + 2 * r, x0:x0 + 2 * r] * (1 - pm) + patch * pm
cv2.imwrite(out, res.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 95])
print('new moon centre', cx, cy + dy, 'top', cy + dy - R)
