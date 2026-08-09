'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  listCommerceCatalog
} = require('../commerce/sheikha-unified-commerce-runtime-v1');

const SYSTEM = 'SHEIKHA_PRODUCER_PRODUCTION_QUALIFICATION_V1';
const ROOT = path.resolve(__dirname, '..', '..');

const FILES = Object.freeze({
  contract:
    'runtime/producer-production-qualification/v1/contracts/' +
    'sheikha-producer-production-qualification-v1-contract.json',
  requirements:
    'runtime/producer-production-qualification/v1/registries/' +
    'production-file-requirements.json',
  applications:
    'runtime/producer-production-qualification/v1/registries/' +
    'producer-applications.json',
  authorizations:
    'runtime/producer-production-qualification/v1/registries/' +
    'production-authorizations.json',
  audit:
    'runtime/producer-production-qualification/v1/registries/' +
    'qualification-audit-ledger.json',
  productReadiness:
    'runtime/producer-production-qualification/v1/registries/' +
    'product-production-readiness.json',
  administrativeIndex:
    'runtime/producer-production-qualification/v1/files/' +
    'administrative-file-index.json',
  engineeringIndex:
    'runtime/producer-production-qualification/v1/files/' +
    'engineering-file-index.json',
  productionIndex:
    'runtime/producer-production-qualification/v1/files/' +
    'production-file-index.json',
  report:
    'runtime/producer-production-qualification/v1/' +
    'sheikha-producer-production-qualification-v1-report.json',
  licenseRegistry:
    'runtime/licensing-engine/v1/registries/licenses.json',
  licenseRecognition:
    'runtime/governance/licensing/v1/' +
    'sheikha-license-recognition-v1.json',
  hardwareQualification:
    'runtime/bare-metal/v2/hardware-compatibility/v1/' +
    'sheikha-universal-hardware-compatibility-v1-report.json',
  technicalExperience:
    'runtime/technical-experience/v1/' +
    'sheikha-technical-experience-v1-report.json',
  siteSmoke:
    'runtime/site-operations/v1/' +
    'sheikha-local-site-smoke-v1-report.json',
  productionGate:
    'runtime/production-readiness/' +
    'sheikha-production-readiness-gate-v1.json',
  externalAccreditation:
    'runtime/master-activation/' +
    'sheikha-master-external-accreditation-verification-v1.json'
});

const ALLOWED_ACTOR_ROLES = Object.freeze([
  'admin',
  'operator',
  'governance'
]);

const REVIEW_DECISIONS = Object.freeze([
  'ACCEPTED',
  'REJECTED',
  'MORE_EVIDENCE_REQUIRED'
]);

const FORBIDDEN_INPUT_KEYS = Object.freeze([
  'password',
  'secret',
  'token',
  'privatekey',
  'private_key',
  'religion',
  'faith',
  'sect',
  'ethnicity',
  'race',
  'ideology',
  'political',
  'biometric',
  'medical',
  'healthcondition'
]);

function requirement(id, family, titleAr, options = {}) {
  return Object.freeze({
    id,
    family,
    titleAr,
    ownerRole: options.ownerRole || 'PRODUCT_OWNER',
    appliesTo: Object.freeze(options.appliesTo || ['ALL']),
    externalAuthorityOnly: options.externalAuthorityOnly === true,
    qualifiedReviewRequired:
      options.qualifiedReviewRequired === true,
    sha256Required: options.sha256Required !== false,
    blocking: options.blocking !== false,
    retention: options.retention || 'PRODUCT_LIFECYCLE_PLUS_POLICY_PERIOD'
  });
}

