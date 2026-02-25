'use strict';
/**
 * تشغيل:
 *  node scripts/ollama-models-sync.js --plan
 *  OLLAMA_ALLOW_PULL=true node scripts/ollama-models-sync.js --apply
 */
const SheikhaOllamaOrchestrator = require('../lib/sheikha-ollama-orchestrator');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const dryRun = !apply;

const orchestrator = new SheikhaOllamaOrchestrator();
const result = orchestrator.syncModels({ dryRun });

console.log('════════════════════════════════════════════');
console.log('🧠 SHEIKHA OLLAMA MODEL ORCHESTRATOR');
console.log('════════════════════════════════════════════');
console.log(`Profile: ${result.profile}`);
console.log(`Best: ${result.bestModel}`);
console.log(`CPU Cores: ${result.resources.cpuCores}`);
console.log(`RAM: ${result.resources.totalRamGb} GB (free ${result.resources.freeRamGb} GB)`);
if (result.resources.diskTotalGb != null) {
    console.log(`Disk: ${result.resources.diskTotalGb} GB (free ${result.resources.diskFreeGb} GB)`);
}
console.log('');
console.log('Recommended Models:');
for (const m of result.recommended) {
    console.log(` - ${m.id} [${m.tier}]`);
}
console.log('');
if (dryRun) {
    console.log('Mode: PLAN ONLY (no pull)');
    console.log('To apply pulls: OLLAMA_ALLOW_PULL=true node scripts/ollama-models-sync.js --apply');
} else {
    console.log('Mode: APPLY');
}
console.log('');
console.log('Policy: لا ضرر ولا ضرار');
for (const c of result.policy.controls) {
    console.log(` - ${c}`);
}
console.log('════════════════════════════════════════════');

