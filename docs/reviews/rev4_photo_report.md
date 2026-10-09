# rev4 PHOTO: shot 4.3 at 1:21.5–1:22.9, "looking at a picture of the kids", 8 October 2026 (night)

Status: DONE, wired, lint OK, not committed. Nothing here was watched at speed with sound: every judgement is from
frames, strips of consecutive frames and measurements.

Clip: `render/out/rev4_photo/photo.mp4` (1:19.0–1:25.0, half scale, the song under it).
Frames to re-render: **1956–1989** (34 frames). The other 110 frames of the passage are byte-identical to v6.
Evidence: `render/out/rev4_photo/evidence/`; 1080p stills `render/out/rev4_photo/stills/s_081.600.png`, `s_082.800.png`.

## What Jade asked (verbatim)
"it's pretty bad, and I'm not fond of the non-singing shot either. It makes more sense to do a shot of me looking
longingly at a picture of the kids without singing."

## What v6 shows (found first)
Frames 1956–1989 of `render/out/frames_v6_540/` (`evidence/v6_neighbours_1925_1968_2005.jpg`). A frontal gold-line
close-up of her face in the helmet, mouth open, singing 我思念, on indigo; the face fills the middle of the frame and is
the only thing to look at. The earlier non-singing version (`J_4.3/take_1`) is the same frontal portrait with the mouth
closed. Both make her face the focal point, which the Oct 7 rules say to avoid.

The film already has the photograph: shot 3.8f at 1:14.8–1:16.1 (`K_3.8f_visor`, seven seconds earlier) ends on her
helmet turning to a small snapshot of M and T taped below the round window. There the children's faces are soft blurs
and the picture is a tenth of the frame wide.

## The shot now
The sequel of 3.8f, close. From behind her left shoulder in the capsule seat: helmet on, visor down and clear, glasses,
mouth closed. Her eyes are lowered to a snapshot of M and T taped to the cabin wall below the window, and her head
tips about a degree toward it, steadily, through the whole shot. The snapshot is the only warm colour in the frame.
She does not sing. 我思念 is brushed at the left as before.

Decisions I took, and why:
- **Where the photograph is.** Taped to bare structure below the window, where 3.8f put it. Nothing is held: a crew
  member under acceleration keeps her arms down. No hands in frame (nothing for a model to get wrong).
- **How much of her.** Near-profile seen a little from behind, at left-centre; the snapshot at the right, in the line
  of her eyes, 15 % of the frame wide (1.5 times its size in 3.8f), both children's faces clear.
- **Her likeness** comes from her own photograph `refs_768/PXL_20260929_003045414.jpg` (the one behind 3.6e: seen
  from behind her left shoulder, eyes lowered to the right, mouth closed), painted over by codex in two passes. No
  other model touched her face.
- **Look.** I chose the look of the 3.8 montage (gold line on indigo, the suit chalk-white with azurite panels, her
  face a flat pale wash with a few lines), not the line-only gold of the old 4.3, because this shot continues 3.8f.
  **The snapshot carries soft colour** and is the brightest, warmest thing in the picture; the focal vignette is
  centred on it (`focus: [1560, 630]`).
- **The children** are painted from their sheets only (M: side braid, pink elastic, curly tail, strawberry dress;
  T: sheet v3, full cheeks, dark hair, grey T-shirt), the same two outfits as the blurred snapshot in 3.8f.
- **Type lines: not touched, not moved.** 我思念 stays at x 290, y 110, size 180. I made room for it instead: the
  painting was extended 248 px to the left (seat and dark wall), so the column stands on the dark headrest about
  70 px clear of the helmet at 1080p (`stills/s_082.800.png`). The HUD line is unchanged.

## How it was made
1. Snapshot picture: `tools/cf.py google/nano-banana-pro` from the two sheets (`kids_snapshot_nbp_v1.jpg`).
2. Scene: codex `image_gen` (under the shared lock), inputs `K_3.8f_visor.jpg` (style, cabin, helmet, suit), her
   photograph (edit target for the head), the suit sheet, the snapshot picture. `photo.txt` -> `photo_cdx_v1.png`.
   Composition right; her face came out like a photograph (shaded, grained, older).
