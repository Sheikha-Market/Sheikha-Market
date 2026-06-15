'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-layer-governance-test-'));
const covenantDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-layer-covenant-test-'));
process.env.SHEIKHA_LAYER_GOVERNANCE_DATA_DIR = dataDir;
process.env.SHEIKHA_COVENANT_GOVERNANCE_DATA_DIR = covenantDir;

const engine = require(
  '../runtime/layer-governance-promotion-os/v1/layer-governance-promotion-os-v1'
);
const { createSheikhaApiClient } = require('../sdk/sheikha-api');
const { ALLOWED_SCOPES } = require('../runtime/security/api-keys/api-key-manager');

const reviewer = {
  actorId: 'layer-governance-reviewer',
  role: 'GOVERNANCE_REVIEWER',
  trusted: true,
  humanApproved: true
};

const assured = {
  layer: 'SHEIKHA_RUNTIME_FABRIC_V5',
  targetLevel: 18,
  testsPassed: true,
  lintPassed: true,
  noDrift: true,
  governancePassed: true,
  evidenceRefs: ['tests:passed', 'drift:NO_DRIFT'],
  rollbackReady: true,
  authorityClaimsVerified: true
};

afterAll(() => {
  delete process.env.SHEIKHA_LAYER_GOVERNANCE_DATA_DIR;
  delete process.env.SHEIKHA_COVENANT_GOVERNANCE_DATA_DIR;
  fs.rmSync(dataDir, { recursive: true, force: true });
  fs.rmSync(covenantDir, { recursive: true, force: true });
});

describe('Sheikha Layer Governance and Promotion OS V1', () => {
  test('indexes canonical layers, Fabric routes, and governed intelligence contracts', () => {
    const status = engine.status();
    const catalog = engine.registry.snapshot();
    expect(status.apexLevel).toBe(18);
    expect(status.governanceAuthority).toBe('SHEIKHA_COVENANT_GOVERNANCE_APEX_V1');
    expect(catalog.layerCount).toBeGreaterThanOrEqual(10);
    expect(catalog.fabric.routeCount).toBeGreaterThanOrEqual(80);
    expect(catalog.layers.every(layer => layer.properties.selfPromotionAllowed === false)).toBe(true);
  });

  test('keeps AGI and ASI truthful research-only classifications', () => {
    const contracts = engine.registry.snapshot().intelligence.contracts;
    ['AGI', 'ASI'].forEach(name => {
      const contract = contracts.find(item => item.name === name);
      expect(contract.researchOnly).toBe(true);
      expect(contract.actualReached).toBe(false);
      expect(contract.operational).toBe(false);
    });
  });

  test('automatic assessment advises but never promotes', () => {
    const result = engine.assessLayer({ layer: 'SHEIKHA_RUNTIME_FABRIC_V5' });
    expect(result.decision).toBe('REMEDIATION_REQUIRED');
    expect(result.automaticPromotionPerformed).toBe(false);
    expect(result.humanFinalAuthority).toBe(true);
    expect(engine.snapshot().promotions).toHaveLength(0);
  });

  test('ratifies a fully assured proposal through Covenant Governance', () => {
    const proposal = engine.createPromotionProposal(assured, reviewer);
    expect(proposal.status).toBe('AWAITING_HUMAN_RATIFICATION');
    const result = engine.ratifyPromotion(proposal.id, reviewer);
    expect(result.promotion.decision).toBe('PROMOTED_UNDER_GOVERNANCE');
    expect(result.promotion.finalAuthority).toBe('HUMAN_RETAINED');
  });

  test('integrates API, SDK, Inspector, activation, and scopes', async () => {
    const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const inspector = fs.readFileSync(
      path.join(root, 'core/enterprise/sheikha-enterprise-inspector-v3.js'), 'utf8'
    );
    const activation = fs.readFileSync(
      path.join(root, 'tools/activate-sheikha-layer-governance-promotion-os.sh'), 'utf8'
    );
    const unifiedActivation = fs.readFileSync(
      path.join(root, 'tools/activate-sheikha-unified-apex-v1.sh'), 'utf8'
    );
    const verification = fs.readFileSync(
      path.join(root, 'tools/verify-sheikha-unified-apex-v1.sh'), 'utf8'
    );
    const requests = [];
    const client = createSheikhaApiClient({
      baseUrl: 'https://example.test',
      apiKey: 'skh_v2_test',
      fetchImpl: async (url, options) => {
        requests.push({ url, options });
        return { ok: true, status: 200, json: async () => ({ success: true, data: {} }) };
      }
    });
    await client.layerGovernance.catalog();
    expect(server).toContain("app.use(require('./routes/layer-governance-promotion-os-routes'));");
    expect(inspector).toContain('/api/sheikha/layer-governance/v1/status');
    expect(activation).toContain('activate-sheikha-unified-apex-v1.sh');
    expect(unifiedActivation).toContain('/api/sheikha/layer-governance/v1/status');
    expect(verification).toContain('layer-governance-promotion-os-v1.js');
    expect(ALLOWED_SCOPES).toContain('layers:promote');
    expect(requests[0].url).toBe('https://example.test/api/sheikha/layer-governance/v1/catalog');
  });
});
