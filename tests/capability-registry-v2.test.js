const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Capability Registry V2', () => {
  test('capability registry v2 is active under decision registry before execution fabric', () => {
    const registry = readJson('runtime/capability-registry/v2/sheikha-capability-registry-v2.json');

    expect(registry.system).toBe('SHEIKHA_CAPABILITY_REGISTRY_V2');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('UNDER_DECISION_REGISTRY_BEFORE_EXECUTION_FABRIC');
    expect(registry.governed_by).toEqual(expect.arrayContaining([
      'SHEIKHA_ROOT_AUTHORITY_LAYER_V1',
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_DECISION_REGISTRY_V2'
    ]));
    expect(registry.next_layer).toBe('SHEIKHA_EXECUTION_FABRIC_V2');
    expect(registry.next_layer_status).toBe('GATED_UNTIL_CAPABILITY_REGISTRY_V2_ACTIVE_100');
  });

  test('capabilities are linked to decision refs, policies, guardrails, and measurements', () => {
    const capabilityItems = readJson('runtime/capability-registry/v2/registries/capability-items.json');
    const decisionItems = readJson('runtime/decision-registry/v2/registries/decision-registry-items.json');
    const knownDecisionIds = new Set(decisionItems.items.map((item) => item.id));

    expect(capabilityItems.status).toBe('ACTIVE');
    expect(capabilityItems.items.length).toBeGreaterThanOrEqual(10);

    capabilityItems.items.forEach((capability) => {
      expect(capability.id).toMatch(/^CAP-CODEX-\d{3}$/);
      expect(['ACTIVE', 'GATED']).toContain(capability.status);
      expect(capability.decisionRefs.length).toBeGreaterThan(0);
      expect(capability.policyRefs.length).toBeGreaterThan(0);
      expect(capability.guardrails.length).toBeGreaterThan(0);
      expect(capability.measurement.length).toBeGreaterThan(0);
      capability.decisionRefs.forEach((decisionId) => {
        expect(knownDecisionIds.has(decisionId)).toBe(true);
      });
    });
  });

  test('codex and ai activation is truthful and provider neutral', () => {
    const registry = readJson('runtime/capability-registry/v2/sheikha-capability-registry-v2.json');

    expect(registry.requested_activation_label).toBe('SHEIKHA_CODEX_AI_FULL_CAPABILITIES_REQUEST');
    expect(registry.truthfulness_policy.capability_activation_only).toBe(true);
    expect(registry.truthfulness_policy.model_pull_requested).toBe(false);
    expect(registry.truthfulness_policy.provider_model_download_requested).toBe(false);
    expect(registry.truthfulness_policy.external_model_activation_claim).toBe(false);
    expect(registry.truthfulness_policy.model_name_is_not_asserted).toBe(true);
    expect(registry.truthfulness_policy.provider_availability_must_be_verified).toBe(true);
    expect(registry.policies.no_unverified_model_claims).toBe(true);
  });

  test('capability registry v2 report is active with all checks passing', () => {
    const report = readJson('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('CAPABILITY_REGISTRY_V2_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.coverage.gatedCapabilities).toBe(1);
  });

  test('capability registry v2 has script, docs, and fabric route', () => {
    const packageJson = readJson('package.json');
    const docs = readText('docs/capability-registry/SHEIKHA-CAPABILITY-REGISTRY-V2.md');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'capability-registry-v2');

    expect(packageJson.scripts['ops:capability-registry:v2']).toBe(
      'node tools/capability-registry/sheikha-capability-registry-v2.js'
    );
    expect(docs).toContain('SHEIKHA_CAPABILITY_REGISTRY_V2');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/governance/capability-registry-v2',
      module: 'routes/governance/capability-registry-v2/status.routes.js'
    }));
  });
});
