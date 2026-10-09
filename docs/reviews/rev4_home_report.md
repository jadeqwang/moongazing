# rev4_home — the reunion with Kenton's arms round all three (3:13–3:19)

Working notes (Oct 8 2026, night). Timestamps are cut v6. Owner blocks: 8.2 and 8.2b in
`render/src/sections/08_outro.js`. Nothing committed. No full-film render.

## What Jade asked
On the card "The reunion, with Kenton coming in" she ticked "Kenton wraps both arms round all three" and wrote:
"where do I find the shot where he wraps both arms?" She did not tick "wider", "from behind" or "socks"; elsewhere:
"shoes are fine". She had not seen the wrap version: last round's page only described it (`K_8.2a/take_8`).

## Where it stands
- **Wired:** `K_8.2a/take_8` (the wrap she ticked) with a new close painting `K_8.2b_wrap` and its take. Clip:
  `render/out/rev4_home/reunion_wrap.mp4`.
- **Also complete, not wired:** a second wrap made this round, `K_8.2a/take_10`, with its own close painting
  `K_8.2b_wrap10` and take. Clip: `render/out/rev4_home/reunion_wrap_alt_take10.mp4`. It is the better telling (he
  hurries, opens both arms, the cut stays on the downbeat) but shows Kenton's face in profile for about a second,
  which the character bible says not to do. Hers to choose.
- **The one-hand version of cut v6**, for comparison: `render/out/rev4_home/reunion_onehand_v6.mp4` (encoded from the
  v6 frames).
- Switching is one word in `media/gen/picks.json` (`K_8.2a` → `take_8`, `take_10` or `take_9`); the section file
  follows the pick. With `take_9` the frames are the v6 frames byte for byte (checked on 15 frames).

## Log

### `K_8.2a/take_8`, looked at as motion before prep
Frame-difference list of the take: drawn on twos from f4 to f116 (frames 2j and 2j+1 are one drawing), then close to
still (the embrace only breathes; not used). Strips of every drawing, in `render/out/rev4_home/strips/`:
- `take8_runin_f0-34_every_drawing.jpg`: M runs into Jade's arms by f10, T runs, bends his knees and kneels in by f24.
  No limb pops. Kenton lowers his hand and starts to walk at f12; from f20 his head is above the top of the picture.
- `take8_walk_f30-84_every_drawing.jpg`, `take8_feet_f28-82_every_drawing.jpg`: four real steps, alternating (a foot
  lands at about f34, f46, f60, f72), each planted foot stays where it landed against the bag and shoes; no skating, no
  legs passing through each other. He is seen from the shoulders down from f20 to f84: the keyframe's camera cannot
  hold a standing man that close.
