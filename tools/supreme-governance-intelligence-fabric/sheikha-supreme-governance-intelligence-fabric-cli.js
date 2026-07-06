#!/usr/bin/env node
'use strict';

const {
  safeStatus,
  inspect,
  governancePlan
} = require('../../runtime/supreme-governance-intelligence-fabric/v1/sheikha-supreme-governance-intelligence-fabric-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(safeStatus(), null, 2));
} else if (cmd === 'inspect') {
  console.log(JSON.stringify(inspect(), null, 2));
} else if (cmd === 'govern') {
  console.log(JSON.stringify(governancePlan([
    { message: 'command not found sheikha.openChat', file: 'sheikha-vscode-extension/src/extension.js' },
    { message: 'parseSseBuffer is not a function', file: 'sheikha-vscode-extension/src/sheikhaExtensionChatClient.js' },
    { message: 'protect .env and secrets', file: '.env' }
  ]), null, 2));
} else {
  console.error('Usage: node tools/supreme-governance-intelligence-fabric/sheikha-supreme-governance-intelligence-fabric-cli.js [status|inspect|govern]');
  process.exit(1);
}
