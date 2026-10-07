"""One-off: public-domain Shuowen seal-script SVGs (Wikimedia Commons, Ancient Chinese Characters Project)
-> centre-line polylines (JSON, unit box). Usage: skel.py OUT.json glyph.svg ...  (char = filename prefix)"""
import sys, os, json, subprocess, tempfile
import numpy as np
from PIL import Image
from skimage.morphology import skeletonize, remove_small_objects

def raster(svg):
    t = tempfile.mktemp(suffix=".png")
    subprocess.run(["convert", "-density", "600", "-background", "white", svg, "-flatten", "-colorspace", "gray", t], check=True)
    a = np.asarray(Image.open(t).convert("L")) < 128
    ys, xs = np.nonzero(a)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

N8 = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]

def trace(sk):
    H, W = sk.shape
    pts = set(zip(*np.nonzero(sk)))
    def nb(p):
        return [(p[0]+dy, p[1]+dx) for dy, dx in N8 if (p[0]+dy, p[1]+dx) in pts]
    deg = {p: len(nb(p)) for p in pts}
    nodes = {p for p in pts if deg[p] != 2}
    used = set(); lines = []
    def walk(a, b):
        line = [a, b]; used.add(frozenset((a, b)))
        prev, cur = a, b
        while cur not in nodes:
            nxt = [q for q in nb(cur) if q != prev and frozenset((cur, q)) not in used]
            if not nxt: break
            # prefer 4-neighbours to avoid diagonal shortcuts
            nxt.sort(key=lambda q: abs(q[0]-cur[0]) + abs(q[1]-cur[1]))
            q = nxt[0]; used.add(frozenset((cur, q))); line.append(q); prev, cur = cur, q
        return line
    for n in nodes:
        for q in nb(n):
            if frozenset((n, q)) not in used:
                lines.append(walk(n, q))
    # loops with no nodes
    rest = pts - {p for l in lines for p in l}
    while rest:
        s = rest.pop(); q = nb(s)[0]; nodes.add(s); l = walk(s, q); lines.append(l); rest -= set(l)
    return lines, deg

def rdp(P, eps):
    P = np.asarray(P, float)
    if len(P) < 3: return P
    a, b = P[0], P[-1]; ab = b - a; L = np.hypot(*ab) or 1e-9
    d = np.abs(ab[0] * (P[:, 1] - a[1]) - ab[1] * (P[:, 0] - a[0])) / L
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(P[:i+1], eps)[:-1], rdp(P[i:], eps)])
    return np.vstack([a, b])

def smooth(P, k=7):
    P = np.asarray(P, float)
    if len(P) < k: return P
    out = P.copy()
    for i in range(1, len(P) - 1):
        lo, hi = max(0, i - k // 2), min(len(P), i + k // 2 + 1)
        out[i] = P[lo:hi].mean(0)
    return out

def process(svg):
    a = raster(svg)
    a = remove_small_objects(a, max_size=50)
    sk = skeletonize(a)
    lines, deg = trace(sk)
    H, W = a.shape
    stroke = 2 * (a.sum() / max(1, sk.sum())) / 2  # ~ stroke width
    out = []
    for l in lines:
        n = len(l)
        endpoint = deg[l[0]] == 1 or deg[l[-1]] == 1
        if endpoint and n < stroke * 1.4:   # spur from skeletonization
            continue
        if n < 3: continue
        P = smooth([(x, y) for y, x in l])
        P = rdp(P, 1.2)
        out.append([[round(x / W, 4), round(y / H, 4)] for x, y in P])
    return {"w": W, "h": H, "stroke": round(stroke / max(W, H), 4), "lines": out}

if __name__ == "__main__":
    res = {}
    for svg in sys.argv[2:]:
        ch = os.path.basename(svg).split("-")[0]
        res[ch] = process(svg)
        print(ch, len(res[ch]["lines"]), "strokes, w/h", res[ch]["w"], res[ch]["h"], "stroke", res[ch]["stroke"])
    json.dump(res, open(sys.argv[1], "w"), ensure_ascii=False)