- `take8_wrap_f80-126_every_drawing.jpg`, `take8_wrap_zoom_f84-94.jpg`, `take8_wrap_zoom_f96-126.jpg`: he bends
  (f80–86, his hand lands on Jade's back at f84–86), kneels behind T (f88–94), his arm goes across T's back and
  Jade's back with his hand on her hair (f96–100), and his head comes to rest on T's (f108–116). His arm passes under
  T's arm, never through a child. His hand has a thumb and four fingers in every drawing f84–126. T's face is whole and
  toward us throughout; M's face shows at the right of Jade's head; Jade's face never shows.
- What it is not: only ONE of his arms is seen (the other is behind T), and for three drawings (f86–90) his face is in
  profile with his glasses, at the top of the picture.

Verdict: it holds up on the points asked (walk, no doubled stretch needed, hands, heads). Prep:
`tools/roto_prep.py K_8.2a/take_8` (no keep, no patch; faces found in 0 frames, as with take_9).

### Two more wide takes, ordered while take_8 was prepped (`tools/vgen_rev4_home.py`, job `82_wrap`)
Prompt: he strides in briskly, sinking lower so his head stays in the picture, kneels by the middle of the clip, opens
both arms and wraps them round all three, back to us, children's faces never covered.
| Take | USD | Verdict |
|---|---|---|
| `K_8.2a/take_10` | 0.48 | **Alternative.** He hurries in, opens BOTH arms (f50–58, both hands clean), bends and is down with his arm round T, M and Jade by f84. M's face ends up between T's and Jade's head, so both children's faces are whole and side by side. Fits the shot's 87 frames at 1x. Against it: his face is in profile, with glasses, medium-sized, f50–70; and its first 40 frames are not on clean twos (about 16 drawings a second). |
| `K_8.2a/take_11` | 0.48 | Rejected: as slow to arrive as take_8, uneven cadence, profile f73–90. |

Strips: `take10_runin_f0-47_every_frame.jpg`, `take10_wrap_f48-94_every_drawing.jpg`, `take10_profile_f50-72.jpg`.

### The wiring (`08_outro.js`: one block of constants after `V82b`, the 8.2 layer lines, the 8.2b scene line)
A small table `WRAPS`, keyed by the picked take. `take_9` is not in it, so with `take_9` every value is the old one.
- **Clock.** The wrap takes play at 1x from frame 2 for the whole shot (plain `offset`; the engine holds the take's even
  frames two film frames each). No doubled stretch anywhere. (In take_9 fourteen film frames ran at 2x.)
- **The cut to the close moves one beat later with take_8**, from bar 109 beat 1 (197.04) to bar 109 beat 2 (197.50):
  at 1x he needs 98 frames to be down with his arm round them and the shot had 87. His hand reaches them on the
  bar-109 downbeat; the close begins a beat after it and lasts 33 frames (it was 44). Lint: OK (it is a beat).
  With take_10 the cut stays on bar 109 beat 1.
- **Push.** `V82w`, 1.0 → 1.18 (take_9 had 1.28), so his head and knot are inside the top of the frame at the end.
- **Tear.** Unchanged (seam at design y 790, joined on bar 107 beat 4). Checked on every rendered frame 4642–4677
  (`render_tear_4642-4677_every_frame.jpg`): it crosses M's dress and legs, T's legs and lower arm and Jade's back,
  never a face. Same result on take_10's frames (sheet of every fifth frame).
- **Close painting, take_8:** `media/keyframes/K_8.2b_wrap.jpg` = take_8's frame 100 (the frame at the cut), cropped to
  uv (0.285, 0.190)–(0.841, 0.737) and restored at 2752 px by nano-banana-pro with last round's "restore, do not
  redesign" prompt (`media/keyframes/work/rev4_home/p_82b_wrap.txt`), first attempt accepted. Checked at full size:
  Kenton from behind (curls, knot, rim of his glasses), his hand on Jade's hair with a thumb and four fingers; T's
  hand; M's two hands clasped; T's lower face as wide as his forehead (sheet v3). Its take: `K_8.2b_wrap/take_1`
  (he draws them in and lowers his head onto T's; on clean twos; nearly still for its first 8 frames, so it plays
  at 1x from frame 10 where it starts to move). `take_2` not used (uneven cadence after f34).
  Strip: `close_take1_f10-50_every_drawing.jpg`.
- **Close painting, take_10:** `media/keyframes/K_8.2b_wrap10.jpg` = take_10's frame 90, uv (0.305, 0.195)–(0.805,
  0.688), same method (`p_82b_wrap10.txt`). Kenton fully from behind, T's and M's faces side by side. Its take:
  `K_8.2b_wrap10/take_1` (on threes: 1.5x from frame 3, each drawing two film frames). `take_2` not used.
- `media/gen/picks.json`: `K_8.2a` → take_8 (note carries the re-run command and how to switch), new `K_8.2b_wrap` →
  take_1, new `K_8.2b_wrap10` → take_1; `K_8.2b_close` left as it was. `docs/script.md` row 8.2 / 8.2b updated.
- No lyric, HUD or card line touched. `node tools/lint_shots.mjs`: OK. `node tools/roto_holds.mjs`: "every roto layer
  on twos holds each drawing for two film frames" (the two shots no longer appear in its list: they are at 1x).

### Rendered and looked at (half scale, `render/out/rev4_home/f82/`, frames 4596–4799)
- Frame-difference series 4642–4772, measured on the rendered frames: a new drawing on every second frame from the
  first frame of each shot to its last; spikes only at the join (4675) and the cut (4740). Even holds of two.
- `render_walk_4670-4728_every_drawing.jpg`, `render_wrap_and_cut_4722-4753_every_frame.jpg`,
  `render_bend_zoom_4724-4738.jpg`, `render_close_4740-4772_every_drawing.jpg`,
  `compare_v6_onehand_top_vs_wrap_bottom.jpg`; two frames at full size (197.3 s wide, 198.25 s close): faces and
  hands clean, T's cheeks full.
- The cut 4739 → 4740 continues: same pose, his arm across, hand on her hair.
- Rendered twice and compared byte for byte (131 frames, identical). The frames of 8.1 and 8.3 around it are identical
  to v6. **Render fault met on the way:** with other agents rendering at the same time, a 2-worker pass failed some
  frames ("source image cannot be decoded") and, in the take_10 pass, saved eight frames (4720–4727) that differed from
  two later passes without reporting an error. The alternative's frames were replaced from a clean single-worker pass.
  Whoever renders the final frames should render twice and compare.

### Falls short / to know
- **take_8 (wired): he is seen without his head for about two seconds** (3:14.8–3:16.8, frames 4676–4722), and for
  about one of those seconds only from the waist down, walking at an unhurried pace. In v6 this stretch was 1.6 s
  (shortened by the 2x stretch that is now gone). It is the weakest part of the wired version.
- **take_8: one arm, not two, is seen going round them.** His other arm is behind T. He lays a hand on Jade's back as
  he bends and then the arm goes across. It reads as "he folds himself round them", not as two open arms.
- **take_8: half of his face shows in profile at the top edge for about six frames** (3:16.9–3:17.1, frames
  4726–4731), cut by the frame.
