"""Make deterministic ASS karaoke from Jade's literal LYRICS strings."""
import ast
import datetime
import json
import math
import pathlib
import re
import subprocess
import unicodedata
import numpy as np
from PIL import Image
from PIL import ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from pypinyin import pinyin, Style

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'render/out/lyric_video'
GOLD = '&H006AB3D8&'
PALE = '&H00D0E2E9&'

def log(s):
    with (OUT / 'job.log').open('a') as f:
        f.write(f'{datetime.datetime.now().isoformat()} {s}\n')

def prepare_fonts():
    folder = OUT / 'fonts'
    folder.mkdir(exist_ok=True)
    specs = [('en','CormorantGaramond-VF.ttf','Lyric Cormorant'),
             ('italic','CormorantGaramond-Italic-VF.ttf','Lyric Cormorant Italic'),
             ('zh','NotoSerifSC-VF.ttf','Lyric Noto SC'),
             ('mono','IBMPlexMono-Regular.ttf','Lyric Plex'),
             ('pinyin','NotoSerifDisplay-VF.ttf','Lyric Pinyin')]
    fonts = {}
    for key, filename, family in specs:
        target = folder / f'{key}.ttf'
        if target.exists():
            font=TTFont(target)
            fonts[key]=dict(path=str(target),family=family,cmap=set(font.getBestCmap()),ass_scale=(font['hhea'].ascent-font['hhea'].descent)/font['head'].unitsPerEm)
            continue
        font = TTFont(ROOT / 'render/fonts' / filename)
        if 'fvar' in font:
            axes = {a.axisTag:(400 if a.axisTag == 'wght' else a.defaultValue) for a in font['fvar'].axes}
            font = instantiateVariableFont(font,axes,inplace=True)
        # Unique family names make fallback and wrong-weight selection detectable.
        for n in font['name'].names:
            if n.nameID in [1,4,6,16]:
                value = family.replace(' ','') if n.nameID == 6 else family
                n.string = value.encode(n.getEncoding())
            elif n.nameID in [2,17]: n.string = 'Regular'.encode(n.getEncoding())
        font.save(target)
        fonts[key] = dict(path=str(target),family=family,cmap=set(font.getBestCmap()),ass_scale=(font['hhea'].ascent-font['hhea'].descent)/font['head'].unitsPerEm)
    tones = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
    assert all(ord(c) in fonts['en']['cmap'] for c in tones)
    assert all(ord(c) in fonts['pinyin']['cmap'] for c in tones)
    pinyin_font=TTFont(fonts['pinyin']['path'])
    (OUT/'pinyin_font_check.json').write_text(json.dumps(dict(
        font=fonts['pinyin']['path'], family=fonts['pinyin']['family'],
        preferred_font_cmap_pass=True, preferred_font_visual_pass=False,
        reason='Cormorant roman covers all tones, but its thin, high accents still appear displaced in native libass crops; Noto Serif Display roman passes visual centering',
        required=tones, missing=[], normalization='NFC',
        instantiated='fvar' not in pinyin_font,
        cmap_glyphs={c:pinyin_font.getBestCmap()[ord(c)] for c in tones}), ensure_ascii=False, indent=2))
    return fonts

def load_lines():
    timing=json.loads((ROOT/'analysis/lyrics_timing.json').read_text())
    lookup={l['id']:l for l in timing['lines']}
    tree=ast.parse((ROOT/'release/subs/make_subs.py').read_text())
    node=next(n.value for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='LYRICS' for t in n.targets))
    result=[]
    for call in node.elts:
        lid,zh,en=[ast.literal_eval(x) for x in call.args]
        original=lookup[lid]
        start,end=original['start'],original['end']
        for kw in call.keywords:
            if isinstance(kw.value,ast.BinOp):
                end=lookup[lid]['words'][ast.literal_eval(kw.value.left.args[1])]['start']
            elif kw.arg=='start': start=lookup[lid]['words'][ast.literal_eval(kw.value.args[1])]['start']
        words=[w for w in original['words'] if start-0.001<=w['start']<end-0.001]
        result.append(dict(id=lid,zh=zh,en=en,start=start,end=end,lang=original['lang'],words=words))
    return result,timing

