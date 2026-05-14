/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA Trade Exchange Runtime — نطاق التجارة والتبادل               ║
 * ║           SHEIKHA Sovereign Cognitive Infrastructure                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * نطاق التجارة يشمل:
 *   - الكتالوجات (catalogs)
 *   - الطلبات والعقود (orders & contracts)
 *   - التفاوض والعروض (offers & bidding)
 *   - الشركاء التجاريين (trade partners)
 *   - الامتثال الشرعي للمعاملات (shariah compliance)
 *
 * @module trade/index
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

const DOMAIN_IDENTITY = {
    name: 'SHEIKHA Trade Exchange Runtime',
    domain: 'trade',
    fabric: 'Trade Fabric',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(32);

/** @type {Map<string, object>} */
const _catalog = new Map();
/** @type {Map<string, object>} */
const _orders = new Map();
/** @type {Map<string, object>} */
const _contracts = new Map();

const _orderCounter = { value: 0 };

function listCatalog() {
    return [..._catalog.values()];
}

function addProduct(sku, product) {
    if (!product.price || product.price <= 0) {
        throw new Error(`[TRADE] سعر المنتج "${sku}" غير صالح`);
    }
    _catalog.set(sku, { ...product, sku, addedAt: new Date().toISOString() });
    _bus.emit('product:added', { sku });
}

function createOrder(buyerId, items) {
    _orderCounter.value += 1;
    const orderId = `ORD-${Date.now()}-${_orderCounter.value}`;
    const total = items.reduce((sum, item) => {
        const product = _catalog.get(item.sku);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    const order = { orderId, buyerId, items, total, status: 'pending', createdAt: new Date().toISOString() };
    _orders.set(orderId, order);
    _bus.emit('order:created', { orderId, total });
    return order;
}

function createContract(contractId, parties, terms) {
    if (!terms || !terms.length) throw new Error('[TRADE] عقد بدون شروط واضحة — غرر');
    const contract = { contractId, parties, terms, status: 'active', createdAt: new Date().toISOString() };
    _contracts.set(contractId, contract);
    _bus.emit('contract:created', { contractId });
    return contract;
}

function status() {
    return {
        ...DOMAIN_IDENTITY,
        catalogItems: _catalog.size,
        orders: _orders.size,
        contracts: _contracts.size,
    };
}

function start() {
    DOMAIN_IDENTITY.startedAt = new Date().toISOString();
    console.log(`[SHEIKHA-TRADE] ✅ نطاق التجارة والتبادل جاهز`);
    _bus.emit('domain:ready', { identity: DOMAIN_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }

module.exports = {
    start,
    listCatalog,
    addProduct,
    createOrder,
    createContract,
    status,
    on,
    DOMAIN_IDENTITY,
};
