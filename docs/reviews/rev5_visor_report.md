# Round five, VISOR: gold visor at 1:22 (shot 4.3), masts 1.6x on the plan at 1:45 (shot 5.2)

Owner: VISOR. Rules: `render/out/retime/RULES_R5.md`. Test renders: `render/out/rev5_visor/` (half scale).
Nothing is committed. Nobody has watched either shot at speed with sound: every judgement is from frames, strips of
consecutive frames and measurements. Times below are the film's NEW times (the retime went in while this was made):
shot 4.3 is now 1:20.3 to 1:21.7, shot 5.2 is 1:43.4 to 1:46.0, the old "1:15" shot (3.8f) is 1:13.8 to 1:15.1.

## Status
- **Fix 2 (masts 1.6x): DONE**, rendered twice (identical), lint OK.
- **Fix 1 (gold visor): DONE**, wired, rendered twice (identical), lint OK.
- **For the main session:**
  1. The full v8 pass rendered shot 4.3 at 00:29:10, before the gold was graded (00:30:12) and before the last
     `roto_keep` run (00:33:00). **Frames 1928 to 1961 of `render/out/frames_v8_540` are stale and must be rendered
     again** (checked: v8's `f_001940.jpg` differs from my final render; a second verify pass will disagree with the
     first there). Shot 5.2 is current in v8: its `f_002520.jpg` is byte-identical to mine (frames 2481 to 2543).
  2. **`/tmp` is full** (16 GB tmpfs, 100 %; 4.7 GB of it under `/tmp/claude-1000/-home-jade-Documents-moongazing`).
     That, not load, is why renders died at start with `CONTEXT_LOST_WEBGL` / `Target crashed` from about 00:30 on:
     the browser cannot write its temporary files. With `TMPDIR=<a folder on disk>` in front of
     `node tools/render.mjs ...` every render went through first time. I deleted nothing that was not mine.

## Fix 1. 1:20 (was 1:22), shot 4.3: the visor is gold, her face is hidden

**She ticked:** "This works" and "Make the visor gold as at 1:15, so my face is hidden". No note.

### What the shot shows now
The same shot: same take, same framing, same push, same type. The helmet's bubble, which was clear and showed her
profile, is the opaque gold sun visor of the 1:15 shot, down. Nothing of her face, hair or glasses is visible in any
frame. The helmet tips toward the snapshot as before.

### Method, and why this one
**The gold is one painted patch, carried rigidly.** The keyframe's bubble was repainted gold; the renderer shows that
painted patch in every frame, moved by a smoothed similarity transform (shift, turn, scale) tracked on the helmet.
Of the three ways offered this is the only one that guarantees no sliding, swimming or shimmer: the gold cannot change
from frame to frame because it is the same pixels every time.
- A new take from the repainted keyframe was not made: a video model would repaint the gold in every frame (moving
  highlights, a creeping edge are exactly what such takes do on a large smooth surface), and the shot she approved
  ("This works") would have been replaced by a different one. No video was spent.
