# Moongazing — lip-sync audit and repair, 7 October 2026

The independent audit found audio-referenced Seedance generation upstream for both shots. The delivered v3 cut does not preserve that performance in both cases: **LS1 shows a weak Seedance mouth simplified by roto; LS3 replaces the entire performance with a JS mouth on a still.** None of the existing visible sung close-ups meets the director's bar. LS2 was already retired and received no work or spend.

The audit evidence below is complete. The LS1 rear-view fallback was collected, checked, wired and rendered by a second agent after the first was cut off (section "LS1 fallback", second half).

## Audit verdict and provenance

The subagent audited LS1 takes 1–28, LS3 takes 1–14, their submitted specs and sidecars, their references and synchronization data, and the unchanged `render/out/fullcut_v3_540p.mp4`. Its full findings and visual ranking are in `render/out/rev_ls/audit_raw/findings.md`; the machine-readable evidence is `provenance.json`, `audio_provenance.json` and `shot_window_lags.json` in that folder.

All reference MP3s were checked against the decoded isolated vocal stem and full mix. Stem correlations are **0.9995–0.9998**, versus **0.59–0.72** for the full mix, with the maximum at **zero sample lag**. The refs genuinely contain the isolated voice. MP3 encoder delay is handled by gapless decoding; it does not explain the failed performance.

| Group | Model and requested resolution | Reference / duration | Returned duration and relevant framing |
|---|---|---|---|
| LS1 1–5, 10–14 | Seedance 2.5, 480p | Stem 39.230–47.230, 8 s | 193 frames / 8.042 s; t11 is 992×432 |
| LS1 6–9, 15–18, 21–26 | Seedance 2.5, 720p | Same | t6/8/9/25 are 1470×630; chosen t24 is 1280×720 |
| LS1 19/20/27/28 | Seedance 2.0-mini, 720p | Same, singular `reference_audio` input | These four tests were not Seedance 2.5 |
| LS3 1–3 | Seedance 2.5, 480p | Stem 79.340–87.340, 8 s | 193 frames; t3 is 992×432 |
| LS3 4/5 | Seedance 2.5, 480p | Stem 76.860–86.860, 10 s | 241 frames / 10.042 s |
| LS3 6–9 | Seedance 2.5, 720p | Same 10 s ref | t7 is 1112×834; t8 is 720×1280 portrait |
| LS3 10/11 | Seedance 2.5, 720p | Stem 76.860–83.860, 7 s | 169 frames / 7.042 s, 1280×720 |
| LS3 12–14 | Seedance 2.5, 720p | 0.5 s silence then stem from 81.464; effective origin 80.964, 5 s | 121 frames / 5.042 s, 1280×720 |

The input specs all have `generate_audio:false` and `use_virtual_avatar:true`. The extra endpoint frame is normal video endpoint behavior. There is no wholesale reference-duration mismatch. Reframing is real and sometimes severe despite the requested resolution and locked-camera prompt.

### LS1 / shot 2.3 / 39.531–43.155

V3 uses `LS1/take_24`, Seedance 2.5 at 720p with the stem as reference. It was prepped with **`remouth:false`**: its bad timing is not caused by `mouth.js`. The mouth's articulation is already wrong in the raw source. The plain prep tracks faces in only **13/193 frames** and then flow-filters, smooths and sparsely redraws the mouth; the 12 fps held drawings further remove nuance. The grandmother is frozen upstream because the prompt explicitly says **“Her mother beside her stays still, looking at the lake.”** Motion masks then retain that region as a painting.

At the stored +0.252 s placement, the mouth is narrow or pursed during most of “over” (**41.208–41.583**, source frames 54–63). The large vowel opening arrives **41.667–41.917**, during “water.” The source continues changing/opening its lips at **42.500–43.125**, during the repository's **42.260–43.155** phrase gap. The stem is below −57 dB RMS at 42.6–42.9 while the mouth is still visibly performing. The gap reopening cannot be repaired by one time shift.

