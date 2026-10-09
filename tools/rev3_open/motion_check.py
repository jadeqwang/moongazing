#!/usr/bin/env python3
"""rev3 OPEN: look at motion as motion (rule 3). For a clip or a folder of rendered frames:
  strip   every consecutive frame of a window, cropped to a region, tiled (pops and freezes show as a break in the row)
  diff    mean absolute frame-to-frame difference per frame inside named regions: a spike = a pop, a flat zero = a freeze

    .venv/bin/python tools/rev3_open/motion_check.py strip SRC OUT.jpg --t0=1.0 --n=24 --crop=x,y,w,h [--cols=8] [--w=320] [--step=1]
    .venv/bin/python tools/rev3_open/motion_check.py diff  SRC [--region=name:x,y,w,h ...] [--from=0 --to=999]
SRC is an .mp4 or a printf pattern of frames with --start=N (e.g. render/out/rev3_open/f/f_%06d.jpg --start=242 --count=72).
Crops and regions are fractions of the frame (0..1), so they work at any size.
"""
import sys

import numpy as np
from PIL import Image, ImageDraw


def load(src, opts):
    if src.endswith('.mp4'):
        import av
        with av.open(src) as c:
            fr = [f.to_image() for f in c.decode(video=0)]
        return fr, 24.0
    s, n = int(opts.get('start', 0)), int(opts.get('count', 9999))
    fr = []
    import os
    for i in range(s, s + n):
        p = src % i
        if not os.path.exists(p):
            break
        fr.append(Image.open(p).convert('RGB'))
    return fr, 24.0


def box(im, spec):
    x, y, w, h = [float(v) for v in spec.split(',')]
    W, H = im.size
    return (int(x * W), int(y * H), int((x + w) * W), int((y + h) * H))


if __name__ == '__main__':
    cmd, src = sys.argv[1], sys.argv[2]
    pos = [a for a in sys.argv[3:] if not a.startswith('--')]
    opts = {}
    regions = []
    for a in sys.argv[3:]:
        if a.startswith('--region='):
            regions.append(a[9:])
        elif a.startswith('--'):
            k, _, v = a[2:].partition('='); opts[k] = v
    frames, fps = load(src, opts)
    if cmd == 'strip':
        t0, n, step = float(opts.get('t0', 0)), int(opts.get('n', 24)), int(opts.get('step', 1))
        cols, tw = int(opts.get('cols', 8)), int(opts.get('w', 320))
        i0 = int(round(t0 * fps))
        idx = [i for i in range(i0, i0 + n * step, step) if i < len(frames)]
        b = box(frames[0], opts.get('crop', '0,0,1,1'))
        th = int(tw * (b[3] - b[1]) / (b[2] - b[0]))
        rows = (len(idx) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * tw, rows * (th + 14)), '#171b25')
        d = ImageDraw.Draw(sheet)
        for j, i in enumerate(idx):
            x, y = (j % cols) * tw, (j // cols) * (th + 14)
            sheet.paste(frames[i].crop(b).resize((tw, th), Image.LANCZOS), (x, y))
            d.text((x + 3, y + th + 1), f'f{i} {i / fps:.2f}s', fill='white')
        sheet.save(pos[0], quality=92)
        print(pos[0], len(idx), 'frames')
    elif cmd == 'diff':
        regions = regions or ['all:0,0,1,1']
        a, bnd = int(opts.get('from', 0)), int(opts.get('to', 99999))
        g = [np.asarray(f.convert('L').resize((640, 360), Image.BILINEAR), np.float32) for f in frames]
        print('frames', len(g))
        for r in regions:
            name, _, spec = r.partition(':')
            x, y, w, h = [float(v) for v in spec.split(',')]
            sl = (slice(int(y * 360), int((y + h) * 360)), slice(int(x * 640), int((x + w) * 640)))
            d = np.array([np.abs(g[i][sl] - g[i - 1][sl]).mean() for i in range(1, len(g))])
            dd = d[a:bnd]
            med = float(np.median(dd))
            spikes = [(i + 1 + a, round(float(v), 2)) for i, v in enumerate(dd) if v > max(3 * med, med + 1.0)]
            frozen = [i + 1 + a for i, v in enumerate(dd) if v < 0.02]
            print(f'{name:10s} median {med:.2f}  min {dd.min():.2f}  max {dd.max():.2f}  spikes(>3x median) {spikes[:12]}  frozen(<0.02) {len(frozen)} {frozen[:12]}')
