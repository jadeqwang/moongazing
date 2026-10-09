"""CPU/offline end-to-end build; review evidence before recording completion."""
import argparse
import hashlib
import json
import subprocess
from recording import ROOT, OUT, MASTER, RECORDING, DURATION, log


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--recording', choices=['2down','original'], default=RECORDING)
    parser.add_argument('--reuse-separation', action='store_true',
                        help='Reuse completed CPU separation for this selected master.')
    args = parser.parse_args()
    steps = [('setup.py', []), ('background.py', [])]
    if args.reuse_separation:
        metadata=json.loads((OUT/'separation_outputs.json').read_text())
        assert metadata['master']==str(MASTER.relative_to(ROOT))
        assert metadata['device']=='cpu'
        assert metadata['master_sha256']==hashlib.sha256(MASTER.read_bytes()).hexdigest()
        assert all((OUT/'separated'/name).is_file() for name in metadata['files'])
    else:
        steps += [('separate.py', [])]
    steps += [('audio.py', []), ('lyrics.py', []), ('review.py', []),
              ('fix_checks.py', []), ('verify.py', ['--preflight']),
              ('encode.py', []), ('verify.py', []), ('fix_checks.py', ['--encoded'])]
    for index, (script, flags) in enumerate(steps):
        python = OUT/'venv/bin/python' if script=='separate.py' else ROOT/'.venv/bin/python'
        log('Recording build stage '+script+' '+ ' '.join(flags))
        with (OUT/f'build_{index:02d}_{script}.log').open('w') as f:
            subprocess.run(['nice','-n','10',str(python),'-B',
                            str(ROOT/'release/lyric_video'/script),
                            '--recording',RECORDING,*flags],
                           stdout=f,stderr=subprocess.STDOUT,check=True)
    report={'recording':RECORDING,'master':str(MASTER.relative_to(ROOT)),
            'audio_seconds':DURATION,'verification_pass':True,
            'visual_review_pending':True,'files':{}}
    for name in ['Moongazing_lyric_video.mp4','Moongazing_lyric_video_karaoke.mp4',
                 'Moongazing_karaoke_audio.wav','Moongazing_karaoke_audio_nohumming.wav']:
        path=OUT/name
        report['files'][str(path.relative_to(ROOT))]=path.stat().st_size
    (OUT/'BUILD_REPORT.json').write_text(json.dumps(report,indent=2))
    log('Build and automated verification passed; encoded native/contact-sheet evidence ready for review.')
    print(json.dumps(report,indent=2))


if __name__=='__main__':
    try:
        main()
    except Exception as exc:
        with (ROOT/'render/out/retime/jobs.log').open('a') as f:
            f.write('LYRIC_FAILED: '+str(exc).replace('\n',' ')+'\n')
        raise
