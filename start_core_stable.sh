#!/bin/bash
cd ~/Projects/sheikha/sheikha-main-portal
pkill -f sheikha_core_engine.py || true
sleep 1
# استخدم systemd guard لو موجود وإلا شغل مباشر
if systemctl --user is-active sheikha-core-engine 2>/dev/null; then
  systemctl --user restart sheikha-core-engine
else
  python3 sheikha_core_engine.py > logs/core_engine.log 2>&1 &
  echo $! > logs/core_engine.pid
fi
sleep 3
curl -s localhost:18082/api/health | jq .foundry_m2m_governance
