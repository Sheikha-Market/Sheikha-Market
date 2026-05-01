/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔐 وسيط المصادقة
 *  Authentication Middleware
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const database = require('../config/database');

/**
 * التحقق من التوكن
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'التوكن مطلوب',
            code: 'AUTH_TOKEN_MISSING'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.security.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية التوكن',
                code: 'AUTH_TOKEN_EXPIRED'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'التوكن غير صالح',
            code: 'AUTH_TOKEN_INVALID'
        });
    }
}

/**
 * التحقق من الصلاحيات
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح',
                code: 'AUTH_REQUIRED'
            });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية للوصول',
                code: 'AUTH_FORBIDDEN',
                requiredRoles: roles,
                currentRole: req.user.role
            });
        }

        next();
    };
}

/**
 * التحقق من المسؤول
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'هذه العملية تتطلب صلاحيات المسؤول',
            code: 'AUTH_ADMIN_REQUIRED'
        });
    }
    next();
}

/**
 * تحميل بيانات المستخدم الكاملة
 */
async function loadUser(req, res, next) {
    if (!req.user || !req.user.id) {
        return next();
    }

    try {
        const users = database.read('users') || [];
        const user = users.find(u => u.id === req.user.id);

        if (user) {
            const { password, ...safeUser } = user;
            req.fullUser = safeUser;
        }
    } catch (error) {
        console.warn('خطأ في تحميل بيانات المستخدم:', error.message);
    }

    next();
}

/**
 * المصادقة الاختيارية (لا تفشل إذا لم يكن هناك توكن)
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.security.jwt.secret);
        req.user = decoded;
    } catch (error) {
        // تجاهل الأخطاء - المصادقة اختيارية
    }

    next();
}

/**
 * إنشاء توكن
 */
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        config.security.jwt.secret,
        { expiresIn: config.security.jwt.expiresIn }
    );
}

/**
 * إنشاء توكن تحديث
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        config.security.jwt.secret,
        { expiresIn: config.security.jwt.refreshExpiresIn }
    );
}

module.exports = {
    authenticate,
    authorize,
    requireAdmin,
    loadUser,
    optionalAuth,
    generateToken,
    generateRefreshToken
};
