# Round four, BASE: the masts on the plan (1:45), work lamps (2:23)

Owner: BASE. Brief: `docs/REVISION_NOTES_OCT8.md`, "Round four". Test renders: `render/out/rev4_base/` (half scale,
2 workers). Both shots are wired, lint prints OK, both were rendered and looked at as frames and strips. Nothing is
committed. Nobody has watched either clip at speed with sound: every judgement below is from frames.

**Frames that change because of this work, and no others:**

| Shot | Time | Frames (index = round(t × 24)) |
|---|---|---|
| 5.2, the plan | 104.92 – 107.60 s | **2519 – 2582** (64 frames) |
| 7.B6, the lights | 143.43 – 147.64 s | **3443 – 3543** (101 frames) |

The station model and layout were edited (lamps added, a drawing option for the plan). No other shot's frames change:
ten frames either side of the two shots and inside the build montage (2518, 2583, 2600, 3000, 3190, 3200, 3420, 3442,
3544, 3560) were re-rendered from the current tree and are byte-identical to cut v6.

## Job 1. 1:45, the plan: mast size

**She asked:** "it's better, but I think the solar masts were larger in the other artwork and this should match?"

### Measured first
The model (`render/scenes/guanghan3d/layout.js`): mast 20 m; two panels 9.0 m tall, 4.6 m across the pair, on the upper
half; mound 7.5 m high on a footprint 18 × 22 m. A mast is 2.67 mounds tall; a panel is 1.2 mounds tall.

| Picture | Mast against a mound | Panel height against a mound | Against the model |
|---|---|---|---|
| 0:25 (`K_1.5`, v6 `f_000615`) | 2.7 (far masts) to 3.8 (the near one, 85 m from the lens against the mound's 122 m) | 1.3 to 1.8 | Agrees: the model's guide for this camera laid over the painting fits it mast for mast. |
| 2:23 (`K_7.B6`, v6 `f_003540`) | 3.2 (near mast) | 1.45 | Agrees, same check. |
| 2:04, the build's mast cut (`f_003000`) | no mound in frame; the panel is 0.45 of the mast | | Drawn from the layout's numbers. |
| 2:12, the build's last cut, looking down at 33° (`f_003200`) | about 1.2 | not measured | Drawn from the layout's numbers. |
| **1:45, the plan in v6** (`f_002560`) | **0.94** (mast 166 px, mound 177 px on the plate) | **0.44** | The mast is exactly 20 m at plan scale. |

**So she is right, and the other pictures do not exaggerate.** They agree with the model. The plan was also "true",
and that was the trouble: seen from above a mound shows its whole 22 m footprint, so on the page it is taller than a
20 m mast drawn at the same scale. Every side view shows the mast two and a half to four mounds tall; the plan showed
it shorter than one. Its panels were also drawn as grey combs, where every other picture has pale gridded panels.

### What was done
- **The masts are drawn 1.4 times larger, from their true feet**, with the model's own proportions (two tall gridded
  panels on the upper half, tripod, and now the lamp head 6 m up: see Job 2). On the plate a mast is 233 px against a
  mound's 177: **1.32 mounds** (was 0.94); a panel is 0.59 of a mound (was 0.44) and 54 px across the pair (was 40).
  That puts the plan with the other picture that looks down on the station (2:12, about 1.2), not with the side views.
- **This is a drawing convention of this one sheet, recorded in the model**, not a change to the station: shot `5.2o`
  in `render/scenes/guanghan3d/shots.js` has `mastDraw: 1.4` (implemented in `build.js`), and the guide
  `media/guanghan/guides/5.2o_line.png` was re-rendered from it. The layout's mast is still 20 m, so the build montage
  and its "SOLAR MASTS · 20 M" are untouched.
- **Only the masts were redrawn.** `media/keyframes/work/rev4_base/k52_masts.py prep` lifts the six old masts off the
  rev 3 plate (kept as `media/keyframes/K_5.2_v2.jpg`) and lays the guide's masts in as plain line;
  `google/nano-banana-pro` traced those six in the plate's ink (`media/guanghan/gen/K_5.2r4_v2.jpg`); `finish` takes
  only the six mast boxes from the result (registered to 0.04 px) and feathers them into the old plate. Mounds, tower,
  tunnels, roads, rovers, comms tower and paper are the rev 3 plate pixel for pixel. The roundel, the label and
  `05_interlude.js` are untouched.
