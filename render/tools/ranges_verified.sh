#!/bin/bash
# Round five: re-render passages of the retimed cut into render/out/frames_v8_540, each range rendered twice and
# compared by render_verified.sh.  bash render/tools/ranges_verified.sh FIRST-LAST [FIRST-LAST ...]  (frame numbers, inclusive)
# OUT and SCALE choose the size: default out/frames_v8_540 at 0.5; for 1080p  OUT=out/frames_v8_1080 SCALE=1 bash ...
# TMPDIR is on disk: on Oct 9 /tmp (a 16 GB tmpfs) was full and Chrome crashed at start with more than one worker.
set -uo pipefail
cd "$(dirname "$0")/../.."
mkdir -p render/out/tmp; export TMPDIR="$PWD/render/out/tmp"
LOG=render/out/v8_render.log
OUT=${OUT:-out/frames_v8_540}; SCALE=${SCALE:-0.5}
for r in "$@"; do
  f0=${r%-*}; f1=${r#*-}
  a=$(python3 -c "print(f'{max(0,($f0-0.5)/24):.6f}')"); b=$(python3 -c "print(f'{($f1+0.5)/24:.6f}')")   # half a frame either side: exact frame times can round across a frame
  echo "$(date -Is) RANGE $r ($a-$b s) $OUT start" >> $LOG
  bash render/tools/render_verified.sh $a $b $OUT $SCALE 3 >> $LOG 2>&1
  echo "$(date -Is) RANGE $r exit=$?" >> $LOG
done
echo "$(date -Is) V8_RANGES_DONE $*" >> $LOG
