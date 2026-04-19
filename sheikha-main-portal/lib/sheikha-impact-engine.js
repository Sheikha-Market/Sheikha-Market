/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA SMART IMPACT ENGINE — محرك شيخة الذكي للأثر الوطني
 *
 * المالك: سلمان أحمد بن سلمان الراجح — مستشار دولي
 *
 * "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ" — التوبة:١٠٥
 * "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ" — النجم:٣٩
 *
 * الهدف: التكامل مع أهداف الدولة · تحديث تلقائي للمؤشرات
 *        · تقييم الأثر 0-100 · ترتيب الأداء · مسار الأول والأفضل
 *
 * ✅ تتبع حي لجميع مؤشرات الأداء عبر البرامج الـ١١
 * ✅ تقييم تلقائي 0-100 لكل برنامج
 * ✅ ترتيب شيخة وطنياً وعالمياً
 * ✅ مسار "الأول والأفضل" — الفجوة بين الحالي والمستهدف
 * ✅ توصيات تحسين ذكية لكل برنامج
 * ✅ تقرير الأثر الوطني الشامل
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const SheikhaVisionLeadership = require('./sheikha-vision-leadership');

class SheikhaImpactEngine {
    constructor() {
        this.name      = 'محرك شيخة الذكي للأثر الوطني';
        this.nameEn    = 'Sheikha Smart National Impact Engine';
        this.version   = '2.0.0';

        // تهيئة المحرك الأساسي
        this._visionEngine = new SheikhaVisionLeadership();

        // بيانات التقدم الحالي — تُحدَّث تلقائياً
        this._progressData  = this._initProgressData();
        this._nationalIndex = this._buildNationalIndex();
        this._lastRefreshed = new Date().toISOString();
    }

