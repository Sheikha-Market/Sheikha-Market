'use strict';

const path = require('node:path');
const Matrix = require('../../runtime/minds/sheikha_multi_mind_matrix');

try {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !['status', 'initialize'].includes(args[0])) throw Error('MINDS_COMMAND_NOT_ADMITTED');
  const matrix = new Matrix({ stateRoot: path.resolve(__dirname, '../../runtime/private/minds') });
  const result = args[0] === 'initialize' ? matrix.initialize() : matrix.status();
  process.stdout.write(JSON.stringify({ success: true, data: result }, null, 2) + '\n');
} catch (_error) {
  process.stderr.write(JSON.stringify({ success: false, error: 'MINDS_COMMAND_FAILED', externalExecution: false }) + '\n');
  process.exitCode = 1;
}
