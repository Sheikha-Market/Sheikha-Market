'use strict';

const {
  pm2FabricClusters,
  evaluatePm2Fabric
} = require('../core/pm2-fabric/sheikha-pm2-fabric-v1');

describe('Sheikha PM2 Fabric V1', () => {
  test('defines six specialized PM2 clusters', () => {
    expect(pm2FabricClusters.length).toBe(6);
    expect(pm2FabricClusters[0].required).toBe(true);
  });

  test('passes when required runtime cluster is online', () => {
    const result = evaluatePm2Fabric([
      {
        name: 'sheikha-main-portal',
        pid: 123,
        pm2_env: { status: 'online' },
        monit: { memory: 100, cpu: 0 }
      }
    ]);

    expect(result.system).toBe('SHEIKHA_PM2_FABRIC_V1');
    expect(result.status).toBe('PASSED');
  });
});
