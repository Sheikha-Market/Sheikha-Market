#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-31.97.190.74}"
VPS_USER="${VPS_USER:-root}"
VPS_PATH="${VPS_PATH:-/opt/sheikha/current}"
BRANCH="${BRANCH:-stable/runtime-baseline}"

echo "== SHEIKHA VPS DEPLOY START =="

echo "[1/7] Local neural gate"
bash scripts/neural-gate.sh http://127.0.0.1:8080

echo "[2/7] Push latest branch"
git push origin "$BRANCH"

echo "[3/7] Remote fetch/reset"
ssh ${VPS_USER}@${VPS_HOST} "
cd ${VPS_PATH} && \
git fetch origin ${BRANCH} && \
git reset --hard origin/${BRANCH}
"

echo "[4/7] Install production dependencies"
ssh ${VPS_USER}@${VPS_HOST} "
cd ${VPS_PATH} && \
npm install --omit=dev
"

echo "[5/7] Restart PM2"
ssh ${VPS_USER}@${VPS_HOST} "
cd ${VPS_PATH} && \
SHEIKHA_APP_CWD=${VPS_PATH} pm2 restart ecosystem.config.js --update-env && \
pm2 save --force
"

echo "[6/7] Remote neural gate"
ssh ${VPS_USER}@${VPS_HOST} "
cd ${VPS_PATH} && \
bash scripts/neural-gate.sh http://127.0.0.1:8080
"

echo "[7/7] Deploy log"
echo \"$(date -u +%FT%TZ) DEPLOY_OK\" >> deploy-logs/deploy-history.log

echo "== SHEIKHA VPS DEPLOY SUCCESS =="