const REQUIREMENTS = Object.freeze([
  requirement(
    'PRODUCT_IDENTITY_AND_VERSION',
    'ADMINISTRATIVE',
    'هوية المنتج والإصدار والنطاق'
  ),
  requirement(
    'PRODUCER_LEGAL_ENTITY_REFERENCE',
    'ADMINISTRATIVE',
    'مرجع الكيان القانوني للمنتج'
  ),
  requirement(
    'AUTHORIZED_REPRESENTATIVE_REFERENCE',
    'ADMINISTRATIVE',
    'مرجع المفوض النظامي',
    { sha256Required: false }
  ),
  requirement(
    'OWNERSHIP_AND_IP_RIGHTS',
    'ADMINISTRATIVE',
    'الملكية وحقوق الاستخدام والإنتاج'
  ),
  requirement(
    'CONTRACT_SCOPE_AND_RESPONSIBILITIES',
    'ADMINISTRATIVE',
    'العقد والنطاق والمسؤوليات'
  ),
  requirement(
    'INTERNAL_LICENSE_TERMS',
    'ADMINISTRATIVE',
    'شروط الترخيص الداخلي'
  ),
  requirement(
    'EXTERNAL_LICENSE_AND_REGULATORY_MATRIX',
    'ADMINISTRATIVE',
    'مصفوفة التراخيص والجهات المختصة'
  ),
  requirement(
    'PRIVACY_AND_DATA_PROCESSING',
    'ADMINISTRATIVE',
    'الخصوصية ومعالجة البيانات'
  ),
  requirement(
    'LIABILITY_RISK_AND_DISPUTE_TERMS',
    'ADMINISTRATIVE',
    'المسؤولية والمخاطر وآلية النزاع'
  ),
  requirement(
    'EXTERNAL_AUTHORITY_CERTIFICATES',
    'ADMINISTRATIVE',
    'شهادات الجهة الخارجية المختصة',
    {
      appliesTo: ['REGULATED'],
      externalAuthorityOnly: true,
      qualifiedReviewRequired: true
    }
  ),
  requirement(
    'PRODUCT_REQUIREMENTS_SPECIFICATION',
    'ENGINEERING',
    'مواصفات متطلبات المنتج',
    { ownerRole: 'SYSTEMS_ENGINEER' }
  ),
  requirement(
    'ARCHITECTURE_AND_INTERFACE_CONTRACTS',
    'ENGINEERING',
    'المعمارية وعقود الواجهات',
    { ownerRole: 'SYSTEMS_ENGINEER' }
  ),
  requirement(
    'SOURCE_AND_CONFIGURATION_BASELINE',
    'ENGINEERING',
    'خط أساس المصدر والإعدادات',
    { ownerRole: 'CONFIGURATION_MANAGER' }
  ),
  requirement(
    'SOFTWARE_BILL_OF_MATERIALS',
    'ENGINEERING',
    'قائمة مكونات البرمجيات SBOM',
    {
      appliesTo: ['DIGITAL', 'HYBRID'],
      ownerRole: 'SECURITY_ENGINEER'
    }
  ),
  requirement(
    'HARDWARE_BILL_OF_MATERIALS',
    'ENGINEERING',
    'قائمة مكونات العتاد',
    {
      appliesTo: ['HARDWARE', 'HYBRID'],
      ownerRole: 'HARDWARE_ENGINEER'
    }
  ),
  requirement(
    'HARDWARE_QUALIFICATION_EVIDENCE',
    'ENGINEERING',
    'أدلة تأهيل العتاد',
    {
      appliesTo: ['HARDWARE', 'HYBRID'],
      ownerRole: 'HARDWARE_ENGINEER',
      qualifiedReviewRequired: true
    }
  ),
  requirement(
    'SECURITY_THREAT_MODEL',
    'ENGINEERING',
    'نموذج التهديدات والأمن',
    {
      appliesTo: ['DIGITAL', 'HYBRID'],
      ownerRole: 'SECURITY_ENGINEER',
      qualifiedReviewRequired: true
    }
  ),
  requirement(
    'SAFETY_HAZARD_ANALYSIS',
    'ENGINEERING',
    'تحليل المخاطر والسلامة',
    {
      ownerRole: 'SAFETY_ENGINEER',
      qualifiedReviewRequired: true
    }
  ),
  requirement(
    'TEST_AND_VERIFICATION_PLAN',
    'ENGINEERING',
    'خطة الاختبار والتحقق',
    {
      ownerRole: 'QUALITY_ENGINEER',
      qualifiedReviewRequired: true
    }
  ),
  requirement(
    'TEST_RESULTS_AND_TRACEABILITY',
    'ENGINEERING',
    'نتائج الاختبار والتتبع',
    {
      ownerRole: 'QUALITY_ENGINEER',
      qualifiedReviewRequired: true
    }
  ),
  requirement(
    'QUALITY_PLAN_AND_ACCEPTANCE_CRITERIA',
    'ENGINEERING',
    'خطة الجودة ومعايير القبول',
    {
      ownerRole: 'QUALITY_ENGINEER',
      qualifiedReviewRequired: true
    }
  ),
  requirement(
    'PRODUCTION_PROCESS_PLAN',
    'PRODUCTION',
    'خطة عملية الإنتاج',
    { ownerRole: 'PRODUCTION_ENGINEER' }
  ),
  requirement(
    'FACILITY_AND_EQUIPMENT_CAPABILITY',
    'PRODUCTION',
    'قدرة المنشأة والمعدات',
    {
      appliesTo: ['HARDWARE', 'HYBRID'],
      ownerRole: 'PRODUCTION_ENGINEER',
      qualifiedReviewRequired: true
    }
  ),
  requirement(
    'PERSONNEL_COMPETENCE_AND_ROLES',
    'PRODUCTION',
    'كفاءة فريق الإنتاج والأدوار',
    { ownerRole: 'PRODUCTION_MANAGER' }
  ),
  requirement(
    'SUPPLIER_AND_MATERIAL_TRACEABILITY',
    'PRODUCTION',
    'تتبع الموردين والمواد',
    {
      appliesTo: ['HARDWARE', 'HYBRID'],
      ownerRole: 'SUPPLY_CHAIN_MANAGER'
    }
  ),
  requirement(
    'CAPACITY_AND_RESOURCE_PLAN',
    'PRODUCTION',
    'خطة الطاقة والموارد',
    { ownerRole: 'PRODUCTION_MANAGER' }
  ),
  requirement(
    'RELEASE_PACKAGING_AND_DISTRIBUTION',
    'PRODUCTION',
    'الإصدار والتغليف والتوزيع',
    { ownerRole: 'RELEASE_MANAGER' }
  ),
  requirement(
    'OPERATIONS_MONITORING_AND_SUPPORT',
    'PRODUCTION',
    'التشغيل والرصد والدعم',
    { ownerRole: 'OPERATIONS_MANAGER' }
  ),
  requirement(
    'MAINTENANCE_RECOVERY_AND_ROLLBACK',
    'PRODUCTION',
    'الصيانة والتعافي والتراجع',
    { ownerRole: 'RELIABILITY_ENGINEER' }
  ),
  requirement(
    'CHANGE_CONTROL_AND_AUDIT',
    'PRODUCTION',
    'إدارة التغيير وسجل التدقيق',
    { ownerRole: 'GOVERNANCE_REVIEWER' }
  ),
  requirement(
    'USER_ADMIN_AND_TRAINING_DOCUMENTATION',
    'PRODUCTION',
    'أدلة المستخدم والإدارة والتدريب',
    { ownerRole: 'DOCUMENTATION_OWNER' }
  )
]);

function resolveRoot(options = {}) {
  return options.root || ROOT;
}

function readJson(relativePath, fallback, options = {}) {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(resolveRoot(options), relativePath),
        'utf8'
      )
    );
  } catch {
    return fallback;
  }
}

function writeJson(relativePath, value, options = {}) {
  const outputPath = path.join(resolveRoot(options), relativePath);
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    temporaryPath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
  fs.renameSync(temporaryPath, outputPath);
}

function exists(relativePath, options = {}) {
  return fs.existsSync(path.join(resolveRoot(options), relativePath));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hashRecord(value) {
  return sha256(Buffer.from(JSON.stringify(value), 'utf8'));
}

function cleanText(value, maximum = 300) {
  return String(value || '').trim().slice(0, maximum);
}

function isSha256(value) {
  return /^[a-f0-9]{64}$/.test(String(value || '').toLowerCase());
}

function findForbiddenKeys(value, trail = [], findings = []) {
  if (!value || typeof value !== 'object') return findings;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      findForbiddenKeys(entry, [...trail, String(index)], findings);
    });
    return findings;
  }

  for (const [key, entry] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z_]/g, '');
    if (FORBIDDEN_INPUT_KEYS.some((item) => normalized.includes(item))) {
      findings.push([...trail, key].join('.'));
    }
    findForbiddenKeys(entry, [...trail, key], findings);
  }
  return findings;
}

