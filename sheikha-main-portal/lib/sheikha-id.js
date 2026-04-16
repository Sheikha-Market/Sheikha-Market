/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                SHEIKHA-ID — مكتبة الهوية الرقمية الموحدة                   ║
 * ║         معيار DID + ECDSA لكل كيان في منظومة شيخة                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا" — الأعراف:١٨٠
 *
 * معيار الهوية:
 *   did:sheikha:{type}:{id}
 *   أمثلة:
 *     did:sheikha:user:usr-abc123
 *     did:sheikha:company:cmp-xyz789
 *     did:sheikha:agent:agt-deen-001
 *     did:sheikha:service:svc-market
 *
 * الاستخدام:
 *   const { generateDID, signEntity, verifyEntity } = require('./lib/sheikha-id');
 *   const id = generateDID('user');
 *   const signed = signEntity({ did: id, name: 'سلمان' }, privateKey);
 *   const valid  = verifyEntity(signed, publicKey);
 */

'use strict';

const crypto = require('crypto');

// ─── ثوابت ────────────────────────────────────────────────────────────────────

const DID_PREFIX   = 'did:sheikha';
const SCHEMA       = 'sheikha/v2';
const TAWHEED      = 'لا إله إلا الله';
const CURVE        = 'prime256v1'; // P-256 / secp256r1

// ─── أنواع الكيانات المعترف بها ───────────────────────────────────────────────

const ENTITY_TYPES = Object.freeze({
    USER:    'user',
    COMPANY: 'company',
    AGENT:   'agent',
    SERVICE: 'service',
    DEVICE:  'device',
    BRANCH:  'branch',
});

// ─── توليد الهوية ─────────────────────────────────────────────────────────────

/**
 * توليد معرّف DID فريد
 * @param {string} type  - نوع الكيان (user | company | agent | service | …)
 * @returns {string}     - مثال: did:sheikha:user:usr-a1b2c3d4
 */
function generateDID(type = 'user') {
    const normalizedType = ENTITY_TYPES[type.toUpperCase()] || type.toLowerCase();
    const prefix = normalizedType.slice(0, 3);
    const uniqueId = `${prefix}-${crypto.randomBytes(4).toString('hex')}`;
    return `${DID_PREFIX}:${normalizedType}:${uniqueId}`;
}

// ─── توليد زوج مفاتيح ECDSA ──────────────────────────────────────────────────

/**
 * توليد زوج مفاتيح تشفير جديد للكيان
 * @returns {{ publicKey: string, privateKey: string }} - مفاتيح بصيغة PEM
 */
function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: CURVE,
        publicKeyEncoding:  { type: 'spki',  format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
}

// ─── التوقيع والتحقق ──────────────────────────────────────────────────────────

/**
 * توقيع بيانات الكيان بالمفتاح الخاص
 * @param {object} entityData   - بيانات الكيان
 * @param {string} privateKeyPem
 * @returns {{ ...entityData, _schema, _tawheed, _signed_at, _signature }}
 */
function signEntity(entityData, privateKeyPem) {
    const payload = JSON.stringify({
        ...entityData,
        _schema:    SCHEMA,
        _tawheed:   TAWHEED,
        _signed_at: new Date().toISOString(),
    });

    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    sign.end();
    const signature = sign.sign(privateKeyPem, 'base64');

    return {
        ...JSON.parse(payload),
        _signature: signature,
    };
}

/**
 * التحقق من توقيع الكيان بالمفتاح العام
 * @param {object} signedEntity - الكيان الموقّع (يحوي _signature)
 * @param {string} publicKeyPem
 * @returns {boolean}
 */
function verifyEntity(signedEntity, publicKeyPem) {
    const { _signature, ...rest } = signedEntity;
    if (!_signature) return false;

    const payload = JSON.stringify(rest);
    const verify  = crypto.createVerify('SHA256');
    verify.update(payload);
    verify.end();

    try {
        return verify.verify(publicKeyPem, _signature, 'base64');
    } catch {
        return false;
    }
}

// ─── تحليل وبناء DID ─────────────────────────────────────────────────────────

/**
 * تحليل DID إلى مكوناته
 * @param {string} did  - مثال: did:sheikha:user:usr-abc123
 * @returns {{ prefix: string, method: string, type: string, id: string }|null}
 */
function parseDID(did) {
    if (!did || typeof did !== 'string') return null;
    const parts = did.split(':');
    if (parts.length < 4 || parts[0] !== 'did' || parts[1] !== 'sheikha') return null;
    return {
        prefix: `${parts[0]}:${parts[1]}`,
        method: parts[1],
        type:   parts[2],
        id:     parts.slice(3).join(':'),
    };
}

/**
 * التحقق من صحة صيغة DID
 * @param {string} did
 * @returns {boolean}
 */
function isValidDID(did) {
    return parseDID(did) !== null;
}

// ─── وثيقة DID Document ───────────────────────────────────────────────────────

/**
 * بناء DID Document موحّد للكيان
 * @param {string} did
 * @param {string} publicKeyPem
 * @param {object} [meta]  - بيانات إضافية { nameAr, nameEn, domain, maqsad }
 * @returns {object}
 */
function buildDIDDocument(did, publicKeyPem, meta = {}) {
    const parsed = parseDID(did);
    if (!parsed) throw new Error(`DID غير صالح: ${did}`);

    return {
        schema:   SCHEMA,
        tawheed:  TAWHEED,
        '@context': ['https://www.w3.org/ns/did/v1', 'https://sheikha.com/did/v2'],
        id: did,
        type: parsed.type,
        created: new Date().toISOString(),
        verificationMethod: [
            {
                id:           `${did}#key-1`,
                type:         'EcdsaSecp256r1VerificationKey2019',
                controller:   did,
                publicKeyPem: publicKeyPem,
            },
        ],
        authentication: [`${did}#key-1`],
        service: meta.domain
            ? [{ id: `${did}#service-1`, type: 'SheikhaService', serviceEndpoint: `https://${meta.domain}` }]
            : [],
        meta: {
            nameAr:  meta.nameAr  || '',
            nameEn:  meta.nameEn  || '',
            maqsad:  meta.maqsad  || 'ARD',
            sharia_compliant: true,
        },
    };
}

// ─── هاش الهوية للتخزين الآمن ────────────────────────────────────────────────

/**
 * توليد هاش آمن للـ DID للاستخدام كمفتاح في قاعدة البيانات
 * @param {string} did
 * @returns {string}  - hex SHA-256
 */
function hashDID(did) {
    return crypto.createHash('sha256').update(did).digest('hex');
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    // ثوابت
    DID_PREFIX,
    SCHEMA,
    TAWHEED,
    ENTITY_TYPES,
    // توليد
    generateDID,
    generateKeyPair,
    // توقيع وتحقق
    signEntity,
    verifyEntity,
    // تحليل DID
    parseDID,
    isValidDID,
    buildDIDDocument,
    hashDID,
};
