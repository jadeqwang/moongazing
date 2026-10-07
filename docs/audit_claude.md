# Accuracy audit: `docs/script.md` (Shooting Script v1)

*Audited 6 Oct 2026 against `technical_accuracy_notes.md`, `companion_moonbase_designs.md`, `companion_moon_experiments.md` and `treatment.md`, plus new calculations and web checks.*

**Severity:** **BLOCKER** means visibly wrong, impossible, or contradicts the script itself. Fix it before generating. **SHOULD** means an informed viewer will catch it. **NIT** is polish.

## Key computation: Earth and Sun from the Connecting Ridge on Mid-Autumn night

I used Skyfield with DE421 and the `MOON_ME_DE421` frame. The site is 89.45°S, 222.7°E (137°W) on the Shackleton–de Gerlache ridge. Altitudes are astronomical, measured from true horizontal, before terrain is taken into account.

| Mid-Autumn (21:00 Beijing time) | Earth alt | Sun alt | Sun–Earth sep | Earth lit | Notes |
|---|---|---|---|---|---|
| 2026-09-25 | +1.5° | +0.4° | 14° | 1.6% | full Moon is the next night |
| 2027-09-15 | +3.4° | +0.7° | 5.5° | 0.2% | |
| 2028-10-03 | +5.8° | +1.2° | 4.9° | 0.2% | |
| 2030-09-12 | +5.6° | +1.2° | 9° | 0.6% | |
| 2032-09-19 | +2.9° | +0.5° | 3.2° | 0.1% | Sun glare almost on Earth |
| 2033-09-08 | +3.2° | +0.3° | 8° | 0.5% | |
| 2034-09-27 | **−1.0°** | −0.7° | 8° | 0.5% | |
| **2035-09-16** | **−1.3°** | **−0.9°** | **12–13°** | **1.1–1.3%** | **best: Earth below her eye line, Sun 13° aside and below true horizontal** |

**What this means for the shot:**
- On every Mid-Autumn night Earth is a **hairline crescent, 0.1–1.8% lit**. The Sun sits **3–15° away along the horizon**, so a thin crescent is correct, not a fully new Earth.
- **Earth below her eye line** happens only in some years (2034, 2035), when Earth is below true horizontal. It is still visible because a rim 1–2 km above the plain drops the visible horizon by about 2–2.7°.
- **The Sun is never more than about 2° below true horizontal**, so it can't hide below a dipped horizon on its own. Hide it behind a nearer crest, the lander, or her raised glove, or frame it out with a telephoto lens (it sits 13° to the side).
- **City lights are not visible to the naked eye.** Hangzhou comes out at about magnitude 8–9 and Shanghai at about 6.5–7. Both are unresolved points, and the night side Jade sees is lit by **the full Moon the family is looking at**, so the background is brighter than the lights. Apollo crews never saw city lights. They only show up with long exposures or during a lunar eclipse.
- **Launch to match** (2035): a pre-dawn launch on **30 Aug 2035 at about 05:30 Beijing time** has a **14% waning crescent 29° up in the east-northeast**, over the sea along the lunar ascent track, with the Sun at −12° (nautical twilight).
  - New Moon is 2 Sep, so she lands under a **full Earth**.
  - Mid-Autumn on 16 Sep is about surface day 13.
  - Mid-Autumn the next year is **Sat 4 Oct 2036**, so the mission is about 13 months.

## Findings

