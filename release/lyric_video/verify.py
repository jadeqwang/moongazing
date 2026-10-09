"""Verify deliverable streams, sample identity, and actual encoded gold onset frames."""
import json
import math
import pathlib
import subprocess
import sys
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from lyrics import ROOT,OUT,log

def run(cmd):
    if pathlib.Path(cmd[0]).name=='ffmpeg' and '-filter_threads' not in cmd:
        cmd=[cmd[0],'-filter_threads','6',*cmd[1:]]
    return subprocess.run(['nice','-n','10',*map(str,cmd)],capture_output=True,text=True,check=True)

def gold_mask(rgb):
    rgb=rgb.astype(np.int16); r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
    return (r>100)&(r-g>12)&(g-b>25)&(b<170)

def main():
    preflight='--preflight' in sys.argv
    ffmpeg=ROOT/'.venv/bin/ffmpeg'; ffprobe=OUT/'ffprobe'
    probes={}
    for name in ([] if preflight else ['Moongazing_lyric_video.mp4','Moongazing_lyric_video_karaoke.mp4']):
        data=json.loads(run([ffprobe,'-v','error','-show_streams','-show_format','-of','json',OUT/name]).stdout)
        (OUT/(name+'.ffprobe.json')).write_text(json.dumps(data,indent=2))
        video=next(s for s in data['streams'] if s['codec_type']=='video'); audio=next(s for s in data['streams'] if s['codec_type']=='audio')
        assert float(data['format']['duration'])==216 and float(video['duration'])==216 and float(audio['duration'])==216
        assert video['codec_name']=='h264' and video['profile']=='High' and video['pix_fmt']=='yuv420p'
        assert (video['width'],video['height'],video['r_frame_rate'],int(video['nb_frames']))==(1920,1080,'24/1',5184)
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
    lines=json.loads((OUT/'lyric_manifest.json').read_text())
    folder=OUT/('preflight' if preflight else 'verification'); folder.mkdir(exist_ok=True)
    samples=[('title',2),('humming',20),('count-in',30.75)]+[(l['id'],(l['start']+l['end'])/2) for l in lines]+[('credits',209)]
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
