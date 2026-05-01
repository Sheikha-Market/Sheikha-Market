#!/usr/bin/env bash
set -e

echo "== SHEIKHA PRODUCTION READINESS =="

echo "[1] API smoke"
bash scripts/sheikha-smoke-test.sh http://127.0.0.1:8080

echo "[2] PM2"
pm2 list

echo "[3] ports"
ss -lntp | grep -E ':8080|:8081|:80|:443' || true

echo "[4] nginx"
command -v nginx >/dev/null && nginx -t || echo "nginx not ready"

echo "[5] disk"
df -h /

echo "[6] git"
git log --oneline -n 5
git status --short

echo "✅ READINESS CHECK COMPLETE"
