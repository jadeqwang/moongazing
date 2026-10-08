# rev2_tea — the teahouse (shots 2.5 + 3.1), 8 October 2026

Working log; newest state at the bottom. Nothing here is committed.

## What Jade asked (v4, 0:45)
"lack of movement in Jade looks weird. suggested natural movements (to have a video model do, don't do it yourself):
have jade turn to kiss M on the forehead, and have Jade's mom look at the tea that she's pouring"

## What v4 shows (render/out/frames_v4_540/f_001088..001212)
One take (`J_3.1/take_3`) across 2.5 (45.29–46.82) and 3.1 (46.82–50.49). The mother pours and the pot behaves; M looks
up at Jade; Jade does not move for five seconds; the mother's painted eyes look at the camera, not at the stream.
Both women's faces are the painted keyframe carried on the heads (`tools/roto_keep.py`), and both painted faces look
into the lens, so whatever the take did, the eyes could not follow.

## Plan (as first written; the timing and the face carry ended differently, see Result)
1. Keyframe: lower the mother's eyes to the cup she is pouring into (eye region only, composited back through a
   feathered polygon; old file kept as `J_3.1_v2.png`). Jade's painted face is not touched.
2. New takes from that keyframe (Seedance 2.0 / h3, two at a time, `tools/vgen.py`): Jade inclines to M and kisses her
   forehead, draws back still looking at her; the mother watches the stream for the whole pour; pot wording of take_3 kept.
3. Timing against the lyric (L05: in 46.82 · afternoon 47.18 · teahouses 47.94 · watching 48.90–49.98; kit 47.14):
   2.5 = lean-in already under way; kiss lands about 48.0 ("teahouses"), released about 48.9 so that "watching" falls
   on Jade drawn back and looking at her daughter while her mother watches the tea; about a second of that before the
   cut to 3.2 at 50.49.
4. Painted-face carry: mother's face kept (now looking down); Jade's kept only while her head is still near the painted
   angle, off while it is turned (to be decided on the render).

## Result (state at 08:35, 8 Oct; lint OK, 123 shots; nothing committed)

Clip with master audio, 44.4–51.6 s (end of 2.4, 2.5, 3.1, first second of 3.2):
`render/out/rev2_tea/tea_2.5_3.1_540p.mp4`. Frames: `render/out/rev2_tea/frames/f_%06d.jpg` (global index, 540p).
Sheets: `render/out/rev2_tea/sheet_2.5_3.1_a.jpg`, `sheet_2.5_3.1_b.jpg` (every 4th frame, people cropped);
1080p crops of four stills: `render/out/rev2_tea/stills_1080_crops.jpg` (stills in `render/out/rev2_tea/stills/`);
the raw take on 16 frames: `render/out/rev2_tea/take_6_sheet16.jpg`.

### What now happens, and when
| Film time | Frame | What |
|---|---|---|
| 44.67–45.29 | 1072–1086 | (2.4, not edited) the teahouse soaks up through the silk: the still keyframe, now with the mother's eyes lowered |
| 45.29 | 1087 | 2.5 begins on the take 0.21 s in: mother pouring, eyes on the stream; Jade starting to turn her head to M |
| 45.3–46.8 | 1087–1123 | Jade turns and bows her head down toward M; M tilts her face up; the umbrella tips back over M's far shoulder |
| 46.82 | 1124 | cut 2.5 → 3.1 (same take, clock continuous) |
| 46.9 | 1126 | lips touch M's forehead |
| 47.14 | 1131 | kit hit: the kiss has settled; M's eyes are shut in a smile |
| 47.1–48.75 | 1131–1170 | kiss held; the mother finishes the pour (stream stops about 48.2) and rights the pot (48.3–48.8) |
| 48.9 | 1174 | "watching": the kiss is released |
| 49.0–50.49 | 1176–1211 | Jade draws back a little and keeps looking at M, who opens her eyes and beams up at her; mother holds the pot level over the tray, eyes on the cup |
| 50.49 | 1212 | cut to 3.2 (tangyuan macro), on motion |

Timing choice: the lyric is "in (46.82) afternoon (47.18) teahouses (47.94) watching (48.90–49.98)", kit hit 47.14, bar 26
at 48.98. The kiss lands inside 3.1 and settles on the kit hit; it is released on "watching", so that word falls on Jade
looking at her daughter and her mother looking at the tea. The take's own timing was kiss at 1.4–1.7 s, release 3.55 s;
it is retimed in the section files, not re-animated: 2.5 plays 0.21–1.33 s at 0.7 (easing to 1 over its last 0.3 s),
3.1 plays 1.33–4.76 s at 1.06 through the kiss and 0.75 for the drawing back. The take's first five frames (ease-in
from rest) and everything after 4.85 s (figures settle and go still) are not used.

### Files changed
- `media/keyframes/jade/J_3.1.png` = v3 (only the mother's face inside a feathered polygon changed: eyes lowered to the
  pour); previous file kept as `J_3.1_v2.png`; how: `J_3.1_v3_edit_notes.txt`; work files `_J31v3_work/`.
