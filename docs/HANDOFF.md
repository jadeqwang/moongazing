# 望明月 · Moongazing — Handoff (end of day, Oct 7 2026)

## UPDATE, Oct 8: second revision round, cut v5 (read this first)
Jade watched v4 and gave twelve more notes; all are carried out in `render/out/fullcut_v5_540p.mp4` except the sung
close-up at 1:22, which is made but waits for her choice. Her words, the shot each maps to and the outcome are in the
second half of `docs/REVISION_NOTES_OCT7.md`; one report per job in `docs/reviews/rev2_*_report.md`.
- **Decisions page** (same link, rebuilt for this round, before/now clips by timestamp):
  https://claude.ai/artifact/Hhnwakg7vSnB1h3MFEHaDp. Her answers: ArtifactData, collection `decisions` (ids `r2_*` are
  this round). Page source and its build script: `release/review/` (`build_page.sh` cuts the clips and stills).
- **Rendering is now verified.** Use `render/tools/render_verified.sh` for any full render (every frame twice, compared),
  and `node tools/order_check.mjs …` after touching the engine. The faults behind the flashing words are listed in the
  revision notes ("Render faults"). `render.mjs` launches Chrome with `--disable-accelerated-2d-canvas`: do not remove it.
- **New in the engine:** `scenes/buildsite.js` (the 7.A build, drawn live from `guanghan3d/layout.js`),
  `tools/ddr_screen.py` (the game screen in 7.C2), `tools/ls_sung_prep.py` (sung close-up prep; not `roto_prep.py`
  alone), `tools/roto_prep_rubbing.py --black-floor`, `tools/sync/viseme_check.py`.
- **Open with Jade:** the seven `r2_*` cards on the page (teahouse hold and her face in the turn; sung close-up or not;
  face shot and subtitles at 1:56; montage direction; single mat vs two pads; the lost clink; helmet over the hair
  knot), then the cards still open from round one.
- **Still to do after her answers:** an end-to-end watch at speed, then 1080p (codex: `render_verified.sh` at scale 1,
  x264 two-pass + a master). Not yet checked at 1080p: 6.2d (plays the take's pixels), the sung close-up's teeth.
- **Working with codex across the tmux wall** (pane `moongazing:0.1`): paste the job with `tmux load-buffer` /
  `paste-buffer -p`, then watch for its approval prompts; it asks before network (video relay) and before deleting.
- **Private, never commit or upload:** `inputs/rare_earth_ddr_sample.mp4` (family video; git-ignored since Oct 8). The
  repository is public.


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
