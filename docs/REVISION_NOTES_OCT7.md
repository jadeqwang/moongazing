# Revision round after v3 — Jade's notes (Oct 7 2026, evening)

Timestamps are from `render/out/fullcut_v3_540p.mp4`. This file is the shared brief for everyone working on this round.

## The bar
We put out work we are proud of, at the standard of Orbital Sunrise. **Nothing may read as "obviously AI-generated":**
no glitchy mouths or faces, no scene-to-scene inconsistencies, no physics or anatomy that does not make sense, no
social staging that does not make sense (if someone shows a screen to someone, that person can see it). The film must
hold attention all the way through and the emotional arc must feel moving, never artificial. If a glitch is too hard to
fix, change the art style or framing so it stops mattering (wider, from behind, visor down, hands-only), rather than
ship it. This goes to the real moonbase teams for review after this round.

## Rules that apply to every shot in this round
1. **No dead start.** A shot must never open on a frozen frame and then start moving. Cut in when motion is already
   under way: in the section file use `lock: 0` and an `offset` of at least 0.5 s into the take, and prompt the video
   model for motion that is continuous from the first frame. No subject may freeze mid-shot either.
2. **Nothing in frame is a still unless it is meant to be** (a wall, a table). People breathe, blink, shift weight;
   hands holding things move a little.
3. **Check before roto.** After a video take comes back, make a contact sheet (12+ frames) and look at it: reject takes
   where an object morphs, flips or teleports, a limb appears or disappears, a face melts, or the action does not make
   physical sense. Only then run `tools/roto_prep.py`. After wiring, render a few frames of the shot and look again
   (roto can add its own artefacts: colour fringes, smeared faces).
4. **Check the keyframe before video.** Count hands and fingers. Check eye lines, which arm does what, balance, who can
   see what, hair length, clothing and emblem against `docs/character_bible.md` and the sheets in `media/chars/`.
   Give the image model the relevant character sheet(s) every time.
5. **When the staging is in doubt, build a Three.js blockout** (precedent: `render/scenes/guanghan3d/` and
   `render_guides.mjs`), look at it from more than one camera, and hand the chosen view to the image model as the layout
   reference.
6. **Emblem:** a pale-blue dot in a Voyager-style sunbeam. No red anywhere on uniforms or vehicles (red is for the
   character seals only).
7. **Jade:** very long straight black hair to mid-back (not longer); glasses always. Her likeness only comes from codex
   painting over her real photos at the matching camera angle (`media/keyframes/jade/PROMPTS_*.md` show how). In new
   shots prefer her from behind, visor down, or small in frame. Never trace the kids' real faces; M and T come from
   their sheets.
8. Keyframes being replaced: keep the old file as `<name>_vN.<ext>` first. New video takes go through `tools/vgen.py`
   (spend log, cap). Never launch codex with sandbox-bypass flags; use `codex exec -s workspace-write`.
9. Test renders: at most 2 workers per agent (`--workers 2`), 0.5 scale, into your own `render/out/rev_<id>/` folder.
   Run `node tools/lint_shots.mjs` after every section edit. Do not commit.

