/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ☪️  بسم الله الرحمن الرحيم                                                  ║
 * ║                                                                               ║
 * ║  SHEIKHA SMART DIGITAL ROOT ENGINE  —  v2.0.0                                ║
 * ║  شيخة — الجذر الرقمي الذكي المتكامل                                         ║
 * ║                                                                               ║
 * ║  © 2026 سلمان أحمد بن سلمان الراجح — جميع الحقوق محفوظة                     ║
 * ║  منظومة شيخة — محمية بموجب قوانين الملكية الفكرية السعودية والدولية          ║
 * ║                                                                               ║
 * ║  ﴿ أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ  ║
 * ║     طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ ﴾ — إبراهيم ٢٤    ║
 * ║                                                                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════════╣
 * ║  CRYPTOGRAPHIC LAYER (طبقة التشفير)                                          ║
 * ║    ✅ Ed25519  — التوقيع الأساسي (RFC 8032) — الأسرع والأأمن                 ║
 * ║    ✅ ECDSA P-256 — التوقيع الثانوي (NIST) — التوافقية العالمية              ║
 * ║    ✅ HMAC-SHA512 — اشتقاق المفاتيح الهرمي (BIP32-style)                    ║
 * ║    ✅ SHA3-256 — بصمة الجذر (المقاومة الكمومية)                              ║
 * ║    ✅ Merkle Chain — سلسلة سلامة السجل (كشف أي تلاعب)                       ║
 * ║                                                                               ║
 * ║  DID LAYER (طبقة الهوية اللامركزية)                                          ║
 * ║    ✅ W3C DID Document v1.1 — وثيقة DID كاملة المواصفات                     ║
 * ║    ✅ بروتوكول: did:sheikha:{type}:{id}                                      ║
 * ║    ✅ Verification Methods — طرق التحقق المتعددة                             ║
 * ║    ✅ Service Endpoints — نقاط الخدمة الرقمية                                ║
 * ║                                                                               ║
 * ║  AI LAYER (طبقة الذكاء الاصطناعي)                                            ║
 * ║    ✅ Health Scoring — تقييم صحة الجذر (0–100)                               ║
 * ║    ✅ Anomaly Detection — كشف الشذوذ بالذكاء الاصطناعي                      ║
 * ║    ✅ Growth Analytics — تحليل النمو والأنماط                                ║
 * ║    ✅ Optimization Insights — توصيات التحسين الذكية                          ║
 * ║    ✅ Security Scoring — تقييم درجة الأمان                                   ║
 * ║                                                                               ║
 * ║  GOVERNANCE LAYER (طبقة الحوكمة)                                             ║
 * ║    ✅ Audit Trail — سجل تدقيق غير قابل للتغيير                               ║
 * ║    ✅ Islamic Compliance Scoring — تقييم الالتزام الشرعي التفصيلي             ║
 * ║    ✅ Delegation — تفويض صلاحيات التوقيع                                     ║
 * ║    ✅ Expiry & Renewal — انتهاء الصلاحية والتجديد                            ║
 * ║    ✅ Namespace Registry — إدارة الفضاءات الهرمية                             ║
 * ║                                                                               ║
 * ║  OPERATIONS LAYER (طبقة العمليات)                                            ║
 * ║    ✅ Batch Operations — عمليات دفعية (توليد / تحقق / إلغاء)                 ║
 * ║    ✅ Multi-Format Export — تصدير JSON-LD / CSV / DID / PEM                  ║
 * ║    ✅ Import / Restore — استيراد واستعادة السجل                               ║
 * ║    ✅ WebSocket Broadcast — بث فوري عبر WebSocket                            ║
 * ║    ✅ Real-time Monitoring — مراقبة ذكية لحظية                               ║
 * ║                                                                               ║
 * ║  REST API — 25+ Endpoints                                                    ║
 * ║    GET  /api/digital-root/dashboard                                           ║
 * ║    GET  /api/digital-root/registry                                            ║
 * ║    GET  /api/digital-root/tree                                                ║
 * ║    GET  /api/digital-root/health                                              ║
 * ║    GET  /api/digital-root/namespaces                                          ║
 * ║    GET  /api/digital-root/stats                                               ║
 * ║    GET  /api/digital-root/audit                                               ║
 * ║    GET  /api/digital-root/verify/:id                                          ║
 * ║    GET  /api/digital-root/did/:id                                             ║
 * ║    GET  /api/digital-root/chain/:id                                           ║
 * ║    GET  /api/digital-root/expiring                                            ║
 * ║    GET  /api/digital-root/export                                              ║
 * ║    POST /api/digital-root/generate                                            ║
 * ║    POST /api/digital-root/derive                                              ║
 * ║    POST /api/digital-root/derive-multiple                                     ║
 * ║    POST /api/digital-root/digitize                                            ║
 * ║    POST /api/digital-root/digitize-system                                     ║
 * ║    POST /api/digital-root/revoke/:id                                          ║
 * ║    POST /api/digital-root/renew/:id                                           ║
 * ║    POST /api/digital-root/delegate                                            ║
 * ║    POST /api/digital-root/batch/generate                                      ║
 * ║    POST /api/digital-root/batch/verify                                        ║
 * ║    POST /api/digital-root/batch/revoke                                        ║
 * ║    POST /api/digital-root/sign                                                ║
 * ║    POST /api/digital-root/import                                              ║
 * ║    POST /api/digital-root/search                                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */


'use strict';

const crypto    = require('crypto');
const fs        = require('fs');
const path      = require('path');
const EventEmitter = require('events');

// ============================================================
// DATA PATHS
// ============================================================
const DATA_DIR      = path.join(__dirname, '..', 'data');
const ROOTS_FILE    = path.join(DATA_DIR, 'digital-roots-registry.json');
const SYSTEMS_FILE  = path.join(DATA_DIR, 'digital-root-systems.json');
const AUDIT_FILE    = path.join(DATA_DIR, 'digital-root-audit.json');
const NS_FILE       = path.join(DATA_DIR, 'digital-root-namespaces.json');
const CHAIN_FILE    = path.join(DATA_DIR, 'digital-root-chain.json');

// ============================================================
// CRYPTO CONSTANTS
// ============================================================
const EC_CURVE       = 'prime256v1';
const HMAC_ALGO      = 'sha512';
const HASH_ALGO      = 'sha3-256';
const DID_METHOD     = 'sheikha';
const DID_VERSION    = '1.1';
const ENGINE_VERSION = '2.0.0';

