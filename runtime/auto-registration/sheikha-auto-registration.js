'use strict';

const { discoverModules } =
require('../discovery/sheikha-module-discovery');

function autoRegisterModules() {

  return discoverModules().map(
    module => ({
      ...module,
      registered: true
    })
  );

}

module.exports = {
  autoRegisterModules
};
