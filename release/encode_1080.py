"""CPU-only, re-runnable encode from a complete, dimension-checked frame set."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = ROOT / '.venv/bin/ffmpeg'
MASTER = ROOT / 'media/audio/moongazing_2down_master.wav'
FRAME_COUNT = 5165
FPS = 24
SAMPLES = FRAME_COUNT * 2000  # 48 kHz / 24 fps, exact picture length.
DURATION = FRAME_COUNT / FPS


def check_frames(folder, size):
    expected = {f'f_{i:06d}.jpg' for i in range(FRAME_COUNT)}
    actual = {p.name for p in folder.glob('f_*.jpg')}
    if actual != expected:
        missing, extra = sorted(expected-actual), sorted(actual-expected)
        raise ValueError(f'Need exactly frames 0..5164: missing={len(missing)} '
                         f'{missing[:5]}; extra={len(extra)} {extra[:5]}')
    for name in sorted(expected):
        with Image.open(folder/name) as im:
            if im.format != 'JPEG' or im.size != size:
                raise ValueError(f'{name}: expected JPEG {size[0]}x{size[1]}, '
                                 f'found {im.format} {im.size}')
    return FRAME_COUNT


def run(command, logfile):
    print(f'Running {logfile.name}', flush=True)
    with logfile.open('w') as f:
        subprocess.run(command, stdout=f, stderr=subprocess.STDOUT, check=True)


def clear_subtitle_defaults(path):
    """Clear subtitle track_enabled flags, which MP4 muxing otherwise infers.

    FFmpeg 7's MP4 muxer enables the first subtitle even with -disposition 0.
    Change only three tkhd flag bytes per subtitle; AV packets and faststart
    offsets remain byte-for-byte intact. Disabled subtitle tracks stay selectable.
    """
    with path.open('r+b') as f:
        def boxes(start,end):
            position=start
            while position<end:
                f.seek(position);header=f.read(8)
                if len(header)!=8: raise ValueError('Truncated MP4 atom')
                size=int.from_bytes(header[:4],'big');kind=header[4:];head=8
                if size==1: size=int.from_bytes(f.read(8),'big');head=16
                if size==0: size=end-position
                if size<head or position+size>end: raise ValueError('Invalid MP4 atom size')
                yield kind,position+head,position+size
                position+=size
        moov=next((a,b) for k,a,b in boxes(0,path.stat().st_size) if k==b'moov')
        subtitle_count=0
        for kind,a,b in boxes(*moov):
            if kind!=b'trak': continue
            children=list(boxes(a,b));tkhd=next((c,d) for k,c,d in children if k==b'tkhd')
            mdia=next((c,d) for k,c,d in children if k==b'mdia')
            hdlr=next((c,d) for k,c,d in boxes(*mdia) if k==b'hdlr')
            f.seek(hdlr[0]+8);handler=f.read(4)
            if handler not in [b'sbtl',b'subt',b'text']: continue
            f.seek(tkhd[0]+1);flags=int.from_bytes(f.read(3),'big')
            f.seek(tkhd[0]+1);f.write((flags & ~1).to_bytes(3,'big'))
            subtitle_count+=1
        if subtitle_count!=2: raise ValueError(f'Expected two subtitle tracks, found {subtitle_count}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('frames', nargs='?', default='render/out/frames_v8_1080')
    parser.add_argument('output', nargs='?', default='render/out/release_1080')
    parser.add_argument('--expect-size', default='1920x1080',
                        help='Explicit dimension override for the 960x540 smoke test.')
    args = parser.parse_args()
    width, height = map(int, args.expect_size.lower().split('x'))
    if width <= 0 or height <= 0 or width % 2 or height % 2:
        parser.error('--expect-size must contain positive even dimensions')
    frames, output = Path(args.frames), Path(args.output)
    if not frames.is_absolute(): frames = ROOT/frames
    if not output.is_absolute(): output = ROOT/output
    check_frames(frames, (width, height))  # Refuse before writing any output.
    for source in [MASTER, ROOT/'release/subs/moongazing.zh-en.srt',
                   ROOT/'release/subs/moongazing.en.srt']:
        if not source.is_file(): raise FileNotFoundError(source)
    output.mkdir(parents=True, exist_ok=True)
    tmp = ROOT/'render/out/tmp'
    tmp.mkdir(parents=True, exist_ok=True)
    os.environ['TMPDIR'] = str(tmp)
    base = [str(FFMPEG), '-y', '-hide_banner', '-nostdin', '-threads', '6',
            '-filter_threads', '6', '-framerate', str(FPS), '-start_number', '0',
            '-i', str(frames/'f_%06d.jpg')]
    picture = ['-map', '0:v:0', '-frames:v', str(FRAME_COUNT), '-r', str(FPS),
               '-fps_mode', 'cfr', '-vf',
               'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv420p,setsar=1',
               '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high',
               '-threads', '6', '-pix_fmt', 'yuv420p', '-g', '48',
               '-keyint_min', '24', '-sc_threshold', '0', '-flags', '+cgop',
               '-x264-params', 'open-gop=0', '-color_primaries', 'bt709',
               '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv']
    pad = f'apad=whole_len={SAMPLES},atrim=end_sample={SAMPLES},asetpts=PTS-STARTPTS'
    audio = ['-map', '1:a:0', '-af', pad, '-ar', '48000', '-ac', '2',
             '-t', f'{DURATION:.12f}']
    upload = output/'Moongazing_1080p.mp4'
    master = output/'Moongazing_1080p_master.mkv'
    subtitles = output/'Moongazing_1080p_subs.mp4'
    # Stage all files before replacing prior deliverables. Pass logs stay on disk,
    # never in the nearly full /tmp tmpfs. Successful reruns clean their stage.
    with tempfile.TemporaryDirectory(prefix='encode_1080-', dir=tmp) as workdir:
        work = Path(workdir)
        bitrate = ['-b:v', '16M', '-maxrate', '20M', '-bufsize', '32M']
        passlog = ['-passlogfile', str(work/'upload_pass')]
        run(base+picture+bitrate+['-pass', '1']+passlog+
            ['-an', '-f', 'null', os.devnull], output/'encode_upload_pass1.log')
        run(base+['-i', str(MASTER)]+picture+bitrate+['-pass', '2']+passlog+
            audio+['-c:a', 'aac', '-profile:a', 'aac_low', '-b:a', '320k',
                   '-cutoff', '24000',
                   '-movflags', '+faststart', str(work/upload.name)],
            output/'encode_upload_pass2.log')
        run(base+['-i', str(MASTER)]+picture+['-crf', '12']+audio+
            ['-c:a', 'pcm_s24le', str(work/master.name)], output/'encode_master.log')
        run([str(FFMPEG), '-y', '-hide_banner', '-nostdin',
             '-i', str(work/upload.name),
             '-i', str(ROOT/'release/subs/moongazing.zh-en.srt'),
             '-i', str(ROOT/'release/subs/moongazing.en.srt'),
             '-map', '0:v:0', '-map', '0:a:0', '-map', '1:0', '-map', '2:0',
             '-c:v', 'copy', '-c:a', 'copy', '-c:s', 'mov_text',
             '-metadata:s:s:0', 'language=zho', '-metadata:s:s:0', 'title=Chinese / English',
             '-metadata:s:s:0', 'handler_name=Chinese / English',
             '-metadata:s:s:1', 'language=eng', '-metadata:s:s:1', 'title=English',
             '-metadata:s:s:1', 'handler_name=English',
             '-disposition:s:0', '0', '-disposition:s:1', '0',
             '-movflags', '+faststart', str(work/subtitles.name)], output/'mux_subtitles.log')
        clear_subtitle_defaults(work/subtitles.name)
        for destination in [upload, master, subtitles]:
            os.replace(work/destination.name, destination)
            print(f'{destination}: {destination.stat().st_size:,} bytes', flush=True)
    (output/'ENCODE.json').write_text(json.dumps(dict(
        frames=str(frames.relative_to(ROOT)) if frames.is_relative_to(ROOT) else str(frames),
        count=FRAME_COUNT, size=[width,height], fps=FPS, picture_seconds=DURATION,
        master_audio=str(MASTER.relative_to(ROOT)), audio_samples=SAMPLES,
        tmpdir=str(tmp.relative_to(ROOT)), upload_two_pass=True, upload_bitrate=16000000,
        closed_gop=48, master_crf=12, master_audio_codec='pcm_s24le',
        aac_cutoff_hz=24000,subtitles_default_off=True,
        color_conversion='BT601 full-range JPEG to BT709 limited; accurate_rnd+full_chroma_int'), indent=2))


if __name__ == '__main__':
    main()
