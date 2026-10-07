#!/usr/bin/env python3
"""Measure lip-sync lag of every take of a lip-sync shot and build the check videos.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/sync/measure.py LS1 [take_2 ...] [--no-check]

Convention (as the renderer plays a take):  clip_time = song_time - ref_t0 + lag
    ref_t0 = song time of the reference audio's first sample (lsshots.json). lag > 0: the mouth moves LATER than
    the song, so the take must start `lag` seconds earlier in the edit (play take from clip time lag at ref_t0).
Curves, over the shot's song window only (lsshots.json "window"):
    vocal  RMS of analysis/stems/vocals.wav, 96 Hz hop, in dB, normalised 20th..98th percentile
    mouth  z(inner-lip gap) + z(jawOpen) from tools/sync/mouth.py (per-frame face landmarks), linearly resampled
For each lag in -0.80..+0.80 s (1/96 s steps), Pearson r of mouth(song_t - ref_t0 + lag) vs vocal(song_t) is computed
for the level curves (3-frame smoothing), for the high-passed curves (minus a 0.5 s moving mean: onsets and
syllable modulation) and against an exposure-sheet target (per-word consonant/vowel openness from the lyric word timings,
gated by the stem being voiced; legato singing keeps the RMS flat, the sheet carries the syllables).
score = mean of the three at the best lag. A second peak within 0.04 of the best, >0.15 s away,
is reported as `ambiguous`. Verdict: score >= 0.5 good, 0.3-0.5 fair, < 0.3 poor.
Outputs (media/gen/<shot>/):  take_N.sync.json, take_N_sync.png, take_N_check.mp4 (take | mouth zoom + curves, with
the song audio muxed from song time ref_t0 - lag), and sync.json {lag_s, score, best take, all takes}.
"""
import glob
import json
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import mouth as mouthmod  # noqa: E402

FFMPEG = os.path.join(ROOT, ".venv", "bin", "ffmpeg")
VOCALS = os.path.join(ROOT, "analysis", "stems", "vocals.wav")
SONG = os.path.join(ROOT, "inputs", "moongazing.mp3")
SHOTS = json.load(open(os.path.join(HERE, "lsshots.json")))
WORDS = [(w["start"], w["end"], w["text"]) for l in json.load(open(os.path.join(ROOT, "analysis", "lyrics_timing.json")))["lines"]
         for w in l["words"]]
RATE = 96
SR = 16000
CJK_FONT = "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"


