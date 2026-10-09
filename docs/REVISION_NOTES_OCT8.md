# Third revision round — Jade's notes of Oct 8 2026 (after `fullcut_v5_540p.mp4`)

Timestamps are from `render/out/fullcut_v5_540p.mp4` (frames: `render/out/frames_v5_540/f_%06d.jpg`, index =
`round(t*24)`). This file is the shared brief for everyone working on this round. The bar, the per-shot rules and the
pipeline cheat-sheet in `docs/REVISION_NOTES_OCT7.md` all still apply: read its first 40 lines and its "How to work a
shot" section before touching anything. `docs/HANDOFF.md` (top block) says what must not be undone in the renderer.

## What Jade is asking for, in one paragraph
Movement that reads as natural (nobody frozen, nobody in lockstep, no limb that pops), physical and real-world
plausibility checked against real reference images (she asks for image searches twice), type that arrives smoothly or
is simply there, and one station name everywhere: **International Moonbase**.

## Her notes from the chat (verbatim) and the shot each maps to
| v5 time | Shot | Owner | Note |
|---|---|---|---|
| whole film | all type | TYPE | "let's rename the moonbase to just "International Moonbase" across all languages" |
| — | 5.1, 5.4, any suited walk | ASTRO | "glitchy astronaut legs" |
| 0:10 | 0.5 | OPEN | "I feel like there was a version of this scene where the people were moving around instead of static. can you also place the moon slightly lower in the sky so we can see the full moon? it can maybe even be warmer in color, as it typically would be when closer to the horizon" |
| 0:14 | 0.6 (and 1.1, same take) | OPEN | "Jade isn't moving at all in this clip which feels unnatural, even if she just shifts her weight and breathes a bit, and do an image search and see how what typical Huangpu River shipping looks like in modern day. There should be some commercial ships, some boat tours, etc., to look realistic." |
| 0:20 | 1.2 | TYPE | ""Every space program on Earth is building the International Moonbase" (in both languages)" |
| 0:23 | 1.4a | ASTRO | "good walking, but maybe they don't need to be all in sync, which reads as unnatural. also, what are the suitcases they're holding? what do you see when you do image searches for astronauts walking towards launch? please use realistic images for reference" |
| 0:33 | 2.1 | TYPE | "something about the camera movement is jerky here" |
| 0:33 | lyrics | TYPE | "the lyrics appearing on screen is a bit jerky and could be more smooth, alternately, for shorter phrases, you can just have them already on screen instead of animated appearing" |
| 0:47 | 3.1 lyrics | TYPE | "part of the top of 'h' in watching is already on screen, before the word renders. it may be worth while to do a pass to make all the lyrics go smoothly and nonglitchy, or for shorter phrases/lines, just unanimated" |
| 0:52 | 3.3 | HANDS | "let the hand move smoothly down" |
| 0:58 | 3.5a/3.5b | HANDS | "ideas for improving this animation (up to you how you want to do it), but one idea is: you could have Kenton's (larger) hand, hand her the envelope, and we see it long enough to read MISSION ASSIGNMENT, and we (the video model) animates her flipping it over (in a way that reads as natural) and opens the envelope, which has a trifolded paper inside, which we can't read, but you can tell that the text written on the page here is printed on the inside." |
| 1:05 | 3.6e | FACE | "weird headphone glitchy movement" |
| 1:10 | 3.7b | FACE | "my chin appears to glitch for a moment" |
| 1:12 | 3.8b | ASTRO | "I really like the cinematics of this shot. Let's make the one from 0:23 as good as this one" |
| 1:17 | 4.1 | ASTRO | "animate the rest of the plume too so it's not weird" |
| 1:19 | 4.2 (compare 1.6) | KIDS | "M hair consistency with other scenes from the same day" |
| 1:23 | 4.3b / 4.3c | KIDS | "T's cheeks are a bit fuller" |
| 1:33 | 4.7 | FACE | "glitchy left elbow" |
| 1:45 | 5.2 | BASE | "I like having this art style for this intro shot to the International Moonbase but check the Three.js model and the frames – this shot should have a consistent design" |
| 1:50 | 5.4 | ASTRO | "glitchy legs on astronaut" |
| 2:18 | 7.B3 | BASE | "is the expected size of that glove proportional to the size of the plant experiment? it reads as large, but I don't know if my own expectation is off. and the hand doesn't quite read as attached to her arm and body in the back (it doesn't need to be visibly connected, but her shifts in body movement should be congruent)" |
| 2:44, 2:49 | 7.D2, 7.D3, 7.D3c | HANDS | "it would be emotionally more natural to reach out a single finger to touch the image of her little hand in these shots, and maybe also have use Three.js or an image model or whatever tool makes sense here to make the arm, elbow, shoulder look natural (which it currently doesn't), same gesture at 2:49" |

