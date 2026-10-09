#!/usr/bin/env python3
"""Oct 8 (rev3 OPEN): new takes for the rooftops at 0:10 (K_0.5: people moving, a low amber Moon whole in frame) and the
Huangpu terrace at 0:14 (K_0.6: real river traffic gliding, Jade breathing and shifting, M's raised arms wobbling).
Does not change the shared vgen.SHOTS source. One h3 + one seedance-2.0 take per submit; 16-frame review sheets.

    .venv/bin/python tools/vgen_rev3_open.py submit K_0.5 K_0.6 [--model=h3|sd|both] [--dry-run] [--v=2]
    .venv/bin/python tools/vgen_rev3_open.py collect | sheets [K_0.5/take_2 ...] | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
KEYS = ('K_0.5', 'K_0.6')
NOTE = 'rev3_open Oct8'
TAIL = ' Camera locked: no pan, no tilt, no zoom. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT
DUR = {'K_0.5': 5, 'K_0.6': 6}            # 0.5 uses 0.6–3.6 s; 0.6 + 1.1 use about 4.5 s after the offset
RES_H3 = {'K_0.5': '2K', 'K_0.6': '768P'}   # the rooftop figures are a few pixels tall: give h3 its larger size
PROMPTS = {
    'K_0.5': (
        "A painting on dark silk comes alive: a Tang-dynasty city on Mid-Autumn night, seen from high above. From the "
        "very first frame the tiny people in the lanes and courtyards are already moving, and they keep moving to the "
        "last frame: they stroll along the lanes in twos and threes, in both directions, at an unhurried walking pace, "
        "some carrying small glowing paper lanterns that bob as they walk; children run a few steps ahead and turn "
        "back; people cross the courtyards, bend to the low tables, raise a cup, point up at the moon; others stand "
        "and sway a little, looking up. Every figure keeps its tiny size, its colour and its shape; nobody appears "
        "from nowhere, vanishes, merges with another or slides without walking. The rows of red lanterns under the "
        "eaves flicker and sway gently, each a little differently. The small sky lanterns over the lake shore drift "
        "slowly upward, their flames flickering. On the lake the little boats glide very slowly. The amber full moon "
        "at the upper left stays exactly where it is, the same size, shape and colour, perfectly still; the sky, the "
        "hills, the roofs and the walls do not move. No mist, no fog, no smoke, no clouds, nothing new appears."),
    'K_0.6': (
        "A terrace above the Huangpu river in Shanghai at night. Everything is already in motion at the very first "
        "frame and keeps moving without a pause to the last frame. The woman crouching with her back to us breathes "
        "visibly, her shoulders rising and falling; she slowly shifts her weight from one knee to the other, leans a "
        "little closer to the girl and turns her head a little to the right toward her, then looks back up at the "
        "sky; a light breeze stirs the ends of her very long straight black hair, which keeps its length and colour. "
        "The little girl holds the small grey toy moon up at arm's length with both hands the whole time, on tiptoe; "
        "her raised arms wobble and sway with the effort like a four-year-old's, she sinks back on her heels and "
        "pushes up again; her wavy hair and the hem of her dress stir. The toy moon is a plain matte grey ball: it "
        "never glows, never changes size, and she never lowers it. On the river the boats glide slowly and steadily, "
        "level, never turning: the long low cargo barge with the blue tarpaulin moves to the left, advancing about a "
        "fifth of its own length over the whole clip, with a small bow wave and a thin white wake; the dark coal barge "
        "at the right follows it leftward; the sightseeing boat outlined in coloured lights drifts slowly to the "
        "right, its coloured reflection rippling under it; the white ferry at the left moves slowly to the right; the "
        "ship strung with golden lights barely moves. Each boat keeps its exact shape, size and lights. The tower "
        "reflections shimmer in the ripples; the red lantern sways slightly. The moon, the skyline, the balustrade "
        "and the building do not move."),
}
# second-round wording, used with --v=2 (filled in only if the first round's takes fail; see the report)
PROMPTS_V2 = {
    # K_0.5, second keyframe (a broad festival street opened through the roofs: somewhere for people to walk)
    'K_0.5': (
        "A painting on dark silk comes alive: a Tang-dynasty city on Mid-Autumn night, seen from high above. From the "
        "very first frame everyone on the broad lantern-lit street is already walking, and keeps walking to the last "
        "frame, at an unhurried natural pace with visible steps: those heading down the street to the right keep "
        "going right, those heading up it to the left keep going left, and they pass one another; the round paper "
        "lanterns on sticks bob and swing as they are carried; the children run a few steps, stop and run again; the "
        "two porters with the shoulder pole trot along, their baskets swaying; the group under the fish-shaped "
        "lantern carries it slowly forward, the fish dipping and rising; the sellers at the two stalls stir and "
        "serve, steam curling from the pot. In the courtyards the families shift, turn to each other, raise a cup "
        "and point up at the moon. Every figure keeps its small size, its colours and its shape, with two legs and "
        "natural steps; nobody appears from nowhere, vanishes, merges with another, splits in two or slides without "
        "stepping. The rows of red lanterns flicker and sway gently, each a little differently. The sky lanterns "
        "over the lake drift slowly upward, their flames flickering. The boats on the lake glide very slowly. The "
        "amber full moon stays exactly where it is, the same size and colour, perfectly still; the sky, the hills, "
        "the roofs, the gateways and the walls do not move. No mist, no fog, no clouds."),
}
MODELS = {'h3': 'minimax/h3', 'sd': 'bytedance/seedance-2.0'}


def register(model, v=1):
    for key in KEYS:
        p = (PROMPTS_V2 if v == 2 and key in PROMPTS_V2 else PROMPTS)[key]
        vgen.SHOTS[key] = dict(model=MODELS[model], image=f'media/keyframes/{key}.jpg', duration=DUR[key], prompt=p + TAIL)


def sheets(only=None):
    import av
    import numpy as np
    from PIL import Image, ImageDraw, ImageOps
    for key in KEYS:
        for _, p in vgen.takes(key):
            side = json.loads(Path(p).read_text())
            if NOTE not in side.get('notes', '') or side.get('state') != 'done':
                continue
            if only and f"{key}/take_{side['take']}" not in only:
                continue
            with av.open(str(ROOT / side['file'])) as c:
                frames = [(float(f.time), f.to_image()) for f in c.decode(video=0)]
            idx = np.linspace(0, len(frames) - 1, 16).round().astype(int)
            sheet = Image.new('RGB', (1920, 4 * 290 + 30), '#171b25')
            d = ImageDraw.Draw(sheet); d.text((8, 8), f"{key} take_{side['take']} {side['model']} | 16 frames | inspect BEFORE roto", fill='white')
            for j, i in enumerate(idx):
                t, im = frames[i]; tile = ImageOps.fit(im, (480, 270))
                x = (j % 4) * 480; y = 30 + (j // 4) * 290
                sheet.paste(tile, (x, y)); d.text((x + 5, y + 272), f'{t:.3f}s / f{i}', fill='white')
            out = ROOT / side['file'].replace('.mp4', '_sheet16.jpg'); sheet.save(out, quality=92)
            side['review_sheet16'] = str(out.relative_to(ROOT))
            Path(p).write_text(json.dumps(side, indent=1, ensure_ascii=False) + '\n')
            print(out.relative_to(ROOT))


if __name__ == '__main__':
    cmd = sys.argv[1]
    args = [a for a in sys.argv[2:] if not a.startswith('--')]
    opts = {a[2:].partition('=')[0]: a[2:].partition('=')[2] or True for a in sys.argv[2:] if a.startswith('--')}
    if cmd == 'submit':
        which = opts.get('model', 'both')
        v = int(opts.get('v', 1))
        for m in (('h3', 'sd') if which == 'both' else (which,)):
            register(m, v)
            for key in args:
                assert key in KEYS
                res = '720p' if m == 'sd' else RES_H3[key]
                print(key, m, vgen.submit(key, res=res, n=1, dry='dry-run' in opts, note=f'{NOTE} ({m}, v{v})'))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        register('h3'); print('pending:', vgen.collect(list(KEYS)))
    elif cmd == 'sheets':
        sheets(args or None)
    elif cmd == 'spend':
        mine = 0.0
        for key in KEYS:
            for _, p in vgen.takes(key):
                side = json.loads(Path(p).read_text())
                if NOTE in side.get('notes', '') and side.get('state') not in ('error', 'collected_error'):
                    mine += side.get('est_usd', 0)
        print('rev3_open video (est): $', round(mine, 2), '| project total: $', vgen.spend_total())
