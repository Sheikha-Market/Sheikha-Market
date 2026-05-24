/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA IP SECURITY ENGINE — حماية الملكية الفكرية والتشفير والتوثيق
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * المبدأ: لا ضرر ولا ضرار — حماية تامة بلا إضرار
 *
 * «وَأَدِّ الأَمَانَةَ إِلَى مَنِ ائْتَمَنَكَ» — الأنفال:٢٧
 * «وَلَا تَجَسَّسُوا» — الحجرات:١٢
 * «فَاكْتُبُوهُ» — البقرة:٢٨٢
 *
 * ✅ تشفير AES-256-GCM للبيانات الحساسة
 * ✅ hash SHA-256 للوثائق والتوثيق
 * ✅ إشعار الملكية الفكرية
 * ✅ توثيق آمن بلا تسريب
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SALT_LENGTH = 32;

const IP_NOTICE = {
    ar: '© 2026 سلمان أحمد بن سلمان الراجح — SHEIKHA. جميع الحقوق محفوظة — لا تعديل ولا نسخ بدون إذن صريح.',
    en: '© 2026 Salman Ahmed bin Salman Al-Rajhi — SHEIKHA. All rights reserved.',
    quranRef: 'الأنفال:٢٧ — وَأَدِّ الأَمَانَةَ إِلَى مَنِ ائْتَمَنَكَ'
};

/**
 * استخراج مفتاح تشفير من ENCRYPTION_KEY أو JWT_SECRET (fallback آمن)
 */
function _getEncryptionKey() {
    const key = process.env.SHEIKHA_ENCRYPTION_KEY || process.env.JWT_SECRET;
    if (!key || key.length < 32) return null;
    return crypto.createHash('sha256').update(key).digest();
}

/**
 * تشفير نص — AES-256-GCM
 * @param {string} plaintext - النص الواضح
 * @returns {string|null} base64(iv:authTag:ciphertext) أو null عند فشل
 */
function encrypt(plaintext) {
    const key = _getEncryptionKey();
    if (!key) return null;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
        let encrypted = cipher.update(String(plaintext), 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const authTag = cipher.getAuthTag();
        return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]).toString('base64');
    } catch (_) {
        return null;
    }
}

/**
 * فك تشفير نص
 * @param {string} encryptedBase64 - النص المشفّر (base64)
 * @returns {string|null} النص الواضح أو null
 */
function decrypt(encryptedBase64) {
    const key = _getEncryptionKey();
    if (!key) return null;
    try {
        const buf = Buffer.from(encryptedBase64, 'base64');
        const iv = buf.subarray(0, IV_LENGTH);
        const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch (_) {
        return null;
    }
}

/**
 * hash SHA-256 للنص — للتوثيق
 * @param {string} text
 * @returns {string} hex hash
 */
function hashDocument(text) {
    return crypto.createHash('sha256').update(String(text)).digest('hex');
}

/**
 * توثيق وثيقة — hash + timestamp
 * @param {string} content
 * @returns {{ hash: string, timestamp: string, notice: object }}
 */
function documentIntegrity(content) {
    return {
        hash: hashDocument(content),
        timestamp: new Date().toISOString(),
        notice: IP_NOTICE
    };
}

/**
 * التحقق من سلامة وثيقة
 * @param {string} content
 * @param {string} expectedHash
 * @returns {boolean}
 */
function verifyDocumentIntegrity(content, expectedHash) {
    return hashDocument(content) === expectedHash;
}

/**
 * إشعار الملكية الفكرية
 */
function getIPNotice() {
    return IP_NOTICE;
}

/**
 * حالة التشفير — هل المفتاح مُعدّ؟
 */
function isEncryptionReady() {
    return !!_getEncryptionKey();
}

module.exports = {
    encrypt,
    decrypt,
    hashDocument,
    documentIntegrity,
    verifyDocumentIntegrity,
    getIPNotice,
    isEncryptionReady,
    IP_NOTICE,
    ALGORITHM
};
