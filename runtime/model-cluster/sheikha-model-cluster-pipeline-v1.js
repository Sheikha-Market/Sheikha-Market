'use strict';

const cp = require('child_process');

function run(cmd) {
  try {
    return cp.execSync(cmd, {
      cwd: '/opt/sheikha/current',
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 8000
    }).trim();
  } catch {
    return '';
  }
}

function detectModels() {
  const ollama = run('command -v ollama >/dev/null 2>&1 && ollama list || true');
  const models = [];

  if (ollama) {
    for (const line of ollama.split('\n').slice(1)) {
      const name = line.trim().split(/\s+/)[0];
      if (name) models.push({ provider: 'ollama', name, status: 'AVAILABLE' });
    }
  }

  if (!models.length) {
    models.push({ provider: 'runtime', name: 'sheikha-rule-agent', status: 'AVAILABLE' });
  }

  return models;
}

function routeTask(message) {
  const text = String(message || '');
  if (/كود|برمج|debug|دبق|ديبنق|fix|test|خطأ/i.test(text)) return 'coding';
  if (/وثائق|حوكمة|معمارية|اشرح|ابحث|rag/i.test(text)) return 'rag';
  if (/تقرير|حلل|تحليل|افحص/i.test(text)) return 'report';
  if (/شعار|مخطط|رسم|graphics|diagram/i.test(text)) return 'graphics';
  return 'general';
}

function pipelinePlan(message) {
  const task = routeTask(message);
  const stages = ['governance', 'intent', 'model-selection'];

  if (task === 'coding') stages.push('code-agent', 'cli-readonly', 'validation');
  else if (task === 'rag') stages.push('rag-search', 'evidence-compose');
  else if (task === 'report') stages.push('cli-readonly', 'rag-search', 'report-compose');
  else if (task === 'graphics') stages.push('graphics-plan', 'asset-export-plan');
  else stages.push('agent-response');

  return {
    cluster: 'SHEIKHA_MODEL_CLUSTER_V1',
    scheduler: 'SHEIKHA_PIPELINE_SCHEDULER_V1',
    task,
    stages,
    models: detectModels()
  };
}

module.exports = { detectModels, pipelinePlan };
