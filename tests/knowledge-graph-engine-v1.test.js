'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Knowledge Graph Engine V1', () => {
  const root = process.cwd();

  test('knowledge graph engine report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/knowledge-graph-engine-v1/v1/sheikha-knowledge-graph-engine-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_KNOWLEDGE_GRAPH_ENGINE_V1');
    expect(report.decision).toBe('KNOWLEDGE_GRAPH_ENGINE_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.entities).toBeGreaterThanOrEqual(24);
    expect(report.coverage.relationships).toBeGreaterThanOrEqual(20);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(10);
  });
});
