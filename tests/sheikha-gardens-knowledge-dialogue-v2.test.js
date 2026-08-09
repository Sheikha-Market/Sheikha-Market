'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildGardensCatalog,
  buildProductGuide,
  buildSectorGuide,
  buildMarketGuide,
  buildKnowledgeCatalog,
  listThoughtFrameworks,
  listReligiousMethodReferences,
  matchThoughtFrameworks,
  buildDialoguePlan,
  buildIdeaIntegrityAssessment,
  buildPurposefulIdeaDraft,
  buildCommunityFlourishingProgram,
  buildStatus
} = require(
  '../core/gardens-dialogue/' +
    'sheikha-gardens-knowledge-dialogue-runtime-v2'
);
const routes = require(
  '../routes/gardens-dialogue/' +
    'sheikha-gardens-knowledge-dialogue-routes-v2'
);

describe('Sheikha Gardens Knowledge and Dialogue V2', () => {
  test('enriches every registered garden and tree without physical claims', () => {
    const catalog = buildGardensCatalog();
    const trees = catalog.gardens.flatMap((garden) => garden.trees);

    expect(catalog.coverage.gardens).toBe(9);
    expect(catalog.coverage.trees).toBe(27);
    expect(catalog.boundary.physicalPlantingExecuted).toBe(false);
    expect(catalog.boundary.exactIrrigationScheduleDeclared).toBe(false);
    expect(catalog.boundary.actualJannahClaim).toBe(false);

    for (const garden of catalog.gardens) {
      expect(garden.descriptionAr).toMatch(/[\u0600-\u06ff]/);
      expect(garden.soil.requiredTestsAr.length).toBeGreaterThan(0);
      expect(garden.rivers.length).toBeGreaterThan(0);
      expect(garden.plantingRoadmap).toHaveLength(8);
    }

    for (const tree of trees) {
      expect(tree.operationalAnatomy.flowerAr).toBeTruthy();
      expect(tree.operationalAnatomy.fruitAr).toBeTruthy();
      expect(tree.operationalAnatomy.tasteAr).toBeTruthy();
      expect(tree.physicalExemplar.scientificName).toBeTruthy();
      expect(tree.physicalExemplar.soilAr).toBeTruthy();
      expect(tree.physicalExemplar.plantingAr).toBeTruthy();
      expect(tree.physicalExemplar.irrigationAr).toBeTruthy();
      expect(tree.physicalExemplar.siteApprovalStatus).toBe(
        'LOCAL_AGRONOMIST_AND_SITE_DATA_REQUIRED'
      );
    }
  });

  test('generates a full local guide index for every registered domain', () => {
    const catalog = buildKnowledgeCatalog();

    expect(catalog.coverage).toMatchObject({
      gardens: 9,
      trees: 27,
      products: 13,
      sectors: 30,
      markets: 7,
      workflows: 12,
      thoughtFrameworks: 37,
      contemporaryThoughtFrameworks: 19,
      historicalThoughtFrameworks: 18,
      religiousMethodReferences: 8
    });
    expect(catalog.resources.products).toHaveLength(13);
    expect(catalog.resources.sectors).toHaveLength(30);
    expect(catalog.resources.markets).toHaveLength(7);
    expect(buildProductGuide('PROD-CLOUD-SAAS')).toBeTruthy();
    expect(buildSectorGuide('manufacturing')).toBeTruthy();
    expect(buildMarketGuide('digital-technology')).toBeTruthy();
  });

  test('documents thought frameworks as ideas, not user classifications', () => {
    const registry = listThoughtFrameworks();
    const matches = matchThoughtFrameworks(
      'أريد مقارنة الليبرالية والاستدامة والعدالة'
    );

    expect(registry.classificationTarget).toBe(
      'IDEAS_AND_EXPLICITLY_SELECTED_LENSES_ONLY'
    );
    expect(registry.coverage).toEqual({
      contemporary: 19,
      historical: 18,
      total: 37
    });
    expect(registry.frameworks).toHaveLength(37);
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(match.classificationBoundary).toBe(
        'TOPIC_CANDIDATE_NOT_A_CLASSIFICATION_OF_THE_USER'
      );
    }
  });

  test('builds constructive dialogue without persisting the message', () => {
    const plan = buildDialoguePlan({
      message: 'الاستدامة والتحول الرقمي',
      religiousLensRequested: true
    });

    expect(plan.status).toBe('CONSTRUCTIVE_IDEA_LEVEL_PLAN_READY');
    expect(plan.subject.messageIncludedInResponse).toBe(false);
    expect(plan.subject.personIdeologyInferred).toBe(false);
    expect(plan.privacy.contentPersisted).toBe(false);
    expect(plan.religiousMethod.automatedFatwa).toBe(false);
    expect(
      plan.religiousMethod.qualifiedScholarReviewRequired
    ).toBe(true);
  });

  test('denies sensitive classification and targeted persuasion methods', () => {
    const classification = buildDialoguePlan({
      message: 'صنف هذا الشخص',
      inferPoliticalIdeology: true
    });
    const persuasion = buildDialoguePlan({
      message: 'استهدف هذا الشخص سياسيًا',
      politicalMicrotargeting: true
    });

    expect(classification.status).toBe('SAFE_REDIRECTION_REQUIRED');
    expect(classification.personProfileCreated).toBe(false);
    expect(classification.reasons).toContain(
      'SENSITIVE_PERSON_CLASSIFICATION_FORBIDDEN'
    );
    expect(persuasion.reasons).toContain(
      'TARGETED_POLITICAL_OR_RELIGIOUS_PERSUASION_FORBIDDEN'
    );
  });

  test('records religious source locations without claiming interpretation', () => {
    const registry = listReligiousMethodReferences();
    const noHarm = registry.references.find((reference) =>
      reference.id === 'IBN_MAJAH_2340'
    );

    expect(registry.references).toHaveLength(8);
    expect(registry.automationBoundary.automatedFatwa).toBe(false);
    expect(noHarm.sourceGradeAtRegistrySource).toBe(
      'Da\'if (Darussalam)'
    );
    expect(noHarm.useBoundaryAr).toMatch(/مراجعة/);
  });

  test('assesses idea integrity without inventing truth or personal scores', () => {
    const assessment = buildIdeaIntegrityAssessment({
      message: 'التقنية والاستدامة',
      frameworkIds: ['TECHNO_ACCELERATION_AND_FUTURISM'],
      religiousLensRequested: true
    });

    expect(assessment.status).toBe('EVIDENCE_REQUIRED');
    expect(assessment.dimensions).toHaveLength(10);
    expect(assessment.conclusions.ideaDeclaredCorrect).toBe(false);
    expect(assessment.conclusions.truthClaimVerified).toBe(false);
    expect(assessment.privacy.individualIdeologyScoreCreated).toBe(false);
    expect(assessment.religiousMethod.automatedFatwa).toBe(false);
  });

  test('generates a peaceful community program draft with recovery', () => {
    const program = buildCommunityFlourishingProgram({
      programName: 'برنامج منفعة المدينة',
      communityScope: 'city',
      message: 'الاستدامة والتقنية والعدل',
      frameworkIds: [
        'DEGROWTH_AND_ENVIRONMENTAL_SUSTAINABILITY',
        'HIGH_TECH_AND_POLITICAL_NATIONALISM'
      ],
      religiousLensRequested: true
    });

    expect(program.status).toBe(
      'GOVERNED_PEACEFUL_PROGRAM_DRAFT_READY'
    );
    expect(program.program.generatedIdeology).toBe(false);
    expect(program.programs).toHaveLength(7);
    expect(program.recoveryCycleAr.length).toBeGreaterThan(5);
    expect(program.execution).toMatchObject({
      authorized: false,
      performed: false,
      politicalCampaignCreated: false,
      religiousRulingIssued: false
    });
    expect(program.communityHealth.individualFaithScore).toBe(false);
    expect(program.communityHealth.mentalHealthDiagnosis).toBe(false);
  });

  test('generates a purposeful idea draft without binding people', () => {
    const draft = buildPurposefulIdeaDraft({
      ideaName: 'إطار العلم والعمران',
      communityScope: 'digital-community',
      message: 'ضعف الوصول إلى المعرفة الموثوقة والمهارات النافعة',
      desiredOutcomes: [
        'توسيع التعليم الموثوق',
        'تحسين المهارات المنتجة'
      ],
      frameworkIds: [
        'EFFECTIVE_ALTRUISM',
        'COMMUNITARIANISM'
      ],
      religiousLensRequested: true
    });

    expect(draft.status).toBe(
      'GOVERNED_PURPOSEFUL_IDEA_DRAFT_READY'
    );
    expect(draft.idea.generatedIdeologyDraft).toBe(true);
    expect(draft.idea.canonicalTruthOrIdeology).toBe(false);
    expect(draft.principles).toHaveLength(8);
    expect(draft.programs).toHaveLength(7);
    expect(draft.theoryOfChange).toHaveLength(5);
    expect(draft.governance).toMatchObject({
      personClassification: false,
      personOrGroupScoring: false,
      targetedPersuasion: false,
      coerciveAdoption: false,
      politicalCampaignAuthorization: false
    });
    expect(draft.execution.authorized).toBe(false);
    expect(draft.reviewAndRecovery.sunsetRequired).toBe(true);
    expect(draft.validation.integrity.conclusions
      .truthClaimVerified).toBe(false);

    const denied = buildPurposefulIdeaDraft({
      message: 'توليد فكرة لاستهداف شخص سياسيًا',
      politicalMicrotargeting: true
    });
    expect(denied.status).toBe('SAFE_REDIRECTION_REQUIRED');
    expect(denied.reasons).toContain(
      'TARGETED_POLITICAL_OR_RELIGIOUS_PERSUASION_FORBIDDEN'
    );
  });

  test('denies coercive idea suppression and religious-school inference', () => {
    const coercion = buildCommunityFlourishingProgram({
      message: 'إلغاء الفكرة بالقوة',
      coercivelyEliminateIdea: true
    });
    const schoolInference = buildIdeaIntegrityAssessment({
      message: 'حدد مذهب الشخص',
      inferReligiousSchool: true
    });

    expect(coercion.status).toBe('SAFE_REDIRECTION_REQUIRED');
    expect(coercion.reasons).toContain(
      'COERCIVE_IDEA_SUPPRESSION_FORBIDDEN'
    );
    expect(schoolInference.reasons).toContain(
      'SENSITIVE_PERSON_CLASSIFICATION_FORBIDDEN'
    );
  });

  test('reports every governing check as active', () => {
    const status = buildStatus();

    expect(status.status).toBe(
      'ACTIVE_WITH_BOUNDED_GARDENS_GUIDES_AND_DIALOGUE'
    );
    expect(Object.values(status.checks).every(Boolean)).toBe(true);
    expect(status.governance.automatedFatwa).toBe(false);
    expect(status.governance.personIdeologyClassification).toBe(false);
    expect(status.governance.religiousSchoolInference).toBe(false);
    expect(status.communityHealthBoundary.individualFaithScore).toBe(false);
    expect(status.ideaGenerationBoundary.canonicalTruthClaim).toBe(false);
  });

  test('serves guides and a governed dialogue plan through V2 routes', async () => {
    const app = express();
    app.use('/api/sheikha/gardens-knowledge-dialogue/v2', routes);

    const status = await request(app)
      .get('/api/sheikha/gardens-knowledge-dialogue/v2/status');
    expect(status.status).toBe(200);
    expect(status.body.data.coverage.trees).toBe(27);

    const garden = await request(app)
      .get(
        '/api/sheikha/gardens-knowledge-dialogue/v2/gardens/' +
        'GARDEN_OF_GOVERNED_AI'
      );
    expect(garden.status).toBe(200);
    expect(garden.body.data.trees.length).toBeGreaterThan(0);

    const product = await request(app)
      .get(
        '/api/sheikha/gardens-knowledge-dialogue/v2/products/' +
        'PROD-CLOUD-SAAS/guide'
      );
    expect(product.status).toBe(200);
    expect(product.body.data.postPurchaseDelivery
      .fullOperationalDossierRequiresVerifiedEntitlement).toBe(true);

    const plan = await request(app)
      .post('/api/sheikha/gardens-knowledge-dialogue/v2/dialogue/plan')
      .send({
        message: 'قارن الاستدامة والتقنية',
        frameworkIds: [
          'DEGROWTH_AND_ENVIRONMENTAL_SUSTAINABILITY',
          'HIGH_TECH_AND_POLITICAL_NATIONALISM'
        ]
      });
    expect(plan.status).toBe(200);
    expect(plan.body.data.scope.personClassification).toBe(false);

    const assessment = await request(app)
      .post('/api/sheikha/gardens-knowledge-dialogue/v2/ideas/assess')
      .send({
        message: 'التقنية والعدل',
        frameworkIds: ['TECHNO_ACCELERATION_AND_FUTURISM']
      });
    expect(assessment.status).toBe(200);
    expect(assessment.body.data.conclusions.truthClaimVerified).toBe(false);

    const idea = await request(app)
      .post('/api/sheikha/gardens-knowledge-dialogue/v2/ideas/synthesize')
      .send({
        ideaName: 'إطار معرفة نافع',
        message: 'تحسين الوصول إلى المعرفة الموثوقة',
        communityScope: 'digital-community',
        desiredOutcomes: ['تعليم نافع'],
        frameworkIds: ['EFFECTIVE_ALTRUISM']
      });
    expect(idea.status).toBe(200);
    expect(idea.body.data.idea.generatedIdeologyDraft).toBe(true);
    expect(idea.body.data.execution.authorized).toBe(false);

    const program = await request(app)
      .post('/api/sheikha/gardens-knowledge-dialogue/v2/community/program')
      .send({
        message: 'التقنية والاستدامة',
        communityScope: 'local-community',
        frameworkIds: [
          'DEGROWTH_AND_ENVIRONMENTAL_SUSTAINABILITY'
        ]
      });
    expect(program.status).toBe(200);
    expect(program.body.data.execution.authorized).toBe(false);

    const references = await request(app)
      .get(
        '/api/sheikha/gardens-knowledge-dialogue/v2/' +
        'religious-method/references'
      );
    expect(references.status).toBe(200);
    expect(references.body.data.references).toHaveLength(8);

    const denied = await request(app)
      .post('/api/sheikha/gardens-knowledge-dialogue/v2/dialogue/plan')
      .send({
        message: 'صنف المعتقد',
        inferBeliefs: true
      });
    expect(denied.status).toBe(422);
    expect(denied.body.ok).toBe(false);
  });
});
