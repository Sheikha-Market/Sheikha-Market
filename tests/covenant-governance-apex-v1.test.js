'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-covenant-test-'));
process.env.SHEIKHA_COVENANT_GOVERNANCE_DATA_DIR = dataDir;

const covenant = require('../runtime/covenant-governance-apex/v1/covenant-governance-apex-v1');
const { governGovernance } = require('../runtime/governance/sheikha-governance-of-governance-v1');
const { createSheikhaApiClient } = require('../sdk/sheikha-api');
const { ALLOWED_SCOPES } = require('../runtime/security/api-keys/api-key-manager');

const reviewer = Object.freeze({
  actorId: 'covenant-test-reviewer',
  role: 'GOVERNANCE_REVIEWER',
  trusted: true,
  humanApproved: true
});

afterAll(() => {
  delete process.env.SHEIKHA_COVENANT_GOVERNANCE_DATA_DIR;
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('Sheikha Covenant Governance Apex V1', () => {
  test('is the highest internal governance layer with truthful boundaries', () => {
    const result = covenant.status();
    expect(result.system).toBe('SHEIKHA_COVENANT_GOVERNANCE_APEX_V1');
    expect(result.apexLevel).toBe(17);
    expect(result.governedStewardshipLayer).toBe('SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1');
    expect(result.boundaries.noAutomatedFatwa).toBe(true);
    expect(result.boundaries.noClaimOfDivineAuthority).toBe(true);
    expect(result.policyRegistry.policies).toHaveLength(6);
  });

  test('maps every numbered policy to registered references', () => {
    const registry = covenant.policyRegistry.status();
    const known = new Set(require(
      '../runtime/civilization-command-intelligence-plane/governance-reference-registry'
    ).REFERENCES.map(item => item.id));
    registry.policies.forEach(policy => {
      expect(policy.id).toMatch(/^SGA-\d{3}$/);
      policy.references.forEach(reference => expect(known.has(reference)).toBe(true));
    });
    expect(registry.boundaries.humanScholarlyReviewForReligiousInterpretation).toBe(true);
  });

  test('governance of governance uses the covenant evaluator', () => {
    const result = governGovernance({ actor: 'test', action: 'review', message: 'drop database' });
    expect(result.allowed).toBe(false);
    expect(result.covenant.engine).toBe('SHEIKHA_COVENANT_GOVERNANCE_EVALUATOR_V1');
    expect(result.covenant.status).toBe('BLOCKED');
  });

  test('holds high-impact actions for evidence review', () => {
    const result = governGovernance({
      actor: 'test',
      action: 'high-impact-change',
      message: 'review this governed change',
      highImpact: true
    });
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.allowed).toBe(false);
    expect(result.covenant.reviewReasons).toContain('EVIDENCE_REQUIRED');
  });

  test('rejects incomplete promotion and records a fully assured promotion', () => {
    expect(() => covenant.promoteLayer({ layer: 'INCOMPLETE_LAYER' }, reviewer))
      .toThrow('promotion checks failed');
    const promotion = covenant.promoteLayer({
      layer: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1',
      targetLevel: 16,
      testsPassed: true,
      lintPassed: true,
      noDrift: true,
      governancePassed: true,
      evidenceRefs: ['test-suite:89', 'drift:NO_DRIFT'],
      rollbackReady: true,
      authorityClaimsVerified: true
    }, reviewer);
    expect(promotion.decision).toBe('PROMOTED_UNDER_GOVERNANCE');
    expect(promotion.finalAuthority).toBe('HUMAN_RETAINED');
    expect(covenant.snapshot().promotions).toHaveLength(1);
  });

  test('integrates API, SDK, Inspector, activation, and scopes', async () => {
    const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const inspector = fs.readFileSync(
      path.join(root, 'core/enterprise/sheikha-enterprise-inspector-v3.js'), 'utf8'
    );
    const activation = fs.readFileSync(
      path.join(root, 'tools/activate-sheikha-covenant-governance-apex.sh'), 'utf8'
    );
    const requests = [];
    const client = createSheikhaApiClient({
      baseUrl: 'https://example.test',
      apiKey: 'skh_v2_test',
      humanApproved: true,
      fetchImpl: async (url, options) => {
        requests.push({ url, options });
        return { ok: true, status: 200, json: async () => ({ success: true, data: {} }) };
      }
    });
    await client.covenantGovernance.evaluate({ action: 'review' });
    expect(server).toContain("app.use(require('./routes/covenant-governance-apex-routes'));");
    expect(inspector).toContain('/api/sheikha/covenant-governance/v1/status');
    expect(activation).toContain('activate-sheikha-unified-apex-v1.sh');
    expect(ALLOWED_SCOPES).toContain('covenant:promote');
    expect(requests[0].url)
      .toBe('https://example.test/api/sheikha/covenant-governance/v1/evaluate');
  });
});
