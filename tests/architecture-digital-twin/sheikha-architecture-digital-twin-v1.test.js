const {
  createArchitectureDigitalTwin
} = require('../../runtime/architecture-digital-twin/sheikha-architecture-digital-twin');

describe('Sheikha Architecture Digital Twin V1', () => {
  test('creates active architecture digital twin', () => {
    const twin = createArchitectureDigitalTwin();

    expect(twin.status).toBe('ACTIVE');
    expect(twin.scope).toContain('runtime');
    expect(twin.capabilities).toContain('impact-analysis');
    expect(twin.noAutonomousProductionChange).toBe(true);
  });
});
