const express = require('express');
const hub = require('../lib/sheikha-realtime-hub');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json(hub.status());
});

router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const unsubscribe = hub.subscribeBroadcast(send);

  req.on('close', () => {
    unsubscribe();
  });
});

router.get('/recent', (req, res) => {
  res.json(hub.recent());
});

router.post('/emit', (req, res) => {
  const { channel, payload } = req.body || {};
  const event = hub.publish(channel || 'custom.event', payload || {});
  res.json({ success: true, event });
});

router.post('/seed', (req, res) => {
  const data = hub.seedDemoEvents();
  res.json(data);
});

module.exports = router;
