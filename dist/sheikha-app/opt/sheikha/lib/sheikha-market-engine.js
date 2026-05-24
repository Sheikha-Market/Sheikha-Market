/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏪 sheikha-market-engine.js — محرك السوق الموحد
 *  واجهة موحدة لجميع وظائف سوق شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const METALS = {
    gold:     { symbol: 'XAU', exchange: 'LBMA',  unit: 'g',  currency: 'SAR' },
    silver:   { symbol: 'XAG', exchange: 'COMEX', unit: 'g',  currency: 'SAR' },
    copper:   { symbol: 'CU',  exchange: 'LME',   unit: 'kg', currency: 'SAR' },
    aluminum: { symbol: 'AL',  exchange: 'LME',   unit: 'kg', currency: 'SAR' },
    zinc:     { symbol: 'ZN',  exchange: 'LME',   unit: 'kg', currency: 'SAR' },
    nickel:   { symbol: 'NI',  exchange: 'LME',   unit: 'kg', currency: 'SAR' },
    steel_scrap: { symbol: 'SCRAP', exchange: 'ISRI', unit: 'kg', currency: 'SAR' }
};

// أسعار أساسية (محاكاة — في الإنتاج تُجلب من API)
const BASE_PRICES = {
    gold: 285.40, silver: 3.12, copper: 42.80,
    aluminum: 28.50, zinc: 24.10, nickel: 155.00, steel_scrap: 18.75
};

function getLivePrices(metals = Object.keys(BASE_PRICES)) {
    const now     = new Date().toISOString();
    const prices  = {};
    for (const m of metals) {
        if (!BASE_PRICES[m]) continue;
        const change = (Math.random() - 0.5) * 2; // محاكاة تغيير
        prices[m] = {
            price:      parseFloat((BASE_PRICES[m] * (1 + change / 100)).toFixed(4)),
            base_price: BASE_PRICES[m],
            change_pct: parseFloat(change.toFixed(2)),
            change_dir: change >= 0 ? 'up' : 'down',
            exchange:   METALS[m]?.exchange || 'MARKET',
            unit:       METALS[m]?.unit || 'unit',
            currency:   'SAR',
            timestamp:  now
        };
    }
    return prices;
}

function getMetalInfo(metalId) {
    return METALS[metalId] || null;
}

function getSupportedMetals() {
    return Object.entries(METALS).map(([id, info]) => ({ id, ...info }));
}

/**
 * مطابقة طلب بيع/شراء مع موردين/مشترين
 */
function matchOrder(order) {
    // في الإنتاج يُطبَّق خوارزمية مطابقة حقيقية
    return {
        success: true,
        matched: true,
        match: {
            counterparty_id: `usr_${Math.random().toString(36).slice(2, 8)}`,
            price: BASE_PRICES[order.metal] || 0,
            quantity: order.quantity,
            confidence: 0.92
        }
    };
}

/**
 * فحص صحة بيانات الطلب
 */
function validateOrder(order) {
    const errors = [];
    if (!order.metal || !METALS[order.metal]) errors.push('المعدن غير معروف');
    if (!order.quantity || order.quantity <= 0) errors.push('الكمية يجب أن تكون أكبر من صفر');
    if (!order.type || !['buy', 'sell'].includes(order.type)) errors.push('نوع الطلب غير صالح (buy/sell)');
    return { valid: errors.length === 0, errors };
}

module.exports = {
    getLivePrices, getMetalInfo, getSupportedMetals, matchOrder, validateOrder,
    METALS, BASE_PRICES
};
console.log('✅ [MARKET-ENGINE] محرك السوق الموحد — جاهز | المعادن:', Object.keys(BASE_PRICES).join(', '));
