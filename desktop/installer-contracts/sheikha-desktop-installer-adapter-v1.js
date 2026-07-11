'use strict';

const PROFILES = Object.freeze({
  user: Object.freeze({
    id: 'user',
    installationScope: 'current-user',
    administratorRequired: false,
    installRootClass: 'user-local',
    uninstallScope: 'current-user'
  }),
  system: Object.freeze({
    id: 'system',
    installationScope: 'machine-wide',
    administratorRequired: true,
    installRootClass: 'system',
    uninstallScope: 'machine-wide'
  })
});

class DesktopInstallerAdapterV1 {
  constructor({ profile, nativeExecutor = null }) {
    if (!PROFILES[profile]) throw new Error(`Unsupported desktop installer profile: ${profile}`);
    this.profile = PROFILES[profile];
    this.nativeExecutor = nativeExecutor;
  }

  plan(platform) {
    return {
      system: 'SHEIKHA_DESKTOP_INSTALLER_ADAPTER_V1',
      platform,
      profile: this.profile,
      adapterImplemented: true,
      nativeExecutorRegistered: Boolean(this.nativeExecutor),
      buildAllowed: false,
      status: 'REQUIRES_NATIVE_RUNNER',
      reason: 'A platform-native executor, native inspection, and applicable signing evidence are required.'
    };
  }

  async execute(request) {
    if (request?.governanceDecision?.permitted !== true) {
      throw new Error('Installer execution requires a permitted governance decision.');
    }
    if (this.profile.administratorRequired && request?.payload?.administratorApproval !== true) {
      throw new Error('System installation requires explicit administrator approval.');
    }
    if (!this.nativeExecutor || typeof this.nativeExecutor.execute !== 'function') {
      throw new Error('No platform-native installer executor is registered.');
    }
    return this.nativeExecutor.execute({ ...request, profile: this.profile });
  }
}

module.exports = { DesktopInstallerAdapterV1, PROFILES };
