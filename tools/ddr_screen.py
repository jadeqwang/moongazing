#!/usr/bin/env python3
"""The dance game on the play-room TV (shot 7.C2): a deterministic redraw of what the screen really shows while
"Rare Earth (Techno Remix)" is played in StepMania (DDR-Extreme-style theme, double mode, 2x, "note" skin), measured
from Jade's own phone video of the room (inputs/rare_earth_ddr_sample.mp4; layout notes in
docs/reviews/rev2_c2_report.md). Nothing of that video is used as picture: every element is drawn here. The steps are
the real chart's (media/refs/rare_earth/ddr/rare_earth_techno_remix.sm = the published step pack), the background is
the pack's own background.jpg, and the arrows reach the targets ON THE FILM'S BEATS (analysis/beatgrid.json), so the
dancers in the shot step in time with them.

Output: an atlas for 07_drop.js (same idea as tools/screen_atlas.py): each frame warped into the painted TV's quad in
the roto key's coordinates and matted per frame on the take's own key-blue screen (K_7.C2 v6 paints the screen flat
blue), so the dancers stay in front of the picture.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python     # needs cv2
    $MPY tools/ddr_screen.py --take K_7.C2/take_10 --offset 0.375 --out media/keyframes/SCR_ddr_c2.png
         [--flat DIR]      also write the flat 4:3 game frames (PNG) there
         [--diff Medium --chart0 112]   the chart and the chart beat that lands on the shot's first beat (bar 81, beat 1).
                           Standard Double (the file's "Medium") beats 112-115 = right, down, the second pad's left, right:
                           in take_10 the dancers light the mat's right panel on beat 1, its down panel on beat 2, nothing
                           on beat 3 and the right panel on beat 4 (found by searching all four double charts)
         [--no-matte]      no take: matte with the quad only (painted still)
         [--style dance-single]   rev3 KIDS (Oct 8; Jade: "show single-pad mode"): one player on one pad, as the room has.
                           Four targets (left, down, up, right) on the first player's side of the screen (StepMania puts
                           player 1's field a quarter of the way across: x = 160 of 640), judgment and combo over them,
                           the second player's half empty ("NOT PRESENT", as in her video). With
                           --diff Easy --chart0 63: Easy Single beats 63-66 = right, down, rest, right: the three panels
                           the dancers light in take_10, and nothing on the beat where they light nothing.
Writes OUT.png and OUT.json { bbox, cols, rows, n, fps, k0 (global frame index of atlas frame 0), target, quad, ... }.
"""
import json
import math
import os
import re
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SM = os.path.join(ROOT, 'media/refs/rare_earth/ddr/rare_earth_techno_remix.sm')
BG = os.path.join(ROOT, 'media/refs/rare_earth/ddr/background.jpg')
FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_BI = '/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf'
FPS = 24
SHOT = (81, 1, 82, 1)                 # bar, beat of the shot's first frame and of its cut out
# the painted screen in K_7.C2 v6 keyframe px (2752x1536): TL, TR, BR, BL (tools/k7c2_cat_keyframe.py)
QUAD_KF = [[155.5, 157.0], [716.5, 222.0], [716.5, 573.0], [157.0, 593.0]]
KF_SIZE = (2752, 1536)

# ---- the real layout, as fractions of the 4:3 game picture (measured on rectified frames of the sample) -------------
GW, GH, SS = 640, 480, 3              # game picture px (StepMania's own 640x480), supersampling
LANE_X0, LANE_DX = 0.132, 0.1058      # centre of column 0, column pitch (of width); double. main() resets LANE_X0 for single
NCOL, FIELD_X = 8, 0.5                # columns, and the field's centre (judgment, combo); single: 4 and 0.25
TARGET_Y = 0.204                      # receptor row (of height)
ARROW = 0.104                         # arrow size (of width) = 0.139 of height
PPB = 2 * 64 / 480                    # scroll: heights per beat at 2x (measured 0.27)
FIELD_BOTTOM = 0.865                  # the bottom frame's upper edge: arrows come out from under it
DIRS = [270, 180, 0, 90] * 2          # left, down, up, right (rotation of the up arrow, degrees clockwise)
COL = dict(cyan=(70, 215, 255), cyan_hi=(190, 245, 255), band=(24, 120, 235), band_dk=(12, 60, 170), navy=(8, 18, 78),
           plate=(16, 70, 200), red=(232, 28, 52), red_hi=(255, 150, 150), blue=(60, 110, 255), blue_hi=(170, 205, 255),
           rim=(255, 255, 255), recep=(214, 236, 255), recep_in=(92, 132, 205), perfect=(255, 232, 60), perfect_edge=(232, 70, 130),
           combo_n=(240, 110, 225), combo_t=(80, 230, 255), score=(96, 255, 240), flash=(255, 250, 150))


