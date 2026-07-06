#!/usr/bin/env bash
set -euo pipefail

echo "🛡️ SHEIKHA RUNTIME PRODUCTION SAFE MODE V1"

export SHEIKHA_DISABLE_INLINE_CRON=1
export NODE_OPTIONS="--require ./runtime/preload/sheikha-production-safe-mode.js ${NODE_OPTIONS:-}"

node --check runtime/preload/sheikha-production-safe-mode.js
node --check server.js

pm2 restart sheikha-main-portal --update-env

RUNTIME_READY=0
for i in {1..60}; do
  STATUS=$(pm2 jlist | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const a=JSON.parse(d);const p=a.find(x=>x.name==='sheikha-main-portal');console.log(p?.pm2_env?.status || 'missing')})")

  echo "PM2 status: $STATUS"

  if [ "$STATUS" = "online" ] && curl -fsS http://127.0.0.1:8080/api/health >/dev/null; then
    echo "✅ Runtime health passed"
    RUNTIME_READY=1
    break
  fi

  sleep 2
done

if [ "$RUNTIME_READY" != "1" ]; then
  echo "❌ Runtime still unstable"
  pm2 logs sheikha-main-portal --lines 120 --nostream || true
  exit 1
fi

echo "✅ SHEIKHA RUNTIME PRODUCTION SAFE MODE PASSED"
