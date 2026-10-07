#!/usr/bin/env python3
"""Generate Guanghan Station keyframes from the 3D-blockout guides (nano-banana-pro, guide = FIRST image input).
    .venv/bin/python render/scenes/guanghan3d/gen_keyframes.py JOB[:variant] ... [--dry-run]
Outputs media/guanghan/gen/<JOB>_<variant>.jpg + .json (model, refs, prompt). Jobs run in parallel threads."""
import json, os, sys, threading
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import cf  # noqa: E402

G = "media/guanghan/guides/"
OUT = os.path.join(ROOT, "media/guanghan/gen")
K7A = "media/keyframes/K_7.A.jpg"
RESTRAINT = ("Museum-grade restraint: matte pigments, real brush texture, flat even lighting like a museum scan of a real "
             "centuries-old painting. Not glossy, not photographic, not 3D, no glow, no bloom, no lens flare, not over-saturated, not cluttered.")
NOTEXT = ("No text, no calligraphy, no writing, no inscriptions, no characters, no letters, no numbers, no signatures, no captions, "
          "no seal, no border or frame. No markings or symbols on doors, vehicles or panels.")
GUIDE = ("Image 1 is a plain 3D blockout render of Guanghan Station, our lunar south-pole base, made from the base's exact "
         "engineering layout. Render this exact layout and camera: keep every structure's position, size, count and silhouette, "
         "the same horizon line and the same framing. Do not add, remove, move or resize any structure. Use image 1 ONLY for "
         "geometry: do not copy its plain plastic shading, its thin technical lines or its blank background. ")
K7A_NOTE = ("Image 2 is the approved painting of the same station from another angle: use it for the design of each element — "
            "a squat cylindrical central tower with arched windows and a ring of small portholes under a ribbed glass dome; "
            "ribbed white tunnels; heaped grey regolith mounds hatched like Song-dynasty rocks; very tall slender masts on tripod feet, "
            "each carrying two tall flat solar panels standing vertically like banners, drawn as fine ruled grids. ")
GOLD = ("A Ming-dynasty 泥金 gold-ink painting on deep indigo-dyed 磁青 paper — the technique of imperial sutra frontispieces: "
        "fine hand-drawn lines of matte powdered gold on a dark, slightly mottled indigo paper ground. ")
JIEHUA_GOLD = (GOLD + "Drawn as a Song 界画 (jiehua) palace painting in classical parallel oblique projection seen from high above "
               "(no vanishing point; all parallel edges stay parallel). LINE ONLY: every form is drawn with fine, ruler-straight, even "
               "'iron-wire' gold outlines and sparse gold hatching — no filled gold areas, the indigo paper shows through everything. "
               "The ground is plain empty indigo paper with no terrain lines. ")
INK = ("A full-bleed monochrome Chinese ink-wash painting (水墨) on white xuan paper, edge to edge, no margins, in the manner of "
       "Xia Gui and Ma Yuan, with real brush marks: broad wet washes, dry-brush 飞白, ink granulation, soft bleeding into paper fibres. ")
STYLE_REF = "The last image is a museum painting: use it ONLY as a guide to technique, paper and line quality — do not copy its subject. "

STAGE_TXT = {
    "A1": ("Construction stage 1, robotic survey and grading, long before the crew. The two graded roads are only faint thin pairs of ruled lines. The ground is still bare — the outlines of the "
           "future building footprints are scraped flat as pale oval and cross-shaped graded patches with small survey stakes; only "
           "two of the six tall solar masts are standing with their panels; the other four positions show just the three-legged "
           "foundation feet; a gantry printer stands parked at the edge; a small cargo lander sits far off at the upper left; two small "
           "four-legged rabbit-like robot rovers at work; four survey stakes far off at the upper right where the reactor will go. "),
    "A2": ("Construction stage 2: the white ribbed pressure vessels, tunnels and the central tower have been landed and joined, and a "
           "large gantry 3D-printer straddles one module, laying the regolith shell over it course by course; the shells are at "
           "different heights — some modules are fully mounded, some half-covered showing horizontal printed courses, one still bare "
           "white (drawn as fine gold outline only, never filled); the tunnels are ribbed tubes in fine gold outline only, never filled white or solid; four masts stand fully deployed and two are still telescoping upward with their panels half unfolded; the dome on "
           "the tower is closed with opaque shutter petals; a slender lattice comms tower with a dish stands in the foreground; far off "
           "upper right the reactor sits behind its long earthen berm with its radiator fins still folded flat together into one closed stack; there is NO landing pad yet — the upper left is empty paper except one small cargo lander. "),
    "A3": ("Construction stage 3, the crew has arrived: all six regolith mounds are complete; all six masts are fully deployed; the "
           "dome on the tower is still shuttered; far off at the upper right the reactor's tall flat radiator fins are halfway opened "
           "like a folding fan (扇) beside its squat cylinder; the long low earthen ridge in image 1 is the reactor's berm (hatched like Song rocks), with the reactor and its fins directly behind it; there is only this one ridge. A crew lander stands far off at the upper left. "),
    "A4": ("Construction stage 4, nearly complete: everything as built, the tower's ribbed glass dome now open; far off at the upper "
           "left the landing pad is being glazed — half of the flat circular sintered pad is finished as fine ruled concentric lines, a "
           "small rover with a laser works along the unfinished edge, inside a ring-shaped blast berm; the reactor fins at the upper "
           "right are fully fanned open. All six regolith mounds are heaped and hatched like Song rocks, never smooth domes. "),
}

