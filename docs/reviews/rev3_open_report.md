# rev3 OPEN report: the rooftops at 0:10 and the Huangpu terrace at 0:14 (Oct 8 2026)

Owner of shots 0.5, 0.6 and 1.1 in the third revision round. Written as the work went; the newest state is at the end
of each section. Scratch files: session scratchpad `open/`. Test renders: `render/out/rev3_open/`.

## 0. What the v5 frames showed (before any change)

**0:10 (shot 0.5, v5 frames 242–313).** The card is up and the city is a painting that does not live: the only motion
is the slow push-in and a patch of mist that the redraw turns into a grey blot in mid-frame (frames 278–312, at about
x 265–275, y 300–315 of the 960x540 frame). The Moon is cut by the top edge for the whole shot (only its lower third to half
shows) and by 12.9 s it sits under the first word of the card.

**Was there ever a version with moving people? No.** Only one video take of this scene was ever made
(`media/gen/K_0.5/take_1`, minimax/h3, Oct 7 11:02; no other K_0.5 job in `media/gen/spend.jsonl` or
`media/genlog.jsonl`), and its prompt says in so many words "the tiny figures stay in place, looking up at the full
moon". I looked at the raw take (crops at f14/f40/f66/f92): nobody takes a step; what moves is mist rolling in over
the roofs and the camera, which pulls back so the whole Moon is in the raw frame by the end. I pulled the same moment
from every earlier cut (`animatic`, `coldopen`, `fullcut_v1`…`v5`, 10.3 s and 12.9 s): the animatic and the cold-open
test are the painted still with parallax and a band of mist drifting over the lake; v1–v5 are the roto of take_1.
In none of them does a figure move. What Jade most likely remembers is the drifting mist and the parallax of the
earlier cuts, or the raw take's mist. So this is a new take with a new prompt, not a lost one to restore.
Why the Moon is cut: the painted keyframe has it touching the top edge (centre at 5% of the height), and the shot
line pushes in from zoom 1.05 to 1.13, which crops the top.

**0:14 (shots 0.6 and 1.1, v5 frames 314–420).** `K_0.6/take_3` (Seedance 2.5): M lifts the toy Moon from her chest
to arm's length and the toy starts to glow like a lamp; Jade does not move at all (crops of the raw take at
f13/f35/f57/f79/f95 are pixel-for-pixel the same figure: no breath, no head turn, hair still). The river has three
small dim boats with pavilion roofs, which read as old lantern boats; nothing on the water moves except a faint
shimmer.

## 1. Reference search: what the Huangpu really carries (rule 1)

Six photographs saved in `media/ref/rev3_open/` with their sources and licences in `SOURCES.md` (all Wikimedia
Commons, CC0 / CC BY / CC BY-SA). What they show:

