> **On-screen name (Oct 8 2026, Jade):** the station is **International Moonbase / 国际月球基地** in everything a viewer sees; "Guanghan" / 广寒 / 廣寒 and the 廣寒 seal survive only in file names and internal notes like this one.

# 广寒 Guanghan Station — layout bible (canonical, v2 · 2026-10-07)

Every moonbase frame — finished or mid-construction, interior or exterior, any paper — must match this document and
the 3D blockout. **Single source of truth for numbers:** `render/scenes/guanghan3d/layout.js`. If you change a number,
change it there, re-render the guides (`node render/scenes/guanghan3d/render_guides.mjs` from `render/`), then update
this page.

## "Is straight up the right angle for lunar panels? Did someone actually design them that way?"

**Yes, and yes.** At the lunar south pole the Sun never climbs more than about 1.5° above the horizon. Instead of rising
and setting, it slides all the way round the horizon once every ~29.5 days. A panel lying flat, or tilted the way it
would be on Earth, would catch almost nothing. A panel standing straight up faces the Sun squarely, as long as it turns
to follow it, so each mast spins its panels slowly about the vertical axis, one full turn a month.

**Real hardware is built this way:**
- **NASA's Vertical Solar Array Technology (VSAT) programme**, run by Langley and Glenn, specifies:
  - at least 10 kW from about 36 m² of array;
  - **at least 10 m from the ground to the bottom of the array**;
  - two 3 m-wide blankets, one either side of a mast;
  - a continuously rotating mast;
  - autonomous deployment and retraction, and the ability to relocate.
- **Who has built them:**
  - **Astrobotic** (with Redwire) and **Lockheed Martin** have built prototypes of about 20 m (65 ft) tall.
  - **Honeybee Robotics** (now Blue Origin) built its own VSAT entry.
  - Astrobotic and Honeybee prototypes were tested in thermal vacuum at NASA JSC in 2024.
  - Astrobotic's **VSAT-XL** study scales the idea to a mast 34 m tall carrying 50 kW.

**Why tall:** the ground is the enemy. Hills up to ~100 km away cast shadows kilometres long across the polar terrain.
Raising the panel lifts it out of those shadows. On the Shackleton connecting ridge the best spots are lit about 92% of
the time at 2 m height, and about 96% at 10 m. That is why our masts are 20 m tall, with the panels from 10.5 m to
19.5 m. Short masts, like the old K_1.5, read as grave markers *and* are wrong.

Sources:
- NASA VSAT announcement: https://www.nasa.gov/technology/nasa-industry-to-mature-vertical-solar-array-technologies-for-lunar-surface/
- 2022 prototype awards: https://www.nasa.gov/news-release/three-companies-to-help-nasa-advance-solar-array-technology-for-moon
- VSAT requirements: https://ntrs.nasa.gov/api/citations/20240004914/downloads/VSAT%20Mechanisms%20Abstract%2020240418.pdf
- JSC thermal-vacuum tests: https://www.nasa.gov/centers-and-facilities/johnson/from-houston-to-the-moon-johnsons-thermal-vacuum-chamber-tests-lunar-solar-technology
- Astrobotic VSAT: https://www.astrobotic.com/lunagrids-vertical-solar-array-technology-enters-tvac/
- Astrobotic VSAT-XL: https://www.astrobotic.com/astrobotic-awarded-lunar-power-study-with-vsat-xl/
- Lockheed Martin: https://www.lockheedmartin.com/en-us/news/features/2025/powering-the-moon--vertical-solar-arrays-charge-the-way-.html
- The Sun at the pole stays within ±1.5° of the horizon and circles 360°: https://svs.gsfc.nasa.gov/4893
- Illumination vs height: Gläser et al. 2014, https://elib.dlr.de/94242; Mazarico et al. 2011, https://ntrs.nasa.gov/citations/20120010094
- Honeybee's VSAT entry is called LAMPS. LUNARSABER is a separate DARPA LunA-10 concept for a ~100 m light, comms and power mast.

---

## 1. Site and directions

- **Site:**
  - On the Shackleton–de Gerlache connecting ridge, 89.5°S.
  - The base sits on a **graded plateau** about 400 m across.
  - The ridge crest runs east–west. The ground falls gently away to the north and south beyond 250 m.
