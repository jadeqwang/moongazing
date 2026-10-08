# rev2 · 7.A speed-build montage (122.77–133.45 s) — working report

Status: DONE for this pass (Oct 8). Rendered at 540p and checked from frames and contact sheets; nobody has watched it
at speed with sound yet. Nothing is committed. Spend: 0 USD (no image or video model was called).

## What Jade said
"The montage of building the moonbase could be better" (nice-to-have in `REVISION_NOTES_OCT7.md`, repeated after
watching `render/out/fullcut_v4_540p.mp4`). No detail given.

## Diagnosis (after looking at every third frame of v4, frames 2947–3202)
- Twelve 2-beat cuts, but only two of them have anything happening inside the cut (the radial reveal of the fins in
  7.A3b, the sweep on the pad in 7.A4b). Every other cut is a still plate with a slow push and survey rings drawn over
  it. The stage only changes when the plate is swapped on a cut.
- The same plate is held for three or four cuts in a row at a different crop (K_7.A2 ×3 plus the first half of a
  fourth, K_7.A3 ×2, K_7.A4 ×4), so it reads as repetition, not progress. The construction is told by the caption.
- It is a time-lapse with none of the cues of one: nothing accumulates, no light moves, no machine moves.
- The four stage plates do not match each other: K_7.A2 is soft and pink-orange with a glow, the others are crisp
  gold; the mounds are drawn two different ways in K_7.A3 and K_7.A4; all the reactor vignettes are larger than the
  layout's compressed reactor.
- Captions against canon (`render/scenes/guanghan3d/layout.js`, `docs/guanghan_layout.md`): `SOLAR MASTS · 18 M`
  (canon 20 m), `LANDING PAD · ⌀ 60 M` (canon sintered disc Ø 50 m), `SHIELD SHELL 2 M` (canon 2.5–3 m),
  `READY FOR CREW` at Day 089–097 (canon: the crew lands on Day 001; Day 097 is "lights on"), shells printed on Days
  001–023 (canon: shells are printed robotically, Days −400 → −20). `1100 °C` and `101 kPa` are not sourced in the
  companion documents.

## Approach chosen, and why it differs from the brief
The brief suggested per-element masks cut from the differences between the stage plates, with reveals driven in JS.
I draw the station live instead: a small oblique line renderer (`render/src/scenes/buildsite.js`) that takes every
number from `layout.js` and projects it with the plates' own camera (ortho 210 m wide, from bearing 315, elevation 33°,
target (22, 0, 22): I checked the projection against K_7.A3 / K_7.A4 and it lands on the painted masts, mounds, hub,
tunnels, nodes and pad to within a few pixels). Reasons:
- masks can reveal a drawing but cannot move it: panels turning to follow the Sun, a mast telescoping, a fan of fins
  opening, a printer's bridge crossing a shell all need the geometry;
- counts, positions and heights are canon by construction (six masts on the r 55 m ring, 20 m tall, panels 10.5–19.5 m;
  tower 25 m; 12 fins over 150°; courses 0.6 m; and so on);
- lines stay sharp at any framing (the plates go soft past about 1.4×);
- one drawing hand for all twelve cuts (no K_7.A2 look change), and the light can be part of the drawing.
The house style already has this language: shot 1.2's launch pad (`scenes/jiehua.js`) is ruled gold line laid down by
code in build order.

## What each of the twelve cuts shows now
All cuts stay on the same beats (bars 67–72, beats 1 and 3; lint OK). Each cut is a few days of time-lapse, so the day
counter jumps on the cuts and runs inside them; the event of each cut lands on its second beat (u = 0.5).

