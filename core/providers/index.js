// SHEIKHA Provider Abstraction Layer
// هذا الملف يحدد نقطة الدخول الموحدة لجميع مزودات الذكاء الاصطناعي والتشغيل

const fs = require('fs');
const path = require('path');

const PROVIDERS_PATH = path.join(__dirname);

function resolveProvider(preferred) {
    // إذا تم تحديد مزود مفضل، جربه أولاً
    if (preferred) {
        const custom = tryLoadProvider(preferred);
        if (custom) return custom;
    }
    // ترتيب المزودات حسب الأولوية
    const order = ['local', 'ollama', 'openai', 'claude', 'gemini', 'offline'];
    for (const name of order) {
        const provider = tryLoadProvider(name);
        if (provider) return provider;
    }
    throw new Error('لا يوجد مزود متاح حالياً');
}

function tryLoadProvider(name) {
    const dir = path.join(PROVIDERS_PATH, name);
    const entry = path.join(dir, 'index.js');
    if (fs.existsSync(entry)) {
        try {
            return require(entry);
        } catch (e) {
            console.error(`فشل تحميل المزود: ${name}`, e);
        }
    }
    return null;
}

module.exports = { resolveProvider };
