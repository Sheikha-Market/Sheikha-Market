'use strict';

const {
  inspectOsFamilyIndustrialFederation
} = require('../os-family-industrial-federation/sheikha-os-family-industrial-federation-v1');

const globalLayers = Object.freeze([
  { id: 'l0-hardware-federation', name: 'Hardware Federation', scope: 'cpu-memory-storage-devices' },
  { id: 'l1-firmware-federation', name: 'Firmware Federation', scope: 'bios-uefi-tpm-secure-boot-read-only' },
  { id: 'l2-boot-federation', name: 'Boot Federation', scope: 'bootloaders-read-only' },
  { id: 'l3-kernel-federation', name: 'Kernel Federation', scope: 'linux-nt-xnu-bsd' },
  { id: 'l4-os-family-federation', name: 'OS Family Federation', scope: 'linux-windows-apple-bsd' },
  { id: 'l5-runtime-federation', name: 'Runtime Federation', scope: 'node-python-java-dotnet-php-go-rust' },
  { id: 'l6-process-federation', name: 'Process Federation', scope: 'pm2-systemd-launchd-windows-services' },
  { id: 'l7-container-federation', name: 'Container Federation', scope: 'docker-containerd-podman-kubernetes' },
  { id: 'l8-virtualization-federation', name: 'Virtualization Federation', scope: 'kvm-qemu-vmware-hyperv-virtualbox' },
  { id: 'l9-application-federation', name: 'Application Federation', scope: 'sheikha-services-products-apis' },
  { id: 'l10-ai-data-federation', name: 'AI & Data Federation', scope: 'models-data-rag-registries' },
  { id: 'l11-governance-federation', name: 'Governance Federation', scope: 'no-harm-audit-human-review' },
  { id: 'l12-enterprise-federation', name: 'Enterprise Federation', scope: 'organizations-platforms-control-plane' }
]);

const globalRelations = Object.freeze([
  ['l0-hardware-federation', 'l1-firmware-federation', 'FEEDS'],
  ['l1-firmware-federation', 'l2-boot-federation', 'LOADS'],
  ['l2-boot-federation', 'l3-kernel-federation', 'STARTS'],
  ['l3-kernel-federation', 'l4-os-family-federation', 'ENABLES'],
  ['l4-os-family-federation', 'l5-runtime-federation', 'HOSTS'],
  ['l5-runtime-federation', 'l6-process-federation', 'EXECUTES'],
  ['l6-process-federation', 'l7-container-federation', 'ORCHESTRATES_OPTIONALLY'],
  ['l7-container-federation', 'l8-virtualization-federation', 'INTEROPERATES_WITH'],
  ['l6-process-federation', 'l9-application-federation', 'RUNS'],
  ['l9-application-federation', 'l10-ai-data-federation', 'USES'],
  ['l10-ai-data-federation', 'l11-governance-federation', 'GOVERNED_BY'],
  ['l11-governance-federation', 'l12-enterprise-federation', 'REPORTS_TO']
]);

function inspectGlobalEnterpriseOperatingFabric() {
  return {
    system: 'SHEIKHA_GLOBAL_ENTERPRISE_OPERATING_FABRIC_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_GLOBAL_FEDERATED_LAYER_MAPPING',
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noFirmwareModification: true,
      noRegistryModification: true,
      noSysctlModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true,
      measurementOnly: true,
      humanReviewRequired: true
    },
    layers: globalLayers,
    relations: globalRelations.map(([from, to, type]) => ({ from, to, type })),
    osFamilyFederation: inspectOsFamilyIndustrialFederation()
  };
}

module.exports = {
  globalLayers,
  globalRelations,
  inspectGlobalEnterpriseOperatingFabric
};
