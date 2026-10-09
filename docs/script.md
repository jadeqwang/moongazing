# 望明月 · Moongazing — Shooting Script v1

Song: 212.0 s. Times are song seconds (see `analysis/song_map.md`, `analysis/beatgrid.json`). Cuts land on downbeats
unless noted; sung lines start ~0.2 s *before* the downbeat, so lyric type leads the cut by 0.2 s.

## Concept in one breath
A handscroll that unrolls from right to left — from West Lake to the Moon. Chang'e flew to the Moon and could never
come home; a modern mother goes back, with a return ticket. **Color is home**: Earth scenes are painted in the azurite and
malachite of Song-dynasty blue-green landscapes on silk; the Moon is pure ink; the only colored thing on the Moon is
Earth itself. The scroll tears in two at stage separation and is rejoined at the reunion (as 富春山居图 — burned and split in 1650,
one half kept in Hangzhou, one in Taipei — was shown together again for one summer in 2011).

## Papers (style system — see docs/treatment.md)
- **SILK** 绢 — Earth / memory / family. 青绿 mineral color, gongbi line, vermilion seals.
- **INK** 宣 — the Moon. Monochrome ink on xuan; Earth is the only color.
- **GOLD** 磁青泥金 — night, launch, space, the drop. Gold-ink line on indigo; glows on the drop.
- **RUBBING** 拓 — the breakdown only. White-on-black stele rubbing (an inversion of INK).

## Revision notes v1.2 (user check-in 1, 2026-10-07)
- Kids are **M** (4, 109 cm) and **T** (7, 132 cm, head 20–25% larger) — true heights vs Jade 165 cm, Kenton 185 cm. Home is Austin
  (Scandinavian-minimal, lanparty.house); the kids know Shanghai, not Hangzhou. Kenton: curly dark-blond hair, black cargo pants,
  hiking boots, grey tee, navy fleece.
- Crew of 8: Jade Wang (USA), Chen Yu (China, commander), Anastasia Volkova (Russia), Adaeze Okafor (Nigeria), Arjun Raman (India),
  Lúcia Ferreira (Portugal/ESA), Kenji Mori (Japan), Layla Al-Mansoori (UAE). Each has a specific person at home (7.C4).
- Agency emblem: a pale-blue dot in a Voyager-style sunbeam (no red). Red seals are character chops only (廣寒, 望月).
- Moonbase layout is canonical per docs/guanghan_layout.md + 3D blockout guides; every moonbase shot must match.
- 1.6/4.2: cheering crowd behind a safety fence, M on Kenton's shoulders. 6.1 + 8.4: Austin roof deck. 7.C2 + 8.2: Austin
  living room (homecoming: M runs and bowls Jade over). 3.4: the lesson shows a total solar eclipse (Halys Easter egg).