JOBS = {}
def job(name, refs, prompt, aspect="16:9"):
    JOBS[name] = {"refs": refs, "prompt": prompt, "aspect": aspect}

job("K_1.5_line", [G + "1.5_line.png", K7A, "media/style_refs/ref_ink_xiagui.jpg"],
    GUIDE + K7A_NOTE + STYLE_REF + INK +
    "Guanghan Station at the lunar south pole during a long terrain shadow, seen from the ground about 140 metres away: ONE single small base on the horizon exactly as in image 1 — do not add a second cluster or any foreground buildings. "
    "The whole base sits in deep black ink shadow: the heaped regolith mounds, the tunnels and the squat central tower are dark ink "
    "shapes painted with 皴 texture strokes, almost lost in shadow. Only high things catch the grazing sun: the upper halves of the "
    "six very tall vertical solar panels on their slender masts and the ribbed glass dome on top of the tower are bare white paper. "
    "Warm amber light glows from the tower's arched windows, from small round windows along the tunnels and from the windows of the "
    "small end-node between the mounds — tiny touches of warm ochre, the only colour in the picture. The ground in front is a dark "
    "plain of grey ink wash. Flat dense black ink sky, no stars, no Earth, no planet; keep the black sky at the far left above the low hill completely empty. "
    "The upper part of the frame is calm black sky for typography. " + RESTRAINT + " " + NOTEXT)
job("K_1.5_flat", [G + "1.5_flat.png", K7A, "media/style_refs/ref_ink_xiagui.jpg"], JOBS["K_1.5_line"]["prompt"])

job("K_7.E1", [G + "7.E1_line.png", K7A, "media/keyframes/K_7.E1_v1.jpg"],
    GUIDE + K7A_NOTE +
    "The last image is our earlier painting of this scene: copy its technique exactly (gold-line interior on indigo, the crew as dark "
    "indigo silhouettes outlined in fine gold line, the view outside painted as monochrome 水墨 ink and white paper) but NOT its view. "
    "A painting combining two techniques: the interior is a Ming 泥金 gold-ink drawing on deep indigo 磁青 paper; the view through the "
    "glass is a monochrome 水墨 ink-wash painting. Inside the small glass observation dome on the roof of the central tower, looking "
    "north. Eight crew members in short-sleeved polo shirts, seen from behind, stand in two loose rows raising their cups toward the "
    "horizon, leaving a clear gap in the middle. The dome is drawn as curved ruled gold ribs. Through the glass, exactly as in image 1: "
    "directly ahead and below, a ribbed tunnel runs straight away from the tower to a small round end-node; a heaped regolith mound on "
    "each side of it; two very tall solar masts with vertical banner-like panels stand left and right; a slender lattice comms tower "
    "with a small dish left of centre; beyond, a flat plain to a low distant mountain range on the horizon. Low sun: crests and the "
    "tops of the panels are white paper, shadows black ink. Flat black sky, no stars, and NO Earth — leave the black sky just above "
    "the distant mountains at the centre empty. " + RESTRAINT + " " + NOTEXT)

