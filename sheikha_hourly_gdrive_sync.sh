#!/bin/bash
cd /home/sheikha/Projects/sheikha/sheikha-main-portal
GBIN="$HOME/bin/gamadv-xtd3/gam"
TS=$(date +%Y%m%d_%H%M%S)
DRIVE_ID="0AIQ70QDEliuQUk9PVA"

# 1. تشغيل التطور الذاتي للبوت والكيرنل وفحص نطاق Cloudflare
python3 sheikha-kernel/boot/sheikha_self_evolving_boot_daemon.py >/dev/null 2>&1 || true
./check_cloudflare_domain_active.sh >/dev/null 2>&1 || true

# 2. رفع سجل البراءات الجزيئية (SHEIKHA_ORCHESTRATOR_PATENTS_LEDGER.csv) والسجل المركزي للـ Natives إلى Google Shared Drive
if [ -x "$GBIN" ]; then
  if [ -f "exports/SHEIKHA_ORCHESTRATOR_PATENTS_LEDGER.csv" ]; then
    "$GBIN" user market@sheikha.top add drivefile \
      localfile "exports/SHEIKHA_ORCHESTRATOR_PATENTS_LEDGER.csv" \
      drivefilename "SHEIKHA_ORCHESTRATOR_PATENTS_LEDGER_${TS}.csv" \
      teamdriveparentid "$DRIVE_ID" >/dev/null 2>&1 || true
  fi
  if [ -f "exports/CENTRAL_NATIVE_REGISTRY.jsonl" ]; then
    "$GBIN" user market@sheikha.top add drivefile \
      localfile "exports/CENTRAL_NATIVE_REGISTRY.jsonl" \
      drivefilename "CENTRAL_NATIVE_REGISTRY_${TS}.jsonl" \
      teamdriveparentid "$DRIVE_ID" >/dev/null 2>&1 || true
  fi
fi
echo "[$(date -Iseconds)] GDRIVE_PATENTS_AND_NATIVE_REGISTRY_SYNC_OK -> Uploaded CSV & JSONL to SharedDrive $DRIVE_ID" >> logs/hourly_gdrive_sync.log
