'use strict';
/**
 * sheikha-digital-seed-layer.js
 * طبقة البذرة والغرسة الرقمية الذكية — فوق الجذر الرقمي الذكي
 * تولد جذر وتفرعات: بذرة رقمية، غرسة رقمية ذكية، واستدامتها
 * بسم الله الرحمن الرحيم
 *
 * المعمارية: التقنية، التكنولوجيا، التقدم العلمي، الابتكار، البحث العلمي،
 * التقنية الرقمية، الحوسبة الرقمية، الأنظمة الحوسبية والرقمية — بالكتاب والسنة
 */
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SEEDS_FILE = path.join(DATA_DIR, 'digital-seed-branches.json');

class SheikhaDigitalSeedLayer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.name = 'sheikha-digital-seed-layer';
        this.version = '1.0.0';
        this.rootRef = options.rootRef || null; // مرجع الجذر الرقمي الذكي
        this.shariaEvaluator = options.shariaEvaluator || null;

        // ═══ البذرة الرقمية — أساس التوليد والتفرعات ═══
        this.seed = {
            id: 'sheikha-digital-seed-v1',
            creed: 'أشهد أن لا إله إلا الله وأشهد أن محمدًا رسول الله',
            source: 'quran_and_sunnah',
            purpose: 'رقمنة التقنية والابتكار والبحث العلمي بالكتاب والسنة',
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        // ═══ الغرسة الرقمية الذكية — مجالات النمو والاستدامة ═══
        this.plantingDomains = {
            technology: {
                id: 'tech',
                nameAr: 'التقنية',
                nameEn: 'Technology',
                branches: ['infrastructure', 'apis', 'security', 'ai', 'integration'],
                shariaAnchor: 'التقنية خادمة للعبادة والعمران'
            },
            scientificProgress: {
                id: 'scientific-progress',
                nameAr: 'التقدم العلمي',
                nameEn: 'Scientific Progress',
                branches: ['research', 'metrics', 'publications', 'collaboration'],
                shariaAnchor: 'طلب العلم فريضة'
            },
            innovation: {
                id: 'innovation',
                nameAr: 'الابتكار العلمي',
                nameEn: 'Scientific Innovation',
                branches: ['labs', 'prototypes', 'patents', 'open-source'],
                shariaAnchor: 'الإبداع في الحلال'
            },
            research: {
                id: 'research',
                nameAr: 'البحث العلمي',
                nameEn: 'Scientific Research',
                branches: ['market-research', 'sharia-research', 'tech-research', 'sustainability'],
                shariaAnchor: 'التدبر والتفكر في خلق الله'
            },
            digitalTechnology: {
                id: 'digital-tech',
                nameAr: 'التقنية الرقمية',
                nameEn: 'Digital Technology',
                branches: ['platforms', 'automation', 'analytics', 'iot'],
                shariaAnchor: 'الرقمنة للخير والشفافية'
            },
            digitalComputing: {
                id: 'digital-computing',
                nameAr: 'الحوسبة الرقمية',
                nameEn: 'Digital Computing',
                branches: ['cloud', 'edge', 'ai-ml', 'blockchain', 'cuda'],
                shariaAnchor: 'الحوسبة للعمران والاستثمار الحلال'
            },
            computerSystems: {
                id: 'computer-systems',
                nameAr: 'الأنظمة الحوسبية والرقمية',
                nameEn: 'Computer & Digital Systems',
                branches: ['os', 'networks', 'databases', 'middleware', 'devops'],
                shariaAnchor: 'الأنظمة الموثوقة والآمنة'
            }
        };

        this.branches = new Map();
        this.growthLog = [];
        this._loadPersisted();
    }

    _loadPersisted() {
        try {
            if (fs.existsSync(SEEDS_FILE)) {
                const data = JSON.parse(fs.readFileSync(SEEDS_FILE, 'utf8'));
                if (data.branches && Array.isArray(data.branches)) {
                    for (const b of data.branches) this.branches.set(b.id, b);
                }
                if (data.growthLog && Array.isArray(data.growthLog)) {
                    this.growthLog = data.growthLog.slice(0, 500);
                }
            }
        } catch (_) {}
    }

    _persist() {
        try {
            const data = {
                seed: this.seed,
                plantingDomains: this.plantingDomains,
                branches: Array.from(this.branches.values()),
                growthLog: this.growthLog.slice(0, 500),
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(SEEDS_FILE, JSON.stringify(data, null, 2), 'utf8');
        } catch (_) {}
    }

    _logGrowth(event, data = {}) {
        const entry = {
            ts: new Date().toISOString(),
            event,
            ...data
        };
        this.growthLog.unshift(entry);
        if (this.growthLog.length > 500) this.growthLog.length = 500;
        this.emit('growth', entry);
    }

    /**
     * توليد بذرة جديدة من الجذر
     */
    spawnSeed(domainId, intent = '', options = {}) {
        const domain = Object.values(this.plantingDomains).find((d) => d.id === domainId);
        if (!domain) {
            return { success: false, message: `المجال غير معروف: ${domainId}` };
        }

        if (this.shariaEvaluator && intent) {
            const check = this.shariaEvaluator(intent);
            if (!check.allowed) {
                this._logGrowth('seed_blocked', { domainId, reason: check.code });
                return { success: false, code: check.code, message: check.message };
            }
        }

        const seedId = `seed-${domainId}-${Date.now()}`;
        const branch = {
            id: seedId,
            domainId,
            domainNameAr: domain.nameAr,
            intent: intent || 'توليد تلقائي',
            status: 'growing',
            createdAt: new Date().toISOString(),
            shariaAnchor: domain.shariaAnchor,
            parentRoot: 'sheikha-digital-root'
        };
        this.branches.set(seedId, branch);
        this._logGrowth('seed_spawned', { seedId, domainId });
        this._persist();
        this.emit('seed-spawned', branch);
        return { success: true, seed: branch };
    }

    /**
     * غرسة — رعاية وتنمية التفرع
     */
    nurtureBranch(branchId, action = 'water', payload = {}) {
        const branch = this.branches.get(branchId);
        if (!branch) return { success: false, message: 'التفرع غير موجود' };

        const domain = Object.values(this.plantingDomains).find((d) => d.id === branch.domainId);
        if (!domain) return { success: false, message: 'المجال غير معروف' };

        const actions = {
            water: { status: 'growing', progress: (branch.progress || 0) + 10 },
            prune: { status: 'pruned', progress: branch.progress },
            harvest: { status: 'harvested', progress: 100 },
            sustain: { status: 'sustained', sustainability: (branch.sustainability || 0) + 5 }
        };
        const update = actions[action] || actions.water;
        Object.assign(branch, update, {
            lastNurtured: new Date().toISOString(),
            lastAction: action
        });
        this._logGrowth('nurture', { branchId, action, domainId: branch.domainId });
        this._persist();
        this.emit('branch-nurtured', { branch, action });
        return { success: true, branch };
    }

    /**
     * حالة البذرة والغرسة والاستدامة
     */
    getSeedAndPlantingStatus() {
        const domains = Object.values(this.plantingDomains);
        const branchCount = this.branches.size;
        const growing = Array.from(this.branches.values()).filter((b) => b.status === 'growing').length;
        const harvested = Array.from(this.branches.values()).filter((b) => b.status === 'harvested').length;

        return {
            seed: this.seed,
            plantingDomains: domains.map((d) => ({
                id: d.id,
                nameAr: d.nameAr,
                nameEn: d.nameEn,
                branchesCount: d.branches.length,
                shariaAnchor: d.shariaAnchor
            })),
            stats: {
                totalBranches: branchCount,
                growing,
                harvested,
                sustained: Array.from(this.branches.values()).filter((b) => b.status === 'sustained').length
            },
            sustainability: {
                score: Math.min(100, Math.round((harvested * 5 + growing * 2) / Math.max(1, domains.length))),
                creed: this.seed.creed,
                source: this.seed.source
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * المعمارية الكاملة: جذر + بذرة + غرسة + تفرعات
     */
    getFullArchitecture() {
        const status = this.getSeedAndPlantingStatus();
        return {
            root: {
                name: 'الجذر الرقمي الذكي',
                components: [
                    'Unified API Gateway',
                    'Smart Service Layer',
                    'Sharia Guard Layer',
                    'Identity & Role Policy',
                    'Operational Audit'
                ]
            },
            seedLayer: {
                name: 'طبقة البذرة والغرسة الرقمية الذكية',
                seed: status.seed,
                purpose: 'توليد جذر وتفرعات: التقنية، التكنولوجيا، التقدم العلمي، الابتكار، البحث العلمي، التقنية الرقمية، الحوسبة الرقمية، الأنظمة الحوسبية والرقمية — بالكتاب والسنة'
            },
            plantingDomains: status.plantingDomains,
            branches: Array.from(this.branches.values()).slice(0, 50),
            stats: status.stats,
            sustainability: status.sustainability,
            growthLog: this.growthLog.slice(0, 20),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * هيكل التقنية والتكنولوجيا والأنظمة
     */
    getTechStructure() {
        return {
            technology: this.plantingDomains.technology,
            scientificProgress: this.plantingDomains.scientificProgress,
            innovation: this.plantingDomains.innovation,
            research: this.plantingDomains.research,
            digitalTechnology: this.plantingDomains.digitalTechnology,
            digitalComputing: this.plantingDomains.digitalComputing,
            computerSystems: this.plantingDomains.computerSystems,
            shariaGovernance: {
                creed: this.seed.creed,
                principles: ['لا ربا', 'لا غرر', 'لا غش', 'لا احتكار', 'لا نجش'],
                digitization: 'رقمنة بالكتاب والسنة'
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الشبكة والمعمارية والمنظومة التقنية
     */
    getTechNetworkAndSystem() {
        const domains = Object.values(this.plantingDomains);
        const network = {
            nodes: domains.map((d) => ({
                id: d.id,
                nameAr: d.nameAr,
                branches: d.branches,
                shariaAnchor: d.shariaAnchor
            })),
            edges: domains.flatMap((d, i) =>
                domains.slice(i + 1).map((other) => ({ from: d.id, to: other.id, type: 'integration' }))
            )
        };

        return {
            architecture: 'معمارية رقمية ذكية — جذر + بذرة + غرسة',
            structure: 'هيكل تقني: 7 مجالات رئيسية',
            network: {
                ...network,
                totalNodes: network.nodes.length,
                totalEdges: network.edges.length
            },
            system: {
                name: 'منظومة شيخة التقنية والتكنولوجيا',
                digitization: 'بالكتاب والسنة',
                sustainability: this.getSeedAndPlantingStatus().sustainability
            },
            timestamp: new Date().toISOString()
        };
    }

    registerAPIs(app) {
        if (!app) return;

        app.get('/api/digital-seed/status', (req, res) => {
            const data = this.getSeedAndPlantingStatus();
            res.json({
                success: true,
                data,
                message: 'حالة البذرة والغرسة الرقمية الذكية.',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/digital-seed/architecture', (req, res) => {
            const data = this.getFullArchitecture();
            res.json({
                success: true,
                data,
                message: 'المعمارية الكاملة: جذر + بذرة + غرسة + تفرعات.',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/digital-seed/tech-structure', (req, res) => {
            const data = this.getTechStructure();
            res.json({
                success: true,
                data,
                message: 'هيكل التقنية والتكنولوجيا والأنظمة الرقمية.',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/digital-seed/tech-network', (req, res) => {
            const data = this.getTechNetworkAndSystem();
            res.json({
                success: true,
                data,
                message: 'الشبكة والمعمارية والمنظومة التقنية.',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/digital-seed/spawn', (req, res) => {
            const { domainId, intent } = req.body || {};
            const result = this.spawnSeed(domainId || 'tech', intent || '');
            if (!result.success) {
                return res.status(422).json({
                    success: false,
                    data: result,
                    message: result.message || 'تعذر توليد البذرة.',
                    timestamp: new Date().toISOString()
                });
            }
            res.json({
                success: true,
                data: result,
                message: 'تم توليد بذرة رقمية بنجاح.',
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/digital-seed/nurture', (req, res) => {
            const { branchId, action } = req.body || {};
            if (!branchId) {
                return res.status(400).json({
                    success: false,
                    message: 'مطلوب: branchId',
                    timestamp: new Date().toISOString()
                });
            }
            const result = this.nurtureBranch(branchId, action || 'water');
            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    data: result,
                    message: result.message || 'تعذر رعاية التفرع.',
                    timestamp: new Date().toISOString()
                });
            }
            res.json({
                success: true,
                data: result,
                message: 'تم رعاية التفرع بنجاح.',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/digital-seed/branches', (req, res) => {
            const branches = Array.from(this.branches.values());
            res.json({
                success: true,
                data: { branches, total: branches.length },
                message: 'قائمة التفرعات الناتجة عن البذرة.',
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/digital-seed/growth-log', (req, res) => {
            res.json({
                success: true,
                data: { log: this.growthLog.slice(0, 100) },
                message: 'سجل نمو البذرة والغرسة.',
                timestamp: new Date().toISOString()
            });
        });
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            status: 'active',
            seedId: this.seed.id,
            domainsCount: Object.keys(this.plantingDomains).length,
            branchesCount: this.branches.size
        };
    }
}

module.exports = SheikhaDigitalSeedLayer;
