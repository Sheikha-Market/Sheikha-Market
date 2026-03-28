#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_DIR="$BASE_DIR/reports/state-investments"

echo "==> تنظيف: $REPORT_DIR"

if [ ! -d "$REPORT_DIR" ]; then
  echo "المجلد غير موجود: $REPORT_DIR"
  exit 1
fi

find "$REPORT_DIR" -maxdepth 1 -type f -name 'sheikha-*.json' ! -name '*latest.json' -delete

echo "==> الملفات المتبقية:"
ls -lah "$REPORT_DIR"
