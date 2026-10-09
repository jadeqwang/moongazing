# rev3_crew: the toast (7.E1, 7.E1b, 7.E1c), Lúcia's hand (7.C5c), Chen Yu's collar — Oct 8 2026

Status: DONE (Oct 8, 18:05): all four shots re-keyed, re-taken, roto-prepped, wired, rendered at half scale and looked at as consecutive frames; the collar is patched and rendered. Not committed; no full-film render.
Owner: CREW. Scratch: session scratchpad `crew/`. Not committed. No full-film render.

## 0. What Jade asked, and what the v5 frames showed
| v5 time | Shot | Her words | What the frames show (`render/out/frames_v5_540/`) |
|---|---|---|---|
| 2:56–3:01 | 7.E1 / 7.E1b / 7.E1c | "the wrist angles are unnatural/uncomfortable for the direction the people are facing for both toast clips. they should be held in a natural way" (+ her reference `inputs/astronauts_toasting_fullEarth.png`); restyle or replace the Adaeze close-up; fix the continuity slip | Wide (f4221–4241): cups held beside heads with elbows out, Layla's hand on her hip, Adaeze drinking. Close (f4242–4283): a fully rendered realistic face; cup held up beside her head; in the wide she sips. Two cups (f4284–4346): both wrists cocked back about 90° so the backs of the hands face us and the fingers point inward. |
| 2:36 | 7.C5c | "there's one unnatural hand ... Lucia's hand looks weird" | f3735–3755: a small spread hand floats in the glow above the tablet's top-left corner. |
| 2:33 etc. | 7.C4a, 5.3a, 7.C5b, toast | Chen Yu keeps true vermilion on his collar | f3684 / f2584: his stripe is a dark cinnabar-brown in the painted keyframe; in 7.C5b (f3694) it is already red. |

## 1. References (rule 1) — `media/ref/rev3_crew/` + `SOURCES.md`
Six real photographs (Flickr via Openverse; 120 search results looked at) of people raising a glass seen from behind
and from the side. What they show, and what was taken from Jade's own reference:
- The hand continues the forearm: nobody's wrist is rolled over or cocked back. (The v5 two-cup shot had exactly a
  cocked wrist.)
- The arm points at the thing toasted: upper arm forward from the shoulder, not out to the side. A cup beside the head
  with the elbow out (v5 wide and close) is the pose of drinking, not of toasting something in front of you.
- Real elbows are bent more (60–100°) than in Jade's generated reference (nearly straight, 45–60° up). The staging sits
  between the two.
- Seen from behind, a raised hand shows its BACK as a compact shape on the near side of the cup (her reference, zoomed:
  six fists round six stems, knuckles toward us). Seen from the holder's own side one also sees the back of the hand.
- Standing people raise higher than seated ones; no two glasses at the same height; the free hand hangs.

