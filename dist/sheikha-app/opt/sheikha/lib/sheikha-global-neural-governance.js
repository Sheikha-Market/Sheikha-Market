// محرك الحوكمة العصبية الكونية والدولية
// Unified Global Neural Governance Engine

const adapters = {};

// تسجيل adapter جديد
function registerAdapter(name, adapter) {
    adapters[name] = adapter;
}

// تنفيذ توصية أو قرار عبر كل المنصات
async function executeGlobalAdvisory(context) {
    const results = {};
    for (const [name, adapter] of Object.entries(adapters)) {
        try {
            results[name] = await adapter.handle(context);
        } catch (e) {
            results[name] = { success: false, error: e.message };
        }
    }
    return results;
}

module.exports = {
    registerAdapter,
    executeGlobalAdvisory,
    adapters
};
