// تكامل الحوكمة العصبية الكونية مع النظام الرئيسي
const globalNeuralGovernance = require('./lib/sheikha-global-neural-governance');
const autoRegisterAdapters = require('./lib/auto-register-adapters');

// تسجيل كل adapters تلقائياً
autoRegisterAdapters(globalNeuralGovernance);

// مثال: تنفيذ توصية عالمية (يمكن ربطها بأي نقطة في النظام)
async function runGlobalAdvisory(context) {
    // تمرير القرار عبر طبقة الشريعة أولاً (إذا كانت موجودة)
    // ثم التنفيذ عبر كل المنصات
    return await globalNeuralGovernance.executeGlobalAdvisory(context);
}

module.exports = runGlobalAdvisory;
