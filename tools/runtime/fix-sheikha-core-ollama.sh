#!/usr/bin/env bash
set -Eeuo pipefail

cd "${SHEIKHA_ROOT:-$HOME/Projects/sheikha/sheikha-main-portal}"

echo "1) إيقاف جلسات ollama run التفاعلية فقط"
pkill -f "ollama run Sheikha-Core" || true

echo "2) تشغيل Ollama server"
pgrep -a "ollama serve" >/dev/null || (ollama serve >/tmp/ollama.log 2>&1 &)
sleep 5

echo "3) إعادة تثبيت Sheikha-Core"
ollama create Sheikha-Core -f models/sheikha-core/Modelfile

echo "4) اختبار مباشر غير تفاعلي"
curl --max-time 180 -s http://127.0.0.1:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model":"Sheikha-Core",
    "prompt":"عرّف بنفسك باختصار.",
    "stream":false,
    "options":{
      "temperature":0,
      "num_predict":120
    }
  }' | jq -r '.response // .error // .'

echo "5) إعادة تشغيل Sheikha"
pm2 restart sheikha-main-portal --update-env
sleep 5

echo "6) اختبار Gateway"
curl --max-time 180 -s -X POST http://127.0.0.1:8080/api/sheikha/ai-gateway/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"عرّف بنفسك","context":{"source":"vscode","mode":"chat"}}' | jq