function productCatalog() {
  return listCommerceCatalog().products;
}

function productClass(product) {
  if (product.kind === 'SAAS_PRODUCT') return 'DIGITAL';
  if (product.kind === 'COMMERCIAL_DIGITAL_PRODUCT') return 'DIGITAL';
  if (product.kind === 'PLATFORM_PRODUCT') return 'DIGITAL';
  if (product.kind === 'KNOWLEDGE_COMMUNITY_PRODUCT') return 'DIGITAL';
  return 'HYBRID';
}

function requirementsFor(productType, regulated = false) {
  return REQUIREMENTS.filter((entry) => {
    if (entry.appliesTo.includes('ALL')) return true;
    if (entry.appliesTo.includes(productType)) return true;
    return regulated && entry.appliesTo.includes('REGULATED');
  });
}

function normalizeActor(actor = {}) {
  return {
    id: cleanText(actor.id, 120),
    role: cleanText(actor.role, 40).toLowerCase()
  };
}

function actorAllowed(actor) {
  return Boolean(
    actor.id &&
    ALLOWED_ACTOR_ROLES.includes(actor.role)
  );
}

function normalizeEvidence(entry = {}, trustedReview = false) {
  const evidence = {
    requirementId: cleanText(entry.requirementId, 100).toUpperCase(),
    reference: cleanText(entry.reference, 500),
    sha256: cleanText(entry.sha256, 64).toLowerCase(),
    issuerReference: cleanText(entry.issuerReference, 300) || null,
    submittedAt: cleanText(entry.submittedAt, 40) || null
  };

  if (trustedReview && entry.review) {
    evidence.review = {
      decision: cleanText(entry.review.decision, 40).toUpperCase(),
      hashVerified: entry.review.hashVerified === true,
      issuerVerified: entry.review.issuerVerified === true,
      qualifiedReview: entry.review.qualifiedReview === true,
      notes: cleanText(entry.review.notes, 500),
      reviewedBy: cleanText(entry.review.reviewedBy, 120),
      reviewedAt: cleanText(entry.review.reviewedAt, 40)
    };
  } else {
    evidence.review = null;
  }
  return evidence;
}

function normalizeApplication(input = {}, options = {}) {
  const generatedAt =
    options.generatedAt || new Date().toISOString();
  const errors = [];
  const forbiddenFields = findForbiddenKeys(input);
  if (forbiddenFields.length > 0) {
    errors.push({
      code: 'SENSITIVE_OR_SECRET_FIELD_NOT_ALLOWED',
      fields: forbiddenFields
    });
  }

  const catalog = productCatalog();
  const candidateInput = input.candidate || {};
  const productInput = input.product || {};
  const candidate = {
    id: cleanText(candidateInput.id, 100),
    legalName: cleanText(candidateInput.legalName, 160),
    jurisdiction:
      cleanText(candidateInput.jurisdiction, 20).toUpperCase(),
    legalRegistrationReference:
      cleanText(candidateInput.legalRegistrationReference, 300),
    authorizedRepresentativeReference:
      cleanText(candidateInput.authorizedRepresentativeReference, 300)
  };
  const product = catalog.find((entry) =>
    entry.id === cleanText(productInput.id, 100)
  );
  const version = cleanText(productInput.version, 80);
  const regulated = productInput.regulated === true;

  if (!/^[A-Za-z0-9._:-]{3,100}$/.test(candidate.id)) {
    errors.push({ code: 'INVALID_CANDIDATE_ID' });
  }
  if (candidate.legalName.length < 3) {
    errors.push({ code: 'LEGAL_NAME_REQUIRED' });
  }
  if (!/^[A-Z]{2}(?:-[A-Z0-9]{1,8})?$/.test(candidate.jurisdiction)) {
    errors.push({ code: 'INVALID_JURISDICTION_CODE' });
  }
  if (candidate.legalRegistrationReference.length < 3) {
    errors.push({ code: 'LEGAL_REGISTRATION_REFERENCE_REQUIRED' });
  }
  if (candidate.authorizedRepresentativeReference.length < 3) {
    errors.push({
      code: 'AUTHORIZED_REPRESENTATIVE_REFERENCE_REQUIRED'
    });
  }
  if (!product) errors.push({ code: 'REGISTERED_PRODUCT_REQUIRED' });
  if (!/^[A-Za-z0-9._+-]{1,80}$/.test(version)) {
    errors.push({ code: 'INVALID_PRODUCT_VERSION' });
  }

  const evidenceInput = Array.isArray(input.evidence)
    ? input.evidence
    : [];
  if (evidenceInput.length > 100) {
    errors.push({ code: 'EVIDENCE_LIMIT_EXCEEDED' });
  }
  const evidence = evidenceInput
    .slice(0, 100)
    .map((entry) =>
      normalizeEvidence(entry, options.trustedReview === true)
    );
  const knownIds = new Set(REQUIREMENTS.map((entry) => entry.id));
  const unknownIds = evidence
    .filter((entry) => !knownIds.has(entry.requirementId))
    .map((entry) => entry.requirementId);
  if (unknownIds.length > 0) {
    errors.push({
      code: 'UNKNOWN_EVIDENCE_REQUIREMENT',
      requirementIds: [...new Set(unknownIds)]
    });
  }
  const evidenceIds = evidence.map((entry) => entry.requirementId);
  if (new Set(evidenceIds).size !== evidenceIds.length) {
    errors.push({ code: 'DUPLICATE_EVIDENCE_REQUIREMENT' });
  }

  const declarations = {
    informationAccurate:
      input.declarations?.informationAccurate === true,
    rightsToProduce:
      input.declarations?.rightsToProduce === true,
    conflictsDisclosed:
      input.declarations?.conflictsDisclosed === true,
    evidenceReviewConsent:
      input.declarations?.evidenceReviewConsent === true
  };
  const seed = [
    candidate.id,
    product?.id || '',
    version,
    generatedAt
  ].join('|');

  return {
    valid: errors.length === 0,
    errors,
    application: {
      schemaVersion: '1.0.0',
      applicationId:
        `SHEIKHA-PRODUCER-${sha256(seed).slice(0, 20)}`,
      submittedAt: generatedAt,
      candidate,
      product: product
        ? {
          id: product.id,
          nameAr: product.nameAr,
          kind: product.kind,
          class: productClass(product),
          version,
          regulated
        }
        : {
          id: cleanText(productInput.id, 100),
          nameAr: null,
          kind: null,
          class: null,
          version,
          regulated
        },
      evidence,
      declarations,
      privacy: {
        directPersonalIdentityStored: false,
        representativeUsesOpaqueReference: true,
        sensitiveTraitAssessment: false,
        secretCollection: false
      }
    }
  };
}

