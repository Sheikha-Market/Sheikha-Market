'use strict';
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const base = path.join(root, 'runtime/foundry');
const dirs = ['knowledge', 'decisions', 'lessons', 'patterns', 'reports'];

for (const d of dirs) fs.mkdirSync(path.join(base, d), { recursive: true });

const decision = path.join(base, 'decisions/conversation-engine-routing.json');
if (!fs.existsSync(decision)) {
  fs.writeFileSync(decision, JSON.stringify({
    type: 'DECISION',
    title: 'Route VS Code chat through Sheikha Conversation Engine',
    status: 'ACTIVE',
    engine: 'SHEIKHA_FOUNDRY_KNOWLEDGE_STORE_V1',
    createdAt: new Date().toISOString()
  }, null, 2) + '\n');
}

console.log(JSON.stringify({
  success: true,
  engine: 'SHEIKHA_FOUNDRY_KNOWLEDGE_STORE_V1',
  decision
}, null, 2));
