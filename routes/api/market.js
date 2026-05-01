// routes/api/market.js
// Express router exposing simplified market + ops endpoints for demo

const express = require('express');
const router = express.Router();

const ERP = require('../../lib/services/erp');
const SCM = require('../../lib/services/scm');
const CX = require('../../lib/services/cx');
const Logistics = require('../../lib/services/logistics');
const Tracking = require('../../lib/services/tracking');

const erp = new ERP();
const scm = new SCM();
const cx = new CX();
const logistics = new Logistics();
const tracking = new Tracking();

// create order
router.post('/order', (req,res)=>{
    const order = erp.createOrder(req.body);
    try { scm.reserveSKU(order.items[0].sku, order.items[0].qty); } catch(e){ /* ignore in demo */ }
    const invoice = erp.createInvoice(order.id);
    res.json({order, invoice});
});

router.get('/order/:id', (req,res)=>{
    const o = erp.getOrder(req.params.id);
    if(!o) return res.status(404).json({error:'not found'});
    res.json(o);
});

// shipment
router.post('/shipment', (req,res)=>{
    const s = logistics.createShipment(req.body);
    res.json(s);
});

router.post('/track/:shipmentId', (req,res)=>{
    const p = tracking.pushPosition(req.params.shipmentId, req.body.lat, req.body.lng);
    res.json(p);
});

router.get('/track/:shipmentId', (req,res)=>{
    res.json(tracking.getPath(req.params.shipmentId));
});

module.exports = router;