function assessNormalizedApplication(application, options = {}) {
  const trustedReview = options.trustedReview === true;
  const humanDecisionConfirmed =
    options.humanDecisionConfirmed === true;
  const required = requirementsFor(
    application.product.class,
    application.product.regulated
  );
  const evidenceById = new Map(
    application.evidence.map((entry) => [
      entry.requirementId,
      entry
    ])
  );
  const missing = [];
  const invalid = [];
  const accepted = [];
  const reviewRequired = [];
  const rejected = [];

  for (const requirementEntry of required) {
    const evidence = evidenceById.get(requirementEntry.id);
    if (!evidence) {
      missing.push(requirementEntry.id);
      continue;
    }
    if (!evidence.reference) {
      invalid.push({
        requirementId: requirementEntry.id,
        reason: 'EVIDENCE_REFERENCE_REQUIRED'
      });
      continue;
    }
    if (
      requirementEntry.sha256Required &&
      !isSha256(evidence.sha256)
    ) {
      invalid.push({
        requirementId: requirementEntry.id,
        reason: 'VALID_SHA256_REQUIRED'
      });
      continue;
    }
    if (!trustedReview) {
      reviewRequired.push(requirementEntry.id);
      continue;
    }

    const review = evidence.review;
    if (!review || review.decision !== 'ACCEPTED') {
      if (review?.decision === 'REJECTED') {
        rejected.push(requirementEntry.id);
      } else {
        reviewRequired.push(requirementEntry.id);
      }
      continue;
    }
    if (
      requirementEntry.sha256Required &&
      review.hashVerified !== true
    ) {
      reviewRequired.push(requirementEntry.id);
      continue;
    }
    if (
      requirementEntry.externalAuthorityOnly &&
      review.issuerVerified !== true
    ) {
      reviewRequired.push(requirementEntry.id);
      continue;
    }
    if (
      requirementEntry.qualifiedReviewRequired &&
      review.qualifiedReview !== true
    ) {
      reviewRequired.push(requirementEntry.id);
      continue;
    }
    accepted.push(requirementEntry.id);
  }

  const missingDeclarations = Object.entries(application.declarations)
    .filter(([, value]) => value !== true)
    .map(([key]) => key);
  const completeCount =
    required.length - missing.length - invalid.length;
  const completionPercentage = required.length
    ? Math.round((completeCount / required.length) * 100)
    : 0;
  const verificationPercentage = required.length
    ? Math.round((accepted.length / required.length) * 100)
    : 0;

  let status = 'INCOMPLETE_APPLICATION';
  if (
    missing.length === 0 &&
    invalid.length === 0 &&
    missingDeclarations.length === 0
  ) {
    if (!trustedReview) {
      status = 'EVIDENCE_REVIEW_REQUIRED';
    } else if (rejected.length > 0) {
      status = 'EVIDENCE_REJECTED_REMEDIATION_REQUIRED';
    } else if (reviewRequired.length > 0) {
      status = 'ENGINEERING_OR_REGULATORY_REVIEW_REQUIRED';
    } else if (!humanDecisionConfirmed) {
      status = 'HUMAN_DECISION_REQUIRED';
    } else {
      status = 'ELIGIBLE_FOR_INTERNAL_PRODUCTION_AUTHORIZATION';
    }
  }
  const eligibleForInternalAuthorization =
    status === 'ELIGIBLE_FOR_INTERNAL_PRODUCTION_AUTHORIZATION';

  return {
    system: `${SYSTEM}_ASSESSMENT`,
    applicationId: application.applicationId,
    status,
    product: application.product,
    requiredEvidenceCount: required.length,
    submittedEvidenceCount: completeCount,
    acceptedEvidenceCount: accepted.length,
    completionPercentage,
    verificationPercentage,
    missing,
    invalid,
    reviewRequired,
    rejected,
    missingDeclarations,
    eligibleForInternalAuthorization,
    externalOfficialLicenseIssued: false,
    externalOfficialLicenseClaimed: false,
    candidateRankingPerformed: false,
    sensitiveTraitAssessmentPerformed: false,
    humanFinalDecisionRequired: true,
    executionAuthorized: false
  };
}

function evaluateApplication(input = {}, options = {}) {
  const normalized = normalizeApplication(input, options);
  if (!normalized.valid) {
    return {
      system: `${SYSTEM}_ASSESSMENT`,
      status: 'INVALID_APPLICATION',
      valid: false,
      errors: normalized.errors,
      eligibleForInternalAuthorization: false,
      externalOfficialLicenseIssued: false,
      executionAuthorized: false
    };
  }
  return {
    valid: true,
    ...assessNormalizedApplication(
      normalized.application,
      options
    ),
    normalizedApplication: normalized.application
  };
}

function applicationsRegistry(options = {}) {
  return readJson(
    FILES.applications,
    {
      schemaVersion: '1.0.0',
      registry: 'SHEIKHA_PRODUCER_APPLICATIONS_V1',
      revision: 0,
      applications: []
    },
    options
  );
}

function authorizationsRegistry(options = {}) {
  return readJson(
    FILES.authorizations,
    {
      schemaVersion: '1.0.0',
      registry: 'SHEIKHA_INTERNAL_PRODUCTION_AUTHORIZATIONS_V1',
      revision: 0,
      authorizations: []
    },
    options
  );
}

