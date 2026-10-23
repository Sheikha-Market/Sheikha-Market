'use strict';

const http = require('http');
const { URL } = require('url');
const { MODELS } = require('./products-v1');
const { diagnoseRarity, RESOURCE_POLICY, RARITY_LEVELS } = require('./resource-governance-v1');
const tpm = require('./tpm-governance-v1');
const {
  buildRuntimeApexStatus,
} = require('../sheikha-studio/core/sheikha-runtime-apex-v2');
const { buildCommercialPortfolioReadiness } = require('../sheikha-studio/core/sheikha-commercial-portfolio-readiness-v2');
const {
  evaluateNonLivingDrawingRequest,
  planGovernedVisualScene,
} = require('../sheikha-studio/core/sheikha-visual-intelligence-fabric-v1');
const {
  buildDrawingMotionV2BridgeStatus,
  buildPossibilityPlan,
} = require('../sheikha-studio/core/sheikha-visual-fabric-v2-bridge');
const {
  buildRealityTwin,
  buildSheikha360Status,
} = require('../sheikha-studio/core/sheikha-360-reality-bridge-v1');
const {
  buildCommercialOperatingStatus,
  buildFeasibilityScenario,
  evaluateExperiment,
} = require('../sheikha-studio/core/sheikha-commercial-operating-system-v1');

const HOST = process.env.SHEIKHA_APEX_HOST || '127.0.0.1';
const PORT = Number(process.env.SHEIKHA_APEX_PORT || 8092);

const AUDIT_SNAPSHOT = Object.freeze({
  sourceAuditReportSha256: '09daacd1e2629039d41fbb622ce366a43366799686bead66a6509d7d3e8f4789',
  sourceAuditEvidenceRoot: '/home/sheikha/Projects/sheikha/validation-execution/sheikha-runtime-apex-convergence-audit-20260902T041359Z',
  targetPresentCount: 7,
  targetMissingCount: 0,
  targetNodeCheckOkCount: 7,
  targetNodeCheckFailCount: 0,
  pm2ProcessCountObserved: 12,
  studioHttpObserved: 200,
  prometheusHttpObserved: 200,
  grafanaHttpObserved: 200,
  trustToolFoundCount: 11,
  trustToolMissingCount: 3,
  diskSpaceGateObserved: 'PASS'
});

function json(res, code, body) {
  const data = Buffer.from(JSON.stringify(body, null, 2) + '\n');
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': data.length,
    'cache-control': 'no-store'
  });
  res.end(data);
}

function probe(url, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = http.request({
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      timeout: timeoutMs
    }, (r) => {
      r.resume();
      resolve({ url, reachable: true, statusCode: r.statusCode });
    });
    req.on('timeout', () => { req.destroy(); resolve({ url, reachable: false, error: 'TIMEOUT' }); });
    req.on('error', (e) => resolve({ url, reachable: false, error: e.code || e.message }));
    req.end();
  });
}

async function liveLocalReadiness() {
  const [studio, prometheus, grafana] = await Promise.all([
    probe('http://127.0.0.1:8091/ide/'),
    probe('http://127.0.0.1:9090/-/ready'),
    probe('http://127.0.0.1:3000/api/health')
  ]);
  return { studio, prometheus, grafana, externalNetworkUsed: false };
}

