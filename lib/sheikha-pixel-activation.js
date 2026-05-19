/**
 * بسم الله الرحمن الرحيم
 * تكامل نظام البكسل الشيخة مع الخادم الرئيسي
 * SHEIKHA PIXEL SYSTEM INTEGRATION
 */

'use strict';

const path = require('path');

/**
 * دالة تفعيل نظام البكسل على الخادم
 * @param {Object} app - تطبيق Express
 * @param {Object} config - التكوين الاختياري
 * @returns {Promise<Object>} حالة التفعيل
 */
async function activatePixelSystem(app, config = {}) {
    console.log('[PIXEL-ACTIVATION] 🎨 تفعيل نظام البكسل الشيخة...');

    try {
        // ─── التحقق من متغيرات البيئة ─────────────────────────────────────

        const pixelEnabled = process.env.PIXEL_SYSTEM_ENABLED === 'true';
        const neuralIntegration = process.env.NEURAL_PIXEL_INTEGRATION === 'true';
        const shariaVerification = process.env.SHARIA_PIXEL_VERIFICATION === 'true';

        console.log('[PIXEL-ACTIVATION] 📋 التكوين:');
        console.log(`[PIXEL-ACTIVATION]   • النظام: ${pixelEnabled ? '✅ مفعّل' : '⚠️  معطّل'}`);
        console.log(`[PIXEL-ACTIVATION]   • التكامل العصبي: ${neuralIntegration ? '✅ مفعّل' : '⚠️  معطّل'}`);
        console.log(`[PIXEL-ACTIVATION]   • الفحص الشرعي: ${shariaVerification ? '✅ مفعّل' : '⚠️  معطّل'}`);

        if (!pixelEnabled) {
            console.warn('[PIXEL-ACTIVATION] ⚠️  نظام البكسل معطّل في متغيرات البيئة');
            return {
                success: false,
                status: 'disabled',
                timestamp: new Date().toISOString()
            };
        }

        // ─── تحميل نظام البكسل ─────────────────────────────────────────────

        let pixelSystem;
        try {
            pixelSystem = require(path.join(__dirname, '../lib/sheikha-pixel-system'));
        } catch (err) {
            console.error('[PIXEL-ACTIVATION] ❌ تعذّر تحميل نظام البكسل:', err.message);
            return {
                success: false,
                status: 'load_error',
                error: err.message,
                timestamp: new Date().toISOString()
            };
        }

        // ─── تهيئة النظام ────────────────────────────────────────────────

        const initResult = await pixelSystem.initPixelSystem();

        console.log('[PIXEL-ACTIVATION] ✅ تم تهيئة نظام البكسل بنجاح');
        console.log('[PIXEL-ACTIVATION]   • الحالة:', initResult.status);
        console.log('[PIXEL-ACTIVATION]   • المكونات:');
        console.log(`[PIXEL-ACTIVATION]     - الشبكة العصبية: ${initResult.components.neural ? '✅' : '⚠️'}`);
        console.log(`[PIXEL-ACTIVATION]     - محرك الشريعة: ${initResult.components.sharia ? '✅' : '⚠️'}`);

        // ─── تسجيل مسارات API ──────────────────────────────────────────

        let pixelRoutes;
        try {
            pixelRoutes = require(path.join(__dirname, '../routes/pixel-system'));
            app.use('/api/pixel-system', pixelRoutes);
            console.log('[PIXEL-ACTIVATION] 📡 تم تسجيل مسارات البكسل API:');
            console.log('[PIXEL-ACTIVATION]   • POST /api/pixel-system/init');
            console.log('[PIXEL-ACTIVATION]   • POST /api/pixel-system/create');
            console.log('[PIXEL-ACTIVATION]   • POST /api/pixel-system/process-batch');
            console.log('[PIXEL-ACTIVATION]   • POST /api/pixel-system/aggregate');
            console.log('[PIXEL-ACTIVATION]   • GET  /api/pixel-system/stats');
            console.log('[PIXEL-ACTIVATION]   • GET  /api/pixel-system/status');
        } catch (err) {
            console.warn('[PIXEL-ACTIVATION] ⚠️  تحذير:', err.message);
        }

        // ─── ربط العام مع التطبيق ────────────────────────────────────────

        if (!app.locals.pixelSystem) {
            app.locals.pixelSystem = pixelSystem;
            console.log('[PIXEL-ACTIVATION] 🔗 تم ربط نظام البكسل مع التطبيق');
        }

        // ─── إرجاع حالة التفعيل ──────────────────────────────────────────

        const result = {
            success: true,
            status: 'activated',
            system: initResult,
            configuration: {
                pixel_system_enabled: pixelEnabled,
                neural_integration: neuralIntegration,
                sharia_verification: shariaVerification,
                precision_level: parseInt(process.env.PIXEL_PRECISION_LEVEL || 18),
                batch_size: parseInt(process.env.PIXEL_BATCH_SIZE || 100),
                cache_enabled: process.env.PIXEL_CACHE_ENABLED === 'true'
            },
            timestamp: new Date().toISOString()
        };

        console.log('[PIXEL-ACTIVATION] 🎉 تم تفعيل نظام البكسل الشيخة بنجاح');
        console.log('[PIXEL-ACTIVATION] ╔════════════════════════════════════╗');
        console.log('[PIXEL-ACTIVATION] ║  نظام البكسل جاهز للعمل ✅          ║');
        console.log('[PIXEL-ACTIVATION] ╚════════════════════════════════════╝');

        return result;
    } catch (err) {
        console.error('[PIXEL-ACTIVATION] ❌ خطأ في التفعيل:', err.message);
        console.error(err.stack);
        return {
            success: false,
            status: 'error',
            error: err.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * دالة مراقبة نظام البكسل
 * @param {Object} app - تطبيق Express
 * @returns {void}
 */
function monitorPixelSystem(app) {
    if (!app.locals.pixelSystem) {
        console.warn('[PIXEL-MONITOR] ⚠️  نظام البكسل غير متاح للمراقبة');
        return;
    }

    const interval = parseInt(process.env.PIXEL_MONITORING_INTERVAL || 60000);

    setInterval(() => {
        try {
            const stats = app.locals.pixelSystem.getStats();
            console.log('[PIXEL-MONITOR] 📊 إحصائيات نظام البكسل:');
            console.log(`[PIXEL-MONITOR]   • المعالجة: ${stats.processed}`);
            console.log(`[PIXEL-MONITOR]   • الأخطاء: ${stats.failed}`);
            console.log(`[PIXEL-MONITOR]   • معدل النجاح: ${stats.successRate}`);
            console.log(`[PIXEL-MONITOR]   • معدل الامتثال الشرعي: ${stats.halalRate}`);

            // تنبيه إذا كان معدل الأخطاء عالياً
            const errorRate = (stats.failed / (stats.processed || 1)) * 100;
            const threshold = parseInt(process.env.PIXEL_ALERT_THRESHOLD_HARAM || 10);

            if (stats.haram > threshold) {
                console.warn(`[PIXEL-MONITOR] ⚠️  تحذير: عدد البكسلات غير الحلال (${stats.haram}) يتجاوز الحد (${threshold})`);
            }
        } catch (err) {
            console.error('[PIXEL-MONITOR] ❌ خطأ في المراقبة:', err.message);
        }
    }, interval);
}

/**
 * الصادرات
 */
module.exports = {
    activatePixelSystem,
    monitorPixelSystem
};
