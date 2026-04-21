const express = require('express');
const path = require('path');
const SheikhaExecutionOrchestrator = require('../lib/sheikha-execution-orchestrator');

const router = express.Router();
const ROOT = path.join(__dirname, '..');
const orchestrator = new SheikhaExecutionOrchestrator(ROOT);

router.get('/state', (req, res) => {
  try {
    const state = orchestrator.evaluate();
    res.json(state);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/run', (req, res) => {
  try {
    const result = orchestrator.run();
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/auto', (req, res) => {
  try {
    const result = orchestrator.auto();
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/log', (req, res) => {
  try {
    const log = orchestrator.getLog();
    res.json({ ok: true, log });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
