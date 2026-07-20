'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SYSTEM = 'SHEIKHA_ROOT_VERIFIER_V3';

const REQUIRED_PATHS = Object.freeze([
  'runtime/root-architecture/v3/sheikha-root-architecture-v3.json',
  'runtime/root-architecture/v3/sheikha-root-capability-graph-v3.json',
  'runtime/gardens-and-trees/v3/sheikha-gardens-and-trees-v3.json',
  'runtime/system-builder/root/v1/sheikha-system-builder-root-v1.json',
  'runtime/reasoning-governance/v2/sheikha-logical-reasoning-governance-v2.js',
  'runtime/islamic-reference-governance/v1/sheikha-quran-sunnah-reference-policy-v1.json',
  'runtime/uefi-capability-registry/v2/sheikha-uefi-capability-registry-v2.json',
  'runtime/site-unification/v2/sheikha-site-unification-v2.json',
  'core/sheikha-logic/sheikha-logic-governance-engine-v1.js',
  'core/product-runtime/sheikha-unified-product-runtime-v1.js',
  'runtime/bare-metal/v2/uefi-integration/v1/sheikha-uefi-capability-registry-v1.json',
  'core/site-registry/sheikha-site-registry-v2.js'
]);

function verify(root = path.resolve(__dirname, '../../..')) {
  const missing = REQUIRED_PATHS.filter(relativePath => {
    return !fs.existsSync(path.join(root, relativePath));
  });

  return {
    system: SYSTEM,
    status: missing.length === 0
      ? 'VERIFIED'
      : 'FAIL_CLOSED',
    requiredPathCount: REQUIRED_PATHS.length,
    missing,
    allUefiProtocolsImplemented: false,
    allDevicesWorldwideSupported: false,
    physicalHardwareBootVerified: false,
    secureBootVerified: false,
    productionSiteDeployed: false
  };
}

module.exports = Object.freeze({
  SYSTEM,
  REQUIRED_PATHS,
  verify
});
