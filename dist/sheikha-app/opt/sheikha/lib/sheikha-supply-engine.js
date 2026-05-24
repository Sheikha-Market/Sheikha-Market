/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🔗 sheikha-supply-engine.js — محرك سلاسل الإمداد
 *  إدارة أوامر التوريد، المخزون، والموردين
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/supply.json');

function read() {
    try {
        if (!fs.existsSync(DATA_FILE)) return { supply_orders: [], inventory: {}, suppliers: [] };
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (_) { return { supply_orders: [], inventory: {}, suppliers: [] }; }
}
function save(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2), 'utf8'); }

function getOrders(filters={}) {
    let o = read().supply_orders || [];
    if (filters.status) o = o.filter(x => x.status === filters.status);
    return o;
}
function getInventory()   { return read().inventory || {}; }
function getSuppliers()   { return read().suppliers || []; }
function trackOrder(id)   { return (read().supply_orders || []).find(o => o.id === id) || null; }

function createOrder(params) {
    const data = read(), now = new Date().toISOString();
    const order = { id: `sup_${Date.now()}`, status: 'pending', created_at: now, ...params, checkpoints: [] };
    (data.supply_orders = data.supply_orders || []).push(order);
    data.meta = { ...(data.meta||{}), total_orders: data.supply_orders.length, last_sync: now };
    save(data);
    return { success: true, order };
}

function syncAll() {
    const data = read(), now = new Date().toISOString();
    data.meta = { ...(data.meta||{}), last_sync: now };
    save(data);
    return { success: true, synced_at: now, orders: (data.supply_orders||[]).length, suppliers: (data.suppliers||[]).length };
}

function updateOrderStatus(id, status, checkpoint=null) {
    const data = read(), now = new Date().toISOString();
    const idx  = (data.supply_orders||[]).findIndex(o => o.id === id);
    if (idx === -1) return { success: false, error: 'not_found' };
    data.supply_orders[idx].status = status;
    if (checkpoint) (data.supply_orders[idx].checkpoints = data.supply_orders[idx].checkpoints||[]).push({ ...checkpoint, at: now });
    save(data);
    return { success: true, order: data.supply_orders[idx] };
}

module.exports = { getOrders, getInventory, getSuppliers, trackOrder, createOrder, syncAll, updateOrderStatus };
console.log('✅ [SUPPLY-ENGINE] محرك سلاسل الإمداد — جاهز');
