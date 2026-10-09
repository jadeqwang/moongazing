# rev2_hair — hair and helmets (Oct 8 2026)

Status: DONE for 1.4a and 1.4b (rendered and looked at); two remarks left for the owners of sections 04 and 06 (see "For others").

## The note (Jade, on `render/out/fullcut_v4_540p.mp4`)
"0:24 crew shot, ponytail is sticking through the helmet (glitch), the hair should maybe be tucked inside the space
suit?"

Shots: 1.4a (22.75–24.07 s, frames 546–577, `K_1.4a`) and 1.4b (24.07–25.01 s, frames 578–600, `K_1.4b`), both in
`render/src/sections/01_intro_b.js`.

## What was wrong (looked at full size in the keyframes and in v4 frames 546–600)
| Shot | Person | Fault |
|---|---|---|
| 1.4b | Jade (left, from behind) | Low ponytail to mid-back hangs OUTSIDE the suit, through the blue rim and clear visor of the thrown-back soft helmet. The glitch Jade saw. |
| 1.4a | Anastasia (2nd in line) | Braid hangs forward over the neck ring onto the chest: it lies across the seal the visor closes on. Same fault, less obvious. |
| 1.4a | Lúcia (last in line, small) | Loose tail over her shoulder, the tip resting on the neck ring. Minor, same fault. |
| 1.4a | Adaeze, Arjun | Short hair. Fine. |
| 1.4b | Chen Yu, Kenji | Short hair. Fine. |
| 1.4b | Layla | Low bun at the nape, inside the helmet opening. Fine (this is the right answer already). |

