'use strict';

const {
  SheikhaGitLabFederation,
  GIT_FABRIC_CAPABILITIES,
  LAB_FABRIC_CAPABILITIES,
  GIT_PROVIDERS,
  LAB_STAGES
} = require('../runtime/sheikha-studio/git-lab/sheikha-git-lab-federation');

test('activates Sheikha Git Lab federation above unified studio kernel', () => {
  const federation = new SheikhaGitLabFederation();
  const status = federation.getStatus();

  expect(status.status).toBe('ACTIVE_SHEIKHA_GIT_LAB_FEDERATION');
  expect(status.layerRank).toBe('ABOVE_UNIFIED_STUDIO_KERNEL');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.gitFabric.capabilities).toEqual(GIT_FABRIC_CAPABILITIES);
  expect(status.gitFabric.providers).toHaveLength(GIT_PROVIDERS.length);

  expect(status.labFabric.capabilities).toEqual(LAB_FABRIC_CAPABILITIES);
  expect(status.labFabric.stages).toEqual(LAB_STAGES);
  expect(status.labFabric.sampleExperiment.status).toBe('LAB_EXPERIMENT_READY');

  expect(status.boundaries.noUngovernedCommit).toBe(true);
  expect(status.boundaries.noProductionPromotionWithoutEvidence).toBe(true);
});

test('marks Git provider live only with endpoint and credentials', () => {
  const federation = new SheikhaGitLabFederation();

  const github = federation.activateGitProvider('github', {
    endpoint: 'https://api.github.com',
    credentials: 'provided-by-secure-runtime'
  });

  const local = federation.activateGitProvider('local-git');

  expect(github.status).toBe('GIT_PROVIDER_LIVE_CONNECTED');
  expect(github.liveConnected).toBe(true);

  expect(local.status).toBe('GIT_PROVIDER_CONTRACT_READY');
  expect(local.liveConnected).toBe(false);
});

test('creates isolated lab experiment and promotion gate', () => {
  const federation = new SheikhaGitLabFederation();

  const experiment = federation.createLabExperiment({
    id: 'feature-x'
  });

  const evaluation = federation.evaluatePromotion(experiment);

  expect(experiment.status).toBe('LAB_EXPERIMENT_READY');
  expect(experiment.isolated).toBe(true);
  expect(experiment.worktreeRequired).toBe(true);
  expect(experiment.stages).toHaveLength(LAB_STAGES.length);

  expect(evaluation.status).toBe('PROMOTION_EVALUATION_READY');
  expect(evaluation.productionClaimAllowed).toBe(false);
  expect(evaluation.requirements).toContain('tests-pass');
});

test('rejects unsupported Git provider', () => {
  const federation = new SheikhaGitLabFederation();

  expect(() => federation.activateGitProvider('unknown-git'))
    .toThrow('Unsupported Sheikha Git provider');
});
