#!/usr/bin/env python3
"""Oct 8 (rev3_base): takes for the third revision round's two station-work shots. Does not change vgen.SHOTS' source.

  K_7.B2  Jade's gloves open the small brass isolation valve: ONE slow continuous turn, counter-clockwise (the way a
          handwheel valve opens), in slow motion so the film can play it at rate 1. The gauge's needle is NOT in the take:
          it is painted out of the keyframe (media/keyframes/work/rev3_base/b2_needle_out.py) and drawn by the renderer
          (render/src/scenes/gauge.js), so its tremble and its lagged rise are exact.
  K_7.B3  Lúcia at the glovebox: her right arm is in the right port; the gauntlet slides the scale card, and her
          shoulder and torso move with the reach in the same beat.

    .venv/bin/python tools/vgen_rev3_base.py submit KEY [--model=sd|h3] [--dur=5] [--dry-run] [--variant=name]
    .venv/bin/python tools/vgen_rev3_base.py collect | sheets [KEY/take_N ...] | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
NOTE = 'rev3_base Oct8'
TAIL = (' Camera locked: no zoom, no pan, no cut. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
B2 = (
    "First-person view, a painting in fine gold line on deep indigo: two white spacesuit gloves hold a small brass "
    "four-spoke handwheel on a thin oxygen line, under a round brass pressure gauge; a closed foil-wrapped reactor "
    "drum stands beyond. Extreme slow motion. She is opening the valve: ONE slow, steady, continuous turn of the wheel "
    "to the LEFT, counter-clockwise as we look at it, already under way in the very first frame and still going at "
    "the same slow speed in the last frame. The LEFT glove travels slowly DOWN with the rim and the RIGHT glove "
    "travels slowly UP with the rim; both wrists roll and both forearms follow, the left forearm sinking a little, "
    "the right forearm rising a little. The four brass spokes rotate with the hands, from an upright cross toward a "
    "diagonal X: about a quarter of a turn over the whole clip, never faster. The hands never turn back, never rock "
    "back and forth, never pause, never let go and never slide along the rim: the fingers stay wrapped round the same "
    "two points of the rim and ride with it, a firm two-handed grip for a stiff valve. The wheel is a rigid brass "
    "ring: it keeps its small size and its round shape and stays centred on its hub nut. The cream tag hanging under "
    "the wheel sways very slightly. The gauge above the wheel has a blank cream dial with NO needle: the dial stays "
    "blank, and the gauge does not move. Everything else is still: the pipes, the four bottles, the reactor drum, the "
    "tray; the orange ingot in the tray only dims a very little. Exactly two gloves and two forearms, white with "
    "pale-blue trim, five fingers each; no third hand. No steam, no sparks, no flame.")
SPECS = {
    'K_7.B2': dict(image='media/keyframes/work/rev3_base/K_7.B2_video_source.png', prompt=B2),
}
SPECS_PATH = ROOT / 'media/keyframes/work/rev3_base/vgen_specs.json'   # extra specs written as the round goes on
if SPECS_PATH.exists():
    SPECS.update(json.loads(SPECS_PATH.read_text()))
MODELS = {'h3': 'minimax/h3', 'sd': 'bytedance/seedance-2.0'}


def register(key, model, dur, variant=None):
    s = SPECS[variant or key]
    vgen.SHOTS[key] = dict(model=MODELS[model], image=s['image'], duration=dur, prompt=s['prompt'] + TAIL,
                           **({'avatar': True} if s.get('avatar') else {}))


def submit(key, model, dur, dry, variant=None):
    register(key, model, dur, variant)
    s = SPECS[variant or key]
    note = f'{NOTE} ({model}{", " + variant if variant else ""})'
    if not s.get('last') or model != 'sd':
        return vgen.submit(key, res='720p' if model == 'sd' else '768P', n=1, dry=dry, note=note)
    orig = vgen.build_spec   # first + last frame (seedance-2.0): vgen.build_spec has no last-frame field

    def patched(shot, res, note='', over=None):
        spec = orig(shot, res, note, over)
        spec['input']['last_frame_image'] = 'file:' + vgen.os.path.relpath(vgen.gen.ref_image(str(ROOT / s['last'])), ROOT)
        return spec
    vgen.build_spec = patched
    try:
        return vgen.submit(key, res='720p', n=1, dry=dry, note=note + f' last frame {s["last"]}')
    finally:
        vgen.build_spec = orig


KEYS = ('K_7.B2', 'K_7.B3')


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
        for key in args:
            assert key in KEYS, key
            print(key, submit(key, opts.get('model', 'sd'), int(opts.get('dur', 5)), 'dry-run' in opts, opts.get('variant')))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        for key in KEYS:
            if key in SPECS:
                register(key, 'sd', 5)
        # only this round's takes: vgen.collect touches every queued take of the shot, which is what we want, and
        # leaves finished ones alone
        print('pending:', vgen.collect([k for k in KEYS if k in SPECS]))
    elif cmd == 'sheets':
        sheets(args or None)
    elif cmd == 'spend':
        print(vgen.spend_total())
