'use strict';

module.exports = {
  provider: 'SHEIKHA_LOCAL_PROVIDER',
  sovereign: true,
  offlineCapable: true,
  status() {
    return {
      success: true,
      provider: 'local',
      runtime: 'ACTIVE',
      timestamp: new Date().toISOString()
    };
  }
};
