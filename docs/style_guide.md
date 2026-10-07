# 望明月 Moongazing: Style Guide v1 (the "three papers" plus jiehua)

*Output of the style lab, 2026-10-06. 46 generations, about $6.24 at list price. Every frame, its full prompt and its refs
are in `media/stylelab/<scene>/<model>_vN.{jpg,json}`. Raw model outputs are in `.../raw/`. The comparison sheets are
`media/stylelab/SHEET_<scene>.jpg`, and the winners are in `media/stylelab/SHEET_best.jpg`. Note that `media/` is gitignored.*

## GLOBAL RULE: every shot has ONE focal point

*Added 2026-10-07 after feedback on K_7.C4.*

**The rule.** Every frame has exactly one place the eye goes first. Everything else is quieter, simpler, darker or softer,
and it supports that place.
- **No crowds of equal-weight elements.** Do not show eight faces with eight tablets, a row of identical lanterns at
  equal contrast, or every crew member doing the same thing. This is the single biggest tell that a frame is
  AI-generated.

**How to apply it.**
- **Stage people the way they behave.** If someone shows a screen, it is one person turning it toward one or two
  others. Nobody points at the back of their own tablet.
- **Prefer a pair or a trio over a group.** Show "everyone" by cutting between intimate shots (K_7.C4a–d), not by
  packing a frame.
- **Make the focal object readable to the camera.** Use over-the-shoulder from behind or beside the viewer, or have
  the holder tilt it toward a friend with the camera beside that friend. Pair it with **one reaction face**.
- **In prompts, say it outright:** "ONE focal point: …; everything else is quieter, simpler, darker." Then check the
  take: squint, and if two or more things compete, reject it or recompose.
- **Wides are no exception.** Crowd frames (0.5 rooftops, 7.D4 applause) still need a single lit window, a single
  lifted face, or a single figure the rest of the crowd frames.

## Winners at a glance

| Paper | Winner | Model | Runner-up |
|---|---|---|---|
| 绢 Silk | `S1_silk/gpt_v4.jpg` | openai/gpt-image-2.5-sunburst, with Qianli refs | `S1_silk/gpt_v3.jpg` |
| 宣 Xuan / ink | `S2_ink/nbp_v7.jpg` (nbp_v6, then an nbp edit) | google/nano-banana-pro | `S2_ink/comp_v1.jpg` (clean plate nbp_v8 + Earth sprite) |
| 磁青泥金 Indigo & gold | `S3_indigo/nbp_v3.jpg` | google/nano-banana-pro, with the Ming 泥金 ref | `S3_indigo/nbp_v2.jpg` |
| 界画 Jiehua | `S4_jiehua/nbp_v5.jpg` | google/nano-banana-pro, with Yuan Jiang + Xia Gui refs | `S4_jiehua/gpt_v5.jpg` (best engineering, weaker painting) |

## Model verdicts

- **nano-banana-pro**: the house model for **ink, indigo-gold and jiehua**. It has real brush behaviour (splashed ink,
  飞白, wet bleed) and real paper texture, and it is the only model that does parallel-oblique projection. It is also the best
  editor: it fills strips and removes objects while keeping the brushwork. It outputs 2752x1536.
  - **Weaknesses:** it invents glyphs in every seal you ask for, and puts pseudo-letters on rocket bodies, doors and rovers.
    It renders Earth as a NASA photo unless told otherwise. It ignores size instructions in edits: nbp_v5 made Earth *bigger*.
- **gpt-image-2.5-sunburst**: the house model for **silk / 青绿**. It gives the most convincing aged silk, Qianli-style mineral
  rocks and accurate West Lake geography, and it is the only model that honoured "blank seal, no characters" (3 of 3).
  - **Weaknesses:** it turns every lunar or ink prompt into a photograph or engraving. Its max size is 1536x1024, so
    there is no 16:9 and it needs an upscale. Its colour on tech subjects is saturated (blue solar panels).
  - **Edit mode:** good at precise edits of an nbp ink plate (gpt_v4 and gpt_v5), but it leaves ghosts (a double shadow)
    and drops the resolution to 1536.
