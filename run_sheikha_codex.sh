#!/bin/bash
# =====================================================
# 🚀 سكربت التشغيل الذكي لسوق شيخة – تنبيهات عند الفشل فقط
# إعداد: سلمان أحمد الراجح – Sheikha-Market
# =====================================================

set -Eeuo pipefail

# ---------- الإعدادات العامة ----------
GITHUB_USER="Sheikha-Market"
REPO_NAME="Sheikha-Market"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
TOKEN_FILE="$HOME/.config/sheikha_token"
CREDENTIAL_FILE="$HOME/.git-credentials"
BRANCH="main"
LOCAL_PORT=5173
LOCAL_URL="http://localhost:${LOCAL_PORT}"
PROJECT_TYPE="auto"   # auto | node | streamlit

# ---------- إعدادات الإشعارات ----------
# ضع بريدك الاحتياطي بدل المثال التالي
ADMIN_EMAILS=("market@sheikha.top" "backup@example.com")

# واتساب عبر CallMeBot (ضع رقمك الدولي بدون +) ومفتاح API إن كان لديك
WHATSAPP_NUMBER="966500000000"
WHATSAPP_KEY=""   # إن كان لديك مفتاح، اكتبه هنا، وإلا اتركه فارغًا

# ---------- التسجيل ----------
LOG_DIR="$PWD/logs"
LOG_FILE="$LOG_DIR/sheikha_errors.log"
mkdir -p "$LOG_DIR"

# ---------- الدوال ----------
notify_whatsapp() {
  local msg="$1"
  # ترميز URL بطريقة مضمونة
  local enc=$(python3 - <<'PY'
import sys, urllib.parse
print(urllib.parse.quote(sys.stdin.read()))
PY
  <<< "$msg")
  local url="https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${enc}"
  if [[ -n "$WHATSAPP_KEY" ]]; then
    url="${url}&apikey=${WHATSAPP_KEY}"
  fi
  curl -s "$url" >/dev/null || true
}

notify_email() {
  local subject="$1"
  local body="$2"
  for em in "${ADMIN_EMAILS[@]}"; do
    echo "$body" | mail -s "$subject" "$em" || true
  done
}

handle_error() {
  local line="$1"
  local cmd="$2"
  local msg="❌ فشل تشغيل سوق شيخة عند السطر ${line}\nالأمر: ${cmd}\nالدليل: $(pwd)\nالتاريخ: $(date '+%Y-%m-%d %H:%M:%S')"
  echo -e "$msg" | tee -a "$LOG_FILE"
  notify_whatsapp "$msg"
  notify_email "❌ فشل تشغيل سوق شيخة" "$msg"
  exit 1
}
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

echo "🚀 بدء تشغيل سوق شيخة عبر ChatGPT Codex..."

# ---------- 1) التوكن ----------
if [ ! -f "$TOKEN_FILE" ]; then
  read -s -p "🔑 أدخل GitHub Token (لن يُعرض): " TOKEN
  echo ""
  mkdir -p "$(dirname "$TOKEN_FILE")"
  echo "$TOKEN" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
else
  TOKEN=$(cat "$TOKEN_FILE")
fi

# ---------- 2) تخزين بيانات الدخول ----------
if [ ! -f "$CREDENTIAL_FILE" ]; then
  echo "https://${GITHUB_USER}:${TOKEN}@github.com" > "$CREDENTIAL_FILE"
  chmod 600 "$CREDENTIAL_FILE"
  git config --global credential.helper store
fi

# ---------- 3) تحديث/إنشاء المستودع ----------
if [ -d ".git" ]; then
  echo "🌀 تحديث المستودع..."
  git pull origin "$BRANCH"
else
  echo "⚙️ إنشاء مستودع جديد..."
  git init
  git remote add origin "$REPO_URL"
  git branch -M "$BRANCH"
  git pull origin "$BRANCH" || echo "⚠️ لا توجد فروع بعد."
fi

# ---------- 4) رفع التغييرات تلقائيًا إن وجدت ----------
if [ -n "$(git status --porcelain)" ]; then
  echo "📤 رفع التعديلات إلى GitHub..."
  git add .
  git commit -m "تحديث تلقائي عبر Codex بتاريخ $(date '+%Y-%m-%d %H:%M:%S')" || true
  git push -u origin "$BRANCH"
else
  echo "🔹 لا توجد تغييرات جديدة."
fi

# ---------- 5) تشغيل Codex ----------
echo "🤖 تشغيل OpenAI Codex..."
codex /init

# ---------- 6) تحديد نوع المشروع وتشغيله ----------
if [ "$PROJECT_TYPE" == "auto" ]; then
  if [ -f "package.json" ]; then
    PROJECT_TYPE="node"
  elif ls *.py >/dev/null 2>&1; then
    PROJECT_TYPE="streamlit"
  fi
fi

case "$PROJECT_TYPE" in
  node)
    echo "⚙️ تشغيل مشروع Node.js..."
    npm install
    npm run dev &
    ;;
  streamlit)
    echo "⚙️ تشغيل مشروع Streamlit..."
    FILE=$(ls *.py | head -n 1)
    streamlit run "$FILE" --server.port "$LOCAL_PORT" &
    ;;
  *)
    echo "ℹ️ لم يتم التعرف على نوع المشروع. تم تجاوز التشغيل."
    ;;
esac

# ---------- 7) فتح لوحة التحكم ----------
sleep 5
xdg-open "$LOCAL_URL" >/dev/null 2>&1 || open "$LOCAL_URL" >/dev/null 2>&1 || true

echo "✅ تم التشغيل بنجاح (لن تُرسل إشعارات نجاح — الإشعار يُرسل فقط عند الفشل)."
exit 0

