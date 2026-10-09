#!/usr/bin/env python3
"""Oct 7 7.B1–B3 revision; isolated prompts, vgen spend logging, 16-frame review sheets.

Run with .venv/bin/python tools/vgen_rev_7B.py submit KEY / collect / sheets.
Does not change the shared vgen.SHOTS source file. Two takes per submitted shot.
"""
import json
import sys
from pathlib import Path

import vgen

ROOT = Path(vgen.ROOT)
KEYS = ('K_7.B1', 'K_7.B1_close', 'K_7.B2', 'K_7.B3')
STYLE = ' Exact first-frame composition and painted brushwork throughout, camera locked. No text, letters, logos, glyphs, seals or watermark. No morphing, new objects or extra limbs. Continuous motion already underway at frame zero; no frozen opening or mid-action pause.'
PROMPTS = {
    'K_7.B1': "Arjun is already continuously tipping a small flat scoop of pale fine lunar powder into his left-hand metal sample canister. His right wrist and forearm tilt the scoop, his left wrist subtly balances the canister and his torso leans with the reach while breathing throughout. Exactly two arms and two gloved hands. Indian geologist Arjun Raman, about 38, ink-black helmet stripe and arm band; clear bubble with helmet lamps and comms cap; face remains tiny and obscured by bright ground reflections, never detailed. Free-standing braced ballasted TRIDENT frame, 1.8m two-rail mast, 25mm auger, three dish pads. Yutu rabbit wheel-legged rover stays 3.5m away, joined ONLY by one slack ground cable; its mast light pans slightly toward his hands. Four woven wire-mesh wheels, ears edge-on. The cone is only 9cm of flour-fine ash-grey powder, sparse embedded ice glints. Nothing suspended in vacuum, no cloud or smoke. Suit and machine shape stay fixed; rails are rigid. No cave roof: black open sky, far thread of sunlit rim. Real TRIDENT uses a 1m long 25.4mm auger, 90–100rpm cutting and 15rpm withdrawal, nominal 100N weight on bit, 1.25mm/s feed, floating head on wire rope, footpad with passive bristle wheel and metal chute. The rover is light/power/carrier, never a drill mount.",
    'K_7.B1_close': "Close on the foot of the same independent TRIDENT-style lunar drill. From the very first frame the 25mm auger visibly rotates about its vertical axis, its spiral flights sweeping around the shaft continuously at a slow readable 15rpm withdrawal speed. It rises only a few millimetres as the passive black radial bristle wheel contacts the flights and visibly turns, flicking adhered pale flour-fine powder down the fixed short metal chute. Powder lands on the ONE 9cm cone. Sparse grains fall in short clean ballistic arcs and settle, none float or hang; no spray hose, smoke, mist, sparks or atmospheric dust. One coin-sized 25mm clean hole under the small curved pressed footpad. Two-rail mast, brace, amber flat ribbon cable and ballast bags are rigidly fixed. Gloved hand and thermos canister at right shift subtly with breathing but remain out of the rotating mechanism. Real TRIDENT: 25.4mm diameter 1m auger, footpad/passive brush/chute, wire-rope suspended head, 15rpm withdrawal, 90–100rpm cutting. No rover attached. Preserve slender true scale.",
    'K_7.B2': "First-person Jade Wang suited maintenance visit, no face. Exactly TWO grey pressure gloves and TWO white accordion forearms. Both gloves grip opposite points on the SMALL brass oxygen-line isolation wheel and from frame zero both wrists AND forearms move together in a continuous gentle clockwise turn, about 60 degrees over four seconds. Hands remain attached to the same rim points: fingers wrap and travel WITH the wheel, never slide through it. The wheel is mounted on the thin oxygen tubing on the separate gas skid, a metre from the closed reactor, its hub anchored. Closed cold-wall molten regolith electrolysis drum, squat 2m across 1.3m high, foil blanket/coolant jacket. Two thick flat electrical busbars, anode rod and lift; enclosed sloping feed auger; tiny palm-sized yellow-white sight glass on lid. No open port. The freshly cast orange ingot on a mould steadily dims a little as it cools; stays solid and unmoving. The small round pressure gauge needle moves gently as oxygen flow is isolated. Blank lockout tag remains attached. Pale blue dot emblem, celadon trim, no red. No steam, sparks, flame or haze. Current 3.6kA, oxygen 1kg/h, sealed core 1600C; an industrial electrical cell, not a fire furnace.",
    'K_7.B3': "Macro low camera across six small clear 3cm regolith cups on white wicks inside a sealed glove-port chamber. ONE 2.5cm true Arabidopsis rosette, six to eight thin spoon-shaped leaves flat on soil, muted green blades violet-purple rims/stalks. Plant and all cups remain absolutely fixed, leaves never sway or grow. ONE black gauntlet connected to Lúcia's left-side glove port is already smoothly sliding a small millimetre scale card sideways next to the plant from frame zero. It moves just two centimetres in four seconds, thumb/index keep the same grasp; remaining fingers curled, no extra hand. Lúcia Ferreira | Portuguese woman, about 34, light olive skin, dark-brown wavy hair tied back, warm restrained expression, white crew polo with pale cinnabar-pink collar stripe. Face upper right BEHIND the sealed chamber window, eyes at tray level observing the rosette, mouth and eyes keep sparse clean painted lines, no moustache or stray marks, no speaking. Small natural breathing shifts throughout, one quiet blink. Her exhalation makes a very faint local patch of condensation on the OUTSIDE window below her chin which clears gently, never steam inside or over the plant. Camera indicator blinks once. Chamber frame, gasketed lid, two glove ports facing scientist, lid LED, sensor, thin nutrient tube and top-down camera stay fixed. Small white inspection pool at plant; remaining scene matte gold lines on indigo. No succulent, lotus, flowers, decorative bowl or open glass lid.",
}
REFS = {
    'K_7.B1': ['media/chars/crew/SHEET.jpg', 'media/chars/robots/SHEET_yutu_v2.jpg', 'media/keyframes/work/rev_7B/drill_refs.jpg'],
    'K_7.B1_close': ['media/chars/crew/SHEET.jpg', 'media/keyframes/work/rev_7B/drill_refs.jpg'],
    'K_7.B2': ['media/chars/jade_suit/SHEET.jpg', 'media/keyframes/work/rev_7B/isru_refs.jpg'],
    'K_7.B3': ['media/chars/crew/SHEET_polo.jpg', 'media/keyframes/work/rev_7B/plant_refs.jpg'],
}
for key in KEYS:
    vgen.SHOTS[key] = dict(model='bytedance/seedance-2.0', image=f'media/keyframes/{key}.jpg', duration=4,
                           prompt=PROMPTS[key]+STYLE, refs=REFS[key])

