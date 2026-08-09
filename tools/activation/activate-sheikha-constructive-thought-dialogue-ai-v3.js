#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  FILES,
  buildIntegrationStatus,
  buildThoughtDialogueMatrix,
  generateConstructiveDialogue,
  sha256
} = require(
  '../../core/gardens-dialogue/' +
    'sheikha-constructive-thought-dialogue-ai-v3'
);

const ROOT = path.resolve(__dirname, '..', '..');

function writeJson(relativePath, value) {
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(
    target,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
}

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  );
}

async function buildIntegrationSelfTest() {
  const intelligenceReport = readJson(FILES.intelligenceReport);
  const localModels = (
    intelligenceReport.localRuntime?.models || []
  ).map((entry) => entry.name).filter(Boolean);
  if (!localModels.length) {
    return {
      system:
        'SHEIKHA_THOUGHT_DIALOGUE_INTEGRATION_SELFTEST_V3',
      generatedAt: new Date().toISOString(),
      passed: false,
      status: 'LOCAL_MODEL_INVENTORY_REQUIRED',
      liveModelInvoked: false,
      outputStored: false
    };
  }

  const result = await generateConstructiveDialogue({
    message:
      'قارن الليبرالية والاشتراكية في مفهوم العدالة',
    frameworkIds: ['LIBERALISM', 'SOCIALISM'],
    audienceContext: 'GENERAL_PUBLIC',
    religiousLensRequested: true,
    mode: 'standard'
  }, {
    persist: false,
    intelligenceOptions: {
      localModels,
      executor: async () => ({
        success: true,
        output: [
          '1. فهم عادل للفكرة مع فصل الغاية عن الوسيلة.',
          '2. الدليل والدليل المضاد يحتاجان مصدرًا وقياسًا.',
          '3. سورة النحل: 125 مرساة للحوار بالحكمة.',
          '4. الخيار السلمي طوعي وقابل للتوقف.',
          '5. أي حكم ديني تفصيلي يحتاج مراجعة بشرية مؤهلة.'
        ].join('\n'),
        metrics: { elapsedMs: 1, evalCount: 18 }
      })
    }
  });

  return {
    schemaVersion: '3.0.0',
    system:
      'SHEIKHA_THOUGHT_DIALOGUE_INTEGRATION_SELFTEST_V3',
    generatedAt: new Date().toISOString(),
    passed:
      result.status === 'AI_CONSTRUCTIVE_DIALOGUE_COMPLETED' &&
      result.dialogueQuality?.passed === true &&
      result.privacy?.rawMessagePersisted === false,
    status: result.status,
    executionKind:
      'DETERMINISTIC_INTEGRATION_SELFTEST_NO_LIVE_MODEL',
    registeredLocalModelCount: localModels.length,
    modelInvocations:
      Number(
        result.intelligence?.execution?.modelInvocations || 0
      ),
    outputSha256: sha256(result.answer),
    outputBytes: Buffer.byteLength(result.answer || ''),
    outputStored: false,
    promptStored: false,
    liveModelInvoked: false,
    externalNetworkUsed: false,
    personProfileCreated: false,
    automatedFatwa: false,
    executionAuthorized: false
  };
}

async function main() {
  const matrix = buildThoughtDialogueMatrix();
  writeJson(FILES.matrix, matrix);

  const selfTest = await buildIntegrationSelfTest();
  writeJson(FILES.integrationEvidence, selfTest);

  const report = buildIntegrationStatus();
  writeJson(FILES.report, report);

  const result = {
    system: report.system,
    status: report.status,
    passed: report.passed,
    coverage: report.coverage,
    intelligenceProvider:
      report.foundations.intelligenceProvider,
    outputs: {
      matrix: FILES.matrix,
      report: FILES.report,
      integrationEvidence: FILES.integrationEvidence
    },
    execution: {
      deterministicIntegrationSelfTestPassed:
        selfTest.passed,
      modelInvokedDuringActivation: false,
      shellExecutedByModel: false,
      externalPublishing: false
    }
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = report.passed ? 0 : 1;
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
