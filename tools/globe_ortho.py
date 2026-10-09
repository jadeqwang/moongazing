#!/usr/bin/env python3
"""rev3 KIDS (Oct 8): the toy Earth's geography, from a real map.

Jade (0:57): "have him center the eclipse on the Anatolia region because this will serve as an Easter Egg for the
Battle of Halys music video". So the toy globe in the Copernican lesson (3.4a/b/c) shows real coastlines, turned so
that the Moon ball's shadow falls on central Anatolia (the Halys = Kizilirmak; the eclipse of 585 BC).

Real map: Natural Earth 1:50m land (public domain), media/ref/rev3_kids/ne_50m_land.geojson, plus the Caspian Sea
(not in the land file; a hand polygon). Orthographic projection, north up: what a camera far from a globe sees.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python   (from the repo root)
    $MPY tools/globe_ortho.py ref OUT.png --at -0.30,0.14 [--target 39.0,34.5] [--size 1024] [--grat] [--spot 0.26]
--at x,y: where on the visible disc the target sits (disc radii from the centre, x right, y UP): the centre of the
shadow spot in the painting. The globe is then turned so the target is there and north is as nearly up as it can be
(the pole lies in the vertical plane through the spot: the boy tilts the globe's north toward the lamp).
Python: orient(x, y, target) -> 3x3 R (globe -> camera); land(R, size) -> (land mask 0..1, disc mask);
project(lat, lon, R) -> x, y (radii, y up), z (> 0 = visible side); ref_image(R, size, marks, grat, spot).
"""
import json
import math
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NE = os.path.join(ROOT, 'media', 'ref', 'rev3_kids', 'ne_50m_land.geojson')
HALYS = (39.0, 34.5)     # central Anatolia, inside the bend of the Kizilirmak (Halys)
EQ_W = 8192
# Caspian Sea, rough outline (lat, lon), clockwise from the north-west
CASPIAN = [(46.7, 48.0), (47.0, 50.5), (46.6, 52.8), (45.2, 53.5), (44.6, 51.0), (43.2, 51.3), (42.3, 52.6), (41.2, 52.9),
           (40.6, 54.0), (39.3, 53.5), (37.6, 53.9), (36.8, 53.0), (36.6, 51.5), (37.3, 49.9), (38.4, 48.9), (39.4, 49.2),
           (40.3, 49.6), (41.3, 49.0), (42.3, 48.2), (43.3, 47.5), (44.4, 47.0), (45.6, 47.4)]
_eq = None


def equirect():
    """Land mask on an equirectangular grid (uint8, 255 = land), 8192 x 4096."""
    global _eq
    if _eq is not None:
        return _eq
    W, H = EQ_W, EQ_W // 2
    m = np.zeros((H, W), np.uint8)

    def px(ring):
        a = np.asarray(ring, np.float64)
        return np.stack([(a[:, 0] + 180) / 360 * W, (90 - a[:, 1]) / 180 * H], 1).round().astype(np.int32)
    for f in json.load(open(NE))['features']:
        g = f['geometry']
        polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for rings in polys:
            cv2.fillPoly(m, [px(r) for r in rings], 255)        # even-odd: holes stay holes
    cv2.fillPoly(m, [px([(lo, la) for la, lo in CASPIAN])], 0)
    _eq = m
    return m


def vec(lat, lon):
    la, lo = math.radians(lat), math.radians(lon)
    return np.array([math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la)])


def orient(x, y, target=HALYS):
    """Rotation globe -> camera (camera: x right, y up, z toward the viewer) that puts `target` at disc position x, y
    with north as nearly up as possible."""
    s = np.array([x, y, math.sqrt(max(0.0, 1 - x * x - y * y))])
    t = vec(*target); p = np.array([0.0, 0.0, 1.0]); up = np.array([0.0, 1.0, 0.0])
    e2 = p - p.dot(t) * t; e2 /= np.linalg.norm(e2); e3 = np.cross(t, e2)
    f2 = up - up.dot(s) * s; f2 /= np.linalg.norm(f2); f3 = np.cross(s, f2)
    return np.stack([s, f2, f3], 1) @ np.stack([t, e2, e3], 1).T


