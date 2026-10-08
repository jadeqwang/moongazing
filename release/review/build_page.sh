#!/bin/bash
# Cut the review clips and stills for the decisions page from a rendered cut (default: v5, 540p frames).
#   bash release/review/build_page.sh [FRAMEDIR=render/out/frames_v5_540]
# Output: render/out/rev_page/v5/{clips5,img}/ (not in git). Publish release/review/decisions.html with those files as
# clips5/* and img/*; the "before" clips (clips/part_N.mp4, the v4 parts) are already on the page and are kept.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd); cd "$ROOT"
FR=${1:-render/out/frames_v5_540}; OUT=render/out/rev_page/v5; PY=.venv/bin/python
mkdir -p $OUT/clips5 $OUT/img
PARTS="0-17.54 17.54-32.42 32.42-46.82 46.82-61.65 61.65-76.11 76.11-101.33 101.33-122.77 122.77-147.64 147.64-161.77 161.77-189.86 189.86-221.04"
i=0; for r in $PARTS; do i=$((i+1)); (cd render && node tools/render.mjs --encode $r --scale 0.5 --framedir "$ROOT/$FR" --crf 29 --out "$ROOT/$OUT/clips5/part_$i.mp4" 2>&1 | tail -1); done
cp render/out/rev2_ls/4.3_sung_540p.mp4 $OUT/clips5/sung_4.3.mp4
cp render/out/rev2_brk/breakdown_after_noface.mp4 $OUT/clips5/brk_noface.mp4
$PY - "$FR" "$OUT/img" <<'PY'
import sys
from PIL import Image
fr, out = sys.argv[1], sys.argv[2]
def frame(i, d=fr): return Image.open(f'{d}/f_{i:06d}.jpg').convert('RGB')
def save(im, name, w=960): im = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS); im.save(f'{out}/{name}.jpg', quality=86)
for name, i in {'r2_tea': 1140, 'r2_sung_now': 1975, 'r2_brk': 2806, 'r2_brk_layla': 2830, 'r2_brk_home': 2885, 'r2_build': 3043,
                'r2_build_fins': 3106, 'r2_build_pad': 3170, 'r2_ddr': 3561, 'r2_toast': 4316, 'r2_hair': 590, 'r2_crew_a': 562,
                'r2_toast_wide': 4228, 'r2_toast_adaeze': 4270}.items(): save(frame(i), name)
save(frame(1985, 'render/out/rev2_ls/frames_sung_540'), 'r2_sung')
tv = Image.open('render/out/rev2_c2/stills/c2_148.583.png').convert('RGB')          # 1080p still: the TV, enlarged
save(tv.crop((0, 80, 640, 440)), 'r2_ddr_tv')
ba = Image.open('render/out/rev2_hair/before_after_jade_head.jpg').convert('RGB'); save(ba, 'r2_hair_head', 1280)
parts = [(0, 17.54), (17.54, 32.42), (32.42, 46.82), (46.82, 61.65), (61.65, 76.11), (76.11, 101.33), (101.33, 122.77), (122.77, 147.64), (147.64, 161.77), (161.77, 189.86), (189.86, 221.04)]
for n, (a, b) in enumerate(parts, 1): save(frame(round((a + 0.4 * (b - a)) * 24)), f'v5_part_{n}', 640)
PY
ls -la $OUT/clips5 $OUT/img | awk '{print $5, $9}'
echo PAGE_BUILD_DONE
