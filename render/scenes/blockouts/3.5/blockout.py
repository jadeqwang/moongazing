#!/usr/bin/env python3
"""Paper blockout for the envelope passage (shots 3.5a/b/c, rev 4, ENV). True sizes in millimetres, seen straight
down from 1 m, so that every keyframe of the passage is painted over the same measured geometry:

  envelope  US #10, 241 x 105, commercial flap 40 deep hinged on the far long edge, round sticker 25 across the flap's lip
  letter    US Letter 216 x 279 folded in three (C-fold): a packet 216 x 93; top panel hinged on the far crease,
            bottom panel on the near crease; print on the inside only
  hands     hers 175 long, his 195 (schematic mittens: they mark place, direction and SIZE only)

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY render/scenes/blockouts/3.5/blockout.py [outdir]     # default media/keyframes/work/rev4_env/guide

World: x to the right, y away from her (up the screen), z toward the camera; origin = the envelope's centre at rest.
Two framings of the same desk:  AB 520 mm wide (the front, the turn, the sealed back),  C 760 mm wide (the letter).
"""
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
CAM_H = 1000.0
SS = 2                                    # supersampling
OUT_W, OUT_H = 1920, 1080
CAMS = {                                  # left, top (world mm), width
    'AB': (-250.0, 148.0, 520.0),
    'C': (-410.0, 152.5, 760.0),
}
ENV_W, ENV_H, FLAP = 241.0, 105.0, 40.0
THROAT = 12.0                             # the back panel's top edge lies this far below the hinge
LET_W, PANEL = 216.0, 93.0
STICKER = 25.0
GLOBE = (-232.0, -30.0, 45.0)
COL = dict(desk=(52, 78, 118), env=(205, 222, 232), env_in=(186, 205, 218), flap=(196, 214, 226), letter=(244, 246, 246),
           letter_back=(236, 240, 242), ink=(120, 118, 116), skin=(150, 178, 222), cuff_her=(205, 222, 235),
           cuff_him=(70, 44, 30), globe=(150, 100, 40), line=(60, 70, 90), sticker=(96, 52, 26), dot=(235, 200, 150))   # BGR


class Scene:
    def __init__(self, cam):
        self.l, self.t, self.w = CAMS[cam]
        self.s = OUT_W * SS / self.w
        self.cx, self.cy = self.l + self.w / 2, self.t - self.w * OUT_H / OUT_W / 2
        self.im = np.zeros((OUT_H * SS, OUT_W * SS, 3), np.uint8)
        self.im[:] = COL['desk']
        g = np.linspace(0, 1, OUT_W * SS)[None, :] * 0.5 + np.linspace(0, 1, OUT_H * SS)[:, None] * 0.5
        self.im = (self.im * (1.12 - 0.3 * g)[..., None]).clip(0, 255).astype(np.uint8)      # lamp from the upper left

    def px(self, p):
        p = np.atleast_2d(np.asarray(p, np.float64))
        z = p[:, 2] if p.shape[1] > 2 else np.zeros(len(p))
        k = CAM_H / (CAM_H - z)
        x = (self.cx + (p[:, 0] - self.cx) * k - self.l) * self.s
        y = (self.t - (self.cy + (p[:, 1] - self.cy) * k)) * self.s
        return np.stack([x, y], 1)

    def poly(self, pts, col, line=True, shade=1.0, lw=1.2):
        q = np.round(self.px(pts) * 16).astype(np.int32)
        c = tuple(int(min(255, v * shade)) for v in (COL[col] if isinstance(col, str) else col))
        cv2.fillPoly(self.im, [q], c, cv2.LINE_AA, 4)
        if line:
            cv2.polylines(self.im, [q], True, COL['line'], int(round(lw * SS)), cv2.LINE_AA, 4)

    def seg(self, a, b, col='line', lw=1.0):
        q = np.round(self.px([a, b]) * 16).astype(np.int32)
        cv2.line(self.im, tuple(q[0]), tuple(q[1]), COL[col] if isinstance(col, str) else col, int(round(lw * SS)), cv2.LINE_AA, 4)

    def disc(self, c, r, col, line=True, a0=0, a1=360, z=0.0):
        th = np.radians(np.linspace(a0, a1, 73))
        pts = np.stack([c[0] + r * np.cos(th), c[1] + r * np.sin(th), np.full_like(th, z)], 1)
        self.poly(pts, col, line)

    def shadow(self, pts, dx=5, dy=-6, a=0.35):
        q = np.round(self.px(np.asarray(pts, np.float64)[:, :2] + [dx, dy]) * 16).astype(np.int32)
        m = np.zeros(self.im.shape[:2], np.uint8)
        cv2.fillPoly(m, [q], 255, cv2.LINE_AA, 4)
        m = cv2.GaussianBlur(m, (0, 0), 4 * SS).astype(np.float32) / 255 * a
        self.im = (self.im * (1 - m[..., None])).astype(np.uint8)

    def save(self, path):
        im = cv2.resize(self.im, (OUT_W, OUT_H), interpolation=cv2.INTER_AREA)
        cv2.imwrite(path, im)
        print(path)


