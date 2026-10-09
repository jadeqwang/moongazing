# Round five (Oct 9, small hours): the lower-key recording, and Jade's round-four answers

## Her message (verbatim)
> Some revisions to the the Moongazing video:
> * I gave my answers in the artifact.
> * I also adjusted the pitch to fit more comfortably in my vocal range (for live performance), but then it was
>   distorted, so I re-uploaded to Suno to cover it, and now it's basically the same but somewhat shorter and some of the
>   timings have shifted. Sorry. Can you make Moongazing - 2 semitones down.mp3 (inputs folder) fade out evenly again and
>   time the video to the resulting track? and also export your new mp3 with the proper fade-out?
> * By the way, I can see that the 5 hr session resets at 3:30AM, and we're at 42% used. Can you stagger your subagents so
>   that not too many of them hang right before the reset, and then start things back up at 3:30AM? You should have plenty
>   of codex to delegate to thru tmux. Have Codex do the boring work, like video rendering.
> * I think we're ready to render a small version of the full video and commit to github.

## Her answers on the round-four cards (ArtifactData `decisions`, ids `r4_*`)
| Time (old cut) | Card | Answer | Done |
|---|---|---|---|
| 0:20 | the card in her wording | "It is right now" | nothing |
| 0:58 | envelope | "ok" | nothing |
| 1:05 | throat | Still off: "now the glitchiness is just lower down. can you have a video model help you?" | DESK: new take, whole figure from the take (`rev5_desk_report.md`) |
| 1:10 | M's hair | ok | nothing |
| 1:22 | photo of the kids | ticked "This works" and "Make the visor gold as at 1:15, so my face is hidden" | VISOR: gold visor (`rev5_visor_report.md`) |
| 1:45 | masts | "Larger still, about 1.6 times" | VISOR: masts at 1.6 |
| 2:23 | work lamps | ok | nothing |
| 2:59 | two cups | Still off: "the hands still look stilted and weird. maybe we delete this shot since the updated mp3 may be a bit shorter" | main: shot deleted; the toast is group, Adaeze, group, one bar each |
| 3:13 | reunion | "B" | main: `K_8.2a` pick -> `take_10` |

## The retime
- **Audio.** `media/audio/moongazing_2down_master.wav/.mp3` (210.86 s; dry and sample-identical to the source until
  207.0 s, then a matched reverb tail to exact silence; made by codex, report `media/audio/REPORT_2down.md`), release copy
  `release/audio/Moongazing_master_2_semitones_down.mp3`. None of these is in git.
- **Analysis** (codex, CPU; stems made on the GPU by the main session): `analysis/v2/` (`beatgrid.json`,
  `lyrics_timing.json`, `time_map.json`, `sections.json`, `NOTES.md`). Bars 1–104 are the same music, about 1.4 % faster;
  no bar added or dropped. The ending differs: drop cuts at 187.33 (was 189.86), humming 192.5–196.6, a slowing run of
  plucks from 198.6, a short solo hum at 203.0, the last chord at 204.19 (the last pluck was at 210.04). Some sung lines
  moved against the beat by 0.2–0.35 s (table in NOTES.md).
- **Swap.** `analysis/beatgrid.json` and `lyrics_timing.json` are now the v2 files (the first recording's are in
  `analysis/v1/`); `render/tools/audio_info.mjs` prefers the 2down master. The shot table is written in bars and lyric
  onsets, so most of it followed by itself.
- **Fixed times.** About 140 literal song times in `render/src/sections/*.js`, `scenes/cosmos.js` and
  `release/subs/make_subs.py` were rewritten by `analysis/v2/retime/convert.py`: a measured event takes its measured new
  time, anything else the beat warp, and `overrides.json` holds the values set by hand (the opening strum, which is a
  longer roll now: the ink drop was set to land at 2.24 s, corrected to 2.48 after the review, see below; the hook glosses, which follow the sung syllables;
  the verse-two start). `ACCENTS` in `_lib.js`: the tail was rewritten for the new ending.
