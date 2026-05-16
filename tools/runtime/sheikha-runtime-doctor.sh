#!/usr/bin/env bash

echo "SHEIKHA RUNTIME DOCTOR"
echo "======================"

echo
echo "[PM2]"
pm2 status

echo
echo "[PORT 8080]"
ss -ltnp | grep ':8080' || true

echo
echo "[HEALTH]"
curl -s http://127.0.0.1:8080/api/health || true
echo

echo "[PROCESS]"
pm2 jlist | grep sheikha-main-portal | head

echo
echo "[GIT]"
git branch --show-current
git status --short
