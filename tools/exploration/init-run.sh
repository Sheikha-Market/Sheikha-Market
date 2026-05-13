#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

EXP_ID="${1:-}"
SCOPE="${2:-general}"

if [[ -z "$EXP_ID" ]]; then
  echo "Usage: bash tools/exploration/init-run.sh EXP-YYYY-NNN [scope]"
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="docs/exploration/runs/${EXP_ID}-${STAMP}.md"

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
NODE_VER="$(node -v 2>/dev/null || echo unknown)"
PM2_STATUS="$(pm2 status 2>/dev/null | awk 'NR==1{print $0}' || echo unavailable)"
HEALTH="$(curl -sS http://127.0.0.1:8080/api/health 2>/dev/null || echo unavailable)"
OS_INFO="$(uname -a 2>/dev/null || echo unknown)"

cat > "$OUT_FILE" <<EOF
# Research/Exploration Run

## Metadata
- Experiment ID: ${EXP_ID}
- Scope: ${SCOPE}
- Date: $(date -Is)
- Branch: ${BRANCH}
- Commit: ${COMMIT}
- Owner: runtime-team

## Environment Profile
- Host/OS: ${OS_INFO}
- Node version: ${NODE_VER}
- PM2 status: ${PM2_STATUS}
- Health endpoint: ${HEALTH}
- Env mode: \${NODE_ENV:-development}

## Constants (Fixed)
- PORT=8080
- PM2 ecosystem runtime baseline

## Variables (Changed)
- (to be filled)

## Paths Tested
- Path A: (to be filled)
- Path B: (to be filled)
- Path C: (to be filled)

## Sample Collection
- Data sources: (to be filled)
- Collection method: (to be filled)
- Quality checks: (to be filled)

## Results
- Quantitative outcomes: (to be filled)
- Qualitative observations: (to be filled)

## Failure Analysis
- Failure point: (to be filled)
- Root cause: (to be filled)
- Preventive guard added: (to be filled)

## Decision
- Best path: (to be filled)
- Rejected paths and reason: (to be filled)
- Next experiment proposal: (to be filled)
EOF

echo "Created: $OUT_FILE"
