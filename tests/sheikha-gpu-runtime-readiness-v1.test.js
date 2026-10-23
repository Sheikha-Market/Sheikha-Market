'use strict';

const { inspectGpuRuntime } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-gpu-runtime-readiness-v1'
);

test('separates GPU detection from Ollama GPU execution', () => {
  const execute = (command) => command === 'nvidia-smi'
    ? 'NVIDIA RTX 4060, 580, 8188, 7000, 50'
    : 'NAME ID SIZE PROCESSOR CONTEXT UNTIL\nqwen x 3 GB 100% CPU 4096 1m';
  const report = inspectGpuRuntime({ env: {}, execute });
  expect(report.local.gpuDetected).toBe(true);
  expect(report.local.ollamaGpuInferenceVerified).toBe(false);
  expect(report.external.activeGpuProviderCount).toBe(0);
});

test('never activates a provider from credential presence alone', () => {
  const report = inspectGpuRuntime({
    env: { AWS_ACCESS_KEY_ID: 'present', AWS_SECRET_ACCESS_KEY: 'present' },
    execute: () => ''
  });
  const aws = report.external.providers.find((provider) => provider.id === 'AWS');
  expect(aws.credentialsPresent).toBe(true);
  expect(aws.routeEnabled).toBe(false);
  expect(report.secretsExposed).toBe(false);
});
