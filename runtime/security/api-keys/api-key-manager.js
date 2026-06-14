'use strict';

const apiKeyManager = Object.freeze({
  system: 'SHEIKHA_API_KEY_MANAGER_V1',
  status: 'ACTIVE',
  supportedActions: ['issue', 'rotate', 'revoke', 'audit'],
  rules: {
    neverExposeSecrets: true,
    hashBeforeStore: true,
    scopedKeysOnly: true,
    auditEveryAction: true,
    humanApprovalForProductionKeys: true
  }
});

function status() {
  return apiKeyManager;
}

function registry() {
  return {
    registry: 'SHEIKHA_API_KEY_REGISTRY_V1',
    status: 'ACTIVE',
    keys: []
  };
}

module.exports = {
  status,
  registry
};
