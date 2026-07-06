'use strict';

const REQUIRED_PLUGIN_OPERATIONS = [
  'discover',
  'measure',
  'validate',
  'register',
  'recover'
];

function validateAdapterPlugin(plugin) {
  if (!plugin || !plugin.id || !plugin.target) {
    throw new Error('Adapter plugin requires id and target');
  }

  for (const operation of REQUIRED_PLUGIN_OPERATIONS) {
    if (typeof plugin[operation] !== 'function') {
      throw new Error(`Adapter plugin missing operation: ${operation}`);
    }
  }

  return {
    pluginId: plugin.id,
    target: plugin.target,
    status: 'PLUGIN_CONTRACT_VALID',
    requiredOperations: REQUIRED_PLUGIN_OPERATIONS,
    governed: true,
    audited: true
  };
}

module.exports = {
  REQUIRED_PLUGIN_OPERATIONS,
  validateAdapterPlugin
};
