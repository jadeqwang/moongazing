# Rev 4 — ENV (the envelope passage, 0:57.8–1:01.6; shots 3.5a / 3.5b / 3.5c) — Oct 8 2026, night

Owner: the ENV agent of round four (`docs/REVISION_NOTES_OCT8.md`, "Round four"). Test renders: `render/out/rev4_env/`
(half scale). Working pictures: `media/keyframes/work/rev4_env/` (never committed).

## What she asked (verbatim)
Ticked "Seal the flap with a small pale-blue-dot sticker". "also make the words stick to the envelope better, and when
the letter emerges from the envelope, it's a folded trifold, and then she has to open it. do the image models not know
how this works? I'd like to not have to film it, but I can offer to if you and the other computers literally can't
figure it out." Chat: "0:59, yes fix the envelope glitch".

## Status
**Wired, rendered and on the page; the owner's own review was cut short.** The ENV agent was stopped (Oct 8, about
23:50) before it wrote sections 4 onward, so this status and the "For Jade" section were written by the main session
from what was on disk. What is true:
- `03_verse2.js` wires two takes over the three old shots (the lists `AB35` and `C35` and their comment say which of
  each take's drawings play): **3.5a** is `K_3.5_front/take_6`, one continuous action from Kenton's hand letting go,
  through the turn, to the sealed back; **3.5c** is `K_3.5_letter/take_7`, the packet coming out and the Z-fold
  opening. Both are prepped (`media/gen/K_3.5_{front,letter}/roto/`); `media/gen/picks.json` carries the takes, the
  rejected takes with reasons, and the re-run commands (`tools/paper_quad.py` for the type on the envelope's front).
- Frames **1389–1479** differ from v6. They were rendered twice and compared (`render/out/v7_ranges.sh 1384-1486`,
  unresolved=0) and are byte-identical to the agent's own test render (`render/out/rev4_env/frames/`, clip
  `render/out/rev4_env/envelope.mp4`).
- Looked at by the agent as consecutive frames: the type on the envelope 1389–1413 and the turn and seal 1409–1436
  (`render/out/rev4_env/strips/`). Looked at by the main session: every fourth frame 1389–1477. **Not looked at
  frame by frame: the unfolding, 1437–1479.**
- Unjudged leftovers: `K_3.5_letter/take_8` (downloaded) and `take_9` (submitted 04:44 UTC, never downloaded; its
  job id is in `take_9.json`) were further tries at the unfolding. Video spend on this passage: 5.70 of 8 USD.

## 1. What the v6 frames show (rule 2: find it first)

Looked at: `frames_v6_540/f_001386…001482` every third frame; `f_001389…001422` as an enlarged strip of the type
against the envelope's top-left corner; `f_001419…001436` every frame across the cut; and measured every frame
1389–1431 (the envelope's outline against the big line of type).

1. **The words slide on the envelope for the first 0.6 s (1389–1403).** Measured in the envelope's own coordinates,
   the line MISSION ASSIGNMENT moves 2.6 % of the envelope's height and 1.8 % of its width, and the envelope turns
   1.1° under it (−4.2° → −3.1°): 12–14 px at full size. Cause: `paper_track.py … --static 56` gives the type ONE
   rectangle, the median of the take's first 56 frames, but in take frames 12–26 (exactly the start of the shot)
   Kenton's hand is still letting go and the envelope slides and settles by 19 take px. The type stays where the
   envelope ends up; the paper moves underneath it. From 1404 on it is steady.
2. **The cut at 0:59 (1423 → 1424)** goes from the envelope lying flat with her left hand just arriving to the
   envelope already lifted, turned 15° and 1.25x larger, both hands regripped: 1.7 s of the same take is skipped, on
   the same camera axis with a small change of size. It is a jump cut inside one action.
3. **The back (1440–1446)** arrives with the flap already open and no seal; the flap is the deep pointed flap of a
   greeting-card envelope.
4. **The letter (1449–1479)** is a sheet half out of the envelope that is already unfolded except for one fold at the
   bottom: the keyframes themselves (`K_3.5_letter_v1`, `K_3.5_letter_end_v1`) were painted that way, so the video
   model was never asked for a trifold. No packet, no unfolding.
5. **Sizes.** The envelope's proportions are 1 : 0.594 (a card envelope) and it changes size against her hands from
   shot to shot (2.0 hand lengths wide in 3.5a/b, about 2.6 in 3.5c). A letter folded in three goes in a US #10
   (241 x 105 mm, 1 : 0.436, 1.4 hand lengths).

## 2. References (round-three rule 1)
`media/ref/rev4_env/` (7 photographs, sources and licences in `SOURCES.md`; found by a search helper, looked at by
me). What they showed, and what I took from them:
- an unfolded trifold never lies flat: its two creases stay as soft ridges, and it is held by its side edges, thumbs
  on the printed face (01);
- the print is inside the fold: the closed packet is blank paper (01);
- a sheet leaves a long envelope through the long edge, pinched at its far edge, thumb on top and forefinger under,
  while the other hand pins the envelope flat with spread fingertips (02, 06);
- a business envelope's flap is shallow (a quarter to a third of the envelope's height) and hinged on the whole long
  edge; opened, a narrow band of the inside shows below the fold (03, 04). The two photographs show the European
  straight flap; the US #10 "commercial" flap is the same depth with a gently curved edge and diagonal side seams,
  which is what is painted;
- a #10 held by its ends leaves about a hand's width of envelope between the hands (05).
Not found: a closed trifold packet beside its envelope, a half-open letter, a round sticker on a business flap.

## 3. Design

**A measured paper blockout** (`render/scenes/blockouts/3.5/blockout.py`, Python, straight-down camera at 1 m; guides
in `media/keyframes/work/rev4_env/guide/`, `sheet.jpg`): US #10 envelope 241 x 105 mm with a 40 mm commercial flap
hinged on the far edge and a 12 mm throat; a 25 mm round sticker across the flap's lip; a US Letter sheet folded in
three (packet 216 x 93 mm; top panel hinged on the far crease, bottom panel on the near crease, print inside only);
her hand 175 mm, his 195 mm. Two framings of one desk: 520 mm wide for the front and the turn, 760 mm wide for the
letter (the open page is 279 mm tall and needs the room). Every keyframe is painted over one of its views.

(continued below as the work is done)

## For Jade
- **0:58, the words on the envelope.** They slid for the first half second because they were pinned to where the
  envelope came to rest while it was still settling out of Kenton's hand. They are now tracked to the envelope's four
  corners in every frame, through the tilt. Frames 1389–1413.
- **0:59, the jump.** The old cut skipped 1.7 seconds inside one movement. Handing over, turning and landing on the
  sealed back is now one continuous take. Frames 1409–1436.
- **The seal.** A pale-blue-dot sticker holds the flap of a true-size business envelope. Frame 1425.
- **1:00, the letter.** After the cut the flap is open; a packet folded in three comes out toward you and you open
  it, top panel up, bottom panel down, with print showing only when it is open. Frames 1437–1479; 1449 and 1473.
- **What falls short.** Breaking the seal is not shown (the cut goes from the sealed back to the lifted flap, the
  sticker left on the envelope's body). The envelope is true size, so it and its words are smaller in frame. The
  unfolding was checked only on every fourth frame.
- Clip: `render/out/rev4_env/envelope.mp4` (0:57–1:02, with the song).