## Her answers on the decisions page that need work (verbatim notes in quotes)
| v5 time | Shot | Owner | Answer |
|---|---|---|---|
| 0:57 | 3.4c | KIDS | Framing fine. "his cheeks should be fuller, but have him center the eclipse on the Anatolia region because this will serve as as an Easter Egg for the Battle of Halys music video" |
| 1:22 | 4.3 | FACE | Use the sung close-up. "the mouth is ok on the sung close-up, but the upper half of the face is glitched" |
| 1:52 | 6.1 | HOME | Keep the idea; lit Moon brighter, Kenton turned further away. "make T's movement more fluid and natural, like maybe he starts earlier" |
| 1:52, 1:56 | 6.1, 6.2 | TYPE | Remove both small sky labels. |
| 1:56 | 6.2b | TYPE | Take her face out of the passage entirely (`const FACE = false` in `06_breakdown.js`). Subtitles not ticked: leave them. |
| 2:15 | 7.B2 | BASE | "the hands on the valve shouldn't go back and forth, which doesn't make a lot of sense, but keep going in one direction, and more slowly, and the needle on the gauge should be trembling a little bit, and then start slowly moving (slightly lagged relative to the valve turning)" (The new build montage itself: "love the new montage! yes, this is much better.") |
| 2:28 | 7.C2 | KIDS | Show single-pad mode on the TV. "and T's cheeks are fuller than what's shown" |
| 2:32–2:38 | 7.C4a, 7.C5c | CREW | Chen Yu keeps true vermilion on his collar. "there's one unnatural hand, I think that's Kenji and Lucia clip and Lucia's hand looks weird" |
| 2:56–3:01 | 7.E1, 7.E1b, 7.E1c | CREW | Restyle or replace the Adaeze close-up; fix the continuity slip; remove "DAY 388". "the wrist angles are unnatural/uncomfortable for the direction the people are facing for both toast clips. they should be held in a natural way. I added "astronauts_toasting_fullEarth.png" to inputs, which was generated by prompting Codex with "please generate an image of a team of astronauts all facing the same direction (towards a giant glass window of a deck on a moonbase), toasting to a full Earth" and the wrists looked natural." Not clinking is fine: "see the other note about natural positions for the hands". |
| 3:13 | 8.2, 8.2b | HOME | Keep Kenton in the picture, moving; move the rejoining tear off the children's faces; make a proper close painting of the hug instead of the punch-in. |

Settled with no work: teahouse kiss kept; chopsticks fine; small toy Moon kept (correct the bible); HUD labels may stay
red; hair inside the suit fine; the two crew shots keep their look; roundel emblem kept; parachutes kept; calendar
confirmed; envelope "fine" on the page is superseded by her 0:58 chat note above.

## Owners (one agent each; reports in `docs/reviews/rev3_<owner>_report.md`)
- **TYPE**: names, the 0:20 card, lyric reveals, the 2.1 camera move, labels to remove, FACE=false. Owns
  `render/src/type.js`, `sections/_lib.js`, `scenes/title.js`, `scenes/colophon.js`, `release/subs/`, and the type/HUD
  lines of every section file.