job("K_7.C4", ["media/keyframes/K_7.C4_v2.jpg", G + "7.C4_line.png"],
    "Edit image 1, a gold-on-indigo painting of eight crew in a galley. Keep all eight people exactly as they are — faces, hair, "
    "skin tones (keep the Nigerian woman deep dark brown), polo collar stripes, hands, every tablet and the painted family clip on "
    "each screen, the drink pouches and the round table. Redraw ONLY the room behind them so it matches image 2, a 3D layout of the "
    "same room: the inside of one long horizontal cylindrical module, about 4.5 metres across — a curved ceiling and walls closely "
    "ringed by ruled gold ring-frames that recede in perspective toward the far end, shelves and lockers following the curved walls, a "
    "flat floor, a long ceiling light strip, and at the far end, centred behind the group, a ROUND pressure hatch (a circle within a "
    "circle) instead of an arched doorway. Same matte gold line on mottled indigo, same calm indigo upper band. " + NOTEXT)

job("K_7.B2", ["media/keyframes/K_7.B2_v1.jpg", G + "7.B2_line.png"],
    "Edit image 1, a gold-on-indigo painting of two suited gloved hands on the valve wheel of a molten-regolith reactor vessel with a "
    "glowing ember inspection port. Keep the gloves, the valve wheel, the insulated vessel, the ember port and the oxygen tanks exactly. "
    "Change the setting so the plant clearly stands inside a large unpressurised vaulted hall printed from regolith (image 2 shows the "
    "geometry): replace the flat empty indigo band across the top with the curved underside of a low barrel vault drawn in fine gold "
    "line, its surface made of many horizontal printed layer-courses running along the vault; a long work-light strip along the crown "
    "of the vault; a regolith hopper on a conveyor in the background. Same matte gold line on mottled indigo; the ember port stays the "
    "only hot colour. " + NOTEXT)

for st in ["A1", "A2", "A3", "A4"]:
    job(f"K_7.{st}", [G + f"7.{st}_line.png", "media/guanghan/K_7.A_detail_ref.jpg", "media/style_refs/ref_indigo_ming_nijin.jpg"],
        GUIDE + "Image 2 is a DETAIL of our approved painting of this base (the reactor, one mast, part of a mound): match its gold "
        "line weight, its paper and the design of each element — masts with two tall ruled-grid panels on tripod feet, regolith mounds "
        "heaped and hatched like Song-dynasty rocks (never smooth domes), the reactor's flat radiator fins — but take the layout, the "
        "number of masts (exactly six solar masts plus one lattice comms tower) and the number of mounds ONLY from image 1. " + STYLE_REF +
        JIEHUA_GOLD + STAGE_TXT[st] +
        "Tiny figures and robots are a few touches each. Bands of empty indigo paper separate the far reactor and the far landing area "
        "from the base, as in a palace scroll. The gold is matte and hand-applied, slightly uneven, never metallic chrome. "
        + RESTRAINT + " No stars. " + NOTEXT)

job("K_5.2", [G + "5.2_line.png", K7A, "media/stylelab/S4_jiehua/nbp_v5.jpg"],
    GUIDE + K7A_NOTE + "The last image is our approved 界画 painting style for the base: copy its technique, paper, ink line and "
    "sparing pale colour, not its viewpoint. A Song-dynasty 界画 (jiehua) ruled-line architectural SITE PLAN, seen exactly from "
    "directly above like a palace ground plan, in ink on aged pale silk-paper with sparing gongbi colour. Centre: the round central "
    "tower seen from above as concentric circles with its radiating dome ribs; four ribbed tunnels in a cross; six heaped regolith "
    "mounds seen from above, rounded like Song rocks with 皴 texture strokes and circular printed courses; two small round end-nodes "
    "with tiny vermilion hatches; around them a wide ring of six slender solar masts, each seen from above as a small three-legged foot "
    "with a thin ruled line of panel; one lattice comms tower to the north; graded roads drawn as pairs of ruled lines leaving to the "
    "east and south. Ground: pale empty paper with a few faint ink washes. Very pale greyed azurite on the solar panels, faint "
    "malachite nowhere else. Generous empty paper margins all round for a seal and type. " + RESTRAINT + " " + NOTEXT)

job("K_5.2fix", ["media/guanghan/gen/K_5.2_v1.jpg", G + "5.2_line.png"],
    "Edit image 1, a 界画 ink site plan of a lunar base seen from directly above. Image 2 is the exact engineering plan. Remove the "
    "rock-like regolith mound at the top, just above the upper end of the vertical tunnel: there the tunnel must end in its small round "
    "end-node with the tiny vermilion hatch standing alone on plain paper, exactly as in image 2. Keep everything else exactly as it "
    "is: the six remaining mounds, the central tower, the tunnels, the six masts, the comms tower and the roads. " + NOTEXT)

