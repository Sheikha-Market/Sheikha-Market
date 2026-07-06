#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_EVIDENCE_REGISTRY_V1..."

mkdir -p runtime/evidence-registry routes tests docs/evidence-registry

cat > runtime/evidence-registry/sheikha-evidence-registry-v1.js <<'JS'
'use strict';

const EVIDENCE_TYPES = Object.freeze([
  'log',
  'test-result',
  'audit-record',
  'governance-decision',
  'deployment-record',
  'security-event',
  'knowledge-asset',
  'impact-measurement'
]);

const GOVERNANCE = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  evidenceBeforeDecision: true,
  governanceBeforeExecution: true,
  noSecretExposure: true,
  auditEverySensitiveEvidence: true,
  humanApprovalForHighRisk: true,
  noClaimOfUnseenKnowledge: true,
  noReligiousFatwaAutomation: true
});

function status() {
  return {
    system: 'SHEIKHA_EVIDENCE_REGISTRY_V1',
    status: 'ACTIVE',
    level: 'EVIDENCE_FOUNDATION',
    above: 'SHEIKHA_MASTER_LOG_V1',
    connectsTo: [
      'SHEIKHA_MASTER_LOG_V1',
      'SHEIKHA_DECISION_REGISTRY_V2',
      'SHEIKHA_AUDIT_LEDGER',
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1'
    ],
    evidenceTypes: EVIDENCE_TYPES,
    governance: GOVERNANCE
  };
}

function schema() {
  return {
    schema: 'SHEIKHA_EVIDENCE_SCHEMA_V1',
    status: 'ACTIVE',
    fields: [
      'evidenceId',
      'timestamp',
      'source',
      'owner',
      'type',
      'classification',
      'sensitivity',
      'retentionClass',
      'message',
      'logRefs',
      'decisionRefs',
      'auditRefs',
      'knowledgeRefs',
      'impactRefs',
      'correlationId'
    ]
  };
}

function classify(input = {}) {
  const message = String(input.message || '').toLowerCase();
  const type = String(input.type || '').toLowerCase();

  const sensitive =
    message.includes('secret') ||
    message.includes('token') ||
    message.includes('api key') ||
    message.includes('password') ||
    type.includes('security');

  const highRisk =
    sensitive ||
    message.includes('leak') ||
    message.includes('breach') ||
    message.includes('critical') ||
    message.includes('production');

  return {
    engine: 'SHEIKHA_EVIDENCE_CLASSIFIER_V1',
    status: 'ACTIVE',
    classification: {
      type: EVIDENCE_TYPES.includes(type) ? type : 'log',
      sensitivity: sensitive ? 'restricted' : 'standard',
      risk: highRisk ? 'HIGH' : 'LOW',
      retentionClass: sensitive ? 'restricted-audit' : 'standard-audit',
      requiresHumanReview: highRisk
    }
  };
}

function createEvidence(input = {}) {
  const result = classify(input);
  const now = new Date().toISOString();

  return {
    registry: 'SHEIKHA_EVIDENCE_REGISTRY_V1',
    status: 'ACCEPTED_REFERENCE',
    evidence: {
      evidenceId: input.evidenceId || `ev-${Date.now()}`,
      timestamp: input.timestamp || now,
      source: input.source || 'sheikha-runtime',
      owner: input.owner || 'system',
      type: result.classification.type,
      message: String(input.message || '').slice(0, 500),
      classification: result.classification,
      refs: {
        logRefs: input.logRefs || [],
        decisionRefs: input.decisionRefs || [],
        auditRefs: input.auditRefs || [],
        knowledgeRefs: input.knowledgeRefs || [],
        impactRefs: input.impactRefs || []
      },
      correlationId: input.correlationId || 'pending-correlation'
    },
    governance: {
      evidenceBeforeDecision: true,
      noSecretExposure: true,
      requiresHumanReview: result.classification.requiresHumanReview,
      decision: result.classification.requiresHumanReview
        ? 'HUMAN_REVIEW_REQUIRED'
        : 'GOVERNED_ACCEPT'
    }
  };
}

function linkEvidence(input = {}) {
  return {
    engine: 'SHEIKHA_EVIDENCE_LINKER_V1',
    status: 'ACTIVE',
    evidenceId: input.evidenceId || 'pending-evidence',
    links: {
      logs: input.logs || [],
      decisions: input.decisions || [],
      audits: input.audits || [],
      knowledge: input.knowledge || [],
      impact: input.impact || []
    },
    rule: 'Evidence must remain traceable from event to decision to audit to impact.'
  };
}

