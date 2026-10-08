# Moongazing — systemic-defect repairs (rev_sys), 7 October 2026

Scope: the shots the director did not list but where `docs/reviews/glitch_sweep_v3.md` found the same defects (held
subjects, dead starts, lock-dissolve double contours, still plates standing in for people). Two agents worked on this:
the first (cut off) made the parameter edits logged in `render/out/rev_sys/edits.jsonl` and ordered most of the new
takes; the second collected and judged the takes, prepped and wired them, rebuilt 8.2/8.2b, 5.1, 5.4, 7.C6, 7.B4, 8.3
and 0.4, and re-rendered and checked everything below. Lint prints OK (123 shots). Nothing is committed.

All clips are 540p with master audio in `render/out/rev_sys/`; frames are in `render/out/rev_sys/frames_<sec>/f_<global frame>.jpg`;
per-shot contact sheets in `render/out/rev_sys/sheets/`; raw-take sheets in `render/out/rev_sys/source_sheets/`.

## Per shot

| Shot | What was wrong (sweep) | What changed | Clip |
|---|---|---|---|
| **5.1** (P0) | Nearest astronaut hung in one bent-leg pose for the whole shot over a painted shadow; doubled contours at 101.50–101.58 from the 0.4 s lock | New take `K_5.1/take_2` (h3): she lands (clip 1.8 s), takes two steps, pushes off (3.6 s), lands (5.4 s); the other two skip with real ground contact; shadows detach in flight and rejoin. Wired `offset 1.45, rate 1.14, lock 0, subject false, maskGain 8`, so both landings are inside the shot and whole figures and shadows are redrawn | `s05_5.1_540p.mp4` |
| **8.2** (P0) | Still plates: M and T frozen mid-run, Jade's arms never moved | One continuous take, `K_8.2a/take_5` (h3, 7.3 s): M reaches Jade at about 1 s, T kneels in at about 2 s, the three hold and sway. Clip 0.5–4.13 s, push 1.0 → 1.5 toward the hug. The torn scroll now rejoins **over the moving picture**: new roto parameter `tear` (see "Engine change"), two layers of the same take, halves meet on bar 107 beat 4 (1.33 s), where the rim is dropped and the paper bumps | `s08_outro_540p.mp4` |
| **8.2b** (P0) | Opaque plate switch at 197.95 s reset Jade, M and T to their opening poses (f4751); Kenton fixed in the doorway | The plate switch and the `K_8.2b` take are no longer used. 8.2b is the same hug, continued (clip 4.13–5.96 s) and closer (zoom 1.9 → 2.0), softer line (`lineA 0.22`). No pose reset is possible: it is one take. The old path remains as fallback if the `K_8.2a` pick is removed | same |
| **4.3c** | M hung in one airborne pose (still plate) | First agent: `K_4.3b_close/take_2` wired at offset 2.45, lock 0, reframed to crop a costume mismatch; she comes down and lands in the water with a splash (f2063–2078). Checked on the sheet and numerically | `s04_4.3b-4.3c_540p.mp4` |
| **7.C1** | All three people and the screen faces held (still plates) | First agent: both halves are roto takes (`K_7.C1_earth/take_4`, `K_7.C1_moon/take_2`), lock 0. Checked: T and M wave and laugh, Jade's head moves, the faces on her screen move | `s07_7.C1_7.C6_540p.mp4` |
| **5.4** | Rigid for 2.4 s; two shadows in opposite directions (one painted, one JS) | New keyframe `media/keyframes/K_5.4_rev_sys2.jpg` (nano-banana-pro edit of `K_5.4_rev_sys.png`): no painted Earth, ONE shadow from her boots toward the right horizon. New take `K_5.4/take_4` (h3): weight shift, helmet lifts, arm moves; ink roto, offset 0.5, lock 0, default subject matte. The Earth is drawn by `earthview.js` with the breakdown's sky (§4b: full, south-up, 4.8° up, drawn 1.2×) above the end of her shadow, so the Sun is behind her and the shadow points at the Earth, as in 6.2. The JS reveal/second shadow is gone | `s05_5.4_540p.mp4` |
| **7.C6** | Jade's silhouette entirely still; hair too long | `K_7.C6/take_2` (h3, from `K_7.C6_rev_sys.png`: ponytail to mid-back, glasses): she breathes and inclines her head; offset 1.0, lock 0, whole figure redrawn. The painted Earth is covered by an `earthview.js` Earth at the same place (8% larger). HUD changed from DAY 312 to **DAY 329** so that a full Earth is possible (two synodic months before the toast's full Earth on DAY 388) | same as 7.C1 |
| **7.B4** | Kenji held one crouch | `K_7.B4/take_1` (h3) under the JS strips, near-native redraw (`lineA 0, snapAmt 0, gran 0`), offset 0.6, lock 0: he works the control and shifts his weight. take_2 rejected (he stands up and a light flares across the rover) | `s07_7.B4_540p.mp4` |
| **4.5** | Kenton and M static while T gestures | First agent: `lock 0, offset 0.6, subject false, maskGain 8`, softer line. Numeric screen: Kenton median 1.26, M 0.88, T 0.61 (held baseline about 0.2–0.3), no held window; their movement is small | `s04_4.5_540p.mp4` |
| **8.3** | Jade's profile became a blank wedge; T nearly held | New take `K_8.3/take_4` (h3): all four stay back to camera, each with their own movement (Kenton tilts his head to the Moon, T turns a few degrees to him, M leans on Jade); offset 0.6, lock 0, whole subjects | `s08_outro_540p.mp4` |
| **8.1** | 0.8 s lock dissolve | First agent: offset 0.55, lock 0. Checked: capsule and chutes move from the first visible frame of the fade-in | same |
| **8.4** | Designed still | First agent: the tremble mask now follows the tea surface only. Checked on the sheet; no other change | same |
| **0.4** | Chang'e and the rabbit frozen while cloth moved | New take `K_0.4/take_1` (h3): she breathes and tilts her head, robe and ribbons follow, the rabbit turns its head. The ink redraw smeared her figure (mottled face, grey wash over the robe), so it is wired as a near-native silk redraw of the moving figure only; offset 0.6, lock 0. The Earth's separate drift layer is not used on this path | `s00_0.3-0.6_1.1_540p.mp4` |
| **0.3, 0.5, 0.6, 1.1, 1.3, 2.1, 2.2, 2.4, 4.3b, 4.9** | Lock dissolves, dead starts, double wrist/hand contours (0.6, 2.4), held passengers (2.1) | First agent: `lock 0`, `offset ≥ 0.5`, `subject false, maskGain 8` on all; 0.3/0.6/1.1 slowed to rate 0.75, 2.2 to 0.9 so the takes cover the shots. Re-rendered and checked on sheets and numerically: motion in the first window of every shot, no held window | `s00_…`, `s01_1.3_540p.mp4`, `s02_2.1-2.4_540p.mp4`, `s04_…` |
| **2.3** | (Part A, lip-sync fallback) | `LS1_back/take_2`, see `rev_lipsync_report.md` | `2.3_boat_back_540p.mp4` |

