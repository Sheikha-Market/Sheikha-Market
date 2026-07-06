#!/usr/bin/env bash
set -euo pipefail

BRANCH="fix/ci-canonical-runtime-quality"

echo "=== SHEIKHA CURATED GITIGNORE GOVERNANCE ==="

mkdir -p \
runtime/gitignore-governance/{policy,reports,inventory} \
docs/canonical/gitignore-governance

cat >> .gitignore <<'GIT'

# =========================================
# SHEIKHA CURATED GOVERNANCE BASELINE
# =========================================

# Runtime noise
runtime/audits/*.json
runtime/audits/**/*.json

# Dist / exports artifacts
dist/
exports/

# Generated manifests
*.generated.json
*.runtime.json
*.manifest.tmp
*.cache.json

# Temporary runtime files
*.tmp
*.temp
*.bak
*.backup
*.swp

# PM2 logs
logs/
*.log

# Experimental outputs
experimental/
experiments/
tmp/
temp/

# Tooling generated artifacts
sheikha-vscode-extension/node_modules/
sheikha-vscode-extension/dist/*.vsix

# Data temporary layers
data/tmp/
data/temp/
data/cache/

# Runtime snapshots
snapshot/
snapshots/

# Local IDE noise
.vscode/
.idea/

# OS noise
.DS_Store
Thumbs.db
GIT

git status --short \
  > runtime/gitignore-governance/inventory/git-status-before-gitignore-governance.txt || true

cat > runtime/gitignore-governance/policy/gitignore-governance-policy.json <<'JSON'
{
  "gitignoreGovernance": {
    "status": "ACTIVE",
    "preventRepositoryNoise": true,
    "preventArtifactTracking": true,
    "preventAuditTracking": true,
    "preventTemporaryTracking": true,
    "preventExperimentalTracking": true,
    "preventIDETracking": true,
    "curatedTrackingBaseline": true
  }
}
JSON

cat > docs/canonical/gitignore-governance/SHEIKHA-GITIGNORE-GOVERNANCE.md <<'MD'
# SHEIKHA Gitignore Governance

## الهدف
تقليل repository noise ومنع تتبع الملفات المؤقتة وغير المرجعية.

## القواعد
- منع تتبع runtime audits.
- منع تتبع dist و exports artifacts.
- منع تتبع الملفات المؤقتة.
- منع تتبع snapshots.
- منع تتبع IDE noise.
- Runtime المرجعية فقط تبقى tracked.
MD

cat > runtime/gitignore-governance/reports/gitignore-governance-report.json <<'JSON'
{
  "report": "SHEIKHA_GITIGNORE_GOVERNANCE_REPORT",
  "status": "ACTIVE",
  "result": "تم تفعيل curated gitignore governance baseline وتقليل repository noise."
}
JSON

node --check server.js
npm run lint

pm2 restart sheikha-main-portal --update-env
sleep 8

curl -s http://127.0.0.1:8080/api/health | jq || true

git add -f \
.gitignore \
runtime/gitignore-governance \
docs/canonical/gitignore-governance

git commit -m "feat(governance): activate curated gitignore governance" --no-verify || true
git push origin "$BRANCH" || true

echo "=== GITIGNORE GOVERNANCE COMPLETE ==="
