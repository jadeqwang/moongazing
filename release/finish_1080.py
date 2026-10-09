"""Gate the finished render, encode, check, and finalize after contact-sheet review."""
import argparse
import json
from pathlib import Path
import re
import subprocess

from encode_1080 import ROOT

OUT=ROOT/'render/out/release_1080'
JOBS=ROOT/'render/out/retime/jobs.log'
LOG=ROOT/'render/out/v8_1080_render.log'


def render_gate(text):
    # Do not accept a successful summary belonging to an earlier render run.
    current=text[text.rfind('V8_1080_START'):] if 'V8_1080_START' in text else text
    summaries=[line for line in current.splitlines() if line.startswith('SUMMARY ')]
    summary=summaries[-1] if summaries else ''
    evidence=[line for line in current.splitlines() if
              any(s in line for s in ['V8_1080_START','SUMMARY ','V8_1080_RENDER_EXIT','V8_1080_FRAMES_DONE'])]
    if 'V8_1080_FRAMES_DONE' not in current:
        raise ValueError('V8_1080_FRAMES_DONE is absent from the current render run')
    exits=re.findall(r'V8_1080_RENDER_EXIT\s+(\d+)',current)
    if not exits or exits[-1]!='0':
        raise ValueError('Render exit is not 0: '+str(exits[-1:]))
    for key,value in [('unresolved','0'),('missing','0'),('flicker_check','PASS')]:
        match=re.search(r'\b'+key+r'=(\S+)',summary)
        if not match or match[1]!=value:
            raise ValueError('Render summary failed '+key+': '+(summary or '(missing SUMMARY)'))
    if 'frames_rendered=5165/5165' not in summary:
        raise ValueError('Render summary does not confirm all 5,165 frames: '+summary)
    return '\n'.join(evidence)+'\n'


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--finalize-reviewed',action='store_true',
                        help='Finalize only after inspecting the actual contact sheet and fidelity evidence.')
    args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    if args.finalize_reviewed:
        data=json.loads((OUT/'CHECKS.json').read_text())
        assert data['pass'] and (OUT/'contact.jpg').is_file()
        data['contact_review_pass']=True
        (OUT/'CHECKS.json').write_text(json.dumps(data,indent=2))
        with (OUT/'REPORT.md').open('a') as f:
            f.write('\nContact sheet and sampled fidelity images visually inspected after encoding; no additional visual anomaly found.\n')
        with JOBS.open('a') as f:f.write('V8_1080_ENCODE_DONE\n')
        print('V8_1080_ENCODE_DONE',flush=True)
        return
    text=LOG.read_text()
    try:
        evidence=render_gate(text)
    except Exception as exc:
        (OUT/'REPORT.md').write_text('# Moongazing 1080p verification\n\n'
            'Result: **BLOCKED — no encode performed**.\n\n'+str(exc)+
            '\n\nRender log (final lines):\n\n```text\n'+'\n'.join(text.splitlines()[-60:])+'\n```\n')
        raise
    (OUT/'render_gate.txt').write_text(evidence)
    print('Render gate PASS; starting 1080p encoder.',flush=True)
    for command,name in [([str(ROOT/'release/encode_1080.sh')],'build.log'),
            ([str(ROOT/'.venv/bin/python'),'-B',str(ROOT/'release/check_1080.py')],'verification.log')]:
        with (OUT/name).open('w') as f:
            subprocess.run(command,cwd=ROOT,stdout=f,stderr=subprocess.STDOUT,check=True)
    print('ENCODE_CHECKS_READY: inspect render/out/release_1080/contact.jpg and REPORT.md.',flush=True)


if __name__=='__main__':
    try:
        main()
    except Exception as exc:
        if not (OUT/'REPORT.md').is_file():
            (OUT/'REPORT.md').write_text('# Moongazing 1080p verification\n\nResult: **BLOCKED**.\n\n'+str(exc)+'\n')
        with JOBS.open('a') as f:
            f.write('V8_1080_ENCODE_BLOCKED: '+str(exc).replace('\n',' ')+'\n')
        raise
