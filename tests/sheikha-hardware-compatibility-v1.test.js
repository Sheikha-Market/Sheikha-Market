'use strict';

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const request = require('supertest');

const {
  ARCHITECTURE_DEFINITIONS,
  CONNECTOR_DEFINITIONS,
  OPERATING_ENVIRONMENT_DEFINITIONS,
  QUALIFICATION_LEVELS,
  TARGET_DEFINITIONS,
  buildRegistry,
  generate,
} = require(
  '../bare-metal/build/sheikha-universal-hardware-compatibility-v1'
);
const routes = require(
  '../routes/bare-metal-v2/sheikha-hardware-compatibility-routes-v1'
);

const ROOT = path.resolve(__dirname, '..');

describe('Sheikha Universal Hardware Compatibility Fabric V1', () => {
  const app = express().use(
    '/api/sheikha/bare-metal/v2/hardware-compatibility/v1',
    routes
  );

  beforeAll(() => {
    generate();
  });

  test('registers architectures, targets, connectors, and environments once', () => {
    const registry = buildRegistry();
    expect(QUALIFICATION_LEVELS).toHaveLength(7);
    expect(ARCHITECTURE_DEFINITIONS).toHaveLength(8);
    expect(TARGET_DEFINITIONS).toHaveLength(17);
    expect(CONNECTOR_DEFINITIONS).toHaveLength(56);
    expect(OPERATING_ENVIRONMENT_DEFINITIONS).toHaveLength(10);
    expect(registry.counts.architectures).toBe(8);
    expect(registry.counts.targetClasses).toBe(17);
    expect(registry.counts.connectors).toBe(56);
    expect(registry.counts.operatingEnvironments).toBe(10);

    for (const collection of [
      registry.architectures,
      registry.targets,
      registry.connectors,
      registry.operatingEnvironments,
    ]) {
      expect(new Set(collection.map((item) => item.id)).size)
        .toBe(collection.length);
    }
  });

  test('resolves every target architecture and connector dependency', () => {
    const registry = buildRegistry();
    const architectures = new Set(registry.architectures.map((item) => item.id));
    const connectors = new Set(registry.connectors.map((item) => item.id));
    for (const target of registry.targets) {
      expect(target.architectures.every((id) => architectures.has(id))).toBe(true);
      expect(target.requiredConnectors.every((id) => connectors.has(id))).toBe(true);
    }
  });

  test('keeps universal and safety completion claims false', () => {
    const registry = buildRegistry();
    expect(registry.claimBoundary.portabilityFrameworkActive).toBe(true);
    expect(registry.claimBoundary.runnableEverywhereToday).toBe(false);
    expect(registry.claimBoundary.universalHardwareSupportClaimed).toBe(false);
    expect(registry.claimBoundary.allDriversImplementedClaimed).toBe(false);
    expect(registry.counts.physicalVerifiedTargets).toBe(0);
    expect(registry.counts.safetyCertifiedTargets).toBe(0);
  });

  test('promotes only the current x86_64 bare-metal architecture to emulated', () => {
    const registry = buildRegistry();
    const emulated = registry.architectures.filter(
      (item) => item.qualification === 'EMULATED_VERIFIED'
    );
    expect(emulated.map((item) => item.id)).toEqual(['x86_64']);
    expect(emulated[0].evidence.length).toBeGreaterThan(0);
    expect(emulated[0].evidence.every((item) => item.verified)).toBe(true);
    expect(registry.architectures.find((item) => item.id === 'aarch64').status)
      .toBe('REGISTERED_PORT_REQUIRED');
  });

  test('requires local evidence for every emulated connector subset', () => {
    const registry = buildRegistry();
    const verified = registry.connectors.filter(
      (item) => item.qualification === 'EMULATED_VERIFIED'
    );
    expect(verified.length).toBeGreaterThan(0);
    for (const connector of verified) {
      expect(connector.defaultAuthorization).toBe('DENY');
      expect(connector.evidence.length).toBeGreaterThan(0);
      expect(connector.evidence.every((item) => item.exists)).toBe(true);
      expect(connector.evidence.every((item) => item.verified)).toBe(true);
    }
  });

  test('defines a compilable-shape ABI with high-impact approval gates', () => {
    const header = fs.readFileSync(
      path.join(ROOT, 'bare-metal/include/sheikha_driver_abi_v1.h'),
      'utf8'
    );
    const contract = JSON.parse(fs.readFileSync(
      path.join(
        ROOT,
        'runtime/bare-metal/v2/contracts/' +
          'sheikha-universal-hardware-compatibility-fabric-v1-contract.json'
      ),
      'utf8'
    ));
    expect(header).toContain('SHEIKHA_DRIVER_HIGH_IMPACT_MASK');
    expect(header).toContain('human_approval_present');
    expect(header).toContain('firmware_write_authorized');
    expect(header).toContain('sheikha_driver_request_allowed');
    expect(contract.defaultAuthorization).toBe('DENY');
    expect(contract.absoluteRuntimeDenials)
      .toContain('AI_AUTONOMOUS_FIRMWARE_FLASH');
    expect(contract.governance.automatedFatwa).toBe(false);
  });

  test('exposes filtered registries, evidence, roadmap, graph, and contract', async () => {
    const base = '/api/sheikha/bare-metal/v2/hardware-compatibility/v1';
    const status = await request(app).get(`${base}/status`).expect(200);
    expect(status.body.data.coverage.architectures).toBe(8);
    expect(status.body.data.driverAbi.sourceVerified).toBe(true);
    expect(status.body.data.driverAbi.smokeVerified).toBe(true);
    expect(status.body.data.claimBoundary.runnableEverywhereToday).toBe(false);

    const architectures = await request(app)
      .get(`${base}/architectures?qualification=emulated_verified`)
      .expect(200);
    expect(architectures.body.data.total).toBe(1);
    expect(architectures.body.data.architectures[0].id).toBe('x86_64');

    const automotive = await request(app)
      .get(`${base}/targets?domain=automotive`)
      .expect(200);
    expect(automotive.body.data.total).toBe(2);

    const automotiveConnectors = await request(app)
      .get(`${base}/connectors?category=automotive`)
      .expect(200);
    expect(automotiveConnectors.body.data.total).toBe(4);
    expect(automotiveConnectors.body.data.connectors.every(
      (item) => item.status === 'REGISTERED_DEFAULT_DENY'
    )).toBe(true);

    const detail = await request(app)
      .get(`${base}/targets/automotive-safety-controller`)
      .expect(200);
    expect(detail.body.data.target.safetyClass).toBe('LIFE_CRITICAL');
    expect(detail.body.data.connectors.length).toBe(4);

    await request(app).get(`${base}/targets/missing-target`).expect(404);

    const environments = await request(app)
      .get(`${base}/operating-environments`)
      .expect(200);
    expect(environments.body.data.total).toBe(10);

    const qualification = await request(app)
      .get(`${base}/qualification`)
      .expect(200);
    expect(qualification.body.data.summary.physicalVerified).toBe(0);

    const roadmap = await request(app).get(`${base}/roadmap`).expect(200);
    expect(roadmap.body.data.phases).toHaveLength(9);

    const graph = await request(app).get(`${base}/architecture`).expect(200);
    expect(graph.body.data.counts.nodes).toBeGreaterThan(80);

    const contract = await request(app).get(`${base}/contract`).expect(200);
    expect(contract.body.data.defaultAuthorization).toBe('DENY');
  });
});