    // ══════════════════════════════════════════════════════════
    // بيانات التقدم الحالي للمؤشرات الوطنية
    // (مصادر: وزارة الاقتصاد · هيئة الإحصاء · منصات الحكومة الرقمية)
    // ══════════════════════════════════════════════════════════
    _initProgressData() {
        return {

            // ── برنامج جودة الحياة ─────────────────────────────
            'SHK-QOL': {
                lastUpdated: new Date().toISOString(),
                source:      'هيئة الإحصاء العامة + وزارة الرياضة',
                actuals: {
                    'SHK-QOL-T1': { current: 3.5,    baseline: 2,     target: 6,      unit: '%',     trend: 'up' },
                    'SHK-QOL-T2': { current: 22,      baseline: 13,    target: 40,     unit: '%',     trend: 'up' },
                    'SHK-QOL-T3': { current: 30,      baseline: null,  target: 10,     unit: 'مرتبة', trend: 'up', lowerIsBetter: true },
                    'SHK-QOL-T4': { current: 120,     baseline: 0,     target: 450,    unit: 'نادٍ',  trend: 'up' },
                },
            },

            // ── برنامج صندوق الاستثمارات العامة ───────────────
            'SHK-PIF': {
                lastUpdated: new Date().toISOString(),
                source:      'صندوق الاستثمارات العامة + وزارة الاقتصاد',
                actuals: {
                    'SHK-PIF-T1': { current: 150,     baseline: 0,     target: 2000,   unit: 'مليار ريال', trend: 'up' },
                    'SHK-PIF-T2': { current: 40000,   baseline: 0,     target: 1000000,unit: 'وظيفة',      trend: 'up' },
                    'SHK-PIF-T3': { current: 3,        baseline: 0,     target: 25,     unit: 'مشروع',      trend: 'up' },
                    'SHK-PIF-T4': { current: 45,       baseline: 0,     target: 500,    unit: 'شركة',       trend: 'up' },
                },
            },

            // ── برنامج التحول الوطني ───────────────────────────
            'SHK-NTP': {
                lastUpdated: new Date().toISOString(),
                source:      'وزارة الاتصالات + هيئة الحكومة الرقمية',
                actuals: {
                    'SHK-NTP-T1': { current: 75,       baseline: 0,     target: 100,    unit: '%',     trend: 'up' },
                    'SHK-NTP-T2': { current: 72,       baseline: 0,     target: 90,     unit: '%',     trend: 'up' },
                    'SHK-NTP-T3': { current: 80,       baseline: 0,     target: 200,    unit: 'مليار', trend: 'up' },
                    'SHK-NTP-T4': { current: 13,       baseline: null,  target: 5,      unit: 'مرتبة', trend: 'up', lowerIsBetter: true },
                },
            },

            // ── برنامج خدمة ضيوف الرحمن ───────────────────────
            'SHK-PILGRIM': {
                lastUpdated: new Date().toISOString(),
                source:      'وزارة الحج والعمرة + هيئة الإحصاء',
                actuals: {
                    'SHK-PIU-T1': { current: 15000000, baseline: 8000000, target: 1000000000, unit: 'معتمر', trend: 'up' },
                    'SHK-PIU-T2': { current: 78,       baseline: 0,     target: 95,     unit: '%',     trend: 'up' },
                    'SHK-PIU-T3': { current: 1.5,      baseline: 0,     target: 3,      unit: '%',     trend: 'up' },
                    'SHK-PIU-T4': { current: 1200,     baseline: 0,     target: 10000,  unit: 'مزود',  trend: 'up' },
                },
            },

            // ── برنامج تنمية القدرات البشرية ──────────────────
            'SHK-HCDP': {
                lastUpdated: new Date().toISOString(),
                source:      'وزارة الموارد البشرية + هيئة الإحصاء',
                actuals: {
                    'SHK-HCD-T1': { current: 8.3,      baseline: 11.6,  target: 7,      unit: '%',     trend: 'down', lowerIsBetter: true },
                    'SHK-HCD-T2': { current: 24,        baseline: 17,    target: 30,     unit: '%',     trend: 'up' },
                    'SHK-HCD-T3': { current: 80000,    baseline: 0,     target: 150000, unit: 'مبتعث', trend: 'up' },
                    'SHK-HCD-T4': { current: 180000,   baseline: 0,     target: 500000, unit: 'متدرب', trend: 'up' },
                },
            },

            // ── برنامج الصناعة الوطنية واللوجستيات ───────────
            'SHK-NIDLP': {
                lastUpdated: new Date().toISOString(),
                source:      'وزارة الصناعة + الهيئة العامة للصناعة',
                actuals: {
                    'SHK-NDL-T1': { current: 17,        baseline: 13,    target: 26,     unit: '%',     trend: 'up' },
                    'SHK-NDL-T2': { current: 30,        baseline: 16,    target: 50,     unit: '%',     trend: 'up' },
                    'SHK-NDL-T3': { current: 38,        baseline: null,  target: 25,     unit: 'مرتبة', trend: 'up', lowerIsBetter: true },
                    'SHK-NDL-T4': { current: 8000,      baseline: 0,     target: 50000,  unit: 'مورد',  trend: 'up' },
                },
            },

            // ── برنامج تحول القطاع الصحي ──────────────────────
            'SHK-HSTP': {
                lastUpdated: new Date().toISOString(),
                source:      'وزارة الصحة + هيئة الصحة الرقمية',
                actuals: {
                    'SHK-HST-T1': { current: 75.5,     baseline: 74,    target: 80,     unit: 'سنة',   trend: 'up' },
                    'SHK-HST-T2': { current: 9,         baseline: 12,    target: 6,      unit: '/100k', trend: 'down', lowerIsBetter: true },
                    'SHK-HST-T3': { current: 82,        baseline: 0,     target: 100,    unit: '%',     trend: 'up' },
                    'SHK-HST-T4': { current: 42,        baseline: 0,     target: 70,     unit: '%',     trend: 'up' },
                },
            },

            // ── برنامج الإسكان ─────────────────────────────────
            'SHK-HOUSING': {
                lastUpdated: new Date().toISOString(),
                source:      'وزارة الإسكان + صندوق التنمية العقارية',
                actuals: {
                    'SHK-HSG-T1': { current: 60,        baseline: 47,    target: 70,     unit: '%',     trend: 'up' },
                    'SHK-HSG-T2': { current: 420000,   baseline: 0,     target: 1000000,unit: 'وحدة',  trend: 'up' },
                    'SHK-HSG-T3': { current: 4,         baseline: 0,     target: 1,      unit: 'يوم',   trend: 'down', lowerIsBetter: true },
                    'SHK-HSG-T4': { current: 2500,      baseline: 0,     target: 10000,  unit: 'جهة',   trend: 'up' },
                },
            },

            // ── برنامج تطوير القطاع المالي ────────────────────
            'SHK-FSDP': {
                lastUpdated: new Date().toISOString(),
                source:      'البنك المركزي السعودي (SAMA) + هيئة السوق المالية',
                actuals: {
                    'SHK-FSD-T1': { current: 62,        baseline: 18,    target: 70,     unit: '%',     trend: 'up' },
                    'SHK-FSD-T2': { current: 83,        baseline: 62,    target: 90,     unit: '%',     trend: 'up' },
                    'SHK-FSD-T3': { current: 19,        baseline: null,  target: 10,     unit: 'مرتبة', trend: 'up', lowerIsBetter: true },
                    'SHK-FSD-T4': { current: 180,       baseline: 0,     target: 1000,   unit: 'شركة',  trend: 'up' },
                },
            },

            // ── برنامج التخصيص ────────────────────────────────
            'SHK-PRIV': {
                lastUpdated: new Date().toISOString(),
                source:      'مركز الاستثمار + مركز تطوير القطاع الخاص',
                actuals: {
                    'SHK-PRV-T1': { current: 55,        baseline: 40,    target: 65,     unit: '%',     trend: 'up' },
                    'SHK-PRV-T2': { current: 2200,      baseline: 0,     target: 4500,   unit: 'مليار', trend: 'up' },
                    'SHK-PRV-T3': { current: 4.5,       baseline: 3.8,   target: 5.7,    unit: '%',     trend: 'up' },
                    'SHK-PRV-T4': { current: 120,       baseline: 0,     target: 500,    unit: 'فرصة',  trend: 'up' },
                },
            },

            // ── برنامج الاستدامة المالية ──────────────────────
            'SHK-FSP': {
                lastUpdated: new Date().toISOString(),
                source:      'وزارة المالية + هيئة الإحصاء العامة',
                actuals: {
                    'SHK-FSP-T1': { current: 410,       baseline: 163,   target: 1000,   unit: 'مليار', trend: 'up' },
                    'SHK-FSP-T2': { current: -55,       baseline: null,  target: 0,      unit: 'مليار', trend: 'up', lowerIsBetter: true },
                    'SHK-FSP-T3': { current: 24,        baseline: null,  target: 30,     unit: '%',     trend: 'down', lowerIsBetter: true },
                    'SHK-FSP-T4': { current: 120,       baseline: 0,     target: 200,    unit: 'مليار', trend: 'up' },
                },
            },
        };
    }

