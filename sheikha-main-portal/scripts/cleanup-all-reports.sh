#!/usr/bin/env bash
set -e

BASE="$(cd "$(dirname "$0")/.." && pwd)"

echo "== تنظيف جميع التقارير =="

find "$BASE/reports/state-investments" -type f -name '*.json' ! -name '*latest.json' -delete 2>/dev/null
find "$BASE/reports/education" -type f -name '*.json' ! -name '*latest.json' -delete 2>/dev/null
find "$BASE/reports/servers/academy-connectors" -type f -name '*.json' ! -name '*latest.json' -delete 2>/dev/null

echo "تم التنظيف بنجاح"
