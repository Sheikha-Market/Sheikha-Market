/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      SHEIKHA CLOUD ROOT                                     ║
 * ║             جذر طبقة السحابة — النشر والبيئات والنسخ الاحتياطي              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * مكوّنات Sheikha Cloud:
 *  - إدارة البيئات (local / dev / pilot / production)
 *  - تتبع حالة النشر
 *  - إدارة السرائر (Secrets)
 *  - المراقبة والإعادة التلقائية
 *  - النسخ الاحتياطي
 */

'use strict';

const os   = require('os');
const path = require('path');

// ─── Cloud Config ─────────────────────────────────────────────────────────────

const CLOUD_CONFIG = {
    name:    'Sheikha Cloud',
    version: '1.0.0',
    regions: ['local', 'vps-primary', 'cloud-backup'],
    domains: {
        root:   'sheikha.top',
        api:    'api.sheikha.top',
        admin:  'admin.sheikha.top',
        core:   'core.sheikha.top',
        market: 'market.sheikha.top',
        ai:     'ai.sheikha.top',
    },
};

// ─── Environment Manager ──────────────────────────────────────────────────────

const ENVIRONMENTS = {
    local:      { production: false, debug: true,  deployable: true  },
    dev:        { production: false, debug: true,  deployable: true  },
    pilot:      { production: false, debug: false, deployable: true  },
    production: { production: true,  debug: false, deployable: true  },
};

/**
 * البيئة الحالية
 */
function currentEnvironment() {
    const env = process.env.NODE_ENV || 'local';
    return {
        name: env,
        ...(ENVIRONMENTS[env] || ENVIRONMENTS.local),
    };
}

// ─── Deployment Tracker ───────────────────────────────────────────────────────

const _deployments = [];

/**
 * تسجيل نشر جديد
 * @param {object} data — { version, environment, actor, notes }
 */
function recordDeployment(data) {
    const deploy = {
        id:         `deploy_${Date.now()}`,
        version:    data.version   || 'unknown',
        environment: data.environment || currentEnvironment().name,
        actor:      data.actor     || 'system',
        notes:      data.notes     || '',
        startedAt:  new Date().toISOString(),
        status:     'started',
    };
    _deployments.push(deploy);
    console.log(`[CLOUD-ROOT] 🚀 نشر: ${deploy.id} — بيئة: ${deploy.environment}`);
    return deploy;
}

/**
 * إنهاء نشر
 * @param {string} deployId
 * @param {string} status — 'success' | 'failed' | 'rolled-back'
 */
function finishDeployment(deployId, status = 'success') {
    const deploy = _deployments.find(d => d.id === deployId);
    if (!deploy) return null;
    deploy.status     = status;
    deploy.finishedAt = new Date().toISOString();
    console.log(`[CLOUD-ROOT] ${status === 'success' ? '✅' : '❌'} نشر ${deployId}: ${status}`);
    return deploy;
}

/**
 * آخر النشرات
 * @param {number} limit
 */
function recentDeployments(limit = 10) {
    return _deployments.slice(-limit);
}

// ─── Secret Manager ───────────────────────────────────────────────────────────

/**
 * جلب سرّ من متغيرات البيئة (المصدر الوحيد المقبول)
 * @param {string} key
 * @param {string} fallback
 */
function getSecret(key, fallback = '') {
    const val = process.env[key];
    if (!val) {
        console.warn(`[CLOUD-ROOT] ⚠️  السرّ "${key}" غير موجود في البيئة`);
    }
    return val || fallback;
}

// ─── Health Beacon ────────────────────────────────────────────────────────────

const _beacons = new Map(); // regionName → { lastPing, healthy }

/**
 * إرسال نبضة صحة لمنطقة
 * @param {string} region
 * @param {boolean} healthy
 */
function pingBeacon(region, healthy = true) {
    _beacons.set(region, { lastPing: new Date().toISOString(), healthy });
}

/**
 * حالة النبضات
 */
function beaconStatus() {
    return Object.fromEntries(_beacons.entries());
}

// ─── Backup Manager ───────────────────────────────────────────────────────────

const _backups = [];

/**
 * تسجيل نسخة احتياطية
 * @param {object} meta — { type, path, sizeBytes }
 */
function recordBackup(meta) {
    const backup = {
        id:        `backup_${Date.now()}`,
        ...meta,
        createdAt: new Date().toISOString(),
        status:    'complete',
    };
    _backups.push(backup);
    if (_backups.length > 200) _backups.shift();
    console.log(`[CLOUD-ROOT] 💾 نسخة احتياطية: ${backup.id}`);
    return backup;
}

/**
 * آخر النسخ
 * @param {number} limit
 */
function recentBackups(limit = 10) {
    return _backups.slice(-limit);
}

// ─── Cloud Status ─────────────────────────────────────────────────────────────

function status() {
    return {
        ...CLOUD_CONFIG,
        environment:      currentEnvironment(),
        deployments:      _deployments.length,
        lastDeployment:   _deployments.at(-1) || null,
        beacons:          beaconStatus(),
        backups:          _backups.length,
        checkedAt:        new Date().toISOString(),
    };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    console.log('[CLOUD-ROOT] ☁️  تشغيل Sheikha Cloud...');
    const env = currentEnvironment();
    console.log(`[CLOUD-ROOT]    البيئة: ${env.name} | production: ${env.production}`);
    pingBeacon('local', true);
    console.log('[CLOUD-ROOT] ✅ جاهز');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    CLOUD_CONFIG,
    ENVIRONMENTS,
    init,
    currentEnvironment,
    recordDeployment,
    finishDeployment,
    recentDeployments,
    getSecret,
    pingBeacon,
    beaconStatus,
    recordBackup,
    recentBackups,
    status,
};
