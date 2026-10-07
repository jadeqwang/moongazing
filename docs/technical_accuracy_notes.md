# Technical accuracy notes: a director's cheat sheet

*For animators, compositors and AI video-model prompt writers on 望明月 *Moongazing*. Research current as of 6 October 2026. Companion docs: [moonbase designs](companion_moonbase_designs.md), [Moon experiments](companion_moon_experiments.md).*

---

## 1. Gravity and movement (1.62 m/s², ≈ 1/6 g)

**Core rule: weight drops to 1/6, mass and inertia do not.** A loaded astronaut is as *hard to start, stop and turn* as on Earth, but presses down on the ground with 1/6 the force. That means **low traction**: stopping takes several steps, and turns are wide and leaning.

| Thing | Earth | Moon | Animation consequence |
|---|---|---|---|
| Fall from 1.5 m | 0.55 s | **1.36 s** | Falls take **√6 ≈ 2.45× longer**, not 6×. Don't play everything at 1/6 speed. |
| Dust kicked at 2 m/s, 45° | ~0.4 m range | **~2.5 m range** | Long, clean **parabolic arcs**. |
| Suited hop, 0.4 m high | n/a | **~1.4 s hang time** | Floaty but not slow-motion. |
| Apollo suit plus backpack | ~80–90 kg on Earth | **feels like ~14 kg** | But the suit's **pressurization stiffness** fights every bend. |

