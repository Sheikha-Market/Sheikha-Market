#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/sheikha/Projects/sheikha/sheikha-main-portal"
ENV_FILE="$PROJECT_DIR/.env"

mkdir -p "$PROJECT_DIR"
touch "$ENV_FILE"

set_env() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

# =========================
# ضع القيم الحقيقية هنا
# =========================
set_env "BASE_URL" "http://localhost:8080"

set_env "GOOGLE_CLIENT_ID" "PUT_GOOGLE_CLIENT_ID_HERE"
set_env "GOOGLE_CLIENT_SECRET" "PUT_GOOGLE_CLIENT_SECRET_HERE"

set_env "MICROSOFT_CLIENT_ID" "PUT_MICROSOFT_CLIENT_ID_HERE"
set_env "MICROSOFT_CLIENT_SECRET" "PUT_MICROSOFT_CLIENT_SECRET_HERE"

set_env "APPLE_CLIENT_ID" "PUT_APPLE_CLIENT_ID_HERE"
set_env "APPLE_TEAM_ID" "PUT_APPLE_TEAM_ID_HERE"
set_env "APPLE_KEY_ID" "PUT_APPLE_KEY_ID_HERE"
set_env "APPLE_PRIVATE_KEY_PATH" "PUT_APPLE_PRIVATE_KEY_PATH_HERE"

set_env "NAFATH_CLIENT_ID" "PUT_NAFATH_CLIENT_ID_HERE"
set_env "NAFATH_CLIENT_SECRET" "PUT_NAFATH_CLIENT_SECRET_HERE"

echo "✅ تم تحديث $ENV_FILE"

cd "$PROJECT_DIR"

echo "▶ فحص المصادقة"
npm run ops:auth:readiness

echo "▶ تفعيل رقمنة خدمات الدولة"
npm run ops:gov:auto:fix
npm run ops:gov:procedures:fix

echo "✅ اكتمل التفعيل المبدئي"
