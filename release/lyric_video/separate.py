"""Karaoke separation; all state and caches are local to this job."""
import os
import pathlib
import sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'render/out/lyric_video'
os.environ['PATH'] = str(ROOT / '.venv/bin') + os.pathsep + os.environ['PATH']
for k in ['XDG_CACHE_HOME', 'NUMBA_CACHE_DIR', 'TORCH_HOME', 'HF_HOME', 'MPLCONFIGDIR']:
    os.environ[k] = str(OUT / 'cache' / k)
for k in ['OMP_NUM_THREADS', 'MKL_NUM_THREADS', 'OPENBLAS_NUM_THREADS']:
    os.environ[k] = '4'
os.environ['PYTHONDONTWRITEBYTECODE'] = '1'
import torch
torch.set_num_threads(4)
torch.set_num_interop_threads(1)
from audio_separator.separator import Separator
from audio_separator.separator.uvr_lib_v5 import spec_utils
import soundfile as sf
import numpy as np

MODEL = 'mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956.ckpt'

def separator():
    # Disable the package's optional peak normalization at every call site.
    spec_utils.normalize = lambda wave, **kwargs: wave
    return Separator(model_file_dir=str(OUT / 'models'), output_dir=str(OUT / 'separated'),
                     output_format='WAV', normalization_threshold=1.0, amplification_threshold=0.0,
                     sample_rate=44100, use_soundfile=True,
                     mdxc_params={'batch_size': 1, 'overlap': 4, 'segment_size':256,
                                  'override_model_segment_size':False, 'pitch_shift':0})

def main():
    s = separator()
    if '--download' in sys.argv:
        s.download_model_and_data(MODEL)
        return
    s.load_model(MODEL)
    # Save float stems so there is no PCM clipping or loss before reconstruction.
    def write_float(stem_path, source):
        p = OUT / 'separated' / stem_path
        sf.write(p, source, s.sample_rate, subtype='FLOAT')
    s.model_instance.write_audio = write_float
    files = s.separate(str(ROOT / 'media/audio/moongazing_master.wav'))
    (OUT / 'separation_outputs.json').write_text(__import__('json').dumps({
        'model':MODEL, 'version':__import__('importlib.metadata',fromlist=['version']).version('audio-separator'),
        'files':files,'primary':s.model_instance.primary_stem_name,
        'secondary':s.model_instance.secondary_stem_name,'sample_rate':s.sample_rate}, indent=2))

if __name__ == '__main__':
    main()
