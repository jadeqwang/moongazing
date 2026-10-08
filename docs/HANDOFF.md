# 望明月 · Moongazing — Handoff (Oct 8 2026)

## UPDATE, Oct 8 (written at hand-over): second revision round, cut v5 — read this first

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
| `r2_sung` 1:22 | use the sung close-up | Paste `docs/reviews/rev2_ls_block_4.3_sung.js` over the 4.3 block of `04_hook.js` (`CLIP` = `LS3c/take_7m`, anchors in `rev2_ls_report.md` §6). To rebuild the roto folder use `tools/ls_sung_prep.py LS3c/take_7`, never `roto_prep.py` alone. Check the teeth at 1080p before calling it done. |
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
