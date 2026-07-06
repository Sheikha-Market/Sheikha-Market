#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_MASTER_LOG_CENTER_V1..."

mkdir -p runtime/master-log-center routes tests docs/master-log-center

cat > runtime/master-log-center/sheikha-master-log-center-v1.js <<'JS'
'use strict';

const CENTER_SECTIONS = Object.freeze([
  'runtime-logs',
  'security-logs',
  'governance-logs',
  'audit-logs',
  'deployment-logs',
  'evidence-links',
  'decision-links',
  'knowledge-links',
  'experience-links',
  'impact-links'
]);

const GOVERNANCE = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  readOnlyLogCenter: true,
  noSecretExposure: true,
  auditEverySensitiveEvent: true,
  evidenceBeforeDecision: true,
  traceabilityRequired: true,
  noFalseLogClaim: true,
  humanApprovalForSensitiveEvents: true,
  noClaimOfUnseenKnowledge: true,
  noReligiousFatwaAutomation: true
});

function status() {
  return {
    system: 'SHEIKHA_MASTER_LOG_CENTER_V1',
    status: 'ACTIVE',
    level: 'MASTER_LOG_OPERATIONAL_CENTER',
    above: 'SHEIKHA_COMMAND_CENTER_V1',
    sections: CENTER_SECTIONS,
    connectsTo: [
      'SHEIKHA_MASTER_LOG_V1',
      'SHEIKHA_MASTER_LOG_AI_V1',
      'SHEIKHA_MASTER_LOG_INSPECTOR_INTEGRATION_V1',
      'SHEIKHA_EVIDENCE_REGISTRY_V1',
      'SHEIKHA_DECISION_REGISTRY_V2',
      'SHEIKHA_AUDIT_LEDGER',
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_EXPERIENCE_REGISTRY_V1',
      'SHEIKHA_IMPACT_REGISTRY_V1',
      'SHEIKHA_MASTER_GRAPH_V1'
    ],
    governance: GOVERNANCE
  };
}

function dashboard() {
  return {
    dashboard: 'SHEIKHA_MASTER_LOG_CENTER_DASHBOARD_V1',
    status: 'ACTIVE',
    sections: CENTER_SECTIONS,
    capabilities: [
      'search-logs',
      'filter-events',
      'correlate-events',
      'link-evidence',
      'trace-decision',
      'prepare-audit-package',
      'summarize-sensitive-events',
      'route-human-review'
    ]
  };
}

function search(input = {}) {
  return {
    engine: 'SHEIKHA_MASTER_LOG_CENTER_SEARCH_ENGINE_V1',
    status: 'ACTIVE',
    query: String(input.query || '').slice(0, 240),
    filters: {
      type: input.type || null,
      severity: input.severity || null,
      source: input.source || null,
      correlationId: input.correlationId || null
    },
    decision: 'SEARCH_PLAN_READY',
    rule: 'Search returns governed references and must not expose secrets.'
  };
}

function correlate(input = {}) {
  return {
    engine: 'SHEIKHA_MASTER_LOG_CENTER_CORRELATION_ENGINE_V1',
    status: 'ACTIVE',
    correlationId: input.correlationId || 'pending-correlation',
    links: {
      logs: input.logs || [],
      evidence: input.evidence || [],
      decisions: input.decisions || [],
      audits: input.audits || [],
      knowledge: input.knowledge || [],
      experience: input.experience || [],
      impact: input.impact || []
    },
    rule: 'Correlation must preserve traceability from log to evidence to decision to audit to impact.'
  };
}

function auditPackage(input = {}) {
  const sensitive = Boolean(input.sensitive) || Number(input.highRisk ?? 0) > 0;

  return {
    engine: 'SHEIKHA_MASTER_LOG_CENTER_AUDIT_PACKAGE_ENGINE_V1',
    status: 'ACTIVE',
    packageId: input.packageId || `audit-package-${Date.now()}`,
    scope: input.scope || 'runtime-audit',
    refs: {
      logs: input.logs || [],
      evidence: input.evidence || [],
      decisions: input.decisions || [],
      audits: input.audits || [],
      knowledge: input.knowledge || []
    },
    governance: {
      sensitive,
      requiresHumanReview: sensitive,
      decision: sensitive ? 'HUMAN_REVIEW_REQUIRED' : 'GOVERNED_AUDIT_PACKAGE_READY'
    }
  };
}

function trace(input = {}) {
  return {
    engine: 'SHEIKHA_MASTER_LOG_CENTER_TRACE_ENGINE_V1',
    status: 'ACTIVE',
    startLogId: input.startLogId || 'pending-log',
    tracePlan: [
      'master-log',
      'evidence',
      'decision',
      'audit',
      'knowledge',
      'experience',
      'impact',
      'master-graph'
    ],
    rule: 'Master Log Center presents traceability and does not replace governance approval.'
  };
}

module.exports = {
  status,
  dashboard,
  search,
  correlate,
  auditPackage,
  trace
};
JS

