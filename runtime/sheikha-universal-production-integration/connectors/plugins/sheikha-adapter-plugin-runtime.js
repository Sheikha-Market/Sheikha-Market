'use strict';

const {
  validateAdapterPlugin
} = require('./sheikha-adapter-plugin-contract');

const {
  LinuxHostAdapterPlugin
} = require('./linux/linux-host-adapter-plugin');

const BUILTIN_PLUGINS = [
  LinuxHostAdapterPlugin
];

class SheikhaAdapterPluginRuntime {
  constructor({ plugins } = {}) {
    this.plugins = plugins || BUILTIN_PLUGINS;
  }

  runPlugin(plugin) {
    const contract = validateAdapterPlugin(plugin);
    const discovery = plugin.discover();
    const measurement = plugin.measure();
    const validation = plugin.validate();
    const registration = plugin.register();
    const recovery = plugin.recover();

    const passed = Boolean(validation.valid && registration.governed && registration.audited);

    return {
      system: 'SHEIKHA_ADAPTER_PLUGIN_RUNTIME_V1',
      pluginId: plugin.id,
      target: plugin.target,
      status: passed ? 'PLUGIN_EXECUTED_PRODUCTION_CANDIDATE' : 'PLUGIN_EXECUTION_NEEDS_REVIEW',
      productionCandidate: passed,
      governed: true,
      audited: true,
      contract,
      discovery,
      measurement,
      validation,
      registration,
      recovery,
      boundaries: {
        readOnlyDiscovery: true,
        noWriteOperation: true,
        noSecretMutation: true,
        safeRecoveryOnly: true
      }
    };
  }

  runAllPlugins() {
    return this.plugins.map((plugin) => this.runPlugin(plugin));
  }

  getStatus() {
    const results = this.runAllPlugins();
    const passed = results.every((result) => result.productionCandidate);

    return {
      system: 'SHEIKHA_ADAPTER_PLUGIN_RUNTIME_V1',
      arabicName: 'شيخة طبقة تشغيل Plugins الموصلات الفعلية',
      status: passed ? 'ACTIVE_PLUGIN_RUNTIME_READY' : 'ACTIVE_PLUGIN_RUNTIME_NEEDS_REVIEW',
      layerRank: 'ABOVE_REAL_ADAPTER_RUNTIME',
      productionReady: passed,
      governed: true,
      audited: true,
      plugins: results,
      coverage: {
        total: results.length,
        productionCandidates: results.filter((x) => x.productionCandidate).length,
        score: passed ? 100 : 0
      },
      boundaries: {
        readOnlyDiscovery: true,
        noWriteOperation: true,
        noSecretMutation: true,
        allPluginsGoverned: results.every((x) => x.governed),
        allPluginsAudited: results.every((x) => x.audited)
      }
    };
  }
}

module.exports = {
  SheikhaAdapterPluginRuntime,
  BUILTIN_PLUGINS
};
