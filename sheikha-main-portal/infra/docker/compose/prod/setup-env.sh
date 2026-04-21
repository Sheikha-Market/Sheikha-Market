#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  setup-env.sh — تفعيل بيئة الإنتاج لسوق شيخة
#  يُولّد ملف .env من .env.example مع أسرار عشوائية حقيقية
#
#  الاستخدام:
#     bash setup-env.sh            # يُنشئ .env جديداً (يرفض الكتابة فوق موجود)
#     bash setup-env.sh --force    # يُعيد توليد .env حتى لو موجود
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"
ENV_FILE="$SCRIPT_DIR/.env"

# ── التحقق من الأدوات المطلوبة ─────────────────────────────────────────────
for cmd in openssl sed; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "❌ الأداة مطلوبة ولم تُجد: $cmd"
    exit 1
  fi
done

# ── حماية الملف الموجود ────────────────────────────────────────────────────
if [[ -f "$ENV_FILE" ]] && [[ "${1:-}" != "--force" ]]; then
  echo "⚠️  ملف .env موجود بالفعل."
  echo "    لإعادة توليده: bash setup-env.sh --force"
  echo "    للتحقق منه:    cat .env"
  exit 0
fi

echo "🔐 توليد أسرار عشوائية..."

JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
PASSWORD_SALT="$(openssl rand -base64 24 | tr -d '\n')"
POSTGRES_PASSWORD="$(openssl rand -base64 24 | tr -d '\n')"
GRAFANA_ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '\n')"

# ── نسخ .env.example ثم استبدال القيم ─────────────────────────────────────
cp "$ENV_EXAMPLE" "$ENV_FILE"

# استبدال كل CHANGE_ME بالقيم المولّدة
sed -i \
  -e "s|JWT_SECRET=CHANGE_ME_at_least_32_chars_random_string|JWT_SECRET=${JWT_SECRET}|" \
  -e "s|PASSWORD_SALT=CHANGE_ME_at_least_10_chars_salt|PASSWORD_SALT=${PASSWORD_SALT}|" \
  -e "s|POSTGRES_PASSWORD=CHANGE_ME_strong_password|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" \
  -e "s|GRAFANA_ADMIN_PASSWORD=CHANGE_ME_strong_password|GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}|" \
  "$ENV_FILE"

# تأمين أذونات الملف
chmod 600 "$ENV_FILE"

echo ""
echo "✅ تم إنشاء .env بنجاح"
echo ""
echo "   JWT_SECRET       → $(grep JWT_SECRET "$ENV_FILE" | cut -d= -f2 | cut -c1-20)..."
echo "   PASSWORD_SALT    → $(grep PASSWORD_SALT "$ENV_FILE" | cut -d= -f2 | cut -c1-16)..."
echo "   POSTGRES_PASSWORD→ $(grep POSTGRES_PASSWORD "$ENV_FILE" | head -1 | cut -d= -f2 | cut -c1-16)..."
echo ""
echo "⚠️  المتغيرات التالية تحتاج قيماً حقيقية (افتح .env وعدّلها):"
grep -n "CHANGE_ME" "$ENV_FILE" | while IFS= read -r line; do
  echo "   → $line"
done || true
echo ""
echo "🚀 لتشغيل الحاويات:"
echo "   docker compose build main-portal"
echo "   docker compose up -d nginx postgres redis main-portal"
echo "   docker compose logs main-portal --tail=30"
