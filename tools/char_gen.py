#!/usr/bin/env python3
"""tools/char_gen.py — character-sheet generator used for docs/character_bible.md.
char_gen.py NAME MODEL TAG PROMPTFILE [ref ...] [--size=1536x1024] [--ar=3:2]
MODEL: gpt | grok | nbp. Writes media/chars/NAME/TAG.<ext> + TAG.json (prompt, refs, model)."""
import sys, os, json
ROOT = "/home/jade/Documents/moongazing"
sys.path.insert(0, os.path.join(ROOT, "tools"))
os.chdir(ROOT)
import cf

STYLE = open(os.path.join(ROOT, "media/chars/STYLE_BLOCK.txt")).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--"))
name, model, tag, pfile = args[:4]
refs = args[4:]
prompt = open(pfile).read().strip()
if opts.get("nostyle") != "1":
    prompt = prompt + "\n\n" + STYLE
if refs:
    prompt = ("Reference images are provided: " + opts.get("refnote", "use them for design continuity (character, costume, palette and painting technique) only.") + "\n\n" + prompt)
outdir = f"media/chars/{name}"
os.makedirs(outdir, exist_ok=True)
MID = {"gpt": "openai/gpt-image-2.5-sunburst", "grok": "xai/grok-imagine-image-2.0", "nbp": "google/nano-banana-pro"}[model]
size = opts.get("size", "1536x1024")
ar = opts.get("ar", "3:2")
if model == "gpt":
    inp = {"prompt": prompt, "quality": opts.get("q", "high"), "size": size, "output_format": "jpeg"}
    if opts.get("bg"):
        inp["background"] = opts["bg"]; inp["output_format"] = "png"
    if refs:
        inp["images"] = ["file:" + r for r in refs]
elif model == "grok":
    inp = {"prompt": prompt, "aspect_ratio": ar, "resolution": "2k", "response_format": "b64_json"}
    if refs:
        inp["images"] = [{"url": "file:" + r} for r in refs]
else:
    inp = {"prompt": prompt, "aspect_ratio": ar, "image_size": "2K"}
    if refs:
        inp["image_input"] = ["file:" + r for r in refs]
out = f"{outdir}/{tag}.jpg"
paths = cf.generate(MID, inp, out, tag=f"chars_{name}_{tag}")
json.dump({"model": MID, "prompt": prompt, "refs": refs, "out": paths, "opts": opts},
          open(f"{outdir}/{tag}.json", "w"), ensure_ascii=False, indent=1)
print(paths)
