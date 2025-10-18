#!/bin/bash
# =====================================================
# 🚀 سكربت تشغيل سوق شيخة عبر ChatGPT Codex – النسخة الذكية الكاملة
# إعداد: سلمان أحمد الراجح – Sheikha-Market
# =====================================================

echo "🚀 بدء تشغيل سوق شيخة عبر ChatGPT Codex..."

# ⚙️ إعداد المتغيرات العامة
GITHUB_USER="Sheikha-Market"
REPO_NAME="Sheikha-Market"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
TOKEN_FILE="$HOME/.config/sheikha_token"
CREDENTIAL_FILE="$HOME/.git-credentials"
BRANCH="main"

# 🔒 1. التحقق من وجود التوكن أو طلبه مرة واحدة فقط
if [ ! -f "$TOKEN_FILE" ]; then
  echo "🔑 لم يتم العثور على التوكن. الرجاء إدخاله مرة واحدة فقط."
  read -s -p "أدخل GitHub Token الخاص بك (لن يُعرض): " TOKEN
  echo ""
  mkdir -p $(dirname "$TOKEN_FILE")
  echo "$TOKEN" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  echo "✅ تم تخزين التوكن بأمان في $TOKEN_FILE"
else
  TOKEN=$(cat "$TOKEN_FILE")
fi

# 🔐 2. إعداد بيانات الدخول لحفظها تلقائيًا
if [ ! -f "$CREDENTIAL_FILE" ]; then
  echo "https://${GITHUB_USER}:${TOKEN}@github.com" > "$CREDENTIAL_FILE"
  chmod 600 "$CREDENTIAL_FILE"
  git config --global credential.helper store
  echo "✅ تم تفعيل تخزين بيانات الدخول بنجاح."
fi

# 🌀 3. تحديث المستودع أو إنشاؤه إن لم يكن موجودًا
if [ -d ".git" ]; then
  echo "🌀 تحديث المستودع المحلي..."
  git pull origin $BRANCH
else
  echo "⚠️ لم يتم العثور على مستودع Git. يتم الإنشاء الآن..."
  git init
  git remote add origin $REPO_URL
  git branch -M $BRANCH
  git pull origin $BRANCH || echo "⚠️ لا توجد فروع بعد على GitHub."
fi

#   4. إضافة ورفع التعديلات تلقائيًا
echo "💾 التحقق من التغييرات..."
if [ -n "$(git status --porcelain)" ]; then
  echo "  تم العثور على تغييرات جديدة. رفعها إلى GitHub..."
  git add .
  git commit -m "تحديث تلقائي عبر Codex بتاريخ $(date '+%Y-%m-%d %H:%M:%S')"
  git push -u origin $BRANCH
  echo "✅ تم رفع التحديثات بنجاح إلى GitHub."
else
  echo "🔹 لا توجد تغييرات جديدة. المستودع محدث بالفعل."
fi

# 🤖 5. تشغيل بيئة Codex
echo "⚙️ تشغيل OpenAI Codex..."
codex /init

echo "  تم تهيئة سوق شيخة وتشغيل Codex بذكاء وإتقان. الله ولي التوفيق."

