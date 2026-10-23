#!/usr/bin/env node
'use strict';

const { inspectIntegrations } = require('../../runtime/repository-integration/v1/sheikha-repository-integration-v1');
const args = process.argv.slice(2);
const options = {};
try {
  while (args.length) {
    const flag = args.shift();
    if (!['--root', '--registry'].includes(flag) || !args[0] || args[0].startsWith('--')) {
      throw new Error('USAGE: node tools/integrations/sheikha-repositories-v1.cjs [--root PATH] [--registry FILE]');
    }
    options[flag === '--root' ? 'workspaceRoot' : 'registryFile'] = args.shift();
  }
  const result = inspectIntegrations(options);
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'REGISTERED_LOCAL_REPOSITORIES_INSPECTED') process.exitCode = 2;
} catch {
  console.error('REPOSITORY_INSPECTION_FAILED_CHECK_OWNER_REGISTRY');
  process.exitCode = 1;
}
