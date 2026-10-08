#!/usr/bin/env python3
"""Lip-sync check by articulation EVENTS, not by envelope correlation (rev2_ls, Oct 8).

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/sync/viseme_check.py media/gen/LS3/take_15.mp4 --ref_t0 78.91 [--lag 0] [--out DIR] [--box x0,y0,x1,y1]

Why: measure.py correlates a mouth-opening curve with the stem's loudness. On a 1.4 s window of legato singing any
opening correlates with something, and it called takes "good" whose lips did not move on the words (audit, Oct 7).
Here the ground truth is the phone timeline in phones_LS3.json (read off the stem), and a take is judged on whether the
mouth does the right thing AT each phone boundary:
    openness(f)  two independent measures per frame of the take
        lm    inner-lip gap + jawOpen from face landmarks (tools/sync/mouth.py), when the face is found
        px    image measure in a mouth box that follows the face: height of the vertical extent between the lips'
              outer contours is unreliable on line art, so we use dense optical flow from the rest frame instead:
              (vertical displacement of the chin/lower-lip band) - (that of the nose band), over face height.
              Positive = the jaw has dropped. Independent of drawing style.
    events       for each expected up/down event at song time t: the frame where openness crosses the half-way level
                 between the local low and high around it; lag = (mouth - voice) in frames; "none" if the mouth does
                 not change by a clear margin there (a missing articulation)
    lag_fit      the one time shift that best lines the events up, and the residual spread after it
Convention as everywhere: clip_time = song_time - ref_t0 + lag (lag > 0: the mouth is late, start the take earlier).
Outputs (next to the take or in --out): <take>.viseme.json, <take>_viseme.png (curves + phone bands),
<take>_mouthsheet_pNN.jpg (every frame of the phrase: mouth crop, song time, phone).
"""
import argparse
import json
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import mouth as mouthmod  # noqa: E402

PH = json.load(open(os.path.join(HERE, "phones_LS3.json")))
CJK = "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"
LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FPS = 24.0


def frames_of(mp4):
    cap = cv2.VideoCapture(mp4)
    out = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        out.append(f)
    return out


def interp_nan(a):
    a = np.array([np.nan if v is None else v for v in a], float)
    ok = np.isfinite(a)
    if ok.sum() < 2:
        return np.zeros_like(a)
    return np.interp(np.arange(len(a)), np.flatnonzero(ok), a[ok])