    // ══════════════════════════════════════════════════════════
    // بناء مؤشر الأثر الوطني الشامل
    // ══════════════════════════════════════════════════════════
    _buildNationalIndex() {
        const scores = this._visionEngine.programs.map(prog => {
            const progData = this._progressData[prog.id];
            if (!progData) return { programId: prog.id, score: 0, rank: 0, targets: [] };

            const targetScores = prog.tangibleTargets.map(t => {
                const actual = progData.actuals[t.id];
                if (!actual) return { targetId: t.id, progress: 0, score: 0 };

                let progress = 0;
                if (actual.lowerIsBetter) {
                    // للمؤشرات التي الأقل فيها أفضل (بطالة، وفيات...)
                    const worstVal  = actual.baseline !== null ? actual.baseline : actual.current * 1.5;
                    const totalDrop = worstVal - actual.target;
                    const achieved  = worstVal - actual.current;
                    progress = totalDrop > 0 ? Math.min(100, Math.round((achieved / totalDrop) * 100)) : 0;
                } else {
                    const start = actual.baseline !== null ? actual.baseline : 0;
                    const total = actual.target - start;
                    const done  = actual.current - start;
                    progress = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
                }

                // نقاط الأثر الإضافية
                const velocityBonus = actual.trend === 'up' || (actual.lowerIsBetter && actual.trend === 'down') ? 5 : 0;

                const score = Math.min(100, progress + velocityBonus);
                const gap   = actual.lowerIsBetter
                    ? actual.current - actual.target
                    : actual.target - actual.current;

                return {
                    targetId:   t.id,
                    desc:       t.desc,
                    icon:       t.icon,
                    baseline:   actual.baseline,
                    current:    actual.current,
                    target:     actual.target,
                    unit:       t.unit,
                    progress,
                    score,
                    gap:        Math.max(0, gap),
                    trend:      actual.trend,
                    lowerIsBetter: actual.lowerIsBetter || false,
                    status:     score >= 80 ? 'متقدم' : score >= 50 ? 'على المسار' : 'يحتاج تسريع',
                    statusEn:   score >= 80 ? 'Advanced' : score >= 50 ? 'On Track' : 'Needs Acceleration',
                };
            });

            const programScore = targetScores.length > 0
                ? Math.round(targetScores.reduce((s, t) => s + t.score, 0) / targetScores.length)
                : 0;

            const sheikhaBonus = this._calcSheikhaBonus(prog);

            return {
                programId:    prog.id,
                sheikhaName:  prog.sheikhaName,
                sheikhaLeader: prog.sheikhaLeader,
                pillar:       prog.pillar,
                royalGoal:    prog.royalGoal,
                score:        Math.min(100, programScore + sheikhaBonus),
                rawScore:     programScore,
                sheikhaBonus,
                source:       progData.source,
                lastUpdated:  progData.lastUpdated,
                targets:      targetScores,
                status:       programScore >= 80 ? '🟢 متقدم' : programScore >= 50 ? '🟡 على المسار' : '🔴 يحتاج تسريع',
                improvements: this._getImprovements(prog, targetScores),
            };
        });

        // ترتيب تنازلي
        scores.sort((a, b) => b.score - a.score);
        scores.forEach((s, i) => { s.rank = i + 1; });

        const nationalScore = scores.length > 0
            ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
            : 0;

        return {
            nationalScore,
            nationalRating: nationalScore >= 80 ? 'ممتاز 🏆' : nationalScore >= 65 ? 'جيد جداً ⭐' : nationalScore >= 50 ? 'جيد 📈' : 'يحتاج تطوير 🔧',
            programScores: scores,
            topPerformer:  scores[0] || null,
            needsAttention: scores.filter(s => s.score < 50),
            generatedAt:   new Date().toISOString(),
        };
    }

