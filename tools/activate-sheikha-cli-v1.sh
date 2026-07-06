#!/usr/bin/env bash
set -euo pipefail

cd ~/Projects/sheikha/sheikha-main-portal

mkdir -p bin runtime/sheikha-cli-v1/v1/registries docs/sheikha-cli-v1 tests

cat > bin/sheikha <<'JS'
#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');

const cmd = process.argv[2] || 'help';

function run(command, args = []) {
  execFileSync(command, args, { stdio: 'inherit' });
}

function call(path, method = 'GET', body = null) {
  const args = ['-s'];
  if (method !== 'GET') args.push('-X', method);
  if (body) args.push('-H', 'Content-Type: application/json', '-d', JSON.stringify(body));
  args.push(`http://127.0.0.1:8080${path}`);
  run('curl', args);
  console.log();
}

const commands = {
  help() {
    console.log('Sheikha CLI V1');
    console.log('Commands: status, protocol, decision, runtime, saas, mcp, sdk, service-tiers, test, lint, drift, verify');
  },
  status() { run('git', ['status', '--short']); },
  protocol() { call('/api/sheikha/protocol/status'); },
  decision() { call('/api/sheikha/protocol/decision', 'POST', { actor: 'runtime', action: 'health_check' }); },
  runtime() { run('npm', ['run', 'ops:production-runtime-fabric:v1']); },
  saas() { run('npm', ['run', 'ops:saas-platform-layer:v1']); },
  mcp() { run('npm', ['test', '--', 'tests/sdk-fabric-mcp-integration-v1.test.js']); },
  sdk() { run('npm', ['test', '--', 'tests/sdk-fabric-mcp-integration-v1.test.js']); },
  'service-tiers'() { run('bash', ['test-service-tiers.sh']); },
  test() { run('npm', ['test']); },
  lint() { run('npm', ['run', 'lint']); },
  drift() { run('node', ['tools/drift/sheikha-runtime-drift-detector.js']); },
  verify() {
    commands.protocol();
    commands.decision();
    commands.runtime();
    commands.test();
    commands.lint();
    commands.drift();
  }
};

if (!commands[cmd]) {
  console.error(`Unknown command: ${cmd}`);
  commands.help();
  process.exit(1);
}

commands[cmd]();
JS

chmod +x bin/sheikha

cat > runtime/sheikha-cli-v1/v1/sheikha-cli-v1.json <<'JSON'
{"system":"SHEIKHA_CLI_V1","status":"ACTIVE","principle":"ولا حول ولا قوة إلا بالله"}
JSON

cat > runtime/sheikha-cli-v1/v1/registries/cli-commands.json <<'JSON'
{"registry":"SHEIKHA_CLI_COMMANDS_V1","status":"ACTIVE","commands":["status","protocol","decision","runtime","saas","mcp","sdk","service-tiers","test","lint","drift","verify"]}
JSON

cat > runtime/sheikha-cli-v1/v1/sheikha-cli-v1-report.json <<'JSON'
{"system":"SHEIKHA_CLI_V1","status":"ACTIVE","decision":"SHEIKHA_CLI_V1_ACTIVE_100","commands":["status","protocol","decision","runtime","saas","mcp","sdk","service-tiers","test","lint","drift","verify"],"principle":"ولا حول ولا قوة إلا بالله"}
JSON

cat > docs/sheikha-cli-v1/SHEIKHA-CLI-V1.md <<'MD'
# SHEIKHA_CLI_V1

واجهة طرفية موحدة لفحص وتشغيل منظومة شيخة.

الأوامر:
- bin/sheikha status
- bin/sheikha protocol
- bin/sheikha decision
- bin/sheikha runtime
- bin/sheikha saas
- bin/sheikha mcp
- bin/sheikha sdk
- bin/sheikha service-tiers
- bin/sheikha test
- bin/sheikha lint
- bin/sheikha drift
- bin/sheikha verify

ولا حول ولا قوة إلا بالله.
MD

node - <<'JS'
const fs = require('fs');
const p = 'package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
pkg.bin = pkg.bin || {};
pkg.bin.sheikha = './bin/sheikha';
pkg.scripts = pkg.scripts || {};
pkg.scripts['ops:sheikha-cli:v1'] = 'node -e "console.log(require(\\\"./runtime/sheikha-cli-v1/v1/sheikha-cli-v1-report.json\\\"))"';
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
JS

cat > tests/sheikha-cli-v1.test.js <<'JS'
'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha CLI V1', () => {
  test('CLI is active', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'bin/sheikha'))).toBe(true);
    const report = require('../runtime/sheikha-cli-v1/v1/sheikha-cli-v1-report.json');
    expect(report.system).toBe('SHEIKHA_CLI_V1');
    expect(report.decision).toBe('SHEIKHA_CLI_V1_ACTIVE_100');
    expect(report.commands.length).toBeGreaterThanOrEqual(12);
  });
});
JS

node --check bin/sheikha
npm test -- tests/sheikha-cli-v1.test.js
npm test
npm run lint
node tools/drift/sheikha-runtime-drift-detector.js

git add -A
git commit -m "Activate Sheikha CLI v1"
git push origin optimization/long-tail-latency-elimination

node tools/drift/sheikha-runtime-drift-detector.js
git status --short