- **Ending, by hand** (`08_outro.js`): the new recording is 3.3 s shorter between bar 110 and the last note. 8.3 (roof
  deck) is one bar (1.83 s, was 2.73); 8.4 (tea cup, inscription) runs bar 111 → 204.19 (6.05 s, was 8.44); the
  inscription brushes at +0.3 and +2.2 s (2.0 s each), the English enters at +3.0 s, the fade to dark is the last 0.8 s.
  Credits 204.19 → 215.19. The film is 5,165 frames (0..5164).
- **Baked timing rebuilt:** the dance-game TV atlas (`tools/ddr_screen.py`; `DDR_SCR.k0` 3493 in `07_drop.js`).
  Subtitles regenerated.
- **Checks:** lint OK (124 shots); `render/tools/take_len_check.mjs` (every roto take is long enough for its shot at
  the new timing); the full 540p render twice with all differences resolved (`render/out/v8_render.log`: 226 frames
  differed between the passes, all settled by a third; flicker check passed); the fix owners' own double renders are
  byte-identical to the cut's frames; two contact sheets of the whole cut looked at. **Nobody has watched it at speed
  with sound.**

## After the 3:30 reset: the cut-by-cut review, and three corrections
Two review agents went through v8 after the usage window reset, one per half, on material made for them in
`render/out/retime/review_v8/` (`render/tools/review_sheets.py`: three frames either side of every cut, four frames a second of the
whole film, the type strips). Reports: `docs/reviews/rev5_review_a.md` (0 to 110.3 s), `rev5_review_b.md` (to the end).
Neither found anything broken: every cut within 10 ms of its beat, onset or accent; no popped, wrong-shot or frozen
frames; subtitle cues agree with `lyrics_timing.json`. What they found, and what was done:

- **0:02, the ink drop (fixed).** `HIT` was 2.24, the first of the onsets I had read off the new strum. Measured on the
  master (400 Hz to 2 kHz, 20 ms steps) the roll is a soft swell from 2.3 with audible fingers at 2.48 and 2.60 and the
  chord at 2.69: the drop landed a quarter second before anything could be heard and the blot then sat for nine
  frames. Now `HIT = 2.48`, `ROLL` 2.48 / 2.60 / 2.69 / 2.95 (`00_intro.js`). First wet frame is 60. The other
  literals of that shot that the conversion had missed (seal fade, camera glide start, `resolveAt`) moved by the same
  +0.08 s as the cut they lead to.
- **1:36, "wine" (fixed).** On the new recording "wine" is sung 0.43 s before the cut to the lander (it was 1.0 s), so
  it was whole for 0.15 s. In shot 4.8 its onset is pulled 0.4 s ahead of the voice (`04_hook.js`, a local copy of the
  line; the shared reveal code is untouched): it now arrives during the held "lonely" and stands about 0.75 s.
- **0:15.7, the terrace take (fixed, was not visible).** `01_intro_b.js` still subtracted the old start of shot 0.6
  (13.10, now 13.15) when continuing the take across the cut: one frame of skip.
- **0:22.66, the wash to white (left, on the sync card).** `VOICE` was the first recording's voice swelling in. In the
  new one the voice has sung since 16.8 s and the event is a pitch leap on the bar-12 downbeat (23.05). The wash is
  still 65 ms after beat 4 of bar 11, so it reads as a cut on the beat; moving it to 23.05 would leave the walkout
  0.9 s. Jade's ear decides.
- **1:16.7, "The moon wanes," (left).** 1.2 s on screen, it had 1.6: the gloss follows the sung syllable as designed.
- **The ending (left, on the ending card).** The finished inscription stands 1.05 s before the fade begins (2.04 in
  v7), the English about 1.5 s at full strength, and the short solo hum (203.02) now sits under the fade. The card's
  text had said two and a half seconds for the English: corrected.