- **Working traffic.** The commonest vessel on this reach is the self-propelled cargo barge: 40–70 m long, flat and
  very low (loaded, the deck is a metre or so above the water), the hold open or under a blue tarpaulin (coal, sand,
  gravel), and a small two-storey wheelhouse block right at the stern. They pass one after another in line ("a
  continuous stream of coal barges heading upstream", 2008), sometimes with a tug or pusher. At night they are dark
  shapes with a lit wheelhouse window and navigation lights (white masthead, red and green sidelights).
- **Sightseeing boats.** Two to four decks, 40–60 m, far taller for their length than the barges, every deck lit warm
  from inside and the outline traced in strip light (white, gold, red, or changing colours); several are built as mock
  sailing ships with strings of light up the masts, some as red-and-gold pavilion boats. They throw long coloured
  reflections.
- **The ferry.** A small white two-deck passenger boat crossing between the Bund side and Lujiazui.
- **Scale.** Seen from the Bund, a cruise boat past mid-river is about as wide as the splayed legs of the Oriental
  Pearl; a barge at mid-river is two to three times that and a fraction of the height.

The three pavilion boats in the old keyframe matched none of this: too few kinds, all alike, no working traffic.

## 2. Keyframes (both replaced; old ones kept)

**`media/keyframes/K_0.5.jpg`** (old: `K_0.5_v1.jpg`). One `google/nano-banana-pro` edit of the old painting (prompt:
`media/keyframes/work/K_0.5_nbp_rev3_a.prompt.txt`), now 2752x1536 instead of 1536x864: the figures in the lanes and
courtyards are redrawn larger and in looser groups (walking pairs, children, people at tables, some still looking
up), five sky lanterns hang over the near shore of the lake at the right, and the Moon is amber-gold. The model put
its Moon half behind the hills and 40% too large (it would have run under the card), so
`tools/rev3_open/k05_moon_pasteup.py` re-sets the same disc: scaled to R = 100 px, the limb the hill hid completed by
mirroring, centre at 10% / 16.5% of the picture, the old place filled with the same rows of sky. Checked at full
size: a complete round disc, clear sky all round, lower rim a finger above the hilltops, real maria, matte amber (it
reads as a harvest Moon, not a sun); no seam where the old Moon was; no text; figures separate and whole.
In the shot's framing the Moon sits at about x 154, y 137, R 73–79 of the 1920x1080 frame, so its right edge (x 236)
is 64 px left of where the card starts (x 300): **the card does not have to move.**

**`media/keyframes/K_0.6.jpg`** (old: `K_0.6_v4.jpg`). One `google/nano-banana-pro` edit with two boards of the
reference photographs (`media/ref/rev3_open/board_barges.jpg`, `board_passenger.jpg`; prompt:
`media/keyframes/work/K_0.6_nbp_rev3_a.prompt.txt`). The three pavilion boats are gone. The river now carries, left
to right: the white two-deck cross-river ferry; a long low cargo barge under a blue-grey tarpaulin with its lit
wheelhouse at the stern, a masthead light and a wake (nearest, heading left); a three-deck sightseeing boat with its
decks lit gold and its outline in pink, gold and turquoise strip light, coloured reflection under it (far side, left
of the Oriental Pearl); a loaded coal barge following the first one (right of M); and one of the mock sailing ships
strung with golden lights (far right). Nearer boats are larger than farther ones; no lettering on any of them.
Compared crop for crop with the old keyframe: Jade (hair long, straight, black, to mid-back), M (braid, strawberry
dress, boots, both hands on the toy Moon), skyline, terrace and osmanthus are unchanged.
Two small corrections by `tools/rev3_open/k06_moon_flag_fix.py`: a red flag the model put on the barge's stern staff
is painted out (no flags), and the Moon, which the top edge of the painting clipped by 10 px (so v5 opened this shot
on a Moon with a flat top), is completed and moved down 72 px: the whole disc is now in frame at the cut from the
rooftops, at the same size as the rooftop Moon (R about 73 px), higher and paler, as a Moon is later in the night.

Images: 2 x nano-banana-pro, about $0.27 (est.).

## 3. Video takes

Ordered through `tools/vgen_rev3_open.py` (prompts in that file; one minimax/h3 and one Seedance 2.0 per keyframe,
both of which hold the first frame):

| Take | Model, cost | Keyframe | Verdict |
|---|---|---|---|
| `K_0.5/take_2` | h3 2K 5 s, ff 0.99, $0.65 | first rev3 keyframe (no street) | REJECT: holds the painting, sky lanterns rise, but every figure only shuffles on the spot |
| `K_0.5/take_3` | Seedance 2.0 720p 5 s, ff 0.97, $0.75 | first rev3 keyframe | REJECT: people turn, gesture and swap places inside a courtyard, but walled courtyards give nobody anywhere to walk; it still does not read as people moving about |
| `K_0.5/take_4` | h3 2K 5 s, ff 0.99, $0.65 | street keyframe | REJECT: the crowd walks, but two or three walkers fade to transparent ghosts and back in mid-street (about 1.6 s and 2.6 s) |
| **`K_0.5/take_5`** | Seedance 2.0 720p 5 s, ff 0.95, $0.75 | street keyframe | **PICK**: the crowd walks both ways with visible steps (the porters with the shoulder pole cross about a tenth of the frame in 3 s), lantern carriers, children and the fish lantern move, stall steam curls, eave lanterns flicker, sky lanterns drift up and a few more rise from the city; Moon, sky, hills, roofs still. Every frame f24–f51 looked at: nobody appears, vanishes, merges or slides |
| `K_0.6/take_4` | h3 768P 6 s, ff 0.94, $0.48 | rev3 | REJECT: boats fine, but from 2.0 s M drops into a half-crouch, her dress balloons to twice its width and collapses, she pulls the toy Moon down, and a gust throws both heads of hair sideways |
| **`K_0.6/take_5`** | Seedance 2.0 720p 6 s, ff 0.96, $0.90 | rev3 | **PICK**: Jade settles from a crouch onto one knee (f18–f44, every frame looked at), breathes, and from 2.3 s turns her head toward M; hair to mid-back, stirring. M keeps both hands on the toy Moon over her head, on tiptoe, arms wobbling; the toy stays matte grey (no lamp glow this time). All five boats hold their shape for 145 frames: the two barges go left about 0.4 of a length in 6 s (a real barge at 9 km/h does about 0.3), ferry and sightseeing boat go right, wakes and coloured reflections move |

The first rooftop pair is why the keyframe was changed a second time (section 2, step 3 in `K_0.5.txt`): the lesson is
that tiny figures shut in courtyards cannot "move around" whatever the prompt says; they needed a street.
Each take's sidecar carries its verdict. Sheets: `media/gen/K_0.{5,6}/take_N_sheet16.jpg`. `tools/ffcheck.py` rescored
the older takes against the new keyframes; their original scores are written back by hand with a note.

## 4. Roto, picks, wiring

- `tools/roto_prep.py K_0.5/take_5` and `K_0.6/take_5` (both: key registered, camera travel 0.15 px, no faces).
- `media/gen/picks.json`: `K_0.5` → `take_5`, `K_0.6` → `take_5` (notes say what they replaced).
- `render/src/sections/00_intro.js`, shot 0.5: clip → `K_0.5/take_5`, offset 0.6, same push-in as before. The card
  lines are untouched.
- Shot 0.6: clip → `K_0.6/take_5`, offset 0.6, rate 0.75 (as before). Framing changed: it now starts a little
  higher (`y 0.485`) so the whole Moon is in frame at the cut, and ends at `K06_END = { x 0.58, y 0.575, zoom 1.25 }`
  (was `y 0.52, zoom 1.18`): a slow tilt down from the Moon onto the two of them. Reason: with the Moon whole at the
  top of the painting, the old end framing left it in the corner while 1.1's ink Moon appeared, two Moons in one sky
  for five frames (seen in my first test render, frames 376–380). Now the painted Moon has left the top edge by
  frame 374 and the ink Moon arrives at 377.
- `render/src/sections/01_intro_b.js`, the 1.1 block only: same clip and clock (`offset 0.6 + 0.75 * (LIFT − 13.10)`),
  `from` = the new `K06_END`, `to` = `{ 0.585, 0.57, 1.27 }`.
- All three roto lines carry `style: { snapAmt: 0.12, lineA: 0 }` (the setting 1.4a/1.4b already use). At 1080p the
  default silk line broke into heavy dark dashes round Jade's sweater and M's dress and drew black strokes over the
  sightseeing boat's strings of light (`render/out/rev3_open/stills/hd_014.600.png` against `hdB_014.600.png`); the
  takes already carry the painting's own outlines.
- Why rate 0.75 must stay on 0.6/1.1: after 3.0 s of the take Jade's head has come round far enough to show a small
  profile, and the video model drew it without glasses. What is visible in the film ends at 2.98 s of the take (the
  last 0.45 s of that under 50–100% indigo), where only her ear and the edge of her cheek show.
- `node tools/lint_shots.mjs`: OK (124 shots). `docs/script.md` rows 0.5 and 0.6 rewritten.

## 5. Test render and what I looked at

`render/out/rev3_open/open_9.6-18.0_540p.mp4` (frames 231–431 in `render/out/rev3_open/frames/`, half scale, 2
workers; the cut in from 0:08 and the whole of 0:16–0:18 included). The first pass logged 35 failed frames while the
machine's load average was 50 (other agents rendering); I threw the folder away and rendered again from clean: 201
frames, no failures. No `--resume` frames are in the folder.

- Cut in (frames 240–244) and cut to the terrace (313–316): no frozen first frame on either side; amber Moon low at
  the left gives way to the paler Moon higher up, same size.
- 0:10, frames 243–314: Moon whole for the whole shot at about x 154, y 137 (1920 scale), right edge 64 px left of
  the card's first letter, also at frame 311 when the card is fading. Every frame 255–282 of a street crop
  (`check/0.5_street_every_frame.jpg`): walkers step on twos, the porters' pole stays one pole. Frame difference per
  region (street, lanterns, Moon): no spike, no frozen frame.
- 0:13–0:17, frames 315–376 and on: every frame 327–356 of the figures (`check/0.6_figures_every_frame.jpg`): Jade's
  leg comes forward smoothly, M's arms wobble, nothing pops. River every tenth frame (`check/0.6_river_every_10th.jpg`):
  barge, ferry and sightseeing boat each advance steadily, lights and reflections intact. Frame difference (Jade, M,
  river): no spike, no frozen frame.
- 1080p stills at 11.5 s and 14.6 s (`stills/hdB_*.png`) looked at 1:1.

## 6. What still falls short, or that someone should know

1. Nobody has watched this at speed with sound. Everything above is from frames, strips and frame differences.
2. **The rooftop picture is a different composition now.** A broad pale street runs through the "thousand roofs",
   which loosens the strict woven rhythm the first painting had. It is what makes the people read as moving; without
   it they only fidget. It is Jade's call (see below). The no-street alternative exists (`K_0.5/take_3` with
   `media/keyframes/work/K_0.5_rev3_final.jpg`) but was judged not to answer her note.
