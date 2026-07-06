#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_ENTERPRISE_MANAGEMENT_OS_V1..."

mkdir -p runtime/enterprise-management-os routes tests docs/enterprise-management-os

cat > runtime/enterprise-management-os/sheikha-enterprise-management-os-v1.js <<'JS'
'use strict';

const DOMAINS = Object.freeze([
  'executive-board',
  'project-management',
  'operations-management',
  'asset-management',
  'support-management',
  'risk-management',
  'contract-management',
  'knowledge-management',
  'governance-management',
  'audit-management',
  'ai-management',
  'enterprise-analytics'
]);

const GOVERNANCE = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  noSecretExposure: true,
  evidenceBeforeDecision: true,
  governanceBeforeExecution: true,
  humanApprovalForHighRisk: true,
  auditEverySensitiveAction: true,
  noClaimOfUnseenKnowledge: true,
  noReligiousFatwaAutomation: true,
  noAutonomousBindingDecision: true
});

function status() {
  return {
    system: 'SHEIKHA_ENTERPRISE_MANAGEMENT_OS_V1',
    status: 'ACTIVE',
    level: 'INTEGRATED_ENTERPRISE_OPERATING_SYSTEM',
    above: 'SHEIKHA_HUB_V1',
    domains: DOMAINS,
    connectsTo: [
      'SHEIKHA_HUB_V1',
      'SHEIKHA_COMMAND_CENTER_V1',
      'SHEIKHA_MASTER_LOG_CENTER_V1',
      'SHEIKHA_MASTER_GRAPH_V1',
      'SHEIKHA_LAYER_GOVERNANCE_PROMOTION_OS_V1',
      'SHEIKHA_COVENANT_GOVERNANCE_APEX_V1',
      'SHEIKHA_PROJECT_LIFECYCLE_OS_V1',
      'SHEIKHA_SUPPLY_CHAIN_CONTROL_TOWER_V2',
      'SHEIKHA_ENTERPRISE_INSPECTOR_V3'
    ],
    governance: GOVERNANCE
  };
}

function registry() {
  return {
    registry: 'SHEIKHA_ENTERPRISE_REGISTRY_V1',
    status: 'ACTIVE',
    objects: [
      'organizations',
      'departments',
      'programs',
      'projects',
      'workstreams',
      'tasks',
      'assets',
      'people',
      'suppliers',
      'customers',
      'partners',
      'contracts',
      'risks',
      'policies',
      'decisions',
      'evidence',
      'audits'
    ]
  };
}

function portfolio(input = {}) {
  const highRisk = Number(input.highRisk ?? 0);
  return {
    engine: 'SHEIKHA_ENTERPRISE_PORTFOLIO_ENGINE_V1',
    status: 'ACTIVE',
    portfolio: {
      programs: Number(input.programs ?? 0),
      projects: Number(input.projects ?? 0),
      tasks: Number(input.tasks ?? 0),
      milestones: Number(input.milestones ?? 0),
      highRisk
    },
    governance: {
      requiresHumanReview: highRisk > 0,
      decision: highRisk > 0 ? 'HUMAN_REVIEW_REQUIRED' : 'GOVERNED_PORTFOLIO_VIEW'
    }
  };
}

function operations(input = {}) {
  return {
    engine: 'SHEIKHA_ENTERPRISE_OPERATIONS_ENGINE_V1',
    status: 'ACTIVE',
    operations: {
      runtimeHealth: input.runtimeHealth || 'UNKNOWN',
      incidents: Number(input.incidents ?? 0),
      changes: Number(input.changes ?? 0),
      deployments: Number(input.deployments ?? 0),
      supportTickets: Number(input.supportTickets ?? 0)
    },
    rule: 'Operations are measured, logged, governed, and traceable.'
  };
}

