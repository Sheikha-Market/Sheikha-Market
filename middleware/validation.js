/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ✅ وسيط التحقق من البيانات
 *  Validation Middleware
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من الحقول المطلوبة
 */
function validateRequired(fields) {
    return (req, res, next) => {
        const missing = [];

        for (const field of fields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'حقول مطلوبة مفقودة',
                code: 'VALIDATION_REQUIRED_FIELDS',
                missing
            });
        }

        next();
    };
}

/**
 * التحقق من البريد الإلكتروني
 */
function validateEmail(field = 'email') {
    return (req, res, next) => {
        const email = req.body[field];
        if (!email) return next();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني غير صالح',
                code: 'VALIDATION_INVALID_EMAIL',
                field
            });
        }

        next();
    };
}

/**
 * التحقق من رقم الهاتف السعودي
 */
function validateSaudiPhone(field = 'phone') {
    return (req, res, next) => {
        const phone = req.body[field];
        if (!phone) return next();

        // تنظيف الرقم
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        
        // أنماط الهاتف السعودي
        const patterns = [
            /^05\d{8}$/,           // 05XXXXXXXX
            /^5\d{8}$/,            // 5XXXXXXXX
            /^\+9665\d{8}$/,       // +9665XXXXXXXX
            /^009665\d{8}$/,       // 009665XXXXXXXX
            /^9665\d{8}$/          // 9665XXXXXXXX
        ];

        if (!patterns.some(p => p.test(cleaned))) {
            return res.status(400).json({
                success: false,
                message: 'رقم الهاتف غير صالح (يجب أن يكون رقم سعودي)',
                code: 'VALIDATION_INVALID_PHONE',
                field
            });
        }

        // تطبيع الرقم
        req.body[field] = cleaned.replace(/^(\+966|00966|966)/, '0');

        next();
    };
}

/**
 * التحقق من طول النص
 */
function validateLength(field, min, max) {
    return (req, res, next) => {
        const value = req.body[field];
        if (!value) return next();

        if (typeof value !== 'string') {
            return res.status(400).json({
                success: false,
                message: `الحقل ${field} يجب أن يكون نصاً`,
                code: 'VALIDATION_INVALID_TYPE',
                field
            });
        }

        if (value.length < min || value.length > max) {
            return res.status(400).json({
                success: false,
                message: `الحقل ${field} يجب أن يكون بين ${min} و ${max} حرف`,
                code: 'VALIDATION_LENGTH',
                field,
                constraints: { min, max }
            });
        }

        next();
    };
}

/**
 * التحقق من الرقم
 */
function validateNumber(field, min = null, max = null) {
    return (req, res, next) => {
        const value = req.body[field];
        if (value === undefined || value === null) return next();

        const num = Number(value);
        if (isNaN(num)) {
            return res.status(400).json({
                success: false,
                message: `الحقل ${field} يجب أن يكون رقماً`,
                code: 'VALIDATION_INVALID_NUMBER',
                field
            });
        }

        if (min !== null && num < min) {
            return res.status(400).json({
                success: false,
                message: `الحقل ${field} يجب أن يكون أكبر من أو يساوي ${min}`,
                code: 'VALIDATION_MIN',
                field,
                constraint: min
            });
        }

        if (max !== null && num > max) {
            return res.status(400).json({
                success: false,
                message: `الحقل ${field} يجب أن يكون أصغر من أو يساوي ${max}`,
                code: 'VALIDATION_MAX',
                field,
                constraint: max
            });
        }

        req.body[field] = num;
        next();
    };
}

/**
 * التحقق من القيم المسموحة
 */
function validateEnum(field, allowedValues) {
    return (req, res, next) => {
        const value = req.body[field];
        if (!value) return next();

        if (!allowedValues.includes(value)) {
            return res.status(400).json({
                success: false,
                message: `قيمة غير مسموحة للحقل ${field}`,
                code: 'VALIDATION_ENUM',
                field,
                allowedValues
            });
        }

        next();
    };
}

/**
 * التحقق من السجل التجاري السعودي
 */
function validateCR(field = 'crNumber') {
    return (req, res, next) => {
        const cr = req.body[field];
        if (!cr) return next();

        // السجل التجاري 10 أرقام يبدأ بـ 10, 20, 30, 40
        const crRegex = /^[1-4]0\d{8}$/;
        if (!crRegex.test(cr)) {
            return res.status(400).json({
                success: false,
                message: 'رقم السجل التجاري غير صالح',
                code: 'VALIDATION_INVALID_CR',
                field
            });
        }

        next();
    };
}

/**
 * التحقق من UUID
 */
function validateUUID(field = 'id') {
    return (req, res, next) => {
        const uuid = req.params[field] || req.body[field];
        if (!uuid) return next();

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return res.status(400).json({
                success: false,
                message: 'معرّف غير صالح',
                code: 'VALIDATION_INVALID_UUID',
                field
            });
        }

        next();
    };
}

/**
 * دمج عدة تحققات
 */
function validate(validations) {
    return async (req, res, next) => {
        for (const validation of validations) {
            const result = await new Promise((resolve) => {
                validation(req, res, (error) => {
                    resolve(error || true);
                });
            });

            // إذا تم إرسال رد، توقف
            if (res.headersSent) return;
        }
        next();
    };
}

module.exports = {
    validateRequired,
    validateEmail,
    validateSaudiPhone,
    validateLength,
    validateNumber,
    validateEnum,
    validateCR,
    validateUUID,
    validate
};
