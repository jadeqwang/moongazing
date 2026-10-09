# 望明月 · Moongazing — Handoff (Oct 9 2026, small hours)

## UPDATE, Oct 9: round five, the film retimed to the lower-key recording (cut v8) — read this first

### What Jade asked
Her message verbatim, her nine round-four answers and what was done about each: `docs/REVISION_NOTES_OCT9.md`. In short:
retime the film to `inputs/Moongazing - 2 semitones down.mp3` with an even fade-out and export that mp3; do the fixes her
answers call for; render a small version of the whole film and commit.

### Where things stand
- **Cut v8** `render/out/fullcut_v8_540p.mp4` (frames `render/out/frames_v8_540/`, 5,165 frames, 0..5164, 215.19 s) is the
  whole film on the new recording with every round-five change in it. Rendered twice and compared
  (`render/out/v8_render.log`: 226 frames differed, all settled by a third pass; flicker check passed). **Nobody has
  watched it at speed with sound**; I looked at two contact sheets of the whole cut and one comparison image per fix.
- **Audio:** `media/audio/moongazing_2down_master.wav/.mp3` (210.86 s), release copy
  `release/audio/Moongazing_master_2_semitones_down.mp3`. Not in git. The old-key masters are untouched beside them.
- **Timing:** `analysis/beatgrid.json` and `lyrics_timing.json` are the new recording's (`analysis/v2/`); the first
  recording's are in `analysis/v1/`. Any time in older notes, reports and `docs/script.md` is a time on the first
  recording: `analysis/v2/time_map.json` converts, `node render/tools/shot_table.mjs` says where a shot is now.
