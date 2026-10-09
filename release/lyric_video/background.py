"""Render the film's own paper and Moon without touching the live renderer or git."""
import datetime
import pathlib
import shutil
import subprocess
import tarfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'render/out/lyric_video'

def log(s):
    with (OUT / 'job.log').open('a') as f:
        f.write(f'{datetime.datetime.now().isoformat()} {s}\n')

def main():
    wt = OUT / 'wt'
    if wt.exists():
        shutil.rmtree(wt)
    wt.mkdir(exist_ok=True)
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    archive = OUT / 'committed_render.tar'
    with archive.open('wb') as f:
        subprocess.run(['git', 'archive', commit, 'render'], cwd=ROOT, stdout=f, check=True)
    with tarfile.open(archive) as f:
        f.extractall(wt, filter='data')
    for name in ['media', 'analysis', 'inputs']:
        (wt / name).symlink_to(ROOT / name, target_is_directory=True)
    (wt / 'render/node_modules').symlink_to(ROOT / 'render/node_modules', target_is_directory=True)
    for font in (ROOT / 'render/fonts').glob('*.ttf'):
        shutil.copyfile(font, wt / 'render/fonts' / font.name)
    # Only the archive's entry point is changed. All shaders, paper and post remain original.
    p = wt / 'render/src/main.js'
    s = p.read_text()
    s = s.replace('let shots = buildShots(beats, store, ctx.lyrics);', "let shots = [{id:'lyric-plate',t0:0,t1:216,paper:'indigo',grain:48,scene:[{name:'inkmoon',params:{mode:'photo',pale:true,halo:0,place:{x:1401.6,y:313.2,R:162}}}],post:()=>({grain:0.012,vignette:0.16})}];")
    p.write_text(s)
    log(f'Background: isolated git archive {commit}; one Chrome worker; Moon (1401.6,313.2), diameter 324 px.')
    with (OUT / 'background_render.log').open('w') as f:
        subprocess.run(['nice', '-n', '10', 'node', 'tools/render.mjs', '--stills', '95.5', '--scale', '1', '--workers', '1', '--outdir', str(OUT), '--prefix', 'bg'], cwd=wt / 'render', stdout=f, stderr=subprocess.STDOUT, check=True)
    shutil.copyfile(OUT / 'bg_095.500.png', OUT / 'bg_1080.png')
    shutil.rmtree(wt)  # archive, not a git worktree; no git registration ever created
    archive.unlink()
    log('Background rendered from original engine; isolated archive removed; git state untouched.')

if __name__ == '__main__':
    main()
