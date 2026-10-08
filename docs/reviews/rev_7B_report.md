# Oct 7 revision — 7.B1, 7.B1b, 7.B2, 7.B3

**Status: finished and rendered.** Keyframes repainted (codex), takes collected, checked on 16-frame sheets, roto-prepped, wired and rendered at half scale (Claude took over after codex hit its usage limit). No commit made.

Rendered clip (133.45–138.76, with audio): `render/out/rev_7B/rev_7B_540p.mp4`. Frames: `render/out/rev_7B/frames/f_003203.jpg` … `f_003330.jpg`.

Four frames worth looking at:
- 7.B1 `render/out/rev_7B/frames/f_003215.jpg`
- 7.B1b `render/out/rev_7B/frames/f_003237.jpg`
- 7.B2 `render/out/rev_7B/frames/f_003266.jpg`
- 7.B3 `render/out/rev_7B/frames/f_003318.jpg` (breath on the port glass)

Check sheets: `render/out/rev_7B/sheet_B1_B1b.jpg`, `sheet_B2_B3.jpg` (first three frames and three later frames of each shot; made before the caption and ink-style tweaks below), `b1b_foot_strip.jpg` (drill foot over the shot), `arjun_keepB.jpg` (Arjun at full scale).

## Source and staging record

Read the revision brief and its listed pipeline/style/character/script documents. Used the existing research rather than conducting another research pass: `companion_moon_experiments.md` §13 and §14, and `companion_isru.md`. The NASA/Honeybee/UF references, character sheets and existing keyframes were supplied to the image model. Research photos are reference material only, never film plates.

Reused `render/scenes/blockouts/7.B1_B3/main.js`. Scale comes from this blockout: mast 1.8 m, bit 25.4 mm, rover separation 3.5 m, base 1.2 m, cone 9 cm; chamber 60 × 40 × 40 cm, cups 3 cm, rosette 2.5 cm.

Blockout views:
- Drill: `render/scenes/blockouts/7.B1_B3/out/b1_wide.png`, `b1_close.png`, `b1_top_labeled.png`, `b1_side_labeled.png`.
- ISRU: `render/scenes/blockouts/7.B1_B3/out/b2_pov.png`, `b2_side_labeled.png`, `b2_top_labeled.png`.
- Plant: `render/scenes/blockouts/7.B1_B3/out/b3_hero.png`, `b3_side_labeled.png`, `b3_top_labeled.png`.

Image prompts, reference sheets and intermediate outputs: `media/keyframes/work/rev_7B/`.

## 7.B1 — Arjun sampling, 133.45–134.33

**Director's objection:** the rabbit appears to carry the full drill; Arjun's face is damaged and his body is rigid.

**On screen now:** a free-standing twin-rail mast on a braced, ballasted three-pad frame, centre frame, thin auger, brush wheel and a small pale cone at its foot. Yutu stands well back at left with a flood lamp, mesh wheels and a small cart, joined to the drill base by one slack cable on the ground. Arjun kneels at right, tipping a scoop into a canister; three sealed canisters on a rack by his knee; a gnomon by the cone. Black sky, a far band of sunlit rim. His visor shows a reflection of the lit ground, no face. HUD (stacked, top left): `ARJUN RAMAN · PSR` / `BITE 07 · 0.70 m` / `H₂O 3.1 wt%`.

Research §14g objections: 1 separate mount, 2 thin bit, 3 small clean hole, 4 brush and chute instead of a hose, 5 small pale cone, 6 pads, brush, cable, mast inside the frame, 7 nothing hangs in space, 8 helmet lamps and rover flood, 9 open crater, 10 no slate and no drawn face, 12 ground cable and containers, 13 HUD is a fresh reading: **resolved**. 11: mesh wheels resolved; Yutu's two ear panels are edge-on to camera but still stand upright (**partly**).

Keyframe `media/keyframes/K_7.B1.jpg` (source `media/keyframes/work/rev_7B/B1_wide_imagegen_v2.png`, prior `K_7.B1_v2.jpg`). `K_7.B1.txt` corrected (no rail on Yutu); `docs/character_bible.md` already gives Yutu only a 10–20 cm sampling auger.

Take: `media/gen/K_7.B1/take_10.mp4` (Seedance 2.0, 720p, first-frame r 0.988), used from 0.5 s, lock 0. His scoop arm and torso move from the first frame; drill, rover and cable hold. Alternate `take_9` (clean, less arm motion). Painted helmet and backpack are carried with `tools/roto_keep.py`; the ink redraw is run calmer for these two shots (`style: { boldA: 0.25, gran: 0.08, wet: 0.2 }`) because the default dry-brush contour turned his small moving arm and helmet into speckle.

**Still short:** the first two frames are the section's existing two-frame ink flash (black, then a splash), so about 0.8 s of picture remains; the action reads but only just. His redrawn forearm is a little softer than the painted body. The mast's amber loop reads as a round hose in the wide and as a flat ribbon in the close. The rim is a band, not a thread. The carrier behind Yutu is a wheeled cart, not the blockout's skid sledge.

## 7.B1b — drill-foot insert, 134.33–135.22

**On screen now:** the foot of the same drill: thin auger whose flights change phase on every drawing (it reads as turning), the bristle wheel, the short chute, a thin fall of pale powder onto a fist-sized cone beside a clean hole; ballast bags, frame leg and pad; Arjun's glove with an open canister at right. No face.

Keyframe `media/keyframes/K_7.B1_close.jpg` (source `B1_close_imagegen_v1.png`, prior `K_7.B1_close_v1.jpg`).

