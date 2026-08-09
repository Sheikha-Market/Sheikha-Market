'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  FILES,
  REQUIREMENTS,
  requirementsFor,
  evaluateApplication,
  submitApplication,
  reviewApplication,
  issueInternalAuthorization,
  renewInternalAuthorization,
  suspendInternalAuthorization,
  authorizationIsEffective,
  applicationsRegistry,
  authorizationsRegistry,
  buildProductReadinessMatrix,
  buildQualificationStatus
} = require(
  '../core/production-qualification/' +
  'sheikha-producer-production-qualification-v1'
);
const routes = require(
  '../routes/production-qualification/' +
  'sheikha-producer-production-qualification-routes-v1'
);

const GENERATED_AT = '2026-07-27T00:00:00.000Z';
const VALID_SHA256 = 'a'.repeat(64);

function buildCompleteApplication(overrides = {}) {
  const productType = overrides.productType || 'DIGITAL';
  const regulated = overrides.regulated === true;
  return {
    candidate: {
      id: 'ORG-TEST-001',
      legalName: 'منشأة اختبار شيخة',
      jurisdiction: 'SA',
      legalRegistrationReference: 'LEGAL-REG-OPAQUE-001',
      authorizedRepresentativeReference: 'REP-OPAQUE-001'
    },
    product: {
      id: 'PROD-GOV-001',
      version: '1.0.0',
      regulated
    },
    evidence: requirementsFor(productType, regulated).map((entry) => ({
      requirementId: entry.id,
      reference: `evidence/${entry.id.toLowerCase()}.json`,
      sha256: entry.sha256Required ? VALID_SHA256 : ''
    })),
    declarations: {
      informationAccurate: true,
      rightsToProduce: true,
      conflictsDisclosed: true,
      evidenceReviewConsent: true
    },
    ...overrides.input
  };
}

function buildAcceptedReviews(application) {
  return application.evidence.map((entry) => ({
    requirementId: entry.requirementId,
    decision: 'ACCEPTED',
    hashVerified: true,
    issuerVerified: true,
    qualifiedReview: true,
    notes: 'Verified by the assigned qualified human reviewer.'
  }));
}

function createTemporaryRegistryRoot() {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'sheikha-production-qualification-')
  );
  const registries = [
    [
      FILES.applications,
      {
        schemaVersion: '1.0.0',
        registry: 'SHEIKHA_PRODUCER_APPLICATIONS_V1',
        revision: 0,
        applications: []
      }
    ],
    [
      FILES.authorizations,
      {
        schemaVersion: '1.0.0',
        registry: 'SHEIKHA_INTERNAL_PRODUCTION_AUTHORIZATIONS_V1',
        revision: 0,
        authorizations: []
      }
    ],
    [
      FILES.audit,
      {
        schemaVersion: '1.0.0',
        registry: 'SHEIKHA_PRODUCTION_QUALIFICATION_AUDIT_V1',
        revision: 0,
        events: []
      }
    ]
  ];

  for (const [relativePath, value] of registries) {
    const target = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      target,
      `${JSON.stringify(value, null, 2)}\n`,
      'utf8'
    );
  }
  return root;
}

function findRoute(pathname, method) {
  const layer = routes.stack.find((entry) =>
    entry.route?.path === pathname &&
    entry.route.methods?.[method] === true
  );
  if (!layer) throw new Error(`Route not found: ${method} ${pathname}`);
  return layer.route.stack;
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
}

