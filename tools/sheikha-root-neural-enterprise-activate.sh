#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${SHEIKHA_ROOT:-$HOME/Projects/sheikha/sheikha-main-portal}"
PORTS=("8080" "8081")
OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434}"
MODEL="${SHEIKHA_CORE_MODEL:-Sheikha-Core}"
REPORT="$ROOT/reports/activation/sheikha-root-neural-enterprise-$(date +%Y%m%d-%H%M%S).json"

cd "$ROOT"

ok(){ echo "✅ $*"; }
warn(){ echo "⚠️ $*"; }
fail(){ echo "❌ $*"; exit 1; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " SHEIKHA ROOT NEURAL ENTERPRISE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

command -v node >/dev/null || fail "Node.js غير موجود"
command -v npm >/dev/null || fail "npm غير موجود"
command -v jq >/dev/null || fail "jq غير موجود"
command -v pm2 >/dev/null || fail "pm2 غير موجود"

node --check server.js
ok "server.js صحيح نحويًا"

npm run lint --if-present || warn "lint فيه ملاحظات أو غير متاح"

if command -v ollama >/dev/null; then
  if curl -sf "$OLLAMA_URL/api/tags" >/dev/null; then
    ok "Ollama يعمل"
  else
    warn "Ollama لا يرد؛ شغّل: ollama serve"
  fi
else
  warn "Ollama غير مثبت"
fi

if [ -f models/sheikha-core/Modelfile ] && command -v ollama >/dev/null; then
  ollama create "$MODEL" -f models/sheikha-core/Modelfile || warn "تعذر إنشاء/تحديث $MODEL"
fi

pm2 restart sheikha-main-portal --update-env || pm2 start server.js --name sheikha-main-portal --update-env
sleep 8

BASE=""
for p in "${PORTS[@]}"; do
  if curl -sf "http://127.0.0.1:$p/api/health" >/dev/null; then
    BASE="http://127.0.0.1:$p"
    break
  fi
done

[ -n "$BASE" ] || fail "لم أجد Sheikha API على 8080 أو 8081"
ok "Sheikha API يعمل على $BASE"

mkdir -p "$(dirname "$REPORT")"

{
  echo "{"
  echo "  \"success\": true,"
  echo "  \"baseUrl\": \"$BASE\","
  echo "  \"timestamp\": \"$(date -Iseconds)\","
  echo "  \"health\": $(curl -s "$BASE/api/health" | jq -c .),"
  echo "  \"runtimeRoot\": $(curl -s "$BASE/api/runtime-root/health" | jq -c .),"
  echo "  \"systemStatus\": $(curl -s "$BASE/api/sheikha/system/status" | jq -c .),"
  echo "  \"aiGateway\": $(curl -s "$BASE/api/sheikha/ai-gateway/status" | jq -c .),"
  echo "  \"neuralNetwork\": $(curl -s "$BASE/api/sheikha/ai-neural-cell-network/status" | jq -c . 2>/dev/null || echo '{}'),"
  echo "  \"pm2\": \"checked\""
  echo "}"
} > "$REPORT"

ok "تم إنشاء تقرير التفعيل: $REPORT"

echo
echo "اختبار Sheikha-Core:"
curl -s -X POST "$BASE/api/sheikha/ai-gateway/ask" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"عرّف نفسك كنظام شيخة محلي محكوم بإيجاز.","context":{"source":"root-neural-enterprise-activation","mode":"validation"}}' \
  | jq

echo
ok "اكتمل تفعيل شبكة الخلايا الجذرية المؤسسية"
