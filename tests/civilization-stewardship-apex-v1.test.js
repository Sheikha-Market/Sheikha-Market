'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const stewardshipData = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-stewardship-test-'));
const commandData = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-stewardship-command-test-'));
process.env.SHEIKHA_CIVILIZATION_STEWARDSHIP_DATA_DIR = stewardshipData;
process.env.SHEIKHA_CIVILIZATION_COMMAND_DATA_DIR = commandData;

const stewardship = require(
  '../runtime/civilization-stewardship-apex/v1/civilization-stewardship-apex-v1'
);
const commandPlane = require(
  '../runtime/civilization-command-intelligence-plane/civilization-command-intelligence-plane-v1'
);
const { createSheikhaApiClient } = require('../sdk/sheikha-api');
const { ALLOWED_SCOPES } = require('../runtime/security/api-keys/api-key-manager');

const owner = Object.freeze({
  actorId: 'stewardship-test-owner',
  role: 'OWNER',
  trusted: true,
  humanApproved: true,
  source: 'jest'
});

afterAll(() => {
  delete process.env.SHEIKHA_CIVILIZATION_STEWARDSHIP_DATA_DIR;
  delete process.env.SHEIKHA_CIVILIZATION_COMMAND_DATA_DIR;
  fs.rmSync(stewardshipData, { recursive: true, force: true });
  fs.rmSync(commandData, { recursive: true, force: true });
});

function mandateInput(overrides = {}) {
  return {
    title: 'Evidence-led industrial resilience mandate',
    purpose: 'Improve verified supply resilience without bypassing governance.',
    beneficiaries: ['industrial operators', 'local communities'],
    objectives: ['Reduce verified critical supply gaps'],
    successMeasures: ['verified-gap-count', 'audited-service-level'],
    principles: ['truth', 'justice', 'no_harm'],
    risks: [{
      description: 'Unverified supplier capacity',
      level: 'HIGH',
      mitigation: 'Independent capacity verification before contracting'
    }],
    ...overrides
  };
}

describe('Sheikha Civilization Stewardship Apex V1', () => {
  test('is the highest institutional layer without overriding governance', () => {
    const result = stewardship.status();

    expect(result.system).toBe('SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1');
    expect(result.apexLevel).toBe(16);
    expect(result.governanceAuthority).toBe('SHEIKHA_CIVILIZATION_GOVERNANCE_V2');
    expect(result.boundaries.cannotOverrideGovernance).toBe(true);
    expect(result.boundaries.noAutonomousRatification).toBe(true);
    expect(result.boundaries.noReligiousAuthorityClaim).toBe(true);
  });

  test('requires explicit human approval for every mutation', () => {
    expect(() => stewardship.registerMandate(
      mandateInput(),
      { ...owner, humanApproved: false }
    )).toThrow('explicit human approval');
  });

  test('blocks ratification until evidence and risk readiness pass', () => {
    const mandate = stewardship.registerMandate(mandateInput({
      risks: [{
        description: 'Critical unresolved dependency',
        level: 'CRITICAL'
      }]
    }), owner);
    stewardship.attachEvidence(mandate.id, {
      source: 'owner-declared-record',
      summary: 'A source-declared record pending independent verification.'
    }, owner);
    const review = stewardship.reviewMandate(mandate.id, owner);

    expect(review.status).toBe('REQUIRES_REMEDIATION');
    expect(review.checks.evidenceLinked).toBe(true);
    expect(review.checks.independentlyVerifiedEvidenceLinked).toBe(false);
    expect(review.checks.highRisksMitigated).toBe(false);
    expect(() => stewardship.ratifyAndDelegate(
      mandate.id,
      { decision: 'APPROVE' },
      owner
    )).toThrow('must pass evidence and risk review');
  });

  test('ratifies a reviewed mandate and delegates a governed plan without executing it', () => {
    const mandate = stewardship.registerMandate(mandateInput(), owner);
    const evidence = stewardship.attachEvidence(mandate.id, {
      source: 'independent-test-evidence',
      summary: 'Verified baseline and capacity evidence.',
      independentlyVerified: true
    }, owner);
    const review = stewardship.reviewMandate(mandate.id, owner);
    const delegation = stewardship.ratifyAndDelegate(
      mandate.id,
      { decision: 'APPROVE', initiatives: ['verify suppliers'] },
      owner
    );
    const delegatedPlan = commandPlane.snapshot().plans.find(
      item => item.id === delegation.delegatedPlanId
    );

    expect(evidence.verification).toBe('HUMAN_VERIFIED_SOURCE');
    expect(review.status).toBe('READY_FOR_HUMAN_RATIFICATION');
    expect(review.verifiedEvidenceCount).toBe(1);
    expect(delegation.executionAuthorized).toBe(false);
    expect(delegatedPlan.status).toBe('DRAFT_GOVERNED');
    expect(stewardship.snapshot().mandates.find(item => item.id === mandate.id).status)
      .toBe('RATIFIED_AND_DELEGATED');
  });

  test('integrates API, SDK, Inspector, activation, and reports', async () => {
    const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const inspector = fs.readFileSync(
      path.join(root, 'core/enterprise/sheikha-enterprise-inspector-v3.js'),
      'utf8'
    );
    const activation = fs.readFileSync(
      path.join(root, 'tools/activate-sheikha-civilization-stewardship-apex.sh'),
      'utf8'
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

    await client.civilizationStewardship.registerMandate(mandateInput());

    expect(server).toContain("app.use(require('./routes/civilization-stewardship-apex-routes'));");
    expect(inspector).toContain('/api/sheikha/civilization-stewardship/v1/status');
    expect(activation).toContain('activate-sheikha-unified-apex-v1.sh');
    expect(ALLOWED_SCOPES).toContain('stewardship:ratify');
    expect(requests[0].url)
      .toBe('https://example.test/api/sheikha/civilization-stewardship/v1/mandates');
  });
});
