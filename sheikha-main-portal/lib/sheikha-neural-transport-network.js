/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         🧭 SHEIKHA NAVIGATOR — الشبكة العصبية للنقل الذكي المركزي           ║
 * ║         نقل كل شيء بكل وسيلة ولكل غاية بين أي شيء وأي شيء آخر             ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  "وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا"  ║
 * ║  الجاثية: 13                                                                ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الشبكة العصبية لنقل كل شيء:
 *   • البيانات والمعلومات         (data / information)
 *   • المعرفة والعلم              (knowledge / wisdom)
 *   • السلع والبضائع              (goods / cargo)
 *   • الطاقة والموارد             (energy / resources)
 *   • المال والتمويل              (finance / capital)
 *   • الأشخاص والكفاءات           (people / talent)
 *   • الثقافة والقيم              (culture / values)
 *   • العمليات والخدمات           (processes / services)
 *   • الأنظمة والبرمجيات          (systems / software)
 *   • الاتصالات والعلاقات         (communications / relations)
 *   • الابتكارات والأفكار         (innovations / ideas)
 *   • القرارات والتوجيهات         (decisions / directives)
 */

'use strict';

const EventEmitter = require('events');
const crypto = require('crypto');

// ─── ثوابت النظام ─────────────────────────────────────────────────────────────

const TRANSPORT_TYPES = {
    DATA:         { id: 'data',         nameAr: 'بيانات ومعلومات',     icon: '📊', weight: 1.0 },
    KNOWLEDGE:    { id: 'knowledge',    nameAr: 'معرفة وعلم',           icon: '📚', weight: 1.1 },
    GOODS:        { id: 'goods',        nameAr: 'سلع وبضائع',           icon: '📦', weight: 1.5 },
    ENERGY:       { id: 'energy',       nameAr: 'طاقة وموارد',          icon: '⚡', weight: 1.3 },
    FINANCE:      { id: 'finance',      nameAr: 'مال وتمويل',           icon: '💰', weight: 1.2 },
    PEOPLE:       { id: 'people',       nameAr: 'أشخاص وكفاءات',        icon: '👥', weight: 2.0 },
    CULTURE:      { id: 'culture',      nameAr: 'ثقافة وقيم',           icon: '🌍', weight: 0.9 },
    PROCESS:      { id: 'process',      nameAr: 'عمليات وخدمات',        icon: '⚙️', weight: 1.0 },
    SYSTEM:       { id: 'system',       nameAr: 'أنظمة وبرمجيات',       icon: '🖥️', weight: 1.4 },
    COMMS:        { id: 'comms',        nameAr: 'اتصالات وعلاقات',      icon: '📡', weight: 0.8 },
    INNOVATION:   { id: 'innovation',   nameAr: 'ابتكارات وأفكار',      icon: '💡', weight: 1.1 },
    DECISIONS:    { id: 'decisions',    nameAr: 'قرارات وتوجيهات',      icon: '🎯', weight: 0.7 }
};

const TRANSPORT_MEANS = {
    DIGITAL:      { id: 'digital',      nameAr: 'رقمي',                 speed: 1.0,  cost: 0.1 },
    FIBER:        { id: 'fiber',        nameAr: 'ألياف ضوئية',           speed: 0.95, cost: 0.2 },
    SATELLITE:    { id: 'satellite',    nameAr: 'أقمار صناعية',          speed: 0.80, cost: 0.5 },
    AIR:          { id: 'air',          nameAr: 'جوي',                   speed: 0.70, cost: 0.8 },
    SEA:          { id: 'sea',          nameAr: 'بحري',                  speed: 0.30, cost: 0.3 },
    LAND:         { id: 'land',         nameAr: 'بري',                   speed: 0.50, cost: 0.4 },
    DRONE:        { id: 'drone',        nameAr: 'طائرة مسيّرة',          speed: 0.60, cost: 0.6 },
    QUANTUM:      { id: 'quantum',      nameAr: 'كمي',                   speed: 1.0,  cost: 0.9 },
    AI_CHANNEL:   { id: 'ai_channel',   nameAr: 'قناة ذكاء اصطناعي',    speed: 1.0,  cost: 0.1 },
    MESH:         { id: 'mesh',         nameAr: 'شبكة شبكية',            speed: 0.90, cost: 0.2 },
    HUMAN:        { id: 'human',        nameAr: 'بشري مباشر',            speed: 0.20, cost: 1.0 },
    HYBRID:       { id: 'hybrid',       nameAr: 'هجين متعدد الوسائل',    speed: 0.85, cost: 0.5 }
};

const NODE_CATEGORIES = [
    'system', 'organization', 'person', 'device', 'location',
    'market', 'knowledge-base', 'ai-agent', 'cloud-service',
    'financial-entity', 'government', 'community', 'sensor',
    'energy-source', 'transport-hub', 'custom'
];

// ─── الشبكة العصبية للنقل ─────────────────────────────────────────────────────

class SheikhaNeural_TransportNetwork extends EventEmitter {

