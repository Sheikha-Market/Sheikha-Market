/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📝 كاتب التقارير — Sheikha Report Writer
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * وحدة كتابة التقارير التلقائية بين السيرفرات
 *
 * ﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ ﴾
 * — التوبة: 105
 *
 * الوظائف:
 *   writeReport(type, data, serverId) — كتابة تقرير JSON + Markdown
 *   readReport(serverId, reportId)    — قراءة تقرير
 *   listReports(serverId, type?)      — قائمة التقارير
 *   deleteReport(serverId, reportId)  — حذف تقرير
 *   getStats()                        — إحصائيات التقارير
 *
 * أنواع التقارير المدعومة:
 *   development | vision | neural | security | commerce | general
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs');
const path = require('path');

let digitizer;
try {
    digitizer = require('./sheikha-islamic-digitizer.js');
} catch (_) {
    digitizer = null;
}

// ─── أنواع التقارير والآيات المرتبطة بها ─────────────────────────────────────
const REPORT_TYPES = {
    development: {
        nameAr: 'تقرير التطوير',
        quranRef: '﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ ﴾ — التوبة: 105',
        emoji: '🛠️'
    },
    vision: {
        nameAr: 'تقرير الرؤية الحاسوبية',
        quranRef: '﴿ أَوَلَمْ يَنظُرُوا فِي مَلَكُوتِ السَّمَاوَاتِ وَالْأَرْضِ ﴾ — الأعراف: 185',
        emoji: '👁️'
    },
    neural: {
        nameAr: 'تقرير الشبكة العصبية',
        quranRef: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة: 31',
        emoji: '🧠'
    },
    security: {
        nameAr: 'تقرير الأمان',
        quranRef: '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: 60',
        emoji: '🔒'
    },
    commerce: {
        nameAr: 'تقرير التجارة',
        quranRef: '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: 275',
        emoji: '📊'
    },
    general: {
        nameAr: 'تقرير عام',
        quranRef: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾ — الإخلاص: 1',
        emoji: '📋'
    }
};

// ─── مسار مجلد التقارير ───────────────────────────────────────────────────────
const REPORTS_BASE_DIR = path.join(__dirname, '..', 'reports', 'servers');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// ─── Class كاتب التقارير ─────────────────────────────────────────────────────
class SheikhaReportWriter {
    constructor(baseDir = REPORTS_BASE_DIR) {
        this.baseDir = baseDir;
        ensureDir(this.baseDir);
        this.version = '1.0.0';
    }