The stored measurement incorrectly spans the old 39.53–45.98 close-up plan. On the actual shot window, `measure.lag_scan` gives **+0.190 s / score 0.271**, versus stored **+0.252 / 0.255**. These are weak compromise peaks, not proof of phonetic alignment. The interrupted agent's newer `take_24f` has 193/193 face hits but preserves the same inadequate performance.

Existing-take visual ranking, all below the delivery bar: **t1** (best raw vowel modulation, 480p); **t25** (clearer articulation but wide reframing and gap failure); **t21, t18, t16** (better oral movement but head turns / continued gap singing); **t12, t4, t11**; **t23, t24, t26** (stable angle prioritized over words); then the remaining weak/reframed/mini-model takes. The complete tiered ranking and exclusions are in the independent findings.

### LS3 / shot 4.3 / 81.464–82.880

Seedance 2.5 with stem reference was genuinely generated, but **v3 does not show any of its performance**. `singer.js` calls `plate.draw` on `J_LS3`, washes away the painted lips, and calls `drawMouthPts` at song time. `mouth_track.py` supplies loudness/exposure-sheet openness and rounding; the drawing has those two continuous controls and no jaw, cheek, chin, eye, brow or suit deformation. The result is an isolated oval/slit over fixed anatomy. Camera vibration and parallax move a rigid still. This is a renderer/design failure; no Seedance lag adjustment can fix a take that never reaches the screen.

The newer interrupted-agent wire is t13 (+0.300 s), with its own mouth retained. It is better than v3, but fails visual review: at the measured +0.377 placement the sequence roughly rounds for 我, narrows for 思 and opens for 念, then generates bright tooth blobs that become a row at **82.625–82.875**, raw frames 49–55. The jaw and chin barely participate. T12's “good” score 0.533 at −0.290 has nearly unchanged lips until late 思. T14's score 0.504 at −0.790 has almost no relevant articulation and would clamp to frame zero for about **0.29 s** at the start. Both scores are false reassurance.

Existing-take visual ranking: **t13** (strongest gold-style phrase, tooth morph fails); **t3**, **t5** (more anatomical singing but flesh/photographic rendering changes the painted face); **t8/t9**; **t4/t11**; **t10/t1/t6/t7**; **t2/t12/t14**. No visible singing candidate earns approval.

## Repair decisions and verification

### New LS1 auditions

Ordered two Seedance 2.5 720p 8 s takes, **LS1/take_29 and take_30**, with only the existing painted `J_LS1` as image input, the clean stem as reference, avatar enabled, audio generation disabled, fixed framing, explicit rest after “water,” and continuous mother/hand/hair/breath motion. Their submitted specs contain no photo/reference-image inputs. The `vgen.submit` sidecar helper initially copied the unoverridden default photo-reference list into their metadata; that sidecar field was corrected to `[]` to match the actual submitted specs.

The raw takes were inspected before any roto. Both preserve 1280×720 output; first-frame fidelity is t29 **0.805 / 17 px shift** and t30 **0.761 / 20 px**. T29's measured lag is **+0.3042 s / 0.298**, with more believable rounding on “over” but lip motion across every gap frame. T30's lag is **+0.1062 / 0.208**, ambiguous; the water jaw opening arrives **41.833** (about **0.240 s late**) and the first confident lip rest is **42.667** (about **0.407 s late**). The final reference score cannot repair those separate events. Both were rejected and their sidecars record the evidence. They were not wired or roto-prepped.

### LS1 fallback

The built-in ImageGen tool restaged `J_LS1` as a wider rear three-quarter boat memory, using the grandmother's canonical winter sheet. The old painting was preserved. New asset: **`media/keyframes/jade/J_LS1_back.png`**. Jade's face and mouth are hidden by her rear-facing head and hair; the visible glasses arm, existing teal coat, scarf, boat, geography, palette and painting remain derived from the existing keyframe. Her mother's winter beanie and plum coat come from `media/chars/grandma_V/SHEET.jpg`. No new Jade face was invented.

