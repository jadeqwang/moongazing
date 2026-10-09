"""Check the three exports using ffmpeg (not ffprobe) and write REPORT.md."""
import argparse
import json
import math
import os
from pathlib import Path
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import soundfile as sf

from encode_1080 import ROOT, FFMPEG, MASTER, FRAME_COUNT, FPS, SAMPLES, DURATION

NAMES = ['Moongazing_1080p.mp4', 'Moongazing_1080p_master.mkv', 'Moongazing_1080p_subs.mp4']
SAMPLE_FRAMES = [0,60,500,1000,1900,2300,3000,3500,4200,4760,4900,5164]


def run(args, logfile=None, check=True):
    p = subprocess.run([str(FFMPEG), '-nostdin', '-hide_banner', *map(str,args)],
                       capture_output=True, text=True)
    if logfile: logfile.write_text(p.stderr+p.stdout)
    if check and p.returncode:
        raise RuntimeError(f'ffmpeg failed ({p.returncode}): {p.stderr[-2000:]}')
    return p


def loudness(path, logfile):
    text=run(['-threads','4','-i',path,'-map','0:a:0','-af','ebur128=peak=true',
              '-vn','-sn','-f','null','-'],logfile).stderr.rsplit('Summary:',1)[-1]
    integrated=float(re.search(r'\bI:\s*([-\d.]+) LUFS',text)[1])
    peak=float(re.search(r'\bPeak:\s*([-\d.]+) dBFS',text)[1])
    return dict(integrated_lufs=integrated,true_peak_dbfs=peak)


def extract_frames(video, indices, folder):
    folder.mkdir(parents=True,exist_ok=True)
    selection='+'.join(f'eq(n\\,{n})' for n in indices)
    run(['-y','-v','error','-threads','4','-filter_threads','4','-i',video,
         '-map','0:v:0','-an','-sn','-vf',f'select={selection},scale=flags=accurate_rnd+full_chroma_int,format=rgb24',
         '-fps_mode','passthrough','-frames:v',len(indices),'-pix_fmt','rgb24',
         '-threads','4',folder/'f_%02d.png'])
    return [folder/f'f_{i+1:02d}.png' for i in range(len(indices))]


def stream_hash(path, stream):
    text=run(['-v','error','-i',path,'-map',f'0:{stream}:0','-c','copy',
              '-f','hash','-hash','sha256','-']).stdout
    return text.strip().split('=')[-1]


