#!/bin/bash
set -e

# بسيط: نشر اختباري لبورصة شيخة في وضع sandbox
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

echo "Stopping existing pm2 processes named sheikha-exchange (if any)"
pm run ops:bg-guard:pm2:stop || true

echo "Starting exchange (demo) with node"
# تشغيل المثال فقط (لا يصلح للإنتاج)
nohup node examples/exchange-mvp.js > logs/exchange-mvp.log 2>&1 &
echo $! > tmp/exchange-mvp.pid

echo "Exchange demo started (PID $(cat tmp/exchange-mvp.pid))"