function auditRegistry(options = {}) {
  return readJson(
    FILES.audit,
    {
      schemaVersion: '1.0.0',
      registry: 'SHEIKHA_PRODUCTION_QUALIFICATION_AUDIT_V1',
      revision: 0,
      events: []
    },
    options
  );
}

function appendAudit(event, options = {}) {
  const registry = auditRegistry(options);
  const entry = {
    eventId:
      `SHEIKHA-QUAL-AUDIT-${hashRecord(event).slice(0, 20)}`,
    ...event
  };
  registry.events.push(entry);
  registry.revision += 1;
  writeJson(FILES.audit, registry, options);
  return entry;
}

function submitApplication(input, actorInput, options = {}) {
  const actor = normalizeActor(actorInput);
  if (!actorAllowed(actor)) {
    return {
      ok: false,
      status: 'ACTOR_NOT_AUTHORIZED',
      application: null
    };
  }
  const normalized = normalizeApplication(input, options);
  if (!normalized.valid) {
    return {
      ok: false,
      status: 'INVALID_APPLICATION',
      errors: normalized.errors,
      application: null
    };
  }

  const registry = applicationsRegistry(options);
  const assessment = assessNormalizedApplication(
    normalized.application
  );
  const application = {
    ...normalized.application,
    status: assessment.status,
    submittedBy: actor,
    assessment: {
      status: assessment.status,
      completionPercentage: assessment.completionPercentage,
      missing: assessment.missing,
      invalid: assessment.invalid
    }
  };
  registry.applications.push(application);
  registry.revision += 1;
  writeJson(FILES.applications, registry, options);
  appendAudit({
    type: 'APPLICATION_SUBMITTED',
    occurredAt: application.submittedAt,
    actor,
    applicationId: application.applicationId,
    productId: application.product.id,
    recordSha256: hashRecord(application)
  }, options);

  return {
    ok: true,
    status: application.status,
    application,
    assessment
  };
}

function applyEvidenceReviews(application, reviews, actor, reviewedAt) {
  const reviewById = new Map(
    (Array.isArray(reviews) ? reviews : []).map((review) => [
      cleanText(review.requirementId, 100).toUpperCase(),
      review
    ])
  );
  return {
    ...application,
    evidence: application.evidence.map((evidence) => {
      const submittedReview = reviewById.get(evidence.requirementId);
      if (!submittedReview) return evidence;
      const decision =
        cleanText(submittedReview.decision, 40).toUpperCase();
      return {
        ...evidence,
        review: {
          decision: REVIEW_DECISIONS.includes(decision)
            ? decision
            : 'MORE_EVIDENCE_REQUIRED',
          hashVerified: submittedReview.hashVerified === true,
          issuerVerified: submittedReview.issuerVerified === true,
          qualifiedReview:
            submittedReview.qualifiedReview === true,
          notes: cleanText(submittedReview.notes, 500),
          reviewedBy: actor.id,
          reviewedAt
        }
      };
    })
  };
}

function reviewApplication(
  applicationId,
  reviewInput,
  actorInput,
  options = {}
) {
  const actor = normalizeActor(actorInput);
  if (!actorAllowed(actor) || actor.role === 'operator') {
    return { ok: false, status: 'REVIEWER_NOT_AUTHORIZED' };
  }
  const registry = applicationsRegistry(options);
  const index = registry.applications.findIndex((entry) =>
    entry.applicationId === applicationId
  );
  if (index < 0) {
    return { ok: false, status: 'APPLICATION_NOT_FOUND' };
  }
  const reviewedAt =
    options.generatedAt || new Date().toISOString();
  const reviewed = applyEvidenceReviews(
    registry.applications[index],
    reviewInput.reviews,
    actor,
    reviewedAt
  );
  const humanDecisionConfirmed =
    reviewInput.confirmed === true &&
    reviewInput.humanDecision ===
      'QUALIFY_FOR_INTERNAL_PRODUCTION_AUTHORIZATION';
  const assessment = assessNormalizedApplication(reviewed, {
    trustedReview: true,
    humanDecisionConfirmed
  });
  const application = {
    ...reviewed,
    status: assessment.status,
    lastReviewedAt: reviewedAt,
    lastReviewedBy: actor,
    assessment: {
      status: assessment.status,
      completionPercentage: assessment.completionPercentage,
      verificationPercentage: assessment.verificationPercentage,
      missing: assessment.missing,
      invalid: assessment.invalid,
      reviewRequired: assessment.reviewRequired,
      rejected: assessment.rejected
    }
  };
  registry.applications[index] = application;
  registry.revision += 1;
  writeJson(FILES.applications, registry, options);
  appendAudit({
    type: 'APPLICATION_REVIEWED',
    occurredAt: reviewedAt,
    actor,
    applicationId,
    decision: assessment.status,
    recordSha256: hashRecord(application)
  }, options);
  return {
    ok: true,
    status: assessment.status,
    application,
    assessment
  };
}

function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function authorizationIsEffective(
  authorization,
  observedAt = new Date().toISOString()
) {
  if (authorization.status !== 'ACTIVE_INTERNAL') return false;
  const observed = Date.parse(observedAt);
  const issued = Date.parse(authorization.issuedAt);
  const expires = Date.parse(authorization.expiresAt);
  return Number.isFinite(observed) &&
    Number.isFinite(issued) &&
    Number.isFinite(expires) &&
    issued <= observed &&
    observed < expires;
}

function buildInternalAuthorization(
  application,
  actor,
  issuedAt,
  validityDays,
  previousAuthorizationId = null
) {
  const identitySeed = [
    application.applicationId,
    issuedAt,
    previousAuthorizationId || 'INITIAL'
  ].join('|');
  return {
    schemaVersion: '1.0.0',
    authorizationId:
      `SHEIKHA-INT-PROD-${sha256(identitySeed).slice(0, 20)}`,
    type: 'INTERNAL_PRODUCTION_AUTHORIZATION',
    status: 'ACTIVE_INTERNAL',
    applicationId: application.applicationId,
    candidateId: application.candidate.id,
    product: application.product,
    scope: {
      permits: [
        'CONTROLLED_PRODUCTION_BUILD',
        'QUALITY_VERIFICATION',
        'INTERNAL_RELEASE_CANDIDATE'
      ],
      doesNotPermit: [
        'GOVERNMENT_REGULATED_OPERATION_WITHOUT_EXTERNAL_LICENSE',
        'EXTERNAL_CERTIFICATION_CLAIM',
        'PUBLIC_SALE_WITHOUT_COMMERCIAL_CONTRACT',
        'SAFETY_CRITICAL_DEPLOYMENT_WITHOUT_CERTIFICATION'
      ]
    },
    issuedAt,
    expiresAt: addDays(issuedAt, validityDays),
    issuedBy: actor,
    previousAuthorizationId,
    evidenceDigest: hashRecord(application.evidence),
    externalAuthority: false,
    governmentLicense: false,
    independentSafetyCertificate: false,
    humanApprovalRecorded: true,
    automatedIssuance: false
  };
}

