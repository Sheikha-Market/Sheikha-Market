// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA SOVEREIGN ROOT — الجذر السيادي الحاكم                      ║
 * ║         أعلى طبقة في منظومة شيخة الرقمية                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال:60
 * ﴿إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّى يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾ — الرعد:11
 *
 * الجذر السيادي هو:
 *   • الطبقة 0 في المنظومة — المرجع الأعلى
 *   • مولّد مفاتيح ECDSA (prime256v1) + توقيع/تحقق جذري
 *   • مرجع الكتاب والسنة — عقد شرعي رقمي غير قابل للتعديل
 *   • سجل أعلى من Bitcoin/Crypto (مدعوم بأصول حقيقية + شريعة)
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * © 2025-2026 Sheikha Market — جميع الحقوق محفوظة
 */

'use strict';

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOT_ID      = 'did:sheikha:root';
const VERSION      = '1.0.0';
const DATA_DIR     = path.join(__dirname, '..', '..', 'data', 'currency');
const ROOT_FILE    = path.join(DATA_DIR, 'sovereign-root.json');
const CHAIN_FILE   = path.join(DATA_DIR, 'sovereign-chain.ndjson');

// ─── Quran & Sunnah Foundation ────────────────────────────────────────────────

const SHARIAH_CONTRACT = {
    id:        'sheikha-shariah-contract-v1',
    createdAt: '2025-10-18T00:00:00Z',
    quranRefs: [
        { surah: 2,  ayah: 275, text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا', rule: 'لا ربا' },
        { surah: 2,  ayah: 282, text: 'إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ', rule: 'توثيق العقود' },
        { surah: 4,  ayah: 29,  text: 'لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ', rule: 'لا غش ولا غرر' },
        { surah: 55, ayah: 9,   text: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ', rule: 'العدل في الميزان' },
        { surah: 8,  ayah: 60,  text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ', rule: 'القوة والإعداد' },
    ],
    hadithRefs: [
        { narrator: 'أبو هريرة', text: 'نَهَى رَسُولُ اللَّهِ ﷺ عَنْ بَيْعِ الْغَرَرِ', source: 'مسلم', rule: 'لا غرر' },
        { narrator: 'عمر بن الخطاب', text: 'لَا ضَرَرَ وَلَا ضِرَارَ', source: 'ابن ماجه', rule: 'لا ضرر' },
        { narrator: 'ابن مسعود', text: 'التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ', source: 'الترمذي', rule: 'الأمانة في التجارة' },
    ],
    principles: ['لا ربا', 'لا غرر', 'لا غش', 'لا احتكار', 'لا ضرر ولا ضرار', 'العدل', 'الأمانة', 'الشفافية'],
    governance: {
        authority: 'المملكة العربية السعودية',
        shariahBoard: 'مجلس الشريعة الإسلامية — شيخة',
        regulators: ['SAMA', 'CIBAFI', 'AAOIFI'],
    },
};

// ─── State ────────────────────────────────────────────────────────────────────

let _rootKeys    = null;   // { publicKey, privateKey } — in-memory only
let _rootPublic  = null;   // PEM string of public key
let _chainHeight = 0;
let _initialized = false;

// ─── Utilities ────────────────────────────────────────────────────────────────

function sha256(data) {
    return crypto.createHash('sha256').update(
        typeof data === 'string' ? data : JSON.stringify(data)
    ).digest('hex');
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadRoot() {
    try {
        if (fs.existsSync(ROOT_FILE)) {
            return JSON.parse(fs.readFileSync(ROOT_FILE, 'utf8'));
        }
    } catch (_) {}
    return null;
}

function saveRoot(record) {
    ensureDir(DATA_DIR);
    fs.writeFileSync(ROOT_FILE, JSON.stringify(record, null, 2));
}

function appendChain(entry) {
    ensureDir(DATA_DIR);
    fs.appendFileSync(CHAIN_FILE, JSON.stringify(entry) + '\n');
}

// ─── Key Management ──────────────────────────────────────────────────────────

function generateRootKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding:  { type: 'spki',  format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
}

function signData(data) {
    if (!_rootKeys) throw new Error('الجذر غير مُهيَّأ — استدعِ init() أولاً');
    const sign = crypto.createSign('SHA256');
    sign.update(typeof data === 'string' ? data : JSON.stringify(data));
    sign.end();
    return sign.sign(_rootKeys.privateKey, 'base64');
}

function verifySignature(data, signature, publicKeyPem) {
    try {
        const verify = crypto.createVerify('SHA256');
        verify.update(typeof data === 'string' ? data : JSON.stringify(data));
        verify.end();
        return verify.verify(publicKeyPem || _rootPublic, signature, 'base64');
    } catch (_) {
        return false;
    }
}

/**
 * توليد مفتاح فرعي BIP32-style (محاكاة)
 * كل فرع (عملة / مستخدم / سوق) يحصل على مفتاحه الموقّع بالجذر
 */
function deriveChildKey(path, seed) {
    const hmac = crypto.createHmac('sha512', _rootPublic || 'sheikha-root');
    hmac.update(`${path}:${seed || Date.now()}`);
    const derived = hmac.digest('hex');
    return {
        path,
        publicKeyHash: sha256(derived),
        derivedAt: new Date().toISOString(),
        signedByRoot: signData({ path, hash: sha256(derived) }),
    };
}

// ─── Genesis Block ────────────────────────────────────────────────────────────

function createGenesisBlock(publicKeyPem) {
    const genesis = {
        blockIndex:    0,
        blockType:     'GENESIS',
        rootId:        ROOT_ID,
        publicKey:     publicKeyPem,
        shariahHash:   sha256(SHARIAH_CONTRACT),
        currencies:    ['SKC', 'SDH', 'SDN'],   // SHK + Dirham + Dinar
        timestamp:     new Date().toISOString(),
        prevHash:      '0000000000000000000000000000000000000000000000000000000000000000',
    };
    genesis.hash = sha256(genesis);
    return genesis;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

/**
 * تهيئة الجذر السيادي
 * يولّد مفاتيح جديدة أو يستعيد المفتاح العام المحفوظ
 */
function init() {
    if (_initialized) return status();

    const saved = loadRoot();

    if (saved && saved.publicKey) {
        _rootPublic = saved.publicKey;
        // NOTE: المفتاح الخاص لا يُحفظ على القرص — يُولَّد جديد كل دورة تشغيل
        // في الإنتاج يُخزَّن في HSM
        _rootKeys = generateRootKeys();
        _chainHeight = saved.chainHeight || 0;
        console.info('[SOVEREIGN-ROOT] ✅ تم استعادة الجذر السيادي — الارتفاع:', _chainHeight);
    } else {
        _rootKeys   = generateRootKeys();
        _rootPublic = _rootKeys.publicKey;
        const genesis = createGenesisBlock(_rootPublic);
        const record = {
            rootId:      ROOT_ID,
            version:     VERSION,
            publicKey:   _rootPublic,
            shariahHash: sha256(SHARIAH_CONTRACT),
            genesisHash: genesis.hash,
            chainHeight: 0,
            createdAt:   new Date().toISOString(),
        };
        saveRoot(record);
        appendChain(genesis);
        _chainHeight = 0;
        console.info('[SOVEREIGN-ROOT] 🌟 تم إنشاء الجذر السيادي — Genesis:', genesis.hash.slice(0, 16) + '...');
    }

    _initialized = true;
    return status();
}

// ─── Sovereign Seal ───────────────────────────────────────────────────────────

/**
 * ختم سيادي — يُضاف لكل معاملة مهمة
 */
function sealTransaction(tx) {
    if (!_initialized) init();
    const payload = { txId: tx.id || sha256(tx), type: tx.type, ts: new Date().toISOString() };
    const seal = {
        rootId:    ROOT_ID,
        signature: signData(payload),
        payload,
        sealedAt:  new Date().toISOString(),
    };
    _chainHeight++;
    const block = {
        blockIndex: _chainHeight,
        blockType:  'SEAL',
        ...seal,
        hash: sha256({ ...seal, blockIndex: _chainHeight }),
    };
    appendChain(block);
    return seal;
}

// ─── Status ───────────────────────────────────────────────────────────────────

function status() {
    return {
        rootId:      ROOT_ID,
        version:     VERSION,
        initialized: _initialized,
        chainHeight: _chainHeight,
        publicKeyFingerprint: _rootPublic
            ? sha256(_rootPublic).slice(0, 32)
            : null,
        shariahContract: {
            id:         SHARIAH_CONTRACT.id,
            hash:       sha256(SHARIAH_CONTRACT),
            principles: SHARIAH_CONTRACT.principles,
            quranRefs:  SHARIAH_CONTRACT.quranRefs.length,
            hadithRefs: SHARIAH_CONTRACT.hadithRefs.length,
        },
        currencies: [
            { code: 'SKC', name: 'شيخة كوين',    nameEn: 'SheikhaCoin' },
            { code: 'SDH', name: 'شيخة الدرهم',  nameEn: 'Sheikha Dirham' },
            { code: 'SDN', name: 'شيخة الدينار', nameEn: 'Sheikha Dinar' },
        ],
        superiority: {
            overBitcoin:  'مدعومة بأصول حقيقية + شريعة — لا تقلب ولا مضاربة',
            overCrypto:   'لا ربا + لا غرر + رقابة شرعية تلقائية',
            overSirenAI:  'مرجعية قرآنية + سنة نبوية = أخلاق مطلقة لا نسبية',
        },
    };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    init,
    status,
    signData,
    verifySignature,
    deriveChildKey,
    sealTransaction,
    SHARIAH_CONTRACT,
    ROOT_ID,
    getPublicKey: () => _rootPublic,
};