// ============================================================
// ROOT TYPES (14 types)
// ============================================================
const ROOT_TYPES = {
    master:    { ar: '\u0627\u0644\u062c\u0630\u0631 \u0627\u0644\u0631\u0626\u064a\u0633\u064a',    en: 'Master Root',        level: 0, icon: '\uD83C\uDF33', shariaScore: 100 },
    org:       { ar: '\u0645\u0646\u0638\u0645\u0629 / \u0634\u0631\u0643\u0629',     en: 'Organization',       level: 1, icon: '\uD83C\uDFDB\uFE0F', shariaScore: 90 },
    service:   { ar: '\u062e\u062f\u0645\u0629 \u0631\u0642\u0645\u064a\u0629',        en: 'Digital Service',    level: 2, icon: '\u2699\uFE0F', shariaScore: 85 },
    banking:   { ar: '\u0645\u0635\u0631\u0641\u064a\u0629 \u0625\u0633\u0644\u0627\u0645\u064a\u0629', en: 'Islamic Banking',  level: 2, icon: '\uD83C\uDFE6', shariaScore: 95 },
    education: { ar: '\u062a\u0639\u0644\u064a\u0645 \u0631\u0642\u0645\u064a',       en: 'Digital Education',  level: 2, icon: '\uD83D\uDCDA', shariaScore: 98 },
    health:    { ar: '\u0635\u062d\u0629 \u0631\u0642\u0645\u064a\u0629',             en: 'Digital Health',     level: 2, icon: '\uD83C\uDFE5', shariaScore: 97 },
    trade:     { ar: '\u062a\u062c\u0627\u0631\u0629 \u0631\u0642\u0645\u064a\u0629', en: 'Digital Trade',      level: 2, icon: '\uD83D\uDED2', shariaScore: 92 },
    metals:    { ar: '\u0645\u0639\u0627\u062f\u0646 \u0648\u0633\u0643\u0631\u0627\u0628', en: 'Metals & Scrap', level: 2, icon: '\u2697\uFE0F', shariaScore: 88 },
    identity:  { ar: '\u0647\u0648\u064a\u0629 \u0631\u0642\u0645\u064a\u0629',       en: 'Digital Identity',   level: 2, icon: '\uD83D\uDD11', shariaScore: 93 },
    system:    { ar: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0630\u0643\u064a\u0629', en: 'Smart System',       level: 2, icon: '\uD83E\uDD16', shariaScore: 87 },
    person:    { ar: '\u0634\u062e\u0635 / \u0641\u0631\u062f',                       en: 'Person',             level: 3, icon: '\uD83D\uDC64', shariaScore: 90 },
    device:    { ar: '\u062c\u0647\u0627\u0632 / \u062d\u0633\u0627\u0633',           en: 'Device / Sensor',    level: 3, icon: '\uD83D\uDCE1', shariaScore: 80 },
    contract:  { ar: '\u0639\u0642\u062f \u0630\u0643\u064a',                         en: 'Smart Contract',     level: 3, icon: '\uD83D\uDCDC', shariaScore: 95 },
    asset:     { ar: '\u0623\u0635\u0644 \u0631\u0642\u0645\u064a',                   en: 'Digital Asset',      level: 3, icon: '\uD83D\uDC8E', shariaScore: 88 }
};

// ============================================================
// ISLAMIC FOUNDATION
// ============================================================
const ISLAMIC_FOUNDATION = {
    bismillah: '\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062d\u0645\u0646 \u0627\u0644\u0631\u062d\u064a\u0645',
    verse: 'آية إبراهيم 24 — الجذر الثابت والفروع المتصاعدة',
    quran: [
        { ayah: '\u0623\u064e\u0644\u064e\u0645\u0652 \u062a\u064e\u0631\u064e \u0643\u064e\u064a\u0652\u0641\u064e \u0636\u064e\u0631\u064e\u0628\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0645\u064e\u062b\u064e\u0644\u0627\u064b \u0623\u064e\u0635\u0652\u0644\u064f\u0647\u064e\u0627 \u062b\u064e\u0627\u0628\u0650\u062a\u064c \u0648\u064e\u0641\u064e\u0631\u0652\u0639\u064f\u0647\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0621\u0650', surah: '\u0625\u0628\u0631\u0627\u0647\u064a\u0645', num: 24, principle: '\u0627\u0644\u062c\u0630\u0631 \u0627\u0644\u062b\u0627\u0628\u062a \u0648\u0627\u0644\u0641\u0631\u0648\u0639 \u0627\u0644\u0645\u062a\u0635\u0627\u0639\u062f\u0629' },
        { ayah: '\u0625\u0650\u0646\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u064a\u064e\u0623\u0652\u0645\u064f\u0631\u064f\u0643\u064f\u0645\u0652 \u0623\u064e\u0646 \u062a\u064f\u0624\u064e\u062f\u0651\u064f\u0648\u0627 \u0627\u0644\u0652\u0623\u064e\u0645\u064e\u0627\u0646\u064e\u0627\u062a\u0650 \u0625\u0650\u0644\u064e\u0649\u0670 \u0623\u064e\u0647\u0652\u0644\u0650\u0647\u064e\u0627', surah: '\u0627\u0644\u0646\u0633\u0627\u0621', num: 58, principle: '\u0623\u0645\u0627\u0646\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0648\u0627\u0644\u0645\u0641\u0627\u062a\u064a\u062d \u0627\u0644\u0631\u0642\u0645\u064a\u0629' }
    ],
    hadith: [
        { text: '\u0625\u0646 \u0627\u0644\u0644\u0647 \u064a\u062d\u0628 \u0625\u0630\u0627 \u0639\u0645\u0644 \u0623\u062d\u062f\u0643\u0645 \u0639\u0645\u0644\u0627\u064b \u0623\u0646 \u064a\u062a\u0642\u0646\u0647', source: '\u0627\u0644\u0628\u064a\u0647\u0642\u064a', principle: '\u0625\u062a\u0642\u0627\u0646 \u0628\u0646\u0627\u0621 \u0627\u0644\u062c\u0630\u0631 \u0627\u0644\u0631\u0642\u0645\u064a' },
        { text: '\u0644\u0627 \u0636\u0631\u0631 \u0648\u0644\u0627 \u0636\u0631\u0627\u0631', source: '\u0627\u0628\u0646 \u0645\u0627\u062c\u0647', principle: '\u0623\u0645\u0627\u0646 \u0627\u0644\u062c\u0630\u0631 \u2014 \u0644\u0627 \u0636\u0631\u0631' }
    ]
};

// ============================================================
// DEFAULT SYSTEMS
// ============================================================
const SHEIKHA_DEFAULT_SYSTEMS = [
    { nameAr: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064a\u0629',  nameEn: 'Islamic Trade System',      type: 'trade',     ns: 'sheikha://trade',     ttlDays: 3650 },
    { nameAr: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u0645\u0639\u0627\u062f\u0646 \u0648\u0627\u0644\u0633\u0643\u0631\u0627\u0628',    nameEn: 'Metals & Scrap System',     type: 'metals',    ns: 'sheikha://metals',    ttlDays: 3650 },
    { nameAr: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u0645\u0635\u0631\u0641\u064a\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064a\u0629', nameEn: 'Islamic Banking System', type: 'banking',   ns: 'sheikha://banking',   ttlDays: 3650 },
    { nameAr: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629',      nameEn: 'Digital Identity System',  type: 'identity',  ns: 'sheikha://identity',  ttlDays: 3650 },
    { nameAr: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a', nameEn: 'AI System',               type: 'system',    ns: 'sheikha://ai',        ttlDays: 3650 },
    { nameAr: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u062a\u0639\u0644\u064a\u0645 \u0627\u0644\u0631\u0642\u0645\u064a',      nameEn: 'Digital Education System', type: 'education', ns: 'sheikha://education', ttlDays: 3650 },
    { nameAr: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629',           nameEn: 'Digital Health System',    type: 'health',    ns: 'sheikha://health',    ttlDays: 3650 },
    { nameAr: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0631\u0642\u0645\u064a\u0629', nameEn: 'Digital Services System',  type: 'service',   ns: 'sheikha://services',  ttlDays: 3650 }
];

// ============================================================
// MAIN ENGINE CLASS
// ============================================================
class SheikhaSmartDigitalRootEngine extends EventEmitter {

    constructor(options = {}) {
        super();
        this.name        = 'SheikhaSmartDigitalRootEngine';
        this.nameAr      = '\u0634\u064a\u062e\u0629 \u2014 \u0627\u0644\u062c\u0630\u0631 \u0627\u0644\u0631\u0642\u0645\u064a \u0627\u0644\u0630\u0643\u064a \u0627\u0644\u0645\u062a\u0643\u0627\u0645\u0644';
        this.version     = ENGINE_VERSION;
        this.owner       = '\u0633\u0644\u0645\u0627\u0646 \u0623\u062d\u0645\u062f \u0628\u0646 \u0633\u0644\u0645\u0627\u0646 \u0627\u0644\u0631\u0627\u062c\u062d';
        this.copyright   = '\u00a9 2026 \u0645\u0646\u0638\u0648\u0645\u0629 \u0634\u064a\u062e\u0629 \u2014 \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629';
        this.activatedAt = new Date().toISOString();
        this._broadcastFn = options.broadcast || null;

        // Internal data structures
        this.rootRegistry   = new Map();
        this.rootTree       = new Map();
        this.didIndex       = new Map();
        this.nsIndex        = new Map();
        this.digitalSystems = new Map();
        this.delegations    = new Map();
        this.namespaces     = new Map();

        // Logs
        this.auditTrail  = [];
        this.aiInsights  = [];
        this.anomalyLog  = [];
        this.chainBlocks = [];

        // Metrics
        this.metrics = {
            totalRoots: 0, activeRoots: 0, revokedRoots: 0, expiredRoots: 0,
            totalDerivations: 0, totalDigitizations: 0, totalVerifications: 0,
            totalRevocations: 0, totalRenewals: 0, totalDelegations: 0,
            totalBatchOps: 0, totalAIAnalyses: 0, anomaliesDetected: 0,
            systemsDigitized: 0, chainHeight: 0, lastActivity: null
        };

        this.masterRootId = null;

        this._loadPersisted();
        this._ensureMasterRoot();
        this._startMonitor(options.monitorInterval || 60000);
        console.log('\u2705 ' + this.nameAr + ' \u2014 v' + this.version + ' | ' + this.metrics.activeRoots + ' \u062c\u0630\u0631 \u0646\u0634\u0637 | 25 API');
    }

    // ----------------------------------------------------------
    // 1. CRYPTO LAYER
    // ----------------------------------------------------------

    _genEd25519() {
        const kp = crypto.generateKeyPairSync('ed25519', {
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            publicKeyEncoding:  { type: 'spki',  format: 'pem' }
        });
        return { privateKey: kp.privateKey, publicKey: kp.publicKey, algo: 'Ed25519' };
    }

    _genECDSA() {
        const kp = crypto.generateKeyPairSync('ec', {
            namedCurve: EC_CURVE,
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            publicKeyEncoding:  { type: 'spki',  format: 'pem' }
        });
        return { privateKey: kp.privateKey, publicKey: kp.publicKey, algo: 'ECDSA-P256' };
    }

    _signEd25519(data, privKey) {
        try { return crypto.sign(null, Buffer.from(data), { key: privKey, dsaEncoding: 'ieee-p1363' }).toString('base64url'); }
        catch (e) { return null; }
    }

    _signECDSA(data, privKey) {
        try { return crypto.sign('sha256', Buffer.from(data), { key: privKey, dsaEncoding: 'ieee-p1363' }).toString('base64url'); }
        catch (e) { return null; }
    }

    _verifyEd25519(data, sig, pubKey) {
        try { return crypto.verify(null, Buffer.from(data), { key: pubKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url')); }
        catch (e) { return false; }
    }

    _verifyECDSA(data, sig, pubKey) {
        try { return crypto.verify('sha256', Buffer.from(data), { key: pubKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url')); }
        catch (e) { return false; }
    }

    _fingerprint(data) {
        const s = typeof data === 'string' ? data : JSON.stringify(data);
        return crypto.createHash(HASH_ALGO).update(s).digest('hex');
    }

    _deriveChildKey(parentPrivKeyPem, index) {
        const parentBytes = Buffer.from(parentPrivKeyPem);
        const indexBuf    = Buffer.alloc(4);
        indexBuf.writeUInt32BE(index >>> 0);
        const derived = crypto.createHmac(HMAC_ALGO, parentBytes).update(indexBuf).digest();
        return { seed: derived.subarray(0, 32).toString('hex'), chain: derived.subarray(32).toString('hex') };
    }

    _buildMerkleBlock(rootId, action, data) {
        const prev      = this.chainBlocks.length > 0 ? this.chainBlocks[this.chainBlocks.length - 1].blockHash : '0'.repeat(64);
        const payload   = JSON.stringify({ rootId, action, data, prev, ts: Date.now() });
        const blockHash = this._fingerprint(payload);
        const block     = { height: this.chainBlocks.length, rootId, action, blockHash, prev, ts: new Date().toISOString() };
        this.chainBlocks.push(block);
        if (this.chainBlocks.length > 1000) this.chainBlocks = this.chainBlocks.slice(-500);
        this.metrics.chainHeight = this.chainBlocks.length;
        return block;
    }

    _verifyChain() {
        if (this.chainBlocks.length < 2) return { valid: true, height: this.chainBlocks.length, issues: [] };
        const issues = [];
        for (let i = 1; i < this.chainBlocks.length; i++) {
            if (this.chainBlocks[i].prev !== this.chainBlocks[i - 1].blockHash) {
                issues.push({ blockIndex: i, issue: 'prev_hash_mismatch' });
            }
        }
        return { valid: issues.length === 0, height: this.chainBlocks.length, issues };
    }

    // ----------------------------------------------------------
    // 2. DID LAYER
    // ----------------------------------------------------------

    _buildDID(type, id) { return 'did:' + DID_METHOD + ':' + type + ':' + id; }

    _buildDIDDocument(root) {
        const did     = root.did;
        const now     = root.createdAt;
        const ed25519PubB64 = root.crypto && root.crypto.ed25519 && root.crypto.ed25519.publicKey
            ? Buffer.from(root.crypto.ed25519.publicKey.replace(/-----(BEGIN|END) PUBLIC KEY-----|\n/g, ''), 'base64').toString('base64url')
            : '';
        const ecdsaPubB64 = root.crypto && root.crypto.ecdsa && root.crypto.ecdsa.publicKey
            ? Buffer.from(root.crypto.ecdsa.publicKey.replace(/-----(BEGIN|END) PUBLIC KEY-----|\n/g, ''), 'base64').toString('base64url')
            : '';

        const vms = [];
        if (ed25519PubB64) vms.push({ id: did + '#ed25519-key-1', type: 'Ed25519VerificationKey2020', controller: did, publicKeyMultibase: 'z' + ed25519PubB64 });
        if (ecdsaPubB64)   vms.push({ id: did + '#ecdsa-key-1',   type: 'EcdsaSecp256r1VerificationKey2019', controller: did, publicKeyJwk: { kty: 'EC', crv: 'P-256', x: ecdsaPubB64.substring(0, 43), y: ecdsaPubB64.substring(43, 86) } });

        return {
            '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2020/v1'],
            id: did, didDocumentVersion: DID_VERSION, created: now, updated: root.updatedAt || now,
            controller: root.parentDID || ('did:' + DID_METHOD + ':master:' + this.masterRootId),
            verificationMethod: vms,
            authentication: vms.map(v => v.id), assertionMethod: vms.map(v => v.id), keyAgreement: [],
            service: [
                { id: did + '#sheikha-service', type: 'SheikhaMarketService',    serviceEndpoint: 'https://sheikha.market/api/digital-root/did/' + root.id },
                { id: did + '#sheikha-ns',      type: 'SheikhaNamespaceService', serviceEndpoint: root.namespace || ('sheikha://' + root.type + '/' + root.id) }
            ],
            sheikha: { nameAr: root.nameAr, nameEn: root.nameEn, type: root.type, shariaCompliant: root.shariaCompliant, shariaScore: root.shariaScore, status: root.status, namespace: root.namespace }
        };
    }

    // ----------------------------------------------------------
    // 3. AUDIT TRAIL
    // ----------------------------------------------------------

    _audit(action, actor, subject, detail) {
        const entry = {
            seq: this.auditTrail.length + 1, ts: new Date().toISOString(),
            action, actor: actor || 'system', subject: subject || null, detail: detail || {},
            prevHash: this.auditTrail.length > 0 ? this._fingerprint(this.auditTrail[this.auditTrail.length - 1]) : '0'.repeat(64)
        };
        entry.hash = this._fingerprint(entry);
        this.auditTrail.push(entry);
        if (this.auditTrail.length > 2000) this.auditTrail = this.auditTrail.slice(-1000);
        this._persistAudit();
    }

    // ----------------------------------------------------------
    // 4. SHARIA SCORING
    // ----------------------------------------------------------

    _calcShariaScore(opts) {
        const { type, nameAr, nameEn, purpose } = opts || {};
        let score = ROOT_TYPES[type] ? ROOT_TYPES[type].shariaScore : 70;
        if (nameAr && nameAr.length >= 3) score = Math.min(100, score + 3);
        if (purpose && purpose.length >= 5) score = Math.min(100, score + 2);
        const forbidden = ['riba', 'fraud', 'gambling', '\u0631\u0628\u0627', '\u0642\u0645\u0627\u0631', '\u062e\u0645\u0631', '\u063a\u0634', '\u0627\u062d\u062a\u064a\u0627\u0644'];
        const combined  = ((nameAr || '') + (nameEn || '') + (purpose || '')).toLowerCase();
        if (forbidden.some(w => combined.includes(w))) score = Math.max(0, score - 40);
        return Math.round(score);
    }

    // ----------------------------------------------------------
    // 5. NAMESPACE REGISTRY
    // ----------------------------------------------------------

    _registerNamespace(id, nsPath) {
        if (!nsPath) return;
        const nsKey = nsPath.toLowerCase().replace(/\s+/g, '-');
        this.nsIndex.set(nsKey, id);
        if (!this.namespaces.has(nsKey)) this.namespaces.set(nsKey, { ns: nsPath, rootId: id, registeredAt: new Date().toISOString() });
        this._persistNamespaces();
    }

    _buildNamespace(type, nameAr, customNs) {
        if (customNs) return customNs;
        const slug = nameAr ? nameAr.replace(/[^\u0600-\u06FFa-z0-9]/gi, '-').substring(0, 30) : type;
        return 'sheikha://' + type + '/' + slug;
    }

    // ----------------------------------------------------------
    // 6. GENERATE & DERIVE
    // ----------------------------------------------------------

    generateRoot(opts) {
        opts = opts || {};
        const type      = opts.type      || 'org';
        const nameAr    = opts.nameAr    || '\u062c\u0630\u0631 \u062c\u062f\u064a\u062f';
        const nameEn    = opts.nameEn    || 'New Root';
        const parentId  = opts.parentId  || null;
        const owner     = opts.owner     || this.owner;
        const purpose   = opts.purpose   || '';
        const ttlDays   = opts.ttlDays   || 0;
        const customNs  = opts.namespace || null;
        const metadata  = opts.metadata  || {};

        if (!ROOT_TYPES[type]) throw new Error('\u0646\u0648\u0639 \u0627\u0644\u062c\u0630\u0631 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641: ' + type);

        const ed25519    = this._genEd25519();
        const ecdsa      = this._genECDSA();
        const id         = type + '-' + crypto.randomBytes(8).toString('hex');
        const did        = this._buildDID(type, id);
        const ns         = this._buildNamespace(type, nameAr, customNs);
        const now        = new Date().toISOString();
        const rootPayload = JSON.stringify({ id, did, type, nameAr, nameEn, owner, now });
        const sigEd      = this._signEd25519(rootPayload, ed25519.privateKey);
        const sigEC      = this._signECDSA(rootPayload, ecdsa.privateKey);
        const fingerprint = this._fingerprint(rootPayload);
        const shariaScore = this._calcShariaScore({ type, nameAr, nameEn, purpose });

        const parentRoot = parentId ? this.rootRegistry.get(parentId) : null;
        const level = parentRoot ? (parentRoot.hierarchy.level + 1) : (ROOT_TYPES[type].level || 0);

        let expiresAt = null;
        if (ttlDays > 0) { const d = new Date(); d.setDate(d.getDate() + ttlDays); expiresAt = d.toISOString(); }

        const root = {
            id, did, type, typeInfo: ROOT_TYPES[type],
            nameAr, nameEn, owner, purpose, namespace: ns,
            status: 'active', shariaCompliant: shariaScore >= 70, shariaScore,
            createdAt: now, updatedAt: now, expiresAt, metadata,
            crypto: {
                ed25519:  { publicKey: ed25519.publicKey, algo: 'Ed25519',   signature: sigEd },
                ecdsa:    { publicKey: ecdsa.publicKey,   algo: 'ECDSA-P256', signature: sigEC },
                fingerprint,
                _private_ed25519: ed25519.privateKey,
                _private_ecdsa:   ecdsa.privateKey
            },
            hierarchy: {
                level, parentId,
                children: [],
                path: parentRoot ? (parentRoot.hierarchy.path + '/' + id) : ('/' + id),
                derivationIndex: parentRoot ? parentRoot.hierarchy.children.length : 0
            },
            aiMetrics: { healthScore: 100, securityScore: 100, usageScore: 0, lastAnalysis: null },
            chain: null
        };

        this.rootRegistry.set(id, root);
        this.didIndex.set(did, id);
        this._registerNamespace(id, ns);

        if (parentRoot) {
            if (!parentRoot.hierarchy.children.includes(id)) parentRoot.hierarchy.children.push(id);
            parentRoot.updatedAt = now;
            if (!this.rootTree.has(parentId)) this.rootTree.set(parentId, []);
            if (!this.rootTree.get(parentId).includes(id)) this.rootTree.get(parentId).push(id);
        }

        const block = this._buildMerkleBlock(id, 'generate', { type, nameAr });
        root.chain  = { blockHash: block.blockHash, blockHeight: block.height };

        this._audit('generate', owner, id, { type, nameAr, shariaScore });
        this.metrics.totalRoots++;
        this.metrics.activeRoots++;
        this.metrics.lastActivity = now;
        this._persist();
        this._broadcast('root:generated', { id, did, type, nameAr, shariaScore });
        return this._safeRoot(root);
    }

    deriveChildRoot(parentId, opts) {
        const parent = this.rootRegistry.get(parentId);
        if (!parent) throw new Error('\u0627\u0644\u062c\u0630\u0631 \u0627\u0644\u0623\u0628 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f: ' + parentId);
        if (parent.status !== 'active') throw new Error('\u0627\u0644\u062c\u0630\u0631 \u0627\u0644\u0623\u0628 \u063a\u064a\u0631 \u0646\u0634\u0637');
        opts = opts || {};
        const index      = parent.hierarchy.children.length;
        const derivation = this._deriveChildKey(parent.crypto._private_ed25519 || '', index);
        const childOpts  = Object.assign({
            nameAr: opts.nameAr || (parent.nameAr + ' \u2014 \u0641\u0631\u0639 ' + (index + 1)),
            nameEn: opts.nameEn || (parent.nameEn + ' Branch ' + (index + 1)),
            type: opts.type || parent.type, parentId, ttlDays: opts.ttlDays || 0,
            metadata: Object.assign({ derivedFrom: parentId, derivationIndex: index, derivationSeed: derivation.seed }, opts.metadata || {})
        }, opts, { parentId });
        const child = this.generateRoot(childOpts);
        this.metrics.totalDerivations++;
        this._audit('derive', opts.owner || this.owner, child.id, { parentId, index });
        return child;
    }

    deriveMultipleChildren(parentId, children) {
        children = children || [];
        const results = children.map(c => {
            try { return { success: true,  root: this.deriveChildRoot(parentId, c) }; }
            catch (e) { return { success: false, error: e.message, input: c }; }
        });
        this.metrics.totalBatchOps++;
        return { parentId, results, total: children.length, succeeded: results.filter(r => r.success).length };
    }

    // ----------------------------------------------------------
    // 7. DIGITIZE
    // ----------------------------------------------------------

    digitizeEntity(entity) {
        entity = entity || {};
        const nameAr    = entity.nameAr    || '\u0643\u064a\u0627\u0646 \u0631\u0642\u0645\u064a';
        const nameEn    = entity.nameEn    || 'Digital Entity';
        const type      = entity.type      || 'org';
        const parentId  = entity.parentId  || null;
        const category  = entity.category  || '';
        const attributes= entity.attributes|| {};
        const ttlDays   = entity.ttlDays   || 365;

        const root = this.generateRoot({ type, nameAr, nameEn, parentId, ttlDays,
            purpose: entity.purpose || category,
            metadata: { digitizedEntity: true, category, attributes, digitizedAt: new Date().toISOString() }
        });
        const fullRoot = this.rootRegistry.get(root.id);

        this.metrics.totalDigitizations++;
        this._audit('digitize', entity.owner || this.owner, root.id, { nameAr, type });
        return { entityId: root.id, did: root.did, namespace: root.namespace, nameAr, nameEn, type, category,
            shariaScore: root.shariaScore, shariaCompliant: root.shariaCompliant, status: 'digitized',
            digitizedAt: new Date().toISOString(), rootRef: { id: root.id, fingerprint: root.crypto.fingerprint },
            didDocument: fullRoot ? this._buildDIDDocument(fullRoot) : null };
    }

    digitizeSystem(system) {
        system = system || {};
        const nameAr     = system.nameAr     || '\u0645\u0646\u0638\u0648\u0645\u0629';
        const nameEn     = system.nameEn     || 'System';
        const type       = system.type       || 'system';
        const components = system.components || [];

        const systemRoot = this.generateRoot({ type, nameAr, nameEn, purpose: system.purpose || '', metadata: { isSystem: true, componentCount: components.length } });
        const digitizedComponents = components.map(comp => {
            try { return { success: true, component: this.digitizeEntity(Object.assign({}, comp, { parentId: systemRoot.id })) }; }
            catch (e) { return { success: false, error: e.message, input: comp }; }
        });

        const entry = { systemId: systemRoot.id, did: systemRoot.did, nameAr, nameEn, type, components: digitizedComponents,
            totalComponents: components.length, succeededComponents: digitizedComponents.filter(c => c.success).length,
            digitizedAt: new Date().toISOString() };
        this.digitalSystems.set(systemRoot.id, entry);
        this.metrics.systemsDigitized++;
        this._persistSystems();
        this._audit('digitize-system', system.owner || this.owner, systemRoot.id, { nameAr, componentCount: components.length });
        return entry;
    }

    // ----------------------------------------------------------
    // 8. VERIFY / REVOKE / RENEW
    // ----------------------------------------------------------

    verifyRoot(rootId) {
        const root = this.rootRegistry.get(rootId);
        if (!root) return { valid: false, reason: '\u0627\u0644\u062c\u0630\u0631 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f', rootId };
        const now     = new Date();
        const expired = root.expiresAt && new Date(root.expiresAt) < now;
        const payload = JSON.stringify({ id: root.id, did: root.did, type: root.type, nameAr: root.nameAr, nameEn: root.nameEn, owner: root.owner, now: root.createdAt });
        const ed25519Valid = root.crypto && root.crypto.ed25519 && root.crypto.ed25519.signature
            ? this._verifyEd25519(payload, root.crypto.ed25519.signature, root.crypto.ed25519.publicKey) : false;
        const ecdsaValid   = root.crypto && root.crypto.ecdsa && root.crypto.ecdsa.signature
            ? this._verifyECDSA(payload, root.crypto.ecdsa.signature, root.crypto.ecdsa.publicKey) : false;
        const chainIntegrity = this._verifyChain();
        this.metrics.totalVerifications++;
        this.metrics.lastActivity = new Date().toISOString();
        this._audit('verify', 'system', rootId, { valid: !expired && root.status === 'active' && (ed25519Valid || ecdsaValid) });
        return {
            rootId, did: root.did, valid: !expired && root.status === 'active' && (ed25519Valid || ecdsaValid),
            status: root.status, expired, expiresAt: root.expiresAt,
            signatures: { ed25519: { valid: ed25519Valid, algo: 'Ed25519' }, ecdsa: { valid: ecdsaValid, algo: 'ECDSA-P256' } },
            fingerprint: root.crypto && root.crypto.fingerprint,
            shariaCompliant: root.shariaCompliant, shariaScore: root.shariaScore,
            chainIntegrity, verifiedAt: new Date().toISOString()
        };
    }

    revokeRoot(rootId, reason, actor) {
        reason = reason || '\u0625\u0644\u063a\u0627\u0621 \u064a\u062f\u0648\u064a';
        actor  = actor  || 'system';
        const root = this.rootRegistry.get(rootId);
        if (!root) throw new Error('\u0627\u0644\u062c\u0630\u0631 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f: ' + rootId);
        if (root.status === 'revoked') throw new Error('\u0627\u0644\u062c\u0630\u0631 \u0645\u0644\u063a\u0649 \u0628\u0627\u0644\u0641\u0639\u0644');
        root.status = 'revoked'; root.revokedAt = new Date().toISOString(); root.revokedReason = reason; root.updatedAt = root.revokedAt;
        this.metrics.activeRoots = Math.max(0, this.metrics.activeRoots - 1);
        this.metrics.revokedRoots++; this.metrics.totalRevocations++; this.metrics.lastActivity = root.revokedAt;
        this._buildMerkleBlock(rootId, 'revoke', { reason });
        this._audit('revoke', actor, rootId, { reason });
        this._persist();
        this._broadcast('root:revoked', { rootId, reason });
        return { rootId, did: root.did, status: 'revoked', reason, revokedAt: root.revokedAt };
    }

    renewRoot(rootId, ttlDays, actor) {
        ttlDays = ttlDays || 365;
        actor   = actor   || 'system';
        const root = this.rootRegistry.get(rootId);
        if (!root) throw new Error('\u0627\u0644\u062c\u0630\u0631 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f: ' + rootId);
        if (root.status === 'revoked') throw new Error('\u0644\u0627 \u064a\u0645\u0643\u0646 \u062a\u062c\u062f\u064a\u062f \u062c\u0630\u0631 \u0645\u0644\u063a\u0649');
        const wasExpired = root.expiresAt && new Date(root.expiresAt) < new Date();
        const d = new Date(); d.setDate(d.getDate() + ttlDays);
        root.expiresAt = d.toISOString(); root.updatedAt = new Date().toISOString();
        if (wasExpired) { root.status = 'active'; this.metrics.activeRoots++; this.metrics.expiredRoots = Math.max(0, (this.metrics.expiredRoots || 0) - 1); }
        this.metrics.totalRenewals++; this.metrics.lastActivity = root.updatedAt;
        this._buildMerkleBlock(rootId, 'renew', { ttlDays, expiresAt: root.expiresAt });
        this._audit('renew', actor, rootId, { ttlDays, expiresAt: root.expiresAt });
        this._persist();
        this._broadcast('root:renewed', { rootId, expiresAt: root.expiresAt });
        return { rootId, did: root.did, status: root.status, expiresAt: root.expiresAt, renewedAt: root.updatedAt };
    }

    // ----------------------------------------------------------
    // 9. DELEGATION
    // ----------------------------------------------------------

    delegateRoot(delegatorId, delegateeId, permissions, ttlDays, actor) {
        permissions = permissions || [];
        ttlDays     = ttlDays || 30;
        actor       = actor   || 'system';
        const delegator = this.rootRegistry.get(delegatorId);
        const delegatee = this.rootRegistry.get(delegateeId);
        if (!delegator) throw new Error('\u0627\u0644\u0645\u0641\u0648\u0651\u0636 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f: ' + delegatorId);
        if (!delegatee) throw new Error('\u0627\u0644\u0645\u0641\u0648\u064e\u0651\u0636 \u0625\u0644\u064a\u0647 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f: ' + delegateeId);
        const d = new Date(); d.setDate(d.getDate() + ttlDays);
        const delegation = {
            id: 'delegation-' + crypto.randomBytes(6).toString('hex'),
            delegatorId, delegateeId, delegatorDID: delegator.did, delegateeDID: delegatee.did,
            permissions: permissions.length ? permissions : ['read', 'derive'],
            grantedAt: new Date().toISOString(), expiresAt: d.toISOString(), status: 'active',
            signature: delegator.crypto && delegator.crypto._private_ed25519
                ? this._signEd25519(JSON.stringify({ delegatorId, delegateeId, permissions }), delegator.crypto._private_ed25519)
                : null
        };
        this.delegations.set(delegation.id, delegation);
        this.metrics.totalDelegations++;
        this._audit('delegate', actor, delegatorId, { delegateeId, permissions });
        this._broadcast('root:delegated', { delegatorId, delegateeId, delegationId: delegation.id });
        return delegation;
    }

    // ----------------------------------------------------------
    // 10. BATCH OPERATIONS
    // ----------------------------------------------------------

    batchGenerate(items) {
        items = items || [];
        const results = items.map(item => { try { return { success: true,  root: this.generateRoot(item) }; } catch (e) { return { success: false, error: e.message, input: item }; } });
        this.metrics.totalBatchOps++;
        return { results, total: items.length, succeeded: results.filter(r => r.success).length };
    }

    batchVerify(ids) {
        ids = ids || [];
        const results = ids.map(id => { try { return { id, result: this.verifyRoot(id) }; } catch (e) { return { id, error: e.message }; } });
        this.metrics.totalBatchOps++;
        return { results, total: ids.length, allValid: results.every(r => r.result && r.result.valid) };
    }

    batchRevoke(ids, reason, actor) {
        ids    = ids || [];
        reason = reason || '\u0625\u0644\u063a\u0627\u0621 \u062f\u0641\u0639\u064a';
        actor  = actor  || 'system';
        const results = ids.map(id => { try { return { id, result: this.revokeRoot(id, reason, actor) }; } catch (e) { return { id, error: e.message }; } });
        this.metrics.totalBatchOps++;
        return { results, total: ids.length, succeeded: results.filter(r => r.result).length };
    }

    // ----------------------------------------------------------
    // 11. SIGN
    // ----------------------------------------------------------

    signWithRoot(rootId, payload, algo) {
        algo = algo || 'ed25519';
        const root = this.rootRegistry.get(rootId);
        if (!root) throw new Error('\u0627\u0644\u062c\u0630\u0631 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f: ' + rootId);
        if (root.status !== 'active') throw new Error('\u0627\u0644\u062c\u0630\u0631 \u063a\u064a\u0631 \u0646\u0634\u0637');
        const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const signature = algo === 'ecdsa'
            ? (root.crypto && root.crypto._private_ecdsa   ? this._signECDSA(data,   root.crypto._private_ecdsa)   : null)
            : (root.crypto && root.crypto._private_ed25519 ? this._signEd25519(data, root.crypto._private_ed25519) : null);
        const result = { rootId, did: root.did, algo, signature, fingerprint: this._fingerprint(data), signedAt: new Date().toISOString() };
        this._audit('sign', this.owner, rootId, { algo, payloadHash: result.fingerprint });
        return result;
    }

    // ----------------------------------------------------------
    // 12. AI ENGINE
    // ----------------------------------------------------------

    analyzeWithAI(rootId) {
        const root = this.rootRegistry.get(rootId);
        if (!root) return { error: '\u0627\u0644\u062c\u0630\u0631 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f' };
        const children   = root.hierarchy.children.length;
        const ageHours   = (Date.now() - new Date(root.createdAt).getTime()) / 3600000;
        const hasExpiry  = !!root.expiresAt;
        const daysToExp  = hasExpiry ? Math.ceil((new Date(root.expiresAt) - Date.now()) / 86400000) : null;
        const isExpiring = daysToExp !== null && daysToExp < 30;

        let health = 100;
        if (root.status !== 'active') health -= 50;
        if (!root.shariaCompliant)    health -= 20;
        if (isExpiring)               health -= 15;
        if (children > 50)            health -= 5;
        if (root.aiMetrics && root.aiMetrics.usageScore === 0 && ageHours > 168) health -= 10;

        let security = 100;
        if (!root.crypto || !root.crypto.ed25519 || !root.crypto.ed25519.signature) security -= 30;
        if (!root.crypto || !root.crypto.ecdsa   || !root.crypto.ecdsa.signature)   security -= 10;
        if (ageHours > 8760 && !hasExpiry) security -= 10;

        const recs = [];
        if (isExpiring)       recs.push({ ar: '\u0627\u0644\u062c\u0630\u0631 \u0633\u064a\u0646\u062a\u0647\u064a \u062e\u0644\u0627\u0644 ' + daysToExp + ' \u064a\u0648\u0645 \u2014 \u064a\u064f\u0646\u0635\u062d \u0628\u0627\u0644\u062a\u062c\u062f\u064a\u062f', en: 'Root expires in ' + daysToExp + ' days', priority: 'high' });
        if (!root.purpose)    recs.push({ ar: '\u064a\u064f\u0646\u0635\u062d \u0628\u0625\u0636\u0627\u0641\u0629 \u0648\u0635\u0641 \u0627\u0644\u063a\u0631\u0636', en: 'Add purpose description', priority: 'medium' });
        if (children > 30)    recs.push({ ar: '\u0639\u062f\u062f \u0627\u0644\u0641\u0631\u0648\u0639 \u0643\u0628\u064a\u0631 \u2014 \u0646\u0638\u0651\u0645 \u0647\u0631\u0645\u064a\u0627\u064b', en: 'High branch count — reorganize hierarchy', priority: 'low' });
        if (root.shariaScore < 80) recs.push({ ar: '\u062f\u0631\u062c\u0629 \u0627\u0644\u0634\u0631\u064a\u0639\u0629 \u0645\u0646\u062e\u0641\u0636\u0629', en: 'Low sharia score', priority: 'medium' });

        const anomalies = [];
        if (root.status === 'active' && hasExpiry && daysToExp < 0) {
            anomalies.push({ type: 'expired_active', severity: 'high', ar: '\u0627\u0644\u062c\u0630\u0631 \u0645\u0646\u062a\u0647\u064a \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0629 \u0644\u0643\u0646\u0647 \u0646\u0634\u0637' });
            this.metrics.anomaliesDetected++;
        }

        const healthFinal   = Math.max(0, Math.min(100, Math.round(health)));
        const securityFinal = Math.max(0, Math.min(100, Math.round(security)));
        const analysis = {
            rootId, did: root.did, nameAr: root.nameAr,
            scores: { health: healthFinal, security: securityFinal, sharia: root.shariaScore, overall: Math.round((healthFinal + securityFinal + root.shariaScore) / 3) },
            ageHours: Math.round(ageHours), children, isExpiring, daysToExpiry: daysToExp,
            recommendations: recs, anomalies, analysedAt: new Date().toISOString()
        };

        if (root.aiMetrics) { root.aiMetrics.healthScore = healthFinal; root.aiMetrics.securityScore = securityFinal; root.aiMetrics.lastAnalysis = analysis.analysedAt; }
        this.aiInsights.push(analysis);
        if (this.aiInsights.length > 500) this.aiInsights = this.aiInsights.slice(-250);
        this.metrics.totalAIAnalyses++;
        if (anomalies.length) {
            this.anomalyLog.push(...anomalies.map(a => Object.assign({}, a, { rootId, ts: new Date().toISOString() })));
            if (this.anomalyLog.length > 500) this.anomalyLog = this.anomalyLog.slice(-250);
        }
        this._persist();
        return analysis;
    }

    analyzeAllRoots() {
        const results = Array.from(this.rootRegistry.keys()).map(id => this.analyzeWithAI(id));
        const n = results.length || 1;
        return { total: results.length, averages: { health: Math.round(results.reduce((a, r) => a + r.scores.health, 0) / n), security: Math.round(results.reduce((a, r) => a + r.scores.security, 0) / n), sharia: Math.round(results.reduce((a, r) => a + r.scores.sharia, 0) / n) }, analyses: results };
    }

    // ----------------------------------------------------------
    // 13. QUERY & SEARCH
    // ----------------------------------------------------------

    getRegistry(filters) {
        filters = filters || {};
        let roots = Array.from(this.rootRegistry.values()).map(r => this._safeRoot(r));
        if (filters.type)   roots = roots.filter(r => r.type === filters.type);
        if (filters.status) roots = roots.filter(r => r.status === filters.status);
        if (filters.shariaCompliant !== undefined) roots = roots.filter(r => r.shariaCompliant === (filters.shariaCompliant === 'true' || filters.shariaCompliant === true));
        if (filters.search) {
            const q = filters.search.toLowerCase();
            roots = roots.filter(r => (r.nameAr && r.nameAr.includes(filters.search)) || (r.nameEn && r.nameEn.toLowerCase().includes(q)) || (r.did && r.did.includes(q)) || (r.id && r.id.includes(q)));
        }
        if (filters.expiringSoon) {
            const th = new Date(); th.setDate(th.getDate() + 30);
            roots = roots.filter(r => r.expiresAt && new Date(r.expiresAt) <= th);
        }
        const total = roots.length;
        const page     = Math.max(1, parseInt(filters.page) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 20));
        const paginated = roots.slice((page - 1) * pageSize, page * pageSize);
        return { roots: paginated, total, page, pageSize, pages: Math.ceil(total / pageSize),
            stats: { total, active: roots.filter(r => r.status === 'active').length, revoked: roots.filter(r => r.status === 'revoked').length,
                compliant: roots.filter(r => r.shariaCompliant).length,
                complianceRate: total > 0 ? Math.round(roots.filter(r => r.shariaCompliant).length / total * 100) : 100 } };
    }

    searchRoots(query) {
        query = query || {};
        const filters = { search: query.q || query.search, type: query.type, status: query.status, page: query.page, pageSize: query.pageSize };
        const result = this.getRegistry(filters);
        if (query.minShariaScore) result.roots = result.roots.filter(r => r.shariaScore >= parseInt(query.minShariaScore));
        if (query.maxLevel !== undefined) result.roots = result.roots.filter(r => r.hierarchy && r.hierarchy.level <= parseInt(query.maxLevel));
        return result;
    }

    getRootTree(rootId) {
        const startId = rootId || this.masterRootId;
        if (!startId) return { tree: null, masterRootId: null };
        const build = (id, depth) => {
            if (depth > 20) return null;
            const root = this.rootRegistry.get(id);
            if (!root) return null;
            return { id: root.id, did: root.did, nameAr: root.nameAr, nameEn: root.nameEn, type: root.type, icon: (ROOT_TYPES[root.type] || {}).icon || '\u25cf',
                status: root.status, shariaScore: root.shariaScore, level: root.hierarchy.level, childCount: root.hierarchy.children.length, namespace: root.namespace,
                children: root.hierarchy.children.map(cid => build(cid, depth + 1)).filter(Boolean) };
        };
        return { tree: build(startId, 0), masterRootId: this.masterRootId };
    }

    getExpiring(days) {
        days = days || 30;
        const threshold = new Date(); threshold.setDate(threshold.getDate() + days);
        const expiring = Array.from(this.rootRegistry.values())
            .filter(r => r.status === 'active' && r.expiresAt && new Date(r.expiresAt) <= threshold)
            .map(r => ({ id: r.id, did: r.did, nameAr: r.nameAr, type: r.type, expiresAt: r.expiresAt, daysLeft: Math.ceil((new Date(r.expiresAt) - Date.now()) / 86400000) }))
            .sort((a, b) => a.daysLeft - b.daysLeft);
        return { count: expiring.length, roots: expiring, checkedWithinDays: days };
    }

    getNamespaces(filters) {
        filters = filters || {};
        let ns = Array.from(this.namespaces.values());
        if (filters.search) ns = ns.filter(n => n.ns.includes(filters.search));
        return { total: ns.length, namespaces: ns };
    }

    getAuditLog(filters) {
        filters = filters || {};
        let log = this.auditTrail.slice().reverse();
        if (filters.action)  log = log.filter(e => e.action === filters.action);
        if (filters.subject) log = log.filter(e => e.subject === filters.subject);
        const total = log.length;
        const page = Math.max(1, parseInt(filters.page) || 1);
        const pageSize = Math.min(100, parseInt(filters.pageSize) || 50);
        return { entries: log.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
    }

    getStats() {
        const roots = Array.from(this.rootRegistry.values());
        const byType = {}; const byLevel = {};
        roots.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; byLevel[r.hierarchy.level] = (byLevel[r.hierarchy.level] || 0) + 1; });
        const avgSharia = roots.length ? Math.round(roots.reduce((a, r) => a + (r.shariaScore || 0), 0) / roots.length) : 100;
        return { metrics: this.metrics, byType, byLevel, avgShariaScore: avgSharia,
            complianceRate: roots.length ? Math.round(roots.filter(r => r.shariaCompliant).length / roots.length * 100) : 100,
            chain: this._verifyChain(), namespaces: this.namespaces.size, delegations: this.delegations.size, auditEntries: this.auditTrail.length, aiInsights: this.aiInsights.length, anomalies: this.anomalyLog.length };
    }

    getDashboard() {
        const roots = Array.from(this.rootRegistry.values());
        const byType = {}; roots.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
        return {
            engine: this.name, nameAr: this.nameAr, version: this.version, owner: this.owner, copyright: this.copyright, activatedAt: this.activatedAt,
            bismillah: ISLAMIC_FOUNDATION.bismillah, verse: ISLAMIC_FOUNDATION.verse, metrics: this.metrics,
            summary: { totalRoots: roots.length, activeRoots: roots.filter(r => r.status === 'active').length, revokedRoots: roots.filter(r => r.status === 'revoked').length,
                totalSystems: this.digitalSystems.size, rootTypes: Object.keys(ROOT_TYPES).length, masterRootId: this.masterRootId,
                supportedAlgos: ['Ed25519', 'ECDSA-P256', 'SHA3-256', 'HMAC-SHA512', 'Merkle-Chain'],
                namespaces: this.namespaces.size, delegations: this.delegations.size, chainHeight: this.chainBlocks.length, chainValid: this._verifyChain().valid, byType },
            recentRoots: roots.slice(-5).map(r => ({ id: r.id, did: r.did, nameAr: r.nameAr, type: r.type, status: r.status, shariaScore: r.shariaScore, createdAt: r.createdAt })),
            recentAnomalies: this.anomalyLog.slice(-5), topInsights: this.aiInsights.slice(-3), islamicFoundation: ISLAMIC_FOUNDATION
        };
    }

    // ----------------------------------------------------------
    // 14. EXPORT / IMPORT
    // ----------------------------------------------------------

    exportJSON() {
        return { format: 'sheikha-digital-root-export-v2', exportedAt: new Date().toISOString(), version: ENGINE_VERSION,
            masterRootId: this.masterRootId, roots: Array.from(this.rootRegistry.values()).map(r => this._safeRoot(r)),
            systems: Array.from(this.digitalSystems.values()), namespaces: Array.from(this.namespaces.values()), metrics: this.metrics, copyright: this.copyright };
    }

    exportJSONLD() {
        return { '@context': ['https://schema.org/', 'https://www.w3.org/ns/did/v1'], '@type': 'DataCatalog', name: this.nameAr, version: this.version,
            item: Array.from(this.rootRegistry.values()).map(r => this._buildDIDDocument(r)) };
    }

    exportCSV() {
        const headers = ['id', 'did', 'type', 'nameAr', 'nameEn', 'status', 'shariaScore', 'shariaCompliant', 'createdAt', 'expiresAt', 'namespace'];
        const rows = Array.from(this.rootRegistry.values()).map(r =>
            headers.map(h => { const v = r[h]; if (v === null || v === undefined) return ''; return typeof v === 'string' && v.includes(',') ? ('"' + v + '"') : String(v); }).join(','));
        return [headers.join(','), ...rows].join('\n');
    }

    importRoots(data) {
        data = data || {};
        if (!data.roots || !Array.isArray(data.roots)) throw new Error('\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629');
        let imported = 0, skipped = 0;
        data.roots.forEach(root => {
            if (!root.id || !root.did || !root.type) { skipped++; return; }
            if (this.rootRegistry.has(root.id)) { skipped++; return; }
            if (!root.crypto) root.crypto = { ed25519: {}, ecdsa: {}, fingerprint: '' };
            if (!root.hierarchy) root.hierarchy = { level: 0, parentId: null, children: [], path: '/' + root.id, derivationIndex: 0 };
            if (!root.aiMetrics) root.aiMetrics = { healthScore: 80, securityScore: 80, usageScore: 0, lastAnalysis: null };
            this.rootRegistry.set(root.id, root);
            if (root.did) this.didIndex.set(root.did, root.id);
            if (root.namespace) this._registerNamespace(root.id, root.namespace);
            imported++;
        });
        this._syncMetricsFromRegistry();
        this._persist();
        this._audit('import', 'system', null, { imported, skipped, total: data.roots.length });
        return { imported, skipped, total: data.roots.length };
    }

    // ----------------------------------------------------------
    // 15. HEALTH MONITORING
    // ----------------------------------------------------------

    getHealthReport() {
        const roots     = Array.from(this.rootRegistry.values());
        const expiring  = this.getExpiring(30);
        const chain     = this._verifyChain();
        const recentAnomalies = this.anomalyLog.filter(a => (Date.now() - new Date(a.ts).getTime()) / 3600000 <= 24);
        let overallHealth = 100;
        if (!chain.valid)            overallHealth -= 20;
        if (expiring.count > 0)      overallHealth -= Math.min(15, expiring.count * 2);
        if (recentAnomalies.length)  overallHealth -= Math.min(20, recentAnomalies.length * 5);
        const revokeRate = roots.length > 0 ? this.metrics.revokedRoots / roots.length : 0;
        if (revokeRate > 0.2)        overallHealth -= 10;
        overallHealth = Math.max(0, Math.round(overallHealth));
        return {
            status: overallHealth >= 80 ? 'healthy' : overallHealth >= 60 ? 'degraded' : 'critical',
            overallHealth,
            details: { totalRoots: roots.length, activeRoots: this.metrics.activeRoots, revokedRoots: this.metrics.revokedRoots,
                expiringRoots: expiring.count, chainIntegrity: chain.valid, chainHeight: chain.height, recentAnomalies: recentAnomalies.length,
                avgShariaScore: roots.length ? Math.round(roots.reduce((a, r) => a + (r.shariaScore || 0), 0) / roots.length) : 100 },
            expiring: expiring.roots, anomalies: recentAnomalies, checkedAt: new Date().toISOString()
        };
    }

    // ----------------------------------------------------------
    // 16. REGISTER ROUTES (25 APIs)
    // ----------------------------------------------------------

    registerRoutes(app) {
        if (!app) return;
        const self = this;
        const BASE = '/api/digital-root';
        const safe = (data) => {
            if (!data || typeof data !== 'object') return data;
            if (Array.isArray(data)) return data.map(safe);
            const out = {};
            for (const k of Object.keys(data)) { if (k.startsWith('_private')) continue; out[k] = safe(data[k]); }
            return out;
        };
        const ok  = (res, data, msg)    => res.json({ success: true,  data: safe(data), message: msg || null, ts: new Date().toISOString() });
        const err = (res, e, code)      => res.status(code || 400).json({ success: false, message: (e && e.message) || String(e), ts: new Date().toISOString() });

        // GET
        app.get(BASE + '/dashboard',    (req, res) => ok(res, self.getDashboard()));
        app.get(BASE + '/registry',     (req, res) => ok(res, self.getRegistry(req.query)));
        app.get(BASE + '/tree',         (req, res) => ok(res, self.getRootTree(req.query.rootId || null)));
        app.get(BASE + '/health',       (req, res) => ok(res, self.getHealthReport()));
        app.get(BASE + '/stats',        (req, res) => ok(res, self.getStats()));
        app.get(BASE + '/namespaces',   (req, res) => ok(res, self.getNamespaces(req.query)));
        app.get(BASE + '/audit',        (req, res) => ok(res, self.getAuditLog(req.query)));
        app.get(BASE + '/expiring',     (req, res) => ok(res, self.getExpiring(parseInt(req.query.days) || 30)));
        app.get(BASE + '/analyze-all',  (req, res) => { try { ok(res, self.analyzeAllRoots()); } catch (e) { err(res, e); } });
        app.get(BASE + '/export', (req, res) => {
            try {
                const fmt = (req.query.format || 'json').toLowerCase();
                if (fmt === 'jsonld') { res.setHeader('Content-Type', 'application/ld+json'); return res.send(JSON.stringify(self.exportJSONLD(), null, 2)); }
                if (fmt === 'csv')   { res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', 'attachment; filename="digital-roots.csv"'); return res.send(self.exportCSV()); }
                ok(res, self.exportJSON());
            } catch (e) { err(res, e); }
        });
        app.get(BASE + '/verify/:id',   (req, res) => { try { ok(res, self.verifyRoot(req.params.id)); }         catch (e) { err(res, e); } });
        app.get(BASE + '/did/:id',      (req, res) => { try {
            const root = self.rootRegistry.get(req.params.id);
            if (!root) return err(res, new Error('\u0627\u0644\u062c\u0630\u0631 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f'), 404);
            ok(res, self._buildDIDDocument(root));
        } catch (e) { err(res, e); } });
        app.get(BASE + '/chain/:id',    (req, res) => { try { ok(res, { rootId: req.params.id, blocks: self.chainBlocks.filter(b => b.rootId === req.params.id), chain: self._verifyChain() }); } catch (e) { err(res, e); } });
        app.get(BASE + '/analyze/:id',  (req, res) => { try { ok(res, self.analyzeWithAI(req.params.id)); }      catch (e) { err(res, e); } });

        // POST
        app.post(BASE + '/generate',            (req, res) => { try { ok(res, self.generateRoot(req.body || {}),                                                                                                           '\u062a\u0645 \u062a\u0648\u0644\u064a\u062f \u0627\u0644\u062c\u0630\u0631 \u0628\u0646\u062c\u0627\u062d'); } catch (e) { err(res, e); } });
        app.post(BASE + '/derive',              (req, res) => { try { const b = req.body || {}; if (!b.parentId) return err(res, new Error('parentId \u0645\u0637\u0644\u0648\u0628')); ok(res, self.deriveChildRoot(b.parentId, b), '\u062a\u0645 \u0627\u0644\u0627\u0634\u062a\u0642\u0627\u0642'); } catch (e) { err(res, e); } });
        app.post(BASE + '/derive-multiple',     (req, res) => { try { const b = req.body || {}; if (!b.parentId) return err(res, new Error('parentId \u0645\u0637\u0644\u0648\u0628')); ok(res, self.deriveMultipleChildren(b.parentId, b.children || [])); } catch (e) { err(res, e); } });
        app.post(BASE + '/digitize',            (req, res) => { try { ok(res, self.digitizeEntity(req.body || {}),       '\u062a\u0645 \u0627\u0644\u0631\u0642\u0645\u0646\u0629'); } catch (e) { err(res, e); } });
        app.post(BASE + '/digitize-system',     (req, res) => { try { ok(res, self.digitizeSystem(req.body || {}),       '\u062a\u0645 \u0631\u0642\u0645\u0646\u0629 \u0627\u0644\u0645\u0646\u0638\u0648\u0645\u0629'); } catch (e) { err(res, e); } });
        app.post(BASE + '/revoke/:id',          (req, res) => { try { ok(res, self.revokeRoot(req.params.id, (req.body || {}).reason || '\u0625\u0644\u063a\u0627\u0621 \u064a\u062f\u0648\u064a'), '\u062a\u0645 \u0627\u0644\u0625\u0644\u063a\u0627\u0621'); } catch (e) { err(res, e); } });
        app.post(BASE + '/renew/:id',           (req, res) => { try { ok(res, self.renewRoot(req.params.id, parseInt((req.body || {}).ttlDays) || 365), '\u062a\u0645 \u0627\u0644\u062a\u062c\u062f\u064a\u062f'); } catch (e) { err(res, e); } });
        app.post(BASE + '/delegate',            (req, res) => { try { const b = req.body || {}; if (!b.delegatorId || !b.delegateeId) return err(res, new Error('delegatorId \u0648 delegateeId \u0645\u0637\u0644\u0648\u0628\u0627\u0646')); ok(res, self.delegateRoot(b.delegatorId, b.delegateeId, b.permissions, b.ttlDays)); } catch (e) { err(res, e); } });
        app.post(BASE + '/sign',                (req, res) => { try { const b = req.body || {}; if (!b.rootId || !b.payload) return err(res, new Error('rootId \u0648 payload \u0645\u0637\u0644\u0648\u0628\u0627\u0646')); ok(res, self.signWithRoot(b.rootId, b.payload, b.algo)); } catch (e) { err(res, e); } });
        app.post(BASE + '/batch/generate',      (req, res) => { try { ok(res, self.batchGenerate((req.body || {}).items || [])); } catch (e) { err(res, e); } });
        app.post(BASE + '/batch/verify',        (req, res) => { try { ok(res, self.batchVerify((req.body || {}).ids || [])); } catch (e) { err(res, e); } });
        app.post(BASE + '/batch/revoke',        (req, res) => { try { const b = req.body || {}; ok(res, self.batchRevoke(b.ids || [], b.reason)); } catch (e) { err(res, e); } });
        app.post(BASE + '/search',              (req, res) => { try { ok(res, self.searchRoots(req.body || {})); } catch (e) { err(res, e); } });
        app.post(BASE + '/import',              (req, res) => { try { ok(res, self.importRoots(req.body || {}), '\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u064a\u0631\u0627\u062f'); } catch (e) { err(res, e); } });

        console.log('\uD83C\uDF33 [DigitalRoot v2] 25 API \u0639\u0644\u0649 ' + BASE + '/*');
    }

    // ----------------------------------------------------------
    // 17. INTERNAL HELPERS
    // ----------------------------------------------------------

    _safeRoot(root) {
        if (!root) return null;
        const safe = Object.assign({}, root);
        if (safe.crypto) {
            safe.crypto = {
                ed25519:     { publicKey: root.crypto.ed25519 && root.crypto.ed25519.publicKey, algo: 'Ed25519',    signature: root.crypto.ed25519 && root.crypto.ed25519.signature },
                ecdsa:       { publicKey: root.crypto.ecdsa   && root.crypto.ecdsa.publicKey,   algo: 'ECDSA-P256', signature: root.crypto.ecdsa   && root.crypto.ecdsa.signature },
                fingerprint: root.crypto.fingerprint
            };
        }
        return safe;
    }

    _broadcast(event, data) {
        this.emit(event, data);
        if (typeof this._broadcastFn === 'function') {
            try { this._broadcastFn(JSON.stringify({ type: event, data, ts: new Date().toISOString() })); } catch (e) { /* ignore */ }
        }
    }

    _ensureMasterRoot() {
        if (this.masterRootId && this.rootRegistry.has(this.masterRootId)) return;
        const masterRoot = this.generateRoot({ type: 'master', nameAr: '\u0627\u0644\u062c\u0630\u0631 \u0627\u0644\u0631\u0626\u064a\u0633\u064a \u0644\u0645\u0646\u0638\u0648\u0645\u0629 \u0634\u064a\u062e\u0629', nameEn: 'Sheikha Ecosystem Master Root', owner: this.owner, purpose: '\u0627\u0644\u062c\u0630\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064a \u0644\u0643\u0644 \u0645\u0646\u0638\u0648\u0645\u0627\u062a \u0634\u064a\u062e\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629', ttlDays: 0 });
        this.masterRootId = masterRoot.id;
        for (const sys of SHEIKHA_DEFAULT_SYSTEMS) {
            try { this.generateRoot({ type: sys.type, nameAr: sys.nameAr, nameEn: sys.nameEn, parentId: this.masterRootId, namespace: sys.ns, ttlDays: sys.ttlDays, purpose: '\u0645\u0646\u0638\u0648\u0645\u0629 \u0634\u064a\u062e\u0629 \u2014 ' + sys.nameAr }); } catch (e) { /* ignore */ }
        }
        this._persist();
    }

    _startMonitor(interval) {
        this._monitorTimer = setInterval(() => {
            const now = new Date(); let changed = false;
            for (const [, root] of this.rootRegistry) {
                if (root.status === 'active' && root.expiresAt && new Date(root.expiresAt) < now) {
                    root.status = 'expired';
                    this.metrics.activeRoots  = Math.max(0, this.metrics.activeRoots - 1);
                    this.metrics.expiredRoots = (this.metrics.expiredRoots || 0) + 1;
                    this._broadcast('root:expired', { rootId: root.id, did: root.did });
                    changed = true;
                }
            }
            if (changed) this._persist();
        }, interval);
    }

    _syncMetricsFromRegistry() {
        const roots = Array.from(this.rootRegistry.values());
        this.metrics.totalRoots       = roots.length;
        this.metrics.activeRoots      = roots.filter(r => r.status === 'active').length;
        this.metrics.revokedRoots     = roots.filter(r => r.status === 'revoked').length;
        this.metrics.expiredRoots     = roots.filter(r => r.status === 'expired').length;
        this.metrics.systemsDigitized = this.digitalSystems.size;
    }

    // ----------------------------------------------------------
    // 18. PERSISTENCE
    // ----------------------------------------------------------

    _loadPersisted() {
        this._ensureDataDir();
        const tryLoad = (file, cb) => { try { if (fs.existsSync(file)) cb(JSON.parse(fs.readFileSync(file, 'utf8'))); } catch (e) { /* ignore */ } };
        tryLoad(ROOTS_FILE, d => {
            if (d.roots) d.roots.forEach(r => {
                this.rootRegistry.set(r.id, r);
                if (r.did) this.didIndex.set(r.did, r.id);
                if (r.namespace) this.nsIndex.set(r.namespace.toLowerCase(), r.id);
                if (r.hierarchy && r.hierarchy.parentId) {
                    if (!this.rootTree.has(r.hierarchy.parentId)) this.rootTree.set(r.hierarchy.parentId, []);
                    if (!this.rootTree.get(r.hierarchy.parentId).includes(r.id)) this.rootTree.get(r.hierarchy.parentId).push(r.id);
                }
            });
            if (d.metrics)      Object.assign(this.metrics, d.metrics);
            if (d.masterRootId) this.masterRootId = d.masterRootId;
        });
        tryLoad(SYSTEMS_FILE, d => { if (Array.isArray(d)) d.forEach(s => this.digitalSystems.set(s.systemId, s)); });
        tryLoad(AUDIT_FILE,   d => { if (Array.isArray(d)) this.auditTrail = d; });
        tryLoad(NS_FILE,      d => { if (Array.isArray(d)) d.forEach(n => this.namespaces.set(n.ns.toLowerCase(), n)); });
        tryLoad(CHAIN_FILE,   d => { if (Array.isArray(d)) { this.chainBlocks = d; this.metrics.chainHeight = d.length; } });
        this._syncMetricsFromRegistry();
    }

    _ensureDataDir() { try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { /* ignore */ } }

    _atomicWrite(filePath, data) {
        const tmp = filePath + '.tmp';
        try { fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8'); fs.renameSync(tmp, filePath); }
        catch (e) { try { fs.unlinkSync(tmp); } catch (_) { /* ignore */ } }
    }

    _persist() {
        try { this._ensureDataDir(); this._atomicWrite(ROOTS_FILE, { masterRootId: this.masterRootId, metrics: this.metrics, roots: Array.from(this.rootRegistry.values()), savedAt: new Date().toISOString(), version: ENGINE_VERSION, copyright: this.copyright }); } catch (e) { /* ignore */ }
    }
    _persistSystems()    { try { this._ensureDataDir(); this._atomicWrite(SYSTEMS_FILE, Array.from(this.digitalSystems.values())); } catch (e) { /* ignore */ } }
    _persistAudit()      { try { this._ensureDataDir(); this._atomicWrite(AUDIT_FILE,   this.auditTrail.slice(-1000)); } catch (e) { /* ignore */ } }
    _persistNamespaces() { try { this._ensureDataDir(); this._atomicWrite(NS_FILE,      Array.from(this.namespaces.values())); } catch (e) { /* ignore */ } }
    _persistChain()      { try { this._ensureDataDir(); this._atomicWrite(CHAIN_FILE,   this.chainBlocks.slice(-500)); } catch (e) { /* ignore */ } }

    // ----------------------------------------------------------
    // 19. PUBLIC STATUS
    // ----------------------------------------------------------

    getStatus() {
        return { name: this.name, nameAr: this.nameAr, version: this.version, status: 'active', owner: this.owner,
            totalRoots: this.metrics.totalRoots, activeRoots: this.metrics.activeRoots, revokedRoots: this.metrics.revokedRoots,
            systemsDigitized: this.metrics.systemsDigitized, masterRootId: this.masterRootId,
            chainHeight: this.chainBlocks.length, chainValid: this._verifyChain().valid,
            namespaces: this.namespaces.size, algos: ['Ed25519', 'ECDSA-P256', 'SHA3-256', 'HMAC-SHA512', 'Merkle-Chain'], apis: 25 };
    }

    stop() {
        if (this._monitorTimer) { clearInterval(this._monitorTimer); this._monitorTimer = null; }
        this._persist();
        this._persistChain();
    }
}

module.exports = SheikhaSmartDigitalRootEngine;
