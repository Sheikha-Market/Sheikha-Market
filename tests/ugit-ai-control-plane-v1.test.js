const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha UGIT AI Control Plane V1', () => {
  test('ugit ai control plane is active above cloud and sovereign ai fabrics', () => {
    const registry = readJson('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1.json');

    expect(registry.system).toBe('SHEIKHA_UGIT_AI_CONTROL_PLANE_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_CLOUD_SUPERCOMPUTER_AND_SOVEREIGN_AI_SUPERCLUSTER');
    expect(registry.official_platform.acronym).toBe('SHEIKHA UGIT-RP');
    expect(registry.commercial_product).toBe('PROD-UGITAI-001');
    expect(registry.based_on).toEqual(expect.arrayContaining([
      'SHEIKHA_CLOUD_SUPERCOMPUTER_FABRIC_V1',
      'SHEIKHA_SOVEREIGN_COMMERCIAL_AI_SUPERCLUSTER_V1',
      'SHEIKHA_AI_CLUSTER_PIPELINE_FABRIC_V1'
    ]));
  });

  test('truthfulness blocks unsupported compute model provider customer partner and revenue claims', () => {
    const registry = readJson('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1.json');

    expect(registry.truthfulness.architecture_and_readiness_only).toBe(true);
    expect(registry.truthfulness.no_external_model_claim).toBe(true);
    expect(registry.truthfulness.no_physical_compute_claim).toBe(true);
    expect(registry.truthfulness.no_provider_contract_claim_without_signed_contract).toBe(true);
    expect(registry.truthfulness.no_customer_claim_without_contract).toBe(true);
    expect(registry.truthfulness.no_partner_claim_without_signed_agreement).toBe(true);
    expect(registry.truthfulness.no_revenue_claim_without_payment).toBe(true);
    expect(registry.truthfulness.no_tool_installation_claim_without_runtime_evidence).toBe(true);
    expect(registry.truthfulness.no_model_training_claim_without_run_evidence).toBe(true);
  });

  test('operating layers domains tooling and policies cover the submitted proposal and higher ugit scope', () => {
    const layers = readJson('runtime/ugit-ai-control-plane/v1/registries/operating-layers-registry.json');
    const domains = readJson('runtime/ugit-ai-control-plane/v1/registries/domain-pipeline-registry.json');
    const tooling = readJson('runtime/ugit-ai-control-plane/v1/registries/tooling-control-registry.json');
    const policies = readJson('runtime/ugit-ai-control-plane/v1/registries/governance-policy-registry.json');

    const systems = new Set(layers.layers.map((layer) => layer.system));
    const domainNames = new Set(domains.domains.map((domain) => domain.domain));
    const toolNames = new Set(tooling.tools.map((tool) => tool.name));
    const policyNames = new Set(policies.policies.map((policy) => policy.name));

    [
      'SHEIKHA_CLOUD_SUPERCOMPUTER_FABRIC_V1',
      'SERVICE_MESH_POLICY_LAYER',
      'DATA_MESH_LAKEHOUSE_READINESS',
      'GEO_DISTRIBUTED_AI_READINESS',
      'MIXTURE_OF_EXPERTS_ROUTING_GOVERNANCE',
      'MULTI_AGENT_GOVERNED_OPERATING_SYSTEM',
      'SHEIKHA_PROVIDER_REGISTRY_V1',
      'SHEIKHA_COMPUTE_CONTRACT_ENGINE_V1',
      'SHEIKHA_BUDGET_GUARD_V1',
      'SHEIKHA_GPU_FARM_READINESS_V1',
      'SHEIKHA_MULTICLOUD_FABRIC_V1',
      'SHEIKHA_PROVIDER_COMPUTE_FABRIC_V1',
      'SHEIKHA_COMMERCIAL_REAL_ACTIVATION_V1',
      'SHEIKHA_MULTI_SUPERCOMPUTER_CLOUD_FABRIC_V1',
      'SHEIKHA_AI_SUPERCOMPUTER_CLOUD_CLUSTER_PIPELINE_FABRIC_V1'
    ].forEach((system) => expect(systems.has(system)).toBe(true));

    [
      'governance',
      'industry',
      'trade',
      'supply_chain',
      'recycling',
      'smart_cities',
      'markets',
      'advisory',
      'data',
      'ai'
    ].forEach((domain) => expect(domainNames.has(domain)).toBe(true));

    [
      'Apache Airflow',
      'Apache Spark',
      'Kubernetes',
      'Kubeflow',
      'MLflow',
      'Hugging Face Pipelines',
      'MoE Router',
      'Multi-Agent Orchestrator',
      'Runtime Admission Controller',
      'Fabric Bootstrap Loader'
    ].forEach((tool) => expect(toolNames.has(tool)).toBe(true));

    [
      'evidence_first_truthfulness',
      'no_unapproved_compute_spend',
      'data_rights_before_ingestion',
      'evaluation_before_deployment',
      'commercial_claim_contract_gate',
      'agent_permission_least_privilege'
    ].forEach((policy) => expect(policyNames.has(policy)).toBe(true));

    expect(layers.layers.every((layer) => layer.executionClaim === false)).toBe(true);
    expect(domains.domains.every((domain) => domain.governanceGate === true)).toBe(true);
    expect(tooling.tools.every((tool) => tool.installationClaim === false)).toBe(true);
    expect(policies.policies.every((policy) => policy.enforced === true)).toBe(true);
  });

  test('ugit control plane report is active with complete dependencies and checks', () => {
    const report = readJson('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('UGIT_AI_CONTROL_PLANE_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.dependencies).every(Boolean)).toBe(true);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.coverage.externalClaimsAllowed).toBe(0);
    expect(report.coverage.installationClaims).toBe(0);
    expect(report.coverage.executionClaims).toBe(0);
  });

  test('ugit control plane has commercial product script docs and fabric routes', () => {
    const packageJson = readJson('package.json');
    const docs = readText('docs/ugit-ai-control-plane/SHEIKHA-UGIT-AI-CONTROL-PLANE-V1.md');
    const products = readJson('runtime/commercial-product-layer/v1/registries/commercial-products-registry.json');
    const sheets = readJson('runtime/commercial-product-layer/v1/registries/product-sheets-registry.json');
    const valueProof = readJson('runtime/commercial-product-layer/v1/registries/commercial-value-proof-registry.json');
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const ugitRoute = fabric.routes.find((item) => item.name === 'ugit-ai-control-plane-v1');
    const providerComputeRoute = fabric.routes.find((item) => item.name === 'provider-compute-fabric-v1');
    const commercialRealRoute = fabric.routes.find((item) => item.name === 'commercial-real-activation-v1');
    const multiSupercomputerRoute = fabric.routes.find((item) => item.name === 'multi-supercomputer-cloud-fabric-v1');
    const aiSupercomputerPipelineRoute =
      fabric.routes.find((item) => item.name === 'ai-supercomputer-cloud-cluster-pipeline-fabric-v1');
    const cloudRoute = fabric.routes.find((item) => item.name === 'cloud-supercomputer-fabric-v1');

    expect(packageJson.scripts['ops:ugit-ai-control-plane:v1']).toBe(
      'node tools/ugit-ai-control-plane/sheikha-ugit-ai-control-plane-v1.js'
    );
    expect(docs).toContain('SHEIKHA_UGIT_AI_CONTROL_PLANE_V1');
    expect(docs).toContain('SHEIKHA UGIT-RP');
    expect(products.products.some((product) => product.id === 'PROD-UGITAI-001')).toBe(true);
    expect(sheets.products.some((sheet) => sheet.productId === 'PROD-UGITAI-001')).toBe(true);
    expect(valueProof.proofTargets.some((proof) => proof.id === 'VP-007')).toBe(true);
    expect(ugitRoute).toEqual(expect.objectContaining({
      mount: '/api/ai/ugit-control-plane',
      module: 'routes/ugit-ai-control-plane/status.routes.js',
      priority: 235
    }));
    expect(cloudRoute).toEqual(expect.objectContaining({
      mount: '/api/ai/cloud-supercomputer-fabric',
      module: 'routes/cloud-supercomputer-fabric/status.routes.js'
    }));
    expect(providerComputeRoute).toEqual(expect.objectContaining({
      mount: '/api/ai/provider-compute-fabric',
      module: 'routes/provider-compute-fabric/status.routes.js',
      priority: 234
    }));
    expect(commercialRealRoute).toEqual(expect.objectContaining({
      mount: '/api/commercial/real-activation',
      module: 'routes/commercial-real-activation/status.routes.js',
      priority: 233
    }));
    expect(multiSupercomputerRoute).toEqual(expect.objectContaining({
      mount: '/api/ai/multi-supercomputer-cloud-fabric',
      module: 'routes/multi-supercomputer-cloud-fabric/status.routes.js',
      priority: 232
    }));
    expect(aiSupercomputerPipelineRoute).toEqual(expect.objectContaining({
      mount: '/api/ai/supercomputer-cloud-cluster-pipeline-fabric',
      module: 'routes/ai-supercomputer-cloud-cluster-pipeline-fabric/status.routes.js',
      priority: 231
    }));
  });
});
