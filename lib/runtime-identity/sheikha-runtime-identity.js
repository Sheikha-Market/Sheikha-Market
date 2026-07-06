'use strict';

const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readOptionalJson(filePath) {
  try {
    return readJson(filePath);
  } catch {
    return null;
  }
}

function getRuntimeIdentity(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const packageJson = readJson(path.join(rootDir, 'package.json'));
  const operatingSystem = readOptionalJson(
    path.join(rootDir, 'runtime/operating-system/v1/sheikha-operating-system-v1.json')
  );
  const operatingSystemReport = readOptionalJson(
    path.join(rootDir, 'runtime/operating-system/v1/sheikha-operating-system-report.json')
  );
  const rootIdentity = readOptionalJson(
    path.join(rootDir, 'runtime/root-identity/v1/sheikha-root-identity-v1.json')
  );
  const rootOperatingCore = readOptionalJson(
    path.join(rootDir, 'runtime/root-operating-core/v1/sheikha-root-operating-core-v1.json')
  );

  const namingPolicy = operatingSystem?.naming_policy || {};
  const rootOfficialIdentity = rootIdentity?.official_identity || {};

  return {
    system: operatingSystem?.system || 'SHEIKHA_OPERATING_SYSTEM_V1',
    status: operatingSystemReport?.status || operatingSystem?.status || 'ACTIVE',
    packageName: packageJson.name,
    packageDisplayName: packageJson.displayName || null,
    highestIdentitySystem: rootIdentity?.system || 'SHEIKHA_ROOT_IDENTITY_V1',
    highestIdentityName: rootOfficialIdentity.english || 'Sheikha Root',
    highestIdentityArabic: rootOfficialIdentity.arabic || 'جذر شيخة',
    officialName: operatingSystem?.official_name || 'Sheikha Operating System',
    arabicName: operatingSystem?.arabic_name || 'نظام تشغيل شيخة',
    rootOperatingCore: rootOperatingCore?.official_name || namingPolicy.highest_runtime_core_name || 'Sheikha Root Operating Core',
    rootOperatingCoreArabic: rootOperatingCore?.arabic_name || 'جذر تشغيل شيخة الأعلى',
    highestMethodologicalName: namingPolicy.highest_methodological_name || 'Sheikha Operating System',
    legacyRepositoryName: namingPolicy.legacy_repository_name || 'sheikha-main-portal',
    legacyShortName: namingPolicy.legacy_short_name || 'portal',
    portalIsCompatibilityLayer: namingPolicy.portal_is_compatibility_layer === true,
    doNotBreakExistingPaths: namingPolicy.do_not_break_existing_paths === true,
    actualBinding: {
      packageIdentity: packageJson.name === 'sheikha-operating-system',
      expressRuntimeIdentity: true,
      directRuntimeEndpoint: '/api/runtime/identity/status',
      directOperatingSystemEndpoint: '/api/operating-system/status',
      directRootIdentityEndpoint: '/api/root-identity/status',
      fabricMount: '/api/operating-system'
    },
    principle: operatingSystem?.principle || 'ولا حول ولا قوة إلا بالله'
  };
}

module.exports = {
  getRuntimeIdentity
};
