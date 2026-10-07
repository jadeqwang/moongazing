# 望明月 · Moongazing — song map

Audio: `inputs/moongazing.mp3`, 212.0 s, 48 kHz stereo. All times are seconds from the first decoded sample. Bar numbers come from `beatgrid.json`: bar 1 = 2.64 s, 4/4 throughout, no odd bars.

**Tempo:** the tempo is not constant. It speeds up gradually and smoothly from about 128.7 BPM in the intro to about 136.5 BPM late in the drop. Section averages: intro 129.0 · V1 130.6 · V2 132.4 · hook 133.2 · breakdown/build 134.5 · drop 136.0. The whole-song median is 133.7, and the Suno prompt asked for 140. A fixed 133.7 grid ends up as much as 1.24 s (about 2.75 beats) off at the ends of the song, so cut to the beat list in `beatgrid.json`. After about 201 s the outro is in free time.

**Phrasing habit:** almost every sung line starts on the "and" of beat 4, about 150–200 ms before a downbeat. The vocal is a pickup into the bar, so a cut on the downbeat lands about 0.2 s after the singer starts the line.

## Section table

| # | Section | Start–End (s) | Bars | What's there |
|---|---|---|---|---|
| 0 | Silence | 0.00–1.78 | – | Digital near-silence. |
| 1 | **Intro A**: guzheng + erhu | 1.78–15.67 | (pickup) 1–7 | 1.8–5.0: a voice-like bowed or wind line (erhu or dizi; it is **not** a human voice). 2.84: one low boom or taiko-like hit. From 4.0: guzheng 8th-note arpeggios that get busier and brighter toward 15 s. No bass. |
| 2 | **Intro B**: taiko + vocalise | 15.67–30.57 | 8–15 | Bar 8 is a lift bar. 17.1: bass/sub drone enters. Taiko-style flam hits land on the downbeats of bars 9, 11, 13 and 15 (17.54, 21.30, 25.01, 28.75), so one hit every 2 bars. The guzheng keeps running. A wordless female vocalise runs 18.6–29.3. |
| 2b | Breath bar | 30.57–32.42 | 16 | Drums and bass cut at 30.57, leaving guzheng only. |
| 3 | **Verse 1** (sparse) | 32.42–47.12 | 17–24 | Vocal pickup at 32.14. Guzheng or nylon-guitar-like plucks, soft pad, a hint of piano. **No drums or bass.** At 45.3 (bar 24), a kick/fill lead-in. |
| 4 | **Verse 2** (band enters) | 47.12–76.11 | 25–40 | 47.14: the drum kit enters hard with a half-time rock groove (kick on 1 and on the "and" of 2, snare on 3). Bowed strings/cello swell 51–63. Bass sneaks in at 58.0, and **at 61.65 (bar 33) the full band lifts**: bass plus full kit. Vocal 46.82–71.19. Bars 39–40 (72.5–76.1) are an instrumental turnaround with rising hi-hats. |
| 5 | **Hook** | 76.11–101.33 | 41–54 | Impact at 76.17. Full band with strings, vocal 77.16–99.7. Drums pull back 92.3–97.7 under 举杯邀明月 / "moons and lonely wine", then re-hit at 97.73 (bar 53). |
| 6 | **Interlude**: riser + stabs | 101.33–112.07 | 55–60 | An erhu phrase at 101–102.5. **Riser** from 101.3 to 104.9 (noise and brightness climb, bass drops out, 16th-note fill in bar 56), then an **impact at 104.92** (bar 57). Bars 57–59 are stop-start: the bass switches on and off about every 2 beats. **Dip at 109.5–112.0** (bar 60): bass out, drums thin. |
| 7 | **Breakdown** (whisper) | 112.07–119.21 | 61–64 | Drums and a deep 808-like sub re-enter at 112.07. The whispered vocal starts at 111.95. Hi-hats get denser and brightness rises 116.5–118.5, ending in a 16th-note burst in bar 64. |
| 8 | **Build** | 119.21–122.77 | 65–66 | The 808/bass cuts at 119.3. Big drum hits on beat 3 of bar 65 (120.12) and bar 66 (121.89). The drums are nearly silent 120.5–121.5. There is a synth arpeggio, and **the vocal holds 乡 on B4 from 118.8 to 122.6**. Drum fill from 121.9, then a falsetto flip at 122.65. **No long accelerating snare roll**; the fills are only 16th-note density. |
| 9 | **Drop** (electronic + erhu lead) | 122.77–189.86 | 67–104 | The loudest, densest part of the song. Electronic synth lead and pumping bass (the tagger hears "electronic/techno/dubstep"), syncopated kicks, and erhu lead lines. Sub-phrases: **A** 122.77–133.45 (b67–72) full synth drop; **B** 133.45–147.64 (b73–80) erhu lead melody 133.9–144.7; **C** 147.64–161.77 (b81–88) with the bass out 158.5–161.8 plus an erhu phrase as a mini-lift; **D** 161.77–175.85 (b89–96) re-drop at 161.77, **wordless vocalise 163.5–169.8**, bass out 173.0–175.8; **E** 175.85–189.86 (b97–104) re-hit at 175.85, bass fades 181–184.6 and is gone after that, erhu 186.9–190.1, 16th-note fill in bar 104. |
| 10 | **Drop cut → Outro** | 189.86–212.0 | 105–111, then free time | **At 189.9–190.0 the drop cuts out abruptly** (highs fall about 22 dB in 0.5 s). The drums decay until about 193. Guzheng plus **humming 193.2–199.1**. Near-silent dip 200.5–201.3. **Solo hum, almost a cappella, 201.6–204.9.** Low boom at 204.5. Guzheng plucks at 205.7, 207.0 and 208.3, a **last pluck at 210.04**, then a fade to 212.0. |