def rot(pts, deg, about=(0, 0)):
    c, s = np.cos(np.radians(deg)), np.sin(np.radians(deg))
    p = np.asarray(pts, np.float64).copy()
    x, y = p[:, 0] - about[0], p[:, 1] - about[1]
    p[:, 0], p[:, 1] = about[0] + c * x - s * y, about[1] + s * x + c * y
    return p


def rect(cx, cy, w, h, z=0.0):
    return np.array([[cx - w / 2, cy + h / 2, z], [cx + w / 2, cy + h / 2, z], [cx + w / 2, cy - h / 2, z], [cx - w / 2, cy - h / 2, z]])


def flap_outline(n=25):
    """the commercial flap, closed: hinge on the far long edge, a shallow curve 40 deep, round shoulders"""
    x = np.linspace(-ENV_W / 2, ENV_W / 2, n)
    u = np.abs(x) / (ENV_W / 2)
    d = FLAP * (1 - u ** 3.2) ** 0.9                       # depth below the hinge
    return np.stack([x, ENV_H / 2 - d, np.zeros(n)], 1)


def capsule(a, b, r, n=10):
    a, b = np.asarray(a, np.float64), np.asarray(b, np.float64)
    d = (b - a) / max(np.linalg.norm(b - a), 1e-6)
    nrm = np.array([-d[1], d[0]])
    th = np.linspace(-np.pi / 2, np.pi / 2, n)
    end = [b + r * (np.cos(t) * d + np.sin(t) * nrm) for t in th]
    start = [a + r * (-np.cos(t) * d - np.sin(t) * nrm) for t in th]
    return np.array(end + start)


def hand(sc, wrist, deg, right=True, scale=1.0, cuff='cuff_her', parts=('cuff', 'palm', 'fingers', 'thumb'), z=0.0, curl=1.0, thumb=45):
    """schematic hand, palm down, fingers along `deg` (0 = +x, 90 = up the screen); 175 mm long at scale 1"""
    m = 1 if right else -1
    loc = []
    if 'cuff' in parts:
        loc.append((np.array([[-40, -75], [40, -75], [38, 4], [-38, 4]], np.float64), cuff))
    if 'palm' in parts:
        loc.append((np.array([[-36, 0], [36, 0], [41, 60], [38, 92], [-38, 96], [-42, 55]], np.float64), 'skin'))
    if 'fingers' in parts:
        for x, ln in ((-28, 72), (-9, 80), (10, 74), (28, 58)):
            loc.append((capsule((x, 88), (x * 1.08, 88 + ln * curl), 8.5), 'skin'))
    if 'thumb' in parts:
        t = np.radians(90 + thumb)
        loc.append((capsule((-36, 30), (-36 + 62 * np.cos(t), 30 + 62 * np.sin(t)), 10.5), 'skin'))
    for pts, col in loc:
        p = pts * scale
        p[:, 0] *= m
        p = rot(p, deg - 90) + np.asarray(wrist, np.float64)[:2]
        sc.poly(np.c_[p, np.full(len(p), z)], col, lw=1.0)


