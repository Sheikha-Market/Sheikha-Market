'use strict';

const { discoverModules } =
require('../discovery/sheikha-module-discovery');

function evaluateSystemHealth() {
  const modules = discoverModules();

  const active = modules.filter(
    m => m.status === 'ACTIVE'
  ).length;

  return {
    status:
      active === modules.length
        ? 'HEALTHY'
        : 'DEGRADED',

    totalModules: modules.length,
    activeModules: active,
    modules
  };
}

module.exports = {
  evaluateSystemHealth
};
