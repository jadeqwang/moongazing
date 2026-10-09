# Third round, POLISH: consistency and finish items left by the finished owners

Owner: POLISH. Brief: `docs/REVISION_NOTES_OCT8.md`. Test renders: `render/out/rev3_polish/` (half scale, 2 workers).
Work files: `media/keyframes/work/rev3_polish/`. Nothing is committed. Judged from frames and strips only.
The session was cut by the usage limit at 14:25 and resumed at 17:31; items were then worked in the order 3, 4, 1a, 2,
5, 1b, 1c.

## Status at a glance
| Item | v5 time | State |
|---|---|---|
| 3 envelope type | 0:59 | **done, wired, rendered, looked at** |
| 4a five-column card | 0:20 | **done, wired, rendered, checked** |
| 4b roundel 180 | 1:45 | **done, wired, rendered, checked** |
| 1a lights-on plate | 2:23 | **done, wired, rendered, looked at** |
| 2 one rocket | 0:23 and others | **0:23 repainted and carried, wired, rendered, looked at; the others left (see item 2)** |
| 5 lyric at 1:22, HANDOFF row | 1:22 | **checked, no change needed; HANDOFF row corrected** |
| 1b tower height | 0:25 | **done, rendered, looked at** |
| 1c mast panel | 2:02 | **measured, no edit warranted** (see Findings and item 1c) |

## Findings so far (before any change)

### 1a, 2:23: what the model lights from this camera
From `media/guanghan/guides/7.B6_flat.png` (the model's own lit surfaces, 1920 x 1080): the cupola's glass dome; five
of the twelve portholes in the cupola's sill wall; one arched hub window (and a sliver of a second); four portholes on
the west tunnel; three on the south tunnel; one window on the south node. The mounds carry none. The model has no mast
lamps, road markers or rover lamps (`render/scenes/guanghan3d/build.js`: the only emissive exterior surfaces are the
dome, the sill portholes, the eight hub windows, the tunnel portholes, two windows per node and the garage door, which
faces east, away from this camera).

### 1c, 2:02: the mast panels of `K_7.A` measured
Panel lengths in the plate (px at 2000 wide), back to front: about 130, 142, 150, 157, 159, 146. Mast heights 335 to
360. No single panel stands out; the spread follows nearness to the viewer. The note "one mast panel is still long" in
`docs/guanghan_layout.md` section 8 predates the last regrade of the plate.

### 2: what each shot's rocket shows (current tree, full-size stills in `render/out/rev3_polish/survey/`)
The film's vehicle (`docs/script.md` "Vehicle & mission architecture", `docs/research_capsule_interior.md` line 32):
Long March 10 class, a 5 m core with **two** boosters of the same diameter, a Mengzhou-class capsule with the escape
tower directly on it, no fairing.

| v5 time | Shot | Source | Shows |
|---|---|---|---|
| 0:19 | 1.2 | engine (`scenes/jiehua.js` rocketPad) | core, two boosters, capsule with escape tower |
| 0:23 | 1.4a | `K_1.4a` + take_7 | a pointed cone on a stack with a skirt of four small strap-ons: the outlier |
| 0:27 | 1.6 | `K_1.6` | small white stack with a pointed nose beside the tower; booster count not readable |
| 1:12 | 3.8b | `K_3.8b_walkout` | white core, one orange-tipped booster visible on the near side, pointed nose |
| 1:17 | 4.1 | `K_4.1` cut out by the engine | core, two boosters, capsule with escape tower |
| 1:19 | 4.2 | `K_4.2` | climbing: core and two boosters as dark strokes above the plume |

## Item 3. 0:59, shot 3.5b: the print stays on the envelope through the turn

**What v5 and the wired state showed.** Frames 1424 to 1426 (`render/out/rev3_hands/f35/`): the envelope's front,
tilted about 60 degrees, with no print on it, because the track stopped at take frame 56 and 3.5b had no type layer.
Measuring the same frames found a second fault that was not on the list: **3.5b played six drawings a second.** Past
frame 56 `K_3.5_front/take_4` holds its drawings for one frame and three frames in turn (f81, f82 to 84, f85, f86 to
88 ...; frame differences in the take: 6.8, 12.7, 0.1, 0.1, 12.7, 15.2, 0.2, 0.1 ...). The redraw on twos takes the
even frames, so it showed every second drawing for four film frames (HANDS' render changes at 1427, 1431, 1435, 1439,
1443, 1447 only). The eight held frames at the end were the envelope already landed.

**What was changed.**
- `tools/paper_track.py`: new `--follow B` (with `--static N`). From frame N to B the envelope's face is fitted as a
  general quadrilateral: four lines fitted to the part of the paper's outline that no hand touches and intersected (so
  a corner under a hand is still found), or, when all four corners show, the paper's convex hull cut down to its four
  sharpest corners; whichever covers the paper better is kept. The corners keep their names by continuity with the
  frame before, not by sorting on height, which is what swapped them past 31 degrees. Each followed frame also carries
  `a`, the strength of the print (1 while the face is toward the camera, falling as it goes edge-on); after B the
  frames carry no quad. Frames 0 to 55 are byte-identical to the old track. Run for this take:
  `$MPY tools/paper_track.py K_3.5_front/take_4 env --static 56 --follow 89` (**this replaces `--static 56` alone in
  HANDS' list of things to re-run after a roto prep**). Result: long edge turned 15, 22, 32, 46, 72 degrees and face
  area 0.96, 0.86, 0.69, 0.44, 0.18 of flat at take frames 81, 82, 85, 86, 89; check sheet looked at for frames 58 to 90.
- `render/src/scenes/papertype.js`: reads `a` and multiplies the ink by it (three lines and a comment).
- `render/src/sections/03_verse2.js`, the 3.5b line, its comment and one new constant `T35B`: the shot now has the
  `envelopeFront` type layer, starts at take frame 81 instead of 87 and plays the take's own drawings (81, 82, 85, 86,
  89, 90, 93, 94, 97, 98, 101, 102) for two film frames each through a `time` function. So she is seen picking the
  printed envelope up and turning it, the print swings and foreshortens with the face, thins on the last sliver, and
  the shot ends on the two frames in which the envelope lands with its flap open. 3.5a and 3.5c are untouched.

