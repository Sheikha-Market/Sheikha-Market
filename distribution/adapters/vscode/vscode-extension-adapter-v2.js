'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  ROOT,
  fileMetadata,
  resetGeneratedDir,
  run,
  writeJson
} = require('../../common/distribution-utils');
const { scanStageForSecrets } = require('../../common/source-staging-engine');

function stageAndInspectVsix(context) {
  const product = context.products.products.find((item) => item.id === 'sheikha-vscode-extension');
  const sourceName = `sheikha.sheikha-${product.version}.vsix`;
  const sourcePath = path.join(ROOT, 'sheikha-vscode-extension', 'dist', sourceName);
  if (!fs.existsSync(sourcePath)) {
    return {
      id: 'vscode-extension-vsix',
      product: product.id,
      version: product.version,
      status: 'FAILED',
      built: false,
      error: `VSIX artifact is missing: ${path.relative(ROOT, sourcePath)}`
    };
  }
  const artifactName = `sheikha-vscode-extension-${product.version}.vsix`;
  const artifactPath = path.join(context.artifactDir, artifactName);
  fs.copyFileSync(sourcePath, artifactPath);
  const archiveTest = run('unzip', ['-tqq', artifactPath], { allowFailure: true });
  const manifestResult = run('unzip', ['-p', artifactPath, 'extension/package.json'], { allowFailure: true });
  let manifest = null;
  try {
    manifest = JSON.parse(manifestResult.stdout);
  } catch (_) {
    manifest = null;
  }
  const extractionRoot = path.join(context.workingVerificationRoot, 'vscode-extension-vsix');
  resetGeneratedDir(extractionRoot);
  const extraction = run('unzip', ['-qq', artifactPath, '-d', extractionRoot], { allowFailure: true });
  const secretScan = extraction.status === 0
    ? scanStageForSecrets(extractionRoot)
    : { passed: false, findings: [{ path: artifactName, pattern: 'archive-extraction-failed' }] };
  const installed = run('code', ['--list-extensions', '--show-versions'], { allowFailure: true });
  const extensionId = `${manifest?.publisher || 'sheikha'}.${manifest?.name || 'sheikha'}@${product.version}`;
  const nativeInstalled = installed.status === 0 && installed.stdout.split('\n').includes(extensionId);
  const structurePassed = archiveTest.status === 0 &&
    manifest?.version === product.version &&
    manifest?.main === './extension.js' &&
    secretScan.passed;
  const artifact = fileMetadata(artifactPath);
  const verification = {
    system: 'SHEIKHA_VSCODE_EXTENSION_DISTRIBUTION_VERIFICATION_V2',
    artifact,
    version: product.version,
    extensionId,
    archiveIntegrityPassed: archiveTest.status === 0,
    manifestVersionPassed: manifest?.version === product.version,
    entrypointPassed: manifest?.main === './extension.js',
    secretScan,
    installedOnCurrentVsCodeHost: nativeInstalled,
    nativeEvidence: nativeInstalled ? ['VS Code extension inventory contains the exact extension ID and version.'] : [],
    signed: false,
    status: structurePassed && nativeInstalled ? 'VERIFIED' : structurePassed ? 'INSPECTED' : 'FAILED'
  };
  const evidencePath = path.join(context.verificationDir, `${artifactName}.verification.json`);
  writeJson(evidencePath, verification);
  return {
    id: 'vscode-extension-vsix',
    product: product.id,
    version: product.version,
    status: verification.status,
    built: true,
    verified: verification.status === 'VERIFIED',
    nativeVerified: nativeInstalled,
    signed: false,
    notarized: false,
    artifact,
    evidence: path.relative(ROOT, evidencePath),
    verification
  };
}

module.exports = { stageAndInspectVsix };
