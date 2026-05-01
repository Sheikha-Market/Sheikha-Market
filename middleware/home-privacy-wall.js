/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔒 HOME PRIVACY WALL — جدار حماية الخصوصية المنزلية                        ║
 * ║  حماية بيانات شيخة وأسرتها — عزل تام عن السوق والمنظومة                    ║
 * ║                                                                              ║
 * ║  القواعد الصارمة:                                                            ║
 * ║  ⛔ لا أحد يدخل شبكة المنزل إلا المالكة (شيخة)                             ║
 * ║  ⛔ بيانات المنزل والأسرة لا تُشارَك مع السوق                               ║
 * ║  ⛔ لا تكامل خارجي مع أي منظومة                                             ║
 * ║  ✅ كل طلب يُسجَّل في سجل التدقيق الأمني                                   ║
 * ║  ✅ المفتاح: SHEIKHA_PRIVATE_HOME_KEY (متغير بيئة سري)                      ║
 * ║                                                                              ║
 * ║  «وَلَا تَجَسَّسُوا» — الحجرات: 12                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const crypto = require('crypto');

// ══════════════════════════════════════════════════════════════════════════════
// سجل التدقيق — يُحفظ في الذاكرة (في الإنتاج يُحفظ في قاعدة بيانات مشفرة)
// ══════════════════════════════════════════════════════════════════════════════
const AUDIT_LOG = [];
const MAX_AUDIT_ENTRIES = 500;

function addAuditEntry(type, req, details = {}) {
    const entry = {
        id:        crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type,
        ip:        req.ip || req.connection?.remoteAddress || 'unknown',
        method:    req.method,
        path:      req.originalUrl || req.path,
        userAgent: req.headers['user-agent'] || 'unknown',
        ...details,
    };
    AUDIT_LOG.unshift(entry);
    if (AUDIT_LOG.length > MAX_AUDIT_ENTRIES) AUDIT_LOG.pop();
    return entry;
}

// ══════════════════════════════════════════════════════════════════════════════
// التحقق من مفتاح المالكة
// ══════════════════════════════════════════════════════════════════════════════
function getPrivateKey() {
    return process.env.SHEIKHA_PRIVATE_HOME_KEY || null;
}

function verifyOwnerKey(providedKey) {
    const storedKey = getPrivateKey();
    if (!storedKey) return false; // لا مفتاح = لا دخول
    // مقارنة آمنة ضد timing attacks
    if (providedKey.length !== storedKey.length) return false;
    return crypto.timingSafeEqual(
        Buffer.from(providedKey,  'utf8'),
        Buffer.from(storedKey,    'utf8')
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// Middleware الرئيسي — جدار الخصوصية المنزلية
// ══════════════════════════════════════════════════════════════════════════════

/**
 * requireHomeOwner
 * يسمح فقط للمالكة بالدخول عبر:
 *   Header:  X-Sheikha-Home-Key: <المفتاح السري>
 * أي طلب بدون المفتاح الصحيح → 403 مع تسجيل في سجل التدقيق
 */
function requireHomeOwner(req, res, next) {
    const providedKey = req.headers['x-sheikha-home-key'] || '';

    if (!providedKey) {
        addAuditEntry('BLOCKED_NO_KEY', req, { reason: 'no_key_provided' });
        return res.status(403).json({
            success: false,
            code:    'HOME_ACCESS_DENIED',
            messageAr: '⛔ شبكة شيخة الخاصة — الدخول ممنوع. هذه الشبكة للمالكة فقط.',
            messageEn: 'Access denied. This is a private owner-only network.',
            _privacy: 'Sheikha Private Home Network v1.0',
        });
    }

    if (!verifyOwnerKey(providedKey)) {
        addAuditEntry('BLOCKED_WRONG_KEY', req, { reason: 'invalid_key' });
        return res.status(403).json({
            success: false,
            code:    'HOME_INVALID_KEY',
            messageAr: '⛔ المفتاح غير صحيح. سُجِّلت محاولة الدخول.',
            messageEn: 'Invalid key. Access attempt has been logged.',
            _privacy: 'Sheikha Private Home Network v1.0',
        });
    }

    // ✅ دخول مسموح — المالكة
    addAuditEntry('OWNER_ACCESS_GRANTED', req, { reason: 'valid_key' });
    req.isHomeOwner = true;
    next();
}

/**
 * blockHomeIntegration
 * يُحجب أي طلب يحاول ربط بيانات المنزل بأي نظام خارجي
 * يُستخدم على مسارات السوق لمنع استدعاء بيانات المنزل
 */
function blockHomeIntegration(req, res, next) {
    const suspiciousHeaders = [
        'x-home-network',
        'x-home-data',
        'x-private-home',
        'x-family-data',
    ];
    for (const h of suspiciousHeaders) {
        if (req.headers[h]) {
            addAuditEntry('HOME_DATA_LEAK_ATTEMPT', req, { blockedHeader: h });
            return res.status(403).json({
                success: false,
                code:    'HOME_DATA_EXPORT_BLOCKED',
                messageAr: '⛔ محاولة تصدير بيانات منزلية خاصة — مُوقَفة بجدار الخصوصية.',
                _privacy: 'Sheikha Privacy Wall v1.0',
            });
        }
    }
    next();
}

/**
 * noHomeDataInResponse
 * Middleware على الردود — يمنع تسرب بيانات منزلية في ردود السوق
 */
function noHomeDataInResponse(req, res, next) {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        if (body && typeof body === 'object') {
            // إزالة أي حقول تحتوي على بيانات منزلية
            const PRIVATE_KEYS = ['homeNetwork', 'home_network', 'homeAI', 'home_ai',
                'family_devices', 'familyDevices', 'home_devices', 'homeDevices',
                'private_home', 'privateHome', 'homeData', 'home_data'];
            for (const key of PRIVATE_KEYS) {
                if (key in body) {
                    delete body[key];
                }
            }
        }
        return originalJson(body);
    };
    next();
}

// ══════════════════════════════════════════════════════════════════════════════
// API لسجل التدقيق (للمالكة فقط)
// ══════════════════════════════════════════════════════════════════════════════
function getAuditLog(limit = 50) {
    return AUDIT_LOG.slice(0, Math.min(limit, MAX_AUDIT_ENTRIES));
}

function getAuditSummary() {
    const blocked = AUDIT_LOG.filter(e => e.type.startsWith('BLOCKED')).length;
    const granted = AUDIT_LOG.filter(e => e.type === 'OWNER_ACCESS_GRANTED').length;
    const leaks   = AUDIT_LOG.filter(e => e.type === 'HOME_DATA_LEAK_ATTEMPT').length;
    return {
        total_attempts:   AUDIT_LOG.length,
        blocked_attempts: blocked,
        owner_accesses:   granted,
        leak_attempts:    leaks,
        last_activity:    AUDIT_LOG[0]?.timestamp || null,
    };
}

// ══════════════════════════════════════════════════════════════════════════════
module.exports = {
    requireHomeOwner,
    blockHomeIntegration,
    noHomeDataInResponse,
    getAuditLog,
    getAuditSummary,
    addAuditEntry,
};