function assets(input = {}) {
  return {
    engine: 'SHEIKHA_ENTERPRISE_ASSET_ENGINE_V1',
    status: 'ACTIVE',
    assetClasses: [
      'servers',
      'applications',
      'databases',
      'ai-models',
      'repositories',
      'domains',
      'licenses',
      'contracts',
      'equipment'
    ],
    summary: {
      totalAssets: Number(input.totalAssets ?? 0),
      criticalAssets: Number(input.criticalAssets ?? 0),
      ungovernedAssets: Number(input.ungovernedAssets ?? 0)
    },
    governance: {
      decision: Number(input.ungovernedAssets ?? 0) > 0
        ? 'GOVERNANCE_REVIEW_REQUIRED'
        : 'GOVERNED_ASSET_VIEW'
    }
  };
}

function executiveTwin(input = {}) {
  const riskScore = Number(input.riskScore ?? 0);
  return {
    engine: 'SHEIKHA_EXECUTIVE_DIGITAL_TWIN_V1',
    status: 'ACTIVE',
    state: {
      enterprise: input.enterprise || 'ACTIVE_REFERENCE',
      projects: input.projects || 'UNKNOWN',
      operations: input.operations || 'UNKNOWN',
      financial: input.financial || 'NOT_CONNECTED',
      knowledge: input.knowledge || 'ACTIVE_REFERENCE',
      riskScore
    },
    decision: riskScore >= 70 ? 'EXECUTIVE_REVIEW_REQUIRED' : 'GOVERNED_EXECUTIVE_VIEW'
  };
}

function aiAdvisory(input = {}) {
  return {
    engine: 'SHEIKHA_ENTERPRISE_AI_ADVISORY_ENGINE_V1',
    status: 'ACTIVE',
    modes: [
      'generative-summary',
      'agentic-analysis',
      'risk-hints',
      'project-prioritization',
      'knowledge-reuse',
      'operations-recommendation'
    ],
    advisory: {
      request: String(input.request || '').slice(0, 300),
      recommendation: 'ADVISORY_ONLY_REQUIRES_EVIDENCE_AND_HUMAN_APPROVAL',
      executionAllowed: false
    },
    boundaries: {
      noAutonomousBindingDecision: true,
      noUnseenClaim: true,
      noSecretDisclosure: true,
      humanApprovalForExecution: true
    }
  };
}

module.exports = {
  status,
  registry,
  portfolio,
  operations,
  assets,
  executiveTwin,
  aiAdvisory
};
JS

cat > routes/enterprise-management-os-routes.js <<'JS'
'use strict';

const express = require('express');
const os = require('../runtime/enterprise-management-os/sheikha-enterprise-management-os-v1');

const router = express.Router();

router.get('/api/sheikha/enterprise-management-os/status', (req, res) => {
  res.json({ success: true, data: os.status() });
});

router.get('/api/sheikha/enterprise-management-os/registry', (req, res) => {
  res.json({ success: true, data: os.registry() });
});

router.post('/api/sheikha/enterprise-management-os/portfolio', (req, res) => {
  res.json({ success: true, data: os.portfolio(req.body || {}) });
});

router.post('/api/sheikha/enterprise-management-os/operations', (req, res) => {
  res.json({ success: true, data: os.operations(req.body || {}) });
});

router.post('/api/sheikha/enterprise-management-os/assets', (req, res) => {
  res.json({ success: true, data: os.assets(req.body || {}) });
});

router.post('/api/sheikha/enterprise-management-os/executive-twin', (req, res) => {
  res.json({ success: true, data: os.executiveTwin(req.body || {}) });
});

router.post('/api/sheikha/enterprise-management-os/ai-advisory', (req, res) => {
  res.json({ success: true, data: os.aiAdvisory(req.body || {}) });
});

module.exports = router;
JS

cat > tests/sheikha-enterprise-management-os-v1.test.js <<'JS'
'use strict';

const os = require('../runtime/enterprise-management-os/sheikha-enterprise-management-os-v1');

