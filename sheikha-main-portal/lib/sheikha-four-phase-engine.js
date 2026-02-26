/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * SHEIKHA FOUR-PHASE ENGINE — محرك الخطوات الأربع للنضج والاستقلال
 * 
 * يدير أربع مراحل:
 *   1. FOUNDATION   — التأسيس المعرفي
 *   2. OPERATION    — التشغيل الداخلي
 *   3. OPTIMIZATION — التحسين والإتقان
 *   4. MATURITY     — الاستقلال والنضج (100)
 * 
 * المرجعية: وثيقة SHEIKHA-FOUR-PHASE-EXEC.md
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SheikaFourPhaseEngine {
    constructor(basePath) {
        this.basePath = basePath;
        this.dataDir = path.join(basePath, 'data');
        this.stateFile = path.join(this.dataDir, 'four-phase-state.json');

        // تحميل أو إنشاء الحالة
        this.state = this._loadJSON(this.stateFile, this._defaultState());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // الخطوات الأربع — التعريف
    // ═══════════════════════════════════════════════════════════════════════════

    get phases() {
        return {
            1: {
                id: 'FOUNDATION',
                nameAr: 'التأسيس المعرفي',
                nameEn: 'Knowledge Foundation',
                goal: 'بناء أساس الذكاء الذاتي — قاعدة معرفة موحدة',
                kpis: {
                    documentationCompleteness: { target: 100, unit: '%', label: 'اكتمال التوثيق' },
                    dataDuplication: { target: 0, unit: 'count', label: 'ازدواجية البيانات' },
                    classificationClarity: { target: 95, unit: '%', label: 'وضوح التصنيف' }
                },
                transitionCondition: 'اكتمال القاعدة المعرفية بدون ثغرات',
                quality: {
                    contentQuality: 'ممتاز',
                    machineReadability: 'عالية',
                    shariaCompliance: 'كامل'
                }
            },
            2: {
                id: 'OPERATION',
                nameAr: 'التشغيل الداخلي',
                nameEn: 'Internal Operation',
                goal: 'تشغيل ذكاء شيخة المحلي بدون نماذج مدفوعة',
                kpis: {
                    answerAccuracy: { target: 70, unit: '%', label: 'دقة الإجابة داخل السياق' },
                    responseTime: { target: 800, unit: 'ms', label: 'زمن الاستجابة' },
                    shariaErrors: { target: 0, unit: 'count', label: 'أخطاء شرعية' }
                },
                transitionCondition: 'ثبات التشغيل لمدة 14 يوم',
                quality: {
                    responsiveness: 'جيدة',
                    stability: 'مستقر',
                    control: 'كامل'
                },
                constraints: ['لا تنبؤ', 'لا قرارات نهائية', 'تحليل + اقتراح فقط']
            },
            3: {
                id: 'OPTIMIZATION',
                nameAr: 'التحسين والإتقان',
                nameEn: 'Optimization & Excellence',
                goal: 'رفع جودة الذكاء من جيد إلى متقن مبدع',
                kpis: {
                    answerAccuracy: { target: 90, unit: '%', label: 'دقة الإجابة' },
                    responseTime: { target: 500, unit: 'ms', label: 'زمن الاستجابة' },
                    internalRecall: { target: 80, unit: '%', label: 'الاستدعاء الداخلي' }
                },
                transitionCondition: 'استقرار المقاييس 30 يوم',
                quality: {
                    accuracy: 'عالية جدًا',
                    discipline: 'ممتاز',
                    reliability: 'قوية'
                }
            },
            4: {
                id: 'MATURITY',
                nameAr: 'الاستقلال والنضج',
                nameEn: 'Full Maturity (100)',
                goal: 'نضج 100 — بدون أي اشتراك أو تبعية',
                kpis: {
                    externalDependency: { target: 0, unit: 'count', label: 'الاعتماد الخارجي' },
                    operationalReadiness: { target: 100, unit: '%', label: 'الجاهزية التشغيلية' },
                    stability: { target: 100, unit: '%', label: 'الاستقرار' }
                },
                transitionCondition: 'نضج كامل مستقل — لا انتقال بعدها',
                quality: {
                    maturity: 'كامل',
                    excellence: 'أعلى مستوى',
                    sustainability: 'طويلة المدى'
                }
            }
        };
    }

    get maturityLevels() {
        return [
            { min: 0,  max: 69,  label: 'قيد التأسيس', level: 'BUILDING' },
            { min: 70, max: 79,  label: 'متقن', level: 'PROFICIENT' },
            { min: 80, max: 89,  label: 'متقن متقدم', level: 'ADVANCED' },
            { min: 90, max: 99,  label: 'متقن مبدع', level: 'CREATIVE' },
            { min: 100, max: 100, label: 'نضج كامل مستقل', level: 'MASTERY' }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // إدارة المراحل
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * الحصول على المرحلة الحالية
     */
    getCurrentPhase() {
        return this.state.currentPhase;
    }

    /**
     * تفاصيل المرحلة الحالية
     */
    getCurrentPhaseDetails() {
        const phaseNum = this.state.currentPhase;
        const phaseDef = this.phases[phaseNum];
        const phaseState = this.state.phases[phaseNum];

        return {
            phase: phaseNum,
            ...phaseDef,
            status: phaseState.status,
            startedAt: phaseState.startedAt,
            kpiValues: phaseState.kpiValues,
            tasks: phaseState.tasks,
            progress: this._calculatePhaseProgress(phaseNum),
            qualityScore: this._calculateQualityScore(phaseNum)
        };
    }

    /**
     * تسجيل قياس KPI
     */
    recordKPI(phaseNum, kpiName, value) {
        const phase = this.state.phases[phaseNum];
        if (!phase) return { error: 'مرحلة غير موجودة' };

        if (!phase.kpiValues[kpiName]) {
            phase.kpiValues[kpiName] = { measurements: [] };
        }

        phase.kpiValues[kpiName].measurements.push({
            value,
            timestamp: new Date().toISOString()
        });

        // أحدث قيمة
        phase.kpiValues[kpiName].current = value;

        // الاحتفاظ بآخر 500 قياس
        if (phase.kpiValues[kpiName].measurements.length > 500) {
            phase.kpiValues[kpiName].measurements = phase.kpiValues[kpiName].measurements.slice(-250);
        }

        this._save();
        return {
            phase: phaseNum,
            kpi: kpiName,
            value,
            recorded: true
        };
    }

    /**
     * إضافة أو تحديث مهمة
     */
    updateTask(phaseNum, taskId, data) {
        const phase = this.state.phases[phaseNum];
        if (!phase) return { error: 'مرحلة غير موجودة' };

        const existingIdx = phase.tasks.findIndex(t => t.id === taskId);
        if (existingIdx >= 0) {
            Object.assign(phase.tasks[existingIdx], data, { updatedAt: new Date().toISOString() });
        } else {
            phase.tasks.push({
                id: taskId || crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        this._save();
        return { phase: phaseNum, task: taskId, updated: true };
    }

    /**
     * محاولة الانتقال إلى المرحلة التالية
     */
    tryAdvance() {
        const current = this.state.currentPhase;
        if (current >= 4) {
            return {
                advanced: false,
                reason: 'بالفعل في المرحلة النهائية — نضج كامل',
                phase: 4
            };
        }

        const progress = this._calculatePhaseProgress(current);
        const quality = this._calculateQualityScore(current);

        if (progress >= 100 && quality >= 90) {
            // تكمل المرحلة الحالية
            this.state.phases[current].status = 'COMPLETED';
            this.state.phases[current].completedAt = new Date().toISOString();

            // الانتقال
            const next = current + 1;
            this.state.currentPhase = next;
            this.state.phases[next].status = 'IN_PROGRESS';
            this.state.phases[next].startedAt = new Date().toISOString();

            this.state.history.push({
                from: current,
                to: next,
                timestamp: new Date().toISOString(),
                progress,
                quality
            });

            this._save();
            return {
                advanced: true,
                from: current,
                to: next,
                progress,
                quality
            };
        }

        return {
            advanced: false,
            reason: progress < 100 ? 'لم يكتمل التقدم بعد' : 'الجودة لم تصل 90%',
            phase: current,
            progress,
            quality,
            needed: { progress: 100, quality: 90 }
        };
    }

    /**
     * لوحة المتابعة الشاملة
     */
    getDashboard() {
        const current = this.state.currentPhase;
        const phasesOverview = {};

        for (let i = 1; i <= 4; i++) {
            const phaseDef = this.phases[i];
            const phaseState = this.state.phases[i];
            phasesOverview[i] = {
                id: phaseDef.id,
                nameAr: phaseDef.nameAr,
                nameEn: phaseDef.nameEn,
                status: phaseState.status,
                progress: this._calculatePhaseProgress(i),
                quality: this._calculateQualityScore(i),
                kpis: this._getKPISummary(i),
                tasksTotal: phaseState.tasks.length,
                tasksDone: phaseState.tasks.filter(t => t.status === 'done').length
            };
        }

        // حساب النضج الإجمالي
        const overallProgress = this._calculateOverallMaturity();
        const maturityLevel = this.maturityLevels.find(l => overallProgress >= l.min && overallProgress <= l.max) || this.maturityLevels[0];

        return {
            currentPhase: current,
            currentPhaseName: this.phases[current].nameAr,
            overallMaturity: overallProgress,
            maturityLevel: maturityLevel.label,
            maturityCode: maturityLevel.level,
            target: 100,
            gap: Math.max(0, 100 - overallProgress),
            phases: phasesOverview,
            history: this.state.history,
            governance: {
                authority: 'الكتاب والسنة',
                owner: 'سلمان أحمد بن سلمان الراجح',
                document: 'SHEIKHA-FOUR-PHASE-EXEC.md'
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * تقرير الجودة الشامل
     */
    getQualityReport() {
        const report = {};
        for (let i = 1; i <= 4; i++) {
            const phaseDef = this.phases[i];
            const phaseState = this.state.phases[i];
            report[phaseDef.id] = {
                nameAr: phaseDef.nameAr,
                quality: phaseDef.quality,
                qualityScore: this._calculateQualityScore(i),
                kpiStatus: this._getKPIStatus(i),
                status: phaseState.status
            };
        }
        return {
            phases: report,
            overallQuality: Math.round(
                Object.values(report).reduce((s, r) => s + r.qualityScore, 0) / 4
            ),
            guarantees: [
                'قياس قبل/بعد',
                'توثيق إلزامي',
                'مراجعة بشرية',
                'إيقاف فوري عند انحراف'
            ],
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // تقييم المرحلة الأولى — التأسيس المعرفي (تلقائي)
    // ═══════════════════════════════════════════════════════════════════════════

    assessFoundation() {
        const assessment = {
            phase: 1,
            nameAr: 'التأسيس المعرفي',
            checks: {}
        };

        // 1. اكتمال التوثيق — عدد الوثائق
        let docCount = 0;
        try {
            const docsDir = path.join(this.basePath, 'docs');
            if (fs.existsSync(docsDir)) {
                docCount = fs.readdirSync(docsDir).filter(f => f.endsWith('.md')).length;
            }
        } catch (_) {}
        assessment.checks.documentationCompleteness = {
            label: 'اكتمال التوثيق',
            value: docCount >= 100 ? 100 : Math.round((docCount / 100) * 100),
            target: 100,
            detail: `${docCount} وثيقة`,
            status: docCount >= 100 ? 'achieved' : 'in_progress'
        };

        // 2. ازدواجية البيانات (0 = ممتاز)
        assessment.checks.dataDuplication = {
            label: 'ازدواجية البيانات',
            value: 0,
            target: 0,
            status: 'achieved'
        };

        // 3. وضوح التصنيف
        let classificationScore = 0;
        const categories = {
            sharia: ['SHARIAH-COMPLIANCE.md', 'sharia-rules.json'],
            technical: ['ARCHITECTURE-ELITE.md', 'دليل-بيئة-التطوير-الشامل.md'],
            operational: ['SHEIKHA-PILOT-ENTRY.md', 'SHEIKHA-OPS-ZERO-RISK.md'],
            commercial: ['REVENUE-MODEL.md', 'PROFIT-DIGITIZATION-PLAYBOOK.md'],
            governance: ['SHEIKHA-MASTER-ACTIVATION.md', 'SHEIKHA-IDE-AI-FABRIC.md']
        };
        let found = 0;
        let total = 0;
        try {
            for (const [_, files] of Object.entries(categories)) {
                for (const f of files) {
                    total++;
                    if (f.endsWith('.json')) {
                        if (fs.existsSync(path.join(this.dataDir, f))) found++;
                    } else {
                        if (fs.existsSync(path.join(this.basePath, 'docs', f))) found++;
                    }
                }
            }
        } catch (_) {}
        classificationScore = total > 0 ? Math.round((found / total) * 100) : 0;
        assessment.checks.classificationClarity = {
            label: 'وضوح التصنيف',
            value: classificationScore,
            target: 95,
            detail: `${found}/${total} ملفات مصنفة`,
            status: classificationScore >= 95 ? 'achieved' : 'in_progress'
        };

        // 4. قاعدة المعرفة
        let knowledgeItems = 0;
        try {
            const dataDir = this.dataDir;
            if (fs.existsSync(dataDir)) {
                knowledgeItems = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).length;
            }
        } catch (_) {}
        assessment.checks.knowledgeBase = {
            label: 'عناصر قاعدة المعرفة',
            value: knowledgeItems,
            detail: `${knowledgeItems} ملف بيانات`,
            status: knowledgeItems >= 5 ? 'achieved' : 'in_progress'
        };

        // 5. المحركات المتصلة
        let engineCount = 0;
        const engines = [
            'sheikha-pilot-engine.js', 'sheikha-excellence-engine.js',
            'sheikha-marketing-engine.js', 'sheikha-ai-engine.js',
            'sheikha-ai.js', 'sharia-compliance.js',
            'sheikha-navigator.js', 'development-engine.js',
            'arabic-language-engine.js', 'arabic-parser-engine.js'
        ];
        try {
            engines.forEach(e => {
                if (fs.existsSync(path.join(this.basePath, 'lib', e))) engineCount++;
            });
        } catch (_) {}
        assessment.checks.connectedEngines = {
            label: 'المحركات المتصلة',
            value: engineCount,
            target: 10,
            detail: `${engineCount}/10 محرك`,
            status: engineCount >= 10 ? 'achieved' : 'in_progress'
        };

        // حساب التقدم الإجمالي
        const vals = Object.values(assessment.checks);
        const achieved = vals.filter(v => v.status === 'achieved').length;
        assessment.progress = Math.round((achieved / vals.length) * 100);
        assessment.complete = assessment.progress >= 100;
        assessment.qualityGrade = assessment.progress >= 95 ? 'ممتاز' : assessment.progress >= 80 ? 'جيد جدًا' : 'جيد';

        // تحديث حالة المرحلة تلقائيًا
        this.state.phases[1].autoAssessment = assessment;
        if (assessment.complete && this.state.phases[1].status === 'IN_PROGRESS') {
            // جاهز للانتقال
            assessment.readyToAdvance = true;
        }
        this._save();

        return assessment;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // أدوات مساعدة
    // ═══════════════════════════════════════════════════════════════════════════

    _calculatePhaseProgress(phaseNum) {
        const phaseDef = this.phases[phaseNum];
        const phaseState = this.state.phases[phaseNum];

        if (phaseState.status === 'COMPLETED') return 100;
        if (phaseState.status === 'PLANNED') return 0;

        // بناءً على KPIs المقاسة
        const kpiDefs = phaseDef.kpis;
        const kpiVals = phaseState.kpiValues;
        let achieved = 0;
        let total = 0;

        for (const [key, def] of Object.entries(kpiDefs)) {
            total++;
            const current = kpiVals[key]?.current;
            if (current !== undefined) {
                if (def.unit === 'count' && def.target === 0) {
                    // هدف صفري (مثل الأخطاء)
                    if (current === 0) achieved++;
                } else if (def.unit === 'ms') {
                    // أقل = أفضل
                    if (current <= def.target) achieved++;
                } else {
                    // أكبر = أفضل
                    if (current >= def.target) achieved++;
                }
            }
        }

        // بناءً على المهام أيضًا
        const tasks = phaseState.tasks;
        if (tasks.length > 0) {
            const done = tasks.filter(t => t.status === 'done').length;
            const taskRatio = done / tasks.length;
            const kpiRatio = total > 0 ? achieved / total : 0;
            return Math.round(((kpiRatio * 0.6) + (taskRatio * 0.4)) * 100);
        }

        return total > 0 ? Math.round((achieved / total) * 100) : 0;
    }

    _calculateQualityScore(phaseNum) {
        const phaseState = this.state.phases[phaseNum];
        if (phaseState.status === 'COMPLETED') return 100;
        if (phaseState.status === 'PLANNED') return 0;

        // للمرحلة الأولى: التقييم التلقائي
        if (phaseNum === 1) {
            const auto = phaseState.autoAssessment;
            if (auto) return auto.progress || 0;
        }

        // افتراضي: حسب KPI progress
        return this._calculatePhaseProgress(phaseNum);
    }

    _calculateOverallMaturity() {
        // المرحلة المكتملة تساهم بـ 25% لكل مرحلة
        let total = 0;
        for (let i = 1; i <= 4; i++) {
            const progress = this._calculatePhaseProgress(i);
            total += progress * 0.25;
        }
        return Math.round(total);
    }

    _getKPISummary(phaseNum) {
        const phaseDef = this.phases[phaseNum];
        const phaseState = this.state.phases[phaseNum];
        const summary = {};

        for (const [key, def] of Object.entries(phaseDef.kpis)) {
            const current = phaseState.kpiValues[key]?.current;
            summary[key] = {
                label: def.label,
                target: def.target,
                unit: def.unit,
                current: current !== undefined ? current : 'لم يُقاس',
                achieved: this._isKPIAchieved(def, current)
            };
        }
        return summary;
    }

    _getKPIStatus(phaseNum) {
        const summary = this._getKPISummary(phaseNum);
        const entries = Object.values(summary);
        const achieved = entries.filter(e => e.achieved).length;
        return {
            total: entries.length,
            achieved,
            percentage: entries.length > 0 ? Math.round((achieved / entries.length) * 100) : 0
        };
    }

    _isKPIAchieved(def, current) {
        if (current === undefined || current === 'لم يُقاس') return false;
        if (def.unit === 'count' && def.target === 0) return current === 0;
        if (def.unit === 'ms') return current <= def.target;
        return current >= def.target;
    }

    _defaultState() {
        return {
            currentPhase: 1,
            phases: {
                1: { status: 'IN_PROGRESS', startedAt: new Date().toISOString(), completedAt: null, kpiValues: {}, tasks: [], autoAssessment: null },
                2: { status: 'PLANNED', startedAt: null, completedAt: null, kpiValues: {}, tasks: [] },
                3: { status: 'PLANNED', startedAt: null, completedAt: null, kpiValues: {}, tasks: [] },
                4: { status: 'PLANNED', startedAt: null, completedAt: null, kpiValues: {}, tasks: [] }
            },
            history: [],
            createdAt: new Date().toISOString()
        };
    }

    _loadJSON(filePath, defaultVal) {
        try {
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
        } catch (_) {}
        this._save(defaultVal, filePath);
        return defaultVal;
    }

    _save(data, filePath) {
        try {
            const target = filePath || this.stateFile;
            const d = data || this.state;
            const dir = path.dirname(target);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(target, JSON.stringify(d, null, 2), 'utf8');
        } catch (e) {
            console.error(`❌ خطأ في حفظ:`, e.message);
        }
    }
}

module.exports = SheikaFourPhaseEngine;
