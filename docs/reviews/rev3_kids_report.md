# rev3_kids — the children: T's cheeks, the eclipse over Anatolia, M's hair on launch day, single-pad screen

**T's new sheet (for HOME, FACE and anyone who paints him): `media/chars/T/SHEET.jpg` (v3, Oct 8 2026).**
Old sheet kept as `media/chars/T/SHEET_v2.jpg`. Same boy, same clothes and layout; only the outline of his cheeks and
jaw changed: fuller and rounder at front, three-quarter and profile. Wording for prompts is in
`docs/character_bible.md` under "T (boy, 7)" (ID block and the "Cheeks" note).

Working notes, written as the work goes (Oct 8 2026). Timestamps are cut v5.

## Job 0 — T's reference sheet

**What Jade said (three notes, one fault):** "T's cheeks are a bit fuller" (1:23), "his cheeks should be fuller" (0:57),
"T's cheeks are fuller than what's shown" (2:28).

**What the old sheet showed.** `SHEET_v2.jpg` (from `T/T_gpt_v2.jpg`): a round skull but a face that narrows from the
eyes down to a small pointed chin, so the widest point of the face is at the ears/eyes; in profile a straight jawline.
The ID block already said "full plump cheeks", so the words were right and the picture was not, and every keyframe was
painted from the picture. I looked at `inputs/kids_splash_park.png` and `inputs/legoland_groupmealphoto.png` (looked at
only; never given to a model, never copied): his lower face is as wide as his forehead, and in profile the cheek rounds
forward beside the mouth with a low soft jaw.

**What changed.** `media/chars/T/SHEET.jpg` = v3 (2528x1696; sidecar `T/T_nbp_v3.json` with both prompts):
- front: widest at the cheeks, level with the nose tip and mouth; a full round U to a short soft chin, no jaw angle;
- three-quarter: the far cheek is a round bump that passes the corner of the mouth;
- profile: the cheek rounds forward beside the mouth; the jaw is a low soft curve;
- the three small action figures have the same outline (the step figure looks ahead with open eyes, as before).
Eyes, brows, nose, hair, head size, sweater, trousers, boots, toy Earth, line and silk ground are as before.

**How.** `google/nano-banana-pro` edits of the v2 sheet, four calls (0.54 USD of images):
- `work/T_nbp_cheeks_a.jpg`: rejected. Overdone: jowl and double-chin lines, heavy blush, eyes closed. Reads as a
  caricature and as an older, heavier child.
- `work/T_nbp_cheeks_c.jpg`: rejected. Barely different from v2.
- `work/T_nbp_cheeks_b.jpg`: front and profile right; a crease beside the mouth in the three-quarter view, and the
  step figure's eyes closed.
- `work/T_nbp_cheeks_d.png`: an edit of b that reopened the step figure's eyes.
- Final = b, with the step figure's head from d and the crease inpainted out locally (`work/T_cheeks_v3_comp.png`).
Comparison of the heads, old above new: scratch `kids/tsheet_cmp_abc.jpg` (rows: v2, a, b, c).

**Bible:** `docs/character_bible.md`: sheet table row 2, T's ID block (cheek wording), a "Cheeks" note under T, and the
toy Moon's size in the props table (about a third of the toy Earth; it said "matching size").

**Not updated:** `media/chars/family_heights.jpg`, `CAST_BOARD.jpg` and `kids/SHEET.jpg` still carry the v2 face.

## Tools written this round
- `tools/rev3_kids_head.py`: crop a small region of a keyframe enlarged for the image model; paste the edit back
  through a feathered ellipse only (registered by ECC), so every other pixel of the keyframe is untouched.
- `tools/globe_ortho.py`: the real map (Natural Earth 1:50m land + Caspian), orthographic, turned so a target sits at a
  given place on the disc. `tools/k34_globe.py`: lays that map under the children's fingers in a keyframe, takes the
  painted globe back, draws the Moon's shadow by rule, re-projects the painted globe to the other two views, and
  overlays the real coastline for checking.
- `tools/vgen_rev3_kids.py`: this round's take prompts, 16-frame sheets, consecutive-frame strips.
- `tools/ddr_screen.py`: new option `--style dance-single`.

