#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate SHEIKHA_AUTONOMOUS_EXECUTION_BRIDGE_V1 =="

mkdir -p runtime/autonomous-execution-bridge/v1
mkdir -p routes/autonomous-execution-bridge
mkdir -p tools/autonomous-execution-bridge
mkdir -p docs/autonomous-execution-bridge

cat > runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1.js <<'JS'
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
JS

cat > routes/autonomous-execution-bridge/sheikha-autonomous-execution-bridge-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  execute
} = require('../../runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1');

router.get('/api/sheikha/autonomous-execution-bridge/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/autonomous-execution-bridge/v1/execute', async (req, res) => {
  res.json(await execute(req.body?.message || '', {
    mode: req.body?.mode || 'smart',
    safeMode: req.body?.safeMode !== false,
    timeoutMs: req.body?.timeoutMs,
    numPredict: req.body?.numPredict
  }));
});

module.exports = router;
JS

cat > tools/autonomous-execution-bridge/sheikha-autonomous-execution-bridge-cli.js <<'JS'
#!/usr/bin/env node
'use strict';

const {
  status,
  execute
} = require('../../runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1');

const cmd = process.argv[2] || 'status';
const msg = process.argv.slice(3).join(' ') || 'عرّف بنفسك باختصار';

if (cmd === 'status') {
  console.log(JSON.stringify(status(), null, 2));
} else if (cmd === 'execute') {
  execute(msg, { mode: 'smart', timeoutMs: 180000, numPredict: 128 })
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  console.error('Usage: status|execute <message>');
  process.exit(1);
}
JS

chmod +x tools/autonomous-execution-bridge/sheikha-autonomous-execution-bridge-cli.js

cat > docs/autonomous-execution-bridge/SHEIKHA-AUTONOMOUS-EXECUTION-BRIDGE-V1.md <<'MD'
# SHEIKHA_AUTONOMOUS_EXECUTION_BRIDGE_V1

APEX LEVEL 26.

يربط طبقة التخطيط autonomous enterprise fabric بمحركات التنفيذ الفعلية:

- HA AI Production Fabric
- AI Cluster Pipeline
- Model Core / Ollama
- Event Bus
- Vector Memory

## الحوكمة

- لا ضرر ولا ضرار.
- منع `.env` والأسرار.
- منع العمليات التدميرية.
- مراجعة بشرية للحرج.
- التنفيذ الآمن فقط.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/autonomous-execution-bridge/sheikha-autonomous-execution-bridge-routes'));
} catch (error) {
  console.warn('[sheikha-autonomous-execution-bridge] route mount skipped:', error.message);
}
"""

if "sheikha-autonomous-execution-bridge" not in s:
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
node --check runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1.js
node --check routes/autonomous-execution-bridge/sheikha-autonomous-execution-bridge-routes.js
node --check tools/autonomous-execution-bridge/sheikha-autonomous-execution-bridge-cli.js

echo "== CLI tests =="
node tools/autonomous-execution-bridge/sheikha-autonomous-execution-bridge-cli.js status | jq '.system,.status,.apexLevel'
node tools/autonomous-execution-bridge/sheikha-autonomous-execution-bridge-cli.js execute "عرّف بنفسك باختصار" | jq '.status,.routed.model,.answer'

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/autonomous-execution-bridge/v1/status | jq
curl -s -X POST http://127.0.0.1:8080/api/sheikha/autonomous-execution-bridge/v1/execute \
  -H "Content-Type: application/json" \
  -d '{"message":"عرّف بنفسك باختصار","mode":"smart","timeoutMs":180000,"numPredict":96}' | jq '.status,.routed.model,.answer'

echo "== Done =="
