'use strict';

const {
  plan
} = require('../../autonomous-enterprise-fabric/v1/sheikha-autonomous-enterprise-fabric-v1');

const {
  routeTask,
  saveVector,
  appendEvent
} = require('../../ha-ai-production-fabric/v1/sheikha-ha-ai-production-fabric-v1');

const {
  generateWithSheikhaCore,
  fastLeast
} = require('../../model-core/v1/sheikha-ollama-core-v1');

function status() {
  return {
    success: true,
    system: 'SHEIKHA_AUTONOMOUS_EXECUTION_BRIDGE_V1',
    status: 'ACTIVE',
    apexLevel: 26,
    role: 'GOVERNED_EXECUTION_BRIDGE',
    bindings: {
      autonomousEnterpriseFabric: 'BOUND',
      haAiProductionFabric: 'BOUND',
      modelCore: 'BOUND',
      eventBus: 'BOUND',
      vectorMemory: 'BOUND'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      destructiveWrite: false,
      envMutation: false,
      secretExposure: false,
      humanApprovalForCriticalChanges: true
    }
  };
}

async function execute(message = '', options = {}) {
  const text = String(message || '').trim();

  const enterprisePlan = plan(text);
  const routed = routeTask(text, options.mode || 'smart');

  appendEvent('AUTONOMOUS_EXECUTION_REQUESTED', {
    message: text.slice(0, 500),
    agent: enterprisePlan.agent,
    model: routed.model
  });

  saveVector(null, text, {
    source: 'autonomous-execution-bridge',
    agent: enterprisePlan.agent,
    model: routed.model
  });

  const safeMode = options.safeMode !== false;
  const isCritical =
    /\.env|secret|token|password|rm -rf|drop table|truncate|delete database/i.test(text);

  if (isCritical) {
    return {
      success: true,
      system: 'SHEIKHA_AUTONOMOUS_EXECUTION_BRIDGE_V1',
      status: 'BLOCKED_FOR_HUMAN_REVIEW',
      plan: enterprisePlan,
      routed,
      answer: 'تم منع التنفيذ الآلي لأن الطلب قد يتضمن أسرارًا أو عملية حرجة. يلزم مراجعة بشرية.',
      governance: status().governance
    };
  }

  try {
    const result = safeMode
      ? await generateWithSheikhaCore(text, {
          mode: options.mode || 'smart',
          timeoutMs: options.timeoutMs || 180000,
          numPredict: options.numPredict || 160
        })
      : await fastLeast(text);

    appendEvent('AUTONOMOUS_EXECUTION_COMPLETED', {
      agent: enterprisePlan.agent,
      model: result.model,
      success: result.success
    });

    return {
      success: true,
      system: 'SHEIKHA_AUTONOMOUS_EXECUTION_BRIDGE_V1',
      status: 'EXECUTED_GOVERNED',
      plan: enterprisePlan,
      routed,
      result,
      answer: result.answer,
      governance: status().governance
    };
  } catch (error) {
    const fallback = await fastLeast(text);

    appendEvent('AUTONOMOUS_EXECUTION_FALLBACK', {
      agent: enterprisePlan.agent,
      error: error.message
    });

    return {
      success: true,
      system: 'SHEIKHA_AUTONOMOUS_EXECUTION_BRIDGE_V1',
      status: 'EXECUTED_WITH_FALLBACK',
      plan: enterprisePlan,
      routed,
      result: fallback,
      answer: fallback.answer,
      error: error.message,
      governance: status().governance
    };
  }
}

module.exports = {
  status,
  execute
};
