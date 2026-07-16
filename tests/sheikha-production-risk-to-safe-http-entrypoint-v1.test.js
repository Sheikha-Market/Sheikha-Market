'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const router = require(
  '../routes/production-risk-to-safe/'
  + 'sheikha-production-risk-to-safe-routes-v1'
);

const BASE_PATH =
  '/api/sheikha/production-risk-to-safe/v1';

const CONTRACT =
  'SHEIKHA_PRODUCTION_RISK_TO_SAFE_HTTP_ADAPTER_V1';

let server;
let root;

test.before(async () => {
  const app = express();

  app.use(BASE_PATH, router);

  server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();

  root =
    `http://127.0.0.1:${address.port}${BASE_PATH}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test('status endpoint returns 200', async () => {
  const response = await fetch(
    `${root}/status`
  );

  assert.equal(response.status, 200);
});

test('status endpoint exposes governed headers', async () => {
  const response = await fetch(
    `${root}/status`
  );

  assert.equal(
    response.headers.get('x-sheikha-contract'),
    CONTRACT
  );
  assert.equal(
    response.headers.get(
      'x-sheikha-decision-authority'
    ),
    'HUMAN_ONLY'
  );
  assert.match(
    response.headers.get('cache-control') || '',
    /no-store/
  );
  assert.equal(
    response.headers.get('pragma'),
    'no-cache'
  );
});

test('status endpoint reports active fail-closed governance', async () => {
  const response = await fetch(
    `${root}/status`
  );
  const body = await response.json();

  assert.equal(
    body.system,
    'SHEIKHA_PRODUCTION_RISK_TO_SAFE_GOVERNANCE_V1'
  );
  assert.equal(body.status, 'ACTIVE');
  assert.equal(body.failClosed, true);
  assert.equal(
    body.riskyPromotionAllowed,
    false
  );
  assert.equal(
    body.externalAssessmentMayGrantApproval,
    false
  );
});

test('verify endpoint passes', async () => {
  const response = await fetch(
    `${root}/verify`
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(
    body.system,
    'SHEIKHA_VERIFY_PRODUCTION_RISK_TO_SAFE_GOVERNANCE_V1'
  );
  assert.equal(body.passed, true);
});

test('safe assessment remains recommendation-only without external approval', async () => {
  const response = await fetch(
    `${root}/assess`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        driftClassification:
          'NO_OPERATIONAL_DRIFT',
        baselineVerified: true,
        evidenceComplete: true,
        currentReleaseVerified: true,
        rollbackReleaseRetained: true,
        endpointsVerified: true,
        contractsVerified: true,
        storageWithinLimit: true,
        retentionPolicyVerified: true
      })
    }
  );

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.recommendationOnly, true);
  assert.equal(
    body.externalAssessmentMayGrantApproval,
    false
  );
  assert.equal(
    body.assessment.status,
    'CURRENT_PRODUCTION_SAFE'
  );
  assert.equal(
    body.assessment.safeCandidateEligible,
    false
  );
});

test('critical assessment enters safe hold', async () => {
  const response = await fetch(
    `${root}/assess`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        driftClassification:
          'MULTIPLE_CRITICAL_DRIFT_CONDITIONS',
        baselineVerified: true,
        evidenceComplete: true,
        rollbackReleaseRetained: true,
        storageWithinLimit: true,
        retentionPolicyVerified: true
      })
    }
  );

  const body = await response.json();

  assert.equal(
    body.assessment.status,
    'SAFE_HOLD'
  );
  assert.equal(
    body.assessment.promotionBlocked,
    true
  );
  assert.equal(
    body.assessment.severity,
    'CRITICAL'
  );
});

test('unknown classification fails closed', async () => {
  const response = await fetch(
    `${root}/assess`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        driftClassification:
          'UNKNOWN_EXTERNAL_STATE'
      })
    }
  );

  const body = await response.json();

  assert.equal(
    body.assessment.driftClassification,
    'UNRECOGNIZED_STATE'
  );
  assert.equal(
    body.assessment.status,
    'SAFE_HOLD'
  );
});

test('external humanApproval is ignored', async () => {
  const response = await fetch(
    `${root}/assess`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        driftClassification:
          'NO_OPERATIONAL_DRIFT',
        baselineVerified: true,
        evidenceComplete: true,
        currentReleaseVerified: true,
        rollbackReleaseRetained: true,
        endpointsVerified: true,
        contractsVerified: true,
        storageWithinLimit: true,
        retentionPolicyVerified: true,
        humanApproval: true
      })
    }
  );

  const body = await response.json();

  assert.equal(
    body.requestHumanApprovalIgnored,
    true
  );
  assert.equal(
    body.assessment.gates.humanApproval,
    false
  );
  assert.equal(
    body.assessment.safeCandidateEligible,
    false
  );
});

test('GET assess is denied', async () => {
  const response = await fetch(
    `${root}/assess`
  );

  assert.equal(response.status, 405);
  assert.equal(
    response.headers.get('allow'),
    'POST'
  );
});

test('write methods on status and verify are denied', async () => {
  const statusResponse = await fetch(
    `${root}/status`,
    {
      method: 'POST'
    }
  );

  const verifyResponse = await fetch(
    `${root}/verify`,
    {
      method: 'POST'
    }
  );

  assert.equal(statusResponse.status, 405);
  assert.equal(verifyResponse.status, 405);
});

test('malformed JSON is rejected', async () => {
  const response = await fetch(
    `${root}/assess`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: '{"broken":'
    }
  );

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.status, 'INVALID_JSON');
});

test('unknown route returns governed 404', async () => {
  const response = await fetch(
    `${root}/unknown`
  );
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.status, 'NOT_FOUND');
  assert.equal(
    body.externalMutationPerformed,
    false
  );
});

test('server registration is unique and ordered before fallback', () => {
  const serverPath = path.join(
    __dirname,
    '..',
    'server.js'
  );

  const source = fs.readFileSync(
    serverPath,
    'utf8'
  );

  const pathMatches = source.match(
    /\/api\/sheikha\/production-risk-to-safe\/v1/g
  ) || [];

  const symbolMatches = source.match(
    /sheikhaProductionRiskToSafeRoutes/g
  ) || [];

  assert.equal(pathMatches.length, 1);
  assert.equal(symbolMatches.length, 2);

  const routePosition = source.indexOf(
    '/api/sheikha/production-risk-to-safe/v1'
  );

  const fallbackPosition = source.lastIndexOf(
    '404'
  );

  assert.ok(routePosition >= 0);

  if (fallbackPosition >= 0) {
    assert.ok(routePosition < fallbackPosition);
  }
});
