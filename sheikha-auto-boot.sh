#!/usr/bin/env bash
cd "/home/sheikha/Projects/sheikha/sheikha-main-portal"
if ! ss -ltn | grep -q ":18082 "; then
  nohup node server.js >/dev/null 2>&1 &
fi
echo "[$(date -Iseconds)] SHEIKHA_KERNEL_V310_AUTO_BOOT_ACTIVE (Ports 8080/18080/18082)" >> "/home/sheikha/Projects/sheikha/sheikha-main-portal/boot_usb/autoboot.log"
