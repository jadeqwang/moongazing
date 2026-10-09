#!/bin/bash
# Round five: re-render passages of the retimed cut into render/out/frames_v8_540, each range rendered twice and
# compared by render_verified.sh.  bash render/tools/ranges_verified.sh FIRST-LAST [FIRST-LAST ...]  (frame numbers, inclusive)
# TMPDIR is on disk: on Oct 9 /tmp (a 16 GB tmpfs) was full and Chrome crashed at start with more than one worker.
set -uo pipefail
cd "$(dirname "$0")/../.."
mkdir -p render/out/tmp; export TMPDIR="$PWD/render/out/tmp"
LOG=render/out/v8_render.log
for r in "$@"; do
  f0=${r%-*}; f1=${r#*-}
  a=$(python3 -c "print(f'{($f0-0.5)/24:.6f}')"); b=$(python3 -c "print(f'{($f1+0.5)/24:.6f}')")   # half a frame either side: exact frame times can round across a frame
  echo "$(date -Is) RANGE $r ($a-$b s) start" >> $LOG
  bash render/tools/render_verified.sh $a $b out/frames_v8_540 0.5 3 >> $LOG 2>&1
  echo "$(date -Is) RANGE $r exit=$?" >> $LOG
done
echo "$(date -Is) V8_RANGES_DONE $*" >> $LOG
