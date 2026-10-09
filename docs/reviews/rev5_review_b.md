# Cut v8 review, second half (110.3 s to 215.19 s)

Oct 9. Look-and-report only: no source file, no git state and no tmux pane was touched. Nothing was rendered.
Scratch scripts and sheets: `/tmp/claude-1000/-home-jade-Documents-moongazing/fa6e1199-07da-48da-8bd8-b60cc99d3d94/scratchpad/review_b/`.

## Verdict

Nothing broken by the retime was found in this half. Every bar-based cut is on its beat, every literal time was
converted, the type lands on the sung syllables as it did in v7, the dance-game arrows arrive on the beat, the
inscription finishes before the fade, the picture is black on the last chord and the credits start clean. No popped
frame, wrong-shot frame, flicker or new frozen tail. What is left are four low-weight notes on the new ending and two
numbers-only notes; none of them is a fault a viewer would call a mistake.

Not done: the cut was not watched at speed with sound. All judgements of "does it read" are from stills, 4-per-second
sheets and consecutive-frame strips.

## What was looked at, and how closely

- **Every frame, numerically (frames 2640 to 5164):** frame-to-frame difference scan for dark frames, pops (a frame
  unlike both neighbours), frozen runs, and where each cut actually falls; the same statistics per shot against v7 at
  the mapped old time (mean and peak motion, still frames at the head and tail of each shot).
- **Every cut 110.28 to 204.19 s, on the cut sheets** (three frames each side).
- **Closely, on native or enlarged frames or consecutive-frame strips:**
  131.4 to 131.6 (ink cut into 7.B1, against v7), 140.4 to 141.3 (end of the running shot, against v7), 145.5 to 147.3
  (the TV screen, 23 enlarged crops), 173.4 to 175.4 (the toast's first cut, against v7), 190.9 to 196.3 (the reunion,
  16 frames), 196.3 to 204.2 (roof deck, tea cup, inscription, fade: 12 frames, the type strips for both columns and
  the English, and brightness numbers for every second frame of the fade), type strips for 乡 and "home".
- **On the motion sheets only (4 frames a second):** 110.3 to 121.0 apart from the cuts and type; the blueprint montage
  121.0 to 131.5; 133.2 to 138.5; 141.4 to 145.5; the crew montage 149.0 to 156.3; 156.3 to 173.4; 176.9 to 190.8 (the
  second group view, the cosmos pull-back, the capsule); the credits 204.2 to 215.2.
- **Numbers compared:** cuts against `analysis/v2/beatgrid.json`; type arrival (`render/out/type_reveal_check_v8.json`)
  against `analysis/v2/lyrics_timing.json`; subtitle cues against the same; every literal song time left in
  `07_drop.js`, `08_outro.js`, `09_credits.js`, `scenes/cosmos.js`; the vocal stem and the master around the accent
  times that carry cuts.
- **Not opened:** type strips 40 to 44 (举头望明月, its gloss, the 低头思故 column, "I think", "of"). Their arrivals were
  checked from the numeric report (no flags) and seen on the motion sheet.

## Findings, by how much a viewer would notice

### Confirmed on frames

**1. 3:18.1 to 3:24.2 (198.14 to 204.19 s), the inscription: it does finish before the fade, but the finished
inscription is held half as long as in v7. Low.**
- Seen: the second column's last character 时 is complete at about 202.0 to 202.3 (type strip
  `48_3m20.38_calli_z84b.jpg`; nominal end 200.34 + 2.0 = 202.34). The English is at full strength from 201.6 to 201.9
  (strip `49_3m21.17_card_e84.jpg`). The picture starts to dim at 203.39 (frame 4882 mean 62.6, 4884 59.8, 4890 38.3,
  4896 13.5, 4900 5.0).
- So the complete inscription stands 1.05 s at full brightness before the fade starts (v7: 2.04 s, second column done
  at +5.3 s, fade from +7.34 s). The two English lines (13 words, size 34) have about 1.5 to 1.8 s at full strength,
  much as in v7 (about 1.8 s).