def ts(t):
    cs=round(t*100); h,cs=divmod(cs,360000); m,cs=divmod(cs,6000); s,cs=divmod(cs,100)
    return f'{h}:{m:02d}:{s:02d}.{cs:02d}'

def esc(s): return s.replace('\n',r'\N')

class Ass:
    def __init__(self,fonts): self.events=[]; self.fonts=fonts
    def add(self,a,b,text,x,y,key='en',size=36,opacity=1,color=PALE,extra='',layer=0,align=7):
        if b<=a: return
        alpha=round((1-opacity)*255)
        # libass sizes by the ascent+descent. Compensate so the requested px match
        # the font's em size and the PIL measurements used for token placement.
        actual_size=size*self.fonts[key]['ass_scale']
        tags=rf'\an{align}\fn{self.fonts[key]["family"]}\fs{actual_size:.3f}\bord0\shad0\1c{color}\1a&H{alpha:02X}&'
        if '\\move' not in extra: tags+=rf'\pos({x:.2f},{y:.2f})'
        self.events.append(f'Dialogue: {layer},{ts(a)},{ts(b)},Default,,0,0,0,,{{{tags}{extra}}}{esc(text)}')
    def write(self,p):
        p.write_text('[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 2\nKerning: yes\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Lyric Cormorant,76,&H006AB3D8,&HFFD0E2E9,&HFF000000,&HFF000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'+'\n'.join(self.events)+'\n')

def render_mask(ass, name):
    folder=OUT/'spacing'; folder.mkdir(exist_ok=True)
    source=folder/(name+'.ass'); target=folder/(name+'.png'); ass.write(source)
    result=subprocess.run(['nice','-n','10',str(ROOT/'.venv/bin/ffmpeg'),
        '-y','-v','verbose','-threads','6','-filter_threads','6','-f','lavfi','-i',
        'color=black:s=1920x1080:r=24','-vf',f'ass={source}:fontsdir={OUT/"fonts"}:shaping=complex',
        '-frames:v','1','-threads','6',str(target)],capture_output=True,text=True,check=True)
    (folder/(name+'.log')).write_text(result.stderr)
    assert 'failed to find' not in result.stderr and 'Glyph ' not in result.stderr
    return np.asarray(Image.open(target))[:,:,0]

def english_layout(fonts, line, size):
    """Word ink boxes from one actual libass run; PIL only locates space gaps.

    Neither pale text nor gold overlays ever draw independently positioned words.
    The complete shaped string is reused at the same anchor by every clip.
    """
    sung=line['en']; assert sung==' '.join(sung.split()), 'Unexpected source spaces'
    plain=Ass(fonts); plain.add(0,2,sung,130,700,'en',size,color='&H00FFFFFF&')
    raster=render_mask(plain,line['id']+'_plain')
    occupied=(raster>0).any(axis=0)
    ink=np.flatnonzero(occupied)
    font=ImageFont.truetype(fonts['en']['path'],size)
    # Scale the natural full-run advance to the actual libass width, accounting
    # for libass's metric normalization, then snap every separator into its gap.
    mask,off=font.getmask2(sung); bbox=mask.getbbox()
    origin=off[0]+bbox[0]; pil_right=off[0]+bbox[2]-1
    scale=(ink[-1]-ink[0])/(pil_right-origin)
    matches=list(re.finditer(r'\S+',sung)); boundaries=[0]
    for left,right in zip(matches,matches[1:]):
        mid=(font.getlength(sung[:left.end()])+font.getlength(sung[:right.start()]))/2
        expected=ink[0]+(mid-origin)*scale
        candidates=np.flatnonzero(~occupied)
        boundary=int(candidates[np.argmin(abs(candidates-expected))])
        assert abs(boundary-expected)<12, (line['id'],'no space gap',expected)
        boundaries.append(boundary)
    boundaries.append(1920)
    tokens=[]; wi=0
    for j,m in enumerate(matches):
        cols=np.flatnonzero(occupied[boundaries[j]:boundaries[j+1]])+boundaries[j]
        assert len(cols), (line['id'],m.group())
        left,right=int(cols[0]),int(cols[-1])+1
        strong=(raster[:,left:right]>=220).sum(axis=0)
        onset=int(np.searchsorted(np.cumsum(strong),40))
        if m.group()=='—':
            w=dict(start=line['words'][wi-1]['end'],end=line['words'][wi-1]['end']+.02)
        else: w=line['words'][wi]; wi+=1
        tokens.append(dict(text=m.group(),x=left,width=right-left,
            start=w['start'],end=w['end'],fill=m.group()!='—',
            ink_left=left,ink_right=right,onset_edge=min(right-.1,max(left+8,left+onset+2))))
    test=Ass(fonts)
    for token in tokens:
        test.add(0,2,sung,130,700,'en',size,color='&H00FFFFFF&',
            extra=rf'\clip({token["ink_left"]},0,{token["ink_right"]},1080)')
    karaoke=render_mask(test,line['id']+'_karaoke')
    diff=np.abs(raster.astype(int)-karaoke.astype(int))
    assert not diff.any(), (line['id'],'single run differs from clipped full-run overlays',int(diff.max()))
    log(f'English spacing {line["id"]}: plain single ASS run == karaoke full-run clips pixel-for-pixel; position error 0 px.')
    return tokens