def smooth(a, k=3):
    if k <= 1:
        return a
    p = np.pad(a, k // 2, mode="edge")
    return np.convolve(p, np.ones(k) / k, mode="valid")


def norm01(a, lo=3, hi=97):
    l, h = np.percentile(a, lo), np.percentile(a, hi)
    return np.clip((a - l) / max(h - l, 1e-6), 0, 1), float(h - l)


def flow_jaw(frames, M, rest=0):
    """Jaw drop per frame from dense flow rest->i: chin band minus nose band (vertical), over face height."""
    fh = float(np.nanmedian(interp_nan(M["fh"])))
    mx, my = float(interp_nan(M["mx"])[rest]), float(interp_nan(M["my"])[rest])
    H, W = frames[0].shape[:2]
    def band(cy0, cy1, hw):
        x0, x1 = int(max(0, mx - hw * fh)), int(min(W, mx + hw * fh))
        y0, y1 = int(max(0, my + cy0 * fh)), int(min(H, my + cy1 * fh))
        return slice(y0, y1), slice(x0, x1)
    chin = band(0.06, 0.24, 0.16)       # lower lip + chin
    nose = band(-0.30, -0.10, 0.14)     # nose (rigid with the skull)
    g0 = cv2.cvtColor(frames[rest], cv2.COLOR_BGR2GRAY)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    out = []
    for f in frames:
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        fl = dis.calc(g0, g, None)
        out.append((np.median(fl[chin][..., 1]) - np.median(fl[nose][..., 1])) / fh)
    return np.array(out), {"chin": [chin[1].start, chin[0].start, chin[1].stop, chin[0].stop],
                           "nose": [nose[1].start, nose[0].start, nose[1].stop, nose[0].stop], "fh": fh, "mx": mx, "my": my}


def dark_open(frames, M):
    """Area of the dark mouth interior between the lips (line art: the opening is the paper showing, or teeth)."""
    fh = float(np.nanmedian(interp_nan(M["fh"])))
    mxs, mys = smooth(interp_nan(M["mx"]), 5), smooth(interp_nan(M["my"]), 5)
    out = []
    for i, f in enumerate(frames):
        x0, x1 = int(mxs[i] - 0.17 * fh), int(mxs[i] + 0.17 * fh)
        y0, y1 = int(mys[i] - 0.10 * fh), int(mys[i] + 0.12 * fh)
        roi = cv2.cvtColor(f[max(0, y0):y1, max(0, x0):x1], cv2.COLOR_BGR2GRAY).astype(np.float32)
        if roi.size == 0:
            out.append(np.nan); continue
        # row profile of brightness through the centre third: lips are the bright (gold) bands; count rows between the
        # two outermost bright bands = outer lip height
        col = roi[:, roi.shape[1] // 3: 2 * roi.shape[1] // 3].mean(1)
        th = col.min() + 0.45 * (col.max() - col.min())
        rows = np.flatnonzero(col > th)
        out.append((rows.max() - rows.min()) / fh if len(rows) else np.nan)
    return interp_nan(out)


def crossing(t, y, te, direction, pre=0.32, post=0.36):
    """Time where y crosses half-way between its low and high around te (searching te-pre..te+post)."""
    sel = (t >= te - pre) & (t <= te + post)
    if sel.sum() < 4:
        return None, 0.0
    ts, ys = t[sel], y[sel]
    if direction == "down":
        ys = -ys
    best = None
    # the largest rise lo->hi with lo before hi inside the window
    for a in range(len(ys) - 1):
        b = a + 1 + int(np.argmax(ys[a + 1:]))
        if best is None or ys[b] - ys[a] > best[0]:
            best = (ys[b] - ys[a], a, b)
    amp, a, b = best
    if amp <= 0:
        return None, 0.0
    half = (ys[a] + ys[b]) / 2
    for k in range(a, b):
        if ys[k] <= half <= ys[k + 1]:
            u = (half - ys[k]) / max(ys[k + 1] - ys[k], 1e-9)
            return float(ts[k] + u * (ts[k + 1] - ts[k])), float(amp)
    return None, float(amp)


def check(mp4, ref_t0, lag=0.0, out=None, min_amp=0.22, sheet=True, box=None):
    frames = frames_of(mp4)
    n = len(frames)
    stem = os.path.splitext(os.path.basename(mp4))[0]
    out = out or os.path.dirname(mp4)
    os.makedirs(out, exist_ok=True)
    cache = os.path.join(out, stem + ".mouth.json")
    if os.path.exists(cache) and json.load(open(cache)).get("n") == n:
        M = json.load(open(cache))
    else:
        M = mouthmod.track(mp4)
        json.dump(M, open(cache, "w"))
    tc = np.arange(n) / FPS                                    # clip time of each frame
    ts = tc + ref_t0 - lag                                     # song time shown by each frame at this lag
    lm_gap = interp_nan(M["gap"]); lm_jaw = interp_nan(M["jaw"]); width = interp_nan(M["width"])
    jaw_px, boxes = flow_jaw(frames, M)
    lip_h = dark_open(frames, M)
    curves = {}
    curves["lm"], r_lm = norm01(smooth(lm_gap / max(np.percentile(lm_gap, 97), 1e-6) + lm_jaw / max(np.percentile(lm_jaw, 97), 1e-6), 3))
    curves["px"], r_px = norm01(smooth(jaw_px, 3))
    curves["lip"], r_lip = norm01(smooth(lip_h, 3))
    res = {"file": os.path.relpath(mp4, ROOT), "frames": n, "ref_t0": ref_t0, "lag_assumed": lag, "face_hit": M["hit"],
           "range": {"lm_gap_p97": float(np.percentile(lm_gap, 97)), "jaw_px_range_over_fh": r_px, "lip_h_range_over_fh": r_lip},
           "measures": {}}
    # target openness from the phone timeline, sampled per frame
    def target(tt):
        v = np.zeros_like(tt)
        for p in PH["phones"]:
            v[(tt >= p["t0"]) & (tt < p["t1"])] = p["open"]
        return smooth(v, 3)
    for name, y in curves.items():
        ev, lags = [], []
        for e in PH["events"]:
            tm, amp = crossing(ts, y, e["t"], e["dir"])
            ok = tm is not None and amp >= min_amp
            d = (tm - e["t"]) if ok else None
            ev.append({"id": e["id"], "voice_t": e["t"], "mouth_t": None if tm is None else round(tm, 3), "amp": round(amp, 3),
                       "lag_frames": None if d is None else round(d * FPS, 1)})
            if ok:
                lags.append(d)
        # lag scan against the phone target over the phrase 80.6..83.4 (clipped to the take)
        best = (-9, 0)
        for L in np.arange(-0.6, 0.6001, 1 / 96):
            tt = tc + ref_t0 - lag - L
            sel = (tt > 80.6) & (tt < 83.4)
            if sel.sum() < 30:
                continue
            r = np.corrcoef(y[sel], target(tt)[sel])[0, 1]
            if r > best[0]:
                best = (r, L)
        res["measures"][name] = {"events": ev, "n_found": len(lags), "lag_fit_frames": round(float(np.median(lags)) * FPS, 1) if lags else None,
                                 "spread_frames": round(float(np.max(lags) - np.min(lags)) * FPS, 1) if len(lags) > 1 else None,
                                 "scan_lag_frames": round(best[1] * FPS, 1), "scan_r": round(float(best[0]), 3)}
    res["width"] = [round(float(v), 4) for v in width]
    res["curves"] = {k: [round(float(v), 3) for v in y] for k, y in curves.items()}
    json.dump(res, open(os.path.join(out, stem + ".viseme.json"), "w"), indent=1)
    plot(res, curves, width, ts, os.path.join(out, stem + "_viseme.png"))
    if sheet:
        mouth_sheet(frames, M, ts, os.path.join(out, stem + "_mouthsheet"), stem, lag, box)
    return res


def plot(res, curves, width, ts, path):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib import font_manager
    fp = font_manager.FontProperties(fname=CJK)
    fig, ax = plt.subplots(2, 1, figsize=(18, 8), sharex=True)
    for a in ax:
        for p in PH["phones"]:
            a.axvspan(p["t0"], p["t1"], color=(0.2, 0.5, 0.9, 0.08 + 0.25 * p["open"]))
            a.text((p["t0"] + p["t1"]) / 2, 1.04, f'{p["zh"]}\n{p["ph"]}', ha="center", va="bottom", fontproperties=fp, fontsize=9, clip_on=True)
        for e in PH["events"]:
            a.axvline(e["t"], color="k", lw=0.6, ls=":")
        a.axvspan(*PH["shot"], ymin=0, ymax=0.03, color="r")
        a.set_ylim(-0.05, 1.25); a.grid(True, alpha=0.3)
    for k, y in curves.items():
        ax[0].plot(ts, y, marker=".", label=k)
    tt = np.linspace(ts[0], ts[-1], 600)
    tg = np.zeros_like(tt)
    for p in PH["phones"]:
        tg[(tt >= p["t0"]) & (tt < p["t1"])] = p["open"]
    ax[0].plot(tt, tg, "k--", lw=1, label="needed (phones)")
    ax[0].legend(loc="upper left", ncol=4)
    w, _ = norm01(smooth(width, 3))
    ax[1].plot(ts, w, marker=".", color="purple", label="mouth width (landmarks, normalised)")
    ax[1].legend(loc="upper left")
    ax[1].set_xlim(max(ts[0], 78.8), min(ts[-1], 84.0))
    ax[1].set_xlabel(f"song time (s) at lag {res['lag_assumed']:+.3f} s   |   " + "   ".join(
        f"{k}: fit {m['lag_fit_frames']} f, spread {m['spread_frames']} f, {m['n_found']}/6 events, scan {m['scan_lag_frames']} f r={m['scan_r']}"
        for k, m in res["measures"].items()))
    plt.tight_layout(); plt.savefig(path, dpi=70); plt.close(fig)


def phone_at(t):
    for p in PH["phones"]:
        if p["t0"] <= t < p["t1"]:
            return p
    return None


def mouth_sheet(frames, M, ts, base, title, lag, box=None, t_a=81.2, t_b=83.0, cols=8):
    from PIL import Image, ImageDraw, ImageFont
    fh = float(np.nanmedian(interp_nan(M["fh"])))
    mx, my = float(np.nanmedian(interp_nan(M["mx"]))), float(np.nanmedian(interp_nan(M["my"])))
    if box is None:
        box = [mx - 0.34 * fh, my - 0.26 * fh, mx + 0.34 * fh, my + 0.25 * fh]
    x0, y0, x1, y1 = [int(v) for v in box]
    idx = [i for i in range(len(frames)) if t_a - 1e-6 <= ts[i] <= t_b + 1e-6]
    tw = 232; th = round(tw * (y1 - y0) / (x1 - x0))
    f1, f2 = ImageFont.truetype(LATIN, 14), ImageFont.truetype(CJK, 17)
    per = cols * 5
    pages = []
    for pg in range(0, len(idx), per):
        part = idx[pg:pg + per]
        rows = (len(part) + cols - 1) // cols
        im = Image.new("RGB", (cols * (tw + 8) + 8, 34 + rows * (th + 46)), (20, 23, 30))
        d = ImageDraw.Draw(im)
        d.text((8, 6), f"{title} | every frame {t_a}-{t_b} s | lag {lag:+.3f} s | page {pg // per + 1}", fill="white", font=f1)
        for j, i in enumerate(part):
            crop = cv2.cvtColor(frames[i][max(0, y0):y1, max(0, x0):x1], cv2.COLOR_BGR2RGB)
            t = Image.fromarray(crop).resize((tw, th), Image.LANCZOS)
            x, y = 8 + (j % cols) * (tw + 8), 34 + (j // cols) * (th + 46)
            im.paste(t, (x, y))
            p = phone_at(ts[i])
            inshot = PH["shot"][0] - 0.021 <= ts[i] < PH["shot"][1]
            d.text((x, y + th + 2), f"{ts[i]:.3f}s  f{round(ts[i] * 24)}  clip f{i}", fill=(255, 255, 255) if inshot else (140, 140, 140), font=f1)
            if p:
                d.text((x, y + th + 19), p['zh'], fill=(255, 220, 120), font=f2)
                d.text((x + 22, y + th + 21), f"{p['ph']}  need {p['open']:.2f}", fill=(255, 220, 120), font=f1)
        out = f"{base}_p{pg // per + 1:02d}.jpg"
        im.save(out, quality=90); pages.append(out)
    return pages


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("mp4", nargs="+")
    ap.add_argument("--ref_t0", type=float, required=True)
    ap.add_argument("--lag", type=float, default=0.0)
    ap.add_argument("--out")
    ap.add_argument("--box")
    a = ap.parse_args()
    for m in a.mp4:
        r = check(os.path.abspath(m), a.ref_t0, a.lag, a.out, box=[float(v) for v in a.box.split(",")] if a.box else None)
        print(r["file"], "face", r["face_hit"], "ranges", {k: round(v, 4) for k, v in r["range"].items()})
        for k, m_ in r["measures"].items():
            print(f"  {k:4s} fit {m_['lag_fit_frames']} f  spread {m_['spread_frames']} f  found {m_['n_found']}/6  scan {m_['scan_lag_frames']} f r={m_['scan_r']}")
            print("       " + "  ".join(f"{e['id']}:{e['lag_frames']}({e['amp']})" for e in m_["events"]))
