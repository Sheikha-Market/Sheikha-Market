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

log "Validating required commands"
check_cmd git
check_cmd node
check_cmd npm
check_cmd curl
check_cmd vercel

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
    if ! grep -q '^BASE_URL=https://www.sheikha.top' "$PROJECT_ROOT/.env"; then
        echo "Warning: BASE_URL is not set to https://www.sheikha.top in .env"
    fi
else
    echo "Warning: .env file not found at project root"
fi

log "Checking Vercel environment variables for non-interactive deploy"
if [ -z "${VERCEL_TOKEN:-}" ]; then
    echo "Warning: VERCEL_TOKEN is not set"
fi
if [ -z "${VERCEL_ORG_ID:-}" ]; then
    echo "Warning: VERCEL_ORG_ID is not set"
fi
if [ -z "${VERCEL_PROJECT_ID:-}" ]; then
    echo "Warning: VERCEL_PROJECT_ID is not set"
fi

if [ "$EXECUTE" = false ]; then
    log "Dry-run completed successfully"
    log "Next step: run with --execute to deploy"
    exit 0
fi

log "Deploying to Vercel production"
vercel --cwd "$PROJECT_ROOT" --prod

log "Running post-deploy health checks"
curl -fsS -m 20 https://www.sheikha.top >/dev/null
curl -fsS -m 20 https://www.sheikha.top/api/finance/status >/dev/null

log "Deployment and verification completed"
