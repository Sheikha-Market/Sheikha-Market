#!/bin/bash

# 🧪 اختبار منظومة طبقات الخدمة العالمية
# Service Tiers Integration Test

echo "🧪 اختبار منظومة طبقات الخدمة العالمية"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BASE_URL="http://localhost:8080"
DELAY=2

# اختبار 1: قائمة الطبقات
echo ""
echo "✅ اختبار 1: قائمة الطبقات"
echo "───────────────────────────"
curl -s "$BASE_URL/api/service-tiers/list" | jq '.'

# اختبار 2: التكوين الكامل
echo ""
echo "✅ اختبار 2: التكوين الكامل"
echo "────────────────────────────"
curl -s "$BASE_URL/api/service-tiers/config" | jq '.data.tiers | keys'

sleep $DELAY

# اختبار 3: حالة B2B
echo ""
echo "✅ اختبار 3: حالة طبقة B2B"
echo "──────────────────────────"
curl -s "$BASE_URL/api/service-tiers/b2b/status" | jq '.'

sleep $DELAY

# اختبار 4: endpoints B2C
echo ""
echo "✅ اختبار 4: نقاط وصول طبقة B2C"
echo "────────────────────────────────"
curl -s "$BASE_URL/api/service-tiers/b2c/endpoints" | jq '.data.endpoints | length'

sleep $DELAY

# اختبار 5: B2B Automation Workflow
echo ""
echo "✅ اختبار 5: بدء عملية أتمتة (B2B)"
echo "──────────────────────────────────"
curl -s -X POST "$BASE_URL/api/service-tiers/b2b/automation/workflow" \
  -H "Content-Type: application/json" \
  -d '{"process": "test_automation", "documents": 100}' | jq '.'

sleep $DELAY

# اختبار 6: B2C Education
echo ""
echo "✅ اختبار 6: إنشاء دورة تعليمية (B2C)"
echo "───────────────────────────────────"
curl -s -X POST "$BASE_URL/api/service-tiers/b2c/education/course" \
  -H "Content-Type: application/json" \
  -d '{"title": "AI Basics", "level": "beginner", "language": "ar"}' | jq '.'

sleep $DELAY

# اختبار 7: B2G Digital Services
echo ""
echo "✅ اختبار 7: تصميم خدمة رقمية حكومية (B2G)"
echo "───────────────────────────────────────────"
curl -s -X POST "$BASE_URL/api/service-tiers/b2g/digital-services/design" \
  -H "Content-Type: application/json" \
  -d '{"service": "citizen_portal", "security": "sovereign_grade"}' | jq '.'

sleep $DELAY

# اختبار 8: Governance - Sharia Compliance
echo ""
echo "✅ اختبار 8: فحص الامتثال الشرعي (Governance)"
echo "──────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/api/service-tiers/governance/sharia-compliance/check" \
  -H "Content-Type: application/json" \
  -d '{"transaction": "test_transaction", "type": "general"}' | jq '.'

sleep $DELAY

# اختبار 9: Analytics - Real-time Dashboard
echo ""
echo "✅ اختبار 9: لوحة التحليل الفوري (Analytics)"
echo "────────────────────────────────────────────"
curl -s "$BASE_URL/api/service-tiers/analytics/real-time/dashboard" | jq '.'

sleep $DELAY

# اختبار 10: P2P Knowledge Share
echo ""
echo "✅ اختبار 10: مشاركة معرفة (P2P)"
echo "─────────────────────────────────"
curl -s -X POST "$BASE_URL/api/service-tiers/p2p/knowledge/share" \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI ethics", "language": "ar"}' | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ اختبار منظومة طبقات الخدمة اكتمل بنجاح!"
echo ""
