/**
 * جميع الحقوق محفوظة © 2026 سلمان أحمد بن سلمان الراجح
 * Sheikha Main Portal — Intellectual Property of Salman Ahmad AlRajeh
 * لا يجوز النسخ أو النشر أو الاستخدام التجاري أو التعديل إلا بإذن خطي من المالك.
 */

// ─── نظام تشغيل شيخة — OS Mini ────────────────────────────────────────────
const sheikhaBootloader = require('./sheikha-bootloader');

class SheikhaOS {
    constructor() {
        const { bootMsg, kernel } = sheikhaBootloader();
        this.kernel = kernel;
        this.bootMsg = bootMsg;
        this.services = [];
    }
    startService(name) {
        this.services.push({ name, status: 'active' });
        this.kernel.runProcess(name);
        return `Service ${name} started.`;
    }
    systemStatus() {
        return {
            bootMsg: this.bootMsg,
            kernel: this.kernel.status(),
            services: this.services
        };
    }
}

module.exports = SheikhaOS;