Your agglomerative boundaries all line up with this map: 4.5 (Intro A arpeggio start), 17.5 (bar 9 taiko), 28.5/32.2 (vocalise end, V1), 45.2 (V2 fill), 97.8 (hook drums re-hit), 109.6/111.8 (dip, breakdown), 120/122.1 (build gap, drum re-entry), 191.8 (drop tail), 201.8 (solo hum), 204.6 (boom).

## What each section feels like

- **Intro A (1.8–15.7):** Still and nocturnal. Bowed erhu sighs over a moonlit lake, a single soft boom, then the guzheng starts rippling like water and slowly speeds up and brightens.
- **Intro B (15.7–30.6):** The ground opens up. A deep bass drone and slow ceremonial taiko strikes every two bars. A distant female voice floats in, high and wordless, swells, and fades away. Cinematic and expectant.
- **Verse 1 (32.4–47.1):** Intimate and close. A low, soft voice with plucked strings and no beat at all. It feels like a confession.
- **Verse 2 (47.1–76.1):** The band arrives with a heavy half-time rock groove and strings swelling underneath. At 61.65 the floor drops in (bass plus full kit), which makes this the first "lift" moment, on "homesick with waning".
- **Hook (76.1–101.3):** Full, warm and yearning, and the most emotional vocal stretch. Long held notes on 寒 and 你. The drums briefly hold back on 举杯邀明月 and then come back.
- **Interlude (101.3–112.1):** Tension machinery. An erhu flourish, a whooshing riser into a hit at 104.9, choppy stop-start stabs, then a hollow dip around 110.
- **Breakdown (112.1–119.2):** Dark and close. A whisper sits right in your ear over sub-bass and ticking hats. Mysterious.
- **Build (119.2–122.8):** Suspended breath. The bass vanishes, the drums nearly stop, and the singer holds one high note (乡) that leaps into falsetto right as the drop hits.
- **Drop (122.8–189.9):** Euphoric, driving and relentless. It is the loudest part of the song. Synth lead and an erhu lead trade the melody. Short bass drop-outs at 158.5, 173.0 and 181–184.6 work as mini-lifts. A wordless vocal soars at 163.5–169.8.
- **Outro (189.9–212):** A sudden hush. The beat cuts away, the guzheng and humming return, and a lone hum hangs almost unaccompanied at 201.6. It ends on a single last pluck at 210.0. Bittersweet and moonlit.

## First 30 seconds in fine detail (social hook window)

