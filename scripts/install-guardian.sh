#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# install-guardian.sh — تثبيت sheikha-guardian من فرع GitHub مباشرة
# يعالج: الخدمة المعطَّلة (masked) + الفرع الخاطئ + إعادة التشغيل
#
# طريقة التشغيل:
#   bash <(curl -fsSL https://raw.githubusercontent.com/Sheikha-Market/sheikha-main-portal/copilot/add-failover-between-8080-8090/scripts/install-guardian.sh)
#
# أو من داخل /opt/sheikha/current:
#   git fetch origin copilot/add-failover-between-8080-8090 && git show FETCH_HEAD:scripts/install-guardian.sh | bash

set -euo pipefail

BRANCH='copilot/add-failover-between-8080-8090'
RAW_BASE="https://raw.githubusercontent.com/Sheikha-Market/sheikha-main-portal/${BRANCH}/scripts"
REPO_DIR='/opt/sheikha/current'
LOG='/var/log/sheikha-guardian.log'

echo '══════════════════════════════════════════════'
echo '  sheikha-guardian installer — بسم الله'
echo '══════════════════════════════════════════════'

# ── 1. إيقاف الدورة الحالية ────────────────────────────────────
echo '[1] إيقاف guardian القديم...'
systemctl stop sheikha-guardian.timer sheikha-guardian.service 2>/dev/null || true

# ── 2. رفع الحجب (unmask) إن كان مفروضاً ──────────────────────
echo '[2] رفع الحجب عن الخدمة...'
systemctl unmask sheikha-guardian.service 2>/dev/null || true
systemctl unmask sheikha-guardian.timer   2>/dev/null || true

# ── 3. تحميل الملفات من GitHub مباشرة ────────────────────────
echo '[3] تحميل السكربت المحدَّث من GitHub...'

# محاولة أولى: عبر git fetch (أسرع في البيئات التي لها git مُهيَّأ)
if cd "$REPO_DIR" 2>/dev/null && \
   git fetch origin "$BRANCH" 2>/dev/null && \
   git show FETCH_HEAD:scripts/sheikha-guardian.sh \
       > /usr/local/bin/sheikha-guardian.sh 2>/dev/null; then
    echo '   ✅ تم عبر git fetch'
    git show FETCH_HEAD:scripts/sheikha-guardian.service \
        > /etc/systemd/system/sheikha-guardian.service
    git show FETCH_HEAD:scripts/sheikha-guardian.timer \
        > /etc/systemd/system/sheikha-guardian.timer
else
    # محاولة ثانية: تنزيل مباشر عبر curl
    echo '   ⚠️  git fetch فشل — جاري التنزيل المباشر عبر curl...'
    curl -fsSL "${RAW_BASE}/sheikha-guardian.sh" \
        -o /usr/local/bin/sheikha-guardian.sh
    curl -fsSL "${RAW_BASE}/sheikha-guardian.service" \
        -o /etc/systemd/system/sheikha-guardian.service
    curl -fsSL "${RAW_BASE}/sheikha-guardian.timer" \
        -o /etc/systemd/system/sheikha-guardian.timer
    echo '   ✅ تم عبر curl'
fi

chmod +x /usr/local/bin/sheikha-guardian.sh

# تأكد من وجود ملف اللوق
touch "$LOG" 2>/dev/null || true

# ── 4. تحميل وتفعيل systemd ───────────────────────────────────
echo '[4] تحميل وتفعيل systemd...'
systemctl daemon-reload
systemctl enable --now sheikha-guardian.timer
echo '   ✅ Guardian مفعَّل'

# ── 5. تحقق فوري ──────────────────────────────────────────────
echo '[5] تحقق من الحالة...'
systemctl is-active --quiet sheikha-guardian.timer \
    && echo '   ✅ التايمر يعمل' \
    || echo '   ❌ التايمر لا يعمل — راجع: systemctl status sheikha-guardian.timer'

echo ''
echo '══════════════════════════════════════════════'
echo '  انتظر دقيقة واحدة ثم شغّل:'
echo "  tail -10 ${LOG}"
echo '══════════════════════════════════════════════'
