'use strict';

const os = require('os');

const LinuxHostAdapterPlugin = {
  id: 'sheikha-plugin:linux-host',
  target: 'linux-host',
  mode: 'READ_ONLY_DISCOVERY',

  discover() {
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      type: os.type()
    };
  },

  measure() {
    return {
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    };
  },

  validate() {
    return {
      valid: os.platform() === 'linux',
      expectedPlatform: 'linux',
      actualPlatform: os.platform(),
      readOnly: true
    };
  },

  register() {
    return {
      registryId: 'linux-host:local',
      target: 'linux-host',
      status: 'REGISTERED_PLUGIN_ADAPTER',
      governed: true,
      audited: true
    };
  },

  recover() {
    return {
      status: 'RECOVERY_PLAN_READY',
      actions: [
        'rerun-discovery',
        'rerun-measurement',
        'revalidate-plugin-contract',
        'record-master-log'
      ],
      safe: true,
      readOnly: true
    };
  }
};

module.exports = {
  LinuxHostAdapterPlugin
};
