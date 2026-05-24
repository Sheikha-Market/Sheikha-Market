/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     lib/ai/self-evolution.js                                ║
 * ║       محرك التجديد الذاتي — يجدّد نفسه ويتحسن ويتطور للأفضل دائمًا         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ" — الرعد ١١
 * "وَفِي كُلِّ شَيْءٍ لَهُ آيَةٌ تَدُلُّ عَلَى أَنَّهُ وَاحِدٌ" — البيهقي
 *
 * مبادئ التطور الذاتي:
 *  ① يتعلّم من كل تفاعل ويحتفظ بالخلاصة
 *  ② يقيس الأداء ويكتشف الضعف تلقائيًا
 *  ③ يقترح تحسينات ويسجّلها في سجل التطور
 *  ④ يطبّق الأولى بالأولى (حسب الأثر)
 *  ⑤ لا يتجاوز صلاحياته — الإنسان يراجع التغيير الجوهري
 *  ⑥ يتجدد دوريًا كالطبيعة — لكن بمنهج قرآني
 */

'use strict';

const EventEmitter = require('events');
const crypto       = require('crypto');

// ─── Evolution Principles ─────────────────────────────────────────────────────

const EVOLUTION_PRINCIPLES = {
    verse:       'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ — الرعد:١١',
    rules: [
        'التحسين دائمًا للأفضل — لا تراجع إلا لاستدراك الخطأ',
        'الإنسان يراجع التغييرات الجوهرية دائمًا',
        'لا تغيير يخالف الكتاب والسنة',
        'كل تغيير يُسجَّل ويُعلَن',
        'الأثر يُقاس قبل التطبيق وبعده',
        'الإتقان في كل مرحلة — إن الله يحب الإتقان',
    ],
};

// ─── Performance Metrics ──────────────────────────────────────────────────────

class PerformanceTracker {
    constructor() {
        this._metrics   = new Map(); // metricName → { values, target, trend }
        this._snapshots = [];
    }

    track(name, value, target = null) {
        if (!this._metrics.has(name)) {
            this._metrics.set(name, { name, values: [], target, trend: 'stable' });
        }
        const m = this._metrics.get(name);
        m.values.push({ value, timestamp: new Date().toISOString() });
        if (m.values.length > 200) m.values.shift();
        m.trend = this._calcTrend(m.values);
        if (target !== null) m.target = target;
        return m;
    }

    _calcTrend(values) {
        if (values.length < 3) return 'stable';
        const recent = values.slice(-5).map(v => v.value);
        const avg    = recent.reduce((s, v) => s + v, 0) / recent.length;
        const first  = recent[0];
        const diff   = ((avg - first) / (Math.abs(first) || 1)) * 100;
        if (diff > 5)  return 'improving';
        if (diff < -5) return 'degrading';
        return 'stable';
    }

    snapshot() {
        const snap = {};
        this._metrics.forEach((m, name) => {
            const last = m.values.at(-1)?.value ?? null;
            snap[name] = { last, trend: m.trend, target: m.target };
        });
        const entry = { snapshot: snap, at: new Date().toISOString() };
        this._snapshots.push(entry);
        if (this._snapshots.length > 100) this._snapshots.shift();
        return entry;
    }

    degradingMetrics() {
        const degrading = [];
        this._metrics.forEach((m, name) => {
            if (m.trend === 'degrading') degrading.push({ name, ...m });
        });
        return degrading;
    }
}

// ─── Improvement Proposal ─────────────────────────────────────────────────────

class ImprovementProposal {
    constructor(data) {
        this.id          = crypto.randomBytes(4).toString('hex');
        this.title       = data.title       || 'تحسين غير مسمّى';
        this.description = data.description || '';
        this.area        = data.area        || 'general'; // performance | accuracy | speed | security | ethics
        this.impact      = data.impact      || 'medium';  // low | medium | high | critical
        this.effort      = data.effort      || 'medium';  // low | medium | high
        this.priority    = this._calcPriority(data.impact, data.effort);
        this.requiresHumanReview = data.requiresHumanReview ?? (data.impact === 'critical');
        this.status      = 'proposed'; // proposed | approved | applying | applied | rejected
        this.proposedAt  = new Date().toISOString();
        this.appliedAt   = null;
        this.result      = null;
    }

