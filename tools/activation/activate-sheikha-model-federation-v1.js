'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildFederation } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-federation-v1'
);

const root = path.resolve(__dirname, '../..');
const marketPath = path.join(root, 'runtime/sheikha-ai-governor/v1/sheikha-model-market-catalog-v1.json');
const outputPath = path.join(root, 'runtime/sheikha-ai-governor/v1/sheikha-model-federation-v1.json');
const market = JSON.parse(fs.readFileSync(marketPath, 'utf8'));
const federation = buildFederation([{
  name: market.upstream.provider,
  recordType: 'INFERENCE_CATALOG',
  models: market.models
}]);

fs.writeFileSync(outputPath, `${JSON.stringify(federation, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  system: federation.system,
  governingLayer: federation.governingLayer,
  summary: federation.summary,
  output: path.relative(root, outputPath),
  federationSha256: federation.federationSha256,
  externalModelsRenamedAsOwned: false,
  automaticTraining: false,
  productionPromotion: false
}, null, 2));