- **take_8: the cut to the close is one beat later than in v6** and the close is 1.4 s instead of 1.8 s.
- In both wrap versions Kenton is the largest and darkest thing in the close; the children's faces are the lightest
  and are in the middle. In take_8's close his curls cover the top of T's hair by the end (T's face stays whole).
- The close paintings are lighter and less amber than the wide (measured: about a fifth brighter; in v6 the close was about a quarter brighter than its wide).
- take_10 (alternative): his profile with glasses for about a second (3:15.8–3:16.7, frames 4700–4720), partly cut by
  the frame top; the first 1.6 s (the run-in) step a little unevenly because that part of the take is not on twos.
- At the start of 3:13 he still stands small in the doorway facing us for about half a second, as in v6.
- Nothing was watched at speed with sound; every judgement is from frames, strips and measurements.

## Files
- New: `tools/vgen_rev4_home.py`; `media/keyframes/K_8.2b_wrap.jpg` (+ `.txt`), `media/keyframes/K_8.2b_wrap10.jpg`
  (+ `.txt`); `media/keyframes/work/rev4_home/` (source frames, crops, prompts); takes `media/gen/K_8.2a/take_10`,
  `take_11`, `media/gen/K_8.2b_wrap/take_1`, `take_2`, `media/gen/K_8.2b_wrap10/take_1`, `take_2`; roto folders for
  `K_8.2a/take_8`, `K_8.2a/take_10`, `K_8.2b_wrap/take_1`, `K_8.2b_wrap10/take_1`.
- Edited: `render/src/sections/08_outro.js` (8.2, 8.2b), `media/gen/picks.json` (`K_8.2a`, `K_8.2b_wrap`,
  `K_8.2b_wrap10`), `docs/script.md` (row 8.2 / 8.2b), sidecar verdicts of the takes above and of `K_8.2a/take_8`.
- Re-run order: `$MPY tools/roto_prep.py K_8.2a/take_8`, `… K_8.2b_wrap/take_1` (and `… K_8.2a/take_10`,
  `… K_8.2b_wrap10/take_1` for the alternative). No keep, emblem, paper or beam data on any of them.
- Output: `render/out/rev4_home/` (three clips, `f82/` wired frames, `f82_take10/` alternative frames, `strips/`,
  `stills/`).

## Spend
Video 2.24 USD of the 8 allowed (six h3 768P takes: two wide at 0.48, four close at 0.32). Images about 0.27 USD
(two nano-banana-pro restores). No codex.

## For Jade
**3:13–3:19, the reunion, with Kenton's arm round all of you.** This is the version you ticked and had not been
shown. Clip, with the song under it (3:11.5–3:20.0): `render/out/rev4_home/reunion_wrap.mp4`.
- What changed. M runs into your arms, T kneels in, and Kenton walks in from the doorway, bends down to you, kneels
  behind T and lays his arm across T and you, his hand on your hair (3:16.7–3:17.5). The close view that follows
  (3:17.5–3:18.9) is a new painting made from that moment, with its own movement: he draws you all in and lowers his
  head onto T's; T's and M's faces are toward us. The paper's two halves still meet low in the picture, clear of the
  children's faces. Nothing in his walk is sped up any more.
- Frames re-rendered: 4642–4772 (3:13.4–3:18.9). Representative frames: 4735 (his arm round you, wide), 4756 (the close),
  in `render/out/rev4_home/f82/`.
- What still falls short. (1) For about two seconds while he walks in (3:14.8–3:16.8) his head is above the top of the
  picture, and for one of them we see only his legs. (2) Only one of his arms is seen going round you; the other is
  behind T. (3) Half of his face shows in profile at the very top of the picture for a quarter of a second as he bends
  (3:17.0). (4) To give him time to get down without speeding him up, the cut to the close view is one beat later than
  before, so the close view is 1.4 seconds instead of 1.8.
- For comparison, the version in cut v6 (he kneels at the edge, one hand on T's back):
  `render/out/rev4_home/reunion_onehand_v6.mp4`.

**A choice that is yours: a second wrap, made this round.** Clip: `render/out/rev4_home/reunion_wrap_alt_take10.mp4`
(frames in `render/out/rev4_home/f82_take10/`; representative 4700, both arms open, and 4744, the close).
- In it Kenton hurries in, opens both arms, and gathers all three of you; his head is out of the picture for about a second instead of
  two; the cut to the close stays on the downbeat where it was; and in the close T's and M's faces are side by side in
  the middle of the picture. I think it tells the moment better.
- It is not the one wired, for one reason: as he bends in, his face is seen in profile, with his glasses, for about a
  second (3:15.8–3:16.7). The rule so far has been that Kenton is shown from behind or far away. If you are happy to
  see his profile there, say so and this version goes in (one setting; it is finished, close painting and all).
- Smaller point against it: the first second and a half (the children's run) steps slightly less evenly than in the
  wired version.