## What is physically right
A launch-and-entry suit of this family (Sokol and its Chinese relative) is one piece: the soft helmet is part of the
suit and the visor closes onto the neck ring, so everything above the ring has to fit inside the helmet and nothing
can lie across the ring. NASA's own rule for long hair is that it is confined "in a ponytail, braids, or other manner"
(Smithsonian NASM, object A20050063000, Pam Melroy's scrunchie), and under the helmet crews wear the fabric
communications cap ("Snoopy cap", the Communications Carrier Assembly) that holds hair down and carries the
earphones and microphones. So for launch long hair is braided or put in a low bun at the nape, or the tail is tucked
down inside the suit collar, never loose outside. `docs/research_capsule_interior.md` already records how strict the
real closeout is about seals ("even a single strand of hair" on a seal is a problem).

Honest limit of the research: I found no published written procedure that says "bun" or "braid" for a pressure-suit
launch; the conclusion rests on the suit's construction, the NASA hair rule and the comm cap, and on what launch-day
photographs of long-haired crew show (hair tied low or braided and inside the helmet).

Sources:
- Smithsonian NASM, "Scrunchie, Space Shuttle, Melroy": https://www.si.edu/object/nasm_A20050063000
- Science Museum Group, Sokol suit (one piece, integral helmet): https://collection.sciencemuseumgroup.org.uk/objects/co8030220
- ESA, Samantha Cristoforetti, "L-34: Our Sokol to go to space": https://outpost42.esa.int/blog/diario-di-bordo/single/l-34-our-sokol-to-go-to-space/

## What the film had already decided
- `docs/character_bible.md`: launch suit = "soft hood-helmet with a hinged visor, and a blue comms cap"; "Under the
  helmet: everyone wears a black-and-white fabric comms cap". Anastasia's braid and Layla's bun are both marked
  "(off duty)", i.e. not how they wear it in a suit.
- `docs/research_capsule_interior.md` §3: on the walkout the soft helmet is worn thrown back, visor open, heads bare.
  So no comm cap in 1.4a/1.4b/3.8b (it goes on before the helmet closes), which is true to Sokol walkouts.
- Jade inside a helmet elsewhere: `J_LS3` (shot 4.3, capsule) and `J_6.2` (shot 6.2b, surface): her hair is all
  inside the helmet, drawn back and going down behind the neck ring into the suit. So in 1.4b, from behind, the
  consistent picture is: hair gathered low at the nape, the tail tucked down inside the collar (her own suggestion).

## The rule now
Hair never crosses a helmet rim or neck ring. In any suit, long hair is gathered low at the nape (bun, coiled braid,
or the tail tucked down inside the collar); with the helmet closed it sits under the comm cap.

## Sweep: every shot where anyone wears a helmet or pressure suit
Looked at: the current keyframe of each shot at full size (heads cropped), and v4 frames
(`render/out/frames_v4_540/`, numbers given). Shot list from `node tools/shot_table.mjs`. The cold open (0.1–0.6) has
no suits or helmets at all (Chang'e, the old city, the roof deck), so there is nothing to check there.

| Shot | Time (s) | v4 frames looked at | Keyframe | Who / what shows | Verdict |
|---|---|---|---|---|---|
| 0.1–0.6 | 0–15.67 | (sheet) | K_0.3, K_0.4, K_0.5, K_0.6 | no helmets | n/a |
| **1.4a** | 22.75–24.07 | 546, 555, 565, 577 | K_1.4a | Adaeze, Anastasia, Arjun, Lúcia, soft helmets thrown back | **hair crosses the neck ring** (Anastasia's braid; Lúcia's tail). FIXED here |
| **1.4b** | 24.07–25.01 | 578, 584, 592, 599, 600 | K_1.4b | Chen Yu, Layla, Kenji, Jade from behind | **hair crosses the helmet** (Jade's ponytail). FIXED here. Layla's low bun, Chen, Kenji fine |
| 3.8a | 71.14–72.05 | (keyframe) | K_3.8a_glove | glove and wrist ring only | n/a |
| 3.8b | 72.05–72.95 | 1731, 1748 | K_3.8b_walkout | four from behind, helmets thrown back as hoods | hair fine: four short dark heads, nothing near a rim. (Sidecar calls them flight E1-A; at 15–45 px a low bun on Layla or Jade would not read, so no change) |
| 3.8c | 72.95–73.85 | 1755, 1770 | K_3.8c_whiteroom | one crew member from behind, helmet on and closed; technician in cap and headset | hair fine (none outside) |
| 3.8d, 3.8e | 73.85–74.75 | (keyframes) | K_3.8d_harness, K_3.8e_buckle | torso and hands only | n/a |
| 3.8f | 74.75–76.11 | 1796, 1822 | K_3.8f_visor | helmet from behind, gold visor closing | hair fine (none outside) |
| 4.3 | 81.46–82.88 | 1957, 1985 | J_LS3 (`J_4.3/take_1`) | Jade, face in the closed clear helmet | nothing crosses; hair is loose round her face inside the helmet and there is no comm cap (bible says cap). Section 04, not edited: see "For others" |
| 4.3b, 4.3c | 82.88–86.62 | (keyframes) | K_4.3b, K_4.3b_close | the splash park: M and T, no suits | n/a |
| 4.7 | 92.21–94.90 | (keyframe) | K_4.7 | Jade from behind, coasting after TLI, in the launch suit | nothing crosses (there is no helmet in the picture at all); her ponytail floats out over the collar, which is the script's free-fall cue. Suit continuity, not hair: the soft helmet that is part of this suit is missing from her collar. Section 04, not edited: see "For others" |
| 5.1 | 101.33–104.92 | 2440 | K_5.1 | three EVA suits, gold visors down | hair fine (none visible) |
| 5.4 | 109.50–111.95 | 2650 | K_5.4_rev_sys2 | one EVA suit from behind | hair fine (none visible) |
| 6.2a, 6.3 | 115.57–116.54, 118.80–120.99 | 2785, 2808, 2880 | K_6.2ii | Jade small on the rim, dark visor | hair fine (none visible) |
| 6.2c | 116.54–117.43 | (keyframe; shot is newer than v4) | K_6.2c | Adaeze kneeling, dark visor | hair fine (none visible) |
| 6.2d | 117.43–118.32 | (keyframe; shot is newer than v4) | K_6.2d | Layla walking, dark visor | hair fine (none visible) |
| 6.2b | 118.32–118.80 | 2830, 2845 | J_6.2 | Jade in profile in the clear bubble, sun visor up | hair fine: all inside the bubble, drawn back, the ends going down inside the neck ring. No comm cap (same remark as 4.3) |
| 7.B1, 7.B1b | 133.45–135.22 | 3210, 3230 | K_7.B1, K_7.B1_close | Arjun, mirrored visor; a glove | hair fine (none visible) |
| 7.B2 | 135.22–136.99 | 3260 | K_7.B2 | gloved hands only | n/a |
| 7.B3 | 136.99–138.76 | (keyframe) | K_7.B3 | Lúcia in a polo at the glove box, no helmet | n/a |
| 7.B4 | 138.76–140.54 | 3350 | K_7.B4 | Kenji, tiny, EVA suit | hair fine (none visible) |
| 7.B5 | 140.54–143.43 | 3400 | K_7.B5 | legs only | n/a |

Also checked because suits or the crew appear: K_7.A (line figures), K_7.E1/E1b/E1c (polos, no helmets), K_8.1 (capsule
under parachutes). Nothing to fix.

Result: the only hair-through-helmet faults in the film were in 1.4a and 1.4b. Nothing in sections 03 or 05 needed a change.

## What changed
**K_1.4b (shot 1.4b), one head: Jade.** Her hair is now drawn back, tied low at the nape (two ties) and the tail goes
down inside the suit collar; the thrown-back helmet's rim and clear visor are whole, and the suit back is bare where
the ponytail hung. This matches how her hair sits in her two other helmet shots (4.3, 6.2b: inside, drawn back, ends
going down behind the neck ring). Her head, ear, glasses, and the other three people are the old painting.
**K_1.4a (shot 1.4a), two heads: Anastasia and Lúcia.** Anastasia's braid no longer hangs over the neck ring onto her
chest: it is coiled in a low bun at the nape, inside the hood. Lúcia's loose tail is a low bun too. Faces, Adaeze,
Arjun, emblems, everything else are the old painting.

How: `google/nano-banana-pro` edit of each keyframe (prompts `media/keyframes/work/rev2_hair/EDIT_1.4b.txt`,
`EDIT_1.4a.txt`; refs `media/chars/crew/SHEET_polo.jpg` and `media/chars/jade_suit/SHEET_iva.jpg`), registered onto
the old keyframe (SIFT + affine: 423 and 673 inliers) and composited through feathered polygons
(`work/rev2_hair/reg.py`; polygons and feather in `K_1.4b.txt` / `K_1.4a.txt`). Outside the polygons the pixels are the
old keyframe's (checked before encoding; the file is re-saved as JPEG q97, so they are equal to within JPEG rounding,
not bit-identical on disk).

| File | What it is |
|---|---|
| `media/keyframes/K_1.4b.jpg` | new keyframe (v2) |
| `media/keyframes/K_1.4b_v1.jpg` | old keyframe (ponytail outside the helmet) |
| `media/keyframes/K_1.4a.jpg` | new keyframe, with the real emblems (written by `tools/emblem_patch.py`) |
| `media/keyframes/K_1.4a_v3.jpg` | new hair, WITHOUT the emblem tool's patches: the `_orig` the emblem tool starts from |
| `media/keyframes/K_1.4a_v2.jpg` | old keyframe (braid over the ring), with emblems |
| `media/keyframes/K_1.4a_v1.jpg` | older still: old hair, before the emblem tool (was `_orig`) |
| `media/keyframes/work/rev2_hair/` | edit prompts, raw edits, polygons, `reg.py`, `csheet.py`, `vsub.py` (video prompts) |

## Takes (prompts in `media/keyframes/work/rev2_hair/vsub.py`; verdicts also in each sidecar)
| Take | Model | Verdict | Looked at |
|---|---|---|---|
| `K_1.4b/take_3` | seedance-2.0 720p 5 s, ff 0.993, $0.75 | **PICK**, used from 1.0 s. Hair stays gathered and inside the collar for all 121 frames, rim and visor whole; Jade tips her head back from about 1.0 s; Chen Yu, Layla, Kenji faces stable, lips closed; emblems stay | `render/out/rev2_hair/sheets/K_1.4b_take_3_full.jpg`, `_crop0.jpg` (Jade, Kenji), `_crop1.jpg` (Layla, Chen Yu): 16 frames each |
| `K_1.4b/take_4` | seedance-2.0 720p 5 s, ff 0.993, $0.75 | alternate: equally clean, about 60% of take_3's motion, nearly still at the end | same three sheets, `take_4` |
| `K_1.4a/take_6` | h3 768P 5 s, ff 0.95, $0.40 | **PICK**, used 0.5–1.82 s. Buns stay, no braid or loose hair comes back, neck rings clear; lips closed, faces stable; one box and one hose each. The walkers gain ground to the right (the old pick walked on the spot) | `K_1.4a_take_6_full.jpg`, `_crop0.jpg` (16 frames), `_heads.jpg` (f10–f45, every 5th) |
| `K_1.4a/take_5` | h3 768P 5 s, ff 0.95, $0.40 | REJECTED: hair fine, but Anastasia's lips part at f20–f40 (reads as talking) and her face ages after 3.7 s | same sheets, `take_5` |

Roto prep: `tools/roto_prep.py K_1.4a/take_6 K_1.4b/take_3` with the default options, as the old picks had
(`keySource` in both `meta.json` = the keyframe, not frame 0). Re-applied after prep: the carried emblems
(`tools/emblem_patch.json`: K_1.4a `take` → take_6 and `_orig` → `K_1.4a_v3.jpg`; K_1.4b `take` → take_3; then
`tools/emblem_patch.py K_1.4a K_1.4b`; six patches tracked, no frame flagged; sheets
`render/out/rev2_hair/track/track_K_1.4a.jpg`, `track_K_1.4b.jpg`). Kept faces: neither old roto folder had a `keep`
entry, so there was nothing to re-apply. `media/gen/picks.json` updated for both.
Trap for the next person: re-running the emblem tool on K_1.4a rebuilds `K_1.4a.jpg` from `_orig`; that is now the
hair-fixed v3. Do not point `_orig` back at v1.

Section file: `render/src/sections/01_intro_b.js`, shot blocks 1.4a and 1.4b only (clip names, the 1.4b offset
1.5 → 1.0, comments). Framing, timing, cuts unchanged. Shot 1.2 untouched. `node tools/lint_shots.mjs`: OK.
Also: `docs/character_bible.md` (one line, "Hair in any suit"), `docs/script.md` (rows 1.4a, 1.4b), the two keyframe
sidecars.

## Render and what I looked at
- Clip: `render/out/rev2_hair/crew_after.mp4` (22.5–25.3 s, 960×540, with audio). Frames:
  `render/out/rev2_hair/frames/f_000540.jpg` … `f_000607.jpg`. Rendered twice with 2 workers; the two passes are
  byte-identical.
- 1.4a: frames 545 (last of 1.3), 546, 547, 548 (first three), 555, 562, 570, 576, 577 (last):
  `render/out/rev2_hair/after_1.4a.jpg`; heads enlarged at 546, 548, 552, 556, 562, 568, 574, 577:
  `after_1.4a_heads.jpg`. The breath-opening cut in from 1.3 is as before; walkers are in stride from 546; Anastasia's
  bun shows behind her neck in every frame, ring clear; Lúcia's too (she is about 25 px tall in the face at 540p).
- 1.4b: frames 578, 579, 580 (first three), 584, 588, 592, 596, 600 (last), 601 (first of 1.5, identical to v4):
  `after_1.4b.jpg`; Jade's head enlarged in the same frames: `after_1.4b_jade_heads.jpg`; before and after side by
  side: `before_after_jade_head.jpg`. No hair outside the suit or across the rim in any frame; the knot and the short
  tail are seen through the clear visor going into the collar; her head tips back through the shot.
- Not done: I judged from frames and sheets; I did not watch the clip at speed.

## Spend
Images: 2 × nano-banana-pro, about $0.27 (est.). Video: 2 × h3 768P ($0.80) + 2 × seedance-2.0 720p ($1.50) = $2.30.
Total about $2.57 of the $10.

## What falls short
- In 1.4b the thrown-back helmet hangs between us and Jade's nape, so its rim still passes in front of the back of
  her head and the hair knot is seen through the clear visor. That is the geometry of the shot (the other three have
  the same ring behind their heads), and nothing leaves the suit, but at 0.93 s a viewer sees "dark knot inside a
  bubble", not a clear explanation. If it still reads oddly, the next step is to drop the visor's outline over the
  hair or lower the helmet behind her shoulders.
- The two hair ties came out suit-blue, not dark.
- 1.4a keeps its tight headroom and thighs-up framing from the old pick; the new take walks forward, so a wider
  framing could now be tried. Not changed here.
- Research: no written launch-day procedure for hair was found (see "What is physically right").
- While the keyframes were newer than their roto folders (about 20 minutes, 09:05–09:24) any render by another agent
  would have shown 1.4a/1.4b as stills. Renders from 09:24 on are right.

## For others (not edited: sections 04 and 06)
| Shot | Section | Frames | What it shows | What it needs |
|---|---|---|---|---|
| 4.3 (`J_4.3/take_1`, keyframe `J_LS3`) | 04 | 1955–1989 | Jade's face in the closed helmet; hair loose round her face inside it, no comm cap | Nothing crosses the helmet, so no fault under Jade's note. For strict agreement with the bible ("everyone wears a comms cap" under the helmet) it would need a cap and the hair drawn back, which means repainting her likeness keyframe through the Jade-face pipeline. I would leave it unless Jade asks |
| 6.2b (`J_6.2`) | 06 | 2840–2851 | Jade in profile in the clear bubble; hair inside, drawn back | Same remark: no cap. No hair fault |
| 4.7 (`K_4.7`) | 04 | 2213–2277 | Jade coasting in the launch suit, ponytail floating over a bare collar | Hair is as scripted. The suit has lost its soft helmet (it should hang behind the neck as in 1.4a/b and 3.8b). If that keyframe is redone, the ponytail should come out of the collar in front of the thrown-back helmet, not through it |
