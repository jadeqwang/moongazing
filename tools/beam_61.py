#!/usr/bin/env python3
"""6.1 (rev3 HOME, Oct 8 2026): the flashlight beam and the lit toy Moon, drawn onto a rubbing-prepped take.

The take (K_6.1/take_8) is generated from K_6.1_dark.jpg, where the flashlight is off: the video model only moves the
three people. This tool lights the shot, deterministically, on the tracked hand:

  * the flashlight (T's fist) and the toy Moon (M's hand) are tracked through the take (pyramidal LK from the keyframe);
  * the beam's direction per source frame is AIM below: where the take itself shows a lit lens (source frames >= 46,
    the flashlight pointing left and down at the tree and the deck) it is read off the take; from there it swings up
    and over in one eased arc and reaches the toy Moon at source frame HIT, after which it stays on the tracked Moon;
  * light = a narrow cone with a soft skirt from the lens: a little haze in the air (screen) and a DODGE of whatever is
    in it, so figures, leaves and timber light up as the beam crosses them while empty sky only greys; the cone is
    blurred along its sweep (the beam moves up to 9 degrees per source frame);
  * once the beam is on it the toy Moon is drawn lit: a shaded sphere (bright limb toward the flashlight, far limb in
    shadow), a halo, and a spill that lifts M's hand and wrist. M's fingers in front of the ball are kept.

Run AFTER tools/roto_prep_rubbing.py (which wipes the folder); it keeps the un-lit frames as n_%04d.jpg in the roto
folder, so it can be re-run:

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/roto_prep_rubbing.py K_6.1/take_8 --key media/keyframes/K_6.1_dark.jpg --reverse --range 0:100 \
         --prefer video --region 0.0,0.08,0.74,1.0
    $MPY tools/beam_61.py K_6.1/take_8 [--debug out.jpg]
Writes c_%04d.jpg (lit), n_%04d.jpg (un-lit copies), beam.json (per output frame: src, lens, aim, moon, lit).
"""
import argparse
import json
import os
import shutil
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from roto_prep import extract_frames, register_key  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# keyframe uv (K_6.1_dark.jpg): three points on the flashlight / fist, the toy Moon's centre and radius (of the width)
HAND_UV = [(0.395, 0.438), (0.366, 0.447), (0.383, 0.452)]
MOON_UV, MOON_R = (0.5756, 0.2990), 0.0128
HALF_LEN = 0.0165           # lens distance from the tracked fist centre (of the width)
HIT = 22                    # source frame at which the beam is on the Moon (the section file puts it on 月)
# beam direction, degrees counter-clockwise from screen-right, at source frames (>= 46: read off the take's lit lens)
AIM = [(100, 252), (94, 250), (88, 245), (82, 240), (76, 225), (70, 215), (64, 200), (58, 185), (52, 180), (46, 172),
       (42, 150), (38, 108), (34, 72), (30, 48), (26, 33)]


def pchip(xs, ys, x):
    """Monotone cubic through (xs, ys), xs ascending."""
    xs, ys = np.asarray(xs, float), np.asarray(ys, float)
    h = np.diff(xs); d = np.diff(ys) / h
    m = np.zeros_like(ys); m[0], m[-1] = d[0], d[-1]
    for i in range(1, len(xs) - 1):
        m[i] = 0 if d[i - 1] * d[i] <= 0 else 2 * d[i - 1] * d[i] / (d[i - 1] + d[i])
    x = float(np.clip(x, xs[0], xs[-1]))
    i = int(np.clip(np.searchsorted(xs, x) - 1, 0, len(xs) - 2))
    t = (x - xs[i]) / h[i]
    return ((2 * t ** 3 - 3 * t ** 2 + 1) * ys[i] + (t ** 3 - 2 * t ** 2 + t) * h[i] * m[i]
            + (-2 * t ** 3 + 3 * t ** 2) * ys[i + 1] + (t ** 3 - t ** 2) * h[i] * m[i + 1])


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# the rubbing transfer of roto_prep_rubbing.py (green channel) and back
def to_tone(img):
    return np.clip((img[..., 1].astype(np.float32) / 255 - 0.072) / (0.86 * 0.971), 0, 1)


