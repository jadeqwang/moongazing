# 望明月 Moongazing: Identity (agency emblem and seals)

*Identity pass, 2026-10-07. Everything is procedural: `tools/seal.py`, about $0 in model calls. Outputs are in
`media/chars/identity/`, and the review board is `media/chars/identity/IDENTITY_BOARD.jpg`.*

This pass splits one mark into two systems that never mix:

1. **The agency emblem.** It belongs to the fictional Earth-wide space agency and goes on suits, polos, rovers and the
   HUD. It uses **no red**.
2. **The vermilion seals (印).** They are traditional carved-character chops and they belong to the film:
   - 廣寒 is the station's seal.
   - 望月 is the film's signature seal.

   They use **only characters**, with no dot or other symbol.

## 1. Why the old mark is retired

The old `seal_dot` was a vermilion square with one pale-blue dot in the centre. Morphologically it is the **Hinomaru**:
- **Shape.** One disc sits dead-centre in a plain rectilinear field. That is the whole of the Japanese flag's grammar.
  Inverting figure and ground (a light disc on red rather than a red disc on white) does not break the read.
- **Colour.** Red and white are the Hinomaru's two colours. On a white EVA suit, a red square with a centred disc sits
  exactly where a national flag patch goes, so viewers read it as a flag.
- **Who it would misrepresent.** The crew includes Kenji Mori (Japan), and the agency is meant to be Earth-wide. A mark
  that reads as one nation's flag says the opposite of the film's point, in the one place (the suit patch) where
  audiences expect flags.
- **Double duty.** The same vermilion square was also the film's seal, so the agency's identity and the film's
  Chinese-painting signature were the same object. Splitting them lets each do one job.

## 2. The agency emblem: a quote of the Pale Blue Dot

**Source.** On 14 February 1990, at Carl Sagan's request, Voyager 1 turned back from about 6 billion km and photographed
Earth for the "Family Portrait". In the narrow-angle frame, Earth is a fraction of a pixel. Because the camera was
pointed only a few degrees from the Sun, scattered sunlight in the optics laid long **bands of light** across the frame,
and Earth happens to sit **inside one of those bands**. The emblem quotes that exact image:

