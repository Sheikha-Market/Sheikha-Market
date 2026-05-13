# 🧠 Neural Cell Network Sync Policy
## Multi-Repository Deployment Architecture

**Date:** May 13, 2026
**Status:** Active
**Version:** 1.0.0

---

## 1. Overview

Sheikha ecosystem operates across **two primary repositories** with a **neural cell network** bridging mechanism:

| Repository | Owner | Access | Role |
|-----------|-------|--------|------|
| **Sheikha-Market/sheikha-main-portal** | Sheikha-Market | ✅ SSH + HTTPS | Primary Origin (Accessible to VPS 31.97.190.74) |
| **Sheikha-top/sheikha-enterprise-portal** | Sheikha-top | ⚠️ HTTPS only (VPS) | Enterprise Cell (Reference repository) |

### Cell Definition

Each repository functions as a **neural cell** in the distributed system:

- **Root Reference Cell** (`Sheikha-Market/sheikha-main-portal`): Source-of-truth for runtime, observability, deployment config
- **Enterprise Cell** (`Sheikha-top/sheikha-enterprise-portal`): Contains strategic docs, business models, foundation materials
- **Sync Points**: Designated branches and documents that sync bidirectionally

---

## 2. Git Remote Configuration

### Local Machine Setup

```bash
# Primary remote (accessible to VPS)
git remote set-url origin git@github.com:Sheikha-Market/sheikha-main-portal.git

# Enterprise remote (for strategic docs)
git remote add enterprise https://github.com/Sheikha-top/sheikha-enterprise-portal.git

# Verify setup
git remote -v
```

**Expected output:**
```
enterprise      https://github.com/Sheikha-top/sheikha-enterprise-portal.git (fetch)
enterprise      https://github.com/Sheikha-top/sheikha-enterprise-portal.git (push)
github          git@github.com:Sheikha-Market/Sheikha-Market.git (fetch)
github          git@github.com:Sheikha-Market/Sheikha-Market.git (push)
gitlab          git@gitlab.com:Sheikha/sheikha.git (fetch)
gitlab          git@gitlab.com:Sheikha/sheikha.git (push)
origin          git@github.com:Sheikha-Market/sheikha-main-portal.git (fetch)
origin          git@github.com:Sheikha-Market/sheikha-main-portal.git (push)
```

### VPS 31.97.190.74 Setup

```bash
# Clone from accessible origin only
git clone https://github.com/Sheikha-Market/sheikha-main-portal.git

# Add enterprise as read-only reference
git remote add enterprise https://github.com/Sheikha-top/sheikha-enterprise-portal.git

# Fetch enterprise docs (no push permission)
git fetch enterprise --no-tags
```

---

## 3. Synchronization Strategy

### 3.1 Branch Sync Hierarchy

#### Tier 1: Runtime/Stability Branches (Origin → Enterprise)
**Direction:** `origin` → `enterprise` (one-way sync)
**Frequency:** After every production deployment
**Branches:**
- `stable/runtime-baseline`
- `stable/production`
- `rings/production`

**Action:**
```bash
# Local machine
git fetch origin stable/runtime-baseline
git push enterprise stable/runtime-baseline -f
```

#### Tier 2: Feature Branches (Bidirectional Sync)
**Direction:** `origin` ↔ `enterprise` (manual sync)
**Frequency:** Weekly or on demand
**Branches:**
- `feature/targeted-improvement`
- `feature/*` (all feature branches)

**Action:**
```bash
# Push feature to origin (primary)
git push origin feature/targeted-improvement

# Also sync to enterprise for visibility
git push enterprise feature/targeted-improvement
```

#### Tier 3: Strategic Document Sync (Enterprise → Origin)
**Direction:** `enterprise` → `origin` (one-way sync)
**Frequency:** When enterprise docs change
**Paths:**
- `docs/VISION.md`
- `docs/FOUNDATIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/BUSINESS-MODELS.md`

**Action:**
```bash
# Fetch enterprise changes
git fetch enterprise

# Cherry-pick doc updates to main branch
git checkout main
git pull origin main
git merge -X theirs enterprise/main -- docs/VISION.md docs/FOUNDATIONS.md docs/ARCHITECTURE.md docs/BUSINESS-MODELS.md
git push origin main
```

### 3.2 File Ownership Matrix

| Path | Owner | Sync | Read-Only |
|------|-------|------|-----------|
| `lib/runtime/*` | origin | ✅ origin→enterprise | ❌ |
| `lib/observability/*` | origin | ✅ origin→enterprise | ❌ |
| `ecosystem.config.js` | origin | ✅ origin→enterprise | ❌ |
| `docs/VISION.md` | enterprise | ✅ enterprise→origin | ✅ (origin) |
| `docs/FOUNDATIONS.md` | enterprise | ✅ enterprise→origin | ✅ (origin) |
| `docs/BUSINESS-*.md` | enterprise | ✅ enterprise→origin | ✅ (origin) |
| `docs/deployment/*` | origin | ❌ | ❌ |
| `.runtime-fingerprint` | origin | ✅ origin→enterprise | ❌ |
| `data/` | origin | ❌ (local only) | ✅ |