def decode(path, ss, dur, sr=SR):
    raw = subprocess.run([FFMPEG, "-v", "error", "-ss", f"{ss:.4f}", "-t", f"{dur:.4f}", "-i", path, "-ac", "1",
                          "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def vocal_env(t_a, t_b):
    """(times, env) at RATE Hz for song times t_a..t_b."""
    ss = max(0.0, t_a)
    y = decode(VOCALS, ss, t_b - ss)
    hop = SR // RATE
    n = len(y) // hop
    e = np.sqrt(np.array([np.mean(y[i * hop:(i + 1) * hop] ** 2) for i in range(n)]) + 1e-12)
    e = 20 * np.log10(e + 1e-6)
    lo, hi = np.percentile(e, 20), np.percentile(e, 98)
    e = np.clip((e - lo) / (hi - lo + 1e-6), 0, 1)
    return ss + (np.arange(n) + 0.5) / RATE, e


def fill(v):
    v = np.array([np.nan if x is None else x for x in v], float)
    ok = np.isfinite(v)
    if ok.sum() < 3:
        return None
    i = np.arange(len(v))
    return np.interp(i, i[ok], v[ok])


def z(x):
    return (x - x.mean()) / (x.std() + 1e-9)


def mouth_curve(m):
    """landmarks (lip gap + jawOpen) when the face is found in >= 60 % of frames, else the ROI-darkness fallback."""
    g, j = fill(m["gap"]), fill(m["jaw"])
    if g is not None and m["hit"] >= 0.6:
        m["source"] = "landmarks"
        c = z(g) + (z(j) if j is not None else 0)
    elif m.get("roi_dark") and fill(m["roi_dark"]) is not None:
        m["source"] = "roi_dark"
        c = z(fill(m["roi_dark"]))
    else:
        return None
    return np.convolve(np.pad(c, 1, mode="edge"), np.ones(3) / 3, mode="valid")


def hp(x, n):
    return x - np.convolve(np.pad(x, n // 2, mode="edge"), np.ones(n) / n, mode="valid")[:len(x)]


def lag_scan(curve, fps, t0, win, max_lag=0.8):
    tv, env = vocal_env(win[0] - 1.0, win[1] + 1.0)
    ts = np.arange(win[0], win[1], 1 / 48)
    ev = np.interp(ts, tv, env)
    ev_hp = np.interp(ts, tv, hp(env, int(0.5 * RATE)))
    ct = np.arange(len(curve)) / fps
    c_hp = hp(curve, int(0.5 * fps))
    lags = np.round(np.arange(-max_lag, max_lag + 1e-9, 1 / RATE), 4)
    rl, rh, cover = [], [], []
    for L in lags:
        tc = ts - t0 + L
        ok = (tc >= 0) & (tc <= ct[-1])
        cover.append(ok.mean())
        if ok.sum() < 0.75 * len(ts):
            rl.append(np.nan); rh.append(np.nan); continue
        a = np.interp(tc[ok], ct, curve)
        b = np.interp(tc[ok], ct, c_hp)
        rl.append(float(np.corrcoef(a, ev[ok])[0, 1]))
        rh.append(float(np.corrcoef(b, ev_hp[ok])[0, 1]))
    rl, rh = np.array(rl), np.array(rh)
    _, rs, _, _ = sheet_scan(curve, fps, t0, win, max_lag)
    comb = (rl + rh + rs) / 3
    k = int(np.nanargmax(comb))
    far = np.abs(lags - lags[k]) > 0.15
    k2 = int(np.nanargmax(np.where(far, comb, -9)))
    i0 = int(np.argmin(np.abs(lags)))
    return {"lag_s": float(lags[k]), "score": round(float(comb[k]), 3), "r_level": round(float(rl[k]), 3),
            "r_hp": round(float(rh[k]), 3), "r_sheet": round(float(rs[k]), 3),
            "lag_sheet_only": float(lags[int(np.nanargmax(rs))]), "score_at_0": round(float(comb[i0]), 3) if np.isfinite(comb[i0]) else None,
            "second_peak": {"lag_s": float(lags[k2]), "score": round(float(comb[k2]), 3)},
            "ambiguous": bool(comb[k] - comb[k2] < 0.04),
            "lag_level_only": float(lags[int(np.nanargmax(rl))]), "lag_hp_only": float(lags[int(np.nanargmax(rh))]),
            "_curve": {"lags": lags.tolist(), "comb": np.nan_to_num(comb, nan=-1).tolist(),
                       "level": np.nan_to_num(rl, nan=-1).tolist(), "hp": np.nan_to_num(rh, nan=-1).tolist(),
                       "sheet": np.nan_to_num(rs, nan=-1).tolist()}}


PINYIN = {"举": "ju", "杯": "bei", "邀": "yao", "明": "ming", "月": "yue", "对": "dui", "影": "ying", "成": "cheng",
          "三": "san", "人": "ren", "寒": "han", "我": "wo", "思": "si", "念": "nian", "你": "ni", "酒": "jiu", "缺": "que"}


def event_scan(curve, fps, t0, win, max_lag=0.8):
    """Phoneme events: lips (nearly) closed at bilabial / w onsets (b p m w), open mid-vowel in every word.
    For each lag: mean(open at vowel centres) - mean(open at closures), curve normalised 5..95 %."""
    words = [(a, b, w) for a, b, w in WORDS if win[0] - 0.05 <= a <= win[1]]
    closed, opened = [], []
    for a, b, w in words:
        ww = PINYIN.get(w, w).lower().strip(",.;'")
        if ww[:1] in "bpmw":
            closed.append(a + 0.02)
        opened.append(a + 0.45 * (min(b, a + 0.9) - a))
    if len(closed) < 2:
        return {"event_lag_s": None, "event_score": None, "events": len(closed) + len(opened)}
    cn = (curve - np.percentile(curve, 5)) / (np.percentile(curve, 95) - np.percentile(curve, 5) + 1e-9)
    ct = np.arange(len(cn)) / fps
    best = (-9.0, 0.0)
    for L in np.arange(-max_lag, max_lag + 1e-9, 1 / RATE):
        f = lambda ts: np.interp(np.array(ts) - t0 + L, ct, cn)
        best = max(best, (float(f(opened).mean() - f(closed).mean()), round(float(L), 4)))
    return {"event_lag_s": best[1], "event_score": round(best[0], 3), "events": len(closed) + len(opened)}


# exposure-sheet targets: word -> [(fraction of the word, openness)], onset consonant first. Openness 0 = lips shut
# (b p m), ~0.2-0.4 consonants / close vowels (i u ü), 0.6-0.8 mid vowels, 1.0 open a. Words not listed get 0.6.
SHEET = {
    # LS1 (en)
    "the": [(0, .35), (.25, .55)], "West": [(0, .15), (.2, .6), (.75, .3)], "Lake": [(0, .4), (.2, .7), (.8, .3)],
    "wind": [(0, .15), (.2, .45), (.7, .3)], "sings": [(0, .3), (.2, .4), (.8, .3)],
    "over": [(0, .7), (.45, .3), (.55, .55)], "water": [(0, .15), (.15, .8), (.5, .35), (.6, .55)],
    "like": [(0, .4), (.15, .8), (.85, .3)], "smoothing": [(0, .3), (.12, .0), (.2, .35), (.55, .3), (.65, .45)],
    "silk": [(0, .3), (.2, .4), (.8, .3)], "and": [(0, .8), (.7, .35)], "late": [(0, .4), (.15, .7), (.85, .3)],
    # LS2 / LS3 (zh, pinyin in PINYIN)
    "ju": [(0, .3), (.2, .3)], "bei": [(0, .0), (.15, .6)], "yao": [(0, .4), (.15, 1.0), (.7, .6)],
    "ming": [(0, .0), (.15, .4)], "yue": [(0, .3), (.3, .65)], "dui": [(0, .3), (.2, .5)], "ying": [(0, .35), (.2, .4)],
    "cheng": [(0, .3), (.2, .6)], "san": [(0, .3), (.15, 1.0), (.85, .5)], "ren": [(0, .3), (.2, .6)],
    "han": [(0, .7), (.1, 1.0), (.9, .6)], "wo": [(0, .2), (.2, .7)], "si": [(0, .3), (.25, .3)],
    "nian": [(0, .4), (.15, .6), (.4, .9)], "ni": [(0, .4), (.15, .6)], "jiu": [(0, .3), (.3, .5)], "que": [(0, .3), (.3, .6)],
}


def sheet_target(ts, voiced):
    """Target openness at song times ts: per-word sheet shapes, gated by the vocal stem being voiced."""
    tgt = np.zeros_like(ts)
    for a, b, w in WORDS:
        if b < ts[0] - 1 or a > ts[-1] + 1:
            continue
        key = PINYIN.get(w, w).strip(",.;'")
        segs = SHEET.get(key, [(0, .6)])
        for k, (f, v) in enumerate(segs):
            fa = a + f * (b - a)
            fb = a + (segs[k + 1][0] if k + 1 < len(segs) else 1.0) * (b - a)
            tgt[(ts >= fa) & (ts < fb)] = v
    k = max(1, int(0.04 * 48))
    tgt = np.convolve(np.pad(tgt, k, mode="edge"), np.ones(2 * k + 1) / (2 * k + 1), mode="valid")
    return tgt * voiced


def sheet_scan(curve, fps, t0, win, max_lag=0.8):
    tv, env = vocal_env(win[0] - 1.0, win[1] + 1.0)
    ts = np.arange(win[0], win[1], 1 / 48)
    voiced = np.clip(np.interp(ts, tv, env) / 0.35, 0, 1)
    tgt = sheet_target(ts, voiced)
    ct = np.arange(len(curve)) / fps
    lags = np.round(np.arange(-max_lag, max_lag + 1e-9, 1 / RATE), 4)
    r = []
    for L in lags:
        tc = ts - t0 + L
        ok = (tc >= 0) & (tc <= ct[-1])
        r.append(float(np.corrcoef(np.interp(tc[ok], ct, curve), tgt[ok])[0, 1]) if ok.sum() >= 0.75 * len(ts) else np.nan)
    return lags, np.array(r), ts, tgt


def verdict(score):
    return "good" if score >= 0.5 else "fair" if score >= 0.3 else "poor"


def eye_drift(m):
    out = {}
    for k in ("iris", "eye"):
        v = fill(m[k])
        if v is not None and len(v) > 30:
            out[f"{k}_drift"] = round(float(np.median(v[-12:]) / np.median(v[:12]) - 1), 3)
    return out


def plot(shot, take, m, curve, res, out):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    s = SHOTS[shot]
    fps = m["fps"]
    s = dict(s)
    s["window"] = [min(s["window"][0], res.get("measure_window", s["window"])[0]), max(s["window"][1], res.get("measure_window", s["window"])[1])]
    tv, env = vocal_env(s["window"][0] - 0.5, s["window"][1] + 0.5)
    fig, ax = plt.subplots(2, 1, figsize=(12, 5.2), gridspec_kw={"height_ratios": [2, 1]})
    ax[0].plot(tv, env, color="#e0572a", label="vocal stem RMS (song time)")
    tsong = np.arange(len(curve)) / fps + s["ref_t0"] - res["lag_s"]
    cn = (curve - curve.min()) / (np.ptp(curve) + 1e-9)
    ax[0].plot(tsong, cn, color="#2a64e0", label=f"mouth (take placed at lag {res['lag_s']:+.3f}s)")
    for a, b, w in WORDS:
        if s["window"][0] - 0.5 <= a <= s["window"][1]:
            ax[0].axvline(a, color="#999", lw=0.5)
            ax[0].text(a + 0.02, 1.02, w, fontsize=8, fontfamily=["DejaVu Sans", "Droid Sans Fallback"])
    _, _, tts, tgt = sheet_scan(curve, fps, s["ref_t0"], s["window"])
    ax[0].plot(tts, tgt, color="#3a3", lw=1, ls="--", label="exposure-sheet target")
    ax[0].axvspan(s["window"][0], s["window"][1], color="#ffe9a8", alpha=0.3, lw=0)
    ax[0].set_xlim(s["window"][0] - 0.5, s["window"][1] + 0.5)
    ax[0].legend(fontsize=8, loc="lower right")
    ax[0].set_title(f"{shot.rstrip('@')} {take}: lag {res['lag_s']:+.3f}s  score {res['score']}  ({res['verdict']})  "
                    f"r_level {res['r_level']} r_hp {res['r_hp']} r_sheet {res['r_sheet']}  face-hit {res['face_hit']:.2f}", fontsize=10)
    c = res["_curve"]
    ax[1].plot(c["lags"], c["comb"], color="k", label="score")
    ax[1].plot(c["lags"], c["level"], color="#2a64e0", lw=0.7, label="level r")
    ax[1].plot(c["lags"], c["hp"], color="#e0572a", lw=0.7, label="high-pass r")
    ax[1].plot(c["lags"], c["sheet"], color="#3a3", lw=0.7, label="sheet r")
    ax[1].axvline(res["lag_s"], color="g")
    ax[1].set_ylim(-0.6, 1)
    ax[1].set_xlabel("lag (s): clip_time = song_time - ref_t0 + lag")
    ax[1].legend(fontsize=7)
    fig.tight_layout()
    fig.savefig(out, dpi=90)
    plt.close(fig)


def check_video(shot, take, mp4, m, curve, res, out):
    """Left: the take. Right: mouth zoom + scrolling curves (vocal vs mouth at the measured lag). Audio: the song,
    starting at song time ref_t0 - lag, so what you hear is what the renderer will play against this take."""
    import cv2
    from PIL import Image, ImageDraw, ImageFont
    s = SHOTS[shot]
    fps, lag, t0 = m["fps"], res["lag_s"], s["ref_t0"]
    LAT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    fonts = {(c, z): ImageFont.truetype(CJK_FONT if c else LAT, z) for c in (0, 1) for z in (13, 18)}
    cjk = lambda t: any(ord(ch) > 0x2E80 for ch in t)
    font, small = (lambda t: fonts[(cjk(t), 18)]), (lambda t: fonts[(cjk(t), 13)])
    tv, env = vocal_env(t0 - lag - 2, t0 - lag + m["n"] / fps + 2)
    cn = (curve - np.percentile(curve, 2)) / (np.percentile(curve, 98) - np.percentile(curve, 2) + 1e-9)
    mx, my, fh = (fill(m[k]) for k in ("mx", "my", "fh"))
    if mx is not None:
        k = np.ones(5) / 5
        mx, my, fh = (np.convolve(np.pad(v, 2, mode="edge"), k, mode="valid") for v in (mx, my, fh))
    cap = cv2.VideoCapture(mp4)
    W0, H0 = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    H = 480
    W = int(round(W0 * H / H0 / 2) * 2)
    P = 480
    tmp = out + ".video.mp4"
    enc = subprocess.Popen([FFMPEG, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W + P}x{H}",
                            "-r", str(fps), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", tmp],
                           stdin=subprocess.PIPE)
    i = 0
    while True:
        ok, f = cap.read()
        if not ok:
            break
        rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
        canvas = Image.new("RGB", (W + P, H), (16, 16, 20))
        canvas.paste(Image.fromarray(rgb).resize((W, H)), (0, 0))
        if mx is not None and i < len(mx):
            h = 0.24 * fh[i]
            box = (int(mx[i] - h * P / 280), int(my[i] - h), int(mx[i] + h * P / 280), int(my[i] + h))
            canvas.paste(Image.fromarray(rgb).crop(box).resize((P, 280)), (W, 0))
        d = ImageDraw.Draw(canvas)
        ts = i / fps + t0 - lag          # song time of this frame
        # curves: 3 s window centred on now
        y0, y1 = 300, 470
        def X(t):
            return W + (t - ts + 1.5) / 3.0 * P
        pts = [(X(t), y1 - (y1 - y0) * e) for t, e in zip(tv, env) if abs(t - ts) < 1.5]
        if len(pts) > 1:
            d.line(pts, fill=(224, 87, 42), width=2)
        tm = np.arange(len(cn)) / fps + t0 - lag
        pts = [(X(t), y1 - (y1 - y0) * min(1, max(0, c))) for t, c in zip(tm, cn) if abs(t - ts) < 1.5]
        if len(pts) > 1:
            d.line(pts, fill=(80, 140, 255), width=2)
        d.line([(W + P / 2, y0 - 10), (W + P / 2, y1)], fill=(255, 255, 255), width=1)
        for a, b, w in WORDS:
            if abs(a - ts) < 1.5:
                d.text((X(a) + 2, y0 - 8), w, font=small(w), fill=(230, 230, 160))
            if a <= ts < b:
                d.text((W + 10, 282), w, font=font(w), fill=(255, 255, 120))
        inwin = s["window"][0] <= ts <= s["window"][1]
        d.text((6, 4), f"{shot.rstrip('@')} {take}  song {ts:6.2f}s  lag {lag:+.3f}s  score {res['score']}",
               font=small("a"), fill=(255, 255, 0) if inwin else (150, 150, 150))
        d.text((W + 300, 282), "vocal", font=small("a"), fill=(224, 87, 42))
        d.text((W + 360, 282), "mouth", font=small("a"), fill=(80, 140, 255))
        enc.stdin.write(np.asarray(canvas).tobytes())
        i += 1
    enc.stdin.close()
    enc.wait()
    dur = i / fps
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", tmp, "-ss", f"{t0 - lag:.4f}", "-t", f"{dur:.4f}", "-i", SONG,
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out], check=True)
    os.remove(tmp)


def take_ref_t0(shot, mp4):
    """Song time of the take's reference audio start, from its sidecar (ref_vocals_<t0>_<dur>s.mp3), else lsshots.json."""
    side = mp4[:-4] + ".json"
    if os.path.exists(side):
        ra = json.load(open(side)).get("reference_audio") or ""
        b = os.path.basename(ra)
        if b.startswith("ref_vocals_"):
            return float(b.split("_")[2])
    return SHOTS[shot]["ref_t0"]


def run_take(shot, mp4, check=True):
    s = dict(SHOTS[shot])
    s["ref_t0"] = take_ref_t0(shot, mp4)
    SHOTS[shot + "@"] = s
    take = os.path.basename(mp4)[:-4]
    m = mouthmod.cached(mp4)
    curve = mouth_curve(m)
    res = {"shot": shot, "take": take, "file": os.path.relpath(mp4, ROOT), "ref_t0": s["ref_t0"], "window": s["window"],
           "face_hit": round(m["hit"], 3), "frames": m["n"], "fps": m["fps"]}
    res["mouth_source"] = m.get("source")
    if curve is None or curve.std() < 1e-6:
        res.update(lag_s=None, score=None, verdict="no face track")
    else:
        mw = s.get("measure_window", s["window"])
        mw = [max(mw[0], s["ref_t0"] + 0.3), mw[1]]
        res["measure_window"] = mw
        res.update(lag_scan(curve, m["fps"], s["ref_t0"], mw))
        if s.get("held"):
            cn = (curve - np.percentile(curve, 5)) / (np.percentile(curve, 95) - np.percentile(curve, 5) + 1e-9)
            th = np.arange(s["held"][0] + 0.15, s["held"][1], 1 / 48) - s["ref_t0"] + res["lag_s"]
            th = th[(th >= 0) & (th <= (len(cn) - 1) / m["fps"])]
            res["held_open"] = round(float((np.interp(th, np.arange(len(cn)) / m["fps"], cn) > 0.35).mean()), 3) if len(th) else None
        res["verdict"] = verdict(res["score"]) + (" (ambiguous peak)" if res["ambiguous"] else "")
        res.update(event_scan(curve, m["fps"], s["ref_t0"], mw))
        if res["event_lag_s"] is not None:
            res["event_agrees"] = bool(abs(res["event_lag_s"] - res["lag_s"]) <= 0.1)
        res.update(eye_drift(m))
        base = mp4[:-4]
        plot(shot + "@", take, m, curve, res, base + "_sync.png")
        if check:
            check_video(shot + "@", take, mp4, m, curve, res, base + "_check.mp4")
            res["check_mp4"] = os.path.relpath(base + "_check.mp4", ROOT)
    side = {k: v for k, v in res.items() if k != "_curve"}
    json.dump(res, open(mp4[:-4] + ".sync.json", "w"), indent=1, ensure_ascii=False)
    print(json.dumps({k: side.get(k) for k in ("take", "lag_s", "score", "r_level", "r_hp", "r_sheet", "lag_sheet_only", "score_at_0", "ambiguous",
                                               "event_lag_s", "event_score", "held_open", "face_hit", "mouth_source", "iris_drift", "verdict")}), flush=True)
    return side


def aggregate(shot):
    d = os.path.join(ROOT, "media", "gen", shot)
    rows = {}
    for p in sorted(glob.glob(os.path.join(d, "take_*.sync.json"))):
        r = json.load(open(p))
        r.pop("_curve", None)
        side = os.path.join(d, r["take"] + ".json")
        if os.path.exists(side):
            sd = json.load(open(side))
            r["res"], r["model"] = sd.get("res"), sd.get("model")
        rows[r["take"]] = r
    scored = [r for r in rows.values() if r.get("score") is not None]
    out = {"shot": shot, "lyric": SHOTS[shot]["lyric"], "window": SHOTS[shot]["window"], "ref_t0": SHOTS[shot]["ref_t0"],
           "convention": "clip_time = song_time - ref_t0 + lag_s; play the take from clip time (window_start - ref_t0 + lag_s) at the cut",
           "takes": rows}
    if scored:
        b = max(scored, key=lambda r: r["score"])
        out["best_score_take"] = b["take"]
        pk = os.path.join(ROOT, "media", "gen", "picks.json")
        pick = json.load(open(pk)).get(shot, {}) if os.path.exists(pk) else {}
        c = rows.get(pick.get("take"), b)          # the chosen take (media/gen/picks.json) wins over the best score
        out.update(chosen=c["take"], chosen_note=pick.get("note", "best score"), lag_s=c["lag_s"], score=c["score"],
                   verdict=c["verdict"], ref_t0=c["ref_t0"], check_mp4=c.get("check_mp4"))
    json.dump(out, open(os.path.join(d, "sync.json"), "w"), indent=1, ensure_ascii=False)
    return out


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--no-check" not in sys.argv
    shot, sel = args[0], args[1:]
    d = os.path.join(ROOT, "media", "gen", shot)
    files = [os.path.join(d, t + ".mp4") for t in sel] if sel else sorted(
        p for p in glob.glob(os.path.join(d, "take_*.mp4")) if not p.endswith("_check.mp4"))
    for f in files:
        run_take(shot, f, check)
    a = aggregate(shot)
    print(f"{shot}: chosen {a.get('chosen')} lag {a.get('lag_s')} score {a.get('score')} {a.get('verdict')} (best score: {a.get('best_score_take')})")
