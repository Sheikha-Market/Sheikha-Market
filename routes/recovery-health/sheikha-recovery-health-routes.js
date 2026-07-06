const express = require('express');
const router = express.Router();
const {
  buildCorrectiveGovernanceReport,
  buildHealthFinding,
  buildHealingPrescription
} = require('../../core/enterprise/recovery-health-governance/sheikha-recovery-health-governance');

router.get('/api/sheikha/recovery-health/v1/status', (_req, res) => {
  res.json({ success: true, status: 'ACTIVE', module: 'sheikha-recovery-health-governance' });
});

router.post('/api/sheikha/recovery-health/v1/report', express.json(), (req, res) => {
  const report = buildCorrectiveGovernanceReport(req.body || {});
  res.json(report);
});

router.post('/api/sheikha/recovery-health/v1/finding', express.json(), (req, res) => {
  const finding = buildHealthFinding(req.body || {});
  res.json(finding);
});

router.post('/api/sheikha/recovery-health/v1/prescription', express.json(), (req, res) => {
  const presc = buildHealingPrescription(req.body || {});
  res.json(presc);
});

module.exports = router;
