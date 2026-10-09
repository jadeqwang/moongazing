# 望明月 · Moongazing lyric videos

The default recording is now the two-semitones-lower master. Its outputs go to **`render/out/lyric_video_2down/`**. The original Oct 8 outputs in `render/out/lyric_video/` are retained unchanged. Generated media are never committed.

- `Moongazing_lyric_video.mp4`: untouched selected master audio.
- `Moongazing_lyric_video_karaoke.mp4`: lead removed during sung phrases and their held/ad-lib tails; wordless passages remain original samples.
- `Moongazing_karaoke_audio.wav`: 48 kHz stereo, 24-bit; 210.860 seconds for the new recording.
- `Moongazing_karaoke_audio_nohumming.wav`: lead removed throughout, including humming; audio-only alternative in the same WAV format.
- `bg_1080.png`, `lyrics.ass`, `karaoke.ass`, `sheet.jpg`, native pinyin/spacing crops, verification frames, measurements, `BUILD_REPORT.json`, and `job.log`.

## Rebuild

Run from the repository root with the existing `.venv/bin/python`. Every script accepts `--recording 2down` (default) or `--recording original`; child stages inherit this choice. The selected recording determines the master, timing JSON, beatgrid, vocal comparison stem, duration and output directory. The original option uses `analysis/v1/` timings and the original 216-second master. Selecting it deliberately rebuilds the old outputs.

```bash
nice -n 10 .venv/bin/python -B release/lyric_video/build.py
# After completed CPU separation, to repeat assembly/layout/encodes/checks:
nice -n 10 .venv/bin/python -B release/lyric_video/build.py --reuse-separation
# Rebuild the original recording instead:
nice -n 10 .venv/bin/python -B release/lyric_video/build.py --recording original
```

`build.py` runs setup, plate reuse, CPU separation, audio assembly, subtitles, reviews, spacing/pinyin checks, encoded-fill preflight, both encodes and final verification. `--reuse-separation` checks the selected master hash and CPU separation metadata. Build stages keep logs in the selected output directory. After successful automated checks, inspect `sheet.jpg`, `fix_checks/native_*.jpg`, `fix_checks/pinyin_A.jpg`, `fix_checks/pinyin_B.jpg`, and `spacing_check.jpg`. After that visual review, run `.venv/bin/python -B release/lyric_video/complete.py --reviewed` (add `--recording original` for the original). It writes the final report, appends both MP4 paths and byte sizes as `LYRIC_OUTPUT:` lines to `render/out/retime/jobs.log`, then appends `LYRIC_DONE`. A failed build records `LYRIC_FAILED: reason`.

Individual stages remain available. Run `setup.py`, `background.py`, the selected output directory's `venv/bin/python -B release/lyric_video/separate.py`, then `audio.py`, `lyrics.py`, `review.py`, `fix_checks.py`, `verify.py --preflight`, `encode.py`, `verify.py`, and `fix_checks.py --encoded`. All other stages use `.venv/bin/python -B`. `encode.py --kind A` or `--kind B` encodes just the full-vocal or karaoke variant. `verify.py --audio-only` runs independent PCM checks without a video encode.

For a visual-only correction, `nice -n 10 .venv/bin/python -B release/lyric_video/rebuild_visuals.py` retains the plate and WAVs, records audio hashes, rebuilds subtitle/review evidence, encodes both variants and reruns verification. Add `--recording original` for the old recording. Review the evidence before logging `LYRIC_FIX_DONE` or `LYRIC_FIX_FAILED: reason`.

All execution is CPU-only inside the sandbox. `separate.py` explicitly sets `torch.device('cpu')`, disables autocast and keeps four CPU threads. It uses the same cached **MelBand RoFormer karaoke lead-only model**, `mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956.ckpt`, with native 44.1 kHz, eight-second chunks, overlap 4 and batch 1. The supplied BS-RoFormer stems separate all vocals; they are used for the backing-vocal energy comparison and for wordless removal in the audio-only no-humming alternate. They do not replace the lead-only model during lyrics. No normalization, gain, EQ or compression is added. Model/config files are copied from the original local cache; no network request is permitted. Missing cache files produce `NEED: <model/file>` in `jobs.log`.

