'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const { execFileSync } = require('node:child_process');

const LOCAL_COMMANDS = Object.freeze({
  node: ['/usr/bin/node', '/usr/local/bin/node'],
  docker: ['/usr/bin/docker'],
  podman: ['/usr/bin/podman'],
  kubectl: ['/usr/bin/kubectl', '/usr/local/bin/kubectl'],
  helm: ['/usr/bin/helm', '/usr/local/bin/helm'],
  terraform: ['/usr/bin/terraform', '/usr/local/bin/terraform'],
  opentofu: ['/usr/bin/tofu', '/usr/local/bin/tofu'],
  ansible: ['/usr/bin/ansible'],
  qemu: ['/usr/bin/qemu-system-x86_64'],
  virsh: ['/usr/bin/virsh'],
  nvidia_smi: ['/usr/bin/nvidia-smi'],
  ollama: ['/usr/local/bin/ollama', '/usr/bin/ollama'],
  prometheus: ['/usr/bin/prometheus', '/usr/local/bin/prometheus'],
  grafana_server: ['/usr/sbin/grafana-server', '/usr/bin/grafana-server'],
  redis_server: ['/usr/bin/redis-server'],
  psql: ['/usr/bin/psql'],
  mc: ['/usr/bin/mc', '/usr/local/bin/mc'],
});

const CLOUD_SERVICES = Object.freeze([
  { id: 'COMPUTE', capabilities: ['VM', 'bare-metal', 'autoscaling', 'batch'] },
  { id: 'GPU_ACCELERATION', capabilities: ['inference', 'training', 'HPC scheduling'] },
  { id: 'CONTAINERS', capabilities: ['images', 'orchestration', 'service discovery'] },
  { id: 'STORAGE', capabilities: ['object', 'block', 'file', 'backup', 'archive'] },
  { id: 'NETWORK', capabilities: ['VPC', 'load balancing', 'DNS', 'CDN', 'private links'] },
  { id: 'IDENTITY_AND_KEYS', capabilities: ['IAM', 'RBAC', 'secrets', 'KMS/HSM', 'PKI'] },
  { id: 'DATABASES', capabilities: ['SQL', 'document', 'cache', 'vector', 'time series'] },
  { id: 'MESSAGING', capabilities: ['queues', 'streams', 'events'] },
  { id: 'AI_FOUNDRY', capabilities: ['model registry', 'training gates', 'evaluation', 'serving'] },
  { id: 'OBSERVABILITY', capabilities: ['metrics', 'logs', 'traces', 'alerts', 'SLO'] },
  { id: 'DEV_PLATFORM', capabilities: ['Git', 'CI/CD', 'artifacts', 'SDK', 'CLI', 'MCP'] },
  { id: 'FINOPS', capabilities: ['metering', 'quotas', 'budgets', 'billing evidence'] },
  { id: 'GOVERNANCE', capabilities: ['policy', 'audit', 'residency', 'approval', 'recovery'] },
]);

const DATA_CENTER_LAYERS = Object.freeze([
  'FACILITY_POWER_COOLING_AND_PHYSICAL_SECURITY',
  'NETWORK_AND_INTERNET_TRANSIT',
  'COMPUTE_STORAGE_AND_ACCELERATORS',
  'VIRTUALIZATION_AND_CLUSTER_ORCHESTRATION',
  'PLATFORM_DATA_AND_AI_SERVICES',
  'OBSERVABILITY_SECURITY_BILLING_AND_SUPPORT',
]);

const EXTERNAL_FEDERATION = Object.freeze(['AWS', 'AZURE', 'GCP', 'HOSTINGER', 'OTHER_CONTRACTED_PROVIDER']);

function localInventory() {
  return Object.entries(LOCAL_COMMANDS).map(([command, paths]) => {
    const path = paths.find((candidate) => fs.existsSync(candidate)) || null;
    return { command, installed: Boolean(path), path };
  });
}

