# Third round, BASE: the station plan (1:45), the valve and gauge (2:15), the glovebox (2:18)

Owner: BASE. Brief: `docs/REVISION_NOTES_OCT8.md`. Test renders: `render/out/rev3_base/` (half scale, 2 workers).
All three shots are wired, lint prints OK, each was rendered and looked at as consecutive frames with its cuts.
Nothing is committed. Judged from frames and strips only: nobody has watched these at speed with sound.

## 1. 1:45, shot 5.2: the plan is now the same station as everywhere else

**She asked:** "I like having this art style for this intro shot to the International Moonbase but check the Three.js
model and the frames – this shot should have a consistent design".

### Where the old plate disagreed with the model
Checked by laying the model's plan (`media/guanghan/guides/5.2_line.png`) over the old plate
(`media/keyframes/K_5.2_v1.jpg`). Model numbers are from `render/scenes/guanghan3d/layout.js`.

| Item | Model | Old plate |
|---|---|---|
| Mounds | 6 heaped regolith shells: four quadrant ovals 22 × 18 m, east and west 17 × 20 m, 7 to 7.5 m high | 6, in the right places, but drawn as craggy Song rocks with overhangs (the "petals"), and the four inner ones about a quarter too small. No other frame of the film shows rocks. |
| Tower and cupola | Ø 9 m hub, 6.6 m high, with a Ø 7 m ribbed dome to 10.8 m | Drawn flat from straight above (concentric circles) while everything round it was drawn in elevation: two projections in one picture. |
| Solar masts | 6 on a ring of radius 55 m at bearings 030, 090, 150, 210, 270, 330; 20 m tall; two 2 × 9 m wings on the upper half | 6, but each a single flag-like panel on one side of a pole, two to three times too tall; the two southern ones stood at about 35 m, against the mounds (the layout rule is "never between them"); the two northern ones too far out. |
| Comms tower | bearing 345, 90 m out, 25 m tall | Almost due north, about half as far out, drawn twice too large. |
| Tunnels, end nodes, connectors | 4 tunnels in a cross, N and S nodes with vermilion hatches, 4 connectors | Correct. |
| Roads and cable | East road with one jog to the pad; south service road with the reactor cable beside it | East road correct; south road a faint smear; no cable. |
| Radiators, reactor, pad | 1 km south and 2 km east: off a sheet 331 m wide | Off the sheet too: correct. |
| Rovers | two Yutu rovers | none |
| Orientation | north (Earth) up | Correct. |

### What was done
- A new camera in the model, shot `5.2o` (`render/scenes/guanghan3d/shots.js`, a `shear` option in `main.js`): the
  true plan, north up, 5.8 px per metre, with every height drawn straight up the page at plan scale. This is the
  projection the old plate was reaching for (plan positions, things standing up), made exact. The hub is at
  (1040, 700) of 1920 × 1080 so the drawing clears the roundel at upper left and the label at lower left. Guide:
  `media/guanghan/guides/5.2o_line.png`, plus the cable from the build montage
  (`media/keyframes/work/rev3_base/K_5.2_guide.png`).
- The image model redrew the plate over that guide with a crop of the old plate as the style reference, then two
  edits (wash cloud off the ground, end nodes at true size, mounds hatched as soft heaps with rounded tops, a stray
  line removed). `media/keyframes/work/rev3_base/k52_finish.py` lifts one wisp of wash beside the title, deepens
  the ink to the old plate's weight and matches the paper tone to the old plate. Steps and rejected versions are in
  `media/keyframes/K_5.2.txt`. No text or seal is painted in; the old name is nowhere in the picture.
- Nothing in `05_interlude.js` was changed: the shot reads the new `media/keyframes/K_5.2.jpg`.

