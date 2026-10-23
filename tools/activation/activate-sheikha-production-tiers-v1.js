'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildProductionTierReadiness } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-production-tier-readiness-v1'
);

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const report = buildProductionTierReadiness({
  arabicFoundation: read('core/language/sheikha-arabic/arabic-language-foundation.json'),
  gpu: read('runtime/sheikha-ai-governor/v1/llm-training/sheikha-gpu-runtime-readiness-v1.json'),
  security: read('runtime/security/semantic-secret-scan-v1.json'),
  load: read('runtime/chat-commercial-readiness/v1/sheikha-chat-commercial-load-v1.json'),
  sustained: read('runtime/chat-commercial-readiness/v1/sheikha-chat-commercial-sustained-v1.json'),
  recovery: read('runtime/chat-commercial-readiness/v1/sheikha-chat-commercial-recovery-v1.json'),
  commercialLegalApproval: false
});
const output = path.join(root,
  'runtime/sheikha-ai-governor/v1/llm-training/sheikha-production-tier-readiness-v1.json');
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