def desk_props(sc):
    sc.shadow(np.c_[GLOBE[0] + GLOBE[2] * np.cos(np.linspace(0, 6.3, 40)), GLOBE[1] + GLOBE[2] * np.sin(np.linspace(0, 6.3, 40))], 8, -9)
    sc.disc(GLOBE[:2], GLOBE[2], 'globe')


def envelope_front(sc, deg=-2.0):
    p = rot(rect(0, 0, ENV_W, ENV_H), deg)
    sc.shadow(p)
    sc.poly(p, 'env')


def envelope_back(sc, deg=-2.0, flap='sealed'):
    body = rot(rect(0, 0, ENV_W, ENV_H), deg)
    sc.shadow(body)
    sc.poly(body, 'env')
    # side seams and the bottom flap's edge (faint)
    for sx in (-1, 1):
        a = rot(np.array([[sx * ENV_W / 2, -ENV_H / 2, 0], [sx * (ENV_W / 2 - 58), 2, 0]]), deg)
        sc.seg(a[0], a[1], lw=0.7)
    if flap == 'sealed':
        f = rot(flap_outline(), deg)
        sc.poly(np.vstack([f, f[:1]]), 'flap', lw=1.0)
        c = rot(np.array([[0, ENV_H / 2 - FLAP, 0]]), deg)[0]
        sc.disc(c, STICKER / 2, 'sticker')
        sc.disc((c[0] + 1.5, c[1] - 1.0), 2.6, 'dot', line=False)
    else:                                                    # open: the flap lies beyond the far edge, inside up
        f = flap_outline()
        f[:, 1] = ENV_H - f[:, 1]                            # mirrored across the hinge y = ENV_H / 2
        f = rot(f, deg)
        sc.shadow(f, 2, -3, 0.25)
        sc.poly(np.vstack([f, f[:1]]), 'env_in', lw=1.0)
        band = rot(np.array([[-ENV_W / 2 + 2, ENV_H / 2, 0], [ENV_W / 2 - 2, ENV_H / 2, 0],
                             [ENV_W / 2 - 8, ENV_H / 2 - THROAT, 0], [-ENV_W / 2 + 8, ENV_H / 2 - THROAT, 0]]), deg)
        sc.poly(band, 'env_in', shade=0.86, lw=0.8)          # the throat: the inside of the front panel, in shadow
        c = rot(np.array([[0, ENV_H / 2 - FLAP, 0]]), deg)[0]
        sc.disc(c, STICKER / 2, 'sticker')                   # the sticker stays on the body; its upper half has peeled off the flap
        sc.disc((c[0] + 1.5, c[1] - 1.0), 2.6, 'dot', line=False)


def bars(sc, x0, x1, y0, y1, z0, z1, rows, seed=1):
    """rows of grey 'type' between two y's of a (possibly tilted) panel"""
    rng = np.random.RandomState(seed)
    for i in range(rows):
        u = (i + 0.5) / rows
        y, z = y0 + (y1 - y0) * u, z0 + (z1 - z0) * u
        e = x1 - (x1 - x0) * (0.02 + 0.3 * rng.rand() * (rng.rand() < 0.35))
        sc.seg((x0, y, z), (e, y, z), 'ink', 1.5)


