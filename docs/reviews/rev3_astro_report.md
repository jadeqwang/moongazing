# rev3_astro — the walkout, the plume, astronaut legs (Oct 8 2026, round three)

Owner: ASTRO. Brief: `docs/REVISION_NOTES_OCT8.md`. Test renders: `render/out/rev3_astro/` (half scale, 2 workers).
Nothing is committed. Judged from frames, consecutive-frame strips and frame-difference numbers; **not watched at speed**.

Status: 1.4a DONE and wired · 4.1 DONE · 5.1 DONE and wired · 5.4 DONE (same take, redraw fixed) · sweep done (section 4).
Clips with sound: `render/out/rev3_astro/walkout_0m23.mp4`, `plume_1m17.mp4`, `lope_1m41.mp4`, `ridge_1m50.mp4`.

---

## 1. Shot 1.4a, 0:23 (22.75–24.07 s) — the walkout

### What she asked
"good walking, but maybe they don't need to be all in sync, which reads as unnatural. also, what are the suitcases
they're holding? what do you see when you do image searches for astronauts walking towards launch? please use realistic
images for reference", and about 1:12: "I really like the cinematics of this shot. Let's make the one from 0:23 as good
as this one".

### What the v5 frames showed (546–577)
Four crew framed from the thighs up, walking to the RIGHT with the rocket behind their backs at the left edge: they
walk away from where they are going. All four legs swing together. Each carries a white case the size of a small
suitcase, and from each belly a hose hangs in a long loose loop to the case.

### What the image search showed (references and URLs: `media/ref/rev3_astro/SOURCES.md`)
Eight photographs saved: Apollo 11 and Apollo 8 leaving the crew building, two Soyuz crews leaving Building 254 at
Baikonur (2013, 2018), the Shenzhou 19 send-off, the Artemis II launch-day walkout, SpaceX Crew-1, STS-135.
- Apollo and Soyuz crews each carry a **portable ventilator** in the LEFT hand. Soyuz: a grey louvred metal unit about
  35 × 20 × 20 cm (a lunch box or small toolbox), ONE corrugated hose in a short arc from the unit to a fitting low on
  the left of the abdomen. Apollo: a white case, two hoses to the chest. The right hand is free and usually waves.
- Shuttle, Crew Dragon, Artemis II and recent Shenzhou crews carry nothing; unused hoses are short and capped.
- Nobody is in step in any of them: every pair of legs is at a different point of the stride, gaps are uneven, one
  person waves, another looks aside.

