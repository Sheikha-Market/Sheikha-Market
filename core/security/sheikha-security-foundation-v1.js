'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const CONFIG_PATH = path.join(ROOT, 'config/security/sheikha-security-foundation-v1.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

const INCIDENT_TYPES = Object.freeze([
  'AVAILABILITY_INCIDENT',
  'SECURITY_ADVISORY',
  'VULNERABILITY',
  'ACTIVELY_EXPLOITED',
  'MISCONFIGURATION',
  'SUPPLY_CHAIN',
  'AUTH_IDENTITY',
  'DATA_EXPOSURE',
  'MCP_CONNECTOR',
  'UNKNOWN_REVIEW_REQUIRED'
]);

function normalizeText(input) {
  return String(input || '').toLowerCase();
}

function classifyIncident(input = {}) {
  const text = normalizeText([
    input.title, input.summary, input.status, input.sourceClass, input.component
  ].filter(Boolean).join(' '));

  const securityEvidence = Boolean(input.securityEvidence) ||
    /cve-|vulnerab|exploit|unauthori[sz]ed|credential|token leak|data expos|security advisory|compromis|rce|xss|csrf|injection/.test(text);
  const exploited = Boolean(input.activelyExploited) || /actively exploited|known exploited/.test(text);
  const availability = /degraded|outage|unavailable|elevated .*errors|latency|service disruption|incident monitoring|recovery/.test(text);
  const mcp = /\bmcp\b|plugin|connector|tool permission/.test(text);
  const supply = /dependency|package|supply chain|sbom|provenance|lockfile/.test(text);
  const auth = /authentication|authorization|session|oauth|jwt|identity|permission/.test(text);
  const exposure = /data expos|leak|secret expos|credential leak/.test(text);
  const misconfiguration = /misconfig|configuration error|unsafe default/.test(text);

  let type = 'UNKNOWN_REVIEW_REQUIRED';
  if (exploited) type = 'ACTIVELY_EXPLOITED';
  else if (securityEvidence && exposure) type = 'DATA_EXPOSURE';
  else if (securityEvidence && mcp) type = 'MCP_CONNECTOR';
  else if (securityEvidence && auth) type = 'AUTH_IDENTITY';
  else if (securityEvidence && supply) type = 'SUPPLY_CHAIN';
  else if (securityEvidence) type = 'VULNERABILITY';
  else if (misconfiguration) type = 'MISCONFIGURATION';
  else if (availability) type = 'AVAILABILITY_INCIDENT';

  return Object.freeze({
    type,
    securityEvidence,
    availabilityOnly: type === 'AVAILABILITY_INCIDENT',
    requiresHumanReview: type === 'UNKNOWN_REVIEW_REQUIRED',
    incidentTypes: INCIDENT_TYPES
  });
}

function buildRepairCandidate(finding = {}) {
  const config = loadConfig();
  const classification = classifyIncident(finding);
  const external = finding.ownership !== 'SHEIKHA_OWNED';

  return Object.freeze({
    mode: 'CANDIDATE_ONLY',
    classification,
    authority: external ? 'EXTERNAL_FORMAL_AUTHORIZATION_REQUIRED' : 'SHEIKHA_OWNED_GOVERNED_REVIEW',
    allowedNow: Object.freeze([
      'collect_public_or_authorized_evidence',
      'cross_check',
      'classify',
      'prepare_containment',
      'prepare_candidate_fix',
      'static_verify_candidate'
    ]),
    blockedWithoutSeparateAuthorization: Object.freeze([
      'active_external_probe',
      'exploit',
      'credential_use',
      'production_mutation',
      'merge',
      'deploy',
      'payment',
      'contract'
    ]),
    lifecycle: Object.freeze([...config.repairEngine.stages]),
    autoApply: false
  });
}

module.exports = Object.freeze({
  loadConfig,
  classifyIncident,
  buildRepairCandidate,
  INCIDENT_TYPES
});
