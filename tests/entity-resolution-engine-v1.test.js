'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Entity Resolution Engine V1', () => {
  const root = process.cwd();

  test('entity resolution engine report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/entity-resolution-engine-v1/v1/sheikha-entity-resolution-engine-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_ENTITY_RESOLUTION_ENGINE_V1');
    expect(report.decision).toBe('ENTITY_RESOLUTION_ENGINE_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.entities).toBeGreaterThanOrEqual(19);
    expect(report.coverage.rules).toBeGreaterThanOrEqual(10);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(9);
  });
});
