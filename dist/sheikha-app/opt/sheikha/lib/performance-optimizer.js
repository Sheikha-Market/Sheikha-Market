/**
 * محرك تحسين الأداء السريع
 * يزيل الاختناقات ويحسن سرعة التنفيذ
 */

const fs = require('fs');
const path = require('path');

class PerformanceOptimizer {
    constructor() {
        // ذاكرة تخزين مؤقتة للملفات (Cache)
        this.fileCache = new Map();
        this.cacheTTL = 30000; // 30 ثانية

        // تجميع كتابات الملفات (Batching)
        this.writeBatch = new Map();
        this.batchDelay = 2000; // 2 ثانية
    }

    /**
     * قراءة ملف مع التخزين المؤقت
     */
    readFileOptimized(filePath) {
        const now = Date.now();
        const cached = this.fileCache.get(filePath);

        if (cached && now - cached.timestamp < this.cacheTTL) {
            return cached.data;
        }

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            this.fileCache.set(filePath, { data, timestamp: now });
            return data;
        } catch (_) {
            return '';
        }
    }

    /**
     * قراءة JSON مع التخزين المؤقت
     */
    loadJsonOptimized(filePath) {
        try {
            const data = this.readFileOptimized(filePath);
            return data ? JSON.parse(data) : [];
        } catch (_) {
            return [];
        }
    }

    /**
     * كتابة آمنة وسريعة (تجميع العمليات)
     */
    saveJsonOptimized(filePath, payload) {
        this.ensureDir(path.dirname(filePath));

        // تجميع الكتابات
        this.writeBatch.set(filePath, payload);

        // إنهاء التجميع فوراً للملفات الحرجة
        if (filePath.includes('sync-log') || filePath.includes('errors')) {
            this.flushBatch();
        }
    }

    /**
     * تنفيذ العمليات المجمعة
     */
    flushBatch() {
        for (const [filePath, payload] of this.writeBatch) {
            try {
                fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
                this.fileCache.delete(filePath); // مسح التخزين المؤقت
            } catch (_) {
                // تجاهل الأخطاء
            }
        }
        this.writeBatch.clear();
    }

    /**
     * إضافة مدخل مع حد أقصى (optimized)
     */
    appendOptimized(filePath, entry, limit = 100) {
        const items = this.loadJsonOptimized(filePath);
        items.push(entry);
        const trimmed = items.slice(-limit);
        this.saveJsonOptimized(filePath, trimmed);
        return entry;
    }

    /**
     * التأكد من وجود المجلد
     */
    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * تنظيف الذاكرة
     */
    clearCache() {
        this.fileCache.clear();
    }

    /**
     * إحصائيات الأداء
     */
    getStats() {
        return {
            cacheSize: this.fileCache.size,
            pendingWrites: this.writeBatch.size,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new PerformanceOptimizer();
