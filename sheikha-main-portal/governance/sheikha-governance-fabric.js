/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║      SHEIKHA Sovereign Governance Fabric — طبقة السيادة والحوكمة            ║
 * ║         SHEIKHA Sovereign Cognitive Infrastructure                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * المسؤوليات:
 *   - policies          — إدارة السياسات
 *   - permissions       — الصلاحيات والتحكم في الوصول
 *   - audit             — سجل التدقيق
 *   - compliance        — الامتثال (شرعي + تنظيمي)
 *   - operational ctrl  — التحكم التشغيلي
 *   - deployment ctrl   — التحكم في النشر
 *
 * مبادئ الامتثال الشرعي:
 *   - لا ربا
 *   - لا غرر
 *   - لا منتجات محرمة
 *   - الشفافية في التسعير
 *   - العدل في المعاملات
 *
 * @module governance/sheikha-governance-fabric
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

// ─── Identity ────────────────────────────────────────────────────────────────

const GOVERNANCE_IDENTITY = {
    name: 'SHEIKHA Sovereign Governance Fabric',
    layer: 'Governance Layer',
    version: '1.0.0',
    startedAt: null,
    complianceFrameworks: ['SHEIKHA-Charter', 'Shariah-Compliance', 'PDPL-Saudi'],
};

const _bus = new EventEmitter();
_bus.setMaxListeners(64);

// ─── Policy Registry ──────────────────────────────────────────────────────────

/**
 * سجل السياسات.
 * @type {Map<string, {rule: string, scope: string, enabled: boolean, createdAt: string}>}
 */
const _policies = new Map();

/**
 * تسجيل سياسة حوكمة.
 * @param {string} policyId
 * @param {string} rule
 * @param {string} [scope='global']
 */
function registerPolicy(policyId, rule, scope = 'global') {
    _policies.set(policyId, {
        rule,
        scope,
        enabled: true,
        createdAt: new Date().toISOString(),
    });
    _log('info', `📜 سياسة مسجّلة: ${policyId} [${scope}]`);
    _bus.emit('policy:registered', { policyId, rule, scope });
}

/**
 * تعطيل سياسة.
 * @param {string} policyId
 */
function disablePolicy(policyId) {
    if (_policies.has(policyId)) {
        _policies.get(policyId).enabled = false;
        _bus.emit('policy:disabled', { policyId });
    }
}

// ─── Permission Control ───────────────────────────────────────────────────────

/**
 * سجل الصلاحيات.
 * @type {Map<string, Set<string>>} — principal → Set of allowed actions
 */
const _permissions = new Map();

/**
 * منح صلاحية.
 * @param {string} principal — الجهة (مستخدم / خدمة / نطاق)
 * @param {string} action    — الإجراء المسموح
 */
function grantPermission(principal, action) {
    if (!_permissions.has(principal)) {
        _permissions.set(principal, new Set());
    }
    _permissions.get(principal).add(action);
    _bus.emit('permission:granted', { principal, action });
}

/**
 * سحب صلاحية.
 * @param {string} principal
 * @param {string} action
 */
function revokePermission(principal, action) {
    if (_permissions.has(principal)) {
        _permissions.get(principal).delete(action);
        _bus.emit('permission:revoked', { principal, action });
    }
}

/**
 * التحقق من صلاحية.
 * @param {string} principal
 * @param {string} action
 * @returns {boolean}
 */
function hasPermission(principal, action) {
    if (!_permissions.has(principal)) return false;
    return _permissions.get(principal).has(action);
}

// ─── Audit Trail ──────────────────────────────────────────────────────────────

/**
 * سجل التدقيق.
 * @type {Array<{event: string, actor: string, detail: object, at: string}>}
 */
const _auditTrail = [];

/**
 * تسجيل حدث في سجل التدقيق.
 * @param {string} event
 * @param {string} actor
 * @param {object} [detail={}]
 */
function audit(event, actor, detail = {}) {
    const entry = {
        event,
        actor,
        detail,
        at: new Date().toISOString(),
    };
    _auditTrail.push(entry);
    _bus.emit('audit:entry', entry);
}

/**
 * قراءة سجل التدقيق.
 * @param {number} [limit=50]
 * @returns {Array}
 */
function getAuditTrail(limit = 50) {
    return _auditTrail.slice(-limit);
}

// ─── Compliance Checks ────────────────────────────────────────────────────────

/**
 * فحوصات الامتثال الشرعي المبنية مسبقًا.
 */
