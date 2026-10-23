'use strict';

const SECURITY_TOOLS = Object.freeze([
  { id: 'TPM2_TOOLS', upstream: 'tpm2-tools', kind: 'CLI', use: ['TPM2 administration', 'attestation', 'PCR', 'NV'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'TPM2_TSS', upstream: 'tpm2-tss', kind: 'C_LIBRARY', use: ['TPM2 software stack', 'native integration'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'IBM_TPM2_TSS', upstream: 'IBM TPM 2.0 TSS', kind: 'CLI_AND_LIBRARY', use: ['TPM2 commands', 'interoperability'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'GO_TPM', upstream: 'go-tpm', kind: 'GO_LIBRARY', use: ['attestation services', 'cloud identity'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'TSS2_PY', upstream: 'tss2-py', kind: 'PYTHON_LIBRARY', use: ['automation', 'TPM2 application integration'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'POWERSHELL_TPM', upstream: 'PowerShell TPM Cmdlets', kind: 'WINDOWS_CLI', use: ['Windows fleet TPM management'], licenseReview: 'PLATFORM_TERMS_APPLY' },
  { id: 'SWTPM', upstream: 'swtpm', kind: 'EMULATOR', use: ['QEMU TPM emulation', 'safe development'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'IBM_TPM_SIMULATOR', upstream: 'IBM TPM 2.0 Simulator', kind: 'SIMULATOR', use: ['protocol testing', 'development'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'QEMU_KVM', upstream: 'QEMU/KVM', kind: 'VIRTUALIZATION', use: ['virtual machines', 'virtual TPM integration'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'LUKS_CRYPTSETUP', upstream: 'LUKS/cryptsetup/dm-crypt', kind: 'DISK_ENCRYPTION', use: ['Linux disk encryption', 'measured unlock'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'BITLOCKER', upstream: 'BitLocker', kind: 'DISK_ENCRYPTION', use: ['Windows disk encryption'], licenseReview: 'PLATFORM_TERMS_APPLY' },
  { id: 'OPENSSH', upstream: 'OpenSSH', kind: 'REMOTE_ACCESS', use: ['SSH', 'hardware-backed identity'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'STRONGSWAN', upstream: 'strongSwan', kind: 'VPN', use: ['IPsec', 'certificate-backed access'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'OPENVPN', upstream: 'OpenVPN', kind: 'VPN', use: ['remote access', 'certificate-backed access'], licenseReview: 'UPSTREAM_OR_COMMERCIAL_TERMS_APPLY' },
  { id: 'SECURE_BOOT', upstream: 'UEFI Secure Boot ecosystem', kind: 'BOOT_TRUST', use: ['signed boot chain', 'recovery'], licenseReview: 'IMPLEMENTATION_SPECIFIC' },
  { id: 'SYSTEMD_MEASURE', upstream: 'systemd-measure/systemd-pcrphase', kind: 'MEASURED_BOOT', use: ['UKI measurement', 'PCR policy'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'CLEVIS_TANG', upstream: 'Clevis/Tang', kind: 'NETWORK_BOUND_DISK_ENCRYPTION', use: ['policy-bound LUKS unlock', 'recovery-aware automation'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'KEYUTILS', upstream: 'Linux keyutils', kind: 'KEY_MANAGEMENT', use: ['kernel keyrings', 'credential lifecycle'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'OPENSSL', upstream: 'OpenSSL', kind: 'CRYPTOGRAPHY', use: ['certificate inspection', 'signature verification', 'key formats'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'SBSIGTOOLS', upstream: 'sbsigntools', kind: 'EFI_SIGNING', use: ['EFI image signing', 'signature inspection'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'PESIGN', upstream: 'pesign', kind: 'EFI_SIGNING', use: ['PE/COFF signing', 'certificate databases'], licenseReview: 'UPSTREAM_LICENSE_REQUIRED' },
  { id: 'FWUPD', upstream: 'fwupd/LVFS', kind: 'FIRMWARE_LIFECYCLE', use: ['firmware inventory', 'signed update metadata'], licenseReview: 'UPSTREAM_AND_VENDOR_TERMS_APPLY' },
  { id: 'SBOM_TOOLING', upstream: 'Syft/CycloneDX/SPDX ecosystem', kind: 'SUPPLY_CHAIN', use: ['SBOM generation', 'license inventory'], licenseReview: 'IMPLEMENTATION_SPECIFIC' },
  { id: 'VULNERABILITY_SCANNING', upstream: 'Grype/Trivy ecosystem', kind: 'SUPPLY_CHAIN', use: ['artifact vulnerability scanning', 'release evidence'], licenseReview: 'IMPLEMENTATION_SPECIFIC' },
  { id: 'COSIGN', upstream: 'Sigstore cosign', kind: 'ARTIFACT_SIGNING', use: ['artifact signatures', 'attestations', 'transparency evidence'], licenseReview: 'UPSTREAM_LICENSE_AND_SERVICE_TERMS_APPLY' },
  { id: 'PKCS11', upstream: 'PKCS#11/OpenSC ecosystem', kind: 'HARDWARE_KEY_INTERFACE', use: ['HSM and smart-card integration', 'non-exportable keys'], licenseReview: 'IMPLEMENTATION_SPECIFIC' },
]);

function buildSecurityToolingStatus() {
  return {
    system: 'SHEIKHA_STUDIO_SECURITY_TOOLING_REGISTRY_V1',
    status: 'CATALOG_AND_ADAPTER_CONTRACTS_ACTIVE',
    tools: SECURITY_TOOLS.map((tool) => ({
      ...tool,
      sheikhaAdapterId: `SHEIKHA_${tool.id}_ADAPTER`,
      installed: null,
      liveVerified: false,
    })),
    namingPolicy: {
      upstreamNamesAndCopyrightsPreserved: true,
      sheikhaNameAppliesToAdapterAndGovernanceContractOnly: true,
      noRelicensingOfThirdPartyCode: true,
      noWarrantyOrOwnershipClaimForUpstreamTools: true,
    },
    executionPolicy: {
      observationReadOnlyByDefault: true,
      TPMMutationRequiresExplicitScopedApproval: true,
      SecureBootMutationRequiresRecoveryPlan: true,
      secretsNeverReturnedByStatusEndpoint: true,
      destructiveTpmCommandsDeniedByDefault: true,
      diskAndFirmwareMutationRequireSeparateApproval: true,
      productionSigningKeysMustBeNonExportable: true,
      simulationMustBeSeparatedFromPhysicalTrustEvidence: true,
    },
    productionReady: false,
    blockers: ['INSTALLATION_INVENTORY_REQUIRED', 'LICENSE_SBOM_REVIEW_REQUIRED', 'DEVICE_INTEGRATION_TESTS_REQUIRED'],
  };
}

module.exports = { SECURITY_TOOLS, buildSecurityToolingStatus };