- **grok-imagine-image-2.0**: **do not use for hero frames.**
  - Silk comes out muddy, with no 青绿 and a three-arch Broken Bridge.
  - The ink frames add a hard white "typography block" when told to leave a third empty.
  - It produces the **kitsch failure mode**: a giant glowing Earth halo, a spot-lit poster astronaut and fake gold glow.
  - It invented seal glyphs both times it drew a seal.
  - It is cheap ($0.05), so it is fine for throwaway layout thumbnails.

**The cinematic test (S2 nbp_v3, gpt_v3, grok_v4):** a "Zhang Yimou / Where Winds Meet anamorphic" prompt gives three different results:

| Model | What happens | Verdict |
|---|---|---|
| nano-banana-pro | Stays ink and gains nothing | Neutral |
| gpt-image-2.5-sunburst | Becomes a generic photographic matte painting | Fails |
| grok-imagine-image-2.0 | Tips straight into a spot-lit movie poster | Kitsch |

Grok v3 also went kitsch without the cinematic prompt. **Verdict: do not use cinematic or epic language.** Get scale
from 留白 and a tiny figure, not from "anamorphic".

## Universal blocks (append to every prompt)

```
RESTRAINT = Museum-grade restraint: matte pigments, real brush texture, flat even lighting like a museum scan of a real
centuries-old painting. Not glossy, not photographic, not 3D, no glow, no bloom, no lens flare, not over-saturated, not cluttered.

NOTEXT = No text, no calligraphy, no writing, no inscriptions, no characters, no signatures, no captions, no border or frame.

REF_PREAMBLE (prepend when refs are attached) = The attached reference images are museum paintings: use them ONLY as a
guide to painting technique, materials, line quality, paper/silk texture and palette. Do not copy their subjects, figures,
buildings, seals or composition.
```

- **Lettering garbage:** with NOTEXT, no model produced calligraphy columns. Glyphs still leak in four places:
  - inside seals (nbp and grok, every time);
  - on rocket bodies (S3 nbp_v1);
  - as tiny marks on doors and rovers (S4 nbp_v5);
  - on the Ming ref's seals, which are why the ref is cropped below them.
- **Seal rule:** ask for **"No seal"** in generation. The vermilion seal (the agency seal: a square with a pale blue dot)
  goes in during the typography pass. Only gpt can be trusted with a blank seal.
- **Typography space:** say *"The whole upper half / upper third is calm empty silk|paper (留白) for later typography."*
  Do **not** say "left third empty". nbp and grok render that as a literal blank paper block (S2 grok_v1, nbp_v6).
  If you need a left-side space, ask for "quiet black sky over a plain ridge" and check the result.

## 绢 Silk: gpt-image-2.5-sunburst

- **Refs:**
  - `media/style_refs/ref_silk_qianli_bridge.jpg` (千里江山图, bridge section)
  - `media/style_refs/ref_silk_qianli_1c.jpg`
- **Call:** with `images:[...]` (edit mode), `size:1536x1024`, `quality:high`.
- **Crop:** crop to 1536x864 **anchored to the bottom** so the seal and foreground survive (`crop_top_frac=1.0`).
- **Refs matter:** without refs the 青绿 is timid (gpt_v2). With refs the azurite and malachite rocks appear (gpt_v3, gpt_v4).