- **OPEN**: 0.5, 0.6 (+1.1). Owns `00_intro.js` and the 1.1 block of `01_intro_b.js`.
- **ASTRO**: 1.4a, 4.1 plume, 5.1, 5.4 and a sweep of every suited walk for leg faults.
- **HANDS**: 3.3, 3.5a/b, 7.D2/7.D3/7.D3c.
- **FACE**: 3.6e, 3.7b, 4.3 (sung), 4.7.
- **KIDS**: 3.4c, 4.2 (vs 1.6), 4.3b/c, 7.C2.
- **BASE**: 5.2, 7.B2, 7.B3.
- **CREW**: 7.C4a stripe, 7.C5c, 7.E1/E1b/E1c.
- **HOME**: 6.1, 8.2/8.2b.

## The name
On screen, in subtitles, in credits and in the memo the station is **International Moonbase** / **国际月球基地** (other
languages: translate "International Moonbase" plainly). "Guanghan", "广寒", "廣寒" and the 廣寒 seal no longer appear
in anything a viewer sees. Where the 廣寒 seal was stamped (5.2 and anywhere else), stamp the pale-blue-dot roundel
from the identity sheet instead; do not invent a new seal-script seal. File and folder names (`guanghan3d`,
`guanghan_layout.md`) stay as they are, so nothing breaks. Text baked into keyframes or takes counts: if a painted
frame shows the old name, the owner of that shot fixes it. The 0:20 card:
"Every space program on Earth / is building the / International Moonbase." and
这一次，/ 全世界的航天计划 / 共建 / 国际月球基地 (Jade reads Chinese natively: the wording goes on the page for her to confirm).

## Rules for this round (in addition to the Oct 7 rules)
1. **Real reference first where she asked for it** (Huangpu shipping, astronauts walking out to the pad, glovebox
   gauntlets, toasting wrists): search, save 3–6 reference images under `media/ref/rev3_<owner>/` with their source
   URLs in a `SOURCES.md`, and hand them to the image model. Say in the report what the references showed.
2. **Motion comes from a video model, not from sliding stills.** Asynchrony, weight shifts, breathing and secondary
   motion are prompted for explicitly. Reject a take in which a limb pops, legs cross through each other or a gait
   skates.
3. **Look at motion as motion.** Contact sheets hide pops. For every take and every wired shot, also make a strip of
   *consecutive* frames (every frame for at least one second around the risky part) and a frame-difference check;
   a glitch Jade names by timestamp must be found in the v5 frames first, so you know what you are fixing.
4. **Limits.** Video spend: at most 12 USD per agent this round (`media/gen/spend.jsonl`; the project cap is close).
   Images: edits with `tools/cf.py google/nano-banana-pro` are fine. Jade's own likeness still comes only from codex
   painting over her photos (`media/keyframes/jade/PROMPTS_*.md`). **Only one `codex exec` may run at a time across all
   agents**: always start it as `flock /tmp/moongazing-codex.lock codex exec -s workspace-write …`. Never use a
   sandbox-bypass flag. Do not type into the tmux panes; the interactive codex pane belongs to the main session.
5. **Rendering.** Test renders at half scale, `--workers 2`, into `render/out/rev3_<owner>/`. Do not run a full-film
   render; the main session hands that to codex at the end. Do not commit.
6. **Shared files.** Section files are shared between owners: re-read the file immediately before each edit, change
   only your own shot blocks, never reformat. TYPE owns the lyric/HUD/card lines; if you need a type change in your
   shot, write it in your report instead of editing those lines. `node tools/lint_shots.mjs` (from `render/`) must
   print OK after every edit. Re-running `tools/roto_prep.py` wipes keep/emblem/paper data: re-run those tools after.
7. **Write as you go.** Keep `docs/reviews/rev3_<owner>_report.md` current after each shot (what she asked, what the
   v5 frames showed, what you changed, files, frames you checked, what still falls short), so an interruption loses
   little. Scratch files go in your own subfolder of the session scratchpad.
