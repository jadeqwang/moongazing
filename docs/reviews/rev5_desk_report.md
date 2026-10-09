# rev5 DESK: the desk shot at 1:05 (3.6e), 9 October 2026 (small hours)

Owner DESK, round five (`render/out/retime/RULES_R5.md`). Report kept current as work proceeds.

Her notes:
- Round 3: "there's a bit of a 'gulp' like motion at my throat that looks ... glitchy?"
- Round 4 (marked "Still off"): "now the glitchiness is just lower down. can you have a video model help you?"

## Status: done (lint OK, nothing committed)

| Shot | Time now (after the retime) | Old time | Cause | Fix | Re-render |
|---|---|---|---|---|---|
| 3.6e | 62.65–64.87 s (1:02.7–1:04.9) | 1:03.5–1:05.8 | a still painting of head and neck slid over a chest redrawn by other rules, whose dark hair flickered in grey flakes | new take that holds the plate (Seedance 2.0), whole figure drawn from the take in its own tones, nothing carried | **shot 3.6e** (frames 1504–1556 at the timing of 00:26, ask `shot_table.mjs`) |

- Files: `render/src/sections/03_verse2.js` (the 3.6e line and its comment only), `media/gen/picks.json` (`J_3.6e` →
  `take_6`), new `tools/vgen_rev5_desk.py`, new plate `media/keyframes/jade/J_3.6e_desk.jpg`, takes
  `media/gen/J_3.6e/take_4…8` with roto folders for 6, 7, 8. No shared code touched (`src/roto/`, `_lib.js` unchanged).
- My render: `render/out/rev5_desk/frames/` (1498–1562, half scale, two independent passes agree byte for byte),
  clip with the song `render/out/rev5_desk/desk.mp4`, stills at 1080p `render/out/rev5_desk/stills/`,
  evidence `render/out/rev5_desk/evidence/`, tools `render/out/rev5_desk/tools/`.
- Spend: five submissions, 2.44 USD estimated, one refused and refunded (0.60): **1.84 USD net**.

## 1. Found: what "lower down" is

Looked at v7 frames 1524–1577 one by one (jaw to chest, native size), then the same region with the camera's zoom taken
out, next to the take's own frames, and a drawing-to-drawing difference map of render and take.

The figure is made of two different pictures of her:

- **Above the collar**: one flat painting (frame 0 of the take: head, headphones, neck, the dark hair under the jaw),
  slid and tilted as a rigid cut-out. Smooth tones, no change from drawing to drawing.
- **Below the collar** (since round 4, by `roto_force`): the hair on her chest and her shirt, redrawn from the take
  every second frame in the ink style. That redraw turns the soft highlights in her hair into hard-edged grey
  dry-brush flakes on black, and the flakes change shape on every drawing (12 times a second) although the hair in
  the take hardly moves there.

So directly under the still, smooth throat there is now a field of grey flakes that flickers, and the lower edge of
the rigid cut-out slides over it (the bright crescent at the collar in the difference map; the take itself is quiet
there). Round 3 moved the fault from the headphones to the throat, round 4 from the throat to the collar and chest:
each time the join between the carried painting and the redrawn body. The cause is the construction (a still
painting composited on a body drawn by other rules), plus the ink redraw's flicker on dark hair, which round 4
spread over the whole chest by forcing it from the first frame.

The take itself (Seedance 2.5, take_2) is not clean either: it reshapes the headphones as she turns (round 3), which
is why the head was carried in the first place. So the take has to change too.

**Measured before** (`render/out/rev5_desk/tools/chest_check.py render/out/frames_v7_540 1524 1577 63.4636 65.7505`;
camera zoom taken out; frames two apart = one drawing to the next; strip of every drawing in
`render/out/rev5_desk/evidence/1.05_neck_chest_every_drawing_v7.jpg`):

