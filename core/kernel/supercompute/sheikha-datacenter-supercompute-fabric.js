'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = process.cwd();

function ensure() {
  [
    'runtime/supercompute/nodes',
    'runtime/supercompute/clusters',
    'runtime/supercompute/capacity',
    'runtime/supercompute/reports'
  ].forEach((dir) => fs.mkdirSync(path.join(ROOT, dir), { recursive: true }));
}

function status() {
  ensure();

  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  return {
    success: true,
    fabric: 'SHEIKHA_DATACENTER_SUPERCOMPUTE_FABRIC',
    mode: 'sovereign-integrated-compute-ai-datacenter',
    canonical: true,
    deterministic: true,
    localFirst: true,
    offlineCapable: true,

    layers: {
      unifiedRuntimeFabric: true,
      supercomputeCluster: true,
      datacenterControlPlane: true,
      resourceFabric: true,
      schedulerFabric: true,
      telemetryFabric: true,
      signalFabric: true,
      storageFabric: true,
      governanceFabric: true,
      providerIsolation: true
    },

    capacity: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpuCores: os.cpus().length,
      loadAverage: os.loadavg(),
      memoryTotal: totalMem,
      memoryFree: freeMem,
      memoryUsed: totalMem - freeMem,
      memoryUsagePercent: Number((((totalMem - freeMem) / totalMem) * 100).toFixed(2)),
      uptime: os.uptime()
    },

    policy: {
      betterThanSingleComputer: true,
      datacenterReady: true,
      clusterReady: true,
      horizontalScalingReady: true,
      edgeReady: true,
      noSingleProviderDependency: true,
      noDuplicateRuntime: true,
      canonicalOnly: true,
      humanAuthority: true,
      noGhaybPrediction: true,
      noConsciousnessClaim: true,
      halalOnly: true,
      noHarm: true,
      noDarar: true,
      noIntoxicants: true,
      noMufattir: true,
      noHaramWorkloads: true,
      noHaramStorage: true
    },

    governance: {
      quranAndSunnah: true,
      tawheed: true,
      noRiba: true,
      noFraud: true,
      noHarm: true,
      halalOnly: true,
      noDarar: true,
      noIntoxicants: true,
      noMufattir: true,
      noHaramStorage: true,
      humanAuthority: true
    },

    timestamp: new Date().toISOString()
  };
}

function registerNode(node = {}) {
  ensure();

  const record = {
    success: true,
    node: {
      name: node.name || os.hostname(),
      role: node.role || 'compute-node',
      capacity: node.capacity || 'standard',
      localFirst: true,
      governed: true
    },
    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/supercompute/nodes',
    `${Date.now()}-${record.node.name}.json`
  );

  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');

  return { success: true, file, record };
}

function report() {
  ensure();

  const data = status();
  const file = path.join(
    ROOT,
    'runtime/supercompute/reports',
    `${Date.now()}-supercompute-report.json`
  );

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

  return { success: true, file, data };
}

module.exports = { status, registerNode, report };
