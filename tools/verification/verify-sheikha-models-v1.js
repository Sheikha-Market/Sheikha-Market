'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { evaluateModel } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-evaluator-v1'
);

const root = path.resolve(__dirname, '../..');
const inventory = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1.json'
);
const output = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/sheikha-model-evaluation-v1.json'
);
const baseUrl = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

async function generate({ model, prompt, numPredict }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        keep_alive: '5m',
        options: { temperature: 0, num_predict: numPredict }
      })
    });
    if (!response.ok) throw new Error(`OLLAMA_HTTP_${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  const models = inventory.models.filter((model) =>
    model.governorState === 'ELIGIBLE_FOR_EVALUATION');
  const evaluations = [];
  for (const model of models) {
    evaluations.push(await evaluateModel(model.name, { generate }));
  }
  const report = {
    system: 'SHEIKHA_MODEL_EVALUATION_V1',
    generatedAt: new Date().toISOString(),
    status: evaluations.every((result) => result.status === 'EVALUATION_PASSED')
      ? 'ALL_ELIGIBLE_MODELS_PASSED'
      : 'EVALUATION_GAPS_FOUND',
    evaluations,
    boundaries: {
      localInferenceOnly: true,
      externalNetworkUsed: false,
      modelWeightsModified: false,
      productionCertified: false,
      benchmarkScope: 'THREE_TARGETED_FUNCTIONAL_CASES'
    }
  };
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    models: evaluations.map((evaluation) => ({
      model: evaluation.model,
      status: evaluation.status,
      score: `${evaluation.passedCount}/${evaluation.totalCount}`
    })),
    output: path.relative(root, output)
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
