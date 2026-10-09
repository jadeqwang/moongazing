#!/usr/bin/env python3
"""rev3 KIDS (Oct 8): the toy Earth of the Copernican lesson (3.4a/b/c) with REAL coastlines, turned so that the
Moon ball's shadow sits on central Anatolia (Jade: the Easter egg for her Battle of Halys film; eclipse of 585 BC).

Per view (beam = 3.4c, wall = 3.4b, lesson = 3.4a):
  base    lay a flat, correctly projected globe (tools/globe_ortho.py: Natural Earth land, orthographic, the target
          under the painted shadow spot, north as nearly up as it goes) into a crop of the keyframe, under the
          children's fingers; no shadow on it. -> work/<view>_base.png  (this goes to the image model to be PAINTED)
  finish  take the painted crop back: only the globe's disc, minus the original fingers, returns to the keyframe;
          then the shadow is drawn by rule: the shaft's darkening across the disc and the spot (a dark core the size of
          Anatolia with a soft penumbra, so the coasts round it still read) centred on the target. -> the keyframe
  reproj  (wall, lesson) no image model: the globe painted for the beam view is re-projected onto this view's disc
          (same globe, seen from the side), lit from the lamp's side, laid under the fingers, and the spot drawn by
          rule. (Asked to paint these two small globes from their own bases, the image model copied the beam view's
          geography and moved the picture: the check caught both.)
  check   the real coastline drawn over the result, enlarged -> work/<view>_check.jpg  (look at it)

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python   (from the repo root)
    $MPY tools/k34_globe.py base beam ; (edit) ; $MPY tools/k34_globe.py finish beam EDIT.png OUT.jpg ; $MPY tools/k34_globe.py check beam OUT.jpg
    $MPY tools/k34_globe.py reproj wall OUT.jpg
"""
import sys

import cv2
import numpy as np

sys.path.insert(0, 'tools')
import globe_ortho as G  # noqa: E402

WORK = 'media/keyframes/work/rev3_kids/'
CW = 2048
# src: the keyframe the geometry was measured on (kept version). disc: centre x, y and radius (keyframe px).
# at: the shadow spot's centre on the disc (radii, y up). light: unit-ish vector the lamp light comes FROM (camera
# x right, y up, z toward the viewer) for the base's shading; None = lit flat.
# shaft: polygon (keyframe px) of the shadow shaft where it crosses the disc; its far end is the spot.
VIEWS = {
    'beam': dict(src='media/keyframes/K_3.4_beam_v1.jpg', box=(1145, 825, 800), disc=(1545, 1048, 179), at=(-0.30, 0.14),
                 core=0.135, pen=0.30, light=None,
                 shaft=[(1290, 1003), (1478, 975), (1500, 1072), (1290, 1112)], shaft_k=0.66),
    'wall': dict(src='media/keyframes/K_3.4_wall_v4.jpg', box=(1295, 500, 480), disc=(1535, 672, 96), at=(-0.63, 0.05),
                 core=0.135, pen=0.30, light=(-0.92, 0.1, 0.38), shaft=None, shaft_k=0.5,
                 hands=[[(1512, 728), (1540, 684), (1600, 684), (1650, 705), (1650, 780), (1512, 780)], [(1425, 700), (1462, 700), (1482, 770), (1425, 770)]]),
    'lesson': dict(src='media/keyframes/K_3.4_lesson_v4.jpg', box=(752, 317, 320), disc=(912, 407, 49), at=(-0.67, 0.15),
                   core=0.14, pen=0.30, light=(-0.92, 0.1, 0.38), shaft=None, shaft_k=0.5,
                   hands=[[(908, 410), (940, 408), (966, 422), (966, 456), (908, 456)], [(858, 414), (876, 414), (880, 450), (858, 450)]]),
}


