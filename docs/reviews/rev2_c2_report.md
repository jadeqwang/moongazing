# rev2_c2 — shot 7.C2 (2:28): the cat instead of the robot dog; the real game on the TV

Working notes, written as the work goes (Oct 8 2026). Shot 7.C2 = 147.64–149.41 s, frames 3544–3586 of
`render/out/fullcut_v4_540p.mp4`.

## Jade's note (on v4)
"2:28 - two things: (1) robot dog – actually, change it to the cat (2) the ddr screen, if you can show an accurate
render of rare-earth-techno-remix (rare_earth_ddr_sample.mp4 is in the inputs folder)"

## What the real screen looks like
Source: `inputs/rare_earth_ddr_sample.mp4` (private; 1440x1080, 30 fps, 5.86 s, 176 frames; never uploaded, no frame
of it published). The game picture is a 4:3 image pillarboxed in the 16:9 TV (black bars left and right, each 1/8 of the
TV's width). Its quad was found in every frame (blue threshold, RANSAC line fits) and rectified to 960x720; all
measurements below are fractions of that 4:3 picture (x of width, y of height).

- **It is StepMania with a DDR-Extreme-style theme, playing Jade's own step pack** "Rare Earth (Techno Remix)"
  (`/home/jade/Documents/rare-earth-ddr-publish/ddr/Songs/Rare Earth Pack/Rare Earth (Techno Remix)/`: `.sm`/`.ssc`
  charts, `background.jpg`, banner, jacket). Mode: double (one player, two pads, eight columns).
- **Frame, top** (y 0–0.11): a bright cyan band. Life bar at the left (x 0–0.42, y 0.045–0.09): a chain of rounded
  wave segments, red and orange with a yellow highlight that travels along it. Centre plate "STAGE" (x 0.44–0.56), and
  under it in a rounded tab "Event" (y 0.10–0.14). At the right the second player's bar (x 0.57–1.0): the same wave
  chain, empty, dark navy.
- **Targets** (the receptor row): eight outlined arrows, pale blue-white with a grey-blue core, centres at y = 0.204,
  x = 0.132 + 0.1058·i (i = 0..7), each about 0.104 wide: left, down, up, right, left, down, up, right. The two groups
  of four run on without a gap. The receptors pulse brighter on every beat.
- **Arrows** scroll straight **up** from the bottom frame (y 0.86) to the targets at constant speed: 430 px/s of 720 =
  0.60 picture heights per second. With the beat measured from the receptor pulse (0.452 s, 133 BPM; the chart says
  129–136) that is 0.27 H per beat = two arrow heights per beat: the "2x" speed mod (the footer reads "2x, note").
  So an arrow is on screen for 2.4 beats (1.1 s). Colours are the "note" skin: arrows on the beat are red with a white
  rim, arrows on the half-beat are blue with a white rim. When an arrow reaches its target the target flashes
  yellow-white for about two frames and the arrow is gone.
- **Judgment**: "PERFECT!!" in yellow capitals with a pink-red drop edge, centred at (0.5, 0.435), 0.27 wide; it gives
  a small zoom pulse on each hit. Under it the combo at y 0.57: the number in pink-magenta (x 0.42–0.50), then
  "combo" in cyan. In the sample the combo runs 6x → 8x and the first frames show a green "GREAT".
- **Frame, bottom** (y 0.86–1): score at the left on a dark-blue plate, nine cyan digits ("002335498", x 0–0.31,
  y 0.885–0.95) with a green difficulty tab above it (x 0–0.17, y 0.82–0.865); in the centre a pale-cyan plate with
  "2x, note"; a blank blue plate at the right. Last line (y 0.975): "Kenton" (player name), "FailEndOfSong",
  "NOT PRESENT" (the second player).
- **Background**: the pack's `background.jpg`, shown dark and blue: DOT, the Rare Earth character, holding her red
  headphones, white jacket with red stripes, in a room with a window, a keyboard and a mug. Only her reds stay red.

## What was built

### (1) The cat
- **Keyframe `media/keyframes/K_7.C2.jpg` = v6** (v5 kept as `K_7.C2_v5.jpg/.txt`). The toy and its shadow are gone;
  the family cat (the long-haired brown mackerel tabby of `SHEET_pets.jpg` and of 7.C3) sits on the carpet at M's left
  (screen right), looking up at her swinging hem with the near front paw lifted onto the hem's corner, tail curled on the
  carpet. **One action: it bats at the hem of her dress.** M's v5 pose and eye line (down to her left) already meet it.
- How: one `google/nano-banana-pro` edit of v5 with the pets sheet (`media/keyframes/work/rev2_c2/cat_v1.jpg`). The
  model repainted M and made the cat 56 cm tall, so only its cat is used: `tools/k7c2_cat_keyframe.py` (deterministic)
  Poisson-clones clean carpet over the toy, cuts the cat out along a hand-traced outline, scales it 0.84 and sets it down
  with the paw on M's own v5 hem, with a soft contact shadow. Everything outside the cat patch and the TV screen is v5
  pixel for pixel (changed-pixel bbox x 154-2383, y 155-1402).
- Size: ear tips 47 cm above the carpet at M's depth (378 px at 8 px/cm; M crouched is 750 px), head with ruff 15 cm,
  shoulder just above M's bent knee. Keyframe checks: one head, four legs (three visible), one tail; M, Kenton (from
  behind, no face) and T untouched.
