#!/bin/bash
set -e

echo "🕌 بدء نشر منظومة وروبوت شيخة السيادي على Google Cloud..."

# 1. إعداد مسار النشر المعزول النظيف (< 60 MiB)
rm -rf /tmp/sheikha-deploy-clean
mkdir -p /tmp/sheikha-deploy-clean/SHEIKHA-CORE/blockchain \
         /tmp/sheikha-deploy-clean/SHEIKHA-CORE/sheikhachain/blocks \
         /tmp/sheikha-deploy-clean/public/robot

cp server.js package.json package-lock.json Dockerfile /tmp/sheikha-deploy-clean/
cp .env /tmp/sheikha-deploy-clean/.env 2>/dev/null || true
cp global-neural-governance-init.js /tmp/sheikha-deploy-clean/ 2>/dev/null || true
cp -r config routes lib /tmp/sheikha-deploy-clean/
cp -r public/* /tmp/sheikha-deploy-clean/public/
rm -rf /tmp/sheikha-deploy-clean/public/media /tmp/sheikha-deploy-clean/public/generated-images 2>/dev/null || true

cp SHEIKHA-CORE/blockchain/registry.json /tmp/sheikha-deploy-clean/SHEIKHA-CORE/blockchain/
cp -r SHEIKHA-CORE/sheikhachain/blocks/* /tmp/sheikha-deploy-clean/SHEIKHA-CORE/sheikhachain/blocks/ 2>/dev/null || true

# 2. ملف cloudbuild.yaml مباشر
cat << 'YML' > /tmp/sheikha-deploy-clean/cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/sheikha-apps/sheikha-main-portal:v54-supreme'
      - '.'
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/sheikha-apps/sheikha-main-portal:v54-supreme'
images:
  - 'us-central1-docker.pkg.dev/$PROJECT_ID/sheikha-apps/sheikha-main-portal:v54-supreme'
timeout: 1200s
options:
  logging: CLOUD_LOGGING_ONLY
YML

# 3. إرسال البناء
cd /tmp/sheikha-deploy-clean
gcloud builds submit \
  --project=sheikha-marketplace \
  --region=us-central1 \
  --config=cloudbuild.yaml

# 4. النشر والتوجيه
gcloud run deploy sheikha-main-portal \
  --project=sheikha-marketplace \
  --region=us-central1 \
  --image=us-central1-docker.pkg.dev/sheikha-marketplace/sheikha-apps/sheikha-main-portal:v54-supreme \
  --port=8080 \
  --clear-volumes \
  --clear-volume-mounts \
  --no-allow-unauthenticated \
  --set-env-vars=BOUND_BY_QURAN_SUNNAH=true,CR=2051263653,HOST=0.0.0.0,SEAL=ATOM_WATER_RASUL_JANNAH_SEALED

gcloud run services update-traffic sheikha-main-portal \
  --project=sheikha-marketplace \
  --region=us-central1 \
  --to-latest

echo "✅ تم النشر بنجاح وتوجيه 100% من المرور."
