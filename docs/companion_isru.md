# Why Guanghan smelts rock: the ISRU companion

*Companion notes for 望明月 *Moongazing*, shot 7.B2 (HUD: `JADE WANG · ISRU · MOLTEN REGOLITH ELECTROLYSIS · O2 1.0 kg/hr`).
Research current as of 7 October 2026. Builds on [Moon experiments §1–2](companion_moon_experiments.md),
[moonbase designs](companion_moonbase_designs.md) and the [Guanghan layout](guanghan_layout.md); it does not repeat them.
Figures marked "my calculation" are worked out here from the cited inputs and are not from a source.*

---

## Summary: the base's resource economy

Guanghan makes its oxygen from rock and saves its ice. Highland regolith is about 45% oxygen by mass and lies all
around the base. Ice is the Moon's only local source of hydrogen, carbon and nitrogen, and nobody has yet measured how
much of it there is. So the molten regolith electrolysis (MRE) cell turns roughly 35–90 tonnes of dirt a year into
about 8 tonnes of oxygen and about 8 tonnes of iron-silicon-aluminium alloy. About a fifth of the oxygen covers
breathing and spacewalk losses. The rest fills the oxidizer tank for the crew's ride back to orbit, and oxidizer is
about 80% of a rocket's propellant mass. The ice crater supplies science and a few tonnes of make-up water. The
smelter draws about 50 kW, a third of the base's power. On the Moon, energy is cheap and landed mass is not.

---

## 1. The director's question, answered directly

**"Why are we expending a lot of energy on regolith smelting?"** Because the product is mostly rocket oxidizer, and
the alternative is landing it from Earth.

