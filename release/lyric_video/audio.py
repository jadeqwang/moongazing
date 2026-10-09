"""Build 24-bit karaoke with original wordless passages, then measure splices."""
import datetime
import hashlib
import json
import pathlib
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

from recording import ROOT, OUT, MASTER, TIMING, ALL_VOCALS, DURATION, RECORDING, log
SR=48000

def db(x): return float(20*np.log10(max(1e-15,np.sqrt(np.mean(np.square(x,dtype=np.float64))))))
def read(p,n=None):
    a,sr=sf.read(p,dtype='float64',always_2d=True)
    if sr!=SR: a=resample_poly(a,SR//np.gcd(sr,SR),sr//np.gcd(sr,SR),axis=0)
    if n is not None: a=np.pad(a,((0,max(0,n-len(a))),(0,0)))[:n]
    return a

def main():
    master=read(MASTER); n=len(master)
    metadata=json.loads((OUT/'separation_outputs.json').read_text())
    lead_path=next(OUT/'separated'/p for p in metadata['files'] if '_(Vocals)' in p)
    nl_path=next(OUT/'separated'/p for p in metadata['files'] if '_(Instrumental)' in p)
    lead=read(lead_path,n); raw_no_lead=read(nl_path,n)
    raw_residual=db(master-lead-raw_no_lead)
    # The karaoke model predicts the lead and computes its complementary stem.
    # Return the lead to native 48k, subtract from the untouched master: exact reconstruction,
    # and retain the master's native high frequency content rather than resampling the whole mix.
    no_lead=master-lead
    vocals=read(ALL_VOCALS,n)
    sf.write(OUT/'lead_48k_float.wav',lead,SR,subtype='FLOAT')
    timeline=json.loads(TIMING.read_text()); timing=timeline['lines']
    hop=480
    energy=np.array([db(lead[j:j+hop]) for j in range(0,n,hop)])
    regions=[]
    for i,l in enumerate(timing):
        start=l['start']; end=l['end']
        if RECORDING == 'original':
            # These are original-recording lyric tails, never new-track times.
            if l['id']=='L13': end=max(end,99.7)
            if l['id']=='L11': end=max(end,92.12)
            if l['id']=='L14b': end=max(end,124.0)
        else:
            # New ad-lib and octave-flip tails are part of the preceding lyric.
            for region in timeline['vocalise_and_humming']:
                kind=region['type'].lower()
                if (l['id']=='L11' and 'ad-lib' in kind) or (l['id']=='L14b' and '乡 tail' in kind):
                    end=max(end,region['end'])
        next_start=timing[i+1]['start'] if i+1<len(timing) else DURATION
        # Wait for the lead/reverb to settle below -48 dBFS for 100ms.
        tail_limit=min(next_start-.02,end+3.0)
        stop=end
        if tail_limit>end:
            for k in range(round(end*100),round(tail_limit*100)):
                stop=k/100
                if np.max(energy[k:k+10])<-48: break
            else: stop=tail_limit
        end=max(end,stop)
        # Start before the attack, move fade into low-lead part of the preceding gap.
        onset=max(0,start-.16)
        if regions and onset<regions[-1]['end']+.22:
            regions[-1]['end']=end; regions[-1]['ids'].append(l['id'])
        else: regions.append(dict(start=onset,end=end,ids=[l['id']]))
    # Crossfade IN before the syllable; OUT after the last audible held note.
    result=master.copy(); modified=np.zeros(n,dtype=bool); splice_checks=[]
    for region in regions:
        a=round(region['start']*SR); core_end=round(region['end']*SR); b=min(n,core_end+round(.10*SR)); fade=round(.10*SR)
        region['splice_start']=a/SR; region['splice_end']=b/SR
        gain_old=np.zeros(b-a); gain_new=np.ones(b-a)
        theta=np.linspace(0,np.pi/2,fade,endpoint=True)
        gain_old[:fade]=np.cos(theta); gain_new[:fade]=np.sin(theta)
        gain_old[-fade:]=np.sin(theta); gain_new[-fade:]=np.cos(theta)
        result[a:b]=master[a:b]*gain_old[:,None]+no_lead[a:b]*gain_new[:,None]
        modified[a:b]=True
        for t in [a,a+fade,core_end,b]:
            lo=max(0,t-2400); hi=min(n,t+2400)
            jumps=np.max(np.abs(np.diff(result[lo:hi],axis=0)),axis=1)
            local=max(float(np.max(np.abs(result[t]-result[t-1]))),float(np.max(np.abs(result[min(t+1,n-1)]-result[t]))))
            neighbour=float(np.quantile(jumps,.99))
            splice_checks.append(dict(time=t/SR,jump=local,neighbour_p99=neighbour,ratio=local/max(neighbour,1e-12)))
    no_humming=no_lead.copy(); wordless_checks=[]
    if RECORDING=='2down':
        # The lead-only model intentionally retains some wordless voices. Use
        # the supplied all-vocal estimates only in this alternate's non-lyric
        # passages. Demucs recovers the solo hum that RoFormer misses.
        demucs=read(ROOT/'analysis/work/v2/demucs/htdemucs_ft/new_mix/vocals.wav',n)
        wordless=[]
        for r in timeline['vocalise_and_humming']:
            kind=r['type'].lower()
            if any(s in kind for s in ['ad-lib','falsetto']): continue
            a,b=r['start'],r['end']; source='BS-RoFormer'
            if 'outro humming' in kind: b=198.5
            if 'final solo' in kind: a=202.79; source='htdemucs_ft'
            if wordless and a<=wordless[-1]['end']+.2 and source==wordless[-1]['source']:
                wordless[-1]['end']=max(b,wordless[-1]['end'])
            else: wordless.append(dict(start=a,end=b,source=source))
        fade=round(.10*SR)
        for r in wordless:
            a=max(0,round(r['start']*SR)-fade); b=min(n,round(r['end']*SR)+fade)
            estimate=demucs if r['source']=='htdemucs_ft' else vocals
            target=master[a:b]-estimate[a:b]
            weight=np.ones(b-a)
            weight[:fade]=np.linspace(0,1,fade)
            weight[-fade:]=np.linspace(1,0,fade)
            no_humming[a:b]=no_lead[a:b]*(1-weight[:,None])+target*weight[:,None]
            lo,hi=round(r['start']*SR),round(r['end']*SR)
            wordless_checks.append({**r,'splice_start':a/SR,'splice_end':b/SR,
                'master_dbfs':db(master[lo:hi]),'nohumming_dbfs':db(no_humming[lo:hi]),
                'removed_component_dbfs':db(master[lo:hi]-no_humming[lo:hi])})
    sf.write(OUT/'Moongazing_karaoke_audio.wav',result,SR,subtype='PCM_24')
    sf.write(OUT/'Moongazing_karaoke_audio_nohumming.wav',no_humming,SR,subtype='PCM_24')
    pcm_master,_=sf.read(MASTER,dtype='int32',always_2d=True)
    pcm_result,_=sf.read(OUT/'Moongazing_karaoke_audio.wav',dtype='int32',always_2d=True)
    identical=bool(np.array_equal(pcm_master[~modified],pcm_result[~modified]))
    lyric_mask=np.zeros(n,dtype=bool)
    for l in timing: lyric_mask[round(l['start']*SR):round(l['end']*SR)]=True
    backing_proxy=vocals-lead
    report=dict(duration=n/SR,sample_rate=SR,channels=2,
                raw_model_reconstruction_residual_dbfs=raw_residual,
                master_rms_dbfs=db(master),
                raw_model_reconstruction_residual_relative_db=raw_residual-db(master),
                native_reconstruction_residual_dbfs=db(master-lead-no_lead),
                bit_identical_outside_splices=identical,
                unchanged_samples=int((~modified).sum()),regions=regions,splices=splice_checks,
                removed_lead_lyric_dbfs=db(lead[lyric_mask]),
                all_vocals_lyric_dbfs=db(vocals[lyric_mask]),
                backing_proxy_lyric_dbfs=db(backing_proxy[lyric_mask]),
                backing_proxy_energy_percent=100*10**((db(backing_proxy[lyric_mask])-db(vocals[lyric_mask]))/10),
                master_peak=float(np.max(np.abs(master))),karaoke_peak=float(np.max(np.abs(result))),
                no_humming_peak=float(np.max(np.abs(no_humming))),
                nohumming_wordless_regions=wordless_checks,
                max_splice_jump_ratio=max(x['ratio'] for x in splice_checks))
    (OUT/'audio_checks.json').write_text(json.dumps(report,indent=2))
    log('Audio checks '+json.dumps({k:v for k,v in report.items() if k not in ['regions','splices']}))
    for r in regions: log('Splice region '+json.dumps(r))
    for s in splice_checks: log('Splice jump '+json.dumps(s))
    assert identical and n==round(DURATION*SR)
    assert report['karaoke_peak']<1 and report['no_humming_peak']<1,'Clipping; choose quieter gap crossfades'
    assert report['max_splice_jump_ratio']<2,'Potential click; inspect splice'
    hashes={name:hashlib.sha256((OUT/name).read_bytes()).hexdigest() for name in
            ['Moongazing_karaoke_audio.wav','Moongazing_karaoke_audio_nohumming.wav']}
    (OUT/'fix_audio_hashes.json').write_text(json.dumps(hashes,indent=2))

if __name__=='__main__': main()
