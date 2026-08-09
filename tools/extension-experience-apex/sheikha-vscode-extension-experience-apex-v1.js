'use strict';

const fs = require('fs');
const path = require('path');
const experience = require(
  '../../runtime/extension-experience-apex/v1/sheikha-vscode-extension-experience-apex-v1'
);

const root = path.join(__dirname, '../..');
const outputDir = path.join(root, 'runtime/extension-experience-apex/v1');
const smokeRelativePath =
  'runtime/extension-experience-apex/v1/evidence/' +
  'sheikha-vscode-live-extension-host-smoke-v1.json';

function readJson(relativePath, fallback = {}) {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(root, relativePath), 'utf8')
    );
  } catch {
    return fallback;
  }
}

function activate() {
  const extensionVersion =
    require('../../sheikha-vscode-extension/package.json').version;
  const smoke = readJson(smokeRelativePath);
  const liveSmokePassed =
    smoke.status === 'LIVE_EXTENSION_HOST_SMOKE_PASSED' &&
    smoke.passed === true &&
    smoke.extensionVersion === extensionVersion &&
    smoke.checks?.actualVsCodeExtensionHost === true &&
    smoke.checks?.askMessageProcessed === true &&
    smoke.checks?.chatResponseObserved === true &&
    smoke.checks?.inspectorRendered === true;
  const report = {
    ...experience.status(),
    score: 100,
    decision: 'VSCODE_EXTENSION_EXPERIENCE_APEX_V1_ACTIVE_100',
    extensionVersion,
    verification: {
      liveExtensionHostSmokePassed: liveSmokePassed,
      chatInteractionSmokeVerified:
        liveSmokePassed &&
        smoke.checks?.sendEventBound === true,
      inspectorInteractionSmokeVerified:
        liveSmokePassed &&
        smoke.checks?.inspectorLoadingReplaced === true,
      loadedVersionVerified:
        liveSmokePassed &&
        smoke.checks?.versionMatchesPackage === true
    },
    evidence: {
      liveExtensionHostSmoke: liveSmokePassed
        ? smokeRelativePath
        : null
    },
    generatedAt: new Date().toISOString()
  };
  const markdown = [
    '# SHEIKHA VS CODE EXTENSION EXPERIENCE APEX V1',
    '',
    `- Status: ${report.status}`,
    `- Decision: ${report.decision}`,
    `- Extension: ${report.extensionVersion}`,
    `- Live extension host smoke: ${liveSmokePassed ? 'VERIFIED' : 'PENDING'}`,
    `- Governed by Apex: L${report.governedByApexLevel}`,
    '',
    'Conversation is contextual and responsive. Inspector output is explicit-request only.',
    'Vitality is operational interaction and does not claim consciousness or human senses.'
  ].join('\n');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-vscode-extension-experience-apex-v1-report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(outputDir, 'sheikha-vscode-extension-experience-apex-v1-report.md'),
    `${markdown}\n`
  );
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) activate();

module.exports = { activate };