describe('Sheikha Producer Production Qualification V1', () => {
  const temporaryRoots = [];

  afterAll(() => {
    for (const root of temporaryRoots) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('registers the full governed file set without false readiness claims', () => {
    const status = buildQualificationStatus({
      generatedAt: GENERATED_AT
    });

    expect(status.passed).toBe(true);
    expect(status.status).toBe('ACTIVE_INTERNAL_QUALIFICATION_GATE');
    expect(status.coverage.registeredProducts).toBe(13);
    expect(status.coverage.productionFileRequirements).toBe(31);
    expect(status.coverage.administrativeRequirements).toBe(10);
    expect(status.coverage.engineeringRequirements).toBe(11);
    expect(status.coverage.productionRequirements).toBe(10);
    expect(status.coverage.productionReadyProducts).toBe(0);
    expect(status.coverage.externallyIssuedCertificates).toBe(0);
    expect(status.coverage.physicallyVerifiedHardwareTargets).toBe(0);
    expect(status.truthBoundaries.allProductsProductionReadyObserved)
      .toBe(false);
    expect(status.truthBoundaries.allProductsProductionReadyClaimed)
      .toBe(false);
    expect(status.authorizationPolicy.officialGovernmentLicenseIssuanceAvailable)
      .toBe(false);
    expect(status.aiPolicy.mayIssueFinalAuthorization).toBe(false);
  });

  test('treats a complete candidate dossier as review-required, not verified', () => {
    const result = evaluateApplication(
      buildCompleteApplication(),
      { generatedAt: GENERATED_AT }
    );

    expect(result.valid).toBe(true);
    expect(result.status).toBe('EVIDENCE_REVIEW_REQUIRED');
    expect(result.requiredEvidenceCount).toBe(26);
    expect(result.submittedEvidenceCount).toBe(26);
    expect(result.completionPercentage).toBe(100);
    expect(result.verificationPercentage).toBe(0);
    expect(result.eligibleForInternalAuthorization).toBe(false);
    expect(result.externalOfficialLicenseIssued).toBe(false);
  });

  test('rejects secrets and sensitive-trait fields instead of scoring them', () => {
    const input = buildCompleteApplication();
    input.candidate.religion = 'not-permitted';
    input.accessToken = 'not-permitted';

    const result = evaluateApplication(input, {
      generatedAt: GENERATED_AT
    });

    expect(result.valid).toBe(false);
    expect(result.status).toBe('INVALID_APPLICATION');
    expect(result.errors).toContainEqual({
      code: 'SENSITIVE_OR_SECRET_FIELD_NOT_ALLOWED',
      fields: expect.arrayContaining([
        'candidate.religion',
        'accessToken'
      ])
    });
    expect(result.eligibleForInternalAuthorization).toBe(false);
  });

  test('executes a human-reviewed internal authorization lifecycle atomically', () => {
    const root = createTemporaryRegistryRoot();
    temporaryRoots.push(root);
    const options = { root, generatedAt: GENERATED_AT };
    const actor = { id: 'admin-test', role: 'admin' };

    const submitted = submitApplication(
      buildCompleteApplication(),
      actor,
      options
    );
    expect(submitted.ok).toBe(true);
    expect(submitted.status).toBe('EVIDENCE_REVIEW_REQUIRED');

    const reviewed = reviewApplication(
      submitted.application.applicationId,
      {
        reviews: buildAcceptedReviews(submitted.application),
        confirmed: true,
        humanDecision:
          'QUALIFY_FOR_INTERNAL_PRODUCTION_AUTHORIZATION'
      },
      { id: 'governance-reviewer', role: 'governance' },
      options
    );
    expect(reviewed.ok).toBe(true);
    expect(reviewed.status)
      .toBe('ELIGIBLE_FOR_INTERNAL_PRODUCTION_AUTHORIZATION');
    expect(reviewed.assessment.verificationPercentage).toBe(100);

    const issued = issueInternalAuthorization(
      submitted.application.applicationId,
      {
        confirmed: true,
        decision: 'ISSUE_INTERNAL_PRODUCTION_AUTHORIZATION',
        validityDays: 180
      },
      actor,
      options
    );
    expect(issued.ok).toBe(true);
    expect(issued.status).toBe('ACTIVE_INTERNAL');
    expect(issued.idempotent).toBe(false);
    expect(issued.authorization.governmentLicense).toBe(false);
    expect(issued.authorization.externalAuthority).toBe(false);
    expect(issued.authorization.automatedIssuance).toBe(false);

    const repeated = issueInternalAuthorization(
      submitted.application.applicationId,
      {
        confirmed: true,
        decision: 'ISSUE_INTERNAL_PRODUCTION_AUTHORIZATION',
        validityDays: 180
      },
      actor,
      options
    );
    expect(repeated.ok).toBe(true);
    expect(repeated.idempotent).toBe(true);

    expect(authorizationIsEffective(
      issued.authorization,
      '2026-07-28T00:00:00.000Z'
    )).toBe(true);
    expect(authorizationIsEffective(
      issued.authorization,
      issued.authorization.expiresAt
    )).toBe(false);

    const renewedOptions = {
      root,
      generatedAt: '2026-08-01T00:00:00.000Z'
    };
    const renewed = renewInternalAuthorization(
      issued.authorization.authorizationId,
      {
        confirmed: true,
        evidenceRevalidated: true,
        decision: 'RENEW_INTERNAL_PRODUCTION_AUTHORIZATION',
        validityDays: 90
      },
      { id: 'governance-reviewer', role: 'governance' },
      renewedOptions
    );
    expect(renewed.ok).toBe(true);
    expect(renewed.status).toBe('ACTIVE_INTERNAL');
    expect(renewed.idempotent).toBe(false);
    expect(renewed.authorization.previousAuthorizationId)
      .toBe(issued.authorization.authorizationId);

    const suspendedOptions = {
      root,
      generatedAt: '2026-08-02T00:00:00.000Z'
    };
    const suspended = suspendInternalAuthorization(
      renewed.authorization.authorizationId,
      {
        confirmed: true,
        decision: 'SUSPEND_INTERNAL_PRODUCTION_AUTHORIZATION',
        reason: 'تعليق احترازي حتى اكتمال مراجعة التغيير الهندسي.'
      },
      actor,
      suspendedOptions
    );
    expect(suspended.ok).toBe(true);
    expect(suspended.status).toBe('SUSPENDED_INTERNAL');
    expect(buildProductReadinessMatrix(suspendedOptions)
      .find((entry) => entry.productId === 'PROD-GOV-001')
      .productionReady).toBe(false);

    const applications = applicationsRegistry(options);
    const authorizations = authorizationsRegistry(options);
    const audit = JSON.parse(
      fs.readFileSync(path.join(root, FILES.audit), 'utf8')
    );
    expect(applications.applications).toHaveLength(1);
    expect(applications.applications[0].status)
      .toBe('AUTHORIZATION_SUSPENDED');
    expect(authorizations.authorizations).toHaveLength(2);
    expect(authorizations.authorizations[0].status)
      .toBe('SUPERSEDED_INTERNAL');
    expect(authorizations.authorizations[1].status)
      .toBe('SUSPENDED_INTERNAL');
    expect(audit.events.map((event) => event.type)).toEqual([
      'APPLICATION_SUBMITTED',
      'APPLICATION_REVIEWED',
      'INTERNAL_PRODUCTION_AUTHORIZATION_ISSUED',
      'INTERNAL_PRODUCTION_AUTHORIZATION_RENEWED',
      'INTERNAL_PRODUCTION_AUTHORIZATION_SUSPENDED'
    ]);
  });

  test('prevents an operator from reviewing or issuing authorization', () => {
    const root = createTemporaryRegistryRoot();
    temporaryRoots.push(root);
    const options = { root, generatedAt: GENERATED_AT };
    const submitted = submitApplication(
      buildCompleteApplication(),
      { id: 'operator-test', role: 'operator' },
      options
    );
    const operator = { id: 'operator-test', role: 'operator' };

    expect(reviewApplication(
      submitted.application.applicationId,
      { reviews: [] },
      operator,
      options
    ).status).toBe('REVIEWER_NOT_AUTHORIZED');
    expect(issueInternalAuthorization(
      submitted.application.applicationId,
      {
        confirmed: true,
        decision: 'ISSUE_INTERNAL_PRODUCTION_AUTHORIZATION'
      },
      operator,
      options
    ).status).toBe('ISSUER_NOT_AUTHORIZED');
    expect(renewInternalAuthorization(
      'AUTHORIZATION-TEST',
      {
        confirmed: true,
        evidenceRevalidated: true,
        decision: 'RENEW_INTERNAL_PRODUCTION_AUTHORIZATION'
      },
      operator,
      options
    ).status).toBe('ISSUER_NOT_AUTHORIZED');
    expect(suspendInternalAuthorization(
      'AUTHORIZATION-TEST',
      {
        confirmed: true,
        decision: 'SUSPEND_INTERNAL_PRODUCTION_AUTHORIZATION',
        reason: 'سبب مراجعة موثق وكاف للتعليق.'
      },
      operator,
      options
    ).status).toBe('ISSUER_NOT_AUTHORIZED');
  });

  test('serves public status and evaluation while protecting mutations', () => {
    const statusResponse = createResponse();
    findRoute('/status', 'get').at(-1).handle({}, statusResponse);
    expect(statusResponse.statusCode).toBe(200);
    expect(statusResponse.body.data.coverage.productionFileRequirements)
      .toBe(31);

    const productsResponse = createResponse();
    findRoute('/products', 'get').at(-1).handle({}, productsResponse);
    expect(productsResponse.statusCode).toBe(200);
    expect(productsResponse.body.data.count).toBe(13);
    expect(productsResponse.body.data.productionReadyCount).toBe(0);

    const invalidResponse = createResponse();
    findRoute('/applications/evaluate', 'post').at(-1).handle(
      { body: {} },
      invalidResponse
    );
    expect(invalidResponse.statusCode).toBe(422);
    expect(invalidResponse.body.data.status).toBe('INVALID_APPLICATION');

    const evaluatedResponse = createResponse();
    findRoute('/applications/evaluate', 'post').at(-1).handle(
      { body: buildCompleteApplication() },
      evaluatedResponse
    );
    expect(evaluatedResponse.statusCode).toBe(200);
    expect(evaluatedResponse.body.data.status)
      .toBe('EVIDENCE_REVIEW_REQUIRED');

    const mutationLayers = findRoute('/applications', 'post');
    const unauthenticatedResponse = createResponse();
    mutationLayers[0].handle(
      { headers: {} },
      unauthenticatedResponse,
      () => {
        throw new Error('Unauthenticated request reached the next layer.');
      }
    );
    expect(unauthenticatedResponse.statusCode).toBe(401);
    expect(unauthenticatedResponse.body.code).toBe('AUTH_TOKEN_MISSING');
  });

  test('keeps every registered requirement blocking and evidence-bound', () => {
    expect(REQUIREMENTS).toHaveLength(31);
    expect(REQUIREMENTS.every((entry) => entry.blocking)).toBe(true);
    expect(REQUIREMENTS.every((entry) => entry.ownerRole)).toBe(true);
    expect(REQUIREMENTS.filter((entry) => entry.externalAuthorityOnly))
      .toHaveLength(1);
  });
});
