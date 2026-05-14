#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f "tools/neural/sync-neural-cells.sh" ]]; then
  echo "Neural sync script not found at tools/neural/sync-neural-cells.sh"
  exit 1
fi

exec bash tools/neural/sync-neural-cells.sh "$@"
