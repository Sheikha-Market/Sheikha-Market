'use strict';

const { classifyIncident, buildRepairCandidate } = require('./sheikha-security-foundation-v1.js');

const TRUSTED_SOURCE_CLASSES = Object.freeze([
  'VENDOR_STATUS',
  'VENDOR_SECURITY_ADVISORY',
  'CISA_KEV',
  'NVD',
  'GITHUB_SECURITY_ADVISORY',
  'PACKAGE_REGISTRY_ADVISORY',
  'MCP_VENDOR_OR_SPEC_ADVISORY'
]);

function normalizeEvent(event = {}) {
  const sourceClass = String(event.sourceClass || '').toUpperCase();
  return Object.freeze({
    id: String(event.id || ''),
    source: String(event.source || ''),
    sourceClass,
    publishedAt: event.publishedAt || null,
    component: event.component || null,
    title: event.title || '',
    summary: event.summary || '',
    status: event.status || '',
    ownership: event.ownership || 'EXTERNAL',
    securityEvidence: event.securityEvidence === true,
    activelyExploited: event.activelyExploited === true
  });
}

function evaluateEvent(event = {}) {
  const normalized = normalizeEvent(event);
  const trusted = TRUSTED_SOURCE_CLASSES.includes(normalized.sourceClass);
  const classification = classifyIncident(normalized);
  const repair = buildRepairCandidate(normalized);

  let disposition = 'REVIEW';
  if (!trusted) disposition = 'UNTRUSTED_SOURCE_HOLD';
  else if (classification.type === 'AVAILABILITY_INCIDENT') disposition = 'AVAILABILITY_WATCH';
  else if (classification.type === 'ACTIVELY_EXPLOITED') disposition = 'URGENT_DEFENSIVE_REVIEW';
  else if (classification.securityEvidence) disposition = 'DEFENSIVE_SECURITY_REVIEW';

  return Object.freeze({
    normalized,
    trusted,
    classification,
    disposition,
    repair,
    externalActions: Object.freeze({
      activeProbeAllowed: false,
      exploitAllowed: false,
      contactAllowedWithoutAuthorization: false,
      productionFixAllowedWithoutAuthorization: false,
      officialVendorOrDisclosureChannelRequired: normalized.ownership !== 'SHEIKHA_OWNED'
    })
  });
}

function dedupeEvents(events = []) {
  const seen = new Set();
  const out = [];
  for (const e of events) {
    const n = normalizeEvent(e);
    const key = n.id || [n.source,n.component,n.title,n.publishedAt].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(evaluateEvent(n));
  }
  return Object.freeze(out);
}

module.exports = Object.freeze({
  TRUSTED_SOURCE_CLASSES,
  normalizeEvent,
  evaluateEvent,
  dedupeEvents
});