def font(path, px):
    return ImageFont.truetype(path, int(round(px)))


_SPR = {}


def sprite(kind, rot, size):
    """An arrow as an RGBA PIL sprite (side = 1.5 * size px). The real shape: a chevron of two round-ended arms with a
    sharp tip and a short stem that ends in a point, all 0.25 of the arrow thick. kind: recep / flash / red / blue."""
    key = (kind, rot, int(size))
    if key in _SPR:
        return _SPR[key]
    n = int(size * 1.5) | 1; c = n / 2; S = size
    P = lambda x, y: (int(round((c + x * S) * 16)), int(round((c + y * S) * 16)))
    m = np.zeros((n, n), np.uint8); w = max(1, int(round(0.27 * S)))
    for sx in (-1, 1):
        cv2.line(m, P(0, -0.345), P(sx * 0.34, 0.065), 255, w, cv2.LINE_AA, 4)
        cv2.circle(m, P(sx * 0.34, 0.065), int(w * 8), 255, -1, cv2.LINE_AA, 4)
    cv2.line(m, P(0, -0.345), P(0, 0.36), 255, w, cv2.LINE_AA, 4)
    cv2.fillPoly(m, [np.array([P(0, -0.52), P(0.125, -0.345), P(0, -0.2), P(-0.125, -0.345)], np.int32)], 255, cv2.LINE_AA, 4)      # the sharp tip
    cv2.fillPoly(m, [np.array([P(-0.125, 0.36), P(0.125, 0.36), P(0, 0.5)], np.int32)], 255, cv2.LINE_AA, 4)                       # the stem's point
    er = lambda f: cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * max(1, int(round(f * S))) + 1,) * 2))
    tiers = {'recep': [((222, 242, 255), 0), ((26, 74, 176), 0.058)],
             'flash': [((255, 255, 150), 0), ((255, 255, 225), 0.058)],
             'red': [((176, 8, 70), 0), ((238, 26, 60), 0.028), ((255, 176, 196), 0.09)],
             'blue': [((40, 70, 205), 0), ((96, 156, 255), 0.028), ((225, 240, 255), 0.09)]}[kind]
    rgb = np.zeros((n, n, 3), np.float32)
    for col, f in tiers:
        a_ = (er(f) if f else m).astype(np.float32)[..., None] / 255
        rgb = rgb * (1 - a_) + np.array(col, np.float32) * a_
    im = Image.fromarray(np.dstack([rgb.astype(np.uint8), m]), 'RGBA')
    if rot:
        im = im.rotate(-rot, Image.BICUBIC)
    _SPR[key] = im
    return im


def put(im, spr, cx, cy, alpha=1.0, scale=1.0):
    if scale != 1.0:
        spr = spr.resize((int(spr.width * scale) | 1,) * 2, Image.BICUBIC)
    if alpha < 1.0:
        spr = spr.copy(); spr.putalpha(spr.getchannel('A').point(lambda v: int(v * alpha)))
    im.alpha_composite(spr, (int(round(cx - spr.width / 2)), int(round(cy - spr.height / 2))))