The animation uses the isolated vocal reference `media/gen/LS1_back/ref_vocals_38.900_5s.mp3` with Seedance 2.5 at 720p, `generate_audio:false`, `use_virtual_avatar:true`, and no extra image refs. Both women are prompted to breathe and shift continuously; heads must stay away from camera. 
**Completed (second agent, after the cut-off).** Both takes came back (`vgen.py collect LS1_back`; 121 frames, 1280×720, 5.04 s each) and were checked before roto on 12-frame contact sheets and with a per-region optical-flow measurement (median flow per 0.5 s window, native pixels):

| Take | Jade | Mother | Hand on rail | Far shore (camera) | Verdict |
|---|---|---|---|---|---|
| take_1 | 0.6–1.8 | 0.4–2.0 | 0.5–1.6 | 0.1–0.3 | Passes; second choice: large star-shaped glints appear on the water (frames 44–90) |
| take_2 | 0.3–1.5 | 0.1 in the first 0.5 s, then 0.4–2.3 | 0.1–1.5 | 0.1–0.4 | **Picked.** Clean water; cut in at 0.75 s so the mother is already moving |

In both takes the two heads stay turned away for the whole clip (no face is invented), there is one five-finger hand on the rail and it stays in place, no limb appears or disappears, the camera holds (travel 1.9 px in take_2) and nobody is frozen. Verdicts are in the sidecars.

- Prep: `roto_prep.prep('LS1_back/take_2', remouth=False)` with the MPY interpreter; 0 faces found in 121 frames, which is the point of the staging. Pick added to `media/gen/picks.json` as `LS1_back`.
- Wiring (`render/src/sections/02_verse1.js`, the 2.3 block and one `LSB` constant above it): `{ type: 'roto', clip: 'LS1_back/take_2', paper: 'silk', offset: 0.75, lock: 0, mouth: false, subject: false, maskGain: 8 }`, slow push 1.03 → 1.07. The shot runs the whole line 39.53–43.16 s with no cutaway. The lyric stays top-left in the sky and the 西湖 inscription at x 620, both clear of the figures (they sit right of x 1100). Removing the `LS1_back` pick restores the old close-up path.
- Lint: `OK` (123 shots). Render: `cd render && node tools/render.mjs --frames 39.53-43.16 --workers 2 --scale 0.5 --framedir out/rev_sys/frames_2.3`, then `--encode` to **`render/out/rev_sys/2.3_boat_back_540p.mp4`** (frames f949–f1035, master audio). Sheet: `render/out/rev_sys/sheets/2.3.jpg`.
- Looked at: 12 frames across the shot including f949 (first) and f1035 (last), plus a 2× crop of the two women at six times. The shot opens already moving, both women shift and breathe, hair edges and water move, the redraw holds the hair, glasses arm, beanie and coats without fringes or doubled contours.

What falls short: (1) it is not a sung close-up; the line is carried by the voice and the type. (2) Jade's hair in `J_LS1_back` reaches the small of her back where she sits, a little longer than the "mid-back" rule; it was not repainted. (3) One or two single-frame white specks appear on the water (f957, f972), small at 540p; check at 1080p. (4) Her mother's face is a sliver of cheek only, by design.

### LS3 fallback, verified

**Now wired: `J_4.3/take_1`**, an existing Seedance 2.0 720p **non-singing** launch reaction generated from the existing `J_LS3` painting. The calligraphy carries 我思念 over her braced face and the cut leads to the children. This is the brief's non-singing g-load fallback, not a claim of successful lip-sync.

