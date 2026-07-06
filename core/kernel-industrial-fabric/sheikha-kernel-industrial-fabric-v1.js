'use strict';

const { inspectKernelStackFabric } = require('../kernel-stack-fabric/sheikha-kernel-stack-fabric-v1');

const industrialKernels = Object.freeze([
  {
    id: 'hardware-industrial-kernel',
    layer: 'below-kernel',
    name: 'Hardware Industrial Kernel',
    arabicName: 'كيرنل التجمعات الصناعية للعتاد',
    clusters: ['cpu-cluster', 'memory-cluster', 'disk-cluster', 'device-observation-cluster']
  },
  {
    id: 'boot-firmware-industrial-kernel',
    layer: 'below-kernel',
    name: 'Boot & Firmware Industrial Kernel',
    arabicName: 'كيرنل تجمعات الإقلاع والبرمجيات الثابتة',
    clusters: ['firmware-reporting-cluster', 'boot-observation-cluster', 'no-boot-change-cluster']
  },
  {
    id: 'linux-kernel-industrial-kernel',
    layer: 'kernel',
    name: 'Linux Kernel Industrial Kernel',
    arabicName: 'كيرنل تجمعات نواة لينكس',
    clusters: ['kernel-version-cluster', 'scheduler-observation-cluster', 'process-interface-cluster']
  },
  {
    id: 'os-industrial-kernel',
    layer: 'above-kernel',
    name: 'OS Industrial Kernel',
    arabicName: 'كيرنل تجمعات نظام التشغيل',
    clusters: ['pop-os-cluster', 'linux-distro-cluster', 'filesystem-observation-cluster']
  },
  {
    id: 'runtime-industrial-kernel',
    layer: 'above-kernel',
    name: 'Runtime Industrial Kernel',
    arabicName: 'كيرنل تجمعات التشغيل',
    clusters: ['node-runtime-cluster', 'pm2-cluster', 'api-health-cluster']
  },
  {
    id: 'application-industrial-kernel',
    layer: 'above-kernel',
    name: 'Application Industrial Kernel',
    arabicName: 'كيرنل تجمعات التطبيقات',
    clusters: ['sheikha-portal-cluster', 'product-knowledge-cluster', 'governance-api-cluster']
  },
  {
    id: 'governance-industrial-kernel',
    layer: 'above-kernel',
    name: 'Governance Industrial Kernel',
    arabicName: 'كيرنل تجمعات الحوكمة',
    clusters: ['no-harm-cluster', 'audit-cluster', 'human-review-cluster']
  }
]);

const relations = Object.freeze([
  ['hardware-industrial-kernel', 'boot-firmware-industrial-kernel'],
  ['boot-firmware-industrial-kernel', 'linux-kernel-industrial-kernel'],
  ['linux-kernel-industrial-kernel', 'os-industrial-kernel'],
  ['os-industrial-kernel', 'runtime-industrial-kernel'],
  ['runtime-industrial-kernel', 'application-industrial-kernel'],
  ['application-industrial-kernel', 'governance-industrial-kernel']
]);

function inspectKernelIndustrialFabric() {
  return {
    system: 'SHEIKHA_KERNEL_INDUSTRIAL_FABRIC_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_INDUSTRIAL_KERNEL_CLUSTER_MAPPING',
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noSysctlModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true
    },
    industrialKernels,
    relations: relations.map(([from, to]) => ({
      from,
      to,
      type: 'DEPENDS_ON_AND_FEEDS'
    })),
    stack: inspectKernelStackFabric()
  };
}

module.exports = {
  industrialKernels,
  relations,
  inspectKernelIndustrialFabric
};
