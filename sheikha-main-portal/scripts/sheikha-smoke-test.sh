#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════
# SHEIKHA SMOKE TEST — اختبار دخاني شامل للمسارات الحيوية
# يتحقق من أن جميع نقاط الصحة الرئيسية ترد بـ 200
# ══════════════════════════════════════════════════════════════════

BASE="${1:-http://127.0.0.1:8080}"

echo "== SHEIKHA SMOKE TEST =="
echo "BASE=$BASE"
echo ""

FAIL=0
PASS=0

check() {
  local label="$1"
  local url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$url")
  printf "%-25s -> %s\n" "$label" "$code"
  if [ "$code" = "200" ]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
  fi
}

# ── صحة الخادم الأساسية ──────────────────────────────────────────
check "health"            "$BASE/health"
check "api-health"        "$BASE/api/health"
check "memory-health"     "$BASE/api/memory/health"

# ── مسارات الشبكة ────────────────────────────────────────────────
check "live"              "$BASE/api/network/live"
check "ready"             "$BASE/api/network/ready"
check "network-health"    "$BASE/api/network/health"

# ── شبكة الخلايا العصبية ─────────────────────────────────────────
check "shl-neural"        "$BASE/api/shl-neural/health"
check "master-ncn"        "$BASE/api/master-ncn/health"

# ── بروتوكول شيخة ────────────────────────────────────────────────
check "protocol-events"   "$BASE/api/protocol-events/health"
check "protocol-status"   "$BASE/api/protocol-events/status"

# ── خط الأنابيب (الحرج) ──────────────────────────────────────────
check "pipeline-health"   "$BASE/api/sheikha-pipeline/health"
check "pipeline-status"   "$BASE/api/sheikha-pipeline/status"

# ── مسارات إضافية ────────────────────────────────────────────────
check "offline-status"    "$BASE/api/offline/status"
check "realtime-health"   "$BASE/api/realtime/health"

echo ""
echo "نجح: $PASS | فشل: $FAIL"
echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "✅ جميع الاختبارات نجحت — All smoke tests passed"
else
  echo "❌ فشل $FAIL اختبار — $FAIL smoke test(s) FAILED"
  exit 1
fi