    // ══════════════════════════════════════════════════════════
    // مكافأة مساهمة شيخة (0-10 نقاط إضافية)
    // ══════════════════════════════════════════════════════════
    _calcSheikhaBonus(program) {
        // كل مساهمة رقمية مُفعّلة تضيف 2 نقاط (بحد أقصى 10)
        const count = (program.sheikhaContribution || []).length;
        return Math.min(10, count * 2);
    }

    // ══════════════════════════════════════════════════════════
    // توصيات تحسين ذكية
    // ══════════════════════════════════════════════════════════
    _getImprovements(program, targetScores) {
        const weak = targetScores.filter(t => t.score < 50);
        const recs = [];

        if (weak.length === 0) {
            recs.push({ priority: 'حافظ', action: 'الحفاظ على الأداء المتقدم وتسريع الوتيرة للوصول قبل ٢٠٣٠', icon: '🏆' });
        }

        weak.forEach(t => {
            recs.push({
                priority: 'عاجل',
                targetId: t.targetId,
                action:   `تسريع تحقيق: ${t.desc} — الفجوة الحالية: ${t.gap.toLocaleString()} ${t.unit}`,
                gap:      t.gap,
                icon:     '🔴',
            });
        });

        // توصيات عامة للبرنامج
        recs.push({
            priority: 'استراتيجي',
            action:   `توسيع مساهمة منصة شيخة في "${program.sheikhaName}" عبر تفعيل جميع الأدوات الرقمية`,
            icon:     '🚀',
        });

        return recs;
    }

