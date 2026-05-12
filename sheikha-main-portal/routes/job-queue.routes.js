const express = require('express');
const path = require('node:path');
const SheikhaJobQueue = require('../lib/sheikha-job-queue');

const router = express.Router();
const queue = new SheikhaJobQueue(path.join(__dirname, '..'));

router.get('/health', (req, res) => {
  res.json({
    success: true,
    engine: 'Sheikha Job Queue',
    status: 'operational'
  });
});

router.get('/stats', (req, res) => {
  res.json(queue.stats());
});

router.get('/jobs', (req, res) => {
  res.json(queue.list(req.query.status || null));
});

router.get('/next', (req, res) => {
  res.json(queue.getNext());
});

router.post('/enqueue', (req, res) => {
  res.json(queue.createJob(req.body || {}));
});

router.post('/run/:jobId', (req, res) => {
  res.json(queue.markRunning(req.params.jobId));
});

router.post('/done/:jobId', (req, res) => {
  res.json(queue.markDone(req.params.jobId, req.body || {}));
});

router.post('/fail/:jobId', (req, res) => {
  res.json(queue.markFailed(req.params.jobId, req.body?.error || 'unknown_error'));
});

module.exports = router;
