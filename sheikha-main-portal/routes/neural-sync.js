// بسم الله الرحمن الرحيم
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠🔗 NEURAL SYNC — مزامنة الشبكة العصبية الجذرية بين المستودعات
 *    SHEIKHA Root Neural Cells Network — Multi-Repo Sync Status
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * «وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا» — آل عمران: 103
 *
 *  GET  /api/neural-sync/status   — حالة المزامنة بين المستودعين
 *  POST /api/neural-sync/trigger  — تشغيل المزامنة يدوياً (يتطلب مصادقة)
 *  GET  /api/neural-sync/policy   — سياسة المزامنة متعددة المستودعات
 *
 * الخلايا الأساسية:
 *   primary    → Sheikha-Market/sheikha-main-portal    (origin)
 *   strategic  → Sheikha-top/sheikha-enterprise-portal (enterprise)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express  = require('express');
const router   = express.Router();
const { execSync } = require('child_process');
const path     = require('path');
const fs       = require('fs');

// ── ثوابت الشبكة العصبية / Network Constants ─────────────────────────────────
const NETWORK_NAME    = 'SHEIKHA Root Neural Cells Network';
const CELL_PRIMARY    = 'Sheikha-Market/sheikha-main-portal';
const CELL_STRATEGIC  = 'Sheikha-top/sheikha-enterprise-portal';
const SYNC_SCRIPT     = 'tools/neural/sync-neural-cells.sh';
const POLICY_DOC      = 'docs/deployment/MULTI-REPO-SYNC-POLICY.md';

// ── مخزن آخر مزامنة / Last-sync in-memory store ─────────────────────────────
let lastSyncTimestamp = null;

// ── دوال مساعدة / Helper utilities ──────────────────────────────────────────

/**
 * تنفيذ أمر git بأمان وإرجاع الناتج
 * Safely run a git command and return stdout, or null on failure
 */
function gitExec(cmd) {
    try {
        return execSync(cmd, { cwd: process.cwd(), timeout: 8000 }).toString().trim();
    } catch (_) {
        return null;
    }
}

/**
 * التحقق إذا كان الـ remote مُهيأً
 * Check whether a named git remote is configured
 */
function isRemoteConfigured(remoteName) {
    const url = gitExec(`git remote get-url ${remoteName} 2>/dev/null`);
    return typeof url === 'string' && url.length > 0;
}

/**
 * قراءة آخر commit لـ remote/branch
 * Get the commit SHA for a remote-tracking branch
 */
function getRemoteCommit(remoteName, branch) {
    return gitExec(`git rev-parse ${remoteName}/${branch} 2>/dev/null`);
}

/**
 * قراءة اسم الفرع الحالي لـ remote من .env.neural-sync أو قيمة افتراضية
 * Read the configured branch for a remote from .env.neural-sync
 */
function readBranchConfig(key, fallback) {
    try {
        const envFile = path.join(process.cwd(), '.env.neural-sync');
        if (fs.existsSync(envFile)) {
            const lines = fs.readFileSync(envFile, 'utf8').split('\n');
            for (const line of lines) {
                const [k, v] = line.split('=');
                if (k && k.trim() === key && v) return v.trim();
            }
        }
    } catch (_) {}
    return fallback;
}

/**
 * بناء كائن معلومات remote
 * Build a remote info object
 */
function buildRemoteInfo(remoteName, branchKey, defaultBranch) {
    const configured = isRemoteConfigured(remoteName);
    const branch     = readBranchConfig(branchKey, defaultBranch);
    const commit     = configured ? getRemoteCommit(remoteName, branch) : null;

    let status = 'unknown';
    if (configured && commit)  status = 'ready';
    else if (configured)       status = 'configured';

    const info = { branch, commit, remoteConfigured: configured, status };

    // حساب التأخر بين المستودعين — compute lag if both commits are available
    if (remoteName === 'enterprise') {
        const originBranch = readBranchConfig('ORIGIN_BRANCH', 'main');
        const originCommit = isRemoteConfigured('origin')
            ? getRemoteCommit('origin', originBranch)
            : null;
        if (commit && originCommit) {
            try {
                const count = gitExec(
                    `git rev-list --count ${commit}..${originCommit} 2>/dev/null`
                );
                info.lag = count !== null ? parseInt(count, 10) : null;
            } catch (_) {
                info.lag = null;
            }
        } else {
            info.lag = null;
        }
    }

    return info;
}

// ── GET /status ───────────────────────────────────────────────────────────────
/**
 * حالة مزامنة الشبكة العصبية الجذرية
 * Returns the real-time sync status for both neural cell repositories
 */
router.get('/status', (req, res) => {
    try {
        const origin     = buildRemoteInfo('origin',     'ORIGIN_BRANCH',     'main');
        const enterprise = buildRemoteInfo('enterprise', 'ENTERPRISE_BRANCH', 'stable/runtime-baseline');

        const bothReady = origin.status === 'ready' && enterprise.status === 'ready';

        res.json({
            success:  true,
            network:  NETWORK_NAME,
            status:   bothReady ? 'active' : 'degraded',
            lastSync: lastSyncTimestamp,
            cells: {
                primary:   CELL_PRIMARY,
                strategic: CELL_STRATEGIC,
            },
            origin,
            enterprise,
            runtime: {
                syncScript: SYNC_SCRIPT,
                policyDoc:  POLICY_DOC,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            network: NETWORK_NAME,
            error:   err.message,
            timestamp: new Date().toISOString(),
        });
    }
});

// ── POST /trigger ─────────────────────────────────────────────────────────────
/**
 * تشغيل المزامنة يدوياً — يتطلب VPS key أو JWT
 * Manually trigger the sync script (requires SHEIKHA_VPS_KEY header)
 */
router.post('/trigger', (req, res) => {
    // التحقق البسيط من المفتاح — Simple API key guard
    const providedKey = req.headers['x-sheikha-vps-key'] || req.body?.key;
    const expectedKey = process.env.SHEIKHA_ENTERPRISE_VPS_KEY ||
                        process.env.SHEIKHA_VPS_KEY ||
                        process.env.VPS_KEY || '';

    if (!expectedKey || providedKey !== expectedKey) {
        return res.status(401).json({ success: false, error: 'غير مصرح — Unauthorized' });
    }

    const scriptPath = path.join(process.cwd(), SYNC_SCRIPT);
    if (!fs.existsSync(scriptPath)) {
        return res.status(404).json({
            success: false,
            error:   `سكريبت المزامنة غير موجود: ${SYNC_SCRIPT}`,
        });
    }

    try {
        const syncType = req.body?.type || 'full';
        const output   = execSync(
            `bash "${scriptPath}" ${syncType}`,
            { cwd: process.cwd(), timeout: 60000 }
        ).toString();

        lastSyncTimestamp = new Date().toISOString();

        res.json({
            success:   true,
            syncType,
            output,
            timestamp: lastSyncTimestamp,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error:   err.message,
            output:  err.stdout?.toString() || '',
            timestamp: new Date().toISOString(),
        });
    }
});

// ── GET /policy ───────────────────────────────────────────────────────────────
/**
 * قراءة وثيقة سياسة المزامنة متعددة المستودعات
 * Returns the multi-repo sync policy document as plain text
 */
router.get('/policy', (req, res) => {
    const policyPath = path.join(process.cwd(), POLICY_DOC);
    if (!fs.existsSync(policyPath)) {
        return res.status(404).json({ success: false, error: `الملف غير موجود: ${POLICY_DOC}` });
    }
    res.type('text/markdown; charset=utf-8');
    res.send(fs.readFileSync(policyPath, 'utf8'));
});

module.exports = router;