    _calcPriority(impact, effort) {
        const impactScore  = { critical: 4, high: 3, medium: 2, low: 1 }[impact] || 2;
        const effortScore  = { low: 3,   medium: 2, high: 1    }[effort]          || 2;
        return impactScore * effortScore;
    }
}

// ─── Learning Memory ──────────────────────────────────────────────────────────

class LearningMemory {
    constructor(maxEntries = 5000) {
        this._maxEntries  = maxEntries;
        this._experiences = [];
        this._patterns    = new Map();
        this._knowledgeBase = new Map();
    }

    record(experience) {
        const entry = {
            id:         crypto.randomBytes(4).toString('hex'),
            ...experience,
            recordedAt: new Date().toISOString(),
        };
        this._experiences.push(entry);
        if (this._experiences.length > this._maxEntries) this._experiences.shift();

        // استخراج نمط تلقائي
        if (experience.type) {
            const pattern = this._patterns.get(experience.type) || { count: 0, lastSeen: null, avgScore: 0 };
            pattern.count++;
            pattern.lastSeen = entry.recordedAt;
            if (experience.score !== undefined) {
                pattern.avgScore = ((pattern.avgScore * (pattern.count - 1)) + experience.score) / pattern.count;
            }
            this._patterns.set(experience.type, pattern);
        }

        return entry;
    }

    learn(key, knowledge) {
        this._knowledgeBase.set(key, {
            knowledge,
            learnedAt: new Date().toISOString(),
            reinforced: 1,
        });
    }

    recall(key) {
        const entry = this._knowledgeBase.get(key);
        if (entry) {
            entry.reinforced++;
            return entry.knowledge;
        }
        return null;
    }

    topPatterns(limit = 10) {
        return Array.from(this._patterns.entries())
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, limit)
            .map(([type, p]) => ({ type, ...p }));
    }

    size() { return this._experiences.length; }
}

// ─── Evolution Cycle ──────────────────────────────────────────────────────────

class EvolutionCycle {
    constructor(options = {}) {
        this.intervalMs    = options.intervalMs    || 3_600_000; // ساعة افتراضيًا
        this.maxIterations = options.maxIterations || Infinity;
        this._iterations   = 0;
        this._timer        = null;
        this._callback     = null;
    }

    start(callback) {
        this._callback = callback;
        this._timer    = setInterval(async () => {
            this._iterations++;
            if (this._iterations > this.maxIterations) {
                this.stop();
                return;
            }
            try {
                await callback({ iteration: this._iterations, triggeredBy: 'scheduled' });
            } catch (err) {
                console.error('[SELF-EVOLUTION] ⚠️  خطأ في دورة التطور:', err.message);
            }
        }, this.intervalMs);
        console.log(`[SELF-EVOLUTION] ⏱  دورة التطور نشطة — كل ${this.intervalMs / 1000}s`);
    }

    stop() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
            console.log('[SELF-EVOLUTION] ⏹  دورة التطور متوقفة');
        }
    }

    iterations() { return this._iterations; }
}

// ─── Self-Evolution Engine ────────────────────────────────────────────────────

class SheikhaeSelfEvolution extends EventEmitter {
    constructor(options = {}) {
        super();

        this.name       = 'Sheikha Self-Evolution Engine';
        this.principles = EVOLUTION_PRINCIPLES;
        this.generation = 1;

        this.performance = new PerformanceTracker();
        this.memory      = new LearningMemory(options.maxMemory || 5000);
        this.cycle       = new EvolutionCycle({
            intervalMs:    options.cycleMs || 3_600_000,
            maxIterations: options.maxIterations || Infinity,
        });

        this._proposals     = [];
        this._appliedCount  = 0;
        this._rejectedCount = 0;
        this._evolutionLog  = [];

        this._humanReviewQueue = []; // يحتاج مراجعة بشرية
    }