- **Subtitle wording.** "to gaze" in the subtitle against "and gaze" on screen is deliberate: with "and" the cue is 43
  characters and `make_subs.py` refuses anything over 42.

Frames 0-143, 376-421 and 2243-2311 were re-rendered twice and compared (no differences), the cut re-encoded, the page
media rebuilt. `ranges_verified.sh` no longer passes a negative start time for a range beginning at frame 0. The page
builder waits for the render log to END with `V8_DONE`: after a range re-render, append a line ending in ` V8_DONE`.

## Morning: her round-five answers, M's hair at 1:17, and the 1080p
Jade, 7:30 AM, in the chat: "one minor fix in artifact (M's hair during launch), please commit, including new mp3, and
make codex start on the 1080p. thank you!" and then "but fix M's hair first, and then do the 1080p".

Her answers on the seven cards (`r5_*`): all "ok" (sync, ending, desk: "much better, especially because I also blink,
which reads as natural", gold visor, masts, toast, reunion). One note, on the visor card: "at 1:17-1:19, something
about the way M's head relative to her head is off. Maybe have a video model help with this, as it looks like a still
image moving on another still image and reads as unnatural."

- **1:17 to 1:20, shot 4.2 (fixed).** Since round three M's hair there was the painting's, carried as a rigid cut-out
  on the take (`roto_keep`), because the redraw had lost her braid. Kenton lifts her about 80 px and her head tilts
  back, which a flat cut-out cannot follow: a sticker, with stray strands at its edge. The take itself (MiniMax h3,
  `K_4.2/take_9`) has the braid; what lost it was `roto_prep.py`'s mean-shift flattening of the colour guide. New
  opt-in flag `roto_prep.py --detail` (bilateral only, as for gold line art); `K_4.2/take_9d` is the same take
  prepared with it, shown in the take's own tones (`style: { snapAmt: 0, shade: 0, gran: 0, lineA: 0 }`), nothing
  carried, `keepOcc` gone. No new generation, no spend. Tests: `render/out/rev5_hair/` (`styles2.jpg`: now / take_9d
  own tones / take_9d redrawn / the steadier Seedance take_10d both ways; `head_every_drawing_now.jpg`). Frames
  1866-1930 re-rendered twice, no differences. Short of the painting: the braid is softer at the top of the lift
  (the take is 768p). 1.6 (0:27) still carries the painted hair. Card `r5_hair` on the page.
- **The new recording is in the repository** (`inputs/Moongazing - 2 semitones down.mp3`, commit 9679d9c).
- **1080p.** Frames: `render/out/retime/run_v8_1080.sh` from the main session's shell (codex's sandbox cannot run the
  renderer), into `render/out/frames_v8_1080`, log `render/out/v8_1080_render.log` (ends with `V8_1080_FRAMES_DONE`).
  Codex has `render/out/retime/brief_1080.md`: `release/encode_1080.sh`, the upload copy, the master, a copy with soft
  subtitles, checks, report in `render/out/release_1080/REPORT.md`, `V8_1080_ENCODE_DONE` in `jobs.log`.
- **1080p done, 8:43 AM** (Jade at 8:00: "hair fix looks good! let's encode."). Frames: 5,165, two passes identical,
  flicker check passed (08:27). Codex's encode (`bash release/encode_1080.sh [frames] [out]`, with
  `release/encode_1080.py`, `check_1080.py`, `finish_1080.py`) in `render/out/release_1080/`:
  `Moongazing_1080p.mp4` (437 MB, H.264 high two-pass 15.9 Mb/s, AAC 304 kb/s), `Moongazing_1080p_subs.mp4` (the same
  streams plus two soft subtitle tracks, off by default), `Moongazing_1080p_master.mkv` (1.25 GB, CRF 12, PCM 24-bit).
  All three decode fully with no errors, 5,165 frames; audio starts at 0 and matches the wav's loudness (-15.6 LUFS,
  -4.4 dBTP); twelve frames compared with their source (upload copy 39 to 53 dB PSNR, master 43 to 53).
  `REPORT.md`, `contact.jpg` there. Looked at in 1080p by me: M's hair at three moments, the desk face, the gold visor,
  "moons and lonely wine", the reunion, the inscription, the credits (native crops in `render/out/rev5_hair/`), and
  the contact sheet of the encode. Not watched at speed.

