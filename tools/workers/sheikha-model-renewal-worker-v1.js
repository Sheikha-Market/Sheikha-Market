'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { renew, writeJsonAtomic } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-renewal-v1'
);

const root = path.resolve(__dirname, '../..');
const base = path.join(root, 'runtime/sheikha-ai-governor/v1');
const files = {
  catalog: path.join(base, 'sheikha-model-market-catalog-v1.json'),
  federation: path.join(base, 'sheikha-model-federation-v1.json'),
  report: path.join(base, 'sheikha-model-renewal-runtime-v1.json')
};
const intervalMs = Math.max(60 * 60 * 1000, Number(process.env.SHEIKHA_MODEL_REFRESH_INTERVAL_MS || 86400000));

async function cycle() {
  const previous = fs.existsSync(files.catalog)
    ? JSON.parse(fs.readFileSync(files.catalog, 'utf8'))
    : { models: [] };
  const result = await renew({ previous });
  writeJsonAtomic(files.catalog, result.catalog);
  writeJsonAtomic(files.federation, result.federation);
  writeJsonAtomic(files.report, { ...result.report, intervalMs });
  console.log(JSON.stringify(result.report));
}

async function main() {
  await cycle();
  if (process.argv.includes('--once')) return;
  setInterval(() => cycle().catch((error) => {
    writeJsonAtomic(files.report, {
      system: 'SHEIKHA_MODEL_RENEWAL_V1',
      status: 'REFRESH_FAILED_KEEPING_LAST_GOOD_SNAPSHOT',
      generatedAt: new Date().toISOString(),
      error: String(error.message || error),
      intervalMs
    });
  }), intervalMs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