## Engine change (shared files)

`render/src/roto/shader.js` and `render/src/roto/index.js` gained one optional parameter, `tear: [y, drop, tilt, side]`
(or a function of `(t, lt)`), a copy of the torn-scroll maths in `scenes/plate.js`, so a moving take can be torn and
rejoined. With `tear` absent the uniform is zero and nothing changes for other shots. Another agent was editing
`shader.js` at the same time; the edit was applied atomically against the current file and the lint and every render
after it ran clean, but whoever owns the roto engine should read the diff (search `uTear`, `TEAR(`).

## Checks

- Every new take was looked at on a 12–16 frame sheet before prep; verdicts are in the sidecars
  (`media/gen/<KEY>/take_N.json`) and the picks in `media/gen/picks.json`.
- After wiring, every shot above was rendered at half scale and looked at on a sheet, with closer crops for 5.1, 8.2,
  8.2b, 5.4, 7.C1, 7.C6, 7.B4, 0.4, 4.5 and 2.1, and two 1080p stills for the reunion.
- Numeric screen: `render/out/rev_sys/screen.py` (spec `screen_spec.json`, results `screen_pass1.json` and
  `screen.json`). It is **not** the sweep's `numeric.py`, which reads the v3 MP4 and its own shot/ROI tables; it is a
  smaller screen in the same spirit: optical flow over 4 frames, camera fitted and removed, 90th-percentile residual per
  subject box. A painted region that is held measures about 0.2–0.3; every subject box in every shot is above that in
  most windows, and the first windows of every shot show motion. It cannot tell good motion from bad.

## Spend

Video for this workstream: **$5.92** (first agent $5.28: K_0.4, K_5.1, K_7.B4, K_8.2a, K_8.3, K_5.4, K_7.C6, two h3
takes each; second agent $0.64: K_5.4 takes 4 and 5). One image edit, $0.13. LS1_back cost nothing further.

## What still falls short

1. **8.2b is soft at 1080p.** It is a 2× punch into a 768p take; see `render/out/rev_sys/still_8.2b_198.000_1080.png`.
   It reads as a painting, not as a glitch, but it is visibly softer than the keyframe paintings. A proper fix is a
   close keyframe of the hug and its own take.
2. **The bowl-over is gone.** 8.2b used to be "M bowls Jade over onto the rug". No existing `K_8.2b` take is clean
   (take_1: the sofa and table change; take_3: T steps across Jade's legs) and none continues from a kneeling hug, so
   the reunion is now a held three-way hug. This is a change of content for the director to accept or not.
3. **Kenton is in the reunion for only two seconds** (he lowers his hand and steps forward, then the push leaves him).
   In the take he stands dead still from 2.5 s, so the framing excludes him rather than show a frozen father.
4. **8.2: the tear crosses the children's faces** for about a second while the halves close (f4651–f4670). That is the
   motif working as designed on a moving picture, but look at it.
5. **5.4:** a faint pale rim sits around the redrawn figure; the shadow is a thin line all the way to the horizon; the
   Earth's size and height are set from an assumed field of view, not from a camera model.
6. **7.C6:** the Earth's sub-point and pole angle are plausible values (Americas facing, same pole angle as the toast),
   not a Horizons run for that date; the day number was changed to make a full Earth possible; her movement is small.
7. **0.4 and 7.B4 are near-native redraws** (the take smoothed onto our paper, no re-inked line), like the toast shots.
   The ink redraw could not hold Chang'e's fine line.
8. **4.5:** Kenton and M do move, but only just; if it still reads as held, it needs a new take.
9. **8.1:** the parachutes are orange-red and white. Rule 6 says no red on vehicles; not changed here.
10. **2.3:** Jade's hair reaches the small of her back in the rear-view keyframe (rule: mid-back); one or two
    single-frame white specks on the water.
11. Nothing here was checked at 1080p except the two reunion stills, and the full cut was not re-rendered.
12. A tool trap: `vgen.submit(..., over={'image': …})` writes the default keyframe into the sidecar's `first_frame`,
    and `roto_prep` then registers the wrong painting (it happened on `K_5.4/take_4`; fixed by correcting the sidecar
    and re-prepping). Check `meta.json` → `keySource` after any prep of a take made from a non-default keyframe.
