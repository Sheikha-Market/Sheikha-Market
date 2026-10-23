'use strict';
const { createAssetDigitization } = require('../../core/ownership/sheikha-asset-digitization-v1.cjs');
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.length && args[0] !== '--save') throw Error('ASSET_INPUT_REJECTED');
  const service = createAssetDigitization(), report = args[0] === '--save' ? service.snapshot().report : service.inspect();
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} catch {
  process.stderr.write('ASSET_DIGITIZATION_FAILED\n'); process.exitCode = 1;
}
