#!/usr/bin/env python3
"""Before/after for a roto test render: raw base clip (as the edit would play it) | our redraw, with the song audio.

    MPY tools/roto_compare.py --name LS2 --clip LS2/take_7 --frames render/out/roto_tests/LS2/frames \
        --t0 54.09 --t1 57.83 [--ref_t0 53.79 --lag -0.102 | --offset 0] [--audio] [--sheet 54.3,55.0,56.4] [--crop x,y,w,h]
Writes render/out/roto_tests/<name>/: compare.mp4 (raw | redraw), redraw.mp4, sheet.jpg (raw/redraw rows at the
sheet times + 4 consecutive redraw frames of the crop and their abs-difference, to judge boil/flicker).
"""
import argparse
import os
import subprocess

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG = os.path.join(ROOT, ".venv", "bin", "ffmpeg")
SONG = os.path.join(ROOT, "inputs", "moongazing.mp3")
FPS = 24


def raw_frame(fdir, ct, n, W, H):
    f = int(np.clip(np.floor(ct * FPS + 1e-3), 0, n - 1))
    im = cv2.imread(os.path.join(fdir, f"f_{f:04d}.jpg"))
    ar, rar = im.shape[1] / im.shape[0], W / H
    if ar > rar:  # cover fit, as the renderer does
        w = int(round(im.shape[0] * rar)); x = (im.shape[1] - w) // 2; im = im[:, x:x + w]
    else:
        h = int(round(im.shape[1] / rar)); y = (im.shape[0] - h) // 2; im = im[y:y + h]
    return cv2.resize(im, (W, H), interpolation=cv2.INTER_CUBIC)


def label(im, txt):
    cv2.putText(im, txt, (14, 34), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 4, cv2.LINE_AA)
    cv2.putText(im, txt, (14, 34), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (240, 240, 240), 2, cv2.LINE_AA)
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True); ap.add_argument("--clip", required=True)
    ap.add_argument("--frames", required=True)
    ap.add_argument("--t0", type=float, required=True); ap.add_argument("--t1", type=float, required=True)
    ap.add_argument("--ref_t0", type=float); ap.add_argument("--lag", type=float, default=0.0)
    ap.add_argument("--offset", type=float, default=0.0)
    ap.add_argument("--audio", action="store_true")
    ap.add_argument("--sheet", default="")
    ap.add_argument("--crop", default="")
    a = ap.parse_args()
    shot, take = a.clip.split("/")
    fdir = os.path.join(ROOT, "media", "gen", shot, "frames", take)
    n = len([f for f in os.listdir(fdir) if f.endswith(".jpg")])
    rdir = os.path.join(ROOT, a.frames) if not os.path.isabs(a.frames) else a.frames
    out = os.path.join(ROOT, "render", "out", "roto_tests", a.name)
    os.makedirs(out, exist_ok=True)
    i0, i1 = int(np.ceil(a.t0 * FPS - 1e-6)), int(np.ceil(a.t1 * FPS - 1e-6))
    first = cv2.imread(os.path.join(rdir, f"f_{i0:06d}.jpg"))
    H, W = first.shape[:2]
    hw, hh = W // 2, H // 2
    ct_of = (lambda t: t - a.ref_t0 + a.lag) if a.ref_t0 is not None else (lambda t: t - a.t0 + a.offset + a.lag)
    tmp = os.path.join(out, "_cmp"); os.makedirs(tmp, exist_ok=True)
    for i in range(i0, i1):
        t = i / FPS
        r = cv2.imread(os.path.join(rdir, f"f_{i:06d}.jpg"))
        raw = raw_frame(fdir, ct_of(t), n, W, H)
        pair = np.hstack([label(cv2.resize(raw, (hw, hh), interpolation=cv2.INTER_AREA), "base clip (never shown)"),
                          label(cv2.resize(r, (hw, hh), interpolation=cv2.INTER_AREA), "roto redraw")])
        cv2.imwrite(os.path.join(tmp, f"c_{i:06d}.jpg"), pair, [cv2.IMWRITE_JPEG_QUALITY, 92])
    aud = []
    if a.audio:
        aud = ["-i", SONG, "-filter_complex", f"[1:a]atrim=start={i0 / FPS:.6f}:end={i1 / FPS:.6f},asetpts=PTS-STARTPTS[a]",
               "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "256k"]
    for src, name in ((os.path.join(tmp, "c_%06d.jpg"), "compare.mp4"), (os.path.join(rdir, "f_%06d.jpg"), "redraw.mp4")):
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-framerate", str(FPS), "-start_number", str(i0), "-i", src, *aud,
                        "-frames:v", str(i1 - i0), "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p",
                        "-r", str(FPS), "-movflags", "+faststart", os.path.join(out, name)], check=True)
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    # sheet
    times = [float(x) for x in a.sheet.split(",") if x] or list(np.linspace(a.t0 + 0.1, a.t1 - 0.1, 4))
    tw = 640; th = int(tw * H / W)
    rows = []
    for t in times:
        i = int(round(t * FPS))
        r = cv2.resize(cv2.imread(os.path.join(rdir, f"f_{i:06d}.jpg")), (tw, th), interpolation=cv2.INTER_AREA)
        raw = cv2.resize(raw_frame(fdir, ct_of(i / FPS), n, W, H), (tw, th), interpolation=cv2.INTER_AREA)
        rows.append(np.hstack([label(raw, f"base {t:.2f}s"), label(r, f"redraw {t:.2f}s")]))
    sheet = np.vstack(rows)
    if a.crop:
        x, y, w, h = [int(v) for v in a.crop.split(",")]
        mid = int(round(times[len(times) // 2] * FPS))
        cr = [cv2.imread(os.path.join(rdir, f"f_{i:06d}.jpg"))[y:y + h, x:x + w] for i in range(mid, mid + 4)]
        rw = [raw_frame(fdir, ct_of(i / FPS), n, W, H)[y:y + h, x:x + w] for i in range(mid, mid + 4)]
        dif = [np.clip(np.abs(cr[k + 1].astype(int) - cr[k].astype(int)) * 4, 0, 255).astype(np.uint8) for k in range(3)]
        dfr = [np.clip(np.abs(rw[k + 1].astype(int) - rw[k].astype(int)) * 4, 0, 255).astype(np.uint8) for k in range(3)]
        strip = np.vstack([np.hstack(rw), np.hstack(cr),
                           np.hstack(dfr + [np.zeros_like(rw[0])]), np.hstack(dif + [np.zeros_like(cr[0])])])
        s = sheet.shape[1] / strip.shape[1]
        strip = cv2.resize(strip, (sheet.shape[1], int(strip.shape[0] * s)), interpolation=cv2.INTER_AREA)
        cv2.putText(strip, "4 consecutive frames: base / redraw / |base diff|x4 / |redraw diff|x4", (10, 24),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        sheet = np.vstack([sheet, strip])
    cv2.imwrite(os.path.join(out, "sheet.jpg"), sheet, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print("wrote", os.path.relpath(out, ROOT), "compare.mp4 redraw.mp4 sheet.jpg")


if __name__ == "__main__":
    main()
