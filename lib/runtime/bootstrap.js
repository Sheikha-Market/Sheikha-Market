'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

function loadRuntimeEnv() {
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.runtime' });
    dotenv.config();
  } catch (_) {}
}

function readGitMetadata(rootDir) {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();
    const commit = execSync('git rev-parse --short HEAD', {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();
    return { branch, commit };
  } catch (_) {
    return {
      branch: process.env.GIT_BRANCH || 'stable/runtime-baseline',
      commit: process.env.GIT_COMMIT || 'unknown'
    };
  }
}

function calculateSha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function verifyRuntimeFingerprint(rootDir, strictFingerprint) {
  const fpPath = path.join(rootDir, '.runtime-fingerprint');
  if (!fs.existsSync(fpPath)) {
    return { enabled: false, status: 'missing-fingerprint-file', mismatches: [] };
  }

  const lines = fs.readFileSync(fpPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'));

  const mismatches = [];

  for (const line of lines) {
    const match = line.match(/^([a-f0-9]{64})\s+\*?(.+)$/i);
    if (!match) continue;

    const expected = match[1].toLowerCase();
    const relativePath = match[2];
    const absolutePath = path.join(rootDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
      mismatches.push({ file: relativePath, reason: 'missing-file' });
      continue;
    }

    const actual = calculateSha256(absolutePath);
    if (actual !== expected) {
      mismatches.push({ file: relativePath, reason: 'hash-mismatch', expected, actual });
    }
  }

  const status = mismatches.length === 0 ? 'verified' : 'mismatch';
  if (status === 'mismatch') {
    console.warn('⚠️ [RUNTIME-FINGERPRINT] Mismatch detected:', JSON.stringify(mismatches));
    if (strictFingerprint) {
      console.error('🚫 [RUNTIME-FINGERPRINT] Strict mode enabled. Startup blocked.');
      process.exit(1);
    }
  }

  return { enabled: true, status, mismatches };
}

function enableOptionalWarningFilter(enabled) {
  const nativeWarn = console.warn.bind(console);
  const optionalWarningPatterns = [
    /\bis not defined\b/i,
    /Cannot find module/i,
    /\bis not a constructor\b/i,
    /Cannot read properties of null/i
  ];

  console.warn = (...args) => {
    if (enabled) {
      const text = args.map((a) => (typeof a === 'string' ? a : (a && a.message) ? a.message : String(a))).join(' ');
      if (optionalWarningPatterns.some((rx) => rx.test(text))) {
        console.log('⏸️ [OPTIONAL] ' + text);
        return;
      }
    }
    nativeWarn(...args);
  };
}

module.exports = function bootstrapRuntime(options = {}) {
  const rootDir = options.rootDir || path.resolve(__dirname, '../..');

  loadRuntimeEnv();

  const runtimeRing = process.env.SHEIKHA_RUNTIME_RING || 'stable';
  const strictFingerprint = process.env.SHEIKHA_RUNTIME_STRICT_FINGERPRINT === 'true';
  const suppressOptionalWarnings = process.env.SHEIKHA_SUPPRESS_OPTIONAL_WARNINGS !== 'false';

  enableOptionalWarningFilter(suppressOptionalWarnings);

  const gitMetadata = readGitMetadata(rootDir);
  const fingerprintStatus = verifyRuntimeFingerprint(rootDir, strictFingerprint);
  let observability = null;

  try {
    const { initObservability } = require('../observability');
    observability = initObservability({
      rootDir,
      ring: runtimeRing,
      intervalMs: Number(process.env.SHEIKHA_OBSERVABILITY_INTERVAL_MS || 30000)
    });
    console.log('✅ [OBS] observability active | metrics dir:', observability.metricsDir);
  } catch (err) {
    console.warn('⚠️ [OBS] observability unavailable:', err.message);
  }

  let runtimeCore = null;
  try {
    runtimeCore = require('./index');
    runtimeCore.init().catch((err) => {
      console.warn('⚠️ [RUNTIME] init failed:', err.message);
    });
    console.log('✅ [RUNTIME] core layer active');
  } catch (err) {
    console.warn('⚠️ [RUNTIME] core layer unavailable:', err.message);
  }

  console.log('📜 [CHARTER] الميثاق مُفعّل | L0-only: true');
  console.log('═══════════════════════════════════════════════════════════════════════════════');

  return {
    SHEIKHA_CHARTER_ENFORCED: true,
    STARTUP_L0_ONLY: true,
    MCP_DENY_BY_DEFAULT: true,
    SHEIKHA_RUNTIME_RING: runtimeRing,
    SHEIKHA_RUNTIME_STRICT_FINGERPRINT: strictFingerprint,
    SHEIKHA_SUPPRESS_OPTIONAL_WARNINGS: suppressOptionalWarnings,
    GIT_METADATA: gitMetadata,
    RUNTIME_FINGERPRINT_STATUS: fingerprintStatus,
    runtimeCore,
    observability
  };
};
