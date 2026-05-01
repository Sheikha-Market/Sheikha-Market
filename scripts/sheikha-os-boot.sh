#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "============================================================"
echo "SHEIKHA OS CLOUD BOOT SEQUENCE"
echo "============================================================"

echo "[1/5] Verify partnerships signatures"
npm run -s ops:partnerships:verify

echo "[2/5] Dev performance tune"
npm run -s ops:dev:tune || true

echo "[3/5] Copilot doctor check"
npm run -s ops:dev:copilot:doctor || true

echo "[4/5] Boot Sheikha OS Cloud Engine"
node scripts/sheikha-os-cloud-engine.js

echo "[5/5] Render Sheikha OS Dashboard"
node scripts/sheikha-os-dashboard.js

echo "============================================================"
echo "SHEIKHA OS CLOUD READY"
echo "============================================================"
