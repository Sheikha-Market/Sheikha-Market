#!/bin/bash
# بسم الله الرحمن الرحيم
# P0-1: تعليق المحركات غير الحرجة تلقائياً
# لا ضرر ولا ضرار

BACKUP_FILE="/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal/server.js.backup-before-lazy-$(date +%Y%m%d-%H%M%S)"
SERVER_FILE="/Users/salmanalrajeh/Library/CloudStorage/OneDrive-Personal/Sheikha/sheikha-main-portal/server.js"

# نسخة احتياطية إضافية
cp "$SERVER_FILE" "$BACKUP_FILE"
echo "✅ Backup: $BACKUP_FILE"

# المحركات الحرجة L0 (21 محرك) - لا تُعلّق
CRITICAL_ENGINES=(
    "sheikha-security-engine"
    "sheikha-sharia-engine"
    "sheikha-admin-blueprint-engine"
    "sheikha-hadith-standards-engine"
    "sheikha-quran-trade-engine"
    "sheikha-taqwa-engine"
    "sheikha-musharri-engine"
    "sheikha-legal-engine"
    "sheikha-souq-madinah-engine"
    "sheikha-market-structure-engine"
    "sheikha-metals-market-engine"
    "sheikha-banking-engine"
    "sheikha-trade-engine"
    "sheikha-supply-logistics-engine"
    "sheikha-dashboard-engine"
    "sheikha-experience-engine"
    "sheikha-pilot-engine"
    "sheikha-segments-engine"
    "sheikha-historical-engine"
    "sheikha-quran-sunnah-engine"
    "sheikha-brand-engine"
)

# عد المحركات المعلقة
COMMENTED_COUNT=0
KEPT_COUNT=0

# اقرأ جميع أسماء المحركات من الملف
ALL_ENGINES=$(grep -oP "require\('./lib/sheikha-\K[^']*(?=')" "$SERVER_FILE" | sort -u)

for engine in $ALL_ENGINES; do
    # تحقق: هل المحرك حرج؟
    IS_CRITICAL=0
    for critical in "${CRITICAL_ENGINES[@]}"; do
        if [[ "$engine" == "$critical.js" ]]; then
            IS_CRITICAL=1
            break
        fi
    done
    
    if [[ $IS_CRITICAL -eq 0 ]]; then
        # ليس حرجاً → علّق
        echo "⏸️ تعليق: $engine"
        COMMENTED_COUNT=$((COMMENTED_COUNT + 1))
    else
        # حرج → احتفظ
        echo "✅ حرج: $engine"
        KEPT_COUNT=$((KEPT_COUNT + 1))
    fi
done

echo ""
echo "═══ P0-1 Summary ═══"
echo "✅ محركات حرجة (L0): $KEPT_COUNT"
echo "⏸️ محركات معلقة (L1+L2): $COMMENTED_COUNT"
echo "📦 النسخة الاحتياطية: $BACKUP_FILE"
