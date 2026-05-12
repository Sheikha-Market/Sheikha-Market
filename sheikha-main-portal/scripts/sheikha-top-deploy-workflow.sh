#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXECUTE=false
SKIP_TESTS=false
ALLOW_DIRTY=false

log() {
    echo "[sheikha-top-deploy] $*"
}

usage() {
    cat <<'EOF'
Usage: bash scripts/sheikha-top-deploy-workflow.sh [options]

Options:
  --execute       Execute production deployment
  --skip-tests    Skip unit tests
  --allow-dirty   Allow dirty git working tree
  -h, --help      Show help
EOF
}

for arg in "$@"; do
    case "$arg" in
        --execute)
            EXECUTE=true
            ;;
        --skip-tests)
            SKIP_TESTS=true
            ;;
        --allow-dirty)
            ALLOW_DIRTY=true
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            usage
            exit 1
            ;;
    esac
done

check_cmd() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Missing required command: $cmd"
        exit 1
    fi
}

resolve_vercel_context() {
    local project_file="$PROJECT_ROOT/.vercel/project.json"
    if [ -f "$project_file" ]; then
        if [ -z "${VERCEL_ORG_ID:-}" ]; then
            VERCEL_ORG_ID="$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(p.orgId||'');" "$project_file")"
            export VERCEL_ORG_ID
        fi
        if [ -z "${VERCEL_PROJECT_ID:-}" ]; then
            VERCEL_PROJECT_ID="$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(p.projectId||'');" "$project_file")"
            export VERCEL_PROJECT_ID
        fi
    fi
}

check_vercel_auth() {
    if [ -n "${VERCEL_TOKEN:-}" ]; then
        if vercel whoami --token "$VERCEL_TOKEN" >/dev/null 2>&1; then
            log "Vercel auth via VERCEL_TOKEN: OK"
            return 0
        fi
        echo "Error: VERCEL_TOKEN موجود لكنه غير صالح."
        return 1
    fi

    if vercel whoami >/dev/null 2>&1; then
        log "Vercel auth via local login session: OK"
        return 0
    fi

    echo "Error: غير مصادق على Vercel. نفّذ vercel login أو اضبط VERCEL_TOKEN."
    return 1
}

log "Validating required commands"
check_cmd git
check_cmd node
check_cmd npm
check_cmd curl
check_cmd vercel
resolve_vercel_context

if [ "$ALLOW_DIRTY" = false ]; then
    log "Checking working tree cleanliness"
    if ! git -C "$PROJECT_ROOT" diff --quiet || ! git -C "$PROJECT_ROOT" diff --cached --quiet; then
        echo "Working tree is not clean. Commit/stash changes or run with --allow-dirty."
        exit 1
    fi
fi

if [ "$SKIP_TESTS" = false ]; then
    log "Running unit tests"
    npm --prefix "$PROJECT_ROOT" test
fi

if [ -f "$PROJECT_ROOT/.env" ]; then
    log "Found .env file"
    if ! grep -qE '^BASE_URL=https://(www\.)?sheikha\.top' "$PROJECT_ROOT/.env"; then
        echo "Warning: BASE_URL is not set to https://sheikha.top in .env"
    fi
else
    echo "Warning: .env file not found at project root"
fi

log "Checking Vercel environment variables for non-interactive deploy"
if [ -z "${VERCEL_TOKEN:-}" ]; then
    echo "Warning: VERCEL_TOKEN is not set (مسموح محليًا إذا كانت جلسة vercel login مفعلة)"
fi
if [ -z "${VERCEL_ORG_ID:-}" ]; then
    echo "Warning: VERCEL_ORG_ID is not set"
else
    log "VERCEL_ORG_ID detected"
fi
if [ -z "${VERCEL_PROJECT_ID:-}" ]; then
    echo "Warning: VERCEL_PROJECT_ID is not set"
else
    log "VERCEL_PROJECT_ID detected"
fi

if [ "${CI:-false}" = "true" ] && [ -z "${VERCEL_TOKEN:-}" ]; then
    echo "Error: في بيئة CI يجب ضبط VERCEL_TOKEN."
    exit 1
fi

if ! check_vercel_auth; then
    exit 1
fi

if [ "$EXECUTE" = false ]; then
    log "Dry-run completed successfully"
    log "Next step: run with --execute to deploy"
    exit 0
fi

log "Deploying to Vercel production"
if [ -n "${VERCEL_TOKEN:-}" ]; then
    vercel --cwd "$PROJECT_ROOT" --prod --archive=tgz --yes --non-interactive --token "$VERCEL_TOKEN"
else
    vercel --cwd "$PROJECT_ROOT" --prod --archive=tgz --yes --non-interactive
fi

log "Running post-deploy health checks"
curl -fsS -m 20 https://www.sheikha.top >/dev/null
curl -fsS -m 20 https://www.sheikha.top/api/finance/status >/dev/null

log "Deployment and verification completed"
