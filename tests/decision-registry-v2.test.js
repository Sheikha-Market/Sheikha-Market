const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Decision Registry V2', () => {
  function knowledgeIds() {
    return new Set([
      ...readJson('runtime/knowledge-engine/v2/registries/lessons-learned-registry.json').items.map(
        (item) => item.id
      ),
      ...readJson('runtime/knowledge-engine/v2/registries/governance-knowledge-registry.json').items.map(
        (item) => item.id
      ),
      ...readJson('runtime/knowledge-engine/v2/registries/runtime-knowledge-registry.json').items.map(
        (item) => item.id
      )
    ]);
  }

  test('decision registry v2 is active under knowledge engine and before capability registry', () => {
    const registry = readJson('runtime/decision-registry/v2/sheikha-decision-registry-v2.json');

    expect(registry.system).toBe('SHEIKHA_DECISION_REGISTRY_V2');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('UNDER_KNOWLEDGE_ENGINE_BEFORE_CAPABILITY_REGISTRY');
    expect(registry.governed_by).toEqual(expect.arrayContaining([
      'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
      'SHEIKHA_KNOWLEDGE_ENGINE_V2'
    ]));
    expect(registry.next_layer).toBe('SHEIKHA_CAPABILITY_REGISTRY_V2');
    expect(registry.blocked_until_ready).toContain('SHEIKHA_EXECUTION_FABRIC_V2');
    expect(Object.values(registry.dependencies).every(Boolean)).toBe(true);
    expect(Object.values(registry.knowledgeCoverage).every((count) => count > 0)).toBe(true);
    expect(registry.decisions).toHaveLength(7);
    expect(registry.decisions.every((decision) => decision.status === 'ACTIVE')).toBe(true);
  });

  test('all decision registry dependencies and knowledge coverage are ready', () => {
    const report = readJson('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json');

    expect(Object.values(report.dependencies).every(Boolean)).toBe(true);
    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('DECISION_REGISTRY_V2_ACTIVE_100');
    expect(report.missingDependencies).toEqual([]);
    expect(report.missingRegistryChecks).toEqual([]);
    expect(Object.values(report.registryChecks).every(Boolean)).toBe(true);
  });

  test('every governed decision item has active status, knowledge links, and measurement', () => {
    const registry = readJson('runtime/decision-registry/v2/registries/decision-registry-items.json');
    const knownKnowledgeIds = knowledgeIds();

    expect(registry.items.length).toBeGreaterThanOrEqual(7);
    registry.items.forEach((decision) => {
      expect(decision.id).toMatch(/^DRV2-\d{3}$/);
      expect(decision.status).toBe('ACTIVE');
      expect(decision.authority).toMatch(/^SHEIKHA_/);
      expect(decision.measurement.length).toBeGreaterThan(0);
      expect(decision.sourceKnowledge.length).toBeGreaterThan(0);
      decision.sourceKnowledge.forEach((id) => {
        expect(knownKnowledgeIds.has(id)).toBe(true);
      });
    });
  });

  test('decision registry v2 has an operation script and indexed documentation', () => {
    const packageJson = readJson('package.json');
    const docs = readText('docs/decision-registry/SHEIKHA-DECISION-REGISTRY-V2.md');

    expect(packageJson.scripts['ops:decision-registry:v2']).toBe(
      'node tools/decision-registry/sheikha-decision-registry-v2.js'
    );
    expect(docs).toContain('SHEIKHA_DECISION_REGISTRY_V2');
    expect(docs).toContain('SHEIKHA_CAPABILITY_REGISTRY_V2');
    expect(docs).toContain('SHEIKHA_EXECUTION_FABRIC_V2');
  });
});
