#!/usr/bin/env python3
"""Oct 9 (rev5 DESK): new takes for shot 3.6e at 1:05, Jade at her desk at night with headphones, writing.
Jade, round 4: "now the glitchiness is just lower down. can you have a video model help you?" The first frame is the
plate the film already shows (media/keyframes/jade/J_3.6e_desk.jpg = roto key of take_2: its frame 0 with the laptop
paper and the textbook page composited), on models that HOLD the first frame, so the whole figure can be drawn from the
take with no carried painting. Same commands as tools/vgen_rev4_photo.py.

    .venv/bin/python tools/vgen_rev5_desk.py submit JOB [JOB ...] [--dry-run]     (JOB = a key of JOBS; one take each)
    .venv/bin/python tools/vgen_rev5_desk.py collect | sheets [J_3.6e/take_4 ...] | spend
"""
import sys

import vgen
import vgen_rev3_home as r3

NOTE = 'rev5_desk Oct9'
IMG = 'media/keyframes/jade/J_3.6e_desk.jpg'
SCENE = ("An ink-wash painting on pale paper: late at night a woman with glasses and large over-ear headphones sits at "
         "her desk at the left, seen in profile, long dark hair lying over her shoulder and chest; she is writing in an "
         "open notebook with a pencil; a laptop and a desk lamp stand in front of her. ")
MOVE = ("Very small, quiet, natural motion, already under way in the first frame: her hand writes steadily with the "
        "pencil, small strokes; she breathes slowly, her shoulder and chest rising and settling a little; she blinks "
        "once. Half-way through, her eyes go to the laptop screen for a moment and return to the notebook; her head "
        "turns only two or three degrees with them, slowly, and comes back. ")
BODY = ("Her head, neck, hair, headphones and shoulders move together as one solid body. The headphones keep exactly "
        "their size and shape and stay seated on her head. Her hair lies still on her shoulder and chest and moves only "
        "with her body; no strand moves by itself. Her face, glasses and jaw keep exactly the shape of the first frame. "
        "Her mouth stays closed. ")
TAIL = ("Exactly one person. The laptop screen, the pages, the lamp, the books and the window do not change. Nothing "
        "warps, nothing appears or disappears. Camera fixed: no pan, no tilt, no zoom, no cuts. "
        + vgen.KEEP_STYLE + ' ' + vgen.NO_TEXT)
STILLER = ("Very small, quiet, natural motion, already under way in the first frame: her hand writes steadily with the "
           "pencil, small strokes; she breathes slowly, her shoulder and chest rising and settling a little; she blinks "
           "once. She keeps looking down at the notebook; her head nods very slightly, a degree or two, as she writes. ")
JOBS = {
    'sd_glance': dict(shot='J_3.6e', model='bytedance/seedance-2.0', res='720p', duration=4, image=IMG, prompt=SCENE + MOVE + BODY + TAIL),
    'h3_glance': dict(shot='J_3.6e', model='minimax/h3', res='768P', duration=4, image=IMG, prompt=SCENE + MOVE + BODY + TAIL),
    'sd_write': dict(shot='J_3.6e', model='bytedance/seedance-2.0', res='720p', duration=4, image=IMG, prompt=SCENE + STILLER + BODY + TAIL),
    'h3_write': dict(shot='J_3.6e', model='minimax/h3', res='768P', duration=4, image=IMG, prompt=SCENE + STILLER + BODY + TAIL),
}
# Seedance 2.0 refuses this plate without the virtual-avatar flag (7003 User Input Error on take_4, as on 7.B3 in rev2)
JOBS['sd_glance_av'] = dict(JOBS['sd_glance'], avatar=True)
JOBS['sd_write_av'] = dict(JOBS['sd_write'], avatar=True)
r3.JOBS = JOBS
r3.NOTE = NOTE


def register(job):
    j = JOBS[job]
    vgen.SHOTS[j['shot']] = dict(model=j['model'], image=j['image'], duration=j['duration'], prompt=j['prompt'], avatar=j.get('avatar', False))
    return j


r3.register = register

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
        for job in JOBS:
            r3.register(job)
        print('pending:', vgen.collect(['J_3.6e']))
    elif cmd == 'sheets':
        r3.sheets(args)
    elif cmd == 'spend':
        print(vgen.spend_total())
