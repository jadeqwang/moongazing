#!/usr/bin/env python3
"""Build the 望明月 Moongazing subtitle files from analysis/lyrics_timing.json + the card timings in render/src/sections.

    python3 release/subs/make_subs.py          (run from the repo root or anywhere)

Writes moongazing.zh-en.srt / .zh-en.vtt (bilingual) and moongazing.en.srt / moongazing.zh.srt next to this file.
Times are song seconds = video seconds (the render muxes the song from t=0).
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
L = {l['id']: l for l in json.load(open(os.path.join(REPO, 'analysis/lyrics_timing.json')))['lines']}
W = lambda lid, i: L[lid]['words'][i]['start']          # word start
D = {d['bar']: d['t'] for d in json.load(open(os.path.join(REPO, 'analysis/beatgrid.json')))['downbeats']}

MASTER = os.path.join(REPO, 'media/audio/moongazing_master.wav')
def audio_end():
    if os.path.exists(MASTER):
        import subprocess
        import soundfile as sf; return sf.info(MASTER).duration
    return 214.0
END = audio_end()

TAIL, GAP, MIN = 0.30, 0.04, 1.2   # hold after the sung end, gap between cues, min cue length

# ---- segments: (start, end, original_lang, zh, en, kind). kind: 'lyric' | 'card'
# Lyrics: start = aligned line start; end = sung end (+TAIL, clipped later)
def ly(lid, zh, en, start=None, end=None):
    l = L[lid]
    return dict(t0=l['start'] if start is None else start, t1=(l['end'] if end is None else end) + TAIL,
                lang=l['lang'], zh=zh, en=en, kind='lyric')

LYRICS = [
    ly('L01', '冬柳身纤细，', 'The willow in winter is slender,'),
    ly('L02', '丝素净笔直；', 'her switches plain and straight;'),
    ly('L03', '西湖的风掠过水面歌唱，', 'the West Lake wind sings over water,'),
    ly('L04', '如抚平丝绸；午后将晚，', 'like smoothing silk, and late'),
    ly('L05', '在茶馆里，看着', 'in afternoon teahouses watching'),
    ly('L06', '雪水烹茶。那一句——', 'snow-brewed tea. That line—'),
    # 举杯邀明月，对影成三人 (Li Bai, 月下独酌) — split at 对 so each half sits on its own phrase
    ly('L07', '举杯邀明月，', 'I raise my cup to invite the bright moon;', end=W('L07', 5) - TAIL),
    ly('L07', '对影成三人', 'with my shadow, we make three.', start=W('L07', 5)),
    ly('L08', '我想你——思乡，伴着残月', 'I think of you — homesick with waning'),
    ly('L09', '与孤独的酒。', 'moons and lonely wine.'),
    # 月缺酒寒，我思念你 — split at 我
    ly('L10', '月缺酒寒，', 'The moon wanes, the wine grows cold —', end=W('L10', 4) - TAIL),
    ly('L10', '我思念你', 'I miss you.', start=W('L10', 4)),
    ly('L11', '我想你，我想你', 'I think of you, I think of you'),
    ly('L12', '举杯邀明月', 'I raise my cup to invite the bright moon'),
    ly('L13', '残月与孤酒', 'moons and lonely wine'),
    # 举头望明月，低头思故乡 (Li Bai, 静夜思)
    ly('L14a', '举头望明月，', 'I raise my head to gaze at the bright moon'),
    ly('L14b', '低头思故乡', 'I lower my head and think of home.'),
]

# ---- on-screen cards (times from render/src/sections/*.js; card(ctx, key, o, t, a, b) is visible a..b)
# Each card: mono = one cue for the single-language files; bi = sub-cues for the bilingual file
# (split so every bilingual cue is exactly 2 lines and English lines stay <= 42 chars).
S03, S04, S05, S06 = 5.86, D[4], D[5], 13.10            # 00_intro.js
T9, T11 = D[9], D[11]                                   # 01_intro_b.js TAIKO[0], TAIKO[1]
S84 = 201.6                                             # 08_outro.js inscription(ctx, t, S84)
DED = 210.1                                             # credits dedication (after the seal lands at 210.04)
CARDS = [
    dict(lang='en', mono=(S03 + 0.3, S04 - 0.02, '很久以前，传说嫦娥飞上了月亮。', 'Long ago, the legend says,\nChang’e flew to the Moon.'),
         bi=[(S03, S03 + 1.24, '很久以前，传说', 'Long ago, the legend says,'),          # starts with 嫦娥奔月 brush-in
             (S03 + 1.28, S04 + 0.14, '嫦娥飞上了月亮。', 'Chang’e flew to the Moon.')]),      # 1.2 s min, ends as c04 begins
    dict(lang='en', mono=(S04 + 0.18, S05 - 0.02, '回不了家。', 'Unable to return home.'), bi=None),
    dict(lang='en', mono=(S05 + 0.25, S06 - 0.02, '公元726年，李白举头望月，写下了对故乡的思念。', 'In 726, Li Bai looked up at the Moon\nand wrote about missing home.'),
         bi=[(S05 + 0.25, S05 + 1.61, '公元726年，李白举头望月，', 'In 726, Li Bai looked up at the Moon'),
             (S05 + 1.63, S06 - 0.02, '写下了对故乡的思念。', 'and wrote about missing home.')]),
    dict(lang='en', mono=(T9 + 0.3, T11 - 0.02, '这一次，地球上所有的航天机构都要一起去。', 'This time, every space agency on Earth\nis going together.'),
         bi=[(T9 + 0.3, T9 + 2.0, '这一次，地球上所有的航天机构', 'This time, every space agency on Earth'),
             (T9 + 2.02, T11 - 0.02, '都要一起去。', 'is going together.')]),
    # closing inscription, Zhang Jiuling 张九龄《望月怀远》 — 海上生明月 brushes at S84+0.4, 天涯共此时 at S84+2.9
    dict(lang='zh', mono=(S84 + 0.4, DED - 0.02, '海上生明月，天涯共此时', 'The bright moon rises over the sea;\nhowever far apart, we share this moment.'),
         bi=[(S84 + 0.4, S84 + 2.9, '海上生明月，', 'The bright moon rises over the sea;'),
             (S84 + 2.92, DED - 0.02, '天涯共此时', 'however far apart, we share this moment.')]),
    # credits dedication (210.1 -> end of the mastered audio)
    dict(lang='en',
         mono=None,
         mono_en=[(DED, (DED + END) / 2 - 0.01, 'For everyone working far from\nthe people they love.'),
                  ((DED + END) / 2 + 0.01, END, 'Look up — they’re looking\nat the same moon.')],
         mono_zh=[(DED, (DED + END) / 2 - 0.01, '献给每一位在远方工作、思念家人的人。'),
                  ((DED + END) / 2 + 0.01, END, '抬头看看——他们望着的，是同一轮明月。')],
         bi=[(DED, DED + (END - DED) / 3 - 0.01, '献给每一位在远方工作、', 'For everyone working far from'),
             (DED + (END - DED) / 3 + 0.01, DED + 2 * (END - DED) / 3 - 0.01, '思念家人的人。抬头看看——', 'the people they love. Look up —'),
             (DED + 2 * (END - DED) / 3 + 0.01, END, '他们望着的，是同一轮明月。', 'they’re looking at the same moon.')]),
]

def ital(s): return '\n'.join(f'<i>{x}</i>' for x in s.split('\n'))

def build(mode):
    """mode: 'bi' | 'en' | 'zh' -> list of (t0, t1, text)"""
    cues = []
    for s in LYRICS:
        if mode == 'bi':
            first, second = (s['zh'], s['en']) if s['lang'] == 'zh' else (s['en'], s['zh'])
            cues.append([s['t0'], s['t1'], f'{first}\n{second}'])
        else:
            cues.append([s['t0'], s['t1'], s[mode]])
    for c in CARDS:
        if mode == 'bi':
            for (a, b, zh, en) in (c['bi'] or [c['mono']]):
                cues.append([a, b, f'{zh}\n{ital(en)}' if c['lang'] == 'zh' else f'{ital(en)}\n{zh}'])
        elif c.get('mono') is None:
            for (a, b, txt) in c['mono_' + mode]:
                cues.append([a, b, ital(txt) if mode == 'en' else txt])
        else:
            a, b, zh, en = c['mono']
            cues.append([a, b, ital(en) if mode == 'en' else zh])
    cues.sort(key=lambda c: c[0])
    # clip each end so it never overlaps the next cue; enforce the minimum length
    for i, c in enumerate(cues):
        if i + 1 < len(cues): c[1] = min(c[1], cues[i + 1][0] - GAP)
        c[1] = min(c[1], END)
        c[0], c[1] = round(c[0], 3), round(c[1], 3)
    check(cues, mode)
    return cues

def check(cues, mode):
    for i, (a, b, txt) in enumerate(cues):
        lines = txt.split('\n')
        assert len(lines) <= 2, (mode, txt)
        assert b - a >= MIN - 1e-6, (mode, a, b, txt)
        for ln in lines:
            plain = re.sub(r'</?i>', '', ln)
            if re.search(r'[A-Za-z]', plain) and not re.search(r'[一-鿿]', plain):
                assert len(plain) <= 42, (mode, len(plain), plain)
        if i: assert a >= cues[i - 1][1], (mode, 'overlap', a, cues[i - 1])

def ts(t, sep):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'

def write_srt(path, cues):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(f'{i}\n{ts(a, ",")} --> {ts(b, ",")}\n{t}\n' for i, (a, b, t) in enumerate(cues, 1)))

def write_vtt(path, cues):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('WEBVTT\n\n' + '\n'.join(f'{ts(a, ".")} --> {ts(b, ".")}\n{t}\n' for (a, b, t) in cues))

if __name__ == '__main__':
    bi = build('bi')
    write_srt(os.path.join(HERE, 'moongazing.zh-en.srt'), bi)
    write_vtt(os.path.join(HERE, 'moongazing.zh-en.vtt'), bi)
    write_srt(os.path.join(HERE, 'moongazing.en.srt'), build('en'))
    write_srt(os.path.join(HERE, 'moongazing.zh.srt'), build('zh'))
    print(f'ok: {len(bi)} bilingual cues, end {END:.3f} s')