## 2. The staging, decided once (blockout `render/scenes/blockouts/7.E1/`)
`toast.js` (rev2 version kept as `toast_v2_rev2.js.bak`) has a new arm pose `toast: { el, out, reach }` per person
(arm forward and up from the shoulder toward the Earth, elbow a little bent, neutral grip, wrist straight) and rev3
views; `main.js` has two new modes, `guide` (crew + the ground outside lit so it can be read) and `outside` (the station
model alone from the shot's camera), and a per-view `hide` list.
`cd render && node scenes/blockouts/7.E1/render_views.mjs --views E1_wide_r3,E1b_r3,E1b_r3_start,E1c_r3,E1c_r3_end,r3_side,r3_front --modes flat,line,label,guide,outside`

Who does what, in all three shots:
| Person (west → east) | Raises | Other arm |
|---|---|---|
| Kenji (cut by the left edge) | right | — |
| Anastasia | right, lowest of the standing group | hangs |
| Arjun | right, highest on the west side | hangs |
| Jade (bench, left) | right (inner), toward the Earth | on her knee |
| Lúcia (bench, right) | left (inner) | on her knee |
| Layla | LEFT (was right: so no second cup crowds Adaeze's) | hangs (was on her hip) |
| Adaeze | LEFT, elbow a little more bent | hangs. No sip, no hand at her face: the wide and the close now agree |
| Chen Yu | right, high, at the right edge | left hand on Adaeze's near shoulder (was round her back) |

Cameras: wide and two-cup cameras unchanged (so the Earth stays where `earthview.js` already draws it). Close view:
**side-on** (see §3).

What the blockout showed that changed the plan:
- From ANY camera in front of her, an arm raised forward and up is foreshortened into "straight up" or a cup thrust at
  the lens (three front cameras tried). The natural arm only reads from the side or from behind, as in Jade's reference.
- In the two-cup view the natural arms put the cups level with the mountain line at the cut and either side of the
  Earth at the end (uv 0.37 / 0.64, y 0.34; Earth 0.50, 0.353), arms from the bottom corners leaning inward.
- The station model from these cameras (`*_outside.png`): north of the cupola are the low white dome of the N node just
  beyond the sill (the N tunnel itself is hidden under the sill), the NW and NE mounds at the lower left and right of
  the wide, masts M6 / M1, the comms tower. The v5 wide had a long tunnel across the plain and no mounds; the v5 two-cup
  shot had open ground. Both are being repainted to the model (coordinator's instruction, from the BASE owner's check).
  Note on the tower in the two-cup shot: with this shot's 36° lens the model's tower is still tall (25 m at 90 m: its
  dish leaves the top of frame) but slimmer and further right than in v5 (8% from the left edge).

## 3. The Adaeze shot: restyled AND re-angled (choice and why)
Chosen: keep a shot of Adaeze's face, but (a) paint it in the film's flat gongbi look (the look of 2:32, which Jade
kept), and (b) move the camera to her side: a near-profile, her whole arm one long diagonal from shoulder to cup.
Why not the frontal close-up restyled: the blockout shows a frontal camera cannot show a natural toast arm at all.
Why not a third view from behind (her cup and shoulder against the Earth): it would repeat the two-cup shot that
follows it, and the passage would lose its only face. A flat profile is also the least "AI portrait" way to draw a face.
She is alone in the frame: one person, one hand, one cup. (Chen Yu stands behind her head from this camera; two attempts
to paint him there went wrong, once with her skin colour, once facing the wrong way, and he added nothing.)
Screen direction: she faces screen-left, as in the wide, where the Earth is to her left.

## 4. Keyframes (google/nano-banana-pro; prompts in `media/keyframes/_prompts_7E1/rev3/`; work files in `media/keyframes/work/rev3_crew/`)
| File | What | Verdict |
|---|---|---|
| `C5c_nbp_a.jpg` → `K_7.C5c.jpg` | the stray hand removed (§5) | WRITTEN |
| `E1b_nbp_a/b/c.jpg` | first profile: forearm upright like a post; the hand was a right hand on the left arm (fingers toward her face); pass B did not change it; Chen wrong | REJECTED |
| `E1b_nbp_d.jpg` → mirrored → `E1b_nbp_e.jpg` | fresh painting: long diagonal arm, back of the left hand to us, thumb on her side, 4 fingers, straight wrist; pass E stood the cup upright | **`K_7.E1b.png`** (old: `K_7.E1b_v4.png`) |
| `E1c_nbp_a.jpg` | arms from the bottom corners, straight wrists, backs of the hands to us (4 fingers each, thumb on the outer side, checked at full size); N node dome; slim tower | **`K_7.E1c.png`** (old: `K_7.E1c_v2.png`) |
| `E1_wide_nbp_a.jpg` | outside changed, arms NOT changed | REJECTED |
| `E1_wide_nbp_b/d/e/g.jpg` | the image model kept returning the old arms whenever the old painting was among its inputs (repaint from layout, placeholder arms, pose transfer) | REJECTED |
| `E1_wide_nbp_f.jpg` → `E1_wide_nbp_h.jpg` | f: fresh painting from the blockout guide with a people-free style detail: every arm as staged, but the wrong things outside. h: an edit of only what is outside the glass, from the model view: N-node dome, mounds, masts, tower. 8 people, 8 cups, hands compact and straight-wristed (checked at full size) | **`K_7.E1.jpg`** (old: `K_7.E1_v3.jpg`) |

## 5. 7.C5c (2:36): the hand
All four hands of the v5 keyframe checked at full size. The waving hand was a third RIGHT hand (palm to us, thumb on the
screen-right side, while Lúcia's right hand lies on her chest), child-sized, and the strip of forearm beside it runs
into Kenji's chest (it is in fact Kenji's own arm leaving his sleeve). It is removed: Lúcia's left arm is down at her
side behind the tablet. The other three pass: Lúcia's right hand on her chest (thumb + 4), Kenji's right hand at the
tablet's lower left (4 fingers on its back), Kenji's left at its right edge (4 fingers).
Files: `K_7.C5c_v2.jpg` (as in v5), `K_7.C5c_v3.jpg` (new, no emblem: the emblem tool's `_orig`), `K_7.C5c.jpg` (new,
with Kenji's emblem); only the hand region differs (`_prompts_7E1/rev3/comp_c5c.py`). New take: §7.

## 6. Chen Yu's collar (done; rendered: `render/out/rev3_crew/collar/`, vermilion and steady over every frame 3682–3691)
Tool: `tools/stripe_patch.py` (a colour-targeted patch in the manner of the emblem patch; check sheets in
`render/out/rev3_crew/stripe/`). Vermilion = the sheet's #C8312B.
| Where | v5 | What was done |
|---|---|---|
| 2:33 single (7.C4a) and the 1:48 name card (5.3a, same painting `K_7.C4_c1_chen`) | cinnabar-brown in the painting (104,70,57), orange in the take's moving pixels (183,94,57) | `K_7.C4_c1_chen_v3.jpg` = `_v2` with both collar stripes set to vermilion (exact mask: where `_v1` and `_v2` differ); `tools/emblem_patch.json` `_orig` now `_v3`; emblem tool re-run (keyframe = v3 + emblem); then `stripe_patch.py roto`: key plates and all 97 colour frames of `take_2` recoloured (both stripes, no skin touched), vermilion added to the roto palette. No new take. |
| 2:34 (7.C5b, `K_7.C5b`) | stripe already the sheet's vermilion under that scene's dim light (hue 4°, 101,36,34 where the white polo is 117,113,127); BUT round one's "mute the red" pass had left two mottled blocks on Chen Yu's neck (visible in v5, f3694–3713) | keyframe restored to the painting before that pass (`work/rev_calls/C5b_v1_comp.jpg`; muted file kept as `K_7.C5b_v1.jpg`); `K_7.C5b/take_2` roto re-prepped (it carries no keep or emblem data). Brightening the stripe to full #C8312B was tried and dropped: it glows in a room lit only by a tablet. |
| 0:24 (1.4b) | pressure suits; no polo collar; nothing red | nothing to do |
| Toast wide | — | the new painting has an orange-red stripe on his collar (he is a dark figure at the right edge) |
| Toast close | — | he is no longer in that frame |
No other red on any uniform in the frames I own (checked the new toast keyframes and 7.C5c).

## 7. Takes, roto, wiring (tools/vgen_rev3_crew.py; verdicts in each take's sidecar)
First-frame fidelity was scored for the new takes only (the shared ffcheck would rescore the old takes against the new
keyframes); the old takes carry a `superseded` note instead.
| Take | Model | Verdict |
|---|---|---|
| `K_7.E1/take_4` | h3 768P, ff 0.93 | **PICK.** Eight people keep their arms up, each lifts or settles at its own moment; 8 cups throughout |
| `K_7.E1/take_5` | h3 | spare, same quality |
| `K_7.E1b/take_6` | h3, ff 0.974 | spare: arm, hand and cup hold their shape for 124 frames, but her eyes are shut from 0.5 to 3.3 s and by 3.3 s the cup has risen out of the top of the frame |
| `K_7.E1b/take_9` | h3, ff 0.974, second wording ("the arm stays where it is, eyes open") | **PICK.** Cup and hand whole and inside the frame throughout; one blink 0.7–1.15 s, then eyes on the far point; the tear slides to her jaw. The film uses 1.1–2.85 s |
| `K_7.E1b/take_8` | h3, same wording | spare (a slower blink) |
| `K_7.E1b/take_7` | Seedance 2.0, ff 0.80 | REJECT: reframed, face turned to the camera |
| `K_7.E1c/take_7` | h3, ff 0.989 | **PICK.** Arms rise steadily 0.5–3.2 s, wrists straight, backs of the hands to us, 4 fingers each, cups either side of the Earth with sky between |
| `K_7.E1c/take_8` | Seedance 2.0 | REJECT: the cups converge and meet over the Earth's place |
| `K_7.C5c/take_3` | h3, ff 0.99 | **PICK.** Three hands throughout; nothing rises above the tablet |
| `K_7.C5c/take_4` | Seedance 2.0 | spare (bigger, faster lean) |
Roto: `tools/roto_prep.py` on the four picks (and on `K_7.E1b/take_9` after the retake). Emblems: `tools/emblem_patch.json` K_7.C5c → `take_3`, `_orig`
`K_7.C5c_v3.jpg`, tool re-run (Kenji's roundel carried); the K_7.E1b entry is removed (the new frame shows no chest;
the old entry would stamp two emblems at the old places). No take carried roto `keep` data. `media/gen/picks.json`: four entries.
`render/src/sections/07_drop.js`, my lines only: `SHARE.c` clip → `K_7.C5c/take_3`; the three TOAST rows (clips; the
wide's push is now 1.14 → 1.24 so every arm is in frame, it was 1.42 → 1.56); the close shot's `focus` → [1230, 450]
and the centre of its earthlight wash → upper LEFT (380, 150), where the Earth now is for her. Lint OK.

## 8. Test render (half scale, 2 workers, no failed frames): `render/out/rev3_crew/frames/f_%06d.jpg`
Looked at: sheet of 20 frames across 4218–4347 with both cuts; every frame 4286–4309 cropped to the two hands;
frame-difference series of all four shots (no spike anywhere; the two-cup shot alternates as drawings on twos do);
18 frames of 3733–3758 with both cuts of the 2:36 shot; collar frames 2582–2584 and every frame 3682–3691.
- 2:56 wide: reads at once as people raising cups to the Earth; nobody's elbow is out, nobody drinks.
- 2:57 Adaeze: flat, in profile, the arm one line to the cup; the cut lands as her eyes reopen, then they stay on the Earth; the cup is whole in frame (re-rendered 4242–4283 with `take_9`; frame differences 0.3–0.9, no spike).
- The other shared-screen shots (2:32, 2:34, 2:37): all hands looked at in the keyframes at full size; none fails (Adaeze's two on the tablet, Anastasia's knuckle at her lips; Arjun's two on the tablet, Chen Yu's on his far shoulder; Layla's two on the tablet's edges, her right arm passing between the two of them).
Clips with sound: `render/out/rev3_crew/toast_175.0-181.6_540p.mp4`, `c5c_155.1-156.7_540p.mp4`, `collar_153.3-154.75_540p.mp4`.
- 2:59 two cups: wrists straight; the Earth sits between the cups and then between the forearms, never covered.
- 2:36: three hands. Kenji's glasses catch the tablet's light in some frames (white lenses), as in the take.

## Spend
Video: 10 takes = 7 × h3 ($0.40) + 3 × Seedance 2.0 ($0.75) = **$5.05** of the $12. Images: 14 × google/nano-banana-pro
≈ $1.88. Codex: not used.

## Files changed
- Keyframes: `media/keyframes/K_7.E1.jpg`, `K_7.E1b.png`, `K_7.E1c.png`, `K_7.C5c.jpg`, `K_7.C4_c1_chen.jpg`,
  `K_7.C5b.jpg` (previous versions: `K_7.E1_v3.jpg`, `K_7.E1b_v4.png`, `K_7.E1c_v2.png`, `K_7.C5c_v2.jpg`,
  `K_7.C4_c1_chen_v2.jpg`, `K_7.C5b_v1.jpg`); their `.txt` notes; prompts in `media/keyframes/_prompts_7E1/rev3/`.
- Takes and roto: `media/gen/K_7.E1/` (4, 5), `K_7.E1b/` (6–9), `K_7.E1c/` (7, 8), `K_7.C5c/` (3, 4);
  roto folders patched in place: `K_7.C4_c1_chen/roto/take_2`, re-prepped: `K_7.C5b/roto/take_2`.
- Code: `render/src/sections/07_drop.js` (SHARE.c, three TOAST rows, the close shot's focus and light, one comment);
  `render/scenes/blockouts/7.E1/toast.js`, `main.js`, `views/*_r3*`; new `tools/vgen_rev3_crew.py`, `tools/stripe_patch.py`.
- Data: `media/gen/picks.json` (4 entries), `tools/emblem_patch.json` (K_7.C4_c1_chen `_orig`, K_7.C5c, K_7.E1b removed).
- Docs: `docs/script.md` (toast rows, the 7.C5c phrase), `docs/character_bible.md` (K_7.C5c row), `media/ref/rev3_crew/`.

## What still falls short
1. Nobody has watched the clips at speed: judged from frames, strips and frame differences.
2. The wide (2:56) is a NEW painting, not the old one with new arms: the image model would not change the old arms.
   Its dome is drawn with ring and meridian ribs (closer to the station model than the old two-rib view), the figures
   are a shade more violet-grey than the old indigo, and they wear dark shoes where the bible says socks (soles in
   shadow at the bottom edge; cropped by the shot's framing). Chen Yu's hair reads as very short.
3. The two cups (2:59): each hand lies on the NEAR side of its cup with the fingers running up across it, as in Jade's
   reference seen from behind (a hand between us and the glass). It is not the wrap in which the thumb crosses the near
   face (the blockout's neutral grip); the image model would not paint that one. Wrists are straight.
4. Adaeze (2:57): she is alone in frame; Chen Yu, who stands at her far side, is not shown (two attempts to paint him
   behind her failed). In the wide his hand is on her shoulder. Her cup is a touch wider than the cups of the next shot.
   The take's motion is small (breath, the tear, eyes); the camera push carries the last half second.
5. The Earth in the wide sits at the same place in the frame as before (uv 0.519, 0.38); the new painting's horizon is
   at 0.52, so it stands a little higher above the mountains than the true 4.9° would put it with this lens.
6. Comms tower in the two-cup shot: it follows the model from this shot's own camera (36° lens): still tall, its dish
   above the top of frame, but slimmer and further right than in v5. If BASE measured it with another lens, compare
   `render/scenes/blockouts/7.E1/views/E1c_r3_outside.png`.
7. 2:36: Lúcia no longer waves at the dog (the wave WAS the bad hand). Kenji's lenses go white with the tablet's
   reflection in some frames.
8. 2:33: the small far collar stripe is recoloured too; in the take's frames it was caught by position plus a loose
   colour test, so look at it once at 1080p.
9. `docs/production_tracker.md` is generated and not refreshed. The old takes of these shots were not rescored; they
   carry a `superseded` note.

## For Jade
- **2:56, the toast, wide.** Everyone now faces the window and lifts one arm forward and up toward the Earth, wrists
  straight, as in your reference; nobody holds a cup beside their head, nobody drinks, and outside the glass the
  ground now matches the station model (airlock dome, two mounds, masts, tower).
  Frame: `render/out/rev3_crew/frames/f_004232.jpg`
- **2:57, Adaeze.** The realistic close-up is replaced by a flat painted profile: she faces the Earth, her arm one
  long line to her cup, a tear running, her eyes on the Earth. It agrees with the wide (same arm, no sip).
  Frame: `render/out/rev3_crew/frames/f_004262.jpg`
  *Yours to choose:* she is alone in this frame (Chen Yu, beside her in the wide, is not shown). Say if you want him in.
- **2:59, the two cups.** Each hand now simply continues its forearm (no cocked wrist); the cups rise either side of
  the Earth; the airlock dome shows below.
  Frame: `render/out/rev3_crew/frames/f_004316.jpg`
- **2:36, Kenji and Lúcia.** The odd hand was a third hand (a right hand, where her right hand was already on her
  chest). It is gone; she keeps her hand on her heart and tips her head to his shoulder.
  Frame: `render/out/rev3_crew/frames/f_003746.jpg`
  *Yours to choose:* she no longer waves back at the dog. A proper wave could be painted in if you miss it.
- **2:33 and 1:48, Chen Yu.** His collar stripe is true vermilion again, in the painting and in the moving drawing.
  Frames: `render/out/rev3_crew/collar/f_003686.jpg`, `render/out/rev3_crew/collar/f_002584.jpg`
- **2:34, Arjun and Chen Yu.** His stripe was already vermilion there; the blotchy marks on the back of his neck
  (left by the first round's colour change) are gone.
  Frame: `render/out/rev3_crew/collar/f_003700.jpg`