### Checked against the guide, item by item (guide laid over the final plate)
Tower at 345 / 90 m, right height: yes (its dish is drawn as a small ball at the top, not a dish facing Earth).
Six masts at the six guide positions, each with two wings on the upper half: yes. Hub with ribbed dome at the
crossing: yes. Four tunnels: yes. N and S nodes with one vermilion hatch each: yes, about a fifth larger than the
guide. Four connectors: yes. Six mounds on the six footprints: yes; the west mound runs about a tenth past its
outline, the others are within a few per cent. East road with its jog: yes. South road: yes; the cable shows as a
third line beside it only near the node. Two rovers at the guide positions: yes. North up: yes.

**Frames checked:** `render/out/rev3_base/5_2_strip_consecutive.jpg` (frames 2516–2545, the cut in and the reveal),
`5_2_strip_cut_out.jpg` (2577–2586), `5_2_sheet.jpg`, `frames_5_2/f_002560.jpg` at full size; `flicker_check.py`
75 frames, 0 flagged. Clip: `5_2_540p.mp4`.

**Still short.** The line is cleaner and more even than the old plate's brush; the mounds are hatched heaps, not
painted rocks, so the picture is a little cooler than the one she liked. The roundel is the heaviest thing on the
sheet (a flat dark disc beside fine ink line). For the TYPE owner, not changed by me: it sits on clean paper and
clears the nearest mast by about 130 design px; at 180 px instead of 230 it would sit more quietly.

### Other frames against the model (the model wins)
Judged from one v5 frame each beside the model's guide for the same camera.

| v5 time | Shot | Disagreement |
|---|---|---|
| 2:23 | 7.B6 `K_7.B6`, `f_003530` | The largest. The mounds are smooth domes with rows of round lit windows. The model's modules have no windows (they are under 2.5 to 3 m of regolith); light should come only from the hub's eight arched windows, the cupola, the tunnel portholes and the two node hatches. The HUD counts "LIGHTS 21 / 26" against those painted windows. |
| 2:56–3:01 | 7.E1, 7.E1c `K_7.E1`, `f_004226`, `f_004346` | Looking north from the cupola the model has the N tunnel running out to the N node with the NE and NW mounds either side. The paintings show open ground and hills only. In 7.E1c the comms tower stands large at the left edge, far nearer than 90 m. Masts M6 and M1 and the tower's side are right. |
| 0:25 | 1.5, `f_000620` | The tower is about twice too tall against the mounds (model: dome top 10.8 m, mounds 7.5 m). Counts and positions are right. |
| 2:02 | 7.A0 `K_7.A` | Known from round two: one mast panel is long. Pad and reactor are moved in by the scroll convention. |
| 1:50, 2:40 | 5.4, 7.C6 | Agree with the model. |
| 2:03–2:13 | build montage | Drawn from the layout's numbers: agrees by construction. |

## 2. 2:15, shot 7.B2: the valve turns one way, slowly; the needle trembles, then follows

**She asked:** "the hands on the valve shouldn't go back and forth, which doesn't make a lot of sense, but keep going in
one direction, and more slowly, and the needle on the gauge should be trembling a little bit, and then start slowly
moving (slightly lagged relative to the valve turning)".

**What v5 showed** (`render/out/frames_v5_540/f_003246…3287`): `K_7.B2/take_7` rocks both wrists a few degrees one way
and back, twice in the shot; the gauge needle is the painted one and never moves.

**What is in the shot now**
- **Direction.** A handwheel valve opens anticlockwise as you face the wheel. She is opening the oxygen line, so the
  wheel goes anticlockwise for the whole shot and the gauge downstream of it rises.
- **The hands** are a new video take, `K_7.B2/take_9` (Seedance 2.0, 720p, 5 s, prompted as slow motion): both gloves
  stay on the same two points of the rim and ride with it, the left glove going down and the right glove up, the four
  spokes turning from an upright cross toward an X, about 40° over the take. No reversal, no re-grip, the wheel stays
  small and round on its hub. The take draws on twos, so the film plays it at rate 1 from an even frame (22/24 s in,
  the turn under way); the shot shows about 15° of turn in 1.77 s. `take_10` (MiniMax h3) turns the same way but
  twice as fast and lets the ingot fade to black: not used.