**Checked.** `render/out/rev3_polish/35b_strip_consecutive.jpg` (every frame 1420 to 1447), three frames at native
size (`35b_three.jpg`), frame differences: a new drawing on every second frame from 1424 to 1446, none held longer.
No frame shows a blank front. The lyric at the top left is clear of the envelope in every frame. Clip:
`render/out/rev3_polish/35_envelope_540p.mp4`. Lint OK.

**The cut at 59.31 and the tail.** Both improved by the new offset, in the same take: the cut now goes from her hands
on the flat envelope (take frame 47) to the closer view of the same envelope just lifted and turned 15 degrees (frame
81), a cut on the action, where before it jumped to the envelope already edge-on; and the near-still tail is gone
because the shot ends as the envelope lands.

**Still short.** The envelope's top corner leaves the top of the frame for about eight frames while it stands on
edge (as before). The colour step into 3.5c that HANDS lists is unchanged. `docs/script.md` row 3.5 still describes
3.5b as starting edge-on.

## Item 4. Two type decisions

### 4a. 0:20, shot 1.2: the Chinese in five columns
`render/src/sections/01_intro_b.js`, the four `calli` lines of the 1.2 type block (now five) and their comment; the
English `card` line and the footer are untouched.
- Columns, right to left: 这一次， / 全世界的 / 航天计划 / 共建 at 72 px, the name 国际月球基地 at 80 px (it was 58 and 70).
  Keys `z12a, z12b, z12e (new, 航天计划), z12c, z12d`; column pitch 92 px, top at y 338 as before.
