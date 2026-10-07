# 望明月 Moongazing — subtitles

| File | Contents | Use for |
|---|---|---|
| `moongazing.zh-en.srt` | Bilingual. Each cue shows the original on line 1 and the translation on line 2 (Chinese lines get English, English lines get Chinese) | X, YouTube "bilingual" track, burn-in |
| `moongazing.zh-en.vtt` | The same cues as WebVTT | web players, Vimeo |
| `moongazing.en.srt` | English only (sung English and translations of the Chinese lines) | YouTube English track |
| `moongazing.zh.srt` | Simplified Chinese only | YouTube Chinese track |

What the files cover:
- the four story cards in the cold open (0:05.9 to 0:21.3)
- every sung line (0:32 to 2:02.9). The humming, vocalise and ad-libs get no cues.
- the closing inscription 海上生明月，天涯共此时 (张九龄《望月怀远》), from 3:22.0
- the credits dedication, from 3:30.1 to the end of the audio (3:34.0)

On-screen text (the cards, the inscription and the dedication) is in *italics*. Sung lines are in plain text.

Timing details:
- Times are song seconds, and video t=0 is song t=0 because the render muxes the song from frame 0.
- Sung lines come from `analysis/lyrics_timing.json`.
- Card times come from `render/src/sections/00_intro.js`, `01_intro_b.js` and `08_outro.js`.
- Cues are at most 2 lines, English lines are at most 42 characters, every cue lasts at least 1.2 s and there are no overlaps.
- In the bilingual file, long cards are split into two timed cues so that each cue still fits in 2 lines.

To regenerate the files after a re-time or a translation edit, run `python3 release/subs/make_subs.py`. The script checks all of the rules above. The end time is read from `media/audio/moongazing_master.wav` when that file exists. Otherwise the script uses 214.0 s.

## YouTube

1. Go to YouTube Studio, open the video, then **Subtitles**. Set the video language to **English**. If asked for a caption language, pick **English** too.
2. Click **Add language** and choose **English**. Under Subtitles, click **Add**, then **Upload file**, then **With timing**, and select `moongazing.en.srt`. Click **Publish**.
3. Click **Add language** again and choose **Chinese (Simplified)**. Upload `moongazing.zh.srt` the same way.
4. For a bilingual track (optional), YouTube allows only one track per language. You have two choices:
   - Upload `moongazing.zh-en.srt` as **Chinese (Simplified)** in place of `zh.srt`. This works well because most Chinese-speaking viewers also like seeing the English.
   - Or add it under a separate language entry such as **Chinese (Traditional)**. Do this only if you will not publish a real Traditional track.
5. After publishing, check the 0:05 to 0:21 cards and the 1:52 breakdown in the player. Make sure the Chinese characters render and the line breaks look right.

YouTube accepts UTF-8 SRT and VTT, and it honours `<i>`.

## X (Twitter)

X supports one caption file per video, and it must be an SRT.

1. On x.com, in the web composer, attach the video. Open the video's edit options and look for the captions upload (the label varies). Upload the .srt there.
2. Choose `moongazing.zh-en.srt` and set the language to **English** (or Chinese). The bilingual file serves both audiences in one track.
3. Post. Caption upload has historically been available only on the web, not in the mobile apps. If you have X Media Studio, you can also add them under **Library**, then the video, then **Subtitles**.

Some X clients do not show captions until the viewer turns them on, and autoplay is muted. For a feed post where the words matter, use the burned-in version below.

## Burn-in (optional)

For a version with hard-coded bilingual subtitles (needs a CJK font installed, e.g. Noto Sans CJK SC):

```sh
ffmpeg -i moongazing.mp4 -vf "subtitles=release/subs/moongazing.zh-en.srt:force_style='FontName=Noto Sans CJK SC,FontSize=20,Outline=1,Shadow=0,MarginV=36'" -c:a copy moongazing.subbed.mp4
```

## Translation notes

- The Li Bai lines use their standard renderings:
  - 《月下独酌》 "I raise my cup to invite the bright moon; / with my shadow, we make three." This matches the on-screen gloss in 03_verse2.js.
  - 《静夜思》 "I raise my head to gaze at the bright moon / I lower my head and think of home."
- In the English verse, "and late / in afternoon teahouses" means *late afternoon*. The Chinese carries this as 午后将晚.
- 雪水烹茶 echoes the classical 扫雪烹茶 (brewing tea with snow water).
- 回不了家 matches the calligraphy on screen in shot 0.4.
