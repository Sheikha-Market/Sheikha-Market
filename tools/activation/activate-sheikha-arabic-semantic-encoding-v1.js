'use strict';

const fs = require('node:fs');
const path = require('node:path');

const encoding = require('../../core/language/sheikha-arabic/encoding/sheikha-arabic-semantic-encoding-v1');
const languageCluster = require('../../runtime/arabic-language-cluster-fabric/v91/sheikha-arabic-language-cluster-fabric-v91');

const ROOT = process.cwd();
const REPORT_PATH = path.join(
  ROOT,
  'runtime/arabic-semantic-encoding/v1/sheikha-arabic-semantic-encoding-v1-report.json'
);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function buildReport() {
  const profileStatus = encoding.status();
  const protocolRegistry = readJson(
    'runtime/unified-protocol-fabric/v1/registries/protocol-registry.json'
  );
  const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
  const source = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const encoded = encoding.encodeMessage({
    text: source,
    contentClass: 'RELIGIOUS_SOURCE',
    maxSegmentBytes: 128,
    ai: { requested: true, purpose: 'ARABIC_SEMANTIC_ANNOTATION' }
  });
  const explanation = encoding.explainEncoding({
    text: source,
    contentClass: 'RELIGIOUS_SOURCE'
  });
  const improvement = encoding.proposeImprovement({
    title: 'تحسين ضغط البيانات الوصفية دون فقد الدلالة',
    targetLayer: 'PRESENTATION',
    rationale: 'تقليل حمل الغلاف مع الحفاظ على التوافق والتحقق',
    evidence: ['FRAME_SIZE_MEASUREMENT'],
    tests: ['ROUND_TRIP', 'BACKWARD_COMPATIBILITY']
  });
  const reassembled = encoding.reassembleSegments(encoded.transport.segments);
  const decoded = encoding.decodeFrame(reassembled.frameBase64Url);

  let tamperRejected = false;
  let tamperError = null;
  try {
    const tampered = Buffer.from(encoded.frameBase64Url, 'base64url');
    tampered[tampered.length - 1] ^= 1;
    encoding.decodeFrame(tampered);
  } catch (value) {
    tamperRejected = value.code === 'FRAME_INTEGRITY_FAILED';
    tamperError = value.code || value.message;
  }

  let bidiControlsRejected = false;
  try {
    encoding.encodeMessage({ text: `أمان\u202Etxt` });
  } catch (value) {
    bidiControlsRejected = value.code === 'BIDI_CONTROLS_REVIEW_REQUIRED';
  }

  const cluster = languageCluster.status();
  const route = fabricRoutes.routes.find(
    (item) => item.name === 'arabic-semantic-encoding-v1'
  );
  const protocol = protocolRegistry.layerProfiles?.SHEIKHA_ARABIC_SEMANTIC_PROFILE_V1;
  const checks = {
    profileIdentityVerified:
      profileStatus.system === 'SHEIKHA_ARABIC_SEMANTIC_ENCODING_PROFILE_V1' &&
      profileStatus.status === 'VERIFIED_PROFILE_IMPLEMENTATION_ACTIVE',
    sovereignArabicSemanticRootVerified:
      profileStatus.architecture?.semanticRoot?.position ===
        'HIGHEST_INTERNAL_TECHNICAL_SEMANTIC_AUTHORITY' &&
      profileStatus.architecture?.externalTechnicalSystemAboveRoot === false &&
      profileStatus.architecture?.unicodeUtf8TcpIpAreAdaptersBelowRoot === true,
    unicodeRelationshipTruthful:
      profileStatus.runtimeStandards.unicodeIsEightBit === false &&
      profileStatus.runtimeStandards.unicodeReplaced === false &&
      profileStatus.runtimeStandards.utf8Replaced === false,
    fourLayersActive: profileStatus.layers.length === 4 &&
      profileStatus.layers.every((layer) => layer.status.startsWith('ACTIVE_')),
    religiousTextPreserved:
      decoded.text === source && encoded.roundTrip.textPreservedExactly === true,
    arabicEncodingExplanationVerified:
      explanation.status === 'ARABIC_ENCODING_EXPLAINED_WITH_TECHNICAL_EVIDENCE' &&
      explanation['الرموز'].length > 0 &&
      explanation['حدود_الحجة']['النص_الشرعي_بديل_عن_القياس_الهندسي'] === false,
    roundTripVerified: encoded.roundTrip.verified === true,
    frameIntegrityVerified: decoded.frame.integrity === 'SHA256_VERIFIED',
    tamperRejected,
    bidiControlsRejected,
    transportReassemblyVerified: reassembled.messageId === encoded.messageId,
    physicalClaimBounded:
      encoded.layers.physical.hardwareTransmissionExecuted === false &&
      encoded.layers.physical.status === 'ACTIVE_VERIFIED_SOFTWARE_ADAPTER',
    aiBoundaryVerified:
      encoded.ai.status === 'ADVISORY_REQUEST_READY_NOT_EXECUTED' &&
      encoded.ai.modelInvocationExecuted === false &&
      encoded.ai.mayAlterEncodedPayload === false,
    governedImprovementBoundaryVerified:
      improvement.status === 'PROPOSAL_REVIEW_REQUIRED' &&
      improvement.automaticRuntimeSelfModification === false &&
      improvement.automaticProfileActivation === false &&
      improvement.ai.mayApproveOrActivate === false,
    governanceBoundaryVerified:
      encoded.governance.encodingGrantsExecutionAuthorization === false &&
      encoded.governance.automatedHalalOrHaramDecision === false &&
      encoded.governance.qualifiedScholarReviewRequired === true,
    valuesEvidenceDigitizedWithoutExecution:
      encoding.specification.valuesEvidence.length === 4 &&
      encoding.specification.valuesEvidence.every(
        (item) => item.executableAlgorithm === false
      ) &&
      encoding.specification.valuesEvidence.find((item) => item.id === 'NO_HARM')
        ?.isnadMetadata?.narrator === 'أبو سعيد الخدري',
    performanceClaimTruthful:
      encoded.metrics.smallerThanRawUtf8 === false &&
      encoded.metrics.performanceSuperiorityProven === false,
    protocolRegistryIntegrated:
      protocol?.status === 'ACTIVE' &&
      protocol?.replacesUnicode === false &&
      protocol?.replacesUtf8 === false,
    languageClusterIntegrated:
      cluster.encodingProfile?.system === profileStatus.system &&
      cluster.encodingProfile?.status === 'ACTIVE',
    fabricRouteIntegrated:
      route?.mount === '/api/language/arabic-semantic-encoding' &&
      route?.module === 'routes/arabic-semantic-encoding/status.routes.js',
    documentationPresent: fs.existsSync(path.join(
      ROOT,
      'docs/arabic-semantic-encoding-v1/SHEIKHA-ARABIC-SEMANTIC-ENCODING-V1.md'
    ))
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const score = Math.round((passed / total) * 100);

  return {
    system: 'SHEIKHA_ARABIC_SEMANTIC_ENCODING_ACTIVATION_V1',
    status: score === 100 ? 'VERIFIED_PROFILE_ACTIVE' : 'ACTIVE_WITH_REVIEW',
    score,
    checks,
    missing: Object.entries(checks).filter(([, value]) => !value).map(([name]) => name),
    profile: profileStatus,
    layers: encoded.layers,
    evidence: {
      sampleDigest: encoded.roundTrip.payloadDigest,
      sourceBytes: encoded.metrics.rawUtf8Bytes,
      frameBytes: encoded.metrics.frameBytes,
      overheadBytes: encoded.metrics.overheadBytes,
      segmentCount: encoded.transport.segmentCount,
      tamperError,
      unicodeRuntimeVersion: profileStatus.runtimeStandards.unicodeVersion,
      icuRuntimeVersion: profileStatus.runtimeStandards.icuVersion
    },
    claims: {
      unicodeReplaced: false,
      utf8Replaced: false,
      tcpIpOrQuicReplaced: false,
      hardwarePhysicalTransmissionActivated: false,
      softwarePhysicalAdapterVerified: true,
      smallerThanUtf8: false,
      fasterThanUtf8: false,
      externalStandardsCertificationIssued: false,
      automatedReligiousRuling: false,
      aiModelInvokedInEncodingPath: false,
      semanticRootHighestInternalAuthority: true,
      externalTechnicalSystemAuthorityAboveRoot: false,
      unicodeUtf8TcpIpAdaptersBelowRoot: true,
      hostedAdapterImplementationToday: true,
      nativeIndependentCodecComplete: false,
      nativeIndependentTransportComplete: false,
      fullHostRemovalComplete: false,
      automaticRuntimeSelfModification: false
    },
    output: {
      report: path.relative(ROOT, REPORT_PATH),
      specification:
        'runtime/arabic-semantic-encoding/v1/sheikha-arabic-semantic-encoding-profile-v1.json',
      implementation:
        'core/language/sheikha-arabic/encoding/sheikha-arabic-semantic-encoding-v1.js',
      documentation:
        'docs/arabic-semantic-encoding-v1/SHEIKHA-ARABIC-SEMANTIC-ENCODING-V1.md'
    },
    generatedAt: new Date().toISOString()
  };
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    score: report.score,
    layers: Object.keys(report.layers),
    frameBytes: report.evidence.frameBytes,
    sourceBytes: report.evidence.sourceBytes,
    hardwarePhysicalTransmissionActivated:
      report.claims.hardwarePhysicalTransmissionActivated,
    report: report.output.report
  }, null, 2));
  process.exitCode = report.score === 100 ? 0 : 1;
}

module.exports = { REPORT_PATH, buildReport, writeReport };
