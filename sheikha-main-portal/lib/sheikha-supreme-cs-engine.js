'use strict';

const crypto = require('crypto');

const LAYERS = {
    1: 'لغات البرمجة',
    2: 'لغات الترميز',
    3: 'أساسيات البرمجة',
    4: 'الخوارزميات',
    5: 'الدوال والبرمجة الوظيفية',
    6: 'التشفير والأمان',
    7: 'الحاسب والحوسبة',
    8: 'الحساب والرياضيات'
};

function envelope(data, message = 'نجح') {
    return {
        success: true,
        schema: 'sheikha/v2',
        tawheed: 'لا إله إلا الله محمد رسول الله',
        bismillah: 'بسم الله الرحمن الرحيم',
        data,
        message,
        seal: 'والله أعلم وبالله التوفيق',
        timestamp: new Date().toISOString()
    };
}

function sortValues(values = [], algorithm = 'quick') {
    const list = Array.isArray(values) ? [...values] : [];
    list.sort((a, b) => Number(a) - Number(b));
    return envelope({ algorithm, inputSize: list.length, output: list }, 'نتيجة الفرز');
}

function searchValue(values = [], target = null, algorithm = 'binary') {
    const list = Array.isArray(values) ? [...values].sort((a, b) => Number(a) - Number(b)) : [];
    const idx = list.findIndex(item => Number(item) === Number(target));
    return envelope({ algorithm, target, found: idx !== -1, index: idx, list }, 'نتيجة البحث');
}

function hashValue(value = '', mode = 'sha256') {
    const normalized = String(value);
    const algo = mode === 'sha512' ? 'sha512' : 'sha256';
    const digest = crypto.createHash(algo).update(normalized).digest('hex');
    return envelope({ mode: algo, digest }, 'نتيجة الهاش');
}

function encryptValue(value = '', secret = process.env.SHEIKHA_CRYPTO_SECRET || 'SHEIKHA_DEFAULT_SECRET_32_CHARS!!') {
    const key = crypto.createHash('sha256').update(String(secret)).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return envelope({
        mode: 'AES-256-GCM',
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        payload: encrypted.toString('hex')
    }, 'نتيجة التشفير');
}

function convertBase(value, fromBase = 10, toBase = 2) {
    const decimal = parseInt(String(value), Number(fromBase));
    if (Number.isNaN(decimal)) {
        return {
            success: false,
            message: 'قيمة غير صالحة للتحويل',
            timestamp: new Date().toISOString()
        };
    }
    return envelope({ input: String(value), fromBase, toBase, output: decimal.toString(Number(toBase)) }, 'نتيجة التحويل');
}

function zakat(amount = 0) {
    const base = Number(amount) || 0;
    const due = base * 0.025;
    return envelope({ amount: base, rate: 0.025, zakatDue: due }, 'نتيجة الزكاة (2.5%)');
}

function info() {
    return envelope({
        layers: LAYERS,
        neuralCells: {
            quran: 20,
            sunnah: 20,
            total: 40
        },
        commands: ['sort', 'search', 'hash', 'encrypt', 'convert', 'zakat', 'info']
    }, 'معلومات المحرك العلمي العلوي');
}

function execute(command, payload = {}) {
    const cmd = String(command || '').toLowerCase();

    switch (cmd) {
        case 'sort':
            return sortValues(payload.values, payload.algorithm);
        case 'search':
            return searchValue(payload.values, payload.target, payload.algorithm);
        case 'hash':
            return hashValue(payload.value, payload.mode);
        case 'encrypt':
            return encryptValue(payload.value, payload.secret);
        case 'convert':
            return convertBase(payload.value, payload.fromBase, payload.toBase);
        case 'zakat':
            return zakat(payload.amount);
        case 'info':
            return info();
        default:
            return {
                success: false,
                message: 'أمر غير مدعوم',
                supported: ['sort', 'search', 'hash', 'encrypt', 'convert', 'zakat', 'info'],
                timestamp: new Date().toISOString()
            };
    }
}

module.exports = {
    execute,
    sortValues,
    searchValue,
    hashValue,
    encryptValue,
    convertBase,
    zakat,
    info
};