- Drawing the visor in the roto data (the redraw's line and colour guides) would have left the gold to the palette
  snap and the take's own shading, which changes by frame.

What was found in the take on the way (it decided what the gold is tracked on):
- In the take **her face moves against her helmet by up to 14 work px** (the video model moved the head inside the
  helmet). Last round's patch followed the face; a gold visor carried on that motion would have slid on the helmet.
- The helmet itself is not rigid in the take: the bubble's front edge lags the shell by up to 6 work px, the frame
  strip creeps about 3 px against the shell. So the gold is tracked on the parts it is hinged to, **the white frame
  strip and the ear cup beside the visor** (`roto_keep --track`): there the carried edge stays within 2 work px
  (1.5 px at 540p) of the take's own edge, on plain white, where it cannot show. The carried patch is whole to about
  4 work px outside the bubble's outline all round and fades out by 12, so the take's bubble (and her face in it)
  is always underneath.
- Over the shot the visor's centre travels 23 px at 540p (its front edge 26), in steps of 0.5 to 1.2 px per frame,
  turning 1.7 degrees; scale changes by 0.3 %. The path's second difference is at most 0.3 px: no jerk.

### How it was made
1. `media/keyframes/work/rev5_visor/visor_gold.py prep`: the bubble (a polygon, checked against the painting) filled
   with the flat brass of the 1:15 visor. Her face is covered before the picture leaves this machine.
2. `google/nano-banana-pro`, that picture plus the 1:15 keyframe's helmet as the finish -> `gold_nbp_v1.jpg`: a matte
   brass dome, lighter band along the front edge, a few brushed streaks, nothing reflected. One call, first result
   used. No codex portrait pass (no likeness is painted).
3. `visor_gold.py finish`: only the bubble is taken from the result -> `media/keyframes/jade/J_4.3p_gold.png`
   (8 % of the frame differs from `J_4.3p.png`, all of it the bubble). `J_4.3p.png` itself is untouched.
4. **Same gold as 1:15, measured in the film, not in the keyframes.** The 1:15 visor is redrawn by the roto shader
   and comes out darker and browner than its keyframe; here the painting is shown as it is. First render: median
   RGB (120, 89, 48) against (85, 66, 45) at 1:15. The painting was graded (`GRADE` in the script) and re-rendered:

   | half-scale render | 10th pct | median | 90th pct |
   |---|---|---|---|
   | 1:15 visor (frame 1801) | (76, 58, 38) | (85, 66, 45) | (118, 95, 65) |
   | 4.3 visor (frames 1928, 1944, 1960) | (72, 55, 36) | (83, 65, 43) | (117, 94, 63) |

5. New take name `J_4.3p/take_1g`: a byte copy of `take_1s.mp4`. `roto_prep` and `roto_only` on it reproduce
   `take_1s`'s roto data byte for byte (325 files compared; only the keep data differs), so the rebuild order is
   verified. `visor_gold.py key J_4.3p/take_1g` lays the gold into its key plate (`key.jpg`; the plate as prepped is
   kept as `key_clear.jpg`; outside the bubble the plate differs by JPEG re-encoding only, mean 0.8 level).
   `roto_keep` carries the visor. Commands: `media/gen/picks.json`, `J_4.3p`.
6. `render/src/sections/04_hook.js`, the 4.3 block only: `clip: 'J_4.3p/take_1s'` -> `'J_4.3p/take_1g'`, the inline
   comment, five comment lines above. Nothing else. `take_1s` is intact: the clear visor is one word away.

### Checked in the render
- Shot 4.3 is frames **1928 to 1961** now. Rendered 80.28 to 81.75 twice: 35 frames byte-identical between passes.
  Then 79.0 to 83.0 for the clip. `flicker_check.py` on the 96 frames: 0 flagged. Lint OK.
- Every frame 1928 to 1959, the visor cropped (`evidence/visor_every_frame_1928_1959.jpg`): the same drawing in every
  frame, the streaks stay where they are on the dome, no face or hair at any edge, no flicker.
- First and last frame at twice size (`evidence/visor_native_first_last.jpg`): the gold meets the frame strip, the
  hinge, the blue rim and the neck seal cleanly at both ends of the move.
- Both cuts (`evidence/visor_cuts_1926_1963.jpg`); beside 1:15 (`visor_beside_115.jpg`).

### Does it still read as "she is looking at the photograph of the children"?
Yes, in stills, and I think more plainly than I expected. The visor is a large blank dome turned squarely at the
snapshot, the snapshot is in line with it and is now clearly the brightest thing and the only soft colour in the
frame (the graded gold is dark brass, close to the gold of the lines), and the helmet leans toward it through the
shot. What is lost is real, though: it now reads "an astronaut looks at a photograph of two children", not "Jade
looks at her children". The longing she asked for last round was in her lowered eyes; a helmet cannot long. The cut
that follows (the children at the splash park under 你) does that work now.

### Still short
- **Not seen at speed.** 1.4 s; whether the lean registers without a face to watch needs watching.
- The feeling is carried by the cut and the song, not by the picture (above).
- The visor's front edge is a soft dark line with a lighter band inside it; at 1:15 the edge is a brighter gold line.
- Nothing is reflected in the gold. At 1:15 the launch tower's reflection shows as pale streaks; here the streaks are
  only brushwork. A faint reflection of the snapshot would be physically right and was not attempted.
- The helmet's lean is a little larger than last round: the visor's front edge travels 26 px at 540p, where the
  take's own bubble edge travels roughly 20 (read off one overlay, not measured frame by frame). The gold follows
  the helmet's frame, which the take moves more than its front edge.
- As last round: the ear cup's redrawn gold contour runs double in places; no cabin vibration; the HUD line.
- `media/` is not in git: the gold keyframe, the take's roto data and the work folder exist only on this machine.

## Fix 2. 1:45, shot 5.2: the six masts at 1.6 times

**She chose:** "Larger still, about 1.6 times: the two lower masts' panels would overlap the edges of the mounds in
front, as masts do in the side views".

### What was done
- `render/scenes/guanghan3d/shots.js`, shot `5.2o`: `mastDraw: 1.6` (was 1.4), with a comment. Guide re-rendered
  (`cd render && node scenes/guanghan3d/render_guides.mjs --shots 5.2o` -> `media/guanghan/guides/5.2o_{line,depth,flat}.png`).
  The layout's mast is still 20 m; `mastNudge` (M2's tripod turned 60 degrees) is unchanged.
