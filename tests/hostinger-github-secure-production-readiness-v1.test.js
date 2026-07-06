const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

describe('Sheikha Hostinger GitHub Secure Production Readiness V1', () => {
  test('saves the secure Hostinger GitHub continuation document', () => {
    const doc = readText(
      'docs/registry/deployment/SHEIKHA-HOSTINGER-GITHUB-SECURE-CONNECTION-V1.md'
    );

    expect(doc).toContain('Sheikha-top/sheikha-enterprise-portal');
    expect(doc).toContain('Only select repositories');
    expect(doc).toContain('CONNECTED_PENDING_PRODUCTION_VERIFICATION');
    expect(doc).toContain('Branch Protection');
    expect(doc).toContain('Secrets Policy');
    expect(doc).toContain('Continuation Prompt');
  });

  test('stores machine-readable production connection controls', () => {
    const report = readJson(
      'docs/registry/deployment/SHEIKHA-HOSTINGER-GITHUB-SECURE-CONNECTION-V1.json'
    );

    expect(report.system).toBe('SHEIKHA_HOSTINGER_GITHUB_SECURE_CONNECTION_V1');
    expect(report.status).toBe('CONNECTED_PENDING_PRODUCTION_VERIFICATION');
    expect(report.productionRepository.fullName).toBe('Sheikha-top/sheikha-enterprise-portal');
    expect(report.productionRepository.hostingerAccessPolicy).toBe('ONLY_SELECT_REPOSITORIES');
    expect(report.developmentSeparation.noAllRepositoriesAccess).toBe(true);
    expect(report.riskControls.leastPrivilege).toBe(true);
    expect(report.riskControls.productionClaimRequiresEvidence).toBe(true);
    expect(report.requiredControls).toEqual(expect.arrayContaining([
      'protected_production_branch',
      'required_ci_checks',
      'secrets_outside_repository',
      'runtime_health_verified',
      'rollback_documented'
    ]));
  });
});