```
A Song-dynasty blue-green landscape handscroll section (青绿山水) in the manner of Wang Ximeng, painted with chalky,
powdery mineral pigments — greyed azurite (#2F6690) and soft malachite (#3A8A6E) laid over ink outlines, slightly faded
and abraded with age — on warm ochre silk (#E9DCC0 darkened with age) with visible silk weave. West Lake, Hangzhou,
winter dusk. Middle ground: a long low causeway crossing the lake from left to right, with the Broken Bridge — ONE single
low stone arch — at its centre; a thin line of snow rests on the bridge deck, its parapet and the causeway. Slender bare
willows stand along the causeway, their leafless switches hanging plain and straight down like fine ink threads, no
leaves. Far distance right: Leifeng Pagoda, small, on a low hill. One tiny covered wupeng boat on the still water. A few
snow-dusted mineral-green rocks in the lower-right foreground. No villages, no houses, no crowds. The whole upper half is
calm, empty silk sky — 留白 — for later typography; the composition is sparse and quiet. {RESTRAINT}
Exactly one small vermilion seal, a solid red square with an empty plain interior (no characters inside), placed well
inside the lower-right corner, not touching the edge. {NOTEXT}
```

- **Palette sampled from gpt_v4:**

  | Element | Hex |
  |---|---|
  | Silk sky | #93753D |
  | Lake | #72673F |
  | Azurite (rocks) | #365D71 |
  | Malachite (rocks) | #3E6465 |
  | Snow | #DDD5C2 |
  | Ink line | #3D3520 |
  | Seal | #855331 |

  Everything in the frame is darker and more olive than the treatment's targets (silk #E9DCC0, azurite #2F6690,
  malachite #3A8A6E, vermilion #C8312B). **Grade in post:** lift the silk toward #C9B184 and push the seal toward #C8312B.
  Do not chase the targets in the prompt: gpt over-saturates if you do.
- **Avoid:**
  - "Winter at dusk" without "no villages". You get Qing-academic clutter (gpt_v1).
  - nbp for silk. Its azurite becomes cobalt or electric blue (nbp_v1), or a flat illustration (nbp_v2).

## 宣 Xuan / ink: nano-banana-pro, a two-step generate-then-edit chain

- **Step 1 (nbp_v6):**
  - Refs: `ref_ink_xiagui.jpg` (Xia Gui, *Remote View*), plus `ref_silk_qianli_bridge.jpg` as the pigment reference
    for Earth.
  - Settings: `aspect_ratio 16:9`, `image_size 2K`.

```
A full-bleed monochrome Chinese ink-wash painting (水墨) on white xuan paper, edge to edge, no margins, in the manner of
Xia Gui and Ma Yuan, with real brush marks: broad wet washes, dry-brush 飞白, ink granulation, soft bleeding into paper
fibres. The lunar south pole from the high rim of Shackleton crater. The sun is one degree above the horizon BEHIND the
viewer: only the crests and the rim catch light and are left as bare white paper, white islands in a sea of black ink;
everything below the crests is deep black ink shadow. Sky: flat dense black ink, no stars. CAMERA: directly behind a
tiny astronaut silhouette, at the height of the astronaut's helmet. The astronaut stands on the lit rim in the right
half of the frame, seen from behind, head slightly bowed. Because the rim is high, the distant horizon lies BELOW the
astronaut's shoulders in the frame. On that distant, lower horizon, beside the astronaut at about chest height in the
frame, rests Earth — tiny, its diameter no more than the astronaut's helmet-to-waist height, its bottom edge hidden by
the horizon. The astronaut's long, thin, hard-edged shadow runs from the feet straight ahead toward Earth. Earth is the
ONLY colour in the picture and is NOT a photograph: a small hand-painted disc of chalky, opaque mineral pigment — muted
azurite blue, a little malachite green, two white gouache cloud strokes, a soft ink edge. Everything else is strictly
black, grey and paper-white. The left third of the frame is quiet for later typography. {RESTRAINT} No stars, no sun
disk, no seal. {NOTEXT}
```

- **Step 2 (nbp_v7):** an edit with `image_input=[nbp_v6.jpg]`, because v6 came back with a blank paper strip on the left.