---

## 4. Neural Cell Bridging Protocol

### 4.1 Cell Communication Flow

```
┌─────────────────────────────────────────────────┐
│  Developer Machine (Local)                       │
│  - Git workspace with both remotes               │
│  - Commits to origin (primary)                   │
│  - Syncs enterprise docs                         │
└────────┬────────────────────────────────────────┘
         │
         ├─ git push origin feature/targeted-improvement
         │
         └─ git push enterprise (optional)

            ↓

┌─────────────────────────────────────────────────┐
│  Sheikha-Market/sheikha-main-portal (Origin)    │
│  - Primary source-of-truth                       │
│  - Accessible: SSH + HTTPS                       │
│  - Contains: runtime, observability, deployment  │
└────────┬────────────────────────────────────────┘
         │
         ├─ GitHub Webhook → VPS 31.97.190.74
         │
         └─ git push enterprise (async sync)

            ↓

┌─────────────────────────────────────────────────┐
│  VPS 31.97.190.74 (Deployment Node)             │
│  - Clones from origin (accessible)              │
│  - Runs PM2 sheikha-main-portal                 │
│  - Fetches from enterprise (read-only docs)     │
│  - Monitors /api/observability/summary           │
└─────────────────────────────────────────────────┘
         │
         ↑
         │ (metrics stream back via observability API)

┌─────────────────────────────────────────────────┐
│  Sheikha-top/sheikha-enterprise-portal          │
│  - Strategic docs (VISION, FOUNDATIONS)         │
│  - Business models, feasibility studies          │
│  - Read-only from VPS perspective                │
│  - Synced from origin for runtime stability      │
└─────────────────────────────────────────────────┘
```

### 4.2 Sync Trigger Points

| Event | Action | Direction | SLA |
|-------|--------|-----------|-----|
| Merge to `stable/runtime-baseline` on origin | Auto-sync to enterprise | origin→enterprise | 5 min |
| PR merged to `main` on origin | Auto-sync docs subset | origin→enterprise | 10 min |
| Enterprise doc update | Manual cherry-pick to origin | enterprise→origin | On-demand |
| VPS deployment starts | Clone from origin, fetch enterprise | bidirectional | Deployment start |
| Observability metrics generated | Stream to `/api/observability/summary` | Local only | Real-time |

---

## 5. Deployment Workflow

### 5.1 Local Development → Production

```bash
# Step 1: Feature development on local machine
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "feat: ..."

# Step 2: Update fingerprint (if runtime files changed)
bash tools/runtime/update-fingerprint.sh
git add .runtime-fingerprint
git commit --amend --no-edit

# Step 3: Push to accessible origin
git push -u origin feature/new-feature

# Step 4: (Optional) Sync to enterprise for visibility
git push enterprise feature/new-feature

# Step 5: Create PR on Sheikha-Market/sheikha-main-portal
# - Set base branch to stable/runtime-baseline or main
# - Include changelog in description
```

### 5.2 VPS Deployment

```bash
# SSH into VPS 31.97.190.74
ssh -i ~/.ssh/vps-key user@31.97.190.74

# Step 1: Clone from accessible origin
git clone https://github.com/Sheikha-Market/sheikha-main-portal.git
cd sheikha-main-portal

# Step 2: Checkout desired branch
git checkout stable/runtime-baseline  # or feature/targeted-improvement

# Step 3: Add enterprise as reference (optional)
git remote add enterprise https://github.com/Sheikha-top/sheikha-enterprise-portal.git
git fetch enterprise --no-tags

# Step 4: Install & run
npm install
pm2 start ecosystem.config.js
pm2 save

# Step 5: Verify health
curl http://127.0.0.1:8080/api/live
curl http://127.0.0.1:8080/api/observability/summary
```

### 5.3 Automated Sync Script

**File:** `scripts/sync-neural-cells.sh`