## After her first viewing of the 1080p: three faults (rev6)
Her words: "M's hair is glitched in the 1080p, and there's a weird discontinuity glitch at 1:30, where the sound is
discontinuous. and astronaut's legs are glitched at 1:50 (similar to previous glitch but the breakpoint is different,
please have video model or Three.js help instead of freestyling)"; then "I suspect the hair is from an older version
before the fix".

- **M's hair.** The 1080p file does hold the rev5 fix at 1:17 (frames pulled from the mp4 match the rendered frames:
  `render/out/rev6/mp4_vs_frames.jpg`). What was still the old version is the *other* launch shot, 1.6 at 0:27: it
  still carried the painted hair as a rigid cut-out (the fault she had named at 1:17), and nobody had applied the fix
  there. Now the same as 4.2: `K_1.6/take_4d` (= take_4, `roto_prep.py --detail`), the take's own tones, nothing
  carried. The take's braid there is a crown braid with the pink elastic, not the side braid of 1:17.
- **1:30.** The film's audio is the recording, unchanged: the encode, the wav master and her mp3 give the same levels
  to 0.1 dB around 85-95 s, and the mp4's audio and video timestamps have no gaps. The recording itself has a stutter
  at 89.2-89.3 s (the old-key recording has the same one at 90.7 s). The picture cut to the Earth sat exactly on it and
  opened through an ink bloom: one blank indigo frame, then a ragged hole for four frames, then the sky changing from
  indigo to black. That read as a dropped frame on the stutter. 4.6 is now a straight cut (`reveal` removed).
- **1:48-1:50, the legs.** Not the redraw this time: `K_5.4/take_4` slides the whole body about 40 px sideways over
  planted boots, so the legs shear at the knees. `take_6` (Seedance 2.0, made on Oct 8 from the same keyframe and not
  used then) stands: weight settles, the arms ease out, legs and boots stay put for the first 4 s. 5.4 now plays
  take_6 at 0.5-2.95 s (picks.json), mask widened to the whole figure as before. No hand fix.
- Frames 641-686, 2141-2182, 2588-2647 re-rendered at both sizes (`OUT=out/frames_v8_1080 SCALE=1 bash
  render/tools/ranges_verified.sh ...` is new), both cuts re-encoded; the first 1080p files are kept in
  `render/out/release_1080_before_rev6/`. Job: `render/out/retime/run_rev6.sh`.
- Looked for the same faults elsewhere: the only other ink-bloom opening is the mission emblem at 1:43 (K_5.2), which
  opens over 0.9 s and is meant; other carried painted regions are faces (Jade's, by design) and M's head at 1:27,
  where she sits still and it holds.

## Things learned
- The temp disk filling also kills this session's own shell output ("Command output was lost"): keep scratch work in
  `render/out/rev6/`-style folders on disk and set `MAGICK_TMPDIR` there for montage.
- `/tmp` is a 16 GB tmpfs and was full (other projects' caches): Chrome then crashes at start with more than one
  worker ("Target crashed", "source image cannot be decoded"). `TMPDIR=<folder on disk>` in front of the render fixes
  it (`render/tools/ranges_verified.sh` sets it). With one worker a 10 s chunk takes about 23 s at 540p.
- Codex's sandbox hides the GPU and cannot run the renderer; the session's safety check refused my approving a command
  outside codex's sandbox. Work that needs the GPU or the renderer runs from the main session's shell (it costs no model
  usage while it runs); codex does analysis on CPU, mastering, encoding, page building.
- 226 frames of pass A differed from pass B while two agents were test-rendering: renders under load do save wrong
  frames silently, and the two-pass check does catch them.