| Shot | Time | Days | What is being built inside the cut | Caption |
|---|---|---|---|---|
| 7.A0 | 122.77 | −640 | unchanged: the painted plan K_7.A detonates into gold line | `GUANGHAN STATION · 89.5° S · THE PLAN` |
| 7.A1 | 123.67 | −640 → −633 | two rabbit robots rule the plan onto bare regolith: roads, the cross, six ovals, a stake at every eighth of each oval; reactor site staked; the cargo lander's shadow sweeps like a sundial hand | `SITE SURVEY · RIDGE 89.5° S · SUN 0–1.5°` |
| 7.A1b | 124.55 | −530 → −523 | mast M3 telescopes up, its blanket unrolls from 10.5 m to 19.5 m and turns to the Sun; M2, already up, turns with it; both mast shadows sweep the foreground | `SOLAR MASTS · 20 M · TRACKING THE SUN AROUND THE HORIZON` |
| 7.A2 | 125.45 | −407 → −400 | hub down; four ribbed tunnels extend to their end nodes; four modules roll in on wheeled cradles and dock; connectors close | `PRESSURE VESSELS LANDED · 4 MODULES` |
| 7.A2b | 126.34 | −204 → −200 | the gantry's bridge crosses the SW module once a day (every eighth note) and leaves one more 0.6 m course; two print heads with a glint each; the vessel shows through the open top | `REGOLITH PRINTER · SHIELD SHELL 2.5 M · ONE 0.6 M COURSE A DAY` |
| 7.A2c | 127.23 | −43 → −37 | the lattice comms tower rises bay by bay; on the beat the dish goes up and comes round to bearing 000 | `COMMS TOWER · 25 M · DISH ON EARTH` |
| 7.A3 | 128.11 | 001 | the crew lander comes down beside the staked (unbuilt) pad site; regolith thrown out flat, no cloud; its shadow arrives from about a kilometre away as it touches down, on the beat | `CREW LANDER DOWN · BARE REGOLITH, 2.0 KM EAST` |
| 7.A3b | 129.00 | 005 → 011 | twelve radiator plates swing out of one closed stack like a folding fan, 150° on the far side of the berm; a small suited figure stands by (the reactor is cold) | `FISSION SURFACE POWER · 100 kWe · PRE-CRITICAL` / `ADAEZE OKAFOR · 1.0 KM OUT · RADIATOR, 12 PANELS` |
| 7.A3c | 129.89 | 013 → 019 | a rabbit lays the cable from the reactor, under the berm, down the service road to the S node; it connects on the beat and a pulse runs back; nobody at the reactor now | `POWER ON THE GRID · 1.0 KM CABLE` |
| 7.A4 | 130.78 | 027 → 031 | the cupola's eight slatted petal shutters retract one after another; glass, ribs, ring, a first warm light inside | `CUPOLA · SHUTTERS OPEN · DAY 030` |
| 7.A4b | 131.67 | 062 → 066 | the laser rover circles the pad once a day and leaves one more sintered pass (four in the cut) | `LANDING PAD · ⌀ 50 M · LASER-SINTERED REGOLITH` |
| 7.A5 | 132.56 | 090 → 097 | the whole station: hub windows, cupola, then the tunnels' portholes come on one by one; masts turn; the station's shadows swing from lower left through straight down to lower right | `GUANGHAN STATION · 89.5° S · LIGHTS ON` |

Shot ids changed to follow the layout's construction stages (old: A1, A2, A2b, A3, A3b, A3c, A3d, A4, A4b, A4c, A4d).
`docs/script.md` (section 7 · A) is rewritten to match; `docs/production_tracker.md` is generated and not regenerated.

### Caption and timeline changes (all toward canon)
- `18 M` → `20 M`; `⌀ 60 M` → `⌀ 50 M`; `SHIELD SHELL 2 M` → `2.5 M`; "one course per sol" → `ONE 0.6 M COURSE A DAY`
  ("sol" is ambiguous on the Moon; 0.6 m is the layout's course height; the rate of one a day is the film's own).
- Dropped: `1100 °C` and `HABITAT RING · PRESSURISED · 101 kPa` (no source in the companion documents), `READY FOR CREW`
  (the crew arrive on Day 001). New captions use only layout numbers: tower 25 m, pad Ø 50 m, courses 0.6 m, Day 030 for
  the shutters (layout §3: "before Day 030").
- The order now follows the layout's stage table: survey and first masts (stage 1), vessels, shells, comms (stage 2),
  crew landing, radiator, power (stage 3), cupola, pad (stage 4), lights (stage 5). In v4 the shells were printed after
  the crew arrived and the masts came last.
- `REGOLITH MOVED` is now a function of the day, not of film time (0 at −640, 9 000 t at −400, 36 500 t at −20, flat over
  the landing, 48 000 t at 097). The end figure is the one already on screen; I could not find a source for it. My own
  estimate: six shells about 13 000 t, reactor and pad berms about 5 000 t, grading a 400 m plateau by 10 cm about
  20 000 t, so 40–50 000 t is plausible, but it is an estimate, not a sourced number.
