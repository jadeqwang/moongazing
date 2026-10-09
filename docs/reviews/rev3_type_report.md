# Round three · TYPE — names, the 0:20 card, lyric reveals, the 0:33 camera, labels, the face at 1:56

Owner: TYPE (Oct 8 2026). Brief: `docs/REVISION_NOTES_OCT8.md`, plus three sets of additions from the coordinating
session during the round (section 7). Test renders: `render/out/rev3_type/` (half scale, 3,994 frames in `frames/`,
named by film frame). Nothing is committed. Lint: OK, 125 shots. "For Jade" is at the end.

Changed helper signatures other owners should know are listed in section 8.

## 1. The name: International Moonbase / 国际月球基地

**Asked.** "let's rename the moonbase to just "International Moonbase" across all languages". Guanghan, 广寒, 廣寒 and
the 廣寒 seal leave the screen; where the seal was stamped, the pale-blue-dot roundel is stamped instead.

**What v5 showed.** `f_000480` (0:20): footer "GUANGHAN STATION · LUNAR SOUTH POLE · EST. 2035". `f_002530`–`f_002575`
(1:45): the red 廣寒 seal and "广寒 GUANGHAN STATION" (the English ran into the left mast). `f_001424`–`f_001471`
(0:59): the 廣寒 seal on the envelope flap, a red remnant after it opens, "GUANGHAN STATION PROGRAMME" and "Guanghan
Station" on the memo. `f_002959` (2:03): "GUANGHAN STATION · 89.5° S · THE PLAN". 1:56: "GUANGHAN · FULL EARTH …".

**Changed (text and the stamp only).**

