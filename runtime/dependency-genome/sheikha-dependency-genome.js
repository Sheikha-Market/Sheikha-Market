'use strict';

function createDependencyGenome() {
  return {
    system: 'SHEIKHA_DEPENDENCY_GENOME_V1',
    status: 'ACTIVE',
    tracked: [
      'node-fetch',
      'punycode',
      'whatwg-url',
      'gaxios',
      'mongodb',
      'google-cloud',
      'eslint',
      'jest'
    ],
    dimensions: [
      'version',
      'risk',
      'compatibility',
      'migration-plan',
      'rollback-plan',
      'evidence'
    ],
    noSilentUpgrade: true
  };
}

module.exports = { createDependencyGenome };
