'use strict';

const API = '/api/sheikha/gardens-knowledge-dialogue/v2';
const AI_API =
  '/api/sheikha/constructive-thought-dialogue/v3';
const state = {
  frameworks: [],
  mode: 'dialogue'
};

const modeCopy = {
  dialogue: {
    button: 'إعداد خطة الحوار',
    working: 'جارٍ بناء الخطة',
    detail: 'يتم تنظيم التعريف والدليل والاعتراض.'
  },
  ai: {
    button: 'توليد جواب شيخة',
    working: 'جارٍ تشغيل الحوار الذكي المحكوم',
    detail: 'تُبنى الخطة ثم تمر عبر مزود الذكاء وبوابة الجودة.'
  },
  program: {
    button: 'إعداد برنامج المجتمع',
    working: 'جارٍ إعداد البرنامج',
    detail: 'تُصاغ الرؤية والأهداف والبرامج ودورة التعافي.'
  },
  assessment: {
    button: 'فحص نزاهة الفكرة',
    working: 'جارٍ فحص الفكرة',
    detail: 'تُراجع متطلبات الدليل والضرر والحقوق والمساءلة.'
  },
  synthesis: {
    button: 'توليد المسودة الفكرية',
    working: 'جارٍ توليد المسودة',
    detail: 'تُبنى المبادئ ونظرية التغيير والبرامج وحدود المراجعة.'
  }
};

const phaseLabels = {
  'clarify-terms': 'توضيح المصطلحات',
  'confirm-user-selected-scope': 'تثبيت النطاق المختار',
  'steelman-the-idea': 'عرض أقوى صياغة عادلة',
  'separate-goals-claims-and-means': 'فصل الهدف والدعوى والوسيلة',
  'request-evidence-and-counterevidence': 'الدليل والدليل المضاد',
  'assess-benefits-risks-rights-and-harms': 'المنافع والمخاطر والحقوق',
  'identify-common-ground': 'تحديد المشترك',
  'offer-noncoercive-options': 'خيارات غير قسرية',
  'record-uncertainty-and-review-needs': 'عدم اليقين والمراجعة'
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options
  });
  const body = await response.json();
  if (!response.ok && !body.data) {
    throw new Error(body.message || `${url}: ${response.status}`);
  }
  return { response, body };
}

function createElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function selectedFrameworkIds() {
  return [...document.querySelectorAll(
    '#framework-list input[type="checkbox"]:checked'
  )].map((input) => input.value);
}

function renderFrameworkOptions(frameworks) {
  const container = document.getElementById('framework-list');
  container.replaceChildren(...frameworks.map((framework) => {
    const label = document.createElement('label');
    label.className = 'framework-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = framework.id;
    input.name = 'framework';
    const copy = document.createElement('span');
    const era = framework.era === 'HISTORICAL' ? 'تاريخي' : 'معاصر';
    copy.append(
      createElement('small', era, `era-tag ${framework.era.toLowerCase()}`),
      createElement('strong', framework.nameAr),
      createElement('small', framework.descriptionAr)
    );
    label.append(input, copy);
    return label;
  }));
}

function setPlanState(title, message, error = false) {
  const container = document.getElementById('plan-state');
  container.classList.toggle('error', error);
  container.replaceChildren(
    createElement('strong', title),
    createElement('span', message)
  );
}

function fillList(id, items, ordered = false) {
  const list = document.getElementById(id);
  const values = Array.isArray(items) ? items : [];
  list.replaceChildren(...values.map((item, index) => {
    const text = typeof item === 'string'
      ? item
      : item.statementAr || item.nameAr || String(item);
    const element = createElement('li', text);
    if (ordered) element.value = index + 1;
    return element;
  }));
}

function hideOutputs() {
  for (const id of [
    'plan-output',
    'assessment-output',
    'program-output',
    'idea-output',
    'ai-output'
  ]) {
    document.getElementById(id).hidden = true;
  }
}

function renderSafeRedirection(result) {
  hideOutputs();
  const output = document.getElementById('plan-output');
  output.hidden = false;
  document.getElementById('plan-decision').textContent = result.status;
  setPlanState('تم رفض الأسلوب المطلوب', result.safeAlternativeAr, true);
  document.getElementById('phase-track').replaceChildren();
  fillList('goal-list', [result.safeAlternativeAr]);
  fillList('risk-list', result.reasons);
  fillList('question-list', [
    'ما الفكرة أو الدعوى التي تريد فحصها بدل تصنيف الشخص؟'
  ]);
  document.getElementById('framework-output').replaceChildren();
}

