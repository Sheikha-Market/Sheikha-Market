'use strict';

const fs = require('node:fs');

const COMMAND_PATHS = Object.freeze({
  tpm2_getcap: ['/usr/bin/tpm2_getcap'],
  tpm2_pcrread: ['/usr/bin/tpm2_pcrread'],
  tpm2_readpublic: ['/usr/bin/tpm2_readpublic'],
  tpm2_quote: ['/usr/bin/tpm2_quote'],
  tpm2_nvread: ['/usr/bin/tpm2_nvread'],
  tpm2_certify: ['/usr/bin/tpm2_certify'],
  tpm2_getrandom: ['/usr/bin/tpm2_getrandom'],
  tpm2_checkquote: ['/usr/bin/tpm2_checkquote'],
  tpm2_eventlog: ['/usr/bin/tpm2_eventlog'],
  tpm2_createprimary: ['/usr/bin/tpm2_createprimary'],
  tpm2_createak: ['/usr/bin/tpm2_createak'],
  tpm2_nvwrite: ['/usr/bin/tpm2_nvwrite'],
  tpm2_clear: ['/usr/bin/tpm2_clear'],
  swtpm: ['/usr/bin/swtpm', '/usr/local/bin/swtpm'],
  qemu_system_x86_64: ['/usr/bin/qemu-system-x86_64'],
  cryptsetup: ['/usr/sbin/cryptsetup'],
  systemd_cryptenroll: ['/usr/bin/systemd-cryptenroll'],
  ssh: ['/usr/bin/ssh'],
  ssh_keygen: ['/usr/bin/ssh-keygen'],
  strongswan: ['/usr/sbin/strongswan', '/usr/sbin/ipsec'],
  openvpn: ['/usr/sbin/openvpn'],
  sbverify: ['/usr/bin/sbverify'],
  mokutil: ['/usr/bin/mokutil'],
  systemd_measure: ['/usr/bin/systemd-measure'],
  systemd_pcrphase: ['/usr/bin/systemd-pcrphase'],
  clevis: ['/usr/bin/clevis'],
  tangd: ['/usr/libexec/tangd', '/usr/bin/tangd'],
  keyctl: ['/usr/bin/keyctl'],
  openssl: ['/usr/bin/openssl'],
  sbsign: ['/usr/bin/sbsign'],
  pesign: ['/usr/bin/pesign'],
  fwupdmgr: ['/usr/bin/fwupdmgr'],
  syft: ['/usr/bin/syft', '/usr/local/bin/syft'],
  trivy: ['/usr/bin/trivy', '/usr/local/bin/trivy'],
  cosign: ['/usr/bin/cosign', '/usr/local/bin/cosign'],
});

const SHEIKHA_NATIVE_TOOLS = Object.freeze([
  { id: 'SHEIKHA_TPM_STRUCTURE_PARSER', role: 'TPM2 Part 2 bounded structure parsing', implementation: 'NATIVE_IMPLEMENTED_PROFILE' },
  { id: 'SHEIKHA_ATTESTATION_VERIFIER', role: 'Quote, signature, nonce, and PCR evidence verification', implementation: 'NATIVE_IMPLEMENTED_PROFILE' },
  { id: 'SHEIKHA_TRUST_EVIDENCE_NORMALIZER', role: 'Content-addressed evidence normalization', implementation: 'NATIVE_IMPLEMENTED' },
  { id: 'SHEIKHA_SECURE_BOOT_INSPECTOR', role: 'Read-only image and boot-chain evidence inspection', implementation: 'NATIVE_PLUS_UPSTREAM_ADAPTER' },
  { id: 'SHEIKHA_TRUST_POLICY_GATE', role: 'Fail-closed execution planning and approval boundary', implementation: 'NATIVE_IMPLEMENTED' },
  { id: 'SHEIKHA_TRUST_RECOVERY_CONTRACT', role: 'Recovery prerequisites before high-impact trust changes', implementation: 'NATIVE_CONTRACT' },
  { id: 'SHEIKHA_TRUST_TOOL_ROUTER', role: 'Capability-based routing without hiding upstream identity', implementation: 'NATIVE_IMPLEMENTED' },
  { id: 'SHEIKHA_MEASURED_BOOT_LEDGER', role: 'Normalize PCR and event-log evidence without modifying firmware', implementation: 'NATIVE_CONTRACT' },
  { id: 'SHEIKHA_KEY_CUSTODY_GATE', role: 'Require non-exportable production keys and scoped authorization', implementation: 'NATIVE_CONTRACT' },
  { id: 'SHEIKHA_SUPPLY_CHAIN_EVIDENCE_GATE', role: 'Bind SBOM, licenses, signatures, and vulnerability evidence to releases', implementation: 'NATIVE_CONTRACT' },
]);

