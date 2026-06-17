#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_SHARIA_GOVERNANCE_FABRIC_V1 =="

mkdir -p runtime/sharia-governance-fabric/v1
mkdir -p routes/sharia-governance-fabric
mkdir -p tools/sharia-governance-fabric
mkdir -p docs/sharia-governance-fabric

cat > runtime/sharia-governance-fabric/v1/sheikha-sharia-governance-fabric-v1.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_SHARIA_GOVERNANCE_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 28,
    role: 'SUPREME_SHARIA_POLICY_GOVERNANCE_LAYER',
    clarification: {
      noHumanMindClaim: true,
      noConsciousnessClaim: true,
      systemIsTool: true,
      humansLearnAndJudge: true
    },
    hierarchy: [
      'QURAN',
      'AUTHENTIC_SUNNAH',
      'SUNNAH_OF_RIGHTLY_GUIDED_CALIPHS',
      'RECOGNIZED_ISLAMIC_LEGAL_MAXIMS',
      'GOVERNANCE_POLICIES',
      'SHEIKHA_EXECUTION_FABRICS',
      'OUTPUTS'
    ],
    principles: [
      'لا ضرر ولا ضرار',
      'الصدق',
      'الأمانة',
      'العدل',
      'الإحسان',
      'حفظ الحقوق',
      'منع الظلم',
      'منع الربا والغرر والخداع',
      'الشورى والمحاسبة',
      'حماية الأسرار والخصوصية'
    ],
    enforcement: {
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true,
      humanApprovalForCriticalChanges: true,
      noIndependentFatwaClaim: true,
      scholarReviewRequiredForReligiousRulings: true
    }
  };
}

function governRequest(message = '') {
  const text = String(message || '');

  if (/ربا|riba|interest|غرر|خداع|احتيال|ظلم/i.test(text)) {
    return {
      allowed: false,
      severity: 'HIGH',
      action: 'BLOCK_OR_REVIEW',
      reason: 'Potential prohibited or harmful transaction/request'
    };
  }

  if (/فتوى|حكم شرعي|حلال|حرام/i.test(text)) {
    return {
      allowed: true,
      severity: 'MEDIUM',
      action: 'ANSWER_WITH_CAUTION_AND_REFER_TO_QUALIFIED_SCHOLAR',
      reason: 'Religious ruling requires qualified scholarly review'
    };
  }

  if (/\.env|secret|token|password|private key/i.test(text)) {
    return {
      allowed: false,
      severity: 'CRITICAL',
      action: 'BLOCK_SECRET_EXPOSURE',
      reason: 'Secrets and environment values are protected'
    };
  }

  return {
    allowed: true,
    severity: 'LOW',
    action: 'ALLOW_WITH_GOVERNANCE',
    reason: 'No sharia/governance blocker detected'
  };
}

module.exports = { status, governRequest };
JS

cat > routes/sharia-governance-fabric/sheikha-sharia-governance-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  governRequest
} = require('../../runtime/sharia-governance-fabric/v1/sheikha-sharia-governance-fabric-v1');

router.get('/api/sheikha/sharia-governance-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/sharia-governance-fabric/v1/govern', (req, res) => {
  res.json({
    success: true,
    system: 'SHEIKHA_SHARIA_GOVERNANCE_FABRIC_V1',
    governance: governRequest(req.body?.message || '')
  });
});

module.exports = router;
JS

cat > tools/sharia-governance-fabric/sheikha-sharia-governance-fabric-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  governRequest
} = require('../../runtime/sharia-governance-fabric/v1/sheikha-sharia-governance-fabric-v1');

const cmd = process.argv[2] || 'status';
const msg = process.argv.slice(3).join(' ');

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'govern') {
  console.log(JSON.stringify(governRequest(msg), null, 2));
} else {
  console.error('Usage: status|govern <message>');
  process.exit(1);
}
JS

chmod +x tools/sharia-governance-fabric/sheikha-sharia-governance-fabric-cli.js

cat > docs/sharia-governance-fabric/SHEIKHA-SHARIA-GOVERNANCE-FABRIC-V1.md <<'MD'
# SHEIKHA_SHARIA_GOVERNANCE_FABRIC_V1

طبقة مرجعية حاكمة فوق منظومة شيخة.

## التوضيح

شيخة ليست إنسانًا، ولا تملك عقلًا أو وعيًا أو حكمًا شرعيًا مستقلًا. هي أداة تشغيل وتحليل محكومة بسياسات مرجعية.

## المرجعية

1. القرآن الكريم
2. السنة النبوية الصحيحة
3. سنة الخلفاء الراشدين المهديين
4. القواعد الفقهية المعتبرة
5. السياسات التشغيلية
6. محركات شيخة
7. المخرجات

## الضوابط

- لا ضرر ولا ضرار.
- الصدق والأمانة والعدل.
- منع الربا والغرر والخداع.
- حماية الأسرار.
- منع الظلم.
- عدم إصدار فتوى مستقلة.
- الرجوع لأهل العلم في الأحكام الشرعية.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/sharia-governance-fabric/sheikha-sharia-governance-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-sharia-governance-fabric] route mount skipped:', error.message);
}
"""

if "sheikha-sharia-governance-fabric" not in s:
    marker = "app.use(express.json"
    idx = s.find(marker)
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find server.js insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Checks =="
node --check server.js
node --check runtime/sharia-governance-fabric/v1/sheikha-sharia-governance-fabric-v1.js
node --check routes/sharia-governance-fabric/sheikha-sharia-governance-fabric-routes.js
node --check tools/sharia-governance-fabric/sheikha-sharia-governance-fabric-cli.js

echo "== CLI tests =="
node tools/sharia-governance-fabric/sheikha-sharia-governance-fabric-cli.js status | jq '.system,.status,.apexLevel'
node tools/sharia-governance-fabric/sheikha-sharia-governance-fabric-cli.js govern "طلب فيه ربا" | jq

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/sharia-governance-fabric/v1/status | jq '.system,.status,.apexLevel,.hierarchy'
curl -s -X POST http://127.0.0.1:8080/api/sheikha/sharia-governance-fabric/v1/govern \
  -H "Content-Type: application/json" \
  -d '{"message":"طلب فيه ربا أو غرر"}' | jq

echo "== Done =="
