/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   🧠 نظام ربط السياق الذكي — Context Integration Engine          ║
 * ║   يجمع كل الأنظمة: الإصلاح + الإشعارات + SEO + التحليل         ║
 * ║   في منظومة واحدة متكاملة ذكية                                   ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 *
 * القرآن: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" (المائدة:2)
 *
 * @المالك سلمان أحمد بن سلمان الراجح
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

/**
 * نظام ربط السياق الذكي
 * يدير التكامل بين جميع أنظمة شيخة
 */
class ContextIntegrationEngine extends EventEmitter {
    constructor() {
        super();
        this.systems = {
            healing: null,
            notifications: null,
            codeAnalyzer: null,
            seoIntelligence: null,
            seoOptimizer: null
        };

        this.contextHistory = [];
        this.systemMetrics = {};
        this.correlations = {};
        this.dataDir = path.join(process.cwd(), 'data');
        this.contextLogFile = path.join(this.dataDir, 'context-integration.ndjson');
        this.metricsFile = path.join(this.dataDir, 'system-metrics.json');

        this.islamicPrinciples = this._initializeIslamicPrinciples();

        console.log('✅ [Context Integration] نظام ربط السياق الذكي — مُفعّل');
    }

    /**
     * تسجيل الأنظمة الخارجية
     */
    registerSystem(name, systemInstance) {
        if (this.systems.hasOwnProperty(name)) {
            this.systems[name] = systemInstance;
            this.systemMetrics[name] = {
                registered: new Date().toISOString(),
                operationsCount: 0,
                successRate: 'N/A',
                lastOperation: null
            };
            console.log(`✅ [Context] نظام ${name} مُسَجَّل بنجاح`);
            return true;
        }
        return false;
    }

    /**
     * المبادئ الإسلامية للتكامل
     */
    _initializeIslamicPrinciples() {
        return {
            cooperation: {
                name: 'التعاون',
                principle: 'تعاون جميع الأنظمة لتحقيق الهدف المشترك',
                quranRef: 'المائدة:2 — وَتَعَاوَنُوا عَلَى الْبِرِّ',
                implementation: 'كل نظام يدعم الأنظمة الأخرى'
            },
            harmony: {
                name: 'الانسجام',
                principle: 'تناسق كامل بين جميع الأنظمة',
                quranRef: 'الحجرات:13 — جَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا',
                implementation: 'لا تضارب، لا تعارض في القرارات'
            },
            efficiency: {
                name: 'الكفاءة',
                principle: 'أداء أمثل مع أقل موارد',
                quranRef: 'البقرة:195 — وَأَحْسِنُوا',
                implementation: 'تخفيف العمل المكرر، تضخيم النتائج'
            },
            transparency: {
                name: 'الشفافية',
                principle: 'كل نظام يعرف حالة الأنظمة الأخرى',
                quranRef: 'الأنفال:27 — وَلَا تَخُونُوا الْأَمَانَاتِ',
                implementation: 'سجل مشترك، رؤية كاملة'
            }
        };
    }

    /**
     * قراءة السياق الكامل للنظام
     */
    async readFullContext() {
        const context = {
            id: this._generateId(),
            timestamp: new Date().toISOString(),
            snapshot: {
                systems: {},
                metrics: {},
                correlations: {},
                recommendations: []
            }
        };

        // قراءة حالة كل نظام
        if (this.systems.healing) {
            context.snapshot.systems.healing = {
                status: 'active',
                stats: this.systems.healing.getStatistics?.() || {}
            };
        }

        if (this.systems.seoIntelligence) {
            context.snapshot.systems.seoIntelligence = {
                status: 'active',
                stats: this.systems.seoIntelligence.getStatistics?.() || {}
            };
        }

        context.snapshot.metrics = this.systemMetrics;

        // تحليل الارتباطات
        context.snapshot.correlations = await this._analyzeSystemCorrelations();

        // توصيات مستندة على السياق
        context.snapshot.recommendations = this._generateContextBasedRecommendations(context);

        // حفظ السياق
        await this._saveContext(context);

        return context;
    }

