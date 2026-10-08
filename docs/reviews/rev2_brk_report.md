# rev2_brk — the breakdown after Jade's 1:56 note (Oct 8 2026)

Status line (kept current): **BUILT AND LOOKED AT** (Oct 8, 09:10). Clips in `render/out/rev2_brk/`. Not committed. Open
points are in "What does not yet meet the bar" below.

## The note
Jade, on `render/out/fullcut_v4_540p.mp4` at 1:56:
> we could shorten the English to "I think of home" and also a way shorter shot of my face and maybe show action shots
> of other astronauts, mid-action, looking at Earth and 乡 is accompanied by 'home' on the screen

Still in force from Oct 7 (same passage): no literal head lowering; she looks UP at a full, recognisable Earth; "home is
the salient word, not down".

## What v4 does (frames `render/out/frames_v4_540/`, every 4th of 2686–2947 looked at)
| Shot | Time | Picture | Type |
|---|---|---|---|
| 6.1 | 111.95–115.57 | Austin roof, the family make their own Moon | 举头望明月 column at right, rising; gloss "I raise my head and gaze at the bright Moon," bottom centre |
| 6.2a | 115.57–117.43 | wide, Jade on the Shackleton rim turns to the Earth | 低 115.6, 头 116.2, 思 116.9 brushed small in the crater, sinking; gloss "I lower my head and think of home." wipes in 116.0–116.8 |
| 6.2b | 117.43–118.80 | **Jade's face, 1.37 s (33 frames, 3 beats)** | 故 117.6; column fades by 118.8 |
| 6.3 | 118.80–120.99 | the wide again, push past her into the Earth | 乡 (560 px) brushed at 118.8, held |
| 6.4 | 120.99–122.77 | the Earth fills the frame, soaks into the museum globe | 乡 held to 122.6 |

## New shot list (decided against the music before building)
Beat grid (s): bar 63 = 115.641 · 116.090 · 116.537 · 116.986 | bar 64 = 117.430 · 117.877 · 118.323 · 118.770 |
bar 65 = 119.214 … | bar 66 = 120.992 … | drop 122.774. Whispered onsets: 低 115.566, 头 116.207, 思 116.928,
故 117.629; 乡 is SUNG from 118.8 (accent) and held to 122.6.

| Shot | Time | Len | Who / what | Why here |
|---|---|---|---|---|
| 6.1 | 111.95–115.57 | 3.62 | unchanged (Austin) | not in the note |
| 6.2a | 115.57–116.54 | 0.97 (2 beats) | Jade, wide on the rim, already turning to the Earth | the cut from the family looking up to their Moon must land on HER looking up to the Earth: the mirror the whole passage rests on. Shortened from a bar to two beats |
| 6.2c | 116.54–117.43 | 0.89 (2 beats) | **Adaeze Okafor** (reactor engineer), kneeling at a power-feeder junction box north of the station, a cable plug in both gloves a hand short of its socket; her helmet comes up to the Earth | "I" becomes "we": the others stop too. Cut on beat 3 of bar 63 |
| 6.2d | 117.43–118.32 | 0.89 (2 beats) | **Layla Al-Mansoori** (pilot), at the lander beside the pad, a cargo container from it in both arms, helmet already lifted to the Earth: she finishes the step she was in and comes to a standstill (first plan, one glove still on the ladder rail, could not be painted: see Log) | cut on the downbeat of bar 64 |
| 6.2b | 118.32–118.80 | 0.48 (1 beat) | Jade's face (same painted keyframe and take), the last half second of the lift: eyes on the Earth | "way shorter": 33 → 11–12 frames. It is the one face among visors, placed as the breath before 乡. A no-face variant (6.2d runs to 118.80) is one constant in the section file |
| 6.3 | 118.80–120.99 | 2.19 | unchanged picture: the wide, push past her into the Earth | 乡 + "home" |
| 6.4 | 120.99–122.77 | 1.78 | unchanged | 乡 + "home" held |

Two crew shots, not three: the whispered half-line is 3.2 s; three shots plus Jade would be under 0.7 s each in the
song's quietest bars. Both new people are crew who have no work shot anywhere else in the film (7.B belongs to Arjun,
Jade, Lúcia, Kenji; 7.A3 to Adaeze as a line drawing); Nigeria and the UAE, neither the singer's nor the poem's country.
Neither place repeats 7.B (PSR drill, ISRU hall, greenhouse, Shackleton floor): the comms-tower power feeder north of
the base and the lander by the pad, both with nothing between the person and the Earth but the plain.