- Continuity with 7.C3: 7.C3 is a different room (the living-room sofa, a time cut), so position cannot contradict; it is
  the same animal at the same size relative to M (in 7.C3 it is nearer the lens than here).

### Takes (`tools/vgen_rev2_c2.py`; prompt = take_7's, with the cat's action and a flat blue TV)
| take | model | verdict |
|---|---|---|
| `K_7.C2/take_9` | minimax/h3 768P, ff 0.98 | **Rejected.** Cat stable, TV flat, but M jumps with straight legs and her dress balloons and collapses from one drawing to the next; her proportions stretch in the air; the paw never reaches the hem. |
| `K_7.C2/take_10` | bytedance/seedance-2.0 720p, ff 0.98 | **Pick.** M bounces on bent knees, her hem swings and the cat's paw darts out to it and back, head following, tail flicking from a curl to a stretch; one head, four legs, one tail throughout; it never stands or slides. Kenton and T step (the mat's panels light). TV stays flat blue. Content is 16 fps upsampled to 24 (every third frame a near-repeat): fine on twos. |
Sheets: `media/gen/K_7.C2/take_9_sheet16.jpg`, `take_10_sheet16.jpg` (looked at before roto prep, plus close crops of
the cat and of the dancers every 4 frames). Roto: `media/gen/K_7.C2/roto/take_10/` (`keySource` = `K_7.C2.jpg`, locked
camera, key_reg_err 3.3 px). `media/gen/picks.json` now names take_10.

### Timing of the take
Measured in take_10: M lands (lowest point of her bounce) at clip frames 9, 19.5, 30.5, 40, 48; the mat's panels light
at frame 9 (right), 18.5 (down, with left), 42.5 (right), 51 (down). The bar's beats are 10.6 frames apart. With
**`offset: 0.375`** (clip frame 9) her landings fall on the bar's four beats within one frame, and the panel lights fall
on beats 1, 2 and 4. This is below the round's "offset >= 0.5 s" rule on purpose: the rule is there to avoid a frozen
start, and this take moves from its very first frame (mean frame difference 2.1 at frame 0-1, the same as mid-take);
0.5 would put every landing a quarter-beat early.

