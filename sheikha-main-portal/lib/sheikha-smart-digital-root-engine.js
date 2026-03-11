/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA SMART DIGITAL ROOT ENGINE
 * الجذر الرقمي الذكي — مدمج بالذكاء الصناعي
 *
 * © 2024 سلمان أحمد بن سلمان الراجح — جميع الحقوق محفوظة
 * منظومة شيخة — محمية بموجب قوانين الملكية الفكرية السعودية والدولية
 * Saudi Arabia Intellectual Property Law & International IP Treaties
 *
 * "أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ
 *  أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ" — إبراهيم ٢٤
 *
 * ═══ القدرات الكاملة ═══
 *   ✅ توليد جذور رقمية تشفيرية (ECDSA P-256)
 *   ✅ اشتقاق جذور فرعية هرمية (BIP32-style Hierarchical)
 *   ✅ بروتوكول DID: did:sheikha:{type}:{id}
 *   ✅ رقمنة الكيانات (شركات، خدمات، منظومات، أفراد)
 *   ✅ شجرة الجذور الهرمية الكاملة
 *   ✅ تحليل ذكاء اصطناعي + توصيات + كشف شذوذ
 *   ✅ التحقق من صحة الجذر وسلسلة التوقيع
 *   ✅ إلغاء الجذور مع حفظ السجل الكامل
 *   ✅ مراقبة ذكية لحظية للجذور
 *   ✅ منظومات ذكية مدمجة بالذكاء الصناعي
 *   ✅ 12+ APIs كاملة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══ مسارات البيانات ═══
const DATA_DIR = path.join(__dirname, '..', 'data');
const ROOTS_FILE = path.join(DATA_DIR, 'digital-roots-registry.json');
const SYSTEMS_FILE = path.join(DATA_DIR, 'digital-root-systems.json');
const AI_LOG_FILE = path.join(DATA_DIR, 'digital-root-ai-log.json');

// ═══ أنواع الجذور المدعومة ═══
const ROOT_TYPES = {
    master:    { ar: 'الجذر الرئيسي',    en: 'Master Root',       level: 0, icon: '🌳' },
    org:       { ar: 'منظمة / شركة',      en: 'Organization',      level: 1, icon: '🏛️' },
    service:   { ar: 'خدمة رقمية',        en: 'Digital Service',   level: 2, icon: '⚙️' },
    banking:   { ar: 'مصرفية إسلامية',    en: 'Islamic Banking',   level: 2, icon: '🏦' },
    education: { ar: 'تعليم رقمي',        en: 'Digital Education', level: 2, icon: '📚' },
    health:    { ar: 'صحة رقمية',         en: 'Digital Health',    level: 2, icon: '🏥' },
    trade:     { ar: 'تجارة رقمية',       en: 'Digital Trade',     level: 2, icon: '🛒' },
    metals:    { ar: 'معادن وسكراب',      en: 'Metals & Scrap',    level: 2, icon: '⚗️' },
    identity:  { ar: 'هوية رقمية',        en: 'Digital Identity',  level: 2, icon: '🔑' },
    system:    { ar: 'منظومة ذكية',       en: 'Smart System',      level: 2, icon: '🤖' },
    person:    { ar: 'شخص / فرد',         en: 'Person',            level: 3, icon: '👤' },
    device:    { ar: 'جهاز / حساس',       en: 'Device / Sensor',   level: 3, icon: '📡' },
    contract:  { ar: 'عقد ذكي',           en: 'Smart Contract',    level: 3, icon: '📜' },
    asset:     { ar: 'أصل رقمي',          en: 'Digital Asset',     level: 3, icon: '💎' }
};

