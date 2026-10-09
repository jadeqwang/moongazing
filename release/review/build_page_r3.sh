#!/bin/bash
# Round three: build the decisions page and its media from a rendered cut (default: v6, 540p frames).
#   bash release/review/build_page_r3.sh [FRAMEDIR=render/out/frames_v6_540]
# Writes release/review/decisions.html (the old page's <style> + page_r3_body.html with cards_r3.json inlined) and
# render/out/rev_page/v6/{clips6,img6,lyric}/ (not in git). Publish decisions.html with those files as clips6/*, img6/*
# and lyric/*; the "before" clips (clips5/part_N.mp4, the v5 parts) are already on the page and are kept.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd); cd "$ROOT"
FR=${1:-render/out/frames_v6_540}; OUT=render/out/rev_page/v6; PY=.venv/bin/python; FF=.venv/bin/ffmpeg
mkdir -p $OUT/clips6 $OUT/img6 $OUT/lyric
PARTS="0-17.54 17.54-32.42 32.42-46.82 46.82-61.65 61.65-76.11 76.11-101.33 101.33-122.77 122.77-147.64 147.64-161.77 161.77-189.86 189.86-221.04"
i=0; for r in $PARTS; do i=$((i+1)); (cd render && node tools/render.mjs --encode $r --scale 0.5 --framedir "$ROOT/$FR" --crf 29 --out "$ROOT/$OUT/clips6/part_$i.mp4" 2>&1 | tail -1); done
for v in full:Moongazing_lyric_video karaoke:Moongazing_lyric_video_karaoke; do
  $FF -v error -y -i render/out/lyric_video/${v#*:}.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart $OUT/lyric/${v%%:*}.mp4
done
$PY - "$FR" "$OUT/img6" <<'PY'
import json, re, sys
from PIL import Image
fr, out = sys.argv[1], sys.argv[2]
def frame(i): return Image.open(f'{fr}/f_{i:06d}.jpg').convert('RGB')
def save(im, name, w=960): im.resize((w, round(w * im.height / im.width)), Image.LANCZOS).save(f'{out}/{name}.jpg', quality=86)
cards = json.load(open('release/review/cards_r3.json'))
for d in cards:
    if d.get('p'): save(frame(d['p']), d['id'])
    for k, (i, _cap) in enumerate(d.get('more', [])): save(frame(i), f"{d['id']}_{k}")
parts = [(0, 17.54), (17.54, 32.42), (32.42, 46.82), (46.82, 61.65), (61.65, 76.11), (76.11, 101.33), (101.33, 122.77), (122.77, 147.64), (147.64, 161.77), (161.77, 189.86), (189.86, 221.04)]
for n, (a, b) in enumerate(parts, 1): save(frame(round((a + 0.4 * (b - a)) * 24)), f'part_{n}', 640)
save(Image.open('render/out/lyric_video/bg_1080.png').convert('RGB'), 'lyric', 640)
old = open('release/review/decisions.html', encoding='utf8').read()
head = old[:old.index('</style>') + len('</style>')]
body = open('release/review/page_r3_body.html', encoding='utf8').read().replace('__CARDS__', json.dumps(cards, ensure_ascii=False))
open('release/review/decisions.html', 'w', encoding='utf8').write(head + '\n' + body)
PY
ls -la $OUT/clips6 $OUT/img6 $OUT/lyric | awk '{print $5, $9}'
echo PAGE_BUILD_DONE
