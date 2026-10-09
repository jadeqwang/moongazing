#!/usr/bin/env python3
"""Sheets for reviewing a rendered cut cut by cut: three frames before and three after every cut (six cuts a sheet,
the first frame of the new shot labelled in red), and every sixth frame of the whole film (12 s a sheet).

    cd render && node tools/shot_table.mjs > out/review/shots.txt
    ../.venv/bin/python tools/review_sheets.py out/review/shots.txt out/frames_v8_540 out/review

Writes <out>/cuts/ and <out>/motion/. Frames are f_%06d.jpg, index = round(t*24). Used Oct 9 for the review of cut v8
(docs/reviews/rev5_review_a.md, rev5_review_b.md), together with tools/type_reveal_strips.py.
"""
import os, sys, math
from PIL import Image, ImageDraw
SHOTS, F, R = sys.argv[1:4]
shots = []
for ln in open(SHOTS):
    p = ln.split()
    if len(p) >= 5: shots.append((p[0], float(p[1]), float(p[2])))
def fr(n):
    p = os.path.join(F, f'f_{n:06d}.jpg')
    return Image.open(p).convert('RGB') if os.path.exists(p) else None
TW, TH = 256, 144
def tile(n, mark=False):
    im = fr(n); t = Image.new('RGB', (TW, TH + 14), (20, 20, 20))
    if im: t.paste(im.resize((TW, TH), Image.LANCZOS), (0, 0))
    d = ImageDraw.Draw(t); d.text((3, TH + 1), f'{n/24:7.3f}s f{n}', fill=(255, 90, 90) if mark else (220, 220, 220))
    return t
os.makedirs(os.path.join(R, 'cuts'), exist_ok=True); os.makedirs(os.path.join(R, 'motion'), exist_ok=True)
# cut sheets: 6 cuts a sheet
cuts = [(shots[i][0], shots[i + 1][0], shots[i + 1][1]) for i in range(len(shots) - 1)]
for s in range(0, len(cuts), 6):
    grp = cuts[s:s + 6]; sh = Image.new('RGB', (TW * 6 + 150, (TH + 14) * len(grp)), (0, 0, 0)); d = ImageDraw.Draw(sh)
    for r, (a, b, t) in enumerate(grp):
        f0 = math.ceil(t * 24 - 1e-6); y = r * (TH + 14)
        d.text((4, y + 40), f'{a} -> {b}\ncut {t:.2f}s\n({int(t//60)}:{t%60:05.2f})', fill=(255, 255, 255))
        for k in range(6): sh.paste(tile(f0 - 3 + k, k == 3), (150 + k * TW, y))
    sh.save(os.path.join(R, 'cuts', f'cuts_{grp[0][2]:06.2f}_{grp[-1][2]:06.2f}.jpg'), quality=85)
# motion sheets: every 6th frame, 8 columns x 6 rows = 12 s a sheet
N = len([f for f in os.listdir(F) if f.startswith('f_')])
for s in range(0, N, 288):
    sh = Image.new('RGB', (TW * 8, (TH + 14) * 6), (0, 0, 0))
    for k in range(48):
        n = s + k * 6
        if n < N: sh.paste(tile(n), ((k % 8) * TW, (k // 8) * (TH + 14)))
    sh.save(os.path.join(R, 'motion', f'motion_{s/24:06.2f}.jpg'), quality=85)
