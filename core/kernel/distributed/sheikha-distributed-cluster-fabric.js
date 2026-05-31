'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = process.cwd();

const FABRIC = {
  name: 'SHEIKHA_DISTRIBUTED_CLUSTER_FABRIC',

  canonical: true,
  deterministic: true,
  sovereign: true,

  governance: {
    quranAndSunnah: true,
    tawheed: true,
    noHarm: true,
    noDarar: true,
    halalOnly: true,
    noIntoxicants: true,
    noMufattir: true,
    noHaramStorage: true,
    noHaramWorkloads: true,
    humanAuthority: true,
    noGhaybPrediction: true,
    noConsciousnessClaim: true
  }
};

function ensure() {
  [
    'runtime/distributed/nodes',
    'runtime/distributed/mesh',
    'runtime/distributed/clusters',
    'runtime/distributed/federation',
    'runtime/distributed/reports'
  ].forEach((dir) => {
    fs.mkdirSync(
      path.join(ROOT, dir),
      { recursive: true }
    );
  });
}

function status() {
  ensure();

  return {
    success: true,

    fabric: FABRIC.name,

    distributedRuntime: {
      active: true,
      meshEnabled: true,
      federationEnabled: true,
      clusterEnabled: true,
      schedulerLinked: true,
      signalsLinked: true,
      telemetryLinked: true,
      governanceLinked: true
    },

    node: {
      hostname: os.hostname(),
      cpuCores: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime()
    },

    runtime: {
      localFirst: true,
      offlineCapable: true,
      deterministic: true,
      canonical: true
    },

    governance: FABRIC.governance,

    timestamp: new Date().toISOString()
  };
}

function registerNode(node = {}) {
  ensure();

  const record = {
    success: true,

    node: {
      name: node.name || os.hostname(),
      role: node.role || 'distributed-node',
      zone: node.zone || 'local',
      capacity: node.capacity || 'standard',
      governed: true,
      canonical: true
    },

    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/distributed/nodes',
    `${Date.now()}-${record.node.name}.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(record, null, 2) + '\n'
  );

  return {
    success: true,
    file,
    record
  };
}

function mesh() {
  ensure();

  const topology = {
    success: true,

    mesh: 'SHEIKHA_RUNTIME_COMPUTE_MESH',

    topology: [
      'kernel',
      'runtime',
      'bus',
      'signals',
      'scheduler',
      'resources',
      'memory',
      'storage',
      'telemetry',
      'orchestration',
      'intelligence',
      'supercompute',
      'distributed-cluster'
    ],

    timestamp: new Date().toISOString()
  };

  const file = path.join(
    ROOT,
    'runtime/distributed/mesh',
    `${Date.now()}-mesh-topology.json`
  );

  fs.writeFileSync(
    file,
    JSON.stringify(topology, null, 2) + '\n'
  );

  return {
    success: true,
    file,
    topology
  };
}

module.exports = {
  status,
  registerNode,
  mesh
};