- **Gait (real Apollo behaviour):**
  - Astronauts naturally fell into a **skipping "bunny hop"** (both feet, or one leg leading) and a **loping run**, **leaning forward** with knees slightly bent. Research confirms skipping becomes the gait of choice at lunar gravity ([Pavei, Biancardi & Minetti, *J. Appl. Physiol.* 2015](https://air.unimi.it/handle/2434/286965)).
  - Walking heel-toe like on Earth looks wrong. **Reference footage:** Apollo 16 "Grand Prix" rover run, John Young's jump-salute, Apollo 17 Schmitt's skiing-style hops.
- **Falls:** slow, sprawling, often forward onto hands. Getting up takes a **push-up and knee walk**, or a crewmate's hand. Comic but real.
- **Picking things up:** suits barely bend at the waist. Use **long-handled tongs and scoops**, a dramatic **one-knee kneel**, or a lunge.
- **Hair and fabric inside the hab:** hair **hangs down** (slowly and bouncily). It does **not** float. Floating hair belongs only in **orbit and transit** (Orion or Mengzhou cabin).
- **Tears:** in transit (microgravity) tears **pool as a blob on the eye**. On the Moon they **do run down the cheek, slowly**.
- **Liquids:** pour slowly, with big lazy droplets, inside the hab. A wine cup works but sloshes in slow, high arcs. That's useful for 举杯邀明月.

## 2. Dust and flags (vacuum)

- **No air means no billowing clouds and no lingering haze.** Each grain flies on its own **ballistic parabola** and drops cleanly. Kicked dust looks like a **spray of fine gravel that "rains" back down at once**.
- **Rover "rooster tails":** fan-shaped arcs off the wheels. Apollo 17's broken fender was fixed with **duct tape and four laminated maps** ([Smithsonian](https://airandspace.si.edu/stories/editorial/duct-tape-auto-repair-moon)).
- **Landing plumes:** dust and pebbles **blast out in flat, radial, straight sheets** at high speed, close to the ground. No mushroom cloud, no rolling dust cloud afterward.
- **Footprints:** **crisp, sharp-edged**, with walls that hold, because angular, unweathered grains interlock. They're bright where the surface crust is broken. Classic reference: https://upload.wikimedia.org/wikipedia/commons/4/43/Buzz_Aldrin%27s_bootprint_on_the_Moon%2C_AS11-40-5877.jpg
- **Flags need a horizontal rod** along the top. When planted they **twitch and oscillate** for a while with no air to damp them, then hang **dead still**. They never flutter. Reference: https://commons.wikimedia.org/wiki/File:Apollo_15_flag,_rover,_LM,_Irwin.jpg
- **Dust on suits:** charcoal-gray, clinging, worst from boots to knees and on gloves. Visors get **scratched and smudged**, not "dusty-fogged".

## 3. Light, sky, stars and shadows

- **The sky is black even at noon.** The Sun is a **small, brilliant white disk** (0.5°), not yellow and with no corona glow. There is **no sunset color**: dawn and dusk are instant, with no twilight gradient.
- **Stars are generally NOT visible** in any exposure that shows a sunlit surface or suits. Apollo shots at about 1/250 s would need 10–30 s to record stars ([Planetary Society](https://www.planetary.org/articles/why-are-there-no-stars)). Astronauts *did* see stars when **standing in a shadow, dark-adapted and shielded from glare**. **Allowed exceptions:**
  - an in-shadow POV shot after a beat of eye adaptation;
  - lunar night, or the far side at night;
  - the inside of a permanently shadowed crater;
  - a stylized "long-exposure" photograph look.
- **Shadows:**
  - **Hard-edged** (only a slight penumbra from the 0.5° Sun) and **very dark, but not pure black**. Shadowed areas get **fill light bounced off sunlit regolith and Earthshine**.
  - The ground has a **retro-reflective "opposition surge"**: looking straight down-sun, the ground brightens and flattens, with a **bright halo around the shadow of your own head**. Looking toward the sun, terrain looks dark and craggy.
  - Shadows **don't all look parallel** on uneven ground. That's perspective, not a second light source.
- **No atmospheric perspective.** Distant mountains are **as sharp and dark as nearby rocks**, so scale is confusing. Use known objects (rovers, landers, astronauts) for scale.
- **The horizon is close:** about **2.4 km** for a standing person, versus about 4.7 km on Earth. The curvature feels tighter.
- **Regolith color:** neutral **gray**, slightly warm. Highlands (including the south pole) are a **lighter gray** than dark maria. Avoid tan, desert or Mars orange.

## 4. Earth in the lunar sky (see Experiments doc §11 for the full derivation)

- **Size:** about **1.9–2°** wide, about **3.7× the Moon's width from Earth** (≈13× the area). Too many films make it gigantic. **A thumb at arm's length covers it.** It's still dramatic in a telephoto shot.
- **Brightness:** full Earth is over **50× brighter than a full Moon**. Earthshine visibly lights the ground on the near side at night.
- **It doesn't move.** From the near side, Earth hangs in the same spot (±~7° monthly wobble). It does **not rise or set**, except near the limb and at the **poles**.
- **At the south pole** (our base), Earth sits **on the horizon**: within about ±7°, bobbing below and above it over ~27 days. It is **visible only ~half the time** from a typical site, always in about the same direction, and appears **upside-down** (south up) relative to a north-up globe ([NASA SVS 4944](https://svs.gsfc.nasa.gov/4944)).
- **It rotates.** A 24-hour spin is visible in time-lapse: clouds and continents slide.
- **Phases are opposite the Moon's.** Family sees a **full Moon** while she sees **new (dark) Earth**, and vice versa. The two lit fractions always sum to about 1.
- **For a fully lit Earth on the south-pole horizon, the Sun is behind the astronaut**, so her **long shadow points toward Earth**.
- **The Sun is also on the horizon at the pole** (never more than ±1.5°). It **circles the whole horizon once a month**. Shadows are **tens to hundreds of meters long**: about 65 m for a person at 1.5° sun elevation, about 200 m at 0.5°.

## 5. Time, light-delay and calls

- **Earth–Moon distance** averages **384,400 km**, ranging from about 363,000 to 405,000 km.
  - **One-way light time** is **~1.28 s** (1.21–1.35 s).
  - **Round trip** is **~2.56 s**.
  - Real systems add encoding and relay latency. Apollo 16 measured **2.71 s** two-way via Madrid ([ESA/arXiv analysis](https://ar5iv.arxiv.org/html/0903.3367)).
  - Practical video calls will be **~2.6–3+ s round trip**.
- **How it shows on screen:**
  - **After she asks a question, there's an unnatural ~3-second pause** before the answer starts.
  - People **talk over each other**, then both stop.
  - Kids learn to say "over." Laughter arrives late.
  - The video may be **crisp** (laser/Ka-band links) but **freezes** when line of sight to Earth is lost behind terrain at the south pole, or when a relay hands over.
  - Artemis II had **~40 min of planned blackout** behind the Moon, and a live call with Earth had notable awkward pauses.
- **What not to show:** real-time banter with zero lag, or *minutes* of lag (that's Mars: 4–24 min one way).
- **Clocks:** the U.S. is defining **Coordinated Lunar Time**. Clocks on the Moon tick about **58.7 microseconds per day faster** than on Earth (relativity). It makes a fun HUD easter egg.
- **Lunar day:** a **synodic day is 29.5 Earth days**. At mid-latitudes that's ~2 weeks of sun, then ~2 weeks of night. Equatorial surface temperatures run from about **+120 °C at noon to about −170 °C before dawn**. At the pole the Sun never rises high; it circles.

## 6. Getting there: launch and transit

- **Transit:**
  - Apollo took **~3 days** Earth to Moon (Apollo 11 reached lunar orbit about 76 h after launch).
  - **Artemis II** launched 1 Apr 2026 and swung past the Moon on **6 Apr**, after an extra day of checkout in high Earth orbit.
  - Plan on **3–5 days**, in microgravity.
- **G-loads:**
  - **Launch** peaks around **3–4 g** (Saturn V max about 3.9 g), with the highest loads near the end of each stage burn. Not 10 g.
  - **Return from the Moon** is harder: Apollo peaked around **6–7 g**. Artemis II's peak was reported around **4 g** ([The Week](https://www.theweek.in/news/sci-tech/2026/04/10/explained-the-extreme-physics-of-artemis-ii-astronauts-journey-home.amp.html)).
  - **Faces:** cheeks pulled back, slow breathing, and the hard part is lifting an arm.
- **Max-Q** (maximum aerodynamic pressure):
  - About **T+60–80 s**, roughly 11–13 km up. SLS hits it around **T+70 s** at ~1,045 mph and ~42,500 ft, with its engines **throttled back** to get through.
  - **Visual:** around transonic speed a **white condensation collar or vapor cone** can flash around the rocket.
  - China tested **Mengzhou's escape system at max-Q** in Feb 2026 ([CGTN](https://news.cgtn.com/news/2026-02-11/China-conducts-low-altitude-flight-test-for-Long-March-10-rocket-1KFK9b0VBiU/p.html)).
- **Booster separation** comes at about T+2 min. **Ride feel:** rumbly and violent on solids (SLS), and smoother on liquids.
- **Exhaust look:**

  | Propellant | Flame | Smoke |
  |---|---|---|
  | **Solid boosters (SLS)** | Blinding white-orange | **Huge white-gray smoke column** |
  | **Hydrogen/oxygen engines (RS-25, BE-7, LM-10 upper stage)** | **Nearly transparent pale blue**, with shock diamonds | Steam |
  | **Kerosene/oxygen (Long March 10's 21 YF-100Ks)** | **Bright orange-yellow** | Darker exhaust |
  | **Methane/oxygen (Starship)** | **Bluish-purple core with orange edges** | Little smoke |

- **Watching from the family viewing site:**
  - **Light first, sound later.** Sound travels about **3 s per km (5 s per mile)**.
  - From the **Banana Creek** viewing site, **3.9 mi (6.3 km)** from Pad 39B, the roar arrives about **18 s after liftoff**. By then the rocket is already climbing. From Titusville (~12 mi away) it takes about a minute ([NASA/KSC](https://kennedyspacecenter.com/launches-and-events/see-a-launch/launch-viewing-locations)).
  - The sound is a **crackling, chest-thumping roar** that **rattles windows** and sets off car alarms. The **ground shakes** close in. Then there's silence for the first seconds of flight.
  - Crowds stay **miles away**, often across water, with the rocket small on the horizon. At twilight the plume makes a glowing **"space jellyfish"**.
  - For a China launch, Long March 10 flies from **Wenchang, Hainan**, and families watch from coastal beaches.
- **Launch-day details:**
  - NASA crews wear **orange "pumpkin" launch-and-entry suits** (Orion Crew Survival System).
  - The walkout comes hours before launch, followed by strapping in on their backs, then hours of checklists.
  - The countdown has holds. **"Go/No-Go" polls** happen on the loop.

## 7. Spacesuits

| Suit | Look | Facts |
|---|---|---|
| **AxEMU** (Axiom × Prada, NASA's Artemis suit) | Mostly **white**, with **gray panels and red accents**. **Rear-entry** (the backpack is the door). Reflective visor, helmet lights and HD camera. | **8+ hour** EVAs, regenerative CO₂ scrubbing ([Space.com](https://www.space.com/axemu-lunar-spacesuit-axiom-space-prada-reveal)) |
| **Wangyu 望宇** (China) | **White with red stripes**. The arm stripes are **Dunhuang 飞天 "flying apsaras" ribbons**, the leg stripes are **rocket flames**, and the design echoes **traditional armor**. Integrated cameras and an operations console. | Unveiled 28 Sep 2024 ([CNN](https://amp.cnn.com/cnn/2024/09/30/style/china-unveils-moon-landing-spacesuit-intl-hnk)) |

- **Faces:**
  - On the sunlit surface the **gold sun visor is down**, so **you can't see the face**. The visor **reflects the scene**, which is the classic Aldrin shot.
  - **Best emotional shot:** **Earth on the horizon reflected in her gold visor.**
  - For a visible face, use: visor raised in shadow, interior helmet lights, the hab or rover window, or the suitport hatch.
- **Suits are pressurized** (about **4.3 psi**, pure O₂), so **stiff**. Fingers tire, and **gloves cause fingernail damage**.
- **Inside the helmet:** fans hiss, pumps hum, she hears her own breathing and comm chirps. There's **no fogging** (anti-fog coating) and no hair in her face.
- **Name tags and flags:** NASA suits carry a mission patch and flag. **Cuff checklists** on the wrist are real and great detail.

## 8. Sound

- **Outside, in vacuum: total silence.** No engine roar, no footsteps, no thunder from a landing.
- **What she *can* hear:** suit systems; radio voices; and **sound conducted through contact**. Hammering a core tube is heard as a **dull thud through her arms and suit**. Rover vibration comes up through the seat. A lander's engine is felt through the ground as a rumble, if close.
- **Music-video license:** the score can be anything, but **diegetic** sound effects outside should be muffled or contact-only. A fun cue is cutting all sound for the landing, then **only her breathing**.
- **Inside the hab:** normal air, normal sound, with constant fan and pump hum. Habs are noisy, like the ISS at about 50–60 dB.

## 9. Astronaut training (what's real)

- **NASA astronaut candidates** train for about **2 years** before assignment. The 2025 class of 10 began in Sept 2025 ([NASA](https://nasa.gov/centers-and-facilities/johnson/summer-training-catching-up-with-nasas-astronaut-candidates)). Training includes:
  - **T-38 jet flying**
  - spacewalk training in the **Neutral Buoyancy Laboratory** (a pool **202 × 102 ft, 40 ft deep, 6.2 million gallons**, with full mockups underwater and divers holding the astronaut) ([Wikipedia](https://en.wikipedia.org/wiki/Neutral_Buoyancy_Laboratory))
  - robotics, systems, Russian or other languages, medicine
  - **water and wilderness survival**
  - **geology field training**: classroom at JSC, then the **Rio Grande del Norte (New Mexico)**, **Iceland** lava fields, and with ESA's **PANGAEA** program in **Lofoten, Norway** (2025) ([ESA](https://www.esa.int/ESA_Multimedia/Videos/2025/09/Moon_geology_lessons_for_Artemis)). Arizona's San Francisco Volcanic Field hosts Artemis moonwalk rehearsals at night under harsh lighting.
- **Parabolic flights ("vomit comet"):**
  - Each parabola gives about **20–25 s** of reduced gravity, flown **15–30+ times** per flight, alternating with **1.8 g pull-outs**.
  - **Lunar-g parabolas (1/6 g)** are flown specifically for Moon tasks ([ESA "Flying for the Moon"](https://www.esa.int/ESA_Multimedia/Images/2025/11/Flying_for_the_Moon), [NASA](https://www.nasa.gov/mission/parabolic-flight)).
  - **Visual:** padded white cabin with no seats, people floating or bounding, sick bags.
- **Partial-gravity rigs:** NASA JSC's **ARGOS** overhead offload crane simulates 1/6 g for walking practice.
- **Centrifuge:** used heavily in **Chinese, Russian and European** programs (Chinese astronauts train at high g). NASA uses it less today, but it is iconic and fine for a montage. Show g-faces, a gondola on a long arm, and a red-light-stop button.
- **Other real things:** suit-fit checks, **cave training** (ESA CAVES; Chinese astronaut Ye Guangfu took part), sea survival in **orange suits bobbing next to a capsule mockup**, and **mission simulators** with failure injections. Training is mostly **classroom and simulator, not heroic running montages**.
- **Story realism:** NASA astronauts must be **U.S. citizens**. A Chinese-American NASA astronaut is completely plausible. **China's astronaut corps** is PLA plus engineers and payload specialists, including Hong Kong and Macau selectees. **The Wolf Amendment** (2011) bars NASA–China bilateral cooperation, so a joint U.S.–China base is a deliberate fiction (see the treatment's "one Earth-wide agency").

## 10. Common mistakes movies make (and the fix)

| Mistake | Reality |
|---|---|
| Dust billows into clouds; dust devils | Parabolic arcs only. No wind, no hanging haze. |
| Flags flutter | A rod holds the flag out. A brief damped twitch, then frozen. |
| Everything in slow motion (1/6 speed) | Falls are only ~2.45× slower. Horizontal moves at normal speed with skidding. |
| Starry sky behind sunlit astronauts | Black sky without stars, unless in shadow, at night, or a long exposure. |
| Giant Earth filling the sky | ~2° wide. Use a telephoto lens for drama, honestly. |
| Earth rising over the horizon everywhere on the Moon | Only from orbit, the limb, and the **poles** (our base!). Elsewhere it's fixed. |
| Full Earth while Earthlings see a full Moon | Opposite phases. Full Moon on Earth means new Earth for her. |
| Blue sky, sunsets, glowing atmosphere, lens haze | None. Instant shadows and black sky. |
| Soft shadows, ambient fill everywhere | Hard shadows. Fill only from regolith bounce and Earthshine. |
| Explosions with fireballs and sound | No sound, no fire-cloud. Flash, debris on straight parabolas, a gas puff that vanishes. |
| Faces visible in sunlight through clear helmets | The gold visor is down in sunlight. |
| Floating hair or objects on the lunar surface | That's orbit. On the Moon, things fall (slowly). |
| Instant chat with Earth | ~2.6–3 s pauses, and dropouts when Earth sets. |
| Rocket roar synced with liftoff for distant viewers | Sound arrives ~18 s to ~1 min later. |
| 10 g launches and blackouts | ~3–4 g on launch; reentry is the rough part. |
| Orange or tan desert Moon | Neutral gray. South-pole highlands are lighter gray. |
| Shiny domes sitting on bare regolith | Real bases are **bermed and buried** under regolith, with gear far apart. |
| A working Lunar Gateway in the 2030s | Paused in March 2026. |

## 11. Do / Don't list for prompts

**DO**
- "black sky, no stars, harsh single-source sunlight from the horizon, hard-edged shadows hundreds of meters long"
- "neutral gray lunar regolith, highland terrain, sharp distant ridges with no haze, close horizon"
- "Earth small (about 2 degrees), low on the horizon, crescent/gibbous phase consistent with sun direction"
- "dust kicked up in clean parabolic arcs that fall back immediately, no clouds"
- "astronaut skipping/loping gait, leaning forward, slow floaty hops (~1.4 s airtime), wide skidding stops"
- "gold reflective visor down, Earth reflected in visor"
- "white suit with gray panels and red accents" (AxEMU) or "white suit with red ribbon stripes, Dunhuang apsaras motif" (Wangyu)
- "vertical solar panels on tall masts, habitats half-buried under regolith berms, landing pad of dark sintered glassy regolith far from base"
- "inside the hab: hair and liquids fall normally but gently, magenta grow lights, small observation window"
- "video call with a 3-second delay; caller waits, smiles late"
- "launch viewed from miles away across water: silent rise, sound arrives later, crowd reacts late"

**DON'T**
- "billowing dust cloud," "fluttering flag," "starfield behind sunlit astronaut," "blue sky," "sunset glow on the Moon"
- "huge Earth filling the sky," "full Earth" when the scene is Mid-Autumn night on Earth
- "floating hair on the lunar surface," "everything in slow motion"
- "fireball explosion," "roaring engines heard outside," "footsteps sound on the Moon"
- "tan/orange desert Moon," "Mars-red dust"
- "transparent helmet showing face in full sun"
- "Lunar Gateway station overhead" (paused), and **generic "Saturn V"** for a 2030s launch (use SLS, Starship, or Long March 10)

---

## 12. Traditional and cultural facts the video uses

### 12a. Chang'e 嫦娥: myth variants
1. **Earliest fragment:** the Zhou-era divination text ***Guicang* 归藏**: Chang'e takes the Queen Mother of the West's elixir of immortality and "flees to the Moon to become the Moon's spirit."
2. **Han classic, *Huainanzi* 淮南子 (2nd c. BCE):** "羿请不死之药于西王母，姮娥窃以奔月." The archer **Hou Yi 后羿** obtains the elixir from **Xiwangmu 西王母**; his wife **Heng'e 姮娥** steals it and flies to the Moon. (Her name was changed from 姮娥 to **嫦娥** to avoid the personal name of Han Emperor Wen, Liu Heng 刘恒.)
3. **She becomes a toad.** In Zhang Heng's *Lingxian* 灵宪 and in Han art (the **Mawangdui** banner shows a moon toad), Chang'e turns into a **toad 蟾蜍**. It's an early punitive version: 蟾宫 "toad palace" is still a poetic name for the Moon.
4. **Popular modern version:** Hou Yi shoots down nine of ten suns and earns the elixir. His apprentice **Peng Meng 逢蒙** tries to steal it while Yi is away, and **Chang'e swallows it to keep it from him**. She floats to the Moon's **Guanghan Palace 广寒宫** ("Palace of Vast Cold"). The grieving Yi sets out her favourite fruits and cakes under the moon, which is one folk origin of Mid-Autumn offerings.
5. **Tragic and romantic reading:** Li Shangyin's 嫦娥 ends **嫦娥应悔偷灵药，碧海青天夜夜心**: "Chang'e must regret stealing the elixir: the jade-blue sea, the blue sky, her heart, night after night." This is the canonical "lonely on the Moon" line, and it fits our astronaut.

Sources: [Wikipedia: Chang'e](https://en.wikipedia.org/wiki/Chang%27e), [Daoinfo](https://en.daoinfo.org/wiki/Chang%27e_Flies_to_the_Moon), [Mythopedia](https://mythopedia.com/topics/chang-e/). Image: https://upload.wikimedia.org/wikipedia/commons/b/bd/The_Moon_Goddess_Chang_E_-_Unidentified_artist%2C_after_Tang_Yin.jpg

### 12b. Li Bai 李白: 静夜思 "Quiet Night Thoughts"
> 床前明月光，疑是地上霜。
> 举头望明月，低头思故乡。

*Before my bed, the bright moonlight —
I wonder if it's frost upon the ground.
I raise my head and gaze at the bright moon;
I lower my head and think of home.*

**Accuracy notes:**
- **Textual history:** the oldest (Song-dynasty) printed editions read **床前*看*月光 … 举头望*山*月**. The now-standard **明月光 / 望明月** wording appears in mid-Ming anthologies (Li Panlong's 唐诗选, later 唐诗三百首) ([China Writer](https://www.chinawriter.com.cn/n1/2024/0415/c442005-40216203.html)). So **望明月**, the song's title, is the Ming-popularized reading. That's worth a footnote if someone on Twitter "well-actually"s it.
- **床** is debated: bed, a well railing (井栏), or a folding seat (胡床). "Bed" is the standard translation.
- **Precise wording:** 低头思故乡 means "think of my **old home / hometown**" (故乡), not "country".

### 12c. Li Bai: 月下独酌 (其一) "Drinking Alone Under the Moon (No. 1)"
> 花间一壶酒，独酌无相亲。
> **举杯邀明月，对影成三人。**
> 月既不解饮，影徒随我身。
> 暂伴月将影，行乐须及春。
> 我歌月徘徊，我舞影零乱。
> 醒时同交欢，醉后各分散。
> 永结无情游，相期邈云汉。

*Among the flowers, a jug of wine;
I drink alone, no one dear beside me.
**I raise my cup to invite the bright moon —
with my shadow, we make three.**
But the moon doesn't understand drinking,
and my shadow only follows me around.
Still, for now, moon and shadow keep me company;
joy must be taken while it's spring.
I sing, and the moon lingers and sways;
I dance, and my shadow sprawls in pieces.
While sober, we share our delight;
once drunk, we each go our separate ways.
Let us bind ourselves in a friendship beyond feeling,
and meet again far off in the River of Heaven (the Milky Way).*

**Notes:**
- 无情游 means a companionship with beings "without feelings" (moon and shadow), free of human attachment.
- **云汉** is the Milky Way. The poem literally ends with a **rendezvous in space**.
- **On the Moon** the line becomes "**me, my shadow, and the Earth**". At the south pole her shadow is **long and hard**, so the "three" composition is real and graphic.
- **Original lyric:** **月缺酒寒，我思念你** = "The moon is waning, the wine grows cold; I miss you." 月缺 means a moon that is incomplete or waning.

### 12d. Other moon poems worth having on hand
- **张九龄《望月怀远》**: **海上生明月，天涯共此时**. "Over the sea the bright moon rises; at the ends of the earth, we share this moment." Already used in the treatment, and correctly attributed.
- **苏轼《水调歌头》** (written at Mid-Autumn, 1076): **明月几时有？把酒问青天** / … / **但愿人长久，千里共婵娟**. "When did the bright moon first appear? Cup in hand, I ask the blue sky… I only wish we may live long, and though a thousand miles apart, share the same lovely moon." Su Shi was later **governor of Hangzhou** and built the **Su Causeway 苏堤** on West Lake, so this ties the West Lake verse to the Mid-Autumn finale.

### 12e. West Lake 西湖, Hangzhou
West Lake is a UNESCO World Heritage cultural landscape (2011), and its **"Ten Scenes"** (西湖十景) date to the Southern Song.

- **断桥残雪 "Lingering Snow on the Broken Bridge":**
  - A low stone arch bridge at the east end of the **Bai Causeway 白堤**.
  - The name: after snowfall, the sunny side of the arch melts while the shaded side keeps its snow, so from a distance the bridge looks **"broken"**. This makes it a **winter** scene, matching the song's winter willow.
  - In the ***Legend of the White Snake* 白蛇传**, **Bai Suzhen 白素贞** meets **Xu Xian 许仙** here when he lends her an **umbrella in the rain**, and they later reunite here.
- **雷峰塔 Leifeng Pagoda:**
  - Built **975 CE** by Qian Chu, king of Wuyue, on the south shore. The scene name is 雷峰夕照 ("Leifeng Pagoda in the evening glow").
  - In the legend, the monk **Fahai** imprisons Bai Suzhen beneath it.
  - The real pagoda **collapsed on 25 Sep 1924**; Lu Xun wrote 论雷峰塔的倒掉. It was **rebuilt in 2002** with bronze-and-gold cladding and lit up at night.
  - Image: https://upload.wikimedia.org/wikipedia/commons/d/de/Leifeng_Pagoda_DJI_0593_%282%29.jpg
- **三潭印月 Three Pools Mirroring the Moon:**
  - **Three small stone pagodas** (about 2 m tall) stand in the water off Xiaoyingzhou islet. First set out by **Su Shi in 1089** to mark where planting was banned; the current ones were rebuilt in the Ming dynasty.
  - Each has a **hollow spherical body with five round holes**. **At Mid-Autumn, candles are lit inside and the holes papered over**, so 15 little "moons" plus the real moon's reflection glow on the water.
  - The scene is printed on the **back of the 1-yuan note** ([CGTN](https://news.cgtn.com/news/3d3d414f33496a4e31457a6333566d54/share_amp.html)).
  - Image: https://commons.wikimedia.org/wiki/File:Three_Pools_Mirroring_the_Moon_01_2020-04.jpg
- **平湖秋月 "Autumn Moon over the Calm Lake"** is *the* West Lake moon-viewing scene.
- **Willows:** 柳 (*liǔ*) puns on 留 (*liú*, "stay"). In the Tang custom **折柳送别**, you **break off a willow twig and give it to someone departing**. That's a perfect, accurate gesture for the goodbye before launch.
- **Tea:** **Longjing (Dragon Well) 龙井** is West Lake's own green tea. "Snow-brewed tea" (扫雪烹茶, melting fresh snow for tea water) is a literati winter pastime; *Dream of the Red Chamber* has Miaoyu serving tea brewed with snow gathered from plum blossoms.
- **Osmanthus 桂花 is Hangzhou's city flower.** It blooms right at Mid-Autumn; Manjuelong village by West Lake is famous for it. Osmanthus wine 桂花酒 ties back to Wu Gang's tree.
- **Bonus: tides.** The **Qiantang River tidal bore** near Hangzhou peaks around the **18th day of the 8th lunar month**, just after the Mid-Autumn full moon. It's a **real Moon-driven spectacle**, and the Moon's pull is visible on Earth.

### 12f. Mid-Autumn Festival 中秋节
- **Date:** the 15th day of the 8th lunar month. **2026: Friday 25 September**; astronomical full moon 26 Sep 16:49 UTC. **2027: Wednesday 15 September.** 2028: Tuesday 3 October ([publicholidays.sg](https://publicholidays.sg/mid-autumn-festival/), [Farmers' Almanac](https://www.farmersalmanac.com/september-full-harvest-moon)). Hong Kong's public holiday is the *day after*.
- **Customs:**
  - **团圆 family reunion** and moon-viewing 赏月.
  - **Mooncakes** 月饼: Cantonese style has lotus-seed paste with **salted duck-egg yolk "moons"**; Suzhou style is flaky. People cut and share them.
  - **Lanterns**: rabbit lanterns and **lantern riddles** 猜灯谜.
  - Pomelos, and **osmanthus wine**.
  - Folk legend says Yuan-era rebels hid messages in mooncakes; that is a legend, not documented history.
- **The physics twist for the story:** the family's fullest Mid-Autumn moon is **her darkest "new Earth"**. They can't both see "full" at once, but their two lit fractions always add up to a whole.

### 12g. Yutu 玉兔: the Jade Rabbit
- In the Moon's shadows people see a **rabbit pounding the elixir of immortality with mortar and pestle**, Chang'e's companion. It goes back to Han art, and possibly to Qu Yuan's *Tianwen* (顾菟在腹, "a 'gutu' in its belly", read as rabbit or toad).
- **Japanese and Korean versions** have it pounding **mochi or rice cakes**.
- **Real rovers:** **Yutu** (Chang'e-3, landed Dec 2013, Mare Imbrium) and **Yutu-2** (Chang'e-4, landed 3 Jan 2019 in Von Kármán crater, **the first far-side landing**, and the longest-operating lunar rover).
- Image: https://upload.wikimedia.org/wikipedia/commons/7/71/ChangE-4%2C_Yutu-2_%28cropped%29.png · Folk art: https://upload.wikimedia.org/wikipedia/commons/5/54/Rabbit_in_the_moon_standing_by_pot.png

### 12h. Wu Gang 吴刚 and the osmanthus tree
- Tang-dynasty *Youyang Zazu* 酉阳杂俎 (Duan Chengshi, 9th c.): **月桂高五百丈，下有一人常斫之，树创随合。人姓吴名刚，西河人，学仙有过，谪令伐树**. "The moon's cassia (osmanthus) is 500 *zhang* tall; a man forever chops at it, but each cut heals at once. His name is Wu Gang… he erred in studying immortality and was banished to fell the tree."
- He is the **Chinese Sisyphus** ([Wikipedia](https://en.wikipedia.org/wiki/Wu_Gang)).
- **Visual:** a woodcutter with an axe beside a vast glowing tree in the Moon palace. Image (Yoshitoshi): https://upload.wikimedia.org/wikipedia/commons/2/23/Yoshitoshi_-_100_Aspects_of_the_Moon_-_26.jpg
- **Story echo:** endless, repetitive, never-finished labor matches the crew's **speed-build**: dig, bag, berm, repeat.

---

### Key numbers card (print this)
| | |
|---|---|
| Lunar gravity | 1.62 m/s² (0.165 g) |
| Fall-time factor vs Earth | ×2.45 |
| Earth–Moon light time | 1.28 s one way · 2.56 s round trip (~3 s practical) |
| Earth's apparent size from Moon | ~1.9–2.0° (≈3.7× Moon from Earth) |
| Moon's apparent size from Earth | ~0.5° |
| Sun elevation at south pole | never more than ~1.5° |
| Shadow of 1.7 m person, sun at 1.5° | ~65 m |
| Horizon distance (1.7 m eye) | ~2.4 km |
| Synodic lunar day | 29.5 Earth days |
| PSR temperature | down to ~25 K (−248 °C) |
| Transit Earth to Moon | ~3 days (Apollo) to ~5 days (Artemis II flyby) |
| Launch / lunar-return g | ~3–4 g / ~4–7 g |
| Sound delay at launch viewing | ~3 s per km; Banana Creek ≈ 18 s |
| Mid-Autumn 2026 / 2027 | 25 Sep 2026 / 15 Sep 2027 |