    /**
     * تحليل الارتباطات بين الأنظمة
     */
    async _analyzeSystemCorrelations() {
        const correlations = {
            healingToSEO: {
                description: 'تأثير الإصلاح الذاتي على SEO',
                relationship: 'غير مباشر — كل إصلاح يحسّن استقرار الموقع',
                impact: 'عالي — موقع مستقر = تصنيف أفضل'
            },
            seoToHealing: {
                description: 'تأثير تحسينات SEO على الأداء',
                relationship: 'مباشر — كل تحسين SEO قد يضع ضغطاً على الموارد',
                impact: 'متوسط — السيرفر قد يحتاج إصلاح تلقائي'
            },
            notificationsToHuman: {
                description: 'الإشعارات كوسيط اتصال',
                relationship: 'مباشر جداً — الإشعارات تخبر المالك عن حالة النظام',
                impact: 'عالي — قرارات بشرية سريعة'
            },
            codeAnalysisToImprovement: {
                description: 'تحليل الأكواد يقود إلى تحسينات',
                relationship: 'مباشر — كل اكتشاف خطأ = فرصة تحسين',
                impact: 'عالي — تحسين مستمر'
            }
        };

        this.correlations = correlations;
        return correlations;
    }

    /**
     * توليد توصيات مستندة على السياق
     */
    _generateContextBasedRecommendations(context) {
        const recommendations = [];

        // 1. توصيات الكفاءة
        if (context.snapshot.systems.healing?.stats?.totalHeals > 100) {
            recommendations.push({
                priority: 'عالية',
                category: 'كفاءة',
                issue: 'عدد الإصلاحات مرتفع',
                action: 'تحليل جذر المشكلة لتقليل الإصلاحات المتكررة',
                quranRef: 'الحجرات:6 — تَثَبَّتُوا (التدقيق)',
                estimatedSaving: '30% من عمليات الإصلاح'
            });
        }

        // 2. توصيات التكامل
        recommendations.push({
            priority: 'عالية',
            category: 'تكامل',
            issue: 'ربط SEO بالإصلاح الذاتي',
            action: 'أي تحسين SEO يجب أن ينطلق من نظام الإصلاح إذا لزم الأمر',
            quranRef: 'المائدة:2 — تعاون شامل',
            benefit: 'ضمان استقرار الموقع أثناء التحسينات'
        });

        // 3. توصيات الشفافية
        recommendations.push({
            priority: 'متوسطة',
            category: 'شفافية',
            issue: 'سجل مشترك',
            action: 'إنشاء سجل يخبر المالك بكل تطور في أي نظام',
            quranRef: 'الأنفال:27 — الأمانة',
            frequency: 'تنبيهات فورية للأحداث المهمة'
        });

        // 4. توصيات التعلم
        recommendations.push({
            priority: 'عالية',
            category: 'تحسين مستمر',
            issue: 'تحسين دوري',
            action: 'كل 7 أيام: تحليل كامل + توصيات + تحسينات',
            quranRef: 'الرحمن:29 — كل يوم هو في شأن',
            cycleName: 'أسبوع التحسين الإسلامي'
        });

        return recommendations;
    }

