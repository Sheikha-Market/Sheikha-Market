// lib/services/scm.js
// مبسط: إدارة سلسلة التوريد (inventory, suppliers)

class SCM {
    constructor() {
        this.inventory = new Map(); // sku -> {qty, locations}
        this.suppliers = new Map();
    }

    addSKU(sku, qty, location='main') {
        const cur = this.inventory.get(sku) || {qty:0, locations:{}};
        cur.qty += qty;
        cur.locations[location] = (cur.locations[location] || 0) + qty;
        this.inventory.set(sku, cur);
        return cur;
    }

    reserveSKU(sku, qty) {
        const cur = this.inventory.get(sku);
        if(!cur || cur.qty < qty) throw new Error('Insufficient inventory');
        cur.qty -= qty;
        return true;
    }

    addSupplier(id, info) { this.suppliers.set(id, info); }
    getSupplier(id) { return this.suppliers.get(id); }
}

module.exports = SCM;
