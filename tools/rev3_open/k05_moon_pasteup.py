import sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
src, out = sys.argv[1], sys.argv[2]
cu, cv, R = float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])   # new centre (fractions of w, h), radius in px
im = Image.open(src).convert('RGB'); W, H = im.size
a = np.asarray(im).astype(np.float32)
# old moon: bright warm pixels in the upper-left quarter
sub = a[: int(H * 0.30), : int(W * 0.23)]
warm = (sub[..., 0] > 120) & (sub[..., 0] - sub[..., 2] > 35)
ys, xs = np.nonzero(warm)
x0, x1, y0 = xs.min(), xs.max(), ys.min()
ocx, oR = (x0 + x1) / 2, (x1 - x0) / 2
ocy = y0 + oR
print('old moon centre', ocx, ocy, 'R', oR, 'lowest warm y', ys.max())
yy, xx = np.mgrid[:H, :W]
d_old = np.hypot(xx - ocx, yy - ocy)
warm_full = (a[..., 0] > 95) & (a[..., 0] - a[..., 2] > 22) & (d_old < oR + 14) & (yy < ys.max() + 6)
mask = Image.fromarray((warm_full * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(4))
# sky patch from further right at the same height (empty sky there)
shift = int(oR * 2 + 260)
sky = Image.fromarray(np.roll(np.asarray(im), -shift, axis=1))
base = Image.composite(sky, im, mask)
# new moon: the old disc, scaled; the part the hill hid is filled with the disc's mean colour
box = [int(ocx - oR), int(ocy - oR), int(ocx + oR), int(ocy + oR)]
disc = im.crop(box); da = np.asarray(disc).astype(np.float32)
dm = (da[..., 0] > 95) & (da[..., 0] - da[..., 2] > 22)
mean = da[dm].mean(axis=0)
# mirror the upper half's limb darkening into the hidden lower part: use a vertically flipped copy where not moon
flip = da[::-1]
fm = dm[::-1]
fill = np.where(fm[..., None], flip, mean[None, None])
da2 = np.where(dm[..., None], da, fill).astype(np.uint8)
n = int(round(2 * R))
disc2 = Image.fromarray(da2).resize((n, n), Image.LANCZOS)
cm = Image.new('L', (n * 4, n * 4), 0); ImageDraw.Draw(cm).ellipse([6, 6, n * 4 - 7, n * 4 - 7], fill=255)
cm = cm.resize((n, n), Image.LANCZOS)
base.paste(disc2, (int(round(cu * W - R)), int(round(cv * H - R))), cm)
base.save(out, quality=95)
print('new moon centre px', cu * W, cv * H, 'R', R, '->', out)