3. Face finish: codex again, with `J_3.6e.png` as the approved finish of the same face from the same photograph.
   `photo_face.txt` -> `photo_cdx_v2.png`: flat pale face, a few fine lines, nothing else moved.
4. Checked against the sheets: codex had put M's braid and tail on her left; the sheet has them on her right. The
   picture on the print was mirrored in place (`flip_print.py`), so the girl is now at the left of the print.
5. Room for the lyric: outpainted margins (nano-banana-pro), registered to the painting and joined with a 14 px
   feather (`outpaint_join.py`); every pixel of her head, suit and the snapshot is still the codex painting.
   -> `media/keyframes/jade/J_4.3p.png` (1920 x 1080). All of this is written up in
   `media/keyframes/jade/PROMPTS_J43P.md`; work files in `media/keyframes/work/rev4_photo/`.
6. Keyframe checks (Oct 7 rule 4): no hands in frame; one person; eyes on the snapshot; glasses; hair inside the
   helmet, none across the rim; pale-blue-dot patch on the left chest; no red except the strawberries in the print.
7. Video: three h3 takes, 768P, 4 s (`tools/vgen_rev4_photo.py`), 0.96 USD.

| Take | Prompt | Verdict |
|---|---|---|
| `J_4.3p/take_1` | head tips toward the snapshot, a breath, the cabin trembles | **Picked.** Head and helmet tip steadily from frame 8 to 48 (18 px, 0.8–1.3°), mouth closed, glasses hold, the children on the print do not move. Looked at as every frame 12–47 (head; snapshot) and every second frame 10–48 (whole). The model read "trembles" as shaking the whole picture, up to 5.6 px per frame. |
| `take_2` | same | Clean; her head moves 3 px in the first two seconds. Alternative. |
| `take_3` | a bar of light from the window slides over the wall | Rejected: a photographic cone of light. |

8. The shake had to come out before roto: with it, the motion mask covered 85 % of the frame and the walls would
   have been redrawn and boiled. New tool `tools/take_steady.py` measures each frame against frame 0 on the wall and
   seat and removes the motion exactly (residual 0.3 px) -> `take_1s`. After `roto_prep` the mask still covered 75 %
   (the model lets the wall's gold lines shimmer), so a second new tool, `tools/roto_only.py` (the opposite of
   `roto_force.py`), limits the redraw to her figure: the cabin, window and snapshot are the painting in every frame.
   Her painted face rides on the head's tracked motion (`tools/roto_keep.py`, one region), so eye, glasses and lips
   are the painting in every frame.
9. Wired: `render/src/sections/04_hook.js`, the 4.3 block only (comment, shot header `focus`/`vignette`, scene). Take
   time 0.5–1.92 s, rate 1, `lock: 0`, drawn on twos, slow push 1.02 -> 1.05 toward the snapshot. Lint OK.

Rebuild order (also in `media/gen/picks.json` under `J_4.3p`): `take_steady.py` -> `roto_prep.py J_4.3p/take_1s` ->
`roto_only.py` -> `roto_keep.py`. Re-running `roto_prep.py` wipes the last two.

## Checked in the render
- Both passes of 1:19.0–1:25.0 byte-identical (144 frames). One pass lost 50 frames of the next shot to
  `ERR_INSUFFICIENT_RESOURCES` while other agents were rendering; refilled with `--resume` and compared again.
- Against v6: frames 1896–1955 and 1990–2039 identical; 1956–1989 new.
- Every frame 1956–1989, head region (`evidence/render_head_every_frame_1956_1989.jpg`); first three frames and
  both cuts (`evidence/render_cuts_1954_1990.jpg`); face at native 1080p at four times
  (`evidence/render_face_1080_native.jpg`): profile, glasses, lowered eye and closed lips the same drawing throughout.
- Motion of her face against the snapshot: 12 px at 540p over the 34 frames, never a frame without movement
  (median step 0.9 px). No frozen start: the take is cut in at 0.5 s with the tip already under way.
