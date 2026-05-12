#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# بسم الله — مزامنة ملفات شيخة v4 للسيرفر
# المالك: سلمان أحمد سلمان الراجح
# الاستخدام: bash scripts/sync-to-vps.sh [IP_ADDRESS]
# ═══════════════════════════════════════════════════════════════
SERVER="${1:-31.97.190.74}"
REMOTE_DIR="/root/sheikha"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "📡 مزامنة المشروع → root@$SERVER:$REMOTE_DIR"

rsync -avz --progress \
  --exclude 'node_modules/' \
  --exclude '.git/' \
  --exclude '*.backup*' \
  --exclude 'logs/' \
  --include 'sheikha-v4.js' \
  --include 'ecosystem.sheikha-v4.config.js' \
  --include 'package.json' \
  --include 'scripts/' \
  --include 'scripts/**' \
  "$LOCAL_DIR/" \
  "root@$SERVER:$REMOTE_DIR/"

echo ""
echo "✅ المزامنة اكتملت"
echo ""
echo "الخطوة التالية — على السيرفر:"
echo "  ssh root@$SERVER"
echo "  cd $REMOTE_DIR"
echo "  export SHEIKHA_JWT_SECRET=\$(openssl rand -hex 32)"
echo "  export SHEIKHA_OWNER_PASSWORD='كلمة_مرور_قوية'"
echo "  bash scripts/deploy-vps-full.sh"