- `media/gen/J_3.1/take_5…8` (+ sidecars with verdicts), `media/gen/J_3.1/roto/take_6/` (prepped 08:17, `keySource`
  = `media/keyframes/jade/J_3.1.png`, keep = ONE region, the mother's face; `tools/roto_keep.py … --region "892,236 906,222
  925,216 948,218 966,230 980,256 979,285 968,310 946,331 923,328 903,308 890,283 886,258" --feather 4 --smooth 2.5`).
  If `roto_prep.py` is ever re-run on take_6, re-run that keep command after it.
- `media/gen/picks.json`: `J_3.1` → `take_6`.
- `render/src/sections/02_verse1.js`, shot 2.5 block only: comment, `offset: 0.21`, `time`, `twos: false`.
- `render/src/sections/03_verse2.js`, shot 3.1 block only: comment, `offset`, `time` (rate knots K).
- `docs/script.md`: rows 2.5 and 3.1.

### Takes and verdicts
| Take | Model | Verdict |
|---|---|---|
| take_5 | Seedance 2.0 720p, 6 s, $0.90 | REJECT: M's umbrella dissolves out of the picture at 4.4–4.8 s; the kiss lands early and nose-to-cheek |
| **take_6** | h3 768P, 6.5 s, $0.48 | **PICK**: forehead kiss lands 1.4–1.7 s, held to 3.5 s, Jade draws back and stays turned to M; M shuts her eyes, then beams; umbrella whole and rigid, tips back, no head through it; mother's eyes on the stream throughout; pot by the handle, fingertips on the lid, spout always left, righted 2.9–3.5 s, never flips. Looked at: 16-frame sheet, 24 crops of the heads, 20 crops of the pot and hands |
| take_7, take_8 | h3 768P, 8 s, $0.64 each | Clean, NOT USED: prompted for a later kiss so 2.5 could run at natural speed; the lean-in came out 3.8–4.2 s long, which would need 2× in 2.5 and leaves the mother holding the pot idle through 3.1 |

Prompts are in the sidecars (`media/gen/J_3.1/take_N.json`). The pot wording of take_3 was kept.

### Painted faces
The mother's painted face (eyes lowered) is carried on her head for the whole take, as before. Jade's painted face is
NOT carried: it is a frontal face and her head turns down and away within the first second. Her face in 2.5/3.1 is the
roto redraw of the take; the painted keyframe face is seen only in the silk bleed (44.7–45.29). Jade's painted face
in the keyframe was not touched.

### Frames checked (540p unless noted)
First frames of 2.5: `frames/f_001086.jpg` (last bleed frame), `f_001087.jpg`, `f_001088.jpg`, `f_001089.jpg`.
Lean-in `f_001110.jpg`; cut `f_001123.jpg` / `f_001124.jpg`; kiss `f_001134.jpg`, `f_001158.jpg`; release
`f_001178.jpg`; after `f_001190.jpg`, `f_001206.jpg`; cut into 3.2 `f_001211.jpg` / `f_001212.jpg`.
Every 4th frame 1086–1214 on the two sheets; mother and pot on 12 crops; 1080p stills at 45.5, 46.5, 47.6, 49.9.
Numeric screen (optical flow, 90th percentile per box, px at 540p; wall box = camera baseline): motion in the people
box from the first window (1.0 px / 2 frames at 45.29, 2–4 px from 45.46), no run of four identical frames anywhere,
people box 3.4–8.5 px / 4 frames in the last half second (the shot cuts on motion).

### Spend
Video $2.66 of the $12 (take_5 0.90, take_6 0.48, take_7 0.64, take_8 0.64; all in `media/gen/spend.jsonl`).
Image: one nano-banana-pro edit, $0.13 (`media/genlog.jsonl`, tag rev2_tea). No codex jobs.

### What does not yet meet the bar, or needs Jade's eye
1. **Nobody has watched it at speed.** I judged from frames, sheets and flow numbers. Watch `tea_2.5_3.1_540p.mp4`.
2. **The held kiss is nearly motionless for about 1.6 s** (47.1–48.75: Jade and M move 0.4–0.5 px per 4 frames above
   the camera baseline; the mother, the pot, the steam and the camera do move). It is a kiss being held, but it is the
   kind of stillness the notes warn about. `frames/f_001138.jpg` … `f_001166.jpg`.
3. **2.5 runs the take at 0.7×.** h3 moved the heads on twos, so in the fill Jade's head takes a new pose about 8 times
   a second, not 12. Slightly steppier than the rest of the film for 1.5 s. `frames/f_001099.jpg` … `f_001123.jpg`.
4. **Soft first four frames.** At 45.29–45.42 the people move about 1 px (540p) per two frames; full motion from 45.46.
   Not a frozen frame, but not full motion at the cut-in either. `frames/f_001087.jpg` … `f_001090.jpg`.
5. **Jade's face is the video model's from 45.29 on.** In the first half second it is still frontal and plainer than
   her painted face (narrower eyes): `stills/tea_045.500.png`. Turned to M it is a three-quarter profile with glasses
   that reads as her, but it is not painted from her photos: `stills/tea_047.600.png`, `tea_049.900.png`. Her likeness
   call.
6. **A small gold hair clasp** appears at the back of Jade's head once she turns (not visible in the keyframe, invented
   by the take): `stills/tea_047.600.png`.
7. **The mother never looks up.** Her painted eyes are lowered for the whole shot (the optional glance up after
   righting the pot is not there), and she holds the pot level above the tray for the last 1.5 s. 3.2 then shows the
   pot standing on the table; it is never seen being set down. The bowl of tangyuan in 3.2 is not on the table in 3.1
   (as before this change).
8. **The mother's face edit** also bowed her head a touch and smoothed the skin inside the polygon. It reads as the
   same woman to me; it is Jade's mother, so Jade should look: `media/keyframes/jade/J_3.1.png` against `J_3.1_v2.png`.
9. Only four frames were looked at in 1080p; the shot was rendered at 540p.
10. `J_3.1/take_3` can no longer be switched back by `picks.json` alone: its roto folder is older than the new
    keyframe (restore `J_3.1_v2.png`, then re-run `roto_prep.py` and `roto_keep.py` on take_3).
11. The v5 full render had not reached 32.42–76.11 s when this was finished (its log shows parts 0–32.42, 76.11–122.77
    and 189.86–221.04 only), so nothing of it needs redoing for this shot.
