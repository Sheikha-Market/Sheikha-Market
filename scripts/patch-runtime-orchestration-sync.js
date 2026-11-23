#!/usr/bin/env node
'use strict';

const fs = require('fs');

const candidates = [
  'runtime/kernel/sheikha-runtime-kernel.js',
  'core/runtime/sheikha-runtime-kernel.js',
  'core/runtime/kernel/sheikha-runtime-kernel.js'
];

const target = candidates.find(f => fs.existsSync(f));

if (!target) {
  console.error('Runtime kernel file not found');
  process.exit(1);
}

let src = fs.readFileSync(target, 'utf8');

if (!src.includes('sheikha-root-orchestrator')) {

  const requireBlock = `
const rootOrchestrator =
require('../../core/orchestration/sheikha-root-orchestrator');
`;

  src = requireBlock + '\n' + src;

  src = src.replace(
    /orchestration:\s*false/g,
    'orchestration: rootOrchestrator.status().orchestration'
  );

  fs.writeFileSync(target, src);

  console.log('PATCHED:', target);

} else {
  console.log('ALREADY_PATCHED:', target);
}