describe('Sheikha Enterprise Management OS V1', () => {
  test('enterprise management OS is active and governed', () => {
    const result = os.status();
    expect(result.system).toBe('SHEIKHA_ENTERPRISE_MANAGEMENT_OS_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.evidenceBeforeDecision).toBe(true);
    expect(result.governance.noAutonomousBindingDecision).toBe(true);
  });

  test('registry exposes enterprise objects', () => {
    const result = os.registry();
    expect(result.registry).toBe('SHEIKHA_ENTERPRISE_REGISTRY_V1');
    expect(result.objects).toContain('projects');
    expect(result.objects).toContain('assets');
    expect(result.objects).toContain('risks');
  });

  test('portfolio escalates high risk', () => {
    const result = os.portfolio({ projects: 5, highRisk: 2 });
    expect(result.engine).toBe('SHEIKHA_ENTERPRISE_PORTFOLIO_ENGINE_V1');
    expect(result.governance.decision).toBe('HUMAN_REVIEW_REQUIRED');
  });

  test('asset engine flags ungoverned assets', () => {
    const result = os.assets({ totalAssets: 10, ungovernedAssets: 1 });
    expect(result.engine).toBe('SHEIKHA_ENTERPRISE_ASSET_ENGINE_V1');
    expect(result.governance.decision).toBe('GOVERNANCE_REVIEW_REQUIRED');
  });

  test('executive digital twin escalates high risk score', () => {
    const result = os.executiveTwin({ riskScore: 80 });
    expect(result.engine).toBe('SHEIKHA_EXECUTIVE_DIGITAL_TWIN_V1');
    expect(result.decision).toBe('EXECUTIVE_REVIEW_REQUIRED');
  });

  test('AI advisory is advisory only', () => {
    const result = os.aiAdvisory({ request: 'prioritize projects' });
    expect(result.engine).toBe('SHEIKHA_ENTERPRISE_AI_ADVISORY_ENGINE_V1');
    expect(result.advisory.executionAllowed).toBe(false);
  });
});
JS

cat > docs/enterprise-management-os/SHEIKHA-ENTERPRISE-MANAGEMENT-OS-V1.md <<'MD'
# SHEIKHA_ENTERPRISE_MANAGEMENT_OS_V1

Status: ACTIVE

## Purpose

Integrated enterprise operating system for management, projects, operations, assets, support, risks, contracts, knowledge, governance, audit, AI advisory, and executive analytics.

## Domains

- Executive Board
- Project Management
- Operations Management
- Asset Management
- Support Management
- Risk Management
- Contract Management
- Knowledge Management
- Governance Management
- Audit Management
- AI Management
- Enterprise Analytics

## Governance

- Evidence before decision
- Governance before execution
- Human approval for high risk
- Audit every sensitive action
- No secret exposure
- No autonomous binding decision
- No claim of unseen knowledge
- No automated religious final judgment
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()
marker = "app.use(require('./routes/sheikha-intent-router'));"

insert = """app.use(require('./routes/sheikha-intent-router'));

try {
  app.use(require('./routes/enterprise-management-os-routes'));
  console.log('✅ Sheikha Enterprise Management OS V1 routes mounted');
} catch (err) {
  console.error('⚠️ Sheikha Enterprise Management OS V1 mount failed:', err.message);
}"""

if "routes/enterprise-management-os-routes" not in s:
    if marker not in s:
        raise SystemExit("Stable intent-router anchor not found")
    s = s.replace(marker, insert)

p.write_text(s)
PY

node --check server.js
node --check routes/enterprise-management-os-routes.js
node --check runtime/enterprise-management-os/sheikha-enterprise-management-os-v1.js

npm test
npm run lint

git add activate-sheikha-enterprise-management-os-v1.sh \
  runtime/enterprise-management-os \
  routes/enterprise-management-os-routes.js \
  tests/sheikha-enterprise-management-os-v1.test.js \
  docs/enterprise-management-os \
  server.js

git commit -m "Activate Sheikha enterprise management OS v1"

git push origin feature/enterprise-management-os-v1

pm2 restart sheikha-main-portal --update-env
pm2 save