### (2) The TV
- **`tools/ddr_screen.py`** draws the real screen frame by frame (option (a): redrawn, nothing of the phone video is used
  as picture): the layout above; **the step pack's own `background.jpg` and chart** (copied to
  `media/refs/rare_earth/ddr/`); arrows that scroll up at the real 2x speed (0.267 picture heights per beat) and reach the
  targets **on the film's beats** (`analysis/beatgrid.json`); the beat pulse of the targets, the yellow-white hit flash,
  PERFECT!! and the combo popping on each hit, the score counting up by the game's own rule (MAX2 scoring: the sample's
  numbers fit it, 2.23 M at combo 75 of the Heavy chart), the life bar's travelling crest. The 4:3 picture sits
  pillarboxed in the 16:9 panel, as in the room.
- **Which steps.** The sample is the Heavy Double chart at 19.7-25.5 s of the song (all 20 of its hits matched). A father
  teaching a seven-year-old would not be on Heavy, and its eighth-note runs cannot agree with one step a beat. I searched
  all four double charts for a passage whose arrows are the panels the dancers actually light in take_10 (right, down,
  nothing, right): **Standard Double, beats 112-115 = right, down, the second pad's left, right** (then the second
  pad's up on the cut). So the three panels that light on the mat are the three arrows the screen scores at those
  moments; the beat-3 arrow belongs to the second pad, which the room does not have (see "falls short"). Combo 100-103,
  score 9.0-9.7 M.
- **Into the painting.** v6 paints the TV's screen a flat key blue, and the take was prompted to keep it flat (it did).
  `ddr_screen.py` registers the keyframe quad onto the roto key (ECC 0.995), warps each game frame into it (2x, then
  area-averaged), and mattes each frame on the blue of the very drawing the renderer shows at that film frame (the roto
  colour guide, on twos), so T's hand and anyone else stay in front. Output: `media/keyframes/SCR_ddr_c2.png` (7x7 atlas,
  43 frames) + `.json`. In `07_drop.js` the 7.C2 block plays it with the existing `screenClip` (index = film frame
  - k0, so it is the same picture in any render order) under `rview` (the roto's own view maths), with `glow: 0.5` in
  the screen's blue: the light falls on the wall and on Kenton and T, as the tablet's does in 7.C3b.
- Before this, the TV's blue arrows were simply painted into the keyframe and animated by the video model (four big
  blurred arrows, redrawn by roto); there was no matte.
- Other changes in the 7.C2 block: the push now stops at `x 0.53, zoom 1.06` (was 0.56 / 1.08) so the whole game
  picture stays in frame; roto style `{ lineA: 0, snapAmt: 0, gran: 0 }` (as the toast and 7.B4): with the default silk
  line the redraw left stray thick black strokes on M's fists and collar and across the cat's face.

## How it compares with the real screen
`render/out/rev2_c2/ddr_screen_comparison.jpg` (local only: its left panel is a frame of the private video): real,
drawn flat, and the 1080p shot. Same: layout and proportions, eight targets in the real order and pitch, scroll
direction and speed, colours of arrows / judgment / combo / score, the frame's bars and plates, the texts, the
background art, pillarboxing. Different: the theme's bitmap fonts are not on this machine (DejaVu Sans Bold stands in
for PERFECT!!, combo, score, "Event"); the life bar is a chain of beads where the real one is a zig-zag ribbon; the
difficulty tab is drawn magenta-red for Standard (the sample's is green for Heavy; the theme's Standard colour was not
verified); the phone exposed the real picture brighter and more cyan than my drawing; no "GREAT" is ever shown.
On the painted TV the game picture is about 300 px wide at 1080p: arrows, PERFECT!!, combo and score read; the bottom
line of names does not.

