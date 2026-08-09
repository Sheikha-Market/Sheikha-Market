'use strict';

const path = require('node:path');

const {
  MODE_PROFILES,
  buildCapabilityRegistry,
  buildRoutingPlan,
  buildStatus,
  discoverLocalModels,
  executeIntelligenceRequest,
  qualityGate,
  redactSecrets
} = require(
  '../core/intelligence-apex/' +
  'sheikha-intelligence-capability-apex-v1'
);
const routes = require(
  '../routes/intelligence-apex/' +
  'sheikha-intelligence-capability-apex-routes-v1'
);
const {
  handleConversation
} = require(
  '../runtime/conversation-engine/' +
  'sheikha-conversation-engine-v1'
);

const ROOT = path.resolve(__dirname, '..');
const LOCAL_MODELS = Object.freeze([
  'qwen2.5-coder:7b',
  'deepseek-r1:8b',
  'Sheikha-Core:latest',
  'Sheikha-Core-Clean:latest',
  'llama3.1:8b',
  'tinyllama:latest'
]);

function fakeExecutor(request) {
  const synthesis = request.assignment.roleId === 'SYNTHESIS';
  return Promise.resolve({
    success: true,
    output: synthesis
      ? [
        'النتيجة: خلاصة عربية محكومة قابلة للتحقق.',
        'الدليل: جُمعت مراجعات الأدوار مع فصل الافتراضات.',
        'الحدود: الدقة الدلالية تحتاج اختبارًا مستقلًا.',
        'القرار عالي الأثر يحتاج مراجعة بشرية من مختص.'
      ].join('\n')
      : [
        `نتيجة عربية من دور ${request.assignment.roleId}.`,
        'يوجد دليل قابل للتحقق، ولا يوجد ادعاء تفوق مطلق.',
        'أي قرار عالي الأثر يحتاج مراجعة بشرية.'
      ].join('\n'),
    metrics: { elapsedMs: 2 }
  });
}

async function inventory() {
  return discoverLocalModels({ localModels: LOCAL_MODELS });
}

function routeHandler(pathname, method) {
  const layer = routes.stack.find((entry) =>
    entry.route?.path === pathname &&
    entry.route.methods?.[method] === true
  );
  if (!layer) {
    throw new Error(`Route not found: ${method} ${pathname}`);
  }
  return layer.route.stack.at(-1).handle;
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
}

