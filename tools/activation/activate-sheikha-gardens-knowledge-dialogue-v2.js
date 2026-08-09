#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildGardensCatalog,
  buildProductGuide,
  buildSectorGuide,
  buildMarketGuide,
  buildKnowledgeCatalog,
  listThoughtFrameworks,
  listReligiousMethodReferences,
  buildDialoguePlan,
  buildIdeaIntegrityAssessment,
  buildPurposefulIdeaDraft,
  buildCommunityFlourishingProgram,
  buildStatus
} = require(
  '../../core/gardens-dialogue/' +
    'sheikha-gardens-knowledge-dialogue-runtime-v2'
);
const {
  buildUnifiedCommerceRuntime
} = require(
  '../../core/commerce/sheikha-unified-commerce-runtime-v1'
);

const ROOT = path.resolve(__dirname, '..', '..');
const RUNTIME_DIR = path.join(ROOT, 'runtime', 'jannat-gardens', 'v2');
const PUBLIC_DIR = path.join(
  ROOT,
  'public',
  'sheikha-jannat-gardens'
);
const DOCS_DIR = path.join(ROOT, 'docs', 'jannat-gardens-v2');
const OUTPUTS = Object.freeze({
  report: path.join(
    RUNTIME_DIR,
    'sheikha-gardens-knowledge-dialogue-v2-report.json'
  ),
  guideIndex: path.join(
    RUNTIME_DIR,
    'sheikha-complete-guide-index-v2.json'
  ),
  publicCatalog: path.join(
    PUBLIC_DIR,
    'sheikha-jannat-gardens-v2.json'
  ),
  handbook: path.join(
    DOCS_DIR,
    'SHEIKHA-COMPLETE-GARDENS-PRODUCTS-MARKETS-SECTORS-GUIDE-V2.md'
  )
});

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function writeJson(filePath, value) {
  writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function list(items) {
  return (items || []).map((item) => `- ${item}`).join('\n') || '- لا يوجد.';
}

function renderTree(tree) {
  const physical = tree.physicalExemplar;
  return [
    `#### ${tree.nameAr}`,
    '',
    `**الغرض:** ${tree.purposeAr}`,
    '',
    `**البذرة والجذر والجذع:** ${tree.operationalAnatomy.seedAr} ` +
      `${tree.operationalAnatomy.rootAr} ${tree.operationalAnatomy.trunkAr}`,
    '',
    `**الزهر والثمرة والطعم التشغيلي:** ` +
      `${tree.operationalAnatomy.flowerAr} ` +
      `${tree.operationalAnatomy.fruitAr} ` +
      `${tree.operationalAnatomy.tasteAr}`,
    '',
    `**النموذج النباتي:** ${physical.nameAr} ` +
      `(${physical.scientificName})، ${physical.identityBoundaryAr}`,
    '',
    `**المناخ والتربة:** ${physical.climateAr} ${physical.soilAr}`,
    '',
    `**الزهر والثمر والطعم:** ${physical.flowerAr} ` +
      `${physical.fruitAr} ${physical.tasteAr}`,
    '',
    '**الاستخدامات:**',
    list(physical.usesAr),
    '',
    '**تعليمات الغرس والتشغيل:**',
    list(tree.plantingInstructionsAr),
    '',
    '**الشروط والسلامة:**',
    list(tree.conditionsAr),
    ''
  ].join('\n');
}

function renderGarden(garden) {
  return [
    `### ${garden.nameAr}`,
    '',
    garden.descriptionAr,
    '',
    `**التضاريس:** ${garden.terrainAr}`,
    '',
    `**التربة الرقمية:** ${garden.soil.digitalAr}`,
    '',
    `**التربة المادية:** ${garden.soil.physicalAr}`,
    '',
    `**المروج:** ${garden.meadow.descriptionAr}`,
    '',
    '**الأنهار ومساراتها:**',
    list(garden.rivers.map((river) =>
      `${river.nameAr}: ${river.roleAr}`
    )),
    '',
    '**القوانين المشتركة:**',
    list(garden.lawsAr),
    '',
    '**الشروط:**',
    list(garden.conditionsAr),
    '',
    '**خريطة الغرس:**',
    list(garden.plantingRoadmap.map((phase) =>
      `${phase.phase}. ${phase.nameAr}: ${phase.exitCriteriaAr}`
    )),
    '',
    ...garden.trees.map(renderTree)
  ].join('\n');
}

function renderProduct(guide) {
  return [
    `### ${guide.product.nameAr}`,
    '',
    guide.descriptionAr,
    '',
    `**المجال الهندسي:** ${guide.engineering.disciplineAr}`,
    '',
    `**نمط المعمار:** ${guide.engineering.architecturePatternAr}`,
    '',
    '**الخواص:**',
    list(guide.propertiesAr),
    '',
    '**القوانين:**',
    list(guide.lawsAr),
    '',
    '**الشروط:**',
    list(guide.conditionsAr),
    '',
    '**التعليمات:**',
    list(guide.instructionsAr),
    '',
    '**خريطة الطريق:**',
    list(guide.roadmapAr),
    '',
    '**القطاعات:**',
    list(guide.specifications.targetSectors.map((sector) =>
      `${sector.nameAr} (${sector.id})`
    )),
    ''
  ].join('\n');
}

function renderSector(guide) {
  return [
    `### ${guide.sector.nameAr}`,
    '',
    guide.purposeAr,
    '',
    `**عائلة السوق:** ${guide.marketGroup.nameAr}`,
    '',
    '**القدرات:**',
    list(guide.specifications.capabilities),
    '',
    '**المنتجات:**',
    list(guide.products.map((product) =>
      `${product.nameAr} (${product.id})`
    )),
    '',
    '**القوانين:**',
    list(guide.lawsAr),
    '',
    '**الشروط:**',
    list(guide.conditionsAr),
    '',
    '**التعليمات:**',
    list(guide.instructionsAr),
    '',
    '**خريطة الطريق:**',
    list(guide.roadmapAr),
    ''
  ].join('\n');
}

function renderMarket(guide) {
  return [
    `### ${guide.market.nameAr}`,
    '',
    guide.descriptionAr,
    '',
    '**القطاعات:**',
    list(guide.sectors.map((sector) =>
      `${sector.nameAr} (${sector.id})`
    )),
    '',
    '**القوانين:**',
    list(guide.lawsAr),
    '',
    '**الشروط:**',
    list(guide.conditionsAr),
    '',
    '**التعليمات:**',
    list(guide.instructionsAr),
    '',
    '**خريطة الطريق:**',
    list(guide.roadmapAr),
    ''
  ].join('\n');
}

function renderFramework(framework) {
  const sections = [
    `### ${framework.nameAr}`,
    '',
  ];
  if (framework.periodAr) {
    sections.push(
      `**السياق التاريخي:** ${framework.periodAr}`,
      ''
    );
  }
  return [
    ...sections,
    framework.descriptionAr,
    '',
    '**الأهداف المعلنة:**',
    list(framework.statedGoalsAr),
    '',
    '**المنافع المحتملة:**',
    list(framework.potentialBenefitsAr),
    '',
    '**المخاطر والنقد:**',
    list(framework.risksAndCritiquesAr),
    '',
    '**أسئلة الحوار:**',
    list(framework.dialogueQuestionsAr),
    ''
  ].join('\n');
}

function buildHandbook({
  gardens,
  productGuides,
  sectorGuides,
  marketGuides,
  frameworks
}) {
  return [
    '# دليل شيخة الكامل للجنات والمنتجات والأسواق والقطاعات V2',
    '',
    'هذا الدليل مولد من السجلات المحلية المحكومة، ويصف النماذج ' +
      'والقوانين والشروط والتعليمات وخرائط الطريق دون ادعاء تشغيل خارجي حي.',
    '',
    '> الحدائق المادية تصاميم مفهومية حتى يعتمدها مختبر التربة والماء ' +
      'ومهندس زراعي محلي. الإشارات الشرعية قيم ومنهج مراجعة، وليست فتوى آلية.',
    '',
    '## الجنات والأشجار',
    '',
    ...gardens.gardens.map(renderGarden),
    '## المنتجات',
    '',
    ...productGuides.map(renderProduct),
    '## القطاعات',
    '',
    ...sectorGuides.map(renderSector),
    '## الأسواق',
    '',
    ...marketGuides.map(renderMarket),
    '## الأطر الفكرية للحوار البنّاء',
    '',
    'تصف المنظومة الأفكار التي يحددها المستخدم صراحة، ولا تصنف دينه أو ' +
      'مذهبه أو توجهه السياسي، ولا تنشئ ملفًا حساسًا ولا تستهدفه بإقناع قسري.',
    '',
    ...frameworks.map(renderFramework)
  ].join('\n');
}

function main() {
  const generatedAt = new Date().toISOString();
  const status = buildStatus();
  const catalog = buildKnowledgeCatalog();
  const gardens = buildGardensCatalog();
  const commerce = buildUnifiedCommerceRuntime();
  const thoughtRegistry = listThoughtFrameworks();
  const religiousReferences = listReligiousMethodReferences();
  const productGuides = commerce.catalog.map((product) =>
    buildProductGuide(product.id)
  );
  const sectorGuides = commerce.sectors.map((sector) =>
    buildSectorGuide(sector.id)
  );
  const marketGuides = commerce.marketGroups.map((market) =>
    buildMarketGuide(market.id)
  );
  const allTrees = gardens.gardens.flatMap((garden) => garden.trees);
  const dialogue = buildDialoguePlan({
    message: 'الاستدامة والتحول الرقمي والعدالة',
    religiousLensRequested: true
  });
  const deniedClassification = buildDialoguePlan({
    message: 'صنف معتقد الشخص',
    inferBeliefs: true
  });
  const ideaAssessment = buildIdeaIntegrityAssessment({
    message: 'الاستدامة والعدل والتقنية',
    frameworkIds: ['DEGROWTH_AND_ENVIRONMENTAL_SUSTAINABILITY'],
    religiousLensRequested: true
  });
  const communityProgram = buildCommunityFlourishingProgram({
    message: 'الاستدامة والعدل والتقنية',
    frameworkIds: [
      'DEGROWTH_AND_ENVIRONMENTAL_SUSTAINABILITY',
      'HIGH_TECH_AND_POLITICAL_NATIONALISM'
    ],
    religiousLensRequested: true,
    communityScope: 'local-community'
  });
  const purposefulIdea = buildPurposefulIdeaDraft({
    ideaName: 'إطار العلم والعمران',
    message: 'توسيع المعرفة الموثوقة والمهارات النافعة',
    desiredOutcomes: ['تعليم موثوق', 'عمل منتج', 'استدامة الموارد'],
    frameworkIds: ['EFFECTIVE_ALTRUISM', 'COMMUNITARIANISM'],
    religiousLensRequested: true,
    communityScope: 'digital-community'
  });
  const deniedCoercion = buildCommunityFlourishingProgram({
    message: 'إلغاء الأفكار بالقوة',
    coercivelyEliminateIdea: true
  });
  const checks = {
    statusChecksPassed: Object.values(status.checks).every(Boolean),
    everyGardenHasFullGuide: gardens.gardens.every((garden) =>
      garden.soil &&
      garden.rivers.length > 0 &&
      garden.meadow &&
      garden.lawsAr.length > 0 &&
      garden.conditionsAr.length > 0 &&
      garden.plantingRoadmap.length === 8
    ),
    everyTreeHasDigitalAndPhysicalDetail: allTrees.every((tree) =>
      tree.operationalAnatomy.flowerAr &&
      tree.operationalAnatomy.fruitAr &&
      tree.operationalAnatomy.tasteAr &&
      tree.physicalExemplar.scientificName &&
      tree.physicalExemplar.soilAr &&
      tree.physicalExemplar.flowerAr &&
      tree.physicalExemplar.fruitAr &&
      tree.physicalExemplar.plantingAr &&
      tree.physicalExemplar.irrigationAr &&
      tree.conditionsAr.length > 0
    ),
    everyGardenSectorLinkRegistered: gardens.gardens.every((garden) =>
      garden.sectorIds.every((sectorId) =>
        commerce.sectors.some((sector) => sector.id === sectorId)
      )
    ),
    everyProductGuideGenerated: productGuides.length === 13 &&
      productGuides.every(Boolean),
    everySectorGuideGenerated: sectorGuides.length === 30 &&
      sectorGuides.every(Boolean),
    everyMarketGuideGenerated: marketGuides.length === 7 &&
      marketGuides.every(Boolean),
    everyThoughtFrameworkComplete:
      thoughtRegistry.coverage.contemporary === 19 &&
      thoughtRegistry.coverage.historical === 18 &&
      thoughtRegistry.coverage.total === 37 &&
      thoughtRegistry.frameworks.every((framework) =>
        framework.descriptionAr &&
        framework.statedGoalsAr.length > 0 &&
        framework.potentialBenefitsAr.length > 0 &&
        framework.risksAndCritiquesAr.length > 0 &&
        framework.dialogueQuestionsAr.length > 0
      ),
    religiousReferencesRecordedWithHonestSourceState:
      religiousReferences.references.length === 8 &&
      religiousReferences.references.every((reference) =>
        reference.sourceUrl &&
        reference.sourceStatus
      ),
    ideaIntegrityAssessmentDoesNotInventTruth:
      ideaAssessment.dimensions.length === 10 &&
      ideaAssessment.conclusions.ideaDeclaredCorrect === false &&
      ideaAssessment.conclusions.truthClaimVerified === false,
    communityProgramGeneratedAsPlanOnly:
      communityProgram.status ===
        'GOVERNED_PEACEFUL_PROGRAM_DRAFT_READY' &&
      communityProgram.programs.length === 7 &&
      communityProgram.execution.authorized === false &&
      communityProgram.execution.politicalCampaignCreated === false &&
      communityProgram.execution.religiousRulingIssued === false,
    purposefulIdeaGeneratedAsVoluntaryDraft:
      purposefulIdea.status ===
        'GOVERNED_PURPOSEFUL_IDEA_DRAFT_READY' &&
      purposefulIdea.idea.generatedIdeologyDraft === true &&
      purposefulIdea.idea.canonicalTruthOrIdeology === false &&
      purposefulIdea.principles.length === 8 &&
      purposefulIdea.theoryOfChange.length === 5 &&
      purposefulIdea.programs.length === 7 &&
      purposefulIdea.execution.authorized === false,
    coerciveIdeaSuppressionDenied:
      deniedCoercion.status === 'SAFE_REDIRECTION_REQUIRED' &&
      deniedCoercion.reasons.includes(
        'COERCIVE_IDEA_SUPPRESSION_FORBIDDEN'
      ),
    noAutomatedFatwa: dialogue.religiousMethod.automatedFatwa === false,
    scholarReviewRequiredForReligiousLens:
      dialogue.religiousMethod.qualifiedScholarReviewRequired === true,
    noSensitivePersonClassification:
      deniedClassification.status === 'SAFE_REDIRECTION_REQUIRED' &&
      deniedClassification.personProfileCreated === false,
    noDialogueContentPersistence:
      dialogue.privacy.contentPersisted === false,
    physicalGardenReadinessNotClaimed:
      gardens.boundary.physicalPlantingExecuted === false &&
      gardens.boundary.designStatus ===
        'CONCEPT_DESIGN_REQUIRES_SITE_SURVEY'
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  const passed = failedChecks.length === 0;

  const guideIndex = {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_COMPLETE_GUIDE_INDEX_V2',
    generatedAt,
    status: passed ? 'VERIFIED_LOCAL_GUIDE_INDEX' : 'VERIFICATION_FAILED',
    coverage: catalog.coverage,
    gardens: gardens.gardens.map((garden) => ({
      id: garden.id,
      nameAr: garden.nameAr,
      endpoint:
        `/api/sheikha/gardens-knowledge-dialogue/v2/gardens/${garden.id}`
    })),
    products: commerce.catalog.map((product) => ({
      id: product.id,
      nameAr: product.nameAr,
      endpoint:
        `/api/sheikha/gardens-knowledge-dialogue/v2/products/${product.id}/guide`
    })),
    sectors: commerce.sectors.map((sector) => ({
      id: sector.id,
      nameAr: sector.nameAr,
      endpoint:
        `/api/sheikha/gardens-knowledge-dialogue/v2/sectors/${sector.id}/guide`
    })),
    markets: commerce.marketGroups.map((market) => ({
      id: market.id,
      nameAr: market.nameAr,
      endpoint:
        `/api/sheikha/gardens-knowledge-dialogue/v2/markets/${market.id}/guide`
    })),
    thoughtFrameworks: thoughtRegistry.frameworks.map((framework) => ({
      id: framework.id,
      nameAr: framework.nameAr,
      era: framework.era,
      endpoint:
        `/api/sheikha/gardens-knowledge-dialogue/v2/thought-frameworks/${framework.id}`
    })),
    governedOperations: {
      religiousMethodReferences:
        '/api/sheikha/gardens-knowledge-dialogue/v2/religious-method/references',
      dialoguePlan:
        '/api/sheikha/gardens-knowledge-dialogue/v2/dialogue/plan',
      ideaIntegrityAssessment:
        '/api/sheikha/gardens-knowledge-dialogue/v2/ideas/assess',
      purposefulIdeaDraft:
        '/api/sheikha/gardens-knowledge-dialogue/v2/ideas/synthesize',
      communityProgram:
        '/api/sheikha/gardens-knowledge-dialogue/v2/community/program'
    },
    claimBoundary: catalog.claimBoundary
  };
  const report = {
    schemaVersion: '2.0.0',
    system: 'SHEIKHA_GARDENS_KNOWLEDGE_DIALOGUE_ACTIVATION_V2',
    generatedAt,
    status: passed
      ? 'ACTIVE_AND_LOCALLY_VERIFIED'
      : 'ACTIVATION_VERIFICATION_FAILED',
    passed,
    coverage: catalog.coverage,
    checks,
    failedChecks,
    dialogueSafety: {
      ideaLevelAnalysis: true,
      personIdeologyClassification: false,
      sensitiveTraitInference: false,
      coercivePersuasion: false,
      politicalOrReligiousMicrotargeting: false,
      coerciveIdeaSuppression: false,
      violenceOrCollectivePunishment: false,
      automatedFatwa: false,
      qualifiedHumanReviewForReligiousRulings: true,
      generatedCommunityProgramIsPlanOnly: true,
      generatedPurposefulIdeologyDraft: true,
      generatedCanonicalIdeology: false,
      coerciveAdoptionOfGeneratedIdea: false,
      communityMentalHealthDiagnosis: false,
      communityCoerciveTreatment: false
    },
    physicalGardenStatus: {
      catalogued: true,
      conceptDesignOnly: true,
      deploymentReady: false,
      soilAndWaterLaboratoryRequired: true,
      localAgronomistRequired: true
    },
    outputs: Object.fromEntries(
      Object.entries(OUTPUTS).map(([key, value]) =>
        [key, path.relative(ROOT, value)]
      )
    ),
    claimBoundary: status.claimBoundary
  };

  writeJson(OUTPUTS.report, report);
  writeJson(OUTPUTS.guideIndex, guideIndex);
  writeJson(OUTPUTS.publicCatalog, {
    schemaVersion: '2.0.0',
    system: gardens.system,
    generatedAt,
    status: report.status,
    coverage: catalog.coverage,
    boundary: gardens.boundary,
    lawsAr: gardens.lawsAr,
    gardens: gardens.gardens,
    thoughtFrameworks: thoughtRegistry.frameworks.map((framework) => ({
      id: framework.id,
      nameAr: framework.nameAr,
      nameEn: framework.nameEn,
      family: framework.family,
      era: framework.era,
      descriptionAr: framework.descriptionAr
    }))
  });
  writeFile(OUTPUTS.handbook, `${buildHandbook({
    gardens,
    productGuides,
    sectorGuides,
    marketGuides,
    frameworks: thoughtRegistry.frameworks
  })}\n`);

  process.stdout.write(`${JSON.stringify({
    system: report.system,
    status: report.status,
    passed,
    coverage: report.coverage,
    failedChecks,
    outputs: report.outputs
  }, null, 2)}\n`);
  process.exitCode = passed ? 0 : 1;
}

if (require.main === module) main();

module.exports = {
  main,
  OUTPUTS,
  buildHandbook
};