- **The needle is drawn by the renderer** (`render/src/scenes/gauge.js`), so its timing is exact and repeatable. The
  painted needle was painted out of the keyframe first (`media/keyframes/work/rev3_base/b2_needle_out.py`; 850
  pixels inside the dial change, nothing else; the old keyframe is `media/keyframes/K_7.B2_v6.jpg`) and the take was
  generated from that needle-less frame, so there is only one needle. It is pinned to the dial through the same
  push-in as the picture.
  - From the first frame it trembles: two bands of seeded value noise in time (about 9 Hz and 3.7 Hz), ±4° peak, on
    ones. No random numbers: a frame is identical every time it is rendered.
  - The reading starts at 10 % of the scale. The seat is taken to open 0.2 s into the shot; the needle starts to rise
    0.3 s after that and follows as a first-order lag (time constant 0.35 s) on a slow ramp: it has climbed about 50°
    of arc (from about 8:25 to about 10:05 on the dial) by the cut, still rising. The tremble grows by a third once gas moves.
- **Framing.** The push goes a little closer and further left than before (zoom 1.12 → 1.28) so the dial is large
  enough for a tremble of a few pixels to read at 540p; the cell stays in the picture and the HUD lines stay clear of
  the pipe loop. The wheel and tube sizes are last round's and were not touched.

**Files.** `render/src/scenes/gauge.js` (new), `render/src/shots.js` (the scene is registered: one import, one name),
`render/src/sections/07_drop.js` (the 7.B2 shot block only; its HUD line is untouched), `media/gen/picks.json`,
`tools/vgen_rev3_base.py` (the prompts), `media/keyframes/K_7.B2.jpg`.

**Checked.** Before roto: 16-frame sheet, every second frame f8–f68 cropped to the hands, five zoomed frames, the
per-frame difference of both takes (no pop). After wiring: all 42 frames plus the cuts in and out
(`render/out/rev3_base/B2_strip_consecutive.jpg`), `B2_sheet.jpg`, the dial alone on every frame, six
gloves-and-wheel frames at full size; `flicker_check.py` 53 frames, 0 flagged. Clip: `B2_540p.mp4`.

**Still short.** The turn is slow enough that at 540p the spokes' rotation is subtle in the first half second; the
gloves' travel carries it. The busbars still carry no + / − marks (open from last round).

## 3. 2:18, shot 7.B3: is the glove too large, and does it belong to her