3. A few more sky lanterns rise during the shot than the painting starts with (eight or so by the end against five).
   Plausible for a festival, but not asked for.
4. The rooftop take is 720p; at 1080p the walkers are soft, a few brush touches each. That suits the painting, but it
   has only been looked at in two stills, not in motion at full size.
5. Jade's glasses: she is seen from behind, so none show. If anyone later lengthens 0.6/1.1 or sets the rate to 1,
   her profile without glasses comes into view (take time 3.0 s onward).
6. The terrace shot now ends tighter (zoom 1.25 against 1.18) and lower: the tip of the Shanghai Tower leaves the top
   of the frame in the last half second, already under the indigo wash.
7. Boat sizes were judged by eye against the reference photographs, not measured. The near barge is large in frame
   (about a quarter of the width); it is the nearest vessel, but it is the one a river pilot might question.
8. 1.1's ink Moon still arrives on a single frame (377), as in v5. Not mine and not in Jade's notes; mentioned because
   the cut is now cleaner around it and it shows more.
9. `tools/vgen.py` still holds the old prompts for `K_0.5` and `K_0.6` (shared source, left alone): order further
   takes with `tools/vgen_rev3_open.py`.

## 7. Spend

Video: 6 takes, $4.18 (est.) of the $10 I was given: h3 2K 2 x $0.65, h3 768P $0.48, Seedance 2.0 720p 2 x $0.75 and
$0.90. Images: 3 x nano-banana-pro, about $0.40. No codex jobs.

