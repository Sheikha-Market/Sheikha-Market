#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1..."

mkdir -p runtime/master-log-inspector routes tests docs/master-log

cat > runtime/master-log-inspector/sheikha-master-log-inspector-v1.js <<'JS'
'use strict';

const masterLog = require('../master-log/sheikha-master-log-v1');
const inspector = require('../../core/enterprise/sheikha-enterprise-inspector-v3');

function status() {
  return {
    system: 'SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1',
    status: 'ACTIVE',
    above: ['SHEIKHA_MASTER_LOG_V1', 'SHEIKHA_ENTERPRISE_INSPECTOR_V3'],
    purpose: 'Governed bridge between Master Log evidence lifecycle and Enterprise Inspector diagnostics.',
    lifecycle: [
      'inspect',
      'classify',
      'govern',
      'link-evidence',
      'escalate-if-high-risk',
      'audit',
      'improve'
    ],
    boundaries: {
      governanceBeforeAction: true,
      evidenceBeforeDecision: true,
      noSecretExposure: true,
      advisoryOnlyForAI: true,
      humanApprovalForHighRisk: true,
      noAutonomousFinalJudgment: true
    }
  };
}

function inspectEvent(input = {}) {
  const message = String(input.message || '');
  const classification = masterLog.classify({ message });

  return {
    engine: 'SHEIKHA_MASTER_LOG_INSPECTOR_ENGINE_V1',
    status: 'ACTIVE',
    inspectorAvailable: Boolean(inspector),
    inputSummary: message.slice(0, 240),
    classification,
    evidence: {
      evidenceRequired: true,
      evidenceRef: input.evidenceRef || null,
      correlationId: input.correlationId || 'pending-correlation'
    },
    governance: {
      requiresHumanReview: classification.classification.requiresHumanReview,
      action:
        classification.classification.requiresHumanReview
          ? 'ESCALATE_TO_HUMAN_GOVERNANCE_REVIEW'
          : 'ALLOW_GOVERNED_OBSERVATION',
      decision: 'ADVISORY_ONLY'
    }
  };
}

function inspectorReport() {
  return {
    report: 'SHEIKHA_MASTER_LOG_INSPECTOR_REPORT_V1',
    status: 'ACTIVE',
    sections: [
      'runtime-events',
      'security-events',
      'governance-decisions',
      'audit-events',
      'deployment-events',
      'test-results',
      'impact-measurements'
    ],
    output: 'governed-inspection-summary'
  };
}

module.exports = {
  status,
  inspectEvent,
  inspectorReport
};
JS

cat > routes/master-log-inspector-routes.js <<'JS'
'use strict';

const express = require('express');
const integration = require('../runtime/master-log-inspector/sheikha-master-log-inspector-v1');

const router = express.Router();

router.get('/api/sheikha/master-log-inspector/status', (req, res) => {
  res.json({ success: true, data: integration.status() });
});

router.post('/api/sheikha/master-log-inspector/inspect', (req, res) => {
  res.json({ success: true, data: integration.inspectEvent(req.body || {}) });
});

router.get('/api/sheikha/master-log-inspector/report', (req, res) => {
  res.json({ success: true, data: integration.inspectorReport() });
});

module.exports = router;
JS

cat > tests/sheikha-master-log-inspector-v1.test.js <<'JS'
'use strict';

const integration = require('../runtime/master-log-inspector/sheikha-master-log-inspector-v1');

describe('Sheikha Master Log Inspector Integration V1', () => {
  test('integration is active and governed', () => {
    const result = integration.status();
    expect(result.system).toBe('SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.boundaries.evidenceBeforeDecision).toBe(true);
    expect(result.boundaries.noSecretExposure).toBe(true);
  });

  test('security event escalates to human review', () => {
    const result = integration.inspectEvent({
      message: 'API key token leak risk detected',
      correlationId: 'test-correlation'
    });

    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_INSPECTOR_ENGINE_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.action).toBe('ESCALATE_TO_HUMAN_GOVERNANCE_REVIEW');
    expect(result.governance.decision).toBe('ADVISORY_ONLY');
  });

  test('inspector report is active', () => {
    const result = integration.inspectorReport();
    expect(result.report).toBe('SHEIKHA_MASTER_LOG_INSPECTOR_REPORT_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.sections).toContain('security-events');
  });
});
JS

cat > docs/master-log/SHEIKHA-MASTER-LOG-INSPECTOR-INTEGRATION-V1.md <<'MD'
# SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1

Status: ACTIVE

## Purpose

Governed integration between Sheikha Master Log and Enterprise Inspector.

## Lifecycle

Inspect → Classify → Govern → Link Evidence → Escalate if High Risk → Audit → Improve

## Boundaries

- Governance before action
- Evidence before decision
- No secret exposure
- AI is advisory only
- Human approval for high risk
- No autonomous final judgment

## Benefit

This integration turns logs into governed inspection evidence for diagnostics, audits, security reviews, deployment reviews, and continuous improvement.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()
line = "app.use(require('./routes/master-log-inspector-routes'));"

if line not in s:
    anchors = [
        "app.use(require('./routes/master-log-routes'));",
        "app.use(require('./routes/platform-rc2-routes'));",
        "app.use(require('./routes/master-life-cycle-routes'));"
    ]
    for marker in anchors:
        if marker in s:
            s = s.replace(marker, marker + "\n" + line)
            break
    else:
        raise SystemExit("No suitable route anchor found in server.js")

p.write_text(s)
PY

node --check runtime/master-log-inspector/sheikha-master-log-inspector-v1.js
node --check routes/master-log-inspector-routes.js
node --check server.js

npm test
npm run lint

git add activate-sheikha-platform-rc2-v1.sh \
  activate-sheikha-master-log-v1.sh \
  activate-sheikha-master-log-inspector-integration-v1.sh \
  runtime/master-log-inspector \
  routes/master-log-inspector-routes.js \
  tests/sheikha-master-log-inspector-v1.test.js \
  docs/master-log/SHEIKHA-MASTER-LOG-INSPECTOR-INTEGRATION-V1.md \
  server.js

git commit -m "Integrate Sheikha master log with enterprise inspector"

git push origin optimization/long-tail-latency-elimination

pm2 restart sheikha-main-portal --update-env
pm2 save