const OPERATIONS = Object.freeze({
  INSPECT_TPM: { mode: 'READ_ONLY', adapters: ['tpm2_getcap'], fallback: 'SHEIKHA_TRUST_EVIDENCE_NORMALIZER' },
  READ_PCR: { mode: 'READ_ONLY', adapters: ['tpm2_pcrread'], fallback: null },
  READ_PUBLIC_OBJECT: { mode: 'READ_ONLY', adapters: ['tpm2_readpublic'], fallback: 'SHEIKHA_TPM_STRUCTURE_PARSER' },
  VERIFY_QUOTE_OFFLINE: { mode: 'READ_ONLY', adapters: [], fallback: 'SHEIKHA_ATTESTATION_VERIFIER' },
  CREATE_QUOTE: { mode: 'TPM_SIGN_OPERATION', adapters: ['tpm2_quote'], fallback: null },
  READ_NV: { mode: 'READ_ONLY_AUTHORIZED_INDEX', adapters: ['tpm2_nvread'], fallback: null },
  CERTIFY_OBJECT: { mode: 'TPM_SIGN_OPERATION', adapters: ['tpm2_certify'], fallback: null },
  GET_HARDWARE_RANDOM: { mode: 'READ_ONLY_BOUNDED_OUTPUT', adapters: ['tpm2_getrandom'], fallback: null },
  VERIFY_QUOTE_WITH_TOOL: { mode: 'READ_ONLY', adapters: ['tpm2_checkquote'], fallback: 'SHEIKHA_ATTESTATION_VERIFIER' },
  PARSE_EVENT_LOG: { mode: 'READ_ONLY', adapters: ['tpm2_eventlog'], fallback: 'SHEIKHA_MEASURED_BOOT_LEDGER' },
  EMULATED_TPM_LAB: { mode: 'ISOLATED_LAB', adapters: ['swtpm', 'qemu_system_x86_64'], fallback: null },
  VERIFY_SECURE_BOOT_IMAGE: { mode: 'READ_ONLY', adapters: ['sbverify'], fallback: 'SHEIKHA_SECURE_BOOT_INSPECTOR' },
  PLAN_DISK_ENCRYPTION: { mode: 'PLAN_ONLY_HIGH_IMPACT', adapters: ['cryptsetup', 'systemd_cryptenroll'], fallback: 'SHEIKHA_TRUST_RECOVERY_CONTRACT' },
  VERIFY_REMOTE_ACCESS: { mode: 'READ_ONLY', adapters: ['ssh', 'ssh_keygen'], fallback: null },
  PLAN_VPN_IDENTITY: { mode: 'PLAN_ONLY', adapters: ['strongswan', 'openvpn'], fallback: null },
  INSPECT_FIRMWARE_UPDATES: { mode: 'READ_ONLY_NETWORK_OPTIONAL', adapters: ['fwupdmgr'], fallback: null },
  VERIFY_ARTIFACT_SIGNATURE: { mode: 'READ_ONLY', adapters: ['cosign', 'openssl'], fallback: null },
  GENERATE_SBOM: { mode: 'BOUNDED_ARTIFACT_WRITE', adapters: ['syft'], fallback: 'SHEIKHA_SUPPLY_CHAIN_EVIDENCE_GATE' },
  SCAN_ARTIFACT: { mode: 'READ_ONLY_NETWORK_OPTIONAL', adapters: ['trivy'], fallback: null },
  PLAN_MEASURED_BOOT: { mode: 'PLAN_ONLY_HIGH_IMPACT', adapters: ['systemd_measure', 'systemd_pcrphase'], fallback: 'SHEIKHA_TRUST_RECOVERY_CONTRACT' },
  PLAN_NETWORK_BOUND_UNLOCK: { mode: 'PLAN_ONLY_HIGH_IMPACT', adapters: ['clevis', 'tangd', 'cryptsetup'], fallback: 'SHEIKHA_TRUST_RECOVERY_CONTRACT' },
  CREATE_TPM_IDENTITY: { mode: 'TPM_MUTATION_HIGH_IMPACT', adapters: ['tpm2_createprimary', 'tpm2_createak'], fallback: 'SHEIKHA_KEY_CUSTODY_GATE' },
  WRITE_NV: { mode: 'TPM_MUTATION_HIGH_IMPACT', adapters: ['tpm2_nvwrite'], fallback: null },
  CLEAR_TPM: { mode: 'DESTRUCTIVE_DENY_BY_DEFAULT', adapters: ['tpm2_clear'], fallback: null },
});

