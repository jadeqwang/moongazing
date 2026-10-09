"""Record completion after automated verification and native visual review."""
import argparse
import json
from recording import ROOT, OUT, MASTER, RECORDING, DURATION, log


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--recording',choices=['2down','original'],default=RECORDING)
    parser.add_argument('--reviewed',action='store_true',required=True,
                        help='Confirm the final contact sheet and native crops were inspected.')
    parser.parse_args()
    video=json.loads((OUT/'video_checks.json').read_text())
    audio=json.loads((OUT/'independent_audio_checks.json').read_text())
    decodes=json.loads((OUT/'decode_checks.json').read_text())
    assert len(decodes)==2 and all(r['full_audio_video_decode_pass'] for r in decodes.values())
    assert video['fill_checks_pass'] and len(video['probes'])==2
    assert audio['unchanged_outside_splices'] and audio['wav_hashes_unchanged']
    assert audio['lyric_samples_equal_nohumming'] and audio['reconstruction_pass']
    if RECORDING=='2down': assert audio['original_output_untouched']
    assert len(json.loads((OUT/'pinyin_checks.json').read_text()))==14
    assert len(json.loads((OUT/'spacing_checks.json').read_text()))==10
    names=['Moongazing_lyric_video.mp4','Moongazing_lyric_video_karaoke.mp4',
           'Moongazing_karaoke_audio.wav','Moongazing_karaoke_audio_nohumming.wav']
    files={str((OUT/name).relative_to(ROOT)):(OUT/name).stat().st_size for name in names}
    report=dict(recording=RECORDING,master=str(MASTER.relative_to(ROOT)),
                audio_seconds=DURATION,verification_pass=True,
                visual_review_pending=False,visual_review_pass=True,
                files=files,video_checks=video,audio_checks=audio,decode_checks=decodes)
    (OUT/'BUILD_REPORT.json').write_text(json.dumps(report,indent=2))
    log('Final contact sheet, native lyrics, pinyin and spacing inspected; LYRIC_DONE.')
    with (ROOT/'render/out/retime/jobs.log').open('a') as f:
        for path,size in files.items():
            if path.endswith('.mp4'): f.write(f'LYRIC_OUTPUT: {path} {size} bytes\n')
        f.write('LYRIC_DONE\n')
    print(json.dumps(files,indent=2))
    print('LYRIC_DONE')


if __name__=='__main__':
    main()
