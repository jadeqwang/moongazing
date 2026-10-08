# Experiments that only make sense *on the Moon*

*Companion notes for 望明月 *Moongazing*. Research current as of 6 October 2026. Every item here is something you can't do as well (or at all) in a lab on Earth. Each entry covers why the Moon, what it looks like on camera, and where it stands now.*

---

## 1. Breathing rocks: oxygen from regolith (ISRU)

- **Why the Moon:** lunar regolith is roughly **40–45% oxygen by mass**, locked in oxides. Making O₂ locally, for breathing and rocket oxidizer, is the single biggest lever for a sustainable base.
- **Molten regolith electrolysis (MRE):**
  1. Crushed regolith is heated to about **1,600 °C** until it melts into a conductive liquid.
  2. A current is passed between electrodes.
  3. **Oxygen bubbles off at the anode.** Iron, silicon and aluminium collect at the cathode.
  4. No water, no toxic reagents, and the leftover metals and glass are useful.

  **Blue Origin's "Blue Alchemist"** passed Critical Design Review (2025), and it aims to make **solar cells and transmission wire from regolith** as well as O₂ ([Blue Origin](https://www.blueorigin.com/news/blue-alchemist-hits-major-milestone-toward-permanent-sustainable-lunar-infrastructure), [IEEE Spectrum](https://spectrum.ieee.org/blue-origin-molten-regolith-electrolysis)). Related approaches: carbothermal reduction (Sierra Space), and hydrogen and molten-salt reduction.
- **On camera:**
  - An insulated **reactor vessel** (a squat cylinder clad in foil), fed by a regolith hopper or conveyor.
  - A viewport showing **white-orange glowing melt**.
  - Thin piping to **frost-free O₂ tanks**. There is no visible vapour outside, because nothing condenses into a cloud in vacuum.
  - Gray slag cooling to **black glass**.
  - Metal sheets or "lunar solar panels" coming off the line make a great speed-build beat.

## 2. Ice hunting in permanently shadowed regions (PSRs)

