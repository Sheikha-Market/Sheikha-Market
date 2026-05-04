/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📡 قناة تبادل التقارير — Sheikha Report Bus
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * نظام pub/sub لتبادل التقارير بين السيرفرات
 *
 * ﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾ — المائدة: 2
 *
 * الوظائف:
 *   publish(serverId, type, data)         — نشر تقرير
 *   subscribe(serverId, type, callback)   — الاشتراك لتلقي تقارير
 *   unsubscribe(serverId, type, callback) — إلغاء الاشتراك
 *   getMessages(serverId, type?)          — جلب الرسائل المنتظرة
 *   sync(sourceServerId, targetServerId)  — مزامنة التقارير
 *   getStatus()                           — حالة القناة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const reportWriter = require('./sheikha-report-writer.js');

// ─── Class قناة التبادل ───────────────────────────────────────────────────────
class SheikhaReportBus {
    constructor() {
        // قائمة المشتركين: { channelKey: [callback, ...] }
        this._subscribers = {};

        // قائمة انتظار الرسائل: { channelKey: [message, ...] }
        this._queue = {};

        // سجل النشر: آخر 200 عملية نشر
        this._publishLog = [];

        this.version = '1.0.0';
        this._startTime = new Date().toISOString();
    }

    // ─── مفتاح القناة ─────────────────────────────────────────────────────────
    _channelKey(serverId, type = '*') {
        return `${serverId}::${type}`;
    }

    /**
     * publish(serverId, type, data) — نشر تقرير على القناة وكتابته
     * @param {string} serverId — معرّف السيرفر الناشر
     * @param {string} type     — نوع التقرير
     * @param {object} data     — بيانات التقرير
     * @returns {{ messageId, reportId, deliveredTo }}
     */
    publish(serverId, type, data = {}) {
        // كتابة التقرير فعلياً
        let writeResult = {};
        try {
            writeResult = reportWriter.writeReport(type, data, serverId);
        } catch (e) {
            writeResult = { reportId: `${type}-${Date.now()}`, error: e.message };
        }

        const message = {
            messageId: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            reportId: writeResult.reportId,
            serverId,
            type,
            data,
            islamicSignature: writeResult.islamicSignature || null,
            publishedAt: new Date().toISOString()
        };

        // حفظ في قائمة الانتظار لقنوات مطابقة
        const specificKey = this._channelKey(serverId, type);
        const wildcardKey = this._channelKey(serverId, '*');
        const globalKey = this._channelKey('*', type);
        const superGlobalKey = this._channelKey('*', '*');

        for (const key of [specificKey, wildcardKey, globalKey, superGlobalKey]) {
            if (!this._queue[key]) this._queue[key] = [];
            this._queue[key].push(message);
            if (this._queue[key].length > 500) this._queue[key].shift(); // حد أقصى 500
        }

        // تسليم فوري للمشتركين
        let deliveredTo = 0;
        for (const key of [specificKey, wildcardKey, globalKey, superGlobalKey]) {
            const subs = this._subscribers[key] || [];
            for (const cb of subs) {
                try { cb(message); deliveredTo++; } catch (_) {}
            }
        }

        // سجل النشر
        this._publishLog.push({
            messageId: message.messageId,
            serverId,
            type,
            deliveredTo,
            timestamp: message.publishedAt
        });
        if (this._publishLog.length > 200) this._publishLog.shift();

        return { messageId: message.messageId, reportId: writeResult.reportId, deliveredTo };
    }

    /**
     * subscribe(serverId, type, callback) — الاشتراك لتلقي تقارير
     * @param {string|'*'}   serverId  — معرّف السيرفر أو '*' للكل
     * @param {string|'*'}   type      — نوع التقرير أو '*' للكل
     * @param {Function}     callback  — دالة الاستقبال (message) => {}
     * @returns {{ subscriptionId, channel }}
     */
    subscribe(serverId, type, callback) {
        if (typeof callback !== 'function') throw new Error('callback يجب أن يكون دالة');
        const key = this._channelKey(serverId, type);
        if (!this._subscribers[key]) this._subscribers[key] = [];
        if (!this._subscribers[key].includes(callback)) {
            this._subscribers[key].push(callback);
        }
        const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        return { subscriptionId, channel: key };
    }

    /**
     * unsubscribe(serverId, type, callback) — إلغاء الاشتراك
     */
    unsubscribe(serverId, type, callback) {
        const key = this._channelKey(serverId, type);
        const subs = this._subscribers[key] || [];
        const idx = subs.indexOf(callback);
        if (idx !== -1) subs.splice(idx, 1);
        return { unsubscribed: idx !== -1, channel: key };
    }

    /**
     * getMessages(serverId, type?, limit?) — جلب الرسائل المنتظرة في القناة
     * @param {string} serverId
     * @param {string} [type='*']
     * @param {number} [limit=50]
     */
    getMessages(serverId, type = '*', limit = 50) {
        const key = this._channelKey(serverId, type);
        const messages = this._queue[key] || [];
        return messages.slice(-limit);
    }

    /**
     * sync(sourceServerId, targetServerId) — مزامنة التقارير بين سيرفرين
     * @param {string} sourceServerId
     * @param {string} targetServerId
     * @returns {{ synced, copied }}
     */
    sync(sourceServerId, targetServerId) {
        const sourceReports = reportWriter.listReports(sourceServerId);
        let copied = 0;
        const existingTarget = new Set(
            reportWriter.listReports(targetServerId).map(r => r.reportId)
        );

        for (const r of sourceReports) {
            if (existingTarget.has(r.reportId)) continue;
            try {
                const fullReport = reportWriter.readReport(sourceServerId, r.reportId);
                if (fullReport) {
                    reportWriter.writeReport(fullReport.type, fullReport.data, targetServerId);
                    copied++;
                }
            } catch (_) { /* skip */ }
        }

        return {
            synced: true,
            sourceServerId,
            targetServerId,
            sourceTotal: sourceReports.length,
            copied,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * getStatus() — حالة القناة
     */
    getStatus() {
        const totalSubscribers = Object.values(this._subscribers)
            .reduce((s, arr) => s + arr.length, 0);
        const totalQueued = Object.values(this._queue)
            .reduce((s, arr) => s + arr.length, 0);

        return {
            name: 'Sheikha Report Bus',
            nameAr: 'قناة تبادل التقارير',
            version: this.version,
            startTime: this._startTime,
            channels: Object.keys(this._subscribers).length,
            totalSubscribers,
            totalQueued,
            recentPublishes: this._publishLog.slice(-10),
            quranRef: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾ — المائدة: 2',
            timestamp: new Date().toISOString()
        };
    }
}

// ─── تصدير نسخة واحدة (Singleton) ────────────────────────────────────────────
const busInstance = new SheikhaReportBus();

module.exports = busInstance;
module.exports.SheikhaReportBus = SheikhaReportBus;
