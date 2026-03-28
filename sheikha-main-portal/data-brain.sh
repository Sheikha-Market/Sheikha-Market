#!/bin/bash

BASE="/var/sheikha"
LOG="$BASE/runtime/logs/data-brain.log"

echo "=== AI DATA BRAIN START $(date) ===" >> $LOG

# ملفات مؤقتة > 1 ساعة
find $BASE -type f -mmin +60 -path "*/tmp/*" -delete

# Logs أكبر من 5MB → ضغط
find $BASE/runtime/logs -type f -size +5M -exec gzip {} \;

# نقل التقارير المهمة
find $BASE/runtime/reports -type f -size +1k -exec mv {} $BASE/core/ \;

echo "=== AI DATA BRAIN END ===" >> $LOG