`background.py` copies the previously verified plate and ffprobe byte-for-byte. It runs no git, Chrome or renderer. The original plate was rendered on Oct 8 from commit `a8755e1919a4f515778cc6486fbf8175d624b037`; Moon centre is (1401.6, 313.2), diameter 324 px. Encodes retain the original look and settings: 1920×1080, 24 fps, H.264 High/CRF 16/slow/yuv420p, BT.709 conversion and tags, AAC-LC/320 kb/s/48 kHz/stereo, faststart, sequential six-thread ffmpeg.

For the new recording, audio remains exactly 210.860 seconds. At 24 fps this requires 5,061 frames (video duration 210.875 seconds); verification allows only that final partial-frame difference. Credits occupy the last twelve seconds, 198.860–210.860, and count-ins use the selected beatgrid. Lyric wording, translations, punctuation, L07/L10 splits, font choices and sweep rules remain unchanged.

New-track lyric tails use the new timing metadata: the second “you” ad-lib through 90.740 seconds and the 乡 octave-flip/decay through 121.650 seconds, followed by measured lead decay. Old absolute tail extensions are applied only to the original recording. The new wordless leads at 160.0–171.2 and 176.0–192.0 seconds, intro vocalise, outro humming and final solo hum are preserved sample-for-sample in the main karaoke. The `_nohumming` variant starts with the MelBand lead-removed mix throughout. Because that model barely removes the intro vocalise or final solo hum, the alternate uses BS-RoFormer vocal subtraction during the identified wordless passages, plus the supplied `htdemucs_ft` vocals for the final solo hum (202.790–204.150), which BS-RoFormer also misses. Outro humming includes its faint tail to 198.500 seconds. These substitutions use 100 ms linear crossfades, affect only the alternate WAV, and retain the MelBand lead-only mix during lyrics. No normalization is applied.

Independent verification checks 24-bit WAV duration/format, exact master identity outside lyric splices, exact identity through every protected wordless passage, equality to the no-humming mix during timed lyrics, stem reconstruction, peaks, splice jumps and WAV hashes. It independently checks the alternate's wordless stem subtraction to within one 24-bit sample unit, including all transition edges. It also compares the original output folder's file metadata and deliverable hashes to a pre-build snapshot. Stream/faststart, encoded gold-onset, font selection, spacing and native pinyin checks run again on the final MP4s.

## New recording: final verification (Oct 9)

Both videos decoded cleanly from start to finish and passed final stream and faststart verification: 1920×1080 H.264 High/yuv420p/BT.709, 24 fps, 5,061 frames, 210.875-second video and 210.860-second AAC-LC/48 kHz/stereo audio. All 19 encoded word/character onsets passed, from −4 to +37 ms (within one 41.667 ms frame). The 42-panel final A/B contact sheet, all 34 native lyric-segment crops, 14 pinyin-row crops, English spacing comparisons and dense line transitions were inspected. No overlaps, clipping, tofu or fallback fonts were found. All ten English lines remain pixel-identical to their plain single-run layout.

- `Moongazing_lyric_video.mp4`: 25,619,067 bytes.
- `Moongazing_lyric_video_karaoke.mp4`: 25,620,897 bytes.
- `Moongazing_karaoke_audio.wav`: 60,727,724 bytes.
- `Moongazing_karaoke_audio_nohumming.wav`: 60,727,724 bytes.

Both karaoke WAVs are exactly 210.860 seconds, 48 kHz stereo/24-bit. The main karaoke retains 6,820,992 stereo sample frames exactly outside the lyric splices, including both new wordless leads and all humming. Native reconstruction is below the numerical floor; raw reconstruction error is -82.61 dBFS (-64.05 dB relative to master RMS). The main karaoke peak is 0.672183; no-humming peak is 0.592443. Maximum splice-jump ratios are 0.847 for the main karaoke and 1.232 for the no-humming substitutions, both below 2. Integrated loudness is −15.6 LUFS full-vocal and −16.0 LUFS karaoke; true peaks are −4.4 and −3.5 dBFS respectively.

The original lead-only alternate barely changed the solo hum. The corrected no-humming alternate uses the supplied Demucs vocal estimate there: interval RMS changes from −25.35 to −35.79 dBFS over 202.790–204.150 seconds. The supplied BS-RoFormer estimates remove the other identified wordless passages. These are separator estimates; residual voice or instrumental leakage can remain. Their subtraction was independently checked to within one 24-bit sample unit, and every alternate transition passed the splice check. The main karaoke remains unmodified through those passages.

