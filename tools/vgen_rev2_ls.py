#!/usr/bin/env python3
"""Oct 8 (rev2_ls): one more serious attempt at the sung close-up 4.3 (我思念, 81.46-82.88 s). See
docs/reviews/rev2_ls_report.md for why the 14 earlier LS3 takes failed and what is different here.
Does not change the shared vgen.SHOTS source; takes are filed under media/gen/LS3/ (take_15 and up, full keyframe)
and media/gen/LS3c/ (tighter crop of the same painted keyframe), with the usual sidecars and spend log.

    .venv/bin/python tools/vgen_rev2_ls.py refs                         # cut the reference audio + image crops
    .venv/bin/python tools/vgen_rev2_ls.py submit VARIANT [--dry-run]    # VARIANT: see VARIANTS below
    .venv/bin/python tools/vgen_rev2_ls.py collect | spend
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen  # noqa: E402
import vgen  # noqa: E402

ROOT = vgen.ROOT
NOTE = "rev2_ls Oct8"
KEY = "media/keyframes/jade/J_LS3.png"
KEY_CLOSE = "media/keyframes/jade/J_LS3_close.png"   # = KEY cropped to CROPS["c13"], native pixels (made Oct 8, rev2_ls)
VOCALS = "analysis/stems/vocals.wav"
# Reference audio: the isolated vocal stem from the near-silent gap before 酒 (78.91 s). 我 lands 2.545 s into the
# clip, after two sung onsets (酒, 寒), a held note and a breath: the model has time to lock on, and the shot's window
# (clip 2.55-3.97 s) lies in the steady middle of a 5 s take with 1 s to spare after it.
REF_T0, REF_DUR = 78.910, 5.0
REF_AUDIO = f"media/gen/LS3/ref_vocals_{REF_T0:.3f}_{REF_DUR:g}s.mp3"
# crop of the painted keyframe (1672x941), 16:9, centred on the face: [x0, y0, w, h]
CROPS = {"c16": (627, 106, 1045, 588), "c13": (386, 60, 1286, 724)}

STYLE = ("Keep the exact art style of the first frame for the whole clip: a fine gold line drawing on dark indigo "
         "paper. Her face stays line art: flat dark indigo skin with thin gold outlines, never shaded, never "
         "photographic, never flesh-coloured. Her eyes, eyebrows, glasses, nose and the shape of her face stay exactly "
         "as drawn in the first frame; her eyes stay open, large and looking into the camera.")
CAM = ("Camera locked: the framing and composition of the first frame are held exactly for the whole clip, no zoom, "
       "no push-in, no reframing, no cut. Her head stays facing the camera, pressed back against the headrest; it "
       "does not turn or tilt.")
SING_ZH = ("A woman astronaut in a clear helmet sings in Mandarin with a strong, full voice, and the reference audio is "
           "her own voice: her lips, jaw and chin form every syllable of it exactly in time. She is already singing "
           "at the first frame. The words, in order, are: 'jiu' (a short rounded vowel), then 'han' held as one long "
           "open 'ah' with the jaw dropped, closing slowly to a hum; a quick breath in through parted lips; then "
           "'wo': the lips round forward and open into a clear O; then 'si': the jaw closes and the lips draw back "
           "narrow, almost shut, for the hissing 's'; then 'nian': the tongue lifts and the jaw drops wide open on "
           "'yen'; then 'ni', held long, lips spread and a little apart. Between the words the mouth really closes "
           "or narrows; on the open vowels it opens wide, like a singer who means it. The inside of the open mouth "
           "is plain dark indigo, the same as the paper; the lips are two clean gold outlines; the upper teeth, when "
           "they show, are one small plain pale band with no separate teeth.")
LIFE = ("Inside the spacecraft capsule during launch: acceleration presses her into the seat; she breathes; her chest "
        "and the harness straps rise and fall; a fine vibration runs through the cabin; soft reflections slide slowly "
        "across the curved helmet visor, which stays closed.")
PROMPT_SD = f"{SING_ZH} {LIFE} {CAM} {STYLE} {vgen.NO_TEXT}"
PROMPT_PRUNA = ("A woman astronaut in a clear helmet sings a slow Mandarin song with a strong, full voice, looking into "
                "the camera. Her lips, jaw and chin form every syllable clearly: wide open on the long vowels, closed "
                "or narrow between words. Her head stays still against the headrest. The picture stays a fine gold "
                "line drawing on dark indigo paper: flat dark skin with thin gold outlines, never photographic. Her "
                "eyes, glasses and face stay exactly as drawn. Camera locked, no zoom.")

# round 2 (after LS3/take_15 and LS3c/take_1): p-video-avatar follows the stem to within 1-2 frames, but it draws a
# wide grin with full rows of teeth and a flesh-coloured tongue. Ask for a serious face and a tall, round singer's mouth.
PROMPT_PRUNA2 = ("A woman astronaut in a clear helmet sings a slow, sad Mandarin song with a full voice, looking into the "
                 "camera with a serious, longing expression. She never smiles: the corners of her mouth stay level and "
                 "her cheeks stay relaxed. Her mouth opens tall and round like a classical singer's, the lips pushed "
                 "slightly forward, never stretched sideways; her upper lip covers her upper teeth. The inside of her "
                 "mouth is plain dark indigo like the paper: no tongue, no flesh colour, teeth at most a thin pale edge. "
                 "Between words her lips close. She breathes: her shoulders and the harness straps rise and fall a "
                 "little; a fine vibration runs through the cabin. Her head stays still against the headrest. The "
                 "picture stays a fine gold line drawing on dark indigo paper: flat dark skin with thin gold outlines, "
                 "never photographic. Her eyes, glasses and face stay exactly as drawn. Camera locked, no zoom.")
NEG2 = ("smile, smiling, grin, laughing, happy, cheerful, teeth, white teeth, rows of teeth, tongue, pink, flesh colour, "
        "photorealistic skin, shading, head turning, nodding, camera motion, zoom, text, subtitles")

# round 3 (after take_16/17): negative strength 3.0 gave a true round O for 我 and far fewer teeth, but the head pitched
# back (chin up, nostrils showing) and the eyes narrowed. Hold the head; keep the rest.
PROMPT_PRUNA3 = ("A woman astronaut in a clear helmet, strapped into her seat, sings a slow, sad Mandarin song with a full "
                 "voice. Her head is held completely still against the headrest for the whole clip: it does not tilt "
                 "back, lift, nod or turn; her chin stays down and her face stays exactly at the angle of the first "
                 "frame, eyes level, wide open and looking straight into the camera, eyebrows relaxed. Only her lips, "
                 "jaw and chin move. Serious, longing expression; she never smiles: the corners of her mouth stay level "
                 "and her cheeks stay relaxed. Her mouth opens tall and round like a classical singer's, the lips "
                 "pushed slightly forward, never stretched sideways; her upper lip covers her upper teeth. The inside "
                 "of her mouth is plain dark indigo like the paper: no tongue, no flesh colour, teeth at most a thin "
                 "pale edge. Between words her lips close. Her shoulders and the harness straps rise and fall a little "
                 "with her breathing. The picture stays a fine gold line drawing on dark indigo paper: flat dark skin "
                 "with thin gold outlines, never photographic. Her eyes, glasses and face stay exactly as drawn. "
                 "Camera locked, no zoom.")
NEG3 = ("head tilting back, looking up, chin raised, head lifting, nodding, head turning, raised eyebrows, squinting, "
        "smile, smiling, grin, laughing, happy, teeth, white teeth, rows of teeth, tongue, pink, flesh colour, "
        "photorealistic skin, shading, camera motion, zoom, text, subtitles")

VARIANTS = {
    "pruna_v3": ("LS3", "pruna/p-video-avatar", "full", "720p", {"prompt": PROMPT_PRUNA3, "negative_prompt": NEG3, "strength_negative_prompt": 3.0}),
    "pruna_v3_c13": ("LS3c", "pruna/p-video-avatar", "c13", "720p", {"prompt": PROMPT_PRUNA3, "negative_prompt": NEG3, "strength_negative_prompt": 3.0}),
    "pruna_v3_c16": ("LS3c", "pruna/p-video-avatar", "c16", "720p", {"prompt": PROMPT_PRUNA3, "negative_prompt": NEG3, "strength_negative_prompt": 3.0}),
    "pruna_v2a": ("LS3", "pruna/p-video-avatar", "full", "720p", {"prompt": PROMPT_PRUNA2, "negative_prompt": NEG2, "strength_negative_prompt": 1.5}),
    "pruna_v2b": ("LS3", "pruna/p-video-avatar", "full", "720p", {"prompt": PROMPT_PRUNA2, "negative_prompt": NEG2, "strength_negative_prompt": 3.0}),
    # name: (shot key, model, image variant, resolution, extra)
    "pruna_full": ("LS3", "pruna/p-video-avatar", "full", "720p", {}),
    "pruna_c16": ("LS3c", "pruna/p-video-avatar", "c16", "720p", {}),
    "pruna_full_1080": ("LS3", "pruna/p-video-avatar", "full", "1080p", {}),
    "sd_full": ("LS3", "bytedance/seedance-2.5", "full", "720p", {}),
    "sd_full_audio": ("LS3", "bytedance/seedance-2.5", "full", "720p", {"generate_audio": True}),
    "sd_c16": ("LS3c", "bytedance/seedance-2.5", "c16", "720p", {}),
    "sd_c13": ("LS3c", "bytedance/seedance-2.5", "c13", "720p", {}),
}


def image_for(variant):
    """16:9 JPEG of the painted keyframe (or a crop of it) for the model's first frame; returns repo-relative path."""
    from PIL import Image
    out = os.path.join(ROOT, "media/gen/LS3c" if variant != "full" else "media/gen/LS3", f"first_{variant}.jpg")
    if not os.path.exists(out):
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im = Image.open(os.path.join(ROOT, KEY)).convert("RGB")
        if variant != "full":
            x, y, w, h = CROPS[variant]
            im = im.crop((x, y, x + w, y + h))
        else:
            h = round(im.width * 9 / 16)                      # 1672x941 -> 1672x940 (exact 16:9)
            im = im.crop((0, (im.height - h) // 2, im.width, (im.height - h) // 2 + h))
        im = im.resize((1920, 1080), Image.LANCZOS)
        im.save(out, "JPEG", quality=94)
    return os.path.relpath(out, ROOT)


def refs():
    p = os.path.join(ROOT, REF_AUDIO)
    if not os.path.exists(p):
        gen.audio_ref(os.path.join(ROOT, VOCALS), REF_T0, REF_DUR, p)
    print(REF_AUDIO, gen.probe(p))
    for v in ("full", "c16", "c13"):
        print(image_for(v))


def build(variant, over=None):
    shot, model, img, res, extra = VARIANTS[variant]
    extra = {**extra, **(over or {})}          # dict() copy: build() pops from it
    image = image_for(img)
    if model.startswith("pruna/"):
        inp = {"image": "file:" + image, "audio": "file:" + REF_AUDIO, "voice": "Zephyr (Female)", "voice_script": "",
               "voice_language": "English (US)", "resolution": res, "video_prompt": extra.pop("prompt", PROMPT_PRUNA),
               "voice_prompt": "Say the following.",
               "negative_prompt": "photorealistic skin, flesh colour, shading, head turning, camera motion, zoom, text, subtitles",
               "strength_negative_prompt": 0.5, "disable_safety_filter": True, "disable_prompt_upsampling": True}
        inp.update(extra)
    else:
        inp = {"prompt": extra.pop("prompt", PROMPT_SD), "image": "file:" + image, "duration": int(REF_DUR),
               "resolution": res, "aspect_ratio": "16:9", "generate_audio": False, "use_virtual_avatar": True,
               "camera_fixed": True, "reference_audios": ["file:" + REF_AUDIO]}
        inp.update(extra)
    spec = {"model": model, "tag": shot, "notes": f"{shot} {res} {NOTE} {variant}", "input": inp}
    return shot, spec, image


def submit(variant, dry=False, over=None, note=""):
    shot, spec, image = build(variant, over)
    k = vgen.next_take(shot)
    sp = os.path.join(vgen.shot_dir(shot), f"take_{k}.spec.json")
    json.dump(spec, open(sp, "w"), indent=1, ensure_ascii=False)
    _, model, tag, inp, est, why, body = gen.prepare(sp)
    if est is None:
        raise SystemExit(f"no estimate for {model}: {why}")
    tot = vgen.spend_total()
    if dry or tot + est > vgen.CAP_USD:
        print(f"{shot} take_{k}: {variant} {model} est ${est} [{why}] body {len(body)/1024:.0f} KB (dry)")
        os.remove(sp)
        return None
    jid = gen.submit(sp)
    side = {"shot": shot, "take": k, "job": jid, "model": model, "res": inp.get("resolution"), "duration": REF_DUR,
            "est_usd": est, "est_basis": why, "state": "queued", "submitted": time.time(),
            "spec": os.path.relpath(sp, ROOT), "notes": f"{NOTE} {variant} {note}".strip(), "variant": variant,
            "prompt": inp.get("prompt") or inp.get("video_prompt"),
            # roto_prep registers `first_frame` onto frame 0: for the 1.3x crop that is the cropped keyframe file
            "first_frame": KEY_CLOSE if VARIANTS[variant][2] == "c13" else KEY, "first_frame_sent": image,
            "crop_of_keyframe": CROPS.get(VARIANTS[variant][2]), "reference_images": [],
            "reference_audio": REF_AUDIO, "ref_t0": REF_T0, "generate_audio": bool(inp.get("generate_audio"))}
    json.dump(side, open(os.path.join(vgen.shot_dir(shot), f"take_{k}.json"), "w"), indent=1, ensure_ascii=False)
    vgen.log_spend({"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "event": "submit", "shot": shot, "take": k,
                    "job": jid, "model": model, "res": side["res"], "dur_s": REF_DUR, "est_usd": est, "basis": why,
                    "cum_usd": round(tot + est, 4), "agent": "rev2_ls"})
    print(f"{shot}/take_{k} {variant} -> {jid} est ${est}")
    return jid


def my_spend():
    tot = 0.0
    for line in open(vgen.SPEND):
        r = json.loads(line)
        if r.get("agent") == "rev2_ls":
            tot += r.get("est_usd", 0)
        elif r.get("event") == "error" and r.get("shot") in ("LS3", "LS3c") and r.get("take", 0) >= 15:
            tot -= r.get("refund_usd", 0)
    return round(tot, 4)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    args = [a for a in sys.argv[2:] if not a.startswith("--")]
    if cmd == "refs":
        refs()
    elif cmd == "submit":
        refs()
        for v in args:
            submit(v, dry="--dry-run" in sys.argv)
        print(f"rev2_ls spend so far (est): ${my_spend()}")
    elif cmd == "collect":
        vgen.SHOTS.setdefault("LS3c", dict(vgen.SHOTS["LS3"]))
        print("pending:", vgen.collect(["LS3", "LS3c"]))
    elif cmd == "spend":
        print(f"rev2_ls: ${my_spend()} of $15")
    else:
        print(__doc__)
