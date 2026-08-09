'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  buildDialoguePlan
} = require(
  '../core/gardens-dialogue/' +
    'sheikha-gardens-knowledge-dialogue-runtime-v2'
);
const {
  buildIntegrationStatus,
  buildThoughtDialogueMatrix,
  detectConstructiveDialogueTopic,
  generateConstructiveDialogue,
  listAudienceContexts,
  normalizeAudienceContext
} = require(
  '../core/gardens-dialogue/' +
    'sheikha-constructive-thought-dialogue-ai-v3'
);
const routes = require(
  '../routes/gardens-dialogue/' +
    'sheikha-constructive-thought-dialogue-ai-routes-v3'
);
const {
  handleConversation
} = require(
  '../runtime/conversation-engine/' +
    'sheikha-conversation-engine-v1'
);

const LOCAL_MODELS = Object.freeze([
  'qwen2.5-coder:7b',
  'deepseek-r1:8b',
  'Sheikha-Core:latest',
  'Sheikha-Core-Clean:latest',
  'llama3.1:8b',
  'tinyllama:latest'
]);

function safeExecutor(requestData) {
  return Promise.resolve({
    success: true,
    output: [
      '1. فهم عادل للفكرة: لكل إطار غاية معلنة وسياق مختلف.',
      '2. الغايات والدعاوى والوسائل: يلزم فصل العدالة المقصودة عن آلية تحقيقها.',
      '3. مواضع الاتفاق والاختلاف: حماية الكرامة وتقليل الظلم أرضية مشتركة.',
      '4. الدليل والدليل المضاد: يلزم مصدر أولي وقياس للأثر واعتراض قوي.',
      '5. مرجعية القيم: سورة النحل: 125 توجه إلى الحوار بالحكمة.',
      '6. خيار سلمي: تجربة محدودة طوعية مع مؤشر وتظلم وتوقف.',
      '7. سؤال متابعة: ما تعريف العدالة والنتيجة القابلة للقياس؟',
      'الحدود: لا يثبت هذا صحة إطار، وأي حكم ديني تفصيلي يحتاج مراجعة بشرية مؤهلة.'
    ].join('\n'),
    metrics: {
      elapsedMs: 2,
      evalCount: 20
    },
    requestRole: requestData.assignment.roleId
  });
}

function intelligenceOptions(executor = safeExecutor) {
  return {
    localModels: LOCAL_MODELS,
    executor
  };
}

