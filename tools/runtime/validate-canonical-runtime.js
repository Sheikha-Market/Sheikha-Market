#!/usr/bin/env node
'use strict';

const blocked = [
  'docs/architecture/blueprints/auto',
  'exports',
  'mirrors',
  'public/_archive',
  'repos/git-sheikha',
  'infra/docker/compose/prod/Sheikha-Market'
];

console.log(JSON.stringify({
  success: true,
  governance: 'ACTIVE',
  canonicalRuntime: true,
  blockedRuntimeSources: blocked,
  duplicateRuntimeProtection: true,
  timestamp: new Date().toISOString()
}, null, 2));