def letter_open(sc, cy, z=60.0, top=1.0, bottom=1.0, deg=0.0, cx=0.0):
    """the letter with its top panel `top` (0 = folded down on the packet, 1 = open flat) and bottom panel likewise.
    cy = the middle panel's centre. Open panels are left a little raised at the creases, as real paper is."""
    hw = LET_W / 2

    def panel(y_h, ang, sign):                               # a panel hinged at y_h, swung `ang` degrees up from flat
        a = np.radians(ang)
        yo, zo = y_h + sign * PANEL * np.cos(a), z + PANEL * np.sin(a)
        return np.array([[cx - hw, y_h, z], [cx + hw, y_h, z], [cx + hw, yo, zo], [cx - hw, yo, zo]]), yo, zo

    mid = rect(cx, cy, LET_W, PANEL, z)
    sc.shadow(rect(cx, cy + (top - bottom) * PANEL / 2, LET_W, PANEL * (1 + top + bottom), 0), 10, -14, 0.3)
    a_top = 180 - top * 168 if top < 1 else 12                # 180 = lying on the packet, 12 = open, sprung up a little
    a_bot = 180 - bottom * 168 if bottom < 1 else 12
    sc.poly(mid, 'letter', lw=0.9)
    if bottom >= 1:
        bars(sc, cx - hw + 22, cx + hw - 22, cy + PANEL / 2 - 8, cy - PANEL / 2 + 6, z, z, 9, 2)
    pb, yb, zb = panel(cy - PANEL / 2, a_bot, -1)
    pt, yt, zt = panel(cy + PANEL / 2, a_top, +1)
    order = [(pb, a_bot, 'b'), (pt, a_top, 't')]              # the bottom panel is folded first, so it lies under the top one
    for p, ang, which in order:
        inside_up = ang < 90
        sc.poly(p, 'letter' if inside_up else 'letter_back', shade=0.93 + 0.07 * abs(np.cos(np.radians(ang))), lw=0.9)
        if inside_up and which == 't':
            y0, y1 = cy + PANEL / 2, yt
            f = lambda u: (y0 + (y1 - y0) * u, z + (zt - z) * u)
            sc.disc((cx - hw + 34, f(0.72)[0]), 9, 'sticker', z=f(0.72)[1])
            sc.seg((cx - hw + 50, *f(0.76)), (cx - hw + 120, *f(0.76)), 'ink', 2.2)
            sc.seg((cx - hw + 50, *f(0.66)), (cx - hw + 95, *f(0.66)), 'ink', 1.4)
            bars(sc, cx - hw + 22, cx + hw - 22, f(0.45)[0], f(0.05)[0], f(0.45)[1], f(0.05)[1], 4, 3)
        if inside_up and which == 'b':
            y0, y1 = cy - PANEL / 2, yb
            f = lambda u: (y0 + (y1 - y0) * u, z + (zb - z) * u)
            bars(sc, cx - hw + 22, cx + hw - 22, f(0.08)[0], f(0.5)[0], f(0.08)[1], f(0.5)[1], 4, 4)
            sc.seg((cx - hw + 22, *f(0.78)), (cx - hw + 80, *f(0.78)), 'ink', 2.0)      # signature block
    return dict(top_edge=yt, bottom_edge=yb)


def packet(sc, cy, z=0.0, cx=0.0, lip=4.0, clip_below=None):
    """the folded packet, top panel's back up; its free edge (near side) stands `lip` mm proud. clip_below: only the
    part beyond this y shows (the rest is inside the envelope)."""
    hw = LET_W / 2
    y0, y1 = cy - PANEL / 2, cy + PANEL / 2
    if clip_below is not None:
        y0 = max(y0, clip_below)
    p = np.array([[cx - hw, y1, z], [cx + hw, y1, z], [cx + hw, y0, z], [cx - hw, y0, z]])
    sc.shadow(p, 3, -4, 0.3)
    sc.poly(p, 'letter_back', lw=0.9)
    if clip_below is None:                                    # the layered near edge: bottom crease, then the top panel's free edge
        sc.seg((cx - hw, y0 + 3.0, z), (cx + hw, y0 + 3.0, z + lip), lw=0.8)
        sc.seg((cx - hw, y0 + 1.2, z), (cx + hw, y0 + 1.2, z), lw=0.6)


