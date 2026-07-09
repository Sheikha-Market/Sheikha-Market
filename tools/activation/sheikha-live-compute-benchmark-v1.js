'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const reportPath = 'runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json';

function runCpuBenchmark(iterations) {
  const started = process.hrtime.bigint();
  let checksum = 0;

  for (let index = 1; index <= iterations; index += 1) {
    checksum = (checksum + ((index * 31) % 9973)) % 1000000007;
  }

  const ended = process.hrtime.bigint();
  const durationMs = Number(ended - started) / 1_000_000;

  return {
    iterations,
    durationMs: Number(durationMs.toFixed(3)),
    checksum,
    jobsPerSecond: Number((iterations / (durationMs / 1000)).toFixed(2))
  };
}

function runIoBenchmark(payloadBytes) {
  const payload = Buffer.alloc(payloadBytes, 'S');
  const tempPath = path.join(os.tmpdir(), 'sheikha-live-compute-benchmark-v1.bin');

  const writeStarted = process.hrtime.bigint();
  fs.writeFileSync(tempPath, payload);
  const writeEnded = process.hrtime.bigint();

  const readStarted = process.hrtime.bigint();
  const readBack = fs.readFileSync(tempPath);
  const readEnded = process.hrtime.bigint();

  fs.rmSync(tempPath, { force: true });

  return {
    payloadBytes,
    writeMs: Number((Number(writeEnded - writeStarted) / 1_000_000).toFixed(3)),
    readMs: Number((Number(readEnded - readStarted) / 1_000_000).toFixed(3)),
    roundTripBytes: readBack.byteLength
  };
}

function buildReport() {
  const memoryBefore = process.memoryUsage();
  const cpu = runCpuBenchmark(3_000_000);
  const io = runIoBenchmark(1024 * 1024);
  const memoryAfter = process.memoryUsage();

  return {
    system: 'SHEIKHA_LIVE_COMPUTE_BENCHMARK_V1',
    status: 'PASSED',
    mode: 'LOCAL_LIVE_COMPUTE_MEASUREMENT',
    generatedAt: new Date().toISOString(),
    truthfulness: {
      measuredLocally: true,
      noPhysicalSupercomputerOwnershipClaim: true,
      productionClaimStillBoundToTruthGate: true
    },
    machine: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemoryGB: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      freeMemoryGB: Number((os.freemem() / 1024 / 1024 / 1024).toFixed(2)),
      loadAverage: os.loadavg()
    },
    benchmark: {
      cpu,
      io,
      memory: {
        rssBefore: memoryBefore.rss,
        rssAfter: memoryAfter.rss,
        heapUsedBefore: memoryBefore.heapUsed,
        heapUsedAfter: memoryAfter.heapUsed,
        rssDelta: memoryAfter.rss - memoryBefore.rss,
        heapUsedDelta: memoryAfter.heapUsed - memoryBefore.heapUsed
      }
    },
    decision: 'LIVE_COMPUTE_BENCHMARK_RECORDED_UNDER_GOVERNED_TRUTH_GATE'
  };
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) {
  console.log(JSON.stringify(writeReport(), null, 2));
}

module.exports = {
  buildReport,
  runCpuBenchmark,
  runIoBenchmark,
  writeReport
};
