#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INPUT="${1:-}"
MODE="${2:-}"
[[ -n "$INPUT" ]] || { echo "Usage: $0 <state.json> [--outer-only]" >&2; exit 1; }
if [[ "$MODE" == "--outer-only" ]]; then
  exec python3 "$ROOT/tools/project-state/record-sheikha-project-state.py" --input "$INPUT" --outer-only
fi
exec python3 "$ROOT/tools/project-state/record-sheikha-project-state.py" --input "$INPUT" --repo-root "$ROOT"
