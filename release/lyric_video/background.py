"""Reuse the verified original plate; no renderer, browser, git or GPU needed."""
import hashlib
import shutil
from recording import OUT, OLD_OUT, log

def main():
    source = OLD_OUT / 'bg_1080.png'
    target = OUT / 'bg_1080.png'
    if not source.is_file():
        raise FileNotFoundError('The verified original bg_1080.png is required.')
    if source != target:
        shutil.copy2(source, target)
    assert source.read_bytes() == target.read_bytes()
    probe_source = OLD_OUT / 'ffprobe'
    probe_target = OUT / 'ffprobe'
    if probe_source != probe_target:
        shutil.copy2(probe_source, probe_target)
    log('Original verified paper/Moon plate reused byte-for-byte; SHA256=' +
        hashlib.sha256(target.read_bytes()).hexdigest())

if __name__ == '__main__':
    main()
