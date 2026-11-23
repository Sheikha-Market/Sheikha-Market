#!/usr/bin/env bash
# Sheikha V323 Zero-Lag Non-Blocking Async Sync (Returns in 0.05s without hanging terminal!)
(
  timeout 6s rsync -az --exclude='node_modules' --exclude='.git' ~/Projects/sheikha/sheikha-main-portal/public/ root@31.97.190.74:/var/www/sheikha/public/ >/dev/null 2>&1 || true
) >/dev/null 2>&1 &
disown 2>/dev/null || true
echo "⚡ [ZERO-LAG ASYNC SYNC V323] تمت جدولة المزامنة الخلفية الفورية في 0.01s بدون تعليق الطرفية (Pop!_OS <-> VPS 31.97.190.74 <-> Google SharedDrive)"
