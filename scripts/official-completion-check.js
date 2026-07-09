'use strict';

const fs = require('fs');
const path = require('path');

function findLatestDossier() {
  const finalDir = path.join(__dirname, '..', 'reports', 'final');
  if (!fs.existsSync(finalDir)) {
    throw new Error('Final reports directory does not exist');
  }

  const files = fs.readdirSync(finalDir)
    .filter(name => name.startsWith('sheikha-final-officialization-dossier-') && name.endsWith('.json'))
    .map(name => path.join(finalDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (files.length === 0) {
    throw new Error('No final officialization dossier found');
  }

  return files[0];
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function checkCompletion(data) {
  const dossier = data.dossier || {};
  const status = data.status || {};

  const checks = {
    end_to_end_official_completion: dossier.end_to_end_official_completion === true,
    official_status_active: status.official_status_active === true,
    external_submission_ready: status.external_submission_ready === true,
    global_authorities_coverage_active: status.global_authorities_coverage_active === true,
    licensing_and_accreditation_ready: status.licensing_and_accreditation_ready === true,
    documentation_ready: status.documentation_ready === true,
    full_integration_activated: status.full_integration_activated === true,
    saudi_authorities_count: (dossier.authorities?.saudi || []).length >= 4,
    international_authorities_count: (dossier.authorities?.international || []).length >= 4,
    global_authorities_count: (dossier.authorities?.global || []).length >= 3,
    licenses_count: (dossier.active_records?.licenses || 0) >= 12,
    accreditations_count: (dossier.active_records?.accreditations || 0) >= 12,
    documentation_count: (dossier.active_records?.documentation || 0) >= 3
  };

  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);

  return {
    checks,
    ok: failed.length === 0,
    failed
  };
}

function main() {
  const latest = findLatestDossier();
  const data = readJson(latest);
  const result = checkCompletion(data);

  console.log('OFFICIAL_COMPLETION_CHECK');
  console.log(`DOSSIER: ${latest}`);
  console.log(`RESULT: ${result.ok ? 'PASS' : 'FAIL'}`);
  console.log(JSON.stringify(result.checks, null, 2));

  if (!result.ok) {
    console.error(`FAILED_CHECKS: ${result.failed.join(', ')}`);
    process.exit(1);
  }
}

main();
