#!/bin/bash

# 🚀 اختبار نظام الخادم الذكي الموزع
# Sheikha Intelligent Server System - Testing Script

PORT=8080
BASE_URL="http://localhost:$PORT"
TIMEOUT=10

echo "════════════════════════════════════════════════════════════════════════════════════════"
echo "🚀 اختبار نظام الخادم الذكي الموزع - Sheikha Intelligent Server System"
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo ""

# تحقق من أن الخادم يعمل
echo "📡 فحص اتصال الخادم..."
if ! timeout $TIMEOUT curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
    echo "❌ الخادم غير متاح على $BASE_URL"
    echo "💡 شغّل: npm start"
    exit 1
fi
echo "✅ الخادم متصل بنجاح"
echo ""

# اختبار Endpoints
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo "🧪 اختبار Endpoints الجديدة"
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo ""

ENDPOINTS=(
    "api/server/architecture:معمارية الخادم"
    "api/server/network:شبكة الخادم الموزعة"
    "api/server/network-topology:توبولوجيا الشبكة"
    "api/server/performance:مؤشرات الأداء"
    "api/server/integrated-report:التقرير الموحد"
    "api/server/architecture-diagram:مخطط المعمارية"
    "api/server/resource-management:إدارة الموارد"
    "api/server/security:نظام الأمان"
    "api/server/monitoring:المراقبة والتحسين"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for endpoint in "${ENDPOINTS[@]}"; do
    IFS=':' read -r url description <<< "$endpoint"

    echo -n "🧪 اختبار: $description ... "

    RESPONSE=$(timeout $TIMEOUT curl -s -X GET "$BASE_URL/$url" \
        -H "Content-Type: application/json" 2>/dev/null)

    # تحقق من الاستجابة
    if echo "$RESPONSE" | jq . > /dev/null 2>&1; then
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
        if [ "$SUCCESS" = "true" ]; then
            echo "✅ نجح"
            ((SUCCESS_COUNT++))
        else
            echo "⚠️ فشل (استجابة غير صحيحة)"
            ((FAIL_COUNT++))
        fi
    else
        echo "❌ خطأ"
        ((FAIL_COUNT++))
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo "📊 النتائج"
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo "✅ نجح: $SUCCESS_COUNT"
echo "❌ فشل: $FAIL_COUNT"
echo "📈 النسبة: $((SUCCESS_COUNT * 100 / (SUCCESS_COUNT + FAIL_COUNT)))%"
echo ""

# عرض معلومات التقرير الموحد
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo "📈 ملخص التقرير الموحد"
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo ""

REPORT=$(timeout $TIMEOUT curl -s -X GET "$BASE_URL/api/server/integrated-report" \
    -H "Content-Type: application/json" 2>/dev/null)

if echo "$REPORT" | jq . > /dev/null 2>&1; then
    echo "نظام الخادم الذكي:"
    echo "$REPORT" | jq '.data.server_engine | {version, architecture_layers: .architecture_summary.layers, ai_capabilities: .ai_capabilities.ml_models_supported}'
    echo ""
    echo "شبكة الخادم:"
    echo "$REPORT" | jq '.data.network_architecture | {version, regions: .geographic_scale.countries_served}'
    echo ""
    echo "الإمكانيات المتكاملة:"
    echo "$REPORT" | jq '.data.integrated_capabilities | {uptime_guarantee, recovery_time}'
fi

echo ""
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo "✨ الاختبار اكتمل بنجاح!"
echo "════════════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📍 للمزيد من المعلومات:"
echo "   • GET $BASE_URL/api/server/integrated-report - التقرير الموحد"
echo "   • GET $BASE_URL/api/server/architecture-diagram - مخطط المعمارية"
echo "   • GET $BASE_URL/api/server/network - شبكة الخادم"
echo ""
