#!/usr/bin/env python3
"""Repeatable local round-five build; card wording remains in cards_r5.json."""
from __future__ import annotations
import argparse
import hashlib
import json, shutil
import math
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[2]
REVIEW = ROOT / 'release/review'
OUT = ROOT / 'render/out/rev_page/v8'
LOG = ROOT / 'render/out/v8_render.log'
JOBS = ROOT / 'render/out/retime/jobs.log'
FFMPEG = ROOT / '.venv/bin/ffmpeg'
FPS = 24
FULL_LIMIT = 15_000_000  # Decimal MB: remain below even the stricter interpretation.
OLD_PREFIXES = ('clips7/', 'img7/', 'clips6/', 'img6/', 'clips5/', 'img/', 'clips/', 'lyric/')

def status(line):
    with JOBS.open('a', encoding='utf8') as f:
        f.write(line + '\n')

def read_spec():
    spec = json.loads((REVIEW / 'cards_r5.json').read_text())
    for key in ('cards', 'settled', 'film'):
        if key not in spec:
            raise ValueError(f'cards_r5.json is missing {key}')
    film = spec['film']
    if not isinstance(film.get('intro'), str) or not film.get('parts'):
        raise ValueError('cards_r5.json needs film.intro and nonempty film.parts')
    previous = None
    for part in film['parts']:
        if len(part) != 3:
            raise ValueError('Each film.parts entry needs [from_s, to_s, caption]')
        a, b, cap = part
        if not isinstance(cap, str) or not 0 <= a < b or (previous is not None and abs(a - previous) > 1e-6):
            raise ValueError(f'Invalid/discontinuous film part: {part!r}')
        previous = b
    ids, names = set(), {f'film_{i}' for i in range(1, len(film['parts']) + 1)} | {'film_full'}
    for d in spec['cards']:
        for key in ('id', 'when', 'title', 'body', 'q', 'opts'):
            if key not in d:
                raise ValueError(f"Card {d.get('id', '(unnamed)')} is missing {key}")
        if not re.fullmatch(r'r5_[A-Za-z0-9_-]+', d['id']) or d['id'] in ids:
            raise ValueError(f"Invalid/duplicate round-five id: {d['id']}")
        ids.add(d['id'])
        for c in d.get('clips', []):
            if len(c) not in (6, 7):
                raise ValueError(f"Card {d['id']} clip needs file, label, caption, from, to, poster[, source]")
            name, label, cap, a, b, poster, *rest = c
            if not re.fullmatch(r'[A-Za-z0-9_-]+', name) or name in names:
                raise ValueError(f'Invalid/duplicate clip name: {name}')
            if not 0 <= a < b:
                raise ValueError(f'Invalid clip interval: {name}')
            names.add(name)
        for path, caption in d.get('before', []):
            if not path.startswith(OLD_PREFIXES) or '..' in Path(path).parts:
                raise ValueError(f'Before must use an already-published media path: {path}')
        values = [o[0] for o in d['opts']]
        if len(set(values)) != len(values) or not all(len(o) in (2, 3) for o in d['opts']):
            raise ValueError(f"Invalid options for {d['id']}")
    return spec

def audio_path():
    info = json.loads((ROOT / 'render/data/audio.json').read_text())
    src = ROOT / info['file']
    if not src.is_file():
        raise ValueError(f'Film audio missing: {src}')
    if '2down' not in src.name:
        raise ValueError(f'Film audio is not the new lower-key master: {src}')
    return src

def render_ready():
    if not LOG.exists():
        return False
    lines = LOG.read_text(errors='replace').splitlines()
    # Only the current render run counts; an older successful run is insufficient.
    start = max((i for i, s in enumerate(lines) if ' V8_START ' in s), default=0)
    current = lines[start:]
    return bool(current and current[-1].rstrip().endswith(' V8_DONE') and any(re.search(r'\bV8_RENDER_EXIT 0\s*$', s) for s in current))

def wait_for_render():
    while not render_ready():
        if LOG.exists():
            lines = LOG.read_text(errors='replace').splitlines()
            start = max((i for i, s in enumerate(lines) if ' V8_START ' in s), default=0)
            current = lines[start:]
            exits = [re.search(r'\bV8_RENDER_EXIT (\d+)\s*$', s) for s in current]
            exits = [m.group(1) for m in exits if m]
            if current and current[-1].rstrip().endswith(' V8_DONE') and exits and exits[-1] != '0':
                raise RuntimeError(f'Render finished with V8_RENDER_EXIT {exits[-1]}; no page media was cut. Rerun after a successful render.')
        tail = LOG.read_text(errors='replace').splitlines()[-1:] if LOG.exists() else ['log not created yet']
        print('Waiting for V8_DONE and V8_RENDER_EXIT 0; ' + ''.join(tail), flush=True)
        time.sleep(30)
    print('Verified render completion markers found; media cutting may begin.', flush=True)

def ranges(a, b):
    return math.ceil(a * FPS - 1e-6), math.ceil(b * FPS - 1e-6)

