const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha DevOps AI Lab Fabric V1', () => {
  test('devops ai lab fabric is active and contains the governed modules', () => {
    const registry = readJson('runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1.json');

    expect(registry.system).toBe('SHEIKHA_DEVOPS_AI_LAB_FABRIC_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.modules).toContain('GIT_SECTION');
    expect(registry.modules).toContain('API_INTEGRATION_LAB');
    expect(registry.modules).toContain('AI_ASSISTED_ENGINEERING');
    expect(registry.modules).toContain('EXPERIMENT_TO_PRODUCT');
    expect(registry.rules.tests_required).toBe(true);
    expect(registry.rules.no_drift_required).toBe(true);
  });

  test('issue to impact loop binds issue experiment api ai code test merge product knowledge education and impact', () => {
    const loop = readJson('runtime/devops-ai-lab-fabric/v1/registries/issue-to-impact-loop-registry.json');

    expect(loop.status).toBe('ACTIVE');
    expect(loop.canonicalLoop).toEqual([
      'ISSUE',
      'EXPERIMENT',
      'API',
      'AI',
      'CODE',
      'TEST',
      'MERGE',
      'PRODUCT',
      'KNOWLEDGE',
      'EDUCATION',
      'IMPACT'
    ]);
    expect(loop.stages.length).toBe(11);
    expect(loop.stages.every((stage) =>
      stage.owner &&
      stage.source &&
      Array.isArray(stage.evidence) &&
      stage.evidence.length >= 3
    )).toBe(true);
    expect(loop.truthfulness.no_merge_without_tests).toBe(true);
    expect(loop.truthfulness.no_impact_claim_without_measurement).toBe(true);
  });

  test('devops ai lab fabric report has complete dependencies and fabric route', () => {
    const report = readJson('runtime/devops-ai-lab-fabric/v1/sheikha-devops-ai-lab-fabric-v1-report.json');
    const docs = readText('docs/devops-ai-lab-fabric/SHEIKHA-DEVOPS-AI-LAB-FABRIC-V1.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'devops-ai-lab-fabric-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('DEVOPS_AI_LAB_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.checks.issueToImpactLoop).toBe(true);
    expect(report.checks.platformFactories).toBe(true);
    expect(report.checks.fabricRouteMounted).toBe(true);
    expect(docs).toContain('Issue → Experiment → API → AI → Code → Test → Merge → Product → Knowledge → Education → Impact');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/devops/ai-lab',
      module: 'routes/devops-ai-lab-fabric/status.routes.js',
      priority: 228
    }));
  });
});
