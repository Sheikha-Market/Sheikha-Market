#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_HUB_V1..."

mkdir -p runtime/hub routes tests docs/hub

cat > runtime/hub/sheikha-hub-v1.js <<'JS'
'use strict';

const HUB_PORTALS = Object.freeze([
  'command-center',
  'master-log-center',
  'knowledge-portal',
  'governance-portal',
  'experience-portal',
  'impact-portal',
  'enterprise-portal',
  'market-portal',
  'studio',
  'foundry',
  'ai-lab',
  'super-computer'
]);

const GOVERNANCE = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  unifiedEntryPoint: true,
  noSecretExposure: true,
  readOnlyByDefault: true,
  governanceBeforeExecution: true,
  evidenceBeforeDecision: true,
  humanApprovalForHighRisk: true,
  noClaimOfUnseenKnowledge: true,
  noReligiousFatwaAutomation: true
});

function status() {
  return {
    system: 'SHEIKHA_HUB_V1',
    status: 'ACTIVE',
    level: 'UNIFIED_PLATFORM_ENTRY_POINT',
    above: 'SHEIKHA_COMMAND_CENTER_V1',
    portals: HUB_PORTALS,
    connectsTo: [
      'SHEIKHA_COMMAND_CENTER_V1',
      'SHEIKHA_MASTER_LOG_CENTER_V1',
      'SHEIKHA_MASTER_GRAPH_V1',
      'SHEIKHA_INSTITUTIONAL_MEMORY_V1',
      'SHEIKHA_IMPACT_REGISTRY_V1',
      'SHEIKHA_EXPERIENCE_REGISTRY_V1',
      'SHEIKHA_EVIDENCE_REGISTRY_V1',
      'SHEIKHA_DECISION_REGISTRY_V2',
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_AUDIT_LEDGER',
      'SHEIKHA_MASTER_LOG_V1'
    ],
    governance: GOVERNANCE
  };
}

function map() {
  return {
    map: 'SHEIKHA_HUB_MAP_V1',
    status: 'ACTIVE',
    entry: '/hub',
    portals: HUB_PORTALS.map((portal) => ({
      id: portal,
      route: `/hub/${portal}`,
      api: `/api/sheikha/hub/portal/${portal}`
    }))
  };
}

function portal(input = {}) {
  const id = String(input.portal || '').toLowerCase();
  const selected = HUB_PORTALS.includes(id) ? id : 'command-center';

  return {
    engine: 'SHEIKHA_HUB_PORTAL_ROUTER_V1',
    status: 'ACTIVE',
    portal: selected,
    route: `/hub/${selected}`,
    rule: 'Hub routes users to governed platform portals without bypassing approval controls.'
  };
}

function readiness(input = {}) {
  const scores = {
    commandCenter: Number(input.commandCenter ?? 1),
    masterLogCenter: Number(input.masterLogCenter ?? 1),
    masterGraph: Number(input.masterGraph ?? 1),
    institutionalMemory: Number(input.institutionalMemory ?? 1),
    impact: Number(input.impact ?? 1),
    experience: Number(input.experience ?? 1),
    evidence: Number(input.evidence ?? 1),
    governance: Number(input.governance ?? 1)
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const readinessScore = Math.max(0, Math.min(100, Math.round((total / 8) * 12.5)));

  return {
    engine: 'SHEIKHA_HUB_READINESS_ENGINE_V1',
    status: 'ACTIVE',
    scores: {
      ...scores,
      hubReadinessScore: readinessScore
    },
    decision: readinessScore >= 90 ? 'HUB_READY' : 'HUB_NEEDS_COMPLETION'
  };
}

module.exports = {
  status,
  map,
  portal,
  readiness
};
JS

cat > routes/hub-routes.js <<'JS'
'use strict';

const express = require('express');
const hub = require('../runtime/hub/sheikha-hub-v1');

const router = express.Router();

router.get('/api/sheikha/hub/status', (req, res) => {
  res.json({ success: true, data: hub.status() });
});

router.get('/api/sheikha/hub/map', (req, res) => {
  res.json({ success: true, data: hub.map() });
});

router.post('/api/sheikha/hub/portal', (req, res) => {
  res.json({ success: true, data: hub.portal(req.body || {}) });
});

router.post('/api/sheikha/hub/readiness', (req, res) => {
  res.json({ success: true, data: hub.readiness(req.body || {}) });
});

module.exports = router;
JS

cat > tests/sheikha-hub-v1.test.js <<'JS'
'use strict';

const hub = require('../runtime/hub/sheikha-hub-v1');

describe('Sheikha Hub V1', () => {
  test('hub is active and governed', () => {
    const result = hub.status();
    expect(result.system).toBe('SHEIKHA_HUB_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.unifiedEntryPoint).toBe(true);
    expect(result.governance.noSecretExposure).toBe(true);
  });

  test('hub map exposes command center and master log center', () => {
    const result = hub.map();
    const ids = result.portals.map((p) => p.id);
    expect(ids).toContain('command-center');
    expect(ids).toContain('master-log-center');
  });

  test('portal router routes known portal', () => {
    const result = hub.portal({ portal: 'master-log-center' });
    expect(result.engine).toBe('SHEIKHA_HUB_PORTAL_ROUTER_V1');
    expect(result.portal).toBe('master-log-center');
  });

  test('readiness engine marks hub ready', () => {
    const result = hub.readiness({
      commandCenter: 1,
      masterLogCenter: 1,
      masterGraph: 1,
      institutionalMemory: 1,
      impact: 1,
      experience: 1,
      evidence: 1,
      governance: 1
    });

    expect(result.engine).toBe('SHEIKHA_HUB_READINESS_ENGINE_V1');
    expect(result.decision).toBe('HUB_READY');
  });
});
JS

cat > docs/hub/SHEIKHA-HUB-V1.md <<'MD'
# SHEIKHA_HUB_V1

Status: ACTIVE

## Purpose

Unified platform entry point for Sheikha portals, command center, master log center, knowledge, governance, experience, impact, enterprise, market, studio, foundry, AI lab, and super computer.

## Governance

- Unified entry point
- Read-only by default
- No secret exposure
- Governance before execution
- Evidence before decision
- Human approval for high risk
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
  app.use(require('./routes/hub-routes'));
  console.log('✅ Sheikha Hub V1 routes mounted');
} catch (err) {
  console.error('⚠️ Sheikha Hub V1 mount failed:', err.message);
}"""

if "routes/hub-routes" not in s:
    if marker not in s:
        raise SystemExit("Stable intent-router anchor not found")
    s = s.replace(marker, insert)

p.write_text(s)
PY

node --check server.js
node --check routes/hub-routes.js
node --check runtime/hub/sheikha-hub-v1.js

npm test
npm run lint

git add activate-sheikha-hub-v1.sh \
  runtime/hub \
  routes/hub-routes.js \
  tests/sheikha-hub-v1.test.js \
  docs/hub \
  server.js

git commit -m "Activate Sheikha hub v1"

git push origin feature/hub-v1-clean

pm2 restart sheikha-main-portal --update-env
pm2 save
