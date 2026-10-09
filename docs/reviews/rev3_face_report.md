# rev3 FACE: four glitches in shots of Jade (3.6e, 3.7b, 4.3 sung, 4.7), 8 October 2026

Owner FACE, third revision round (`docs/REVISION_NOTES_OCT8.md`). All four are fixed in the working tree, lint OK,
nothing committed. No video, image or codex job was ordered: **spend 0 USD**. Every fix carries painted pixels or
changes a matte; no model redrew her face.

Test renders, clips and evidence: `render/out/rev3_face/` (`f36e/`, `f37b/`, `f43/`, `f47/` half-scale frames with the
cuts in and out; `f43_1080/`; `stills/` at 1080p; `*_540p.mp4`, `4.3_sung_1080p.mp4`; `evidence/` strips of consecutive
frames before and after; `tools/` the measuring scripts). `render/tools/flicker_check.py` on the four half-scale
folders: 0 flagged.

| Shot | v5 time | Glitch found in v5 (frames) | Measure, v5 → now |
|---|---|---|---|
| 3.6e | 1:05 | headphones redrawn from the take while the painted face rode on the head: they slide up to 18 px against the head, f1546–1565 | headphone motion relative to the head, median 18.2 → 0.43 px; silhouette overlap 0.72 → 0.96 |
| 3.7b | 1:10 | a second jaw contour grows out from under the painted face from f1664 (69.3 s) to the cut | jaw-band motion relative to the face, median 13.1 → 1.5 px; overlap 0.72 → 0.89 |
| 4.3 | 1:22 | sung clip: forehead, hair, brows, cheeks, helmet all redrawn from a head that rises 73 px and shrinks 3 % | upper-head motion relative to the eyes, median 61.9 → 0.37 px; overlap 0.17 → 0.91 |
| 4.7 | 1:33 | the painted tip of her left elbow stays behind as a stub while the redrawn arm drifts up, whole shot, worst from f2238 | suit-coloured pixels where the take shows wall, 0.28 → 0.04 of the zone; frames over 0.15: 64 → 0 of 64 |

## 1. Shot 3.6e, 1:05 — "weird headphone glitchy movement"

**Found.** Frames 1523–1578 of v5 (`evidence/3.6e_v5_every_frame_a/b.jpg`, head-stabilised
`3.6e_v5_head_stabilised.jpg`). Her painted face was already carried on the head (`meta.keep`, one polygon round the
face). The headphones were outside that polygon, so they were redrawn from the take, in which the video model reshapes
them as she turns to the laptop. With every frame warped back onto the face (LK similarity), the ear cup and band move
against the head: under 2 px until f1545, then 7 px at f1546, 13 at f1548, 17–18 px through f1550–1559, back to 3 px by
f1564, and the band's far end stays 5–6 px off to the cut. The head itself travels 16 px and tilts 5.7° in the same
time. So the cup grows, slides back and returns in under a second while the head barely moves: her note exactly.

