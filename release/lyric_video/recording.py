"""Shared recording selection; every script accepts --recording {2down,original}."""
import argparse
import datetime
import os
from pathlib import Path

import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(add_help=False)
parser.add_argument('--recording', choices=['2down', 'original'],
                    default=os.environ.get('MG_LYRIC_RECORDING', '2down'))
args, _ = parser.parse_known_args()
RECORDING = args.recording
# Child stages inherit the selected recording, including visual-only rebuilds.
os.environ['MG_LYRIC_RECORDING'] = RECORDING
OLD_OUT = ROOT / 'render/out/lyric_video'
OUT = ROOT / ('render/out/lyric_video_2down' if RECORDING == '2down'
              else 'render/out/lyric_video')
MASTER = ROOT / ('media/audio/moongazing_2down_master.wav' if RECORDING == '2down'
                 else 'media/audio/moongazing_master.wav')
TIMING = ROOT / ('analysis/lyrics_timing.json' if RECORDING == '2down'
                 else 'analysis/v1/lyrics_timing.json')
BEATGRID = ROOT / ('analysis/beatgrid.json' if RECORDING == '2down'
                   else 'analysis/v1/beatgrid.json')
ALL_VOCALS = ROOT / ('analysis/stems/v2/vocals.wav' if RECORDING == '2down'
                     else 'analysis/stems/vocals.wav')
info = sf.info(MASTER)
DURATION = info.frames / info.samplerate
OUT.mkdir(parents=True, exist_ok=True)


def log(message):
    with (OUT / 'job.log').open('a') as f:
        f.write(f'{datetime.datetime.now().isoformat()} {message}\n')
