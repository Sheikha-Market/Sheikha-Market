#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-status}"

CANDIDATES=(
  "$PWD"
  "$PWD/sheikha-main-portal"
  "/workspaces/sheikha/sheikha-main-portal"
  "$HOME/Projects/sheikha/sheikha-main-portal"
  "$HOME/sheikha-main-portal"
)

FOUND=""
for d in "${CANDIDATES[@]}"; do
  if [[ -f "$d/scripts/sheikha-protection-runner.sh" ]]; then
    FOUND="$d"
    break
  fi
done

if [[ -z "$FOUND" ]]; then
  FOUND=$(find "$HOME" -maxdepth 6 -type f -path "*/sheikha-main-portal/scripts/sheikha-protection-runner.sh" 2>/dev/null | head -n 1 | sed 's#/scripts/sheikha-protection-runner.sh##') || true
fi

if [[ -z "${FOUND:-}" ]]; then
  echo "[Sheikha] لم يتم العثور على sheikha-main-portal تلقائيا."
  echo "جرّب الدخول للمشروع ثم شغّل: bash scripts/sheikha-protection-runner.sh $MODE"
  exit 1
fi

echo "[Sheikha] Project detected: $FOUND"
exec bash "$FOUND/scripts/sheikha-protection-runner.sh" "$MODE"