def preflight_frames(spec, framedir):
    a, b = spec['film']['parts'][0][0], spec['film']['parts'][-1][1]
    intervals = [(a, b, framedir)]
    for d in spec['cards']:
        for _, _, _, a, b, _, *rest in d.get('clips', []):
            src = ROOT / rest[0] if rest else framedir
            if src.suffix.lower() == '.mp4':
                if not src.is_file():
                    raise ValueError(f'Clip source missing: {src}')
            else:
                intervals.append((a, b, src))
    for a, b, src in intervals:
        i0, i1 = ranges(a, b)
        for i in range(i0, i1):
            f = src / f'f_{i:06d}.jpg'
            if not f.is_file() or not f.stat().st_size:
                raise ValueError(f'Missing/empty completed render frame: {f}')

def encode(src, dst, a, b, audio, crf=26, audio_bitrate='320k'):
    if src.suffix.lower() == '.mp4':
        cmd = [str(FFMPEG), '-v', 'error', '-y', '-i', str(src), '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-threads', '4', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(dst)]
    else:
        i0, i1 = ranges(a, b)
        # These are the round-four/render.mjs frame-range and audio-trim rules.
        cmd = [str(FFMPEG), '-v', 'error', '-y', '-framerate', str(FPS), '-start_number', str(i0), '-i', str(src / 'f_%06d.jpg'), '-i', str(audio),
               '-filter_complex', f'[1:a]atrim=start={i0/FPS:.6f}:end={max(b,i0/FPS):.6f},asetpts=PTS-STARTPTS[a]', '-map', '0:v', '-map', '[a]', '-frames:v', str(i1-i0),
               '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-threads', '4', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', audio_bitrate, '-movflags', '+faststart', str(dst)]
    subprocess.run(cmd, check=True)
    size = dst.stat().st_size
    print(f'{dst.name}: {size:,} bytes ({size/1_000_000:.2f} MB), CRF {crf}', flush=True)
    return size

def frame(i, src):
    with Image.open(src / f'f_{i:06d}.jpg') as im:
        return im.convert('RGB')

def save_poster(im, dst):
    w = min(960, im.width)
    im.resize((w, round(w * im.height / im.width)), Image.Resampling.LANCZOS).save(dst, quality=86)

def still(ref, src, framedir):
    if isinstance(ref, str):
        with Image.open(ROOT / ref) as im:
            return im.convert('RGB')
    return frame(ref, src if src.suffix.lower() != '.mp4' else framedir)

def film_poster(a, b, framedir):
    first, last = ranges(a, b)
    fallback = min(last-1, first+2*FPS)
    for i in range(first, fallback+1):
        im = frame(i, framedir)
        # Avoid near-black/title-free frames while retaining a genuine first image.
        stat = ImageStat.Stat(im.resize((96, 54)).convert('L'))
        if stat.mean[0] > 12 and stat.stddev[0] > 5:
            return im
    return frame(fallback, framedir)

def inline(value):
    return json.dumps(value, ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')

def make_page(spec, full):
    old = (REVIEW / 'decisions.html').read_text()
    head = old[:old.index('</style>')]
    if '/* round five */' in head:
        head = head[:head.index('/* round five */')]
    if '/* round four */' not in head:
        head += '\n' + (REVIEW / 'page_r4.css').read_text()
    if 'name="viewport"' not in head:
        head = '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + head
    cards = [dict(d, clips=[c[:3] for c in d.get('clips', [])]) for d in spec['cards']]
    r4 = json.loads((REVIEW / 'cards_r4.json').read_text())
    r4cards = [dict(d, clips=[c[:3] for c in d.get('clips', [])]) for d in r4['cards']]
    values = {'__CARDS5__': cards, '__FILM__': dict(spec['film'], full=full), '__SETTLED5__': spec['settled'], '__CARDS4__': r4cards, '__SETTLED__': r4['settled'], '__CARDS__': json.loads((REVIEW / 'cards_r3.json').read_text())}
    body = (REVIEW / 'page_r5_body.html').read_text()
    for key, value in values.items():
        if key not in body:
            raise ValueError(f'Missing template placeholder {key}')
        body = body.replace(key, inline(value))
    return head.rstrip() + '\n' + (REVIEW / 'page_r5.css').read_text() + '</style>\n' + body

def check_page(page, media_root, dry=False):
    subprocess.run(['node', str(REVIEW / 'check_page_r5.mjs'), str(page), str(media_root), *(['--dry-run'] if dry else [])], check=True)

def dry_check(spec):
    audio_path()
    # Check both branches, including the optional continuous player. No media is cut.
    with tempfile.TemporaryDirectory(prefix='r5-dry-', dir='/tmp') as tmp:
        for full in (False, True):
            p = Path(tmp) / 'decisions.html'
            p.write_text(make_page(spec, full))
            check_page(p, OUT, dry=True)
    status('PAGE_SCAFFOLD_DONE')
    print('PAGE_SCAFFOLD_DONE', flush=True)

def build(framedir):
    wait_for_render()
    # Other sessions may have added/edited cards while the render was running.
    spec = read_spec()
    source_hash = hashlib.sha256((REVIEW/'cards_r5.json').read_bytes()).hexdigest()
    audio = audio_path()
    preflight_frames(spec, framedir)
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.build-r5-', dir=OUT) as staging:
        stage = Path(staging)
        (stage/'clips8').mkdir(); (stage/'img8').mkdir()
        for d in spec['cards']:
            for name, _, _, a, b, poster, *rest in d.get('clips', []):
                src = ROOT/rest[0] if rest else framedir
                encode(src, stage/'clips8'/f'{name}.mp4', a, b, audio)
                save_poster(still(poster, src, framedir), stage/'img8'/f'{name}.jpg')
            for k, (ref, _, *rest) in enumerate(d.get('more', [])):
                src = ROOT/rest[0] if rest else framedir
                save_poster(still(ref, src, framedir), stage/'img8'/f"{d['id']}_{k}.jpg")
        for n, (a, b, _) in enumerate(spec['film']['parts'], 1):
            encode(framedir, stage/'clips8'/f'film_{n}.mp4', a, b, audio)
            save_poster(film_poster(a, b, framedir), stage/'img8'/f'film_{n}.jpg')
        first = spec['film']['parts'][0][0]; last = spec['film']['parts'][-1][1]
        full = False; full_crf = None; full_size = None
        for crf in (28, 30, 32, 34):
            # 160k AAC retains the film's audio and gives the video more of the
            # upload budget. Individual cards/parts retain round-four 320k AAC.
            full_size = encode(framedir, stage/'clips8/film_full.mp4', first, last, audio, crf, '160k')
            if full_size < FULL_LIMIT:
                full = True; full_crf = crf
                save_poster(film_poster(first, last, framedir), stage/'img8/film_full.jpg')
                break
        if not full:
            (stage/'clips8/film_full.mp4').unlink()
            print(f"Continuous film omitted: {full_size/1_000_000:.2f} MB at the CRF 34 quality limit. All {len(spec['film']['parts'])} parts are included.", flush=True)
        page = stage/'decisions.html'; page.write_text(make_page(spec, full))
        # The lyric videos (lyric8/) are made elsewhere and stay in place: the check sees them through a link.
        link = stage/'lyric8'
        if (OUT/'lyric8').is_dir(): link.symlink_to(OUT/'lyric8', target_is_directory=True)
        if (OUT/'img8/lyric.jpg').is_file(): shutil.copy2(OUT/'img8/lyric.jpg', stage/'img8/lyric.jpg')   # its poster
        try:
            check_page(page, stage)
        finally:
            if link.is_symlink(): link.unlink()
        if source_hash != hashlib.sha256((REVIEW/'cards_r5.json').read_bytes()).hexdigest():
            raise ValueError('cards_r5.json changed during encoding; rerun to build the current cards')
        files = sorted(str(p.relative_to(stage)) for p in stage.rglob('*') if p.is_file() and p.name != 'decisions.inline.js')
        for rel in files:
            dst=OUT/rel; dst.parent.mkdir(parents=True, exist_ok=True); os.replace(stage/rel, dst)
        if not full:
            for rel in ('clips8/film_full.mp4', 'img8/film_full.jpg'):
                (OUT/rel).unlink(missing_ok=True)  # Remove only an obsolete generated full player.
        # The publishable copy and requested source page are byte-identical.
        temp_page = REVIEW / '.decisions-r5.tmp.html'
        temp_page.write_bytes((OUT/'decisions.html').read_bytes())
        os.replace(temp_page, REVIEW/'decisions.html')
        check_page(REVIEW/'decisions.html', OUT)
        (OUT/'FILES_TO_PUBLISH.txt').write_text('\n'.join(files)+'\n')
        report = dict(cards=len(spec['cards']),parts=len(spec['film']['parts']),audio=str(audio.relative_to(ROOT)),full_included=full,full_crf=full_crf,full_bytes=full_size,limit_bytes=FULL_LIMIT,files=files,source_cards_sha256=source_hash)
        (OUT/'BUILD_REPORT.json').write_text(json.dumps(report, indent=2)+'\n')
        print('Files to publish (relative to render/out/rev_page/v8):', flush=True)
        for rel in files:
            print(f'{rel}: {(OUT/rel).stat().st_size:,} bytes', flush=True)
    status('PAGE_BUILD_DONE')
    print('PAGE_BUILD_DONE', flush=True)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('framedir',nargs='?',default='render/out/frames_v8_540')
    parser.add_argument('--dry-run',action='store_true')
    args=parser.parse_args()
    os.chdir(ROOT)
    framedir=Path(args.framedir).resolve()
    try:
        spec=read_spec()
        if args.dry_run:
            dry_check(spec)
        else:
            build(framedir)
    except Exception as e:
        status('PAGE_FAILED: '+str(e).replace('\n',' '))
        raise

if __name__=='__main__':
    main()