def skin(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(int)
    m = ((lab[..., 1] > 140) & (lab[..., 2] > 150) & (lab[..., 0] > 150)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    return m


def disc_alpha(shape, cx, cy, r, feather=1.2, inset=0.0):
    a = np.zeros(shape[:2], np.float32)
    cv2.circle(a, (int(round(cx * 8)), int(round(cy * 8))), int(round((r - inset) * 8)), 1.0, -1, cv2.LINE_AA, 3)
    return cv2.GaussianBlur(a, (0, 0), feather)


def hands_mask(v, key):
    """Fingers that lie over the globe (original keyframe), a little grown so their ink outline comes along."""
    cx, cy, r = v['disc']
    m = skin(key)
    grow = max(3, int(r * 0.03))
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * grow + 1, 2 * grow + 1)))
    near = np.zeros_like(m); cv2.circle(near, (cx, cy), int(r * 1.25), 1, -1)
    m = m & near
    if v.get('hands'):                                                # the old globes' ochre land reads as skin: say where hands are
        hz = np.zeros_like(m)
        for poly in v['hands']:
            cv2.fillPoly(hz, [np.array(poly, np.int32)], 1)
        m = m & hz
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)           # ochre land of the old globe is not a finger
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < 0.02 * r * r:
            m[lab == i] = 0
    return m.astype(np.float32)


