# Review A: cut v8, 0 s to 110.3 s

Status: final (Oct 9). Look-and-report only: no source file, git state or tmux pane was touched. Scratch scripts and
comparison images are in the session scratchpad under `review_a/`.

Nothing in this half is broken. No popped frame, no wrong-shot frame at a cut, no new freeze, no cut off its beat,
no sung line more than 0.15 s off its onset that was not already so in v7, and the subtitles agree with the timing
file. There are three places where the retime changed how something lands, one confirmed on frames and two that
rest on audio measurements (I cannot hear the track), plus one source slip with no visible effect.

## What was looked at, and how closely

- **Every cut, on frames:** the ten cut sheets from 2.91 to 110.28 s (three frames each side of all 66 cuts).
- **Motion at 4 frames a second:** the ten motion sheets, 0 to 120 s.
- **Native frames or consecutive-frame strips, beside v7 where it mattered:** 1.9 to 2.9 s (the ink drop), 22.4 to
  22.8 s (wash to white), 44.4 to 45.4 s (iris into the teahouse), 73.7 to 73.8 s (3.8e to 3.8f), 76.6 to 78.0 s
  (first hook gloss), 83.9 to 85.3 s (the big 你), 87.4 to 89.3 s (second "I think of you"), 93.4 to 96.4 s ("moons
  and lonely wine"), 106.9 to 107.0 s (one crew flash).
- **Everything else: sheets and numbers only.** In particular faces, hands and small detail inside shots were judged
  at motion-sheet size (250 px wide), not at native size.
- **Numeric, all frames 0 to 2660:**
  - cut times against the beat grid, sung onsets and ACCENTS;
  - ACCENTS against onset energy in `media/audio/moongazing_2down_master.wav`;
  - the vocal stems of both recordings around the intro vocalise;
  - each v8 shot against the matching v7 shot, frame by frame from the shot start (120x68 px);
  - a scan for popped frames, dark frames and local flicker in v8 and v7;
  - `render/out/type_reveal_check_v8.json` against `analysis/v2/lyrics_timing.json`;
  - the three subtitle files against `lyrics_timing.json`;
  - the section sources 00 to 05 for song-time literals the retime left unconverted.
- **Not done:** listening. Every statement about what is heard comes from measurement of the audio files.

## Findings, most noticeable first

### Confirmed on frames

**1. 1:35.9 to 1:36.3 (95.88 to 96.30 s), shot 4.8: the word "wine" is on screen for under half a second.**
- Seen: "moons and lonely" sits for 1.3 s, then "wine" fades in and the cut to the lander removes the whole line.
- Evidence: type strip `38_1m33.50_en_lyr-L13--0.jpg`. "wine" is first faintly visible at 95.88 (f2301), whole at
  96.00 (f2304), last frame 96.29 (f2311), cut at f2312. About 11 frames in all, 7 at full strength. The type report
  gives its start as 95.726 and the line's last frame as 96.29.
- v7: "wine" started at 96.72 and the cut was at 97.73, so it had 1.0 s. New in v8.
- Cause: in the new recording "wine" is sung 2.38 s after "moons" (93.484 to 95.866); it was 1.96 s (94.900 to
  96.857). The shot still runs from the line's start to bar 53 (2.81 s, `04_hook.js` line 442), so the word arrives
  0.4 s later inside a shot of the same length. She holds "wine" until 98.27, two seconds past the cut.
- Sure of the frames; a viewer who reads the lyric will see the word blink.

### Suspected from numbers (picture confirmed, sound measured, not heard)

**2. 0:02.2 to 0:02.7 (2.24 to 2.71 s), shot 0.1: the ink drop lands about 0.2 s before the strum can be heard,
and the blot then waits.**
- Seen: the drop touches the paper on f54 (2.25 s), makes a small blot by f56, and the blot sits unchanged for nine
  frames (f56 to f65, 2.33 to 2.71 s) before the bloom on f66. In v7 the drop landed on f59 and the bloom came on
  f64: four frames of small blot, read as one event.
- Measured in the new master, 400 Hz to 8 kHz: the swell is steady at about -28.5 dB from 1.85 s. At 2.24 s (where
  `HIT` now is) the level is 2 dB above the swell. It reaches +7 dB at 2.42, +10 dB at 2.54, +13 dB at 2.60, and
  the chord is at 2.70 (+26 dB). In the first recording the drop landed at 2.44 on a level 10 dB above the swell,
  0.18 s before the chord; now it lands 0.46 s before the chord on something close to inaudible.
- The bloom itself is right: the main expansion is on the chord (f65 to f66, 2.70 s), and the cut to 0.2 at 2.91
  sits on the low re-attack.
- Cause: `render/src/sections/00_intro.js` line 56, `HIT = 2.24` and the first `ROLL` entry, from
  `analysis/v2/retime/overrides.json` ("2.44": 2.24). NOTES.md lists the roll's attacks as low confidence. A landing
  at about 2.42 with the small splats at 2.50 and 2.59 would match what the measurement shows.
- Fairly sure of the measurement; how it reads with sound is for someone who can listen. Card `r5_sync` on the page
  covers this.

**3. 0:22.5 to 0:22.9 (22.45 to 22.90 s), cut 1.3 to 1.4a: the wash to white and the "breath opening" no longer
have the voice under them.**
- Seen: the stage shot brightens to warm white over f538 to f543, cut at f544 (22.66), and the walkout opens out of
  the white over the next 0.45 s. The picture is the same as v7 against the cut.
- Measured on the vocal stems: in the first recording the voice jumped from -35 dB to -22 dB between 22.6 and
  22.8 s, which is the "voice bloom" the shot is written for (`01_intro_b.js` lines 40 to 45, `VOICE`). In the new
  recording the voice has been singing at about -26 dB since 16.8 s and nothing changes at 22.66 (-24 dB before and
  after). The event there is the leap in pitch from about 880 Hz to about 1150 Hz at 23.0 to 23.2 s, with the level
  rising to -19 dB by 23.6 s. That leap is on the downbeat of bar 12 (about 23.05 s).
- So the flash comes 0.35 to 0.5 s before the voice does anything. It still sits 0.065 s after beat 4 of bar 11,
  as it did before, so it is not off the grid.
- Cause: `VOICE = 22.66` (`01_intro_b.js` line 7) is the beat-warped position of the old bloom; `time_map.json`
  marks it low confidence ("no unique corresponding event"), and NOTES.md says the old bloom has no counterpart.
- Sure of the stem measurement; moderately sure a viewer feels the flash as unmotivated.

**4. 1:16.7 to 1:17.9 (76.71 to 77.88 s), shot 4.1: the gloss "The moon wanes," is up for 1.2 s; it had 1.6 s.**
- Evidence: type strip `29_1m16.71_card_g41.jpg`: first visible 76.71, whole from about 77.08, fading from 77.71,
  gone at the cut (77.88). About 0.6 s at full strength. In v7 it ran from 77.40 to the cut at 78.96.
- Cause: the first 月 is sung 0.35 s later against the beat (76.463) and 酒 is not, so the held 月 is shorter. The
  gloss start (76.70, `04_hook.js` line 360) follows the syllable as intended.
- Three words; probably still readable. Low.

### Source slip, nothing visible

**5. 0:15.69, cut 0.6 to 1.1: the terrace take skips about one frame forward where it should carry on.**
- `render/src/sections/01_intro_b.js` line 15 still reads `offset: 0.6 + 0.75 * (LIFT - 13.10)`. The 13.10 is the
  old start of shot 0.6; that start is now 13.15 (`S06` in `00_intro.js` line 40). The clip clock is 2.50 s at the
  end of 0.6 and 2.54 s at the start of 1.1.
- Not visible: the indigo wash starts on the same frame, and the frame-to-frame change at f376 to f377 is 5.3 in
  v8 against 5.0 in v7.

Also unconverted in `00_intro.js`, with no effect a viewer could see: the seal's fade `smooth(4.9, 5.5, t)` (line
31), the camera glide start `4.95` and `5.0` (lines 45 and 46), and `resolveAt: [3.62, 5.1]` (line 62). Each is
about 0.07 s early against the music. Several comments still quote old times (5.86, 24.7, 28.75, 45.3, 47.14,
48.9, 74.4, 76.17, 107.60 to 109.5).

