// بسم الله الرحمن الرحيم
/**
 * IDENTITY REGISTRY — سجل الهويات الموزع
 * يحفظ جميع هويات DID ويُدير مستويات التحقق
 *
 * مستويات التحقق:
 *   L0 — هوية رقمية أساسية
 *   L1 — هوية موثقة (KYC + نفاذ)
 *   L2 — هوية مؤسسية
 *   L3 — هوية شرعية (مُجازة من المجلس الشرعي)
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR      = path.join(__dirname, '..', '..', 'data', 'currency');
const REGISTRY_FILE = path.join(DATA_DIR, 'did-registry.json');

let _registry = null;
let _seq = 0;

function ensureDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
    try {
        if (fs.existsSync(REGISTRY_FILE)) return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    } catch (_) {}
    return { identities: {}, total: 0, createdAt: new Date().toISOString() };
}

function save() {
    ensureDir();
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(_registry, null, 2));
}

function init() {
    ensureDir();
    _registry = load();
    return { total: _registry.total, ready: true };
}

/**
 * تسجيل هوية DID جديدة
 */
function register(didDocument) {
    if (!_registry) init();
    const did = didDocument.id;
    if (!did) throw new Error('DID غير صالح — حقل id مطلوب');
    if (_registry.identities[did]) return { existing: true, did, record: _registry.identities[did] };

    const record = {
        did,
        type:      didDocument.type || 'individual',
        name:      didDocument.name || '',
        level:     'L0',
        levelName: 'هوية رقمية أساسية',
        verified:  false,
        active:    true,
        publicKey: didDocument.verificationMethod?.[0]?.publicKeyPem || null,
        fingerprint: didDocument.verificationMethod?.[0]?.fingerprint || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata:  didDocument.meta || {},
        auditLog:  [{ action: 'REGISTERED', ts: new Date().toISOString() }],
    };

    _registry.identities[did] = record;
    _registry.total++;
    save();
    return { existing: false, did, record };
}

/**
 * الحصول على هوية DID
 */
function resolve(did) {
    if (!_registry) init();
    return _registry.identities[did] || null;
}

/**
 * ترقية مستوى التحقق
 * @param {string} did
 * @param {string} newLevel — L1 | L2 | L3
 * @param {object} evidence — { kycRef, nafathRef, crNumber, shariahRef, ... }
 */
function upgradeLevel(did, newLevel, evidence) {
    if (!_registry) init();
    const record = _registry.identities[did];
    if (!record) throw new Error(`DID غير مسجل: ${did}`);

    const levelNames = { L0: 'هوية رقمية أساسية', L1: 'هوية موثقة (KYC)', L2: 'هوية مؤسسية', L3: 'هوية شرعية' };
    const levelOrder = { L0: 0, L1: 1, L2: 2, L3: 3 };
    if (levelOrder[newLevel] <= levelOrder[record.level]) {
        throw new Error(`المستوى ${newLevel} لا يرقى عن ${record.level}`);
    }

    record.level      = newLevel;
    record.levelName  = levelNames[newLevel];
    record.verified   = true;
    record.updatedAt  = new Date().toISOString();
    record.evidence   = { ...(record.evidence || {}), [newLevel]: { ...evidence, ts: new Date().toISOString() } };
    record.auditLog.push({ action: `UPGRADE_TO_${newLevel}`, ts: new Date().toISOString() });
    save();
    return record;
}

/**
 * إلغاء هوية (تعطيل)
 */
function deactivate(did, reason) {
    if (!_registry) init();
    const record = _registry.identities[did];
    if (!record) throw new Error(`DID غير مسجل: ${did}`);
    record.active    = false;
    record.updatedAt = new Date().toISOString();
    record.auditLog.push({ action: 'DEACTIVATED', reason, ts: new Date().toISOString() });
    save();
    return record;
}

/**
 * البحث في الهويات
 */
function search(query) {
    if (!_registry) init();
    const q = (query || '').toLowerCase();
    return Object.values(_registry.identities).filter(r =>
        r.did.includes(q) || r.name.toLowerCase().includes(q) || r.type.includes(q)
    );
}

/**
 * إحصائيات السجل
 */
function getStats() {
    if (!_registry) init();
    const all = Object.values(_registry.identities);
    return {
        total: all.length,
        active: all.filter(r => r.active).length,
        byLevel: {
            L0: all.filter(r => r.level === 'L0').length,
            L1: all.filter(r => r.level === 'L1').length,
            L2: all.filter(r => r.level === 'L2').length,
            L3: all.filter(r => r.level === 'L3').length,
        },
        byType: {
            individual: all.filter(r => r.type === 'individual').length,
            company:    all.filter(r => r.type === 'company').length,
            market:     all.filter(r => r.type === 'market').length,
            agent:      all.filter(r => r.type === 'agent').length,
        },
    };
}

module.exports = { init, register, resolve, upgradeLevel, deactivate, search, getStats };
