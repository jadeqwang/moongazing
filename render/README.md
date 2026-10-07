# 望明月 · Moongazing — renderer

A deterministic JS renderer: `window.renderAt(t)` draws song time `t` (seconds) on a WebGL2 canvas. It uses seeded noise only, with no `Math.random` and no clock, so any frame can be rendered in any order by any worker. It is driven headless by Chrome with SwiftShader.

```
node tools/lint_shots.mjs                       # check the shot table (run after every edit)
node tools/render.mjs --stills 2.84,120 --scale 1
node tools/render.mjs --sheet --from 0 --to 212 --step 2 --out out/animatic_sheet.jpg
node tools/render.mjs --frames 0-212 --workers 8 --framedir out/frames_animatic_540 [--resume] [--scale 0.5]
node tools/render.mjs --encode 0-212 --framedir out/frames_animatic_540 --out out/animatic_540p.mp4
node tools/serve.mjs                            # http://127.0.0.1:8765/index.html?scale=0.5&play=1&debug=1
```

`--encode` muxes the film's audio, trimmed sample-exactly from the first frame's time and encoded as AAC 320k. The audio is never altered otherwise. Which file that is comes from `data/audio.json`, written by `node tools/audio_info.mjs`: the master `media/audio/moongazing_master.wav` (or `.mp3`) when it exists, else the original `inputs/moongazing.mp3` (212.0 s). Run `audio_info.mjs` again when the master lands. The credits section stretches to the new duration, and the lint follows. Frame files are named by their global frame index (`round(t*24)`), so ranges can be re-rendered and resumed independently.

## Layer model (per frame)

1. **Paper:** `xuan`, `silk`, `silknight`, `indigo` or `rubbing`. All papers share one fibre tile, so ink wicks along the fibres you can see.
2. **Scene layers:** shader passes and Canvas2D layers composited as ink (multiply), over, gold or screen.
3. **Stylisation:** done inside each composite. Keyframes are taken onto our paper: `native`, `silk`, `ink`, `gold` or `rubbing` grades.
4. **Typography:**
   - `type.js`: calligraphy reveal, cards, HUD.
   - `seal.js`: procedural and image seals with the stamp animation.
5. **Post:** taiko ink-flash, paper deflection and bump, breath-opening, vignette, and grain that stays fixed within a shot.

## Shot table = sections

`src/sections/NN_*.js`, one file per song section:

| File | Section | Range (s) |
|---|---|---|
| `00_intro` | cold open | 0–15.67 |
| `01_intro_b` | intro B | 15.67–32.42 |
| `02_verse1` | verse 1 | –46.82 |
| `03_verse2` | verse 2 | –76.11 |
| `04_hook` | hook | –101.33 |
| `05_interlude` | interlude | –111.95 |
| `06_breakdown` | breakdown | –122.77 |
| `07_drop` | drop | –189.86 |
| `08_outro` | outro | –212 |
| `09_credits` | dedication and colophon (engine owner) | 212 → end of the audio (at least 11 s) |

Each file exports `range` and a default `shots(B, X, L)`:
- `B` is the beat grid: `B.bar(n, beat)` gives exact beat times.
- `X` is the asset registry: `X.has('K_7.B3')` returns false until the keyframe lands in `media/keyframes/`. The registry is read live at boot, so a newly delivered keyframe replaces its placeholder on the next render.
- `L` holds the lyric lines with word and character onsets, taken from `analysis/lyrics_timing.json`.

**Ownership rule:** one agent owns one section file. Keep every shot inside your section's `range`, and start and end your section exactly on its boundaries. Shared vocabulary lives in `sections/_lib.js`:
- `kf`, `ph`, `card`, `calli`, `lyricEN`, `lyricZH`, `hud`, `panel`
- `ACCENTS`: the legal non-beat cut points

Change `_lib.js` or the scenes only in coordination.

**Lint:** `tools/lint_shots.mjs` imports the sections in Node. Section files must not touch browser globals at import time. It checks:
- full coverage from 0 to the end of the last section (the end of the audio) with no gaps and no overlaps
- every shot inside its section's range
- unique shot IDs and known scene and paper names
- every cut within ±1 frame of a beat, a downbeat, a listed accent, or a lyric line or word onset; shots flagged `grid: 'half'`, the interlude stabs, may also cut on half-beats

It lists the shots still on placeholders.

Use 5–6 workers. At 10 or more, SwiftShader pages run short of memory, images fail to decode and 2D layers can silently drop out of a frame, so `render.mjs` caps workers at 6 unless you pass `--force-workers`.

`--frames` keeps going if a frame fails (for example a browser crash or a broken shader mid-edit). It reports the frames that failed and exits non-zero; rerun with `--resume` to fill them in.

**Type rules:**
- Lyrics are revealed on the sung onsets: words for English, characters for Chinese.
- Lyrics never cover faces. Place them in the frame's 留白 and use `panel` when the ground is busy.
- **One focal point per shot.** Lyrics and HUD never compete with the subject. In busy frames, guide the eye with the slow push (`from`/`to`) and a focal vignette: set `focus: [x, y]` on the shot (optional `vignette`, default 0.32).
- Verse 1 is in inscription mode. Verse 2 is bigger. The hook is huge. The breakdown is white-on-black rubbing.
- The drop uses HUD and data type only.
- The outro closes on the 海上生明月 inscription.