function issueInternalAuthorization(
  applicationId,
  input,
  actorInput,
  options = {}
) {
  const actor = normalizeActor(actorInput);
  if (!actorAllowed(actor) || actor.role === 'operator') {
    return { ok: false, status: 'ISSUER_NOT_AUTHORIZED' };
  }
  if (
    input.confirmed !== true ||
    input.decision !== 'ISSUE_INTERNAL_PRODUCTION_AUTHORIZATION'
  ) {
    return {
      ok: false,
      status: 'EXPLICIT_HUMAN_APPROVAL_REQUIRED'
    };
  }

  const applications = applicationsRegistry(options);
  const applicationIndex = applications.applications.findIndex(
    (entry) => entry.applicationId === applicationId
  );
  if (applicationIndex < 0) {
    return { ok: false, status: 'APPLICATION_NOT_FOUND' };
  }
  const application = applications.applications[applicationIndex];
  const assessment = assessNormalizedApplication(application, {
    trustedReview: true,
    humanDecisionConfirmed: true
  });
  if (!assessment.eligibleForInternalAuthorization) {
    return {
      ok: false,
      status: 'APPLICATION_NOT_ELIGIBLE',
      assessment
    };
  }

  const validityDays = Number(input.validityDays || 180);
  if (
    !Number.isInteger(validityDays) ||
    validityDays < 1 ||
    validityDays > 365
  ) {
    return { ok: false, status: 'INVALID_VALIDITY_PERIOD' };
  }
  const issuedAt = options.generatedAt || new Date().toISOString();
  const registry = authorizationsRegistry(options);
  const existing = registry.authorizations.find((entry) =>
    entry.applicationId === applicationId &&
    authorizationIsEffective(entry, issuedAt)
  );
  if (existing) {
    return {
      ok: true,
      status: 'ACTIVE_INTERNAL',
      idempotent: true,
      authorization: existing
    };
  }

  const authorization = buildInternalAuthorization(
    application,
    actor,
    issuedAt,
    validityDays
  );
  registry.authorizations.push(authorization);
  registry.revision += 1;
  writeJson(FILES.authorizations, registry, options);

  applications.applications[applicationIndex] = {
    ...application,
    status: 'AUTHORIZED_INTERNAL',
    authorizationId: authorization.authorizationId
  };
  applications.revision += 1;
  writeJson(FILES.applications, applications, options);
  appendAudit({
    type: 'INTERNAL_PRODUCTION_AUTHORIZATION_ISSUED',
    occurredAt: issuedAt,
    actor,
    applicationId,
    authorizationId: authorization.authorizationId,
    recordSha256: hashRecord(authorization)
  }, options);

  return {
    ok: true,
    status: authorization.status,
    idempotent: false,
    authorization
  };
}

function renewInternalAuthorization(
  authorizationId,
  input,
  actorInput,
  options = {}
) {
  const actor = normalizeActor(actorInput);
  if (!actorAllowed(actor) || actor.role === 'operator') {
    return { ok: false, status: 'ISSUER_NOT_AUTHORIZED' };
  }
  if (
    input.confirmed !== true ||
    input.evidenceRevalidated !== true ||
    input.decision !== 'RENEW_INTERNAL_PRODUCTION_AUTHORIZATION'
  ) {
    return {
      ok: false,
      status: 'EXPLICIT_HUMAN_REVALIDATION_REQUIRED'
    };
  }

  const issuedAt = options.generatedAt || new Date().toISOString();
  const registry = authorizationsRegistry(options);
  const idempotentRenewal = registry.authorizations.find((entry) =>
    entry.previousAuthorizationId === authorizationId &&
    authorizationIsEffective(entry, issuedAt)
  );
  if (idempotentRenewal) {
    return {
      ok: true,
      status: 'ACTIVE_INTERNAL',
      idempotent: true,
      authorization: idempotentRenewal
    };
  }
  const previousIndex = registry.authorizations.findIndex((entry) =>
    entry.authorizationId === authorizationId
  );
  if (previousIndex < 0) {
    return { ok: false, status: 'AUTHORIZATION_NOT_FOUND' };
  }
  const previous = registry.authorizations[previousIndex];
  if (previous.status === 'REVOKED_INTERNAL') {
    return {
      ok: false,
      status: 'REVOKED_AUTHORIZATION_CANNOT_BE_RENEWED'
    };
  }

  const applications = applicationsRegistry(options);
  const applicationIndex = applications.applications.findIndex((entry) =>
    entry.applicationId === previous.applicationId
  );
  if (applicationIndex < 0) {
    return { ok: false, status: 'APPLICATION_NOT_FOUND' };
  }
  const application = applications.applications[applicationIndex];
  const assessment = assessNormalizedApplication(application, {
    trustedReview: true,
    humanDecisionConfirmed: true
  });
  if (!assessment.eligibleForInternalAuthorization) {
    return {
      ok: false,
      status: 'APPLICATION_NOT_ELIGIBLE',
      assessment
    };
  }

  const validityDays = Number(input.validityDays || 180);
  if (
    !Number.isInteger(validityDays) ||
    validityDays < 1 ||
    validityDays > 365
  ) {
    return { ok: false, status: 'INVALID_VALIDITY_PERIOD' };
  }
  const authorization = buildInternalAuthorization(
    application,
    actor,
    issuedAt,
    validityDays,
    authorizationId
  );
  registry.authorizations[previousIndex] = {
    ...previous,
    status: 'SUPERSEDED_INTERNAL',
    supersededAt: issuedAt,
    supersededBy: authorization.authorizationId
  };
  registry.authorizations.push(authorization);
  registry.revision += 1;
  writeJson(FILES.authorizations, registry, options);

  applications.applications[applicationIndex] = {
    ...application,
    status: 'AUTHORIZED_INTERNAL',
    authorizationId: authorization.authorizationId
  };
  applications.revision += 1;
  writeJson(FILES.applications, applications, options);
  appendAudit({
    type: 'INTERNAL_PRODUCTION_AUTHORIZATION_RENEWED',
    occurredAt: issuedAt,
    actor,
    applicationId: application.applicationId,
    previousAuthorizationId: authorizationId,
    authorizationId: authorization.authorizationId,
    recordSha256: hashRecord(authorization)
  }, options);

  return {
    ok: true,
    status: authorization.status,
    idempotent: false,
    authorization
  };
}

