'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const CAPABILITIES = Object.freeze([
  { id: 'VECTOR_2D', maturity: 'LOCAL_PILOT', engines: ['SVG', 'Canvas', 'Mermaid'], evidence: ['public/css/3d-graphics-system.css'] },
  { id: 'REALTIME_3D', maturity: 'FOUNDATION', engines: ['WebGL', 'Three.js'], evidence: ['public/sheikha-visual-chain/index.html'] },
  { id: 'IMAGE_PLANNING', maturity: 'LOCAL_PILOT', engines: ['Sheikha Visual Planner'], evidence: ['lib/sheikha-visual-generation-engine.js'] },
  { id: 'VIDEO_STORYBOARD_AND_CMS', maturity: 'LOCAL_PILOT', engines: ['Sheikha Video Content Engine'], evidence: ['lib/sheikha-video-content-engine.js'] },
  { id: 'COMPUTER_VISION', maturity: 'FOUNDATION', engines: ['Sheikha Computer Vision'], evidence: ['lib/sheikha-computer-vision-engine.js'] },
  { id: 'AR', maturity: 'DESIGN_ONLY', engines: ['WebXR Adapter'], evidence: [] },
  { id: 'VR', maturity: 'DESIGN_ONLY', engines: ['WebXR Adapter'], evidence: [] },
  { id: 'SCIENTIFIC_VISUALIZATION', maturity: 'DESIGN_ONLY', engines: ['Deterministic Simulation Adapter'], evidence: [] },
]);
const TECHNOLOGY_REGISTRY_FILE = path.resolve(
  process.cwd(),
  'runtime/visual-intelligence/v1/sheikha-visual-technology-registry-v1.json',
);

function evidenceExists(relativeFile) {
  return fs.existsSync(path.resolve(process.cwd(), relativeFile));
}

function inspectCapability(capability) {
  const evidence = capability.evidence.map((file) => ({ file, present: evidenceExists(file) }));
  const evidenceComplete = evidence.length > 0 && evidence.every((item) => item.present);
  return {
    ...capability,
    evidence,
    evidenceComplete,
    executableClaimAllowed: evidenceComplete && capability.maturity === 'LOCAL_PILOT',
    commercialClaimAllowed: false,
  };
}

const DENIED_LIVING_SUBJECT_PATTERNS = Object.freeze([
  /(?:شخص|إنسان|رجل|امرأة|طفل|وجه|حيوان|طائر|حصان|قطة|كلب|أسد)/iu,
  /(?:person|human|man|woman|child|face|animal|bird|horse|cat|dog|lion|avatar)/iu,
]);

function evaluateNonLivingDrawingRequest(input = {}) {
  const subject = String(input.subject || input.prompt || '').trim();
  const matchedPattern = DENIED_LIVING_SUBJECT_PATTERNS.find((pattern) => pattern.test(subject));
  const subjectDeclared = subject.length > 0;
  const allowed = subjectDeclared && !matchedPattern;
  return {
    system: 'SHEIKHA_NON_LIVING_DRAWING_GATE_V1',
    mode: 'NON_LIVING_DRAWING_ONLY',
    allowed,
    decision: allowed ? 'ALLOW_PLAN' : 'DENY_OR_REQUIRE_QUALIFIED_HUMAN_REVIEW',
    reasons: !subjectDeclared
      ? ['SUBJECT_REQUIRED']
      : matchedPattern
        ? ['LIVING_OR_ANTHROPOMORPHIC_SUBJECT_DETECTED']
        : [],
    terminology: {
      preferred: ['DRAWING', 'SCENE', 'GRAPHICS', 'MOTION_GRAPHICS', 'SIMULATION'],
      renamingDoesNotChangeContentReality: true,
    },
    executionPerformed: false,
  };
}

const DIMENSION_MODES = Object.freeze(['2D', '3D', '4D', '5D']);