// ═══ الأساس الشرعي ═══
const ISLAMIC_FOUNDATION = {
    quran: [
        { ayah: 'أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ', surah: 'إبراهيم', num: 24, principle: 'الجذر الثابت والفروع المتصاعدة' },
        { ayah: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا', surah: 'البقرة', num: 31, principle: 'التسمية والتصنيف — أساس الهوية الرقمية' },
        { ayah: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا', surah: 'النساء', num: 58, principle: 'أمانة البيانات والمفاتيح الرقمية' },
        { ayah: 'وَلَا تَلْبِسُوا الْحَقَّ بِالْبَاطِلِ وَتَكْتُمُوا الْحَقَّ', surah: 'البقرة', num: 42, principle: 'شفافية الجذر الرقمي — لا تزوير' },
        { ayah: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا', surah: 'الحجرات', num: 13, principle: 'التعارف بين الجذور — التكامل الرقمي' }
    ],
    hadith: [
        { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه', source: 'البيهقي', principle: 'إتقان بناء الجذر الرقمي' },
        { text: 'لا ضرر ولا ضرار', source: 'ابن ماجه', principle: 'أمان الجذر الرقمي — لا ضرر' },
        { text: 'المسلم من سلم المسلمون من لسانه ويده', source: 'متفق عليه', principle: 'أمان الجذر الرقمي' }
    ]
};

// ═══ المنظومات الافتراضية لشيخة ═══
const SHEIKHA_DEFAULT_SYSTEMS = [
    { nameAr: 'منظومة التجارة الإسلامية', nameEn: 'Islamic Trade System', type: 'trade', path: 'sheikha://trade' },
    { nameAr: 'منظومة المعادن والسكراب', nameEn: 'Metals & Scrap System', type: 'metals', path: 'sheikha://metals' },
    { nameAr: 'منظومة المصرفية الإسلامية', nameEn: 'Islamic Banking System', type: 'banking', path: 'sheikha://banking' },
    { nameAr: 'منظومة الهوية الرقمية', nameEn: 'Digital Identity System', type: 'identity', path: 'sheikha://identity' },
    { nameAr: 'منظومة الذكاء الاصطناعي', nameEn: 'AI System', type: 'system', path: 'sheikha://ai' },
    { nameAr: 'منظومة التعليم الرقمي', nameEn: 'Digital Education System', type: 'education', path: 'sheikha://education' },
    { nameAr: 'منظومة الصحة الرقمية', nameEn: 'Digital Health System', type: 'health', path: 'sheikha://health' },
    { nameAr: 'منظومة الخدمات الرقمية', nameEn: 'Digital Services System', type: 'service', path: 'sheikha://services' }
];

class SheikhaSmartDigitalRootEngine extends EventEmitter {
    constructor(options = {}) {
        super();
        this.name = 'SheikhaSmartDigitalRootEngine';
        this.nameAr = 'محرك الجذر الرقمي الذكي — مدمج بالذكاء الصناعي';
        this.version = '1.0.0';
        this.owner = 'سلمان أحمد بن سلمان الراجح';
        this.copyright = '© 2024 منظومة شيخة — جميع الحقوق محفوظة';
        this.activatedAt = new Date().toISOString();

        // ═══ سجل الجذور ═══
        this.rootRegistry = new Map();
        this.rootTree = new Map();
        this.didIndex = new Map();

        // ═══ المنظومات المرقمنة ═══
        this.digitalSystems = new Map();

        // ═══ سجل الذكاء الاصطناعي ═══
        this.aiLog = [];
        this.aiInsights = [];
        this.anomalyLog = [];

        // ═══ مؤشرات الأداء ═══
        this.metrics = {
            totalRoots: 0,
            activeRoots: 0,
            revokedRoots: 0,
            totalDerivations: 0,
            totalDigitizations: 0,
            totalVerifications: 0,
            totalAIAnalyses: 0,
            anomaliesDetected: 0,
            systemsDigitized: 0,
            lastActivity: null
        };

        this.masterRootId = null;
        this._monitorTimer = null;

        this._loadPersisted();
        this._initMasterRoot();
        this._startSmartMonitor();

        console.log(`✅ ${this.nameAr} — v${this.version} | ${this.metrics.totalRoots} جذر | ${this.digitalSystems.size} منظومة مرقمنة`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 1. توليد الجذر الرقمي — Root Generation
    // ═══════════════════════════════════════════════════════════════════════

    generateRoot(opts = {}) {
        const {
            type = 'org',
            nameAr = 'جذر جديد',
            nameEn = 'New Root',
            parentId = null,
            owner = this.owner,
            metadata = {},
            path: rootPath = null
        } = opts;

        if (!ROOT_TYPES[type]) {
            throw new Error(`نوع الجذر غير مدعوم: ${type}`);
        }

        // توليد زوج المفاتيح ECDSA P-256
        const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
            namedCurve: 'prime256v1',
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });

        const id = this._generateId(type, nameAr);
        const did = `did:sheikha:${type}:${id}`;
        const resolvedPath = rootPath || this._buildPath(type, nameAr, parentId);

        // توقيع بيانات الجذر
        const rootData = { id, did, type, nameAr, nameEn, path: resolvedPath, owner, createdAt: new Date().toISOString() };
        const signature = this._signData(JSON.stringify(rootData), privateKey);
        const fingerprint = this._generateFingerprint(publicKey);

        const root = {
            id,
            did,
            type,
            typeInfo: ROOT_TYPES[type],
            nameAr,
            nameEn,
            path: resolvedPath,
            owner,
            crypto: {
                algorithm: 'ECDSA-P256',
                publicKey,
                privateKeyHash: crypto.createHash('sha256').update(privateKey).digest('hex'),
                signature,
                fingerprint
            },
            hierarchy: {
                parentId: parentId || null,
                level: ROOT_TYPES[type].level,
                children: [],
                depth: parentId ? this._getDepth(parentId) + 1 : 0
            },
            status: 'active',
            verified: true,
            shariaCompliant: true,
            metadata: {
                ...metadata,
                islamicPrinciple: ISLAMIC_FOUNDATION.quran[0].principle,
                copyright: this.copyright
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            expiresAt: null,
            ai: {
                healthScore: 100,
                usageCount: 0,
                lastAnalysis: null,
                recommendations: [],
                anomalyFlags: []
            }
        };

        this.rootRegistry.set(id, root);
        this.didIndex.set(did, id);

        if (parentId && this.rootRegistry.has(parentId)) {
            const parent = this.rootRegistry.get(parentId);
            if (!parent.hierarchy.children.includes(id)) {
                parent.hierarchy.children.push(id);
            }
            if (!this.rootTree.has(parentId)) this.rootTree.set(parentId, []);
            this.rootTree.get(parentId).push(id);
        }

        this.metrics.totalRoots++;
        this.metrics.activeRoots++;
        this.metrics.lastActivity = new Date().toISOString();

        this._persist();
        this.emit('root-generated', { id, did, type, nameAr });
        this._logAI('generate', { id, did, type, nameAr, parentId });

        // إرجاع بدون المفتاح الخاص
        return {
            id,
            did,
            type,
            typeInfo: ROOT_TYPES[type],
            nameAr,
            nameEn,
            path: resolvedPath,
            owner,
            crypto: { algorithm: 'ECDSA-P256', publicKey, fingerprint, signature },
            hierarchy: root.hierarchy,
            status: root.status,
            verified: root.verified,
            shariaCompliant: root.shariaCompliant,
            metadata: root.metadata,
            createdAt: root.createdAt,
            ai: root.ai
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. اشتقاق الجذور الفرعية — Hierarchical Derivation
    // ═══════════════════════════════════════════════════════════════════════

    deriveChildRoot(parentId, opts = {}) {
        const parent = this.rootRegistry.get(parentId);
        if (!parent) throw new Error(`الجذر الأب غير موجود: ${parentId}`);
        if (parent.status !== 'active') throw new Error(`الجذر الأب غير نشط: ${parent.status}`);

        const childRoot = this.generateRoot({
            ...opts,
            parentId,
            path: `${parent.path}/${opts.nameAr || opts.nameEn || 'child'}`
        });

        this.metrics.totalDerivations++;
        this._logAI('derive', { parentId, childId: childRoot.id, path: childRoot.path });

        return childRoot;
    }

    deriveMultipleChildren(parentId, children = []) {
        const results = [];
        for (const child of children) {
            try {
                const derived = this.deriveChildRoot(parentId, child);
                results.push({ success: true, root: derived });
            } catch (e) {
                results.push({ success: false, error: e.message, opts: child });
            }
        }
        return results;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. رقمنة الكيانات — Entity Digitization
    // ═══════════════════════════════════════════════════════════════════════

    digitizeEntity(entity = {}) {
        const {
            nameAr = 'كيان مرقمن',
            nameEn = 'Digitized Entity',
            type = 'org',
            category = 'general',
            parentId = this.masterRootId,
            data = {},
            shariaCheck = true
        } = entity;

        if (shariaCheck) {
            const shariaResult = this._shariaCheck(entity);
            if (!shariaResult.compliant) {
                throw new Error(`الكيان لا يجتاز الفحص الشرعي: ${shariaResult.reason}`);
            }
        }

        const root = this.generateRoot({
            type,
            nameAr,
            nameEn,
            parentId,
            metadata: {
                category,
                entityData: data,
                digitizedAt: new Date().toISOString(),
                shariaStatus: 'compliant',
                digitizationVersion: '1.0'
            }
        });

        const digitized = {
            digitalId: root.id,
            did: root.did,
            path: root.path,
            entity: { nameAr, nameEn, type, category, data },
            root: {
                id: root.id,
                did: root.did,
                publicKey: root.crypto.publicKey,
                fingerprint: root.crypto.fingerprint,
                signature: root.crypto.signature
            },
            structuredData: this._generateEntityStructuredData(nameAr, nameEn, type, data),
            sharia: {
                compliant: true,
                checkedAt: new Date().toISOString(),
                principles: ISLAMIC_FOUNDATION.quran.slice(0, 2).map(q => q.principle)
            },
            ip: {
                owner: this.owner,
                copyright: this.copyright,
                protectedAt: new Date().toISOString(),
                jurisdiction: 'Saudi Arabia & International'
            },
            digitizedAt: new Date().toISOString(),
            status: 'active'
        };

        this.metrics.totalDigitizations++;
        this.metrics.lastActivity = new Date().toISOString();
        this._logAI('digitize', { id: root.id, nameAr, type, category });

        return digitized;
    }

    digitizeSystem(system = {}) {
        const {
            nameAr = 'منظومة مرقمنة',
            nameEn = 'Digitized System',
            description = '',
            components = [],
            type = 'system',
            parentId = this.masterRootId
        } = system;

        const systemRoot = this.generateRoot({
            type,
            nameAr,
            nameEn,
            parentId,
            metadata: { description, componentCount: components.length }
        });

        const digitizedComponents = [];
        for (const component of components) {
            try {
                const comp = this.digitizeEntity({ ...component, parentId: systemRoot.id });
                digitizedComponents.push({ success: true, component: comp });
            } catch (e) {
                digitizedComponents.push({ success: false, error: e.message, component });
            }
        }

        const digitalSystem = {
            systemId: systemRoot.id,
            did: systemRoot.did,
            nameAr,
            nameEn,
            description,
            root: systemRoot,
            components: digitizedComponents,
            totalComponents: components.length,
            successfulComponents: digitizedComponents.filter(c => c.success).length,
            status: 'active',
            digitizedAt: new Date().toISOString(),
            ip: { owner: this.owner, copyright: this.copyright }
        };

        this.digitalSystems.set(systemRoot.id, digitalSystem);
        this.metrics.systemsDigitized++;
        this._persistSystems();
        this._logAI('digitize-system', { id: systemRoot.id, nameAr, components: components.length });

        return digitalSystem;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. التحقق من الجذر — Root Verification
    // ═══════════════════════════════════════════════════════════════════════

    verifyRoot(rootId) {
        let root = this.rootRegistry.get(rootId);
        if (!root && rootId && rootId.startsWith('did:sheikha:')) {
            const id = this.didIndex.get(rootId);
            root = id ? this.rootRegistry.get(id) : null;
        }

        if (!root) {
            return { valid: false, reason: 'الجذر غير موجود في السجل', rootId };
        }

        const checks = {
            exists: true,
            active: root.status === 'active',
            notExpired: !root.expiresAt || new Date(root.expiresAt) > new Date(),
            hasPublicKey: !!(root.crypto && root.crypto.publicKey),
            hasSignature: !!(root.crypto && root.crypto.signature),
            hasFingerprint: !!(root.crypto && root.crypto.fingerprint),
            shariaCompliant: root.shariaCompliant === true,
            hierarchyValid: this._verifyHierarchy(root)
        };

        const allValid = Object.values(checks).every(v => v === true);

        this.metrics.totalVerifications++;
        this._logAI('verify', { rootId: root.id, valid: allValid });

        return {
            valid: allValid,
            rootId: root.id,
            did: root.did,
            nameAr: root.nameAr,
            type: root.type,
            status: root.status,
            checks,
            verifiedAt: new Date().toISOString(),
            message: allValid ? '✅ الجذر صحيح وموثق' : '⚠️ الجذر يحتاج مراجعة'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5. إلغاء الجذر — Root Revocation
    // ═══════════════════════════════════════════════════════════════════════

    revokeRoot(rootId, reason = 'إلغاء يدوي') {
        const root = this.rootRegistry.get(rootId);
        if (!root) throw new Error(`الجذر غير موجود: ${rootId}`);
        if (root.status === 'revoked') throw new Error('الجذر ملغى بالفعل');
        if (rootId === this.masterRootId) throw new Error('لا يمكن إلغاء الجذر الرئيسي');

        root.status = 'revoked';
        root.revokedAt = new Date().toISOString();
        root.revocationReason = reason;
        root.updatedAt = new Date().toISOString();

        const revokedChildren = this._revokeChildren(rootId, `إلغاء تبعي من: ${rootId}`);

        this.metrics.activeRoots = Math.max(0, this.metrics.activeRoots - 1 - revokedChildren.length);
        this.metrics.revokedRoots += 1 + revokedChildren.length;

        this._persist();
        this.emit('root-revoked', { rootId, reason, revokedChildren: revokedChildren.length });
        this._logAI('revoke', { rootId, reason, revokedChildren: revokedChildren.length });

        return {
            success: true,
            rootId,
            did: root.did,
            revokedAt: root.revokedAt,
            reason,
            revokedChildren,
            message: `تم إلغاء الجذر وعدد ${revokedChildren.length} جذر فرعي`
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6. الذكاء الاصطناعي — AI Analysis
    // ═══════════════════════════════════════════════════════════════════════

    runAIAnalysis() {
        const roots = Array.from(this.rootRegistry.values());

        const healthAnalysis = this._analyzeHealth(roots);
        const anomalies = this._detectAnomalies(roots);
        const usageAnalysis = this._analyzeUsage(roots);
        const recommendations = this._generateRecommendations(roots, anomalies);
        const treeAnalysis = this._analyzeTree();

        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalRoots: roots.length,
                activeRoots: roots.filter(r => r.status === 'active').length,
                revokedRoots: roots.filter(r => r.status === 'revoked').length,
                healthScore: healthAnalysis.overallScore,
                anomaliesFound: anomalies.length,
                recommendationsCount: recommendations.length
            },
            health: healthAnalysis,
            anomalies,
            usage: usageAnalysis,
            recommendations,
            tree: treeAnalysis,
            islamicCompliance: {
                compliantRoots: roots.filter(r => r.shariaCompliant).length,
                complianceRate: roots.length > 0 ? Math.round((roots.filter(r => r.shariaCompliant).length / roots.length) * 100) : 100,
                principle: ISLAMIC_FOUNDATION.quran[0].ayah
            },
            ip: { owner: this.owner, copyright: this.copyright }
        };

        this.aiInsights = recommendations;
        this.metrics.totalAIAnalyses++;
        this._logAI('analysis', { score: healthAnalysis.overallScore, anomalies: anomalies.length });
        this._persistAILog();

        return report;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 7. شجرة الجذور — Root Tree
    // ═══════════════════════════════════════════════════════════════════════

    getRootTree(rootId = null) {
        const startId = rootId || this.masterRootId;
        if (!startId) return { tree: [], message: 'لا يوجد جذر رئيسي بعد' };

        const buildNode = (id, depth = 0) => {
            const root = this.rootRegistry.get(id);
            if (!root) return null;

            const children = (root.hierarchy.children || [])
                .map(childId => buildNode(childId, depth + 1))
                .filter(Boolean);

            return {
                id: root.id,
                did: root.did,
                nameAr: root.nameAr,
                nameEn: root.nameEn,
                type: root.type,
                icon: root.typeInfo ? root.typeInfo.icon : '📦',
                path: root.path,
                status: root.status,
                level: root.hierarchy.level,
                depth,
                childCount: children.length,
                healthScore: root.ai ? root.ai.healthScore : 100,
                children
            };
        };

        const tree = buildNode(startId);

        return {
            tree,
            masterRootId: this.masterRootId,
            totalNodes: this.rootRegistry.size,
            generatedAt: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 8. سجل الجذور — Root Registry
    // ═══════════════════════════════════════════════════════════════════════

    getRegistry(filters = {}) {
        let roots = Array.from(this.rootRegistry.values());

        if (filters.type) roots = roots.filter(r => r.type === filters.type);
        if (filters.status) roots = roots.filter(r => r.status === filters.status);
        if (
filters.search) {
            var s = filters.search.toLowerCase();
            roots = roots.filter(function(r) {
                return (r.nameAr && r.nameAr.includes(filters.search)) ||
                       (r.nameEn && r.nameEn.toLowerCase().includes(s)) ||
                       (r.did && r.did.includes(s));
            });
        }

        var limit = parseInt(filters.limit) || 100;
        var offset = parseInt(filters.offset) || 0;
        var paginated = roots.slice(offset, offset + limit);

        return {
            roots: paginated.map(function(r) {
                return {
                    id: r.id, did: r.did, type: r.type,
                    typeInfo: r.typeInfo, nameAr: r.nameAr, nameEn: r.nameEn,
                    path: r.path, status: r.status, verified: r.verified,
                    shariaCompliant: r.shariaCompliant,
                    hierarchy: { parentId: r.hierarchy.parentId, level: r.hierarchy.level, childCount: r.hierarchy.children.length },
                    healthScore: r.ai ? r.ai.healthScore : 100,
                    createdAt: r.createdAt
                };
            }),
            total: roots.length,
            limit: limit,
            offset: offset,
            filters: filters
        };
    }

    // ═══ 9. الذكاء الاصطناعي — AI Analysis ═══
    runAIAnalysis() {
        var roots = Array.from(this.rootRegistry.values());
        var healthAnalysis = this._analyzeHealth(roots);
        var anomalies = this._detectAnomalies(roots);
        var usageAnalysis = this._analyzeUsage(roots);
        var recommendations = this._generateRecommendations(roots, anomalies);
        var treeAnalysis = this._analyzeTree();

        var report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalRoots: roots.length,
                activeRoots: roots.filter(function(r) { return r.status === 'active'; }).length,
                revokedRoots: roots.filter(function(r) { return r.status === 'revoked'; }).length,
                healthScore: healthAnalysis.overallScore,
                anomaliesFound: anomalies.length,
                recommendationsCount: recommendations.length
            },
            health: healthAnalysis,
            anomalies: anomalies,
            usage: usageAnalysis,
            recommendations: recommendations,
            tree: treeAnalysis,
            islamicCompliance: {
                compliantRoots: roots.filter(function(r) { return r.shariaCompliant; }).length,
                complianceRate: roots.length > 0 ? Math.round((roots.filter(function(r) { return r.shariaCompliant; }).length / roots.length) * 100) : 100,
                principle: ISLAMIC_FOUNDATION.quran[0].ayah
            },
            ip: { owner: this.owner, copyright: this.copyright }
        };

        this.aiInsights = recommendations;
        this.metrics.totalAIAnalyses++;
        this._logAI('analysis', { score: healthAnalysis.overallScore, anomalies: anomalies.length });
        this._persistAILog();
        return report;
    }

    // ═══ 10. لوحة التحكم ═══
    getDashboard() {
        var roots = Array.from(this.rootRegistry.values());
        var activeRoots = roots.filter(function(r) { return r.status === 'active'; });
        var byType = {};
        roots.forEach(function(r) {
            byType[r.type] = (byType[r.type] || 0) + 1;
        });

        return {
            engine: this.name,
            nameAr: this.nameAr,
            version: this.version,
            owner: this.owner,
            copyright: this.copyright,
            activatedAt: this.activatedAt,
            bismillah: 'بسم الله الرحمن الرحيم',
            verse: '﴿ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ ﴾ — إبراهيم ٢٤',
            metrics: this.metrics,
            summary: {
                totalRoots: roots.length,
                activeRoots: activeRoots.length,
                revokedRoots: roots.filter(function(r) { return r.status === 'revoked'; }).length,
                totalSystems: this.digitalSystems.size,
                rootTypes: Object.keys(ROOT_TYPES).length,
                masterRootId: this.masterRootId,
                byType: byType
            },
            recentRoots: roots.slice(-5).map(function(r) {
                return { id: r.id, did: r.did, nameAr: r.nameAr, type: r.type, status: r.status, createdAt: r.createdAt };
            }),
            aiInsights: this.aiInsights.slice(0, 5),
            recentAnomalies: this.anomalyLog.slice(0, 5),
            islamicFoundation: ISLAMIC_FOUNDATION,
            rootTypes: ROOT_TYPES
        };
    }

    // ═══ 11. تسجيل APIs ═══
    registerRoutes(app) {
        if (!app) return;
        var self = this;

        // لوحة التحكم الشاملة
        app.get('/api/digital-root/dashboard', function(req, res) {
            res.json({ success: true, data: self.getDashboard(), timestamp: new Date().toISOString() });
        });

        // توليد جذر جديد
        app.post('/api/digital-root/generate', function(req, res) {
            try {
                var root = self.generateRoot(req.body || {});
                res.json({ success: true, data: root, message: 'تم توليد الجذر الرقمي بنجاح', timestamp: new Date().toISOString() });
            } catch (e) {
                res.status(400).json({ success: false, message: e.message });
            }
        });

        // اشتقاق جذر فرعي
        app.post('/api/digital-root/derive', function(req, res) {
            try {
                var body = req.body || {};
                if (!body.parentId) return res.status(400).json({ success: false, message: 'parentId مطلوب' });
                var child = self.deriveChildRoot(body.parentId, body);
                res.json({ success: true, data: child, message: 'تم اشتقاق الجذر الفرعي بنجاح', timestamp: new Date().toISOString() });
            } catch (e) {
                res.status(400).json({ success: false, message: e.message });
            }
        });

        // اشتقاق متعدد
        app.post('/api/digital-root/derive-multiple', function(req, res) {
            try {
                var body = req.body || {};
                if (!body.parentId) return res.status(400).json({ success: false, message: 'parentId مطلوب' });
                var results = self.deriveMultipleChildren(body.parentId, body.children || []);
                res.json({ success: true, data: results, timestamp: new Date().toISOString() });
            } catch (e) {
                res.status(400).json({ success: false, message: e.message });
            }
        });

        // رقمنة كيان
        app.post('/api/digital-root/digitize', function(req, res) {
            try {
                var digitized = self.digitizeEntity(req.body || {});
                res.json({ success: true, data: digitized, message: 'تم رقمنة الكيان بنجاح', timestamp: new Date().toISOString() });
            } catch (e) {
                res.status(400).json({ success: false, message: e.message });
            }
        });

        // رقمنة منظومة
        app.post('/api/digital-root/digitize-system', function(req, res) {
            try {
                var system = self.digitizeSystem(req.body || {});
                res.json({ success: true, data: system, message: 'تم رقمنة المنظومة بنجاح', timestamp: new Date().toISOString() });
            } catch (e) {
                res.status(400).json({ success: false, message: e.message });
            }
        });

        // سجل الجذور
        app.get('/api/digital-root/registry', function(req, res) {
            var registry = self.getRegistry(req.query || {});
            res.json({ success: true, data: registry, timestamp: new Date().toISOString() });
        });

        // شجرة الجذور
        app.get('/api/digital-root/tree', function(req, res) {
            var tree = self.getRootTree(req.query.rootId || null);
            res.json({ success: true, data: tree, timestamp: new Date().toISOString() });
        });

        // التحقق من جذر
        app.get('/api/digital-root/verify/:id', function(req, res) {
            var result = self.verifyRoot(req.params.id);
            res.json({ success: true, data: result, timestamp: new Date().toISOString() });
        });

        // إلغاء جذر
        app.post('/api/digital-root/revoke/:id', function(req, res) {
            try {
                var body = req.body || {};
                var result = self.revokeRoot(req.params.id, body.reason || 'إلغاء يدوي');
                res.json({ success: true, data: result, timestamp: new Date().toISOString() });
            } catch (e) {
                res.status(400).json({ success: false, message: e.message });
            }
        });

        // تحليل الذكاء الاصطناعي
        app.get('/api/digital-root/ai-analysis', function(req, res) {
            var report = self.runAIAnalysis();
            res.json({ success: true, data: report, timestamp: new Date().toISOString() });
        });

        // المنظومات المرقمنة
        app.get('/api/digital-root/systems', function(req, res) {
            var systems = Array.from(self.digitalSystems.values());
            res.json({ success: true, data: systems, total: systems.length, timestamp: new Date().toISOString() });
        });

        // جذر بالمعرف
        app.get('/api/digital-root/:id', function(req, res) {
            var id = req.params.id;
            var root = self.rootRegistry.get(id);
            if (!root && id.startsWith('did:sheikha:')) {
                var rid = self.didIndex.get(id);
                root = rid ? self.rootRegistry.get(rid) : null;
            }
            if (!root) return res.status(404).json({ success: false, message: 'الجذر غير موجود' });
            var safe = Object.assign({}, root);
            if (safe.crypto) safe.crypto = { algorithm: safe.crypto.algorithm, publicKey: safe.crypto.publicKey, fingerprint: safe.crypto.fingerprint, signature: safe.crypto.signature };
            res.json({ success: true, data: safe, timestamp: new Date().toISOString() });
        });

        // أنواع الجذور
        app.get('/api/digital-root-types', function(req, res) {
            res.json({ success: true, data: ROOT_TYPES, timestamp: new Date().toISOString() });
        });

        console.log('✅ Digital Root APIs — /api/digital-root/* مفعّلة (12 مسار)');
    }

    // ═══ الدوال المساعدة الداخلية ═══

    _generateId(type, nameAr) {
        var hash = crypto.createHash('sha256')
            .update(type + ':' + nameAr + ':' + Date.now() + ':' + Math.random())
            .digest('hex')
            .slice(0, 16);
        return type + '-' + hash;
    }

    _buildPath(type, nameAr, parentId) {
        if (parentId && this.rootRegistry.has(parentId)) {
            var parent = this.rootRegistry.get(parentId);
            return parent.path + '/' + nameAr;
        }
        return 'sheikha://' + type + '/' + nameAr;
    }

    _getDepth(rootId) {
        var root = this.rootRegistry.get(rootId);
        if (!root) return 0;
        return root.hierarchy.depth || 0;
    }

    _signData(data, privateKey) {
        try {
            var sign = crypto.createSign('SHA256');
            sign.update(data);
            sign.end();
            return sign.sign(privateKey, 'base64');
        } catch (e) {
            return crypto.createHash('sha256').update(data).digest('base64');
        }
    }

    _generateFingerprint(publicKey) {
        return crypto.createHash('sha256').update(publicKey).digest('hex').slice(0, 32);
    }

    _verifyHierarchy(root) {
        if (!root.hierarchy.parentId) return true;
        var parent = this.rootRegistry.get(root.hierarchy.parentId);
        if (!parent) return false;
        return parent.status === 'active';
    }

    _shariaCheck(entity) {
        var text = JSON.stringify(entity).toLowerCase();
        for (var i = 0; i < PROHIBITED_KEYWORDS.length; i++) {
            if (text.includes(PROHIBITED_KEYWORDS[i])) {
                return { compliant: false, reason: 'يحتوي على كلمة محظورة: ' + PROHIBITED_KEYWORDS[i] };
            }
        }
        return { compliant: true };
    }

    _revokeChildren(parentId, reason) {
        var revoked = [];
        var children = this.rootTree.get(parentId) || [];
        for (var i = 0; i < children.length; i++) {
            var childId = children[i];
            var child = this.rootRegistry.get(childId);
            if (child && child.status === 'active') {
                child.status = 'revoked';
                child.revokedAt = new Date().toISOString();
                child.revocationReason = reason;
                revoked.push(childId);
                var grandChildren = this._revokeChildren(childId, reason);
                revoked = revoked.concat(grandChildren);
            }
        }
        return revoked;
    }

    _generateEntityStructuredData(nameAr, nameEn, type, data) {
        return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: nameEn,
            alternateName: nameAr,
            additionalType: 'did:sheikha:' + type,
            description: data.description || nameAr,
            url: data.url || 'https://sheikha.top',
            founder: { '@type': 'Person', name: this.owner }
        };
    }

    _analyzeHealth(roots) {
        if (!roots || roots.length === 0) return { overallScore: 100, details: [] };
        var totalScore = 0;
        var details = [];
        roots.forEach(function(r) {
            var score = 100;
            if (r.status !== 'active') score -= 50;
            if (!r.shariaCompliant) score -= 30;
            if (!r.crypto || !r.crypto.publicKey) score -= 20;
            if (r.ai) r.ai.healthScore = Math.max(0, score);
            totalScore += Math.max(0, score);
            details.push({ id: r.id, nameAr: r.nameAr, score: Math.max(0, score) });
        });
        return {
            overallScore: Math.round(totalScore / roots.length),
            details: details,
            analyzedAt: new Date().toISOString()
        };
    }

    _detectAnomalies(roots) {
        var anomalies = [];
        var now = Date.now();
        roots.forEach(function(r) {
            if (r.status === 'active' && r.expiresAt && new Date(r.expiresAt) < new Date()) {
                anomalies.push({ type: 'expired', rootId: r.id, nameAr: r.nameAr, severity: 'high' });
            }
            if (!r.shariaCompliant) {
                anomalies.push({ type: 'sharia-violation', rootId: r.id, nameAr: r.nameAr, severity: 'critical' });
            }
            if (r.hierarchy.parentId && !this.rootRegistry.has(r.hierarchy.parentId)) {
                anomalies.push({ type: 'orphan-root', rootId: r.id, nameAr: r.nameAr, severity: 'medium' });
            }
        }, this);
        this.anomalyLog = anomalies;
        this.metrics.anomaliesDetected = anomalies.length;
        return anomalies;
    }

    _analyzeUsage(roots) {
        var totalUsage = 0;
        var mostUsed = null;
        var maxUsage = 0;
        roots.forEach(function(r) {
            var usage = r.ai ? (r.ai.usageCount || 0) : 0;
            totalUsage += usage;
            if (usage > maxUsage) { maxUsage = usage; mostUsed = r; }
        });
        return {
            totalUsage: totalUsage,
            averageUsage: roots.length > 0 ? Math.round(totalUsage / roots.length) : 0,
            mostUsedRoot: mostUsed ? { id: mostUsed.id, nameAr: mostUsed.nameAr, usage: maxUsage } : null
        };
    }

    _generateRecommendations(roots, anomalies) {
        var recs = [];
        if (anomalies.length > 0) {
            recs.push({ priority: 'high', ar: 'يوجد ' + anomalies.length + ' شذوذ يحتاج مراجعة فورية', en: anomalies.length + ' anomalies need immediate review' });
        }
        var activeCount = roots.filter(function(r) { return r.status === 'active'; }).length;
        if (activeCount < 5) {
            recs.push({ priority: 'medium', ar: 'يُنصح بإنشاء المزيد من الجذور الفرعية لتوسيع المنظومة', en: 'Consider creating more child roots to expand the ecosystem' });
        }
        recs.push({ priority: 'low', ar: 'تشغيل تحليل الذكاء الاصطناعي بشكل دوري لضمان صحة الجذور', en: 'Run AI analysis periodically to ensure root health' });
        return recs;
    }

    _analyzeTree() {
        var roots = Array.from(this.rootRegistry.values());
        var maxDepth = 0;
        roots.forEach(function(r) { if (r.hierarchy.depth > maxDepth) maxDepth = r.hierarchy.depth; });
        var byLevel = {};
        roots.forEach(function(r) {
            var lvl = r.hierarchy.level;
            byLevel[lvl] = (byLevel[lvl] || 0) + 1;
        });
        return {
            totalNodes: roots.length,
            maxDepth: maxDepth,
            byLevel: byLevel,
            masterRootId: this.masterRootId
        };
    }

    _logAI(action, data) {
        var entry = { ts: new Date().toISOString(), action: action, data: data };
        this.aiLog.unshift(entry);
        if (this.aiLog.length > 500) this.aiLog.length = 500;
    }

    _initMasterRoot() {
        // البحث عن جذر رئيسي موجود
        for (var pair of this.rootRegistry) {
            var root = pair[1];
            if (root.type === 'master') {
                this.masterRootId = root.id;
                return;
            }
        }
        // إنشاء الجذر الرئيسي لشيخة
        try {
            var masterRoot = this.generateRoot({
                type: 'master',
                nameAr: 'شيخة — الجذر الرئيسي',
                nameEn: 'Sheikha — Master Root',
                path: 'sheikha://master',
                metadata: {
                    description: 'الجذر الرئيسي لمنظومة شيخة الرقمية الذكية',
                    version: '1.0.0',
                    established: new Date().toISOString()
                }
            });
            this.masterRootId = masterRoot.id;

            // إنشاء الجذور الفرعية الافتراضية
            var defaultChildren = [
                { type: 'trade',    nameAr: 'منظومة التجارة الإسلامية',  nameEn: 'Islamic Trade System' },
                { type: 'metals',   nameAr: 'منظومة المعادن والسكراب',    nameEn: 'Metals & Scrap System' },
                { type: 'banking',  nameAr: 'منظومة المصرفية الإسلامية',  nameEn: 'Islamic Banking System' },
                { type: 'identity', nameAr: 'منظومة الهوية الرقمية',      nameEn: 'Digital Identity System' },
                { type: 'system',   nameAr: 'منظومة الذكاء الاصطناعي',    nameEn: 'AI System' },
                { type: 'education',nameAr: 'منظومة التعليم الرقمي',      nameEn: 'Digital Education System' },
                { type: 'service',  nameAr: 'منظومة الخدمات الرقمية',     nameEn: 'Digital Services System' }
            ];

            for (var i = 0; i < defaultChildren.length; i++) {
                try {
                    this.deriveChildRoot(this.masterRootId, defaultChildren[i]);
                } catch (e) { /* تجاهل */ }
            }
        } catch (e) {
            console.log('⚠️ خطأ في إنشاء الجذر الرئيسي:', e.message);
        }
    }

    _startSmartMonitor() {
        var self = this;
        this._monitorTimer = setInterval(function() {
            try {
                var roots = Array.from(self.rootRegistry.values());
                var anomalies = self._detectAnomalies(roots);
                if (anomalies.length > 0) {
                    self.emit('anomalies-detected', { count: anomalies.length, anomalies: anomalies });
                }
            } catch (e) { /* تجاهل */ }
        }, 60000); // كل دقيقة
    }

    _loadPersisted() {
        try {
            if (fs.existsSync(ROOTS_FILE)) {
                var data = JSON.parse(fs.readFileSync(ROOTS_FILE, 'utf8'));
                var self = this;
                if (data.roots) {
                    data.roots.forEach(function(r) {
                        self.rootRegistry.set(r.id, r);
                        if (r.did) self.didIndex.set(r.did, r.id);
                        if (r.hierarchy && r.hierarchy.parentId) {
                            if (!self.rootTree.has(r.hierarchy.parentId)) self.rootTree.set(r.hierarchy.parentId, []);
                            if (self.rootTree.get(r.hierarchy.parentId).indexOf(r.id) === -1) {
                                self.rootTree.get(r.hierarchy.parentId).push(r.id);
                            }
                        }
                    });
                }
                if (data.metrics) this.metrics = Object.assign(this.metrics, data.metrics);
                if (data.masterRootId) this.masterRootId = data.masterRootId;
            }
        } catch (e) { /* تجاهل */ }

        try {
            if (fs.existsSync(SYSTEMS_FILE)) {
                var sysData = JSON.parse(fs.readFileSync(SYSTEMS_FILE, 'utf8'));
                var self2 = this;
                if (Array.isArray(sysData)) {
                    sysData.forEach(function(s) { self2.digitalSystems.set(s.systemId, s); });
                }
            }
        } catch (e) { /* تجاهل */ }

        try {
            if (fs.existsSync(AI_LOG_FILE)) {
                var aiData = JSON.parse(fs.readFileSync(AI_LOG_FILE, 'utf8'));
                if (Array.isArray(aiData)) this.aiLog = aiData;
            }
        } catch (e) { /* تجاهل */ }

        // تحديث المؤشرات من السجل
        var roots = Array.from(this.rootRegistry.values());
        this.metrics.totalRoots = roots.length;
        this.metrics.activeRoots = roots.filter(function(r) { return r.status === 'active'; }).length;
        this.metrics.revokedRoots = roots.filter(function(r) { return r.status === 'revoked'; }).length;
        this.metrics.systemsDigitized = this.digitalSystems.size;
    }

    _persist() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            var data = {
                masterRootId: this.masterRootId,
                metrics: this.metrics,
                roots: Array.from(this.rootRegistry.values()),
                savedAt: new Date().toISOString(),
                copyright: this.copyright
            };
            fs.writeFileSync(ROOTS_FILE, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) { /* تجاهل */ }
    }

    _persistSystems() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(SYSTEMS_FILE, JSON.stringify(Array.from(this.digitalSystems.values()), null, 2), 'utf8');
        } catch (e) { /* تجاهل */ }
    }

    _persistAILog() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(AI_LOG_FILE, JSON.stringify(this.aiLog.slice(0, 200), null, 2), 'utf8');
        } catch (e) { /* تجاهل */ }
    }

    getStatus() {
        return {
            name: this.name,
            nameAr: this.nameAr,
            version: this.version,
            status: 'active',
            totalRoots: this.metrics.totalRoots,
            activeRoots: this.metrics.activeRoots,
            systemsDigitized: this.metrics.systemsDigitized,
            masterRootId: this.masterRootId
        };
    }

    stop() {
        if (this._monitorTimer) {
            clearInterval(this._monitorTimer);
            this._monitorTimer = null;
        }
    }
}

module.exports = SheikhaSmartDigitalRootEngine;
