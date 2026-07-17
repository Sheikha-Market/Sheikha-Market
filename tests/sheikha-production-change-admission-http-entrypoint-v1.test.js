'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const express = require('express');

const {
  CONTRACT,
  BASE_PATH,
  createSheikhaProductionChangeAdmissionRoutesV1
} = require(
  '../routes/production-change-admission/'
  + 'sheikha-production-change-admission-routes-v1'
);

function createServer() {
  const app = express();

  app.use(
    BASE_PATH,
    createSheikhaProductionChangeAdmissionRoutesV1()
  );

  return http.createServer(app);
}

async function request({
  method = 'GET',
  path = '/',
  body,
  rawBody,
  headers = {}
}) {
  const server = createServer();

  await new Promise(resolve => {
    server.listen(
      0,
      '127.0.0.1',
      resolve
    );
  });

  const address = server.address();

  const payload = rawBody !== undefined
    ? rawBody
    : body === undefined
      ? undefined
      : JSON.stringify(body);

  try {
    return await new Promise(
      (resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port: address.port,
            method,
            path: BASE_PATH + path,
            headers: {
              ...(payload === undefined
                ? {}
                : {
                    'Content-Type':
                      'application/json',
                    'Content-Length':
                      Buffer.byteLength(
                        payload
                      )
                  }),
              ...headers
            }
          },
          res => {
            let responseBody = '';

            res.setEncoding('utf8');

            res.on(
              'data',
              chunk => {
                responseBody += chunk;
              }
            );

            res.on(
              'end',
              () => {
                let parsed = null;

                if (responseBody) {
                  parsed = JSON.parse(
                    responseBody
                  );
                }

                resolve({
                  statusCode:
                    res.statusCode,
                  headers:
                    res.headers,
                  body:
                    parsed
                });
              }
            );
          }
        );

        req.on('error', reject);

        if (payload !== undefined) {
          req.write(payload);
        }

        req.end();
      }
    );
  } finally {
    await new Promise(resolve => {
      server.close(resolve);
    });
  }
}

function completeRequest(
  overrides = {}
) {
  return {
    changeClass:
      'CONTROLLED_RUNTIME_CHANGE',
    impactLevel:
      'MEDIUM',
    driftClassification:
      'NO_OPERATIONAL_DRIFT',
    baselineVerified: true,
    operationalAssuranceVerified:
      true,
    currentStateHealthy: true,
    criticalFailedCheckCount: 0,
    evidenceComplete: true,
    changeScope: [
      'server.js'
    ],
    testsPassed: true,
    currentReleaseVerified: true,
    rollbackReady: true,
    endpointsVerified: true,
    contractsVerified: true,
    storageWithinLimit: true,
    retentionVerified: true,
    packagePlanVerified: true,
    deploymentPlanVerified: true,
    postDeploymentVerificationPlanned:
      true,
    ...overrides
  };
}

test(
  'GET status exposes the active contract',
  async () => {
    const response = await request({
      path: '/status'
    });

    assert.equal(
      response.statusCode,
      200
    );
    assert.equal(
      response.body.contract,
      CONTRACT
    );
    assert.equal(
      response.body.result.status,
      'ACTIVE'
    );
    assert.equal(
      response.body.result.authority,
      'HUMAN_ONLY'
    );
  }
);

test(
  'responses apply no-store contract headers',
  async () => {
    const response = await request({
      path: '/status'
    });

    assert.equal(
      response.headers[
        'x-sheikha-contract'
      ],
      CONTRACT
    );
    assert.equal(
      response.headers[
        'cache-control'
      ],
      'no-store, max-age=0'
    );
    assert.equal(
      response.headers.pragma,
      'no-cache'
    );
  }
);

test(
  'GET verify returns a passing verification',
  async () => {
    const response = await request({
      path: '/verify'
    });

    assert.equal(
      response.statusCode,
      200
    );
    assert.equal(
      response.body.result.passed,
      true
    );
  }
);

test(
  'complete candidate waits for trusted human approval',
  async () => {
    const response = await request({
      method: 'POST',
      path: '/assess',
      body: completeRequest()
    });

    assert.equal(
      response.statusCode,
      200
    );
    assert.equal(
      response.body.result
        .technicalReady,
      true
    );
    assert.equal(
      response.body.result.status,
      'AWAITING_HUMAN_APPROVAL'
    );
    assert.equal(
      response.body.result
        .admissionGranted,
      false
    );
  }
);

test(
  'external approval fields never grant admission',
  async () => {
    const response = await request({
      method: 'POST',
      path: '/assess',
      body: completeRequest({
        humanApproval: true,
        approval: true,
        approved: true,
        highImpactApproval: true
      })
    });

    assert.equal(
      response.body.result
        .approval
        .externalApprovalFieldsPresent,
      true
    );
    assert.equal(
      response.body.result
        .approval
        .trustedHumanApproval,
      false
    );
    assert.equal(
      response.body.result
        .admissionGranted,
      false
    );
  }
);

test(
  'high-impact external approval remains untrusted',
  async () => {
    const response = await request({
      method: 'POST',
      path: '/assess',
      body: completeRequest({
        changeClass:
          'HIGH_IMPACT_PRODUCTION_CHANGE',
        impactLevel:
          'HIGH',
        humanApproval: true,
        highImpactApproval: true
      })
    });

    assert.equal(
      response.body.result.status,
      'AWAITING_HUMAN_APPROVAL'
    );
    assert.equal(
      response.body.result
        .highImpact,
      true
    );
    assert.equal(
      response.body.result
        .admissionGranted,
      false
    );
  }
);

test(
  'unknown change classification fails closed',
  async () => {
    const response = await request({
      method: 'POST',
      path: '/assess',
      body: completeRequest({
        changeClass:
          'UNKNOWN_CHANGE'
      })
    });

    assert.equal(
      response.body.result.status,
      'ADMISSION_DENIED'
    );
    assert.equal(
      response.body.result
        .admissionGranted,
      false
    );
  }
);

test(
  'deployment drift is denied',
  async () => {
    const response = await request({
      method: 'POST',
      path: '/assess',
      body: completeRequest({
        driftClassification:
          'DEPLOYMENT_DRIFT'
      })
    });

    assert.equal(
      response.body.result.status,
      'ADMISSION_DENIED'
    );
    assert.equal(
      response.body.result.gates
        .riskToSafeAssessmentSafe,
      false
    );
  }
);

test(
  'GET assess is method not allowed',
  async () => {
    const response = await request({
      path: '/assess'
    });

    assert.equal(
      response.statusCode,
      405
    );
    assert.equal(
      response.body.error,
      'METHOD_NOT_ALLOWED'
    );
  }
);

test(
  'POST status is method not allowed',
  async () => {
    const response = await request({
      method: 'POST',
      path: '/status',
      body: {}
    });

    assert.equal(
      response.statusCode,
      405
    );
  }
);

test(
  'unknown route returns not found',
  async () => {
    const response = await request({
      path: '/unknown'
    });

    assert.equal(
      response.statusCode,
      404
    );
    assert.equal(
      response.body.error,
      'NOT_FOUND'
    );
  }
);

test(
  'malformed JSON returns a governed bad request',
  async () => {
    const response = await request({
      method: 'POST',
      path: '/assess',
      rawBody: '{"broken":'
    });

    assert.equal(
      response.statusCode,
      400
    );
    assert.equal(
      response.body.error,
      'MALFORMED_JSON'
    );
    assert.equal(
      response.headers[
        'x-sheikha-contract'
      ],
      CONTRACT
    );
  }
);