## Priority notes (Jade's words, with the shot each one maps to)
| v3 time | Shot | Note |
|---|---|---|
| 0:19 | 1.2 | Text becomes: "Every space program on Earth is building one moonbase together". |
| 0:24 | 1.4 | Glitchy face. "Maybe instead show multiple shots of astronauts instead of just me? I don't even know why this shot is here, honestly." |
| 0:27 | 1.6 | "If she were pointing at something, she'd be pointing with her right arm, not her left, or it would pull her off balance here. She should have her left arm around her father's neck." |
| 0:46 | 3.1 | "She picks up the teapot using the spout and then it glitches by flipping. Make it make sense, and run a check that whatever the video model returns makes sense before rotoscoping it. The little bit of stillness right as we cut into this scene is weird and reads as AI-generated; cut into the scene when movement has already started." |
| 0:51 | 3.2 | "The left hand should move, even just a little bit, rotating the spoon, or it looks glitched (like being frozen on zoom)." |
| 0:52 | 3.3 | "Instead of animating the words appearing on the screen, animate the finger moving next to the words, like she's reading it." |
| 0:55 | 3.4b (LS2) | "The lip sync is pretty borked; delete that shot and replace it with a different shot of the Copernican lesson." |
| 0:56 | 3.4c | "The eclipse on the side of the screen is not what you would get with this light and shadow. Delete the eclipse on the right, and have the moon cast a shadow rather than have the moon's shadow be lighter than the rest of the flashlight beam." |
| 0:58 | 3.5 | "Instead of showing a whole letter, better if she opens an envelope that says MISSION ASSIGNMENT on it; you're not expected to read the letter but we've populated it in case someone pauses. (Research what a real mission assignment might look like.)" |
| 1:06–1:10 | 3.7 / 3.7b | "The blue glow is glitching (roto?), and then Jade's face completely glitches for no apparent reason." Codex sweeps the whole cut for glitches like 1:10 and 0:24. |
| 1:11 | 3.8 | "The emblem is a holdover (should be the pale blue dot, no red). It makes sense to show many shots of many astronauts strapping in. Research what the inside of this particular rocket might look like. This section is a still image that isn't animated." |
| 1:19 | 4.2 | "All 3 of their eyes should be looking at the rocket. M would naturally be pointing with her right arm (the one in front of her father), not the one behind him, as she'd use that to hold onto his shoulder for balance." |
| 1:22 | 4.3 (LS3) | "The lip sync is also really bad here. I suspect the previous instance freestyled it instead of using Seedance for the lip-sync sections as instructed. Have a subagent check these and then do them properly." |
| 1:32 | 4.7 | "Hair length is incorrect; did the image model not receive the character sheet?" |
| 1:56 | 6.2 / 6.3 | "We don't need literal head lowering. Emotionally it makes more sense to be looking up at Earth, and for Earth to be full and recognizable in the sky. Keep the Earth full in both this shot and the one after it. She turns towards the Earth: she's looking 'towards home'; home is the salient word, not down." |
| 2:13 | 7.B1 | "The drill appears to be attached to the robot rabbit, which wouldn't physically make sense. Give the models all the information from the reference about the real lunar drill design from NASA. Also why is that guy's face so messed up?" |
| 2:16 | 7.B2 | "Molten regolith electrolysis: do we have a theory as to why we're expending a lot of energy on regolith smelting? If so write it into an md companion guide; otherwise other forms of extraction might make more sense. What are we extracting, and for what (biosphere? building materials?)" |
| 2:17 | 7.B3 | "Is this what this experiment would actually look like? Add to an md companion file, especially if there's a real analog; pull comparable visuals. Her movement is glitchy (still for a fraction of a second, then moves), and the lines on her face look weird, like she has a mustache." |
| 2:21 | 7.B5 | "Looks like a language model freestyled it without movement rather than letting a video model help with natural movement; there's nothing driving the rock, the astronaut is still the entire clip." |
| 2:28 | 7.C2 | "The robot dog she actually has does not have a head; it's a miniature copy of the Unitree dog made by a toy company. Research it and get an image." |
| 2:30 | 7.C3 | "She appears to have 3 hands. If she's holding the iPad with one hand she'd hold it so the weight rests on her leg. The point of this shot was to show her watching the RARE EARTH video and we never cut to see it: add an over-the-shoulder shot where you see part of the opening of RARE EARTH." |
| 2:32–2:40 | 7.C4 | "Better than before, but make sure each scene socially makes sense: if one person is showing something to another, lay the scene out so the other person can actually see the screen. Do this for each scene; build 3D models if you have to. At 2:37 no one's arm should be sticking out behind them." |
| 2:47 | 7.D3 | "Give her a little bit of natural movement here." |
| 2:51 | 7.D2 room wide | "Cut this one; looks too unnatural and the hair length is wrong. This gives us more time for more crew showing each other family clips full of longing." |
| 2:55 | 7.D4 | "Give her bow a little bit of actual movement, the whole time; no split second of being completely still and then moving." |
| 2:56 | 7.E1 | "Arrange this scene more naturally. I think it's an unfinished mock-up without the characters. Build a reasonable 3D model and give them some movement as they raise their cups to Earth." |

## Nice to have (after the priorities)
- 1:04 (3.6e): believable things on the screen and pages: the inside of an orbital-mechanics textbook, a paper typeset
  in LaTeX, a music player in a corner of the laptop.
- The montage of building the moonbase (7.A) could be better.

