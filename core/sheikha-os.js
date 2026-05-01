/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                         SHEIKHA OS                                          ║
 * ║              طبقة نظام التشغيل — المراقبة والتحكم والتشغيل                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * Sheikha OS ليس kernel جديدًا، بل طبقة تحكم وأوامر وفحص وتشغيل وهوية وتكامل.
 *
 * الوظائف الأساسية:
 *  - مراقبة الخدمات
 *  - تشغيل / إيقاف العمليات
 *  - فحص الصحة
 *  - إعلان الحالة
 *  - توحيد الأوامر
 */

'use strict';

const os     = require('os');
const fs     = require('fs');
const path   = require('path');
const { execSync } = require('child_process');

// ─── OS Identity ──────────────────────────────────────────────────────────────

const OS_ID = {
    name:     'Sheikha OS',
    version:  '1.0.0',
    platform: process.platform,
    arch:     process.arch,
    nodeVersion: process.version,
    pid:      process.pid,
    bootTime: new Date().toISOString(),
};

// ─── Service Registry ────────────────────────────────────────────────────────

const _services = new Map(); // serviceName → { status, startedAt, meta }

/**
 * تسجيل خدمة في طبقة OS
 * @param {string} name
 * @param {object} meta
 */
function registerService(name, meta = {}) {
    _services.set(name, { status: 'registered', startedAt: null, meta });
    console.log(`[SHEIKHA-OS] 📋 خدمة مسجّلة: ${name}`);
}

/**
 * تشغيل خدمة مسجّلة
 * @param {string} name
 */
function startService(name) {
    if (!_services.has(name)) {
        console.warn(`[SHEIKHA-OS] ⚠️  الخدمة "${name}" غير مسجّلة`);
        return false;
    }
    const svc = _services.get(name);
    svc.status    = 'running';
    svc.startedAt = new Date().toISOString();
    _services.set(name, svc);
    console.log(`[SHEIKHA-OS] ▶️  تشغيل: ${name}`);
    return true;
}

/**
 * إيقاف خدمة
 * @param {string} name
 */
function stopService(name) {
    if (!_services.has(name)) return false;
    const svc = _services.get(name);
    svc.status = 'stopped';
    _services.set(name, svc);
    console.log(`[SHEIKHA-OS] ⏹  إيقاف: ${name}`);
    return true;
}

/**
 * حالة خدمة
 * @param {string} name
 */
function serviceStatus(name) {
    return _services.get(name) || null;
}

// ─── System Metrics ───────────────────────────────────────────────────────────

/**
 * مقاييس النظام الفورية
 */
function systemMetrics() {
    const totalMem = os.totalmem();
    const freeMem  = os.freemem();
    const usedMem  = totalMem - freeMem;
    const loadAvg  = os.loadavg();

    return {
        cpu: {
            cores:   os.cpus().length,
            model:   os.cpus()[0]?.model || 'unknown',
            loadAvg: { '1m': loadAvg[0], '5m': loadAvg[1], '15m': loadAvg[2] },
        },
        memory: {
            total:   totalMem,
            used:    usedMem,
            free:    freeMem,
            usedPct: ((usedMem / totalMem) * 100).toFixed(1) + '%',
        },
        uptime:    os.uptime(),
        hostname:  os.hostname(),
        platform:  os.platform(),
    };
}

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * فحص صحة المنظومة
 */
function healthCheck() {
    const metrics = systemMetrics();
    const memUsedPct = parseFloat(metrics.memory.usedPct);
    const load1m     = metrics.cpu.loadAvg['1m'];
    const cores      = metrics.cpu.cores;

    const warnings = [];
    if (memUsedPct > 85) warnings.push(`ذاكرة عالية: ${metrics.memory.usedPct}`);
    if (load1m > cores * 0.9) warnings.push(`حمل CPU عالٍ: ${load1m.toFixed(2)}`);

    const services = Object.fromEntries(_services.entries());

    return {
        healthy:  warnings.length === 0,
        warnings,
        metrics,
        services,
        checkedAt: new Date().toISOString(),
    };
}

// ─── Command Bus ──────────────────────────────────────────────────────────────

const _commandHandlers = new Map();

/**
 * تسجيل معالج أمر
 * @param {string} command
 * @param {Function} handler
 */
function onCommand(command, handler) {
    _commandHandlers.set(command, handler);
}

/**
 * تنفيذ أمر
 * @param {string} command
 * @param {*} payload
 */
async function executeCommand(command, payload) {
    const handler = _commandHandlers.get(command);
    if (!handler) {
        return { ok: false, error: `أمر غير معرّف: ${command}` };
    }
    try {
        const result = await handler(payload);
        return { ok: true, result };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    console.log('[SHEIKHA-OS] 🖥  تشغيل Sheikha OS...');
    console.log(`[SHEIKHA-OS]    النظام: ${OS_ID.platform} (${OS_ID.arch})`);
    console.log(`[SHEIKHA-OS]    Node:   ${OS_ID.nodeVersion}`);
    console.log(`[SHEIKHA-OS]    PID:    ${OS_ID.pid}`);
    console.log('[SHEIKHA-OS] ✅ Sheikha OS جاهز');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    OS_ID,
    init,
    registerService,
    startService,
    stopService,
    serviceStatus,
    systemMetrics,
    healthCheck,
    onCommand,
    executeCommand,
};
