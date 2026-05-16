#!/usr/bin/env bash
set -euo pipefail

echo "SHEIKHA RUNTIME CHECK"
echo "====================="
date -u
echo

echo "[1] Git"
git branch --show-current || true
git status --short --branch || true

echo
echo "[2] Node syntax"
node --check server.js

echo
echo "[3] PM2"
pm2 ls || true

echo
echo "[4] Health"
for path in /api/live /api/server/health /api/accounts/summary /api/health; do
	code="$(curl -s -o /tmp/sheikha-health.json -w '%{http_code}' "http://127.0.0.1:8080${path}" || true)"
	echo "- ${path} => HTTP ${code}"
	if [[ "${code}" == "200" ]]; then
		head -c 220 /tmp/sheikha-health.json; echo
	fi
done

echo
echo "Runtime check completed."
