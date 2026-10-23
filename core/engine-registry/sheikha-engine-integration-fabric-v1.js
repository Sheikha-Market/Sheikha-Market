'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-engine-integration-fabric-v1.json'
);

const {
  buildMasterRegistry,
} = require('./sheikha-master-engine-registry-v1');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function classifyConnectorProfile(profile) {
  if (!profile) {
    return {
      read: 'NOT_CONFIGURED',
      write: 'BLOCKED',
      live: false,
      reason: 'PROFILE_NOT_FOUND',
    };
  }

  if (profile.liveConnectionClaim === true) {
    return {
      read: 'READ',
      write: 'BLOCKED',
      live: true,
      reason: 'LIVE_CONNECTION_EVIDENCED_READ_ONLY',
    };
  }

  return {
    read: profile.credentialRequired
      ? 'AUTH_REQUIRED'
      : 'NOT_CONFIGURED',
    write: 'BLOCKED',
    live: false,
    reason: profile.credentialRequired
      ? 'CREDENTIAL_AND_AUTHORIZATION_REQUIRED'
      : 'READINESS_ONLY_NO_LIVE_CONNECTION_CLAIM',
  };
}

function buildEvidence(config) {
  const sources = config.evidenceSources;
  const connectorProfiles = readJson(sources.connectorProfiles);
  const sdkMcpReport = readJson(sources.sdkMcpReport);
  const mcpGatewayReport = readJson(sources.mcpGatewayReport);
  const mcpToolCatalog = readJson(sources.mcpToolCatalog);
  const enterpriseConnectors = readJson(sources.enterpriseConnectors);
  const connectorGovernance = readJson(sources.connectorGovernance);
  const connectorBindings = readJson(sources.connectorBindings);

  return {
    connectorProfiles,
    sdkMcpReport,
    mcpGatewayReport,
    mcpToolCatalog,
    enterpriseConnectors,
    connectorGovernance,
    connectorBindings,
  };
}

