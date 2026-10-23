'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { decideTrainingCycle } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-training-scheduler-v1'
);

const root = path.resolve(__dirname, '../..');
const configPath = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-training-scheduler-config-v1.json');
const statePath = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-training-scheduler-state-v1.json');
const lockPath = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/.training-scheduler.lock');
const once = process.argv.includes('--once');

function readJson(file, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function atomicWrite(file, data) {
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(temporary, file);
}

function gpuSnapshot() {
  try {
    const output = execFileSync('nvidia-smi', [
      '--query-gpu=memory.free,temperature.gpu', '--format=csv,noheader,nounits'
    ], { encoding: 'utf8', timeout: 5000 }).trim().split(',').map(Number);
    return { gpuAvailable: true, freeGpuMiB: output[0], gpuTemperatureC: output[1] };
  } catch {
    return { gpuAvailable: false, freeGpuMiB: 0, gpuTemperatureC: 0 };
  }
}

function cycle() {
  const config = readJson(configPath);
  const previous = readJson(statePath);
  const manifest = readJson(path.join(root, config.datasetManifest));
  const approval = readJson(path.join(root, config.approvalManifest || ''));
  const quarantine = readJson(path.join(root, config.quarantineManifest || ''));
  const approvalMatches = approval.humanTrainingApproval === true &&
    approval.datasetSha256 === manifest.sha256 &&
    approval.status === 'APPROVED_FOR_LOCAL_TRAINING_ONLY';
  const decision = decideTrainingCycle({
    ...config,
    ...gpuSnapshot(),
    availableRamGiB: os.freemem() / (1024 ** 3),
    datasetRecords: manifest.records,
    datasetSha256: manifest.sha256,
    datasetLicenseApproved: manifest.license?.commercialTrainingApproved === true,
    datasetProvenanceVerified: Boolean(manifest.origin),
    piiReviewPassed: manifest.privacy?.reviewStatus === 'PASSED',
    datasetQualityQuarantined: quarantine.status === 'QUALITY_REGRESSION_QUARANTINED' &&
      quarantine.datasetSha256 === manifest.sha256,
    lastTrainingAtMs: previous.lastTrainingAtMs,
    lastTrainedDatasetSha256: previous.lastTrainedDatasetSha256,
    trainingLockActive: fs.existsSync(lockPath),
    humanTrainingApproval: approvalMatches
  });
  const state = {
    system: 'SHEIKHA_TRAINING_SCHEDULER_STATE_V1',
    checkedAt: new Date().toISOString(),
    pid: process.pid,
    decision,
    resources: {
      ...gpuSnapshot(),
      availableRamGiB: Number((os.freemem() / (1024 ** 3)).toFixed(2))
    },
    dataset: {
      id: manifest.datasetId || null,
      records: manifest.records || 0,
      sha256: manifest.sha256 || null
    },
    lastTrainingAtMs: previous.lastTrainingAtMs || null,
    lastTrainedDatasetSha256: previous.lastTrainedDatasetSha256 || null,
    trainingExecutedThisCycle: false,
    evaluationExecutedThisCycle: false
  };

  if (decision.action === 'RUN_TRAIN_EVALUATE_PIPELINE') {
    const lock = fs.openSync(lockPath, 'wx');
    try {
      const training = spawnSync('npm', ['run', '-s', config.trainingCommand], {
        cwd: root, encoding: 'utf8', timeout: 3_600_000
      });
      state.trainingExecutedThisCycle = training.status === 0;
      state.trainingExitCode = training.status;
      if (training.status === 0) {
        const evaluation = spawnSync('npm', ['run', '-s', config.evaluationCommand], {
          cwd: root, encoding: 'utf8', timeout: 900_000
        });
        state.evaluationExecutedThisCycle = true;
        state.evaluationExitCode = evaluation.status;
        state.lastTrainingAtMs = Date.now();
        state.lastTrainedDatasetSha256 = manifest.sha256;
      }
    } finally {
      fs.closeSync(lock);
      fs.unlinkSync(lockPath);
    }
  }
  atomicWrite(statePath, state);
  process.stdout.write(`${JSON.stringify({
    checkedAt: state.checkedAt,
    status: decision.status,
    action: decision.action,
    blockers: decision.blockers,
    trainingExecutedThisCycle: state.trainingExecutedThisCycle
  })}\n`);
}

cycle();
if (!once) setInterval(cycle, Math.max(60_000, readJson(configPath).intervalMs || 900_000));
