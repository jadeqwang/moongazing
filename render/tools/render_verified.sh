#!/usr/bin/env bash
# Verify 24 fps JPG frames with two fresh renders and a third-pass majority vote.
# Usage: render/tools/render_verified.sh RANGE_A RANGE_B FRAMEDIR [SCALE=0.5] [WORKERS=3]
# FRAMEDIR is absolute or relative to render/, like tools/render.mjs.
# Exit 1 means unresolved/missing frames or a nonzero flicker_check result.
set -euo pipefail

if (( $# < 3 || $# > 5 )); then
  echo "Usage: $0 RANGE_A RANGE_B FRAMEDIR [SCALE=0.5] [WORKERS=3]" >&2
  exit 2
fi
RENDER_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
REPO_ROOT=$(cd -- "$RENDER_ROOT/.." && pwd)
PYTHON="$REPO_ROOT/.venv/bin/python"
RANGE_A=$1
RANGE_B=$2
SCALE=${4:-0.5}
WORKERS=${5:-3}

# Validate everything before deleting frames. Match render.mjs's frameRange.
CONFIG=$("$PYTHON" - "$RANGE_A" "$RANGE_B" "$3" "$SCALE" "$WORKERS" "$RENDER_ROOT" <<'PY'
import math, os, sys
try:
    a, b, scale = map(float, (sys.argv[1], sys.argv[2], sys.argv[4]))
    workers = int(sys.argv[5])
    if not all(map(math.isfinite, (a, b, scale))) or not 0 <= a < b or scale <= 0:
        raise ValueError('range must satisfy 0 <= A < B, and scale must be positive')
    if not 1 <= workers <= 4:
        raise ValueError('WORKERS must be an integer from 1 to 4')
    if not sys.argv[3].strip():
        raise ValueError('FRAMEDIR must not be empty')
    directory = os.path.abspath(os.path.join(sys.argv[6], sys.argv[3]))
    if '\n' in directory:
        raise ValueError('FRAMEDIR must not contain newlines')
    dirs = [directory, directory + '_B', directory + '_C']
    if len({os.path.realpath(d) for d in dirs}) != 3:
        raise ValueError('pass directories must be distinct')
    first, stop = math.ceil(a * 24 - 1e-6), math.ceil(b * 24 - 1e-6)
    if first >= stop:
        raise ValueError('range contains no frames')
    print(directory)
    print(first)
    print(stop)
except ValueError as e:
    sys.exit(f'Invalid arguments: {e}')
PY
)
mapfile -t CONFIG_LINES <<< "$CONFIG"
FRAMEDIR=${CONFIG_LINES[0]}
FIRST=${CONFIG_LINES[1]}
STOP=${CONFIG_LINES[2]}
FRAMEDIR_B="${FRAMEDIR}_B"
FRAMEDIR_C="${FRAMEDIR}_C"
EXPECTED=$((STOP - FIRST))
mkdir -p -- "$FRAMEDIR" "$FRAMEDIR_B" "$FRAMEDIR_C" "$FRAMEDIR/verification_logs"
RUN_LOGDIR=$(mktemp -d "$FRAMEDIR/verification_logs/run.XXXXXXXX")

# Delete only this range, in all three dirs; old C files cannot cast a vote.
"$PYTHON" - "$FIRST" "$STOP" "$FRAMEDIR" "$FRAMEDIR_B" "$FRAMEDIR_C" <<'PY'
import pathlib, re, sys
first, stop = map(int, sys.argv[1:3])
for directory in sys.argv[3:]:
    removed = 0
    for p in pathlib.Path(directory).iterdir():
        match = re.fullmatch(r'f_(\d+)\.(?:jpg|png)(?:\.part)?', p.name)
        if match and first <= int(match[1]) < stop:
            p.unlink()
            removed += 1
    print(f'cleaned {removed} existing range files from {directory}')
PY

# Decimal arithmetic prevents drifting chunk boundaries; chunks are [a,b).
# Offset pass B by half a chunk so fresh pages draw different first frames.
"$PYTHON" - "$RANGE_A" "$RANGE_B" "$RUN_LOGDIR" <<'PY'
from decimal import Decimal
import math, pathlib, sys
start, end = map(Decimal, sys.argv[1:3])
for name, first_size in [('A', 10), ('B', 5)]:
    a, size = start, first_size
    with (pathlib.Path(sys.argv[3]) / f'chunks_{name}.tsv').open('w') as out:
        while a < end:
            b = min(a + size, end)
            if math.ceil(float(a) * 24 - 1e-6) < math.ceil(float(b) * 24 - 1e-6):
                out.write(f'{a}\t{b}\n')
            a, size = b, 10
PY

missing_count() {
  "$PYTHON" - "$1" "$2" "$3" <<'PY'
import math, pathlib, sys
directory = pathlib.Path(sys.argv[1])
first, stop = (math.ceil(float(v) * 24 - 1e-6) for v in sys.argv[2:])
print(sum(not (p := directory / f'f_{i:06d}.jpg').is_file() or p.stat().st_size == 0
          for i in range(first, stop)))
PY
}

render_chunk() {
  local pass=$1 a=$2 b=$3 directory=$4 workers=$5
  local attempt rc missing logfile resume_args=()
  # First attempt always starts fresh. Only retries of this call use --resume.
  for attempt in 1 2 3; do
    logfile="$RUN_LOGDIR/${pass}_${a}-${b}_attempt${attempt}.log"
    printf '%s pass %s chunk %s-%s attempt %s workers=%s\n' \
      "$(date -Is)" "$pass" "$a" "$b" "$attempt" "$workers"
    rc=0
    (cd -- "$RENDER_ROOT" && node tools/render.mjs --frames "$a-$b" \
      --scale "$SCALE" --workers "$workers" --framedir "$directory" \
      "${resume_args[@]}") > "$logfile" 2>&1 || rc=$?
    missing=$(missing_count "$directory" "$a" "$b")
    printf 'pass %s chunk %s-%s: exit=%s missing=%s; log=%s\n' \
      "$pass" "$a" "$b" "$rc" "$missing" "$logfile"
    if (( missing == 0 )); then
      if (( rc != 0 )); then tail -n 12 -- "$logfile"; fi
      return 0
    fi
    tail -n 12 -- "$logfile"
    workers=1
    resume_args=(--resume)
  done
  echo "pass $pass chunk $a-$b still has $missing missing frames" >&2
  return 1
}

printf 'VERIFY_START range=%s-%s frames=%s scale=%s workers=%s logdir=%s\n' \
  "$RANGE_A" "$RANGE_B" "$EXPECTED" "$SCALE" "$WORKERS" "$RUN_LOGDIR"
for pass in A B; do
  directory=$FRAMEDIR
  if [[ $pass == B ]]; then directory=$FRAMEDIR_B; fi
  while IFS=$'\t' read -r a b; do
    render_chunk "$pass" "$a" "$b" "$directory" "$WORKERS" || true
  done < "$RUN_LOGDIR/chunks_${pass}.tsv"
done

DIFFERED=0
UNRESOLVED=0
REPAIRED=0
: > "$RUN_LOGDIR/differed.txt"
: > "$RUN_LOGDIR/unresolved.txt"
for ((i = FIRST; i < STOP; i++)); do
  printf -v name 'f_%06d.jpg' "$i"
  a_file="$FRAMEDIR/$name"
  b_file="$FRAMEDIR_B/$name"
  c_file="$FRAMEDIR_C/$name"
  if [[ -s $a_file && -s $b_file ]] && cmp -s -- "$a_file" "$b_file"; then
    continue
  fi
  DIFFERED=$((DIFFERED + 1))
  printf '%s\n' "$name" >> "$RUN_LOGDIR/differed.txt"
  # A one-frame [i/24,(i+1)/24) range, always with one worker.
  read -r a b < <("$PYTHON" - "$i" <<'PY'
import sys
i = int(sys.argv[1])
print(f'{i / 24:.12f} {(i + 1) / 24:.12f}')
PY
)
  render_chunk C "$a" "$b" "$FRAMEDIR_C" 1 || true
  if [[ -s $a_file && -s $c_file ]] && cmp -s -- "$a_file" "$c_file"; then
    printf 'RESOLVED %s %.6f s: A=C (kept A)\n' "$name" "$a"
    REPAIRED=$((REPAIRED + 1))
  elif [[ -s $b_file && -s $c_file ]] && cmp -s -- "$b_file" "$c_file"; then
    cp -- "$b_file" "$a_file"
    printf 'RESOLVED %s %.6f s: B=C (copied B to A)\n' "$name" "$a"
    REPAIRED=$((REPAIRED + 1))
  else
    printf 'UNRESOLVED %s %.6f s (no two nonempty passes agree)\n' "$name" "$a"
    printf '%s\n' "$name" >> "$RUN_LOGDIR/unresolved.txt"
    UNRESOLVED=$((UNRESOLVED + 1))
  fi
done

MISSING=$(missing_count "$FRAMEDIR" "$RANGE_A" "$RANGE_B")
FLICKER_RC=0
(cd -- "$REPO_ROOT" && .venv/bin/python render/tools/flicker_check.py \
  "$FRAMEDIR" --from "$RANGE_A" --to "$RANGE_B") \
  > "$RUN_LOGDIR/flicker_check.log" 2>&1 || FLICKER_RC=$?
cat -- "$RUN_LOGDIR/flicker_check.log"
FLICKER_RESULT=PASS
if (( FLICKER_RC == 1 )); then FLICKER_RESULT=FLAGGED; fi
if (( FLICKER_RC > 1 )); then FLICKER_RESULT=ERROR; fi
printf 'SUMMARY range=%s-%s frames_rendered=%s/%s passes=A,B differed=%s resolved=%s unresolved=%s missing=%s flicker_check=%s exit=%s\n' \
  "$RANGE_A" "$RANGE_B" "$((EXPECTED - MISSING))" "$EXPECTED" "$DIFFERED" \
  "$REPAIRED" "$UNRESOLVED" "$MISSING" "$FLICKER_RESULT" "$FLICKER_RC"
if (( UNRESOLVED > 0 || MISSING > 0 || FLICKER_RC != 0 )); then exit 1; fi
