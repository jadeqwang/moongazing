#!/usr/bin/env python3
"""Edge tracker for a sheet of paper that a take MOVES (round four, ENV: the envelope front in 3.5a, which is let go of,
settles, and is then turned over). Writes the same media/gen/<shot>/roto/<take>/paper.json track that
render/src/scenes/papertype.js reads (see tools/paper_track.py), but measures the sheet in EVERY frame instead of
using one median rectangle, so type set on the paper stays on the paper while it slides, turns and tilts.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/paper_quad.py K_3.5_front/take_6 env [--until 60] [--aspect 105/241] [--check out.jpg]

How: the sheet's outline in frame 0 is the largest pale region's minimum-area rectangle (hands taken off first). From
then on each of the four edges is followed on its own: sample points along the edge where it was a frame ago, look
along the normal for the step from bright paper to dark desk (sub-pixel, on the luminance gradient), drop samples
where a hand is on or beside the edge, and fit a straight line (Huber). The four lines are intersected. An edge with
too few clean samples (a hand along it, or the face nearly edge-on) is rebuilt from the other three and the sheet's
known proportions. While the sheet does not move (all corners within 0.5 px of where they were), one quad is held, so
the type is rock steady on a still sheet. As the face turns away its print fades with the face's area (`a`), and
after --until (or once the face is edge-on) there is no quad.
"""
import argparse
import json
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import paper_track as pt   # noqa: E402


MIN_N = 8          # clean samples an edge needs


def lum(bgr):
    return cv2.GaussianBlur(cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 1.0)


def chroma(bgr):
    b, g, r = [bgr[..., i].astype(np.float32) for i in range(3)]
    return (r - b) / np.maximum(r, 1.0)


def classify(frame, q):
    """paper / skin thresholds from this take's own colours: paper = the pixels well inside the quad"""
    H, W = frame.shape[:2]
    c = q.mean(axis=0)
    inner = cv2.fillConvexPoly(np.zeros((H, W), np.uint8), (c + (q - c) * 0.55).astype(np.int32), 1) > 0
    g, s = lum(frame), chroma(frame)
    return dict(g=float(np.median(g[inner])), s=float(np.median(s[inner])))


def skin_mask(frame, ref):
    """hands: clearly more saturated than the paper and not dark (the desk is dark)"""
    g, s = lum(frame), chroma(frame)
    # (the lamplit desk is as bright as a hand but far more saturated: sat 0.5-0.7 against 0.3-0.4)
    m = ((s > ref['s'] + 0.085) & (s < 0.46) & (g > 0.55 * ref['g']) & (g < 1.02 * ref['g'])).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    return cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))


