# 望明月 Moongazing: Character Bible v1

*Character design pass, 2026-10-06. About 38 image calls, roughly $5.50 at list price (GPT edit-mode input tokens are not
in the estimate). Note that `media/` is gitignored.*

**Board:** `media/chars/CAST_BOARD.jpg`. It has every canonical sheet, labelled.

**Files for each take:**
- Every take is kept next to its full prompt and refs: `media/chars/<name>/<take>.{jpg,png}` plus `<take>.json`.
- Prompt sources are in `media/chars/_prompts/`.

**Tools:**
- Generator: `tools/char_gen.py`. It appends `media/chars/STYLE_BLOCK.txt` to every prompt.
- Finaliser: `tools/chars_finalize.py`. It copies the chosen takes to `SHEET*.jpg`, grades the silk ground to #E9DCC0
  and rebuilds the board.
- Seals: `tools/seal.py`.

**Canonical sheets are design references, not frames.** In-scene grading follows `docs/style_guide.md`: silk is darker
and more olive, around #C9B184. The sheets sit on clean #E9DCC0 so the characters key out easily as references.

## Canonical sheets

| # | Subject | Canonical file | Source take | Model |
|---|---|---|---|---|
| 1 | Mei, strawberry dress | `media/chars/mei/SHEET.jpg` | `mei/mei_grok_v2.png` | grok-imagine-image-2.0 (refs: gpt v1 sheet + Su Hanchen) |
| 1b | Mei, Chang'e costume | `media/chars/mei/SHEET_change.jpg` | `mei/mei_change_grok_v3.png` | grok (refs: Mei sheet, gpt v2 costume, Su Hanchen) |
| 2 | Bao | `media/chars/bao/SHEET.jpg` | `bao/bao_grok_v3b.png` | grok (refs: gpt v1 sheet + Su Hanchen) |
| 3 | Mei + Bao, Copernican lesson | `media/chars/kids/SHEET.jpg` | `kids/kids_gpt_v3.jpg` | gpt-image-2.5-sunburst (refs: both sheets + grok draft) |
| 4 | Kenton (back and silhouette only) | `media/chars/kenton/SHEET.jpg` | `kenton/kenton_gpt_v2.jpg` | gpt (ref: Su Hanchen) |
| 5a | Jade, lunar EVA suit | `media/chars/jade_suit/SHEET.jpg` | `jade_suit/eva_gpt_v2.jpg` | gpt (edit of v1) |
| 5b | Jade, launch-and-entry suit | `media/chars/jade_suit/SHEET_iva.jpg` | `jade_suit/iva_gpt_v2.jpg` | gpt (edit of v1) |
| 5c | Jade, Earth winter (from behind) | `media/chars/jade_suit/SHEET_casual.jpg` | `jade_suit/casual_gpt_v1.jpg` | gpt |
| 6a | Crew in EVA suits, visors up | `media/chars/crew/SHEET.jpg` | `crew/crew_grok_v3b.png` | grok repaint of gpt v2 (EVA ref) |
| 6b | Crew in galley polos | `media/chars/crew/SHEET_polo.jpg` | `crew/crew_polo_grok_v3.png` | grok repaint of gpt v1 |
| 7a | Yutu-A/B rabbit rovers | `media/chars/robots/SHEET.jpg` | `robots/rovers_gpt_v1.jpg` | gpt |
| 7b | Regolith printer + humanoid helper | `media/chars/robots/SHEET_printer.jpg` | `robots/printer_grok_v2.png` | grok edit of gpt v1 (helmet fix) |
| 7c | Robot dog (Earth) | `media/chars/robots/SHEET_dog.jpg` | `robots/dog_gpt_v1.jpg` | gpt |
| 8 | Agency seals | `media/chars/seal/seal_dot.{png,svg}`, `seal_guanghan.{png,svg}`, `seal_guanghan_square.png` | PIL + fontTools | `tools/seal.py` |
| 9 | Props: toy Earth, toy Moon, celadon cup, flashlight | `media/chars/props/SHEET.jpg` | `props/props_gpt_v1.jpg` | gpt |

Jade's face is not designed here. It is handled separately; see `media/jade_style/`. Her sheets show her only with the
gold visor down or from behind.

## Model notes (character work)

This differs from the style guide's landscape verdicts.

- **gpt-image-2.5-sunburst**: the best first pass for layout, turnarounds and complex multi-figure instructions.
  - It is the only model that got the kids' "seen from behind" vignette right.
  - Its suits and engineering are the most credible.
  - **Edit mode is too conservative.** Asked to "repaint more gongbi", it returns a near-copy (mei_gpt_v2 ≈ v1). Use it
    for content fixes, not style shifts.
  - Its faces drift photographic on older white men (Sven).