def project(lat, lon, R):
    c = R @ vec(lat, lon)
    return float(c[0]), float(c[1]), float(c[2])


def land(R, size, ss=3):
    """Float land mask (0..1) of the visible disc, diameter `size` px, and the disc mask."""
    n = size * ss
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float64)
    x = (xx + 0.5) / n * 2 - 1
    y = 1 - (yy + 0.5) / n * 2
    r2 = x * x + y * y
    inside = r2 < 1
    z = np.sqrt(np.clip(1 - r2, 0, 1))
    g = np.stack([x, y, z], -1) @ R            # R^T c for every pixel
    lat = np.degrees(np.arcsin(np.clip(g[..., 2], -1, 1)))
    lon = np.degrees(np.arctan2(g[..., 1], g[..., 0]))
    eq = equirect()
    H, W = eq.shape
    u = ((lon + 180) % 360) / 360 * W
    v = (90 - lat) / 180 * H
    m = cv2.remap(eq, u.astype(np.float32), v.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP).astype(np.float32) / 255
    m[~inside] = 0
    m = cv2.resize(m, (size, size), interpolation=cv2.INTER_AREA)
    d = cv2.resize(inside.astype(np.float32), (size, size), interpolation=cv2.INTER_AREA)
    return m, d


def ref_image(R, size=1024, marks=(), grat=False, spot=0.0, target=HALYS):
    m, d = land(R, size)
    sea = np.array([150, 95, 40], np.float32); gr = np.array([95, 150, 110], np.float32); bg = np.array([255, 255, 255], np.float32)
    img = sea * (1 - m[..., None]) + gr * m[..., None]
    img = img * d[..., None] + bg * (1 - d[..., None])
    img = img.round().astype(np.uint8)
    r = size / 2

    def seg(pts):
        for (x1, y1, z1), (x2, y2, z2) in zip(pts, pts[1:]):
            if z1 > 0 and z2 > 0:
                cv2.line(img, (int(r + x1 * r), int(r - y1 * r)), (int(r + x2 * r), int(r - y2 * r)), (225, 225, 225), 1, cv2.LINE_AA)
    if grat:
        for la in range(-60, 90, 30):
            seg([project(la, lo, R) for lo in np.arange(-180, 180.1, 2)])
        for lo in range(-180, 180, 30):
            seg([project(la, lo, R) for la in np.arange(-90, 90.1, 2)])
    for la, lo in marks:
        x, y, z = project(la, lo, R)
        if z > 0:
            cv2.circle(img, (int(r + x * r), int(r - y * r)), max(4, size // 120), (40, 40, 230), 2, cv2.LINE_AA)
    if spot:
        x, y, z = project(target[0], target[1], R)
        cv2.circle(img, (int(r + x * r), int(r - y * r)), int(spot * r), (20, 20, 20), 2, cv2.LINE_AA)
    return img


if __name__ == '__main__':
    a = sys.argv[1:]

    def opt(k, d=None):
        return a[a.index(k) + 1] if k in a else d
    x, y = [float(v) for v in opt('--at', '0,0').split(',')]
    t = tuple(float(v) for v in opt('--target', '%g,%g' % HALYS).split(','))
    R = orient(x, y, t)
    c = R.T @ np.array([0, 0, 1.0]); n = R @ np.array([0, 0, 1.0])
    print('disc centre: lat %.1f lon %.1f; north pole points to camera x %.2f y %.2f z %.2f (tilt from vertical %.0f deg)'
          % (math.degrees(math.asin(c[2])), math.degrees(math.atan2(c[1], c[0])), n[0], n[1], n[2], math.degrees(math.acos(n[1]))))
    img = ref_image(R, int(opt('--size', 1024)), [t], '--grat' in a, float(opt('--spot', 0)), t)
    cv2.imwrite(a[1], img); print('wrote', a[1])
