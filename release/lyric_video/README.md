# 望明月 · Moongazing lyric videos

Outputs are in `render/out/lyric_video/` and are never committed:

- `Moongazing_lyric_video.mp4`: full, untouched master audio.
- `Moongazing_lyric_video_karaoke.mp4`: lead removed from lyric phrases and their held/ad-lib tails; original wordless passages retained.
- `Moongazing_karaoke_audio.wav`: 48 kHz stereo, 24-bit, 216.000 seconds.
- `Moongazing_karaoke_audio_nohumming.wav`: lead removed throughout; audio-only alternative, same WAV format.
- `bg_1080.png`, `lyrics.ass`, `karaoke.ass`, `sheet.jpg`, `pinyin_check.jpg`, `spacing_check.jpg`, verification frames, JSON measurements, and `job.log`.

## Rebuild

Run from the repository root. Keep every generated file, cache, model and intermediate under `render/out/lyric_video/`. No step edits the live renderer, shared tools, media or git metadata. Scripts are limited to this directory. Use the existing `.venv/bin/python`; dependencies and their versions are recorded in `render/out/lyric_video/environment_versions.json`.

```bash
nice -n 10 .venv/bin/python -B release/lyric_video/setup.py
nice -n 10 .venv/bin/python -B release/lyric_video/background.py
nice -n 10 render/out/lyric_video/venv/bin/python -B release/lyric_video/separate.py --download
nice -n 10 render/out/lyric_video/venv/bin/python -B release/lyric_video/separate.py
nice -n 10 .venv/bin/python -B release/lyric_video/audio.py
nice -n 10 .venv/bin/python -B release/lyric_video/lyrics.py
nice -n 10 .venv/bin/python -B release/lyric_video/review.py
nice -n 10 .venv/bin/python -B release/lyric_video/fix_checks.py
nice -n 10 .venv/bin/python -B release/lyric_video/verify.py --preflight
nice -n 10 .venv/bin/python -B release/lyric_video/encode.py
nice -n 10 .venv/bin/python -B release/lyric_video/verify.py
nice -n 10 .venv/bin/python -B release/lyric_video/fix_checks.py --encoded
```

Review the contact sheet and native-resolution frames after verification. Only then append `LYRIC_DONE` as one unadorned line to the log. On an unrecoverable failure, append `LYRIC_FAILED: reason` instead.

For a visual-only correction, run `nice -n 10 .venv/bin/python -B release/lyric_video/rebuild_visuals.py`. This retains the existing background and WAVs, records WAV hashes, regenerates subtitles and review evidence, runs the encoded fill preflight, encodes both videos sequentially, and reruns verification. `fix_checks.py --encoded` checks audio hashes against `fix_audio_hashes.json`. After viewing the final evidence, append `LYRIC_FIX_DONE` (or `LYRIC_FIX_FAILED: reason`) to the log. No separation or audio assembly is repeated.

The background script uses `git archive HEAD render`, changes only the archived entry point, and renders one still through the committed paper/inkmoon shaders. Ignored fonts are copied in and node_modules/media/analysis/inputs are linked read-only. It uses one Chrome worker and deletes its archive afterwards. The original plate was rendered from commit `a8755e1919a4f515778cc6486fbf8175d624b037` (the full commit is recorded in `job.log`). Moon centre is (1401.6,313.2), with diameter 324 px. No frame-compositing fallback was used. In the managed sandbox, the local rendering server/Chrome and GPU inference require execution approval outside the sandbox.

The supplied ffmpeg has libass. `verify.py` expects `render/out/lyric_video/ffprobe`; the matching static probe was extracted from [John Van Sickle's static ffmpeg release](https://johnvansickle.com/ffmpeg/). A rebuild on another machine can copy its installed ffprobe there. Encoders run sequentially, with six ffmpeg codec/filter threads, H.264 High, CRF 16, preset slow, yuv420p, BT.709 conversion and tags, 24 fps, AAC-LC 320 kb/s, 48 kHz stereo, and faststart.

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