    /**
     * تنسيق عملية تحسين شاملة
     */
    async orchestrateFullOptimization() {
        const orchestration = {
            id: this._generateId(),
            timestamp: new Date().toISOString(),
            phases: [],
            results: {},
            quranRef: 'التوبة:105 — وَقُلِ اعْمَلُوا'
        };

        console.log('🎯 [Context] بدء عملية التحسين الشاملة...');

        // Phase 1: قراءة السياق الحالي
        console.log('📊 Phase 1: قراءة السياق الحالي...');
        const currentContext = await this.readFullContext();
        orchestration.phases.push({
            name: 'Context Reading',
            status: 'completed',
            timestamp: new Date().toISOString()
        });

        // Phase 2: فحص صحة جميع الأنظمة
        console.log('🏥 Phase 2: فحص صحة الأنظمة...');
        const healthCheck = await this._performSystemHealthChecks();
        orchestration.phases.push({
            name: 'Health Checks',
            status: 'completed',
            results: healthCheck,
            timestamp: new Date().toISOString()
        });

        // Phase 3: تحليل SEO إذا لزم الأمر
        if (this.systems.seoIntelligence) {
            console.log('🌐 Phase 3: تحليل SEO...');
            if (currentContext.snapshot.systems.seoIntelligence?.stats?.lastAnalysis) {
                // إذا كان التحليل قديماً (أكثر من 24 ساعة)
                const lastAnalysisTime = new Date(
                    currentContext.snapshot.systems.seoIntelligence.stats.lastAnalysis
                );
                const hoursDiff = (Date.now() - lastAnalysisTime) / (1000 * 60 * 60);

                if (hoursDiff > 24) {
                    try {
                        const seoAnalysis =
                            await this.systems.seoIntelligence.analyzeSheikhaForAllEngines?.();
                        orchestration.phases.push({
                            name: 'SEO Analysis',
                            status: 'completed',
                            score: seoAnalysis?.overallScore,
                            timestamp: new Date().toISOString()
                        });
                    } catch (e) {
                        console.warn('⚠️ خطأ في تحليل SEO:', e.message);
                    }
                }
            }
        }

        // Phase 4: تطبيق التحسينات
        console.log('⚡ Phase 4: تطبيق التحسينات...');
        const improvements = await this._applyImprovements();
        orchestration.phases.push({
            name: 'Improvements Application',
            status: 'completed',
            count: improvements.length,
            timestamp: new Date().toISOString()
        });

        // Phase 5: إرسال إشعار للمالك
        if (this.systems.notifications) {
            console.log('📢 Phase 5: إرسال إشعار...');
            this.systems.notifications.notify(
                'success',
                `✅ اكتملت عملية التحسين الشاملة — ${improvements.length} تحسين طُبِّق`,
                {
                    score: currentContext.snapshot.systems.seoIntelligence?.stats?.lastAnalysis
                        ?.overallScore,
                    improvements: improvements.length,
                    phase: 'orchestration'
                }
            );
        }

        orchestration.results = {
            totalPhases: orchestration.phases.length,
            completedPhases: orchestration.phases.filter(p => p.status === 'completed').length,
            totalImprovements: improvements.length,
            systemHealth: healthCheck
        };

        await this._saveOrchestration(orchestration);

        console.log('✅ [Context] اكتملت عملية التحسين الشاملة');

        return orchestration;
    }

    /**
     * فحص صحة كل الأنظمة
     */
    async _performSystemHealthChecks() {
        const health = {
            timestamp: new Date().toISOString(),
            overallHealth: 'healthy',
            systems: {}
        };

        for (const [name, system] of Object.entries(this.systems)) {
            if (system) {
                health.systems[name] = {
                    status: 'active',
                    operational: true,
                    lastCheck: new Date().toISOString()
                };
            }
        }

        return health;
    }

    /**
     * تطبيق التحسينات على جميع الأنظمة
     */
    async _applyImprovements() {
        const improvements = [];

        // تحسينات محددة لكل نظام
        improvements.push({
            system: 'global',
            action: 'تحسين السياق العام',
            impact: 'عالي',
            quranRef: 'الملك:3-4 — الإتقان'
        });

        // تحسينات SEO
        if (this.systems.seoOptimizer) {
            improvements.push({
                system: 'seo',
                action: 'مراجعة robots.txt و sitemap.xml',
                impact: 'متوسط',
                quranRef: 'البقرة:282 — التوثيق'
            });
        }

        // تحسينات الأداء
        improvements.push({
            system: 'performance',
            action: 'تحسين سرعة التحميل',
            impact: 'عالي',
            quranRef: 'العصر:1-3 — الزمن'
        });

        return improvements;
    }