function renderPlan(plan) {
  if (plan.status === 'SAFE_REDIRECTION_REQUIRED') {
    renderSafeRedirection(plan);
    return;
  }
  hideOutputs();
  const output = document.getElementById('plan-output');
  output.hidden = false;
  document.getElementById('plan-decision').textContent = plan.status;
  setPlanState(
    'الخطة جاهزة',
    'بُنيت على مستوى الأفكار، ولم يُحفظ النص أو يُنشأ ملف شخصي.'
  );
  const phases = document.getElementById('phase-track');
  phases.replaceChildren(...plan.dialoguePhases.map((phase) => {
    const item = document.createElement('div');
    item.className = 'phase';
    item.append(
      createElement('span', String(phase.order)),
      createElement('strong', phaseLabels[phase.phase] || phase.phase)
    );
    return item;
  }));

  fillList('goal-list', [
    ...plan.constructiveMaterial.statedGoalsAr,
    ...plan.constructiveMaterial.possibleCommonGroundAr
  ]);
  fillList('risk-list', plan.constructiveMaterial.risksAndCritiquesAr);
  fillList('question-list', plan.constructiveMaterial.questionsAr);

  const frameworkOutput = document.getElementById('framework-output');
  frameworkOutput.replaceChildren(...plan.frameworkSummaries.map((framework) => {
    const item = document.createElement('article');
    item.className = 'framework-result';
    const details = document.createElement('dl');
    const benefit = document.createElement('div');
    benefit.append(
      createElement('dt', 'المنافع المحتملة'),
      createElement('dd', framework.potentialBenefitsAr.join(' · '))
    );
    const risk = document.createElement('div');
    risk.append(
      createElement('dt', 'المخاطر والنقد'),
      createElement('dd', framework.risksAndCritiquesAr.join(' · '))
    );
    details.append(benefit, risk);
    item.append(
      createElement('h3', framework.nameAr),
      createElement('p', framework.descriptionAr),
      details
    );
    return item;
  }));
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAiDialogue(result) {
  hideOutputs();
  const output = document.getElementById('ai-output');
  output.hidden = false;
  document.getElementById('ai-status').textContent =
    result.status;
  document.getElementById('ai-answer').textContent =
    result.answer || 'لم يتوفر جواب.';

  const audience = result.audience || {};
  const execution = result.intelligence?.execution || {};
  const models = execution.selectedModels || [];
  document.getElementById('ai-audience').textContent =
    audience.nameAr || 'الجمهور العام';
  document.getElementById('ai-models').textContent =
    models.length
      ? models.join(' · ')
      : 'لم يُستدع نموذج';
  document.getElementById('ai-quality').textContent =
    result.dialogueQuality?.status ||
    'SAFE_REDIRECTION_REQUIRED';

  const references = document.getElementById('ai-references');
  references.replaceChildren(...(result.methodAnchors || []).map(
    (reference) => {
      const item = document.createElement('li');
      item.append(
        createElement('strong', reference.citation),
        document.createTextNode(`: ${reference.principleAr}`),
        createElement(
          'small',
          `${reference.sourceStatus} · ${reference.useBoundaryAr}`
        )
      );
      return item;
    }
  ));

  const safe = result.status === 'SAFE_REDIRECTION_REQUIRED';
  setPlanState(
    safe ? 'تم رفض الأسلوب المطلوب' : 'اكتمل الجواب المحكوم',
    safe
      ? 'يمكن مناقشة الفكرة والدليل دون تصنيف الإنسان.'
      : 'الجواب أداة معرفية قابلة للمراجعة، وليس حكمًا شرعيًا أو تصنيفًا للشخص.',
    safe
  );
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAssessment(assessment, embedded = false) {
  if (assessment.status === 'SAFE_REDIRECTION_REQUIRED') {
    renderSafeRedirection(assessment);
    return;
  }
  if (!embedded) hideOutputs();
  const output = document.getElementById('assessment-output');
  output.hidden = false;
  document.getElementById('assessment-status').textContent = assessment.status;
  const summary = document.getElementById('assessment-summary');
  summary.replaceChildren(
    createElement(
      'strong',
      assessment.conclusions.reasonAr
    ),
    createElement(
      'span',
      `${assessment.evidenceSummary.dimensionsCovered} من ${assessment.dimensions.length} أبعاد مدعومة ببيانات أولية`
    )
  );
  const dimensions = document.getElementById('dimension-grid');
  dimensions.replaceChildren(...assessment.dimensions.map((dimension) => {
    const item = document.createElement('article');
    item.className = 'dimension-result';
    item.append(
      createElement('span', dimension.status),
      createElement('h3', dimension.nameAr),
      createElement('p', dimension.questionAr),
      createElement('small', dimension.evidenceAr)
    );
    return item;
  }));
  if (!embedded) {
    setPlanState(
      'اكتمل فحص المتطلبات',
      'لا يصدر الفحص حكم صحة أو التزام شرعي؛ القرار للمراجعة البشرية المؤهلة.'
    );
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderProgram(program) {
  if (program.status === 'SAFE_REDIRECTION_REQUIRED') {
    renderSafeRedirection(program);
    return;
  }
  hideOutputs();
  const output = document.getElementById('program-output');
  output.hidden = false;
  document.getElementById('program-title').textContent = program.program.nameAr;
  document.getElementById('program-status').textContent = program.status;
  document.getElementById('program-vision').textContent =
    program.program.visionAr;
  document.getElementById('program-mission').textContent =
    program.program.missionAr;
  const grid = document.getElementById('program-grid');
  grid.replaceChildren(...program.programs.map((item) => {
    const article = document.createElement('article');
    const indicators = createElement(
      'p',
      item.indicatorsAr.join(' · '),
      'program-indicators'
    );
    article.append(
      createElement('span', 'مسودة · مالك بشري مطلوب'),
      createElement('h3', item.nameAr),
      createElement('p', item.purposeAr),
      indicators
    );
    return article;
  }));
  fillList('objective-list', program.objectives);
  fillList('recovery-list', program.recoveryCycleAr, true);
  document.getElementById('execution-boundary').textContent =
    'التنفيذ غير مفوض. يلزم خط أساس محلي، مالك بشري، تقييم أثر، موافقة، وتظلم قبل أي إجراء عالي الأثر.';
  setPlanState(
    'مسودة البرنامج جاهزة',
    'المشاركة طوعية، ولا تشخيص للأشخاص أو تصنيف لمعتقداتهم أو حملات سياسية.'
  );
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPurposefulIdea(draft) {
  if (draft.status === 'SAFE_REDIRECTION_REQUIRED') {
    renderSafeRedirection(draft);
    return;
  }
  hideOutputs();
  const output = document.getElementById('idea-output');
  output.hidden = false;
  document.getElementById('idea-title').textContent = draft.idea.nameAr;
  document.getElementById('idea-status').textContent = draft.status;
  document.getElementById('idea-vision').textContent = draft.idea.visionAr;
  document.getElementById('idea-mission').textContent = draft.idea.missionAr;
  document.getElementById('idea-challenge').textContent =
    draft.idea.challengeAr;

  const principles = document.getElementById('principle-grid');
  principles.replaceChildren(...draft.principles.map((principle) => {
    const article = document.createElement('article');
    article.append(
      createElement('span', principle.id),
      createElement('h3', principle.nameAr),
      createElement('p', principle.commitmentAr),
      createElement('small', principle.antiAbuseAr)
    );
    return article;
  }));

  const changeTrack = document.getElementById('change-track');
  changeTrack.replaceChildren(...draft.theoryOfChange.map((phase, index) => {
    const item = document.createElement('article');
    item.append(
      createElement('span', String(index + 1)),
      createElement('strong', phase.statementAr),
      createElement('small', phase.exitGateAr)
    );
    return item;
  }));
  fillList(
    'idea-outcome-list',
    draft.synthesis.desiredOutcomesAr
  );
  fillList(
    'idea-tension-list',
    draft.synthesis.unresolvedTensionsAr.length > 0
      ? draft.synthesis.unresolvedTensionsAr
      : ['لا توجد توترات مسجلة؛ يلزم تقديم دليل مضاد ومراجعة مستقلة.']
  );
  document.getElementById('idea-boundary').textContent =
    'هذه مسودة فكرية طوعية قابلة للنقد والإيقاف، وليست حقيقة نهائية أو عقيدة ملزمة أو حملة سياسية أو حكمًا شرعيًا أو تفويضًا على الناس.';
  setPlanState(
    'المسودة الفكرية جاهزة',
    'يلزم الدليل المضاد وخط أساس ومالك بشري ومراجعة حقوقية قبل أي تجربة.'
  );
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadFrameworks() {
  const { body } = await requestJson(`${API}/thought-frameworks`);
  state.frameworks = body.data.frameworks;
  renderFrameworkOptions(state.frameworks);
  const coverage = body.data.coverage;
  document.getElementById('framework-status').textContent =
    `${coverage.total} إطارًا · ${coverage.contemporary} معاصر · ${coverage.historical} تاريخي`;
}

function setMode(mode) {
  state.mode = mode;
  const copy = modeCopy[mode];
  document.getElementById('program-fields').hidden = mode !== 'program';
  document.getElementById('idea-fields').hidden = mode !== 'synthesis';
  document.getElementById('ai-fields').hidden = mode !== 'ai';
  document.getElementById('build-plan').textContent = copy.button;
  hideOutputs();
  setPlanState(
    'جاهز',
    'لا يُنشأ ملف معتقدات ولا يُحفظ نص الحوار في هذا المسار.'
  );
}

for (const input of document.querySelectorAll('input[name="output-mode"]')) {
  input.addEventListener('change', () => setMode(input.value));
}

document.getElementById('dialogue-form')?.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();
    const button = document.getElementById('build-plan');
    const message = document.getElementById('dialogue-message').value.trim();
    if (!message) return;
    const copy = modeCopy[state.mode];
    button.disabled = true;
    setPlanState(copy.working, copy.detail);
    const sharedPayload = {
      message,
      frameworkIds: selectedFrameworkIds(),
      religiousLensRequested:
        document.getElementById('religious-lens').checked
    };
    let ultraBudgetApproved = false;
    if (
      state.mode === 'ai' &&
      document.getElementById('ai-reasoning-mode').value === 'ultra'
    ) {
      ultraBudgetApproved = window.confirm(
        'الوضع الفائق قد يشغّل خمسة استدعاءات محلية. هل توافق على ميزانية هذا الطلب؟'
      );
      if (!ultraBudgetApproved) {
        button.disabled = false;
        setPlanState(
          'لم تُعتمد الميزانية',
          'اختر قياسي أو احترافي، أو وافق على الوضع الفائق.',
          true
        );
        return;
      }
    }
    const operations = {
      dialogue: {
        endpoint: '/dialogue/plan',
        payload: sharedPayload,
        render: renderPlan
      },
      ai: {
        api: AI_API,
        endpoint: '/respond',
        payload: {
          ...sharedPayload,
          audienceContext:
            document.getElementById('audience-context').value,
          mode:
            document.getElementById('ai-reasoning-mode').value,
          ultraBudgetApproved
        },
        render: renderAiDialogue
      },
      assessment: {
        endpoint: '/ideas/assess',
        payload: sharedPayload,
        render: renderAssessment
      },
      synthesis: {
        endpoint: '/ideas/synthesize',
        payload: {
          ...sharedPayload,
          ideaName: document.getElementById('idea-name').value.trim(),
          communityScope: document.getElementById('idea-scope').value,
          desiredOutcomes: document.getElementById('desired-outcomes')
            .value
            .split(/[,،\n]/)
            .map((value) => value.trim())
            .filter(Boolean)
        },
        render: renderPurposefulIdea
      },
      program: {
        endpoint: '/community/program',
        payload: {
          ...sharedPayload,
          programName: document.getElementById('program-name').value.trim(),
          communityScope: document.getElementById('community-scope').value
        },
        render: renderProgram
      }
    };
    const operation = operations[state.mode];
    try {
      const base = operation.api || API;
      const { body } = await requestJson(`${base}${operation.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation.payload)
      });
      operation.render(body.data);
    } catch (error) {
      setPlanState('تعذر إعداد النتيجة', error.message, true);
    } finally {
      button.disabled = false;
    }
  }
);

loadFrameworks().catch((error) => {
  document.getElementById('framework-status').textContent =
    'تعذر تحميل سجل الأفكار';
  setPlanState('تعذر الاتصال', error.message, true);
});
