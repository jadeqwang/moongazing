# 望明月 Moongazing: Character Bible v1.1

*v1.2, 2026-10-07 (Earth-side pass): the kids are now **M** (girl) and **T** (boy) on screen, never full names;
real heights (Kenton 185, Jade 165, T 132, M 109 cm; lineup `media/chars/family_heights.jpg`); Kenton's new look; M's
toy Go2-like robot dog and the family cat; Austin home sets in `media/sets/`.*

*v1.1, 2026-10-07: crew of eight, new agency emblem (no red) and carved-character seals (`docs/identity.md`), families
at home for 7.C4, Yutu v2 wheel-legged rovers.*

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
| 0 | **Family heights lineup (to scale)** | `media/chars/family_heights.jpg` | `family/heights_gpt_v1.jpg`, figures rescaled in PIL to exact cm | gpt (refs: new sheets + Jade casual) |
| 1 | M, side Dutch braid + pink elastics, pink strawberry dress, embroidered flats, 109 cm | `media/chars/M/SHEET.jpg` (white-dress/bob v1: `SHEET_v1.jpg`) | `M/M_gpt_v2.jpg` | gpt edit of M_gpt_v1 (ref `inputs/daughter_hair.png`) |
| 1b | M, Chang'e costume | `media/chars/M/SHEET_change.jpg` | `M/M_change_gpt_v1.jpg` | gpt (refs: new M sheet, old costume sheet, Su Hanchen) |
| 2 | T, 132 cm, big head, **full round cheeks (v3, Oct 8)**, hiking boots | `media/chars/T/SHEET.jpg` (v2, thinner cheeks: `SHEET_v2.jpg`) | `T/T_nbp_v3.jpg` | nano-banana-pro edit of the v2 sheet (cheeks only) + local composite; v2 = `T/T_gpt_v2.jpg` |
| old | Mei / Bao v1 sheets (retired: old names, wrong heights, sneakers) | `media/chars/mei/`, `media/chars/bao/` | | |
| 3 | M + T, Copernican lesson (**old heights and shoes; superseded by K_3.4_lesson**) | `media/chars/kids/SHEET.jpg` | `kids/kids_gpt_v3.jpg` | gpt-image-2.5-sunburst (refs: both sheets + grok draft) |
| 4 | Kenton, new look (back / 3/4 / distance) | `media/chars/kenton/SHEET.jpg` (old: `SHEET_v1.jpg`) | `kenton/kenton_gpt_v4.jpg` | gpt (refs: `media/refs/lanparty/kenton_ref_crop.jpg`, old sheet, Su Hanchen; v4 = edit for black trousers) |
| 5a | Jade, lunar EVA suit | `media/chars/jade_suit/SHEET.jpg` | `jade_suit/eva_gpt_v3.jpg` | gpt (edit of v2: round emblem patch replaces the red square) |
| 5b | Jade, launch-and-entry suit | `media/chars/jade_suit/SHEET_iva.jpg` | `jade_suit/iva_gpt_v3.jpg` | gpt (edit of v2: round emblem patch) |
| 5c | Jade, Earth winter (from behind) | `media/chars/jade_suit/SHEET_casual.jpg` | `jade_suit/casual_gpt_v1.jpg` | gpt |
| 6a | Crew of 8 in EVA suits, visors up (Jade visor down) | `media/chars/crew/SHEET.jpg` | `crew/crew8_eva_gpt_v1.jpg` | gpt (refs: Jade EVA sheet, emblem patch, Su Hanchen) |
| 6b | Crew of 8 in galley polos (Jade from behind) | `media/chars/crew/SHEET_polo.jpg` | `crew/crew8_polo_gpt_v1.jpg` | gpt (refs: old polo sheet, emblem patch, Su Hanchen) |
| 7a | Yutu v2 wheel-legged rovers | `media/chars/robots/SHEET_yutu_v2.jpg` | `robots/yutu_v2_gpt_v2.jpg` | gpt v1, then gpt edit (wire-mesh wheels, paler panels) |
| 7a-old | Yutu v1 walking rovers (retired) | `media/chars/robots/SHEET.jpg` | `robots/rovers_gpt_v1.jpg` | gpt |
| 7b | Regolith printer + humanoid helper | `media/chars/robots/SHEET_printer.jpg` | `robots/printer_grok_v2.png` | grok edit of gpt v1 (helmet fix) |
| 7c | Family cat (the toy dog drawn on this sheet is **retired**: it has a head, a neck and a neckerchief) | `media/chars/robots/SHEET_pets.jpg` | `robots/pets_gpt_v1.jpg` | gpt (ref: cat crop `media/refs/lanparty/cat_ref_sitting.jpg`) |
| 7c-toy | **M's toy robot dog: headless Go2 miniature** (standing, side, front, top, reared up). **In no shot since Oct 8** (7.C2 now has the cat) | `media/chars/robots/SHEET_toydog.jpg` | 3D model `render/scenes/blockouts/toy_dog.js` (scenes `toy_dog_stand`, `toy_dog_rear`) | Three.js, after `media/refs/robot_dog/` (image models add a head every time) |
| 7c-old | Beagle robot dog (retired) | `media/chars/robots/SHEET_dog.jpg` | `robots/dog_gpt_v1.jpg` | gpt |
| 8 | Agency emblem + seals | `media/chars/identity/` (`emblem_final*.{svg,png}`, `seal_wangyue.*`, `seal_guanghan*.*`, `IDENTITY_BOARD.jpg`) | procedural | `tools/seal.py`; see `docs/identity.md` |
| 8-old | Old dot seal (retired: reads as Japan's flag) | `media/chars/seal/` | PIL + fontTools | — |
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

### M (girl, 4)
**ID:** M, a 4-year-old girl of mixed heritage (half East Asian, half white), soft round face, small nose, gentle dark
almond eyes, brown hair with lighter caramel-honey highlights in loose soft waves, about shoulder length, usually in a
single side DUTCH (crown) braid from the front hairline back over one ear, gathered with the rest into a low side
ponytail tied with small bright PINK elastics, a few loose wisps; PALE-PINK knee-length cotton dress with red
strawberries (green leaf tops), short puffed sleeves, white socks, red
embroidered cloth Chinese Mary-Jane flats (one strap, tiny malachite-and-white flowers). TALL for 4: 109 cm (94th
percentile), but real 4-year-old proportions (head about 1/5 of height, little round tummy, short sturdy limbs).
Slightly stylized gongbi child, sweet, never doll-like.
- **Alt shoes (for practical scenes):** small brown leather ankle boots.
- **Signature move:** runs at Jade full tilt when Jade kneels for a hug and bowls her over (K_8.2).
- **Plays with:** the family cat (`robots/SHEET_pets.jpg`): in 7.C2 it bats at the hem of her dress while she bounces, in 7.C3 it lies against her on the sofa. Her toy robot dog (`robots/SHEET_toydog.jpg`: headless) is still her toy, but it is in no shot since Oct 8 (Jade on 7.C2: "change it to the cat").
- **Variant, Chang'e costume:** white silk children's hanfu with a cross collar and wide sleeves, ankle-length white
  skirt, pale azurite sash, two very long white silk ribbons (飘带) edged in thin azurite and malachite, a small white
  flower in her hair, white cloth shoes. Ribbons stream like a Dunhuang Flying Apsara when she "flies".
- **Props:** the toy Moon (never the Earth).
- **Winter (Shanghai trip):** pale-pink quilted coat over the strawberry dress, white tights, small brown ankle boots.
- **Chang'e costume:** keeps the braid + pink elastics, with the small white flower beside the braid (`M/SHEET_change.jpg`).
- **Never:** black hair, blonde hair, a short bob, an older-looking face, close-up photoreal skin.
- **Hair ref:** `inputs/daughter_hair.png` (colour and wave only).

### T (boy, 7)
**ID:** T, a 7-year-old schoolboy of mixed heritage (half East Asian, half white). His head is noticeably large for
his body (20–25% larger than typical), with a very round face, FULL ROUND PLUMP CHEEKS (the face is widest at the
cheeks, level with the nose tip and mouth, and rounds in to a short soft chin with no jaw angle), large dark-brown eyes
and strong straight dark eyebrows. Very dark brown, almost black, hair: a short neat schoolboy cut grown out to about one inch,
soft on top, forehead visible. Earnest, studious "little professor". VERY TALL: 132 cm, a 10-year-old's height, but a
7-year-old's proportions simply scaled up (long legs, soft young face); with the big head he is about 5–5¼ heads tall
and his head is nearly the size of his father's. Reads young but tall, never a teenager. Deep azurite knitted
crew-neck sweater with small white stars, a ringed planet and a little rocket on the chest; navy trousers; brown
leather hiking boots like his father's (no sneakers).
- **Props:** always holds the toy Earth.
- **Never:** toddler proportions, a fringe over the brows, light hair, an anime face.
- **Cheeks (sheet v3, Oct 8 2026).** Jade said it three times of cut v5 ("T's cheeks are a bit fuller", "his cheeks
  should be fuller", "T's cheeks are fuller than what's shown"), so the sheet was wrong, not a shot. `T/SHEET.jpg` is now
  v3: the same boy, with only the cheek and jaw outline redrawn. Front: widest at the cheeks, a full round U below the
  eyes. Three-quarter: the far cheek is a round bump that passes the corner of the mouth. Profile: the cheek rounds
  forward beside the mouth and the jaw is a low soft curve. Draw it as OUTLINE only: no crease beside the mouth, no
  jowl or double-chin line, no heavy blush (a first edit with those read as a caricature: `T/work/T_nbp_cheeks_a.jpg`),
  and his body stays slim. In a painted frame his head is often under 150 px: there the cheek reads as the lower face
  being as wide as the forehead, not as detail. `family_heights.jpg`, `CAST_BOARD.jpg` and `kids/SHEET.jpg` still show
  the v2 face.

### M + T together
**ID:** use both blocks.
- T is clearly taller: the top of M's head reaches T's chin (109 vs 132 cm).
- T always holds the toy **Earth**, M the toy **Moon**. Never swap them.
- Jade's flashlight beam enters from the frame edge. Jade is off-frame or shown from behind.

### KENTON (father): mostly from behind; a small face at a distance is OK
**ID:** KENTON, a tall lean white man, 185 cm (6'1"), with CURLY dark-blond hair — thick springy curls to just above
the shoulders, the top half tied back in a small loose knot (half-up, half-down; it can also be worn as a soft fro);
thin dark-framed glasses. Dark charcoal-grey crew-neck T-shirt, black multi-pocket cargo trousers, brown leather hiking
boots; outer layer a dark navy zip-up fleece (Patagonia-style, no logos) or a warm brown fleece. Seen from behind,
3/4 back, or small and far away (face a few fine lines). Real-photo ref: `media/refs/lanparty/kenton_ref_crop.jpg`.
- **Staging:** few shots: back, 3/4 back or wide (launch viewing with M on his shoulders; roof deck; DDR; homecoming).
- **Old look (retired):** short dark-brown hair, charcoal overcoat / navy hoodie (`kenton/SHEET_v1.jpg`).

### SHANGHAI TRIP CAST (K_3.0_bridge, K_3.1, K_3.2: 湖心亭 Huxinting teahouse, Yu Garden, winter) — NOT Kenton
Jade, T, M, plus (always from behind, at a distance or partial; appearance sheet `media/chars/grandma_V/SHEET.jpg`):
- **Grandmother** (Jade's mother, Chinese, ~70, ~155 cm): short straight dark grey-black bob, thin glasses. Summer: white
  sun visor, loose white T-shirt, amber bead bracelet. Winter: grey knit beanie, deep plum padded jacket. She is also in
  Jade's West Lake memory (K_2.1, J_LS1).
- **Grandfather** (Jade's father, Chinese, ~70, ~168 cm): grey hair, dark flat cap, grey wool coat, slightly stooped;
  the grandparents walk arm in arm.
- **V, the nanny** (Brazilian, ~30, ~162 cm): light olive-tan skin, a round face with a big warm smile, sleek dark-brown
  hair in a low bun. Summer: mauve-grey T-shirt and jeans. Winter: mustard-ochre wool coat with a dark scarf.
- Winter: Jade in the camel coat + malachite scarf; T in an open navy padded jacket over the star sweater.
- Verse 1 West Lake (K_2.1) is Jade's memory of Hangzhou with her MOTHER: boatman + Jade + grandma (the kids have never
  been to Hangzhou).
- **Homecoming is two beats** (K_8.2a squat-and-sprint, K_8.2b impact), staged after `inputs/before_getting_bowled_over.png`:
  Jade squats low on her heels, side-on, arms opening, while M sprints at full tilt.

### M's NEW LOOK: propagation status (round 3)
All Earth keyframes now show M's braid + pink elastics and pink strawberry dress (targeted nano-banana-pro edits; earlier
picks kept as `<ID>_vN.jpg`). `M/SHEET_change.jpg` (braid kept under the white flower) and `kids/SHEET.jpg` (M only; T
there still has old sneakers/height) are updated. New placeholders: K_2.4, K_4.5, K_7.C1_earth, K_7.C3, K_7.D4, K_8.1,
K_8.3 (`media/keyframes/SHEET_EARTH_v4.jpg`).

### FOOTWEAR AND PLACES (round 4, user notes)
- **No shoes indoors at home:** everyone wears socks or goes barefoot (K_7.C1_earth, K_7.C2, K_3.4_lesson, K_8.2; Jade's
  shoes and duffel sit near the kitchen in K_8.2). Shoes are fine in public interiors (Shanghai teahouse, school stage,
  Wenchang viewing room).
- **Outdoors both kids wear brown Keen-style hiking boots**, like Kenton's (M sheet updated: `M/M_nbp_r4.jpg`; T
  already has them). The red embroidered flats are for dress-up only.
- **DDR is in the DOWNSTAIRS PLAY ROOM** (basement LAN/game room): `media/sets/austin_playroom.jpg`. Maple wood-panel
  game-station walls, beige carpet, a big TV, leather recliners, and a built-in metal DDR pad under a flush floor hatch.
- **Launch viewing (K_1.6/K_4.2):** Kenton is seen from behind, large in the frame, carrying M on his HIP (not his
  shoulders) while she points at the pad or rocket. T holds his hand. The camera is low with a telephoto lens, and in K_4.2
  the rocket glow rim-lights them. (Composition was described in words after a reference painting; the painting was
  never passed to a model.)

### FAMILY HEIGHTS (keep in every frame) — `media/chars/family_heights.jpg`
| | cm | relative to Kenton | landmarks when standing side by side |
|---|---|---|---|
| Kenton | 185 | 100% | — |
| Jade | 165 | 89% | top of her head at Kenton's chin |
| T | 132 | 71% | top of his head at Kenton's chest and Jade's shoulder |
| M | 109 | 59% | top of her head at T's chin, Kenton's belt, just above Jade's waist |

Kneeling on one knee, Jade's head is only a little higher than standing M's. Paste this sentence into prompts:
"HEIGHTS (strict, as in the line-up sheet): standing, the top of T's head is level with his father's chest and his
mother's shoulder; the top of M's head reaches her brother's chin and her father's belt." Check every take; gpt tends
to make T too tall and once drew Kenton headless under M on his shoulders (K_1.6 v2 work take).

### HOME AND SETS (`media/sets/`)
The family lives in **Austin, Texas** (relaxed Scandinavian-minimal house; refs `media/refs/lanparty/`, from
lanparty.house). The kids have been to Shanghai, not Hangzhou. Set sheets, SILK gongbi, 2–3 angles each:
`austin_living_room.jpg` (glass wall, white L-sectional, checker rug, oak kitchen island, glulam beams; reverse: TV
wall, long oak shelf, cat box-shelves, black grand piano; **no high chair**), `austin_roof_deck.jpg` (timber pergola,
grey L-sectional with slate slatted backs, round white swivel chairs, black cable railing, Hill Country view, downtown
far off), `shanghai_puxi_roofdeck.jpg` (Puxi terrace; Pearl, Jin Mao, SWFC, Shanghai Tower left to right; Shanghai
is flat, no mountains). Individual plates: `media/sets/work/`.

### JADE: costume only (her face is handled separately)

**(a) Lunar EVA suit, agency issue (the same suit the crew wears).** Bulky matte-white quilted rear-entry lunar surface
suit:
- rigid hard upper torso, bearing rings at the shoulders, wrists and neck;
- accordion elbows and knees, grey knee and elbow pads, thick grey gloves, chunky grey lunar boots;
- two thin piping lines, azurite blue and malachite green, running in one long gentle curve down the outer arms and
  legs like an apsara's ribbon;
- round bubble helmet with a row of small helmet lights, opaque **gold sun visor down**, slim white life-support
  backpack (the hatch), wrist cuff checklist on the left forearm;
- a small ROUND mission patch on the left chest: the agency emblem (deep indigo disc, thin gold rim, slanted pale-gold
  band of light, one tiny pale-blue dot; `media/chars/identity/emblem_final_small.png`). No red patch;
- charcoal regolith dust on the boots, knees and gloves only.

On the sunlit surface the visor is always down and her face is never visible. The visor reflects the scene (Earth on the
horizon).

**(b) Launch-and-entry pressure suit (capsule).** Loose, baggy, unpressurized soft suit:
- pale white-grey fabric with azurite-blue panels on the shoulders and outer legs, a malachite-green zipper line;
- metal wrist rings, a hose connector on the torso, a checklist pocket on the thigh, black boots;
- soft hood-helmet with a hinged visor, and a blue comms cap;
- the round emblem patch on the left chest;
- folds and wrinkles at the elbows, knees and waist. Not form-fitting.

For LS3 (visor up, under g-load) her face comes from the separate Jade-face pipeline; this sheet gives only the suit.

**(c) Earth, winter at West Lake.** Very long straight dark hair to mid-back; thin dark-framed glasses; long camel-ochre
wool coat with a high collar; soft malachite-green knitted scarf; dark trousers; low black boots.
- **Jade pendant:** a small round flat 平安扣 disc of translucent green jade on a red silk cord, usually visible at her
  collar.
- **Indoor variant:** cream knit sweater, dark trousers, low ponytail (or hair loose). Also her Austin / Shanghai look.
- **Height:** 165 cm. Never generate her face: from behind or lost profile only.
- **Post-flight (K_8.2):** weak after 13 months in 1/6 g; a cane nearby; kneeling is hard (see `docs/research_ddr_homecoming.md`).

### CREW OF GUANGHAN STATION (eight, one Earth-wide agency)

**Shared kit**
- **Suit:** all eight wear Jade's EVA suit (above), in the same design, with the round emblem patch on the left chest.
- **Identification:** each person has a broad **helmet stripe** and a matching **arm band** in their own colour. On the
  polos, that colour becomes the **collar stripe**.
- **Visors:** in sunlight on the surface, visors are DOWN, so tell people apart by stripe colour. Visors go up only in
  shade, inside a hab or rover, or on the lineup sheet.
- **Faces:** flat gongbi with sparse lines, adult and dignified.

**Lineup order on both sheets:** Chen Yu, Anastasia, Adaeze, Arjun, Jade, Lúcia, Kenji, Layla.

| Name | From | Role | ID description | Stripe |
|---|---|---|---|---|
| **Chen Yu** 陈宇 | China (Harbin) | Commander | Chinese man, about 48, broad-shouldered, short neat black hair, calm square face, no glasses, slow smile | **vermilion** #C8312B |
| **Anastasia Volkova** | Russia (Star City) | Flight engineer | Russian woman, about 42, fair skin, ash-blonde hair in one practical braid (off duty), grey-blue eyes, composed; often arms folded | **violet** #6B4C9A |
| **Adaeze Okafor** | Nigeria (Enugu) | Reactor engineer | Nigerian woman, about 40, **deep dark-brown skin** (the darkest of the crew), short natural hair, warm direct gaze | **malachite** #3A8A6E |
| **Arjun Raman** | India (Chennai) | Geologist / ice | Indian man, about 38, medium-brown skin, short black hair, thin moustache, gentle; often holds a rock sample | **ink black** #1B1B1F |
| **Jade Wang** | USA | Mission specialist (ISRU / habitat) | **Face never generated.** Visor down, or seen from behind. In the hab her very long straight black hair is in a low ponytail | **pale celadon jade** #9CC5B0 (matches her pendant) |
| **Lúcia Ferreira** | Portugal (ESA) | Botanist | Portuguese woman, about 34, light olive skin, dark-brown wavy hair tied back, warm smile; holds the seedling | **pale cinnabar pink** #E3A6A0 |
| **Kenji Mori** | Japan (Kamakura) | Robotics | Japanese man, about 45, black hair greying at the temples, slim rectangular glasses, thoughtful; often has a tablet | **azurite** #2F6690 |
| **Layla Al-Mansoori** | UAE (Al Ain) | Pilot | Emirati woman, about 35, dark eyes, long dark hair in a neat low bun (off duty), confident | **gold ochre** #D4A84B |

**Under the helmet:** everyone wears a black-and-white fabric comms cap ("snoopy cap"). Layla's is a comms cap, not a
headscarf.
**Hair in any suit (rule, Oct 8):** no hair ever crosses a helmet rim or neck ring; for walkout, strap-in, launch and EVA long hair is gathered low at the nape (Layla, Anastasia, Lúcia: a low bun; Jade: tied low and the tail tucked down inside the collar); only coasting with the helmet open may it be out (4.7's floating ponytail) (`docs/reviews/rev2_hair_report.md`).

**Galley clothes:**
- soft-white short-sleeved polo with a collar stripe in the person's colour and the round emblem patch on the left chest;
- dark grey multi-pocket cargo trousers;
- grey socks;
- foil drink pouches with straws.

**Skin-tone check, on every take:**
- Adaeze is the darkest and Arjun is medium-brown.
- Grok repaints lightened Adaeze twice in v1. Reject any take that lightens her.
- In v1.1, a grok repaint of the polo sheet also dropped three collar stripes, so the gpt takes are canonical.

### FAMILIES AT HOME (7.C4: "everyone, regardless of background, has someone they miss")

Each crew member has one **home clip**: what is playing on their tablet. Each clip is painted on SILK (gongbi, 青绿,
colour = home), so on the GOLD-paper station the little screens are the only colour.
- **Clips:** `media/keyframes/home/HC_<name>.jpg`. The prompts are in `media/keyframes/home/_prompts/`.
- **Model:** gpt-image-2.5-sunburst, with the Su Hanchen and Qianli refs.

| Crew | Who they miss | The clip | Why it is theirs |
|---|---|---|---|
| **Chen Yu** | His daughter **Tongtong** 彤彤 (6) and his parents, in Harbin | On the frozen Songhua River, Grandpa pushes Tongtong across the ice on a wooden ice-chair sled (冰爬犁). She flings her arms out, red scarf flying. Grandma waves at the phone with the family's red thermos. The old iron railway bridge and the dome of St Sophia are in the haze. | His father taught *him* on that ice. The commander's private smile is the one nobody on the crew has seen. |
| **Anastasia Volkova** | Her son **Misha** (15), in Star City outside Moscow | A kitchen at dusk: Misha on a stool by the double window, birches in snow outside, tea in a metal *podstakannik*, a plate of *sushki*. Frowning, he works out a chord progression: Kino's "Звезда по имени Солнце" (*A Star Called Sun*), which he is learning to play for her landing. | A cosmonaut-town kid learning a song about a star, for a mother who is near one. She listens with one earbud, eyes half shut. |
| **Adaeze Okafor** | Her twin girls **Kamsi and Chidera** (7), and her mother, in Enugu | On the shaded veranda, in matching indigo-and-ochre ankara dresses, Kamsi grins to show the gap where her first front tooth just came out and holds the tiny tooth up to the camera. Chidera laughs on her shoulder. Grandma shells egusi seeds into an enamel bowl. Mango tree, red-earth yard. | A milestone she missed by 384,000 km, delivered with total pride. She laughs into her hand in her bunk. |
| **Arjun Raman** | His newborn daughter, his wife **Meera** and his mother-in-law, in Chennai | Midday, shutters half closed. The baby sleeps in a *thottil*, a sari slung from a ceiling spring, which her grandmother rocks with one hand. Meera, jasmine in her loose hair, leans to the cradle. A kolam at the door. | His daughter was born on mission day ~200. Her naming ceremony happened with Arjun on the video link. He has never held her. He holds the tablet the way you hold a baby. |
| **Lúcia Ferreira** | Her grandmother **Avó Rosa** (85), in the Minho, northern Portugal | In the *quintal* under a grapevine pergola on granite posts, with couve-galega kale, staked tomatoes, a lemon tree, a band of azulejos and a cat on the step, Avó holds up a folded paper packet of seeds she saved and taps it. | The seeds are for Lúcia's growth chamber on the Moon (7.B3). The botanist learned it all in this garden. |
| **Kenji Mori** | His husband **Haruto** and their old rescue dog **Daizu** (brown, greying, one ear up), in Kamakura | On the engawa of their small wooden house at dusk, among Kamakura's June hydrangeas, Haruto lifts Daizu's paw to wave. Sandals on the stepping stone, a water bowl, shiso in a planter, the shoji warm behind them. | The robotics engineer who builds the rabbit rovers misses the least engineered creature alive. He laughs and wipes his eye under his glasses. |
| **Layla Al-Mansoori** | Her father **Saeed** (68), a falconer, outside Al Ain | At dawn on a dune, in a white kandura and ghutra, he lifts the leather hood (*burqa*) off his saker falcon on his gloved fist, and the falcon looks straight into the camera. A pickup truck, a mat with a brass *dallah* and cups. Jebel Hafeet on the horizon. | The pilot's father, who taught her to read wind by watching a bird fly. Falconry is shared heritage (UNESCO) across the Gulf, and personal here. She watches it knees-up in her bunk, chin lifted, the way he taught her to face the wind (v1 had her raise the tablet "like a toast": at arm's length for no reason; retired Oct 7). |
| **Jade Wang** | M (4), T (7) and Kenton, in Austin | M and T waving (covered by 7.C1/7.C5). | Jade's cell is the last one, from behind, with the screen visible. |

**Rules for these clips:**
- These are home videos remembered as paintings: no phone interface, no text.
- In video, the clip plays *inside* the tablet. Composite the HC still (or a 2–3 s i2v of it) into the screen in post.
- Skin tones must be accurate on every family. The Okafor family is painted deep dark brown and the Raman family
  medium brown. Reject any lightening.

**K_7.C4 concept, v2.** The old frame is kept as `media/keyframes/K_7.C4_v1.jpg`.
- **`K_7.C4_grid.jpg`: eight intercut-ready cells (2×4).** Each crew member is alone on GOLD paper, in their bunk or at a
  galley seat, face lit only by the tablet.
  - Shared framing: the figure is in the right half of the frame facing left, and the left and upper thirds stay calm
    indigo for subtitles, so any cell cuts to any other on the kick.
  - Order: Chen, Anastasia, Adaeze, Arjun / Lúcia, Kenji, Layla, Jade.
  - Jade comes last, from behind. Hers is the only screen we see.
  - Individual cells are in `media/keyframes/work/K_7.C4_cells/`.
- **`K_7.C4a–d` (v5): four scenes in four rooms.** In each, the person being shown the clip is in the middle of
  something else and stops to react. Each shot has one focal point: the readable screen, with the real HC still keyed
  in by `tools/screen_comp.py`, and the reaction.
  - **a, airlock suit bench:** Anastasia, in her lower suit and re-taping a glove, laughs at Adaeze's twins.
  - **b, crew quarters:** Chen Yu, toothbrush in hand, and Layla stop at Arjun's bunk to see his newborn.
  - **c, greenhouse:** Lúcia, her arm still in the glove-port with a watering syringe, puts her hand on her heart at
    Kenji's husband and dog on Yuigahama beach.
  - **d, science lab:** Chen Yu, logging sample bags, turns to Layla's falcon.

  Files: `K_7.C4.jpg` (= a) and the sheet `K_7.C4_v5_SHEET.jpg`. The galley-table pairs are kept as `*_v4`, and the
  rejected eight-person group frame as `K_7.C4_v3.jpg`. Jade is not in these shots; her beat is the call home.
- **Edit idea (v5, superseded).** Solitary grid cells first, then the pairs: from alone to together, one focal point at a time.

**K_7.C5a–d: the sharing scenes, v6 (Oct 7 revision; the v5 frames `K_7.C4a–d` are retired).** Jade: "make sure each
scene socially makes sense and if one person is showing something to another person, the scene should be laid out so
that the other person can actually see the screen ... no one's arm should be sticking out behind them."
- **The rule for any shared screen:** two people sit or stand shoulder to shoulder; the tablet is in front of BOTH,
  held by its owner in a relaxed two-hand grip; the friend leans in; both pairs of eyes are on the screen; nobody is
  doing a second task; every hand is accounted for. Stage it in `render/scenes/blockouts/scenes.js` and read the
  report (`render_blockouts.mjs` prints, for each person, how far off the screen's normal they sit, whether anything
  blocks their view, head turn, and any hand behind the body).
- **Why two layouts.** A face that looks at a screen and the screen itself cannot both face one camera (their normals
  are opposed). So a shot shows EITHER the faces in the screen's glow with the tablet from its back (FRONT), OR the
  picture with the two heads from behind (REAR). Each shot has one focal point.

  | Shot | Room | Owner → friend | Clip | Layout, focal point | Behaviour |
  |---|---|---|---|---|---|
  | `K_7.C5a` | galley bench | Adaeze → Anastasia | the twins' first lost tooth | FRONT: Anastasia's laugh | the laugh arrives, fingertips to her lips, she rocks against Adaeze's shoulder |
  | `K_7.C5b` | crew quarters, Arjun's bunk edge | Arjun → Chen Yu | the newborn in the *thottil* | REAR: the picture, cradled in Arjun's hands | Chen Yu's arm round his back, the hand pats his far shoulder |
  | `K_7.C5c` | greenhouse, hips against the bench | Kenji → Lúcia | Haruto waving Daizu's paw | FRONT: Lúcia's face | hand on her heart, her head tips to his shoulder (the wave is gone since Oct 8: it was a third hand) |
  | `K_7.C5d` | airlock suit bench | Layla → Jade (from behind only) | Saeed and the falcon | REAR: the picture | Jade tips her head onto Layla's shoulder |

- **Edit (v6):** alone, alone, together — four times. Each sharing scene follows the two singles of the people in it
  (Adaeze, Anastasia → a; Arjun, Chen Yu → b; Kenji, Lúcia → c; Layla → d → Jade alone, waving back at her children),
  and Jade's single leads into the call home (7.C1). The faces are seen in the singles; the REAR shots can then give
  the picture.
- **Chen Yu** is 48: grey at the temples, a few fine lines at the eyes (he read too young in the v5 frames).
- **Skin tones:** Adaeze's skin in `K_7.C5a` was deepened locally after generation (face mean RGB 108/69/42).
- The home pictures are keyed into flat-green screens with `media/keyframes/work/rev_calls/comp_screen.py`
  (line-fitted corners; `tools/screen_comp.py` goes wrong when thumbs cover a corner).

### ROBOTS

**YUTU-A / YUTU-B v2 (jade-rabbit rovers).** Sheet: `media/chars/robots/SHEET_yutu_v2.jpg`. They are twin
**wheel-legged quadrupeds** about the size of a large dog, in the spirit of the Unitree B2-W / Go2-W wheel-legged robot
dogs.

**Body**
- compact rounded white shell like a crouching rabbit, with light-grey joint housings and thin azurite trim;
- a dark sensor face with two round camera eyes;
- a cargo rack with a sample box;
- the round emblem decal on the flank (no red, no letters).

**Legs and wheels**
- Four legs, each with a hip and a **knee that bends either way**.
- At each foot there is a **powered hub wheel**: a woven **wire-mesh tyre** with titanium chevron treads. There is no
  rubber on the Moon.

**Ears**
- Two tall, flat, **vertical solar panels** on a turret: pale, greyed azurite cells in a white frame.
- They also serve as the antennas.

**Dust:** charcoal regolith on the wheels, lower legs and underside only; the upper shell stays clean.

**Poses** (as on the sheet):
- rolling low on its wheels;
- walking over rocks with the wheels locked and the knees bent in opposite directions;
- ears turned sideways toward a low Sun;
- **transport fold**: legs tucked, ears folded flat along the back;
- hauling a regolith sledge;
- sitting on its haunches like a resting rabbit, with the short belly sampling auger down and the camera mast up
  (the sheet draws this auger too long: it is hand-drill size, 10–20 cm, see Payloads).

#### How Yutu works (engineering notes for animators and prompts)

**Mobility**
- **Rolling** is the default on the flat, compacted regolith between base and pad: wheels on, legs low and wide, about
  1 m/s, the cheapest way to move.
- On boulder fields, crater rims and loose slopes, the wheels **lock and it walks**.
- The **knees flip** (forward-bent or back-bent) to keep the body level on a slope and to kneel or climb. That is the
  Unitree-style trick: it rolls like a car and steps like a dog.
- At 1/6 g, a robot of about 70 kg weighs only about 12 kg-force, so the legs are light and the steps are springy. Footfalls
  throw dust in short **parabolas that drop at once**, with no clouds.

**Power: why the ears stand up**
- At the lunar south pole the Sun never rises more than about 1.5° above the horizon. It circles the horizon once a lunar
  day (about 29.5 Earth days).
- A flat, horizontal panel would see almost nothing. Like the base's tall masts, Yutu's panels stand **vertical**, and
  the ear turret **yaws to keep them broadside to the Sun** as the Sun circles and the rover turns. When both ears swivel
  together, that is not a cute rabbit gesture: they are tracking the Sun.
- About 0.3 m² of cells gives roughly 120 W in full sun.
- A battery of about 2 kWh carries it into shadow. It recharges on the base's charging pads.

**Comms**
- Each ear carries a thin edge-mounted antenna strip, so **the ears are also the radio**. Turning toward the base mast
  and turning toward the Sun are a negotiated compromise.
- Inside crater shadows, where there is no line of sight, A and B leapfrog: one waits on the rim as a relay while the
  other goes down.
- Nothing talks to Earth directly; everything goes through the station's dish.

**Payloads**
- **Regolith sledge** on a tow bar, carrying feedstock for the regolith printer and ISRU reactor.
- **Belly sampling auger: short, hand-drill size (10–20 cm), for surface scoops only.** Yutu sits on its haunches to
  use it, which makes a stable three-point stance. **Yutu does not carry the 1 m ice drill and nothing rigid ever joins
  Yutu to it.** A 70 kg robot weighs 113 N on the Moon; the TRIDENT-class drill needs 100–500 N pressed on the bit and
  must not shift by millimetres for an hour (`docs/companion_moon_experiments.md` §14c). In the shadowed crater with
  Arjun (7.B1) the drill stands on its own braced, ballasted frame; Yutu tows that frame out folded on its sledge, then
  stands 3–4 m off as work light, power supply (one slack cable on the ground), sample-canister carrier and radio relay.
- **Telescoping camera mast** between the ears: stereo pan-tilt camera plus lidar.
- **Back rack** with a sealed sample box.

**Dust**
- Lunar dust is sharp, abrasive and electrostatically clingy.
- Joints have bellows boots, and the mesh wheels let dust fall through.
- The panel cover glass carries electrodynamic dust-shield traces, and the ears shake themselves clean with a small
  shiver (a nice rabbit-ear flick).
- The white shell stays clean above the knees.

**Thermal (night and shadow)**
- Shadowed ground sits around −170 °C, and the floors of permanently shadowed craters near −230 °C.
- The body is an insulated warm box: multi-layer insulation under the white shell, electric heaters, and a small
  radioisotope heater unit (the trick Lunokhod and Chang'e-3 used) to keep the battery and electronics alive.
- On long shadow forays or when parked, it folds into the **transport pose**, with the ears folded flat over the back
  like a lid, and sleeps.
- The white shell reflects sunlight on the lit side, so it does not overheat at sunrise.

**Behaviour cues**
- Ears up and turned means charging or listening.
- Sitting on its haunches means sampling or waiting.
- Folded means asleep or in transport.
- Yutu-A and -B usually work as a pair.

**Regolith printer.** Tall open gantry of white trusses on four big wheels:
- bridge beam with a print head extruding an ember-orange molten-regolith bead that cools to grey;
- grey regolith hopper on top, azurite cable runs;
- prints beehive-kiln domes in layered grey courses.

**Humanoid helper.** About 1.2 m tall, slender, white:
- rounded head with a single horizontal dark visor slit;
- three-fingered hands, light-grey joints, malachite trim;
- carries a blue-green tool case.

**M's toy robot dog (design of the Oct 7 revision; in no shot since Oct 8, when Jade had 7.C2's toy changed to the cat): `robots/SHEET_toydog.jpg`, model `render/scenes/blockouts/toy_dog.js`.**
The toy M actually owns is a toy company's miniature copy of the Unitree Go2, and like the Go2 **it has no head**
(Jade, Oct 7). References and their sources: `media/refs/robot_dog/SOURCES.md` (best: `toyA_grey_q28_hero.jpg`).
- **Size:** 30 cm long, 11.5 cm wide, 20 cm tall at the back when standing: mid-shin on M. Reared up on its hind legs
  it reaches her knee. It is a chunky mass-produced plastic toy, never a real robot.
- **Body:** ONE flat, rounded box. **No head, neck, face, eyes, ears, snout, tail, collar or scarf.** The front end is a
  blunt end-cap with a recessed dark glossy visor window lit pale blue.
- **Legs:** four identical thin legs on round hubs at the corners; all four knees point backward; slim shins; small
  dark rounded nub feet.
- **Colour:** matte light silver-grey, mid-grey joints, a thin blue light stripe on each flank. No logos.
- **How it moves:** a slow, stiff, shuffling trot with the body rocking. Its "dance" is on the spot: bobbing push-ups,
  weight shifting left and right, one front leg lifted and waved, then rearing up on its hind legs with the front legs
  pawing. No head turn, no tail wag; slightly jerky with short pauses. It cannot hop or jump.
- **Image models give it a head every time** (two sprite attempts and two full-frame attempts in
  `media/keyframes/work/rev_calls/`). Do not ask a model to draw it: render the 3D model from the shot's camera
  (`cd render && node scenes/blockouts/render_blockouts.mjs --scenes toy_dog_rear,toy_dog_stand`) and composite it at
  true scale, as in `K_7.C2_v5`. The same sheet's family cat is unchanged: a long-haired brown mackerel tabby with a fluffy
  ruff and plumed tail (`robots/SHEET_pets.jpg`; the dog drawn on that sheet is retired).
- **The cat in shots:** `K_7.C2` v6 (seated beside M, batting at her hem; ear tips 47 cm above the carpet at M's depth,
  head with ruff 15 cm: a big long-haired cat, its shoulder just above M's bent knee) and `K_7.C3` (curled against her on
  the sofa). It behaves as a cat: it sits, watches, bats, flicks its tail; it does not dance.

**Robot dog (retired v1, beagle-style; dances with M).** Beagle-sized consumer quadruped, smooth rounded white shell with soft grey legs:
- big dark face mask with two round dark eyes, grey floppy ear flaps, stubby tail;
- vermilion collar with a small brass bell.

Friendly and toy-like. Stands on its hind legs to "dance", holding M's hands.

### PROPS

| Prop | Description |
|---|---|
| **Toy Earth** | Grapefruit-sized sphere hand-painted in 青绿 (Qianli Jiangshan) style: azurite oceans, malachite continents with tiny painted mountain ridges, white 祥云 cloud scrolls. No stand. T's; it travels to the Moon with Jade. **Its coastlines are real** (since Oct 8: Natural Earth land, `tools/globe_ortho.py`; painted reference `media/keyframes/work/rev3_kids/beam_painted_clean.png`): a simple toy map, never an invented one. In the lesson (3.4) the Moon's shadow falls on central Anatolia. The globes painted before that date in 3.5, 4.7 and 8.3 still carry invented continents. |
| **Toy Moon** | **About a third of the toy Earth's diameter** (a small ball that fits in M's two hands; Jade confirmed the small Moon on Oct 8: the true ratio is 0.27, and it is what lets its shadow fall as a round spot on the globe in 3.4). Matte pale grey with darker grey maria and a few ink craters. M's; it stays home. (The props sheet `props/SHEET.jpg` still draws the two the same size: follow this row, not the sheet.) |
| **Celadon tea cup** | Small Song-style Longquan celadon bowl, pale jade-green glaze with fine crackle, small foot. It reflects the Moon (V2) and Earth (the drop). |
| **Flashlight** | Ordinary camping flashlight, matte vermilion body, black knurled grip, round lens. The beam is a soft pale warm wash. It is the Sun in the Copernican lesson. |

### AGENCY IDENTITY: emblem and seals (`tools/seal.py`; full rationale in `docs/identity.md`)

- **Agency emblem (no red):** a tiny pale-blue dot (#A9C8E6), off-centre, inside a slanted band of scattered sunlight on
  deep indigo (#16213E), with a gold rim. It quotes Voyager 1's 1990 *Pale Blue Dot*. Files:
  - `media/chars/identity/emblem_final.{svg,png}` for 64 px and up;
  - `emblem_final_small.{svg,png}` for patches, decals and icons.

  It goes on every suit (left chest), polo (left chest), rover (flank) and HUD card.
- **Seals (vermilion, characters only):**
  - `seal_wangyue` 望月 (朱文) is the film's signature seal: title, 7.E3, end.
  - `seal_guanghan` 廣寒 (白文) is the station's seal: 3.5 letter, 5.2 site stamp.

  Glyphs are public-domain Shuowen small-seal forms re-stroked procedurally, so no font licence is needed.
- **Retired:** `media/chars/seal/seal_dot.*`. A centred disc in a red square reads as the Hinomaru. The 九叠篆 font
  (non-commercial) is no longer used.
- **Rule:** never ask an image model to draw a seal or a legible emblem. Describe the patch in words, then composite the
  real PNG/SVG in post wherever it reads.

## Continuity rules for video prompts
1. Attach the canonical SHEET as a reference and paste the ID block verbatim.
2. Visors are down in sunlight. Faces show only in shade or interiors, or on the LS3 capsule shot.
3. Kenton is shown from behind, 3/4 back or at a distance (a small far face is OK). Jade's face appears only through the
   separate Jade pipeline; in generated frames she is from behind or lost profile only.
3b. Heights per `media/chars/family_heights.jpg` (185 / 165 / 132 / 109 cm) in every frame; on screen the kids are only "M" and "T".
4. T holds the Earth and M holds the Moon. The toy Earth goes to the Moon with Jade; the toy Moon stays home.
5. Crew are identified by stripe colour. Keep the eight colours fixed. Jade's pale celadon and Adaeze's deep malachite are
   the closest pair, so tell them apart by value and keep them apart in wides.
6. The round emblem patch appears on every suit (left chest), polo (left chest) and rover (flank). It is never a red
   square and never has letters. Vermilion is only for the carved 望月 and 廣寒 seals, which are composited in post.