- Also: the English now begins to appear at 201.14 while the second column is one third written (200.34 to 202.34), an
  overlap of 1.2 s; in v7 the overlap was 0.5 s. Frame 4830 (201.25) shows 天涯 mid-stroke and the English ghosting in
  beside it: two things arriving at once for about a second.
- v7: same layout, longer shot. This is the consequence of 8.4 going from 8.44 s to 6.05 s, not a conversion error.
- Sure of the numbers; whether 1.05 s is enough is a judgement call.
- Source: `render/src/sections/08_outro.js` lines 126 (fade, last 0.8 s) and 132 to 134 (`a + 0.3`, `a + 2.2`, `a + 3.0`).

**2. 3:23.0 to 3:24.2 (203.02 to 204.19 s): the short solo hum plays under the fade to dark. Low, a note.**
- Seen and measured: the hum is 203.02 to 204.15 (`lyrics_timing.json`, `deviations_from_lyrics_doc`); the fade runs
  203.39 to 204.19. In v7 the solo hum (201.6) opened the tea cup shot; the shot comment still says "8.4 — the solo hum".
- Not a fault of the conversion: the new recording puts the hum last. Reported so that it is a known choice.
- Source: `08_outro.js` line 120 (comment) and 126.

**3. 3:16.3 to 3:18.1 (196.33 to 198.14 s), the roof deck, one bar: it reads; it is not a blink. Low.**
- Seen (frames 4712, 4725, 4740, 4755): one plain composition, four backs on the sofa, the Moon top right, 44 frames
  with a slow push. The Moon holds its place across the cut to the tea cup (centre at 0.77 of the width, 0.08 of the
  height in frame 4755; 0.79, 0.10 in frame 4756), so the match cut works.
- The toy Earth and Moon on the parapet are about 35 px wide at 960 and will probably not register in 1.8 s; they are
  large beside the cup in the next shot, so nothing is lost.
- v7: the same shot at 2.73 s. Moderately sure (not seen at speed).

**4. 3:10.9 to 3:16.3 (190.85 to 196.31 s), the reunion on the new take: no fault found.**
- Seen (16 native frames, and the frame differences of all 131 frames): the take steps evenly on twos throughout; the
  one large jump (frame 4613, 192.208 s) is the torn halves meeting on bar 107 beat 4, as designed and as in v7; the
  torn band crosses floor, legs and Jade's back and never a face (frames 4581, 4596, 4610, 4612); the cut to the close
  at frame 4668 matches in pose (Kenton's arm round all three, T left of M, Jade's head at the right).
- Already known and not new: Kenton walks in with his head above the top of the frame from about 191.5 to 193.4 and is
  briefly in profile with glasses at 193.5 (`docs/reviews/rev4_home_report.md` lines 29, 50, 109). Jade chose this
  take on the card.
- Timing note: the outro humming now enters at 192.50, which is 1.65 s after the cut into the reunion (190.85) and
  0.3 s after the halves join (192.21). In v7 the hum entered 0.19 s before the cut. Nothing is keyed to it; the join
  and the hum now nearly coincide.

### Suspected from numbers only (not visible on frames)

