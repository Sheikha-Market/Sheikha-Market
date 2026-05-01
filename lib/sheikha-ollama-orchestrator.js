'use strict';
/**
 * بسم الله الرحمن الرحيم
 * منظومة تشغيل نماذج Ollama
 * - اختيار النماذج حسب الموارد
 * - مزامنة/تحديث تلقائي
 * - سياسة المنفعة بلا ضرر
 */
const os = require('os');
const { execSync } = require('child_process');

class SheikhaOllamaOrchestrator {
    constructor(options = {}) {
        this.ollamaHost = options.ollamaHost || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        this.autoUpdate = String(process.env.OLLAMA_AUTO_UPDATE || 'true') === 'true';
        this.updateIntervalHours = Number(process.env.OLLAMA_UPDATE_INTERVAL_HOURS || 24);
        this.enabled = String(process.env.OLLAMA_ENABLED || 'true') === 'true';
        this.allowPull = String(process.env.OLLAMA_ALLOW_PULL || 'false') === 'true';
        this.defaultProfile = process.env.OLLAMA_PROFILE || 'auto';
        this.bestModelOverride = process.env.OLLAMA_BEST_MODEL || '';
        this.preferLatestInstalled = String(process.env.OLLAMA_PREFER_LATEST_INSTALLED || 'true') === 'true';
        this._timer = null;
    }

    static policy() {
        return {
            principle: 'لا ضرر ولا ضرار',
            quranicReference: [
                '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ ﴾',
                '﴿ وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ ﴾'
            ],
            controls: [
                'منع طلبات الغش والضرر والاختراق غير المصرح',
                'منع أي مخرجات ربوية أو احتيالية أو احتكارية',
                'إرجاع تحذير شرعي عند طلب مخالف'
            ]
        };
    }

    detectResources() {
        const totalRamGb = Math.round((os.totalmem() / (1024 ** 3)) * 10) / 10;
        const freeRamGb = Math.round((os.freemem() / (1024 ** 3)) * 10) / 10;
        let diskFreeGb = null;
        let diskTotalGb = null;
        try {
            const out = execSync("df -Pk / | tail -1 | awk '{print $2\" \"$4}'", { encoding: 'utf8' }).trim();
            const parts = out.split(/\s+/);
            if (parts.length === 2) {
                diskTotalGb = Math.round((Number(parts[0]) / (1024 * 1024)) * 10) / 10;
                diskFreeGb = Math.round((Number(parts[1]) / (1024 * 1024)) * 10) / 10;
            }
        } catch (_) {}

        return {
            cpuCores: os.cpus().length,
            totalRamGb,
            freeRamGb,
            diskTotalGb,
            diskFreeGb
        };
    }

    static modelCatalog() {
        return [
            {
                id: 'llama3.3:70b-instruct-q4_K_M',
                family: 'llama',
                tier: 'very-strong',
                minRamGb: 48,
                diskGb: 42,
                note: 'قوي جداً، غير مناسب لـ 16GB RAM'
            },
            {
                id: 'llama3.1:8b-instruct-q4_K_M',
                aliases: ['llama3.1:8b'],
                family: 'llama',
                tier: 'balanced',
                minRamGb: 8,
                diskGb: 5.2,
                note: 'أفضل توازن للجودة/السرعة على 16GB'
            },
            {
                id: 'qwen2.5:14b-instruct-q4_K_M',
                aliases: ['qwen2.5:14b'],
                family: 'qwen',
                tier: 'strong',
                minRamGb: 14,
                diskGb: 9.0,
                note: 'قوي في العربية والمنطق على 16GB'
            },
            {
                id: 'mistral-nemo:12b',
                aliases: ['mistral-nemo:12b-instruct-2407-q4_K_M', 'mistral-nemo'],
                family: 'mistral',
                tier: 'strong',
                minRamGb: 12,
                diskGb: 7.1,
                note: 'سريع ومتوازن في مهام الإنتاج'
            },
            {
                id: 'phi3:mini',
                aliases: ['phi3:mini-4k-instruct-q4_K_M'],
                family: 'phi',
                tier: 'light',
                minRamGb: 4,
                diskGb: 2.2,
                note: 'خفيف للمهام السريعة والاحتياط'
            }
        ];
    }

    selectProfile(resources) {
        if (this.defaultProfile && this.defaultProfile !== 'auto') return this.defaultProfile;
        if (resources.totalRamGb >= 48) return 'ultra';
        // بعض الأنظمة تُظهر 15.x GB رغم كون الخطة 16GB
        if (resources.totalRamGb >= 15) return 'vps16';
        if (resources.totalRamGb >= 8) return 'vps8';
        return 'lite';
    }

    _parseModelSizeB(modelName) {
        const m = String(modelName || '').toLowerCase().match(/:(\d+(?:\.\d+)?)b\b/);
        return m ? Number(m[1]) : null;
    }