def write_report(output, result):
    rows=['# Moongazing 1080p verification', '',
          f"Result: **{'PASS' if result.get('pass') else 'FAILED'}**.", '',
          f"Picture: {FRAME_COUNT:,} frames / {FPS} fps = {DURATION:.9f} s. "
          'The nominal 215.19 s cut ends on that last complete video frame. '
          'The 210.860 s master audio is padded with silence to the picture, without shortening it.', '',
          'Temporary files and pass logs use `render/out/tmp`, not the `/tmp` tmpfs.', '']
    if result.get('error'): rows += ['Failure: '+result['error'], '']
    gate=output/'render_gate.txt'
    if gate.exists(): rows += ['## Render gate', '', '```text',gate.read_text().strip(),'```','']
    for name,facts in result.get('files',{}).items():
        rows += ['## '+name, '', f"Size: {facts['bytes']:,} bytes ({facts['bytes']/1e6:.2f} MB).", '',
                 'Container facts from `ffmpeg -i`:', '', '```text',facts['container'],'```','']
        if 'encoder_video_kbps' in facts:
            rows += [f"Average video bitrate from ffmpeg's x264 summary: {facts['encoder_video_kbps']:.2f} kb/s. "
                     'The Matroska header does not expose a separate video bitrate.' if name.endswith('.mkv') else
                     f"Average video bitrate from ffmpeg's x264 summary: {facts['encoder_video_kbps']:.2f} kb/s.",'']
        if 'decoded_frames' in facts:
            rows += [f"Full audio/video decode with `-xerror`: {facts['decoded_frames']:,} video frames, zero errors.", '']
        if 'start' in facts:
            rows += [f"First decoded presentation timestamps, with `-copyts`: video {facts['start']['video']:.9f} s; audio {facts['start']['audio']:.9f} s. "
                     + ('PCM is lossless and has no encoder priming.' if name.endswith('.mkv') else
                        'AAC priming is trimmed by the MP4 edit/skip metadata; no audible delay is added.'), '']
        if 'loudness' in facts:
            l=facts['loudness']; rows += [f"Audio: {l['integrated_lufs']:.1f} LUFS, {l['true_peak_dbfs']:.1f} dBTP. "
                f"Difference from the WAV: {l['lufs_difference']:+.1f} LU, {l['peak_difference']:+.1f} dB. "
                f"Tolerance 0.2 LU / 0.3 dB: {'PASS' if l['pass'] else 'FAIL'}.",'']
    if 'reference_loudness' in result:
        l=result['reference_loudness'];rows+=['## Audio reference', '',
            f"Unmodified WAV: {l['integrated_lufs']:.1f} LUFS, {l['true_peak_dbfs']:.1f} dBTP.", '',
            f"Master PCM: {'sample-identical to the source WAV followed by exact silence' if result.get('lossless_master') else 'not verified'}. "
            f"Padded sample count: {SAMPLES:,} stereo sample frames.",'']
    if 'fidelity' in result:
        rows+=['## Picture fidelity against source JPEGs', '',
               'RGB pixels after accurate-rounding/full-chroma decoding; PSNR uses peak 255 and mean squared error across RGB. '
               'MAD is mean absolute RGB difference in 8-bit sample units. PNG evidence is retained under `fidelity/`.', '',
               '| Frame | Time (s) | Upload PSNR (dB) | Upload MAD | Master PSNR (dB) | Master MAD |',
               '|---:|---:|---:|---:|---:|---:|']
        for i,n in enumerate(SAMPLE_FRAMES):
            a=result['fidelity']['upload'][i];b=result['fidelity']['master'][i]
            fmt=lambda x:'∞' if x is None else f'{x:.3f}'
            rows += [f"| {n} | {n/FPS:.6f} | {fmt(a['psnr_db'])} | {a['mad']:.4f} | {fmt(b['psnr_db'])} | {b['mad']:.4f} |"]
        rows += ['']
    if result.get('stream_copy_pass'):
        rows += ['## Subtitle mux and GOP', '',
                 'Upload and subtitle-copy H.264/AAC packet SHA256 hashes match. Both mov_text subtitle tracks '
                 'are present (Chinese/English and English), with default disposition off. '
                 'The MP4 muxer otherwise enables the first subtitle even with `-disposition 0`; '
                 'the build clears only subtitle `tkhd.track_enabled` flags, preserving all AV packet bytes. '
                 'The encoder uses closed GOP (`open-gop=0`), keyint 48, scene-cut disabled. '
                 'Decoded upload keyframes are no more than 48 frames apart.', '']
    if 'contact_frames' in result:
        rows += ['## Contact sheet', '', '`contact.jpg`: 48 decoded upload frames, evenly spaced from frame 0 to frame 5164, with presentation-time labels.', '']
    rows += ['## Observations', '']
    observations=result.get('observations',[])
    rows += ['- '+x for x in observations] if observations else ['No additional anomaly found by the automated checks.']
    rows += ['']
    (output/'REPORT.md').write_text('\n'.join(rows))
    (output/'CHECKS.json').write_text(json.dumps(result,indent=2))


