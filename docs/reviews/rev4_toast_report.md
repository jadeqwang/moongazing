# rev4_toast: the two-cup toast close-up at 2:59 (7.E1c) — Oct 8 2026, night

Status: DONE (Oct 8, 23:05): keyframe repainted, new take, roto-prepped, wired, passage rendered at half scale and
looked at as consecutive frames. Owner: TOAST. Scratch: session scratchpad
`toast/`. Not committed. No full-film render.

## 0. What Jade asked
"shoes are fine, it's not Jade's personal home. hands are weird in the 2 cup shot, but correct in the group shot. can
you fix the 2 hand shot using the hands in the group shot as guidance?"

## 1. What the v6 frames showed (rule 2: find it first)
Looked at: `K_7.E1c_v3.png` at full size (both hands cropped), v6 frames 4284–4346 as a sheet of nine and f_004316, and
the bench pair's hands in the wide keyframe `K_7.E1.jpg` enlarged five times (`media/keyframes/work/rev4_toast/wide_hands_JL.png`).

Whose hands: the two-cup shot is the bench pair of the wide seen closer from behind. Left of frame = Jade, who raises
her RIGHT (inner) arm; right of frame = Lúcia, who raises her LEFT (inner) arm.

The wide (correct, her word): each hand is a fist round the LOWER half of its cup, the cup's rim standing clear above
the fist; the thumb lies on the near face of the cup; the knuckles make the bumpy edge on the side toward the
neighbour (right edge for Jade's right hand, left edge for Lúcia's left). That is what a right and a left hand look
like from behind when a cup is held out in front: thumb toward the holder, fingers round the far side.

The two-cup shot in v6 (wrong):
- **The grip was inside out.** Each hand lay flat on the NEAR face of its cup, all four fingers splayed across it
  pointing inward, every fingernail toward the camera, and the thumb behind the cup on the Earth side. To hold a cup
  like that the forearm has to be rolled until the palm faces the window; nobody raises a cup that way, and the cup is
  not actually gripped (it is pinned between flat fingers and a hidden thumb).
- **So each hand read as the wrong hand.** Four fingers pointing inward across a cup is what the *other* hand reaching
  in from the side would show, and the thumb that would settle it was hidden: the knuckles said one hand and the
  missing thumb let the eye choose the other. Counted at full size each hand did have four fingers; the count was
  never the fault, the orientation was.
- **The wrist line.** Because the flat hand covered the cup, the hand sat at an angle on the end of the forearm
  (knuckles tipped back toward us) instead of carrying the forearm's line on into a fist.
- **In motion** (take_7): the arms kept rising for the whole shot, so the last third of the shot is two forearms with
  the cups at the top edge. Not a glitch, but more travel than "raise and hold".
Last round's report listed this grip as shortfall 3 ("the image model would not paint that one"): the old painting had
been the edit target, and the model kept its hands.

## 2. The fix
1. **Blockout** (`render/scenes/blockouts/7.E1/toast.js`, opt-in, other views unchanged): `cupGrip` takes
   `thumb: 'up'` (the thumb runs up the near face) and the views `E1c_r4`, `E1c_r4_end`, `r4_side` use it with the
   fist lower on the cup (`gripH: -0.034`): the wide's grip from this shot's camera.
   `cd render && node scenes/blockouts/7.E1/render_views.mjs --views E1c_r4,E1c_r4_end --modes flat,guide,noarms`
2. **Clean plate**: the arms removed from the old painting by google/nano-banana-pro, registered, and used only where
   the old arms were (`media/keyframes/_prompts_7E1/rev4/plate_e1c.py`); a second plate keeps the old forearms cut off
   below the wrists (`E1c_stumps.png`).
3. **New hands**: nano-banana-pro on the stump plate + the blockout guide + the wide's hands enlarged. The old
   two-cup painting was not among the inputs.
   | File (`media/keyframes/work/rev4_toast/`) | What | Verdict |
   |---|---|---|
   | `E1c_hands_a.jpg` | first wording: cups became footed tea bowls cradled from behind, thumb one side, fingers the other; the thumbs long and finger-like | REJECTED (cup shape unlike 2:56 and 2:57; a thumb that can be read as a finger is the old ambiguity again) |
   | `E1c_hands_b.jpg` | pass B on a (smaller cups, sturdier thumbs): bowls became footless, grip unchanged | REJECTED |
   | `E1c_hands_c.jpg` | second wording (`K_7.E1c_hands_nbp_v2.txt`): the wide's grip exactly; straight-sided cups | **PICK** |