    // ─── Learn from Experience ────────────────────────────────────────────

    learn(experience) {
        const entry = this.memory.record(experience);
        this.emit('learned', entry);
        return entry;
    }

    // ─── Performance Feedback ─────────────────────────────────────────────

    feedback(metric, value, target = null) {
        const m = this.performance.track(metric, value, target);
        if (m.trend === 'degrading') {
            this._autoPropose(metric, m);
        }
        return m;
    }

    _autoPropose(metric, metricData) {
        const proposal = new ImprovementProposal({
            title:       `تحسين تلقائي: ${metric}`,
            description: `المقياس "${metric}" يتراجع — الاتجاه: ${metricData.trend}`,
            area:        'performance',
            impact:      'medium',
            effort:      'low',
        });
        this._proposals.push(proposal);
        this.emit('improvement:proposed', proposal);
        console.log(`[SELF-EVOLUTION] 💡 اقتراح تحسين: ${proposal.title}`);
        return proposal;
    }

    // ─── Manual Proposal ──────────────────────────────────────────────────

    propose(data) {
        const proposal = new ImprovementProposal(data);
        this._proposals.push(proposal);
        this.emit('improvement:proposed', proposal);

        if (proposal.requiresHumanReview) {
            this._humanReviewQueue.push(proposal);
            console.log(`[SELF-EVOLUTION] 👤 اقتراح يحتاج مراجعة بشرية: ${proposal.title}`);
        }

        return proposal;
    }

    // ─── Apply Proposal ───────────────────────────────────────────────────

    async applyProposal(proposalId, approvedBy = 'system') {
        const proposal = this._proposals.find(p => p.id === proposalId);
        if (!proposal) return { ok: false, error: 'الاقتراح غير موجود' };

        if (proposal.requiresHumanReview && approvedBy === 'system') {
            return { ok: false, error: 'هذا الاقتراح يتطلب موافقة بشرية صريحة' };
        }

        proposal.status    = 'applying';
        proposal.appliedAt = new Date().toISOString();
        proposal.approvedBy = approvedBy;

        // In production: execute the actual improvement
        proposal.status = 'applied';
        proposal.result = { success: true, note: 'تمّ تطبيق التحسين بنجاح' };
        this._appliedCount++;

        this._logEvolution('PROPOSAL_APPLIED', { proposalId, title: proposal.title, approvedBy });
        this.emit('improvement:applied', proposal);
        console.log(`[SELF-EVOLUTION] ✅ تحسين مطبّق: ${proposal.title}`);
        return { ok: true, proposal };
    }

    // ─── Run Evolution Cycle ─────────────────────────────────────────────

    async runCycle(trigger = 'manual', context = {}) {
        const cycleId    = crypto.randomBytes(4).toString('hex');
        const startMs    = Date.now();
        let   improved   = false;
        let   reason     = '';

        console.log(`[SELF-EVOLUTION] 🔄 دورة تطور #${cycleId} — السبب: ${trigger}`);

        // 1. قياس الأداء الحالي
        const snap = this.performance.snapshot();
        const degrading = this.performance.degradingMetrics();

        // 2. تعلّم من الدورة
        this.memory.record({
            type:    'evolution-cycle',
            trigger,
            context,
            degrading: degrading.length,
            score:   100 - (degrading.length * 10),
        });

        // 3. اقتراح تحسينات تلقائية للمقاييس المتراجعة
        for (const m of degrading) {
            this._autoPropose(m.name, m);
            improved = true;
            reason   = `تراجع في: ${m.name}`;
        }

        // 4. تطبيق الاقتراحات ذات الأولوية العالية والآمنة
        const safeProposals = this._proposals
            .filter(p => p.status === 'proposed' && !p.requiresHumanReview && p.priority >= 4)
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3);

