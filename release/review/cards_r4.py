#!/usr/bin/env python3
"""Round four cards for the decisions page -> release/review/cards_r4.json (read by build_page_r4.sh).
A clip is [file, label, caption, from_s, to_s, poster (frame number or image path), framedir or ready .mp4 (optional)]."""
import json, os
OK = ["ok", "It is right now"]
OFF = ["off", "Still off", "Say what in the note."]
cards = [
 dict(id="r4_card", bp=490, when="0:20", title="The card, in your wording", at=17.54,
      clips=[["card", "Now", "0:17 – 0:22", 17.0, 22.0, 490]],
      asked="streamline it to: <span class='zh'>全世界的航天计划共建国际月球基地</span>",
      body="<span class='zh'>这一次</span> is gone. The line now stands in four columns, <span class='zh'>全世界的 / 航天计划 / 共建 / 国际月球基地</span>, with the name largest, and the subtitles carry the same sentence.",
      q="Is it right?", opts=[OK, OFF]),
 dict(id="r4_desk", bp=1552, when="1:05", title="The gulp at your throat", at=63.4,
      clips=[["desk", "Now", "1:02 – 1:07", 62.5, 67.5, 1552]],
      asked="there's a bit of a 'gulp' like motion at my throat that looks ... glitchy?",
      body="Your head in this shot is the painting, carried along on the take's movement. Last round that painting stopped at the jaw line, so the patch of neck just under it was still being redrawn in ink from the moving take: its grey shading spread and shrank, and the take's own jaw rose to your still chin and sank again. The painting now runs down over the neck into the hair under your jaw, so head, headphones and neck move as one body.",
      short="Head and neck are one flat painting that slides and tilts a few degrees. It does not turn in depth, and your eyes do not move to the laptop.",
      q="Is the gulp gone?", opts=[OK, OFF]),
 dict(id="r4_chin", bp=1687, when="1:10", title="M's hair against your face", at=68.88,
      clips=[["globe", "Now", "1:07 – 1:12", 67.5, 72.5, 1687]],
      asked="there's something glitchy about the way M's hair interacts with my face. is it because the movement was generated without a video model helping with the collision?",
      body="Not quite, and the fault was mine. A video model did move this shot, and in its own frames the contact is right: M's fringe lies in front of your cheek and stays there. Last round, to remove the second chin line, I replaced your head with a painted still, moved it half as far as the model had moved it, and laid it on top of M's hair, which was still the model's. So two things that touch were moving by different rules with the wrong one in front, and her fringe was clipped along the edge of your cut-out. Now M's whole head is carried as a painting too, in front of yours, and the two meet hair on hair.",
      short="M's hair moves with her head as one piece, without strand or curl movement of its own. Your head still moves half as far as your shoulders. The curls below M's chin are still redrawn from the take.",
      q="Does the hair sit right against your face?", opts=[OK, OFF]),
 dict(id="r4_photo", bp=1968, when="1:22", title="You, looking at a picture of the kids", at=80.9, multi=True,
      clips=[["photo", "Now", "1:19 – 1:25", 79.0, 85.0, 1985]],
      asked="it's pretty bad, and I'm not fond of the non-singing shot either. It makes more sense to do a shot of me looking longingly at a picture of the kids without singing.",
      body="A new shot. You are seen from behind your left shoulder in the capsule seat, helmet on, mouth closed, eyes lowered to a snapshot of M and T taped below the window. It is the photograph that is taped up at 1:15, now close enough to read their faces, and it is the only warm colour in the frame. Your head tips toward it about a degree through the shot. Your profile was painted over your own photograph; the children come from their sheets. <span class='zh'>我思念</span> stands on the headrest behind you.",
      short="The shot lasts 1.4 seconds, which is short for the photograph and your look to both register: please judge it at speed. The visor is clear here and opaque gold at 1:15. The snapshot at 1:15 is a different drawing (T on the left, faces blurred). No blink and no capsule shake.",
      q="Tick what applies.", opts=[["ok", "This works"], ["profile", "The profile does not read as me"], ["gold", "Make the visor gold as at 1:15, so my face is hidden"],
                                   ["match", "Repaint the 1:15 snapshot and visor to match this shot"], ["splash", "Make the photo the splash-park day, so the next shot is the photograph coming alive"]]),
 dict(id="r4_plan", bp=2560, when="1:45", title="The solar masts on the plan", at=104.6,
      clips=[["plan", "Now", "1:41 – 1:50", 101.3, 110.0, 2560]],
      asked="it's better, but I think the solar masts were larger in the other artwork and this should match?",
      body="You were right. At 0:25 and 2:23 a mast stands about three mounds tall, and those pictures agree with the station model. On the plan a mast came out shorter than a mound is wide, because a view from above shows a mound's whole 22-metre footprint. The six masts are now drawn 1.4 times larger from the same feet, with gridded panels, which is about how they read in the look-down view of the build at 2:12. Only the masts were redrawn; the rest of the plan is last round's painting. Four small marks on the road are the new lamp posts.",
      short="1.4 times is the most the sheet takes with every mast clear of the mounds, and it is still well short of the side views. The east mast's feet are turned so none stands on the road. One leg of each tripod is drawn slightly knobbly.",
      q="Large enough?", opts=[OK, ["bigger", "Larger still, about 1.6 times", "The two lower masts' panels would overlap the edges of the mounds in front, as masts do in the side views."], OFF]),
 dict(id="r4_lights", bp=3540, when="2:23", title="Work lamps on the mast and the road", at=143.2,
      clips=[["lights", "Now", "2:20 – 2:28", 140.0, 148.0, 3540]],
      asked="You chose: add work lamps on the masts and along the road.",
      body="The station model now has seventeen work lamps: one on each of the six masts, eight low posts along the road to the landing pad, a floodlight at the airlock and two at hatches. From this camera four of them are in view. After the habitat's lights come on as before, the near mast's lamp throws a hard-edged white pool round its tripod, then three road lamps light one after another toward the pad. There are no halos, since there is no air. The counter reads STATION · LIGHTS 21 / 21.",
      short="Only one mast's pool is in view; the others are behind mounds or out of frame. The third road lamp is clipped by the frame edge at the end of the push. The pool is a clean ellipse on brushed ground. The view at 0:25 is unchanged: from eye height the pools would be two-pixel slivers.",
      q="Enough light now?", opts=[OK, ["more", "Still too dark: bring more lamps into view"], OFF]),
 dict(id="r4_toast", bp=4316, when="2:59", title="The two cups, held like the group's", at=178.5,
      clips=[["toast", "Now", "2:55 – 3:02", 175.0, 182.0, 4316]],
      asked="shoes are fine, it's not Jade's personal home. hands are weird in the 2 cup shot, but correct in the group shot. can you fix the 2 hand shot using the hands in the group shot as guidance?",
      body="What was wrong: each hand lay flat on the near face of its cup with four fingers splayed across it and the thumb hidden behind, so nothing told you which hand it was. In the group shot each hand is a fist round the lower half of the cup, thumb on the near side, rim clear. Both hands are repainted to that grip, seen from behind: your right hand on the celadon cup, Lúcia's left on the grey one, wrists straight. The picture was painted from a posed 3D hand and the group shot's hands, without the old painting in front of the model. Your cup rises a little to the height of hers and both hold; no clink.",
      short="The forearms are repainted too and stand more upright. The cups sit wide apart on either side of the Earth, while in the group shot the pair's cups are close together. Fingertips show just under each cup's base.",
      q="Are the hands right?", opts=[OK, OFF]),
 dict(id="r4_reunion", bp=4725, when="3:13", title="Kenton's arms round all three: two versions", at=193.2,
      clips=[["reunion_a", "A, in the cut", "3:11 – 3:20. He kneels and lays an arm across T and you", 191.5, 200.0, 4735],
             ["reunion_b", "B", "He hurries in and opens both arms", 191.5, 200.0, "render/out/rev4_home/f82_take10/f_004744.jpg", "render/out/rev4_home/reunion_wrap_alt_take10.mp4"]],
      asked="where do I find the shot where he wraps both arms?",
      body="It was never on the page: last round I only described it. Looking at it properly, that version shows one of his arms, not two; the other is behind T. So there are two versions here, and the one-hand version you watched is under them as Before. <b>A</b> is the one I described: four real steps in, he bends with a hand on your back, kneels behind T, lays his arm across T and you with his hand on your hair, and rests his head on T's. The cut to the close view comes one beat later so that he has time to get down at natural speed. <b>B</b> is new: he hurries in and visibly opens both arms, and in the close view the children's faces sit side by side. Each has its own close painting.",
      short="A: his head is out of frame for about two seconds while he walks in, and the close view is 1.4 seconds. B: his face shows in profile, with glasses, for about a second at 3:16, where every other shot keeps him from behind or far away; the children's run-in steps a little less evenly. A is in the cut for that reason only.",
      q="Which goes in the film?", opts=[["a", "A: he kneels and lays an arm across us"], ["b", "B: he opens both arms, and his profile shows for a second"], ["onehand", "Go back to one hand on T's back"]]),
]
settled = [
 ["0:10", "The festival street stays", "As you chose."],
 ["0:23", "The walkout stays as it is", "Nothing ticked: the crew keep their ventilator cases."],
 ["0:57", "The eclipse over Anatolia", "No answer, so nothing changed."],
 ["2:18", "The glove stays hand-sized", "As you chose."],
 ["2:28", "Single mode stays on the left", "“it's not perfect but it's fine for now”"],
 ["2:36", "No wave at the dog", "As you chose."],
 ["2:44", "The split screen stays", "As you chose."],
 ["2:56", "Shoes stay in the toast and the reunion", "“shoes are fine, it's not Jade's personal home”"],
]
ENV = os.path.join(os.path.dirname(__file__), 'card_r4_env.json')
if os.path.exists(ENV): cards.insert(1, json.load(open(ENV, encoding='utf8')))
json.dump({"cards": cards, "settled": settled}, open(os.path.join(os.path.dirname(__file__), 'cards_r4.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(cards), 'cards')
