'use strict';

const express = require('express');
const request = require('supertest');

const {
  APPENDIX_TITLES,
  CHAPTER_TITLES,
  buildRegistry,
  generate,
} = require('../bare-metal/build/sheikha-uefi-integration-v1');
const routes = require(
  '../routes/bare-metal-v2/sheikha-uefi-integration-routes-v1'
);

describe('Sheikha UEFI Integration Fabric V1', () => {
  const app = express().use(
    '/api/sheikha/bare-metal/v2/uefi-integration/v1',
    routes
  );

  beforeAll(() => {
    generate();
  });

  test('registers all 39 chapters and appendices A through R', () => {
    const registry = buildRegistry();
    expect(CHAPTER_TITLES).toHaveLength(39);
    expect(APPENDIX_TITLES).toHaveLength(18);
    expect(registry.counts.chapters).toBe(39);
    expect(registry.counts.appendices).toBe(18);
    expect(registry.counts.total).toBe(57);
    expect(new Set(registry.capabilities.map((item) => item.id)).size)
      .toBe(57);
  });

  test('does not turn registry coverage into a conformance claim', () => {
    const registry = buildRegistry();
    expect(registry.counts.fullyImplemented).toBe(0);
    expect(registry.claimBoundary.fullUefiImplementationClaimed).toBe(false);
    expect(registry.claimBoundary.uefiConformanceCertified).toBe(false);
    expect(registry.claimBoundary.physicalMsiBootVerified).toBe(false);
  });

  test('keeps high-impact capabilities behind default deny', () => {
    const registry = buildRegistry();
    const firmwareUpdate = registry.capabilities.find(
      (item) => item.id === 'UEFI-C23'
    );
    const secureBoot = registry.capabilities.find(
      (item) => item.id === 'UEFI-C32'
    );
    const network = registry.capabilities.filter((item) =>
      /^UEFI-C(2[4-9]|3[01])$/.test(item.id)
    );
    expect(firmwareUpdate.activation).toBe('REGISTERED_DEFAULT_DENY');
    expect(secureBoot.activation).toBe('REGISTERED_DEFAULT_DENY');
    expect(secureBoot.verificationStatus)
      .toBe('REQUIRES_EXTERNAL_KEYS_AND_SIGNING');
    expect(network).toHaveLength(8);
    expect(network.every(
      (item) => item.activation === 'REGISTERED_DEFAULT_DENY'
    )).toBe(true);
  });

  test('requires local evidence for every verified implementation subset', () => {
    const registry = buildRegistry();
    const verified = registry.capabilities.filter((item) =>
      item.verificationStatus.endsWith('QEMU_VERIFIED') ||
      item.verificationStatus === 'SOURCE_VERIFIED'
    );
    expect(verified.length).toBeGreaterThan(0);
    for (const capability of verified) {
      expect(capability.evidence.length).toBeGreaterThan(0);
      expect(capability.evidence.every((item) => item.exists)).toBe(true);
      expect(capability.evidence.every((item) => item.verified)).toBe(true);
    }
  });

  test('exposes status, filtering, details, graph, and contract', async () => {
    const base = '/api/sheikha/bare-metal/v2/uefi-integration/v1';
    const status = await request(app).get(`${base}/status`).expect(200);
    expect(status.body.data.coverage.total).toBe(57);

    const denied = await request(app)
      .get(`${base}/capabilities?activation=default_deny`)
      .expect(200);
    expect(denied.body.data.total).toBeGreaterThan(0);

    const verified = await request(app)
      .get(`${base}/capabilities?verification=verified`)
      .expect(200);
    expect(verified.body.data.total).toBe(13);
    expect(verified.body.data.capabilities.every(
      (item) => item.verificationStatus !== 'NOT_VERIFIED'
    )).toBe(true);

    const capability = await request(app)
      .get(`${base}/capabilities/uefi-c04`)
      .expect(200);
    expect(capability.body.data.title).toBe('EFI System Table');

    const graph = await request(app).get(`${base}/architecture`).expect(200);
    expect(graph.body.data.nodes.length).toBeGreaterThan(0);

    const contract = await request(app).get(`${base}/contract`).expect(200);
    expect(contract.body.data.defaultAuthorization).toBe('DENY');
  });
});
