'use strict';

const { validatePortfolio, sha256 } = require('./shared-goals-v1');
const { runMethodologyPipeline } = require('../scientific-methodology/scientific-methodology-engine');
const { planOrganization } = require('../organization/department-planner-v1');
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
const SHA = /^[a-f0-9]{64}$/;
const RIGHTS = ['use', 'modify', 'train', 'distribute', 'sublicense', 'teach'];
const DAY = 86400000;
function check(ok, code) { if (!ok) throw new Error(code); }
function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function id(value) { return typeof value === 'string' && ID.test(value); }
function text(value) { return typeof value === 'string' && value.trim().length > 0 && value.length <= 10000; }
function digest(value) { return typeof value === 'string' && SHA.test(value); }
function date(value) {
  check(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value), 'UTC_TIMESTAMP_REQUIRED');
  const time = Date.parse(value);
  check(Number.isFinite(time) && new Date(time).toISOString() === value, 'INVALID_TIMESTAMP');
  return time;
}
function records(values, code) {
  check(Array.isArray(values) && values.length <= 100, code);
  const ids = new Set();
  values.forEach(value => { check(object(value) && id(value.id) && !ids.has(value.id), code); ids.add(value.id); });
  return ids;
}
function items(values, predicate) { return Array.isArray(values) && values.length > 0 && values.length <= 100 && new Set(values).size === values.length && values.every(predicate); }
function scopedRelationship(portfolio, request) {
  const rel = portfolio.relationships.find(item => item.id === request.relationshipId && item.tenantId === request.tenantId);
  check(rel, 'RELATIONSHIP_SCOPE_DENIED');
  return rel;
}

function partnerCalendar(portfolio, asOf) {
  const start = date(asOf);
  const stages = [
    ['scope', 0, 'تحديد الرؤية والحاجة والمخولين', 'IDENTITY_AND_PURPOSE_REVIEW'],
    ['qualify', 3, 'تقييم الجدوى والقدرة والحقوق', 'ECONOMIC_AND_RIGHTS_REVIEW'],
    ['charter', 7, 'مراجعة ميثاق الأهداف ونطاق العمل', 'COUNTERPARTY_REVIEW'],
    ['agreement', 14, 'مراجعة الاتفاقية والتفويض قبل التوقيع', 'AUTHORIZED_SIGNATURE_REQUIRED'],
    ['pilot', 30, 'مراجعة التجربة والقبول والتحصيل', 'DELIVERY_EVIDENCE_AND_FINANCE_REVIEW'],
    ['improve', 60, 'مراجعة المنفعة والشكاوى والتحسين', 'JOINT_REVIEW'],
    ['renew', 90, 'قرار استمرار أو تعديل أو خروج منظم', 'SEPARATE_RENEWAL_APPROVAL']
  ];
  return portfolio.relationships.map(rel => ({
    relationshipId: rel.id, tenantId: rel.tenantId, displayName: rel.displayName,
    declaredStage: rel.stage, scheduleType: 'PROPOSED_RELATIVE_CALENDAR_NOT_COMMITTED_DATES',
    automaticContactAllowed: false,
    milestones: ['CLOSED', 'SUSPENDED'].includes(rel.stage) ? [] : stages.map(([stageId, day, title, gate]) => ({
      id: `${rel.id}-${stageId}`, dayFromPlanStart: day, proposedAt: new Date(start + day * DAY).toISOString(),
      title, ownerId: rel.ownerId, requires: gate, state: 'DRAFT_NOT_SCHEDULED', automaticExecutionAllowed: false
    }))
  }));
}

function methodologyUnit(unit, asOf) {
  check(text(unit.title) && text(unit.domain) && text(unit.audience) && text(unit.prerequisites), 'EDUCATION_SCOPE_REQUIRED');
  check(id(unit.ownerId) && id(unit.reviewerId) && unit.ownerId !== unit.reviewerId, 'INDEPENDENT_EDUCATOR_REVIEW_REQUIRED');
  check(['POLICY', 'SCIENTIFIC_PROTOCOL', 'TECHNICAL_SPEC', 'SOP', 'CURRICULUM'].includes(unit.kind), 'UNSUPPORTED_METHOD_KIND');
  const outcomeIds = records(unit.outcomes, 'INVALID_LEARNING_OUTCOMES');
  check(outcomeIds.size > 0, 'LEARNING_OUTCOMES_REQUIRED');
  unit.outcomes.forEach(outcome => check(text(outcome.description) && text(outcome.exercise) && text(outcome.acceptance), 'OUTCOME_ASSESSMENT_REQUIRED'));
  const reviewDue = date(asOf) >= date(unit.reviewBy);
  const analysis = runMethodologyPipeline({ domain: unit.domain, protocol: unit.protocol });
  const protocol = object(unit.protocol) ? unit.protocol : {};
  return {
    id: unit.id, title: unit.title, kind: unit.kind, domain: unit.domain, audience: unit.audience,
    prerequisites: unit.prerequisites, ownerId: unit.ownerId, reviewerId: unit.reviewerId,
    revision: text(protocol.revision) ? protocol.revision : null,
    reviewBy: unit.reviewBy, renewalState: reviewDue ? 'REVIEW_DUE_NO_AUTOMATIC_RENEWAL' : 'REVIEW_DATE_NOT_YET_DUE',
    protocolReview: analysis.record,
    lessons: unit.outcomes.map((outcome, index) => ({
      order: index + 1, outcomeId: outcome.id, objective: outcome.description,
      explanation: 'اربط التعريف والنطاق بالمصدر، ثم نفذ التمرين ضمن التفويض وقارن النتيجة بمعيار القبول.',
      sourceReferences: Array.isArray(protocol.references) ? protocol.references.filter(text).slice(0, 100) : [],
      exercise: outcome.exercise, assessmentCriterion: outcome.acceptance,
      result: null, completed: false
    })),
    evidenceRequirements: ['source-and-rights-review', 'measurement-and-reproducibility', 'educator-review', 'learner-safety', 'version-and-change-record'],
    reviewActions: analysis.record.missingFields.map(field => ({ field, action: 'COMPLETE_PROTOCOL_FIELD', executed: false })),
    publishingAllowed: false, scientificValidityCertified: false, externalAccreditationClaimed: false,
    completionCertificateIssued: false, noveltyClaimed: false, ownershipClaim: 'ORIGINAL_SHEIKHA_ARRANGEMENT_ONLY_NOT_UNDERLYING_SCIENCE'
  };
}

