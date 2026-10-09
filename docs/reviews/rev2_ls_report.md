# Shot 4.3 sung close-up, second attempt (rev2_ls), 8 October 2026

Jade's note on v4: "1:22 - let's try and let a video model lip sync here, and rotoscope over it".
Shot 4.3 = 81.464–82.880 s (frames 1955–1989), `render/src/sections/04_hook.js`. It currently plays the
non-singing reaction `J_4.3/take_1`. This file is written as the work goes; the newest state is at the bottom
("Status").

## 1. What is sung in the shot (measured on the stem, not taken from the CTC labels)

`analysis/lyrics_timing.json` gives 我 81.464, 思 82.125, 念 82.585, 你 83.266, with a note that its two alignment
methods disagree by 0.6–0.7 s on this line. I read the phones off the isolated vocal stem directly (5 ms STFT, band
energies, pitch, spectral flux: `render/out/rev2_ls/audio/onsets.py`, plots `spec_*.png` beside it). Result, kept in
`tools/sync/phones_LS3.json`:

| Song time | Phone | What the mouth has to do |
|---|---|---|
| 79.75–80.80 | 寒 "a", held E4 | wide open, jaw dropped |
| 80.80–81.15 | 寒 "n" | closes to a hum (level falls 12 dB) |
| 81.20–81.33 | breath in | lips parted |
| **81.455**–81.56 | 我 "w" | lips round forward, small opening (pitch glides E4→G4) |
| 81.56–81.90 | 我 "o" | round and open (A4) |
| **81.93**–82.20 | 思 "s" | jaw closes, teeth together, lips drawn back narrow (hiss at 8–9 kHz, 0.27 s long) |
| 82.21–82.50 | 思 vowel | stays narrow and spread (B4) |
| 82.50–82.635 | 念 "n" | narrow, tongue up |
| **82.635**–83.06 | 念 "yen" | jaw drops: the widest opening of the phrase. The cut to the splash park (82.88) falls inside it |
| 83.07–83.31 | 你 "n" | narrow (after the cut) |
| 83.31–86.0 | 你 "i" | spread, a little apart, held (after the cut) |

So the 34 frames need three clearly different mouths in order: **round-open (我, 11 frames) → narrow slit (思 and the
n of 念, 17 frames) → wide open (念, last 6 frames)**. The CTC label for 我 is right; the label for 思 sits in the
middle of its hiss (the jaw must already be closed 0.2 s before it); 念's label is the nasal, the jaw drop comes 50 ms
after it.

## 2. Why the 14 earlier LS3 takes failed (from the audit, the specs and a re-measurement)

1. **The model was never given a chance to lock on, or was given too much.** Takes 1–11 fed 7–10 s of the hook
   (from 月 or from 寒) at 480p/720p for a 1.4 s window; takes 12–14 fed 0.5 s of silence and then the phrase. With
   0.5 s of lead the three takes came back with lags of −0.29, +0.38 and −0.79 s: the model was guessing where the
   voice starts. Nobody knew, to the frame, where 81.46 fell in a returned take: placement was read off a
   loudness-correlation score.
2. **The measurement could not tell lip sync from a moving mouth.** `tools/sync/measure.py` correlates an opening
   curve with the stem's loudness. On 1.4 s of legato singing almost any opening correlates with something (takes 12
   and 14 scored "good" with lips that hardly moved). Re-measured by events (new tool, section 3), take 13 opens for 我
   6–7 frames late, is still open through the hiss of 思, and never drops the jaw for 念.
3. **The prompts asked for a small mouth.** Take 12–14's prompt: "Restrained, tender singing: the mouth stays small,
   dark inside, teeth are not drawn". The vocal is the hook at full voice (F#4–C#5). A small mouth cannot show
   o → s → yen; and a model told not to draw teeth draws them anyway, as blobs (take 13, 82.63–82.88).
4. **Photo references changed her.** Takes 1–9 passed real photos as `reference_images`; the face turned
   flesh-shaded and photographic (takes 3, 5), which is neither her painted likeness nor the shot's style.
5. **Reframing.** 480p and "adaptive" takes came back 992×432, 1112×834, even 720×1280. The 16:9, first-frame-only
   720p takes (10–14) held 1280×720.
