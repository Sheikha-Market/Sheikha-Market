const fs = require('fs');
const path = require('path');

const capabilities = [
  {
    id: 'mcp',
    name: 'MCP Unified Bridge',
    routes: ['/api/mcp/status', '/api/mcp/health', '/api/mcp/tools', '/api/sheikha/mcp/status'],
    sdkTargets: ['javascript', 'typescript', 'python', 'rest', 'mcp']
  },
  {
    id: 'openapi-registry',
    name: 'OpenAPI Registry',
    routes: ['/api/openapi-registry/status'],
    sdkTargets: ['javascript', 'typescript', 'python', 'rest']
  },
  {
    id: 'governance',
    name: 'Governance Runtime',
    routes: ['/api/governance/pdp/status', '/api/governance/pep/status'],
    sdkTargets: ['javascript', 'typescript', 'python', 'rest']
  },
  {
    id: 'runtime',
    name: 'Runtime Fabric',
    routes: ['/api/runtime/introspection/routes'],
    sdkTargets: ['javascript', 'typescript', 'python', 'rest']
  }
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

const capabilityOut = path.join(process.cwd(), 'runtime/capability-registry/consolidated/sheikha-consolidated-capabilities.json');
const openapiOut = path.join(process.cwd(), 'runtime/openapi-registry/generated/sheikha-openapi-generated.json');
const sdkOut = path.join(process.cwd(), 'runtime/sdk-registry/generated/sheikha-sdk-generated-registry.json');

ensureDir(path.dirname(capabilityOut));
ensureDir(path.dirname(openapiOut));
ensureDir(path.dirname(sdkOut));

const capabilityRegistry = {
  registry: 'SHEIKHA_CONSOLIDATED_CAPABILITY_REGISTRY',
  status: 'ACTIVE',
  basedOn: 'SHEIKHA_ARCHITECTURE_FREEZE_V1_1',
  capabilities,
  rules: {
    capability_token_required: true,
    pdp_required: true,
    pep_required: true,
    audit_required: true,
    no_direct_kernel_exposure: true
  },
  timestamp: new Date().toISOString()
};

const paths = {};
for (const cap of capabilities) {
  for (const route of cap.routes) {
    paths[route] = {
      get: {
        summary: cap.name,
        operationId: `${cap.id.replace(/-/g, '_')}_${route.split('/').filter(Boolean).join('_')}`,
        responses: {
          "200": {
            description: "Successful response"
          }
        }
      }
    };
  }
}

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Sheikha API",
    version: "1.1.0",
    description: "Generated OpenAPI baseline for Sheikha Freeze V1.1"
  },
  paths
};

const sdkRegistry = {
  registry: 'SHEIKHA_GENERATED_SDK_REGISTRY',
  status: 'ACTIVE',
  basedOn: 'SHEIKHA_OPENAPI_REGISTRY',
  sdkTargets: [...new Set(capabilities.flatMap(c => c.sdkTargets))],
  capabilities: capabilities.map(c => ({
    id: c.id,
    name: c.name,
    routes: c.routes,
    sdkTargets: c.sdkTargets
  })),
  rules: {
    sdk_must_use_openapi: true,
    sdk_must_use_capability_registry: true,
    mcp_bridge_required_for_mcp_sdk: true,
    versioning_required: true
  },
  timestamp: new Date().toISOString()
};

fs.writeFileSync(capabilityOut, JSON.stringify(capabilityRegistry, null, 2) + '\n');
fs.writeFileSync(openapiOut, JSON.stringify(openapi, null, 2) + '\n');
fs.writeFileSync(sdkOut, JSON.stringify(sdkRegistry, null, 2) + '\n');

console.log(JSON.stringify({
  status: 'ACTIVE',
  capabilities: capabilities.length,
  openapiPaths: Object.keys(paths).length,
  capabilityOut,
  openapiOut,
  sdkOut
}, null, 2));