def parse_chart(style='dance-double', diff='Easy'):
    sm = open(SM).read()
    for m in re.finditer(r'#NOTES:\s*(dance-\w+):\s*(.*?):\s*(\w+):\s*(\d+):\s*(.*?):\s*(.*?);', sm, re.S):
        typ, desc, d, meter, radar, data = m.groups()
        if typ != style or d != diff:
            continue
        rows = []
        for mi, meas in enumerate(data.split(',')):
            lines = [r.strip() for r in meas.strip().split('\n') if r.strip() and not r.strip().startswith('//')]
            for ri, row in enumerate(lines):
                cols = [c for c, ch in enumerate(row) if ch in '124']
                if cols:
                    rows.append((mi * 4 + 4 * ri / len(lines), cols))
        return rows, int(meter), desc.strip()
    raise SystemExit(f'no chart {style} {diff}')


class Beats:
    def __init__(self):
        g = json.load(open(os.path.join(ROOT, 'analysis/beatgrid.json')))
        self.t = [b['t'] for b in g['beats']]; self.idx = {(b['bar'], b['beat']): i for i, b in enumerate(g['beats'])}

    def pos(self, t):                 # fractional beat index at song time t
        T = self.t; i = max(0, min(len(T) - 2, int(np.searchsorted(T, t, 'right')) - 1))
        return i + (t - T[i]) / (T[i + 1] - T[i])


