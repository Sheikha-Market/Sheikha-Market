'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const REGISTRY_PATH = path.join(
  ROOT,
  'runtime/site/v2/sheikha-site-route-domain-registry-v2.json'
);
const PUBLIC_CATALOG_PATH = path.join(
  ROOT,
  'public/site-map/catalog.json'
);
const POLICY_PATH = path.join(
  ROOT,
  'config/sheikha-site-route-policy-v2.json'
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getPolicy() {
  return readJson(POLICY_PATH);
}

function getRegistry() {
  return readJson(REGISTRY_PATH);
}

function getPublicCatalog() {
  return readJson(PUBLIC_CATALOG_PATH);
}

function getStatus() {
  const registry = getRegistry();
  const catalog = getPublicCatalog();
  return {
    system: 'SHEIKHA_SITE_REGISTRY_RUNTIME_V2',
    status: 'ACTIVE',
    identity: registry.identity,
    counts: {
      discoveredHtmlPages: catalog.summary.discoveredHtmlPages,
      canonicalHtmlPages: catalog.summary.canonicalHtmlPages,
      duplicateGroups: catalog.summary.duplicateGroups,
      publicPages: catalog.summary.publicPages,
      publicCanonicalPages: catalog.summary.publicCanonicalPages,
      archivePages: catalog.summary.archivePages,
      protectedPages: catalog.summary.protectedPages,
      templatePages: catalog.summary.templatePages,
      publicPagesWithBrokenLocalReferences:
        catalog.summary.publicPagesWithBrokenLocalReferences,
      publicBrokenLocalReferenceCount:
        catalog.summary.publicBrokenLocalReferenceCount,
      publicPagesWithPlaceholderControls:
        catalog.summary.publicPagesWithPlaceholderControls,
      domains: catalog.domains.length,
      aliases: registry.aliasRoutes.length,
    },
    policies: registry.policies,
    generatedAt: registry.generatedAt,
  };
}

function listPublicPages(input = {}) {
  const catalog = getPublicCatalog();
  const domain = String(input.domain || '').trim();
  const search = String(input.search || '').trim().toLocaleLowerCase('ar');
  const requestedLimit = Number(input.limit || 200);
  const limit = Math.min(Math.max(requestedLimit || 200, 1), 200);
  const pages = catalog.pages.filter((page) => {
    if (domain && page.domain !== domain) return false;
    if (!search) return true;
    return `${page.title} ${page.h1 || ''} ${page.route}`
      .toLocaleLowerCase('ar')
      .includes(search);
  });
  return {
    total: pages.length,
    limit,
    pages: pages.slice(0, limit),
  };
}

function listDomains() {
  return getPublicCatalog().domains;
}

function resolvePublicRoute(routeValue) {
  const route = String(routeValue || '').trim();
  if (!route.startsWith('/')) {
    return { found: false, route, reason: 'ABSOLUTE_ROUTE_REQUIRED' };
  }
  const registry = getRegistry();
  const canonical = registry.canonicalRoutes.find((entry) =>
    entry.route === route && entry.visibility === 'PUBLIC'
  );
  if (canonical) {
    return {
      found: true,
      route,
      canonicalRoute: canonical.route,
      domain: canonical.domain,
      readiness: canonical.readiness,
      alias: false,
    };
  }
  const alias = registry.aliasRoutes.find((entry) => entry.route === route);
  if (alias) {
    const target = registry.canonicalRoutes.find((entry) =>
      entry.route === alias.canonicalRoute && entry.visibility === 'PUBLIC'
    );
    if (target) {
      return {
        found: true,
        route,
        canonicalRoute: target.route,
        domain: target.domain,
        readiness: target.readiness,
        alias: true,
      };
    }
  }
  return { found: false, route, reason: 'PUBLIC_ROUTE_NOT_REGISTERED' };
}

module.exports = {
  getPolicy,
  getPublicCatalog,
  getRegistry,
  getStatus,
  listDomains,
  listPublicPages,
  resolvePublicRoute,
};