function planGovernedVisualScene(input = {}) {
  const subject = String(input.subject || '').trim();
  const dimension = String(input.dimension || '3D').toUpperCase();
  const review = evaluateNonLivingDrawingRequest({ subject });
  const dimensionValid = DIMENSION_MODES.includes(dimension);
  const admitted = review.allowed && dimensionValid;
  const plan = {
    system: 'SHEIKHA_VISUAL_FABRIC_SCENE_PLAN_V1',
    status: admitted ? 'PLAN_ADMITTED_NOT_RENDERED' : 'PLAN_DENIED',
    subject,
    dimension,
    dimensionValid,
    contentReview: review,
    pipeline: [
      'ARABIC_INTENT_AND_SHEIKHA_LANGUAGE_PLAN',
      'NON_LIVING_DRAWING_GATE',
      'GARDENS_AND_PASTURES_WORLDLY_ENGINEERING_MODEL',
      'DETERMINISTIC_GEOMETRY_SCIENCE_UNITS_AND_CALCULATION',
      'SCENE_GRAPH_MATERIAL_LIGHT_MOTION',
      'LOCAL_RENDERER_OR_OPTIONAL_LICENSED_PROVIDER',
      'ASSET_PROVENANCE_LICENSE_AND_SHA256',
      'ACCESSIBILITY_PERFORMANCE_AND_HUMAN_REVIEW',
      'CONTROLLED_COMMERCIAL_DELIVERY',
    ],
    renderContract: admitted ? {
      geometryMode: dimension === '2D' ? 'PLANAR' : 'SPATIAL',
      timelineEnabled: dimension === '4D' || dimension === '5D',
      dataAndDecisionLayerEnabled: dimension === '5D',
      livingSubjectsAllowed: false,
      physicalUnitsRequired: true,
      outputGenerated: false,
    } : null,
    commercialScope: admitted ? {
      recommendedOfferId: dimension === '2D'
        ? 'SHEIKHA_PRODUCT_VISUAL_PACK_V1'
        : 'SHEIKHA_INTERACTIVE_3D_PILOT_V1',
      licenseId: 'SHEIKHA-VISUAL-GOVERNED-USE-1.0',
      ownerAndCustomerApprovalRequired: true,
      automaticPublishingAllowed: false,
    } : null,
    blockers: [
      ...(review.allowed ? [] : review.reasons),
      ...(dimensionValid ? [] : ['DIMENSION_MUST_BE_2D_3D_4D_OR_5D']),
    ],
    execution: { requested: false, performed: false, providerCalled: false },
  };
  return { ...plan, sha256: crypto.createHash('sha256').update(JSON.stringify(plan)).digest('hex') };
}

