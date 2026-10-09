# Rev 3 — HANDS (3.3, 3.5a/b, 7.D2/7.D3/7.D3c) — Oct 8 2026

Owner: the HANDS agent of the third revision round (`docs/REVISION_NOTES_OCT8.md`). Test renders: `render/out/rev3_hands/`
(half scale). Working files that show Jade's painted likeness are under `media/` (never committed).

## 1. 0:52, shot 3.3 — "let the hand move smoothly down"

**What the v5 frames showed** (`frames_v5_540/f_001250…001298`, every frame, cropped strip): the take itself
(`K_3.3_hand/take_6`) descends monotonically, but the section retimed it to "linger at each character, then glide to
the next". Measured from the retime and the take's fingertip track: five stop-and-go pulses, 2 px a frame for five or
six frames, then 22 px a frame for three (take px, 1280x720), four times over. The hand never went back up; what read
as "coming back up" at 53.5 s is the fourth pause. On top of that the redraw was on twos in *take* time, so during
each linger one drawing was held for three or four film frames.

**What is sung when.** During this shot she sings "That line—" (52.06–53.73, then a breath to 54.09). 举杯邀明月 is
sung in the *next* shot (54.09–55.93). So the finger cannot pass each character as it is sung inside this shot; it
reads the line ahead of the voice, at about the pace the line is then sung (0.4 s a character).

**What changed.**
- New tool `tools/glide_resample.py`: resamples a wall-reading take so the fingertip is at a chosen height on every
  film frame; in-between frames by optical-flow interpolation of the two neighbouring take frames (the hand moves
  under 5 px between them and the wall is still, so the in-betweens are clean). No new generation, no spend.
- `K_3.3_hand/take_6g` = take_6 resampled: fingertip from beside 举 (y 116) to the foot of 月 (y 476) over the shot's 49
  frames, speed easing gently from 120% to 80% of the mean; 3 spare frames each end. Prepped with `roto_prep.py`
  then `wallread_prep.py` (same order as before).