function buildConnectorProfiles(config, evidence) {
  const profileMap = new Map(
    evidence.connectorProfiles.profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  return evidence.connectorProfiles.profiles.map((profile) => ({
    ...profile,
    access: classifyConnectorProfile(profile),
    domains: Object.entries(config.domainConnectorProfiles)
      .filter(([, ids]) => ids.includes(profile.id))
      .map(([domain]) => domain),
  }));
}

function buildEngineIntegrations() {
  const config = readConfig();
  const master = buildMasterRegistry();
  const evidence = buildEvidence(config);
  const connectorProfiles = buildConnectorProfiles(config, evidence);
  const connectorMap = new Map(
    connectorProfiles.map((profile) => [profile.id, profile])
  );

  const mcpContractReady =
    evidence.sdkMcpReport.status === 'ACTIVE' &&
    evidence.mcpGatewayReport.status === 'ACTIVE' &&
    evidence.mcpToolCatalog.status === 'ACTIVE';

  const sdkContractReady =
    evidence.sdkMcpReport.status === 'ACTIVE' &&
    evidence.sdkMcpReport.dependencies?.sdkRegistry === true &&
    evidence.sdkMcpReport.checks?.sdkLayersComplete === true;

  const engines = master.coreEngines.map((engine) => {
    const connectorIds = unique(
      (engine.domains || []).flatMap(
        (domain) => config.domainConnectorProfiles[domain] || []
      )
    );
    const externalConnectors = connectorIds
      .map((id) => connectorMap.get(id))
      .filter(Boolean);

    const authRequired = externalConnectors.filter(
      (connector) => connector.access.read === 'AUTH_REQUIRED'
    ).length;
    const notConfigured = externalConnectors.filter(
      (connector) => connector.access.read === 'NOT_CONFIGURED'
    ).length;
    const liveRead = externalConnectors.filter(
      (connector) => connector.access.read === 'READ'
    ).length;

    return {
      engine: engine.id,
      domains: engine.domains || [],
      gateway: config.gateway,
      channels: {
        internalService: {
          read: 'READ',
          write: 'BLOCKED',
          state: 'LOCAL_SOURCE_READY',
        },
        sdk: {
          read: sdkContractReady ? 'READ' : 'NOT_CONFIGURED',
          write: 'BLOCKED',
          state: sdkContractReady
            ? 'LOCAL_CONTRACT_READY'
            : 'LOCAL_CONTRACT_NOT_READY',
        },
        mcp: {
          read: mcpContractReady ? 'READ' : 'NOT_CONFIGURED',
          write: 'BLOCKED',
          state: mcpContractReady
            ? 'LOCAL_CONTRACT_READY'
            : 'LOCAL_CONTRACT_NOT_READY',
        },
        externalConnector: {
          read:
            liveRead > 0
              ? 'READ'
              : authRequired > 0
                ? 'AUTH_REQUIRED'
                : 'NOT_CONFIGURED',
          write: 'BLOCKED',
          state: liveRead > 0
            ? 'LIVE_READ_EVIDENCED'
            : 'READINESS_ONLY',
        },
      },
      externalConnectors: externalConnectors.map((connector) => ({
        id: connector.id,
        category: connector.category,
        accessGate: connector.accessGate,
        credentialRequired: connector.credentialRequired,
        liveConnectionClaim: connector.liveConnectionClaim,
        read: connector.access.read,
        write: connector.access.write,
        reason: connector.access.reason,
      })),
      summary: {
        connectorProfiles: externalConnectors.length,
        liveRead,
        authRequired,
        notConfigured,
        writesBlocked: externalConnectors.length,
      },
    };
  });

  const allExternal = connectorProfiles.length;
  const liveExternal = connectorProfiles.filter(
    (profile) => profile.access.live
  ).length;
  const authRequiredExternal = connectorProfiles.filter(
    (profile) => profile.access.read === 'AUTH_REQUIRED'
  ).length;
  const notConfiguredExternal = connectorProfiles.filter(
    (profile) => profile.access.read === 'NOT_CONFIGURED'
  ).length;

  const status =
    master.status === 'CLEAR' &&
    mcpContractReady &&
    sdkContractReady
      ? 'CLEAR'
      : 'REVIEW_REQUIRED';

  return {
    system: config.system,
    version: config.version,
    status,
    gateway: config.gateway,
    mode: config.mode,
    governance: config.governance,
    summary: {
      engines: engines.length,
      sdkContractReady,
      mcpContractReady,
      mcpTools: evidence.mcpToolCatalog.tools.length,
      enterpriseConnectorNames:
        evidence.enterpriseConnectors.connectors.length,
      connectorProfiles: allExternal,
      liveExternalConnections: liveExternal,
      authRequiredExternal,
      notConfiguredExternal,
      externalWritesBlocked: allExternal,
      enterpriseBindings: evidence.connectorBindings.bindings.length,
      governancePolicies: evidence.connectorGovernance.policies.length,
    },
    truth: {
      connectorProfilesAreReadinessDefinitions: true,
      noLiveExternalConnectionClaim:
        liveExternal === 0,
      enterpriseConnectorNamesAreDeclarationsOnly: true,
      mcpAndSdkAreLocalContractReadiness:
        mcpContractReady && sdkContractReady,
    },
    engines,
    connectorProfiles,
    evidence: {
      sdkMcp: {
        system: evidence.sdkMcpReport.system,
        status: evidence.sdkMcpReport.status,
        score: evidence.sdkMcpReport.score,
      },
      mcpGateway: {
        system: evidence.mcpGatewayReport.system,
        status: evidence.mcpGatewayReport.status,
        score: evidence.mcpGatewayReport.score,
      },
      enterpriseConnectorFabric: {
        registry: evidence.enterpriseConnectors.registry,
        status: evidence.enterpriseConnectors.status,
      },
    },
  };
}

function getEngineIntegration(engineId) {
  return buildEngineIntegrations().engines.find(
    (entry) => entry.engine === engineId
  ) || null;
}

function getDomainIntegration(domain) {
  const fabric = buildEngineIntegrations();
  return {
    domain,
    gateway: fabric.gateway,
    engines: fabric.engines.filter(
      (entry) => entry.domains.includes(domain)
    ),
    connectorProfiles: fabric.connectorProfiles.filter(
      (profile) => profile.domains.includes(domain)
    ),
  };
}

module.exports = {
  buildEngineIntegrations,
  classifyConnectorProfile,
  getDomainIntegration,
  getEngineIntegration,
};