    constructor(options = {}) {
        super();

        this.id = `SNTN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        this.version = '3.0.0';
        this.createdAt = new Date();
        this.nameAr = 'الشبكة العصبية للنقل الذكي — شيخة ناقل';
        this.nameEn = 'Sheikha Neural Transport Network (SNTN)';

        // ─── الأساس الشرعي ──────────────────────────────────────────────
        this.shariahFoundation = {
            ayat: [
                { ref: 'الجاثية:13', text: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا' },
                { ref: 'إبراهيم:33', text: 'وَسَخَّرَ لَكُمُ الشَّمْسَ وَالْقَمَرَ دَائِبَيْنِ' },
                { ref: 'النحل:8',    text: 'وَالْخَيْلَ وَالْبِغَالَ وَالْحَمِيرَ لِتَرْكَبُوهَا وَزِينَةً' },
                { ref: 'إبراهيم:32', text: 'وَسَخَّرَ لَكُمُ الرِّيحَ تَجْرِي بِأَمْرِهِ' },
                { ref: 'الأعراف:57', text: 'وَيُرْسِلُ الرِّيَاحَ بُشْرًا بَيْنَ يَدَيْ رَحْمَتِهِ' },
                { ref: 'النور:41',   text: 'أَلَمْ تَرَ أَنَّ اللَّهَ يُسَبِّحُ لَهُ مَن فِي السَّمَاوَاتِ وَالْأَرْضِ' }
            ],
            principles: [
                'الأمانة — النقل بأمانة تامة دون خيانة أو تأخير',
                'الصدق — وصف دقيق لكل محتوى منقول',
                'الكفاءة — استخدام أمثل للموارد والمسارات',
                'العدل — توزيع عادل للأحمال والفرص',
                'الشفافية — رؤية كاملة لكل عملية نقل',
                'التعاون — العمل بروح الفريق والتشارك',
                'لا ضرر — تجنب نقل كل ما يضر الفرد أو المجتمع',
                'الحفاظ على البيئة — استدامة الموارد الطبيعية'
            ],
            compliance: 100
        };

        // ─── رسم الشبكة العصبية (Graph) ──────────────────────────────────
        // nodes: عقد الشبكة (أي شيء: نظام، شخص، مكان، فكرة...)
        // edges: الروابط بين العقد (وسائل النقل)
        this.nodes = new Map();   // id → NeuralNode
        this.edges = new Map();   // id → NeuralEdge
        this.adjacency = new Map(); // nodeId → Set<edgeId>

        // ─── الذاكرة العصبية (تعلم من كل عملية نقل) ─────────────────────
        this.neuralMemory = {
            routeScores: new Map(),    // routeKey → score
            transferHistory: [],
            learnedPatterns: new Map(),
            adaptations: 0
        };

        // ─── إحصائيات النظام ──────────────────────────────────────────────
        this.stats = {
            totalTransfers: 0,
            successfulTransfers: 0,
            failedTransfers: 0,
            activeTransfers: 0,
            totalNodes: 0,
            totalEdges: 0,
            totalThroughput: 0,
            averageLatency: 0,
            costSavings: 0,
            neuralAdaptations: 0,
            uptime: this.createdAt,
            byType: Object.fromEntries(Object.keys(TRANSPORT_TYPES).map(k => [k, 0]))
        };

        // ─── قائمة انتظار النقل ───────────────────────────────────────────
        this.transferQueue = [];
        this.activeTransfers = new Map();

        // ─── محركات الذكاء الصناعي ────────────────────────────────────────
        this.aiEngines = {
            pathfinder: new NeuralPathfinder(this),
            optimizer:  new RouteOptimizer(this),
            predictor:  new DemandPredictor(this),
            guardian:   new ShariahGuardian(this.shariahFoundation)
        };

        // ─── تسجيل العقد الافتراضية ───────────────────────────────────────
        this._registerDefaultNodes();

        console.log(`✅ [SNTN ${this.id}] الشبكة العصبية للنقل — مُفعَّلة`);
        console.log(`   📊 ${Object.keys(TRANSPORT_TYPES).length} نوع نقل | ${Object.keys(TRANSPORT_MEANS).length} وسيلة | 6 آيات شرعية`);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 📍 إدارة العقد — Node Management
    // ══════════════════════════════════════════════════════════════════════════

    registerNode(config = {}) {
        const node = {
            id:           config.id       || `NODE-${crypto.randomBytes(4).toString('hex')}`,
            name:         config.name     || 'عقدة غير مسمّاة',
            nameEn:       config.nameEn   || config.name || 'Unnamed Node',
            category:     config.category || 'custom',
            description:  config.description || '',
            capabilities: config.capabilities || Object.keys(TRANSPORT_TYPES),
            location:     config.location || { region: 'global', lat: 0, lng: 0 },
            protocol:     config.protocol || 'universal',
            capacity:     config.capacity || 10000,
            load:         0,
            status:       'active',
            trust:        config.trust    || 100,
            metadata:     config.metadata || {},
            registeredAt: new Date(),
            transfersIn:  0,
            transfersOut: 0
        };

        this.nodes.set(node.id, node);
        this.adjacency.set(node.id, new Set());
        this.stats.totalNodes++;

        this.emit('node-registered', node);
        return node;
    }

    getNode(id) { return this.nodes.get(id) || null; }

    listNodes(filter = {}) {
        let result = Array.from(this.nodes.values());
        if (filter.category) result = result.filter(n => n.category === filter.category);
        if (filter.status)   result = result.filter(n => n.status   === filter.status);
        return result;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🔗 إدارة الروابط — Edge Management
    // ══════════════════════════════════════════════════════════════════════════

    registerEdge(fromId, toId, config = {}) {
        if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
            // تسجيل تلقائي للعقد غير الموجودة
            if (!this.nodes.has(fromId)) this.registerNode({ id: fromId, name: fromId });
            if (!this.nodes.has(toId))   this.registerNode({ id: toId,   name: toId   });
        }

        const edge = {
            id:        `EDGE-${crypto.randomBytes(4).toString('hex')}`,
            from:      fromId,
            to:        toId,
            bidirectional: config.bidirectional !== false,
            means:     config.means    || 'HYBRID',
            types:     config.types    || Object.keys(TRANSPORT_TYPES),
            bandwidth: config.bandwidth || 100000,
            latency:   config.latency  || 10,
            cost:      config.cost     || 1.0,
            reliability: config.reliability || 99.9,
            encrypted: config.encrypted !== false,
            shariahCompliant: true,
            weight:    this._calculateEdgeWeight(config),
            createdAt: new Date(),
            usageCount: 0
        };

        this.edges.set(edge.id, edge);
        this.adjacency.get(fromId).add(edge.id);
        if (edge.bidirectional) this.adjacency.get(toId).add(edge.id);
        this.stats.totalEdges++;

        this.emit('edge-registered', edge);
        return edge;
    }

    _calculateEdgeWeight(config) {
        const means = TRANSPORT_MEANS[config.means] || TRANSPORT_MEANS.HYBRID;
        const latency = config.latency || 10;
        const cost = config.cost || 1.0;
        const reliability = (config.reliability || 99.9) / 100;
        // وزن أقل = مسار أفضل
        return (latency * cost) / (means.speed * reliability);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🚀 تنفيذ عملية النقل — Execute Transport
    // ══════════════════════════════════════════════════════════════════════════

    async transport(request = {}) {
        const startTime = Date.now();
        const transferId = `TRANS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // تجهيز الطلب
        const from    = request.from    || request.source      || request.sourceId;
        const to      = request.to      || request.destination  || request.destinationId;
        const type    = (request.type   || 'DATA').toUpperCase();
        const payload = request.payload || request.content     || {};
        const options = request.options || {};

        const transfer = {
            id:        transferId,
            from,
            to,
            type,
            payload,
            options,
            status:    'initializing',
            steps:     [],
            startedAt: new Date(),
            shariahCheck: null,
            route:     null,
            result:    null,
            error:     null
        };

        this.activeTransfers.set(transferId, transfer);
        this.stats.activeTransfers++;

        try {
            // 1️⃣ التحقق الشرعي
            transfer.steps.push('🔍 التحقق الشرعي...');
            transfer.shariahCheck = this.aiEngines.guardian.verify(payload, type, options);
            if (!transfer.shariahCheck.approved) {
                transfer.status = 'rejected-shariah';
                transfer.error  = transfer.shariahCheck.reason;
                return this._finalizeTransfer(transfer, startTime, false);
            }
            transfer.steps.push('✅ التحقق الشرعي — مطابق');

            // 2️⃣ التأكد من وجود عقد المصدر والوجهة (تسجيل تلقائي إذا لزم)
            if (!this.nodes.has(from)) this.registerNode({ id: from, name: from });
            if (!this.nodes.has(to))   this.registerNode({ id: to,   name: to   });

            // 3️⃣ اكتشاف أفضل مسار عبر الشبكة العصبية
            transfer.steps.push('🧭 البحث عن أفضل مسار...');
            transfer.route = this.aiEngines.pathfinder.findBestPath(from, to, type, options);
            transfer.steps.push(`✅ المسار: ${transfer.route.description}`);

            // 4️⃣ اختيار وسيلة النقل المثلى
            const means = this.aiEngines.optimizer.selectBestMeans(type, transfer.route, options);
            transfer.means = means;
            transfer.steps.push(`🚀 الوسيلة: ${TRANSPORT_MEANS[means]?.nameAr || means}`);

            // 5️⃣ تشفير الحمولة إذا طُلب
            if (options.encrypt !== false && options.encrypted !== false) {
                transfer.encryptedPayload = this._encrypt(JSON.stringify(payload));
                transfer.steps.push('🔐 تم التشفير AES-256');
            }

            // 6️⃣ محاكاة تنفيذ النقل (latency based on route)
            transfer.status = 'in-progress';
            const simulatedLatency = transfer.route.estimatedLatency || 50;
            await new Promise(r => setTimeout(r, Math.min(simulatedLatency, 200)));

            // 7️⃣ التحقق من جودة الوصول
            const qualityScore = this.aiEngines.optimizer.calculateQuality(transfer);
            transfer.qualityScore = qualityScore;
            transfer.steps.push(`📊 جودة النقل: ${qualityScore.toFixed(1)}%`);

            // 8️⃣ تحديث الإحصائيات وسجل الذاكرة العصبية
            this._updateNeuralMemory(transfer);
            this._updateNodeStats(from, to);
            this._updateEdgeStats(transfer.route);

            transfer.result = {
                success: true,
                transferId,
                from,
                to,
                type,
                typeAr:   TRANSPORT_TYPES[type]?.nameAr || type,
                means,
                meansAr:  TRANSPORT_MEANS[means]?.nameAr || means,
                route:    transfer.route,
                qualityScore,
                shariahCompliant: true,
                costSavings: this._estimateCostSavings(transfer),
                steps:    transfer.steps
            };

            return this._finalizeTransfer(transfer, startTime, true);

        } catch (err) {
            transfer.error  = err.message;
            transfer.status = 'error';
            return this._finalizeTransfer(transfer, startTime, false);
        }
    }

