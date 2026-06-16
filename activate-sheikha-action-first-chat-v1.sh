#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_ACTION_FIRST_CHAT_V1..."

mkdir -p runtime/action-first-chat-apex/v1 routes/action-first-chat-apex tests docs/action-first-chat-apex

cat > runtime/action-first-chat-apex/v1/sheikha-action-first-chat-apex-v1.js <<'JS'
'use strict';

function classify(message = '') {
  const text = String(message || '').toLowerCase();

  if (/برمج|كود|code|function|class|api|route|server|npm|git|vscode|extension|اصلح/.test(text)) {
    return 'CODING_MODE';
  }

  if (/اكتب|صياغة|نص|خطاب|رسالة|تقرير|محتوى|document|report/.test(text)) {
    return 'WRITING_MODE';
  }

  if (/حلل|analyz|analysis|راجع|افحص|قارن|قيّم/.test(text)) {
    return 'ANALYSIS_MODE';
  }

  if (/فكر|خطط|thinking|reason|استنتج|استراتيجية/.test(text)) {
    return 'THINKING_MODE';
  }

  return 'DIRECT_HELP_MODE';
}

function actionPolicy(message = '') {
  const mode = classify(message);

  return {
    system: 'SHEIKHA_ACTION_FIRST_CHAT_APEX_V1',
    status: 'ACTIVE',
    mode,
    rules: {
      noGenericTemplateFirst: true,
      noRepeatedGreeting: true,
      noInspectorUnlessRequested: true,
      startWithWorkImmediately: true,
      showWhatWasDone: true,
      showNextStep: true,
      noHighImpactExecutionWithoutApproval: true,
      noHarmNoHarar: true
    },
    opening:
      mode === 'CODING_MODE'
        ? 'سأبدأ بالبرمجة مباشرة: أحدد الملف، أكتب التعديل، ثم أعطيك أوامر الاختبار.'
      : mode === 'WRITING_MODE'
        ? 'سأكتب النص مباشرة بصياغة جاهزة ثم أذكر ما تم تحسينه.'
      : mode === 'ANALYSIS_MODE'
        ? 'سأحلل مباشرة: الحالة، السبب، المخاطر، وأفضل إجراء تالٍ.'
      : mode === 'THINKING_MODE'
        ? 'سأرتب التفكير عملياً: فرضيات، ترجيح، قرار، وخطوة تنفيذ.'
      : 'سأتعامل مع طلبك مباشرة بدون قالب جاهز.'
  };
}

module.exports = { classify, actionPolicy };
JS

cat > routes/action-first-chat-apex/sheikha-action-first-chat-apex-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();
const apex = require('../../runtime/action-first-chat-apex/v1/sheikha-action-first-chat-apex-v1');

router.get('/status', (_req, res) => {
  res.json({ success: true, data: apex.actionPolicy('status') });
});

router.post('/classify', (req, res) => {
  res.json({
    success: true,
    data: apex.actionPolicy(req.body?.message || '')
  });
});

module.exports = router;
JS

cat > tests/sheikha-action-first-chat-apex-v1.test.js <<'JS'
'use strict';

const apex = require('../runtime/action-first-chat-apex/v1/sheikha-action-first-chat-apex-v1');

describe('Sheikha Action First Chat Apex V1', () => {
  test('routes commands to real work modes instead of generic replies', () => {
    expect(apex.classify('برمج API جديد')).toBe('CODING_MODE');
    expect(apex.classify('اكتب تقرير')).toBe('WRITING_MODE');
    expect(apex.classify('حلل حالة المشروع')).toBe('ANALYSIS_MODE');
    expect(apex.classify('فكر في أفضل حل')).toBe('THINKING_MODE');
  });

  test('blocks generic template first response', () => {
    const p = apex.actionPolicy('اصلح الشات');
    expect(p.rules.noGenericTemplateFirst).toBe(true);
    expect(p.rules.startWithWorkImmediately).toBe(true);
    expect(p.rules.noRepeatedGreeting).toBe(true);
  });
});
JS

cat > docs/action-first-chat-apex/SHEIKHA-ACTION-FIRST-CHAT-APEX-V1.md <<'MD'
# SHEIKHA ACTION FIRST CHAT APEX V1

هذه الطبقة تمنع الردود الجاهزة وتجعل الشات يبدأ بالعمل مباشرة.

## Modes

- CODING_MODE
- WRITING_MODE
- ANALYSIS_MODE
- THINKING_MODE
- DIRECT_HELP_MODE

## قواعد

- لا تكرار ترحيب.
- لا تقرير Inspector إلا عند الطلب.
- لا رد قالب عام قبل العمل.
- ابدأ بالبرمجة أو الكتابة أو التحليل حسب الأمر.
- اعرض ما تم وما سيلي.
- لا إجراء عالي الأثر بلا موافقة.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()
mount = "app.use('/api/sheikha/action-first-chat-apex/v1', require('./routes/action-first-chat-apex/sheikha-action-first-chat-apex-routes'));"

if mount not in s:
    marker = "app.use('/api/sheikha/living-conversation-apex/v1'"
    if marker in s:
        s = s.replace(marker, mount + "\n" + marker, 1)
    else:
        s += "\n" + mount + "\n"

p.write_text(s)
PY

npm run lint
npm test -- --runInBand tests/sheikha-action-first-chat-apex-v1.test.js

echo "SHEIKHA_ACTION_FIRST_CHAT_V1 activated."