- **Changed shots:** 1:03 desk (`J_3.6e/take_6`, the whole figure from a video take, no carried painting); 1:20 gold
  visor (`J_4.3p/take_1g`); 1:43 masts at 1.6x (`K_5.2.jpg`, last round's kept as `K_5.2_v3.jpg`); 2:53 toast without
  the two-cup shot (7.E1, 7.E1b, 7.E1d: group, Adaeze, group); 3:11 reunion version B (`K_8.2a` pick `take_10`);
  3:16 the ending re-fitted (8.3 one bar, 8.4 from bar 111 to the last chord at 204.19, inscription faster).
- **Page:** https://claude.ai/artifact/Hhnwakg7vSnB1h3MFEHaDp, published as "Round five" (version 8): the whole film
  (one file and six parts), seven cards (`r5_sync, r5_ending, r5_desk, r5_photo, r5_plan, r5_toast, r5_reunion`), earlier
  rounds under a fold. Answers: ArtifactData, collection `decisions`. Source: `release/review/cards_r5.json` (edit by
  hand), `page_r5_body.html`, `page_r5.css`; `bash release/review/build_page_r5.sh` cuts
  `render/out/rev_page/v8/{clips8,img8}/` and rewrites `decisions.html`; publish that file to the same URL with
  `clips8/*` and `img8/*` as files (root `render/out/rev_page/v8`).
- **Git:** committed and pushed on `round2-v5` (PR #5). Not committed, on purpose: `:memory:.ses` (stray) and
  `inputs/Moongazing - 2 semitones down.mp3` (the first recording IS in the public repository as `inputs/moongazing.mp3`,
  but publishing the new recording is Jade's call: ask her).

### What each answer on the page leads to
| Card | If she chooses… | Then |
|---|---|---|
| `r5_sync` | something early or late | Find the event in `analysis/v2/time_map.json` / `NOTES.md` (low-confidence ones are listed there), fix the value in `analysis/v2/retime/overrides.json` or the section file, lint, re-render the passage. |
| `r5_ending` | roof deck too short / inscription rushed / hold through the chord | `render/src/sections/08_outro.js`: `S84` (now `bar(111)`), `END` (204.19), the `inscription` offsets, the fade (last 0.8 s). Holding past the chord means moving `END` later; the credits (`09_credits.js`) start at `END` and the seal lands there. The same numbers are in `release/subs/make_subs.py` (`S84`, `DED`). |
| `r5_desk` | the take where she glances at the laptop | `clip: 'J_3.6e/take_8', offset: 1.3` on the 3.6e line of `03_verse2.js` (prepped; `rev5_desk_report.md`). |
| | face does not read as her | The plate's face is still last round's first frame; a codex portrait pass over her photo, then a new take from it (`tools/vgen_rev5_desk.py`). |
| `r5_photo` | clear visor again | one word in `media/gen/picks.json`: `J_4.3p` → `take_1s`, and the clip name in the 4.3 block of `04_hook.js`. |
| `r5_toast` | end on Adaeze | `SE` and `TOAST` in the 7.E block of `07_drop.js`: e.g. `SE = [bar(97), bar(98, 3), bar(100)]` and drop the third row. |
| `r5_reunion` | off | `K_8.2a` pick: `take_8` = version A, `take_9` = one hand. |

### Things that went wrong or were learned, so they are not repeated
- `/tmp` (16 GB tmpfs) was full of other projects' caches; Chrome then crashes at start with more than one render
  worker. Run renders with `TMPDIR` on disk (`render/tools/ranges_verified.sh FIRST-LAST …` does).
- Codex's sandbox hides the GPU and cannot run the renderer, and this session's safety check refuses to approve a
  command outside codex's sandbox. Stems and renders ran from the main session's shell (detached with `setsid nohup`,
  which costs no usage and survives a cut-off); codex did the master, the analysis on CPU, and the page build.
- `pkill -f` with a pattern that also appears in your own command line kills your own shell.
- Usage this round: two fix agents (about 240 k and 295 k tokens, 24 and 31 minutes), launched together at the start
  of the window's last three and a half hours; nothing was running near the reset.
- Spend: 1.84 USD video (desk takes), 0.40 USD images.

### Next, in order
1. Her answers on the `r5_*` cards (page and chat), then those fixes.
2. A watch at speed by a person. Soft spots I know of: the second group view of the toast is close to the first; the
   roof deck is 1.8 s; the inscription's English has about 2.5 s; the desk shot's face is softer than its neighbours;
   the lyric at 1:03 leaves about 0.4 s before the cut.
3. Lyric videos on the new recording (`release/lyric_video/`, codex): not redone; the ones on the page are the old key.
4. 1080p: `TMPDIR=… bash render/tools/render_verified.sh 0 215.19 out/frames_v8_1080 1 3`, then encode.
5. Items 2–5 of the round-three list below still stand (thumbnails, social cut, upload copies).


## UPDATE, Oct 8 night: round four (superseded by the block above; its times are on the first recording)


### What Jade asked
She answered the fifteen round-three cards on the decisions page and wrote in the chat: "0:59, yes fix the envelope
glitch" and "don't render the whole video, just the small fixes on the artifact for me to look at, and then commit
and push". Her answers verbatim, the owner of each fix and the round's rules: the "Round four" section at the end of
`docs/REVISION_NOTES_OCT8.md`. One report per fix: `docs/reviews/rev4_{face,photo,base,toast,home,env}_report.md`,
each ending with "For Jade" and its shortfalls.

### Where things stand
- **All nine fixes are rendered and on the page; she has not looked yet.** 0:20 card in her wording; 0:58 envelope;
  1:05 throat; 1:10 M's hair; 1:22 new shot (she looks at a snapshot of the children; replaces the sung close-up);
  1:45 masts 1.4x on the plan; 2:23 work lamps (HUD now `STATION · LIGHTS 21 / 21`); 2:59 two-cup hands; 3:13
  reunion with Kenton's arm round them (`K_8.2a/take_8`, cut to the close moved one beat later, to 197.50).
- **The envelope (0:58–1:01, shots 3.5a and 3.5c; 3.5b is gone) is wired but its review was cut short.** The ENV
  agent was stopped before it finished its report; the Status block at the top of `docs/reviews/rev4_env_report.md`
  (written by the main session) says exactly what was and was not checked. Not looked at frame by frame: the
  unfolding, frames 1437–1479. Two further takes of the unfolding (`K_3.5_letter/take_8`, and `take_9`, never
  downloaded) are unjudged. Her card is `r4_env` (source `release/review/card_r4_env.json`).
- **Frames.** `render/out/frames_v7_540/` is cut v6 with only the fixed passages re-rendered:
  frames 421–511, 1389–1479, 1524–1577, 1654–1707, 1956–1989, 2519–2582, 3443–3543, 4284–4346, 4642–4772. Each range was
  rendered twice and compared (`bash render/out/v7_ranges.sh FIRST-LAST …`, log `render/out/v7_render.log`; all
  unresolved=0). **No v7 film file exists**: she asked for the fixes only. Nobody has watched any of it at speed
  with sound.
- **Page:** https://claude.ai/artifact/Hhnwakg7vSnB1h3MFEHaDp. Round-four cards are ids `r4_card, r4_env, r4_desk,
  r4_chin, r4_photo, r4_plan, r4_lights, r4_toast, r4_reunion`; answers in ArtifactData, collection
  `decisions`. Source: `release/review/cards_r4.py` → `cards_r4.json`; `page_r4_body.html`, `page_r4.css`;
  `bash release/review/build_page_r4.sh` cuts `render/out/rev_page/v7/{clips7,img7}/` and rewrites `decisions.html`;
  publish that file to the same URL with `clips7/*` and `img7/*` as files (root `render/out/rev_page/v7`). The
  round-three cards are kept under a fold; "Before" clips are the v6 parts already on the page.
- **Git:** see `git log`. Never commit `:memory:.ses` (stray tool file) or `inputs/Moongazing - 2 semitones down.mp3`
  (Jade's own file, appeared Oct 8; not asked about). The repository is public; `media/` and `render/out/` are not in
  git, so the new paintings, takes and frames exist only on this machine.

### Choices waiting for her on the page
| Card | If she chooses… | Then |
|---|---|---|
| `r4_env` 0:58 | show the seal being broken / unfolding still wrong | `rev4_env_report.md` §3 (the paper blockout `render/scenes/blockouts/3.5/`); look at `K_3.5_letter/take_8` first; a new take needs first and last keyframes. |
| `r4_reunion` 3:13 | B (opens both arms; his profile shows about a second) | one word in `media/gen/picks.json`: `K_8.2a` → `take_10`; its close painting `K_8.2b_wrap10` and take are made (`rev4_home_report.md`). Re-render 4642–4772. |
| | one hand | `K_8.2a` → `take_9` reproduces v6 byte for byte. |
| `r4_photo` 1:22 | gold visor / repaint 1:15 to match / splash-park photo | `rev4_photo_report.md`; the 1:15 snapshot is shot 3.8f. Rebuild order for `J_4.3p/take_1s` is in `picks.json` (`roto_prep` wipes `roto_only` and `roto_keep` data). |
| `r4_plan` 1:45 | larger still (1.6x) | `mastDraw` on shot `5.2o` in `render/scenes/guanghan3d`, then `media/keyframes/work/rev4_base/k52_masts.py`; the lower masts' panels will overlap the mounds. |
| `r4_lights` 2:23 | more lamps in view | `LAMPS` in `07_drop.js`, `render/src/scenes/worklamps.js`; lamps live in the layout (`L.lamps`). |

### Things that went wrong, so they are not repeated
- **Codex's sandbox cannot run the renderer** now (`listen EPERM` on the local server): the job handed to pane
  `moongazing:0.1` deleted the first range's frames and failed every pass. It was stopped and the render run from this
  session instead. Hand codex only work that needs no local server (encoding, image edits), or have it ask to run
  outside its sandbox.
- **Renders under load save wrong frames silently** (three owners saw it with six agents rendering at once). Final
  frames must come from `render_verified.sh` (through `v7_ranges.sh`), never from an agent's test render.
- **`tools/ffcheck.py` run with no shot name** (TOAST's slip) rewrote `ff_r`, `ff_shift_px` and `aspect` in 215 take
  sidecars against today's keyframes. Nothing reads those fields except `ffcheck.py`; the picks' original scores
  survive as text in `picks.json` notes and `docs/production_tracker.md`.
- A frame number divided by 24 and printed to six decimals can round across a frame: `v7_ranges.sh` pads half a
  frame either side.
- The five agents that finished used about 1.5 M tokens between them (250–370 k each), 18 to 42 minutes each; ENV ran about 75 minutes before it was stopped.
- Spend this round: about 9.7 USD of video (5.7 of it on the envelope) and about 1.4 USD of images, not counting
  ENV's images (`media/gen/spend.jsonl`).

### Next, in order
1. Look at the envelope's unfolding (1437–1479) as consecutive frames, since its owner did not get to.
2. Her answers on the `r4_*` cards, then those fixes.
3. A watch at speed, a full verified render (v7), then 1080p. Items 2–5 of the round-three list below still stand.


## UPDATE, Oct 8 evening: third revision round, cut v6 (superseded by the block above)

### Where things stand
- **Cut v6** `render/out/fullcut_v6_540p.mp4` (frames `render/out/frames_v6_540/`, sheet `fullcut_v6_sheet.jpg`) holds
  every note of Jade's third round (23 from the chat, 12 from her answers on the page). All 5,305 frames were rendered
  twice by codex and compared (`render/out/v6_render.log`); one frame (f_003430, 2:22.9) differs between runs in 24
  pixels at the bottom edge by at most 2 levels, the rest are byte-identical. **Nobody has watched v6 at speed with
  sound.** Every judgement is from frames, consecutive-frame strips and measurements.
- **Her notes verbatim, the owner of each and the outcome:** `docs/REVISION_NOTES_OCT8.md` (brief at the top, outcome
  table and "things learned" at the bottom). One report per workstream, each ending with "For Jade" and its
  shortfalls: `docs/reviews/rev3_{type,open,astro,hands,face,kids,base,crew,home,polish}_report.md`.
- **Decisions page:** https://claude.ai/artifact/Hhnwakg7vSnB1h3MFEHaDp (private to Jade). Fifteen cards to decide
  (ids `r3_*`) and fourteen done cards with a note box (ids `d_*`); answers in ArtifactData, collection `decisions`
  (the 21 older documents there are round two's answers, all acted on). Source: `release/review/cards_r3.json` (the
  cards), `page_r3_body.html` (the page), `build_page_r3.sh` (cuts clips and posters into `render/out/rev_page/v6/`
  and rewrites `decisions.html`). "Now" clips are `clips6/part_N.mp4`, "Before" are the v5 parts `clips5/part_N.mp4`.
- **Lyric videos** (asked for mid-round): `render/out/lyric_video/Moongazing_lyric_video.mp4` and
  `…_karaoke.mp4` (lead removed during sung lines only; `Moongazing_karaoke_audio_nohumming.wav` is the variant with
  the lead removed everywhere). Made by codex; scripts and README in `release/lyric_video/`. Nobody has listened.
- **Git:** nothing from this round is committed. The tree is on `round2-v5` (PR #5 still open). Jade was not asked to
  commit this round; ask before committing or pushing (the repository is public). `:memory:.ses` in the repo root is a
  stray 51-byte file from a tool at 12:59; do not commit it.
- **The station is "International Moonbase" / 国际月球基地** in everything a viewer sees. Folder and file names keep
  "guanghan".

### What to do with each answer on the page
Each `r3_*` card's options are written in `release/review/cards_r3.json`; the report named below says how.
| Card | If she ticks… | Then |
|---|---|---|
| `r3_street` 0:10 | unbroken rooftops | wire `K_0.5/take_3` with `media/keyframes/work/K_0.5_rev3_final.jpg` (`rev3_open_report.md`). |
| `r3_card` 0:20 | change the Chinese | the `z12*` calli lines of shot 1.2 in `01_intro_b.js`, the same cue in `release/subs/make_subs.py`, and the 5.2 label. |
| `r3_walk` 0:23 | carry nothing / flatten | new K_1.4a keyframe and take; after any roto prep re-run the rocket `roto_keep` line and `emblem_patch.py K_1.4a` (`rev3_polish_report.md`). |
| `r3_eclipse` 0:57 | crisper shadow / same globe elsewhere | globe reference `media/keyframes/work/rev3_kids/beam_painted_clean.png`; shots 3.5a–c, 4.7, 8.3 carry the toy Earth. |
| `r3_env` 0:58 | true size / sticker | new `K_3.5_front` (and letter) keyframes; type is tracked with `paper_track.py … --static 56 --follow 89`. |
| `r3_sung` 1:22 | non-singing | restore the 4.3 block from git (`04_hook.js` at HEAD). New portrait: `rev3_face_report.md` §4.3. |
| `r3_plan` 1:45 | old brushwork / one hand | `K_5.2`, `K_1.5`, `K_7.B6` over the model guides (`rev3_base_report.md`, `rev3_polish_report.md`). |
| `r3_glove` 2:18 | bulkier | new K_7.B3 keyframe and take; re-run order in `rev3_base_report.md`. |
| `r3_lights` 2:23 | more lamps | `WINDOWS`/`DOME` in `07_drop.js` and the model (`render/scenes/guanghan3d`). |
| `r3_ddr` 2:28 | centred | one number in `tools/ddr_screen.py`, rebuild `SCR_ddr_c2`. |
| `r3_wave` 2:36 | wave | edit `K_7.C5c`, new take. |
| `r3_split` 2:44 | uneven split / whole profile | the 7.D3 block and its seam in `07_drop.js` (`rev3_hands_report.md`). |
| `r3_toast` 2:56 | Chen Yu / socks | `K_7.E1b`, `K_7.E1` (`rev3_crew_report.md`; blockout `render/scenes/blockouts/7.E1/`). |
| `r3_reunion` 3:13 | wider / behind / wrap / socks | `K_8.2a/take_8` is the wrap; the rest need a new keyframe (`rev3_home_report.md`). |
| `r3_small` | drifting pan / single characters | an `ease` option on the roto push for 2.1; `tail` option of `lyricZH` (`rev3_type_report.md`). |

### Next, in order
1. Her answers (page and chat), then the fixes above; lint, render the shot, look at it as consecutive frames.
2. A watch of v6 at speed. Known soft spots, most likely first: the sung close-up's still jaw (1:22); the cut inside
   the envelope turn (0:59); Kenton's double-speed steps (3:14.7–3:15.3); the softer walkout beside the flat crew shot
   (0:23–0:24); Adaeze's nearly still shot (2:57); the beam against the level flashlight (1:53.6–1:54.0); 16 identical
   black frames at 3:09.9 (also in v5); shoes indoors (toast wide, reunion).
3. The hold audit (`render/out/v6_holds.py`, `v6_holds.txt`, `v6_holds_vs_v5.txt`) flagged 20 shots as unevenly
   stepped, but codex's comparison judged almost all of them to be small motion under the threshold, with no shot
   confidently worse than v5. It cannot replace a watch.
4. 1080p (codex): `render/tools/render_verified.sh 0 221.04 out/frames_v6_1080 1 3`, then encode. The cut has 5,305
   frames, 0..5304. Not yet looked at in 1080p: almost everything new this round (each report says which stills were).
5. Release extras still not made: thumbnails, a 15 s social cut, upload copies.

### Working method this round, and what went wrong
- **Usage limit:** nine image-heavy agents, four at a time, used the whole five-hour window in two hours and four
  were cut off mid-work for three hours. They resumed cleanly with SendMessage because they had written progress to
  disk, except that two had not yet started a report. Plan about six such agents per window, and make every agent
  write its report file before its first job.
- **Codex across the tmux wall** did the lyric videos, the verified render, the encode, the audits and the page
  media. It stops for approval before Chrome, network and GPU use; each command was read before approving. Its own
  render driver blocks `--resume` (`render/out/v6_bin/node`).
- **Do not undo:** everything in the Oct 8 morning block below still holds. New this round: `drawingAt` in
  `render/src/roto/index.js` (rate-changed takes hold drawings two film frames); the lyric helpers' new options in
  `_lib.js` (`reveal`, `ramp`, `fout`, `tail`); `Card.drawReveal` is gone; `render/tools/type_reveal_check.mjs`,
  `type_reveal_strips.py`, `roto_holds.mjs`.
- **Spend:** about 30 USD of video (log at 301 of the 380 cap) and about 10 USD of images.


## UPDATE, Oct 8 morning: second revision round, cut v5 (superseded by the block above)

### Where things stand
- **Cut v5** `render/out/fullcut_v5_540p.mp4` (frames `render/out/frames_v5_540/`, sheet `fullcut_v5_sheet.jpg`) holds
  every note from both rounds except the sung close-up at 1:22, which is made but not wired. v5 was rendered twice and
  all 5,305 frames matched. **Nobody has watched v5 at speed with sound**: every judgement so far is from frames and
  contact sheets. Jade is reviewing it now.
- **Jade's notes of Oct 8**, verbatim, with the shot and the outcome of each: second half of
  `docs/REVISION_NOTES_OCT7.md`. One report per job, each ending with what still falls short:
  `docs/reviews/rev2_{tea,toast,build,brk,ls,c2,hair,7B}_report.md`.
- **Git:** everything is committed on branch `round2-v5` and pushed; pull request #5 is open and mergeable. The
  session could not merge it (the merge was refused on the assistant's side), so Jade merges it. The working tree is
  still on `round2-v5`. After she merges: `git checkout main && git pull`. The repository is **public**.
- **Decisions page:** https://claude.ai/artifact/Hhnwakg7vSnB1h3MFEHaDp (private to Jade). Seven cards for this round
  (ids `r2_tea, r2_sung, r2_brk, r2_build, r2_ddr, r2_toast, r2_hair`), then the fourteen still open from round one.
  Read her answers with ArtifactData: `action: list`, collection `decisions` (empty when this was written). In round
  one she answered in the chat instead of on the page, so check both. Source: `release/review/decisions.html`; clips
  and stills are cut by `release/review/build_page.sh` into `render/out/rev_page/v5/` and published as `clips5/*` and
  `img/*` (the page's older `clips/part_N.mp4` are the v4 parts and serve as "before").

### What to do with each answer
| Card | If she chooses… | Then |
|---|---|---|
| `r2_tea` 0:45 | shorter hold | Retime only: the `rate`/`time` values in the 3.1 block of `03_verse2.js` (kiss lands 46.9, released 48.9 now). No new take needed. |
| | face further away / different movement | New take from `media/keyframes/jade/J_3.1.png` (v3). Takes 7 and 8 exist but their lean-in is too slow. Going back to `take_3` needs `J_3.1_v2.png` restored and roto prep + keep re-run. |
| `r2_sung` 1:22 | use the sung close-up | **Chosen and wired in round three** (`docs/reviews/rev3_face_report.md`): the 4.3 block of `04_hook.js` plays `LS3c/take_7pm` (the painted portrait with the take's mouth; anchors in `rev2_ls_report.md` §6). To rebuild the roto folder use `tools/ls_sung_prep.py LS3c/take_7 --portrait`, never `roto_prep.py` alone. Check the teeth at 1080p before calling it done. |
| | try once more | The method that worked: `pruna/p-video-avatar` on a 1.3× crop of the painted portrait with the isolated stem; measure with `tools/sync/viseme_check.py`. Seedance 2.5 does not sync to the file (it re-sings it). |
| `r2_brk` 1:56 | no face | `const FACE = false` at the top of `06_breakdown.js` (already rendered as `render/out/rev2_brk/breakdown_after_noface.mp4`). |
| | subtitles too | `release/subs/make_subs.py` line 54 (`L14b`), then regenerate; ask whether 举头 keeps "I raise my head". Her line breaks in the English follow the rhyme: do not reflow them. |
| `r2_build` 2:03 | richer drawing | `render/src/scenes/buildsite.js`: mounds, rabbits and landers are drawn by rule; the 7.A0 plate (slate, orange line) and the live scene (deep indigo, yellow gold) differ in paper. |
| | old montage back | The old A block is in git at commit `dee5b25` (`render/src/sections/07_drop.js`). |
| `r2_ddr` 2:28 | two real pads | New K_7.C2 keyframe (two hard white platforms as in her video) and take; submit through `tools/vgen_rev2_c2.py`, because the prompts in `tools/vgen.py` / `vgen_calls.py` still describe the toy dog. |
| | single mode on screen | `tools/ddr_screen.py` (`parse_chart('dance-double', …)` → the single chart), rebuild `SCR_ddr_c2`. |
| `r2_toast` 2:59 | wants the clink | Needs a side-on or front angle: two inner hands seen from behind cannot touch rims. Blockout with articulated hands: `render/scenes/blockouts/7.E1/toast.js`. |
| `r2_hair` 0:24 | lower the helmet | Edit `K_1.4b` so the thrown-back helmet sits behind her shoulders; new take. The emblem tool rebuilds `K_1.4a.jpg` from `K_1.4a_v3.jpg`: do not point it back at v1. |

After any change: lint, render the shot, look at it, then a full `render_verified.sh` pass and rebuild the page.

### Next, in order
1. Her answers (page and chat), then the fixes above.
2. A watch of the whole cut at speed, by a person or with a tool that can judge motion; the known soft spots are in
   each report's last section. The ones most likely to be noticed: the 1.6 s held kiss (0:47–0:49); four cuts in 3.2 s
   in the breakdown; 6.2c still for its last 5–6 frames; the 7.A2c tower cut is plain and 7.A3 holds on the landed
   lander; the fog in 7.B3 forms on the wrong port; the 7.C2 cut-in is under the old ink flash.
3. 1080p: hand it to codex. `render/tools/render_verified.sh 0 221.04 out/frames_v5_1080 1 3`, then encode (x264
   two-pass plus a high-quality master, AAC from `media/audio/moongazing_master.wav`). Before that, run the order
   check at full scale (the script is written for 0.5: change the viewport and `?scale=`). Not yet looked at in 1080p:
   6.2d (plays the take's 720p pixels), the sung close-up's teeth, the new montage's thinnest lines.
4. Release extras still not made: thumbnails, a 15 s social cut, upload copies (see "Known issues" further down).

### Rendering: what changed and what must not be undone
- v4's flashing words were frames saved with every 2D layer missing. Chasing it found that frames also depended on
  what the browser page had drawn before them. All fixed; the causes and the three checks are in the revision notes
  under "Render faults". In short: `render/tools/chrome_args.mjs` carries `--disable-accelerated-2d-canvas` (do not
  remove it); `Pipeline.layer` in `core.js` uses a CPU-backed canvas, commits its clear and wraps each layer in
  `save()`/`restore()`.
- Consequence for scene code: **a 2D layer no longer inherits any context state** from the layer before it. Set
  everything you need inside the layer's own draw function.
- The drop's HUD shadow is now scaled with the render size (`16 * ctx.S`), so 1080p matches 540p.
- Never `--resume` over frames from a run that logged errors; `render_verified.sh` starts clean on purpose.
- Use at most 4 workers at 540p; fewer at 1080p.

### Working method that held up this round
- **Codex across the tmux wall** (Jade's instruction: mechanical work goes to codex). Pane `moongazing:0.1`. Paste a
  self-contained job (`tmux load-buffer -b cx file; tmux paste-buffer -p -b cx -t moongazing:0.1; tmux send-keys -t
  moongazing:0.1 Enter`), ask it to append a `…_DONE` line to `render/out/v5_render.log`, and wait on that with a
  background loop that also ends when the pane shows "Would you like to run". It asks before network use (the video
  relay), before deleting and before launching Chrome. This session read each command and approved them singly, and
  allowed `node tools/render.mjs`, `node tools/order_check.mjs` and `bash tools/render_verified.sh` for codex's
  session; Jade was told. Codex also did the 7.B image edits and takes well (it has a free image tool).
- **Four Claude subagents plus one codex job at a time** ran for hours without reaching a usage limit. One agent per
  shot group, each owning named blocks of a section file, each writing its own report as it went.
- Subagents share the session's scratchpad directory and will overwrite files there: keep your own in a subfolder.
- `tools/ffcheck.py` rescores old takes against a changed keyframe; agents wrote the original scores back by hand.
- `docs/production_tracker.md` is generated and is stale for 7.A and 7.C2.

### Spend and private material
- About 22 USD of video and image generation this round (logged in `media/gen/spend.jsonl`; its video log stands at about 271 of the 380 cap).
- Never commit or upload: `inputs/rare_earth_ddr_sample.mp4` (Jade's family video; ignored since Oct 8),
  `release/audio/`, `media/`, `render/out/` (which holds `rev2_c2/ddr_screen_comparison.jpg`, a frame of that video).


## UPDATE, Oct 7 evening: revision round after v3 (read this before the older notes below)
Jade watched v3 and gave about thirty timestamped notes. They, the quality bar and the rules for the round are in
`docs/REVISION_NOTES_OCT7.md`. Reports: `docs/reviews/glitch_sweep_v3.md` (frame-by-frame sweep of v3, with a
"Systemic causes" section), `rev_7B_report.md`, `rev_lipsync_report.md`, `rev_sys_report.md`. Research written this
round: `docs/companion_isru.md`, `docs/companion_moon_experiments.md` §13–14, `docs/research_mission_assignment.md`,
`docs/research_capsule_interior.md`, `docs/technical_accuracy_notes.md` §4b (Earth from Guanghan).
- **Jade's open choices** are on a page with frames and clips: https://claude.ai/artifact/Hhnwakg7vSnB1h3MFEHaDp
  (her answers: ArtifactData, collection `decisions`). Rebuild its clips with `render/out/rev_page/build.sh`.
- **Cut:** `render/out/fullcut_v4_540p.mp4` (frames `render/out/frames_v4_540/`) is the first full render with the
  round's fixes. Nothing from the round is committed to git.
- **Facts fixed this round:** the Earth in every Moon shot is drawn by `render/src/scenes/earthview.js` (never an
  image model), full and south-up on the real sky of 2037-Sep-10 02:30 UT (breakdown) and 2038-Aug-30 08:00 UT
  (toast); on Mid-Autumn night the Earth is below the station's horizon, so the breakdown is fifteen days earlier and
  the rooftop is a moonless-night rehearsal. Launch about 8 Aug 2037; two crews of four; the capsule has no fairing.
  LS2 is retired; neither remaining sung close-up passed, so 4.3 is a non-singing reaction and 2.3 a rear view.
- **Engine additions:** roto `keep` (painted faces carried: `tools/roto_keep.py`), carried emblem patches
  (`tools/emblem_patch.py` + `.json`), `rate`/`time`/`rect`/`fill`/`tear` roto parameters, `papertype` scene
  (text on tracked paper, 3.5), `tools/roto_prep_rubbing.py` (takes on rubbing paper). **Re-running
  `tools/roto_prep.py` on a take wipes keep/emblem/paper data written into its roto folder: re-run those tools after.**
  A keyframe newer than its roto folder silently drops the shot back to a still. `vgen.submit(over={'image': …})`
  records the wrong keyframe in the sidecar: check `keySource` in the roto `meta.json`.
- **Still to do:** emblem patch for 7.B1, 7.B3 and 5.1 (one entry each in `tools/emblem_patch.json`); whatever Jade
  decides on the page; an end-to-end watch of v4 at speed (agents judged from frames and contact sheets only); then
  1080p. Known soft spots are listed per shot in the reports and on the page.
- **Limits:** thirteen Claude subagents at once exhausted the session limit in an hour; three codex jobs at once
  exhausted codex in 25 minutes. Keep to 3–4 subagents and 1–2 codex jobs.

---
(Notes from before the revision round follow. "First thing tomorrow" below is superseded by the update above.)

Read this first when resuming. Then: `docs/script.md` (v1.2 + revision notes at the top), `render/README.md`
(engine, sections, lint, render commands, "State at end of day"), `docs/production_tracker.md` (every shot → keyframe,
method, chosen take, lag), `media/gen/picks.json` (video picks).

## Where we are
- **Full cut v2** (540p, 0–221.04 s, master audio): `render/out/fullcut_v2_540p.mp4` + `fullcut_v2_sheet.jpg`,
  published on the review page (v3 rendered, unpublished — see below): https://claude.ai/artifact/Pi1WHZRinw2XdG4APpu6oW (newest section on top).
- **All video generation is done.** Every shot has a pick in `media/gen/picks.json`; spend ≈ $171 video + ≈ $50 images
  (Cloudflare balance was $500). Spend log: `media/gen/spend.jsonl`.
- **Audio master:** `media/audio/moongazing_master.wav/.mp3` (216.000 s; 0–210.000 s bit-identical to the original; last
  note decays naturally to silence by 215.8 s). Copy for release: `release/audio/Moongazing_master.mp3` (not in git).
- **Subtitles:** `release/subs/` (zh-en, en, zh as SRT/VTT; `make_subs.py` regenerates; Jade's edits applied:
  冬柳身纤细 / 丝素净笔直).

## First thing tomorrow
1. **v3 540p is already rendered but NOT yet reviewed or published**: `render/out/fullcut_v3_540p.mp4` + sheet. It wires
   the newest picks: LS1 take_24 (stays 3/4 for all of 2.3, no cutaway; uses the take's own mouth because face tracking
   only locked on 13/193 frames — check lip-sync by eye), J_3.1/J_3.2, J_3.7 + close, K_7.B1 + close (INK).
2. Watch v3 end to end (Jade wants a fresh look) → fix anything → publish to the review page → Jade's notes.
   If re-rendering: ≤6 workers (10 caused silent missing layers); commands in render/README.md "State at end of day".
3. After notes: **1080p final** (render frames, then hand encoding to codex: x264 two-pass + a high-quality master;
   AAC from `media/audio/moongazing_master.wav`).

## Decisions still open (Jade)
- **Picture credit wording** (credits card): currently names method/tools ("Picture — drawn in ink, silk and gold by
  JavaScript, over keyframes made with GPT Image and Nano Banana Pro, and motion from Seedance and MiniMax"),
  following Orbital Sunrise / Rare Earth. Alternative: "Video by Jade Wang with Claude (Anthropic) and Codex (OpenAI)".
  Editable strings `PICTURE_CREDIT` / `PICTURE_CREDIT_ZH` at the top of `render/src/scenes/colophon.js`.
- **Translations:** Jade is still reviewing `release/subs/` (line breaks in her English follow the rhyme scheme —
  don't "fix" them).
- **Sagan line** at the pullback ("That's here. That's home. That's us." — Pale Blue Dot, 1994): now quieter; Gemini
  called it heavy-handed; keep unless Jade objects.

## Known issues / polish backlog
- Chen Yu looks younger in K_7.C4b/d than elsewhere (age ~48) — fix in redraw or re-edit keyframes.
- K_7.B6: mounds read slightly igloo-like (mitigated by darkness + JS window lights).
- 廣寒 / 望月 seals: traced from public-domain Shuowen seal forms — have a seal-script reader check 廣, 寒, 望.
- Gemini review (`docs/reviews/gemini_fullcut_v1.md`, scores 7.2/7.5): items verified and fixed in v2 (opening hook,
  type size, capsule face, hug smear, grain, Sagan). Unverified/declined: "hands/teeth uncanny" (minor), "montage drifts
  off downbeats 0:58–1:06" (lint says cuts are on beats — spot-check on v3).
- Release extras not yet made: thumbnails (4K/1920/1280 like Rare Earth), a 15 s social cut (suggested 15.67–30.57 or
  17.54–32.42), YouTube/X upload copies.
- Disk: `render/out/frames_*` folders (~3.8 GB total in render/out) can be deleted after v3 renders.

## Process lessons (carry forward)
- Seedance 2.5 does **not** hold the first frame (recomposes; sometimes outputs 21:9/9:16). Use **h3 or Seedance 2.0**
  for keyframe-locked shots; use 2.5 only for lip-sync (needs `reference_audios` + `use_virtual_avatar`). Score every
  take with `tools/ffcheck.py`.
- Jade's mouth on lip-sync shots is drawn from the vocal stem (`tools/sync/`, `render/src/roto/mouth.js`); eyes come
  from the painted keyframe (Seedance shrinks eyes). Gold-paper roto loses detail — prefer keyframe plates on GOLD.
- Jade likeness: only via codex painting over her real photos at the matching camera angle (see `docs/` + memory).
  Never trace the kids' real faces; repaint M/T from sheets.
- One focal point per shot (global rule in `docs/style_guide.md`).
- Never launch codex with sandbox-bypass flags (it tripped the auto-mode classifier); use `-s workspace-write`.
- Keep render workers ≤6.

## Where things live
- Keyframes: `media/keyframes/` (Jade: `media/keyframes/jade/`), sheets `SHEET_EARTH_v7.jpg`, `K_7.C4_v5_SHEET.jpg`,
  `media/guanghan/CONSISTENCY_SHEET.jpg`. Characters: `media/chars/` + `docs/character_bible.md`. Identity:
  `media/chars/identity/` + `docs/identity.md`. Moonbase canon: `docs/guanghan_layout.md` + `render/scenes/guanghan3d/`.
- Research/companions: `docs/companion_moonbase_designs.md`, `docs/companion_moon_experiments.md` (incl. PRIME-1 /
  TRIDENT), `docs/technical_accuracy_notes.md`, `docs/visual_research.md`, `docs/research_*.md`, audits
  `docs/audit_claude.md`, `docs/audit_codex.md`.
- `media/` is gitignored (6.1 GB); `inputs/*.png|*.MOV` (Jade's private reference photos) are gitignored.
