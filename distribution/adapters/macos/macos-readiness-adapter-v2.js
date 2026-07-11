'use strict';

function inspectMacosReadiness(target, context) {
  const desktop = context.products.declaredCandidates.find((item) => item.id === 'sheikha-desktop');
  const universalTarget = target.architecture === 'universal2';
  return {
    system: 'SHEIKHA_MACOS_READINESS_ADAPTER_V2',
    targetId: target.id,
    nativeRunnerAvailable: context.toolchain.host.platform === 'darwin',
    desktopRuntimeImplemented: desktop?.implemented === true,
    lipoAvailable: Boolean(context.toolchain.tools.lipo),
    hdiutilAvailable: Boolean(context.toolchain.tools.hdiutil),
    codesignAvailable: Boolean(context.toolchain.tools.codesign),
    notarizationToolAvailable: Boolean(context.toolchain.tools.xcrun),
    universal2EvidenceAvailable: false,
    status: target.product === 'sheikha-desktop'
      ? 'REQUIRES_DESKTOP_RUNTIME_IMPLEMENTATION'
      : 'REQUIRES_NATIVE_RUNNER',
    artifactCreated: false,
    limitations: [
      'No macOS-native runner is available on this host.',
      ...(universalTarget ? ['No dual-slice Mach-O evidence is available.'] : []),
      'No signing, notarization, or stapling was performed.'
    ]
  };
}

module.exports = { inspectMacosReadiness };
