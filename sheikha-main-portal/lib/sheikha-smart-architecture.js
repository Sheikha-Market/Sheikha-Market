'use strict';
/**
 * sheikha-smart-architecture.js
 * العمود الأول: المعمارية الذكية — شفاء ذاتي + توسع + تركيب + تعلم
 * بسم الله الرحمن الرحيم
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEARNING_FILE = path.join(DATA_DIR, 'smart-learning-patterns.json');

class SheikhaSmartArchitecture extends EventEmitter {
    constructor(options = {}) {
        super();
        this.name = 'sheikha-smart-architecture';
        this.version = '1.0.0';
        this.engines = new Map();
        this.healthLog = [];
        this.scaleState = { active: 0, total: 0, cpu: 0, mem: 0 };
        this.learningData = { patterns: [], optimizations: [], lastAnalysis: null };
        this.checkInterval = options.checkInterval || 10000;
        this.maxHealthLog = 500;
        this._timers = [];
        this._loadLearningData();
    }

    // ═══ 1. Self-Healing — الشفاء الذاتي ═══
    registerEngine(name, instance, opts = {}) {
        this.engines.set(name, {
            instance,
            status: 'active',
            failures: 0,
            maxFailures: opts.maxFailures || 3,
            lastCheck: Date.now(),
            latency: 0,
            restarts: 0
        });
        this.scaleState.total = this.engines.size;
        this._updateActiveCount();
    }

    async healthCheck() {
        const results = [];
        for (const [name, eng] of this.engines) {
            const start = Date.now();
            let healthy = false;
            try {
                if (typeof eng.instance.healthCheck === 'function') {
                    healthy = await eng.instance.healthCheck();
                } else if (typeof eng.instance.getStatus === 'function') {
                    const s = eng.instance.getStatus();
                    healthy = s && s.status !== 'error';
                } else {
                    healthy = !!eng.instance;
                }
            } catch (_) {
                healthy = false;
            }
            eng.latency = Date.now() - start;
            eng.lastCheck = Date.now();

            if (!healthy) {
                eng.failures++;
                eng.status = eng.failures >= eng.maxFailures ? 'dead' : 'degraded';
                this._logHealth(name, 'fail', `فشل #${eng.failures}`);

                if (eng.failures < eng.maxFailures) {
                    this._tryRestart(name, eng);
                } else {
                    this.emit('engine-dead', { name, failures: eng.failures });
                    this._logHealth(name, 'dead', 'المحرك ميت — يحتاج تدخل');
                }
            } else {
                if (eng.status !== 'active') {
                    this._logHealth(name, 'recovered', 'تعافى');
                }
                eng.status = 'active';
                eng.failures = 0;
            }
            results.push({ name, status: eng.status, latency: eng.latency, failures: eng.failures });
        }
        this._updateActiveCount();
        this._updateSystemMetrics();
        return results;
    }

    _tryRestart(name, eng) {
        try {
            if (typeof eng.instance.restart === 'function') {
                eng.instance.restart();
                eng.restarts++;
                this._logHealth(name, 'restart', `إعادة تشغيل #${eng.restarts}`);
                this.emit('engine-restarted', { name, restarts: eng.restarts });
            }
        } catch (_) {
            this._logHealth(name, 'restart-fail', 'فشل إعادة التشغيل');
        }
    }

    _logHealth(engine, type, msg) {
        const entry = { ts: new Date().toISOString(), engine, type, msg };
        this.healthLog.unshift(entry);
        if (this.healthLog.length > this.maxHealthLog) this.healthLog.length = this.maxHealthLog;
    }

    // ═══ 2. Auto-Scale — التوسع الذاتي ═══
    _updateSystemMetrics() {
        const cpus = os.cpus();
        const totalIdle = cpus.reduce((a, c) => a + c.times.idle, 0);
        const totalTick = cpus.reduce((a, c) => a + Object.values(c.times).reduce((s, t) => s + t, 0), 0);

        if (this._prevCpuIdle !== undefined) {
            const idleDiff = totalIdle - this._prevCpuIdle;
            const tickDiff = totalTick - this._prevCpuTick;
            this.scaleState.cpu = tickDiff > 0 ? Math.round((1 - idleDiff / tickDiff) * 100) : 0;
        }
        this._prevCpuIdle = totalIdle;
        this._prevCpuTick = totalTick;

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        this.scaleState.mem = Math.round((1 - freeMem / totalMem) * 100);
        this.scaleState.memTotalGB = +(totalMem / 1073741824).toFixed(1);
        this.scaleState.memFreeGB = +(freeMem / 1073741824).toFixed(1);
        this.scaleState.uptime = Math.round(os.uptime());
        this.scaleState.loadAvg = os.loadavg().map(v => +v.toFixed(2));
    }

    _updateActiveCount() {
        let active = 0;
        for (const eng of this.engines.values()) {
            if (eng.status === 'active') active++;
        }
        this.scaleState.active = active;
        this.scaleState.total = this.engines.size;
    }

    getScaleRecommendation() {
        const { cpu, mem } = this.scaleState;
        if (cpu > 70 || mem > 80) return { action: 'scale-up', reason: `CPU=${cpu}% MEM=${mem}%` };
        if (cpu < 20 && mem < 30) return { action: 'scale-down', reason: `CPU=${cpu}% MEM=${mem}%` };
        return { action: 'stable', reason: `CPU=${cpu}% MEM=${mem}%` };
    }

    // ═══ 3. Composable — التركيب الذاتي ═══
    composeForTask(intent) {
        const PIPELINES = {
            buy_metal:      ['metals-market', 'sharia', 'pricing', 'contracts', 'logistics'],
            sell_metal:     ['metals-market', 'sharia', 'pricing', 'contracts', 'logistics'],
            ask_sharia:     ['sharia', 'quran-sunnah', 'rag', 'taqwa'],
            view_prices:    ['metals-market', 'pricing'],
            register:       ['auth', 'kyc', 'sharia'],
            create_order:   ['metals-market', 'sharia', 'pricing', 'contracts', 'payments'],
            manage_admin:   ['dashboard', 'security', 'legal', 'org'],
            search_market:  ['metals-market', 'search', 'pricing'],
            dispute:        ['contracts', 'legal', 'sharia'],
            zakat:          ['sharia', 'accounting', 'payments']
        };
        const pipeline = PIPELINES[intent] || PIPELINES['search_market'];
        const available = [];
        const missing = [];
        for (const eng of pipeline) {
            if (this.engines.has(eng) && this.engines.get(eng).status === 'active') {
                available.push(eng);
            } else {
                missing.push(eng);
            }
        }
        return { intent, pipeline, available, missing, ready: missing.length === 0 };
    }

    // ═══ 4. Self-Learning — التعلم الذاتي ═══
    recordUsage(intent, engineName, durationMs, success) {
        this.learningData.patterns.push({
            ts: Date.now(),
            intent,
            engine: engineName,
            duration: durationMs,
            success
        });
        if (this.learningData.patterns.length > 5000) {
            this.learningData.patterns = this.learningData.patterns.slice(-3000);
        }
    }

    analyzePatterns() {
        const patterns = this.learningData.patterns;
        if (patterns.length < 10) return { message: 'بيانات غير كافية للتحليل' };

        const byEngine = {};
        for (const p of patterns) {
            if (!byEngine[p.engine]) byEngine[p.engine] = { total: 0, success: 0, totalDuration: 0 };
            byEngine[p.engine].total++;
            if (p.success) byEngine[p.engine].success++;
            byEngine[p.engine].totalDuration += p.duration;
        }

        const analysis = {};
        for (const [eng, data] of Object.entries(byEngine)) {
            analysis[eng] = {
                requests: data.total,
                successRate: Math.round((data.success / data.total) * 100),
                avgLatency: Math.round(data.totalDuration / data.total)
            };
        }

        const byIntent = {};
        for (const p of patterns) {
            if (!byIntent[p.intent]) byIntent[p.intent] = 0;
            byIntent[p.intent]++;
        }

        this.learningData.lastAnalysis = { ts: new Date().toISOString(), byEngine: analysis, byIntent };
        this._saveLearningData();
        return this.learningData.lastAnalysis;
    }

    _loadLearningData() {
        try {
            if (fs.existsSync(LEARNING_FILE)) {
                this.learningData = JSON.parse(fs.readFileSync(LEARNING_FILE, 'utf8'));
            }
        } catch (_) {}
    }

    _saveLearningData() {
        try {
            fs.writeFileSync(LEARNING_FILE, JSON.stringify(this.learningData, null, 2), 'utf8');
        } catch (_) {}
    }

    // ═══ التشغيل الدوري ═══
    start() {
        const t = setInterval(() => this.healthCheck(), this.checkInterval);
        this._timers.push(t);
        const t2 = setInterval(() => this.analyzePatterns(), 3600000);
        this._timers.push(t2);
        this._logHealth('system', 'start', 'المعمارية الذكية — مُفعّلة');
    }

    stop() {
        this._timers.forEach(t => clearInterval(t));
        this._timers = [];
    }

    // ═══ APIs ═══
    registerAPIs(app) {
        if (!app) return;

        app.get('/api/smart/health', (req, res) => {
            const engines = [];
            for (const [name, eng] of this.engines) {
                engines.push({
                    name, status: eng.status, latency: eng.latency,
                    failures: eng.failures, restarts: eng.restarts,
                    lastCheck: new Date(eng.lastCheck).toISOString()
                });
            }
            res.json({ success: true, data: { engines, log: this.healthLog.slice(0, 50) }, timestamp: new Date().toISOString() });
        });

        app.get('/api/smart/scale', (req, res) => {
            const recommendation = this.getScaleRecommendation();
            res.json({ success: true, data: { ...this.scaleState, recommendation }, timestamp: new Date().toISOString() });
        });

        app.post('/api/smart/compose', (req, res) => {
            const intent = (req.body && req.body.intent) || 'search_market';
            const result = this.composeForTask(intent);
            res.json({ success: true, data: result, timestamp: new Date().toISOString() });
        });

        app.get('/api/smart/learning', (req, res) => {
            const analysis = this.learningData.lastAnalysis || this.analyzePatterns();
            res.json({ success: true, data: analysis, timestamp: new Date().toISOString() });
        });

        app.get('/api/smart/dashboard', (req, res) => {
            const engines = [];
            for (const [name, eng] of this.engines) {
                engines.push({ name, status: eng.status, latency: eng.latency });
            }
            res.json({
                success: true,
                data: {
                    scale: this.scaleState,
                    recommendation: this.getScaleRecommendation(),
                    engines,
                    recentLog: this.healthLog.slice(0, 10),
                    learning: this.learningData.lastAnalysis
                },
                timestamp: new Date().toISOString()
            });
        });
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            status: 'active',
            engines: this.engines.size,
            active: this.scaleState.active,
            cpu: this.scaleState.cpu,
            mem: this.scaleState.mem
        };
    }
}

module.exports = SheikhaSmartArchitecture;
