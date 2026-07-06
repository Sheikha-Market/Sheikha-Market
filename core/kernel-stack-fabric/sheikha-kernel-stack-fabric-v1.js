'use strict';

const { inspectKernelFabric } = require('../kernel-fabric/sheikha-kernel-fabric-v1');

function inspectKernelStackFabric() {
  const kernel = inspectKernelFabric();

  return {
    system: 'SHEIKHA_KERNEL_STACK_FABRIC_V1',
    status: 'ACTIVE',
    mode: 'READ_ONLY_LAYER_MEASUREMENT',
    safety: {
      noKernelModification: true,
      noBootModification: true,
      noSysctlModification: true,
      noPackageInstall: true,
      noServiceRestart: true,
      noHarm: true
    },
    layers: [
      { id: 'hardware-layer', name: 'Hardware Layer', scope: 'cpu-memory-disk', position: 'below-kernel' },
      { id: 'firmware-layer', name: 'Firmware Layer', scope: 'reported-only', position: 'below-kernel' },
      { id: 'boot-layer', name: 'Boot Layer', scope: 'read-only-no-boot-change', position: 'below-kernel' },
      { id: 'kernel-layer', name: 'Kernel Layer', scope: 'linux-kernel-read-only', position: 'kernel' },
      { id: 'os-layer', name: 'Operating System Layer', scope: 'pop-os-linux-distro', position: 'above-kernel' },
      { id: 'process-layer', name: 'Process Layer', scope: 'pm2-process-observation', position: 'above-kernel' },
      { id: 'runtime-layer', name: 'Runtime Layer', scope: 'node-pm2-runtime-health', position: 'above-kernel' },
      { id: 'application-layer', name: 'Application Layer', scope: 'sheikha-runtime-services', position: 'above-kernel' },
      { id: 'governance-layer', name: 'Governance Layer', scope: 'no-harm-human-review', position: 'above-kernel' }
    ],
    kernel
  };
}

module.exports = { inspectKernelStackFabric };