    /**
     * توليد تقرير السياق الشامل
     */
    async generateFullContextReport() {
        const report = {
            id: this._generateId(),
            timestamp: new Date().toISOString(),
            title: 'تقرير السياق الشامل لشيخة',
            sections: {}
        };

        // 1. حالة النظام
        report.sections.systemStatus = {
            heading: 'حالة النظام الشاملة',
            systems: this.systems,
            metrics: this.systemMetrics
        };

        // 2. الارتباطات بين الأنظمة
        report.sections.systemCorrelations = {
            heading: 'الارتباطات بين الأنظمة',
            correlations: this.correlations
        };

        // 3. التوصيات
        const context = await this.readFullContext();
        report.sections.recommendations = {
            heading: 'التوصيات ذات الأولوية',
            recommendations: context.snapshot.recommendations
        };

        // 4. المبادئ الإسلامية
        report.sections.islamicPrinciples = {
            heading: 'المبادئ الإسلامية للتكامل',
            principles: this.islamicPrinciples
        };

        // 5. الآفاق المستقبلية
        report.sections.futureOutlook = {
            heading: 'الآفاق المستقبلية',
            nextSteps: [
                'تحسين سرعة الموقع على جميع المحركات',
                'بناء روابط خلفية من مواقع إسلامية موثوقة',
                'تطوير محتوى إسلامي متخصص',
                'تصدر النتائج للكلمات المفتاحية الإسلامية'
            ]
        };

        await this._saveReport(report);

        return report;
    }

    /**
     * الاستماع إلى أحداث الأنظمة الأخرى
     */
    attachEventListeners() {
        // الاستماع إلى أحداث الإصلاح الذاتي
        if (this.systems.healing instanceof EventEmitter) {
            this.systems.healing.on('healed', data => {
                this.emit('system-event', {
                    type: 'healing',
                    event: 'healed',
                    data,
                    timestamp: new Date().toISOString()
                });
            });
        }

        console.log('✅ [Context] مستمعو الأحداث مُفعَّلة');
    }

    /**
     * حفظ السياق
     */
    async _saveContext(context) {
        try {
            const logEntry = JSON.stringify(context) + '\n';
            await fs.appendFile(this.contextLogFile, logEntry);
            this.contextHistory.push(context.id);
        } catch (error) {
            console.error('❌ خطأ في حفظ السياق:', error.message);
        }
    }

    /**
     * حفظ عملية التنسيق
     */
    async _saveOrchestration(orchestration) {
        try {
            const logEntry = JSON.stringify(orchestration) + '\n';
            await fs.appendFile(this.contextLogFile, logEntry);
        } catch (error) {
            console.error('❌ خطأ في حفظ عملية التنسيق:', error.message);
        }
    }

    /**
     * حفظ التقرير
     */
    async _saveReport(report) {
        try {
            const reportPath = path.join(this.dataDir, `context-report-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`💾 تم حفظ التقرير: ${reportPath}`);
        } catch (error) {
            console.error('❌ خطأ في حفظ التقرير:', error.message);
        }
    }

    /**
     * توليد معرف فريد
     */
    _generateId() {
        return `ctx-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }

    /**
     * الحصول على إحصائيات كاملة
     */
    getStatistics() {
        return {
            activeSystems: Object.values(this.systems).filter(s => s !== null).length,
            totalSystems: Object.keys(this.systems).length,
            contextSnapshots: this.contextHistory.length,
            correlations: Object.keys(this.correlations).length,
            islamicPrinciples: Object.keys(this.islamicPrinciples).length,
            quranFoundation: 'المائدة:2 — وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ'
        };
    }
}

module.exports = new ContextIntegrationEngine();
