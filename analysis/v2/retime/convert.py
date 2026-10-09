#!/usr/bin/env python3
"""Rewrite the fixed song times in render/src for the new track (old time -> new time).
A time that is a measured event (analysis/v2/time_map.json "events") takes the measured value; any other takes the
beat warp. Only the tokens listed per file below are touched. Dry run prints the changes; --write applies them.
  .venv/bin/python analysis/v2/retime/convert.py [--write]
"""
import json, re, sys, bisect
ROOT = '/home/jade/Documents/moongazing/'
TM = json.load(open(ROOT + 'analysis/v2/time_map.json'))
EV = {round(float(e['old']), 3): e for e in TM['events']}
WX = [w[0] for w in TM['warp']]; WY = [w[1] for w in TM['warp']]
OVERRIDE = {}        # old -> new, set by hand after review (filled in below from overrides.json if present)
try: OVERRIDE = {round(float(k), 3): v for k, v in json.load(open(ROOT + 'analysis/v2/retime/overrides.json')).items()}
except FileNotFoundError: pass

def warp(t):
    i = max(1, min(len(WX) - 1, bisect.bisect_right(WX, t)))
    x0, x1, y0, y1 = WX[i - 1], WX[i], WY[i - 1], WY[i]
    return y0 + (y1 - y0) * (t - x0) / (x1 - x0)

def new(t):
    k = round(t, 3)
    if k in OVERRIDE: return OVERRIDE[k], 'override'
    if k in EV: return float(EV[k]['new']), 'event/' + EV[k].get('conf', '?')
    return warp(t), 'warp'

# file -> list of old tokens (as written) that are song times
S = 'render/src/sections/'
FILES = {
 S + '_lib.js': ['1.78', '2.84', '5.86', '9.14', '11.47', '13.10', '15.42', '17.1', '22.75', '30.57', '45.3', '47.14', '61.65', '74.4', '76.17',
                 '97.73', '104.92', '109.5', '111.95', '115.57', '118.8', '120.12', '121.89', '122.65', '143.43', '158.5', '164.5', '167.0', '173.0', '181.0',
                 '189.86', '193.22', '200.5', '201.6', '204.5', '205.7', '207.0', '208.3', '210.04', '212.0'],
 S + '00_intro.js': ['15.67', '1.78', '2.84', '5.86', '13.10', '2.44', '2.49', '2.55', '2.62', '2.87', '3.58'],
 'release/subs/make_subs.py': ['5.86', '13.10', '201.6'],
 S + '01_intro_b.js': ['15.67', '32.42', '22.75', '26.87'],
 S + '02_verse1.js': ['32.42', '46.82', '39.23'],
 S + '03_verse2.js': ['46.82', '76.11', '74.4', '74.45', '76.17'],
 S + '04_hook.js': ['76.11', '101.33', '76.17', '77.4', '79.0', '83.3', '86.1', '83.4', '92.2', '97.73'],
 S + '05_interlude.js': ['101.33', '111.95', '109.5'],
 S + '06_breakdown.js': ['111.95', '122.77', '118.8', '122.62', '119.6'],
 S + '07_drop.js': ['122.77', '189.86', '181.11', '182.30', '183.80', '184.60', '185.30', '182.0', '184.0', '182.75', '183.45', '143.43', '158.5', '164.5', '173.0'],
 S + '08_outro.js': ['189.86', '210.04', '201.6', '197.04'],
 'render/src/scenes/cosmos.js': ['181.11', '182.30', '183.80', '184.60', '185.30', '186.36', '187.50', '189.86', '182.0', '184.0', '184.5', '185.3', '187.5',
                                 '186.9', '188.0', '185.2', '185.6', '186.5', '188.55', '189.35', '187.4', '187.9', '187.95', '188.35', '189.15', '189.55'],
}
SKIP_LINE = re.compile(r'^\s*(//|#)')       # whole-line comments are left as history
write = '--write' in sys.argv
for f, toks in FILES.items():
    src = open(ROOT + f).read().split('\n'); out = []; n = 0
    pat = re.compile(r'(?<![0-9A-Za-z_.])(' + '|'.join(re.escape(t) for t in sorted(toks, key=len, reverse=True)) + r')(?![0-9])')
    for ln, line in enumerate(src, 1):
        if SKIP_LINE.match(line): out.append(line); continue
        code, sep, com = line.partition('  // ') if '  // ' in line else (line, '', '')
        def rep(m):
            global n
            v, how = new(float(m.group(1))); n += 1
            s = ('%.2f' % v)
            print('%-34s %4d  %8s -> %8s  %s' % (f.replace('render/src/', ''), ln, m.group(1), s, how))
            return s
        out.append(pat.sub(rep, code) + sep + com)
    if write: open(ROOT + f, 'w').write('\n'.join(out))
    print('   %s: %d tokens%s' % (f, n, ' written' if write else ''))