- **grok-imagine-image-2.0**: the best for **character line quality** on a plain ground. Given our gpt sheet plus the Su
  Hanchen gongbi ref, it gives crisp, even ink contours and flat washes, the most "gongbi" of the three. It costs $0.05.
  - Its silk ground comes out too yellow, which `chars_finalize.py` corrects.
  - **Check skin tones on every take:** one crew repaint lightened Adaeze, and one polo repaint did the same (rejected).
  - It duplicated a child in multi-figure vignettes (kids_grok_v2 / v2b).
  - The style guide's "no grok for hero frames" still stands. This exception covers turnaround sheets only.
- **nano-banana-pro**: its kids drift doll-like and anime (mei_nbp_v2, bao_nbp_v2). It was not used for characters.
- **The ref that made it work:** `media/style_refs/ref_gongbi_suhanchen_children_detail.jpg`. This is Su Hanchen 苏汉臣,
  *Children Playing in an Autumn Courtyard* (Song, NPM Taipei), detail, from Wikimedia Commons, public domain. Pass it
  as the LAST ref with: "used ONLY for painting technique; do not copy its people, clothes, furniture or composition."

## Universal blocks

**STYLE** (appended to every sheet prompt; `media/chars/STYLE_BLOCK.txt`):

```
STYLE (strict): a character model sheet painted as a museum-grade Chinese 工笔 gongbi painting — modern people rendered
in a classical Song/Ming court-painting technique. Fine, even, unhurried black ink outlines of constant thin weight
(iron-wire line 铁线描); flat, soft, matte mineral-pigment washes laid inside the lines: azurite blue #2F6690, malachite
green #3A8A6E, vermilion #C8312B, warm ink black, white lead (蛤粉) for whites, pale peach for skin. Plain warm ochre silk
ground #E9DCC0 with a faint, even silk weave; nothing else in the background. Faces are restrained: very sparse fine
lines only for eyes, brows, nose tip and mouth, smooth flat pale skin wash, no shading, no blush gradients, no pores, no
freckles, no highlights in the eyes beyond a tiny dot. Hair painted as massed flat ink with fine controlled strand lines.
Restrained, calm, elegant, quiet. Even, flat, shadowless museum-scan lighting. NOT glossy, NOT 3D, NOT plastic, NOT anime
or manga, NOT chibi, NOT Pixar, NOT photographic, NOT airbrushed, no cast shadows, no glow, no gradients, no lens
effects. No text, no letters, no numbers, no labels, no captions, no calligraphy, no signatures, no seals unless specified.
```

**TECH** (`media/chars/TECH_BLOCK.txt`; add it when passing the Su Hanchen ref):

```
Push the painting technique closer to the Song-dynasty gongbi reference painting (Su Hanchen, children in an autumn
courtyard): crisper, more deliberate, continuous fine ink contour lines of even weight around every form and fold;
flatter, more opaque matte mineral colors; faces with almost no modelling — just a flat pale wash and a few precise
lines; but keep our lighter ochre silk ground #E9DCC0 and our modern clothes. Less 'children's picture book', more
'museum painting'.
```

## Character prompts for image and video models

Paste a character's **ID block** verbatim into any still or video prompt in which they appear, and attach the canonical
sheet as a reference image (Seedance `reference_images`, h3 `reference_image`, nbp `image_input`). Keep the wording
identical across shots: these blocks are the consistency contract.

### MEI (girl, 4)
**ID:** MEI, a 4-year-old girl of mixed heritage (half East Asian, half white), soft round face, small nose, gentle dark
almond eyes, light-to-medium chestnut-brown hair in loose soft waves cut as a long bob just past the chin; white
knee-length cotton dress with small red strawberries (green leaf tops), short puffed sleeves, white socks, red
Mary-Jane shoes. Real 4-year-old proportions (head about 1/5 of height). Slightly stylized gongbi child, sweet, never
doll-like.
- **Variant, Chang'e costume:** white silk children's hanfu with a cross collar and wide sleeves, ankle-length white
  skirt, pale azurite sash, two very long white silk ribbons (飘带) edged in thin azurite and malachite, a small white
  flower in her hair, white cloth shoes. Ribbons stream like a Dunhuang Flying Apsara when she "flies".
- **Props:** the toy Moon (never the Earth).
- **Never:** long hair, black hair, blonde hair, an older-looking face, close-up photoreal skin.
- **Hair ref:** `inputs/daughter_hair.png` (colour and wave only).

