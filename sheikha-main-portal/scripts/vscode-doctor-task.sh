#!/usr/bin/env bash
set -uo pipefail

# تنظيف متغيرات npm التي قد تتعارض مع nvm
unset npm_config_prefix NPM_CONFIG_PREFIX
unset npm_config_devdir NPM_CONFIG_DEVDIR
unset npm_config_tmp NPM_CONFIG_TMP

# تحميل nvm إن وُجد
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
fi

# محاولة استخدام نسخة node المطلوبة دون كسر المهمة
if command -v nvm >/dev/null 2>&1; then
    nvm use 25.6.1 >/dev/null 2>&1 || true
fi

# تشغيل الفحص، وإذا فشل لا نُنهي التيرمنال بخروج حاد
if ! npm run -s dev:vscode:doctor; then
    echo "WARN: dev:vscode:doctor returned non-zero."
    echo "The task will continue without failing terminal startup."
fi

exit 0
