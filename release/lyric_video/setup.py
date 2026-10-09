"""Install the separator locally while sharing existing heavy dependencies read-only."""
import datetime
import importlib.metadata
import pathlib
import shutil
import venv

ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'render/out/lyric_video'

def main():
    OUT.mkdir(exist_ok=True,parents=True)
    venv.EnvBuilder(with_pip=False).create(OUT/'venv')
    source=ROOT/'.venv/lib/python3.12/site-packages'
    dest=OUT/'venv/lib/python3.12/site-packages'
    for p in source.iterdir():
        if p.name.startswith('audio_separator'):
            if p.is_dir(): shutil.copytree(p,dest/p.name,dirs_exist_ok=True)
            else: shutil.copyfile(p,dest/p.name)
    (dest/'shared_dependencies.pth').write_text(str(source)+'\n')
    with (OUT/'job.log').open('a') as f:
        f.write(f'{datetime.datetime.now().isoformat()} Separator installed into dedicated job venv; heavy dependencies reused read-only from project environment.\n')

if __name__=='__main__': main()
