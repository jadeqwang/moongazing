#!/usr/bin/env python3
"""Cut the exact vocal-stem window for each lip-sync shot -> media/gen/<shot>/ref_vocals_<t0>_<dur>s.mp3.

Source: analysis/stems/vocals.wav (sample-aligned with inputs/moongazing.mp3; the song itself is never altered).
Window: lsshots.json ref_t0 .. ref_t0 + ref_dur (ref_t0 = first sung word - 0.3 s lead-in).
    .venv/bin/python tools/sync/cut_refs.py [LS1 LS2 ...]
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import gen  # noqa: E402

VOCALS = os.path.join(ROOT, "analysis", "stems", "vocals.wav")
SHOTS = json.load(open(os.path.join(HERE, "lsshots.json")))


def cut(shot):
    s = SHOTS[shot]
    out = os.path.join(ROOT, "media", "gen", shot, f"ref_vocals_{s['ref_t0']:.3f}_{s['ref_dur']}s.mp3")
    gen.audio_ref(VOCALS, s["ref_t0"], s["ref_dur"], out)
    info = gen.probe(out)
    print(f"{shot}: {os.path.relpath(out, ROOT)}  song {s['ref_t0']:.3f}-{s['ref_t0'] + s['ref_dur']:.3f}  ({info['duration']} s)")
    return os.path.relpath(out, ROOT)


if __name__ == "__main__":
    for sh in (sys.argv[1:] or [k for k in SHOTS if not k.startswith("_")]):
        cut(sh)
