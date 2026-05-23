/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  SHEIKHA MONITOR & INDEX ENGINE — محرك المراقبة والفهرسة الشامل
 *  
 *  المالك: سلمان أحمد بن سلمان الراجح
 *  المرجعية العليا: الكتاب والسنة
 *  
 *  الغرض:
 *    - مراقبة حية لجميع صفحات وخدمات وAPIs المنظومة
 *    - فهرسة شاملة لكل مكون
 *    - تسجيل الأعطال والأخطاء ووقت الاستجابة
 *    - تنبيهات فورية عند أي خلل
 *    - تقارير أداء دورية (يومية/أسبوعية)
 *    - ضمان عدم التوقف — ZERO DOWNTIME
 *    
 *  المنهجية: ISO 20000 (Service Management) + ITIL v4 + Kaizen
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class SheikaMonitorEngine {
    constructor(baseDir, port = 8080) {
        this.baseDir = baseDir;
        this.port = port;
        this.host = '127.0.0.1';
        
        // ═══ فهرس الصفحات ═══
        this.pages = [
            { id: 'home', url: '/', name: 'الصفحة الرئيسية', critical: true },
            { id: 'market', url: '/سوق-شيخة.html', name: 'السوق', critical: true },
            { id: 'register-company', url: '/تسجيل-الشركات.html', name: 'تسجيل الشركات', critical: true },
            { id: 'login', url: '/تسجيل-الدخول.html', name: 'تسجيل الدخول', critical: true },
            { id: 'marketing', url: '/marketing.html', name: 'التسويق', critical: false },
            { id: 'marketing-materials', url: '/المواد-التسويقية.html', name: 'المواد التسويقية', critical: false },
            { id: 'gov-register', url: '/تسجيل-حكومي.html', name: 'تسجيل حكومي', critical: false },
            { id: 'user-dashboard', url: '/لوحة-تحكم-المستخدم.html', name: 'لوحة المستخدم', critical: true },
            { id: 'company-dashboard', url: '/لوحة-الشركة.html', name: 'لوحة الشركة', critical: true },
            { id: 'admin-dashboard', url: '/لوحة-الادمن.html', name: 'لوحة الإدارة', critical: true },
            { id: 'gov-dashboard', url: '/gov-dashboard.html', name: 'لوحة حكومية', critical: false },
            { id: 'ai-system', url: '/منظومة-الذكاء-والتقدم.html', name: 'منظومة الذكاء', critical: true },
            { id: 'excellence', url: '/الإتقان-والتقدم.html', name: 'الإتقان والتقدم', critical: false },
            { id: 'pilot', url: '/التجربة-التشغيلية.html', name: 'التجربة التشغيلية', critical: false },
            { id: 'digital-marketing', url: '/التسويق-الرقمي.html', name: 'التسويق الرقمي', critical: false },
            { id: 'directory', url: '/فهرس-المنظومة.html', name: 'فهرس المنظومة', critical: false },
            { id: 'sharia', url: '/الشريعة-الاسلامية.html', name: 'الشريعة', critical: true },
            { id: 'community', url: '/المجتمع.html', name: 'المجتمع', critical: false },
            { id: 'terms', url: '/الشروط-والسياسات.html', name: 'الشروط', critical: true },
            { id: 'privacy', url: '/سياسة-الخصوصية.html', name: 'الخصوصية', critical: true }
        ];

        // ═══ فهرس APIs ═══
        this.apis = [
            { id: 'pilot-status', url: '/api/pilot/status', name: 'حالة التشغيل', critical: true },
            { id: 'pilot-smi', url: '/api/pilot/smi', name: 'مؤشر النضج', critical: true },
            { id: 'pilot-kpis', url: '/api/pilot/kpis', name: 'مؤشرات الأداء', critical: true },
            { id: 'pilot-health', url: '/api/pilot/health', name: 'صحة النظام', critical: true },
            { id: 'pilot-banner', url: '/api/pilot/banner', name: 'بانر الوضع', critical: false },
            { id: 'pilot-rules', url: '/api/pilot/rules', name: 'القواعد', critical: false },
            { id: 'alml-dashboard', url: '/api/alml/dashboard', name: 'لوحة AL/ML', critical: false },
            { id: 'excellence-dashboard', url: '/api/excellence/dashboard', name: 'لوحة الإتقان', critical: false },
            { id: 'excellence-itqan', url: '/api/excellence/itqan', name: 'تقييم الإتقان', critical: false },
            { id: 'four-phase-dashboard', url: '/api/four-phase/dashboard', name: 'الخطوات الأربع', critical: false },
            { id: 'four-phase-current', url: '/api/four-phase/current', name: 'المرحلة الحالية', critical: false },
            { id: 'advancement-dashboard', url: '/api/advancement/dashboard', name: 'لوحة التقدم', critical: false },
            { id: 'advancement-level', url: '/api/advancement/level', name: 'مستوى الإتقان', critical: false },
            { id: 'prices', url: '/api/prices', name: 'الأسعار الحية', critical: true },
            { id: 'business-plan', url: '/api/business-plan', name: 'خطة العمل', critical: false }
        ];

        // ═══ فهرس المحركات ═══
        this.engines = [
            { id: 'pilot', name: 'Pilot Engine', file: 'sheikha-pilot-engine.js' },
            { id: 'excellence', name: 'Excellence Engine', file: 'sheikha-excellence-engine.js' },
            { id: 'four-phase', name: 'Four-Phase Engine', file: 'sheikha-four-phase-engine.js' },
            { id: 'ai-advancement', name: 'AI Advancement', file: 'sheikha-ai-advancement-engine.js' },
            { id: 'marketing', name: 'Marketing Engine', file: 'sheikha-marketing-engine.js' },
            { id: 'ai-engine', name: 'AI Engine', file: 'sheikha-ai-engine.js' },
            { id: 'ai-assistant', name: 'AI Assistant', file: 'sheikha-ai.js' },
            { id: 'sharia', name: 'Sharia Compliance', file: 'sharia-compliance.js' },
            { id: 'navigator', name: 'Navigator', file: 'sheikha-navigator.js' },
            { id: 'development', name: 'Development', file: 'development-engine.js' },
            { id: 'arabic', name: 'Arabic Language', file: 'arabic-language-engine.js' },
            { id: 'arabic-parser', name: 'Arabic Parser', file: 'arabic-parser-engine.js' }
        ];

        // ═══ سجل المراقبة ═══
        this.healthLog = [];
        this.maxLogEntries = 10000;
        this.checkInterval = null;
        this.checkFrequencyMs = 30000; // كل 30 ثانية

        // ═══ الإحصائيات ═══
        this.stats = {
            totalChecks: 0,
            totalErrors: 0,
            uptimeStart: new Date().toISOString(),
            lastCheck: null,
            consecutiveSuccesses: 0,
            consecutiveFailures: 0,
            longestUptime: 0,
            avgResponseTime: 0,
            responseTimes: []
        };

        // ═══ التنبيهات ═══
        this.alerts = [];
        this.maxAlerts = 500;

        // تحميل السجل السابق
        this._loadState();
    }

    // ═══════════════════════════════════════════════════════════════
    // فحص URL واحد
    // ═══════════════════════════════════════════════════════════════
    _checkURL(urlPath) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const options = {
                hostname: this.host,
                port: this.port,
                path: encodeURI(urlPath),
                method: 'GET',
                timeout: 5000,
                headers: { 'User-Agent': 'SheikaMonitor/1.0' }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        url: urlPath,
                        status: res.statusCode,
                        responseTime: Date.now() - startTime,
                        ok: res.statusCode >= 200 && res.statusCode < 400,
                        timestamp: new Date().toISOString()
                    });
                });
            });

            req.on('error', (err) => {
                resolve({
                    url: urlPath,
                    status: 0,
                    responseTime: Date.now() - startTime,
                    ok: false,
                    error: err.message,
                    timestamp: new Date().toISOString()
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    url: urlPath,
                    status: 0,
                    responseTime: Date.now() - startTime,
                    ok: false,
                    error: 'TIMEOUT',
                    timestamp: new Date().toISOString()
                });
            });

            req.end();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // فحص شامل لكل شيء
    // ═══════════════════════════════════════════════════════════════
    async runFullCheck() {
        const startTime = Date.now();
        const results = {
            timestamp: new Date().toISOString(),
            pages: {},
            apis: {},
            engines: {},
            summary: {}
        };

        // فحص الصفحات
        const pageChecks = await Promise.all(
            this.pages.map(p => this._checkURL(p.url))
        );
        pageChecks.forEach((result, i) => {
            results.pages[this.pages[i].id] = {
                ...this.pages[i],
                ...result
            };
        });

        // فحص APIs
        const apiChecks = await Promise.all(
            this.apis.map(a => this._checkURL(a.url))
        );
        apiChecks.forEach((result, i) => {
            results.apis[this.apis[i].id] = {
                ...this.apis[i],
                ...result
            };
        });

        // فحص المحركات (وجود الملفات)
        this.engines.forEach(engine => {
            const filePath = path.join(this.baseDir, 'lib', engine.file);
            const exists = fs.existsSync(filePath);
            results.engines[engine.id] = {
                ...engine,
                loaded: exists,
                ok: exists
            };
        });

        // ═══ الملخص ═══
        const allPageResults = Object.values(results.pages);
        const allAPIResults = Object.values(results.apis);
        const allEngineResults = Object.values(results.engines);

        const pagesOK = allPageResults.filter(r => r.ok).length;
        const pagesTotal = allPageResults.length;
        const apisOK = allAPIResults.filter(r => r.ok).length;
        const apisTotal = allAPIResults.length;
        const enginesOK = allEngineResults.filter(r => r.ok).length;
        const enginesTotal = allEngineResults.length;

        const criticalPages = allPageResults.filter(r => r.critical);
        const criticalAPIs = allAPIResults.filter(r => r.critical);
        const criticalOK = [...criticalPages, ...criticalAPIs].filter(r => r.ok).length;
        const criticalTotal = criticalPages.length + criticalAPIs.length;

        const allResponseTimes = [...allPageResults, ...allAPIResults]
            .filter(r => r.responseTime)
            .map(r => r.responseTime);
        const avgResponseTime = allResponseTimes.length > 0
            ? Math.round(allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length)
            : 0;

        const totalOK = pagesOK + apisOK + enginesOK;
        const totalAll = pagesTotal + apisTotal + enginesTotal;
        const healthScore = Math.round((totalOK / totalAll) * 100);

        results.summary = {
            healthScore,
            totalOK,
            totalAll,
            pages: { ok: pagesOK, total: pagesTotal, percent: Math.round((pagesOK/pagesTotal)*100) },
            apis: { ok: apisOK, total: apisTotal, percent: Math.round((apisOK/apisTotal)*100) },
            engines: { ok: enginesOK, total: enginesTotal, percent: Math.round((enginesOK/enginesTotal)*100) },
            critical: { ok: criticalOK, total: criticalTotal, allCriticalOK: criticalOK === criticalTotal },
            avgResponseTime,
            checkDuration: Date.now() - startTime,
            status: healthScore === 100 ? 'PERFECT' : healthScore >= 90 ? 'HEALTHY' : healthScore >= 70 ? 'WARNING' : 'CRITICAL'
        };

        // تحديث الإحصائيات
        this.stats.totalChecks++;
        this.stats.lastCheck = results.timestamp;
        this.stats.avgResponseTime = avgResponseTime;

        if (healthScore === 100) {
            this.stats.consecutiveSuccesses++;
            this.stats.consecutiveFailures = 0;
            if (this.stats.consecutiveSuccesses > this.stats.longestUptime) {
                this.stats.longestUptime = this.stats.consecutiveSuccesses;
            }
        } else {
            this.stats.consecutiveFailures++;
            this.stats.consecutiveSuccesses = 0;
            this.stats.totalErrors++;
        }

        // تسجيل التنبيهات
        const failedItems = [
            ...allPageResults.filter(r => !r.ok),
            ...allAPIResults.filter(r => !r.ok)
        ];
        failedItems.forEach(item => {
            this._addAlert('ERROR', `${item.name || item.url} — حالة: ${item.status} — ${item.error || 'غير متاح'}`, item.critical);
        });

        // حفظ في السجل
        this.healthLog.push({
            timestamp: results.timestamp,
            healthScore,
            pagesOK,
            apisOK,
            enginesOK,
            avgResponseTime,
            errors: failedItems.length
        });

        // تقليم السجل
        if (this.healthLog.length > this.maxLogEntries) {
            this.healthLog = this.healthLog.slice(-this.maxLogEntries);
        }

        // حفظ الحالة
        this._saveState();

        return results;
    }

    // ═══════════════════════════════════════════════════════════════
    // التنبيهات
    // ═══════════════════════════════════════════════════════════════
    _addAlert(level, message, isCritical) {
        this.alerts.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            critical: isCritical || false
        });
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(-this.maxAlerts);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // بدء المراقبة التلقائية
    // ═══════════════════════════════════════════════════════════════
    startAutoMonitor(intervalMs) {
        if (this.checkInterval) clearInterval(this.checkInterval);
        const freq = intervalMs || this.checkFrequencyMs;
        this.checkInterval = setInterval(() => {
            this.runFullCheck().catch(err => {
                this._addAlert('SYSTEM', `خطأ في المراقبة التلقائية: ${err.message}`, true);
            });
        }, freq);
        this._addAlert('INFO', `بدء المراقبة التلقائية كل ${freq/1000} ثانية`, false);
        return { started: true, frequency: freq };
    }

    stopAutoMonitor() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this._addAlert('INFO', 'إيقاف المراقبة التلقائية', false);
        return { stopped: true };
    }

    // ═══════════════════════════════════════════════════════════════
    // لوحة التحكم الشاملة
    // ═══════════════════════════════════════════════════════════════
    getDashboard() {
        const recent = this.healthLog.slice(-100);
        const avgScore = recent.length > 0
            ? Math.round(recent.reduce((a, b) => a + b.healthScore, 0) / recent.length)
            : 0;
        
        return {
            bismillah: '☪️ بسم الله الرحمن الرحيم',
            system: 'SHEIKHA Monitor & Index Engine — محرك المراقبة والفهرسة',
            index: {
                pages: this.pages.map(p => ({ id: p.id, name: p.name, url: p.url, critical: p.critical })),
                apis: this.apis.map(a => ({ id: a.id, name: a.name, url: a.url, critical: a.critical })),
                engines: this.engines.map(e => ({ id: e.id, name: e.name, file: e.file })),
                totals: {
                    pages: this.pages.length,
                    apis: this.apis.length,
                    engines: this.engines.length,
                    total: this.pages.length + this.apis.length + this.engines.length
                }
            },
            stats: {
                ...this.stats,
                autoMonitoring: !!this.checkInterval,
                monitorFrequency: this.checkFrequencyMs / 1000 + 's'
            },
            recentHealth: {
                avgScore,
                trend: this._calculateTrend(recent),
                last10: recent.slice(-10)
            },
            alerts: {
                total: this.alerts.length,
                critical: this.alerts.filter(a => a.critical).length,
                recent: this.alerts.slice(-20)
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // تقرير الأداء
    // ═══════════════════════════════════════════════════════════════
    getPerformanceReport() {
        const now = new Date();
        const last24h = this.healthLog.filter(h => {
            return (now - new Date(h.timestamp)) < 24 * 60 * 60 * 1000;
        });
        const last7d = this.healthLog.filter(h => {
            return (now - new Date(h.timestamp)) < 7 * 24 * 60 * 60 * 1000;
        });

        const calcStats = (entries) => {
            if (entries.length === 0) return { avg: 0, min: 0, max: 0, checks: 0, errors: 0, uptime: '0%' };
            const scores = entries.map(e => e.healthScore);
            const errors = entries.filter(e => e.errors > 0).length;
            return {
                avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
                min: Math.min(...scores),
                max: Math.max(...scores),
                checks: entries.length,
                errors,
                uptime: Math.round(((entries.length - errors) / entries.length) * 100) + '%'
            };
        };

        return {
            bismillah: '☪️ بسم الله الرحمن الرحيم',
            report: 'تقرير أداء منظومة شيخة — Performance Report',
            generated: now.toISOString(),
            daily: calcStats(last24h),
            weekly: calcStats(last7d),
            allTime: calcStats(this.healthLog),
            methodology: 'ISO 20000 + ITIL v4 + Kaizen + Itqan'
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // حساب الاتجاه
    // ═══════════════════════════════════════════════════════════════
    _calculateTrend(entries) {
        if (entries.length < 2) return 'STABLE';
        const recent = entries.slice(-5).map(e => e.healthScore);
        const older = entries.slice(-10, -5).map(e => e.healthScore);
        if (older.length === 0) return 'STABLE';
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        if (recentAvg > olderAvg + 2) return 'IMPROVING';
        if (recentAvg < olderAvg - 2) return 'DEGRADING';
        return 'STABLE';
    }

    // ═══════════════════════════════════════════════════════════════
    // حفظ وتحميل الحالة
    // ═══════════════════════════════════════════════════════════════
    _saveState() {
        try {
            const dataDir = path.join(this.baseDir, 'data');
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            
            const state = {
                stats: this.stats,
                healthLog: this.healthLog.slice(-1000),
                alerts: this.alerts.slice(-200),
                savedAt: new Date().toISOString()
            };
            fs.writeFileSync(
                path.join(dataDir, 'monitor-state.json'),
                JSON.stringify(state, null, 2),
                'utf-8'
            );
        } catch (e) {
            // لا نريد أن يتوقف النظام بسبب خطأ حفظ
        }
    }

    _loadState() {
        try {
            const filePath = path.join(this.baseDir, 'data', 'monitor-state.json');
            if (fs.existsSync(filePath)) {
                const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (state.stats) this.stats = { ...this.stats, ...state.stats };
                if (state.healthLog) this.healthLog = state.healthLog;
                if (state.alerts) this.alerts = state.alerts;
            }
        } catch (e) {
            // بداية جديدة
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // الفهرس الكامل
    // ═══════════════════════════════════════════════════════════════
    getFullIndex() {
        return {
            bismillah: '☪️ بسم الله الرحمن الرحيم',
            system: 'فهرس منظومة شيخة الشامل — SHEIKHA Full Index',
            pages: this.pages,
            apis: this.apis,
            engines: this.engines,
            totals: {
                pages: this.pages.length,
                apis: this.apis.length,
                engines: this.engines.length,
                total: this.pages.length + this.apis.length + this.engines.length
            }
        };
    }
}

module.exports = SheikaMonitorEngine;
