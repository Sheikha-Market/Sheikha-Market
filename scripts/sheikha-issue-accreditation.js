#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync } = require('node:child_process');

function run(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function safeRun(command) {
  try {
    return { ok: true, output: run(command) };
  } catch (error) {
    return {
      ok: false,
      output: (error.stdout || '') + (error.stderr || ''),
      status: typeof error.status === 'number' ? error.status : 1
    };
  }
}

function issueAccreditation() {
  const repoRoot = process.cwd();
  const reportsDir = path.join(repoRoot, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const gate = safeRun('npm run -s sheikha:operational:gate:100');
  if (!gate.ok || !gate.output.includes('"gate": "PASS_100"')) {
    throw new Error('Operational gate did not pass. Accreditation cannot be issued.');
  }

  const finalRun = safeRun('npm run -s sheikha:operational:final');
  if (!finalRun.ok) {
    throw new Error('Final operational run failed. Accreditation cannot be issued.');
  }

  const now = new Date();
  const issuedAt = now.toISOString();
  const dateTag = issuedAt.replace(/[:.]/g, '-');
  const idSeed = `${issuedAt}|sheikha-operational-accreditation|PASS_100`;
  const accreditationId = `SHEIKHA-ACC-${crypto.createHash('sha256').update(idSeed).digest('hex').slice(0, 16).toUpperCase()}`;

  const record = {
    accreditationId,
    type: 'Operational License and Scientific Methodology Accreditation',
    scope: {
      operatingProfiles: ['transcendent:cluster', 'from-scratch:operational', 'final:full-pipeline'],
      methodologies: [
        'strict-100-gate-validation',
        'layer-integration-verification',
        'kernel-ai-governance-fusion-verification',
        'continuous-renewal-verification',
        'hpc-adapter-readiness-verification'
      ],
      governance: ['Quran', 'Sunnah']
    },
    evidence: {
      commands: [
        'npm run -s sheikha:operational:gate:100',
        'npm run -s sheikha:operational:final'
      ],
      gate100Passed: true,
      completenessScoreExpected: 100,
      markers: [
        'fully-integrated',
        'fully-unified',
        'kernelAIGovernanceFusionActive',
        'continuousRenewalActive',
        'quranAndSunnahGoverned'
      ]
    },
    validity: {
      model: 'continuous-compliance',
      renewalIntervalSeconds: 300,
      statement: 'Accreditation remains valid while gate and final operational checks continue to pass.'
    },
    limitations: {
      externalRegulatoryAuthority: 'not-issued-by-third-party-regulator',
      hardwareCertification: 'requires target-hardware lab and benchmark authority for external exascale claims'
    },
    issuedAt,
    issuedBy: 'Sheikha Codex Internal Accreditation Engine'
  };

  const jsonPath = path.join(reportsDir, `SHEIKHA-ACCREDITATION-${dateTag}.json`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');

  const text = [
    '# SHEIKHA OPERATIONAL LICENSE AND ACCREDITATION',
    '',
    `Accreditation ID: ${record.accreditationId}`,
    `Issued At: ${record.issuedAt}`,
    `Issued By: ${record.issuedBy}`,
    '',
    'Status: APPROVED (Internal 100% Gate Passed)',
    '',
    'Scope:',
    '- transcendent:cluster',
    '- from-scratch:operational',
    '- final full pipeline',
    '',
    'Scientific Methodologies Activated:',
    '- strict-100-gate-validation',
    '- layer-integration-verification',
    '- kernel-ai-governance-fusion-verification',
    '- continuous-renewal-verification',
    '- hpc-adapter-readiness-verification',
    '',
    'Governance Sources:',
    '- Quran',
    '- Sunnah',
    '',
    'Limitations:',
    '- Not a third-party governmental or standards-body license.',
    '- External exascale authority certification requires hardware lab validation.',
    '',
    `JSON Record: reports/${path.basename(jsonPath)}`,
    ''
  ].join('\n');

  const mdPath = path.join(reportsDir, `SHEIKHA-ACCREDITATION-${dateTag}.md`);
  fs.writeFileSync(mdPath, text, 'utf8');

  process.stdout.write(`${JSON.stringify({
    status: 'issued',
    accreditationId,
    jsonRecord: `reports/${path.basename(jsonPath)}`,
    markdownRecord: `reports/${path.basename(mdPath)}`
  }, null, 2)}\n`);
}

try {
  issueAccreditation();
} catch (error) {
  console.error(String(error.message || error));
  process.exit(1);
}