- a tiny pale-blue dot (#A9C8E6), **off-centre**,
- inside a slanted band of scattered sunlight,
- on deep space indigo (#16213E, the GOLD paper's 磁青).

The light is a matte gold wash (#8A7550 core, #5A5446 fainter rays), the same pigment family as the GOLD paper's
泥金. The rim is gold (#D4B170).

**What it says.** Everyone the crew misses is on that dot. That is the 7.C4 beat in one mark, and the reason a mark
with no nation in it suits an agency with eight nations in it.

### Variants (all `.svg` vector plus `.png` 2048 px with a transparent background)

| File | Design | Verdict |
|---|---|---|
| `emblem_v1_sunbeam` | Round patch, one tapered band (core plus halo), the dot in the band | Clean, but it reads a little as a diagonal sash |
| `emblem_v2_rays` | Tall rectangular "photo" frame with three rays of unequal width, like the actual Voyager frame | The most literal quote. The rectangle is not patch-shaped, so it is kept for titles and HUD cards |
| `emblem_v3_orbit` | v1 plus a thin lunar-orbit hairline around the dot, with the Moon as a gold speck | Adds "and the Moon", but the large ring starts to read as a target |
| **`emblem_final`** | v1, plus one faint secondary ray (the photo's multiple bands), a smaller and quieter orbit hairline with the Moon speck at upper right, and a dot of r = 0.07 R | **Canonical** for anything at 64 px or larger |
| **`emblem_final_small`** | Patch-size cut: no hairline, no faint ray, a wider band, a bigger dot with a dark indigo knockout ring, a thicker rim | **Use at 64 px or smaller** (suit and polo patches, rover flank, HUD icons) |

**Size test.** The board's middle row shows real pixel renders.
- `emblem_final_small` still reads as "dot in a beam" at 24 px.
- At 16 px it is a dark disc with a light slash and a speck, which is still the right idea.
- The full `emblem_final` loses its dot below about 48 px, which is why the small cut exists.

**Rules**
- No red anywhere in the emblem, and never put the emblem inside a vermilion square.
- Keep the dot off-centre and inside the band; never centre it.
- No letters or acronym. The agency has no written name on screen.
- Image models garble small marks. In generated frames, the patch is described as "a small round deep-indigo patch with
  a thin gold rim, a slanted pale-gold band and a tiny pale-blue dot". Composite the real PNG or SVG in post wherever
  the patch is legible.

**How the patch gets into a shot (`tools/emblem_patch.py`, placements in `tools/emblem_patch.json`).** The tool
composites `emblem_final_small.png` into the painted keyframe (lit and creased by the cloth under it; the old keyframe
is kept as `_vN`) and, for a shot with a roto take, tracks the cloth around it and writes a carried patch into the
take's roto folder (`pkey.jpg`, `pmask.png`, `meta.json["patch"]`). The roto shader then shows the painted emblem on
the chest's own motion and hides it where the take shows something in front. Up to 8 per clip, no section-file edit.
Re-run the tool after `tools/roto_prep.py` is re-run on a listed take, and add an entry for any new keyframe with a
visible chest patch.

### Alternatives considered for the emblem

| Alternative | Why it was rejected |
|---|---|
| Keep the vermilion seal and move the dot off-centre | Still a red national-looking patch, and it still merges the agency with the film's seal |
| A full "Blue Marble" Earth disc | NASA cliché, and a lone centred disc again |
| A jade rabbit or 玉兔 mark | Lovely, but Chinese-specific for an Earth-wide agency. The rabbit lives on the rovers instead |
| Crescent plus dot | Reads as the crescent-and-star flags and as religious symbolism |
| Laurel or olive wreath around a globe | Reads as the United Nations |
| Ring or orbit-led marks | Read as an atom, a target or a NASA "meatball" (v3 shows the risk) |
| An exact photo crop (v2 frame) | The most faithful quote, but the rectangle is wrong for a shoulder patch. Kept as an alternative for titles |

## 3. The vermilion seals (carved characters only)

| File | Characters | Style | Use |
|---|---|---|---|
| `seal_guanghan.{png,svg}` | 廣寒 (廣 right, 寒 left) | 白文 (characters carved out of a red block), square | Station seal: 3.5 assignment letter, 5.2 site stamp |
| `seal_guanghan_tall.{png,svg}` | 廣寒 stacked | 白文, tall (長方印) | Vertical inscriptions, the 5.2 jiehua plan margin |
| **`seal_wangyue.{png,svg}`** | 望月 (望 right, 月 left) | **朱文** (red strokes, thin border; 元朱文 manner) | **The film's signature seal**: 1.7 title stamp, 7.E3 next to the pale-blue pixel, 8.5 final stamp |
| `seal_wangyue_baiwen.{png,svg}` | 望月 | 白文 | Alternative, for heavier impact on dark grounds |
| `seal_wangmingyue.{png,svg}` | 望明月 (望 right column, 明 over 月 left) | 朱文 | Alternative: the full title in three characters |

`render/src/main.js` already picks up the first `media/chars/identity/*望月|wangyue*.png`. That is
`seal_wangyue.png`, the 朱文 final.

### Why 朱文 for the film, 白文 for the station
- **Film seal (朱文).** Thin, even, red seal-script strokes in a fine border, in the 元朱文 tradition (Zhao Mengfu
  onward). This is the scholar's or collector's seal you find on handscrolls. It is light on the paper and does not
  compete with the painting. The film is a handscroll, so its signature is a collector's 朱文 seal.
- **Station seal (白文).** A solid red block with the characters carved out. It is weightier and more official, the
  manner of Han official seals, which suits a place name stamped onto a site plan.

### Glyphs: no font licence at all

- **The problem.** The old seal used 字悦九叠印篆, which is non-commercial.
- **The search.** I looked for an OFL or open seal-script font and found **none suitable**:
  - Google Fonts and the OFL CJK families (Noto, LXGW WenKai, Zhuque Fangsong, Ma Shan Zheng, Zhi Mang Xing) contain no
    篆书.
  - The seal-script fonts I found are commercial (方正小篆, 汉仪篆书) or personal-use only.
  - BabelStone's OFL "seal" fonts are Khitan, not Chinese.
- **What I used instead.** The glyphs come from **public-domain Shuowen small-seal (說文小篆) SVGs on Wikimedia Commons**
  (Ancient Chinese Characters Project): `廣-seal.svg`, `寒-seal.svg`, `望-seal.svg`, `月-seal.svg`, all marked "Public
  domain" on Commons. Copies are in `media/chars/identity/src/`.
- **How they are processed.** `tools/seal_skeleton.py` (a one-off script needing scikit-image, run from a scratch venv)
  rasterises each glyph, skeletonises it and traces the centre-lines. The result is `tools/seal_glyphs.json`.
  `tools/seal.py` then:
  - re-strokes the centre-lines at one even weight (the 玉箸篆 "jade-chopstick" line of small seal);
  - swells them toward the cell edges (印化, push exponent 0.9);
  - carves them into the stone with the existing erosion and chipping texture.
- **What the forms are.** These are real character forms, not model inventions: 望 is the Shuowen 亡 + 月 + 𡈼 form, and
  月 keeps its long seal-script tail.
- **明.** The Commons 明 (the 朙 form) traced badly, so `seal.py` composes 明 as 日 + 月, a form common on Han seals.
  It appears only in the 望明月 alternative.
- **Alternatives considered for the glyphs.**
  - License 字悦九叠印篆. Possible, but it ties release to a licence negotiation.
  - Hand-construct 缪篆 from scratch. Rejected: high risk of a wrong stroke that any Chinese-reading viewer would see.
  - Ask an image model. Never: every model invents glyphs inside seals (see `docs/style_guide.md`).
- **Before release:** have a seal-carving or 篆刻 reader check 廣, 寒 and 望 for stroke order and component spacing. The
  forms are canonical, but the 印化 stretch is mine.

The legacy files (`media/chars/seal/seal_dot.*`, `seal_guanghan*.*` in 九叠篆, and the non-commercial font) are kept for
reference only and are **retired**.

## 4. Regenerate

```bash
.venv/bin/python tools/seal.py      # emblems (svg+png), seals (png+svg), IDENTITY_BOARD.jpg -> media/chars/identity/
```