def base(name):
    v = VIEWS[name]; key = cv2.imread(v['src'])
    x0, y0, w = v['box']; h = w * 9 // 16
    cx, cy, r = v['disc']
    R = G.orient(*v['at'])
    size = int(round(2 * r * 4))                       # render at 4x, then place
    land, d = G.land(R, size)
    rng = np.random.default_rng(7)
    n = cv2.resize(rng.random((9, 9)).astype(np.float32), (size, size), interpolation=cv2.INTER_CUBIC)
    sea = np.array([128, 92, 48], np.float32); g1 = np.array([108, 150, 108], np.float32); g2 = np.array([105, 172, 202], np.float32)
    lc = g1 + (g2 - g1) * np.clip((n - 0.35) * 2.2, 0, 1)[..., None]
    img = sea * (1 - land[..., None]) + lc * land[..., None]
    if v['light']:
        yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
        nx = (xx + 0.5) / size * 2 - 1; ny = 1 - (yy + 0.5) / size * 2; nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0, 1))
        L = np.array(v['light'], np.float32); L /= np.linalg.norm(L)
        lam = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
        img = img * (0.16 + 0.84 * np.clip(lam * 1.25, 0, 1) ** 0.8)[..., None]
    # into the keyframe, under the fingers
    out = key.astype(np.float32)
    small = cv2.resize(img, (2 * r, 2 * r), interpolation=cv2.INTER_AREA)
    a = disc_alpha(key.shape, cx, cy, r, 0.8) * (1 - cv2.GaussianBlur(hands_mask(v, key), (0, 0), 0.8))
    layer = out.copy(); layer[cy - r:cy + r, cx - r:cx + r] = small
    out = out * (1 - a[..., None]) + layer * a[..., None]
    crop = out[y0:y0 + h, x0:x0 + w].round().astype(np.uint8)
    up = cv2.resize(crop, (CW, CW * 9 // 16), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(WORK + name + '_base.png', up); print('wrote', WORK + name + '_base.png')
    c = R.T @ np.array([0, 0, 1.0]); print('disc centre lat %.1f lon %.1f' % (np.degrees(np.arcsin(c[2])), np.degrees(np.arctan2(c[1], c[0]))))


def shadow(v, img):
    """The spot (and, in the beam view, the shaft across the disc), by rule, on a float image."""
    cx, cy, r = v['disc']
    sx, sy = cx + v['at'][0] * r, cy - v['at'][1] * r
    H, W = img.shape[:2]
    disc = disc_alpha(img.shape, cx, cy, r, 0.8)
    k = np.ones((H, W), np.float32)
    if v['shaft']:
        m = np.zeros((H, W), np.float32); cv2.fillPoly(m, [np.array(v['shaft'], np.int32)], 1.0, cv2.LINE_AA)
        m = cv2.GaussianBlur(m, (0, 0), 3.0) * disc
        k *= 1 - (1 - v['shaft_k']) * m
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # the spot lies on the sphere: foreshorten it toward the limb (an ellipse squeezed along the radius)
    ax, ay = v['at']; rho = float(np.hypot(ax, ay)); cz = float(np.sqrt(max(1e-6, 1 - rho * rho)))
    ux, uy = (ax / rho, -ay / rho) if rho > 1e-6 else (1.0, 0.0)       # radial direction in image px
    dx, dy = xx - sx, yy - sy
    rad = (dx * ux + dy * uy) / cz; tan = -dx * uy + dy * ux
    dist = np.sqrt(rad * rad + tan * tan) / r
    core, pen = v['core'], v['pen']
    t = np.clip((dist - core) / (pen - core), 0, 1)
    dark = 1 - (1 - v.get('dark', 0.25)) * (1 - t * t * (3 - 2 * t))   # dark in the core -> 1 at the penumbra's rim
    k = np.minimum(k, 1 - (1 - dark) * disc)
    return img * k[..., None]


def finish(name, editp, outp):
    v = VIEWS[name]; key = cv2.imread(v['src'])
    x0, y0, w = v['box']; h = w * 9 // 16
    cx, cy, r = v['disc']
    ed = cv2.resize(cv2.imread(editp), (w, h), interpolation=cv2.INTER_AREA)
    # register the edit on the base it was painted from (outside the globe the two are the same picture)
    basec = cv2.resize(cv2.imread(WORK + name + '_base.png'), (w, h), interpolation=cv2.INTER_AREA)
    g0 = cv2.cvtColor(basec, cv2.COLOR_BGR2GRAY).astype(np.float32); g1 = cv2.cvtColor(ed, cv2.COLOR_BGR2GRAY).astype(np.float32)
    Wm = np.eye(2, 3, dtype=np.float32)
    try:
        cc, Wm = cv2.findTransformECC(g0, g1, Wm, cv2.MOTION_TRANSLATION, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), None, 5)
        print('ECC', round(cc, 4), 'shift px', np.round(Wm[:, 2], 2))
        ed = cv2.warpAffine(ed, Wm, (w, h), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    except cv2.error as e:
        print('ECC failed:', e)
    full = key.astype(np.float32).copy(); full[y0:y0 + h, x0:x0 + w] = ed
    a = disc_alpha(key.shape, cx, cy, r, 1.0, inset=0.5) * (1 - cv2.GaussianBlur(hands_mask(v, key), (0, 0), 0.8))
    out = key.astype(np.float32) * (1 - a[..., None]) + full * a[..., None]
    if name == 'beam':                                                # the painted globe without its shadow: the source for reproj
        cv2.imwrite(WORK + 'beam_painted_clean.png', out[cy - r:cy + r, cx - r:cx + r].round().astype(np.uint8))
        cv2.imwrite(WORK + 'beam_painted_valid.png', ((1 - hands_mask(v, key))[cy - r:cy + r, cx - r:cx + r] * 255).astype(np.uint8))
    sh = shadow(v, out)
    hm = cv2.GaussianBlur(hands_mask(v, key), (0, 0), 0.8)[..., None]
    out = sh * (1 - hm) + out * hm                                      # fingers keep the light they were painted in
    cv2.imwrite(outp, out.round().astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 96]); print('wrote', outp)
    d = np.abs(out - key.astype(np.float32)).max(2); ys, xs = np.nonzero(d > 3); print('changed bbox x', xs.min(), xs.max(), 'y', ys.min(), ys.max())


def flat_colours(land, size):
    rng = np.random.default_rng(7)
    n = cv2.resize(rng.random((9, 9)).astype(np.float32), (size, size), interpolation=cv2.INTER_CUBIC)
    sea = np.array([128, 92, 48], np.float32); g1 = np.array([108, 150, 108], np.float32); g2 = np.array([105, 172, 202], np.float32)
    lc = g1 + (g2 - g1) * np.clip((n - 0.35) * 2.2, 0, 1)[..., None]
    return sea * (1 - land[..., None]) + lc * land[..., None]


def reproj(name, outp):
    v = VIEWS[name]; key = cv2.imread(v['src']); b = VIEWS['beam']
    cx, cy, r = v['disc']
    src = cv2.imread(WORK + 'beam_painted_clean.png').astype(np.float32); val = cv2.imread(WORK + 'beam_painted_valid.png', 0).astype(np.float32) / 255
    rb = src.shape[0] / 2
    Rv = G.orient(*v['at']); Rb = G.orient(*b['at'])
    ss = 4; n = 2 * r * ss
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float64)
    x = (xx + 0.5) / n * 2 - 1; y = 1 - (yy + 0.5) / n * 2
    z = np.sqrt(np.clip(1 - x * x - y * y, 0, 1))
    c = np.stack([x, y, z], -1) @ Rv @ Rb.T                           # this view's camera -> globe -> beam camera
    u = (rb + c[..., 0] * rb - 0.5).astype(np.float32); w = (rb - c[..., 1] * rb - 0.5).astype(np.float32)
    samp = cv2.remap(src, u, w, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    ok = cv2.remap(val, u, w, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    ok = ok * np.clip((c[..., 2] - 0.22) / 0.12, 0, 1).astype(np.float32)   # the beam painting's own limb is too squeezed to reuse
    ok = cv2.GaussianBlur(ok, (0, 0), ss * 1.5)
    land, d = G.land(Rv, n, ss=1)
    flat = flat_colours(land, n)
    edge = cv2.GaussianBlur((cv2.Canny((land * 255).astype(np.uint8), 60, 120) > 0).astype(np.float32), (0, 0), ss * 0.45)
    flat = flat * (1 - 0.75 * np.clip(edge * 3, 0, 1)[..., None])       # the fallback gets an ink coast too
    img = samp * ok[..., None] + flat * (1 - ok[..., None])
    L = np.array(v['light'], np.float32); L /= np.linalg.norm(L)
    lam = np.clip(x * L[0] + y * L[1] + z * L[2], 0, 1).astype(np.float32)
    img = img * (0.13 + 0.87 * np.clip(lam * 1.3, 0, 1) ** 0.8)[..., None]
    small = cv2.resize(img, (2 * r, 2 * r), interpolation=cv2.INTER_AREA)
    out = key.astype(np.float32)
    hm = cv2.GaussianBlur(hands_mask(v, key), (0, 0), 0.8)
    a = disc_alpha(key.shape, cx, cy, r, 0.8, inset=0.3) * (1 - hm)
    layer = out.copy(); layer[cy - r:cy + r, cx - r:cx + r] = small
    out = out * (1 - a[..., None]) + layer * a[..., None]
    ring = np.zeros(key.shape[:2], np.float32); cv2.circle(ring, (cx, cy), r, 1.0, max(1, r // 45), cv2.LINE_AA)
    ring = cv2.GaussianBlur(ring, (0, 0), 0.6) * (1 - hm)
    out = out * (1 - 0.7 * ring[..., None]) + np.array([30, 34, 40], np.float32) * 0.7 * ring[..., None]
    sh = shadow(v, out)
    out = sh * (1 - hm[..., None]) + out * hm[..., None]
    cv2.imwrite(outp, out.round().astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 96]); print('wrote', outp)


def check(name, imgp):
    v = VIEWS[name]; img = cv2.imread(imgp)
    cx, cy, r = v['disc']
    k = max(2, int(round(420 / r)))
    pad = int(r * 1.25)
    c = cv2.resize(img[cy - pad:cy + pad, cx - pad:cx + pad], None, fx=k, fy=k, interpolation=cv2.INTER_CUBIC)
    R = G.orient(*v['at'])
    land, d = G.land(R, 2 * r * k)
    edge = cv2.Canny((land * 255).astype(np.uint8), 60, 120)
    edge = cv2.dilate(edge, np.ones((2, 2), np.uint8))
    o = c.copy(); off = (pad - r) * k
    sub = o[off:off + 2 * r * k, off:off + 2 * r * k]; sub[edge > 0] = (0, 0, 255)
    tx, ty, _ = G.project(G.HALYS[0], G.HALYS[1], R)
    cv2.drawMarker(o, (int(pad * k + tx * r * k), int(pad * k - ty * r * k)), (0, 255, 255), cv2.MARKER_CROSS, 18, 2)
    cv2.imwrite(WORK + name + '_check.jpg', np.hstack([c, o])); print('wrote', WORK + name + '_check.jpg')


if __name__ == '__main__':
    cmd, name = sys.argv[1], sys.argv[2]
    if cmd == 'base':
        base(name)
    elif cmd == 'finish':
        finish(name, sys.argv[3], sys.argv[4])
    elif cmd == 'reproj':
        reproj(name, sys.argv[3])
    elif cmd == 'check':
        check(name, sys.argv[3])
