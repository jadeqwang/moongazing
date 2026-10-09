"""Sequential six-thread final encodes and ffmpeg loudness measurements."""
import json
import argparse
import pathlib
import re
import subprocess
from lyrics import ROOT,OUT,log
from recording import MASTER, DURATION, RECORDING

def main():
    ffmpeg=str(ROOT/'.venv/bin/ffmpeg')
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--recording', choices=['2down','original'], default=RECORDING)
    parser.add_argument('--kind', choices=['A','B'], help='Encode only one variant.')
    args=parser.parse_args()
    loudness=json.loads((OUT/'loudness_checks.json').read_text()) if (OUT/'loudness_checks.json').exists() else {}
    for kind,audio,ass,out in [
        ('A',MASTER,OUT/'lyrics.ass',OUT/'Moongazing_lyric_video.mp4'),
        ('B',OUT/'Moongazing_karaoke_audio.wav',OUT/'karaoke.ass',OUT/'Moongazing_lyric_video_karaoke.mp4')]:
        if args.kind and kind!=args.kind: continue
        log(f'Encoding {kind}: H264 high CRF16 slow 1080p24, bt709, AAC-LC 320k, 6 threads, nice10.')
        cmd=['nice','-n','10',ffmpeg,'-y','-hide_banner','-threads','6','-filter_threads','6',
             '-loop','1','-framerate','24','-i',str(OUT/'bg_1080.png'),'-i',str(audio),
             '-vf',f'ass={ass}:fontsdir={OUT/"fonts"},scale=out_color_matrix=bt709,format=yuv420p',
             '-t',str(DURATION),'-r','24','-c:v','libx264','-profile:v','high','-crf','16','-preset','slow',
             '-threads','6','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',
             '-c:a','aac','-profile:a','aac_low','-b:a','320k','-ar','48000','-ac','2','-movflags','+faststart',str(out)]
        with (OUT/f'encode_{kind}.log').open('w') as f: subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,check=True)
        measured=subprocess.run(['nice','-n','10',ffmpeg,'-hide_banner','-threads','6','-filter_threads','6','-i',str(audio),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True).stderr
        (OUT/f'loudness_{kind}.log').write_text(measured)
        summary=measured.rsplit('Summary:',1)[-1].strip()
        loudness[kind]=summary
        log(f'Loudness {kind}: '+summary.replace('\n',' '))
        log(f'Encoding {kind} complete: {out.name}, {out.stat().st_size} bytes.')
    (OUT/'loudness_checks.json').write_text(json.dumps(loudness,indent=2))

if __name__=='__main__': main()