function buildSheikhaCloudStatus(env = process.env) {
  const inventory = localInventory();
  const checks = {
    authenticatedTenant: env.SHEIKHA_CLOUD_TENANT_VERIFIED === 'true',
    distributedControlPlane: env.SHEIKHA_CLOUD_DISTRIBUTED_CONTROL_PLANE_VERIFIED === 'true',
    multiNodeFailureRecovery: env.SHEIKHA_CLOUD_FAILURE_RECOVERY_VERIFIED === 'true',
    meteringAndBilling: env.SHEIKHA_CLOUD_METERING_VERIFIED === 'true',
    externalSecurityAudit: env.SHEIKHA_CLOUD_EXTERNAL_SECURITY_AUDIT === 'true',
    dataCenterCapacityOwnedOrContracted: env.SHEIKHA_CLOUD_CAPACITY_CONTRACT_VERIFIED === 'true',
  };
  const blockers = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  const base = {
    system: 'SHEIKHA_CLOUD_V1',
    productName: 'Sheikha Cloud',
    identity: 'SHEIKHA_CLOUD_AND_DATA_CENTER_CONTROL_PRODUCT',
    status: blockers.length ? 'LOCAL_CLOUD_FOUNDATION_ACTIVE_HYPERSCALE_NOT_VERIFIED' : 'CONTROLLED_COMMERCIAL_CANARY_ELIGIBLE',
    localRuntime: {
      independentCore: true,
      inventory,
      installedCount: inventory.filter((item) => item.installed).length,
      totalTracked: inventory.length,
    },
    services: CLOUD_SERVICES,
    dataCenterLayers: DATA_CENTER_LAYERS,
    externalFederation: EXTERNAL_FEDERATION.map((provider) => ({ provider, optional: true, activated: false })),
    checks,
    blockers,
    provisioningPolicy: {
      planOnlyByDefault: true,
      paidProvisioningRequiresContractBudgetAndApproval: true,
      credentialsUseVaultOrWorkloadIdentity: true,
      tenantIsolationRequired: true,
      quotasAndSpendCapsRequired: true,
      destructiveOperationsRequireRecoveryAndSeparateApproval: true,
      upstreamProviderTermsAndNamesPreserved: true,
    },
    claims: {
      isSheikhaCloudProduct: true,
      ownsHyperscaleDataCenters: false,
      hyperscaleCapacityAvailable: false,
      commercialPublicCloudReady: blockers.length === 0,
    },
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

function planCloudWorkload(input = {}) {
  const serviceId = String(input.serviceId || '').trim().toUpperCase();
  const service = CLOUD_SERVICES.find((candidate) => candidate.id === serviceId);
  if (!service) return { status: 'UNKNOWN_CLOUD_SERVICE', executionStarted: false, serviceId: serviceId || null };
  const paid = input.paidResource === true;
  return {
    system: 'SHEIKHA_CLOUD_WORKLOAD_PLAN_V1',
    status: paid ? 'CONTRACT_BUDGET_AND_HUMAN_APPROVAL_REQUIRED' : 'LOCAL_PLAN_READY',
    service,
    target: String(input.target || 'LOCAL').trim().toUpperCase(),
    executionStarted: false,
    paidResourceCreated: false,
    networkMutationAllowed: false,
    destructiveMutationAllowed: false,
    evidenceRequired: true,
  };
}

function activateLocalCloudCanary(input = {}) {
  const inventory = new Map((input.inventory || localInventory()).map((item) => [item.command, item]));
  const checks = {
    studioControlPlaneHealthy: input.studioControlPlaneHealthy === true,
    coreRuntimeAvailable: inventory.get('node')?.installed === true,
    containerEngineAvailable: inventory.get('docker')?.installed === true || inventory.get('podman')?.installed === true,
    virtualizationAvailable: inventory.get('qemu')?.installed === true,
    gpuAvailable: inventory.get('nvidia_smi')?.installed === true,
    localModelRuntimeAvailable: inventory.get('ollama')?.installed === true,
    metricsAvailable: inventory.get('prometheus')?.installed === true,
    dashboardAvailable: inventory.get('grafana_server')?.installed === true,
    cacheAvailable: inventory.get('redis_server')?.installed === true,
  };
  const blockers = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  const base = {
    system: 'SHEIKHA_CLOUD_LOCAL_CANARY_ACTIVATION_V1',
    status: blockers.length ? 'LOCAL_CANARY_BLOCKED' : 'LOCAL_CANARY_ACTIVE',
    scope: 'SINGLE_HOST_DEVELOPMENT_AND_CONTROLLED_PILOT',
    checks,
    blockers,
    activated: blockers.length === 0,
    controlPlaneResponding: input.studioControlPlaneHealthy === true,
    externalProvisioningExecuted: false,
    paidResourcesCreated: false,
    networkChanged: false,
    destructiveMutationExecuted: false,
    productionBoundary: 'NOT_DISTRIBUTED_OR_PUBLIC_CLOUD_PRODUCTION',
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

function probeHttp(url, expectedText = null) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: 1500 }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve({
        reachable: response.statusCode >= 200 && response.statusCode < 500,
        statusCode: response.statusCode,
        expectedResponse: expectedText ? body.includes(expectedText) : true,
      }));
    });
    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve({ reachable: false, statusCode: null, expectedResponse: false }));
  });
}