## The toy dog elsewhere
- **Shots:** it was only ever in 7.C2. No other section file, script row or current keyframe has it.
- **Docs updated:** `docs/script.md` 7.C2 row; `docs/character_bible.md` (M's "Plays with" line, the 7c-toy table row,
  the toy's heading, and a new line on the cat in shots). The toy's design section is kept: it is still M's real toy.
- **Left as they are (stale, harmless unless reused):** `render/scenes/blockouts/toy_dog.js`, `toy_dog_rear/`,
  `toy_dog_stand/`, the `K_7.C2` blockout scene in `render/scenes/blockouts/scenes.js` (still places the toy);
  `media/chars/robots/SHEET_toydog.jpg`; the shared prompts for K_7.C2 in `tools/vgen.py` (lines ~247, ~303) and
  `tools/vgen_calls.py` still describe the toy dog, so a re-submit through those would bring it back: use
  `tools/vgen_rev2_c2.py`. `docs/production_tracker.md` is generated and already stale for this shot (says take_6);
  not regenerated, because that rewrites every row. Historical mentions: `docs/audit_codex.md`, the v3 glitch sweep.
- Nothing else now contradicts the shot.

## Files
- Changed: `render/src/sections/07_drop.js` (the 7.C2 block and two consts above `C_SHOTS` only), `docs/script.md`,
  `docs/character_bible.md`, `media/gen/picks.json` (K_7.C2 entry), `media/keyframes/K_7.C2.jpg/.txt`,
  sidecars `media/gen/K_7.C2/take_*.json` (see note below).
- New: `tools/ddr_screen.py`, `tools/k7c2_cat_keyframe.py`, `tools/vgen_rev2_c2.py`, `media/keyframes/K_7.C2_v5.*`,
  `media/keyframes/SCR_ddr_c2.png/.json`, `media/keyframes/work/rev2_c2/`, `media/refs/rare_earth/ddr/`
  (background, chart, pack README: copies from `/home/jade/Documents/rare-earth-ddr-publish/ddr/Songs/`),
  `media/gen/K_7.C2/take_9*`, `take_10*`, `roto/take_10/`.
- Sidecar note: `tools/ffcheck.py K_7.C2` rescored the old takes against the new keyframe; I put their `ff_r` back to the
  value against the keyframe each was made from (`ff_r_key` says which).
- Lint: `node tools/lint_shots.mjs` OK after every edit. Deterministic: frames 3552/3556/3560 rendered twice are
  byte-identical. Nothing committed.

## Deliverables (all under `render/out/rev2_c2/`)
- `c2_after.mp4`: 147.0-151.5 s, half scale, master audio. `c2_before.mp4`: the same range from the v4 frames.
- `ddr_screen_comparison.jpg` (local only), `c2_after_sheet.jpg` (20 frames incl. the cut in and the cut to 7.C3),
  `stills/c2_*.png` (five 1080p stills), `frames_after/`.
Frames looked at: the 20-frame sheet; M + cat crops at 12 frames; TV crops at 12 frames; 1080p stills at 148.167,
148.583, 149.000 full size and the TV at 3x.

## Spend
nano-banana-pro edit $0.13; video $1.15 (h3 $0.40 + seedance-2.0 $0.75). Total about $1.28 of the $12.

## What falls short
1. **Double layout against a single mat.** The screen shows double mode (eight targets), which is what the real game
   was doing on two hard pads; the painting has one soft mat. It shows: on beat 3 an arrow is scored in the right-hand
   group while nobody steps anywhere new, and anyone who plays will read eight targets over one four-arrow mat. To ask
   Jade: paint the two real platforms, or show single mode (four targets), or leave it.
2. **Who is playing.** In the real video Kenton plays Heavy alone; here he guides T through a Standard passage with a
   full PERFECT combo of 100. The player name on screen is "Kenton", as in the sample.
3. **Fonts and small ornaments** of the theme are approximations (see the comparison).
4. **Offset 0.375 s** instead of the round's 0.5 (reason above).
5. **Not watched at speed.** Judged from frames, sheets and stills, not from playing the clip.
6. The cut in keeps the shot's old ink flash (`flash: true`): frame 3544 is black and 3545 half-revealed, so the beat-1
   hit on screen and M's first landing are under it.
7. `inputs/rare_earth_ddr_sample.mp4` is untracked but **not git-ignored** (`.gitignore` covers `inputs/*.png|*.MOV`
   only): an `git add -A` would commit the private video. Not changed by me.
