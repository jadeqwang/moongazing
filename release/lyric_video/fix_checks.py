"""Native-resolution evidence for pinyin and full-run English spacing fixes."""
import hashlib
import json
import math
import sys
import unicodedata
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from lyrics import OUT, ROOT, log
from verify import run


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def main():
    encoded = '--encoded' in sys.argv
    lines = json.loads((OUT / 'lyric_manifest.json').read_text())
    folder = OUT / 'fix_checks'
    folder.mkdir(exist_ok=True)
    label_font = ImageFont.truetype(str(OUT / 'fonts/mono.ttf'), 16)
    spacing_rows = []
    comparisons = []
    for line in lines:
        if line['lang'] != 'en':
            continue
        plain = Image.open(OUT / 'spacing' / (line['id'] + '_plain.png')).convert('RGB')
        karaoke = Image.open(OUT / 'spacing' / (line['id'] + '_karaoke.png')).convert('RGB')
        difference = np.abs(np.asarray(plain).astype(int) - np.asarray(karaoke).astype(int))
        assert not difference.any(), line['id']
        comparisons.append(dict(line=line['id'], maximum_position_error_px=0,
                                maximum_channel_difference=0, differing_pixels=0))
        if line['id'] in ['L01', 'L05', 'L11']:
            row = Image.new('RGB', (1200, 276), '#101827')
            d = ImageDraw.Draw(row)
            d.text((10, 4), line['id'] + ' plain single ASS run (100%)', font=label_font, fill='#d8b36a')
            row.paste(plain.crop((110, 700, 1310, 790)), (0, 28))
            d.text((10, 126), 'Karaoke full-run word clips (100%)', font=label_font, fill='#d8b36a')
            row.paste(karaoke.crop((110, 700, 1310, 790)), (0, 150))
            d.text((10, 248), 'Pixel difference: 0; word position error: 0 px', font=label_font, fill='#d8b36a')
            spacing_rows.append(row)
    sheet = Image.new('RGB', (1200, len(spacing_rows) * 276), '#101827')
    for i, row in enumerate(spacing_rows):
        sheet.paste(row, (0, i * 276))
    sheet.save(OUT / 'spacing_check.jpg', quality=98, subsampling=0)
    (OUT / 'spacing_checks.json').write_text(json.dumps(comparisons, indent=2))

    chinese = [line for line in lines if line['lang'] == 'zh']
    assert len(chinese) == 7
    variants = ['A', 'B'] if encoded else ['preview']
    pinyin_rows = []
    pinyin_records = []
    for kind in variants:
        for i, line in enumerate(chinese):
            t = math.ceil(((line['start'] + line['end']) / 2) * 24) / 24
            target = folder / f'{kind}_{i}_{line["id"]}.png'
            if encoded:
                video = OUT / ('Moongazing_lyric_video.mp4' if kind == 'A' else 'Moongazing_lyric_video_karaoke.mp4')
                run([ROOT / '.venv/bin/ffmpeg', '-y', '-v', 'error', '-threads', '6',
                     '-ss', f'{t:.9f}', '-i', video, '-frames:v', '1', '-threads', '6', target])
                frame = Image.open(target)
            else:
                index = lines.index(line) + 3
                frame = Image.open(OUT / 'review' / f'{index:02d}_{line["id"]}.png')
            syllables = [token['pinyin'] for token in line['tokens'] if 'pinyin' in token]
            assert all(unicodedata.is_normalized('NFC', syllable) for syllable in syllables)
            assert not any(unicodedata.combining(ch) for syllable in syllables for ch in syllable)
            # Crop without resizing. At each midpoint the line has reached y=700.
            row = Image.new('RGB', (1100, 110), '#101827')
            row.paste(frame.crop((0, 640, 1100, 720)), (0, 30))
            ImageDraw.Draw(row).text((10, 3), f'{kind} {line["id"]} segment {i+1}/7 {t:.3f}s — pinyin 100%',
                                    font=label_font, fill='#d8b36a')
            pinyin_rows.append(row)
            pinyin_records.append(dict(version=kind, line=line['id'], segment=i+1,
                                       time=t, pinyin=syllables, normalization='NFC', crop_scale=1))
    sheet = Image.new('RGB', (1100, 110 * len(pinyin_rows)), '#101827')
    for i, row in enumerate(pinyin_rows):
        sheet.paste(row, (0, i * 110))
    sheet.save(OUT / 'pinyin_check.jpg', quality=98, subsampling=0)
    if encoded:
        for i, kind in enumerate(['A', 'B']):
            sheet.crop((0, i*770, 1100, (i+1)*770)).save(folder/f'pinyin_{kind}.jpg', quality=98, subsampling=0)
        for kind, offset in [('A', 0), ('B', len(lines) + 4)]:
            selection = (OUT / f'encode_{kind}.log').read_text()
            assert '(Lyric Pinyin, 400, 0) -> LyricPinyin' in selection
            assert 'failed to find' not in selection and 'Glyph ' not in selection
            for start in range(0, len(lines), 5):
                subset = lines[start:start+5]
                native = Image.new('RGB', (1300, len(subset)*282), '#101827')
                for j, line in enumerate(subset):
                    index = offset + 3 + start + j
                    frame = Image.open(OUT / 'verification' / f'{index:02d}_{kind}_{line["id"]}.jpg')
                    native.paste(frame.crop((0, 630, 1300, 890)), (0, j*282+22))
                    ImageDraw.Draw(native).text((8, j*282+2), f'{kind} {line["id"]} native crop 100%',
                                               font=label_font, fill='#d8b36a')
                native.save(folder/f'native_{kind}_{start:02d}.jpg', quality=98, subsampling=0)
        expected = json.loads((OUT / 'fix_audio_hashes.json').read_text())
        assert all(digest(OUT / name) == sha for name, sha in expected.items()), 'Audio changed during visual fix'
        log('Audio WAV SHA256 unchanged after both video re-encodes.')
    (OUT / 'pinyin_checks.json').write_text(json.dumps(pinyin_records, ensure_ascii=False, indent=2))
    log(f'Fix evidence {"encoded A/B" if encoded else "preview"}: {len(comparisons)} English lines pixel-identical; {len(pinyin_rows)} native pinyin crops, NFC without combining marks.')


if __name__ == '__main__':
    main()
