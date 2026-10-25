'use strict';

const state = {
  catalog: null,
  domains: new Map(),
  engines: new Set(),
};

const elements = {
  allCount: document.getElementById('allCount'),
  publicCount: document.getElementById('publicCount'),
  canonicalCount: document.getElementById('canonicalCount'),
  domainCount: document.getElementById('domainCount'),
  engineCount: document.getElementById('engineCount'),
  boundCount: document.getElementById('boundCount'),
  unresolvedCount: document.getElementById('unresolvedCount'),
  conflictCount: document.getElementById('conflictCount'),
  masterCoreCount: document.getElementById('masterCoreCount'),
  masterOptionalCount: document.getElementById('masterOptionalCount'),
  mcpToolCount: document.getElementById('mcpToolCount'),
  connectorProfileCount: document.getElementById('connectorProfileCount'),
  connectorAuthCount: document.getElementById('connectorAuthCount'),
  liveExternalCount: document.getElementById('liveExternalCount'),
  capabilityRecordCount: document.getElementById('capabilityRecordCount'),
  authorizedMutationCount: document.getElementById('authorizedMutationCount'),
  identityBindingCount: document.getElementById('identityBindingCount'),
  authorizationEligibleCount: document.getElementById('authorizationEligibleCount'),
  authorizedConnectorCount: document.getElementById('authorizedConnectorCount'),
  liveVerifiedConnectorCount: document.getElementById('liveVerifiedConnectorCount'),
  promotionReviewCount: document.getElementById('promotionReviewCount'),
  promotionEligibleCount: document.getElementById('promotionEligibleCount'),
  evidenceQueueCount: document.getElementById('evidenceQueueCount'),
  verifiedEvidenceCount: document.getElementById('verifiedEvidenceCount'),
  reviewerRoleCount: document.getElementById('reviewerRoleCount'),
  reviewerAssignmentCount: document.getElementById('reviewerAssignmentCount'),
  assignmentProposalCount: document.getElementById('assignmentProposalCount'),
  approvedAssignmentPreviewCount: document.getElementById('approvedAssignmentPreviewCount'),
  manualCommitIntentCount: document.getElementById('manualCommitIntentCount'),
  manualAssignmentWriteCount: document.getElementById('manualAssignmentWriteCount'),
  writePlanCount: document.getElementById('writePlanCount'),
  plannerWriteCount: document.getElementById('plannerWriteCount'),
  assignmentAuditCount: document.getElementById('assignmentAuditCount'),
  assignmentDriftCount: document.getElementById('assignmentDriftCount'),
  recoveryActionCount: document.getElementById('recoveryActionCount'),
  recoveryMutationCount: document.getElementById('recoveryMutationCount'),
  governanceWorkflowState: document.getElementById('governanceWorkflowState'),
  governanceNextAction: document.getElementById('governanceNextAction'),
  governanceStageRows: document.getElementById('governanceStageRows'),
  domainSelect: document.getElementById('domainSelect'),
  engineSelect: document.getElementById('engineSelect'),
  emptyState: document.getElementById('emptyState'),
  registryState: document.getElementById('registryState'),
  registryStateBox: document.querySelector('.registry-state'),
  resultCount: document.getElementById('resultCount'),
  routeRows: document.getElementById('routeRows'),
  searchInput: document.getElementById('searchInput'),
};

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = String(value || '');
  return element.innerHTML;
}

function pageHasEngine(page, engine) {
  if (!engine) return true;
  return page.primaryEngine === engine ||
    page.supportingEngines.includes(engine) ||
    page.policyEngines.includes(engine);
}

function filteredPages() {
  const search = elements.searchInput.value.trim().toLocaleLowerCase('ar');
  const domain = elements.domainSelect.value;
  const engine = elements.engineSelect.value;

  return state.catalog.pages.filter((page) => {
    if (domain && page.logicalDomain !== domain) return false;
    if (!pageHasEngine(page, engine)) return false;
    if (!search) return true;

    return [
      page.title,
      page.h1 || '',
      page.route,
      page.logicalDomainLabelAr,
      page.primaryEngine,
      page.engineProfile,
      page.integrationGateway,
      ...page.supportingEngines,
      ...page.policyEngines,
    ]
      .join(' ')
      .toLocaleLowerCase('ar')
      .includes(search);
  });
}

