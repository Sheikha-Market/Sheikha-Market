#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "== SHEIKHA VS CODE ACTIVATION =="

node --check server.js

bash tools/runtime/update-fingerprint.sh

pm2 restart sheikha-main-portal --update-env

sleep 3

echo "== Health =="
curl -s http://127.0.0.1:8080/api/health; echo

echo "== Runtime =="
curl -s http://127.0.0.1:8080/api/runtime; echo

echo "== Root Neural Cells =="
curl -s http://127.0.0.1:8080/api/root-neural-cells/status; echo

echo "== Consulting =="
curl -s http://127.0.0.1:8080/api/consulting/status; echo

echo "SHEIKHA VS CODE POWER READY"