_build = vgen.build_spec
def build_spec(shot, res, note='', over=None):
    spec = _build(shot, res, note, over)
    spec['input']['reference_images'] = ['file:'+str(Path(vgen.gen.ref_image(str(ROOT/r))).relative_to(ROOT)) for r in REFS[shot]]
    return spec
vgen.build_spec = build_spec

def sheets():
    import av
    import numpy as np
    from PIL import Image, ImageDraw, ImageOps
    for key in KEYS:
        for _, p in vgen.takes(key):
            side = json.loads(Path(p).read_text())
            if 'rev_7B Oct7' not in side.get('notes', '') or side.get('state') != 'done':
                continue
            with av.open(str(ROOT/side['file'])) as c:
                frames = [(float(f.time),f.to_image()) for f in c.decode(video=0)]
            idx = np.linspace(0,len(frames)-1,16).round().astype(int)
            sheet = Image.new('RGB',(1920,4*290+30),'#171b25')
            d = ImageDraw.Draw(sheet);d.text((8,8),f"{key} take_{side['take']} | 16 frames | inspect BEFORE roto",fill='white')
            for j,i in enumerate(idx):
                t,im=frames[i];tile=ImageOps.fit(im,(480,270))
                x=(j%4)*480;y=30+(j//4)*290
                sheet.paste(tile,(x,y));d.text((x+5,y+272),f'{t:.3f}s / f{i}',fill='white')
            out=ROOT/side['file'].replace('.mp4','_sheet16.jpg');sheet.save(out,quality=92)
            side['review_sheet16']=str(out.relative_to(ROOT))
            Path(p).write_text(json.dumps(side,indent=1,ensure_ascii=False)+'\n')
            print(out.relative_to(ROOT))

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'submit':
        for key in sys.argv[2:]:
            assert key in KEYS
            print(vgen.submit(key,res='480p',n=2,note='rev_7B Oct7 scientific restage; contact sheet approval before roto'))
    elif cmd == 'collect':
        print('pending:',vgen.collect(KEYS))
    elif cmd == 'sheets':
        sheets()
    elif cmd == 'spend':
        print(vgen.spend_total())
