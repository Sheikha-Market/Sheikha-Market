#!/usr/bin/env bash
set -euo pipefail

export SHEIKHA_RUNTIME_URL="https://api.sheikha.top"

echo "=== 1) Extension Client / Sheikha Core HTTPS ==="
node test-sheikha-extension-chat.js

echo
echo "=== 2) Direct HTTPS AI Gateway ==="
curl -s -X POST "$SHEIKHA_RUNTIME_URL/api/sheikha/ai-gateway/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"اختبار Sheikha Core من مسار الشات عبر HTTPS","mode":"agentic","runtimeTarget":"server-https"}' | jq . || true

echo
echo "=== 3) Ollama Health ==="
curl -s http://127.0.0.1:11434/api/tags | jq '.models[]?.name' || true

echo
echo "=== 4) Ollama Sheikha-Core Generate ==="
curl -s http://127.0.0.1:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model":"Sheikha-Core:latest",
    "prompt":"بسم الله الرحمن الرحيم. عرّفي نفسك باختصار كـ Sheikha-Core.",
    "stream":false
  }' | jq -r '.response // .error' || true

echo
echo "=== 5) Final Status ==="
echo "SHEIKHA_RUNTIME_URL=$SHEIKHA_RUNTIME_URL"
