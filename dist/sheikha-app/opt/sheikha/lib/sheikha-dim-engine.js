/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  SHEIKHA Digital Itqan Method (DIM) Engine — محرك منهج الإتقان الرقمي
 *
 *  المالك: سلمان أحمد بن سلمان الراجح
 *  المرجعية العليا: الكتاب والسنة
 *
 *  المبدأ الحاكم:
 *    لا تنفيذ بلا قياس — لا قياس بلا توثيق — والقرار للإنسان
 *
 *  المراحل التسع (DIM-9):
 *    1. نية صحيحة / هدف واضح
 *    2. وصف الواقع (بيانات)
 *    3. تحليل منضبط (لا تنبؤ)
 *    4. اقتراح محسوب
 *    5. قرار بشري
 *    6. تنفيذ مقاس
 *    7. قياس قبل/بعد
 *    8. توثيق إلزامي
 *    9. تحسين (Iteration)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

class SheikaDIMEngine {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.dataDir = path.join(baseDir, 'data');

        // ═══ المراحل التسع ═══
        this.DIM_STEPS = [
            { step: 1, id: 'intention',    nameAr: 'نية صحيحة / هدف واضح',     nameEn: 'Clear Intention & Goal',         icon: '🎯' },
            { step: 2, id: 'observe',      nameAr: 'وصف الواقع (بيانات)',       nameEn: 'Observe Reality (Data)',          icon: '📊' },
            { step: 3, id: 'analyze',      nameAr: 'تحليل منضبط (لا تنبؤ)',    nameEn: 'Disciplined Analysis',           icon: '🔬' },
            { step: 4, id: 'propose',      nameAr: 'اقتراح محسوب',             nameEn: 'Calculated Proposal',            icon: '💡' },
            { step: 5, id: 'decide',       nameAr: 'قرار بشري',                nameEn: 'Human Decision',                 icon: '⚖️' },
            { step: 6, id: 'execute',      nameAr: 'تنفيذ مقاس',               nameEn: 'Measured Execution',             icon: '⚙️' },
            { step: 7, id: 'measure',      nameAr: 'قياس قبل/بعد',             nameEn: 'Before/After Measurement',       icon: '📏' },
            { step: 8, id: 'document',     nameAr: 'توثيق إلزامي',             nameEn: 'Mandatory Documentation',        icon: '📝' },
            { step: 9, id: 'improve',      nameAr: 'تحسين (Iteration)',        nameEn: 'Continuous Improvement',         icon: '🔄' }
        ];

        // ═══ بيانات العمل ═══
        this.workItems = [];
        this.decisions = [];
        this.kpis = [];