function renderPages() {
  const pages = filteredPages();
  elements.resultCount.textContent = `${pages.length} نتيجة`;
  elements.emptyState.hidden = pages.length > 0;

  elements.routeRows.innerHTML = pages.map((page) => {
    const ready = page.readiness === 'ROUTE_READY' &&
      page.engineBindingStatus === 'BOUND';
    const supportTitle = page.supportingEngines.join(' · ');

    return `
      <div class="route-row" role="row">
        <span class="route-title" role="cell">${escapeHtml(page.title)}</span>
        <span class="route-domain" role="cell">${escapeHtml(page.logicalDomainLabelAr)}</span>
        <span class="route-engine" role="cell" title="${escapeHtml(supportTitle)}">
          <strong>${escapeHtml(page.primaryEngine)}</strong>
          <small>${escapeHtml(page.engineProfile)}</small>
        </span>
        <span class="route-integration" role="cell">
          ${escapeHtml(page.integrationGateway)}
        </span>
        <span class="route-path" role="cell">${escapeHtml(page.route)}</span>
        <span class="route-status${ready ? '' : ' review'}" role="cell">
          ${ready ? 'مرتبط' : 'مراجعة'}
        </span>
        <a class="open-route" href="${encodeURI(page.route)}"
          aria-label="فتح ${escapeHtml(page.title)}">↗</a>
      </div>
    `;
  }).join('');
}

function populateDomains() {
  elements.domainSelect.insertAdjacentHTML(
    'beforeend',
    state.catalog.domains
      .filter((domain) => domain.pageCount > 0)
      .map((domain) => `
        <option value="${escapeHtml(domain.id)}">
          ${escapeHtml(domain.labelAr)} (${domain.pageCount})
        </option>
      `)
      .join('')
  );
}

function renderGovernanceSummary(summary) {
  elements.governanceWorkflowState.textContent =
    summary.workflowState;
  elements.governanceNextAction.textContent =
    summary.nextAllowedAction;

  elements.governanceStageRows.innerHTML = summary.stages
    .map((stage) => {
      const blockers = stage.blockers.length
        ? stage.blockers.join(' · ')
        : 'لا يوجد';
      const ready = stage.systemStatus === 'CLEAR';

      return `
        <div class="governance-stage-row" role="row">
          <span role="cell">
            <strong>${escapeHtml(stage.labelAr)}</strong>
            <small>${escapeHtml(stage.id)}</small>
          </span>
          <span class="governance-stage-status${ready ? '' : ' review'}" role="cell">
            ${escapeHtml(stage.systemStatus)}
          </span>
          <span role="cell">${escapeHtml(stage.workflowState)}</span>
          <span role="cell">${escapeHtml(blockers)}</span>
          <span role="cell">${escapeHtml(stage.nextAllowedAction)}</span>
        </div>
      `;
    })
    .join('');
}

function populateEngines() {
  for (const page of state.catalog.pages) {
    state.engines.add(page.primaryEngine);
    page.supportingEngines.forEach((engine) => state.engines.add(engine));
    page.policyEngines.forEach((engine) => state.engines.add(engine));
  }

  elements.engineSelect.insertAdjacentHTML(
    'beforeend',
    [...state.engines]
      .sort((a, b) => a.localeCompare(b))
      .map((engine) => `
        <option value="${escapeHtml(engine)}">${escapeHtml(engine)}</option>
      `)
      .join('')
  );
}

