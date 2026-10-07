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

`--encode` muxes the original `inputs/moongazing.mp3`, trimmed sample-exactly from the first frame's time and encoded as AAC 320k. The audio is never altered otherwise. Frame files are named by their global frame index (`round(t*24)`), so ranges can be re-rendered and resumed independently.

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

Each file exports `range` and a default `shots(B, X, L)`:
- `B` is the beat grid: `B.bar(n, beat)` gives exact beat times.
- `X` is the asset registry: `X.has('K_7.B3')` returns false until the keyframe lands in `media/keyframes/`. The registry is read live at boot, so a newly delivered keyframe replaces its placeholder on the next render.
- `L` holds the lyric lines with word and character onsets, taken from `analysis/lyrics_timing.json`.

**Ownership rule:** one agent owns one section file. Keep every shot inside your section's `range`, and start and end your section exactly on its boundaries. Shared vocabulary lives in `sections/_lib.js`:
- `kf`, `ph`, `card`, `calli`, `lyricEN`, `lyricZH`, `hud`, `panel`
- `ACCENTS`: the legal non-beat cut points

Change `_lib.js` or the scenes only in coordination.

**Lint:** `tools/lint_shots.mjs` imports the sections in Node. Section files must not touch browser globals at import time. It checks:
- full coverage from 0 to 212.0 with no gaps and no overlaps
- every shot inside its section's range
- unique shot IDs and known scene and paper names
- every cut within ±1 frame of a beat, a downbeat, a listed accent, or a lyric line or word onset; shots flagged `grid: 'half'`, the interlude stabs, may also cut on half-beats

It lists the shots still on placeholders.

**Type rules:**
- Lyrics are revealed on the sung onsets: words for English, characters for Chinese.
- Lyrics never cover faces. Place them in the frame's 留白 and use `panel` when the ground is busy.
- Verse 1 is in inscription mode. Verse 2 is bigger. The hook is huge. The breakdown is white-on-black rubbing.
- The drop uses HUD and data type only.
- The outro closes on the 海上生明月 inscription.

## Assets

- **Keyframes:** `media/keyframes/` and `media/keyframes/jade/`, read live and loaded lazily into a texture LRU.
- **Identity:** `media/chars/identity/` (the 望月 and 廣寒 seals and the emblem).
- **Fonts:** `fonts/`, OFL.
- **Moon:** `assets/moon/`, NASA SVS 4720, public domain.
