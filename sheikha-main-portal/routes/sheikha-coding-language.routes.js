const express = require('express');
const SheikhaCodingLanguageEngine = require('../lib/sheikha-coding-language-engine');

const router = express.Router();
const engine = new SheikhaCodingLanguageEngine();

router.get('/health', (req, res) => {
  res.json(engine.health());
});

router.get('/grammar', (req, res) => {
  res.json(engine.getGrammar());
});

router.post('/parse', (req, res) => {
  const { command } = req.body || {};
  res.json(engine.parse(command));
});

router.post('/compile', (req, res) => {
  const { command } = req.body || {};
  res.json(engine.compile(command));
});

router.post('/execute', (req, res) => {
  const { command } = req.body || {};
  res.json(engine.execute(command));
});

router.post('/command', (req, res) => {
  const { command } = req.body || {};
  const execution = engine.execute(command);
  res.json(execution);
});

module.exports = router;
