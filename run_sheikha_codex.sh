#!/bin/bash
# =====================================================
# 🚀 سكربت التشغيل الذكي لسوق شيخة – النسخة الاحترافية
# إعداد: سلمان أحمد الراجح – Sheikha-Market
# =====================================================

echo "🚀 بدء تشغيل سوق شيخة عبر ChatGPT Codex..."

# ⚙️ الإعدادات العامة
GITHUB_USER="Sheikha-Market"
REPO_NAME="Sheikha-Market"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
TOKEN_FILE="$HOME/.config/sheikha_token"
CREDENTIAL_FILE="$HOME/.git-credentials"
BRANCH="main"
LOCAL_PORT=5173
LOCAL_URL="http://localhost:${LOCAL_PORT}"
PROJECT_TYPE="auto"

# 📧 إعداد البريد الإلكتروني والإشعارات
ADMIN_EMAIL="market@sheikha.top"
WHATSAPP_NUMBER="966500000000"  # ← غيّر هذا لرقمك بصيغة دولية (بدون +)
WHATSAPP_API="https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text="
EMAIL_SUBJECT="🚀 تشغيل سوق شيخة بنجاح"
EMAIL_MESSAGE="تم تشغيل سوق شيخة ورفع التحديثات بنجاح في $(date '+%Y-%m-%d %H:%M:%S')."

# =====================================================
# 🔐 1. إعداد توكن GitHub
# =====================================================
if [ ! -f "$TOKEN_FILE" ]; then
  echo "🔑 أدخل GitHub Token (لن يُعرض):"
  read -s TOKEN
  echo ""
  mkdir -p $(dirname "$TOKEN_FILE")
  echo "$TOKEN" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  echo "✅ تم حفظ التوكن بأمان في $TOKEN_FILE"
else
  TOKEN=$(cat "$TOKEN_FILE")
fi

# =====================================================
# 🔐 2. تخزين بيانات الدخول
# =====================================================
if [ ! -f "$CREDENTIAL_FILE" ]; then
  echo "https://${GITHUB_USER}:${TOKEN}@github.com" > "$CREDENTIAL_FILE"
  chmod 600 "$CREDENTIAL_FILE"
  git config --global credential.helper store
  echo "✅ تم تفعيل تخزين بيانات الدخول."
fi

# =====================================================
# 🌀 3. تحديث أو إنشاء المستودع
# =====================================================
if [ -d ".git" ]; then
  echo "🌀 تحديث المستودع المحلي..."
  git pull origin $BRANCH
else
  echo "⚙️ إنشاء مستودع جديد..."
  git init
  git remote add origin $REPO_URL
  git branch -M $BRANCH
  git pull origin $BRANCH || echo "⚠️ لا توجد فروع بعد."
fi

# =====================================================
# 💾 4. رفع التحديثات
# =====================================================
if [ -n "$(git status --porcelain)" ]; then
  echo "📤 رفع التعديلات إلى GitHub..."
  git add .
  git commit -m "تحديث تلقائي عبر Codex بتاريخ $(date '+%Y-%m-%d %H:%M:%S')"
  git push -u origin $BRANCH
  echo "✅ تم رفع التحديثات بنجاح."
else
  echo "🔹 لا توجد تغييرات جديدة."
fi

# =====================================================
# ⚙️ 5. تشغيل Codex
# =====================================================
echo "🤖 تشغيل OpenAI Codex..."
codex /init || echo "⚠️ لم يتم العثور على codex."

# =====================================================
# 💡 6. تشغيل المشروع تلقائيًا
# =====================================================
if [ "$PROJECT_TYPE" == "auto" ]; then
  if [ -f "package.json" ]; then
    PROJECT_TYPE="node"
  elif ls *.py >/dev/null 2>&1; then
    PROJECT_TYPE="streamlit"
  fi
fi

if [ "$PROJECT_TYPE" == "node" ]; then
  echo "⚙️ تشغيل مشروع Node.js..."
  npm install
  npm run dev &
elif [ "$PROJECT_TYPE" == "streamlit" ]; then
  FILE=$(ls *.py | head -n 1)
  echo "⚙️ تشغيل Streamlit: $FILE"
  streamlit run "$FILE" --server.port $LOCAL_PORT &
else
  echo "⚠️ لم يتم التعرف على نوع المشروع."
fi

# =====================================================
# 🌐 7. فتح لوحة التحكم
# =====================================================
sleep 5
xdg-open "$LOCAL_URL" >/dev/null 2>&1 || open "$LOCAL_URL" >/dev/null 2>&1
echo "🌍 تم فتح لوحة تحكم سوق شيخة."

# =====================================================
# 🔔 8. إرسال إشعار واتساب وبريد إلكتروني
# =====================================================

# إشعار واتساب عبر CallMeBot
notify_whatsapp() {
  local msg="🚀 تم تشغيل سوق شيخة بنجاح ✅ بتاريخ $(date '+%Y-%m-%d %H:%M:%S')"
  local encoded_msg=$(echo "$msg" | jq -s -R -r @uri)
  curl -s "${WHATSAPP_API}${encoded_msg}" >/dev/null
  echo "💬 تم إرسال إشعار واتساب إلى ${WHATSAPP_NUMBER}"
}

# إشعار بالبريد الإلكتروني
notify_email() {
  echo "$EMAIL_MESSAGE" | mail -s "$EMAIL_SUBJECT" "$ADMIN_EMAIL"
  echo "📧 تم إرسال إشعار بالبريد إلى ${ADMIN_EMAIL}"
}

notify_whatsapp
notify_email

# =====================================================
# ✅ الانتهاء
# =====================================================
echo "✅ تم تشغيل سوق شيخة وتشغيل Codex والإشعارات بنجاح. الله ولي التوفيق."