## Assets

- **Keyframes:** `media/keyframes/` and `media/keyframes/jade/`, read live and loaded lazily into a texture LRU.
- **Identity:** `media/chars/identity/` (the 望月 and 廣寒 seals and the emblem).
- **Fonts:** `fonts/`, OFL.
- **Moon:** `assets/moon/`, NASA SVS 4720, public domain.

## Roto: redrawing generated clips (`src/roto/`)

Generated video (Seedance / MiniMax) is only a **motion base**. Viewers see our drawing of it, never its pixels.

```
MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python   # cv2-contrib + mediapipe
$MPY ../tools/roto_prep.py LS2/take_7 K_5.1/take_1     # analyse -> media/gen/<shot>/roto/<take>/
../.venv/bin/python ../tools/sync/mouth_track.py      # vocal stem -> data/mouth.json (re-mouthing)
bash tools/roto_tests.sh [K_5.1 LS2 ...]              # test renders + before/after -> out/roto_tests/<name>/
```

In a section file: `{ type: 'roto', clip: 'K_5.1/take_1', paper: 'ink', lag: 0 }`. For lip-sync, use
`{ type: 'roto', clip: 'LS2/take_7', ref_t0: 53.79, lag: -0.102, lock: 0.25 }` with `ref_t0` and `lag` from
`media/gen/<LS>/sync.json`. Other parameters are listed at the top of `src/roto/index.js`.

**Prep** (`tools/roto_prep.py`, offline and deterministic):
- extracts the 24 fps frames;
- registers the painted keyframe onto frame 0, falling back to frame 0 if the keyframe was redone after the take;
- tracks the camera;
- builds the motion union and a per-drawing subject matte, region-filled so a subject is redrawn whole;
- builds flow-stabilised colour guides and even-width line guides;
- picks a palette from the keyframe, its moving region and the skin;
- for faces: sparse face lines, the keyframe's painted eyes, brows and nose carried by the head's motion, and the
  take's own mouth painted out.

**Render** (`src/roto/shader.js` and `mouth.js`):
- static regions show the keyframe painting on our paper;
- subjects are redrawn on twos;
- the first `lock` seconds dissolve from the keyframe;
- lips are drawn from the vocal stem at song time.

| Paper | Redraw |
|---|---|
| silk | palette-snapped flat fills, 分染 edge shading, mineral granulation, iron-wire ink line |
| ink | luminance-matched washes in the keyframe's own sumi, wet rims, clumped granulation, 留白, 飞白 dry-brush contour; Earth keeps its colour |
| gold | source light re-laid as matte 泥金 on indigo (luminance-matched), emboss; glow only in `07_drop` |

## State at end of day Oct 7

**Wired, lint clean.** The film runs 115 shots over 0–221.04 s on the master audio (`data/audio.json`), with no placeholders.
- These picks are roto-prepped (`tools/roto_prep.py`) and used through `X.pick()`:
  - LS1 take_24: 2.3 now runs the whole line with no cutaway, and the take's own mouth is kept (prepped with `remouth=False`; faces were tracked in only 13 of 193 frames).
  - J_3.1 take_2 and J_3.2 take_1.
  - J_3.7 take_9 and J_3.7_close take_6.
  - K_7.B1 take_3 and K_7.B1_close take_2 (ink).
- A pick is used only if its `media/gen/<key>/roto/<take>/` exists and is newer than the keyframe. Otherwise the shot falls back to the painted still with parallax.
- `out/fullcut_v3_540p.mp4` and `out/fullcut_v3_sheet.jpg` were rendered from this state before the stop.

**Pending.** For any new pick: prep it, then `node tools/lint_shots.mjs`.
```
MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
$MPY tools/roto_prep.py <KEY>/<take>
```
- Run these from the repo root.
- For a 3/4-profile lip-sync take, prep with `remouth=False` (call `roto_prep.prep(..., remouth=False)`).

**Render commands.** Run from `render/`. Use at most 6 workers; the renderer caps it at 6.
```
node tools/audio_info.mjs && node tools/lint_shots.mjs
# 540p review
node tools/render.mjs --frames 0-221.04 --workers 6 --scale 0.5 --framedir out/frames_fullcut_540
node tools/render.mjs --encode 0-221.04 --scale 0.5 --framedir out/frames_fullcut_540 --out out/fullcut_v3_540p.mp4
node tools/render.mjs --sheet --from 0 --to 221.04 --step 2 --cols 10 --thumb 320 --out out/fullcut_v3_sheet.jpg
# 1080p final (about 4× the time; PNG frames are lossless)
node tools/render.mjs --frames 0-221.04 --workers 6 --scale 1 --format png --framedir out/frames_final_1080
node tools/render.mjs --encode 0-221.04 --scale 1 --format png --framedir out/frames_final_1080 --crf 14 --out out/moongazing_final_1080p.mp4
```
If any frames fail, rerun the `--frames` step with `--resume`.