Prep used `MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python`, `roto_prep.prep('J_4.3/take_1', remouth=False, eyelock=False, alpha=0.75)`. The section uses **offset 0.55, lock 0, mouth false, eyelock false, redrawAll 1, twos false**. Whole-performance redraw avoids freezing skin/eyes/suit behind a motion threshold. Raw movement begins before the cut; no keyframe dissolve or frame-zero hold remains.

Rendered every 24 fps frame at half scale with two workers and master audio. Both coordinator and subagent inspected the face pages and full-context frames. The natural blink is visible at **81.917–82.000**, global **f1966–1968**, reopening at **82.042/f1969**; small head, neck and shoulder displacement survives. Lips remain at rest through 我/思/念 with no artificial opening or tooth morph. The first three in-shot frames **f1956–1958** and the cut at **f1990** were inspected. This replacement meets the visual bar for a non-singing reaction at the reviewed 540p scale. It deliberately gives up the sung close-up.

## Evidence paths and reproduction

All video and sheets are local repo artifacts, not uploaded. The immutable v3 cut was used as the before reference.

| Evidence | Paths |
|---|---|
| V3 LS1 mouth, every 24 fps frame | `render/out/rev_ls/audit_raw/v3_LS1_mouth_p01.jpg` through `p04.jpg`; `v3_LS1_full_overview.jpg` |
| V3 LS3 mouth, every 24 fps frame | `render/out/rev_ls/audit_raw/v3_LS3_mouth_p01.jpg`, `p02.jpg`; `v3_LS3_full_overview.jpg` |
| All old raw takes | `render/out/rev_ls/audit_raw/LS1_take_N_mouth_pNN.jpg`, `LS3_take_N_mouth_pNN.jpg`; timestamped individual crops under `frames/` |
| Key old failures | `LS1_take_24_mouth_p02/p03/p04.jpg`; `LS3_take_13_mouth_p02.jpg`, all in `audit_raw/` |
| New rejected LS1 takes | `render/out/rev_ls/repair/raw_LS1_t29_p01.jpg` through `p04.jpg`, and corresponding `raw_LS1_t30_*`; raw full-face 16-frame sheets `LS1_t29_face.jpg`, `LS1_t30_face.jpg` |
| LS3 before-roto fallback check | `render/out/rev_ls/repair/J43_t1_face.jpg` |
| LS3 final face / whole scene | `render/out/rev_ls/repair/final_LS3_face_p01.jpg`, `p02.jpg`, `final_LS3_face_full.jpg`; frame mapping `final_LS3_face.json` |
| LS3 rendered clip with master audio | `render/out/rev_ls/LS3_verified_540p.mp4`; frames `render/out/rev_ls/final_ls3_frames/` |
| Spend evidence | `render/out/rev_ls/repair/session_spend.json` and matching entries in `media/gen/spend.jsonl` |

Raw sheets are labelled with song time, source-frame index and active syllable. The CJK font was visually verified. Labels follow `analysis/lyrics_timing.json`: 我 81.464, 思 82.125, 念 82.585, 你 83.266; the metadata itself shows timing uncertainty against alternate alignment. Numerical openness correlation is treated as a diagnostic, never as approval of a viseme sequence.

Final sheet helper: `render/out/rev_ls/repair/review_frames.py`. Render commands are run from `render/`, with `--scale 0.5 --workers 2`; `--encode` attaches sample-aligned master audio. The LS1 command is in the "LS1 fallback" section; lint printed OK after the 2.3 edit.

## Dollars spent

This run has submitted **$6.0112** in list-price-estimated video generation: t29/t30 **$3.6992**, rear-view LS1_back t1/t2 **$2.3120** (both collected; the second agent spent nothing more on LS1). Built-in ImageGen had no `vgen` video charge. The pre-existing LS3 fallback costs this run **$0**. No LS2 generation was ordered. The audit subagent spent **$0**. The estimate comes from the spend log; it is not a newly queried provider invoice. Queue outcome: both LS1_back jobs finished and were collected; nothing is pending for the lip-sync work.
