// lib/services/tracking.js
// مبسط: خدمة تتبع GPS/RFID للشحنات

class Tracking {
    constructor() {
        this.paths = new Map(); // shipmentId -> [{lat,lng,ts},...]
    }

    pushPosition(shipmentId, lat, lng) {
        const seq = this.paths.get(shipmentId) || [];
        seq.push({lat, lng, ts: Date.now()});
        this.paths.set(shipmentId, seq);
        return seq[seq.length-1];
    }

    getPath(shipmentId) { return this.paths.get(shipmentId) || []; }
}

module.exports = Tracking;
