'use strict';

const fs = require('fs');
const path = require('path');

const {
  SheikhaDivineIntegrationArchitecture
} = require('../runtime/prophetic-vision/v1/sheikha-divine-integration-architecture.js');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function buildMarkdown(dossier) {
  const lines = [
    '# Sheikha Final Officialization Dossier',
    '',
    '## Status',
    `- End-to-end completion: ${dossier.end_to_end_official_completion ? 'ACTIVE' : 'INACTIVE'}`,
    `- Generated at: ${dossier.generated_at}`,
    '',
    '## Authority Coverage',
    `- Saudi authorities: ${dossier.authorities.saudi.length}`,
    `- International authorities: ${dossier.authorities.international.length}`,
    `- Global authorities: ${dossier.authorities.global.length}`,
    '',
    '## Active Records',
    `- Licenses: ${dossier.active_records.licenses}`,
    `- Accreditations: ${dossier.active_records.accreditations}`,
    `- Documentation: ${dossier.active_records.documentation}`,
    '',
    '## Official Decrees',
    ...dossier.decree_records.map(record => `- ${record.id} | ${record.status} | ${record.reference_no}`),
    '',
    '## Submission Channels',
    ...dossier.submission_channels.map(channel => `- ${channel.id} | ${channel.status} | ${channel.scope}`),
    ''
  ];

  return lines.join('\n');
}

function run() {
  const architecture = new SheikhaDivineIntegrationArchitecture();
  const dossier = architecture.generateFinalOfficializationDossier();
  const status = architecture.getArchitectureStatus();

  const outputDir = path.join(__dirname, '..', 'reports', 'final');
  ensureDir(outputDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outputDir, `sheikha-final-officialization-dossier-${timestamp}.json`);
  const mdPath = path.join(outputDir, `sheikha-final-officialization-dossier-${timestamp}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify({ dossier, status }, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, `${buildMarkdown(dossier)}\n`, 'utf8');

  console.log('FINAL_OFFICIALIZATION_EXPORT_COMPLETED');
  console.log(`JSON: ${jsonPath}`);
  console.log(`MARKDOWN: ${mdPath}`);
  console.log(`END_TO_END_COMPLETION: ${dossier.end_to_end_official_completion}`);
}

run();
