#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> [Sheikha] One-click elite activation start"

# Load the exact Node toolchain used by this repo.
source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true

echo "==> [Sheikha] VSCode doctor"
npm run dev:vscode:doctor || true

echo "==> [Sheikha] CUDA verify"
bash scripts/vscode-cuda-verify.sh || true

echo "==> [Sheikha] PM2 restart (single main process)"
npx pm2 delete sheikha-main-portal >/dev/null 2>&1 || true
npx pm2 start npm --name sheikha-main-portal -- start

echo "==> [Sheikha] PM2 background guard"
npx pm2 delete sheikha-bg-guard >/dev/null 2>&1 || true
npx pm2 start npm --name sheikha-bg-guard -- run ops:bg-guard:loop
npx pm2 save >/dev/null

echo "==> [Sheikha] NVIDIA profiler automation (Nsight Systems + Compute when available)"
bash scripts/nvidia-dev-auto.sh || true

echo "==> [Sheikha] API verify"
curl -sS -m 30 http://127.0.0.1:8080/api/cuda/verify >/tmp/sheikha-cuda-verify.json || true
curl -sS -m 30 http://127.0.0.1:8080/api/nvidia-cuda/capabilities >/tmp/sheikha-nvidia-capabilities.json || true

echo "==> [Sheikha] PM2 status"
npx pm2 list

echo "==> [Sheikha] Done."
echo "   CUDA verify: /tmp/sheikha-cuda-verify.json"
echo "   NVIDIA caps: /tmp/sheikha-nvidia-capabilities.json"