job("K_7.E1fix", ["media/guanghan/gen/K_7.E1_v1.jpg", G + "7.E1_line.png"],
    "Edit image 1. Image 2 is the exact engineering layout of the same view. Make three changes only: (1) the ribbed tunnel running "
    "straight away from us must END in a small round cylindrical end-node with a low domed top and a tiny vermilion hatch, as in image 2 "
    "— remove the crosswise tunnel at its far end completely, plain ground there; (2) remove the small white disc floating above the "
    "distant mountains in the centre — plain black sky there; (3) each of the two solar masts carries TWO tall ruled-grid panels, one "
    "on each side of its pole, like banners. Keep everything else exactly: the eight crew silhouettes and their raised cups, the gold "
    "dome ribs, the comms tower, the mounds, the ink landscape and the paper. " + NOTEXT)

STARFIX = ("Remove the small asterisk / star-shaped marks on the tops of the regolith mounds — the mound tops are plain hatched regolith. ")
for st in ["A2", "A3", "A4"]:
    job(f"K_7.{st}fix", [f"media/keyframes/K_7.{st}.jpg", G + f"7.{st}_line.png"],
        "Edit image 1, a gold-line 界画 drawing of a lunar base under construction; image 2 is its exact engineering layout. " + STARFIX +
        ("Also: at the upper right there must be only ONE reactor group, exactly as in image 2 — the squat reactor cylinder with its fan of "
         "tall flat radiator fins stands just to the right of the single curved berm; remove the extra hatched earthen ridge and move the "
         "reactor and fins down next to the curved berm. " if st == "A3" else "") +
        "Keep everything else exactly as it is: every mast, mound, tunnel, the tower, the printer, the figures, the paper. " + NOTEXT)

job("K_7.A2ridge", ["media/guanghan/gen/K_7.A2fix_v1.jpg", G + "7.A2_line.png"],
    "Edit image 1, a gold-line 界画 drawing of a lunar base under construction. At the upper right, remove the thin curved arc-shaped "
    "wall in front of the reactor completely (plain indigo paper there); the reactor keeps only its long hatched earthen ridge. Fold the "
    "reactor's radiator fins shut into one compact closed stack of parallel plates beside the reactor cylinder. Keep everything else "
    "exactly as it is. " + NOTEXT)
job("K_7.A4ridge", ["media/guanghan/gen/K_7.A4_v3.jpg", "media/guanghan/K_7.A_detail_ref.jpg"],
    "Edit image 1, a gold-line 界画 drawing of a lunar base. At the upper right, redraw the long smooth flat ellipse as a long low earthen "
    "ridge hatched with fine gold 皴 strokes like Song-dynasty rocks, exactly like the reactor berm in image 2, with the squat reactor "
    "cylinder and its fully opened fan of tall flat radiator fins standing directly behind it, as in image 2. Keep everything else in "
    "image 1 exactly as it is: the base, the six masts, the half-glazed landing pad with its rover, the printer, the comms tower. " + NOTEXT)

KEEP = "Keep everything else exactly as it is — composition, brushwork, paper, every other structure. "
job("R_1.5", ["media/keyframes/K_1.5.jpg", G + "1.5_line.png"],
    "Edit image 1, an ink painting of a lunar base; image 2 is its exact engineering layout. (1) The central tower is too tall: redraw it "
    "about half as tall and squatter — one storey of small arched warm windows on a round drum, topped by a low ribbed glass dome whose top "
    "is only a little higher than the regolith mounds beside it, at the same place. (2) Remove the small extra dome peeking over the "
    "mound to the right of the tower — there is only one dome. " + KEEP + NOTEXT)
job("R_5.2", ["media/keyframes/K_5.2.jpg", G + "5.2_line.png"],
    "Edit image 1, a 界画 site plan. (1) Every one of the six solar masts: the tall panel must occupy only the UPPER HALF of its pole — the "
    "lower half is bare thin pole standing on the three-legged foot. (2) Move the lattice comms tower at the top a little to the LEFT of "
    "the vertical tunnel axis, as in image 2, and give it one small round dish antenna. " + KEEP + NOTEXT)