Screen grammar shared by every Moon shot of the passage: the Earth upper left, the person right of centre facing LEFT
toward it, the Sun behind them (off frame right) so every shadow runs left, toward the Earth; visors down outdoors.

## Type (built; `render/src/sections/06_breakdown.js`)
- **English, now "I think of home"**: the old gloss ("I lower my head and think of home.", bottom centre, wiped in at
  116.0) is gone. *I think* is brushed on 思 (116.93), *of* on 故 (117.63): small (46 px Cormorant italic, pale),
  lower left at x 70, baseline y 892. Nothing is shown on 低头: the translation no longer has those words.
- **乡 + "home"**: 乡 is unchanged (560 px, x 470 / y 230, lands with the cut at the sung onset 118.8, trembles, held to
  122.6). *home* (88 px italic, about 1/6 of the character) is brushed in 118.82–119.22 on the SAME baseline, right
  after *of*, directly under the character: the sentence "I think of home" completes under 乡 as it is sung. *I think
  of* fades 119.7–120.4; 乡 / home are then held together and leave together at 122.6. Both English pieces carry a soft
  dark halo of their own shape, because the ground under them changes (the horizon band crosses there at about 120.2,
  then the Earth, then silk).
- **低头思故**: one column (76 px) in the black sky at the left (x 238, y 118), where 乡 will stand; the same place in
  all four shots; it no longer sinks (Oct 7: "home is the salient word, not down").
- HUD `GUANGHAN · FULL EARTH · 4.8° ABOVE THE HORIZON` runs through 6.2a–6.2d instead of 6.2a only.
- Nothing in `_lib.js`, `scenes/` or `core.js` was touched: the two-run reveal and the haloed card are local helpers.

## Earth in the new shots (engine-drawn, never painted)
Same rule as 6.2a (`E62A`): radius = 1.2 x 1.025° / HFOV of the keyframe's width, centre 2.35 diameters above the top
of the horizon line measured in the painting.
| Shot | Keyframe horizon top (measured) | Lens taken | Earth centre uv | radius | on screen (design px) |
|---|---|---|---|---|---|
| 6.2a | v 0.39 | 55° | (0.360, 0.200) | 0.0225 | about (525→625, 185→225) |
| 6.2c | v 0.41 (0.402–0.426) | ~48° | (0.326, 0.194) | 0.0256 | about (610→625, 196) |
| 6.2d | v 0.39 (0.387–0.393) | ~55° | (0.325, 0.200) | 0.0225 | about (590→610, 215) |
| 6.2b | v 0.48 | ~41° | (0.400, 0.218) | 0.0314 | about (730, 260) |
The Earth therefore sits at nearly the same spot of the screen across the four cuts: it is the fixed point the eye
keeps while the people change.

## Log
- 08:30 keyframes for 6.2c / 6.2d ordered (nano-banana-pro, refs K_6.2ii + suit sheets + K_4.9).
- 08:31 K_6.2c_a: good pose, household two-pin plug -> edit b (industrial barrel connector). Accepted pose; hands 2, gloves on
  connector + cable, visor aimed up-left.
- 08:31–08:37 K_6.2d "one glove still on the ladder rail": 4 tries (a, b = edit, c = edit from K_6.2ii's own figure,
  d2 = fresh with the facing spelled out). Every one has the astronaut FACING the ladder, i.e. back to the Earth. The
  model will not turn a figure away from a ladder. Restaged (rule: change the staging rather than ship it): she carries a
  container away from the lander, stopped mid-stride -> K_6.2d2_a, right at once.
- 08:40 first stills: the two new keyframes were mostly white (sunlit plain) in a white-on-black section. Both edited so
  the plain ahead lies in the shadow of the rise the person is on (true at a 1° Sun, and what 6.2a already shows):
  K_6.2c_c (figure pixel-identical to b: phase-correlation shift 0.04 px), K_6.2d2_b (also removed a national flag patch
  the model had put on her shoulder). K_6.2d2_b had two horizon bands; the upper one painted out by script
  (work/rev2_brk/one_horizon.py) -> K_6.2d2_c = K_6.2d.jpg.
- 08:46 video: K_6.2c take_1 (h3 2K) + take_2 (Seedance 2.0 720p) came back clean, but they were ordered from the
  sunlit-plain keyframe; a trial prep against the dark keyframe shows the take's bright ground as blotches round the
  figure. Not used. take_3 / take_4 ordered from the final keyframe (same prompt).