8. **For the decisions page**, end the report with a section "For Jade": per shot, one plain-language sentence on what
   changed (by timestamp, never by shot id), the path of one representative frame from your test render, and any
   choice that is genuinely hers.

---

# Outcome (written at the end of the round, Oct 8 evening)

Cut: `render/out/fullcut_v6_540p.mp4` (frames `render/out/frames_v6_540/`, rendered twice and compared by codex with
`render_verified.sh`). Reports, one per owner, each ending with a "For Jade" section and its shortfalls:
`docs/reviews/rev3_{type,open,astro,hands,face,kids,base,crew,home,polish}_report.md`. Her open choices are on the
decisions page (link in `docs/HANDOFF.md`; cards in `release/review/cards_r3.json`, ids `r3_*` to decide, `d_*` done).
Nobody has watched v6 at speed with sound: every judgement in the reports is from frames, strips and measurements.

| v5 time | Shot | In v6 |
|---|---|---|
| whole film | type | International Moonbase / 国际月球基地 on every card, HUD, label and subtitle; the 廣寒 seal replaced by the roundel (5.2); laptop byline at 3.6e rebuilt. Folder and file names keep "guanghan". |
| 0:10 | 0.5 | New keyframe and take (`K_0.5/take_5`): whole amber Moon, sky lanterns, a festival street with a walking crowd. The street is new: her choice (`r3_street`). There never was an earlier take with moving people. |
| 0:14 | 0.6, 1.1 | River repainted from six reference photos (barges, ferry, sightseeing boats); `K_0.6/take_5`, she kneels, breathes, turns. Rate 0.75 must stay (her profile loses its glasses after 3 s of the take). |
| 0:20 | 1.2 | New card in both languages, Chinese in five columns; wording is hers to confirm (`r3_card`). |
| 0:23 | 1.4a | New keyframe and take (`take_7`): front counterpart of 1:12, out of step, ventilators lunch-box size with plugged hoses, rocket repainted to the film's rocket. Choice: carry nothing / flatten (`r3_walk`). |
| 0:33 | 2.1 | The engine's pan began outside its clamp: held, then jumped. `from` corrected. |
| lyrics | all | Wipe mask removed; words fade whole; short lines fade once or are there; Chinese characters on their own clock. `render/tools/type_reveal_check.mjs`. Engine: rate-changed takes now hold drawings two film frames (`drawingAt`). |
| 0:52 | 3.3 | `take_6g`: optical-flow resample into one glide (`tools/glide_resample.py`). |
| 0:58 | 3.5a/b/c | Three shots at rate 1: Kenton's hand, the turn, the trifold letter. Type follows the envelope through the tilt (`paper_track.py --follow`). Choices: size, sticker (`r3_env`). |
| 1:05 | 3.6e | Headphones carried with the painted head (`roto_keep.py --track`). |
| 1:10 | 3.7b | `take_8c`: painted head carried on the take before roto (`tools/head_carry.py`). |
| 1:12 → 0:23 | 3.8b | Untouched; 1.4a redesigned after it. |
| 1:17 | 4.1 | `LIFT` shader: flames, lengthening trail, rolling ground cloud. |
| 1:19 | 4.2, 1.6 | M's painted hair carried on both takes. |
| 1:22 | 4.3 | Sung close-up wired (`LS3c/take_7pm`, `ls_sung_prep.py --portrait`): painted portrait, only lips and mouth interior move. Her choice (`r3_sung`). |
| 1:23 | 4.3b | T's head to sheet v3; `take_6`. T's sheet: `media/chars/T/SHEET.jpg`. Also 3.4a/b/c, 4.5, 7.C1, 7.C2, 8.2. |
| 1:33 | 4.7 | `tools/roto_force.py` on two polygons. |
| 1:45 | 5.2 | Plate redrawn over a guide from the Three.js model (camera `5.2o`); roundel 180. Also 1.5 tower and 7.B6 lights brought to the model. Choices on the mounds' hand (`r3_plan`). |
| 1:41, 1:50 | 5.1, 5.4 | 5.1 `take_5` at rate 1; 5.4 whole-figure mask. Sweep of other suited shots clean. |
| 0:57 | 3.4a/b/c | Real coastlines; shadow on central Anatolia (39 N, 34.5 E). Choice: crisper shadow; toy Earth elsewhere (`r3_eclipse`). |
| 1:52 | 6.1 | `take_8` reversed; beam drawn by `tools/beam_61.py`, on the Moon at 月. Labels removed. |
| 1:56 | 6.2 | `FACE = false`. |
| 2:15 | 7.B2 | `take_9` one slow turn; needle by `scenes/gauge.js`. |
| 2:18 | 7.B3 | Glove measured: hand-sized, not too large; `take_16` at rate 1, body and glove move together; fog dropped. Choice (`r3_glove`). |
| 2:23 | 7.B6 | No windows on mounds; 17 engine lights; HUD 17/17. Choice (`r3_lights`). |
| 2:28 | 7.C2 | Single mode screen; T's cheek. Choice: targets left or centred (`r3_ddr`). |
| 2:33, 2:36 | 7.C4a, 7.C5c | Vermilion restored (`tools/stripe_patch.py`); third hand removed (`take_3`). Choice: wave (`r3_wave`). |
| 2:44, 2:49 | 7.D2, 7.D3, 7.D3c | One fingertip; arm from a blockout; `J_7.D2/take_5` played backwards for the reach. Choice: split framing (`r3_split`). |
| 2:56–3:01 | 7.E1, b, c | One staging; new wide; Adaeze as a flat profile; ground outside from the model. Choices: Chen Yu, socks (`r3_toast`). |
| 3:13 | 8.2, 8.2b | `K_8.2a/take_9` (Kenton walks in and kneels), tear at y 790, close painting `K_8.2b_close/take_1`. Choices (`r3_reunion`). |