- Last round's plate kept as `media/keyframes/K_5.2_v3.jpg` (byte copy, made before anything was written).
- `media/keyframes/work/rev4_base/k52_masts.py`: `SCALE = 1.6` (rev 4's script kept beside it as `k52_masts_r4.py`,
  its inputs as `k52_input_r4.*`, `k52_nomasts_r4.png`). Three changes to the recipe, because a mast now reaches a
  mound (all in the docstring):
  1. `silhouette()`: the masts' own shapes from the model's flat guide. `prep` keeps the guide's line only inside
     them, so no mound outline or road edge of the guide comes along (at 1.6 both fell inside the old boxes).
  2. `prep` lays bare paper under the panels of M3 and M4 before the line goes in, so no hatching shows through.
  3. `finish` takes from the image model's result only the masts' silhouettes (grown 9 px) and the wash under each
     tripod (at 0.55 strength, none beside the panels), not whole boxes. The mounds beside M3 and M4 are the plate's own.
- Image model: `google/nano-banana-pro` twice on `work/rev4_base/k52_input.jpg` (tag `rev5_visor_k52`, rev 4's
  tracing prompt plus the overlap). `media/guanghan/gen/K_5.2r5_v1.jpg` rejected (the two lower masts' panels filled
  dark grey, the other four pale; streaked foot washes). **`K_5.2r5_v2.jpg` picked** (all six panels the same pale
  wash, round foot washes). Registered to the plate within 0.02 px.
- `media/keyframes/K_5.2.txt` and `docs/guanghan_layout.md` (the 5.2o row) say 1.6.

### In front or behind
On this sheet north is up and heights are drawn up the page, so the bottom of the sheet is toward the viewer. M3 and
M4 (the two lower masts, bearings 150 and 210) have their feet south of the SE and SW mounds, and their panels
(17 to 31 m up at this drawing size) are higher than a mound's top (7.5 m): seen from above nothing of a mound can
cover them. The model's own render agrees. So both panels are drawn **in front**: the panel is opaque, its outline
and grid unbroken, and the mound's hatching stops at the panel's edge. M4's upper right corner covers hatch ends and
wash of the SW mound (about 25 plate px in); M3's upper left corner covers the SE mound's wash by a few px.
No other mast reaches anything: M6's cap is about 30 plate px (10 px at 540p) below the comms tower's wash; M5's panel stands over
the two grey ground marks left of the W mound (they stop at its edge).

### Road and lamp posts
- M2 (east) is the mast beside the pad road. Its two lower feet stand north of the road: the west foot 8.6 plate px
  (3 px at 540p) from the nearest ink (the skirt of the E mound where the road leaves it), the south-east foot about
  20 px above the road's upper line. 60 degrees is still the best turn of the tripod (worked out from the feet's positions, not
  rendered: 70 puts the south-east foot on the road's line, 50 brings the west foot closer to the road's start). The wash under M2 is cut 12 px above the road line; the road is the plate's own.
- The four lamp-post marks are on the road's south verge, 65 to 140 m east; the nearest is 80 px from M2's feet.
  They are drawn by `finish` as before, at the same places.

### Measured
- On the plate a mast is 266 px against a mound's 177: **1.50 mounds** (1.32 last round, 0.94 before); a panel is
  120 px, 0.68 of a mound, 61 px across the pair.
- Against last round's plate (`K_5.2_v3.jpg`): outside the six mast boxes the largest difference is 6 levels, in
  32 pixels of 3.9 million (JPEG blocks at the box edges). 96 % of the plate takes nothing from the image model.
- Render: shot 5.2 is at 103.36 to 106.00 s after the retime (`shot_table`), frames **2481 to 2543**. Rendered
  103.32 to 106.04 twice (65 frames, 2480 to 2544), byte-identical between passes. `flicker_check.py`: 0 flagged.
  Lint OK. (Before the retime the same plate was rendered at the old time, 2518 to 2583, also twice and identical;
  the frame before and the frame after the shot were byte-identical to v7.)

### Other shots that show the station from above
`K_5.2` is read by one shot only (grep of `render/src`, `render/tools`, `release`: `05_interlude.js`, shot 5.2); no
video take was made from it (`media/gen` has no 5.2 folder). The label and roundel of 5.2 are type and a stamp over
the plate, untouched. 0:25 (shot 1.5, `K_1.5`), 2:23 (7.B6, `K_7.B6`), the gold plan `K_7.A` (2:02 and the
pull-back at 3:01) and the build montage are different paintings or drawn from the layout's numbers, and the
layout's mast is unchanged at 20 m: none of them was touched or needs re-rendering.

### Still short
- 1.5 mounds tall is still far from the side views (2.7 to 3.8). It is the sheet's limit now: the lower masts' feet
  are 20 px (at 540p) from the bottom of the frame at the end of the push.
