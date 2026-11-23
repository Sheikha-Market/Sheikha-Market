'use strict';
const language = require('../../core/language/sheikha-managed-language-v1.cjs');
const { simulateFoundryTelecom } = require('./foundry-telecom.cjs');
const { processNaturalData } = require('../../core/natural-data/sheikha-natural-data-v1.cjs');
const { interpretSensorBatch } = require('./sensory.cjs');
function createSheikhaClient(config = {}) {
  return {
    name: 'SHEIKHA_JS_SDK', version: '1.1.0',
    status: () => language.status(),
    compile: (source, options = {}) => language.compile(source, options),
    run: (source, options = {}) => language.run(source, options),
    simulateFoundryTelecom,
    processNaturalData,
    interpretSensorBatch
  };
}
module.exports = { createSheikhaClient };
