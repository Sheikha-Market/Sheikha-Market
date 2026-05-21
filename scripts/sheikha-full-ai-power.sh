#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> [Sheikha] Full AI Power bootstrap"
cd "${ROOT_DIR}"

unset npm_config_devdir NPM_CONFIG_DEVDIR npm_config_tmp NPM_CONFIG_TMP || true
source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true

# تحميل متغيرات البيئة المحلية بشكل آمن دون تنفيذ أوامر من .env
load_env_file() {
	local env_file="$1"
	[ -f "$env_file" ] || return 0

	while IFS= read -r line || [ -n "$line" ]; do
		# تجاهل السطور الفارغة والتعليقات
		[[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
		# تصدير الأسطر المطابقة لصيغة KEY=VALUE فقط
		[[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue
		export "$line"
	done < "$env_file"
}

load_env_file "$ROOT_DIR/.env"

echo "==> [1/6] VS Code doctor"
npm run dev:vscode:doctor || true

echo "==> [2/6] CUDA verify (auto-heal)"
bash scripts/vscode-cuda-verify.sh || true

echo "==> [3/6] PM2 start/restart sheikha-api"
npx pm2 delete sheikha-main-portal >/dev/null 2>&1 || true
if npx pm2 describe sheikha-api >/dev/null 2>&1; then
	npx pm2 restart sheikha-api --update-env
else
	npx pm2 start ecosystem.config.js --only sheikha-api
fi

echo "==> [4/6] PM2 start/restart sheikha-bg-guard"
npm run ops:bg-guard:pm2:start || true
npx pm2 save || true

echo "==> [5/6] API verify"
curl -sS -m 30 http://127.0.0.1:8080/api/cuda/verify >/tmp/sheikha-cuda-verify.json || true
curl -sS -m 30 http://127.0.0.1:8080/api/nvidia-cuda/capabilities >/tmp/sheikha-nvidia-capabilities.json || true
echo "   - cuda verify: /tmp/sheikha-cuda-verify.json"
echo "   - nvidia caps: /tmp/sheikha-nvidia-capabilities.json"

echo "==> [6/6] Nsight profiling (safe mode)"
bash scripts/nvidia-dev-auto.sh --nsys || true
bash scripts/nvidia-dev-auto.sh --ncu || true

echo "✅ [Sheikha] Full AI Power done"