- 08:52 K_6.2d take_1 / take_2: clean but she walks on; reversed that is a backward walk. Rejected; prompt changed to
  "both boots stay planted", take_3 / take_4 ordered.
- 08:57 K_6.2c take_3 (h3 2K, final keyframe): PICK, reversed, source f0–f62 at 2.6x = 24 frames; her helmet comes up
  from the connector to the Earth by 117.1 and holds. take_4 (Seedance) alternate.
- 09:00 K_6.2d take_3 (h3, "boots planted"): reversed, her body drifts backwards and the front boot un-plants: reject.
  take_4 (Seedance 2.0): she finishes the step and stands, helmet on the Earth throughout f0–f54: PICK, played FORWARD
  (2.4x = 23 frames). So 6.2c is "head comes up", 6.2d is "stops walking": two different interruptions.
- 09:02 first full render: English reveal let "of" show early (the reveal edge overshoots the first word): the three
  words are now three cards. Grey mottling in the black behind both figures where the take's own dark pixels showed:
  `tools/roto_prep_rubbing.py --black-floor 0.22` (new option, default off) pulls moving dark pixels to the painting's
  ink black; both takes re-prepped.
- 09:08 6.2a restarted at 1.0 s of its take (1.4x): at the cut her helmet is already up and she is turning (at 0.8 s the
  first frames still showed it bowed, which is the picture Jade's Oct 7 note argued against).

## Files
- Section: `render/src/sections/06_breakdown.js` (only section file touched). `FACE` at the top: `true` = one-beat face
  (delivered), `false` = no face shot, 6.2d runs to 乡 with its take slowed to 0.66x.
- Keyframes: `media/keyframes/K_6.2c.jpg` (+ `.txt`, first version kept as `K_6.2c_v1.jpg`), `media/keyframes/K_6.2d.jpg`
  (+ `.txt`); all tries, prompts and the two helper scripts in `media/keyframes/work/rev2_brk/`.
- Video: `media/gen/K_6.2c/take_1..4`, `media/gen/K_6.2d/take_1..4` (16-frame sheets `take_N_sheet16.jpg`, verdicts in the
  sidecars), first frames `ff_with_earth.jpg`; picks added to `media/gen/picks.json` (`K_6.2c` take_3, `K_6.2d` take_4);
  roto folders `media/gen/K_6.2c/roto/take_3`, `media/gen/K_6.2d/roto/take_4`. Submit script: `tools/vgen_rev2_brk.py`.
- Shared code: `tools/roto_prep_rubbing.py` gained `--black-floor` (default 0 = old behaviour, byte-identical frames
  without it). `_lib.js`, `scenes/`, `core.js`, `assets.js`: untouched.
- Docs: `docs/script.md` section 6 rows (6.2a, new 6.2c / 6.2d, 6.2b, 6.3, 6.4). Subtitle files NOT edited (below).
- Re-prep commands (re-running them is safe: these two folders hold no keep / emblem data):
  `$MPY tools/roto_prep_rubbing.py K_6.2c/take_3 --key media/keyframes/K_6.2c.jpg --reverse --range 0:62 --speed 2.6 --region 0.50,0.10,0.92,0.80 --static 0.0,0.0,0.50,0.40 --black-floor 0.22`
  `$MPY tools/roto_prep_rubbing.py K_6.2d/take_4 --key media/keyframes/K_6.2d.jpg --range 0:54 --speed 2.4 --region 0.50,0.08,0.80,0.90 --static 0.0,0.0,0.50,0.40 --black-floor 0.22`

## Delivered
- `render/out/rev2_brk/breakdown_after.mp4` (111.5–123.5 s, 960x540, master audio), frames `render/out/rev2_brk/frames/`
- `render/out/rev2_brk/breakdown_before.mp4` (the same range from the v4 frames)
- `render/out/rev2_brk/breakdown_after_noface.mp4` (variant: no face shot, 6.2d to 乡)
- sheets: `sheet_after_every3rd_a.jpg`, `sheet_after_every3rd_b.jpg`, `sheet_after_first_frames.jpg` in the same folder

## Frames looked at (final render)
Every 3rd frame 2769–2955 on contact sheets; at full size the first frames of every shot (2774, 2797, 2819, 2840, 2852,
2904), the first two / middle / last of 6.2c (2797, 2798, 2806, 2818) and 6.2d (2819, 2820, 2829, 2839), the face shot
(2840, 2841, 2846, 2851), 6.2a every 2–4 frames (2774–2796), cropped strips of both crew figures every 2nd and 4th frame,
and the type moments (2818, 2824, 2852, 2855, 2858, 2866, 2876, 2884, 2890, 2915, 2928, 2936). The no-face variant:
every 3rd frame 2819–2855. Judged from frames, not from watching at speed with sound.

## Spend
Video: 8 takes, $5.60 (4 x h3 2K 5 s at $0.65, 4 x Seedance 2.0 720p 5 s at $0.75) of the $15 budget; 4 of the 8 were
lost to two avoidable causes (2 ordered before the keyframe's ground was final, 2 on a prompt that let her walk on).
Images: 9 nano-banana-pro calls, $1.21 (codex's image tool was not used: another codex session was working in the repo).

## Subtitle files: what they say now (NOT changed)
- `release/subs/make_subs.py` line 54: `ly('L14b', '低头思故乡', 'I lower my head and think of home.')`
- `release/subs/moongazing.en.srt` cue 21 (01:55,566 → 02:02,900): `I lower my head and think of home.`
- `release/subs/moongazing.zh-en.srt` cue 24 and `moongazing.zh-en.vtt`: `低头思故乡` / `I lower my head and think of home.`
- `release/subs/README.md` "Translation notes" quotes 《静夜思》 as "I raise my head to gaze at the bright moon / I lower my
  head and think of home."
- The picture now says "I think of home", so subtitles and picture disagree until Jade decides. Also for her: the line
  before it differs already between picture ("I raise my head and gaze at the bright Moon,") and subtitles ("I raise my
  head to gaze at the bright moon"); and if 低头 loses "I lower my head", does 举头 keep "I raise my head"?

## What does not yet meet the bar / open points
1. **Nobody has watched it at speed.** Four cuts in 3.2 s of the song's quietest bars is a rhythm judged on paper (cuts on
   beat 3 / downbeat / beat 3 / the sung 乡). If it feels busy against the whisper, the no-face variant has one cut fewer.
2. **The face is 0.48 s (12 frames).** It reads in stills as the breath before 乡, but whether a half-second face is a
   beat or a blip is Jade's call; `breakdown_after_noface.mp4` is the alternative. A two-beat face would cost a crew shot.
3. **6.2d is not the staging first planned** ("one glove still on the ladder rail"): the image model would not turn a
   figure away from a ladder in four tries. Carrying a container is a clear action but a plainer one; the lander is
   only a leg and a footpad at the frame edge. A Three.js blockout handed over as layout could get the ladder version.
4. **6.2d plays forward from the painted pose**, so its later frames are the take's own pixels (Seedance 720p) redrawn in
   the rubbing tone, a little softer than the painting; 6.2c ends on the painting itself. Not visible at 540p; check at
   1080p.
5. **In 6.2d she is already looking at the Earth when the shot opens** (she stops walking; she does not look up). Only
   Adaeze's shot has the head coming up.
6. **6.2c holds still for its last 5–6 frames** (helmet arrived, hands steady; only the camera push moves).
7. **The two are not identifiable as Adaeze and Layla on screen**: visors down, monochrome, no stripe colour, no name
   label (a label would be a second thing to read in 0.9 s). They are who the script says they are. Adaeze's suit has a
   round shoulder disc that the suit sheet does not have, and no arm band; Layla's has the arm band.
8. **Emblem**: not composited. Adaeze's chest patch is a 14 px dark disc at 1080p; Layla's chest is behind the box. No red
   anywhere (the frames are monochrome); a national flag patch the model added to Layla's shoulder was removed.
9. **"home" crosses the horizon band** for about 6 frames around 120.2 s (frame 2884): readable through its halo, but
   murky. Moving the line would take it off the baseline under 乡.
10. **The two crew are both women** (the two with no work shot elsewhere); nothing on screen shows it either way.
11. **The profile cheat** of 6.2a / 6.2b carries over: a person looking at something at infinity that is inside the frame
    would have her back to the camera. All three figures face left in profile with the Earth upper left, so it is at
    least one consistent convention.
12. K_6.2d: the far horizon had two bands; the upper one was painted out by script. At full size a faint seam is visible
    in the black where the patch ends at the lander strut (keyframe px 2462–2550 x 496–537); not visible in the render.