        // تحميل البيانات المحفوظة
        this._loadState();
    }

    // ═══════════════════════════════════════════════════
    // إنشاء عنصر عمل (Work Item)
    // ═══════════════════════════════════════════════════
    createWorkItem({ title, domain = 'ops', dimStep = 1, priority = 'medium', ownerRole = 'المالك', metrics = [] }) {
        const id = `WI-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(this.workItems.length + 1).padStart(4,'0')}`;
        const stepInfo = this.DIM_STEPS.find(s => s.step === dimStep) || this.DIM_STEPS[0];

        const item = {
            id,
            title,
            domain,
            dim_step: dimStep,
            dim_step_name: stepInfo.nameAr,
            dim_step_icon: stepInfo.icon,
            status: 'open',
            priority,
            owner_role: ownerRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            evidence: [],
            metrics: metrics.length > 0 ? metrics : [
                { name: 'completion', value: 0, unit: '%', target: 100 }
            ],
            decision: {
                required: dimStep >= 5,
                approved_by: null,
                approved_at: null
            }
        };

        this.workItems.push(item);
        this._saveState();
        return item;
    }

    // ═══════════════════════════════════════════════════
    // تحديث عنصر عمل
    // ═══════════════════════════════════════════════════
    updateWorkItem(id, updates) {
        const item = this.workItems.find(w => w.id === id);
        if (!item) return null;

        if (updates.status) item.status = updates.status;
        if (updates.dim_step) {
            item.dim_step = updates.dim_step;
            const stepInfo = this.DIM_STEPS.find(s => s.step === updates.dim_step);
            if (stepInfo) {
                item.dim_step_name = stepInfo.nameAr;
                item.dim_step_icon = stepInfo.icon;
            }
        }
        if (updates.evidence) item.evidence.push(...updates.evidence);
        if (updates.metrics) item.metrics = updates.metrics;
        if (updates.decision) item.decision = { ...item.decision, ...updates.decision };
        item.updated_at = new Date().toISOString();

        this._saveState();
        return item;
    }

    // ═══════════════════════════════════════════════════
    // إنشاء قرار (Decision)
    // ═══════════════════════════════════════════════════
    createDecision({ title, rule, reason, status = 'active', approvedBy = 'المالك' }) {
        const id = `DEC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(this.decisions.length + 1).padStart(4,'0')}`;

        const decision = {
            id,
            title,
            rule,
            reason,
            status,
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        this.decisions.push(decision);
        this._saveState();
        return decision;
    }

    // ═══════════════════════════════════════════════════
    // تسجيل KPI
    // ═══════════════════════════════════════════════════
    recordKPI({ name, target, current, domain = 'ops' }) {
        const id = `KPI-${domain.toUpperCase()}-${name.toUpperCase().replace(/\s+/g,'-')}`;
        const existing = this.kpis.find(k => k.id === id);

        if (existing) {
            existing.current = current;
            existing.updated_at = new Date().toISOString();
            existing.history.push({ value: current, at: new Date().toISOString() });
            if (existing.history.length > 100) existing.history = existing.history.slice(-100);
        } else {
            this.kpis.push({
                id,
                name,
                domain,
                target,
                current,
                status: this._evaluateKPI(current, target),
                updated_at: new Date().toISOString(),
                history: [{ value: current, at: new Date().toISOString() }]
            });
        }

        this._saveState();
        return this.kpis.find(k => k.id === id);
    }

    _evaluateKPI(current, target) {
        if (typeof current === 'number' && typeof target === 'number') {
            const ratio = current / target;
            if (ratio >= 0.95) return 'GREEN';
            if (ratio >= 0.7) return 'YELLOW';
            return 'RED';
        }
        if (current === target) return 'GREEN';
        return 'YELLOW';
    }

    // ═══════════════════════════════════════════════════
    // لوحة تحكم DIM الشاملة
    // ═══════════════════════════════════════════════════
    getDashboard() {
        const openItems = this.workItems.filter(w => w.status === 'open');
        const inProgress = this.workItems.filter(w => w.status === 'in_progress');
        const completed = this.workItems.filter(w => w.status === 'completed');
        const activeDecisions = this.decisions.filter(d => d.status === 'active');

        // حساب المرحلة الحالية
        const currentStepCounts = {};
        openItems.concat(inProgress).forEach(w => {
            currentStepCounts[w.dim_step] = (currentStepCounts[w.dim_step] || 0) + 1;
        });

        const dominantStep = Object.entries(currentStepCounts)
            .sort((a, b) => b[1] - a[1])[0];

        const currentDIMStep = dominantStep
            ? this.DIM_STEPS.find(s => s.step === parseInt(dominantStep[0]))
            : this.DIM_STEPS[0];

        // KPIs summary
        const greenKPIs = this.kpis.filter(k => k.status === 'GREEN').length;
        const totalKPIs = this.kpis.length;

        return {
            bismillah: '☪️ بسم الله الرحمن الرحيم',
            system: 'SHEIKHA Digital Itqan Method — منهج الإتقان الرقمي',
            updated_at: new Date().toISOString(),
            dim: {
                current_step: currentDIMStep.step,
                name: currentDIMStep.nameAr,
                icon: currentDIMStep.icon,
                all_steps: this.DIM_STEPS
            },
            workItems: {
                open: openItems.length,
                in_progress: inProgress.length,
                completed: completed.length,
                total: this.workItems.length,
                recent: this.workItems.slice(-10).reverse()
            },
            decisions: {
                active: activeDecisions.length,
                total: this.decisions.length,
                recent: this.decisions.slice(-5).reverse()
            },
            kpis: {
                green: greenKPIs,
                total: totalKPIs,
                healthPercent: totalKPIs > 0 ? Math.round((greenKPIs / totalKPIs) * 100) : 0,
                all: this.kpis
            },
            methodology: {
                name: 'Digital Itqan Method (DIM)',
                reference: 'الكتاب والسنة — إتقان العمل',
                hadith: '«إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»',
                principles: [
                    'لا تنفيذ بلا قياس',
                    'لا قياس بلا توثيق',
                    'القرار للإنسان — الآلة تساعد فقط',
                    'الصدق في البيانات',
                    'لا ضرر ولا ضرار'
                ],
                sciences_applied: [
                    'Deming Cycle (PDCA) — دورة ديمينغ',
                    'Six Sigma — سداسية سيغما',
                    'Kaizen — التحسين المستمر',
                    'Balanced Scorecard — بطاقة الأداء المتوازن',
                    'ISO 9001 — إدارة الجودة',
                    'Agile/Scrum — التطوير المرن',
                    'Lean Methodology — المنهج الرشيق',
                    'OKR — الأهداف والنتائج الرئيسية'
                ]
            }
        };
    }

    // ═══════════════════════════════════════════════════
    // DIM Pipeline — أين نحن الآن
    // ═══════════════════════════════════════════════════
    getPipeline() {
        return this.DIM_STEPS.map(step => {
            const items = this.workItems.filter(w =>
                w.dim_step === step.step && (w.status === 'open' || w.status === 'in_progress')
            );
            return {
                ...step,
                active_items: items.length,
                items: items.slice(0, 5)
            };
        });
    }

    // ═══════════════════════════════════════════════════
    // تهيئة القرارات الأساسية
    // ═══════════════════════════════════════════════════
    initializeDefaults() {
        if (this.decisions.length === 0) {
            this.createDecision({
                title: 'منع البيع والدفع والعقود — PILOT MODE',
                rule: 'PAYMENTS/SELLING/CONTRACTS: DISABLED',
                reason: 'OPERATIONAL-PILOT / ZERO RISK — لا ضرر ولا ضرار',
                status: 'active'
            });
            this.createDecision({
                title: 'المرجعية الحاكمة: الكتاب والسنة',
                rule: 'SHARIA_REFERENCE: QURAN_AND_SUNNAH',
                reason: 'لا حُكم فوق حكم الله — الشريعة أولاً',
                status: 'active'
            });
            this.createDecision({
                title: 'القرار النهائي للإنسان',
                rule: 'AI_ROLE: ASSIST_ONLY / HUMAN_DECIDES',
                reason: 'الآلة تساعد ولا تقرر — القرار للمالك',
                status: 'active'
            });
        }

        if (this.kpis.length === 0) {
            this.recordKPI({ name: 'System Health', target: 'UP', current: 'UP', domain: 'ops' });
            this.recordKPI({ name: 'Error Rate', target: 0, current: 0, domain: 'ops' });
            this.recordKPI({ name: 'Sharia Compliance', target: 100, current: 100, domain: 'sharia' });
            this.recordKPI({ name: 'SMI Score', target: 100, current: 78, domain: 'maturity' });
            this.recordKPI({ name: 'Pages Active', target: 20, current: 20, domain: 'tech' });
            this.recordKPI({ name: 'Security Score', target: 100, current: 95, domain: 'security' });
        }

        this._saveState();
    }

    // ═══════════════════════════════════════════════════
    // حفظ وتحميل
    // ═══════════════════════════════════════════════════
    _saveState() {
        try {
            if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
            const state = {
                workItems: this.workItems,
                decisions: this.decisions,
                kpis: this.kpis,
                savedAt: new Date().toISOString()
            };
            fs.writeFileSync(path.join(this.dataDir, 'dim-state.json'), JSON.stringify(state, null, 2), 'utf-8');
        } catch (e) { /* صامت */ }
    }

    _loadState() {
        try {
            const filePath = path.join(this.dataDir, 'dim-state.json');
            if (fs.existsSync(filePath)) {
                const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                this.workItems = state.workItems || [];
                this.decisions = state.decisions || [];
                this.kpis = state.kpis || [];
            }
        } catch (e) { /* بداية جديدة */ }
    }
}

module.exports = SheikaDIMEngine;
