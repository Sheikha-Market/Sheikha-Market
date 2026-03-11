#!/usr/bin/env bash
set -euo pipefail

# شيخة — إزالة التثبيت الرسمي

SERVICE_NAME="${SHEIKHA_SERVICE_NAME:-sheikha}"
APP_DIR="${SHEIKHA_APP_DIR:-/opt/sheikha/sheikha-main-portal}"
PURGE_DATA="${SHEIKHA_PURGE_DATA:-false}"

if [[ "${EUID}" -ne 0 ]]; then
    echo "يرجى تشغيل السكربت بصلاحية root: sudo bash scripts/uninstall.sh"
    exit 1
fi

if [[ -f "/etc/systemd/system/${SERVICE_NAME}.service" ]]; then
    systemctl disable --now "${SERVICE_NAME}" || true
    rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
    systemctl daemon-reload
fi

if [[ "${PURGE_DATA}" == "true" ]]; then
    rm -rf "${APP_DIR}"
    echo "✅ تمت الإزالة مع البيانات."
else
    rm -rf "${APP_DIR}/node_modules"
    echo "✅ تمت إزالة الخدمة مع الإبقاء على البيانات في ${APP_DIR}."
fi
#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="${SHEIKHA_SERVICE_NAME:-sheikha}"
APP_DIR="${SHEIKHA_APP_DIR:-/opt/sheikha/sheikha-main-portal}"

if [[ "${EUID}" -ne 0 ]]; then
    echo "يرجى تشغيل السكربت بصلاحية root: sudo bash scripts/uninstall.sh"
    exit 1
fi

echo "==> إيقاف خدمة ${SERVICE_NAME}"
systemctl disable --now "${SERVICE_NAME}" 2>/dev/null || true
rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload

echo "==> إزالة مجلد التطبيق: ${APP_DIR}"
rm -rf "${APP_DIR}"

echo "✅ تمت الإزالة."
echo "ملاحظة: المستخدم/المجموعة system لم يتم حذفهم تلقائياً."
#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="${SHEIKHA_SERVICE_NAME:-sheikha}"
APP_DIR="${SHEIKHA_APP_DIR:-/opt/sheikha/sheikha-main-portal}"
BACKUP_DIR="${SHEIKHA_BACKUP_DIR:-/opt/sheikha/backups}"

if [[ "${EUID}" -ne 0 ]]; then
    echo "يرجى تشغيل السكربت بصلاحية root: sudo bash scripts/uninstall.sh"
    exit 1
fi

echo "==> إلغاء خدمة ${SERVICE_NAME}"
systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
systemctl disable "${SERVICE_NAME}" 2>/dev/null || true
rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload

if [[ -d "${APP_DIR}" ]]; then
    mkdir -p "${BACKUP_DIR}"
    TS="$(date +%Y%m%d-%H%M%S)"
    tar -czf "${BACKUP_DIR}/sheikha-data-${TS}.tar.gz" -C "${APP_DIR}" data logs uploads quarantine .env 2>/dev/null || true
    rm -rf "${APP_DIR}"
    echo "✅ تم حفظ نسخة احتياطية في ${BACKUP_DIR}"
fi

echo "✅ تم إلغاء التثبيت."
