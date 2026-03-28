#!/usr/bin/env bash
set -euo pipefail

MODEL="${1:-qwen2.5-coder:14b}"
WORK_DIR="${HOME}/Downloads/ollama"
INSTALL_URL="https://ollama.com/install.sh"
LOG_DIR="${HOME}/ollama-logs"
LOG_FILE="${LOG_DIR}/setup-$(date +%F-%H%M%S).log"
USE_SYSTEMD=0
SUDO=""

if [ -d /run/systemd/system ] && command -v systemctl >/dev/null 2>&1; then
    USE_SYSTEMD=1
fi

if command -v sudo >/dev/null 2>&1 && [ "$(id -u)" -ne 0 ]; then
    SUDO="sudo"
fi

mkdir -p "${WORK_DIR}" "${LOG_DIR}"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "=== [0/9] بدء التثبيت الكامل ==="
echo "Log: ${LOG_FILE}"
echo "Model: ${MODEL}"

echo "=== [1/9] فحص أدوات النظام ==="
command -v curl >/dev/null || { echo "curl غير موجود"; exit 1; }
command -v tar >/dev/null || { echo "tar غير موجود"; exit 1; }
command -v ss >/dev/null || true

if ! command -v zstd >/dev/null 2>&1; then
    echo "zstd غير موجود — تثبيت المتطلب الآن..."
    if command -v apt-get >/dev/null 2>&1; then
        ${SUDO} apt-get update -y
        ${SUDO} apt-get install -y zstd
    elif command -v dnf >/dev/null 2>&1; then
        ${SUDO} dnf install -y zstd
    elif command -v yum >/dev/null 2>&1; then
        ${SUDO} yum install -y zstd
    elif command -v pacman >/dev/null 2>&1; then
        ${SUDO} pacman -S --noconfirm zstd
    else
        echo "تعذر تثبيت zstd تلقائياً — ثبته يدوياً ثم أعد التشغيل."
        exit 1
    fi
fi

echo "=== [2/9] فحص المساحة المتاحة ==="
FREE_GB=$(df -BG "${HOME}" | awk 'NR==2{gsub("G","",$4); print $4}')
if [ "${FREE_GB}" -lt 90 ]; then
    echo "تحذير: المساحة الحرة أقل من 90GB. الموديلات الكبيرة قد تفشل."
fi

echo "=== [3/9] إيقاف وتنظيف التثبيت المعطوب ==="
if [ "${USE_SYSTEMD}" -eq 1 ]; then
    ${SUDO} systemctl stop ollama 2>/dev/null || true
    ${SUDO} systemctl disable ollama 2>/dev/null || true
fi
pkill -f "/usr/local/bin/ollama serve" 2>/dev/null || true
pkill -f "ollama serve" 2>/dev/null || true
${SUDO} rm -f /usr/local/bin/ollama
${SUDO} rm -rf /usr/local/lib/ollama
${SUDO} rm -f /etc/systemd/system/ollama.service
if [ "${USE_SYSTEMD}" -eq 1 ]; then
    ${SUDO} systemctl daemon-reload
fi

echo "=== [4/9] تنزيل وتثبيت Ollama (المثبت الرسمي) ==="
cd "${WORK_DIR}"
INSTALL_ATTEMPT=1
MAX_INSTALL_ATTEMPTS=120
until curl -fsSL "${INSTALL_URL}" | sh; do
    echo "فشل تثبيت Ollama في المحاولة ${INSTALL_ATTEMPT}، إعادة المحاولة بعد 10 ثوان..."
    INSTALL_ATTEMPT=$((INSTALL_ATTEMPT + 1))
    if [ "${INSTALL_ATTEMPT}" -gt "${MAX_INSTALL_ATTEMPTS}" ]; then
        echo "تعذر تثبيت Ollama بعد محاولات متعددة."
        exit 1
    fi
    sleep 10
done

echo "=== [5/9] التحقق من وجود الملف التنفيذي ==="
if [ ! -x /usr/local/bin/ollama ]; then
    echo "الملف التنفيذي غير موجود بعد التثبيت: /usr/local/bin/ollama"
    exit 1
fi

echo "=== [6/9] التحقق من الصلاحيات والبنية ==="
ls -l /usr/local/bin/ollama
file /usr/local/bin/ollama || true
/usr/local/bin/ollama --version || true

echo "=== [7/9] إنشاء خدمة systemd سليمة ==="
if [ "${USE_SYSTEMD}" -eq 1 ]; then
${SUDO} bash -c 'cat > /etc/systemd/system/ollama.service <<SERVICE
[Unit]
Description=Ollama Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=3
User=root
Environment=OLLAMA_HOST=127.0.0.1:11434
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
SERVICE'

${SUDO} systemctl daemon-reload
${SUDO} systemctl enable --now ollama
else
    echo "systemd غير متاح، تشغيل ollama serve بالخلفية..."
    nohup /usr/local/bin/ollama serve > "${LOG_DIR}/ollama-serve.log" 2>&1 &
    echo $! > "${LOG_DIR}/ollama-serve.pid"
fi

echo "=== [8/9] التحقق من تشغيل الخدمة والمنفذ ==="
sleep 2
if [ "${USE_SYSTEMD}" -eq 1 ]; then
    systemctl status ollama --no-pager || true
fi
ss -ltnp 2>/dev/null | grep 11434 || true

echo "=== [9/9] سحب الموديل مع منع السكون ==="
ATTEMPT=1
MAX_ATTEMPTS=999999
PULL_CMD="ollama pull '${MODEL}'"
if command -v systemd-inhibit >/dev/null 2>&1; then
    PULL_CMD="systemd-inhibit --what=sleep --why=\"Ollama model pull\" bash -lc \"ollama pull '${MODEL}'\""
fi

until bash -lc "${PULL_CMD}"; do
    echo "فشل السحب في المحاولة ${ATTEMPT}، إعادة المحاولة بعد 10 ثوان..."
    ATTEMPT=$((ATTEMPT+1))
    if [ "${ATTEMPT}" -gt "${MAX_ATTEMPTS}" ]; then
        echo "تم تجاوز الحد الأقصى للمحاولات"
        exit 1
    fi
    sleep 10
done

echo "=== تم بنجاح ==="
ollama list || true
echo "Log file: ${LOG_FILE}"
