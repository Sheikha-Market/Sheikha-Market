'use strict';

const {
  assessAsset,
  getHubStatus
} = require('../runtime/sheikha-ai-model-hub/v1/sheikha-ai-model-hub-v1');

const digest = 'a'.repeat(64);

function approvedAsset(overrides = {}) {
  return {
    assetId: 'sheikha-model-001',
    displayName: 'نموذج شيخة التجريبي',
    kind: 'SHEIKHA_OWNED_FROM_SCRATCH',
    providerClass: 'LOCAL',
    artifactSha256: digest,
    licenseId: 'SHEIKHA-PRIVATE-1.0',
    licenseEvidenceSha256: digest,
    provenanceEvidenceSha256: digest,
    evaluationEvidenceSha256: digest,
    privacyReviewPassed: true,
    securityReviewPassed: true,
    qualityGatePassed: true,
    canaryPassed: true,
    humanCommercialApproval: true,
    ...overrides
  };
}

describe('Sheikha AI Model Hub V1', () => {
  test('reports implemented capabilities and honest commercial limits', () => {
    const status = getHubStatus();
    expect(status.status).toBe('ACTIVE_WITH_GOVERNED_LIMITS');
    expect(status.release.governedPrivatePilotReady).toBe(false);
    expect(status.release.commercialLargeModelReady).toBe(false);
    expect(status.claims.customLpuBuilt).toBe(false);
  });

  test('does not approve a self-declared owned artifact or treat hashes as evidence', () => {
    const result = assessAsset(approvedAsset());
    expect(result.declarationsComplete).toBe(true);
    expect(result.commercialApproved).toBe(false);
    expect(result.rights.ownedWeights).toBe(false);
    expect(result.evidenceContentsVerified).toBe(false);
    expect(result.persisted).toBe(false);
    expect(result.automaticPublicationAllowed).toBe(false);
  });

  test('never treats external API weights as owned or delivered', () => {
    const result = assessAsset(approvedAsset({
      kind: 'EXTERNAL_API',
      providerClass: 'OPTIONAL_EXTERNAL_CONNECTOR',
      externalTermsAccepted: true
    }));
    expect(result.commercialApproved).toBe(false);
    expect(result.rights.ownedWeights).toBe(false);
    expect(result.rights.externalApiWeightsDelivered).toBe(false);
  });

  test('forces external APIs to remain optional', () => {
    const result = assessAsset(approvedAsset({
      kind: 'EXTERNAL_API',
      providerClass: 'SHEIKHA_CLOUD',
      externalTermsAccepted: true
    }));
    expect(result.commercialApproved).toBe(false);
    expect(result.blockers).toContain('EXTERNAL_API_MUST_REMAIN_OPTIONAL');
  });

  test('blocks assets without license, provenance, evaluation, and human approval', () => {
    const result = assessAsset({ assetId: 'unsafe', displayName: 'غير مكتمل' });
    expect(result.commercialApproved).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      'SUPPORTED_ASSET_KIND_REQUIRED',
      'LICENSE_EVIDENCE_DIGEST_REQUIRED',
      'PROVENANCE_EVIDENCE_DIGEST_REQUIRED',
      'EVALUATION_EVIDENCE_DIGEST_REQUIRED',
      'HUMAN_COMMERCIAL_APPROVAL_REQUIRED'
    ]));
  });

  test('does not infer customer-data reuse from a commercial approval', () => {
    const result = assessAsset(approvedAsset({ customerDataTrainingConsent: true }));
    expect(result.automaticCustomerDataReuseAllowed).toBe(false);
    expect(result.rights.customerDataReusableForSheikhaTraining).toBe(false);
  });
});
