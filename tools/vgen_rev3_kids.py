#!/usr/bin/env python3
"""Oct 8 (rev3 KIDS): new takes after the keyframes were repainted to T's v3 sheet (fuller cheeks) and, in the
Copernican lesson, to the real-coastline globe with the Moon's shadow on central Anatolia.
Does not change the shared vgen.SHOTS source. 16-frame review sheets and consecutive-frame strips.

    .venv/bin/python tools/vgen_rev3_kids.py submit K_4.3b [K_3.4_beam ...] [--takes=2] [--dry-run]
    .venv/bin/python tools/vgen_rev3_kids.py collect | sheets [K_4.3b/take_5 ...] | strip K_4.3b/take_5 F0 F1 x0,y0,x1,y1 | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
NOTE = 'rev3_kids Oct8'
TAIL = (' The children keep their size, faces and clothes; natural, child-like, physically plausible motion. Camera '
        'locked: no pan, no tilt, no zoom. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
CHEEKS = ('The boy keeps exactly the face of the first frame: a large round head and full, round, plump cheeks, the '
          'lower half of his face as wide as his forehead, a short soft chin; his cheeks never thin out and his jaw '
          'never becomes narrow or pointed. ')
JOBS = {
    # 4.3b (1:23): the splash park. Same action as take_2 (the keeper in v5), from the repainted keyframe.
    'K_4.3b': dict(model='bytedance/seedance-2.0', res='720p', duration=5, image='media/keyframes/K_4.3b.jpg', prompt=(
        "Summer at a splash park, everything already in motion in the very first frame and moving without a pause to "
        "the last: the little girl in pink runs and leaps through the arcs of water with her arms flung wide, lands "
        "with a small splash and jumps again, laughing, her braid and ponytail bouncing; the boy stands in the spray "
        "beside her, laughing with his mouth open, shoulders hunched with delight, and lifts both open hands as the "
        "water hits him, bouncing a little on his feet; he stays turned three-quarters toward the girl. " + CHEEKS +
        "The water jets pulse up and down in rhythm; dappled sunlight moves over the wet ground; droplets sparkle and "
        "fall naturally. The father on the far bench shifts a little. Each child keeps exactly two arms and two legs; "
        "nothing appears or disappears." + TAIL)),
    # 3.4c (0:57): along the beam. The Moon is held nearly still so its shadow stays on the same place of the globe
    # (central Anatolia in the painting); the boy looks at it, then turns and grins at his sister.
    'K_3.4_beam': dict(model='minimax/h3', res='2K', duration=5, image='media/keyframes/K_3.4_beam.jpg', prompt=(
        "A science lesson at home at night, close on a boy holding a painted toy globe of the Earth. The motion is "
        "already under way in the very first frame and continues smoothly to the last frame; nobody and nothing "
        "freezes. The little girl in the foreground, seen from behind, holds the small grey moon ball out in front of "
        "the globe with both hands and keeps it almost perfectly still, with only the tiny wobble of a small child's "
        "outstretched arms; her ponytail bobs a little. The dark round shadow of the moon ball therefore stays on "
        "exactly the same place on the globe the whole time: it does not slide, grow, shrink or fade. The boy holds "
        "the globe steady against his chest: the globe does not turn, roll or tilt, and the painted map on it (the "
        "green and ochre land, the blue seas, every coastline) stays exactly as it is, fixed to the ball, never "
        "morphing or drifting. The boy looks down at the dark spot on the globe for a moment with a small smile, "
        "breathing, his fingers shifting slightly on the globe; then he lifts his eyes and turns his head a little "
        "down to the left to look at his little sister and breaks into a big delighted grin, eyes bright, cheeks "
        "lifting. " + CHEEKS + "Warm flashlight from behind the camera; the boy's shadow on the wall moves with him. "
        "The flashlight is the only light: the shadows stay dark, flat and soft-edged; nothing glows, no new light, "
        "no halo, no ring." + TAIL)),
    # 7.C1 (2:38, sweep): the call home, the Earth half. Same action as take_4, from the keyframe with T's v3 cheeks.
    'K_7.C1_earth': dict(model='bytedance/seedance-2.0', res='720p', duration=4, image='media/keyframes/K_7.C1_earth.jpg', prompt=(
        "At the kitchen counter on a video call, everything already in motion in the very first frame and moving "
        "without a pause to the last: the little girl kneeling on the stool talks animatedly to the laptop screen, "
        "waving her hands as she talks, her braid swinging; the boy standing behind her laughs with his mouth open, "
        "shoulders shaking, and leans in over her shoulder toward the screen, his eyes on the screen. " + CHEEKS +
        "Leaves stir outside the big window. Each child keeps exactly two arms; nothing appears or disappears. The "
        "kitchen, the counter, the laptop and the window frames stay rigid and fixed." + TAIL)),
}


def register(key):
    j = JOBS[key]
    vgen.SHOTS[key] = dict(model=j['model'], image=j['image'], duration=j['duration'], prompt=j['prompt'])


def _frames(side):
    import av
    with av.open(str(ROOT / side['file'])) as c:
        return [f.to_image() for f in c.decode(video=0)]


def sheets(only=None):
    import numpy as np
    from PIL import Image, ImageDraw, ImageOps
    for key in JOBS:
        for _, p in vgen.takes(key):
            side = json.loads(Path(p).read_text())
            if NOTE not in side.get('notes', '') or side.get('state') != 'done':
                continue
            if only and f"{key}/take_{side['take']}" not in only:
                continue
            frames = _frames(side)
            idx = np.linspace(0, len(frames) - 1, 16).round().astype(int)
            sheet = Image.new('RGB', (1920, 4 * 290 + 30), '#171b25')
            d = ImageDraw.Draw(sheet); d.text((8, 8), f"{key} take_{side['take']} {side['model']} | 16 frames | inspect BEFORE roto", fill='white')
            for j, i in enumerate(idx):
                tile = ImageOps.fit(frames[i], (480, 270))
                x = (j % 4) * 480; y = 30 + (j // 4) * 290
                sheet.paste(tile, (x, y)); d.text((x + 5, y + 272), f'{i / 24:.3f}s / f{i}', fill='white')
            out = ROOT / side['file'].replace('.mp4', '_sheet16.jpg'); sheet.save(out, quality=92)
            side['review_sheet16'] = str(out.relative_to(ROOT))
            Path(p).write_text(json.dumps(side, indent=1, ensure_ascii=False) + '\n')
            print(out.relative_to(ROOT))


def strip(clip, f0, f1, box, out=None, cols=12, scale=1.0):
    """Every frame f0..f1 of a take, cropped to box (fractions of the frame), in rows: motion as motion."""
    from PIL import Image, ImageDraw
    key, take = clip.split('/')
    side = json.loads((ROOT / 'media/gen' / key / f'{take}.json').read_text())
    frames = _frames(side)
    W, H = frames[0].size
    x0, y0, x1, y1 = box
    bx = (int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))
    w, h = int((bx[2] - bx[0]) * scale), int((bx[3] - bx[1]) * scale)
    idx = list(range(f0, min(f1, len(frames) - 1) + 1))
    rows = (len(idx) + cols - 1) // cols
    o = Image.new('RGB', (cols * w, rows * h), '#171b25'); d = ImageDraw.Draw(o)
    for k, i in enumerate(idx):
        o.paste(frames[i].crop(bx).resize((w, h)), ((k % cols) * w, (k // cols) * h)); d.text(((k % cols) * w + 3, (k // cols) * h + 2), str(i), fill='yellow')
    out = out or str(ROOT / 'media/gen' / key / f'{take}_strip_{f0}_{f1}.jpg')
    o.save(out, quality=90); print(out)


if __name__ == '__main__':
    cmd = sys.argv[1]
    args = [a for a in sys.argv[2:] if not a.startswith('--')]
    opts = {a[2:].partition('=')[0]: a[2:].partition('=')[2] or True for a in sys.argv[2:] if a.startswith('--')}
    if cmd == 'submit':
        for key in args:
            register(key); j = JOBS[key]
            print(key, vgen.submit(key, res=j['res'], n=int(opts.get('takes', 2)), dry='dry-run' in opts, note=NOTE))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        for key in JOBS:
            register(key)
        print('pending:', vgen.collect(list(JOBS)))
    elif cmd == 'sheets':
        sheets(args or None)
    elif cmd == 'strip':
        strip(args[0], int(args[1]), int(args[2]), [float(v) for v in args[3].split(',')], scale=float(opts.get('scale', 1)))
    elif cmd == 'spend':
        print(vgen.spend_total())
