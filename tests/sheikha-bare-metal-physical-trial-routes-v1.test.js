'use strict';

const express = require('express');
const request = require('supertest');

const routes = require(
  '../routes/bare-metal-v2/' +
    'sheikha-bare-metal-v2-physical-trial-routes-v1'
);

describe('Sheikha bare-metal physical trial routes V1', () => {
  const app = express().use(
    '/api/sheikha/bare-metal/v2/physical-trial/v1',
    routes
  );

  test('reports a QEMU-verified image without installation claims', async () => {
    const response = await request(app)
      .get('/api/sheikha/bare-metal/v2/physical-trial/v1/status')
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.verification.qemuBootVerified).toBe(true);
    expect(response.body.data.verification.visualBootUiVerified).toBe(true);
    expect(response.body.data.verification.physicalBootVerified).toBe(false);
    expect(response.body.data.installation.diskInstallerImplemented)
      .toBe(false);
    expect(response.body.data.installation.installableToInternalDisk)
      .toBe(false);
  });

  test('serves a hash-bound manifest', async () => {
    const response = await request(app)
      .get('/api/sheikha/bare-metal/v2/physical-trial/v1/manifest')
      .expect(200);
    expect(response.body.data.structuralVerification.verified).toBe(true);
    expect(response.body.data.artifacts[0].sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('downloads the verified image with non-installable headers', async () => {
    const response = await request(app)
      .head('/api/sheikha/bare-metal/v2/physical-trial/v1/download')
      .expect(200);
    expect(response.headers['x-sheikha-installable']).toBe('false');
    expect(response.headers['x-sheikha-artifact-sha256'])
      .toMatch(/^[a-f0-9]{64}$/);
  });
});
