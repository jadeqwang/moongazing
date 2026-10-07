#!/usr/bin/env python3
"""Round-based video-base generation on top of tools/gen.py (relay queue), with a hard spend cap.

Every take lives in media/gen/<SHOT>/:
    take_N.spec.json   the exact gen.py spec submitted
    take_N.json        sidecar: job id, model, resolution, est cost, state, probe, notes, verdict
    take_N.mp4         the collected clip (h3's AAC track stripped; raw file stays in media/gen/)
    take_N_sheet.jpg   6-frame contact sheet
Spend log: media/gen/spend.jsonl (one line per submit / error-refund). Cap: CAP_USD (env VGEN_CAP, default 300).

    .venv/bin/python tools/vgen.py submit SHOT [SHOT ...] [--takes=N] [--res=480p|720p] [--dry-run] [--note=...]
    .venv/bin/python tools/vgen.py collect [SHOT ...]       # collect finished jobs, link take_N.mp4, make sheets
    .venv/bin/python tools/vgen.py wait [SHOT ...]          # collect until nothing is pending
    .venv/bin/python tools/vgen.py sheet OUT.jpg [SHOT/take_N ...]   # overview sheet (default: best/latest per shot)
    .venv/bin/python tools/vgen.py spend
"""
import glob
import json
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen  # noqa: E402

ROOT = gen.ROOT
GEN = os.path.join(ROOT, "media", "gen")
SPEND = os.path.join(GEN, "spend.jsonl")
CAP_USD = float(os.environ.get("VGEN_CAP", "300"))
REFS768 = "/home/jade/Documents/rewind-music-video/assets/character/refs_768/"
FFMPEG = gen.FFMPEG

NO_TEXT = "No text, no letters, no subtitles, no captions, no logos, no watermark anywhere in the frame."
KEEP_STYLE = ("Keep the exact art style, colours, paper texture and line work of the first frame: it stays a painting, "
              "never photographic.")
LIKENESS = ("Same face as the reference photos: same eye shape and size, eyes stay fully open and large, smooth clear "
            "skin, youthful, accurate likeness, same glasses.")
SING = ("She sings the reference audio with clear, accurate lip-sync: her lips and jaw form every syllable exactly in "
        "time with the voice, natural breaths between phrases, gentle and relaxed singing.")


def kf(name):
    return f"media/keyframes/{name}"


def ref(name):
    return REFS768 + name


