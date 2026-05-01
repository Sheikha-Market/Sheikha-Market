#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Activating partnership framework"
npm run -s ops:partnerships:activate

echo "[2/4] Generating Tier 1 contract package"
npm run -s ops:partnerships:contract:tier1

echo "[3/4] Generating Tier 2 contract package"
npm run -s ops:partnerships:contract:tier2

echo "[4/4] Generating Tier 3 contract package"
npm run -s ops:partnerships:contract:tier3

echo
echo "Done: Full partnerships pipeline executed."
echo "Output directory: $ROOT_DIR/reports/partnerships"
echo "Next (optional secure seal): npm run ops:partnerships:sign"
