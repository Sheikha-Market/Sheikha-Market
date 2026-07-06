'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();

const includeFiles = [
  '.env',
  'deploy_production.sh',
  'setup_ultimate_ai.sh',
  'php-ai-cluster/app.py',
  'php-ai-extension/extension.js',
  'routes/sdk.js',
  'lib/sheikha-api-webhook-token-center.js',
  'scripts/release-gate.js',
  'scripts/sheikha-daily-report.sh',
  'scripts/activate-root-neural-php.php'
];

const riskyPatterns = [
  { id: 'openai_key', regex: /OPENAI_API_KEY\s*=\s*(sk-[A-Za-z0-9_\-]{20,})/ },
  { id: 'google_secret', regex: /GOOGLE_CLIENT_SECRET\s*=\s*(GOCSPX-[A-Za-z0-9_\-]+)/ },
  { id: 'jwt_secret', regex: /JWT_SECRET\s*=\s*([A-Za-z0-9+/=_\-]{32,})/ },
  { id: 'stripe_live', regex: /(sk_live_[A-Za-z0-9_]{20,})/ },
  { id: 'stripe_test', regex: /(sk_test_[A-Za-z0-9_]{20,})/ },
  { id: 'publishable_key', regex: /(pk_live_[A-Za-z0-9_]{20,}|pk_test_[A-Za-z0-9_]{20,})/ },
  { id: 'webhook_secret', regex: /(whsec_[A-Za-z0-9_]{20,})/ }
];

function isFalsePositive(line) {
  return (
    line.includes('Math.random') ||
    line.includes('crypto.randomBytes') ||
    line.includes('process.env.') ||
    line.includes('os.environ.get') ||
    line.includes('CHANGE_ME') ||
    line.includes('REPLACE_WITH') ||
    line.trim().startsWith('#') ||
    line.includes('YOUR_') ||
    line.includes('your_') ||
    line.includes("requiredFiles") ||
    line.includes("requiredEnvKeys") ||
    line.includes("preg_match")
  );
}

const findings = [];

for (const rel of includeFiles) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;

  const text = fs.readFileSync(file, 'utf8');
  text.split(/\r?\n/).forEach((line, index) => {
    if (isFalsePositive(line)) return;

    for (const pattern of riskyPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        findings.push({
          type: pattern.id,
          file: rel,
          line: index + 1,
          redacted: line.replace(match[1], '[REDACTED_SECRET]')
        });
      }
    }
  });
}

const report = {
  system: 'SHEIKHA_SEMANTIC_SECRET_SCAN_V1',
  status: findings.length ? 'BLOCKED' : 'PASSED',
  scannedFiles: includeFiles,
  findings,
  checkedAt: new Date().toISOString()
};

fs.mkdirSync(path.join(root, 'runtime/security'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'runtime/security/semantic-secret-scan-v1.json'),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exit(1);