# ----------------------------------------------------------------------------- the shots
SHOTS = {
    # ---- lip-sync (Seedance 2.5, vocal-stem reference audio)
    "LS1": dict(model="bytedance/seedance-2.5", image=kf("jade/J_LS1.png"), avatar=True, ls=True,
                refs=[kf("jade/J_LS1.png"), ref("PXL_20250908_195352130.jpg"), ref("PXL_20260929_001719023.jpg")],
                audio="media/gen/LS1/ref_vocals_39.230_8s.mp3", duration=8,
                prompt=f"{SING} Three-quarter profile, she looks out across the lake as she sings; her head moves "
                       "only a little. The canopied rowboat drifts slowly; small ripples spread across the lake water "
                       "and lap at the hull; willow branches on the far shore sway gently; a few light snowflakes fall; "
                       "her hair and scarf stir in the lake wind; the boy at the right trails his hand in the water. "
                       f"Camera locked, steady. {LIKENESS} {KEEP_STYLE} {NO_TEXT}"),
    "LS2": dict(model="bytedance/seedance-2.5", image=kf("jade/J_LS2.png"), avatar=True, ls=True,
                refs=[kf("jade/J_LS2.png"), ref("PXL_20260528_215628802.jpg"), ref("PXL_20250908_195352130.jpg")],
                audio="media/gen/LS2/ref_vocals_53.790_5s.mp3", duration=5,
                prompt=f"{SING} She sings this Mandarin line to the children, facing the camera, with a warm, gentle "
                       "expression. She holds the flashlight steady: its beam stays fixed on the toy Earth. The boy "
                       "holds the toy Earth and the girl holds the toy Moon; the children sway a little, so their "
                       "shadows on the paper wall shift slightly. Camera locked. "
                       f"{LIKENESS} {KEEP_STYLE} {NO_TEXT}"),
    "LS3": dict(model="bytedance/seedance-2.5", image=kf("jade/J_LS3.png"), avatar=True, ls=True,
                refs=[kf("jade/J_LS3.png"), ref("PXL_20260528_215628802.jpg"), ref("IMG_20180610_074732_mr1528617091925.jpg")],
                audio="media/gen/LS3/ref_vocals_79.340_8s.mp3", duration=8,
                prompt=f"{SING} She sings with full voice and holds the final long note with her mouth open on the "
                       "vowel. Inside the spacecraft capsule during launch: strong acceleration presses her back into "
                       "the seat, her head held against the headrest; the whole cabin and her helmet vibrate with a "
                       "fine, rapid shake. The clear helmet visor stays closed. Camera locked to the seat, shaking "
                       f"with the cabin. {LIKENESS} {KEEP_STYLE} {NO_TEXT}"),
    # ---- base clips (motion only)
    "K_0.3": dict(model="minimax/h3", image=kf("K_0.3.jpg"), duration=4,
                  prompt="Chang'e rises steadily upward past the great full Moon, her body lifting toward the upper "
                         "right. Her long silk ribbons and sleeves stream down behind her in long flowing curves like "
                         "a rocket's exhaust trail, rippling continuously in the rush of her ascent; the small clouds "
                         f"at the bottom drift and fall away below her. Camera locked. {KEEP_STYLE} {NO_TEXT}"),
    "K_2.1": dict(model="minimax/h3", image=kf("K_2.1.jpg"), duration=4,
                  prompt="The small canopied rowboat drifts slowly from right to left across the calm lake, the "
                         "boatman at the stern pulling the oar; a soft V-shaped wake and small ripples spread behind "
                         "the boat; faint reflections shimmer on the water; light snow falls slowly over the lake; the "
                         "willow branches sway very gently. Camera locked, still. "
                         f"{KEEP_STYLE} {NO_TEXT}"),
    "K_3.6a": dict(model="minimax/h3", image=kf("K_3.6a.jpg"), duration=4,
                   prompt="A human centrifuge in operation: the long arm spins fast around the central hub, carrying "
                          "the gondola with the astronaut inside around the circular room; the gondola is tilted "
                          "outward by the spin; the arm sweeps smoothly and continuously at constant speed; the two "
                          "observers in the control window watch. The gondola cabin stays rigidly attached to the far end of the arm "
                          "the whole time: one arm, one gondola, nothing appears or disappears. Overhead camera locked. "
                          f"{KEEP_STYLE} {NO_TEXT}"),
    "K_3.6b": dict(model="bytedance/seedance-2.5", image=kf("K_3.6b.jpg"), duration=4,
                   prompt="Underwater in a neutral buoyancy training pool: the astronaut in the white spacesuit moves "
                          "slowly hand over hand along the large module mockup, perfectly weightless and heavy-slow; "
                          "the safety divers in fins kick slowly and keep one hand on her suit, guiding her; streams of "
                          "bubbles rise from the divers' regulators and the suit to the surface; soft ripples of light "
                          f"play over everything. Slow, calm, underwater motion. Camera locked. {KEEP_STYLE} {NO_TEXT}"),
    "K_3.6c": dict(model="bytedance/seedance-2.5", image=kf("K_3.6c.jpg"), duration=4,
                   prompt="Inside a parabolic-flight aircraft cabin with padded walls: for the first moments the crew "
                          "float up off the padded floor, weightless, drifting and turning slowly in the air; then "
                          "gravity returns and they all settle gently back down onto the padded floor together. The "
                          f"loose straps and ropes swing with them. Camera locked. {KEEP_STYLE} {NO_TEXT}"),
    "K_3.6d": dict(model="bytedance/seedance-2.5", image=kf("K_3.6d.jpg"), duration=4,
                   prompt="Kneeling on black lava field, the geologist swings the rock hammer down hard and strikes "
                          "the lava boulder once; a few small rock chips fly off; she picks up the broken rock sample "
                          "and drops it into the open white sample bag beside her. The distant figure stands still. "
                          f"Camera locked. {KEEP_STYLE} {NO_TEXT}"),
    "K_4.9": dict(model="minimax/h3", image=kf("K_4.9.jpg"), duration=4,
                  prompt="On the airless Moon, the lander descends slowly the last few metres straight down onto the "
                         "surface. Its rocket exhaust blasts the grey dust and pebbles outward in flat, straight, "
                         "radial sheets streaking low along the ground at high speed. The legs touch down and the "
                         "engine cuts off: at that instant the dust sheets stop and every grain falls straight back "
                         "down at once, leaving the scene perfectly clear. No dust cloud, no billowing, no haze, no "
                         f"smoke, no air. Black sky. Camera locked. {KEEP_STYLE} {NO_TEXT}"),
    "K_5.1": dict(model="minimax/h3", image=kf("K_5.1.jpg"), duration=4,
                  prompt="Three astronauts move across the Moon's surface in one-sixth gravity: a slow, floaty "
                         "loping, skipping gait, leaning forward with knees bent, long slow hops with a long time in the "
                         "air between steps. Each footfall kicks up grey dust in clean parabolic arcs that fall straight "
                         "back down at once, with no cloud and no lingering dust. Their long black shadows move with "
                         f"them. Black sky. Camera locked. {KEEP_STYLE} {NO_TEXT}"),
    "K_7.B1": dict(model="minimax/h3", image=kf("K_7.B1.jpg"), duration=4,
                   prompt="In the dark crater, the drill auger turns steadily, boring into the frozen ground; tiny ice "
                          "grains lifted by the turning auger glitter and sparkle in the pool of helmet-lamp light and "
                          "drop straight back down at once (no air). The kneeling astronaut stays almost still, one "
                          "glove steadying the sample. Everything outside the lamp light stays black. Camera locked. "
                          f"{KEEP_STYLE} {NO_TEXT}"),
    "K_7.D1": dict(model="bytedance/seedance-2.5", image=kf("K_7.D1.jpg"), duration=4,
                   prompt="On a school stage, the little girl dressed as Chang'e is lifted slowly upward on thin stage "
                          "wires toward the big paper moon, her arm reaching up to it; her long silk ribbons and sleeves "
                          "float and ripple gently around her; the painted clouds at the bottom stay still; in the dark "
                          "audience the parents' phone screens glow and sway slightly as they film. Camera locked. "
                          f"{KEEP_STYLE} {NO_TEXT}"),
    "J_7.D2": dict(model="bytedance/seedance-2.5", image=kf("jade/J_7.D2.png"), avatar=True,
                   refs=[kf("jade/J_7.D2.png"), ref("PXL_20260929_003030232.jpg"), ref("PXL_20260929_003013442.jpg")],
                   duration=4,
                   prompt="She watches the livestream of her daughter's school play on the screen; she slowly raises "
                          "her hand and gently presses her open palm and fingertips against the screen, over the little "
                          "girl rising toward the paper moon; on the screen the girl rises slightly. Small, quiet "
                          f"motion; she keeps looking at the screen. Camera locked. {LIKENESS} {KEEP_STYLE} {NO_TEXT}"),
    "J_3.6e": dict(model="bytedance/seedance-2.5", image=kf("jade/J_3.6e.png"), avatar=True,
                   refs=[kf("jade/J_3.6e.png"), ref("PXL_20260929_003045414.jpg"), ref("PXL_20260929_003013442.jpg")],
                   duration=4,
                   prompt="Late at night at her desk, she studies orbital mechanics: she looks down at the notebook "
                          "and writes with a pencil, then glances at the laptop screen and back; the desk lamp glows "
                          "steadily; small, natural head motion; she blinks. Camera locked. "
                          f"{LIKENESS} {KEEP_STYLE} {NO_TEXT}"),
    "J_3.7": dict(model="bytedance/seedance-2.5", image=kf("jade/J_3.7.png"), avatar=True,
                  refs=[kf("jade/J_3.7.png"), ref("PXL_20260929_001738199.jpg"), ref("PXL_20260528_215628802.jpg")],
                  duration=6,
                  prompt="Sitting on the child's bed at night, she smiles warmly and looks down at the small toy Earth "
                         "globe in her hands, slowly turning it with her fingers, then looks up again with a soft "
                         "smile; her hair moves slightly; the bedside lamp glows steadily. Gentle, small motion. Camera "
                         f"locked. {LIKENESS} {KEEP_STYLE} {NO_TEXT}"),
    "J_1.4": dict(model="bytedance/seedance-2.5", image=kf("jade/J_1.4.png"), avatar=True,
                  refs=[kf("jade/J_1.4.png"), ref("PXL_20260528_215628802.jpg"), ref("PXL_20250908_195352130.jpg")],
                  duration=4,
                  prompt="Inside her helmet she slowly lifts her eyes and tilts her head slightly upward to look up; "
                         "only a tiny head motion; she breathes calmly; the visor stays perfectly clear with no fog and "
                         "no condensation; the small Earth reflection in the helmet rim stays put. Camera locked. "
                         f"{LIKENESS} {KEEP_STYLE} {NO_TEXT}"),
}


