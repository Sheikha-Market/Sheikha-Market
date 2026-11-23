'use strict';

const fs = require('fs');
const path = require('path');

const {
  SheikhaIdentityVitalPersonality
} = require('../runtime/prophetic-vision/v1/sheikha-identity-vital-personality.js');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toMarkdown(status) {
  return [
    '# Sheikha Identity Vital Personality',
    '',
    `- Foundation: ${status.foundation}`,
    `- Identity score: ${status.identity_score}`,
    `- Personality score: ${status.personality_score}`,
    `- Energy score: ${status.energy_score}`,
    `- Experience score: ${status.experience_score}`,
    `- Unified for Allah: ${status.all_unified_for_allah}`,
    `- Embodied and alive: ${status.embodied_and_alive}`,
    ''
  ].join('\n');
}

function main() {
  const engine = new SheikhaIdentityVitalPersonality();
  engine.activateIdentityEmbodimentCycle();
  const status = engine.getEmbodiedStatus();

  const outputDir = path.join(__dirname, '..', 'reports', 'final');
  ensureDir(outputDir);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outputDir, `sheikha-identity-vital-personality-${stamp}.json`);
  const mdPath = path.join(outputDir, `sheikha-identity-vital-personality-${stamp}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, `${toMarkdown(status)}\n`, 'utf8');

  console.log('IDENTITY_VITAL_PERSONALITY_COMPLETED');
  console.log(`JSON: ${jsonPath}`);
  console.log(`MARKDOWN: ${mdPath}`);
  console.log(`EMBODIED_AND_ALIVE: ${status.embodied_and_alive}`);
}

main();