def from_tone(t):
    out = np.array([0.070, 0.072, 0.075]) + np.clip(t, 0, 1)[..., None] * np.array([0.82, 0.86, 0.88]) * 0.971
    return np.clip(out * 255, 0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--debug", default="")
    a = ap.parse_args()
    shot, take = a.clip.split("/")
    gdir = os.path.join(ROOT, "media", "gen", shot)
    rdir = os.path.join(gdir, "roto", take)
    meta = json.load(open(os.path.join(rdir, "meta.json")))
    track = json.load(open(os.path.join(rdir, "track.json")))
    W, H = meta["w"], meta["h"]
    frames = extract_frames(os.path.join(gdir, take + ".mp4"), os.path.join(gdir, "frames", take))
    key0 = cv2.imread(os.path.join(ROOT, meta["keySource"]))
    key = cv2.resize(key0, (W, H), interpolation=cv2.INTER_AREA)
    f0 = cv2.imread(frames[0]); fh, fw = f0.shape[:2]
    F2K = cv2.invertAffineTransform(register_key(key, f0, fw, fh).astype(np.float64))

    def gray(i):
        return cv2.cvtColor(cv2.warpAffine(cv2.imread(frames[i]), F2K, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE), cv2.COLOR_BGR2GRAY)

    # ---- tracks (keyframe px), source frames 0..S
    S = max(r["src"] for r in track)
    lk = dict(winSize=(51, 51), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 40, 0.01))
    mu = np.array(MOON_UV, np.float32) * [W, H]
    R = MOON_R * W
    pts = np.concatenate([np.array(HAND_UV, np.float32) * [W, H], mu + np.array([[0, 0], [-0.4 * R, 1.3 * R], [0.5 * R, 1.5 * R], [-0.8 * R, 0]], np.float32)]).astype(np.float32).reshape(-1, 1, 2)
    hand, moon = [pts[:3, 0].mean(0)], [mu.copy()]
    prev = gray(0); off = pts[3:, 0].mean(0) - mu
    for i in range(1, S + 1):
        g = gray(i)
        pts, _, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts, None, **lk)
        prev = g
        hand.append(pts[:3, 0].mean(0)); moon.append(pts[3:, 0].mean(0) - off)
    hand, moon = np.array(hand), np.array(moon)
    for arr in (hand, moon):                                   # the take's micro-jitter is not motion of the hand
        for k in (0, 1):
            arr[:, k] = cv2.GaussianBlur(arr[:, k].reshape(-1, 1), (1, 0), 1.2, borderType=cv2.BORDER_REPLICATE).ravel()

    def moon_dir(s):
        s = int(np.clip(round(s), 0, S))
        lens = hand[s] + HALF_LEN * W * np.array([0.92, -0.39])
        v = moon[s] - lens
        return np.degrees(np.arctan2(-v[1], v[0]))

    xs = [HIT] + [f for f, _ in AIM][::-1]
    ys = [moon_dir(HIT)] + [d for _, d in AIM][::-1]

    def aim(s):                                                # degrees, at a (fractional) source frame
        return moon_dir(s) if s <= HIT else pchip(xs, ys, s)

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    SIG_C, SIG_S = np.radians(5.0), np.radians(15.0)

    def cone(lens, deg, dm, lock):
        th = np.radians(deg); ax = np.array([np.cos(th), -np.sin(th)])
        vx, vy = xx - lens[0], yy - lens[1]
        r = np.hypot(vx, vy) + 1e-3
        along = (vx * ax[0] + vy * ax[1]) / r
        phi = np.arccos(np.clip(along, -1, 1))
        fr = smooth(0, 14, r) / (1 + (r / (0.30 * W)) ** 1.6)
        fr *= 1 - lock * 0.9 * smooth(dm + 0.4 * R, dm + 3.5 * R, r)   # the Moon stops the beam
        return np.exp(-(phi / SIG_C) ** 2) * fr, np.exp(-(phi / SIG_S) ** 2) * fr

    os.makedirs(rdir, exist_ok=True)
    rec, dbg = [], []
    for n, tr in enumerate(track):
        s = tr["src"]
        cp, np_ = os.path.join(rdir, f"c_{n:04d}.jpg"), os.path.join(rdir, f"n_{n:04d}.jpg")
        if not os.path.exists(np_):
            shutil.copyfile(cp, np_)
        t0 = to_tone(cv2.imread(np_)); t = t0.copy()
        deg = aim(s)
        ax = np.array([np.cos(np.radians(deg)), -np.sin(np.radians(deg))])
        lens = hand[s] + HALF_LEN * W * ax
        v = moon[s] - lens; dm = float(np.hypot(*v))
        err = abs((np.degrees(np.arctan2(-v[1], v[0])) - deg + 180) % 360 - 180)
        lit = float(1 - smooth(2.0, 12.0, err))
        # the cone, averaged along its sweep over this source frame's neighbourhood
        core = np.zeros((H, W), np.float32); skirt = np.zeros((H, W), np.float32)
        subs = (-1.0, -0.5, 0.0, 0.5, 1.0)
        for ds in subs:
            d2 = aim(float(np.clip(s + ds, 0, S)))
            c, k = cone(lens, d2, dm, lit)
            core += c / len(subs); skirt += k / len(subs)
        t = t * (1 + 1.9 * core + 0.55 * skirt)                 # dodge: what is in the beam lights up
        t = t + (1 - np.clip(t, 0, 1)) * (0.17 * core + 0.035 * skirt)   # haze in the air
        # the lens
        rl = np.hypot(xx - lens[0], yy - lens[1])
        t = np.maximum(t, 0.97 * np.exp(-(rl / (0.0032 * W)) ** 2))
        if lit > 0:
            mx, my = moon[s]
            dx, dy = (xx - mx) / R, (yy - my) / R
            rho = np.hypot(dx, dy)
            u = v / max(dm, 1e-3)
            l = np.array([-u[0] * 0.80, -u[1] * 0.80, 0.60]); l /= np.linalg.norm(l)
            nz = np.sqrt(np.clip(1 - rho ** 2, 0, 1))
            shade = np.clip(dx * l[0] + dy * l[1] + nz * l[2], 0, 1) ** 0.75
            disc = 1 - smooth(0.93, 1.03, rho)
            ball = t0[(rho < 0.8)]
            mare = np.clip(1 + 1.6 * (cv2.GaussianBlur(t0, (0, 0), 1.2) - float(np.median(ball))), 0.72, 1.12)   # the ball's own markings
            sphere = np.clip(0.06 + 1.08 * shade * mare, 0, 1)
            # M's fingers in front of the ball: skin is clearly lighter than the dull ball in the un-lit frame
            skin = cv2.GaussianBlur(cv2.dilate((t0 > float(np.median(ball)) + 0.16).astype(np.float32), np.ones((3, 3), np.uint8)), (0, 0), 1.3)
            skin = np.clip(skin * 1.4, 0, 1) * (rho > 0.45)
            spill = np.exp(-(rho / 4.2) ** 2)
            t = t * (1 + lit * 1.5 * spill * (rho > 0.9))       # light off the Moon on her hand, wrist and hair
            halo = 0.34 * np.exp(-((np.clip(rho - 1, 0, None)) / 1.25) ** 2) + 0.10 * np.exp(-(rho / 5.5) ** 2)
            t = t + (1 - np.clip(t, 0, 1)) * lit * halo * (1 - disc * (1 - skin))
            m = disc * (1 - skin) * lit
            t = t * (1 - m) + np.maximum(t, sphere) * m
        cv2.imwrite(cp, from_tone(t), [cv2.IMWRITE_JPEG_QUALITY, 93])
        rec.append({"n": n, "src": s, "lens": [round(float(lens[0]), 1), round(float(lens[1]), 1)], "aim": round(float(deg), 1),
                    "moon": [round(float(moon[s][0]), 1), round(float(moon[s][1]), 1)], "lit": round(lit, 3)})
        if a.debug and n % 6 == 0:
            d = cv2.resize(from_tone(t)[int(0.05 * H):int(0.95 * H), int(0.05 * W):int(0.75 * W)], None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
            cv2.putText(d, f"n{n} s{s} {deg:.0f} lit{lit:.1f}", (4, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1)
            dbg.append(d)
    json.dump(rec, open(os.path.join(rdir, "beam.json"), "w"))
    meta["beam"] = {"tool": "beam_61.py", "hit_src": HIT, "hit_out": next(r["n"] for r in rec if r["src"] <= HIT)}
    json.dump(meta, open(os.path.join(rdir, "meta.json"), "w"))
    print(f"{a.clip}: lit {len(rec)} frames; beam on the Moon from output frame {meta['beam']['hit_out']} (source {HIT})")
    if a.debug:
        cols = 6
        while len(dbg) % cols:
            dbg.append(np.zeros_like(dbg[0]))
        cv2.imwrite(a.debug, np.vstack([np.hstack(dbg[k:k + cols]) for k in range(0, len(dbg), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 88])


if __name__ == "__main__":
    main()