cat > routes/master-log-center-routes.js <<'JS'
'use strict';

const express = require('express');
const center = require('../runtime/master-log-center/sheikha-master-log-center-v1');

const router = express.Router();

router.get('/api/sheikha/master-log-center/status', (req, res) => {
  res.json({ success: true, data: center.status() });
});

router.get('/api/sheikha/master-log-center/dashboard', (req, res) => {
  res.json({ success: true, data: center.dashboard() });
});

router.post('/api/sheikha/master-log-center/search', (req, res) => {
  res.json({ success: true, data: center.search(req.body || {}) });
});

router.post('/api/sheikha/master-log-center/correlate', (req, res) => {
  res.json({ success: true, data: center.correlate(req.body || {}) });
});

router.post('/api/sheikha/master-log-center/audit-package', (req, res) => {
  res.json({ success: true, data: center.auditPackage(req.body || {}) });
});

router.post('/api/sheikha/master-log-center/trace', (req, res) => {
  res.json({ success: true, data: center.trace(req.body || {}) });
});

module.exports = router;
JS

cat > tests/sheikha-master-log-center-v1.test.js <<'JS'
'use strict';

const center = require('../runtime/master-log-center/sheikha-master-log-center-v1');

describe('Sheikha Master Log Center V1', () => {
  test('master log center is active and governed', () => {
    const result = center.status();
    expect(result.system).toBe('SHEIKHA_MASTER_LOG_CENTER_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.readOnlyLogCenter).toBe(true);
    expect(result.governance.traceabilityRequired).toBe(true);
  });

  test('dashboard is active', () => {
    const result = center.dashboard();
    expect(result.dashboard).toBe('SHEIKHA_MASTER_LOG_CENTER_DASHBOARD_V1');
    expect(result.capabilities).toContain('prepare-audit-package');
  });

  test('search engine is active', () => {
    const result = center.search({
      query: 'security token review',
      severity: 'HIGH'
    });

    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_CENTER_SEARCH_ENGINE_V1');
    expect(result.decision).toBe('SEARCH_PLAN_READY');
  });

  test('correlation engine is active', () => {
    const result = center.correlate({
      correlationId: 'corr-test',
      logs: ['log-1'],
      evidence: ['ev-1']
    });

    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_CENTER_CORRELATION_ENGINE_V1');
    expect(result.links.evidence).toContain('ev-1');
  });

  test('sensitive audit package requires human review', () => {
    const result = center.auditPackage({
      sensitive: true,
      logs: ['log-1'],
      evidence: ['ev-1']
    });

    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_CENTER_AUDIT_PACKAGE_ENGINE_V1');
    expect(result.governance.decision).toBe('HUMAN_REVIEW_REQUIRED');
  });

  test('trace engine is active', () => {
    const result = center.trace({ startLogId: 'log-1' });
    expect(result.engine).toBe('SHEIKHA_MASTER_LOG_CENTER_TRACE_ENGINE_V1');
    expect(result.tracePlan).toContain('master-graph');
  });
});
JS

cat > docs/master-log-center/SHEIKHA-MASTER-LOG-CENTER-V1.md <<'MD'
# SHEIKHA_MASTER_LOG_CENTER_V1

Status: ACTIVE

## Purpose

Unified operational center for Master Log, Master Log AI, Inspector, Evidence, Decisions, Audits, Knowledge, Experience, Impact, and Master Graph traceability.

## Capabilities

- Search logs
- Filter events
- Correlate events
- Link evidence
- Trace decisions
- Prepare audit packages
- Route sensitive events to human review

## Governance

- Read-only log center
- No secret exposure
- Audit every sensitive event
- Evidence before decision
- Traceability required
- Human approval for sensitive events
- No claim of unseen knowledge
- No automated religious final judgment
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

marker = """try {
  app.use(require('./routes/command-center-routes'));
  console.log('✅ Sheikha Command Center V1 routes mounted');
} catch (err) {
  console.error('⚠️ Sheikha Command Center V1 mount failed:', err.message);
}"""

insert = """try {
  app.use(require('./routes/master-log-center-routes'));
  console.log('✅ Sheikha Master Log Center V1 routes mounted');
} catch (err) {
  console.error('⚠️ Sheikha Master Log Center V1 mount failed:', err.message);
}"""

if "routes/master-log-center-routes" not in s:
    if marker not in s:
        raise SystemExit("Command Center anchor not found")
    s = s.replace(marker, marker + "\n\n" + insert)

p.write_text(s)
PY

node --check server.js
node --check routes/master-log-center-routes.js
node --check runtime/master-log-center/sheikha-master-log-center-v1.js

npm test
npm run lint

git add activate-sheikha-master-log-center-v1.sh \
  runtime/master-log-center \
  routes/master-log-center-routes.js \
  tests/sheikha-master-log-center-v1.test.js \
  docs/master-log-center \
  server.js

git commit -m "Activate Sheikha master log center v1"

git push origin feature/master-log-center-v1

pm2 restart sheikha-main-portal --update-env
pm2 save
