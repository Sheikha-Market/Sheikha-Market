'use strict';

const express = require('express');
const request = require('supertest');
const { buildRuntimeApexStatus, readRepairEvidence } = require('../runtime/sheikha-studio/core/sheikha-runtime-apex-v2');
const router = require('../routes/sheikha-runtime-apex-v2');

describe('Sheikha Runtime Apex V2', () => {
  test('converges on the live ecosystem and repaired TPM evidence', () => {
    const status = buildRuntimeApexStatus();
    expect(status.status).toBe('ACTIVE_GOVERNED_LOCAL_CONTROL_PLANE');
    expect(status.productCount).toBe(22);
    expect(status.tpm.framingRepair).toMatchObject({
      present: true,
      correctedBytes: 70,
      removedBytes: 2,
      correctedSha256: '1a7e5fe77bf641430fc0f8ecaf60f11f4c6d15294ba47cbe8d9af9432052c50b',
    });
    expect(status.tpm.physicalActivationAuthorized).toBe(false);
    expect(status.tpm.contextObservationDiagnosis).toMatchObject({
      present: true,
      classification: 'SAVED_TPM_CONTEXT_INTEGRITY_REJECTED_BEFORE_READPUBLIC',
    });
    expect(status.tpm.readOnlyInventory).toMatchObject({
      present: true,
      status: 'READ_ONLY_INVENTORY_COMPLETE',
      inventory: { persistentHandles: [], transientHandles: [] },
    });
    expect(status.tpm.activateCredentialV2).toMatchObject({
      present: true,
      verified: true,
      resultDigestValid: true,
      status: 'ACTIVATECREDENTIAL_V2_VERIFIED_SINGLE_USE_COMPLETE',
      activateCredentialCalls: 1,
      recoveredCredentialMatches: true,
    });
    expect(status.tpm.deviceIdentityBindingVerified).toBe(true);
    expect(status.tpm.activationAuthorizationReusable).toBe(false);
    expect(status.tpm.quoteAttestationContractV2).toMatchObject({
      present: true,
      contractDigestValid: true,
      authorizationGranted: false,
      maximumQuoteCalls: 1,
    });
    expect(status.tpm.currentGeneration).toBe('V3');
    expect(status.tpm.v3).toMatchObject({
      currentGenerationReadyForAuthorization: true,
      activateCredentialExecuted: false,
      previousAuthorizationReusable: false,
      observation: { verified: true },
      authorizationReview: {
        verified: true,
        maximumActivateCredentialCalls: 1,
        physicalExecutionAuthorized: false,
        authorizationIssued: false,
      },
    });
    expect(status.tpm.quoteAttestationContractV2CompatibleWithCurrentGeneration).toBe(false);
    expect(status.tpm.nextStage).toBe('AWAIT_EXPLICIT_SINGLE_USE_TPM_ACTIVATECREDENTIAL_V3_AUTHORIZATION');
    expect(status.firmware.writeAuthorized).toBe(false);
    expect(status.visualIntelligence).toMatchObject({
      system: 'SHEIKHA_VISUAL_FABRIC_V1',
      status: 'GOVERNED_LOCAL_VISUAL_PILOT',
      commercialRelease: { allowed: false },
    });
    expect(status.visualFabricV2).toMatchObject({
      system: 'SHEIKHA_VISUAL_FABRIC_V2_APEX_BRIDGE',
      status: 'SOURCE_INTEGRATED_LOCAL_RUNTIME_AVAILABLE',
      selfTestPassed: true,
    });
  });

  test('binds the repair report by digest', () => {
    expect(readRepairEvidence().reportSha256).toBe(
      'd970064b7635d71eb9286e860a3cdd6daf5503fca847c079395d1d284b2d2f56',
    );
  });

  test('serves the converged apex contract', async () => {
    const app = express();
    app.use('/api/apex/v2', router);
    const response = await request(app).get('/api/apex/v2/status').expect(200);
    expect(response.body.data.productCount).toBe(22);
    expect(response.body.data.tpm.previousSingleCaptureAuthorizationReusable).toBe(false);
  });
});