def main():
    fonts=prepare_fonts(); lines,timing=load_lines()
    manifest=[]
    layouts={}
    for l in lines:
        if l['lang']=='en':
            font=ImageFont.truetype(fonts['en']['path'],76)
            size=76 if font.getlength(l['en'])<=1130 else math.floor(76*1130/font.getlength(l['en']))
            layouts[l['id']]=english_layout(fonts,l,size)
    for karaoke in [False,True]:
        ass=Ass(fonts)
        ass.add(0,5.3,'望明月',615,365,'zh',94,extra=r'\fad(500,700)',align=8)
        ass.add(0,5.3,'MOONGAZING',615,494,'en',53,extra=r'\fsp5\fad(500,700)',align=8)
        ass.add(0,5.3,'Jade Wang',615,577,'en',34,opacity=.7,extra=r'\fad(500,700)',align=8)
        if karaoke: ass.add(0,5.3,'Karaoke · lead vocal removed',615,632,'en',28,opacity=.6,extra=r'\fad(500,700)',align=8)
        for i,l in enumerate(lines):
            prev=lines[i-1] if i else None; nxt=lines[i+1] if i+1<len(lines) else None
            appear=l['start']-.8; leave=l['end']+.5
            close_prev=prev is not None and l['start']-prev['end']<2.5
            close_next=nxt is not None and nxt['start']-l['end']<2.5
            # Closely spaced lines wait underneath, then rise while the old line lifts out.
            rise=max(appear,prev['end'] if close_prev else appear)
            rise_end=min(l['start']+.15,rise+.35)
            main_y=700; initial_y=910 if close_prev else main_y
            exit_start=l['end'] if close_next else leave
            exit_end=min(leave,exit_start+.35,nxt['start']+.15 if close_next else leave)
            def y_at(t):
                if close_prev and t<rise_end: return initial_y+(main_y-initial_y)*max(0,min(1,(t-rise)/max(.001,rise_end-rise)))
                if close_next and t>=exit_start: return main_y-250*min(1,(t-exit_start)/max(.001,exit_end-exit_start))
                return main_y
            cuts=sorted(set([appear,leave]+[t for t in [appear+.35,leave-.4,rise,rise_end,exit_start,exit_end] if appear<t<leave]))
            lang=l['lang']; key='en' if lang=='en' else 'zh'; size=76 if lang=='en' else 84
            sung=l[lang]; font=ImageFont.truetype(fonts[key]['path'],size)
            if lang=='en' and font.getlength(sung)>1130:
                size=math.floor(size*1130/font.getlength(sung))
                font=ImageFont.truetype(fonts[key]['path'],size)
            tokens=[]
            if lang=='en':
                tokens=layouts[l['id']]
            else:
                wi=0
                for j,ch in enumerate(sung):
                    if '\u4e00'<=ch<='\u9fff':
                        w=l['words'][wi]; wi+=1; py=unicodedata.normalize('NFC',pinyin(ch,style=Style.TONE)[0][0])
                        tokens.append(dict(text=ch,pinyin=py,x=130+j*96,width=84,start=w['start'],end=w['end'],fill=True))
                    else: tokens.append(dict(text=ch,x=130+j*96,width=84,start=l['end'],end=l['end'],fill=False))
            assert max(t['x']+t['width'] for t in tokens)<1270,(l['id'],'sung text too wide')
            for token in tokens:
                for ch in token['text']:
                    assert ord(ch) in fonts[key]['cmap'],(key,ch)
                for a,b in zip(cuts,cuts[1:]):
                    # Split movement events, preserving absolute sweep progress with a moving clip.
                    def motion(x,dy=0):
                        return rf'\move({x:.2f},{y_at(a)+dy:.2f},{x:.2f},{y_at(b)+dy:.2f})'
                    fade_a=min(1,max(0,(a-appear)/.35)); fade_b=min(1,max(0,(b-appear)/.35))
                    out_a=min(1,max(0,(leave-a)/.4)); out_b=min(1,max(0,(leave-b)/.4))
                    def alpha(op):
                        aa=round(255*(1-op*fade_a*out_a)); ab=round(255*(1-op*fade_b*out_b))
                        return rf'\1a&H{aa:02X}&\t(0,{round((b-a)*1000)},\1a&H{ab:02X}&)'
                    if lang=='zh':
                        ass.add(a,b,token['text'],token['x'],0,key,size,.45,extra=motion(token['x'])+alpha(.45))
                    elif token is tokens[0]:
                        ass.add(a,b,sung,130,0,key,size,.45,extra=motion(130)+alpha(.45))
                    def filled(text,px,dy,fkey,fsize):
                        if not token['fill']: return
                        # kf includes blank side bearings. Clip the actual ink bounds instead;
                        # Expose the first small stroke at onset, then sweep continuously.
                        # Very thin serifs/diagonals need at least 40 solid mask pixels
                        # in the leading edge to survive H264's chroma subsampling.
                        ga=max(a,math.floor(token['start']*100)/100)
                        if ga>=b: return
                        glyph_font=ImageFont.truetype(fonts[fkey]['path'],fsize)
                        mask,offset=glyph_font.getmask2(text); box=mask.getbbox()
                        left=px+offset[0]+box[0]; right=px+offset[0]+box[2]+1
                        columns=[0]*mask.size[0]
                        for j,value in enumerate(mask):
                            if value>=220: columns[j%mask.size[0]]+=1
                        mass=0; first_stroke=0
                        for first_stroke,count in enumerate(columns):
                            mass+=count
                            if mass>=40: break
                        edge=min(right-.1,max(left+8,px+offset[0]+first_stroke+2))
                        clip_left=0
                        if lang=='en' and dy==0:
                            left=token['ink_left']; right=token['ink_right']; edge=token['onset_edge']
                            clip_left=left; text=sung; px=130
                        def sweep(t):
                            phase=max(0,min(1,(t-token['start'])/(token['end']-token['start'])))
                            return edge+(right-edge)*phase
                        # Round event onset down so ASS centisecond storage never postpones
                        # the first encoded frame after a precise timeline onset.
                        tags=rf'\move({px:.2f},{y_at(ga)+dy:.2f},{px:.2f},{y_at(b)+dy:.2f})'+alpha(1)
                        tags+=rf'\clip({clip_left},0,{sweep(ga):.2f},1080)\t(0,{max(1,round((min(b,token["end"])-ga)*1000))},\clip({clip_left},0,{sweep(b):.2f},1080))'
                        ass.add(ga,b,text,px,0,fkey,fsize,1,GOLD,extra=tags,layer=1)
                    filled(token['text'],token['x'],0,key,size)
                    if token.get('pinyin'):
                        py=token['pinyin']; pf=ImageFont.truetype(fonts['pinyin']['path'],34); px=token['x']+(84-pf.getlength(py))/2
                        for ch in py: assert ord(ch) in fonts['pinyin']['cmap'],('pinyin',ch)
                        ass.add(a,b,py,px,0,'pinyin',34,.45,extra=motion(px,-48)+alpha(.45))
                        filled(py,px,-48,'pinyin',34)
            translation=l['zh'] if lang=='en' else l['en']; transkey='zh' if lang=='en' else 'italic'; transsize=34 if lang=='en' else 36
            assert ImageFont.truetype(fonts[transkey]['path'],transsize).getlength(translation)<1135,(l['id'],'translation width')
            for a,b in zip(cuts,cuts[1:]):
                ta=round(255*(1-.6*min(1,(a-appear)/.35)*min(1,(leave-a)/.4)))
                tb=round(255*(1-.6*min(1,(b-appear)/.35)*min(1,(leave-b)/.4)))
                ass.add(a,b,translation,130,0,transkey,transsize,.6,extra=rf'\move(130,{y_at(a)+116:.2f},130,{y_at(b)+116:.2f})\1a&H{ta:02X}&\t(0,{round((b-a)*1000)},\1a&H{tb:02X}&)')
                if l['id'].startswith('L14'): ass.add(a,b,'(whispered)',740,0,'italic',26,.6,extra=rf'\move(740,{y_at(a)+24:.2f},740,{y_at(b)+24:.2f})\1a&H{ta:02X}&\t(0,{round((b-a)*1000)},\1a&H{tb:02X}&)')
            if close_prev and appear>prev['start']:
                ass.add(max(prev['start'],l['start']-2.5),appear,sung,130,933,key,42,.25)
            gap=l['start']-(prev['end'] if prev else 0)
            if gap>4:
                beats=[x['t'] for x in json.loads((ROOT/'analysis/beatgrid.json').read_text())['beats'] if x['t']<l['start']][-3:]
                begin=beats[0]-(beats[1]-beats[0])
                for j,end in enumerate(beats): ass.add(begin,end,'●',137+j*29,600,'zh',13,.8,GOLD,extra=r'\fad(120,80)')
            if not karaoke: manifest.append({**l,'tokens':tokens,'appear':appear,'leave':leave,'main_y':main_y,'initial_y':initial_y,'rise':rise,'rise_end':rise_end,'size':size})
        for region in timing['vocalise_and_humming']:
            label='♪ humming ♪' if 'hum' in region['type'] else '♪ vocalise ♪'
            # Noto contains music-note glyphs, unlike Cormorant.
            ass.add(region['start'],region['end'],label,130,945,'zh',26,.5,extra=r'\fad(200,300)')
        notes=(ROOT/'inputs/望明月, Moongazing lyrics and notes.md').read_text()
        credits=notes.split('## 望明月, Moongazing (credits)\n',1)[1].split('\n##',1)[0].strip()
        # Verbatim text: preserve paragraphs; two source paragraphs per credit page, no inserted line breaks.
        credit_lines=[s for s in credits.splitlines() if s]
        for j,line in enumerate(credit_lines):
            cf=ImageFont.truetype(fonts['en']['path'],27)
            # Long verbatim lines fit the clear lower half at 27px.
            size=min(27,math.floor(1660/cf.getlength(line)*27))
            ass.add(204,216,line,130,640+j*53,'en',size,.65,extra=r'\fad(1200,1300)')
        ass.write(OUT/('karaoke.ass' if karaoke else 'lyrics.ass'))
    (OUT/'lyric_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    log('ASS built from literal Jade LYRICS; L07/L10 splits retained; original timing, pypinyin tones, unique static 400-weight font families verified by cmap.')

if __name__=='__main__': main()
