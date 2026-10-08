#!/usr/bin/env python3
"""Revision round (Oct 7 evening), shots 3.4 / 3.5 / 3.8: video-base takes on top of tools/vgen.py (same sidecars,
spend log and cap). Kept in its own file so that tools/vgen.py is not edited by several agents at once.

    .venv/bin/python tools/vgen_rev_s3.py submit SHOT [SHOT ...] [--model=minimax/h3|bytedance/seedance-2.0] [--res=720p]
                                           [--takes=N] [--duration=5] [--dry-run] [--note=...]
    .venv/bin/python tools/vgen_rev_s3.py collect|wait [SHOT ...]
    .venv/bin/python tools/vgen_rev_s3.py sheet SHOT/take_N [n=16]     # 16-frame contact sheet -> media/gen/SHOT/take_N_sheet16.jpg

Rule 1 of the round: every prompt asks for motion that is already under way at frame 0 and never pauses; the section
file then cuts in at offset >= 0.5 s with lock: 0.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vgen  # noqa: E402

kf, _p, KIDS, LOCK, RIGID = vgen.kf, vgen._p, vgen.KIDS, vgen.LOCK, getattr(vgen, "RIGID", "")
H3, SD2 = "minimax/h3", "bytedance/seedance-2.0"
GO = ("The motion is already under way in the very first frame and continues smoothly to the last frame; nobody and "
      "nothing freezes or pauses.")
ONELIGHT = ("The flashlight is the only light: the shadows stay dark, flat and soft-edged and move only because the "
            "things that cast them move; nothing glows, no new light, no halo, no ring.")
GOLDSTYLE = ("Keep the exact art style of the first frame: fine matte gold line and pale washes on deep indigo paper; "
             "it stays a painting, never photographic.")
SUIT = ("The suits stay white with blue panels and blue gloves; the round chest patch stays a plain dark disc with a "
        "pale dot; no red anywhere, no flags, no lettering.")

SHOTS = {
    # ---- 3.4 the Copernican lesson: wide / side view / close along the beam (3D blockout: render/scenes/blockouts/3.4_lesson)
    "K_3.4_lesson": dict(model=SD2, image=kf("K_3.4_lesson.jpg"), duration=4,
                         prompt=_p(f"A science lesson at home at night. {GO} The little girl slowly moves the small moon "
                                   "ball a little higher and to the right through the flashlight beam with both hands; "
                                   "the dark shadow behind the ball and the dark round spot on the globe move with it, "
                                   "the spot gliding across the globe; the boy tilts the globe slightly in his hands and "
                                   "lowers his head to watch the spot; the mother, back to us, holds the flashlight with "
                                   "a tiny natural sway and shifts her weight; the two children's shadows on the wall "
                                   f"move exactly with the children. {ONELIGHT} {KIDS} {LOCK}")),
    "K_3.4_wall": dict(model=SD2, image=kf("K_3.4_wall.jpg"), duration=4,
                       # take_1 (first wording: "moves the ball up and forward") let the ball fly out of her hands
                       prompt=_p(f"A science lesson at home at night, seen from the side. {GO} The little girl holds the "
                                 "small moon ball firmly in both hands the whole time; it never leaves her fingers and "
                                 "stays the same size. With outstretched arms she slowly shifts it a few centimetres up "
                                 "and down in the flashlight beam, rising a little on her toes; the dark shadow shaft "
                                 "behind the ball and the dark round spot on the globe follow the ball exactly, the spot "
                                 "sliding a little across the globe. The boy keeps the globe in both hands, shifts his "
                                 "fingers, lowers his eyes to the dark spot and starts to smile. The hand holding the "
                                 "flashlight at the left sways very slightly. The two children's shadows on the wall move "
                                 f"exactly with the children. {ONELIGHT} {KIDS} {LOCK}")),
    "K_3.4_beam": dict(model=SD2, image=kf("K_3.4_beam.jpg"), duration=5,
                       prompt=_p(f"A science lesson at home at night, close on a boy holding a toy globe. {GO} The "
                                 "little girl's two small hands slide the small moon ball slowly to the right in front "
                                 "of the globe; its dark round shadow slides across the painted globe with it; the boy "
                                 "watches the dark spot move, then turns his head down to the left to look at his "
                                 "little sister and breaks into a big delighted grin, eyes bright; his fingers shift on "
                                 "the globe; the girl's ponytail bobs a little. Warm flashlight from behind the camera; "
                                 f"the boy's shadow on the wall moves with him. {ONELIGHT} {KIDS} {LOCK}")),
    # ---- 3.8 strapping in: six shots in procedural order (docs/research_capsule_interior.md section 7), GOLD paper
    "K_3.8a_glove": dict(model=SD2, image=kf("K_3.8a_glove.jpg"), duration=4,
                         prompt=_p(f"Macro, a pressure-suit glove being locked. {GO} The technician's two bare hands "
                                   "turn the outer metal wrist ring a few degrees and the small latch tab snaps down "
                                   "flat onto the ring; the astronaut's blue-gloved fingers flex closed and open once; "
                                   "the forearm settles on the armrest; the technician's fingers press the tab once and "
                                   f"let go. Only hands and forearm move. {SUIT} {LOCK}")),
    "K_3.8b_walkout": dict(model=SD2, image=kf("K_3.8b_walkout.jpg"), duration=4,
                           prompt=_p(f"Before dawn, four suited astronauts seen from behind walk away from the camera. {GO} "
                                     "They walk steadily in step toward the distant van, boots stepping on the wet "
                                     "concrete with small splashes, the white ventilator boxes swinging a little in "
                                     "their hands; the nearest astronaut waves the raised arm once, slowly, and keeps "
                                     "walking; their reflections ripple on the wet ground. Nobody turns around; no faces. "
                                     f"The rocket, tower and masts in the distance stay perfectly rigid. {SUIT} {LOCK}")),
    "K_3.8c_whiteroom": dict(model=SD2, image=kf("K_3.8c_whiteroom.jpg"), duration=4,
                             prompt=_p(f"Seen through a doorway: an astronaut boards a capsule through its side hatch. {GO} "
                                       "Holding the rail above the hatch with both hands, the astronaut slides feet-first "
                                       "deeper into the capsule, ducking the helmet under the hatch rim; the technician's "
                                       "hand on the shoulder follows and guides, then lets go as the astronaut's back "
                                       "disappears inside. The technician stays with his back to us; no faces. The hull, "
                                       f"hatch frame, gauges and door frame stay perfectly rigid. {SUIT} {LOCK}")),
    "K_3.8d_harness": dict(model=SD2, image=kf("K_3.8d_harness.jpg"), duration=4,
                           prompt=_p(f"Straight down on an astronaut being strapped into a launch seat. {GO} The helper's "
                                     "two bare hands haul the two loose shoulder-strap tails down hard toward the round "
                                     "buckle, one strong pull and then a second one; the straps bite into the suit and the "
                                     "astronaut's whole body is jolted down into the seat with each pull; the blue-gloved "
                                     "hands on the thighs brace and the fingers spread; the ribbed hose shakes. The round "
                                     f"buckle and the seat frame keep their shape. {SUIT} {LOCK}")),
    "K_3.8e_buckle": dict(model=SD2, image=kf("K_3.8e_buckle.jpg"), duration=4,
                          prompt=_p(f"Macro on the round buckle of a five-point harness. {GO} The blue-gloved hand pushes "
                                    "the flat metal tongue of the last strap straight up into its slot in the rim of the "
                                    "round buckle; it snaps home with a small jolt; then the same hand presses flat on the "
                                    "buckle and the other gloved hand tugs the strap once to test it. The buckle stays "
                                    f"round and rigid; the other four straps stay locked. {SUIT} {LOCK}")),
    "K_3.8f_visor": dict(model=SD2, image=kf("K_3.8f_visor.jpg"), duration=5,
                         prompt=_p(f"Inside a crew capsule before launch, an astronaut seen from behind. {GO} Her blue-gloved "
                                   "hand pulls the gold visor steadily down until it closes over the face opening and "
                                   "latches; the reflection of the tower lights slides across the curved gold visor; then "
                                   "her hand lowers and her helmet turns very slightly toward the small photograph on the "
                                   "wall and stays there; she breathes. The lights of the tower outside the round window "
                                   "twinkle faintly. The small photograph of the two children stays perfectly still, sharp "
                                   f"and unchanged; the cabin wall and window stay rigid. No face is ever visible. {SUIT} {LOCK}")),
    # ---- 3.5 the mission assignment: envelope front (type composited in JS), then the back: seal, flap, letter
    "K_3.5_front": dict(model=SD2, image=kf("K_3.5_front.jpg"), duration=4,
                        prompt=_p(f"Top-down on a desk in lamplight, quiet. {GO} Her right hand strokes the pale envelope "
                                  "slowly and tenderly: the four fingertips glide to the left along the lower edge of the "
                                  "paper, as if smoothing it, and come to rest; her left hand turns the painted globe a "
                                  "little under her palm. The envelope stays flat and perfectly still on the desk, and its "
                                  "paper stays completely blank: no writing, no marks ever appear on it. The lamp light is "
                                  f"steady. Natural, relaxed hands with five fingers each. {LOCK}")),
    "K_3.5_back": dict(model=SD2, image=kf("K_3.5_back.jpg"), duration=5,
                       prompt=_p(f"Top-down on a desk in lamplight: a woman opens a sealed envelope. {GO} In one fluid "
                                 "movement her right thumb slides under the point of the triangular flap and lifts it: the "
                                 "small red seal stamped across the flap's point splits in two, one half lifting with the "
                                 "flap; she folds the flap all the way open, away from her, until it lies flat on the desk "
                                 "above the envelope, its inside lined with deep indigo-blue paper; then with thumb and "
                                 "forefinger she takes the top edge of the folded sheet of bright white letter paper inside "
                                 "and draws it steadily half-way out of the envelope, sliding it straight up over the open "
                                 "flap, and holds it there. Her left hand keeps the envelope flat and perfectly still on "
                                 "the desk. The letter is plain blank white paper with crisp straight edges: no writing, "
                                 "no marks ever appear on it or on the envelope. The painted globe stays still. Natural "
                                 f"hands with five fingers each. {LOCK}")),
}


def sheet16(item, n=16):
    """A 4x4 contact sheet of evenly spaced frames (rule 3: look before roto)."""
    import av
    from PIL import Image, ImageDraw
    shot, take = item.split("/")
    mp4 = os.path.join(vgen.GEN, shot, take + ".mp4")
    with av.open(mp4) as c:
        fr = [f.to_image() for f in c.decode(c.streams.video[0])]
    idx = [round(i * (len(fr) - 1) / (n - 1)) for i in range(n)]
    W = 640
    H = round(W * fr[0].height / fr[0].width)
    cols = 4
    out = Image.new("RGB", (W * cols, H * ((n + cols - 1) // cols)), (15, 15, 15))
    for k, i in enumerate(idx):
        im = fr[i].convert("RGB").resize((W, H))
        d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 118, 14), fill=(0, 0, 0))
        d.text((3, 2), f"{i / 24:.2f}s f{i}", fill=(255, 255, 0))
        out.paste(im, ((k % cols) * W, (k // cols) * H))
    p = os.path.join(vgen.GEN, shot, f"{take}_sheet16.jpg")
    out.save(p, quality=88)
    print(p, len(fr), "frames", fr[0].size)
    return p


if __name__ == "__main__":
    vgen.SHOTS.update(SHOTS)
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    args = [a for a in sys.argv[2:] if not a.startswith("--")]
    opts = {a[2:].partition("=")[0]: a[2:].partition("=")[2] or True for a in sys.argv[2:] if a.startswith("--")}
    if cmd == "submit":
        for s in args:
            over = {k: (int(v) if k == "duration" else v) for k, v in opts.items() if k in ("duration", "prompt", "model", "aspect")}
            for j in vgen.submit(s, opts.get("res", "720p"), int(opts.get("takes", 1)), "dry-run" in opts, opts.get("note", ""), over):
                print(j)
        print(f"spend so far (est): ${vgen.spend_total()}")
    elif cmd == "collect":
        print("pending:", vgen.collect(args or sorted(SHOTS)))
    elif cmd == "wait":
        t0 = time.time()
        while True:
            p = vgen.collect(args or sorted(SHOTS))
            if not p or time.time() - t0 > float(opts.get("timeout", 1500)):
                print("pending:", p)
                break
            time.sleep(30)
    elif cmd == "sheet":
        sheet16(args[0], int(args[1]) if len(args) > 1 else 16)
    else:
        print(__doc__)
