'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-engine-domain-registry-v3.json'
);
const CATALOG_PATH = path.join(
  ROOT,
  'public/site-map/catalog.json'
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getConfig() {
  return readJson(CONFIG_PATH);
}

function getCatalog() {
  return readJson(CATALOG_PATH);
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function getProfile(domainId) {
  const config = getConfig();
  return config.domainProfiles[domainId] || config.domainProfiles.general;
}

function enrichPage(page) {
  const config = getConfig();
  const override = config.routeOverrides[page.route] || {};
  const logicalDomain = override.logicalDomain || page.domain || 'general';
  const profile = getProfile(logicalDomain);
  const primaryEngine = override.primaryEngine || profile.primaryEngine;
  const supportingEngines = unique([
    ...(profile.supportingEngines || []),
    ...(override.supportingEngines || []),
  ]);
  const policyEngines = unique(config.policyEngines || []);
  const integrationGateway =
    override.integrationGateway ||
    profile.integrationGateway ||
    'sheikha.integration';

  return {
    ...page,
    routeDomain: page.domain,
    logicalDomain,
    logicalDomainLabelAr: profile.labelAr || logicalDomain,
    engineProfile: override.engineProfile || `${logicalDomain}.core`,
    orchestrator: override.orchestrator || profile.orchestrator,
    primaryEngine,
    supportingEngines,
    policyEngines,
    integrationGateway,
    observability: 'required',
    engineBindingStatus:
      primaryEngine && profile.orchestrator ? 'BOUND' : 'REVIEW_REQUIRED',
  };
}

function buildRegistry() {
  const config = getConfig();
  const catalog = getCatalog();
  const pages = catalog.pages.map(enrichPage);
  const domains = Object.entries(config.domainProfiles).map(([id, profile]) => {
    const members = pages.filter((page) => page.logicalDomain === id);
    return {
      id,
      labelAr: profile.labelAr,
      orchestrator: profile.orchestrator,
      primaryEngine: profile.primaryEngine,
      supportingEngines: profile.supportingEngines || [],
      integrationGateway:
        profile.integrationGateway || 'sheikha.integration',
      pageCount: members.length,
      routes: members.map((page) => page.route),
    };
  });
  const allEngines = unique(
    pages.flatMap((page) => [
      page.primaryEngine,
      ...page.supportingEngines,
      ...page.policyEngines,
    ])
  );
  const unboundPages = pages.filter(
    (page) => page.engineBindingStatus !== 'BOUND'
  );

  return {
    schemaVersion: '3.0.0',
    system: config.system,
    status: config.status,
    mode: config.mode,
    generatedAt: new Date().toISOString(),
    source: {
      catalog: 'public/site-map/catalog.json',
      config: 'config/sheikha-engine-domain-registry-v3.json',
    },
    principles: config.principles,
    summary: {
      discoveredHtmlPages: catalog.summary.discoveredHtmlPages,
      publicPages: catalog.summary.publicPages,
      publicCanonicalPages: catalog.summary.publicCanonicalPages,
      pages: pages.length,
      logicalDomains: domains.filter((domain) => domain.pageCount > 0).length,
      engineReferences: allEngines.length,
      boundPages: pages.length - unboundPages.length,
      unboundPages: unboundPages.length,
      integrationGateway: 'sheikha.integration',
    },
    domains,
    pages,
  };
}

function getStatus() {
  const registry = buildRegistry();
  return {
    system: registry.system,
    status: registry.status,
    mode: registry.mode,
    generatedAt: registry.generatedAt,
    summary: registry.summary,
    principles: registry.principles,
  };
}

function listPages(input = {}) {
  const registry = buildRegistry();
  const domain = String(input.domain || '').trim();
  const engine = String(input.engine || '').trim();
  const search = String(input.search || '').trim().toLocaleLowerCase('ar');
  const requestedLimit = Number(input.limit || 200);
  const limit = Math.min(Math.max(requestedLimit || 200, 1), 200);

  const pages = registry.pages.filter((page) => {
    if (domain && page.logicalDomain !== domain) return false;
    if (
      engine &&
      page.primaryEngine !== engine &&
      !page.supportingEngines.includes(engine) &&
      !page.policyEngines.includes(engine)
    ) {
      return false;
    }
    if (!search) return true;
    const haystack = [
      page.title,
      page.h1 || '',
      page.route,
      page.logicalDomain,
      page.logicalDomainLabelAr,
      page.primaryEngine,
      ...page.supportingEngines,
      ...page.policyEngines,
    ]
      .join(' ')
      .toLocaleLowerCase('ar');
    return haystack.includes(search);
  });

  return {
    total: pages.length,
    limit,
    pages: pages.slice(0, limit),
  };
}

module.exports = {
  buildRegistry,
  enrichPage,
  getConfig,
  getProfile,
  getStatus,
  listPages,
};
