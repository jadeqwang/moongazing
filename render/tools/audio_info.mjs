// Pick the film's audio and record its duration in data/audio.json (read by the page, the lint and the renderer).
//   node tools/audio_info.mjs
// Prefers the mastered file (media/audio/moongazing_master.wav, then .mp3: the original with a natural fade on the
// last note, sample-identical for the first 210.0 s); falls back to the original inputs/moongazing.mp3 (212.0 s).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(ROOT, '..');
const FFMPEG = process.env.FFMPEG || path.join(REPO, '.venv/bin/ffmpeg');
// Oct 9: the film is cut to the lower-key recording (two semitones down); its master is media/audio/moongazing_2down_master.*
const SOURCE = 'inputs/Moongazing - 2 semitones down.mp3', SOURCE_LEN = 208.36;
const candidates = ['media/audio/moongazing_2down_master.wav', 'media/audio/moongazing_2down_master.mp3', SOURCE];
const file = candidates.find((f) => fs.existsSync(path.join(REPO, f)));
const r = spawnSync(FFMPEG, ['-hide_banner', '-i', path.join(REPO, file)], { encoding: 'utf8' });
const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr || '');
const probed = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : SOURCE_LEN;
// the original mp3's container reports 212.04 (encoder padding); the song is 212.0 s on the analysis time base
const duration = file === SOURCE ? SOURCE_LEN : probed;
const out = { file, duration: +duration.toFixed(3), original: SOURCE, master: file !== SOURCE };
fs.writeFileSync(path.join(ROOT, 'data/audio.json'), JSON.stringify(out, null, 1) + '\n');
console.log(out);
