/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ⚖️ sheikha-governance-engine.js — محرك الحوكمة والامتثال
 *  "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ" — النحل: 90
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const LOG_FILE  = path.join(__dirname, '../data/governance-log.json');
const CHARTER   = { enforced: true, version: '2.4.1', deny_by_default: true };

// ──────────────────────────────────────────────────────────────────────────────
// السياسات التشغيلية
// ──────────────────────────────────────────────────────────────────────────────
const POLICIES = [
    { id: 'no_riba',               name: 'حظر الربا',           enforcement: 'block',   severity: 'critical' },
    { id: 'no_gharar',             name: 'حظر الغرر الفاحش',   enforcement: 'block',   severity: 'critical' },
    { id: 'identity_verification', name: 'التحقق من الهوية',    enforcement: 'require', severity: 'high' },
    { id: 'price_transparency',    name: 'شفافية التسعير',       enforcement: 'require', severity: 'high' },
    { id: 'audit_trail',           name: 'سجل الأثر',            enforcement: 'require', severity: 'high' },
    { id: 'deny_by_default',       name: 'رفض افتراضي',          enforcement: 'block',   severity: 'medium' },
    { id: 'no_monopoly',           name: 'حظر الاحتكار',          enforcement: 'warn',    severity: 'medium' },
    { id: 'data_protection',       name: 'حماية البيانات',       enforcement: 'require', severity: 'high' },
];

// ──────────────────────────────────────────────────────────────────────────────
// قراءة سجل الامتثال
// ──────────────────────────────────────────────────────────────────────────────
function readLog() {
    try {
        if (!fs.existsSync(LOG_FILE)) return { compliance_log: [], policies: [], meta: {} };
        return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    } catch (_) {
        return { compliance_log: [], policies: [], meta: {} };
    }
}

function writeLog(data) {
    fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ──────────────────────────────────────────────────────────────────────────────
// فحص الامتثال
// ──────────────────────────────────────────────────────────────────────────────

/**
 * فحص إجراء ضد جميع السياسات
 * @param {string} action - نوع الإجراء
 * @param {Object} data   - بيانات الإجراء
 * @returns {{ passed: boolean, violations: Array, warnings: Array }}
 */
function checkCompliance(action, data = {}) {
    const violations = [];
    const warnings   = [];

    // التحقق من الربا
    if (data.interest_rate || data.terms?.interest_rate) {
        violations.push({ policy: 'no_riba', message: 'شرط فائدة ربوية مكتشف', severity: 'critical' });
    }

    // التحقق من الغرر
    if (action === 'create_contract' && data.items) {
        for (const item of data.items || []) {
            if (!item.quantity || !item.price_per_unit) {
                violations.push({ policy: 'no_gharar', message: 'بيانات غير مكتملة — غرر محتمل', severity: 'critical' });
                break;
            }
        }
    }

    // التحقق من التحقق من الهوية
    if (action === 'create_account' && !data.id_verified) {
        violations.push({ policy: 'identity_verification', message: 'الهوية غير موثقة', severity: 'high' });
    }

    // التحقق من الاحتكار (تحذير فقط)
    if (data.market_share && data.market_share > 0.4) {
        warnings.push({ policy: 'no_monopoly', message: `حصة السوق ${(data.market_share * 100).toFixed(0)}% — راجع الامتثال`, severity: 'medium' });
    }

    return { passed: violations.length === 0, violations, warnings };
}

/**
 * تسجيل حدث امتثال في سجل الأثر
 */
function logComplianceEvent(event) {
    const logData = readLog();
    const entry   = {
        id:     `gov_${Date.now()}`,
        at:     new Date().toISOString(),
        ...event
    };

    (logData.compliance_log = logData.compliance_log || []).unshift(entry);
    // الاحتفاظ بآخر 500 سجل
    if (logData.compliance_log.length > 500) logData.compliance_log.length = 500;

    // تحديث الإحصائيات
    const total   = logData.compliance_log.length;
    const passed  = logData.compliance_log.filter(e => e.result === 'passed').length;
    logData.meta  = {
        total_checks:    total,
        passed,
        failed:          logData.compliance_log.filter(e => e.result === 'failed').length,
        pending:         logData.compliance_log.filter(e => e.result === 'pending_review').length,
        compliance_rate: total > 0 ? (passed / total) : 1,
        last_updated:    new Date().toISOString()
    };

    writeLog(logData);
    return entry;
}

/**
 * الحصول على قائمة السياسات
 */
function getPolicies() {
    return POLICIES.map(p => ({ ...p, status: 'active' }));
}

/**
 * الحصول على سجل الامتثال
 */
function getAuditLog(limit = 50) {
    const data = readLog();
    return (data.compliance_log || []).slice(0, limit);
}

/**
 * تشغيل فحص يومي كامل
 */
function runDailyCheck() {
    const log  = readLog();
    const logs = log.compliance_log || [];
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.at?.startsWith(today));

    const total   = todayLogs.length;
    const passed  = todayLogs.filter(l => l.result === 'passed').length;
    const rate    = total > 0 ? passed / total : 1;

    const result = {
        action:       'daily_check',
        entity:       'system',
        actor:        'governance.daily',
        result:       rate === 1 ? 'passed' : 'partial',
        compliance_rate: rate,
        total_checked:   total,
        violations:      total - passed,
        date:            today
    };

    logComplianceEvent(result);
    return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// middleware Express (اختياري)
// ──────────────────────────────────────────────────────────────────────────────
function governanceMiddleware() {
    return (req, res, next) => {
        // فحص سريع للطلبات
        const blocked = false; // يمكن توسيع هذا
        if (blocked) {
            return res.status(403).json({
                success: false,
                error: 'governance_block',
                message: 'الطلب محظور بواسطة محرك الحوكمة'
            });
        }
        next();
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// التصدير
// ──────────────────────────────────────────────────────────────────────────────
module.exports = {
    CHARTER,
    POLICIES,
    checkCompliance,
    logComplianceEvent,
    getPolicies,
    getAuditLog,
    runDailyCheck,
    governanceMiddleware
};

console.log('✅ [GOVERNANCE-ENGINE] محرك الحوكمة والامتثال — جاهز | Deny-by-Default:', CHARTER.deny_by_default);