| region | raw change, mean / max of 255 | boil (change that is not motion), mean / max | shear (uneven motion), mean / max px |
|---|---|---|---|
| throat + collar | 4.34 / 11.75 | 1.19 / 2.34 | 1.59 / 4.10 |
| hair on chest | 3.50 / 9.17 | 1.42 / 2.25 | 2.16 / 5.23 |
| neck and chest | 4.62 / 9.71 | 1.35 / 2.29 | 2.64 / 5.59 |

## 2. The fix: direction chosen (before the takes are back)

Tested on take_2 with `tools/roto_test.mjs` (no section edit), four moments, half scale, whole figure drawn from the
take with **no carried painting** (`keep: false`):

- ink style as it is: her face breaks into hard black and white patches (why the head was carried at all);
- ink style with `quant 0`, no granulation, no dry-brush line: calmer, but light skin goes to bare paper;
- **the take's own tones on our paper** (`paper: 'silk'` with `style: { snapAmt: 0, shade: 0, gran: 0, lineA: 0 }`:
  the prepared, flattened take frame laid on the paper exactly as the still plate is): one continuous painted figure,
  smooth hair, no flakes, same tones as the still parts of the plate. This is the one.

So: a new take that holds the first frame (Seedance 2.0 / MiniMax h3) from the plate the film shows now, small motion,
drawn whole in the take's own tones; `meta.keep` and `meta.force` not used. The inner-face carry (the other
direction) would put a join on her face instead of her neck: not taken.

### The takes (`tools/vgen_rev5_desk.py`; first frame `media/keyframes/jade/J_3.6e_desk.jpg`, 4 s each)

The first frame is the plate the film has shown at this spot since round one: frame 0 of take_2 with the laptop paper
and the textbook page composited (a copy of `roto/take_2/key.jpg`). Her face in it is the one she has been seeing; the
composition, the type and the desk do not change.

| take | model | asked for | result |
|---|---|---|---|
| 4 | Seedance 2.0 | writes, glance to the laptop | refused (7003 User Input Error), refunded |
| 5 | MiniMax h3 | same | holds the plate; the glance became a large turn of the head away from us from frame 40, the ear cup changes design. Not used |
| **6** | Seedance 2.0 | keeps writing, slight nod, breathes, blinks | **the pick.** Holds the plate and her face closest of all; head nods a few px, hand and pencil shift, shoulder breathes; headphones do not change |
| 7 | MiniMax h3 | same | clean; her head sinks about 20 px over 1.5 s and her eyes end nearly closed. Prepped, usable |
| 8 | Seedance 2.0 (avatar flag) | writes, glance to the laptop | clean; from 1.3 s she looks up at the laptop and back down to the page, head and headphones as one body. Prepped, usable: the alternative if the shot should have the glance (`clip: 'J_3.6e/take_8', offset: 1.3`) |

Take 6 over take 8: it is the steadiest and the closest to the plate, and this shot has failed three times on motion
around the head. Take 8 is the same construction with more acting; it measures a little worse (below) because a head
turning in depth changes more.

### The build

```
MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
$MPY tools/roto_prep.py J_3.6e/take_6        # nothing else: no desk_comp, no roto_keep, no roto_force
```
(`render/out/rev5_desk/tools/build.sh take_6`.) The key plate registers on the take's first frame (error 7.5 of 255,
under the 12 limit), so everything that does not move (laptop text, far page, lamp, window, wash) is the plate
itself. Section line:

```
{ type: 'roto', clip: 'J_3.6e/take_6', paper: 'silk', style: { snapAmt: 0, shade: 0, gran: 0, lineA: 0 }, offset: 0.5, lock: 0, from: …, to: … }
```
`paper: 'silk'` here only selects the shader branch that lays the prepared take frame on the paper in its own tones;
the shot's paper is still xuan. `keepOcc` is gone with the keep data.

## 3. Verified

Own half-scale render of 62.4–65.1 s through the film pipeline (`tools/render.mjs`, one worker; the machine was loaded
and most attempts crashed at start-up, so the range was rendered in two complete independent passes: all 65 frames
agree byte for byte). `lint_shots.mjs` OK. `flicker_check.py`: 65 frames, 0 flagged.

