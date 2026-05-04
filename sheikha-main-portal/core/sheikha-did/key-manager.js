// بسم الله الرحمن الرحيم
/**
 * KEY MANAGER — مدير مفاتيح منظومة شيخة
 * إدارة دورة حياة مفاتيح DID: توليد، تجديد، إبطال
 *
 * «إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا» — النساء:58
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */
'use strict';

const crypto = require('crypto');
const { generateKeyPair, publicKeyFingerprint } = require('./did-generator');

// ─── Key Registry (in-memory — في الإنتاج: HSM) ──────────────────────────────

const _keyStore = new Map();  // fingerprint → { publicKey, createdAt, rotatedAt, revoked }

/**
 * توليد وتسجيل مفتاح جديد
 */
function generateAndRegister(did, label) {
    const keys = generateKeyPair();
    const fingerprint = publicKeyFingerprint(keys.publicKey);
    _keyStore.set(fingerprint, {
        did,
        label:     label || 'key-1',
        publicKey: keys.publicKey,
        createdAt: new Date().toISOString(),
        rotatedAt: null,
        revoked:   false,
        revokedAt: null,
    });
    // المفتاح الخاص يُعاد للمستخدم فقط ولا يُخزَّن
    return { fingerprint, publicKey: keys.publicKey, privateKey: keys.privateKey };
}

/**
 * تدوير المفتاح (Key Rotation)
 */
function rotateKey(oldFingerprint) {
    const existing = _keyStore.get(oldFingerprint);
    if (!existing) throw new Error(`مفتاح غير موجود: ${oldFingerprint}`);
    if (existing.revoked) throw new Error('المفتاح ملغى — لا يمكن تدويره');

    const newKeys = generateKeyPair();
    const newFingerprint = publicKeyFingerprint(newKeys.publicKey);

    // تحديث السجل القديم
    existing.rotatedAt = new Date().toISOString();
    existing.replacedBy = newFingerprint;

    // تسجيل المفتاح الجديد
    _keyStore.set(newFingerprint, {
        did:       existing.did,
        label:     existing.label,
        publicKey: newKeys.publicKey,
        createdAt: new Date().toISOString(),
        rotatedAt: null,
        revoked:   false,
        prevKey:   oldFingerprint,
    });

    return {
        oldFingerprint,
        newFingerprint,
        publicKey: newKeys.publicKey,
        privateKey: newKeys.privateKey,  // يُسلَّم للمستخدم
        rotatedAt: new Date().toISOString(),
    };
}

/**
 * إبطال مفتاح (Revocation)
 */
function revokeKey(fingerprint, reason) {
    const entry = _keyStore.get(fingerprint);
    if (!entry) throw new Error(`مفتاح غير موجود: ${fingerprint}`);
    entry.revoked   = true;
    entry.revokedAt = new Date().toISOString();
    entry.revokeReason = reason || 'مُبطَل';
    return { fingerprint, revoked: true, revokedAt: entry.revokedAt };
}

/**
 * الحصول على المفتاح العام
 */
function getPublicKey(fingerprint) {
    return _keyStore.get(fingerprint) || null;
}

/**
 * التحقق هل المفتاح ساري (غير ملغى)
 */
function isKeyValid(fingerprint) {
    const entry = _keyStore.get(fingerprint);
    return entry ? !entry.revoked : false;
}

/**
 * إنشاء HMAC لمسار فرعي (BIP32-style للتوقيع)
 */
function derivePathKey(rootPublicKey, childPath) {
    const hmac = crypto.createHmac('sha256', rootPublicKey || 'sheikha-root');
    hmac.update(childPath);
    return hmac.digest('hex');
}

module.exports = {
    generateAndRegister,
    rotateKey,
    revokeKey,
    getPublicKey,
    isKeyValid,
    derivePathKey,
};
