'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PRIVATE_TRAINING_DIR = fs.mkdtempSync(
  path.join(os.tmpdir(), 'sheikha-private-training-')
);

process.env.SHEIKHA_PRIVATE_TRAINING_DIR =
  PRIVATE_TRAINING_DIR;

const {
  askWithFallback,
  providerAllowedByDisclosurePolicy
} = require('../core/providers/provider-registry');

const {
  buildExternalDisclosureResource,
  isTrustedExternalDisclosureDecision
} = require('../core/ai-gateway/sheikha-ai-gateway');

const selfTraining = require(
  '../core/ai-gateway/sheikha-core-self-training'
);

const continuousLearning = require(
  '../core/ai-gateway/sheikha-continuous-learning-runtime'
);

test.after(() => {
  fs.rmSync(PRIVATE_TRAINING_DIR, {
    recursive: true,
    force: true
  });
  delete process.env.SHEIKHA_PRIVATE_TRAINING_DIR;
});

test('blocks external providers without server-trusted disclosure', () => {
  assert.equal(
    providerAllowedByDisclosurePolicy(
      { external: true },
      {}
    ),
    false
  );
  assert.equal(
    providerAllowedByDisclosurePolicy(
      { external: false },
      {}
    ),
    true
  );
});

test('skips a configured external provider in the real fallback chain', async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = global.fetch;

  process.env.OPENAI_API_KEY = 'test-key-must-not-be-used';
  global.fetch = async (url) => {
    throw new Error(`UNAUTHORIZED_NETWORK_CALL:${url}`);
  };

  try {
    const result = await askWithFallback(
      {
        prompt: 'private test prompt',
        system: 'private test system'
      },
      'openai'
    );

    assert.equal(result.success, true);
    assert.equal(result._providerUsed, 'local');
    assert.ok(
      result._externalProvidersBlocked.includes('openai')
    );
  } finally {
    global.fetch = originalFetch;

    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
});

test('rejects incomplete external disclosure decisions', () => {
  const resource = buildExternalDisclosureResource(
    'private prompt'
  );

  assert.equal(
    isTrustedExternalDisclosureDecision({
      allowed: true,
      executionAuthorized: true,
      decision: 'ALLOW_EXACT_BOUNDED_ACTION'
    }, resource),
    false
  );
});

test('binds external disclosure to the exact prompt digest', () => {
  const resource = buildExternalDisclosureResource(
    'private prompt'
  );
  const decision = {
    allowed: true,
    executionAuthorized: true,
    decision: 'ALLOW_EXACT_BOUNDED_ACTION',
    action: 'DISCLOSE_EXTERNAL',
    resourceId: resource.resourceId,
    resourceSha256: resource.sha256,
    granteeId: 'EXTERNAL-PROVIDER-1',
    rightsHolderId: 'OWNER-1',
    purpose: 'ANSWER_ONE_PROMPT',
    expiresAt: '2099-01-01T00:00:00.000Z',
    noScopeExpansion: true
  };

  assert.equal(
    isTrustedExternalDisclosureDecision(
      decision,
      resource
    ),
    true
  );

  assert.equal(
    isTrustedExternalDisclosureDecision(
      decision,
      buildExternalDisclosureResource('different prompt')
    ),
    false
  );
});

test('does not write chat training data without separate authorization', () => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'sheikha-no-training-')
  );
  const queueFile = path.join(tempDir, 'queue.ndjson');

  try {
    const result = selfTraining.recordSelfTrainingSample(
      {
        prompt: 'معلومة خاصة',
        output: 'جواب خاص',
        source: 'test'
      },
      { queueFile }
    );

    assert.equal(result.success, false);
    assert.equal(
      result.status,
      'NO_TRAINING_CONFIDENTIAL_BY_DEFAULT'
    );
    assert.equal(result.stored, false);
    assert.equal(fs.existsSync(queueFile), false);
  } finally {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true
    });
  }
});

test('does not ingest continuous learning input without authorization', () => {
  const result = continuousLearning.ingestLearningEvent({
    source: 'chat',
    domain: 'private-customer-context',
    content: 'مدخل سري لا يجوز حفظه للتدريب'
  });

  assert.equal(result.success, false);
  assert.equal(result.stored, false);
  assert.equal(result.event, null);
  assert.equal(
    fs.existsSync(
      path.join(
        PRIVATE_TRAINING_DIR,
        'sheikha-continuous-learning.ndjson'
      )
    ),
    false
  );
});