### The answer to "what are the suitcases?"
They are portable ventilators. A sealed launch suit has no air of its own until it is plugged into the spacecraft, so
Apollo crews and every Soyuz crew carry a small fan-and-battery unit that blows cooling air through the suit on the way
to the pad; its hose plugs into the suit at the belly. Our suit is of that family (the bible gives it "a hose connector
on the torso"), so the crew keeps the unit, but it is now drawn at its real size (a lunch box, not a suitcase), in the
left hand, with one short hose plugged in at both ends; crews in suits that need no cooling on the ground (Shuttle,
Crew Dragon, Artemis) carry nothing.

### What makes 1:12 (3.8b) work, named before designing
1. **Depth.** A low camera on the ground and whole figures at four distances with their boots on the apron; the eye
   travels into the picture.
2. **Light.** One warm source, the floodlit rocket, in a field of indigo, and a wet apron that mirrors it, so the
   ground itself is lit and every figure has a reflection.
3. **Destination.** The rocket is in the frame and they are walking to it. Plus one human gesture (the raised arm).

The old 1.4a had none of the three: cropped at the thighs, no ground, the rocket behind them.

### The new shot: the counterpart of 1:12, from the front
Same place, same light, the opposite side: a low camera ahead of the crew, who come toward us and to the left, toward
the floodlit rocket small on the horizon at the left. Whole figures on the wet apron with reflections, four sizes in
depth. Adaeze leads, eyes on the rocket; Anastasia finishes a small wave to someone beside the camera and lowers her
hand; Arjun looks up at the sky; Lúcia, last, looks at the ground ahead. Four different stride phases in the painting,
four different rhythms in the take.

- **Blockout:** `render/scenes/blockouts/scenes.js` scene `K_1.4a` (four mannequins at true heights, ventilation units
  as 35 cm boxes in the left hands, the rocket at 1/8 scale and distance); views in `render/scenes/blockouts/K_1.4a/`
  (`hero.png` went to the image model).
- **Keyframe:** `media/keyframes/K_1.4a.jpg` (v5 + real emblems). `K_1.4a_v5.jpg` = the new painting before the emblem
  tool (its `_orig`); `K_1.4a_v4.jpg` = the previous keyframe. Made with `google/nano-banana-pro` in seven steps
  (`media/keyframes/work/rev3_astro/`: `PROMPT_1.4a*.txt`, `EDIT_1.4a_6.txt`, `K_1.4a_nbp_1…7.jpg`): inputs were the
  blockout view, a board of the four people cut from our own earlier painting (`board_crew_2.jpg`) and the 2013 Soyuz
  photograph (`ref_soyuz_crop.jpg`) for the unit and hose. Step 7 edited the chosen picture: chest patches moved to the
  wearer's left, units made smaller, hoses shortened to one arc, Anastasia's legs put at the opposite stride phase.
  A few stray marks at the lower right were inpainted by hand.
- **Checked in the keyframe at full size:** exactly four people; two arms, two legs, two hands each; blue gloves on all
  hands; one unit (left hand) and one hose each, plugged in at both ends; soft helmets thrown back, hair in low buns
  inside the collars (Anastasia, Lúcia), nothing across a neck ring; patch on the wearer's left chest; no red; no text.
- **Emblems:** `tools/emblem_patch.json` entry `K_1.4a` now points at take_7 and `K_1.4a_v5.jpg`; the four plain discs
  the image model drew are replaced by the real roundel and carried on the take (the leader's disc was given by hand:
  the tool's search had locked onto a larger blob).
- **Takes** (prompt in `media/keyframes/work/rev3_astro/vsub.py`; out of step, weight in the gait, boots planted):

  | Take | Model | Verdict | Looked at |
  |---|---|---|---|
  | `K_1.4a/take_7` | h3 768P 5 s, $0.40 | **PICK.** Every frame 9–48: all four gain ground toward us; four rhythms; each boot plants and stays; no leg passes through another; the wave ends by f30. Fault: Adaeze's hose doubles into two from f33, so the shot uses f2–f33 only | strips of consecutive frames, the leader's legs, the followers' legs and the leader's hose enlarged |
  | `K_1.4a/take_8` | h3 768P 5 s, $0.40 | alternate: same walk, but Adaeze's hose grows into a long S and then two from f22 | same |

  A Seedance 2.0 submission was refused before sending (prompt over its 2,000-character limit; no charge).
- **Wiring:** `render/src/sections/01_intro_b.js`, the 1.4a block only: `K_1.4a/take_7`, `offset: 2 / 24`, rate 1 (clip
  0.083–1.42 s), framing `from {0.49, 0.52, zoom 1.06}` to `{0.478, 0.525, zoom 1.11}` (the whole figures and the
  rocket), the breath opening shortened from 0.6 to 0.45 s so the picture reads for more of its 1.32 s. Flat redraw as
  before (`paper: 'silk'`, `lineA: 0`). `media/gen/picks.json` updated. Lint OK.
- **Why the offset is below the usual 0.5 s:** this take is 12 drawings a second (each frame doubled; measured) and
  the walk is at full stride from its first drawing (frame-difference 13.5 from f2, the same as mid-take), so there is
  no dead start to skip; and the first five frames are under the breath opening. My first wiring used 0.5 s at rate
  0.78 to stay clear of the doubled hose: that gave drawings held for two and three frames in turn, the same stutter
  found in 5.1 (section 3), so it was replaced. After: a new drawing every second frame, 552–577, no exception.

### Frames looked at (`render/out/rev3_astro/f14/`, 22.5–25.3 s)
545 (last of 1.3), 546–553 (the opening), every frame 546–577 as a strip, 552 / 562 / 570 / 577 at full size, 578–579
(first of 1.4b). In step: nobody. Legs: no pop, no crossing, no slide in any frame. The roundels sit on all four chests
in every frame. Representative frame: `render/out/rev3_astro/f14/f_000562.jpg`.

### What still falls short
- The units are much smaller than before but still a little larger than the real Soyuz unit, and the hoses, while
  plugged in at both ends, are longer than the real short arc (Anastasia's makes a loop).
- The new painting is more softly modelled than its neighbour 1.4b (flat fills, fine line). The flat redraw narrows the
  gap, but side by side at the cut 577 → 578 the two are not the same hand.
- The rocket follows the old 1.4a painting (four strap-on boosters); 4.1's rocket has two. It was so before; it is
  larger in the frame now. Worth a look by whoever owns launch-vehicle continuity.
- The take's last usable drawing is two frames before the hose doubles; the cut cannot move later without a new take.
- The first five frames are under the warm breath opening, as before.

---

## 2. Shot 4.1, 1:17 (76.11–78.96 s) — the plume

### What she asked
"animate the rest of the plume too so it's not weird".

### What the v5 frames showed (1827–1895)
The shot is drawn live by the `LIFT` shader at the top of `render/src/sections/04_hook.js` from the one painting
`K_4.1`: the camera tracks the rocket and the world falls away. In v5:
- the painted ground cloud and its spatter were a still picture sliding down the frame: nothing in it moved;
- the exhaust under the rocket was a narrow strip of the painted column stretched from the nozzles to the pad with
  noise scrolled over it: a streak that only got longer and paler;
- the flame was one small tongue;
- frame-difference check, share of pixels changing between consecutive frames: the cloud region fell from 25% to 1%
  over the shot and the trail from 10% to 2% (it died away), the spatter never above 3%.

### What changed (the shader only; the 4.1 call passes `live: true`)
Everything is a function of song time and seeded noise; no clock, no `Math.random`. Shot 4.4 uses the same shader and
keeps the old path (`uLt < 0`): its frames differ from v5 only inside the lyric's rectangle (the TYPE owner's work).
1. **The trail** is anchored to the world, not to the rocket, so it lengthens as the rocket climbs. Its age at each
   height is the time since the nozzles passed that height: it widens and drifts as it ages, each edge billows in
   round lobes like the painted cloud's, fast streaks run down it only while it is young, and it thins. Its pigment is
   sampled from the painted column, so the two are one column.
2. **The ground cloud** keeps spreading: the painted splash (cloud, column foot and flying spatter together) is slowly
   enlarged about a point on the ruled horizon, a little faster above it, so the cloud rolls outward and up while the
   ruled horizon line only slides along itself; inside the pigment a slow two-scale flow turns the wash over. It thins
   through the shot. The tower, the horizon and the palms are outside the moving zone and stay ruled.
3. **The flames:** three tongues, one per engine cluster, each with its own length flicker and a travelling ripple;
   matte gold and ember, no glow.
4. **Light flicker:** one flicker signal drives the flame brightness, the young trail under it and the cloud near the
   pad.

### Frames looked at (`render/out/rev3_astro/f41/`, 75.9–79.2 s)
1826 (last of 3.8f), 1827–1830 (the ink flash, as before), a sheet across the shot, every frame 1850–1881 as a strip,
full-resolution stills at 76.6 / 77.4 / 78.6 s (`render/out/rev3_astro/stills/p41c_*.png`), 1896 (first of 4.2).
Frame-difference after, same regions of the screen: under the rocket 8–17% for the whole shot, 10% in the last frames
(v5 died away to 2%); the ground cloud 25–30% from the first frames (v5 started at 6%), after which both fall in step
as the cloud leaves the bottom of the frame; the empty sky 0.0% (nothing leaks). Frames rendered alone
are byte-identical to the same frames rendered in sequence (1860–1865). Lint OK.
Representative frame: `render/out/rev3_astro/f41/f_001870.jpg`.

### What still falls short
- The trail is a procedural wash: close to the painted column in colour and edge, but it is not brushwork, and where
  the two meet (just above the pad) the join is a soft blend.
- The procedural outer cloud I tried first (lobes growing beyond the painted splash) read as a fuzzy halo and was taken
  out: the cloud now grows only by the painting's own enlargement (about 1.5× by the end), so it does not flood the
  frame as a real launch would.
- 月 缺 and the English gloss sit where they did; I did not touch type lines.

---

## 3. "Glitchy astronaut legs": 5.1 and 5.4

### Shot 5.1, 1:41 (101.33–104.92 s) — three loping across the surface

**What the v5 frames showed (2432–2518, every frame).** Two faults.
1. *The take (`K_5.1/take_2`).* The three do not travel. The middle astronaut's legs swap fore and aft every 8–10
   frames in quick small steps while the body stays over the same patch of ground, so the boots slide back under
   him (a treadmill); the nearest hops on the spot with her knees tucked for 15 frames (2481–2495) and comes down
   where she left.
2. *The retiming.* The shot played that take at rate 1.14, and the redraw is on twos (a new drawing every second
   frame). At 1.14 the two do not divide evenly, so about every seventh drawing was held for one frame instead of two.
   Measured in the v5 frames: the change between consecutive frames goes 8, 0, 8, 0, 8, **8**, 0 … with two changes in
   a row at 2441–2442, 2447–2448 and ten more times. The legs stutter about three times a second. This is the
   "glitch" that is in the film rather than in the take.

**Reference.** Apollo 16 and 17 surface film: the lope is slow; a stride takes about a second with both boots off the
ground for much of it; a planted boot stays where it landed; the astronaut covers a body-length a stride.

**What changed.** A new take with that written into the prompt (`media/keyframes/work/rev3_astro/vsub.py`, `K_5.1`).

| Take | Model | Verdict |
|---|---|---|
| `K_5.1/take_5` | h3 768P 6 s, $0.48 | **PICK.** Every frame f14–f112 (nearest) and f36–f83 (the two behind): she comes down slowly from the hop and lands at f36, then long slow strides, each boot planted until it lifts; all three travel left (the nearest by roughly an eighth of the frame width over the shot, read off the sheets) and leave prints; no quick shuffle, no leg through the other; shadows slide with them and part from the boots only in flight; small dust arcs |
| `K_5.1/take_6` | Seedance 2.0 720p 6 s, $0.90 | alternate: the calmest legs (true 24 fps, no pops in the frame-difference check), boots planted, but a slow walk rather than a lope and little travel |
| `K_5.1/take_4` | h3 768P 6 s, $0.48 | not used: clean legs but almost on the spot, like take_2 |

Wired in `render/src/sections/05_interlude.js`, the 5.1 scene line only: `K_5.1/take_5`, `offset: 14 / 24`, **rate 1**
(no `rate`). This take happens to be 12 drawings a second already (each frame doubled; measured), so the redraw on
twos lands exactly on its drawings. Roto prep with the defaults; the three emblem
patches re-applied (`tools/emblem_patch.json` `K_5.1` → take_5); `picks.json` updated. Lint OK.

**Frames looked at** (`render/out/rev3_astro/f51/`, 101.1–105.1 s): 2431–2434 (the cut in), a sheet across the shot,
every drawing 2450–2512 as a strip, 2518–2519 (the cut out). Frame-difference after: 10, 0, 10, 0 … for the whole shot,
no doubled step anywhere. Representative frame: `render/out/rev3_astro/f51/f_002464.jpg`.

**What still falls short.** The gait is slow strides with one hop at the start, not a continuous Apollo lope with a
flight phase in every stride. The far astronaut is small and I judged her from 240-px crops. Rule for anyone retiming
a walking take: the redraw is on twos, so a rate that is not 1 (or 0.5, 2) gives uneven holds; check with a
frame-difference list (`pops.py` in the scratch folder does it).

### Shot 5.4, 1:50 (109.50–111.95 s) — the lone figure on the ridge

**What she said.** "glitchy legs on astronaut".

**What the v5 frames showed (2628–2686, every frame, legs enlarged).** From 2632 the shins dissolve into vertical
streaks above boots that stay crisp, and the streaks grow through the shot; by 2660 the lower legs are a smear standing
on two painted boots, and the knees drift sideways over them. That is the "feet apart, then together" seen in the
sheet.

**Cause: the redraw, not the take.** Beside the same moments of the raw take (`K_5.4/take_4`) the legs are whole and
the boots do not move (measured: each boot's position holds within 1 px over the 60 frames used). The roto's motion
mask is built from what moves; her boots never move, so the mask ended at the shins and the renderer blended the
redrawn, shifting legs into the static painted legs half-way down.

**What changed.**
- `media/keyframes/work/rev3_astro/mask_whole_subject.py K_5.4/take_4`: the take's `mask.png` is widened by the union
  of its per-drawing subject mattes, so the whole figure, boots included, is redrawn from the take (the first mask is
  kept as `mask_prep.png`). **Re-run it after any `roto_prep.py` re-run on this take.**
- `render/src/sections/05_interlude.js`, the 5.4 scene line: `subject: false, maskGain: 8` added (redraw the whole
  figure, as 5.1 does). Framing, timing, the Earth: unchanged. Lint OK.
- Two new takes with a planted-boots prompt (Seedance 2.0) were made and not used: `take_6` does not move at all for
  2 s and is drawn on fours; `take_7` pivots on a sliding boot. Verdicts in their sidecars.

**Frames looked at** (`render/out/rev3_astro/f54/`, 109.3–112.1 s): 2627–2629 (cut in), every second frame 2628–2686
with the legs enlarged, 2640 / 2655 / 2670 wide, 2686–2687 (cut out). Legs whole from hip to boot in every frame; both
boots stay where they are; the knees ease to the left with the weight shift; the shadow stays on the boots.
Representative frame: `render/out/rev3_astro/f54/f_002660.jpg`.

**What still falls short.** The take itself moves in small steps (the figure changes every three to five frames, not
evenly). With the legs whole it reads as a slow sway, but it is not perfectly fluid. A cleaner take would need another
round; neither of the two I ordered beat this one.

---

## 4. Sweep: every other suited shot with visible legs

Looked at every frame (or every drawing, on twos) of each shot with the legs enlarged, plus a frame-difference list
for pops. v5 frames unless noted. Three classes of fault were looked for: legs through each other or a pop; a boot that
slides; the redraw breaking at the boots (the 5.4 fault); and uneven holds from a retimed take (the 5.1 fault).

| Shot | v5 time | Frames | What the legs do | Verdict |
|---|---|---|---|---|
| 1.4b | 0:24 | 578–600 | four standing at the tower, cut at the thighs; they do not step | clean |
| 3.8b | 1:12 | 1730–1750 | the nearest walks away: left boot lifts and plants 1730–1735, right boot lifts 1744–1750; reflections follow; the three ahead are small | clean. This is the shot she likes; not touched |
| 3.8c | 1:13 | 1751–1772 | astronaut going feet-first through the hatch; legs inside the capsule, hardly seen | clean |
| 4.7 | 1:32 | 2213–2277 | Jade coasting, seen from behind to the thighs; legs still | clean (FACE owns the elbow) |
| 6.2a | 1:55 | 2774–2796 | Jade on the rim turns to the Earth: feet together to 2780, then the far boot goes back about a boot-length by 2786 | reads as the step of a turn; the boot is near the ground as it moves. Low. Not changed |
| 6.2c | 1:56 | 2797–2818 (current tree) | Adaeze kneeling; legs do not move | clean |
| 6.2d | 1:57 | 2819–2851 (current tree, with `FACE = false`) | Layla's last step: the front boot stays planted, the rear boot comes forward and she stands | clean legs. With `FACE = false` the take plays at rate 0.66, so drawings are held three frames (sometimes four): slightly more stepped than its neighbours. Section 06 (TYPE owns the switch): not changed |
| 6.3 | 1:58 | 2852–2874 | Jade standing as the camera pulls away | clean |
| 7.B1 | 2:13 | 3204–3223 | Arjun kneeling at the drill; legs do not move | clean |
| 7.B4 | 2:18 | 3331–3372 | Kenji beside the rover, about 40 px tall | nothing wrong that can be seen at this size |
| 7.B5 | 2:20 | 3373–3441 | legs only: lands on both boots 3383–3393, pushes off 3395, floats out to the upper right by 3427; the shadow travels right with her and the frame holds on the prints | clean; legs never cross through each other |

**Retimed walking takes elsewhere (the 5.1 class), for their owners.** The redraw is on twos; a rate other than 1
gives uneven holds. Checked in v5 by frame difference: 2.2 (`rate: 0.9`, 0:35) holds drawings for 2, 2, 2, 3 frames;
0.3 and 0.6/1.1 (`rate: 0.75`) for 2 and 3 in turn. Nobody walks in those shots, so it is far less visible than in
5.1, but 2.1/2.2 is where she noted "something about the camera movement is jerky" (TYPE). Not mine to change.

---

## Spend
Video (list price, `media/gen/spend.jsonl`): 1.4a 2 × h3 $0.80 · 5.1 2 × h3 + 1 × Seedance 2.0 $1.86 · 5.4 2 × Seedance 2.0
$1.50 = **$4.16** of the $10. Images: 7 × nano-banana-pro, about $0.94. No codex jobs.

## Files changed
- `render/src/sections/01_intro_b.js` (1.4a block) · `04_hook.js` (the `LIFT` shader, `lift()`, the 4.1 call) ·
  `05_interlude.js` (5.1 scene lines, 5.4 scene line)
- `render/scenes/blockouts/scenes.js` (scene `K_1.4a` appended) + `render/scenes/blockouts/K_1.4a/`
- `media/keyframes/K_1.4a.jpg`, `K_1.4a_v4.jpg`, `K_1.4a_v5.jpg`, `K_1.4a.txt`, `media/keyframes/work/rev3_astro/`
- `media/gen/K_1.4a/take_7,8`, `K_5.1/take_4,5,6`, `K_5.4/take_6,7` (+ roto folders for the two picks; K_5.4/take_4's
  `mask.png`), `media/gen/picks.json` (K_1.4a, K_5.1, K_5.4), `tools/emblem_patch.json` (K_1.4a, K_5.1)
- `media/ref/rev3_astro/` (8 photographs + `SOURCES.md`) · `docs/script.md` (rows 1.4a, 4.1, 5.1, 5.4)

## For the TYPE owner
- 4.1: the trail is now wider below the rocket; 月 缺 and "The moon wanes," still clear it (looked at 1850–1895).
- 1.4a has no type. The breath opening at its head is 0.45 s now (was 0.6).

---

## For Jade
- **0:23, the walkout.** A new picture and new movement: the four now come toward us across the wet apron toward the
  lit rocket (the front view of the 1:12 shot you liked), each walking at their own rhythm, one finishing a wave, one
  looking up. The "suitcases" were portable ventilators, which Apollo and Soyuz crews really do carry to cool the
  sealed suit until it is plugged into the spacecraft; they are now lunch-box size, in the left hand, with one hose
  plugged in at both ends, as in the Soyuz photographs.
  Frame: `render/out/rev3_astro/f14/f_000562.jpg` · clip `render/out/rev3_astro/walkout_0m23.mp4`.
  *Yours to choose:* keep the ventilators (true to Soyuz and Apollo) or have the crew carry nothing (true to Crew
  Dragon and Artemis); and whether this softer, more modelled painting sits well enough beside the flatter crew
  picture that follows at 0:24.
- **1:17, the launch.** The whole exhaust now moves for the whole shot: three flickering flames, a column of smoke
  that stays where it was left and lengthens, widens and thins as the rocket climbs, and the ground cloud keeps
  spreading and rolling. Frame: `render/out/rev3_astro/f41/f_001870.jpg` · clip `plume_1m17.mp4`.
- **1:41, first steps.** New movement: slow, long strides with each boot planted, and the three actually cross the
  ground; the stutter (a retiming fault of ours) is gone. Frame: `render/out/rev3_astro/f51/f_002464.jpg` · clip
  `lope_1m41.mp4`.
- **1:50, alone on the ridge.** The legs were being half redrawn over painted boots, which smeared the shins; the
  whole figure is now drawn from the same movement and the boots stay put. Frame:
  `render/out/rev3_astro/f54/f_002660.jpg` · clip `ridge_1m50.mp4`.
- **Other suited shots.** Checked frame by frame (0:24, 1:12, 1:13, 1:32, 1:55–1:58, 2:13, 2:18, 2:20): no leg faults
  found; two small remarks for later are in section 4.

