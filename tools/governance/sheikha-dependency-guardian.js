#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');

const watched = [
  'node-fetch',
  'punycode',
  'whatwg-url',
  'gaxios',
  '@google-cloud/storage',
  'mongodb'
];

const results = watched.map((name) => {
  try {
    const output = execSync(`npm ls ${name} --json`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    return {
      dependency: name,
      status: 'FOUND',
      detail: JSON.parse(output).name || 'dependency-tree'
    };
  } catch {
    return {
      dependency: name,
      status: 'NOT_FOUND'
    };
  }
});

const warnings = results.filter((r) =>
  ['node-fetch', 'punycode', 'whatwg-url'].includes(r.dependency) &&
  r.status === 'FOUND'
);

console.log(JSON.stringify({
  system: 'SHEIKHA_DEPENDENCY_GUARDIAN_V1',
  status: warnings.length ? 'WARNING' : 'PASSED',
  warnings,
  results
}, null, 2));

process.exit(0);
