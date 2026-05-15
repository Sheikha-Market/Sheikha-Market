/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║       SHEIKHA Security Fabric — طبقة الأمان والحماية السيادية                ║
 * ║         SHEIKHA Sovereign Cognitive Infrastructure                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * مبدأ الأمان: Deny-by-Default
 *   — لا شيء مسموح إلا إذا مُنحت الصلاحية صراحةً
 *
 * المسؤوليات:
 *   - runtime security posture  — وضعية الأمان التشغيلية
 *   - threat detection          — كشف التهديدات
 *   - request validation        — تحقق الطلبات
 *   - rate limiting (runtime)   — تحديد معدل الطلبات
 *   - credential vault          — خزنة بيانات الاعتماد (مراجع فقط)
 *   - security events log       — سجل أحداث الأمان
 *   - allowlist / denylist      — قوائم السماح والحظر
 *
 * @module security/sheikha-security-fabric
 * @version 1.0.0
 * @identity SHEIKHA Sovereign Cognitive Infrastructure
 */

'use strict';

const EventEmitter = require('events');
const crypto = require('crypto');

// ─── Identity ────────────────────────────────────────────────────────────────

const SECURITY_IDENTITY = {
    name: 'SHEIKHA Security Fabric',
    layer: 'Security Layer',
    principle: 'Deny-by-Default',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Security Posture ─────────────────────────────────────────────────────────

/**
 * مستويات وضعية الأمان.
 */
const POSTURE_LEVELS = {
    HARDENED:  'hardened',    // أقصى حماية
    STANDARD:  'standard',    // حماية قياسية
    ELEVATED:  'elevated',    // حالة تأهب مرتفع
    LOCKDOWN:  'lockdown',    // إغلاق تام
};

let _posture = POSTURE_LEVELS.STANDARD;

/**
 * تغيير وضعية الأمان.
 * @param {string} level
 */
function setPosture(level) {
    if (!Object.values(POSTURE_LEVELS).includes(level)) {
        _log('warn', `مستوى وضعية غير معروف: ${level}`);
        return;
    }
    const prev = _posture;
    _posture = level;
    _bus.emit('security:posture', { from: prev, to: level, at: new Date().toISOString() });
    _log('info', `وضعية الأمان: ${prev} → ${level}`);
}

function getPosture() { return _posture; }

// ─── Allowlist / Denylist ─────────────────────────────────────────────────────

/** @type {Set<string>} */
const _allowlist = new Set();
/** @type {Set<string>} */
const _denylist  = new Set();

/**
 * إضافة مسار/مورد إلى قائمة السماح.
 * @param {string} resource
 */
function allow(resource) {
    _allowlist.add(resource);
    _denylist.delete(resource);
    _bus.emit('security:allowed', { resource });
}

/**
 * إضافة مسار/مورد إلى قائمة الحظر.
 * @param {string} resource
 */
function deny(resource) {
    _denylist.add(resource);
    _allowlist.delete(resource);
    _bus.emit('security:denied', { resource });
}

/**
 * التحقق مما إذا كان المورد مسموحاً به.
 * Deny-by-Default: إذا لم يكن في الـ allowlist → مرفوض.
 * @param {string} resource
 * @returns {boolean}
 */
function isAllowed(resource) {
    if (_denylist.has(resource)) return false;
    // في وضعية hardened/lockdown: فقط ما في allowlist
    if (_posture === POSTURE_LEVELS.HARDENED || _posture === POSTURE_LEVELS.LOCKDOWN) {
        return _allowlist.has(resource);
    }
    // في standard/elevated: مسموح إلا إذا كان في denylist
    return !_denylist.has(resource);
}

// ─── Request Validation ───────────────────────────────────────────────────────

/**
 * تحقق من طلب وارد.
 * @param {object} request — {method, path, headers, body}
 * @returns {{valid: boolean, violations: string[]}}
 */
function validateRequest(request) {
    const violations = [];
    const { method, path: reqPath, headers = {}, body } = request;

    // تحقق من الأساسيات
    if (!method) violations.push('missing method');
    if (!reqPath) violations.push('missing path');

    // منع حقن المسار
    if (reqPath && (reqPath.includes('../') || reqPath.includes('..\\') || reqPath.includes('%2e%2e'))) {
        violations.push('path traversal detected');
    }

    // التحقق من حجم الـ body
    const bodyStr = body ? JSON.stringify(body) : '';
    if (bodyStr.length > 1_000_000) { // 1MB
        violations.push('body size exceeds limit');
    }

    // فحص بسيط لـ SQL injection patterns
    const sqlPatterns = /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bDELETE\b.*\bFROM\b)/i;
    if (sqlPatterns.test(bodyStr)) {
        violations.push('potential SQL injection detected');
    }

    const valid = violations.length === 0;

    if (!valid) {
        _log('warn', `طلب مرفوض [${method} ${reqPath}]: ${violations.join(', ')}`);
        _bus.emit('security:request:violation', { request: { method, path: reqPath }, violations });
        _securityLog('request-violation', { method, path: reqPath, violations });
    }

    return { valid, violations };
}

// ─── Rate Limiter (Runtime) ───────────────────────────────────────────────────

/**
 * بيانات تتبع معدل الطلبات.
 * @type {Map<string, {count: number, windowStart: number}>}
 */
