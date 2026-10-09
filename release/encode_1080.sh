#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
export TMPDIR="$ROOT/render/out/tmp"
mkdir -p -- "$TMPDIR"
exec "$ROOT/.venv/bin/python" -B "$ROOT/release/encode_1080.py" "$@"
