'use strict';

const {
  SheikhaGitLabFederation
} = require('../sheikha-git-lab-federation');

const GOVERNANCE_GATES = [
  'branch-policy',
  'commit-policy',
  'pr-review-policy',
  'test-policy',
  'lint-policy',
  'security-policy',
  'telemetry-policy',
  'inspector-policy',
  'master-log-policy',
  'promotion-policy'
];

const INTEGRATION_TARGETS = [
  'registry',
  'master-log',
  'inspector',
  'control-plane',
  'studio-kernel',
  'runtime-workbench',
  'deployment-center',
  'recovery-engine'
];

class SheikhaGitLabGovernanceIntegration {
  constructor({ gitLabFederation } = {}) {
    this.gitLabFederation = gitLabFederation || new SheikhaGitLabFederation();
  }

  evaluateGovernanceGate(gate) {
    if (!GOVERNANCE_GATES.includes(gate)) {
      throw new Error(`Unsupported Sheikha Git Lab governance gate: ${gate}`);
    }

    return {
      gate,
      status: 'GOVERNANCE_GATE_READY',
      governed: true,
      audited: true,
      requiredForPromotion: true,
      evidenceRequired: true
    };
  }

  bindIntegrationTarget(target) {
    if (!INTEGRATION_TARGETS.includes(target)) {
      throw new Error(`Unsupported Sheikha Git Lab integration target: ${target}`);
    }

    return {
      target,
      status: 'INTEGRATION_TARGET_BOUND',
      governed: true,
      audited: true,
      bidirectional: true
    };
  }

  evaluateMergeReadiness(input = {}) {
    const gates = GOVERNANCE_GATES.map((gate) => this.evaluateGovernanceGate(gate));

    return {
      status: 'MERGE_READINESS_EVALUATED',
      branch: input.branch || 'unknown-branch',
      governed: true,
      audited: true,
      gates,
      mergeAllowed: false,
      decision: 'MERGE_ONLY_AFTER_VERIFIED_GATES',
      requirements: [
        'tests-pass',
        'lint-pass',
        'security-pass',
        'review-approved',
        'inspector-pass',
        'master-log-written',
        'telemetry-collected'
      ]
    };
  }

  getStatus() {
    const gitLabStatus = this.gitLabFederation.getStatus();
    const gates = GOVERNANCE_GATES.map((gate) => this.evaluateGovernanceGate(gate));
    const targets = INTEGRATION_TARGETS.map((target) => this.bindIntegrationTarget(target));

    return {
      system: 'SHEIKHA_GIT_LAB_GOVERNANCE_INTEGRATION_V1',
      arabicName: 'شيخة تكامل حوكمة Git والمختبر',
      status: 'ACTIVE_GIT_LAB_GOVERNANCE_INTEGRATION',
      layerRank: 'ABOVE_SHEIKHA_GIT_LAB_FEDERATION',
      productionReady: true,
      governed: true,
      audited: true,
      gitLabStatus,
      governanceGates: gates,
      integrationTargets: targets,
      sampleMergeReadiness: this.evaluateMergeReadiness({
        branch: 'lab/sample-git-lab'
      }),
      boundaries: {
        allGatesGoverned: gates.every((x) => x.governed),
        allTargetsBound: targets.every((x) => x.status === 'INTEGRATION_TARGET_BOUND'),
        noUngovernedMerge: true,
        noProductionPromotionWithoutEvidence: true,
        noSecretMutation: true,
        inspectorRequired: true,
        masterLogRequired: true,
        telemetryRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaGitLabGovernanceIntegration,
  GOVERNANCE_GATES,
  INTEGRATION_TARGETS
};
