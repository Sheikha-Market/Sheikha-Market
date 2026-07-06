'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const datacenter = require('./sheikha-datacenter-supercompute-fabric');
const distributed = require('../distributed/sheikha-distributed-cluster-fabric');
const storageGovernor = require('../storage/sheikha-storage-governor');

const ROOT = process.cwd();
const REPORT_DIR = 'runtime/supercompute/reports';

const PROHIBITED_COMPUTE_POLICY = Object.freeze([
  'no-riba',
  'no-fraud',
  'no-harm',
  'no-darar',
  'no-intoxicants',
  'no-mufattir-storage',
  'no-haram-workloads',
  'no-private-data-exposure',
  'human-review-before-impact'
]);

function ensureReportDir() {
  fs.mkdirSync(path.join(ROOT, REPORT_DIR), { recursive: true });
}

function buildReadiness({ datacenterStatus, distributedStatus, storageStatus }) {
  const gates = [
    {
      id: 'datacenter-supercompute',
      ok: Boolean(datacenterStatus.success && datacenterStatus.layers && datacenterStatus.layers.datacenterControlPlane)
    },
    {
      id: 'distributed-cluster',
      ok: Boolean(distributedStatus.success && distributedStatus.distributedRuntime && distributedStatus.distributedRuntime.clusterEnabled)
    },
    {
      id: 'storage-governor',
      ok: Boolean(storageStatus.success && storageStatus.storageFabric === 'SHEIKHA_STORAGE_GOVERNOR')
    },
    {
      id: 'provider-isolation',
      ok: Boolean(datacenterStatus.layers && datacenterStatus.layers.providerIsolation)
    },
    {
      id: 'offline-continuity',
      ok: Boolean(datacenterStatus.offlineCapable && distributedStatus.runtime && distributedStatus.runtime.offlineCapable)
    },
    {
      id: 'quran-sunnah-governance',
      ok: Boolean(datacenterStatus.governance && distributedStatus.governance && datacenterStatus.governance.quranAndSunnah)
    },
    {
      id: 'no-harm-no-haram-storage',
      ok: Boolean(
        storageStatus.governance &&
        storageStatus.governance.noHarm &&
        storageStatus.governance.noDarar &&
        storageStatus.governance.noIntoxicants &&
        storageStatus.governance.noMufattir &&
        storageStatus.governance.noHaramStorage
      )
    }
  ];

  return {
    status: gates.every((gate) => gate.ok) ? 'complete' : 'requires_review',
    gates
  };
}

function buildDeliveryReport() {
  const datacenterStatus = datacenter.status();
  const distributedStatus = distributed.status();
  const storageStatus = storageGovernor.status();
  const readiness = buildReadiness({ datacenterStatus, distributedStatus, storageStatus });

  return {
    success: readiness.status === 'complete',
    delivery: 'SHEIKHA_SUPERCOMPUTE_FABRIC_FINAL_DELIVERY',
    status: readiness.status,
    mode: 'sovereign-ai-supercomputing-infrastructure',
    canonical: true,
    deterministic: true,
    localFirst: true,
    offlineCapable: true,
    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpuCores: os.cpus().length,
      memoryTotal: os.totalmem(),
      memoryFree: os.freemem(),
      uptime: os.uptime()
    },
    fabrics: {
      datacenter: datacenterStatus,
      distributed: distributedStatus,
      storage: storageStatus
    },
    readiness,
    endpoints: {
      datacenterStatus: '/api/supercompute/datacenter/status',
      datacenterNode: '/api/supercompute/datacenter/node',
      datacenterReport: '/api/supercompute/datacenter/report',
      finalDelivery: '/api/supercompute/datacenter/delivery',
      distributedStatus: '/api/distributed/runtime/status',
      distributedNode: '/api/distributed/runtime/node',
      distributedMesh: '/api/distributed/runtime/mesh'
    },
    governance: {
      tawheed: true,
      quranAndSunnah: true,
      halalOnly: true,
      noRiba: true,
      noFraud: true,
      noHarm: true,
      noDarar: true,
      noIntoxicants: true,
      noMufattir: true,
      noHaramStorage: true,
      noGhaybPrediction: true,
      noConsciousnessClaim: true,
      humanAuthority: true
    },
    prohibitedComputePolicy: PROHIBITED_COMPUTE_POLICY,
    acceptance: {
      supercomputeFabric: 'active',
      distributedClusterFabric: 'active',
      storageGovernance: 'active',
      providerIsolation: 'active',
      deliveryReport: 'ready',
      featureExpansion: false,
      stabilizationPhase: 'canonical-supercompute-stabilization'
    },
    timestamp: new Date().toISOString()
  };
}

function writeDeliveryReport() {
  ensureReportDir();
  const report = buildDeliveryReport();
  const file = path.join(
    ROOT,
    REPORT_DIR,
    `${Date.now()}-supercompute-final-delivery-report.json`
  );

  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);

  return {
    success: report.success,
    file,
    report
  };
}

module.exports = {
  buildDeliveryReport,
  writeDeliveryReport,
  PROHIBITED_COMPUTE_POLICY
};
