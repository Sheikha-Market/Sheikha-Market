'use strict';

const registry = require('../registry/sheikha-runtime-registry');

function discoverModules() {
  return Object.entries(registry).map(([name, status]) => ({
    module: name,
    status
  }));
}

module.exports = { discoverModules };
