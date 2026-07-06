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
  const readinessScore = Math.max(0, Math.min(100, Math.round((total / 8) * 100)));

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
