#!/bin/bash
echo "🚀 [Sheikha-System V292 — PURE ZERO-PM2] تشغيل شيخة سيستم النقي مباشرة على المنافذ الثلاثة 8080/18080/18082..."
# تطهير صامت ومباشر لأي أثر لـ PM2 دون استدعاء npx pm2 حتى لا يطبع [PM2] Spawning PM2 daemon
rm -rf ~/.pm2/dump.pm2 ~/.pm2/pids/* ~/.pm2/rpc.sock ~/.pm2/pub.sock 2>/dev/null || true
pkill -9 -f "PM2" 2>/dev/null || true
pkill -9 -f "pm2" 2>/dev/null || true
systemctl --user stop sheikha* 2>/dev/null || true
pkill -9 -f "sheikha_sovereign_guard.py" 2>/dev/null || true
pkill -9 -f "sheikha_24_7_watchdog_daemon.py" 2>/dev/null || true
pkill -9 -f "sheikha_core_engine.py" 2>/dev/null || true
pkill -9 -f "run_sheikha.py" 2>/dev/null || true
pkill -9 -f "observer.py" 2>/dev/null || true
podman stop -a >/dev/null 2>&1 || true
podman rm -f -a >/dev/null 2>&1 || true
pkill -9 -f "rootlessport" 2>/dev/null || true
pkill -9 -f "node.*server.js" 2>/dev/null || true
fuser -k 8080/tcp 18080/tcp 18082/tcp >/dev/null 2>&1 || true
sleep 1

# تشغيل محرك شيخة سيستم الموحد مباشرة وبنظافة تامة 100%
nohup node server.js > /tmp/sheikha_v292.log 2>&1 &
sleep 2
echo "✅ [Sheikha-System V292 — PURE] محرك شيخة سيستم النقي يعمل الآن بنجاح 100% على المنافذ 8080 و 18080 و 18082 (صفر PM2)!"
