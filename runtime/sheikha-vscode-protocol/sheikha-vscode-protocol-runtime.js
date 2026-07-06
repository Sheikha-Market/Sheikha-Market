'use strict';

const protocol = require('../../protocol/sheikha-vscode-protocol/sheikha-vscode-protocol-v1.json');

function loadSheikhaVSCodeProtocol() {
  return protocol;
}

function verifySheikhaVSCodeProtocol() {
  const p = loadSheikhaVSCodeProtocol();

  const requiredChannels = [
    'chat',
    'federation',
    'graph',
    'runtime'
  ];

  const missingChannels = requiredChannels.filter(
    (key) => !p.channels || !p.channels[key]
  );

  return {
    system: 'SHEIKHA_VSCODE_PROTOCOL_VERIFIER_V1',
    status: missingChannels.length === 0 ? 'PASSED' : 'FAILED',
    protocol: p.system,
    missingChannels,
    languageId: p.language && p.language.id,
    governance: p.governance
  };
}

module.exports = {
  loadSheikhaVSCodeProtocol,
  verifySheikhaVSCodeProtocol
};