- Clearances measured on the full-size still (`render/out/rev3_polish/type/t_020.900.png`): the right-hand column ends
  about 260 px left of the tower's guy wire at that height and about 330 px left of the floodlight mast; the name
  column ends 38 px above the pad's ground line (the eight-character column used to end 46 px above it); the Moon is
  far to the upper right; the gap under the English is as it was.
- Timing unchanged in outline: columns start at +0.55, +0.9, +1.28, +1.65 and +1.9 s; the last is finished at +2.5 s.
- `type_reveal_check.mjs --from 17.3 --to 21.5`: 6 pieces, 0 flags (rises of 19 to 25 frames, falls of 5).
  Strip: `render/out/rev3_polish/12_strip.jpg` (every third frame 419 to 512).

### 4b. 1:45, shot 5.2: the roundel at 180
`render/src/sections/05_interlude.js`, the `stamp` line only: `size: 230` to `size: 180`, same centre (330, 300), same
landing. On BASE's plan it now sits about 460 design px from the nearest mast and well clear of the comms tower and
the label; it no longer outweighs the drawing. `type_reveal_check.mjs --from 104.7 --to 107.8`: 1 piece (the label),
0 flags. Strip: `render/out/rev3_polish/52_strip.jpg` (every frame 2516 to 2535, then every fifth);
still `render/out/rev3_polish/type/t_106.600.png`.

## Item 1a. 2:23, shot 7.B6: the lights are the model's

**What v5 showed** (`render/out/frames_v5_540/f_003530.jpg`): four smooth domes carrying about fourteen round lit
windows, twelve more on the tunnels, tower and node; HUD "LIGHTS 26 / 26".

**The plate.** `media/keyframes/K_7.B6.jpg` is one `google/nano-banana-pro` edit of the old plate (kept as
`K_7.B6_v1.jpg`; prompt in `media/genlog.jsonl`, tag `rev3_polish_B6`; history appended to `K_7.B6.txt`): every window
on a mound removed, the mounds repainted as heaped, hatched regolith (the same heaps as the 0:25 night plate), and
everything else kept. Same camera and framing as the guide `media/guanghan/guides/7.B6_line.png`: the cupola top, the
SW mound's top and the masts sit where the guide has them (checked by the numbers: SW mound 880 to 1240 px of 2000
against the guide's 893 to 1219, its top at 520 against 522).

**The lights.** `render/src/sections/07_drop.js`: the `WINDOWS` list (and its comment), a new `DOME` constant, the
order rule, three additions inside `habitatLights`, and `BEAT / 4` to `BEAT / 2` in the 7.B6 call. The HUD line itself
is untouched: it prints the list's length.
- Seventeen lights, the ones the model shows from this camera: the glass dome (drawn by the engine: the night is
  lifted off the glass, which takes the lamps' amber, the ribs stay ink, and it throws a soft glow on the roof), the
  five portholes of the cupola's sill wall (model: 5 visible), three arched hub windows (model: one whole and a
  sliver; the repainted heap in front is lower, so more of the hub wall shows), four portholes on the west tunnel
  (model: 4), two on the south tunnel (model: 3; the first is behind the painted heap), the south node's window
  (model: 1) and a small lamp at the node's hatch with its glow on the ground (not an emissive surface in the model,
  where the hatch is a vermilion door: it is the one light the painting has that the model does not).
- None on a mound, none on masts, the comms tower, roads or rovers: the model has no such lamps, so none were invented.
- They come on from the dome outward, one per eighth note (it was one per sixteenth for 26): the last at 3.6 s of the
  4.2 s shot. The HUD counts 00 to 17 of 17 and matches what is lit in every frame of the strip.

**BASE's list against the new frame.** Mounds without windows: yes. Light only from the hub's windows, the cupola, the
tunnel portholes and the node: yes, plus the hatch lamp. Six masts with two wings each, outside the mounds: yes (the
far-left pair overlap). Rover on the east road: yes. No comms tower in frame: correct for this camera (it is 1.5
degrees outside the left edge).

