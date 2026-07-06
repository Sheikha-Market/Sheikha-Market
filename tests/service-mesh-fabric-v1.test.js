'use strict';
const report = require('../runtime/service-mesh-fabric-v1/v1/sheikha-service-mesh-fabric-v1-report.json');

describe('Sheikha Service Mesh Fabric V1', () => {
  test('service mesh is active', () => {
    expect(report.system).toBe('SHEIKHA_SERVICE_MESH_FABRIC_V1');
    expect(report.decision).toBe('SERVICE_MESH_FABRIC_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.services).toBeGreaterThanOrEqual(10);
    expect(report.coverage.routes).toBeGreaterThanOrEqual(7);
  });
});