def first_quad(frame):
    g, s = lum(frame), chroma(frame)
    m = ((g > 150) & (s < 0.30)).astype(np.uint8) * 255
    for _ in range(3):                                     # hands off: re-threshold on the paper's own colour
        n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)), 8)
        k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        comp = lab == k
        core = cv2.erode(comp.astype(np.uint8), np.ones((41, 41), np.uint8)) > 0
        if core.sum() < 500:
            break
        gs, ss = float(np.median(g[core])), float(np.median(s[core]))
        m = ((g > 0.86 * gs) & (s < ss + 0.05)).astype(np.uint8) * 255
    n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8)), 8)
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    cnt = max(cv2.findContours((lab == k).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea)
    return pt.order_quad(cv2.boxPoints(cv2.minAreaRect(cv2.convexHull(cnt))))


def hull_quad(frame, ref, prev):
    """the paper's outline cut down to four corners, named by continuity with `prev`: a start for the edge fit when the
    sheet has moved too far for the edges to be found from where they were"""
    g, s = lum(frame), chroma(frame)
    m = ((g > 0.80 * ref['g']) & (s < ref['s'] + 0.06)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n < 2:
        return None
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    cnt = max(cv2.findContours((lab == k).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea)
    hull = cv2.convexHull(cnt)[:, 0, :].astype(np.float32)
    while len(hull) > 4:
        a0, a1 = np.roll(hull, 1, axis=0), np.roll(hull, -1, axis=0)
        tri = np.abs((hull[:, 0] - a0[:, 0]) * (a1[:, 1] - a0[:, 1]) - (hull[:, 1] - a0[:, 1]) * (a1[:, 0] - a0[:, 0]))
        hull = np.delete(hull, int(np.argmin(tri)), axis=0)
    if len(hull) < 4:
        return None
    cs = hull[np.argsort(np.arctan2(hull[:, 1] - hull[:, 1].mean(), hull[:, 0] - hull[:, 0].mean()))]
    return min((np.roll(cs, k, axis=0) for k in range(4)), key=lambda q: float(np.linalg.norm(q - prev)))


def end_search(g, sk, top, bot, cur, e, ref):
    """find a SHORT edge (e = 1 right, 3 left) with no idea where it is: from the sheet's middle walk outward along the
    long direction at several heights until the paper stops; where it stops at dark desk (not at a hand) is the edge."""
    H, W = g.shape
    c = cur.mean(axis=0)
    d = cur[1] - cur[0]
    Lw = float(np.linalg.norm(d)); d = d / max(Lw, 1e-6)
    if e == 3:
        d = -d
    tp = c + top[0] * (top[1] - float(top[0] @ c))          # the foot of the middle on the top and bottom lines
    bp = c + bot[0] * (bot[1] - float(bot[0] @ c))
    pts = []
    for u in np.linspace(0.06, 0.94, 23):
        base = tp + (bp - tp) * u
        ts = np.arange(0, 0.85 * Lw, 1.0, dtype=np.float32)
        xs, ys = base[0] + d[0] * ts, base[1] + d[1] * ts
        ok = (xs > 1) & (xs < W - 2) & (ys > 1) & (ys < H - 2)
        xs, ys, ts = xs[ok], ys[ok], ts[ok]
        if len(ts) < 20:
            continue
        prof = cv2.remap(g, xs[None], ys[None], cv2.INTER_LINEAR)[0]
        skn = cv2.remap(sk, xs[None], ys[None], cv2.INTER_NEAREST)[0] > 0
        stop = np.nonzero((prof < 0.74 * ref['g']) | skn)[0]
        if not len(stop) or stop[0] < 8:
            continue
        j = int(stop[0])
        if skn[max(0, j - 3):j + 10].any() or prof[min(len(prof) - 1, j + 6)] > 0.6 * ref['g']:
            continue                                        # the paper ends at a hand here, or not at dark desk
        lo, hi = float(prof[min(len(prof) - 1, j + 6)]), float(np.median(prof[max(0, j - 12):j - 3]))
        mid = (lo + hi) / 2
        k = j
        while k > 1 and prof[k - 1] < mid:
            k -= 1
        while k < len(prof) - 1 and prof[k] > mid:
            k += 1
        t = ts[k - 1] + (prof[k - 1] - mid) / max(prof[k - 1] - prof[k], 1e-3)
        pts.append(base + d * t)
    if len(pts) < 4:
        return None
    pts = np.array(pts, np.float32)
    vx, vy, x0, y0 = cv2.fitLine(pts, cv2.DIST_HUBER, 0, 0.01, 0.01).ravel()
    nl = np.array([-vy, vx], np.float32)
    return nl, float(nl @ np.array([x0, y0], np.float32))


def edge_fit(g, skin, p0, p1, inward, ref, reach=14.0, n=90):
    """follow one edge: returns (normal, c) with normal . x = c, and the number of clean samples"""
    d = p1 - p0
    L = float(np.linalg.norm(d))
    if L < 12:
        return None, 0
    d = d / L
    nrm = np.array([-d[1], d[0]], np.float32)
    if nrm @ inward < 0:
        nrm = -nrm                                          # the normal points INTO the paper
    ts = np.linspace(0.04, 0.96, n) * L
    offs = np.arange(-reach, reach + 0.01, 0.5, dtype=np.float32)
    H, W = g.shape
    pts = []
    for t in ts:
        base = p0 + d * t
        xs, ys = base[0] + nrm[0] * offs, base[1] + nrm[1] * offs
        if xs.min() < 1 or ys.min() < 1 or xs.max() > W - 2 or ys.max() > H - 2:
            continue
        prof = cv2.remap(g, xs[None].astype(np.float32), ys[None].astype(np.float32), cv2.INTER_LINEAR)[0]
        sk = cv2.remap(skin, xs[None].astype(np.float32), ys[None].astype(np.float32), cv2.INTER_NEAREST)[0]
        if sk.max() > 0:
            continue                                        # a hand on or beside the edge here
        grad = np.gradient(prof)                            # > 0 going from desk into paper
        i = int(np.argmax(grad))
        if i < 3 or i > len(offs) - 4:
            continue
        lo, hi = prof[max(0, i - 6):i - 1].min(), prof[i + 2:i + 7].max()
        if hi - lo < 0.33 * ref['g'] or hi < 0.72 * ref['g']:
            continue                                        # not a paper-to-desk step
        a, b, c = grad[i - 1], grad[i], grad[i + 1]
        den = a - 2 * b + c
        sub = 0.5 * (a - c) / den if abs(den) > 1e-6 else 0.0
        o = offs[i] + 0.5 * float(np.clip(sub, -1, 1))
        pts.append(base + nrm * o)
    if len(pts) < MIN_N:
        return None, len(pts)
    pts = np.array(pts, np.float32)
    vx, vy, x0, y0 = cv2.fitLine(pts, cv2.DIST_HUBER, 0, 0.01, 0.01).ravel()
    q0 = np.array([x0, y0], np.float32)
    res = np.abs((pts - q0) @ np.array([-vy, vx], np.float32))
    keep = res < max(1.0, 2.5 * np.median(res))
    if keep.sum() >= MIN_N:
        vx, vy, x0, y0 = cv2.fitLine(pts[keep], cv2.DIST_L2, 0, 0.01, 0.01).ravel()
        q0 = np.array([x0, y0], np.float32)
    nl = np.array([-vy, vx], np.float32)
    span = float(np.ptp(pts[keep] @ d)) / L if keep.sum() else 0.0
    return (nl, float(nl @ q0)), int(keep.sum()) if span > 0.2 else 0


def track(frames, until, aspect, seeds=None, exact=(), log=print):
    seeds = seeds or {}
    q = first_quad(frames[0])
    ref = classify(frames[0], q)
    A0 = pt.quad_area(q)
    out, prev, vel = {}, q.copy(), np.zeros((4, 2), np.float32)
    def refine(g, sk, start, prev, keep=False):
        cur, counts = start.copy(), [0, 0, 0, 0]
        for it in range(4):                                 # a few passes: each uses the quad of the pass before
            cen = cur.mean(axis=0)
            lines = []
            for e in range(4):                              # edges: 0 top (TL-TR), 1 right, 2 bottom, 3 left
                p0, p1 = cur[e], cur[(e + 1) % 4]
                ln, cnt = edge_fit(g, sk, p0, p1, cen - (p0 + p1) / 2, ref, reach=18.0 if it == 0 else 6.0)
                counts[e] = cnt
                lines.append(ln if cnt >= MIN_N else None)
            if sum(l is not None for l in lines) < 2:
                return None, counts
            for e in (1, 3):                                # a short edge that was not where it was expected: look for it
                if lines[e] is None and lines[0] is not None and lines[2] is not None:
                    lines[e] = end_search(g, sk, lines[0], lines[2], cur, e, ref)
                    if lines[e] is not None:
                        counts[e] = -1                      # found by search; the next pass refines it
            for e in range(4):                              # rebuild a missing edge from its opposite one
                if lines[e] is None:
                    o = lines[(e + 2) % 4]
                    if keep:                                # a hand-set quad: an edge that cannot be seen stays as it was set
                        lines[e] = pt._line(prev[e], prev[(e + 1) % 4])
                        continue
                    if o is None:
                        return None, counts
                    # as far from the opposite edge as it was in the last frame (measured there, so nothing accumulates)
                    pm = (prev[e] + prev[(e + 1) % 4]) / 2
                    po = pt._line(prev[(e + 2) % 4], prev[(e + 3) % 4])
                    side = abs(float(po[0] @ pm - po[1]))
                    mid = (cur[e] + cur[(e + 1) % 4]) / 2
                    sgn = np.sign(o[0] @ mid - o[1]) or 1.0
                    lines[e] = (o[0], o[1] + sgn * side)
            new = []
            for e in range(4):                              # corner e = edge e-1 meets edge e
                m = pt._meet(lines[(e - 1) % 4], lines[e])
                new.append(m if m is not None else cur[e])
            new = np.array(new, np.float32)
            if np.abs(new - cur).max() > 80:
                return None, counts
            cur = new
        return cur, counts

    for i, f in enumerate(frames[:until + 1]):
        if i in seeds:                                      # the tilted face is in shade: take the paper's colour afresh
            ref = classify(f, np.array(seeds[i], np.float32).reshape(4, 2))
        g, sk = lum(f), cv2.dilate(skin_mask(f, ref), np.ones((5, 5), np.uint8))
        moved = i > 0 and float(np.abs(f.astype(np.int16) - frames[i - 1]).mean()) > 9.0
        if i > 0 and (i - 1) in out and i not in seeds and float(np.abs(f.astype(np.int16) - frames[i - 1]).mean()) < 1.0:
            out[i] = out[i - 1]; continue                   # the take holds this drawing: the same quad, exactly
        cands = []
        if i in seeds:                                      # a hand-set start for a frame the outline cannot give (the tilted face in shadow)
            sd = np.array(seeds[i], np.float32).reshape(4, 2)
            r0 = (None, None) if i in exact else refine(g, sk, sd, sd, keep=True)
            cands.append(r0 if r0[0] is not None and np.abs(r0[0] - sd).max() < 25 else (sd, [0, 0, 0, 0]))
            log(f"  f{i}: {'set by hand' if i in exact else 'seeded'}; refined by {np.abs(cands[0][0] - sd).max():.1f} px")
        elif not moved:
            cands.append(refine(g, sk, prev + vel * 0.0, prev))
        if i not in seeds and (moved or cands[0][0] is None):
            hq = hull_quad(f, ref, prev)
            if hq is not None:
                cands.append(refine(g, sk, hq, hq))
        cands = [c for c in cands if c[0] is not None]
        if not cands:
            log(f"  f{i}: lost; no quad from here"); break
        cur, counts = max(cands, key=lambda c: sum(max(v, 0) for v in c[1]))
        r = pt.quad_area(cur) / A0
        if r <= 0.03:
            log(f"  f{i}: the face is edge-on (area {r:.2f}); no quad from here"); break
        vel = cur - prev
        prev = cur
        s = float(np.clip((r - 0.10) / 0.22, 0, 1)); s = s * s * (3 - 2 * s)
        out[i] = (cur.copy(), s, list(counts), dict(ref))
    # hold one quad while the sheet is still
    ids = sorted(out)
    anchor, run = None, []
    for i in ids:
        qd = out[i][0]
        if anchor is not None and np.abs(qd - anchor).max() < 0.5:
            run.append(i)
        else:
            if len(run) > 2:
                med = np.median(np.array([out[j][0] for j in run]), axis=0)
                for j in run:
                    out[j] = (med,) + tuple(out[j][1:])
            anchor, run = qd, [i]
    if len(run) > 2:
        med = np.median(np.array([out[j][0] for j in run]), axis=0)
        for j in run:
            out[j] = (med,) + tuple(out[j][1:])
    return out, ref


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("track", nargs="?", default="env")
    ap.add_argument("--until", type=int, default=10 ** 6, help="last frame in which the face can show")
    ap.add_argument("--aspect", default="105/241")
    ap.add_argument("--seed", action="append", default=[], help="FRAME:x0,y0,x1,y1,x2,y2,x3,y3 (TL,TR,BR,BL in work px): start the fit of that frame here; =FRAME:... uses the quad exactly as given")
    ap.add_argument("--check", default="")
    a = ap.parse_args()
    seeds = {int(v.lstrip("=").split(":")[0]): [float(x) for x in v.split(":")[1].split(",")] for v in a.seed}
    exact = {int(v[1:].split(":")[0]) for v in a.seed if v.startswith("=")}
    rdir, meta, frames = pt.load(a.clip)
    num, den = map(float, a.aspect.split("/"))
    out, ref = track(frames, min(a.until, len(frames) - 1), num / den, seeds, exact)
    pj = os.path.join(rdir, "paper.json")
    paper = json.load(open(pj)) if os.path.exists(pj) else {"w": meta["w"], "h": meta["h"], "tracks": {}}
    for f in os.listdir(rdir):
        if f.startswith(f"p_{a.track}_"):
            os.remove(os.path.join(rdir, f))
    sw, sh = 482, 210
    fr = []
    for i, f in enumerate(frames):
        if i not in out:
            fr.append({"q": None, "vis": 0}); continue
        q, s, counts, ref = out[i]
        Hm = cv2.getPerspectiveTransform(q.astype(np.float32), np.float32([[0, 0], [sw, 0], [sw, sh], [0, sh]]))
        sk = cv2.dilate(skin_mask(f, ref), np.ones((9, 9), np.uint8))
        occ = cv2.GaussianBlur(cv2.warpPerspective(255 - sk, Hm, (sw, sh), flags=cv2.INTER_LINEAR, borderValue=255), (0, 0), 1.2)
        cv2.imwrite(os.path.join(rdir, f"p_{a.track}_{i:04d}.png"), occ)
        fr.append({"q": [round(float(v), 2) for v in q.ravel()], "vis": 1, **({"a": round(s, 3)} if s < 1 else {})})
        w, h = np.linalg.norm(q[1] - q[0]), np.linalg.norm(q[3] - q[0])
        print(f"f{i:3d} TL {q[0][0]:7.2f},{q[0][1]:7.2f} TR {q[1][0]:7.2f},{q[1][1]:7.2f} w {w:6.1f} h/w {h / w:.3f} "
              f"ang {np.degrees(np.arctan2(q[1][1] - q[0][1], q[1][0] - q[0][0])):6.2f} a {s:.2f} edges {counts}")
    paper["tracks"][a.track] = {"static": False, "frames": fr, "mask": f"p_{a.track}_", "tool": "paper_quad"}
    json.dump(paper, open(pj, "w"))
    if a.check:
        idx = sorted(set([i for i in sorted(out)][:: max(1, len(out) // 9)][:9] + sorted(out)[-3:]))[:12]
        tiles = []
        for i in idx:
            im = frames[i].copy()
            cv2.polylines(im, [np.round(out[i][0] * 8).astype(np.int32)], True, (0, 255, 0), 1, cv2.LINE_AA, 3)
            cv2.putText(im, f"f{i}", (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            tiles.append(cv2.resize(im, (640, 360)))
        while len(tiles) % 4:
            tiles.append(np.zeros_like(tiles[0]))
        cv2.imwrite(a.check, np.vstack([np.hstack(tiles[r:r + 4]) for r in range(0, len(tiles), 4)]), [cv2.IMWRITE_JPEG_QUALITY, 88])
        print("check sheet:", a.check)


if __name__ == "__main__":
    sys.exit(main())