test('stores only a synthetic sample with exact trusted training consent', () => {
  const input = {
    prompt: 'synthetic prompt',
    output: 'synthetic answer',
    source: 'synthetic-test',
    model: 'test-model',
    trainingGranteeId: 'TRAINER-1',
    rightsHolderId: 'OWNER-1',
    trainingPurpose: 'TRAIN_SYNTHETIC_TEST_SAMPLE'
  };
  const binding =
    selfTraining.buildTrainingResourceBinding(input);
  const authorizationSha256 = 'c'.repeat(64);
  const queueFile = path.join(
    PRIVATE_TRAINING_DIR,
    'authorized-test.ndjson'
  );

  input.trainingAuthorization = {
    type: 'SHEIKHA_SCOPED_WRITTEN_AUTHORIZATION_V1',
    authorizationId: 'AUTH-SYNTHETIC-1',
    rightsHolderId: 'OWNER-1',
    granteeId: 'TRAINER-1',
    purpose: 'TRAIN_SYNTHETIC_TEST_SAMPLE',
    allowedActions: ['TRAIN_AI'],
    resourceBindings: [
      {
        resourceId: binding.resourceId,
        sha256: binding.sha256
      }
    ],
    trainingOptIn: true,
    datasetId: 'SYNTHETIC-DATASET-1',
    datasetSha256: 'd'.repeat(64),
    piiAndSecretReviewStatus: 'PASSED',
    issuedAt: '2026-09-07T11:00:00.000Z',
    expiresAt: '2026-09-07T13:00:00.000Z',
    signed: true,
    signatureVerificationStatus: 'VERIFIED',
    authorizationSha256
  };

  const result = selfTraining.recordSelfTrainingSample(
    input,
    {
      now: new Date('2026-09-07T12:00:00.000Z'),
      queueFile,
      trustedAuthorizationVerification: true,
      verifiedAuthorizationSha256: authorizationSha256,
      verifiedRightsHolderId: 'OWNER-1'
    }
  );

  assert.equal(result.success, true);
  assert.equal(fs.existsSync(queueFile), true);
  assert.equal(fs.statSync(queueFile).mode & 0o777, 0o600);
});

test('keeps internal documents and legacy cloud model calls closed', () => {
  const serverSource = fs.readFileSync(
    path.join(__dirname, '..', 'server.js'),
    'utf8'
  );
  const aiRoutesSource = fs.readFileSync(
    path.join(__dirname, '..', 'routes', 'ai.js'),
    'utf8'
  );

  assert.equal(
    serverSource.includes(
      "app.use('/docs', express.static"
    ),
    false
  );
  assert.match(
    serverSource,
    /X-Sheikha-Data-Classification[\s\S]*?CONFIDENTIAL_RESTRICTED[\s\S]*?no-store, private, max-age=0/
  );
  assert.match(
    serverSource,
    /app\.use\('\/docs',[\s\S]*?error: 'NOT_FOUND'/
  );
  assert.match(
    serverSource,
    /async function callClaudeChat[\s\S]*?externalRequestPerformed: false[\s\S]*?async function callOpenAIChat/
  );
  assert.match(
    serverSource,
    /async function callOpenAIChat[\s\S]*?externalRequestPerformed: false[\s\S]*?async function callLocalSheikhaCoreChat/
  );
  assert.match(
    aiRoutesSource,
    /const PUBLIC_EXTERNAL_AI_DISCLOSURE_ALLOWED = false;/
  );
  assert.match(
    aiRoutesSource,
    /router\.post\('\/rag\/ingest'[\s\S]*?SIGNED_WRITTEN_AUTHORIZATION_REQUIRED[\s\S]*?stored: false/
  );
  assert.match(
    aiRoutesSource,
    /router\.post\('\/chat\/compact'[\s\S]*?retainedByServer: false/
  );
  assert.match(
    aiRoutesSource,
    /function requireTrustedInternalMutation[\s\S]*?VERIFIED_SIGNED_WRITTEN_AUTHORIZATION_REQUIRED/
  );
  assert.match(
    aiRoutesSource,
    /router\.post\('\/tools\/call'[\s\S]*?EXECUTE_AI_TOOL/
  );
});
