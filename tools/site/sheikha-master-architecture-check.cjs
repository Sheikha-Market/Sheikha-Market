'use strict';

const { getStatus } = require('../../core/site-registry/sheikha-master-architecture-topology-v1.cjs');

try {
  const status = getStatus();
  process.stdout.write(JSON.stringify(status, null, 2) + '\n');
  if (!status.hybridArchitecture.alignmentValid) process.exitCode = 1;
} catch (error) {
  process.stderr.write(JSON.stringify({ ok: false, error: 'TOPOLOGY_CHECK_FAILED',
    validation: error.validation || null }) + '\n');
  process.exitCode = 1;
}
