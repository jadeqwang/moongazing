#!/usr/bin/env python3
"""Video takes for the Oct 7 revision of THE CALLS (7.C2, 7.C3, 7.C4/7.C5 sharing scenes, the 7.D crew-at-the-screen
slot). Registers these shots on top of tools/vgen.py (same queue, sidecars, spend log and cap) without editing its
shared SHOTS table.

    .venv/bin/python tools/vgen_calls.py submit SHOT [SHOT ...] [--model=h3|sd2] [--res=720p] [--takes=N] [--dry-run]
    .venv/bin/python tools/vgen_calls.py collect|wait [SHOT ...]
    .venv/bin/python tools/vgen_calls.py list
"""
import sys

import vgen

H3, SD2 = "minimax/h3", "bytedance/seedance-2.0"
KEEP = ("Keep the exact art style, colours, paper texture and line work of the first frame: it stays a flat painted "
        "illustration, never photographic. No text, no letters, no subtitles, no logos, no watermark.")
LIVE = ("The motion is already under way in the very first frame and continues without any pause to the last frame; "
        "nobody freezes; everyone breathes and blinks naturally.")
RIGID = ("The room, walls, furniture and all line-drawn architecture stay perfectly rigid and fixed; nothing warps, "
         "appears or disappears. Camera locked, perfectly still.")
SCREEN = ("The tablet stays the same size and shape and is held steady with only a slight natural drift of the hands; "
          "its screen stays a flat, even colour.")


def _p(t):
    return " ".join(t.split())


