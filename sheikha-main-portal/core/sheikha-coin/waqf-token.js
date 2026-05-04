// بسم الله الرحمن الرحيم
/**
 * WAQF TOKEN — عملة الوقف الرقمي
 * SKW — Sheikha Waqf Token
 *
 * «لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ» — آل عمران:92
 * «إِذَا مَاتَ الإِنسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ» — مسلم
 *
 * الوقف الرقمي يُتيح:
 *   • تجميد أصول رقمية لصالح مشاريع خيرية دائمة
 *   • توزيع الأرباح على المستفيدين تلقائياً
 *   • شفافية كاملة — كل وقف موثق ومدقق شرعياً
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 */
'use strict';

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const DATA_DIR  = path.join(__dirname, '..', '..', 'data', 'currency');
const WAQF_FILE = path.join(DATA_DIR, 'waqf-registry.json');

// أنواع الوقف
const WAQF_TYPES = {
    EDUCATION:    { id: 'EDUCATION',    name: 'التعليم',     share: 0.30 },
    HEALTH:       { id: 'HEALTH',       name: 'الصحة',       share: 0.20 },
    MOSQUE:       { id: 'MOSQUE',       name: 'المساجد',     share: 0.20 },
    ORPHANS:      { id: 'ORPHANS',      name: 'الأيتام',     share: 0.15 },
    WATER:        { id: 'WATER',        name: 'المياه',      share: 0.10 },
    GENERAL:      { id: 'GENERAL',      name: 'عام',         share: 0.05 },
};

let _db   = null;
let _seq  = 0;

function ensureDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
    try {
        if (fs.existsSync(WAQF_FILE)) return JSON.parse(fs.readFileSync(WAQF_FILE, 'utf8'));
    } catch (_) {}
    return { awqaf: [], totalLocked: {}, distributions: [], createdAt: new Date().toISOString() };
}

function save() {
    ensureDir();
    fs.writeFileSync(WAQF_FILE, JSON.stringify(_db, null, 2));
}

function newId() {
    return `WQF-${Date.now()}-${(++_seq).toString().padStart(4, '0')}`;
}

/**
 * إنشاء وقف جديد
 */
function createWaqf(waaqif, currency, amount, waqfType, beneficiary, duration) {
    if (!_db) _db = load();
    ensureDir();

    const id = newId();
    const waqf = {
        id,
        waaqif,            // الواقف
        currency,
        amount,
        waqfType: waqfType || 'GENERAL',
        typeName: WAQF_TYPES[waqfType]?.name || 'عام',
        beneficiary,       // المستفيد
        duration,          // المدة (أيام) أو null = دائم
        status: 'ACTIVE',
        profitDistributed: 0,
        createdAt: new Date().toISOString(),
        expiresAt: duration ? new Date(Date.now() + duration * 86400000).toISOString() : null,
        quranRef: 'آل عمران:92 — لن تنالوا البر حتى تنفقوا مما تحبون',
        hash: crypto.createHash('sha256').update(`${waaqif}:${currency}:${amount}:${Date.now()}`).digest('hex'),
    };

    _db.awqaf.push(waqf);
    _db.totalLocked[currency] = (_db.totalLocked[currency] || 0) + amount;
    save();
    return waqf;
}

/**
 * توزيع أرباح الوقف
 */
function distributeProfit(waqfId, profitAmount, currency) {
    if (!_db) _db = load();
    const waqf = _db.awqaf.find(w => w.id === waqfId);
    if (!waqf) throw new Error(`وقف غير موجود: ${waqfId}`);
    if (waqf.status !== 'ACTIVE') throw new Error('الوقف غير نشط');

    const distributions = Object.values(WAQF_TYPES).map(type => ({
        type: type.id,
        name: type.name,
        amount: parseFloat((profitAmount * type.share).toFixed(6)),
        currency,
    }));

    const record = {
        waqfId,
        totalProfit: profitAmount,
        currency,
        distributions,
        distributedAt: new Date().toISOString(),
    };

    waqf.profitDistributed = (waqf.profitDistributed || 0) + profitAmount;
    _db.distributions.push(record);
    save();
    return record;
}

/**
 * قائمة الأوقاف النشطة
 */
function listActive(currency) {
    if (!_db) _db = load();
    return _db.awqaf.filter(w => w.status === 'ACTIVE' && (!currency || w.currency === currency));
}

/**
 * إحصائيات الوقف
 */
function getStats() {
    if (!_db) _db = load();
    return {
        totalAwqaf:   _db.awqaf.length,
        activeAwqaf:  _db.awqaf.filter(w => w.status === 'ACTIVE').length,
        totalLocked:  _db.totalLocked,
        totalDistributions: _db.distributions.length,
        waqfTypes: Object.values(WAQF_TYPES),
    };
}

module.exports = { createWaqf, distributeProfit, listActive, getStats, WAQF_TYPES };
