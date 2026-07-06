'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Vector Knowledge Store V2', () => {
  const root = process.cwd();

  test('vector knowledge store v2 report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/vector-knowledge-store-v2/v1/sheikha-vector-knowledge-store-v2-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_VECTOR_KNOWLEDGE_STORE_V2');
    expect(report.decision).toBe('VECTOR_KNOWLEDGE_STORE_V2_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.entities).toBeGreaterThanOrEqual(19);
    expect(report.coverage.relationships).toBeGreaterThanOrEqual(13);
  });
});