**She asked:** "is the expected size of that glove proportional to the size of the plant experiment? it reads as
large, but I don't know if my own expectation is off. and the hand doesn't quite read as attached to her arm and body
in the back (it doesn't need to be visibly connected, but her shifts in body movement should be congruent)".

### The size, with numbers
**The answer: the glove is not too large. Against the cups it is the size of a woman's bare hand in a thin glove,
and about half the size a heavy laboratory gauntlet would look. It reads as large because the experiment is truly
tiny (each cup is 3 cm across, the size of a bottle cap) and the hand is the nearest big thing to the lens.**

- **Real gloves** (sources in `media/ref/rev3_base/SOURCES.md`): the common one-piece glovebox gauntlet is made for
  an 8 in (203 mm) port, is 32 in long, hand size 9¾, in 0.4 to 0.8 mm butyl or Hypalon; small bench boxes use 6 in
  (152 mm) ports. A woman's bare hand is about 172 mm long and 76 mm across with 15 to 16 mm fingers; in a 9¾
  gauntlet it looks about 205 mm long, 115 mm across, with 22 to 24 mm fingers. The ISS gloveboxes (six NASA photos
  saved in `media/ref/rev3_base/`) use fabric sleeves with thin gloves at the cuff, so the hands there look
  hand-sized, and the port rings are clearly wider than an upper arm. NASA and ESA publish the work volumes of
  both ISS gloveboxes but not a port diameter; I could not find one.
- **The experiment** (`docs/companion_moon_experiments.md` §13): cups 30 mm wide and tall, rosette 20 to 30 mm,
  chamber 60 × 40 × 40 cm.
- **Measured in the frame** (keyframe px, 1672 wide): a far-row cup is 119 px wide, so 4 px is 1 mm at the depth
  where the fingertip touches the card. The forefinger there is about 50 px thick: **13 mm, 0.42 of a cup**. A bare
  finger would be 0.5 of a cup and a gauntlet finger 0.75. The hand is about 400 px from fingertip to wrist crease
  (3.3 cups; a bare hand laid flat is 5.7 cups, and this one is foreshortened and recedes) and about 160 px across
  (1.35 cups; bare 2.5, gauntlet 3.8). Her head is 320 px crown to chin. The right-hand port's opening is about 290 px
  high.
- **The blockout** (`render/scenes/blockouts/7.B3_glove/`, true sizes, Lúcia's mannequin at 1.64 m, camera matched
  to the painting: its cups come out at 124 to 141 px against the painted 119, its head at 366 to 380 px against 320)
  says a size-9¾ gauntlet would be 550 to 590 px long, 310 to 330 px across, with 90 px fingers, and an 8 in port
  470 px. The painted glove is 400, 160 and 50 px; the painted port corresponds to about 125 mm.
- **So nothing was rescaled.** Making the glove a true heavy gauntlet would double it and bury the plant. The port is
  on the small side of real (a 5 to 6 in port; a hand and forearm pass through it) and the black rubber fills it
  because a gauntlet's cuff is clamped round the port ring, which is correct. Two edits that enlarged the ports were
  made and not used: the image model redrew her face in one and reframed the picture in the other.

### The attachment
- **Geometry** (blockout, `out/hero_u1_labeled.png`, `side_u1.png`, `top_u1.png`, numbers in `out/measure.json`):
  she faces the camera from behind the wall, so the port at frame right takes her **left** arm. With her face 22 to
  25 cm behind the glass, her left shoulder is 42 cm behind the wall and 15 cm outboard of the port's centre, the arm
  crosses the wall 5 cm from the centre of the ring, and the card's far position is at 0.99 of her full arm length.
  She can only reach it by leaning in, so a lean toward the glass in the same beat as the reach is what the body must
  do. The keyframe already has the right arm in the right place; what was wrong was the motion.
- **What v5 showed** (`K_7.B3/take_11`, measured with `media/keyframes/work/rev3_base/b3_congruence.py`): the glove
  wanders 26 px while her shoulder moves 2 px; the speed of the glove against the speed of her face correlates +0.25,
  with the body about ten frames late. Two things moving independently.
- **Now:** `K_7.B3/take_16` (Seedance 2.0, 720p, 5 s), played at rate 1 from 0.5 s. She leans in and down as the
  gauntlet slides the scale card left until it rests beside the rosette's cup; the rubber sleeve creases at the port
  as her arm goes deeper. Glove speed against face speed: **+0.97 at zero lag**; her shoulder dips with it.
- **Fog:** dropped (the prompt forbids it; none appears).
- **Repairs to the take, both in the roto data, both checked in the render:**
  1. The take draws an upright sprout in the far-middle cup where the painting has a pin-head seed-leaf pair. It is
     static and nothing crosses it in the frames used, so the roto mask is zeroed there and the painting shows
     (`media/keyframes/work/rev3_base/b3_mask_sprout.py`).
  2. The card passes the rosette's cup, which made the roto redraw the rosette grey. The painted rosette is now
     carried as a second kept region (`tools/roto_keep.py`, still), so it keeps its green and purple.
  Her painted face is carried as before; the roundel was re-run (`tools/emblem_patch.json` now names take_16) and is
  on her chest in every frame checked. **After any `roto_prep.py` on this take: `b3_mask_sprout.py`, then
  `roto_keep.py` with the two regions in `meta.json`, then `emblem_patch.py K_7.B3`, then
  `cp -p media/keyframes/K_7.B3_v5.jpg media/keyframes/K_7.B3.jpg`** (the emblem tool rewrites the keyframe as a JPEG;
  round two kept it lossless).
- **Takes rejected:** 13 (her bare forearm comes through the port), 14 (the glove stretches across the tray and
  covers the rosette), 15 (three invented plants).

**Files.** `render/src/sections/07_drop.js` (the 7.B3 shot block and the comment above it; HUD line untouched),
`media/gen/picks.json`, `tools/emblem_patch.json` (one word), `render/scenes/blockouts/7.B3_glove/` (new),
`media/ref/rev3_base/` (six photos and `SOURCES.md`), `tools/vgen_rev3_base.py` and
`media/keyframes/work/rev3_base/vgen_specs.json` (prompts). The keyframe is unchanged.

**Checked.** Before roto: 16-frame sheets of all four takes, every fourth frame f12–f56 of take 16 cropped, the
motion numbers. After wiring: all 43 frames with both cuts (`render/out/rev3_base/B3_strip_consecutive.jpg`),
`B3_sheet.jpg`, the rosette and her chest across the shot, `frames_B3/f_003326.jpg` beside the v5 frame; per-frame
difference rises and falls smoothly (no pop); `flicker_check.py` 51 frames, 0 flagged. Clip: `B3_540p.mp4`.

**Still short.** As she reaches, about a quarter more sleeve shows inside the box; a real gauntlet is fixed at the
ring and would straighten rather than lengthen. The two ports are drawn at different sizes (the left about two
thirds of the right). The reach uses the whole shot, so she is still moving at the cut out.

## Spend
Video: six submissions, **3.80 USD** (limit 10): K_7.B2 takes 9, 10; K_7.B3 takes 13 to 16. No refunds. Images: eight
`google/nano-banana-pro` calls, 1.08 USD (five for the plan, one unused end pose for the valve, two unused port
edits). No codex.

## Not done
- The glovebox ports were not enlarged (see section 3): the numbers did not require it and both attempts damaged
  her face or the framing.
- The other frames that disagree with the model (table in section 1) are listed, not fixed: they belong to other
  shots.
- No watch at speed with sound.

## For Jade
- **1:45.** The plan of the base is redrawn in the same ink style from the 3D model, so it is now the station you
  see everywhere else: six soft mounds instead of rocks, six masts with two panels each on a wide ring, the domed
  tower at the crossing, the comms tower far to the north-north-west, both roads, two rovers.
  Frame: `render/out/rev3_base/frames_5_2/f_002560.jpg`. **Your choice:** the mounds are now hatched heaps where the
  old drawing had painted rocks; if you miss the rocks' brushwork, say so and the mounds can be repainted in that
  hand on the same footprints.
- **2:15.** The gloves now open the valve in one slow anticlockwise turn, and the gauge needle trembles from the
  first frame, then starts to climb a third of a second after the valve opens.
  Frame: `render/out/rev3_base/frames_B2/f_003270.jpg` (the motion: `B2_540p.mp4`).
- **2:18.** The glove is not too large: against the 3 cm cups it is the size of a bare hand in a thin glove, about
  half what a heavy lab gauntlet would look like; the cups are simply as small as bottle caps. Nothing was rescaled.
  Her body now moves with the glove: she leans in as she slides the card to the plant, in one beat. The breath fog is
  gone. Frame: `render/out/rev3_base/frames_B3/f_003326.jpg` (the motion: `B3_540p.mp4`). **Your choice:** a bulkier,
  truer gauntlet would be about twice this size in the frame and would crowd the plant; it is left hand-sized unless
  you want the bulk.
