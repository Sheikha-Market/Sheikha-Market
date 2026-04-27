# 📋 Sheikha Market — Build Changelog (سجل البناء المؤرخ)

> **Branch:** `copilot/fix-neural-network-endpoints`  
> **Repo:** `Sheikha-Market/Sheikha-Market`  
> **Generated:** 2026-04-27  

---

## 🔴 CRITICAL: Running Server Out of Date

**Problem:** The running server process (`PID 669991`, uptime ~2699s ≈ started ~09:35 AM) is an **OLD build** that predates fix `a1709e4`. This is a *separate process* from PM2's `sheikha-api` (id 48).

**Proof:**
```
Response: heapUsedMB=42, heapPct=98 → 503  (old logic: pct < 90 only)
Fix logic: heapMB < 200 || pct < 90   → 200 (heapMB=42 < 200 = true)
```

**Fix — Run on your server:**
```bash
# Step 1 — Pull the latest server.js from the PR branch
git fetch origin
git show origin/copilot/fix-neural-network-endpoints:sheikha-main-portal/server.js \
  > /home/sheikha/Projects/sheikha/sheikha-main-portal/server.js

# Step 2 — Also pull the new memory routes file (added 2026-04-27 16:36)
git show origin/copilot/fix-neural-network-endpoints:sheikha-main-portal/routes/memory.routes.js \
  > /home/sheikha/Projects/sheikha/sheikha-main-portal/routes/memory.routes.js

git show origin/copilot/fix-neural-network-endpoints:sheikha-main-portal/lib/sheikha-memory-learning-engine.js \
  > /home/sheikha/Projects/sheikha/sheikha-main-portal/lib/sheikha-memory-learning-engine.js

# Step 3 — Kill the old orphan process and restart via PM2
fuser -k 8080/tcp 2>/dev/null || true
pm2 restart sheikha-api --update-env
sleep 5

# Step 4 — Verify
curl http://127.0.0.1:8080/api/memory/health
# Expected: {"success":true,"status":"healthy",...}
```

---

## 📅 PR Build History (Commits — Newest First)

| # | Commit | Date & Time | Build Description |
|---|--------|-------------|-------------------|
| 15 | `26681e6` | 2026-04-27 16:36:24 | fix: SheikhaMemoryLearningEngine lib+route, constructor fix, named thresholds |
| 14 | `a1709e4` | 2026-04-27 16:09:01 | **🔑 KEY FIX**: memory/health → 200 on small heaps (`heapMB < 200 \|\| pct < 90`) |
| 13 | `ace9577` | 2026-04-27 14:47:41 | fix: governance health checks added to smoke test |
| 12 | `09f2456` | 2026-04-27 14:14:40 | fix: failsafe inline routes before 404 — governance/health + network/live/ready/health |
| 11 | `c71de1c` | 2026-04-27 13:49:09 | fix: mount governance.routes.js at /api/governance — resolves 404 |
| 10 | `b24615c` | 2026-04-27 13:22:30 | fix: add missing smoke-test endpoints (network/live, /ready, /health, offline/status, realtime/health) |
| 9  | `3b0ce28` | 2026-04-27 12:57:14 | feat: Sheikha Governance Protocol — sheikha-control.sh + governance API + lib + dashboard |
| 8  | `b8cf0df` | 2026-04-27 12:41:22 | feat: unified governor activate-sheikha.sh + npm aliases + direct-run guard |
| 7  | `08bb0a4` | 2026-04-27 12:09:19 | fix: npm script aliases for ops:activate:full-power:plan/apply and ops:activate:ultimate:stable |
| 6  | `d6d1f2b` | 2026-04-27 12:03:01 | fix: mount CUDA routes in server.js + pipeline health check in full-power script |
| 5  | `836b392` | 2026-04-27 11:28:08 | feat: activate-sheikha-full-power.sh + activate-sheikha-ultimate-stable.sh with npm scripts |
| 4  | `ae1568e` | 2026-04-27 10:50:34 | feat: PM2 wrapper, server npm scripts, CHANGELOG, FIXES-REGISTRY |
| 3  | `89c411d` | 2026-04-27 10:39:36 | fix: unified routes, 404 handler moved to end, failsafe health endpoints added |
| 2  | `c6733e5` | 2026-04-27 10:36:42 | fix: direct pipeline health handler + route audit finalized |
| 1  | `4091233` | 2026-04-27 10:32:21 | plan: comprehensive route audit and conflict resolution |

---

## 🏗️ Build Foundation Timeline