## Job 1 — 1:23, the splash park (4.3b, 4.3c)
**Asked:** "T's cheeks are a bit fuller".
**v5 frames (f1989–2042):** T is about 90 px tall in the 540p frame, three-quarter, laughing; his face narrows to a
small chin, as on the old sheet. In 4.3c (f2043–2078, the close on M leaping) T is not in the picture at all: the
keyframe `K_4.3b_close` and its take show M only. Nothing to change there.
**Changed:** keyframe `media/keyframes/K_4.3b.jpg` = v2 (v1 kept): only T's head, repainted to the v3 sheet
(nano-banana-pro on an enlarged crop with the sheet; three tries, `edit_b` used: `edit_a` gave a double chin and heavy
blush). Changed pixels x 983–1091, y 290–411 of 1536x864. Two Seedance 2.0 takes from it:
- `K_4.3b/take_6` **pick**: T stays three-quarter, laughing, hands up, cheeks full on every frame 12–71 (strip
  `media/gen/K_4.3b/take_6_strip_12_71.jpg`); M leaps, lands, turns and runs left; frame-difference check: no pops
  (median 4.4, max 8.0).
- `K_4.3b/take_5` alt: clean, but T turns full-face with his eyes shut for the whole clip.
**Wired:** `04_hook.js` 4.3b: `K_4.3b/take_6`, offset 0.6, rate 1 (4.3c unchanged). `picks.json` updated.

## Job 2 — 0:57, the Copernican lesson (3.4a, 3.4b, 3.4c)
**Asked:** framing fine; "his cheeks should be fuller, but have him center the eclipse on the Anatolia region because
this will serve as as an Easter Egg for the Battle of Halys music video". Moon toy stays a third of the Earth toy.
**v5 frames (f1298–1387):** the globe in 3.4c was a fantasy East Asia with the spot over China; in 3.4a/3.4b it was a
photographic Earth showing Africa with the spot over West Africa. So the three views did not even agree with each
other, and none had Anatolia under the shadow.
**The map (before painting):** `media/ref/rev3_kids/` (`SOURCES.md`): Natural Earth land; target 39.0 N 34.5 E, inside
the bend of the Kızılırmak (Halys). With the spot where each painting has it and north as nearly up as it goes, 3.4c is
centred on 29 N 55 E (Africa, Europe, Arabia, India in view) and the two side views on about 25 N 80 E (India in the
middle, Europe on the lamp-side limb). `ortho_beam/wall/lesson.png` show what each camera must see.
**Painted:**
- `K_3.4_beam.jpg` v2 (v1 kept): the exact flat map laid under T's fingers, then painted by nano-banana-pro in the old
  globe's blue-green manner (coasts inked, mountains at the Alps/Caucasus/Himalaya, three cloud scrolls far from the
  Mediterranean); only the globe's disc was taken back. The shadow is drawn by rule, not by the model: a dark core
  0.135 of the globe's radius (the size of Anatolia) with a soft penumbra to 0.30, plus the shaft's dimming across
  Africa. A hard black disc a third of the globe wide would have hidden the very coasts that say where it is.
- `K_3.4_wall.jpg` v5 and `K_3.4_lesson.jpg` v5 (v4 kept): the SAME painted globe re-projected to each side view
  (no model: asked to paint these from their own exact bases, the model copied the close view's geography instead, and
  the check caught it), lit from the lamp's side, spot by the same rule.
- T's head in all three repainted to the v3 sheet (one edit each, pasted through an ellipse).
**The map (after painting):** real coastline overlaid on each result: `media/keyframes/work/rev3_kids/beam_check.jpg`,
`wall_check.jpg`, `lesson_check.jpg`. Coasts agree to a pixel or two; the yellow cross (39 N 34.5 E) is at the centre
of the spot in all three; Black Sea above it, Mediterranean and Cyprus below, Aegean to the west, Caspian to the east.
**Takes:** two h3 2K takes of the close view, prompted to hold the Moon ball still so the shadow does not travel:
- `K_3.4_beam/take_3` **pick**: ball still, spot stays on the eastern Mediterranean/Anatolia, globe does not turn, T
  watches the spot, tilts his head (f66) and grins at his sister (f74 on), cheeks full; strips of every frame 60–119.
- `K_3.4_beam/take_4` rejected: the globe rolls in his hands and the spot ends over the Atlantic.
- 3.4a/3.4b keep their takes (`K_3.4_lesson/take_6`, `K_3.4_wall/take_2`): over the 0.9 s and 1.25 s the film uses,
  the ball, the spot and the globe hardly move in them (strip looked at), so the cheaper fix is right.
**Wired:** in all three views the PAINTED globe is carried on the take (`tools/roto_keep.py`, region = the globe's
disc), so the map and the spot cannot drift or be redrawn into mush; in 3.4a/3.4b T's painted head is carried as the
second region. `03_verse2.js` 3.4 block: `keepOcc: false`, 3.4c offset 2.5 s (frame 60: the take is on twos), rate 1.
The wall and lesson roto folders were re-prepped on the new keyframes first (keep re-run after).
**Bible:** toy Moon = about a third of the toy Earth (was "matching size").