function licenseReview(request, assets, portfolio, asOf) {
  const rel = scopedRelationship(portfolio, request);
  check(items(request.requestedRights, right => RIGHTS.includes(right)), 'INVALID_REQUESTED_RIGHTS');
  check(id(request.assetId) && digest(request.assetSha256), 'ASSET_BINDING_REQUIRED');
  check(text(request.territory) && text(request.purpose), 'LICENSE_SCOPE_REQUIRED');
  const now = date(asOf), validFrom = date(request.validFrom), validUntil = date(request.validUntil);
  check(validFrom < validUntil, 'INVALID_LICENSE_WINDOW');
  const asset = assets.find(entry => entry.id === request.assetId && entry.tenantId === request.tenantId);
  const blockers = [];
  if (!asset) blockers.push('ASSET_NOT_IN_TENANT_REGISTRY');
  else {
    if (asset.sha256 !== request.assetSha256) blockers.push('ASSET_DIGEST_MISMATCH');
    if (asset.origin === 'UNKNOWN') blockers.push('OWNERSHIP_OR_LICENSE_UNKNOWN');
    if (!text(asset.rightsEvidenceReference)) blockers.push('RIGHTS_EVIDENCE_REFERENCE_MISSING');
    if (!request.requestedRights.every(right => asset.permittedRights.includes(right))) blockers.push('REQUEST_EXCEEDS_DECLARED_RIGHTS');
    if (now >= date(asset.rightsValidUntil) || validUntil > date(asset.rightsValidUntil)) blockers.push('UPSTREAM_RIGHTS_EXPIRED_OR_SHORTER');
  }
  if (now >= validUntil) blockers.push('REQUEST_EXPIRED');
  if (now < validFrom) blockers.push('REQUEST_NOT_YET_VALID');
  if (['CLOSED', 'SUSPENDED'].includes(rel.stage)) blockers.push('RELATIONSHIP_NOT_ELIGIBLE');
  return { requestId: request.id, relationshipId: rel.id, tenantId: rel.tenantId, assetId: request.assetId,
    assetSha256: request.assetSha256, requestedRights: [...request.requestedRights], territory: request.territory,
    purpose: request.purpose, validFrom: request.validFrom, validUntil: request.validUntil,
    blockers, decision: blockers.length ? 'HOLD_LICENSE_DRAFT' : 'DRAFT_STRUCTURE_COMPLETE_AUTHORITY_REVIEW_REQUIRED',
    licenseIssued: false, permissionGranted: false, assetOwnershipVerified: false, automaticRenewalAllowed: false,
    legalOrRegulatoryLicenseIssued: false, thirdPartyRightsPreserved: true };
}