**Measured** (`chest_check.py`, same regions, frames two apart, first four frames of the shot left out: the cut's own
flash is in both versions):

| region | | raw change, mean / max | boil, mean / max | shear, mean / max px |
|---|---|---|---|---|
| throat + collar | v7 | 4.24 / 11.75 | 1.22 / 2.34 | 1.66 / 4.10 |
| | now | 0.83 / 3.09 | 0.58 / 0.77 | 0.31 / 0.66 |
| hair on chest | v7 | 3.29 / 6.52 | 1.45 / 2.25 | 2.18 / 5.23 |
| | now | 1.60 / 4.40 | 0.71 / 0.92 | 1.23 / 3.86 |
| neck and chest | v7 | 4.51 / 9.71 | 1.37 / 2.29 | 2.69 / 5.59 |
| | now | 2.38 / 4.56 | 0.75 / 1.02 | 1.57 / 4.07 |

Boil of about 0.6–0.7 is the floor (paper grain on ones). The shear that is left in the lower regions is her sleeve
and forearm moving under hair that lies still. The other two takes in the same construction (isolated test renders,
whole shot): take_7 boil max 1.05–1.24, shear max 1.2–3.0; take_8 boil max 1.6–2.1, shear max 2.7–2.9.

**Looked at.** Every frame of the shot, headphones to chest, native half scale
(`evidence/1.04_figure_every_frame_now_a/b.jpg`); every drawing of jaw, throat, collar and chest hair with the zoom
taken out, before and after (`evidence/1.05_neck_chest_every_drawing_v7.jpg`, `1.04_neck_chest_every_drawing_now.jpg`);
the hand, pencil and near page against the plate and the raw take; the cuts in and out; two 1080p stills (63.2 and
64.5 s). On consecutive frames the jaw, throat, collar, hair and shirt are one picture that moves together; no flakes;
the headphones keep their shape and stay on her head. Not watched at speed.

**Falls short.**
- Her face is now the video model's drawing of the plate's face, re-made 12 times a second and flattened by the prep
  into soft washes, not one fixed painting. It holds its shape on every frame I looked at, but at 1080p it is softer
  than the carried plate was (the take is 720p; the plate was 1440p), and so are her hair and headphones.
- Take 6 has little acting: she keeps writing, nods slightly, does not look at the laptop. Take 8 has the glance.
- The pencil moves a few px and leaves no new mark; late in the take a few faint hatch lines appear on the page under
  her wrist in the raw take; I do not see them in the rendered frames or stills (that corner is near the lower edge).
- The plate's face is the one from take_2's first frame (Seedance 2.5's version of the codex painting), as in every
  cut so far. It was not repainted.
- Seen in passing, not mine: with the new timing the lyric "I think of you — homesick with waning" is gone by about
  64.5 s while the shot runs to 64.87 s; in v7 it stayed to the cut.

## For Jade

- **1:03** (this was 1:05 before the retime; you at the desk with headphones, 2.2 s). You were right that it needed
  a video model. Until now your head and neck were one still painting slid across a body that was redrawn by other
  rules, and each fix only moved the place where the two met: headphones, then throat, then collar and the hair on
  your chest, which flickered in grey flakes. That construction is gone. A video model (Seedance 2.0) now moves all of
  you at once from the same picture: head, headphones, neck, hair, shoulders and writing hand are one body, and nothing
  is pasted on. In this take you keep writing, with a small nod.
  - Still short: your face is a little softer than before at full size, and you do not glance at the laptop.
    A second take in which you look up at the laptop and back down is ready if you want it (say "use the glance").
  - Stills: `render/out/rev5_desk/stills/f36e_063.200.png`, `f36e_064.500.png`. Clip with the song:
    `render/out/rev5_desk/desk.mp4`.
  - To re-render: shot 3.6e.
