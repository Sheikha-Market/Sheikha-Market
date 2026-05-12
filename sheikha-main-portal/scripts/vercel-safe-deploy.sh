#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCOPE="${VERCEL_SCOPE:-sheikha-markets-projects}"

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
        vercel whoami --token "$VERCEL_TOKEN" >/dev/null 2>&1
        return $?
    fi
    vercel whoami >/dev/null 2>&1
}

        PROJECT_NAME="${VERCEL_PROJECT_NAME:-sheikha-market}"
required_cmds=(vercel grep)
for cmd in "${required_cmds[@]}"; do
        required_cmds=(vercel grep rsync mktemp)
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "[vercel-safe-deploy] Missing required command: $cmd"
        exit 1
    fi
done

resolve_vercel_context

if [ "${CI:-false}" = "true" ] && [ -z "${VERCEL_TOKEN:-}" ]; then
    echo "[vercel-safe-deploy] Error: CI requires VERCEL_TOKEN"
    exit 1
fi

if ! check_vercel_auth; then
    echo "[vercel-safe-deploy] Error: Vercel auth failed. Run vercel login or set VERCEL_TOKEN"
    exit 1
fi

required_patterns=(
    "runtime/"
    "logs/"
    ".venv/"
    "node_modules/"
    "reports/"
    "sheikha-vscode-extension/"
    "mcp-servers/"
)

for pattern in "${required_patterns[@]}"; do
    if ! grep -q "^${pattern}$" "$PROJECT_ROOT/.vercelignore"; then
        echo "[vercel-safe-deploy] Missing required .vercelignore pattern: ${pattern}"
        exit 1
    fi
done

echo "[vercel-safe-deploy] Preflight passed"
echo "[vercel-safe-deploy] Deploying with archive mode to avoid file-count failures"
        echo "[vercel-safe-deploy] Building minimized deploy bundle"

        DEPLOY_DIR="$(mktemp -d /tmp/sheikha-vercel-deploy-XXXXXX)"
        cleanup() {
            rm -rf "$DEPLOY_DIR"
        }
        trap cleanup EXIT

        mkdir -p "$DEPLOY_DIR/.vercel"

        # حزمة تشغيل فقط: نسخ المسارات اللازمة مباشرة بدون المرور على كامل المستودع
        required_paths=(
            "server.js"
            "package.json"
            "package-lock.json"
            "vercel.json"
            ".vercelignore"
            "public"
            "lib"
            "routes"
            "middleware"
            "config"
            "data"
        )

        for rel_path in "${required_paths[@]}"; do
            src_path="$PROJECT_ROOT/$rel_path"
            if [ -e "$src_path" ]; then
                if [ -d "$src_path" ]; then
                    mkdir -p "$DEPLOY_DIR/$rel_path"
                    rsync -a "$src_path/" "$DEPLOY_DIR/$rel_path/"
                else
                    mkdir -p "$(dirname "$DEPLOY_DIR/$rel_path")"
                    cp "$src_path" "$DEPLOY_DIR/$rel_path"
                fi
            fi
        done

        if [ -f "$PROJECT_ROOT/.vercel/project.json" ]; then
            cp "$PROJECT_ROOT/.vercel/project.json" "$DEPLOY_DIR/.vercel/project.json"
        fi

        echo "[vercel-safe-deploy] Deploying minimized bundle with archive mode"
        vercel --cwd "$DEPLOY_DIR" --prod --archive=tgz --non-interactive --scope "$SCOPE" --yes
    vercel --cwd "$PROJECT_ROOT" --prod --archive=tgz --yes --non-interactive --scope "$SCOPE" --token "$VERCEL_TOKEN"
else
    vercel --cwd "$PROJECT_ROOT" --prod --archive=tgz --yes --non-interactive --scope "$SCOPE"
fi

echo "[vercel-safe-deploy] Deployment completed"