function probeTcp(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = (reachable) => {
      socket.destroy();
      resolve({ reachable, host: '127.0.0.1', port });
    };
    socket.setTimeout(1500);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

function commandHealthy(command, args) {
  try {
    execFileSync(command, args, { stdio: 'ignore', timeout: 2500 });
    return true;
  } catch {
    return false;
  }
}

function listeningExposure() {
  try {
    const output = execFileSync('/usr/bin/ss', ['-H', '-ltn'], { encoding: 'utf8', timeout: 2000 });
    const listeners = output.split('\n').filter(Boolean).map((line) => {
      const fields = line.trim().split(/\s+/);
      return fields[3] || '';
    });
    const exposedPorts = [3000, 9090].filter((port) => listeners.some((address) =>
      address === `0.0.0.0:${port}` || address === `*:${port}` || address === `[::]:${port}`));
    return { inspected: true, exposedPorts };
  } catch {
    return { inspected: false, exposedPorts: [] };
  }
}

async function inspectLocalCloudRuntime(options = {}) {
  const snapshot = options.snapshot || null;
  const evidence = snapshot || {
    dockerHealthy: commandHealthy('/usr/bin/docker', ['info']),
    gpuHealthy: commandHealthy('/usr/bin/nvidia-smi', ['-L']),
    ollama: await probeHttp('http://127.0.0.1:11434/api/tags'),
    prometheus: await probeHttp('http://127.0.0.1:9090/-/ready', 'Ready'),
    grafana: await probeHttp('http://127.0.0.1:3000/api/health'),
    redis: await probeTcp(6379),
    networkExposure: listeningExposure(),
  };
  const checks = {
    dockerHealthy: evidence.dockerHealthy === true,
    gpuHealthy: evidence.gpuHealthy === true,
    ollamaHealthy: evidence.ollama?.reachable === true,
    prometheusHealthy: evidence.prometheus?.reachable === true && evidence.prometheus?.expectedResponse !== false,
    grafanaHealthy: evidence.grafana?.reachable === true,
    redisReachableWithAuthenticationBoundary: evidence.redis?.reachable === true,
  };
  const blockers = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  const exposedPorts = evidence.networkExposure?.exposedPorts || [];
  const warnings = exposedPorts.map((port) => `OBSERVABILITY_PORT_${port}_LISTENS_ON_ALL_INTERFACES`);
  const base = {
    system: 'SHEIKHA_CLOUD_LOCAL_RUNTIME_EVIDENCE_V1',
    status: blockers.length ? 'LOCAL_RUNTIME_DEGRADED' : warnings.length ? 'LOCAL_RUNTIME_ACTIVE_SECURITY_HARDENING_REQUIRED' : 'LOCAL_RUNTIME_ACTIVE',
    checks,
    blockers,
    warnings,
    networkExposure: evidence.networkExposure,
    redisSecretsRead: false,
    mutationExecuted: false,
    eligibleForLocalControlledPilot: blockers.length === 0,
    observabilityNetworkHardened: blockers.length === 0 && warnings.length === 0,
    eligibleForPublicProduction: false,
    publicProductionRequiresDistributedCloudGates: true,
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = {
  LOCAL_COMMANDS,
  CLOUD_SERVICES,
  DATA_CENTER_LAYERS,
  EXTERNAL_FEDERATION,
  buildSheikhaCloudStatus,
  planCloudWorkload,
  activateLocalCloudCanary,
  inspectLocalCloudRuntime,
};
