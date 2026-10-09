"""Verify deliverable streams, sample identity, and actual encoded gold onset frames."""
import json
import math
import pathlib
import subprocess
import sys
import numpy as np
import soundfile as sf
from PIL import Image,ImageDraw,ImageFont
from lyrics import ROOT,OUT,log
from recording import DURATION, BEATGRID, MASTER, TIMING, RECORDING, OLD_OUT

def run(cmd):
    if pathlib.Path(cmd[0]).name=='ffmpeg' and '-filter_threads' not in cmd:
        cmd=[cmd[0],'-filter_threads','6',*cmd[1:]]
    return subprocess.run(['nice','-n','10',*map(str,cmd)],capture_output=True,text=True,check=True)

def gold_mask(rgb):
    rgb=rgb.astype(np.int16); r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
    return (r>100)&(r-g>12)&(g-b>25)&(b<170)


def verify_audio():
    """Independently check sample preservation, protected vocals and lead removal."""
    from fix_checks import digest
    master, sr = sf.read(MASTER, dtype='int32', always_2d=True)
    karaoke, kr = sf.read(OUT/'Moongazing_karaoke_audio.wav', dtype='int32', always_2d=True)
    alternate, ar = sf.read(OUT/'Moongazing_karaoke_audio_nohumming.wav', dtype='int32', always_2d=True)
    assert sr == kr == ar == 48000
    assert master.shape == karaoke.shape == alternate.shape == (round(DURATION*sr), 2)
    report = json.loads((OUT/'audio_checks.json').read_text())
    modified = np.zeros(len(master), dtype=bool)
    for region in report['regions']:
        modified[round(region['splice_start']*sr):round(region['splice_end']*sr)] = True
    assert np.array_equal(master[~modified], karaoke[~modified])
    timeline = json.loads(TIMING.read_text())
    protected = [(r['start'], r['end'], r['type']) for r in timeline['vocalise_and_humming']
                 if not any(s in r['type'].lower() for s in ['ad-lib', 'falsetto'])]
    if RECORDING == '2down':
        protected += [(160., 171.2, 'Requested wordless lead'),
                      (176., 192., 'Requested voice-like lead')]
    for a, b, label in protected:
        assert np.array_equal(master[round(a*sr):round(b*sr)],
                              karaoke[round(a*sr):round(b*sr)]), label
    for line in timeline['lines']:
        a, b = round(line['start']*sr), round(line['end']*sr)
        assert np.array_equal(karaoke[a:b], alternate[a:b]), line['id']
    for name in ['Moongazing_karaoke_audio.wav', 'Moongazing_karaoke_audio_nohumming.wav']:
        assert sf.info(OUT/name).subtype == 'PCM_24'
    assert report['native_reconstruction_residual_dbfs'] < -100
    assert report['raw_model_reconstruction_residual_relative_db'] < -50
    assert max(report['karaoke_peak'], report['no_humming_peak']) < 1
    assert report['max_splice_jump_ratio'] < 2
    alternate_splices=[]
    if RECORDING=='2down':
        from audio import read
        from recording import ALL_VOCALS
        original_float=read(MASTER)
        alternate_float=read(OUT/'Moongazing_karaoke_audio_nohumming.wav')
        sources={'BS-RoFormer':read(ALL_VOCALS,len(master)),
                 'htdemucs_ft':read(ROOT/'analysis/work/v2/demucs/htdemucs_ft/new_mix/vocals.wav',len(master))}
        for r in report['nohumming_wordless_regions']:
            a,b=round(r['start']*sr),round(r['end']*sr)
            expected_float=original_float[a:b]-sources[r['source']][a:b]
            assert np.max(np.abs(expected_float-alternate_float[a:b])) < 1.21e-7
            assert r['removed_component_dbfs'] < -10 and r['removed_component_dbfs'] > -45
            for t in [round(r[k]*sr) for k in ['splice_start','start','end','splice_end']]:
                local=np.max(np.abs(np.diff(alternate_float[t-1:t+2],axis=0)))
                neighbourhood=np.max(np.abs(np.diff(alternate_float[max(0,t-2400):t+2400],axis=0)),axis=1)
                ratio=float(local/max(np.quantile(neighbourhood,.99),1e-12))
                alternate_splices.append(dict(time=t/sr,ratio=ratio))
        assert max(r['ratio'] for r in alternate_splices)<2
    expected = json.loads((OUT/'fix_audio_hashes.json').read_text())
    assert all(digest(OUT/name) == sha for name, sha in expected.items())
    if RECORDING == '2down':
        snapshot=json.loads((OUT/'original_output_snapshot.json').read_text())
        current={str(p.relative_to(OLD_OUT)):p for p in OLD_OUT.rglob('*') if p.is_file()}
        assert set(current)==set(snapshot), 'Original output folder contents changed'
        for name, expected_file in snapshot.items():
            p=current[name]
            assert (p.stat().st_size,p.stat().st_mtime_ns)==(expected_file['bytes'],expected_file['mtime_ns']), name
            if 'sha256' in expected_file:
                assert digest(p)==expected_file['sha256'], name
    (OUT/'independent_audio_checks.json').write_text(json.dumps(dict(
        duration=DURATION, unchanged_outside_splices=True,
        protected_wordless_regions=protected, lyric_samples_equal_nohumming=True,
        wav_hashes_unchanged=True, reconstruction_pass=True,
        nohumming_wordless_subtraction_pass=True, nohumming_splices=alternate_splices,
        original_output_untouched=RECORDING=='2down'), indent=2))
    log('Independent audio verification passed: exact wordless preservation, lyric lead removal, WAV format, reconstruction and hashes.')

