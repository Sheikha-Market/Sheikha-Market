'use strict';

const crypto = require('node:crypto');
const { CATEGORIES, sha, date, sourceUrl, reportMarkdown } = require('./opportunityWatch');
const { evaluate, architecture } = require('./watchGovernance');

const check = (value, code) => { if (!value) throw Error(code); };
const clone = value => JSON.parse(JSON.stringify(value));
const CHANNELS = Object.freeze(['CHAT', 'ADAPTER', 'LOCAL_REPORT', 'EMAIL', 'WEBHOOK', 'REMOTE_DASHBOARD']);
const LOCAL_CHANNELS = Object.freeze(['CHAT', 'ADAPTER', 'LOCAL_REPORT']);
const BENEFICIARY_KINDS = Object.freeze(['INDIVIDUAL', 'CLIENT', 'PARTNER', 'RESEARCHER', 'EDUCATOR', 'CHARITY']);

function bounded(value, limit = 1000) {
  check(typeof value === 'string' && value.trim() && value.length <= limit &&
    !/[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(value), 'REPORT_TEXT_INVALID');
  return value.trim();
}
function recent(value, now, days) {
  return Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.parse(now) &&
    Date.parse(now) - Date.parse(value) < days * 86400000;
}
function defaults() {
  return [
    { id: 'management', name: 'إدارة شيخة', audience: 'MANAGEMENT', kind: 'MANAGEMENT',
      categories: Object.keys(CATEGORIES), channels: ['LOCAL_REPORT'] },
    { id: 'users', name: 'مستخدمو شيخة', audience: 'USERS', kind: 'INDIVIDUAL',
      categories: Object.keys(CATEGORIES), channels: ['CHAT'] }
  ];
}
function proposalDecision(item) {
  const assessment = item.assessment;
  let decision = 'ASSESSMENT_REQUIRED';
  if (assessment) {
    const commercial = ['COMMERCIAL', 'INVESTMENT'].includes(item.category);
    if (assessment.risk >= 4 || assessment.commercialRights === 'RESTRICTED') decision = 'HOLD_RISK_OR_RIGHTS';
    else if (commercial && (assessment.commercialRights !== 'REVIEWED' || !assessment.economics)) decision = 'ECONOMIC_AND_RIGHTS_REVIEW_REQUIRED';
    else if (assessment.economics && assessment.economics.estimatedMonthlyNet <= 0) decision = 'REWORK_ECONOMICS';
    else if (assessment.priorityScore >= 70 && assessment.risk <= 2) decision = 'RECOMMEND_BOUNDED_PILOT';
    else decision = 'FURTHER_VALIDATION_REQUIRED';
  }
  return { decision, basis: 'HUMAN_ESTIMATES_NOT_PROVEN_BENEFIT', executionAuthorized: false,
    next: 'DEFINE_ACCEPTANCE_BUDGET_RIGHTS_AND_SEPARATE_EXECUTION_AUTHORIZATION' };
}

class ReportCenter {
  constructor(store) { this.store = store; }
  profiles(state = this.store.load()) { return [...defaults(), ...(state.reportProfiles || [])]; }
  addProfile(input) {
    check(input && BENEFICIARY_KINDS.includes(input.kind), 'BENEFICIARY_KIND_REQUIRED');
    check(Array.isArray(input.categories) && input.categories.length > 0 && input.categories.length <= Object.keys(CATEGORIES).length &&
      input.categories.every(category => Object.hasOwn(CATEGORIES, category)), 'PROFILE_INTERESTS_REQUIRED');
    check(Array.isArray(input.channels) && input.channels.length > 0 && input.channels.length <= CHANNELS.length &&
      input.channels.every(channel => CHANNELS.includes(channel)), 'CHANNEL_DENIED');
    const profile = { id: crypto.randomUUID(), name: bounded(input.name, 160), kind: input.kind, audience: 'USERS',
      objective: bounded(input.objective), categories: [...new Set(input.categories)], channels: [...new Set(input.channels)] };
    return this.store.transaction(state => {
      state.reportProfiles ||= [];
      check(state.reportProfiles.length < 50, 'PROFILE_CAPACITY_REVIEW');
      state.reportProfiles.push(profile);
      return clone(profile);
    });
  }
  saveInventory(input) {
    check(input?.schema === 'SHEIKHA_ASSET_INVENTORY_V1' && Array.isArray(input.assets) && input.assets.length <= 2000,
      'INVENTORY_SCHEMA_REQUIRED');
    const now = date(this.store.now()), observedAt = date(input.observedAt);
    check(recent(observedAt, now, 7) && typeof input.declaredComplete === 'boolean', 'CURRENT_INVENTORY_REQUIRED');
    const assets = input.assets.map(asset => {
      check(['SOFTWARE', 'HARDWARE', 'FIRMWARE', 'GPU', 'SERVICE'].includes(asset.kind), 'ASSET_KIND_REQUIRED');
      check(['INTERNET', 'INTERNAL', 'OFFLINE', 'UNKNOWN'].includes(asset.exposure), 'ASSET_EXPOSURE_REQUIRED');
      return { id: bounded(asset.id, 100), vendor: bounded(asset.vendor, 160), product: bounded(asset.product, 200),
        version: bounded(asset.version, 120), kind: asset.kind, exposure: asset.exposure };
    });
    check(new Set(assets.map(asset => asset.id)).size === assets.length, 'DUPLICATE_ASSET_ID');
    const inventory = { scope: bounded(input.scope, 300), observedAt, declaredComplete: input.declaredComplete, assets,
      sourceDocumentDigest: sha(JSON.stringify(input)), recordedAt: now,
      evidenceLevel: 'OPERATOR_SUPPLIED_NOT_INDEPENDENTLY_VERIFIED' };
    inventory.digest = sha(JSON.stringify(inventory));
    return this.store.transaction(state => { state.assetInventory = inventory; return { assets: assets.length, digest: inventory.digest }; });
  }
  applicability(item, state = this.store.load()) {
    const inventory = state.assetInventory;
    const pending = { status: 'INVESTIGATE', reason: 'ASSET_INVENTORY_REQUIRED', scope: inventory?.scope || null,
      evidenceLevel: 'NO_AUTOMATIC_APPLICABILITY_PROOF', assetIds: [], systemMutationAuthorized: false };
    if (!inventory) return pending;
    if (!recent(inventory.observedAt, this.store.now(), 7)) return { ...pending, reason: 'INVENTORY_STALE' };
    const key = value => String(value).trim().toLowerCase();
    const matches = inventory.assets.filter(asset => key(asset.vendor) === key(item.advisory?.vendor));
    const review = item.applicabilityReview;
    if (review && review.inventoryDigest === inventory.digest && review.contentDigest === item.contentDigest &&
        recent(review.reviewedAt, this.store.now(), 7) && recent(item.observedAt, this.store.now(), 2)) {
      return { ...pending, status: review.decision, reason: 'EXPLICIT_OPERATOR_REVIEW',
        evidenceLevel: 'HUMAN_REVIEW_NOT_INDEPENDENT_CERTIFICATION', assetIds: review.assetIds,
        rationale: review.rationale, referenceUrl: review.referenceUrl, reviewer: review.reviewer };
    }
    return { ...pending, assetIds: matches.map(asset => asset.id),
      reason: review ? 'REVIEW_BINDING_OR_FRESHNESS_CHANGED' : matches.length ? 'PRODUCT_VERSION_REVIEW_REQUIRED' : 'NO_VENDOR_MATCH_NOT_ABSENCE_PROOF' };
  }
  reviewApplicability(id, digest, input, confirmed) {
    check(confirmed === true, 'EXPLICIT_NATIVE_APPROVAL_REQUIRED');
    check(input && ['AFFECTED', 'NOT_APPLICABLE', 'INVESTIGATE'].includes(input.decision) && Array.isArray(input.findings),
      'APPLICABILITY_REVIEW_REQUIRED');
    return this.store.transaction(state => {
      const item = state.items.find(candidate => candidate.id === id), inventory = state.assetInventory;
      check(item?.kind === 'SECURITY_ADVISORY' && item.contentDigest === digest &&
        recent(item.observedAt, this.store.now(), 2) && Date.parse(item.expiresAt) > Date.parse(this.store.now()), 'CURRENT_ADVISORY_REQUIRED');
      check(inventory && recent(inventory.observedAt, this.store.now(), 7), 'CURRENT_INVENTORY_REQUIRED');
      const key = value => String(value).trim().toLowerCase();
      const candidates = inventory.assets.filter(asset => key(asset.vendor) === key(item.advisory.vendor));
      const findings = input.findings.map(finding => {
        check(finding && ['AFFECTED', 'NOT_AFFECTED', 'UNKNOWN'].includes(finding.decision), 'ASSET_FINDING_REQUIRED');
        const asset = candidates.find(candidate => candidate.id === finding.assetId);
        check(asset && finding.product === asset.product && finding.installedVersion === asset.version, 'ASSET_PRODUCT_VERSION_BINDING_REQUIRED');
        return { assetId: asset.id, product: asset.product, installedVersion: asset.version, decision: finding.decision,
          evidenceUrl: sourceUrl(finding.evidenceUrl) };
      });
      check(new Set(findings.map(finding => finding.assetId)).size === findings.length, 'DUPLICATE_ASSET_FINDING');
      const assetIds = findings.map(finding => finding.assetId);
      if (input.decision === 'AFFECTED') check(findings.some(finding => finding.decision === 'AFFECTED'), 'AFFECTED_ASSET_REQUIRED');
      if (input.decision === 'NOT_APPLICABLE') check(inventory.declaredComplete && candidates.every(asset =>
        findings.some(finding => finding.assetId === asset.id && finding.decision === 'NOT_AFFECTED')),
        'COMPLETE_SCOPED_REVIEW_REQUIRED');
      item.applicabilityReview = { decision: input.decision, assetIds, findings, rationale: bounded(input.rationale, 2000),
        referenceUrl: sourceUrl(input.referenceUrl), reviewer: bounded(input.reviewer, 160), contentDigest: digest,
        inventoryDigest: inventory.digest, reviewedAt: date(this.store.now()) };
      item.userRelease = null;
      return clone(item.applicabilityReview);
    });
  }
  build(profileId, state = this.store.load()) {
    const profile = this.profiles(state).find(candidate => candidate.id === profileId);
    check(profile, 'BENEFICIARY_NOT_FOUND');
    const visible = state.items.filter(item => Date.parse(item.expiresAt) > Date.parse(this.store.now()) && profile.categories.includes(item.category));
    const selected = profile.audience === 'MANAGEMENT' ? visible : visible.filter(item => item.userRelease?.contentDigest === item.contentDigest);
    const items = profile.audience === 'MANAGEMENT' ? selected.map(item => ({ ...clone(item), proposal: proposalDecision(item), governance: evaluate(item),
      ...(item.kind === 'SECURITY_ADVISORY' ? { applicability: this.applicability(item, state) } : {}) })) :
      selected.map(item => ({ title: item.userRelease.title, summary: item.userRelease.summary, approvedAt: item.userRelease.approvedAt }));
    const report = { schema: 'SHEIKHA_REPORT_CENTER_V1', brand: 'Sheikha', audience: profile.audience,
      beneficiary: profile.name, generatedAt: date(this.store.now()), delivery: 'LOCAL_DRAFT_NOT_SENT',
      coverage: 'REGISTERED_SOURCES_AND_OPERATOR_IMPORTS_NOT_ALL_OPPORTUNITIES', items };
    const bindings = selected.map(item => ({ id: item.id, digest: item.contentDigest }));
    const { generatedAt, ...stable } = report;
    return { report, bindings, profile, fingerprint: sha(JSON.stringify({ stable, bindings, profile })) };
  }
  draft(profileId, channel = 'LOCAL_REPORT') {
    check(CHANNELS.includes(channel), 'CHANNEL_DENIED');
    return this.store.transaction(state => {
      const built = this.build(profileId, state);
      check(built.profile.channels.includes(channel), 'BENEFICIARY_CHANNEL_DENIED');
      check(built.report.items.length > 0, 'NO_APPROVED_REPORT_CONTENT');
      state.reportOutbox ||= [];
      const prior = state.reportOutbox.find(item => item.fingerprint === built.fingerprint && item.channel === channel && item.profileId === profileId);
      if (prior) return { id: prior.id, status: prior.status, deduplicated: true };
      check(state.reportOutbox.length < 100, 'OUTBOX_CAPACITY_REVIEW');
      const draft = { id: crypto.randomUUID(), profileId, channel, fingerprint: built.fingerprint, bindings: built.bindings,
        createdAt: built.report.generatedAt, status: LOCAL_CHANNELS.includes(channel) ? 'LOCAL_READY' : 'PROVIDER_RECIPIENT_AND_OPT_IN_REQUIRED',
        externalSent: false };
      state.reportOutbox.push(draft);
      return clone(draft);
    });
  }
  preview(id) {
    const state = this.store.load(), draft = state.reportOutbox?.find(item => item.id === id);
    check(draft, 'DRAFT_NOT_FOUND');
    const built = this.build(draft.profileId, state);
    check(built.fingerprint === draft.fingerprint, 'REPORT_CHANGED_REGENERATE');
    return { draft: clone(draft), report: built.report, markdown: centerMarkdown(built.report) };
  }
  markDisplayed(id) {
    return this.store.transaction(state => {
      const draft = state.reportOutbox?.find(item => item.id === id);
      check(draft && LOCAL_CHANNELS.includes(draft.channel), 'EXTERNAL_DELIVERY_NOT_CONFIGURED');
      check(this.build(draft.profileId, state).fingerprint === draft.fingerprint, 'REPORT_CHANGED_REGENERATE');
      draft.status = 'LOCAL_DISPLAYED'; draft.displayedAt = date(this.store.now());
      return { id, status: draft.status, externalSent: false };
    });
  }
  summary() {
    const state = this.store.load();
    return { profiles: this.profiles(state).map(profile => ({ id: profile.id, name: profile.name,
      audience: profile.audience, channels: profile.channels })),
    outbox: (state.reportOutbox || []).slice(-20).map(item => ({ id: item.id, channel: item.channel, status: item.status, createdAt: item.createdAt })),
    security: state.items.filter(item => item.kind === 'SECURITY_ADVISORY' && Date.parse(item.expiresAt) > Date.parse(this.store.now()))
      .map(item => ({ number: item.advisory.number, ...this.applicability(item, state) })),
    externalDeliveryExecuted: false, inventoryAssets: state.assetInventory?.assets.length ?? null,
    scope: 'SINGLE_LOCAL_OWNER_NOT_MULTI_TENANT_AUTH', governance: architecture() };
  }
}

function centerMarkdown(report) {
  const safe = value => String(value).replace(/[<>`\[\]!*_#|\\\r\n]/g, ' ');
  let output = '# مركز شيخة للتقارير\n\nالمستفيد: ' + safe(report.beneficiary) + '\n\n' + reportMarkdown(report);
  if (report.audience === 'MANAGEMENT') output += '\n\n## فرز الانطباق والمقترحات\n' + report.items.map(item =>
    '\n### ' + safe(item.title) + '\n- قرار الجدوى: ' + item.proposal.decision + '؛ ليس تفويض تنفيذ.\n' +
    (item.applicability ? '- الانطباق: ' + item.applicability.status + '؛ السبب: ' + item.applicability.reason +
      '\n- النطاق: ' + safe(item.applicability.scope || 'غير محدد') + '\n- مستوى الدليل: ' + item.applicability.evidenceLevel + '\n' : '')).join('');
  return output + '\n\nالتغطية محصورة بالمصادر المسجلة والمدخلات المراجعة؛ لا ضمان لحصر جميع الفرص. لم يحدث إرسال خارجي أو تحديث للأنظمة.\n';
}

module.exports = { ReportCenter, CHANNELS, LOCAL_CHANNELS, proposalDecision, centerMarkdown };