```bash
#!/bin/bash
# Neural Cell Sync Automation
# Usage: bash scripts/sync-neural-cells.sh [sync-type]
# Sync types: runtime, docs, full

SYNC_TYPE=${1:-full}
ORIGIN_REPO="origin"
ENTERPRISE_REPO="enterprise"

echo "[Neural Cell] Sync initiated: $SYNC_TYPE"

case "$SYNC_TYPE" in
  runtime)
    echo "[Sync] Syncing runtime branches: origin → enterprise"
    git fetch $ORIGIN_REPO stable/runtime-baseline
    git push $ENTERPRISE_REPO $ORIGIN_REPO/stable/runtime-baseline:stable/runtime-baseline -f
    echo "✅ Runtime sync complete"
    ;;

  docs)
    echo "[Sync] Syncing strategic docs: enterprise → origin"
    git fetch $ENTERPRISE_REPO main
    git checkout main || git checkout -b main
    git merge -X theirs $ENTERPRISE_REPO/main -- docs/VISION.md docs/FOUNDATIONS.md
    git push $ORIGIN_REPO main
    echo "✅ Docs sync complete"
    ;;

  full)
    echo "[Sync] Full bidirectional sync initiated"
    bash scripts/sync-neural-cells.sh runtime
    bash scripts/sync-neural-cells.sh docs
    echo "✅ Full neural cell sync complete"
    ;;

  *)
    echo "❌ Unknown sync type: $SYNC_TYPE"
    exit 1
    ;;
esac

echo "[Neural Cell] Sync timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

---

## 6. Monitoring & Health Checks

### 6.1 Sync Status Endpoint

**Endpoint:** `GET /api/neural-sync/status` (to be implemented)

**Response:**
```json
{
  "lastSync": "2026-05-13T15:30:00Z",
  "origin": {
    "branch": "stable/runtime-baseline",
    "commit": "abc123def456",
    "status": "synced"
  },
  "enterprise": {
    "branch": "stable/runtime-baseline",
    "commit": "abc123def456",
    "status": "synced",
    "lag": 0
  },
  "cells": {
    "primary": "Sheikha-Market/sheikha-main-portal",
    "strategic": "Sheikha-top/sheikha-enterprise-portal"
  }
}
```

### 6.2 Sync Health Checks

| Check | Frequency | Alert Threshold |
|-------|-----------|-----------------|
| Runtime branch sync lag | Every 5 min | > 10 min |
| Doc changes detection | Every 30 min | Any change without PR |
| VPS git fetch status | Every 1 hour | Fetch fails 3x |
| Fingerprint mismatch | Real-time | Any mismatch detected |

---

## 7. Contingency & Rollback

### 7.1 If Origin Deployment Fails

```bash
# Revert to last stable commit
git reset --hard enterprise/stable/runtime-baseline
pm2 restart sheikha-main-portal
```

### 7.2 If Enterprise Sync Fails

```bash
# Don't block origin, log issue
echo "[Sync Error] Enterprise push failed at $(date)" >> logs/sync-failures.log

# Retry later
git push enterprise stable/runtime-baseline -f
```

### 7.3 If VPS SSH Permissions Change

**Solution:** Switch VPS deployment method:

```bash
# Current method (HTTPS)
git clone https://github.com/Sheikha-Market/sheikha-main-portal.git

# Alternative method (SSH with key)
git clone git@github.com:Sheikha-Market/sheikha-main-portal.git

# Token-based method (CI/CD)
git clone https://$GITHUB_TOKEN@github.com/Sheikha-Market/sheikha-main-portal.git
```

---

## 8. Security Considerations

### 8.1 Access Control

- ✅ **Origin (Sheikha-Market/sheikha-main-portal)**: VPS has read-only access
- ✅ **Enterprise (Sheikha-top/sheikha-enterprise-portal)**: VPS has read-only access
- ✅ **Local machine**: Full read-write to both via SSH keys

### 8.2 Credential Management

```bash
# Store SSH keys securely
chmod 600 ~/.ssh/github-sheikha-market
chmod 600 ~/.ssh/github-sheikha-top

# Add to SSH agent
ssh-add ~/.ssh/github-sheikha-market
ssh-add ~/.ssh/github-sheikha-top

# For VPS: Use GitHub token with limited scope
# Token permissions: read:repo, write:repo (no delete)
```

### 8.3 Audit Trail

- All syncs logged to `logs/sync-audit.ndjson`
- Fingerprint changes tracked in `.runtime-fingerprint`
- GitHub webhooks configured for deployment events

---

## 9. Troubleshooting

### Q: Why doesn't feature/targeted-improvement show upstream tracking?

**A:** Upstream tracking is optional. To set it:
```bash
git branch -u origin/feature/targeted-improvement
```

### Q: Can I push directly to enterprise from VPS?

**A:** No. VPS has HTTPS read-only access. Use local machine for enterprise pushes.

### Q: How do I sync changes from one cell to another?

**A:** Use the workflow in Section 5 or run:
```bash
bash scripts/sync-neural-cells.sh [sync-type]
```

### Q: What if enterprise and origin have conflicting docs?

**A:** Origin wins for runtime/deployment files. Enterprise wins for strategic/business docs. Manual resolution via cherry-pick merge.

---

## 10. Roadmap

- [ ] Implement `/api/neural-sync/status` endpoint
- [ ] Create automated sync scheduler (GitHub Actions)
- [ ] Add webhook for deployment notifications
- [ ] Build sync health dashboard
- [ ] Document VPS failover procedures
- [ ] Implement cross-cell tracing for observability

---

**Next Action:** Implement automated sync scheduler on GitHub Actions to handle runtime branch syncs.

**Questions?** Refer to `docs/deployment/` directory or review `/api/observability/summary` for current system state.
