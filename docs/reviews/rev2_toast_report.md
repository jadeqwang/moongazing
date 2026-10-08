# rev2_toast: the hands of the toast (7.E1b, 7.E1c), Oct 8 2026

Status: DONE (Oct 8, 08:56). Both shots re-keyed, re-taken, roto-prepped, wired, rendered and looked at. Not committed.

## What Jade asked (on `render/out/fullcut_v4_540p.mp4`)
- 2:58 (7.E1b, 176.73-178.48 s): "her hand holding the cup is facing the wrong way"
- 2:59 (7.E1c, 178.48-181.11 s): "both hands holding cups are holding them the wrong way (wrong hands)"

## Diagnosis, per hand (keyframes at full size + v4 frames f4242-f4346)
Rule used: a hand that wraps a cup has the four fingers going round one way and the thumb the other. Seen from above,
a RIGHT hand's fingers go counter-clockwise from the palm, a LEFT hand's clockwise. So for a person FACING the camera
the fingertips of the left hand point to screen-left (toward her own midline) and the back of that hand is on the
screen-right side of the cup; for a person seen FROM BEHIND, her right hand shows its BACK to the camera, sits on the
right / near side of its cup and its thumb lies over the near face of the cup pointing screen-left.

7.E1b (`media/keyframes/K_7.E1b.png`, before = `K_7.E1b_v2.png`)
| hand | whose | should be | drawn as | verdict |
|---|---|---|---|---|
| raised hand with cup, screen x 1240-1395 | Adaeze, arm from her left shoulder (screen right) | LEFT hand: fingers across the front of the cup with the tips toward screen-left, knuckles screen-right | fingers across the front with the tips toward screen-RIGHT, knuckles screen-left = a right hand on a left arm | WRONG (Jade's note) |
| curled hand at the collar | Adaeze, right | right hand, knuckle toward her cheek | right hand | ok |
| hand on her far shoulder | Chen, left arm round her | left hand over the shoulder, fingers forward | 4 fingertips over the shoulder | ok |
| hand with cup at the right edge | Layla; arm is on the screen-left side of her body = her RIGHT arm | right hand: fingertips toward screen-right | right hand, tips toward screen-right, arm leaves her right sleeve | ok (it is the same drawing as Adaeze's hand, which is why Adaeze's reads as a copy of it) |

7.E1c (`media/keyframes/K_7.E1c.png`, before = `K_7.E1c_v1.png`)
| hand | whose | should be | drawn as | verdict |
|---|---|---|---|---|
| hand on the celadon bowl (left cup) | Jade, who sits at the left with her back to us | her RIGHT hand, seen from behind: back of the hand to the camera | hand on the LEFT of the cup, thumb over the near face pointing screen-right, palm side toward us = a LEFT hand of somebody sitting behind the camera | WRONG |
| hand on the plain cup (right cup) | Lúcia, at the right, back to us | her LEFT hand, seen from behind | the mirror: a RIGHT hand of somebody behind the camera | WRONG |
Both forearms rise side by side from the bottom centre, so the pair reads as one unseen third person holding two cups.
The video take (K_7.E1c take_2) kept that all the way up.

Why it happened: the blockout mannequins have ball hands (no thumb, no fingers), so the image model had no information
about which way a hand faces and painted the commonest picture of "two cups clinking": a first-person view.

## What the blockout says (rule 5)
`render/scenes/blockouts/7.E1/toast.js` now has articulated cup hands (`cupGrip`: palm, thumb, four fingers wrapped
round the cup; switched on per view with `hands: true`; the ball-hand version is kept as `toast_v1_ballhands.js.bak`).
New views in `render/scenes/blockouts/7.E1/views/`: `E1b_hands_*`, `E1c_hands_*` (the grip of the new keyframe),
`E1c_hands_end_*`, `E1c_hands_side_*` (neutral grip), `hands_high_*` and `hands_front_*` (the bench pair from above and
from the glass). Render: `cd render && node scenes/blockouts/7.E1/render_views.mjs --views E1c_hands,E1b_hands --modes flat,line`.
- 7.E1b camera: Adaeze's left hand shows the back of the hand at screen-right and the fingers crossing the front of
  the cup toward screen-left; Layla's right hand is the mirror. The v1 painting had the same drawing for both.
- 7.E1c camera: with the cups where v1 had them (touching at the centre) the two real inner hands collide: a wrap grip
  always puts the fingers on the side the neighbour's cup would touch, so two inner hands cannot clink rim to rim from
  this angle, only knuckle to knuckle. So the shot is restaged without the clink: each woman lifts her cup with her
  inner arm from her own shoulder, and we see the backs of both hands.

## What changed
### 7.E1b keyframe
`media/keyframes/K_7.E1b.png` (v3). Adaeze's hand + cup mirrored about the wrist (PIL, `media/keyframes/_prompts_7E1/rev2/flip_e1b.py`),
box x 1226-1400, y 292-566; everything else pixel-identical. No image model was needed. Old files: `K_7.E1b_v1.png`
(no emblems), `K_7.E1b_v2.png` (as in v4). `K_7.E1b_v3.png` = new hand without emblems (the emblem tool's `_orig`).
Checked at 4x: left hand, 4 fingers across the front, tips toward her midline, thumb behind the cup, wrist seam invisible.
### 7.E1c keyframe
`media/keyframes/K_7.E1c.png` (v2, old = `K_7.E1c_v1.png`). Restaged, see `media/keyframes/K_7.E1c.txt` for the recipe.
Jade's RIGHT arm leaves her polo sleeve at the bottom left, Lucia's LEFT arm hers at the bottom right; backs of both
hands toward us, four fingers across the near side of each cup pointing inward, thumbs hidden behind the cups; celadon
cup left, grey-white cup right. Second pass: each arm swung 6.5 degrees outward about its shoulder (cups now at uv
0.40 / 0.60) because the first version's takes brushed the Earth. Checked at 3x: 4 fingers each, index on top (= right hand at left, left hand at right),
wrists continuous, sleeves join the shirts, plain and sill continuous (the first clean plate had a seam; rebuilt).
Images: 2 x google/nano-banana-pro edits = $0.27.

### Takes (tools/vgen_rev2_toast.py; prompts start from the Oct 7 ones, plus "the grip never changes / the backs of the hands stay toward the camera")
| take | model | verdict |
|---|---|---|
| K_7.E1b/take_3 | h3 768P | **PICK.** Adaeze's left hand holds its shape for all 124 frames (4 fingers across the front, tips toward her face); tear wipe 0.3-2.3 s, blink, smile; Chen and Layla steady. |
| K_7.E1b/take_4 | seedance-2.0 | error 7003 (the model refuses this keyframe, as on Oct 7); not billed |
| K_7.E1b/take_5 | h3 768P | spare: hands right; she opens her mouth wide after 2.7 s, cups drift to the corner |
| K_7.E1c/take_3, take_4 | h3, seedance-2.0 | REJECT: made from the first v2 keyframe (cups too close together); hands right, but the cups touch / cross the Earth's place |
| K_7.E1c/take_5 | h3 768P | **PICK** (final keyframe): arms lift until 3.4 s then hold with a tremble; backs of both hands to the camera throughout, 4 fingers each, no flip; cups pass either side of the Earth with black sky between |
| K_7.E1c/take_6 | seedance-2.0 | REJECT: hands right, cups stay closer and touch the Earth's place at 1.7-2.4 s |
Sheets: `media/gen/K_7.E1b/take_3_sheet16.jpg`, `media/gen/K_7.E1c/take_5_sheet16.jpg` (+ zooms looked at, see sidecars).
The old takes' sidecars (E1b take_2, E1c take_1/2) carry a `superseded` note; ffcheck re-scored them against the new
keyframes, so their original ff_r was written back by hand.

### Roto, emblem, picks, wiring
- `tools/roto_prep.py K_7.E1b/take_3 K_7.E1c/take_5`; `keySource` in both meta.json = the new keyframes.
- Emblems (7.E1b): `tools/emblem_patch.json` entry K_7.E1b now `take: take_3`, `_orig: K_7.E1b_v3.png`; re-ran
  `tools/emblem_patch.py K_7.E1b` (Adaeze's disc replaced, Chen's added; track sheet `render/out/rev2_toast/track/track_K_7.E1b.jpg`).
  Neither old take carried roto `keep` data, and K_7.E1c has no emblem in frame, so there was nothing else to re-apply.
- `media/gen/picks.json`: K_7.E1b -> take_3, K_7.E1c -> take_5.
- `render/src/sections/07_drop.js`, TOAST rows 7.E1b and 7.E1c only: new clip names, and `subject: false` on both.
  Why: with the default subject matte the redraw holed Jade's pale forearm against the pale plain (rectangular bites,
  frames 4296-4346 of the first render) and left a zig-zag step where Layla's arm meets her sleeve; redrawing the whole
  motion region removes both. `node tools/lint_shots.mjs` = OK after each edit.
- `docs/script.md`: 7.E1c row rewritten (no clink).

## Render and what I looked at
`cd render && node tools/render.mjs --frames 175-182.6 --workers 2 --scale 0.5 --framedir out/rev2_toast/frames`, then `--encode`.
- Clip with audio: `render/out/rev2_toast/toast_175.0-182.6_540p.mp4` (7.D4 tail -> 7.E1 -> 7.E1b -> 7.E1c -> 7.E2, 175.0-182.6 s).
- Frames: `render/out/rev2_toast/frames/f_%06d.jpg` (4200-4382).
- Looked at: cut in 4220-4222 and 4240-4244 (no dead start: her knuckle is already at her eye and the cup is moving at
  4242); 7.E1b every 3rd frame 4242-4281 + hand crops at 4242/4250/4258/4266/4274/4283; cut 4283-4286; 7.E1c every 3rd
  frame 4284-4344, full frames 4300/4316/4346, the cup-Earth gap at 4308-4323; cut out 4346-4348 (7.E2 starts clean).
- Hands to look at: `f_004258.jpg`, `f_004274.jpg` (7.E1b), `f_004300.jpg`, `f_004316.jpg`, `f_004346.jpg` (7.E1c).
- Continuity with the wide 7.E1 (f4240): there Jade already raises her right arm and Lucia her left with the cups
  apart, Layla her right, Adaeze her left: the two close shots now agree with it (the old 7.E1c did not).

## Spend
Video: $3.10 of the $12 budget (4 x h3 at $0.40, 2 x seedance-2.0 at $0.75; one errored seedance job refunded).
Images: $0.27 (2 x nano-banana-pro). Codex: not used.

## Not yet at the bar / to know
1. Nobody has watched the clip at speed: judged from frames, strips and contact sheets only.
2. 7.E1c, Lucia's hair: the take turns her loosely tied curls into a tighter plait as her head tips back (f_004316.jpg,
   right edge). Dark, at the frame edge, not the focal point; the bible says "wavy hair tied back".
3. 7.E1c grip: both hands hold the cup with the wrist cocked back so the back of the hand faces us and the fingers
   point inward (blockout `E1c_hands`). It is a real grip and reads clearly as right hand / left hand, but it is a
   slightly formal way to hold a cup; the neutral grip (`E1c_hands_side`: thumb over the near face pointing outward)
   is the alternative if Jade prefers it.
4. 7.E1c: the clink is gone (see "What the blockout says"). The script row says so. If the clink matters more than the
   camera, the way to keep it is a side-on or front camera, not this one.
5. 7.E1b: h3 lets Layla's forearm get paler after 3.5 s of the take; the shot uses 0.5-2.25 s, so it is not in the
   cut, but do not lengthen the shot on this take.
6. 7.E1c: cups in the keyframe sit a little higher than in the first frame of the old shot (they start at the
   mountain line, not below the horizon), so the lift is shorter: about one cup height in 2.6 s, continuous, then hold.
7. `K_7.E1c_v1.png` was copied with `cp -p` before the new file was written; `K_7.E1b_v2.png` is the v4-cut version.