        for (const p of safeProposals) {
            await this.applyProposal(p.id, 'auto-evolution');
            improved = true;
            reason   = reason || p.title;
        }

        // 5. تحديث جيل الذاكرة
        if (improved) {
            this.generation++;
            this._logEvolution('GENERATION_UP', { generation: this.generation, reason, cycleId });
        }

        const durationMs = Date.now() - startMs;
        const result = {
            cycleId,
            trigger,
            improved,
            reason:       reason || 'لا تغييرات مطلوبة',
            generation:   this.generation,
            degrading:    degrading.length,
            applied:      safeProposals.length,
            durationMs,
            humanQueue:   this._humanReviewQueue.length,
        };

        this.emit('cycle:done', result);
        console.log(`[SELF-EVOLUTION] ✅ دورة ${cycleId} اكتملت — ${durationMs}ms | جيل: ${this.generation}`);
        return result;
    }

    // ─── Evolution Log ────────────────────────────────────────────────────

    _logEvolution(event, data) {
        this._evolutionLog.push({
            event,
            data,
            timestamp: new Date().toISOString(),
        });
        if (this._evolutionLog.length > 2000) this._evolutionLog.shift();
    }

    evolutionLog(limit = 20) {
        return this._evolutionLog.slice(-limit);
    }

    // ─── Start Continuous Evolution ───────────────────────────────────────

    startContinuous() {
        this.cycle.start(async ({ iteration }) => {
            this.feedback('cycle_count',     iteration);
            this.feedback('memory_size',     this.memory.size());
            this.feedback('applied_improvements', this._appliedCount);
            await this.runCycle('scheduled', { iteration });
        });
    }

    stopContinuous() {
        this.cycle.stop();
    }

    // ─── Status ───────────────────────────────────────────────────────────

    status() {
        return {
            name:            this.name,
            generation:      this.generation,
            memorySize:      this.memory.size(),
            proposals:       this._proposals.length,
            appliedCount:    this._appliedCount,
            rejectedCount:   this._rejectedCount,
            humanQueue:      this._humanReviewQueue.length,
            topPatterns:     this.memory.topPatterns(5),
            cycleIterations: this.cycle.iterations(),
            performanceSnap: this.performance.snapshot().snapshot,
        };
    }

    // ─── Init ─────────────────────────────────────────────────────────────

    async init() {
        console.log('[SELF-EVOLUTION] 🧬 تشغيل محرك التجديد الذاتي...');
        console.log(`[SELF-EVOLUTION] 📖 ${this.principles.verse}`);

        // مقاييس أولية
        this.feedback('response_quality',    100, 100);
        this.feedback('knowledge_coverage',  75,  100);
        this.feedback('ethics_compliance',   100, 100);
        this.feedback('halal_score',         100, 100);
        this.feedback('system_health',       100, 100);

        // تعلّم أولي
        this.memory.learn('core-mission',   'نفع الإسلام والمسلمين والبشرية');
        this.memory.learn('core-principle', 'لا ضرر ولا ضرار');
        this.memory.learn('core-ethics',    'الكتاب والسنة هما الأساس الحاكم');

        // اقتراح أولي
        this.propose({
            title:               'رفع دقة النماذج اللغوية العربية',
            description:         'تحسين فهم اللهجات والتراكيب الفقهية',
            area:                'accuracy',
            impact:              'high',
            effort:              'high',
            requiresHumanReview: true,
        });

        this._logEvolution('INITIALIZED', { generation: this.generation });
        console.log('[SELF-EVOLUTION] ✅ جاهز — الجيل الأول يعمل');
    }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

const selfEvolution = new SheikhaeSelfEvolution();

module.exports = {
    EVOLUTION_PRINCIPLES,
    PerformanceTracker,
    LearningMemory,
    EvolutionCycle,
    ImprovementProposal,
    SheikhaeSelfEvolution,
    selfEvolution,
    init: () => selfEvolution.init(),
};