- **Grid north (G-N) = the direction of Earth.** At the pole every direction is "north", so we use the polar-map
  convention instead: G-N is toward the 0° meridian, the near side, which is where Earth always hangs (NASA SVS 4944).
  - All bearings below are in degrees clockwise from G-N.
  - **Earth sits at bearing 000 forever.** It is 1.9° wide and bobs between −6.7° and +6.7° elevation over ~27 days. Our
    nominal value is **+1.5°**, just above the distant **Malapert massif** (about 120 km away), which peeks ~0.4° above the
    horizon in the same direction.
  - Earth is drawn south-up.
- **Sun:**
  - Any bearing; it circles once per 29.5 days. Its elevation is −1.5° to +1.5°.
  - **Sense:** the Moon turns the same way as the Earth, so at the south pole the Sun moves **right to left** along the
    horizon: its bearing *decreases*, by 360° / 29.53 d = 12.2° per day (anticlockwise on the plan, and anticlockwise in
    the 7.A jiehua view). Shadows are 1 / tan(elevation) times the caster's height: 38× at 1.5°, 48× at 1.2°. The 7.A
    speed-build (`render/src/scenes/buildsite.js`, `SUN`) uses bearing = 200° − 12.19° × day and 1.2°.
  - **Earth's phase follows from the Sun's bearing.**
    - Sun behind the viewer looking at Earth: full Earth.
    - Sun near Earth's bearing: new Earth (this is 6.2, Mid-Autumn).
  - The mast panels always face the Sun.

**Landmarks:**

| Landmark | Where | Distance |
|---|---|---|
| Shackleton rim | bearing 080 (nearest rim point) | 2.5–2.6 km |
| Shackleton floor (permanently shadowed) | | ~13 km and 4.2 km down |
| de Gerlache | far west-northwest | |
| Small permanently shadowed (PSR) ice crater | bearing 225 | 700 m |

## 2. Plan

North (Earth) is up. The figure is not to scale outside the inner ring. Render: `media/guanghan/guides/5.2_line.png`.

```
                               ▲ G-N  (EARTH on the horizon, Malapert below it)
                       ┼ COMMS TOWER 25 m (brg 345, 90 m), dish aimed at Earth
             M6 (330)                          M1 (030)
                 ‡                                  ‡               ‡ = solar mast, 20 m, ring r = 55 m
                              N node ▣ (emergency airlock, vermilion hatch)
                                    ║
                  ( NW mound )      ║       ( NE mound )
                  crew quarters     ║       GALLEY / wardroom
                         ╲          ║          ╱
   M5 (270) ‡  (W mound)═══════════(◎)═══════════(E mound)  ‡ M2 (090) ──── road ──► PAD 2.0 km E
              ISRU hall             HUB +       airlock, suitports,          (Shackleton rim 2.5 km)
              (vault)               CUPOLA      rover garage (door faces E)
                         ╱          ║          ╲
                  ( SW mound )      ║       ( SE mound )
                  greenhouse        ║       science lab
                              S node ▣ (power node)
                                    ║  service road + cable
             M4 (210)               ║                M3 (150)
                 ‡                  ▼                   ‡
                           REACTOR 1.0 km S (berm on base side, radiator fan to the S)
        ↙ PSR ice crater 700 m SW (Ø 300 m, 45 m deep)
```

## 3. Structures (all dimensions in metres)

