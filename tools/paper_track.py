#!/usr/bin/env python3
"""Paper tracking for JS-composited type (render/src/scenes/papertype.js). The video model only ever sees BLANK paper;
this tool measures where the paper is in every frame of a roto-prepped take, so the renderer can set crisp type on it.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/paper_track.py K_3.5_front/take_1 env             # a flat envelope lying on the desk
    $MPY tools/paper_track.py K_3.5_back/take_2 letter [--panel 990/2100] [--check out.jpg]
                                                                  # a sheet drawn out of the envelope, away from her

Writes media/gen/<shot>/roto/<take>/paper.json (merged per track) and occlusion masks p_<track>_NNNN.png in SHEET space
(white = bare paper, black = a hand is over it). All coordinates are work px of that frame (roto meta w x h).

  env     the envelope is the largest pale, unsaturated region; its rectangle is fitted on frame 0 (convex hull ->
          minimum-area rectangle; a hand on a corner does not matter) and then followed per frame; if it never moves
          more than ~1.5 px it is stored as static (the same quad in every frame), which keeps the type rock steady.
  letter  the sheet is the pale region that appears BEYOND the envelope's far (top) long edge, i.e. over the opened
          flap and the desk, where there was no pale paper in frame 0. Per frame: its side edges and its far edge are
          fitted; the whole panel's quad is that far edge plus the panel height (width x --panel); `vis` = the part of
          the panel that has left the envelope.
"""
import argparse
import json
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(clip):
    shot, take = clip.split("/")
    rdir = os.path.join(ROOT, "media", "gen", shot, "roto", take)
    meta = json.load(open(os.path.join(rdir, "meta.json")))
    fdir = os.path.join(ROOT, "media", "gen", shot, "frames", take)
    files = sorted(f for f in os.listdir(fdir) if f.endswith(".jpg"))[: meta["frames"]]
    W, H = meta["w"], meta["h"]
    frames = [cv2.resize(cv2.imread(os.path.join(fdir, f)), (W, H), interpolation=cv2.INTER_AREA) for f in files]
    return rdir, meta, frames


def sat(bgr):
    b, r = bgr[..., 0].astype(np.float32), bgr[..., 2].astype(np.float32)
    return (r - b) / np.maximum(r, 1.0)


def paper_mask(bgr):
    """pale, unsaturated: ivory / white paper (not skin, not desk, not the globe)"""
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    m = ((g > 150) & (sat(bgr) < 0.30)).astype(np.uint8) * 255
    return cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))


def skin_mask(bgr):
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    m = ((sat(bgr) > 0.33) & (g > 95)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    return cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))   # nails and line work inside a hand


def order_quad(box):
    """4 points -> TL, TR, BR, BL for a sheet whose long axis is roughly horizontal"""
    box = np.asarray(box, np.float32)
    idx = np.argsort(box[:, 1])
    top, bot = box[idx[:2]], box[idx[2:]]
    top = top[np.argsort(top[:, 0])]
    bot = bot[np.argsort(bot[:, 0])]
    return np.array([top[0], top[1], bot[1], bot[0]], np.float32)


def env_rect(bgr, hint=None):
    m = paper_mask(bgr)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n < 2:
        return None
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    comp = (lab == k).astype(np.uint8)
    cnt = max(cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea)
    return order_quad(cv2.boxPoints(cv2.minAreaRect(cv2.convexHull(cnt)))), comp


def occlusion(bgr, quad, sw, sh):
    """bare-paper mask in sheet space (sw x sh): white where no hand is over the sheet"""
    Hm = cv2.getPerspectiveTransform(quad.astype(np.float32), np.float32([[0, 0], [sw, 0], [sw, sh], [0, sh]]))
    sk = cv2.dilate(skin_mask(bgr), np.ones((9, 9), np.uint8))
    w = cv2.warpPerspective(255 - sk, Hm, (sw, sh), flags=cv2.INTER_LINEAR, borderValue=255)
    return cv2.GaussianBlur(w, (0, 0), 1.2)


