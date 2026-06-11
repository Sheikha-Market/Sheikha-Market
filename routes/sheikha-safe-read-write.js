'use strict';

const express = require('express');
const router = express.Router();
const rw = require('../runtime/execution/sheikha-safe-read-write-v1');

router.use(express.json({ limit: '5mb' }));

router.get('/api/sheikha/fs/status', (req, res) => {
  res.json({ success: true, ...rw.status() });
});

router.post('/api/sheikha/fs/read', (req, res) => {
  try {
    res.json({ success: true, ...rw.readFile(req.body.path) });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message, details: e.details || null });
  }
});

router.post('/api/sheikha/fs/write', (req, res) => {
  try {
    res.json({ success: true, ...rw.writeFile(req.body.path, req.body.content, { reason: req.body.reason }) });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message, details: e.details || null });
  }
});

router.post('/api/sheikha/fs/append', (req, res) => {
  try {
    res.json({ success: true, ...rw.appendFile(req.body.path, req.body.content, { reason: req.body.reason }) });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message, details: e.details || null });
  }
});

module.exports = router;
