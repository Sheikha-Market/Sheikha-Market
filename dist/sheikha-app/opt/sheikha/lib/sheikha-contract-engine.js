/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📋 sheikha-contract-engine.js — محرك العقود الرقمية
 *  "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ" — المائدة: 1
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/contracts.json');

// ──────────────────────────────────────────────────────────────────────────────
// قوالب العقود المدعومة
// ──────────────────────────────────────────────────────────────────────────────
const CONTRACT_TEMPLATES = {
    supply:   { required: ['parties', 'items', 'terms'], default_status: 'draft' },
    sale:     { required: ['parties', 'items', 'terms'], default_status: 'draft' },
    service:  { required: ['parties', 'scope', 'terms'], default_status: 'draft' },
    lease:    { required: ['parties', 'asset',  'terms'], default_status: 'draft' },
};

// ──────────────────────────────────────────────────────────────────────────────
// تحقق الشريعة الأساسي
// ──────────────────────────────────────────────────────────────────────────────
function shariaCheck(contract) {
    const issues = [];

    // التحقق من الغرر — لا يجوز بيع مجهول
    if (contract.items) {
        for (const item of contract.items) {
            if (!item.quantity || !item.unit) issues.push('غرر: الكمية أو الوحدة غير محددة');
            if (!item.price_per_unit)         issues.push('غرر: السعر غير محدد');
        }
    }

    // التحقق من الربا — لا فائدة مركبة
    if (contract.terms?.interest_rate) issues.push('ربا: شرط الفائدة ممنوع');

    // التحقق من وجود طرفين
    if (!contract.parties?.buyer || !contract.parties?.seller) {
        issues.push('الأطراف: يجب تحديد المشتري والبائع');
    }

    return { compliant: issues.length === 0, issues };
}

// ──────────────────────────────────────────────────────────────────────────────
// قراءة وكتابة البيانات
// ──────────────────────────────────────────────────────────────────────────────
function readContracts() {
    try {
        if (!fs.existsSync(DATA_FILE)) return { contracts: [], meta: {} };
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (_) {
        return { contracts: [], meta: {} };
    }
}

function saveContracts(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ──────────────────────────────────────────────────────────────────────────────
// واجهات المحرك العامة
// ──────────────────────────────────────────────────────────────────────────────

/**
 * إنشاء عقد جديد
 * @param {Object} params - { type, parties, items, terms }
 * @returns {{ success: boolean, contract?: Object, error?: string }}
 */
function createContract(params) {
    const { type, parties, items, terms } = params;
    const template = CONTRACT_TEMPLATES[type];

    if (!template) return { success: false, error: `نوع العقد غير مدعوم: ${type}` };

    const contract = { type, parties, items, terms };
    const sharia   = shariaCheck(contract);

    if (!sharia.compliant) {
        return { success: false, error: 'فشل تحقق الشريعة', issues: sharia.issues };
    }

    const data = readContracts();
    const now  = new Date().toISOString();
    const doc  = {
        id:         `cnt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type,
        status:     template.default_status,
        created_at: now,
        parties,
        items:      items || [],
        terms:      terms || {},
        sharia:     { compliant: true, checked_at: now, issues: [] },
        audit:      [{ action: 'created', at: now, engine: 'sheikha-contract-engine' }]
    };

    (data.contracts = data.contracts || []).push(doc);
    data.meta = { total: data.contracts.length, last_updated: now };
    saveContracts(data);

    return { success: true, contract: doc };
}

/**
 * الحصول على عقد بمعرفه
 */
function getContract(id) {
    const data = readContracts();
    return (data.contracts || []).find(c => c.id === id) || null;
}

/**
 * تحديث حالة عقد
 */
function updateContractStatus(id, status, actor = 'system') {
    const data = readContracts();
    const idx  = (data.contracts || []).findIndex(c => c.id === id);
    if (idx === -1) return { success: false, error: 'العقد غير موجود' };

    const now = new Date().toISOString();
    data.contracts[idx].status = status;
    data.contracts[idx].audit.push({ action: `status_changed_to_${status}`, by: actor, at: now });
    data.meta.last_updated = now;
    saveContracts(data);

    return { success: true, contract: data.contracts[idx] };
}

/**
 * قائمة العقود مع تصفية اختيارية
 */
function listContracts(filters = {}) {
    const data = readContracts();
    let list   = data.contracts || [];

    if (filters.status) list = list.filter(c => c.status === filters.status);
    if (filters.type)   list = list.filter(c => c.type   === filters.type);
    if (filters.buyer)  list = list.filter(c => c.parties?.buyer?.id  === filters.buyer);
    if (filters.seller) list = list.filter(c => c.parties?.seller?.id === filters.seller);

    return { success: true, contracts: list, total: list.length };
}

/**
 * تشغيل تحقق الشريعة على عقد قائم
 */
function runShariaCheck(id) {
    const contract = getContract(id);
    if (!contract) return { success: false, error: 'العقد غير موجود' };
    const result = shariaCheck(contract);
    return { success: true, id, ...result };
}

// ──────────────────────────────────────────────────────────────────────────────
// التصدير
// ──────────────────────────────────────────────────────────────────────────────
module.exports = {
    createContract,
    getContract,
    updateContractStatus,
    listContracts,
    runShariaCheck,
    shariaCheck,
    CONTRACT_TEMPLATES
};

console.log('✅ [CONTRACT-ENGINE] محرك العقود الرقمية — جاهز');