job("R_7.A2", ["media/keyframes/K_7.A2.jpg", G + "7.A2_line.png"],
    "Edit image 1, a gold-line drawing of a lunar base under robotic construction; image 2 is the exact layout. (1) There must be only ONE "
    "gantry printer, over the half-printed module lower right of the tower as in image 2 — remove any second gantry frame. (2) No people "
    "yet: replace every tiny human figure with a tiny four-legged rabbit-like robot, or remove it. (3) At the upper right keep only one "
    "reactor: the squat cylinder with its closed stack of fins beside the long earthen ridge; remove any duplicate small cylinder, box or "
    "plate below it. " + KEEP + NOTEXT)
job("R_7.A3", ["media/keyframes/K_7.A3.jpg", "media/keyframes/K_7.A2.jpg"],
    "Edit image 1, a gold-line drawing of a lunar base. (1) The fan of radiator fins at the upper right is only HALF open: close it so the "
    "fins spread over about half the angle they do now, still like a half-opened folding fan. (2) The dome on top of the central tower is "
    "closed with opaque shutter petals, drawn like the closed dome in image 2 — no glazing grid. " + KEEP + NOTEXT)
job("R_7.B2", ["media/keyframes/K_7.B2.jpg"],
    "Edit this gold-on-indigo painting: remove the straight horizontal seam about a quarter of the way down where the vaulted ceiling "
    "meets the pipework — the barrel vault with its printed layer lines continues smoothly down behind the pipes and tanks in one "
    "consistent perspective, no band, no seam. " + KEEP + NOTEXT)
job("R_7.E1", ["media/keyframes/K_7.E1.jpg"],
    "Edit this painting: on the small round end-node at the far end of the tunnel, remove the vermilion door — its hatch faces away from "
    "us, so the side we see is plain. " + KEEP + "Keep Earth exactly as it is. " + NOTEXT)
job("R_7.A", ["media/keyframes/K_7.A_v1.jpg"],
    "Edit this gold-line 界画 drawing of a lunar base: on each of the six solar masts, the two tall ruled-grid panels must occupy only the "
    "UPPER HALF of the mast — shorten each panel from the bottom so the lower half of every mast is bare thin pole above its tripod feet. "
    "Keep the masts in exactly the same places and keep the top of each panel where it is. " + KEEP + NOTEXT)

job("R2_7.A3", ["media/keyframes/K_7.A3.jpg"],
    "Edit this gold-line drawing of a lunar base. Change only two details: (1) the fan of tall flat radiator fins at the upper right "
    "is only HALF open — redraw it spread over about half its current angle, like a half-opened folding fan; (2) the small dome on top "
    "of the central tower is closed by opaque curved shutter petals (plain petal outlines meeting at the top, no glazing grid). Keep the "
    "six hatched regolith mounds, the tunnels, the six masts, the printer, the comms tower, the lander and the paper exactly as they are. " + NOTEXT)
job("R2_7.B2", ["media/keyframes/K_7.B2.jpg"],
    "Edit this gold-on-indigo painting. Across the picture, about a quarter of the way down, there is a hard straight horizontal edge "
    "where the upper strip (vault ceiling, light strip, hopper) is pasted onto the lower part (vessel, pipes, tanks). Remove that edge: "
    "repaint the area just above and below it so the curved ring-ribs and printed layer lines of the barrel vault visibly continue "
    "DOWN behind the pipework and the tanks to the floor, one continuous room in one perspective, with an even indigo paper tone "
    "across the whole picture. Keep the gloves, valve wheel, vessel, ember port and tanks exactly. " + NOTEXT)


def run(name, variant, dry):
    j = JOBS[name]
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, f"{name}_{variant}.jpg")
    inp = {"prompt": j["prompt"], "aspect_ratio": j["aspect"], "image_size": "2K", "image_input": ["file:" + r for r in j["refs"]]}
    paths = cf.generate("google/nano-banana-pro", inp, out, tag=f"guanghan_{name}", dry_run=dry)
    if paths:
        json.dump({"model": "google/nano-banana-pro", "refs": j["refs"], "prompt": j["prompt"], "out": os.path.relpath(paths[0], ROOT)},
                  open(os.path.splitext(paths[0])[0] + ".json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    specs = [a for a in sys.argv[1:] if not a.startswith("--")]
    ths = []
    for s in specs:
        name, _, var = s.partition(":")
        t = threading.Thread(target=lambda n=name, v=var or "v1": run(n, v, dry)); t.start(); ths.append(t)
    for t in ths: t.join()