- A faint grey edge lies along the right side of M3's panel (the image model's wash, inside the 5 px taken whole).
- M2's west foot is close to where the road leaves the E mound (3 px at 540p). It reads as clear, only just.
- The front leg of each tripod is slightly knobbly (as last round); invisible at film size.
- `media/` is not in git: plate, kept copies, guides and script travel with the media folder.

Stills: `render/out/rev5_visor/plan_before_after.jpg` (last round above: v7 old frame 2570; now below: frame 2532);
the masts at plate size: `render/out/rev5_visor/evidence/plan_masts_native.jpg`; clip
`render/out/rev5_visor/plan.mp4` (1:43.3 to 1:46.0, new song under it); frames `render/out/rev5_visor/frames_plan/`.

## Files
- Fix 1. New: `media/keyframes/jade/J_4.3p_gold.png`; `media/keyframes/work/rev5_visor/` (`visor_gold.py`, mask,
  input, reference, `gold_nbp_v1.jpg`); `media/gen/J_4.3p/take_1g.{mp4,json}`, `roto/take_1g/`, `frames/take_1g/`.
  Changed: `render/src/sections/04_hook.js` (4.3 block), `media/gen/picks.json` (`J_4.3p` -> `take_1g`, rebuild
  order), `docs/script.md` (row 4.3: description and take; its times are the main session's),
  `media/keyframes/jade/PROMPTS_J43P.md` (a rev 5 section).
- Fix 2. Changed: `render/scenes/guanghan3d/shots.js` (`5.2o`), `media/guanghan/guides/5.2o_*.png` (and
  `cameras.json`, rewritten by the guide tool), `media/keyframes/K_5.2.jpg`, `media/keyframes/K_5.2.txt`,
  `media/keyframes/work/rev4_base/k52_masts.py`, `docs/guanghan_layout.md`. New: `media/keyframes/K_5.2_v3.jpg`,
  `media/guanghan/gen/K_5.2r5_v1.jpg`, `_v2.jpg`, `work/rev4_base/k52_masts_r4.py`, `k52_*_r4.*`, `k52_sil.png`,
  `k52_alpha.png`.
- Not touched: `_lib.js`, `core.js`, `type.js`, `src/roto/`, `analysis/`, `render/data/`, any tool in `tools/`,
  `05_interlude.js`.

## Spend
Video: none. Images: three `google/nano-banana-pro` calls, 0.40 USD (`media/genlog.jsonl`, tags `rev5_visor_k52`,
`rev5_visor_gold`). No codex.

## For Jade
- **1:20 (it was 1:22 before the retime): you, looking at the picture of the kids.** The shot is the one you said
  works; the only change is your visor. It is now the same opaque gold as in the shot where you pull it down at
  1:14, and your face cannot be seen in any frame. The gold is painted once and moves with the helmet as one piece,
  so it does not slide or flicker.
  **What you should know before you settle on it:** it still reads as an astronaut looking at a photograph of two
  children: the helmet is turned straight at the snapshot and leans toward it, and the snapshot is the brightest
  thing in the picture. But the longing was in your eyes, and those are gone; the picture alone no longer says who
  is looking or what she feels. The cut to the splash park right after has to say it. If you would rather have your
  eyes back, the clear visor is one word in one file.
  Also short: not yet watched at speed; the edge of the visor is a soft dark line where the 1:14 one has a bright
  gold edge; nothing is reflected in the gold.
  Shot id to re-render: **4.3** (frames 1928 to 1961 at the new timing).
  Clip with the song: `render/out/rev5_visor/visor.mp4` (1:19.0 to 1:23.0). Stills:
  `render/out/rev5_visor/visor_before_after.jpg` (last round above, now below),
  `render/out/rev5_visor/visor_beside_115.jpg` (the 1:14 helmet at the left, this shot at the right).
- **1:43 to 1:46 (it was 1:45): the plan of the moonbase.** The six solar masts are drawn 1.6 times their plan size,
  as you chose. A mast is now one and a half mounds tall (1.3 last round). The two lower masts stand in front of the
  mounds behind them: the top inner corner of each one's panel covers the edge of its mound, the left one clearly,
  the right one only just. Nothing else on the sheet changed. The masts are clear of the road and of the four lamp
  posts.
  **Still short:** one and a half mounds is still well under the side views (about three); the mast beside the road
  has one foot close to where the road leaves the mound (clear, only just); a faint grey edge lies along one panel.
  Shot id to re-render: **5.2** (frames 2481 to 2543 at the new timing).
  Clip: `render/out/rev5_visor/plan.mp4`. Still: `render/out/rev5_visor/plan_before_after.jpg` (last round above,
  now below).
