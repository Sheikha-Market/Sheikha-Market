'use strict';

const { buildSecurityToolingStatus } = require('../runtime/sheikha-studio/core/sheikha-studio-security-tooling-v1');
const { buildDualTrackPlan } = require('../runtime/sheikha-studio/core/sheikha-lmm-dual-track-production-v1');

describe('Sheikha Studio security tooling and LMM dual track', () => {
  test('preserves upstream names and licenses while registering Sheikha adapters', () => {
    const status = buildSecurityToolingStatus();
    expect(status.tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ upstream: 'tpm2-tools', sheikhaAdapterId: 'SHEIKHA_TPM2_TOOLS_ADAPTER' }),
      expect.objectContaining({ upstream: 'swtpm' }),
      expect.objectContaining({ upstream: 'OpenSSH' }),
    ]));
    expect(status.namingPolicy.noRelicensingOfThirdPartyCode).toBe(true);
    expect(status.tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ upstream: 'fwupd/LVFS' }),
      expect.objectContaining({ upstream: 'Sigstore cosign' }),
      expect.objectContaining({ upstream: 'Syft/CycloneDX/SPDX ecosystem' }),
    ]));
    expect(status.productionReady).toBe(false);
  });

  test('allows controlled serving while blocking unapproved training and automatic promotion', () => {
    const plan = buildDualTrackPlan({});
    expect(plan.servingTrack.canStartControlledPilot).toBe(true);
    expect(plan.trainingTrack.executionAuthorized).toBe(false);
    expect(plan.trainingTrack.automaticPromotion).toBe(false);
    expect(plan.trainingTrack.continuousLearningFromLiveCustomerTraffic).toBe(false);
    expect(plan.trainingTrack.blockers).toContain('LICENSED_DATASET_REQUIRED');
  });

  test('opens training execution only when every input gate is explicitly satisfied', () => {
    const plan = buildDualTrackPlan({
      datasetLicensed: true,
      privacyReviewApproved: true,
      trainingApproval: true,
      gpuRouteVerified: true,
    });
    expect(plan.trainingTrack.executionAuthorized).toBe(true);
    expect(plan.trainingTrack.blockers).toEqual([]);
  });
});
