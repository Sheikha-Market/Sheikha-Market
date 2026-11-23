#!/usr/bin/env node
'use strict';
const path = require('node:path');
const api = require('../../core/scientific-knowledge/index.cjs');

function main(args) {
  let registry = path.resolve(__dirname, '../../SHEIKHA-CORE/blockchain/registry.json'), output;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help') {
      console.log('Usage: node tools/scientific-knowledge/sheikha-scientific-knowledge-v1.cjs [--registry FILE] [--output NEW_FILE]\nDefault: read-only summary. --output exclusively creates a blueprint; no registry changes or training.');
      return;
    }
    if (!['--registry', '--output'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('INVALID_ARGUMENT');
    const key = args[i++];
    if (key === '--registry') registry = path.resolve(args[i]); else if (output) throw new Error('DUPLICATE_OUTPUT'); else output = path.resolve(args[i]);
  }
  const knowledge = api.loadKnowledge();
  const snapshot = api.readSnapshot(registry);
  const blueprint = api.buildBlueprint(snapshot, knowledge);
  const summary = {
    status: blueprint.status,
    knowledge: blueprint.knowledge,
    registry: blueprint.registry,
    recordProfiles: blueprint.records.length,
    categoryProfiles: blueprint.categories.length,
    totalProfiles: blueprint.records.length + blueprint.categories.length,
    additionalDomainBlueprints: blueprint.domainBlueprints.length,
    topics: knowledge.data.topics.length,
    sourceCount: knowledge.data.sources.length,
    boundaries: blueprint.boundaries,
  };
  if (output) summary.output = api.writeExclusive(output, blueprint);
  console.log(JSON.stringify(summary, null, 2));
}
if (require.main === module) { try { main(process.argv.slice(2)); } catch (error) { console.error('SCIENTIFIC_KNOWLEDGE_ERROR:', error.code || error.message); process.exitCode = 1; } }
module.exports = { main };
