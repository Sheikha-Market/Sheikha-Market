'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { buildUnifiedEcosystemStatus } = require('./sheikha-unified-ecosystem-v1');
const { buildTrustToolsStatus } = require('./sheikha-trust-tools-v1');
const { buildSheikhaCloudStatus } = require('./sheikha-cloud-v1');
const { buildVisualIntelligenceStatus } = require('./sheikha-visual-intelligence-fabric-v1');
const { buildDrawingMotionV2BridgeStatus } = require('./sheikha-visual-fabric-v2-bridge');
const { buildSheikha360Status } = require('./sheikha-360-reality-bridge-v1');
const { buildCommercialOperatingStatus } = require('./sheikha-commercial-operating-system-v1');

const REPAIR_REPORT = path.resolve(
  process.cwd(),
  'runtime/governance/platform-trust/v2/evidence/tpm2b-id-object-framing-repair-v2.json',
);
const CONTEXT_DIAGNOSIS_REPORT = path.resolve(
  process.cwd(),
  'runtime/governance/platform-trust/v2/evidence/tpm-context-observation-failure-diagnosis-v2.json',
);
const TPM_INVENTORY_REPORT = path.resolve(
  process.cwd(),
  'runtime/governance/platform-trust/v2/evidence/tpm-read-only-inventory-v2.json',
);
const TPM_ACTIVATION_REPORT = path.resolve(
  process.cwd(),
  'runtime/governance/platform-trust/v2/executions/ek-ak-recreation-20260902T044629229Z/activatecredential-v2/activation-result.json',
);
const TPM_QUOTE_CONTRACT = path.resolve(
  process.cwd(),
  'runtime/governance/platform-trust/v2/executions/ek-ak-recreation-20260902T044629229Z/quote-attestation-single-use-contract-v2.json',
);
const TPM_V3_EXECUTION_DIR = path.resolve(
  process.env.SHEIKHA_TPM_V3_EXECUTION_DIR ||
  '/home/sheikha/Projects/sheikha/validation-execution/sheikha-ecc-ek-ak-create-20260901T191710Z/makecredential-v3-new-ak-20260902T045936Z',
);
const TPM_V3_OBSERVATION = path.join(
  TPM_V3_EXECUTION_DIR,
  'evidence/read-only-ak-ek-observation-v3/read-only-observation-v3-manifest.json',
);
const TPM_V3_AUTHORIZATION_REVIEW = path.join(
  TPM_V3_EXECUTION_DIR,
  'evidence/activatecredential-v3-single-capture-authorization-review/authorization-review.json',
);
const TPM_V3_EXPECTED_DIGESTS = Object.freeze({
  observation: '95047351a8710fc5cfe94f67532cf562574452a664ca9e14ca28bd4a640b2818',
  preflight: '5c48a24f580a8cf5788a97278a157bbc966b984a5905fc194cd118e80072ff80',
  executionManifest: '58f0a64d62e2c5ad0575848f2f21aad1d586956843aaba7f76c3aefe29ce3c08',
});

function readJsonEvidence(file, unavailableStatus) {
  try {
    const raw = fs.readFileSync(file);
    const evidence = JSON.parse(raw.toString('utf8'));
    return {
      present: true,
      reportSha256: crypto.createHash('sha256').update(raw).digest('hex'),
      ...evidence,
    };
  } catch (error) {
    return { present: false, status: unavailableStatus, error: error.code || 'INVALID_REPORT' };
  }
}

function readRepairEvidence() {
  return readJsonEvidence(REPAIR_REPORT, 'REPAIR_EVIDENCE_NOT_AVAILABLE');
}

function readContextDiagnosisEvidence() {
  return readJsonEvidence(CONTEXT_DIAGNOSIS_REPORT, 'CONTEXT_DIAGNOSIS_NOT_AVAILABLE');
}

function readTpmInventoryEvidence() {
  return readJsonEvidence(TPM_INVENTORY_REPORT, 'TPM_INVENTORY_NOT_AVAILABLE');
}

