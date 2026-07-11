'use strict';

class WindowsInstallerAdapter {
  constructor(profile) {
    if (!['current-user', 'system'].includes(profile.installationScope)) {
      throw new Error(`Unsupported Windows installer scope: ${profile.installationScope}`);
    }
    this.profile = Object.freeze({ ...profile });
  }

  plan(target, context) {
    const desktop = context.products.declaredCandidates.find((item) => item.id === 'sheikha-desktop');
    const nativeRunner = context.toolchain.host.platform === 'windows';
    const toolAvailable = Boolean(
      context.toolchain.tools.osslsigncode ||
      context.toolchain.tools.makensis ||
      context.toolchain.tools.wix ||
      context.toolchain.tools.wixl ||
      context.toolchain.tools.signtool
    );
    return {
      system: 'SHEIKHA_WINDOWS_INSTALLER_ADAPTER_V2',
      targetId: target.id,
      profile: this.profile,
      desktopRuntimeImplemented: desktop?.implemented === true,
      nativeRunnerAvailable: nativeRunner,
      installerToolAvailable: toolAvailable,
      buildAllowed: desktop?.implemented === true && nativeRunner && toolAvailable,
      status: desktop?.implemented === true ? 'REQUIRES_NATIVE_RUNNER' : 'REQUIRES_DESKTOP_RUNTIME_IMPLEMENTATION',
      artifactCreated: false,
      limitation: 'No EXE is created until an executable desktop runtime, a Windows-native runner, installer inspection, and signing readiness are present.'
    };
  }

  build() {
    throw new Error('Windows installer build is blocked: no verified desktop runtime exists.');
  }
}

module.exports = { WindowsInstallerAdapter };