function routeHandler(router, pathname, method) {
  const layer = router.stack.find((entry) =>
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

describe('Sheikha Constructive Thought Dialogue AI V3', () => {
  test('integrates all registered frameworks without classifying people', () => {
    const matrix = buildThoughtDialogueMatrix();
    const audiences = listAudienceContexts();

    expect(matrix.coverage).toEqual({
      contemporary: 19,
      historical: 18,
      total: 37
    });
    expect(matrix.frameworks).toHaveLength(37);
    expect(matrix.classificationTarget).toBe(
      'IDEAS_AND_EXPLICITLY_SELECTED_LENSES_ONLY'
    );
    expect(audiences.count).toBe(6);
    expect(audiences.boundaries).toMatchObject({
      politicalIdentityInference: false,
      religiousIdentityInference: false,
      religiousSchoolInference: false,
      individualScoring: false
    });
  });

  test('uses an explicitly selected non-sensitive audience context', () => {
    const context = normalizeAudienceContext({
      audienceContext: 'RESEARCHER'
    });

    expect(context.id).toBe('RESEARCHER');
    expect(context.source).toBe('EXPLICIT_USER_SELECTION');
    expect(context.inferredSensitiveTraits).toBe(false);
    expect(() => normalizeAudienceContext({
      audienceContext: 'HIDDEN_RELIGIOUS_PROFILE'
    })).toThrow('Unknown non-sensitive audience context');
  });

  test('detects an explicit idea dialogue without inferring identity', () => {
    const detected = detectConstructiveDialogueTopic(
      'قارن الليبرالية والاشتراكية في العدالة'
    );
    const personalStatement = detectConstructiveDialogueTopic(
      'أنا مهتم بالعدالة'
    );

    expect(detected.matched).toBe(true);
    expect(detected.candidates.length).toBeGreaterThan(0);
    expect(detected.classificationBoundary).toBe(
      'IDEA_TOPIC_DETECTION_NOT_PERSON_IDENTITY_INFERENCE'
    );
    expect(personalStatement.matched).toBe(false);
  });

  test('generates an Arabic AI dialogue with approved method metadata', async () => {
    const response = await generateConstructiveDialogue({
      message:
        'قارن الليبرالية والاشتراكية في مفهوم العدالة',
      frameworkIds: ['LIBERALISM', 'SOCIALISM'],
      audienceContext: 'GENERAL_PUBLIC',
      religiousLensRequested: true,
      mode: 'standard'
    }, {
      intelligenceOptions: intelligenceOptions(),
      persist: false
    });

    expect(response.status).toBe(
      'AI_CONSTRUCTIVE_DIALOGUE_COMPLETED'
    );
    expect(response.aiOutputReturned).toBe(true);
    expect(response.subject.selectedFrameworks).toEqual([
      'LIBERALISM',
      'SOCIALISM'
    ]);
    expect(response.subject.personIdeologyInferred).toBe(false);
    expect(response.methodAnchors).toHaveLength(8);
    expect(response.intelligence.execution.modelInvocations).toBe(1);
    expect(response.dialogueQuality.passed).toBe(true);
    expect(response.answer).toContain('سورة النحل: 125');
    expect(response.privacy.rawMessagePersisted).toBe(false);
    expect(response.governance.automatedFatwa).toBe(false);
  });

  test('denies text-only person classification before invoking AI', async () => {
    let modelInvocations = 0;
    const classified = buildDialoguePlan({
      message:
        'صنف أيديولوجية الشخص صاحب هذا النص'
    });
    const response = await generateConstructiveDialogue({
      message:
        'صنف أيديولوجية الشخص صاحب هذا النص',
      religiousLensRequested: true
    }, {
      intelligenceOptions: intelligenceOptions(async () => {
        modelInvocations += 1;
        return {
          success: true,
          output: 'يجب ألا يصل التنفيذ إلى هذا الموضع.',
          metrics: { elapsedMs: 1 }
        };
      }),
      persist: false
    });

    expect(classified.status).toBe('SAFE_REDIRECTION_REQUIRED');
    expect(response.status).toBe('SAFE_REDIRECTION_REQUIRED');
    expect(response.intelligence.modelInvocations).toBe(0);
    expect(response.plan.personProfileCreated).toBe(false);
    expect(modelInvocations).toBe(0);
  });

  test('suppresses unsafe or unregistered AI output', async () => {
    const response = await generateConstructiveDialogue({
      message: 'ناقش العدالة والمصلحة العامة',
      frameworkIds: ['COMMUNITARIANISM'],
      religiousLensRequested: true
    }, {
      intelligenceOptions: intelligenceOptions(async () => ({
        success: true,
        output: [
          'أنت ليبرالي ويجب إجبارهم على قبول الفكرة.',
          'سورة غير مسجلة: 999.',
          'تحتاج مراجعة بشرية مؤهلة.'
        ].join('\n'),
        metrics: { elapsedMs: 1, evalCount: 10 }
      })),
      persist: false
    });

    expect(response.status).toBe(
      'PLAN_READY_AI_OUTPUT_REVIEW_REQUIRED'
    );
    expect(response.aiOutputReturned).toBe(false);
    expect(response.aiOutputSuppressed).toBe(true);
    expect(response.dialogueQuality.passed).toBe(false);
    expect(response.dialogueQuality.failed).toContain(
      'noPersonIdeologyClaim'
    );
    expect(response.dialogueQuality.failed).toContain(
      'noCoerciveOrTargetedPersuasion'
    );
    expect(response.answer).not.toContain('يجب إجبارهم');
  });

  test('exposes governed API routes with injectable local execution', async () => {
    const testRoutes = routes.createRouter({
      intelligenceOptions: intelligenceOptions(),
      persist: false
    });
    const status = createResponse();
    const matrix = createResponse();
    const response = createResponse();

    routeHandler(testRoutes, '/status', 'get')({}, status);
    routeHandler(
      testRoutes,
      '/frameworks/matrix',
      'get'
    )({}, matrix);
    await routeHandler(testRoutes, '/respond', 'post')({
      body: {
        message: 'قارن الليبرالية والاشتراكية',
        frameworkIds: ['LIBERALISM', 'SOCIALISM'],
        audienceContext: 'LEARNER',
        religiousLensRequested: true
      }
    }, response);

    expect(status.statusCode).toBe(200);
    expect(status.body.data.coverage.totalThoughtFrameworks).toBe(37);
    expect(matrix.body.data.frameworks).toHaveLength(37);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.status).toBe(
      'AI_CONSTRUCTIVE_DIALOGUE_COMPLETED'
    );
    expect(response.body.data.audience.id).toBe('LEARNER');
  });

  test('integrates explicit constructive mode into the main chat', async () => {
    const response = await handleConversation({
      message:
        'قارن الليبرالية والاشتراكية في مفهوم العدالة',
      audienceContext: 'COMMUNITY_FACILITATOR',
      frameworkIds: ['LIBERALISM', 'SOCIALISM'],
      religiousLensRequested: true,
      mode: 'standard',
      channel: 'extension-chat'
    }, {
      persist: false,
      intelligenceOptions: intelligenceOptions()
    });

    expect(response.success).toBe(true);
    expect(response.pipeline).toBe(
      'SHEIKHA_CONSTRUCTIVE_THOUGHT_DIALOGUE_AI_V3'
    );
    expect(response.intent).toBe('CONSTRUCTIVE_THOUGHT_DIALOGUE');
    expect(response.thoughtDialogue.status).toBe(
      'AI_CONSTRUCTIVE_DIALOGUE_COMPLETED'
    );
    expect(response.thoughtDialogue.audience.id).toBe(
      'COMMUNITY_FACILITATOR'
    );
    expect(response.answer).toContain('فهم عادل');
  });

  test('persists hashes only when constructive dialogue audit is enabled', async () => {
    const rootDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'sheikha-thought-dialogue-')
    );
    try {
      const response = await handleConversation({
        message:
          'قارن الليبرالية والاشتراكية في مفهوم العدالة',
        audienceContext: 'GENERAL_PUBLIC',
        frameworkIds: ['LIBERALISM', 'SOCIALISM'],
        religiousLensRequested: true,
        mode: 'standard',
        channel: 'extension-chat',
        memoryConsent: true
      }, {
        rootDir,
        persist: true,
        intelligenceOptions: intelligenceOptions()
      });
      const latestPath = path.join(
        rootDir,
        'runtime/reports/conversation-engine/latest.json'
      );
      const auditPath = path.join(
        rootDir,
        'runtime/audit/sheikha-conversation-engine-audit.jsonl'
      );
      const latest = JSON.parse(
        fs.readFileSync(latestPath, 'utf8')
      );
      const audit = JSON.parse(
        fs.readFileSync(auditPath, 'utf8').trim()
      );

      expect(response.answer).toContain('فهم عادل');
      expect(latest.request.sha256).toHaveLength(64);
      expect(latest.response.sha256).toHaveLength(64);
      expect(latest.response.contentStored).toBe(false);
      expect(latest.response.answer).toBeUndefined();
      expect(audit.response.contentStored).toBe(false);
      expect(audit.response.preview).toBeUndefined();
      expect(response.memory.reason).toBe(
        'CONSTRUCTIVE_DIALOGUE_METADATA_ONLY'
      );
      expect(response.postgresql.reason).toBe(
        'CONSTRUCTIVE_DIALOGUE_METADATA_ONLY'
      );
    } finally {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  test('reports active integration with explicit truth boundaries', () => {
    const status = buildIntegrationStatus();

    expect(status.passed).toBe(true);
    expect(status.status).toBe(
      'ACTIVE_GOVERNED_AI_CONSTRUCTIVE_DIALOGUE'
    );
    expect(status.coverage).toMatchObject({
      contemporaryThoughtFrameworks: 19,
      historicalThoughtFrameworks: 18,
      totalThoughtFrameworks: 37,
      audienceContexts: 6,
      methodReferenceAnchors: 8
    });
    expect(status.governance).toMatchObject({
      personClassification: false,
      targetedPersuasion: false,
      automatedFatwa: false
    });
    expect(
      status.intelligenceEvidence.liveSemanticCorrectnessProven
    ).toBe(false);
    expect(
      status.intelligenceEvidence
      .deterministicIntegrationSelfTestPassed
    ).toBe(true);
  });

  test('wires the public page and VS Code chat to governed V3 fields', () => {
    const root = path.resolve(__dirname, '..');
    const read = (relativePath) => fs.readFileSync(
      path.join(root, relativePath),
      'utf8'
    );
    const page = read('public/constructive-dialogue/index.html');
    const app = read('public/constructive-dialogue/app.js');
    const template = read(
      'sheikha-vscode-extension/src/ui/sheikhaChatTemplate.js'
    );
    const provider = read(
      'sheikha-vscode-extension/src/chat/sheikhaChatProvider.js'
    );
    const client = read(
      'sheikha-vscode-extension/src/sheikhaExtensionChatClient.js'
    );

    expect(page).toContain('value="ai"');
    expect(page).toContain('id="audience-context"');
    expect(page).toContain('id="ai-output"');
    expect(app).toContain(
      '/api/sheikha/constructive-thought-dialogue/v3'
    );
    expect(app).toContain('renderAiDialogue');
    expect(app).toContain('ultraBudgetApproved');

    expect(template).toContain(
      "['constructive', 'حوار فكري محكوم']"
    );
    expect(template).toContain('id="audience"');
    expect(template).toContain('dialogueMode:');
    expect(provider).toContain(
      'audienceContext:'
    );
    expect(provider).toContain(
      'religiousLensRequested:'
    );
    expect(client).toContain('constructiveDialogueMode');
    expect(client).toContain(
      "dialogueMode: constructiveDialogueMode"
    );
    expect(client).toContain('audienceContext:');
  });
});
