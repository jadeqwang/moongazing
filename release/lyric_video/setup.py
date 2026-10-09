"""Install the separator locally while sharing existing heavy dependencies read-only."""
import datetime
import importlib.metadata
import hashlib
import json
import pathlib
import platform
import shutil
import venv

from recording import ROOT, OUT, OLD_OUT, RECORDING

def main():
    OUT.mkdir(exist_ok=True,parents=True)
    if RECORDING == '2down':
        snapshot={str(p.relative_to(OLD_OUT)):{'bytes':p.stat().st_size,
                  'mtime_ns':p.stat().st_mtime_ns} for p in OLD_OUT.rglob('*') if p.is_file()}
        for name in ['Moongazing_lyric_video.mp4','Moongazing_lyric_video_karaoke.mp4',
                     'Moongazing_karaoke_audio.wav','Moongazing_karaoke_audio_nohumming.wav',
                     'bg_1080.png']:
            h=hashlib.sha256()
            with (OLD_OUT/name).open('rb') as f:
                for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
            snapshot[name]['sha256']=h.hexdigest()
        (OUT/'original_output_snapshot.json').write_text(json.dumps(snapshot,indent=2))
    venv.EnvBuilder(with_pip=False).create(OUT/'venv')
    source=ROOT/'.venv/lib/python3.12/site-packages'
    dest=OUT/'venv/lib/python3.12/site-packages'
    for p in source.iterdir():
        if p.name.startswith('audio_separator'):
            if p.is_dir(): shutil.copytree(p,dest/p.name,dirs_exist_ok=True)
            else: shutil.copyfile(p,dest/p.name)
    (dest/'shared_dependencies.pth').write_text(str(source)+'\n')
    packages={name:importlib.metadata.version(name) for name in
              ['torch','audio-separator','numpy','scipy','soundfile','Pillow','fonttools','pypinyin']}
    (OUT/'environment_versions.json').write_text(json.dumps(dict(
        python=platform.python_version(),device='cpu',packages=packages),indent=2))
    with (OUT/'job.log').open('a') as f:
        f.write(f'{datetime.datetime.now().isoformat()} Separator installed into dedicated job venv; heavy dependencies reused read-only from project environment.\n')

if __name__=='__main__': main()
