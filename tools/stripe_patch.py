#!/usr/bin/env python3
"""Collar-stripe colour patch (rev3_crew, Oct 8): set a crew member's collar stripe to the crew sheet's colour in a
painted keyframe AND in the roto data of its take, without a new take.

Why: Chen Yu's vermilion stripe (#C8312B, docs/character_bible.md) was muted to a cinnabar-brown in round one under the
no-red rule; Jade then exempted collar accents ("let Chen Yu keep true vermilion"). The roto shows the painted keyframe
where nothing moves and the take's own colours (snapped to the keyframe palette) where the figure moves, so the stripe
has to be right in three places: the keyframe, the roto key plates (key.jpg, key_orig.jpg, pkey.jpg) and the take's
colour frames (c_NNNN.jpg); the colour is also added to the roto palette so the snap cannot pull it back to brown.

    MPY=/home/jade/Documents/orbital-sunrise-video/video/out/.venv/bin/python
    $MPY tools/stripe_patch.py keyframe K_7.C4_c1_chen     # writes the recoloured keyframe file named in the spec
    $MPY tools/stripe_patch.py roto K_7.C4_c1_chen         # patches media/gen/<K>/roto/<take>/ in place (idempotent)
Order for a keyframe that carries an emblem: `keyframe`, then tools/emblem_patch.py <K> (its _orig must point at the
recoloured file), then `roto`. Re-run `roto` after any roto_prep.py or emblem_patch.py re-run on the take.
A stripe = pixels inside the spec's box (fractions of the frame, generous) whose hue is red-brown-orange, in connected
pieces above a minimum size; everything else (skin, ink line, hair) is left alone. Check sheets: render/out/rev3_crew/stripe/.
"""
import glob
import json
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = (200, 49, 43)            # #C8312B vermilion (RGB)
SPEC = {
    # box: x0, y0, x1, y1 as fractions; sel: (hue max deg, S min, V min, V max); min: smallest piece, px at 2752 wide
    'K_7.C4_c1_chen': dict(take='take_2', src='K_7.C4_c1_chen_v2.jpg', dst='K_7.C4_c1_chen_v3.jpg', box=(0.58, 0.24, 0.82, 0.62),
                           key_sel=(24, 0.36, 0.27, 0.52), take_sel=(22, 0.48, 0.42, 0.95), min=250,
                           mask='work/rev3_crew/chen_c1_stripe_mask.png'),   # keyframe only: where _v1 and _v2 differ = the stripe
    'K_7.C5b': dict(take='take_2', src='K_7.C5b_v1.jpg', dst='K_7.C5b.jpg', box=(0.06, 0.42, 0.36, 0.58),
                    key_sel=(16, 0.50, 0.25, 0.85), take_sel=(16, 0.50, 0.25, 0.95), min=400),
}


def select(bgr, box, sel, amin):
    H, W = bgr.shape[:2]
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
    m = ((h <= sel[0]) | (h >= 345)) & (s >= sel[1]) & (v >= sel[2]) & (v <= sel[3])
    roi = np.zeros((H, W), bool); roi[int(box[1] * H):int(box[3] * H), int(box[0] * W):int(box[2] * W)] = True
    m = (m & roi).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    amin = amin * (W / 2752.0) ** 2
    out = np.zeros_like(m)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= amin:
            out[lab == i] = 1
    return out