function suspendInternalAuthorization(
  authorizationId,
  input,
  actorInput,
  options = {}
) {
  const actor = normalizeActor(actorInput);
  if (!actorAllowed(actor) || actor.role === 'operator') {
    return { ok: false, status: 'ISSUER_NOT_AUTHORIZED' };
  }
  const reason = cleanText(input.reason, 500);
  if (
    input.confirmed !== true ||
    input.decision !== 'SUSPEND_INTERNAL_PRODUCTION_AUTHORIZATION' ||
    reason.length < 10
  ) {
    return {
      ok: false,
      status: 'EXPLICIT_HUMAN_SUSPENSION_REQUIRED'
    };
  }

  const suspendedAt =
    options.generatedAt || new Date().toISOString();
  const registry = authorizationsRegistry(options);
  const index = registry.authorizations.findIndex((entry) =>
    entry.authorizationId === authorizationId
  );
  if (index < 0) {
    return { ok: false, status: 'AUTHORIZATION_NOT_FOUND' };
  }
  const authorization = registry.authorizations[index];
  if (!authorizationIsEffective(authorization, suspendedAt)) {
    return { ok: false, status: 'AUTHORIZATION_NOT_ACTIVE' };
  }
  const suspended = {
    ...authorization,
    status: 'SUSPENDED_INTERNAL',
    suspendedAt,
    suspendedBy: actor,
    suspensionReason: reason
  };
  registry.authorizations[index] = suspended;
  registry.revision += 1;
  writeJson(FILES.authorizations, registry, options);

  const applications = applicationsRegistry(options);
  const applicationIndex = applications.applications.findIndex((entry) =>
    entry.applicationId === authorization.applicationId
  );
  if (applicationIndex >= 0) {
    applications.applications[applicationIndex] = {
      ...applications.applications[applicationIndex],
      status: 'AUTHORIZATION_SUSPENDED'
    };
    applications.revision += 1;
    writeJson(FILES.applications, applications, options);
  }
  appendAudit({
    type: 'INTERNAL_PRODUCTION_AUTHORIZATION_SUSPENDED',
    occurredAt: suspendedAt,
    actor,
    applicationId: authorization.applicationId,
    authorizationId,
    reason,
    recordSha256: hashRecord(suspended)
  }, options);

  return {
    ok: true,
    status: suspended.status,
    authorization: suspended
  };
}

function buildProductReadinessMatrix(options = {}) {
  const catalog = productCatalog();
  const applications = applicationsRegistry(options).applications;
  const authorizations =
    authorizationsRegistry(options).authorizations;
  const technical = readJson(FILES.technicalExperience, {}, options);
  const licenseRecognition =
    readJson(FILES.licenseRecognition, {}, options);

  return catalog.map((product) => {
    const type = productClass(product);
    const productApplications = applications.filter((entry) =>
      entry.product.id === product.id
    );
    const activeAuthorizations = authorizations.filter((entry) =>
      entry.product.id === product.id &&
      authorizationIsEffective(
        entry,
        options.generatedAt || new Date().toISOString()
      )
    );
    const required = requirementsFor(type, false);
    const productionReady = activeAuthorizations.length > 0;
    return {
      productId: product.id,
      nameAr: product.nameAr,
      kind: product.kind,
      productClass: type,
      registered: true,
      technicalProfilePresent:
        technical.coverage?.technicalProfiles === catalog.length,
      internalLicensePolicyPresent:
        licenseRecognition.license?.internalOwnerAdoption === true,
      dossierRequirementCount: required.length,
      applicationCount: productApplications.length,
      activeInternalAuthorizationCount:
        activeAuthorizations.length,
      productionReady,
      status: productionReady
        ? 'INTERNALLY_AUTHORIZED_FOR_SCOPED_PRODUCTION'
        : 'DOSSIER_AND_PRODUCER_EVIDENCE_REQUIRED',
      externalOfficialLicenseIssued: false,
      hardwareQualificationRequired:
        type === 'HARDWARE' || type === 'HYBRID',
      publicSaleAuthorizedByThisMatrix: false
    };
  });
}

function buildFileIndex(family) {
  const files = REQUIREMENTS.filter((entry) =>
    entry.family === family
  );
  return {
    schemaVersion: '1.0.0',
    system: `${SYSTEM}_${family}_FILE_INDEX`,
    family,
    count: files.length,
    status: 'REQUIREMENTS_REGISTERED',
    files,
    completionPolicy:
      'A registered requirement is not complete until submitted evidence ' +
      'is hash-verified and accepted by a qualified human reviewer.'
  };
}

