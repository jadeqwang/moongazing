#!/usr/bin/env python3
"""Oct 8 (rev3_crew): takes for the restaged toast (K_7.E1, K_7.E1b, K_7.E1c: natural arms and wrists, one staging)
and for K_7.C5c (the stray third hand removed). Does not change the shared vgen.SHOTS source.

    .venv/bin/python tools/vgen_rev3_crew.py submit K_7.E1 K_7.E1b K_7.E1c K_7.C5c [--model=h3|sd|both] [--dry-run]
    .venv/bin/python tools/vgen_rev3_crew.py collect | sheets [K/take_N ...] | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
KEYS = ('K_7.E1', 'K_7.E1b', 'K_7.E1c', 'K_7.C5c')
EXT = {'K_7.E1': 'jpg', 'K_7.E1b': 'png', 'K_7.E1c': 'png', 'K_7.C5c': 'jpg'}
NOTE = 'rev3_crew Oct8'
TAIL = (' Camera locked. Nothing is ever frozen: the motion is already under way at the very first frame and continues '
        'without a pause to the last frame. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
PROMPTS = {
    'K_7.E1': (
        "Seen from behind inside a dark glass dome: eight people face the window and hold small cups up toward the black "
        "sky above a pale plain, each with one arm raised forward and up. From the very first frame everyone is "
        "moving a little, each at their own moment, never together: one after another they lift their cups a few "
        "centimetres higher and hold them there with a slight tremble; one shifts her weight from one foot to the "
        "other; another tips his head back; the two seated women lean slightly toward each other and raise their cups "
        "a little; the tall man at the right gently squeezes the shoulder of the woman beside him. Everyone breathes. "
        "Every raised arm stays raised and keeps its shape: the elbows stay slightly bent, the wrists stay straight, "
        "the cups stay upright and small, no arm drops, no hand opens, nobody drinks, nobody turns round, nobody "
        "walks. Exactly eight people and eight cups the whole time; no new person, arm or cup appears. The dome "
        "frames, the bench, the masts, the tower, the plain and the mountains stay perfectly still; the sky stays "
        "empty and black, nothing appears in it."),
    # second wording (takes 8, 9): in take_6 the arm kept rising until the cup left the top of the frame and her eyes
    # stayed shut for three seconds
    'K_7.E1b': (
        "A woman seen in profile, facing left, holds a small cup up at the end of her long outstretched arm, toward "
        "something far away up to the left. Her arm is already as high as it goes: it stays where it is for the "
        "whole shot, one long line from shoulder to cup, only trembling very slightly and swaying a centimetre with "
        "her breathing; the hand and the whole cup stay completely inside the picture, well below its top edge, the "
        "whole time. From the very first frame she is alive and moving a little: she breathes in deeply and her "
        "shoulders lift, then she breathes out; she blinks once, quickly, and otherwise her eyes stay OPEN, wet and "
        "shining, fixed on the same far point beyond the cup; the tear on her cheek slides slowly down; her "
        "closed-lip smile widens a little and her head tips up very slightly. The hand never changes its grip: the "
        "back of the hand stays toward the camera, the same four fingers stay across the cup and the thumb stays on "
        "the side of the cup nearest her; the hand never turns, never opens, never lets go; the wrist stays straight; "
        "the cup stays upright and keeps its size and shape. Her face keeps exactly its features, age and deep "
        "dark-brown skin; her mouth stays closed; she never turns toward the camera. She is alone: no other person, "
        "hand or arm ever appears. The dark blue background and its thin curved lines stay perfectly still."),
    'K_7.E1c': (
        "Seen from behind, between the backs of two seated women's heads, through a window onto a pale lunar plain "
        "under a black sky. Each woman holds up a small cup with her inner arm; we see the BACKS of both hands, each "
        "hand simply continuing the line of its forearm, the fingers lying up across the near side of each cup. From "
        "the very first frame both arms keep lifting, slowly and steadily, not quite together (the right one a "
        "little ahead): the two cups rise straight up and drift a little apart, until after about three seconds both "
        "cups are held up against the black sky above the mountain tops, about level with each other, with a clear "
        "gap of black sky about two cups wide between them; then the arms hold them there, trembling very slightly. "
        "The hands never turn: the backs of the hands stay toward the camera the whole time, the wrists stay "
        "straight, the same four fingers stay across each cup, no palm ever shows, no hand opens or lets go; the cups "
        "never touch each other and never cross the centre line. Each arm stays attached to its own woman's shoulder "
        "at the bottom corner; the short pale sleeves move with the arms. The cups stay upright and keep their shape "
        "and colour (one pale green with fine crackle, one pale grey-white). The two women's heads tip back a little "
        "as they look up at the sky above the cups; a few strands of hair shift. Exactly two arms, two hands and two "
        "cups the whole time; four fingers showing on each hand. The lunar plain, the mountains, the small white "
        "dome beyond the sill, the lattice tower and the dark window sill stay perfectly still; the sky stays empty "
        "and black, nothing appears in it."),
    'K_7.C5c': (
        "A woman and a man lean together, both looking down at a tablet that he holds in both hands. The woman on "
        "the left laughs softly, her shoulders shaking a little; the hand she holds against her chest pats it once "
        "and stays there; she tips her head toward his shoulder. Her other arm stays down at her side, hidden behind "
        "the tablet: no other hand ever appears, nothing rises above the tablet. The man smiles, blinks, swallows, "
        "and his eyes shine behind his glasses; he tilts the tablet very slightly toward her; his two hands keep "
        "holding it, fingers unchanged. Neither of them ever looks at the camera. The warm light from the tablet "
        "flickers very faintly on their faces and shirts; the leaves in the violet-lit chamber behind them tremble a "
        "little. Exactly three hands are visible the whole time: her one hand on her chest and his two on the "
        "tablet. Everyone breathes and blinks naturally. The room, walls, furniture and all line-drawn architecture "
        "stay perfectly rigid and fixed; nothing warps, appears or disappears."),
}
MODELS = {'h3': 'minimax/h3', 'sd': 'bytedance/seedance-2.0'}


def register(model):
    for key in KEYS:
        vgen.SHOTS[key] = dict(model=MODELS[model], image=f'media/keyframes/{key}.{EXT[key]}', duration=5, prompt=PROMPTS[key] + TAIL)


def sheets(only=None):
    """16-frame contact sheet + a strip of 24 consecutive frames (0.5-1.5 s, the part the film uses first) per take."""
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
            out = ROOT / side['file'].replace('.mp4', '_sheet16.jpg'); sheet.save(out, quality=90)
            strip = Image.new('RGB', (8 * 320, 3 * 196), '#171b25'); d = ImageDraw.Draw(strip)
            for j, i in enumerate(range(12, 36)):
                if i >= len(frames): break
                t, im = frames[i]; tile = ImageOps.fit(im, (320, 180)); x = (j % 8) * 320; y = (j // 8) * 196
                strip.paste(tile, (x, y)); d.text((x + 4, y + 182), f'f{i} {t:.3f}s', fill='white')
            out2 = ROOT / side['file'].replace('.mp4', '_strip24.jpg'); strip.save(out2, quality=88)
            side['review_sheet16'] = str(out.relative_to(ROOT)); side['review_strip24'] = str(out2.relative_to(ROOT))
            Path(p).write_text(json.dumps(side, indent=1, ensure_ascii=False) + '\n')
            print(out.relative_to(ROOT), out2.relative_to(ROOT))


if __name__ == '__main__':
    cmd = sys.argv[1]
    args = [a for a in sys.argv[2:] if not a.startswith('--')]
    opts = {a[2:].partition('=')[0]: a[2:].partition('=')[2] or True for a in sys.argv[2:] if a.startswith('--')}
    if cmd == 'submit':
        which = opts.get('model', 'both')
        for m in (('h3', 'sd') if which == 'both' else (which,)):
            register(m)
            for key in args:
                assert key in KEYS
                print(key, m, vgen.submit(key, res='720p' if m == 'sd' else '768P', n=int(opts.get('takes', 1)), dry='dry-run' in opts, note=f'{NOTE} ({m})'))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        register('h3'); print('pending:', vgen.collect(list(args or KEYS)))
    elif cmd == 'sheets':
        sheets(args or None)
    elif cmd == 'spend':
        print(vgen.spend_total())
