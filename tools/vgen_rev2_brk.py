#!/usr/bin/env python3
"""rev2_brk (Oct 8): video bases for the breakdown crew shots 6.2c / 6.2d. Does not edit the shared vgen.SHOTS source.

Each keyframe is the END pose (the person already looking at the Earth, hand on the work). The take starts from it and
goes BACK to the work; tools/roto_prep_rubbing.py --reverse plays it into the painted pose. The first frame given to the
model carries the Earth where the engine draws it (media/gen/<KEY>/ff_with_earth.jpg), so the model knows what the
person is looking at; those sky pixels never reach the film (--static).

    .venv/bin/python tools/vgen_rev2_brk.py submit K_6.2c      # one h3 2K + one Seedance 2.0 720p take
    .venv/bin/python tools/vgen_rev2_brk.py collect            # collect + 16-frame sheets
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
MOON = ("The airless Moon in one-sixth gravity: slow, floaty, heavy-suited motion. Black sky. No dust, no haze. The "
        "ground, the horizon, the shadows on the ground and the small blue Earth in the sky are absolutely rigid and "
        "fixed; the Earth does not move, turn, grow or change. Nothing appears or disappears; no extra limbs, hands or "
        "objects. Camera locked, perfectly still. ")
TAIL = MOON + vgen.KEEP_STYLE + " " + vgen.NO_TEXT
PROMPTS = {
    "K_6.2c": ("The kneeling astronaut is already moving in the very first frame: she slowly lowers her lifted helmet from "
               "the small blue Earth in the sky back down to the cable connector in her gloves; her shoulders and upper body "
               "lean forward over the low junction box, and both gloves carry the thick cable connector steadily forward and "
               "down toward the round socket on top of the box, stopping just above it. The motion is slow and continuous to "
               "the last frame; she never freezes. Exactly two arms and two gloves, always holding the connector and the "
               "cable; the thick black cable flexes a little behind her hands. Her knees and boots stay planted. The junction "
               "box does not move. "),
    # (takes 1-2 used a prompt that let her walk on: reversed, that is a backward walk. Boots planted from take 3.)
    "K_6.2d": ("The astronaut has stopped in mid-stride and stays where she stands, holding the white container in both arms. "
               "She is already moving in the very first frame: she slowly lowers her lifted helmet from the small blue Earth "
               "in the sky down toward the box in her arms, her shoulders round forward a little, and she hitches the box "
               "slightly higher against her chest with both arms; her weight settles gently and she breathes. The motion is "
               "slow and continuous to the last frame; she never freezes. BOTH BOOTS STAY PLANTED exactly where they are for "
               "the whole clip: she does not step, does not walk, does not turn round and does not move across the frame. "
               "Exactly two arms and two gloves, always on the box; two legs. The lander leg and ladder behind her are rigid "
               "and do not move. "),
}
for key, p in PROMPTS.items():
    vgen.SHOTS[key] = dict(model="minimax/h3", image=f"media/gen/{key}/ff_with_earth.jpg", duration=5, prompt=p + TAIL)


def sheets(keys):
    import av
    import numpy as np
    from PIL import Image, ImageDraw, ImageOps
    for key in keys:
        for _, p in vgen.takes(key):
            side = json.loads(Path(p).read_text())
            if side.get("state") != "done" or side.get("review_sheet16"):
                continue
            with av.open(str(ROOT / side["file"])) as c:
                frames = [(float(f.time), f.to_image()) for f in c.decode(video=0)]
            idx = np.linspace(0, len(frames) - 1, 16).round().astype(int)
            sheet = Image.new("RGB", (1920, 4 * 290 + 30), "#171b25")
            d = ImageDraw.Draw(sheet); d.text((8, 8), f"{key} take_{side['take']} {side['model']} | 16 frames | inspect BEFORE roto", fill="white")
            for j, i in enumerate(idx):
                t, im = frames[i]; tile = ImageOps.fit(im, (480, 270))
                x = (j % 4) * 480; y = 30 + (j // 4) * 290
                sheet.paste(tile, (x, y)); d.text((x + 5, y + 272), f"{t:.3f}s / f{i}", fill="white")
            out = ROOT / side["file"].replace(".mp4", "_sheet16.jpg"); sheet.save(out, quality=92)
            side["review_sheet16"] = str(out.relative_to(ROOT))
            Path(p).write_text(json.dumps(side, indent=1, ensure_ascii=False) + "\n")
            print(out.relative_to(ROOT))


if __name__ == "__main__":
    cmd, keys = sys.argv[1], [k for k in sys.argv[2:] if k in PROMPTS] or list(PROMPTS)
    if cmd == "submit":
        for key in keys:
            note = "rev2_brk Oct8: END pose first frame, reversed in prep"
            print(vgen.submit(key, res="2K", n=1, note=note))
            print(vgen.submit(key, res="720p", n=1, note=note, over={"model": "bytedance/seedance-2.0", "duration": 5}))
    elif cmd == "dry":
        for key in keys:
            print(vgen.submit(key, res="2K", n=1, dry=True)); print(vgen.submit(key, res="720p", n=1, dry=True, over={"model": "bytedance/seedance-2.0", "duration": 5}))
    elif cmd == "collect":
        print("pending:", vgen.collect(keys)); sheets(keys)
    elif cmd == "spend":
        print(vgen.spend_total())