    /**
     * writeReport(type, data, serverId) — كتابة تقرير JSON و Markdown
     * @param {string} type     — نوع التقرير (development|vision|neural|security|commerce|general)
     * @param {object} data     — بيانات التقرير
     * @param {string} serverId — معرّف السيرفر (افتراضي: 'default')
     * @returns {{ reportId, jsonPath, mdPath, islamicSignature }}
     */
    writeReport(type = 'general', data = {}, serverId = 'default') {
        const reportType = REPORT_TYPES[type] || REPORT_TYPES.general;
        const timestamp = new Date().toISOString();
        const reportId = `${type}-${Date.now()}`;
        const serverDir = path.join(this.baseDir, serverId);
        ensureDir(serverDir);

        // الختم الإسلامي
        const islamicSignature = digitizer ? digitizer.digitize(type) : {
            ref: 'التوبة: 105',
            arabic: '﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ ﴾',
            meaning: 'الشفافية والمساءلة'
        };

        // بناء بيانات التقرير
        const report = {
            reportId,
            type,
            typeAr: reportType.nameAr,
            serverId,
            timestamp,
            bismillah: 'بسم الله الرحمن الرحيم',
            quranRef: reportType.quranRef,
            islamicSignature,
            data,
            version: this.version
        };

        // حفظ JSON
        const jsonPath = path.join(serverDir, `${reportId}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

        // حفظ Markdown
        const mdContent = this._buildMarkdown(report, reportType);
        const mdPath = path.join(serverDir, `${reportId}.md`);
        fs.writeFileSync(mdPath, mdContent, 'utf8');

        // إضافة إلى سجل الموحّد
        this._appendToUnifiedLog({ reportId, type, serverId, timestamp, jsonPath });

        return { reportId, jsonPath, mdPath, islamicSignature, timestamp };
    }

    /**
     * readReport(serverId, reportId) — قراءة تقرير
     * @returns {object|null}
     */
    readReport(serverId, reportId) {
        const jsonPath = path.join(this.baseDir, serverId, `${reportId}.json`);
        if (!fs.existsSync(jsonPath)) return null;
        try {
            return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        } catch (_) {
            return null;
        }
    }

    /**
     * listReports(serverId, type?) — قائمة التقارير لسيرفر محدد
     * @param {string} serverId
     * @param {string} [type]
     * @returns {Array}
     */
    listReports(serverId, type = null) {
        const serverDir = path.join(this.baseDir, serverId);
        if (!fs.existsSync(serverDir)) return [];
        const files = fs.readdirSync(serverDir).filter(f => f.endsWith('.json'));
        const reports = [];
        for (const file of files) {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(serverDir, file), 'utf8'));
                if (!type || content.type === type) {
                    reports.push({
                        reportId: content.reportId,
                        type: content.type,
                        typeAr: content.typeAr,
                        timestamp: content.timestamp,
                        serverId: content.serverId
                    });
                }
            } catch (_) { /* skip malformed */ }
        }
        return reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * listAllReports(type?) — كل التقارير من كل السيرفرات
     */
    listAllReports(type = null) {
        if (!fs.existsSync(this.baseDir)) return [];
        const servers = fs.readdirSync(this.baseDir).filter(f => {
            return fs.statSync(path.join(this.baseDir, f)).isDirectory();
        });
        const all = [];
        for (const serverId of servers) {
            const reports = this.listReports(serverId, type);
            all.push(...reports.map(r => ({ ...r, serverId })));
        }
        return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * deleteReport(serverId, reportId) — حذف تقرير
     */
    deleteReport(serverId, reportId) {
        const serverDir = path.join(this.baseDir, serverId);
        let deleted = 0;
        for (const ext of ['.json', '.md']) {
            const filePath = path.join(serverDir, `${reportId}${ext}`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                deleted++;
            }
        }
        return { deleted, reportId, serverId };
    }

    /**
     * getStats() — إحصائيات التقارير الكاملة
     */
    getStats() {
        const all = this.listAllReports();
        const byType = {};
        const byServer = {};
        for (const r of all) {
            byType[r.type] = (byType[r.type] || 0) + 1;
            byServer[r.serverId] = (byServer[r.serverId] || 0) + 1;
        }
        return {
            total: all.length,
            byType,
            byServer,
            supportedTypes: Object.keys(REPORT_TYPES),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * getStatus() — حالة كاتب التقارير
     */
    getStatus() {
        return {
            name: 'Sheikha Report Writer',
            nameAr: 'كاتب التقارير',
            version: this.version,
            baseDir: this.baseDir,
            supportedTypes: Object.keys(REPORT_TYPES),
            quranRef: '﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ ﴾ — التوبة: 105',
            timestamp: new Date().toISOString()
        };
    }

    // ─── دوال مساعدة خاصة ─────────────────────────────────────────────────────

    _buildMarkdown(report, reportType) {
        const dataSection = Object.entries(report.data || {})
            .map(([k, v]) => `- **${k}**: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join('\n');

        return `# بسم الله الرحمن الرحيم

# ${reportType.emoji} ${reportType.nameAr}

**معرّف التقرير:** \`${report.reportId}\`
**السيرفر:** \`${report.serverId}\`
**التاريخ:** ${report.timestamp}
**النوع:** ${report.type}

---

## الأساس الشرعي

> ${reportType.quranRef}

---

## البيانات

${dataSection || '_لا توجد بيانات_'}

---

## الختم الإسلامي

> **${report.islamicSignature?.arabic || ''}**
> ${report.islamicSignature?.ref || ''} — ${report.islamicSignature?.meaning || ''}

---

*تقرير شيخة — نظام الإدارة الذكي v${report.version}*
`;
    }

    _appendToUnifiedLog(entry) {
        try {
            const logPath = path.join(this.baseDir, 'unified-log.jsonl');
            fs.appendFileSync(logPath, JSON.stringify(entry) + '\n', 'utf8');
        } catch (_) { /* لا يُوقف العملية */ }
    }
}

// ─── تصدير نسخة واحدة (Singleton) ────────────────────────────────────────────
const writerInstance = new SheikhaReportWriter();

module.exports = writerInstance;
module.exports.SheikhaReportWriter = SheikhaReportWriter;
module.exports.REPORT_TYPES = REPORT_TYPES;