# ---- round 2 (Earth keyframes final; crew-at-home intercuts)
SD = "bytedance/seedance-2.5"
LOCK = "Camera locked."
KIDS = ("The children keep their size, faces and clothes; natural, child-like, physically plausible motion.")


def _p(text):
    return f"{text} {KEEP_STYLE} {NO_TEXT}"


SHOTS.update({
    "K_0.5": dict(model="minimax/h3", image=kf("K_0.5.jpg"), duration=4,
                  prompt=_p("Mid-Autumn night over a thousand rooftops: the red lanterns flicker and sway very gently, "
                            "warm window lights glow, a thin mist drifts slowly between the rows of roofs; the tiny "
                            "figures stay in place, looking up at the full moon. Very slow, steady push-in.")),
    "K_0.6": dict(model=SD, image=kf("K_0.6.jpg"), duration=4,
                  prompt=_p("On the roof deck at night, the little girl slowly lifts the toy moon up with both hands "
                            "to hold it against the real full moon, rising on her toes; her mother, kneeling beside her "
                            "with her back to us, puts a steadying hand on the girl's back. The city lights shimmer on "
                            f"the river. {KIDS} {LOCK}")),
    "K_1.6": dict(model=SD, image=kf("K_1.6.jpg"), duration=4,
                  prompt=_p("Pre-dawn blue hour at the launch viewing area: the crowd at the fence shifts and murmurs, "
                            "a few people raise phones and point toward the horizon; the little girl on her father's "
                            "shoulders lifts her head and points up; palm fronds sway slightly in the sea breeze; small "
                            f"waves roll in. {KIDS} {LOCK}")),
    "K_2.2": dict(model=SD, image=kf("K_2.2.jpg"), duration=4,
                  prompt=_p("In the rehearsal room, an adult's hands gently lift and adjust the little girl's arm into "
                            "the Chang'e pose, straightening her elbow and turning her wrist; she holds still and "
                            "concentrates; the long white silk ribbons hanging around her sway softly. "
                            f"{KIDS} {LOCK}")),
    "K_2.4": dict(model=SD, image=kf("K_2.4.jpg"), duration=4,
                  prompt=_p("Close-up: two hands slowly smooth the white silk costume flat, palms gliding outward; soft "
                            "ripples travel across the silk ahead of the hands like ripples on water, then settle. "
                            f"{LOCK}")),
    "K_3.0_bridge": dict(model=SD, image=kf("K_3.0_bridge.jpg"), duration=4,
                         prompt=_p("Seen from behind, the family group walks slowly away along the zigzag stone bridge "
                                   "toward the pavilion, turning with the bridge's corner; the two children hold hands "
                                   "with the adults; light snow falls steadily; footsteps and coats sway naturally. "
                                   f"{KIDS} {LOCK}")),
    "K_3.1": dict(model=SD, image=kf("K_3.1.jpg"), duration=4,
                  prompt=_p("Winter afternoon in the teahouse: steam rises and curls from the tea cups and the bowls; "
                            "the family at the table make small natural gestures - a grandparent lifts a tea cup, the "
                            "little girl leans toward her bowl, the boy turns his head to look out at the snow; snow "
                            f"falls softly outside the lattice windows. {KIDS} {LOCK}")),
    "K_3.2": dict(model=SD, image=kf("K_3.2.jpg"), duration=4,
                  prompt=_p("Close on the table: steam rises from the bowl of tangyuan and from the iron kettle; a pair of "
                            "chopsticks comes in and gently lifts the bitten, crescent-shaped tangyuan out of the bowl "
                            "and holds it up; the charcoal glows in the stove; snow drifts down outside. "
                            f"{LOCK}")),
    "K_3.4_lesson": dict(model=SD, image=kf("K_3.4_lesson.jpg"), duration=4,
                         prompt=_p("Lamplit evening lesson: the mother, back to us, steadies the flashlight beam on the "
                                   "children; the girl holding the toy moon and the boy holding the toy Earth shuffle a "
                                   "little and line the toys up in the beam, moon in front of Earth, looking at the wall; "
                                   f"the shadows on the wall move with the toys. {KIDS} {LOCK}")),
    "K_4.2": dict(model=SD, image=kf("K_4.2.jpg"), duration=4,
                  prompt=_p("At dawn on the beach, far away across the water the rocket climbs steadily into the sky on a "
                            "bright flame, its exhaust trail lengthening behind it; the crowd cheers, raising their arms "
                            "and phones, some jumping; on her father's shoulders the little girl quickly claps both hands "
                            "over her ears; seabirds lift off from the palms. Small waves roll in. "
                            f"{KIDS} {LOCK}")),
    "K_4.5": dict(model=SD, image=kf("K_4.5.jpg"), duration=4,
                  prompt=_p("In the family viewing room, faces lit by the big screen: the boy reaches up and presses his "
                            "open palm flat against the screen and keeps it there; on the screen the rocket climbs; the "
                            "little girl on her father's lap watches, the father leans forward slightly. "
                            f"{KIDS} {LOCK}")),
    "K_6.1": dict(model=SD, image=kf("K_6.1.jpg"), duration=4,
                  prompt=_p("Mid-Autumn night on the roof deck: the father, the boy and the little girl slowly raise "
                            "their heads together to look up at the full moon; the girl lifts the toy moon higher toward "
                            f"the real one; a light breeze stirs their hair. {KIDS} Camera tilts up slowly with them.")),
    "K_7.C1_earth": dict(model=SD, image=kf("K_7.C1_earth.jpg"), duration=4,
                         prompt=_p("At the kitchen counter on a video call: the little girl talks animatedly to the laptop "
                                   "screen, waving her hands as she talks; the boy behind her laughs, shoulders shaking, "
                                   f"leaning in toward the screen. {KIDS} {LOCK}")),
    "K_7.C2": dict(model=SD, image=kf("K_7.C2.jpg"), duration=6,
                   prompt=_p("Living room dance game: the father stands right behind his son on the same dance pad, "
                             "holding the boy's hands, and the two of them bounce together on bent knees in a steady "
                             "rhythm, about two bounces per second, stepping onto the arrow panels left, right, left, "
                             "right; both keep their eyes on the TV screen, the boy concentrating, the father grinning. "
                             "Beside them the little girl dances happily with the small toy robot dog, which hops and "
                             f"wags. The cat watches from the sofa. {KIDS} {LOCK}")),
    "K_7.C3": dict(model=SD, image=kf("K_7.C3.jpg"), duration=4,
                   prompt=_p("Curled up on the sofa, the little girl slowly strokes the cat with one hand while she "
                             "watches the tablet; the cat stretches and purrs, its tail curling; the tablet screen "
                             f"glows. {KIDS} {LOCK}")),
    "K_7.D4": dict(model=SD, image=kf("K_7.D4.jpg"), duration=4,
                   prompt=_p("On the school stage the little girl in the Chang'e costume bows deeply to the audience and "
                             "rises again smiling; in the dark audience everyone claps, hands moving, phones held up "
                             f"glowing; the silk ribbons swing with her bow. {KIDS} {LOCK}")),
    "K_8.1": dict(model="minimax/h3", image=kf("K_8.1.jpg"), duration=4,
                  prompt=_p("At dawn over the sea, the capsule hangs under its three parachutes and swings gently like a "
                            "pendulum as it descends slowly; the parachute canopies breathe; waves roll steadily below; "
                            "the small recovery ship waits in the distance. Camera locked.")),
    "K_8.2": dict(model=SD, image=kf("K_8.2.jpg"), duration=8,
                  prompt=_p("Homecoming, joyful chaos: the little girl runs and throws herself into her mother's arms, "
                            "knocking her backward onto the rug, the mother laughing and hugging her tight as they "
                            "roll; the boy runs in and piles on, arms around them both; the father stands behind and "
                            "laughs, hand on his head. Real weight and momentum, physically plausible falls, nobody "
                            f"hurt. {KIDS} {LOCK}")),
    "K_8.3": dict(model=SD, image=kf("K_8.3.jpg"), duration=4,
                  prompt=_p("Seen from behind on the roof-deck sofa under the full moon: small, quiet movements - the "
                            "little girl leans her head against her mother's arm, the mother leans in and rests her "
                            f"cheek on the girl's head, the father puts his arm along the sofa back. {KIDS} {LOCK}")),
    "K_7.C4": dict(model=SD, image=kf("K_7.C4.jpg"), duration=4,
                   prompt=_p("In the galley the crew lean in around the table sharing family clips on their tablets: "
                             "they point at screens, turn tablets to show each other, laugh and smile warmly; the woman "
                             f"in front holds up her tablet; tablet light flickers on their faces. {LOCK}")),
})
CELLS = {"c1_chen": "He rests his chin on his hand and smiles softly at the tablet, then lets out a small laugh.",
         "c2_anastasia": "She reads the tablet with a gentle smile, then smiles wider and tilts her head.",
         "c3_adaeze": "She laughs behind her hand at the tablet, shoulders shaking, eyes crinkling.",
         "c4_arjun": "He watches the tablet, moved, smiling with glistening eyes, and presses his lips together.",
         "c5_lucia": "She smiles at the tablet and touches the screen with one finger, swiping gently.",
         "c6_kenji": "He smiles and wipes one eye with the back of his wrist, then looks back at the tablet.",
         "c7_layla": "She holds the tablet up and laughs, then leans back, delighted.",
         "c8_jade": "Seen from behind, she holds the tablet; on its screen her children wave; she lifts her free hand and waves back."}