## Nothing found

- **Cuts off the beat:** none. All 66 cuts are within 0.01 s of a beat, a half-beat (the crew flashes at 1:46 to
  1:47), a sung onset or an ACCENTS entry. The cuts that sit on a measured accent and not on a beat are 2.91, 13.15,
  107.86 and 22.66 (finding 3), as in v7.
- **ACCENTS against the audio:** 1.80, 2.91, 5.94, 13.15, 15.45, 26.73, 30.43, 46.64, 60.91, 73.41, 75.16, 96.31,
  103.39 and 107.86 each have an onset or a level change within about 0.06 s in the new master (coarse measurement:
  mel flux and RMS at 6 ms steps). 9.22, 11.52 and 17.09 carry no cut in this half and were not pursued; 44.85 is the bar-24
  downbeat, where the cut already sits.
- **Lyric lines, Chinese columns and glosses against sung onsets:** every word that reveals on its own starts 0.14 s
  (English) or 0.05 s (Chinese) before its sung onset, as designed. The exceptions are the same as in v7:
  - "The willow" appears at the cut, 0.30 s after the first word (v7: 0.28 s);
  - the second "I think of" appears at the cut at 87.47, 0.45 s after "I" (v7: 0.43 s);
  - a line's last unit arrives with the one before it (人 with 三, 念 with 思, "waning" with "with"), which is the
    `tail: 'join'` behaviour in `_lib.js`;
  - 你 is already there at the cut, 0.36 s early, by its `early: 0.45`.
- **Type straddling or cut off by a cut:** none beyond the lines that leave with their shot as in v7. The report has
  no flags in this half other than the known pop-in at 0:19.
- **In-shot actions:** every roto shot matches its v7 counterpart from the shot start; the differences grow and
  shrink with the camera move and the lyric reveal, not with the figures. The kiss in 3.1 still settles on the kit
  hit: it reaches the same point of the take at 46.62 s and the hit is at 46.637. The buckle click (73.41), the
  hook impact (75.16) and the stamp (103.39) sit where they did against their cuts.
- **Frozen or held last frames:** none new. Still-frame counts per shot match v7 (the blueprint tail of 1.1 and the
  title cards are still in both).
- **Popped frames, flashes, wrong-shot frames, figure jumps:** none. The seven near-black frames are the ink
  transitions and v7 has them at the same cuts (v8 f421, 510, 598, 686, 1803, 2312, 2481; v7 f421, 511, 601, 690,
  1827, 2346, 2519).
- **Subtitles:** all sung cues in the three `.srt` files start on a line or word onset from `lyrics_timing.json`; no
  overlaps, none under a second.

## Same as v7, noted in passing

- 3.8f, first frame (f1770, 73.75 s): the photo of the kids sits about 45 px to the right (at 960 wide) and jumps
  to its place on the second frame. v7 has the identical jump (f1795 to f1796). One frame at a cut.
- The gloss "The moon wanes," is crossed by the launch tower's lattice at its first word, as in v7.
- The burned-in gloss reads "the wine is cold" and the subtitle "the wine grows cold". The retime changed only the
  cue times.