**Fixed.** The kept region is now the whole head with the headphones (band, both cups, hair on the crown, face), and it
rides on the motion of the *face* alone, the best-tracked part (266 corners). New options in `tools/roto_keep.py`:
`--track` (a region follows another polygon's motion), `--still-regions`, a `--feather` per region; old calls behave as
before. A second, still region holds the painted wall just above the head, so the take's own band cannot show there.

```
MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
WALL="117,122 133,101 154,91 175,88 196,91 216,101 230,113 252,121 277,141 292,160 302,150 292,95 240,45 150,35 105,60 100,105"
HEAD="0,190 22,158 50,136 80,116 100,100 118,86 140,78 175,74 200,77 225,88 245,102 262,114 285,132 303,155 318,185 326,240 330,300 322,345 305,400 265,440 215,432 180,395 150,372 110,372 60,362 20,350 0,340"
FACE="180,200 230,165 290,175 310,240 322,300 318,345 300,400 262,440 215,430 175,380 160,300"
$MPY tools/roto_keep.py J_3.6e/take_2 --region "$WALL" --region "$HEAD" --still-regions 0 --track "$FACE" --feather 1.5,3 --smooth 2.5
```

Section file unchanged (the 3.6e line already reads the clip's keep data).

**The laptop byline** (coordinator's note): `tools/desk_comp.py J_3.6e/take_2` re-run after TYPE's correction.
`stills/f36e_064.667.png` at 1080p reads "International Moonbase Trajectory Working Group"; the old name is gone from
`roto/take_2/key.jpg`. Order after any `roto_prep.py` of this take: delete `key_orig.jpg`, `desk_comp.py`, then the
`roto_keep.py` call above.

**Measured again** (`f36e`, same script): headphone motion relative to the head, median at most 0.43 px (p90 0.96);
silhouette overlap at least 0.956. Frames 1520–1582 looked at one by one, and three 1080p stills.

**Falls short.** The head is one flat painting: it slides 15 px and tilts 4.5°, it does not turn in depth, and her eyes
do not move to the laptop (unchanged from v5). The wall strip above her head is the still painting.

## 2. Shot 3.7b, 1:10 — "my chin appears to glitch for a moment"

**Found.** Frames 1654–1707 (`evidence/3.7b_v5_every_frame_a/b.jpg`, `3.7b_jaw_v5_top_new_bottom.jpg`). The first
frames after the cut (1654–1662) have one jaw line. In the take her head slides 42 px left and tilts 13°, and the model
widens the face as it goes. The painted face rides on top as a rigid patch, so the take's own, wider jaw comes out from
under it: a second contour under the left of the chin from f1664 (69.3 s), clear by f1668, 6–8 px out by f1680 (70.0 s),
12 px by the cut, with a band of skin between the two lines. The roto's eye lock also left a dark blob at her right eye
for a few frames near f1676 in the first rebuild; that is gone too.

**Fixed.** New tool `tools/head_carry.py`: before roto prep, on the take's own pixels, the take's head is taken out and
frame 0's painted head (face, jaw line, ear, hairline) is laid back in, moved by one tracked similarity. Round it, the
painting's own unmoved pixels are used where frame 0 had no head, and the take's leftover face-coloured pixels are
filled in. The head moves at half the take's travel (21 px, 6.7°): at full travel the wedge it uncovers beside the chin
had to be invented and read as a pale smear (`evidence/3.7b_full_travel_left_half_travel_right.jpg`). Then roto prep
with the eye lock off, and `roto_keep.py` as before (her face on its own track, M's face on hers). Result is
`J_3.7_close/take_8c`; `media/gen/picks.json` points to it. Rebuild: `render/out/rev3_face/tools/build_37b.sh`:

```
REG="585,60 615,40 660,30 705,30 735,45 750,75 752,110 748,150 742,172 732,194 719,212 703,227 688,237 672,246 655,247 636,241 618,230 600,215 588,196 582,170 575,148 556,140 554,100 560,78"
FIN="612,100 640,75 700,72 730,100 735,160 715,200 690,222 660,228 635,215 612,180 600,140"
HIDE="540,150 584,150 640,200 690,205 730,185 765,185 760,240 720,265 640,272 588,256 556,218"
MF="776,215 800,200 835,200 862,215 868,245 855,275 832,292 808,296 790,288 774,268 770,245"
$MPY tools/head_carry.py J_3.7_close/take_8 --out-take take_8c --region "$REG" --track "$FIN" --hide "$HIDE" --ring 26 --feather 2 --smooth 2.5 --motion 0.5
$MPY -c "import sys; sys.path.insert(0,'tools'); import roto_prep; roto_prep.prep('J_3.7_close/take_8c', remouth=False, eyelock=False, force=True)"
$MPY tools/roto_keep.py J_3.7_close/take_8c --region "$REG" --region "$MF" --track "$FIN" --track - --feather 2,5 --smooth 2.5
```

**Measured again** (`f37b`): motion of the jaw band relative to the face, median 13.1 → 1.5 px; overlap 0.72 → 0.89.
Every frame 1650–1707 of the final build looked at: one jaw line throughout, including the cut in.

**M's face and both pairs of hands.** Same take and same carried face for M as in v5. Strips of M's face (every second
frame) and of the hands (every third) show nothing wrong: her fingers glide over the relief, Jade's hand stays on her
waist, five fingers each. I looked at these on the build before the half-travel change; the final build alters only
Jade's head, and its strips are regenerated in `evidence/3.7b_new_M_face.jpg` and `3.7b_new_hands.jpg` but not looked
at again.

**Falls short.** Her head now moves half as far as her shoulders suggest; in the frames it reads as natural. Two
counting measures I tried for "a second contour" did not separate v5 from the fix, so the evidence is the band
measure above plus the strips.

## 3. Shot 4.3, 1:22 — sung close-up, "the upper half of the face is glitched"

**Found.** The clip she watched (`rev_page/v5/clips5/sung_4.3.mp4`, frames `render/out/rev2_ls/frames_sung_1080/`,
`evidence/4.3_v5sung_every_frame_a/b.jpg`). Only a small polygon (glasses, eyes, nose) was the painting. Forehead, hair,
brows, cheeks and helmet were redrawn in every frame from the avatar take, whose head rises 73 px, drifts 20 px
sideways and shrinks 3 % within the 34 frames (at 1080p). Measured against the eyes, the upper head moves by a median
of 62 px by the last frame, and the brows and hairline are different drawings in each frame.

Stabilising the take on the painted eyes showed a second problem (`evidence/4.3_take_vs_portrait_contours.jpg`): the
take's lower face does not fit the portrait either. Its chin comes up out of the neck ring and its jaw is half again
as wide. A painted upper half cannot be joined to that lower half along the cheeks without a visible step.

**Fixed.** New tool `tools/ls_sung_portrait.py`, run by `tools/ls_sung_prep.py LS3c/take_7 --portrait`:
1. the take is stabilised on the painted eyes, glasses and nose;
2. every frame is the painting: hair, forehead, brows, glasses, eyes, nose, cheeks, jaw line, helmet, suit, cabin;
3. only the mouth is the take's: lips and interior, with a margin of skin and a soft edge, laid in inside the painted
   jaw line and above the neck ring, frame for frame, nothing re-timed;
4. head, helmet and suit then move as one rigid body by 12 % of the take's own head motion (7 px, 0.2° at 1080p).

The block from `docs/reviews/rev2_ls_block_4.3_sung.js` is pasted over the 4.3 block of `04_hook.js` with clip
`LS3c/take_7pm` and last round's anchors; the comment says how to rebuild. **To rebuild the roto folder:
`tools/ls_sung_prep.py LS3c/take_7 --portrait`.** Without `--portrait` it rebuilds last round's `take_7m`, which is no
longer wired; `docs/HANDOFF.md` still gives the old command.

**Measured again** (`f43_1080`): upper-head motion relative to the eyes, median at most 0.37 px (p90 0.55); overlap at
least 0.91; whole head travel 6.8 px. Every frame 1954–1990 looked at; no seam or slide at the join in the head sheet
(`evidence/4.3_new_heads_1080.jpg`).

**Lip sync** (`tools/sync/viseme_check.py`, `render/out/rev3_face/sync/`). Lag in frames for 寒 opens / 寒 closes / 我
opens / 思 closes / 念 opens / 你 closes:

| Take | Events | Lags | Spread |
|---|---|---|---|
| `take_7` raw | 6/6 | −3.5, −4.6, −2.3, −4.3, −1.1, −3.5 | 3.5 |
| `take_7p` (painted head + the take's mouth) | 6/6 | −2.7, −5.0, −0.7, −3.6, −2.1, −2.9 | 4.3 |

Each event is within 1.6 frames of the raw take. After the teeth are flattened the tool no longer reads the mouth
(`take_7pm` 5/6, spread 8.8; last round's `take_7m` 6/6, spread 10.6), so the wired clip itself is not measured by it.
Instead: the mouth of each composite frame was matched against the raw take's frames i−6…i+6; 34 of 41 frames match
their own frame best, and the other 7 fall in the held 思 and 念, where neighbouring frames are the same shape. The
anchors are last round's, so the wired timing is the table in `rev2_ls_report.md` §6. On the 1080p frames: round O
f1956–1964, closing f1965–1967, narrow with teeth f1967–1980, opening f1981–1983, wide to the cut.

**Teeth at 1080p** (`evidence/4.3_new_mouth_1080_a/b.jpg`, native pixels, every frame). Last round's band was a flat
box with square corners between the lips for f1967–1980: a plaque. `ls_mouth_treat.py` gained a `lens` option (on with
`--portrait`): the band is rounded to a stadium with a softer edge. It now reads as a short rounded bar of upper teeth
with a faint centre gap. No flicker.

**Falls short.**
1. **The jaw does not move.** The brief asked for mouth and jaw to keep the synced motion. Only the mouth does: the
   portrait's chin is hidden behind the neck ring and the take's jaw does not fit the portrait. On 念 the lower lip
   comes within about 25 px of the ring.
2. The teeth are still a simplification, and the lips are the model's, fuller than the painted mouth.
3. No blink in 1.4 s; the cabin is still; two take frames are shown twice in 我 and three skipped in 思, as last round.
4. Judged from frames, not at speed with sound.
5. For TYPE: the pasted block moves the 我思念 line to x 290, y 110, size 180 (was 330, 150, 200). I changed no type.

Fallback, untouched: `J_4.3/take_1` (the non-singing shot; its values are in the block's comment) and `LS3c/take_7m`.

## 4. Shot 4.7, 1:33 — "glitchy left elbow"

**Found.** It is her left arm, bent at her side, on the left of the picture next to the Earth. Frames 2213–2278
(`evidence/4.7_v5_elbow_every_frame_a/b.jpg`). In the take she drifts and that elbow rises about 12 px and foreshortens.
The strip it leaves lies on the soft edge of the roto mattes, so the *painted* elbow tip stays where the painting has
it while the redrawn arm moves away: a pale stub under the arm from the first frame, separate from the arm from about
f2238 (93.2 s), a blurred second elbow by f2262. The same fault, smaller, sat under the raised right arm from f2253.

**Fixed.** New tool `tools/roto_force.py`: sets the motion mask and every subject matte to 1 inside a polygon, so
whatever the take shows there, arm or wall, is what is drawn. Same take, same section line.

```
$MPY tools/roto_force.py K_4.7/take_4 --region "250,318 300,300 350,315 355,440 300,446 258,438 245,400" \
     --region "440,250 520,215 600,170 650,190 640,250 560,300 510,340 505,440 450,440" --feather 6
```

Run it again after any `roto_prep.py` of this take (noted in `picks.json`).

**Measured again** (`f47`): share of suit-coloured pixels in the zone of the painted elbow tip beyond what the take
shows, mean 0.28 → 0.04; frames over 0.15: 64 → 0 of 64. The elbow looked at in every frame 2213–2278
(`evidence/4.7_new_elbow_every_frame_a/b.jpg`; the first half on the build before the right-arm region was added, which
does not touch the left arm), the whole figure every fourth frame, and three 1080p stills. The small Earth turns as in
v5 (frame differences identical).

**Hair.** A low tail, straight and black, floating to the left at about shoulder-blade length, the same in every
frame. Unchanged.

**Falls short.** Nothing I can see. The arm still foreshortens slightly as she drifts, which is the take's motion.

## Files

- Tools: `tools/roto_keep.py` (options added), `tools/head_carry.py`, `tools/roto_force.py`,
  `tools/ls_sung_portrait.py` (new), `tools/ls_sung_prep.py` (`--portrait`, `--life`), `tools/ls_mouth_treat.py`
  (`lens`, off by default).
- Section: `render/src/sections/04_hook.js`, the 4.3 block only. No change in `03_verse2.js` or in `render/src/roto/`.
- `media/gen/picks.json`: `J_3.7_close` → `take_8c`; notes on `K_4.7` and `J_3.6e`. `docs/script.md`: row 4.3.
- Media: `J_3.6e/roto/take_2` (keep, key); `J_3.7_close/take_8c` + roto; `K_4.7/roto/take_4` (mattes);
  `LS3c/take_7p`, `take_7pm` + roto.
- Backups of what was overwritten: session scratchpad `face/backup/`.

## For Jade

- **1:05** The headphones are now part of your painted head and move only with it; the laptop paper's byline reads
  International Moonbase. Frame: `render/out/rev3_face/stills/f36e_064.667.png`.
- **1:10** The second chin line that grew under your jaw from 1:09.3 to the cut is gone; your head now moves about
  half as far in this shot. Frame: `render/out/rev3_face/stills/f37b_070.300.png`.
- **1:22** The sung close-up is in the film, and everything except your mouth is now the painted portrait, nearly
  still. Frame: `render/out/rev3_face/stills/f43_082.300.png`; clip `render/out/rev3_face/4.3_sung_1080p.mp4`.
  **Yours to decide:** your jaw and chin no longer move, only the lips and teeth do. If that reads as stiff on the
  wide-open 念, the choices are the non-singing shot from before, or a new painted portrait with the chin clear of
  the neck ring so the jaw can drop.
- **1:33** The stub that stayed behind under your left elbow (the arm next to the Earth) is gone, and the same
  smaller fault under the raised arm. Frame: `render/out/rev3_face/stills/f47_093.700.png`.
