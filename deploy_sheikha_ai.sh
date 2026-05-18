#!/bin/bash
set -e

# متغيرات خادم الـ VPS الخاص بمشروع شيخة
VPS_IP="31.97.190.74"
VPS_USER="root"
DEPLOY_DIR="/opt/sheikha/current/sheikha-ai-cluster"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/sheikha_vps}"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 [شيخة AI] البدء في تجهيز حزمة النشر لـ VPS..."

# إنشاء مجلد مؤقت محلي بمعرّف فريد لتجنب التعارض
LOCAL_TMP="/tmp/sheikha_ai_build_$$"
mkdir -p "$LOCAL_TMP"
cd "$LOCAL_TMP"

# خيارات SSH (استخدام مفتاح خاص إن وُجد)
SSH_OPT="-o StrictHostKeyChecking=no -o ConnectTimeout=15"
[ -f "$SSH_KEY" ] && SSH_OPT="$SSH_OPT -i $SSH_KEY"

# 1. نسخ ملفات المشروع المحلية
echo "📋 نسخ ملفات المشروع..."
cp "$PROJECT_DIR/php-ai-cluster/app.py"            .
cp "$PROJECT_DIR/php-ai-cluster/restore.py"        .
cp "$PROJECT_DIR/php-ai-cluster/prometheus.yml"    .
cp "$PROJECT_DIR/php-ai-cluster/alert.rules.yml"   .
cp "$PROJECT_DIR/php-ai-cluster/alertmanager.yml"  .

# 2. إنشاء docker-compose للـ VPS (مسارات Docker الصحيحة داخل الحاوية)
cat << 'DCOMPOSE' > docker-compose.yml
services:
  ai_server:
    image: python:3.10-slim
    container_name: sheikha_ai_server
    working_dir: /app
    ports:
      - "8000:8000"
    volumes:
      - .:/app
      - ./data/php_ai_vector_db:/app/data/php_ai_vector_db
      - ./data/backups:/app/data/backups
    restart: always
    environment:
      - CHROMA_DATA_DIR=/app/data/php_ai_vector_db
      - BACKUP_DIR=/app/data/backups
    command: >
      sh -c "pip install --no-cache-dir fastapi uvicorn chromadb pydantic
             prometheus-fastapi-instrumentator apscheduler &&
             uvicorn app:app --host 0.0.0.0 --port 8000 --workers 2"
  prometheus:
    image: prom/prometheus:latest
    container_name: sheikha_prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert.rules.yml:/etc/prometheus/alert.rules.yml
    ports:
      - "9090:9090"
    restart: always
  grafana:
    image: grafana/grafana:latest
    container_name: sheikha_grafana
    ports:
      - "3000:3000"
    restart: always
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GF_SECURITY_ADMIN_PASSWORD:-sheikha_secure_pass_2026}
DCOMPOSE

echo "✅ الملفات جاهزة في $LOCAL_TMP"

# 3. إنشاء مجلدات البيانات على السيرفر قبل الرفع
echo "🚚 إعداد مجلدات السيرفر وبدء رفع الملفات..."
ssh $SSH_OPT "$VPS_USER@$VPS_IP" \
    "mkdir -p $DEPLOY_DIR/data/{php_ai_vector_db,backups}"

# 4. رفع الملفات إلى السيرفر السحابي عبر SCP
scp $SSH_OPT -r "$LOCAL_TMP/"* "$VPS_USER@$VPS_IP:$DEPLOY_DIR/"

# 5. تشغيل المنظومة على السيرفر عبر SSH (docker compose v2)
echo "⚡ جاري إقلاع الحاويات على السيرفر..."
ssh $SSH_OPT "$VPS_USER@$VPS_IP" \
    "cd $DEPLOY_DIR && docker compose down 2>/dev/null || true && docker compose up -d"

# تنظيف المجلد المؤقت المحلي
rm -rf "$LOCAL_TMP"

echo ""
echo "##############################################################"
echo "🎉 تم النشر بنجاح على سيرفر شيخة VPS!"
echo "📍 API + Docs:  http://$VPS_IP:8000/docs"
echo "📍 Prometheus:  http://$VPS_IP:9090"
echo "📍 Grafana:     http://$VPS_IP:3000  (admin / sheikha_secure_pass_2026)"
echo ""
echo "🧪 اختبر الاتصال بعد الإقلاع:"
echo "   curl -X POST http://$VPS_IP:8000/v1/chat \\"
echo "     -H 'X-AI-Engine-Key: \$AI_ENGINE_API_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"question\":\"store function in Laravel\"}'"
echo "##############################################################"
