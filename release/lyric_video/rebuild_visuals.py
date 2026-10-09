"""Rebuild visuals using the existing audio; completion requires manual review."""
import json
import subprocess
import sys
from fix_checks import digest
from lyrics import OUT, ROOT, log


def main():
    audio = ['Moongazing_karaoke_audio.wav', 'Moongazing_karaoke_audio_nohumming.wav']
    (OUT / 'fix_audio_hashes.json').write_text(json.dumps(
        {name: digest(OUT / name) for name in audio}, indent=2))
    steps = [('lyrics.py', []), ('review.py', []), ('fix_checks.py', []),
             ('verify.py', ['--preflight']), ('encode.py', []),
             ('verify.py', []), ('fix_checks.py', ['--encoded'])]
    if '--after-layout' in sys.argv:
        steps = steps[1:]
    for index, (script, args) in enumerate(steps):
        log('Visual-only rebuild: ' + script + ' ' + ' '.join(args))
        with (OUT / f'fix_step_{index}_{script}.log').open('w') as f:
            subprocess.run(['nice', '-n', '10', str(ROOT / '.venv/bin/python'), '-B',
                            str(ROOT / 'release/lyric_video' / script), *args],
                           stdout=f, stderr=subprocess.STDOUT, check=True)
    log('Visual rebuild checks passed; native evidence ready for manual review before LYRIC_FIX_DONE.')


if __name__ == '__main__':
    main()