def recolour(bgr, m):
    if not m.any():
        return bgr, 0
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    t = cv2.cvtColor(np.uint8([[TARGET[::-1]]]), cv2.COLOR_BGR2HSV)[0, 0].astype(np.float32)
    v = hsv[..., 2]; vm = float(np.median(v[m > 0]))
    new = hsv.copy()
    new[..., 0] = t[0]; new[..., 1] = t[1]
    new[..., 2] = np.clip(v * (t[2] / max(vm, 1.0)), 0, 235)          # keep the stripe's own shading, at the target's value
    rgb = cv2.cvtColor(np.clip(new, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    a = cv2.GaussianBlur(cv2.dilate(m, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), max(0.6, bgr.shape[1] / 2752.0))[..., None]
    return np.clip(bgr * (1 - a) + rgb * a, 0, 255).astype(np.uint8), int(m.sum())


def crop_pair(a, b, box, path):
    H, W = a.shape[:2]; y0, y1, x0, x1 = int(box[1] * H), int(box[3] * H), int(box[0] * W), int(box[2] * W)
    pair = np.hstack([a[y0:y1, x0:x1], b[y0:y1, x0:x1]]); s = 900 / pair.shape[1]
    os.makedirs(os.path.dirname(path), exist_ok=True); cv2.imwrite(path, cv2.resize(pair, None, fx=s, fy=s, interpolation=cv2.INTER_AREA))


def main():
    cmd, key = sys.argv[1], sys.argv[2]; sp = SPEC[key]
    chk = os.path.join(ROOT, 'render/out/rev3_crew/stripe')
    if cmd == 'keyframe':
        src = os.path.join(ROOT, 'media/keyframes', sp['src']); a = cv2.imread(src)
        m = select(a, sp['box'], sp['key_sel'], sp['min'])
        if sp.get('mask'): m = m & (cv2.dilate(cv2.imread(os.path.join(ROOT, 'media/keyframes', sp['mask']), 0), np.ones((9, 9), np.uint8)) > 0)
        b, n = recolour(a, m.astype(np.uint8))
        cv2.imwrite(os.path.join(ROOT, 'media/keyframes', sp['dst']), b, [cv2.IMWRITE_JPEG_QUALITY, 96])
        crop_pair(a, b, sp['box'], os.path.join(chk, key + '_keyframe.jpg')); print(key, 'keyframe stripe px', n, '->', sp['dst'])
    elif cmd == 'roto':
        d = os.path.join(ROOT, 'media/gen', key, 'roto', sp['take'])
        for name in ('key_orig.jpg', 'key.jpg', 'pkey.jpg'):
            p = os.path.join(d, name)
            if not os.path.exists(p): continue
            a = cv2.imread(p); b, n = recolour(a, select(a, sp['box'], sp['key_sel'], sp['min']))
            cv2.imwrite(p, b, [cv2.IMWRITE_JPEG_QUALITY, 95]); print(name, 'px', n)
            if n: crop_pair(a, b, sp['box'], os.path.join(chk, f'{key}_{name}'))
        # where the key plate has the stripe, a looser colour test catches the parts of it the take painted duller
        kp = cv2.imread(os.path.join(d, 'key_orig.jpg') if os.path.exists(os.path.join(d, 'key_orig.jpg')) else os.path.join(d, 'key.jpg'))
        t = cv2.cvtColor(np.uint8([[TARGET[::-1]]]), cv2.COLOR_BGR2HSV)[0, 0]
        hk = cv2.cvtColor(kp, cv2.COLOR_BGR2HSV); near_t = (np.abs(hk[..., 0].astype(int) - int(t[0])) <= 3) & (hk[..., 1] > 150)
        H0, W0 = kp.shape[:2]; roi = np.zeros((H0, W0), bool); roi[int(sp['box'][1] * H0):int(sp['box'][3] * H0), int(sp['box'][0] * W0):int(sp['box'][2] * W0)] = True
        prior = (near_t & roi).astype(np.uint8)          # key plates are already patched above: the stripe is the target hue now
        tot = []
        for p in sorted(glob.glob(os.path.join(d, 'c_*.jpg'))):
            a = cv2.imread(p); m = select(a, sp['box'], sp['take_sel'], sp['min'] * 0.6)
            pr = cv2.dilate(cv2.resize(prior, (a.shape[1], a.shape[0]), interpolation=cv2.INTER_NEAREST), np.ones((13, 13), np.uint8))
            hv = cv2.cvtColor(a, cv2.COLOR_BGR2HSV).astype(np.float32)
            loose = ((hv[..., 0] * 2 <= 28) | (hv[..., 0] * 2 >= 345)) & (hv[..., 1] / 255 >= 0.33) & (hv[..., 2] / 255 >= 0.33) & (hv[..., 2] / 255 <= 0.72)
            m = (m | (pr & loose.astype(np.uint8))).astype(np.uint8)
            b, n = recolour(a, m); tot.append(n)
            if n: cv2.imwrite(p, b, [cv2.IMWRITE_JPEG_QUALITY, 95])
            if os.path.basename(p) in ('c_0030.jpg', 'c_0040.jpg'): crop_pair(a, b, sp['box'], os.path.join(chk, f'{key}_{os.path.basename(p)}'))
        print('colour frames', len(tot), 'stripe px min/median/max', min(tot), int(np.median(tot)), max(tot), 'frames with none', sum(1 for t in tot if not t))
        mp = os.path.join(d, 'meta.json'); meta = json.load(open(mp)); pal = meta.get('palette') or []
        tgt = [round(c / 255, 4) for c in TARGET]
        if not any(max(abs(a - b) for a, b in zip(q, tgt)) < 0.02 for q in pal):
            share = meta.get('paletteShare') or []
            zero = [i for i, s in enumerate(share) if s == 0 and i < len(pal)]
            if zero: pal[zero[0]] = tgt
            elif len(pal) < 16: pal.append(tgt); share.append(0.001)
            meta['palette'] = pal; meta['stripe_patch'] = {'rgb': list(TARGET), 'tool': 'tools/stripe_patch.py'}
            json.dump(meta, open(mp, 'w')); print('palette: vermilion added')
        os.utime(d, None)


if __name__ == '__main__':
    main()
