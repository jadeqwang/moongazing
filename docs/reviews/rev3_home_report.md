# rev3_home — the reunion (3:13) and the roof deck (1:52)

Working notes, written as the work goes (Oct 8 2026). Timestamps are cut v5. Owner blocks: 6.1 in
`render/src/sections/06_breakdown.js`; 8.2 and 8.2b in `render/src/sections/08_outro.js`.
Session note: the work was cut off by the usage limit at 14:25 and resumed at 17:31; nothing was lost.

## What Jade asked
- 1:52 (6.1): keep the idea; lit Moon brighter; Kenton turned further away; "make T's movement more fluid and natural,
  like maybe he starts earlier".
- 3:13 (8.2, 8.2b): keep Kenton in the picture, moving; move the rejoining tear off the children's faces; a proper
  close painting of the hug instead of the punch-in.

## What the v5 frames showed
- 6.1 (frames 2687–2774): T stands still with the flashlight low from 111.95 to about 114.4 s; the beam then exists,
  already on the Moon, within about half a second (113.8–114.6). Kenton is in profile: glasses, nose and beard show.
  The lit toy Moon is no brighter than the lyric beside it.
- 8.2 (frames 4642–4729): the seam of the two scroll halves lies at design y 560 (± 52 px of torn edge). At 193.9–194.6 s
  it runs through M's forehead and across T's chin and mouth. Kenton lowers his hand, takes one step and is then still;
  the push leaves him at 194.9 s. 8.2b (4729–4773) is the same take enlarged 1.9–2.0 times: soft, and the children's
  faces carry the enlarged roto line.

## Log

### Keyframes (images: `google/nano-banana-pro` edits, 3 calls, about 0.40 USD)
- `media/keyframes/K_8.2a.jpg` replaced (old kept as `K_8.2a_v1.jpg`): only the outline of T's cheeks and jaw, to
  sheet v3. Prompt `media/keyframes/work/rev3_home/p_82a_cheeks.txt`. Checked against the old file side by side: four
  people, poses, clothes, bag and shoes unchanged; his lower face is now as wide as his forehead.
- `media/keyframes/work/rev3_home/K_6.1_r6_a.jpg`: the roof deck with Kenton's head turned away (back of his curls and
  knot, the arm of his glasses, no eye, nose or mouth) and a brighter lit Moon with a small halo
  (`p_61_lit.txt`). Becomes `K_6.1.jpg` when the new take is prepped (the old one then goes to `K_6.1_v5.jpg`).
- `media/keyframes/K_6.1_dark.jpg` (= `work/rev3_home/K_6.1_r6_dark_a.jpg`, `p_61_dark.txt`): the same frame with the
  flashlight off (no beam, a dull grey ball). The take is generated from this, so the video model never has to draw a
  beam; beam and lit Moon are drawn afterwards on the tracked hand.

### Takes ordered (`tools/vgen_rev3_home.py`, all minimax/h3 768P; verdicts are in each take's sidecar)
| Take | Job | USD | Verdict |
|---|---|---|---|
| `K_8.2a/take_6` | `82_kneel`, 6 s | 0.48 | Alt. Whole action right, but Kenton's hair is a short crop from behind (the next shot shows his curls and knot). |
| `K_8.2a/take_7` | `82_stand`, 6 s | 0.48 | Rejected: he bends over the hug facing us, a second focal point. |
| `K_8.2a/take_8` | `82_kneel_hair`, 6 s | 0.48 | Alt. Hair right; he folds himself round all three and becomes the largest thing in the hug. |
| `K_8.2a/take_9` | `82_kneel_hair`, 6 s | 0.48 | **Pick for 8.2.** |
| `K_8.2b_close/take_1` | `82b_close`, 4 s | 0.32 | **Pick for 8.2b.** |
| `K_8.2b_close/take_2` | `82b_close`, 4 s | 0.32 | Alt, equally clean. |
| `K_6.1/take_8` | `61_arc`, 5 s | 0.40 | **Pick for 6.1**, played reversed. |
| `K_6.1/take_9` | `61_down`, 5 s | 0.40 | Rejected: the arm drops at once and then hangs. |