const server = http.createServer(async (req, res) => {
  let u;
  try { u = new URL(req.url, `http://${HOST}:${PORT}`); }
  catch { return json(res, 400, { error: 'BAD_URL' }); }

  if (req.method !== 'GET') return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });

  if (u.pathname === '/health') {
    const apex = buildRuntimeApexStatus();
    return json(res, 200, {
      system: 'SHEIKHA_RUNTIME_APEX_V2',
      status: 'OK',
      host: HOST,
      port: PORT,
      productCount: apex.productCount,
      deviceIdentityBindingVerified: apex.tpm.deviceIdentityBindingVerified,
    });
  }

  if (u.pathname === '/api/apex/status' || u.pathname === '/api/apex/v2/status') {
    const apex = buildRuntimeApexStatus();
    return json(res, 200, {
      ...apex,
      models: MODELS.length,
      audit: AUDIT_SNAPSHOT,
      resourcePolicy: RESOURCE_POLICY,
      compatibility: {legacyV1RoutesPreserved: true, authoritativeRuntime: 'SHEIKHA_RUNTIME_APEX_V2'},
    });
  }

  if (u.pathname === '/api/apex/products' || u.pathname === '/api/apex/v2/products') {
    const apex = buildRuntimeApexStatus();
    return json(res, 200, { count: apex.productCount, products: apex.products });
  }
  if (u.pathname === '/api/apex/trust-state' || u.pathname === '/api/apex/v2/trust-state') {
    const apex = buildRuntimeApexStatus();
    const activation = apex.tpm.activateCredentialV2;
    const quoteContract = apex.tpm.quoteAttestationContractV2;
    const v3 = apex.tpm.v3;
    return json(res, 200, {
      system: 'SHEIKHA_RUNTIME_APEX_V2_DYNAMIC_TRUST_STATE',
      status: v3?.currentGenerationReadyForAuthorization === true
        ? 'V3_DEVICE_IDENTITY_OBSERVED_ACTIVATION_AUTHORIZATION_PENDING'
        : 'PLATFORM_TRUST_EVIDENCE_INCOMPLETE',
      source: 'CONTENT_ADDRESSED_LOCAL_EVIDENCE',
      productCount: apex.productCount,
      deviceIdentity: {
        activateCredentialVerified: activation?.verified === true,
        activationResultSha256: activation?.resultSha256 || null,
        activationAuthorizationReusable: false,
      },
      quoteAttestation: {
        contractPrepared: quoteContract?.present === true && quoteContract?.contractDigestValid === true,
        contractSha256: quoteContract?.contractSha256 || null,
        authorizationGranted: false,
        maximumQuoteCalls: quoteContract?.maximumQuoteCalls || 0,
        compatibleWithCurrentGeneration: false,
        incompatibilityReason: 'V2_QUOTE_CONTRACT_BOUND_TO_PREVIOUS_AK_GENERATION',
      },
      currentDeviceIdentityV3: {
        observationVerified: v3?.observation?.verified === true,
        observationSha256: v3?.observation?.reportSha256 || null,
        authorizationReviewVerified: v3?.authorizationReview?.verified === true,
        authorizationReviewSha256: v3?.authorizationReview?.reportSha256 || null,
        activateCredentialExecuted: false,
        physicalExecutionAuthorized: false,
      },
      firmware: apex.firmware,
      nextStage: apex.tpm.nextStage,
      boundaries: {
        tpmAccessedByStatusRead: false,
        firmwareOrSecureBootModified: false,
        consumedAuthorizationReusable: false,
      },
    });
  }
  if (u.pathname === '/api/apex/commercial-readiness' || u.pathname === '/api/apex/v2/commercial-readiness') {
    return json(res, 200, buildCommercialPortfolioReadiness());
  }
  if (u.pathname === '/api/apex/visual-intelligence' || u.pathname === '/api/apex/v2/visual-intelligence') {
    return json(res, 200, buildRuntimeApexStatus().visualIntelligence);
  }
  if (u.pathname === '/api/apex/visual-intelligence/review' || u.pathname === '/api/apex/v2/visual-intelligence/review') {
    const review = evaluateNonLivingDrawingRequest({ subject: u.searchParams.get('subject') || '' });
    return json(res, review.allowed ? 200 : 422, review);
  }
  if (u.pathname === '/api/apex/visual-fabric/plan' || u.pathname === '/api/apex/v2/visual-fabric/plan') {
    const plan = planGovernedVisualScene({
      subject: u.searchParams.get('subject') || '',
      dimension: u.searchParams.get('dimension') || '3D',
    });
    return json(res, plan.status === 'PLAN_ADMITTED_NOT_RENDERED' ? 200 : 422, plan);
  }
  if (u.pathname === '/api/apex/visual-fabric/v2' || u.pathname === '/api/apex/v2/visual-fabric/v2') {
    return json(res, 200, buildDrawingMotionV2BridgeStatus());
  }
  if (u.pathname === '/api/apex/possibility/plan' || u.pathname === '/api/apex/v2/possibility/plan') {
    const plan = buildPossibilityPlan({
      goal: u.searchParams.get('goal') || '',
      beneficiary: u.searchParams.get('beneficiary') || '',
      measurableOutcome: u.searchParams.get('measure') || '',
      constraints: u.searchParams.get('constraints') || '',
    });
    return json(res, plan.status === 'BOUNDED_PLAN_READY' ? 200 : 422, plan);
  }
  if (u.pathname === '/api/apex/sheikha-360/status' || u.pathname === '/api/apex/v2/sheikha-360/status') {
    return json(res, 200, buildSheikha360Status());
  }
  if (u.pathname === '/api/apex/sheikha-360/plan' || u.pathname === '/api/apex/v2/sheikha-360/plan') {
    const plan = buildRealityTwin({
      name: u.searchParams.get('name') || '',
      environment: u.searchParams.get('environment') || '',
      purpose: u.searchParams.get('purpose') || '',
      expectedObservationCount: u.searchParams.get('expectedObservationCount'),
      assessedAt: u.searchParams.get('assessedAt') || '',
      observations: [{
        metric: u.searchParams.get('metric') || '',
        value: u.searchParams.get('value'),
        unit: u.searchParams.get('unit') || '',
        source: u.searchParams.get('source') || '',
        observedAt: u.searchParams.get('observedAt') || '',
        uncertainty: u.searchParams.get('uncertainty'),
        calibrated: u.searchParams.get('calibrated') === 'true',
      }],
    });
    return json(res, plan.status === 'REALITY_TWIN_PLAN_READY_NOT_CONNECTED' ? 200 : 422, plan);
  }
  if (u.pathname === '/api/apex/commercial-os/status' || u.pathname === '/api/apex/v2/commercial-os/status') {
    return json(res, 200, buildCommercialOperatingStatus());
  }
  if (u.pathname === '/api/apex/commercial-os/feasibility') {
    const result = buildFeasibilityScenario({
      offerId: u.searchParams.get('offerId') || '',
      customers: u.searchParams.get('customers'),
      variableCostPerCustomerSar: u.searchParams.get('variableCostPerCustomerSar'),
      monthlyFixedCostSar: u.searchParams.get('monthlyFixedCostSar'),
      vatRate: u.searchParams.get('vatRate') ?? 0.15,
    });
    return json(res, result.status === 'FIXED_PRICE_OFFER_REQUIRED' ? 422 : 200, result);
  }
  if (u.pathname === '/api/apex/commercial-os/experiment') {
    const result = evaluateExperiment({
      baseline: u.searchParams.get('baseline'),
      candidate: u.searchParams.get('candidate'),
      direction: u.searchParams.get('direction') || 'HIGHER_IS_BETTER',
      minimumImprovementPercent: u.searchParams.get('minimumImprovementPercent'),
      sampleSize: u.searchParams.get('sampleSize'),
      regressions: u.searchParams.get('regressions'),
    });
    return json(res, result.status === 'EXPERIMENT_EVIDENCE_REQUIRED' ? 422 : 200, result);
  }
  if (u.pathname === '/api/apex/drawing-fabric-r4') { const b=await require('./drawing-possibility-bridge-r4').status(); return json(res,200,{system:'SHEIKHA_APEX_DRAWING_R4',drawing:b.drawing}); }
  if (u.pathname === '/api/apex/possibility-fabric-r4') { const b=await require('./drawing-possibility-bridge-r4').status(); return json(res,200,{system:'SHEIKHA_APEX_POSSIBILITY_R4',possibility:b.possibility}); }
  if (u.pathname === '/api/apex/tpm-v3-review-r4') { const fs=require('fs'); const r=JSON.parse(fs.readFileSync('/home/sheikha/Projects/sheikha/validation-execution/sheikha-ecc-ek-ak-create-20260901T191710Z/makecredential-v3-new-ak-20260902T045936Z/evidence/activatecredential-v3-single-capture-authorization-review/authorization-review.json','utf8')); return json(res,200,{system:'SHEIKHA_APEX_TPM_V3_REVIEW_R4',state:r.status,physicalExecutionAuthorized:r.boundaries?.physicalExecutionAuthorized===true,singleCaptureAuthorizationIssued:r.boundaries?.singleCaptureAuthorizationIssued===true,maximumActivateCredentialCalls:r.singleCapture?.maximumActivateCredentialCalls,nextStage:r.nextRequiredStage,tpmAccessedByStatusRead:false}); }
  if (u.pathname === '/api/apex/models') return json(res, 200, { count: MODELS.length, models: MODELS });
  if (u.pathname === '/api/apex/firmware' || u.pathname === '/api/apex/v2/firmware') {
    return json(res, 200, buildRuntimeApexStatus().firmware);
  }
  if (u.pathname === '/api/apex/tpm' || u.pathname === '/api/apex/v2/tpm') {
    return json(res, 200, buildRuntimeApexStatus().tpm);
  }
  if (u.pathname === '/api/apex/resource-policy') {
    return json(res, 200, { rarityLevels: RARITY_LEVELS, policy: RESOURCE_POLICY });
  }
  if (u.pathname === '/api/apex/local-readiness') return json(res, 200, await liveLocalReadiness());

  if (u.pathname === '/api/apex/rarity') {
    const fields = ['availability', 'alternatives', 'supplierConcentration', 'criticality', 'renewalDifficulty'];
    const input = {};
    for (const f of fields) {
      if (!u.searchParams.has(f)) return json(res, 400, { error: `MISSING_${f}` });
      input[f] = Number(u.searchParams.get(f));
    }
    try { return json(res, 200, diagnoseRarity(input)); }
    catch (e) { return json(res, 400, { error: 'INVALID_RARITY_INPUT', message: e.message }); }
  }

  if (u.pathname === '/api/apex/tpm/command-classification') {
    return json(res, 200, tpm.classifyCommand(u.searchParams.get('command') || ''));
  }

  return json(res, 404, { error: 'NOT_FOUND' });
});

server.on('error', (err) => {
  console.error(`SHEIKHA_RUNTIME_APEX_SERVER_ERROR=${err.code || err.message}`);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log('SHEIKHA_RUNTIME_APEX_V2_READY=true');
  console.log(`SHEIKHA_RUNTIME_APEX_BIND=${HOST}:${PORT}`);
});
