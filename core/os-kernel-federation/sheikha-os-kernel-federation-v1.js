'use strict';

const { inspectKernelIndustrialFabric } = require('../kernel-industrial-fabric/sheikha-kernel-industrial-fabric-v1');

const osKernelFamilies = Object.freeze([
  {
    id: 'linux-family',
    name: 'Linux Kernel Family',
    arabicName: 'عائلة كيرنل لينكس',
    systems: ['Linux', 'Pop!_OS', 'Ubuntu', 'Debian', 'Fedora', 'Arch', 'Android'],
    kernelType: 'monolithic-modular',
    relationship: 'hardware-firmware-boot-kernel-os-runtime'
  },
  {
    id: 'windows-nt-family',
    name: 'Windows NT Kernel Family',
    arabicName: 'عائلة كيرنل ويندوز NT',
    systems: ['Windows 10', 'Windows 11', 'Windows Server'],
    kernelType: 'hybrid',
    relationship: 'hardware-firmware-boot-kernel-services-runtime'
  },
  {
    id: 'apple-xnu-family',
    name: 'Apple XNU / Darwin Kernel Family',
    arabicName: 'عائلة كيرنل أبل XNU/Darwin',
    systems: ['macOS', 'iOS', 'iPadOS', 'watchOS', 'tvOS'],
    kernelType: 'hybrid-xnu',
    relationship: 'apple-silicon-firmware-boot-xnu-darwin-services-apps'
  },
  {
    id: 'bsd-family',
    name: 'BSD Kernel Family',
    arabicName: 'عائلة كيرنل BSD',
    systems: ['FreeBSD', 'OpenBSD', 'NetBSD'],
    kernelType: 'unix-bsd',
    relationship: 'hardware-boot-kernel-userland-services'
  },
  {
    id: 'container-runtime-family',
    name: 'Container Runtime Layer',
    arabicName: 'طبقة تشغيل الحاويات',
    systems: ['Docker', 'containerd', 'Podman', 'Kubernetes'],
    kernelType: 'shared-host-kernel-runtime',
    relationship: 'host-kernel-namespaces-cgroups-containers'
  },
  {
    id: 'hypervisor-vm-family',
    name: 'Hypervisor / Virtual Machine Layer',
    arabicName: 'طبقة المشرف الافتراضي والآلات الافتراضية',
    systems: ['KVM', 'QEMU', 'VirtualBox', 'VMware', 'Hyper-V'],
    kernelType: 'virtualization-layer',
    relationship: 'hardware-hypervisor-guest-kernel-guest-os'
  }
]);

const federationRelations = Object.freeze([
  ['hardware-layer', 'firmware-layer', 'FEEDS'],
  ['firmware-layer', 'boot-layer', 'FEEDS'],
  ['boot-layer', 'kernel-family-layer', 'LOADS'],
  ['kernel-family-layer', 'os-services-layer', 'ENABLES'],
  ['os-services-layer', 'runtime-layer', 'HOSTS'],
  ['runtime-layer', 'application-layer', 'RUNS'],
  ['application-layer', 'governance-layer', 'GOVERNED_BY'],
  ['linux-family', 'container-runtime-family', 'HOSTS'],
  ['hypervisor-vm-family', 'linux-family', 'CAN_HOST'],
  ['hypervisor-vm-family', 'windows-nt-family', 'CAN_HOST'],
  ['hypervisor-vm-family', 'apple-xnu-family', 'CAN_MODEL_ONLY']
]);

function inspectOsKernelFederation() {
  return {
    system: 'SHEIKHA_UNIVERSAL_OS_KERNEL_FEDERATION_FABRIC_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_OS_KERNEL_FEDERATION_MAPPING',
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
    families: osKernelFamilies,
    relations: federationRelations.map(([from, to, type]) => ({ from, to, type })),
    activeHost: inspectKernelIndustrialFabric()
  };
}

module.exports = {
  osKernelFamilies,
  federationRelations,
  inspectOsKernelFederation
};