module.exports = {
  status,
  schema,
  classify,
  createEvidence,
  linkEvidence
};
JS

cat > routes/evidence-registry-routes.js <<'JS'
'use strict';

const express = require('express');
const evidence = require('../runtime/evidence-registry/sheikha-evidence-registry-v1');

const router = express.Router();

router.get('/api/sheikha/evidence-registry/status', (req, res) => {
  res.json({ success: true, data: evidence.status() });
});

router.get('/api/sheikha/evidence-registry/schema', (req, res) => {
  res.json({ success: true, data: evidence.schema() });
});

router.post('/api/sheikha/evidence-registry/classify', (req, res) => {
  res.json({ success: true, data: evidence.classify(req.body || {}) });
});

router.post('/api/sheikha/evidence-registry/create', (req, res) => {
  res.json({ success: true, data: evidence.createEvidence(req.body || {}) });
});

router.post('/api/sheikha/evidence-registry/link', (req, res) => {
  res.json({ success: true, data: evidence.linkEvidence(req.body || {}) });
});

module.exports = router;
JS

cat > tests/sheikha-evidence-registry-v1.test.js <<'JS'
'use strict';

const evidence = require('../runtime/evidence-registry/sheikha-evidence-registry-v1');

describe('Sheikha Evidence Registry V1', () => {
  test('evidence registry is active and governed', () => {
    const result = evidence.status();
    expect(result.system).toBe('SHEIKHA_EVIDENCE_REGISTRY_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.evidenceBeforeDecision).toBe(true);
    expect(result.governance.noSecretExposure).toBe(true);
  });

  test('schema is active', () => {
    const result = evidence.schema();
    expect(result.schema).toBe('SHEIKHA_EVIDENCE_SCHEMA_V1');
    expect(result.fields).toContain('evidenceId');
    expect(result.fields).toContain('decisionRefs');
  });

  test('security evidence requires human review', () => {
    const result = evidence.createEvidence({
      type: 'security-event',
      message: 'API key token leak risk detected'
    });

    expect(result.registry).toBe('SHEIKHA_EVIDENCE_REGISTRY_V1');
    expect(result.evidence.classification.risk).toBe('HIGH');
    expect(result.governance.decision).toBe('HUMAN_REVIEW_REQUIRED');
  });

  test('evidence linker is active', () => {
    const result = evidence.linkEvidence({
      evidenceId: 'ev-test',
      decisions: ['decision-1'],
      audits: ['audit-1']
    });

    expect(result.engine).toBe('SHEIKHA_EVIDENCE_LINKER_V1');
    expect(result.links.decisions).toContain('decision-1');
  });
});
JS

cat > docs/evidence-registry/SHEIKHA-EVIDENCE-REGISTRY-V1.md <<'MD'
# SHEIKHA_EVIDENCE_REGISTRY_V1

Status: ACTIVE

## Purpose

Central evidence registry connecting Master Log, decisions, audits, knowledge, and impact.

## Lifecycle

Event → Log → Evidence → Decision → Audit → Impact → Knowledge

## Governance

- Evidence before decision
- Governance before execution
- No secret exposure
- Human approval for high risk
- No claim of unseen knowledge
- No automated religious final judgment
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()
line = "app.use(require('./routes/evidence-registry-routes'));"

if line not in s:
    anchors = [
        "app.use(require('./routes/master-log-inspector-routes'));",
        "app.use(require('./routes/master-log-routes'));",
        "app.use(require('./routes/platform-rc2-routes'));"
    ]
    for marker in anchors:
        if marker in s:
            s = s.replace(marker, marker + "\n" + line)
            break
    else:
        raise SystemExit("No suitable route anchor found in server.js")

p.write_text(s)
PY

node --check runtime/evidence-registry/sheikha-evidence-registry-v1.js
node --check routes/evidence-registry-routes.js
node --check server.js

npm test
npm run lint

git add activate-sheikha-evidence-registry-v1.sh \
  runtime/evidence-registry \
  routes/evidence-registry-routes.js \
  tests/sheikha-evidence-registry-v1.test.js \
  docs/evidence-registry \
  server.js

git commit -m "Activate Sheikha evidence registry v1"

git push origin optimization/long-tail-latency-elimination

pm2 restart sheikha-main-portal --update-env
pm2 save
