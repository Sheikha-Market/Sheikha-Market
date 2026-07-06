#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_EXPONENTIAL_ACCOUNTING_ENGINE_V1 =="

mkdir -p runtime/exponential-accounting-engine/v1
mkdir -p routes/exponential-accounting-engine
mkdir -p tools/exponential-accounting-engine
mkdir -p docs/exponential-accounting-engine

cat > runtime/exponential-accounting-engine/v1/sheikha-exponential-accounting-engine-v1.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_ACCOUNTING_ENGINE_V1',
    status: 'ACTIVE',
    role: 'GOVERNED_EXPONENTIAL_ACCOUNTING_AND_GROWTH_ENGINE',
    capabilities: [
      'compound_growth',
      'exponential_projection',
      'scenario_comparison',
      'risk_flags',
      'accounting_summary'
    ],
    governance: {
      principle: 'لا ضرر ولا ضرار',
      noFuturePredictionClaim: true,
      calculationOnly: true,
      noRibaAutomation: true,
      noFinancialAdviceClaim: true
    }
  };
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function calculateExponentialAccounting(input = {}) {
  const principal = Math.max(0, toNumber(input.principal, 0));
  const rate = toNumber(input.rate, 0);
  const periods = Math.max(0, Math.floor(toNumber(input.periods, 0)));
  const contribution = Math.max(0, toNumber(input.contribution, 0));

  const rows = [];
  let balance = principal;

  for (let period = 1; period <= periods; period += 1) {
    const opening = balance;
    const growth = opening * rate;
    balance = opening + growth + contribution;

    rows.push({
      period,
      opening: Number(opening.toFixed(2)),
      growth: Number(growth.toFixed(2)),
      contribution: Number(contribution.toFixed(2)),
      closing: Number(balance.toFixed(2))
    });
  }

  return {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_ACCOUNTING_ENGINE_V1',
    calculationType: 'EXPONENTIAL_COMPOUND_ACCOUNTING',
    input: { principal, rate, periods, contribution },
    summary: {
      initialPrincipal: Number(principal.toFixed(2)),
      finalBalance: Number(balance.toFixed(2)),
      totalContribution: Number((contribution * periods).toFixed(2)),
      totalGrowth: Number((balance - principal - contribution * periods).toFixed(2))
    },
    rows,
    governance: {
      calculationOnly: true,
      noFuturePredictionClaim: true,
      noRibaAutomation: true,
      note: 'هذا قياس حسابي وسيناريو محاسبي، وليس تنبؤاً بالغيب ولا توصية مالية.'
    }
  };
}

module.exports = {
  status,
  calculateExponentialAccounting
};
JS

cat > routes/exponential-accounting-engine/sheikha-exponential-accounting-engine-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  calculateExponentialAccounting
} = require('../../runtime/exponential-accounting-engine/v1/sheikha-exponential-accounting-engine-v1');

router.get('/api/sheikha/exponential-accounting-engine/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/exponential-accounting-engine/v1/calculate', (req, res) => {
  res.json(calculateExponentialAccounting(req.body || {}));
});

module.exports = router;
JS

cat > tools/exponential-accounting-engine/sheikha-exponential-accounting-engine-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  calculateExponentialAccounting
} = require('../../runtime/exponential-accounting-engine/v1/sheikha-exponential-accounting-engine-v1');

const cmd = process.argv[2] || 'status';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'calculate') {
  console.log(JSON.stringify(calculateExponentialAccounting({
    principal: process.argv[3] || 1000,
    rate: process.argv[4] || 0.10,
    periods: process.argv[5] || 12,
    contribution: process.argv[6] || 0
  }), null, 2));
} else {
  console.error('Usage: status | calculate <principal> <rate> <periods> <contribution>');
  process.exit(1);
}
JS

chmod +x tools/exponential-accounting-engine/sheikha-exponential-accounting-engine-cli.js

cat > docs/exponential-accounting-engine/SHEIKHA-EXPONENTIAL-ACCOUNTING-ENGINE-V1.md <<'MD'
# SHEIKHA_EXPONENTIAL_ACCOUNTING_ENGINE_V1

محرك محاسبي للتكاثر/النمو الأسي بصيغة قياس حسابي فقط.

## الضوابط

- لا تنبؤ بالغيب.
- لا توصية مالية.
- لا أتمتة ربا.
- لا ضرر ولا ضرار.
- النتائج سيناريوهات حسابية قابلة للمراجعة.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/exponential-accounting-engine/sheikha-exponential-accounting-engine-routes'));
} catch (error) {
  console.warn('[sheikha-exponential-accounting-engine] route mount skipped:', error.message);
}
"""

if "sheikha-exponential-accounting-engine" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Checks =="
node --check server.js
node --check runtime/exponential-accounting-engine/v1/sheikha-exponential-accounting-engine-v1.js
node --check routes/exponential-accounting-engine/sheikha-exponential-accounting-engine-routes.js
node --check tools/exponential-accounting-engine/sheikha-exponential-accounting-engine-cli.js

echo "== CLI test =="
node tools/exponential-accounting-engine/sheikha-exponential-accounting-engine-cli.js calculate 1000 0.1 5 100 | jq '.summary,.governance'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/exponential-accounting-engine/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"principal":1000,"rate":0.1,"periods":5,"contribution":100}' | jq '.summary,.rows'

echo "== Commit =="
git add \
  server.js \
  activate-sheikha-exponential-accounting-engine-v1.sh \
  runtime/exponential-accounting-engine \
  routes/exponential-accounting-engine \
  tools/exponential-accounting-engine \
  docs/exponential-accounting-engine

git commit -m "Activate Sheikha exponential accounting engine"
git push origin feature/extension-experience-apex-v1

echo "== Done =="