- The three frame-difference spikes (1956, 1971, 1983) are the hook's existing paper jolt on each sung character
  (`punch`), unchanged from v6.

## Files
- New: `media/keyframes/jade/J_4.3p.png`, `media/keyframes/jade/PROMPTS_J43P.md`, `media/keyframes/work/rev4_photo/`,
  `media/gen/J_4.3p/` (takes 1–3, `take_1s`, roto), `tools/vgen_rev4_photo.py`, `tools/take_steady.py`,
  `tools/roto_only.py`, `render/out/rev4_photo/`.
- Changed: `render/src/sections/04_hook.js` (4.3 block), `media/gen/picks.json` (`J_4.3p`), `docs/script.md` (row 4.3).
- No change to `_lib.js`, `core.js`, `type.js`, `src/roto/` or any other tool. Old takes (`LS3c/take_7pm`,
  `J_4.3/take_1`) are untouched.
- Spend: video 0.96 USD of the 8; images 0.27 USD; two codex image jobs.

## What still falls short
1. **Not seen at speed.** 1.4 s is short for two things to read (her, then the picture). In stills the eye goes to
   the snapshot first, which is the intent; whether her look registers in time needs watching.
2. **Visor.** Here it is clear and closed, so her eyes show. Seven seconds earlier (1:15) the same visor is drawn
   as opaque gold coming down. It is one helmet drawn two ways.
3. **The snapshot is not the same drawing as at 1:15.** There the boy is at the left and the faces are blurs; here
   the girl is at the left (mirrored to match her sheet) and the faces are clear. 1:15 was not touched.
4. **No capsule vibration and no blink.** The model's shake was removed and nothing was put in its place; her eye is
   the painting, so it cannot blink. What moves: her head and helmet, her shoulder, the slow push, the type jolts.
5. **No comms cap.** The character bible gives the launch suit a blue comms cap; her hair is drawn back and shows
   inside the helmet, as it did in the old 4.3.
6. **Roto line.** Along the helmet shell and neck ring the redrawn gold contour sometimes runs double, as it does in
   the 1:12–1:16 shots. A soft edge shows under her chin in the last frames at 1080p.
7. **HUD.** `MAX-Q · 3.2 G` stands five seconds after ignition, with pre-dawn sky in the window. It was there in v6;
   it is TYPE's line and I left it.
8. The margins left of the helmet and 70 px top and bottom are nano-banana-pro's outpainting, not codex's painting.

## For Jade
**1:21.5–1:22.9 (我思念).** The sung close-up is gone. You are now seen from behind your left shoulder, strapped in,
visor down, mouth closed, looking at a snapshot of M and T taped below the window; your head tips a little toward it.
The snapshot is the only warm colour in the picture. It is the same photograph your helmet turns to at 1:15, now
close enough to see their faces.

- Clip (1:19–1:25, with the song): `render/out/rev4_photo/photo.mp4`
- Frames re-rendered: 1956–1989. Representative frames: `render/out/rev4_photo/frames/f_001960.jpg`,
  `render/out/rev4_photo/frames/f_001985.jpg` (full size: `render/out/rev4_photo/stills/s_082.800.png`).
- Falls short: not yet watched at speed; your visor is clear here and gold at 1:15; the snapshot at 1:15 is a
  blurrier, differently arranged drawing of the same picture; the cabin does not shake and you do not blink.

Choices that are yours:
1. **Is the profile you?** It is painted from one photograph of you (at your desk with the headphones, from behind).
2. **Visor.** Clear, so your eyes show (as it is), or gold as at 1:15, which hides your face entirely. If clear stays,
   1:15 could be repainted to match.
3. **Which picture of the children.** Now: M in the strawberry dress, T in a grey T-shirt, heads together, any
   day. The next shot is the splash park: the snapshot could instead be from that day (T's creeper shirt, wet hair),
   so the cut reads as the photograph coming alive. That would also mean repainting the snapshot at 1:15.
