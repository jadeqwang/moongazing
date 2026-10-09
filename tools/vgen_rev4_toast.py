#!/usr/bin/env python3
"""Oct 8 night (rev4_toast): takes for the repainted two-cup toast close-up K_7.E1c (the hands now hold their cups as
in the wide shot: fist round the lower half, thumb on the near side, straight wrist). Small motion only: the cups rise
a little and hold; no clink. Does not change the shared vgen.SHOTS source.

    .venv/bin/python tools/vgen_rev4_toast.py submit [--model=h3|sd] [--takes=2] [--dry-run]
    .venv/bin/python tools/vgen_rev4_toast.py collect | sheets [K_7.E1c/take_N ...] | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
KEY = 'K_7.E1c'
NOTE = 'rev4_toast Oct8'
TAIL = (' Camera locked. Nothing is ever frozen: the motion is already under way at the very first frame and continues '
        'without a pause to the last frame. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
PROMPT = (
    "Seen from behind, between the backs of two seated women's heads, through a window onto a pale lunar plain under "
    "a black sky. Each woman holds a small cup up toward the sky with her inner arm, the forearm upright, the wrist "
    "straight; each hand is a relaxed fist closed round the lower half of its cup, the thumb resting on the side of "
    "the cup nearest to us, the fingers wrapped round the far side. From the very first frame both arms are lifting, "
    "very slowly and only a little: over about two seconds the left cup (pale green) rises by about one cup's height "
    "until it is level with the right cup (pale grey-white), which rises only a finger's width; then both arms hold "
    "the cups there, steady, swaying a centimetre with the women's breathing, with a very slight tremble. The cups go "
    "straight up: they never move toward each other, never touch, never tilt, nothing spills; the wide gap of black "
    "sky between the two cups stays just as wide and stays empty the whole time. The hands never change their grip: "
    "each thumb stays exactly where it is on the near side of its cup, the same four fingers stay wrapped round the "
    "far side, no finger lifts, slides, appears or disappears, no hand turns, opens or lets go, the wrists stay "
    "straight, no palm ever shows. Each arm stays attached to its own woman's shoulder at the bottom corner and keeps "
    "its length and thickness; the short pale sleeves move slightly with the arms. The cups keep their size, their "
    "straight-sided shape and their colours. The two women's heads tip back very slightly as they look up at the sky "
    "between the cups; a few strands of hair shift. Exactly two arms, two hands and two cups the whole time. The "
    "lunar plain, the mountains, the small white dome beyond the sill, the lattice tower and the dark window sill "
    "stay perfectly still; the sky stays empty and black, nothing appears in it.")
MODELS = {'h3': 'minimax/h3', 'sd': 'bytedance/seedance-2.0'}


def register(model):
    vgen.SHOTS[KEY] = dict(model=MODELS[model], image=f'media/keyframes/{KEY}.png', duration=5, prompt=PROMPT + TAIL)


def sheets(only=None):
    """16-frame contact sheet; every frame 0.4-2.9 s (the part the film uses) cropped to the two hands, as strips."""
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
        out = ROOT / side['file'].replace('.mp4', '_sheet16.jpg'); sheet.save(out, quality=90)
        # consecutive frames, cropped to the hands (x 24-76 %, y 12-72 % of the frame)
        fps = len(frames) / max(frames[-1][0], 1e-6)
        a, b = int(0.4 * fps), min(len(frames), int(2.9 * fps))
        W, H = frames[0][1].size; box = (int(0.24 * W), int(0.12 * H), int(0.76 * W), int(0.72 * H))
        tw, th = 400, int(400 * (box[3] - box[1]) / (box[2] - box[0]))
        outs = []
        for part, lo in enumerate(range(a, b, 24)):
            n = min(24, b - lo); strip = Image.new('RGB', (6 * tw, ((n + 5) // 6) * (th + 14)), '#171b25'); d = ImageDraw.Draw(strip)
            for j in range(n):
                t, im = frames[lo + j]; tile = im.crop(box).resize((tw, th), Image.LANCZOS); x = (j % 6) * tw; y = (j // 6) * (th + 14)
                strip.paste(tile, (x, y)); d.text((x + 4, y + th), f'f{lo + j} {t:.3f}s', fill='white')
            o = ROOT / side['file'].replace('.mp4', f'_hands{part}.jpg'); strip.save(o, quality=88); outs.append(str(o.relative_to(ROOT)))
        side['review_sheet16'] = str(out.relative_to(ROOT)); side['review_hands'] = outs
        Path(p).write_text(json.dumps(side, indent=1, ensure_ascii=False) + '\n')
        print(out.relative_to(ROOT), *outs)


if __name__ == '__main__':
    cmd = sys.argv[1]
    args = [a for a in sys.argv[2:] if not a.startswith('--')]
    opts = {a[2:].partition('=')[0]: a[2:].partition('=')[2] or True for a in sys.argv[2:] if a.startswith('--')}
    if cmd == 'submit':
        m = opts.get('model', 'h3'); register(m)
        print(KEY, m, vgen.submit(KEY, res='720p' if m == 'sd' else '768P', n=int(opts.get('takes', 1)), dry='dry-run' in opts, note=f'{NOTE} ({m})'))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        register('h3'); print('pending:', vgen.collect([KEY]))
    elif cmd == 'sheets':
        sheets(args or None)
    elif cmd == 'spend':
        print(vgen.spend_total())
