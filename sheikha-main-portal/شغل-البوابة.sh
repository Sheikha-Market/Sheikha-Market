#!/bin/bash
# تشغيل بوابة شيخه — استخدم Node 20 لتجنب مشكلة libc++
cd "$(dirname "$0")"
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 20 2>/dev/null || true
fi
echo "تشغيل الخادم على http://localhost:8080"
exec node server.js
