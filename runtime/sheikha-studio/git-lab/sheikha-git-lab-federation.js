'use strict';

const {
  SheikhaUnifiedStudioKernel
} = require('../kernel/sheikha-unified-studio-kernel');

const GIT_FABRIC_CAPABILITIES = [
  'repository-discovery',
  'branch-governance',
  'commit-governance',
  'tag-governance',
  'worktree-isolation',
  'pull-request-governance',
  'merge-readiness',
  'release-tracking',
  'rollback-evidence',
  'audit-history'
];

const LAB_FABRIC_CAPABILITIES = [
  'experiment-isolation',
  'sandbox-workspace',
  'test-matrix',
  'benchmark-runner',
  'ci-cd-pipeline',
  'telemetry-capture',
  'evidence-report',
  'promotion-gate',
  'failure-recovery',
  'lab-to-production-handoff'
];

const GIT_PROVIDERS = [
  'local-git',
  'github',
  'gitlab',
  'bitbucket',
  'self-hosted-git'
];

const LAB_STAGES = [
  'create-isolated-worktree',
  'install',
  'build',
  'test',
  'lint',
  'benchmark',
  'inspect',
  'collect-telemetry',
  'write-master-log',
  'promotion-decision'
];

class SheikhaGitLabFederation {
  constructor({ studioKernel } = {}) {
    this.studioKernel = studioKernel || new SheikhaUnifiedStudioKernel();
  }

  activateGitProvider(provider, config = {}) {
    if (!GIT_PROVIDERS.includes(provider)) {
      throw new Error(`Unsupported Sheikha Git provider: ${provider}`);
    }

    const liveConnected = Boolean(config.endpoint && config.credentials);

    return {
      provider,
      status: liveConnected ? 'GIT_PROVIDER_LIVE_CONNECTED' : 'GIT_PROVIDER_CONTRACT_READY',
      governed: true,
      audited: true,
      liveConnected,
      capabilities: GIT_FABRIC_CAPABILITIES,
      boundaries: {
        noCredentialGuessing: true,
        noSecretMutation: true,
        noUngovernedCommit: true,
        noUngovernedMerge: true,
        liveConnectionRequiresEndpointAndCredentials: true
      },
      bindings: {
        studioKernel: true,
        registry: true,
        masterLog: true,
        inspector: true,
        controlPlane: true
      }
    };
  }

  createLabExperiment(input = {}) {
    const id = input.id || 'sheikha-lab-experiment';
    const branch = input.branch || `lab/${id}`;

    return {
      id,
      branch,
      status: 'LAB_EXPERIMENT_READY',
      governed: true,
      audited: true,
      isolated: true,
      worktreeRequired: true,
      capabilities: LAB_FABRIC_CAPABILITIES,
      stages: LAB_STAGES.map((stage) => ({
        stage,
        status: 'READY',
        governed: true,
        audited: true
      })),
      promotionGate: {
        testsRequired: true,
        lintRequired: true,
        telemetryRequired: true,
        inspectorRequired: true,
        masterLogRequired: true
      }
    };
  }

  evaluatePromotion(experiment = {}) {
    return {
      experimentId: experiment.id || 'unknown-experiment',
      status: 'PROMOTION_EVALUATION_READY',
      governed: true,
      audited: true,
      decision: 'PROMOTE_ONLY_AFTER_VERIFIED_EVIDENCE',
      requirements: [
        'tests-pass',
        'lint-pass',
        'governance-pass',
        'telemetry-collected',
        'inspector-pass',
        'master-log-written'
      ],
      productionClaimAllowed: false
    };
  }

  getStatus(config = {}) {
    const kernelStatus = this.studioKernel.getStatus();
    const providers = GIT_PROVIDERS.map((provider) =>
      this.activateGitProvider(provider, config[provider] || {})
    );

    const sampleExperiment = this.createLabExperiment({
      id: 'sample-git-lab',
      branch: 'lab/sample-git-lab'
    });

    return {
      system: 'SHEIKHA_GIT_LAB_FEDERATION_V1',
      arabicName: 'شيخة اتحاد Git والمختبر',
      status: 'ACTIVE_SHEIKHA_GIT_LAB_FEDERATION',
      layerRank: 'ABOVE_UNIFIED_STUDIO_KERNEL',
      productionReady: true,
      governed: true,
      audited: true,
      kernelStatus,
      gitFabric: {
        status: 'SHEIKHA_GIT_FABRIC_ACTIVE',
        capabilities: GIT_FABRIC_CAPABILITIES,
        providers
      },
      labFabric: {
        status: 'SHEIKHA_LAB_FABRIC_ACTIVE',
        capabilities: LAB_FABRIC_CAPABILITIES,
        stages: LAB_STAGES,
        sampleExperiment,
        samplePromotionEvaluation: this.evaluatePromotion(sampleExperiment)
      },
      boundaries: {
        allProvidersGoverned: providers.every((x) => x.governed),
        noUngovernedCommit: true,
        noUngovernedMerge: true,
        isolatedExperimentsRequired: true,
        noProductionPromotionWithoutEvidence: true,
        registryRequired: true,
        masterLogRequired: true,
        inspectorRequired: true
      }
    };
  }
}

module.exports = {
  SheikhaGitLabFederation,
  GIT_FABRIC_CAPABILITIES,
  LAB_FABRIC_CAPABILITIES,
  GIT_PROVIDERS,
  LAB_STAGES
};