def state_A0():
    """AB first frame: the front, his hand letting go at the right end, her left hand holding the left end"""
    sc = Scene('AB'); desk_props(sc)
    hand(sc, (228, 14), 180, right=True, scale=1.12, cuff='cuff_him', parts=('cuff', 'palm', 'fingers'))
    hand(sc, (-196, -150), 58, right=False, parts=('cuff', 'palm', 'fingers'))
    envelope_front(sc)
    hand(sc, (228, 14), 180, right=True, scale=1.12, parts=('thumb',), thumb=40)
    hand(sc, (-196, -150), 58, right=False, parts=('thumb',), thumb=20)
    hand(sc, (118, -232), 96, right=True)
    return sc


def state_A1():
    """AB last frame: the back, flap sealed with the sticker; left hand steadies the near left corner, right thumb at the flap's lip"""
    sc = Scene('AB'); desk_props(sc)
    envelope_back(sc)
    hand(sc, (-150, -214), 72, right=False, curl=0.85)
    hand(sc, (128, -168), 114, right=True, curl=0.7, thumb=58)
    return sc


def state_C0():
    """C first frame: flap open, half the sticker on the body, the packet 45 % out, pinched at its far edge"""
    sc = Scene('C'); desk_props(sc)
    envelope_back(sc, flap='open')
    out = 0.5 * PANEL
    yt = ENV_H / 2 - THROAT
    hand(sc, (236, -44), 146, right=True, parts=('cuff', 'palm', 'fingers'), curl=0.8)
    packet(sc, yt + out - PANEL / 2, z=4, clip_below=yt)
    hand(sc, (236, -44), 146, right=True, parts=('thumb',), thumb=28)
    hand(sc, (-176, -196), 64, right=False, curl=0.85)
    return sc


def state_C1():
    """C: the packet out and brought toward her, held at both ends, still folded"""
    sc = Scene('C'); desk_props(sc)
    envelope_back(sc, flap='open')
    cy = -110.0
    hand(sc, (-196, -246), 62, right=False, parts=('cuff', 'palm', 'fingers'), z=60)
    hand(sc, (196, -246), 118, right=True, parts=('cuff', 'palm', 'fingers'), z=60)
    packet(sc, cy, z=60, lip=6)
    hand(sc, (-196, -246), 62, right=False, parts=('thumb',), thumb=24, z=60)
    hand(sc, (196, -246), 118, right=True, parts=('thumb',), thumb=24, z=60)
    return sc


def state_C(top, bottom):
    sc = Scene('C'); desk_props(sc)
    envelope_back(sc, flap='open')
    cy = -120.0 - 30.0 * min(1.0, top)
    hand(sc, (-196, -270), 64, right=False, parts=('cuff', 'palm', 'fingers'), z=60)
    hand(sc, (196, -270), 116, right=True, parts=('cuff', 'palm', 'fingers'), z=60)
    letter_open(sc, cy, top=top, bottom=bottom)
    hand(sc, (-196, -270), 64, right=False, parts=('thumb',), thumb=26, z=60)
    hand(sc, (196, -270), 116, right=True, parts=('thumb',), thumb=26, z=60)
    return sc


STATES = {'A0_front': state_A0, 'A1_back_sealed': state_A1, 'C0_packet_emerging': state_C0, 'C1_packet_out': state_C1,
          'C2_top_half': lambda: state_C(0.5, 0.0), 'C3_top_open': lambda: state_C(1.0, 0.0),
          'C4_bottom_half': lambda: state_C(1.0, 0.5), 'C5_open': lambda: state_C(1.0, 1.0)}

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'media', 'keyframes', 'work', 'rev4_env', 'guide')
    os.makedirs(out, exist_ok=True)
    tiles = []
    for name, fn in STATES.items():
        sc = fn(); p = os.path.join(out, name + '.png'); sc.save(p)
        t = cv2.resize(cv2.imread(p), (640, 360), interpolation=cv2.INTER_AREA)
        cv2.putText(t, name, (8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        tiles.append(t)
    while len(tiles) % 4:
        tiles.append(np.zeros_like(tiles[0]))
    sheet = np.vstack([np.hstack(tiles[i:i + 4]) for i in range(0, len(tiles), 4)])
    cv2.imwrite(os.path.join(out, 'sheet.jpg'), sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(os.path.join(out, 'sheet.jpg'))
