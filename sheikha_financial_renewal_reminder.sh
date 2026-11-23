#!/bin/bash
cd /home/sheikha/Projects/sheikha/sheikha-main-portal
NOW_EPOCH=$(date +%s)
NOV18_EPOCH=$(date -d "2026-11-18 09:00:00" +%s 2>/dev/null || echo $((NOW_EPOCH + 1382400)))
NOV22_EPOCH=$(date -d "2026-11-22 09:00:00" +%s 2>/dev/null || echo $((NOW_EPOCH + 1728000)))

DAYS_TO_18=$(( (NOV18_EPOCH - NOW_EPOCH) / 86400 ))
DAYS_TO_22=$(( (NOV22_EPOCH - NOW_EPOCH) / 86400 ))

ALERT_JSON="exports/SHEIKHA_UPCOMING_PAYMENTS_REMINDER.json"
cat << EOF > "$ALERT_JSON"
{
  "seal": "BOUND_BY_QURAN_SUNNAH",
  "checked_at": "$(date -Iseconds)",
  "cost_optimization_reminder_nov_18": {
    "due_date": "2026-11-18",
    "days_remaining": $DAYS_TO_18,
    "amount_usd": 22.98,
    "action_recommended": "إيقاف التجديد التلقائي لـ Business Web Hosting ($17.24) و Premium Business Email ($5.74) في Hostinger لأن الدومينات تعمل الآن على VPS (31.97.190.74) والبريد يعمل على Google Workspace."
  },
  "core_vps_renewal_reminder_nov_22": {
    "due_date": "2026-11-22",
    "days_remaining": $DAYS_TO_22,
    "amount_usd": 49.44,
    "service": "Hostinger KVM 4 VPS (31.97.190.74 — 4 vCPU / 16GB RAM / 200GB NVMe)",
    "action_recommended": "تأكيد رصيد الدفع لتجديد عقدة الإنتاج السحابية الأساسية 24/7."
  },
  "domains_12_status": "ALL_12_DOMAINS_PREPAID_UNTIL_OCT_2027_TO_2029_ZERO_MONTHLY_FEE"
}
EOF
echo "[$(date -Iseconds)] FINANCIAL_REMINDER_OK: $DAYS_TO_18 days to Nov-18 ($22.98 saveable) | $DAYS_TO_22 days to Nov-22 VPS ($49.44)" >> logs/financial_reminder.log