def smooth(arr, k=5):
    arr = np.asarray(arr, np.float32)
    pad = np.pad(arr, [(k // 2, k // 2)] + [(0, 0)] * (arr.ndim - 1), mode="edge")
    return np.stack([np.median(pad[i:i + k], axis=0) for i in range(len(arr))])


def track_env(frames):
    q0, _ = env_rect(frames[0])
    quads = []
    for f in frames:
        r = env_rect(f)
        quads.append(r[0] if r is not None else q0)
    quads = np.array(quads)
    dev = float(np.abs(quads - np.median(quads, axis=0)).max())
    static = np.percentile(np.abs(quads - np.median(quads, axis=0)), 90) < 1.5
    if static:
        quads = np.repeat(np.median(quads, axis=0)[None], len(frames), axis=0)
    else:
        quads = smooth(quads, 7)
    return quads, static, dev


def white_mask(bgr):
    """the letter: bright neutral white, clearly whiter than the ivory envelope"""
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    m = ((g > 186) & (sat(bgr) < 0.178)).astype(np.uint8) * 255      # lamplit white (sat ~0.14) vs ivory envelope (~0.22+)
    return cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))


def track_letter(frames, env_q, panel):
    """the white sheet drawn out of the envelope, edges parallel to the envelope's. env_q: TL, TR, BR, BL (static).
    Returns per frame (quad of the whole panel, bare-letter mask in frame space) or None, and the sheet width."""
    H, W = frames[0].shape[:2]
    tl, tr, br, bl = env_q
    ux = (tr - tl) / np.linalg.norm(tr - tl)                 # along the envelope's long edge
    uy = (bl - tl) / np.linalg.norm(bl - tl)                 # down the envelope (toward her)
    env_w = float(np.linalg.norm(tr - tl))
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    px, py = xx - tl[0], yy - tl[1]
    a = px * ux[0] + py * ux[1]
    b = px * uy[0] + py * uy[1]
    near = (a > -0.1 * env_w) & (a < 1.1 * env_w) & (b > -0.9 * env_w) & (b < 0.75 * env_w)
    raw, masks = [], []
    for f in frames:
        m = (white_mask(f) > 0) & near
        n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
        if n < 2 or st[1:, cv2.CC_STAT_AREA].max() < 900:
            raw.append(None); masks.append(None); continue
        m = lab == (1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])))
        top = float(np.percentile(b[m], 1.0))
        band = m & (b < top + 0.06 * env_w)                   # the straight far edge: its ends are the sheet's sides
        if band.sum() < 50:
            raw.append(None); masks.append(None); continue
        # left side from the far edge (her hand holds the right-hand corner); right side from the whole visible sheet
        raw.append((float(np.percentile(a[band], 2)), float(np.percentile(a[m], 99)), top, float(np.percentile(b[m], 99))))
        masks.append(m)
    good = [o for o in raw if o and o[3] - o[2] > 0.12 * env_w]
    if not good:
        return [None] * len(frames), 0.0
    w = float(np.percentile([o[1] - o[0] for o in good], 90))   # the sheet's width is constant
    ph = w * panel
    idx = [i for i, o in enumerate(raw) if o]
    tops = np.full(len(raw), np.nan, np.float32); lefts = np.full(len(raw), np.nan, np.float32)
    tops[idx] = smooth(np.array([raw[i][2] for i in idx], np.float32)[:, None], 5)[:, 0]
    lefts[idx] = smooth(np.array([raw[i][0] for i in idx], np.float32)[:, None], 9)[:, 0]
    res = []
    for o, top, a0, m in zip(raw, tops, lefts, masks):
        if o is None:
            res.append(None); continue
        p_tl = tl + ux * a0 + uy * top
        p_tr = p_tl + ux * w
        q = np.array([p_tl, p_tr, p_tr + uy * ph, p_tl + uy * ph], np.float32)
        res.append((q, m))
    return res, w


