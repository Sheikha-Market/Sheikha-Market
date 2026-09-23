'use strict';

const http = require('node:http');
const { productCatalog } = require('./product-catalog-v1');
const { governanceScope } = require('./universal-governance-scope-v1');
const { eventFabric } = require('./governance-event-fabric-v1');
const { universalLifecycle } = require('./universal-lifecycle-engine-v1');
const { livingEnvironmentFabric } = require('./living-environment-fabric-v1');
const { releaseGates } = require('./release-gates-v1');
const { eightStageProgram } = require('./eight-stage-execution-program-v1');
const { sourceCatalog, sourceCatalogSummary } = require('./quran-sunnah-source-catalog-v1');
const { mappingReviewSchema } = require('./sharia-policy-mapping-review-v1');
const { semanticIntegrationContract } = require('./semantic-integration-contract-v1');

const HOST = process.env.SHEIKHA_FOUNDATION_HOST || '127.0.0.1';
const PORT = Number(process.env.SHEIKHA_FOUNDATION_PORT || 8097);

const routes = Object.freeze([
  "/health",
  "/api/foundation/status",
  "/api/governance/live/status",
  "/api/governance/objects",
  "/api/governance/objects/:id",
  "/api/governance/events",
  "/api/governance/policies",
  "/api/governance/policies/:id",
  "/api/governance/lifecycles",
  "/api/governance/environments",
  "/api/governance/evidence",
  "/api/governance/improvements",
  "/api/foundation/products",
  "/api/foundation/products/:id",
  "/api/foundation/customer-journey",
  "/api/foundation/assets",
  "/api/foundation/resources",
  "/api/foundation/data-sources",
  "/api/foundation/law-standards",
  "/api/foundation/markets",
  "/api/foundation/industry",
  "/api/foundation/agriculture",
  "/api/foundation/geography",
  "/api/foundation/space-earth-maritime-iot",
  "/api/foundation/science",
  "/api/foundation/resources/rarity",
  "/api/foundation/revelation/boundaries",
  "/api/foundation/dunya-akhirah",
  "/api/foundation/sunan-reference",
  "/api/foundation/program/stages",
  "/api/foundation/program/priorities",
  "/api/foundation/program/risks",
  "/api/foundation/commercial/revenue-target",
  "/api/foundation/operations/handover",
  "/api/foundation/release-gates",
  "/api/governance/sharia-sources",
  "/api/governance/integration/status"
]);

function bodyFor(pathname) {
  if (pathname === '/health') {
    return { ok: true, system: 'SHEIKHA_FOUNDATION_COMPUTING_PLATFORM_V1', mode: 'READ_ONLY_SIDECAR' };
  }
  if (pathname === '/api/foundation/status' || pathname === '/api/governance/live/status') {
    return {
      ok: true,
      livingMeaning: 'CONTINUOUSLY_ACTIVE_EVENT_DRIVEN_ADAPTIVE_EVIDENCE_GOVERNANCE',
      softwareLiteralLifeClaim: false,
      softwareConsciousnessClaim: false,
      productFamilyCount: productCatalog.count,
      governanceScopeCount: governanceScope.count,
      eventClassCount: eventFabric.count,
      lifecycleStageCount: universalLifecycle.count,
      environmentClassCount: livingEnvironmentFabric.count,
      releaseGateCount: releaseGates.count,
      programStageCount: eightStageProgram.count,
      sourceCatalogRecordCount: sourceCatalogSummary.recordCount,
      kernelRequiredDependencyCount: semanticIntegrationContract.kernelRequiredDependencies.length,
      quranPolicyMappingReviewGatePresent: semanticIntegrationContract.documentedPolicyMappingReviewRequired,
      decisionEvidencePlaceholderAllowed: semanticIntegrationContract.decisionEvidencePlaceholderAllowed,
    };
  }
  if (pathname === '/api/governance/sharia-sources') {
    return {
      summary: sourceCatalogSummary,
      policyMappingReview: {
        required: true,
        schemaFieldCount: mappingReviewSchema.fieldCount,
        approvedStatus: mappingReviewSchema.approvedStatus,
      },
      records: sourceCatalog,
    };
  }
  if (pathname === '/api/governance/integration/status') {
    return {
      ok: true,
      contract: semanticIntegrationContract.system,
      kernelRequiredDependencyCount: semanticIntegrationContract.kernelRequiredDependencies.length,
      quranPolicyMappingReviewGatePresent: semanticIntegrationContract.documentedPolicyMappingReviewRequired,
      decisionEvidencePlaceholderAllowed: semanticIntegrationContract.decisionEvidencePlaceholderAllowed,
      kernelFlowStepCount: semanticIntegrationContract.kernelFlow.length,
      noPolicyBypassAllowed: semanticIntegrationContract.noPolicyBypassAllowed,
      noDirectHighImpactExecutionAllowed: semanticIntegrationContract.noDirectHighImpactExecutionAllowed,
      documentedPolicyMappingReviewRequired: semanticIntegrationContract.documentedPolicyMappingReviewRequired,
      decisionEvidencePlaceholderAllowed: semanticIntegrationContract.decisionEvidencePlaceholderAllowed,
    };
  }
  if (pathname === '/api/foundation/products') return productCatalog;
  if (pathname === '/api/governance/events') return eventFabric;
  if (pathname === '/api/governance/lifecycles') return universalLifecycle;
  if (pathname === '/api/governance/environments') return livingEnvironmentFabric;
  if (pathname === '/api/foundation/program/stages') return eightStageProgram;
  if (pathname === '/api/foundation/release-gates') return releaseGates;
  return { ok: true, path: pathname, mode: 'READ_ONLY_CONTRACT_SURFACE' };
}

function createServer() {
  return http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'content-type': 'application/json; charset=utf-8', allow: 'GET, HEAD' });
      res.end(JSON.stringify({ ok: false, error: 'READ_ONLY_SURFACE' }));
      return;
    }

    const pathname = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`).pathname;
    const known = routes.some((route) => {
      if (!route.includes('/:')) return route === pathname;
      const prefix = route.split('/:')[0] + '/';
      return pathname.startsWith(prefix);
    });

    if (!known) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'NOT_FOUND' }));
      return;
    }

    const payload = JSON.stringify(bodyFor(pathname));
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(req.method === 'HEAD' ? '' : payload);
  });
}

if (require.main === module) {
  createServer().listen(PORT, HOST, () => {
    process.stdout.write(`SHEIKHA_FOUNDATION_READ_ONLY=${HOST}:${PORT}\n`);
  });
}

module.exports = { HOST, PORT, routes, createServer, bodyFor };
