#!/usr/bin/env python3
"""Oct 8 (rev3_hands): takes for the third revision round's hand shots. Does not change the shared vgen.SHOTS source.

  J_7.D2       Jade's single fingertip on her daughter's hand on the screen (7.D2, 7.D3 right, 7.D3c). The keyframe is the
               TOUCH pose (painted from the 3D blockout); the take starts there, rests, then she draws the hand back.
               The film plays it BACKWARDS (rate -1), so the finger travels in and arrives on the painted pose.
  K_3.5_front  the envelope is handed to her (Kenton's hand), she holds it, begins to turn it over (3.5a)
  K_3.5_back   the back arrives, her thumb lifts the flap (3.5b)
  K_3.5_letter the folded letter comes out and begins to open (3.5c); optional last frame K_3.5_letter_end

    .venv/bin/python tools/vgen_rev3_hands.py submit KEY [--model=sd|h3] [--dur=5] [--dry-run]
    .venv/bin/python tools/vgen_rev3_hands.py collect | sheets [KEY/take_N ...] | spend
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
NOTE = 'rev3_hands Oct8'
TAIL = (' Camera locked: no zoom, no pan, no cut. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
SPECS = {
    'J_7.D2': dict(image='media/keyframes/jade/J_7.D2.png', avatar=True, prompt=(
        "A drawing in fine gold line on deep indigo. A woman in profile, in glasses, touches a screen with the tip of "
        "her right index finger: her fingertip rests on the small raised hand of the little girl shown on the screen. "
        "For the first second and a half the fingertip stays on that spot, pressing very lightly, with a tiny human "
        "tremor; she breathes, her shoulders rise and fall a little, she blinks once slowly, a few strands of her hair "
        "stir, and the warm light of the screen flickers softly on her hand and face. Then, slowly and reluctantly, "
        "she draws her hand back: the fingertip leaves the screen and the hand sinks down and back toward her, about "
        "one hand's length by the end of the clip, the elbow bending a little more and sinking, the forearm staying "
        "the same length. The index finger stays extended and the other three fingers stay loosely curled with the "
        "thumb resting beside them the whole time: the hand never opens, never turns, never changes shape or size; "
        "one arm, one hand, five fingers. Her head stays in profile, her eyes on the little girl; her face, glasses "
        "and hair keep exactly their drawn lines. On the screen the little girl sways very gently on her wires and "
        "her ribbons ripple, but her small raised hand stays exactly where it is; the paper moon and the audience "
        "stay still. The cabin wall lines stay perfectly still.")),
    'K_3.5_front': dict(image='media/keyframes/K_3.5_front.jpg', prompt=(
        "Top-down on a walnut desk in warm lamplight: a man hands a woman a blank cream envelope. The motion is "
        "already under way in the very first frame and never pauses. During the first second the man's larger hand "
        "(navy fleece cuff, at the right) lets go of the envelope's right end and slides away to the right, out of "
        "the picture, and does not come back; at the same time the woman's right hand (cream knit cuff) takes hold of "
        "the envelope at its lower right corner and settles it flat on the desk in front of her. The envelope stays "
        "flat, square and in the same place, its face completely blank cream paper: no writing or marks ever appear on "
        "it. Without a pause her left hand leaves the painted toy globe at the left and comes across to the "
        "envelope's left end. By about two seconds into the clip she begins to turn the envelope over sideways, the "
        "way one turns the page of a book: her left hand slips its fingertips under the left short end and lifts that "
        "end up off the desk and over toward the right, while her right hand steadies the right end, so that seen "
        "from above the envelope grows narrower as it stands on edge, and then its plain back, with a pointed flap, "
        "comes down facing up; she lays it flat. An easy, unhurried, natural movement of real hands handling real "
        "paper: the paper bends a little, it has weight, fingers grip its edges. After the man's hand has left there "
        "are exactly two hands, both the woman's, with five fingers each; no third hand ever appears. The toy globe "
        "and the lamp stay still.")),
    'K_3.5_back': dict(image='media/keyframes/K_3.5_back.jpg', prompt=(
        "Top-down on a walnut desk in warm lamplight: a woman has just turned an envelope over and now opens it. The "
        "motion is already under way in the very first frame and never pauses. Her right hand lowers the envelope's "
        "right end the last two centimetres onto the desk and lets go; her left hand keeps the envelope steady by its "
        "lower left corner. Straight away her right hand moves to the point of the triangular flap: the thumb slips "
        "under the point and lifts it, and she folds the unsealed flap open, up and away from her, in one easy "
        "movement, until it lies flat on the desk above the envelope, showing the inside of the flap and the dark "
        "opening of the envelope, with the top edge of a folded sheet of white letter paper just visible inside. "
        "Then her thumb and forefinger take that folded sheet by its top edge. Unhurried, natural movement of real "
        "hands with real paper; the flap has a crease and a little spring. The paper stays plain: no writing, no "
        "seal, no marks ever appear on the envelope. Exactly two hands, the woman's, five fingers each. The toy globe "
        "and the lamp stay still.")),
    'K_3.5_letter': dict(image='media/keyframes/K_3.5_letter.jpg', last='media/keyframes/K_3.5_letter_end.jpg', prompt=(
        "Top-down on a walnut desk in warm lamplight: a woman takes a letter out of an opened envelope. The motion is "
        "already under way in the very first frame and never pauses. In one smooth, unhurried pull her right hand "
        "draws the folded white letter (a sheet folded in three) the rest of the way out of the envelope, up over the "
        "open flap, and brings it back toward her so that she holds it just above the envelope. As it comes free the "
        "top third of the folded letter swings open, up and away from her like a lid, and we see that the inside of "
        "the sheet is printed: rows of fine grey lines of small type and a tiny round emblem in the top right corner, "
        "too small to read; the bottom third of the letter stays folded. Her left hand stays on the lower left corner "
        "of the envelope, holding it down; the envelope and its open flap stay where they are. Real paper: the folds "
        "are crisp, the panel has a little spring, the sheet bends slightly in her fingers. The printed lines stay "
        "fine, even and steady on the paper and never turn into readable words. Exactly two hands, the woman's, five "
        "fingers each. The toy globe at the left edge stays still.")),
}
MODELS = {'h3': 'minimax/h3', 'sd': 'bytedance/seedance-2.0'}


def register(key, model, dur):
    s = SPECS[key]
    vgen.SHOTS[key] = dict(model=MODELS[model], image=s['image'], duration=dur, prompt=s['prompt'] + TAIL,
                           **({'avatar': True} if s.get('avatar') else {}))


def submit(key, model, dur, dry):
    register(key, model, dur)
    s = SPECS[key]
    if not s.get('last') or model != 'sd':
        return vgen.submit(key, res='720p' if model == 'sd' else '768P', n=1, dry=dry, note=f'{NOTE} ({model})')
    # first + last frame (seedance-2.0): vgen.build_spec has no last-frame field, so patch the spec it builds
    orig = vgen.build_spec

    def patched(shot, res, note='', over=None):
        spec = orig(shot, res, note, over)
        spec['input']['last_frame_image'] = 'file:' + vgen.os.path.relpath(vgen.gen.ref_image(str(ROOT / s['last'])), ROOT)
        return spec
    vgen.build_spec = patched
    try:
        jobs = vgen.submit(key, res='720p', n=1, dry=dry, note=f'{NOTE} (sd, last frame {s["last"]})')
    finally:
        vgen.build_spec = orig
    return jobs


def sheets(only=None):
    import av
    import numpy as np
    from PIL import Image, ImageDraw, ImageOps
    for key in SPECS:
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
            assert key in SPECS, key
            print(key, submit(key, opts.get('model', 'sd'), int(opts.get('dur', 5)), 'dry-run' in opts))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        for key in SPECS:
            register(key, 'sd', 5)
        print('pending:', vgen.collect(list(SPECS)))
    elif cmd == 'sheets':
        sheets(args or None)
    elif cmd == 'spend':
        print(vgen.spend_total())