**Checked.** `render/out/rev3_polish/B6_strip.jpg` (cut in 3440 to 3446 frame by frame, then every few frames, cut
out 3540 to 3545), `B6_detail.jpg` (full size, all lit), `flicker_check.py` on the 111 frames. Clip:
`B6_lights_540p.mp4`. Lint OK.

**Still short.** The heaps are more peaked than the model's rounded shells (they match the 0:25 plate, not the 1:45
plan's soft rounded heaps). With 17 lights instead of 26 the shot is quieter; the dome carries it.

## Item 2. One rocket

**The film's rocket** is the one in the table under "Findings": a straight core, two boosters of the core's width
with pointed noses reaching a little under half its height, a conical crew capsule with a needle escape tower, no
fairing. The engine draws exactly that at 0:19 and 1:17, and the painted ascent at 1:19 shows core and two boosters.

**0:23, shot 1.4a, the outlier.** The old painting and the take both had a Soyuz shape (a tapering skirt of four
strap-ons under a bulbous shroud), taken from the Soyuz walkout photograph that served as reference for the crew.
- The pad was cut out of the keyframe (720 x 960 px around the rocket), and `google/nano-banana-pro` repainted only
  the rocket there, with the 1:17 rocket (`K_4.1`) as the design reference (prompt: `media/genlog.jsonl`, tag
  `rev3_polish_rocket`; inputs and result in `media/keyframes/work/rev3_polish/`). The result came back registered to
  half a pixel; only the pixels that changed inside the rocket's box (feathered) were put back, so the tower, its two
  arms, the masts, the floodlight beams and everything else are the old painting's own.
- Files: `media/keyframes/K_1.4a.jpg` (old kept as `K_1.4a_v6.jpg`); `K_1.4a_v7.jpg` = the emblem-less original
  `K_1.4a_v5.jpg` with the same rocket, and `tools/emblem_patch.json` now names it as `_orig` for this shot, so a
  re-run of the emblem tool keeps the rocket; the roto plates `key.jpg`, `key_orig.jpg`, `pkey.jpg` of
  `media/gen/K_1.4a/roto/take_7/` received the same patch through the measured keyframe-to-plate affine (their old
  versions are `media/keyframes/work/rev3_polish/take_7_*_before.jpg`).
- The take redraws the whole picture (its rocket was the old one), so the painted rocket is carried as a still kept
  region: `$MPY tools/roto_keep.py K_1.4a/take_7 --region "146,244 245,244 245,519 146,519" --still --feather 4`, and
  the 1.4a roto line in `01_intro_b.js` gained `keepOcc: false` (and a two-line comment). The camera of the take moves
  0.56 px, so a still region is exact. **After any `roto_prep.py` on this take: re-run that `roto_keep.py` line, then
  `emblem_patch.py K_1.4a`.** No new take; no video spend.
- Checked: `render/out/rev3_polish/14a_strip.jpg` (cut in 545 to 552, the shot, cut out 577 to 578) and
  `14a_rocket_consecutive.jpg` (the rocket alone on every frame 552 to 577): core, two boosters, capsule and tower in
  every frame, nothing boiling, no edge of the kept region visible; the four roundels are still on the chests.

**The other shots, left as they are.**
| v5 time | Shot | Why left |
|---|---|---|
| 0:27 | 1.6 | The rocket is about 25 px tall at 540p: a white stack with a pointed tip and shoulders at mid height beside the tower. It does not contradict the vehicle. The take is carried on M's hair region by KIDS; not touched. |
| 1:12 | 3.8b | White core with its pointed tip and one booster on the near side (the other would be behind the core from this angle). The booster's nose cone is tan where the others are white: a difference of colour 6 px wide at 540p, in the shot Jade singled out as the one she likes. Not touched. |
| 1:19 | 4.2 | Core and two boosters above the plume: agrees. |

## Item 5. 1:22, shot 4.3: the 我思念 column beside the sung close-up

