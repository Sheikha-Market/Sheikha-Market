'use strict';

module.exports = {
  ...require('./core/sheikha-desktop-product-core-v1'),
  ...require('./bridge/sheikha-desktop-capability-bridge-v1'),
  ...require('./security/sheikha-desktop-governance-gate-v1'),
  ...require('./installer-contracts/sheikha-desktop-installer-adapter-v1')
};
