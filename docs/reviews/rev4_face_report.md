# rev4 FACE: the throat at 1:05 (3.6e) and M's hair against Jade's face at 1:10 (3.7b), 8 October 2026 (night)

Owner FACE, round four (`docs/REVISION_NOTES_OCT8.md`, "Round four"). Both shots are fixed in the working tree, lint OK,
nothing committed. No video, image or codex job was ordered: **spend 0 USD**. No model redrew anyone: both fixes carry
painted pixels of the keyframes and change mattes.

Her notes on cut v6:
- 1:05 "there's a bit of a 'gulp' like motion at my throat that looks ... glitchy?"
- 1:10 "there's something glitchy about the way M's hair interacts with my face. is it because the movement was
  generated without a video model helping with the collision?"

| Shot | Time | Fault found in v6 | Frames to re-render |
|---|---|---|---|
| 3.6e | 1:05 | the neck under her painted jaw was redrawn from the take: a grey patch that changes shape, a white wedge and a dark spike that rises to the chin and sinks again | **1524–1577** (63.46–65.75 s) |
| 3.7b | 1:10 | her painted head, a cut-out moved at half the take's travel, lay on top of M's hair, which the take moves by other rules: the fringe is clipped along the cut-out's edge | **1654–1707** (68.88–71.14 s) |

Clips with the song: `render/out/rev4_face/desk.mp4` (1:02.5–1:07.5), `render/out/rev4_face/globe.mp4` (1:07.5–1:12.5).
Frames: `render/out/rev4_face/frames/` (1500–1739, half scale). Stills at 1080p: `render/out/rev4_face/stills/`.
Evidence: `render/out/rev4_face/evidence/`. Measuring scripts and the rebuild script: `render/out/rev4_face/tools/`.

## 1. Shot 3.6e, 1:05: the "gulp" at her throat

**Found** (v6 frames 1524–1577, `evidence/1.05_throat_every_frame_v6_top_new_bottom.jpg`, upper half). Last round the
painted head with the headphones was carried on the head's motion. Its outline stopped at the jaw line, so the patch of
neck under the jaw and behind the ear (about 100 by 70 px of the take) was still redrawn from the video take in the ink
style, which turns a smooth skin gradient into three flat tones. Three things happen there in v6:

1. The take is redrawn only where it differs from the painting, and that region grows during the first 0.7 s: its edge
   creeps across the throat and the hair on her chest between f1535 and f1541 (the take's subject matte has a hole there
   until take frame 30).
2. From f1546 to f1565, while the head turns to the laptop, the grey tone on the neck spreads, darkens and retreats
   (patch tone 85 to 100 of 255), and a white wedge under it changes shape.
3. The take's own jaw and hair edge show under the still, painted chin as a dark spike that rises to the chin at
   f1548–1562 and sinks again.

Together: something travels up the throat and back down under a chin that does not take part. That is the gulp.

**Fixed.** The neck is now part of the painted head: the carried region runs down past the jaw into the dark hair under
it, so head, headphones and neck move as one body and the join with the take lies in dark hair. And the hair on her
chest and her shirt are redrawn from the take from the first frame (`tools/roto_force.py`), so no edge creeps across
them. Same take, same section line, no tool or shader changed.

```
MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
WALL="117,122 133,101 154,91 175,88 196,91 216,101 230,113 252,121 277,141 292,160 302,150 292,95 240,45 150,35 105,60 100,105"
HEAD="0,190 22,158 50,136 80,116 100,100 118,86 140,78 175,74 200,77 225,88 245,102 262,114 285,132 303,155 318,185 326,240 330,300 322,345 305,400 268,442 246,456 215,470 180,476 145,468 118,452 95,425 70,395 40,366 20,352 0,340"
FACE="180,200 230,165 290,175 310,240 322,300 318,345 300,400 262,440 215,430 175,380 160,300"
BODY="0,300 300,300 296,340 280,380 258,415 242,440 238,460 244,490 258,520 266,545 264,565 250,585 240,610 234,650 236,720 0,720"
$MPY tools/roto_force.py J_3.6e/take_2 --region "$BODY" --feather 6
$MPY tools/roto_keep.py J_3.6e/take_2 --region "$WALL" --region "$HEAD" --still-regions 0 --track "$FACE" --feather 1.5,3 --smooth 2.5
```