- `03_verse2.js`, shot 3.3: `clip: 'K_3.3_hand/take_6g'`, `time` = one clip frame per film frame, `twos: false` (a new
  drawing on every film frame: this one shot is on ones because a slow glide on twos still steps). The inscription
  lines (TYPE's) are untouched; the unused retime tables were removed from my block.

**Checked.** Every frame of the render as a cropped strip and four full frames (`render/out/rev3_hands/f33/`); the
fingertip re-measured on the resampled clip by `wallread_prep`: 9.5 → 5.6 px a film frame, falling smoothly (v5: 2 ↔ 22);
frame-difference over the hand's area: median 2.25, min 0.99, max 2.69, nothing under 0.35x or over 2.5x the median
(v5 had two near-still frames). Cut in: the finger is beside 举 and moving on the first frame; cut out: beside the
foot of 月, still moving, hand in frame. Beside 杯 at 0.42 s, 邀 0.82, 明 1.27, 月 1.74.

**Still short.** Nobody has seen it at speed. The hand now moves at about 1.75x the take's own pace; its small wrist
motion is sped up with it (not visible in strips).

## 2. 0:58, shots 3.5a / 3.5b (now 3.5a / 3.5b / 3.5c) — the envelope

**Her note.** Kenton's larger hand gives her the envelope; we see it long enough to read MISSION ASSIGNMENT; she
turns it over in a way that reads as natural and opens it; inside is a paper folded in three that we cannot read, but
we can tell it is printed on the inside.

**What the v5 frames showed** (`f_001388…001480`): fingertips resting on the front, a hard cut to the back with no
turn, then a thumb lifting a sealed flap and drawing a flat sheet at 1.6x speed. Also: the envelope was about 2.4 hand
lengths wide (a real letter envelope is 1.3).

**References (rule 1).** `media/ref/rev3_hands/` (11 Pexels photos, `SOURCES.md`). What they showed: an envelope is
passed flat, each person holding their own end, thumb on top and fingers under (08, 09); the flap swings up and away
from the holder, the holding hand stays on the closed side (03); the sheet is pinched at its exposed edge and leaves
at right angles to the flap hinge, away from the holding hand (04, 05); a three-fold letter is held by its side edges
and its outer panels spring up at the creases, writing inside (06). No photo of an envelope caught mid-turn was found,
so the turn itself was judged on the take, frame by frame.

**Design.** The action does not fit two shots at real speed (a video model needs about 1 s for the turn and 1.2 s
for the letter), so 3.5b is split on a beat: **three shots, all at rate 1**. The cut at 59.31 stays.

| Shot | Time | What happens | Source |
|---|---|---|---|
| 3.5a | 57.85–59.31 | His hand (navy fleece cuff, from the right) lets go of the right end and leaves within 0.6 s; the front lies flat and legible for the whole 1.46 s; her right hand is on its corner; her left leaves the toy Earth and reaches the envelope as the shot ends | `K_3.5_front/take_4`, 0.5–1.96 s; type in JS on the tracked paper |
| 3.5b | 59.31–60.29 | Closer (a 1.25x cut-in on the same axis): she turns it over with both hands at the short ends; it stands on edge, the back comes round and down, the unsealed flap falls open | the same take, 3.625–4.6 s |
| 3.5c | 60.29–61.65 | Closer still: her right hand draws the folded letter up by its top edge, the top third lifts open and the inside is printed; the letter comes out over the envelope | `K_3.5_letter/take_1`, 1.15–2.51 s (first frame `K_3.5_letter`, last frame `K_3.5_letter_end`) |

- Keyframes (nano-banana-pro edits of the old ones, so desk, lamp, globe and brushwork carry over; notes in the `.txt`
  beside each): `K_3.5_front` (hand-over; old kept as `_v1`), `K_3.5_letter`, `K_3.5_letter_end`. `K_3.5_back` was
  also redone (back being laid down) but the cut does not use it; old kept as `_v1`.
- **Hands counted**: 3.5a three (his one, hers two), his gone by take frame 32 and never back; 3.5b and 3.5c two;
  five fingers on each in keyframes and in every-frame strips of both takes.
- **No seal, no old name.** The flap is unsealed and plain. The letter's print is baked in as even grey bars with a
  tiny round emblem dot, no readable word. The front keeps the exact JS type (the TYPE owner's `envelopeFront` sheet).
  The `sealWhole`, `sealBroken` and `memo` sheets of `papertype.js` are no longer used by any shot, and 3.5 no longer
  needs `seal_guanghan`.
- Wiring: `03_verse2.js` 3.5 block (my lines; the lyric line under it is untouched), `picks.json` (`K_3.5_front` →
  take_4, new `K_3.5_letter` → take_1, `K_3.5_back` retired), `tools/paper_track.py K_3.5_front/take_4 env --static 56`
  (the envelope does not move in the first 56 take frames; max deviation 19.5 px includes his release, the median quad
  is used). New submit script `tools/vgen_rev3_hands.py` (first + last frame support).

**Checked.** 16-frame sheets of both takes; every frame of the turn (take frames 74–105) and of the letter (27–62);
the render `render/out/rev3_hands/f35/` as a 24-frame sheet, an every-frame strip across both cuts (1420–1451) and
enlarged frames of his hand leaving (1390–1406); frame-difference per shot (nothing still, peaks only on the drawing
changes). Clip: `render/out/rev3_hands/3.5_envelope.mp4`.

**Still short, honestly.**
1. **The lyric now sits on hands** (TYPE's line): "I think / of you —" at top right is over Kenton's hand and cuff in
   3.5a and over her right hand and sleeve in 3.5c. The top-left quarter (about x 250–700, y 50–200) is clear desk in
   all three shots.
2. **The cut at 59.31 skips 1.7 s** of the same take (her left hand arriving → the envelope already edge-on between
   both hands). It is a cut-in on the action with a 1.25x change of size, not a continuous turn. The take's hand-over
   and its turn are 2 s apart and the shot is 1.46 s, so I could have either his hand or the start of the turn in
   3.5a, and chose his hand.
3. **Three frames (1424–1426) show the envelope's face blank** while it is tilted about 60° at the start of 3.5b: the
   take's front is blank and the JS type is only tracked while the envelope lies flat. Fix if it is noticed at speed:
   follow the quad's corners through the lift in `paper_track.py` (its corner ordering fails past 31° of rotation).
4. **Envelope against hands**: now about 2.0 hand lengths wide (was 2.4; true 1.3). The image model would not shrink
   it further without losing the composition; a closer framing on true-size hands would make the type small.
5. **Colour step at 60.29**: the envelope is pale ivory in 3.5b and a pinker beige in 3.5c (two keyframes); the lamp
   shade is larger in the 3.5c picture than in 3.5a (framed mostly out).
6. 3.5b's last 8 frames are the envelope landed and held, hands only settling (the slow push keeps it alive).
7. `K_3.5_back` takes 16 and 17 (1.50 USD) were ordered before take_4 turned out to hold the whole turn; not reviewed.

## 3. 2:44 and 2:49, shots 7.D2 / 7.D3 (right half) / 7.D3c — one fingertip

**Her note.** One finger to the image of M's little hand; arm, elbow and shoulder that look natural; the same
gesture at 2:49.

**What the v5 frames showed** (`f_003925…004094`): an open palm low on the screen, far from the child's hand; the arm
left the picture's edge as one long horizontal tube from under her hair, with no upper arm and no elbow. The painted
torso is in fact turned about 45° to the camera under a head in profile, with the far (right) sleeve already drawn:
the arm simply had no upper arm. And the screen stood only 21 cm in front of her eyes in the picture plane, which no
natural arm can reach without cramping.

**What changed.**
- **Blockout** `render/scenes/blockouts/7.D2/` (`main.js`, `render.mjs`; outputs that show her likeness go to
  `media/keyframes/jade/_J7D2_work/blockout/`): the film camera (32° lens, her head 1.93 m away), her right arm at
  165 cm proportions (upper arm 0.307 m, forearm 0.241, hand 0.178) from the far shoulder under the lock of hair,
  solved to the child's hand: **elbow 98°, upper arm 34° below horizontal, fingertip 0.44 m from her eyes**, the elbow
  inside the frame. Looked at from the film camera, from above, from the screen and from 3/4.
- **Recomposed keyframe** `media/keyframes/jade/J_7.D2.png` (old kept as `J_7.D2_v1.png`; how it was made:
  `J_7.D2_v2_edit_notes.txt`): the original painting at 0.85 scale, anchored top right, so there is room for the elbow;
  the screen moved 400 px left so the reach is real; the arm painted by the image model to the blockout view (three
  passes: arm, a slender relaxed hand after a reference photo, the unfinished bottom strip).
  **Her head is the original painting's own pixels** (face, glasses, ear, hair: 311,476 px put back exactly after
  registration, only scaled 0.85), and so are the child, the moon and the curtains. No model redrew her face.
- **Take** `J_7.D2/take_5` (Seedance 2.0, from the touch pose): the fingertip rests 2.4 s, then she draws the hand
  back. **The film plays it backwards** for the approach, so the finger lands exactly on the painted pose:
  7.D2 = take 5.0 → 4.03 s (the hand already coming up at the first frame), 7.D3 = 4.03 → 1.46 (contact 1.6 s into
  the shot, then it rests), 7.D3c = 0.15 → 1.91 forwards (the fingertip resting on her hand, a point of light, small
  life). The child's hand is where the fingertip lands in all three because it is one take.
- `tools/roto_keep.py` on take_5: her head is shown as the painting itself, carried on the take's motion (29.5 px,
  3.7° over the take), never the model's redraw.
- Wiring: `07_drop.js` shots 7.D2, 7.D3 (right half only) and 7.D3c (my scene lines; HUD lines untouched), new
  framings for the new composition; `picks.json` `J_7.D2` → take_5.

**Checked.** Keyframe: one arm, one hand, five fingers (index out, three loosely curled, thumb alongside), glasses,
hair; take: 16-frame sheet, every-2nd-frame strip of the hand (f44–120), face strip; render
`render/out/rev3_hands/fD/`: sheet across all cuts, full frames 3936 / 4000 / 4070, an every-3rd-frame strip of the
arrival in the split half (3948–4008), frame-difference per shot (no pops). Clip:
`render/out/rev3_hands/7.D_fingertip.mp4`.

**Still short, honestly.**
1. **The split screen cannot hold both faces.** With the screen a real reach away, the right half (a quarter of the
   picture wide at this size) shows the child's hand, the moon, the finger, the arm with its elbow and Jade's profile
   to just behind her glasses; the on-screen child's face and Jade's ear are cut. An uneven split (left 800 px, right
   1120) would hold both; that needs the left half and the seam, which are not mine.
2. **The fingertip stops about 8 px short of the child's fingers** in the keyframe, with the glint between them
   (fingertip to fingertip). It reads as touching in the close shot; it is not an overlap.
3. **The resting hand is fainter than the moving one**: where the hand is still it is the painted keyframe (thin
   line after two model passes), where it moves it is the brighter gold redraw. Most visible in the close shot.
4. `LIVE −7 s` (TYPE's HUD) now touches the screen's top left corner in 7.D2.
5. Reverse play: her head lifts and her finger uncurls as it arrives, which reads naturally in strips; a blink
   played backwards is still a blink. Nobody has watched it at speed.
6. The hair below her chin is redrawn in a red-brown, as it was in v5.

## Spend
Video (list price, `media/gen/spend.jsonl`): **5.35 USD** of the 12 allowed: J_7.D2 take_5 0.75 + take_6 (h3) 0.40;
K_3.5_front take_3 + take_4 1.50; K_3.5_back take_16 + take_17 1.50 (unused); K_3.5_letter take_1 + take_2 1.20.
Images: 16 nano-banana-pro edits, about 2.15 USD. No codex job was run.

## Files
- New: `tools/glide_resample.py`, `tools/vgen_rev3_hands.py`, `render/scenes/blockouts/7.D2/{index.html,main.js,render.mjs}`,
  `media/ref/rev3_hands/` (+ `SOURCES.md`), this report.
- Changed: `render/src/sections/03_verse2.js` (3.3 and 3.5 blocks), `render/src/sections/07_drop.js` (7.D2, 7.D3 right
  half, 7.D3c), `docs/script.md` (rows 3.3, 3.5, 7.D2, 7.D3, 7.D3c), `media/gen/picks.json`.
- Media: keyframes `K_3.5_front`, `K_3.5_back`, `K_3.5_letter`, `K_3.5_letter_end`, `jade/J_7.D2` (old ones as `_v1`);
  roto folders `K_3.3_hand/take_6g`, `K_3.5_front/take_4` (+ `paper.json`), `K_3.5_letter/take_1`, `J_7.D2/take_5`
  (+ keep), `J_7.D2/take_6`.
- If a roto folder is re-prepped: `K_3.3_hand/take_6g` needs `wallread_prep.py` after `roto_prep.py`;
  `K_3.5_front/take_4` needs `paper_track.py … env --static 56`; `J_7.D2/take_5` needs the `roto_keep.py` call (the
  region is in its `meta.json["keep"]`).
- Test renders were made while the machine was heavily loaded (load average 30): some frames failed to decode and
  were filled with `--resume`, one worker. The frames I looked at are whole, but the final verified render should not
  reuse them.

## For Jade
- **0:52** — The finger now runs down 举杯邀明月 in one even glide, easing off a little at 月, instead of stopping at
  each character. Frame: `render/out/rev3_hands/stills/0m52_glide.jpg`. (The line is sung just after this shot, so
  the finger reads it ahead of your voice.)
- **0:58** — Kenton's hand gives you the envelope and leaves; MISSION ASSIGNMENT is readable for the whole first shot;
  then you turn it over with both hands and the flap falls open; then you draw out a letter folded in three and its
  top opens to show print inside. Nothing is sped up. Frames: `stills/0m58_handover.jpg`, `stills/0m59_turn.jpg`,
  `stills/1m01_letter.jpg`. Yours to choose: (a) the envelope is still larger than a real letter envelope against
  your hands; making it true size would make the words small: keep it large and readable, or true size? (b) there is
  no seal on the flap now: plain, or a small pale-blue-dot sticker?
- **2:44** — One index finger goes out to M's little hand on the screen, with a shoulder, upper arm, elbow and forearm
  built from a 3D model at your height; your face is the same painting as before, untouched. The screen now stands a
  real arm's reach away, so the picture is a little wider. Frames: `stills/2m44_reach.jpg`, `stills/2m46_split.jpg`.
  Yours to choose: in the split screen your profile is cut just behind the glasses so that M's hand on the screen
  stays in; would you rather see your whole profile and lose more of the screen, or have the split made uneven?
- **2:49** — The close shot is the same gesture from the same take: your fingertip resting on her hand with a point of
  light between. Frame: `stills/2m49_touch.jpg`.