| Where on screen | File | Before → after |
|---|---|---|
| 0:20 footer | `render/src/sections/01_intro_b.js` (1.2 type block) | `GUANGHAN STATION · LUNAR SOUTH POLE · EST. 2035` → `INTERNATIONAL MOONBASE · LUNAR SOUTH POLE · EST. 2035` |
| 0:25 stand-in tag (drawn only if K_1.5 is missing) | same file, 1.5 fallback | `Guanghan Station at night` → `International Moonbase at night` |
| 0:58 envelope front, reference line | `render/src/scenes/papertype.js` (`envelopeFront`) | `REF FCO-36-0147 · GH-E1` → `· IM-E1` |
| 0:59–1:01 seal on the flap, memo text | `render/src/scenes/papertype.js` | First changed to the new name and the roundel; then HANDS restaged the shots without them, so at the coordinator's request the dead `memo`, `sealWhole` and `sealBroken` sheets and `SEAL_BACK` are **removed** (55 lines). Nothing in `papertype.js` names or draws the old station now |
| 1:45 stamp | `render/src/sections/05_interlude.js` (5.2 scene line), `render/src/scenes/extra.js` (`stamp`) | `seal: 'seal_guanghan'` → `seal: 'emblem_final', mode: 'over'`. Same `drawStamp` animation (shadow and ghost come down, it lands on the beat, the paper deflects). `stamp` gained an optional `mode` so the roundel keeps its indigo and pale blue instead of being multiplied into the paper like vermilion paste |
| 1:45 label | `05_interlude.js` (5.2 type block) | `广寒  GUANGHAN STATION` (one line) → `国际月球基地` over `INTERNATIONAL MOONBASE` (two lines, so it stays left of the mast); the coordinate line moved down 12 px |
| 2:03 plan caption | `render/src/sections/07_drop.js` (7.A0) | `GUANGHAN STATION · 89.5° S · THE PLAN` → `INTERNATIONAL MOONBASE · …` |
| 2:12 lights caption | `07_drop.js` (`BUILD_CUTS`, 7.A5) | `GUANGHAN STATION · 89.5° S · LIGHTS ON` → `INTERNATIONAL MOONBASE · …` |
| 2:42 signal-delay label | `07_drop.js` (7.D1) | `AUSTIN → GUANGHAN  1.28 s` → `AUSTIN → INTERNATIONAL MOONBASE  1.28 s` |
| asset loading | `render/src/main.js` lines 44–45 | `seal_guanghan` is no longer loaded or pinned at start (nothing draws it) |
| 03_verse2 | `render/src/sections/03_verse2.js` line 46 | the unused `SEAL_BREAK` constant is gone |
| laptop screen at 1:03 (painted into a take's key by a tool) | `tools/desk_comp.py` | `Guanghan Station Trajectory Working Group` → `International Moonbase Trajectory Working Group`. **The tool was not re-run** (see below) |
| unused letter scene | `render/src/scenes/moments.js` | same replacements (text and roundel), so the old name cannot come back if the scene is wired again |
| subtitles | `release/subs/make_subs.py` and the four generated files | the 0:20 cue (section 7b). The station was never named elsewhere in the subtitles |
| internal | `docs/guanghan_layout.md` | one line at the top: the on-screen name is International Moonbase |

Not changed, on purpose: file and folder names, comments, `docs/`, the `seal_guanghan` image files and `tools/seal.py`
(they make the identity board), `release/review/decisions.html` (the old page quotes the old label in a card body; the
main session rebuilds the page).

**Credits, title.** `scenes/colophon.js` and `scenes/title.js` never named the station.

**Keyframes and takes with the old name painted in: none in a painted keyframe.** How I looked:
1. Every prompt file in `media/keyframes/*.txt`, `media/keyframes/jade/*.md` and `media/chars/_prompts/*.txt`: 31 mention
   Guanghan, all as a description of the place for the image model; none asks for the name as lettering, a sign, a
   patch or a seal (`K_3.5_back.txt` says outright that the seal is composited in JS).
2. OCR (tesseract, English only) over all 253 images in `media/keyframes/` and `media/keyframes/jade/`: the only hits
   are internal review sheets (`SHEET_SPACE.jpg`), which are never on screen. Chinese OCR is not installed, so 广寒 as
   painted characters was checked by eye only, on v5 frames of the shots where a sign could be (0:23, 0:24, 0:26,
   1:12, 1:13, 2:03, 2:20, 2:25, 2:41, 2:52, 2:56; `render/out/rev3_type/name/v5_signage_check.jpg`): none.

One thing is baked into a take's files:

| v5 time | Shot | What | Owner | Fix |
|---|---|---|---|---|
| 1:03–1:05 | 3.6e | The byline on the laptop's paper, "Guanghan Station Trajectory Working Group", painted into `media/gen/J_3.6e/roto/take_2/key.jpg` by `tools/desk_comp.py` (25 px type in a 2560-px key: under 10 px on screen at 1080p, not readable at 540p) | FACE | The string in the tool is fixed. Re-run `$MPY tools/desk_comp.py J_3.6e/<take>` on whichever take ends up in the shot (it has to be re-run after any `roto_prep.py` anyway) |

**Checked.** `render/out/rev3_type/name/s52_sheet.jpg` (1:45 stamp sequence), `frames/f_002518`–`f_002582`,
`follow/labels_gone.jpg`.

**Falls short.** 1:45: the roundel is flat vector colour on an ink painting. It reads, but BASE may want it smaller
or set into the redrawn plan differently: it is one line, `stamp: { seal: 'emblem_final', x: 330, y: 300, size: 230 }`.

## 2. The 0:20 card

**Asked.** "Every space program on Earth is building the International Moonbase" (in both languages); breaks
"Every space program on Earth / is building the / International Moonbase." and 这一次，/ 全世界的航天计划 / 共建 /
国际月球基地 in vertical columns.

**What v5 showed.** `f_000480`: "…is building one moonbase / together." (60 / 84 / 126 px), four columns of 76 px
(这一次，全世界 共建一座 月球基地), footer with the old name.

**Changed.** `render/src/sections/01_intro_b.js`, the 1.2 `type` block (the `card` call, the four `calli` calls and a
comment):
- English: italic 56 "Every space program on Earth", 62 "is building the", 80 "International Moonbase." from
  (110, 126). The name is the large line. At 88 px its full stop touched the tower's left guy wire, so it is 80
  (it ends about 74 px short of the wire at that height).
- Chinese: four columns, right to left, 58 px (这一次，/ 全世界的航天计划 / 共建) and the name 国际月球基地 at 70 px.
  The eight-character column sets the size: it has to end above the pad's ground line (it ends about 46 px above).
- Timing in the 3.75 s shot: the English fades in line after line from +0.25 s and is whole at +1.1 s; the columns
  are brushed from +0.55 s and the last is finished at +2.5 s; everything is whole for 0.95 s more, then fades over
  the last 0.3 s into the taiko cut (v5 did the same).

**Checked.** `render/out/rev3_type/card12/c12_sheet.jpg` (first layout), `frames/f_000421`–`f_000510`, strips
`strips_after/07_…c12.jpg` to `11_…z12d.jpg`. Representative frame: `frames/f_000485.jpg`.

**Falls short.** The Chinese is smaller than in v5 (58 against 76) because one column is now eight characters. The
alternative is to break it 全世界的 / 航天计划, five columns at about 72 px; that changes her line breaks, so it is a
question for her. The comma after 这一次 sits low in its cell as it did in v5 (the brush font has no vertical comma).

## 3. Lyric reveals, the whole film

**Asked.** "part of the top of 'h' in watching is already on screen, before the word renders. it may be worth while
to do a pass to make all the lyrics go smoothly and nonglitchy, or for shorter phrases/lines, just unanimated" and
"the lyrics appearing on screen is a bit jerky and could be more smooth, alternately, for shorter phrases, you can
just have them already on screen instead of animated appearing".

**What the v5 frames showed** (`render/out/rev3_type/v5_L05_strip.jpg`, `v5_L01_strip.jpg`, `v5_L07_strip.jpg`:
every frame, cropped to the line).
- 0:47: a speck under "in afternoon" from 47.21 to 47.83 (the tops of the t and h of "teahouses"), another under
  "teahouses" from 48.08 to 48.79 (the top of the h of "watching"). Measured: 0.7–0.9% of the next word's ink on
  screen for 16 and 18 frames before its time.
- Every English line was wiped in by a ragged travelling edge that cut through letters ("in afte", "teahou", "wato").
  Words popped: when the next word began, whatever was left of the previous one appeared at once; a word could show
  half, vanish and come back ("in" at 0:32.67–0:33.21 is 55% there, gone, then wiped in again).
- Chinese: the same two faults. A stroke of the next character showed early (a speck of 月 at 55.17–55.29, before
  it is sung) and each character arrived in 2–3 frames.

**Cause.** `Card.drawReveal` (`render/src/type.js`) masked each typographic line with a band from 1.05 em above its
baseline to 0.4 em below; the next line's ascenders start 0.37–0.42 em below, so their tops were inside the band of
the line above. The mask's edge was a per-row jittered gradient (the "dry brush"), and `lyricEN` gave one edge per
line: the edge of the latest word that had begun, plus a 40 px jump when a word finished, so a word that had not
finished was revealed whole the moment the next one started. Chinese: `lyricZH` drove one travelling brush through
the whole line and scaled its progress by (n + 0.25) / n "to let the brush finish each character", which pushed the
brush a little into the next character before its onset; characters were brushed in as little as 0.16 s.

**Changed.**
- `render/src/type.js`
  - `Card`: the mask and `drawReveal` are gone. New `drawWords(g, A, alpha)`: every run (word) is drawn whole at its
    own opacity, so nothing of a word or a line can be on screen before its turn and no edge crosses a letter.
    `Card.draw(g, wipe, alpha)` (cards, glosses, the title) now fades the lines in one after another on overlapping
    eased ramps. `cardTiming` returns a linear `wipe` (the card eases it) and its default fade-out is 0.4 s.
  - `InkText.render(p, …)`: `p` may be an array, one progress per character (0 = nothing at all, 0..1 = being
    brushed, 1..2 = the ink creeping on). Each lyric character is brushed on its own clock; the dry leading edge is
    wider in this mode (a stroke takes about three frames, not one) and the first touch of the brush comes up softly.
    A single number still means one travelling brush (cards, inscriptions, the title): unchanged.
- `render/src/sections/_lib.js` (the block "HOW LYRICS ARRIVE" above `lyricEN` states the rules)
  - `lyricEN`: a word fades in over 0.42 s, starting 0.14 s before its sung onset. A typographic line of one word,
    of two words sung as one phrase (less than 0.6 s apart) or of words less than 0.22 s apart fades in whole, once,
    over 0.5 s. Anything whose turn has come by the first frames of a shot is **simply there at the cut**. Anything
    whose turn comes in the last 0.2 s of a shot waits for the next shot. A fade-out is 0.45 s and never starts until
    the last word has been whole for 0.4 s; if that leaves no room before the cut, the line is not faded and leaves
    with the picture (v5 faded "with waning" out while it was still being wiped in).
  - `lyricZH`: per-character progress as above; a character takes at least 0.52 s to brush (it was 0.16 s), at an
    even brush speed; one due at the cut is there at the cut; a last character that could not be finished before
    the line leaves is brushed with the one before it (人 with 三 at 0:57, 念 with 思 at 1:22: both are sung into a
    cut).
  - `card`, `calli`, `lyricEN`, `lyricZH` draw through a new `typeLayer`, which is what the check below measures.
- `render/src/sections/06_breakdown.js`: "I think", "of", "home" are eased fades of 0.42–0.45 s (they were 0.32 s
  wipes).
- `render/src/sections/03_verse2.js`: "That line—" at 0:52 now finishes its fade at the cut (`until: S34 + 0.02`; it
  was cut off half-faded).

What each line does now:

| Time | Line | Arrival |
|---|---|---|
| 0:32 | The willow in winter is slender | "The willow" there at the cut; in, winter, is, slender fade in on their onsets |
| 0:36 | her switches plain and straight | "her switches" at the cut; plain, and, straight fade in |
| 0:39 | the West Lake wind / sings over water | "the" at the cut; then word by word |
| 0:43 | like smoothing silk and late | "like" at the cut; then word by word; at 0:45 the whole line is simply there on the wall |
| 0:47 | in afternoon / teahouses / watching | "in afternoon" at the cut; "teahouses" and "watching" each one fade |
| 0:50 | snow-brewed tea. | "snow-brewed" at the cut; "tea." fades in |
| 0:52 | That line— | there at the cut |
| 0:54 | 举杯邀明月，对影成三人 | brushed character by character; 明 and 影 fall on cuts and are there; 三人 together |
| 0:58 | I think of you — / homesick / with waning | "I think" at the cut, "of", "you —" fade; "homesick" there at its cut; "with waning" one fade |
| 1:01 | (same line over the training montage) | simply there |
| 1:05 | moons and / lonely wine | "moons" at the cut; and, lonely, wine fade in |
| 1:17–1:23 | 月缺 · 酒寒 · 我思念 · 你 | each brushed in half a second; 酒, 我, 你 there at their cuts; 思念 together |
| 1:26, 1:28 | I think of you, I think of you | "I" at the cut; think, of, you cascade |
| 1:32 | 举杯邀明月 | 举 at the cut, the rest brushed |
| 1:34 | moons and lonely wine | "moons" at the cut; then word by word |
| 1:52 | 举头望明月， | 举 at the cut, the rest brushed; leaves with the cut |
| 1:55 | 低头思故 / I think / of / 乡 home | column brushed, leaves with the cut to 乡 (which is there at the cut); "I think", "of", "home" fade |

**The proof.**
- `render/tools/type_reveal_check.mjs` (new). Renders every frame, and for each piece of type draws it alone and
  measures the revealed ink per frame, in total and per unit (word, character, card run). It flags: EARLY (ink in a
  unit's place before its time; the limit is 0.3% for the first word of a line, which is what catches the h),
  POP IN / POP OUT (more than 34% of a unit in one frame, away from a cut), FAST (5% to 95% in fewer than 5 frames),
  UNEVEN (a curve that goes back, or dips while held). A unit whole on the first frame of a shot is "there at the
  cut". Characters passed by a card's travelling brush and commas are judged for EARLY only (one dab each).
  `node tools/type_reveal_check.mjs --plot out/curves` (5 minutes for the film at half scale; exit code 1 on a flag).
- Before (v5 code, the same probe): 47 pieces of type, **185 flags**: English lyrics 85 on 14 lines (27 early,
  15 pops, 42 uneven), Chinese lyrics 38, cards 11, card calligraphy 51 (the last are the per-character judgement
  that the final rules drop). The 0:47 specks are in that data. `render/out/rev3_type/reveal_before.txt`,
  `curves_before/`.
- After: 50 pieces of type (the three English words of the breakdown are now measured too), **0 flags**, no frame
  failed. `render/out/rev3_type/reveal_after.txt`, `reveal_after.json`, `curves_after/`. Shortest English word rise:
  6 frames; shortest card line: 7.
- `render/tools/type_reveal_strips.py` (new) cuts, from the report and the rendered frames, a strip of every
  consecutive frame across each piece's arrival and fade-out: `render/out/rev3_type/strips_after/` (50 images). I
  looked at the English lines 12, 14, 16, 18, 20, 21, 22, 25, 27, 35, 36, 38, the Chinese ones 23, 28, 32, 42, the
  breakdown's English (43, 44, 46), the 0:20 card (07) and the title (`title_strip.jpg`). Not looked at frame by
  frame: 19 and 26 (lines that are simply there), 30, 33, 37, 40, 45, the other cards, the glosses, the small
  inscriptions and the outro (all clean in the check).

**Falls short.**
- Judged from frames and curves, not at speed with sound. Whether 0.42 s feels late against the voice is the thing
  to listen for; it is two constants, `LYR_LEAD` and `LYR_RAMP`, in `_lib.js`.
- 三人 (0:57) and 思念 (1:22) are brushed together, so 人 and 念 appear about 0.5 s before they are sung. The
  alternative is a character half-written at the cut.
- "tea." (0:51) is whole for only 5 frames before the cut; it comes on its sung onset and the shot ends 0.5 s later.
- Chinese on cards and inscriptions is still one travelling brush (0.3–0.9 s for a column). Its whole-block curves
  are smooth and nothing arrives early; a single character is passed in 2–4 frames, by design. Not changed: she did
  not name it, and I was asked not to redesign it.
- HUD labels blink on by design ("HARNESS · LOCKED" in 2 frames at 1:14); not touched.

## 4. The camera at 0:33 (West Lake with the boat)

**Asked.** "something about the camera movement is jerky here".

**What the v5 frames showed.** Every frame of the shot (`f_000778`–`f_000860`), global motion frame to frame (600
tracked features below the lyric, RANSAC similarity fit; `scratchpad/type/gmotion.py`): the frame is **still for the
first 0.9 s** (−0.02 to −0.17 px per frame at 540p, a slight creep the wrong way), then **the pan starts in two
frames at 0:33.33** (0 → 1.8 → 3.1 px per frame), runs at 4 px per frame and eases out to the cut. Hold, jolt, pan.

**Cause.** Not the take: `media/gen/K_2.1/roto/take_2/meta.json` has a locked camera (travel 0.11 px, every
transform the identity), it plays at rate 1 and its drawings are held evenly. The engine's own move was
`from: { x: 0.62, zoom: 1.22 }`. At zoom 1.22 the frame shows 82% of the painting's width, so the view centre cannot
be right of x 0.590; the roto scene clamps it. The eased move ran from 0.62 to 0.59 for 0.9 s while the picture
stood still, and came out of the clamp already at speed.

**Changed.** `render/src/sections/02_verse1.js`, the 2.1 scene line (and a comment above it):
`from: { x: 0.62, y: 0.52, zoom: 1.22 }` → `from: { x: 0.595, y: 0.52, zoom: 1.24 }`; `to` unchanged. The start
framing is what v5 actually showed; the move is now inside the picture from the first frame, so the scene's sine
ease covers the whole shot. No new take, no spend.

**Measured again** (`render/out/rev3_type/frames/f_000778`–`860`): speed rises from 0.2 px per frame at the cut to
3.5 at mid-shot and falls to 0.4 at the end; the largest change of speed between two frames is **0.15 px** (v5:
2.0); rms 0.09 (v5: 0.28). Travel 184 px at 540p (v5: 178).

**Falls short.** The move starts from rest at the cut and comes to rest at the next. If she would rather the scroll
were already drifting when we cut in, that needs an `ease` option on the roto scene (`render/src/roto/index.js`
hard-codes the sine ease); not added. The neighbouring shot 2.2 had uneven drawing holds: fixed in section 7a.

## 5. Labels removed

**Asked.** Remove both small sky labels (1:52, 1:56) and "DAY 388" (2:56).

**Changed.** `render/src/sections/06_breakdown.js`: the `edge(...)` call in 6.1 and the `where` label in `moonType`
are gone, with their two helper definitions. `render/src/sections/07_drop.js` (`E_SHOTS` type block): the
`hud(ctx, 'DAY 388', …)` line is gone. "DAY 329" at 2:40 stays (not asked; the chat line refers to it).

**Checked.** `frames/f_002700.jpg` (1:52), `f_002790.jpg` (1:56), `f_004231.jpg` (2:56); `follow/labels_gone.jpg`.

## 6. Her face out of the 1:56 passage

**Changed.** `render/src/sections/06_breakdown.js` line 41: `const FACE = false`. Shot 6.2b is no longer built; 6.2d
(Layla with the container) runs from 1:57.4 to the sung 乡 at 1:58.8, slowed to 0.66, as built last round.

**Checked.** Every third frame 1:55.4–1:59.2, `render/out/rev3_type/brk_noface_sheet.jpg`: wide on the rim → Adaeze
at the feeder → Layla mid-stride → 乡 with the wide. No face, no label. Representative: `frames/f_002830.jpg`.

**Falls short.** Layla's take is 23 prepared frames over 1.37 s; with the fix of 7a her drawings are now held 2 film
frames each (they were held 3, 3, 3, 4). Not looked at at speed.

## 7. Additions from the coordinating session

### 7a. Uneven holds of takes played at another rate (the stutter ASTRO found)
**What it was.** Roto drawings are on twos by keeping the take's even frames. At rate 1 each is held two film
frames. At any other rate the holds came out uneven: 2.2 (rate 0.9) 2, 2, 2, 2, 3; 0.3, 0.6 and 1.1 (0.75) mostly 3s
with 2s; 6.2d (0.66) 3s and a 4; 6.2a (1.4) and 7.B3 (1.6) mostly single frames with some 2s; 3.1 (a time function)
1s, 2s and 3s. Shot 2.1 itself plays at rate 1 and was even, so this was not part of the 0:33 complaint; 2.2, the
next shot, was.

**Changed.** `render/src/roto/index.js`: new exported `drawingAt(meta, p, t, lt)`, used by the roto scene and by
`scenes/papertype.js` (so tracked paper stays on the same drawing). For a take with `rate` ≠ 1 or a `time` function,
on twos, the twos are counted in film frames: one drawing for every two film frames from the shot's first frame,
namely the take's frame at the first of the two. Takes at rate 1, lip-sync takes (`ref_t0`) and `twos: false` are
exactly as before. It is a pure function of t.

**Verified.** `render/tools/roto_holds.mjs` (new) lists the holds of every roto layer under the old rule and the
engine's: all eight uneven layers (0.3, 0.6, 1.1, 2.2, 3.1, 6.2a, 6.2d, 7.B3) now hold every drawing two frames, and
nothing else changed. Determinism: 2.2 rendered twice (2 workers, then 1): 88 of 88 frames byte-identical.

**For the owners.** 6.2a and 7.B3 were mostly on ones by accident; they are now truly on twos, so each drawing jumps
2.8 or 3.2 take frames. If BASE wants 7.B3 smoother, `twos: false` on its roto line restores ones. 3.1 (the kiss):
the drawn frame can differ from v5 by one take frame at any moment; the kiss timing was not re-examined.

### 7b. Subtitle for the 0:20 card
`release/subs/make_subs.py` (the fourth `CARDS` entry): "This time, every space agency on Earth / is going
together." / 这一次，地球上所有的航天机构都要一起去。 → "Every space program on Earth / is building the International
Moonbase." / 这一次，全世界的航天计划共建国际月球基地。 The bilingual pair splits at +1.9 s
(这一次，全世界的航天计划 | 共建国际月球基地。). Regenerated all four files; only that cue differs
(`diff` against the copy in `scratchpad/type/subs_before/`). The script's own checks pass (29 bilingual cues).

### 7c. The Moon at 0:15.7
It arrived whole on one frame (377), in the middle of a continuous take. `render/src/scenes/inkmoon.js`: `pale` may
now be a number or a function of time (how present the shell-white Moon is). `01_intro_b.js`, the `inkmoon` line of
1.1 only: `pale: (t, lt) => smooth(0.0, 0.9, lt)`. It comes up with the indigo over 0.9 s and is whole well before
the gold line reaches it. The roto line was not touched. `render/out/rev3_type/moon11_after.jpg`.

### 7d. 0:58 lyric stack, after HANDS restaged the envelope
The stack moved from the right margin (now Kenton's hand and cuff, then her sleeve) to the bare desk at the top
left: `03_verse2.js`, the shared `type()` of 3.5a/b/c: `x: 250, y: 112`, left-aligned, three lines ("I think of you
— / homesick / with waning"). Checked in all three shots, 15 frames: `render/out/rev3_type/env35_new.jpg`. It clears
the envelope, the open flap, the letter and every hand; the nearest it comes is about 230 px from the flap's left
edge in the last shot.

### 7e. "LIVE −7 s" at 2:44
One line ran to within 18 px (at 540p) of the screen's corner by the end of the shot. It is now two short lines,
"LIVE" over "−7 s", at the same margin, in all three shots that carry it (7.D2, 7.D3c, 7.D3d) so it does not change
shape between them: `07_drop.js`, three identical `type(ctx)` lines. 80 px clear at 540p.
`render/out/rev3_type/follow/live_after.jpg`. In 7.D3d it sits on the theatre wall as before (red on brown, faint).

### 7f. The Li Bai card at 0:10
Nothing to change: the card's left edge is at x 300 and the small 李白·静夜思 line at 304; the Moon ends at 236
(`render/out/rev3_type/follow/follow_before.jpg`, lower row).

## 8. For other owners: what changed under shared code
- `_lib.js`: `card`, `calli`, `lyricEN`, `lyricZH` keep their signatures. New options on `lyricEN`: `reveal`
  ('words' | 'line' | 'whole' | 'held'), `ramp`, `fout`, `tail`; on `lyricZH`: `tail` (default 'join'). The default
  `lead` of `lyricEN` is 0.14 s (it was 0.06). New exports: `typeLayer`, `cardUnits`, `inkUnits`, the `LYR_*`
  constants. A lyric given `until` close to a cut may now leave with the cut instead of fading before it.
- `type.js`: `Card.drawReveal` no longer exists (use `drawWords` or `draw`); `cardTiming().wipe` is linear;
  `InkText.render` accepts an array.
- `roto/index.js`: `drawingAt` (7a). `scenes/extra.js` `stamp`: optional `mode`. `scenes/inkmoon.js`: `pale` may be
  a number or function. `main.js`: `seal_guanghan` is not loaded at start.
- `render/README.md`: a short section "Checks added Oct 8" names the two new tools; the type rules there now say
  how lyrics arrive.

## For Jade

| Time | What changed | Frame (`render/out/rev3_type/frames/`) |
|---|---|---|
| 0:15 | The Moon no longer snaps on; it comes up with the blue over about a second. | `f_000383.jpg` |
| 0:20 | The card reads "Every space program on Earth / is building the / International Moonbase." with 这一次，/ 全世界的航天计划 / 共建 / 国际月球基地 beside it, and the footer says International Moonbase. | `f_000485.jpg` |
| 0:33 | The camera used to sit still for a second and then lurch into its pan; it is now one slow move that eases in and out. | `f_000810.jpg` |
| 0:33 onward | Every sung line now fades in a word at a time, with no edge cutting through letters; short phrases, and words already sung at a cut, are simply there. | `f_000810.jpg` |
| 0:47 | The specks under the line are gone: nothing of "teahouses" or "watching" shows before the word arrives. | `f_001160.jpg` |
| 0:54 and the Chinese lines after | Each character is brushed in over half a second on its own note, and no stroke of the next one shows early. | `f_001320.jpg` |
| 0:58 | "I think of you — / homesick / with waning" moved to the top left of the desk, clear of the hands and the letter. | `f_001440.jpg` |
| 1:45 | The red seal is replaced by the pale-blue-dot roundel, stamped the same way, and the label reads 国际月球基地 / INTERNATIONAL MOONBASE. | `f_002560.jpg` |
| 1:52, 1:56 | Both small sky labels are gone. | `f_002700.jpg`, `f_002790.jpg` |
| 1:57 | Your face is out of the passage; it goes from Adaeze to Layla to 乡. | `f_002830.jpg` |
| 2:03, 2:12, 2:42 | The captions say International Moonbase. | (HUD text only) |
| 2:44 | "LIVE −7 s" is two short lines, clear of the screen's corner. | `f_003940.jpg` |
| 2:56 | "DAY 388" is gone. | `f_004231.jpg` |
| Subtitles | The 0:20 line matches the new card in both languages. | `release/subs/` |

Choices that are hers:
1. **The Chinese of the 0:20 card.** Is 这一次，全世界的航天计划共建国际月球基地 the wording she wants? And the eight-
   character column 全世界的航天计划 makes the Chinese smaller than before (58 px against 76): keep her four columns,
   or break it 全世界的 / 航天计划 and set everything larger?
2. **The Chinese name.** 国际月球基地 is used at 0:20, 1:45 and in the subtitles.
3. **0:33.** The pan now starts from rest at the cut. Would she rather cut into a scroll that is already drifting?
4. **Sung into a cut.** At 0:57 三人 and at 1:22 思念 are brushed as a pair, so the second character appears half a
   second before it is sung. The other way is to see it half-written when the picture cuts.
5. **1:45.** The roundel is the flat emblem on an ink drawing. Fine as it is, or should it be smaller or toned
   toward the paper?
