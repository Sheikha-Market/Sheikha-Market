'use strict';

const fs = require('fs');
const path = require('path');

function buildReleaseStabilizationReport() {
  const releaseFile = path.join(process.cwd(), 'release/SHEIKHA-RELEASE-STABILIZATION-V1.json');
  const release = JSON.parse(fs.readFileSync(releaseFile, 'utf8'));

  return {
    ...release,
    generatedAt: new Date().toISOString(),
    checks: {
      releaseFile: fs.existsSync(releaseFile),
      docs: fs.existsSync(path.join(process.cwd(), 'docs/release/SHEIKHA-RELEASE-STABILIZATION-V1.md')),
      noExternalMutation: release.governance.noExternalMutation === true,
      noHarm: release.governance.noHarm === true
    }
  };
}

if (require.main === module) {
  const report = buildReleaseStabilizationReport();
  fs.mkdirSync('runtime/release-stabilization', { recursive: true });
  fs.writeFileSync(
    'runtime/release-stabilization/sheikha-release-stabilization-v1-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log(JSON.stringify(report, null, 2));
}

module.exports = { buildReleaseStabilizationReport };
