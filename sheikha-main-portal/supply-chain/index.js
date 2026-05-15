/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA Supply Chain Runtime — نطاق سلسلة الإمداد                   ║
 * ║           SHEIKHA Sovereign Cognitive Infrastructure                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * نطاق سلسلة الإمداد يشمل:
 *   - الموردون (suppliers)
 *   - المستودعات (warehouses)
 *   - الشحن والتوصيل (logistics)
 *   - إدارة المخزون (inventory)
 *   - جودة المورّد (supplier quality)
 *
 * @module supply-chain/index
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

const DOMAIN_IDENTITY = {
    name: 'SHEIKHA Supply Chain Runtime',
    domain: 'supply-chain',
    fabric: 'Supply Chain Fabric',
    version: '1.0.0',
    startedAt: null,
};

const _bus = new EventEmitter();
_bus.setMaxListeners(32);

/** @type {Map<string, object>} */
const _suppliers = new Map();
/** @type {Map<string, object>} */
const _inventory = new Map();
/** @type {Map<string, object>} */
const _shipments = new Map();

function registerSupplier(id, profile) {
    _suppliers.set(id, { ...profile, registeredAt: new Date().toISOString(), status: 'active' });
    _bus.emit('supplier:registered', { id, profile });
}

function updateInventory(sku, quantity, location = 'default') {
    const existing = _inventory.get(sku) || { sku, history: [] };
    existing.quantity = quantity;
    existing.location = location;
    existing.updatedAt = new Date().toISOString();
    existing.history.push({ quantity, at: existing.updatedAt });
    _inventory.set(sku, existing);
    _bus.emit('inventory:updated', { sku, quantity, location });
}

function createShipment(shipmentId, details) {
    _shipments.set(shipmentId, { ...details, status: 'created', createdAt: new Date().toISOString() });
    _bus.emit('shipment:created', { shipmentId });
    return { shipmentId, status: 'created' };
}

function status() {
    return { ...DOMAIN_IDENTITY, suppliers: _suppliers.size, skus: _inventory.size, shipments: _shipments.size };
}

function start() {
    DOMAIN_IDENTITY.startedAt = new Date().toISOString();
    console.log(`[SHEIKHA-SUPPLY-CHAIN] ✅ نطاق سلسلة الإمداد جاهز`);
    _bus.emit('domain:ready', { identity: DOMAIN_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }

module.exports = { start, registerSupplier, updateInventory, createShipment, status, on, DOMAIN_IDENTITY };
