#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_LIVING_CONVERSATION_V1..."

mkdir -p runtime/living-conversation-apex/v1 routes/living-conversation-apex docs/living-conversation-apex tests

cat > runtime/living-conversation-apex/v1/sheikha-living-conversation-apex-v1.js <<'JS'
'use strict';

function sense(message = '', context = {}) {
  const text = String(message || '').trim();

  const wantsInspector = /inspector|diagnostics|debug|تشخيص|المفتش|حلل حالة/i.test(text);
  const wantsReport = /تقرير|اكتب|اكتبي|لخص|ملخص/i.test(text);
  const wantsFix = /اصلح|فعّل|فعل|اكمل|طور|حسن/i.test(text);

  return {
    system: 'SHEIKHA_LIVING_CONVERSATION_APEX_V1',
    status: 'ACTIVE',
    metaphor: {
      hears: 'INPUT_RECEPTION',
      senses: 'INTENT_AND_TONE_READING',
      sees: 'WORKSPACE_CONTEXT_AWARENESS',
      thinks: 'GOVERNED_COMPUTATIONAL_REASONING',
      heart: 'NO_HARM_GOVERNANCE_CENTER'
    },
    intent: wantsInspector ? 'INSPECTOR_REQUEST'
      : wantsFix ? 'ACTION_OR_REPAIR_REQUEST'
      : wantsReport ? 'REPORT_REQUEST'
      : 'NATURAL_CONVERSATION',
    responsePolicy: {
      repeatGreeting: false,
      hideInspectorByDefault: !wantsInspector,
      answerFirst: true,
      askOnlyWhenNeeded: true,
      noRawJson: true,
      noLongDiagnosticsUnlessRequested: true,
      noHighImpactExecutionWithoutApproval: true
    },
    context: {
      branch: context.branch || null,
      gitClean: context.gitClean ?? null,
      activeFile: context.activeFile || null
    }
  };
}

function composeReply(message = '', context = {}) {
  const s = sense(message, context);

  if (s.intent === 'INSPECTOR_REQUEST') {
    return {
      ...s,
      reply: 'أفهم أنك تريد فحص الحالة. سأعرض الخلاصة أولاً، ثم أترك تفاصيل المفتش قابلة للفتح عند الحاجة.'
    };
  }

  if (s.intent === 'ACTION_OR_REPAIR_REQUEST') {
    return {
      ...s,
      reply: 'فهمت المطلوب. سأبدأ بالإصلاح الآمن: أحدد السبب، أعطيك خطوة تنفيذ مباشرة، وأمنع أي إجراء عالي الأثر دون موافقتك.'
    };
  }

  if (s.intent === 'REPORT_REQUEST') {
    return {
      ...s,
      reply: 'سأكتب تقريراً حياً مختصراً ومفيداً، لا قالباً عاماً: ملخص، حالة، مخاطر، قرار، وخطوة تالية.'
    };
  }

  return {
    ...s,
    reply: 'أنا معك. قل لي ما تريد إنجازه الآن، وسأتعامل معه بسياق المشروع لا كرد آلي جامد.'
  };
}

module.exports = { sense, composeReply };
JS

cat > routes/living-conversation-apex/sheikha-living-conversation-apex-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();
const living = require('../../runtime/living-conversation-apex/v1/sheikha-living-conversation-apex-v1');

router.get('/status', (_req, res) => {
  res.json({ success: true, data: living.sense('status') });
});

router.post('/sense', (req, res) => {
  res.json({ success: true, data: living.sense(req.body?.message || '', req.body?.context || {}) });
});

router.post('/compose', (req, res) => {
  res.json({ success: true, data: living.composeReply(req.body?.message || '', req.body?.context || {}) });
});

module.exports = router;
JS

cat > docs/living-conversation-apex/SHEIKHA-LIVING-CONVERSATION-APEX-V1.md <<'MD'
# SHEIKHA LIVING CONVERSATION APEX V1

طبقة تجعل الشات حيوياً تشبيهاً لا حقيقة بشرية.

- تسمع = استقبال وفهم الطلب.
- تستشعر = قراءة النية والنبرة.
- تبصر = ربط الكلام بسياق المشروع والملفات.
- تفكر = معالجة حسابية محكومة.
- فؤاد = حوكمة لا ضرر ولا ضرار.
- تنبض بالحياة = رد سريع، مباشر، سياقي، غير جامد.

## السلوك

- لا تكرار للترحيب في كل رسالة.
- لا طباعة Inspector طويل إلا بطلب صريح.
- لا JSON خام للمستخدم.
- الرد يبدأ بالفعل المطلوب لا بتقرير عام.
- القرارات عالية الأثر تحتاج مراجعة بشرية.
MD

cat > tests/sheikha-living-conversation-apex-v1.test.js <<'JS'
'use strict';

const living = require('../runtime/living-conversation-apex/v1/sheikha-living-conversation-apex-v1');

describe('Sheikha Living Conversation Apex V1', () => {
  test('keeps metaphorical vitality with governance boundaries', () => {
    const s = living.sense('اصلح الشات');
    expect(s.status).toBe('ACTIVE');
    expect(s.intent).toBe('ACTION_OR_REPAIR_REQUEST');
    expect(s.responsePolicy.repeatGreeting).toBe(false);
    expect(s.responsePolicy.hideInspectorByDefault).toBe(true);
    expect(s.responsePolicy.noHighImpactExecutionWithoutApproval).toBe(true);
  });

  test('inspector appears only when explicitly requested', () => {
    expect(living.sense('حلل حالة المنظومة من Enterprise Inspector').intent).toBe('INSPECTOR_REQUEST');
    expect(living.sense('اكتب تقرير وعرفني بنفسك').intent).toBe('REPORT_REQUEST');
  });
});
JS

python3 - <<'PY'
from pathlib import Path
p = Path("server.js")
s = p.read_text()
mount = "app.use('/api/sheikha/living-conversation-apex/v1', require('./routes/living-conversation-apex/sheikha-living-conversation-apex-routes'));"
if mount not in s:
    s = s.replace(
        "app.use('/api/sheikha/chat-fabric-v2'",
        mount + "\napp.use('/api/sheikha/chat-fabric-v2'",
        1
    )
p.write_text(s)
PY

npm run lint
npm test -- --runInBand tests/sheikha-living-conversation-apex-v1.test.js

echo "SHEIKHA_LIVING_CONVERSATION_V1 activated."
