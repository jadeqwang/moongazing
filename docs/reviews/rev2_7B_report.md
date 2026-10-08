# Oct 8 revision — 7.B2 / 7.B3 scale fixes and owed emblems

The requested size fixes are applied, new motion takes are picked and wired, and the final half-scale renders have been inspected. Emblems are patched for 7.B1, the new 7.B3 take, and all three astronauts in 5.1. No commit made.

Review clips, with trimmed master audio:

- [7.B review, including the adjoining cuts](../../render/out/rev2_7B/rev2_7B_540p.mp4): global frames 3202–3333, 960 × 540, 24 fps.
- [5.1 emblem review, including both cuts](../../render/out/rev2_7B/emblem_5_1_540p.mp4): frames 2432–2521, 960 × 540, 24 fps.

These are short pipeline review clips. The v5 full cut has not been encoded. Its existing Part 1 frames for 5.1 predate these emblems; re-render 101.334–104.919 s through `render_verified.sh` before using those frames in v5.

## Keyframe edits and checks

Read the revision brief and rules 1–9, the HANDOFF update, the prior 7.B2/7.B3 report, companion research, and the existing 7.B1_B3 blockout. Scale references: 16 mm oxygen tubing, 110 mm wheel, 30 mm cups, and 25 mm rosette.

Both edits used the built-in `image_gen`, supplied with the original keyframe, the relevant character sheet, and the blockout view. Raw results and final composites were viewed at full size and checked against rule 4 before submitting video. [Edit briefs, masks, registration and checks](../../media/keyframes/work/rev2_7B/) are retained alongside the raw outputs.

**7.B2:** backed up the old keyframe as `media/keyframes/K_7.B2_v5.jpg`. The brass line is now finger-thick beside the white gloves; the wheel fits one gloved palm. Grips remain plausible, with two hands and no extra digits, white gloves and pale-blue trim, no red, and no exposed face. The local composite uses two polygon regions with an inward 9 px feather. Reactor, bottles and the rest of the scene outside those regions remain pixel-identical.

**7.B3:** backed up the old keyframe as `media/keyframes/K_7.B3_v3.jpg`. Cups and rosette are approximately half their previous dimensions, with six cups in the same two-row arrangement: one front-middle flat rosette, two seed-leaf pairs, three bare cups. The original gauntlet and millimetre card were protected during the feathered composite. Lúcia's face, hair and neck remain pixel-identical to the old keyframe. Her eyes still look toward the experiment, her arm enters the right port, and the visible glove has plausible anatomy. No red was introduced.

Canonical `.jpg` paths contain lossless PNG data, preserving decoded pixels instead of globally recompressing JPEGs. PIL, OpenCV and the renderer load these correctly. [Final pixel audit](../../media/keyframes/work/rev2_7B/final_pixel_audit.json) confirms zero changes outside the recorded polygons and the separately requested chest emblem, and confirms Lúcia's face is unchanged. Immutable PNG first-frame snapshots prevent later emblem work from changing a take's recorded source.

## Takes, roto and wiring

All delivered takes are Seedance 2.0, 720p, four seconds (97 frames). Prompts start from the previous picks' sidecars, retaining the action and adding explicit scale, continuous-motion and no-red constraints. Each delivered take was scored and inspected on a 16-frame sheet before roto; hand/plant and face crops were also inspected. Verdicts are saved in the sidecars.

| Shot | Take | First-frame score / shift | Verdict |
|---|---|---|---|
| 7.B2 | take_7 | .987 / 0 px | Pick: continuous small wrist turns and regrips, stable small hardware, white gloves. |
| 7.B2 | take_8 | .975 / 0 px | Usable alternate; less early movement. |
| 7.B3 | take_11 | .985 / 0 px | Pick: continuous card/wrist and head movement, six stable cups, no plant growth during the take. |
| 7.B3 | take_12 | .974 / 4 px | Rejected: invents additional plants, including in frame 0. Never roto-prepped. |

Take 11 draws the raw motion-base plant more upright than the edited flat rosette. The final roto retains the stationary painted plant and corrected cup sizes; the render frames below confirm their appearance does not grow or morph.

Selected takes were prepped with the previous picks' standard options (`--k 10`, no remouth/eyelock). Both `meta.json` files point to the immutable, corrected first frames. Re-ran `roto_keep.py` after 7.B3 prep with the old face polygon, feather 5 and smooth 2.5, without a still lock. Tracking: 400 corners, minimum 350 inliers, maximum 9.55 px travel and 0.62° rotation. [Face keep sheet](../../render/out/rev2_7B/B3_face_keep.jpg) inspected; no moustache or smeared face in final renders.

`media/gen/picks.json` selects 7.B2/take_7 and 7.B3/take_11. Immediately re-read `07_drop.js` before each edit and changed only the two corresponding clip lines. Kept framing and timing: B2 offset .5, lock 0; B3 offset .9, rate 1.6, lock 0. `node tools/lint_shots.mjs` printed `OK` immediately after each edit. Final assembled shot table confirms both use roto, with no still fallback.

