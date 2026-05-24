#!/usr/bin/env bash
set -Eeuo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " SHEIKHA RUNTIME REPAIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo
echo "1) PM2 STATUS"
pm2 status || true

echo
echo "2) PORT CHECK"
ss -lntp | grep 8080 || true
ss -lntp | grep 11434 || true

echo
echo "3) OLLAMA CHECK"
if curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; then
    echo "✅ Ollama online"
else
    echo "❌ Ollama offline"
    systemctl --user restart ollama || true
    sleep 5
fi

echo
echo "4) RESTART MAIN PORTAL"
pm2 restart sheikha-main-portal --update-env || true
sleep 8

echo
echo "5) HEALTH TEST"

echo
echo "---- /api/health ----"
curl -fsS http://127.0.0.1:8080/api/health | jq || true

echo
echo "---- /api/runtime-root/health ----"
curl -fsS http://127.0.0.1:8080/api/runtime-root/health | jq || true

echo
echo "---- /api/sheikha/ai-gateway/status ----"
curl -fsS http://127.0.0.1:8080/api/sheikha/ai-gateway/status | jq || true

echo
echo "6) PM2 LOGS (LAST 40)"
pm2 logs sheikha-main-portal --lines 40 --nostream || true

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " REPAIR COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