| Shot | Issue | Sev | Fix (replacement text) |
|---|---|---|---|
| Concept | 富春山居图 was not "torn". In 1650 Wu Hongyu ordered it **burned**, and his nephew pulled it from the fire. It survives as two pieces: 剩山图 in the Zhejiang Provincial Museum, Hangzhou, and 无用师卷 in the National Palace Museum, Taipei. In 2011 the two were **shown together temporarily** (Taipei, 1 Jun–5 Sep). They were not permanently rejoined. | SHOULD | "…as 富春山居图 — burned in 1650 and split in two, one piece kept in Hangzhou and one in Taipei — was shown whole again, for one summer, in 2011." |
| 0.3 | "Four thousand years ago" uses the **legend's setting** (Hou Yi in Emperor Yao's time) as if it were history. The earliest texts date from the Warring States/Qin era (the *Guicang* slips), and the Han *Huainanzi* is from the 2nd c. BCE. | SHOULD | **"Long ago, the legend says, Chang'e flew to the Moon."** If you want a number: "More than two thousand years ago, they were already writing that Chang'e flew to the Moon." |
| 0.5 | "Every autumn since" implies the festival is as old as the myth. Mid-Autumn as a festival dates from the Tang–Song era. | NIT | "Every Mid-Autumn, more than a billion people look up and miss someone." |
| 1.5 | The ridge is sunlit about 92% of the time, so "night" needs a reason. | NIT | "…during a rare dark spell: Sun below the horizon behind camera, a nearly full Earth on the horizon washing the mounds in blue earthlight; stars visible." |
| 1.6 | **"At dusk" is impossible with 4.1's waning crescent.** A waning crescent rises after midnight and sets in the afternoon, so it is never in the evening sky. | BLOCKER | "The family on Wenchang beach **before dawn** (blue hour), looking up at a gold streak climbing toward a thin crescent Moon in the east." |
| 2.3 | The **wupeng 乌篷船** is a Shaoxing canal boat, not a West Lake boat. | SHOULD | "A small canopied West Lake rowboat (西湖手划船), Leifeng Pagoda behind…" |
| 2.5 / 3.1 | Sliding doors and a low table read as a Japanese tearoom. Hangzhou teahouses use carved lattice doors that swing or fold, and tables with chairs. | SHOULD | 2.5: "carved lattice doors (隔扇) fold open." 3.1: "Family at a square table (八仙桌) by the lattice window." |
| 3.2 | An iron tetsubin is Japanese. Longjing is steeped at about 80–85 °C in glass or a gaiwan. | NIT | "Snow melting in a clay kettle on a little charcoal brazier; Longjing leaves unfurling in a glass; in the cup, a pale afternoon (waxing) Moon." |
| 3.6 | "NASA-worm-era HUD labels": the NASA worm logo is a protected insignia. | NIT | "HUD labels in a 1970s-agency red/white style (no real logos)." |
| 3.7 | Crews go into about **2 weeks of health quarantine**, so there is no tucking the kids in on the night before launch. | SHOULD | "**Last night home before quarantine** (L−14 days). Jade tucks Mei in…" |
| 3.8 / 4.7 | The toy Earth floating is a chance to use a real tradition, the **zero-g indicator** (a plush toy hung in the cabin; Artemis II flew "Rise"). | NIT (gift) | 3.8: "…Bao's toy Earth hangs on a short cord from the panel: the crew's zero-g indicator." 4.7: it lifts and floats at engine cutoff. |
| 4.1 | A waning crescent is only visible before dawn, low in the east. It isn't high "above" the pad at night. A launch window doesn't require any particular phase, so this works. | SHOULD | "Pre-dawn ignition (~05:30). A thin waning crescent hangs low in the east over the sea, lit edge toward the coming sunrise; the rocket arcs toward it." |
| 4.2 | **Distance and delay:** the Wenchang public beaches (淇水湾 and 龙楼 beaches) are about **3–5 km** from the pads (LC-301 is at 19.61°N 110.94°E), so sound arrives about **9–15 s** later, not 18 s. **Hair:** launch sound does not blow hair (its particle velocity is about 0.1 m/s). | SHOULD | "…the light arrives first; **~12 s later** the crackle hits: Mei flinches and covers her ears, car alarms trip, birds burst from the palms." |
| 4.3 | **The capsule window is covered** by the escape-tower shroud until it is jettisoned at about T+2–3 min. On a pre-dawn launch the sky is already dark, so "blue to black" isn't what she'd see. **Visor:** the IVA pressure visor is clear and closed during ascent. | SHOULD | "Window: dark under the shroud — then the shroud jettisons and the window floods with black space and a thin blue band of atmosphere lit by the sunrise below." For LS3: "clear pressure visor down, face fully visible." |
| 4.4 | The ~10 s from ignition to booster separation is compressed. Real separation is about T+2–3 min. | NIT | Fine as license. Optionally add HUD `T+02:2x`. |
| 4.5 | Continuity: the kids were on the beach in 4.2, so they can't be at home watching TV. | NIT | "Kids on the beach, faces lit by the live feed on Kenton's phone; Bao's hand on the screen." Or label it "LATER · HOME". |
| 4.7 | During the TLI burn things drift aft. They don't float. | SHOULD | "**After the TLI burn cuts off**, in the sudden quiet, Jade lifts a drink pouch toward the Moon in the window…" |
| 4.8 | With a waning-crescent launch she arrives near new Moon. The approaching Moon is a dark disk **lit only by full earthlight**, which is a gift for the INK look. | NIT | "The Moon grows from a sliver to a wall of ink: its night side glows faint blue-grey in full earthlight." |
| 4.9 | Plume ejecta does not form "parabolic sheets". It flies in **flat, radial, near-straight sheets** about 1–3° above the ground, at hundreds of m/s to over 1 km/s. It **stops the instant the engine cuts off**, with nothing left to settle. | SHOULD | "Landing — the plume blasts regolith into flat, radial, razor-straight sheets streaking to the horizon; engine cutoff: the sheets vanish at once. Touchdown under a full Earth; silence." |
| 5.2 | The latitude is fine (the ridge runs from about 89.8°S to 89.2°S), but there is no longitude. | NIT | `89.45°S 137°W · Shackleton–de Gerlache ridge` (check against the LOLA map). |
| 5.3 | 384,400 km is the mean centre-to-centre distance. A HUD that claims "real numbers only" should show a live value. | NIT | `home: Lagos · 389,214 km` (a varying value in the 357k–406k range). |
| Cast | **"Lucía" is Spanish.** Brazilian Portuguese spells it **Lúcia**. | SHOULD | "Lúcia Ferreira (Brazilian, botanist)". |
| Cast | Two names belong to real people. **Sven Lindqvist** was a well-known Swedish author (1932–2019). **Al-Mansoori** is the surname of Hazza AlMansoori, the first Emirati astronaut. | NIT | Rename, e.g. "Erik Lindqvist". Keep AlMansoori only as an intended homage (the UAE spelling has no hyphen), or use "Layla Al Suwaidi". |
| 6.1 | Hangzhou geometry is correct: at 21:00 the Moon is about 40–48° up in the east-southeast. | — | Keep. Optional: "…the full Moon about 45° up over the east-southeast." |
| 6.2 | **The city lights are wrong.** Naked-eye city lights are impossible from the Moon: Hangzhou is about magnitude 8–9, unresolved, and set against a night side lit by the full Moon. **Geometry:** a thin crescent is right (0.1–1.8% lit), but the Sun is 3–15° away in the same quarter of the horizon. Earth below her eye line only works in some years (2034–35, see the table above). | BLOCKER | "MOON, Mid-Autumn 2035: on the high rim of Shackleton, Jade LOWERS her head. Below her eye line, just above the far horizon, the Earth: a dark disk with a hairline crescent of sunrise along its lower edge, its night side faintly silvered by the same full Moon her family is watching. The Sun is hidden behind a crest a hand's width to the right; its pearly corona glows above the rock. Camera tilts DOWN." Move the lights into **6.4**, shown on her helmet camera or a telescope feed as a long exposure. |
| 6.3 | **The toy can't "exactly cover" Earth.** Earth is about 2° across, which is about 2.3 cm at arm's length (a marble). A toy globe of 8–10 cm covers about 8°, four times Earth's width. The Armstrong quote has no documented primary source. | SHOULD | "She raises the toy Earth at arm's length; it swallows the real one four times over — the whole world is smaller than her son's toy." Or make the toy a 2.5 cm glass marble globe. Caption: "'…my thumb blotted out the planet Earth.' — attributed to Neil Armstrong". |
| 6.4 | Orientation: from the south pole Earth appears **south-up**, so China is in the lower half of the disk. | NIT | "…zoom (long-exposure helmet-cam look): Earth south-up, China low on the disk → Yangtze delta → Hangzhou → West Lake, a dark hole ringed with light → one lit window." |
| 7.A1/A4 | Building a station in 97 days with 7 people is only plausible if robotic landers pre-placed the hardware. NASA's Moon Base plan runs over years. | SHOULD | HUD sequence: `ROBOTIC PRE-BUILD · DAY −640` → `CREW · DAY 001` → `DAY 097`. |
| 7.A2 | The orientation is correct (vertical arrays). Add the tracking. | NIT | "…solar masts unfold upward and slowly turn, following a Sun that circles the horizon once a month." |
| 7.A3 | A 40 kWe reactor can't run a crew of 7 **plus** an MRE plant making 1 kg/hr of O₂, which alone needs about 25 kW. The current NASA/DOE target is **100 kWe**. Crew can only stand at the reactor before startup. | SHOULD | "…radiator panels open like a folding fan, edge-on to the Sun. `100 kWe · PRE-CRITICAL`." |
| 7.B1 | "Frost on the bit" isn't real. There is no vapour to frost, and ice is mixed into the soil grains. In a permanently shadowed region, the only light is his own. | SHOULD | "…the cuttings on the drill flutes glitter faintly in his helmet light — ice grains in grey soil. `H₂O 5.6 ± 2.9 wt%` `−233 °C`." |
| 7.B2 | Molten regolith at about 1,600 °C glows **yellow-white**, not ember-orange. Her visor is down in sunlight, so we can't see her grin. | NIT | "…melt glows yellow-white through the viewport; `O₂ 1.1 kg/h` (≈10 t/yr); she grins (visor up, in the plant's shade)." |
| 7.B3 | This garbles the Chang'e-4 fact: that cotton sprouted in **Earth soil** in 2019, and it was already the first green on the Moon. Real plants in regolith come up stunted and purple-tinged, and they need a sealed chamber. | SHOULD | "Lúcia: in a sealed chamber under magenta grow-lights, a pale, purple-tinged rosette in grey regolith — the first plant grown in lunar soil on the Moon (Chang'e-4's 2019 cotton sprouted in Earth soil)." |
| 7.B4 | **Wrong:** a south-pole base is not on the far side. Earth bobs on the polar horizon, so Earth's radio noise reaches the base. LuSEE-Night sits at about 24°S on the far side. However, **the floor of Shackleton never sees Earth or the Sun**: its rim stands about 20° high, and Earth never rises more than about 7°. | SHOULD | "Kenji's rabbit rovers unroll thin-film radio antennas across the black floor of Shackleton, where neither Sun nor Earth ever rises — the quietest radio ground near the base (a pathfinder for a true far-side array). Gold spectrograms of a silent sky." |
| 7.C1 | `RTT 2.56 s` is the bare light time at mean distance. A real call adds relay hops (an NRHO/ELFO relay over the pole adds about 0.4 s), the ground network and codecs. Apollo 16 measured 2.71 s. | SHOULD | "Jade asks; waits — HUD `RTT 3.1 s (light 2.6)` ticks — Mei answers over her; both stop; Jade laughs." |
| 7.C5 | **Timeline clash:** "3 more months" right after DAY 097, but the homecoming is "Mid-Autumn again, a year later" (8.2). | SHOULD | Give the calls their own HUD, `DAY 3xx · 2036-07`, and keep "just 3 more months 🌏". Alternatively, cut the stay to 6 months and come home at 元宵 (Lantern Festival full moon). |
| 7.D2 | A livestream is **one-way**: about 1.3 s of light time plus streaming latency. It is not "2.56 s late". | SHOULD | "…watching the livestream (HUD `LIVE −7 s`: 1.3 s light + stream)…" |
| 7.E1 | A glass "observation dome" contradicts the bermed, radiation-shielded base. | NIT | "All crew at the cupola, a small shuttered window in the berm; Earth on the horizon." |
| 8.1 | If the capsule is Mengzhou, it lands **on land** (parachutes and airbags at Dongfeng). Orion-type capsules splash down. | NIT | Keep the sea for the agency's fictional capsule, or show "parachutes and airbags over silk-painted grassland". |
| 8.2 | Fix the year. | NIT | "Mid-Autumn again, 4 Oct 2036." |
| 8.4 | The text and translation are correct (张九龄《望月怀远》). | NIT | Add a small credit: 张九龄《望月怀远》. |
| Guardrails | The footer repeats three errors. | SHOULD | "Earth ~2°, bobbing within ±7° of the horizon (visible ~half the time) at the south pole; **RTT ~3.1 s** on calls (light 2.4–2.7 s); launch sound arrives **~10–15 s** late at the Wenchang beaches." |

## Checked and fine
- Lunar gravity gait and fall times (5.1), boot-dust parabolas (7.B5), shadow length at 1° (about 97 m), black sky, no sound outside.
- Li Bai 静夜思 (Ming wording, already footnoted in the notes) and 月下独酌 lines, Mid-Autumn dates 2026–2036 (computed), Leifeng Pagoda and Broken Bridge in winter.
- Training: centrifuge, NBL, parabolic flight with nausea, Iceland geology (NASA and ESA have both trained there). The montage is fine.
- PSR ice figure (LCROSS), vertical solar masts, reactor about 1 km out, sintered pad, kerolox orange exhaust for LM-10.
- Crew nationalities and roles are plausible for a fictional Earth-wide agency.
