#!/usr/bin/env bash
set -uo pipefail

echo "============================================================"
echo "COPILOT CHAT DOCTOR"
echo "============================================================"

resolve_code_cmd() {
    if command -v code >/dev/null 2>&1; then
        echo "code"
        return 0
    fi

    if command -v flatpak >/dev/null 2>&1 && flatpak info com.visualstudio.code >/dev/null 2>&1; then
        echo "flatpak run --command=code com.visualstudio.code"
        return 0
    fi

    return 1
}

CODE_CMD="$(resolve_code_cmd || true)"

if [ -z "$CODE_CMD" ]; then
    echo "WARN: VS Code CLI command is not available (code/flatpak-code)."
    echo "Run in VS Code: Command Palette -> Shell Command: Install 'code' command in PATH"
    echo "Continuing with cache/network diagnostics only..."
fi

echo "[1] Checking extension installation"
if [ -n "$CODE_CMD" ]; then
    bash -lc "$CODE_CMD --list-extensions" | grep -E 'GitHub.copilot|GitHub.copilot-chat' || true
else
    echo "SKIP: extension listing (no VS Code CLI)"
fi

echo "[2] Reinstall/refresh Copilot extensions"
if [ -n "$CODE_CMD" ]; then
    bash -lc "$CODE_CMD --install-extension GitHub.copilot --force" || true
    bash -lc "$CODE_CMD --install-extension GitHub.copilot-chat --force" || true
else
    echo "SKIP: extension reinstall (no VS Code CLI)"
fi

echo "[3] Clear VS Code extension/cache state (safe)"
rm -rf "$HOME/.config/Code/CachedExtensionVSIXs" 2>/dev/null || true
rm -rf "$HOME/.config/Code/CachedProfilesData" 2>/dev/null || true
rm -rf "$HOME/.var/app/com.visualstudio.code/config/Code/CachedExtensionVSIXs" 2>/dev/null || true
rm -rf "$HOME/.var/app/com.visualstudio.code/config/Code/CachedProfilesData" 2>/dev/null || true

# تنظيف سجلات وأكواد جلسات Copilot Chat العالقة دون حذف محتوى المشروع
find "$HOME/.config/Code/User/workspaceStorage" -type d -path "*/GitHub.copilot-chat/debug-logs/*" -prune -exec rm -rf {} + 2>/dev/null || true
find "$HOME/.var/app/com.visualstudio.code/config/Code/User/workspaceStorage" -type d -path "*/GitHub.copilot-chat/debug-logs/*" -prune -exec rm -rf {} + 2>/dev/null || true

echo "[3.1] Clearing stale Copilot Chat temp state"
rm -rf "$HOME/.config/Code/User/globalStorage/github.copilot-chat/tmp" 2>/dev/null || true
rm -rf "$HOME/.var/app/com.visualstudio.code/config/Code/User/globalStorage/github.copilot-chat/tmp" 2>/dev/null || true

echo "[4] Network reachability checks"
check_host_reachability() {
    local host="$1"
    local probe_output=""
    local exit_code=1

    # إعادة المحاولة تقلل الإنذارات الكاذبة عند تقطّع الشبكة اللحظي
    if command -v timeout >/dev/null 2>&1; then
        probe_output="$(timeout 15s curl -Is --connect-timeout 4 --max-time 8 --retry 2 --retry-delay 1 --retry-connrefused "https://${host}" 2>&1)"
        exit_code=$?
    else
        probe_output="$(curl -Is --connect-timeout 4 --max-time 8 --retry 2 --retry-delay 1 --retry-connrefused "https://${host}" 2>&1)"
        exit_code=$?
    fi

    if [ $exit_code -eq 0 ]; then
        echo "OK   ${host}"
        return 0
    fi

    if getent hosts "$host" >/dev/null 2>&1; then
        echo "WARN ${host} (dns-ok, transport-timeout)"
    else
        echo "FAIL ${host} (dns-failed)"
    fi

    if [ -n "$probe_output" ]; then
        echo "      $(echo "$probe_output" | head -n 1)"
    fi

    return 1
}

check_host_reachability github.com || true
check_host_reachability api.github.com || true
check_host_reachability copilot-proxy.githubusercontent.com || true

echo "[4.1] GitHub auth quick check (optional)"
if command -v gh >/dev/null 2>&1; then
    gh auth status >/dev/null 2>&1 && echo "OK   gh auth status" || echo "WARN gh not authenticated"
else
    echo "SKIP: gh CLI not installed"
fi

echo "[5] Next actions"
echo "- Restart VS Code window: Ctrl+Shift+P -> Developer: Reload Window"
echo "- Sign in again to GitHub in VS Code Accounts menu"
echo "- If still slow: disable heavy extensions temporarily and reopen workspace"
echo "- If issue persists: run 'npm run -s ops:dev:doctor' again and retry chat"

echo "============================================================"
echo "COPILOT CHAT DOCTOR COMPLETE"
echo "============================================================"