## Delivery
Codex renders a small version with all the fixes before we continue.

## How to work a shot in this round (pipeline cheat-sheet)
Read first: `docs/HANDOFF.md` (process lessons), `render/README.md`, `docs/GEN_OPS.md`, `docs/style_guide.md`,
the relevant parts of `docs/character_bible.md`, and the shot's rows in `docs/script.md`. Shot table with what each shot
currently uses: `cd render && node tools/shot_table.mjs`. Jade watched `render/out/fullcut_v3_540p.mp4`; pull frames
from it with `.venv/bin/ffmpeg -ss T -i render/out/fullcut_v3_540p.mp4 -frames:v 1 out.jpg` to see what she saw.

1. **Stage it.** Decide who stands where, which hand does what, where everyone looks, what the light does. If there is
   any doubt, make a Three.js blockout with simple mannequins at true heights (Jade 165 cm, Kenton 185, M 109, T 132)
   and render 2–3 camera views headless (see `render/scenes/guanghan3d/render_guides.mjs` for the headless-Chrome
   pattern). Keep blockouts in `render/scenes/blockouts/<shot>/`.
2. **Keyframe.** Images are free through codex's built-in `image_gen` tool:
   `codex exec -s workspace-write -i ref1.jpg -i ref2.jpg "…prompt… Use the built-in image_gen tool. Save the result to media/keyframes/<name>.png"`
   (never a sandbox-bypass flag; give it the old keyframe as edit target, the character sheets, the blockout view and
   any research reference images; `media/keyframes/jade/PROMPTS_*.md` show prompts that worked). Paid alternative:
   `.venv/bin/python tools/cf.py google/nano-banana-pro OUT.jpg --prompt "…" --set aspect_ratio=16:9 --set image_size=2K --set 'image_input=["file:a.jpg","file:b.jpg"]'`
   (edits keep the input painting's style well). Keep the old file as `_vN` first. Match the paper/style of the
   neighbouring shots (SILK / INK / GOLD, see the style guide). Look at the result yourself at full size and run the
   keyframe checks in rule 4 above; redo until it passes.
3. **Video.** `tools/vgen.py` / `tools/gen.py` (read their headers). `minimax/h3` or `bytedance/seedance-2.0` hold the
   first frame; Seedance 2.5 reframes it. Prompt for one clear, physically specific action that is already under way
   at frame 0 and continues to the end, plus small secondary life (breathing, blinking, hair, steam). Order 2 takes.
   Collect, score with `tools/ffcheck.py`, then make a 12–16 frame contact sheet and look at it (rule 3). Write your
   verdict into the take's sidecar. If both takes fail, fix the prompt or the keyframe; do not ship the least bad.
4. **Roto prep and wiring.** `MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python; $MPY tools/roto_prep.py <KEY>/<take>`
   from the repo root, add the pick to `media/gen/picks.json`, then in the section file use
   `{ type: 'roto', clip: …, offset: ≥0.5, lock: 0, … }`. A pick is only used when its roto folder is newer than the
   keyframe file. Section files are shared: re-read the file immediately before each edit, change only your shot's
   block, never reformat. `cd render && node tools/lint_shots.mjs` must print OK. Cuts must stay on beats (the lint
   checks); `B.bar(n, beat)` gives beat times.
5. **Look at the result.** Render the shot at half scale with 2 workers into `render/out/rev_<yourname>/` and encode
   it (commands in `render/README.md`); extract frames across the shot, including the first three frames and the cut
   into the next shot, and check them against the bar at the top of this file. Roto on faces can smear or fringe: if it
   does, raise fidelity, or show the painted keyframe for the face region, or restage so the face is not the weak point.
6. **Record.** Update the shot's row in `docs/script.md` if its content changed. Budget per agent: about $25 of video
   (spend is logged by vgen/gen in `media/gen/spend.jsonl`), images through codex where possible.
7. **Report honestly**: per shot, what Jade asked, what you changed, files, the frames you checked, and anything that
   still does not meet the bar (with the frame path). Do not call a shot done if you have not looked at its render.

---

# Second round — Jade's notes of Oct 8 2026 (after `fullcut_v4_540p.mp4`)

Her words, the shot each maps to, and where it stands in `fullcut_v5_540p.mp4`. Reports: `docs/reviews/rev2_*_report.md`.
Her open choices from both rounds are on the decisions page (link in `docs/HANDOFF.md`).

| v4 time | Shot | Note (verbatim) | In v5 |
|---|---|---|---|
| whole film | type | "words appear glitchy (including title screens and lyrics), flashing in and out" | Fixed. A render fault, not the type design: see "Render faults" below. |
| 0:19 | 1.2 | "Use 月球基地 instead of 月宫" | 这一次，/ 全世界 / 共建一座 / 月球基地, four columns. |
| 0:24 | 1.4a/b | "crew shot, ponytail is sticking through the helmet (glitch), the hair should maybe be tucked inside the space suit?" | Jade's tail goes inside the collar; Anastasia and Lúcia have low buns. All helmeted shots swept. `rev2_hair_report.md` |
| 0:45 | 2.5 / 3.1 | "lack of movement in Jade looks weird. suggested natural movements (to have a video model do, don't do it yourself): have jade turn to kiss M on the forehead, and have Jade's mom look at the tea that she's pouring" | `J_3.1/take_6`; keyframe v3 (mother's eyes lowered). `rev2_tea_report.md` |
| 1:22 | 4.3 | "let's try and let a video model lip sync here, and rotoscope over it" | Attempt made (`LS3c/take_7m`, pruna/p-video-avatar, own mouth kept); sync within a frame; NOT wired, her choice. `rev2_ls_report.md` |
| 1:56 | 6.2–6.4 | "we could shorten the English to "I think of home" and also a way shorter shot of my face and maybe show action shots of other astronauts, mid-action, looking at Earth and 乡 is accompanied by 'home' on the screen" | Done: 6.2c Adaeze, 6.2d Layla, face 12 frames, 乡 + home. Subtitle files not changed. `rev2_brk_report.md` |
| 2:03 | 7.A | "the montage of building the moonbase could be better" | Redrawn live from the layout (`scenes/buildsite.js`): every cut builds something, the Sun circles. `rev2_build_report.md` |
| 2:13–2:18 | 7.B2 / 7.B3 | "(suggested fixes, yes, do them) the brass oxygen pipe is wrist-thick where the research says finger-thick, and the handwheel is two hands wide; the cups and the rosette are about twice true size." | Done by codex, plus the emblem patches for 7.B1, 7.B3, 5.1. `rev2_7B_report.md` |
| 2:28 | 7.C2 | "(1) robot dog – actually, change it to the cat (2) the ddr screen, if you can show an accurate render of rare-earth-techno-remix (rare_earth_ddr_sample.mp4 is in the inputs folder)" | Cat bats at M's hem; TV redrawn from her step pack (`tools/ddr_screen.py`). `rev2_c2_report.md` |
| 2:58 | 7.E1b | "her hand holding the cup is facing the wrong way" | Left hand on the left arm. `rev2_toast_report.md` |
| 2:59 | 7.E1c | "both hands holding cups are holding them the wrong way (wrong hands)" | Each arm from its owner's shoulder, backs of hands; the cups no longer clink. |

Also from Jade this round: "please delegate boring/mechanical tasks like video encoding to codex across the tmux wall", and
"when you're done with this version, please commit to github".

## Render faults found this round (all fixed; keep the checks)
1. **Dropped layers.** v4 kept frames from an overloaded pass in which every 2D layer was missing from a frame that was
   still saved. The layer canvas is CPU-backed now (`core.js`).
2. **Frames depended on what the page had drawn before.** Three causes: Chrome moved 2D canvases between GPU and CPU
   rasterising mid-run (thin lines and type edges changed; fixed with `--disable-accelerated-2d-canvas`,
   `render/tools/chrome_args.mjs`); 2D state leaked between layers (the drop's HUD shadow fell on every later layer;
   each layer now runs inside `save()`/`restore()`); and Chrome could lose a full-canvas clear, so the previous frame's
   last layer ghosted into the next (the doubled scale label in the pull-back; the clear is now committed at once).
3. **Checks:** `render/tools/order_check.mjs` (same frame alone and in sequence must be identical),
   `render/tools/render_verified.sh` (every frame twice, with different chunk boundaries, compared byte for byte),
   `render/tools/flicker_check.py` (anything that drops out and comes back over a still background).