Also made this round, at her request: two lyric videos (full and karaoke) by codex, in `render/out/lyric_video/`, scripts in
`release/lyric_video/`.

## Things learned this round that the next session needs
- **Takes are not always on ones.** h3 takes repeat each of their own frames two or three times. Played at a rate that
  is not a whole number of those steps they stutter (holds of 2,4,2,4), and `roto_holds.mjs` cannot see it because it
  counts frame indices. Codex's `render/out/v6_holds.py` measures holds from the rendered frames; its table is
  `render/out/v6_holds.txt`.
- **Carried regions are fragile.** Many shots now carry painted pixels over a take (`meta.json["keep"]`), a forced
  redraw, a paper track, a beam or an emblem. Re-running `roto_prep.py` on such a take wipes them. Each report lists
  the re-run order for its takes; `media/gen/picks.json` notes carry the commands.
- **Image models return the old picture when it is among the inputs** (toast wide, glovebox ports, 3.4 side views).
  Composite a region back, or leave the old painting out of the inputs.
- **Usage limit.** Nine image-heavy agents, four at a time, used a whole five-hour window in two hours.
- Spend this round: about 30 USD of video (the log stands at 301 of the 380 cap) and about 10 USD of images
  (`media/gen/spend.jsonl`, `media/genlog.jsonl`); no codex image jobs.

---

# Round four (Oct 8, night): Jade's answers on the decisions page

Jade answered the fifteen `r3_*` cards and wrote on two `d_*` cards (ArtifactData, collection `decisions`), and in the
chat: "0:59, yes fix the envelope glitch" and "don't render the whole video, just the small fixes on the artifact for
me to look at, and then commit and push". Her words are quoted exactly below.

