#!/usr/bin/env bash
set -euo pipefail

VPS_IP="${VPS_IP:-31.97.190.74}"
VPS_USER="${VPS_USER:-root}"
VPS_KEY="${VPS_KEY:-$HOME/.ssh/sheikha_vps}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/sheikha/current}"
BRANCH="${BRANCH:-stable/runtime-baseline}"
PM2_APP="${PM2_APP:-sheikha-main-portal}"
WITH_PUSH="false"

if [[ "${1:-}" == "--with-push" ]]; then
    WITH_PUSH="true"
fi

run_steps() {
    local app_dir

    cd "$DEPLOY_PATH"

    git fetch origin "$BRANCH"
    git checkout "$BRANCH"
    git reset --hard "origin/$BRANCH"

    app_dir="$(git rev-parse --show-toplevel)"

    if [ -f "$app_dir/ecosystem.config.js" ]; then
        pm2 restart "$app_dir/ecosystem.config.js" --update-env || true
    fi

    if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
        pm2 restart "$PM2_APP" --update-env || true
    fi

    pm2 save --force || true

    if [ -f "$app_dir/scripts/repo-topology-sync.js" ]; then
        node "$app_dir/scripts/repo-topology-sync.js" apply
        node "$app_dir/scripts/repo-topology-sync.js" audit
        if [ "$WITH_PUSH" = "true" ]; then
            node "$app_dir/scripts/repo-topology-sync.js" sync --push
        else
            node "$app_dir/scripts/repo-topology-sync.js" sync
        fi
    else
        echo "WARN: missing $app_dir/scripts/repo-topology-sync.js"
    fi

    if [ -f "$app_dir/tools/runtime/sheikha-runtime-check.sh" ]; then
        bash "$app_dir/tools/runtime/sheikha-runtime-check.sh"
    else
        echo "WARN: missing $app_dir/tools/runtime/sheikha-runtime-check.sh"
    fi

    if [ -f "$app_dir/scripts/runtime-ops-report.sh" ]; then
        bash "$app_dir/scripts/runtime-ops-report.sh" || true
    fi

    echo "UNIFIED_DEPLOY_DONE branch=$BRANCH app_dir=$app_dir withPush=$WITH_PUSH"
}

if [ "$(id -u)" -eq 0 ] && [ -d "$DEPLOY_PATH/.git" ]; then
    run_steps
    exit 0
fi

if [ ! -f "$VPS_KEY" ]; then
    echo "ERROR: SSH key not found at $VPS_KEY"
    exit 1
fi

ssh -i "$VPS_KEY" -o StrictHostKeyChecking=accept-new "$VPS_USER@$VPS_IP" \
"export DEPLOY_PATH='$DEPLOY_PATH' BRANCH='$BRANCH' PM2_APP='$PM2_APP' WITH_PUSH='$WITH_PUSH'; bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail

cd "$DEPLOY_PATH"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

app_dir="$(git rev-parse --show-toplevel)"

if [ -f "$app_dir/ecosystem.config.js" ]; then
    pm2 restart "$app_dir/ecosystem.config.js" --update-env || true
fi

if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
    pm2 restart "$PM2_APP" --update-env || true
fi

pm2 save --force || true

if [ -f "$app_dir/scripts/repo-topology-sync.js" ]; then
    node "$app_dir/scripts/repo-topology-sync.js" apply
    node "$app_dir/scripts/repo-topology-sync.js" audit
    if [ "$WITH_PUSH" = "true" ]; then
        node "$app_dir/scripts/repo-topology-sync.js" sync --push
    else
        node "$app_dir/scripts/repo-topology-sync.js" sync
    fi
else
    echo "WARN: missing $app_dir/scripts/repo-topology-sync.js"
fi

if [ -f "$app_dir/tools/runtime/sheikha-runtime-check.sh" ]; then
    bash "$app_dir/tools/runtime/sheikha-runtime-check.sh"
else
    echo "WARN: missing $app_dir/tools/runtime/sheikha-runtime-check.sh"
fi

if [ -f "$app_dir/scripts/runtime-ops-report.sh" ]; then
    bash "$app_dir/scripts/runtime-ops-report.sh" || true
fi

echo "UNIFIED_DEPLOY_DONE branch=$BRANCH app_dir=$app_dir withPush=$WITH_PUSH"
REMOTE_SCRIPT