## 8. For the other owners

- **TYPE:** nothing has to move. The rooftop Moon occupies x 78–236, y 58–216 of the 1920x1080 frame for the whole
  shot; the card starts at x 300. If the card is ever re-set, keep its left edge at x 290 or more. I did not touch
  any card, calli or lyric line.
- **Coordinator:** the 1.1 block of `01_intro_b.js` and `K06_END` in `00_intro.js` changed together; a full render
  will pick both up. `media/gen/picks.json` has two changed entries. `docs/production_tracker.md` is not regenerated.

## For Jade

- **0:10 (the rooftops and the Li Bai card).** There never was a version with people moving: the only take ever made
  told the figures to stay put, and what moved in earlier cuts was mist and the camera. Now a lantern-lit festival
  street runs through the roofs and its crowd walks along it with hand lanterns, sky lanterns drift up over the lake,
  and the Moon is whole, lower (just above the hills) and amber-gold.
  Frame: `render/out/rev3_open/rep_0m10_rooftops.jpg` (before: `before_0m10_v5.jpg`).
  Clip: `render/out/rev3_open/open_9.6-18.0_540p.mp4`.
  **Your choice:** the street is new to the picture; it is there so people have somewhere to walk. Keep it, or go
  back to unbroken rooftops with people who only turn and gesture in their courtyards?
- **0:13–0:17 (the terrace over the Huangpu).** You now settle from a crouch onto one knee, breathe, and turn your
  head a little toward M, whose raised arms wobble; the river carries what the photographs of that reach show: a
  tarpaulined cargo barge and a coal barge heading one way, the cross-river ferry and a three-deck sightseeing boat
  outlined in coloured light heading the other, and one of the light-strung mock sailing ships, all gliding with
  wakes and reflections. The Moon is whole at the start and the camera tilts down from it to the two of you.
  Frame: `render/out/rev3_open/rep_0m14_terrace.jpg` (before: `before_0m14_v5.jpg`).
  Reference photographs: `media/ref/rev3_open/` (sources in `SOURCES.md`).
  No choice needed, unless the boats look wrong to someone who knows the river.