function signingReview(request, portfolio, asOf) {
  const rel = scopedRelationship(portfolio, request);
  check(text(request.documentText) && digest(request.documentSha256) && digest(request.templateSha256), 'AGREEMENT_DOCUMENT_REQUIRED');
  check(Number.isSafeInteger(request.amountMinor) && request.amountMinor >= 0 && /^[A-Z]{3}$/.test(request.currency || ''), 'INTEGER_AMOUNT_AND_CURRENCY_REQUIRED');
  check(items(request.partyIds, id) && request.partyIds.length >= 2, 'AGREEMENT_PARTIES_REQUIRED');
  const actualDigest = sha256(Buffer.from(request.documentText, 'utf8'));
  const blockers = [];
  if (request.documentSha256 !== actualDigest) blockers.push('DOCUMENT_DIGEST_MISMATCH');
  if (['CLOSED', 'SUSPENDED'].includes(rel.stage)) blockers.push('RELATIONSHIP_NOT_ELIGIBLE');
  const delegation = request.delegation;
  if (!object(delegation)) blockers.push('WRITTEN_DELEGATION_MISSING');
  else {
    if (!text(delegation.writtenAuthorityReference) || !id(delegation.principalId) || !id(delegation.agentId) || delegation.principalId === delegation.agentId) blockers.push('DELEGATION_IDENTITY_AND_REFERENCE_REQUIRED');
    if (!request.partyIds.includes(delegation.principalId)) blockers.push('PRINCIPAL_NOT_AGREEMENT_PARTY');
    if (delegation.tenantId !== rel.tenantId || delegation.relationshipId !== rel.id) blockers.push('DELEGATION_SCOPE_MISMATCH');
    if (delegation.templateSha256 !== request.templateSha256 || delegation.approvedDocumentSha256 !== actualDigest) blockers.push('DELEGATION_DOCUMENT_OR_TEMPLATE_MISMATCH');
    if (!Number.isSafeInteger(delegation.maximumAmountMinor) || delegation.maximumAmountMinor < 0 || request.amountMinor > delegation.maximumAmountMinor || request.currency !== delegation.currency) blockers.push('FINANCIAL_AUTHORITY_EXCEEDED');
    if (!items(delegation.partyIds, id) || delegation.partyIds.length !== request.partyIds.length || !request.partyIds.every(party => delegation.partyIds.includes(party))) blockers.push('DELEGATION_PARTIES_MISMATCH');
    try {
      const from = date(delegation.notBefore), until = date(delegation.expiresAt), now = date(asOf);
      if (from >= until || now < from || now >= until) blockers.push('DELEGATION_TIME_INVALID');
    } catch { blockers.push('DELEGATION_TIME_INVALID'); }
    if (delegation.revoked !== false) blockers.push('DELEGATION_REVOCATION_NOT_CLEAR');
  }
  return { requestId: request.id, relationshipId: rel.id, tenantId: rel.tenantId,
    actualDocumentSha256: actualDigest, templateSha256: request.templateSha256,
    amountMinor: request.amountMinor, currency: request.currency,
    blockers, decision: blockers.length ? 'HOLD_UNSIGNED_AGREEMENT' : 'STRUCTURAL_CHECKS_PASSED_SIGNING_PROVIDER_REVIEW_REQUIRED',
    signerIdentityVerified: false, delegationAuthenticated: false, signatureProduced: false, agreementExecuted: false,
    signAllowed: false, providerCallPerformed: false,
    remainingRequirements: ['authenticated-authority-and-identity', 'current-revocation-check', 'counterparty-consent', 'valid-signature-provider-workflow', 'document-bound-single-use-audit-and-retention'] };
}

function buildOperatingKit(input) {
  check(object(input) && input.schemaVersion === '1.0.0', 'OPERATING_KIT_INPUT_REQUIRED');
  validatePortfolio(input.portfolio); date(input.asOf);
  records(input.methodologies, 'INVALID_METHODOLOGY_UNITS');
  records(input.assets, 'INVALID_ASSETS');
  records(input.licenseRequests, 'INVALID_LICENSE_REQUESTS');
  records(input.signingRequests, 'INVALID_SIGNING_REQUESTS');
  const organizations = input.organizations === undefined ? [] : input.organizations;
  records(organizations, 'INVALID_ORGANIZATIONS');
  check(organizations.length <= 20, 'ORGANIZATION_LIMIT_EXCEEDED');
  input.assets.forEach(asset => {
    check(id(asset.tenantId) && digest(asset.sha256) && ['OWNED_ASSERTED', 'EXTERNAL_LICENSED_ASSERTED', 'UNKNOWN'].includes(asset.origin), 'INVALID_ASSET_IDENTITY');
    check(items(asset.permittedRights, right => RIGHTS.includes(right)), 'INVALID_ASSET_RIGHTS'); date(asset.rightsValidUntil);
  });
  const pack = {
    system: 'SHEIKHA_OPERATING_EDUCATION_PARTNERSHIP_KIT_V1', classification: 'CONFIDENTIAL_INTERNAL_DRAFT',
    schemaVersion: '1.0.0', dataMode: input.portfolio.dataMode, asOf: input.asOf,
    partnerCalendars: partnerCalendar(input.portfolio, input.asOf),
    methodologyUnits: input.methodologies.map(unit => methodologyUnit(unit, input.asOf)),
    licenseReviews: input.licenseRequests.map(request => licenseReview(request, input.assets, input.portfolio, input.asOf)),
    signingReviews: input.signingRequests.map(request => signingReview(request, input.portfolio, input.asOf)),
    organizations: organizations.map(org => planOrganization(org, input.portfolio, input.asOf)),
    boundaries: { externalMessagesSent: 0, agreementsSigned: 0, licensesIssued: 0, publicContentPublished: false, scientificFactsInventedOrCertified: false, statutoryLawsChanged: false, autonomousRightsRenewalEnabled: false }
  };
  return { ...pack, packSha256: sha256(JSON.stringify(pack)) };
}

module.exports = { buildOperatingKit };