def draw_game(cb, rows, meter, bg, phase_beats):
    """One 4:3 game frame at chart beat cb. rows = [(beat, [columns])] of the chart; returns an RGB PIL image GW x GH."""
    W, H = GW * SS, GH * SS
    X = lambda u: u * W
    Y = lambda v: v * H
    im = bg.copy()
    n_rows = len(rows); done = [i for i, (b, c) in enumerate(rows) if b <= cb + 1e-6]
    k = len(done); last = rows[done[-1]] if done else None
    since = (cb - last[0]) if last else 99.0          # beats since the last hit
    beat_ph = cb - math.floor(cb)

    # ---- receptors: pulse on every beat; a hit flashes its column yellow-white for ~0.2 beat
    size = X(ARROW)
    pulse = math.exp(-beat_ph * 5.0)
    for c in range(NCOL):
        cx, cy = X(LANE_X0 + LANE_DX * c), Y(TARGET_Y)
        put(im, sprite('recep', DIRS[c], size), cx, cy)
        if pulse > 0.03:
            put(im, sprite('flash', DIRS[c], size), cx, cy, alpha=0.3 * pulse)
        if last is not None and c in last[1] and since < 0.22:
            f = 1 - since / 0.22
            put(im, sprite('flash', DIRS[c], size), cx, cy, alpha=min(1.0, 0.35 + f), scale=1.0 + 0.22 * (1 - f))
    # ---- the notes still to come, scrolling up: red on the beat, blue on the half-beat ("note" skin)
    for b, cols in rows:
        if b <= cb + 1e-6:
            continue
        y = TARGET_Y + (b - cb) * PPB
        if y > FIELD_BOTTOM + 0.09:
            break
        on = abs(b - round(b)) < 1e-3
        for c in cols:
            put(im, sprite('red' if on else 'blue', DIRS[c], size), X(LANE_X0 + LANE_DX * c), Y(y))
    d = ImageDraw.Draw(im, 'RGBA')

    # ---- judgment and combo (they pop on each hit)
    if last is not None:
        z = 1 + 0.22 * math.exp(-since / 0.12)
        f = font(FONT_B, Y(0.052) * z); s = 'PERFECT!!'
        w = d.textlength(s, font=f); x, y = X(FIELD_X) - w / 2, Y(0.435) - Y(0.031) * z
        e = max(2, int(SS * 1.3))
        for dx, dy in ((e, e), (-e, e), (e, -e), (-e, -e), (0, e * 1.6), (e * 1.4, 0), (-e * 1.4, 0)):
            d.text((x + dx, y + dy), s, font=f, fill=COL['perfect_edge'] + (255,))
        d.text((x, y), s, font=f, fill=COL['perfect'] + (255,))
        zc = 1 + 0.15 * math.exp(-since / 0.12)
        fn = font(FONT_B, Y(0.075) * zc); ft = font(FONT_B, Y(0.043)); num = str(k)
        wn = d.textlength(num, font=fn); wt = d.textlength('combo', font=ft); x0 = X(FIELD_X + 0.045) - (wn + wt) / 2 - X(0.008)
        d.text((x0 + SS, Y(0.57) - Y(0.045) * zc + SS), num, font=fn, fill=(110, 30, 120, 255))
        d.text((x0, Y(0.57) - Y(0.045) * zc), num, font=fn, fill=COL['combo_n'] + (255,))
        d.text((x0 + wn + X(0.012), Y(0.57) - Y(0.017)), 'combo', font=ft, fill=COL['combo_t'] + (255,))

    # ---- the frame, top: cyan band, life bar (left, full), STAGE / Event, the absent second player's bar (right)
    def band(y0, y1):
        d.rectangle([0, Y(y0), W, Y(y1)], fill=COL['band'] + (255,))
        d.rectangle([0, Y(y0), W, Y(y0) + Y(0.012)], fill=COL['cyan'] + (255,)); d.rectangle([0, Y(y1) - Y(0.012), W, Y(y1)], fill=COL['cyan'] + (255,))
        d.rectangle([0, Y(y0) + Y(0.003), W, Y(y0) + Y(0.007)], fill=COL['cyan_hi'] + (255,)); d.rectangle([0, Y(y1) - Y(0.008), W, Y(y1) - Y(0.004)], fill=COL['cyan_hi'] + (255,))
    band(0.008, 0.112)
    d.rectangle([0, 0, W, Y(0.008)], fill=(4, 10, 40, 255))
    def chain(x0, x1, yc, live):
        r = Y(0.021); d.rounded_rectangle([X(x0) - r, Y(yc) - r * 1.25, X(x1) + r, Y(yc) + r * 1.25], radius=r * 1.2, fill=COL['navy'] + (255,))
        n = int((x1 - x0) / 0.0155)
        for i in range(n + 1):
            u = x0 + (x1 - x0) * i / n; yy = Y(yc) + r * 0.32 * math.sin(i * math.pi)       # zig-zag of overlapping beads = the wave
            if live:
                ph = (u / 0.22 - phase_beats / 2.0) % 1.0                                   # a yellow crest travels along it, 2 beats per cycle
                g = max(0.0, 1 - abs(ph - 0.5) * 3.2)
                col = (255, int(40 + 190 * g), int(40 + 20 * g))
            else:
                col = (14, 30, 110)
            d.ellipse([X(u) - r * 0.78, yy - r * 0.78, X(u) + r * 0.78, yy + r * 0.78], fill=col + (255,))
    chain(0.012, 0.405, 0.068, True); chain(0.59, 0.985, 0.068, False)
    d.ellipse([X(0.418), Y(0.062), X(0.432), Y(0.076)], fill=COL['cyan_hi'] + (255,)); d.ellipse([X(0.566), Y(0.062), X(0.58), Y(0.076)], fill=COL['cyan_hi'] + (255,))
    d.pieslice([X(0.415), Y(0.035), X(0.585), Y(0.158)], 0, 180, fill=(120, 205, 250, 255))                      # the Event tab
    d.rounded_rectangle([X(0.436), Y(0.004), X(0.564), Y(0.102)], radius=Y(0.02), fill=(120, 205, 250, 255))
    d.rounded_rectangle([X(0.446), Y(0.042), X(0.554), Y(0.096)], radius=Y(0.012), fill=(20, 110, 215, 255))
    f = font(FONT_BI, Y(0.04)); w = d.textlength('STAGE', font=f); d.text((X(0.5) - w / 2, Y(0.046)), 'STAGE', font=f, fill=(120, 240, 255, 255))
    f = font(FONT_B, Y(0.036)); w = d.textlength('Event', font=f); d.text((X(0.5) - w / 2, Y(0.1)), 'Event', font=f, fill=(255, 255, 255, 255))

    # ---- the frame, bottom: difficulty tab, score, options, names
    d.rounded_rectangle([-Y(0.05), Y(0.82), X(0.17), Y(0.9)], radius=Y(0.03), fill=DIFF_COL[0] + (255,))
    f = font(FONT_B, Y(0.03)); d.text((X(0.02), Y(0.826)), DIFF_COL[1], font=f, fill=(255, 255, 255, 200))
    band(0.862, 0.962)
    d.rectangle([0, Y(0.962), W, H], fill=(22, 78, 205, 255))
    d.rounded_rectangle([-Y(0.05), Y(0.878), X(0.325), Y(0.95)], radius=Y(0.036), fill=COL['plate'] + (255,), outline=COL['cyan_hi'] + (255,), width=max(1, int(Y(0.005))))
    d.rounded_rectangle([X(0.69), Y(0.878), W + Y(0.05), Y(0.95)], radius=Y(0.036), fill=COL['plate'] + (255,), outline=COL['cyan_hi'] + (255,), width=max(1, int(Y(0.005))))
    d.rounded_rectangle([X(0.355), Y(0.872), X(0.66), Y(0.955)], radius=Y(0.03), fill=COL['cyan_hi'] + (255,))
    d.rounded_rectangle([X(0.365), Y(0.882), X(0.65), Y(0.908)], radius=Y(0.012), fill=(60, 215, 235, 255))
    d.rounded_rectangle([X(0.365), Y(0.918), X(0.65), Y(0.946)], radius=Y(0.012), fill=(60, 215, 235, 255))
    f = font(FONT_B, Y(0.024)); w = d.textlength('2x, note', font=f); d.text((X(0.507) - w / 2, Y(0.881)), '2x, note', font=f, fill=(255, 255, 255, 255))
    # score: MAX2 scoring (the sample's numbers fit it): step j of N scores j * (10^7 * meter) / (N (N + 1) / 2); it counts up
    unit = 1e7 * meter / (n_rows * (n_rows + 1) / 2)
    sc = unit * (k - 1) * k / 2 + (unit * k * min(1.0, since / 0.45) if k else 0)
    f = font(FONT_B, Y(0.062)); s = f'{int(sc):09d}'; x = X(0.004)
    for ch in s:
        d.text((x, Y(0.879)), ch, font=f, fill=COL['score'] + (255,)); x += X(0.0345)
    f = font(FONT_B, Y(0.026))
    def spaced(s, xc, y, gap):
        w = sum(d.textlength(ch, font=f) for ch in s) + gap * (len(s) - 1); x = xc - w / 2
        for ch in s:
            d.text((x, y), ch, font=f, fill=(225, 240, 255, 255)); x += d.textlength(ch, font=f) + gap
    spaced('Kenton', X(0.175), Y(0.963), X(0.012)); spaced('FailEndOfSong', X(0.505), Y(0.963), 0); spaced('NOT PRESENT', X(0.85), Y(0.963), X(0.012))
    return im.convert('RGB').resize((GW, GH), Image.LANCZOS)