    _profileMaxSize(profile) {
        if (profile === 'ultra') return 120;
        if (profile === 'vps16') return 16;
        if (profile === 'vps8') return 8;
        return 4;
    }

    _familyWeight(modelName) {
        const m = String(modelName || '').toLowerCase();
        if (m.includes('qwen')) return 100;
        if (m.includes('mistral')) return 90;
        if (m.includes('llama')) return 80;
        if (m.includes('phi')) return 70;
        return 50;
    }

    _pickBestInstalledModel(installed, profile) {
        if (!Array.isArray(installed) || installed.length === 0) return null;
        const maxSize = this._profileMaxSize(profile);
        const scored = installed
            .map(name => {
                const size = this._parseModelSizeB(name);
                const sizeScore = size == null ? 0 : (size <= maxSize ? size : -1000);
                const q4Bonus = String(name).includes('q4_') ? 2 : 0;
                return {
                    name,
                    score: this._familyWeight(name) + sizeScore + q4Bonus
                };
            })
            .sort((a, b) => b.score - a.score);

        const best = scored[0];
        if (!best || best.score < 0) return null;
        return best.name;
    }

    recommendedModels(resources = this.detectResources(), installed = []) {
        const profile = this.selectProfile(resources);
        const catalog = SheikhaOllamaOrchestrator.modelCatalog();
        let selected;
        if (profile === 'ultra') {
            selected = catalog.filter(m => ['very-strong', 'strong', 'balanced'].includes(m.tier));
        } else if (profile === 'vps16') {
            selected = catalog.filter(m => ['strong', 'balanced', 'light'].includes(m.tier) && m.minRamGb <= 16);
        } else if (profile === 'vps8') {
            selected = catalog.filter(m => ['balanced', 'light'].includes(m.tier) && m.minRamGb <= 8);
        } else {
            selected = catalog.filter(m => m.tier === 'light');
        }

        let best = profile === 'vps16'
            ? 'qwen2.5:14b-instruct-q4_K_M'
            : (profile === 'ultra' ? 'llama3.3:70b-instruct-q4_K_M' : 'llama3.1:8b-instruct-q4_K_M');

        if (this.bestModelOverride) {
            best = this.bestModelOverride;
        } else if (this.preferLatestInstalled) {
            const detectedBest = this._pickBestInstalledModel(installed, profile);
            if (detectedBest) best = detectedBest;
        }

        return { profile, bestModel: best, models: selected };
    }

    listInstalledModels() {
        try {
            const out = execSync('ollama list', { encoding: 'utf8' });
            const lines = out.split('\n').slice(1).map(s => s.trim()).filter(Boolean);
            return lines.map(line => line.split(/\s{2,}/)[0]).filter(Boolean);
        } catch (_) {
            return [];
        }
    }

    syncModels({ dryRun = true } = {}) {
        const resources = this.detectResources();
        const installed = this.listInstalledModels();
        const plan = this.recommendedModels(resources, installed);

        const toPull = plan.models.filter(m => {
            const names = [m.id].concat(m.aliases || []);
            return !names.some(n => installed.includes(n));
        });
        const actions = [];
        for (const model of toPull) {
            actions.push({ type: 'pull', model: model.id });
            if (!dryRun && this.allowPull) {
                const candidates = [model.id].concat(model.aliases || []);
                let pulled = false;
                let lastError = null;
                for (const candidate of candidates) {
                    try {
                        execSync(`ollama pull ${candidate}`, { stdio: 'inherit' });
                        actions.push({ type: 'pulled', model: model.id, actual: candidate });
                        pulled = true;
                        break;
                    } catch (e) {
                        lastError = e;
                    }
                }
                if (!pulled) {
                    actions.push({
                        type: 'error',
                        model: model.id,
                        message: lastError ? String(lastError.message || lastError) : 'pull failed'
                    });
                }
            }
        }

        return {
            resources,
            profile: plan.profile,
            bestModel: plan.bestModel,
            installed,
            recommended: plan.models.map(m => ({ id: m.id, tier: m.tier, note: m.note })),
            actions,
            dryRun,
            policy: SheikhaOllamaOrchestrator.policy()
        };
    }

    startAutoSync() {
        if (!this.enabled || !this.autoUpdate) return;
        if (this._timer) clearInterval(this._timer);
        const intervalMs = this.updateIntervalHours * 60 * 60 * 1000;
        this._timer = setInterval(() => {
            try {
                this.syncModels({ dryRun: false });
            } catch (_) {}
        }, intervalMs);
    }

    stopAutoSync() {
        if (this._timer) clearInterval(this._timer);
        this._timer = null;
    }
}

module.exports = SheikhaOllamaOrchestrator;

