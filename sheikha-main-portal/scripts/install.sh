#!/usr/bin/env bash
set -euo pipefail

# شيخة — مُثبّت رسمي
# يثبت التطبيق كخدمة systemd محصنة على Ubuntu/Debian

APP_NAME="sheikha"
APP_USER="${SHEIKHA_APP_USER:-sheikha}"
APP_GROUP="${SHEIKHA_APP_GROUP:-sheikha}"
APP_DIR="${SHEIKHA_APP_DIR:-/opt/sheikha/sheikha-main-portal}"
SERVICE_NAME="${SHEIKHA_SERVICE_NAME:-sheikha}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
    echo "يرجى تشغيل السكربت بصلاحية root: sudo bash scripts/install.sh"
    exit 1
fi

echo "==> تثبيت ${APP_NAME} في ${APP_DIR}"

if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js غير مثبت. الرجاء تثبيت Node.js 20+ أولاً."
    exit 1
fi

NODE_MAJOR="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
if [[ "${NODE_MAJOR}" -lt 20 ]]; then
    echo "❌ إصدار Node.js الحالي أقل من 20."
    exit 1
fi

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
    useradd --system --create-home --shell /usr/sbin/nologin "${APP_USER}"
fi

if ! getent group "${APP_GROUP}" >/dev/null 2>&1; then
    groupadd --system "${APP_GROUP}"
fi

mkdir -p "${APP_DIR}"

rsync -a --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "logs" \
    --exclude "uploads" \
    --exclude "quarantine" \
    "${SRC_DIR}/" "${APP_DIR}/"

mkdir -p "${APP_DIR}/logs" "${APP_DIR}/uploads" "${APP_DIR}/quarantine"
chown -R "${APP_USER}:${APP_GROUP}" "${APP_DIR}"

echo "==> تثبيت الاعتمادات الإنتاجية"
sudo -u "${APP_USER}" bash -lc "cd '${APP_DIR}' && npm ci --omit=dev"

if [[ ! -f "${APP_DIR}/.env" ]]; then
    cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
    chown "${APP_USER}:${APP_GROUP}" "${APP_DIR}/.env"
    chmod 600 "${APP_DIR}/.env"
    echo "⚠️ تم إنشاء .env من القالب. أكمل القيم السرية قبل الإتاحة العامة."
fi

cat >"/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Sheikha Core Service
After=network.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=read-only
ReadWritePaths=${APP_DIR}/data ${APP_DIR}/logs ${APP_DIR}/uploads ${APP_DIR}/quarantine
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}"
systemctl status "${SERVICE_NAME}" --no-pager

echo "✅ تم التثبيت بنجاح."
echo "تحقق الصحة: curl -fsS http://127.0.0.1:8080/api/health"