```
Edit this ink painting. The blank white strip of paper on the left must disappear: continue the painting across the
whole frame — extend the dense black ink sky and the ink-wash crater cliffs and lit white crests seamlessly to the left
edge, same brushwork. Keep the astronaut, Earth and the right side unchanged, except: redraw the astronaut's long thin
shadow so it runs from the feet AWAY from the viewer, toward Earth on the horizon. No text, no stars, no border.
```

- **Known defect in nbp_v7:** the shadow still falls toward the camera, so the edit ignored that part of the instruction.
  - Fix it in the rotoscope pass, or use the **compositing route**, which is better for animation anyway:
    1. Make a clean ink plate with no Earth (`nbp_v8`, an edit: "Remove Earth completely… one single long shadow… no colour at all").
    2. Generate a separate Earth sprite on black (`earth_sprite_nbp_v9.jpg`).
    3. Composite it **rotated 180°** (Earth is south-up from the south pole), keyed so it hides behind the
       horizon (`comp_v1.jpg`).
  - Earth then becomes its own layer for the slow spin, the ±7° bob and phase changes.
  - The sprite is still too "school globe". Re-roll it with fewer, more abstract land shapes.
- **Prompt rules that mattered:**
  - "full-bleed, edge to edge, no margins": without it, nbp_v1 letterboxed onto blank paper.
  - "Earth is NOT a photograph: a hand-painted disc of chalky opaque mineral pigment": without it, Earth was a NASA Blue Marble.
  - **Camera height plus an explicit frame position** ("horizon BELOW the shoulders, Earth at chest height").
    "Below the eye line" alone does nothing; every model put Earth above the head.
- **Palette sampled from nbp_v7:**

  | Element | Hex |
  |---|---|
  | Sky ink | #171713 |
  | Mid ink | #22211D |
  | Grey wash | #58524F |
  | Lit paper | #F9F8F5 |
  | Earth azurite | #577293 |
  | Earth malachite | #45736B |

- **Avoid:**
  - gpt and grok for anything lunar. They give photo-real regolith, a double shadow, a giant glowing Earth or a halo.
  - Size words like "thumbnail" or "fingernail". Give the size relative to the figure.

## 磁青泥金 Indigo & gold: nano-banana-pro

- **Ref:** `media/style_refs/ref_indigo_ming_nijin.jpg`. This is a crop of a Ming 泥金 *千手千眼观世音菩萨大慈心陀罗尼*
  frontispiece on 磁青 paper. The crop excludes its seals and text.
- **Settings:** `aspect_ratio 16:9`, `image_size 2K`.

```
A Ming-dynasty 泥金 gold-ink painting on deep indigo-dyed 磁青 paper — the technique of imperial sutra frontispieces: fine
hand-drawn lines of matte powdered gold on a dark, slightly mottled indigo paper ground. Subject: a night rocket launch
from a coastal launch site like Wenchang, Hainan. A tall slender rocket beside its launch tower, drawn in precise 界画
ruled lines — ruler-straight, even gold lines, the tower a lattice of trusses — placed right of centre. The rocket has
just cleared the tower and is rising; the rocket body is plain, with no markings, no lettering, no flags, no logos; its
exhaust plume is true splashed ink (泼墨): wet pools of gold ink and darker ink bleeding and feathering into the indigo
paper fibres, with spattered droplets with a few strokes of ember-orange flame, spreading low and wide across the pad.
Coconut palm trees along the shoreline drawn in fine gold line. A calm sea in the foreground marked with a few sparse
gold wave lines. The left third of the frame is calm, empty indigo paper for later typography. The gold is matte and
hand-applied, slightly uneven, never metallic chrome. {RESTRAINT} No stars, no seal. {NOTEXT} Line work fine and sparse
like a Ming sutra frontispiece; the plume is the only loose, wet passage in the picture.
```

