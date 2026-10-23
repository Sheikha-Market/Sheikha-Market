'use strict';

const {
  admitGpuNode,
  buildSecureReadiness,
  issueInternalLicense
} = require('../runtime/sheikha-ai-governor/v1/sheikha-secure-large-training-v1');

describe('Sheikha secure large training V1', () => {
  test('rejects an external GPU node without zero-trust evidence', () => {
    const decision = admitGpuNode({ nodeId: 'gpu-1', gpuCount: 8, gpuMemoryGiBEach: 80 });
    expect(decision.admitted).toBe(false);
    expect(decision.blockers).toContain('MUTUAL_TLS_REQUIRED');
    expect(decision.blockers).toContain('IMMUTABLE_IMAGE_DIGEST_REQUIRED');
    expect(decision.blockers).toContain('SYSTEM_MEMORY_MINIMUM_32_GIB_REQUIRED');
    expect(decision.blockers).toContain('AUTOMATIC_SHUTDOWN_REQUIRED');
  });

  test('rejects a visible A100 when host RAM and storage are insufficient', () => {
    const hash = 'a'.repeat(64);
    const decision = admitGpuNode({
      nodeId: 'hostinger-a100-pilot', providerEvidenceSha256: hash,
      hardwareAttestationSha256: hash, imageDigest: `sha256:${hash}`,
      privateNetwork: true, mutualTls: true, diskEncryption: true,
      secretsFromVault: true, egressDefaultDeny: true, tenantIsolation: true,
      auditLogging: true, reachable: true, gpuCount: 1, gpuMemoryGiBEach: 80,
      systemMemoryGiB: 1, storageGiB: 10, hardBudgetCeilingCredits: 143,
      automaticShutdown: true
    });
    expect(decision.admitted).toBe(false);
    expect(decision.blockers).toContain('SYSTEM_MEMORY_MINIMUM_32_GIB_REQUIRED');
    expect(decision.blockers).toContain('STORAGE_MINIMUM_100_GIB_REQUIRED');
  });

  test('does not represent an internal certificate as a third-party license', () => {
    const decision = issueInternalLicense({ assetId: 'model' });
    expect(decision.status).toBe('INTERNAL_LICENSE_BLOCKED');
    expect(decision.legallyIssuedThirdPartyLicense).toBe(false);
    expect(decision.governmentAccreditation).toBe(false);
  });

  test('activates the secure fabric while blocking unevidenced training', () => {
    const readiness = buildSecureReadiness({});
    expect(readiness.fabricStatus).toBe('SECURE_FABRIC_ACTIVE');
    expect(readiness.trainingAdmissionStatus).toBe('LARGE_MODEL_FROM_SCRATCH_BLOCKED');
    expect(readiness.commercialReadiness).toBe('BLOCKED_PENDING_EVIDENCE_AND_RESOURCES');
    expect(readiness.controls.egressDefaultDeny).toBe(true);
  });

  test('accepts a fully evidenced training design without claiming a completed model', () => {
    const hash = 'a'.repeat(64);
    const readiness = buildSecureReadiness({
      nodeCandidates: [{
        nodeId: 'gpu-cluster-1', providerEvidenceSha256: hash,
        hardwareAttestationSha256: hash, imageDigest: `sha256:${hash}`,
        privateNetwork: true, mutualTls: true, diskEncryption: true,
        secretsFromVault: true, egressDefaultDeny: true, tenantIsolation: true,
        auditLogging: true, reachable: true, gpuCount: 8, gpuMemoryGiBEach: 80
        ,systemMemoryGiB: 256, storageGiB: 4096,
        hardBudgetCeilingCredits: 100000, automaticShutdown: true
      }],
      training: {
        parametersB: 7, datasetManifestSha256: hash,
        datasetTokenCount: 140000000000,
        datasetLicenseVerified: true, datasetProvenanceVerified: true,
        externalTrainingLicenseVerified: true,
        piiReviewPassed: true, tokenizerManifestSha256: hash,
        evalPlanSha256: hash, rollbackPlanSha256: hash, humanApproval: true
      },
      license: {
        assetId: 'sheikha-7b', ownerId: 'SHEIKHA', licenseTextSha256: hash,
        provenanceManifestSha256: hash, grants: ['TRAINING', 'COMMERCIAL_INFERENCE'],
        humanLegalApproval: true
      }
    });
    expect(readiness.trainingAdmissionStatus).toBe('READY_FOR_GOVERNED_DISTRIBUTED_RUN');
    expect(readiness.commercialReadiness).toBe('READY_FOR_CONTROLLED_TRAINING_NOT_YET_MODEL_PRODUCTION');
    expect(readiness.training.trainingExecuted).toBe(false);
    expect(readiness.license.legallyIssuedThirdPartyLicense).toBe(false);
  });
});