function buildQualificationStatus(options = {}) {
  const contract = readJson(FILES.contract, {}, options);
  const licenses = readJson(FILES.licenseRegistry, {}, options);
  const licenseRecognition =
    readJson(FILES.licenseRecognition, {}, options);
  const hardware =
    readJson(FILES.hardwareQualification, {}, options);
  const technical =
    readJson(FILES.technicalExperience, {}, options);
  const siteSmoke = readJson(FILES.siteSmoke, {}, options);
  const productionGate =
    readJson(FILES.productionGate, {}, options);
  const external =
    readJson(FILES.externalAccreditation, {}, options);
  const applications = applicationsRegistry(options);
  const authorizations = authorizationsRegistry(options);
  const audit = auditRegistry(options);
  const productMatrix = buildProductReadinessMatrix(options);

  const checks = {
    contractActive: contract.status === 'ACTIVE_CONTRACT',
    internalLicensingHonest:
      licenses.policy?.internalLicensesAllowed === true &&
      licenses.policy?.externalLicensesIssuedBySheikha === false,
    officialClaimsDenied:
      licenseRecognition.truthBoundaries
        ?.governmentApprovalClaimed === false &&
      licenseRecognition.truthBoundaries
        ?.officialRegistrationClaimed === false,
    hardwareBoundaryHonest:
      hardware.claimBoundary?.runnableEverywhereToday === false &&
      hardware.coverage?.physicalVerifiedTargets === 0,
    productProfilesRegistered:
      Number(technical.coverage?.products || 0) ===
      productMatrix.length,
    applicationRegistryValid:
      Array.isArray(applications.applications),
    authorizationRegistryValid:
      Array.isArray(authorizations.authorizations),
    auditRegistryValid: Array.isArray(audit.events),
    candidateSensitiveScoringDenied:
      contract.candidatePolicy?.sensitiveTraitInference === false,
    aiFinalAuthorizationDenied:
      contract.aiPolicy?.mayIssueFinalAuthorization === false
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([id]) => id);
  const passed = failedChecks.length === 0;
  const activeAuthorizations =
    authorizations.authorizations.filter((entry) =>
      authorizationIsEffective(
        entry,
        options.generatedAt || new Date().toISOString()
      )
    );
  const allProductsProductionReadyObserved =
    productMatrix.length > 0 &&
    productMatrix.every((entry) => entry.productionReady);
  const externalCertificatesIssued =
    Number(external.submission?.externalCertificatesIssued || 0);

  return {
    schemaVersion: '1.0.0',
    system: SYSTEM,
    generatedAt: options.generatedAt || new Date().toISOString(),
    status: passed
      ? 'ACTIVE_INTERNAL_QUALIFICATION_GATE'
      : 'QUALIFICATION_SYSTEM_REVIEW_REQUIRED',
    passed,
    checks,
    failedChecks,
    coverage: {
      registeredProducts: productMatrix.length,
      productionFileRequirements: REQUIREMENTS.length,
      administrativeRequirements:
        REQUIREMENTS.filter((entry) =>
          entry.family === 'ADMINISTRATIVE'
        ).length,
      engineeringRequirements:
        REQUIREMENTS.filter((entry) =>
          entry.family === 'ENGINEERING'
        ).length,
      productionRequirements:
        REQUIREMENTS.filter((entry) =>
          entry.family === 'PRODUCTION'
        ).length,
      producerApplications: applications.applications.length,
      activeInternalAuthorizations: activeAuthorizations.length,
      productionReadyProducts:
        productMatrix.filter((entry) => entry.productionReady).length,
      externallyIssuedCertificates: externalCertificatesIssued,
      physicallyVerifiedHardwareTargets:
        Number(hardware.coverage?.physicalVerifiedTargets || 0)
    },
    productReadiness: productMatrix,
    runtimeEvidence: {
      localSiteSmokePassed: siteSmoke.passed === true,
      productionGateStatus: productionGate.status || 'NOT_EXECUTED',
      hardwareStatus: hardware.status || 'EVIDENCE_UNAVAILABLE',
      technicalDocumentationStatus:
        technical.status || 'EVIDENCE_UNAVAILABLE'
    },
    authorizationPolicy: {
      internalProducerQualificationAvailable: true,
      internalProductionAuthorizationAvailable: true,
      officialGovernmentLicenseIssuanceAvailable: false,
      externalSafetyCertificationIssuanceAvailable: false,
      humanApprovalRequired: true,
      qualifiedReviewRequired: true,
      defaultAuthorization: 'DENY'
    },
    candidatePolicy: contract.candidatePolicy,
    aiPolicy: contract.aiPolicy,
    governance: contract.governance,
    truthBoundaries: {
      internalAuthorizationIsNotGovernmentLicense: true,
      externalCertificatesIssued,
      externalCertificationClaimed: false,
      allProductsProductionReadyObserved,
      allProductsProductionReadyClaimed: false,
      allHardwareQualified: false,
      candidateCompletionIsNotVerification: true,
      automatedCandidateRanking: false,
      automatedReligiousRuling: false
    },
    registryState: {
      applicationRevision: applications.revision,
      authorizationRevision: authorizations.revision,
      auditRevision: audit.revision
    },
    outputs: FILES,
    nextGate:
      'Submit a product-version dossier, complete qualified review, ' +
      'record a human decision, then issue a scoped internal authorization.'
  };
}

function buildActivationArtifacts(options = {}) {
  const productReadiness = buildProductReadinessMatrix(options);
  return {
    requirements: {
      schemaVersion: '1.0.0',
      registry: 'SHEIKHA_PRODUCTION_FILE_REQUIREMENTS_V1',
      status: 'ACTIVE',
      count: REQUIREMENTS.length,
      requirements: REQUIREMENTS
    },
    administrativeIndex: buildFileIndex('ADMINISTRATIVE'),
    engineeringIndex: buildFileIndex('ENGINEERING'),
    productionIndex: buildFileIndex('PRODUCTION'),
    productReadiness: {
      schemaVersion: '1.0.0',
      registry: 'SHEIKHA_PRODUCT_PRODUCTION_READINESS_V1',
      status: 'ACTIVE_EVIDENCE_REQUIRED',
      products: productReadiness
    },
    report: buildQualificationStatus(options)
  };
}

module.exports = Object.freeze({
  SYSTEM,
  FILES,
  REQUIREMENTS,
  ALLOWED_ACTOR_ROLES,
  REVIEW_DECISIONS,
  normalizeApplication,
  requirementsFor,
  evaluateApplication,
  assessNormalizedApplication,
  submitApplication,
  reviewApplication,
  issueInternalAuthorization,
  renewInternalAuthorization,
  suspendInternalAuthorization,
  authorizationIsEffective,
  applicationsRegistry,
  authorizationsRegistry,
  buildProductReadinessMatrix,
  buildQualificationStatus,
  buildActivationArtifacts,
  writeJson
});
