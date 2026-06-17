#!/usr/bin/env node
'use strict';

const {
  analyzeRepository,
  runGovernedAutofix
} = require('../../runtime/ai-notes-governance/v1/sheikha-ai-notes-governance-autofix-v1');

const cmd = process.argv[2] || 'analyze';

if (cmd === 'analyze') {
  console.log(JSON.stringify(analyzeRepository(), null, 2));
} else if (cmd === 'autofix') {
  console.log(JSON.stringify(runGovernedAutofix(), null, 2));
} else {
  console.error('Usage: node tools/ai-notes-governance/sheikha-ai-notes-governance-cli.js [analyze|autofix]');
  process.exit(1);
}
