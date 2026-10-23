'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-connector-authority-capability-matrix-v1.json'
);

const {
  buildEngineIntegrations,
} = require('./sheikha-engine-integration-fabric-v1');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildExternalProfileCapability(profile, config) {
  const rule = clone(config.channelRules.EXTERNAL_PROFILE);
  const credentialRequired = Boolean(profile.credentialRequired);

  return {
    id: profile.id,
    kind: 'EXTERNAL_PROFILE',
    category: profile.category,
    domains: profile.domains || [],
    accessGate: profile.accessGate,
    credentialRequired,
    liveConnectionClaim: Boolean(profile.liveConnectionClaim),
    available: {
      ...rule.available,
      READ: true,
    },
    authorized: {
      ...rule.authorized,
      READ: false,
    },
    live: {
      ...rule.live,
      READ: Boolean(profile.liveConnectionClaim),
    },
    reason: profile.liveConnectionClaim
      ? 'LIVE_READ_EVIDENCE_PRESENT'
      : credentialRequired
        ? 'AUTHORIZATION_AND_CREDENTIAL_REQUIRED'
        : 'TERMS_OR_RIGHTS_REVIEW_REQUIRED',
  };
}

function buildEnterpriseDeclarationCapability(name, config) {
  const rule = clone(config.channelRules.ENTERPRISE_DECLARATION);
  return {
    id: name,
    kind: 'ENTERPRISE_DECLARATION',
    category: 'NAMED_ENTERPRISE_CONNECTOR',
    domains: [],
    available: rule.available,
    authorized: rule.authorized,
    live: rule.live,
    reason: rule.reason,
  };
}

function buildChannelCapabilities(config) {
  return Object.entries(config.channelRules).map(([id, rule]) => ({
    id,
    kind: id,
    available: clone(rule.available),
    authorized: clone(rule.authorized),
    live: clone(rule.live),
    reason: rule.reason,
  }));
}

function countOperation(matrix, layer, operation) {
  return matrix.filter((item) => item[layer]?.[operation] === true).length;
}

function buildAuthorityCapabilityMatrix() {
  const config = readConfig();
  const integration = buildEngineIntegrations();
  const evidence = config.evidenceSources;

  const enterprise = readJson(evidence.enterpriseConnectors);
  const governance = readJson(evidence.connectorGovernance);
  const mcpTools = readJson(evidence.mcpTools);

  const channelCapabilities = buildChannelCapabilities(config);
  const externalProfiles = integration.connectorProfiles.map((profile) =>
    buildExternalProfileCapability(profile, config)
  );
  const enterpriseDeclarations = enterprise.connectors.map((name) =>
    buildEnterpriseDeclarationCapability(name, config)
  );
  const connectorCapabilities = [
    ...externalProfiles,
    ...enterpriseDeclarations,
  ];

  const allWritesAuthorized = connectorCapabilities.filter((item) =>
    ['WRITE', 'CREATE', 'UPDATE', 'DELETE'].some(
      (operation) => item.authorized[operation] === true
    )
  ).length;

  const allWritesLive = connectorCapabilities.filter((item) =>
    ['WRITE', 'CREATE', 'UPDATE', 'DELETE'].some(
      (operation) => item.live[operation] === true
    )
  ).length;

  const liveExternalReads = externalProfiles.filter(
    (item) => item.live.READ === true
  ).length;

  const status =
    integration.status === 'CLEAR' &&
    allWritesAuthorized === 0 &&
    allWritesLive === 0
      ? 'CLEAR'
      : 'REVIEW_REQUIRED';

  const operationSummary = {};
  for (const operation of config.operations) {
    operationSummary[operation] = {
      available: countOperation(connectorCapabilities, 'available', operation),
      authorized: countOperation(connectorCapabilities, 'authorized', operation),
      live: countOperation(connectorCapabilities, 'live', operation),
    };
  }

  return {
    system: config.system,
    version: config.version,
    status,
    mode: config.mode,
    governance: config.governance,
    summary: {
      channelTypes: channelCapabilities.length,
      externalProfiles: externalProfiles.length,
      enterpriseDeclarations: enterpriseDeclarations.length,
      connectorCapabilityRecords: connectorCapabilities.length,
      mcpToolsDefined: mcpTools.tools.length,
      liveExternalReads,
      externalMutationsAuthorized: allWritesAuthorized,
      externalMutationsLive: allWritesLive,
      governancePolicies: governance.policies.length,
    },
    truth: {
      availableDoesNotMeanAuthorized: true,
      authorizedDoesNotMeanLive: true,
      enterpriseConnectorNamesAreDeclarationsOnly: true,
      liveExternalReadClaims:
        liveExternalReads,
      externalMutationAuthority:
        allWritesAuthorized === 0 ? 'NONE' : 'PRESENT',
    },
    operationSummary,
    channelCapabilities,
    connectorCapabilities,
  };
}

function getConnectorCapability(id) {
  return buildAuthorityCapabilityMatrix().connectorCapabilities.find(
    (item) => item.id === id
  ) || null;
}

function getDomainConnectorCapabilities(domain) {
  const matrix = buildAuthorityCapabilityMatrix();
  return matrix.connectorCapabilities.filter(
    (item) => item.domains.includes(domain)
  );
}

module.exports = {
  buildAuthorityCapabilityMatrix,
  getConnectorCapability,
  getDomainConnectorCapabilities,
};