for k, v in CELLS.items():
    SHOTS[f"K_7.C4_{k}"] = dict(model=SD, image=kf(f"K_7.C4_{k}.jpg"), duration=4, avatar=(k == "c8_jade"),
                               prompt=_p(f"In a quiet crew bunk at night, lit by the tablet's glow: {v} Gentle, small, "
                                         f"natural movement; breathing; the tablet light flickers softly on the face. {LOCK}"))
SHOTS["LS1"]["prompt"] = SHOTS["LS1"]["prompt"].replace(
    "the boy at the right trails his hand in the water. ", "").replace(
    "Three-quarter profile, she looks out across the lake as she sings; her head moves only a little.",
    "She keeps the three-quarter view of the first frame the whole time - her face stays turned three-quarters toward "
    "the camera with both eyes visible and never turns into full profile; she looks out across the lake as she sings; "
    "her head moves only a little.")


# ----------------------------------------------------------------------------- helpers
def shot_dir(shot):
    d = os.path.join(GEN, shot)
    os.makedirs(d, exist_ok=True)
    return d


def takes(shot):
    out = []
    for p in glob.glob(os.path.join(shot_dir(shot), "take_*.json")):
        if p.endswith(".spec.json") or p.endswith(".sync.json") or p.endswith(".mouth.json"):
            continue
        try:
            n = int(os.path.basename(p)[5:-5])
        except ValueError:
            continue
        out.append((n, p))
    return sorted(out)


