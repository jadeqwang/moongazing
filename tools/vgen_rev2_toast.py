#!/usr/bin/env python3
"""Oct 8 (rev2_toast): new takes for the toast's two hand shots after the keyframes' hands were corrected
(K_7.E1b: Adaeze's raised hand is now a left hand; K_7.E1c: both hands seen from behind, each on its owner's arm).
Does not change the shared vgen.SHOTS source. One h3 + one seedance-2.0 take per submit; 16-frame review sheets.

    .venv/bin/python tools/vgen_rev2_toast.py submit K_7.E1b K_7.E1c [--model=h3|sd|both]
    .venv/bin/python tools/vgen_rev2_toast.py collect | sheets | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
KEYS = ('K_7.E1b', 'K_7.E1c')
NOTE = 'rev2_toast Oct8 hands'
TAIL = (' Camera locked. Nothing is ever frozen: the motion is already under way at the very first frame and continues '
        'without a pause to the last frame. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
PROMPTS = {
    'K_7.E1b': (
        "Inside a dark observation dome, lit by a soft cool light from the front. The woman at the centre is already "
        "moving at the first frame: she keeps lifting the small cup in her raised left hand a little higher, slowly. "
        "That hand's grip never changes: its four fingers stay wrapped across the front of the cup with the fingertips "
        "pointing toward her own face, the thumb stays hidden behind the cup, the hand never turns round, never opens "
        "and never lets go, and the cup stays upright. Her other hand, loosely curled, comes up to her face and with "
        "the knuckle of her index finger she gently wipes the tear from under her eye, then the hand sinks back to her "
        "collar; she blinks, breathes in, her smile slowly widens and her head tips up a little; her eyes stay fixed on "
        "the same far point up and to the right. The man beside her gives her shoulder a small squeeze with the hand "
        "resting on it, breathes, and his head lifts slightly as he smiles, looking up at the same point. At the right "
        "edge another person's hand keeps raising its cup a little, its grip unchanged. The cool light on their faces "
        "shifts very slightly. Faces keep exactly their features, age and skin tone; mouths stay closed or softly "
        "smiling, nobody speaks; each person has two arms; every hand keeps five fingers and the same shape; the cups "
        "keep their shape. The dark wall and the curved ribs behind them stay perfectly still."),
    'K_7.E1c': (
        "Seen from behind, between the backs of two seated women's heads, through a window onto a white lunar plain "
        "under a black sky. Each woman holds up a small cup with her inner arm, and we see the BACKS of both hands, "
        "the fingers lying across the near side of each cup. From the very first frame both arms keep lifting, slowly "
        "and steadily: the two cups rise straight up and drift a little apart, until after about three seconds both "
        "cups are held up against the black sky just above the mountain tops, level with each other, with a clear gap "
        "of black sky about two cups wide between them; then the arms hold them there, trembling very slightly. The "
        "hands never turn: the backs of the hands stay toward the camera the whole time, the same four fingers stay "
        "across each cup, no palm ever shows, no hand opens or lets go, the cups never touch each other and never cross "
        "the centre line. Each arm stays attached to its own woman's shoulder at the bottom corner; the short pale "
        "sleeves move with the arms. The cups stay upright and keep their shape and colour (one pale green with fine "
        "crackle, one pale grey-white). The two women's heads tip back a little as they look up at the sky above the "
        "cups; a few strands of hair shift. Exactly two arms, two hands and two cups the whole time; fingers stay "
        "natural, four fingers showing on each hand. The lunar plain, the mountains, the lattice tower and the dark "
        "window sill stay perfectly still; the sky stays empty and black, nothing appears in it."),
}
MODELS = {'h3': 'minimax/h3', 'sd': 'bytedance/seedance-2.0'}


def register(model):
    for key in KEYS:
        vgen.SHOTS[key] = dict(model=MODELS[model], image=f'media/keyframes/{key}.png', duration=5, prompt=PROMPTS[key] + TAIL)


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
        for m in (('h3', 'sd') if which == 'both' else (which,)):
            register(m)
            for key in args:
                assert key in KEYS
                print(key, m, vgen.submit(key, res='720p' if m == 'sd' else '768P', n=1, dry='dry-run' in opts, note=f'{NOTE} ({m})'))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        register('h3'); print('pending:', vgen.collect(list(KEYS)))
    elif cmd == 'sheets':
        sheets(args or None)
    elif cmd == 'spend':
        print(vgen.spend_total())