def letter_occlusion(bgr, m, quad, sw, sh):
    """bare-letter mask in sheet space: white paper that is really there (not skin, not the envelope over it)"""
    Hm = cv2.getPerspectiveTransform(quad.astype(np.float32), np.float32([[0, 0], [sw, 0], [sw, sh], [0, sh]]))
    ok = m.astype(np.uint8) * 255
    ok = cv2.erode(cv2.morphologyEx(ok, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)), np.ones((5, 5), np.uint8))
    ok[cv2.dilate(skin_mask(bgr), np.ones((7, 7), np.uint8)) > 0] = 0
    w = cv2.warpPerspective(ok, Hm, (sw, sh), flags=cv2.INTER_LINEAR, borderValue=0)
    return cv2.GaussianBlur(w, (0, 0), 1.2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("track", choices=["env", "letter"])
    ap.add_argument("--panel", default="990/2100", help="sheet height/width (letter)")
    ap.add_argument("--aspect", default="1460/2290", help="sheet height/width (env)")
    ap.add_argument("--static", type=int, default=0, help="use the median envelope quad of the first N frames for every frame")
    ap.add_argument("--check", default="")
    a = ap.parse_args()
    rdir, meta, frames = load(a.clip)
    pj = os.path.join(rdir, "paper.json")
    paper = json.load(open(pj)) if os.path.exists(pj) else {"w": meta["w"], "h": meta["h"], "tracks": {}}
    num, den = map(float, a.panel.split("/")); panel = num / den
    env_q, static, dev = track_env(frames[:a.static] if a.static else frames)
    if a.static:
        env_q = np.repeat(np.median(env_q, axis=0)[None], len(frames), axis=0); static = True
    print(f"{a.clip}: {len(frames)} frames; envelope {'static' if static else 'MOVES'} (max dev {dev:.1f} px), "
          f"w {np.linalg.norm(env_q[0][1] - env_q[0][0]):.0f} h {np.linalg.norm(env_q[0][3] - env_q[0][0]):.0f} "
          f"aspect {np.linalg.norm(env_q[0][3] - env_q[0][0]) / np.linalg.norm(env_q[0][1] - env_q[0][0]):.3f}")
    for f in os.listdir(rdir):
        if f.startswith(f"p_{a.track}_"):
            os.remove(os.path.join(rdir, f))
    if a.track == "env":
        sw, sh = 458, 292
        fr = []
        for i, (f, q) in enumerate(zip(frames, env_q)):
            cv2.imwrite(os.path.join(rdir, f"p_env_{i:04d}.png"), occlusion(f, q, sw, sh))
            fr.append({"q": [round(float(v), 2) for v in q.ravel()], "vis": 1})
        paper["tracks"]["env"] = {"static": bool(static), "frames": fr, "mask": "p_env_"}
    else:
        res, w = track_letter(frames, np.median(env_q, axis=0), panel)
        sw, sh = 420, int(round(420 * panel))
        fr = []
        for i, (f, r) in enumerate(zip(frames, res)):
            if r is None:
                fr.append({"q": None, "vis": 0}); continue
            q, m = r
            cv2.imwrite(os.path.join(rdir, f"p_letter_{i:04d}.png"), letter_occlusion(f, m, q, sw, sh))
            fr.append({"q": [round(float(v), 2) for v in q.ravel()], "vis": 1})
        paper["tracks"]["letter"] = {"frames": fr, "mask": "p_letter_", "width": round(float(w), 1)}
        print(f"  letter width {w:.0f} px ({w / np.linalg.norm(env_q[0][1] - env_q[0][0]):.2f} of the envelope); first seen at frame "
              f"{next((i for i, x in enumerate(fr) if x['q']), None)}")
    json.dump(paper, open(pj, "w"))
    if a.check:
        tr = paper["tracks"][a.track]["frames"]
        idx = [round(i * (len(frames) - 1) / 11) for i in range(12)]
        tiles = []
        for i in idx:
            im = frames[i].copy()
            if tr[i]["q"]:
                q = np.array(tr[i]["q"], np.float32).reshape(4, 2)
                cv2.polylines(im, [q.astype(np.int32)], True, (0, 255, 0), 2)
            cv2.putText(im, f"f{i}", (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            tiles.append(cv2.resize(im, (640, 360)))
        sheet = np.vstack([np.hstack(tiles[r * 4:r * 4 + 4]) for r in range(3)])
        cv2.imwrite(a.check, sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
        print("  check sheet:", a.check)


if __name__ == "__main__":
    sys.exit(main())