### BAO (boy, 7)
**ID:** BAO, a 7-year-old schoolboy of mixed heritage (half East Asian, half white). His head is noticeably large for
his body (20–25% larger than typical), with a very round face, full plump cheeks, large dark-brown eyes and strong
straight dark eyebrows. Very dark brown, almost black, hair: a short neat schoolboy cut grown out to about one inch,
soft on top, forehead visible. Earnest, studious "little professor". Deep azurite knitted crew-neck sweater with small
white stars, a ringed planet and a little rocket on the chest; navy trousers; white sneakers.
- **Props:** always holds the toy Earth.
- **Never:** toddler proportions, a fringe over the brows, light hair, an anime face.

### MEI + BAO together
**ID:** use both blocks.
- Bao is clearly taller; Mei's head reaches his chest.
- Bao always holds the toy **Earth**, Mei the toy **Moon**. Never swap them.
- Jade's flashlight beam enters from the frame edge. Jade is off-frame or shown from behind.

### KENTON (father): no face, ever
**ID:** KENTON, a tall lean white man (about 1.88 m) with short, slightly tousled dark-brown hair, ALWAYS seen from
behind or with his face turned fully away. Outfit A: long charcoal wool overcoat, grey knit scarf, dark trousers,
brown boots. Outfit B: plain navy hoodie and jeans. Painted as quiet flat dark ink masses with restrained gongbi
contour.
- **Staging:** at most 6 shots, back, hands or wide only (rowing the wupeng boat; Mei on his shoulders).

### JADE: costume only (her face is handled separately)

**(a) Lunar EVA suit, agency issue (the same suit the crew wears).** Bulky matte-white quilted rear-entry lunar surface
suit:
- rigid hard upper torso, bearing rings at the shoulders, wrists and neck;
- accordion elbows and knees, grey knee and elbow pads, thick grey gloves, chunky grey lunar boots;
- two thin piping lines, azurite blue and malachite green, running in one long gentle curve down the outer arms and
  legs like an apsara's ribbon;
- round bubble helmet with a row of small helmet lights, opaque **gold sun visor down**, slim white life-support
  backpack (the hatch), wrist cuff checklist on the left forearm;
- a small square vermilion chest patch with a single pale-blue dot;
- charcoal regolith dust on the boots, knees and gloves only.

On the sunlit surface the visor is always down and her face is never visible. The visor reflects the scene (Earth on the
horizon).

**(b) Launch-and-entry pressure suit (capsule).** Loose, baggy, unpressurized soft suit:
- pale white-grey fabric with azurite-blue panels on the shoulders and outer legs, a malachite-green zipper line;
- metal wrist rings, a hose connector on the torso, a checklist pocket on the thigh, black boots;
- soft hood-helmet with a hinged visor, and a blue comms cap;
- the vermilion dot patch on the left chest;
- folds and wrinkles at the elbows, knees and waist. Not form-fitting.

For LS3 (visor up, under g-load) her face comes from the separate Jade-face pipeline; this sheet gives only the suit.

**(c) Earth, winter at West Lake.** Very long straight dark hair to mid-back; thin dark-framed glasses; long camel-ochre
wool coat with a high collar; soft malachite-green knitted scarf; dark trousers; low black boots.
- **Jade pendant:** a small round flat 平安扣 disc of translucent green jade on a red silk cord, usually visible at her
  collar.
- **Indoor variant:** cream knit sweater, dark trousers, low ponytail.

### CREW OF GUANGHAN STATION
All of them wear Jade's EVA suit (above). Each has their own helmet stripe and matching arm band; on the polos, that
colour becomes the collar stripe. Faces are flat gongbi, sparse lines, adult and dignified. In sunlight on the surface,
visors are DOWN, so tell them apart by stripe colour. Visors go up only in shade, inside a hab or rover, or on the
lineup sheet.

| Name | Role | ID description | Stripe |
|---|---|---|---|
| **Sven Lindqvist** | Commander | Swedish man, about 50, tall, short grey-blond hair, neat short grey-blond beard, calm | **vermilion** #C8312B |
| **Layla Al-Mansoori** | Pilot | Emirati woman, about 35, dark eyes, long dark hair in a neat low bun (off-duty), confident | **gold ochre** #D4A84B |
| **Adaeze Okafor** | Reactor engineer | Nigerian woman, about 40, deep dark-brown skin, short natural hair, warm direct gaze | **malachite** #3A8A6E |
| **Arjun Raman** | Geologist / ice | Indian man, about 38, medium-brown skin, short black hair, thin moustache, gentle | **ink black** #1B1B1F |
| **Lucía Ferreira** | Botanist | Brazilian woman, about 33, olive-tan skin, dark curly hair tied back, bright smile; holds the seedling | **pale cinnabar pink** #E3A6A0 |
| **Kenji Mori** | Robotics | Japanese man, about 45, black hair greying at the temples, rectangular glasses, thoughtful; often has a tablet | **azurite** #2F6690 |

- **In-suit head:** a black-and-white fabric comms cap ("snoopy cap"). In the EVA sheet Layla's cap reads dark around
  the face; it is a comms cap, not a headscarf.