6. **The cut that Jade saw showed none of it.** v3 drew a two-parameter JS mouth on the still keyframe.
   The roto path used for LS1 holds drawings on twos (12 per second) and draws sparse face lines: a 3-frame closure
   such as an "s" can vanish.

## 3. What is different in this attempt

- **Reference audio:** the isolated stem from 78.910 s (the near-silent gap before 酒), 5.0 s:
  `media/gen/LS3/ref_vocals_78.910_5s.mp3`. 我 lands 2.545 s into the clip (frame 61), after two sung onsets (酒, 寒),
  the held note and the breath: 2.5 s for the model to lock on, the shot's window (clip 2.55–3.97 s) in the steady
  middle of the take, 1 s of tail for any lag.
- **Placement by events:** `tools/sync/viseme_check.py` finds, for each take, the frame where the mouth actually
  opens for 寒 and 我, closes for 思, opens for 念 and closes for 你, and reports each one's lag against the stem in
  frames, with two independent openness measures (face landmarks; optical-flow jaw drop). A take is placed by those
  events, and a take whose events are missing or do not line up with one shift is rejected. The same tool makes a
  sheet of every frame of the phrase with its phone.
- **Prompt:** asks for full-voice singing with the three mouth shapes in order, mouth interior plain dark, no head
  turn, first frame's line art kept; no photo references; first frame only.
- **Models:** besides Seedance 2.5, `pruna/p-video-avatar` (already in the catalog: one portrait + an audio file →
  a talking head driven by that audio, $0.025/s) is tested first because it is driven by the audio directly.
- **Roto:** the take's own mouth is kept (`remouth=False`), drawn on ones, and the mouth region is checked in the
  gold redraw at half and full scale (section 6).

## 4. Takes

All takes: first frame = the painted keyframe `media/keyframes/jade/J_LS3.png` (16:9, no photo references), audio =
`ref_vocals_78.910_5s.mp3`, 5 s. "Lag" is mouth minus voice in frames at 24 fps (negative = the mouth moves first),
from `tools/sync/viseme_check.py`, for the six events 寒 opens / 寒 closes / 我 opens / 思 closes / 念 opens / 你 closes.
Evidence per take: `render/out/rev2_ls/takes/<shot>_<take>/` (`*_viseme.png` curves, `*_mouthsheet_p01.jpg` every
frame 81.2–83.0 s with its phone).

For comparison, old **LS3/take_13** (Seedance 2.5, the best of the 14) re-measured the same way
(`render/out/rev2_ls/old/`): 2–3 of 6 events found; 我 opens 6–7 frames late, the mouth is at its widest during the
hiss of 思, and there is no opening for 念.

| Take | Model | Events found | Per-event lag (frames) | Verdict |
|---|---|---|---|---|
| LS3c/take_1 | p-video-avatar 720p, 1.6× crop of the keyframe | 6/6 (flow), 5/6 (landmarks) | −5.3, −2.5, −0.2, −4.0, −1.3, −3.6 | First take ever to follow the phrase: opens on 我, teeth together through 思, jaw drops on 念. Returned audio is the stem at 0 ms offset (correlation 0.998), so clip time is known exactly. **Rejected for the look**: a wide grin with full rows of teeth and a flesh-coloured tongue; cheek folds appear. |
| LS3/take_15 | p-video-avatar 720p, full keyframe | 6/6 on all three measures | −5.4, −4.2, −1.9, −5.1, −1.2, −3.4 | Same: sync is right (opens for 我 on frame 1955–1956, closes for 思 at 81.87, opens for 念 from 82.58), look is wrong (grin, teeth, head lifts and tilts; in the gold redraw the teeth become a gold grille and the carried glasses double against the tilted head: `takes/LS3_15/roto_strip.jpg`). Frame 0 matches the keyframe (registration error 2.8). **Rejected.** |

