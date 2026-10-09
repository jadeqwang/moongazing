#!/usr/bin/env python3
"""Oct 8 night (rev4 PHOTO): takes for shot 4.3 at 1:21.5, Jade in the capsule seat looking at the snapshot of M and T
(keyframe media/keyframes/jade/J_4.3p.png). Jade: "It makes more sense to do a shot of me looking longingly at a
picture of the kids without singing." Same commands as tools/vgen_rev4_home.py (helpers of vgen_rev3_home reused).

    .venv/bin/python tools/vgen_rev4_photo.py submit JOB [JOB ...] [--dry-run]     (JOB = a key of JOBS; one take each)
    .venv/bin/python tools/vgen_rev4_photo.py collect | sheets [J_4.3p/take_1 ...] | strip CLIP F0 F1 x0,y0,x1,y1 | spend
"""
import sys

import vgen
import vgen_rev3_home as r3

NOTE = 'rev4_photo Oct8'
SCENE = ("Inside a small crew capsule a few seconds after liftoff, painted in gold line on dark indigo paper. An "
         "astronaut is strapped into her seat, seen from just behind her left shoulder; her face is in near-profile "
         "behind the clear visor of her white helmet; she looks at a small snapshot of two children taped to the "
         "cabin wall at the right. The motion is already under way in the very first frame and never stops; nothing "
         "freezes. ")
PRINT = ("The snapshot is a PRINTED PHOTOGRAPH on paper: the two children on it are a flat printed picture and never "
         "move, never blink, never change expression; their faces stay exactly as painted in the first frame. The "
         "snapshot stays taped in the same place by the strip of tape at its top edge. ")
TAIL = ("Exactly one person. No hand or arm enters the picture. Her mouth stays closed the whole time: she does not "
        "speak, sing or smile. The helmet, the visor, the window and the cabin wall keep their shape; nothing warps, "
        "nothing appears or disappears. Camera fixed: no pan, no tilt, no zoom, no cuts. "
        + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
JOBS = {
    # the look: her head tips a few degrees toward the snapshot, a breath, a blink; the capsule trembles
    'look': dict(shot='J_4.3p', model='minimax/h3', res='768P', duration=4, image='media/keyframes/jade/J_4.3p.png', prompt=(
        SCENE + "The whole cabin trembles with the fine, steady vibration of the rocket engines: the harness strap on "
        "her shoulder, the loose folds of her suit and the free lower edge of the snapshot quiver very slightly, a "
        "millimetre or two, all the time. Pressed back in her seat by the acceleration, she slowly and continuously "
        "tips her helmeted head a few degrees further toward the snapshot, her eyes fixed on it with quiet longing. "
        "She breathes in slowly: her shoulder and chest rise a little and settle. Half-way through she blinks once, "
        "softly, and keeps looking at the snapshot. " + PRINT + TAIL)),
    # the same with light: the Sun comes round the window as the rocket rolls, a soft bar of light slides over the wall
    'light': dict(shot='J_4.3p', model='minimax/h3', res='768P', duration=4, image='media/keyframes/jade/J_4.3p.png', prompt=(
        SCENE + "The whole cabin trembles with the fine, steady vibration of the rocket engines: the harness strap on "
        "her shoulder and the free lower edge of the snapshot quiver very slightly all the time. As the rocket rolls, "
        "a soft pale bar of light from the round window slides slowly and steadily across the quilted wall, passes "
        "over the snapshot and goes on toward her helmet. Pressed back in her seat, she slowly tips her helmeted head "
        "a few degrees toward the snapshot and keeps her eyes on it; she breathes, her shoulder rising and settling; "
        "she blinks once. " + PRINT + TAIL)),
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
