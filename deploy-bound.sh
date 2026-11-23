#!/bin/bash
set +H
set -e
echo "=== SHEIKHA BOUND DEPLOY - نظام النشر باسم شيخة 741/5741/12464 ==="
cd ~/Projects/sheikha/sheikha-main-portal
echo "[1/5] Building GUARD+LEDGER+WATCH+SUP+SHP+LDAP+DxO+HOSTING BOUND..."
ls routes/sheikha-hosting.js routes/sheikha-sup.js routes/sheikha-shp.js server.js > /dev/null
echo "[2/5] Upload to VPS 949321 31.97.190.74..."
scp routes/sheikha-*.js root@31.97.190.74:~/sheikha-main-portal/routes/
scp public/real-value.html public/shp.html root@31.97.190.74:~/sheikha-main-portal/public/ 2>/dev/null || true
scp server.js root@31.97.190.74:~/sheikha-main-portal/
scp -r exports/ root@31.97.190.74:~/sheikha-main-portal/ 2>/dev/null || true
echo "[3/5] Restart systemd BOUND (better than pm2)..."
ssh root@31.97.190.74 "systemctl restart sheikha-bound; sleep 3; systemctl status sheikha-bound --no-pager | head -10; curl -s http://127.0.0.1:18080/api/status; echo; curl -s http://127.0.0.1:80/api/status"
echo "[4/5] Test Production..."
sleep 3
curl -s https://api.sheikha.top/api/status | python3 -m json.tool
curl -s https://api.sheikha.top/api/sheikha-unified/hosting | python3 -m json.tool | head -50
echo "[5/5] BOUND DONE - 741/5741/12464 - غرسها من شيخه"
