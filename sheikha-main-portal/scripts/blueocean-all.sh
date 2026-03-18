#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/3] Blue Ocean + SaaS activation"
npm run -s ops:cloud:blueocean:activate

echo "[2/3] Partnerships secure pipeline"
npm run -s ops:partnerships:all:secure

echo "[3/3] Final unified report"
node scripts/blueocean-saas-final-report.js

echo
echo "Done: Blue Ocean + SaaS + Partnerships unified flow completed."
echo "Output: $ROOT_DIR/reports/final/sheikha-blueocean-saas-final-latest.json"
