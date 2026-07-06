'use strict';

const {
  inspectOsKernelFederation
} = require('../os-kernel-federation/sheikha-os-kernel-federation-v1');

const industrialFamilies = Object.freeze([
  {
    id: 'linux-industrial-family',
    family: 'Linux',
    arabicName: 'التجمع الصناعي لعائلة لينكس',
    systems: ['Pop!_OS', 'Ubuntu', 'Debian', 'Fedora', 'Arch', 'Android'],
    clusters: ['kernel-cluster', 'distro-cluster', 'package-cluster', 'container-cluster', 'runtime-cluster']
  },
  {
    id: 'windows-industrial-family',
    family: 'Windows NT',
    arabicName: 'التجمع الصناعي لعائلة ويندوز',
    systems: ['Windows 10', 'Windows 11', 'Windows Server'],
    clusters: ['nt-kernel-cluster', 'registry-observation-cluster', 'service-cluster', 'powershell-cluster']
  },
  {
    id: 'apple-industrial-family',
    family: 'Apple XNU/Darwin',
    arabicName: 'التجمع الصناعي لعائلة أبل',
    systems: ['macOS', 'iOS', 'iPadOS', 'watchOS', 'tvOS'],
    clusters: ['xnu-kernel-cluster', 'darwin-cluster', 'apple-silicon-cluster', 'app-sandbox-cluster']
  },
  {
    id: 'bsd-industrial-family',
    family: 'BSD',
    arabicName: 'التجمع الصناعي لعائلة BSD',
    systems: ['FreeBSD', 'OpenBSD', 'NetBSD'],
    clusters: ['bsd-kernel-cluster', 'userland-cluster', 'networking-cluster', 'security-cluster']
  },
  {
    id: 'container-industrial-family',
    family: 'Containers',
    arabicName: 'التجمع الصناعي للحاويات',
    systems: ['Docker', 'containerd', 'Podman', 'Kubernetes'],
    clusters: ['namespace-cluster', 'cgroups-cluster', 'image-cluster', 'orchestration-cluster']
  },
  {
    id: 'virtualization-industrial-family',
    family: 'Virtualization',
    arabicName: 'التجمع الصناعي للافتراضية',
    systems: ['KVM', 'QEMU', 'VirtualBox', 'VMware', 'Hyper-V'],
    clusters: ['hypervisor-cluster', 'guest-kernel-cluster', 'virtual-network-cluster', 'storage-virtualization-cluster']
  }
]);

const integrationRelations = Object.freeze([
  ['linux-industrial-family', 'container-industrial-family', 'HOSTS_CONTAINERS'],
  ['virtualization-industrial-family', 'linux-industrial-family', 'CAN_HOST_GUEST'],
  ['virtualization-industrial-family', 'windows-industrial-family', 'CAN_HOST_GUEST'],
  ['virtualization-industrial-family', 'bsd-industrial-family', 'CAN_HOST_GUEST'],
  ['apple-industrial-family', 'virtualization-industrial-family', 'CAN_MODEL_OR_HOST_WITH_POLICY'],
  ['linux-industrial-family', 'bsd-industrial-family', 'UNIX_LIKE_CONCEPTUAL_ALIGNMENT'],
  ['windows-industrial-family', 'linux-industrial-family', 'INTEROPERATES_WITH_WSL_OR_NETWORK'],
  ['container-industrial-family', 'governance-industrial-family', 'GOVERNED_BY'],
  ['virtualization-industrial-family', 'governance-industrial-family', 'GOVERNED_BY']
]);

function inspectOsFamilyIndustrialFederation() {
  return {
    system: 'SHEIKHA_OS_FAMILY_INDUSTRIAL_FEDERATION_FABRIC_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_OS_FAMILY_CLUSTER_MAPPING',
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noSysctlModification: true,
      noRegistryModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true,
      measurementOnly: true
    },
    families: industrialFamilies,
    relations: integrationRelations.map(([from, to, type]) => ({ from, to, type })),
    baseFederation: inspectOsKernelFederation()
  };
}

module.exports = {
  industrialFamilies,
  integrationRelations,
  inspectOsFamilyIndustrialFederation
};