function readTpmActivationEvidence() {
  const evidence = readJsonEvidence(TPM_ACTIVATION_REPORT, 'ACTIVATECREDENTIAL_V2_EVIDENCE_NOT_AVAILABLE');
  if (!evidence.present) return evidence;
  const { present, reportSha256, resultSha256, ...body } = evidence;
  const computedResultSha256 = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  return {
    ...evidence,
    resultDigestValid: computedResultSha256 === resultSha256,
    verified: evidence.status === 'ACTIVATECREDENTIAL_V2_VERIFIED_SINGLE_USE_COMPLETE'
      && evidence.activateCredentialCalls === 1
      && evidence.recoveredCredentialMatches === true
      && computedResultSha256 === resultSha256,
  };
}

function readTpmQuoteContract() {
  const evidence = readJsonEvidence(TPM_QUOTE_CONTRACT, 'TPM_QUOTE_ATTESTATION_CONTRACT_NOT_AVAILABLE');
  if (!evidence.present) return evidence;
  const { present, reportSha256, contractSha256, ...body } = evidence;
  const computedContractSha256 = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  return {
    ...evidence,
    contractDigestValid: computedContractSha256 === contractSha256,
    authorizationGranted: false,
  };
}

function readTpmV3Evidence() {
  const observation = readJsonEvidence(TPM_V3_OBSERVATION, 'TPM_V3_OBSERVATION_NOT_AVAILABLE');
  const authorizationReview = readJsonEvidence(
    TPM_V3_AUTHORIZATION_REVIEW,
    'TPM_V3_AUTHORIZATION_REVIEW_NOT_AVAILABLE',
  );
  const observationVerified = observation.present === true
    && observation.reportSha256 === TPM_V3_EXPECTED_DIGESTS.observation
    && observation.preflightFileSha256 === TPM_V3_EXPECTED_DIGESTS.preflight
    && observation.executionManifestSha256 === TPM_V3_EXPECTED_DIGESTS.executionManifest
    && observation.status === 'READ_ONLY_OBSERVATION_V3_COMPLETE'
    && observation.tpmReadpublicExecuted === true
    && observation.activateCredentialExecuted === false
    && observation.mutationExecuted === false;
  const reviewVerified = authorizationReview.present === true
    && authorizationReview.preflightFileSha256 === TPM_V3_EXPECTED_DIGESTS.preflight
    && authorizationReview.executionManifestSha256 === TPM_V3_EXPECTED_DIGESTS.executionManifest
    && authorizationReview.observationManifestSha256 === TPM_V3_EXPECTED_DIGESTS.observation
    && authorizationReview.akNameHex === observation.observedAkNameHex
    && authorizationReview.akSpkiSha256 === observation.observedAkSpkiSha256
    && authorizationReview.ekSpkiSha256 === observation.observedEkSpkiSha256
    && authorizationReview.status === 'AUTHORIZATION_REVIEW_COMPLETE_EXECUTION_NOT_AUTHORIZED'
    && authorizationReview.singleCapture?.maximumActivateCredentialCalls === 1
    && authorizationReview.boundaries?.physicalExecutionAuthorized === false
    && authorizationReview.boundaries?.singleCaptureAuthorizationIssued === false;

  return {
    generation: 'V3',
    observation: {
      present: observation.present,
      verified: observationVerified,
      status: observation.status,
      reportSha256: observation.reportSha256,
      akNameHex: observation.observedAkNameHex || null,
      akSpkiSha256: observation.observedAkSpkiSha256 || null,
      ekSpkiSha256: observation.observedEkSpkiSha256 || null,
      completedAt: observation.completedAt || null,
    },
    authorizationReview: {
      present: authorizationReview.present,
      verified: reviewVerified,
      status: authorizationReview.status,
      reportSha256: authorizationReview.reportSha256,
      maximumActivateCredentialCalls:
        authorizationReview.singleCapture?.maximumActivateCredentialCalls || 0,
      physicalExecutionAuthorized: false,
      authorizationIssued: false,
    },
    currentGenerationReadyForAuthorization: observationVerified && reviewVerified,
    activateCredentialExecuted: false,
    previousAuthorizationReusable: false,
  };
}

