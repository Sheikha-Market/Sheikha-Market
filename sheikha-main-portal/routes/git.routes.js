const express = require('express');
const router = express.Router();
const path = require('path');
const { buildGitState, saveGitState } = require('../lib/sheikha-git-engine');

const REPO_PATH = path.resolve(__dirname, '..');
const OUT_FILE = path.resolve(REPO_PATH, 'data/git-state.json');

router.get('/status', (req, res) => {
  const state = buildGitState(REPO_PATH);
  res.json(state);
});

router.post('/snapshot', (req, res) => {
  const state = saveGitState(REPO_PATH, OUT_FILE);
  res.json({ ok: true, saved: true, state });
});

router.get('/report', (req, res) => {
  try {
    const data = require(OUT_FILE);
    res.json({ ok: true, report: data });
  } catch (e) {
    res.status(404).json({ ok: false, message: 'no snapshot found' });
  }
});

module.exports = router;
