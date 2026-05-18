#!/bin/bash
set -e

# متغيرات خادم الـ VPS الخاص بمشروع شيخة
VPS_IP="31.97.190.74"
VPS_USER="root"
DEPLOY_DIR="/opt/sheikha/current/sheikha-ai-cluster"

echo "📦 [شيخة AI] البدء في تجهيز حزمة النشر لـ VPS..."

# إنشاء مجلد مؤقت محلي لتجميع ملفات السيرفر السحابي قبل رفعها
LOCAL_TMP="/tmp/sheikha_ai_build"
mkdir -p $LOCAL_TMP
cd $LOCAL_TMP

# 1. إنشاء ملف app.py (الـ API المطور والأتمتة وقاعدة المتجهات)
cat << 'EOF' > app.py
import os, tarfile, datetime, shutil
from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
import chromadb
from starlette.status import HTTP_403_FORBIDDEN
from prometheus_fastapi_instrumentator import Instrumentator
from apscheduler.schedulers.background import BackgroundScheduler

app = FastAPI(title="Sheikha Main Portal - Cloud AI Engine", version="10.0.0")
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

SOURCE_DIR = "/app/data/php_ai_vector_db"
BACKUP_DIR = "/app/data/backups"
MAX_BACKUPS = 7

chroma_client = chromadb.PersistentClient(path=SOURCE_DIR)
code_collection = chroma_client.get_or_create_collection(name="sheikha_production_codebase")

API_KEY_NAME = "X-AI-Engine-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
VALID_API_KEYS = {"sk_live_php_hyper_engine_secret_key_2026_prod"}

async def get_api_key(api_key_header: str = Depends(api_key_header)):
    if api_key_header in VALID_API_KEYS: return api_key_header
    raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Invalid API Key Header.")

def create_backup():
    if not os.path.exists(SOURCE_DIR): return
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"sheikha_ai_db_{timestamp}.tar.gz")
    try:
        with tarfile.open(backup_path, "w:gz") as tar:
            tar.add(SOURCE_DIR, arcname=os.path.basename(SOURCE_DIR))
        backups = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith(".tar.gz")]
        backups.sort(key=os.path.getmtime)
        while len(backups) > MAX_BACKUPS: os.remove(backups.pop(0))
    except Exception: pass

scheduler = BackgroundScheduler()
scheduler.add_job(create_backup, 'cron', hour=2, minute=0)
scheduler.start()

class QueryRequest(BaseModel):
    question: str

@app.post("/v1/chat")
async def chat_with_codebase(data: QueryRequest, api_key: str = Depends(get_api_key)):
    try:
        results = code_collection.query(query_texts=[data.question], n_results=1)
        if results and results['documents'] and results['documents']:
            return {"answer": "وجد نظام شيخة تطابقاً برمجياً في الكود الحركي:", "raw_code": results['documents']}
        return {
            "answer": "لم أجد تطابقاً مباشراً، إليك الكود القياسي المعتمد لبوابة شيخة الرئيسية:",
            "raw_code": "public function store(Request $request)\n{\n    $validated = $request->validate(['status' => 'required']);\n    return response()->json($validated, 201);\n}"
        }
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
EOF

# 2. إنشاء ملف الأوركسترا للتشغيل السحابي (docker-compose.yml)
cat << 'EOF' > docker-compose.yml
version: '3.8'
services:
  ai_server:
    image: python:3.10-slim
    container_name: sheikha_ai_server
    working_dir: /app
    ports:
      - "8000:8000"
    volumes:
      - .:/app
      - ./php_ai_vector_db:/app/data/php_ai_vector_db
      - ./backups:/app/data/backups
    restart: always
    command: >
      sh -c "pip install --no-cache-dir fastapi uvicorn chromadb pydantic torch prometheus-fastapi-instrumentator apscheduler --extra-index-url https://pytorch.org &&
             uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4"
  prometheus:
    image: prom/prometheus:latest
    container_name: sheikha_prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
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
      - GF_SECURITY_ADMIN_PASSWORD=sheikha_secure_pass_2026
EOF

# 3. إنشاء ملف إعدادات بروميثيوس للمراقبة (prometheus.yml)
cat << 'EOF' > prometheus.yml
global:
  scrape_interval: 5s
scrape_configs:
  - job_name: 'sheikha_ai_metrics'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['ai_server:8000']
EOF

# 4. سكربت الاسترجاع والإنقاذ بلمح البصر (restore.py)
cat << 'EOF' > restore.py
import os, tarfile, shutil
SOURCE_DIR = "/app/data/php_ai_vector_db"
BACKUP_DIR = "/app/data/backups"
def run_recovery():
    if not os.path.exists(BACKUP_DIR) or not os.listdir(BACKUP_DIR): return
    backups = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith(".tar.gz")]
    backups.sort(key=os.path.getmtime)
    if os.path.exists(SOURCE_DIR): shutil.rmtree(SOURCE_DIR)
    with tarfile.open(backups[-1], "r:gz") as tar: tar.extractall(path="/app/data")
    print("✅ Sheikha Database Restored!")
if __name__ == "__main__": run_recovery()
EOF

# 5. رفع الملفات إلى السيرفر السحابي المذكور عبر SCP
echo "🚚 جاري نقل الملفات عبر الشبكة الآمنة إلى سيرفر شيخة VPS..."
ssh $VPS_USER@$VPS_IP "mkdir -p $DEPLOY_DIR"
scp -r * $VPS_USER@$VPS_IP:$DEPLOY_DIR/

# 6. تشغيل المنظومة عصبياً داخل السيرفر عن بعد باستخدام SSH
echo "⚡ جاري إقلاع الحاويات وتشغيل المنظومة على السيرفر مباشرة..."
ssh $VPS_USER@$VPS_IP "cd $DEPLOY_DIR && docker-compose down && docker-compose up -d"

# تنظيف المجلد المؤقت محلياً
rm -rf $LOCAL_TMP

echo "##############################################################"
echo "🎉 تم النشر والتشغيل بنجاح كامل على سيرفر شيخة الـ VPS!"
echo "📍 رابط الـ API والمستندات: http://$VPS_IP:8000/docs"
echo "📍 لوحة تحكم غرافانا الرسومية: http://$VPS_IP:3000"
echo "##############################################################"