Take: `media/gen/K_7.B1_close/take_6.mp4` (Seedance 2.0, 480p, r 0.942), from 0.5 s, lock 0. `take_7` rejected for this window (no powder until frame 27, then a thick pour). The subject mattes of take_6 were edge-tightened to remove a grey halo around the brush and cone (originals in `media/gen/K_7.B1_close/roto/take_6/_s_orig/`; rerunning `roto_prep.py --force` would undo this).

**Still short:** the falling powder is thin and easy to miss at speed (see `b1b_foot_strip.jpg`); the bristles of the brush are a dark disc in the redraw rather than individual bristles; a faint grey smudge remains right of the cone. The take is 480p; a 720p retake would sharpen the redraw. The auger looks thicker than a thumb next to the nearer glove because of the low wide lens.

## 7.B2 — Jade's oxygen-skid maintenance, 135.22–136.99

**Director's objection:** why MRE, and does this hardware/action make sense?

The "why" is in `docs/companion_isru.md`. **On screen now:** first person, two white gloves and forearms (pale-blue trim, no red, no face) turning a brass handwheel on a gauge-fitted oxygen line with a lockout tag, at a skid apart from the cell. Behind: a closed, squat, foil-jacketed drum with a ribbed coolant band, two thick gold busbars (one to the anode rod and its lift on the lid, one to the base), an enclosed feed auger from the hopper, a small yellow-white sight glass on the lid, thin lines to four buffer bottles, coolant pipes through the wall, a floor keep-out line and boot prints. One orange ingot cools in a row of moulds beside a black slag puck. HUD: `JADE WANG · ISRU · MOLTEN REGOLITH ELECTROLYSIS` / `1,600 °C · 3.6 kA · O₂ 1.0 kg/h` (two lines; on one line the current sat behind the anode lift).

Research §8 objections: open port, melt colour, wheel on the reactor, missing conductors, open conveyor, bare hot wall at glove distance, hand-run production: **resolved**. Fat pipes: **partly**: the lines to the bottles are thin, but the brass run the valve sits on is wrist-thick, not finger-thick, and the wheel is two hands wide rather than hand-sized. The busbars carry no + / − marks.

Keyframe `media/keyframes/K_7.B2.jpg` (source `B2_imagegen_v1.png`, prior `K_7.B2_v4.jpg`).

Take: `media/gen/K_7.B2/take_4.mp4` (Seedance 2.0, 480p, r 0.905), from 0.5 s, lock 0, silk redraw with a gold line on indigo paper (as 3.8), so the gloves stay white. Wrists and forearms turn with the wheel and regrip; the ingot dims; the needle moves. `take_5` rejected: a red cuff band appears on the left arm.

**Still short:** the brass pipe size above. 480p source.

## 7.B3 — Lúcia's first Arabidopsis rosette, 136.99–138.76

**Director's objection:** the experiment is wrong in kind, movement starts late and facial lines resemble a moustache.

**On screen now:** low and close across a tray of six clear cups of grey regolith on white wick plugs inside a sealed chamber (LED lid, gasket frame, sensor, nutrient tube, top-down camera, two glove ports in the wall facing her). One flat rosette of spoon-shaped leaves, muted green with violet rims and stalks, is the only colour; two cups show seed-leaf pairs, three are bare. A black gauntlet through the right port slides a millimetre card up to the plant. Lúcia is behind the window, upper right, hair tied back, polo collar, clean face with no marks on the upper lip; her head tilts and her breath fogs the glass of the left port late in the shot. Leafy crop trays behind, in gold line. HUD: `LÚCIA FERREIRA · ARABIDOPSIS IN LUNAR REGOLITH` / `FIRST ROSETTE`.

Research §13e objections: 1 species and leaf shape, 3 small clear cups, 4 sealed and equipped chamber, 5 ports facing her and face outside, 6 leafy crops, 7 scale card and camera: **resolved**. 2 size: **partly**: the cups read about 6–7 cm and the rosette about 4–5 cm against the gauntlet (two fingertips or more), not 3 cm and 2–3 cm.

Keyframe `media/keyframes/K_7.B3.jpg` (source `B3_imagegen_v2.png`, prior `K_7.B3_v2.jpg`).

Take: `media/gen/K_7.B3/take_7.mp4` (Seedance 2.0, 720p, r 0.981), played from 0.9 s at 1.6× (`offset: 0.9, rate: 1.6`, lock 0) so the card slide and the breath both fall inside the bar; silk redraw with a gold line. Her painted face is carried by `tools/roto_keep.py` (max shift 15 px, 3° of tilt), so no redraw touches it. The plant does not change. `take_8` rejected: the rosette grows and morphs.

**Still short:** the plant and cup size above. The fog forms on the unused left port's glass rather than on the window in front of her mouth, and has only begun to clear at the cut. No indicator blink is visible. The white inspection-light pool of §13f is not drawn. The first HUD line runs over the gold lid lines and is hard to read.

## Delivery, spend and limitations

Section edits are confined to the 7.B1/7.B1b, 7.B2 and 7.B3 blocks of `render/src/sections/07_drop.js` (framing, focus, take wiring through `X.pick`, lock 0, offsets 0.5 / 0.5 / 0.5 / 0.9, captions); `node tools/lint_shots.mjs` prints OK. Picks and notes are in `media/gen/picks.json`; verdicts are in each take's sidecar. `docs/script.md` rows 7.B1–7.B3 were updated by codex and match, except that the script's HUD lines are written on one line and the picture stacks them.

Spend this round (vgen estimates, not a billing statement): 20 submissions, $7.20 estimated; 10 of them failed with provider error `7003: User Input Error` (all eight minimax/h3 requests and the first two Seedance 480p requests for 7.B3), $3.12 of that, logged as refunds. Net about $4.08 for ten delivered Seedance 2.0 takes. Images cost nothing (codex). No new takes were ordered after the handover.

No engineering validation is implied: the keyframes are illustrations of the researched configuration, not drawings to scale.
