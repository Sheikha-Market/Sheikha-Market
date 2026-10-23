'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createGovernorRegistry } = require(
  '../../runtime/sheikha-ai-governor/v1/sheikha-ai-governor-v1'
);

const root = path.resolve(__dirname, '../..');
const output = path.join(
  root,
  'runtime/sheikha-ai-governor/v1/sheikha-ai-governor-registry-v1.json'
);

const models = [
  {
    id: 'sheikha-core',
    provider: 'sheikha',
    source: 'local://lib/sheikha-core-runtime.js',
    licenseState: 'LOCAL_ORIGINAL',
    capabilities: ['arabic', 'governance', 'routing', 'tools'],
    local: true,
    enabled: true
  },
  {
    id: 'ollama-local-models',
    provider: 'ollama',
    source: 'local://ollama',
    licenseState: 'UNKNOWN',
    capabilities: ['generation'],
    local: true,
    enabled: false
  },
  {
    id: 'openai-compatible',
    provider: 'openai-compatible',
    source: 'provider://openai-compatible',
    licenseState: 'UNKNOWN',
    capabilities: ['generation', 'reasoning'],
    enabled: false
  },
  {
    id: 'anthropic-compatible',
    provider: 'anthropic-compatible',
    source: 'provider://anthropic-compatible',
    licenseState: 'UNKNOWN',
    capabilities: ['generation', 'reasoning'],
    enabled: false
  }
];

const registry = createGovernorRegistry(models);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  system: registry.system,
  status: registry.status,
  summary: registry.summary,
  registrySha256: registry.registrySha256,
  output: path.relative(root, output),
  networkUsed: false,
  modelsDownloaded: false,
  defaultAuthorization: registry.governance.defaultAuthorization
}, null, 2));
