#!/usr/bin/env bash
# Enable GitHub CLI + Copilot CLI extension across common Linux distros.
# This script is intentionally non-fatal to avoid terminal exit code 1 in VS Code tasks.

set -u

log() {
    printf '%s\n' "$*";
}

have_cmd() {
    command -v "$1" >/dev/null 2>&1;
}

install_gh() {
    if have_cmd gh; then
        log "✅ gh already installed: $(gh --version | head -n 1)"
        return 0;
    fi

    log "ℹ️ gh not found. Trying to install..."

    if have_cmd apt-get; then
        if have_cmd sudo; then
            sudo apt-get update -y || true;
            sudo apt-get install -y gh || true;
        else
            apt-get update -y || true;
            apt-get install -y gh || true;
        fi
    elif have_cmd dnf; then
        if have_cmd sudo; then
            sudo dnf install -y gh || true;
        else
            dnf install -y gh || true;
        fi
    elif have_cmd pacman; then
        if have_cmd sudo; then
            sudo pacman -Sy --noconfirm github-cli || true;
        else
            pacman -Sy --noconfirm github-cli || true;
        fi
    else
        log "❌ Unsupported package manager. Install gh manually from https://cli.github.com/"
    fi

    if have_cmd gh; then
        log "✅ gh installed: $(gh --version | head -n 1)"
    else
        log "❌ gh installation did not complete."
    fi
}

ensure_auth() {
    if ! have_cmd gh; then
        log "⚠️ Skipping auth check because gh is missing."
        return 0;
    fi

    if gh auth status >/dev/null 2>&1; then
        log "✅ GitHub auth is active."
        return 0;
    fi

    log "⚠️ GitHub auth is not active."
    log "➡️ Run this command manually in an interactive terminal:"
    log "   gh auth login --web --git-protocol https"
    return 0;
}

install_copilot_extension() {
    if ! have_cmd gh; then
        log "⚠️ Cannot install gh-copilot because gh is missing."
        return 0;
    fi

    if ! gh auth status >/dev/null 2>&1; then
        log "⚠️ Cannot install gh-copilot before gh auth login."
        return 0;
    fi

    if gh extension list 2>/dev/null | awk '{print $1}' | grep -qx 'github/gh-copilot'; then
        log "✅ github/gh-copilot is already installed."
        return 0;
    fi

    if gh extension install github/gh-copilot; then
        log "✅ github/gh-copilot installed."
    else
        log "⚠️ Failed to install gh-copilot automatically."
    fi
}

show_next_steps() {
    log ""
    log "=== Verification Commands ==="
    log "gh --version"
    log "gh auth status"
    log "gh extension list"
    log "gh copilot suggest -t shell 'show running process on port 8080'"
    log ""
    log "Done."
}

log "=== Sheikha GitHub Copilot CLI Enabler ==="
install_gh
ensure_auth
install_copilot_extension
show_next_steps

exit 0