def main():
    preflight='--preflight' in sys.argv
    if not preflight:
        verify_audio()
        if '--audio-only' in sys.argv:
            return
    ffmpeg=ROOT/'.venv/bin/ffmpeg'; ffprobe=OUT/'ffprobe'
    probes={}; decodes={}
    for name in ([] if preflight else ['Moongazing_lyric_video.mp4','Moongazing_lyric_video_karaoke.mp4']):
        data=json.loads(run([ffprobe,'-v','error','-show_streams','-show_format','-of','json',OUT/name]).stdout)
        (OUT/(name+'.ffprobe.json')).write_text(json.dumps(data,indent=2))
        video=next(s for s in data['streams'] if s['codec_type']=='video'); audio=next(s for s in data['streams'] if s['codec_type']=='audio')
        expected_frames=math.ceil(DURATION*24-1e-8)
        assert abs(float(video['duration'])-expected_frames/24)<.001
        assert abs(float(data['format']['duration'])-DURATION)<=1/24+.001
        assert abs(float(audio['duration'])-DURATION)<.001
        assert video['codec_name']=='h264' and video['profile']=='High' and video['pix_fmt']=='yuv420p'
        assert (video['width'],video['height'],video['r_frame_rate'],int(video['nb_frames']))==(1920,1080,'24/1',expected_frames)
        assert all(video[k]=='bt709' for k in ['color_space','color_transfer','color_primaries'])
        assert (audio['codec_name'],audio['profile'],audio['sample_rate'],audio['channels'])==('aac','LC','48000',2)
        atoms={}
        with (OUT/name).open('rb') as f:
            while f.tell()<(OUT/name).stat().st_size:
                offset=f.tell(); header=f.read(8)
                size=int.from_bytes(header[:4],'big'); kind=header[4:].decode('ascii')
                if size==1: size=int.from_bytes(f.read(8),'big')
                if size==0: size=(OUT/name).stat().st_size-offset
                atoms[kind]=offset; f.seek(offset+size)
        assert atoms['moov']<atoms['mdat'],'faststart missing'
        probes[name]=dict(duration=data['format']['duration'],video_profile=video['profile'],frames=video['nb_frames'],audio_bitrate=audio['bit_rate'],faststart=True)
        log('ffprobe pass '+name+' '+json.dumps(probes[name]))
        decoded=run([ffmpeg,'-v','error','-xerror','-threads','4','-i',OUT/name,'-f','null','-'])
        assert not decoded.stderr, decoded.stderr
        decodes[name]={'full_audio_video_decode_pass':True}
    if not preflight:
        (OUT/'decode_checks.json').write_text(json.dumps(decodes,indent=2))
    lines=json.loads((OUT/'lyric_manifest.json').read_text())
    folder=OUT/('preflight' if preflight else 'verification'); folder.mkdir(exist_ok=True)
    beats=[b['t'] for b in json.loads(BEATGRID.read_text())['beats'] if b['t']<lines[0]['start']]
    samples=[('title',2),('humming',20),('count-in',beats[-2])]+[(l['id'],(l['start']+l['end'])/2) for l in lines]+[('credits',DURATION-6)]
    times=[(kind,name,t) for kind in ['A','B'] for name,t in samples]
    if preflight: times=[]
    tiles=[]
    for i,(kind,name,t) in enumerate(times):
        video=OUT/('Moongazing_lyric_video_karaoke.mp4' if kind=='B' else 'Moongazing_lyric_video.mp4')
        p=folder/f'{i:02d}_{kind}_{name.replace(" ","_")}.jpg'
        run([ffmpeg,'-y','-v','error','-threads','6','-ss',f'{t:.6f}','-i',video,'-frames:v','1','-q:v','2','-threads','6',p])
        tile=Image.new('RGB',(640,386),'#0d1220'); tile.paste(Image.open(p).resize((640,360)),(0,0))
        ImageDraw.Draw(tile).text((8,363),f'{kind} {name}  {t:.3f}s',font=ImageFont.truetype(str(OUT/'fonts/mono.ttf'),16),fill='#d8b36a'); tiles.append(tile)
    sheet=Image.new('RGB',(1920,math.ceil(len(tiles)/3)*386),'#0d1220')
    for i,tile in enumerate(tiles): sheet.paste(tile,((i%3)*640,(i//3)*386))
    if tiles: sheet.save(OUT/'sheet.jpg',quality=94)
    onset_results=[]
    for lid in ['L01','L10','L14b']:
        chosen=[l for l in lines if l['id']==lid]
        start=chosen[0]['start']; end=chosen[-1]['end']; first=math.floor((start-.12)*24); last=math.ceil((end+.1)*24)
        target=folder/lid; target.mkdir(exist_ok=True)
        if preflight:
            run([ffmpeg,'-y','-v','error','-threads','6','-filter_threads','6','-loop','1','-framerate','24','-i',OUT/'bg_1080.png','-vf',f'setpts=PTS+{first/24}/TB,ass={OUT/"lyrics.ass"}:fontsdir={OUT/"fonts"},scale=out_color_matrix=bt709,format=yuv420p,setpts=PTS-STARTPTS','-frames:v',last-first,'-r','24','-c:v','libx264','-profile:v','high','-crf','16','-preset','slow','-threads','6',target/'sample.mp4'])
            run([ffmpeg,'-y','-v','error','-threads','6','-i',target/'sample.mp4','-frames:v',last-first,'-fps_mode','passthrough','-start_number',first,'-q:v','2','-threads','6',target/'f_%06d.jpg'])
        else:
            run([ffmpeg,'-y','-v','error','-threads','6','-ss',f'{first/24:.9f}','-i',OUT/'Moongazing_lyric_video.mp4','-frames:v',last-first,'-fps_mode','passthrough','-start_number',first,'-q:v','2','-threads','6',target/'f_%06d.jpg'])
        pictures=[(int(p.stem[2:]),np.asarray(Image.open(p))) for p in sorted(target.glob('f_*.jpg'))]
        assert len(pictures)==last-first
        for line in chosen:
            li=lines.index(line); prev=lines[li-1] if li else None
            close_prev=prev and line['start']-prev['end']<2.5
            rise=max(line['appear'],prev['end'] if close_prev else line['appear'])
            rise_end=min(line['start']+.15,rise+.35)
            def y_at(t):
                if close_prev and t<rise_end: return line['initial_y']+(line['main_y']-line['initial_y'])*max(0,min(1,(t-rise)/max(.001,rise_end-rise)))
                return line['main_y']
            for token in line['tokens']:
                if not token['fill']: continue
                # Search only near that word's onset. Crop its moving sung glyphs;
                # avoid the old line above, dim previews and pinyin above.
                found=None; counts=[]
                for index,rgb in pictures:
                    t=index/24
                    if t<token['start']-.1 or t>token['start']+.30: continue
                    y=round(y_at(t)); x=math.floor(token['x'])
                    roi=rgb[max(0,y+8):min(1080,y+111),x:math.ceil(token['x']+token['width'])+2]
                    count=int(gold_mask(roi).sum()); counts.append([index,count])
                    if count>=2 and found is None: found=index
                delay=None if found is None else found/24-token['start']
                onset_results.append(dict(line=lid,word=token['text'],timing=token['start'],first_gold_frame=found,first_gold_time=None if found is None else found/24,error_seconds=delay,pixel_counts=counts))
    (OUT/('preflight_fill_checks.json' if preflight else 'fill_checks.json')).write_text(json.dumps(onset_results,ensure_ascii=False,indent=2))
    for row in onset_results: log('Encoded fill onset '+json.dumps({k:v for k,v in row.items() if k!='pixel_counts'},ensure_ascii=False))
    failures=[r for r in onset_results if r['error_seconds'] is None or abs(r['error_seconds'])>1/24+1e-6]
    if not preflight: (OUT/'video_checks.json').write_text(json.dumps(dict(probes=probes,fill_checks_pass=not failures),indent=2))
    assert not failures,'Fill onsets exceed one frame: '+json.dumps(failures,ensure_ascii=False)
    log('Preflight karaoke sweep check passed.' if preflight else 'All deliverable stream and encoded karaoke onset checks passed; final contact sheet ready for visual review.')

if __name__=='__main__': main()