def next_take(shot):
    t = takes(shot)
    used = {n for n, _ in t} | {int(os.path.basename(p)[5:].split(".")[0]) for p in
                                 glob.glob(os.path.join(shot_dir(shot), "take_*.spec.json"))}
    return max(used) + 1 if used else 1


def spend_total():
    tot = 0.0
    if os.path.exists(SPEND):
        for line in open(SPEND):
            r = json.loads(line)
            tot += r.get("est_usd", 0) if r["event"] == "submit" else -r.get("refund_usd", 0)
    return round(tot, 4)


def log_spend(rec):
    with open(SPEND, "a") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def build_spec(shot, res, note="", over=None):
    s = {**SHOTS[shot], **(over or {})}
    model = s["model"]
    inp = {"prompt": s["prompt"], "image": "file:" + os.path.relpath(gen.ref_image(os.path.join(ROOT, s["image"])), ROOT),
           "duration": s["duration"]}
    if model == "bytedance/seedance-2.0":
        inp.update(resolution=res, aspect_ratio=s.get("aspect", "16:9"), generate_audio=False, fps=24,
                   camera_fixed=True, watermark=False, use_virtual_avatar=bool(s.get("avatar")))
    elif model.startswith("bytedance/seedance"):
        # "adaptive" gave 21:9 / 4:3 / 9:16 outputs in round 1 -> 16:9 explicitly (override with aspect=)
        inp.update(resolution=res, aspect_ratio=s.get("aspect", "16:9"), generate_audio=False,
                   use_virtual_avatar=bool(s.get("avatar")))
        if s.get("refs"):
            inp["reference_images"] = ["file:" + os.path.relpath(gen.ref_image(os.path.join(ROOT, r) if not r.startswith("/") else r), ROOT)
                                       for r in s["refs"]]
        if s.get("audio"):
            inp["reference_audios"] = ["file:" + s["audio"]]
    else:
        inp.update(resolution="768P" if res in ("480p", "768P") else "2K", ratio="adaptive")
    return {"model": model, "tag": shot.replace(".", "_"), "notes": f"{shot} {res} {note}".strip(), "input": inp}


