#!/usr/bin/env bash
# Round five: reread the hand-maintained cards, wait for v8, then build locally.
# Usage: bash release/review/build_page_r5.sh [FRAMEDIR] [--dry-run]
# No renderer/browser or publishing operation is invoked.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT"
exec .venv/bin/python release/review/build_page_r5.py "$@"