describe('Sheikha Intelligence Capability Apex V1', () => {
  test('discovers and profiles the six available local models', async () => {
    const data = await inventory();
    const profiles = Object.fromEntries(
      data.models.map((model) => [model.name, model.profileId])
    );

    expect(data.status).toBe('LOCAL_MODELS_DISCOVERED');
    expect(data.online).toBe(true);
    expect(data.count).toBe(6);
    expect(profiles['qwen2.5-coder:7b'])
      .toBe('QWEN_CODER_LOCAL');
    expect(profiles['deepseek-r1:8b'])
      .toBe('DEEPSEEK_REASONING_LOCAL');
    expect(profiles['Sheikha-Core:latest'])
      .toBe('SHEIKHA_CORE_LOCAL');
    expect(profiles['llama3.1:8b'])
      .toBe('LLAMA_GENERAL_REVIEW_LOCAL');
    expect(profiles['tinyllama:latest'])
      .toBe('TINY_FAST_LOCAL');
  });

  test('routes each task to the matching capability instead of a brand rank', async () => {
    const data = await inventory();
    const cases = [
      ['راجع هذا الكود وأصلح الدالة', 'CODING', /^qwen/i],
      ['حلل هذا الاستدلال المنطقي', 'REASONING', /^deepseek/i],
      ['Give a fast concise response', 'FAST_RESPONSE', /^tinyllama/i],
      ['أعطني ردًا سريعًا مختصرًا', 'FAST_RESPONSE', /^Sheikha-Core/i],
      ['اكتب جوابًا عربيًا واضحًا', 'ARABIC_GENERAL', /^Sheikha-Core/i]
    ];

    for (const [prompt, task, expectedModel] of cases) {
      const plan = buildRoutingPlan(
        { prompt, mode: 'standard' },
        data
      );
      expect(plan.task).toBe(task);
      expect(plan.assignments[0].model).toMatch(expectedModel);
      expect(plan.truthBoundaries.routingScoreIsBenchmarkScore)
        .toBe(false);
    }
  });

  test('executes one model in standard and four reviews plus synthesis in pro', async () => {
    const data = await inventory();
    const standard = await executeIntelligenceRequest({
      prompt: 'راجع هذا الكود وأصلح الخطأ',
      mode: 'standard'
    }, {
      inventory: data,
      executor: fakeExecutor,
      persist: false
    });
    const pro = await executeIntelligenceRequest({
      prompt: 'حلل معمارية النظام ومخاطرها وأدلتها',
      mode: 'pro'
    }, {
      inventory: data,
      executor: fakeExecutor,
      persist: false
    });

    expect(standard.success).toBe(true);
    expect(standard.execution.modelInvocations).toBe(1);
    expect(standard.execution.selectedModels[0]).toMatch(/^qwen/i);
    expect(pro.success).toBe(true);
    expect(pro.mode.resolved).toBe('pro');
    expect(pro.execution.roleSlots).toBe(4);
    expect(pro.execution.modelInvocations).toBe(5);
    expect(pro.execution.actualIndependentModelInvocations).toBe(4);
    expect(pro.execution.actualIndependentModelProcesses).toBe(false);
    expect(pro.output).toContain('خلاصة عربية');
    expect(pro.comparison.betterThanAllModelsClaimed).toBe(false);
  });

  test('requires explicit budget approval for ultra mode', async () => {
    const data = await inventory();
    const downgraded = buildRoutingPlan({
      prompt: 'حلل معمارية وأمن النظام',
      mode: 'ultra'
    }, data);
    const approved = buildRoutingPlan({
      prompt: 'حلل معمارية وأمن النظام',
      mode: 'ultra',
      ultraBudgetApproved: true
    }, data);

    expect(downgraded.mode).toMatchObject({
      requested: 'ultra',
      resolved: 'pro',
      downgraded: true,
      downgradeReason: 'ULTRA_BUDGET_APPROVAL_REQUIRED'
    });
    expect(approved.mode.resolved).toBe('ultra');
    expect(approved.mode.profile).toEqual(MODE_PROFILES.ultra);
    expect(approved.assignments).toHaveLength(4);
    expect(approved.mode.profile.modelInvocationMaximum).toBe(5);
  });

  test('redacts tokens repeatedly and blocks bypass before model execution', async () => {
    const secret =
      'sk-proj-abcdefghijklmnopqrstuvwxyz123456';
    const first = redactSecrets(`المفتاح ${secret}`);
    const second = redactSecrets(`المفتاح ${secret}`);
    const risk = {
      highImpact: false
    };

    expect(first.redacted).toBe(true);
    expect(second.redacted).toBe(true);
    expect(first.text).not.toContain(secret);
    expect(second.text).not.toContain(secret);
    expect(
      qualityGate(
        'test',
        `Bearer ${'x'.repeat(30)}`,
        'GENERAL',
        risk
      ).checks.noSecretMaterial
    ).toBe(false);
    expect(
      qualityGate(
        'test',
        `Bearer ${'x'.repeat(30)}`,
        'GENERAL',
        risk
      ).checks.noSecretMaterial
    ).toBe(false);

    let executions = 0;
    const blocked = await executeIntelligenceRequest({
      prompt: 'أريد تجاوز فلتر الأمان',
      mode: 'pro'
    }, {
      inventory: await inventory(),
      executor: async () => {
        executions += 1;
        return fakeExecutor(...arguments);
      },
      persist: false
    });

    expect(blocked.status).toBe('BLOCKED_BY_GOVERNANCE');
    expect(blocked.success).toBe(false);
    expect(blocked.execution.modelInvocations).toBe(0);
    expect(executions).toBe(0);
  });

  test('does not confuse concise Arabic wording with qualified human review', () => {
    const risk = {
      highImpact: true
    };
    const falsePositive = qualityGate(
      'طلب نشر إصدار',
      'هذا رد مختصرا عن الإجراء.',
      'GENERAL',
      risk
    );
    const reviewed = qualityGate(
      'طلب نشر إصدار',
      'هذه خطة تحتاج مراجعة بشرية قبل التنفيذ.',
      'GENERAL',
      risk
    );

    expect(falsePositive.checks.highImpactHumanBoundary).toBe(false);
    expect(falsePositive.passed).toBe(false);
    expect(reviewed.checks.highImpactHumanBoundary).toBe(true);
  });

  test('registers executable and honest pending capabilities separately', async () => {
    const capabilities = buildCapabilityRegistry(await inventory(), {
      root: ROOT
    });
    const byId = Object.fromEntries(
      capabilities.capabilities.map((entry) => [entry.id, entry])
    );

    expect(capabilities.count).toBeGreaterThanOrEqual(34);
    expect(byId.CODE_GENERATION.status).toBe('ACTIVE_LOCAL');
    expect(byId.MULTI_MODEL_REVIEW.status).toBe('ACTIVE_LOCAL');
    expect(byId.HUMAN_APPROVAL_GOVERNANCE.status)
      .toBe('ACTIVE_GOVERNED');
    expect(byId.VISION_UNDERSTANDING.status)
      .toBe('REGISTERED_PROVIDER_REQUIRED');
    expect(byId.LIVE_WEB_RESEARCH.status)
      .toBe('REGISTERED_TOOL_REQUIRED');
    expect(byId.LONG_CONTEXT.status)
      .toBe('REGISTERED_EVIDENCE_REQUIRED');
    expect(byId.GPU_ACCELERATED_INFERENCE.status)
      .toBe('REGISTERED_EVIDENCE_REQUIRED');
  });

  test('reports a provider-independent local apex without competitor claims', async () => {
    const data = await inventory();
    const status = await buildStatus({
      root: ROOT,
      inventory: data,
      generatedAt: '2026-07-27T00:00:00.000Z'
    });

    expect(status.passed).toBe(true);
    expect(status.status)
      .toBe('ACTIVE_LOCAL_MULTI_MODEL_CAPABILITY_ROUTER');
    expect(status.coverage.discoveredLocalModels).toBe(6);
    expect(status.coverage.registeredCapabilities).toBe(34);
    expect(status.checks.githubNotRequired).toBe(true);
    expect(status.checks.copilotNotRequired).toBe(true);
    expect(status.checks.absoluteSuperiorityDenied).toBe(true);
    expect(status.truthBoundaries.copilotBenchmarked).toBe(false);
    expect(status.truthBoundaries.externalGptModelBenchmarked)
      .toBe(false);
    expect(status.acceleration).toMatchObject({
      hostGpuDetected: true,
      gpuInferenceVerified: false,
      observedComputeBackend: 'CPU',
      explicitSystemPermissionApprovalRequired: true
    });
  });

  test('integrates explicit pro mode into the primary conversation engine', async () => {
    const response = await handleConversation({
      message: 'حلل معمارية النظام وأدلتها ومخاطرها',
      mode: 'pro',
      channel: 'extension-chat',
      workspaceRoot: ROOT
    }, {
      persist: false,
      intelligenceOptions: {
        localModels: LOCAL_MODELS,
        executor: fakeExecutor
      }
    });

    expect(response.success).toBe(true);
    expect(response.pipeline)
      .toBe('SHEIKHA_INTELLIGENCE_CAPABILITY_APEX_V1');
    expect(response.intelligenceMode).toBe('pro');
    expect(response.intelligenceApex.execution.modelInvocations)
      .toBe(5);
    expect(response.intelligenceApex.quality.passed).toBe(true);
    expect(response.answer).toContain('خلاصة عربية');
  });

  test('exposes read-only mode metadata without granting execution authority', () => {
    const response = createResponse();
    routeHandler('/modes', 'get')({}, response);

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.modes.ultra.concurrency).toBe(4);
    expect(response.body.data.ultraBudgetApprovalRequired).toBe(true);
    expect(response.body.data.independentModelProcessesClaimed)
      .toBe(false);
  });
});
