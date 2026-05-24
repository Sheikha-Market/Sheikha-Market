// lib/services/logistics.js
// مبسط: إدارة الشحنات وإنشاء الشحنات (shipment creation)

class Logistics {
    constructor() {
        this.shipments = new Map();
    }

    createShipment({id, orderId, from, to, carrier}){
        const s = {id, orderId, from, to, carrier, status:'created', createdAt:Date.now()};
        this.shipments.set(id, s);
        return s;
    }

    updateStatus(id, status) {
        const s = this.shipments.get(id);
        if(!s) throw new Error('Shipment not found');
        s.status = status; s.updatedAt = Date.now();
        return s;
    }

    getShipment(id) { return this.shipments.get(id); }
}

module.exports = Logistics;