- 6.2 (revised Oct 7 evening): Jade does not lower her head. She turns toward the Earth and lifts her face to it: "home" is the salient word, not "down". The Earth is FULL and recognisable, drawn by the engine (`render/src/scenes/earthview.js`), never by an image model. For that to be true the breakdown moves from Mid-Autumn night to the new Moon fifteen days earlier (2037-Sep-10 02:30 UT; on every Mid-Autumn 2035–2040 the Earth is below Guanghan's horizon and unlit): 6.1 becomes the children's rehearsal on a moonless night. See `docs/technical_accuracy_notes.md`, "Earth from Guanghan".
- Yutu rovers: wheel-legs; ears = vertical solar panels + antennas.

## Cast
- **Jade** — mother, astronaut, mission specialist (ISRU / habitat). Green jade pendant. Glasses always, including inside the helmet (real astronauts wear them).
- **Kenton** — father; wears glasses similar to Jade's. Appears in ≤6 shots, mostly back/hands/wide.
- **M** (girl, 4) — loose light-brown waves, long bob; white dress with red strawberries; plays Chang'e in the school play.
- **T** (boy, 7) — very dark hair, large round head, full cheeks, big eyes, strong brows; holds the toy Earth.
- **Crew of Guanghan Station** (one Earth-wide agency; emblem = a pale-blue dot in a Voyager-style sunbeam, no red — see docs/identity.md):
  Jade Wang (USA, ISRU) · Chen Yu (China, commander) · Anastasia Volkova (Russia, flight engineer) · Adaeze Okafor (Nigeria, reactor)
  · Arjun Raman (India, geology/ice) · Lúcia Ferreira (Portugal/ESA, botany) · Kenji Mori (Japan, robotics) · Layla Al-Mansoori (UAE, pilot).
- **Robots** — quadruped "rabbit" rovers named Yutu-A/B (jade-rabbit nod), a regolith printer, a small humanoid.
- **Props that travel**: the **toy Earth** (T's, from the Copernican lesson → goes to the Moon with Jade);
  the **toy Moon** (M's, stays home); the **tea cup** (reflects the Moon in V2, Earth in the drop).

## Lip-sync clips (none on screen after the Oct 7 lip-sync audit; see `docs/reviews/rev_lipsync_report.md`)
- ~~LS1~~ retired as a sung close-up (revision Oct 7: no Seedance take kept the mouth in time with the words). 2.3 (39.53–43.16, "the West Lake wind sings over water") is now a rear three-quarter view of the same boat, `J_LS1_back` → `LS1_back/take_2`: Jade sings to the lake beside her mother and neither mouth is in view.
- ~~LS2~~ removed (revision Oct 7 evening: the lip-sync did not hold up). 3.4 is now three views of the lesson with no singing face.
- ~~LS3~~ retired as a sung close-up (same audit): 4.3 (81.5–82.9, "我思念") is a non-singing launch reaction, `J_4.3/take_1`, with the calligraphy carrying the words; the held 你 cuts to the kids at the splash park (4.3b).

---

## 0 · COLD OPEN / INTRO A — 0.00–15.67 (guzheng, erhu; no vocals)
Goal: every second beautiful or a question. Story text carries the hook (no lyrics until 32 s).

| ID | Time | Picture | Type layer | Paper / Method |
|---|---|---|---|---|
| 0.1 | 0.00–1.78 | Blank xuan paper. A single drop of ink falls and blooms — the bloom becomes a perfect full Moon. | — | INK · JS (fluid ink bloom) |
| 0.2 | 1.78–2.84 | The ink Moon resolves into the *real* Moon (photographic grey = ink granulation). Erhu sighs. | small, top-right vertical: 嫦娥奔月 | INK · JS (shader Moon) |
| 0.3 | 2.84–5.86 | BOOM → Chang'e in flowing silk rises past the Moon, painted in gongbi; ribbons trail like a rocket's exhaust. | **"Long ago, the legend says, Chang'e flew to the Moon."** | SILK · still→h3 + roto |
| 0.4 | 5.86–9.14 | Chang'e on the Moon in a pale palace (广寒宫), the jade rabbit at her feet, looking back down at a small blue-green Earth. | **"Unable to return home."** | INK w/ Earth color · still→h3 |
| 0.5 | 10.09–13.10 | The rooftops of a Tang city on Mid-Autumn night, a lake and hills behind; a festival street runs through the roofs and its crowd walks with hand lanterns (porters, children, a fish lantern, food stalls), families in the courtyards look up, sky lanterns rise over the lake; a low amber full Moon sits whole just above the hills at the upper left (rev3, Oct 8). | **"In 726, Li Bai looked up at the Moon and wrote about missing home."** (李白 · 静夜思) | SILK night · Seedance 2.0 + roto (`K_0.5/take_5`) |
| 0.6 | 13.10–15.67 | A terrace on the Bund side of the Huangpu at Mid-Autumn, the Lujiazui skyline painted as a Song scroll: M holds a toy Moon up against the real one, arms wobbling; her mother crouches beside her (back to us), settles onto one knee and turns her head a little to her. The river carries its real traffic (rev3, Oct 8; references in `media/ref/rev3_open/`): a tarpaulined cargo barge and a coal barge heading one way, the cross-river ferry and a sightseeing boat strung with coloured light the other, a light-strung mock sailing ship. The camera tilts down from the whole Moon to the two of them. | — (breathing room) | SILK · Seedance 2.0 + roto (`K_0.6/take_5`) |

## 1 · INTRO B — 15.67–32.42 (bass 17.1; taiko 17.54/21.30/25.01/28.75; vocalise 18.6–29.3)

| ID | Time | Picture | Type layer | Paper / Method |
|---|---|---|---|---|
| 1.1 | 15.67–17.54 | The Moon over the rooftop; a gold line begins tracing a trajectory from Earth to Moon across the night (ink → gold). | — | GOLD · JS |
| 1.2 | 17.54–21.30 | **TAIKO** — hard cut: a rocket on its pad at night, drawn in gold jiehua line on indigo, floodlights as gold rays. | **"Every space program on Earth / is building the / International Moonbase."** 全世界的航天计划共建国际月球基地 (Jade's wording, Oct 8) · HUD: INTERNATIONAL MOONBASE · LUNAR SOUTH POLE · EST. 2035 | GOLD · still+JS line-draw |
| 1.3 | 21.30–22.75 | Teaser flash (taiko): M on stage wires as Chang'e, rising. | — | SILK · gen-v roto |
| 1.4a | 22.75–24.08 | Voice blooms → THE WALKOUT, before dawn, seen from the FRONT (flight E1-B; rev3, Oct 8: the counterpart of 3.8b's rear view). A low camera on the wet apron: Adaeze leads Anastasia, Arjun and Lúcia toward us and to the left, toward the floodlit rocket small on the horizon (bare capsule, escape tower); whole figures with reflections, four sizes in depth. Nobody in step: Adaeze's eyes on the rocket, Anastasia finishes a small wave, Arjun looks up, Lúcia at the ground ahead. Soft helmets thrown back (long hair in low buns, nothing over a neck ring). Each carries a portable ventilation unit (lunch-box size, as Soyuz and Apollo crews do: `media/ref/rev3_astro/`) in the left hand, its one hose plugged into the unit and the belly fitting. One subject: Adaeze. | — | GOLD paper · K_1.4a (v5) → h3 `take_7` from its first drawings at rate 1 + flat redraw |
| 1.4b | 24.08–25.01 | At the foot of the tower (flight E1-A): Chen Yu looks up at the vehicle on the vocal peak (G#5 at 24.7); Layla and Kenji behind him, Jade farthest, seen from behind, her hair gathered at the nape and tucked inside the suit collar (no hair crosses a helmet). Never more than four suited crew in a launch-day frame. | — | GOLD · K_1.4b → gen-v + roto (painted faces held) |
| 1.5 | 25.01–26.87 | Taiko → Guanghan Station in shadow, warm lit portals between regolith berms, a tiny Earth on the horizon. | — | INK · still+parallax |
| 1.6 | 26.87–28.72 | The family on the Wenchang shore in pre-dawn blue hour, seen from behind: Kenton holds M on his right hip, her left arm round his neck, her free right arm pointing at the rocket waiting on its lit pad across the water (right of frame); T holds Kenton's left hand; all three look at the pad; a thin waning crescent low in the east; the crowd behind the safety fence. Staging: render/scenes/blockouts/1.6_4.2. | — | SILK · K_1.6 → h3 + roto |
| 1.7 | 28.75–30.57 | **TAIKO** — Title: the vermilion seal STAMPS onto the paper: 望明月 MOONGAZING. | **望明月 / MOONGAZING** (huge) | SILK · JS |
| 1.8 | 30.57–32.42 | Drums cut. The title ink dries; one brushstroke sweeps down — a single willow switch. | credit, small: Jade Wang | SILK · JS |

## 2 · VERSE 1 — 32.42–47.12 (guzheng + voice, no drums) — "inscription" lyrics
English lyrics: refined serif, small, horizontal, in the 留白; Chinese inscription vertical, top-right, with seal.

| ID | Time | Picture | Lyric | Method |
|---|---|---|---|---|
| 2.1 | 32.14–35.85 | West Lake in winter. Broken Bridge under thin snow; the camera pans right→left along the scroll. Slender willows. | The willow in winter is slender, | SILK · still→h3 (slow pan) + roto |
| 2.2 | 35.85–39.53 | Close: willow switches hanging plain and straight → match cut: M's silk dance ribbons hanging straight in a rehearsal room; Jade's hands correcting the girl's arm (Chang'e pose). | her switches plain and straight; | SILK · gen-v + roto |
| 2.3 | 39.53–43.16 | A canopied West Lake rowboat (西湖手划船) seen from behind, three-quarter: Jade (long hair, teal coat, one hand on the rail) sings to the lake beside her mother (grey beanie, plum coat); the bridge and the pagoda shore across the water. Neither mouth is in view (rev Oct 7 lip-sync fallback). | the West Lake wind sings over water | SILK · Seedance 2.5 `LS1_back/take_2` + roto |
| 2.4 | 43.2–45.3 (insert) | Jade's hand smoothing the silk of the Chang'e costume on an ironing board → silk ripple dissolves into lake ripple. | (continues) | SILK · gen-v |
| 2.5 | 45.29–46.82 | Fill (kick lead-in): the teahouse has soaked up through the white silk at the end of 2.4. Same take as 3.1, already moving: Jade's mother pours with her eyes on the stream; Jade turns and bows her head toward M at her side, who tilts her face up; the paper umbrella tips back. | ("…silk and late" holds) | SILK · J_3.1 v3 keyframe → h3 take_6 + roto (0.21 s in, rate 0.7) |

## 3 · VERSE 2 — 47.12–76.11 (kit 47.14; strings 51; full band lift 61.65)

| ID | Time | Picture | Lyric | Method |
|---|---|---|---|---|
| 3.1 | 46.82–50.49 | Afternoon teahouse above the lake (lattice windows, snow outside), three generations at the table, one continuous take from 2.5. Jade kisses M on the forehead: lips touch just after the cut, the kiss settles on the kit hit (47.14), M's eyes shut in a smile; released on "watching" (48.9); Jade draws back a little and keeps looking at her daughter, who beams up at her. Jade's mother watches the tea she is pouring the whole time (celadon pot held by its handle, fingertips on the lid, thin stream into the cup until about 48.2), then rights the pot. Only the mother's painted face is carried; Jade's turned face is the take's. | in afternoon teahouses watching | SILK · J_3.1 v3 keyframe (mother's eyes lowered) → h3 take_6 + roto (mother's face kept; retimed 1.06 / 0.75) |
| 3.2 | 50.49–52.06 | Macro on the bowl of tangyuan, one bitten into a crescent: a waning moon (月缺) on the porcelain spoon. The hand holding the spoon tilts and turns it the whole shot, the tangyuan rocks in the broth, steam drifts; her mother's sleeve enters at the right as we cut. | snow-brewed tea. | SILK · J_3.2 → h3 take_3 + roto |
| 3.3 | 52.06–54.09 | The inscription 举杯邀明月 is old ink on the teahouse wall from the first frame. Jade's index finger (jade bangle) reads down the column beside it in ONE even, unhurried glide (rev 3, Oct 8: no dwell at each character), hovering off the wall: beside 举 at the cut, 月 at the end, easing off a little. The line itself is sung in the next shot. | That line— | SILK · K_3.3_hand v2 → Seedance 2.0 take_6, resampled to an even glide (`tools/glide_resample.py` → take_6g, drawn on ones) on the clean wall plate K_3.3_wall + roto; JS calligraphy on the wall |
| 3.4 | 54.09–57.85 | Night, home, every lamp off. Copernican lesson: Jade (from behind) holds a flashlight (the Sun, the only light); M holds the toy Moon out into the beam; T holds the toy Earth. Three views of one staging (3D blockout `render/scenes/blockouts/3.4_lesson/`): **3.4a** 54.09–54.97 the room wide; **3.4b** 54.97–56.21 the side view: the warm beam cone, the Moon ball's darker shadow shaft ending as a dark round spot on the globe (a solar eclipse, physically right), the two children's plain cast shadows in the pool of light on the wall; **3.4c** 56.21–57.85 close along the beam: M holds the Moon still, T watches the spot, then turns from the globe and grins at his sister. The toy globe has real coastlines (Europe, Africa, Arabia, India in view) and **the Moon's shadow rests on central Anatolia** in all three views: Jade's Easter egg for her Battle of Halys film (the eclipse of 585 BC on the Halys, today's Kızılırmak; rev3, Oct 8; map and check in `media/ref/rev3_kids/`, `tools/k34_globe.py`). The toy Moon is about a third of the toy Earth. No corona disc, nothing brighter behind an opaque ball than the open beam. | **举杯邀明月，对影成三人** (big calligraphy across the dim wall) + English gloss | SILK · keyframes K_3.4_lesson / K_3.4_wall / K_3.4_beam → h3 takes + roto (whole picture redrawn) |
| 3.5 | 57.85–61.65 | The mission assignment (top-down on her desk in lamplight, T's toy Earth at the left). The formal signed paper copy, handed to her after the chief's call: she already knows. Three shots at real speed (rev 3, Oct 8). **3.5a** 57.85–59.31 Kenton's larger hand (navy fleece cuff, from the right) lets go of the envelope and withdraws; the FRONT lies flat and legible: emblem, FLIGHT CREW OPERATIONS, **MISSION ASSIGNMENT** / 飞行任务通知书, Dr. Jade Wang, Astronaut Office; her right hand is on its corner, her left leaves the toy Earth and reaches for it. **3.5b** 59.31–60.29 (on "homesick", closer) she picks it up and turns it over with both hands: the printed front swings and tilts away (the type follows the face through the turn), it stands on edge, the back comes round and down, the unsealed flap falls open (no seal). **3.5c** 60.29–61.65 she draws out the letter, folded in three, by its top edge; the top third swings open and the inside is printed (lines of type too small to read, a tiny round emblem). | I think of you — homesick with waning | SILK · keyframes K_3.5_front (hand-over; blank paper), K_3.5_letter → K_3.5_letter_end (first and last frame) → sd2.0 takes + roto (K_3.5_front/take_4 for 3.5a and 3.5b, K_3.5_letter/take_1); the envelope front's type composited in JS on tracked paper (`render/src/scenes/papertype.js`, `tools/paper_track.py`); the letter's print is baked illegible bars |
| 3.6 | 61.65–64.7 | **BAND LIFT** → TRAINING MONTAGE (cuts every beat/2 beats): centrifuge spin · NBL pool in suit · parabolic flight float → she wobbles off, doubled over a bag, heave → CUT · wushu stance ≈ EVA posture · geology hammer in Iceland lava · math/orbital mechanics at a desk at 3 a.m. | homesick with waning | SILK→GOLD · stills+gen-v, roto; NASA-worm-era HUD labels |
| 3.7 | 65.75–71.19 | The last evening before quarantine, Shanghai Natural History Museum: Jade holds M on her hip; both look DOWN at a glowing relief map of the Earth (dinosaur shadows on the wall). M reaches toward the mountains. Foreshadows 低头思故乡. The toy Earth is already packed in her kit. | moons and lonely wine. | SILK · codex from photo → Seedance + roto |
| 3.8 | 71.14–76.11 | Strapping in: six moving shots of different crew in real procedural order (`docs/research_capsule_interior.md` section 7; two crews of four, never more than four in frame; no fairing on the capsule; no red on suits). **a** 71.14 glove lock in the suit-up room (a technician's bare hands turn the wrist ring; the fingers flex) · **b** 72.05 walkout before dawn, Flight E1-A from behind, the nearest raises an arm, the Wenchang tower far off · **c** 72.95 white room, seen through the door frame: a closeout technician guides an astronaut feet-first through the side hatch · **d** 73.85 the harness hauled tight, straight down on the seat · **e** 74.30 Jade's buckle: the last tongue goes home, CLICK on 74.4 · **f** 74.75 her visor comes down, her hand lowers, her helmet turns to the small laminated photograph of M and T taped beside her window (tower steelwork in the window). Cut to ignition. | HUD: T-minus countdown; HARNESS · LOCKED on 74.4 | GOLD (indigo paper; suits in pale wash and azurite, gold line) · keyframes K_3.8a–f → sd2.0 / h3 takes + roto |

## 4 · HOOK — 76.11–101.33 — LAUNCH (GOLD paper; lyrics HUGE, brushed by the exhaust)

| ID | Time | Picture | Lyric | Method |
|---|---|---|---|---|
| 4.1 | 76.11–78.9 | Impact 76.17 = IGNITION. Splashed-ink (泼墨) exhaust in gold and ember on indigo; the tower falls away. A waning crescent Moon above. | **月缺** — written by the exhaust plume | GOLD · JS over the K_4.1 painting (`LIFT` shader in `04_hook.js`; rev3: the whole exhaust is live for the whole shot: three flickering flames, a trail anchored to the world that lengthens, widens and thins as the rocket climbs, the painted ground cloud spreading and rolling) |
| 4.2 | 78.96–81.46 | The same spot and staging as 1.6, a few minutes later: the rocket climbs on its kerosene-bright plume at the right; M (left arm round Kenton's neck) points up at it with her right arm, T holds Kenton's left hand, all three follow it with their heads; the crowd at the fence cheers; the roar arrives ~12 s later (nobody covers their ears). | **酒寒** (held 寒), upper right, beside the rocket's column and above the crescent | SILK night · K_4.2 → gen-v + roto |
| 4.3 | 81.5–82.9 | Inside the capsule, seconds after liftoff, from behind Jade's left shoulder: strapped in, visor down and clear, mouth closed, she tips her head toward the snapshot of M and T taped below the window (the one 3.8f ends on). She does not sing; the snapshot is the only warm colour. | **我思念** | GOLD line, chalk-white suit (the 3.8 look) · `J_4.3p/take_1s` (rev4; keyframe `jade/J_4.3p.png`) |
| 4.3b | 82.8–86.16 | The held 你 lands on who she misses: summer at an Austin splash park — M in pink running through the water arcs, T in his creeper swim shirt grinning in the spray. The warmest frame in the film. | **你** (one huge character, held) | SILK summer · still→Seedance + roto |
| 4.4 | 86.62–88.6 | HUD `MET 00:02:41` — first-stage separation = THE SCROLL TEARS: the frame rips along a jagged paper edge; the lower half (Earth, family) falls away with the booster. | **I think of you,** | GOLD+SILK · JS paper tear |
| 4.5 | 88.6–90.55 | Kids in the mission family viewing room at Wenchang, faces lit by the big screen; T's hand on the glass. | **I think of you** | SILK · still+parallax |
| 4.6 | 90.7–92.1 | Ad-lib → Orbit: Earth fills the frame for the first time — it IS a 青绿 painting: azurite oceans, malachite land, white clouds. | — | JS Earth (shader) |
| 4.7 | 92.21–94.90 | After the TLI burn cuts off. In free fall, Jade (from behind; low ponytail of mid-back length floating loosely) lifts a drink pouch toward the Moon in the window — 举杯. The toy Earth floats and turns beside her. | **举杯邀明月** (calligraphy floats too) | GOLD · gen-v + roto |
| 4.8 | 94.9–98.45 | The Moon grows from a dot to a wall of ink. Paper changes GOLD → INK as it fills the frame. | moons and lonely wine | INK · JS |
| 4.9 | 97.73–101.33 | Drums re-hit 97.73: HUD `DAY 4 · DESCENT` — the separate lander (Lanyue-like) comes down; the plume blasts regolith into flat, straight radial sheets (no billow) that stop the instant the engine cuts. Touchdown. | — | INK · h3 + roto (physics) |

## 5 · INTERLUDE — 101.33–112.07 (erhu 101; riser; IMPACT 104.92; stop-start stabs; dip 109.5)

| ID | Time | Picture | Type | Method |
|---|---|---|---|---|
| 5.1 | 101.33–104.92 | HUD `+6 h · EGRESS`. First steps: boot print (ink stamp) in regolith. Long, long shadows (Sun at 1°). Crew loping in 1/6 g. | — | INK · h3 `K_5.1/take_5` (one-sixth-g prompt: slow long strides, boots planted, all three travel) at rate 1 + roto |
| 5.2 | 104.92–107.5 | **IMPACT** — a vermilion seal slams onto the ink landscape: the site. Jiehua plan of the base drawn in under it. | **广寒 GUANGHAN STATION** · 89.5°S · Shackleton–de Gerlache ridge | INK + seal · JS |
| 5.3 | 107.5–109.6 | Stop-start stabs = crew name cards, one per stab, brutalist HUD: name / agency / role / "home: Lagos 384,400 km". | names | INK · stills + JS |
| 5.4 | 109.5–111.95 | Dip: Jade alone, back to camera, at the edge of the ridge; she shifts her weight and lifts her helmet a little. One shadow runs from her boots toward the small full Earth low on the right (Sun on the horizon behind her, as in the breakdown). Everything ink except the Earth, which `earthview.js` draws. | — | INK · h3 `K_5.4/take_4` + roto of the whole figure (rev3: mask widened to the boots, `subject: false`); JS Earth |

## 6 · BREAKDOWN — 112.07–122.77 — RUBBING (white on black) — the "point" move

| ID | Time | Picture | Lyric | Method |
|---|---|---|---|---|
| 6.1 | 111.95–115.57 | EARTH, a moonless night (new Moon, Sep 9 2037, fifteen days before Mid-Autumn): the Austin roof deck under stars. The children rehearse with their mother's Copernican lesson (3.4): Kenton kneels and lifts M, M holds her toy Moon up where the Moon should be, T's flashlight (the Sun) finds it and it glows, lit on the flashlight's side. They make their own bright Moon; all three faces are raised to it; camera tilts UP with them. HUD: `AUSTIN · NEW MOON · 15 DAYS TO MID-AUTUMN`. | **举头望明月** — characters rise upward, white rubbing on black | RUBBING · K_6.1 r6 (Kenton's back to us, brighter lit Moon; `K_6.1_dark.jpg` = the same frame with the flashlight off) → h3 `K_6.1/take_8` from the dark frame, played reversed at rate 1 (`tools/roto_prep_rubbing.py`); beam and lit Moon drawn on the tracked hand by `tools/beam_61.py` (rev3: T's arm moves from the first frame, the beam climbs the tree, swings over the sky and is on the Moon on 月) |
| 6.2a | 115.57–116.54 | MOON, the same hour: wide on the high rim of Shackleton (two beats since Oct 8). Because the Moon is new for them, the Earth is full for her: a blue-and-white disc 4.8° above the horizon (2.05° across, drawn 1.2x), the only colour in the frame. Her helmet has come up from the black crater and she turns to it; the Sun is directly behind her, so her shadow runs out in front of her, toward the Earth. HUD through 6.2a–6.2d: `GUANGHAN · FULL EARTH · 4.8° ABOVE THE HORIZON`. | **低头思故** — one small column in the black sky at the left, where 乡 will stand; it holds still (home, not down). English (Jade, Oct 8: "I think of home"): *I think* on 思, *of* on 故, small, lower left | RUBBING · K_6.2ii → h3 take from 1.0 s at 1.4x + rubbing prep; Earth = earthview |
| 6.2c | 116.54–117.43 | (Jade, Oct 8: "action shots of other astronauts, mid-action, looking at Earth".) **Adaeze Okafor**, reactor engineer, at the power feeder north of the station: on one knee at a junction box, the feeder's barrel connector in both gloves a hand short of its socket. She has stopped; her helmet comes up to the Earth. Visor down; she faces left like Jade, the Sun behind her, the plain ahead in the shadow of her rise. Same Earth, same height above the horizon. | (continues) | RUBBING · K_6.2c (nano-banana-pro from K_6.2ii + suit sheets) → take played reversed into the painted pose (`tools/roto_prep_rubbing.py`); Earth = earthview |
| 6.2d | 117.43–118.32 | **Layla Al-Mansoori**, pilot, at the crew lander beside the pad: a cargo container from the lander in both arms, stopped in mid-stride, helmet lifted to the Earth; one lander leg and its footpad at the right edge, her boot prints behind her. | (continues) | RUBBING · K_6.2d (nano-banana-pro, K_4.9 lander as reference) → take played reversed; Earth = earthview |
| 6.2b | 118.32–118.80 | Close profile inside the helmet (clear visor closed, sun visor raised, glasses): the last of the lift, her face settles on the Earth. **One beat** (Jade, Oct 8: "a way shorter shot of my face"; it was three). `FACE = false` in the section file drops it and lets 6.2d run to 乡. | (continues) | RUBBING · J_6.2 (codex over her photo) → Seedance 2.0 take played reversed (last 7° at 1.4x); her head is the painted head moved as one rigid layer |
| 6.3 | 118.80–120.99 | 乡 held. Back to the wide (Jade, Oct 7: not her face): the suited figure stands turned to the full Earth, small at the right; the camera pushes past her into the Earth, which ends centre frame with the horizon gone. (The visor close-up J_6.2_visor and the thumb gesture are dropped.) | **乡** (one huge character, held, trembling) with **home** as its gloss: brushed with the sung onset (118.8) on the baseline under the character, completing *I think of home*; *I think of* leaves at 119.7–120.4 and 乡 / home are held together to 122.6 | RUBBING · K_6.2ii take continued at 0.45x + earthview |
| 6.4 | 120.99–122.77 | Build gap → the push from 6.3 goes on into the Earth as a whole (the face she sees, centred over the open western Pacific, south-up, no roll toward any country: the film is for all of Earth) until the disc fills the frame; it soaks away into silk (a paper dissolve) and becomes the memory of the museum: Jade and M over the glowing relief globe (J_3.7). | 乡 / home held | INK · JS (earthview) |

## 7 · DROP — 122.77–189.86 — GOLD paper, glowing (instrumental, erhu lead) — "Build the palace"
Cut on kicks/bars; K-pop rhythm (every 2 beats in A/E, every bar in B/C). No lyrics → data type + chat + subtitles.

**A · 122.77–133.45 SPEED-BUILD** (JS-heavy: Guanghan Station assembles as glowing gold jiehua line art)
Twelve 2-beat cuts (rev2, Oct 8). 7.A0 is the painted plan K_7.A; the eleven that follow are drawn live from
`render/scenes/guanghan3d/layout.js` by `render/src/scenes/buildsite.js` (same camera as the stage plates), so that in
every cut one thing is being built inside the cut. Each cut is a few days of time-lapse: the day counter jumps on the
cuts, the Sun's bearing follows the counter (one turn per 29.53 days, right to left), and every standing thing throws
its long shadow away from it. The event of each cut lands on its second beat. `REGOLITH MOVED` runs 0 → 48 000 t.
- 7.A0 (122.77) Drop downbeat: the station plan EXPLODES into gold lines on indigo. HUD `GUANGHAN STATION · 89.5° S · THE PLAN`, `CONSTRUCTION DAY −640 · ROBOTIC PRE-BUILD`.
- 7.A1 (123.67) Survey, Day −640 → −633: two rabbit robots rule the plan onto bare regolith: the two roads, the cross, six ovals, a stake at every eighth of each; the cargo lander's shadow sweeps like a sundial. `SITE SURVEY · RIDGE 89.5° S · SUN 0–1.5°`.
- 7.A1b (124.55) First power, Day −530 → −523: mast M3 telescopes up and its blanket unrolls while M2, already standing, turns with the Sun; both mast shadows sweep the foreground. `SOLAR MASTS · 20 M · TRACKING THE SUN AROUND THE HORIZON`.
- 7.A2 (125.45) Pressure vessels, Day −407 → −400: the hub is down; four ribbed inflatable tunnels run out to their end nodes; four modules roll in along their radials on low wheeled cradles and dock. `PRESSURE VESSELS LANDED · 4 MODULES`.
- 7.A2b (126.34) The regolith printer, Day −204 → −200: the gantry's bridge crosses the SW module once a day (once per eighth note) and leaves one more 0.6 m course; the vessel is seen through the open top. `REGOLITH PRINTER · SHIELD SHELL 2.5 M · ONE 0.6 M COURSE A DAY`.
- 7.A2c (127.23) Comms, Day −43 → −37: the lattice tower goes up bay by bay; on the beat its dish is raised and comes round to Earth. `COMMS TOWER · 25 M · DISH ON EARTH`.
- 7.A3 (128.11) Day 001: the crew's lander comes down on bare regolith beside the staked pad site (the pad is not built yet), throws regolith out flat along the ground with no cloud, and its shadow races in from a kilometre away to meet it at touchdown, on the beat. `CREW LANDER DOWN · BARE REGOLITH, 2.0 KM EAST`.
- 7.A3b (129.00) The radiator, Day 005 → 011: twelve plates swing out of one closed stack like a folding fan (扇), 150° on the far side of the berm; Adaeze stands by, the reactor cold. `FISSION SURFACE POWER · 100 kWe · PRE-CRITICAL` / `ADAEZE OKAFOR · 1.0 KM OUT · RADIATOR, 12 PANELS`.
- 7.A3c (129.89) Power, Day 013 → 019: a rabbit lays the cable from the reactor, under the berm and down the service road; it reaches the S node on the beat and a pulse runs back along it. Nobody is at the reactor now. `POWER ON THE GRID · 1.0 KM CABLE`.
- 7.A4 (130.78) Day 027 → 031: the cupola's eight petal shutters go down into the sill wall one after another; glass, ribs and ring; a first warm light inside. `CUPOLA · SHUTTERS OPEN · DAY 030`.
- 7.A4b (131.67) The pad, Day 062 → 066: the laser rover circles the pad once a day and leaves one more sintered pass; the pad lies in its blast berm's shadow. `LANDING PAD · ⌀ 50 M · LASER-SINTERED REGOLITH`.
- 7.A5 (132.56) Day 090 → 097: the whole station; hub windows, cupola and then the tunnels' portholes come on; the masts turn and the station's shadows swing across the foreground. `GUANGHAN STATION · 89.5° S · LIGHTS ON`.

**B · 133.45–147.64 THE WORK** (erhu lead 133.9–144.7 → the human beats; each crew member gets one bar)
- 7.B1 (133.45–134.33, INK) Arjun kneels beside a free-standing, braced and ballasted TRIDENT-style ice drill in a permanently shadowed crater, tipping a small scoop into a cold sample canister. His hands and torso move; his ink-black stripe identifies him and ground reflections hide his face. The 1.8 m two-rail mast carries a thumb-thick auger; Yutu stands 3.5 m away as light, power and sample carrier, joined only by one slack ground cable. Helmet lamps and Yutu's flood light the work; open black sky and one far thread of sunlit rim. HUD `ARJUN RAMAN · PSR · BITE 07 · 0.70 m · H₂O 3.1 wt%` (fictional fresh-hole reading, not the LCROSS Cabeus value).
- 7.B1b (134.33–135.22, INK) Close on the same drill's pressed footpad, rotating thin auger flights, passive bristle wheel and short delivery chute. Pale flour-fine cuttings drop onto one fist-sized cone beside a coin-sized clean hole; sparse ice glints stay in the powder and loose grains settle on short ballistic arcs. No rover mount, sampling hose or hanging glitter.
- 7.B2 (135.22–136.99, GOLD) Jade's two suited gloves and forearms turn a small brass isolation valve on the separate oxygen skid during a maintenance visit; no face. Beyond it: a closed foil-wrapped cold-wall MRE drum, two thick busbars, anode lift, enclosed feed auger and tiny yellow-white lid sight glass. Ember-orange belongs to a freshly cast cooling ingot; She opens it in one slow, continuous anticlockwise turn (take_9, slow motion at rate 1); the gauge needle is drawn by the renderer (`scenes/gauge.js`): it trembles from the first frame, then rises slowly, starting 0.3 s after the seat opens and lagging the wheel. HUD `JADE WANG · ISRU · MOLTEN REGOLITH ELECTROLYSIS · 1,600 °C · 3.6 kA · O₂ 1.0 kg/h`.
- 7.B3 (136.99–138.76, GOLD) Low macro view across six 3 cm clear cups of grey regolith on white wicks inside a sealed, equipped glove-port chamber. One 2–3 cm Arabidopsis rosette has thin flat spoon leaves, muted green with purple rims and stalks: the first green after Earth, the only colour in the gold-on-indigo frame. Lúcia, softer behind the window at upper right, has her left arm in the right-hand glove port and slides a millimetre scale card to beside it with the black gauntlet; she leans in and down as she reaches, shoulder, head and glove in the same beat (take_16 at rate 1); no breath fog; the plant stays still (the painted rosette is carried, not redrawn). HUD `LÚCIA FERREIRA · ARABIDOPSIS IN LUNAR REGOLITH · FIRST ROSETTE`.
- 7.B4 Kenji's radio array unrolls across the floor of Shackleton, where neither the Sun nor Earth ever rises — the quietest sky in reach; spectrograms in gold.
- 7.B5 Low and close on the legs and boots of one astronaut in a loping 1/6-g stride: the boot plants and the regolith leaves the toe at that frame, each grain on its own parabola under 1.62 m/s² (a wide flat fan, no cloud, no haze); the astronaut pushes off into a long low hop and leaves the frame while the grains land and lie still. Real time: the slowness is lunar gravity. HUD `1.62 m/s² · NO AIR · NO CLOUD`. (K_7.B5 → h3 take retimed and its hop made ballistic → ink roto; grains integrated in JS from the tracked toe.)
- 7.B6 143.43 kick: the habitat lights come on, window by window.

**C · 147.64–161.77 THE CALLS** (split-screen Earth SILK color ↔ Moon GOLD; bass out 158.5–161.8)
- 7.C1 Video call: M says something; Jade waits — HUD `RTT 3.1 s (light 2.6)` ticks — then laughs on the delay.
- 7.C2 (147.64–149.41) Earth side, in full colour, the downstairs play room from the rear three-quarter: Kenton, seen from behind (curls half tied up, glasses arm, no face), holds T's forearms and the two step on the floor dance pad's arrows in time. The TV shows the real game: "Rare Earth (Techno Remix)" in StepMania, single mode since rev3 (Oct 8: one mat, so four targets on player 1's side of the screen; Easy Single beats 63–66 = right, down, rest, right, the panels the dancers light; red arrows scrolling up to them on the film's beats, life bar, PERFECT!!, combo, score, DOT with her headphones behind), redrawn by `tools/ddr_screen.py` from Jade's own step pack and laid on the painted screen; its light falls on the wall and the dancers. In the foreground M bounces and laughs as the family cat (the long-haired tabby of 7.C3), sitting beside her, bats at the swinging hem of her dress. (K_7.C2 v6, roto take_10 from 0.375 s: M lands on the bar's four beats. Rev Oct 8: the cat replaces the toy robot dog, which is now in no shot. Details: `docs/reviews/rev2_c2_report.md`.)
- 7.C3 (149.41–150.30) M on the sofa under the blanket with the cat, the tablet on her lap against her raised knees, one hand on its corner, the other on the cat: her face in the screen's blue light, the smile arriving (K_7.C3 v2, exactly two hands; roto take_5).
- 7.C3b (150.30–151.18) Over her shoulder: the real opening of RARE EARTH plays on the tablet (title poster, star flare; frames of the published video warped into the painted screen, `tools/screen_atlas.py` → `SCR_rare_earth`), its light on her hair and the blanket; she strokes the cat (K_7.C3b, roto take_1).
- 7.C4 / 7.C5 (151.18–158.50) ALONE, ALONE, TOGETHER, four times, one bar each (singles 1 beat, sharing scenes 2 beats). bar 83: Adaeze · Anastasia · **a** Adaeze shows Anastasia the twins' first lost tooth (galley bench; their faces in the tablet's glow, the laugh arrives). bar 84: Arjun · Chen Yu · **b** Arjun shows Chen Yu his newborn daughter (bunk edge, over their shoulders onto the picture; Chen Yu's hand pats his far shoulder). bar 85: Kenji · Lúcia · **c** Kenji shows Lúcia his husband waving their old dog's paw (greenhouse; her hand on her heart, her head tips to his shoulder). bar 86: Layla · **d** Layla shows Jade her father and his falcon (airlock bench, from behind; Jade tips her head to Layla's shoulder) · Jade alone, waving back at M and T on her tablet → the call. In every sharing scene the two sit or stand shoulder to shoulder with ONE tablet in front of both, both looking at it (staged in `render/scenes/blockouts`, see docs/character_bible.md "K_7.C5a–d"). HUD: who, what, where.
- 7.C5 Chat UI, typed live: (counter `DAY 3xx`) `jade: just 3 more months 🌏` → `bao: ok` → `mei: 🐰🌕`.
- 7.C6 Bass out 158.5: Jade alone at the small window; the tea cup (from the teahouse) on the sill — this time it reflects Earth.

**D · 161.77–175.85 TWO CHANG'ES** (re-drop; vocalise 163.5–169.8 — the emotional peak)
- 7.D1 School play: M as Chang'e in white silk on wires, lifted toward a big paper moon; parents' phones held up.
- 7.D2 Intercut: Jade in the station watching the livestream on a screen (`LIVE −7 s`); her right hand comes up, one index finger going out toward M's small raised hand on the screen (rev 3, Oct 8: one fingertip, not a palm; the arm painted from a 3D blockout, `render/scenes/blockouts/7.D2`).
- 7.D3 On the held C#5 (164.50–167.07): M reaches the paper moon ⇄ Jade touches the screen — match cut, same pose,
  same hand, two moons. Paper changes: the frame splits SILK left / GOLD right, mirrored. Both halves move (rev Oct 7):
  M drifts and sways on her wires, ribbons and sleeves rippling, her hand closing on the moon (roto K_7.D1 take_4);
  Jade's fingertip travels the last of the way and lands on M's little hand on the screen, her head lifting with it (gold roto J_7.D2 take_5, played backwards so it arrives on the painted touch pose; her head is the painting itself, carried).
- 7.D3b (167.07–168.83) Close on M: her fingers stretch the last few centimetres to the paper moon, hair and ribbons
  moving (keyframe K_7.D3b = the close framing of K_7.D1; its own take, K_7.D3b take_1).
- 7.D3c (168.83–170.59) Close on the screen: Jade's fingertip rests on the little gold Chang'e's hand, a point of light between them (J_7.D2 take_5, its first seconds).
- 7.D3d (170.59–171.47) The crew close round Jade at the galley wall screen, from behind: Adaeze's hand settles on Jade's shoulder (the one focal point), M's flight toward the paper moon beyond (the real 7.D1 picture). Jade from behind, small, low ponytail to mid-back, glasses (K_7.D3d, roto take_2). Replaces the cut wide shot of Jade alone in the round room.
- 7.D3e (171.47–173.00) Arjun's face in the light of the screen: his own daughter was born while he was away; he swallows, his eyes fill. Chen Yu beyond his shoulder, the private smile (K_7.D3e, roto take_2 from 2.6 s).
- 7.D4 Bass out 173.00–175.85: M's bow. We cut in with her already bending; she dips into a small child's curtsy-bow,
  ribbons pooled on the stage, and comes up beaming; the audience's hands clap and phones bob the whole time; the
  stage light breathes. No frame of stillness (roto K_7.D4 take_4, prepped as take_4c against a head-less plate).

**E · 175.85–189.86 THE TOAST** (re-hit; bass fades 181; erhu 186.9–190.1)
- 7.E1 / 7.E1b / 7.E1c (175.85–181.11) All eight crew in the observation dome raise their cups to the full Earth,
  4.9° over the horizon — the 举杯 callback. One moment from three angles, one subject each (staging:
  `render/scenes/blockouts/7.E1/`; the Earth is never painted: `scenes/earthview.js` draws the toast's real sky,
  2038-Aug-30 08:00 UT, mission day ~388, 99.9% lit, Africa–Europe–Asia facing the Moon):
  - 7.E1 (0.88 s) wide from the dark back of the dome: the subject is the Earth; the crew are dark shapes with a cool
    rim, every one facing the glass with ONE arm raised forward and up toward it (wrist straight, cup above head
    height; heights differ). West to east: Kenji R, Anastasia R, Arjun R · Jade R and Lúcia L seated on the bench at
    the glass · Layla L, Adaeze L, Chen Yu R (his left hand on Adaeze's shoulder). Outside, as the station model has
    it: the N-node dome just beyond the sill, the NW and NE mounds, masts M6 and M1, the comms tower.
  - 7.E1b (1.75 s) side-on, flat gongbi: Adaeze in profile facing screen-left (toward the Earth), her left arm one
    long line from shoulder to cup, the back of her hand to us; her eyes open on the Earth, a tear running. Alone in
    frame. (rev3 Oct 8: was a frontal, fully rendered close-up with Chen beside her; a frontal camera cannot show a
    toast arm that points at the Earth.)
  - 7.E1c (2.63 s) between the backs of Jade's and Lúcia's heads: each lifts her cup with her inner arm (Jade's
    celadon tea cup in her right hand, Lúcia's cup in her left), the arms coming from their own shoulders at the
    bottom corners, each hand simply continuing its forearm and holding its cup as the hands of the wide do (a fist
    round the lower half, thumb on the near face, fingers round the far side); the two cups are already up either
    side of the Earth, Jade's rises a little to Lúcia's height and both hold → the pull-back. The N-node dome shows
    just beyond the sill. (No clink since rev2; rev3: the wrists are no longer cocked back; rev4: the grip, which had
    the fingers flat across the near face and the thumb behind the cup.)
- 7.E2 Pull back: the station → the ridge → the south pole → the whole Moon (ink) → Earth and Moon in one frame.
- 7.E3 Keep pulling back until Earth is a single pale blue pixel with a vermilion seal beside it (you are here).
- 7.E4 189.86 ABRUPT CUT → black.

## 8 · OUTRO — 189.86–212.0 (guzheng, humming, solo hum 201.6, last pluck 210.04) — color returns

| ID | Time | Picture | Type | Method |
|---|---|---|---|---|
| 8.1 | 189.86–193.4 | Silence of black → a capsule under parachutes over a silk-painted sea (SILK returns). | — | SILK · still+JS |
| 8.2 / 8.2b | 193.41–197.50 / –198.87 | Mid-Autumn again, a year later, the living room. 8.2, one take: M runs into Jade's arms (Jade kneeling, back to camera), T kneels in a second later; Kenton lowers his hand from his mouth in the doorway, walks in, bends to them, kneels behind T with his back to us and lays his arm across T and Jade, his hand on her hair (rev4: Jade chose the version in which he wraps them); a gentle push keeps all four in frame. The two torn halves of the scroll slide together low in the picture (seam at design y 790: floor, legs and Jade's back, never a child's face) and join on bar 107 beat 4. His hand reaches them on the bar-109 downbeat; 8.2b begins a beat later (bar 109 beat 2): the hug, close, its own painting (the take's frame at the cut, restored) and its own take: he draws them in and lowers his head onto T's, the children's faces toward us. (With `K_8.2a` set back to `take_9` in picks.json the shot is the one-hand version of cut v6, cut on bar 109.) | — | SILK · h3 `K_8.2a/take_8` + roto with `tear` at 1x; `K_8.2b_wrap.jpg` → h3 `K_8.2b_wrap/take_1` + roto at 1x |
| 8.3 | 198.87–201.6 | The family on the rooftop sofa, all four seen from behind, each moving a little; toy Earth and toy Moon side by side on the parapet; the real full Moon above. | — | SILK · h3 `K_8.3/take_4` + roto |
| 8.4 | 201.6–210.04 | Solo hum → the tea cup on the table; the Moon in the tea. The closing inscription brushes in vertically: | **海上生明月，天涯共此时** / *The bright moon rises over the sea; however far apart, we share this moment.* | SILK · JS |
| 8.5 | 210.04–212.0 | Last pluck: the vermilion seal (pale blue dot) stamps. Fade. | seal | JS |

---

## Vehicle & mission architecture (locked for consistency)
- Launcher: a Long March 10–class kerosene rocket (bright yellow-orange plume), a Mengzhou-class crew capsule with the
  launch-escape tower mounted directly on it (no fairing or shroud over the capsule: docs/research_capsule_interior.md);
  launch from Wenchang (Hainan) in pre-dawn blue hour; a thin waning crescent low in the east.
- Expedition 1 flies as two crews of four (E1-A: Chen Yu, Layla, Jade, Kenji; E1-B: Anastasia, Adaeze, Arjun, Lúcia):
  never more than four people in a capsule or launch-day frame.
- Lunar orbit rendezvous with a pre-placed lander (Lanyue-like); the capsule never lands.
- MET / mission-day HUD marks every time jump (launch → orbit → TLI coast → day 4 descent → egress).
- Mission ≈ 13 months. Launch about 2037-Aug-07 (pre-dawn, a thin waning crescent low in the east), landing about Aug 11;
  the breakdown is the night of Sep 9–10 (new Moon on Earth = full Earth at Guanghan, about day 30); the first Mid-Autumn
  falls on Sep 24, when the Earth is below the station's horizon; calls "just 3 more months" ≈ day 3xx; home for the next
  Mid-Autumn.
- 对影成三人 in Li Bai = the poet, the Moon and the poet's shadow. Our three (Sun/Earth/Moon kids) is a deliberate
  reinterpretation; the lesson itself is shown correctly (Sun–Earth–Moon alignment → eclipse shadow).

## Typography system
- **Calligraphy** (Chinese lyrics, story text accents): brush fonts (Ma Shan Zheng / Zhi Mang Xing / Liu Jian Mao Cao),
  revealed by stroke order with an animated brush mask; dry-brush edge texture; seals stamped on downbeats.
- **English display** (story cards, hook lyrics): a high-contrast serif (e.g. Noto Serif Display / Cormorant Garamond
  Bold) — big, quiet, and confident. No Bebas: we want "museum label", not "trailer".
- **HUD / data** (training, base, drop): monospaced, NASA-worm-era red/white, small, at the frame edges. Real numbers only.
- **Placement**: lyrics live in the 留白 third; faces never covered. Intro story cards large (40–60% frame width).

## Accuracy guardrails (from docs/technical_accuracy_notes.md)
1/6 g loping gait, parabolic dust that drops at once; black sky, no stars in sunlit frames; Earth ~2° (a thumb covers it), nearly fixed in the sky, Earth phase opposite the Moon's (a full Earth means a new Moon at home: the breakdown is set on that night, never on Mid-Autumn); Earth bobs ±7° about the horizon at the south pole and is below it at Mid-Autumn; call RTT ~3.1 s (light 2.6); no sound outside;
launch sound arrives ~12 s late at a 4 km beach; visors down in sunlight; ~3–4 g at launch; hair floats only in transit.
