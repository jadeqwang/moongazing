#!/usr/bin/env python3
"""Zoomed crop sheet of a take (revision round helper): tools/_rev_crops.py SHOT/take_N x0 y0 x1 y1 [n=8] [out.jpg]
   (box in fractions of the frame)."""
import sys, os, av
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
item = sys.argv[1]; x0, y0, x1, y1 = map(float, sys.argv[2:6]); n = int(sys.argv[6]) if len(sys.argv) > 6 else 8
shot, take = item.split('/')
with av.open(os.path.join(ROOT, 'media/gen', shot, take + '.mp4')) as c:
    fr = [f.to_image() for f in c.decode(c.streams.video[0])]
idx = [round(i * (len(fr) - 1) / (n - 1)) for i in range(n)]
w, h = fr[0].size; box = (int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))
cw, ch = box[2] - box[0], box[3] - box[1]; k = 640 / cw; tw, th = 640, round(ch * k)
cols = 4 if n > 4 else n
out = Image.new('RGB', (tw * cols, th * ((n + cols - 1) // cols)))
for j, i in enumerate(idx):
    im = fr[i].crop(box).resize((tw, th), Image.LANCZOS); d = ImageDraw.Draw(im); d.rectangle((0, 0, 110, 14), fill=(0, 0, 0)); d.text((3, 2), f"{i/24:.2f}s f{i}", fill=(255, 255, 0))
    out.paste(im, ((j % cols) * tw, (j // cols) * th))
p = sys.argv[7] if len(sys.argv) > 7 else os.path.join(ROOT, 'media/gen', shot, f'{take}_crops.jpg')
out.save(p, quality=88); print(p)