- **Galley clothes:** white short-sleeved polo with a collar stripe in their colour, a small vermilion dot patch, dark
  grey multi-pocket cargo trousers, grey socks or slippers. Foil drink pouches with straws.
- **Always check skin tones:** Adaeze is the darkest, Arjun is medium-brown. Models lightened Adaeze in two of four grok
  repaints.

### ROBOTS

**YUTU-A / YUTU-B (jade-rabbit rovers).** Twin quadruped walking robots, each about the size of a large dog:
- compact rounded white body like a crouching rabbit, with light-grey joints and thin azurite trim;
- four jointed legs on round footpads;
- two tall, thin, flat-panel antenna masts on the head unit that read as **rabbit ears** (one tip slightly bent);
- a dark sensor face with two round camera eyes, and a cargo rack with a sample box;
- a small vermilion dot decal on the flank;
- charcoal regolith dust on the legs and underside.

Behaviour: haul sleds of regolith bricks; sit on their haunches like a resting rabbit, ears up.

**Regolith printer.** Tall open gantry of white trusses on four big wheels:
- bridge beam with a print head extruding an ember-orange molten-regolith bead that cools to grey;
- grey regolith hopper on top, azurite cable runs;
- prints beehive-kiln domes in layered grey courses.

**Humanoid helper.** About 1.2 m tall, slender, white:
- rounded head with a single horizontal dark visor slit;
- three-fingered hands, light-grey joints, malachite trim;
- carries a blue-green tool case.

**Robot dog (Earth, dances with Mei).** Beagle-sized consumer quadruped, smooth rounded white shell with soft grey legs:
- big dark face mask with two round dark eyes, grey floppy ear flaps, stubby tail;
- vermilion collar with a small brass bell.

Friendly and toy-like. Stands on its hind legs to "dance", holding Mei's hands.

### PROPS

| Prop | Description |
|---|---|
| **Toy Earth** | Grapefruit-sized sphere hand-painted in 青绿 (Qianli Jiangshan) style: azurite oceans, malachite continents with tiny painted mountain ridges, white 祥云 cloud scrolls. No stand. Bao's; it travels to the Moon with Jade. |
| **Toy Moon** | Matching size, matte pale grey with darker grey maria and a few ink craters. Mei's; it stays home. |
| **Celadon tea cup** | Small Song-style Longquan celadon bowl, pale jade-green glaze with fine crackle, small foot. It reflects the Moon (V2) and Earth (the drop). |
| **Flashlight** | Ordinary camping flashlight, matte vermilion body, black knurled grip, round lens. The beam is a soft pale warm wash. It is the Sun in the Copernican lesson. |

### AGENCY IDENTITY (seals): `tools/seal.py`

- **`seal_dot.png` / `seal_dot.svg`:** the logo. A square vermilion (#C8312B) carved-stone seal impression with an inner
  carved border line and one small pale-blue (#A9C8E6) dot at the centre. There are **no characters**. The PNG has a
  transparent background, 2048 px. The SVG is vector, using `feTurbulence` for the stone edge.
  - Alternative painterly take: `seal/seal_gpt_v1.jpg` (on silk, not keyed).
- **`seal_guanghan.png` / `.svg` (vertical) and `seal_guanghan_square.png`:**
  - 廣寒 is carved 白文 (text cut out) in **九叠篆 nine-fold seal script**, the style of Song–Qing official seals, which
    suits an agency seal. The square version reads right to left (廣 on the right).
  - It uses the traditional 廣, which is standard for seal carving. The SVG glyphs are real font outlines
    (fontTools), not traced.
  - **Font license:** 字悦九叠印篆 (ZiYue JiuDie YinZhuan), copied to `media/chars/seal/font/`, obtained via
    github.com/alephpi/pinzhuan. **The font is marked non-commercial.** Before release, either license it, redraw the
    two glyphs by hand from the render (they are simple ruled strokes), or re-render with a cleared seal font.
- **Rule from the style guide:** never ask an image model to draw the seal. Generate with "no seal" and composite these
  files in the typography pass. Every model invents glyphs inside seals.

## Continuity rules for video prompts
1. Attach the canonical SHEET as a reference and paste the ID block verbatim.
2. Visors are down in sunlight. Faces show only in shade or interiors, or on the LS3 capsule shot.
3. Kenton's face never appears. Jade's face appears only through the separate Jade pipeline.
4. Bao holds the Earth and Mei holds the Moon. The toy Earth goes to the Moon with Jade; the toy Moon stays home.
5. Crew are identified by stripe colour. Keep the six colours fixed.
6. The pale-blue-dot patch appears on every suit (left chest), polo (left chest) and rover (flank). Never letters.
