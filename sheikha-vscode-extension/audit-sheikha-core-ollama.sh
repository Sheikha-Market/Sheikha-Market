#!/usr/bin/env bash
set -euo pipefail

echo "=== OLLAMA MODELS RAW ==="
curl -s http://127.0.0.1:11434/api/tags | jq '.models[] | {name, digest, size, family:.details.family, parameter_size:.details.parameter_size, quantization:.details.quantization_level}'

echo
echo "=== SHEIKHA CORE ONLY ==="
curl -s http://127.0.0.1:11434/api/tags | jq '.models[] | select(.name|test("^Sheikha-Core(:latest)?$|^Sheikha-Core-Clean(:latest)?$")) | {name, digest, size}'

echo
echo "=== TEST Sheikha-Core:latest ==="
curl -s http://127.0.0.1:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"Sheikha-Core:latest","prompt":"عرّفي نفسك بسطر واحد واذكري اسم النموذج فقط.","stream":false}' \
  | jq -r '.response // .error'

echo
echo "=== TEST Sheikha-Core-Clean:latest ==="
curl -s http://127.0.0.1:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"Sheikha-Core-Clean:latest","prompt":"عرّفي نفسك بسطر واحد واذكري اسم النموذج فقط.","stream":false}' \
  | jq -r '.response // .error'

echo
echo "=== EXTENSION CLIENT EXPECTED ==="
grep -n "Sheikha-Core\|BASE_URL\|api.sheikha.top\|runtimeTarget" src/sheikhaApiClient.js || true
