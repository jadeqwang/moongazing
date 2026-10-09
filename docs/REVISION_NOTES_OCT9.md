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
  longer roll now: the ink drop lands on its first finger at 2.24 s; the hook glosses, which follow the sung syllables;
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

## Things learned
- `/tmp` is a 16 GB tmpfs and was full (other projects' caches): Chrome then crashes at start with more than one
  worker ("Target crashed", "source image cannot be decoded"). `TMPDIR=<folder on disk>` in front of the render fixes
  it (`render/tools/ranges_verified.sh` sets it). With one worker a 10 s chunk takes about 23 s at 540p.
- Codex's sandbox hides the GPU and cannot run the renderer; the session's safety check refused my approving a command
  outside codex's sandbox. Work that needs the GPU or the renderer runs from the main session's shell (it costs no model
  usage while it runs); codex does analysis on CPU, mastering, encoding, page building.
- 226 frames of pass A differed from pass B while two agents were test-rendering: renders under load do save wrong
  frames silently, and the two-pass check does catch them.
