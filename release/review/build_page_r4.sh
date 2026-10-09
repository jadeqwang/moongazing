#!/bin/bash
# Round four: build the decisions page and its media for the fixes that followed Jade's round-three answers.
#   bash release/review/build_page_r4.sh [FRAMEDIR=render/out/frames_v7_540]
# FRAMEDIR is cut v6 with only the fixed passages re-rendered. Reads release/review/cards_r4.json
# ({"cards": [...], "settled": [...]}; a card's "clips" are [file, label, caption, from_s, to_s, poster frame or image path, framedir or .mp4?])
# and cards_r3.json (the answered round-three cards, kept on the page under a fold). Writes release/review/decisions.html
# (the page's <style> + page_r4_body.html with the cards inlined) and render/out/rev_page/v7/{clips7,img7}/ (not in git).
# Publish decisions.html with those files as clips7/* and img7/*; clips6/*, img6/* and lyric/* are already on the page.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd); cd "$ROOT"
FR=${1:-render/out/frames_v7_540}; OUT=render/out/rev_page/v7; PY=.venv/bin/python
mkdir -p $OUT/clips7 $OUT/img7
$PY - "$FR" "$OUT" <<'PY'
import json, subprocess, sys, os
from PIL import Image
fr, out = sys.argv[1], sys.argv[2]
root = os.getcwd()
def frame(i, d=fr): return Image.open(f'{d}/f_{i:06d}.jpg').convert('RGB')
def save(im, name, w=960): im.resize((w, round(w * im.height / im.width)), Image.LANCZOS).save(f'{out}/img7/{name}.jpg', quality=86)
spec = json.load(open('release/review/cards_r4.json'))
def still(ref, d=fr): return Image.open(ref).convert('RGB') if isinstance(ref, str) else frame(ref, d)
for d in spec['cards']:
    for file, _label, _cap, a, b, poster, *rest in d.get('clips', []):
        src = rest[0] if rest else fr
        dst = os.path.join(root, out, 'clips7', f'{file}.mp4')
        if src.endswith('.mp4'):   # a clip an owner already cut (an alternative that is not wired): shrink it as it is
            r = subprocess.run(['.venv/bin/ffmpeg', '-v', 'error', '-y', '-i', src, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
                                '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', dst], capture_output=True, text=True)
        else:
            r = subprocess.run(['node', 'tools/render.mjs', '--encode', f'{a}-{b}', '--scale', '0.5', '--framedir', os.path.join(root, src), '--crf', '26', '--out', dst],
                               cwd='render', capture_output=True, text=True)
        if r.returncode: sys.exit(f'encode failed for {file}: {r.stderr[-400:]}')
        print(file, os.path.getsize(dst))
        save(still(poster, src), file)
    if d.get('bp'): save(frame(d['bp'], 'render/out/frames_v6_540'), f"{d['id']}_before")   # poster of the "Before" clip: the same frame in the cut she watched
    for k, (i, _cap, *rest) in enumerate(d.get('more', [])): save(still(i, rest[0] if rest else fr), f"{d['id']}_{k}")
old = open('release/review/decisions.html', encoding='utf8').read()
head = old[:old.index('</style>')]
extra = open('release/review/page_r4.css', encoding='utf8').read()
if '/* round four */' in head: head = head[:head.index('/* round four */')]
cards = [{k: v for k, v in d.items()} for d in spec['cards']]
for d in cards: d['clips'] = [c[:3] for c in d.get('clips', [])]
body = open('release/review/page_r4_body.html', encoding='utf8').read()
body = body.replace('__CARDS4__', json.dumps(cards, ensure_ascii=False)).replace('__SETTLED__', json.dumps(spec['settled'], ensure_ascii=False))
body = body.replace('__CARDS__', json.dumps(json.load(open('release/review/cards_r3.json')), ensure_ascii=False))
open('release/review/decisions.html', 'w', encoding='utf8').write(head.rstrip() + '\n' + extra + '</style>\n' + body)
PY
ls -la $OUT/clips7 $OUT/img7 | awk '{print $5, $9}'
echo PAGE_BUILD_DONE