The original output folder's 1,363 file metadata records and deliverable hashes match the pre-build snapshot. All work used the sandbox and CPU; no model download was needed. See `audio_checks.json`, `independent_audio_checks.json`, `fill_checks.json`, `video_checks.json`, `decode_checks.json`, `spacing_checks.json`, `pinyin_checks.json`, `environment_versions.json`, and `BUILD_REPORT.json` in the new output directory.

## Original recording: Oct 8 measurements and review

The following measurements and visual-review history describe the retained 216-second original exports; they are not measurements of the new recording.

## Audio method and measurements

Separator: [audio-separator](https://github.com/nomadkaraoke/python-audio-separator) **0.47.0**, model **mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956.ckpt**, supplied config with native 44.1 kHz, eight-second chunks, overlap 4, batch 1. Inference used PyTorch 2.6.0+cu124 on the local GPU, four CPU threads, and no autocast. `setup.py` installs the separator package into its own output-directory venv and reuses already installed heavy dependencies read-only through a `.pth`; it never installs into or changes the project venv. No stem normalization, amplification, compression or EQ is applied: the package's normalization function is explicitly disabled in-process. Intermediate stems are float WAVs.

The input was the 48 kHz master WAV. The model operates at 44.1 kHz; its estimated lead is resampled back to 48 kHz and subtracted from the native master. This complementary reconstruction retains the master's native high-frequency content. The raw model lead plus no-lead residual is **−82.94 dB RMS** relative to full scale (**−64.13 dB relative to master RMS**), exceeding the requested −50 dB threshold; the native complementary reconstruction residual is below numerical measurement floor (**−300 dBFS** in the report).

Lyric splices use 100 ms equal-power fades before consonant attacks and after the detected lead decay. Tails wait for ten consecutive 10 ms lead blocks below −48 dBFS, with adjacent phrases merged when their fades would collide. The “you” re-articulation at 90.74–92.12, “wine” falsetto at 98.5–99.7 and the held 乡 octave leap to 124.0 seconds are treated as lyric tails. The wordless intro, drop vocalise/chop, and outro humming remain original samples. Exact splice intervals and every edge-jump check are in `audio_checks.json` and the log.

| Measurement | Result |
|---|---:|
| Master and both karaoke WAV durations | 216.000 s |
| Karaoke PCM identical outside splice regions | Yes; 6,956,784 stereo sample frames |
| Removed lead RMS within timed lyric regions | −25.08 dBFS |
| Original all-vocal stem RMS within those regions | −23.45 dBFS |
| Backing-vocal proxy, all-vocals minus lead | −30.93 dBFS, 17.90% of all-vocal energy |
| Maximum output WAV sample peak | 0.596982, approximately −4.48 dBFS |
| Largest splice jump / neighbourhood 99th percentile | 0.875 |
| Integrated loudness, full song | −15.8 LUFS |
| Integrated loudness, karaoke | −16.1 LUFS |
| True peak, both main WAVs | −4.4 dBFS |

The backing-vocal figure is an energy proxy, not a claim that every remaining component is a backing singer: the comparison stem came from the original MP3, and separation can leave lead leakage or instrumental residue. There is no gain matching or processing of that comparison stem. The full region/splice measurements and ffmpeg ebur128 summaries are retained beside the videos.

## Lyrics and visual verification

The scripts parse the literal `LYRICS` list in `release/subs/make_subs.py`, preserving Jade's strings, punctuation and L07/L10 splits, without executing or modifying that module. Timing comes from `analysis/lyrics_timing.json`, count-ins from `analysis/beatgrid.json`, and credits from the notes file verbatim. The title is 0–5.3 seconds; credits are 204–216 seconds (the final twelve seconds). English lines use 76 px Cormorant Garamond, except the longest line at 73 px to fit; Chinese lines use 84 px Noto Serif SC, with individually centred, tone-marked pinyin. Translations remain unchanged. Near-adjacent lines show a dim preview within 2.5 seconds of their onset and rise as the preceding line lifts/fades away. Whispered tags sit beside the characters so they cannot collide with the next line’s pinyin.

Supplied variable fonts are instantiated at weight 400 into the output directory with unique family names. ASS em sizing is corrected for each font's ascent/descent so layout measurements match rendered text. Cmap checks and actual libass font selection verify supplied fonts for Chinese and accented pinyin. Pinyin is explicitly normalized to NFC, and the actual instantiated roman font is checked for all 24 precomposed tone vowels: ā á ǎ à ē é ě è ī í ǐ ì ō ó ǒ ò ū ú ǔ ù ǖ ǘ ǚ ǜ. See `pinyin_font_check.json`.

The first encoded test showed that ASS `\kf` traverses blank side bearings before touching a glyph. Final sweeps use animated ASS clips over actual ink bounds, with a narrow visible leading edge at the precise onset; pinyin uses the same character phase. Every frame of L01, both halves of L10 and L14b is extracted and retained for an encoded-pixel onset check against the timeline. `fill_checks.json` records every word's first gold frame and timing error. `sheet.jpg` contains labelled midpoints of all 17 lyric segments plus title, humming, count-in and credits for both A and B. `*.ffprobe.json` records complete final stream metadata.

## Double-check by ear

Listen on headphones and speakers for residual lead, especially the softly sung first verse, the whispered breakdown, and the held 乡; make sure desired backing harmonies are still present. Check the “you” ad-lib and “wine” falsetto are removed. Listen across the logged splice boundaries for a brief instrumental swell from the equal-power fades or separator texture changes. Confirm the intro/outro humming and drop vocalise sound exactly like the original. The alternate no-humming WAV lets Jade compare the choice directly. Review musical phrasing against the supplied timeline as its original alignment uncertainty can exceed a video frame even when the rendered fill follows it precisely.

## Visual correction and verification

Native inspection of the original export found two faults: thin Cormorant tone marks appeared to float beside their vowels, and independently positioned English words produced uneven gaps. The earlier contact-sheet review missed these at reduced scale.

The original pinyin was already NFC. Explicit normalization is now enforced nevertheless. Cormorant roman is the first preferred supplied face and its instantiated cmap contains every required vowel, but direct native libass tests still showed the reported visual placement problem. Pinyin therefore uses supplied **Noto Serif Display roman**, instantiated at weight 400, whose cmap also contains all 24 tone vowels and whose native crops show centered marks. Cormorant remains the English lyric face. This is a visual-quality exception to the Cormorant preference, documented rather than treating cmap coverage alone as proof of correct marks. `pinyin_check.jpg` contains unscaled native pinyin-row crops for both halves of L07, both halves of L10, L12, L14a and L14b from each final video; `pinyin_checks.json` records times and NFC syllables. Every row was inspected at 100% scale.

Each English line is now shaped as one complete ASS text run, with `Kerning: yes`, including its original punctuation and exactly one normal space between words. The pale event and every gold overlay reuse that complete string at the same anchor. Gold clips sweep across each word's actual ink box, measured from a native libass raster of the single run; a word is never independently placed. For **all ten English lines**, a plain single event and the karaoke clip path render pixel-identical images: **0 px position difference**, **0 differing pixels**, exceeding the requested 1 px tolerance. `spacing_checks.json` records these comparisons; `spacing_check.jpg` shows L01, L05 and L11 at native scale and was viewed directly.

No audio assembly or separation was repeated. The two karaoke WAV SHA256 hashes were recorded before encoding and checked unchanged afterwards. The original master WAV is read directly for A as before.

## Final verification record

Both corrected MP4s passed ffprobe: exactly 216.000 seconds, 5,184 frames at 24 fps, 1920×1080 H.264 High/yuv420p, BT.709, AAC-LC/48 kHz/stereo, with moov before mdat for faststart. The final 468 extracted frames cover L01, both L10 halves and L14b with padding. All 19 word/character onsets pass: errors range from −4 to +38 ms, within one 41.667 ms frame. The rebuilt 42-panel A/B contact sheet, all 34 native lyric-segment crops, all 14 pinyin-row crops, and the L01/L05/L11 spacing comparisons were viewed after the final encode. Tone marks sit over their vowels; English spacing is uniform. No overlaps, clipped text, tofu or font fallbacks were found. Font-selection checks include the actual supplied Noto Serif Display roman used for pinyin. WAV hashes are unchanged. `fix_checks.json` records the final review and measurements. No isolated archive remains.