- 7.A0's two dimension callouts read `2 M SHELL` and `18 M`; the list they come from now holds layout numbers
  (`2.5 M SHELL`, `20 M`).

## What I built
- `render/src/scenes/buildsite.js` (new, about 700 lines): projection, pen with hidden-line erase, solids (vertical
  cylinders, ribbed tubes with end domes, boxes), masts with Sun-facing wings, lattice tower and dish, hub with arched
  windows, portholes, dome, ribs, ring and petal shutters, regolith mounds (a printed shell of ruled 0.6 m courses with
  the vessel visible inside, or the finished heap with a hand-like outline, ridge lines and bunched 皴 hatching), gantry
  printer, reactor (drum, 12-plate fan, hatched berm, a small figure), pad (blast berm ring with its gap to the road,
  sinter passes, laser rover), rabbits, landers, roads, footprints and stakes, cable, shadows, lights, and the
  storyboard (`CUTS`). Registered in `render/src/shots.js` (one import, one name).
- `render/src/sections/07_drop.js`: the A block now lists 7.A0 as before plus eleven `buildsite` cuts; `buildHud` reads
  each cut's day window from the scene so the counter and the Sun cannot disagree. One import line added at the top.
  `HUB`, `PAD` and the per-cut `plan(...)` plates are gone; `plan`, `dayCounter`, `blueprint`, `glowLines`, `pmap`, `flat`
  are untouched (7.A0 and 7.E2 use them). Nothing outside the A block was changed.
- No new image assets. K_7.A1–A4 are no longer used by the montage (K_7.A and K_7.A1 are untouched and still used by
  7.E2; 7.E2 at 181.3 and 181.9 s renders without error).
- Docs: `docs/script.md` 7.A rows; one bullet in `docs/guanghan_layout.md` (the sense of the Sun's motion, which the
  bible did not state); a short section in `render/README.md`.