| Element | Where (bearing / radius from hub centre) | Size | Function / notes |
|---|---|---|---|
| **Hub = "the tower"** | centre | Ø 9.0. L1 floor 0.3, L2 floor 3.3, roof 6.6 | **L1** is the junction: all 4 tunnels and 4 connectors meet here (ops, medical). **L2** is the commons, or "quiet deck", with **8 arched windows** (0.7 × 1.1, sill at 4.3) facing 000, 045 … 315. The **north window** is Jade's window (7.C6). Exposed, not bermed; the storm shelter is in the bermed modules. |
| **Observation cupola** | on the hub roof | Ø 7.0. Floor 6.6, opaque sill wall to 7.3 (ring of 12 portholes Ø 0.4), ribbed glass dome to **10.8** | 8 meridian ribs plus 1 ring. Holds all 8 crew standing (7.E1). Petal shutters close it during solar storms and before Day 030. |
| **Tunnels (the "cross")** | bearings 000 / 090 / 180 / 270, from r 4.5 to 28 (E and W run into their mounds at r 30) | Ø 3.0 ribbed inflatable (rib every 1.2), centre height 1.65 | Small round portholes every 4 m on both sides. These are the **warm portals between the berms**. |
| **N node** | 000 / 28 | Ø 4.0 × 3.8, low dome | Emergency airlock (second egress), with a vermilion hatch facing north. |
| **S node** | 180 / 28 | Ø 4.0 × 3.8 | Power node, where cables come in from the 6 masts and the reactor. Vermilion hatch faces south. |
| **Connectors** | 045 / 135 / 225 / 315, r 4.5 → 13.5 | Ø 2.2 | Hub to each quadrant module. Mostly hidden inside the mounds. |
| **Quadrant modules** | 045, 135, 225, 315 at r 19 (axis radial, from r 13.5 to 24.5) | rigid ribbed cylinder Ø 4.5 × 11, deck at 1.0 (floor width 3.5, headroom 3.6) | **NE (045) galley/wardroom**: round table for 8, galley counter and shelves at the hub end, wall screen on the outer end wall (7.C4, 7.D2). **NW (315) crew quarters**: 8 sleep pods. **SE (135) science lab**: geology glovebox, ice lab, medical, ISRU control desk. **SW (225) greenhouse** (7.B3). No windows: each is under 2.5–3 m of regolith. |
| **Quadrant mounds** (printed regolith shells) | same centres | 22 long (radial) × 18 wide × 7.5 high | Heaped, hatched like Song rocks. Printed in 0.6 m courses, which show as horizontal layer lines while printing. |
| **E mound** | 090 / 37 | 17 × 20 × 7.0 | **Main airlock, 4 suitports, rover garage** (Yutu-A/B and an LTV). The garage door faces east (r 45.5). The road to the pad starts here and jogs south of mast M2. |
| **W mound** | 270 / 37 | 17 × 20 × 7.5 | **ISRU hall**: an *unpressurised* printed vault (span 10, height 5, length 12, r 31–43, axis E–W) holding the molten-regolith O₂ reactor, 4 O₂ tanks on the north wall, and a regolith hopper and conveyor at the west end. Crew work here **in suits** (7.B2 gloves). A small pressurised control airlock sits at the vault's east end, where the W tunnel arrives. |
| **Solar masts M1–M6** | **030, 090, 150, 210, 270, 330 at r 55**, a hexagonal ring *outside* the berms, never between them | mast 20 high on a tripod (feet r 2.5). **Two vertical wings, each 2.0 × 9.0, from 10.5 to 19.5**, rotating about the mast to face the Sun | 6 × ~10 kW = 60 kW. No mast stands at 000, which keeps the cupola's Earth view clear. M6 and M1 frame Earth in 7.E1. |
| **Comms tower** | 345 / 90 | 25 high triangular lattice, 3 m dish | The dish faces bearing 000 at +1.5°, toward Earth. |
| **Fission reactor** (100 kWe Brayton class) | **180 / 1000** | core Ø 3.2 × 3.5 sunk 2 m, under a squat converter drum (~Ø 4 × 4, as drawn in K_7.A); **straight E–W earthen berm** 52 long × 12 wide × 5 high, 8 m on the base side (as drawn in K_7.A); **fan of 12 radiator plates**, each 3 × 9, spread over 150° on the far (south) side | NASA FSP planning puts the reactor ~1 km from the habitat. The berm and distance give the shielding. The radiator plates open like a folding fan (7.A3, Adaeze). No glow, no steam. |
| **Landing pad** | **090 / 2000** | sintered disc Ø 50 (dark, glassy), blast berm ring r 35 × 2.5 high with a gap toward the road | Plume ejecta studies keep landing zones about 2 km from assets. Pad ejecta goes toward Shackleton's rim, away from the base. The crew's Lanyue-class lander parks beside it. |
| **PSR ice crater** | 225 / 700 | Ø 300, 45 deep | 7.B1. From inside, the base is hidden behind the crater wall. |
| **Roads** (graded, 5 wide) | garage → pad (E); S node → reactor (S); S → PSR crater (SW) | | Cable runs alongside. |
| **Work lamps** (round four, Oct 8; `L.lamps`, positions from `lampList()`; 17 in all, fitted at stage 5) | **6 mast lamps**: one head on each solar mast, 6.0 up, on a 1 m arm toward the hub. **8 road bollards**: south verge of the pad road, every 25 m from the jog (65, 14) to x = 240, the edge of the graded plateau. **1 airlock flood** over the garage door of the E mound. **2 hatch lamps**, one over the vermilion hatch of each node. | mast pool r 5.0 (40° half-angle); bollard 1.1 tall, pool r 4.0 (the road's width); flood pool r 6.0 on the apron; hatch pool r 3.0 | Cut-off floods aimed straight down. There is no air, so nothing glows round a lamp: each shows only as a hard-edged pool on the regolith and as the hard shadows of what stands in it (a mast's pole and tripod). Neutral white, where the habitat's windows are amber. In full sun the pools do not show. |