| Time | Shot | Owner | Her answer |
|---|---|---|---|
| 0:20 | 1.2 | main | Change the Chinese: "streamline it to: 全世界的航天计划共建国际月球基地" |
| 0:58–1:01 | 3.5a/b/c | ENV | Ticked the pale-blue-dot sticker on the flap. "also make the words stick to the envelope better, and when the letter emerges from the envelope, it's a folded trifold, and then she has to open it. do the image models not know how this works? I'd like to not have to film it, but I can offer to if you and the other computers literally can't figure it out." Chat: "0:59, yes fix the envelope glitch" (the cut that jumps inside the turn). |
| 1:05 | 3.6e | FACE | "there's a bit of a 'gulp' like motion at my throat that looks ... glitchy?" |
| 1:10 | 3.7b | FACE | "there's something glitchy about the way M's hair interacts with my face. is it because the movement was generated without a video model helping with the collision?" (a question: answer it truthfully) |
| 1:22 | 4.3 | PHOTO | "it's pretty bad, and I'm not fond of the non-singing shot either. It makes more sense to do a shot of me looking longingly at a picture of the kids without singing." |
| 1:45 | 5.2 | BASE | "it's better, but I think the solar masts were larger in the other artwork and this should match?" |
| 2:23 | 7.B6 | BASE | Chose "Add work lamps on the masts and along the road" (the card said the station model would get them too). |
| 2:59 | 7.E1c | TOAST | "shoes are fine, it's not Jade's personal home. hands are weird in the 2 cup shot, but correct in the group shot. can you fix the 2 hand shot using the hands in the group shot as guidance?" |
| 3:13 | 8.2, 8.2b | HOME | Ticked "wrap" (Kenton wraps both arms round all three). "where do I find the shot where he wraps both arms?" |

Settled with no work: festival street kept (0:10); walkout unchanged (0:23); glove kept (2:18); single mode on the left
"it's not perfect but it's fine for now" (2:28); no wave (2:36); split screen as it is (2:44); shoes fine. No answer on
the eclipse card (0:57) or the lyrics-and-camera card.

## Rules for round four (the Oct 7 rules and the round-three rules above still hold)
1. **Scope.** These are fixes to named shots. Change only your own shot blocks in the section files (re-read the file
   right before each edit; other owners are editing the same files) and do not change behaviour in `_lib.js`, `core.js`,
   `type.js` or `src/roto/` for any other shot; the rest of the film is not being re-rendered, so its v6 frames must
   stay valid. If you must touch shared code, make the change opt-in and say so in your report.
2. **Find it first.** Look at the fault in the v6 frames (`render/out/frames_v6_540/f_NNNNNN.jpg`, frame = round(t*24))
   as consecutive frames before changing anything, and name its cause.
3. **Motion comes from a video model; look at motion as motion** (rules 2 and 3 above). No AI tells: hands, paper
   and hair must behave physically.
4. **Limits.** Video: at most 8 USD per owner (`media/gen/spend.jsonl`; the log stands at 301 of the 380 cap). Images:
   `tools/cf.py google/nano-banana-pro` edits. Jade's likeness only from codex painting over her photos
   (`media/keyframes/jade/PROMPTS_*.md`), started as `flock /tmp/moongazing-codex.lock codex exec -s workspace-write …`
   (one at a time, never a sandbox-bypass flag). Do not type into tmux panes. Keep image reading economical: contact
   sheets and strips at modest size, not dozens of full frames (a usage limit stops every agent at once).
5. **Rendering.** Half scale, `--workers 2`, into `render/out/rev4_<owner>/`. No full-film render. Do not commit.
   `node tools/lint_shots.mjs` (from `render/`) must print OK after every edit. Re-running `tools/roto_prep.py` wipes
   keep/emblem/paper data: re-run those tools after.
6. **Write as you go.** Create `docs/reviews/rev4_<owner>_report.md` before your first job and keep it current. End it
   with "For Jade": per shot, in plain language by timestamp, what changed, what still falls short, the exact frame
   range you re-rendered, the path of your passage clip (`render/out/rev4_<owner>/<name>.mp4`, cut with
   `node tools/render.mjs --encode A-B --scale 0.5 --framedir … --out …` so it has the song under it) and one or two
   representative frame numbers. Scratch files go in `<session scratchpad>/<owner>/`.
