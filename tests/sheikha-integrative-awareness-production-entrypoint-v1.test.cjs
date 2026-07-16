'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');

const express = require('express');

const router = require(
  '../routes/integrative-awareness/sheikha-integrative-awareness-routes-v1'
);

const CONTRACT =
  'SHEIKHA_INTEGRATIVE_AWARENESS_HTTP_ADAPTER_V1';

async function withServer(callback) {
  const app = express();

  app.use(
    '/api/sheikha/integrative-awareness/v1',
    router
  );

  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const baseUrl =
    `http://127.0.0.1:${address.port}`;

  try {
    await callback(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close(error => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

test('server registers the integrative awareness route once', () => {
  const serverSource = fs.readFileSync(
    path.join(__dirname, '..', 'server.js'),
    'utf8'
  );

  const basePath =
    '/api/sheikha/integrative-awareness/v1';

  assert.equal(
    serverSource.split(basePath).length - 1,
    1
  );

  assert.match(
    serverSource,
    /routes\/integrative-awareness\/sheikha-integrative-awareness-routes-v1/
  );
});

test('status endpoint reports the active governed fabric', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(
      `${baseUrl}/api/sheikha/integrative-awareness/v1/status`
    );

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('x-sheikha-contract'),
      CONTRACT
    );
    assert.match(
      response.headers.get('cache-control') || '',
      /no-store/
    );
    assert.equal(
      response.headers.get('pragma'),
      'no-cache'
    );

    const payload = await response.json();

    assert.equal(
      payload.system,
      'SHEIKHA_INTEGRATIVE_AWARENESS_FABRIC_V1'
    );
    assert.equal(payload.status, 'ACTIVE');
    assert.equal(
      payload.executionCapabilityExposed,
      false
    );
    assert.equal(
      payload.externalMutationPerformed,
      false
    );
  });
});

test('verification endpoint reports a passed verification', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(
      `${baseUrl}/api/sheikha/integrative-awareness/v1/verify`
    );

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('x-sheikha-contract'),
      CONTRACT
    );

    const payload = await response.json();

    assert.equal(payload.passed, true);
    assert.equal(
      payload.system,
      'SHEIKHA_VERIFY_INTEGRATIVE_AWARENESS_FABRIC_V1'
    );
  });
});

test('write methods are denied without mutation', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(
      `${baseUrl}/api/sheikha/integrative-awareness/v1/status`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          mutate: true
        })
      }
    );

    assert.equal(response.status, 405);

    const payload = await response.json();

    assert.equal(
      payload.status,
      'METHOD_NOT_ALLOWED'
    );
    assert.deepEqual(
      payload.allowedMethods,
      ['GET', 'HEAD']
    );
    assert.equal(
      payload.externalMutationPerformed,
      false
    );
  });
});

test('unknown read routes return a governed 404', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(
      `${baseUrl}/api/sheikha/integrative-awareness/v1/unknown`
    );

    assert.equal(response.status, 404);
    assert.equal(
      response.headers.get('x-sheikha-contract'),
      CONTRACT
    );

    const payload = await response.json();

    assert.equal(payload.status, 'NOT_FOUND');
    assert.equal(
      payload.externalMutationPerformed,
      false
    );
  });
});