def check(output):
    config=json.loads((output/'ENCODE.json').read_text())
    frames=ROOT/config['frames']
    result={'pass':False,'files':{},'observations':[]}
    try:
        reference=loudness(MASTER,output/'loudness_wav.log')
        result['reference_loudness']=reference
        for name in NAMES:
            path=output/name
            inspected=run(['-i',path],output/(name+'.ffmpeg.log'),check=False).stderr
            facts=[line.strip() for line in inspected.splitlines()
                   if line.strip().startswith(('Duration:','Stream #'))]
            f=dict(bytes=path.stat().st_size,container='\n'.join(facts))
            result['files'][name]=f
            encoder_log=output/('encode_master.log' if name.endswith('.mkv') else 'encode_upload_pass2.log')
            rate=re.findall(r'\bkb/s:([\d.]+)',encoder_log.read_text())
            if rate:f['encoder_video_kbps']=float(rate[-1])
            assert 'Video: h264 (High)' in inspected and f'{config["size"][0]}x{config["size"][1]}' in inspected
            assert '24 fps' in inspected and 'bt709' in inspected and 'yuv420p' in inspected
            assert '48000 Hz, stereo' in inspected
            assert 'pcm_s24le' in inspected if name.endswith('.mkv') else 'Audio: aac (LC)' in inspected
            subtitles=[x for x in facts if 'Subtitle:' in x]
            if '_subs.' in name:
                assert len(subtitles)==2 and all('mov_text' in x and '(default)' not in x for x in subtitles)
            else: assert not subtitles
            progress=output/(name+'.decode.progress')
            p=run(['-v','error','-xerror','-threads','6','-i',path,
                   '-map','0:v:0','-map','0:a:0','-sn','-dn','-threads','6',
                   '-progress',progress,'-f','null','-'],output/(name+'.decode.log'))
            assert not p.stderr.strip(),p.stderr
            counts=re.findall(r'^frame=(\d+)$',progress.read_text(),re.M)
            assert counts and int(counts[-1])==FRAME_COUNT,counts[-1:]
            f['decoded_frames']=int(counts[-1])
            stamp=run(['-copyts','-threads','4','-i',path,'-map','0:v:0','-map','0:a:0',
                       '-vf','showinfo','-af','ashowinfo','-frames:v','1','-frames:a','1',
                       '-f','null','-'],output/(name+'.start.log')).stderr
            f['start']={}
            for key,filter_name in [('video','showinfo'),('audio','ashowinfo')]:
                m=re.search(r'\[Parsed_'+filter_name+r'[^\]]*\].*?\bn:\s*0\b.*?\bpts_time:([-\d.e+]+)',stamp)
                assert m,(key,stamp[-2000:])
                f['start'][key]=float(m[1]);assert abs(float(m[1]))<1/48000
            l=loudness(path,output/(name+'.loudness.log'))
            l.update(lufs_difference=l['integrated_lufs']-reference['integrated_lufs'],
                     peak_difference=l['true_peak_dbfs']-reference['true_peak_dbfs'])
            l['pass']=abs(l['lufs_difference'])<=.200001 and abs(l['peak_difference'])<=.300001
            f['loudness']=l
            print(name+': metadata, full decode and stream starts passed; loudness '+('PASS' if l['pass'] else 'FAIL'),flush=True)
        hashes={name:{s:stream_hash(output/name,s) for s in ['v','a']}
                for name in [NAMES[0],NAMES[2]]}
        assert hashes[NAMES[0]]==hashes[NAMES[2]],'Subtitle mux changed picture/audio packets'
        result['stream_hashes']=hashes;result['stream_copy_pass']=True
        keys=run(['-threads','4','-skip_frame','nokey','-i',output/NAMES[0],
                  '-map','0:v:0','-vf','showinfo','-an','-sn','-f','null','-'],
                 output/'keyframes.log').stderr
        times=[float(x) for x in re.findall(r'\bn:\s*\d+\s+pts:\s*\d+\s+pts_time:([-\d.e+]+)',keys)]
        indices=[round(t*FPS) for t in times]
        assert indices and indices[0]==0 and max(np.diff(indices))<=48
        result['keyframes']=indices
        tmp=ROOT/'render/out/tmp';tmp.mkdir(parents=True,exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='check_1080-',dir=tmp) as workdir:
            work=Path(workdir);raw=work/'master.s24le'
            run(['-y','-v','error','-i',output/NAMES[1],'-map','0:a:0','-c:a','pcm_s24le',
                 '-f','s24le',raw])
            with sf.SoundFile(MASTER) as original, sf.SoundFile(raw,format='RAW',subtype='PCM_24',
                    samplerate=48000,channels=2,endian='LITTLE') as decoded:
                assert len(decoded)==SAMPLES,(len(decoded),SAMPLES)
                while original.tell()<len(original):
                    a=original.read(65536,dtype='int32',always_2d=True)
                    b=decoded.read(len(a),dtype='int32',always_2d=True)
                    assert np.array_equal(a,b),'Master PCM differs from WAV'
                while decoded.tell()<len(decoded):
                    assert not decoded.read(65536,dtype='int32').any(),'Non-silent audio padding'
            result['lossless_master']=True
            fidelity={}
            for key,name in [('upload',NAMES[0]),('master',NAMES[1])]:
                images=extract_frames(output/name,SAMPLE_FRAMES,output/'fidelity'/key)
                fidelity[key]=[]
                for n,image in zip(SAMPLE_FRAMES,images):
                    src=np.asarray(Image.open(frames/f'f_{n:06d}.jpg').convert('RGB'),dtype=np.float32)
                    dst=np.asarray(Image.open(image).convert('RGB'),dtype=np.float32)
                    delta=src-dst;mse=float(np.mean(delta*delta,dtype=np.float64))
                    psnr=None if mse==0 else 10*math.log10(255**2/mse)
                    fidelity[key].append(dict(frame=n,psnr_db=psnr,mad=float(np.mean(abs(delta),dtype=np.float64))))
                if min(r['psnr_db'] if r['psnr_db'] is not None else math.inf for r in fidelity[key])<35:
                    result['observations'].append(f'{key}: a sampled RGB PSNR is below 35 dB; inspect fidelity PNGs.')
            result['fidelity']=fidelity
            contact_indices=[round(i*(FRAME_COUNT-1)/47) for i in range(48)]
            pictures=extract_frames(output/NAMES[0],contact_indices,work/'contact')
            sheet=Image.new('RGB',(6*480,8*296),'#101827')
            font=ImageFont.truetype(str(ROOT/'render/fonts/IBMPlexMono-Regular.ttf'),15)
            for i,(n,p) in enumerate(zip(contact_indices,pictures)):
                x,y=(i%6)*480,(i//6)*296
                sheet.paste(Image.open(p).resize((480,270)),(x,y))
                t=n/FPS
                ImageDraw.Draw(sheet).text((x+8,y+274),f'{int(t//60)}:{t%60:06.3f}  frame {n}',fill='#d8b36a',font=font)
            sheet.save(output/'contact.jpg',quality=95,subsampling=0)
            result['contact_frames']=contact_indices
        mismatches={name:f['loudness'] for name,f in result['files'].items() if not f['loudness']['pass']}
        assert not mismatches,'Loudness/true-peak mismatch: '+str(mismatches)
        result['pass']=True
        result['observations'].append('Final video length is 215.208333 s (5,165 complete frames), 18.333 ms beyond the nominal 215.19 s endpoint. Audio follows the complete picture length.')
        result['observations'].append('AAC uses a 24 kHz cutoff at 48 kHz sample rate. The default AAC bandwidth produced a 0.4 dB true-peak discrepancy in the smoke test; this setting meets the 0.3 dB tolerance without gain adjustment.')
        write_report(output,result)
        print('CHECK_1080_PASS',flush=True)
        return result
    except Exception as exc:
        result['error']=str(exc)
        write_report(output,result)
        raise


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output',nargs='?',default='render/out/release_1080')
    args=parser.parse_args()
    folder=Path(args.output)
    check(folder if folder.is_absolute() else ROOT/folder)
