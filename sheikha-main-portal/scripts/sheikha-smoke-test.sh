#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════
# SHEIKHA SMOKE TEST — اختبار دخاني سريع للمسارات الأساسية
# تحقق من أن جميع نقاط الصحة الرئيسية ترد بـ 200
# ══════════════════════════════════════════════════════════════════

BASE="${1:-http://127.0.0.1:8080}"

echo "== SHEIKHA SMOKE TEST =="
echo "BASE=$BASE"

FAIL=0

check() {
  local label="$1"
  local url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$url")
  printf "%-20s -> %s\n" "$label" "$code"
  if [ "$code" != "200" ]; then
    FAIL=$((FAIL + 1))
  fi
}

check "health"          "$BASE/health"
check "live"            "$BASE/api/network/live"
check "ready"           "$BASE/api/network/ready"
check "protocol"        "$BASE/api/protocol-events/health"
check "master-ncn"      "$BASE/api/master-ncn/health"
check "protocol-events" "$BASE/api/protocol-events/status"
check "pipeline-health" "$BASE/api/sheikha-pipeline/health"
check "memory-health"   "$BASE/api/memory/health"
check "shl-neural"      "$BASE/api/shl-neural/health"

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "✅ جميع الاختبارات نجحت — All smoke tests passed"
else
  echo "❌ فشل $FAIL اختبار — $FAIL smoke test(s) FAILED"
  exit 1
fi