Reading of the lags: openings come 1–2 frames before the voice (normal: lips part before the sound), closures 3–5
frames before the next consonant (also normal: a singer closes into an "s" or "n" before it sounds). There is no
drift across the 5 s. This model is driven by the audio, frame by frame, which Seedance 2.5 was not.
| LS3/take_16 | p-video-avatar, full, serious/no-smile prompt, negative strength 1.5 | 6/6 | −5.5, −4.9, −2.2, −5.6, −2.0, −3.9 | Sync right. Head moves, a white glint appears on a lens, grin remains. **Rejected.** |
| LS3/take_17 | same, negative strength 3.0 | 6/6 | −5.5, −5.2, −1.8, −3.0, −0.2, −3.3 | Best mouth so far: a true round O held through 我 (frames 1955–1963), closing two frames before the hiss. But the head pitches back (chin up, nostrils showing) and the eyes narrow; in the redraw the carried glasses double. **Rejected for likeness.** |
| LS3/take_18 | full, "head held still" prompt | 6/6 (landmarks) | +7.1, −5.2, +1.1, −2.5, −1.2, −3.6 | Head still nods and tilts; eyes close on 我. **Rejected.** |
| LS3/take_19 | **Seedance 2.5** 720p, same reference and first frame, `generate_audio: true` to see what it does with the audio | 5/6 | −3.2, −2.3, **+6.1**, none, −3.2, −4.8 | A beautiful in-style round O for 我, but it then opens wide in the middle of 思 (82.03–82.29) and shuts at 82.37. The returned audio is NOT the stem: waveform correlation 0.23 (the avatar model's is 0.998); it is a re-sung copy that runs about 0.1 s ahead of the stem with its own phrasing (`takes/LS3_19/audio_vs_stem.png`). **This is the root cause of the earlier failures: Seedance 2.5 re-performs the reference audio and moves the lips to its own version; it does not lip-sync to the file.** Rejected. |
| LS3c/take_2 | p-video-avatar, **1.3× crop** of the keyframe (`media/keyframes/jade/J_LS3_close.png`), still-head prompt | 6/6 | −5.3, −2.1, −0.7, −4.8, −2.4, −5.0 | Head stays frontal, drifts up about 30 px over the shot; face holds. 我 opens on the shot's first frame but closes 4 frames early. Second choice. |
| LS3c/take_3, take_4 | same | 6/6, 5/6 | (−3.3, −6.0, −2.4, −4.8, −2.3, −5.0), (−4.9, −5.6, −1.9, −5.1, −2.9, none) | Head rolls and pitches during the phrase. **Rejected.** |
| LS3c/take_5 | same | 6/6 | −6.2, −2.8, −1.1, −5.6, −1.2, −3.7 | Rounder, smaller O for 我 than take_2; head rolls about 5° on 我. Third choice. |
| LS3c/take_6 | same | 6/6 | −5.6, +7.7, −2.2, −5.6, −1.1, −3.2 | Head rolls 6° and slides 65 px in the phrase. **Rejected.** |
| **LS3c/take_7** | same | 6/6 | −3.5, −4.6, −2.3, −4.3, −1.1, −3.5 | **Best attempt.** A true round O for 我 held 8 frames, teeth together for 思, tall opening for 念; smallest spread of all takes (3.5 frames). Head tilted 3–5° and rising through the shot. |

Why the crop: every full-frame avatar take moved its head a great deal; with the face 1.3× larger in frame the model
keeps it steadier (and the mouth has 1.3× the pixels). The crop is the same painting, cut at x 386, y 60, 1286×724.

## 5. From take to drawing (what was added to the pipeline; nothing existing changed)

- `tools/ls_mouth_treat.py` (new), run on the take's pixels before roto prep, nothing re-timed:
  - **teeth → one flat, soft-edged pale band (upper row only when the mouth is wide open, 3-frame blend so it cannot
    flicker), tongue and mouth cavity → the face's dark ground.** On gold-line art the model draws
    cream teeth with every gap and an orange tongue; `paper: 'gold'` re-lays light as gold, which gives a gold grille
    (`takes/LS3_15/roto_strip.jpg`). After the treatment 我 is a dark opening with a sliver of upper teeth, 思 a narrow
    mouth filled by the band (teeth together), 念 a tall dark opening under the band.
  - **her painted upper face rides on the take** (`carry_upper_face`): glasses, eyes, brows and nose are taken from the
    painted keyframe and laid over every frame, moved with the head by a tracked similarity transform. The avatar
    model's own eyes (narrower, wider, differently lit from take to take) never reach the redraw.
- `tools/roto_prep.py` unchanged, called as `prep(take, remouth=False, eyelock=False, alpha=1.0, force=True)`:
  the take's own mouth is drawn; `alpha=1.0` turns the temporal filter of the guides off so a 3-frame mouth change is
  not smeared. In the section: `twos: false, redrawAll: 1, mouth: false` (drawn on ones, no JS mouth).
- `tools/ls_sung_prep.py` runs the three steps. `tools/roto_keep.py` (shader-side keep) was tried first and dropped:
  the kept painting keeps its own navy ground and shows as a tinted band across the gold redraw.
- Test renders of the film with an alternate copy of `04_hook.js` (only the 4.3 block differs) are made with
  `render/out/rev2_ls/render_alt.mjs`; the shared section file is not touched for tests.

## 6. The attempt: `LS3c/take_7` → `LS3c/take_7m`, and the verdict

**Shot 4.3 was NOT rewired. `render/src/sections/04_hook.js`, `media/gen/picks.json` and `J_4.3/take_1`'s roto folder
are untouched** (lint: OK). The attempt is delivered as separate clips for Jade to choose from:

| | 540p | 1080p |
|---|---|---|
| New, sung | `render/out/rev2_ls/4.3_sung_540p.mp4` | `render/out/rev2_ls/4.3_sung_1080p.mp4` |
| Current, not singing | `render/out/rev2_ls/4.3_current_540p.mp4` | `render/out/rev2_ls/4.3_current_1080p.mp4` |

All four: 80.5–84.0 s of the film with the master audio (4.2 → 4.3 → 4.3b). Frames: `frames_sung_540/`,
`frames_sung_1080/`, `frames_cur_540/`, `frames_cur_1080/` in the same folder. Every frame of the shot was looked at
on these sheets: `sung_face_sheet_540.jpg` (face, 540p), `sung_face_1080_a/b.jpg` (whole head, 1080p),
`sung_mouth_1080_a/b.jpg` (mouth, 1080p, native pixels), each tile labelled with the phone sounding on that frame.
`render/tools/flicker_check.py` on the 540p frames: 0 flagged.

The exact block that would be wired is `render/out/rev2_ls/block_4.3_sung.js` (substitute `CLIP` = `LS3c/take_7m` and
`SUNG` = the anchors below; `render/out/rev2_ls/04_hook.sung.js` is the section file with it applied, made by
`make_alt.py`). Framing: the 1.3× crop, `from {0.5, 0.5, 1.02}` to `{0.5, 0.49, 1.05}`; the lyric moved to
x 290, y 110, size 180 so that 念 clears the window rim.

**One retime, stated plainly.** The take's audio is the stem from 78.91 s, so `take time = song time − 78.91` is
already in sync. Played that way the mouth closes into the "s" of 思 four frames before the hiss (singers do close
early, but 170 ms cuts 我's vowel short). The clip is therefore played through anchors
`[[81.5, 2.5625], [81.8333, 2.8125], [81.9583, 2.9375], [82.5417, 3.6458], [82.875, 3.9792]]` (song s → take s): 我's
vowel at 0.75 speed, the static 思 at 1.21 speed, the rest at 1.0. Cost: two take frames are shown twice during 我
(1958→1959, 1962→1963) and three are skipped during 思. No mouth shape is invented; this only moves when the take's
own shapes appear.

### Per-syllable sync, final render (frame = round(t·24); the shot is frames 1956–1989)

| Sung event (stem) | Frame at onset | That frame | +1 | +2 | Measured |
|---|---|---|---|---|---|
| 我 "w→o", onset 81.455 (4.2 is still on screen until f1955) | f1956, 81.500 | lips rounded forward, open, dark inside | same, a sliver of upper teeth | same | the take opens on its frame 60–61 = 81.41–81.45: about 1 frame ahead of the voice. Round O held f1956–f1963 |
| 我 ends / 思 "s" hiss, onset 81.930 | f1966, 81.917 | lips nearly shut, corners drawn back, thin pale band | narrow, teeth together | same | closing f1964–f1967; half-closed at 81.883 = **1.1 frames before** the hiss |
| 思 vowel, onset 82.21 | f1973, 82.208 | unchanged: narrow, spread, teeth together | same | same | correct: the vowel of "si" keeps the shape of its "s"; held f1967–f1979 |
| 念 "n", onset 82.50 | f1980, 82.500 | still narrow, lips beginning to part | rows separating | half open | |
| 念 "yen" jaw drop, onset 82.635 | f1983, 82.625 | open and tall | widest | widest | half-open at 82.596 = **0.9 frames before** the vowel; held to the cut (f1989) |

Openings one frame ahead of the sound and a closure one frame ahead of a fricative are what a real singer does. This
is lip sync, not a moving mouth: three different shapes, each on its phone, for the first time in this shot's history.

### What the mouth looks like in the gold redraw
Kept `paper: 'gold'` with the default style (no roto parameter or shader change was needed; no new roto option was
added, so no other shot can be affected). The lips are drawn as two gold outlines with the keyframe's soft shading on
the lower lip; 我 is a round dark opening the colour of the paper; 思 a narrow mouth holding one soft pale band (teeth
together); 念 a tall dark opening with the band under the upper lip. Nothing smears and nothing flickers at 540p or
1080p. Her glasses, eyes, brows and nose are the painted keyframe's own, carried on the head.

### What falls short (why it is not wired)
1. **The teeth are a plain pale slab.** For 0.55 s of 思 (f1967–f1979) the mouth holds a flat rounded rectangle
   between the lips. At 540p it reads as teeth; at 1080p it can read as a plaque or a mouthguard. It is a deliberate
   simplification (the alternative was a gold grille of single teeth), but it is the weakest drawing in the shot.
2. **The lower half of the face is the video model's, not the painting's.** Lips, chin and jaw are redrawn from the
   take: the lips are fuller and the 念 opening larger than I would expect from the keyframe's mouth, and the chin is
   narrower when the jaw drops. Only Jade can say whether that still reads as her. The upper face is hers exactly.
3. **Her head is tilted 3–5° and rises about 50 px (1080p) during the shot**, while the caption says 3.2 G. Every
   take of this model moves the head; this one least among those with a good mouth. LS3c/take_2 holds the head
   steadier (1.5°) but its 我 closes early and its O is wider than tall.
4. **The cabin is perfectly still** in this take (seat and window move 0.0 px); the current pick has a fine launch
   tremor. The suit, collar and straps do move with her breathing.
5. **Retimed** (above): two repeated and three skipped take frames inside 1.4 s. I see no stutter on the sheets, but
6. **I have judged frames and sheets, not playback.** The sync numbers are measured; whether the performance feels
   like her singing can only be judged at speed.

Against the bar ("no glitchy mouths or faces… nothing obviously AI-generated"): the sync passes; the look is close but
I cannot call items 1–3 safely above the bar, and the current non-singing shot has none of those risks. So the
current shot stays and the choice is Jade's. If she picks the sung version: paste the block, add nothing else
(`LS3c/take_7m`'s roto folder is ready; do not re-run `roto_prep.py` on it alone, run `tools/ls_sung_prep.py
LS3c/take_7`), `node tools/lint_shots.mjs`.

## 7. Spend
`.venv/bin/python tools/vgen_rev2_ls.py spend` → **$2.53 of $15** (list-price estimates in `media/gen/spend.jsonl`,
tagged `agent: rev2_ls`): 11 p-video-avatar takes at $0.125 = $1.375, one Seedance 2.5 720p 5 s take $1.156. Never more
than 2 in flight. No codex jobs, no image generation, no new outside service.

## 8. Files added (nothing existing was edited)
- `tools/vgen_rev2_ls.py` (submits/collects these takes), `tools/sync/phones_LS3.json`, `tools/sync/viseme_check.py`,
  `tools/ls_mouth_treat.py`, `tools/ls_sung_prep.py`, `tools/ls_keep_region.py` (only for the dropped `--keep` path).
- `media/keyframes/jade/J_LS3_close.png`: a native-pixel crop of `J_LS3.png` (x 386, y 60, 1286×724), not a new painting;
  `J_LS3.png` itself is untouched, so no roto folder is invalidated.
- `media/gen/LS3/take_15–19`, `media/gen/LS3c/take_1–7` with sidecars and verdicts; treated copies `*m`; roto folders
  `LS3/roto/take_15`, `take_17m`, `LS3c/roto/take_2m`, `take_5m`, `take_7m`.
- `render/out/rev2_ls/`: clips, frames, sheets, `takes/<take>/` evidence, `render_alt.mjs`, `make_alt.py`,
  `block_4.3_sung.js`, `04_hook.sung.js`, `sheet.py`, `audio/` (stem analysis).

## Status
Complete. 4.3 left as it was; best attempt delivered as clips; decision open for Jade.