## Job 3 — 1:19 against 0:27, the launch shore (4.2, 1.6)
**Asked:** "M hair consistency with other scenes from the same day".
**v5 frames:** the two KEYFRAMES agree (one side Dutch braid over the crown into a low tail, one pink elastic, curly
tail to the shoulder blades, light-brown hair; strawberry dress, white socks, brown boots; T in the star sweater, navy
trousers; Kenton in charcoal tee and black cargo trousers, hair half up). The difference is made downstream:
- 0:27 (f646–688): the take turned the single braid into two or three parallel braids, and the redraw kept them.
- 1:19 (f1896–1954): the redraw lost the braid altogether: a plain red-brown mass with a tail; the rocket's rim light
  also makes it redder.
Which is right: the painting (and the bible: ONE side braid, pink elastics). Neither shot was.
**Changed (both shots, no new take, no keyframe change):** M's whole head of hair, braid, elastic and tail, is now the
painting's own pixels, carried on the take by `tools/roto_keep.py` (region drawn generously into the sky, `keepOcc:
false` in the section so the take's own hair cannot show through). `01_intro_b.js` 1.6 and `04_hook.js` 4.2 gained
`keepOcc: false` and a comment; takes and timing unchanged.
Tried and dropped: `tools/head_carry.py` (takes `take_9c`, `take_4c`, still on disk): it left a ring of filled sky
round the head that the redraw drew as a halo.
**Everything else that should match, checked:** dress, socks, boots, T's sweater and trousers, Kenton's clothes and
hair, the fence, the palms, the crescent: the same in both. Light differs on purpose (blue hour, then the flame).
**Other shots of that day:** none with the family. 1.4a/1.4b, 3.8a–f, 4.1, 4.3 are the crew's side of the same day.

## Job 4 — 2:28, the playroom (7.C2)
**Asked:** single-pad mode on the TV; "and T's cheeks are fuller than what's shown".
**v5 frames (f3544–3586):** eight targets across the screen over one four-arrow mat; T is seen from behind in lost
profile, and the edge of his cheek barely passes his ear.
**Changed:**
- `tools/ddr_screen.py --style dance-single --diff Easy --chart0 63`: four targets (left, down, up, right) on player 1's
  side of the screen (where StepMania puts a single player: a quarter of the way across), PERFECT!! and the combo over
  them, the second player's half empty with "NOT PRESENT" as in her video. Steps: **Easy Single, beats 63–66 = right,
  down, rest, right**, the only passage in the four single charts that is exactly what the dancers do in the take
  (the mat's right panel on beat 1, down on beat 2, nothing on beat 3, right on beat 4). So the beat-3 arrow for a pad
  the room does not have is gone. Arrows still reach the targets on the film's beats (same beat grid). Combo 42–44.
  `media/keyframes/SCR_ddr_c2.png/.json` rebuilt (the double-mode atlas is kept in `work/rev3_kids/`).
- `K_7.C2.jpg` v7 (v6 kept): T's visible cheek repainted so it rounds out past his ear (changed pixels x 788–883,
  y 423–545 of 2752x1536). Same take (`take_10`), re-prepped on v7; the painted cheek is carried
  (`roto_keep`, tracked on his hair); `07_drop.js` 7.C2: `keepOcc: false`, comment updated.

## Test render (half scale, 2 workers): `render/out/rev3_kids/frames/` (film frame numbers)
Ranges 26.6–29.0, 54.0–58.0, 78.7–86.9, 88.6–90.6, 147.3–149.7 s; no failed frames. Looked at as sheets across each
cut in and out, plus consecutive-frame strips of the risky region:
- **0:54–0:58 (f1299–1388):** every frame of the globe in 3.4c: the map does not move on the ball and the spot stays on
  Anatolia from the first frame to the cut; T watches it, then grins, cheeks full. 3.4a/3.4b: globe and head carried
  cleanly. Found and fixed on the way: in 3.4b an elliptical head region carried a rim of lit wall with it (a pale halo
  from f1337); the region now follows the head's outline.
- **1:23 (f1989–2042):** every frame of T's head: round cheeks on all of them, no pop; the bloom-in and the cut to the
  close are as before.
- **2:28 (f3544–3585):** TV every third frame: four targets at the left, the right arrow hits on beat 1 (f3546), down on
  beat 2 (f3555, target flashes), nothing on beat 3, right on beat 4 (f3576, flash); combo 42 → 44. T's cheek: present
  and attached to the head on every frame looked at (13 close crops, against two of v5 where there is none).
- **0:27 and 1:19 (f645–688, f1895–1954):** M's hair every second frame: one braid, pink elastic, curly tail in both.

## Job 5 — sweep: every shot in which T is seen
One mid frame of every shot that could hold him was looked at (v5), then the candidates closer.
| v5 time | Shot | How T is seen | State |
|---|---|---|---|
| 0:27 | 1.6 | from behind, no face | nothing to do |
| 0:54–0:58 | 3.4a/b/c | three-quarter and front, mid-size | **done** (job 2) |
| 1:19 | 4.2 | from behind, looking up; a sliver of lost profile, about 12 px | left: too small to carry a cheek |
| 1:23 | 4.3b | three-quarter, laughing | **done** (job 1) |
| 1:29 | 4.5 | PROFILE at the viewing-room window, mid-size: the old sheet's straight thin jaw | **done**: `K_4.5.jpg` repainted (v1 kept; changed pixels x 926–997, y 237–321), same take `K_4.5/take_2` re-prepped, painted head carried (`roto_keep`), `keepOcc: false` added to the 4.5 line of `04_hook.js`. Render f2130–2172: fuller cheek and soft jaw on every frame, head steady. |
| 1:52 | 6.1 | HOME's | not touched |
| 2:28 | 7.C2 | from behind, lost profile | **done** (job 4) |
| 2:38 | 7.C1 (left half) | three-quarter, laughing, large, head bobbing | see below |
| 3:13 | 8.2/8.2b | HOME's | not touched |
| 3:19 | 8.3 | from behind | nothing to do |
Not in: the teahouse (2.5/3.1/3.2 show Jade, M and her mother), 7.C3/7.C3b (M and the cat), 7.D1–7.D4 (M on stage).

**2:38, the call home (7.C1, left half), done with a new take.** His head bobs and his laugh changes through the shot,
so a carried painted head would have frozen his face: `K_7.C1_earth.jpg` repainted (T's head only; v2 kept; changed
pixels x 1100–1346, y 347–583), two Seedance 2.0 takes. `K_7.C1_earth/take_6` **pick**: T stays behind M, laughing,
cheeks full and round on every frame 12–59, leans in from f44; no pops (the take moves on twos). `take_5` rejected for
this shot: he walks round to M's other side. Wired in `07_drop.js` (the 7.C1 Earth layer: `take_6`, offset 14/24,
rate 1). Render f3804–3840 looked at across both cuts and every second frame of his head.
Note: 4.5 and 7.C1 are not on my list of owned shot lines; no other owner has them this round, and the brief's sweep
asks for them, so I changed exactly one layer line in each.

## What still falls short
1. **Nothing was watched at speed.** Everything is judged from sheets, consecutive-frame strips and three 1080p stills.
2. **1:19:** M's hair is a little redder than at 0:27, because the painting has the flame's light on it; from f1920 a few
   pale strokes of the take's own hair show between her head and her raised arm (small; `stills/1m19_launch.jpg`).
   T's sliver of profile there (about 12 px) is unchanged.
3. **0:57:** the Moon's shadow is drawn as a dark core the size of Anatolia with a soft edge that also dims the Aegean,
   Cyprus and the Caucasus; it is not a crisp disc. The globe in the picture is the painting carried rigidly, T's
   fingertips with it (they do not shift in the take); the shaft outside the globe is the take's own.
4. **0:54–0:56:** the two smaller globes are the close view's globe re-projected, so they are softer, and their far
   side, in darkness, falls back to flat colours.
5. **The toy Earth elsewhere** (on the desk at 0:58, floating at 1:33, on the parapet at 3:19) was painted before this
   round and still has invented continents. Not my shots; see "For Jade".
6. **2:28:** I had no picture of her game in single mode: the four targets are where StepMania puts a single first
   player by default (the left half). Fonts are stand-ins as before; the player name still reads "Kenton". T is seen
   from behind, so "fuller cheeks" there is one curve past his ear.
7. **2:38:** T's eyes are shut in the laugh for most of the shot.
8. `media/chars/family_heights.jpg`, `CAST_BOARD.jpg` and `kids/SHEET.jpg` still show T's old face.
9. Each half-scale render printed two "404 (Not Found)" console lines and no failed frames; I did not trace which
   files they are.
10. Left on disk, unused: `media/gen/K_4.2/take_9c*`, `media/gen/K_1.6/take_4c*` and their roto folders.

## Files
- **Section files (my blocks only):** `01_intro_b.js` (1.6: `keepOcc`, comment), `03_verse2.js` (3.4 block: `keepOcc`,
  3.4c offset, comments), `04_hook.js` (4.2: `keepOcc`, comment; 4.3b: take; 4.5: `keepOcc`), `07_drop.js` (7.C2:
  `keepOcc`, comment; 7.C1 Earth layer: take and offset). Lint OK after every edit.
- **Keyframes (old kept as `_vN`):** `K_4.3b`, `K_3.4_beam`, `K_3.4_wall`, `K_3.4_lesson`, `K_7.C2`, `K_4.5`,
  `K_7.C1_earth`; `SCR_ddr_c2.png/.json`; work files in `media/keyframes/work/rev3_kids/`.
- **Takes:** `K_4.3b/take_5,6`, `K_3.4_beam/take_3,4`, `K_7.C1_earth/take_5,6` (verdicts in the sidecars; older takes'
  `ff_r` put back after `ffcheck`). Roto: new `K_4.3b/take_6`, `K_3.4_beam/take_3`, `K_7.C1_earth/take_6`; re-prepped
  `K_3.4_wall/take_2`, `K_3.4_lesson/take_6`, `K_7.C2/take_10`, `K_4.5/take_2`; keep data on those and on
  `K_4.2/take_9`, `K_1.6/take_4`. **Re-running `roto_prep.py` on any of these wipes the keep data:** the regions are
  in the scratch file `kids/keep_regions.txt` and in each `meta.json["keep"]["regions"]`.
- **Docs:** `docs/character_bible.md` (T, toy Moon, toy Earth), `docs/script.md` (3.4, 7.C2), `media/gen/picks.json`,
  `media/ref/rev3_kids/SOURCES.md`, the keyframes' `.txt` sidecars.
- **Tools:** `tools/rev3_kids_head.py`, `globe_ortho.py`, `k34_globe.py`, `vgen_rev3_kids.py`; `ddr_screen.py` (option).
- **Test render:** `render/out/rev3_kids/` (`frames/`, six `.mp4` with sound, `stills/`).

## Spend
Video: 4.00 USD (Seedance 2.0 2 × 0.75 and 2 × 0.60; h3 2K 2 × 0.65), of the 10 allowed. Images: 19 nano-banana-pro
edits, about 2.55 USD. No codex.

## For Jade
- **T's reference sheet** has fuller, rounder cheeks at front, three-quarter and profile; every shot below was brought
  to it. Frame: `media/chars/T/SHEET.jpg` (old: `SHEET_v2.jpg`).
- **0:54–0:58, the flashlight lesson:** the toy globe now has real coastlines and the Moon's shadow sits on central
  Anatolia, on the bend of the Kızılırmak, in all three views and for the whole of each; T's cheeks are fuller.
  Frames: `render/out/rev3_kids/stills/0m57_lesson_eclipse.jpg`, `0m55_lesson_side.jpg`; at full size
  `stills/full_057.100.png`. **Yours to choose:** the shadow is a dark core the size of Anatolia with a soft edge, so
  the coasts round it still read. A crisp black disc a third of the globe wide would be truer to a small lamp and
  would cover everything from Greece to the Caspian. Say if you want it crisper or smaller.
- **1:23, the splash park:** T's cheeks are fuller; a new take from the repainted picture. Frame:
  `stills/1m23_splash_park.jpg`.
- **1:19 and 0:27, the launch from the shore:** M's hair is now the same in both: one side braid over the crown, one
  pink elastic, a curly tail. Before, the earlier shot had turned it into three braids and the later one had lost the
  braid. Frames: `stills/0m27_launch_shore.jpg`, `stills/1m19_launch.jpg`.
- **2:28, the playroom:** the TV shows single mode, four targets on the player's side, and the arrows it scores are the
  panels Kenton and T step on (right, down, a rest, right; from your Easy Single chart); T's cheek now rounds out past
  his ear. Frames: `stills/2m28_playroom.jpg`, at full size `stills/full_148.600.png`. **Yours to choose:** the four
  targets sit in the left half, where the game puts a single first player by default; if your setup centres them, say
  so and it is one number.
- **1:29, the viewing room, and 2:38, the call home** (found in the sweep, not in your notes): T's cheeks brought to
  the new sheet there too. Frames: `stills/1m29_viewing_room.jpg`, `stills/2m39_call_home.jpg`.
- **Yours to choose, wider than my shots:** the toy Earth on the desk at 0:58, floating at 1:33 and on the parapet at
  3:19 still has invented continents. If the globe should be the same real map everywhere (and, in the capsule, perhaps
  turned to show the same side), those three pictures need the globe repainted from
  `media/keyframes/work/rev3_kids/beam_painted_clean.png`.