**5. 2:50.6 (170.62 s), the cut 7.D3e to 7.D4 (crew faces to the dancer's bow).** The old accent (173.0, "bass-out
mini-lift") has no confirmed counterpart in the new recording: `time_map.json` marks it low confidence, "no unique
corresponding event, warped fallback". The cut sits 217 ms after bar 95 beat 2, on the off-beat eighth, exactly where
it sat in v7 (+220 ms), and the new master has an onset at 170.62 (low band 360 against about 240 either side), so
against the groove it will look as it did. I could not confirm that the bass drops out there in the new recording.
Probably invisible. Source: `07_drop.js` line 543 (`D4: 170.62`).

**6. Subtitles against the on-screen English, 1:50 to 2:01 (not a retime fault, timings are right).** The cue times
match the lyric onsets exactly (110.283, 113.860, end 120.78; inscription 198.44 and 200.36; dedication from 204.25).
The wording differs from what is drawn on screen: subtitles "I raise my head to gaze at the bright moon" and "I lower
my head and think of home."; on screen "I raise my head and gaze at the bright Moon," and "I think of home"
(`06_breakdown.js` lines 159, 102 to 115; `release/subs/moongazing.en.srt` cues 20, 21). Same before the retime as far
as the source shows.

## Checked and found in order

- **Cuts against beats, 110.3 s to the end.** All 53 bar-based cuts are within 5 ms of their beat. The eight off-grid
  cuts are the ones meant to follow something else, and each sits where the new recording puts that thing:
  110.28 (举 onset 110.283), 113.86 (低 onset 113.860), 117.05 (the sung 乡, below), 141.36 (the kick that ends the erhu
  phrase: low band 372 at 141.36 against 160 before), 156.28 and 162.25 (measured accents; the low-band pattern round
  156.28 follows the old one round 158.5 closely; the vocal swell starts at 162.2), 170.62 (note 5), 204.19 (last
  chord). Frames 3240 and 3870 show the old shot one frame longer than the table says (bar 75 is 135.003 s, bar 90 is
  161.255 s): correct, the cut is on the next frame.
- **Literal times.** No old-recording value is left in `07_drop.js`, `08_outro.js`, `09_credits.js` or `cosmos.js`.
- **The sung 乡 (1:57.05).** The character and "home" arrive at 117.05; the syllable's energy starts at 116.56 and
  settles on its held A4 at 117.05 after a turn through B4 (vocal stem, pitch track). In the first recording the same
  three points were 118.31, 118.8, 118.8: the same 0.49 s relation. Same as v7.
- **Type against the sung onsets, 1:50 to 2:01.** 举 is there at the cut (110.28); 头 望 明 月 open 0.05 s before their
  onsets (110.90, 111.61, 112.27, 112.93 against 110.954, 111.657, 112.320, 112.982); 低 at 113.86; 头 思 故 at 114.43,
  115.09, 115.84 against 114.481, 115.143, 115.885; "I think" 115.02, "of" 115.77, "home" 117.05. Nothing more than
  0.06 s off, nothing straddling a cut, no flags in the numeric report. 乡 is gone at 120.79, before the cut at 120.96.
- **Action timed to the track.** 6.1: the flashlight is on the toy Moon 2.70 s into the shot = 月 at 112.98 (v7: 2.71 s);
  seen lit from the 113.0 frame. Dance game (2:25.5 to 2:27.3): the down arrow reaches the target row and the row
  flashes on frame 3503 (bar 81 beat 2, +1 ms), the right arrow on frame 3524 (beat 4, +1 ms), nothing on beat 3, the
  combo counts 42, 43, 44; the mat lights on frames 3493, 3503, 3524 (atlas meta `light`). The toast (2:53.5 to 2:58.7):
  group, Adaeze, group, one bar each, cut on bars 97, 98, 99, 100; cups are up from the first frame as in v7; the second
  group view picks up at the framing the first ended on.
- **Shot heads and tails.** Per-shot motion statistics equal v7's within noise for every shot from 6.1 to 7.D4 and
  8.1 to 8.3 (same takes, same offsets); no shot gained a held last frame. The only still tails are v7's own: the
  lights shot (2 frames), the cosmos holds 182.9 to 183.8 and 185.4 to 187.3, and the black first 0.6 s of 8.1.
- **Motion faults.** None. The black frame plus ink-spread frame at 131.50, 141.38 and 145.54 are the ink transitions,
  present at the mapped frames of v7 (compared side by side at 131.5). The pale veil on the first four frames of 7.D1
  and 7.E1 and the dissolve at 120.0 to 120.6 are in v7 too. The runner in 7.B5 has left the frame for its last 0.4 s:
  same in v7.
- **The ending.** Nothing that belongs before 204.19 arrives after it: frame 4900 (204.167) is the darkest frame
  (mean 5.0, no trace of the inscription), the credits paper rises from frame 4901 over 0.9 s, the dedication is up by
  205.6, the colophon from 208.2 to 209.2 and held to 214.2, fade to 215.19. The film's last frame (5164, 215.167 s)
  is one frame short of full black (mean 9.5 against 5.0): the same formula as before, not visible.
- **Subtitles.** Cue times agree with `lyrics_timing.json` and with `08_outro.js` (note 6 is about wording only).