- **Shadows:** each mast has a small soft wash under its tripod, like the wash already under the comms tower. (The
  first result gave them long cast shadows, which nothing else on the sheet has, and panels twice as wide as the
  model's: rejected.)
- **Lamp posts on the pad road:** four small ruled marks on the road's south verge at 65, 90, 115 and 140 m east (the
  model's bollards that fall on the sheet).

### Checked
`render/out/rev4_base/frames_plan/f_002560.jpg` at full size beside v6; a strip of the cut in, the reveal and the cut
out (2518 to 2583); the plate at full size round every mast; `flicker_check.py` 64 frames, 0 flagged. Stills:
`render/out/rev4_base/mast_compare.jpg` (the plan before and after beside 0:25, 2:23 and the two build cuts, with the
ratios), `plan_before_after.jpg` (the plan alone, closer), `stills/plan_full_106.667.png` (1080p).

### Still short
- **1.4 times is the most the sheet takes, and it is still far from the side views.** To stand 2.7 mounds tall on
  this sheet a mast would have to be drawn 57 m. Past 1.4 the two lower masts' panels touch the mounds in front of
  them (at 1.5 they kiss the wash at the mounds' edge, at 1.6 they overlap it by a corner), and the upper left mast
  closes on the comms tower. At 1.4 the lower left panel clears its mound's wash by about 10 plate px (7 px at 1080p).
- **One liberty with the model:** at this size the east mast's south-west foot would stand on the edge of the pad
  road, so on this sheet its tripod is turned 60° (one leg toward the hub). The mast is on its true spot
  (`mastNudge` in `shots.js`).
- The image model drew the front leg of each tripod slightly knobbly, and the poles are a firmer, darker line than the
  old sticks.
- The four lamp-post marks are ruled by the script, not brushed.
- `media/` is not in git: the new plate, the kept `K_5.2_v2.jpg`, the guides and the work script travel with the media
  folder, not with a commit.

## Job 2. 2:23, work lamps

**She chose:** "Add work lamps on the masts and along the road (The station model would get them too.)"

### The lamps (one source of truth: `L.lamps` and `lampList()` in `render/scenes/guanghan3d/layout.js`)
At the pole the Sun only grazes the horizon, so the ground between the mounds is in terrain shadow for most of the
month. Seventeen lamps light the places where people and rovers work:

| Lamp | Where | Light |
|---|---|---|
| 6 mast lamps (M1 to M6) | one head on each solar mast, 6 m up (under the slew ring at 10.1 m), on a 1 m arm toward the hub | a pool of 5.0 m radius round the tripod (40° half-angle) |
| 8 road bollards (R1 to R8) | south verge of the pad road, every 25 m from the jog (65, 14) to x = 240, the edge of the graded plateau; reflectors only beyond | 1.1 m tall, a pool of 4.0 m radius: the road's width |
| 1 airlock flood | over the garage door of the E mound (the main airlock) | 6.0 m radius on the apron |
| 2 hatch lamps | over the vermilion hatch of the N and the S node | 3.0 m radius. The S one is the hatch lamp the 2:23 painting already had. |

All are cut-off floods aimed straight down. **No air, so no halo:** a lamp shows only as the hard-edged pool it throws
on the regolith and as the hard shadows of what stands in that pool. They are neutral white where the habitat's
windows are amber, so the dome stays the one warm thing in the frame.

- **In the model:** `build.js` builds the fixtures (head and arm on each mast, bollards, flood, hatch lamps) and each
  lamp's pool, for stage 5 ("lights on") only. Every guide in `media/guanghan/guides/` was re-rendered from the
  model; the stage-5 exteriors now show the lamps (compared with the old files: 1.5, 5.2o, 7.A, 7.B6, 7.E1 differ).
  `docs/guanghan_layout.md` has the lamps in its structures table and a round-four entry.
- **In the film:** `render/src/scenes/worklamps.js` (new) projects `lampList()` through a shot's own model camera into
  the uv of its painted plate. Nothing is placed by hand: the pools land on the painted mast foot and along the painted
  road because the painting was made over the same camera.

### In the shot
- **What this camera sees.** From 125 m south-west and 14 m up, one mast lamp's pool is in the open: the near mast's
  (M4), lower right. The other five are behind mounds or outside the frame. The pad road runs off to the right behind
  that mast: three bollards (R1 to R3) are in frame, as thin pale ellipses because the road is seen at 4°.
- **How it is drawn** (`habitatLights` in `render/src/sections/07_drop.js`, my block only). Where a lamp's light lands
  the night is lifted off the painting, so the painted regolith shows, plus a little neutral light on top; the edge
  is hard and the pool is brightest under the head (cos³ falloff). Across the mast's pool lie the shadows of its pole
  (a wedge pointing away from the hub, because the lamp hangs 1 m hub-side of the pole) and of the three tripod legs.
  The pole itself stays dark in front of the pool and in front of the road lamp behind it: the camera is on the side
  away from the lamp. No lamp head glows: the camera is above the heads and sees only their hoods.
- **Order.** The habitat first, exactly as in v6 (dome, then outward, one per eighth note). The work lamps are a
  separate circuit on the off-eighths between windows: the mast lamp strikes at 2.15 s (frame 3495), then the road
  runs outward at 2.59, 2.81 and 3.03 s (frames 3505, 3511, 3516). The hatch lamp is still last, at 3.59 s.
- **HUD:** "HABITAT · LIGHTS 21 / 21": the 17 of v6 plus the mast lamp and the three bollards. It counts up one at a
  time and matches what is lit in every frame of the strip.

### Checked
A 20-frame strip across the shot with both cuts; every frame from 3489 to 3496 and every second frame to 3514 cropped
to the lower right (the strikes); `frames_lights/f_003540.jpg` beside v6; the 1080p still
`stills/lights_full_147.500.png` at full size; `flicker_check.py` 101 frames, 0 flagged.

### The other pictures of the station

| Time | Shot | Would the lamps be lit and visible? | Done |
|---|---|---|---|
| 0:25 | 1.5, `K_1.5` | Lit, yes (terrain shadow, windows on). But the camera stands at eye height, 2.2 m: the three pools in the open (M5, M4, M3) are slivers 3 to 6 px deep on a 2752 px plate, about 2 px at 540p, and the heads are 2 px dots. | **Not changed: known difference.** The plate has parallax, so the engine cannot pin an overlay to it; it would mean painting slivers into the keyframe for something nobody will see. |
| 1:45 | 5.2, the plan | A daylight drawing: the hardware, not the light. | **Marked:** a lamp head on each mast, four posts on the road. |
| 2:02 | 7.A0, the gold plan `K_7.A` | Daylight drawing; a lamp head would be under 3 px. | Not changed. |
| 2:03 – 2:12 | the build montage, `buildsite.js` | No. The lamps are fitted at stage 5, after the stages the montage builds, and its last cut ("LIGHTS ON", Day 097) shows the ground in full sun with long mast shadows: a pool does not show on sunlit ground. | **Not changed** (frames 3000, 3190, 3200 byte-identical to v6). Known difference: no lamp head on the gold masts (about 4 px there). |
| 2:40 | 7.C6, the north window | The ground outside is sunlit; the N hatch lamp faces away. | Not changed. |
| 2:56 – 3:01 | 7.E1, b, c, through the cupola glass | No: the regolith outside is in full sun (Sun 1° up, near-full Earth). The lamps would be off, or invisible. | Not changed. |
| 3:01 on | 7.E2, the pull-back | Gold plan plates, daylight convention. | Not changed. |

### Still short
- **One mast lamp, not a ring of them.** From this camera only the near mast's pool is in the open. The frame's right
  edge clips the third bollard's pool at the very end of the push, and a fourth shows as an edge sliver for a few
  frames; neither the fourth nor the far-right mast (out of frame) is counted.
- The pool is a clean geometric ellipse on a brushed ground: correct for a cut-off flood on graded regolith, but more
  regular than the ink round it.
- The road pools are drawn 1.7 times brighter than the mast's so they survive as 2 to 3 px slivers at 540p.
- No fixture is painted on the near mast: the plate was not repainted, and the head would be a dark box about 17 px
  wide against dark ground at 1080p.
- The hatch lamp keeps round three's soft round glow (it sits over a glow painted into the plate). It is the one
  light in the shot that is not a hard-edged pool.
- **For TYPE (not changed by me):** the line still reads "HABITAT · LIGHTS", and four of the 21 are now work lamps
  outside the habitat. "STATION · LIGHTS" would be truer.

## Files
- Model and layout: `render/scenes/guanghan3d/layout.js` (`L.lamps`, `lampList()`), `build.js` (fixtures, pools,
  `mastDraw`, `mastNudge`), `shots.js` (`5.2o`).
- Engine: `render/src/scenes/worklamps.js` (new); `render/src/sections/07_drop.js` (one import line; the `LAMPS` block
  and four lines inside `habitatLights`; the two HUD lines of the 7.B6 block). `05_interlude.js`: not touched.
- Docs: `docs/guanghan_layout.md`, `render/README.md` (a "Work lamps" section), `media/keyframes/K_5.2.txt`.
- Media (not in git): `media/keyframes/K_5.2.jpg` (+ `K_5.2_v2.jpg`), `media/keyframes/work/rev4_base/`,
  `media/guanghan/gen/K_5.2r4_v1.jpg`, `_v2.jpg`, `media/guanghan/guides/*`.
- No change to `_lib.js`, `core.js`, `type.js`, `src/roto/` or `buildsite.js`.

## Spend
Video: none. Images: two `google/nano-banana-pro` calls, 0.27 USD (`media/genlog.jsonl`, tag `rev4_base_k52`). No codex.

## For Jade
- **1:45, the plan.** You were right: on the plan a mast came out shorter than a mound, where every side view shows it
  about three mounds tall. The six masts are now drawn 1.4 times larger, with the same gridded panels as elsewhere, a
  lamp on each, and four lamp posts along the road; nothing else on the sheet changed.
  **Still short:** they stand 1.3 mounds tall, like the look-down view at 2:12, not three like the side views; any
  larger and the two lower masts' panels run into the mounds in front of them.
  Frames re-rendered: 2519 – 2582. Clip: `render/out/rev4_base/plan.mp4` (1:41.3 – 1:50). Frame: 2560
  (`render/out/rev4_base/frames_plan/f_002560.jpg`). Before and after beside the other pictures:
  `render/out/rev4_base/mast_compare.jpg`.
  **Your choice:** leave them at this size, clear of everything, or go to about 1.6 times and let the two lower masts'
  panels overlap the edge of the mounds in front (as masts do in the side views).
- **2:23, the lights.** The station now has work lamps: one on every solar mast, a row of low posts along the road to
  the landing pad, a flood over the airlock door. In this shot the near mast's lamp comes on halfway through and
  throws a hard-edged pool of white light round its tripod, with the pole's and the legs' shadows across it; then three
  road lamps come on one after another, running away to the right. The counter ends on 21 / 21. The dome is still the
  only warm light and the brightest thing in the frame.
  **Still short:** from this side only one mast's pool is in view (the others are behind mounds), and the road lamps
  are thin slivers because the road is seen almost edge-on.
  Frames re-rendered: 3443 – 3543. Clip: `render/out/rev4_base/lights.mp4` (2:20 – 2:28). Frames: 3540 and 3500
  (`render/out/rev4_base/frames_lights/f_003540.jpg`, `f_003500.jpg`).
- **Elsewhere.** The lamps are not lit in any other shot: at 0:25 they would be two-pixel slivers seen from eye
  height; at the toast (2:56) and at the end of the build (2:12) the ground is in sunlight, where a lamp's pool does
  not show.