function buildRuntimeApexStatus() {
  const ecosystem = buildUnifiedEcosystemStatus();
  const repair = readRepairEvidence();
  const contextDiagnosis = readContextDiagnosisEvidence();
  const inventory = readTpmInventoryEvidence();
  const activation = readTpmActivationEvidence();
  const quoteContract = readTpmQuoteContract();
  const v3 = readTpmV3Evidence();
  return {
    system: 'SHEIKHA_RUNTIME_APEX_V2',
    status: 'ACTIVE_GOVERNED_LOCAL_CONTROL_PLANE',
    productCount: ecosystem.productCount,
    products: ecosystem.products,
    trust: buildTrustToolsStatus(),
    tpm: {
      framingRepair: repair,
      contextObservationDiagnosis: contextDiagnosis,
      readOnlyInventory: inventory,
      activateCredentialV2: activation,
      quoteAttestationContractV2: quoteContract,
      currentGeneration: 'V3',
      v3,
      quoteAttestationContractV2CompatibleWithCurrentGeneration: false,
      physicalActivationAuthorized: false,
      previousSingleCaptureAuthorizationReusable: false,
      activationAuthorizationReusable: false,
      deviceIdentityBindingVerified: activation.verified === true,
      nextStage: v3.currentGenerationReadyForAuthorization
        ? 'AWAIT_EXPLICIT_SINGLE_USE_TPM_ACTIVATECREDENTIAL_V3_AUTHORIZATION'
        : activation.verified
        ? 'RESTORE_AND_VERIFY_CURRENT_V3_EVIDENCE_CHAIN'
        : (inventory.present && inventory.status === 'READ_ONLY_INVENTORY_COMPLETE'
        ? inventory.nextStage
        : (contextDiagnosis.present
          ? contextDiagnosis.nextRequiredStage
          : (repair.present
          ? 'READ_ONLY_REAL_DEVICE_AK_EK_OBSERVATION_AGAINST_BOUND_PREFLIGHT_V2'
          : 'RESTORE_LOCAL_FRAMING_REPAIR_EVIDENCE'))),
    },
    firmware: {
      state: ecosystem.products.find((product) => product.id === 'SHEIKHA_FIRMWARE')?.state,
      writeAuthorized: false,
      commercialReleaseAllowed: false,
    },
    cloud: buildSheikhaCloudStatus(),
    visualIntelligence: buildVisualIntelligenceStatus(),
    visualFabricV2: buildDrawingMotionV2BridgeStatus(),
    sheikha360: buildSheikha360Status(),
    commercialOperatingSystem: buildCommercialOperatingStatus(),
    boundaries: {
      localControlPlane: true,
      externalNetworkUsedByStatusRead: false,
      customerDataTrainingDefault: false,
      highImpactExecutionRequiresNewScopedAuthorization: true,
    },
    commercialRelease: ecosystem.commercialRelease,
    sourceEcosystemSha256: ecosystem.sha256,
  };
}

module.exports = {
  REPAIR_REPORT,
  CONTEXT_DIAGNOSIS_REPORT,
  TPM_INVENTORY_REPORT,
  TPM_ACTIVATION_REPORT,
  TPM_QUOTE_CONTRACT,
  TPM_V3_EXECUTION_DIR,
  TPM_V3_OBSERVATION,
  TPM_V3_AUTHORIZATION_REVIEW,
  readRepairEvidence,
  readContextDiagnosisEvidence,
  readTpmInventoryEvidence,
  readTpmActivationEvidence,
  readTpmQuoteContract,
  readTpmV3Evidence,
  buildRuntimeApexStatus,
};
