#!/usr/bin/env python3
"""Oct 8 (rev3 HOME): takes for the reunion (8.2: Kenton keeps moving; 8.2b: its own close painting of the hug) and
the roof deck (6.1: T's flashlight arm moves through the whole shot). Does not change the shared vgen.SHOTS source.

    .venv/bin/python tools/vgen_rev3_home.py submit JOB [JOB ...] [--dry-run]     (JOB = a key of JOBS; one take each)
    .venv/bin/python tools/vgen_rev3_home.py collect | sheets [K_8.2a/take_6 ...] | strip K_8.2a/take_6 F0 F1 x0,y0,x1,y1 [--scale=1] | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
NOTE = 'rev3_home Oct8'
TAIL = (' Keep every body separate: each person has exactly two arms and two hands; no merging arms, no extra limbs, '
        'no extra people; nothing appears or disappears. Faces, hair, clothes and sizes stay exactly as in the first '
        'frame. Camera fixed: no pan, no tilt, no zoom, no cuts. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
HUG = ("A family homecoming painted on silk. Everything is already in motion in the very first frame and nothing ever "
       "pauses. The girl in pink is already running toward her crouching mother, her feet alternating real floor "
       "contacts; within the first second she reaches her and wraps both arms around her mother's neck. The mother is "
       "seen from behind the whole time, her face never visible, her straight black hair ending at mid-back; she "
       "closes her two arms around the girl and rocks back a little with the impact without falling. The boy in blue "
       "runs two more steps, slows by bending his knees, kneels at the mother's left side and puts his arms around "
       "both of them, his round face against his sister's; he does not run in place. ")
R61 = ("A painted family of three on a roof deck under a starry sky at night, seen from behind. Everything is already "
       "moving in the very first frame and keeps moving, slowly and smoothly, to the very last frame; nobody freezes. ")
R61B = ("At the same time the kneeling figure in the middle, seen from behind, slowly lowers the small figure he is holding "
        "up by about a hand's width, his arms and shoulders giving a little, and she lets her raised arm sink a little, "
        "the small dark ball still in her hand; their heads lower slightly and her hair sways. The flashlight gives no "
        "light: no beam, no glow, no light appears anywhere, and the small ball stays a dull dark grey. The stars, the "
        "pergola, the railing, the tree and the city lights stay perfectly rigid and fixed. Exactly three figures, one "
        "flashlight, one small ball; each figure has exactly two arms and two hands; nothing else appears. Camera "
        "locked, perfectly still: no pan, no tilt, no zoom. " + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
JOBS = {
    # 8.2 (3:13): the father walks in from the doorway and kneels at the near edge of the hug, hand on the boy's back
    '82_kneel': dict(shot='K_8.2a', model='minimax/h3', res='768P', duration=6, image='media/keyframes/K_8.2a.jpg', prompt=(
        HUG + "THE FATHER: at frame zero he is already lowering his hand from his mouth and stepping out of the "
        "doorway. He walks steadily across the wooden floor toward the family with a calm natural stride, each "
        "sock-foot really planting on the floor, and comes round to the near side of the kneeling boy, turning his "
        "back toward the viewer as he arrives; then he goes down on one knee just behind the boy at the left edge of "
        "the embrace and lays one large open hand gently on the boy's back. The walk takes about three seconds; he "
        "keeps moving the whole time and never stands still. Once he has knelt his hand stays resting on the boy's "
        "back and his shoulders move with his breathing. To the last frame the embrace sways gently and all four "
        "keep small natural movements of heads, shoulders and hands; nobody freezes. The bag and the shoes by the "
        "door and all furniture stay fixed." + TAIL)),
    # 8.2, second order: take_6 (82_kneel) did everything asked but drew his hair as a short crop from behind; the
    # next shot (8.3) shows shoulder-length curls and the knot. Same action, hair spelled out, the walk a little quicker.
    '82_kneel_hair': dict(shot='K_8.2a', model='minimax/h3', res='768P', duration=6, image='media/keyframes/K_8.2a.jpg', prompt=(
        HUG + "THE FATHER has thick curly dark-blond hair that falls to just above his shoulders, the top half tied "
        "back in a small loose knot at the back of his crown: whenever he is seen from behind we see the knot and a "
        "mass of loose curls covering his neck down to his collar; his hair never becomes short. At frame zero he is "
        "already lowering his hand from his mouth and stepping out of the doorway. He walks steadily across the "
        "wooden floor toward the family with a calm natural stride, each sock-foot really planting on the floor, and "
        "comes round to the near side of the kneeling boy, turning his back toward the viewer as he arrives; then he "
        "goes down on one knee just behind the boy at the left edge of the embrace and lays one large open hand "
        "gently on the boy's back. The walk takes about two seconds; he keeps moving the whole time and never stands "
        "still. Once he has knelt his hand stays resting on the boy's back and his shoulders move with his "
        "breathing; we see only the back of his head. To the last frame the embrace sways gently and all four keep "
        "small natural movements of heads, shoulders and hands; nobody freezes. The bag and the shoes by the door "
        "and all furniture stay fixed." + TAIL)),
    # 8.2 alternative: he stays standing, arrives behind the boy and bends to rest his hand on the boy's shoulder
    '82_stand': dict(shot='K_8.2a', model='minimax/h3', res='768P', duration=6, image='media/keyframes/K_8.2a.jpg', prompt=(
        HUG + "THE FATHER: at frame zero he is already lowering his hand from his mouth and stepping out of the "
        "doorway. He walks steadily across the wooden floor toward the family with a calm natural stride, each "
        "sock-foot really planting on the floor; the walk takes about three seconds and he never stands still. He "
        "arrives beside the kneeling boy at the left of the embrace, turned three-quarters away from the viewer and "
        "looking down at them, bends a little at the waist and rests one large open hand on the boy's near shoulder; "
        "the hand stays there, his thumb moving a little, his shoulders moving with his breathing. To the last frame "
        "the embrace sways gently and all four keep small natural movements of heads, shoulders and hands; nobody "
        "freezes. The bag and the shoes by the door and all furniture stay fixed." + TAIL)),
    # 8.2b (3:13): the close painting of the hug (K_8.2b_close.jpg = take_9's frame at the cut, restored): small living motion
    '82b_close': dict(shot='K_8.2b_close', model='minimax/h3', res='768P', duration=4, image='media/keyframes/K_8.2b_close.jpg', prompt=(
        "A close view of a family embrace at home at night, painted on silk. The motion is already under way in the "
        "very first frame and never stops; nobody freezes. The embrace tightens in one slow, loving squeeze. The "
        "little girl hugs her mother's neck tighter, her two small hands pressing into her mother's black hair and "
        "her shoulders lifting, and she nuzzles her cheek against her brother's with a small happy wriggle. The boy "
        "presses his cheek closer to hers and his fingers curl and tighten on his mother's cream sweater. The mother "
        "is seen only from behind, her face never visible: she rocks the two of them very slightly from side to side "
        "and tilts her head toward them, her long black hair swaying a little. At the left edge the father's large "
        "hand slowly rubs the boy's back, moving a few centimetres up and back, and the curls at the top left stir. "
        "Everyone breathes. The boy's and the girl's eyes stay closed and smiling; their faces keep exactly the "
        "simple painted features and round cheeks of the first frame. Every hand keeps its five fingers and stays "
        "on its own arm; no new hand, arm or person appears and nothing merges. The sofa, the windows and the teapot "
        "stay fixed. Camera fixed: no pan, no tilt, no zoom, no cuts. " + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)),
    # 6.1 (1:52): generated FROM the held end pose with the flashlight off, played REVERSED; the beam and the lit Moon
    # are drawn afterwards by tools/beam_61.py on the tracked hand. No word for a child in the prompt (moderation).
    '61_arc': dict(shot='K_6.1', model='minimax/h3', res='768P', duration=5, image='media/keyframes/K_6.1_dark.jpg', prompt=(
        R61 + "The figure on the left holds a small switched-off flashlight up in his raised right hand. From the "
        "very first frame he swings that arm in ONE slow continuous arc: first over to the left across the sky above "
        "the tree, then down, taking the whole clip to do it, until at the end the flashlight is low at his side "
        "pointing at the deck floor. His whole body follows the arm: his head and shoulders turn to the left with it, "
        "his weight shifts onto his left foot and he sinks from his toes back onto his heels. He never stops and "
        "never jerks. " + R61B)),
    '61_down': dict(shot='K_6.1', model='minimax/h3', res='768P', duration=5, image='media/keyframes/K_6.1_dark.jpg', prompt=(
        R61 + "The figure on the left holds a small switched-off flashlight up in his raised right hand. From the "
        "very first frame he lowers that arm in ONE slow continuous movement, the flashlight tracing a smooth arc "
        "down through the air in front of him, taking the whole clip to do it, until at the end his arm hangs "
        "relaxed and the flashlight points at the deck floor by his feet. His whole body follows the arm: his head "
        "tips down to watch the flashlight, his shoulders drop and turn a little, and he sinks from his toes back "
        "onto his heels. He never stops and never jerks. " + R61B)),
}


def register(job):
    j = JOBS[job]
    vgen.SHOTS[j['shot']] = dict(model=j['model'], image=j['image'], duration=j['duration'], prompt=j['prompt'])
    return j


def _frames(side):
    import av
    with av.open(str(ROOT / side['file'])) as c:
        return [f.to_image() for f in c.decode(video=0)]


def _side(clip):
    key, take = clip.split('/')
    return ROOT / 'media/gen' / key / f'{take}.json'


def sheets(clips):
    import numpy as np
    from PIL import Image, ImageDraw, ImageOps
    for clip in clips:
        p = _side(clip); side = json.loads(p.read_text())
        frames = _frames(side)
        idx = np.linspace(0, len(frames) - 1, 16).round().astype(int)
        sheet = Image.new('RGB', (1920, 4 * 290 + 30), '#171b25')
        d = ImageDraw.Draw(sheet); d.text((8, 8), f"{clip} {side['model']} | {len(frames)} frames | 16 shown | inspect BEFORE roto", fill='white')
        for j, i in enumerate(idx):
            x = (j % 4) * 480; y = 30 + (j // 4) * 290
            sheet.paste(ImageOps.fit(frames[i], (480, 270)), (x, y)); d.text((x + 5, y + 272), f'{i / 24:.3f}s / f{i}', fill='white')
        out = ROOT / side['file'].replace('.mp4', '_sheet16.jpg'); sheet.save(out, quality=90)
        side['review_sheet16'] = str(out.relative_to(ROOT)); p.write_text(json.dumps(side, indent=1, ensure_ascii=False) + '\n')
        print(out.relative_to(ROOT))


def strip(clip, f0, f1, box, out=None, cols=12, scale=1.0, step=1):
    """Frames f0..f1 of a take, cropped to box (fractions of the frame), in rows: motion as motion."""
    from PIL import Image, ImageDraw
    key, take = clip.split('/')
    side = json.loads(_side(clip).read_text())
    frames = _frames(side)
    W, H = frames[0].size
    x0, y0, x1, y1 = box
    bx = (int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))
    w, h = int((bx[2] - bx[0]) * scale), int((bx[3] - bx[1]) * scale)
    idx = list(range(f0, min(f1, len(frames) - 1) + 1, step))
    rows = (len(idx) + cols - 1) // cols
    o = Image.new('RGB', (cols * w, rows * h), '#171b25'); d = ImageDraw.Draw(o)
    for k, i in enumerate(idx):
        o.paste(frames[i].crop(bx).resize((w, h)), ((k % cols) * w, (k // cols) * h)); d.text(((k % cols) * w + 3, (k // cols) * h + 2), str(i), fill='yellow')
    out = out or str(ROOT / 'media/gen' / key / f'{take}_strip_{f0}_{f1}.jpg')
    o.save(out, quality=88); print(out)


if __name__ == '__main__':
    cmd = sys.argv[1]
    args = [a for a in sys.argv[2:] if not a.startswith('--')]
    opts = {a[2:].partition('=')[0]: a[2:].partition('=')[2] or True for a in sys.argv[2:] if a.startswith('--')}
    if cmd == 'submit':
        for job in args:
            j = register(job)
            print(job, vgen.submit(j['shot'], res=j['res'], n=1, dry='dry-run' in opts, note=f'{NOTE} {job}'))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        shots = sorted({j['shot'] for j in JOBS.values()})
        for job in JOBS:
            register(job)
        print('pending:', vgen.collect(shots))
    elif cmd == 'sheets':
        sheets(args)
    elif cmd == 'strip':
        strip(args[0], int(args[1]), int(args[2]), tuple(float(x) for x in args[3].split(',')), scale=float(opts.get('scale', 1)), cols=int(opts.get('cols', 12)), step=int(opts.get('step', 1)))
    elif cmd == 'spend':
        print(vgen.spend_total())
