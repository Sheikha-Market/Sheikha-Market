/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📦 فهرس الوسطاء
 *  Middleware Index
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const auth = require('./auth');
const security = require('./security');
const logger = require('./logger');
const validation = require('./validation');

module.exports = {
    // المصادقة
    ...auth,

    // الأمان
    ...security,

    // التسجيل
    ...logger,

    // التحقق
    ...validation
};
