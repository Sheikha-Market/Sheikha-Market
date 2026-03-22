#!/usr/bin/env bash
set -euo pipefail

# مشغل موحد للحماية يعمل من أي مسار
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE="${1:-status}"

cd "$PROJECT_ROOT"

case "$MODE" in
  restore)
    echo "[Sheikha] Running restore protection mode..."
    node scripts/restore-protection-mode.js
    ;;
  watch)
    echo "[Sheikha] Running protection watch (continuous)..."
    node scripts/protection-watch.js
    ;;
  full)
    echo "[Sheikha] Running restore then watch..."
    node scripts/restore-protection-mode.js
    node scripts/protection-watch.js
    ;;
  status)
    echo "[Sheikha] Project root: $PROJECT_ROOT"
    ls scripts/restore-protection-mode.js scripts/protection-watch.js >/dev/null
    echo "[Sheikha] Scripts found: OK"
    ;;
  *)
    echo "Usage:"
    echo "  bash $0 restore   # restore protection cycle once"
    echo "  bash $0 watch     # continuous protection watch"
    echo "  bash $0 full      # restore then watch"
    echo "  bash $0 status    # check setup"
    exit 1
    ;;
esac