**Jiehua compression.** In plates drawn as parallel-oblique 界画 (K_7.A, the 7.A1–A4 stages, and optionally 5.2), the
pad and reactor are moved in to 100 m and 92 m while **keeping their bearings**, and are separated from the base by a
band of empty paper. This is the palace-scroll convention. Every perspective shot uses the true distances.

## 4. Rooms and shots

| Room | Where | Shots |
|---|---|---|
| Galley / wardroom | NE module. Hub hatch at the SW end; wall screen at the NE end | 7.C4 (looking toward the hatch), 7.D2 / K_7.D2_room / 7.D4 (looking toward the screen; J_7.D2 is the close-up at that screen) |
| Commons / quiet deck, north window | hub L2, window at 000 | 7.C6 (tea cup on the sill, Earth through the window above the N tunnel and N node) |
| Cupola | hub roof | 7.E1 (looking north: N tunnel → N node, NE and NW mounds, masts M6 and M1, comms tower, Earth over Malapert) |
| ISRU hall | W mound vault (unpressurised) | 7.B2 |
| Greenhouse | SW module | 7.B3 |
| Crew quarters | NW module | 7.C4_grid bunk cells, 3.7-style night shots |
| Airlock / suitports / garage | E mound | 5.1 egress follow-ups, rover departures |
| Greenhouse (sealed glove-port growth chamber on a bench in the aisle) | SW module | 7.B3 (Lúcia, first rosette) |
| Galley table, laptop call | NE module, hub side of the table | 7.C1_moon |
| Radio array | Shackleton floor, ~13 km ENE then 4.2 km down (rover expedition) | 7.B4 |
| Plateau south lip | 460 m at bearing 120 | 5.4 (base small to the NNW, Earth over the north horizon) |
| Crew capsule (Orion-class, not part of the base) | trans-lunar coast | 4.7 |

## 5. Construction stages (mid-construction shots pick exactly one; HUD days in brackets)

| Stage | Days | What exists | Shot |
|---|---|---|---|
| 1 Survey & grading | −640 → −400 | Graded footprints (cross plus 6 ovals) with stakes; roads bladed; **masts M2 (090) and M3 (150) up**, the other 4 as tripod feet; printer parked; cargo lander at the pad site; reactor site staked | 7.A1 |
| 2 Masts up, vessels landed, shells printing | −400 → −20 | All 6 masts (M4 and M6 still telescoping); hub (dome shuttered), 4 modules and the tunnels landed; gantry printer over SE; shells NE 100%, E 85%, NW 60%, SE 35%, W 15%, SW 0%; comms tower; reactor emplaced with its fins folded; **no pad** | 7.A2 |
| 3 Crew arrives | 001 → 030 | All shells done; dome still shuttered; reactor fins half open; crew lander next to the (unbuilt) pad site. The crew lands on bare regolith (4.9 dust sheets). | 7.A3 |
| 4 Pad glazed, cupola open | 030 → 097 | Pad half sintered with the laser rover working; fins fully open; cupola glazed | 7.A4 |
| 5 Lights on | 097 → | Complete (= K_7.A); warm windows | 1.5, 5.2, 6.2, 7.B–7.E |

*Script note:* 7.A1's HUD should run `DAY −640 → −400`, not all the way to 001. This keeps 7.A2 robotic and makes
4.9 (the crew landing on unprepared ground) consistent.

## 6. Camera table (guides in `media/guanghan/guides/<shot>_{line,depth,flat}.png`, 1920×1080)

World axes: x = grid east, y = up, z = grid **south** (metres; origin = hub centre at ground level).