function commandInventory() {
  return Object.entries(COMMAND_PATHS).map(([command, paths]) => {
    const path = paths.find((candidate) => fs.existsSync(candidate)) || null;
    return { command, installed: Boolean(path), path };
  });
}

function buildTrustToolsStatus() {
  const inventory = commandInventory();
  return {
    system: 'SHEIKHA_TRUST_TOOLS_V1',
    status: 'NATIVE_TRUST_LAYER_ACTIVE_UPSTREAM_ADAPTERS_PARTIAL',
    nativeTools: SHEIKHA_NATIVE_TOOLS,
    upstreamInventory: inventory,
    installedCount: inventory.filter((item) => item.installed).length,
    totalTrackedCommands: inventory.length,
    operations: OPERATIONS,
    licenseContract: {
      sheikhaOriginalCodeLicense: 'SHEIKHA_INTERNAL_LICENSE_PENDING_LEGAL_APPROVAL',
      upstreamComponentsRetainOriginalLicenses: true,
      trademarkAndAttributionPreserved: true,
      noRelicensingOrOwnershipClaimOverUpstreamCode: true,
      noHarmNoUnjustAppropriation: true,
      legalHumanReviewRequiredBeforeDistribution: true,
    },
    productionReady: false,
    blockers: ['SBOM_AND_LICENSE_FILE_REQUIRED', 'PHYSICAL_TPM_E2E_EVIDENCE_REQUIRED', 'SECURE_BOOT_RECOVERY_TRIAL_REQUIRED'],
  };
}

function planTrustOperation(input = {}) {
  const operation = String(input.operation || '').trim().toUpperCase();
  const contract = OPERATIONS[operation];
  if (!contract) return { status: 'UNKNOWN_OPERATION', executionStarted: false, operation: operation || null };
  const inventory = new Map(commandInventory().map((item) => [item.command, item]));
  const adapters = contract.adapters.map((adapter) => inventory.get(adapter) || { command: adapter, installed: false, path: null });
  const mutating = ['TPM_SIGN_OPERATION', 'PLAN_ONLY_HIGH_IMPACT', 'TPM_MUTATION_HIGH_IMPACT', 'BOUNDED_ARTIFACT_WRITE'].includes(contract.mode);
  const destructive = contract.mode === 'DESTRUCTIVE_DENY_BY_DEFAULT';
  const missing = adapters.filter((adapter) => !adapter.installed).map((adapter) => adapter.command);
  return {
    system: 'SHEIKHA_TRUST_OPERATION_PLAN_V1',
    status: destructive
      ? 'DENIED_BY_DEFAULT_SEPARATE_BREAK_GLASS_PROCESS_REQUIRED'
      : missing.length && !contract.fallback
        ? 'ADAPTER_REQUIRED'
        : mutating
          ? 'HUMAN_AUTHORIZATION_REQUIRED'
          : 'READ_ONLY_PLAN_READY',
    operation,
    mode: contract.mode,
    adapters,
    nativeFallback: contract.fallback,
    missingAdapters: missing,
    executionStarted: false,
    mutationAllowed: false,
    networkAllowed: false,
    recoveryPlanRequired: contract.mode === 'PLAN_ONLY_HIGH_IMPACT',
    explicitScopedApprovalRequired: mutating,
    destructiveOperation: destructive,
    upstreamIdentityPreserved: true,
  };
}

module.exports = { COMMAND_PATHS, SHEIKHA_NATIVE_TOOLS, OPERATIONS, buildTrustToolsStatus, planTrustOperation };