| Time (s) | Bar | Event |
|---|---|---|
| 0.00–1.78 | – | Silence. Trim it or put a title card here. |
| 1.78 | pickup | First sound: a soft swell. It is full level by 2.0. |
| 1.8–5.0 | pickup–2 | A voice-like erhu/dizi melody line (instrument, not a vocal). |
| 2.64 | 1.1 | Bar 1 downbeat. |
| 2.84 | 1.1 | **First hit**: low boom/taiko-like burst plus pluck (accent #8), decaying by about 3.6. |
| 4.0–4.5 | 1.4–2.1 | The guzheng 8th-note arpeggio begins (plucks every ~0.23 s). |
| 5.86 | 2.4 | Strong pluck (accent #4). |
| 6.0–8.5 | 3–4 | Arpeggio continues. Slightly quieter at 7–8 s (−32 dB). |
| 9.14 | 4.3 | Bright pluck run 9.1–9.9 (accent #5). |
| 10–11.5 | 5 | Sparser plucks. 11.47 is accent #18. |
| 12.2–15.6 | 6–7 | Continuous guzheng runs that keep getting brighter and louder (−26 → −21 dB). 13.10 is #10 and 15.42 is #16. |
| 15.67 | 8.1 | Lift bar: the low end starts to build and the brightness jumps. |
| 17.1 | 8.4 | Bass/sub drone enters. |
| 17.23–18.0 | 8.4–9.2 | **Taiko flam hit landing on bar 9 (17.54)**, the biggest moment so far. |
| 18.6 | 9.3 | The vocalise enters quietly (soft, dark hum around C#5). |
| 19–20.7 | 10 | Hum continues with sparse plucks. |
| 20.8–21.5 | 10.4–11.1 | Taiko hit cluster on bar 11 (21.30). |
| 22.75 | 11.4 | **The voice blooms** into an open "ah" (louder, −23 dB), rising B4 → E5 → G#5 by 24.7. |
| 25.01 | 13.1 | Taiko hit (bar 13). |
| 25.9–27.2 | 13.3–14.2 | Held high note G5→F#5 (vocalise peak). Guzheng runs start again. |
| 27–29.3 | 14–15 | The vocalise fades out. Taiko on bar 15 (28.75). |
| 30.57 | 16.1 | **Drums and bass cut** (accent #25), leaving guzheng only for one bar. |
| 32.14 | 16.4+ | First sung word, "The willow…" (Verse 1). |

A strong 15 s social cut is **15.67–30.57** (bars 8–15): taiko plus the voice blooming. Another option is **17.54–32.42**, which starts exactly on the first taiko hit and ends on the first lyric.

## Vocal entrances

| Time | What |
|---|---|
| 18.60 | First voice: wordless vocalise (quiet hum) |
| 22.75 | Vocalise opens to "ah" (the first clearly audible voice) |
| **32.14** | First lyric: "The willow in winter is slender," |
| 46.82 | Verse 2: "in afternoon teahouses watching" |
| 54.09 | First Chinese line: 举杯邀明月，对影成三人 |
| 65.75 | "moons and lonely wine." |
| **77.16** | Hook: 月缺酒寒，我思念你 |
| 86.62 / 92.21 / 94.90 | "I think of you…" / 举杯邀明月 / "moons and lonely wine" |
| **111.95** | Whispered 举头望明月，低头思故… |
| 118.23 | 乡: the voice switches from whisper to full sung tone |
| 163.5 | Drop vocalise (wordless) |
| 193.22 | Outro humming |
| 201.58 | Final solo hum |

Full word/character timings are in `lyrics_timing.json`.

## Sustained / held notes

| Start–End (s) | Note | On | Note on delivery |
|---|---|---|---|
| 25.9–27.2 | G5→F#5 | vocalise | High and airy, the intro peak |
| 62.0–64.5 | B3 | "waning" | Low, 2.5 s hold |
| 67.0–69.8 | C#4 | "lonely wine" | Warm and full |
| 79.9–81.5 | E4 | 寒 | Hook |
| **82.8–86.0** | F#4 | 你 | Longest held lyric in the hook (3.2 s) |
| 90.7–92.1 | F#4 | ad-lib | Re-articulation after "I think of you" |
| 96.9–98.45 → 98.5–99.7 | C#4 → G#5 | "wine" → falsetto flip | |
| **118.8–122.6** | **B4** | **乡** | **Climactic held note (3.8 s) over the build; leaps to a falsetto B5 at 122.65–124.0, right onto the drop downbeat** |
| 164.5–167.0 | C#5 | drop vocalise | Loud, open-voiced, the highest strong sustained vocal |
| 193.6–198.5 | B4→C#5→C5 | outro hum | |
| 202.6–204.9 | C#4 | final solo hum | |

The vocal is never a hard rock belt. The strongest, most "belted" moments are the hook (77–90), the held 乡 (118.8–122.6) and the drop vocalise (164.5–167).

## Top 25 accent hits (cut points)

The ranking combines loud spectral flux with how much each hit stands out from the surrounding ±2 s. That means quiet-section plucks rank high because they stand out, and drop kicks rank by sheer power. The grid column shows bar/beat; "+&" means the 8th-note off-beat.

| Rank | Time (s) | Grid | What |
|---|---|---|---|
| 1 | 210.09 | free time | Final guzheng pluck (last event of the song) |
| 2 | 47.14 | 25.1 | **Verse 2 drum-kit entrance** |
| 3 | 50.06 | 26.3+& | First big snare/kick hit of the V2 groove |
| 4 | 5.86 | 2.4 | Intro guzheng pluck |
| 5 | 9.14 | 4.3 | Intro guzheng pluck run |
| 6 | 199.32 | 110.2 | Outro pluck |
| 7 | 206.73 | free time | Outro pluck after the boom |
| 8 | 2.84 | 1.1 (+200 ms) | First hit of the song (boom + pluck) |
| 9 | 61.65 | 33.1 | **Band lift**: bass + full kit |
| 10 | 13.10 | 6.3+& | Intro pluck |
| 11 | 125.67 | 68.3+& | Drop kick |
| 12 | 128.32 | 70.1+& | Drop kick |
| 13 | 143.43 | 78.4 (−&) | Drop kick (end of erhu lead) |
| 14 | 192.05 | 106.2 | Last drum hit decaying after the drop cut |
| 15 | 122.10 | 66.3+& | Drums re-enter just before the drop downbeat |
| 16 | 15.42 | 7.4+& | Pluck into the Intro B lift |
| 17 | 54.38 | 29.1 | Hit under the start of 举杯邀明月 |
| 18 | 11.47 | 5.4 | Intro pluck |
| 19 | 124.11 | 67.4 | Drop |
| 20 | 109.60 | 59.3+& | Last stab before the ~110 dip |
| 21 | 131.22 | 71.4 | Drop |
| 22 | 76.17 | 41.1 | **Hook downbeat impact** |
| 23 | 150.51 | 82.3+& | Drop |
| 24 | 132.77 | 72.3+& | Drop, then the bass hiccups |
| 25 | 30.57 | 16.1 | Drums/bass cut before Verse 1 |

**Structural cut points** (section and impact downbeats, often better than the raw ranks): 2.64 · 17.54 (taiko + bass) · 30.57 · 32.42 · 47.12 · 61.65 · 76.11 · 97.73 · 101.33 · 104.92 (riser impact) · 109.6 (dip) · 112.07 · 119.21 · 120.12 · 121.89 · **122.77 (DROP)** · 133.45 · 147.64 · 161.77 (re-drop) · 175.85 (re-hit) · 184.61 (bass out) · **189.9 (drop cut)** · 193.4 · 201.6 · 210.04.

## Instrument detection: confidence notes

- **Guzheng** (intro, V1, outro): high confidence. Plucked 8th-note arpeggios, and the AudioSet tagger reports "zither / plucked string / pizzicato".
- **Erhu** (1.8–5, 101–102.5, 133.9–144.7, 158.5–162.4, 186.9–190.1): medium-high confidence. It is voice-like, so Demucs put it in its vocal stem, but BS-RoFormer rejects it as voice. The tagger reports "violin, fiddle / bowed string". Dizi is possible for the 1.8–5 s line.
- **Taiko** (2.84 and bars 9/11/13/15): medium confidence. They are big low drum strikes with no kit around them. "Taiko" is an inference from the sound, not a tagger label.
- **808/sub** (breakdown 112–119, drop): medium confidence, based on low-band energy. **Strings swell** in V2 51–63 (tagger: cello/bowed). **Riser** 101.3–104.9 and 116.5–118.5.
- **Not confidently detected:** distorted electric guitar, pipa tremolo, dizi as a separate lead, and a long snare roll.