| Shot | Paper | Camera pos (x, y, z) | Look bearing / pitch | Lens | Sun (bearing / elev) | Earth in frame (x, y as fraction) |
|---|---|---|---|---|---|---|
| 1.5 | INK | (−78.3, 2.2, 116.1) = 140 m at bearing 214, eye 2.2 | 026° / −2.5° | HFOV 70° | 250° / 0.8°, terrain shadow below 10 m | 0.15, 0.41 |
| 5.2 | JIEHUA plan | top-down, centre (0, −20) | north up | ortho 262 m wide | plate light | — |
| 5.2o (the K_5.2 plate since Oct 8) | JIEHUA plan-oblique | top-down, hub at (1040, 700) of 1920 × 1080; every height drawn straight up the page at plan scale. **Masts are drawn 1.4 × that size from their true feet** (`mastDraw`, round four), and M2's tripod is turned 60° to keep its foot off the road's edge (`mastNudge`). | north up | ortho 331 m wide (5.8 px per metre) | plate light | — (the roundel sits upper left, the label lower left) |
| 6.2 | RUBBING/INK | (2568, 141, −454) = Shackleton rim, 2.6 km at bearing 080 | 355° / −2.3° | HFOV 55° | 015° / 0.3° (new Earth) | 0.58, 0.39. **The base is behind-left: never in 6.2.** |
| 7.A, 7.A1–A4 | GOLD jiehua | from bearing 315, elevation 33°, target (22, 0, 22) | 135° / −33° | ortho 210 m wide, compressed pad and reactor | plate light | — (pad upper left, reactor upper right) |
| 7.B1 | INK | PSR crater floor (−497, −63, 498) | 057° / −3.5° | HFOV 62° | crater in shadow; helmet lamp only | — (base hidden by the crater wall) |
| 7.B2 | GOLD | ISRU vault (−36.7, 2.0, −3.2), Jade's POV | 208° / −13° | HFOV 66° | interior: ember port + vault strip light | — |
| 7.B6 | GOLD | (−102.4, 14, 71.7) = 125 m at bearing 235, 14 m up | 055° / −4.6° | HFOV 55° | 250° / 0.8°, shadow below 10 m | — |
| 7.C4 | GOLD | galley outer end (16.9, 2.4, −16.9) | 225° / −3° | HFOV 82° | interior | — |
| 7.C6 | GOLD | hub L2 (0.15, 4.85, −2.05) | 000° / −0.1° | HFOV 50° | 200° / 1° | 0.50, 0.45 (through the window) |
| 7.D2 | GOLD | galley (12.3, 2.3, −11.5) | 040° / +1° | HFOV 70° | interior | — |
| 7.E1 | GOLD + INK view | cupola (0, 8.25, 2.7) | 000° / −0.6° | HFOV 80° | 200° / 1° (near-full Earth) | 0.50, 0.46 |
| 4.7 | GOLD | capsule set (not the base): Orion-class cabin, (0.30, 1.65, 1.0) in cabin coords | toward the side window / −6° | HFOV 70° | — | — (Moon 0.52° in the window) |
| 5.4 | INK | (401, 5.4, 235) = Jade at 460 m bearing 120 (S lip of the plateau), camera 5.5 m behind | 330° / −1° | HFOV 80° | 150° / 1° (behind camera) | 0.84, 0.45; base small at x≈0.1 |
| 7.B3 | GOLD + one green | SW module (greenhouse) (−16.4, 2.5, 17.2) | 028° / −14° | HFOV 64° | interior: magenta grow bars + bench lamp | — |
| 7.B4 | INK | Shackleton floor, 1 km W of the crater centre, ~4.3 km below the rim | 260° / +13° | HFOV 72° | 080° / 1.5°: only the top ~500 m of the far wall is lit | — (never Sun or Earth) |
| 7.C1m | GOLD | galley (12.0, 2.3, −11.4), behind Jade at the table | 034° / −10° | HFOV 62° | interior | — |
| 7.D2 (K_7.D2_room) | GOLD | as 7.D2 | | | | |
| 7.E2a | GOLD→INK | (−6.5, 60, 74.7) | 005° / −35.5° | HFOV 60° | 200° / 1° | — |
| 7.E2b | INK | 3.5 km straight up over (800, 300) | north up | HFOV 60° | 200° / 1° | — |
| 7.E2c | INK | 60 km straight up over (3000, 0) | north up | HFOV 60° | 200° / 1° | — |

The machine-readable version is `media/guanghan/guides/cameras.json`. To place Earth in a painted frame, composite it
with `media/keyframes/work/earthcomp_space.py`. Take the position from this table, but re-measure against the painting's
actual horizon. The diameter is 1.9° of the horizontal field of view (≈ 75 px at HFOV 70° on a 2752 px frame).

## 7. Rules for prompts and reviews