- **Why the Moon:** polar cold traps (down to ~**25 K**, from [LRO Diviner](https://www.diviner.ucla.edu/science)) have hoarded water and other volatiles from comets, the solar wind and volcanism for billions of years. This ice is both a **scientific archive** and drinking water and propellant for the base. LCROSS (2009) measured about **5.6 ± 2.9 wt% water** in Cabeus crater ejecta.
- **Missions:**
  - **VIPER** was revived; Blue Origin delivers it in **late 2027**. It has a 1 m TRIDENT drill, neutron and near-IR spectrometers, and a mass spectrometer, and runs about a 100-day traverse ([Astronomy](https://www.astronomy.com/space-exploration/nasa-revives-viper-moon-rover-taps-blue-origin-for-lunar-landing/)).
  - **Chang'e-7** (now 2027) carries a **rocket-propelled hopper with water and hydrogen-isotope analyzers** that leaps into a shadowed crater ([Wikipedia](https://en.wikipedia.org/wiki/Chang'e_7), [Scientific American](https://www.scientificamerican.com/article/chinas-change-7-moonshot-will-seek-water-ice-at-the-lunar-south-pole/)).
  - The **Lunar Dielectric Analyzer** (astronaut-deployed) senses ice via electrical properties ([NASA selection](https://www.militaryaerospace.com/home/article/55000283/nasa-announces-first-lunar-instruments-for-artemis-astronaut-deployment)).
- **On camera:**
  - An astronaut at the **knife-edge between blinding sunlit regolith and pitch-black shadow**, with helmet lights and suit heaters on.
  - **Suit lights throw sharp cones with no beam haze.**
  - A drill core comes up **gray and grainy**. Ice is mixed into the soil like frozen sand, not glassy blue chunks.
  - The sample tube may **frost over** for a moment once it is back in the sunlit, *humid* hab (not outside).
  - **Temperature HUD:** −230 °C in the shadow, about +50 °C on the sunlit ridge.

### 2a. PRIME-1 / TRIDENT: the real ice drill (the basis for K_7.B1)

**What it is.** PRIME-1 (Polar Resources Ice Mining Experiment-1) was NASA's first in-situ resource demo on the Moon. It
had two instruments:
- **TRIDENT** (The Regolith and Ice Drill for Exploring New Terrain), built by Honeybee Robotics: a roughly **1 m**,
  low-power **rotary-percussive** drill with a spiral (flighted) auger.
- **MSOLO** (Mass Spectrometer Observing Lunar Operations), a modified commercial mass spectrometer that "sniffs" the
  gases released by the drill cuttings.

The same TRIDENT design is built into **VIPER**.

**How it drills.**
- **Mechanism:** a rotary motor and a percussive hammer drive a **wedge bit**. It pulverises the regolith and ice, and
  the cuttings ride up the **auger flutes**.
- **"Bite" sampling:** it drills a **10 cm bite**, then retracts the auger, and a **brush** at the foot sweeps those 10 cm
  of cuttings onto the surface, where they form a small **cuttings cone** beside the hole. Then it repeats, bite by bite,
  to about 1 m. The point is that each little pile is a depth-tagged sample that MSOLO (and, on VIPER, a near-IR
  spectrometer) can examine.
- **Hardware:** the auger rides on a **vertical deployment rail** (the drill-head carriage slides down it). The bit has
  an embedded **heater and temperature sensors**, because ice-bearing ground reveals itself by how the bit warms and
  how much power it takes to cut. The drill can stop at any commanded depth.

**What happened on the Moon (IM-2, March 2025).**
- Intuitive Machines' Nova-C lander **Athena** launched on 26 Feb 2025. It landed on **6 March 2025**, about 400 m
  (1,300 ft) from its target on Mons Mouton, the farthest south any lander had reached.
- It came to rest **on its side** inside a small crater. Its solar panels could not recharge, so the mission ended
  after about **10 hours** instead of the planned ~10 days.
- In that window the PRIME-1 team ran TRIDENT through its **full range of motion**: auger rotation, full extension,
  percussion "hammering", and the heater with temperature readout. Lying on its side, it could not bite into the ground.
- **MSOLO** ran several scans. The gases it saw appear to be **anthropogenic** (spacecraft propellant venting, traces
  of Earth water), not lunar volatiles.
- **Takeaway for the film:** the drill works in the lunar environment, and nobody has yet pulled ice cuttings out of a
  lunar shadowed crater. K_7.B1 shows the thing PRIME-1 was built to do.

**On camera** (K_7.B1, K_7.B1_close):
- the auger on its rail, entering the ground;
- **neat small cuttings cones**, one per bite, beside the hole;
- grey, sandy cuttings with a fine glitter of ice, not chunks;
- grains that fall in clean short arcs, with no dust cloud.

Hardware structure refs (NASA photos) are in `media/style_refs/prime1/`.

**Sources:**
- [NASA PRIME-1 mission page](https://www.nasa.gov/mission/polar-resources-ice-mining-experiment-1-prime-1/)
- [NASA, "NASA's Lunar Drill Technology Passes Tests on the Moon"](https://www.nasa.gov/missions/artemis/nasas-lunar-drill-technology-passes-tests-on-the-moon/)
- [Zacny et al. 2025, "TRIDENT Ice Mining Drill for Lunar Volatile Prospecting for PRIME-1 and VIPER"](https://icedrill.org/sites/default/files/Zacny_2025_TRIDENT%20Ice%20Mining%20Drill%20for%20Lunar%20Volatile%20Prospecting%20for%20PRIME-1%20and%20VIPER%20Missions.pdf) (bite sampling and cuttings cone)
- [LPSC 2024 TRIDENT abstract (NTRS)](https://ntrs.nasa.gov/citations/20240000585)
- [The Driller, "NASA's lunar drill survives a crash landing…"](https://www.thedriller.com/articles/93689-nasas-lunar-drill-survives-a-crash-landing-and-still-gets-the-job-done)

## 3. Far-side radio astronomy: listening to the cosmic "Dark Ages"

- **Why the Moon:** below about **30 MHz** the sky is almost unobservable from Earth. The ionosphere reflects or absorbs it, and human radio noise plus Earth's own auroral radio emission drown it. The **lunar far side at night** is shielded from Earth by about 3,474 km of rock, making it the **most radio-quiet place in the inner solar system**. The prize is the redshifted **21-cm hydrogen signal from the cosmic Dark Ages**, before the first stars, which arrives at about 1–50 MHz.
- **Missions:**
  - **LuSEE-Night**, a NASA–DOE (Brookhaven and Berkeley) radio telescope bolted to Firefly's **Blue Ghost Mission 2** lander, launches **late 2026** to the far side. Firefly's **Elytra** orbiter relays its data ([Firefly](https://fireflyspace.com/blue-ghost-mission-2), [BNL](https://www.bnl.gov/newsroom/news.php?a=222425), [Wikipedia](https://en.wikipedia.org/wiki/Blue_Ghost_Mission_2)).
  - China's Chang'e-4 far-side lander and Queqiao relay pioneered low-frequency radio there (2019).
  - NIAC's **Lunar Crater Radio Telescope** concept would string a kilometre-wide wire mesh inside a far-side crater: an Arecibo on the Moon.
- **On camera:** four long thin **antenna rods** (monopoles) sticking out from a lander deck. Or the dreamy concept version: a **giant metallic mesh dish draped across a crater**, under a black sky crowded with stars. **On the far side at night, stars are legitimately visible, because no Sun, no Earth and no Earthshine wash them out.** It is **the** place to show a full starfield and the Milky Way.

## 4. Moonquakes: seismometers

- **Why the Moon:** a **dry, cold, fractured crust** makes seismic waves **ring for a long time**. Apollo seismometers recorded the Moon "**ringing like a bell**" for close to an hour after the Apollo 12 ascent stage was crashed into it. Apollo's Passive Seismic Experiments (1969–77) found deep moonquakes tied to Earth's tides and **shallow moonquakes up to about magnitude 5** that can last many minutes. The south pole's young fault scarps make this a **base-safety** question as well as a science one.
- **Missions:** **LEMS** (Lunar Environment Monitoring Station), an astronaut-deployed seismometer built to run autonomously for at least 2 years, now flies on **Artemis IV (2028)** near the south pole ([NASA science](https://science.nasa.gov/missions/artemis/nasa-completes-astronaut-deployed-science-instrument-for-lunar-surface/), [LASP](https://lasp.colorado.edu/2025/12/05/lasp-instruments-target-a-trip-to-the-moon-aboard-nasas-artemis-iv-mission/)). Chang'e-7 also carries seismic equipment.
- **On camera:**
  - A small **gold or silver drum** set in a shallow pit, **covered with a crinkly thermal blanket skirt** and ringed by footprints and a cable.
  - The Apollo heritage image: https://upload.wikimedia.org/wikipedia/commons/e/e3/Ap16_pse.jpg
  - In the hab, a **seismogram on a monitor that keeps ringing long after a hit** works as a subtle beat-synced visual for the taiko.

## 5. Laser retroreflectors: the Moon's oldest working experiment

- **Why the Moon:** **corner-cube mirrors** on the surface bounce Earth lasers straight back. Timing the round trip to millimetres measures:
  - that the Moon **recedes about 3.8 cm per year**;
  - that the Moon has a **liquid core**;
  - and a test of **general relativity** (the equivalence principle).

  Apollo 11, 14 and 15 arrays and the Soviet Lunokhod 1 and 2 arrays still work. Firefly's Blue Ghost 1 (March 2025) placed **NGLR-1**, and observatories **already got returns** ([Firefly](https://fireflyspace.com/news/firefly-aerospace-successfully-completes-14-days-of-surface-operations-on-the-moon)). Moon Base I carries another Laser Retroreflective Array ([NASA](https://www.nasa.gov/event/clps-flight-blue-origins-blue-moon-mark-1/)).
- **On camera:**
  - A **flat aluminium panel**, about a briefcase or small table in size, tilted toward Earth, studded with a **grid of round glass cubes** that glint.
  - Apollo 11 image: https://upload.wikimedia.org/wikipedia/commons/0/08/Apollo_11_Lunar_Laser_Ranging_Experiment.jpg
  - **Poetic use:** her kid at a backyard telescope can't see it, but an observatory **green laser beam** (Apache Point and Grasse use green 532 nm light) points from Earth at her Moon. It is a real, physical line between them. *Beam visibility:* the beam shows near the observatory because Earth's air scatters it. Nothing shows near the Moon.

## 6. Plants and lunar soil

Be precise here. Tech-Twitter will check.

1. **Chang'e-4 "mini biosphere" (Jan 2019, far side).** An 18 cm sealed canister held **Earth soil**, water and air, with seeds of cotton, potato, rapeseed and *Arabidopsis*, plus fruit-fly eggs and yeast. **A cotton seed sprouted (about 7 Jan 2019)**, the **first plant to germinate on another world**. It **died within days** when the lunar night came and the canister fell to about **−52 °C** ([Guinness](https://www.guinnessworldrecords.com/world-records/633299-first-seeds-to-germinate-on-the-moon), [The Wire](https://thewire.in/space/china-moon-cotton-seeds-sprout)). *It grew on the Moon, but not in lunar soil.*
2. **University of Florida, 2022.** Anna-Lisa Paul and Robert Ferl grew ***Arabidopsis thaliana*** in **real Apollo 11, 12 and 17 regolith on Earth**, using about 1 g per well in thimble-sized wells. Everything germinated, but plants were **stunted and stressed** (purple pigment, stress genes switched on like salt or heavy-metal stress). Apollo 11 soil, the most exposed to space weathering, was worst ([UF/IFAS](https://blogs.ifas.ufl.edu/news/2022/05/12/a-first-scientists-grow-plants-in-soil-from-the-moon/), *Communications Biology* 2022). *It grew in lunar soil, but not on the Moon.*
3. **Still a first nobody has achieved: growing a plant in lunar regolith *on* the Moon.** NASA's **LEAF** (Lunar Effects on Agricultural Flora) was selected to grow fast-cycling plants such as *Arabidopsis*, duckweed (*Wolffia*) and *Brassica* in a sealed chamber on an early Artemis landing ([Scientific American](https://www.scientificamerican.com/article/nasas-artemis-astronauts-will-help-grow-crops-on-the-moon-and-much-more)).

**On camera:**
- A **small sealed plant chamber** inside the hab, lit with **magenta/pink-purple LED** grow lights (red plus blue diodes).
- Pale green rosettes **with a purple stress tint** (real UF result), in **gray powder** rather than brown soil.
- **Creative hook:** an osmanthus seedling (桂, Wu Gang's tree, Hangzhou's city flower) would be a lovely fictional touch. Label it as the character's private experiment, not as a real mission.
- Image (UF): https://commons.wikimedia.org/wiki/File:Transcriptome_analyses_of_plants_grown_in_lunar_regolith_based_on_morphology.webp

## 7. Dust mitigation

- **Why the Moon:** lunar dust is **unweathered, glassy, jagged** (no wind or water to round the grains) and electrostatically charged. Apollo astronauts said it **smelled like spent gunpowder**, and it **jammed suit joints, scratched visors and caused "lunar hay fever."** Gene Cernan called dust one of the biggest obstacles to long stays.
- **Tech:** the **Electrodynamic Dust Shield (EDS)**, flown on Blue Ghost 1 in 2025, uses transparent electrodes to **sweep dust off glass and radiators with traveling electric fields**. It worked ([Firefly / NASA results](https://fireflyspace.com/missions/blue-ghost-mission-1/)). **DUSTER** (LASP, Artemis IV) will characterize the dust and plasma environment ([LASP](https://lasp.colorado.edu/2025/12/05/lasp-instruments-target-a-trip-to-the-moon-aboard-nasas-artemis-iv-mission/)). Suitports, where the suit stays outside, keep dust out of the cabin.
- **On camera:**
  - **Suits darken from the boots up** to mid-shin with charcoal-gray dust that **clings** (it doesn't brush off cleanly).
  - A camera lens or window with a **shimmering pattern as dust "walks" off it** (EDS).
  - Rover **fenders** matter. Apollo 17's broken fender caused "rooster tails" of dust, and the crew fixed it with **duct tape and four laminated maps** ([Smithsonian](https://airandspace.si.edu/stories/editorial/duct-tape-auto-repair-moon)), which makes a delightful real-life easter egg.

## 8. Building with the Moon: 3D printing and sintering

- **Why the Moon:** every kilogram launched is precious. Print with what's there.
- **Projects:**
  - **ICON Olympus**: laser-melting regolith, with NASA funding through 2028 and a lunar sidewalk-tile demo planned.
  - **Chang'e-8 (2028–29)**: a payload **melts lunar soil and 3D-prints bricks**, and a ~100 kg **dexterous robot** carries and assembles them ([Space.com](https://www.space.com/china-moon-3d-printing-bricks-change-8-2028)). China also flew **"lunar-soil" simulant bricks** to its Tiangong station on Tianzhou-8 (Nov 2024) for exposure testing.
  - **Microwave-sintered landing pads**, plus ESA/Foster binder-jet domes.
- **On camera:**
  - A laser or print head moving with a **bright pinpoint melt** (yellow-white at the spot, cooling to dull red, then dark glass).
  - **No smoke, no sparks drifting.** Ejected sparks fly in **straight lines and parabolas** and don't float or curl.
  - Robot arms stacking **charcoal-gray bricks** in a hexagonal or interlocking pattern.
  - This is perfect for the "speed-build" timelapse in the drop.

## 9. Mission-level science objectives (what the crews are *for*)

- **Artemis** (from NASA's Artemis III Science Definition Team, carried forward to Artemis IV+): understand **planetary processes** (impact history, interior, volcanism); the **character and origin of polar volatiles**; **the Moon as a record of the Sun and solar system**; **observing the universe from the Moon**; **experimental science in the lunar environment** (biology, plants); and **investigating and mitigating exploration risks** (dust, radiation, seismicity) ([NASA instrument selection](https://www.militaryaerospace.com/home/article/55000283/nasa-announces-first-lunar-instruments-for-artemis-astronaut-deployment)).
- **ILRS** (CNSA): lunar geology and **in-situ resource utilization**, **lunar-based astronomy** (far side), **lunar-based Earth observation**, and fundamental science in the lunar environment. The research station is to be built robotically first, with crewed visits later ([Space.com](https://space.com/china-moon-base-south-pole-2035)).
- **Show-don't-tell kit for the montage:** sample bags and **scoop, tongs and rake** (Apollo-style tools are still the baseline), a **core tube hammered in**, geology **"field notes" spoken to the camera**, a **gnomon** (color and scale reference stick) in sample photos, and **trench walls** cut in regolith.

## 10. The solar wind: catching the Sun on a flag

- **Why the Moon:** no magnetic field and no atmosphere, so **the solar wind hits the ground directly**. Regolith is a billion-year archive of it, which is why helium-3 is there. Seattle startup **Interlune** plans to prospect for He-3 (missions 2026–28) and has prototyped a 100 t/h excavator with Vermeer ([GeekWire](https://www.geekwire.com/2026/interlune-excavator-helium-3-moon-construction/)).
- **Best easter egg:** on Apollo 11 the **first science experiment deployed** was the Swiss **Solar Wind Composition** foil (University of Bern), **set up before the U.S. flag**. It was a **sheet of aluminium foil hung like a window shade** on a pole, exposed and then rolled up and brought home, and it flew on Apollos 11–16.
- **On camera:** a shiny **foil "banner" on a pole**, which looks like a flag but isn't. It makes a lovely visual rhyme with prayer flags, banners and the **对影成三人** shadow.

---

## 11. Looking back at Earth (the key section for the homesick shots)

### 11a. Earth (almost) never moves in the lunar sky
The Moon is **tidally locked**: it rotates once per orbit. So from any given spot on the **near side**, **Earth hangs in essentially the same place in the sky** forever. It does not rise or set. It only **wobbles in a small loop about 15–18° across** each month because of **libration** (±7°54′ in longitude from the Moon's elliptical orbit, ±6°50′ in latitude from its tilt) ([Wikipedia: Earth phase](https://en.wikipedia.org/wiki/Earth_phase), [Wikipedia: Libration](https://en.wikipedia.org/wiki/Libration)).
- **How high Earth sits depends on where you stand.** Near the centre of the near side, Earth is **near the zenith**. At Apollo 11 (Tranquillity, about 23°E) it is high, around 65–70°. As you move toward the limb it sinks. **On the far side Earth is never visible.**
- **"Earthrise" is a lunar-orbit phenomenon.** The famous *Earthrise* (Bill Anders, Apollo 8, 24 Dec 1968) was taken **from orbit**. Surface "earthrises" only happen in a narrow band near the limb and **at the poles**, through libration ([Wikipedia: Earth phase](https://en.wikipedia.org/wiki/Earth_phase)). Image: https://upload.wikimedia.org/wikipedia/commons/a/a8/NASA-Apollo8-Dec24-Earthrise.jpg
- **Artemis II (April 2026)** produced new **"Earthset"** images from Orion as it swung around the Moon: https://commons.wikimedia.org/wiki/File:Earthset_(art002e009288).jpg

### 11b. From the south pole, Earth sits ON the horizon (verified)
At the pole the "near side" meets the limb, so Earth is **always near the horizon**:
- Earth's centre sits within about **±7° of the horizon** (that is the latitude libration). Over each ~27-day cycle it **bobs up and down** and can **dip completely below a flat horizon**. NASA's SVS visualization from the **Shackleton rim** shows exactly this: "**the Sun glides around the horizon, never more than 1.5 degrees above or below it, while the Earth bobs up and down, never veering far from 0° longitude**" ([NASA SVS 4944](https://svs.gsfc.nasa.gov/4944)).
- **Direction:** Earth always appears in roughly the **same compass direction**, the one that points along the 0° (Earth-facing) meridian. In the SVS view it hovers over **Mons Malapert**, about 85 miles away. It drifts side to side only by a few degrees.
- **Visibility:** at the best Artemis candidate sites, direct line of sight to Earth exists only **around half the time** (one site analysis gives 51%) ([arXiv 2406.19863](https://arxiv.org/pdf/2406.19863)). Mountains, ridges and crater rims add or remove time. **So at the south pole there IS a monthly "Earthrise" and "Earthset"**, low, slow and grazing along the horizon.
- **Orientation:** from the south pole Earth appears **"upside-down and rotating backwards"** compared with a north-up globe (NASA SVS). South is up, so **Antarctica is at the top and China near the bottom**. Earth still **visibly rotates once every 24 hours**, so continents and cloud bands slide across the disk during a long shot.
- **Size:** Earth spans about **1.9–2°**, about **3.7× wider than the Moon looks from Earth** (about 13× the area). A thumb at arm's length (≈2°) just covers it. Full Earth is **more than 50× brighter** than a full Moon.
- **The Sun is also on the horizon.** It circles the whole horizon once per ~29.5 days and is never more than about 1.5° up, so a **1.7 m astronaut casts a shadow about 65 m long** at 1.5° sun elevation, and **about 200 m** at 0.5°.

#### Does she "lower her head" (低头) to see Earth? (fact-check of the treatment)
- **Mostly no. She looks straight ahead, level, not up.** Earth sits within a few degrees of eye level. Compared with her kids tilting their heads **up** (举头) to a high Mid-Autumn moon, she **doesn't raise her head at all**. The honest framing is **"level gaze, not upward gaze."**
- **Sometimes, literally yes.** Standing on an **elevated crater rim or ridge** (Shackleton rim, the Connecting Ridge, Malapert), the visible horizon **drops below eye level**: by about 2° from 1 km above the surrounding terrain and about 4° from 5 km. During the part of the month when Earth's libration puts it a few degrees below true horizontal, she **looks slightly *down* at Earth** sitting just above the distant far horizon. The tilt is small (a few degrees), not a dramatic bowed head.
- **Recommended staging:** put her on the **crater rim**, Earth just above the far horizon and slightly below her eyeline. Shoot from **behind and above her shoulder** so the camera looks *down* past her toward Earth. That mirrors the kids' low-angle *up* shot on Earth. Her **long shadow runs ahead of her toward Earth** (see the phase section below). This is accurate *and* gives the 举头/低头 rhyme.

### 11c. Earth's phases are the opposite of the Moon's
The phase relationship is **complementary**. When people on Earth see a **full Moon**, an astronaut on the Moon sees a **"new Earth"** (dark side facing her), and vice versa. The two **lit fractions add up to about 100%** at every moment, because the phase angles at Earth and at the Moon are supplementary ([Wikipedia: Earth phase](https://en.wikipedia.org/wiki/Earth_phase)).

| Family on Earth sees... | She sees Earth as... | Where the Sun is in *her* sky (south pole) |
|---|---|---|
| **Full Moon (Mid-Autumn, 15th of the 8th month)** | **New Earth**: a dark disk, maybe a hairline crescent, faint city lights in long exposure | **Next to Earth** on the horizon, so glare dominates |
| Waning/waxing gibbous | Thin crescent Earth | ~45° from Earth along the horizon |
| Half Moon | Half Earth | **90° to the side** of Earth |
| Thin crescent Moon (月缺, "waning moon") | **Gibbous Earth** | Mostly behind her |
| **New Moon (初一)** | **Full Earth**: blazing blue-white | **Directly behind her**; her shadow points straight at Earth |

**Story implications (verified geometry):**
- **On Mid-Autumn night, when the family sees the fullest moon, she sees Earth at its darkest.** That is heartbreaking and true. Mid-Autumn 2026 was **Fri 25 Sep** (15th day of the 8th month); the astronomical full moon was **26 Sep 16:49 UTC** (00:49 on the 27th, Beijing time) ([publicholidays](https://publicholidays.sg/mid-autumn-festival/), [Farmers' Almanac](https://www.farmersalmanac.com/september-full-harvest-moon)). Next: **Wed 15 Sep 2027**.
- **The lyric "homesick with waning moons" (月缺) is the physics in reverse.** As the moon wanes for the family, **Earth waxes for her**. Their two "halves" always add up to one whole, which is the **团圆 (reunion) image hidden in orbital mechanics**.
- **For a big, fully lit Earth in her shot,** the Sun must be **behind her**. At the south pole that means **her long shadow stretches across the plain toward Earth on the horizon**. Use this for the homesick money shot.
- **If a total lunar eclipse happens** (Earth sees a red Moon), **she sees Earth eclipse the Sun**: a **black Earth with a thin glowing red-orange ring** of every sunrise and sunset on Earth at once. Firefly's Blue Ghost lander photographed this from the Moon on 14 March 2025 ([NASA blog](https://www.nasa.gov/blogs/missions/2025/03/14/nasa-science-data-received-blue-ghost-captures-eclipse-from-moon); image https://www.nasa.gov/wp-content/uploads/2025/03/eclipse-shot-from-blue-ghost-mission-1.jpg). That's a stunning, real visual.

### 11d. Earth-observation science from the Moon
- **Apollo 16 (1972)** set up George Carruthers' **Far Ultraviolet Camera**, the first Moon-based telescope. It photographed Earth's glowing hydrogen **geocorona** and aurora from the surface.
- **Chang'e-3 (2013)** imaged Earth's **plasmasphere** in extreme UV from the Moon. The ILRS lists "lunar-based Earth observation" as a core objective: from the Moon, one instrument sees **an entire hemisphere of Earth at once**, continuously, for climate, energy-balance and magnetosphere studies.
- **On camera:** a small telescope or camera on a gimbal aimed at the horizon at Earth, with an **Earth-at-a-glance** dashboard inside (cloud cover, aurora, a **live time-lapse of the planet spinning**). It's a good device for her to "find Hangzhou" on the disk. China would be on the night side or day side depending on the time of day in Beijing.

---

## 12. Bonus: Moon-only "activities" that read well on screen
- **Geology traverses:** pick up a rock with tongs, bag it, photograph it with a gnomon, and describe it out loud. Apollo-style, and the core of real EVA timelines.
- **Deploying an instrument package:** carry it, level it with a bubble level (gravity still works, just weaker), aim it, cover it with a thermal blanket.
- **Driving the LTV,** with dust rooster tails in parabolas (§7).
- **Drop test:** the Apollo 15 **hammer and feather** fell together (Galileo confirmed). This is a cheap, delightful moment: [NASA](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_15_feather_drop.html).
- **"Eclipse watch party"** inside the hab when Earth crosses the Sun.

---

## 13. Arabidopsis in lunar regolith: what the experiment really looks like

*For shot 7.B3 (HUD: "LÚCIA FERREIRA · ARABIDOPSIS IN LUNAR REGOLITH · FIRST ROSETTE"). Researched 7 Oct 2026 in answer
to the director's note at 2:17. This extends §6; it does not repeat it. Reference images are in
`media/refs/experiments/plant/` (see `SOURCES.md` there).*

**Short answer to "is this what the experiment would look like?"** No. The real analog is the University of Florida
experiment of 2022, and it looked like a cell-culture plate of thimble-sized wells of wet, near-black soil with plants
smaller than a fingertip, inside clear boxes under magenta LEDs. Nothing in it was bigger than a coin. The current
keyframe shows a hand-span succulent in a bowl.

### 13a. The real experiments, and what each one looked like

**University of Florida, 2022 (Paul, Elardo & Ferl). The only plants ever grown in real lunar soil.**
- **Container:** ordinary 48-well plastic cell-culture plates. Each well is **12.5 mm wide and 15 mm deep**. Four plates.
- **Soil:** **900 mg of regolith per well**, sieved to under 1 mm, a layer about **5 mm deep**. Under it a 0.45 µm nylon
  filter, and under that a **Rockwool plug** squeezed to about 7 mm, with a tuft poking through a hole drilled in the
  bottom of the well.
- **Watering:** from below. The plate stands in a tray of dilute nutrient solution (0.125× MS, pH 5.7), the Rockwool
  wicks it up, then the plate is drained. Daily. Apollo 11 and 12 soil **repelled water**: drops beaded on top and the
  soil had to be stirred with a pipette tip to wet it.
- **Samples:** Apollo 11 (10084), Apollo 12 (12070), Apollo 17 (70051), four wells of each, plus 16 control wells of
  JSC-1A simulant (volcanic ash). The whole experiment used **12 g** of Moon.
- **Seeds:** 3 to 5 *Arabidopsis thaliana* (Col-0) seeds pipetted onto each well, thinned with forceps to one plant
  on days 6 to 8.
- **Enclosure:** the plates sat in **clear, ventilated terrarium boxes** under LED grow bars in a secured growth room.
  The press photos show the room flooded with magenta light. *There was no glovebox.* Soil was weighed and loaded in a
  ventilated lab cabinet by people in lab coats, sleeves and nitrile gloves.
- **What happened:** every seed germinated in 48 to 60 hours and all seedlings looked alike until about day 6. After
  that the lunar plants fell behind: stunted roots, slow leaves. The paper sorts them into "large" (normal looking but
  still smaller than controls), "small" ("small, but green and well proportioned") and "severe" ("tiny with distorted
  morphology and reddish black pigmentation throughout"). Apollo 11 soil, the most space-weathered, was worst.
- **Record keeping:** every plate was photographed from above every day and leaf area was measured from the photos.
  On day 20 the plants were cut off at soil level with scissors and dropped into tubes for freezing.

**Chang'e-4 Lunar Micro Ecosystem, 2019. The only plant ever grown on the Moon** (see §6). A sealed aluminium can about
18 cm long and 16 cm across, 2.6 kg, about 1 litre inside, with Earth soil, water, air, two small cameras and a heat
control system, designed by Xie Gengxin's team at Chongqing University. Nobody could look into it; the only views are
the camera frames of a pale cotton sprout pushing through a white lattice. It grew in Earth soil, and no person was
there.

**NASA Veggie and Advanced Plant Habitat (ISS). What a flight growth chamber looks like.**
- **Veggie** is "about the size of a carry-on piece of luggage" and usually holds six plants, each in a fabric
  "pillow" of clay granules and fertilizer. It has a bank of LEDs on top and "typically glows magenta pink", because
  plants use red and blue and reflect green. The crew wear sunglasses beside it.
- **APH** is fully enclosed and automated, with cameras and "more than 180 sensors", a porous clay substrate, and red,
  green, blue, white and far-red LEDs. *Arabidopsis* was among its first crops (2018).
- Neither uses lunar soil.

**LEAF (Lunar Effects on Agricultural Flora), Space Lab Technologies, PI Christine Escobar.**
- **What it is:** the "LEAF β" payload is a small sealed growth chamber with its own atmosphere, thermal protection,
  water, nutrients, light and cameras, which astronauts set down on the surface and switch on.
- **Species:** red and green *Brassica rapa* (Wisconsin Fast Plants), *Wolffia* (duckweed) and *Arabidopsis thaliana*.
- **Plan:** seeds germinate on the surface; the crew bring some seedlings home after about a week; the rest grow on
  until the power runs out. It measures photosynthesis, growth and stress under lunar radiation and partial gravity.
- **What it is not:** none of the sources say LEAF uses lunar regolith. It tests the lunar *environment*, not the
  soil. So §6 point 3 still stands: a plant in lunar regolith on the Moon is a first nobody has done.
- **Status (uncertain):** LEAF was selected in March 2024 for Artemis III. In early 2026 Artemis III became an
  Earth-orbit test and the first landing moved to Artemis IV (2028). I found no statement of which flight LEAF is now
  on, and **no published photo of the hardware**. Do not describe LEAF as flown.

**ALEPH-1 (Lunaria One, Australia).** A hermetically sealed chamber of about 500 g bolted to the side panel of an
Intuitive Machines Nova-C lander (IM-3, not yet flown as far as I can confirm). It carries seeds and possibly dormant
"resurrection plants" and aims to show germination within 72 hours of landing, watched by camera. No regolith, no crew.

**EDEN ISS (DLR, Neumayer Station III, Antarctica, from 2018).** A shipping-container greenhouse run by one
over-wintering scientist. It shows what the *food* side of a base greenhouse looks like: stacked shallow grey trays of
lettuce, chard, rocket, radish, tomato and herbs under LED bars, roots misted with nutrient solution, no soil at all.

**China Agricultural University, 2023.** Tobacco relative *Nicotiana benthamiana* grown in a lunar soil **simulant**
(Changbai Mountain volcanic rock). Three phosphate-dissolving bacteria (*Bacillus mucilaginosus*, *B. megaterium*,
*Pseudomonas fluorescens*) made the phosphorus available and gave longer stems and roots and about twice the
chlorophyll. Not real lunar soil; the relevance is that by 2035 a lunar botanist would be treating regolith with
microbes, which is a plausible reason Lúcia's plant survives.

### 13b. What the plant really looks like

- ***Arabidopsis thaliana* is a small weed of the mustard family.** At rosette stage the leaves lie **flat on the soil
  like wheel spokes**. Each leaf is a thin, matte, **spoon-shaped blade on a narrow stalk**, with tiny hairs. Mature
  basal leaves are 1.5 to 5 cm long and 2 to 10 mm wide, so a fully grown rosette is roughly 5 to 10 cm across.
- **It is nothing like a succulent.** No thick fleshy leaves, no points, no tight spiral of stacked leaves, no waxy
  bloom. It is closer to a seedling of rocket or a tiny rosette of lamb's lettuce.
- **A "first rosette" is much smaller than a mature one.** Measured against the 12.5 mm wells in the UF photos, on
  day 16:
  - control plants in simulant: about **2 to 2.5 cm** across, 6 to 8 leaves, bright green;
  - plants in Apollo soil: about **0.5 to 1.3 cm** across;
  - "severe" plants: **3 to 4 mm**, dark.
- **Stress colour.** Stressed *Arabidopsis* makes anthocyanin: violet to reddish-purple, first on the leaf stalks, the
  leaf undersides and edges and the oldest leaves. In the worst UF plants the whole plant went reddish-black. The mild
  version (green blades, purple stalks and rims) is both accurate and pretty.
- **For our shot:** a rosette **2 to 3 cm across** with 6 to 8 leaves is the honest size for the first good plant in
  regolith. That is about the size of a large coin, and one and a half times the width of a fingertip.

### 13c. What the experiment would look like at our base (2035 to 2040)

- **Why it is in a sealed box.** Lunar dust is sharp and a lung hazard, so loose regolith is not handled in the open
  cabin. The box also holds its own humidity and CO2. A sealed chamber with glove ports is therefore right, even though
  UF, working on Earth, did not need one. This matches 7.C4c, where Lúcia has her arm in a glove port.
- **The chamber.** A clear box about the size of a microwave oven or a mini-fridge on a bench: metal frame, gasketed
  lid, **two glove ports with black gauntlets on the side the scientist stands**, a small pass-through airlock, a flat
  LED panel in the lid, a fan, a sensor puck (temperature, humidity, CO2), a thin nutrient line, a camera on a bracket
  looking straight down, and beads of condensation on the inside of the window.
- **The pots.** Small and many, not one big one: a culture plate of thimble wells, or a tray of clear cups about 3 cm
  wide. Each has about 1 cm of regolith over a white wick plug and stands in a shallow dish of nutrient solution.
  Regolith brought indoors is a controlled sample, so nobody would fill a bowl with it.
- **The soil colour.** Dry south-pole (highland) regolith is pale ash grey. **Wet, it goes dark charcoal.** In every UF
  photo the wet soil in the wells is nearly black. It is never brown and has no crumbs, bark or perlite.
- **The light.** Red plus blue LEDs give the familiar magenta. Under pure magenta light green leaves look almost
  black, which is why Veggie added green LEDs and APH has white ones: so people can see the plants. A small white
  inspection light is how she would actually see green.
- **Controls.** A real experiment has a second tray in simulant or in ordinary growth medium, with bigger, greener
  plants. Keep it out of frame so the rosette stays the only green.

### 13d. What the scientist does and wears

- **Doing** (any one of these is accurate):
  - bending until her eyes are level with the tray and looking through the window, as Paul and Ferl do in the UF photo;
  - one arm in a glove port, holding a pipette or syringe of nutrient solution a few centimetres from the plant;
  - laying a small millimetre scale card beside the plant for the daily photograph;
  - thinning seedlings with fine forceps.
- **Wearing:** the crew polo is fine inside the hab. Hair tied back. No lab coat, mask or goggles, because the
  regolith is inside the box and her hand is in the box's own gauntlet. Tinted glasses pushed up on her head are a nice
  real touch (ISS crew wear them beside Veggie).

### 13e. What an expert would call wrong in the current keyframe (K_7.B3)

1. **The plant is the wrong species shape.** It is an echeveria-like succulent: thick, pointed, stacked leaves.
2. **The plant is about ten times too big.** It is wider than her face. The real thing would fit on a fingertip or a
   coin.
3. **The pot is a wide stone bowl on a little stand**, holding perhaps a kilogram of regolith. The real experiment
   used 0.9 g per plant.
4. **The chamber is not sealed and not equipped.** It reads as an open-topped glass case: no lid seal, no light panel,
   no sensor, no tubing, no camera.
5. **The glove ports are on the far wall, facing away from her.** She could not reach them from where she stands, and
   her head appears to cross the plane of the glass.
6. **The room is lined with trays of lotus-like flowers.** Lotus is a pond plant, not a hab crop, and dozens of large
   rosette shapes compete with the one rosette that matters. A reviewer expects leaf lettuce, pak choi, mizuna, chard.
   (If the lotus is a deliberate motif, keep it to ornament and off the growing trays.)
7. **Nothing gives scale and nothing is being measured.** No scale card, no camera, no tool in her hand.

### 13f. The shot as it should be (7.B3)

1. **Framing:** close and low. The camera is at bench height about 30 cm from the plant, looking across the growing
   tray toward the chamber window. The plant is sharp in the lower centre; Lúcia's face is behind the window, upper
   right, softer. This is the only way a 2 to 3 cm plant can be the focal point.
2. **The plant:** one *Arabidopsis thaliana* seedling at first-rosette stage, **2 to 3 cm across**, lying almost flat on
   the soil. Six to eight leaves in a loose pinwheel. Each leaf is a thin, matte, round-to-spoon-shaped blade 4 to
   10 mm long on a fine stalk, faintly hairy. The two oldest leaves are the smallest and roundest.
3. **Its colour:** muted mid-green blades, with violet-purple on the leaf stalks, along the leaf rims and on the two
   oldest leaves. Slightly cupped and a little uneven. It should look small and tough, not lush.
4. **Scale:** a black-gloved fingertip (the chamber's gauntlet) or a small millimetre scale card sits beside it. The
   whole rosette is about one and a half fingertips wide. Three of them would fit side by side across her palm.
5. **The pot:** a clear tray of six small clear cups, each about 3 cm wide and 3 cm tall. Each holds a 1 cm layer of
   fine regolith, pale ash grey where dry and dark charcoal where wet, on a white fibrous wick plug. The tray stands
   in a shallow dish of clear nutrient solution. Only one cup has the rosette. Two others show pin-head pairs of seed
   leaves. The rest are bare grey.
6. **The chamber:** a sealed clear box about 60 × 40 × 40 cm with a metal frame and a gasketed lid; two round glove
   ports with black gauntlets in the wall **facing her**; a flat LED panel in the lid; a small sensor puck; one thin
   nutrient tube; a small camera on a bracket looking straight down at the tray; fine beads of condensation on the
   inside of the window.
7. **The light:** the lid panel gives magenta-pink grow light, under which the leaves look nearly black. A small white
   inspection lamp she has just switched on makes one neutral pool around the plant, and only inside that pool do the
   true green and purple show. (In the gold-line style: everything stays gold on indigo; the rosette in its small pool
   is the only colour.)
8. **Lúcia:** white polo with the pale cinnabar-pink collar stripe, hair tied back, no lab coat and no mask. Her left
   arm is in the left glove port to the elbow, holding a syringe (or the scale card) a few centimetres from the plant.
   She has bent until her eyes are level with the tray and looks through the window, lips just parted. Quiet, not
   theatrical.
9. **Background:** the greenhouse module, out of focus: shallow trays of ordinary leafy seedlings (lettuce, pak choi,
   mizuna, chard) under LED bars, in gold line only. No flowers and nothing rosette-shaped large enough to compete.
10. **Motion for the video pass:** the gauntlet slides the scale card in and holds still; the camera's indicator
    blinks once; she breathes out and a patch of the window fogs and clears. The plant does not move.
11. **Must not appear:** succulent, echeveria or lotus shapes; a plant bigger than a coin; brown potting soil; a
    decorative bowl; an open-topped box; a flower.

### 13g. Reference images (`media/refs/experiments/plant/`)

Hand these three to the image model first:
1. `small_uf_05_day16_simulant_vs_lunar.jpg`: true plant shape, true size against 12.5 mm wells, wet regolith colour.
2. `small_uf_03_harvest_plant_into_vial.jpg`: one whole plant against a gloved hand.
3. `small_uf_01_paul_ferl_plates_under_led.jpg`: the pose, the clear boxes, the magenta light.

Also in the folder: `small_uf_04_pipette_wetting_regolith.jpg` (pipette over wells of regolith),
`small_paul2022_fig2_growth.jpg` and `paul2022_fig4_morphology.png` (scale-barred close-ups, including the dark
"severe" plant), `small_arabidopsis_rosette_reference.jpg` (mature rosette shape), `iss56_arabidopsis_in_aph.jpg` and
`iss39_veggie_swanson.jpg` (flight growth chambers), `change4_cotton_sprout.jpg` (the one real plant on the Moon).
Credits and licences are in `SOURCES.md`. The UF photos are press photos (credit: UF/IFAS, Tyler Jones) and the
Chang'e-4 and paper figures are for reference only; none should appear in the film.

**Sources:**
- [Paul, Elardo & Ferl 2022, *Communications Biology* 5:382](https://www.nature.com/articles/s42003-022-03334-8)
  ([PMC full text with Methods](https://pmc.ncbi.nlm.nih.gov/articles/PMC9098553/))
- [NASA, "Scientists Grow Plants in Lunar Soil"](https://www.nasa.gov/humans-in-space/scientists-grow-plants-in-lunar-soil/) (photos and captions)
- [NASA, "Growing Plants in Space"](https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/) (Veggie and APH)
- [NASA, first lunar instruments for Artemis astronaut deployment](https://www.nasa.gov/news-release/nasa-selects-first-lunar-instruments-for-artemis-astronaut-deployment/) (LEAF selection)
- [Sky at Night, "Could astronauts grow plants on the Moon?"](https://www.skyatnightmagazine.com/space-science/leaf-grow-plants-on-the-moon) and
  [University of Adelaide](https://www.adelaide.edu.au/newsroom/news/list/2024/04/02/plants-to-be-grown-on-the-moon-when-humans-return) (LEAF operations and species)
- [The Register, Artemis reshuffle, March 2026](https://www.theregister.com/2026/03/02/nasa_artemis_reshuffle/)
- [RMIT, ALEPH-1 payload summary](https://www.rmit.edu.au/partner/hubs/space-industry-hub/m2mist/aleph-1)
- [NPR, "Cotton Seed Sprouts In China's Lunar Lander"](https://www.npr.org/2019/01/15/685449027/cotton-seeds-have-sprouted-in-chinas-lunar-lander) and
  [NBC](https://www.nbcnews.com/mach/science/china-s-moon-plants-are-dead-just-days-after-sprouting-ncna959971) (Chang'e-4 canister)
- [EDEN ISS project](https://eden-iss.net/)
- [Xia et al. 2023, *Communications Biology*](https://www.nature.com/articles/s42003-023-05391-z) and
  [Universe Today summary](https://www.universetoday.com/164241/plants-could-grow-in-lunar-regolith-using-bacteria/) (bacteria in simulant)
- [Wikipedia, *Arabidopsis thaliana*](https://en.wikipedia.org/wiki/Arabidopsis_thaliana) (leaf dimensions)

---

## 14. The ice drill: mounting, scale and what the shot should show

*For shot 7.B1 (HUD: "ARJUN RAMAN · PSR · H2O ICE 5.6 ± 2.9 wt%"). Researched 7 Oct 2026 in answer to the director's
note at 2:13. This extends §2 and §2a (what TRIDENT is and what happened on IM-2); it does not repeat them. Reference
images are in `media/refs/experiments/drill/` (see `SOURCES.md` there) and `media/style_refs/prime1/`.*

**Short answer.** The director is right. A real lunar drill hangs from something rigid and heavy that presses a foot on
the ground. A 70 kg legged robot cannot be that thing. The drill should stand on its own braced frame, with the rabbit
rover a few metres away doing what it is good at: hauling, power, light and relay.

### 14a. TRIDENT by the numbers (Zacny et al. 2025, the builders' own paper)

| | |
|---|---|
| Height of the whole mechanism | about **1.75 m** |
| Mass | **26.5 kg** in all: drill 19.5 kg, separate avionics box 7 kg |
| Auger (drill string) | **1 m** long, **25.4 mm (1 inch)** in diameter. About as thick as a broom handle |
| Bit | percussive-grade **tungsten carbide** tip |
| Rotation | 90 to 100 rpm when cutting (up to 120), 15 rpm when pulling out. Rotary power about **50 W** nominal |
| Percussion | cam-and-spring hammer, **2 J per blow**, 729 blows a minute nominal (up to 972). Used only when the ground is hard |
| Weight on bit | **100 N** nominal, up to 500 N |
| Feed speed | **1.25 mm/s**, so a 10 cm bite is about 80 seconds of cutting |
| Structure | **two nested linear stages** on rails, each driven by a steel wire rope on a capstan. The **deploy stage** (35 cm travel) lowers a **footpad** and preloads it on the ground. The **feed stage** (100 cm travel) carries the drill head down |
| At the foot | the footpad, a passive **bristle brush wheel** and a short **chute** |
| Wiring | flat amber **flex ribbon cables** that hang in loops and follow the moving stages |
| In the auger | a temperature sensor in the bit, and a heater plus a second sensor 35 cm above it |

Two things in that table matter for our picture.
- **It is slender.** The mast is two thin rails a hand's width apart. The auger is thumb-thick. The hole it leaves is
  the size of a coin.
- **The drill head "floats".** The designers hung the head on wire rope so it can bounce under its own hammering,
  "analogous to construction workers supporting jackhammers" without leaning on them. The frame resists tilt and holds
  the foot down; it does not ram the drill in.

**One correction to §2a.** In the test photos the bites do not make a row of separate cones. Every bite is brushed off at
the same spot and **one cone grows**, photographed after each bite. With a geologist present, he would clear each bite
before the next one lands (see 14f), so at any moment there is one fresh cone.

### 14b. How real drills are mounted

| Drill | What it hangs from | Notes |
|---|---|---|
| **TRIDENT on PRIME-1** (IM-2 *Athena*, 2025) | The **side of the Nova-C lander**, reaching the ground between two legs | A lander several metres tall and roughly 2 t at launch (approximate). Fixed position: it can only drill where it lands |
| **TRIDENT on VIPER** (2027) | **Inside the rover body**, coming out through the belly between the four wheels | Rover dry mass **430 kg**, about 1.5 × 1.5 × 2.5 m. It stops, lowers the footpad, drills, stows the drill inside, drives on |
| **Apollo Lunar Surface Drill** (Apollo 15 to 17) | **The astronaut's hands**, with a round **treadle** on the ground that he stood on | Battery powered, about 13.4 kg, 430 to 500 W, 280 rpm, 2,270 blows a minute, stems to 3 m. Apollo 15's stem was very hard to pull out; a jack was added for 16 and 17. Spare stems stood in a free-standing rack beside him |
| **ProSEED** (ESA PROSPECT, built by Leonardo) | A **lander deck** | Planned for Russia's Luna-27; after 2022 moved to a NASA CLPS flight on an Intuitive Machines Nova-C in 2027. Reaches 1 m, passes samples to the ProSPA oven lab |
| **Luna 16, 20, 24; Chang'e-5 and 6** | **Lander-mounted** coring drills | Luna 24 reached about 2 m |
| **Chang'e-7 hopper** (launch slipped to 2027) | A rocket hopper that lands in the shadowed crater | Reported to carry a drill, an arm, a furnace and the LUWA water analyser |
| **LUPEX rover** (JAXA and ISRO, 2028 to 29) | A **wheeled rover** of about 350 kg | Drill to 1.5 m (some sources say 1 m) |
| **RESOLVE on Artemis Jr** (NASA and CSA field test, 2012) | A **wheeled rover**, with the drill mast braced by diagonal struts | The ancestor of VIPER's layout |

Every machine drill on this list is on a lander or on a wheeled rover of 350 kg or more. None is on a legged robot.

### 14c. Why the rabbit rover cannot carry it

Yutu is about 70 kg (character bible). On the Moon that weighs **113 N**.
- **Weight on bit.** The drill needs 100 N pressed down as routine and up to 500 N in hard, ice-cemented ground. Every
  newton pushed onto the bit comes off the rover's feet. At 100 N Yutu is nearly lifted off the ground. At 500 N it
  would need to mass over 300 kg.
- **Twist.** 50 W at 100 rpm is about 5 N·m of torque, and much more if the bit jams. A rover with almost no weight
  left on its feet has almost no grip to resist it. It would turn itself around the drill.
- **Hammering.** Twelve blows a second go straight into leg joints that are servo-held and sitting at about 40 K.
- **Finding the hole again.** Bite sampling pulls the auger completely out and puts it back into a 25 mm hole about ten
  times per metre. The platform must not shift by more than a few millimetres for an hour or more.
- **Proportion.** The mast is 1.75 m. Yutu is the size of a large dog.

VIPER, at 430 kg (about 700 N on the Moon), with the drill at its centre and four wheels around it, is the lightest
platform anyone has trusted with this drill.

**Conflict to resolve in other documents** (not edited here): `docs/character_bible.md` gives Yutu a "belly drill
(about 1 m auger)" and a haunch-sitting drilling pose, and `media/keyframes/K_7.B1.txt` asks for a "side-mounted
deployment rail" on Yutu. Both contradict this section. If Yutu keeps a drill at all, make it a short hand-drill-size
sampling auger (10 to 20 cm), not the 1 m ice drill.

### 14d. Two mountings that make physical sense

**A. Free-standing drill frame, placed by the crew (recommended).**
- A TRIDENT-class drill on its own **low triangular base** with **three wide dish footpads** about 1.2 m apart and
  **two diagonal stays** from the base to the top of the 1.8 m mast.
- **Ballast:** two bags or baskets on the base, filled on site with local regolith. The drill, frame and avionics are
  about 50 kg; with roughly 120 kg of regolith the whole thing is about 170 kg, or about 275 N on the Moon. That is
  comfortably more than the 100 N on the bit.
- **How it gets there:** folded flat on Yutu's sledge (a pose that already exists on the Yutu sheet). A 70 kg Yutu has
  only about 60 N of grip, so it tows the frame empty and the ballast is shovelled in at the site. (Rough numbers; the
  friction is assumed.)
- **Yutu's job:** it unhitches and stands 3 to 4 m off. One cable runs from the drill's avionics box to Yutu for power
  and data (TRIDENT needs about as much power as a few light bulbs; Yutu has a 2 kWh battery). Yutu's mast carries the
  work light, its rack carries the sample canisters, and its ears relay to the rim.
- **Apollo touch (optional):** a treadle plate on the base that Arjun can put a knee or a boot on. A suited astronaut
  is roughly 200 kg, another 300 N or so when needed.
- **Why it is the better picture:** the drill becomes a clean vertical line standing alone, and the rabbit becomes a
  second character watching, instead of one tangled machine.

**B. Drill on the crew's wheeled rover.**
- The base has an LTV in the rover garage (layout bible). Mount the mast at the **rear of the LTV chassis** with the
  foot coming down between or just behind the rear wheels, as on VIPER and Artemis Jr. The LTV is parked, wheels locked.
- The LTV supplies power, so no long cable. Yutu stands off with the sample rack and a light.
- Fully credible, but the LTV is large and would dominate a frame that is meant to be about ice glittering in a lamp.

Either way: **nothing joins the drill to Yutu except, in A, one slack cable on the ground.**

### 14e. Getting a permanently shadowed crater right

**Light**
- **There is no sunlight and no sky light.** The only light is what the crew bring: helmet lamps and a work light.
- Lamp light falls in **hard-edged pools**. There is no air, so **no beam is visible** between the lamp and the ground,
  and nothing glows around a lamp. Shadows are pure black with no fill. Objects are lit only on the side facing a lamp.
- The **sky is black**. In a frame exposed for lamp-lit ground, do not draw stars. Earth is on the horizon at the pole
  and is normally hidden by the crater wall.
- The Sun never reaches the floor, but the **upper rim can be in sunlight**, kilometres away and high up: a thin,
  very bright line at the top of the frame. A little of that light bounces down (it is how the ShadowCam orbiter
  photographs these floors), but it is far too faint to work by.
- It is a crater, open above. It should not read as a cave: no walls arching overhead.

**Ground and cuttings**
- Undisturbed floor: fine pale grey regolith with small rocks and bootprints. No frost sheet, no ice rink, no icicles.
- Cuttings: **dry, pale ash-grey powder as fine as flour or cement**, matte, piled in a neat cone about 8 to 10 cm
  wide at the foot of the drill. The Honeybee test photo shows this exactly.
- The ice is **in** the powder as frost-like grains. A few percent by weight means **sparse pin-point glints** under
  the lamp, not blue chunks, not a white crust.
- **Nothing steams.** At 40 to 100 K ice is as stable as rock and as hard as rock; it does not melt, drip, mist or
  plume. Drilling in bites lets the bit cool between cuts, which the builders say helps the ice arrive intact.
- **Nothing floats.** Grains leave the chute in a thin stream and any that are flicked aside fly in short clean arcs
  and stop. No dust cloud, no sparkles hanging in space.
- **The hole** is 25 mm wide with a clean edge. No pit, no collar of rubble.

**The astronaut**
- In a PSR the gold sun visor can be **raised**; the clear bubble remains. Helmet lamps sit beside the top of the
  bubble (see the 2026 NASA pool-test photos). The face is small and broken up by reflections of the lit ground. Read
  him by his **ink-black helmet stripe and arm band**, and keep the comms cap on.
- Kneeling on one knee is realistic for the new suit; the same NASA photos show it.
- Pressurised gloves cannot work a phone. Put any readout on a cuff display or on the drill's avionics box. The HUD
  caption carries the number.

**The rover**
- No Sun, so the ears are not tracking anything. Turn them edge-on or fold them; they are only antennas here.
- Wire-mesh wheels, not rubber tyres (already noted in `K_7.B1.txt`).

### 14f. What the geologist is actually doing

Depth is the whole point: each 10 cm bite is a separate sample, and ice content by depth is the result.
1. A bite comes up and the brush drops it on the ground as a small cone.
2. He photographs the cone beside a **gnomon** (the tripod scale-and-colour reference from §9).
3. He scoops the cone into **its own metal canister**, seals it cold, and stands it in a rack in depth order. The
   sample has to stay cold and sealed or the ice is gone before any lab sees it.
4. He clears the spot. The drill goes back down for the next bite.

The frame to draw is step 3: a small scoop of glittering grey powder tipped into an open canister, with three sealed
canisters already in the rack.

### 14g. What an expert would call wrong in the current keyframe (K_7.B1)

1. **The drill is bolted to the rabbit rover's chest.** See 14c.
2. **The auger is far too fat**, about as thick as the astronaut's thigh. The real one is thumb-thick.
3. **The hole is a ragged pit** the width of a dinner plate with clods around it. The real hole is coin-sized.
4. **A hose sprays glittering cuttings onto the pile like water.** There is no hose. Cuttings fall from a brush and
   chute at the foot. The gas analyser looks at the pile from a distance.
5. **The cuttings are dark, coarse rubble** in a pile the size of a football. They should be pale fine powder in a
   fist-sized cone.
6. **No footpad, no brush, no flex cables**, and the mast runs out of the top of the frame as if it were 3 m tall.
7. **Sparkles hang in space** around the hole. Nothing hangs in a vacuum.
8. **The light has no source.** A bright disc of ground is lit from above as if by a theatre spot, the helmet has no
   lamps, and the rover has no work light.
9. **The setting reads as a cave**, with dark walls closing overhead.
10. **The astronaut holds a phone-like slate** in a pressurised glove, has no comms cap, and his face is drawn large
    and in detail. (The moustache itself is correct for Arjun.)
11. **The rover's solar ears stand up** as if tracking a Sun that is not there, and the **tyres are knobby rubber**.
12. **No power cable and no sample containers** anywhere in the picture.
13. A note on the HUD, not the picture: "5.6 ± 2.9 wt%" is exactly the LCROSS figure for the Cabeus impact plume.
    Reviewers will recognise it. That is fine as a nod; it would be odd as a fresh reading from this hole.

### 14h. The shot as it should be (7.B1, configuration A)

1. **Setting:** the floor of a permanently shadowed crater. The sky is pure black with no stars, no Earth and no Sun.
   The ground exists only inside two overlapping hard-edged pools of lamp light; everything outside them is black.
   High at the top of the frame, far away, one thin bright thread of sunlit crater rim.
2. **The drill stands alone, centre frame:** a slender vertical mast about 1.8 m tall (the height of a standing
   suited astronaut), made of two thin parallel rails, on a low triangular base with three wide dish footpads about
   1.2 m apart and two diagonal stays up to the top of the mast. Two regolith-filled ballast bags sit on the base.
   Nothing touches the rover.
3. **Drill details (TRIDENT):** at the top, a shoebox-sized drill head on a sliding carriage. From it a silver auger
   only 25 mm thick, with fine spiral flights, runs straight down. A flat amber ribbon cable hangs from the head in a
   loose loop. At the bottom, a small curved footpad is pressed on the ground, and just above it sit a fist-sized
   black bristle brush wheel and a short metal chute.
4. **Hole and cone:** the hole is no wider than the auger, with no pit around it. From the chute a thin stream of
   powder falls onto one neat cone about 8 to 10 cm wide and 4 to 5 cm high beside the footpad.
5. **Cuttings:** pale ash-grey powder as fine as flour, matte, with sparse pin-point glints of ice in the lamp light.
   No blue ice, no gravel, no steam, no mist, no hanging sparkles. A few grains in mid-fall on short clean arcs.
6. **Arjun:** on one knee on the far side of the cone, in three-quarter view. Ink-black helmet stripe and arm band.
   Helmet lamps lit as small bright points beside the bubble. Gold visor raised; the face is small and mostly lost in
   the reflection of the lit ground. He is identified by the stripe, not the face.
7. **His action:** the left hand holds an open metal sample canister, the size of a small thermos, low beside the
   cone. The right hand tips a small flat scoop of glittering grey powder into it. By his knee, a carrier rack with
   three sealed canisters in a row, and a gnomon standing next to the cone. No phone or tablet.
8. **Yutu:** 3 to 4 m behind and to one side, smaller in frame, standing low on its four wire-mesh wheels and facing
   the drill. A floodlight on its camera mast is the second light, aimed at the foot of the drill. Ears edge-on. The
   sample box on its back rack is open. Behind it lies the empty sledge that carried the drill.
9. **Cable:** one cable runs in loose curves along the ground from a small avionics box on the drill base to Yutu's
   flank. It is the only connection between them.
10. **Light:** helmet lamps and Yutu's flood, nothing else. Hard shadows, pure black inside them, no visible beams, no
    haze. The white suit and the white shell are lit only on their lamp-facing sides. The shadows of the mast and the
    frame legs fan out away from the lamps.
11. **Scale check:** mast equals standing suit height; auger equals a gloved thumb; cone equals a fist; the base is
    about as wide as Yutu is long.
12. **Motion for the video pass:** the auger turns about one and a half times a second and sinks almost too slowly to
    see (about 1 mm a second). It stops, lifts clear, the brush spins, and powder falls for a few seconds. Arjun
    scoops. Yutu's lamp head tilts a little to follow his hands.

For configuration B, replace line 2's base with the rear of the parked LTV, drop the ballast bags and the cable, and
keep everything else.

### 14i. Reference images (`media/refs/experiments/drill/`)

Hand these three to the image model first:
1. `zacny2025_fig06_stowed_deployed_maxdepth.png`: the drill's true structure and proportions, labelled.
2. `trident_brush_assembly_honeybee.jpg`: the foot of the drill, the brush and chute, and a real cuttings cone.
3. `artemis_suit_nbl_lighting_jsc2026e391022.jpg`: a kneeling suited geologist lit only by helmet lamps in the dark.
   (Shot under water: tell the model to ignore the haze, bubbles, divers and hoses.)

A fourth, from the existing folder, if the model takes more: `media/style_refs/prime1/small_trident_testing.jpg` (the
whole drill in a test stand, auger, ribbon cable and brush all visible).

Also in the new folder: `zacny2025_fig01_prime1_and_viper_mounting.png` (lander mount and belly mount),
`zacny2025_fig07_bite_sampling_cuttings_cones.png` (bite diagram and growing cone),
`artemis_suit_nbl_lighting_jsc2026e390971.jpg` (the pool of light from above),
`small_apollo15_scott_alsd_training_71pc0468.jpg` (hand-held Apollo drill and treadle),
`apollo15_scott_drill_pan_a15pan11845-7.jpg` (Apollo 15 drilling on the Moon, stem rack, ribbon cables),
`artemis_jr_rover_resolve_drill_2012.jpg` (drill mast on a wheeled rover, for configuration B),
`small_esa_prospect_proseed_drill.jpg` (Europe's drill). Credits and licences are in `SOURCES.md`. The Honeybee and
Leonardo photos are rights-reserved and are for reference only.

**Sources:**
- [Zacny et al. 2025, "TRIDENT Ice Mining Drill for Lunar Volatile Prospecting for PRIME-1 and VIPER Missions", *Planetary Science Journal* 6:297](https://doi.org/10.3847/PSJ/ae0b51)
  ([PDF](https://icedrill.org/sites/default/files/Zacny_2025_TRIDENT%20Ice%20Mining%20Drill%20for%20Lunar%20Volatile%20Prospecting%20for%20PRIME-1%20and%20VIPER%20Missions.pdf)):
  all numbers in 14a, the mounting captions, the floating drill head, the test cones
- [NASA, "Into the Belly of the Rover: VIPER's Final Science Instrument Installed"](https://www.nasa.gov/general/into-the-belly-of-the-rover-vipers-final-science-instrument-installed)
- [NASA, "Apollo to Artemis: Drilling on the Moon"](https://www.nasa.gov/centers-and-facilities/kennedy/apollo-to-artemis-drilling-on-the-moon/)
- [Wikipedia, VIPER (rover)](https://en.wikipedia.org/wiki/VIPER_(rover)) (mass and size)
- [Apollo Lunar Surface Journal, the drill](https://www.nasa.gov/history/alsj/alsj-Drill.html) and
  [NASA drill briefing slides (NTRS 20120016363)](https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20120016363.pdf) (ALSD figures; from a slide, not a formal specification)
- [ESA, "European drill and mini lab secure ride to the Moon"](https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/European_drill_and_mini_lab_secure_ride_to_the_Moon) and
  [PROSPECT overview, *Frontiers in Space Technologies* 2024](https://www.frontiersin.org/journals/space-technologies/articles/10.3389/frspt.2024.1331828/full)
- [Wikipedia, Lunar Polar Exploration Mission (LUPEX)](https://en.wikipedia.org/wiki/Lunar_Polar_Exploration_Mission)
- [Planetary Society, Chang'e-7](https://www.planetary.org/space-missions/change-7) and
  [Universe Today on the hopper](https://www.universetoday.com/articles/chinas-change-7-will-deploy-a-hopper-that-jumps-into-a-crater-in-search-of-water-ice)
- [NASA, ShadowCam and LROC mosaic of Shackleton](https://www.nasa.gov/missions/lro/nasa-moon-camera-mosaic-sheds-light-on-lunar-south-pole/)
- [NASA image record jsc2026e391022](https://images.nasa.gov/details/jsc2026e391022) (2026 pool test of lunar geology tools in south-pole lighting)

*Not sourced, and marked as such:* the masses of the Nova-C lander and of a suited astronaut are approximate. The
free-standing frame, its ballast and the canister routine in 14d and 14f are our own design, reasoned from the
numbers above; no agency has published a crew-placed ice drill.
