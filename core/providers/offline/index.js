'use strict';

module.exports = {
  provider: 'SHEIKHA_OFFLINE_PROVIDER',
  sovereign: true,
  emergencyMode: true,
  status() {
    return {
      success: true,
      provider: 'offline',
      emergency: true,
      timestamp: new Date().toISOString()
    };
  }
};