- NASA's own May 2026 framing: a crewed lunar ascent burns about **10 tonnes of oxygen**. At a current commercial
  delivery price of about $1.2M per kg that oxygen costs about $12 billion per launch, and still about $1 billion at a
  tenth of that price ([Paz et al., NASA JSC, ASCEND 2026](https://ntrs.nasa.gov/citations/20260004073)).
- One kilogram of oxygen from MRE costs roughly 50 kWh at this plant's scale (§3, §6). A 100 kWe reactor makes that in half
  an hour.
- An MRE plant sized for 10 t of oxygen a year is modelled at about 1.6 t including its share of the power system
  ([Schreiner, MIT 2015](https://dspace.mit.edu/handle/1721.1/98589)). It repays its landed mass in oxygen in about two
  months (my calculation).

**"Is it for the biosphere?"** Only a little. Eight people breathe about 2.4 t of oxygen a year, and life support
recycles half to nine-tenths of that (§2). The greenhouse and crew need hydrogen, carbon and nitrogen far more than
they need new oxygen, and regolith has almost none of those three. They come from Earth or from the ice.

**"Is it for building materials?"** Partly, and this is why the process is MRE and not a cheaper oxygen process. MRE is
the one route that gives metal as well as oxygen in a single step, from any soil. The honest caveat is that bulk
construction at Guanghan needs no smelting at all: the shielding mounds are loose and sintered regolith. The metal
stream is for the things you cannot make from dirt: cable, busbar, brackets, pipe, mirror and solar-cell silicon.

**"Would other forms of extraction make more sense?"** That instinct is reasonable, and §3–4 take it seriously.
Mining ice is cheaper per kilogram in pure chemistry. At the level of a whole system it is not clearly cheaper, and
it depends on a deposit nobody has measured.

---

## 2. What a base of eight needs each year

| Need | Amount per year | Basis |
|---|---|---|
| Oxygen breathed | **2.4 t** (0.816 kg per person per day) | [NASA life-support baseline (BVAD), Table 3-22](https://simoc.space/wp-content/uploads/2018/09/BVAD-20180501.pdf) |
| Oxygen make-up after recycling | **0.25–1.2 t** | The ISS recovers about 50% of oxygen from exhaled CO₂, and NASA requires at least 75% for long missions ([Dominguez et al., ICES 2024](https://ntrs.nasa.gov/api/citations/20240002161/downloads/ICES24%20Paper%20168.pdf)). A 90% goal is often quoted; I use it as the best case. |
| Water make-up, in the habitat | **0.5–1 t** | The ISS reached 98% water recovery in 2023 ([Space.com](https://space.com/astronaut-pee-iss-water-recycling-98-percent-milestone)). I assume about 15 kg of water used per person per day and 2% lost. |
| Spacewalk losses: suit cooling water | **1.4–2.8 t** | 0.34 kg per crew-hour at the poles (range 0.25–0.5) and 80 crew-hours of EVA a week (BVAD Table 4-75). The upper figure doubles the EVA hours for a crew of eight. |
| Spacewalk losses: oxygen | **0.4–0.8 t** | 0.092 kg per crew-hour (BVAD Table 4-75) |
| Airlock gas | about 0.05 t | 10% of 2.9 m³ lost per cycle (BVAD). Suitports cut this further. |
| **Life-support total** | **about 1–2 t of oxygen and 2–4 t of water** | Sum of the rows above. For scale, NASA's earlier lunar outpost studies set the oxygen plant requirement at 1 t a year ([Linne et al. 2012](https://ntrs.nasa.gov/citations/20120012846)). |
| Oxidizer for one crewed ascent | **5–10 t of oxygen** | NASA's reference figure is 10 t ([Kleinhenz & Paz 2021](https://ntrs.nasa.gov/citations/20210016820)). My rocket-equation check for a 10 t ascent vehicle gives 4.6–5.6 t to low lunar orbit and 7.4–9.2 t to a high halo orbit, for hydrogen or methane fuel. |
| Nitrogen (cabin leak make-up) | about 0.1 t (my assumption) | Not available from regolith. Imported, or made from the ammonia in polar ice. |
| Metal, wire, silicon | No firm number exists | Blue Origin's stated targets are solar cells and transmission wire ([Blue Origin](https://www.blueorigin.com/news/blue-alchemist-hits-major-milestone-toward-permanent-sustainable-lunar-infrastructure)). |
| Radiation shielding | about **12,000 t**, already in place | My estimate from the layout: six mounds of roughly 1,400 m³ each at 1.5 t/m³. Needs digging and sintering, not chemistry. |

Two things stand out.

1. **Breathing is the small item.** Propellant oxidizer is several times larger than everything the crew consumes.
   Oxygen is 86% of a hydrogen-oxygen propellant load and about 78% of a methane-oxygen load.
2. **Smelting is a side stream next to the earthmoving.** The MRE cell eats 35–90 t of regolith a year (§6). The
   printer moved more than a hundred times that to build the mounds.

---

## 3. The candidate processes, compared

The south-polar soil is highland anorthosite. Apollo 16 highland soil, the usual stand-in, is roughly 45% SiO₂,
27% Al₂O₃, 16% CaO, 5–6% each of FeO and MgO, and well under 1% TiO₂. NASA states that polar regolith "is
chemically closer to highlands than mare"
([Paz et al. 2026](https://ntrs.nasa.gov/citations/20260004073)). That matters because the oldest oxygen process
needs iron-titanium ore, which the pole lacks.

| Process | Feedstock at the pole | Temperature | Products | Energy per kg of O₂ | Consumables | Maturity and who has shown it | Fit for Guanghan |
|---|---|---|---|---|---|---|---|
| **Ice mining: dig, heat, electrolyse** | Icy regolith in a permanently shadowed region (PSR). Grade unknown. | Dirt warmed from about 40–100 K to about 300 K. Electrolysis near room temperature. | Water, hence O₂ **and H₂**. Also NH₃, CO₂, H₂S and others. | About **28 kWh** for a whole system, including liquefying the hydrogen (my calculation from NASA's 68 kW for 225 days). The chemistry alone is 6–7 kWh. | None | Electrolysis is flight-proven. Mining ice at 40 K is not. No lander has yet touched polar ice. [NASA's study](https://ntrs.nasa.gov/citations/20210016820) assumes 5 wt% ice and finds 1 wt% not viable. | The only local hydrogen. Right for make-up water. Too unproven to bet the oxidizer on. |
| **Ice: thermal mining** | The same, heated in place by mirrors or heaters under a capture tent | Surface warmed to about 220 K and above | Water | No verified figure. Its authors claim 60% less mass and energy than digging ([NIAC](https://www.nasa.gov/directorates/spacetech/niac/2019_Phase_I_Phase_II/Thermal_Mining_of_Ices_on_Cold_Solar_System_Bodies)). | None | Concept and lab tests ([Sowers & Dreyer 2019](https://doi.org/10.1089/space.2019.0002); [Kornuta et al. 2019](https://doi.org/10.1016/j.reach.2019.100026), sized for hundreds to thousands of tonnes a year). | Built for a propellant industry. Oversized for a base of eight. |
| **Hydrogen reduction** | Wants ilmenite (FeTiO₃). Highland soil can yield only about 1% of its mass as oxygen. | 900–1,050 °C, soil stays solid | O₂ (via water), iron-rich residue | **24 ± 6 kWh** with 10 wt% ilmenite, as in mare soil ([Léger et al. 2025](https://doi.org/10.1073/pnas.2306146122)). Several times worse on highland soil. | Hydrogen, recycled | Highest field maturity: ROxygen and PILOT ran on Mauna Kea in 2008 ([Mueller & Townsend, NASA KSC](https://ntrs.nasa.gov/api/citations/20110011479/downloads/20110011479.pdf)). | Wrong soil. NASA: it "only works well in areas that have a high iron oxide content". |
| **Carbothermal reduction** | Any silicate soil, including highland | 1,650–1,800 °C in small melt pools, under methane | O₂ (via CO and water), a slag bead with some iron and silicon | About **24 kWh** modelled at 10 t per year, mostly as heat (my calculation from 45 kW for 225 days; [Linne et al. 2021](https://doi.org/10.1061/(ASCE)AS.1943-5525.0001269), via Kleinhenz & Paz). Measured on the small test reactor: 63–93 kWh of heat. | Carbon, 99.7% recovered in testing | **The most mature option for highland soil.** Sierra Space reactor at TRL 6 in vacuum (2024). Solar-heated prototype ran in Houston in August 2025 ([NASA/Sierra Space 2026](https://ntrs.nasa.gov/citations/20260004723)). Not yet assigned a flight. | The cautious engineer's choice for oxygen alone. No separated metal. |
| **Molten regolith electrolysis (MRE)** | **Any soil.** No sorting needed. | About 1,600 °C, fully molten | **O₂ directly**, plus molten metal: iron and silicon first, then titanium, aluminium, magnesium, calcium. Slag glass. | About **50 kWh** modelled at 10 t per year, 120 kWh at 1 t per year ([Schreiner 2015](https://dspace.mit.edu/handle/1721.1/98589); my division). Measured in 2024: roughly 100–135 kWh. The thermodynamic floor is about 10–14 kWh (my calculation). | None in principle. In practice the anode wears. | TRL 3 to 4. MIT and NASA Kennedy lab cells at 10 A with iridium anodes ([Sibille, Sadoway et al.](https://ntrs.nasa.gov/citations/20110008524)). Lunar Resources LR-1 at Kennedy, Dec 2024: 25 kg of simulant, 9 hours, 0.07 kg of O₂ per hour ([NASA](https://ntrs.nasa.gov/citations/20260006167)). Blue Origin's Blue Alchemist passed design review in Sept 2025. | **The choice here**, for the metal and for needing nothing from Earth. |
| **Molten salt electrolysis (FFC Cambridge)** | Any soil, as solid powder in a salt bath | 900–950 °C in molten CaCl₂ | Metal alloy powder. O₂ only with an inert anode. | No system figure published that I could find | Salt losses and anode | Lab scale. Metalysis, Glasgow and ESA removed 96% of the oxygen in 50 hours, but only a third was caught as gas ([Lomax et al. 2020](https://doi.org/10.1016/j.pss.2019.104748)). | Best for metal powder. The salt must come from Earth. |
| **Vapour-phase pyrolysis** | Any soil | Above 2,000 °C in vacuum | O₂, condensed suboxides | No credible system figure | None | Lab only ([Schlüter & Cowley 2020](https://doi.org/10.1016/j.pss.2019.104753)) | Not ready. |

**How to read the energy column.** The figures come from different studies with different boundaries, so treat them
as "tens of kilowatt-hours per kilogram" for every route. No process is ten times better than another once the whole
system is counted. The one published plant-level comparison at the south pole ranks MRE on highland soil first:
6.8 t of hardware for 25 t of ferrosilicon and 23.9 t of oxygen a year
([Guerrero-Gonzalez & Zabel 2023](https://doi.org/10.1016/j.actaastro.2022.11.050)). That is a model, and the same
paper names reactor wear as the thing that could break it.

**What NASA itself does.** In 2021 NASA described a "lead-follower" plan with water ice leading and regolith oxygen
following. Its own case study then found the regolith route lighter and lower in power for the same 10 t of oxygen:
2.7 t and 45 kW against 4.9 t and 68 kW ([Kleinhenz & Paz 2021](https://ntrs.nasa.gov/citations/20210016820)). The
catch is that the regolith route makes no hydrogen. Of that 2.7 t, 2.3 t is hydrogen and its tank brought from
Earth, and each later flight needs about 2 t more. By 2026 NASA's ISRU team was writing: "If the goal is to produce
oxygen, it may be easier to extract oxygen from regolith than from lunar water because regolith is more accessible."

**China and the ILRS.** Chang'e-8 (2028–29) will melt regolith with sunlight to make bricks and parts
([Space.com](https://space.com/china-microbes-plants-lunar-resource-experiments-moon-2028)). A Chinese
Academy of Sciences team showed that heating Chang'e-5 soil above 1,200 K yields 51–76 kg of water per tonne, using
solar-wind hydrogen stored in ilmenite ([Chen et al. 2024](https://doi.org/10.1016/j.xinn.2024.100690)). That was
mare soil. Chang'e-7, the ice-prospecting mission, slipped from August 2026 to 2027. I found no public CNSA plan
that names MRE.

---

## 4. Testing the story: "there is ice in the crater next door"

The tempting story is that ice is scarce. The numbers do not support that for this base, so the film should not say it.

**If the crater is as rich as LCROSS, it is not scarce.** The layout puts a 300 m shadowed crater 700 m from the hub.

- Its floor is about 70,000 m². The top metre is about 100,000 t of soil (my calculation).
- At the one grade ever measured, 5.6 ± 2.9 wt% in Cabeus ([Colaprete et al. 2010](https://doi.org/10.1126/science.1186986)),
  that is about 6,000 t of water.
- NASA's ice-mining case needs 15 t of water and 400 t of dug soil to make 10 t of oxygen plus its hydrogen: a pit
  32 m square and 30 cm deep.
- So one small crater at LCROSS grade would supply this base for centuries.

**What does hold up.**

1. **Nobody knows the grade, and grade decides everything.** LCROSS is a single data point from a large, old, 40 K
   cold trap. Orbital data show ice exposed at the surface in only about 3.5% of cold traps
   ([Li et al. 2018](https://doi.org/10.1073/pnas.1802345115)). A preliminary ShadowCam study saw no obvious surface ice
   inside Shackleton ([Mahanti et al. 2023](https://asu.elsevierpure.com/en/publications/preliminary-characterization-of-secondary-illumination-at-shackle)).
   Small cold traps like the film's crater are common ([Hayne et al. 2021](https://doi.org/10.1038/s41550-020-1198-9)),
   but what they hold is unknown. NASA's study finds 1 wt% "unlikely to be a viable" deposit, and a dry cover
   thicker than a metre makes the mine untenable. A base designed in the early 2030s could not have counted on its ice.
2. **Regolith is a known ore at the front door.** It was sampled by Apollo, it sits in sunlight and it needs no
   prospecting. Every working hour in a PSR is at 40–100 K, in the dark, on cabled or beamed power.
3. **Ice is worth more as hydrogen, carbon and nitrogen than as oxygen.** The LCROSS plume also carried ammonia,
   carbon dioxide, methane and hydrogen sulphide, each at between a fraction of a percent and about 17% of the water. Those are the greenhouse's missing
   elements. Rock supplies oxygen without limit, so burning ice for its oxygen wastes the rare part.
4. **Hydrogen is hard to keep.** NASA notes that liquefying hydrogen on the Moon "is difficult using existing
   technology". An ascent vehicle can bring methane from Earth and take on only lunar oxygen, which is most of the mass.
5. **The ice is a scientific record.** COSPAR's 2021 policy puts PSR missions in a stricter category (IIb) with a
   full inventory of organics ([NASA summary](https://sma.nasa.gov/news/articles/newsitem/2021/08/31/cospar-updates-planetary-protection-policy-for-lunar-missions)).
   A rule that Guanghan samples its crater but does not strip-mine it is fiction, but it is plausible fiction.
6. **MRE also yields metal.** Ice never will.

**A story choice that keeps everything consistent.** Let the crater next door be modest: about 1–2 wt% ice, patchy,
under 20–40 cm of dry soil. That is below NASA's threshold for bulk mining and consistent with every measurement so
far. It is still enough for science and for the base's 2–4 t of make-up water a year, which means warming a few
hundred tonnes of soil. Shot 7.B1 already shows this honestly: TRIDENT is a prospecting drill, not a mine.

**The remaining weakness.** If VIPER or Chang'e-7 find rich, shallow, widespread ice in 2027–28, a real base would
mine ice for hydrogen and probably for some oxygen too. It would still want regolith oxygen as the supply that cannot
fail, and it would still have no other source of metal.

---

## 5. Recommendation

**Keep molten regolith electrolysis in shot 7.B2.** It is defensible for a base in 2035–2040, and it tells the right
story, with three conditions.

1. **Say what the oxygen is for.** The plant exists for ascent oxidizer first, breathing second. A HUD or tank label
   that mentions the depot does this in two words.
2. **Show the metal.** The reason to pick MRE over carbothermal reduction is the second product. One glowing ingot in
   the frame carries that argument.
3. **Fix the hardware** (§7–8). The current frame reads as a furnace with a tap, and an engineer will see that at once.

**Be honest about maturity.** MRE is the least mature of the three serious regolith routes. The best public result is
0.07 kg of oxygen an hour for nine hours. The film's plant runs about fourteen times faster, all year. Ten to fifteen
years of development makes that reasonable, not certain.

**If the director wants the most conservative choice instead,** it is carbothermal reduction. What would change:

- HUD: `CARBOTHERMAL REDUCTION` in place of `MOLTEN REGOLITH ELECTROLYSIS`.
- Look: a smaller reactor with fist-sized melt pools under a methane atmosphere, and ideally a mirror dish outside
  tracking the horizon Sun and piping light in. A water electrolyser and a methane recycling loop stand beside it.
- Cost to the story: no metal ingots, and a carbon loop that must be topped up.

I would not switch. The mirror is a lovely image, but MRE fits the fission reactor, the 13-month stay and the
"build with what is here" theme of the film's section 7.

---

## 6. The HUD: is "O2 1.0 kg/hr" right?

**The rate is credible. It needs its current and power beside it.**

- **Current.** Each O₂ molecule takes four electrons. By Faraday's law, 1.0 kg of oxygen an hour needs **3,350 A**
  at perfect efficiency (my calculation). A real cell loses some current to iron ions shuttling between electrodes,
  so about 3.6 kA is a fair display value.
- **Power.** Scaling Schreiner's 56.5 kW for 1.14 kg/h gives **about 50 kW** for the whole plant: cell, feed, gas
  clean-up and storage. That implies roughly 12–15 V across the cell (my inference, not a published figure).
- **Share of the base.** 50 kW is half of the 100 kWe reactor, or a third of reactor plus masts (160 kW). It is the
  largest single load at Guanghan. That is plausible, and it is the honest answer to "a lot of energy": yes, by design.
- **Per year.** 1.0 kg/h is 8.8 t a year running flat out, and about 7.5 t at 85% uptime. NASA's 10 t per year
  reference plant is 1.14 kg/h, so the film's number sits at exactly the scale NASA studies.
- **Against the needs in §2.** About 1–2 t goes to breathing and EVA. The remaining 6 t or so is most of one ascent's
  oxidizer per 13-month expedition. It covers a smaller ascent vehicle fully and NASA's 10 t reference about two-thirds.
- **Soil in, metal out.** At 10–25% oxygen yield by mass the cell takes 4–10 kg of regolith an hour, or 35–90 t a
  year. NASA's IPEx excavator is designed to dig 10 t in an 11-day mission
  ([NASA](https://ntrs.nasa.gov/citations/20240008162)), so one small robot working a few weeks a year feeds it.
  Metal comes out at about 1 kg per kg of oxygen.

**Proposed HUD line** (same length as now, real units, "kg/h" not "kg/hr"):

> `JADE WANG · ISRU · MOLTEN REGOLITH ELECTROLYSIS · 1,600 °C · 3.6 kA · O₂ 1.0 kg/h`

**Optional second line**, if the design allows one:

> `LOX DEPOT 6.2 / 10 t · FeSi TAP 02`

If only one number can change, add `3.6 kA`. It is the figure an electrochemist will check, and it is right.

---

## 7. What the plant really looks like

**The cell.** A real MRE reactor is a squat drum, wider than it is tall. NASA's 2024 system model puts the inner
diameter at 0.5–2 m for currents up to about 8,000 A, and uses two to four cells for 10 t a year
([Carlson et al., NASA JSC](https://ntrs.nasa.gov/citations/20240013999)). For the film, draw **one drum about 2 m
across and 1.2–1.5 m tall**, lower than Jade's shoulder.

**The cold wall, or "frozen skull".** Nothing solid survives molten regolith for long. So the cell heats only its
core, by passing the electrolysis current through it (Joule heating), and leaves a shell of unmelted regolith
between the melt and the vessel. The dirt is its own crucible. NASA Kennedy's GaLORE project (2019–23) and the LR-1
reactor both work this way ([Grossman et al. 2020](https://ntrs.nasa.gov/citations/20205007780)). Two visual
consequences follow.

- **The melt is not visible from the side.** There is a hand's width or more of grey frozen soil in the way.
- **The outside is cool.** In the Kennedy test the core passed 1,700 °C while a deflector shield and fans kept the
  chamber exterior "safe touch".

**Electrodes and power.** An anode plate hangs from above on a vertical rod with a lift actuator, because the gap to
the metal pool must be adjusted as the cell fills. The lab anodes were iridium. The cathode is the pool of molten
metal on the floor of the cell, with a current collector through the base. **Two thick flat busbars** carry 3.6 kA
in and out. They are the fattest things attached to the vessel.

**Feed.** Hopper, then an enclosed screw conveyor (auger) that also preheats the soil, then a gate valve on the lid.
Never an open belt: in vacuum and one-sixth gravity loose dust travels far and coats everything.

**Oxygen line.** 1.0 kg/h is 0.28 g per second. The off-gas line is a **finger-thick tube**, not a pipe. It runs to
a small clean-up skid (a filter and a solid-oxide purifier), then a compressor, buffer bottles and a liquefier.

**Metal and slag.** Molten metal is drawn up a ceramic tube into a mould by pressure difference. This is
countergravity casting, borrowed from foundries, and the tube is lowered only for the draw because the melt eats it
([Sibille et al. 2010](https://ntrs.nasa.gov/citations/20110008524)). The products are palm-to-brick-sized ingots
and pucks of black slag glass.

**Heat rejection.** About 40 kW of waste heat cannot radiate away inside a closed vault. Coolant lines run through
the wall to **10–20 m² of radiator panel** outside the mound (my calculation).

**Storage.** Ten tonnes of liquid oxygen fills a single insulated sphere 2.6 m across. It belongs in shade near the
pad, not in the hall. The four bottles in the hall are gas buffers.

**Start-up.** Kennedy's thermal model of the LR-1 test has about 17 hours of heating before electrolysis begins
([NASA TFAWS 2024](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-ID-04_Paper.pdf)). A cell like this runs for
months and is never switched off casually.

**People.** The plant is run from the ISRU desk in the science module, which the layout already provides. A suited
visit is for maintenance: swapping an anode, collecting ingots, clearing a feed jam, locking out a line by hand.
During a visit the cell sits at hot hold with the tap closed. An unpressurised vault is the right place for it:
there is no air to carry heat or feed a fire, and a leak vents harmlessly.

---

## 8. Shot 7.B2: what to draw

**The frame, in eight lines for the keyframe artist.**

1. **A squat drum, about 2 m wide and chest high**, wrapped in quilted foil blanket, standing on a short insulating
   plinth with a ribbed coolant jacket around its waist. It is closed. No part of its wall glows.
2. **Two thick flat gold busbars** arc in: one to a vertical anode rod and lift actuator on the lid, one to the base.
   Mark them + and −.
3. **On the lid:** an enclosed auger tube sloping down from the hopper, a finger-thick oxygen tube rising to a small
   skid, and **one palm-sized sight glass** with a shutter and a camera, glowing **yellow-white**.
4. **At the foot:** a casting station with a short row of moulds. **One fresh ingot glows ember-orange.** This is
   where the film's orange belongs. A black slag puck sits beside it.
5. **Jade's gloves** are on a hand-sized **brass isolation valve on the oxygen line at the skid**, at least a metre
   from the drum, with a lockout tag hanging from it.
6. **Behind:** thin oxygen lines to the four buffer bottles, coolant lines leaving through the vault wall, the
   hopper and its closed screw feed. No open belt.
7. **Light:** the vault strip light, a small yellow-white point at the sight glass, and orange spill from the ingot.
   No steam, no sparks, no frost, no haze. Boot prints in the dust on the floor.
8. **HUD** as in §6.

**If only three things can change:** shrink the port to a sight glass and move the orange to an ingot; move the
handwheel off the reactor and onto the oxygen line; add the busbars.

**What a real ISRU engineer would wince at in the current keyframe.**

| In the frame now | Why it is wrong | Fix |
|---|---|---|
| An open port about 0.8 m across, glowing into the room | Melt at 1,600 °C radiates about 0.6 MW per m². That port would throw out about 300 kW, six times the plant's whole power (my calculation). The oxygen would also escape to vacuum. In a cold-wall cell there is no sideways view of the melt at all. | A 5 cm shuttered sight glass on the lid. It passes about 1 kW. |
| Ember-orange melt | 1,600 °C is yellow-white. Orange is 900–1,100 °C. | Yellow-white at the sight glass, orange on the cooling ingot. |
| A big handwheel on the reactor body | Nothing on the vessel is hand-operated. Process valves are motor-driven and sit on the gas skid. | Keep the wheel, smaller, as a manual isolation valve on the oxygen line. A brass wheel is correct there: copper alloys resist ignition in pure oxygen, which is standard oxygen-system practice, so the gold palette is accidentally right. |
| No electrical connection anywhere | It is an electrolysis cell carrying 3.6 kA. | Busbars and an anode rod. |
| Fat pipes | The oxygen flow is a third of a gram per second. | Finger-thick tubing. The thick items are busbars and coolant lines. |
| An open conveyor belt of loose regolith | Dust would coat the hall. | Hopper and enclosed auger. |
| Bare vessel wall at glove distance | Suit gloves tolerate only brief contact at roughly a hundred degrees. | Foil blanket, standoff heat shield, and a painted keep-out line on the floor. |
| A crew member working the plant by hand while it runs | It is run from inside. | Read the shot as a maintenance visit: a lockout before she services the gas skid. Her grin still works. |

---

## 9. Reference images

Eight images are in [`media/refs/isru/`](../media/refs/isru/), with full credits and licences in
[`SOURCES.md`](../media/refs/isru/SOURCES.md). They are for internal reference.

| File | Use it for |
|---|---|
| `nasa_ksc_lr1_assist_test_layout_cad.jpg` | The best single reference: a real MRE pot on its brick bed, with heat shield, filter and two chillers labelled |
| `nasa_ksc_mre_lr1_test_2024.jpg` | Texture of real test hardware: dimpled cooled walls, flexible hoses, a small amber window (NASA/Kim Shiflett) |
| `nasa_ksc_lr1_reactor_in_assist_chamber.jpg` | The LR-1 reactor in the chamber with the oxygen-measurement cart |
| `nasa_ksc_mre_cell_diagram.jpg` | Cross-section: anode above, melt, metal pool below |
| `nasa_ksc_mre_history_galore_coldwall.jpg` | The true colour of a regolith melt seen from above, and the squat cold-wall shape |
| `nasa_jsc_mre_plant_system_model_poster.jpg` | The whole chain from excavator to tank, and reactor diameter against current |
| `nasa_jsc_card_carbothermal_laser_2023.jpg` | How small a pilot reactor is, and its copper coolant coils (NASA/Brian Sacco) |
| `nasa_ipex_excavator_concept.jpg` | The bucket-drum robot that feeds the hopper |

**View at source (copyrighted, not downloaded):**

- Blue Origin, Blue Alchemist: [design review announcement](https://www.blueorigin.com/news/blue-alchemist-hits-major-milestone-toward-permanent-sustainable-lunar-infrastructure),
  [first announcement](https://www.blueorigin.com/news/blue-alchemist-powers-our-lunar-future),
  [rendering via IEEE Spectrum](https://spectrum.ieee.org/blue-origin-molten-regolith-electrolysis)
- ESA and Metalysis molten-salt process: [simulant before and after](https://www.esa.int/ESA_Multimedia/Images/2019/10/Oxygen_and_metal_from_lunar_regolith),
  [the ESTEC oxygen plant](https://www.esa.int/ESA_Multimedia/Images/2020/01/Making_oxygen_out_of_moondust)
- NASA and Sierra Space CaRD solar prototype with its mirror: [slides](https://ntrs.nasa.gov/citations/20260004073)
- Iridium anode and countergravity casting device: [Sibille et al. 2010, figures 7–8](https://ntrs.nasa.gov/citations/20110008524)
- [Lunar Resources](https://www.lunarresources.space/), maker of LR-1

---

## 10. Loose ends in other documents (not edited)

- **Layout, W mound.** "Crew work here in suits" is better as "run from the ISRU desk; suited entry for maintenance at
  hot hold". "Conveyor" should be an enclosed auger. Add a radiator panel outside the W mound. Treat the four tanks
  as gas buffers and put the liquid-oxygen sphere by the pad.
- **The lander.** The oxidizer story needs an ascent vehicle that burns liquid oxygen. Lanyue's yellowish exhaust in
  its 2025 test suggests storable propellants, though I found no confirmed specification. "Lanyue-class in size,
  oxygen-burning" is enough.
- **The printed shells.** Fully melting 12,000 t of shielding would take about 6–7 GWh, which is the fission
  reactor's whole output for about seven years (my calculation). The mounds must be thin sintered ribs and crust over
  loose fill, as the ICON/BIG designs in the moonbase guide already show.
- **Earlier audit.** `audit_claude.md` suggested `O₂ 1.1 kg/h (≈10 t/yr)`. That is also correct; 10 t a year is
  1.14 kg/h.

## 11. Where the uncertainty is

- **Ice.** One ground-truth number exists. Everything in §4 could shift when VIPER, Chang'e-7 or LUPEX report.
- **MRE energy.** Published values span 50 kWh (model) to about 135 kWh (first vacuum test) per kg. I use the model
  figure because the film shows a mature plant. Schreiner's abstract does not state its duty cycle.
- **MRE lifetime.** No one has run a cell for weeks. Anode and wall wear are the acknowledged unknowns.
- **Blue Alchemist.** A full autonomous demonstration was planned for 2026. I found no published result, and Blue
  Origin's site refused automated fetches today, so its claims here come from secondary coverage.
- **EVA losses.** The BVAD figures date from 2001–2007 planning. Newer suits may lose less water.
- **The metal market.** No source gives a tonnage of metal that a base of eight needs. The case for metal is
  qualitative.

## Sources

**Molten regolith electrolysis**
- Schreiner 2015, MIT thesis: https://dspace.mit.edu/handle/1721.1/98589 · journal version: https://doi.org/10.1016/j.asr.2016.01.006
- Toro Medina et al. 2026, LR-1 test results (NASA KSC): https://ntrs.nasa.gov/citations/20260006167
- NASA MRE project review 2024 (TRL and performance targets): https://ntrs.nasa.gov/citations/20240011100
- LR-1 thermal analysis (TFAWS 2024): https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-ID-04_Paper.pdf
- Carlson et al. 2024, MRE plant system model (NASA JSC): https://ntrs.nasa.gov/citations/20240013999
- Grossman et al. 2020, cold-walled reactor (GaLORE): https://ntrs.nasa.gov/citations/20205007780
- Sibille, Sadoway et al. 2010, scale-up and metal withdrawal: https://ntrs.nasa.gov/citations/20110008524
- Sirk, Sadoway & Sibille 2010, direct electrolysis: https://ntrs.nasa.gov/citations/20110008535
- NASA Kennedy news, May 2025: https://www.nasa.gov/centers-and-facilities/kennedy/nasa-kennedy-breathes-life-into-moon-soil-testing
- Blue Origin, Sept 2025: https://www.blueorigin.com/news/blue-alchemist-hits-major-milestone-toward-permanent-sustainable-lunar-infrastructure · IEEE Spectrum: https://spectrum.ieee.org/blue-origin-molten-regolith-electrolysis
- Guerrero-Gonzalez & Zabel 2023, plant comparison: https://doi.org/10.1016/j.actaastro.2022.11.050

**Other regolith processes**
- Paz et al. 2026, solar carbothermal prototype (NASA JSC): https://ntrs.nasa.gov/citations/20260004073
- White et al. 2026 (Sierra Space/NASA): https://ntrs.nasa.gov/citations/20260004723
- NASA, CaRD first vacuum test, 2023: https://www.nasa.gov/centers-and-facilities/johnson/nasa-successfully-extracts-oxygen-from-lunar-soil-simulant/
- Linne et al. 2021, 10 t/yr carbothermal plant: https://doi.org/10.1061/(ASCE)AS.1943-5525.0001269
- Léger et al. 2025, energy for hydrogen reduction: https://doi.org/10.1073/pnas.2306146122
- ROxygen and PILOT field tests, 2008: https://ntrs.nasa.gov/api/citations/20110011479/downloads/20110011479.pdf
- Lomax et al. 2020, FFC molten salt: https://doi.org/10.1016/j.pss.2019.104748 · ESA: https://www.esa.int/Enabling_Support/Space_Engineering_Technology/ESA_opens_oxygen_plant_making_air_out_of_moondust
- Schlüter & Cowley 2020, review of all methods: https://doi.org/10.1016/j.pss.2019.104753
- Chen et al. 2024, water from Chang'e-5 ilmenite: https://doi.org/10.1016/j.xinn.2024.100690

**Ice**
- Kleinhenz & Paz 2021, water-ice system study and comparison: https://ntrs.nasa.gov/citations/20210016820 · paper: https://ntrs.nasa.gov/citations/20205008303
- Colaprete et al. 2010, LCROSS: https://doi.org/10.1126/science.1186986
- Li et al. 2018, surface ice: https://doi.org/10.1073/pnas.1802345115
- Hayne et al. 2021, micro cold traps: https://doi.org/10.1038/s41550-020-1198-9
- Mahanti et al. 2023, ShadowCam view of Shackleton's interior (preliminary): https://asu.elsevierpure.com/en/publications/preliminary-characterization-of-secondary-illumination-at-shackle
- Kornuta et al. 2019, Commercial Lunar Propellant Architecture: https://doi.org/10.1016/j.reach.2019.100026
- Sowers & Dreyer 2019, thermal mining: https://doi.org/10.1089/space.2019.0002 · NIAC: https://www.nasa.gov/directorates/spacetech/niac/2019_Phase_I_Phase_II/Thermal_Mining_of_Ices_on_Cold_Solar_System_Bodies
- COSPAR lunar policy update: https://sma.nasa.gov/news/articles/newsitem/2021/08/31/cospar-updates-planetary-protection-policy-for-lunar-missions
- Chang'e-7 delay, Aug 2026: https://scientificamerican.com/article/china-delays-ambitious-change-7-moon-mission-until-2027

**Needs and equipment**
- NASA Life Support Baseline Values and Assumptions Document (2018): https://simoc.space/wp-content/uploads/2018/09/BVAD-20180501.pdf
- ISS 98% water recovery: https://space.com/astronaut-pee-iss-water-recycling-98-percent-milestone
- Oxygen recovery, ISS and requirement (Dominguez et al. 2024): https://ntrs.nasa.gov/api/citations/20240002161/downloads/ICES24%20Paper%20168.pdf
- Outpost oxygen requirement (Linne et al. 2012): https://ntrs.nasa.gov/citations/20120012846
- IPEx excavator: https://ntrs.nasa.gov/citations/20240008162 · https://www.nasa.gov/ipex/