- **Palette sampled from nbp_v3:**

  | Element | Hex |
  |---|---|
  | Indigo paper | #222F3F |
  | Gold (bright line) | #D4B170 |
  | Gold (mid wash) | #87704B |
  | Ember | #B35829 |

  The treatment's targets (indigo #16213E, gold #D4A84B, ember #E86A33) hold up. The real paper is a touch greyer and more
  mottled, which is good.
- **Known issue:** in every take the rocket still sits on the pad. Liftoff needs either a stronger cue ("a gap of empty
  paper between the engines and the pad") or the video model.
- **Avoid:**
  - Glow words ("glowing", "radiant", "shimmering"), and grok in general, which produces fake gold glow.
  - gpt, which produces a sepia photo-engraving.
  - Leaving the rocket body unconstrained, which invites pseudo-lettering (nbp_v1).

## 界画 Jiehua moonbase: nano-banana-pro

- **Refs:**
  - `ref_jiehua_yuanjiang.jpg` (Yuan Jiang, *Palace*)
  - `ref_jiehua_yuanjiang_ninefold.jpg` (*The Palace of Nine Perfections*, centre panels)
  - `ref_ink_xiagui.jpg`
- **Settings:** `16:9`, `2K`.
- **Key phrase:** "Classical parallel oblique projection … no vanishing point". This is what finally made it read as
  界画 rather than a modern concept sketch (nbp_v3 onward).

```
A Song-dynasty 界画 (jiehua) palace-style painting, like Li Song's or Wang Zhenpeng's ruled-line architecture and Yuan
Jiang's palace screens, in ink on aged pale silk-paper with sparing gongbi colour — but the subject is 'Guanghan
Station', a near-future base at the lunar south pole. Classical parallel oblique projection seen from high above (no
vanishing point; all parallel edges stay parallel). Clusters of architecture float between bands of empty paper,
separated by soft ink washes, as in a palace scroll. Every structure is drawn with ruler-straight 'iron-wire' ink lines
of perfectly even width. The base: low habitat mounds covered with grey regolith, modelled with ink cun texture strokes
like Song rocks; white ribbed inflatable cylinder modules joined by short tunnels; four very tall slender masts, each
carrying a tall flat solar panel standing VERTICALLY upright like a banner (the sun is on the horizon at the pole, so
panels stand vertical, never tilted horizontal), drawn as fine ruled grids filled with a very pale, greyed azurite wash
(never saturated blue); far away in the upper right, tiny and separated from the base by a band of empty paper, a small
fission reactor with flat radiator fins in faint malachite; a six-wheeled rover on ruled tracks; tiny astronauts at
work, a few millimetres tall, no faces; one or two touches of vermilion on hatch doors. The lunar ground is grey ink wash
with long, low-sun shadows. The upper third is empty paper (留白) for later typography. {RESTRAINT} No stars, no seal,
no flags, no logos. {NOTEXT}
```

- **Next fixes**, tried in nbp_v6 and only half successful:
  - The reactor reads as a satellite. Describe it as "a squat cylinder half-sunk in a low earthen berm, with a row of
    tall thin flat radiator plates standing vertically beside it like a fence". That worked in v6.
  - The astronauts look like cartoons. Ask for them "drawn as minute figures in the manner of the people in Song
    paintings, a few brush touches each".
  - The door and rover have tiny marks. Add "No markings or symbols on doors or vehicles".
  - Don't over-specify the masts: v6 turned the panels into columns.
- **Palette sampled from nbp_v5:**

  | Element | Hex |
  |---|---|
  | Paper | #E6DDCB |
  | Light wash | #C1BAAC |
  | Regolith ink | #847E75 |
  | Malachite fins | #A5B9A4 |
  | Vermilion door | #C57D64 |

- **Black-sky variant (nbp_v4):** physically right, but the black band over a flat oblique ground looks pasted on, and
  Earth went photographic again. Keep jiehua skies as paper 留白. The black sky belongs to the 宣 ink paper.
- **Avoid:**
  - gpt for jiehua. Its designs are the most accurate (gpt_v5: vertical arrays, distant reactor, cable runs), but the
    perspective, saturated panels and busy detail give it a 19th-century engraving look. **Use gpt_v5 as the
    *design reference* for the base layout, and nbp for the painting.**

## Animation-friendliness (first frames for Seedance 2.5 / minimax h3, then the shader/rotoscope pass)

| Frame | Layer separation | Text garbage | Notes |
|---|---|---|---|
| S1 gpt_v4 | Good: horizontal bands (silk sky / far hills / causeway + willows / water / rocks) | none; seal blank | 1536 px wide. Upscale before i2v. Water reflections invite video-model shimmer. |
| S2 nbp_v7 | Excellent: near two-value ink, so a luminance key splits sky / crests / cliffs. Earth is the only chroma, so a hue key isolates it. The astronaut is a black silhouette on white. | none | Shadow direction is wrong. Prefer the comp route (plate + Earth sprite) for animation. |
| S2 comp_v1 | Excellent: Earth is a real separate layer | none | Earth must be flipped south-up. Re-roll the sprite to be less detailed. |
| S3 nbp_v3 | Excellent: flat indigo ground; gold line keys by hue; the plume is the single wet passage to animate | none on rocket (v1 had glyphs) | The rocket isn't lifting off yet. |
| S4 nbp_v5 | Very good: pale paper ground, ink line, separate ink-wash bands. Parallel projection means pans and trucks need no perspective solve. | tiny marks on the hatch and rover | Cartoon-ish astronauts. The reactor reads as a satellite. |

## Does the system hold together?

**Mostly yes, as a sequence.** On the 2×2 sheet the papers read as one family:
- warm silk with blue-green (home);
- black and white ink with one blue-green disc (Moon);
- indigo with gold (night and the drop);
- pale paper with ruled ink (the engineering).

The colour script "colour = home" lands because S1's azurite/malachite is the same pigment as S2's Earth.

**Weak points:**
1. **Two different "Earths" in S1 and S2.** Silk azurite is greyed (#365D71), while the moon Earth comes out brighter
   (#577293). Grade both to one shared swatch in post.
2. **Jiehua is the least "Chinese painting" of the four.** It is credible as 界画 structure but still reads a little as a
   modern ink illustration. It needs a silk-tone grade and finer figure work.
3. **Two models.** Silk wants gpt and the other three papers want nbp. The grain and resolution differ (1536 vs 2752).
   - Upscale gpt frames and add one shared paper-grain overlay in the shader pass to tie them together.
   - Alternatively, try gpt edit-mode to restyle nbp silk.

## Reference images (`media/style_refs/`, all from Wikimedia Commons; public domain or CC0)

| File | Source |
|---|---|
| `ref_silk_qianli_bridge.jpg`, `ref_silk_qianli_1c.jpg` | Wang Ximeng, 千里江山图 (1113), Palace Museum. Commons "Wang Ximeng - A Thousand Li of River (Bridge).jpg" and "1c Wang Ximeng… (section)". PD. |
| `ref_indigo_ming_nijin.jpg` (from `ming_nijin_dharani_p3_orig.jpg`) | Ming 泥金写绘本 千手千眼观世音菩萨大慈心陀罗尼, gold on 磁青 paper. Commons PDF, page 3, seals and text cropped out. PD. |
| `lotus_goryeo_met_185_orig.jpg` | Goryeo Lotus Sutra, gold and silver on indigo, Met DP270185. CC0. Kept for reference, not used in prompts (Korean, mostly text). |
| `ref_jiehua_yuanjiang.jpg`, `ref_jiehua_yuanjiang_ninefold.jpg` | Yuan Jiang 袁江, *Palace* and 九成宫图 (Met). PD. |
| `ref_ink_xiagui.jpg`, `ref_ink_mayuan.jpg` | Xia Gui, *Remote View*; Ma Yuan, *Walking on a Mountain Path in Spring* (left crop, which excludes the poem). PD. |