4. **Composite** (`comp_e1c.py`): the new arms, hands, cups and sleeve cuffs matted onto the clean plate →
   `media/keyframes/K_7.E1c.png` (old: `K_7.E1c_v3.png`). Both heads, the tower, the sky, the mountains, the sill and
   the dome are the old pixels.

Checked at full size (`K_7.E1c.png`, both hands enlarged):
- Left = Jade's RIGHT hand, celadon cup: the hand is on the right of the cup, the thumb across the near face pointing
  up-left with its nail toward us, four fingertips showing round the far side at the cup's left; the wrist carries the
  forearm's line straight into the fist.
- Right = Lúcia's LEFT hand, grey-white cup: the mirror image, held a little higher.
- Two arms, two hands, two cups; one thumb and four fingers each. Cups are small straight-sided tumblers (the shape of
  Adaeze's at 2:57), rims level and seen at eye height (no looking down into them).
- Cups at keyframe uv (0.345, 0.47) and (0.652, 0.39); the engine's Earth (uv 0.502, 0.39, radius 0.036 of the width)
  has black sky on both sides. No painted Earth.

## 3. Take, roto, wiring (`tools/vgen_rev4_toast.py`; verdicts in each take's sidecar)
Prompt: the cups are already up; Jade's rises about a cup's height to Lúcia's level, then both hold with a slight
tremble; no clink; the grip never changes.
| Take | Model | Verdict |
|---|---|---|
| `K_7.E1c/take_9` | h3 768P, ff 0.988 | **PICK.** Every frame 0.4–2.9 s cropped to the hands, and every seventh frame to 3.2 s at larger size: each thumb stays on the near face of its cup, the same fingertips stay round the far side, nothing merges, multiplies or slides; wrists straight; cups upright and apart. Jade's cup rises from 0.47 to 0.33 of the frame height by 2.75 s and holds; Lúcia's rises a finger's width. Frame differences: on twos, decaying smoothly, no spike. |
| `K_7.E1c/take_10` | h3 768P, ff 0.988 | Spare: same stable grip; Jade's arm rises further and leans more toward the centre. |
Roto: `tools/roto_prep.py K_7.E1c/take_9` (no keep, emblem or paper data on this take: that one command rebuilds it).
`media/gen/picks.json`: K_7.E1c → `take_9`. `take_7` carries a `superseded` note.
`render/src/sections/07_drop.js`, the 7.E1c row only: clip `K_7.E1c/take_9`, offset 0.9 (was `take_7`, 0.5); the push
and the Earth's place are unchanged. Lint OK. The film uses 0.9–3.53 s of the take: the cup is still rising at the cut
(no dead start) and is held from about 1.6 s into the shot.

## 4. Test render (half scale, 2 workers): `render/out/rev4_toast/frames/f_%06d.jpg`, frames 4200–4367
Four frames (4250–4253, in the Adaeze shot) failed on the first pass with ERR_INSUFFICIENT_RESOURCES (other renders
were running) and were filled in with `--resume`.
Looked at: f_004316 whole; every frame 4284–4307 and every second frame 4308–4346 cropped to the hands; both cuts
(4283→4284 and 4346→4347); frame differences over 4284–4346 (0.6–3.0, on twos, no spike).
- The grip holds through the roto redraw: thumb on the near face, fingertips round the far side, in every frame.
- The Earth sits between the two cups with black sky on both sides in every frame; nothing passes in front of it.
- Clip with the song: `render/out/rev4_toast/toast.mp4` (175.0–182.0 s).
- Side-by-side still (v6 frame, new frame, the wide's two hands enlarged): `render/out/rev4_toast/sidebyside_2m59.jpg`.

## Spend
Video: 2 × h3 = **$0.80** of the $8. Images: 4 × google/nano-banana-pro ≈ $0.54. Codex: not used.

## Files changed
- Keyframe: `media/keyframes/K_7.E1c.png` (previous: `K_7.E1c_v3.png`), its `.txt` note; prompts and scripts in
  `media/keyframes/_prompts_7E1/rev4/`; work files in `media/keyframes/work/rev4_toast/`.
- Takes and roto: `media/gen/K_7.E1c/take_9*`, `take_10*`, `roto/take_9/`, `frames/take_9/`.
- Code: `render/src/sections/07_drop.js` (one row); `render/scenes/blockouts/7.E1/toast.js` (opt-in `thumb: 'up'`,
  three new views; existing views render as before), `views/E1c_r4*`; new `tools/vgen_rev4_toast.py`.
- Data: `media/gen/picks.json` (K_7.E1c). Docs: `docs/script.md` (the 7.E1c lines).

## A mistake of mine to know about
While scoring my takes I ran `tools/ffcheck.py` once with no shot name. It walks every take in `media/gen` and
rewrites `ff_r`, `ff_shift_px` and `aspect` in each sidecar, measured against whatever keyframe is on disk now. It ran
from `J_1.4` through `K_7.B1/take_4` (215 sidecars) before the pipe closed. All 215 still parse and nothing else in
them changed; no code reads these fields (checked `tools/`, `render/`, `release/`); takes still queued or running
were skipped. But for 90 of those takes the keyframe has been replaced since the take was made (J_3.1, J_3.7 1–2,
J_6.2, J_6.2_visor, J_7.D2 1–4, K_0.5 1–3, K_0.6 1–3, K_1.4a, K_1.4b 1–2, K_1.6 1–3, K_2.1/1, K_3.0_bridge 1–2,
K_3.1 1–2, K_3.3_hand 1–2, K_3.4_beam 1–2, K_3.4_lesson, K_3.4_wall, K_3.5_back, K_3.5_front 1–2, K_3.8d_harness,
K_4.2 1–6, K_4.3b 1–4, K_4.5, K_4.7 1–2, K_5.1, K_6.1), so their `ff_r` now says how close the take is to the
*current* keyframe, not whether it started on its own. `media/` is not in git, so the earlier numbers cannot be
restored; the scores of the picks are still in `media/gen/picks.json` notes and `docs/production_tracker.md`. I did
not touch those sidecars again. My own two takes were scored separately.

## What still falls short
1. Nobody has watched the clip at speed: judged from frames, strips and frame differences.
2. The arms are repainted too, not only the hands: the forearms now stand more upright and a little closer to the
   centre than in v6 (they follow the blockout), and the cups start level with the Earth instead of rising past it.
   The shot is calmer than before: about 1.6 s of a small rise, then a hold.
3. Lúcia's cup is a little higher than Jade's at the cut and they end level; in the wide (2:56) the pair's cups are
   about level and close together, in this shot they are a hand's width either side of the Earth (as in v6).
4. The cups are straight-sided tumblers like Adaeze's at 2:57; the wide's cups are too small to compare. Jade's
   celadon cup has a bolder crackle than in v6.
5. The lower fingers curl under the base of each cup, so the fingertips show slightly below the cup's foot: correct
   for a small cup in a fist, but look once at 1080p.
6. The stray `ffcheck` run above.

## For Jade
- **2:59, the two cups.** Both hands were repainted from the two hands in the group shot: each is now a relaxed fist
  round the lower half of its cup, thumb toward us on the near side, fingers wrapped round the far side, the wrist
  straight (before, the fingers lay flat across the front of each cup with the thumb hidden behind it, which is why
  they read as the wrong hands). The cups are held up either side of the Earth; yours rises a little to Lúcia's
  height and both hold. No clink.
  What still falls short: judged from frames, not watched at speed; the arms stand a little more upright and the
  movement is smaller than before.
  Re-rendered: frames 4284–4346 (2:58.5–3:01.1); the test render covers 4200–4367.
  Clip: `render/out/rev4_toast/toast.mp4`. Frames: `render/out/rev4_toast/frames/f_004300.jpg`,
  `render/out/rev4_toast/frames/f_004316.jpg`. Before and after beside the group shot's hands:
  `render/out/rev4_toast/sidebyside_2m59.jpg`.
  Nothing here needs a choice from you.