def submit(shot, res="480p", n=1, dry=False, note="", over=None):
    jobs = []
    over = over or {}
    for _ in range(n):
        spec = build_spec(shot, res, note, over)
        k = next_take(shot)
        sp = os.path.join(shot_dir(shot), f"take_{k}.spec.json")
        json.dump(spec, open(sp, "w"), indent=1, ensure_ascii=False)
        _, model, tag, inp, est, why, body = gen.prepare(sp)
        tot = spend_total()
        if tot + est > CAP_USD:
            os.remove(sp)
            raise SystemExit(f"CAP: {shot} take {k} est ${est} would bring spend to ${tot + est:.2f} > ${CAP_USD}")
        if dry:
            print(f"{shot} take_{k}: {model} {res} {inp.get('duration')}s est ${est} [{why}] body {len(body)/1024:.0f} KB (dry)")
            os.remove(sp)
            continue
        jid = gen.submit(sp)
        side = {"shot": shot, "take": k, "job": jid, "model": model, "res": res if model.startswith("bytedance") else inp.get("resolution"),
                "duration": inp.get("duration"), "est_usd": est, "est_basis": why, "state": "queued", "submitted": time.time(),
                "spec": os.path.relpath(sp, ROOT), "notes": note, "prompt": over.get("prompt", SHOTS[shot]["prompt"]),
                "first_frame": SHOTS[shot]["image"], "reference_images": SHOTS[shot].get("refs", []),
                "reference_audio": over.get("audio", SHOTS[shot].get("audio"))}
        json.dump(side, open(os.path.join(shot_dir(shot), f"take_{k}.json"), "w"), indent=1, ensure_ascii=False)
        log_spend({"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "event": "submit", "shot": shot, "take": k,
                   "job": jid, "model": model, "res": side["res"], "dur_s": inp.get("duration"), "est_usd": est,
                   "basis": why, "cum_usd": round(tot + est, 4)})
        jobs.append(jid)
    return jobs


