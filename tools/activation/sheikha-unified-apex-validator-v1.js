'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
const manifestPath = path.join(__dirname, 'sheikha-unified-apex-manifest-v1.json');

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function validate(options = {}) {
  const manifest = loadJson(manifestPath);
  const packageJson = loadJson(path.join(root, 'package.json'));
  const referenceRegistry = require(
    '../../runtime/civilization-command-intelligence-plane/governance-reference-registry'
  ).status();
  const errors = [];
  const warnings = [];

  if (manifest.system !== 'SHEIKHA_UNIFIED_APEX_ACTIVATION_V1') {
    errors.push('Unexpected activation manifest identity.');
  }

  const orders = manifest.canonicalOrder.map(item => item.order);
  if (orders.some((order, index) => order !== index + 1)) {
    errors.push('Canonical authority order must be consecutive and deterministic.');
  }

  manifest.requiredFiles.forEach((file) => {
    if (!fs.existsSync(path.join(root, file))) errors.push(`Required file is missing: ${file}`);
  });

  manifest.activationScripts.forEach((script) => {
    if (!packageJson.scripts?.[script]) errors.push(`Required npm script is missing: ${script}`);
  });

  const manifestReferences = manifest.governanceReferences;
  const generatedReportPaths = manifest.generatedReportPaths || [];
  const registryReferences = referenceRegistry.references.map(item => item.id);
  if (new Set(manifestReferences).size !== manifestReferences.length) {
    errors.push('Governance reference identifiers must be unique.');
  }
  manifestReferences.forEach((reference) => {
    if (!registryReferences.includes(reference)) {
      errors.push(`Governance reference is not registered: ${reference}`);
    }
  });

  if (!generatedReportPaths.length) {
    errors.push('Generated report paths must be declared for clean activation.');
  }
  if (new Set(generatedReportPaths).size !== generatedReportPaths.length) {
    errors.push('Generated report paths must be unique.');
  }
  generatedReportPaths.forEach((file) => {
    if (!file || path.isAbsolute(file) || file.includes('..')) {
      errors.push(`Generated report path is unsafe: ${file}`);
    } else if (!fs.existsSync(path.join(root, file))) {
      errors.push(`Generated report file is missing: ${file}`);
    }
  });

  if (!referenceRegistry.boundaries.noAutomatedFatwa ||
      !referenceRegistry.boundaries.humanScholarlyReviewForReligiousInterpretation) {
    errors.push('Religious-reference safety boundaries are incomplete.');
  }

  const external = manifest.truthfulExternalState;
  const externalNotOperational = Object.entries(external)
    .filter(([, value]) => value === 'NOT_CONNECTED' || value === 'READY_NOT_CONFIGURED')
    .map(([name]) => name);
  if (externalNotOperational.length) {
    warnings.push(`External infrastructure is not fully operational: ${externalNotOperational.join(', ')}`);
  }
  if (options.strictExternal && externalNotOperational.length) {
    errors.push('Strict external verification failed because external infrastructure is not connected.');
  }

  const report = {
    validator: 'SHEIKHA_UNIFIED_APEX_VALIDATOR_V1',
    status: errors.length ? 'FAILED' : 'PASSED',
    checks: {
      canonicalLayers: manifest.canonicalOrder.length,
      activationScripts: manifest.activationScripts.length,
      requiredFiles: manifest.requiredFiles.length,
      generatedReports: generatedReportPaths.length,
      governanceReferences: manifestReferences.length,
      religiousSafetyBoundaries: true
    },
    externalState: external,
    warnings,
    errors,
    generatedAt: new Date().toISOString()
  };

  return report;
}

if (require.main === module) {
  const report = validate({ strictExternal: process.argv.includes('--strict-external') });
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'PASSED') process.exitCode = 1;
}

module.exports = { validate };