Order after any `roto_prep.py` of this take: delete `roto/take_2/key_orig.jpg`, `tools/desk_comp.py J_3.6e/take_2`,
then the two lines above (they replace the rev3 `roto_keep` call). Both are in `render/out/rev4_face/tools/build_keep.sh`.

**Measured** (`tools/neck_stab.py`: every frame warped back by the head's own motion, so what is one body with the head
stands still; the patch of neck under the jaw):

| | change between drawings, mean / max (of 255) | patch tone over the shot | spread per pixel over the shot |
|---|---|---|---|
| v6 | 7.3 / 18.5 | 85.3 – 99.8 | 17.3 |
| now | 0.9 / 6.6 | 89.6 – 91.8 | 3.1 |

**Looked at.** Every frame 1536–1568 at native size, before and after (`evidence/1.05_throat_every_frame_...`); the
neck stabilised on the head, every second frame of the whole shot (`evidence/1.05_throat_head_stabilised_...`); the
difference map of the whole shot (`evidence/1.05_difference_map_...`); three 1080p stills (64.0, 64.54, 65.25 s).
`render/tools/flicker_check.py`: 0 flagged.

**Falls short.**
- The head is still one flat painting that slides 15 px and tilts 4.5°; now the neck does the same. It does not
  stretch or turn in depth, and her eyes do not move to the laptop (as in v6).
- The hair on her chest is the ink redraw (grey, dry-brushed) from the first frame; in v6 it began as the painting and
  changed over 0.3 s. It is the look the rest of the shot already had.
- The bright patches left in the difference map at the far left (f1532–1542) are her shoulder moving as she writes.
  That is the take's motion; I left it.

## 2. Shot 3.7b, 1:10: M's hair against Jade's face

**Found** (v6 frames 1654–1707, `evidence/1.10_hair_contact_every_frame_v6_top_new_bottom.jpg`, upper half). Three
layers meet at her cheek:

1. **The take** (MiniMax h3, `J_3.7_close/take_8`): a video model moved both of them. In its frames the contact is
   right: M's fringe lies in front of Jade's cheek and the end of her glasses, and stays attached there while Jade's
   head travels 28 px to the left during the shot. M's hair as a whole moves about 6 px.
2. **Jade's painted head** (rev3, `tools/head_carry.py`): the painted head of frame 0, cut out along a hand-drawn
   outline, laid over the take and moved at half the take's head travel (13 px in the shot) to cure the second chin.
3. **M's hair**: still the take's, redrawn every second frame in the silk style (flat fills, soft edges).

So the cut-out sits up to 16 px (about 25 px at 1080p) to the right of where the take has her face, on top of the
fringe that should be in front of it. The fringe ends at the cut-out's straight edge, more of it is covered as the shot
goes on, and the redrawn hair beside it changes a little with every drawing while the painted skin next to it does
not. The collision the video model had worked out was pasted over.

**Fixed**, by carrying both heads as paintings and putting them in the right order (`tools/roto_keep.py`, new polygons,
no tool or shader changed):

- Region 2 is now M's **whole** painted head (hair, braid, hair tie, ear, face), on its own tracked motion (400
  corners), drawn over Jade's. Before, only her face was carried. Her hair is in front of Jade's cheek, as painted.
- Region 1, Jade's painted head, gained a strip of M's painted hair beside her cheek (x 752–792, y 108–202 of the
  take). As Jade's head draws 13 px away, what appears between cheek and hair is painted hair meeting painted hair
  under a soft edge, not the take.
- `keepOcc: false` for 3.7b only (section file): with it on, a dark blot of the take showed through on M's forehead
  for the first 20 frames.

```
REG="585,60 615,40 660,30 705,30 735,45 750,75 752,108 792,110 792,150 786,182 772,202 742,200 732,194 719,212 703,227 688,237 672,246 655,247 636,241 618,230 600,215 588,196 582,170 575,148 556,140 554,100 560,78"
FIN="612,100 640,75 700,72 730,100 735,160 715,200 690,222 660,228 635,215 612,180 600,140"
MHEAD="736,268 732,260 730,225 738,202 744,165 748,135 752,112 760,88 775,65 800,47 835,36 880,39 920,52 955,80 976,115 985,150 990,185 1018,210 1022,250 1018,290 990,312 950,308 925,285 890,280 865,283 835,298 810,298 785,280 771,270 755,272"
$MPY tools/roto_keep.py J_3.7_close/take_8c --region "$REG" --region "$MHEAD" --track "$FIN" --track - --feather 2,2.5 --smooth 2.5
```