async function loadCatalog() {
  const [
    catalogResponse,
    healthResponse,
    masterResponse,
    integrationResponse,
    authorityResponse,
    identityEvidenceResponse,
    promotionGateResponse,
    evidenceQueueResponse,
    reviewerAuthorityResponse,
    assignmentProposalResponse,
    manualCommitResponse,
    writePlanResponse,
    auditDriftResponse,
    recoveryResponse,
    governanceSummaryResponse,
  ] = await Promise.all([
    fetch('/site-map/engine-catalog-v3.json', { cache: 'no-store' }),
    fetch('/site-map/engine-health-v3.json', { cache: 'no-store' }),
    fetch('/site-map/master-engine-registry-v1.json', { cache: 'no-store' }),
    fetch('/site-map/engine-integration-fabric-v1.json', { cache: 'no-store' }),
    fetch('/site-map/connector-authority-capability-matrix-v1.json', { cache: 'no-store' }),
    fetch('/site-map/connector-identity-evidence-binding-v1.json', { cache: 'no-store' }),
    fetch('/site-map/connector-authorization-promotion-gate-v1.json', { cache: 'no-store' }),
    fetch('/site-map/connector-evidence-review-queue-v1.json', { cache: 'no-store' }),
    fetch('/site-map/reviewer-authority-registry-v1.json', { cache: 'no-store' }),
    fetch('/site-map/reviewer-assignment-proposal-gate-v1.json', { cache: 'no-store' }),
    fetch('/site-map/reviewer-assignment-manual-commit-gate-v1.json', { cache: 'no-store' }),
    fetch('/site-map/reviewer-assignment-write-plan-v1.json', { cache: 'no-store' }),
    fetch('/site-map/reviewer-assignment-audit-drift-guard-v1.json', { cache: 'no-store' }),
    fetch('/site-map/reviewer-assignment-recovery-plan-v1.json', { cache: 'no-store' }),
    fetch('/site-map/assignment-governance-summary-v1.json', { cache: 'no-store' }),
  ]);
  if (!catalogResponse.ok) {
    throw new Error(`catalog ${catalogResponse.status}`);
  }
  if (!healthResponse.ok) {
    throw new Error(`health ${healthResponse.status}`);
  }
  if (!masterResponse.ok) {
    throw new Error(`master ${masterResponse.status}`);
  }
  if (!integrationResponse.ok) {
    throw new Error(`integration ${integrationResponse.status}`);
  }
  if (!authorityResponse.ok) {
    throw new Error(`authority ${authorityResponse.status}`);
  }
  if (!identityEvidenceResponse.ok) {
    throw new Error(`identity-evidence ${identityEvidenceResponse.status}`);
  }
  if (!promotionGateResponse.ok) {
    throw new Error(`promotion-gate ${promotionGateResponse.status}`);
  }
  if (!evidenceQueueResponse.ok) {
    throw new Error(`evidence-queue ${evidenceQueueResponse.status}`);
  }
  if (!reviewerAuthorityResponse.ok) {
    throw new Error(`reviewer-authority ${reviewerAuthorityResponse.status}`);
  }
  if (!assignmentProposalResponse.ok) {
    throw new Error(`assignment-proposal ${assignmentProposalResponse.status}`);
  }
  if (!manualCommitResponse.ok) {
    throw new Error(`manual-commit ${manualCommitResponse.status}`);
  }
  if (!writePlanResponse.ok) {
    throw new Error(`write-plan ${writePlanResponse.status}`);
  }
  if (!auditDriftResponse.ok) {
    throw new Error(`audit-drift ${auditDriftResponse.status}`);
  }
  if (!recoveryResponse.ok) {
    throw new Error(`recovery-plan ${recoveryResponse.status}`);
  }
  if (!governanceSummaryResponse.ok) {
    throw new Error(`governance-summary ${governanceSummaryResponse.status}`);
  }

  state.catalog = await catalogResponse.json();
  const health = await healthResponse.json();
  const master = await masterResponse.json();
  const integration = await integrationResponse.json();
  const authority = await authorityResponse.json();
  const identityEvidence = await identityEvidenceResponse.json();
  const promotionGate = await promotionGateResponse.json();
  const evidenceQueue = await evidenceQueueResponse.json();
  const reviewerAuthority = await reviewerAuthorityResponse.json();
  const assignmentProposal = await assignmentProposalResponse.json();
  const manualCommit = await manualCommitResponse.json();
  const writePlan = await writePlanResponse.json();
  const auditDrift = await auditDriftResponse.json();
  const recovery = await recoveryResponse.json();
  const governanceSummary = await governanceSummaryResponse.json();
  state.domains = new Map(
    state.catalog.domains.map((domain) => [domain.id, domain])
  );

  elements.allCount.textContent =
    state.catalog.summary.discoveredHtmlPages;
  elements.publicCount.textContent =
    state.catalog.summary.publicPages;
  elements.canonicalCount.textContent =
    state.catalog.summary.publicCanonicalPages;
  elements.domainCount.textContent =
    state.catalog.summary.logicalDomains;
  elements.engineCount.textContent =
    state.catalog.summary.engineReferences;
  elements.boundCount.textContent =
    state.catalog.summary.boundPages;
  elements.unresolvedCount.textContent =
    health.summary.unresolvedReferencedEngines;
  elements.conflictCount.textContent =
    health.summary.routeIntentConflicts;
  elements.masterCoreCount.textContent =
    master.summary.coreEngines;
  elements.masterOptionalCount.textContent =
    master.summary.optionalEngines;
  elements.mcpToolCount.textContent =
    integration.summary.mcpTools;
  elements.connectorProfileCount.textContent =
    integration.summary.connectorProfiles;
  elements.connectorAuthCount.textContent =
    integration.summary.authRequiredExternal;
  elements.liveExternalCount.textContent =
    integration.summary.liveExternalConnections;
  elements.capabilityRecordCount.textContent =
    authority.summary.connectorCapabilityRecords;
  elements.authorizedMutationCount.textContent =
    authority.summary.externalMutationsAuthorized;
  elements.identityBindingCount.textContent =
    identityEvidence.summary.identitiesBound;
  elements.authorizationEligibleCount.textContent =
    identityEvidence.summary.authorizationEligible;
  elements.authorizedConnectorCount.textContent =
    identityEvidence.summary.authorized;
  elements.liveVerifiedConnectorCount.textContent =
    identityEvidence.summary.liveVerified;
  elements.promotionReviewCount.textContent =
    promotionGate.summary.review;
  elements.promotionEligibleCount.textContent =
    promotionGate.summary.eligible;
  elements.evidenceQueueCount.textContent =
    evidenceQueue.summary.records;
  elements.verifiedEvidenceCount.textContent =
    evidenceQueue.summary.verifiedApproved;
  elements.reviewerRoleCount.textContent =
    reviewerAuthority.summary.authorityRoles;
  elements.reviewerAssignmentCount.textContent =
    reviewerAuthority.summary.assignments;
  elements.assignmentProposalCount.textContent =
    assignmentProposal.summary.proposals;
  elements.approvedAssignmentPreviewCount.textContent =
    assignmentProposal.summary.approvedAssignmentPreviews;
  elements.manualCommitIntentCount.textContent =
    manualCommit.summary.commitIntentsPersisted;
  elements.manualAssignmentWriteCount.textContent =
    manualCommit.summary.assignmentsWrittenByGate;
  elements.writePlanCount.textContent =
    writePlan.summary.persistedPlans;
  elements.plannerWriteCount.textContent =
    writePlan.summary.writesPerformedByPlanner;
  elements.assignmentAuditCount.textContent =
    auditDrift.summary.auditRecords;
  elements.assignmentDriftCount.textContent =
    auditDrift.summary.driftDetected;
  elements.recoveryActionCount.textContent =
    recovery.summary.proposedActions;
  elements.recoveryMutationCount.textContent =
    recovery.summary.automaticRepairsPerformed +
    recovery.summary.automaticRollbacksPerformed +
    recovery.summary.baselineRefreshesPerformed;

  renderGovernanceSummary(governanceSummary);
  populateDomains();
  populateEngines();

  const healthy =
    state.catalog.summary.unboundPages === 0 &&
    health.summary.unresolvedReferencedEngines === 0 &&
    health.summary.routeIntentConflicts === 0 &&
    health.summary.missingFromMasterRegistry === 0 &&
    master.status === 'CLEAR' &&
    integration.status === 'CLEAR' &&
    authority.status === 'CLEAR' &&
    authority.summary.externalMutationsAuthorized === 0 &&
    authority.summary.externalMutationsLive === 0 &&
    identityEvidence.status === 'CLEAR' &&
    identityEvidence.summary.authorized === 0 &&
    identityEvidence.summary.liveVerified === 0 &&
    promotionGate.status === 'CLEAR' &&
    promotionGate.summary.authorizationsGranted === 0 &&
    promotionGate.summary.livePromotionsGranted === 0 &&
    evidenceQueue.status === 'CLEAR' &&
    reviewerAuthority.status === 'CLEAR' &&
    reviewerAuthority.summary.invalidAssignments === 0 &&
    reviewerAuthority.summary.invalidRoleReferences === 0 &&
    assignmentProposal.status === 'CLEAR' &&
    assignmentProposal.summary.assignmentsCreatedByGate === 0 &&
    manualCommit.status === 'CLEAR' &&
    manualCommit.summary.assignmentsWrittenByGate === 0 &&
    writePlan.status === 'CLEAR' &&
    writePlan.summary.writesPerformedByPlanner === 0 &&
    auditDrift.status === 'CLEAR' &&
    auditDrift.summary.driftDetected === 0 &&
    auditDrift.summary.auditChainBreaks === 0 &&
    auditDrift.summary.auditEvidenceGaps === 0 &&
    recovery.status === 'CLEAR' &&
    recovery.summary.automaticRepairsPerformed === 0 &&
    recovery.summary.automaticRollbacksPerformed === 0 &&
    recovery.summary.baselineRefreshesPerformed === 0 &&
    governanceSummary.status === 'CLEAR' &&
    governanceSummary.summary.automaticMutationsPerformed === 0;

  elements.registryState.textContent = healthy
    ? 'السجل V3 متصل'
    : health.summary.routeIntentConflicts > 0
      ? 'السجل متصل · تعارض يحتاج مراجعة'
      : 'السجل يحتاج مراجعة';
  elements.registryStateBox.classList.toggle('ready', healthy);

  renderPages();
}

elements.searchInput.addEventListener('input', renderPages);
elements.domainSelect.addEventListener('change', renderPages);
elements.engineSelect.addEventListener('change', renderPages);

loadCatalog().catch(() => {
  elements.registryState.textContent = 'السجل V3 غير متاح';
  elements.emptyState.hidden = false;
  elements.emptyState.textContent = 'تعذر تحميل سجل النطاقات والمحركات.';
});