Nothing in `04_hook.js` was changed. Rendered 81.2 to 83.2 s in the current tree and looked at every second frame
(`render/out/rev3_polish/43_strip.jpg`):
- **Placement** (x 290, y 110, size 180): the column stands on the cabin wall at the left, between about x 120 and
  300 and y 145 and 790 of the 1920 x 1080 frame. The helmet's rim begins at about x 455 at its nearest, so the type
  is 150 px or more from the helmet and further from the face; 念 ends above her shoulder ring. It crosses only the
  seat's line work, and its halo keeps it readable there.
- **Reveal**: 我 is sung on the cut, so it is whole on the shot's first frame (the rule for anything already sung at a
  cut); 思 and 念 are each brushed on their own onset (frames 1973 to 1979) and nothing of them shows before.
  `type_reveal_check.mjs --from 81.2 --to 83.1`: `zh-L10-c-我思念` rise 24 frames, ok, no EARLY flag. (The flags that
  run prints for 酒寒 and 你 are the edges of the test range cutting through those pieces, not faults.)
- `docs/HANDOFF.md`, the `r2_sung` row: now says the close-up is wired as `LS3c/take_7pm` and is rebuilt with
  `tools/ls_sung_prep.py LS3c/take_7 --portrait`.

## Item 1b. 0:25, shot 1.5: the tower against the mounds

**What v5 showed** (`f_000620`): the dome's top 2.2 mound heights above the ground (model: 10.8 m against 7.5 m, a
ratio of 1.44; 1.32 as seen from this low camera, where the hub stands behind the mounds).

**Done.** Only the tower was repainted, in two `google/nano-banana-pro` passes on an 880 x 660 px crop round it (each
pass makes it smaller by about a quarter; a measurable target was given: the dome level with the middle of the small
far panel beside it). The crop came back registered to 0.3 px and the tower's box was put back into the old plate with
a feathered edge, so both mounds' outer halves, the tunnels, all six masts, the comms tower, the Earth, the ground and
the sky are the old plate's pixels. `media/keyframes/K_1.5.jpg`; old plate kept as `K_1.5_v3.jpg`; history appended to
`K_1.5.txt`. The dome's top is now about 1.3 mound heights above the ground. Nothing in `01_intro_b.js` changed for
this (the shot reads the plate).

A first attempt on the whole frame (`media/keyframes/work/rev3_polish/K_1.5_e1.jpg`) shrank the tower but dropped one
solar mast; it was not used.

**BASE's list against the new frame:** six masts, six mounds' worth of heaps in view as before, comms tower at the
left, Earth on the horizon: unchanged. Tower height: now right.

**Checked.** `render/out/rev3_polish/15_before_after_620.jpg` (v5 above, now below), `15_strip.jpg` (cut in 598 to
603, the shot, cut out 643 to 646). No seam where the patch meets the old wash.

**Still short.** The tower stands in the open between two mounds, where the model's camera sees only the cupola
peeking over the SW mound; that is the old plate's composition and was left.

## Item 1c. 2:02, plate K_7.A: the mast panel

No edit. The six panels were measured (table under "Findings"): 130 to 159 px long on masts of 335 to 360 px, the
longer ones on the nearer masts, no single one out of line; all six crops were looked at side by side
(scratch `k7a_masts.jpg`). The plate's masts as a group are about 30 per cent taller against the base than the guide's
(`media/guanghan/guides/7.A_line.png`), all six alike; that is not the note and would mean redrawing all six, so it is
recorded here and not touched. `docs/guanghan_layout.md` section 8 now carries a round-three line for this and for
the three plates changed above.

## Spend
Images: five `google/nano-banana-pro` edits, **0.67 USD** (2:23 plate; 0:23 rocket; 0:25 tower, three, of which one
unused). Video: **0**. No codex.

## Files changed
- Code: `tools/paper_track.py` (`--follow`), `render/src/scenes/papertype.js` (`a`),
  `render/src/sections/03_verse2.js` (3.5b line, its comment, `T35B`), `01_intro_b.js` (the Chinese columns of 1.2 and
  their comment; `keepOcc: false` and a comment on the 1.4a roto line), `05_interlude.js` (stamp size),
  `07_drop.js` (`DOME`, `WINDOWS`, order, `habitatLights`, the step in the 7.B6 call), `tools/emblem_patch.json`
  (`_orig` and note of `K_1.4a`).