const _rateLimits = new Map();

/**
 * التحقق من حد معدل الطلبات.
 * @param {string} identifier   — معرّف المصدر (IP, userId, etc.)
 * @param {number} [maxPerMin=60] — الحد الأقصى في الدقيقة
 * @returns {{allowed: boolean, remaining: number, resetAt: number}}
 */
function checkRateLimit(identifier, maxPerMin = 60) {
    const now = Date.now();
    const windowMs = 60_000;

    if (!_rateLimits.has(identifier)) {
        _rateLimits.set(identifier, { count: 0, windowStart: now });
    }

    const rl = _rateLimits.get(identifier);

    // تجديد النافذة
    if (now - rl.windowStart >= windowMs) {
        rl.count = 0;
        rl.windowStart = now;
    }

    rl.count += 1;
    const allowed = rl.count <= maxPerMin;
    const resetAt = rl.windowStart + windowMs;

    if (!allowed) {
        _bus.emit('security:rate-limit', { identifier, count: rl.count, maxPerMin });
        _securityLog('rate-limit-exceeded', { identifier, count: rl.count });
    }

    return {
        allowed,
        remaining: Math.max(0, maxPerMin - rl.count),
        resetAt,
    };
}

// ─── Threat Detection ─────────────────────────────────────────────────────────

/**
 * سجل التهديدات.
 * @type {Array<object>}
 */
const _threats = [];

/**
 * تسجيل تهديد أمني.
 * @param {string} type
 * @param {string} severity
 * @param {object} detail
 */
function recordThreat(type, severity, detail = {}) {
    const threat = {
        id: crypto.randomBytes(8).toString('hex'),
        type,
        severity,
        detail,
        detectedAt: new Date().toISOString(),
    };
    _threats.push(threat);
    _bus.emit('security:threat', threat);
    _log('warn', `🚨 تهديد مسجّل [${severity}]: ${type}`);
    return threat;
}

/**
 * قائمة التهديدات المسجّلة.
 * @param {number} [limit=50]
 * @returns {object[]}
 */
function getThreats(limit = 50) {
    return _threats.slice(-limit);
}

// ─── Security Event Log ───────────────────────────────────────────────────────

/**
 * سجل أحداث الأمان.
 * @type {Array<object>}
 */
const _securityEvents = [];

/**
 * تسجيل حدث أمني.
 * @param {string} event
 * @param {object} [detail={}]
 */
function _securityLog(event, detail = {}) {
    _securityEvents.push({ event, detail, at: new Date().toISOString() });
}

/**
 * قراءة سجل الأحداث الأمنية.
 * @param {number} [limit=100]
 * @returns {object[]}
 */
function getSecurityLog(limit = 100) {
    return _securityEvents.slice(-limit);
}

// ─── Credential Vault (Reference Store — no actual secrets stored) ─────────────

/**
 * سجل مراجع الاعتمادات (الأسماء فقط — لا قيم مخزّنة).
 * @type {Map<string, {name: string, source: string, registeredAt: string}>}
 */
const _credentialRefs = new Map();

/**
 * تسجيل مرجع اعتماد (اسم env variable أو secret).
 * @param {string} name
 * @param {string} source — 'env' | 'vault' | 'secrets-manager'
 */
function registerCredentialRef(name, source = 'env') {
    _credentialRefs.set(name, { name, source, registeredAt: new Date().toISOString() });
}

/**
 * التحقق من وجود اعتماد في المرجع.
 * @param {string} name
 * @returns {boolean}
 */
function hasCredential(name) {
    return _credentialRefs.has(name);
}

// ─── Status ───────────────────────────────────────────────────────────────────

function status() {
    return {
        ...SECURITY_IDENTITY,
        posture: _posture,
        allowlistSize: _allowlist.size,
        denylistSize: _denylist.size,
        threatsRecorded: _threats.length,
        securityEvents: _securityEvents.length,
        credentialRefs: _credentialRefs.size,
    };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * تهيئة طبقة الأمان مع الإعدادات الافتراضية.
 */
function start() {
    SECURITY_IDENTITY.startedAt = new Date().toISOString();

    // قائمة السماح الافتراضية للمسارات الأساسية
    allow('/api/health');
    allow('/api/catalog');
    allow('/api/suppliers');
    allow('/api/auth/login');
    allow('/api/auth/register');
    allow('/api/market-analytics/market');

    // تسجيل اعتمادات البيئة المتوقعة
    registerCredentialRef('JWT_SECRET', 'env');
    registerCredentialRef('DATA_ENCRYPTION_KEY', 'env');

    _log('info', `SHEIKHA Security Fabric جاهزة | وضعية: ${_posture} | Deny-by-Default مُفعَّل`);
    _bus.emit('security:ready', { identity: SECURITY_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) {
    _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() });
}

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-SECURITY]';
    if (level === 'warn')  console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    start,
    setPosture,
    getPosture,
    allow,
    deny,
    isAllowed,
    validateRequest,
    checkRateLimit,
    recordThreat,
    getThreats,
    getSecurityLog,
    registerCredentialRef,
    hasCredential,
    status,
    on,
    emit,
    SECURITY_IDENTITY,
    POSTURE_LEVELS,
};
