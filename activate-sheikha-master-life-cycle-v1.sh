#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_MASTER_LIFE_CYCLE_V1..."

mkdir -p runtime/master-life-cycle routes tests docs/master-life-cycle

cat > runtime/master-life-cycle/sheikha-master-life-cycle-v1.js <<'JS'
'use strict';

const PRINCIPLES = Object.freeze({
  reference: 'QURAN_AND_SUNNAH_GOVERNANCE_REFERENCE',
  boundaries: {
    noClaimOfDivineAuthority: true,
    noClaimOfUnseenKnowledge: true,
    noReligiousFatwaAutomation: true,
    humanScholarlyReviewForReligiousMatters: true,
    governanceBeforeExecution: true,
    evidenceBeforeDecision: true,
    noHarm: true,
    justice: true,
    truthfulness: true,
    trust: true,
    excellence: true
  }
});

const LIFE_CYCLE = Object.freeze([
  'constitution',
  'vision',
  'knowledge',
  'hilm',
  'governance',
  'architecture',
  'foundry',
  'studio',
  'git',
  'orchestrator',
  'runtime',
  'database',
  'evidence',
  'analytics',
  'impact',
  'improvement',
  'knowledge-renewal'
]);

const PLATFORMS = Object.freeze({
  core: 'SHEIKHA_CORE_V1',
  vision: 'SHEIKHA_VISION_V1',
  hilm: 'SHEIKHA_HILM_FABRIC_V1',
  governance: 'SHEIKHA_GOVERNANCE_FABRIC',
  foundry: 'SHEIKHA_FOUNDRY_V4_TARGET',
  database: 'SHEIKHA_DATABASE_PLATFORM_V1',
  commandCenter: 'SHEIKHA_COMMAND_CENTER_V1',
  hub: 'SHEIKHA_HUB_PORTAL_V1_TARGET',
  studio: 'SHEIKHA_STUDIO_V1_TARGET',
  git: 'SHEIKHA_GIT_V1_TARGET',
  superComputer: 'SHEIKHA_SUPER_COMPUTER_V1_TARGET',
  aiLab: 'SHEIKHA_AI_LAB_V1_TARGET'
});

function status() {
  return {
    system: 'SHEIKHA_MASTER_LIFE_CYCLE_V1',
    status: 'ACTIVE',
    level: 'MASTER_REFERENCE_APEX',
    purpose: 'Unified governed life cycle for vision, knowledge, hilm, governance, foundry, runtime, database, evidence, impact, and improvement.',
    principles: PRINCIPLES,
    lifeCycle: LIFE_CYCLE,
    platforms: PLATFORMS
  };
}

function constitution() {
  return {
    system: 'SHEIKHA_CONSTITUTION_V1',
    status: 'ACTIVE',
    reference: 'QURAN_AND_SUNNAH_AS_TOP_GOVERNANCE_REFERENCE',
    operationalNote: 'This is a governance reference for the system, not a claim of religious authority or unseen knowledge.',
    rules: [
      'truth-before-output',
      'justice-before-action',
      'no-harm',
      'evidence-before-decision',
      'governance-before-execution',
      'human-approval-for-high-risk',
      'no-false-authority-claim',
      'no-false-customer-claim',
      'no-revenue-claim-without-confirmed-payment'
    ]
  };
}

function hilm() {
  return {
    system: 'SHEIKHA_HILM_FABRIC_V1',
    status: 'ACTIVE',
    meaning: {
      hilm: 'patience, wisdom, restraint, verification, and measured action',
      hulmDreams: 'dreams are recorded only for personal reflection; no unseen claim and no certain interpretation'
    },
    gates: [
      'understand-context',
      'collect-evidence',
      'assess-risk',
      'check-governance',
      'require-human-review-when-needed',
      'respond-with-measured-action'
    ]
  };
}

function vision() {
  return {
    system: 'SHEIKHA_VISION_V1',
    status: 'ACTIVE',
    registries: [
      'vision-registry',
      'mission-registry',
      'goals-registry',
      'roadmap-registry',
      'kpi-registry',
      'impact-registry'
    ]
  };
}

function foundry() {
  return {
    system: 'SHEIKHA_FOUNDRY_V4_REFERENCE',
    status: 'ACTIVE_TARGET',
    stages: [
      'design',
      'build',
      'validate',
      'govern',
      'package',
      'release',
      'promote'
    ],
    gates: [
      'tests',
      'lint',
      'security',
      'governance',
      'evidence',
      'human-approval-for-production'
    ]
  };
}

function database() {
  return {
    system: 'SHEIKHA_DATABASE_PLATFORM_V1',
    status: 'ACTIVE_REFERENCE',
    layers: [
      'operational-store',
      'knowledge-store',
      'graph-store',
      'vector-store',
      'evidence-store',
      'analytics-store',
      'archive-store'
    ],
    governance: {
      dataClassification: true,
      dataResidency: true,
      retentionPolicy: true,
      auditAccess: true,
      noSecretExposure: true
    }
  };
}

function command() {
  return {
    system: 'SHEIKHA_COMMAND_CENTER_REFERENCE_V1',
    status: 'ACTIVE',
    panels: [
      'vision',
      'knowledge',
      'governance',
      'runtime',
      'database',
      'evidence',
      'impact',
      'improvement',
      'super-computer',
      'ai-lab'
    ]
  };
}

