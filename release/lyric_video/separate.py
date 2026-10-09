"""Karaoke separation; all state and caches are local to this job."""
import os
import hashlib
import pathlib
import sys
from recording import ROOT, OUT, MASTER, OLD_OUT, log
os.environ['CUDA_VISIBLE_DEVICES'] = ''
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

class CPUSeparator(Separator):
    def setup_accelerated_inferencing_device(self):
        self.check_ffmpeg_installed()
        self.torch_device_cpu = torch.device('cpu')
        self.torch_device = torch.device('cpu')
        self.onnx_execution_provider = ['CPUExecutionProvider']
        self.logger.info('Recording build explicitly uses device=cpu.')

    def download_file_if_not_exists(self, url, output_path):
        # This job is offline: never let a cache miss make a network request.
        if not pathlib.Path(output_path).is_file():
            message = f'NEED: {MODEL}: missing cached {pathlib.Path(output_path).name}'
            with (ROOT / 'render/out/retime/jobs.log').open('a') as f:
                f.write(message + '\n')
            raise FileNotFoundError(message)

def separator():
    # Disable the package's optional peak normalization at every call site.
    spec_utils.normalize = lambda wave, **kwargs: wave
    return CPUSeparator(model_file_dir=str(OUT / 'models'), output_dir=str(OUT / 'separated'),
                     output_format='WAV', normalization_threshold=1.0, amplification_threshold=0.0,
                     sample_rate=44100, use_soundfile=True,
                     mdxc_params={'batch_size': 1, 'overlap': 4, 'segment_size':256,
                                  'override_model_segment_size':False, 'pitch_shift':0})

def main():
    import shutil
    (OUT / 'models').mkdir(exist_ok=True)
    (OUT / 'separated').mkdir(exist_ok=True)
    if OUT != OLD_OUT:
        for name in [MODEL, MODEL.replace('.ckpt', '_config.yaml'), 'download_checks.json']:
            source = OLD_OUT / 'models' / name
            target = OUT / 'models' / name
            if source.is_file() and not target.exists():
                shutil.copy2(source, target)
    s = separator()
    if '--download' in sys.argv:
        s.download_model_and_data(MODEL)
        return
    s.load_model(MODEL)
    assert s.torch_device.type == 'cpu' and s.model_instance.torch_device.type == 'cpu'
    log(f'Separation model {MODEL}; device=cpu; master={MASTER.relative_to(ROOT)}')
    # Save float stems so there is no PCM clipping or loss before reconstruction.
    def write_float(stem_path, source):
        p = OUT / 'separated' / stem_path
        sf.write(p, source, s.sample_rate, subtype='FLOAT')
    s.model_instance.write_audio = write_float
    files = s.separate(str(MASTER))
    (OUT / 'separation_outputs.json').write_text(__import__('json').dumps({
        'model':MODEL, 'version':__import__('importlib.metadata',fromlist=['version']).version('audio-separator'),
        'files':files,'primary':s.model_instance.primary_stem_name,
        'secondary':s.model_instance.secondary_stem_name,'sample_rate':s.sample_rate,
        'device':'cpu','master':str(MASTER.relative_to(ROOT)),
        'master_sha256':hashlib.sha256(MASTER.read_bytes()).hexdigest()}, indent=2))

if __name__ == '__main__':
    main()
