const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), relativePath),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  const report = readJson(
    'runtime/commercial-real-activation/v1/sheikha-commercial-real-activation-v1-report.json'
  );
  const revenue = readJson(
    'runtime/revenue-engine/v1/sheikha-revenue-engine-v1.json'
  );
  const partners = readJson(
    'runtime/partner-registry/v1/sheikha-partner-registry-v1.json'
  );
  const marketplace = readJson(
    'runtime/marketplace-engine/v1/sheikha-marketplace-engine-v1.json'
  );

  return res.json({
    success: true,
    report,
    revenue,
    partners,
    marketplace,
    timestamp: new Date().toISOString()
  });
});

router.get('/guardrails', (_req, res) => {
  const providerApproval = readJson(
    'runtime/provider-approval-engine/v1/sheikha-provider-approval-engine-v1.json'
  );
  const workloadOrchestrator = readJson(
    'runtime/workload-orchestrator/v1/sheikha-workload-orchestrator-v1.json'
  );
  const sla = readJson(
    'runtime/sla-engine/v1/sheikha-sla-engine-v1.json'
  );

  return res.json({
    success: true,
    providerApproval,
    workloadOrchestrator,
    sla,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