def contact_sheet(mp4, out, n=6, label=""):
    import av
    from PIL import Image, ImageDraw
    frames = []
    with av.open(mp4) as c:
        st = c.streams.video[0]
        allf = [f.to_image() for f in c.decode(st)]
    idx = [round(i * (len(allf) - 1) / (n - 1)) for i in range(n)]
    W = 480
    tiles = []
    for i in idx:
        im = allf[i].convert("RGB")
        im = im.resize((W, round(W * im.height / im.width)))
        d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 120, 14), fill=(0, 0, 0))
        d.text((3, 2), f"{i / 24:.2f}s f{i}", fill=(255, 255, 0))
        tiles.append(im)
    H = tiles[0].height
    sheet = Image.new("RGB", (W * 3, H * 2 + 18), (20, 20, 20))
    ImageDraw.Draw(sheet).text((4, 3), label, fill=(255, 255, 255))
    for k, t in enumerate(tiles):
        sheet.paste(t, ((k % 3) * W, 18 + (k // 3) * H))
    sheet.save(out, quality=85)
    return out


def collect(shots=None, quiet=False):
    pending = 0
    for shot in (shots or sorted(SHOTS)):
        for k, p in takes(shot):
            side = json.load(open(p))
            if side["state"] not in ("queued", "running", "ready", "stale"):
                continue
            st = gen.collect_one(side["job"]) if not quiet else gen.collect_one(side["job"])
            j = gen.read_manifest()["jobs"][side["job"]]
            side["state"] = j["state"]
            if j["state"] == "done":
                src = os.path.join(ROOT, j["files"][0])
                dst = os.path.join(shot_dir(shot), f"take_{k}.mp4")
                if os.path.exists(dst):
                    os.remove(dst)
                if side["model"].startswith("minimax"):
                    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", src, "-an", "-c", "copy", dst], check=True)
                else:
                    os.link(src, dst)
                side.update(file=os.path.relpath(dst, ROOT), raw_file=j["files"][0], probe=gen.probe(dst),
                            gen_secs=j.get("gen_secs"), latency_secs=j.get("latency_secs"))
                contact_sheet(dst, os.path.join(shot_dir(shot), f"take_{k}_sheet.jpg"),
                              label=f"{shot} take_{k}  {side['model']} {side['res']} {side['duration']}s")
            elif j["state"] in ("error", "collected_error"):
                side["error"] = (j.get("error") or "")[:800]
                if not side.get("refunded"):
                    log_spend({"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "event": "error", "shot": shot,
                               "take": k, "job": side["job"], "refund_usd": side["est_usd"],
                               "note": "errored runs are normally not billed", "error": side["error"][:200]})
                    side["refunded"] = True
            elif j["state"] in ("queued", "running", "ready", "stale"):
                pending += 1
            json.dump(side, open(p, "w"), indent=1, ensure_ascii=False)
    return pending


def overview(out, items=None):
    from PIL import Image, ImageDraw
    rows = []
    if items is None:
        items = []
        for shot in sorted(SHOTS):
            for k, p in takes(shot):
                if json.load(open(p)).get("state") == "done":
                    items.append(f"{shot}/take_{k}")
    for it in items:
        sh = os.path.join(GEN, it + "_sheet.jpg")
        if os.path.exists(sh):
            rows.append((it, Image.open(sh)))
    if not rows:
        return
    W = 1440
    rows = [(n, im.resize((W, round(W * im.height / im.width)))) for n, im in rows]
    # 2 columns of half-size sheets
    half = [(n, im.resize((W // 2, im.height // 2))) for n, im in rows]
    H = max(im.height for _, im in half)
    canvas = Image.new("RGB", (W, H * ((len(half) + 1) // 2)), (10, 10, 10))
    for k, (n, im) in enumerate(half):
        canvas.paste(im, ((k % 2) * (W // 2), (k // 2) * H))
    canvas.save(out, quality=82)
    print(out, len(half), "clips")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    args = [a for a in sys.argv[2:] if not a.startswith("--")]
    opts = {a[2:].partition("=")[0]: a[2:].partition("=")[2] or True for a in sys.argv[2:] if a.startswith("--")}
    if cmd == "submit":
        for s in args:
            over = {k: (int(v) if k == "duration" else v) for k, v in opts.items() if k in ("audio", "duration", "prompt", "model", "aspect")}
            for j in submit(s, opts.get("res", "480p"), int(opts.get("takes", 1)), "dry-run" in opts, opts.get("note", ""), over):
                print(j)
        print(f"spend so far (est): ${spend_total()}")
    elif cmd == "collect":
        print("pending:", collect(args or None))
    elif cmd == "wait":
        t0 = time.time()
        while True:
            p = collect(args or None)
            if not p or time.time() - t0 > float(opts.get("timeout", 3600)):
                print("pending:", p); break
            time.sleep(30)
    elif cmd == "sheet":
        overview(os.path.join(ROOT, args[0]) if args else os.path.join(GEN, "SHEET_round1.jpg"), args[1:] or None)
    elif cmd == "spend":
        print(f"${spend_total()} of ${CAP_USD}")
    else:
        print(__doc__)