- **Count check, every frame:**
  - 6 solar masts, each with 2 vertical wings, all *outside* the mounds;
  - 6 mounds (4 quadrant + E + W);
  - 1 hub tower with its cupola, at the crossing;
  - 4 tunnels in a cross;
  - 2 bare round end-nodes (N, S);
  - 1 comms tower to the north-northwest.
  - at night, in terrain shadow: the work lamps' pools, never a halo (section 3).
- **Masts are tall:** the panel bottoms are higher than the cupola's sill, and the panel tops are almost twice the
  height of the cupola top.
- **Earth** is always at G-N, low on the horizon, 1.9° across, and composited, never painted by the model.
- **No mast at bearing 000.** Nothing stands between the cupola and Earth except the N tunnel, the N node and the low
  Malapert massif.
- **The reactor is never next to the base** in a perspective shot; the **pad is never closer than 2 km**.
- **Gen recipe:**
  - Run `render/scenes/guanghan3d/gen_keyframes.py`. Image 1 = the guide (`*_line.png` works best).
  - Image 2 = a K_7.A *detail* crop (`media/guanghan/K_7.A_detail_ref.jpg`), never the full K_7.A from the same camera:
    nano-banana-pro overlays the two and doubles the masts and mounds.
  - Image 3 = the museum style ref.

## 8. Consistency status (round 2, 2026-10-07)

- **Sheet:** `media/guanghan/CONSISTENCY_SHEET.jpg` (v2, 21 frames; v1 is kept as `CONSISTENCY_SHEET_v1.jpg`).
- **Round-1 review:** codex, `media/guanghan/codex_review.md`.
- **Fixed in round 2:**
  - **K_6.2i/ii:** Earth recomposited at 1.9°, using `media/keyframes/work/erase_earth.py` and then `earthcomp_space.py`.
  - **K_7.A:** the tower is now at the crossing and the comms tower is added.
  - **K_7.A2:** two masts are shown telescoping.
  - **K_7.B2:** regenerated with no seam.
  - **K_1.5:** now in shadow.
  - **Stage plates (K_7.A and A1–A4):** all graded to K_7.A_v1's indigo with `media/keyframes/work/grade_indigo.py`.
- **New Moon-side frames:** K_4.7, K_5.4, K_7.B3, K_7.B4, K_7.B6, K_7.C1_moon, K_7.C6, K_7.D2_room.
- **Open minors:**
  - **K_7.B4:** the film strips curve.
  - **K_7.B6:** the mounds read as smooth domes.
  - **K_7.A:** one mast panel is still long.
  - **K_4.7:** the Moon is slightly larger than 0.5°.
  - **K_5.4:** the base is at its stage-3 look (Day 001), which is correct for 5.4.
- **Round 4 (2026-10-08 night, `docs/reviews/rev4_base_report.md`):**
  - **Work lamps** added to the layout and the model (table in section 3). Lit in 7.B6 by the engine (`render/src/scenes/worklamps.js`, which projects `lampList()` through the shot's camera): from that camera the near mast's pool (M4) and three road bollards are in frame, and the HUD counts 21 lights. Marked on the 5.2 plan (a lamp head on each mast, four posts on the road).
  - **Not lit elsewhere, by design:** 1.5 (the pools are two-pixel slivers from eye height), 7.E1 (the ground outside is in full sun), the 7.A build cuts (stages before the lamps are fitted; 7.A5 is in full sun).
  - **K_5.2:** the six masts redrawn 1.4 × larger with gridded panels (the rev 3 plate is `K_5.2_v2.jpg`). Why a mast at plan scale looked small: a mound seen from above shows its whole 22 m footprint, so a 20 m mast came out 0.94 of a mound on the page; the side views show 2.7 to 3.8. It is 1.32 now, like the other picture that looks down on the station (7.A5, about 1.2). 1.4 is the most the sheet takes before the two south masts' panels touch the SE and SW mounds.
- **Round 3 (2026-10-08, `docs/reviews/rev3_polish_report.md`):**
  - **K_7.B6:** repainted: the mounds are heaped regolith with no windows; the engine lights the model's 17 lights (dome, sill portholes, hub windows, tunnel portholes, S node window and hatch lamp).
  - **K_1.5:** the tower is cut down to about 1.3 mound heights (it was 2.2).
  - **K_7.A:** the six mast panels measured: 130 to 159 px, growing with nearness; none stands out. Closed without an edit.
  - **K_1.4a** (Earth, the launch pad): the rocket is the Long March 10 class vehicle of 1.2 and 4.1 (core, two boosters, capsule, escape tower).