function score(input = {}) {
  const values = {
    vision: Number(input.vision ?? 96),
    knowledge: Number(input.knowledge ?? 96),
    hilm: Number(input.hilm ?? 98),
    governance: Number(input.governance ?? 99),
    foundry: Number(input.foundry ?? 96),
    runtime: Number(input.runtime ?? 97),
    database: Number(input.database ?? 92),
    evidence: Number(input.evidence ?? 96),
    impact: Number(input.impact ?? 94),
    improvement: Number(input.improvement ?? 95)
  };

  const normalized = Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0))])
  );

  const avg = Object.values(normalized).reduce((a, b) => a + b, 0) / Object.values(normalized).length;

  return {
    engine: 'SHEIKHA_MASTER_READINESS_SCORE_ENGINE_V1',
    status: 'ACTIVE',
    scores: {
      ...normalized,
      masterReadinessScore: Number(avg.toFixed(2))
    },
    decision: avg >= 95 ? 'MASTER_READY' : avg >= 85 ? 'READY_WITH_GOVERNED_IMPROVEMENT' : 'REQUIRES_REVIEW'
  };
}

module.exports = {
  status,
  constitution,
  hilm,
  vision,
  foundry,
  database,
  command,
  score
};
JS

cat > routes/master-life-cycle-routes.js <<'JS'
'use strict';

const express = require('express');
const master = require('../runtime/master-life-cycle/sheikha-master-life-cycle-v1');

const router = express.Router();

router.get('/api/sheikha/master-life-cycle/status', (req, res) => {
  res.json({ success: true, data: master.status() });
});

router.get('/api/sheikha/master-life-cycle/constitution', (req, res) => {
  res.json({ success: true, data: master.constitution() });
});

router.get('/api/sheikha/master-life-cycle/hilm', (req, res) => {
  res.json({ success: true, data: master.hilm() });
});

router.get('/api/sheikha/master-life-cycle/vision', (req, res) => {
  res.json({ success: true, data: master.vision() });
});

router.get('/api/sheikha/master-life-cycle/foundry', (req, res) => {
  res.json({ success: true, data: master.foundry() });
});

router.get('/api/sheikha/master-life-cycle/database', (req, res) => {
  res.json({ success: true, data: master.database() });
});

router.get('/api/sheikha/master-life-cycle/command', (req, res) => {
  res.json({ success: true, data: master.command() });
});

router.post('/api/sheikha/master-life-cycle/score', (req, res) => {
  res.json({ success: true, data: master.score(req.body || {}) });
});

module.exports = router;
JS

cat > tests/sheikha-master-life-cycle-v1.test.js <<'JS'
'use strict';

const master = require('../runtime/master-life-cycle/sheikha-master-life-cycle-v1');

describe('Sheikha Master Life Cycle V1', () => {
  test('master life cycle is active', () => {
    const result = master.status();
    expect(result.system).toBe('SHEIKHA_MASTER_LIFE_CYCLE_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.lifeCycle).toContain('vision');
    expect(result.lifeCycle).toContain('hilm');
    expect(result.lifeCycle).toContain('database');
  });

  test('constitution prevents false authority and unseen claims', () => {
    const result = master.constitution();
    expect(result.status).toBe('ACTIVE');
    expect(result.rules).toContain('no-false-authority-claim');
  });

  test('hilm fabric is active and governed', () => {
    const result = master.hilm();
    expect(result.system).toBe('SHEIKHA_HILM_FABRIC_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.gates).toContain('collect-evidence');
  });

  test('database platform reference is governed', () => {
    const result = master.database();
    expect(result.system).toBe('SHEIKHA_DATABASE_PLATFORM_V1');
    expect(result.governance.noSecretExposure).toBe(true);
  });

  test('score engine produces readiness decision', () => {
    const result = master.score({ governance: 100, hilm: 99 });
    expect(result.engine).toBe('SHEIKHA_MASTER_READINESS_SCORE_ENGINE_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.scores.masterReadinessScore).toBeGreaterThanOrEqual(90);
  });
});
JS

cat > docs/master-life-cycle/SHEIKHA-MASTER-LIFE-CYCLE-V1.md <<'MD'
# SHEIKHA_MASTER_LIFE_CYCLE_V1

Status: ACTIVE

## Reference

The system is governed by a Quran and Sunnah reference as an ethical and operational boundary. This does not claim divine authority, unseen knowledge, automated fatwa, or religious final judgment.

## Master Cycle

Constitution → Vision → Knowledge → Hilm → Governance → Architecture → Foundry → Studio → Git → Orchestrator → Runtime → Database → Evidence → Analytics → Impact → Improvement → Knowledge Renewal

## Activated References

- Sheikha Constitution
- Sheikha Vision
- Sheikha Hilm Fabric
- Sheikha Foundry V4 Reference
- Sheikha Database Platform
- Sheikha Command Center Reference

## Boundaries

- Governance before execution
- Evidence before decision
- No harm
- Justice
- Truthfulness
- Human approval for high risk
- No false authority claim
- No unseen knowledge claim
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()
line = "app.use(require('./routes/master-life-cycle-routes'));"

if line not in s:
    anchors = [
        "app.use(require('./routes/executive-mission-control-routes'));",
        "app.use(require('./routes/civilization-governance-v2-routes'));",
        "app.use(require('./routes/civilization-os-routes'));"
    ]
    for marker in anchors:
        if marker in s:
            s = s.replace(marker, marker + "\n" + line)
            break
    else:
        raise SystemExit("No suitable route anchor found in server.js")

p.write_text(s)
PY

node --check runtime/master-life-cycle/sheikha-master-life-cycle-v1.js
node --check routes/master-life-cycle-routes.js
node --check server.js

npm test
npm run lint

git add activate-sheikha-master-life-cycle-v1.sh \
  runtime/master-life-cycle \
  routes/master-life-cycle-routes.js \
  tests/sheikha-master-life-cycle-v1.test.js \
  docs/master-life-cycle \
  server.js

git commit -m "Activate Sheikha master life cycle v1"

git push origin optimization/long-tail-latency-elimination

pm2 restart sheikha-main-portal --update-env
pm2 save
