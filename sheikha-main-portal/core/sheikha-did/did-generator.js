// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           SHEIKHA DID GENERATOR — مولّد الهوية الجذرية الموزعة             ║
 * ║           did:sheikha:<id> — هوية إسلامية سيادية                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * «يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَى وَجَعَلْنَاكُمْ
 *  شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا» — الحجرات:13
 *
 * الهوية الجذرية:
 *   L0 — هوية رقمية أساسية (مفتاح عام فقط)
 *   L1 — هوية موثقة (KYC + نفاذ السعودية)
 *   L2 — هوية مؤسسية (سجل تجاري + ترخيص)
 *   L3 — هوية شرعية (مُجازة من المجلس الشرعي)
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */

'use strict';

const crypto = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────

const DID_METHOD = 'sheikha';
const DID_VERSION = '1.0';

const LEVEL_NAMES = {
    L0: 'هوية رقمية أساسية',
    L1: 'هوية موثقة (KYC)',
    L2: 'هوية مؤسسية',
    L3: 'هوية شرعية',
};

// ─── Key Pair Generation ─────────────────────────────────────────────────────

function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding:  { type: 'spki',  format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
}

function publicKeyFingerprint(publicKeyPem) {
    return crypto.createHash('sha256').update(publicKeyPem).digest('hex').slice(0, 32);
}

// ─── DID Creation ─────────────────────────────────────────────────────────────

/**
 * إنشاء DID جديد
 * @param {string} type — 'individual' | 'company' | 'market' | 'agent'
 * @param {string} name — الاسم
 * @param {object} [meta] — بيانات إضافية
 */
function createDID(type, name, meta) {
    const keys = generateKeyPair();
    const fingerprint = publicKeyFingerprint(keys.publicKey);
    const didId = `did:${DID_METHOD}:${type}:${fingerprint}`;

    const didDocument = {
        '@context': [
            'https://www.w3.org/ns/did/v1',
            'https://sheikha.market/ns/did/v1',
        ],
        id: didId,
        version: DID_VERSION,
        method: DID_METHOD,
        type,
        name,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        verificationMethod: [
            {
                id: `${didId}#key-1`,
                type: 'EcdsaSecp256r1VerificationKey2019',
                controller: didId,
                publicKeyPem: keys.publicKey,
                fingerprint,
            },
        ],
        authentication: [`${didId}#key-1`],
        assertionMethod: [`${didId}#key-1`],
        level: 'L0',
        levelName: LEVEL_NAMES.L0,
        verified: false,
        active: true,
        shariahCompliant: true,
        governance: {
            authority: 'منظومة شيخة',
            regulators: ['SAMA', 'CIBAFI'],
            shariahBoard: 'مجلس الشريعة الإسلامية — شيخة',
        },
        meta: meta || {},
    };

    return {
        did: didId,
        document: didDocument,
        keys: {
            publicKey: keys.publicKey,
            privateKey: keys.privateKey,   // يُسلَّم للمستخدم — لا يُخزَّن على الخادم
        },
        fingerprint,
    };
}

/**
 * إنشاء DID من مفتاح عام موجود (استعادة)
 */
function resolveDIDFromPublicKey(type, publicKeyPem, name) {
    const fingerprint = publicKeyFingerprint(publicKeyPem);
    return `did:${DID_METHOD}:${type}:${fingerprint}`;
}

/**
 * التحقق من صحة DID
 */
function isValidDID(did) {
    return /^did:sheikha:[a-z]+:[a-f0-9]{32}$/.test(did);
}

/**
 * استخراج النوع من DID
 */
function getDIDType(did) {
    const parts = did.split(':');
    return parts.length >= 3 ? parts[2] : null;
}

/**
 * توقيع بيانات باستخدام مفتاح DID
 */
function signWithDID(privateKeyPem, data) {
    const sign = crypto.createSign('SHA256');
    sign.update(typeof data === 'string' ? data : JSON.stringify(data));
    sign.end();
    return sign.sign(privateKeyPem, 'base64');
}

/**
 * التحقق من توقيع DID
 */
function verifyDIDSignature(publicKeyPem, data, signature) {
    try {
        const verify = crypto.createVerify('SHA256');
        verify.update(typeof data === 'string' ? data : JSON.stringify(data));
        verify.end();
        return verify.verify(publicKeyPem, signature, 'base64');
    } catch (_) {
        return false;
    }
}

module.exports = {
    createDID,
    resolveDIDFromPublicKey,
    isValidDID,
    getDIDType,
    signWithDID,
    verifyDIDSignature,
    generateKeyPair,
    publicKeyFingerprint,
    LEVEL_NAMES,
    DID_METHOD,
};
