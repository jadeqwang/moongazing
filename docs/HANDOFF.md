# 望明月 · Moongazing — Handoff (end of day, Oct 7 2026)

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
