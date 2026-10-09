# Rev 4 — ENV (the envelope passage, 0:57.8–1:01.6; shots 3.5a / 3.5b / 3.5c) — Oct 8 2026, night

Owner: the ENV agent of round four (`docs/REVISION_NOTES_OCT8.md`, "Round four"). Test renders: `render/out/rev4_env/`
(half scale). Working pictures: `media/keyframes/work/rev4_env/` (never committed).

## What she asked (verbatim)
Ticked "Seal the flap with a small pale-blue-dot sticker". "also make the words stick to the envelope better, and when
the letter emerges from the envelope, it's a folded trifold, and then she has to open it. do the image models not know
how this works? I'd like to not have to film it, but I can offer to if you and the other computers literally can't
figure it out." Chat: "0:59, yes fix the envelope glitch".

## Status
WORK IN PROGRESS (this line is replaced when the passage is wired and rendered). Until then the film's section file
still holds the v6 wiring, but the keyframes `K_3.5_front`, `K_3.5_back`, `K_3.5_letter`, `K_3.5_letter_end` have
already been replaced (old ones kept as `_v2` / `_v1`), so the v6 picks for 3.5 no longer apply.

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
(being written; nothing has changed in the film yet)
