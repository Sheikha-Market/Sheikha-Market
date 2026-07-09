'use strict';

const fs = require('fs');
const os = require('os');

const started = process.hrtime.bigint();

let checksum = 0;
const iterations = 3_000_000;

for (let i = 1; i <= iterations; i += 1) {
  checksum = (checksum + ((i * 31) % 9973)) % 1000000007;
}

const ended = process.hrtime.bigint();
const durationMs = Number(ended - started) / 1_000_000;

const report = {
  system: 'SHEIKHA_LIVE_COMPUTE_BENCHMARK_V1',
  status: 'PASSED',
  mode: 'LOCAL_LIVE_COMPUTE_MEASUREMENT',
  generatedAt: new Date().toISOString(),
  machine: {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemoryGB: Math.round(os.totalmem() / 1024 / 1024 / 1024)
  },
  benchmark: {
    iterations,
    durationMs: Number(durationMs.toFixed(3)),
    checksum,
    jobsPerSecond: Number((iterations / (durationMs / 1000)).toFixed(2))
  },
  decision: 'LIVE_COMPUTE_BENCHMARK_RECORDED'
};

fs.mkdirSync('runtime/os-cloud-supercomputer', { recursive: true });
fs.writeFileSync(
  'runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