DIFF_COL = ((60, 235, 80), '')        # set in main(): the difficulty tab's colour (the sample's Heavy tab is green)


def register(src_gray, key_gray, mask):
    """affine key(640) -> src(640) by ECC (as tools/screen_atlas.py)"""
    Wm = np.eye(2, 3, dtype=np.float32)
    cc, Wm = cv2.findTransformECC(key_gray, src_gray, Wm, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), mask, 5)
    return cc, Wm


def main():
    global DIFF_COL, LANE_X0, NCOL, FIELD_X
    o = {}; a = sys.argv[1:]; i = 0
    while i < len(a):
        if a[i] in ('--no-matte',): o[a[i]] = True; i += 1
        else: o[a[i]] = a[i + 1]; i += 2
    diff = o.get('--diff', 'Medium'); chart0 = float(o.get('--chart0', 112)); offset = float(o.get('--offset', 0.5))
    style = o.get('--style', 'dance-double')
    rows, meter, desc = parse_chart(style, diff)
    if style == 'dance-single':
        NCOL, FIELD_X = 4, 0.25; LANE_X0 = FIELD_X - 1.5 * LANE_DX
    DIFF_COL = {'Beginner': ((70, 200, 255), ''), 'Easy': ((250, 196, 40), ''), 'Medium': ((240, 60, 110), ''), 'Hard': ((60, 235, 80), '')}[diff]
    B = Beats(); i0 = B.idx[(SHOT[0], SHOT[1])]; t0, t1 = B.t[i0], B.t[B.idx[(SHOT[2], SHOT[3])]]
    k0 = math.ceil(t0 * FPS - 1e-6); k1 = math.ceil(t1 * FPS - 1e-6); n = k1 - k0 + 1          # one spare frame
    print(f'shot {t0:.3f}-{t1:.3f} s: global frames {k0}..{k1 - 1} (+1 spare) = {n} atlas frames; chart {desc} (meter {meter}), beat {chart0:g} on the first beat')
    bg0 = Image.open(BG).convert('RGB').resize((GW * SS, GH * SS), Image.LANCZOS)                 # the 16:9 art squeezed to 4:3, as the game shows it
    # the art's halftone dots are far below what the painted TV can show: blur them away (else they alias into hatching),
    # then sit the blacks up toward blue, as a lit panel does in a lamplit room
    from PIL import ImageFilter
    bg0 = bg0.filter(ImageFilter.GaussianBlur(1.6 * SS))
    bg0 = Image.blend(bg0, Image.new('RGB', bg0.size, (36, 84, 228)), 0.30).convert('RGBA')
    flats = []
    for j in range(n):
        t = (k0 + j) / FPS; cb = chart0 + (B.pos(t) - i0)
        flats.append(draw_game(cb, rows, meter, bg0, B.pos(t)))
        if '--flat' in o:
            os.makedirs(o['--flat'], exist_ok=True); flats[-1].save(os.path.join(o['--flat'], f'g_{j:03d}.png'))
    if '--out' not in o:
        return
    # ---- into the painted TV. Target space: the roto key (frame-0 coordinates of the take) when a take is given
    q = np.array(QUAD_KF, np.float32); tw, th = KF_SIZE; T = np.eye(3, dtype=np.float32); mattes = None
    if '--take' in o:
        shot, take = o['--take'].split('/'); rd = os.path.join(ROOT, 'media/gen', shot, 'roto', take)
        meta = json.load(open(os.path.join(rd, 'meta.json'))); key = cv2.imread(os.path.join(rd, 'key.jpg')); th, tw = key.shape[:2]
        kfi = cv2.imread(os.path.join(ROOT, meta.get('keySource') or meta['first_frame'])); gh, gw = kfi.shape[:2]
        s = 640 / gw; g1 = cv2.cvtColor(cv2.resize(kfi, (640, round(gh * s))), cv2.COLOR_BGR2GRAY).astype(np.float32)
        k1g = cv2.cvtColor(cv2.resize(key, (640, g1.shape[0])), cv2.COLOR_BGR2GRAY).astype(np.float32)
        cc, Wm = register(g1, k1g, None)
        A = np.vstack([Wm, [0, 0, 1]]).astype(np.float64); Sg = np.diag([s, s, 1.0]); Sk = np.diag([640 / tw, g1.shape[0] / th, 1.0])
        T = (np.linalg.inv(Sk) @ np.linalg.inv(A) @ Sg).astype(np.float32)
        print(f'keyframe -> roto key {tw}x{th}: ECC {cc:.4f}')
        mattes = (rd, meta)
    qt = cv2.perspectiveTransform(q[None], T)[0]
    x0, y0 = np.floor(qt.min(0) - 3).astype(int); x1, y1 = np.ceil(qt.max(0) + 3).astype(int); bw, bh = x1 - x0, y1 - y0
    # the screen's own shape, feathered
    U = 2                                                                                         # warp at 2x, then area-average down
    quadm = np.zeros((bh * U, bw * U), np.uint8); cv2.fillConvexPoly(quadm, np.round((qt - [x0, y0]) * U * 8).astype(np.int32), 255, cv2.LINE_AA, 3)
    quadm = cv2.GaussianBlur(cv2.dilate(quadm, np.ones((7, 7), np.uint8)), (0, 0), 1.2).astype(np.float32) / 255   # 1.5 px over the bezel's inner edge: no key blue shows
    TVW, TVH = int(round(GH * 16 / 9)), GH                                                         # the 16:9 panel: 4:3 picture, black pillars
    Hm = cv2.getPerspectiveTransform(np.float32([[0, 0], [TVW, 0], [TVW, TVH], [0, TVH]]), ((qt - [x0, y0]) * U).astype(np.float32))
    cols = int(o.get('--cols', 7)); rws = int(math.ceil(n / cols)); atlas = np.zeros((rws * bh, cols * bw, 4), np.uint8)
    light = []
    for j, im in enumerate(flats):
        tv = np.full((TVH, TVW, 3), (4, 3, 3), np.uint8); px = (TVW - GW) // 2
        tv[:, px:px + GW] = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)
        wp = cv2.warpPerspective(tv, Hm, (bw * U, bh * U), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        al = quadm.copy()
        if mattes and '--no-matte' not in o:
            rd, meta = mattes
            t = (k0 + j) / FPS; ct = (t - t0) + offset; f = max(0, min(meta['frames'] - 1, int(math.floor(ct * meta['fps'] + 1e-3)))); f -= f % 2   # roto/index.js drawingIndex (twos)
            c = cv2.imread(os.path.join(rd, f'c_{f:04d}.jpg')); c = cv2.resize(c, (tw, th), interpolation=cv2.INTER_LINEAR)[y0:y1, x0:x1].astype(np.int32)
            b, g, r = c[..., 0], c[..., 1], c[..., 2]
            scr = ((b > 120) & (b - r > 70) & (b - g > 40)).astype(np.uint8)                        # the key blue
            scr = cv2.morphologyEx(scr, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
            inq = (cv2.resize(quadm, (bw, bh), interpolation=cv2.INTER_AREA) > 0.5).astype(np.uint8)
            core = cv2.erode(inq, np.ones((7, 7), np.uint8))                                        # inside the bezel's soft edge
            fgd = ((1 - scr) & core).astype(np.uint8)                                               # not blue, well inside the screen
            # someone in front always enters over the screen's edge: keep only blobs that reach the edge band (specks
            # of compression noise inside the blue are not people), then grow 2 px to take the blue fringe round them
            nlab, lab = cv2.connectedComponents(((1 - scr) & inq).astype(np.uint8), connectivity=8)
            band = (inq > 0) & (cv2.erode(inq, np.ones((11, 11), np.uint8)) == 0)
            keep = np.zeros(nlab, bool); keep[np.unique(lab[band])] = True; keep[0] = False
            occ = cv2.dilate((keep[lab] & (fgd > 0)).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
            m1 = cv2.GaussianBlur((1 - occ.astype(np.float32)), (0, 0), 1.0)
            al = al * cv2.resize(m1, (bw * U, bh * U), interpolation=cv2.INTER_LINEAR)
        rgba = np.dstack([wp, (al * 255).astype(np.uint8)])
        rgba = cv2.resize(rgba, (bw, bh), interpolation=cv2.INTER_AREA)
        r_, c_ = divmod(j, cols); atlas[r_ * bh:(r_ + 1) * bh, c_ * bw:(c_ + 1) * bw] = rgba
        light.append(round(float((rgba[..., :3].mean(2) * (rgba[..., 3] / 255.0)).sum() / max(1.0, rgba[..., 3].sum() / 255.0)) / 255, 4))
    cv2.imwrite(o['--out'], atlas)
    meta_o = {'bbox': [round(float(x0) / tw, 5), round(float(y0) / th, 5), round(float(x1) / tw, 5), round(float(y1) / th, 5)], 'cols': cols, 'rows': rws, 'n': n, 'fps': FPS,
              'k0': k0, 'quad': [[round(float(x) / tw, 5), round(float(y) / th, 5)] for x, y in qt], 'target': [tw, th], 'take': o.get('--take'), 'offset': offset,
              'chart': f'{style} {diff} ({desc}), beat {chart0:g} on bar {SHOT[0]} beat {SHOT[1]}', 'light': light}
    json.dump(meta_o, open(o['--out'].rsplit('.', 1)[0] + '.json', 'w'), indent=1)
    print(json.dumps({k: v for k, v in meta_o.items() if k != 'light'}))


if __name__ == '__main__':
    main()
