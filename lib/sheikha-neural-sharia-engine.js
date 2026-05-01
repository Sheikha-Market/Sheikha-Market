// sheikha-neural-sharia-engine.js
// شبكة خلايا عصبية شرعية بالكتاب والسنة
// تعتمد على مطابقة نصوص القرآن والسنة مع المعاملة

const quran = require('../data/quran.json'); // يجب توفير ملف آيات القرآن
const hadith = require('../data/hadith.json'); // يجب توفير ملف أحاديث

/**
 * البحث عن نص شرعي مطابق للمعاملة
 * @param {object} transaction - بيانات الصفقة أو المعاملة
 * @returns {object} نتيجة البحث: { found, sourceType, text, reference }
 */
function findShariaSource(transaction) {
    // مثال مبسط: مطابقة كلمات مفتاحية
    const keywords = extractKeywords(transaction);
    // بحث في القرآن
    for (const ayah of quran) {
        if (keywords.some(k => ayah.text.includes(k))) {
            return {
                found: true,
                sourceType: 'quran',
                text: ayah.text,
                reference: `سورة ${ayah.surah} : آية ${ayah.ayah}`
            };
        }
    }
    // بحث في السنة
    for (const h of hadith) {
        if (keywords.some(k => h.text.includes(k))) {
            return {
                found: true,
                sourceType: 'hadith',
                text: h.text,
                reference: h.reference
            };
        }
    }
    return { found: false };
}

/**
 * استخراج كلمات مفتاحية من المعاملة
 * @param {object} transaction
 * @returns {string[]} مصفوفة كلمات
 */
function extractKeywords(transaction) {
    // مثال: جمع كل القيم النصية وتحويلها إلى كلمات
    let text = '';
    for (const v of Object.values(transaction)) {
        if (typeof v === 'string') text += ' ' + v;
        if (typeof v === 'object' && v !== null) text += ' ' + Object.values(v).join(' ');
    }
    return text.split(/\s+/).filter(Boolean);
}

module.exports = { findShariaSource };
