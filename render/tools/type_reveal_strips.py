#!/usr/bin/env python3
"""Strips of CONSECUTIVE frames across the arrival and the leaving of every piece of type, to look at.

    ../.venv/bin/python tools/type_reveal_strips.py out/type_reveal_check.json out/frames_540 out/type_strips [--scale 0.5] [--only en,zh]

Reads the report of tools/type_reveal_check.mjs (which knows when each piece arrives, when it leaves and where its ink
is) and the rendered frames (f_%06d.jpg|png, index = round(t*24), any scale: give --scale), and writes one image per
piece: the crop around the type for every frame from 3 frames before it first shows to 4 frames after it is whole, then
a gap, then every frame of its fade-out. Each tile carries its time; a red bar under a tile marks a frame at a cut.
"""
import json, os, sys
from PIL import Image, ImageDraw

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = {sys.argv[i][2:]: sys.argv[i + 1] for i in range(1, len(sys.argv) - 1) if sys.argv[i].startswith('--')}
rep, frames, out = args[:3]
S = float(opt.get('scale', 0.5)); only = set(opt['only'].split(',')) if 'only' in opt else None
R = json.load(open(rep)); os.makedirs(out, exist_ok=True)
W, H = round(1920 * S), round(1080 * S)

def frame(f):
    for ext in ('jpg', 'png'):
        p = os.path.join(frames, f'f_{f:06d}.{ext}')
        if os.path.exists(p): return Image.open(p).convert('RGB')
    return None

for n, it in enumerate(R['items']):
    if only and it['kind'] not in only: continue
    w = it['whole']; a = w['a']; v = w['v']; b = it.get('bbox')
    if not b: continue
    pad = 26
    box = [max(0, int((b[0] - pad) * S)), max(0, int((b[1] - pad) * S)), min(W, int((b[2] + pad) * S)), min(H, int((b[3] + pad) * S))]
    cw, ch = box[2] - box[0], box[3] - box[1]
    if cw < 8 or ch < 8: continue
    # arrival: from 3 frames before the first ink to 4 after the last unit is whole; leaving: from 2 before the fall
    last_up = max([u['a'] + next((i for i, x in enumerate(u['v']) if x >= 0.97), 0) for u in it['units']] + [a + next((i for i, x in enumerate(v) if x >= 0.97), 0)])
    arr = list(range(a - 3, min(last_up + 5, a + len(v) + 2)))
    j = len(v) - 1
    while j > 0 and v[j] < 0.97: j -= 1
    lea = list(range(max(a + j - 1, arr[-1] + 1), a + len(v) + 2))
    if len(arr) > 96: arr = arr[:96]
    tw = min(cw, 300); k = tw / cw; th = max(12, round(ch * k)); cols = max(3, min(12, 1800 // (tw + 2)))
    seq = arr + [None] + lea
    rows = (len(seq) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 2), rows * (th + 14) + 16), (24, 24, 26)); d = ImageDraw.Draw(sheet)
    d.text((3, 2), f"{w['first']}  shot {w['shot']}  {it['kind']}  {it['key']}   arrival: {len(arr)} consecutive frames, then the fade-out", fill=(230, 220, 190))
    cuts = set(R.get('cuts', []))
    for i, f in enumerate(seq):
        x, y = (i % cols) * (tw + 2), 16 + (i // cols) * (th + 14)
        if f is None: d.text((x + 4, y + 2), '…', fill=(200, 200, 200)); continue
        im = frame(f)
        if im is None: d.text((x + 4, y + 2), f'no frame {f}', fill=(255, 90, 90)); continue
        sheet.paste(im.crop(box).resize((tw, th), Image.LANCZOS), (x, y))
        d.text((x + 2, y + th + 1), f'{f / 24:.2f}', fill=(255, 110, 110) if f in cuts else (170, 170, 170))
        if f in cuts: d.rectangle((x, y + th, x + tw, y + th + 1), fill=(230, 60, 60))
    name = f"{n:02d}_{w['first'].replace(':', 'm')}_{it['kind']}_{it['key'].replace('/', '_')[:40]}.jpg"
    sheet.save(os.path.join(out, name), quality=88)
    print(name, sheet.size, len(arr), len(lea))
