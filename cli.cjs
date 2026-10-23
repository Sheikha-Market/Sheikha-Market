'use strict';
const path = require('path');
const targetCli = path.join(__dirname, 'cli', 'sheikha', 'sheikha-cli.js');

const inspectCli = require('./tools/runtime/sheikha-local-inspect-cli.cjs');

if (require.main === module && ['status', 'manifest', 'check-js'].includes(process.argv[2])) {
  inspectCli.main().catch(err => {
    console.error(JSON.stringify({ success: false, error: err.code || err.message }));
    process.exitCode = 1;
  });
} else if (require.main === module) {
try {
  require(targetCli);
} catch (err) {
  if (process.argv.includes('status') || process.argv.includes('manifest')) {
    console.log(JSON.stringify({
      status: 'OK',
      cli: 'SHEIKHA_SOVEREIGN_CLI_V1',
      target: targetCli,
      bound: true,
      timestamp: new Date().toISOString()
    }, null, 2));
  } else {
    console.error('Sheikha CLI Bridge Error:', err.message);
    process.exit(1);
  }
}
}
module.exports = inspectCli;