## Emblems

Added one entry each in `tools/emblem_patch.json` for K_7.B1/take_10, K_7.B3/take_11 and K_5.1/take_2, then ran `tools/emblem_patch.py`. Original keyframes are retained as B1_v4, B3_v4 (the size-edited key before emblem), and 5.1_v1. Existing B1 and B3 keeps survive the patch pass; all selected roto folders remain newer than their keyframes.

Inspected placement previews and tracking sheets in [emblems/](../../render/out/rev2_7B/emblems/). B1 replaces the incorrect chest disc; B3 adds the real emblem above the glove-port rim on her left chest; 5.1 carries three small chest emblems. The dark B3 shirt initially made its badge nearly black, so the patch tool now accepts an optional per-placement `white` lighting reference (default remains 246). B3 uses 70: the gold rim/sunbeam and pale-blue dot are visible without altering its size or position. Re-ran the patch and inspected the final render. Lossless canonical composites preserve surrounding pixels.

## Render frames inspected

All test renders used scale .5, at most two workers, under `render/out/rev2_7B/`. Contact sheets show actual final render frames at their native aspect ratio. Frame numbers below are global, at 24 fps.

| Shot / folder | Frames inspected on sheet | First three / cuts |
|---|---|---|
| 7.B1, `frames_B1/` | 3202, 3203, 3204, 3205, 3206, 3210, 3215, 3220, 3222, 3223, 3224, 3225 | First three 3203–3205; incoming 3202/3203; outgoing 3223/3224. |
| 7.B2, `frames_B2/` | 3245, 3246, 3247, 3248, 3252, 3258, 3264, 3270, 3276, 3282, 3286, 3287 | First three 3246–3248; incoming 3245/3246; outgoing 3287/3288 (next folder). |
| 7.B3, `frames_B3/` | 3287, 3288, 3289, 3290, 3294, 3300, 3306, 3312, 3318, 3324, 3329, 3330, 3331, 3332, 3333 | First three 3288–3290; incoming 3287/3288; outgoing 3330/3331. |
| 5.1, `frames_5_1/` | 2432, 2433, 2434, 2435, 2448, 2460, 2472, 2484, 2496, 2512, 2517, 2518, 2519, 2520, 2521 | First three 2433–2435; incoming 2432/2433; outgoing 2518/2519. |

Sheets: [B1](../../render/out/rev2_7B/sheet_B1.jpg), [B2](../../render/out/rev2_7B/sheet_B2.jpg), [B3](../../render/out/rev2_7B/sheet_B3.jpg), [5.1](../../render/out/rev2_7B/sheet_5_1.jpg). Also inspected native 960 × 540 frames B1/3215; B2/3246, 3248, 3276; B3/3288, 3289, 3290, 3318, 3330; and 5.1/2433, 2484, 2519. B3's final sheet was rechecked after the badge-lighting adjustment.

Both short clips decode fully, with audio: 132 and 90 frames respectively. `flicker_check.py`: B2 42 frames, zero flagged; B3 43 frames, zero flagged. Frames establish the anatomy, scale and cut checks; this report does not claim an end-to-end watch of the full film.

## Still short

- B3: breath fog remains near the unused left port rather than directly below her mouth, and is still faintly visible at the cut ([3318](../../render/out/rev2_7B/frames_B3/f_003318.jpg), [3330](../../render/out/rev2_7B/frames_B3/f_003330.jpg)). No indicator blink is discernible; the white inspection-light pool is absent. The first HUD line still crosses busy chamber/lid lines ([3288](../../render/out/rev2_7B/frames_B3/f_003288.jpg)). These prior issues were outside the approved size edit.
- B1: the existing two-frame ink flash consumes its first two frames ([3203](../../render/out/rev2_7B/frames_B1/f_003203.jpg), [3204](../../render/out/rev2_7B/frames_B1/f_003204.jpg)); the moving forearm remains a little softer than the painted body ([3215](../../render/out/rev2_7B/frames_B1/f_003215.jpg)). Its prior hardware/staging qualifications remain.
- 5.1: badges track the small figures but their dot/beam is too small to read clearly at 540p ([2484](../../render/out/rev2_7B/frames_5_1/f_002484.jpg)). The far astronaut's patch is intermittently occluded by the moving arm; its tracking sheet also records occasional feature loss. No visible detached badge was seen in the checked frames.
- B2: the brass scale and 480p-source issues are addressed. Existing busbars still have no +/− marks ([3246](../../render/out/rev2_7B/frames_B2/f_003246.jpg)).

Video budget: six submissions at $0.60 = **$3.60 gross estimate**, within the $8 cap. B3 takes 9/10 failed with provider error 7003; copied the old successful take's virtual-avatar flag and submitted replacements 11/12. The spend log records $1.20 refunds, giving **$2.40 net estimate** (not a provider billing statement). Four delivered takes were inspected; three passed, one was rejected. Images used the built-in tool. [Job spend audit](../../media/keyframes/work/rev2_7B/spend_audit.json).
