"""Fast native-resolution subtitle reviews on the static plate."""
import json
import math
import pathlib
import subprocess
from PIL import Image,ImageDraw,ImageFont
from lyrics import ROOT,OUT,log

def main():
    rows=json.loads((OUT/'lyric_manifest.json').read_text())
    times=[('title',2),('humming',20),('count-in',30.75)]+[(l['id'],(l['start']+l['end'])/2) for l in rows]+[('credits',209),('karaoke title',2)]
    folder=OUT/'review'; folder.mkdir(exist_ok=True)
    tiles=[]
    for i,(name,t) in enumerate(times):
        ass=OUT/('karaoke.ass' if name=='karaoke title' else 'lyrics.ass')
        out=folder/f'{i:02d}_{name.replace(" ","_")}.png'
        cmd=['nice','-n','10',str(ROOT/'.venv/bin/ffmpeg'),'-y','-v','verbose','-threads','6','-filter_threads','6','-i',str(OUT/'bg_1080.png'),'-vf',f'setpts=PTS+{t}/TB,ass={ass}:fontsdir={OUT/"fonts"}', '-frames:v','1','-threads','6',str(out)]
        with (folder/f'{i:02d}.log').open('w') as f: subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,check=True)
        tile=Image.new('RGB',(640,386),'#0d1220'); tile.paste(Image.open(out).resize((640,360)),(0,0))
        ImageDraw.Draw(tile).text((8,363),f'{name}  {t:.3f}s',font=ImageFont.truetype(str(OUT/'fonts/mono.ttf'),16),fill='#d8b36a'); tiles.append(tile)
    cols=3; sheet=Image.new('RGB',(cols*640,math.ceil(len(tiles)/cols)*386),'#0d1220')
    for i,tile in enumerate(tiles): sheet.paste(tile,((i%cols)*640,(i//cols)*386))
    sheet.save(OUT/'preview_sheet.jpg',quality=94)
    selections=[]
    for p in folder.glob('*.log'):
        for line in p.read_text().splitlines():
            if 'fontselect' in line and line not in selections: selections.append(line)
    (OUT/'font_selection.log').write_text('\n'.join(selections)+'\n')
    assert not any('failed to find' in p.read_text() or 'Glyph ' in p.read_text() for p in folder.glob('*.log')),'Font fallback found'
    log('Preview sheet and full-resolution review frames made; libass font selections captured.')

if __name__=='__main__': main()
