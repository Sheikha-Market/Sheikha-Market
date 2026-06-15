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
  stewardshipApex: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1',
  commandCenter: 'SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1',
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