## How the Sun's motion was derived
- Rate: one turn of the horizon per synodic month, 360° / 29.53 d = 12.19° per day (layout bible: "circles once per
  29.5 days").
- Sense: the bible does not say. The Moon rotates prograde, like the Earth, so the sub-solar point moves west and, seen
  from the south pole, the Sun moves right to left (as it does at Earth's south pole). On the plan (bearings clockwise
  from grid north, seen from above) its bearing decreases. The jiehua camera looks down from above, so handedness is
  kept: on screen the shadows turn anticlockwise. Checked in the render: in 7.A5 they go lower left → straight down →
  lower right.
- Bearing: `sunBearing(day) = 200° − 12.19° × day` (200° is the bible's Sun for 7.E1; the phase is otherwise free).
  Day windows were chosen so that shadows fall where they can be seen: for example 7.A1b −530 → −523 puts the mast
  shadows through the foreground; 7.A5 ends on Day 097 exactly.
- Elevation: a constant 1.2° (inside the bible's 0–1.5°). Shadow length = height / tan(1.2°) = 47.7 × height: mast 954 m,
  quadrant mound 358 m, hub with cupola 515 m, a tunnel's crown 150 m. Everything runs off the 210 m frame, which is
  correct at this Sun. The mast panels' own shadows fall 500–930 m away and are never in frame, so only the poles'
  shadows are drawn.
- Thin casters fade: the Sun is 0.53° across, so a 0.44 m pole has no umbra beyond about 48 m; its shadow is drawn
  widening and thinning as 1/distance. Wide casters keep theirs.
- The shadow layer is three exposures across each 1/24 s, averaged, then composited as a deeper indigo (multiply).
- Panels: the wings' normal points at the Sun's bearing (layout: "the mast panels always face the Sun"); the grid is
  drawn brighter when we see the sunward face.
- Mounds: each hatch stroke carries its surface normal; strokes in the light are faint, in the shade full, so the
  hatching travels round the mounds with the Sun.
- Not physical, by choice: all ground shadows are thinned to half strength at 320 m so the far ground does not go heavy;
  ground shadows show through line-drawn solids instead of climbing them; the seasonal change of the Sun's elevation
  over the 737 days is ignored; the inset reactor and pad cast shadows as if they stood where they are drawn.

## Frames checked
- v4: every third frame, 2947–3202 (before anything else).
- New render (`render/out/rev2_build/frames`, 540p): every third frame of all twelve cuts, as per-cut sheets
  (`render/out/rev2_build/sheets/cs_*.jpg`) and one sheet (`montage_after_sheet.jpg`); consecutive frames 3036–3043
  (printer) and 3097–3112 (radiator); the cuts 2966–2969 and 3201–3204 (into 7.B1's ink flash).
- 1080p stills of ten cuts (`render/out/rev2_build/stills/hd_*.png`) for line quality at the tightest framings
  (cupola 5.0×, radiator 5.1×, landing 5.5×): lines are vector strokes and stay sharp.
- Frame-to-frame difference profile inside each cut: smooth, no spike. `render/tools/flicker_check.py`: 0 flagged.
- Order independence: four frames rendered alone are identical to the same frames rendered in sequence when the HUD is
  off (`--notype`). With the HUD on they differ by a few grey levels: see the next section.

## Found on the way (not mine to fix): the drop's HUD leaves a canvas shadow on the shared layer context
`sections/_lib.js` `hud()` sets `shadowColor / shadowBlur 8 / shadowOffsetY` on the pipeline's one 2D layer context when
the shot is in `07_drop`, and nothing resets it (`core.js` `layer()` resets transform, alpha, composite and filter only).
So every 2D layer drawn after the first HUD call in a worker is drawn with a soft black drop shadow, and the first frame
a worker renders is different from all its others. Measured on untouched 7.A0: frame 2952 rendered alone against the
same frame rendered third differs by up to 56 grey levels, mean 6.9 (the `glowLines` and `blueprint` layers gain a
shadow). That breaks "any frame renders the same in any order", and a worker's first frame inside a drop shot can be a
one-frame pop. In my scene it made a clip plus `destination-out` wipe most of the picture on every frame but the first,
which is how I found it; `buildsite` now resets the shadow state at the top of each of its layers. A general fix is
two lines (reset in `hud()` after drawing, or in `layer()`), but it changes how every later 2D layer in the drop looks
(they have all been seen with the accidental shadow), so I left it for whoever owns the section.

## What still does not meet the bar, or that I am unsure of
- I judged from frames and sheets, not at speed with the sound. The clips are there to be watched.
- The ground changes on the cut from 7.A0 to 7.A1: the K_7.A plate is a greyer slate (about #2F3345) with orange-pink
  line, the live build is the engine's 磁青 indigo (about #131D38, the same paper as shot 1.2 and closer to the style
  guide's #16213E) with yellow gold. It comes right after the detonation flash, but it is a visible change of paper.
- The mounds are drawn by rule, not by hand. They read as hatched rock at 1080p, but they are plainer than K_7.A's.
  The rabbits and landers are schematic glyphs; at 5× the lander is a simple drawing.
- 7.A2c (comms tower) is the plainest cut: one tower rising on mostly empty paper.
- 7.A3 holds on the landed lander for the last ten frames with only settling dust and a rabbit moving.
- In 7.A2 and 7.A3c the station's combined shadow is a large dark slab across the frame. It is where the light would
  put it, but it is heavy.
- The reactor inset is drawn at the layout's compressed scale (0.8), which is smaller than every painted plate drew it;
  the wide shots show a small reactor. The fins follow `layout.js` (3 m wide, 9 m tall), not K_7.A's broader plates.
- The printer gantry is drawn 25 × 21 × 9.6 m so that it clears a 22 × 18 × 7.5 m shell; the blockout's is 21 × 16 × 8.5.
- The time-lapse is not literal everywhere: machines move at screen speed, not at 8 days a second; the landing cut
  holds the counter at Day 001.
- `REGOLITH MOVED 48 000 t` is unsourced (see above). Day windows other than the stage boundaries are mine.
- `docs/production_tracker.md` still lists the old 7.A rows.

## Files
- Clips: `render/out/rev2_build/montage_after.mp4`, `render/out/rev2_build/montage_before.mp4` (122.0–134.5 s, 540p,
  with audio). Sheets: `montage_after_sheet.jpg`, `montage_before_sheet.jpg`, `sheets/cs_*.jpg`.
- Code: `render/src/scenes/buildsite.js` (new), `render/src/sections/07_drop.js` (A block, one import, `DIMS`),
  `render/src/shots.js` (registration).
- Docs: `docs/script.md`, `docs/guanghan_layout.md` (one bullet), `render/README.md` (one section), this report.
