#!/usr/bin/env python3
"""Oct 8, round four (ENV): takes for the envelope passage, 0:57.8-1:01.6 (shots 3.5a/b/c). Does not change the shared
vgen.SHOTS source. Both takes are given a painted FIRST and LAST frame (seedance-2.0), because a video model left to
invent the back of an envelope or the unfolding of a letter gets the paper wrong. The keyframes are painted over the
true-size paper blockout render/scenes/blockouts/3.5/blockout.py (US #10 envelope, US Letter sheet folded in three).

  K_3.5_front   first K_3.5_front (his hand lets go of the front), last K_3.5_back (the back, flap sealed with the sticker)
  K_3.5_letter  first K_3.5_letter (flap open, the folded packet half out), last K_3.5_letter_end (the letter open in her hands)

    .venv/bin/python tools/vgen_rev4_env.py submit KEY [--dur=4] [--v=a|b] [--dry-run]
    .venv/bin/python tools/vgen_rev4_env.py collect | spend
"""
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
NOTE = 'rev4_env Oct8'
TAIL = (' Camera locked straight above the desk: no zoom, no pan, no tilt, no cut. ' + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
PAPER = (" Real paper, handled by real hands: the envelope is stiff and holds a letter, so it stays one flat rigid "
         "rectangle of constant size the whole time: it never bends in half, never stretches, grows or shrinks, and "
         "never passes through a finger; fingers grip its edges, thumb on one side and fingers on the other.")
SPECS = {
    'K_3.5_front': dict(image='media/keyframes/K_3.5_front.jpg', last='media/keyframes/K_3.5_back.jpg', prompt={
        'a': ("Top-down on a walnut desk in warm lamplight: a man hands a woman a long blank cream business envelope "
              "and she turns it over at once. The motion is already under way in the first frame and never pauses. "
              "In the first half second the man's larger hand (navy cuff, at the right) lets go of the envelope's "
              "right end and slides out of the picture to the right; it never comes back. At the same time the "
              "woman's right hand comes up and takes the envelope's right end. Straight away, briskly, she turns the "
              "envelope over sideways like the page of a book: her left hand lifts the left end up toward the camera "
              "and carries it over to the right, the envelope pivots between her two hands and for an instant stands "
              "on edge, so that from above its face narrows to a thin line; then its back comes round and down and "
              "she lays it flat in the same place. The turn takes about one second and is finished two seconds into "
              "the clip. The back has a shallow curved flap sealed with one small round navy sticker. Then her left "
              "hand settles flat on the lower left corner and her right thumb goes to the right end of the flap's "
              "edge. The front of the envelope is blank cream paper: no writing ever appears on it." + PAPER +
              " After the man's hand has left there are exactly two hands, the woman's, five fingers each. The toy "
              "globe stays still."),
        'b': ("Top-down on a walnut desk in warm lamplight. The motion is already under way in the very first frame "
              "and never pauses. A man's larger hand (navy fleece cuff, at the right) has just handed a woman a long "
              "blank cream business envelope: within the first half second his hand lets go and withdraws to the "
              "right, out of the picture, for good. The woman, holding the envelope's left end in her left hand, "
              "brings her right hand to its right end and immediately flips the envelope over in one quick, easy, "
              "practised movement: the left end rises toward the camera, the envelope turns over sideways like the "
              "page of a book, passing through the moment when we see only its thin edge, and its back lands flat on "
              "the desk in the same place. The flip is quick: it begins before one second and is over by two "
              "seconds. Now the back is up: a shallow curved flap, sealed in the middle of its edge with one small "
              "round navy sticker. Then her left hand rests flat on the lower left corner of the envelope and her "
              "right thumb moves to the right end of the flap's edge to lift it. The front of the envelope is "
              "completely blank cream paper: no writing or marks ever appear on it." + PAPER +
              " After the man's hand has left there are exactly two hands, both the woman's, five fingers each. The "
              "toy globe at the left stays still."),
    }),
    # the letter is a Z-fold: the top third folded forward over the middle (blank back up), the bottom third folded back
    # underneath. a: packet out, top panel opens (first K_3.5_letter, last K_3.5_letter_mid). b: the bottom panel swings
    # down from underneath (first K_3.5_letter_mid, last K_3.5_letter_end). c: both in one take.
    'K_3.5_letter': dict(image='media/keyframes/K_3.5_letter.jpg', last='media/keyframes/K_3.5_letter_end.jpg', prompt={
        'a': dict(last='media/keyframes/K_3.5_letter_mid.jpg', text=(
              "Top-down on a walnut desk in warm lamplight: a woman takes a folded letter out of an opened envelope "
              "and begins to unfold it. The motion is already under way in the first frame and never pauses. The "
              "letter is ONE sheet of white paper folded in three: a compact flat packet, as wide as the page and a "
              "third of its height, blank white outside. Within the first second her right hand draws the packet the "
              "rest of the way out of the envelope and brings it down toward herself, in front of the envelope, while "
              "her left hand leaves the envelope and takes the packet's left end: she holds the closed packet level "
              "in both hands. Then, in one clear movement, she opens its top layer: her thumbs lift the near edge of "
              "the top layer and that third of the page swings up and away from her, like the cover of a book lying "
              "on its spine, hinged on the far crease, until it lies open pointing away from her. Now two thirds of "
              "the page are open, printed on the inside with a small round emblem and rows of fine grey lines too "
              "small to read; the last third stays folded back underneath, out of sight. She holds it like that. "
              "Real paper: its width never changes; a flat sheet with straight edges and one crisp straight crease, "
              "never a curved or pointed flap; it never stretches, grows or passes through a finger; nothing is "
              "printed on its outside. The envelope stays where it is, flap open, with its round navy sticker. "
              "Exactly two hands, five fingers each. The globe stays still.")),
        'b': dict(image='media/keyframes/K_3.5_letter_mid.jpg', text=(
              "Top-down on a walnut desk in warm lamplight: a woman finishes unfolding a letter. The motion is "
              "already under way in the first frame. She holds a white letter by its side edges; its top two thirds "
              "are open and printed with rows of fine grey lines, and its last third is still folded back underneath "
              "the lower part, hidden. At once, within the first second, that hidden bottom third swings out from "
              "underneath: hinged on the sheet's lower edge, it drops down toward her and opens flat, so that the "
              "page becomes one third longer at the bottom; her fingers let it go and smooth it. Now the whole page "
              "is open in her hands: three equal panels divided by two straight horizontal creases, printed with "
              "fine grey lines and a small signature at the bottom. For the rest of the clip she holds it and reads, "
              "her thumbs shifting very slightly, the paper breathing a little at its creases. Real paper: its width "
              "never changes, the two upper panels do not move or change, the new panel is a flat rectangle exactly "
              "as wide as the others; nothing stretches, grows or passes through a finger. The envelope behind it "
              "stays where it is, flap open, with its round navy sticker. Exactly two hands, five fingers each. The "
              "globe stays still. The printed lines stay fine, even and steady and never become readable words.")),
        'c': dict(text=(
              "Top-down on a walnut desk in warm lamplight: a woman takes a folded letter out of an opened envelope "
              "and unfolds it. The motion is already under way in the first frame and never pauses. The letter is "
              "ONE sheet of white paper folded in three: a compact flat packet, as wide as the page and a third of "
              "its height, blank white outside. Within the first second her right hand draws the packet the rest of "
              "the way out of the envelope and brings it down toward herself, while her left hand leaves the "
              "envelope and takes the packet's left end. Then she unfolds it in two clear movements. One: her thumbs "
              "lift the near edge of the top layer, and that third of the page swings up and away from her, hinged "
              "on the far crease, and lies open: two thirds of the page now show, printed inside with a small round "
              "emblem and rows of fine grey lines. Two: the last third, folded back underneath, swings down toward "
              "her and opens. Now the whole page is open in her hands, three flat panels divided by two straight "
              "horizontal creases; she holds it by its side edges, reading. The page is open by three seconds. Real "
              "paper: its width never changes; every panel is a flat rectangle with straight edges, never a curved "
              "or pointed flap; it never stretches, grows or passes through a finger; nothing is printed on its "
              "outside. The envelope stays where it is, flap open, with its round navy sticker. Exactly two hands, "
              "five fingers each. The globe stays still. The printed lines never become readable words.")),
        'd': dict(text=(
              "Top-down on a walnut desk in warm lamplight: a woman takes a folded letter out of an opened envelope "
              "and unfolds it. The motion is already under way in the first frame and never pauses. The letter is "
              "ONE sheet of white paper folded in three: a compact flat packet almost the size of the envelope itself "
              "(nearly as wide and nearly as tall as the envelope), blank white outside. Within the first second her right hand draws the packet the rest of "
              "the way out of the envelope and brings it down toward herself, while her left hand leaves the "
              "envelope and takes the packet's left end. Then she unfolds it in two clear movements. One: her thumbs "
              "lift the near edge of the top layer, and that third of the page swings up and away from her, hinged "
              "on the far crease, and lies open: two thirds of the page now show, printed inside with a small round "
              "emblem and rows of fine grey lines. Two: the last third, folded back underneath, swings down toward "
              "her and opens. Now the whole page is open in her hands, three flat panels divided by two straight "
              "horizontal creases; she holds it by its side edges, reading. The page is open by three seconds. Real "
              "paper: its width never changes and each of the three panels is exactly as tall as the closed packet "
              "was; flat rectangles with straight edges, never a curved or pointed flap; nothing stretches, grows "
              "or passes through a finger; nothing is printed outside. The envelope stays where it is, flap open, with its round navy sticker. Exactly two hands, "
              "five fingers each. The globe stays still. The printed lines never become readable words.")),
        'e': dict(text=(
              "Top-down on a walnut desk in warm lamplight: a woman takes a folded letter out of an opened envelope "
              "and unfolds it. The motion is already under way in the first frame and never pauses. The letter is "
              "ONE sheet of white paper folded in three: a plain white rectangular packet, as wide as the page and "
              "exactly a third of its height, so only a little smaller than the envelope's body; smooth and blank "
              "outside, with no seams or diagonal lines. Within the first second her right hand draws the packet the rest of "
              "the way out of the envelope and brings it down toward herself, while her left hand leaves the "
              "envelope and takes the packet's left end. Then she unfolds it in two clear movements. One: her thumbs "
              "lift the near edge of the top layer, and that third of the page swings up and away from her, hinged "
              "on the far crease, and lies open: two thirds of the page now show, printed inside with a small round "
              "emblem and rows of fine grey lines. Two: the last third, folded back underneath, swings down toward "
              "her and opens. Now the whole page is open in her hands, three flat panels divided by two straight "
              "horizontal creases; she holds it by its side edges, reading. Real "
              "paper: its width never changes; every panel is a flat rectangle with straight edges, never a curved "
              "or pointed flap; it never stretches, grows or passes through a finger; nothing is printed on its "
              "outside. The envelope stays where it is, flap open, with its round navy sticker. Exactly two hands, "
              "five fingers each. The globe stays still. The printed lines never become readable words.")),
    }),
}


def submit(key, dur, var, dry):
    s = SPECS[key]
    v = s['prompt'][var]
    v = v if isinstance(v, dict) else dict(text=v)
    image, last = v.get('image', s['image']), v.get('last', s['last'])
    vgen.SHOTS[key] = dict(model='bytedance/seedance-2.0', image=image, duration=dur, prompt=v['text'] + TAIL)
    orig = vgen.build_spec

    def patched(shot, res, note='', over=None):
        spec = orig(shot, res, note, over)
        spec['input']['last_frame_image'] = 'file:' + vgen.os.path.relpath(vgen.gen.ref_image(str(ROOT / last)), ROOT)
        return spec
    vgen.build_spec = patched
    try:
        return vgen.submit(key, res='720p', n=1, dry=dry, note=f'{NOTE} (sd, {dur} s, prompt {var}, first {image}, last {last})')
    finally:
        vgen.build_spec = orig


if __name__ == '__main__':
    cmd = sys.argv[1]
    args = [a for a in sys.argv[2:] if not a.startswith('--')]
    opts = {a[2:].partition('=')[0]: a[2:].partition('=')[2] or True for a in sys.argv[2:] if a.startswith('--')}
    if cmd == 'submit':
        for key in args:
            assert key in SPECS, key
            print(key, submit(key, int(opts.get('dur', 4)), opts.get('v', 'a'), 'dry-run' in opts))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        for key in SPECS:
            vgen.SHOTS[key] = dict(model='bytedance/seedance-2.0', image=SPECS[key]['image'], duration=4, prompt='')
        print('pending:', vgen.collect(list(SPECS)))
    elif cmd == 'spend':
        print(vgen.spend_total())
