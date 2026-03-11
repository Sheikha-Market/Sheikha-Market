#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8080}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/api/sheikha/status}"
APP_LOG="${APP_LOG:-/tmp/sheikha-dev-nocursor.log}"

source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true

kill_port_if_busy() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti :"$PORT" | xargs -r kill -9 || true
        return
    fi

    if command -v fuser >/dev/null 2>&1; then
        fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
        return
    fi

    if command -v ss >/dev/null 2>&1; then
        local pids
        pids="$(ss -ltnp "( sport = :${PORT} )" 2>/dev/null | awk -F'pid=' 'NR>1{split($2,a,","); if(a[1]!="") print a[1]}' | sort -u)"
        if [ -n "$pids" ]; then
            kill -9 $pids >/dev/null 2>&1 || true
        fi
    fi
}

wait_for_health() {
    for _ in {1..45}; do
        if curl -sS -m 3 "$HEALTH_URL" >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
    done
    return 1
}

echo "[1/4] تفعيل حارس الملكية الصارم (PM2)"
npm run ops:ip:proof:pm2:start:strict >/dev/null

echo "[2/4] تحرير المنفذ ${PORT}"
kill_port_if_busy

echo "[3/4] تشغيل البوابة (No Cursor)"
nohup env NODE_ENV=development SECURITY_STRICT_SECRETS=false npm start >"$APP_LOG" 2>&1 &

echo "[4/4] التحقق الصحي"
if wait_for_health; then
    echo "✅ التفعيل الشامل ناجح"
    curl -sS -m 8 "$HEALTH_URL" | head -c 220 && echo
    echo "log: $APP_LOG"
    exit 0
fi

echo "❌ فشل التحقق الصحي بعد الانتظار"
tail -n 80 "$APP_LOG" || true
exit 1
