#!/usr/bin/env python3
"""Oct 8 (rev2_c2): new takes for 7.C2 after K_7.C2 v6 (the family cat instead of the toy robot dog; the TV a flat key
blue that tools/ddr_screen.py keys the real game screen onto). Does not change the shared vgen.SHOTS source.
One h3 + one seedance-2.0 take per submit; 16-frame review sheets (look at them BEFORE roto prep).

    .venv/bin/python tools/vgen_rev2_c2.py submit [--model=h3|sd|both] [--dry-run]
    .venv/bin/python tools/vgen_rev2_c2.py collect | sheets [K_7.C2/take_N] | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
KEY = 'K_7.C2'
NOTE = 'rev2_c2 Oct8 cat'
PROMPT = (
    "A downstairs play room, a dance-pad game, seen from behind. The father stands right behind his son on the floor "
    "dance pad, holding the boy's forearms, and the two of them step together in a steady rhythm, about two steps per "
    "second, onto the glowing arrow panels: left, right, left, right, knees soft, bouncing lightly. Both keep facing the "
    "television. The television shows a plain, flat, uniformly bright blue screen: it stays exactly that same flat blue "
    "the whole time, with no picture, no shapes, no arrows, no reflections and no flicker. In the foreground the little "
    "girl bounces on bent knees in the same rhythm, fists up, laughing, looking down at the cat beside her; the skirt of "
    "her dress swings. The long-haired tabby cat sits on the carpet right next to her and is already batting at the "
    "swinging hem of her dress with its raised front paw: quick, soft pats, the paw darting out and pulling back, again "
    "and again; its head and eyes follow the hem, its ears twitch, and the tip of its fluffy tail flicks on the carpet. "
    "The cat stays seated on the same spot the whole time and keeps exactly its size, shape and markings: one head, "
    "four legs, one tail; it never stands up, never walks, never jumps, never slides, never changes. The children keep "
    "their size, faces and clothes; natural, child-like, physically plausible motion. The motion is already under way in "
    "the very first frame and continues without any pause to the last frame; nobody freezes; everyone breathes and "
    "blinks naturally. The room, walls, furniture and all line-drawn architecture stay perfectly rigid and fixed; "
    "nothing warps, appears or disappears. Camera locked, perfectly still. Keep the exact art style, colours, paper "
    "texture and line work of the first frame: it stays a flat painted illustration, never photographic. No text, no "
    "letters, no subtitles, no logos, no watermark.")
MODELS = {'h3': 'minimax/h3', 'sd': 'bytedance/seedance-2.0'}


def register(model):
    vgen.SHOTS[KEY] = dict(model=MODELS[model], image=f'media/keyframes/{KEY}.jpg', duration=5, prompt=PROMPT)


def sheets(only=None):
    import av
    import numpy as np
    from PIL import Image, ImageDraw, ImageOps
    for _, p in vgen.takes(KEY):
        side = json.loads(Path(p).read_text())
        if NOTE not in side.get('notes', '') or side.get('state') != 'done':
            continue
        if only and f"{KEY}/take_{side['take']}" not in only:
            continue
        with av.open(str(ROOT / side['file'])) as c:
            frames = [(float(f.time), f.to_image()) for f in c.decode(video=0)]
        idx = np.linspace(0, len(frames) - 1, 16).round().astype(int)
        sheet = Image.new('RGB', (1920, 4 * 290 + 30), '#171b25')
        d = ImageDraw.Draw(sheet); d.text((8, 8), f"{KEY} take_{side['take']} {side['model']} | 16 frames | inspect BEFORE roto", fill='white')
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
        for m in (('h3', 'sd') if which == 'both' else (which,)):
            register(m)
            print(KEY, m, vgen.submit(KEY, res='720p' if m == 'sd' else '768P', n=1, dry='dry-run' in opts, note=f'{NOTE} ({m})'))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        register('h3'); print('pending:', vgen.collect([KEY]))
    elif cmd == 'sheets':
        sheets(args or None)
    elif cmd == 'spend':
        print(vgen.spend_total())