CALLS = {
    "K_7.C4_c7_layla": dict(image=vgen.kf("K_7.C4_c7_layla.jpg"), duration=5, prompt=_p(f"""
        Alone in her bunk at night, a woman sits with her knees drawn up, a tablet resting on her thighs, watching a
        video of her father. Her eyes move slowly across the screen; a proud, tender smile grows; she breathes in,
        lifts her chin a little and swallows, her eyes shining; her thumb strokes the edge of the tablet once. The
        warm screen light on her face flickers very gently. {LIVE} {SCREEN} {RIGID} {KEEP}""")),
    "K_7.C5b": dict(image=vgen.kf("K_7.C5b.jpg"), duration=5, prompt=_p(f"""
        Seen from behind, two men sit shoulder to shoulder on a bunk, looking down at a tablet that the man on the
        right holds in both hands. The man on the left has his arm around the other's back, his hand on the far
        shoulder: that hand slowly squeezes the shoulder, gives it two small pats and rests again, and he leans his
        head a little closer. The man holding the tablet bows his head slightly nearer the screen; his shoulders rise
        and fall with one slow, unsteady breath; his thumb moves once along the edge of the tablet. The tablet itself
        stays where it is, steady, and the picture on its screen stays exactly as it is. The warm light of the screen
        flickers very faintly on their cheeks and hands. {LIVE} {RIGID} {KEEP}""")),
    "K_7.C5d": dict(image=vgen.kf("K_7.C5d.jpg"), duration=5, prompt=_p(f"""
        Seen from behind, two women sit shoulder to shoulder on a bench, looking down at a tablet that the woman on the
        left (hair in a bun) holds in both hands. The woman on the right (long black ponytail) slowly tips her head
        sideways until it rests against the other woman's shoulder; her ponytail sways a little with the movement. The
        woman holding the tablet turns her head slightly toward her for a moment, then back to the screen, and her
        thumb strokes the edge of the tablet once. Both breathe quietly. The tablet stays where it is, steady, and the
        picture on its screen stays exactly as it is. The warm light of the screen flickers very faintly on their
        hair and hands. {LIVE} {RIGID} {KEEP}""")),
    "K_7.C5a": dict(image=vgen.kf("K_7.C5a.jpg"), duration=5, prompt=_p(f"""
        Two women sit shoulder to shoulder, both looking down at a tablet that the woman on the left holds in both
        hands. The blonde woman on the right is laughing: the laugh grows, her shoulders shake, her fingertips press
        against her lips, her eyes crinkle, and she rocks gently against her friend's shoulder; her braid sways. The
        woman on the left beams with pride, glances sideways at her friend for an instant and back down at the
        screen, and chuckles, her shoulders moving. The tablet stays steady in her hands. Neither of them ever looks
        at the camera. The warm light from the tablet flickers very faintly on their faces. {LIVE} {RIGID} {KEEP}""")),
    "K_7.C5c": dict(image=vgen.kf("K_7.C5c.jpg"), duration=5, prompt=_p(f"""
        A woman and a man lean together, both looking down at a tablet that he holds in both hands. The woman on the
        left waggles the fingers of her raised hand in a tiny wave at the screen, laughs softly, presses her other
        hand against her chest and tips her head toward his shoulder. The man smiles, blinks, swallows, and his eyes
        shine behind his glasses; he tilts the tablet very slightly toward her. Neither of them ever looks at the
        camera. The warm light from the tablet flickers very faintly on their faces; the leaves in the violet-lit
        chamber behind them tremble a little. {LIVE} {RIGID} {KEEP}""")),
    "K_7.D3d": dict(image=vgen.kf("K_7.D3d.jpg"), duration=5, prompt=_p(f"""
        Seen from behind, crewmates stand close together watching a large wall screen. The dark-skinned hand of the
        woman on the left is settling onto the shoulder of the small woman with the long black ponytail in the
        centre: its fingers close gently over her shoulder, squeeze once, and the thumb strokes it. The woman in the
        centre leans very slightly toward that hand and tips her head up a little toward the screen; her ponytail
        sways a touch. The others shift their weight and breathe. On the wall screen the little girl in white,
        hanging on wires, drifts slowly upward toward the round paper moon, her long ribbons streaming and rippling.
        Warm light from the screen flickers gently on their hair and shoulders. {LIVE} {RIGID} {KEEP}""")),
    "K_7.D3e": dict(image=vgen.kf("K_7.D3e.jpg"), duration=5, prompt=_p(f"""
        Close on two men watching something off-screen to the right. The nearer man with the moustache is deeply
        moved: his eyes shine and well up, he blinks slowly, swallows hard, his chin trembles slightly under his
        knuckles, and a small unsteady smile comes; one tear rolls down his cheek. The man behind him smiles slowly
        and quietly to himself and gives a very small nod. Both keep looking to the right, never at the camera. Warm
        golden light from the right flickers softly over their faces, brightening and dimming a little.
        {LIVE} {RIGID} {KEEP}""")),
    "K_7.C3": dict(image=vgen.kf("K_7.C3.jpg"), duration=5, prompt=_p(f"""
        On the sofa under a blanket, a little girl watches a tablet resting on her lap. Her eyes follow the screen and
        widen, her lips part into a growing smile, and her head bobs gently in time with music; the small fingers of
        her hand on the corner of the tablet tap lightly; her other hand slowly strokes the cat's fur. The long-haired
        cat beside her blinks slowly, one ear twitches and its tail tip curls. Cool bluish light from the screen
        flickers on her face, changing in brightness. She keeps the same small size, face and clothes; natural,
        child-like, physically plausible motion; exactly two hands. {LIVE} {RIGID} {KEEP}""")),
    "K_7.C3b": dict(image=vgen.kf("K_7.C3b.jpg"), duration=5, prompt=_p(f"""
        Over the shoulder of a little girl who is watching a tablet. Her head bobs very gently in time with music and
        tilts a little; a few loose curls stir; her fingers on the edge of the tablet tap once. With her other hand
        she slowly strokes the cat's back; the cat's ear twitches. The tablet stays perfectly still and the picture on
        its screen stays exactly as it is. Cool blue light from the screen flickers softly on her hair, her cheek and
        the blanket. Exactly two hands. {LIVE} {RIGID} {KEEP}""")),
    "K_7.C2": dict(image=vgen.kf("K_7.C2.jpg"), duration=5, prompt=_p(f"""
        A downstairs play room, a dance-pad game, seen from behind. The father stands right behind his son on the
        floor dance pad, holding the boy's forearms, and the two of them step together in a steady rhythm, about two
        steps per second, onto the glowing arrow panels: left, right, left, right, knees soft, bouncing lightly. Both
        keep facing the TV, where blurred coloured arrows scroll upward. In the foreground the little girl bounces
        on bent knees in the same rhythm, waving her fists in the air and laughing, looking down at her small toy
        robot. The toy is a small headless grey box on four thin legs: it stays reared up on its two hind legs on
        the same spot, rocking its weight from side to side and pawing the air with its two front legs in short,
        slightly jerky strokes. The toy keeps exactly its small size and shape: it never grows, never gets a head,
        a face or a tail, and never jumps. The children keep their size, faces and clothes; natural, child-like,
        physically plausible motion. {LIVE} {RIGID} {KEEP}""")),
}


def main():
    vgen.SHOTS.update({k: dict(model=H3, **v) for k, v in CALLS.items()})
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    args = [a for a in sys.argv[2:] if not a.startswith("--")]
    opts = {a[2:].partition("=")[0]: a[2:].partition("=")[2] or True for a in sys.argv[2:] if a.startswith("--")}
    if cmd == "submit":
        model = {"h3": H3, "sd2": SD2}.get(opts.get("model", "h3"), opts.get("model"))
        for s in args:
            assert s in CALLS, f"not a calls shot: {s}"
            over = {"model": model}
            for j in vgen.submit(s, opts.get("res", "720p" if model == SD2 else "768P"), int(opts.get("takes", 1)),
                                 "dry-run" in opts, opts.get("note", "rev Oct 7 calls"), over):
                print(j)
        print(f"spend so far (est): ${vgen.spend_total()}")
    elif cmd in ("collect", "wait"):
        import time
        t0 = time.time()
        while True:
            p = vgen.collect(args or sorted(CALLS))
            if cmd == "collect" or not p or time.time() - t0 > float(opts.get("timeout", 2400)):
                print("pending:", p)
                break
            time.sleep(30)
    elif cmd == "list":
        for k in CALLS:
            print(k, [n for n, _ in vgen.takes(k)])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
