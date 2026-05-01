/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📝 وسيط التسجيل
 *  Logger Middleware
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// إنشاء مجلد السجلات
const logsDir = path.resolve(__dirname, '..', config.logging.path);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// مستويات التسجيل
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const currentLevel = LOG_LEVELS[config.logging.level] || LOG_LEVELS.info;

/**
 * تنسيق الرسالة
 */
function formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`.trim();
}

/**
 * كتابة في الملف
 */
function writeToFile(filename, message) {
    if (!config.logging.enabled) return;
    
    const filePath = path.join(logsDir, filename);
    fs.appendFileSync(filePath, message + '\n', 'utf-8');
}

/**
 * المسجل الرئيسي
 */
const logger = {
    error: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.error) {
            const formatted = formatMessage('error', message, meta);
            console.error('❌', formatted);
            writeToFile(config.logging.files.error, formatted);
        }
    },

    warn: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.warn) {
            const formatted = formatMessage('warn', message, meta);
            console.warn('⚠️', formatted);
            writeToFile(config.logging.files.error, formatted);
        }
    },

    info: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.info) {
            const formatted = formatMessage('info', message, meta);
            console.log('ℹ️', formatted);
            writeToFile(config.logging.files.access, formatted);
        }
    },

    debug: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.debug) {
            const formatted = formatMessage('debug', message, meta);
            console.log('🔍', formatted);
        }
    },

    audit: (action, userId, details = {}) => {
        const formatted = formatMessage('audit', action, { userId, ...details });
        writeToFile(config.logging.files.audit, formatted);
    }
};

/**
 * وسيط تسجيل الطلبات
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();

    // تسجيل عند انتهاء الطلب
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            path: req.originalUrl || req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.id || 'anonymous'
        };

        if (res.statusCode >= 500) {
            logger.error(`${req.method} ${req.path}`, logData);
        } else if (res.statusCode >= 400) {
            logger.warn(`${req.method} ${req.path}`, logData);
        } else {
            logger.info(`${req.method} ${req.path}`, logData);
        }
    });

    next();
}

/**
 * وسيط تسجيل الأخطاء
 */
function errorLogger(err, req, res, next) {
    logger.error(err.message, {
        stack: err.stack,
        method: req.method,
        path: req.path,
        body: req.body,
        userId: req.user?.id
    });

    next(err);
}

module.exports = {
    logger,
    requestLogger,
    errorLogger
};
