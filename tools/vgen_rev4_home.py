#!/usr/bin/env python3
"""Oct 8 night (rev4 HOME): takes for the reunion in which Kenton wraps both arms round all three (8.2, 8.2b).
Jade ticked "Kenton wraps both arms round all three". Same commands as tools/vgen_rev3_home.py (its helpers are reused).

    .venv/bin/python tools/vgen_rev4_home.py submit JOB [JOB ...] [--dry-run]     (JOB = a key of JOBS; one take each)
    .venv/bin/python tools/vgen_rev4_home.py collect | sheets [K_8.2a/take_10 ...] | strip CLIP F0 F1 x0,y0,x1,y1 | spend
"""
import sys

import vgen
import vgen_rev3_home as r3

NOTE = 'rev4_home Oct8'
HAIR = ("THE FATHER has thick curly dark-blond hair that falls to just above his shoulders, the top half tied back in a "
        "small loose knot at the back of his crown: whenever he is seen from behind we see the knot and a mass of loose "
        "curls covering his neck down to his collar; his hair never becomes short. ")
JOBS = {
    # 8.2 (3:13): the wrap, sooner and lower than K_8.2a/take_8 (which needs 100 frames, shows his profile for a few
    # frames as he bends and only one of his arms): both arms visibly round them, back to us, children's faces clear
    '82_wrap': dict(shot='K_8.2a', model='minimax/h3', res='768P', duration=6, image='media/keyframes/K_8.2a.jpg', prompt=(
        r3.HUG + HAIR + "At frame zero he is already lowering his hand from his mouth and striding out of the doorway. "
        "He crosses the wooden floor briskly in four long natural strides, each sock-foot really planting on the floor, "
        "leaning forward and sinking lower with every stride so that his head and curls stay inside the picture; he "
        "comes round to the near side of the kneeling boy, turning his back to the viewer as he arrives. The walk takes "
        "one and a half seconds. By the middle of the clip he has dropped onto both knees close behind the boy at the "
        "left of the embrace, his back to the viewer. He opens both arms wide and wraps them round all three: one long "
        "arm round the boy's shoulders and the little girl, the other arm reaching across the mother's back, both of "
        "his large hands clearly visible, one resting on the mother's far shoulder and one on the boy's upper arm. He "
        "draws all three in and bows his head so that his curls rest against the back of the boy's head. He stays low "
        "and at the left of the group: the boy's and the little girl's smiling faces stay fully visible to the viewer "
        "the whole time, never covered by his head, his shoulder or his arms. We only ever see his back and the back "
        "of his head, never his face or his profile. To the last frame the four of them rock gently together, his "
        "hands pressing and his shoulders moving with his breathing; nobody freezes. The bag and the shoes by the "
        "door and all furniture stay fixed." + r3.TAIL)),
    # 8.2b (3:17): the close painting of the wrap (K_8.2b_wrap.jpg = the wide take's frame at the cut, restored)
    '82b_wrap': dict(shot='K_8.2b_wrap', model='minimax/h3', res='768P', duration=4, image='media/keyframes/K_8.2b_wrap.jpg', prompt=(
        "A close view of a family embrace at home at night, painted on silk. The motion is already under way in the "
        "very first frame and never stops; nobody freezes. The embrace tightens in one slow, loving squeeze. On the "
        "left the father, seen only from behind, draws all three closer with his long arm that lies across the "
        "mother's back, his large hand pressing gently on her hair, and bows his curly head until his curls rest "
        "against the top of the boy's head; his shoulders rise and fall with his breathing. We never see his face. The "
        "boy's face stays toward us, fully visible, eyes closed and smiling: he presses his cheek closer against his "
        "mother's head and his small hand curls on her hair. The little girl at the right nuzzles in with a small "
        "happy wriggle, her face toward us, eyes closed, her arm tightening round her mother's neck. The mother is seen "
        "only from behind, her face never visible: she rocks them all very slightly and tilts her head toward the "
        "children, her long black hair swaying a little. Everyone breathes. The boy's and the girl's faces keep "
        "exactly the simple painted features and round cheeks of the first frame and are never covered. Every hand "
        "keeps its five fingers and stays on its own arm; no new hand, arm or person appears and nothing merges. The "
        "sofa, the windows and the kitchen stay fixed. Camera fixed: no pan, no tilt, no zoom, no cuts. "
        + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)),
    # 8.2b for the ALTERNATIVE wide take (K_8.2a/take_10): its frame at the cut, restored (K_8.2b_wrap10.jpg)
    '82b_wrap10': dict(shot='K_8.2b_wrap10', model='minimax/h3', res='768P', duration=4, image='media/keyframes/K_8.2b_wrap10.jpg', prompt=(
        "A close view of a family embrace at home at night, painted on silk. The motion is already under way in the "
        "very first frame and never stops; nobody freezes. The embrace tightens in one slow, loving squeeze. On the "
        "left the father, seen only from behind, draws all three closer with his long arm that lies across them, his "
        "large hand pressing gently on the mother's far shoulder, and bows his curly head a little toward the boy; "
        "his shoulders rise and fall with his breathing. He never turns: we see only the back of his head, never his "
        "face. The boy's and the little girl's faces stay toward us, side by side, fully visible, eyes closed and "
        "smiling: the boy presses his cheek against his sister's, and she nuzzles back with a small happy wriggle, "
        "her small hands patting her mother's hair. The mother is seen only from behind, her face never visible: she "
        "rocks them all very slightly and tilts her head toward the children, her long black hair swaying a little. "
        "Everyone breathes. The children's faces keep exactly the simple painted features and round cheeks of the "
        "first frame and are never covered by the father's head or arm. Every hand keeps its five fingers and stays "
        "on its own arm; no new hand, arm or person appears and nothing merges. The sofa, the windows and the teapot "
        "stay fixed. Camera fixed: no pan, no tilt, no zoom, no cuts. " + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)),
}
r3.JOBS = JOBS
r3.NOTE = NOTE

if __name__ == '__main__':
    cmd = sys.argv[1]
    args = [a for a in sys.argv[2:] if not a.startswith('--')]
    opts = {a[2:].partition('=')[0]: a[2:].partition('=')[2] or True for a in sys.argv[2:] if a.startswith('--')}
    if cmd == 'submit':
        for job in args:
            j = r3.register(job)
            print(job, vgen.submit(j['shot'], res=j['res'], n=1, dry='dry-run' in opts, note=f'{NOTE} {job}'))
        print('spend so far (est): $', vgen.spend_total())
    elif cmd == 'collect':
        shots = sorted({j['shot'] for j in JOBS.values()})
        for job in JOBS:
            r3.register(job)
        print('pending:', vgen.collect(shots))
    elif cmd == 'sheets':
        r3.sheets(args)
    elif cmd == 'strip':
        r3.strip(args[0], int(args[1]), int(args[2]), tuple(float(x) for x in args[3].split(',')), scale=float(opts.get('scale', 1)), cols=int(opts.get('cols', 12)), step=int(opts.get('step', 1)))
    elif cmd == 'spend':
        print(vgen.spend_total())
