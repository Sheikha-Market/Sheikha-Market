'use strict';
const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '../..');
function status() {
  try {
    const pointer = JSON.parse(fs.readFileSync(path.join(ROOT, 'runtime/sheikha-native-environment/v1/current.json'), 'utf8'));
    if (!/^[a-f0-9]{64}$/.test(pointer.buildId)) throw new Error('Invalid build ID');
    const directory = path.join(ROOT, 'runtime/sheikha-native-environment/v1/builds', pointer.buildId);
    const report = JSON.parse(fs.readFileSync(path.join(directory, 'verification.json'), 'utf8'));
    const permitted = ['BOOTX64.EFI', 'sheikha-native-environment.img', 'sheikha_native_package.h'];
    const integrity = permitted.every(file => {
      const record = report.artifacts?.find(item => item.file === file);
      const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, file))).digest('hex');
      return record?.sha256 === digest;
    });
    const verified = integrity && report.buildId === pointer.buildId && report.status === 'NATIVE_VM_RUNTIME_VERIFIED' &&
      report.qemuExitCode === 33 && report.guestContractCount === 18 && report.postFirmwareHandoffVerified === true;
    return { system: 'SHEIKHA_NATIVE_DEPLOYMENT_ENVIRONMENT_V1',
      status: verified ? 'DEVELOPMENT_VM_RUNTIME_VERIFIED' : 'UNKNOWN', buildId: pointer.buildId,
      artifactIntegrityVerified: integrity, nativeGuestExecutionVerified: verified,
      deploymentMode: 'STATIC_DEVELOPMENT_PACKAGE_IN_RAM', guestRuntimeDependencies: [],
      buildHostDependencies: ['Node.js', 'GCC', 'binutils', 'QEMU', 'OVMF'],
      productionReady: false, physicalDeploymentVerified: 'UNKNOWN',
      blockers: ['NETWORK_STACK', 'PERSISTENT_FILESYSTEM', 'USER_MODE_ISOLATION', 'PREEMPTIVE_SCHEDULER',
        'DYNAMIC_PACKAGE_LOADER', 'TLS_AND_HTTP', 'SIGNED_RELEASES', 'FULL_SERVICE_MIGRATION'],
      evidenceFile: path.relative(ROOT, path.join(directory, 'verification.json')) };
  } catch (_) { return { system: 'SHEIKHA_NATIVE_DEPLOYMENT_ENVIRONMENT_V1', status: 'UNKNOWN', productionReady: false }; }
}
module.exports = { status };
