'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildMarketCatalog } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-market-catalog-v1'
);

const root = path.resolve(__dirname, '../..');
const input = process.argv[2] || process.env.SHEIKHA_MODEL_CATALOG_INPUT;
if (!input) throw new Error('MODEL_CATALOG_INPUT_REQUIRED');
const resolvedInput = path.resolve(input);
const output = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/sheikha-model-market-catalog-v1.json'
);
const payload = JSON.parse(fs.readFileSync(resolvedInput, 'utf8'));
const catalog = buildMarketCatalog(payload, { fetchedWithoutApiKey: true });
fs.writeFileSync(output, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  system: catalog.system,
  brand: catalog.brand,
  summary: catalog.summary,
  output: path.relative(root, output),
  catalogSha256: catalog.catalogSha256,
  modelsInvoked: false,
  paidUsage: false,
  thirdPartyLicensesIssued: false
}, null, 2));
