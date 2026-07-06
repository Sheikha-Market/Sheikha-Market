// routes/bus/fabric.js — REST API for SHEIKHA_RUNTIME_BUS_FABRIC
const express = require('express');
const router = express.Router();
const path = require('path');
const optionalRequire = p => { try { return require(p); } catch { return null; } };
const BusFabric = optionalRequire(path.resolve(__dirname, '../../core/kernel/bus/sheikha-runtime-bus-fabric'));

const bus = BusFabric ? new BusFabric() : null;

router.get('/status', (req, res) => {
    if (!bus) return res.status(501).json({ success: false, message: 'Bus Fabric غير متوفر' });
    res.json({ success: true, ...bus.getStatus() });
});

router.get('/channels', (req, res) => {
    if (!bus) return res.status(501).json({ success: false });
    res.json({ success: true, channels: bus.getChannels() });
});

router.post('/signal', express.json(), (req, res) => {
    if (!bus) return res.status(501).json({ success: false });
    const { channel, signal } = req.body || {};
    if (!channel || !signal) return res.status(400).json({ success: false, message: 'channel/signal required' });
    bus.routeSignal(channel, signal);
    res.json({ success: true, message: 'Signal routed', channel, signal });
});

router.get('/diagnostics', (req, res) => {
    if (!bus) return res.status(501).json({ success: false });
    res.json({ success: true, diagnostics: bus.diagnostics() });
});

router.post('/report', (req, res) => {
    if (!bus) return res.status(501).json({ success: false });
    const file = bus.writeReport();
    res.json({ success: true, file });
});

module.exports = router;
