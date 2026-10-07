#!/usr/bin/env python3
"""Mouth track for re-mouthing Jade: render/data/mouth.json {fps, open:[0..1], round:[0..1]} over the whole song.

The drawn mouth (render/src/roto/mouth.js) follows THIS track at song time, so it is in sync with the vocal by
construction, whatever the generated take's lips did (the take's lag only aligns head/body motion).
  open(t)  = vocal-stem loudness (attack 20 ms, release 90 ms), -44 dB -> 0 ... -16 dB -> 1, led ~40 ms ahead of
             the sound (mouths move before voices); forced shut around bilabial onsets: English words starting with
             b/m/p, Chinese syllables with pinyin initial b/p/m (f half-closes).
  round(t) = lip rounding from the syllable's vowel (pinyin u/o/ü finals, English o/u/w words), eased.
    .venv/bin/python tools/sync/mouth_track.py
"""
import json
import os
import subprocess

import numpy as np
from pypinyin import Style, pinyin

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FFMPEG = os.path.join(ROOT, ".venv", "bin", "ffmpeg")
VOCALS = os.path.join(ROOT, "analysis", "stems", "vocals.wav")
LYR = os.path.join(ROOT, "analysis", "lyrics_timing.json")
OUT = os.path.join(ROOT, "render", "data", "mouth.json")
FPS = 48
SR = 16000


def vowel_open(fin_or_word, zh):
    w = fin_or_word
    if zh:
        if "a" in w:
            v = 1.0
        elif "o" in w:
            v = 0.75
        elif "e" in w:
            v = 0.68
        elif w in ("i", "in", "ing", "ui", "iu"):
            v = 0.45
        else:
            v = 0.38  # u, ü
        nasal = w.endswith("n") or w.endswith("ng")
        return v, nasal
    for ch, v in (("a", 0.92), ("o", 0.8), ("e", 0.62), ("i", 0.55), ("u", 0.5), ("y", 0.5)):
        if ch in w:
            return v, w.endswith("n") or w.endswith("ng") or w.endswith("m")
    return 0.5, False


def syllables():
    """(start, end, initial, rounded, vowel_open, nasal) per sung syllable."""
    out = []
    for line in json.load(open(LYR))["lines"]:
        for w in line["words"]:
            txt = w["text"].strip()
            if any("一" <= c <= "鿿" for c in txt):
                ini = pinyin(txt, style=Style.INITIALS, strict=False)[0][0]
                fin = pinyin(txt, style=Style.FINALS, strict=False)[0][0]
                rnd = 1.0 if fin[:1] in ("u", "o", "v", "ü") or fin in ("ao", "ou", "iu", "iao", "uo", "ong", "iong") else (
                    0.6 if "u" in fin or "o" in fin else 0.0)
                v, nas = vowel_open(fin, True)
                out.append((w["start"], w["end"], ini, rnd, v, nas))
            else:
                ww = txt.lower().strip(",.…'()—-!?")
                ini = ww[:1] if ww[:1] in "bmpf" else ""
                rnd = 0.8 if ww[:1] == "w" or any(v in ww for v in ("oo", "ou", "o")) else 0.0
                v, nas = vowel_open(ww, False)
                out.append((w["start"], w["end"], ini, rnd, v, nas))
    return out


def main():
    raw = subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-i", VOCALS, "-ac", "1", "-ar", str(SR), "-f",
                          "f32le", "-"], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, dtype=np.float32)
    hop = SR // FPS
    n = len(y) // hop
    fr = y[:n * hop].reshape(n, hop)
    rms = np.sqrt((fr ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(rms + 1e-9)
    tgt = np.clip((db + 44) / 28, 0, 1)
    env = np.zeros_like(tgt)
    a_up, a_dn = 1 - np.exp(-1 / (FPS * .02)), 1 - np.exp(-1 / (FPS * .09))
    for i in range(1, n):
        a = a_up if tgt[i] > env[i - 1] else a_dn
        env[i] = env[i - 1] + a * (tgt[i] - env[i - 1])
    env = np.roll(env, -2)                      # lead the sound by ~40 ms
    env = np.power(env, .8)
    # exposure sheet: legato singing keeps the loudness flat, so the syllables come from the word timings —
    # each opens to its vowel's width after a brief consonant onset, nasal finals close toward the end
    sheet = np.full(n, -1.0)
    for (t0, t1, ini, r, v, nas) in syllables():
        i0, i1 = int(round((t0 - .04) * FPS)), int(round((t1 - .02) * FPS))
        for i in range(max(0, i0), min(n, i1 + 1)):
            u = (i / FPS - (t0 - .04)) / max(.06, t1 - t0)
            on = min(1.0, u / 0.22) if (t1 - t0) > .12 else 1.0
            val = 0.22 + (v - 0.22) * on
            if nas and u > 0.6:
                val *= 1 - 0.45 * min(1, (u - 0.6) / 0.4)
            sheet[i] = max(sheet[i], val)
    voiced = np.clip(env / 0.45, 0, 1)
    env = np.where(sheet >= 0, sheet * (0.3 + 0.7 * voiced), env * 0.55)
    rnd = np.zeros(n)
    for (t0, t1, ini, r, v, nas) in syllables():
        if ini in ("b", "p", "m") or ini == "f":
            depth = 1.0 if ini != "f" else 0.55
            for i in range(int((t0 - .08) * FPS), int((t0 + .05) * FPS) + 1):
                if 0 <= i < n:
                    d = abs(i / FPS - (t0 - .015)) / .06
                    env[i] *= 1 - depth * (1 - min(1, d ** 2))
        if r > 0:
            i0, i1 = int((t0 - .04) * FPS), int(t1 * FPS)
            rnd[max(0, i0):max(0, i1)] = np.maximum(rnd[max(0, i0):max(0, i1)], r)
    k = np.exp(-0.5 * (np.arange(-6, 7) / 2.5) ** 2); k /= k.sum()
    rnd = np.convolve(rnd, k, mode="same")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"fps": FPS, "open": [round(float(v), 3) for v in env], "round": [round(float(v), 3) for v in rnd]},
              open(OUT, "w"), separators=(",", ":"))
    print(f"mouth track: {n} samples at {FPS} fps ({n / FPS:.1f} s), mean open {env.mean():.2f} -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
