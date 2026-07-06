'use strict';

const { status } = require('../core/life-fabric/integration/sheikha-life-fabric-integration-v2');

test('Sheikha Life Fabric Integration V2 is active and governed', () => {
  const s = status();
  expect(s.success).toBe(true);
  expect(s.status).toBe('ACTIVE');
  expect(s.connects.unifiedChat).toBe('SHEIKHA_UNIFIED_CHAT_FABRIC_V1');
  expect(s.principle.humanSuperior).toBe(true);
  expect(s.principle.technicalLifeOnly).toBe(true);
});