`tools/ffcheck.py` was not run as a whole (it rescores old takes); `ff_r` was written for these eight only
(0.95, 0.97 and 0.91).

**Found on the way, for everyone: the h3 takes are not drawn on ones.** `K_8.2a/take_9` and `K_6.1/take_8` repeat every
drawing for two frames, and the 4-second `K_8.2b_close` takes for three. Played at a rate that is not a whole multiple,
such a take steps unevenly or repeats a drawing even though `roto_holds.mjs` says "even" (it counts film frames, not
what is in them). I first wired 8.2b at rate 1 and the frame-difference series showed holds of 2, 4, 2, 4 frames. All
three shots are now timed in whole steps of the take's own drawings, and the series is even. Check with a
frame-difference list of the take itself before choosing a rate.

### 3:13 (8.2 and 8.2b) — DONE, wired, rendered and looked at
**(a) Kenton.** `K_8.2a/take_9`. He lowers his hand from his mouth, walks in from the doorway (real alternating steps),
crouches and kneels at the near edge of the hug with his back to us (curls and knot), one hand on T's back. He is in
frame for the whole shot; the old push to 1.5x is now a gentle one to 1.28x (`V82`). Looked at before prep: sheet of 16,
every frame f0–35 (run-in), every second frame f30–112 (his walk and kneel), two frames at full size (f40, f106).
M runs into Jade's arms by f10 with her face in view; T kneels in by f28; Jade's face never shows; hands at f106:
Kenton 1, T 1, M 1, Jade 1. Prep: `tools/roto_prep.py K_8.2a/take_9` (no keep, no patch, as before).

**(b) The tear.** It is the roto `tear` parameter `[y, drop, tilt, side]` (`render/src/roto/shader.js`, the same edge as
`scenes/plate.js`): two layers of the take, the upper half in place and the lower half dropped and tilted, rising until
the join on bar 107 beat 4. The edge is fixed on screen at `y` plus noise of at most 52 px; the picture moves under it.
At y 560 it ran through the middle of the picture. It is now at **y 790** (`TEAR82`), drop 200 px (`DROP82`): the edge
stays within y 738–842, which is floor, the bag and shoes, the children's legs and Jade's back. Before the join the
children's faces are never lower than about y 600. Checked on every frame from the cut to the join (4642–4674, sheet
of consecutive frames): the seam does not touch a face in any of them.

**(c) The close painting.** `media/keyframes/K_8.2b_close.jpg` is the take's own frame at the cut (frame 102), cut to the
close framing and restored at 2752 px by nano-banana-pro ("restore, do not redesign"), so heads, arms and hands are where
8.2 leaves them. A first attempt that asked for a repaint redrew the room, the style and T's face and was rejected
(`work/rev3_home/K_8.2b_close_a.png`). Hands in the painting: Kenton's on T's back, Jade's fingertips at T's side, T's
right hand on her sweater, M's two hands on her hair. Its own take, `K_8.2b_close/take_1`: one slow squeeze, M nuzzles
in, T presses closer, Kenton's hand moves on T's back, Jade's hair sways; the count of hands is the same in every
second frame f8–62. Prep: `tools/roto_prep.py K_8.2b_close/take_1` (it found faces in 52 frames; re-mouthing and
eye-lock stayed off).

**Wiring (`08_outro.js`: constants after `hug`, the 8.2 take layers, the 8.2b scene; fallbacks kept).**
- `T82`, the take's clock: 1x from frame 2 through the run-in and T's kneel, 2x for fourteen film frames from the join
  (take frames 34–62: the hug has settled, Kenton takes his first steps), 1x again to frame 102.