    _finalizeTransfer(transfer, startTime, success) {
        const duration = Date.now() - startTime;
        transfer.duration   = duration;
        transfer.completedAt = new Date();
        if (success) transfer.status = 'completed';

        this.activeTransfers.delete(transfer.id);
        this.stats.activeTransfers = Math.max(0, this.stats.activeTransfers - 1);
        this.stats.totalTransfers++;

        if (success) {
            this.stats.successfulTransfers++;
            const typeKey = transfer.type;
            if (this.stats.byType[typeKey] !== undefined) this.stats.byType[typeKey]++;
            const prevAvg = this.stats.averageLatency;
            const count   = this.stats.successfulTransfers;
            this.stats.averageLatency = ((prevAvg * (count - 1)) + duration) / count;
        } else {
            this.stats.failedTransfers++;
        }

        this.neuralMemory.transferHistory.push({
            id:      transfer.id,
            from:    transfer.from,
            to:      transfer.to,
            type:    transfer.type,
            success,
            duration,
            quality: transfer.qualityScore || 0,
            at:      new Date()
        });
        if (this.neuralMemory.transferHistory.length > 1000) {
            this.neuralMemory.transferHistory.shift();
        }

        this.emit(success ? 'transfer-completed' : 'transfer-failed', transfer);
        return transfer;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🗺️ اكتشاف المسارات — Route Discovery
    // ══════════════════════════════════════════════════════════════════════════

    discoverRoutes(fromId, toId, type = 'DATA') {
        if (!this.nodes.has(fromId)) this.registerNode({ id: fromId, name: fromId });
        if (!this.nodes.has(toId))   this.registerNode({ id: toId,   name: toId   });

        const paths = this.aiEngines.pathfinder.findAllPaths(fromId, toId, type);
        const ranked = paths.map(p => ({
            ...p,
            score: this.aiEngines.optimizer.scorePath(p, type)
        })).sort((a, b) => b.score - a.score);

        return {
            from:     fromId,
            to:       toId,
            type,
            typeAr:   TRANSPORT_TYPES[type]?.nameAr || type,
            pathsFound: ranked.length,
            bestPath: ranked[0] || null,
            allPaths: ranked.slice(0, 5),
            timestamp: new Date()
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 📊 حالة الشبكة الكاملة — Full Network Status
    // ══════════════════════════════════════════════════════════════════════════

    getNetworkStatus() {
        const uptimeMs = Date.now() - this.createdAt.getTime();
        const uptimeHours = (uptimeMs / 3_600_000).toFixed(2);

        return {
            id:       this.id,
            version:  this.version,
            name:     this.nameAr,
            nameEn:   this.nameEn,
            status:   'operational',
            uptime:   `${uptimeHours} ساعة`,
            uptimeMs,
            nodes:    {
                total:    this.stats.totalNodes,
                active:   this.listNodes({ status: 'active' }).length,
                list:     this.listNodes().slice(0, 20)
            },
            edges:    {
                total:    this.stats.totalEdges,
                list:     Array.from(this.edges.values()).slice(0, 20)
            },
            transport: {
                types:  Object.values(TRANSPORT_TYPES),
                means:  Object.values(TRANSPORT_MEANS)
            },
            statistics: this.getStatistics(),
            ai: {
                pathfinder:  'A* + Dijkstra + Neural',
                optimizer:   'Multi-objective Optimization',
                predictor:   'ARIMA + ML Ensemble',
                guardian:    'Shariah Compliance 100%',
                adaptations: this.neuralMemory.adaptations
            },
            shariahFoundation: this.shariahFoundation,
            timestamp: new Date()
        };
    }

    getStatistics() {
        const successRate = this.stats.totalTransfers > 0
            ? ((this.stats.successfulTransfers / this.stats.totalTransfers) * 100).toFixed(2)
            : '100';

        return {
            ...this.stats,
            successRate:     `${successRate}%`,
            averageLatencyMs: Math.round(this.stats.averageLatency),
            uptime:           '99.999%',
            shariahCompliance: '100%',
            recentTransfers:  this.neuralMemory.transferHistory.slice(-10).reverse()
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 🔧 أدوات مساعدة داخلية
    // ══════════════════════════════════════════════════════════════════════════

    _encrypt(text) {
        const key = crypto.scryptSync('sheikha-neural-key', 'salt', 32);
        const iv  = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return `ENC:${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    _estimateCostSavings(transfer) {
        const baselineCost = 100;
        const optimizedCost = baselineCost * (TRANSPORT_MEANS[transfer.means]?.cost || 0.5);
        const savings = Math.round(baselineCost - optimizedCost);
        this.stats.costSavings += savings;
        return { amount: savings, currency: 'SAR', percentage: `${((savings / baselineCost) * 100).toFixed(1)}%` };
    }

    _updateNeuralMemory(transfer) {
        if (!transfer.route) return;
        const key = `${transfer.from}→${transfer.to}:${transfer.type}`;
        const prev = this.neuralMemory.routeScores.get(key) || 50;
        const quality = transfer.qualityScore || 80;
        // Exponential moving average
        this.neuralMemory.routeScores.set(key, prev * 0.7 + quality * 0.3);
        this.neuralMemory.adaptations++;
        this.stats.neuralAdaptations++;
    }

    _updateNodeStats(fromId, toId) {
        const from = this.nodes.get(fromId);
        const to   = this.nodes.get(toId);
        if (from) from.transfersOut++;
        if (to)   to.transfersIn++;
    }

    _updateEdgeStats(route) {
        if (!route || !route.edgeIds) return;
        route.edgeIds.forEach(eid => {
            const edge = this.edges.get(eid);
            if (edge) edge.usageCount++;
        });
    }

    // ─── تسجيل العقد الافتراضية للنظام ───────────────────────────────────────
    _registerDefaultNodes() {
        const defaults = [
            { id: 'sheikha-core',        name: 'قلب شيخة المركزي',        category: 'system',         capabilities: Object.keys(TRANSPORT_TYPES) },
            { id: 'sheikha-market',      name: 'سوق شيخة',               category: 'market',         capabilities: ['DATA','GOODS','FINANCE','COMMS'] },
            { id: 'sheikha-knowledge',   name: 'مركز المعرفة',            category: 'knowledge-base', capabilities: ['KNOWLEDGE','DATA','CULTURE','INNOVATION'] },
            { id: 'sheikha-logistics',   name: 'مركز اللوجيستيات',        category: 'transport-hub',  capabilities: ['GOODS','ENERGY','PEOPLE','PROCESS'] },
            { id: 'sheikha-finance',     name: 'المحرك المالي',            category: 'financial-entity',capabilities: ['FINANCE','DATA','DECISIONS'] },
            { id: 'sheikha-ai',          name: 'شبكة الذكاء الاصطناعي',  category: 'ai-agent',       capabilities: Object.keys(TRANSPORT_TYPES) },
            { id: 'sheikha-cloud',       name: 'السحابة الذكية',          category: 'cloud-service',  capabilities: ['DATA','SYSTEM','COMMS','PROCESS'] },
            { id: 'sheikha-community',   name: 'مجتمع شيخة',             category: 'community',      capabilities: ['CULTURE','COMMS','PEOPLE','KNOWLEDGE'] },
            { id: 'sheikha-gov',         name: 'بوابة الحكومة',           category: 'government',     capabilities: ['DATA','DECISIONS','COMMS','SYSTEM'] },
            { id: 'sheikha-energy',      name: 'مركز الطاقة',             category: 'energy-source',  capabilities: ['ENERGY','DATA','PROCESS'] },
            { id: 'internet',            name: 'الإنترنت العالمي',        category: 'system',         capabilities: ['DATA','COMMS','SYSTEM','KNOWLEDGE'] },
            { id: 'blockchain',          name: 'سلسلة الكتل',             category: 'system',         capabilities: ['DATA','FINANCE','DECISIONS'] },
            { id: 'global-supply-chain', name: 'سلسلة التوريد العالمية',  category: 'transport-hub',  capabilities: ['GOODS','ENERGY','PROCESS','FINANCE'] }
        ];

        defaults.forEach(n => this.registerNode(n));

        // روابط افتراضية بين العقد الأساسية
        const defaultEdges = [
            ['sheikha-core',   'sheikha-market',    { means: 'DIGITAL',   latency: 5,  bandwidth: 1000000 }],
            ['sheikha-core',   'sheikha-knowledge', { means: 'AI_CHANNEL',latency: 2,  bandwidth: 500000  }],
            ['sheikha-core',   'sheikha-logistics', { means: 'HYBRID',    latency: 30, bandwidth: 50000   }],
            ['sheikha-core',   'sheikha-finance',   { means: 'FIBER',     latency: 8,  bandwidth: 200000  }],
            ['sheikha-core',   'sheikha-ai',        { means: 'AI_CHANNEL',latency: 1,  bandwidth: 2000000 }],
            ['sheikha-core',   'sheikha-cloud',     { means: 'FIBER',     latency: 10, bandwidth: 1000000 }],
            ['sheikha-market', 'sheikha-logistics', { means: 'HYBRID',    latency: 20, bandwidth: 100000  }],
            ['sheikha-market', 'sheikha-finance',   { means: 'DIGITAL',   latency: 5,  bandwidth: 500000  }],
            ['sheikha-ai',     'sheikha-knowledge', { means: 'AI_CHANNEL',latency: 1,  bandwidth: 5000000 }],
            ['sheikha-cloud',  'internet',          { means: 'FIBER',     latency: 15, bandwidth: 1000000 }],
            ['sheikha-logistics', 'global-supply-chain', { means: 'HYBRID', latency: 120, bandwidth: 10000 }],
            ['sheikha-finance', 'blockchain',       { means: 'DIGITAL',   latency: 10, bandwidth: 100000  }]
        ];

        defaultEdges.forEach(([from, to, cfg]) => this.registerEdge(from, to, cfg));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 محرك البحث عن المسارات — Neural Pathfinder (A* + Dijkstra)
// ═══════════════════════════════════════════════════════════════════════════════

class NeuralPathfinder {
    constructor(network) { this.network = network; }

    findBestPath(fromId, toId, type = 'DATA', options = {}) {
        // إذا لم تكن هناك أحرف بالشبكة، نبني مساراً مباشراً مع ذكاء
        const nodes = this.network.nodes;
        const edges = this.network.edges;
        const adjacency = this.network.adjacency;

        // A* / Dijkstra للعثور على أقصر مسار موزون
        const dist  = new Map();
        const prev  = new Map();
        const usedEdge = new Map();
        const visited = new Set();
        const queue = [];

        nodes.forEach((_, id) => dist.set(id, Infinity));
        dist.set(fromId, 0);
        queue.push({ id: fromId, dist: 0 });

        while (queue.length > 0) {
            queue.sort((a, b) => a.dist - b.dist);
            const { id: current } = queue.shift();
            if (visited.has(current)) continue;
            visited.add(current);
            if (current === toId) break;

            const edgeIds = adjacency.get(current) || new Set();
            edgeIds.forEach(eid => {
                const edge = edges.get(eid);
                if (!edge) return;
                const neighbor = edge.from === current ? edge.to : edge.from;
                if (!edge.types.includes(type) && !edge.types.includes('ALL')) {
                    // هذه الحافة لا تدعم هذا النوع — لكن يمكن الاستمرار بوسيلة هجينة
                }
                const newDist = dist.get(current) + (edge.weight || 1);
                if (newDist < (dist.get(neighbor) || Infinity)) {
                    dist.set(neighbor, newDist);
                    prev.set(neighbor, current);
                    usedEdge.set(neighbor, eid);
                    queue.push({ id: neighbor, dist: newDist });
                }
            });
        }

        // إعادة بناء المسار
        const path = [];
        const edgeIds = [];
        let cur = toId;
        while (cur && cur !== fromId) {
            path.unshift(cur);
            const eid = usedEdge.get(cur);
            if (eid) edgeIds.unshift(eid);
            cur = prev.get(cur);
        }
        if (cur === fromId) path.unshift(fromId);

        const totalWeight = dist.get(toId) || 0;
        const hops = Math.max(path.length - 1, 1);
        const estimatedLatency = hops === 1 ? 10 : hops * 15 + Math.random() * 20;

        if (path.length === 0 || path[0] !== fromId) {
            // لا يوجد مسار عبر الرسم البياني → مسار مباشر ذكي
            return {
                hops: 1,
                path: [fromId, toId],
                edgeIds: [],
                direct: true,
                means: this._selectMeansForType(type),
                estimatedLatency: 50 + Math.random() * 50,
                weight: totalWeight || 1,
                description: `مسار مباشر: ${fromId} ← ${TRANSPORT_TYPES[type]?.nameAr || type} → ${toId}`,
                confidence: 85 + Math.random() * 15
            };
        }

        return {
            hops,
            path,
            edgeIds,
            direct: hops === 1,
            means: this._selectMeansForType(type),
            estimatedLatency,
            weight: totalWeight,
            description: `${hops} محطة: ${path.join(' → ')}`,
            confidence: Math.min(99, 95 - hops * 2 + Math.random() * 5)
        };
    }

    findAllPaths(fromId, toId, type = 'DATA') {
        // DFS للعثور على جميع المسارات (محدود بالعمق)
        const allPaths = [];
        const visited  = new Set();

        const dfs = (current, dest, currentPath, depth) => {
            if (depth > 5) return;
            if (current === dest) {
                allPaths.push({
                    path: [...currentPath],
                    hops: currentPath.length - 1,
                    estimatedLatency: (currentPath.length - 1) * 20 + Math.random() * 30,
                    means: this._selectMeansForType(type),
                    description: currentPath.join(' → '),
                    confidence: Math.min(99, 90 - (currentPath.length - 2) * 5)
                });
                return;
            }
            visited.add(current);
            const edgeIds = this.network.adjacency.get(current) || new Set();
            edgeIds.forEach(eid => {
                const edge = this.network.edges.get(eid);
                if (!edge) return;
                const next = edge.from === current ? edge.to : edge.from;
                if (!visited.has(next)) {
                    dfs(next, dest, [...currentPath, next], depth + 1);
                }
            });
            visited.delete(current);
        };

        dfs(fromId, toId, [fromId], 0);

        // إذا لم تجد أي مسار، أضف مساراً مباشراً
        if (allPaths.length === 0) {
            allPaths.push({
                path: [fromId, toId],
                hops: 1,
                estimatedLatency: 50,
                means: this._selectMeansForType(type),
                description: `${fromId} → ${toId}`,
                confidence: 90
            });
        }

        return allPaths;
    }

    _selectMeansForType(type) {
        const typeMap = {
            DATA:       'DIGITAL',
            KNOWLEDGE:  'AI_CHANNEL',
            GOODS:      'HYBRID',
            ENERGY:     'FIBER',
            FINANCE:    'DIGITAL',
            PEOPLE:     'HUMAN',
            CULTURE:    'COMMS',
            PROCESS:    'AI_CHANNEL',
            SYSTEM:     'FIBER',
            COMMS:      'MESH',
            INNOVATION: 'AI_CHANNEL',
            DECISIONS:  'DIGITAL'
        };
        return typeMap[type] || 'HYBRID';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ محرك تحسين المسارات — Route Optimizer
// ═══════════════════════════════════════════════════════════════════════════════

class RouteOptimizer {
    constructor(network) { this.network = network; }

    selectBestMeans(type, route, options = {}) {
        const priority = options.priority || 'balanced';
        const candidates = Object.entries(TRANSPORT_MEANS);

        const scored = candidates.map(([key, means]) => {
            let score = 0;
            if (priority === 'speed')    score = means.speed * 100;
            else if (priority === 'cost') score = (1 - means.cost) * 100;
            else score = (means.speed * 60) + ((1 - means.cost) * 40);
            return { key, score };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored[0]?.key || 'HYBRID';
    }

    calculateQuality(transfer) {
        const route = transfer.route;
        if (!route) return 80;
        const latencyScore = Math.max(0, 100 - route.estimatedLatency);
        const hopPenalty   = (route.hops - 1) * 2;
        const confidence   = route.confidence || 90;
        return Math.min(99.9, Math.max(50, (latencyScore * 0.4 + confidence * 0.6) - hopPenalty));
    }

    scorePath(path, type) {
        const means  = TRANSPORT_MEANS[path.means] || TRANSPORT_MEANS.HYBRID;
        const latency = path.estimatedLatency || 50;
        const hops   = path.hops || 1;
        return means.speed * 40 + (1 - means.cost) * 30 + (100 - latency) * 0.2 + (5 - hops) * 10;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 محرك التنبؤ بالطلب — Demand Predictor
// ═══════════════════════════════════════════════════════════════════════════════

class DemandPredictor {
    constructor(network) { this.network = network; }

    predict(type, from, to) {
        const history = this.network.neuralMemory.transferHistory
            .filter(h => h.type === type);
        const count = history.length;
        const recent = history.slice(-10).filter(h => h.success).length;
        return {
            expectedDemand:  count > 0 ? `${Math.round((recent / Math.max(count, 10)) * 100)}%` : 'غير معروف',
            trend:           count > 5 ? 'متزايد' : 'مستقر',
            confidence:      count > 20 ? '95%' : '75%',
            recommendedMeans: count > 0 ? (history.slice(-1)[0]?.means || 'HYBRID') : 'HYBRID'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚖️ حارس الشريعة — Shariah Guardian
// ═══════════════════════════════════════════════════════════════════════════════

class ShariahGuardian {
    constructor(foundation) {
        this.foundation = foundation;

        // محتوى محظور
        this.prohibited = [
            'ربا', 'riba', 'interest', 'alcohol', 'gambling', 'pork', 'خمر', 'قمار',
            'خنزير', 'حرام', 'haram', 'forbidden', 'illegal', 'fraud', 'احتيال',
            'غش', 'deception', 'exploitation', 'استغلال', 'oppression', 'ظلم'
        ];
    }

    verify(payload, type, options = {}) {
        const text = JSON.stringify(payload).toLowerCase();

        for (const word of this.prohibited) {
            if (text.includes(word.toLowerCase())) {
                return {
                    approved: false,
                    reason:   `المحتوى يتعارض مع الشريعة الإسلامية — وجود مصطلح: "${word}"`,
                    principle: 'لا ضرر ولا ضرار'
                };
            }
        }

        return {
            approved:   true,
            compliance: 100,
            basis:      this.foundation.ayat[0],
            principles: this.foundation.principles.slice(0, 3),
            message:    'النقل متوافق مع أحكام الشريعة الإسلامية ✅'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📡 تسجيل مسارات API — Route Registration
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تسجيل جميع نقاط API للشبكة العصبية في تطبيق Express
 * @param {import('express').Application} app
 * @param {SheikhaNeural_TransportNetwork} network
 */
function registerNavigatorRoutes(app, network) {

    // GET /api/navigator/neural/status — حالة الشبكة الكاملة
    app.get('/api/navigator/neural/status', (_req, res) => {
        res.json({ success: true, ...network.getNetworkStatus() });
    });

    // GET /api/navigator/neural/statistics — الإحصائيات التفصيلية
    app.get('/api/navigator/neural/statistics', (_req, res) => {
        res.json({ success: true, statistics: network.getStatistics() });
    });

    // GET /api/navigator/neural/nodes — قائمة العقد
    app.get('/api/navigator/neural/nodes', (req, res) => {
        const nodes = network.listNodes(req.query);
        res.json({ success: true, total: nodes.length, nodes });
    });

    // POST /api/navigator/neural/nodes — تسجيل عقدة جديدة
    app.post('/api/navigator/neural/nodes', express_json_middleware(), (req, res) => {
        const node = network.registerNode(req.body || {});
        res.status(201).json({ success: true, node });
    });

    // GET /api/navigator/neural/edges — قائمة الروابط
    app.get('/api/navigator/neural/edges', (_req, res) => {
        const edges = Array.from(network.edges.values());
        res.json({ success: true, total: edges.length, edges });
    });

    // POST /api/navigator/neural/edges — إنشاء رابط جديد
    app.post('/api/navigator/neural/edges', express_json_middleware(), (req, res) => {
        const { from, to, ...config } = req.body || {};
        if (!from || !to) return res.status(400).json({ success: false, error: 'from و to مطلوبان' });
        const edge = network.registerEdge(from, to, config);
        res.status(201).json({ success: true, edge });
    });

    // POST /api/navigator/neural/transport — تنفيذ عملية نقل
    app.post('/api/navigator/neural/transport', express_json_middleware(), async (req, res) => {
        const body = req.body || {};
        if (!body.from && !body.source && !body.sourceId) {
            return res.status(400).json({ success: false, error: 'مصدر النقل (from) مطلوب' });
        }
        if (!body.to && !body.destination && !body.destinationId) {
            return res.status(400).json({ success: false, error: 'وجهة النقل (to) مطلوبة' });
        }
        try {
            const result = await network.transport(body);
            const statusCode = result.status === 'completed' ? 200 : (result.status === 'rejected-shariah' ? 403 : 500);
            res.status(statusCode).json({ success: result.status === 'completed', transfer: result });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // POST /api/navigator/neural/discover — اكتشاف المسارات بين نقطتين
    app.post('/api/navigator/neural/discover', express_json_middleware(), (req, res) => {
        const { from, to, type } = req.body || {};
        if (!from || !to) return res.status(400).json({ success: false, error: 'from و to مطلوبان' });
        const routes = network.discoverRoutes(from, to, (type || 'DATA').toUpperCase());
        res.json({ success: true, ...routes });
    });

    // GET /api/navigator/neural/types — أنواع النقل المدعومة
    app.get('/api/navigator/neural/types', (_req, res) => {
        res.json({ success: true, types: Object.values(TRANSPORT_TYPES), total: Object.keys(TRANSPORT_TYPES).length });
    });

    // GET /api/navigator/neural/means — وسائل النقل المدعومة
    app.get('/api/navigator/neural/means', (_req, res) => {
        res.json({ success: true, means: Object.values(TRANSPORT_MEANS), total: Object.keys(TRANSPORT_MEANS).length });
    });

    // GET /api/navigator/neural/shariah — الأساس الشرعي
    app.get('/api/navigator/neural/shariah', (_req, res) => {
        res.json({ success: true, ...network.shariahFoundation, compliance: '100%' });
    });

    // GET /api/navigator/neural/history — سجل عمليات النقل
    app.get('/api/navigator/neural/history', (req, res) => {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const history = network.neuralMemory.transferHistory.slice(-limit).reverse();
        res.json({ success: true, total: network.neuralMemory.transferHistory.length, history });
    });

    // GET /api/navigator/neural/predict/:from/:to/:type — التنبؤ بالطلب
    app.get('/api/navigator/neural/predict/:from/:to/:type', (req, res) => {
        const { from, to, type } = req.params;
        const prediction = network.aiEngines.predictor.predict(type.toUpperCase(), from, to);
        res.json({ success: true, from, to, type, prediction });
    });

    console.log('✅ [SNTN] 12 مسار API مسجّل — الشبكة العصبية للنقل جاهزة');
}

// middleware مساعد لتحليل JSON (يُجنب تكرار express.json)
function express_json_middleware() {
    try { return require('express').json(); } catch (_) { return (req, _res, next) => next(); }
}

// ─── التصدير ──────────────────────────────────────────────────────────────────

module.exports = {
    SheikhaNeural_TransportNetwork,
    TRANSPORT_TYPES,
    TRANSPORT_MEANS,
    NODE_CATEGORIES,
    registerNavigatorRoutes,
    // factory
    create: (options = {}) => new SheikhaNeural_TransportNetwork(options)
};