function buildVisualIntelligenceStatus() {
  const capabilities = CAPABILITIES.map(inspectCapability);
  const technologyRegistry = JSON.parse(fs.readFileSync(TECHNOLOGY_REGISTRY_FILE, 'utf8'));
  const base = {
    system: 'SHEIKHA_VISUAL_FABRIC_V1',
    compatibilityAliases: ['SHEIKHA_VISUAL_INTELLIGENCE_FABRIC_V1'],
    status: 'GOVERNED_LOCAL_VISUAL_PILOT',
    integration: {
      gardensAndPastures: 'EARTHLY_ENGINEERING_VISUALIZATION',
      sheikhaLanguage: 'DECLARATIVE_SCENE_AND_SIMULATION_PLANS',
      scienceAndCalculation: 'DETERMINISTIC_VALUES_BEFORE_RENDERING',
      lmm: 'PLAN_AND_EXPLAIN_NOT_UNVERIFIED_FACT_GENERATION',
      cloud: 'OPTIONAL_RENDER_AND_STORAGE_ADAPTERS',
    },
    capabilities,
    technologyRegistry: {
      id: technologyRegistry.registry,
      status: technologyRegistry.status,
      licenseId: technologyRegistry.licenseId,
      technologyCount: technologyRegistry.technologies.length,
      technologies: technologyRegistry.technologies,
      arabicTerminologyPolicy: technologyRegistry.arabicTerminologyPolicy,
      nonLivingDrawingMode: technologyRegistry.nonLivingDrawingMode,
      dimensionalModel: technologyRegistry.dimensionalModel,
      thirdPartyConnectorPolicy: technologyRegistry.thirdPartyConnectorPolicy,
      truthfulness: technologyRegistry.truthfulness,
    },
    counts: {
      total: capabilities.length,
      locallyExecutable: capabilities.filter((item) => item.executableClaimAllowed).length,
      designOnly: capabilities.filter((item) => item.maturity === 'DESIGN_ONLY').length,
      commerciallyApproved: capabilities.filter((item) => item.commercialClaimAllowed).length,
    },
    contentGovernance: {
      moralReference: 'QURAN_AND_AUTHENTIC_SUNNAH_VALUES_WITH_QUALIFIED_HUMAN_REVIEW',
      noHarm: true,
      privacyAndConsentRequired: true,
      intellectualPropertyAndProviderLicensesPreserved: true,
      provenanceRequired: true,
      generatedMediaMustBeLabeled: true,
      deceptiveImpersonationDenied: true,
      sexualAndExploitativeContentDenied: true,
      specificReligiousRulingsRequireQualifiedHumanReview: true,
      defaultContentMode: 'SHEIKHA_NON_LIVING_DRAWING_MODE_V1',
    },
    gardensBoundary: {
      earthlyPlanningAndEducationOnly: true,
      afterlifeNotSimulatedOrClaimed: true,
      wording: 'Gardens and pastures are an earthly engineering metaphor and visual planning domain.',
    },
    qualityGates: [
      'PROMPT_AND_PURPOSE_REVIEW',
      'SOURCE_LICENSE_AND_PROVENANCE',
      'PRIVACY_CONSENT_AND_SAFETY',
      'DIMENSION_COLOR_AND_ACCESSIBILITY_VALIDATION',
      'DEVICE_PERFORMANCE_BENCHMARK',
      'HUMAN_RELEASE_REVIEW',
    ],
    claimPolicy: {
      highestResolutionClaimRequiresMeasuredArtifact: true,
      superiorityClaimRequiresReproducibleBenchmark: true,
      arVrProductionClaimRequiresDeviceTesting: true,
      generatedMetadataIsNotRenderedMedia: true,
    },
    distinctiveCapability: {
      id: 'SHEIKHA_VERIFIABLE_VISUAL_SCENE_V1',
      nameAr: 'المشهد المرئي الموثق من شيخة',
      rarityClaim: 'DISTINCTIVE_COMPOSITION_NOT_MARKET_RARITY_PROVEN',
      value: [
        'CONTENT_ADDRESSABLE_ASSET_MANIFEST',
        'SOURCE_LICENSE_AND_CONSENT_CHAIN',
        'DETERMINISTIC_SCIENCE_AND_CALCULATION_INPUTS',
        'MODEL_PROVIDER_AND_PROMPT_PROVENANCE',
        'HUMAN_REVIEW_AND_RELEASE_DECISION',
      ],
      implementedAsUnifiedPipeline: false,
      nextEngineeringGate: 'END_TO_END_SIGNED_ASSET_MANIFEST_AND_RENDER_PIPELINE',
    },
    controlledCommercialServices: {
      offerableNow: true,
      mode: 'HUMAN_REVIEWED_SERVICE_DELIVERY',
      offerIds: [
        'SHEIKHA_VISUAL_PROVENANCE_PACK_V1',
        'SHEIKHA_PRODUCT_VISUAL_PACK_V1',
        'SHEIKHA_MOTION_STORYBOARD_PACK_V1',
      ],
      scopedApprovalOfferIds: ['SHEIKHA_INTERACTIVE_3D_PILOT_V1'],
      automaticGenerationOrPublishingAllowed: false,
    },
    commercialRelease: {
      allowed: false,
      meaning: 'GENERAL_AUTOMATED_VISUAL_PLATFORM_RELEASE',
      blockers: [
        'LICENSED_MEDIA_DATASET_AND_ASSET_REGISTRY_REQUIRED',
        'AR_VR_DEVICE_COMPATIBILITY_EVIDENCE_REQUIRED',
        'PERFORMANCE_ACCESSIBILITY_AND_SAFETY_BENCHMARKS_REQUIRED',
        'HUMAN_APPROVED_COMMERCIAL_MEDIA_POLICY_REQUIRED',
      ],
    },
  };
  return { ...base, sha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
}

module.exports = {
  CAPABILITIES,
  TECHNOLOGY_REGISTRY_FILE,
  evaluateNonLivingDrawingRequest,
  planGovernedVisualScene,
  buildVisualIntelligenceStatus,
};