- 8.2b: `K_8.2b_close/take_1` from frame 13 at rate 1.5 (one of the model's drawings per two film frames), with a
  slight push. Without the pick it shows the painting as a still; the punch-in is only the last fallback.
- `picks.json`: `K_8.2a` → take_9, new `K_8.2b_close` → take_1. `docs/script.md` rows 6.1 and 8.2 updated.
- No lyric, HUD or card line was touched in either file.

**Looked at** (`render/out/rev3_home/f82/`, 193.0–199.3 s at half scale; clip `render/out/rev3_home/8.2_reunion.mp4`):
every frame 4640–4675, every fourth frame 4641–4733, every second frame 4724–4774 (the cut into the close and out to
the roof deck), one close frame at full size (4752), and the frame-difference series 4641–4775: a change on every
second frame throughout, spikes only at the three cuts, at the join and during the run-in.

**Falls short / to know.**
- The half-second offset rule is not kept in 8.2: the take starts two frames in, because M reaches her mother by
  frame 10. The take moves from its first frame and the rendered shot does too (frames 4642–4650).
- The 2x stretch (194.7–195.3 s) doubles Kenton's first steps and the hug's sway for 0.6 s. In frames it reads as a
  brisk step; I have not seen it at speed.
- While he walks (about 194.6–196.2 s) his head is above the frame: the take itself frames him from the shoulders
  down. He is whole again when he crouches.
- At the start he is as in v5: small in the doorway, facing us, for about a second.
- The seam no longer lies where the scroll tore at stage separation (y 560 in 4.4). The edge has the same shape.
- The close painting's line is a little heavier and brushier than the fine line of the wide.
- T's face in 8.2 is the roto redraw of the take; it reads round at half scale. Neither shot was looked at in 1080p.
- `K_8.2a.jpg` is now 2752x1536 (was 1536x864); the old file is `K_8.2a_v1.jpg`. `K_8.2a/roto/take_5` is older than
  the keyframe and can no longer be picked without re-prep.
- Not watched at speed with sound.

### 1:52 (6.1) — DONE, wired, rendered and looked at
**Take.** `K_6.1/take_8`, generated from the beam-off keyframe and played reversed. Looked at before prep: sheet of 16,
every second frame f2–96, a zoomed strip of the flashlight hand. The arm moves without a pause from f16 to f92
(reversed: up from the deck, across the tree, overhead, to the Moon), his head and shoulders turn with it, and Kenton
lowers M by about 0.15 of the frame height (reversed: lifts her). The model lit the lens from f46 on although told not
to (light on leaves and deck); that light is kept and the drawn beam follows it.

**Beam and lit Moon: `tools/beam_61.py` (new).** Run after `tools/roto_prep_rubbing.py`; it keeps un-lit copies
(`n_%04d.jpg`) so it can be re-run. Fist and toy Moon are tracked through the take; the beam direction is read off the
take where its lens is lit and from there swings in one eased arc to the tracked Moon. The light is a narrow cone with
a soft skirt: a little haze in the air and a dodge of whatever is inside it, so leaves, railing, M's arm and hair light
up as the beam crosses them and empty sky only greys. On the Moon: a shaded sphere (bright limb toward the flashlight,
far limb dark), a halo, spill on M's hand and wrist; her fingers stay in front.

**Prep.** `roto_prep_rubbing.py K_6.1/take_8 --key media/keyframes/K_6.1_dark.jpg --reverse --range 0:100 --prefer video
--region 0.0,0.08,0.74,1.0`, then `beam_61.py K_6.1/take_8`. (A first prep with the region starting at 0.12 left a
vertical edge in the lit leaves.) `picks.json` K_6.1 → take_8. `K_6.1.jpg` is the lit painting (still fallback);
the old one is `K_6.1_v5.jpg`.

**Wiring (`06_breakdown.js`, the 6.1 scene line and its comment only).** Rate 1 from prepared frame 12: the arm is
rising at the cut, the beam is on the Moon at prepared frame 77, 2.71 s into the shot, and the shot ends on the painted
frame. (A first version retimed the take at 1.4x and 0.8x; dropped because of the drawings-on-twos finding above.)

**Looked at** (`render/out/rev3_home/f61/`, 111.5–116.1 s at half scale; clip `render/out/rev3_home/6.1_roofdeck.mp4`):
every sixth frame 2686–2776, every second frame across the cut in on the first version, one frame at full size (2764),
and the frame-difference series: spikes only at the two cuts and where the Moon lights (2751).
- T moves in the first frame of the shot and does not stop until the Moon is found.
- The Moon starts to light at 114.58 s and is full at 114.67 s; 月 is sung at 114.665 s.
- The lit Moon is the brightest thing in the frame. Kenton shows the back of his head (curls, knot, one arm of his
  glasses).

**Falls short / to know.**
- For about 0.4 s (near 113.6–114.0 s) the beam points up from a flashlight that the take draws lying nearly level in
  his fist: the model turned his hand over without turning the flashlight end for end. The flashlight is 20 px long at
  film size and I could not see the mismatch at half scale; at 1080p it may show. Fix if it does: paint the flashlight
  itself along the beam in `beam_61.py`.
- Kenton's shoulder lifts only a little: he is below the beam's line, so only the skirt reaches him. M's hand, wrist
  and hair take the light.
- The last half second is close to still: the three hold the pose with a small sway while the camera finishes its
  tilt.
- The render log prints two "404" lines per page for this shot: the roto scene asks for an optional subject matte
  (`s_NNNN.png`) that the rubbing prep does not write, as with the v5 take. Frames are complete.
- Not looked at in 1080p; not watched at speed with sound.

## Files
- New: `tools/vgen_rev3_home.py`, `tools/beam_61.py`, `media/keyframes/K_6.1_dark.jpg`, `media/keyframes/K_8.2b_close.jpg`
  (+ `.txt`), `media/keyframes/work/rev3_home/` (prompts and rejected edits).
- Replaced (old kept): `media/keyframes/K_6.1.jpg` (`K_6.1_v5.jpg`), `media/keyframes/K_8.2a.jpg` (`K_8.2a_v1.jpg`).
- Edited: `render/src/sections/06_breakdown.js` (6.1), `render/src/sections/08_outro.js` (8.2, 8.2b),
  `media/gen/picks.json` (K_6.1, K_8.2a, K_8.2b_close), `docs/script.md` (rows 6.1, 8.2/8.2b).
- `node tools/lint_shots.mjs`: OK. Nothing committed. No full-film render.

## Spend
Video 3.36 USD of the 12 allowed (eight takes, table above). Images about 0.67 USD (five nano-banana-pro edits: T's
cheeks in the reunion keyframe, the roof deck lit and dark, the close painting twice). No codex.

## For Jade
- **1:52, the roof deck.** T now swings the flashlight from the first frame: its light climbs the tree, sweeps across the
  sky and finds the toy Moon as 月 is sung; the lit Moon is the brightest thing in the picture and Kenton has his back
  to us. Frame: `render/out/rev3_home/f61/f_002764.jpg`. Clip: `render/out/rev3_home/6.1_roofdeck.mp4`.
- **3:13, the reunion.** Kenton lowers his hand, walks in from the doorway and kneels beside the hug with his back to
  us, a hand on T's back; the camera no longer leaves him. Frame: `render/out/rev3_home/f82/f_004725.jpg`.
- **3:13, the tear.** The two halves of the scroll now meet low in the picture, across the floor and your back, and never
  cross a child's face. Frame: `render/out/rev3_home/f82/f_004660.jpg`.
- **3:17, the close hug.** A new painting made for this framing, with its own movement: one slow squeeze, Kenton's hand on
  T's back at the left edge. Frame: `render/out/rev3_home/f82/f_004752.jpg`. Clip for all of 3:13–3:19:
  `render/out/rev3_home/8.2_reunion.mp4`.
- **Choices that are yours.**
  1. At 3:14–3:16 Kenton is seen from the shoulders down while he walks in, and whole only when he kneels. If you would
     rather see all of him, the alternative is a wider picture with the hug smaller.
  2. At the very start of 3:13 he still stands small in the doorway facing us for about a second, as before. Say if
     you want him from behind there too; that needs a repainted opening frame.
  3. There is a second version in which he wraps both arms round all three of you (`K_8.2a/take_8`); I chose the one
     where he stays at the edge with one hand on T.
