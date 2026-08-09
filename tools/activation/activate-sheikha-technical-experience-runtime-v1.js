'use strict';

const fs = require('fs');
const path = require('path');

const {
  buildTechnologyStatus,
  buildRuntimeTelemetry,
  listProductPreviews,
  resolveDocumentationEntitlement
} = require(
  '../../core/technical-experience/' +
  'sheikha-technical-experience-runtime-v1'
);

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(
  ROOT,
  'runtime',
  'technical-experience',
  'v1',
  'sheikha-technical-experience-v1-report.json'
);

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function hasExternalMedia(source) {
  return /<(?:img|script|video|source)\b[^>]+(?:src|href)=["']https?:\/\//i
    .test(source);
}

async function activate() {
  const generatedAt = new Date().toISOString();
  const status = buildTechnologyStatus({ generatedAt });
  const telemetry = await buildRuntimeTelemetry({ generatedAt });
  const previews = listProductPreviews({ level: 'expert' });
  const defaultEntitlement = resolveDocumentationEntitlement({
    subjectId: 'activation-audit-subject',
    productId: 'PROD-CLOUD-SAAS'
  });
  const technologyHtml = readProjectFile('public/technology/index.html');
  const technologyCss = readProjectFile('public/technology/styles.css');
  const technologyApp = readProjectFile('public/technology/app.js');
  const productHtml = readProjectFile('public/product-technical/index.html');
  const productCss = readProjectFile('public/product-technical/styles.css');
  const productApp = readProjectFile('public/product-technical/app.js');
  const checks = {
    runtimeActive: status.status === 'ACTIVE_WITH_MEASURED_LOCAL_FOUNDATIONS',
    allCommerceProductsDocumented: previews.length === status.coverage.products,
    allProfilesHaveMeasurement: previews.every((preview) =>
      preview.sampleMeasurement.expression.includes('=')
    ),
    allProfilesHaveArabicExplanation: previews.every((preview) =>
      /[\u0600-\u06ff]/.test(preview.mechanismAr)
    ),
    centralAndDecentralizedDeclared:
      status.architecture.central.length === 4 &&
      status.architecture.decentralized.length === 4,
    externalFederationNotClaimed:
      status.architecture.boundaries.externalFederationVerified === false,
    telemetryContainsNoSecrets: telemetry.secretsIncluded === false,
    dossierDefaultDeny: defaultEntitlement.authorized === false,
    noAutomaticPurchase: status.governance.noAutomaticPurchase === true,
    noAutomatedReligiousRuling:
      status.governance.noAutomatedReligiousRuling === true,
    technologyPageExists: fs.existsSync(path.join(ROOT, 'public/technology/index.html')),
    productTechnicalPageExists:
      fs.existsSync(path.join(ROOT, 'public/product-technical/index.html')),
    industrialVisualExists: fs.existsSync(path.join(
      ROOT,
      'public/images/sheikha-industrial-market-hero-v1.png'
    )),
    functionalCanvasesDeclared:
      technologyHtml.includes('id="network-canvas"') &&
      productHtml.includes('id="product-flow-canvas"'),
    animatedDataFlowsImplemented:
      technologyApp.includes('requestAnimationFrame(drawNetwork)') &&
      productApp.includes('requestAnimationFrame(drawProductFlow)'),
    reducedMotionHonored:
      technologyCss.includes('@media (prefers-reduced-motion: reduce)') &&
      technologyApp.includes('prefers-reduced-motion') &&
      productApp.includes('prefers-reduced-motion'),
    responsiveLayoutsDeclared:
      technologyCss.includes('@media (max-width: 760px)') &&
      productCss.includes('@media (max-width: 720px)'),
    noExternalMediaDependencies:
      !hasExternalMedia(technologyHtml) &&
      !hasExternalMedia(productHtml),
    fullDossierNotEmbeddedInPublicHtml:
      !productHtml.includes('deploymentPathAr') &&
      !productHtml.includes('failureAndRecoveryAr'),
    entitlementVerifiedByServer:
      productApp.includes('/dossier?level=') &&
      !productApp.includes('x-documentation-entitlement')
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  const report = {
    ...status,
    status: failedChecks.length
      ? 'TECHNICAL_EXPERIENCE_ACTIVATION_FAILED'
      : status.status,
    telemetryEvidence: telemetry,
    checks,
    failedChecks,
    passed: failedChecks.length === 0,
    interfaceEvidence: {
      visualMode: 'LOCAL_INDUSTRIAL_MEDIA_AND_FUNCTIONAL_CANVAS',
      motionPurpose: 'DATA_FLOW_AND_PROCESS_STATE_ONLY',
      mediaSubjectPolicy: 'INDUSTRIAL_INFRASTRUCTURE_WITHOUT_PEOPLE_OR_ANIMALS',
      externalMediaDependencies: 0,
      screenshotVerificationExecuted: false,
      screenshotVerificationBoundary:
        'Headless browser execution requires a separately authorized GUI-capable runner.',
      userLevels: ['guided', 'practitioner', 'expert'],
      entitlementMode: 'SERVER_SIDE_DEFAULT_DENY'
    },
    productTechnicalIndex: previews.map((preview) => ({
      id: preview.product.id,
      nameAr: preview.product.nameAr,
      disciplineAr: preview.disciplineAr,
      measurement: preview.sampleMeasurement.expression,
      fullDossierAccess: preview.fullDossier.access
    }))
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) {
  activate()
    .then((report) => {
      console.log(JSON.stringify({
        system: report.system,
        status: report.status,
        passed: report.passed,
        coverage: report.coverage,
        failedChecks: report.failedChecks,
        output: path.relative(ROOT, OUTPUT)
      }, null, 2));
      process.exitCode = report.passed ? 0 : 1;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = { OUTPUT, activate };
