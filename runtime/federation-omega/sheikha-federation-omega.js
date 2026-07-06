'use strict';

const { productionSummary } = require('../production-summary');
const { loadQuranicAtlas } = require('../quranic-atlas/sheikha-quranic-atlas-runtime');
const { loadQuranicOperatingSystemAtlas } =
require('../quranic-operating-system/sheikha-quranic-operating-system-atlas-runtime');

function loadFederationOmega() {
  return {
    system: 'SHEIKHA_FEDERATION_OMEGA_V1',
    status: 'ACTIVE',
    production: productionSummary(),
    quranicAtlas: loadQuranicAtlas(),
    quranicOperatingSystemAtlas: loadQuranicOperatingSystemAtlas()
  };
}

module.exports = { loadFederationOmega };