| Date | Event |
|------|-------|
| 2026-04-23 21:35 | Sheikha Supreme CS Engine — 8-layer neural system (Quran+Sunnah) |
| 2026-04-25 12:16 | Plan: fix iraab bug + time/governance/grammar rules + neural network |
| 2026-04-25 12:40 | Complete Arabic grammar rules engine (75 neural cells, programming mapping) |
| 2026-04-25 16:06 | Sheikha Universal Neural Network — 16 layers, 100 cells |
| 2026-04-25 16:26 | IP + World-First achievements documentation |
| 2026-04-25 21:22 | Khulafa Rashideen neural network — 5 layers, 56 cells |
| 2026-04-25 21:52 | Quran-Sunnah-Khulafa master neural network — 3 modules, 128 cells |
| 2026-04-25 22:20 | Sheikha Language full engineering — grammar + 14 sciences + MNN |
| 2026-04-25 22:57 | Sheikha Language Neural Cell Network — 63 cells, 5 layers, 2263 params |
| 2026-04-25 23:11 | Sheikha Protocol v2 + Master NNN — 7 domains, 100 cells, 6 layers |
| 2026-04-26 02:13 | SHL neural cell network API routes |
| 2026-04-26 04:18 | Security: bump production-dependencies (Dependabot) |
| **2026-04-27 10:32** | **🚀 PR BRANCH START**: Route audit begins |
| 2026-04-27 10:36 | Fix: pipeline health handler + route audit |
| 2026-04-27 10:39 | Fix: 404 handler moved, failsafe health endpoints |
| 2026-04-27 10:50 | PM2 wrapper + server npm scripts |
| 2026-04-27 11:28 | Activation scripts (full-power + ultimate-stable) |
| 2026-04-27 12:03 | CUDA routes mounted + pipeline health |
| 2026-04-27 12:09 | npm script aliases |
| 2026-04-27 12:41 | Unified governor + npm aliases |
| 2026-04-27 12:57 | **Sheikha Governance Protocol** (sheikha-control.sh) |
| 2026-04-27 13:22 | Missing smoke test endpoints added |
| 2026-04-27 13:49 | Governance routes mounted at /api/governance |
| 2026-04-27 14:14 | Failsafe inline routes (governance + network) |
| 2026-04-27 14:47 | Governance health in smoke test |
| **2026-04-27 16:09** | **🔑 memory/health 503→200 FIX** (`heapMB<200\|\|pct<90`) |
| **2026-04-27 16:36** | **✅ LATEST**: SheikhaMemoryLearningEngine + routes/memory.routes.js |

---

## 🧠 Key Fix Details: `/api/memory/health` 503 → 200

**Root Cause:** V8 starts with a tiny heap (~42MB) and expands on demand. On startup, `heapPct = heapUsed/heapTotal ≈ 98%` — but this is NOT real memory pressure.

**Old code (broken):**
```js
const ok = rssMB < 1024 && pct < 90;
// heapPct=98 → pct < 90 = FALSE → ok=false → 503 ❌
```

**New code (fixed) — `server.js` line 36752 & `routes/memory.routes.js` line 42:**
```js
const ok = rssMB < 1024 && (heapMB < 200 || pct < 90);
// heapMB=42 < 200 = TRUE → ok=true → 200 ✅
```

**Named thresholds (in `routes/memory.routes.js`):**
```js
const MAX_RSS_MB         = 1024;  // RSS above this = unhealthy
const MIN_HEAP_THRESHOLD = 200;   // Heap under this MB = healthy regardless of pct
const MAX_HEAP_PCT       = 90;    // Heap percent above this (on large heaps) = degraded
```

---

## 📁 New Files Added in This PR

| File | Added | Purpose |
|------|-------|---------|
| `scripts/sheikha-control.sh` | 2026-04-27 12:57 | Central governance controller |
| `scripts/activate-sheikha.sh` | 2026-04-27 12:41 | Unified activation script |
| `scripts/activate-sheikha-full-power.sh` | 2026-04-27 11:28 | Full-power mode |
| `scripts/activate-sheikha-ultimate-stable.sh` | 2026-04-27 11:28 | Stable mode |
| `routes/governance.routes.js` | 2026-04-27 12:57 | /api/governance/* endpoints |
| `routes/memory.routes.js` | 2026-04-27 16:36 | /api/memory/* endpoints (with fix) |
| `lib/sheikha-governance-protocol.js` | 2026-04-27 12:57 | Governance library |
| `lib/sheikha-memory-learning-engine.js` | 2026-04-27 16:36 | Memory AI engine |
| `data/governance-log.json` | 2026-04-27 12:57 | Governance audit log |
| `data/governance-metrics.json` | 2026-04-27 12:57 | Governance metrics |
| `public/gov-dashboard.html` | 2026-04-27 12:57 | Governance dashboard |

---

*آخر تحديث: 2026-04-27 16:36 UTC — الإصلاح مُطبَّق في الفرع — الخادم المحلي يحتاج تحديث يدوي*