To rebuild from nothing: `render/out/rev3_face/tools/build_37b.sh` (makes `take_8c` and its roto folder), then the
line above in place of that script's last `roto_keep` line (`render/out/rev4_face/tools/build_keep.sh`).

**Looked at.** Every frame 1674–1706 of the contact at native size, before and after
(`evidence/1.10_hair_contact_every_frame_...`); the contact, the outline of M's hair against the wall, her neck and the
curls on her shoulder every tenth frame at three times size; the whole-shot difference map
(`evidence/1.10_difference_map_...`: motion on twos, no pop); three 1080p stills (69.5, 70.29, 71.0 s).
`flicker_check.py`: 0 flagged.

**Measured** (`tools/hair_swim.py`, frames warped back by M's own head motion; the hair beside Jade's cheek): spread
per pixel over the shot 1.70 → 0.95 of 255, fine detail 14.3 → 20.3. This measure is weak (film grain is most of
it); it does not capture the clipped fringe. The evidence for that is the strips.

**Falls short.**
- M's hair is now a painting that moves and tilts with her head as one piece. No strand moves on its own and the curls
  do not bounce. Her body, arm and fingers are still the take's motion.
- Jade's cheek slides about 13 px past M's hair during the shot; the join between the two painted pieces of hair is a
  soft blend about 10 px wide. I cannot see it in the frames.
- Jade's head still moves half as far as her shoulders (rev3).
- The curls below M's chin are outside the carried head and are still redrawn from the take.

## Checks on the render

- Frames 1500–1523, 1578–1653 and 1708–1739 of my render are **byte-identical** to cut v6: nothing outside the two
  shots changed, including 3.7, which shares the edited block.
- The machine was loaded by other owners' renders. Three of my passes logged failed frames ("Failed to fetch",
  `ERR_INSUFFICIENT_RESOURCES`), and each such pass also left one **wrong** frame behind that was saved without an
  error (1558, 1619, 1673). The frames in `frames/` are those on which two independent renders agree byte for byte
  (`tools/agree.py`). For the main session: a pass that logs any failure must be rendered again whole, not resumed.
- Neither clip has been watched at speed. Everything here is judged from frames, strips and difference maps.

## Files

- `render/src/sections/03_verse2.js`: the 3.7/3.7b block only: three comment lines and
  `...(id === '3.7b' ? { keepOcc: false } : {})`. 3.6e's line is unchanged.
- Roto data (not in git): `media/gen/J_3.6e/roto/take_2/` (`keep.png`, `mask.png`, `s_*.png`, `meta.json`),
  `media/gen/J_3.7_close/roto/take_8c/` (`keep.png`, `meta.json`). Backups of what was overwritten: session scratchpad
  `face/backup/`.
- `media/gen/picks.json`: notes on `J_3.6e` and `J_3.7_close`.
- No change to `tools/roto_keep.py`, `tools/head_carry.py`, `tools/roto_force.py`, `render/src/roto/` or `_lib.js`.

## For Jade

- **1:05** The patch of neck under your jaw was still being redrawn from the video take while your head above it was
  the painting; its shading spread and shrank and a dark edge rose to your chin and sank again. Your neck is now part
  of the painted head and moves only with it. Still short: head and neck are one flat painting that slides and tilts a
  little; it does not turn in depth. Frames re-rendered: 1524–1577. Clip: `render/out/rev4_face/desk.mp4`.
  Frames to look at: 1552, 1560.
- **1:10** M's whole head, hair and braid included, is now the painted picture and sits in front of your cheek, so her
  fringe is no longer cut off along the edge of your face. Still short: her hair moves with her head as one piece;
  no strand or curl moves on its own. Frames re-rendered: 1654–1707. Clip: `render/out/rev4_face/globe.mp4`.
  Frames to look at: 1687, 1700.
- **Your question at 1:10.** A video model did move this shot, and in its own frames the contact is right: M's fringe
  lies in front of your cheek and stays there as you both move. The fault was ours, added last round. To cure the
  second chin, your head was replaced by the painted still, cut out by hand and moved only half as far as the video
  model moved it, and that cut-out was laid on top of M's hair, which was still the video model's. So two pieces that
  touch moved by different rules, with the wrong one in front. Now both heads are paintings, hers in front of yours.
- **Not done:** neither clip has been watched at speed with the song; both were checked frame by frame.
