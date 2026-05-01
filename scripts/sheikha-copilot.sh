#!/usr/bin/env bash
# مشغل شيخة لكوبايلوت CLI مع هوية مرئية بسيطة.

set -u

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_logo_frame_1() {
    cat << 'EOF'
+-------------------------------------------+
|              SHEIKHA COPILOT              |
|                  [  *  ]                  |
|                Animated Logo              |
+-------------------------------------------+
EOF
}

print_logo_frame_2() {
    cat << 'EOF'
+-------------------------------------------+
|              SHEIKHA COPILOT              |
|                  [ *** ]                  |
|                Animated Logo              |
+-------------------------------------------+
EOF
}

animate_logo() {
    for _ in 1 2; do
        clear
        print_logo_frame_1
        sleep 0.12
        clear
        print_logo_frame_2
        sleep 0.12
    done
}

check_prerequisites() {
    if ! command -v gh >/dev/null 2>&1; then
        echo 'gh is not installed. Install GitHub CLI first.'
        echo 'Ubuntu/Pop!_OS: sudo apt update && sudo apt install -y gh'
        return 1
    fi

    if ! gh auth status >/dev/null 2>&1; then
        echo 'GitHub auth is not active.'
        echo 'Run: gh auth login -w'
        return 1
    fi

    return 0
}

ensure_cli_available() {
    if gh copilot --help >/dev/null 2>&1; then
        return 0
    fi

    # نسخ gh القديمة تحتاج extension منفصل.
    if gh extension install github/gh-copilot >/dev/null 2>&1; then
        return 0
    fi

    echo 'Copilot CLI is not available in current gh installation.'
    echo 'Update gh to the latest version from https://cli.github.com/'
    return 1
}

run_copilot() {
    cd "$REPO_DIR" || return 1

    if [ $# -eq 0 ]; then
        # وضع تفاعلي
        gh copilot -i
    else
        # تمرير كما هو، مثال: -p "suggest ..."
        gh copilot "$@"
    fi
}

main() {
    animate_logo

    check_prerequisites || exit 1
    ensure_cli_available || exit 1

    # تأكيد وجود تعليمات داخل جذر المشروع ليتعرف عليها Copilot.
    if [ ! -f "$REPO_DIR/copilot-instructions.md" ]; then
        echo 'Warning: copilot-instructions.md not found in project root.'
    fi

    run_copilot "$@"
}

main "$@"
