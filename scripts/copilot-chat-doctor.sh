#!/usr/bin/env bash
set -euo pipefail

echo "============================================================"
echo "COPILOT CHAT DOCTOR"
echo "============================================================"

if ! command -v code >/dev/null 2>&1; then
    echo "WARN: 'code' command not found in PATH."
    echo "Run in VS Code: Command Palette -> Shell Command: Install 'code' command in PATH"
    exit 0
fi

echo "[1] Checking extension installation"
code --list-extensions | grep -E 'GitHub.copilot|GitHub.copilot-chat' || true

echo "[2] Install Copilot extensions if not already present"
INSTALLED_EXTENSIONS="$(code --list-extensions 2>/dev/null || true)"
if echo "$INSTALLED_EXTENSIONS" | grep -qiFx 'GitHub.copilot'; then
    echo "   GitHub.copilot already installed — skipping"
else
    code --install-extension GitHub.copilot || true
fi
if echo "$INSTALLED_EXTENSIONS" | grep -qiFx 'GitHub.copilot-chat'; then
    echo "   GitHub.copilot-chat already installed — skipping"
else
    code --install-extension GitHub.copilot-chat || true
fi

echo "[3] Clear VS Code extension host cache (safe)"
rm -rf "$HOME/.config/Code/CachedExtensionVSIXs" 2>/dev/null || true
rm -rf "$HOME/.config/Code/CachedProfilesData" 2>/dev/null || true

echo "[4] Network reachability checks"
for host in github.com api.github.com copilot-proxy.githubusercontent.com; do
    if curl -Is --max-time 5 "https://${host}" >/dev/null; then
        echo "OK   ${host}"
    else
        echo "FAIL ${host}"
    fi
done

echo "[5] Next actions"
echo "- Restart VS Code window: Ctrl+Shift+P -> Developer: Reload Window"
echo "- Sign in again to GitHub in VS Code Accounts menu"
echo "- If still slow: disable heavy extensions temporarily and reopen workspace"

echo "============================================================"
echo "COPILOT CHAT DOCTOR COMPLETE"
echo "============================================================"