- Media: `media/keyframes/K_7.B6.jpg` (+ `_v1`), `K_1.5.jpg` (+ `_v3`), `K_1.4a.jpg` (+ `_v6`, `_v7`);
  `media/gen/K_3.5_front/roto/take_4/paper.json` and its `p_env_*.png`; `media/gen/K_1.4a/roto/take_7/` (`key.jpg`,
  `key_orig.jpg`, `pkey.jpg`, `keep.png`, `meta.json`).
- Docs: `docs/HANDOFF.md` (one row), `docs/script.md` (3.5b in row 3.5), `docs/guanghan_layout.md` (section 8),
  `media/keyframes/K_7.B6.txt`, `K_1.5.txt`.
- Lint prints OK after the last edit. Nothing committed.

## Not done, and why
- **2:02 mast panel:** not edited; the measurement does not show a long panel.
- **0:27 and 1:12 rockets:** left; too small to contradict the vehicle (item 2 table).
- **No watch at speed with sound**; everything is judged from frames, strips and frame differences.
- The 3.5b fault found on the way (six drawings a second from a take with uneven holds) may exist in other takes of
  the same model: `tools/roto_holds.mjs` counts holds by frame index and cannot see it. A check that compares the
  take's own consecutive frames would. Not written.

## For Jade
- **0:59.** The envelope keeps its print while she picks it up and turns it over (it used to go blank for three
  frames), the turn now plays at its real smoothness, and the shot ends as the envelope lands.
  Frame: `render/out/rev3_polish/f35/f_001428.jpg` (motion: `render/out/rev3_polish/35_envelope_540p.mp4`).
- **0:20.** The Chinese is in five columns, 这一次，/ 全世界的 / 航天计划 / 共建 / 国际月球基地, at the old large size, with the name
  largest. Frame: `render/out/rev3_polish/f12/f_000485.jpg`. **Your choice** (unchanged from before): whether this
  wording is the Chinese you want.
- **1:45.** The roundel is a fifth smaller, so the drawing of the base leads.
  Frame: `render/out/rev3_polish/f52/f_002560.jpg`.
- **2:23.** The mounds no longer have windows (they are under three metres of soil); the lights that come on are the
  ones the station really has: the dome first, then the tower's windows, the portholes of the two tunnels and the
  airlock node, seventeen in all, and the counter says so. Frame: `render/out/rev3_polish/fB6/f_003540.jpg` (motion:
  `B6_lights_540p.mp4`). **Your choice:** the shot is quieter with 17 lights than with 26; if you want more sparkle,
  the honest additions would be work lamps on the masts and along the road, which the station model would then get too.
- **0:23.** The rocket behind the walking crew is now the same rocket as at 0:19 and 1:17 (one core, two boosters,
  the capsule with its escape tower); it had four small boosters. Frame: `render/out/rev3_polish/f14/f_000562.jpg`.
- **1:22.** The 我思念 column was checked beside the sung close-up: it stands clear of the helmet and face and each
  character arrives on its own sung beat; nothing was changed. Frame: `render/out/rev3_polish/f43/f_001981.jpg`.
- **0:25.** The tower of the base at night is cut down to its true height against the mounds (it stood more than twice
  as high as them). Frame: `render/out/rev3_polish/f15/f_000620.jpg`
  (before and after: `render/out/rev3_polish/15_before_after_620.jpg`).
- **2:02.** The six solar masts of the gold plan were measured; no panel is out of line, so nothing was changed.
- **A choice across three shots:** the mounds are drawn as peaked, hatched heaps at 0:25 and 2:23 and as soft rounded
  heaps on the 1:45 plan. Both are heaped soil without windows; if you want one hand for all three, say which.
