'use strict';

const fs = require('node:fs');
const path = require('node:path');

describe('Sheikha V6 local release publisher', () => {
  test('is immutable, local-only and evidence-gated', () => {
    const source = fs.readFileSync(
      path.resolve(
        __dirname,
        '../tools/release/sheikha-v6-local-release.js'
      ),
      'utf8'
    );

    expect(source).toContain('Refusing to overwrite existing release');
    expect(source).toContain("report.status !== 'DEB_NATIVE_LIFECYCLE_VERIFIED'");
    expect(source).toContain('Duplicate artifact hashes detected');
    expect(source).toContain('localRegistryOnly: true');
    expect(source).toContain('externalPublishingRequested: false');
    expect(source).toContain('rollbackRequiresHumanApproval: true');
    expect(source).toContain("'git', ['rev-parse', 'HEAD']");
    expect(source).toContain('artifactSourceCommit');
    expect(source).toContain('v5Report.source?.head');
    expect(source).toContain('report.artifacts.candidate.version');
  });
});
