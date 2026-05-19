/**
 * جميع الحقوق محفوظة © 2026 سلمان أحمد بن سلمان الراجح
 * Sheikha Main Portal — Intellectual Property of Salman Ahmad AlRajeh
 * لا يجوز النسخ أو النشر أو الاستخدام التجاري أو التعديل إلا بإذن خطي من المالك.
 */

// ─── بوت تشغيل شيخة — Bootloader ──────────────────────────────────────────
const SheikhaKernel = require('./sheikha-kernel');

function sheikhaBootloader() {
    const kernel = new SheikhaKernel();
    const bootMsg = kernel.boot();
    return { bootMsg, kernel };
}

module.exports = sheikhaBootloader;