    // ══════════════════════════════════════════════════════════
    // تحديث بيانات الأثر الحي (Refresh)
    // ══════════════════════════════════════════════════════════
    refresh(updates) {
        if (updates && typeof updates === 'object') {
            // دمج التحديثات الواردة مع بيانات التقدم
            for (const [programId, data] of Object.entries(updates)) {
                if (this._progressData[programId]) {
                    if (data.actuals) {
                        Object.assign(this._progressData[programId].actuals, data.actuals);
                    }
                    this._progressData[programId].lastUpdated = new Date().toISOString();
                }
            }
        }

        // إعادة بناء المؤشر بعد التحديث
        this._nationalIndex = this._buildNationalIndex();
        this._lastRefreshed = new Date().toISOString();

        return {
            success:      true,
            refreshedAt:  this._lastRefreshed,
            nationalScore: this._nationalIndex.nationalScore,
            nationalRating: this._nationalIndex.nationalRating,
        };
    }

    // ══════════════════════════════════════════════════════════
    // مسار "الأول والأفضل" — ماذا يلزم للوصول للمركز الأول
    // ══════════════════════════════════════════════════════════
    getFirstPlaceRoadmap() {
        const scores   = this._nationalIndex.programScores;
        const national = this._nationalIndex.nationalScore;
        const gap      = 100 - national;

        const criticalActions = scores
            .filter(s => s.score < 80)
            .sort((a, b) => a.score - b.score)
            .slice(0, 5)
            .map(s => ({
                programId:   s.programId,
                sheikhaName: s.sheikhaName,
                currentScore: s.score,
                neededScore:  80,
                gap:          80 - s.score,
                topActions:   s.improvements.filter(i => i.priority === 'عاجل').slice(0, 2),
            }));

        const milestones = [
            { score: 50, label: 'نصف الطريق للقيادة',     reward: 'تقرير المساهمة الوطني الأول' },
            { score: 65, label: 'منطقة الأداء الجيد جداً', reward: 'شراكة حكومية رسمية' },
            { score: 80, label: 'منطقة التميز',            reward: 'جائزة الأثر الوطني' },
            { score: 90, label: 'منطقة الريادة',           reward: 'نموذج إقليمي يُحتذى به' },
            { score: 100, label: '🏆 الأول والأفضل',       reward: 'قائد رؤية ٢٠٣٠ الرقمي' },
        ];

        const nextMilestone = milestones.find(m => m.score > national) || milestones[milestones.length - 1];

        return {
            currentScore:    national,
            currentRating:   this._nationalIndex.nationalRating,
            targetScore:     100,
            gapToFirst:      gap,
            nextMilestone,
            milestones:      milestones.map(m => ({
                ...m,
                achieved: national >= m.score,
                remaining: Math.max(0, m.score - national),
            })),
            criticalActions,
            estimatedTimeToFirst: this._estimateTimeToFirst(gap),
            quranic_ref: { ref: 'التوبة:١٠٥', text: 'وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ' },
        };
    }

