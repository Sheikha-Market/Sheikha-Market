'use strict';

const crypto = require('node:crypto');

function buildEkAkRecreationContract({ inventoryReportSha256, device = '/dev/tpmrm0' }) {
  if (!/^[a-f0-9]{64}$/.test(String(inventoryReportSha256 || ''))) {
    throw new Error('VALID_INVENTORY_REPORT_SHA256_REQUIRED');
  }
  if (device !== '/dev/tpmrm0') throw new Error('ONLY_TPMRM0_SUPPORTED');
  const base = {
    system: 'SHEIKHA_DEVICE_BOUND_EK_AK_RECREATION_CONTRACT_V2',
    status: 'PREPARED_AWAITING_EXPLICIT_MUTATION_AUTHORIZATION',
    device,
    inventoryReportSha256,
    purpose: 'RECREATE_TRANSIENT_EK_AK_AND_REBIND_CORRECTED_MAKECREDENTIAL_ARTIFACTS',
    allowedCommands: ['tpm2_createek', 'tpm2_createak', 'tpm2_readpublic'],
    forbiddenCommands: ['tpm2_clear', 'tpm2_evictcontrol', 'tpm2_nvwrite', 'tpm2_pcrextend', 'tpm2_activatecredential'],
    phases: [
      'CREATE_TRANSIENT_EK',
      'CREATE_NON_EXPORTABLE_AK_UNDER_EK',
      'READ_AND_BIND_EK_AK_PUBLIC_IDENTITIES',
      'REGENERATE_MAKECREDENTIAL_V2_FOR_NEW_IDENTITIES',
      'LOCAL_CRYPTOGRAPHIC_AND_SERIALIZATION_VERIFICATION',
      'ISSUE_SEPARATE_SINGLE_USE_ACTIVATECREDENTIAL_REVIEW',
    ],
    controls: {
      persistentHandleCreationAllowed: false,
      tpmClearAllowed: false,
      hierarchyAuthChangeAllowed: false,
      firmwareOrSecureBootChangeAllowed: false,
      networkAllowed: false,
      previousContextsReusable: false,
      previousCredentialArtifactsReusableAgainstNewAk: false,
      activateCredentialIncludedInThisAuthorization: false,
      rollback: 'FLUSH_NEW_TRANSIENT_OBJECTS_AND_DELETE_NEW_LOCAL_SECRET_ARTIFACTS_ON_FAILURE',
    },
    requiredAuthorization: {
      variable: 'SHEIKHA_AUTHORIZE_DEVICE_BOUND_EK_AK_RECREATION_V2',
      exactValue: 'YES',
      granted: false,
      separateActivateCredentialAuthorizationRequired: true,
    },
  };
  return { ...base, contractSha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = { buildEkAkRecreationContract };
