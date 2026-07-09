'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const reportPath = 'runtime/identity-engine/v1/sheikha-identity-engine-v1-report.json';

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function safeReadJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function scoreFromChecks(checks) {
  const values = Object.values(checks);
  const passed = values.filter(Boolean).length;
  return {
    passed,
    total: values.length,
    score: values.length === 0 ? 0 : Math.round((passed / values.length) * 100)
  };
}

function buildReport() {
  const runtimeIdentity = safeReadJson('runtime/identity/sheikha-active-identity-v2-report.json');
  const publicHealth = safeReadJson('public/executive-civilization-control-center/identity.health.json');
  const designTokens = safeReadJson('public/executive-civilization-control-center/identity.tokens.json');

  const checks = {
    runtimeIdentityPresent: Boolean(runtimeIdentity),
    publicHealthPresent: Boolean(publicHealth),
    designTokensPresent: Boolean(designTokens),
    runtimeIdentityActive: runtimeIdentity?.status === 'ACTIVE',
    publicHealthActive: publicHealth?.status === 'ACTIVE',
    truthGateLinked: designTokens?.constraints?.truthGateLinked === true,
    governanceBoundaries: runtimeIdentity?.governance?.quranSunnahBoundaries === true,
    noSoulImages: designTokens?.constraints?.noImagesOfSouls === true
  };

  const summary = scoreFromChecks(checks);

  return {
    system: 'SHEIKHA_IDENTITY_ENGINE_V1',
    status: summary.score === 100 ? 'ACTIVE' : summary.score >= 75 ? 'STABLE' : 'REVIEW_REQUIRED',
    generatedAt: new Date().toISOString(),
    score: summary.score,
    passed: summary.passed,
    total: summary.total,
    sourceOfTruth: 'runtime/identity/sheikha-active-identity-v2-report.json',
    checks,
    domains: {
      visualIdentity: {
        theme: designTokens?.theme || null,
        palette: designTokens?.palette || null
      },
      writingIdentity: {
        rtl: designTokens?.rtl === true,
        identityLabel: designTokens?.identity || null
      },
      designIdentity: {
        responsiveLayoutsPresent: runtimeIdentity?.checks?.responsiveLayoutsPresent === true,
        designTokensPresent: runtimeIdentity?.checks?.designTokensPresent === true
      },
      commercialIdentity: {
        truthGateLinked: designTokens?.constraints?.truthGateLinked === true,
        humanApprovalRequiredForHighImpact: designTokens?.constraints?.humanApprovalRequiredForHighImpact === true
      },
      knowledgeIdentity: {
        quranSunnahBoundaries: runtimeIdentity?.governance?.quranSunnahBoundaries === true,
        recommendation: runtimeIdentity?.recommendation || null
      },
      runtimeIdentity: {
        status: runtimeIdentity?.status || null,
        autoDevProcess: runtimeIdentity?.autoDevProcess || null
      },
      apiIdentity: {
        uiPath: runtimeIdentity?.uiPath || null,
        healthArtifact: 'public/executive-civilization-control-center/identity.health.json'
      },
      executiveIdentity: {
        executiveHealthScore: publicHealth?.score || null,
        governance: publicHealth?.governance || null
      }
    },
    sources: {
      runtimeIdentity: 'runtime/identity/sheikha-active-identity-v2-report.json',
      publicHealth: 'public/executive-civilization-control-center/identity.health.json',
      designTokens: 'public/executive-civilization-control-center/identity.tokens.json'
    },
    principle: 'هوية واحدة متعددة المجالات تحت مرجع موحد صادق قابل للتحقق'
  };
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(resolve(reportPath)), { recursive: true });
  fs.writeFileSync(resolve(reportPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) {
  console.log(JSON.stringify(writeReport(), null, 2));
}

module.exports = {
  buildReport,
  scoreFromChecks,
  writeReport
};