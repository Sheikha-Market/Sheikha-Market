const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

describe('Sheikha operating system naming contracts', () => {
  test('operating system is the highest methodological layer above root operating core', () => {
    const operatingSystem = readJson('runtime/operating-system/v1/sheikha-operating-system-v1.json');

    expect(operatingSystem.system).toBe('SHEIKHA_OPERATING_SYSTEM_V1');
    expect(operatingSystem.status).toBe('ACTIVE');
    expect(operatingSystem.official_name).toBe('Sheikha Operating System');
    expect(operatingSystem.position).toBe('ABOVE_ROOT_OPERATING_CORE');
    expect(operatingSystem.operating_order.slice(0, 2)).toEqual([
      'operating_system',
      'root_operating_core'
    ]);
  });

  test('legacy portal names remain compatibility aliases only', () => {
    const operatingSystem = readJson('runtime/operating-system/v1/sheikha-operating-system-v1.json');

    expect(operatingSystem.naming_policy.highest_methodological_name).toBe('Sheikha Operating System');
    expect(operatingSystem.naming_policy.highest_runtime_core_name).toBe('Sheikha Root Operating Core');
    expect(operatingSystem.naming_policy.legacy_repository_name).toBe('sheikha-main-portal');
    expect(operatingSystem.naming_policy.portal_is_compatibility_layer).toBe(true);
    expect(operatingSystem.naming_policy.do_not_break_existing_paths).toBe(true);
  });

  test('operating system activation report is governed and complete', () => {
    const report = readJson('runtime/operating-system/v1/sheikha-operating-system-report.json');

    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('SHEIKHA_OPERATING_SYSTEM_V1_READY');
    expect(report.missing).toEqual([]);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
  });
});