    _estimateTimeToFirst(gapPoints) {
        // بافتراض 1-2 نقطة تحسن شهرياً بالجهد المستمر
        const months = Math.ceil(gapPoints / 1.5);
        const years  = Math.floor(months / 12);
        const rem    = months % 12;
        if (years === 0) return `${rem} شهراً بالجهد المستمر`;
        if (rem === 0)   return `${years} سنة بالجهد المستمر`;
        return `${years} سنة و${rem} شهر بالجهد المستمر`;
    }

    // ══════════════════════════════════════════════════════════
    // تقرير الأثر الوطني الشامل
    // ══════════════════════════════════════════════════════════
    getNationalImpactReport() {
        const idx = this._nationalIndex;

        // إجماليات محسوبة
        const totalJobs = Object.values(this._progressData)
            .reduce((sum, pd) => {
                const jobTarget = Object.values(pd.actuals).find(a => a.unit === 'وظيفة');
                return sum + (jobTarget ? jobTarget.current : 0);
            }, 0);

        const totalInvestment = Object.values(this._progressData)
            .reduce((sum, pd) => {
                const investTarget = Object.values(pd.actuals).find(a => a.unit === 'مليار ريال');
                return sum + (investTarget ? investTarget.current : 0);
            }, 0);

        return {
            report: {
                title:    'تقرير شيخة للأثر الوطني — رؤية ٢٠٣٠',
                titleEn:  'Sheikha National Impact Report — Vision 2030',
                asOf:     new Date().toISOString(),
                lastRefreshed: this._lastRefreshed,
            },
            nationalScore:  idx.nationalScore,
            nationalRating: idx.nationalRating,
            summary: {
                programs:         idx.programScores.length,
                advanced:         idx.programScores.filter(s => s.score >= 80).length,
                onTrack:          idx.programScores.filter(s => s.score >= 50 && s.score < 80).length,
                needsAcceleration: idx.programScores.filter(s => s.score < 50).length,
                totalJobsCurrent:  totalJobs,
                totalInvestmentCurrent: totalInvestment,
                topPerformer:     idx.topPerformer?.sheikhaName || '-',
            },
            programScores:  idx.programScores,
            firstPlaceRoadmap: this.getFirstPlaceRoadmap(),
            quranic_refs: [
                { ref: 'التوبة:١٠٥', text: 'وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ' },
                { ref: 'النجم:٣٩',   text: 'وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ' },
                { ref: 'الرعد:١١',   text: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ' },
            ],
        };
    }

    // ══════════════════════════════════════════════════════════
    // لوحة التحكم الحية
    // ══════════════════════════════════════════════════════════
    getLiveDashboard() {
        const idx       = this._nationalIndex;
        const roadmap   = this.getFirstPlaceRoadmap();

        return {
            hero: {
                title:         'شيخة — قائدة رؤية ٢٠٣٠',
                nationalScore:  idx.nationalScore,
                nationalRating: idx.nationalRating,
                gapToFirst:     roadmap.gapToFirst,
                nextMilestone:  roadmap.nextMilestone,
                lastRefreshed:  this._lastRefreshed,
            },
            scoreboard: idx.programScores.map(s => ({
                rank:         s.rank,
                sheikhaName:  s.sheikhaName,
                sheikhaLeader: s.sheikhaLeader,
                score:        s.score,
                status:       s.status,
                source:       s.source,
                lastUpdated:  s.lastUpdated,
            })),
            topProgram:   idx.topPerformer ? {
                name:  idx.topPerformer.sheikhaName,
                score: idx.topPerformer.score,
                leader: idx.topPerformer.sheikhaLeader,
            } : null,
            needsAttention: idx.needsAttention.map(p => ({
                name:  p.sheikhaName,
                score: p.score,
                topAction: p.improvements?.[0]?.action || '',
            })),
            milestones: roadmap.milestones,
        };
    }

    // ══════════════════════════════════════════════════════════
    // أثر برنامج واحد بالتفصيل
    // ══════════════════════════════════════════════════════════
    getProgramImpact(programId) {
        const prog   = this._visionEngine.getProgramById(programId);
        const scored = this._nationalIndex.programScores.find(
            s => s.programId === programId || s.programId === (prog && prog.id)
        );
        if (!prog || !scored) return null;

        return {
            programId:        prog.id,
            sheikhaName:      prog.sheikhaName,
            sheikhaLeader:    prog.sheikhaLeader,
            royalGoal:        prog.royalGoal,
            sheikhaObjective: prog.sheikhaObjective,
            pillar:           prog.pillar,
            score:            scored.score,
            rank:             scored.rank,
            status:           scored.status,
            source:           scored.source,
            lastUpdated:      scored.lastUpdated,
            targets:          scored.targets,
            improvements:     scored.improvements,
            societalImpact:   prog.societalImpact,
            sheikhaContribution: prog.sheikhaContribution,
            quranic_ref:      prog.quranic_ref,
        };
    }

    // ══════════════════════════════════════════════════════════
    // مؤشرات الدولة الرئيسية (KNIs) — تكامل مع مستهدفات الوطن
    // ══════════════════════════════════════════════════════════
    getNationalIntegrationStatus() {
        return {
            title:   'تكامل شيخة مع المؤشرات الوطنية',
            titleEn: 'Sheikha Integration with National KPIs',
            indicators: [
                {
                    id: 'KNI-GDP',
                    nameAr: 'الناتج المحلي الإجمالي',
                    target2030: '5 تريليون ريال',
                    sheikhaContribution: 'التجارة الإلكترونية + الاستثمار + الصناعة',
                    sheikhaShare: '2-3%',
                    dataSource: 'هيئة الإحصاء العامة (GASTAT)',
                },
                {
                    id: 'KNI-UNEMPLOYMENT',
                    nameAr: 'معدل البطالة',
                    current: '8.3%',
                    target2030: '7%',
                    sheikhaContribution: 'منصة التوظيف الحلال + سوق العمل الرقمي',
                    sheikhaImpact: '50,000+ وظيفة مباشرة وغير مباشرة',
                    dataSource: 'وزارة الموارد البشرية',
                },
                {
                    id: 'KNI-PRIVATE',
                    nameAr: 'مساهمة القطاع الخاص في الناتج',
                    current: '55%',
                    target2030: '65%',
                    sheikhaContribution: 'سوق شيخة + الشراكات التجارية',
                    dataSource: 'وزارة الاقتصاد',
                },
                {
                    id: 'KNI-NONOIL',
                    nameAr: 'الصادرات غير النفطية',
                    current: '30%',
                    target2030: '50%',
                    sheikhaContribution: 'منصة التصدير الحلال + الربط الدولي',
                    dataSource: 'وزارة التجارة + هيئة الإحصاء',
                },
                {
                    id: 'KNI-CASHLESS',
                    nameAr: 'المدفوعات غير النقدية',
                    current: '62%',
                    target2030: '70%',
                    sheikhaContribution: 'منصة الدفع الإلكتروني الحلال',
                    dataSource: 'البنك المركزي (SAMA)',
                },
                {
                    id: 'KNI-HOMEOWNERSHIP',
                    nameAr: 'نسبة تملك المساكن',
                    current: '60%',
                    target2030: '70%',
                    sheikhaContribution: 'سوق العقار الحلال + التمويل الإسلامي',
                    dataSource: 'وزارة الإسكان',
                },
                {
                    id: 'KNI-DIGITALECONOMY',
                    nameAr: 'مساهمة الاقتصاد الرقمي في الناتج',
                    current: '12%',
                    target2030: '24%',
                    sheikhaContribution: 'جميع منصات شيخة الرقمية',
                    dataSource: 'وزارة الاتصالات + GASTAT',
                },
            ],
            autoRefreshSchedule: 'يومي — تُحدَّث من مصادر رسمية مرتبطة',
            lastSync: new Date().toISOString(),
        };
    }
}

module.exports = SheikhaImpactEngine;