const SHARIAH_CHECKS = {
    noRiba: (transaction) => !transaction.interestRate || transaction.interestRate === 0,
    noHaramProducts: (product) => !['alcohol', 'pork', 'weapons', 'tobacco'].includes(product.category),
    transparentPricing: (offer) => typeof offer.price === 'number' && offer.price > 0,
    noExcessiveUncertainty: (contract) => contract.terms && contract.terms.length > 0,
};

/**
 * تشغيل فحص امتثال شرعي.
 * @param {string} checkName
 * @param {object} subject
 * @returns {{compliant: boolean, check: string}}
 */
function checkShariah(checkName, subject) {
    if (!SHARIAH_CHECKS[checkName]) {
        _log('warn', `فحص شرعي غير معروف: ${checkName}`);
        return { compliant: false, check: checkName, error: 'unknown check' };
    }
    const compliant = SHARIAH_CHECKS[checkName](subject);
    audit(`shariah:${checkName}`, 'governance-fabric', { compliant, subject });
    if (!compliant) {
        _log('warn', `⚠️ فحص شرعي فشل: ${checkName}`);
        _bus.emit('compliance:violation', { checkName, subject });
    }
    return { compliant, check: checkName };
}

// ─── Deployment Control ───────────────────────────────────────────────────────

/**
 * سجل نقاط التحكم في النشر.
 * @type {Map<string, {approved: boolean, approvedBy: string|null, approvedAt: string|null}>}
 */
const _deploymentGates = new Map();

/**
 * تسجيل بوابة نشر.
 * @param {string} gateId
 */
function registerDeploymentGate(gateId) {
    _deploymentGates.set(gateId, { approved: false, approvedBy: null, approvedAt: null });
    _log('info', `🚪 بوابة نشر مسجّلة: ${gateId}`);
}

/**
 * اعتماد بوابة نشر.
 * @param {string} gateId
 * @param {string} approvedBy
 */
function approveDeploymentGate(gateId, approvedBy) {
    if (!_deploymentGates.has(gateId)) return;
    const gate = _deploymentGates.get(gateId);
    gate.approved = true;
    gate.approvedBy = approvedBy;
    gate.approvedAt = new Date().toISOString();
    audit('deployment:gate:approved', approvedBy, { gateId });
    _bus.emit('deployment:gate:approved', { gateId, approvedBy });
    _log('info', `✅ بوابة نشر اعتُمدت: ${gateId} بواسطة ${approvedBy}`);
}

/**
 * التحقق من اعتماد بوابة النشر.
 * @param {string} gateId
 * @returns {boolean}
 */
function isDeploymentApproved(gateId) {
    return _deploymentGates.has(gateId) && _deploymentGates.get(gateId).approved;
}

// ─── Status ───────────────────────────────────────────────────────────────────

function status() {
    return {
        ...GOVERNANCE_IDENTITY,
        policies: _policies.size,
        principals: _permissions.size,
        auditEntries: _auditTrail.length,
        deploymentGates: _deploymentGates.size,
    };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

function start() {
    GOVERNANCE_IDENTITY.startedAt = new Date().toISOString();

    // سياسات الميثاق الأساسية
    registerPolicy('charter:no-riba', 'No interest-based transactions allowed', 'financial');
    registerPolicy('charter:no-haram', 'No haram products or services', 'trade');
    registerPolicy('charter:transparency', 'Transparent pricing required', 'market');
    registerPolicy('charter:no-harm', 'No harm to users or society', 'global');
    registerPolicy('charter:security', 'Security middleware enforced at all endpoints', 'api');

    _log('info', `SHEIKHA Sovereign Governance Fabric جاهزة | ${GOVERNANCE_IDENTITY.startedAt}`);
    _bus.emit('governance:ready', { identity: GOVERNANCE_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }
function emit(event, payload = {}) { _bus.emit(event, { ...payload, emittedAt: new Date().toISOString() }); }

// ─── Internal Logging ─────────────────────────────────────────────────────────

function _log(level, msg) {
    const tag = '[SHEIKHA-GOVERNANCE]';
    if (level === 'warn') console.warn(`${tag} ⚠️  ${msg}`);
    else if (level === 'error') console.error(`${tag} ❌ ${msg}`);
    else console.log(`${tag} ${msg}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    start,
    registerPolicy,
    disablePolicy,
    grantPermission,
    revokePermission,
    hasPermission,
    audit,
    getAuditTrail,
    checkShariah,
    registerDeploymentGate,
    approveDeploymentGate,
    isDeploymentApproved,
    status,
    on,
    emit,
    GOVERNANCE_IDENTITY,
    SHARIAH_CHECKS,
};
